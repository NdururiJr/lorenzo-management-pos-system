/**
 * Payment Status API
 *
 * Query the status of a payment transaction.
 * Requires authentication - users can only query their own transactions.
 *
 * @module app/api/payments/[transactionId]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatusServer } from '@/lib/payments/payment-service.server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';

/**
 * GET /api/payments/[transactionId]/status
 *
 * Query payment status by transaction ID
 * Requires Bearer token authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get transaction to verify ownership
    const transactionDoc = await adminDb.collection('transactions').doc(transactionId).get();
    if (!transactionDoc.exists) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transactionData = transactionDoc.data();

    // Check if user is authorized (owns the transaction or is staff)
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const isStaff = userData?.role && ['admin', 'director', 'general_manager', 'store_manager', 'front_desk'].includes(userData.role);

    // Customers can only view their own transactions
    if (!isStaff && transactionData?.customerId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'Not authorized to view this transaction' },
        { status: 403 }
      );
    }

    // Check if we should query Pesapal for latest status
    const searchParams = request.nextUrl.searchParams;
    const checkPesapal = searchParams.get('checkPesapal') === 'true';

    // Get payment status (server-side function)
    const status = await checkPaymentStatusServer(transactionId, checkPesapal);

    if (!status) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Payment status query error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check payment status',
      },
      { status: 500 }
    );
  }
}
