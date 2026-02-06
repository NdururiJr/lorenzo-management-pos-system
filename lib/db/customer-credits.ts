/**
 * Customer Credit Balance Operations (FR-005)
 *
 * This file provides operations for managing customer credit balances,
 * including advance payments, store credits, and credit applications.
 *
 * @module lib/db/customer-credits
 */

import { Timestamp } from 'firebase/firestore';
import {
  getDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type { Customer, PaymentType } from './schema';
import { createTransaction } from './transactions';

// ============================================
// CREDIT BALANCE OPERATIONS
// ============================================

/**
 * Get customer's current credit balance
 *
 * @param customerId - Customer ID
 * @returns Current credit balance (defaults to 0)
 */
export async function getCustomerCreditBalance(
  customerId: string
): Promise<number> {
  try {
    const customer = await getDocument<Customer>('customers', customerId);
    return customer.creditBalance || 0;
  } catch (error) {
    throw new DatabaseError('Failed to get customer credit balance', error);
  }
}

/**
 * Add credit to customer's balance (advance payment or store credit)
 *
 * @param params - Credit parameters
 * @returns Transaction ID
 */
export async function addCustomerCredit(params: {
  customerId: string;
  amount: number;
  branchId: string;
  processedBy: string;
  method: 'mpesa' | 'card'; // Cashless system - cash removed
  note?: string;
  pesapalRef?: string;
}): Promise<string> {
  const {
    customerId,
    amount,
    branchId,
    processedBy,
    method,
    note,
    pesapalRef,
  } = params;

  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  try {
    // Get current balance
    const customer = await getDocument<Customer>('customers', customerId);
    const currentBalance = customer.creditBalance || 0;
    const newBalance = currentBalance + amount;

    // Update customer credit balance
    await updateDocument<Customer>('customers', customerId, {
      creditBalance: newBalance,
      lastCreditUpdate: Timestamp.now(),
    });

    // Create transaction record
    const transactionId = await createTransaction({
      customerId,
      branchId,
      amount,
      method,
      paymentType: 'advance',
      processedBy,
      note: note || `Advance payment - Credit added to account`,
      pesapalRef,
    });

    return transactionId;
  } catch (error) {
    throw new DatabaseError('Failed to add customer credit', error);
  }
}

/**
 * Apply customer credit to an order
 *
 * @param params - Application parameters
 * @returns Amount applied and new balance
 */
export async function applyCustomerCredit(params: {
  customerId: string;
  orderId: string;
  amount: number;
  branchId: string;
  processedBy: string;
}): Promise<{ amountApplied: number; newBalance: number; transactionId: string }> {
  const { customerId, orderId, amount, branchId, processedBy } = params;

  try {
    // Get current balance
    const customer = await getDocument<Customer>('customers', customerId);
    const currentBalance = customer.creditBalance || 0;

    if (currentBalance <= 0) {
      throw new Error('Customer has no credit balance');
    }

    // Calculate amount to apply (can't exceed current balance)
    const amountToApply = Math.min(amount, currentBalance);
    const newBalance = currentBalance - amountToApply;

    // Update customer credit balance
    await updateDocument<Customer>('customers', customerId, {
      creditBalance: newBalance,
      lastCreditUpdate: Timestamp.now(),
    });

    // Create transaction record
    const transactionId = await createTransaction({
      orderId,
      customerId,
      branchId,
      amount: amountToApply,
      method: 'customer_credit',
      paymentType: 'credit_applied',
      processedBy,
      note: `Credit applied from customer balance`,
    });

    return {
      amountApplied: amountToApply,
      newBalance,
      transactionId,
    };
  } catch (error) {
    throw new DatabaseError('Failed to apply customer credit', error);
  }
}

/**
 * Refund to customer credit balance
 *
 * @param params - Refund parameters
 * @returns Transaction ID
 */
export async function refundToCustomerCredit(params: {
  customerId: string;
  orderId?: string;
  amount: number;
  branchId: string;
  processedBy: string;
  reason: string;
}): Promise<string> {
  const { customerId, orderId, amount, branchId, processedBy, reason } = params;

  if (amount <= 0) {
    throw new Error('Refund amount must be positive');
  }

  try {
    // Get current balance
    const customer = await getDocument<Customer>('customers', customerId);
    const currentBalance = customer.creditBalance || 0;
    const newBalance = currentBalance + amount;

    // Update customer credit balance
    await updateDocument<Customer>('customers', customerId, {
      creditBalance: newBalance,
      lastCreditUpdate: Timestamp.now(),
    });

    // Create transaction record (negative for refund display purposes)
    const transactionId = await createTransaction({
      orderId,
      customerId,
      branchId,
      amount,
      method: 'customer_credit',
      paymentType: 'refund',
      processedBy,
      note: `Refund: ${reason}`,
    });

    return transactionId;
  } catch (error) {
    throw new DatabaseError('Failed to refund to customer credit', error);
  }
}

// ============================================
// CREDIT HISTORY
// ============================================

/**
 * Credit transaction for display
 */
export interface CreditTransaction {
  transactionId: string;
  type: 'credit_added' | 'credit_applied' | 'refund';
  amount: number;
  orderId?: string;
  method: string;
  note?: string;
  timestamp: Date;
  processedBy: string;
  runningBalance?: number;
}

/**
 * Get customer credit history
 *
 * @param customerId - Customer ID
 * @returns Array of credit transactions
 */
export async function getCustomerCreditHistory(
  customerId: string
): Promise<CreditTransaction[]> {
  try {
    const { getDocuments } = await import('./index');
    const { where, orderBy, limit } = await import('firebase/firestore');

    // Get all credit-related transactions
    const transactions = await getDocuments<{
      transactionId: string;
      orderId?: string;
      amount: number;
      method: string;
      paymentType: PaymentType;
      note?: string;
      timestamp: { toDate: () => Date };
      processedBy: string;
    }>(
      'transactions',
      where('customerId', '==', customerId),
      where('paymentType', 'in', ['advance', 'credit_applied', 'refund']),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    return transactions.map((t) => ({
      transactionId: t.transactionId,
      type: t.paymentType === 'advance'
        ? 'credit_added'
        : t.paymentType === 'credit_applied'
          ? 'credit_applied'
          : 'refund',
      amount: t.amount,
      orderId: t.orderId,
      method: t.method,
      note: t.note,
      timestamp: t.timestamp.toDate(),
      processedBy: t.processedBy,
    }));
  } catch (error) {
    throw new DatabaseError('Failed to get customer credit history', error);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if customer has sufficient credit
 *
 * @param customerId - Customer ID
 * @param amount - Required amount
 * @returns Whether customer has sufficient credit
 */
export async function hassufficientCredit(
  customerId: string,
  amount: number
): Promise<boolean> {
  const balance = await getCustomerCreditBalance(customerId);
  return balance >= amount;
}

/**
 * Calculate recommended payment split using customer credit
 *
 * @param customerId - Customer ID
 * @param totalAmount - Total amount to pay
 * @returns Recommended split
 */
export async function calculatePaymentSplit(
  customerId: string,
  totalAmount: number
): Promise<{
  creditAmount: number;
  remainingAmount: number;
  hasCredit: boolean;
}> {
  const creditBalance = await getCustomerCreditBalance(customerId);
  const creditAmount = Math.min(creditBalance, totalAmount);
  const remainingAmount = totalAmount - creditAmount;

  return {
    creditAmount,
    remainingAmount,
    hasCredit: creditBalance > 0,
  };
}
