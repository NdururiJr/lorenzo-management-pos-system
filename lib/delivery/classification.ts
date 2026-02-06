/**
 * Delivery Classification System
 *
 * Automatically classifies deliveries as Small (Motorcycle) or Bulk (Van)
 * based on garment count, weight, and order value.
 * V2.0: Includes manager override capability with audit logging.
 *
 * @module lib/delivery/classification
 */

import { Timestamp } from 'firebase/firestore';
import type { Order, DeliveryClassification, Garment } from '@/lib/db/schema';

/**
 * Classification thresholds (configurable via system settings)
 */
export const CLASSIFICATION_THRESHOLDS = {
  /** Maximum garments for Small classification */
  small: {
    maxGarments: 5,
    maxWeight: 10, // kg
    maxValue: 5000, // KES
  },
  /** Minimum thresholds for Bulk classification */
  bulk: {
    minGarments: 6,
    minWeight: 10.01, // kg
    minValue: 5001, // KES
  },
};

/**
 * Classification result with details
 */
export interface ClassificationResult {
  /** The determined classification */
  classification: DeliveryClassification;
  /** The basis for the classification decision */
  basis: 'garment_count' | 'weight' | 'value' | 'manual';
  /** Detailed breakdown of the classification factors */
  details: {
    garmentCount: number;
    estimatedWeight?: number;
    orderValue: number;
  };
  /** Human-readable explanation */
  reason: string;
}

/**
 * Override request for manual classification
 */
export interface ClassificationOverride {
  /** The new classification */
  newClassification: DeliveryClassification;
  /** User ID of the manager making the override */
  overrideBy: string;
  /** Manager's name (for display) */
  overrideByName: string;
  /** Reason for the override */
  reason: string;
  /** Timestamp of the override */
  overrideAt: Timestamp;
}

/**
 * Estimate weight of garments based on type
 * Returns estimated weight in kg
 */
export function estimateGarmentWeight(garments: Garment[]): number {
  // Average weights per garment type (in kg)
  const weightEstimates: Record<string, number> = {
    // Light items
    'Shirt': 0.2,
    'Blouse': 0.15,
    'T-Shirt': 0.15,
    'Tie': 0.05,
    'Scarf': 0.1,
    'Handkerchief': 0.02,
    // Medium items
    'Pants': 0.4,
    'Trousers': 0.4,
    'Skirt': 0.3,
    'Dress': 0.4,
    'Shorts': 0.25,
    // Heavy items
    'Jacket': 0.8,
    'Coat': 1.2,
    'Suit': 1.0,
    'Blazer': 0.7,
    'Sweater': 0.5,
    // Household items
    'Bedding': 2.0,
    'Curtains': 1.5,
    'Blanket': 2.5,
    'Duvet': 3.0,
    'Pillow': 0.5,
    // Default
    'Other': 0.3,
  };

  let totalWeight = 0;

  for (const garment of garments) {
    const type = garment.type || 'Other';
    const weight = weightEstimates[type] || weightEstimates['Other'];
    totalWeight += weight;
  }

  return Math.round(totalWeight * 100) / 100; // Round to 2 decimal places
}

/**
 * Classify a delivery based on order details
 *
 * Classification priority:
 * 1. Value (if order value > threshold, classify as Bulk)
 * 2. Weight (if estimated weight > threshold, classify as Bulk)
 * 3. Garment count (if count > threshold, classify as Bulk)
 * 4. Default to Small if all criteria are met
 *
 * @param order - The order to classify
 * @returns Classification result with details
 */
export function classifyDelivery(order: Order): ClassificationResult {
  const garmentCount = order.garments?.length || 0;
  const orderValue = order.totalAmount || 0;
  const estimatedWeight = estimateGarmentWeight(order.garments || []);

  const details = {
    garmentCount,
    estimatedWeight,
    orderValue,
  };

  // Check value first (highest priority for business reasons)
  if (orderValue > CLASSIFICATION_THRESHOLDS.small.maxValue) {
    return {
      classification: 'Bulk',
      basis: 'value',
      details,
      reason: `Order value (KES ${orderValue.toLocaleString()}) exceeds threshold of KES ${CLASSIFICATION_THRESHOLDS.small.maxValue.toLocaleString()}`,
    };
  }

  // Check weight
  if (estimatedWeight > CLASSIFICATION_THRESHOLDS.small.maxWeight) {
    return {
      classification: 'Bulk',
      basis: 'weight',
      details,
      reason: `Estimated weight (${estimatedWeight}kg) exceeds threshold of ${CLASSIFICATION_THRESHOLDS.small.maxWeight}kg`,
    };
  }

  // Check garment count
  if (garmentCount > CLASSIFICATION_THRESHOLDS.small.maxGarments) {
    return {
      classification: 'Bulk',
      basis: 'garment_count',
      details,
      reason: `Garment count (${garmentCount}) exceeds threshold of ${CLASSIFICATION_THRESHOLDS.small.maxGarments}`,
    };
  }

  // All criteria met for Small classification
  return {
    classification: 'Small',
    basis: 'garment_count', // Default basis when within all thresholds
    details,
    reason: `Order meets Small delivery criteria: ${garmentCount} garments, ${estimatedWeight}kg estimated, KES ${orderValue.toLocaleString()} value`,
  };
}

/**
 * Classify multiple orders for batch delivery assignment
 *
 * @param orders - Array of orders to classify
 * @returns Map of order ID to classification result
 */
export function classifyMultipleDeliveries(
  orders: Order[]
): Map<string, ClassificationResult> {
  const results = new Map<string, ClassificationResult>();

  for (const order of orders) {
    results.set(order.orderId, classifyDelivery(order));
  }

  return results;
}

/**
 * Get vehicle type recommendation based on classification
 */
export function getVehicleRecommendation(classification: DeliveryClassification): {
  vehicleType: 'Motorcycle' | 'Van';
  description: string;
  maxCapacity: string;
} {
  if (classification === 'Small') {
    return {
      vehicleType: 'Motorcycle',
      description: 'Suitable for quick, single-order deliveries',
      maxCapacity: '5 garments or 10kg',
    };
  }

  return {
    vehicleType: 'Van',
    description: 'Required for large orders or multiple deliveries',
    maxCapacity: '50+ garments or 100kg',
  };
}

/**
 * Check if a manager override is allowed for the given user role
 */
export function canOverrideClassification(userRole: string): boolean {
  const allowedRoles = [
    'admin',
    'director',
    'general_manager',
    'store_manager',
    'logistics_manager',
  ];

  return allowedRoles.includes(userRole);
}

/**
 * Create an override record for audit logging
 */
export function createOverrideRecord(
  orderId: string,
  originalClassification: DeliveryClassification,
  newClassification: DeliveryClassification,
  userId: string,
  userName: string,
  reason: string
): {
  orderId: string;
  originalClassification: DeliveryClassification;
  newClassification: DeliveryClassification;
  override: ClassificationOverride;
} {
  return {
    orderId,
    originalClassification,
    newClassification,
    override: {
      newClassification,
      overrideBy: userId,
      overrideByName: userName,
      reason,
      overrideAt: Timestamp.now(),
    },
  };
}

/**
 * Get classification badge color for UI
 */
export function getClassificationColor(classification: DeliveryClassification): {
  bg: string;
  text: string;
  border: string;
} {
  if (classification === 'Small') {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    };
  }

  return {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  };
}

/**
 * Get classification icon name for UI
 */
export function getClassificationIcon(classification: DeliveryClassification): string {
  return classification === 'Small' ? 'Bike' : 'Truck';
}

/**
 * Validate classification override request
 */
export function validateOverrideRequest(
  currentClassification: DeliveryClassification,
  newClassification: DeliveryClassification,
  reason: string
): { valid: boolean; error?: string } {
  if (currentClassification === newClassification) {
    return {
      valid: false,
      error: 'New classification must be different from current classification',
    };
  }

  if (!reason || reason.trim().length < 10) {
    return {
      valid: false,
      error: 'Override reason must be at least 10 characters',
    };
  }

  return { valid: true };
}
