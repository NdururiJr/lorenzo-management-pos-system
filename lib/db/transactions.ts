/**
 * Transaction Database Operations
 *
 * This file provides type-safe CRUD operations for payment transactions.
 * Handles payment recording, retrieval, and status updates.
 *
 * @module lib/db/transactions
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
  Transaction,
  TransactionExtended,
  TransactionStatus,
  PaymentMethod,
} from './schema';
import { updateOrderPayment } from './orders';

/**
 * Generate a unique transaction ID
 * Format: TXN-[TIMESTAMP]-[RANDOM]
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `TXN-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a new transaction
 *
 * @param data - Transaction data
 * @returns The created transaction ID
 */
export async function createTransaction(
  data: Omit<
    TransactionExtended,
    'transactionId' | 'timestamp' | 'status'
  > & {
    status?: TransactionStatus;
  }
): Promise<string> {
  const transactionId = generateTransactionId();

  const transaction = {
    transactionId,
    orderId: data.orderId,
    customerId: data.customerId,
    amount: data.amount,
    method: data.method,
    status: data.status || 'pending',
    pesapalRef: data.pesapalRef,
    processedBy: data.processedBy,
    metadata: data.metadata,
    timestamp: Timestamp.now(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await setDocument<TransactionExtended>('transactions', transactionId, transaction as any);

  // If transaction is completed, update order payment status
  if (transaction.status === 'completed') {
    await updateOrderPayment(data.orderId, data.amount, data.method);
  }

  return transactionId;
}

/**
 * Get transaction by ID
 */
export async function getTransaction(
  transactionId: string
): Promise<TransactionExtended> {
  return getDocument<TransactionExtended>('transactions', transactionId);
}

/**
 * Update transaction status
 *
 * @param transactionId - Transaction ID
 * @param status - New status
 * @param metadata - Additional metadata (e.g., payment gateway response)
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  metadata?: TransactionExtended['metadata']
): Promise<void> {
  const transaction = await getTransaction(transactionId);

  const updates: Partial<TransactionExtended> = {
    status,
  };

  if (metadata) {
    updates.metadata = {
      ...transaction.metadata,
      ...metadata,
    };
  }

  await updateDocument<TransactionExtended>('transactions', transactionId, updates);

  // If transaction is now completed, update order payment status
  if (status === 'completed') {
    await updateOrderPayment(transaction.orderId, transaction.amount, transaction.method);
  }
}

/**
 * Get transactions by order
 */
export async function getTransactionsByOrder(
  orderId: string
): Promise<TransactionExtended[]> {
  return getDocuments<TransactionExtended>(
    'transactions',
    where('orderId', '==', orderId),
    orderBy('timestamp', 'desc')
  );
}

/**
 * Get transactions by customer
 */
export async function getTransactionsByCustomer(
  customerId: string,
  limitCount = 20
): Promise<TransactionExtended[]> {
  return getDocuments<TransactionExtended>(
    'transactions',
    where('customerId', '==', customerId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get transactions by status
 */
export async function getTransactionsByStatus(
  status: TransactionStatus,
  limitCount = 50
): Promise<TransactionExtended[]> {
  return getDocuments<TransactionExtended>(
    'transactions',
    where('status', '==', status),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get transactions by payment method
 */
export async function getTransactionsByMethod(
  method: PaymentMethod,
  limitCount = 50
): Promise<TransactionExtended[]> {
  return getDocuments<TransactionExtended>(
    'transactions',
    where('method', '==', method),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get pending transactions
 */
export async function getPendingTransactions(
  limitCount = 50
): Promise<TransactionExtended[]> {
  return getTransactionsByStatus('pending', limitCount);
}

/**
 * Get failed transactions
 */
export async function getFailedTransactions(
  limitCount = 50
): Promise<TransactionExtended[]> {
  return getTransactionsByStatus('failed', limitCount);
}

/**
 * Get transaction by Pesapal reference
 */
export async function getTransactionByPesapalRef(
  pesapalRef: string
): Promise<TransactionExtended | null> {
  try {
    const transactions = await getDocuments<TransactionExtended>(
      'transactions',
      where('pesapalRef', '==', pesapalRef),
      limit(1)
    );
    return transactions.length > 0 ? transactions[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get transaction by Pesapal ref', error);
  }
}

/**
 * Calculate total transactions for a customer
 */
export async function getCustomerTransactionTotal(
  customerId: string
): Promise<number> {
  const transactions = await getTransactionsByCustomer(customerId, 1000);
  const completedTransactions = transactions.filter(
    (t) => t.status === 'completed'
  );

  return completedTransactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total transactions for a period
 */
export async function getTransactionTotals(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  count: number;
  byMethod: Record<PaymentMethod, number>;
}> {
  const transactions = await getDocuments<TransactionExtended>(
    'transactions',
    where('timestamp', '>=', Timestamp.fromDate(startDate)),
    where('timestamp', '<=', Timestamp.fromDate(endDate)),
    where('status', '==', 'completed')
  );

  const totals = {
    total: 0,
    count: transactions.length,
    byMethod: {
      cash: 0,
      mpesa: 0,
      card: 0,
      credit: 0,
    } as Record<PaymentMethod, number>,
  };

  transactions.forEach((transaction) => {
    totals.total += transaction.amount;
    totals.byMethod[transaction.method] += transaction.amount;
  });

  return totals;
}

/**
 * Get today's transaction summary
 */
export async function getTodayTransactionSummary(): Promise<{
  total: number;
  count: number;
  cash: number;
  mpesa: number;
  card: number;
  credit: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totals = await getTransactionTotals(today, tomorrow);

  return {
    total: totals.total,
    count: totals.count,
    cash: totals.byMethod.cash,
    mpesa: totals.byMethod.mpesa,
    card: totals.byMethod.card,
    credit: totals.byMethod.credit,
  };
}
