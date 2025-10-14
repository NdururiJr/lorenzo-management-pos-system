/**
 * Payment Status API
 *
 * Query the status of a payment transaction.
 *
 * @module app/api/payments/[transactionId]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/payments/payment-service';

/**
 * GET /api/payments/[transactionId]/status
 *
 * Query payment status by transaction ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    // Check if we should query Pesapal for latest status
    const searchParams = request.nextUrl.searchParams;
    const checkPesapal = searchParams.get('checkPesapal') === 'true';

    // Get payment status
    const status = await checkPaymentStatus(transactionId, checkPesapal);

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
