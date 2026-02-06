/**
 * Payment Initiation API
 *
 * Initiates digital payments (M-Pesa/Card) via Pesapal.
 * This route must be server-side to avoid CORS issues with Pesapal API.
 *
 * @module app/api/payments/initiate
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  submitOrderRequest,
  PesapalPaymentData,
} from '@/services/pesapal';

interface InitiatePaymentRequest {
  orderId: string;
  customerId: string;
  amount: number;
  method: 'mpesa' | 'card';
  customerPhone: string;
  customerEmail?: string;
  userId: string;
}

/**
 * POST /api/payments/initiate
 * Initiates a digital payment via Pesapal
 */
export async function POST(request: NextRequest) {
  try {
    const body: InitiatePaymentRequest = await request.json();
    const {
      orderId,
      customerId,
      amount,
      method,
      customerPhone,
      customerEmail,
      userId,
    } = body;

    // Validate required fields
    if (!orderId || !customerId || !amount || !method || !customerPhone || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Get order to verify it exists and check balance
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderDoc.data();
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order data not found' },
        { status: 404 }
      );
    }

    const balanceDue = order.totalAmount - (order.paidAmount || 0);
    if (amount > balanceDue) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment amount (KES ${amount}) exceeds balance due (KES ${balanceDue})`,
        },
        { status: 400 }
      );
    }

    // Submit payment request to Pesapal (server-side - no CORS issues)
    const pesapalData: PesapalPaymentData = {
      orderId,
      amount,
      customerPhone,
      customerEmail: customerEmail || '',
      description: `Lorenzo Dry Cleaners - Order ${orderId}`,
    };

    const pesapalResponse = await submitOrderRequest(pesapalData);

    if (!pesapalResponse.success || !pesapalResponse.redirectUrl) {
      return NextResponse.json(
        {
          success: false,
          error: pesapalResponse.error || 'Failed to initiate payment with Pesapal',
        },
        { status: 500 }
      );
    }

    // Generate transaction ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    const transactionId = `TXN-${timestamp}-${random}`.toUpperCase();

    // Create pending transaction record
    const transactionData = {
      transactionId,
      orderId,
      customerId,
      branchId: order.branchId,
      amount,
      method,
      status: 'pending',
      paymentType: amount >= balanceDue ? 'full' : 'partial',
      pesapalRef: pesapalResponse.orderTrackingId,
      processedBy: userId,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    await adminDb.collection('transactions').doc(transactionId).set(transactionData);

    return NextResponse.json({
      success: true,
      transactionId,
      redirectUrl: pesapalResponse.redirectUrl,
      message: 'Payment initiated successfully',
    });
  } catch (error) {
    console.error('[Payment Initiate API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate payment',
      },
      { status: 500 }
    );
  }
}