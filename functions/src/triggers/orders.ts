/**
 * Order Triggers
 * Firestore triggers for order-related events
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendOrderConfirmationEmail, sendOrderReadyEmail } from '../utils/email';
import { sendOrderConfirmationWhatsApp, sendOrderReadyWhatsApp } from '../utils/whatsapp';
import { logOrderEvent, incrementAnalyticsCounter } from '../utils/analytics';
import { format } from 'date-fns';

/**
 * Trigger when a new order is created
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const orderData = snap.data();

    console.log(`Order created: ${orderId}`);

    try {
      // Get customer details
      const customerDoc = await admin.firestore()
        .collection('customers')
        .doc(orderData.customerId)
        .get();

      if (!customerDoc.exists) {
        console.error(`Customer not found: ${orderData.customerId}`);
        return;
      }

      const customerData = customerDoc.data()!;
      const estimatedCompletion = orderData.estimatedCompletion
        ? format(orderData.estimatedCompletion.toDate(), 'PPP')
        : 'TBD';

      // Prepare notification data
      const notificationData = {
        orderId,
        customerName: customerData.name,
        garmentCount: orderData.garments?.length || 0,
        totalAmount: orderData.totalAmount,
        estimatedCompletion,
      };

      // Send WhatsApp notification
      if (customerData.phone) {
        console.log(`Sending WhatsApp to ${customerData.phone}`);
        const whatsappResult = await sendOrderConfirmationWhatsApp(
          customerData.phone,
          notificationData
        );

        // Log notification to Firestore
        await admin.firestore().collection('notifications').add({
          type: 'order_confirmation',
          channel: 'whatsapp',
          recipientId: customerData.customerId,
          recipientPhone: customerData.phone,
          orderId,
          status: whatsappResult.success ? 'sent' : 'failed',
          error: whatsappResult.error,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Send Email notification
      if (customerData.email) {
        console.log(`Sending email to ${customerData.email}`);
        const emailResult = await sendOrderConfirmationEmail(
          customerData.email,
          notificationData
        );

        // Log notification to Firestore
        await admin.firestore().collection('notifications').add({
          type: 'order_confirmation',
          channel: 'email',
          recipientId: customerData.customerId,
          recipientEmail: customerData.email,
          orderId,
          status: emailResult.success ? 'sent' : 'failed',
          error: emailResult.error,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Log analytics event
      await logOrderEvent('order_created', orderId, {
        branchId: orderData.branchId,
        totalAmount: orderData.totalAmount,
        garmentCount: orderData.garments?.length || 0,
      });

      // Increment order counter
      await incrementAnalyticsCounter('total_orders', 1, orderData.branchId);

      console.log(`Order ${orderId} notifications sent successfully`);
    } catch (error) {
      console.error(`Error processing order creation for ${orderId}:`, error);
      // Don't throw - we don't want to fail the order creation
    }
  });

/**
 * Trigger when order status changes
 */
export const onOrderStatusChanged = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const orderId = context.params.orderId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if status actually changed
    if (beforeData.status === afterData.status) {
      return;
    }

    console.log(`Order ${orderId} status changed: ${beforeData.status} -> ${afterData.status}`);

    try {
      // Get customer details
      const customerDoc = await admin.firestore()
        .collection('customers')
        .doc(afterData.customerId)
        .get();

      if (!customerDoc.exists) {
        console.error(`Customer not found: ${afterData.customerId}`);
        return;
      }

      const customerData = customerDoc.data()!;

      // Send notification when order is ready
      if (afterData.status === 'ready') {
        const notificationData = {
          orderId,
          customerName: customerData.name,
          pickupMethod: afterData.returnMethod || 'customer_collects',
        };

        // Send WhatsApp notification
        if (customerData.phone) {
          const whatsappResult = await sendOrderReadyWhatsApp(
            customerData.phone,
            notificationData
          );

          await admin.firestore().collection('notifications').add({
            type: 'order_ready',
            channel: 'whatsapp',
            recipientId: customerData.customerId,
            recipientPhone: customerData.phone,
            orderId,
            status: whatsappResult.success ? 'sent' : 'failed',
            error: whatsappResult.error,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Send Email notification
        if (customerData.email) {
          const emailResult = await sendOrderReadyEmail(
            customerData.email,
            notificationData
          );

          await admin.firestore().collection('notifications').add({
            type: 'order_ready',
            channel: 'email',
            recipientId: customerData.customerId,
            recipientEmail: customerData.email,
            orderId,
            status: emailResult.success ? 'sent' : 'failed',
            error: emailResult.error,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // Log analytics event for status change
      await logOrderEvent('order_status_changed', orderId, {
        oldStatus: beforeData.status,
        newStatus: afterData.status,
        branchId: afterData.branchId,
      });

      // Track completed orders
      if (afterData.status === 'delivered' || afterData.status === 'collected') {
        await incrementAnalyticsCounter('completed_orders', 1, afterData.branchId);

        await logOrderEvent('order_completed', orderId, {
          branchId: afterData.branchId,
          totalAmount: afterData.totalAmount,
          completionTime: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`Order ${orderId} status change processed successfully`);
    } catch (error) {
      console.error(`Error processing status change for ${orderId}:`, error);
    }
  });

/**
 * Trigger when order is updated (for completion time estimation)
 */
export const updateOrderEstimate = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const orderData = snap.data();

    try {
      // If estimated completion is not set, calculate it
      if (!orderData.estimatedCompletion) {
        // Simple estimation: 2 days for regular orders, 1 day for express
        const garmentCount = orderData.garments?.length || 0;
        const isExpress = orderData.priority === 'express';

        const hoursToAdd = isExpress ? 24 : 48;
        const estimatedDate = new Date();
        estimatedDate.setHours(estimatedDate.getHours() + hoursToAdd);

        // Update order with estimated completion
        await admin.firestore()
          .collection('orders')
          .doc(orderId)
          .update({
            estimatedCompletion: admin.firestore.Timestamp.fromDate(estimatedDate),
          });

        console.log(`Updated estimated completion for order ${orderId}`);
      }
    } catch (error) {
      console.error(`Error updating estimate for ${orderId}:`, error);
    }
  });
