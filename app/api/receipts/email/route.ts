/**
 * Receipt Email API Route
 *
 * Server-side endpoint for sending receipt emails with PDF attachments.
 * This must be server-side because Resend API key cannot be exposed to client.
 *
 * @module app/api/receipts/email/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateReceiptBlob } from '@/lib/receipts/pdf-generator';
import { formatPrice, formatDateOnly } from '@/lib/receipts/receipt-template';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/receipts/email
 * Send receipt email with PDF attachment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerEmail, customerName, order, customer } = body;

    // Validate required fields
    if (!customerEmail || !order || !customer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate PDF blob
    const pdfBlob = generateReceiptBlob(order, customer);
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Create email HTML
    const emailHtml = createReceiptEmailHTML(customerName || 'Customer', order);

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: 'Lorenzo Dry Cleaners <receipts@lorenzo-dry-cleaners.com>',
      to: customerEmail,
      subject: `Receipt for Order ${order.orderId} - Lorenzo Dry Cleaners`,
      html: emailHtml,
      attachments: [
        {
          filename: `receipt-${order.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Receipt email sent successfully:', data?.id);
    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create beautiful HTML email template for receipt
 */
function createReceiptEmailHTML(customerName: string, order: any): string {
  const items = order.items || order.garments || [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - Lorenzo Dry Cleaners</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
                Lorenzo Dry Cleaners
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Your receipt is ready
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; color: #18181b; font-size: 16px; line-height: 1.5;">
                Dear ${customerName},
              </p>
              <p style="margin: 15px 0 0 0; color: #52525b; font-size: 14px; line-height: 1.6;">
                Thank you for choosing Lorenzo Dry Cleaners! Your receipt for order <strong>${order.orderId}</strong> is attached to this email.
              </p>
            </td>
          </tr>

          <!-- Order Summary Box -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e4e4e7;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #18181b; font-size: 18px; font-weight: 600;">
                      Order Summary
                    </h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Order ID:</td>
                        <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">
                          ${order.orderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Date:</td>
                        <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">
                          ${formatDateOnly(order.createdAt)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Status:</td>
                        <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">
                          ${order.status || 'Received'}
                        </td>
                      </tr>
                      <tr style="border-top: 1px solid #e4e4e7;">
                        <td style="padding: 12px 0 0 0; color: #18181b; font-size: 16px; font-weight: 600;">Total Amount:</td>
                        <td style="padding: 12px 0 0 0; color: #16a34a; font-size: 18px; font-weight: 700; text-align: right;">
                          ${formatPrice(order.totalAmount)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items List -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #18181b; font-size: 16px; font-weight: 600;">
                Items (${items.length})
              </h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e4e4e7; border-radius: 8px;">
                ${items.map((item: any, index: number) => `
                  <tr style="${index > 0 ? 'border-top: 1px solid #e4e4e7;' : ''}">
                    <td style="padding: 12px 15px; color: #18181b; font-size: 14px;">
                      <div style="font-weight: 500;">${item.type || 'Item'}</div>
                      <div style="color: #71717a; font-size: 12px; margin-top: 4px;">
                        ${item.color || 'N/A'}${item.brand ? ` • ${item.brand}` : ''}
                      </div>
                    </td>
                    <td style="padding: 12px 15px; color: #18181b; font-size: 14px; font-weight: 500; text-align: right; white-space: nowrap;">
                      ${formatPrice(item.price)}
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>

          <!-- What's Next Box -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                      📋 What's Next?
                    </h3>
                    <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                      Your items are being processed. We'll notify you when they're ready for pickup or delivery.
                      ${order.estimatedCompletion ? `<br><br><strong>Estimated completion:</strong> ${formatDateOnly(order.estimatedCompletion)}` : ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #fafafa; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #18181b; font-size: 16px; font-weight: 600;">
                Need Help?
              </p>
              <p style="margin: 0 0 15px 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Contact us anytime at:<br>
                <a href="mailto:info@lorenzo-dry-cleaners.com" style="color: #667eea; text-decoration: none;">
                  info@lorenzo-dry-cleaners.com
                </a>
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                Lorenzo Dry Cleaners • Kilimani, Nairobi, Kenya<br>
                <br>
                <em style="font-size: 10px;">
                  🤖 Generated with <a href="https://claude.com/claude-code" style="color: #667eea; text-decoration: none;">Claude Code</a>
                </em>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}