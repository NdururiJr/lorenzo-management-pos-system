/**
 * Order Validation Tests
 *
 * Tests for order and customer validation schemas
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > POS Testing > 2.1 Order Creation
 */

import { describe, it, expect } from '@jest/globals';
import {
  garmentSchema,
  createOrderSchema,
  createCustomerSchema,
  updateOrderStatusSchema,
  updateOrderPaymentSchema,
  calculatePriceSchema,
  normalizeKenyaPhone,
} from '@/lib/validations/orders';
import { TEST_BRANCHES } from '../../helpers/test-data-factory';

describe('Order Validation', () => {
  describe('Phone Number Normalization', () => {
    it('should normalize +254 format (already correct)', () => {
      expect(normalizeKenyaPhone('+254712345678')).toBe('+254712345678');
    });

    it('should normalize 254 format (add +)', () => {
      expect(normalizeKenyaPhone('254712345678')).toBe('+254712345678');
    });

    it('should normalize 07 format (replace with +254)', () => {
      expect(normalizeKenyaPhone('0712345678')).toBe('+254712345678');
    });

    it('should normalize 01 format (replace with +254)', () => {
      expect(normalizeKenyaPhone('0112345678')).toBe('+254112345678');
    });

    it('should remove spaces and dashes', () => {
      expect(normalizeKenyaPhone('+254 712 345 678')).toBe('+254712345678');
      expect(normalizeKenyaPhone('0712-345-678')).toBe('+254712345678');
    });
  });

  describe('Garment Schema Validation', () => {
    it('should validate correct garment data', () => {
      const validGarment = {
        type: 'Shirt',
        color: 'White',
        brand: 'Nike',
        services: ['wash', 'iron'],
        specialInstructions: 'Handle with care',
      };

      const result = garmentSchema.safeParse(validGarment);
      expect(result.success).toBe(true);
    });

    it('should reject garment without type', () => {
      const invalidGarment = {
        type: '',
        color: 'White',
        services: ['wash'],
      };

      const result = garmentSchema.safeParse(invalidGarment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Garment type is required');
      }
    });

    it('should reject garment without color', () => {
      const invalidGarment = {
        type: 'Shirt',
        color: '',
        services: ['wash'],
      };

      const result = garmentSchema.safeParse(invalidGarment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Color is required');
      }
    });

    it('should reject garment without services', () => {
      const invalidGarment = {
        type: 'Shirt',
        color: 'White',
        services: [],
      };

      const result = garmentSchema.safeParse(invalidGarment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one service');
      }
    });

    it('should accept garment with optional fields omitted', () => {
      const minimalGarment = {
        type: 'Shirt',
        color: 'White',
        services: ['wash'],
      };

      const result = garmentSchema.safeParse(minimalGarment);
      expect(result.success).toBe(true);
    });
  });

  describe('Create Order Schema Validation', () => {
    it('should validate correct order data', () => {
      const validOrder = {
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: [
          {
            type: 'Shirt',
            color: 'White',
            services: ['wash', 'iron'],
          },
        ],
        paymentMethod: 'cash' as const,
        paidAmount: 500,
      };

      const result = createOrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it('should reject order without customer ID', () => {
      const invalidOrder = {
        customerId: '',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: [
          {
            type: 'Shirt',
            color: 'White',
            services: ['wash'],
          },
        ],
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Customer is required');
      }
    });

    it('should reject order without branch ID', () => {
      const invalidOrder = {
        customerId: 'CUST-001',
        branchId: '',
        garments: [
          {
            type: 'Shirt',
            color: 'White',
            services: ['wash'],
          },
        ],
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Branch is required');
      }
    });

    it('should reject order without garments', () => {
      const invalidOrder = {
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: [],
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one garment');
      }
    });

    it('should reject order with more than 50 garments', () => {
      const invalidOrder = {
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: Array(51).fill({
          type: 'Shirt',
          color: 'White',
          services: ['wash'],
        }),
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximum 50 garments');
      }
    });

    it('should reject negative paid amount', () => {
      const invalidOrder = {
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: [
          {
            type: 'Shirt',
            color: 'White',
            services: ['wash'],
          },
        ],
        paidAmount: -100,
      };

      const result = createOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });

    it('should default paidAmount to 0 if not provided', () => {
      const validOrder = {
        customerId: 'CUST-001',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: [
          {
            type: 'Shirt',
            color: 'White',
            services: ['wash'],
          },
        ],
      };

      const result = createOrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paidAmount).toBe(0);
      }
    });

    it('should validate all payment methods', () => {
      const paymentMethods: Array<'cash' | 'mpesa' | 'card' | 'credit'> = [
        'cash',
        'mpesa',
        'card',
        'credit',
      ];

      paymentMethods.forEach((method) => {
        const order = {
          customerId: 'CUST-001',
          branchId: TEST_BRANCHES.mainStore.branchId,
          garments: [
            {
              type: 'Shirt',
              color: 'White',
              services: ['wash'],
            },
          ],
          paymentMethod: method,
        };

        const result = createOrderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Create Customer Schema Validation', () => {
    it('should validate correct customer data', () => {
      const validCustomer = {
        name: 'John Doe',
        phone: '+254712345678',
        email: 'john@example.com',
        addresses: [
          {
            label: 'Home',
            address: 'Argwings Kodhek Road, Kilimani',
            coordinates: {
              lat: -1.2921,
              lng: 36.7872,
            },
          },
        ],
        preferences: {
          notifications: true,
          language: 'en' as const,
        },
      };

      const result = createCustomerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it('should reject customer with name too short', () => {
      const invalidCustomer = {
        name: 'J',
        phone: '+254712345678',
      };

      const result = createCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject invalid phone number', () => {
      const invalidCustomer = {
        name: 'John Doe',
        phone: '1234567890',
      };

      const result = createCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid Kenya phone');
      }
    });

    it('should normalize phone number during validation', () => {
      const customer = {
        name: 'John Doe',
        phone: '0712345678',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phone).toBe('+254712345678');
      }
    });

    it('should accept empty string for email', () => {
      const customer = {
        name: 'John Doe',
        phone: '+254712345678',
        email: '',
      };

      const result = createCustomerSchema.safeParse(customer);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidCustomer = {
        name: 'John Doe',
        phone: '+254712345678',
        email: 'invalid-email',
      };

      const result = createCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should validate coordinate ranges', () => {
      const invalidCustomer = {
        name: 'John Doe',
        phone: '+254712345678',
        addresses: [
          {
            label: 'Home',
            address: 'Test Address',
            coordinates: {
              lat: 91, // Invalid: > 90
              lng: 36.7872,
            },
          },
        ],
      };

      const result = createCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Order Status Schema Validation', () => {
    it('should validate all valid order statuses', () => {
      const validStatuses = [
        'received',
        'queued',
        'washing',
        'drying',
        'ironing',
        'quality_check',
        'packaging',
        'ready',
        'out_for_delivery',
        'delivered',
        'collected',
      ];

      validStatuses.forEach((status) => {
        const result = updateOrderStatusSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid order status', () => {
      const invalidStatus = { status: 'invalid_status' };

      const result = updateOrderStatusSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Order Payment Schema Validation', () => {
    it('should validate correct payment data', () => {
      const validPayment = {
        amount: 500,
        method: 'cash' as const,
      };

      const result = updateOrderPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('should reject zero or negative amount', () => {
      const invalidPayments = [
        { amount: 0, method: 'cash' },
        { amount: -100, method: 'cash' },
      ];

      invalidPayments.forEach((payment) => {
        const result = updateOrderPaymentSchema.safeParse(payment);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('positive');
        }
      });
    });

    it('should validate all payment methods', () => {
      const methods: Array<'cash' | 'mpesa' | 'card' | 'credit'> = [
        'cash',
        'mpesa',
        'card',
        'credit',
      ];

      methods.forEach((method) => {
        const payment = {
          amount: 500,
          method,
        };

        const result = updateOrderPaymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Calculate Price Schema Validation', () => {
    it('should validate correct price calculation data', () => {
      const validData = {
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: [
          {
            type: 'Shirt',
            services: ['wash', 'iron'],
          },
          {
            type: 'Pants',
            services: ['dryClean'],
          },
        ],
      };

      const result = calculatePriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty branch ID', () => {
      const invalidData = {
        branchId: '',
        garments: [
          {
            type: 'Shirt',
            services: ['wash'],
          },
        ],
      };

      const result = calculatePriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Branch ID is required');
      }
    });

    it('should reject garment without services', () => {
      const invalidData = {
        branchId: TEST_BRANCHES.mainStore.branchId,
        garments: [
          {
            type: 'Shirt',
            services: [],
          },
        ],
      };

      const result = calculatePriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
