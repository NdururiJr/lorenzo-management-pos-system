/**
 * Payment Service Tests
 *
 * Tests for payment processing service functions
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > POS Testing > 2.3 Payment Processing
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies with factory functions to prevent module loading
jest.mock('@/lib/db/transactions', () => ({
  createTransaction: jest.fn(),
  getTransaction: jest.fn(),
  updateTransactionStatus: jest.fn(),
  getTransactionByPesapalRef: jest.fn(),
}));

jest.mock('@/lib/db/orders', () => ({
  getOrder: jest.fn(),
  updateOrderPayment: jest.fn(),
}));

jest.mock('@/lib/db/customers', () => ({
  getCustomer: jest.fn(),
}));

jest.mock('@/services/pesapal', () => ({
  submitOrderRequest: jest.fn(),
  getTransactionStatus: jest.fn(),
  mapPesapalStatus: jest.fn(),
}));

import {
  initiateDigitalPayment,
  processCreditPayment,
  handlePaymentCallback,
  checkPaymentStatus,
  retryPayment,
  getAvailablePaymentMethods,
} from '@/lib/payments/payment-service';
import type {
  DigitalPaymentData,
  CreditPaymentData,
  PaymentCallbackData,
} from '@/lib/payments/payment-types';
import { createTestOrder, TEST_USERS, TEST_BRANCHES } from '../../helpers/test-data-factory';
import { createMockTimestamp } from '../../helpers/test-utils';

const { createTransaction, getTransaction, updateTransactionStatus, getTransactionByPesapalRef } = require('@/lib/db/transactions');
const { getOrder } = require('@/lib/db/orders');
const { getCustomer } = require('@/lib/db/customers');
const { submitOrderRequest, getTransactionStatus, mapPesapalStatus } = require('@/services/pesapal');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EC-PAY-002: Digital Payment Initiation (M-Pesa/Card)', () => {
    it('should initiate M-Pesa payment successfully', async () => {
      const mockOrder: any = {
        ...createTestOrder({
          orderId: 'ORD-001',
          totalAmount: 1000,
          paidAmount: 0,
          branchId: TEST_BRANCHES.mainStore.branchId,
        }),
      };

      const paymentData: DigitalPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        customerPhone: '+254712345678',
        customerEmail: 'customer@example.com',
        method: 'mpesa',
        userId: TEST_USERS.frontDesk.uid,
      };

      getOrder.mockResolvedValueOnce(mockOrder);
      submitOrderRequest.mockResolvedValueOnce({
        success: true,
        orderTrackingId: 'PESAPAL-001',
        redirectUrl: 'https://pesapal.com/payment/PESAPAL-001',
      });
      createTransaction.mockResolvedValueOnce('TXN-001');

      const result = await initiateDigitalPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN-001');
      expect(result.redirectUrl).toBe('https://pesapal.com/payment/PESAPAL-001');
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ORD-001',
          amount: 1000,
          method: 'mpesa',
          status: 'pending',
          pesapalRef: 'PESAPAL-001',
        })
      );
    });

    it('should initiate card payment successfully', async () => {
      const mockOrder: any = {
        ...createTestOrder({
          orderId: 'ORD-001',
          totalAmount: 5000,
          paidAmount: 0,
          branchId: TEST_BRANCHES.mainStore.branchId,
        }),
      };

      const paymentData: DigitalPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 5000,
        customerPhone: '+254712345678',
        customerEmail: 'customer@example.com',
        method: 'card',
        userId: TEST_USERS.frontDesk.uid,
      };

      getOrder.mockResolvedValueOnce(mockOrder);
      submitOrderRequest.mockResolvedValueOnce({
        success: true,
        orderTrackingId: 'PESAPAL-002',
        redirectUrl: 'https://pesapal.com/payment/PESAPAL-002',
      });
      createTransaction.mockResolvedValueOnce('TXN-002');

      const result = await initiateDigitalPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN-002');
    });

    it('should reject invalid payment amount', async () => {
      const paymentData: DigitalPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 0,
        customerPhone: '+254712345678',
        customerEmail: 'customer@example.com',
        method: 'mpesa',
        userId: TEST_USERS.frontDesk.uid,
      };

      const result = await initiateDigitalPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid payment amount');
    });

    it('should reject payment exceeding balance due', async () => {
      const mockOrder: any = {
        ...createTestOrder({
          orderId: 'ORD-001',
          totalAmount: 1000,
          paidAmount: 800,
          branchId: TEST_BRANCHES.mainStore.branchId,
        }),
      };

      const paymentData: DigitalPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 300,
        customerPhone: '+254712345678',
        customerEmail: 'customer@example.com',
        method: 'mpesa',
        userId: TEST_USERS.frontDesk.uid,
      };

      getOrder.mockResolvedValueOnce(mockOrder);

      const result = await initiateDigitalPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds balance due');
    });

    it('should handle Pesapal API failure gracefully', async () => {
      const mockOrder: any = {
        ...createTestOrder({
          orderId: 'ORD-001',
          totalAmount: 1000,
          paidAmount: 0,
          branchId: TEST_BRANCHES.mainStore.branchId,
        }),
      };

      const paymentData: DigitalPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        customerPhone: '+254712345678',
        customerEmail: 'customer@example.com',
        method: 'mpesa',
        userId: TEST_USERS.frontDesk.uid,
      };

      getOrder.mockResolvedValueOnce(mockOrder);
      submitOrderRequest.mockResolvedValueOnce({
        success: false,
        error: 'Pesapal API error',
      });

      const result = await initiateDigitalPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Pesapal API error');
    });
  });

  describe('EC-PAY-003: Credit Payment Processing', () => {
    it('should process credit payment successfully', async () => {
      const mockOrder: any = {
        ...createTestOrder({
          orderId: 'ORD-001',
          totalAmount: 1000,
          paidAmount: 0,
          branchId: TEST_BRANCHES.mainStore.branchId,
        }),
      };

      const paymentData: CreditPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        userId: TEST_USERS.frontDesk.uid,
        creditNote: 'Corporate account',
      };

      getOrder.mockResolvedValueOnce(mockOrder);
      createTransaction.mockResolvedValueOnce('TXN-001');

      const result = await processCreditPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN-001');
      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ORD-001',
          amount: 1000,
          method: 'credit',
          status: 'completed',
        })
      );
    });

    it('should reject invalid payment amount', async () => {
      const paymentData: CreditPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: -100,
        userId: TEST_USERS.frontDesk.uid,
      };

      const result = await processCreditPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid payment amount');
    });

    it('should reject payment exceeding balance due', async () => {
      const mockOrder: any = {
        ...createTestOrder({
          orderId: 'ORD-001',
          totalAmount: 1000,
          paidAmount: 500,
          branchId: TEST_BRANCHES.mainStore.branchId,
        }),
      };

      const paymentData: CreditPaymentData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 600,
        userId: TEST_USERS.frontDesk.uid,
      };

      getOrder.mockResolvedValueOnce(mockOrder);

      const result = await processCreditPayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds balance due');
    });
  });

  describe('EC-PAY-004: Payment Callback Handling', () => {
    it('should process successful payment callback', async () => {
      const mockTransaction: any = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'mpesa' as const,
        status: 'pending' as const,
        timestamp: createMockTimestamp(new Date()),
      };

      const callbackData: PaymentCallbackData = {
        orderTrackingId: 'PESAPAL-001',
        merchantReference: 'ORD-001',
        status: 'COMPLETED',
        statusDescription: 'Payment successful',
        confirmationCode: 'MPE123456',
      };

      getTransactionByPesapalRef.mockResolvedValueOnce(mockTransaction);
      getTransactionStatus.mockResolvedValueOnce({
        status: 'COMPLETED',
        statusDescription: 'Payment successful',
        confirmationCode: 'MPE123456',
      });
      mapPesapalStatus.mockReturnValueOnce('completed');

      await handlePaymentCallback(callbackData);

      expect(updateTransactionStatus).toHaveBeenCalledWith(
        'TXN-001',
        'completed',
        expect.objectContaining({
          gatewayResponse: 'Payment successful',
          mpesaTransactionCode: 'MPE123456',
        })
      );
    });

    it('should handle failed payment callback', async () => {
      const mockTransaction: any = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'mpesa' as const,
        status: 'pending' as const,
        timestamp: createMockTimestamp(new Date()),
      };

      const callbackData: PaymentCallbackData = {
        orderTrackingId: 'PESAPAL-001',
        merchantReference: 'ORD-001',
        status: 'FAILED',
        statusDescription: 'Insufficient funds',
      };

      getTransactionByPesapalRef.mockResolvedValueOnce(mockTransaction);
      getTransactionStatus.mockResolvedValueOnce({
        status: 'FAILED',
        statusDescription: 'Insufficient funds',
      });
      mapPesapalStatus.mockReturnValueOnce('failed');

      await handlePaymentCallback(callbackData);

      expect(updateTransactionStatus).toHaveBeenCalledWith(
        'TXN-001',
        'failed',
        expect.any(Object)
      );
    });

    it('should handle callback for non-existent transaction', async () => {
      const callbackData: PaymentCallbackData = {
        orderTrackingId: 'PESAPAL-UNKNOWN',
        merchantReference: 'ORD-999',
        status: 'COMPLETED',
        statusDescription: 'Payment successful',
      };

      getTransactionByPesapalRef.mockResolvedValueOnce(null);

      // Should not throw error
      await expect(handlePaymentCallback(callbackData)).resolves.not.toThrow();
      expect(updateTransactionStatus).not.toHaveBeenCalled();
    });
  });

  describe('EC-PAY-005: Payment Status Check', () => {
    it('should check payment status from database', async () => {
      const mockTransaction: any = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'credit' as const,
        status: 'completed' as const,
        timestamp: createMockTimestamp(new Date()),
      };

      getTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await checkPaymentStatus('TXN-001', false);

      expect(result).toMatchObject({
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        status: 'completed',
        amount: 1000,
        method: 'credit',
      });
    });

    it('should check payment status from Pesapal', async () => {
      const mockTransaction: any = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'mpesa' as const,
        status: 'pending' as const,
        pesapalRef: 'PESAPAL-001',
        timestamp: createMockTimestamp(new Date()),
      };

      getTransaction.mockResolvedValueOnce(mockTransaction);
      getTransactionStatus.mockResolvedValueOnce({
        status: 'COMPLETED',
        statusDescription: 'Payment successful',
        confirmationCode: 'MPE123456',
      });
      mapPesapalStatus.mockReturnValueOnce('completed');

      const result = await checkPaymentStatus('TXN-001', true);

      expect(result).toMatchObject({
        transactionId: 'TXN-001',
        status: 'completed',
        amount: 1000,
      });
      expect(updateTransactionStatus).toHaveBeenCalled();
    });

    it('should return null for non-existent transaction', async () => {
      getTransaction.mockRejectedValueOnce(new Error('Transaction not found'));

      const result = await checkPaymentStatus('TXN-UNKNOWN', false);

      expect(result).toBeNull();
    });
  });

  describe('EC-PAY-006: Payment Retry', () => {
    it('should retry failed digital payment', async () => {
      const mockTransaction: any = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'mpesa' as const,
        status: 'failed' as const,
        processedBy: TEST_USERS.frontDesk.uid,
        timestamp: createMockTimestamp(new Date()),
      };

      const mockCustomer = {
        customerId: 'CUST-001',
        name: 'John Doe',
        phone: '+254712345678',
        email: 'john@example.com',
      };

      const mockOrder: any = {
        ...createTestOrder({
          orderId: 'ORD-001',
          totalAmount: 1000,
          paidAmount: 0,
          branchId: TEST_BRANCHES.mainStore.branchId,
        }),
      };

      getTransaction.mockResolvedValueOnce(mockTransaction);
      getCustomer.mockResolvedValueOnce(mockCustomer);
      getOrder.mockResolvedValueOnce(mockOrder);
      submitOrderRequest.mockResolvedValueOnce({
        success: true,
        orderTrackingId: 'PESAPAL-002',
        redirectUrl: 'https://pesapal.com/payment/PESAPAL-002',
      });
      createTransaction.mockResolvedValueOnce('TXN-002');

      const result = await retryPayment('TXN-001');

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN-002');
    });

    it('should reject retry of completed transaction', async () => {
      const mockTransaction: any = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 1000,
        method: 'mpesa' as const,
        status: 'completed' as const,
        processedBy: TEST_USERS.frontDesk.uid,
        timestamp: createMockTimestamp(new Date()),
      };

      getTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await retryPayment('TXN-001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Can only retry failed transactions');
    });

    it('should reject retry for non-existent transaction', async () => {
      getTransaction.mockRejectedValueOnce(new Error('Transaction not found'));

      const result = await retryPayment('TXN-UNKNOWN');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('EC-PAY-007: Available Payment Methods', () => {
    it('should return all methods for normal order amount', () => {
      const methods = getAvailablePaymentMethods(1000);

      expect(methods.mpesa).toBe(true);
      expect(methods.card).toBe(true);
      expect(methods.credit).toBe(true);
    });

    it('should disable M-Pesa for amount below minimum (10 KES)', () => {
      const methods = getAvailablePaymentMethods(5);

      expect(methods.mpesa).toBe(false);
      expect(methods.card).toBe(false);
      expect(methods.credit).toBe(true);
    });

    it('should disable M-Pesa for amount above maximum (500,000 KES)', () => {
      const methods = getAvailablePaymentMethods(600000);

      expect(methods.mpesa).toBe(false);
      expect(methods.card).toBe(true);
      expect(methods.credit).toBe(true);
    });

    it('should allow M-Pesa for amount at minimum limit (10 KES)', () => {
      const methods = getAvailablePaymentMethods(10);

      expect(methods.mpesa).toBe(true);
      expect(methods.card).toBe(true);
    });

    it('should allow M-Pesa for amount at maximum limit (500,000 KES)', () => {
      const methods = getAvailablePaymentMethods(500000);

      expect(methods.mpesa).toBe(true);
      expect(methods.card).toBe(true);
    });

    it('should always allow credit regardless of amount', () => {
      const methods1 = getAvailablePaymentMethods(1);
      const methods2 = getAvailablePaymentMethods(1000000);

      expect(methods1.credit).toBe(true);
      expect(methods2.credit).toBe(true);
    });
  });
});
