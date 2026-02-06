/**
 * Individual Delivery Fee Rule API Route (FR-013)
 *
 * Handles GET, PUT, DELETE for a specific delivery fee rule.
 *
 * @module app/api/admin/delivery-fee-rules/[ruleId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'deliveryFeeRules';

/**
 * Roles allowed to manage delivery fee rules
 */
const MANAGE_ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'store_manager'];

/**
 * Validation schema for updating a delivery fee rule
 */
const updateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  priority: z.number().int().min(1).max(1000).optional(),
  conditions: z.object({
    minOrderAmount: z.number().optional(),
    customerSegments: z.array(z.enum(['regular', 'vip', 'corporate'])).optional(),
    maxDistanceKm: z.number().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }).optional(),
  feeCalculation: z.object({
    type: z.enum(['free', 'fixed', 'per_km', 'percentage']),
    value: z.number().min(0),
    minFee: z.number().optional(),
    maxFee: z.number().optional(),
  }).optional(),
  active: z.boolean().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/admin/delivery-fee-rules/[ruleId]
 *
 * Get a specific delivery fee rule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await params;

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

    // Get the rule
    const ruleDoc = await adminDb.collection(COLLECTION_NAME).doc(ruleId).get();
    if (!ruleDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Delivery fee rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: ruleDoc.id,
        ...ruleDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error fetching delivery fee rule:', error);
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
 * PUT /api/admin/delivery-fee-rules/[ruleId]
 *
 * Update a delivery fee rule
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await params;

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

    // Verify rule exists
    const ruleDoc = await adminDb.collection(COLLECTION_NAME).doc(ruleId).get();
    if (!ruleDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Delivery fee rule not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateRuleSchema.safeParse(body);

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
    const now = Timestamp.now();

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: decodedToken.uid,
    };

    if (data.name !== undefined) updates.name = data.name;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.conditions !== undefined) updates.conditions = data.conditions;
    if (data.feeCalculation !== undefined) updates.feeCalculation = data.feeCalculation;
    if (data.active !== undefined) updates.active = data.active;
    if (data.validFrom !== undefined) {
      updates.validFrom = Timestamp.fromDate(new Date(data.validFrom));
    }
    if (data.validUntil !== undefined) {
      updates.validUntil = data.validUntil
        ? Timestamp.fromDate(new Date(data.validUntil))
        : null;
    }

    await adminDb.collection(COLLECTION_NAME).doc(ruleId).update(updates);

    // Get updated rule
    const updatedDoc = await adminDb.collection(COLLECTION_NAME).doc(ruleId).get();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Delivery fee rule updated successfully',
    });
  } catch (error) {
    console.error('Error updating delivery fee rule:', error);
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
 * DELETE /api/admin/delivery-fee-rules/[ruleId]
 *
 * Delete a delivery fee rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await params;

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

    // Verify rule exists
    const ruleDoc = await adminDb.collection(COLLECTION_NAME).doc(ruleId).get();
    if (!ruleDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Delivery fee rule not found' },
        { status: 404 }
      );
    }

    // Delete the rule
    await adminDb.collection(COLLECTION_NAME).doc(ruleId).delete();

    return NextResponse.json({
      success: true,
      message: 'Delivery fee rule deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting delivery fee rule:', error);
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
