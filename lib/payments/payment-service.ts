/**
 * Payment Processing Service (Client-Safe)
 *
 * This service handles payment operations that can run on the client:
 * - M-Pesa payments (via Pesapal) - initiates via API
 * - Card payments (via Pesapal) - initiates via API
 * - Credit payments
 * - Payment status checking via API
 *
 * For server-only operations (callbacks, direct DB access), use:
 * @see lib/payments/payment-service.server.ts
 *
 * @module lib/payments/payment-service
 */

import {
  createTransaction,
} from '../db/transactions';
import { getOrder } from '../db/orders';
import type {
  PaymentResult,
  DigitalPaymentData,
  CreditPaymentData,
  PaymentStatusResult,
} from './payment-types';

/**
 * Initiate digital payment (M-Pesa or Card via Pesapal)
 *
 * Calls the server-side API to initiate payment with Pesapal.
 * This avoids CORS issues by routing through our API.
 *
 * @param data - Digital payment data
 * @returns Payment result with redirect URL
 */
export async function initiateDigitalPayment(
  data: DigitalPaymentData
): Promise<PaymentResult> {
  try {
    // Validate amount on client side first
    if (data.amount <= 0) {
      return {
        success: false,
        error: 'Invalid payment amount',
      };
    }

    // Call server-side API to initiate payment (avoids CORS issues with Pesapal)
    const response = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: data.orderId,
        customerId: data.customerId,
        amount: data.amount,
        method: data.method,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || '',
        userId: data.userId,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || 'Failed to initiate payment',
      };
    }

    return {
      success: true,
      transactionId: result.transactionId,
      redirectUrl: result.redirectUrl,
      message: result.message || 'Payment initiated successfully',
    };
  } catch (error) {
    console.error('Digital payment initiation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate digital payment',
    };
  }
}

/**
 * Process credit payment
 *
 * Records a credit payment for customers with credit accounts.
 *
 * @param data - Credit payment data
 * @returns Payment result with transaction ID
 */
export async function processCreditPayment(
  data: CreditPaymentData
): Promise<PaymentResult> {
  try {
    // Validate amount
    if (data.amount <= 0) {
      return {
        success: false,
        error: 'Invalid payment amount',
      };
    }

    // Get order to verify it exists
    const order = await getOrder(data.orderId);

    const balanceDue = order.totalAmount - order.paidAmount;
    if (data.amount > balanceDue) {
      return {
        success: false,
        error: `Payment amount (KES ${data.amount}) exceeds balance due (KES ${balanceDue})`,
      };
    }

    // TODO: Check customer credit limit (future feature)
    // const customer = await getCustomer(data.customerId);
    // if (customer.creditLimit && customer.creditUsed + data.amount > customer.creditLimit) {
    //   return { success: false, error: 'Credit limit exceeded' };
    // }

    // Create transaction record
    const transactionId = await createTransaction({
      orderId: data.orderId,
      customerId: data.customerId,
      branchId: order.branchId,
      amount: data.amount,
      method: 'credit',
      status: 'completed', // Credit payments are recorded as completed
      paymentType: data.amount >= balanceDue ? 'full' : 'partial',
      processedBy: data.userId,
      note: data.creditNote,
    });

    return {
      success: true,
      transactionId,
      message: 'Credit payment recorded successfully',
    };
  } catch (error) {
    console.error('Credit payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process credit payment',
    };
  }
}

/**
 * Check payment status (Client-side version)
 *
 * Calls the API to check transaction status. Use this from client-side code.
 *
 * @param transactionId - Transaction ID
 * @param checkPesapal - Whether to query Pesapal for latest status
 * @returns Payment status result
 */
export async function checkPaymentStatus(
  transactionId: string,
  checkPesapal = false
): Promise<PaymentStatusResult | null> {
  try {
    // Call API endpoint for status check (avoids CORS issues)
    const queryParams = checkPesapal ? '?checkPesapal=true' : '';
    const response = await fetch(`/api/payments/${transactionId}/status/check${queryParams}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to check payment status');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Payment status check error:', error);
    return null;
  }
}

/**
 * Retry failed payment
 *
 * Creates a new payment attempt for a failed transaction.
 * This calls the server API to handle the retry.
 *
 * @param transactionId - Original transaction ID
 * @returns New payment result
 */
export async function retryPayment(
  transactionId: string
): Promise<PaymentResult> {
  try {
    // Call server API to get retry data and initiate new payment
    const response = await fetch(`/api/payments/${transactionId}/retry`, {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.error || 'Failed to retry payment',
      };
    }

    return {
      success: true,
      transactionId: result.transactionId,
      redirectUrl: result.redirectUrl,
      message: result.message || 'Payment retry initiated successfully',
    };
  } catch (error) {
    console.error('Payment retry error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retry payment',
    };
  }
}

/**
 * Get payment methods available for an order
 */
export function getAvailablePaymentMethods(orderAmount: number): {
  mpesa: boolean;
  card: boolean;
  credit: boolean;
} {
  return {
    mpesa: orderAmount >= 10 && orderAmount <= 500000, // M-Pesa limits
    card: orderAmount >= 10, // Card minimum
    credit: true, // Subject to customer eligibility check
  };
}
