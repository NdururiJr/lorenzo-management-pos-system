/**
 * Delivery Schedule Validation API (FR-007)
 *
 * Validates if an order can be scheduled for delivery based on
 * the sorting window requirements.
 *
 * @module app/api/routing/validate-delivery
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// ============================================
// POST /api/routing/validate-delivery
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, scheduledTime } = body;

    if (!orderId || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and scheduledTime' },
        { status: 400 }
      );
    }

    // Parse the scheduled time
    const proposedTime = new Date(scheduledTime);
    if (isNaN(proposedTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduledTime format' },
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

    // Get the processing branch for sorting window
    const processingBranchId = order?.processingBranchId || order?.branchId;
    const branchDoc = await adminDb.collection('branches').doc(processingBranchId).get();
    const branch = branchDoc.data();
    const sortingWindowHours = branch?.sortingWindowHours || 6;

    // Calculate earliest delivery time
    let earliestTime: Date;

    if (order?.earliestDeliveryTime) {
      // Use stored earliest delivery time
      earliestTime = order.earliestDeliveryTime.toDate();
    } else {
      // Calculate from arrival time or current time
      const baselineTime = order?.arrivedAtBranchAt?.toDate() || new Date();
      earliestTime = new Date(baselineTime.getTime() + sortingWindowHours * 60 * 60 * 1000);
    }

    // Check if proposed time is valid
    const isValid = proposedTime >= earliestTime;

    if (!isValid) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: `Cannot schedule delivery before ${earliestTime.toISOString()}. Sorting window (${sortingWindowHours} hours) must complete first.`,
        earliestTime: earliestTime.toISOString(),
        sortingWindowHours,
        proposedTime: proposedTime.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      earliestTime: earliestTime.toISOString(),
      proposedTime: proposedTime.toISOString(),
      sortingWindowHours,
      message: 'Proposed delivery time is valid',
    });
  } catch (error) {
    console.error('Error validating delivery schedule:', error);
    return NextResponse.json(
      { error: 'Failed to validate delivery schedule' },
      { status: 500 }
    );
  }
}
