/**
 * Payment Module Exports (Client-Safe)
 *
 * Central export point for client-safe payment functionality.
 *
 * For server-only functions (handlePaymentCallback, checkPaymentStatusServer),
 * import directly from './payment-service.server' in API routes.
 *
 * @module lib/payments
 */

// Payment service functions (client-safe)
export {
  initiateDigitalPayment,
  processCreditPayment,
  checkPaymentStatus,
  retryPayment,
  getAvailablePaymentMethods,
} from './payment-service';

// Payment types
export type {
  PaymentResult,
  DigitalPaymentData,
  CreditPaymentData,
  PaymentStatusResult,
  PaymentCallbackData,
} from './payment-types';
