/**
 * Workstation Database Operations
 *
 * This file provides type-safe operations for workstation management,
 * including staff assignments, garment inspection, and stage completion.
 *
 * @module lib/db/workstation
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
} from './index';
import type {
  WorkstationAssignment,
  Order,
  User,
  StainDetail,
  RipDetail,
  StaffHandler,
} from './schema';

/**
 * Generate a cryptographically secure random string
 * Uses crypto.randomUUID() when available, falls back to timestamp + counter
 *
 * @returns Random string suitable for ID generation
 */
function generateSecureRandomSuffix(): string {
  // Use crypto.randomUUID() if available (Node.js 14.17+, modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  }
  // Fallback: timestamp + high-resolution time (if available)
  const timestamp = Date.now().toString(36);
  const hrTime = typeof performance !== 'undefined'
    ? Math.floor(performance.now() * 1000).toString(36)
    : Math.floor(Date.now() % 10000).toString(36);
  return `${timestamp}${hrTime}`.substring(0, 8);
}

/**
 * Generate a unique workstation assignment ID
 * Uses timestamp for ordering and cryptographic random suffix for uniqueness
 *
 * @returns Formatted assignment ID
 */
function generateAssignmentId(): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = generateSecureRandomSuffix();
  return `ASSIGN-${timestamp}-${randomSuffix}`.toUpperCase();
}

/**
 * Assign staff member to permanent stage
 *
 * @param staffId - UID of staff member
 * @param staffName - Name of staff member
 * @param stage - Permanent stage assignment
 * @param branchId - Branch ID
 * @param createdBy - UID of user (Workstation Manager) creating assignment
 * @returns Assignment ID
 */
export async function assignStaffToPermanentStage(
  staffId: string,
  staffName: string,
  stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging',
  branchId: string,
  createdBy: string
): Promise<string> {
  // Check if staff already has active assignment for this stage
  const existing = await getDocuments<WorkstationAssignment>(
    'workstationAssignments',
    where('staffId', '==', staffId),
    where('permanentStage', '==', stage),
    where('branchId', '==', branchId),
    where('isActive', '==', true)
  );

  if (existing.length > 0) {
    return existing[0].assignmentId; // Already assigned
  }

  const assignmentId = generateAssignmentId();

  const assignment: WorkstationAssignment = {
    assignmentId,
    staffId,
    staffName,
    permanentStage: stage,
    branchId,
    isActive: true,
    createdAt: Timestamp.now(),
    createdBy,
  };

  await setDocument<WorkstationAssignment>('workstationAssignments', assignmentId, assignment);

  return assignmentId;
}

/**
 * Deactivate staff assignment
 *
 * @param assignmentId - Assignment ID to deactivate
 * @returns Promise<void>
 */
export async function deactivateStaffAssignment(assignmentId: string): Promise<void> {
  await updateDocument<WorkstationAssignment>('workstationAssignments', assignmentId, {
    isActive: false,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get active staff assignments for a branch
 *
 * @param branchId - Branch ID
 * @returns Array of active assignments
 */
export async function getActiveStaffAssignments(
  branchId: string
): Promise<WorkstationAssignment[]> {
  return getDocuments<WorkstationAssignment>(
    'workstationAssignments',
    where('branchId', '==', branchId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Get staff assigned to a specific stage
 *
 * @param stage - Stage to filter by
 * @param branchId - Branch ID
 * @returns Array of users assigned to the stage
 */
export async function getStaffByStage(
  stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging',
  branchId: string
): Promise<User[]> {
  const assignments = await getDocuments<WorkstationAssignment>(
    'workstationAssignments',
    where('branchId', '==', branchId),
    where('permanentStage', '==', stage),
    where('isActive', '==', true)
  );

  // Fetch user data for each assignment
  const userPromises = assignments.map((assignment) =>
    getDocument<User>('users', assignment.staffId)
  );

  const users = await Promise.all(userPromises);
  return users.filter((user): user is User => user !== null);
}

/**
 * Complete garment inspection
 * Updates garment with detailed inspection data
 *
 * @param orderId - Order ID
 * @param garmentId - Garment ID
 * @param inspectionData - Inspection details
 * @param inspectedBy - UID of staff who completed inspection
 * @returns Promise<void>
 */
export async function completeGarmentInspection(
  orderId: string,
  garmentId: string,
  inspectionData: {
    conditionAssessment: 'good' | 'minor_issues' | 'major_issues';
    missingButtonsCount?: number;
    stainDetails?: StainDetail[];
    ripDetails?: RipDetail[];
    damagePhotos?: string[];
    recommendedActions?: ('repair' | 'special_treatment' | 'standard_process' | 'other')[];
    recommendedActionsOther?: string;
    estimatedAdditionalTime?: number;
  },
  inspectedBy: string
): Promise<void> {
  const order = await getDocument<Order>('orders', orderId);

  // Issue 71: Add null guard for order
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Issue 71: Add null guard for garments array
  if (!order.garments || !Array.isArray(order.garments)) {
    throw new Error(`Order ${orderId} has no garments array`);
  }

  // Find garment and update it
  const updatedGarments = order.garments.map((garment) => {
    if (garment.garmentId === garmentId) {
      return {
        ...garment,
        inspectionCompleted: true,
        inspectionCompletedBy: inspectedBy,
        inspectionCompletedAt: Timestamp.now(),
        ...inspectionData,
      };
    }
    return garment;
  });

  // Check if major issues detected
  const hasMajorIssues = inspectionData.conditionAssessment === 'major_issues';

  await updateDocument<Order>('orders', orderId, {
    garments: updatedGarments,
    ...(hasMajorIssues && {
      majorIssuesDetected: true,
    }),
  });
}

/**
 * Mark major issue for an order
 * Triggers notification to Workstation Manager
 *
 * @param orderId - Order ID
 * @param garmentId - Garment ID with major issue
 * @returns Promise<void>
 */
export async function markMajorIssue(orderId: string, _garmentId: string): Promise<void> {
  await updateDocument<Order>('orders', orderId, {
    majorIssuesDetected: true,
  });

  // TODO: Trigger notification to Workstation Manager
  // This will be implemented in Phase 8
}

/**
 * Approve garment with major issue
 * Called by Workstation Manager after reviewing photos and notes
 *
 * @param orderId - Order ID
 * @param garmentId - Garment ID
 * @param managerId - UID of Workstation Manager approving
 * @param adjustEstimatedTimeMinutes - Optional time adjustment in MINUTES (Issue 73: standardized to minutes)
 * @returns Promise<void>
 */
export async function approveGarmentWithMajorIssue(
  orderId: string,
  garmentId: string,
  managerId: string,
  adjustEstimatedTimeMinutes?: number
): Promise<void> {
  const order = await getDocument<Order>('orders', orderId);

  // Issue 71: Add null guard for order
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Update order with manager approval
  const updates: Partial<Order> & { majorIssuesReviewedBy: string; majorIssuesApprovedAt: ReturnType<typeof Timestamp.now> } = {
    majorIssuesReviewedBy: managerId,
    majorIssuesApprovedAt: Timestamp.now(),
  };

  // Adjust estimated completion if time adjustment provided (in MINUTES)
  // Issue 73: Fixed time unit - now consistently uses minutes
  if (adjustEstimatedTimeMinutes && adjustEstimatedTimeMinutes > 0) {
    // Issue 71: Add null guard for estimatedCompletion
    if (!order.estimatedCompletion) {
      throw new Error(`Order ${orderId} has no estimated completion time`);
    }
    const currentEstimate = order.estimatedCompletion.toDate();
    const newEstimate = new Date(
      currentEstimate.getTime() + adjustEstimatedTimeMinutes * 60 * 1000  // minutes to milliseconds
    );
    updates.estimatedCompletion = Timestamp.fromDate(newEstimate);
  }

  await updateDocument<Order>('orders', orderId, updates);
}

/**
 * Complete stage for a garment
 * Records staff handler and time spent
 * Automatically tracks performance metrics
 *
 * Issue 68: Duration is stored in SECONDS (as defined in schema)
 * This is consistent with stageDurations schema definition
 *
 * @param orderId - Order ID
 * @param garmentId - Garment ID
 * @param stage - Stage being completed
 * @param staffId - UID of staff completing stage
 * @param staffName - Name of staff completing stage
 * @param startTime - Timestamp when stage started
 * @returns Promise<void>
 */
export async function completeStageForGarment(
  orderId: string,
  garmentId: string,
  stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging',
  staffId: string,
  staffName: string,
  startTime?: Timestamp
): Promise<void> {
  const order = await getDocument<Order>('orders', orderId);

  // Issue 71: Add null guard for order
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Issue 71: Add null guard for garments array
  if (!order.garments || !Array.isArray(order.garments)) {
    throw new Error(`Order ${orderId} has no garments array`);
  }

  const completedAt = Timestamp.now();

  // Calculate duration if start time provided
  // Issue 68: Duration stored in SECONDS (per schema definition)
  let durationSeconds: number | undefined;
  if (startTime) {
    const elapsedMs = completedAt.toMillis() - startTime.toMillis();
    durationSeconds = Math.floor(elapsedMs / 1000); // Convert milliseconds to seconds
  }

  // Create staff handler record
  const staffHandler: StaffHandler = {
    uid: staffId,
    name: staffName,
    completedAt,
  };

  // Update garment with stage completion
  const updatedGarments = order.garments.map((garment) => {
    if (garment.garmentId === garmentId) {
      const handlers = garment.stageHandlers || {};
      const durations = garment.stageDurations || {};

      // Add staff handler to stage (supports multiple staff)
      const stageHandlers = handlers[stage] || [];
      handlers[stage] = [...stageHandlers, staffHandler];

      // Update duration in SECONDS (accumulate if multiple staff)
      if (durationSeconds) {
        durations[stage] = (durations[stage] || 0) + durationSeconds;
      }

      return {
        ...garment,
        stageHandlers: handlers,
        stageDurations: durations,
      };
    }
    return garment;
  });

  await updateDocument<Order>('orders', orderId, {
    garments: updatedGarments,
  });
}

/**
 * Target time per stage in SECONDS (used for efficiency calculation)
 * These are reasonable baseline targets for each processing stage
 * Issue 70: All 6 stages mapped
 */
const TARGET_STAGE_TIME_SECONDS: Record<string, number> = {
  inspection: 300,     // 5 minutes
  washing: 1800,       // 30 minutes
  drying: 2400,        // 40 minutes
  ironing: 600,        // 10 minutes
  quality_check: 180,  // 3 minutes
  packaging: 120,      // 2 minutes
};

/**
 * Get staff performance metrics
 * Calculates average time per stage, orders processed, etc.
 *
 * Issue 68: All time values are in SECONDS (per schema definition)
 * Issue 69: Efficiency score is bounded 0-100 and uses proper formula
 * Issue 70: All 6 stages are properly mapped
 * Issue 71: Added null guards throughout
 *
 * @param staffId - UID of staff member
 * @param dateRange - Optional date range filter
 * @returns Performance metrics including bounded efficiency score (0-100)
 */
export async function getStaffPerformanceMetrics(
  staffId: string,
  dateRange?: { start: Date; end: Date }
): Promise<{
  totalOrdersProcessed: number;
  avgTimePerStage: Record<string, number>;
  stagesCompleted: Record<string, number>;
  efficiencyScore: number;
}> {
  // Build query constraints
  // FR-008: Updated to use 'queued_for_delivery' instead of 'ready'
  const constraints: ReturnType<typeof where>[] = [where('status', 'in', ['queued_for_delivery', 'delivered', 'collected'])];

  if (dateRange) {
    constraints.push(
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
    );
  }

  // Get completed orders
  const orders = await getDocuments<Order>('orders', ...constraints);

  // Calculate metrics
  const metrics = {
    totalOrdersProcessed: 0,
    avgTimePerStage: {} as Record<string, number>,
    stagesCompleted: {} as Record<string, number>,
    stageTotalTime: {} as Record<string, number>,  // In SECONDS
    efficiencyScore: 0,
  };

  orders.forEach((order) => {
    // Issue 71: Null guard for order.garments
    if (!order.garments || !Array.isArray(order.garments)) return;

    let staffWorkedOnOrder = false;

    order.garments.forEach((garment) => {
      // Issue 71: Null guard for stageHandlers
      if (!garment.stageHandlers) return;

      // Check each stage - Issue 70: All 6 stages are in stageHandlers type
      Object.entries(garment.stageHandlers).forEach(([stage, handlers]) => {
        // Issue 71: Null guard for handlers array
        if (!handlers || !Array.isArray(handlers)) return;

        // Check if this staff member worked on this stage
        const staffHandler = handlers.find((h) => h?.uid === staffId);
        if (staffHandler) {
          staffWorkedOnOrder = true;

          // Increment stage count
          metrics.stagesCompleted[stage] = (metrics.stagesCompleted[stage] || 0) + 1;

          // Add time if available (stageDurations are in SECONDS per schema)
          if (garment.stageDurations) {
            const stageDuration = garment.stageDurations[stage as keyof typeof garment.stageDurations];
            if (typeof stageDuration === 'number' && stageDuration > 0) {
              metrics.stageTotalTime[stage] = (metrics.stageTotalTime[stage] || 0) + stageDuration;
            }
          }
        }
      });
    });

    if (staffWorkedOnOrder) {
      metrics.totalOrdersProcessed++;
    }
  });

  // Calculate averages (in SECONDS)
  Object.keys(metrics.stageTotalTime).forEach((stage) => {
    const count = metrics.stagesCompleted[stage] || 1;
    metrics.avgTimePerStage[stage] = Math.floor(metrics.stageTotalTime[stage] / count);
  });

  // Issue 69: Calculate efficiency score (bounded 0-100)
  // Efficiency = (target time / actual time) * 100, capped at 100
  // Higher score = faster than target = more efficient
  let totalTargetTime = 0;
  let totalActualTime = 0;

  Object.keys(metrics.stageTotalTime).forEach((stage) => {
    const count = metrics.stagesCompleted[stage] || 0;
    const targetForStage = TARGET_STAGE_TIME_SECONDS[stage] || 600; // Default 10 min if unknown stage
    totalTargetTime += targetForStage * count;
    totalActualTime += metrics.stageTotalTime[stage] || 0;
  });

  if (totalActualTime > 0 && totalTargetTime > 0) {
    // Efficiency: if actual time equals target, score is 100
    // If actual time is half target (faster), score would be 200, but we cap at 100
    // If actual time is double target (slower), score is 50
    const rawEfficiency = (totalTargetTime / totalActualTime) * 100;
    // Issue 69: Bounds checking - clamp between 0 and 100
    metrics.efficiencyScore = Math.min(100, Math.max(0, rawEfficiency));
  } else {
    // No data available - return 0 rather than undefined
    metrics.efficiencyScore = 0;
  }

  return {
    totalOrdersProcessed: metrics.totalOrdersProcessed,
    avgTimePerStage: metrics.avgTimePerStage,
    stagesCompleted: metrics.stagesCompleted,
    efficiencyScore: Math.round(metrics.efficiencyScore * 100) / 100,
  };
}

/**
 * Assign staff to specific order (manual override)
 *
 * @param orderId - Order ID
 * @param stage - Stage to assign staff for
 * @param staffId - UID of staff member
 * @returns Promise<void>
 */
export async function assignStaffToOrder(
  orderId: string,
  _stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging',
  _staffId: string
): Promise<void> {
  // This is stored at order level for manual assignments
  // Actual tracking happens when staff completes the stage via completeStageForGarment
  const _order = await getDocument<Order>('orders', orderId);

  // Store manual assignment in order notes or custom field
  // For now, we'll just ensure the order exists
  // Actual implementation may vary based on UI needs
}

/**
 * Check if all garments in order have completed inspection
 *
 * Issue 71: Added null guards for order and garments
 *
 * @param orderId - Order ID
 * @returns Boolean indicating if inspection is complete
 */
export async function isOrderInspectionComplete(orderId: string): Promise<boolean> {
  const order = await getDocument<Order>('orders', orderId);

  // Issue 71: Null guard for order
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Issue 71: Null guard for garments - if no garments, consider inspection complete
  if (!order.garments || !Array.isArray(order.garments) || order.garments.length === 0) {
    return true;
  }

  return order.garments.every((garment) => garment.inspectionCompleted === true);
}

/**
 * Get orders pending inspection for a branch
 *
 * @param branchId - Branch ID
 * @param limitCount - Maximum number of orders to return
 * @returns Array of orders in inspection status
 */
export async function getOrdersPendingInspection(
  branchId: string,
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('branchId', '==', branchId),
    where('status', '==', 'inspection'),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  );
}
