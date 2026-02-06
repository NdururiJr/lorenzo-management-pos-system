/**
 * Individual Driver Payout API Route (FR-009)
 *
 * Handles GET, PUT for a specific driver payout.
 *
 * @module app/api/admin/driver-payouts/[payoutId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'driverPayouts';

/**
 * Roles allowed to manage driver payouts
 */
const MANAGE_ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'store_manager'];

/**
 * Validation schema for updating payout status
 */
const updatePayoutSchema = z.object({
  action: z.enum(['process', 'complete', 'fail', 'cancel']),
  mpesaRef: z.string().optional(),
  bankRef: z.string().optional(),
  failureReason: z.string().optional(),
});

/**
 * GET /api/admin/driver-payouts/[payoutId]
 *
 * Get a specific driver payout with details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ payoutId: string }> }
) {
  try {
    const { payoutId } = await params;

    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get the payout
    const payoutDoc = await adminDb.collection(COLLECTION_NAME).doc(payoutId).get();
    if (!payoutDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Payout not found' },
        { status: 404 }
      );
    }

    const payout = payoutDoc.data();

    // Get delivery details
    const deliveryDocs = await Promise.all(
      (payout?.deliveryIds || []).map((id: string) =>
        adminDb.collection('deliveries').doc(id).get()
      )
    );

    const deliveries = deliveryDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    return NextResponse.json({
      success: true,
      data: {
        id: payoutDoc.id,
        ...payout,
        deliveries,
      },
    });
  } catch (error) {
    console.error('Error fetching driver payout:', error);
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

/**
 * PUT /api/admin/driver-payouts/[payoutId]
 *
 * Update payout status (process, complete, fail, cancel)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ payoutId: string }> }
) {
  try {
    const { payoutId } = await params;

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
    if (!userData?.role || !MANAGE_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify payout exists
    const payoutDoc = await adminDb.collection(COLLECTION_NAME).doc(payoutId).get();
    if (!payoutDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Payout not found' },
        { status: 404 }
      );
    }

    const payout = payoutDoc.data();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePayoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { action, mpesaRef, bankRef, failureReason } = validationResult.data;
    const now = Timestamp.now();

    // Validate state transitions
    const currentStatus = payout?.status;
    const validTransitions: Record<string, string[]> = {
      pending: ['process', 'cancel'],
      processing: ['complete', 'fail'],
      completed: [],
      failed: ['process'], // Can retry
    };

    if (!validTransitions[currentStatus]?.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot ${action} a payout with status: ${currentStatus}`,
        },
        { status: 400 }
      );
    }

    // Build update object based on action
    const updates: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: decodedToken.uid,
    };

    switch (action) {
      case 'process':
        updates.status = 'processing';
        updates.processedBy = decodedToken.uid;
        updates.processedAt = now;
        break;

      case 'complete':
        updates.status = 'completed';
        if (mpesaRef) updates.mpesaRef = mpesaRef;
        if (bankRef) updates.bankRef = bankRef;
        updates.completedAt = now;
        break;

      case 'fail':
        updates.status = 'failed';
        updates.failureReason = failureReason || 'Unknown failure';
        break;

      case 'cancel':
        updates.status = 'failed';
        updates.failureReason = 'Cancelled by ' + (userData?.name || 'admin');
        break;
    }

    await adminDb.collection(COLLECTION_NAME).doc(payoutId).update(updates);

    // Get updated payout
    const updatedDoc = await adminDb.collection(COLLECTION_NAME).doc(payoutId).get();

    // Create notification for driver (on completion)
    if (action === 'complete') {
      try {
        await adminDb.collection('notifications').add({
          type: 'payout_completed',
          recipientId: payout?.driverId,
          recipientPhone: payout?.driverPhone,
          message: `Your payout of KES ${payout?.amount} has been processed. ${mpesaRef ? `M-Pesa Ref: ${mpesaRef}` : ''}`,
          status: 'pending',
          channel: 'whatsapp',
          payoutId: payoutId,
          timestamp: now,
        });
      } catch (notifError) {
        console.error('Failed to create payout notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: `Payout ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error updating driver payout:', error);
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
