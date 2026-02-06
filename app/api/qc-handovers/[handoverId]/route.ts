/**
 * Individual QC Handover API Routes (FR-004)
 *
 * Handles operations on a specific QC handover.
 *
 * @module app/api/qc-handovers/[handoverId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'qcHandovers';

/**
 * Update action schema
 */
const updateHandoverSchema = z.object({
  action: z.enum([
    'acknowledge',
    'in_progress',
    'customer_contacted',
    'resolve',
    'cancel',
  ]),
  customerResponse: z.string().optional(),
  resolutionNotes: z.string().optional(),
  cancelReason: z.string().optional(),
});

/**
 * GET /api/qc-handovers/[handoverId]
 *
 * Get a specific handover by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handoverId: string }> }
) {
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

    const { handoverId } = await params;
    const doc = await adminDb.collection(COLLECTION_NAME).doc(handoverId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Handover not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    console.error('Error fetching QC handover:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch handover',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/qc-handovers/[handoverId]
 *
 * Update a handover (acknowledge, resolve, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ handoverId: string }> }
) {
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

    const { handoverId } = await params;
    const docRef = adminDb.collection(COLLECTION_NAME).doc(handoverId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Handover not found' },
        { status: 404 }
      );
    }

    const existingHandover = doc.data();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateHandoverSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { action, customerResponse, resolutionNotes, cancelReason } =
      validationResult.data;
    const userName = decodedToken.name || decodedToken.email || 'Unknown';
    const now = Timestamp.now();

    let updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    // Perform the requested action
    switch (action) {
      case 'acknowledge':
        if (existingHandover?.status !== 'pending') {
          return NextResponse.json(
            { error: 'Handover is not pending' },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: 'acknowledged',
          acknowledgedBy: decodedToken.uid,
          acknowledgedByName: userName,
          acknowledgedAt: now,
        };
        break;

      case 'in_progress':
        updateData = {
          ...updateData,
          status: 'in_progress',
        };
        break;

      case 'customer_contacted':
        updateData = {
          ...updateData,
          status: 'customer_contacted',
          customerNotifiedAt: now,
          customerResponse: customerResponse || null,
        };
        break;

      case 'resolve':
        if (!resolutionNotes) {
          return NextResponse.json(
            { error: 'Resolution notes are required' },
            { status: 400 }
          );
        }
        if (existingHandover?.status === 'resolved' || existingHandover?.status === 'cancelled') {
          return NextResponse.json(
            { error: `Handover is already ${existingHandover.status}` },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: 'resolved',
          resolvedBy: decodedToken.uid,
          resolvedAt: now,
          resolutionNotes,
          customerResponse: customerResponse || existingHandover?.customerResponse || null,
        };
        break;

      case 'cancel':
        if (!cancelReason) {
          return NextResponse.json(
            { error: 'Cancel reason is required' },
            { status: 400 }
          );
        }
        if (existingHandover?.status === 'resolved' || existingHandover?.status === 'cancelled') {
          return NextResponse.json(
            { error: `Handover is already ${existingHandover.status}` },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: 'cancelled',
          resolvedBy: decodedToken.uid,
          resolvedAt: now,
          resolutionNotes: `Cancelled: ${cancelReason}`,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    await docRef.update(updateData);

    // Fetch updated handover
    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      data: updatedDoc.data(),
      message: `Handover ${action} successful`,
    });
  } catch (error) {
    console.error('Error updating QC handover:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update handover',
      },
      { status: 500 }
    );
  }
}
