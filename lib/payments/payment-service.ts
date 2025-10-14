/**
 * Payment Processing Service
 *
 * This service handles all payment processing operations:
 * - Cash payments
 * - M-Pesa payments (via Pesapal)
 * - Card payments (via Pesapal)
 * - Credit payments
 *
 * @module lib/payments/payment-service
 */

import {
  createTransaction,
  updateTransactionStatus,
  getTransactionByPesapalRef,
} from '../db/transactions';
import { getOrder } from '../db/orders';
import {
  submitOrderRequest,
  getTransactionStatus as getPesapalTransactionStatus,
  mapPesapalStatus,
} from '../../services/pesapal';
import type {
  PaymentResult,
  CashPaymentData,
  DigitalPaymentData,
  CreditPaymentData,
  PaymentStatusResult,
  PaymentCallbackData,
} from './payment-types';

/**
 * Process cash payment
 *
 * Records a cash payment transaction and updates order payment status.
 *
 * @param data - Cash payment data
 * @returns Payment result with transaction ID
 */
export async function processCashPayment(
  data: CashPaymentData
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

    // Check if amount exceeds balance due
    const balanceDue = order.totalAmount - order.paidAmount;
    if (data.amount > balanceDue) {
      return {
        success: false,
        error: `Payment amount (KES ${data.amount}) exceeds balance due (KES ${balanceDue})`,
      };
    }

    // Calculate change if amount tendered is provided
    const change = data.amountTendered ? data.amountTendered - data.amount : 0;

    // Create transaction record
    const transactionId = await createTransaction({
      orderId: data.orderId,
      customerId: data.customerId,
      amount: data.amount,
      method: 'cash',
      status: 'completed', // Cash payments are immediately completed
      processedBy: data.userId,
    });

    return {
      success: true,
      transactionId,
      message: change > 0 ? `Change: KES ${change}` : 'Payment recorded successfully',
    };
  } catch (error) {
    console.error('Cash payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process cash payment',
    };
  }
}

/**
 * Initiate digital payment (M-Pesa or Card via Pesapal)
 *
 * Creates a pending transaction and returns Pesapal redirect URL.
 *
 * @param data - Digital payment data
 * @returns Payment result with redirect URL
 */
export async function initiateDigitalPayment(
  data: DigitalPaymentData
): Promise<PaymentResult> {
  try {
    // Validate amount
    if (data.amount <= 0) {
      return {
        success: false,
        error: 'Invalid payment amount',
      };
    }

    // Get order to verify it exists and check balance
    const order = await getOrder(data.orderId);

    const balanceDue = order.totalAmount - order.paidAmount;
    if (data.amount > balanceDue) {
      return {
        success: false,
        error: `Payment amount (KES ${data.amount}) exceeds balance due (KES ${balanceDue})`,
      };
    }

    // Submit payment request to Pesapal
    const pesapalResponse = await submitOrderRequest({
      orderId: data.orderId,
      amount: data.amount,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      description: `Lorenzo Dry Cleaners - Order ${data.orderId}`,
    });

    if (!pesapalResponse.success || !pesapalResponse.redirectUrl) {
      return {
        success: false,
        error: pesapalResponse.error || 'Failed to initiate payment',
      };
    }

    // Create pending transaction record
    const transactionId = await createTransaction({
      orderId: data.orderId,
      customerId: data.customerId,
      amount: data.amount,
      method: data.method,
      status: 'pending',
      pesapalRef: pesapalResponse.orderTrackingId,
      processedBy: data.userId,
    });

    return {
      success: true,
      transactionId,
      redirectUrl: pesapalResponse.redirectUrl,
      message: 'Payment initiated successfully',
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
      amount: data.amount,
      method: 'credit',
      status: 'completed', // Credit payments are recorded as completed
      processedBy: data.userId,
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
 * Handle Pesapal payment callback (IPN)
 *
 * Called when Pesapal sends payment notification.
 * Updates transaction status and order payment status.
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
    const pesapalStatus = await getPesapalTransactionStatus(
      callbackData.orderTrackingId
    );

    if (!pesapalStatus) {
      console.error('Failed to get payment status from Pesapal');
      return;
    }

    // Map Pesapal status to application status
    const status = mapPesapalStatus(pesapalStatus.status);

    // Update transaction status with Pesapal metadata
    await updateTransactionStatus(transaction.transactionId, status, {
      gatewayResponse: pesapalStatus.statusDescription,
      mpesaTransactionCode: pesapalStatus.confirmationCode,
    });

    console.log(
      `Payment callback processed for transaction ${transaction.transactionId}: ${status}`
    );
  } catch (error) {
    console.error('Payment callback handling error:', error);
    throw error;
  }
}

/**
 * Check payment status
 *
 * Queries transaction status from database and optionally from Pesapal.
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
    const { getTransaction } = await import('../db/transactions');
    const transaction = await getTransaction(transactionId);

    if (!transaction) {
      return null;
    }

    // If transaction has Pesapal ref and checkPesapal is true, query Pesapal
    if (checkPesapal && transaction.pesapalRef) {
      const pesapalStatus = await getPesapalTransactionStatus(
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
 * Retry failed payment
 *
 * Creates a new payment attempt for a failed transaction.
 *
 * @param transactionId - Original transaction ID
 * @returns New payment result
 */
export async function retryPayment(
  transactionId: string
): Promise<PaymentResult> {
  try {
    const { getTransaction } = await import('../db/transactions');
    const originalTransaction = await getTransaction(transactionId);

    if (!originalTransaction) {
      return {
        success: false,
        error: 'Original transaction not found',
      };
    }

    if (originalTransaction.status !== 'failed') {
      return {
        success: false,
        error: 'Can only retry failed transactions',
      };
    }

    // Get customer details
    // const order = await getOrder(originalTransaction.orderId);

    // Reinitiate payment based on method
    if (
      originalTransaction.method === 'mpesa' ||
      originalTransaction.method === 'card'
    ) {
      // For digital payments, we need customer contact info
      // This should be stored in the order or fetched from customer record
      const { getCustomer } = await import('../db/customers');
      const customer = await getCustomer(originalTransaction.customerId);

      return await initiateDigitalPayment({
        orderId: originalTransaction.orderId,
        customerId: originalTransaction.customerId,
        amount: originalTransaction.amount,
        customerPhone: customer.phone,
        customerEmail: customer.email || '',
        method: originalTransaction.method,
        userId: originalTransaction.processedBy,
      });
    }

    return {
      success: false,
      error: 'Payment retry not supported for this payment method',
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
  cash: boolean;
  mpesa: boolean;
  card: boolean;
  credit: boolean;
} {
  return {
    cash: true,
    mpesa: orderAmount >= 10 && orderAmount <= 500000, // M-Pesa limits
    card: orderAmount >= 10, // Card minimum
    credit: true, // Subject to customer eligibility check
  };
}
