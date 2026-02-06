/**
 * Defect Notification Detail API Route (FR-003)
 *
 * Handles operations on individual defect notifications.
 *
 * @module app/api/defect-notifications/[notificationId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'defectNotifications';

/**
 * Roles allowed to update notifications
 */
const UPDATE_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'workstation_manager',
  'front_desk',
];

/**
 * GET /api/defect-notifications/[notificationId]
 *
 * Get a single defect notification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await params;

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

    // Get the notification
    const doc = await adminDb.collection(COLLECTION_NAME).doc(notificationId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Defect notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error('Error fetching defect notification:', error);
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
 * PATCH /api/defect-notifications/[notificationId]
 *
 * Update a defect notification
 *
 * Supported actions:
 * - notify: Mark customer as notified
 * - acknowledge: Record customer acknowledgment
 * - escalate: Escalate due to missed deadline
 * - resolve: Resolve the notification
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await params;

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
    if (!userData?.role || !UPDATE_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get the notification
    const notificationDoc = await adminDb
      .collection(COLLECTION_NAME)
      .doc(notificationId)
      .get();

    if (!notificationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Defect notification not found' },
        { status: 404 }
      );
    }

    const notificationData = notificationDoc.data();

    // Parse request body
    const body = await request.json();
    const { action, customerResponse, resolutionNotes } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    let updateData: Record<string, unknown> = { updatedAt: now };

    switch (action) {
      case 'notify':
        // Mark customer as notified
        if (notificationData?.status !== 'pending') {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot notify - notification is ${notificationData?.status}`,
            },
            { status: 400 }
          );
        }

        const isWithinTimeline =
          now.toMillis() <= notificationData?.notificationDeadline?.toMillis();

        updateData = {
          ...updateData,
          status: 'notified',
          customerNotifiedAt: now,
          notifiedBy: decodedToken.uid,
          isWithinTimeline,
        };
        break;

      case 'acknowledge':
        // Record customer acknowledgment
        if (notificationData?.status !== 'notified') {
          return NextResponse.json(
            {
              success: false,
              error: 'Customer must be notified before acknowledgment',
            },
            { status: 400 }
          );
        }

        updateData = {
          ...updateData,
          status: 'acknowledged',
          acknowledgedAt: now,
          customerResponse: customerResponse || null,
        };
        break;

      case 'escalate':
        // Escalate due to missed deadline
        updateData = {
          ...updateData,
          status: 'escalated',
          isWithinTimeline: false,
        };
        break;

      case 'resolve':
        // Resolve the notification
        if (!resolutionNotes || resolutionNotes.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: 'Resolution notes are required' },
            { status: 400 }
          );
        }

        updateData = {
          ...updateData,
          status: 'resolved',
          resolvedAt: now,
          resolvedBy: decodedToken.uid,
          resolutionNotes,
        };
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}. Valid actions are: notify, acknowledge, escalate, resolve`,
          },
          { status: 400 }
        );
    }

    // Update the notification
    await adminDb
      .collection(COLLECTION_NAME)
      .doc(notificationId)
      .update(updateData);

    // Get updated notification
    const updatedDoc = await adminDb
      .collection(COLLECTION_NAME)
      .doc(notificationId)
      .get();

    return NextResponse.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error) {
    console.error('Error updating defect notification:', error);
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
