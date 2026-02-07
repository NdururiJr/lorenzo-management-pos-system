/**
 * Cash Out Transactions Database Operations
 *
 * V2.0: Manages cash-out transactions for uncollected garments,
 * discounts, compensations, and order cancellations.
 * Includes approval workflow for financial accountability.
 *
 * @module lib/db/cash-out
 */

import { Timestamp, where, orderBy } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';

/**
 * Cash out transaction type
 */
export type CashOutType =
  | 'uncollected_garment' // Disposal of uncollected items after 90 days
  | 'discount' // Discount given to customer
  | 'compensation' // Compensation for damage/loss
  | 'order_cancellation' // Refund for cancelled order
  | 'price_adjustment' // Price correction/adjustment
  | 'loyalty_redemption'; // Loyalty points redemption

/**
 * Approval status
 */
export type CashOutApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Cash out transaction document structure
 */
export interface CashOutTransaction {
  /** Unique transaction ID */
  transactionId: string;
  /** Type of cash out */
  transactionType: CashOutType;
  /** Reference to order (if applicable) */
  orderId?: string;
  /** Order display ID */
  orderDisplayId?: string;
  /** Customer ID */
  customerId?: string;
  /** Customer name */
  customerName?: string;
  /** Branch ID where transaction occurred */
  branchId: string;
  /** Branch name */
  branchName?: string;
  /** Amount to cash out (positive = money out, negative = money in) */
  amount: number;
  /** Detailed reason for the cash out */
  reason: string;
  /** Category for reporting */
  reasonCategory?: string;
  /** Supporting documentation (photo URLs) */
  supportingDocs?: string[];
  /** User who requested the cash out */
  requestedBy: string;
  /** Requester name */
  requestedByName: string;
  /** Approval status */
  approvalStatus: CashOutApprovalStatus;
  /** User who approved/rejected */
  approvedBy?: string;
  /** Approver name */
  approvedByName?: string;
  /** Approval/rejection timestamp */
  approvalDate?: Timestamp;
  /** Notes from approver */
  approvalNotes?: string;
  /** Whether payment has been processed */
  isProcessed: boolean;
  /** Processing timestamp */
  processedAt?: Timestamp;
  /** Processed by */
  processedBy?: string;
  /** Payment method used for refund (if applicable) */
  paymentMethod?: 'cash' | 'mpesa' | 'bank_transfer' | 'credit';
  /** Payment reference */
  paymentReference?: string;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Daily cash out summary for reporting
 */
export interface DailyCashOutSummary {
  date: string;
  branchId: string;
  totalAmount: number;
  transactionCount: number;
  byType: Record<CashOutType, { count: number; amount: number }>;
  pendingApprovals: number;
  approvedAmount: number;
  rejectedAmount: number;
}

/**
 * Generate transaction ID
 */
export function generateCashOutId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `COT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Approval threshold configuration
 * Transactions above these amounts require higher-level approval
 */
export const CASH_OUT_CONFIG = {
  /** Manager can approve up to this amount */
  managerApprovalLimit: 5000,
  /** GM required for amounts above manager limit */
  gmApprovalLimit: 20000,
  /** Director required for amounts above GM limit */
  directorApprovalLimit: Infinity,
  /** Reason categories for reporting */
  reasonCategories: [
    'uncollected_disposal',
    'quality_issue',
    'service_failure',
    'customer_complaint',
    'pricing_error',
    'order_cancelled_by_customer',
    'order_cancelled_by_staff',
    'other',
  ],
};

/**
 * Create a cash out transaction request
 */
export async function createCashOutRequest(data: {
  transactionType: CashOutType;
  orderId?: string;
  orderDisplayId?: string;
  customerId?: string;
  customerName?: string;
  branchId: string;
  branchName?: string;
  amount: number;
  reason: string;
  reasonCategory?: string;
  supportingDocs?: string[];
  requestedBy: string;
  requestedByName: string;
}): Promise<string> {
  try {
    const transactionId = generateCashOutId();

    const transaction: CashOutTransaction = {
      transactionId,
      transactionType: data.transactionType,
      orderId: data.orderId,
      orderDisplayId: data.orderDisplayId,
      customerId: data.customerId,
      customerName: data.customerName,
      branchId: data.branchId,
      branchName: data.branchName,
      amount: data.amount,
      reason: data.reason,
      reasonCategory: data.reasonCategory,
      supportingDocs: data.supportingDocs,
      requestedBy: data.requestedBy,
      requestedByName: data.requestedByName,
      approvalStatus: 'pending',
      isProcessed: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDocument('cashOutTransactions', transactionId, transaction);

    return transactionId;
  } catch (error) {
    throw new DatabaseError('Failed to create cash out request', error);
  }
}

/**
 * Approve a cash out transaction
 */
export async function approveCashOut(
  transactionId: string,
  approvedBy: string,
  approvedByName: string,
  notes?: string
): Promise<void> {
  try {
    const transaction = await getDocument<CashOutTransaction>('cashOutTransactions', transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.approvalStatus !== 'pending') {
      throw new Error('Transaction has already been processed');
    }

    await updateDocument('cashOutTransactions', transactionId, {
      approvalStatus: 'approved' as CashOutApprovalStatus,
      approvedBy,
      approvedByName,
      approvalDate: Timestamp.now(),
      approvalNotes: notes,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to approve cash out', error);
  }
}

/**
 * Reject a cash out transaction
 */
export async function rejectCashOut(
  transactionId: string,
  rejectedBy: string,
  rejectedByName: string,
  reason: string
): Promise<void> {
  try {
    const transaction = await getDocument<CashOutTransaction>('cashOutTransactions', transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.approvalStatus !== 'pending') {
      throw new Error('Transaction has already been processed');
    }

    await updateDocument('cashOutTransactions', transactionId, {
      approvalStatus: 'rejected' as CashOutApprovalStatus,
      approvedBy: rejectedBy,
      approvedByName: rejectedByName,
      approvalDate: Timestamp.now(),
      approvalNotes: reason,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to reject cash out', error);
  }
}

/**
 * Mark cash out as processed (payment made)
 */
export async function processCashOut(
  transactionId: string,
  processedBy: string,
  paymentMethod: CashOutTransaction['paymentMethod'],
  paymentReference?: string
): Promise<void> {
  try {
    const transaction = await getDocument<CashOutTransaction>('cashOutTransactions', transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.approvalStatus !== 'approved') {
      throw new Error('Transaction must be approved before processing');
    }

    if (transaction.isProcessed) {
      throw new Error('Transaction has already been processed');
    }

    await updateDocument('cashOutTransactions', transactionId, {
      isProcessed: true,
      processedAt: Timestamp.now(),
      processedBy,
      paymentMethod,
      paymentReference,
      updatedAt: Timestamp.now(),
    });

    // If linked to an order, update the order record
    if (transaction.orderId) {
      await updateDocument('orders', transaction.orderId, {
        hasCashOut: true,
        cashOutTransactionId: transactionId,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new DatabaseError('Failed to process cash out', error);
  }
}

/**
 * Get pending cash out requests
 */
export async function getPendingCashOuts(
  branchId?: string
): Promise<CashOutTransaction[]> {
  try {
    const constraints = [
      where('approvalStatus', '==', 'pending'),
      orderBy('createdAt', 'asc'),
    ];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    return getDocuments<CashOutTransaction>('cashOutTransactions', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get pending cash outs', error);
  }
}

/**
 * Get approved but unprocessed cash outs
 */
export async function getUnprocessedCashOuts(
  branchId?: string
): Promise<CashOutTransaction[]> {
  try {
    const constraints = [
      where('approvalStatus', '==', 'approved'),
      where('isProcessed', '==', false),
      orderBy('approvalDate', 'asc'),
    ];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    return getDocuments<CashOutTransaction>('cashOutTransactions', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get unprocessed cash outs', error);
  }
}

/**
 * Get cash out transactions by date range
 */
export async function getCashOutsByDateRange(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<CashOutTransaction[]> {
  try {
    const constraints = [
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc'),
    ];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    return getDocuments<CashOutTransaction>('cashOutTransactions', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get cash outs by date range', error);
  }
}

/**
 * Get cash out statistics for reporting
 */
export async function getCashOutStats(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<{
  totalAmount: number;
  totalCount: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  processedCount: number;
  processedAmount: number;
  byType: Record<CashOutType, { count: number; amount: number }>;
  byCategory: Record<string, { count: number; amount: number }>;
}> {
  try {
    const transactions = await getCashOutsByDateRange(startDate, endDate, branchId);

    const stats = {
      totalAmount: 0,
      totalCount: transactions.length,
      pendingCount: 0,
      pendingAmount: 0,
      approvedCount: 0,
      approvedAmount: 0,
      rejectedCount: 0,
      rejectedAmount: 0,
      processedCount: 0,
      processedAmount: 0,
      byType: {} as Record<CashOutType, { count: number; amount: number }>,
      byCategory: {} as Record<string, { count: number; amount: number }>,
    };

    // Initialize byType
    const types: CashOutType[] = [
      'uncollected_garment',
      'discount',
      'compensation',
      'order_cancellation',
      'price_adjustment',
      'loyalty_redemption',
    ];
    for (const type of types) {
      stats.byType[type] = { count: 0, amount: 0 };
    }

    for (const txn of transactions) {
      stats.totalAmount += txn.amount;

      // By status
      switch (txn.approvalStatus) {
        case 'pending':
          stats.pendingCount++;
          stats.pendingAmount += txn.amount;
          break;
        case 'approved':
          stats.approvedCount++;
          stats.approvedAmount += txn.amount;
          if (txn.isProcessed) {
            stats.processedCount++;
            stats.processedAmount += txn.amount;
          }
          break;
        case 'rejected':
          stats.rejectedCount++;
          stats.rejectedAmount += txn.amount;
          break;
      }

      // By type
      if (stats.byType[txn.transactionType]) {
        stats.byType[txn.transactionType].count++;
        stats.byType[txn.transactionType].amount += txn.amount;
      }

      // By category
      const category = txn.reasonCategory || 'other';
      if (!stats.byCategory[category]) {
        stats.byCategory[category] = { count: 0, amount: 0 };
      }
      stats.byCategory[category].count++;
      stats.byCategory[category].amount += txn.amount;
    }

    return stats;
  } catch (error) {
    throw new DatabaseError('Failed to get cash out stats', error);
  }
}

/**
 * Get daily summary for a branch
 */
export async function getDailyCashOutSummary(
  date: Date,
  branchId: string
): Promise<DailyCashOutSummary> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await getCashOutsByDateRange(startOfDay, endOfDay, branchId);

    const byType: Record<CashOutType, { count: number; amount: number }> = {
      uncollected_garment: { count: 0, amount: 0 },
      discount: { count: 0, amount: 0 },
      compensation: { count: 0, amount: 0 },
      order_cancellation: { count: 0, amount: 0 },
      price_adjustment: { count: 0, amount: 0 },
      loyalty_redemption: { count: 0, amount: 0 },
    };

    let totalAmount = 0;
    let pendingApprovals = 0;
    let approvedAmount = 0;
    let rejectedAmount = 0;

    for (const txn of transactions) {
      totalAmount += txn.amount;
      byType[txn.transactionType].count++;
      byType[txn.transactionType].amount += txn.amount;

      if (txn.approvalStatus === 'pending') {
        pendingApprovals++;
      } else if (txn.approvalStatus === 'approved') {
        approvedAmount += txn.amount;
      } else if (txn.approvalStatus === 'rejected') {
        rejectedAmount += txn.amount;
      }
    }

    return {
      date: date.toISOString().split('T')[0],
      branchId,
      totalAmount,
      transactionCount: transactions.length,
      byType,
      pendingApprovals,
      approvedAmount,
      rejectedAmount,
    };
  } catch (error) {
    throw new DatabaseError('Failed to get daily cash out summary', error);
  }
}

/**
 * Create cash out for uncollected garment disposal
 */
export async function createDisposalCashOut(
  orderId: string,
  orderDisplayId: string,
  customerId: string,
  customerName: string,
  branchId: string,
  branchName: string,
  garmentValue: number,
  requestedBy: string,
  requestedByName: string,
  notes?: string
): Promise<string> {
  return createCashOutRequest({
    transactionType: 'uncollected_garment',
    orderId,
    orderDisplayId,
    customerId,
    customerName,
    branchId,
    branchName,
    amount: garmentValue,
    reason: notes || `Disposal of uncollected garments after 90 days - Order ${orderDisplayId}`,
    reasonCategory: 'uncollected_disposal',
    requestedBy,
    requestedByName,
  });
}

/**
 * Create cash out for order cancellation refund
 */
export async function createCancellationRefund(
  orderId: string,
  orderDisplayId: string,
  customerId: string,
  customerName: string,
  branchId: string,
  branchName: string,
  refundAmount: number,
  requestedBy: string,
  requestedByName: string,
  reason: string,
  cancelledByCustomer: boolean = true
): Promise<string> {
  return createCashOutRequest({
    transactionType: 'order_cancellation',
    orderId,
    orderDisplayId,
    customerId,
    customerName,
    branchId,
    branchName,
    amount: refundAmount,
    reason,
    reasonCategory: cancelledByCustomer ? 'order_cancelled_by_customer' : 'order_cancelled_by_staff',
    requestedBy,
    requestedByName,
  });
}

/**
 * Create compensation cash out for damage/loss
 */
export async function createCompensation(
  orderId: string,
  orderDisplayId: string,
  customerId: string,
  customerName: string,
  branchId: string,
  branchName: string,
  compensationAmount: number,
  requestedBy: string,
  requestedByName: string,
  reason: string,
  supportingDocs?: string[]
): Promise<string> {
  return createCashOutRequest({
    transactionType: 'compensation',
    orderId,
    orderDisplayId,
    customerId,
    customerName,
    branchId,
    branchName,
    amount: compensationAmount,
    reason,
    reasonCategory: 'quality_issue',
    supportingDocs,
    requestedBy,
    requestedByName,
  });
}
