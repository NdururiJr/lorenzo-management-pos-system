/**
 * Payment Status Check API (Simplified)
 *
 * Simple endpoint to check payment status without complex authentication.
 * Used for client-side polling during payment processing.
 *
 * @module app/api/payments/[transactionId]/status/check
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatusServer } from '@/lib/payments/payment-service.server';

/**
 * GET /api/payments/[transactionId]/status/check
 *
 * Check payment status by transaction ID
 * Does not require Bearer token - used for payment polling
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID required' },
        { status: 400 }
      );
    }

    // Check if we should query Pesapal for latest status
    const searchParams = request.nextUrl.searchParams;
    const checkPesapal = searchParams.get('checkPesapal') === 'true';

    // Get payment status (server-side function)
    const status = await checkPaymentStatusServer(transactionId, checkPesapal);

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('[Payment Status Check API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check payment status',
      },
      { status: 500 }
    );
  }
}