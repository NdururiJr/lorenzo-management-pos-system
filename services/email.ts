/**
 * Email Service
 *
 * This service handles all email operations using Resend API.
 * It includes retry logic, error handling, and logging for all email sends.
 *
 * Features:
 * - Password reset emails
 * - Order confirmation emails
 * - Order status update notifications
 * - Receipt delivery with PDF attachments
 * - Retry logic with exponential backoff
 * - Comprehensive error handling and logging
 *
 * @module services/email
 */

import { resend, FROM_EMAIL, EMAIL_CONFIG, EmailResult, isResendConfigured } from '@/lib/resend';
import { render } from '@react-email/render';
import PasswordResetEmail from '@/emails/password-reset';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import OrderStatusUpdateEmail from '@/emails/order-status-update';
import ReceiptEmail from '@/emails/receipt';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send email with retry logic
 *
 * @param emailData - Email data to send
 * @param retryCount - Current retry attempt (internal use)
 * @returns Email result with success status
 */
async function sendEmailWithRetry(
  emailData: {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
    }>;
  },
  retryCount = 0
): Promise<EmailResult> {
  try {
    // Check if Resend is configured
    if (!isResendConfigured()) {
      console.warn('⚠️ Resend not configured. Email will not be sent:', emailData.subject);
      return {
        success: false,
        error: 'Email service not configured',
        retryCount,
      };
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: emailData.to,
      subject: emailData.subject,
      react: emailData.react,
      attachments: emailData.attachments,
    });

    if (error) {
      throw new Error(error.message || 'Unknown error sending email');
    }

    // Log success
    console.log(`✅ Email sent successfully: ${emailData.subject} to ${emailData.to}`, {
      id: data?.id,
      retryCount,
    });

    return {
      success: true,
      id: data?.id,
      retryCount,
    };
  } catch (error: any) {
    console.error(`❌ Email send error (attempt ${retryCount + 1}):`, {
      subject: emailData.subject,
      to: emailData.to,
      error: error.message,
    });

    // Retry logic
    if (retryCount < EMAIL_CONFIG.maxRetries) {
      const delay = EMAIL_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
      console.log(`⏳ Retrying in ${delay}ms...`);
      await sleep(delay);
      return sendEmailWithRetry(emailData, retryCount + 1);
    }

    // Max retries exceeded
    console.error(`❌ Max retries exceeded for email: ${emailData.subject}`);
    return {
      success: false,
      error: error.message || 'Failed to send email after retries',
      retryCount,
    };
  }
}

/**
 * Log email attempt to Firestore (optional)
 * This helps track all email communications
 */
async function logEmailAttempt(
  type: string,
  recipient: string,
  result: EmailResult,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Import Firestore only when needed to avoid circular dependencies
    const { adminDb } = await import('@/lib/firebase-admin');

    await adminDb.collection('email_logs').add({
      type,
      recipient,
      success: result.success,
      emailId: result.id,
      error: result.error,
      retryCount: result.retryCount,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    // Don't throw error if logging fails - it's not critical
    console.error('Failed to log email attempt:', error);
  }
}

/**
 * Send password reset email
 *
 * @param email - Recipient email address
 * @param resetLink - Password reset link
 * @param userName - User's name (optional)
 * @returns Email result
 */
export async function sendPasswordReset(
  email: string,
  resetLink: string,
  userName?: string
): Promise<EmailResult> {
  try {
    const emailHtml = await render(
      PasswordResetEmail({ email, resetLink, userName })
    );

    const result = await sendEmailWithRetry({
      to: email,
      subject: 'Reset Your Password - Lorenzo Dry Cleaners',
      react: PasswordResetEmail({ email, resetLink, userName }),
    });

    // Log the attempt
    await logEmailAttempt('password_reset', email, result, { resetLink });

    return result;
  } catch (error: any) {
    console.error('Password reset email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send password reset email',
    };
  }
}

/**
 * Order confirmation email data interface
 */
export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  garmentCount: number;
  totalAmount: number;
  estimatedCompletion: Date;
  branchName: string;
  branchPhone: string;
  orderDate: Date;
  trackingUrl?: string;
}

/**
 * Send order confirmation email
 *
 * @param data - Order confirmation data
 * @returns Email result
 */
export async function sendOrderConfirmation(
  data: OrderConfirmationData
): Promise<EmailResult> {
  try {
    const result = await sendEmailWithRetry({
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderId} - Lorenzo Dry Cleaners`,
      react: OrderConfirmationEmail(data),
    });

    // Log the attempt
    await logEmailAttempt('order_confirmation', data.customerEmail, result, {
      orderId: data.orderId,
      amount: data.totalAmount,
    });

    return result;
  } catch (error: any) {
    console.error('Order confirmation email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send order confirmation email',
    };
  }
}

/**
 * Order status update email data interface
 */
export interface OrderStatusUpdateData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  statusMessage: string;
  trackingUrl?: string;
  estimatedCompletion?: Date;
}

/**
 * Send order status update email
 *
 * @param data - Order status update data
 * @returns Email result
 */
export async function sendOrderStatusUpdate(
  data: OrderStatusUpdateData
): Promise<EmailResult> {
  try {
    const result = await sendEmailWithRetry({
      to: data.customerEmail,
      subject: `Order Update #${data.orderId} - ${data.newStatus}`,
      react: OrderStatusUpdateEmail(data),
    });

    // Log the attempt
    await logEmailAttempt('order_status_update', data.customerEmail, result, {
      orderId: data.orderId,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
    });

    return result;
  } catch (error: any) {
    console.error('Order status update email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send order status update email',
    };
  }
}

/**
 * Receipt email data interface
 */
export interface ReceiptData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  transactionDate: Date;
  receiptUrl?: string;
}

/**
 * Send receipt email with optional PDF attachment
 *
 * @param data - Receipt data
 * @param pdfBuffer - Optional PDF buffer to attach
 * @returns Email result
 */
export async function sendReceipt(
  data: ReceiptData,
  pdfBuffer?: Buffer
): Promise<EmailResult> {
  try {
    const attachments = pdfBuffer
      ? [
          {
            filename: `receipt-${data.orderId}.pdf`,
            content: pdfBuffer,
          },
        ]
      : undefined;

    const result = await sendEmailWithRetry({
      to: data.customerEmail,
      subject: `Receipt #${data.orderId} - Lorenzo Dry Cleaners`,
      react: ReceiptEmail(data),
      attachments,
    });

    // Log the attempt
    await logEmailAttempt('receipt', data.customerEmail, result, {
      orderId: data.orderId,
      amount: data.totalAmount,
      hasPdfAttachment: Boolean(pdfBuffer),
    });

    return result;
  } catch (error: any) {
    console.error('Receipt email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send receipt email',
    };
  }
}

/**
 * Send generic transactional email
 * Use this for custom email templates
 *
 * @param to - Recipient email
 * @param subject - Email subject
 * @param reactComponent - React Email component
 * @returns Email result
 */
export async function sendTransactionalEmail(
  to: string | string[],
  subject: string,
  reactComponent: React.ReactElement
): Promise<EmailResult> {
  try {
    const result = await sendEmailWithRetry({
      to,
      subject,
      react: reactComponent,
    });

    // Log the attempt
    const recipient = Array.isArray(to) ? to.join(', ') : to;
    await logEmailAttempt('custom', recipient, result, { subject });

    return result;
  } catch (error: any) {
    console.error('Transactional email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send transactional email',
    };
  }
}

/**
 * Test email connection
 * Useful for debugging and setup verification
 *
 * @param testEmail - Email to send test to
 * @returns Email result
 */
export async function testEmailConnection(testEmail: string): Promise<EmailResult> {
  try {
    if (!isResendConfigured()) {
      return {
        success: false,
        error: 'Resend API key not configured',
      };
    }

    const result = await sendEmailWithRetry({
      to: testEmail,
      subject: 'Test Email - Lorenzo Dry Cleaners',
      react: PasswordResetEmail({
        email: testEmail,
        resetLink: 'https://example.com/reset',
        userName: 'Test User',
      }),
    });

    return result;
  } catch (error: any) {
    console.error('Test email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send test email',
    };
  }
}
