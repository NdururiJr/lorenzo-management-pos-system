/**
 * Loyalty Points Operations API Route (FR-011)
 *
 * Handles POST for awarding and redeeming points.
 *
 * @module app/api/loyalty/customers/[customerId]/points/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const LOYALTY_COLLECTION = 'customerLoyalty';
const PROGRAMS_COLLECTION = 'loyaltyPrograms';
const TRANSACTIONS_COLLECTION = 'loyaltyTransactions';

/**
 * Validation schema for points operations
 */
const pointsOperationSchema = z.object({
  action: z.enum(['award', 'redeem']),
  points: z.number().int().positive(),
  reason: z.string().min(1),
  orderId: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Determine tier based on total points earned
 */
function determineTier(totalPoints: number, tiers: any[]): any {
  const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
  for (const tier of sortedTiers) {
    if (totalPoints >= tier.minPoints) {
      return tier;
    }
  }
  return tiers[0];
}

/**
 * POST /api/loyalty/customers/[customerId]/points
 *
 * Award or redeem points for a customer
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
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = pointsOperationSchema.safeParse(body);

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

    const { action, points, reason, orderId, description } = validationResult.data;

    // Find loyalty account
    const loyaltySnapshot = await adminDb
      .collection(LOYALTY_COLLECTION)
      .where('customerId', '==', customerId)
      .limit(1)
      .get();

    if (loyaltySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Customer not enrolled in loyalty program' },
        { status: 404 }
      );
    }

    const loyaltyDoc = loyaltySnapshot.docs[0];
    const loyalty = loyaltyDoc.data();
    const loyaltyId = loyaltyDoc.id;

    // Get program
    const programDoc = await adminDb
      .collection(PROGRAMS_COLLECTION)
      .doc(loyalty.programId)
      .get();

    if (!programDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Loyalty program not found' },
        { status: 404 }
      );
    }

    const program = programDoc.data();
    const now = Timestamp.now();

    if (action === 'award') {
      // Award points
      const newTotalEarned = loyalty.totalPointsEarned + points;
      const newBalance = loyalty.currentBalance + points;

      // Check for tier upgrade
      const newTier = determineTier(newTotalEarned, program?.tiers || []);
      const tierUpgraded = newTier.tierId !== loyalty.currentTierId;

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + (program?.pointsExpiryYears || 2));

      // Update loyalty account
      const updates: any = {
        totalPointsEarned: newTotalEarned,
        currentBalance: newBalance,
        lastActivityAt: now,
      };

      if (tierUpgraded) {
        updates.currentTierId = newTier.tierId;
        updates.currentTierName = newTier.name;
        updates.tierHistory = [
          ...loyalty.tierHistory,
          {
            tierId: newTier.tierId,
            tierName: newTier.name,
            achievedAt: now,
          },
        ];
      }

      await adminDb.collection(LOYALTY_COLLECTION).doc(loyaltyId).update(updates);

      // Create transaction
      const transactionId = `LTX-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
      await adminDb.collection(TRANSACTIONS_COLLECTION).doc(transactionId).set({
        transactionId,
        customerId,
        loyaltyId,
        type: 'earned',
        points,
        balanceAfter: newBalance,
        reason,
        description,
        orderId,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: now,
        createdBy: decodedToken.uid,
      });

      // Get updated loyalty
      const updatedDoc = await adminDb.collection(LOYALTY_COLLECTION).doc(loyaltyId).get();

      return NextResponse.json({
        success: true,
        data: {
          loyalty: { id: loyaltyId, ...updatedDoc.data() },
          transaction: { transactionId, points, balanceAfter: newBalance },
          tierUpgraded,
          newTier: tierUpgraded ? newTier : null,
        },
        message: `${points} points awarded successfully`,
      });
    } else {
      // Redeem points
      if (loyalty.currentBalance < points) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient points. Available: ${loyalty.currentBalance}, Requested: ${points}`,
          },
          { status: 400 }
        );
      }

      if (points < (program?.minPointsToRedeem || 100)) {
        return NextResponse.json(
          {
            success: false,
            error: `Minimum ${program?.minPointsToRedeem || 100} points required for redemption`,
          },
          { status: 400 }
        );
      }

      const newBalance = loyalty.currentBalance - points;
      const newTotalRedeemed = loyalty.totalPointsRedeemed + points;

      // Calculate discount value
      const discountValue = Math.floor(points / (program?.pointsToKESRatio || 10)) * 10;

      // Update loyalty account
      await adminDb.collection(LOYALTY_COLLECTION).doc(loyaltyId).update({
        currentBalance: newBalance,
        totalPointsRedeemed: newTotalRedeemed,
        lastActivityAt: now,
      });

      // Create transaction
      const transactionId = `LTX-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
      await adminDb.collection(TRANSACTIONS_COLLECTION).doc(transactionId).set({
        transactionId,
        customerId,
        loyaltyId,
        type: 'redeemed',
        points: -points,
        balanceAfter: newBalance,
        reason,
        description,
        orderId,
        createdAt: now,
        createdBy: decodedToken.uid,
      });

      // Get updated loyalty
      const updatedDoc = await adminDb.collection(LOYALTY_COLLECTION).doc(loyaltyId).get();

      return NextResponse.json({
        success: true,
        data: {
          loyalty: { id: loyaltyId, ...updatedDoc.data() },
          transaction: { transactionId, points: -points, balanceAfter: newBalance },
          discountValue,
        },
        message: `${points} points redeemed for KES ${discountValue} discount`,
      });
    }
  } catch (error) {
    console.error('Error processing points operation:', error);
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
