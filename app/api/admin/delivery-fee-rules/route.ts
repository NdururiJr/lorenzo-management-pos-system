/**
 * Delivery Fee Rules API Route (FR-013)
 *
 * Handles GET (list), POST (create) for delivery fee rules.
 *
 * @module app/api/admin/delivery-fee-rules/route
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
 * Validation schema for creating a delivery fee rule
 */
const createRuleSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  priority: z.number().int().min(1).max(1000),
  conditions: z.object({
    minOrderAmount: z.number().optional(),
    customerSegments: z.array(z.enum(['regular', 'vip', 'corporate'])).optional(),
    maxDistanceKm: z.number().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  feeCalculation: z.object({
    type: z.enum(['free', 'fixed', 'per_km', 'percentage']),
    value: z.number().min(0),
    minFee: z.number().optional(),
    maxFee: z.number().optional(),
  }),
  active: z.boolean().default(true),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

/**
 * Generate a unique delivery fee rule ID
 */
function generateRuleId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `DFRULE-${timestamp}-${random}`.toUpperCase();
}

/**
 * GET /api/admin/delivery-fee-rules
 *
 * List all delivery fee rules, optionally filtered by branch
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
    try {
      await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Build query
    const query = adminDb
      .collection(COLLECTION_NAME)
      .orderBy('priority', 'desc');

    // Note: We filter in memory because Firestore doesn't support OR queries well
    const snapshot = await query.get();

    let rules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by branch (include 'ALL' branch rules)
    if (branchId) {
      rules = rules.filter(
        (rule: any) => rule.branchId === branchId || rule.branchId === 'ALL'
      );
    }

    // Filter active only
    if (activeOnly) {
      const now = Timestamp.now();
      rules = rules.filter((rule: any) => {
        if (!rule.active) return false;
        if (rule.validFrom && rule.validFrom.toMillis() > now.toMillis()) return false;
        if (rule.validUntil && rule.validUntil.toMillis() < now.toMillis()) return false;
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('Error fetching delivery fee rules:', error);
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
 * POST /api/admin/delivery-fee-rules
 *
 * Create a new delivery fee rule
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
    if (!userData?.role || !MANAGE_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createRuleSchema.safeParse(body);

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
    const ruleId = generateRuleId();
    const now = Timestamp.now();

    // Build the rule document
    const rule = {
      ruleId,
      branchId: data.branchId,
      name: data.name,
      priority: data.priority,
      conditions: data.conditions,
      feeCalculation: data.feeCalculation,
      active: data.active,
      validFrom: data.validFrom ? Timestamp.fromDate(new Date(data.validFrom)) : now,
      validUntil: data.validUntil ? Timestamp.fromDate(new Date(data.validUntil)) : null,
      createdAt: now,
      updatedAt: now,
      createdBy: decodedToken.uid,
    };

    // Create the rule
    await adminDb.collection(COLLECTION_NAME).doc(ruleId).set(rule);

    return NextResponse.json(
      {
        success: true,
        data: { id: ruleId, ...rule },
        message: 'Delivery fee rule created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating delivery fee rule:', error);
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
