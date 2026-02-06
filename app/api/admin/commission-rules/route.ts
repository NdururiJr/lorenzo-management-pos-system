/**
 * Commission Rules API Route (FR-009)
 *
 * Handles commission rule CRUD operations for driver payments.
 *
 * @module app/api/admin/commission-rules/route
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
 * Validation schema for creating a commission rule
 */
const createCommissionRuleSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  name: z.string().min(1, 'Rule name is required'),
  commissionType: z.enum(['per_delivery', 'percentage', 'tiered']),
  baseAmount: z.number().min(0, 'Base amount cannot be negative'),
  tiers: z.array(commissionTierSchema).optional(),
  bonusThreshold: z.number().int().min(1).optional(),
  bonusAmount: z.number().min(0).optional(),
  active: z.boolean().optional().default(true),
});

/**
 * Validation schema for updating a commission rule
 */
const updateCommissionRuleSchema = createCommissionRuleSchema.partial();

/**
 * Generate unique rule ID
 */
function generateRuleId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RULE-${timestamp}-${random}`;
}

/**
 * POST /api/admin/commission-rules
 *
 * Create a new commission rule
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
    if (!userData?.role || !ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCommissionRuleSchema.safeParse(body);

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
    const ruleId = generateRuleId();

    // Create the rule
    const rule = {
      ruleId,
      branchId: data.branchId,
      name: data.name,
      commissionType: data.commissionType,
      baseAmount: data.baseAmount,
      tiers: data.tiers || null,
      bonusThreshold: data.bonusThreshold || null,
      bonusAmount: data.bonusAmount || null,
      active: data.active,
      createdBy: decodedToken.uid,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection(COLLECTION_NAME).doc(ruleId).set(rule);

    return NextResponse.json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error('Error creating commission rule:', error);
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
 * GET /api/admin/commission-rules
 *
 * List commission rules with optional filters
 *
 * Query Parameters:
 * - branchId: Filter by branch (or 'ALL')
 * - active: Filter by active status (true/false)
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
    const activeParam = searchParams.get('active');

    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection(COLLECTION_NAME);

    if (branchId) {
      // Get rules for specific branch + global rules
      query = query.where('branchId', 'in', [branchId, 'ALL']);
    }

    if (activeParam !== null) {
      const isActive = activeParam === 'true';
      query = query.where('active', '==', isActive);
    }

    query = query.orderBy('createdAt', 'desc');

    const snapshot = await query.get();
    const rules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('Error fetching commission rules:', error);
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
