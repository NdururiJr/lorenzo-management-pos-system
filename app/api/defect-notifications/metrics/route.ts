/**
 * Defect Notifications Metrics API Route (FR-003)
 *
 * Returns metrics and statistics for defect notifications compliance.
 *
 * @module app/api/defect-notifications/metrics/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'defectNotifications';

/**
 * Roles allowed to view metrics
 */
const METRICS_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'workstation_manager',
];

/**
 * GET /api/defect-notifications/metrics
 *
 * Get defect notification metrics and statistics
 *
 * Query Parameters:
 * - startDate: Start of period (ISO string, default: 30 days ago)
 * - endDate: End of period (ISO string, default: now)
 * - branchId: Filter by branch (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user document to check role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    if (!userData?.role || !METRICS_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const branchId = searchParams.get('branchId');

    // Default to last 30 days
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(defaultStart.getDate() - 30);

    const startDate = startDateParam ? new Date(startDateParam) : defaultStart;
    const endDate = endDateParam ? new Date(endDateParam) : now;

    // Build query for defect notifications
    let notificationQuery: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION_NAME)
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate));

    if (branchId) {
      notificationQuery = notificationQuery.where('branchId', '==', branchId);
    }

    const snapshot = await notificationQuery.get();

    // Initialize metrics
    const byDefectType: Record<string, number> = {
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
    const byStatus: Record<string, number> = {
      pending: 0,
      notified: 0,
      acknowledged: 0,
      escalated: 0,
      resolved: 0,
    };

    let withinTimeline = 0;
    let missedDeadline = 0;
    let totalTimeToNotify = 0;
    let notifiedCount = 0;

    // Process notifications
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Count by defect type
      const defectType = data.defectType || 'other';
      byDefectType[defectType] = (byDefectType[defectType] || 0) + 1;

      // Count by branch
      const branch = data.branchId || 'unknown';
      byBranch[branch] = (byBranch[branch] || 0) + 1;

      // Count by status
      const status = data.status || 'pending';
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Track timeline compliance
      if (data.isWithinTimeline === true) {
        withinTimeline++;
      } else if (data.isWithinTimeline === false) {
        missedDeadline++;
      }

      // Calculate notification time for notified items
      if (data.customerNotifiedAt && data.identifiedAt) {
        const timeToNotify =
          data.customerNotifiedAt.toDate().getTime() -
          data.identifiedAt.toDate().getTime();
        totalTimeToNotify += timeToNotify / (1000 * 60 * 60); // Convert to hours
        notifiedCount++;
      }
    });

    const totalNotifications = snapshot.size;
    const complianceRate =
      withinTimeline + missedDeadline > 0
        ? (withinTimeline / (withinTimeline + missedDeadline)) * 100
        : 100;
    const avgTimeToNotify = notifiedCount > 0 ? totalTimeToNotify / notifiedCount : 0;

    // Calculate trend (compare to previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousEnd = new Date(startDate.getTime() - 1);

    let previousQuery: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION_NAME)
      .where('createdAt', '>=', Timestamp.fromDate(previousStart))
      .where('createdAt', '<=', Timestamp.fromDate(previousEnd));

    if (branchId) {
      previousQuery = previousQuery.where('branchId', '==', branchId);
    }

    const previousSnapshot = await previousQuery.get();
    const previousTotal = previousSnapshot.size;

    let previousWithinTimeline = 0;
    let previousMissedDeadline = 0;

    previousSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isWithinTimeline === true) {
        previousWithinTimeline++;
      } else if (data.isWithinTimeline === false) {
        previousMissedDeadline++;
      }
    });

    const previousComplianceRate =
      previousWithinTimeline + previousMissedDeadline > 0
        ? (previousWithinTimeline / (previousWithinTimeline + previousMissedDeadline)) * 100
        : 100;

    let complianceTrend: 'up' | 'down' | 'stable' = 'stable';
    const complianceChange = complianceRate - previousComplianceRate;

    if (complianceChange > 2) {
      complianceTrend = 'up'; // Compliance improving (good)
    } else if (complianceChange < -2) {
      complianceTrend = 'down'; // Compliance declining (bad)
    }

    return NextResponse.json({
      success: true,
      data: {
        totalNotifications,
        withinTimeline,
        missedDeadline,
        complianceRate: Math.round(complianceRate * 100) / 100,
        avgTimeToNotify: Math.round(avgTimeToNotify * 10) / 10,
        byDefectType,
        byBranch,
        byStatus,
        pendingCount: byStatus.pending || 0,
        escalatedCount: byStatus.escalated || 0,
        resolvedCount: byStatus.resolved || 0,
        trend: {
          direction: complianceTrend,
          complianceChange: Math.round(complianceChange * 10) / 10,
          previousComplianceRate: Math.round(previousComplianceRate * 100) / 100,
          previousTotal,
        },
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching defect notification metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
