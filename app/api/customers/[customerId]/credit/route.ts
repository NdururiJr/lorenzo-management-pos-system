/**
 * Customer Credit API (FR-005)
 *
 * Manages customer credit balance operations including
 * adding credit, applying credit, and viewing history.
 *
 * @module app/api/customers/[customerId]/credit
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// GET /api/customers/[customerId]/credit
// Get customer credit balance and history
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';

    // Get customer
    const customerDoc = await adminDb.collection('customers').doc(customerId).get();

    if (!customerDoc.exists) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerDoc.data();
    const creditBalance = customer?.creditBalance || 0;
    const lastCreditUpdate = customer?.lastCreditUpdate?.toDate?.() || null;

    const response: {
      success: boolean;
      customerId: string;
      creditBalance: number;
      lastCreditUpdate: Date | null;
      history?: Array<{
        transactionId: string;
        type: string;
        amount: number;
        orderId?: string;
        note?: string;
        timestamp: Date;
      }>;
    } = {
      success: true,
      customerId,
      creditBalance,
      lastCreditUpdate,
    };

    // Include credit history if requested
    if (includeHistory) {
      const transactionsSnapshot = await adminDb
        .collection('transactions')
        .where('customerId', '==', customerId)
        .where('paymentType', 'in', ['advance', 'credit_applied', 'refund'])
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      response.history = transactionsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          transactionId: data.transactionId,
          type: data.paymentType === 'advance'
            ? 'credit_added'
            : data.paymentType === 'credit_applied'
              ? 'credit_used'
              : 'refund',
          amount: data.amount,
          orderId: data.orderId,
          note: data.note,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
        };
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching customer credit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer credit' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/customers/[customerId]/credit
// Add credit to customer account (advance payment)
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json();
    const { amount, branchId, processedBy, method, note, pesapalRef } = body;

    // Validate required fields
    if (!amount || !branchId || !processedBy || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, branchId, processedBy, method' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Check customer exists
    const customerRef = adminDb.collection('customers').doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerDoc.data();
    const currentBalance = customer?.creditBalance || 0;
    const newBalance = currentBalance + amount;

    // Generate transaction ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    const transactionId = `TXN-${timestamp}-${random}`.toUpperCase();

    // Create transaction record
    const transactionData: Record<string, unknown> = {
      transactionId,
      customerId,
      branchId,
      amount,
      method,
      status: 'completed',
      paymentType: 'advance',
      timestamp: Timestamp.now(),
      processedBy,
      note: note || 'Advance payment - Credit added to account',
    };

    if (pesapalRef) transactionData.pesapalRef = pesapalRef;

    // Update customer balance and create transaction
    const batch = adminDb.batch();

    batch.update(customerRef, {
      creditBalance: newBalance,
      lastCreditUpdate: Timestamp.now(),
    });

    batch.set(
      adminDb.collection('transactions').doc(transactionId),
      transactionData
    );

    await batch.commit();

    return NextResponse.json({
      success: true,
      transactionId,
      previousBalance: currentBalance,
      creditAdded: amount,
      newBalance,
      message: 'Credit added successfully',
    });
  } catch (error) {
    console.error('Error adding customer credit:', error);
    return NextResponse.json(
      { error: 'Failed to add customer credit' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/customers/[customerId]/credit
// Apply customer credit to an order
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json();
    const { orderId, amount, branchId, processedBy } = body;

    // Validate required fields
    if (!orderId || !amount || !branchId || !processedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, branchId, processedBy' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Get customer
    const customerRef = adminDb.collection('customers').doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerDoc.data();
    const currentBalance = customer?.creditBalance || 0;

    if (currentBalance <= 0) {
      return NextResponse.json(
        { error: 'Customer has no credit balance' },
        { status: 400 }
      );
    }

    // Calculate amount to apply
    const amountToApply = Math.min(amount, currentBalance);
    const newBalance = currentBalance - amountToApply;

    // Get order
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderDoc.data();
    const currentPaidAmount = order?.paidAmount || 0;
    const totalAmount = order?.totalAmount || 0;
    const newPaidAmount = currentPaidAmount + amountToApply;

    let newPaymentStatus: string;
    if (newPaidAmount >= totalAmount) {
      newPaymentStatus = newPaidAmount > totalAmount ? 'overpaid' : 'paid';
    } else if (newPaidAmount > 0) {
      newPaymentStatus = 'partial';
    } else {
      newPaymentStatus = 'pending';
    }

    // Generate transaction ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    const transactionId = `TXN-${timestamp}-${random}`.toUpperCase();

    // Create batch operation
    const batch = adminDb.batch();

    // Update customer credit balance
    batch.update(customerRef, {
      creditBalance: newBalance,
      lastCreditUpdate: Timestamp.now(),
    });

    // Update order payment
    batch.update(orderRef, {
      paidAmount: newPaidAmount,
      paymentStatus: newPaymentStatus,
    });

    // Create transaction record
    batch.set(adminDb.collection('transactions').doc(transactionId), {
      transactionId,
      orderId,
      customerId,
      branchId,
      amount: amountToApply,
      method: 'customer_credit',
      status: 'completed',
      paymentType: 'credit_applied',
      timestamp: Timestamp.now(),
      processedBy,
      note: 'Credit applied from customer balance',
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      transactionId,
      amountApplied: amountToApply,
      previousBalance: currentBalance,
      newBalance,
      orderPaidAmount: newPaidAmount,
      orderPaymentStatus: newPaymentStatus,
      message: 'Credit applied successfully',
    });
  } catch (error) {
    console.error('Error applying customer credit:', error);
    return NextResponse.json(
      { error: 'Failed to apply customer credit' },
      { status: 500 }
    );
  }
}
