/**
 * Server-Only Notification Actions
 *
 * These actions trigger notifications via webhook for order events.
 * They run ONLY on the server to prevent exposing WEBHOOK_API_KEY to client bundles.
 *
 * SECURITY: The 'use server' directive ensures this code never reaches the client.
 *
 * @module app/actions/notifications
 */

'use server';

interface NotificationParams {
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
 * Trigger order notification (server-side only)
 *
 * Sends a webhook request to trigger email + WhatsApp notifications
 * for order lifecycle events.
 *
 * SECURITY: This runs only on the server, protecting WEBHOOK_API_KEY from client exposure.
 *
 * @param params - Notification parameters
 * @returns Promise<{ success: boolean; error?: string; data?: unknown }>
 */
export async function triggerOrderNotification(
  params: NotificationParams
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
      console.error('[Server Action] Notification webhook failed:', data);
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
    console.error('[Server Action] Failed to trigger notification:', error);
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
  order: NotificationParams['order'];
  customer: NotificationParams['customer'];
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
  order: NotificationParams['order'];
  customer: NotificationParams['customer'];
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
  order: NotificationParams['order'];
  customer: NotificationParams['customer'];
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
  order: NotificationParams['order'];
  customer: NotificationParams['customer'];
}) {
  return triggerOrderNotification({
    event: 'order.collected',
    ...params,
  });
}

/**
 * Driver Transfer Batch Notification Parameters
 */
interface DriverTransferNotificationParams {
  event: 'transfer.assigned';
  transfer: {
    batchId: string;
    totalOrders: number;
    satelliteBranchName: string;
    satelliteAddress: string;
    mainStoreName: string;
    mainStoreAddress: string;
    mainStorePhone: string;
  };
  driver: {
    driverId: string;
    name: string;
    phone: string;
  };
}

/**
 * Notify driver about assigned transfer batch
 *
 * Sends WhatsApp notification to driver with pickup/destination details.
 * This runs only on the server to protect API keys.
 *
 * @param params - Transfer notification parameters
 * @returns Promise<{ success: boolean; error?: string; data?: unknown }>
 */
export async function notifyDriverTransferAssigned(
  params: DriverTransferNotificationParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const webhookUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiKey = process.env.WEBHOOK_API_KEY || 'dev-webhook-key';

    const response = await fetch(
      `${webhookUrl}/api/webhooks/driver-notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(params),
      }
    );

    // Handle 404 gracefully (webhook not yet implemented)
    if (response.status === 404) {
      console.warn('[Server Action] Driver notification webhook not implemented yet');
      return {
        success: true,
        data: { message: 'Notification skipped - webhook not implemented' },
      };
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('[Server Action] Driver notification webhook failed:', data);
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
    console.error('[Server Action] Failed to trigger driver notification:', error);
    return {
      success: false,
      error: error.message || 'Failed to trigger notification',
    };
  }
}
