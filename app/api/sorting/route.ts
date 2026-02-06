/**
 * Sorting Timeline API (FR-007)
 *
 * Handles sorting timeline operations including:
 * - Recording branch arrival
 * - Completing sorting
 * - Getting sorting metrics
 * - Validating delivery schedules
 *
 * @module app/api/sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Default sorting window in hours
const DEFAULT_SORTING_WINDOW_HOURS = 6;

// ============================================
// POST /api/sorting - Sorting operations
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
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

    switch (action) {
      case 'record_arrival': {
        // Get branch for sorting window
        const branchId = body.branchId || order?.processingBranchId || order?.branchId;
        const branchDoc = await adminDb.collection('branches').doc(branchId).get();
        const branch = branchDoc.data();
        const sortingWindowHours = branch?.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;

        // Calculate earliest delivery time
        const arrivalTime = new Date();
        const earliestDeliveryTime = new Date(
          arrivalTime.getTime() + sortingWindowHours * 60 * 60 * 1000
        );

        // Update order
        await adminDb.collection('orders').doc(orderId).update({
          arrivedAtBranchAt: Timestamp.fromDate(arrivalTime),
          earliestDeliveryTime: Timestamp.fromDate(earliestDeliveryTime),
          routingStatus: 'received',
        });

        return NextResponse.json({
          success: true,
          orderId,
          arrivalTime: arrivalTime.toISOString(),
          earliestDeliveryTime: earliestDeliveryTime.toISOString(),
          sortingWindowHours,
          message: `Order arrived. Earliest delivery: ${earliestDeliveryTime.toLocaleString()}`,
        });
      }

      case 'complete_sorting': {
        await adminDb.collection('orders').doc(orderId).update({
          sortingCompletedAt: Timestamp.now(),
          routingStatus: 'ready_for_return',
        });

        return NextResponse.json({
          success: true,
          orderId,
          sortingCompletedAt: new Date().toISOString(),
          message: 'Sorting completed. Order ready for delivery scheduling.',
        });
      }

      case 'validate_delivery_time': {
        const { scheduledTime } = body;
        if (!scheduledTime) {
          return NextResponse.json(
            { error: 'Scheduled time is required' },
            { status: 400 }
          );
        }

        const proposedTime = new Date(scheduledTime);
        if (isNaN(proposedTime.getTime())) {
          return NextResponse.json(
            { error: 'Invalid scheduled time format' },
            { status: 400 }
          );
        }

        // Get branch for sorting window
        const branchId = order?.processingBranchId || order?.branchId;
        const branchDoc = await adminDb.collection('branches').doc(branchId).get();
        const branch = branchDoc.data();
        const sortingWindowHours = branch?.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;

        // Calculate earliest delivery time
        let earliestTime: Date;
        if (order?.earliestDeliveryTime) {
          earliestTime = order.earliestDeliveryTime.toDate();
        } else if (order?.arrivedAtBranchAt) {
          earliestTime = new Date(
            order.arrivedAtBranchAt.toDate().getTime() + sortingWindowHours * 60 * 60 * 1000
          );
        } else {
          earliestTime = new Date(Date.now() + sortingWindowHours * 60 * 60 * 1000);
        }

        const isValid = proposedTime >= earliestTime;

        return NextResponse.json({
          success: true,
          valid: isValid,
          proposedTime: proposedTime.toISOString(),
          earliestTime: earliestTime.toISOString(),
          sortingWindowHours,
          error: isValid ? undefined : `Cannot schedule before ${earliestTime.toLocaleString()}`,
        });
      }

      case 'get_remaining_window': {
        // Get branch for sorting window
        const branchId = order?.processingBranchId || order?.branchId;
        const branchDoc = await adminDb.collection('branches').doc(branchId).get();
        const branch = branchDoc.data();
        const sortingWindowHours = branch?.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;

        // Check if sorting is complete
        if (order?.sortingCompletedAt) {
          return NextResponse.json({
            success: true,
            orderId,
            remainingMinutes: 0,
            earliestDeliveryTime: order.earliestDeliveryTime?.toDate?.().toISOString() || null,
            isComplete: true,
          });
        }

        // Calculate earliest delivery time
        let earliestTime: Date;
        if (order?.earliestDeliveryTime) {
          earliestTime = order.earliestDeliveryTime.toDate();
        } else if (order?.arrivedAtBranchAt) {
          earliestTime = new Date(
            order.arrivedAtBranchAt.toDate().getTime() + sortingWindowHours * 60 * 60 * 1000
          );
        } else {
          earliestTime = new Date(Date.now() + sortingWindowHours * 60 * 60 * 1000);
        }

        const now = new Date();
        const remainingMs = earliestTime.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.ceil(remainingMs / (60 * 1000)));

        return NextResponse.json({
          success: true,
          orderId,
          remainingMinutes,
          earliestDeliveryTime: earliestTime.toISOString(),
          isComplete: remainingMinutes === 0,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: record_arrival, complete_sorting, validate_delivery_time, get_remaining_window' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in sorting operation:', error);
    return NextResponse.json(
      { error: 'Failed to process sorting operation' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/sorting - Get sorting data
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const type = searchParams.get('type'); // 'metrics', 'pending', 'expiring', 'ready'
    const hoursThreshold = parseInt(searchParams.get('hoursThreshold') || '2', 10);
    const limitParam = searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam, 10) : 50;

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    // Get branch config
    const branchDoc = await adminDb.collection('branches').doc(branchId).get();
    if (!branchDoc.exists) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    const branch = branchDoc.data();
    const sortingWindowHours = branch?.sortingWindowHours || DEFAULT_SORTING_WINDOW_HOURS;

    // Handle metrics request
    if (type === 'metrics') {
      // Get counts for different states
      const [pendingSnapshot, readySnapshot] = await Promise.all([
        adminDb.collection('orders')
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', 'in', ['received', 'assigned', 'processing'])
          .get(),
        adminDb.collection('orders')
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', '==', 'ready_for_return')
          .get(),
      ]);

      // Count expiring orders
      const thresholdTime = new Date();
      thresholdTime.setHours(thresholdTime.getHours() + hoursThreshold);

      let expiringCount = 0;
      pendingSnapshot.forEach(doc => {
        const order = doc.data();
        if (order.earliestDeliveryTime && !order.sortingCompletedAt) {
          const earliestTime = order.earliestDeliveryTime.toDate();
          if (earliestTime <= thresholdTime) {
            expiringCount++;
          }
        }
      });

      // Calculate average sorting time
      let totalSortingTime = 0;
      let sortedCount = 0;

      readySnapshot.forEach(doc => {
        const order = doc.data();
        if (order.arrivedAtBranchAt && order.sortingCompletedAt) {
          const arrivalTime = order.arrivedAtBranchAt.toDate().getTime();
          const completionTime = order.sortingCompletedAt.toDate().getTime();
          totalSortingTime += (completionTime - arrivalTime) / (60 * 1000);
          sortedCount++;
        }
      });

      const avgSortingTimeMinutes = sortedCount > 0
        ? Math.round(totalSortingTime / sortedCount)
        : 0;

      return NextResponse.json({
        success: true,
        metrics: {
          pendingSorting: pendingSnapshot.size,
          expiringSoon: expiringCount,
          readyForScheduling: readySnapshot.size,
          avgSortingTimeMinutes,
          sortingWindowHours,
          hoursThreshold,
        },
      });
    }

    // Handle specific order lists
    let query = adminDb.collection('orders') as FirebaseFirestore.Query;

    switch (type) {
      case 'pending':
        query = query
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', 'in', ['received', 'assigned', 'processing'])
          .orderBy('arrivedAtBranchAt', 'asc');
        break;

      case 'expiring':
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + hoursThreshold);
        query = query
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', 'in', ['received', 'assigned', 'processing'])
          .where('earliestDeliveryTime', '<=', Timestamp.fromDate(expiryTime))
          .orderBy('earliestDeliveryTime', 'asc');
        break;

      case 'ready':
        query = query
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', '==', 'ready_for_return')
          .orderBy('sortingCompletedAt', 'asc');
        break;

      default:
        // Return all sorting-related orders
        query = query
          .where('processingBranchId', '==', branchId)
          .where('routingStatus', 'in', ['received', 'assigned', 'processing', 'ready_for_return']);
    }

    const snapshot = await query.limit(limitCount).get();
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        arrivedAtBranchAt: data.arrivedAtBranchAt?.toDate?.() || data.arrivedAtBranchAt,
        earliestDeliveryTime: data.earliestDeliveryTime?.toDate?.() || data.earliestDeliveryTime,
        sortingCompletedAt: data.sortingCompletedAt?.toDate?.() || data.sortingCompletedAt,
      };
    });

    // Filter out already-sorted orders for expiring type
    const filteredOrders = type === 'expiring'
      ? orders.filter(order => !order.sortingCompletedAt)
      : orders;

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      count: filteredOrders.length,
      sortingWindowHours,
    });
  } catch (error) {
    console.error('Error fetching sorting data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sorting data' },
      { status: 500 }
    );
  }
}
