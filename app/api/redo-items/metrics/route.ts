/**
 * Redo Items Metrics API Route (FR-002)
 *
 * Returns metrics and statistics for redo items
 *
 * @module app/api/redo-items/metrics/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'redoItems';

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
 * GET /api/redo-items/metrics
 *
 * Get redo items metrics and statistics
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

    // Build query for redo items
    let redoQuery: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION_NAME)
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate));

    if (branchId) {
      redoQuery = redoQuery.where('branchId', '==', branchId);
    }

    const redoSnapshot = await redoQuery.get();

    // Initialize metrics
    const byReasonCode: Record<string, number> = {
      quality_issue: 0,
      damage: 0,
      incomplete_service: 0,
      wrong_service: 0,
      customer_complaint: 0,
      stain_not_removed: 0,
      shrinkage: 0,
      color_damage: 0,
      other: 0,
    };

    const byBranch: Record<string, number> = {};
    const byStatus: Record<string, number> = {
      pending: 0,
      approved: 0,
      in_progress: 0,
      completed: 0,
      rejected: 0,
    };

    let totalResolutionTime = 0;
    let completedCount = 0;

    // Process redo items
    redoSnapshot.forEach((doc) => {
      const data = doc.data();

      // Count by reason code
      const reasonCode = data.reasonCode || 'other';
      byReasonCode[reasonCode] = (byReasonCode[reasonCode] || 0) + 1;

      // Count by branch
      const branch = data.branchId || 'unknown';
      byBranch[branch] = (byBranch[branch] || 0) + 1;

      // Count by status
      const status = data.status || 'pending';
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Calculate resolution time for completed items
      if (data.status === 'completed' && data.reviewedAt && data.createdAt) {
        const resolutionMs =
          data.reviewedAt.toDate().getTime() - data.createdAt.toDate().getTime();
        totalResolutionTime += resolutionMs / (1000 * 60 * 60); // Convert to hours
        completedCount++;
      }
    });

    // Get total orders in the period to calculate redo rate
    let ordersQuery: FirebaseFirestore.Query = adminDb
      .collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate));

    if (branchId) {
      ordersQuery = ordersQuery.where('branchId', '==', branchId);
    }

    const ordersSnapshot = await ordersQuery.get();
    const totalOrders = ordersSnapshot.size;

    const totalRedoItems = redoSnapshot.size;
    const redoRate = totalOrders > 0 ? (totalRedoItems / totalOrders) * 100 : 0;
    const avgResolutionTime = completedCount > 0 ? totalResolutionTime / completedCount : 0;

    // Calculate trend (compare to previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousEnd = new Date(startDate.getTime() - 1);

    let previousRedoQuery: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION_NAME)
      .where('createdAt', '>=', Timestamp.fromDate(previousStart))
      .where('createdAt', '<=', Timestamp.fromDate(previousEnd));

    if (branchId) {
      previousRedoQuery = previousRedoQuery.where('branchId', '==', branchId);
    }

    const previousSnapshot = await previousRedoQuery.get();
    const previousTotal = previousSnapshot.size;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;

    if (previousTotal > 0) {
      trendPercentage = ((totalRedoItems - previousTotal) / previousTotal) * 100;
      if (trendPercentage > 5) {
        trend = 'up';
      } else if (trendPercentage < -5) {
        trend = 'down';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRedoItems,
        byReasonCode,
        byBranch,
        byStatus,
        redoRate: Math.round(redoRate * 100) / 100,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        pendingCount: byStatus.pending || 0,
        inProgressCount: (byStatus.in_progress || 0) + (byStatus.approved || 0),
        completedCount: byStatus.completed || 0,
        rejectedCount: byStatus.rejected || 0,
        trend: {
          direction: trend,
          percentage: Math.round(trendPercentage * 10) / 10,
          previousTotal,
        },
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        totalOrdersInPeriod: totalOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching redo metrics:', error);
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
