/**
 * Defect Notifications API Route (FR-003)
 *
 * Handles creating and listing defect notifications.
 *
 * @module app/api/defect-notifications/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'defectNotifications';
const DEFAULT_NOTIFICATION_WINDOW_HOURS = 24;

/**
 * Roles allowed to create defect notifications
 */
const CREATE_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'workstation_manager',
  'workstation_staff',
];

/**
 * Validation schema for creating a defect notification
 */
const createDefectNotificationSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  garmentId: z.string().min(1, 'Garment ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  defectType: z.enum([
    'stain_remaining',
    'color_fading',
    'shrinkage',
    'damage',
    'missing_buttons',
    'torn_seams',
    'discoloration',
    'odor',
    'other',
  ]),
  defectDescription: z.string().min(10, 'Description must be at least 10 characters'),
  photos: z.array(z.string()).optional(),
});

/**
 * Generate unique notification ID
 */
async function generateNotificationId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Get today's notifications for this branch
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where('branchId', '==', branchId)
    .where('createdAt', '>=', Timestamp.fromDate(todayStart))
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  let sequence = 1;
  if (!snapshot.empty) {
    const lastDoc = snapshot.docs[0].data();
    const lastSequence = parseInt(
      lastDoc.notificationId?.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `DEF-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Calculate notification deadline based on service types
 */
async function calculateDeadline(
  serviceTypes: string[],
  identifiedAt: Date
): Promise<Date> {
  let minWindowHours = DEFAULT_NOTIFICATION_WINDOW_HOURS;

  // Check for configured timelines
  for (const serviceType of serviceTypes) {
    const timelineSnapshot = await adminDb
      .collection('defectNotificationTimelines')
      .where('serviceType', '==', serviceType)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (!timelineSnapshot.empty) {
      const timeline = timelineSnapshot.docs[0].data();
      if (timeline.notificationWindowHours < minWindowHours) {
        minWindowHours = timeline.notificationWindowHours;
      }
    }
  }

  const deadline = new Date(identifiedAt);
  deadline.setHours(deadline.getHours() + minWindowHours);
  return deadline;
}

/**
 * POST /api/defect-notifications
 *
 * Create a new defect notification
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

    // Get user document to check role and get name
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
    const validationResult = createDefectNotificationSchema.safeParse(body);

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

    const data = validationResult.data;

    // Verify order exists and get garment services
    const orderDoc = await adminDb.collection('orders').doc(data.orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: `Order ${data.orderId} not found` },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();
    const garment = orderData?.garments?.find(
      (g: { garmentId: string }) => g.garmentId === data.garmentId
    );

    if (!garment) {
      return NextResponse.json(
        {
          success: false,
          error: `Garment ${data.garmentId} not found in order ${data.orderId}`,
        },
        { status: 404 }
      );
    }

    // Get customer info
    let customerName = orderData?.customerName;
    let customerPhone = orderData?.customerPhone;

    if (orderData?.customerId) {
      const customerDoc = await adminDb
        .collection('customers')
        .doc(orderData.customerId)
        .get();
      if (customerDoc.exists) {
        const customerData = customerDoc.data();
        customerName = customerData?.name || customerName;
        customerPhone = customerData?.phone || customerPhone;
      }
    }

    // Generate notification ID
    const notificationId = await generateNotificationId(data.branchId);
    const now = Timestamp.now();
    const identifiedAt = now.toDate();

    // Calculate notification deadline
    const deadline = await calculateDeadline(
      garment.services || [],
      identifiedAt
    );

    // Create the defect notification
    const defectNotification = {
      notificationId,
      orderId: data.orderId,
      garmentId: data.garmentId,
      branchId: data.branchId,
      defectType: data.defectType,
      defectDescription: data.defectDescription,
      photos: data.photos || [],
      identifiedAt: now,
      identifiedBy: decodedToken.uid,
      identifiedByName: userData.name || userData.email || 'Unknown',
      notificationDeadline: Timestamp.fromDate(deadline),
      status: 'pending',
      customerName,
      customerPhone,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb
      .collection(COLLECTION_NAME)
      .doc(notificationId)
      .set(defectNotification);

    return NextResponse.json({
      success: true,
      data: defectNotification,
    });
  } catch (error) {
    console.error('Error creating defect notification:', error);
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
 * GET /api/defect-notifications
 *
 * List defect notifications with optional filters
 *
 * Query Parameters:
 * - branchId: Filter by branch
 * - status: Filter by status
 * - limit: Number of results (default: 50)
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

    // Get user document to verify access
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const pageLimit = Math.min(parseInt(limitParam || '50', 10), 100);

    // Build query
    let query: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .limit(pageLimit);

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching defect notifications:', error);
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
