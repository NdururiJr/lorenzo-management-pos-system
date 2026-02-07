/**
 * Redo Items Database Operations (FR-002)
 *
 * This file provides type-safe CRUD operations for the redoItems collection.
 * Manages redo items that need to be re-processed due to quality issues.
 * Redo orders are created at zero cost to the customer.
 *
 * @module lib/db/redo-items
 */

import { Timestamp, where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type {
  RedoItem,
  RedoItemStatus,
  RedoReasonCode,
  RedoMetrics,
  Order,
} from './schema';
import { getOrder, createOrder } from './orders';
import { getCustomer } from './customers';

const COLLECTION_NAME = 'redoItems';

/**
 * Generate a unique redo item ID
 * Format: REDO-[BRANCH]-[YYYYMMDD]-[####]
 *
 * @param branchId - Branch identifier
 * @returns Formatted redo item ID
 */
export async function generateRedoItemId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Get today's redo items for this branch to determine sequence number
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayRedoItems = await getDocuments<RedoItem>(
    COLLECTION_NAME,
    where('branchId', '==', branchId),
    where('createdAt', '>=', Timestamp.fromDate(todayStart)),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayRedoItems.length > 0) {
    const lastItem = todayRedoItems[0];
    // Extract sequence from last ID (REDO-BRANCH-20260119-0001)
    const lastSequence = parseInt(
      lastItem.redoItemId.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `REDO-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Create a new redo item
 *
 * @param data - Redo item creation data
 * @returns The created redo item
 */
export async function createRedoItem(
  data: Omit<
    RedoItem,
    'redoItemId' | 'createdAt' | 'updatedAt' | 'status' | 'priority'
  > & {
    priority?: 'high' | 'urgent';
  }
): Promise<RedoItem> {
  // Verify original order exists
  const originalOrder = await getOrder(data.originalOrderId);
  if (!originalOrder) {
    throw new DatabaseError(`Original order ${data.originalOrderId} not found`);
  }

  // Verify garment exists in the order
  const garment = originalOrder.garments.find(
    (g) => g.garmentId === data.originalGarmentId
  );
  if (!garment) {
    throw new DatabaseError(
      `Garment ${data.originalGarmentId} not found in order ${data.originalOrderId}`
    );
  }

  // Get customer info for denormalization
  let customerName: string | undefined;
  let customerPhone: string | undefined;
  try {
    const customer = await getCustomer(originalOrder.customerId);
    customerName = customer.name;
    customerPhone = customer.phone;
  } catch {
    // Use denormalized fields from order if customer fetch fails
    customerName = originalOrder.customerName;
    customerPhone = originalOrder.customerPhone;
  }

  // Generate redo item ID
  const redoItemId = await generateRedoItemId(data.branchId);
  const now = Timestamp.now();

  const redoItem: RedoItem = {
    ...data,
    redoItemId,
    status: 'pending',
    priority: data.priority || 'high',
    customerName,
    customerPhone,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument(COLLECTION_NAME, redoItemId, redoItem);
  return redoItem;
}

/**
 * Get a redo item by ID
 *
 * @param redoItemId - The redo item ID
 * @returns The redo item or null if not found
 */
export async function getRedoItem(
  redoItemId: string
): Promise<RedoItem | null> {
  try {
    return await getDocument<RedoItem>(COLLECTION_NAME, redoItemId);
  } catch {
    return null;
  }
}

/**
 * Get redo items by status
 *
 * @param status - The status to filter by
 * @param branchId - Optional branch filter
 * @returns Array of redo items
 */
export async function getRedoItemsByStatus(
  status: RedoItemStatus,
  branchId?: string
): Promise<RedoItem[]> {
  const constraints: QueryConstraint[] = [
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<RedoItem>(COLLECTION_NAME, ...constraints);
}

/**
 * Get redo items for an order
 *
 * @param orderId - The original order ID
 * @returns Array of redo items for the order
 */
export async function getRedoItemsForOrder(orderId: string): Promise<RedoItem[]> {
  return getDocuments<RedoItem>(
    COLLECTION_NAME,
    where('originalOrderId', '==', orderId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Approve a redo item and create the redo order
 *
 * @param redoItemId - The redo item ID
 * @param reviewedBy - UID of the staff approving
 * @param reviewNotes - Optional notes
 * @returns The created redo order ID
 */
export async function approveRedoItem(
  redoItemId: string,
  reviewedBy: string,
  reviewNotes?: string
): Promise<string> {
  const redoItem = await getRedoItem(redoItemId);
  if (!redoItem) {
    throw new DatabaseError(`Redo item ${redoItemId} not found`);
  }

  if (redoItem.status !== 'pending') {
    throw new DatabaseError(
      `Redo item ${redoItemId} is not pending (status: ${redoItem.status})`
    );
  }

  // Get original order for reference
  const originalOrder = await getOrder(redoItem.originalOrderId);
  if (!originalOrder) {
    throw new DatabaseError(
      `Original order ${redoItem.originalOrderId} not found`
    );
  }

  // Get the specific garment to redo
  const originalGarment = originalOrder.garments.find(
    (g) => g.garmentId === redoItem.originalGarmentId
  );
  if (!originalGarment) {
    throw new DatabaseError(
      `Original garment ${redoItem.originalGarmentId} not found`
    );
  }

  // Create the redo order (zero cost)
  const redoOrderId = await createOrder({
    customerId: originalOrder.customerId,
    customerName: redoItem.customerName || originalOrder.customerName || 'Unknown',
    customerPhone: redoItem.customerPhone || originalOrder.customerPhone || '',
    branchId: redoItem.branchId,
    status: 'received',
    garments: [
      {
        ...originalGarment,
        garmentId: '', // Will be regenerated
        price: 0, // Zero cost for redo
        status: 'received',
        specialInstructions: `REDO: ${redoItem.reasonDescription || redoItem.reasonCode}`,
      },
    ],
    totalAmount: 0, // Zero cost
    paidAmount: 0,
    paymentStatus: 'paid', // Already paid (original order)
    collectionMethod: 'dropped_off',
    returnMethod: originalOrder.returnMethod,
    deliveryAddress: originalOrder.deliveryAddress,
    createdBy: reviewedBy,
    // V2.0: Mandatory fields
    checkedBy: reviewedBy, // Reviewer is the inspector for redo orders
    serviceType: 'Normal' as const, // Redo orders default to normal service
    // Mark as redo order
    isRedo: true,
    parentRedoItemId: redoItemId,
    parentOrderId: redoItem.originalOrderId,
  });

  // Update the redo item with approval info
  await updateDocument<RedoItem>(COLLECTION_NAME, redoItemId, {
    status: 'approved',
    redoOrderId,
    reviewedBy,
    reviewedAt: Timestamp.now(),
    reviewNotes,
    updatedAt: Timestamp.now(),
  });

  return redoOrderId;
}

/**
 * Reject a redo item
 *
 * @param redoItemId - The redo item ID
 * @param reviewedBy - UID of the staff rejecting
 * @param reviewNotes - Reason for rejection (required)
 */
export async function rejectRedoItem(
  redoItemId: string,
  reviewedBy: string,
  reviewNotes: string
): Promise<void> {
  const redoItem = await getRedoItem(redoItemId);
  if (!redoItem) {
    throw new DatabaseError(`Redo item ${redoItemId} not found`);
  }

  if (redoItem.status !== 'pending') {
    throw new DatabaseError(
      `Redo item ${redoItemId} is not pending (status: ${redoItem.status})`
    );
  }

  if (!reviewNotes || reviewNotes.trim().length === 0) {
    throw new DatabaseError('Rejection reason is required');
  }

  await updateDocument<RedoItem>(COLLECTION_NAME, redoItemId, {
    status: 'rejected',
    reviewedBy,
    reviewedAt: Timestamp.now(),
    reviewNotes,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update redo item status
 *
 * @param redoItemId - The redo item ID
 * @param status - New status
 */
export async function updateRedoItemStatus(
  redoItemId: string,
  status: RedoItemStatus
): Promise<void> {
  await updateDocument<RedoItem>(COLLECTION_NAME, redoItemId, {
    status,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get redo metrics for a time period
 *
 * @param startDate - Start of period
 * @param endDate - End of period
 * @param branchId - Optional branch filter
 * @returns Redo metrics
 */
export async function getRedoMetrics(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<RedoMetrics> {
  // Get redo items in the period
  const constraints: QueryConstraint[] = [
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
  ];

  if (branchId) {
    constraints.push(where('branchId', '==', branchId));
  }

  const redoItems = await getDocuments<RedoItem>(COLLECTION_NAME, ...constraints);

  // Calculate metrics
  const byReasonCode: Record<RedoReasonCode, number> = {
    quality_issue: 0,
    damage: 0,
    incomplete_service: 0,
    wrong_service: 0,
    customer_complaint: 0,
    stain_not_removed: 0,
    shrinkage: 0,
    color_damage: 0,
    other: 0,
  };

  const byBranch: Record<string, number> = {};
  let totalResolutionTime = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;

  for (const item of redoItems) {
    // Count by reason code
    byReasonCode[item.reasonCode] = (byReasonCode[item.reasonCode] || 0) + 1;

    // Count by branch
    byBranch[item.branchId] = (byBranch[item.branchId] || 0) + 1;

    // Track status counts
    if (item.status === 'pending') {
      pendingCount++;
    } else if (item.status === 'in_progress' || item.status === 'approved') {
      inProgressCount++;
    }

    // Calculate resolution time for completed items
    if (item.status === 'completed' && item.reviewedAt) {
      const resolutionMs =
        item.reviewedAt.toDate().getTime() - item.createdAt.toDate().getTime();
      totalResolutionTime += resolutionMs / (1000 * 60 * 60); // Convert to hours
      completedCount++;
    }
  }

  // Get total orders in the period to calculate redo rate
  const ordersConstraints: QueryConstraint[] = [
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
  ];

  if (branchId) {
    ordersConstraints.push(where('branchId', '==', branchId));
  }

  const orders = await getDocuments<Order>('orders', ...ordersConstraints);
  const totalOrders = orders.length;

  const redoRate = totalOrders > 0 ? (redoItems.length / totalOrders) * 100 : 0;
  const avgResolutionTime =
    completedCount > 0 ? totalResolutionTime / completedCount : 0;

  return {
    totalRedoItems: redoItems.length,
    byReasonCode,
    byBranch,
    redoRate,
    avgResolutionTime,
    pendingCount,
    inProgressCount,
  };
}

/**
 * Get pending redo items count for a branch
 *
 * @param branchId - Optional branch filter
 * @returns Count of pending redo items
 */
export async function getPendingRedoItemsCount(
  branchId?: string
): Promise<number> {
  const items = await getRedoItemsByStatus('pending', branchId);
  return items.length;
}

/**
 * Get all redo items with pagination
 *
 * @param branchId - Optional branch filter
 * @param pageLimit - Number of items per page
 * @returns Array of redo items
 */
export async function getRedoItems(
  branchId?: string,
  pageLimit = 50
): Promise<RedoItem[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageLimit)];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<RedoItem>(COLLECTION_NAME, ...constraints);
}
