/**
 * Send Quotation API Route (FR-001)
 *
 * Sends a quotation to the customer via WhatsApp, email, or SMS.
 *
 * @module app/api/quotations/[quotationId]/send/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

const COLLECTION_NAME = 'quotations';

/**
 * Roles allowed to send quotations
 */
const SEND_ALLOWED_ROLES = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'front_desk',
];

/**
 * Validation schema for sending a quotation
 */
const sendQuotationSchema = z.object({
  channel: z.enum(['whatsapp', 'email', 'sms']).optional().default('whatsapp'),
  customMessage: z.string().optional(),
});

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(timestamp: FirebaseFirestore.Timestamp): string {
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
  }).format(date);
}

/**
 * Build quotation message for WhatsApp
 */
function buildWhatsAppMessage(
  quotation: Record<string, unknown>,
  customMessage?: string
): string {
  const items = quotation.items as Array<{
    garmentType: string;
    quantity: number;
    services: string[];
    totalPrice: number;
  }>;

  const itemLines = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.garmentType} x${item.quantity} - ${formatCurrency(item.totalPrice)}`
    )
    .join('\n');

  const lines = [
    `*QUOTATION: ${quotation.quotationId}*`,
    '',
    `Dear ${quotation.customerName},`,
    '',
    customMessage || 'Thank you for your interest in our services. Please find your quotation below:',
    '',
    '*Items:*',
    itemLines,
    '',
    `*Subtotal:* ${formatCurrency(quotation.subtotal as number)}`,
  ];

  if ((quotation.deliveryFee as number) > 0) {
    lines.push(`*Delivery Fee:* ${formatCurrency(quotation.deliveryFee as number)}`);
  }

  if ((quotation.discountAmount as number) > 0) {
    lines.push(`*Discount:* -${formatCurrency(quotation.discountAmount as number)}`);
  }

  lines.push(
    '',
    `*TOTAL: ${formatCurrency(quotation.totalAmount as number)}*`,
    '',
    `*Valid Until:* ${formatDate(quotation.validUntil as FirebaseFirestore.Timestamp)}`,
    `*Estimated Completion:* ${formatDate(quotation.estimatedCompletion as FirebaseFirestore.Timestamp)}`,
    '',
    'To accept this quotation, please reply with "ACCEPT" or visit our store.',
    '',
    'Thank you for choosing Lorenzo Dry Cleaners!'
  );

  if (quotation.notes) {
    lines.splice(lines.length - 2, 0, '', `*Notes:* ${quotation.notes}`);
  }

  return lines.join('\n');
}

/**
 * POST /api/quotations/[quotationId]/send
 *
 * Send a quotation to the customer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  try {
    const { quotationId } = await params;

    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user document to check role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    if (!userData?.role || !SEND_ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get existing quotation
    const quotationDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    if (!quotationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    const quotation = quotationDoc.data();

    // Only allow sending draft quotations
    if (quotation?.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot send quotation with status: ${quotation?.status}`,
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validationResult = sendQuotationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { channel, customMessage } = validationResult.data;

    // Check if integrations are configured
    const WATI_ACCESS_TOKEN = process.env.WATI_ACCESS_TOKEN;
    const WATI_API_ENDPOINT = process.env.WATI_API_ENDPOINT;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // Build message based on channel
    let messageSent = false;
    let messageError: string | null = null;
    let integrationConfigured = false;

    if (channel === 'whatsapp') {
      const message = buildWhatsAppMessage(
        { ...quotation, quotationId },
        customMessage
      );

      // Check if Wati.io is configured
      if (WATI_ACCESS_TOKEN && WATI_API_ENDPOINT) {
        integrationConfigured = true;
        try {
          // Call Wati.io API to send WhatsApp message
          const watiResponse = await fetch(`${WATI_API_ENDPOINT}/api/v1/sendSessionMessage/${quotation.customerPhone}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WATI_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messageText: message,
            }),
          });

          if (watiResponse.ok) {
            messageSent = true;
          } else {
            const errorData = await watiResponse.json().catch(() => ({}));
            messageError = errorData.message || `WhatsApp API returned ${watiResponse.status}`;
          }
        } catch (error) {
          messageError = error instanceof Error ? error.message : 'WhatsApp API call failed';
        }
      } else {
        console.log('[MOCK - WhatsApp not configured] Would send to:', quotation.customerPhone);
        console.log('[MOCK] Message:', message);
      }
    } else if (channel === 'email') {
      // Check if Resend is configured
      if (RESEND_API_KEY && quotation.customerEmail) {
        integrationConfigured = true;
        try {
          // Call Resend API to send email
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Lorenzo Dry Cleaners <noreply@lorenzocleaners.co.ke>',
              to: quotation.customerEmail,
              subject: `Quotation ${quotationId} from Lorenzo Dry Cleaners`,
              text: buildWhatsAppMessage({ ...quotation, quotationId }, customMessage),
            }),
          });

          if (emailResponse.ok) {
            messageSent = true;
          } else {
            const errorData = await emailResponse.json().catch(() => ({}));
            messageError = errorData.message || `Email API returned ${emailResponse.status}`;
          }
        } catch (error) {
          messageError = error instanceof Error ? error.message : 'Email API call failed';
        }
      } else if (!quotation.customerEmail) {
        messageError = 'Customer email address not available';
      } else {
        console.log('[MOCK - Email not configured] Would send to:', quotation.customerEmail);
      }
    } else if (channel === 'sms') {
      // SMS integration not yet implemented
      console.log('[MOCK - SMS not configured] Would send to:', quotation.customerPhone);
      messageError = 'SMS integration not configured';
    }

    // If integration is not configured, return specific status
    if (!integrationConfigured && !messageSent) {
      return NextResponse.json(
        {
          success: false,
          error: `${channel.toUpperCase()} integration not configured`,
          message: messageError || `Please configure ${channel.toUpperCase()} credentials in environment variables`,
          integrationStatus: 'not_configured',
        },
        { status: 503 } // Service Unavailable
      );
    }

    // If integration was configured but send failed
    if (!messageSent) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send ${channel} message`,
          message: messageError,
          integrationStatus: 'configured',
        },
        { status: 500 }
      );
    }

    // Update quotation status
    const now = Timestamp.now();
    await adminDb.collection(COLLECTION_NAME).doc(quotationId).update({
      status: 'sent',
      sentAt: now,
      sentVia: channel,
      updatedAt: now,
    });

    // Create notification log
    await adminDb.collection('notifications').add({
      type: 'quotation_sent',
      recipientId: quotation.customerId,
      recipientPhone: quotation.customerPhone,
      orderId: null,
      quotationId: quotationId,
      message: `Quotation ${quotationId} sent via ${channel}`,
      status: 'sent',
      channel: channel,
      timestamp: now,
    });

    // Get updated quotation
    const updatedDoc = await adminDb.collection(COLLECTION_NAME).doc(quotationId).get();
    const updatedQuotation = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return NextResponse.json({
      success: true,
      data: updatedQuotation,
      message: `Quotation sent successfully via ${channel}`,
    });
  } catch (error) {
    console.error('Error sending quotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
