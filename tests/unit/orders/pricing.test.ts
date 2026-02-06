/**
 * Pricing Calculation Tests
 *
 * Tests for garment pricing calculations
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > POS Testing > 2.2 Pricing System
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  generatePricingId,
  calculateGarmentPrice,
  calculateTotalPrice,
} from '@/lib/db/pricing';
import { mockFirestore, resetAllMocks } from '../../helpers/mock-integrations';
import { TEST_BRANCHES } from '../../helpers/test-data-factory';

// Mock Firestore operations
jest.mock('@/lib/db/index', () => ({
  getDocument: jest.fn(),
  getDocuments: jest.fn(),
  setDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  DatabaseError: class DatabaseError extends Error {},
}));

const { getDocument } = require('@/lib/db/index');

describe('Pricing Calculations', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('Pricing ID Generation', () => {
    it('should generate correct pricing ID format', () => {
      const branchId = 'BR-MAIN-001';
      const garmentType = 'Shirt';

      const pricingId = generatePricingId(branchId, garmentType);
      expect(pricingId).toBe('PRICE-BR-MAIN-001-SHIRT');
    });

    it('should handle multi-word garment types', () => {
      const branchId = 'BR-MAIN-001';
      const garmentType = 'Evening Dress';

      const pricingId = generatePricingId(branchId, garmentType);
      expect(pricingId).toBe('PRICE-BR-MAIN-001-EVENING-DRESS');
    });

    it('should convert to uppercase', () => {
      const branchId = 'BR-MAIN-001';
      const garmentType = 'casual shirt';

      const pricingId = generatePricingId(branchId, garmentType);
      expect(pricingId).toBe('PRICE-BR-MAIN-001-CASUAL-SHIRT');
    });
  });

  describe('Single Garment Price Calculation', () => {
    it('should calculate price for wash service', async () => {
      const mockPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(mockPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Shirt',
        ['wash']
      );

      expect(price).toBe(150);
    });

    it('should calculate price for multiple services', async () => {
      const mockPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(mockPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Shirt',
        ['wash', 'iron', 'starch']
      );

      expect(price).toBe(230); // 150 + 50 + 30
    });

    it('should not apply express surcharge (express is FREE)', async () => {
      const mockPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0, // Express is FREE
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(mockPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Shirt',
        ['wash', 'express']
      );

      // Express is FREE, so price is just wash = 150
      expect(price).toBe(150);
    });

    it('should not apply express surcharge on total (express is FREE)', async () => {
      const mockPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0, // Express is FREE
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(mockPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Shirt',
        ['wash', 'iron', 'express']
      );

      // Express is FREE, so price is wash + iron = 150 + 50 = 200
      expect(price).toBe(200);
    });

    it('should handle dryClean service (case insensitive)', async () => {
      const mockPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SUIT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Suit',
        services: {
          wash: 300,
          dryClean: 500,
          iron: 100,
          starch: 50,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(mockPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Suit',
        ['dryclean']
      );

      expect(price).toBe(500);
    });

    it('should handle "dry clean" with space', async () => {
      const mockPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SUIT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Suit',
        services: {
          wash: 300,
          dryClean: 500,
          iron: 100,
          starch: 50,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(mockPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Suit',
        ['dry clean']
      );

      expect(price).toBe(500);
    });

    it('should round final price', async () => {
      const mockPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 33, // 33% surcharge for odd number
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(mockPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Shirt',
        ['wash', 'express']
      );

      // 150 + 33% of 150 = 150 + 49.5 = 199.5 → 200 (rounded)
      expect(price).toBe(200);
    });

    it('should throw error for missing pricing', async () => {
      getDocument.mockRejectedValueOnce(new Error('Not found'));

      await expect(
        calculateGarmentPrice(
          TEST_BRANCHES.mainStore.branchId,
          'NonExistentGarment',
          ['wash']
        )
      ).rejects.toThrow();
    });
  });

  describe('Multiple Garments Price Calculation', () => {
    it('should calculate total for multiple garments', async () => {
      const shirtPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const pantsPricing = {
        pricingId: 'PRICE-BR-MAIN-001-PANTS',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Pants',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument
        .mockResolvedValueOnce(shirtPricing)
        .mockResolvedValueOnce(pantsPricing);

      const total = await calculateTotalPrice(TEST_BRANCHES.mainStore.branchId, [
        { type: 'Shirt', services: ['wash', 'iron'] },
        { type: 'Pants', services: ['dryClean'] },
      ]);

      // Shirt: 150 + 50 = 200
      // Pants: 250
      // Total: 450
      expect(total).toBe(450);
    });

    it('should handle express service across multiple garments', async () => {
      const shirtPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument
        .mockResolvedValueOnce(shirtPricing)
        .mockResolvedValueOnce(shirtPricing);

      const total = await calculateTotalPrice(TEST_BRANCHES.mainStore.branchId, [
        { type: 'Shirt', services: ['wash', 'express'] },
        { type: 'Shirt', services: ['dryClean', 'express'] },
      ]);

      // Shirt 1: 150 + 50% = 225
      // Shirt 2: 250 + 50% = 375
      // Total: 600
      expect(total).toBe(600);
    });

    it('should return 0 for empty garments array', async () => {
      const total = await calculateTotalPrice(
        TEST_BRANCHES.mainStore.branchId,
        []
      );

      expect(total).toBe(0);
    });
  });

  describe('Standard Pricing Tests (Based on Seed Data)', () => {
    it('should calculate standard shirt wash + iron', async () => {
      const shirtPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SHIRT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Shirt',
        services: {
          wash: 150,
          dryClean: 250,
          iron: 50,
          starch: 30,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(shirtPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Shirt',
        ['wash', 'iron']
      );

      expect(price).toBe(200); // 150 + 50
    });

    it('should calculate suit dry clean + iron', async () => {
      const suitPricing = {
        pricingId: 'PRICE-BR-MAIN-001-SUIT',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Suit',
        services: {
          wash: 300,
          dryClean: 500,
          iron: 100,
          starch: 50,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(suitPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Suit',
        ['dryClean', 'iron']
      );

      expect(price).toBe(600); // 500 + 100
    });

    it('should calculate dress dry clean + iron + express', async () => {
      const dressPricing = {
        pricingId: 'PRICE-BR-MAIN-001-DRESS',
        branchId: TEST_BRANCHES.mainStore.branchId,
        garmentType: 'Dress',
        services: {
          wash: 200,
          dryClean: 350,
          iron: 80,
          starch: 40,
          express: 0,
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getDocument.mockResolvedValueOnce(dressPricing);

      const price = await calculateGarmentPrice(
        TEST_BRANCHES.mainStore.branchId,
        'Dress',
        ['dryClean', 'iron', 'express']
      );

      // (350 + 80) + 50% = 430 + 215 = 645
      expect(price).toBe(645);
    });
  });
});
