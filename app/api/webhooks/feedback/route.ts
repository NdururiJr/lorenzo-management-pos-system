/**
 * Feedback Webhook API Endpoint
 *
 * Receives customer feedback from WhatsApp interactive messages (via Wati.io)
 * and processes quick rating responses.
 *
 * @module app/api/webhooks/feedback/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFeedback, hasFeedback } from '@/lib/db/feedback';
import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Environment variables
const WATI_WEBHOOK_SECRET = process.env.WATI_WEBHOOK_SECRET;

/**
 * Wati.io interactive message response structure
 * Note: Kept for documentation purposes but currently unused
 */
interface _WatiInteractiveResponse {
  // Message metadata
  id: string;
  waId: string; // Customer's WhatsApp ID (phone number)
  timestamp: string;
  type: 'interactive' | 'text';

  // Interactive message response
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: {
      id: string; // Button ID (e.g., "rating_5", "rating_4")
      title: string; // Button text
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };

  // Context (original message reference)
  context?: {
    from: string;
    id: string;
  };

  // Text message (if type is 'text')
  text?: {
    body: string;
  };

  // Custom data we attached
  referralData?: {
    orderId?: string;
    feedbackType?: string;
  };
}

/**
 * Parse rating from button ID
 */
function parseRatingFromButtonId(buttonId: string): number | null {
  // Expected format: "rating_5", "rating_4", etc.
  const match = buttonId.match(/rating_(\d)/);
  if (match) {
    const rating = parseInt(match[1], 10);
    if (rating >= 1 && rating <= 5) {
      return rating;
    }
  }
  return null;
}

/**
 * Find order by customer phone number (most recent delivered order)
 */
async function findRecentOrderByPhone(phone: string): Promise<{
  orderId: string;
  customerId: string;
  branchId: string;
} | null> {
  // Normalize phone number
  const normalizedPhone = phone.replace(/\D/g, '');
  const phoneVariants = [
    normalizedPhone,
    `+${normalizedPhone}`,
    normalizedPhone.startsWith('254') ? `+${normalizedPhone}` : `+254${normalizedPhone.slice(-9)}`,
  ];

  // Query orders by customer phone
  const ordersQuery = query(
    collection(db, 'orders'),
    where('customerPhone', 'in', phoneVariants),
    where('status', 'in', ['delivered', 'collected']),
    limit(1)
  );

  const snapshot = await getDocs(ordersQuery);
  if (snapshot.empty) {
    // Try without status filter
    const allOrdersQuery = query(
      collection(db, 'orders'),
      where('customerPhone', 'in', phoneVariants),
      limit(1)
    );
    const allSnapshot = await getDocs(allOrdersQuery);
    if (allSnapshot.empty) {
      return null;
    }
    const order = allSnapshot.docs[0].data();
    return {
      orderId: order.orderId,
      customerId: order.customerId,
      branchId: order.branchId,
    };
  }

  const order = snapshot.docs[0].data();
  return {
    orderId: order.orderId,
    customerId: order.customerId,
    branchId: order.branchId,
  };
}

/**
 * Handle WhatsApp feedback webhook from Wati.io
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Wati.io sends webhooks in various formats
    // Handle interactive message response (button click)
    const messages = payload.messages || [payload];

    for (const message of messages) {
      // Skip if not an interactive message
      if (message.type !== 'interactive') {
        continue;
      }

      const interactive = message.interactive;
      if (!interactive || interactive.type !== 'button_reply') {
        continue;
      }

      const buttonId = interactive.button_reply?.id;
      if (!buttonId) {
        continue;
      }

      // Parse rating from button ID
      const rating = parseRatingFromButtonId(buttonId);
      if (rating === null) {
        console.log('[Feedback Webhook] Non-rating button clicked:', buttonId);
        continue;
      }

      // Get customer phone number
      const customerPhone = message.waId || message.from;
      if (!customerPhone) {
        console.warn('[Feedback Webhook] No customer phone in message');
        continue;
      }

      // Try to get order ID from referral data or find recent order
      let orderInfo = message.referralData?.orderId
        ? { orderId: message.referralData.orderId, customerId: '', branchId: '' }
        : null;

      if (!orderInfo) {
        orderInfo = await findRecentOrderByPhone(customerPhone);
      }

      if (!orderInfo) {
        console.warn('[Feedback Webhook] Could not find order for phone:', customerPhone);
        continue;
      }

      // Check if feedback already exists
      const existingFeedback = await hasFeedback(orderInfo.orderId);
      if (existingFeedback) {
        console.log('[Feedback Webhook] Feedback already exists for order:', orderInfo.orderId);
        continue;
      }

      // Create feedback record
      try {
        const feedback = await createFeedback({
          orderId: orderInfo.orderId,
          customerId: orderInfo.customerId,
          branchId: orderInfo.branchId,
          overallRating: rating,
          source: 'whatsapp',
          deviceInfo: `WhatsApp: ${customerPhone}`,
        });

        console.log('[Feedback Webhook] Feedback created:', {
          feedbackId: feedback.feedbackId,
          orderId: orderInfo.orderId,
          rating,
          source: 'whatsapp',
        });
      } catch (error) {
        console.error('[Feedback Webhook] Error creating feedback:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Feedback Webhook] Error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook (some services require this)
 */
export async function GET(request: NextRequest) {
  // Wati.io webhook verification
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const verifyToken = request.nextUrl.searchParams.get('hub.verify_token');

  if (challenge && verifyToken === WATI_WEBHOOK_SECRET) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({
    status: 'ok',
    endpoint: 'feedback webhook',
  });
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
