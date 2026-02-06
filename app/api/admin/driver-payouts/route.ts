/**
 * Driver Payouts API Route (FR-009)
 *
 * Handles listing and creating driver payouts.
 *
 * @module app/api/admin/driver-payouts/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'driverPayouts';

/**
 * Roles allowed to manage driver payouts
 */
const MANAGE_ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'store_manager'];

/**
 * Validation schema for creating a payout
 */
const createPayoutSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  paymentMethod: z.enum(['mpesa', 'bank_transfer', 'cash']).default('mpesa'),
  periodStartDate: z.string().optional(),
  periodEndDate: z.string().optional(),
});

/**
 * Generate unique payout ID
 */
function generatePayoutId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${dateStr}-${random}`;
}

/**
 * GET /api/admin/driver-payouts
 *
 * List driver payouts with optional filters
 *
 * Query Parameters:
 * - branchId: Filter by branch
 * - driverId: Filter by driver
 * - status: Filter by status (pending, processing, completed, failed)
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
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const pageLimit = Math.min(parseInt(limitParam || '50', 10), 100);

    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection(COLLECTION_NAME);

    // Apply filters
    if (branchId) {
      query = query.where('branchId', '==', branchId);
    } else if (!['admin', 'director', 'general_manager'].includes(userData?.role || '')) {
      // Restrict to user's branch for non-admin users
      if (userData?.branchId) {
        query = query.where('branchId', '==', userData.branchId);
      }
    }

    if (driverId) {
      query = query.where('driverId', '==', driverId);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('createdAt', 'desc').limit(pageLimit);

    const snapshot = await query.get();
    const payouts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate stats
    const stats = {
      totalPayouts: payouts.length,
      totalAmount: payouts.reduce((sum, p) => sum + ((p as Record<string, unknown>).amount as number || 0), 0),
      pendingCount: payouts.filter((p) => (p as Record<string, unknown>).status === 'pending' || (p as Record<string, unknown>).status === 'processing').length,
      completedCount: payouts.filter((p) => (p as Record<string, unknown>).status === 'completed').length,
    };

    return NextResponse.json({
      success: true,
      data: payouts,
      stats,
      count: payouts.length,
    });
  } catch (error) {
    console.error('Error fetching driver payouts:', error);
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
 * POST /api/admin/driver-payouts
 *
 * Create a new driver payout
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
    const validationResult = createPayoutSchema.safeParse(body);

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

    // Get driver info
    const driverDoc = await adminDb.collection('users').doc(data.driverId).get();
    if (!driverDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Driver not found' },
        { status: 404 }
      );
    }

    const driverData = driverDoc.data();
    if (driverData?.role !== 'driver') {
      return NextResponse.json(
        { success: false, error: 'User is not a driver' },
        { status: 400 }
      );
    }

    // Calculate settlement period
    const periodEnd = data.periodEndDate ? new Date(data.periodEndDate) : new Date();
    periodEnd.setHours(23, 59, 59, 999);

    const periodStart = data.periodStartDate
      ? new Date(data.periodStartDate)
      : new Date(periodEnd);
    if (!data.periodStartDate) {
      periodStart.setDate(periodStart.getDate() - 7);
    }
    periodStart.setHours(0, 0, 0, 0);

    // Get unpaid deliveries for this period
    const deliveriesSnapshot = await adminDb
      .collection('deliveries')
      .where('driverId', '==', data.driverId)
      .where('status', '==', 'completed')
      .where('endTime', '>=', Timestamp.fromDate(periodStart))
      .where('endTime', '<=', Timestamp.fromDate(periodEnd))
      .orderBy('endTime', 'desc')
      .get();

    if (deliveriesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'No completed deliveries found for this period' },
        { status: 400 }
      );
    }

    // Get existing payouts to exclude already-paid deliveries
    const existingPayoutsSnapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where('driverId', '==', data.driverId)
      .where('status', 'in', ['pending', 'processing', 'completed'])
      .get();

    const paidDeliveryIds = new Set<string>();
    existingPayoutsSnapshot.docs.forEach((doc) => {
      const payout = doc.data();
      (payout.deliveryIds || []).forEach((id: string) => paidDeliveryIds.add(id));
    });

    // Filter to unpaid deliveries only
    const unpaidDeliveries = deliveriesSnapshot.docs.filter(
      (doc) => !paidDeliveryIds.has(doc.id)
    );

    if (unpaidDeliveries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All deliveries in this period have already been paid' },
        { status: 400 }
      );
    }

    // Get commission rule for this branch
    const rulesSnapshot = await adminDb
      .collection('commissionRules')
      .where('branchId', 'in', [data.branchId, 'ALL'])
      .where('active', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    let commissionRate = 100; // Default KES 100 per delivery
    let commissionRuleId = 'DEFAULT';
    let bonusAmount = 0;
    let bonusThreshold = 0;

    if (!rulesSnapshot.empty) {
      const rule = rulesSnapshot.docs[0].data();
      commissionRuleId = rule.ruleId;
      commissionRate = rule.baseAmount || 100;
      bonusThreshold = rule.bonusThreshold || 0;
      bonusAmount = rule.bonusAmount || 0;
    }

    // Calculate payout
    const deliveryCount = unpaidDeliveries.length;
    const baseCommission = deliveryCount * commissionRate;
    const bonus = bonusThreshold > 0 && deliveryCount >= bonusThreshold ? bonusAmount : 0;
    const totalAmount = baseCommission + bonus;

    const now = Timestamp.now();
    const payoutId = generatePayoutId();

    const payout = {
      payoutId,
      driverId: data.driverId,
      driverName: driverData.name || 'Unknown',
      driverPhone: driverData.phone || '',
      branchId: data.branchId,
      amount: totalAmount,
      paymentMethod: data.paymentMethod,
      status: 'pending',
      deliveryIds: unpaidDeliveries.map((d) => d.id),
      deliveryCount,
      commissionRuleId,
      commissionRate,
      baseCommission,
      bonusAmount: bonus,
      deductions: 0,
      periodStart: Timestamp.fromDate(periodStart),
      periodEnd: Timestamp.fromDate(periodEnd),
      createdBy: decodedToken.uid,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection(COLLECTION_NAME).doc(payoutId).set(payout);

    return NextResponse.json({
      success: true,
      data: payout,
      message: `Payout created for ${deliveryCount} deliveries totaling KES ${totalAmount}`,
    });
  } catch (error) {
    console.error('Error creating driver payout:', error);
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
