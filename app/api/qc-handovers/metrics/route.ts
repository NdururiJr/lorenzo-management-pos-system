/**
 * QC Handover Metrics API Route (FR-004)
 *
 * Returns metrics and statistics for QC handovers.
 *
 * @module app/api/qc-handovers/metrics/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { QCHandoverType, QCHandoverStatus } from '@/lib/db/schema';

const COLLECTION_NAME = 'qcHandovers';

/**
 * GET /api/qc-handovers/metrics
 *
 * Get handover metrics for a time period
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default to last 30 days if no dates provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build query
    let query = adminDb
      .collection(COLLECTION_NAME)
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(endDate));

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    const snapshot = await query.get();
    const handovers = snapshot.docs.map((doc) => doc.data());

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
      const hType = handover.handoverType as QCHandoverType;
      byType[hType] = (byType[hType] || 0) + 1;

      // Count by status
      const hStatus = handover.status as QCHandoverStatus;
      byStatus[hStatus] = (byStatus[hStatus] || 0) + 1;

      // Count by branch
      const hBranch = handover.branchId as string;
      byBranch[hBranch] = (byBranch[hBranch] || 0) + 1;

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
      if (handover.acknowledgedAt && handover.createdAt) {
        const timeToAck =
          handover.acknowledgedAt.toMillis() - handover.createdAt.toMillis();
        totalTimeToAcknowledge += timeToAck / (1000 * 60 * 60); // Convert to hours
        acknowledgedCount++;
      }

      // Calculate resolution time for resolved items
      if (handover.status === 'resolved' && handover.resolvedAt && handover.createdAt) {
        const timeToResolve =
          handover.resolvedAt.toMillis() - handover.createdAt.toMillis();
        totalTimeToResolve += timeToResolve / (1000 * 60 * 60); // Convert to hours
      }
    }

    const avgTimeToAcknowledge =
      acknowledgedCount > 0 ? totalTimeToAcknowledge / acknowledgedCount : 0;
    const avgTimeToResolve =
      resolvedCount > 0 ? totalTimeToResolve / resolvedCount : 0;

    const metrics = {
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

    return NextResponse.json({
      success: true,
      data: metrics,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching QC handover metrics:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      },
      { status: 500 }
    );
  }
}
