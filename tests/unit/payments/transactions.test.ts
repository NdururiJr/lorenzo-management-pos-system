/**
 * Transaction Database Tests
 *
 * Tests for transaction CRUD operations and queries
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > POS Testing > 2.3 Payment Processing
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Firestore operations with factory functions to prevent module loading
jest.mock('@/lib/db/index', () => ({
  setDocument: jest.fn(),
  getDocument: jest.fn(),
  getDocuments: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  DatabaseError: class DatabaseError extends Error {},
}));

jest.mock('@/lib/db/orders', () => ({
  updateOrderPayment: jest.fn(),
}));

import {
  generateTransactionId,
  createTransaction,
  getTransaction,
  updateTransactionStatus,
  getTransactionsByOrder,
  getTransactionsByCustomer,
  getTransactionsByStatus,
  getTransactionsByMethod,
  getPendingTransactions,
  getFailedTransactions,
  getTransactionByPesapalRef,
  getCustomerTransactionTotal,
  getTransactionTotals,
  getTodayTransactionSummary,
} from '@/lib/db/transactions';
import type { TransactionExtended } from '@/lib/db/schema';
import { createMockTimestamp } from '../../helpers/test-utils';
import { TEST_BRANCHES } from '../../helpers/test-data-factory';

const { setDocument, getDocument, getDocuments, updateDocument } = require('@/lib/db/index');
const { updateOrderPayment } = require('@/lib/db/orders');

describe('Transaction Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EC-TXN-001: Transaction ID Generation', () => {
    it('should generate transaction ID with correct format', () => {
      const txnId = generateTransactionId();

      expect(txnId).toMatch(/^TXN-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(txnId).toContain('TXN-');
    });

    it('should generate unique transaction IDs', () => {
      const ids = new Set<string>();

      // Generate 100 IDs
      for (let i = 0; i < 100; i++) {
        ids.add(generateTransactionId());
      }

      // All should be unique
      expect(ids.size).toBe(100);
    });

    it('should use uppercase for transaction ID', () => {
      const txnId = generateTransactionId();
      expect(txnId).toBe(txnId.toUpperCase());
    });
  });

  describe('EC-TXN-002: Create Transaction', () => {
    it('should create completed credit transaction', async () => {
      const transactionData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'credit' as const,
        status: 'completed' as const,
        paymentType: 'full' as const,
        processedBy: 'USER-001',
      };

      const result = await createTransaction(transactionData);

      expect(result).toMatch(/^TXN-/);
      expect(setDocument).toHaveBeenCalledWith(
        'transactions',
        result,
        expect.objectContaining({
          transactionId: result,
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          amount: 1000,
          method: 'credit',
          status: 'completed',
        })
      );
      expect(updateOrderPayment).toHaveBeenCalledWith('ORD-001', 1000, 'credit');
    });

    it('should create pending digital transaction with Pesapal ref', async () => {
      const transactionData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'mpesa' as const,
        status: 'pending' as const,
        paymentType: 'full' as const,
        pesapalRef: 'PESAPAL-001',
        processedBy: 'USER-001',
      };

      const result = await createTransaction(transactionData);

      expect(setDocument).toHaveBeenCalledWith(
        'transactions',
        result,
        expect.objectContaining({
          pesapalRef: 'PESAPAL-001',
          status: 'pending',
        })
      );
      expect(updateOrderPayment).not.toHaveBeenCalled(); // Only called for completed
    });

    it('should create transaction with metadata', async () => {
      const transactionData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'credit' as const,
        status: 'completed' as const,
        paymentType: 'full' as const,
        processedBy: 'USER-001',
        metadata: {
          gatewayResponse: 'Corporate account approval',
        },
      };

      const result = await createTransaction(transactionData);

      expect(setDocument).toHaveBeenCalledWith(
        'transactions',
        result,
        expect.objectContaining({
          metadata: {
            gatewayResponse: 'Corporate account approval',
          },
        })
      );
    });

    it('should not include undefined optional fields', async () => {
      const transactionData = {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'credit' as const,
        paymentType: 'full' as const,
        processedBy: 'USER-001',
      };

      await createTransaction(transactionData);

      const call = setDocument.mock.calls[0];
      const savedData = call[2];

      expect(savedData).not.toHaveProperty('pesapalRef');
      expect(savedData).not.toHaveProperty('metadata');
    });
  });

  describe('EC-TXN-003: Get Transaction', () => {
    it('should retrieve transaction by ID', async () => {
      const mockTransaction: TransactionExtended = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'credit',
        status: 'completed',
        paymentType: 'full',
        timestamp: createMockTimestamp(new Date()),
        processedBy: 'USER-001',
      };

      getDocument.mockResolvedValueOnce(mockTransaction);

      const result = await getTransaction('TXN-001');

      expect(result).toEqual(mockTransaction);
      expect(getDocument).toHaveBeenCalledWith('transactions', 'TXN-001');
    });
  });

  describe('EC-TXN-004: Update Transaction Status', () => {
    it('should update transaction status to completed', async () => {
      const mockTransaction: TransactionExtended = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'mpesa',
        status: 'pending',
        paymentType: 'full',
        timestamp: createMockTimestamp(new Date()),
        processedBy: 'USER-001',
      };

      getDocument.mockResolvedValueOnce(mockTransaction);

      await updateTransactionStatus('TXN-001', 'completed');

      expect(updateDocument).toHaveBeenCalledWith(
        'transactions',
        'TXN-001',
        expect.objectContaining({
          status: 'completed',
        })
      );
      expect(updateOrderPayment).toHaveBeenCalledWith('ORD-001', 1000, 'mpesa');
    });

    it('should update transaction status to failed', async () => {
      const mockTransaction: TransactionExtended = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'mpesa',
        status: 'pending',
        paymentType: 'full',
        timestamp: createMockTimestamp(new Date()),
        processedBy: 'USER-001',
      };

      getDocument.mockResolvedValueOnce(mockTransaction);

      await updateTransactionStatus('TXN-001', 'failed');

      expect(updateDocument).toHaveBeenCalledWith(
        'transactions',
        'TXN-001',
        expect.objectContaining({
          status: 'failed',
        })
      );
      expect(updateOrderPayment).not.toHaveBeenCalled(); // Not called for failed
    });

    it('should merge metadata when updating status', async () => {
      const mockTransaction: TransactionExtended = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'mpesa',
        status: 'pending',
        paymentType: 'full',
        timestamp: createMockTimestamp(new Date()),
        processedBy: 'USER-001',
        metadata: {
          gatewayResponse: 'Initiated at 2025-01-01T10:00:00Z',
        },
      };

      getDocument.mockResolvedValueOnce(mockTransaction);

      await updateTransactionStatus('TXN-001', 'completed', {
        gatewayResponse: 'Payment successful',
        mpesaTransactionCode: 'MPE123456',
      });

      expect(updateDocument).toHaveBeenCalledWith(
        'transactions',
        'TXN-001',
        expect.objectContaining({
          metadata: {
            gatewayResponse: 'Payment successful',
            mpesaTransactionCode: 'MPE123456',
          },
        })
      );
    });
  });

  describe('EC-TXN-005: Query Transactions', () => {
    it('should get transactions by order ID', async () => {
      const mockTransactions: TransactionExtended[] = [
        {
          transactionId: 'TXN-001',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 500,
          method: 'credit',
          status: 'completed',
          paymentType: 'partial',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
        {
          transactionId: 'TXN-002',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 500,
          method: 'mpesa',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
      ];

      getDocuments.mockResolvedValueOnce(mockTransactions);

      const result = await getTransactionsByOrder('ORD-001');

      expect(result).toHaveLength(2);
      expect(result[0].orderId).toBe('ORD-001');
      expect(result[1].orderId).toBe('ORD-001');
    });

    it('should get transactions by customer ID', async () => {
      const mockTransactions: TransactionExtended[] = [
        {
          transactionId: 'TXN-001',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 1000,
          method: 'credit',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
      ];

      getDocuments.mockResolvedValueOnce(mockTransactions);

      const result = await getTransactionsByCustomer('CUST-001');

      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe('CUST-001');
    });

    it('should get transactions by status', async () => {
      const mockTransactions: TransactionExtended[] = [
        {
          transactionId: 'TXN-001',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 1000,
          method: 'mpesa',
          status: 'pending',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
      ];

      getDocuments.mockResolvedValueOnce(mockTransactions);

      const result = await getTransactionsByStatus('pending');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });

    it('should get transactions by payment method', async () => {
      const mockTransactions: TransactionExtended[] = [
        {
          transactionId: 'TXN-001',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 1000,
          method: 'mpesa',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
      ];

      getDocuments.mockResolvedValueOnce(mockTransactions);

      const result = await getTransactionsByMethod('mpesa');

      expect(result).toHaveLength(1);
      expect(result[0].method).toBe('mpesa');
    });

    it('should get pending transactions', async () => {
      getDocuments.mockResolvedValueOnce([]);

      const result = await getPendingTransactions();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should get failed transactions', async () => {
      getDocuments.mockResolvedValueOnce([]);

      const result = await getFailedTransactions();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('EC-TXN-006: Get Transaction by Pesapal Reference', () => {
    it('should find transaction by Pesapal reference', async () => {
      const mockTransaction: TransactionExtended = {
        transactionId: 'TXN-001',
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 1000,
        method: 'mpesa',
        status: 'pending',
        paymentType: 'full',
        timestamp: createMockTimestamp(new Date()),
        pesapalRef: 'PESAPAL-001',
        processedBy: 'USER-001',
      };

      getDocuments.mockResolvedValueOnce([mockTransaction]);

      const result = await getTransactionByPesapalRef('PESAPAL-001');

      expect(result).toEqual(mockTransaction);
      expect(result?.pesapalRef).toBe('PESAPAL-001');
    });

    it('should return null when Pesapal reference not found', async () => {
      getDocuments.mockResolvedValueOnce([]);

      const result = await getTransactionByPesapalRef('PESAPAL-UNKNOWN');

      expect(result).toBeNull();
    });
  });

  describe('EC-TXN-007: Calculate Transaction Totals', () => {
    it('should calculate customer transaction total', async () => {
      const mockTransactions: TransactionExtended[] = [
        {
          transactionId: 'TXN-001',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 500,
          method: 'credit',
          status: 'completed',
          paymentType: 'partial',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
        {
          transactionId: 'TXN-002',
          orderId: 'ORD-002',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 800,
          method: 'mpesa',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
        {
          transactionId: 'TXN-003',
          orderId: 'ORD-003',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 200,
          method: 'credit',
          status: 'pending', // Should not be included
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
      ];

      getDocuments.mockResolvedValueOnce(mockTransactions);

      const total = await getCustomerTransactionTotal('CUST-001');

      expect(total).toBe(1300); // 500 + 800 (pending not included)
    });

    it('should calculate transaction totals by period', async () => {
      const mockTransactions: TransactionExtended[] = [
        {
          transactionId: 'TXN-001',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 500,
          method: 'credit',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
        {
          transactionId: 'TXN-002',
          orderId: 'ORD-002',
          customerId: 'CUST-002',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 300,
          method: 'mpesa',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
        {
          transactionId: 'TXN-003',
          orderId: 'ORD-003',
          customerId: 'CUST-003',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 200,
          method: 'card',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
      ];

      getDocuments.mockResolvedValueOnce(mockTransactions);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const totals = await getTransactionTotals(startDate, endDate);

      expect(totals.total).toBe(1000);
      expect(totals.count).toBe(3);
      expect(totals.byMethod.credit).toBe(500);
      expect(totals.byMethod.mpesa).toBe(300);
      expect(totals.byMethod.card).toBe(200);
    });

    it('should get today transaction summary', async () => {
      const mockTransactions: TransactionExtended[] = [
        {
          transactionId: 'TXN-001',
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 1000,
          method: 'credit',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
        {
          transactionId: 'TXN-002',
          orderId: 'ORD-002',
          customerId: 'CUST-002',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 500,
          method: 'mpesa',
          status: 'completed',
          paymentType: 'full',
          timestamp: createMockTimestamp(new Date()),
          processedBy: 'USER-001',
        },
      ];

      getDocuments.mockResolvedValueOnce(mockTransactions);

      const summary = await getTodayTransactionSummary();

      expect(summary.total).toBe(1500);
      expect(summary.count).toBe(2);
      expect(summary.credit).toBe(1000);
      expect(summary.mpesa).toBe(500);
      expect(summary.card).toBe(0);
    });
  });
});
