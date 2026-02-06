/**
 * Inventory Transactions Database Operations
 *
 * V2.0: Complete inventory transaction tracking for all stock movements.
 * Tracks adjustments, usage, receipts, returns, and transfers.
 *
 * @module lib/db/inventory-transactions
 */

import { Timestamp, where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type { InventoryItemExtended } from './schema';

/**
 * Transaction type enumeration
 */
export type InventoryTransactionType =
  | 'receipt' // Stock received from supplier
  | 'adjustment_in' // Manual adjustment increase
  | 'adjustment_out' // Manual adjustment decrease
  | 'usage' // Consumed in operations
  | 'transfer_out' // Transferred to another branch
  | 'transfer_in' // Received from another branch
  | 'return' // Returned from customer/usage
  | 'damage' // Damaged/write-off
  | 'expired'; // Expired items removed

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

/**
 * Inventory transaction document structure
 */
export interface InventoryTransaction {
  /** Unique transaction ID */
  transactionId: string;
  /** Reference to the inventory item */
  inventoryItemId: string;
  /** Item name (denormalized) */
  itemName: string;
  /** Branch where the transaction occurred */
  branchId: string;
  /** Type of transaction */
  transactionType: InventoryTransactionType;
  /** Quantity affected (positive for in, negative for out) */
  quantity: number;
  /** Unit of measurement */
  unit: string;
  /** Stock level before transaction */
  stockBefore: number;
  /** Stock level after transaction */
  stockAfter: number;
  /** Status of the transaction */
  status: TransactionStatus;
  /** User who recorded the transaction */
  recordedBy: string;
  /** User name (denormalized) */
  recordedByName: string;
  /** Reason/notes for the transaction */
  reason?: string;
  /** Reference document (PO number, transfer ID, etc.) */
  referenceId?: string;
  /** Reference type */
  referenceType?: 'purchase_order' | 'transfer' | 'order' | 'manual';
  /** Cost per unit at time of transaction (for valuation) */
  unitCost?: number;
  /** Total value of transaction */
  totalValue?: number;
  /** Supplier ID (for receipts) */
  supplierId?: string;
  /** Supplier name (denormalized) */
  supplierName?: string;
  /** Batch/lot number */
  batchNumber?: string;
  /** Expiry date for perishables */
  expiryDate?: Timestamp;
  /** Approved by (for adjustments requiring approval) */
  approvedBy?: string;
  /** Approval timestamp */
  approvedAt?: Timestamp;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Stock adjustment request (for approval workflow)
 */
export interface StockAdjustmentRequest {
  /** Unique request ID */
  requestId: string;
  /** Inventory item ID */
  inventoryItemId: string;
  /** Item name (denormalized) */
  itemName: string;
  /** Branch ID */
  branchId: string;
  /** Type of adjustment */
  adjustmentType: 'increase' | 'decrease';
  /** Quantity to adjust */
  quantity: number;
  /** Unit */
  unit: string;
  /** Current stock level */
  currentStock: number;
  /** Reason for adjustment */
  reason: string;
  /** Category of reason */
  reasonCategory: 'damage' | 'theft' | 'count_correction' | 'expired' | 'other';
  /** Supporting photos */
  photos?: string[];
  /** Requested by */
  requestedBy: string;
  /** Requestor name */
  requestedByName: string;
  /** Status */
  status: 'pending' | 'approved' | 'rejected';
  /** Approved/Rejected by */
  reviewedBy?: string;
  /** Reviewer name */
  reviewedByName?: string;
  /** Review timestamp */
  reviewedAt?: Timestamp;
  /** Review notes */
  reviewNotes?: string;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Generate transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate adjustment request ID
 */
export function generateAdjustmentRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ADJ-${timestamp}-${random}`.toUpperCase();
}

/**
 * Record an inventory transaction
 */
export async function recordInventoryTransaction(
  data: Omit<InventoryTransaction, 'transactionId' | 'createdAt' | 'updatedAt' | 'stockBefore' | 'stockAfter'>
): Promise<string> {
  try {
    const transactionId = generateTransactionId();

    // Get current inventory item to calculate stock levels
    const inventoryItem = await getDocument<InventoryItemExtended>('inventory', data.inventoryItemId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    const stockBefore = inventoryItem.onHand ?? inventoryItem.quantity ?? 0;
    const stockAfter = stockBefore + data.quantity;

    // Validate stock won't go negative for outbound transactions
    if (stockAfter < 0) {
      throw new Error(`Insufficient stock. Current: ${stockBefore}, Requested: ${Math.abs(data.quantity)}`);
    }

    const transaction: InventoryTransaction = {
      ...data,
      transactionId,
      stockBefore,
      stockAfter,
      status: 'completed',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Update the inventory item stock level
    await updateDocument('inventory', data.inventoryItemId, {
      onHand: stockAfter,
      quantity: stockAfter,
      lastTransactionId: transactionId,
      lastTransactionDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Record the transaction
    await setDocument('inventoryTransactions', transactionId, transaction);

    return transactionId;
  } catch (error) {
    throw new DatabaseError('Failed to record inventory transaction', error);
  }
}

/**
 * Record stock receipt (from supplier)
 */
export async function recordStockReceipt(
  inventoryItemId: string,
  itemName: string,
  branchId: string,
  quantity: number,
  unit: string,
  recordedBy: string,
  recordedByName: string,
  options?: {
    supplierId?: string;
    supplierName?: string;
    purchaseOrderId?: string;
    unitCost?: number;
    batchNumber?: string;
    expiryDate?: Date;
    notes?: string;
  }
): Promise<string> {
  return recordInventoryTransaction({
    inventoryItemId,
    itemName,
    branchId,
    transactionType: 'receipt',
    quantity: Math.abs(quantity), // Ensure positive
    unit,
    recordedBy,
    recordedByName,
    status: 'completed',
    supplierId: options?.supplierId,
    supplierName: options?.supplierName,
    referenceId: options?.purchaseOrderId,
    referenceType: options?.purchaseOrderId ? 'purchase_order' : 'manual',
    unitCost: options?.unitCost,
    totalValue: options?.unitCost ? options.unitCost * quantity : undefined,
    batchNumber: options?.batchNumber,
    expiryDate: options?.expiryDate ? Timestamp.fromDate(options.expiryDate) : undefined,
    reason: options?.notes,
  });
}

/**
 * Record stock usage (consumption)
 */
export async function recordStockUsage(
  inventoryItemId: string,
  itemName: string,
  branchId: string,
  quantity: number,
  unit: string,
  recordedBy: string,
  recordedByName: string,
  options?: {
    orderId?: string;
    reason?: string;
  }
): Promise<string> {
  return recordInventoryTransaction({
    inventoryItemId,
    itemName,
    branchId,
    transactionType: 'usage',
    quantity: -Math.abs(quantity), // Ensure negative for usage
    unit,
    recordedBy,
    recordedByName,
    status: 'completed',
    referenceId: options?.orderId,
    referenceType: options?.orderId ? 'order' : 'manual',
    reason: options?.reason,
  });
}

/**
 * Create stock adjustment request (for approval workflow)
 */
export async function createAdjustmentRequest(
  data: Omit<StockAdjustmentRequest, 'requestId' | 'createdAt' | 'updatedAt' | 'status' | 'currentStock'>
): Promise<string> {
  try {
    const requestId = generateAdjustmentRequestId();

    // Get current stock level
    const inventoryItem = await getDocument<InventoryItemExtended>('inventory', data.inventoryItemId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }

    const currentStock = inventoryItem.onHand ?? inventoryItem.quantity ?? 0;

    const request: StockAdjustmentRequest = {
      ...data,
      requestId,
      currentStock,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDocument('stockAdjustmentRequests', requestId, request);
    return requestId;
  } catch (error) {
    throw new DatabaseError('Failed to create adjustment request', error);
  }
}

/**
 * Approve stock adjustment request
 */
export async function approveAdjustmentRequest(
  requestId: string,
  reviewedBy: string,
  reviewedByName: string,
  reviewNotes?: string
): Promise<string> {
  try {
    const request = await getDocument<StockAdjustmentRequest>('stockAdjustmentRequests', requestId);
    if (!request) {
      throw new Error('Adjustment request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request has already been processed');
    }

    // Record the transaction
    const quantity = request.adjustmentType === 'increase' ? request.quantity : -request.quantity;
    const transactionType: InventoryTransactionType = request.adjustmentType === 'increase'
      ? 'adjustment_in'
      : 'adjustment_out';

    const transactionId = await recordInventoryTransaction({
      inventoryItemId: request.inventoryItemId,
      itemName: request.itemName,
      branchId: request.branchId,
      transactionType,
      quantity,
      unit: request.unit,
      recordedBy: request.requestedBy,
      recordedByName: request.requestedByName,
      status: 'completed',
      reason: `${request.reasonCategory}: ${request.reason}`,
      referenceId: requestId,
      referenceType: 'manual',
      approvedBy: reviewedBy,
      approvedAt: Timestamp.now(),
    });

    // Update the request status
    await updateDocument('stockAdjustmentRequests', requestId, {
      status: 'approved',
      reviewedBy,
      reviewedByName,
      reviewedAt: Timestamp.now(),
      reviewNotes,
      updatedAt: Timestamp.now(),
    });

    return transactionId;
  } catch (error) {
    throw new DatabaseError('Failed to approve adjustment request', error);
  }
}

/**
 * Reject stock adjustment request
 */
export async function rejectAdjustmentRequest(
  requestId: string,
  reviewedBy: string,
  reviewedByName: string,
  reviewNotes: string
): Promise<void> {
  try {
    const request = await getDocument<StockAdjustmentRequest>('stockAdjustmentRequests', requestId);
    if (!request) {
      throw new Error('Adjustment request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request has already been processed');
    }

    await updateDocument('stockAdjustmentRequests', requestId, {
      status: 'rejected',
      reviewedBy,
      reviewedByName,
      reviewedAt: Timestamp.now(),
      reviewNotes,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to reject adjustment request', error);
  }
}

/**
 * Get transaction history for an inventory item
 */
export async function getItemTransactions(
  inventoryItemId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: InventoryTransactionType;
    maxResults?: number;
  }
): Promise<InventoryTransaction[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('inventoryItemId', '==', inventoryItemId),
      orderBy('createdAt', 'desc'),
    ];

    if (options?.transactionType) {
      constraints.push(where('transactionType', '==', options.transactionType));
    }

    if (options?.startDate) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(options.startDate)));
    }

    if (options?.endDate) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(options.endDate)));
    }

    constraints.push(limit(options?.maxResults || 100));

    return getDocuments<InventoryTransaction>('inventoryTransactions', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get item transactions', error);
  }
}

/**
 * Get pending adjustment requests for a branch
 */
export async function getPendingAdjustments(
  branchId?: string
): Promise<StockAdjustmentRequest[]> {
  try {
    const constraints = [
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc'),
    ];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    return getDocuments<StockAdjustmentRequest>('stockAdjustmentRequests', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get pending adjustments', error);
  }
}

/**
 * Get inventory valuation report
 */
export async function getInventoryValuation(
  branchId?: string
): Promise<{
  totalItems: number;
  totalValue: number;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalValue: number;
  }>;
}> {
  try {
    const constraints = branchId ? [where('branchId', '==', branchId)] : [];

    const items = await getDocuments<InventoryItemExtended>('inventory', ...constraints);

    let totalValue = 0;
    const itemValuations = items.map(item => {
      const quantity = item.onHand ?? item.quantity ?? 0;
      const unitCost = item.costPerUnit ?? 0;
      const itemValue = quantity * unitCost;
      totalValue += itemValue;

      return {
        itemId: item.itemId,
        name: item.name,
        quantity,
        unit: item.unit,
        unitCost,
        totalValue: itemValue,
      };
    });

    return {
      totalItems: items.length,
      totalValue,
      items: itemValuations,
    };
  } catch (error) {
    throw new DatabaseError('Failed to get inventory valuation', error);
  }
}

/**
 * Get low stock alerts
 */
export async function getLowStockItems(
  branchId?: string
): Promise<Array<{
  item: InventoryItemExtended;
  currentStock: number;
  reorderLevel: number;
  deficit: number;
}>> {
  try {
    const constraints = branchId ? [where('branchId', '==', branchId)] : [];

    const items = await getDocuments<InventoryItemExtended>('inventory', ...constraints);

    return items
      .filter(item => {
        const currentStock = item.onHand ?? item.quantity ?? 0;
        const reorderLevel = item.reorderLevel ?? 0;
        return currentStock <= reorderLevel;
      })
      .map(item => {
        const currentStock = item.onHand ?? item.quantity ?? 0;
        const reorderLevel = item.reorderLevel ?? 0;
        return {
          item,
          currentStock,
          reorderLevel,
          deficit: reorderLevel - currentStock,
        };
      })
      .sort((a, b) => b.deficit - a.deficit);
  } catch (error) {
    throw new DatabaseError('Failed to get low stock items', error);
  }
}

/**
 * Get expiring items
 */
export async function getExpiringItems(
  branchId?: string,
  daysBeforeExpiry: number = 30
): Promise<Array<{
  item: InventoryItemExtended;
  expiryDate: Date;
  daysUntilExpiry: number;
}>> {
  try {
    const constraints = branchId ? [where('branchId', '==', branchId)] : [];

    const items = await getDocuments<InventoryItemExtended>('inventory', ...constraints);

    const today = new Date();
    const expiryThreshold = new Date();
    expiryThreshold.setDate(today.getDate() + daysBeforeExpiry);

    return items
      .filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = item.expiryDate.toDate();
        return expiryDate <= expiryThreshold;
      })
      .map(item => {
        const expiryDate = item.expiryDate!.toDate();
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          item,
          expiryDate,
          daysUntilExpiry,
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  } catch (error) {
    throw new DatabaseError('Failed to get expiring items', error);
  }
}

/**
 * Get transaction summary for reporting
 */
export async function getTransactionSummary(
  branchId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  receipts: { count: number; totalQuantity: number; totalValue: number };
  usage: { count: number; totalQuantity: number };
  adjustments: { count: number; netQuantity: number };
  transfers: { incoming: number; outgoing: number };
}> {
  try {
    const transactions = await getDocuments<InventoryTransaction>(
      'inventoryTransactions',
      where('branchId', '==', branchId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    );

    const summary = {
      receipts: { count: 0, totalQuantity: 0, totalValue: 0 },
      usage: { count: 0, totalQuantity: 0 },
      adjustments: { count: 0, netQuantity: 0 },
      transfers: { incoming: 0, outgoing: 0 },
    };

    for (const txn of transactions) {
      switch (txn.transactionType) {
        case 'receipt':
          summary.receipts.count++;
          summary.receipts.totalQuantity += txn.quantity;
          summary.receipts.totalValue += txn.totalValue || 0;
          break;
        case 'usage':
          summary.usage.count++;
          summary.usage.totalQuantity += Math.abs(txn.quantity);
          break;
        case 'adjustment_in':
        case 'adjustment_out':
          summary.adjustments.count++;
          summary.adjustments.netQuantity += txn.quantity;
          break;
        case 'transfer_in':
          summary.transfers.incoming += txn.quantity;
          break;
        case 'transfer_out':
          summary.transfers.outgoing += Math.abs(txn.quantity);
          break;
      }
    }

    return summary;
  } catch (error) {
    throw new DatabaseError('Failed to get transaction summary', error);
  }
}
