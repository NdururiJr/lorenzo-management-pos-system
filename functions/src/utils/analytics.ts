/**
 * Analytics Utilities for Cloud Functions
 * Log important events and metrics for analytics
 */

import * as admin from 'firebase-admin';

interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  orderId?: string;
  customerId?: string;
  branchId?: string;
  metadata?: Record<string, any>;
}

/**
 * Log analytics event to Firestore
 */
export async function logAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await admin.firestore().collection('analytics_events').add({
      ...event,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
}

/**
 * Log order event
 */
export async function logOrderEvent(
  eventType: 'order_created' | 'order_status_changed' | 'order_completed' | 'order_cancelled',
  orderId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAnalyticsEvent({
    eventType,
    orderId,
    metadata,
  });
}

/**
 * Log payment event
 */
export async function logPaymentEvent(
  eventType: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'refund_processed',
  orderId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAnalyticsEvent({
    eventType,
    orderId,
    metadata,
  });
}

/**
 * Log notification event
 */
export async function logNotificationEvent(
  eventType: 'notification_sent' | 'notification_delivered' | 'notification_failed',
  channel: 'whatsapp' | 'email' | 'sms',
  recipientId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logAnalyticsEvent({
    eventType,
    customerId: recipientId,
    metadata: {
      ...metadata,
      channel,
    },
  });
}

/**
 * Update cached analytics data
 */
export async function updateAnalyticsCache(
  metric: string,
  value: number,
  branchId?: string
): Promise<void> {
  try {
    const docId = branchId ? `${metric}_${branchId}` : metric;
    const analyticsRef = admin.firestore().collection('analytics').doc(docId);

    await analyticsRef.set(
      {
        metric,
        value,
        branchId,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating analytics cache:', error);
  }
}

/**
 * Increment analytics counter
 */
export async function incrementAnalyticsCounter(
  metric: string,
  increment: number = 1,
  branchId?: string
): Promise<void> {
  try {
    const docId = branchId ? `${metric}_${branchId}` : metric;
    const analyticsRef = admin.firestore().collection('analytics').doc(docId);

    await analyticsRef.set(
      {
        metric,
        value: admin.firestore.FieldValue.increment(increment),
        branchId,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error incrementing analytics counter:', error);
  }
}
