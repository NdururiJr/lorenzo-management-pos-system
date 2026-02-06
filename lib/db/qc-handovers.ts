/**
 * QC Handover Database Operations (FR-004)
 *
 * This file provides type-safe CRUD operations for the qcHandovers collection.
 * Manages handovers from QC to Customer Service for issues requiring
 * customer communication or decisions.
 *
 * @module lib/db/qc-handovers
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
  QCHandover,
  QCHandoverStatus,
  QCHandoverType,
  QCHandoverMetrics,
  RecommendedAction,
  Order,
} from './schema';
import { getOrder } from './orders';
import { getCustomer } from './customers';

const COLLECTION_NAME = 'qcHandovers';

/**
 * Generate a unique handover ID
 * Format: HO-[BRANCH]-[YYYYMMDD]-[####]
 *
 * @param branchId - Branch identifier
 * @returns Formatted handover ID
 */
export async function generateHandoverId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Get today's handovers for this branch to determine sequence number
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayHandovers = await getDocuments<QCHandover>(
    COLLECTION_NAME,
    where('branchId', '==', branchId),
    where('createdAt', '>=', Timestamp.fromDate(todayStart)),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayHandovers.length > 0) {
    const lastItem = todayHandovers[0];
    // Extract sequence from last ID (HO-BRANCH-20260119-0001)
    const lastSequence = parseInt(
      lastItem.handoverId.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `HO-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Generate a customer communication template based on handover type
 *
 * @param handoverType - Type of handover
 * @param description - Issue description
 * @param customerName - Customer name
 * @returns Pre-filled communication template
 */
function generateCommunicationTemplate(
  handoverType: QCHandoverType,
  description: string,
  customerName: string
): string {
  const greeting = `Dear ${customerName},`;
  const closing = `\n\nPlease let us know how you would like us to proceed.\n\nBest regards,\nLorenzo Dry Cleaners`;

  switch (handoverType) {
    case 'alteration':
      return `${greeting}\n\nDuring our quality check, we noticed that your garment may benefit from an alteration: ${description}\n\nWe can proceed with this alteration at no additional cost, or return the garment as-is. ${closing}`;

    case 'defect':
      return `${greeting}\n\nWe regret to inform you that during quality inspection, we identified an issue with your garment: ${description}\n\nWe want to discuss the best way to address this. ${closing}`;

    case 'damage':
      return `${greeting}\n\nWe sincerely apologize - during processing, your garment experienced: ${description}\n\nWe would like to discuss compensation options with you. ${closing}`;

    case 'exception':
      return `${greeting}\n\nWe need your input regarding your order: ${description}${closing}`;

    case 'pricing_issue':
      return `${greeting}\n\nRegarding your recent order, we need to discuss the pricing: ${description}\n\nWe want to ensure you are satisfied with the charges. ${closing}`;

    case 'special_care':
      return `${greeting}\n\nYour garment requires special care: ${description}\n\nWe wanted to confirm the appropriate treatment with you before proceeding. ${closing}`;

    default:
      return `${greeting}\n\nWe need to discuss something regarding your order: ${description}${closing}`;
  }
}

/**
 * Create a new QC handover
 *
 * @param data - Handover creation data
 * @returns The created handover
 */
export async function createQCHandover(
  data: Omit<
    QCHandover,
    'handoverId' | 'createdAt' | 'updatedAt' | 'status' | 'customerCommunicationTemplate'
  > & {
    status?: QCHandoverStatus;
  }
): Promise<QCHandover> {
  // Verify order exists
  const order = await getOrder(data.orderId);
  if (!order) {
    throw new DatabaseError(`Order ${data.orderId} not found`);
  }

  // Verify garment exists if garmentId provided
  if (data.garmentId) {
    const garment = order.garments.find((g) => g.garmentId === data.garmentId);
    if (!garment) {
      throw new DatabaseError(
        `Garment ${data.garmentId} not found in order ${data.orderId}`
      );
    }
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

  // Generate handover ID
  const handoverId = await generateHandoverId(data.branchId);
  const now = Timestamp.now();

  // Generate communication template
  const customerCommunicationTemplate = generateCommunicationTemplate(
    data.handoverType,
    data.description,
    customerName || 'Valued Customer'
  );

  const handover: QCHandover = {
    ...data,
    handoverId,
    status: data.status || 'pending',
    customerCommunicationTemplate,
    customerName,
    customerPhone,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument(COLLECTION_NAME, handoverId, handover);
  return handover;
}

/**
 * Get a handover by ID
 *
 * @param handoverId - The handover ID
 * @returns The handover or null if not found
 */
export async function getQCHandover(
  handoverId: string
): Promise<QCHandover | null> {
  try {
    return await getDocument<QCHandover>(COLLECTION_NAME, handoverId);
  } catch {
    return null;
  }
}

/**
 * Get handovers by status
 *
 * @param status - The status to filter by
 * @param branchId - Optional branch filter
 * @returns Array of handovers
 */
export async function getQCHandoversByStatus(
  status: QCHandoverStatus,
  branchId?: string
): Promise<QCHandover[]> {
  const constraints: QueryConstraint[] = [
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<QCHandover>(COLLECTION_NAME, ...constraints);
}

/**
 * Get handovers for an order
 *
 * @param orderId - The order ID
 * @returns Array of handovers for the order
 */
export async function getQCHandoversForOrder(orderId: string): Promise<QCHandover[]> {
  return getDocuments<QCHandover>(
    COLLECTION_NAME,
    where('orderId', '==', orderId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Acknowledge a handover (customer service received it)
 *
 * @param handoverId - The handover ID
 * @param acknowledgedBy - UID of the CS staff acknowledging
 * @param acknowledgedByName - Name of the CS staff
 */
export async function acknowledgeHandover(
  handoverId: string,
  acknowledgedBy: string,
  acknowledgedByName: string
): Promise<void> {
  const handover = await getQCHandover(handoverId);
  if (!handover) {
    throw new DatabaseError(`Handover ${handoverId} not found`);
  }

  if (handover.status !== 'pending') {
    throw new DatabaseError(
      `Handover ${handoverId} is not pending (status: ${handover.status})`
    );
  }

  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    status: 'acknowledged',
    acknowledgedBy,
    acknowledgedByName,
    acknowledgedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Mark handover as in progress
 *
 * @param handoverId - The handover ID
 */
export async function markHandoverInProgress(handoverId: string): Promise<void> {
  const handover = await getQCHandover(handoverId);
  if (!handover) {
    throw new DatabaseError(`Handover ${handoverId} not found`);
  }

  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    status: 'in_progress',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Mark customer as contacted
 *
 * @param handoverId - The handover ID
 * @param customerResponse - Optional initial customer response
 */
export async function markCustomerContacted(
  handoverId: string,
  customerResponse?: string
): Promise<void> {
  const handover = await getQCHandover(handoverId);
  if (!handover) {
    throw new DatabaseError(`Handover ${handoverId} not found`);
  }

  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    status: 'customer_contacted',
    customerNotifiedAt: Timestamp.now(),
    customerResponse,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Resolve a handover
 *
 * @param handoverId - The handover ID
 * @param resolvedBy - UID of the staff resolving
 * @param resolutionNotes - Notes about resolution
 * @param customerResponse - Final customer response/decision
 */
export async function resolveHandover(
  handoverId: string,
  resolvedBy: string,
  resolutionNotes: string,
  customerResponse?: string
): Promise<void> {
  const handover = await getQCHandover(handoverId);
  if (!handover) {
    throw new DatabaseError(`Handover ${handoverId} not found`);
  }

  if (handover.status === 'resolved' || handover.status === 'cancelled') {
    throw new DatabaseError(
      `Handover ${handoverId} is already ${handover.status}`
    );
  }

  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    status: 'resolved',
    resolvedBy,
    resolvedAt: Timestamp.now(),
    resolutionNotes,
    customerResponse: customerResponse || handover.customerResponse,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Cancel a handover
 *
 * @param handoverId - The handover ID
 * @param cancelledBy - UID of the staff cancelling
 * @param reason - Reason for cancellation
 */
export async function cancelHandover(
  handoverId: string,
  cancelledBy: string,
  reason: string
): Promise<void> {
  const handover = await getQCHandover(handoverId);
  if (!handover) {
    throw new DatabaseError(`Handover ${handoverId} not found`);
  }

  if (handover.status === 'resolved' || handover.status === 'cancelled') {
    throw new DatabaseError(
      `Handover ${handoverId} is already ${handover.status}`
    );
  }

  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    status: 'cancelled',
    resolvedBy: cancelledBy,
    resolvedAt: Timestamp.now(),
    resolutionNotes: `Cancelled: ${reason}`,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update handover status
 *
 * @param handoverId - The handover ID
 * @param status - New status
 */
export async function updateHandoverStatus(
  handoverId: string,
  status: QCHandoverStatus
): Promise<void> {
  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    status,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get pending handovers that need attention
 * Returns handovers sorted by priority and age
 *
 * @param branchId - Optional branch filter
 * @returns Array of pending handovers
 */
export async function getPendingHandovers(
  branchId?: string
): Promise<QCHandover[]> {
  const constraints: QueryConstraint[] = [
    where('status', 'in', ['pending', 'acknowledged', 'in_progress']),
    orderBy('createdAt', 'asc'), // Oldest first
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  const handovers = await getDocuments<QCHandover>(COLLECTION_NAME, ...constraints);

  // Sort by priority (urgent first) then by age
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  return handovers.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.createdAt.toMillis() - b.createdAt.toMillis();
  });
}

/**
 * Get QC handover metrics for a time period
 *
 * @param startDate - Start of period
 * @param endDate - End of period
 * @param branchId - Optional branch filter
 * @returns Handover metrics
 */
export async function getQCHandoverMetrics(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<QCHandoverMetrics> {
  // Get handovers in the period
  const constraints: QueryConstraint[] = [
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
  ];

  if (branchId) {
    constraints.push(where('branchId', '==', branchId));
  }

  const handovers = await getDocuments<QCHandover>(COLLECTION_NAME, ...constraints);

  // Calculate metrics
  const byType: Record<QCHandoverType, number> = {
    alteration: 0,
    defect: 0,
    damage: 0,
    exception: 0,
    pricing_issue: 0,
    special_care: 0,
  };

  const byStatus: Record<QCHandoverStatus, number> = {
    pending: 0,
    acknowledged: 0,
    in_progress: 0,
    customer_contacted: 0,
    resolved: 0,
    cancelled: 0,
  };

  const byBranch: Record<string, number> = {};
  let totalTimeToAcknowledge = 0;
  let totalTimeToResolve = 0;
  let acknowledgedCount = 0;
  let resolvedCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;

  for (const handover of handovers) {
    // Count by type
    byType[handover.handoverType] = (byType[handover.handoverType] || 0) + 1;

    // Count by status
    byStatus[handover.status] = (byStatus[handover.status] || 0) + 1;

    // Count by branch
    byBranch[handover.branchId] = (byBranch[handover.branchId] || 0) + 1;

    // Track status counts
    if (handover.status === 'pending') {
      pendingCount++;
    } else if (
      handover.status === 'acknowledged' ||
      handover.status === 'in_progress' ||
      handover.status === 'customer_contacted'
    ) {
      inProgressCount++;
    } else if (handover.status === 'resolved') {
      resolvedCount++;
    }

    // Calculate acknowledgement time
    if (handover.acknowledgedAt) {
      const timeToAck =
        handover.acknowledgedAt.toMillis() - handover.createdAt.toMillis();
      totalTimeToAcknowledge += timeToAck / (1000 * 60 * 60); // Convert to hours
      acknowledgedCount++;
    }

    // Calculate resolution time for resolved items
    if (handover.status === 'resolved' && handover.resolvedAt) {
      const timeToResolve =
        handover.resolvedAt.toMillis() - handover.createdAt.toMillis();
      totalTimeToResolve += timeToResolve / (1000 * 60 * 60); // Convert to hours
    }
  }

  const avgTimeToAcknowledge =
    acknowledgedCount > 0 ? totalTimeToAcknowledge / acknowledgedCount : 0;
  const avgTimeToResolve =
    resolvedCount > 0 ? totalTimeToResolve / resolvedCount : 0;

  return {
    totalHandovers: handovers.length,
    pendingCount,
    inProgressCount,
    resolvedCount,
    byType,
    byBranch,
    avgTimeToAcknowledge,
    avgTimeToResolve,
    byStatus,
  };
}

/**
 * Get all handovers with pagination
 *
 * @param branchId - Optional branch filter
 * @param pageLimit - Number of items per page
 * @returns Array of handovers
 */
export async function getQCHandovers(
  branchId?: string,
  pageLimit = 50
): Promise<QCHandover[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageLimit)];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<QCHandover>(COLLECTION_NAME, ...constraints);
}

/**
 * Get pending handover count for a branch
 *
 * @param branchId - Optional branch filter
 * @returns Count of pending handovers
 */
export async function getPendingHandoverCount(
  branchId?: string
): Promise<number> {
  const handovers = await getQCHandoversByStatus('pending', branchId);
  return handovers.length;
}

/**
 * Link handover to a defect notification (FR-003)
 *
 * @param handoverId - The handover ID
 * @param defectNotificationId - The defect notification ID to link
 */
export async function linkToDefectNotification(
  handoverId: string,
  defectNotificationId: string
): Promise<void> {
  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    defectNotificationId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Link handover to a redo item (FR-002)
 *
 * @param handoverId - The handover ID
 * @param redoItemId - The redo item ID to link
 */
export async function linkToRedoItem(
  handoverId: string,
  redoItemId: string
): Promise<void> {
  await updateDocument<QCHandover>(COLLECTION_NAME, handoverId, {
    redoItemId,
    updatedAt: Timestamp.now(),
  });
}
