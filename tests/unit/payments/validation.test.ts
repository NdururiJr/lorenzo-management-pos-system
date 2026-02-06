/**
 * Payment Validation Tests
 *
 * Tests for payment validation schemas
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > POS Testing > 2.3 Payment Processing
 */

import { describe, it, expect } from '@jest/globals';
import {
  createTransactionSchema,
  updateOrderPaymentSchema,
} from '@/lib/validations/orders';

describe('Payment Validation', () => {
  describe('EC-PAY-VAL-001: Transaction Schema Validation', () => {
    it('should validate M-Pesa transaction', () => {
      const validTransaction = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'mpesa' as const,
      };

      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should validate card transaction', () => {
      const validTransaction = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 5000,
        method: 'card' as const,
      };

      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should validate credit transaction', () => {
      const validTransaction = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'credit' as const,
      };

      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should reject invalid payment method', () => {
      const invalidTransaction = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'bitcoin',
      };

      const result = createTransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidTransaction = {
        orderId: 'ORD-001',
        amount: 1000,
      };

      const result = createTransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should accept optional Pesapal reference', () => {
      const validTransaction = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'mpesa' as const,
        pesapalRef: 'PESAPAL-123',
      };

      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });
  });

  describe('EC-PAY-VAL-002: Update Payment Schema Validation', () => {
    it('should validate M-Pesa payment update', () => {
      const validPayment = {
        amount: 1000,
        method: 'mpesa' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('should reject zero amount', () => {
      const invalidPayment = {
        amount: 0,
        method: 'mpesa' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject negative amount', () => {
      const invalidPayment = {
        amount: -100,
        method: 'mpesa' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject invalid payment method', () => {
      const invalidPayment = {
        amount: 1000,
        method: 'paypal',
      };

      const result = updateOrderPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('should reject missing amount', () => {
      const invalidPayment = {
        method: 'mpesa' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });

    it('should reject missing method', () => {
      const invalidPayment = {
        amount: 1000,
      };

      const result = updateOrderPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });
  });

  describe('EC-PAY-VAL-003: Payment Amount Edge Cases', () => {
    it('should accept minimum valid amount (1 KES)', () => {
      const validPayment = {
        amount: 1,
        method: 'credit' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('should accept large amounts', () => {
      const validPayment = {
        amount: 1000000,
        method: 'card' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('should accept decimal amounts', () => {
      const validPayment = {
        amount: 150.50,
        method: 'mpesa' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });
  });

  describe('EC-PAY-VAL-004: Payment Method Combinations', () => {
    it('should validate all supported payment methods', () => {
      const methods: Array<'mpesa' | 'card' | 'credit'> = [
        'mpesa',
        'card',
        'credit',
      ];

      methods.forEach((method) => {
        const payment = {
          amount: 1000,
          method,
        };

        const result = updateOrderPaymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      });
    });

    it('should reject unsupported payment methods', () => {
      const unsupportedMethods = [
        'paypal',
        'bitcoin',
        'bank_transfer',
        'check',
        'voucher',
      ];

      unsupportedMethods.forEach((method) => {
        const payment = {
          amount: 1000,
          method,
        };

        const result = updateOrderPaymentSchema.safeParse(payment);
        expect(result.success).toBe(false);
      });
    });
  });
});
