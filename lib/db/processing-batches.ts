/**
 * Processing Batch Database Operations
 *
 * This file provides type-safe operations for managing processing batches
 * for washing, drying, and other batch operations at workstation.
 *
 * @module lib/db/processing-batches
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type {
  ProcessingBatch,
  ProcessingBatchStatus,
  ProcessingBatchStage,
  Order,
  OrderStatus,
} from './schema';
import { updateOrderStatus } from './orders';

/**
 * Generate a unique processing batch ID
 * Format: PROC-[STAGE]-[YYYYMMDD]-[####]
 *
 * @param stage - Processing stage (washing, drying, ironing)
 * @returns Formatted processing batch ID
 */
export async function generateProcessingBatchId(stage: ProcessingBatchStage): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const stageUpper = stage.toUpperCase();

  // Get today's batches for this stage to determine sequence number
  const todayBatches = await getDocuments<ProcessingBatch>(
    'processingBatches',
    where('stage', '==', stage),
    where('createdAt', '>=', Timestamp.fromDate(new Date(today.setHours(0, 0, 0, 0)))),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayBatches.length > 0) {
    const lastBatch = todayBatches[0];
    // Extract sequence from last batch ID (PROC-WASHING-20251015-0001)
    const lastSequence = parseInt(lastBatch.batchId.split('-').pop() || '0', 10);
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `PROC-${stageUpper}-${dateStr}-${sequenceStr}`;
}

/**
 * Get next stage after current processing stage
 *
 * @param currentStage - Current processing stage
 * @returns Next order status
 */
function getNextStageStatus(currentStage: ProcessingBatchStage): OrderStatus {
  const stageMap: Record<ProcessingBatchStage, OrderStatus> = {
    washing: 'drying',
    drying: 'ironing',
    ironing: 'quality_check',
  };

  return stageMap[currentStage];
}

/**
 * Create a new processing batch
 *
 * @param stage - Processing stage (washing, drying, ironing)
 * @param orderIds - Array of order IDs to include in batch
 * @param assignedStaffIds - Array of staff UIDs assigned to process batch
 * @param branchId - Branch ID where batch is being processed
 * @param createdBy - UID of user (Workstation Manager) creating the batch
 * @returns The created batch ID
 */
export async function createProcessingBatch(
  stage: ProcessingBatchStage,
  orderIds: string[],
  assignedStaffIds: string[],
  branchId: string,
  createdBy: string
): Promise<string> {
  if (orderIds.length === 0) {
    throw new DatabaseError('Cannot create empty processing batch');
  }

  if (assignedStaffIds.length === 0) {
    throw new DatabaseError('Must assign at least one staff member to batch');
  }

  // Generate batch ID
  const batchId = await generateProcessingBatchId(stage);

  // Count total garments in all orders
  let totalGarments = 0;
  for (const orderId of orderIds) {
    const order = await getDocument<Order>('orders', orderId);
    totalGarments += order.garments.length;
  }

  const batch: ProcessingBatch = {
    batchId,
    stage,
    orderIds,
    garmentCount: totalGarments,
    assignedStaffIds,
    status: 'pending',
    branchId,
    createdBy,
    createdAt: Timestamp.now(),
  };

  // Save batch
  await setDocument<ProcessingBatch>('processingBatches', batchId, batch);

  // Update all orders with batch reference
  const updatePromises = orderIds.map(async (orderId) => {
    await updateDocument<Order>('orders', orderId, {
      processingBatchId: batchId,
    });
  });

  await Promise.all(updatePromises);

  return batchId;
}

/**
 * Start processing a batch
 * Changes status from 'pending' to 'in_progress'
 * Moves all orders in batch to the batch's stage status
 *
 * @param batchId - Processing batch ID
 * @param startedBy - UID of staff member starting the batch
 * @returns Promise<void>
 */
export async function startProcessingBatch(
  batchId: string,
  startedBy: string
): Promise<void> {
  // Get batch details
  const batch = await getDocument<ProcessingBatch>('processingBatches', batchId);

  if (batch.status !== 'pending') {
    throw new DatabaseError(`Cannot start batch with status: ${batch.status}`);
  }

  // Update batch status
  await updateDocument<ProcessingBatch>('processingBatches', batchId, {
    status: 'in_progress',
    startedAt: Timestamp.now(),
  });

  // Move all orders to the stage status
  const stageStatus = batch.stage as OrderStatus;
  const updatePromises = batch.orderIds.map(async (orderId) => {
    await updateOrderStatus(orderId, stageStatus, startedBy);
  });

  await Promise.all(updatePromises);
}

/**
 * Complete processing a batch
 * Changes status to 'completed'
 * Automatically moves all orders to the next stage
 *
 * @param batchId - Processing batch ID
 * @param completedBy - UID of staff member completing the batch
 * @returns Promise<void>
 */
export async function completeProcessingBatch(
  batchId: string,
  completedBy: string
): Promise<void> {
  // Get batch details
  const batch = await getDocument<ProcessingBatch>('processingBatches', batchId);

  if (batch.status !== 'in_progress') {
    throw new DatabaseError(`Cannot complete batch with status: ${batch.status}`);
  }

  // Update batch status
  await updateDocument<ProcessingBatch>('processingBatches', batchId, {
    status: 'completed',
    completedAt: Timestamp.now(),
  });

  // Get next stage status
  const nextStatus = getNextStageStatus(batch.stage);

  // Move all orders to next stage
  const updatePromises = batch.orderIds.map(async (orderId) => {
    // Clear processing batch ID since batch is complete
    await updateDocument<Order>('orders', orderId, {
      processingBatchId: undefined,
    });

    // Move to next stage
    await updateOrderStatus(orderId, nextStatus, completedBy);
  });

  await Promise.all(updatePromises);
}

/**
 * Get processing batches by stage
 *
 * @param stage - Processing stage to filter by
 * @param branchId - Optional branch ID to filter by
 * @param limitCount - Maximum number of batches to return
 * @returns Array of processing batches
 */
export async function getProcessingBatchesByStage(
  stage: ProcessingBatchStage,
  branchId?: string,
  limitCount = 50
): Promise<ProcessingBatch[]> {
  const constraints = [
    where('stage', '==', stage),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<ProcessingBatch>('processingBatches', ...constraints);
}

/**
 * Get processing batches by status
 *
 * @param status - Batch status to filter by
 * @param branchId - Optional branch ID to filter by
 * @param limitCount - Maximum number of batches to return
 * @returns Array of processing batches
 */
export async function getProcessingBatchesByStatus(
  status: ProcessingBatchStatus,
  branchId?: string,
  limitCount = 50
): Promise<ProcessingBatch[]> {
  const constraints = [
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<ProcessingBatch>('processingBatches', ...constraints);
}

/**
 * Get active batches by staff member
 * Useful for showing staff member's current workload
 *
 * @param staffId - UID of staff member
 * @param limitCount - Maximum number of batches to return
 * @returns Array of processing batches
 */
export async function getActiveBatchesByStaff(
  staffId: string,
  limitCount = 20
): Promise<ProcessingBatch[]> {
  return getDocuments<ProcessingBatch>(
    'processingBatches',
    where('assignedStaffIds', 'array-contains', staffId),
    where('status', 'in', ['pending', 'in_progress']),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get processing batch by ID
 *
 * @param batchId - Processing batch ID
 * @returns Processing batch document
 */
export async function getProcessingBatch(batchId: string): Promise<ProcessingBatch> {
  return getDocument<ProcessingBatch>('processingBatches', batchId);
}

/**
 * Add staff member to batch
 *
 * @param batchId - Processing batch ID
 * @param staffId - UID of staff member to add
 * @returns Promise<void>
 */
export async function addStaffToBatch(batchId: string, staffId: string): Promise<void> {
  const batch = await getProcessingBatch(batchId);

  if (batch.assignedStaffIds.includes(staffId)) {
    return; // Already assigned
  }

  await updateDocument<ProcessingBatch>('processingBatches', batchId, {
    assignedStaffIds: [...batch.assignedStaffIds, staffId],
  });
}

/**
 * Remove staff member from batch
 *
 * @param batchId - Processing batch ID
 * @param staffId - UID of staff member to remove
 * @returns Promise<void>
 */
export async function removeStaffFromBatch(batchId: string, staffId: string): Promise<void> {
  const batch = await getProcessingBatch(batchId);

  await updateDocument<ProcessingBatch>('processingBatches', batchId, {
    assignedStaffIds: batch.assignedStaffIds.filter((id) => id !== staffId),
  });
}

/**
 * Get all active processing batches for a branch
 * Useful for workstation overview
 *
 * @param branchId - Branch ID
 * @returns Array of active processing batches
 */
export async function getActiveBatchesByBranch(branchId: string): Promise<ProcessingBatch[]> {
  return getDocuments<ProcessingBatch>(
    'processingBatches',
    where('branchId', '==', branchId),
    where('status', 'in', ['pending', 'in_progress']),
    orderBy('createdAt', 'desc')
  );
}
