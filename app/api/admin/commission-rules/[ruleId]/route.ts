/**
 * Individual Commission Rule API Route (FR-009)
 *
 * Handles GET, PUT, DELETE for a specific commission rule.
 *
 * @module app/api/admin/commission-rules/[ruleId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'commissionRules';

/**
 * Roles allowed to manage commission rules
 */
const ALLOWED_ROLES = ['admin', 'director', 'general_manager'];

/**
 * Commission tier schema
 */
const commissionTierSchema = z.object({
  minDeliveries: z.number().int().min(1),
  maxDeliveries: z.number().int().min(1),
  ratePerDelivery: z.number().min(0),
});

/**
 * Validation schema for updating a commission rule
 */
const updateCommissionRuleSchema = z.object({
  branchId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  commissionType: z.enum(['per_delivery', 'percentage', 'tiered']).optional(),
  baseAmount: z.number().min(0).optional(),
  tiers: z.array(commissionTierSchema).optional().nullable(),
  bonusThreshold: z.number().int().min(1).optional().nullable(),
  bonusAmount: z.number().min(0).optional().nullable(),
  active: z.boolean().optional(),
});

/**
 * GET /api/admin/commission-rules/[ruleId]
 *
 * Get a specific commission rule
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
        { success: false, error: 'Commission rule not found' },
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
    console.error('Error fetching commission rule:', error);
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
 * PUT /api/admin/commission-rules/[ruleId]
 *
 * Update a commission rule
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
    if (!userData?.role || !ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify rule exists
    const ruleDoc = await adminDb.collection(COLLECTION_NAME).doc(ruleId).get();
    if (!ruleDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Commission rule not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateCommissionRuleSchema.safeParse(body);

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

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
      updatedBy: decodedToken.uid,
    };

    if (data.branchId !== undefined) updates.branchId = data.branchId;
    if (data.name !== undefined) updates.name = data.name;
    if (data.commissionType !== undefined) updates.commissionType = data.commissionType;
    if (data.baseAmount !== undefined) updates.baseAmount = data.baseAmount;
    if (data.tiers !== undefined) updates.tiers = data.tiers;
    if (data.bonusThreshold !== undefined) updates.bonusThreshold = data.bonusThreshold;
    if (data.bonusAmount !== undefined) updates.bonusAmount = data.bonusAmount;
    if (data.active !== undefined) updates.active = data.active;

    await adminDb.collection(COLLECTION_NAME).doc(ruleId).update(updates);

    // Get updated rule
    const updatedDoc = await adminDb.collection(COLLECTION_NAME).doc(ruleId).get();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error updating commission rule:', error);
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
 * DELETE /api/admin/commission-rules/[ruleId]
 *
 * Delete a commission rule
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
    if (!userData?.role || !ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify rule exists
    const ruleDoc = await adminDb.collection(COLLECTION_NAME).doc(ruleId).get();
    if (!ruleDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Commission rule not found' },
        { status: 404 }
      );
    }

    // Check if rule is in use by any pending payouts
    const payoutsSnapshot = await adminDb
      .collection('driverPayouts')
      .where('commissionRuleId', '==', ruleId)
      .where('status', 'in', ['pending', 'processing'])
      .limit(1)
      .get();

    if (!payoutsSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete rule that is in use by pending payouts',
        },
        { status: 400 }
      );
    }

    // Delete the rule
    await adminDb.collection(COLLECTION_NAME).doc(ruleId).delete();

    return NextResponse.json({
      success: true,
      message: 'Commission rule deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting commission rule:', error);
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
