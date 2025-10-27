/**
 * Transfer Batch Database Operations
 *
 * This file provides type-safe operations for managing transfer batches
 * between satellite stores and main stores.
 *
 * @module lib/db/transfers
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type { TransferBatch, TransferBatchStatus, Order } from './schema';
import { updateOrderStatus } from './orders';

/**
 * Generate a unique transfer batch ID
 * Format: TRF-[SATELLITE]-[YYYYMMDD]-[####]
 *
 * @param satelliteBranchId - Satellite branch identifier
 * @returns Formatted transfer batch ID
 */
export async function generateTransferBatchId(satelliteBranchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Get today's batches for this satellite to determine sequence number
  const todayBatches = await getDocuments<TransferBatch>(
    'transferBatches',
    where('satelliteBranchId', '==', satelliteBranchId),
    where('createdAt', '>=', Timestamp.fromDate(new Date(today.setHours(0, 0, 0, 0)))),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayBatches.length > 0) {
    const lastBatch = todayBatches[0];
    // Extract sequence from last batch ID (TRF-SATELLITE-20251015-0001)
    const lastSequence = parseInt(lastBatch.batchId.split('-').pop() || '0', 10);
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `TRF-${satelliteBranchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Create a new transfer batch
 *
 * @param satelliteBranchId - Source satellite branch ID
 * @param mainStoreBranchId - Destination main store branch ID
 * @param orderIds - Array of order IDs to include in batch
 * @param createdBy - UID of user creating the batch
 * @returns The created batch ID
 */
export async function createTransferBatch(
  satelliteBranchId: string,
  mainStoreBranchId: string,
  orderIds: string[],
  createdBy: string
): Promise<string> {
  if (orderIds.length === 0) {
    throw new DatabaseError('Cannot create empty transfer batch');
  }

  // Generate batch ID
  const batchId = await generateTransferBatchId(satelliteBranchId);

  const batch: TransferBatch = {
    batchId,
    satelliteBranchId,
    mainStoreBranchId,
    orderIds,
    status: 'pending',
    createdAt: Timestamp.now(),
    totalOrders: orderIds.length,
    createdBy,
  };

  // Save batch
  await setDocument<TransferBatch>('transferBatches', batchId, batch);

  // Update all orders in batch with transfer info
  const updatePromises = orderIds.map(async (orderId) => {
    await updateDocument<Order>('orders', orderId, {
      transferBatchId: batchId,
      originBranchId: satelliteBranchId,
      destinationBranchId: mainStoreBranchId,
      transferredAt: Timestamp.now(),
    });
  });

  await Promise.all(updatePromises);

  return batchId;
}

/**
 * Assign driver to transfer batch
 * Can be manual assignment or auto-assignment based on algorithm
 *
 * @param batchId - Transfer batch ID
 * @param driverId - UID of driver to assign
 * @returns Promise<void>
 */
export async function assignDriverToTransferBatch(
  batchId: string,
  driverId: string
): Promise<void> {
  await updateDocument<TransferBatch>('transferBatches', batchId, {
    assignedDriverId: driverId,
  });
}

/**
 * Mark transfer batch as dispatched
 * Called when driver picks up batch from satellite store
 *
 * @param batchId - Transfer batch ID
 * @returns Promise<void>
 */
export async function markBatchDispatched(batchId: string): Promise<void> {
  await updateDocument<TransferBatch>('transferBatches', batchId, {
    status: 'in_transit',
    dispatchedAt: Timestamp.now(),
  });
}

/**
 * Mark transfer batch as received
 * Called when batch arrives at main store
 * Automatically moves all orders in batch to 'inspection' status
 *
 * @param batchId - Transfer batch ID
 * @param receivedBy - UID of user receiving the batch
 * @returns Promise<void>
 */
export async function markBatchReceived(
  batchId: string,
  receivedBy: string
): Promise<void> {
  // Get batch details
  const batch = await getDocument<TransferBatch>('transferBatches', batchId);

  // Update batch status
  await updateDocument<TransferBatch>('transferBatches', batchId, {
    status: 'received',
    receivedAt: Timestamp.now(),
  });

  // Move all orders in batch to inspection status
  const updatePromises = batch.orderIds.map(async (orderId) => {
    // Update order with received timestamp
    await updateDocument<Order>('orders', orderId, {
      receivedAtMainStoreAt: Timestamp.now(),
    });

    // Move order to inspection status
    await updateOrderStatus(orderId, 'inspection', receivedBy);
  });

  await Promise.all(updatePromises);
}

/**
 * Get transfer batches by satellite store
 *
 * @param satelliteBranchId - Satellite branch ID
 * @param limitCount - Maximum number of batches to return
 * @returns Array of transfer batches
 */
export async function getTransferBatchesBySatellite(
  satelliteBranchId: string,
  limitCount = 50
): Promise<TransferBatch[]> {
  return getDocuments<TransferBatch>(
    'transferBatches',
    where('satelliteBranchId', '==', satelliteBranchId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get transfer batches by main store
 *
 * @param mainStoreBranchId - Main store branch ID
 * @param limitCount - Maximum number of batches to return
 * @returns Array of transfer batches
 */
export async function getTransferBatchesByMainStore(
  mainStoreBranchId: string,
  limitCount = 50
): Promise<TransferBatch[]> {
  return getDocuments<TransferBatch>(
    'transferBatches',
    where('mainStoreBranchId', '==', mainStoreBranchId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get transfer batches by status
 *
 * @param status - Batch status to filter by
 * @param branchId - Optional branch ID (satellite or main store)
 * @param limitCount - Maximum number of batches to return
 * @returns Array of transfer batches
 */
export async function getTransferBatchesByStatus(
  status: TransferBatchStatus,
  branchId?: string,
  limitCount = 50
): Promise<TransferBatch[]> {
  const constraints = [
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (branchId) {
    // Could be satellite or main store, check both
    const satelliteBatches = await getDocuments<TransferBatch>(
      'transferBatches',
      where('satelliteBranchId', '==', branchId),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const mainStoreBatches = await getDocuments<TransferBatch>(
      'transferBatches',
      where('mainStoreBranchId', '==', branchId),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Combine and sort by createdAt
    return [...satelliteBatches, ...mainStoreBatches]
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limitCount);
  }

  return getDocuments<TransferBatch>('transferBatches', ...constraints);
}

/**
 * Get pending transfer batches
 * Useful for displaying batches awaiting driver assignment or pickup
 *
 * @param limitCount - Maximum number of batches to return
 * @returns Array of pending transfer batches
 */
export async function getPendingTransferBatches(limitCount = 20): Promise<TransferBatch[]> {
  return getTransferBatchesByStatus('pending', undefined, limitCount);
}

/**
 * Get transfer batch by ID
 *
 * @param batchId - Transfer batch ID
 * @returns Transfer batch document
 */
export async function getTransferBatch(batchId: string): Promise<TransferBatch> {
  return getDocument<TransferBatch>('transferBatches', batchId);
}

/**
 * Get transfer batches assigned to driver
 *
 * @param driverId - UID of driver
 * @param limitCount - Maximum number of batches to return
 * @returns Array of transfer batches
 */
export async function getTransferBatchesByDriver(
  driverId: string,
  limitCount = 20
): Promise<TransferBatch[]> {
  return getDocuments<TransferBatch>(
    'transferBatches',
    where('assignedDriverId', '==', driverId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}
