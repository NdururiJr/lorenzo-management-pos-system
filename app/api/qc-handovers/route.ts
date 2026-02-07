/**
 * QC Handovers API Routes (FR-004)
 *
 * Handles creation and listing of QC to Customer Service handovers.
 *
 * @module app/api/qc-handovers/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { QCHandoverType, QCHandoverStatus } from '@/lib/db/schema';

const COLLECTION_NAME = 'qcHandovers';

/**
 * Roles allowed to create QC handovers
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
 * Request body validation schema for creating a handover
 */
const createHandoverSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  garmentId: z.string().optional(),
  branchId: z.string().min(1, 'Branch ID is required'),
  handoverType: z.enum([
    'alteration',
    'defect',
    'damage',
    'exception',
    'pricing_issue',
    'special_care',
  ] as const),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  photos: z.array(z.string()).optional(),
  qcNotes: z.string().optional(),
  recommendedAction: z.enum([
    'notify_customer',
    'request_approval',
    'offer_discount',
    'schedule_pickup',
    'process_refund',
    'no_action',
  ] as const),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  defectNotificationId: z.string().optional(),
  redoItemId: z.string().optional(),
});

/**
 * Generate a unique handover ID
 */
async function generateHandoverId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

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
    const lastItem = snapshot.docs[0].data();
    const lastSequence = parseInt(lastItem.handoverId.split('-').pop() || '0', 10);
    sequence = lastSequence + 1;
  }

  return `HO-${branchId}-${dateStr}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Generate customer communication template
 */
function generateCommunicationTemplate(
  handoverType: QCHandoverType,
  description: string,
  customerName: string
): string {
  const greeting = `Dear ${customerName},`;
  const closing = `\n\nPlease let us know how you would like us to proceed.\n\nBest regards,\nLorenzo Dry Cleaners`;

  switch (handoverType) {
    case 'alteration':
      return `${greeting}\n\nDuring our quality check, we noticed that your garment may benefit from an alteration: ${description}\n\nWe can proceed with this alteration at no additional cost, or return the garment as-is. ${closing}`;
    case 'defect':
      return `${greeting}\n\nWe regret to inform you that during quality inspection, we identified an issue with your garment: ${description}\n\nWe want to discuss the best way to address this. ${closing}`;
    case 'damage':
      return `${greeting}\n\nWe sincerely apologize - during processing, your garment experienced: ${description}\n\nWe would like to discuss compensation options with you. ${closing}`;
    case 'pricing_issue':
      return `${greeting}\n\nRegarding your recent order, we need to discuss the pricing: ${description}\n\nWe want to ensure you are satisfied with the charges. ${closing}`;
    case 'special_care':
      return `${greeting}\n\nYour garment requires special care: ${description}\n\nWe wanted to confirm the appropriate treatment with you before proceeding. ${closing}`;
    default:
      return `${greeting}\n\nWe need to discuss something regarding your order: ${description}${closing}`;
  }
}

/**
 * POST /api/qc-handovers
 *
 * Create a new QC handover
 */
export async function POST(request: NextRequest) {
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

    // Check role authorization
    const userRole = decodedToken.role as string;
    if (!CREATE_ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createHandoverSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify order exists and get customer info
    const orderDoc = await adminDb.collection('orders').doc(data.orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: `Order ${data.orderId} not found` },
        { status: 404 }
      );
    }

    const order = orderDoc.data();
    const customerName = order?.customerName || 'Valued Customer';
    const customerPhone = order?.customerPhone || '';

    // Generate handover ID
    const handoverId = await generateHandoverId(data.branchId);
    const now = Timestamp.now();

    // Generate communication template
    const customerCommunicationTemplate = generateCommunicationTemplate(
      data.handoverType as QCHandoverType,
      data.description,
      customerName
    );

    // Create handover document
    const handover = {
      handoverId,
      orderId: data.orderId,
      garmentId: data.garmentId || null,
      branchId: data.branchId,
      handoverType: data.handoverType,
      description: data.description,
      photos: data.photos || [],
      qcNotes: data.qcNotes || null,
      recommendedAction: data.recommendedAction,
      priority: data.priority,
      status: 'pending' as QCHandoverStatus,
      customerCommunicationTemplate,
      createdBy: decodedToken.uid,
      createdByName: decodedToken.name || decodedToken.email || 'Unknown',
      createdAt: now,
      updatedAt: now,
      customerName,
      customerPhone,
      defectNotificationId: data.defectNotificationId || null,
      redoItemId: data.redoItemId || null,
    };

    await adminDb.collection(COLLECTION_NAME).doc(handoverId).set(handover);

    return NextResponse.json(
      {
        success: true,
        data: handover,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating QC handover:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create handover',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qc-handovers
 *
 * List handovers with optional filters
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status') as QCHandoverStatus | null;
    const limitParam = searchParams.get('limit');
    const pageLimit = limitParam ? parseInt(limitParam, 10) : 50;

    let query = adminDb
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
    const handovers = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json({
      success: true,
      data: handovers,
      count: handovers.length,
    });
  } catch (error) {
    console.error('Error fetching QC handovers:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch handovers',
      },
      { status: 500 }
    );
  }
}
