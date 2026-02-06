/**
 * Load Metrics API (FR-015)
 *
 * Provides load/capacity metrics for workstations and branches.
 *
 * @module app/api/pricing/load-metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// GET /api/pricing/load-metrics - Get load metrics
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const type = searchParams.get('type'); // 'daily', 'weekly', 'monthly', 'capacity'
    const workstationId = searchParams.get('workstationId');

    // Handle capacity check
    if (type === 'capacity') {
      if (!workstationId) {
        return NextResponse.json(
          { error: 'workstationId required for capacity check' },
          { status: 400 }
        );
      }

      const capacityDoc = await adminDb
        .collection('workstationCapacity')
        .doc(workstationId)
        .get();

      if (!capacityDoc.exists) {
        return NextResponse.json({
          success: true,
          capacity: {
            workstationId,
            maxDailyKg: null,
            currentLoadKg: 0,
            utilizationPercent: 0,
            message: 'No capacity tracking configured',
          },
        });
      }

      const capacity = capacityDoc.data();
      return NextResponse.json({
        success: true,
        capacity: {
          workstationId,
          ...capacity,
          updatedAt: capacity?.updatedAt?.toDate?.() || null,
        },
      });
    }

    // Handle load metrics
    if (!branchId) {
      return NextResponse.json(
        { error: 'branchId is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (type) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'daily':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    // Query orders in the date range
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('branchId', '==', branchId)
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('createdAt', '<=', Timestamp.fromDate(now))
      .limit(1000)
      .get();

    let totalWeightKg = 0;
    let ordersWithWeight = 0; // Track how many orders have weight data
    const byServiceType: Record<string, number> = {};
    const byDay: Record<string, { orders: number; weight: number }> = {};

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();

      // Add total weight
      // Note: totalWeightKg is an optional field (FR-015 Load-Based Pricing)
      // It may not be populated for older orders or non-weight-based pricing
      if (order.totalWeightKg && order.totalWeightKg > 0) {
        totalWeightKg += order.totalWeightKg;
        ordersWithWeight += 1;
      }

      // Track by day
      const orderDate = order.createdAt?.toDate?.();
      if (orderDate) {
        const dayKey = orderDate.toISOString().split('T')[0];
        if (!byDay[dayKey]) {
          byDay[dayKey] = { orders: 0, weight: 0 };
        }
        byDay[dayKey].orders += 1;
        byDay[dayKey].weight += order.totalWeightKg || 0;
      }

      // Track by service type from garments
      // Note: garment.weightKg is optional and may not be populated
      if (order.garments && Array.isArray(order.garments)) {
        order.garments.forEach((garment: { services?: string[]; weightKg?: number }) => {
          const weight = garment.weightKg || 0;
          if (garment.services && Array.isArray(garment.services)) {
            garment.services.forEach((service: string) => {
              byServiceType[service] = (byServiceType[service] || 0) + weight;
            });
          }
        });
      }
    });

    const orderCount = ordersSnapshot.size;
    const avgWeightPerOrder = ordersWithWeight > 0 ? totalWeightKg / ordersWithWeight : 0;
    const weightDataCoverage = orderCount > 0 ? Math.round((ordersWithWeight / orderCount) * 100) : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        branchId,
        period: {
          type: type || 'daily',
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
        totalWeightKg: Math.round(totalWeightKg * 100) / 100,
        orderCount,
        ordersWithWeight,
        avgWeightPerOrder: Math.round(avgWeightPerOrder * 100) / 100,
        weightDataCoverage, // Percentage of orders with weight data (0-100)
        byServiceType,
        byDay,
      },
      // Warn if weight data coverage is low
      ...(weightDataCoverage < 50 && orderCount > 0 && {
        warning: `Only ${weightDataCoverage}% of orders have weight data. Weight metrics may be incomplete.`,
      }),
    });
  } catch (error) {
    console.error('Error fetching load metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch load metrics' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/pricing/load-metrics - Update capacity
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workstationId, branchId, maxDailyKg, weightKg } = body;

    if (action === 'set_capacity') {
      // Set or update workstation capacity
      if (!workstationId || !branchId || maxDailyKg === undefined) {
        return NextResponse.json(
          { error: 'workstationId, branchId, and maxDailyKg are required' },
          { status: 400 }
        );
      }

      await adminDb.collection('workstationCapacity').doc(workstationId).set({
        workstationId,
        branchId,
        maxDailyKg,
        currentLoadKg: 0,
        utilizationPercent: 0,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Workstation capacity set',
        workstationId,
        maxDailyKg,
      });
    }

    if (action === 'add_load') {
      // Add load to workstation
      if (!workstationId || weightKg === undefined) {
        return NextResponse.json(
          { error: 'workstationId and weightKg are required' },
          { status: 400 }
        );
      }

      const capacityRef = adminDb.collection('workstationCapacity').doc(workstationId);
      const capacityDoc = await capacityRef.get();

      if (!capacityDoc.exists) {
        return NextResponse.json(
          { error: 'Workstation capacity not configured' },
          { status: 404 }
        );
      }

      const capacity = capacityDoc.data();
      const newLoad = Math.max(0, (capacity?.currentLoadKg || 0) + weightKg);
      const maxDaily = capacity?.maxDailyKg || 0;
      const utilizationPercent = maxDaily > 0 ? Math.round((newLoad / maxDaily) * 100) : 0;

      await capacityRef.update({
        currentLoadKg: newLoad,
        utilizationPercent,
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        success: true,
        message: weightKg > 0 ? 'Load added' : 'Load removed',
        workstationId,
        currentLoadKg: newLoad,
        utilizationPercent,
        remainingCapacity: Math.max(0, maxDaily - newLoad),
      });
    }

    if (action === 'reset_daily') {
      // Reset daily load for all workstations in a branch
      if (!branchId) {
        return NextResponse.json(
          { error: 'branchId is required' },
          { status: 400 }
        );
      }

      const snapshot = await adminDb
        .collection('workstationCapacity')
        .where('branchId', '==', branchId)
        .get();

      const batch = adminDb.batch();
      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          currentLoadKg: 0,
          utilizationPercent: 0,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `Reset daily load for ${snapshot.size} workstations`,
        branchId,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: set_capacity, add_load, or reset_daily' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating load metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update load metrics' },
      { status: 500 }
    );
  }
}
