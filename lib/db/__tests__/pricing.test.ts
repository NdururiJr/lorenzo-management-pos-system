/**
 * Unit Tests for Pricing Operations
 *
 * Tests pricing calculation logic, price retrieval, and service pricing.
 *
 * @module lib/db/__tests__/pricing.test
 */

import {
  generatePricingId,
  calculateGarmentPrice,
  calculateTotalPrice,
} from '../pricing';
import * as db from '../index';

// Mock the database operations
jest.mock('../index', () => ({
  getDocument: jest.fn(),
  getDocuments: jest.fn(),
  setDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  DatabaseError: class DatabaseError extends Error {
    constructor(message: string, public originalError?: unknown) {
      super(message);
      this.name = 'DatabaseError';
    }
  },
}));

describe('Pricing Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePricingId', () => {
    it('generates pricing ID with correct format', () => {
      const result = generatePricingId('KIL', 'Shirt');
      expect(result).toBe('PRICE-KIL-SHIRT');
    });

    it('handles garment types with spaces', () => {
      const result = generatePricingId('KIL', 'Dry Clean');
      expect(result).toBe('PRICE-KIL-DRY-CLEAN');
    });

    it('converts garment type to uppercase', () => {
      const result = generatePricingId('kil', 'shirt');
      // Only garment type is converted to uppercase, not branch ID
      expect(result).toBe('PRICE-kil-SHIRT');
    });

    it('handles multi-word garment types', () => {
      const result = generatePricingId('MAIN', 'Wedding Dress');
      expect(result).toBe('PRICE-MAIN-WEDDING-DRESS');
    });
  });

  describe('calculateGarmentPrice', () => {
    const mockPricing = {
      pricingId: 'PRICE-KIL-SHIRT',
      branchId: 'KIL',
      garmentType: 'Shirt',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0, // Express is FREE
      },
      active: true,
    };

    beforeEach(() => {
      (db.getDocument as jest.Mock).mockResolvedValue(mockPricing);
    });

    it('calculates wash + iron correctly', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
      ]);
      expect(price).toBe(200); // 150 + 50
    });

    it('calculates dry clean only', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', ['dryClean']);
      expect(price).toBe(250);
    });

    it('calculates all services except express', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
        'starch',
      ]);
      expect(price).toBe(230); // 150 + 50 + 30
    });

    it('express is FREE (no surcharge)', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
        'express',
      ]);
      expect(price).toBe(200); // Express is FREE, so just wash + iron = 150 + 50
    });

    it('handles case-insensitive service names', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'WASH',
        'IRON',
      ]);
      expect(price).toBe(200);
    });

    it('handles "dry clean" as two words', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'dry clean',
      ]);
      expect(price).toBe(250);
    });

    it('throws error when pricing not found', async () => {
      (db.getDocument as jest.Mock).mockRejectedValue(
        new Error('Document not found')
      );

      await expect(
        calculateGarmentPrice('KIL', 'Shirt', ['wash'])
      ).rejects.toThrow();
    });

    it('returns 0 for no services selected', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', []);
      expect(price).toBe(0);
    });

    it('express is FREE with multiple services', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
        'starch',
        'express',
      ]);
      // Express is FREE: 150 + 50 + 30 = 230
      expect(price).toBe(230);
    });
  });

  describe('calculateTotalPrice', () => {
    const mockPricingShirt = {
      pricingId: 'PRICE-KIL-SHIRT',
      branchId: 'KIL',
      garmentType: 'Shirt',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0,
      },
      active: true,
    };

    const mockPricingPants = {
      pricingId: 'PRICE-KIL-PANTS',
      branchId: 'KIL',
      garmentType: 'Pants',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0,
      },
      active: true,
    };

    beforeEach(() => {
      (db.getDocument as jest.Mock).mockImplementation((collection, id) => {
        if (id === 'PRICE-KIL-SHIRT') return Promise.resolve(mockPricingShirt);
        if (id === 'PRICE-KIL-PANTS') return Promise.resolve(mockPricingPants);
        return Promise.reject(new Error('Not found'));
      });
    });

    it('calculates total for single garment', async () => {
      const garments = [{ type: 'Shirt', services: ['wash', 'iron'] }];
      const total = await calculateTotalPrice('KIL', garments);
      expect(total).toBe(200);
    });

    it('calculates total for multiple garments', async () => {
      const garments = [
        { type: 'Shirt', services: ['wash', 'iron'] },
        { type: 'Pants', services: ['wash', 'iron'] },
      ];
      const total = await calculateTotalPrice('KIL', garments);
      expect(total).toBe(400); // 200 + 200
    });

    it('handles empty garment array', async () => {
      const total = await calculateTotalPrice('KIL', []);
      expect(total).toBe(0);
    });

    it('calculates with express service (express is FREE)', async () => {
      const garments = [
        { type: 'Shirt', services: ['wash', 'iron', 'express'] },
      ];
      const total = await calculateTotalPrice('KIL', garments);
      expect(total).toBe(200); // Express is FREE: 150 + 50
    });

    it('handles mixed express and regular', async () => {
      const garments = [
        { type: 'Shirt', services: ['wash', 'iron', 'express'] }, // Express FREE: 200
        { type: 'Pants', services: ['wash', 'iron'] }, // 200
      ];
      const total = await calculateTotalPrice('KIL', garments);
      expect(total).toBe(400);
    });

    it('handles different service combinations', async () => {
      const garments = [
        { type: 'Shirt', services: ['dryClean'] }, // 250
        { type: 'Pants', services: ['wash', 'iron', 'starch'] }, // 230
      ];
      const total = await calculateTotalPrice('KIL', garments);
      expect(total).toBe(480);
    });
  });

  describe('Express Service (FREE - No Surcharge)', () => {
    const mockPricing = {
      pricingId: 'PRICE-KIL-SHIRT',
      branchId: 'KIL',
      garmentType: 'Shirt',
      services: {
        wash: 100,
        dryClean: 200,
        iron: 50,
        starch: 25,
        express: 0, // Express is FREE
      },
      active: true,
    };

    beforeEach(() => {
      (db.getDocument as jest.Mock).mockResolvedValue(mockPricing);
    });

    it('express is FREE on wash only', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'express',
      ]);
      expect(price).toBe(100); // Express is FREE, just wash
    });

    it('express is FREE on multiple services', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
        'express',
      ]);
      expect(price).toBe(150); // Express is FREE, wash + iron
    });

    it('returns integer price', async () => {
      const mockOddPricing = {
        ...mockPricing,
        services: {
          ...mockPricing.services,
          wash: 175,
          iron: 0,
        },
      };
      (db.getDocument as jest.Mock).mockResolvedValue(mockOddPricing);

      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'express',
      ]);
      expect(Number.isInteger(price)).toBe(true);
      expect(price).toBe(175); // Express is FREE
    });
  });
});
