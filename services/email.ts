/**
 * Email Service
 *
 * This service handles all email operations using Resend API.
 * It includes retry logic, error handling, and logging for all email sends.
 *
 * Features:
 * - Password reset emails (staff & customers)
 * - Employee invitation emails
 * - Order confirmation emails
 * - Order status update notifications (ready, delivered, etc.)
 * - Receipt delivery with PDF attachments
 * - Payment reminder emails
 * - Pickup request confirmation emails
 * - Retry logic with exponential backoff
 * - Comprehensive error handling and logging
 * - Email attempt logging to Firestore
 *
 * @module services/email
 */

import 'server-only';

import { resend, FROM_EMAIL, EMAIL_CONFIG, EmailResult, isResendConfigured, EMAIL_SENDERS } from '@/lib/resend';
import {
  passwordResetEmailHtml,
  orderConfirmationEmailHtml,
  orderStatusUpdateEmailHtml,
  receiptEmailHtml,
  employeeInvitationEmailHtml,
  paymentReminderEmailHtml,
  pickupRequestEmailHtml,
} from '@/lib/email-templates-html';

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
    html: string;
    from?: string; // Optional custom sender address
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
      from: emailData.from || FROM_EMAIL, // Use custom sender or default
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
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
    const html = passwordResetEmailHtml({ email, resetLink, userName });

    const result = await sendEmailWithRetry({
      to: email,
      subject: 'Reset Your Password - Lorenzo Dry Cleaners',
      html,
      from: EMAIL_SENDERS.support, // Use support@ for password resets
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
    const html = orderConfirmationEmailHtml(data);

    const result = await sendEmailWithRetry({
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderId} - Lorenzo Dry Cleaners`,
      html,
      from: EMAIL_SENDERS.orders, // Use orders@ for order confirmations
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
    const html = orderStatusUpdateEmailHtml(data);

    const result = await sendEmailWithRetry({
      to: data.customerEmail,
      subject: `Order Update #${data.orderId} - ${data.newStatus}`,
      html,
      from: EMAIL_SENDERS.orders, // Use orders@ for status updates
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
    const html = receiptEmailHtml(data);

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
      html,
      from: EMAIL_SENDERS.billing, // Use billing@ for receipts
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
 * @param html - HTML content
 * @returns Email result
 */
export async function sendTransactionalEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<EmailResult> {
  try {
    const result = await sendEmailWithRetry({
      to,
      subject,
      html,
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
 * Employee invitation email data interface
 */
export interface EmployeeInvitationData {
  employeeName: string;
  employeeEmail: string;
  role: string;
  branchName: string;
  temporaryPassword?: string;
  loginUrl: string;
  invitedBy: string;
}

/**
 * Send employee invitation email
 *
 * @param data - Employee invitation data
 * @returns Email result
 */
export async function sendEmployeeInvitation(
  data: EmployeeInvitationData
): Promise<EmailResult> {
  try {
    
    const html = employeeInvitationEmailHtml(data);

    const result = await sendEmailWithRetry({
      to: data.employeeEmail,
      subject: `Welcome to Lorenzo Dry Cleaners - ${data.role}`,
      html,
      from: EMAIL_SENDERS.hr, // Use hr@ for employee invitations
    });

    // Log the attempt
    await logEmailAttempt('employee_invitation', data.employeeEmail, result, {
      role: data.role,
      branchName: data.branchName,
      invitedBy: data.invitedBy,
    });

    return result;
  } catch (error: any) {
    console.error('Employee invitation email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send employee invitation email',
    };
  }
}

/**
 * Payment reminder email data interface
 */
export interface PaymentReminderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paidAmount: number;
  amountDue: number;
  orderStatus: string;
  branchName: string;
  branchPhone: string;
  paymentUrl?: string;
  dueDate?: Date;
}

/**
 * Send payment reminder email
 *
 * @param data - Payment reminder data
 * @returns Email result
 */
export async function sendPaymentReminder(
  data: PaymentReminderData
): Promise<EmailResult> {
  try {
    
    const html = paymentReminderEmailHtml(data);

    const result = await sendEmailWithRetry({
      to: data.customerEmail,
      subject: `Payment Reminder - Order #${data.orderId}`,
      html,
      from: EMAIL_SENDERS.billing, // Use billing@ for payment reminders
    });

    // Log the attempt
    await logEmailAttempt('payment_reminder', data.customerEmail, result, {
      orderId: data.orderId,
      amountDue: data.amountDue,
    });

    return result;
  } catch (error: any) {
    console.error('Payment reminder email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send payment reminder email',
    };
  }
}

/**
 * Pickup request confirmation email data interface
 */
export interface PickupRequestData {
  customerName: string;
  customerEmail: string;
  pickupAddress: string;
  pickupDate?: Date;
  pickupTimeSlot?: string;
  contactPhone: string;
  specialInstructions?: string;
  requestId: string;
  branchName: string;
  branchPhone: string;
  trackingUrl?: string;
}

/**
 * Send pickup request confirmation email
 *
 * @param data - Pickup request data
 * @returns Email result
 */
export async function sendPickupRequestConfirmation(
  data: PickupRequestData
): Promise<EmailResult> {
  try {
    
    const html = pickupRequestEmailHtml(data);

    const result = await sendEmailWithRetry({
      to: data.customerEmail,
      subject: `Pickup Request Confirmed - ${data.requestId}`,
      html,
      from: EMAIL_SENDERS.delivery, // Use delivery@ for pickup requests
    });

    // Log the attempt
    await logEmailAttempt('pickup_request', data.customerEmail, result, {
      requestId: data.requestId,
      pickupDate: data.pickupDate?.toISOString(),
    });

    return result;
  } catch (error: any) {
    console.error('Pickup request email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send pickup request email',
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

    const html = passwordResetEmailHtml({
      email: testEmail,
      resetLink: 'https://example.com/reset',
      userName: 'Test User',
    });

    const result = await sendEmailWithRetry({
      to: testEmail,
      subject: 'Test Email - Lorenzo Dry Cleaners',
      html,
      from: EMAIL_SENDERS.noreply, // Use noreply@ for test emails
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
