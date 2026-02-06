/**
 * Pesapal Webhook Handler (IPN)
 *
 * This endpoint receives payment notifications from Pesapal.
 * It validates the callback and updates transaction status.
 *
 * @module app/api/webhooks/pesapal
 */

import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentCallback } from '@/lib/payments/payment-service.server';
import { verifyPesapalSignature } from '@/services/pesapal';

/**
 * Handle POST request from Pesapal IPN
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    const {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
      // Additional fields
    } = body;

    // Log the callback for debugging
    console.log('Pesapal IPN received:', {
      orderTrackingId: OrderTrackingId,
      merchantReference: OrderMerchantReference,
      notificationType: OrderNotificationType,
    });

    // Validate required fields
    if (!OrderTrackingId || !OrderMerchantReference) {
      console.error('Missing required fields in Pesapal callback');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify callback signature (important for security)
    const signature = request.headers.get('x-pesapal-signature') || '';
    const isValid = verifyPesapalSignature(
      OrderTrackingId,
      OrderMerchantReference,
      signature
    );

    if (!isValid) {
      console.error('Invalid Pesapal signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Process the payment callback
    await handlePaymentCallback({
      orderTrackingId: OrderTrackingId,
      merchantReference: OrderMerchantReference,
      status: OrderNotificationType || 'PENDING',
      statusDescription: body.PaymentStatusDescription || '',
      amount: body.Amount,
      paymentMethod: body.PaymentMethod,
      confirmationCode: body.ConfirmationCode,
      paymentAccount: body.PaymentAccount,
    });

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Callback processed successfully',
    });
  } catch (error) {
    console.error('Pesapal webhook error:', error);

    // Return error response
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET request (Pesapal sometimes uses GET for IPN)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const orderTrackingId = searchParams.get('OrderTrackingId');
    const merchantReference = searchParams.get('OrderMerchantReference');
    const notificationType = searchParams.get('OrderNotificationType');

    // Log the callback
    console.log('Pesapal IPN received (GET):', {
      orderTrackingId,
      merchantReference,
      notificationType,
    });

    // Validate required fields
    if (!orderTrackingId || !merchantReference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process the payment callback
    await handlePaymentCallback({
      orderTrackingId,
      merchantReference,
      status: notificationType || 'PENDING',
      statusDescription: searchParams.get('PaymentStatusDescription') || '',
      amount: parseFloat(searchParams.get('Amount') || '0'),
      paymentMethod: searchParams.get('PaymentMethod') || '',
      confirmationCode: searchParams.get('ConfirmationCode') || '',
      paymentAccount: searchParams.get('PaymentAccount') || '',
    });

    return NextResponse.json({
      status: 'success',
      message: 'Callback processed successfully',
    });
  } catch (error) {
    console.error('Pesapal webhook error (GET):', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}
