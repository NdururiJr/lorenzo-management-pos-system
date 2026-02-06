/**
 * Individual Redo Item API Routes (FR-002)
 *
 * Handles operations for a specific redo item:
 * - GET: Get redo item details
 * - PATCH: Update redo item (status, notes)
 *
 * @module app/api/redo-items/[redoItemId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'redoItems';

/**
 * Roles allowed to view redo items
 */
const VIEW_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'workstation_manager',
  'workstation_staff',
  'front_desk',
];

/**
 * Roles allowed to approve/reject redo items
 */
const REVIEW_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'workstation_manager',
];

/**
 * Validation schema for updating a redo item
 */
const updateRedoItemSchema = z.object({
  status: z.enum(['approved', 'rejected', 'in_progress', 'completed']).optional(),
  reviewNotes: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ redoItemId: string }>;
}

/**
 * GET /api/redo-items/[redoItemId]
 *
 * Get a specific redo item by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { redoItemId } = await context.params;

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
    if (!userData?.role || !VIEW_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get the redo item
    const redoItemDoc = await adminDb.collection(COLLECTION_NAME).doc(redoItemId).get();

    if (!redoItemDoc.exists) {
      return NextResponse.json(
        { success: false, error: `Redo item ${redoItemId} not found` },
        { status: 404 }
      );
    }

    const data = redoItemDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null,
        identifiedAt: data?.identifiedAt?.toDate?.()?.toISOString() || null,
        reviewedAt: data?.reviewedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching redo item:', error);
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
 * PATCH /api/redo-items/[redoItemId]
 *
 * Update a redo item (approve, reject, update status)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { redoItemId } = await context.params;

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
    if (!userData?.role || !REVIEW_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions to review redo items' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateRedoItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Get the redo item
    const redoItemDoc = await adminDb.collection(COLLECTION_NAME).doc(redoItemId).get();

    if (!redoItemDoc.exists) {
      return NextResponse.json(
        { success: false, error: `Redo item ${redoItemId} not found` },
        { status: 404 }
      );
    }

    const redoItemData = redoItemDoc.data();

    // Validate status transitions
    if (updateData.status) {
      const currentStatus = redoItemData?.status;

      // Rejection requires notes
      if (updateData.status === 'rejected' && !updateData.reviewNotes) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      // Only pending items can be approved/rejected
      if (['approved', 'rejected'].includes(updateData.status) && currentStatus !== 'pending') {
        return NextResponse.json(
          { success: false, error: `Cannot ${updateData.status} an item with status: ${currentStatus}` },
          { status: 400 }
        );
      }
    }

    const now = Timestamp.now();
    const updates: Record<string, unknown> = {
      updatedAt: now,
    };

    if (updateData.status) {
      updates.status = updateData.status;

      // If approving or rejecting, record the reviewer
      if (['approved', 'rejected'].includes(updateData.status)) {
        updates.reviewedBy = decodedToken.uid;
        updates.reviewedAt = now;
      }
    }

    if (updateData.reviewNotes !== undefined) {
      updates.reviewNotes = updateData.reviewNotes;
    }

    // If approving, create the redo order
    let redoOrderId: string | null = null;
    if (updateData.status === 'approved') {
      redoOrderId = await createRedoOrder(redoItemData, decodedToken.uid);
      updates.redoOrderId = redoOrderId;
    }

    // Update the redo item
    await adminDb.collection(COLLECTION_NAME).doc(redoItemId).update(updates);

    return NextResponse.json({
      success: true,
      message: `Redo item ${updateData.status || 'updated'} successfully`,
      data: {
        redoItemId,
        status: updateData.status || redoItemData?.status,
        redoOrderId,
      },
    });
  } catch (error) {
    console.error('Error updating redo item:', error);
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
 * Create a redo order when a redo item is approved
 */
async function createRedoOrder(
  redoItem: FirebaseFirestore.DocumentData | undefined,
  approvedBy: string
): Promise<string> {
  if (!redoItem) {
    throw new Error('Redo item data is missing');
  }

  // Get original order
  const orderDoc = await adminDb.collection('orders').doc(redoItem.originalOrderId).get();
  if (!orderDoc.exists) {
    throw new Error(`Original order ${redoItem.originalOrderId} not found`);
  }

  const orderData = orderDoc.data();
  if (!orderData) {
    throw new Error('Original order data is missing');
  }

  // Find the original garment
  const originalGarment = orderData.garments?.find(
    (g: { garmentId: string }) => g.garmentId === redoItem.originalGarmentId
  );
  if (!originalGarment) {
    throw new Error(`Original garment ${redoItem.originalGarmentId} not found`);
  }

  // Generate redo order ID
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  // Get today's orders for this branch to determine sequence
  const ordersSnapshot = await adminDb
    .collection('orders')
    .where('branchId', '==', redoItem.branchId)
    .where('createdAt', '>=', Timestamp.fromDate(todayStart))
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  let sequence = 1;
  if (!ordersSnapshot.empty) {
    const lastOrder = ordersSnapshot.docs[0].data();
    const lastSequence = parseInt(lastOrder.orderId?.split('-').pop() || '0', 10);
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  const redoOrderId = `ORD-${redoItem.branchId}-${dateStr}-${sequenceStr}`;

  // Create the garment with zero cost
  const redoGarment = {
    ...originalGarment,
    garmentId: `${redoOrderId}-G01`,
    price: 0, // Zero cost for redo
    status: 'received',
    specialInstructions: `REDO: ${redoItem.reasonDescription || redoItem.reasonCode}. Original order: ${redoItem.originalOrderId}`,
  };

  const now = Timestamp.now();

  // Create the redo order
  const redoOrder = {
    orderId: redoOrderId,
    customerId: orderData.customerId,
    customerName: redoItem.customerName || orderData.customerName,
    customerPhone: redoItem.customerPhone || orderData.customerPhone,
    branchId: redoItem.branchId,
    status: 'received',
    garments: [redoGarment],
    totalAmount: 0, // Zero cost
    paidAmount: 0,
    paymentStatus: 'paid', // Already paid (original order)
    collectionMethod: 'dropped_off',
    returnMethod: orderData.returnMethod || 'customer_collects',
    deliveryAddress: orderData.deliveryAddress || null,
    estimatedCompletion: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
    createdAt: now,
    updatedAt: now,
    createdBy: approvedBy,
    // Redo-specific fields
    isRedo: true,
    parentRedoItemId: redoItem.redoItemId,
    parentOrderId: redoItem.originalOrderId,
    statusHistory: [
      {
        status: 'received',
        timestamp: now,
        updatedBy: approvedBy,
      },
    ],
  };

  await adminDb.collection('orders').doc(redoOrderId).set(redoOrder);

  return redoOrderId;
}
