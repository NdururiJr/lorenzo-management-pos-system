/**
 * Delivery Fee Rules Database Operations (FR-013)
 *
 * Provides CRUD operations and fee calculation for delivery fee rules.
 * Supports free delivery automation based on order value, customer segment,
 * distance, and other conditions.
 *
 * @module lib/db/delivery-fee-rules
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
import type { DeliveryFeeRule, DeliveryFeeType, CustomerSegment } from './schema';

// ============================================
// CONSTANTS
// ============================================

/** Default delivery fee when no rules match */
export const DEFAULT_DELIVERY_FEE = 200; // KES

/** Collection name */
const COLLECTION_NAME = 'deliveryFeeRules';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique delivery fee rule ID
 */
export function generateDeliveryFeeRuleId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `DFRULE-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if current time is within a time range
 */
function isWithinTimeRange(startTime?: string, endTime?: string): boolean {
  if (!startTime || !endTime) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight ranges (e.g., 22:00 to 06:00)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Check if current day is in the allowed days
 */
function isAllowedDay(daysOfWeek?: number[]): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) return true;

  const today = new Date().getDay();
  return daysOfWeek.includes(today);
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new delivery fee rule
 *
 * @param data - Rule data without generated fields
 * @returns Created rule ID
 */
export async function createDeliveryFeeRule(
  data: Omit<DeliveryFeeRule, 'ruleId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ruleId = generateDeliveryFeeRuleId();
  const now = Timestamp.now();

  const rule: DeliveryFeeRule = {
    ruleId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument<DeliveryFeeRule>(COLLECTION_NAME, ruleId, rule);
  return ruleId;
}

/**
 * Get a delivery fee rule by ID
 *
 * @param ruleId - Rule ID
 * @returns The rule
 */
export async function getDeliveryFeeRule(ruleId: string): Promise<DeliveryFeeRule> {
  return getDocument<DeliveryFeeRule>(COLLECTION_NAME, ruleId);
}

/**
 * Get all active delivery fee rules
 *
 * @param branchId - Optional branch filter
 * @returns Active rules sorted by priority
 */
export async function getActiveDeliveryFeeRules(
  branchId?: string
): Promise<DeliveryFeeRule[]> {
  const rules = await getDocuments<DeliveryFeeRule>(
    COLLECTION_NAME,
    where('active', '==', true),
    orderBy('priority', 'desc')
  );

  const now = Timestamp.now();

  // Filter by branch and validity period
  return rules.filter((rule) => {
    // Check branch
    if (branchId && rule.branchId !== 'ALL' && rule.branchId !== branchId) {
      return false;
    }

    // Check validFrom
    if (rule.validFrom && rule.validFrom.toMillis() > now.toMillis()) {
      return false;
    }

    // Check validUntil
    if (rule.validUntil && rule.validUntil.toMillis() < now.toMillis()) {
      return false;
    }

    return true;
  });
}

/**
 * Get all delivery fee rules for a branch (including inactive)
 *
 * @param branchId - Branch ID
 * @returns All rules for the branch
 */
export async function getDeliveryFeeRulesByBranch(
  branchId: string
): Promise<DeliveryFeeRule[]> {
  const rules = await getDocuments<DeliveryFeeRule>(
    COLLECTION_NAME,
    orderBy('priority', 'desc')
  );

  return rules.filter(
    (rule) => rule.branchId === branchId || rule.branchId === 'ALL'
  );
}

/**
 * Update a delivery fee rule
 *
 * @param ruleId - Rule ID
 * @param data - Partial rule updates
 */
export async function updateDeliveryFeeRule(
  ruleId: string,
  data: Partial<Omit<DeliveryFeeRule, 'ruleId' | 'createdAt'>>
): Promise<void> {
  await updateDocument<DeliveryFeeRule>(COLLECTION_NAME, ruleId, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a delivery fee rule
 *
 * @param ruleId - Rule ID
 */
export async function deleteDeliveryFeeRule(ruleId: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, ruleId);
}

/**
 * Toggle a delivery fee rule's active status
 *
 * @param ruleId - Rule ID
 * @param active - New active status
 */
export async function toggleDeliveryFeeRuleActive(
  ruleId: string,
  active: boolean
): Promise<void> {
  await updateDeliveryFeeRule(ruleId, { active });
}

// ============================================
// FEE CALCULATION
// ============================================

/**
 * Parameters for fee calculation
 */
export interface FeeCalculationParams {
  /** Branch ID */
  branchId: string;
  /** Order subtotal amount */
  orderAmount: number;
  /** Customer segment */
  customerSegment?: CustomerSegment;
  /** Distance to delivery address in km */
  distanceKm?: number;
}

/**
 * Result of fee calculation
 */
export interface FeeCalculationResult {
  /** Calculated fee amount */
  fee: number;
  /** Whether delivery is free */
  isFree: boolean;
  /** ID of the rule that was applied */
  ruleApplied: string | null;
  /** Name of the rule that was applied */
  ruleName: string | null;
  /** Reason for the fee/discount */
  reason: string;
  /** Fee type used */
  feeType: DeliveryFeeType | null;
}

/**
 * Check if a rule's conditions match the order
 */
function checkRuleConditions(
  rule: DeliveryFeeRule,
  params: FeeCalculationParams
): boolean {
  const { conditions } = rule;

  // Check minimum order amount
  if (conditions.minOrderAmount !== undefined) {
    if (params.orderAmount < conditions.minOrderAmount) {
      return false;
    }
  }

  // Check customer segment
  if (conditions.customerSegments && conditions.customerSegments.length > 0) {
    if (!params.customerSegment || !conditions.customerSegments.includes(params.customerSegment)) {
      return false;
    }
  }

  // Check distance
  if (conditions.maxDistanceKm !== undefined && params.distanceKm !== undefined) {
    if (params.distanceKm > conditions.maxDistanceKm) {
      return false;
    }
  }

  // Check day of week
  if (!isAllowedDay(conditions.daysOfWeek)) {
    return false;
  }

  // Check time range
  if (!isWithinTimeRange(conditions.startTime, conditions.endTime)) {
    return false;
  }

  return true;
}

/**
 * Calculate fee based on rule
 */
function calculateFeeFromRule(
  rule: DeliveryFeeRule,
  params: FeeCalculationParams
): number {
  const { feeCalculation } = rule;

  let fee = 0;

  switch (feeCalculation.type) {
    case 'free':
      fee = 0;
      break;

    case 'fixed':
      fee = feeCalculation.value;
      break;

    case 'per_km':
      if (params.distanceKm !== undefined) {
        fee = feeCalculation.value * params.distanceKm;
      } else {
        // Default to a base distance if no distance provided
        fee = feeCalculation.value * 5; // Assume 5km default
      }
      break;

    case 'percentage':
      fee = (feeCalculation.value / 100) * params.orderAmount;
      break;
  }

  // Apply min/max constraints
  if (feeCalculation.minFee !== undefined && fee < feeCalculation.minFee) {
    fee = feeCalculation.minFee;
  }
  if (feeCalculation.maxFee !== undefined && fee > feeCalculation.maxFee) {
    fee = feeCalculation.maxFee;
  }

  return Math.round(fee);
}

/**
 * Calculate delivery fee for an order
 *
 * Evaluates all active rules in priority order and applies the first matching rule.
 *
 * @param params - Calculation parameters
 * @returns Fee calculation result
 */
export async function calculateDeliveryFee(
  params: FeeCalculationParams
): Promise<FeeCalculationResult> {
  try {
    // Get active rules for the branch
    const rules = await getActiveDeliveryFeeRules(params.branchId);

    // Find the first matching rule (highest priority first)
    for (const rule of rules) {
      if (checkRuleConditions(rule, params)) {
        const fee = calculateFeeFromRule(rule, params);

        return {
          fee,
          isFree: fee === 0,
          ruleApplied: rule.ruleId,
          ruleName: rule.name,
          reason: fee === 0
            ? `Free delivery: ${rule.name}`
            : `${rule.name}: ${formatFeeExplanation(rule, fee)}`,
          feeType: rule.feeCalculation.type,
        };
      }
    }

    // No rules matched - return default fee
    return {
      fee: DEFAULT_DELIVERY_FEE,
      isFree: false,
      ruleApplied: null,
      ruleName: null,
      reason: 'Standard delivery fee',
      feeType: 'fixed',
    };
  } catch (error) {
    console.error('Error calculating delivery fee:', error);
    // On error, return default fee
    return {
      fee: DEFAULT_DELIVERY_FEE,
      isFree: false,
      ruleApplied: null,
      ruleName: null,
      reason: 'Standard delivery fee (default)',
      feeType: 'fixed',
    };
  }
}

/**
 * Format a human-readable explanation of the fee
 */
function formatFeeExplanation(rule: DeliveryFeeRule, fee: number): string {
  const { feeCalculation } = rule;

  switch (feeCalculation.type) {
    case 'free':
      return 'Free delivery';
    case 'fixed':
      return `KES ${fee} flat rate`;
    case 'per_km':
      return `KES ${feeCalculation.value}/km (KES ${fee} total)`;
    case 'percentage':
      return `${feeCalculation.value}% of order (KES ${fee})`;
    default:
      return `KES ${fee}`;
  }
}

/**
 * Preview fee calculation for multiple scenarios
 * Useful for admin UI to test rules
 *
 * @param branchId - Branch ID
 * @param scenarios - Array of test scenarios
 * @returns Array of results for each scenario
 */
export async function previewFeeCalculation(
  branchId: string,
  scenarios: Array<{
    orderAmount: number;
    customerSegment?: CustomerSegment;
    distanceKm?: number;
  }>
): Promise<FeeCalculationResult[]> {
  const results: FeeCalculationResult[] = [];

  for (const scenario of scenarios) {
    const result = await calculateDeliveryFee({
      branchId,
      ...scenario,
    });
    results.push(result);
  }

  return results;
}

// ============================================
// SEED DATA
// ============================================

/**
 * Default delivery fee rules to seed
 */
export const DEFAULT_DELIVERY_FEE_RULES: Omit<
  DeliveryFeeRule,
  'ruleId' | 'createdAt' | 'updatedAt'
>[] = [
  // VIP customers always get free delivery
  {
    branchId: 'ALL',
    name: 'VIP Free Delivery',
    priority: 100,
    conditions: {
      customerSegments: ['vip'],
    },
    feeCalculation: {
      type: 'free',
      value: 0,
    },
    active: true,
    validFrom: Timestamp.now(),
  },
  // Corporate customers always get free delivery
  {
    branchId: 'ALL',
    name: 'Corporate Free Delivery',
    priority: 95,
    conditions: {
      customerSegments: ['corporate'],
    },
    feeCalculation: {
      type: 'free',
      value: 0,
    },
    active: true,
    validFrom: Timestamp.now(),
  },
  // High-value orders get free delivery
  {
    branchId: 'ALL',
    name: 'High Value Order - Free Delivery',
    priority: 80,
    conditions: {
      minOrderAmount: 5000,
    },
    feeCalculation: {
      type: 'free',
      value: 0,
    },
    active: true,
    validFrom: Timestamp.now(),
  },
  // Medium-value orders get discounted delivery
  {
    branchId: 'ALL',
    name: 'Medium Value Order - Reduced Delivery',
    priority: 70,
    conditions: {
      minOrderAmount: 2500,
    },
    feeCalculation: {
      type: 'fixed',
      value: 100,
    },
    active: true,
    validFrom: Timestamp.now(),
  },
  // Distance-based fee for far deliveries
  {
    branchId: 'ALL',
    name: 'Distance-Based Fee (Beyond 10km)',
    priority: 50,
    conditions: {
      maxDistanceKm: 50, // Up to 50km
    },
    feeCalculation: {
      type: 'per_km',
      value: 20,
      minFee: 200,
      maxFee: 1000,
    },
    active: true,
    validFrom: Timestamp.now(),
  },
  // Standard delivery fee (default/fallback)
  {
    branchId: 'ALL',
    name: 'Standard Delivery Fee',
    priority: 10,
    conditions: {},
    feeCalculation: {
      type: 'fixed',
      value: 200,
    },
    active: true,
    validFrom: Timestamp.now(),
  },
];

/**
 * Seed default delivery fee rules
 *
 * @param branchId - Branch ID to seed (or 'ALL' for system-wide)
 */
export async function seedDefaultDeliveryFeeRules(
  branchId: string = 'ALL'
): Promise<string[]> {
  const createdIds: string[] = [];

  for (const ruleData of DEFAULT_DELIVERY_FEE_RULES) {
    const data = {
      ...ruleData,
      branchId: branchId === 'ALL' ? 'ALL' : branchId,
    };

    const ruleId = await createDeliveryFeeRule(data);
    createdIds.push(ruleId);
  }

  return createdIds;
}
