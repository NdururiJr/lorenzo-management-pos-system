/**
 * Reminder Scheduler Logic
 *
 * Core business logic for processing automated reminders.
 * Used by Cloud Functions for scheduled reminder processing.
 *
 * V2.0: 7/14/30 day reminders, monthly reminders, and 90-day disposal eligibility.
 *
 * @module lib/reminders/scheduler
 */

import type { Reminder, ReminderType, ReminderStatus } from '@/lib/db/reminders';
import type { Order, Customer } from '@/lib/db/schema';

/**
 * Result of processing a single reminder
 */
export interface ReminderProcessResult {
  reminderId: string;
  success: boolean;
  channel?: 'whatsapp' | 'sms' | 'email';
  error?: string;
}

/**
 * Summary of a batch reminder processing run
 */
export interface ReminderBatchResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  results: ReminderProcessResult[];
  startTime: Date;
  endTime: Date;
}

/**
 * Configuration for reminder processing
 */
export interface ReminderProcessConfig {
  /** Maximum reminders to process in a single batch */
  batchSize: number;
  /** Delay between processing each reminder (ms) */
  processingDelay: number;
  /** Whether to use SMS fallback if WhatsApp fails */
  enableSmsFallback: boolean;
  /** Whether to send email in addition to WhatsApp/SMS */
  enableEmail: boolean;
}

/**
 * Default configuration for reminder processing
 */
export const DEFAULT_REMINDER_CONFIG: ReminderProcessConfig = {
  batchSize: 100,
  processingDelay: 500, // 500ms between messages to avoid rate limiting
  enableSmsFallback: true,
  enableEmail: true,
};

/**
 * V2.0 WhatsApp template names for each reminder type
 * These templates must be pre-approved in Wati.io
 */
export const REMINDER_TEMPLATES: Record<ReminderType, string> = {
  '7_days': 'uncollected_reminder_7day',
  '14_days': 'uncollected_reminder_14day',
  '30_days': 'uncollected_reminder_30day',
  'monthly': 'uncollected_reminder_monthly',
  'disposal_eligible': 'uncollected_reminder_disposal',
};

/**
 * Generate WhatsApp template parameters for a reminder
 */
export function generateReminderTemplateParams(
  reminder: Reminder,
  daysUncollected: number
): Array<{ name: string; value: string }> {
  return [
    { name: 'customer_name', value: reminder.customerName || 'Valued Customer' },
    { name: 'order_id', value: reminder.orderDisplayId || reminder.orderId },
    { name: 'days_uncollected', value: daysUncollected.toString() },
  ];
}

/**
 * Calculate days since order was ready for collection
 */
export function calculateDaysUncollected(
  order: Order,
  currentDate: Date = new Date()
): number {
  // Use the completion date or delivery ready date
  const readyDate = order.actualCompletion || order.deliveryCompletedTime || order.estimatedCompletion;

  if (!readyDate) {
    return 0;
  }

  // Handle Firestore Timestamp
  const readyDateObj = typeof readyDate === 'object' && 'toDate' in readyDate
    ? readyDate.toDate()
    : new Date(readyDate as string | number);

  const diffTime = currentDate.getTime() - readyDateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Determine if an order should receive reminders
 * V2.0: Only for orders ready for customer collection that haven't been collected
 */
export function shouldSendReminder(
  order: Order,
  reminder: Reminder
): { shouldSend: boolean; reason?: string } {
  // Don't send if order is already collected or disposed
  if (['collected', 'disposed', 'cancelled'].includes(order.status)) {
    return { shouldSend: false, reason: 'Order already collected/disposed/cancelled' };
  }

  // Don't send if this is a delivery order (customer doesn't need to collect)
  if (order.returnMethod === 'delivery_required') {
    return { shouldSend: false, reason: 'Delivery order - no collection reminder needed' };
  }

  // Don't send if reminder is not pending
  if (reminder.status !== 'pending') {
    return { shouldSend: false, reason: `Reminder status is ${reminder.status}` };
  }

  // Don't send if customer phone is not available
  if (!reminder.customerPhone) {
    return { shouldSend: false, reason: 'No customer phone number' };
  }

  return { shouldSend: true };
}

/**
 * Generate email HTML content for uncollected order reminder
 */
export function generateReminderEmailHtml(
  reminder: Reminder,
  daysUncollected: number,
  portalUrl: string
): string {
  const urgencyLevel = reminder.reminderType === 'disposal_eligible'
    ? 'urgent'
    : reminder.reminderType === '30_days'
    ? 'high'
    : 'normal';

  const urgencyColor = urgencyLevel === 'urgent'
    ? '#dc2626'
    : urgencyLevel === 'high'
    ? '#f59e0b'
    : '#3b82f6';

  const urgencyText = reminder.reminderType === 'disposal_eligible'
    ? 'URGENT: Your items are eligible for disposal'
    : reminder.reminderType === '30_days'
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
          <p>Dear ${reminder.customerName || 'Valued Customer'},</p>

          <div class="order-details">
            <h3>Order: ${reminder.orderDisplayId || reminder.orderId}</h3>
            <div class="days-count">${daysUncollected}</div>
            <div class="days-label">days since your order was ready</div>
          </div>

          ${reminder.reminderType === 'disposal_eligible' ? `
          <div class="warning">
            <strong>Important Notice:</strong> Per our terms and conditions, uncollected items after 90 days
            may be disposed of. Please contact us immediately to arrange collection or discuss alternative options.
          </div>
          ` : ''}

          ${reminder.reminderType === '30_days' ? `
          <div class="warning">
            <strong>Storage Notice:</strong> Items uncollected beyond 30 days may incur additional storage
            charges. Please collect your items at your earliest convenience.
          </div>
          ` : ''}

          <p>${reminder.messageContent}</p>

          <center>
            <a href="${portalUrl}/portal/orders/${reminder.orderId}" class="cta-button">
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
 * Get the next reminder type after the current one
 */
export function getNextReminderType(currentType: ReminderType): ReminderType | null {
  const sequence: ReminderType[] = ['7_days', '14_days', '30_days', 'monthly', 'disposal_eligible'];
  const currentIndex = sequence.indexOf(currentType);

  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return null;
  }

  // Monthly reminders repeat after 30_days until disposal
  if (currentType === 'monthly') {
    return 'disposal_eligible';
  }

  return sequence[currentIndex + 1];
}

/**
 * Sleep utility for processing delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
