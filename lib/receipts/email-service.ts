/**
 * Email Service for Receipt Delivery
 *
 * This service handles sending receipt PDFs via email using Resend.
 *
 * @module lib/receipts/email-service
 */

import { Resend } from 'resend';
import { generateReceipt } from './receipt-generator';
import { getOrder } from '../db/orders';
import { getCustomer } from '../db/customers';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email configuration
 */
const EMAIL_CONFIG = {
  from: 'Lorenzo Dry Cleaners <receipts@lorenzo-dry-cleaners.com>',
  companyName: 'Lorenzo Dry Cleaners',
  supportEmail: 'support@lorenzo-dry-cleaners.com',
};

/**
 * Send receipt email with PDF attachment
 *
 * @param orderId - Order ID
 * @param recipientEmail - Customer email address
 * @returns Success status and error if any
 */
export async function sendReceiptEmail(
  orderId: string,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return {
        success: false,
        error: 'Email service is not configured. Please contact support.',
      };
    }

    // Fetch order and customer data
    const order = await getOrder(orderId);
    const customer = await getCustomer(order.customerId);

    // Generate PDF receipt
    const pdfBlob = await generateReceipt(orderId);

    // Convert blob to buffer for email attachment
    const pdfBuffer = await pdfBlob.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Format estimated completion date
    const estimatedDate = order.estimatedCompletion.toDate().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create email HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                ${EMAIL_CONFIG.companyName}
              </h1>
              <p style="margin: 10px 0 0; color: #dbeafe; font-size: 14px;">
                Premium Dry Cleaning Service
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                Thank you for your order, ${customer.name}!
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We've received your garments and they're being processed with care.
                Your receipt is attached to this email.
              </p>

              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Order ID:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">
                          ${order.orderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Items:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">
                          ${order.garments.length} garment${order.garments.length !== 1 ? 's' : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Total Amount:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">
                          KES ${order.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Payment Status:</td>
                        <td style="color: ${order.paymentStatus === 'paid' ? '#059669' : '#dc2626'}; font-size: 14px; font-weight: bold; text-align: right; text-transform: capitalize;">
                          ${order.paymentStatus}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Estimated Completion:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: bold; text-align: right;">
                          ${estimatedDate}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                We'll notify you when your order is ready for collection or delivery.
                You can track your order status online at any time.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://lorenzo-dry-cleaners.com/track/${order.orderId}"
                       style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Need help? Contact us at
                <a href="mailto:${EMAIL_CONFIG.supportEmail}" style="color: #2563eb; text-decoration: none;">
                  ${EMAIL_CONFIG.supportEmail}
                </a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${EMAIL_CONFIG.companyName}. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                Kilimani, Nairobi | +254 700 075 810
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Create plain text version for email clients that don't support HTML
    const textContent = `
${EMAIL_CONFIG.companyName}
Receipt for Order ${orderId}

Dear ${customer.name},

Thank you for your order! We've received your garments and they're being processed with care.

Order Details:
- Order ID: ${orderId}
- Items: ${order.garments.length} garment${order.garments.length !== 1 ? 's' : ''}
- Total Amount: KES ${order.totalAmount.toLocaleString()}
- Payment Status: ${order.paymentStatus.toUpperCase()}
- Estimated Completion: ${estimatedDate}

Your detailed receipt is attached as a PDF file.

We'll notify you when your order is ready for collection or delivery.

Track your order: https://lorenzo-dry-cleaners.com/track/${order.orderId}

Need help? Contact us at ${EMAIL_CONFIG.supportEmail}

${EMAIL_CONFIG.companyName}
Kilimani, Nairobi
+254 700 075 810
    `.trim();

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: `Receipt for Order ${orderId} - ${EMAIL_CONFIG.companyName}`,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: `lorenzo-receipt-${orderId}.pdf`,
          content: pdfBase64,
        },
      ],
      tags: [
        {
          name: 'category',
          value: 'receipt',
        },
        {
          name: 'order_id',
          value: orderId,
        },
      ],
    });

    if (error) {
      console.error('Resend email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    console.log('Receipt email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Send receipt email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send receipt email',
    };
  }
}

/**
 * Send order confirmation email (when order is created)
 */
export async function sendOrderConfirmationEmail(
  orderId: string,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: 'Email service is not configured',
      };
    }

    const order = await getOrder(orderId);
    const customer = await getCustomer(order.customerId);

    const estimatedDate = order.estimatedCompletion.toDate().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #059669; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px;">Order Confirmed! ✓</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937;">Hi ${customer.name},</h2>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your order has been confirmed and we're getting started on your garments!
              </p>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #6b7280;"><strong>Order ID:</strong> ${order.orderId}</p>
                <p style="margin: 10px 0 0; color: #6b7280;"><strong>Estimated Ready:</strong> ${estimatedDate}</p>
              </div>
              <p style="margin: 20px 0; color: #4b5563; font-size: 14px;">
                We'll keep you updated on your order's progress.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${EMAIL_CONFIG.companyName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: `Order Confirmed - ${orderId}`,
      html: htmlContent,
      tags: [
        {
          name: 'category',
          value: 'order_confirmation',
        },
        {
          name: 'order_id',
          value: orderId,
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('Send confirmation email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send confirmation email',
    };
  }
}

/**
 * Send order ready notification email
 */
export async function sendOrderReadyEmail(
  orderId: string,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: 'Email service is not configured',
      };
    }

    const order = await getOrder(orderId);
    const customer = await getCustomer(order.customerId);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Ready - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background-color: #059669; padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px;">Your Order is Ready! 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937;">Hi ${customer.name},</h2>
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Great news! Your garments are ready for collection.
              </p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-weight: bold;">Order ID: ${order.orderId}</p>
                <p style="margin: 10px 0 0; color: #166534;">Collection available now</p>
              </div>
              ${order.paymentStatus !== 'paid' ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">Payment Required</p>
                <p style="margin: 10px 0 0; color: #92400e;">Balance Due: KES ${(order.totalAmount - order.paidAmount).toLocaleString()}</p>
              </div>
              ` : ''}
              <p style="margin: 20px 0; color: #4b5563; font-size: 14px;">
                Visit us during business hours to collect your order.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${EMAIL_CONFIG.companyName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: `Your Order is Ready for Collection - ${orderId}`,
      html: htmlContent,
      tags: [
        {
          name: 'category',
          value: 'order_ready',
        },
        {
          name: 'order_id',
          value: orderId,
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('Send order ready email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send order ready email',
    };
  }
}
