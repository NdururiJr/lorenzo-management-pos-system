/**
 * Payment Processing Service (Server-Side Only)
 *
 * This module contains server-only payment functions that use firebase-admin.
 * DO NOT import this file in client-side code - it will break the build.
 *
 * For client-side payment operations, use payment-service.ts instead.
 *
 * @module lib/payments/payment-service.server
 */

import { adminDb } from '../firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  getTransactionByPesapalRef,
  getTransaction,
  updateTransactionStatus,
} from '../db/transactions';
import { getTransactionStatus, mapPesapalStatus } from '../../services/pesapal';
import type {
  PaymentStatusResult,
  PaymentCallbackData,
} from './payment-types';

/**
 * Handle Pesapal payment callback (IPN)
 *
 * Called when Pesapal sends payment notification.
 * Updates transaction status and order payment status ATOMICALLY.
 * NOTE: This should only be called from server-side code (API routes/webhooks).
 *
 * Uses atomic batch writes to prevent race conditions under high load.
 *
 * @param callbackData - Callback data from Pesapal
 */
export async function handlePaymentCallback(
  callbackData: PaymentCallbackData
): Promise<void> {
  try {
    // Get transaction by Pesapal reference
    const transaction = await getTransactionByPesapalRef(
      callbackData.orderTrackingId
    );

    if (!transaction) {
      console.error(
        'Transaction not found for Pesapal ref:',
        callbackData.orderTrackingId
      );
      return;
    }

    // Query Pesapal for latest payment status
    const pesapalStatus = await getTransactionStatus(
      callbackData.orderTrackingId
    );

    if (!pesapalStatus) {
      console.error('Failed to get payment status from Pesapal');
      return;
    }

    // Map Pesapal status to application status
    const status = mapPesapalStatus(pesapalStatus.status);

    // Skip if status hasn't changed
    if (status === transaction.status) {
      console.log(`Payment status unchanged for ${transaction.transactionId}: ${status}`);
      return;
    }

    // Use atomic batch write for transaction + order updates (prevents race conditions)
    const batch = adminDb.batch();

    // 1. Update transaction status
    const transactionRef = adminDb.collection('transactions').doc(transaction.transactionId);
    batch.update(transactionRef, {
      status,
      metadata: {
        ...transaction.metadata,
        gatewayResponse: pesapalStatus.statusDescription,
        mpesaTransactionCode: pesapalStatus.confirmationCode,
        callbackTimestamp: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
    });

    // 2. If payment completed and has order, update order payment status atomically
    if (status === 'completed' && transaction.orderId) {
      const orderRef = adminDb.collection('orders').doc(transaction.orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        const order = orderDoc.data();
        const currentPaidAmount = order?.paidAmount || 0;
        const totalAmount = order?.totalAmount || 0;
        const newPaidAmount = currentPaidAmount + transaction.amount;

        let paymentStatus: string;
        if (newPaidAmount >= totalAmount) {
          paymentStatus = newPaidAmount > totalAmount ? 'overpaid' : 'paid';
        } else if (newPaidAmount > 0) {
          paymentStatus = 'partial';
        } else {
          paymentStatus = 'pending';
        }

        batch.update(orderRef, {
          paidAmount: FieldValue.increment(transaction.amount),
          paymentStatus,
          paymentMethod: transaction.method,
          lastPaymentAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // 3. Update daily stats counter for O(1) dashboard queries
        const today = new Date().toISOString().split('T')[0];
        const branchId = order?.branchId || transaction.branchId;
        const dailyStatsRef = adminDb.collection('dailyStats').doc(`${branchId}_${today}`);
        batch.set(
          dailyStatsRef,
          {
            branchId,
            date: today,
            totalRevenue: FieldValue.increment(transaction.amount),
            transactionCount: FieldValue.increment(1),
            lastUpdated: Timestamp.now(),
          },
          { merge: true }
        );
      }
    }

    // Commit all updates atomically
    await batch.commit();

    console.log(
      `Payment callback processed atomically for transaction ${transaction.transactionId}: ${status}`
    );
  } catch (error) {
    console.error('Payment callback handling error:', error);
    throw error;
  }
}

/**
 * Check payment status (Server-side version)
 *
 * Queries transaction status from database and optionally from Pesapal.
 * NOTE: This should only be called from server-side code (API routes/webhooks).
 *
 * @param transactionId - Transaction ID
 * @param checkPesapal - Whether to query Pesapal for latest status
 * @returns Payment status result
 */
export async function checkPaymentStatusServer(
  transactionId: string,
  checkPesapal = false
): Promise<PaymentStatusResult | null> {
  try {
    const transaction = await getTransaction(transactionId);

    if (!transaction) {
      return null;
    }

    // If transaction has Pesapal ref and checkPesapal is true, query Pesapal
    if (checkPesapal && transaction.pesapalRef) {
      const pesapalStatus = await getTransactionStatus(
        transaction.pesapalRef
      );

      if (pesapalStatus) {
        const status = mapPesapalStatus(pesapalStatus.status);

        // Update transaction if status has changed
        if (status !== transaction.status) {
          await updateTransactionStatus(transaction.transactionId, status, {
            gatewayResponse: pesapalStatus.statusDescription,
            mpesaTransactionCode: pesapalStatus.confirmationCode,
          });

          // Return updated status
          return {
            transactionId: transaction.transactionId,
            orderId: transaction.orderId,
            status,
            amount: transaction.amount,
            method: transaction.method,
            timestamp: transaction.timestamp.toDate(),
            metadata: {
              pesapalStatus: pesapalStatus.status,
              statusDescription: pesapalStatus.statusDescription,
            },
          };
        }
      }
    }

    // Return current status from database
    return {
      transactionId: transaction.transactionId,
      orderId: transaction.orderId,
      status: transaction.status,
      amount: transaction.amount,
      method: transaction.method,
      timestamp: transaction.timestamp.toDate(),
      metadata: transaction.metadata,
    };
  } catch (error) {
    console.error('Payment status check error:', error);
    return null;
  }
}

/**
 * Retry failed payment (Server-side version)
 *
 * Creates a new payment attempt for a failed transaction.
 * NOTE: This should only be called from server-side code.
 *
 * @param transactionId - Original transaction ID
 * @returns Information needed to retry the payment
 */
export async function getRetryPaymentData(transactionId: string): Promise<{
  success: boolean;
  error?: string;
  data?: {
    orderId: string;
    customerId: string;
    amount: number;
    method: 'mpesa' | 'card';
    customerPhone: string;
    customerEmail: string;
    processedBy: string;
  };
}> {
  try {
    const transaction = await getTransaction(transactionId);

    if (!transaction) {
      return {
        success: false,
        error: 'Original transaction not found',
      };
    }

    if (transaction.status !== 'failed') {
      return {
        success: false,
        error: 'Can only retry failed transactions',
      };
    }

    if (
      transaction.method !== 'mpesa' &&
      transaction.method !== 'card'
    ) {
      return {
        success: false,
        error: 'Payment retry not supported for this payment method',
      };
    }

    if (!transaction.orderId) {
      return {
        success: false,
        error: 'Cannot retry payment without an order ID',
      };
    }

    // Get customer details
    const { getCustomer } = await import('../db/customers');
    const customer = await getCustomer(transaction.customerId);

    return {
      success: true,
      data: {
        orderId: transaction.orderId,
        customerId: transaction.customerId,
        amount: transaction.amount,
        method: transaction.method,
        customerPhone: customer.phone,
        customerEmail: customer.email || '',
        processedBy: transaction.processedBy,
      },
    };
  } catch (error) {
    console.error('Payment retry data error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get retry payment data',
    };
  }
}
