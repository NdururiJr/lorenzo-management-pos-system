/**
 * Payment Reminders
 * Scheduled function to send payment reminders for unpaid orders
 * Runs every day at 10 AM EAT
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendPaymentReminderWhatsApp } from '../utils/whatsapp';
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
