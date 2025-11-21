/**
 * Inventory Transfers Database Functions
 *
 * Functions for managing inventory transfers between branches.
 *
 * @module lib/db/inventory-transfers
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
  type QueryConstraint,
} from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import type {
  InventoryTransfer,
  InventoryTransferStatus,
  InventoryTransferItem,
  TransferAuditEntry,
  InventoryItemExtended,
} from './schema';

/**
 * Generate a unique transfer ID
 * Format: TRF-INV-[YYYYMMDD]-[####]
 */
function generateTransferId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `TRF-INV-${dateStr}-${random}`;
}

/**
 * Create a new inventory transfer
 *
 * @param fromBranchId - Source branch ID
 * @param toBranchId - Destination branch ID
 * @param items - Items to transfer
 * @param requestedBy - UID of user creating the transfer
 * @param userName - Name of user creating the transfer
 * @param notes - Optional notes
 * @returns Transfer ID
 */
export async function createInventoryTransfer(
  fromBranchId: string,
  toBranchId: string,
  items: InventoryTransferItem[],
  requestedBy: string,
  userName: string,
  notes?: string
): Promise<string> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const transferId = generateTransferId();
  const now = Timestamp.now();

  const auditEntry: TransferAuditEntry = {
    status: 'draft',
    timestamp: now,
    userId: requestedBy,
    userName,
    notes: 'Transfer created',
  };

  const transfer: InventoryTransfer = {
    transferId,
    fromBranchId,
    toBranchId,
    items,
    status: 'draft',
    requestedBy,
    notes,
    auditTrail: [auditEntry],
    createdAt: now,
  };

  await addDoc(collection(db, 'inventoryTransfers'), transfer);
  return transferId;
}

/**
 * Update transfer status
 *
 * @param transferId - Transfer ID
 * @param newStatus - New status
 * @param userId - UID of user making the update
 * @param userName - Name of user making the update
 * @param notes - Optional notes
 */
export async function updateTransferStatus(
  transferId: string,
  newStatus: InventoryTransferStatus,
  userId: string,
  userName: string,
  notes?: string
): Promise<void> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const transfersRef = collection(db, 'inventoryTransfers');
  const q = query(transfersRef, where('transferId', '==', transferId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(`Transfer ${transferId} not found`);
  }

  const transferDoc = snapshot.docs[0];
  const transfer = transferDoc.data() as InventoryTransfer;

  // Create audit entry
  const auditEntry: TransferAuditEntry = {
    status: newStatus,
    timestamp: Timestamp.now(),
    userId,
    userName,
    notes,
  };

  // Prepare update data
  const updateData: Partial<InventoryTransfer> = {
    status: newStatus,
    auditTrail: [...transfer.auditTrail, auditEntry],
    updatedAt: Timestamp.now(),
  };

  // Add specific fields based on status
  switch (newStatus) {
    case 'approved':
      updateData.approvedBy = userId;
      break;
    case 'in_transit':
      updateData.dispatchedAt = Timestamp.now();
      break;
    case 'received':
      updateData.receivedAt = Timestamp.now();
      break;
    case 'reconciled':
      updateData.reconciledAt = Timestamp.now();
      break;
  }

  await updateDoc(doc(db, 'inventoryTransfers', transferDoc.id), updateData);
}

/**
 * Approve transfer and adjust source branch inventory
 *
 * @param transferId - Transfer ID
 * @param userId - UID of user approving
 * @param userName - Name of user approving
 */
export async function approveTransfer(
  transferId: string,
  userId: string,
  userName: string
): Promise<void> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  await runTransaction(db, async (transaction) => {
    // Get transfer
    const transfersRef = collection(db, 'inventoryTransfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    const transferDoc = snapshot.docs[0];
    const transfer = transferDoc.data() as InventoryTransfer;

    if (transfer.status !== 'requested') {
      throw new Error('Transfer must be in requested status to approve');
    }

    // Update inventory items - reserve/decrement quantities
    for (const item of transfer.items) {
      const inventoryRef = collection(db, 'inventory');
      const itemQuery = query(
        inventoryRef,
        where('itemId', '==', item.inventoryItemId),
        where('branchId', '==', transfer.fromBranchId)
      );
      const itemSnapshot = await getDocs(itemQuery);

      if (!itemSnapshot.empty) {
        const inventoryDoc = itemSnapshot.docs[0];
        const inventoryItem = inventoryDoc.data() as InventoryItemExtended;

        // Decrement available quantity and increment pendingTransferOut
        const newOnHand = (inventoryItem.onHand || inventoryItem.quantity) - item.quantity;
        const newPendingTransferOut = (inventoryItem.pendingTransferOut || 0) + item.quantity;

        if (newOnHand < 0) {
          throw new Error(
            `Insufficient quantity for item ${item.name}. Available: ${inventoryItem.onHand || inventoryItem.quantity}, Requested: ${item.quantity}`
          );
        }

        transaction.update(doc(db, 'inventory', inventoryDoc.id), {
          onHand: newOnHand,
          pendingTransferOut: newPendingTransferOut,
        });
      }
    }

    // Update transfer status
    const auditEntry: TransferAuditEntry = {
      status: 'approved',
      timestamp: Timestamp.now(),
      userId,
      userName,
      notes: 'Transfer approved and inventory reserved',
    };

    transaction.update(doc(db, 'inventoryTransfers', transferDoc.id), {
      status: 'approved',
      approvedBy: userId,
      auditTrail: [...transfer.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });
  });
}

/**
 * Receive transfer and adjust destination branch inventory
 *
 * @param transferId - Transfer ID
 * @param userId - UID of user receiving
 * @param userName - Name of user receiving
 * @param receivedQuantities - Actual quantities received (may differ from requested)
 */
export async function receiveTransfer(
  transferId: string,
  userId: string,
  userName: string,
  receivedQuantities: { inventoryItemId: string; quantity: number }[]
): Promise<void> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  await runTransaction(db, async (transaction) => {
    // Get transfer
    const transfersRef = collection(db, 'inventoryTransfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    const transferDoc = snapshot.docs[0];
    const transfer = transferDoc.data() as InventoryTransfer;

    if (transfer.status !== 'in_transit') {
      throw new Error('Transfer must be in_transit status to receive');
    }

    // Update items with received quantities
    const updatedItems = transfer.items.map((item) => {
      const received = receivedQuantities.find((r) => r.inventoryItemId === item.inventoryItemId);
      return {
        ...item,
        receivedQuantity: received?.quantity || item.quantity,
      };
    });

    // Check for discrepancies
    const discrepancies = updatedItems
      .filter((item) => item.receivedQuantity !== item.quantity)
      .map((item) => ({
        itemId: item.inventoryItemId,
        expected: item.quantity,
        actual: item.receivedQuantity || 0,
        notes: `Discrepancy: Expected ${item.quantity}, Received ${item.receivedQuantity}`,
      }));

    // Update destination branch inventory
    for (const item of updatedItems) {
      const inventoryRef = collection(db, 'inventory');
      const itemQuery = query(
        inventoryRef,
        where('itemId', '==', item.inventoryItemId),
        where('branchId', '==', transfer.toBranchId)
      );
      const itemSnapshot = await getDocs(itemQuery);

      if (!itemSnapshot.empty) {
        const inventoryDoc = itemSnapshot.docs[0];
        const inventoryItem = inventoryDoc.data() as InventoryItemExtended;

        // Add received quantity to destination branch
        const newOnHand = (inventoryItem.onHand || inventoryItem.quantity) + (item.receivedQuantity || 0);

        transaction.update(doc(db, 'inventory', inventoryDoc.id), {
          onHand: newOnHand,
          quantity: newOnHand,
        });
      }
    }

    // Update source branch inventory - clear pendingTransferOut
    for (const item of updatedItems) {
      const inventoryRef = collection(db, 'inventory');
      const itemQuery = query(
        inventoryRef,
        where('itemId', '==', item.inventoryItemId),
        where('branchId', '==', transfer.fromBranchId)
      );
      const itemSnapshot = await getDocs(itemQuery);

      if (!itemSnapshot.empty) {
        const inventoryDoc = itemSnapshot.docs[0];
        const inventoryItem = inventoryDoc.data() as InventoryItemExtended;

        // Clear pendingTransferOut
        const newPendingTransferOut = Math.max(0, (inventoryItem.pendingTransferOut || 0) - item.quantity);

        transaction.update(doc(db, 'inventory', inventoryDoc.id), {
          pendingTransferOut: newPendingTransferOut,
        });
      }
    }

    // Update transfer
    const auditEntry: TransferAuditEntry = {
      status: 'received',
      timestamp: Timestamp.now(),
      userId,
      userName,
      notes: discrepancies.length > 0 ? `Received with ${discrepancies.length} discrepancies` : 'Received successfully',
    };

    transaction.update(doc(db, 'inventoryTransfers', transferDoc.id), {
      status: 'received',
      receivedAt: Timestamp.now(),
      items: updatedItems,
      discrepancies: discrepancies.length > 0 ? discrepancies : undefined,
      auditTrail: [...transfer.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });
  });
}

/**
 * Cancel transfer and release reserved inventory
 *
 * @param transferId - Transfer ID
 * @param userId - UID of user cancelling
 * @param userName - Name of user cancelling
 * @param reason - Reason for cancellation
 */
export async function cancelTransfer(
  transferId: string,
  userId: string,
  userName: string,
  reason?: string
): Promise<void> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  await runTransaction(db, async (transaction) => {
    // Get transfer
    const transfersRef = collection(db, 'inventoryTransfers');
    const q = query(transfersRef, where('transferId', '==', transferId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    const transferDoc = snapshot.docs[0];
    const transfer = transferDoc.data() as InventoryTransfer;

    // Can only cancel draft, requested, or approved transfers
    if (!['draft', 'requested', 'approved'].includes(transfer.status)) {
      throw new Error('Cannot cancel transfer in current status');
    }

    // If approved, release reserved inventory
    if (transfer.status === 'approved') {
      for (const item of transfer.items) {
        const inventoryRef = collection(db, 'inventory');
        const itemQuery = query(
          inventoryRef,
          where('itemId', '==', item.inventoryItemId),
          where('branchId', '==', transfer.fromBranchId)
        );
        const itemSnapshot = await getDocs(itemQuery);

        if (!itemSnapshot.empty) {
          const inventoryDoc = itemSnapshot.docs[0];
          const inventoryItem = inventoryDoc.data() as InventoryItemExtended;

          // Restore quantities
          const newOnHand = (inventoryItem.onHand || inventoryItem.quantity) + item.quantity;
          const newPendingTransferOut = Math.max(0, (inventoryItem.pendingTransferOut || 0) - item.quantity);

          transaction.update(doc(db, 'inventory', inventoryDoc.id), {
            onHand: newOnHand,
            pendingTransferOut: newPendingTransferOut,
          });
        }
      }
    }

    // Update transfer status
    const auditEntry: TransferAuditEntry = {
      status: 'cancelled',
      timestamp: Timestamp.now(),
      userId,
      userName,
      notes: reason || 'Transfer cancelled',
    };

    transaction.update(doc(db, 'inventoryTransfers', transferDoc.id), {
      status: 'cancelled',
      auditTrail: [...transfer.auditTrail, auditEntry],
      updatedAt: Timestamp.now(),
    });
  });
}

/**
 * Get transfer by ID
 *
 * @param transferId - Transfer ID
 * @returns Transfer data or null
 */
export async function getTransferById(transferId: string): Promise<InventoryTransfer | null> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const q = query(
    collection(db, 'inventoryTransfers'),
    where('transferId', '==', transferId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as InventoryTransfer;
}

/**
 * Get transfers for a branch
 *
 * @param branchId - Branch ID
 * @param direction - 'from' or 'to' to filter by fromBranchId or toBranchId
 * @param status - Optional status filter
 * @returns Array of transfers
 */
export async function getTransfersByBranch(
  branchId: string,
  direction: 'from' | 'to' | 'both' = 'both',
  status?: InventoryTransferStatus
): Promise<InventoryTransfer[]> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const constraints: QueryConstraint[] = [];

  if (direction === 'from') {
    constraints.push(where('fromBranchId', '==', branchId));
  } else if (direction === 'to') {
    constraints.push(where('toBranchId', '==', branchId));
  }
  // For 'both', we'll need to query twice

  if (status) {
    constraints.push(where('status', '==', status));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  if (direction === 'both') {
    // Query both from and to
    const fromQuery = query(
      collection(db, 'inventoryTransfers'),
      where('fromBranchId', '==', branchId),
      ...(status ? [where('status', '==', status)] : []),
      orderBy('createdAt', 'desc')
    );
    const toQuery = query(
      collection(db, 'inventoryTransfers'),
      where('toBranchId', '==', branchId),
      ...(status ? [where('status', '==', status)] : []),
      orderBy('createdAt', 'desc')
    );

    const [fromSnapshot, toSnapshot] = await Promise.all([
      getDocs(fromQuery),
      getDocs(toQuery),
    ]);

    const transfers: InventoryTransfer[] = [];
    fromSnapshot.forEach((doc) => transfers.push(doc.data() as InventoryTransfer));
    toSnapshot.forEach((doc) => transfers.push(doc.data() as InventoryTransfer));

    // Sort by createdAt desc
    transfers.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return transfers;
  } else {
    const q = query(collection(db, 'inventoryTransfers'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as InventoryTransfer);
  }
}
