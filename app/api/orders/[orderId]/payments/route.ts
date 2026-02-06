/**
 * Payment History API for Orders
 *
 * Returns all payment transactions for a specific order.
 * Supports partial payment tracking with multiple M-Pesa transactions.
 *
 * @module app/api/orders/[orderId]/payments/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

interface PaymentTransaction {
  transactionId: string;
  amount: number;
  method: string;
  status: string;
  paymentType: string;
  timestamp: Date;
  processedBy: string;
  note?: string;
}

/**
 * GET /api/orders/[orderId]/payments
 * Returns all payment transactions for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Query transactions collection for this order
    const transactionsSnapshot = await adminDb
      .collection('transactions')
      .where('orderId', '==', orderId)
      .orderBy('timestamp', 'desc')
      .get();

    const transactions: PaymentTransaction[] = transactionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        transactionId: data.transactionId || doc.id,
        amount: data.amount || 0,
        method: data.method || 'unknown',
        status: data.status || 'unknown',
        paymentType: data.paymentType || 'unknown',
        timestamp: data.timestamp?.toDate() || new Date(),
        processedBy: data.processedBy || '',
        note: data.note,
      };
    });

    // Calculate totals
    const completedTransactions = transactions.filter((t) => t.status === 'completed');
    const totalPaid = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      transactions,
      totalPaid,
      count: transactions.length,
      completedCount: completedTransactions.length,
    });
  } catch (error) {
    console.error('[Payment History API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
