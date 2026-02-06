/**
 * Rewash System Database Operations
 *
 * Handles rewash order creation, eligibility checking, and statistics tracking.
 * V2.0: 24-hour eligibility window for rewash requests.
 *
 * @module lib/db/rewash
 */

import { Timestamp, where, orderBy } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import { createOrder, generateOrderId, generateGarmentId } from './orders';
import type { Order, Garment, OrderExtended } from './schema';

/**
 * Rewash eligibility window in hours
 */
export const REWASH_ELIGIBILITY_HOURS = 24;

/**
 * Rewash request data
 */
export interface RewashRequest {
  /** ID of the original order */
  originalOrderId: string;
  /** IDs of garments to rewash */
  garmentIds: string[];
  /** Reason for rewash */
  reason: string;
  /** Customer ID */
  customerId: string;
  /** User ID creating the request */
  requestedBy: string;
  /** Optional notes */
  notes?: string;
}

/**
 * Rewash eligibility result
 */
export interface RewashEligibility {
  /** Whether the order is eligible for rewash */
  eligible: boolean;
  /** If not eligible, the reason why */
  reason?: string;
  /** Time remaining in eligibility window (in hours) */
  hoursRemaining?: number;
  /** List of garments eligible for rewash */
  eligibleGarments: Garment[];
  /** List of garments already rewashed */
  alreadyRewashedGarments: Garment[];
}

/**
 * Rewash statistics for a staff member
 */
export interface RewashStats {
  /** User ID */
  userId: string;
  /** Period start date */
  periodStart: Timestamp;
  /** Period end date */
  periodEnd: Timestamp;
  /** Total orders handled */
  totalOrders: number;
  /** Total rewash requests */
  rewashCount: number;
  /** Rewash rate as percentage */
  rewashRate: number;
  /** Common reasons for rewash */
  commonReasons: { reason: string; count: number }[];
}

/**
 * Check if an order is eligible for rewash
 *
 * @param orderId - The order ID to check
 * @returns Eligibility result with details
 */
export async function checkRewashEligibility(orderId: string): Promise<RewashEligibility> {
  try {
    const order = await getDocument<Order>('orders', orderId);

    if (!order) {
      return {
        eligible: false,
        reason: 'Order not found',
        eligibleGarments: [],
        alreadyRewashedGarments: [],
      };
    }

    // Check if order is completed (delivered or collected)
    const completedStatuses = ['delivered', 'collected'];
    if (!completedStatuses.includes(order.status)) {
      return {
        eligible: false,
        reason: `Order must be delivered or collected to request a rewash. Current status: ${order.status}`,
        eligibleGarments: [],
        alreadyRewashedGarments: [],
      };
    }

    // Check the 24-hour eligibility window
    const completionTime = order.actualCompletion || order.deliveryCompletedTime;
    if (!completionTime) {
      return {
        eligible: false,
        reason: 'Order completion time not recorded',
        eligibleGarments: [],
        alreadyRewashedGarments: [],
      };
    }

    // Handle Firestore Timestamp objects (which have toDate method)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completionTimeAny = completionTime as any;
    const completionDate = completionTimeAny.toDate
      ? completionTimeAny.toDate()
      : new Date(completionTimeAny);
    const now = new Date();
    const hoursSinceCompletion = (now.getTime() - completionDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCompletion > REWASH_ELIGIBILITY_HOURS) {
      return {
        eligible: false,
        reason: `Rewash window has expired. Orders must be reported within ${REWASH_ELIGIBILITY_HOURS} hours of completion.`,
        hoursRemaining: 0,
        eligibleGarments: [],
        alreadyRewashedGarments: [],
      };
    }

    // Check if this order already has rewash orders
    const existingRewashOrders = await getDocuments<Order>(
      'orders',
      where('originalOrderId', '==', orderId),
      where('isRewash', '==', true)
    );

    // Find garments that have already been rewashed
    const rewashedGarmentIds = new Set<string>();
    for (const rewashOrder of existingRewashOrders) {
      for (const garment of rewashOrder.garments || []) {
        // Track the original garment ID if available
        if (garment.originalGarmentId) {
          rewashedGarmentIds.add(garment.originalGarmentId);
        }
      }
    }

    // Split garments into eligible and already rewashed
    const eligibleGarments: Garment[] = [];
    const alreadyRewashedGarments: Garment[] = [];

    for (const garment of order.garments || []) {
      if (rewashedGarmentIds.has(garment.garmentId)) {
        alreadyRewashedGarments.push(garment);
      } else {
        eligibleGarments.push(garment);
      }
    }

    if (eligibleGarments.length === 0) {
      return {
        eligible: false,
        reason: 'All garments in this order have already been rewashed',
        hoursRemaining: Math.max(0, REWASH_ELIGIBILITY_HOURS - hoursSinceCompletion),
        eligibleGarments: [],
        alreadyRewashedGarments,
      };
    }

    return {
      eligible: true,
      hoursRemaining: Math.max(0, REWASH_ELIGIBILITY_HOURS - hoursSinceCompletion),
      eligibleGarments,
      alreadyRewashedGarments,
    };
  } catch (error) {
    throw new DatabaseError('Failed to check rewash eligibility', error);
  }
}

/**
 * Create a rewash order for specific garments
 *
 * @param request - The rewash request data
 * @returns The created rewash order ID
 */
export async function createRewashOrder(request: RewashRequest): Promise<string> {
  try {
    // First check eligibility
    const eligibility = await checkRewashEligibility(request.originalOrderId);

    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || 'Order is not eligible for rewash');
    }

    // Get the original order
    const originalOrder = await getDocument<Order>('orders', request.originalOrderId);
    if (!originalOrder) {
      throw new Error('Original order not found');
    }

    // Filter to only the requested garments that are eligible
    const eligibleGarmentIds = new Set(eligibility.eligibleGarments.map(g => g.garmentId));
    const garmentsToRewash = originalOrder.garments?.filter(
      g => request.garmentIds.includes(g.garmentId) && eligibleGarmentIds.has(g.garmentId)
    ) || [];

    if (garmentsToRewash.length === 0) {
      throw new Error('No eligible garments found for rewash');
    }

    // Create rewash garments with zero price and link to original
    const rewashGarments: Garment[] = garmentsToRewash.map((garment, index) => ({
      ...garment,
      garmentId: '', // Will be regenerated
      price: 0, // Rewash is free
      status: 'received',
      specialInstructions: `REWASH: ${request.reason}${garment.specialInstructions ? ` | Original: ${garment.specialInstructions}` : ''}`,
      // Link to original garment
      originalGarmentId: garment.garmentId,
      isRewash: true,
    }));

    // Create the rewash order
    const rewashOrderId = await createOrder({
      customerId: request.customerId,
      customerName: originalOrder.customerName || 'Customer',
      customerPhone: originalOrder.customerPhone || '',
      branchId: originalOrder.branchId,
      status: 'received',
      garments: rewashGarments,
      totalAmount: 0, // Rewash is free
      paidAmount: 0,
      paymentStatus: 'paid', // Already paid through original order
      collectionMethod: 'dropped_off',
      returnMethod: originalOrder.returnMethod || 'customer_collects',
      deliveryAddress: originalOrder.deliveryAddress,
      createdBy: request.requestedBy,
      // V2.0: Mandatory fields
      checkedBy: request.requestedBy,
      serviceType: 'Normal',
      // Rewash specific fields
      isRewash: true,
      originalOrderId: request.originalOrderId,
      rewashRequestedAt: Timestamp.now(),
      rewashReason: request.reason,
    });

    // Update the original order to track the rewash
    await updateDocument('orders', request.originalOrderId, {
      hasRewashRequest: true,
      rewashOrderIds: [...(originalOrder.rewashOrderIds || []), rewashOrderId],
      updatedAt: Timestamp.now(),
    });

    return rewashOrderId;
  } catch (error) {
    throw new DatabaseError('Failed to create rewash order', error);
  }
}

/**
 * Get rewash orders for an original order
 *
 * @param originalOrderId - The original order ID
 * @returns List of rewash orders
 */
export async function getRewashOrders(originalOrderId: string): Promise<Order[]> {
  try {
    return getDocuments<Order>(
      'orders',
      where('originalOrderId', '==', originalOrderId),
      where('isRewash', '==', true),
      orderBy('createdAt', 'desc')
    );
  } catch (error) {
    throw new DatabaseError('Failed to get rewash orders', error);
  }
}

/**
 * Get rewash statistics for a staff member
 *
 * @param userId - The user ID
 * @param periodStart - Start of the period
 * @param periodEnd - End of the period
 * @returns Rewash statistics
 */
export async function getRewashStats(
  userId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<RewashStats> {
  try {
    // Get all orders created by the user in the period
    const allOrders = await getDocuments<Order>(
      'orders',
      where('createdBy', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(periodStart)),
      where('createdAt', '<=', Timestamp.fromDate(periodEnd))
    );

    // Filter to non-rewash orders (original orders handled by user)
    const originalOrders = allOrders.filter(o => !o.isRewash);
    const totalOrders = originalOrders.length;

    // Get rewash orders for orders created by this user
    const orderIds = originalOrders.map(o => o.orderId);
    let rewashCount = 0;
    const reasonCounts: Record<string, number> = {};

    // Note: This could be optimized with a compound query
    for (const orderId of orderIds) {
      const rewashOrders = await getRewashOrders(orderId);
      rewashCount += rewashOrders.length;

      for (const rewashOrder of rewashOrders) {
        if (rewashOrder.rewashReason) {
          reasonCounts[rewashOrder.rewashReason] = (reasonCounts[rewashOrder.rewashReason] || 0) + 1;
        }
      }
    }

    // Calculate rewash rate
    const rewashRate = totalOrders > 0 ? (rewashCount / totalOrders) * 100 : 0;

    // Get common reasons sorted by count
    const commonReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      userId,
      periodStart: Timestamp.fromDate(periodStart),
      periodEnd: Timestamp.fromDate(periodEnd),
      totalOrders,
      rewashCount,
      rewashRate: Math.round(rewashRate * 100) / 100,
      commonReasons,
    };
  } catch (error) {
    throw new DatabaseError('Failed to get rewash stats', error);
  }
}

/**
 * Get all pending rewash orders for a branch
 *
 * @param branchId - The branch ID
 * @returns List of pending rewash orders
 */
export async function getPendingRewashOrders(branchId: string): Promise<Order[]> {
  try {
    return getDocuments<Order>(
      'orders',
      where('branchId', '==', branchId),
      where('isRewash', '==', true),
      where('status', '==', 'received'),
      orderBy('createdAt', 'asc')
    );
  } catch (error) {
    throw new DatabaseError('Failed to get pending rewash orders', error);
  }
}

/**
 * Common rewash reasons for quick selection
 */
export const COMMON_REWASH_REASONS = [
  'Stain not fully removed',
  'Item not properly pressed',
  'Odor still present',
  'Color bleeding occurred',
  'Item shrunk',
  'Wrong item returned',
  'Damage during cleaning',
  'Customer not satisfied with result',
  'Other',
];
