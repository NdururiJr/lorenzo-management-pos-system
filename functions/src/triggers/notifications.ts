/**
 * Notification Triggers
 * Handle retry logic for failed notifications
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { sendEmail } from '../utils/email';
import { logNotificationEvent } from '../utils/analytics';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 60000; // 1 minute

/**
 * Trigger when a notification fails to send
 * Implements retry logic with exponential backoff
 */
export const onNotificationFailed = functions.firestore
  .document('notifications/{notificationId}')
  .onWrite(async (change, context) => {
    const notificationId = context.params.notificationId;

    // Only process failed notifications
    if (!change.after.exists) {
      return;
    }

    const notificationData = change.after.data()!;

    if (notificationData.status !== 'failed') {
      return;
    }

    const retryCount = notificationData.retryCount || 0;

    // Check if we've exceeded max retries
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.log(`Notification ${notificationId} exceeded max retry attempts`);

      // Mark as permanently failed
      await change.after.ref.update({
        status: 'permanently_failed',
        lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return;
    }

    // Calculate exponential backoff delay
    const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
    const nextRetryTime = new Date(Date.now() + delay);

    console.log(`Scheduling retry ${retryCount + 1} for notification ${notificationId} at ${nextRetryTime}`);

    // Update notification with retry info
    await change.after.ref.update({
      retryCount: retryCount + 1,
      nextRetryTime: admin.firestore.Timestamp.fromDate(nextRetryTime),
      status: 'pending_retry',
    });

    // Schedule retry (in production, you'd use Cloud Tasks or Pub/Sub)
    setTimeout(async () => {
      try {
        await retryNotification(notificationId, notificationData);
      } catch (error) {
        console.error(`Error retrying notification ${notificationId}:`, error);
      }
    }, delay);
  });

/**
 * Retry sending a notification
 */
async function retryNotification(notificationId: string, notificationData: any): Promise<void> {
  console.log(`Retrying notification ${notificationId}`);

  try {
    let result: { success: boolean; error?: string; messageId?: string } = {
      success: false,
    };

    // Retry based on channel
    if (notificationData.channel === 'whatsapp') {
      // Reconstruct WhatsApp message from notification data
      result = await sendWhatsAppMessage({
        phone: notificationData.recipientPhone,
        template: notificationData.type,
        parameters: notificationData.parameters || [],
      });
    } else if (notificationData.channel === 'email') {
      // Reconstruct email from notification data
      result = await sendEmail({
        to: notificationData.recipientEmail,
        subject: notificationData.subject || 'Notification',
        html: notificationData.html || '',
      });
    }

    // Update notification status
    if (result.success) {
      await admin.firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          status: 'sent',
          messageId: result.messageId,
          lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Notification ${notificationId} sent successfully on retry`);

      // Log analytics
      await logNotificationEvent(
        'notification_delivered',
        notificationData.channel,
        notificationData.recipientId,
        { notificationId, retried: true }
      );
    } else {
      await admin.firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          status: 'failed',
          error: result.error,
          lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Notification ${notificationId} failed again: ${result.error}`);
    }
  } catch (error: any) {
    console.error(`Error in retryNotification for ${notificationId}:`, error);

    await admin.firestore()
      .collection('notifications')
      .doc(notificationId)
      .update({
        status: 'failed',
        error: error.message,
        lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }
}

/**
 * Clean up old notifications (older than 30 days)
 */
export const cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    console.log('Cleaning up old notifications');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifications = await admin.firestore()
      .collection('notifications')
      .where('timestamp', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .get();

    console.log(`Found ${oldNotifications.size} notifications to delete`);

    // Delete in batches of 500
    const batch = admin.firestore().batch();
    let count = 0;

    oldNotifications.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;

      if (count === 500) {
        // Firestore batch limit
        return;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Deleted ${count} old notifications`);
    }

    return null;
  });
