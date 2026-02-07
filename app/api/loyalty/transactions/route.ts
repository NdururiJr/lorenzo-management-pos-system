/**
 * Loyalty Transactions API Route (FR-011)
 *
 * Handles GET for loyalty transaction history.
 *
 * @module app/api/loyalty/transactions/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';

/**
 * Loyalty transaction document shape from Firestore
 */
interface LoyaltyTransactionDoc {
  id: string;
  type?: string;
  points?: number;
  [key: string]: unknown;
}

const TRANSACTIONS_COLLECTION = 'loyaltyTransactions';

/**
 * GET /api/loyalty/transactions
 *
 * Get loyalty transaction history
 * Query params:
 * - customerId: Filter by customer
 * - loyaltyId: Filter by loyalty account
 * - type: Filter by transaction type (earned, redeemed, expired, bonus, adjusted)
 * - limit: Max results (default 50)
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
    const customerId = searchParams.get('customerId');
    const loyaltyId = searchParams.get('loyaltyId');
    const type = searchParams.get('type');
    const limitParam = searchParams.get('limit');
    const limitCount = limitParam ? parseInt(limitParam, 10) : 50;

    // Require at least one filter
    if (!customerId && !loyaltyId) {
      return NextResponse.json(
        { success: false, error: 'Either customerId or loyaltyId is required' },
        { status: 400 }
      );
    }

    // Build query based on filter
    const baseQuery = adminDb.collection(TRANSACTIONS_COLLECTION);

    const query = customerId
      ? baseQuery
          .where('customerId', '==', customerId)
          .orderBy('createdAt', 'desc')
          .limit(limitCount)
      : loyaltyId
        ? baseQuery
            .where('loyaltyId', '==', loyaltyId)
            .orderBy('createdAt', 'desc')
            .limit(limitCount)
        : baseQuery
            .orderBy('createdAt', 'desc')
            .limit(limitCount);

    const snapshot = await query.get();

    const allTransactions: LoyaltyTransactionDoc[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as LoyaltyTransactionDoc));

    // Filter by type if specified
    const transactions = type
      ? allTransactions.filter((t) => t.type === type)
      : allTransactions;

    // Calculate summary stats
    const summary = {
      totalEarned: 0,
      totalRedeemed: 0,
      totalExpired: 0,
      totalBonus: 0,
    };

    transactions.forEach((t) => {
      switch (t.type) {
        case 'earned':
          summary.totalEarned += Math.abs(t.points || 0);
          break;
        case 'redeemed':
          summary.totalRedeemed += Math.abs(t.points || 0);
          break;
        case 'expired':
          summary.totalExpired += Math.abs(t.points || 0);
          break;
        case 'bonus':
          summary.totalBonus += Math.abs(t.points || 0);
          break;
      }
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      summary,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching loyalty transactions:', error);
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
