/**
 * Wati.io Integration Test API Endpoint
 *
 * This endpoint allows testing the Wati.io integration via HTTP requests.
 * Useful for testing from tools like Postman or browser.
 *
 * Endpoints:
 * - GET  /api/test/wati         - Test connection and get templates
 * - POST /api/test/wati/send    - Send test notification
 *
 * @example GET request
 * curl http://localhost:3000/api/test/wati
 *
 * @example POST request
 * curl -X POST http://localhost:3000/api/test/wati/send \
 *   -H "Content-Type: application/json" \
 *   -d '{"phone":"+254712345678","type":"order_confirmation"}'
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  testWatiConnection,
  getMessageTemplates,
  sendOrderConfirmation,
  sendOrderReady,
  sendDriverDispatched,
  sendPaymentReminder,
  isValidKenyanPhoneNumber,
} from '@/services/wati';

/**
 * GET /api/test/wati
 * Test connection and retrieve approved templates
 */
export async function GET(request: NextRequest) {
  try {
    // Test connection
    const connectionResult = await testWatiConnection();

    if (!connectionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: connectionResult.message,
        },
        { status: 500 }
      );
    }

    // Get templates
    const templatesResult = await getMessageTemplates();

    // Required templates
    const requiredTemplates = [
      'order_confirmation',
      'order_ready',
      'driver_dispatched',
      'driver_nearby',
      'order_delivered',
      'payment_reminder',
    ];

    const approvedTemplates = templatesResult.templates || [];
    const missingTemplates = requiredTemplates.filter(
      (t) => !approvedTemplates.includes(t)
    );

    return NextResponse.json({
      success: true,
      connection: {
        status: 'connected',
        message: connectionResult.message,
      },
      templates: {
        total: approvedTemplates.length,
        approved: approvedTemplates,
        required: requiredTemplates,
        missing: missingTemplates,
        allRequiredApproved: missingTemplates.length === 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Wati test endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test/wati
 * Send test notification
 *
 * Request body:
 * {
 *   "phone": "+254712345678",
 *   "type": "order_confirmation" | "order_ready" | "driver_dispatched" | "payment_reminder"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, type } = body;

    // Validate phone
    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number is required',
        },
        { status: 400 }
      );
    }

    if (!isValidKenyanPhoneNumber(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Kenya phone number. Must be in format +254...',
        },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = [
      'order_confirmation',
      'order_ready',
      'driver_dispatched',
      'payment_reminder',
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Send test notification based on type
    let result;
    const testOrderId = `TEST-${Date.now()}`;
    const testDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString();

    switch (type) {
      case 'order_confirmation':
        result = await sendOrderConfirmation(phone, {
          orderId: testOrderId,
          customerName: 'Test Customer',
          amount: 1500,
          estimatedCompletion: testDate,
        });
        break;

      case 'order_ready':
        result = await sendOrderReady(phone, {
          orderId: testOrderId,
          customerName: 'Test Customer',
          collectionMethod: 'pickup',
          branchName: 'Lorenzo Kilimani',
        });
        break;

      case 'driver_dispatched':
        result = await sendDriverDispatched(
          phone,
          {
            orderId: testOrderId,
            customerName: 'Test Customer',
          },
          {
            driverName: 'Test Driver',
            driverPhone: '+254700000000',
            estimatedArrival: 30,
          }
        );
        break;

      case 'payment_reminder':
        result = await sendPaymentReminder(
          phone,
          {
            orderId: testOrderId,
            customerName: 'Test Customer',
          },
          500
        );
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid notification type',
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        notificationId: result.notificationId,
        phone: phone,
        type: type,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send notification',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Wati test send error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
