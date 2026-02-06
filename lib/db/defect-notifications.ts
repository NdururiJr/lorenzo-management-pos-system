/**
 * Defect Notifications Database Operations (FR-003)
 *
 * This file provides type-safe CRUD operations for the defectNotifications collection.
 * Manages defect tracking with customer notification timelines.
 *
 * @module lib/db/defect-notifications
 */

import { Timestamp, where, orderBy, limit, type QueryConstraint } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type {
  DefectNotification,
  DefectNotificationStatus,
  DefectType,
  DefectNotificationTimeline,
  DefectNotificationMetrics,
} from './schema';
import { getOrder } from './orders';
import { getCustomer } from './customers';

const COLLECTION_NAME = 'defectNotifications';
const TIMELINES_COLLECTION = 'defectNotificationTimelines';

/**
 * Default notification window in hours if no specific timeline configured
 */
const DEFAULT_NOTIFICATION_WINDOW_HOURS = 24;

/**
 * Generate a unique defect notification ID
 * Format: DEF-[BRANCH]-[YYYYMMDD]-[####]
 *
 * @param branchId - Branch identifier
 * @returns Formatted notification ID
 */
export async function generateDefectNotificationId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Get today's notifications for this branch to determine sequence number
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayNotifications = await getDocuments<DefectNotification>(
    COLLECTION_NAME,
    where('branchId', '==', branchId),
    where('createdAt', '>=', Timestamp.fromDate(todayStart)),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayNotifications.length > 0) {
    const lastNotification = todayNotifications[0];
    // Extract sequence from last ID (DEF-BRANCH-20260119-0001)
    const lastSequence = parseInt(
      lastNotification.notificationId.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `DEF-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Get notification timeline for a service type
 *
 * @param serviceType - Service type (e.g., 'dry_cleaning', 'laundry')
 * @returns Timeline configuration or default
 */
export async function getNotificationTimeline(
  serviceType: string
): Promise<DefectNotificationTimeline | null> {
  try {
    const timelines = await getDocuments<DefectNotificationTimeline>(
      TIMELINES_COLLECTION,
      where('serviceType', '==', serviceType),
      where('isActive', '==', true),
      limit(1)
    );
    return timelines.length > 0 ? timelines[0] : null;
  } catch {
    return null;
  }
}

/**
 * Calculate notification deadline based on service type
 *
 * @param serviceTypes - Array of service types for the garment
 * @param identifiedAt - When the defect was identified
 * @returns Deadline timestamp
 */
export async function calculateNotificationDeadline(
  serviceTypes: string[],
  identifiedAt: Date
): Promise<Timestamp> {
  // Find the shortest notification window among all service types
  let minWindowHours = DEFAULT_NOTIFICATION_WINDOW_HOURS;

  for (const serviceType of serviceTypes) {
    const timeline = await getNotificationTimeline(serviceType);
    if (timeline && timeline.notificationWindowHours < minWindowHours) {
      minWindowHours = timeline.notificationWindowHours;
    }
  }

  const deadline = new Date(identifiedAt);
  deadline.setHours(deadline.getHours() + minWindowHours);

  return Timestamp.fromDate(deadline);
}

/**
 * Create a new defect notification
 *
 * @param data - Defect notification creation data
 * @returns The created defect notification
 */
export async function createDefectNotification(
  data: Omit<
    DefectNotification,
    | 'notificationId'
    | 'createdAt'
    | 'updatedAt'
    | 'status'
    | 'notificationDeadline'
    | 'isWithinTimeline'
  >
): Promise<DefectNotification> {
  // Verify order exists
  const order = await getOrder(data.orderId);
  if (!order) {
    throw new DatabaseError(`Order ${data.orderId} not found`);
  }

  // Verify garment exists in the order
  const garment = order.garments.find((g) => g.garmentId === data.garmentId);
  if (!garment) {
    throw new DatabaseError(
      `Garment ${data.garmentId} not found in order ${data.orderId}`
    );
  }

  // Get customer info for denormalization
  let customerName: string | undefined;
  let customerPhone: string | undefined;
  try {
    const customer = await getCustomer(order.customerId);
    customerName = customer.name;
    customerPhone = customer.phone;
  } catch {
    // Use denormalized fields from order if customer fetch fails
    customerName = order.customerName;
    customerPhone = order.customerPhone;
  }

  // Calculate notification deadline based on garment services
  const identifiedAt = data.identifiedAt.toDate();
  const notificationDeadline = await calculateNotificationDeadline(
    garment.services,
    identifiedAt
  );

  // Generate notification ID
  const notificationId = await generateDefectNotificationId(data.branchId);
  const now = Timestamp.now();

  const defectNotification: DefectNotification = {
    ...data,
    notificationId,
    status: 'pending',
    notificationDeadline,
    customerName,
    customerPhone,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument(COLLECTION_NAME, notificationId, defectNotification);
  return defectNotification;
}

/**
 * Get a defect notification by ID
 *
 * @param notificationId - The notification ID
 * @returns The notification or null if not found
 */
export async function getDefectNotification(
  notificationId: string
): Promise<DefectNotification | null> {
  try {
    return await getDocument<DefectNotification>(COLLECTION_NAME, notificationId);
  } catch {
    return null;
  }
}

/**
 * Get defect notifications by status
 *
 * @param status - The status to filter by
 * @param branchId - Optional branch filter
 * @returns Array of defect notifications
 */
export async function getDefectNotificationsByStatus(
  status: DefectNotificationStatus,
  branchId?: string
): Promise<DefectNotification[]> {
  const constraints: QueryConstraint[] = [
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<DefectNotification>(COLLECTION_NAME, ...constraints);
}

/**
 * Get defect notifications approaching deadline
 *
 * @param hoursUntilDeadline - Hours before deadline to check
 * @param branchId - Optional branch filter
 * @returns Array of notifications nearing deadline
 */
export async function getNotificationsNearingDeadline(
  hoursUntilDeadline: number = 2,
  branchId?: string
): Promise<DefectNotification[]> {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setHours(windowEnd.getHours() + hoursUntilDeadline);

  const constraints: QueryConstraint[] = [
    where('status', '==', 'pending'),
    where('notificationDeadline', '<=', Timestamp.fromDate(windowEnd)),
    where('notificationDeadline', '>', Timestamp.fromDate(now)),
    orderBy('notificationDeadline', 'asc'),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<DefectNotification>(COLLECTION_NAME, ...constraints);
}

/**
 * Get overdue notifications (past deadline but not yet notified)
 *
 * @param branchId - Optional branch filter
 * @returns Array of overdue notifications
 */
export async function getOverdueNotifications(
  branchId?: string
): Promise<DefectNotification[]> {
  const now = Timestamp.now();

  const constraints: QueryConstraint[] = [
    where('status', '==', 'pending'),
    where('notificationDeadline', '<', now),
    orderBy('notificationDeadline', 'asc'),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<DefectNotification>(COLLECTION_NAME, ...constraints);
}

/**
 * Mark a defect notification as customer notified
 *
 * @param notificationId - The notification ID
 * @param notifiedBy - UID of the staff who notified customer
 */
export async function markCustomerNotified(
  notificationId: string,
  notifiedBy: string
): Promise<void> {
  const notification = await getDefectNotification(notificationId);
  if (!notification) {
    throw new DatabaseError(`Defect notification ${notificationId} not found`);
  }

  if (notification.status !== 'pending') {
    throw new DatabaseError(
      `Notification ${notificationId} is not pending (status: ${notification.status})`
    );
  }

  const now = Timestamp.now();
  const isWithinTimeline =
    now.toMillis() <= notification.notificationDeadline.toMillis();

  await updateDocument<DefectNotification>(COLLECTION_NAME, notificationId, {
    status: 'notified',
    customerNotifiedAt: now,
    notifiedBy,
    isWithinTimeline,
    updatedAt: now,
  });
}

/**
 * Record customer acknowledgment
 *
 * @param notificationId - The notification ID
 * @param customerResponse - Customer's response/decision
 */
export async function recordCustomerAcknowledgment(
  notificationId: string,
  customerResponse?: string
): Promise<void> {
  const notification = await getDefectNotification(notificationId);
  if (!notification) {
    throw new DatabaseError(`Defect notification ${notificationId} not found`);
  }

  if (notification.status !== 'notified') {
    throw new DatabaseError(
      `Notification ${notificationId} has not been sent to customer yet`
    );
  }

  await updateDocument<DefectNotification>(COLLECTION_NAME, notificationId, {
    status: 'acknowledged',
    acknowledgedAt: Timestamp.now(),
    customerResponse,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Escalate a notification due to missed deadline
 *
 * @param notificationId - The notification ID
 */
export async function escalateNotification(
  notificationId: string
): Promise<void> {
  const notification = await getDefectNotification(notificationId);
  if (!notification) {
    throw new DatabaseError(`Defect notification ${notificationId} not found`);
  }

  await updateDocument<DefectNotification>(COLLECTION_NAME, notificationId, {
    status: 'escalated',
    isWithinTimeline: false,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Resolve a defect notification
 *
 * @param notificationId - The notification ID
 * @param resolvedBy - UID of the staff resolving
 * @param resolutionNotes - Notes on how it was resolved
 */
export async function resolveDefectNotification(
  notificationId: string,
  resolvedBy: string,
  resolutionNotes: string
): Promise<void> {
  const notification = await getDefectNotification(notificationId);
  if (!notification) {
    throw new DatabaseError(`Defect notification ${notificationId} not found`);
  }

  await updateDocument<DefectNotification>(COLLECTION_NAME, notificationId, {
    status: 'resolved',
    resolvedAt: Timestamp.now(),
    resolvedBy,
    resolutionNotes,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get defect notifications for an order
 *
 * @param orderId - The order ID
 * @returns Array of defect notifications for the order
 */
export async function getDefectNotificationsForOrder(
  orderId: string
): Promise<DefectNotification[]> {
  return getDocuments<DefectNotification>(
    COLLECTION_NAME,
    where('orderId', '==', orderId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Get defect notification metrics for a time period
 *
 * @param startDate - Start of period
 * @param endDate - End of period
 * @param branchId - Optional branch filter
 * @returns Defect notification metrics
 */
export async function getDefectNotificationMetrics(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<DefectNotificationMetrics> {
  // Get notifications in the period
  const constraints: QueryConstraint[] = [
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
  ];

  if (branchId) {
    constraints.push(where('branchId', '==', branchId));
  }

  const notifications = await getDocuments<DefectNotification>(
    COLLECTION_NAME,
    ...constraints
  );

  // Calculate metrics
  const byDefectType: Record<DefectType, number> = {
    stain_remaining: 0,
    color_fading: 0,
    shrinkage: 0,
    damage: 0,
    missing_buttons: 0,
    torn_seams: 0,
    discoloration: 0,
    odor: 0,
    other: 0,
  };

  const byBranch: Record<string, number> = {};
  let withinTimeline = 0;
  let missedDeadline = 0;
  let totalTimeToNotify = 0;
  let notifiedCount = 0;
  let pendingCount = 0;

  for (const notification of notifications) {
    // Count by defect type
    byDefectType[notification.defectType] =
      (byDefectType[notification.defectType] || 0) + 1;

    // Count by branch
    byBranch[notification.branchId] =
      (byBranch[notification.branchId] || 0) + 1;

    // Track timeline compliance
    if (notification.isWithinTimeline === true) {
      withinTimeline++;
    } else if (notification.isWithinTimeline === false) {
      missedDeadline++;
    }

    // Calculate notification time
    if (notification.customerNotifiedAt && notification.identifiedAt) {
      const timeToNotify =
        notification.customerNotifiedAt.toMillis() -
        notification.identifiedAt.toMillis();
      totalTimeToNotify += timeToNotify / (1000 * 60 * 60); // Convert to hours
      notifiedCount++;
    }

    // Count pending
    if (notification.status === 'pending') {
      pendingCount++;
    }
  }

  const totalNotifications = notifications.length;
  const complianceRate =
    totalNotifications > 0
      ? (withinTimeline / (withinTimeline + missedDeadline)) * 100
      : 100;
  const avgTimeToNotify =
    notifiedCount > 0 ? totalTimeToNotify / notifiedCount : 0;

  return {
    totalNotifications,
    withinTimeline,
    missedDeadline,
    complianceRate,
    byDefectType,
    byBranch,
    avgTimeToNotify,
    pendingCount,
  };
}

/**
 * Get all defect notifications with pagination
 *
 * @param branchId - Optional branch filter
 * @param pageLimit - Number of items per page
 * @returns Array of defect notifications
 */
export async function getDefectNotifications(
  branchId?: string,
  pageLimit = 50
): Promise<DefectNotification[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageLimit)];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<DefectNotification>(COLLECTION_NAME, ...constraints);
}

/**
 * Get pending notification count
 *
 * @param branchId - Optional branch filter
 * @returns Count of pending notifications
 */
export async function getPendingDefectNotificationsCount(
  branchId?: string
): Promise<number> {
  const notifications = await getDefectNotificationsByStatus('pending', branchId);
  return notifications.length;
}

// ============================================
// TIMELINE CONFIGURATION OPERATIONS
// ============================================

/**
 * Create or update a notification timeline configuration
 *
 * @param data - Timeline configuration data
 * @returns The created/updated timeline
 */
export async function upsertNotificationTimeline(
  data: Omit<DefectNotificationTimeline, 'timelineId' | 'createdAt' | 'updatedAt'>
): Promise<DefectNotificationTimeline> {
  // Check if timeline for this service type exists
  const existing = await getNotificationTimeline(data.serviceType);

  if (existing) {
    // Update existing
    await updateDocument<DefectNotificationTimeline>(
      TIMELINES_COLLECTION,
      existing.timelineId,
      {
        ...data,
        updatedAt: Timestamp.now(),
      }
    );
    return {
      ...existing,
      ...data,
      updatedAt: Timestamp.now(),
    };
  }

  // Create new
  const timelineId = `TIMELINE-${data.serviceType.toUpperCase()}-${Date.now()}`;
  const now = Timestamp.now();

  const timeline: DefectNotificationTimeline = {
    timelineId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument(TIMELINES_COLLECTION, timelineId, timeline);
  return timeline;
}

/**
 * Get all active notification timelines
 *
 * @returns Array of active timeline configurations
 */
export async function getActiveNotificationTimelines(): Promise<
  DefectNotificationTimeline[]
> {
  return getDocuments<DefectNotificationTimeline>(
    TIMELINES_COLLECTION,
    where('isActive', '==', true),
    orderBy('serviceType', 'asc')
  );
}

/**
 * Deactivate a notification timeline
 *
 * @param timelineId - The timeline ID
 */
export async function deactivateNotificationTimeline(
  timelineId: string
): Promise<void> {
  await updateDocument<DefectNotificationTimeline>(TIMELINES_COLLECTION, timelineId, {
    isActive: false,
    updatedAt: Timestamp.now(),
  });
}
