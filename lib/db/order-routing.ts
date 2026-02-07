/**
 * Order Routing Service (FR-006)
 *
 * This file provides operations for routing orders from front desk to workstations,
 * managing inter-branch transfers, and tracking order processing flow.
 *
 * @module lib/db/order-routing
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  updateDocument,
} from './index';
import type {
  Order,
  Branch,
  RoutingStatus,
} from './schema';
import { updateOrderStatus } from './orders';
import { getActiveStaffAssignments } from './workstation';

// ============================================
// ROUTING STATUS MANAGEMENT
// ============================================

/**
 * Route an order from front desk to appropriate workstation
 * This is called after order creation to determine where the order should be processed
 *
 * @param orderId - Order ID to route
 * @param userId - UID of user initiating the routing
 * @returns Updated order with routing information
 */
export async function routeOrderToWorkstation(
  orderId: string,
  userId: string
): Promise<Order> {
  const order = await getDocument<Order>('orders', orderId);
  const sourceBranch = await getDocument<Branch>('branches', order.branchId);

  // Determine the processing branch
  let processingBranchId = order.branchId;

  // If source is a satellite store, route to its main store
  if (sourceBranch.branchType === 'satellite' && sourceBranch.mainStoreId) {
    processingBranchId = sourceBranch.mainStoreId;
  }

  // Get the processing branch details (validate it exists)
  const _processingBranch = await getDocument<Branch>('branches', processingBranchId);

  // Determine routing status based on whether transfer is needed
  const needsTransfer = order.branchId !== processingBranchId;
  const routingStatus: RoutingStatus = needsTransfer ? 'pending' : 'assigned';

  // Update order with routing information
  const routingUpdate: Partial<Order> = {
    processingBranchId,
    routingStatus,
    routedAt: Timestamp.now(),
  };

  // If no transfer needed, also set origin fields
  if (!needsTransfer) {
    routingUpdate.originBranchId = order.branchId;
    routingUpdate.destinationBranchId = processingBranchId;
  }

  await updateDocument<Order>('orders', orderId, routingUpdate);

  // If order doesn't need transfer, move it directly to inspection
  if (!needsTransfer && order.status === 'received') {
    await updateOrderStatus(orderId, 'inspection', userId);
  }

  return { ...order, ...routingUpdate };
}

/**
 * Update order routing status
 *
 * @param orderId - Order ID
 * @param status - New routing status
 * @param additionalData - Optional additional data to update
 */
export async function updateOrderRoutingStatus(
  orderId: string,
  status: RoutingStatus,
  additionalData?: Partial<Order>
): Promise<void> {
  const updates: Partial<Order> = {
    routingStatus: status,
    ...additionalData,
  };

  await updateDocument<Order>('orders', orderId, updates);
}

/**
 * Mark order as received at processing branch (after inter-branch transfer)
 *
 * @param orderId - Order ID
 * @param receivedBy - UID of staff receiving the order
 */
export async function markOrderReceivedAtBranch(
  orderId: string,
  receivedBy: string
): Promise<void> {
  await updateDocument<Order>('orders', orderId, {
    routingStatus: 'received',
    arrivedAtBranchAt: Timestamp.now(),
    receivedAtMainStoreAt: Timestamp.now(),
  });

  // Move order to inspection status
  await updateOrderStatus(orderId, 'inspection', receivedBy);
}

/**
 * Assign order to a specific workstation stage
 *
 * @param orderId - Order ID
 * @param stage - Workstation stage to assign
 * @param staffId - Optional specific staff member to assign
 */
export async function assignOrderToWorkstationStage(
  orderId: string,
  stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging',
  staffId?: string
): Promise<void> {
  const updates: Partial<Order> = {
    routingStatus: 'assigned',
    assignedWorkstationStage: stage,
  };

  if (staffId) {
    updates.assignedWorkstationStaffId = staffId;
  }

  await updateDocument<Order>('orders', orderId, updates);
}

/**
 * Mark order as actively being processed
 *
 * @param orderId - Order ID
 * @param staffId - UID of staff processing the order
 */
export async function markOrderInProcessing(
  orderId: string,
  staffId: string
): Promise<void> {
  await updateDocument<Order>('orders', orderId, {
    routingStatus: 'processing',
    assignedWorkstationStaffId: staffId,
  });
}

/**
 * Mark order processing as complete and ready for return/delivery
 *
 * @param orderId - Order ID
 * @param completedBy - UID of staff who completed processing
 */
export async function markOrderProcessingComplete(
  orderId: string,
  completedBy: string
): Promise<void> {
  const order = await getDocument<Order>('orders', orderId);
  const branch = await getDocument<Branch>('branches', order.processingBranchId || order.branchId);

  // Calculate earliest delivery time based on sorting window (FR-007)
  const sortingWindowHours = branch.sortingWindowHours || 6;
  const earliestDeliveryTime = new Date();
  earliestDeliveryTime.setHours(earliestDeliveryTime.getHours() + sortingWindowHours);

  await updateDocument<Order>('orders', orderId, {
    routingStatus: 'ready_for_return',
    sortingCompletedAt: Timestamp.now(),
    earliestDeliveryTime: Timestamp.fromDate(earliestDeliveryTime),
  });

  // Update order status to queued_for_delivery
  await updateOrderStatus(orderId, 'queued_for_delivery', completedBy);
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get orders pending routing (not yet assigned to workstation)
 *
 * @param branchId - Branch ID to filter by
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders pending routing
 */
export async function getOrdersPendingRouting(
  branchId: string,
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('branchId', '==', branchId),
    where('routingStatus', '==', 'pending'),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  );
}

/**
 * Get orders currently in transit between branches
 *
 * @param destinationBranchId - Destination branch ID
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders in transit
 */
export async function getOrdersInTransit(
  destinationBranchId: string,
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('destinationBranchId', '==', destinationBranchId),
    where('routingStatus', '==', 'in_transit'),
    orderBy('transferredAt', 'asc'),
    limit(limitCount)
  );
}

/**
 * Get orders assigned to a specific workstation stage
 *
 * @param branchId - Branch ID
 * @param stage - Workstation stage
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders at the specified stage
 */
export async function getOrdersByWorkstationStage(
  branchId: string,
  stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging',
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('processingBranchId', '==', branchId),
    where('assignedWorkstationStage', '==', stage),
    where('routingStatus', 'in', ['assigned', 'processing']),
    orderBy('routedAt', 'asc'),
    limit(limitCount)
  );
}

/**
 * Get orders assigned to a specific staff member
 *
 * @param staffId - Staff UID
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders assigned to the staff member
 */
export async function getOrdersAssignedToStaff(
  staffId: string,
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('assignedWorkstationStaffId', '==', staffId),
    where('routingStatus', 'in', ['assigned', 'processing']),
    orderBy('routedAt', 'asc'),
    limit(limitCount)
  );
}

/**
 * Get orders ready for delivery/collection (processing complete)
 *
 * @param branchId - Branch ID
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders ready for return
 */
export async function getOrdersReadyForReturn(
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
// WORKSTATION CAPACITY & LOAD BALANCING
// ============================================

/**
 * Get workstation queue depth for a branch
 * Returns count of orders at each stage
 *
 * @param branchId - Branch ID
 * @returns Record of stage to order count
 */
export async function getWorkstationQueueDepth(
  branchId: string
): Promise<Record<string, number>> {
  const stages = ['inspection', 'washing', 'drying', 'ironing', 'quality_check', 'packaging'];
  const queueDepth: Record<string, number> = {};

  for (const stage of stages) {
    const orders = await getDocuments<Order>(
      'orders',
      where('processingBranchId', '==', branchId),
      where('assignedWorkstationStage', '==', stage),
      where('routingStatus', 'in', ['assigned', 'processing'])
    );
    queueDepth[stage] = orders.length;
  }

  return queueDepth;
}

/**
 * Find available staff for a stage based on current workload
 *
 * @param branchId - Branch ID
 * @param stage - Workstation stage
 * @returns Staff ID with lowest current workload, or null if none available
 */
export async function findAvailableStaffForStage(
  branchId: string,
  stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging'
): Promise<string | null> {
  // Get active staff assignments for this stage
  const assignments = await getActiveStaffAssignments(branchId);
  const stageAssignments = assignments.filter(a => a.permanentStage === stage);

  if (stageAssignments.length === 0) {
    return null;
  }

  // Count current orders for each staff member
  const staffWorkload: { staffId: string; orderCount: number }[] = [];

  for (const assignment of stageAssignments) {
    const orders = await getDocuments<Order>(
      'orders',
      where('assignedWorkstationStaffId', '==', assignment.staffId),
      where('routingStatus', 'in', ['assigned', 'processing'])
    );
    staffWorkload.push({
      staffId: assignment.staffId,
      orderCount: orders.length,
    });
  }

  // Return staff with lowest workload
  staffWorkload.sort((a, b) => a.orderCount - b.orderCount);
  return staffWorkload[0]?.staffId || null;
}

/**
 * Auto-assign order to workstation based on capacity and availability
 *
 * @param orderId - Order ID
 * @returns Assignment result with stage and staff
 */
export async function autoAssignOrderToWorkstation(
  orderId: string
): Promise<{ stage: string; staffId?: string }> {
  const order = await getDocument<Order>('orders', orderId);
  const processingBranchId = order.processingBranchId || order.branchId;

  // First stage is always inspection
  const initialStage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging' = 'inspection';

  // Find available staff for inspection
  const availableStaff = await findAvailableStaffForStage(processingBranchId, initialStage);

  // Assign order to stage
  await assignOrderToWorkstationStage(orderId, initialStage, availableStaff || undefined);

  return {
    stage: initialStage,
    staffId: availableStaff || undefined,
  };
}

// ============================================
// ROUTING METRICS
// ============================================

/**
 * Get routing metrics for a branch
 *
 * @param branchId - Branch ID
 * @returns Routing metrics including queue depths and turnaround times
 */
export async function getRoutingMetrics(branchId: string): Promise<{
  pendingRouting: number;
  inTransit: number;
  queueByStage: Record<string, number>;
  readyForReturn: number;
  avgProcessingTime?: number;
}> {
  // Get counts for each status
  const [pendingOrders, inTransitOrders, readyOrders] = await Promise.all([
    getDocuments<Order>(
      'orders',
      where('branchId', '==', branchId),
      where('routingStatus', '==', 'pending')
    ),
    getDocuments<Order>(
      'orders',
      where('destinationBranchId', '==', branchId),
      where('routingStatus', '==', 'in_transit')
    ),
    getDocuments<Order>(
      'orders',
      where('processingBranchId', '==', branchId),
      where('routingStatus', '==', 'ready_for_return')
    ),
  ]);

  // Get queue depth by stage
  const queueByStage = await getWorkstationQueueDepth(branchId);

  return {
    pendingRouting: pendingOrders.length,
    inTransit: inTransitOrders.length,
    queueByStage,
    readyForReturn: readyOrders.length,
  };
}

// ============================================
// SORTING TIMELINE (FR-007 SUPPORT)
// ============================================

/**
 * Validate if an order can be scheduled for delivery
 * Based on sorting window requirements
 *
 * @param orderId - Order ID
 * @param scheduledTime - Proposed delivery time
 * @returns Validation result
 */
export async function validateDeliverySchedule(
  orderId: string,
  scheduledTime: Date
): Promise<{ valid: boolean; error?: string; earliestTime?: Date }> {
  const order = await getDocument<Order>('orders', orderId);

  // If order doesn't have an earliest delivery time, calculate it
  if (!order.earliestDeliveryTime) {
    const branch = await getDocument<Branch>('branches', order.processingBranchId || order.branchId);
    const sortingWindowHours = branch.sortingWindowHours || 6;

    // Use arrival time or current time as baseline
    const baselineTime = order.arrivedAtBranchAt?.toDate() || new Date();
    const earliestTime = new Date(baselineTime.getTime() + sortingWindowHours * 60 * 60 * 1000);

    if (scheduledTime < earliestTime) {
      return {
        valid: false,
        error: `Cannot schedule delivery before ${earliestTime.toLocaleString()}. Sorting window (${sortingWindowHours} hours) must complete first.`,
        earliestTime,
      };
    }

    return { valid: true, earliestTime };
  }

  // Check against stored earliest delivery time
  const earliestTime = order.earliestDeliveryTime.toDate();

  if (scheduledTime < earliestTime) {
    return {
      valid: false,
      error: `Cannot schedule delivery before ${earliestTime.toLocaleString()}. Sorting window must complete first.`,
      earliestTime,
    };
  }

  return { valid: true, earliestTime };
}

/**
 * Complete sorting and update earliest delivery time
 *
 * @param orderId - Order ID
 */
export async function completeSorting(orderId: string): Promise<void> {
  const order = await getDocument<Order>('orders', orderId);
  const branch = await getDocument<Branch>('branches', order.processingBranchId || order.branchId);
  const sortingWindowHours = branch.sortingWindowHours || 6;

  // Sorting complete means earliest delivery is now calculated from this moment
  const earliestDeliveryTime = new Date();
  earliestDeliveryTime.setHours(earliestDeliveryTime.getHours() + sortingWindowHours);

  await updateDocument<Order>('orders', orderId, {
    sortingCompletedAt: Timestamp.now(),
    earliestDeliveryTime: Timestamp.fromDate(earliestDeliveryTime),
  });
}
