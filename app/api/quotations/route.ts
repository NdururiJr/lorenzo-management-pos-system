/**
 * Quotations API Route (FR-001)
 *
 * Handles creating and listing quotations.
 *
 * @module app/api/quotations/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp, Query } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'quotations';

/**
 * Roles allowed to create quotations
 */
const CREATE_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'front_desk',
];

/**
 * Validation schema for quotation item
 */
const quotationItemSchema = z.object({
  garmentType: z.string().min(1, 'Garment type is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  totalPrice: z.number().min(0, 'Total price cannot be negative'),
  specialInstructions: z.string().optional(),
});

/**
 * Validation schema for creating a quotation
 */
const createQuotationSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  deliveryFee: z.number().min(0).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  discountReason: z.string().optional(),
  notes: z.string().optional(),
  validDays: z.number().int().min(1).max(30).optional().default(7),
  estimatedDays: z.number().int().min(1).max(30).optional().default(3),
});

/**
 * Generate unique quotation ID
 */
async function generateQuotationId(branchId: string): Promise<string> {
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
    const lastDoc = snapshot.docs[0].data();
    const lastSequence = parseInt(
      lastDoc.quotationId?.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `QT-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Calculate valid until date
 */
function getValidUntil(days: number): Date {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + days);
  return validUntil;
}

/**
 * Calculate estimated completion (skipping Sundays)
 */
function getEstimatedCompletion(days: number): Date {
  const completion = new Date();
  let daysToAdd = days;

  while (daysToAdd > 0) {
    completion.setDate(completion.getDate() + 1);
    if (completion.getDay() !== 0) {
      daysToAdd--;
    }
  }

  return completion;
}

/**
 * POST /api/quotations
 *
 * Create a new quotation
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
    const validationResult = createQuotationSchema.safeParse(body);

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

    // Verify customer exists
    const customerDoc = await adminDb.collection('customers').doc(data.customerId).get();
    if (!customerDoc.exists) {
      return NextResponse.json(
        { success: false, error: `Customer ${data.customerId} not found` },
        { status: 404 }
      );
    }

    const customerData = customerDoc.data();

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal + data.deliveryFee - data.discountAmount;

    // Generate quotation ID
    const quotationId = await generateQuotationId(data.branchId);
    const now = Timestamp.now();

    // Create the quotation
    const quotation = {
      quotationId,
      customerId: data.customerId,
      customerName: customerData?.name || 'Unknown',
      customerPhone: customerData?.phone || '',
      branchId: data.branchId,
      items: data.items,
      subtotal,
      deliveryFee: data.deliveryFee,
      discountAmount: data.discountAmount,
      discountReason: data.discountReason || null,
      totalAmount: Math.max(0, totalAmount),
      status: 'draft',
      validUntil: Timestamp.fromDate(getValidUntil(data.validDays)),
      estimatedCompletion: Timestamp.fromDate(getEstimatedCompletion(data.estimatedDays)),
      notes: data.notes || null,
      sentAt: null,
      sentVia: null,
      acceptedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      convertedOrderId: null,
      convertedAt: null,
      createdBy: decodedToken.uid,
      createdByName: userData.name || userData.email || 'Unknown',
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection(COLLECTION_NAME).doc(quotationId).set(quotation);

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error('Error creating quotation:', error);
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
 * GET /api/quotations
 *
 * List quotations with optional filters
 *
 * Query Parameters:
 * - branchId: Filter by branch
 * - status: Filter by status
 * - customerId: Filter by customer
 * - search: Search by customer name or quotation ID
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

    const userData = userDoc.data();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const pageLimit = Math.min(parseInt(limitParam || '50', 10), 100);

    // Build query - start with base collection
    let query: Query = adminDb.collection(COLLECTION_NAME);

    // Apply branch filter
    // Non-admin users can only see their branch's quotations
    if (branchId) {
      query = query.where('branchId', '==', branchId);
    } else if (!['admin', 'director', 'general_manager'].includes(userData?.role || '')) {
      // Restrict to user's branch
      if (userData?.branchId) {
        query = query.where('branchId', '==', userData.branchId);
      }
    }

    // Apply status filter
    if (status) {
      query = query.where('status', '==', status);
    }

    // Apply customer filter
    if (customerId) {
      query = query.where('customerId', '==', customerId);
    }

    // Order and limit
    query = query.orderBy('createdAt', 'desc').limit(pageLimit);

    const snapshot = await query.get();

    let quotations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filter (Firestore doesn't support text search)
    if (search) {
      const searchLower = search.toLowerCase();
      quotations = quotations.filter((q) => {
        const data = q as Record<string, unknown>;
        const customerName = (data.customerName as string) || '';
        const quotationId = (data.quotationId as string) || '';
        return (
          customerName.toLowerCase().includes(searchLower) ||
          quotationId.toLowerCase().includes(searchLower)
        );
      });
    }

    return NextResponse.json({
      success: true,
      data: quotations,
      count: quotations.length,
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
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
