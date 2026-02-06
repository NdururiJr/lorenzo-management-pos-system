/**
 * Pricing Database Operations
 *
 * This file provides operations for managing garment pricing.
 * Includes price retrieval, calculation, and updates.
 *
 * @module lib/db/pricing
 */

import { Timestamp, where, orderBy } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  DatabaseError,
} from './index';
import type { Pricing, Garment } from './schema';

/**
 * Generate a unique pricing ID
 * Format: PRICE-[BRANCH]-[GARMENT-TYPE]
 */
export function generatePricingId(
  branchId: string,
  garmentType: string
): string {
  const cleanGarmentType = garmentType.replace(/\s+/g, '-').toUpperCase();
  return `PRICE-${branchId}-${cleanGarmentType}`;
}

/**
 * Create or update pricing for a garment type
 *
 * @param data - Pricing data
 * @returns The pricing ID
 */
export async function setPricing(
  data: Omit<Pricing, 'pricingId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const pricingId = generatePricingId(data.branchId, data.garmentType);

  // Check if pricing already exists
  try {
    await getDocument<Pricing>('pricing', pricingId);
    // If exists, update it
    await updateDocument<Pricing>('pricing', pricingId, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return pricingId;
  } catch {
    // If doesn't exist, create new
    const pricing = {
      pricingId,
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await setDocument<Pricing>('pricing', pricingId, pricing as any);
    return pricingId;
  }
}

/**
 * Get pricing by ID
 */
export async function getPricing(pricingId: string): Promise<Pricing> {
  return getDocument<Pricing>('pricing', pricingId);
}

/**
 * Get pricing for a specific garment type and branch
 */
export async function getPricingByGarmentType(
  branchId: string,
  garmentType: string
): Promise<Pricing | null> {
  const pricingId = generatePricingId(branchId, garmentType);
  try {
    return await getPricing(pricingId);
  } catch {
    return null;
  }
}

/**
 * Get all pricing for a branch
 */
export async function getPricingByBranch(
  branchId: string
): Promise<Pricing[]> {
  return getDocuments<Pricing>(
    'pricing',
    where('branchId', '==', branchId),
    where('active', '==', true),
    orderBy('garmentType', 'asc')
  );
}

/**
 * Get all active pricing
 */
export async function getActivePricing(): Promise<Pricing[]> {
  return getDocuments<Pricing>(
    'pricing',
    where('active', '==', true),
    orderBy('branchId', 'asc'),
    orderBy('garmentType', 'asc')
  );
}

/**
 * Calculate price for a single garment
 *
 * @param branchId - Branch ID
 * @param garmentType - Type of garment
 * @param services - Array of service names (e.g., ["wash", "iron"])
 * @returns Calculated price in KES
 */
export async function calculateGarmentPrice(
  branchId: string,
  garmentType: string,
  services: string[]
): Promise<number> {
  const pricing = await getPricingByGarmentType(branchId, garmentType);

  if (!pricing) {
    throw new DatabaseError(
      `No pricing found for ${garmentType} in branch ${branchId}`
    );
  }

  let totalPrice = 0;
  let _hasExpress = false;

  services.forEach((service) => {
    const serviceLower = service.toLowerCase();

    if (serviceLower === 'wash') {
      totalPrice += pricing.services.wash;
    } else if (serviceLower === 'dryclean' || serviceLower === 'dry clean') {
      totalPrice += pricing.services.dryClean;
    } else if (serviceLower === 'iron') {
      totalPrice += pricing.services.iron;
    } else if (serviceLower === 'starch') {
      totalPrice += pricing.services.starch;
    } else if (serviceLower === 'express') {
      _hasExpress = true;
    }
  });

  // Express is FREE (no surcharge) - 2-hour turnaround at no extra cost
  // hasExpress is tracked but doesn't affect pricing

  return Math.round(totalPrice);
}

/**
 * Calculate total price for multiple garments
 *
 * @param branchId - Branch ID
 * @param garments - Array of garments with type and services
 * @returns Total price in KES
 */
export async function calculateTotalPrice(
  branchId: string,
  garments: Array<{ type: string; services: string[] }>
): Promise<number> {
  let total = 0;

  for (const garment of garments) {
    const price = await calculateGarmentPrice(
      branchId,
      garment.type,
      garment.services
    );
    total += price;
  }

  return total;
}

/**
 * Calculate prices for garments and return with prices attached
 */
export async function calculateGarmentPrices(
  branchId: string,
  garments: Array<Omit<Garment, 'garmentId' | 'price' | 'status'>>
): Promise<Array<Omit<Garment, 'garmentId' | 'status'>>> {
  const garmentsWithPrices = await Promise.all(
    garments.map(async (garment) => {
      const price = await calculateGarmentPrice(
        branchId,
        garment.type,
        garment.services
      );
      return {
        ...garment,
        price,
      };
    })
  );

  return garmentsWithPrices;
}

/**
 * Update pricing services
 */
export async function updatePricingServices(
  pricingId: string,
  services: Pricing['services']
): Promise<void> {
  await updateDocument<Pricing>('pricing', pricingId, {
    services,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Deactivate pricing (soft delete)
 */
export async function deactivatePricing(pricingId: string): Promise<void> {
  await updateDocument<Pricing>('pricing', pricingId, {
    active: false,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Activate pricing
 */
export async function activatePricing(pricingId: string): Promise<void> {
  await updateDocument<Pricing>('pricing', pricingId, {
    active: true,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete pricing (hard delete - admin only)
 */
export async function deletePricing(pricingId: string): Promise<void> {
  return deleteDocument('pricing', pricingId);
}

/**
 * Seed default pricing for a branch
 * Common garment types with standard pricing
 */
export async function seedDefaultPricing(branchId: string): Promise<void> {
  const defaultGarments = [
    {
      garmentType: 'Shirt',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0, // Express is FREE
      },
    },
    {
      garmentType: 'Pants',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0,
      },
    },
    {
      garmentType: 'Dress',
      services: {
        wash: 200,
        dryClean: 350,
        iron: 80,
        starch: 40,
        express: 0,
      },
    },
    {
      garmentType: 'Suit',
      services: {
        wash: 300,
        dryClean: 500,
        iron: 100,
        starch: 50,
        express: 0,
      },
    },
    {
      garmentType: 'Blazer',
      services: {
        wash: 250,
        dryClean: 400,
        iron: 80,
        starch: 40,
        express: 0,
      },
    },
    {
      garmentType: 'Coat',
      services: {
        wash: 300,
        dryClean: 500,
        iron: 100,
        starch: 50,
        express: 0,
      },
    },
    {
      garmentType: 'Sweater',
      services: {
        wash: 180,
        dryClean: 280,
        iron: 60,
        starch: 0, // Not applicable
        express: 0,
      },
    },
    {
      garmentType: 'Jeans',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0,
      },
    },
    {
      garmentType: 'Skirt',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0,
      },
    },
    {
      garmentType: 'Blouse',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 0,
      },
    },
  ];

  for (const garment of defaultGarments) {
    await setPricing({
      branchId,
      garmentType: garment.garmentType,
      services: garment.services,
      active: true,
    });
  }
}
