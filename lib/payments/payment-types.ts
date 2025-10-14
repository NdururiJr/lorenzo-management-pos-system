/**
 * Payment Type Definitions
 *
 * This file contains TypeScript types for payment operations.
 *
 * @module lib/payments/payment-types
 */

import type { PaymentMethod, TransactionStatus } from '../db/schema';

/**
 * Payment processing result
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
  message?: string;
}

/**
 * Cash payment data
 */
export interface CashPaymentData {
  orderId: string;
  customerId: string;
  amount: number;
  amountTendered?: number;
  change?: number;
  userId: string;
}

/**
 * Digital payment data (M-Pesa/Card via Pesapal)
 */
export interface DigitalPaymentData {
  orderId: string;
  customerId: string;
  amount: number;
  customerPhone: string;
  customerEmail: string;
  method: 'mpesa' | 'card';
  userId: string;
}

/**
 * Credit payment data
 */
export interface CreditPaymentData {
  orderId: string;
  customerId: string;
  amount: number;
  userId: string;
  creditNote?: string;
}

/**
 * Payment status check result
 */
export interface PaymentStatusResult {
  transactionId: string;
  orderId: string;
  status: TransactionStatus;
  amount: number;
  method: PaymentMethod;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Payment callback data from Pesapal
 */
export interface PaymentCallbackData {
  orderTrackingId: string;
  merchantReference: string;
  status: string;
  statusDescription: string;
  amount?: number;
  paymentMethod?: string;
  confirmationCode?: string;
  paymentAccount?: string;
}
