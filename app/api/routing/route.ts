/**
 * Order Routing API (FR-006)
 *
 * Handles order routing operations including:
 * - Routing orders to workstations
 * - Getting routing status and metrics
 * - Managing workstation assignments
 *
 * @module app/api/routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// POST /api/routing - Route an order to workstation
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId, action } = body;

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and userId' },
        { status: 400 }
      );
    }

    // Get the order
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    const order = orderDoc.data();

    // Handle different routing actions
    switch (action) {
      case 'route_to_workstation': {
        // Get the source branch to determine routing
        const branchDoc = await adminDb.collection('branches').doc(order?.branchId).get();
        const branch = branchDoc.data();

        // Determine processing branch (main store for satellites)
        let processingBranchId = order?.branchId;
        if (branch?.branchType === 'satellite' && branch?.mainStoreId) {
          processingBranchId = branch.mainStoreId;
        }

        // Check if transfer is needed
        const needsTransfer = order?.branchId !== processingBranchId;
        const routingStatus = needsTransfer ? 'pending' : 'assigned';

        // Update order with routing information
        await adminDb.collection('orders').doc(orderId).update({
          processingBranchId,
          routingStatus,
          routedAt: Timestamp.now(),
          originBranchId: order?.branchId,
          destinationBranchId: processingBranchId,
        });

        // If no transfer needed and order is received, move to inspection
        if (!needsTransfer && order?.status === 'received') {
          await adminDb.collection('orders').doc(orderId).update({
            status: 'inspection',
            assignedWorkstationStage: 'inspection',
          });
        }

        return NextResponse.json({
          success: true,
          orderId,
          processingBranchId,
          routingStatus,
          needsTransfer,
          message: needsTransfer
            ? 'Order queued for inter-branch transfer'
            : 'Order routed to workstation for inspection',
        });
      }

      case 'mark_received': {
        // Mark order as received at processing branch
        await adminDb.collection('orders').doc(orderId).update({
          routingStatus: 'received',
          arrivedAtBranchAt: Timestamp.now(),
          receivedAtMainStoreAt: Timestamp.now(),
          status: 'inspection',
          assignedWorkstationStage: 'inspection',
        });

        return NextResponse.json({
          success: true,
          orderId,
          routingStatus: 'received',
          message: 'Order received and assigned to inspection',
        });
      }

      case 'assign_to_stage': {
        const { stage, staffId } = body;
        if (!stage) {
          return NextResponse.json(
            { error: 'Stage is required for assignment' },
            { status: 400 }
          );
        }

        const updateData: Record<string, unknown> = {
          routingStatus: 'assigned',
          assignedWorkstationStage: stage,
        };

        if (staffId) {
          updateData.assignedWorkstationStaffId = staffId;
        }

        await adminDb.collection('orders').doc(orderId).update(updateData);

        return NextResponse.json({
          success: true,
          orderId,
          stage,
          staffId,
          message: `Order assigned to ${stage} stage`,
        });
      }

      case 'mark_processing': {
        const { staffId: processingStaffId } = body;

        await adminDb.collection('orders').doc(orderId).update({
          routingStatus: 'processing',
          assignedWorkstationStaffId: processingStaffId || null,
        });

        return NextResponse.json({
          success: true,
          orderId,
          routingStatus: 'processing',
          message: 'Order marked as being processed',
        });
      }

      case 'complete_processing': {
        // Get branch for sorting window calculation
        const processingBranchId = order?.processingBranchId || order?.branchId;
        const branchDoc = await adminDb.collection('branches').doc(processingBranchId).get();
        const branch = branchDoc.data();
        const sortingWindowHours = branch?.sortingWindowHours || 6;

        // Calculate earliest delivery time
        const earliestDeliveryTime = new Date();
        earliestDeliveryTime.setHours(earliestDeliveryTime.getHours() + sortingWindowHours);

        await adminDb.collection('orders').doc(orderId).update({
          routingStatus: 'ready_for_return',
          sortingCompletedAt: Timestamp.now(),
          earliestDeliveryTime: Timestamp.fromDate(earliestDeliveryTime),
          status: 'queued_for_delivery',
        });

        return NextResponse.json({
          success: true,
          orderId,
          routingStatus: 'ready_for_return',
          earliestDeliveryTime: earliestDeliveryTime.toISOString(),
          message: 'Order processing complete, ready for delivery/collection',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: route_to_workstation, mark_received, assign_to_stage, mark_processing, complete_processing' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in routing operation:', error);
    return NextResponse.json(
      { error: 'Failed to process routing operation' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/routing - Get routing information
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const staffId = searchParams.get('staffId');
    const type = searchParams.get('type'); // 'metrics' for metrics view
    const limitParam = searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam, 10) : 50;

    if (!branchId && !staffId && type !== 'metrics') {
      return NextResponse.json(
        { error: 'branchId or staffId is required' },
        { status: 400 }
      );
    }

    // Handle metrics request
    if (type === 'metrics' && branchId) {
      const stages = ['inspection', 'washing', 'drying', 'ironing', 'quality_check', 'packaging'];
      const queueByStage: Record<string, number> = {};

      // Get queue depth for each stage
      for (const stg of stages) {
        const snapshot = await adminDb.collection('orders')
          .where('processingBranchId', '==', branchId)
          .where('assignedWorkstationStage', '==', stg)
          .where('routingStatus', 'in', ['assigned', 'processing'])
          .get();
        queueByStage[stg] = snapshot.size;
      }

      // Get other counts
      const [pendingSnapshot, inTransitSnapshot, readySnapshot] = await Promise.all([
        adminDb.collection('orders')
          .where('branchId', '==', branchId)
          .where('routingStatus', '==', 'pending')
          .get(),
        adminDb.collection('orders')
          .where('destinationBranchId', '==', branchId)
          .where('routingStatus', '==', 'in_transit')
          .get(),
        adminDb.collection('orders')
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', '==', 'ready_for_return')
          .get(),
      ]);

      return NextResponse.json({
        success: true,
        metrics: {
          pendingRouting: pendingSnapshot.size,
          inTransit: inTransitSnapshot.size,
          queueByStage,
          readyForReturn: readySnapshot.size,
          totalInProcess: Object.values(queueByStage).reduce((a, b) => a + b, 0),
        },
      });
    }

    // Build query based on parameters
    let query = adminDb.collection('orders') as FirebaseFirestore.Query;

    if (staffId) {
      // Get orders assigned to specific staff
      query = query
        .where('assignedWorkstationStaffId', '==', staffId)
        .where('routingStatus', 'in', ['assigned', 'processing']);
    } else if (stage && branchId) {
      // Get orders at specific stage
      query = query
        .where('processingBranchId', '==', branchId)
        .where('assignedWorkstationStage', '==', stage)
        .where('routingStatus', 'in', ['assigned', 'processing']);
    } else if (status && branchId) {
      // Get orders by routing status
      if (status === 'pending') {
        query = query
          .where('branchId', '==', branchId)
          .where('routingStatus', '==', 'pending');
      } else if (status === 'in_transit') {
        query = query
          .where('destinationBranchId', '==', branchId)
          .where('routingStatus', '==', 'in_transit');
      } else if (status === 'ready_for_return') {
        query = query
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', '==', 'ready_for_return');
      } else {
        query = query
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', '==', status);
      }
    } else if (branchId) {
      // Get all orders for branch in routing
      query = query
        .where('processingBranchId', '==', branchId)
        .where('routingStatus', 'in', ['pending', 'assigned', 'processing']);
    }

    const snapshot = await query.limit(limitCount).get();
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        routedAt: data.routedAt?.toDate?.() || data.routedAt,
        arrivedAtBranchAt: data.arrivedAtBranchAt?.toDate?.() || data.arrivedAtBranchAt,
        sortingCompletedAt: data.sortingCompletedAt?.toDate?.() || data.sortingCompletedAt,
        earliestDeliveryTime: data.earliestDeliveryTime?.toDate?.() || data.earliestDeliveryTime,
      };
    });

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching routing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routing data' },
      { status: 500 }
    );
  }
}
