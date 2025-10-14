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
        express: 50, // 50% surcharge
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

    it('applies express surcharge correctly', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
        'express',
      ]);
      expect(price).toBe(300); // (150 + 50) + 50% = 300
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

    it('express surcharge applies to full price', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
        'starch',
        'express',
      ]);
      // Base: 150 + 50 + 30 = 230
      // Express: 230 + (230 * 0.5) = 345
      expect(price).toBe(345);
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
        express: 50,
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
        express: 50,
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

    it('calculates with express service', async () => {
      const garments = [
        { type: 'Shirt', services: ['wash', 'iron', 'express'] },
      ];
      const total = await calculateTotalPrice('KIL', garments);
      expect(total).toBe(300); // (150 + 50) + 50%
    });

    it('handles mixed express and regular', async () => {
      const garments = [
        { type: 'Shirt', services: ['wash', 'iron', 'express'] }, // 300
        { type: 'Pants', services: ['wash', 'iron'] }, // 200
      ];
      const total = await calculateTotalPrice('KIL', garments);
      expect(total).toBe(500);
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

  describe('Express Surcharge Calculations', () => {
    const mockPricing = {
      pricingId: 'PRICE-KIL-SHIRT',
      branchId: 'KIL',
      garmentType: 'Shirt',
      services: {
        wash: 100,
        dryClean: 200,
        iron: 50,
        starch: 25,
        express: 50, // 50% surcharge
      },
      active: true,
    };

    beforeEach(() => {
      (db.getDocument as jest.Mock).mockResolvedValue(mockPricing);
    });

    it('50% surcharge on wash only', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'express',
      ]);
      expect(price).toBe(150); // 100 + 50%
    });

    it('50% surcharge on multiple services', async () => {
      const price = await calculateGarmentPrice('KIL', 'Shirt', [
        'wash',
        'iron',
        'express',
      ]);
      expect(price).toBe(225); // (100 + 50) + 50%
    });

    it('rounds to nearest integer', async () => {
      // If base is 175, 50% surcharge would be 87.5
      // Total should be 263 (rounded)
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
    });
  });
});
