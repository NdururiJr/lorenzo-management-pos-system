/**
 * Individual Quotation API Route (FR-001)
 *
 * Handles getting, updating, and deleting individual quotations.
 *
 * @module app/api/quotations/[quotationId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'quotations';

/**
 * Roles allowed to modify quotations
 */
const MODIFY_ALLOWED_ROLES = [
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
 * Validation schema for updating a quotation
 */
const updateQuotationSchema = z.object({
  items: z.array(quotationItemSchema).min(1).optional(),
  deliveryFee: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  discountReason: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  estimatedCompletion: z.string().datetime().optional(),
});

/**
 * GET /api/quotations/[quotationId]
 *
 * Get a single quotation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  try {
    const { quotationId } = await params;

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

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    // Get quotation
    const quotationDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    if (!quotationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const quotation = {
      id: quotationDoc.id,
      ...quotationDoc.data(),
    };

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    console.error('Error fetching quotation:', error);
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
 * PUT /api/quotations/[quotationId]
 *
 * Update a quotation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  try {
    const { quotationId } = await params;

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
    if (!userData?.role || !MODIFY_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get existing quotation
    const quotationDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    if (!quotationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const existingQuotation = quotationDoc.data();

    // Only allow updates to draft quotations
    if (existingQuotation?.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot update quotation with status: ${existingQuotation?.status}`,
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateQuotationSchema.safeParse(body);

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

    const updates = validationResult.data;
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    // Apply updates
    if (updates.items) {
      updateData.items = updates.items;
      // Recalculate totals
      const subtotal = updates.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const deliveryFee = updates.deliveryFee ?? existingQuotation?.deliveryFee ?? 0;
      const discountAmount = updates.discountAmount ?? existingQuotation?.discountAmount ?? 0;
      updateData.subtotal = subtotal;
      updateData.totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);
    }

    if (updates.deliveryFee !== undefined) {
      updateData.deliveryFee = updates.deliveryFee;
      // Recalculate total if items weren't updated
      if (!updates.items) {
        const subtotal = existingQuotation?.subtotal ?? 0;
        const discountAmount = updates.discountAmount ?? existingQuotation?.discountAmount ?? 0;
        updateData.totalAmount = Math.max(0, subtotal + updates.deliveryFee - discountAmount);
      }
    }

    if (updates.discountAmount !== undefined) {
      updateData.discountAmount = updates.discountAmount;
      // Recalculate total if items weren't updated
      if (!updates.items && updates.deliveryFee === undefined) {
        const subtotal = existingQuotation?.subtotal ?? 0;
        const deliveryFee = existingQuotation?.deliveryFee ?? 0;
        updateData.totalAmount = Math.max(0, subtotal + deliveryFee - updates.discountAmount);
      }
    }

    if (updates.discountReason !== undefined) {
      updateData.discountReason = updates.discountReason;
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    if (updates.validUntil) {
      updateData.validUntil = Timestamp.fromDate(new Date(updates.validUntil));
    }

    if (updates.estimatedCompletion) {
      updateData.estimatedCompletion = Timestamp.fromDate(new Date(updates.estimatedCompletion));
    }

    await adminDb.collection(COLLECTION_NAME).doc(quotationId).update(updateData);

    // Get updated quotation
    const updatedDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    const updatedQuotation = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return NextResponse.json({
      success: true,
      data: updatedQuotation,
    });
  } catch (error) {
    console.error('Error updating quotation:', error);
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
 * DELETE /api/quotations/[quotationId]
 *
 * Delete a quotation (only draft status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  try {
    const { quotationId } = await params;

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
    if (!userData?.role || !MODIFY_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get existing quotation
    const quotationDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    if (!quotationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const existingQuotation = quotationDoc.data();

    // Only allow deletion of draft quotations
    if (existingQuotation?.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete quotation with status: ${existingQuotation?.status}`,
        },
        { status: 400 }
      );
    }

    await adminDb.collection(COLLECTION_NAME).doc(quotationId).delete();

    return NextResponse.json({
      success: true,
      message: `Quotation ${quotationId} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting quotation:', error);
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
