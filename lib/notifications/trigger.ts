/**
 * Notification Trigger Helper
 *
 * ⚠️ DEPRECATED: This file is deprecated for security reasons.
 * It exposes WEBHOOK_API_KEY to client bundles, which is a security risk.
 *
 * ✅ USE INSTEAD: Import from '@/app/actions/notifications'
 * The server actions use 'use server' directive to ensure code runs only on the server.
 *
 * This file is kept for reference but should not be imported in new code.
 *
 * @deprecated Use '@/app/actions/notifications' instead
 * @module lib/notifications/trigger
 */

interface TriggerNotificationParams {
  event: 'order.created' | 'order.ready' | 'order.delivered' | 'order.collected';
  order: {
    orderId: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    paymentMethod?: string;
    estimatedCompletion: Date | string;
    createdAt: Date | string;
    branchName?: string;
    branchPhone?: string;
    trackingUrl?: string;
    receiptUrl?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    garments?: any[];
  };
  customer: {
    customerId?: string;
    name: string;
    email?: string;
    phone: string;
  };
}

/**
 * Trigger order notification
 *
 * Sends a webhook request to trigger email + WhatsApp notifications
 * for order lifecycle events.
 *
 * @param params - Notification parameters
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function triggerOrderNotification(
  params: TriggerNotificationParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const webhookUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiKey = process.env.WEBHOOK_API_KEY || 'dev-webhook-key';

    const response = await fetch(
      `${webhookUrl}/api/webhooks/order-notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Notification webhook failed:', data);
      return {
        success: false,
        error: data.error || 'Webhook request failed',
      };
    }

    return {
      success: true,
      data,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Failed to trigger notification:', error);
    return {
      success: false,
      error: error.message || 'Failed to trigger notification',
    };
  }
}

/**
 * Trigger notification for newly created order
 *
 * Call this immediately after creating an order in Firestore.
 *
 * @example
 * ```typescript
 * await notifyOrderCreated({
 *   order: { orderId, totalAmount, estimatedCompletion, ... },
 *   customer: { name, email, phone }
 * });
 * ```
 */
export async function notifyOrderCreated(params: {
  order: TriggerNotificationParams['order'];
  customer: TriggerNotificationParams['customer'];
}) {
  return triggerOrderNotification({
    event: 'order.created',
    ...params,
  });
}

/**
 * Trigger notification when order is ready for pickup
 *
 * Call this when order status changes to 'ready'.
 *
 * @example
 * ```typescript
 * if (newStatus === 'ready') {
 *   await notifyOrderReady({ order, customer });
 * }
 * ```
 */
export async function notifyOrderReady(params: {
  order: TriggerNotificationParams['order'];
  customer: TriggerNotificationParams['customer'];
}) {
  return triggerOrderNotification({
    event: 'order.ready',
    ...params,
  });
}

/**
 * Trigger notification when order is delivered
 *
 * Call this when order status changes to 'delivered'.
 *
 * @example
 * ```typescript
 * if (newStatus === 'delivered') {
 *   await notifyOrderDelivered({ order, customer });
 * }
 * ```
 */
export async function notifyOrderDelivered(params: {
  order: TriggerNotificationParams['order'];
  customer: TriggerNotificationParams['customer'];
}) {
  return triggerOrderNotification({
    event: 'order.delivered',
    ...params,
  });
}

/**
 * Trigger notification when order is collected by customer
 *
 * Call this when order status changes to 'collected'.
 *
 * @example
 * ```typescript
 * if (newStatus === 'collected') {
 *   await notifyOrderCollected({ order, customer });
 * }
 * ```
 */
export async function notifyOrderCollected(params: {
  order: TriggerNotificationParams['order'];
  customer: TriggerNotificationParams['customer'];
}) {
  return triggerOrderNotification({
    event: 'order.collected',
    ...params,
  });
}
