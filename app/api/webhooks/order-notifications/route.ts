/**
 * Order Notification Webhook
 *
 * Handles automatic notifications for order lifecycle events:
 * - Order created → Email + WhatsApp confirmation
 * - Status → ready → Email + WhatsApp ready notification
 * - Status → delivered/collected → WhatsApp thank you + optional receipt email
 *
 * @module app/api/webhooks/order-notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendOrderConfirmation as sendOrderConfirmationEmail,
  sendOrderStatusUpdate as sendOrderStatusUpdateEmail,
  sendReceipt as sendReceiptEmail,
  type OrderConfirmationData,
  type OrderStatusUpdateData,
  type ReceiptData,
} from '@/services/email';
import {
  sendOrderConfirmation as sendOrderConfirmationWhatsApp,
  sendOrderReady as sendOrderReadyWhatsApp,
  sendDelivered as sendDeliveredWhatsApp,
} from '@/services/wati';

// Verify webhook signature (simple API key for now)
function verifyWebhook(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.WEBHOOK_API_KEY || 'dev-webhook-key';

  return authHeader === `Bearer ${apiKey}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook
    if (!verifyWebhook(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, order, customer } = body;

    if (!event || !order || !customer) {
      return NextResponse.json(
        { error: 'Missing required fields: event, order, customer' },
        { status: 400 }
      );
    }

    const results = {
      email: null as any,
      whatsapp: null as any,
    };

    // Handle different order events
    switch (event) {
      case 'order.created':
        // Send order confirmation email
        if (customer.email) {
          const emailData: OrderConfirmationData = {
            orderId: order.orderId,
            customerName: customer.name,
            customerEmail: customer.email,
            garmentCount: order.garments?.length || 0,
            totalAmount: order.totalAmount,
            estimatedCompletion: new Date(order.estimatedCompletion),
            branchName: order.branchName || 'Lorenzo Dry Cleaners',
            branchPhone: order.branchPhone || '+254 725 462 859',
            orderDate: new Date(order.createdAt),
            trackingUrl: order.trackingUrl,
          };
          results.email = await sendOrderConfirmationEmail(emailData);
        }

        // Send WhatsApp confirmation
        if (customer.phone) {
          results.whatsapp = await sendOrderConfirmationWhatsApp(
            customer.phone,
            {
              orderId: order.orderId,
              customerName: customer.name,
              amount: order.totalAmount,
              estimatedCompletion: new Date(order.estimatedCompletion).toLocaleDateString(),
              customerId: customer.customerId,
            }
          );
        }
        break;

      case 'order.ready':
        // Send status update email
        if (customer.email) {
          const emailData: OrderStatusUpdateData = {
            orderId: order.orderId,
            customerName: customer.name,
            customerEmail: customer.email,
            oldStatus: order.oldStatus || 'processing',
            newStatus: 'ready',
            statusMessage:
              'Your order is ready for pickup! Please collect it at your convenience.',
            trackingUrl: order.trackingUrl,
            estimatedCompletion: order.estimatedCompletion
              ? new Date(order.estimatedCompletion)
              : undefined,
          };
          results.email = await sendOrderStatusUpdateEmail(emailData);
        }

        // Send WhatsApp ready notification
        if (customer.phone) {
          results.whatsapp = await sendOrderReadyWhatsApp(customer.phone, {
            orderId: order.orderId,
            customerName: customer.name,
            collectionMethod: order.collectionMethod || 'pickup',
            branchName: order.branchName || 'Lorenzo Dry Cleaners',
            customerId: customer.customerId,
          });
        }
        break;

      case 'order.delivered':
      case 'order.collected':
        // Send thank you WhatsApp message
        if (customer.phone) {
          results.whatsapp = await sendDeliveredWhatsApp(customer.phone, {
            orderId: order.orderId,
            customerName: customer.name,
            customerId: customer.customerId,
          });
        }

        // Send receipt email if fully paid
        if (order.paymentStatus === 'paid' && customer.email) {
          const receiptData: ReceiptData = {
            orderId: order.orderId,
            customerName: customer.name,
            customerEmail: customer.email,
            totalAmount: order.totalAmount,
            paidAmount: order.paidAmount,
            paymentMethod: order.paymentMethod || 'cash',
            transactionDate: new Date(),
            receiptUrl: order.receiptUrl,
          };
          results.email = await sendReceiptEmail(receiptData);
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown event: ${event}` },
          { status: 400 }
        );
    }

    // Return results
    return NextResponse.json({
      success: true,
      event,
      orderId: order.orderId,
      notifications: {
        email: results.email
          ? { sent: results.email.success, id: results.email.id }
          : null,
        whatsapp: results.whatsapp
          ? {
              sent: results.whatsapp.success,
              id: results.whatsapp.notificationId,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Order notification webhook error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'order-notifications',
    timestamp: new Date().toISOString(),
  });
}
