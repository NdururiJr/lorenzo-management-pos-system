/**
 * Payments API (FR-005)
 *
 * Handles payment operations including partial payments,
 * advance payments, and credit management.
 *
 * IMPORTANT: Uses atomic batch writes for high-volume reliability.
 * All related updates (transaction + order + customer) happen atomically.
 *
 * @module app/api/payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// ============================================
// POST /api/payments - Record a payment (ATOMIC)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      customerId,
      branchId,
      amount,
      method,
      paymentType,
      processedBy,
      note,
      pesapalRef,
    } = body;

    // Validate required fields
    if (!customerId || !branchId || !amount || !method || !processedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Generate transaction ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    const transactionId = `TXN-${timestamp}-${random}`.toUpperCase();

    // Use batch write for atomic updates (prevents race conditions under high load)
    const batch = adminDb.batch();

    // 1. Create transaction record
    const transactionRef = adminDb.collection('transactions').doc(transactionId);
    const transactionData: Record<string, unknown> = {
      transactionId,
      customerId,
      branchId,
      amount,
      method,
      status: 'completed',
      paymentType: paymentType || 'partial',
      timestamp: Timestamp.now(),
      processedBy,
    };

    if (orderId) transactionData.orderId = orderId;
    if (note) transactionData.note = note;
    if (pesapalRef) transactionData.pesapalRef = pesapalRef;

    batch.set(transactionRef, transactionData);

    // 2. If this is for an order, update order payment status atomically
    let newPaymentStatus: string | null = null;
    if (orderId) {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        const order = orderDoc.data();
        const currentPaidAmount = order?.paidAmount || 0;
        const totalAmount = order?.totalAmount || 0;
        const newPaidAmount = currentPaidAmount + amount;

        if (newPaidAmount >= totalAmount) {
          newPaymentStatus = newPaidAmount > totalAmount ? 'overpaid' : 'paid';
        } else if (newPaidAmount > 0) {
          newPaymentStatus = 'partial';
        } else {
          newPaymentStatus = 'pending';
        }

        batch.update(orderRef, {
          paidAmount: FieldValue.increment(amount), // Use increment for concurrency safety
          paymentStatus: newPaymentStatus,
          paymentMethod: method,
          lastPaymentAt: Timestamp.now(),
        });
      }
    }

    // 3. If this is an advance payment, update customer credit balance atomically
    if (paymentType === 'advance' && !orderId) {
      const customerRef = adminDb.collection('customers').doc(customerId);
      batch.update(customerRef, {
        creditBalance: FieldValue.increment(amount), // Use increment for concurrency safety
        lastCreditUpdate: Timestamp.now(),
      });
    }

    // 4. Update daily stats counter atomically (for O(1) dashboard queries)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyStatsRef = adminDb.collection('dailyStats').doc(`${branchId}_${today}`);
    batch.set(
      dailyStatsRef,
      {
        branchId,
        date: today,
        totalRevenue: FieldValue.increment(amount),
        transactionCount: FieldValue.increment(1),
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );

    // Commit all updates atomically
    await batch.commit();

    return NextResponse.json({
      success: true,
      transactionId,
      paymentStatus: newPaymentStatus,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/payments - Get payments with filters
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const customerId = searchParams.get('customerId');
    const branchId = searchParams.get('branchId');
    const paymentType = searchParams.get('paymentType');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    let query = adminDb.collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    // Apply filters
    if (orderId) {
      query = adminDb.collection('transactions')
        .where('orderId', '==', orderId)
        .orderBy('timestamp', 'desc')
        .limit(limit);
    } else if (customerId) {
      query = adminDb.collection('transactions')
        .where('customerId', '==', customerId)
        .orderBy('timestamp', 'desc')
        .limit(limit);
    } else if (branchId) {
      query = adminDb.collection('transactions')
        .where('branchId', '==', branchId)
        .orderBy('timestamp', 'desc')
        .limit(limit);
    }

    const snapshot = await query.get();
    const payments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      } as Record<string, unknown>;
    });

    // Filter by paymentType client-side if needed (Firestore limitation)
    const filteredPayments = paymentType
      ? payments.filter((p) => p.paymentType === paymentType)
      : payments;

    return NextResponse.json({
      success: true,
      payments: filteredPayments,
      count: filteredPayments.length,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
