/**
 * Reminders Database Operations
 *
 * Handles automated reminder scheduling and management for uncollected orders.
 * V2.0: 7/14/30 day reminders, monthly reminders, and 90-day disposal eligibility.
 *
 * @module lib/db/reminders
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type { Order, Customer } from './schema';

/**
 * Reminder type enumeration
 */
export type ReminderType = '7_days' | '14_days' | '30_days' | 'monthly' | 'disposal_eligible';

/**
 * Reminder status
 */
export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

/**
 * Reminder document structure
 */
export interface Reminder {
  /** Unique reminder ID */
  reminderId: string;
  /** Reference to the order */
  orderId: string;
  /** Order ID for display */
  orderDisplayId?: string;
  /** Reference to the customer */
  customerId: string;
  /** Customer name (denormalized) */
  customerName?: string;
  /** Customer phone (denormalized) */
  customerPhone?: string;
  /** Type of reminder */
  reminderType: ReminderType;
  /** When the reminder is scheduled to be sent */
  scheduledDate: Timestamp;
  /** When the reminder was actually sent */
  sentDate?: Timestamp;
  /** Status of the reminder */
  status: ReminderStatus;
  /** The message content to be sent */
  messageContent: string;
  /** Channel used (whatsapp, sms, email) */
  channel?: 'whatsapp' | 'sms' | 'email';
  /** Any error message if failed */
  errorMessage?: string;
  /** Number of retry attempts */
  retryCount: number;
  /** Branch ID */
  branchId?: string;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Reminder configuration
 */
export const REMINDER_CONFIG = {
  /** Days after completion for each reminder type */
  intervals: {
    '7_days': 7,
    '14_days': 14,
    '30_days': 30,
    'monthly': 60, // First monthly after 30-day
    'disposal_eligible': 90,
  },
  /** Maximum retry attempts for failed reminders */
  maxRetries: 3,
  /** Retry delay in hours */
  retryDelayHours: 4,
};

/**
 * Generate reminder ID
 */
export function generateReminderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `RMD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Get reminder message template based on type
 */
export function getReminderMessage(
  type: ReminderType,
  customerName: string,
  orderId: string,
  daysUncollected: number
): string {
  const templates: Record<ReminderType, string> = {
    '7_days': `Dear ${customerName}, your order ${orderId} has been ready for pickup for ${daysUncollected} days. Please collect it at your earliest convenience. Thank you for choosing Lorenzo Dry Cleaners!`,
    '14_days': `Reminder: Dear ${customerName}, your order ${orderId} has been waiting for ${daysUncollected} days. Please collect it soon to avoid storage charges. Contact us if you need assistance.`,
    '30_days': `Final Notice: Dear ${customerName}, your order ${orderId} has been uncollected for ${daysUncollected} days. Please arrange collection within 7 days. Storage fees may apply.`,
    'monthly': `Monthly Reminder: Dear ${customerName}, your order ${orderId} remains uncollected for ${daysUncollected} days. Please contact us to arrange collection or discuss options.`,
    'disposal_eligible': `Important: Dear ${customerName}, your order ${orderId} has been uncollected for ${daysUncollected} days and is now eligible for disposal per our terms. Please contact us immediately.`,
  };

  return templates[type];
}

/**
 * Create a reminder for an order
 */
export async function createReminder(
  order: Order,
  customer: Customer,
  reminderType: ReminderType
): Promise<string> {
  try {
    const reminderId = generateReminderId();
    const daysToAdd = REMINDER_CONFIG.intervals[reminderType];

    // Calculate scheduled date from order completion
    const completionDate = order.actualCompletion?.toDate?.() ||
      order.deliveryCompletedTime?.toDate?.() ||
      new Date();
    const scheduledDate = new Date(completionDate);
    scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);

    // Calculate days uncollected (approximate)
    const daysUncollected = daysToAdd;

    const reminder: Reminder = {
      reminderId,
      orderId: order.orderId,
      orderDisplayId: order.orderId,
      customerId: customer.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      reminderType,
      scheduledDate: Timestamp.fromDate(scheduledDate),
      status: 'pending',
      messageContent: getReminderMessage(reminderType, customer.name, order.orderId, daysUncollected),
      channel: 'whatsapp',
      retryCount: 0,
      branchId: order.branchId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDocument('reminders', reminderId, reminder);
    return reminderId;
  } catch (error) {
    throw new DatabaseError('Failed to create reminder', error);
  }
}

/**
 * Schedule all reminders for an order when it's marked as ready/completed
 */
export async function scheduleOrderReminders(
  order: Order,
  customer: Customer
): Promise<string[]> {
  try {
    const reminderIds: string[] = [];

    // Only schedule reminders for customer-collect orders that are ready
    const validStatuses = ['queued_for_delivery', 'ready', 'delivered', 'collected'];
    if (!validStatuses.includes(order.status)) {
      return [];
    }

    // Check if customer needs to collect (not a delivery order)
    if (order.returnMethod === 'delivery_required') {
      return []; // No reminders needed for delivery orders
    }

    // Schedule all reminder types
    const reminderTypes: ReminderType[] = ['7_days', '14_days', '30_days', 'monthly', 'disposal_eligible'];

    for (const type of reminderTypes) {
      // Check if reminder already exists
      const existing = await getDocuments<Reminder>(
        'reminders',
        where('orderId', '==', order.orderId),
        where('reminderType', '==', type),
        limit(1)
      );

      if (existing.length === 0) {
        const id = await createReminder(order, customer, type);
        reminderIds.push(id);
      }
    }

    return reminderIds;
  } catch (error) {
    throw new DatabaseError('Failed to schedule order reminders', error);
  }
}

/**
 * Get pending reminders that need to be sent
 */
export async function getPendingReminders(
  beforeDate?: Date,
  branchId?: string
): Promise<Reminder[]> {
  try {
    const constraints = [
      where('status', '==', 'pending'),
      where('scheduledDate', '<=', Timestamp.fromDate(beforeDate || new Date())),
      orderBy('scheduledDate', 'asc'),
      limit(100), // Process in batches
    ];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    return getDocuments<Reminder>('reminders', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get pending reminders', error);
  }
}

/**
 * Mark a reminder as sent
 */
export async function markReminderSent(reminderId: string): Promise<void> {
  try {
    await updateDocument('reminders', reminderId, {
      status: 'sent' as ReminderStatus,
      sentDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to mark reminder as sent', error);
  }
}

/**
 * Mark a reminder as failed with retry logic
 */
export async function markReminderFailed(
  reminderId: string,
  errorMessage: string
): Promise<void> {
  try {
    const reminder = await getDocument<Reminder>('reminders', reminderId);
    if (!reminder) {
      throw new Error('Reminder not found');
    }

    const newRetryCount = (reminder.retryCount || 0) + 1;
    const shouldRetry = newRetryCount < REMINDER_CONFIG.maxRetries;

    if (shouldRetry) {
      // Schedule retry
      const retryDate = new Date();
      retryDate.setHours(retryDate.getHours() + REMINDER_CONFIG.retryDelayHours);

      await updateDocument('reminders', reminderId, {
        status: 'pending' as ReminderStatus,
        retryCount: newRetryCount,
        errorMessage,
        scheduledDate: Timestamp.fromDate(retryDate),
        updatedAt: Timestamp.now(),
      });
    } else {
      // Max retries reached, mark as failed
      await updateDocument('reminders', reminderId, {
        status: 'failed' as ReminderStatus,
        retryCount: newRetryCount,
        errorMessage: `Max retries reached. Last error: ${errorMessage}`,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new DatabaseError('Failed to mark reminder as failed', error);
  }
}

/**
 * Cancel reminders for an order (when collected)
 */
export async function cancelOrderReminders(orderId: string): Promise<number> {
  try {
    const reminders = await getDocuments<Reminder>(
      'reminders',
      where('orderId', '==', orderId),
      where('status', '==', 'pending')
    );

    let cancelledCount = 0;
    for (const reminder of reminders) {
      await updateDocument('reminders', reminder.reminderId, {
        status: 'cancelled' as ReminderStatus,
        updatedAt: Timestamp.now(),
      });
      cancelledCount++;
    }

    return cancelledCount;
  } catch (error) {
    throw new DatabaseError('Failed to cancel order reminders', error);
  }
}

/**
 * Get reminder history for a customer
 */
export async function getCustomerReminders(customerId: string): Promise<Reminder[]> {
  try {
    return getDocuments<Reminder>(
      'reminders',
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  } catch (error) {
    throw new DatabaseError('Failed to get customer reminders', error);
  }
}

/**
 * Get disposal eligible orders (90+ days uncollected)
 */
export async function getDisposalEligibleOrders(branchId?: string): Promise<{
  reminder: Reminder;
  order: Order | null;
}[]> {
  try {
    const constraints = [
      where('reminderType', '==', 'disposal_eligible'),
      where('status', '==', 'sent'),
      orderBy('sentDate', 'asc'),
    ];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    const reminders = await getDocuments<Reminder>('reminders', ...constraints);

    // Get associated orders
    const results: { reminder: Reminder; order: Order | null }[] = [];

    for (const reminder of reminders) {
      const order = await getDocument<Order>('orders', reminder.orderId);
      // Only include if order is still not collected
      if (order && !['collected', 'disposed'].includes(order.status)) {
        results.push({ reminder, order });
      }
    }

    return results;
  } catch (error) {
    throw new DatabaseError('Failed to get disposal eligible orders', error);
  }
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(
  branchId?: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<{
  total: number;
  pending: number;
  sent: number;
  failed: number;
  byType: Record<ReminderType, number>;
}> {
  try {
    const constraints = [];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    if (periodStart) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(periodStart)));
    }

    if (periodEnd) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(periodEnd)));
    }

    const reminders = await getDocuments<Reminder>('reminders', ...constraints);

    const stats = {
      total: reminders.length,
      pending: 0,
      sent: 0,
      failed: 0,
      byType: {
        '7_days': 0,
        '14_days': 0,
        '30_days': 0,
        'monthly': 0,
        'disposal_eligible': 0,
      } as Record<ReminderType, number>,
    };

    for (const reminder of reminders) {
      if (reminder.status === 'pending') stats.pending++;
      if (reminder.status === 'sent') stats.sent++;
      if (reminder.status === 'failed') stats.failed++;
      if (reminder.reminderType) {
        stats.byType[reminder.reminderType]++;
      }
    }

    return stats;
  } catch (error) {
    throw new DatabaseError('Failed to get reminder stats', error);
  }
}
