/**
 * Resend Email Service Configuration
 *
 * This module configures the Resend client for sending transactional emails.
 * Resend is used for:
 * - Password reset emails
 * - Order confirmations
 * - Order status updates
 * - Receipt delivery
 *
 * @module lib/resend
 */

import { Resend } from 'resend';

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Lorenzo Dry Cleaners <noreply@lorenzo-dry-cleaners.com>';

// Validate configuration
if (!RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ RESEND_API_KEY is not set. Email functionality will not work.');
}

/**
 * Resend client instance
 * Initialized with API key from environment variables
 */
export const resend = new Resend(RESEND_API_KEY);

/**
 * Default sender email address
 * Used as the "from" address for all emails
 */
export const FROM_EMAIL = RESEND_FROM_EMAIL;

/**
 * Multiple sender email addresses for different scenarios
 * Resend allows using any email from your verified domain
 *
 * Usage:
 * - orders@: Order confirmations, receipts, status updates
 * - support@: Password resets, customer service
 * - billing@: Payment reminders, invoices
 * - delivery@: Pickup requests, delivery notifications
 * - hr@: Employee invitations
 * - noreply@: System/automated emails (fallback)
 */
export const EMAIL_SENDERS = {
  orders: process.env.RESEND_ORDERS_EMAIL || 'Lorenzo Orders <orders@lorenzo-dry-cleaners.com>',
  support: process.env.RESEND_SUPPORT_EMAIL || 'Lorenzo Support <support@lorenzo-dry-cleaners.com>',
  billing: process.env.RESEND_BILLING_EMAIL || 'Lorenzo Billing <billing@lorenzo-dry-cleaners.com>',
  delivery: process.env.RESEND_DELIVERY_EMAIL || 'Lorenzo Delivery <delivery@lorenzo-dry-cleaners.com>',
  hr: process.env.RESEND_HR_EMAIL || 'Lorenzo HR <hr@lorenzo-dry-cleaners.com>',
  noreply: RESEND_FROM_EMAIL, // Use the main config as noreply fallback
} as const;

/**
 * Type for email sender keys
 */
export type EmailSenderType = keyof typeof EMAIL_SENDERS;

/**
 * Email configuration constants
 */
export const EMAIL_CONFIG = {
  /**
   * Default sender email
   */
  from: RESEND_FROM_EMAIL,

  /**
   * Reply-to email (customer support)
   */
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@lorenzo-dry-cleaners.com',

  /**
   * Maximum retry attempts for failed emails
   */
  maxRetries: 3,

  /**
   * Retry delay in milliseconds (exponential backoff)
   */
  retryDelay: 1000, // 1 second base delay

  /**
   * Email timeout in milliseconds
   */
  timeout: 30000, // 30 seconds
};

/**
 * Email sending result interface
 */
export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  retryCount?: number;
}

/**
 * Check if Resend is properly configured
 */
export function isResendConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

/**
 * Get email domain from FROM_EMAIL
 */
export function getEmailDomain(): string {
  const match = RESEND_FROM_EMAIL.match(/@(.+)>?$/);
  return match ? match[1] : 'lorenzo-dry-cleaners.com';
}
