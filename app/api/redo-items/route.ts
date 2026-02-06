/**
 * Redo Items API Routes (FR-002)
 *
 * Handles CRUD operations for redo items:
 * - POST: Create a new redo item
 * - GET: List redo items with filters
 *
 * @module app/api/redo-items/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Roles allowed to create redo items
 */
const CREATE_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'workstation_manager',
  'workstation_staff',
  'front_desk',
];

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

const COLLECTION_NAME = 'redoItems';

/**
 * Validation schema for creating a redo item
 */
const createRedoItemSchema = z.object({
  originalOrderId: z.string().min(1, 'Original order ID is required'),
  originalGarmentId: z.string().min(1, 'Original garment ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  reasonCode: z.enum([
    'quality_issue',
    'damage',
    'incomplete_service',
    'wrong_service',
    'customer_complaint',
    'stain_not_removed',
    'shrinkage',
    'color_damage',
    'other',
  ]),
  reasonDescription: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  priority: z.enum(['high', 'urgent']).optional(),
});

/**
 * Generate a unique redo item ID using Admin SDK
 */
async function generateRedoItemId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  // Get today's redo items for this branch to determine sequence number
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where('branchId', '==', branchId)
    .where('createdAt', '>=', Timestamp.fromDate(todayStart))
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  let sequence = 1;
  if (!snapshot.empty) {
    const lastItem = snapshot.docs[0].data();
    const lastSequence = parseInt(
      lastItem.redoItemId?.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `REDO-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * POST /api/redo-items
 *
 * Create a new redo item
 */
export async function POST(request: NextRequest) {
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
    if (!userData?.role || !CREATE_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createRedoItemSchema.safeParse(body);

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

    const data = validationResult.data;

    // Verify original order exists
    const orderDoc = await adminDb.collection('orders').doc(data.originalOrderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: `Original order ${data.originalOrderId} not found` },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    // Verify garment exists in the order
    const garment = orderData?.garments?.find(
      (g: { garmentId: string }) => g.garmentId === data.originalGarmentId
    );
    if (!garment) {
      return NextResponse.json(
        {
          success: false,
          error: `Garment ${data.originalGarmentId} not found in order ${data.originalOrderId}`,
        },
        { status: 404 }
      );
    }

    // Get customer info for denormalization
    let customerName = orderData?.customerName;
    let customerPhone = orderData?.customerPhone;

    if (orderData?.customerId) {
      try {
        const customerDoc = await adminDb
          .collection('customers')
          .doc(orderData.customerId)
          .get();
        if (customerDoc.exists) {
          const customerData = customerDoc.data();
          customerName = customerData?.name || customerName;
          customerPhone = customerData?.phone || customerPhone;
        }
      } catch {
        // Use denormalized fields from order
      }
    }

    // Generate redo item ID
    const redoItemId = await generateRedoItemId(data.branchId);
    const now = Timestamp.now();

    // Create the redo item
    const redoItem = {
      redoItemId,
      originalOrderId: data.originalOrderId,
      originalGarmentId: data.originalGarmentId,
      branchId: data.branchId,
      reasonCode: data.reasonCode,
      reasonDescription: data.reasonDescription || null,
      photos: data.photos || [],
      identifiedBy: decodedToken.uid,
      identifiedByName: userData.name || 'Unknown',
      identifiedAt: now,
      status: 'pending',
      priority: data.priority || 'high',
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection(COLLECTION_NAME).doc(redoItemId).set(redoItem);

    return NextResponse.json(
      {
        success: true,
        message: 'Redo item created successfully',
        data: {
          redoItemId,
          status: 'pending',
          priority: redoItem.priority,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating redo item:', error);
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
 * GET /api/redo-items
 *
 * List redo items with optional filters
 *
 * Query Parameters:
 * - status: Filter by status (pending, approved, in_progress, completed, rejected)
 * - branchId: Filter by branch
 * - orderId: Filter by original order ID
 * - limit: Number of items to return (default: 50, max: 100)
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
    if (!userData?.role || !VIEW_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const branchId = searchParams.get('branchId');
    const orderId = searchParams.get('orderId');
    const limitParam = searchParams.get('limit');
    const queryLimit = Math.min(parseInt(limitParam || '50', 10), 100);

    // Build query
    let query: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .limit(queryLimit);

    if (status) {
      query = query.where('status', '==', status);
    }

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    if (orderId) {
      query = query.where('originalOrderId', '==', orderId);
    }

    const snapshot = await query.get();

    const redoItems = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        identifiedAt: data.identifiedAt?.toDate?.()?.toISOString() || null,
        reviewedAt: data.reviewedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: redoItems,
      count: redoItems.length,
    });
  } catch (error) {
    console.error('Error fetching redo items:', error);
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
