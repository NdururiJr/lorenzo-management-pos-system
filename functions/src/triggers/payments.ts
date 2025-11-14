/**
 * Payment Triggers
 * Firestore triggers for payment-related events
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendPaymentReceiptEmail } from '../utils/email';
import { logPaymentEvent, incrementAnalyticsCounter } from '../utils/analytics';
import { format } from 'date-fns';

/**
 * Trigger when a payment is received
 */
export const onPaymentReceived = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const transactionId = context.params.transactionId;
    const transactionData = snap.data();

    console.log(`Payment received: ${transactionId}`);

    try {
      // Only process completed payments
      if (transactionData.status !== 'completed') {
        console.log(`Payment ${transactionId} not completed yet, skipping`);
        return;
      }

      // Get order details
      const orderDoc = await admin.firestore()
        .collection('orders')
        .doc(transactionData.orderId)
        .get();

      if (!orderDoc.exists) {
        console.error(`Order not found: ${transactionData.orderId}`);
        return;
      }

      const orderData = orderDoc.data()!;

      // Get customer details
      const customerDoc = await admin.firestore()
        .collection('customers')
        .doc(transactionData.customerId)
        .get();

      if (!customerDoc.exists) {
        console.error(`Customer not found: ${transactionData.customerId}`);
        return;
      }

      const customerData = customerDoc.data()!;

      // Update order payment status
      const newPaidAmount = (orderData.paidAmount || 0) + transactionData.amount;
      const paymentStatus = newPaidAmount >= orderData.totalAmount ? 'paid' : 'partial';

      await admin.firestore()
        .collection('orders')
        .doc(transactionData.orderId)
        .update({
          paidAmount: newPaidAmount,
          paymentStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Updated order ${transactionData.orderId} payment status to ${paymentStatus}`);

      // Send payment receipt email
      if (customerData.email) {
        const receiptData = {
          orderId: transactionData.orderId,
          customerName: customerData.name,
          amount: transactionData.amount,
          paymentMethod: transactionData.method,
          transactionId,
          date: format(transactionData.timestamp?.toDate() || new Date(), 'PPP'),
        };

        const emailResult = await sendPaymentReceiptEmail(customerData.email, receiptData);

        // Log notification
        await admin.firestore().collection('notifications').add({
          type: 'payment_receipt',
          channel: 'email',
          recipientId: customerData.customerId,
          recipientEmail: customerData.email,
          orderId: transactionData.orderId,
          transactionId,
          status: emailResult.success ? 'sent' : 'failed',
          error: emailResult.error,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Update customer total spent
      await admin.firestore()
        .collection('customers')
        .doc(transactionData.customerId)
        .update({
          totalSpent: admin.firestore.FieldValue.increment(transactionData.amount),
        });

      // Log analytics event
      await logPaymentEvent('payment_completed', transactionData.orderId, {
        amount: transactionData.amount,
        method: transactionData.method,
        transactionId,
      });

      // Increment revenue counter
      await incrementAnalyticsCounter('total_revenue', transactionData.amount);

      console.log(`Payment ${transactionId} processed successfully`);
    } catch (error) {
      console.error(`Error processing payment ${transactionId}:`, error);
    }
  });

/**
 * Trigger when payment status changes
 */
export const onPaymentStatusChanged = functions.firestore
  .document('transactions/{transactionId}')
  .onUpdate(async (change, context) => {
    const transactionId = context.params.transactionId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status actually changed
    if (beforeData.status === afterData.status) {
      return;
    }

    console.log(`Payment ${transactionId} status changed: ${beforeData.status} -> ${afterData.status}`);

    try {
      // Log payment status change
      await logPaymentEvent('payment_status_changed', afterData.orderId, {
        oldStatus: beforeData.status,
        newStatus: afterData.status,
        transactionId,
        amount: afterData.amount,
      });

      // If payment failed, log it
      if (afterData.status === 'failed') {
        await logPaymentEvent('payment_failed', afterData.orderId, {
          transactionId,
          amount: afterData.amount,
          method: afterData.method,
          error: afterData.error,
        });
      }

      // If payment was refunded, update order
      if (afterData.status === 'refunded') {
        await admin.firestore()
          .collection('orders')
          .doc(afterData.orderId)
          .update({
            paidAmount: admin.firestore.FieldValue.increment(-afterData.amount),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        await logPaymentEvent('refund_processed', afterData.orderId, {
          transactionId,
          amount: afterData.amount,
        });
      }

      console.log(`Payment status change for ${transactionId} processed successfully`);
    } catch (error) {
      console.error(`Error processing payment status change for ${transactionId}:`, error);
    }
  });
