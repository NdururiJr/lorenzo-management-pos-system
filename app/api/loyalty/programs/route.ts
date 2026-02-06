/**
 * Loyalty Programs API Route (FR-011)
 *
 * Handles GET (list), POST (create) for loyalty programs.
 *
 * @module app/api/loyalty/programs/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'loyaltyPrograms';

/**
 * Roles allowed to manage loyalty programs
 */
const MANAGE_ALLOWED_ROLES = ['admin', 'director', 'general_manager'];

/**
 * Tier schema
 */
const tierSchema = z.object({
  tierId: z.string().min(1),
  name: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  displayName: z.string().min(1),
  minPoints: z.number().int().min(0),
  benefits: z.object({
    discountPercentage: z.number().optional(),
    freeDelivery: z.boolean().optional(),
    priorityProcessing: z.boolean().optional(),
    birthdayBonus: z.number().optional(),
    referralBonus: z.number().optional(),
    pointsMultiplier: z.number().optional(),
    freePickup: z.boolean().optional(),
  }),
  color: z.string(),
  icon: z.string().optional(),
});

/**
 * Validation schema for creating a loyalty program
 */
const createProgramSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  pointsPerKES: z.number().min(0.01).default(1),
  minPointsToRedeem: z.number().int().min(1).default(100),
  pointsToKESRatio: z.number().min(1).default(10),
  pointsExpiryYears: z.number().int().min(1).max(10).default(2),
  welcomeBonus: z.number().int().min(0).default(100),
  reviewBonus: z.number().int().min(0).default(50),
  tiers: z.array(tierSchema).min(1),
  active: z.boolean().default(true),
});

/**
 * Generate a unique program ID
 */
function generateProgramId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 4);
  return `PROG-${timestamp}-${random}`.toUpperCase();
}

/**
 * GET /api/loyalty/programs
 *
 * List loyalty programs
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
    const query = adminDb.collection(COLLECTION_NAME).orderBy('createdAt', 'desc');

    const snapshot = await query.get();

    let programs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by branch
    if (branchId) {
      programs = programs.filter(
        (p: any) => p.branchId === branchId || p.branchId === 'ALL'
      );
    }

    // Filter active only
    if (activeOnly) {
      programs = programs.filter((p: any) => p.active);
    }

    return NextResponse.json({
      success: true,
      data: programs,
      count: programs.length,
    });
  } catch (error) {
    console.error('Error fetching loyalty programs:', error);
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
 * POST /api/loyalty/programs
 *
 * Create a new loyalty program
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
    const validationResult = createProgramSchema.safeParse(body);

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
    const programId = generateProgramId();
    const now = Timestamp.now();

    // Build the program document
    const program = {
      programId,
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: decodedToken.uid,
    };

    // Create the program
    await adminDb.collection(COLLECTION_NAME).doc(programId).set(program);

    return NextResponse.json(
      {
        success: true,
        data: { id: programId, ...program },
        message: 'Loyalty program created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating loyalty program:', error);
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
