/**
 * Customer Loyalty API Route (FR-011)
 *
 * Handles GET (customer loyalty status), POST (enroll), PUT (update).
 *
 * @module app/api/loyalty/customers/[customerId]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const LOYALTY_COLLECTION = 'customerLoyalty';
const PROGRAMS_COLLECTION = 'loyaltyPrograms';

/**
 * Generate a unique loyalty ID
 */
function generateLoyaltyId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `LOY-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validation schema for enrollment
 */
const enrollSchema = z.object({
  programId: z.string().min(1),
  birthday: z.string().optional(), // MM-DD format
});

/**
 * GET /api/loyalty/customers/[customerId]
 *
 * Get customer's loyalty account status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

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

    // Find loyalty account for this customer
    const snapshot = await adminDb
      .collection(LOYALTY_COLLECTION)
      .where('customerId', '==', customerId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Customer not enrolled in loyalty program' },
        { status: 404 }
      );
    }

    const loyaltyDoc = snapshot.docs[0];
    const loyalty = loyaltyDoc.data();

    // Get program details for tier info
    const programDoc = await adminDb
      .collection(PROGRAMS_COLLECTION)
      .doc(loyalty.programId)
      .get();

    const program = programDoc.exists ? programDoc.data() : null;

    // Find current tier details
    const currentTier = program?.tiers?.find(
      (t: any) => t.tierId === loyalty.currentTierId
    );

    // Find next tier
    const sortedTiers = program?.tiers
      ? [...program.tiers].sort((a: any, b: any) => a.minPoints - b.minPoints)
      : [];
    const currentTierIndex = sortedTiers.findIndex(
      (t: any) => t.tierId === loyalty.currentTierId
    );
    const nextTier =
      currentTierIndex < sortedTiers.length - 1
        ? sortedTiers[currentTierIndex + 1]
        : null;

    const pointsToNextTier = nextTier
      ? nextTier.minPoints - loyalty.totalPointsEarned
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...loyalty,
        id: loyaltyDoc.id,
        currentTierDetails: currentTier,
        nextTier: nextTier
          ? {
              name: nextTier.name,
              displayName: nextTier.displayName,
              minPoints: nextTier.minPoints,
              pointsNeeded: Math.max(0, pointsToNextTier),
            }
          : null,
        program: program
          ? {
              name: program.name,
              pointsPerKES: program.pointsPerKES,
              pointsToKESRatio: program.pointsToKESRatio,
              minPointsToRedeem: program.minPointsToRedeem,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching customer loyalty:', error);
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
 * POST /api/loyalty/customers/[customerId]
 *
 * Enroll a customer in the loyalty program
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

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

    // Check if already enrolled
    const existingSnapshot = await adminDb
      .collection(LOYALTY_COLLECTION)
      .where('customerId', '==', customerId)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Customer already enrolled in loyalty program' },
        { status: 409 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = enrollSchema.safeParse(body);

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

    const { programId, birthday } = validationResult.data;

    // Get program
    const programDoc = await adminDb
      .collection(PROGRAMS_COLLECTION)
      .doc(programId)
      .get();

    if (!programDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Loyalty program not found' },
        { status: 404 }
      );
    }

    const program = programDoc.data();
    if (!program?.active) {
      return NextResponse.json(
        { success: false, error: 'Loyalty program is not active' },
        { status: 400 }
      );
    }

    const welcomeBonus = program.welcomeBonus || 0;

    // Find initial tier based on welcome bonus
    const sortedTiers = [...program.tiers].sort(
      (a: any, b: any) => b.minPoints - a.minPoints
    );
    let initialTier = program.tiers[0];
    for (const tier of sortedTiers) {
      if (welcomeBonus >= tier.minPoints) {
        initialTier = tier;
        break;
      }
    }

    // Create loyalty account
    const loyaltyId = generateLoyaltyId();
    const referralCode = generateReferralCode();
    const now = Timestamp.now();

    const loyalty = {
      loyaltyId,
      customerId,
      programId,
      totalPointsEarned: welcomeBonus,
      totalPointsRedeemed: 0,
      currentBalance: welcomeBonus,
      currentTierId: initialTier.tierId,
      currentTierName: initialTier.name,
      tierHistory: [
        {
          tierId: initialTier.tierId,
          tierName: initialTier.name,
          achievedAt: now,
        },
      ],
      birthday,
      referralCode,
      referralCount: 0,
      enrolledAt: now,
      lastActivityAt: now,
    };

    await adminDb.collection(LOYALTY_COLLECTION).doc(loyaltyId).set(loyalty);

    // Create welcome bonus transaction if applicable
    if (welcomeBonus > 0) {
      const transactionId = `LTX-${Date.now().toString(36)}`.toUpperCase();
      await adminDb.collection('loyaltyTransactions').doc(transactionId).set({
        transactionId,
        customerId,
        loyaltyId,
        type: 'bonus',
        points: welcomeBonus,
        balanceAfter: welcomeBonus,
        reason: 'welcome_bonus',
        description: 'Welcome bonus for joining the loyalty program',
        createdAt: now,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: loyaltyId, ...loyalty },
        message: 'Customer enrolled in loyalty program successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error enrolling customer:', error);
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
