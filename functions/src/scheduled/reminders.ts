/**
 * Reminder Scheduler Cloud Functions
 *
 * Scheduled functions for automated reminders:
 * - Payment reminders for unpaid orders (daily at 10 AM)
 * - V2.0: Uncollected order reminders (7/14/30 days, monthly, 90-day disposal)
 *
 * @module functions/src/scheduled/reminders
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendPaymentReminderWhatsApp, sendWhatsAppMessage } from '../utils/whatsapp';
import { sendEmail } from '../utils/email';
import { differenceInDays } from 'date-fns';

/**
 * Send payment reminders for orders with outstanding balances
 * Runs at 10 AM EAT daily
 */
export const paymentReminders = functions.pubsub
  .schedule('0 10 * * *')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    console.log('Checking for orders with outstanding payments...');

    try {
      const db = admin.firestore();

      // Get orders with partial or pending payment status
      const ordersSnapshot = await db
        .collection('orders')
        .where('paymentStatus', 'in', ['pending', 'partial'])
        .where('status', 'not-in', ['cancelled'])
        .get();

      console.log(`Found ${ordersSnapshot.size} orders with outstanding payments`);

      let remindersSent = 0;

      for (const orderDoc of ordersSnapshot.docs) {
        const order = orderDoc.data();
        const orderId = orderDoc.id;

        // Calculate outstanding amount
        const outstandingAmount = order.totalAmount - (order.paidAmount || 0);

        if (outstandingAmount <= 0) {
          continue; // No outstanding amount
        }

        // Check when the last reminder was sent
        const lastReminderSnapshot = await db
          .collection('notifications')
          .where('orderId', '==', orderId)
          .where('type', '==', 'payment_reminder')
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();

        // Don't send reminder if one was sent in the last 3 days
        if (!lastReminderSnapshot.empty) {
          const lastReminder = lastReminderSnapshot.docs[0].data();
          const daysSinceLastReminder = differenceInDays(
            new Date(),
            lastReminder.timestamp.toDate()
          );

          if (daysSinceLastReminder < 3) {
            console.log(`Skipping reminder for order ${orderId} (sent ${daysSinceLastReminder} days ago)`);
            continue;
          }
        }

        // Get customer details
        const customerDoc = await db
          .collection('customers')
          .doc(order.customerId)
          .get();

        if (!customerDoc.exists) {
          console.error(`Customer not found for order ${orderId}`);
          continue;
        }

        const customer = customerDoc.data()!;

        // Send WhatsApp reminder
        if (customer.phone) {
          const whatsappResult = await sendPaymentReminderWhatsApp(
            customer.phone,
            {
              orderId,
              customerName: customer.name,
              outstandingAmount,
            }
          );

          // Log notification
          await db.collection('notifications').add({
            type: 'payment_reminder',
            channel: 'whatsapp',
            recipientId: customer.customerId,
            recipientPhone: customer.phone,
            orderId,
            outstandingAmount,
            status: whatsappResult.success ? 'sent' : 'failed',
            error: whatsappResult.error,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });

          if (whatsappResult.success) {
            remindersSent++;
          }
        }

        // Send email reminder
        if (customer.email) {
          const emailHtml = generatePaymentReminderEmail(
            customer.name,
            orderId,
            outstandingAmount,
            order.totalAmount
          );

          const emailResult = await sendEmail({
            to: customer.email,
            subject: `Payment Reminder - Order ${orderId}`,
            html: emailHtml,
          });

          // Log notification
          await db.collection('notifications').add({
            type: 'payment_reminder',
            channel: 'email',
            recipientId: customer.customerId,
            recipientEmail: customer.email,
            orderId,
            outstandingAmount,
            status: emailResult.success ? 'sent' : 'failed',
            error: emailResult.error,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        console.log(`Sent payment reminder for order ${orderId} (Outstanding: KES ${outstandingAmount})`);
      }

      console.log(`Payment reminders completed. Sent ${remindersSent} reminders.`);
      return null;
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      throw error;
    }
  });

/**
 * Generate HTML for payment reminder email
 */
function generatePaymentReminderEmail(
  customerName: string,
  orderId: string,
  outstandingAmount: number,
  totalAmount: number
): string {
  const paidAmount = totalAmount - outstandingAmount;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .payment-details { background: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .amount-due { font-size: 32px; font-weight: bold; color: #dc2626; margin: 20px 0; }
        .payment-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .cta-button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>This is a friendly reminder about the outstanding payment for your order.</p>

          <div class="payment-details">
            <h3>Order: ${orderId}</h3>

            <div class="payment-row">
              <span>Total Amount:</span>
              <span>KES ${totalAmount.toLocaleString()}</span>
            </div>
            <div class="payment-row">
              <span>Amount Paid:</span>
              <span>KES ${paidAmount.toLocaleString()}</span>
            </div>

            <div class="amount-due">
              Outstanding: KES ${outstandingAmount.toLocaleString()}
            </div>
          </div>

          <p>Please complete your payment at your earliest convenience. You can pay via:</p>
          <ul>
            <li>M-Pesa</li>
            <li>Card payment (online)</li>
            <li>Cash at our store</li>
          </ul>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${orderId}" class="cta-button">Pay Now</a>

          <p>If you've already made this payment, please disregard this reminder.</p>
          <p>For any questions, please contact us.</p>
        </div>
        <div class="footer">
          <p>Lorenzo Dry Cleaners, Kilimani, Nairobi</p>
          <p>This is an automated reminder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// V2.0: UNCOLLECTED ORDER REMINDERS
// ============================================================================

/**
 * V2.0 Reminder types for uncollected orders
 */
type ReminderType = '7_days' | '14_days' | '30_days' | 'monthly' | 'disposal_eligible';

/**
 * V2.0 WhatsApp template names for each reminder type
 */
const REMINDER_TEMPLATES: Record<ReminderType, string> = {
  '7_days': 'uncollected_reminder_7day',
  '14_days': 'uncollected_reminder_14day',
  '30_days': 'uncollected_reminder_30day',
  'monthly': 'uncollected_reminder_monthly',
  'disposal_eligible': 'uncollected_reminder_disposal',
};

/**
 * V2.0: Process uncollected order reminders
 * Runs every hour to check for pending reminders that need to be sent
 *
 * This function:
 * 1. Queries the reminders collection for pending reminders
 * 2. Validates the order still needs reminders
 * 3. Sends WhatsApp and/or Email notifications
 * 4. Updates reminder status to sent or failed
 */
export const uncollectedOrderReminders = functions.pubsub
  .schedule('0 * * * *') // Every hour
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    console.log('[V2.0 Reminders] Starting uncollected order reminders processing...');

    try {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();

      // Get pending reminders that are due
      const remindersSnapshot = await db
        .collection('reminders')
        .where('status', '==', 'pending')
        .where('scheduledDate', '<=', now)
        .orderBy('scheduledDate', 'asc')
        .limit(100) // Process in batches
        .get();

      console.log(`[V2.0 Reminders] Found ${remindersSnapshot.size} pending reminders`);

      let sent = 0;
      let failed = 0;
      let skipped = 0;

      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data();
        const reminderId = reminderDoc.id;

        try {
          // Get the order to verify it still needs reminders
          const orderDoc = await db.collection('orders').doc(reminder.orderId).get();

          if (!orderDoc.exists) {
            console.log(`[V2.0 Reminders] Order ${reminder.orderId} not found, cancelling reminder`);
            await reminderDoc.ref.update({
              status: 'cancelled',
              updatedAt: now,
              errorMessage: 'Order not found',
            });
            skipped++;
            continue;
          }

          const order = orderDoc.data()!;

          // Skip if order is already collected or disposed
          if (['collected', 'disposed', 'cancelled'].includes(order.status)) {
            console.log(`[V2.0 Reminders] Order ${reminder.orderId} already ${order.status}, cancelling reminder`);
            await reminderDoc.ref.update({
              status: 'cancelled',
              updatedAt: now,
              errorMessage: `Order status is ${order.status}`,
            });
            skipped++;
            continue;
          }

          // Skip if this is a delivery order
          if (order.returnMethod === 'delivery_required') {
            console.log(`[V2.0 Reminders] Order ${reminder.orderId} is for delivery, cancelling reminder`);
            await reminderDoc.ref.update({
              status: 'cancelled',
              updatedAt: now,
              errorMessage: 'Delivery order - no collection reminder needed',
            });
            skipped++;
            continue;
          }

          // Calculate actual days uncollected
          const completionDate = order.actualCompletion?.toDate?.() ||
            order.deliveryCompletedTime?.toDate?.() ||
            order.estimatedCompletion?.toDate?.();
          const daysUncollected = completionDate
            ? differenceInDays(new Date(), completionDate)
            : 0;

          // Send WhatsApp notification
          let whatsappSuccess = false;
          if (reminder.customerPhone) {
            const templateName = REMINDER_TEMPLATES[reminder.reminderType as ReminderType] || 'uncollected_reminder_7day';

            const whatsappResult = await sendWhatsAppMessage({
              phone: reminder.customerPhone,
              template: templateName,
              parameters: [
                { name: 'customer_name', value: reminder.customerName || 'Valued Customer' },
                { name: 'order_id', value: reminder.orderDisplayId || reminder.orderId },
                { name: 'days_uncollected', value: daysUncollected.toString() },
              ],
            });

            whatsappSuccess = whatsappResult.success;

            if (!whatsappSuccess) {
              console.warn(`[V2.0 Reminders] WhatsApp failed for ${reminderId}: ${whatsappResult.error}`);
            }
          }

          // Send email notification if customer has email
          let emailSuccess = false;
          const customerDoc = await db.collection('customers').doc(reminder.customerId).get();
          const customer = customerDoc.data();

          if (customer?.email) {
            const emailHtml = generateUncollectedReminderEmail(
              reminder.customerName || 'Valued Customer',
              reminder.orderDisplayId || reminder.orderId,
              reminder.reminderType as ReminderType,
              daysUncollected,
              reminder.messageContent
            );

            const emailResult = await sendEmail({
              to: customer.email,
              subject: getEmailSubject(reminder.reminderType as ReminderType, reminder.orderId),
              html: emailHtml,
            });

            emailSuccess = emailResult.success;
          }

          // Log notification
          await db.collection('notifications').add({
            type: 'uncollected_reminder',
            reminderType: reminder.reminderType,
            recipientId: reminder.customerId,
            recipientPhone: reminder.customerPhone,
            recipientEmail: customer?.email,
            orderId: reminder.orderId,
            reminderId,
            daysUncollected,
            whatsappSuccess,
            emailSuccess,
            channel: whatsappSuccess ? 'whatsapp' : emailSuccess ? 'email' : 'none',
            status: whatsappSuccess || emailSuccess ? 'sent' : 'failed',
            timestamp: now,
          });

          // Update reminder status
          if (whatsappSuccess || emailSuccess) {
            await reminderDoc.ref.update({
              status: 'sent',
              sentDate: now,
              updatedAt: now,
              channel: whatsappSuccess ? 'whatsapp' : 'email',
            });
            sent++;
            console.log(`[V2.0 Reminders] Sent ${reminder.reminderType} reminder for order ${reminder.orderId}`);
          } else {
            // Update retry count and reschedule
            const newRetryCount = (reminder.retryCount || 0) + 1;
            const maxRetries = 3;

            if (newRetryCount >= maxRetries) {
              await reminderDoc.ref.update({
                status: 'failed',
                retryCount: newRetryCount,
                errorMessage: 'Max retries reached',
                updatedAt: now,
              });
              failed++;
            } else {
              // Reschedule for 4 hours later
              const retryDate = new Date();
              retryDate.setHours(retryDate.getHours() + 4);

              await reminderDoc.ref.update({
                retryCount: newRetryCount,
                scheduledDate: admin.firestore.Timestamp.fromDate(retryDate),
                updatedAt: now,
                errorMessage: 'WhatsApp and Email both failed, will retry',
              });
              console.log(`[V2.0 Reminders] Reminder ${reminderId} will retry in 4 hours (attempt ${newRetryCount + 1})`);
            }
          }

          // Small delay to avoid rate limiting
          await sleep(500);
        } catch (error) {
          console.error(`[V2.0 Reminders] Error processing reminder ${reminderId}:`, error);
          failed++;

          // Update reminder with error
          await reminderDoc.ref.update({
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: now,
          });
        }
      }

      console.log(`[V2.0 Reminders] Completed. Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`);
      return null;
    } catch (error) {
      console.error('[V2.0 Reminders] Error in uncollected order reminders:', error);
      throw error;
    }
  });

/**
 * Get email subject based on reminder type
 */
function getEmailSubject(reminderType: ReminderType, orderId: string): string {
  const subjects: Record<ReminderType, string> = {
    '7_days': `Reminder: Your order ${orderId} is ready for collection`,
    '14_days': `Second Reminder: Please collect your order ${orderId}`,
    '30_days': `Final Notice: Order ${orderId} requires immediate collection`,
    'monthly': `Monthly Reminder: Order ${orderId} is still waiting`,
    'disposal_eligible': `URGENT: Order ${orderId} may be disposed - Action Required`,
  };

  return subjects[reminderType] || `Reminder: Order ${orderId}`;
}

/**
 * Generate HTML for uncollected order reminder email
 */
function generateUncollectedReminderEmail(
  customerName: string,
  orderId: string,
  reminderType: ReminderType,
  daysUncollected: number,
  messageContent: string
): string {
  const urgencyLevel = reminderType === 'disposal_eligible'
    ? 'urgent'
    : reminderType === '30_days'
    ? 'high'
    : 'normal';

  const urgencyColor = urgencyLevel === 'urgent'
    ? '#dc2626'
    : urgencyLevel === 'high'
    ? '#f59e0b'
    : '#3b82f6';

  const urgencyText = reminderType === 'disposal_eligible'
    ? 'URGENT: Your items are eligible for disposal'
    : reminderType === '30_days'
    ? 'Final Notice: Please collect your items'
    : 'Reminder: Your items are ready for collection';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .urgency-banner { background: ${urgencyColor}; color: #fff; padding: 15px; text-align: center; font-weight: bold; margin-bottom: 20px; }
        .order-details { background: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid ${urgencyColor}; }
        .days-count { font-size: 48px; font-weight: bold; color: ${urgencyColor}; text-align: center; margin: 20px 0; }
        .days-label { text-align: center; color: #666; }
        .cta-button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fef3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Lorenzo Dry Cleaners</h1>
        </div>
        <div class="urgency-banner">
          ${urgencyText}
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>

          <div class="order-details">
            <h3>Order: ${orderId}</h3>
            <div class="days-count">${daysUncollected}</div>
            <div class="days-label">days since your order was ready</div>
          </div>

          ${reminderType === 'disposal_eligible' ? `
          <div class="warning">
            <strong>Important Notice:</strong> Per our terms and conditions, uncollected items after 90 days
            may be disposed of. Please contact us immediately to arrange collection or discuss alternative options.
          </div>
          ` : ''}

          ${reminderType === '30_days' ? `
          <div class="warning">
            <strong>Storage Notice:</strong> Items uncollected beyond 30 days may incur additional storage
            charges. Please collect your items at your earliest convenience.
          </div>
          ` : ''}

          <p>${messageContent}</p>

          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/orders/${orderId}" class="cta-button">
              View Order Details
            </a>
          </center>

          <p>If you have any questions or need to arrange alternative collection, please contact us.</p>
        </div>
        <div class="footer">
          <p>Lorenzo Dry Cleaners, Kilimani, Nairobi</p>
          <p>Phone: +254 XXX XXX XXX | Email: info@lorenzo-dry-cleaners.com</p>
          <p>This is an automated reminder from our order management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Utility function for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
