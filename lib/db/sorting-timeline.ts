/**
 * Sorting Timeline Service (FR-007)
 *
 * This file provides operations for managing inter-branch sorting timelines,
 * including arrival tracking, sorting window enforcement, and delivery scheduling validation.
 *
 * @module lib/db/sorting-timeline
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  updateDocument,
  DatabaseError,
} from './index';
import type { Order, Branch } from './schema';

// ============================================
// CONSTANTS
// ============================================

/** Default sorting window in hours if not configured per branch */
export const DEFAULT_SORTING_WINDOW_HOURS = 6;

// ============================================
// ARRIVAL & TIMELINE TRACKING
// ============================================

/**
 * Record when an order arrives at the processing branch
 * This starts the sorting window timer
 *
 * @param orderId - Order ID
 * @param branchId - Branch where order arrived
 * @returns Updated order with timeline information
 */
export async function recordBranchArrival(
  orderId: string,
  branchId?: string
): Promise<Order> {
  const order = await getDocument<Order>('orders', orderId);

  // Determine the branch to use for sorting window calculation
  const effectiveBranchId = branchId || order.processingBranchId || order.branchId;
  const branch = await getDocument<Branch>('branches', effectiveBranchId);

  // Calculate sorting window and earliest delivery time
  const sortingWindowHours = branch.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;
  const arrivalTime = new Date();
  const earliestDeliveryTime = new Date(arrivalTime.getTime() + sortingWindowHours * 60 * 60 * 1000);

  // Update order with arrival information
  const updates: Partial<Order> = {
    arrivedAtBranchAt: Timestamp.fromDate(arrivalTime),
    earliestDeliveryTime: Timestamp.fromDate(earliestDeliveryTime),
    routingStatus: 'received',
  };

  await updateDocument<Order>('orders', orderId, updates);

  return { ...order, ...updates };
}

/**
 * Complete sorting for an order
 * This marks the order as ready for delivery scheduling
 *
 * @param orderId - Order ID
 * @returns Updated order
 */
export async function completeSorting(orderId: string): Promise<Order> {
  const order = await getDocument<Order>('orders', orderId);

  const updates: Partial<Order> = {
    sortingCompletedAt: Timestamp.now(),
    routingStatus: 'ready_for_return',
  };

  await updateDocument<Order>('orders', orderId, updates);

  return { ...order, ...updates };
}

/**
 * Validate if a delivery time is valid based on sorting window
 *
 * @param orderId - Order ID
 * @param proposedTime - Proposed delivery time
 * @returns Validation result
 */
export async function validateDeliveryTime(
  orderId: string,
  proposedTime: Date
): Promise<{
  valid: boolean;
  earliestTime: Date;
  error?: string;
}> {
  const order = await getDocument<Order>('orders', orderId);

  // Get the effective branch for sorting window
  const branchId = order.processingBranchId || order.branchId;
  const branch = await getDocument<Branch>('branches', branchId);
  const sortingWindowHours = branch.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;

  // Calculate earliest delivery time
  let earliestTime: Date;

  if (order.earliestDeliveryTime) {
    earliestTime = order.earliestDeliveryTime.toDate();
  } else if (order.arrivedAtBranchAt) {
    earliestTime = new Date(
      order.arrivedAtBranchAt.toDate().getTime() + sortingWindowHours * 60 * 60 * 1000
    );
  } else {
    // Use current time plus sorting window if no arrival recorded
    earliestTime = new Date(Date.now() + sortingWindowHours * 60 * 60 * 1000);
  }

  // Validate the proposed time
  if (proposedTime < earliestTime) {
    return {
      valid: false,
      earliestTime,
      error: `Cannot schedule delivery before ${earliestTime.toLocaleString()}. ` +
        `Sorting window (${sortingWindowHours} hours) must complete first.`,
    };
  }

  return {
    valid: true,
    earliestTime,
  };
}

/**
 * Get the sorting window remaining for an order
 *
 * @param orderId - Order ID
 * @returns Remaining time in minutes (0 if window has passed)
 */
export async function getSortingWindowRemaining(orderId: string): Promise<{
  remainingMinutes: number;
  earliestDeliveryTime: Date;
  isComplete: boolean;
}> {
  const order = await getDocument<Order>('orders', orderId);

  // If sorting is already complete
  if (order.sortingCompletedAt) {
    const earliestTime = order.earliestDeliveryTime?.toDate() || new Date();
    return {
      remainingMinutes: 0,
      earliestDeliveryTime: earliestTime,
      isComplete: true,
    };
  }

  // Get branch for sorting window
  const branchId = order.processingBranchId || order.branchId;
  const branch = await getDocument<Branch>('branches', branchId);
  const sortingWindowHours = branch.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;

  // Calculate earliest delivery time
  let earliestTime: Date;

  if (order.earliestDeliveryTime) {
    earliestTime = order.earliestDeliveryTime.toDate();
  } else if (order.arrivedAtBranchAt) {
    earliestTime = new Date(
      order.arrivedAtBranchAt.toDate().getTime() + sortingWindowHours * 60 * 60 * 1000
    );
  } else {
    // Use current time plus sorting window
    earliestTime = new Date(Date.now() + sortingWindowHours * 60 * 60 * 1000);
  }

  // Calculate remaining minutes
  const now = new Date();
  const remainingMs = earliestTime.getTime() - now.getTime();
  const remainingMinutes = Math.max(0, Math.ceil(remainingMs / (60 * 1000)));

  return {
    remainingMinutes,
    earliestDeliveryTime: earliestTime,
    isComplete: remainingMinutes === 0,
  };
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get orders with pending sorting (arrived but not sorted)
 *
 * @param branchId - Branch ID
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders pending sorting
 */
export async function getOrdersPendingSorting(
  branchId: string,
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('processingBranchId', '==', branchId),
    where('routingStatus', 'in', ['received', 'assigned', 'processing']),
    orderBy('arrivedAtBranchAt', 'asc'),
    limit(limitCount)
  );
}

/**
 * Get orders with expiring sorting windows (within specified hours)
 *
 * @param branchId - Branch ID
 * @param hoursThreshold - Hours until expiry to consider "expiring"
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders with expiring windows
 */
export async function getOrdersWithExpiringSortingWindow(
  branchId: string,
  hoursThreshold = 2,
  limitCount = 50
): Promise<Order[]> {
  const thresholdTime = new Date();
  thresholdTime.setHours(thresholdTime.getHours() + hoursThreshold);

  // Get orders that are not yet sorted and have earliest delivery time within threshold
  const orders = await getDocuments<Order>(
    'orders',
    where('processingBranchId', '==', branchId),
    where('routingStatus', 'in', ['received', 'assigned', 'processing']),
    where('earliestDeliveryTime', '<=', Timestamp.fromDate(thresholdTime)),
    orderBy('earliestDeliveryTime', 'asc'),
    limit(limitCount)
  );

  // Filter out orders that have already completed sorting
  return orders.filter(order => !order.sortingCompletedAt);
}

/**
 * Get orders ready for delivery scheduling (sorting complete)
 *
 * @param branchId - Branch ID
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders ready for scheduling
 */
export async function getOrdersReadyForScheduling(
  branchId: string,
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('processingBranchId', '==', branchId),
    where('routingStatus', '==', 'ready_for_return'),
    orderBy('sortingCompletedAt', 'asc'),
    limit(limitCount)
  );
}

// ============================================
// BRANCH CONFIGURATION
// ============================================

/**
 * Update branch sorting window configuration
 *
 * @param branchId - Branch ID
 * @param sortingWindowHours - New sorting window in hours
 * @returns Updated branch
 */
export async function updateBranchSortingWindow(
  branchId: string,
  sortingWindowHours: number
): Promise<Branch> {
  if (sortingWindowHours < 1 || sortingWindowHours > 48) {
    throw new DatabaseError('Sorting window must be between 1 and 48 hours');
  }

  const branch = await getDocument<Branch>('branches', branchId);

  await updateDocument<Branch>('branches', branchId, {
    sortingWindowHours,
  });

  return { ...branch, sortingWindowHours };
}

/**
 * Get branch sorting window configuration
 *
 * @param branchId - Branch ID
 * @returns Sorting window in hours
 */
export async function getBranchSortingWindow(branchId: string): Promise<number> {
  const branch = await getDocument<Branch>('branches', branchId);
  return branch.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;
}

// ============================================
// METRICS
// ============================================

/**
 * Get sorting timeline metrics for a branch
 *
 * @param branchId - Branch ID
 * @returns Sorting metrics
 */
export async function getSortingMetrics(branchId: string): Promise<{
  pendingSorting: number;
  expiringSoon: number;
  readyForScheduling: number;
  avgSortingTimeMinutes: number;
  sortingWindowHours: number;
}> {
  // Get branch config
  const branch = await getDocument<Branch>('branches', branchId);
  const sortingWindowHours = branch.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;

  // Get counts
  const [pendingOrders, expiringOrders, readyOrders] = await Promise.all([
    getOrdersPendingSorting(branchId),
    getOrdersWithExpiringSortingWindow(branchId, 2),
    getOrdersReadyForScheduling(branchId),
  ]);

  // Calculate average sorting time for completed orders
  let totalSortingTime = 0;
  let sortedOrderCount = 0;

  for (const order of readyOrders) {
    if (order.arrivedAtBranchAt && order.sortingCompletedAt) {
      const arrivalTime = order.arrivedAtBranchAt.toDate().getTime();
      const completionTime = order.sortingCompletedAt.toDate().getTime();
      totalSortingTime += (completionTime - arrivalTime) / (60 * 1000); // Convert to minutes
      sortedOrderCount++;
    }
  }

  const avgSortingTimeMinutes = sortedOrderCount > 0
    ? Math.round(totalSortingTime / sortedOrderCount)
    : 0;

  return {
    pendingSorting: pendingOrders.length,
    expiringSoon: expiringOrders.length,
    readyForScheduling: readyOrders.length,
    avgSortingTimeMinutes,
    sortingWindowHours,
  };
}
