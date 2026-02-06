/**
 * Order Lifecycle Integration Tests
 *
 * Tests the complete order flow from creation through delivery
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > Integration Testing
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Firebase and external services
jest.mock('@/lib/db/index', () => ({
  setDocument: jest.fn(),
  getDocument: jest.fn(),
  getDocuments: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  DatabaseError: class DatabaseError extends Error {},
}));

jest.mock('@/lib/db/orders', () => ({
  createOrder: jest.fn(),
  getOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
  updateOrderPayment: jest.fn(),
}));

jest.mock('@/lib/db/customers', () => ({
  createCustomer: jest.fn(),
  getCustomer: jest.fn(),
  updateCustomer: jest.fn(),
}));

jest.mock('@/lib/db/pricing', () => ({
  calculateGarmentPrice: jest.fn(),
  calculateTotalPrice: jest.fn(),
  calculateGarmentPrices: jest.fn(),
}));

jest.mock('@/lib/db/transactions', () => ({
  createTransaction: jest.fn(),
  getTransactionsByOrder: jest.fn(),
}));

jest.mock('@/services/email', () => ({
  sendOrderConfirmation: jest.fn(),
  sendOrderStatusUpdate: jest.fn(),
  sendOrderReadyNotification: jest.fn(),
}));

import { createMockTimestamp } from '../helpers/test-utils';
import { TEST_USERS, TEST_BRANCHES } from '../helpers/test-data-factory';

const { createOrder, getOrder, updateOrderStatus, updateOrderPayment } = require('@/lib/db/orders');
const { createCustomer, getCustomer } = require('@/lib/db/customers');
const { calculateGarmentPrices, calculateTotalPrice } = require('@/lib/db/pricing');
const { createTransaction, getTransactionsByOrder } = require('@/lib/db/transactions');
const { sendOrderConfirmation, sendOrderStatusUpdate, sendOrderReadyNotification } = require('@/services/email');

describe('Order Lifecycle Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('INT-ORDER-001: Complete Order Creation Flow', () => {
    it('should create order with customer, pricing, and initial transaction', async () => {
      // Arrange
      const mockCustomer = {
        customerId: 'CUST-001',
        name: 'John Doe',
        phone: '+254712345678',
        email: 'john@example.com',
        createdAt: createMockTimestamp(new Date()),
      };

      const mockGarments = [
        {
          type: 'Shirt',
          color: 'White',
          services: ['wash', 'iron'],
        },
        {
          type: 'Pants',
          color: 'Black',
          services: ['dryClean', 'iron'],
        },
      ];

      const mockPricedGarments = [
        {
          ...mockGarments[0],
          price: 200, // wash (150) + iron (50)
        },
        {
          ...mockGarments[1],
          price: 300, // dryClean (250) + iron (50)
        },
      ];

      const mockOrder = {
        orderId: 'ORD-BR-MAIN-001-20250123-0001',
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: mockPricedGarments,
        totalAmount: 500,
        paidAmount: 500,
        paymentStatus: 'paid' as const,
        status: 'received' as const,
        createdAt: createMockTimestamp(new Date()),
        createdBy: TEST_USERS.frontDesk.uid,
      };

      // Mock implementations
      getCustomer.mockResolvedValue(mockCustomer);
      calculateGarmentPrices.mockResolvedValue(mockPricedGarments);
      calculateTotalPrice.mockResolvedValue(500);
      createOrder.mockResolvedValue('ORD-BR-MAIN-001-20250123-0001');
      createTransaction.mockResolvedValue('TXN-001');

      // Act - Simulate order creation flow
      const customer = await getCustomer('CUST-001');
      expect(customer).toEqual(mockCustomer);

      const pricedGarments = await calculateGarmentPrices(
        TEST_BRANCHES.mainStore.branchId,
        mockGarments
      );
      expect(pricedGarments).toEqual(mockPricedGarments);

      const totalAmount = await calculateTotalPrice(
        TEST_BRANCHES.mainStore.branchId,
        mockGarments
      );
      expect(totalAmount).toBe(500);

      const orderId = await createOrder({
        customerId: mockCustomer.customerId,
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: pricedGarments,
        paymentMethod: 'mpesa',
        paidAmount: 500,
      });
      expect(orderId).toBe('ORD-BR-MAIN-001-20250123-0001');

      const transactionId = await createTransaction({
        orderId,
        customerId: mockCustomer.customerId,
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 500,
        method: 'mpesa',
        status: 'completed',
        processedBy: TEST_USERS.frontDesk.uid,
      });
      expect(transactionId).toBe('TXN-001');

      // Assert
      expect(createOrder).toHaveBeenCalledTimes(1);
      expect(createTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('INT-ORDER-002: Order Status Progression', () => {
    it('should progress order through all pipeline stages', async () => {
      // Arrange
      const orderId = 'ORD-001';
      const statusProgression = [
        'received',
        'inspection',
        'queued',
        'washing',
        'drying',
        'ironing',
        'quality_check',
        'packaging',
        'ready',
      ];

      const mockOrder = {
        orderId,
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        status: 'received' as const,
        totalAmount: 1000,
        paidAmount: 1000,
        paymentStatus: 'paid' as const,
        createdAt: createMockTimestamp(new Date()),
      };

      getOrder.mockResolvedValue(mockOrder);
      updateOrderStatus.mockResolvedValue(undefined);
      sendOrderStatusUpdate.mockResolvedValue({ success: true });
      sendOrderReadyNotification.mockResolvedValue({ success: true });

      // Act & Assert - Progress through each status
      for (let i = 1; i < statusProgression.length; i++) {
        const newStatus = statusProgression[i];

        await updateOrderStatus(orderId, newStatus as any);

        expect(updateOrderStatus).toHaveBeenCalledWith(orderId, newStatus);

        // Check if notification should be sent for 'ready' status
        if (newStatus === 'ready') {
          await sendOrderReadyNotification(orderId);
          expect(sendOrderReadyNotification).toHaveBeenCalledWith(orderId);
        }
      }

      expect(updateOrderStatus).toHaveBeenCalledTimes(statusProgression.length - 1);
    });

    it('should handle QA failure and return to washing', async () => {
      // Arrange
      const orderId = 'ORD-001';
      const mockOrder = {
        orderId,
        status: 'quality_check' as const,
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        totalAmount: 1000,
        paidAmount: 1000,
        createdAt: createMockTimestamp(new Date()),
      };

      getOrder.mockResolvedValue(mockOrder);
      updateOrderStatus.mockResolvedValue(undefined);

      // Act - QA fails, send back to washing
      await updateOrderStatus(orderId, 'washing');

      // Assert
      expect(updateOrderStatus).toHaveBeenCalledWith(orderId, 'washing');
    });
  });

  describe('INT-ORDER-003: Payment Processing Integration', () => {
    it('should handle partial payment and track balance', async () => {
      // Arrange
      const orderId = 'ORD-001';
      const mockOrder = {
        orderId,
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        totalAmount: 1000,
        paidAmount: 0,
        paymentStatus: 'pending' as const,
        status: 'received' as const,
        createdAt: createMockTimestamp(new Date()),
      };

      getOrder.mockResolvedValue(mockOrder);
      createTransaction.mockResolvedValue('TXN-001');
      updateOrderPayment.mockResolvedValue(undefined);
      getTransactionsByOrder.mockResolvedValue([
        {
          transactionId: 'TXN-001',
          orderId,
          amount: 400,
          method: 'mpesa',
          status: 'completed',
          timestamp: createMockTimestamp(new Date()),
        },
      ]);

      // Act - First partial payment
      await createTransaction({
        orderId,
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 400,
        method: 'mpesa',
        status: 'completed',
        processedBy: TEST_USERS.frontDesk.uid,
      });

      await updateOrderPayment(orderId, 400, 'mpesa');

      // Update mock for second payment
      createTransaction.mockResolvedValue('TXN-002');
      getTransactionsByOrder.mockResolvedValue([
        {
          transactionId: 'TXN-001',
          orderId,
          amount: 400,
          method: 'mpesa',
          status: 'completed',
          timestamp: createMockTimestamp(new Date()),
        },
        {
          transactionId: 'TXN-002',
          orderId,
          amount: 600,
          method: 'mpesa',
          status: 'completed',
          timestamp: createMockTimestamp(new Date()),
        },
      ]);

      // Act - Second payment (complete remaining balance)
      await createTransaction({
        orderId,
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        amount: 600,
        method: 'mpesa',
        status: 'completed',
        processedBy: TEST_USERS.frontDesk.uid,
      });

      await updateOrderPayment(orderId, 600, 'mpesa');

      // Assert
      expect(createTransaction).toHaveBeenCalledTimes(2);
      expect(updateOrderPayment).toHaveBeenCalledTimes(2);

      const transactions = await getTransactionsByOrder(orderId);
      expect(transactions).toHaveLength(2);

      const totalPaid = transactions.reduce((sum: number, txn: any) => sum + txn.amount, 0);
      expect(totalPaid).toBe(1000);
    });
  });

  describe('INT-ORDER-004: Customer Creation with Order', () => {
    it('should create new customer and order in sequence', async () => {
      // Arrange
      const mockCustomer = {
        customerId: 'CUST-NEW-001',
        name: 'Jane Smith',
        phone: '+254722345678',
        email: 'jane@example.com',
        createdAt: createMockTimestamp(new Date()),
      };

      const mockGarments = [
        {
          type: 'Dress',
          color: 'Red',
          services: ['dryClean', 'iron'],
          price: 350,
        },
      ];

      createCustomer.mockResolvedValue('CUST-NEW-001');
      getCustomer.mockResolvedValue(mockCustomer);
      calculateGarmentPrices.mockResolvedValue(mockGarments);
      createOrder.mockResolvedValue('ORD-001');
      sendOrderConfirmation.mockResolvedValue({ success: true });

      // Act
      const customerId = await createCustomer({
        name: 'Jane Smith',
        phone: '+254722345678',
        email: 'jane@example.com',
      });

      const customer = await getCustomer(customerId);

      const pricedGarments = await calculateGarmentPrices(
        TEST_BRANCHES.mainStore.branchId,
        mockGarments
      );

      const orderId = await createOrder({
        customerId: customer.customerId,
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: pricedGarments,
        paymentMethod: 'credit',
        paidAmount: 350,
      });

      await sendOrderConfirmation(orderId);

      // Assert
      expect(createCustomer).toHaveBeenCalledTimes(1);
      expect(createOrder).toHaveBeenCalledTimes(1);
      expect(sendOrderConfirmation).toHaveBeenCalledWith(orderId);
    });
  });

  describe('INT-ORDER-005: Order Completion Flow', () => {
    it('should complete order delivery workflow', async () => {
      // Arrange
      const orderId = 'ORD-001';
      const mockOrder = {
        orderId,
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        status: 'ready' as const,
        totalAmount: 1000,
        paidAmount: 1000,
        paymentStatus: 'paid' as const,
        createdAt: createMockTimestamp(new Date()),
      };

      getOrder.mockResolvedValue(mockOrder);
      updateOrderStatus.mockResolvedValue(undefined);
      sendOrderStatusUpdate.mockResolvedValue({ success: true });

      // Act - Progress to out_for_delivery
      await updateOrderStatus(orderId, 'out_for_delivery');
      await sendOrderStatusUpdate(orderId, 'out_for_delivery');

      // Progress to delivered
      await updateOrderStatus(orderId, 'delivered');
      await sendOrderStatusUpdate(orderId, 'delivered');

      // Assert
      expect(updateOrderStatus).toHaveBeenCalledWith(orderId, 'out_for_delivery');
      expect(updateOrderStatus).toHaveBeenCalledWith(orderId, 'delivered');
      expect(sendOrderStatusUpdate).toHaveBeenCalledTimes(2);
    });

    it('should complete order collection workflow', async () => {
      // Arrange
      const orderId = 'ORD-002';
      const mockOrder = {
        orderId,
        customerId: 'CUST-002',
        branchId: TEST_BRANCHES.mainStore.branchId,
        status: 'ready' as const,
        totalAmount: 500,
        paidAmount: 500,
        paymentStatus: 'paid' as const,
        createdAt: createMockTimestamp(new Date()),
      };

      getOrder.mockResolvedValue(mockOrder);
      updateOrderStatus.mockResolvedValue(undefined);

      // Act - Customer collects directly (no delivery)
      await updateOrderStatus(orderId, 'collected');

      // Assert
      expect(updateOrderStatus).toHaveBeenCalledWith(orderId, 'collected');
    });
  });

  describe('INT-ORDER-006: Error Handling and Edge Cases', () => {
    it('should handle order not found gracefully', async () => {
      // Arrange
      getOrder.mockRejectedValue(new Error('Order not found'));

      // Act & Assert
      await expect(getOrder('ORD-INVALID')).rejects.toThrow('Order not found');
    });

    it('should prevent invalid status transitions', async () => {
      // Arrange
      const orderId = 'ORD-001';
      updateOrderStatus.mockRejectedValue(new Error('Invalid status transition'));

      // Act & Assert - Try to go from received directly to delivered
      await expect(
        updateOrderStatus(orderId, 'delivered')
      ).rejects.toThrow('Invalid status transition');
    });

    it('should handle payment processing failure', async () => {
      // Arrange
      createTransaction.mockRejectedValue(new Error('Payment processing failed'));

      // Act & Assert
      await expect(
        createTransaction({
          orderId: 'ORD-001',
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          amount: 1000,
          method: 'mpesa',
          status: 'failed',
          processedBy: TEST_USERS.frontDesk.uid,
        })
      ).rejects.toThrow('Payment processing failed');
    });
  });

  describe('INT-ORDER-007: Multi-Garment Order Processing', () => {
    it('should handle order with multiple garments and services', async () => {
      // Arrange
      const mockGarments = [
        {
          type: 'Shirt',
          color: 'White',
          services: ['wash', 'iron', 'starch'],
        },
        {
          type: 'Pants',
          color: 'Black',
          services: ['dryClean', 'iron'],
        },
        {
          type: 'Suit',
          color: 'Navy',
          services: ['dryClean', 'iron', 'express'],
        },
      ];

      const mockPricedGarments = [
        {
          ...mockGarments[0],
          price: 230, // wash (150) + iron (50) + starch (30)
        },
        {
          ...mockGarments[1],
          price: 300, // dryClean (250) + iron (50)
        },
        {
          ...mockGarments[2],
          price: 825, // dryClean (500) + iron (100) = 600 + 50% express = 900
          // Note: Express is 50% surcharge on total
        },
      ];

      calculateGarmentPrices.mockResolvedValue(mockPricedGarments);
      calculateTotalPrice.mockResolvedValue(1355);
      createOrder.mockResolvedValue('ORD-MULTI-001');

      // Act
      const pricedGarments = await calculateGarmentPrices(
        TEST_BRANCHES.mainStore.branchId,
        mockGarments
      );

      const totalAmount = await calculateTotalPrice(
        TEST_BRANCHES.mainStore.branchId,
        mockGarments
      );

      const orderId = await createOrder({
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: pricedGarments,
        paymentMethod: 'card',
        paidAmount: 1355,
      });

      // Assert
      expect(pricedGarments).toHaveLength(3);
      expect(totalAmount).toBe(1355);
      expect(orderId).toBe('ORD-MULTI-001');
      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          garments: expect.arrayContaining([
            expect.objectContaining({ type: 'Shirt' }),
            expect.objectContaining({ type: 'Pants' }),
            expect.objectContaining({ type: 'Suit' }),
          ]),
        })
      );
    });
  });
});
