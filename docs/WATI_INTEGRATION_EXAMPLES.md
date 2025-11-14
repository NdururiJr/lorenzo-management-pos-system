# Wati.io Integration Examples

This document provides practical examples of integrating Wati.io WhatsApp notifications into the Lorenzo Dry Cleaners order workflow.

## Table of Contents

1. [Order Creation Notification](#order-creation-notification)
2. [Order Status Change Notifications](#order-status-change-notifications)
3. [Delivery Notifications](#delivery-notifications)
4. [Payment Reminders](#payment-reminders)
5. [Scheduled Notifications](#scheduled-notifications)
6. [Error Handling](#error-handling)

---

## Order Creation Notification

Send WhatsApp notification when a new order is created at POS.

### In POS Order Creation Function

```typescript
// lib/db/orders.ts or app/(dashboard)/pos/page.tsx

import { sendOrderConfirmation } from '@/services/wati';
import { getCustomerById } from '@/lib/db/customers';

export async function createOrder(orderData: OrderInput): Promise<Order> {
  try {
    // 1. Create order in Firestore
    const orderRef = adminDb.collection('orders').doc();
    const orderId = `ORD-${branchId}-${dateString}-${counter}`;

    await orderRef.set({
      orderId,
      ...orderData,
      createdAt: Timestamp.now(),
    });

    // 2. Get customer details
    const customer = await getCustomerById(orderData.customerId);

    // 3. Send WhatsApp notification
    if (customer.preferences.notifications) {
      const estimatedDate = new Date(orderData.estimatedCompletion);

      await sendOrderConfirmation(customer.phone, {
        orderId,
        customerName: customer.name,
        amount: orderData.totalAmount,
        estimatedCompletion: estimatedDate.toLocaleDateString('en-KE', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
      });

      console.log(`Order confirmation sent to ${customer.phone}`);
    }

    return { orderId, ...orderData };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
```

### In Next.js API Route

```typescript
// app/api/orders/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation } from '@/services/wati';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Create order (implementation omitted for brevity)
    const order = await createOrderInDatabase(orderData);

    // Get customer
    const customerDoc = await adminDb
      .collection('customers')
      .doc(orderData.customerId)
      .get();

    const customer = customerDoc.data();

    // Send notification (non-blocking - don't wait for it)
    if (customer?.preferences?.notifications) {
      sendOrderConfirmation(customer.phone, {
        orderId: order.orderId,
        customerName: customer.name,
        amount: order.totalAmount,
        estimatedCompletion: order.estimatedCompletion,
      }).catch((error) => {
        console.error('Failed to send order confirmation:', error);
        // Don't fail the order creation if notification fails
      });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Order Status Change Notifications

Send notifications when order status changes (e.g., ready for pickup/delivery).

### Using Firestore Trigger (Cloud Function)

```typescript
// functions/src/triggers/onOrderStatusChange.ts

import * as functions from 'firebase-functions';
import { adminDb } from '../admin';
import { sendOrderReady } from '../services/wati';

export const onOrderStatusChange = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed to 'ready'
    if (before.status !== 'ready' && after.status === 'ready') {
      try {
        // Get customer details
        const customerDoc = await adminDb
          .collection('customers')
          .doc(after.customerId)
          .get();

        const customer = customerDoc.data();

        if (customer?.preferences?.notifications) {
          // Get branch details
          const branchDoc = await adminDb
            .collection('branches')
            .doc(after.branchId)
            .get();

          const branch = branchDoc.data();

          // Determine collection method
          const collectionMethod = after.returnMethod === 'delivery'
            ? 'delivery'
            : 'pickup';

          // Send notification
          await sendOrderReady(customer.phone, {
            orderId: after.orderId,
            customerName: customer.name,
            collectionMethod,
            branchName: branch?.name || 'Lorenzo Dry Cleaners',
          });

          console.log(
            `Order ready notification sent for ${after.orderId}`
          );
        }
      } catch (error) {
        console.error('Error sending order ready notification:', error);
        // Log but don't throw - we don't want to fail the status update
      }
    }
  });
```

### Using Next.js Server Action

```typescript
// app/actions/update-order-status.ts

'use server';

import { adminDb } from '@/lib/firebase-admin';
import { sendOrderReady } from '@/services/wati';

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }

    const order = orderDoc.data();

    // Update status
    await orderRef.update({
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    // Send notification if status is 'ready'
    if (newStatus === 'ready') {
      const customerDoc = await adminDb
        .collection('customers')
        .doc(order.customerId)
        .get();

      const customer = customerDoc.data();

      if (customer?.preferences?.notifications) {
        // Send in background (non-blocking)
        sendOrderReady(customer.phone, {
          orderId: order.orderId,
          customerName: customer.name,
          collectionMethod: order.returnMethod === 'delivery' ? 'delivery' : 'pickup',
          branchName: 'Lorenzo Kilimani',
        }).catch((error) => {
          console.error('Notification failed:', error);
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

## Delivery Notifications

Send notifications when driver is assigned and during delivery.

### When Creating Delivery Route

```typescript
// app/actions/create-delivery-route.ts

import { sendDriverDispatched } from '@/services/wati';

export async function createDeliveryRoute(
  orderIds: string[],
  driverId: string
): Promise<{ success: boolean; deliveryId?: string }> {
  try {
    // Get driver details
    const driverDoc = await adminDb.collection('users').doc(driverId).get();
    const driver = driverDoc.data();

    // Create delivery batch
    const deliveryRef = adminDb.collection('deliveries').doc();
    const deliveryId = deliveryRef.id;

    await deliveryRef.set({
      deliveryId,
      driverId,
      orderIds,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // Send notification to each customer
    for (const orderId of orderIds) {
      const orderDoc = await adminDb.collection('orders').doc(orderId).get();
      const order = orderDoc.data();

      const customerDoc = await adminDb
        .collection('customers')
        .doc(order.customerId)
        .get();
      const customer = customerDoc.data();

      if (customer?.preferences?.notifications) {
        // Send driver dispatched notification
        await sendDriverDispatched(
          customer.phone,
          {
            orderId: order.orderId,
            customerName: customer.name,
          },
          {
            driverName: driver.name,
            driverPhone: driver.phone,
            estimatedArrival: 45, // Calculate based on route optimization
          }
        );
      }
    }

    return { success: true, deliveryId };
  } catch (error: any) {
    console.error('Error creating delivery route:', error);
    return { success: false };
  }
}
```

### When Driver is Nearby

```typescript
// app/actions/update-driver-location.ts

import { sendDriverNearby } from '@/services/wati';

export async function updateDriverLocation(
  deliveryId: string,
  location: { lat: number; lng: number }
): Promise<void> {
  try {
    // Get delivery details
    const deliveryDoc = await adminDb
      .collection('deliveries')
      .doc(deliveryId)
      .get();

    const delivery = deliveryDoc.data();

    // Get next delivery stop
    const nextStop = delivery.route.stops.find((s) => s.status === 'pending');

    if (nextStop) {
      // Calculate distance to next stop
      const distance = calculateDistance(location, nextStop.coordinates);

      // If within 1km (approximately 5 minutes), send notification
      if (distance < 1) {
        const orderDoc = await adminDb
          .collection('orders')
          .doc(nextStop.orderId)
          .get();
        const order = orderDoc.data();

        const customerDoc = await adminDb
          .collection('customers')
          .doc(order.customerId)
          .get();
        const customer = customerDoc.data();

        if (customer?.preferences?.notifications) {
          await sendDriverNearby(customer.phone, {
            orderId: order.orderId,
            customerName: customer.name,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error updating driver location:', error);
  }
}

function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  // Haversine formula implementation
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
```

---

## Payment Reminders

Send reminders for unpaid or partially paid orders.

### Scheduled Cloud Function (Daily)

```typescript
// functions/src/scheduled/sendPaymentReminders.ts

import * as functions from 'firebase-functions';
import { adminDb } from '../admin';
import { sendPaymentReminder } from '../services/wati';

export const sendPaymentReminders = functions.pubsub
  .schedule('0 10 * * *') // Run daily at 10 AM
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    try {
      // Get orders with pending or partial payment
      const ordersSnapshot = await adminDb
        .collection('orders')
        .where('paymentStatus', 'in', ['pending', 'partial'])
        .where('status', '==', 'delivered') // Only for delivered orders
        .get();

      console.log(`Found ${ordersSnapshot.size} orders with pending payments`);

      const promises = ordersSnapshot.docs.map(async (orderDoc) => {
        const order = orderDoc.data();
        const balanceDue = order.totalAmount - order.paidAmount;

        // Skip if balance is too small (< KES 50)
        if (balanceDue < 50) return;

        // Get customer
        const customerDoc = await adminDb
          .collection('customers')
          .doc(order.customerId)
          .get();

        const customer = customerDoc.data();

        if (customer?.preferences?.notifications) {
          // Send payment reminder
          await sendPaymentReminder(
            customer.phone,
            {
              orderId: order.orderId,
              customerName: customer.name,
            },
            balanceDue
          );

          console.log(`Payment reminder sent for order ${order.orderId}`);
        }
      });

      await Promise.all(promises);

      console.log('Payment reminders sent successfully');
    } catch (error) {
      console.error('Error sending payment reminders:', error);
    }
  });
```

### Manual Payment Reminder

```typescript
// app/actions/send-payment-reminder.ts

'use server';

import { sendPaymentReminder } from '@/services/wati';
import { adminDb } from '@/lib/firebase-admin';

export async function sendManualPaymentReminder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get order
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }

    const order = orderDoc.data();
    const balanceDue = order.totalAmount - order.paidAmount;

    if (balanceDue <= 0) {
      throw new Error('No balance due on this order');
    }

    // Get customer
    const customerDoc = await adminDb
      .collection('customers')
      .doc(order.customerId)
      .get();

    const customer = customerDoc.data();

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Send reminder
    const result = await sendPaymentReminder(
      customer.phone,
      {
        orderId: order.orderId,
        customerName: customer.name,
      },
      balanceDue
    );

    if (result.success) {
      return { success: true };
    } else {
      throw new Error(result.error || 'Failed to send reminder');
    }
  } catch (error: any) {
    console.error('Error sending payment reminder:', error);
    return { success: false, error: error.message };
  }
}
```

---

## Scheduled Notifications

Set up automated notifications using Cloud Functions or cron jobs.

### Firebase Cloud Function (Scheduled)

```typescript
// functions/src/index.ts

import * as functions from 'firebase-functions';

// Import scheduled functions
export { sendPaymentReminders } from './scheduled/sendPaymentReminders';
export { sendOrderReadyReminders } from './scheduled/sendOrderReadyReminders';

// Send reminder to customers whose orders are ready but not collected (after 24 hours)
export const sendOrderReadyReminders = functions.pubsub
  .schedule('0 */6 * * *') // Run every 6 hours
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('status', '==', 'ready')
      .where('statusChangedAt', '<', yesterday)
      .get();

    // Send reminders (implementation similar to payment reminders)
    // ...
  });
```

---

## Error Handling

Best practices for handling notification errors.

### Try-Catch with Fallback

```typescript
import { sendOrderConfirmation, sendSMSFallback } from '@/services/wati';

async function sendOrderNotificationWithFallback(
  phone: string,
  orderData: any
): Promise<void> {
  try {
    // Try WhatsApp first
    const result = await sendOrderConfirmation(phone, orderData);

    if (!result.success) {
      console.warn(
        `WhatsApp notification failed for ${orderData.orderId}, trying SMS fallback`
      );

      // Fallback to SMS (if implemented)
      await sendSMSFallback(
        phone,
        `Hi ${orderData.customerName}, your order ${orderData.orderId} has been received. Total: KES ${orderData.amount}.`
      );
    }
  } catch (error) {
    console.error('All notification methods failed:', error);
    // Log to error tracking service (e.g., Sentry)
  }
}
```

### Notification Queue (Advanced)

```typescript
// lib/notifications/queue.ts

interface NotificationJob {
  id: string;
  type: 'whatsapp' | 'sms' | 'email';
  phone: string;
  message: string;
  orderId?: string;
  attempts: number;
  maxAttempts: number;
  nextRetry: Date;
}

export async function enqueueNotification(
  job: Omit<NotificationJob, 'id' | 'attempts' | 'nextRetry'>
): Promise<void> {
  const notificationRef = adminDb.collection('notification_queue').doc();

  await notificationRef.set({
    ...job,
    id: notificationRef.id,
    attempts: 0,
    nextRetry: new Date(),
    status: 'pending',
    createdAt: Timestamp.now(),
  });
}

// Process queue (Cloud Function scheduled every minute)
export async function processNotificationQueue(): Promise<void> {
  const now = new Date();

  const queueSnapshot = await adminDb
    .collection('notification_queue')
    .where('status', '==', 'pending')
    .where('nextRetry', '<=', now)
    .limit(10)
    .get();

  const promises = queueSnapshot.docs.map(async (doc) => {
    const job = doc.data() as NotificationJob;

    try {
      // Send notification based on type
      let result;
      if (job.type === 'whatsapp') {
        result = await sendWhatsAppMessage(job.phone, 'custom', {});
      }

      if (result.success) {
        // Mark as completed
        await doc.ref.update({ status: 'completed' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      // Increment attempts
      const newAttempts = job.attempts + 1;

      if (newAttempts >= job.maxAttempts) {
        // Mark as failed
        await doc.ref.update({
          status: 'failed',
          error: error.message,
        });
      } else {
        // Schedule retry with exponential backoff
        const delay = Math.pow(2, newAttempts) * 60 * 1000; // 2^n minutes
        await doc.ref.update({
          attempts: newAttempts,
          nextRetry: new Date(Date.now() + delay),
        });
      }
    }
  });

  await Promise.all(promises);
}
```

---

## Testing

Test notifications before going live.

```typescript
// Test in development environment
import { sendOrderConfirmation } from '@/services/wati';

// Use your own phone number for testing
const TEST_PHONE = '+254700000000'; // Replace with your number

await sendOrderConfirmation(TEST_PHONE, {
  orderId: 'TEST-001',
  customerName: 'Test User',
  amount: 1500,
  estimatedCompletion: 'Tomorrow',
});
```

---

## Summary

Key integration points:
1. **Order Creation** → Send order confirmation
2. **Status = Ready** → Send order ready notification
3. **Driver Assigned** → Send driver dispatched
4. **Driver Location** → Send driver nearby (when close)
5. **Scheduled Job** → Send payment reminders for unpaid orders

All notifications are:
- Logged to Firestore `notifications` collection
- Retried 3 times on failure
- Non-blocking (don't fail main operation if notification fails)
- Respect customer notification preferences
