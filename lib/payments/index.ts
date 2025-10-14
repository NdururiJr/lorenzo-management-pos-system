/**
 * Payment Module Exports
 *
 * Central export point for all payment-related functionality.
 *
 * @module lib/payments
 */

// Payment service functions
export {
  processCashPayment,
  initiateDigitalPayment,
  processCreditPayment,
  handlePaymentCallback,
  checkPaymentStatus,
  retryPayment,
  getAvailablePaymentMethods,
} from './payment-service';

// Payment types
export type {
  PaymentResult,
  CashPaymentData,
  DigitalPaymentData,
  CreditPaymentData,
  PaymentStatusResult,
  PaymentCallbackData,
} from './payment-types';
