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
  DatabaseError,
} from './index';
import type {
  WorkstationAssignment,
  Order,
  User,
  Garment,
  StainDetail,
  RipDetail,
  StaffHandler,
  OrderStatus,
} from './schema';

/**
 * Generate a unique workstation assignment ID
 *
 * @returns Formatted assignment ID
 */
function generateAssignmentId(): string {
  return `ASSIGN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`.toUpperCase();
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
export async function markMajorIssue(orderId: string, garmentId: string): Promise<void> {
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
 * @param adjustEstimatedTime - Optional time adjustment in hours
 * @returns Promise<void>
 */
export async function approveGarmentWithMajorIssue(
  orderId: string,
  garmentId: string,
  managerId: string,
  adjustEstimatedTime?: number
): Promise<void> {
  const order = await getDocument<Order>('orders', orderId);

  // Update order with manager approval
  const updates: any = {
    majorIssuesReviewedBy: managerId,
    majorIssuesApprovedAt: Timestamp.now(),
  };

  // Adjust estimated completion if time adjustment provided
  if (adjustEstimatedTime && adjustEstimatedTime > 0) {
    const currentEstimate = order.estimatedCompletion.toDate();
    const newEstimate = new Date(
      currentEstimate.getTime() + adjustEstimatedTime * 60 * 60 * 1000
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
  const completedAt = Timestamp.now();

  // Calculate duration if start time provided
  let duration: number | undefined;
  if (startTime) {
    duration = completedAt.toMillis() - startTime.toMillis();
    duration = Math.floor(duration / 1000); // Convert to seconds
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

      // Update duration (accumulate if multiple staff)
      if (duration) {
        durations[stage] = (durations[stage] || 0) + duration;
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
 * Get staff performance metrics
 * Calculates average time per stage, orders processed, etc.
 *
 * @param staffId - UID of staff member
 * @param dateRange - Optional date range filter
 * @returns Performance metrics
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
  const constraints: any[] = [where('status', 'in', ['ready', 'delivered', 'collected'])];

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
    stageTotalTime: {} as Record<string, number>,
    efficiencyScore: 0,
  };

  orders.forEach((order) => {
    let staffWorkedOnOrder = false;

    order.garments.forEach((garment) => {
      if (!garment.stageHandlers) return;

      // Check each stage
      Object.entries(garment.stageHandlers).forEach(([stage, handlers]) => {
        // Check if this staff member worked on this stage
        const staffHandler = handlers?.find((h) => h.uid === staffId);
        if (staffHandler) {
          staffWorkedOnOrder = true;

          // Increment stage count
          metrics.stagesCompleted[stage] = (metrics.stagesCompleted[stage] || 0) + 1;

          // Add time if available
          if (garment.stageDurations && garment.stageDurations[stage as keyof typeof garment.stageDurations]) {
            metrics.stageTotalTime[stage] =
              (metrics.stageTotalTime[stage] || 0) + (garment.stageDurations[stage as keyof typeof garment.stageDurations] || 0);
          }
        }
      });
    });

    if (staffWorkedOnOrder) {
      metrics.totalOrdersProcessed++;
    }
  });

  // Calculate averages
  Object.keys(metrics.stageTotalTime).forEach((stage) => {
    const count = metrics.stagesCompleted[stage] || 1;
    metrics.avgTimePerStage[stage] = Math.floor(metrics.stageTotalTime[stage] / count);
  });

  // Calculate efficiency score (simple metric: orders / total time)
  const totalTime = Object.values(metrics.stageTotalTime).reduce((sum, time) => sum + time, 0);
  metrics.efficiencyScore = totalTime > 0 ? metrics.totalOrdersProcessed / (totalTime / 3600) : 0;

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
  stage: 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging',
  staffId: string
): Promise<void> {
  // This is stored at order level for manual assignments
  // Actual tracking happens when staff completes the stage via completeStageForGarment
  const order = await getDocument<Order>('orders', orderId);

  // Store manual assignment in order notes or custom field
  // For now, we'll just ensure the order exists
  // Actual implementation may vary based on UI needs
}

/**
 * Check if all garments in order have completed inspection
 *
 * @param orderId - Order ID
 * @returns Boolean indicating if inspection is complete
 */
export async function isOrderInspectionComplete(orderId: string): Promise<boolean> {
  const order = await getDocument<Order>('orders', orderId);

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
