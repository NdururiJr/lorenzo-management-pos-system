/**
 * Load-Based Pricing Service (FR-015)
 *
 * Provides weight-based pricing calculations with support for:
 * - Per-item pricing (traditional)
 * - Per-kg pricing (laundry)
 * - Hybrid pricing (base + weight)
 * - Customer segment discounts (regular, VIP, corporate)
 *
 * @module lib/db/load-pricing
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type {
  PricingRule,
  CustomerSegment,
  PriceBreakdown,
  LoadMetrics,
  WorkstationCapacity,
  Order,
  Customer,
} from './schema';

// ============================================
// CONSTANTS
// ============================================

/** Default customer segment */
export const DEFAULT_SEGMENT: CustomerSegment = 'regular';

/** VIP qualification thresholds */
export const VIP_THRESHOLDS = {
  minOrders: 10,
  minSpend: 50000, // KES
  periodMonths: 12,
};

// ============================================
// PRICING RULE MANAGEMENT
// ============================================

/**
 * Generate a unique pricing rule ID
 */
export function generatePricingRuleId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `RULE-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a new pricing rule
 *
 * @param data - Pricing rule data
 * @returns Created rule ID
 */
export async function createPricingRule(
  data: Omit<PricingRule, 'ruleId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ruleId = generatePricingRuleId();

  const rule: PricingRule = {
    ruleId,
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDocument<PricingRule>('pricingRules', ruleId, rule);
  return ruleId;
}

/**
 * Get pricing rule by ID
 */
export async function getPricingRule(ruleId: string): Promise<PricingRule> {
  return getDocument<PricingRule>('pricingRules', ruleId);
}

/**
 * Get all active pricing rules
 */
export async function getActivePricingRules(): Promise<PricingRule[]> {
  return getDocuments<PricingRule>(
    'pricingRules',
    where('isActive', '==', true),
    orderBy('priority', 'desc')
  );
}

/**
 * Get pricing rules for a specific service type and segment
 *
 * @param serviceType - Service type (e.g., 'wash', 'dry_clean', 'laundry_kg')
 * @param segment - Customer segment
 * @param branchId - Optional branch ID (or 'ALL' for global)
 * @returns Matching pricing rules sorted by priority
 */
export async function getPricingRulesForService(
  serviceType: string,
  segment: CustomerSegment,
  branchId?: string
): Promise<PricingRule[]> {
  const rules = await getActivePricingRules();

  return rules.filter((rule) => {
    const matchesService = rule.serviceType === serviceType;
    const matchesSegment = rule.customerSegment === segment || rule.customerSegment === 'regular';
    const matchesBranch = !branchId || rule.branchId === branchId || rule.branchId === 'ALL';

    return matchesService && matchesSegment && matchesBranch;
  });
}

/**
 * Find the best matching pricing rule
 *
 * @param serviceType - Service type
 * @param segment - Customer segment
 * @param branchId - Branch ID
 * @param weightKg - Optional weight for weight-based rules
 * @returns Best matching rule or null
 */
export async function findBestPricingRule(
  serviceType: string,
  segment: CustomerSegment,
  branchId: string,
  weightKg?: number
): Promise<PricingRule | null> {
  const rules = await getPricingRulesForService(serviceType, segment, branchId);

  if (rules.length === 0) return null;

  // Find the best match based on priority and weight constraints
  for (const rule of rules) {
    // Check weight constraints if applicable
    if (weightKg !== undefined) {
      if (rule.minWeightKg !== undefined && weightKg < rule.minWeightKg) continue;
      if (rule.maxWeightKg !== undefined && weightKg > rule.maxWeightKg) continue;
    }

    // Check segment match (exact match takes priority over regular fallback)
    if (rule.customerSegment === segment) {
      return rule;
    }
  }

  // Fall back to first matching rule (regular segment as default)
  return rules.find((r) => r.customerSegment === 'regular') || rules[0] || null;
}

/**
 * Update a pricing rule
 */
export async function updatePricingRule(
  ruleId: string,
  data: Partial<Omit<PricingRule, 'ruleId' | 'createdAt'>>
): Promise<void> {
  await updateDocument<PricingRule>('pricingRules', ruleId, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// PRICE CALCULATION
// ============================================

/**
 * Calculate price for a single item using pricing rules
 *
 * @param serviceType - Service type
 * @param segment - Customer segment
 * @param branchId - Branch ID
 * @param weightKg - Weight in kg (optional)
 * @param quantity - Quantity (default 1)
 * @returns Price breakdown
 */
export async function calculateItemPrice(
  serviceType: string,
  segment: CustomerSegment,
  branchId: string,
  weightKg?: number,
  quantity: number = 1
): Promise<PriceBreakdown> {
  const rule = await findBestPricingRule(serviceType, segment, branchId, weightKg);

  if (!rule) {
    throw new DatabaseError(`No pricing rule found for service ${serviceType}`);
  }

  let baseCalculation = 0;
  let weightPortion = 0;

  switch (rule.pricingType) {
    case 'per_item':
      baseCalculation = rule.basePrice * quantity;
      break;

    case 'per_kg':
      if (weightKg === undefined || weightKg <= 0) {
        throw new DatabaseError('Weight is required for per-kg pricing');
      }
      weightPortion = (rule.pricePerKg || 0) * weightKg;
      break;

    case 'hybrid':
      baseCalculation = rule.basePrice * quantity;
      if (weightKg !== undefined && weightKg > 0) {
        weightPortion = (rule.pricePerKg || 0) * weightKg;
      }
      break;
  }

  const subtotal = baseCalculation + weightPortion;
  const discount = rule.discountPercentage
    ? Math.round(subtotal * (rule.discountPercentage / 100))
    : 0;
  const finalPrice = Math.round(subtotal - discount);

  return {
    baseCalculation,
    weightPortion: weightPortion > 0 ? weightPortion : undefined,
    discount: discount > 0 ? discount : undefined,
    finalPrice,
    pricingRuleId: rule.ruleId,
    pricingRuleName: rule.ruleName,
    customerSegment: segment,
  };
}

/**
 * Calculate prices for all garments in an order
 *
 * @param garments - Array of garments with type and services
 * @param segment - Customer segment
 * @param branchId - Branch ID
 * @returns Garments with price breakdowns and total
 */
export async function calculateOrderPrices(
  garments: Array<{
    type: string;
    services: string[];
    weightKg?: number;
  }>,
  segment: CustomerSegment,
  branchId: string
): Promise<{
  items: Array<{
    type: string;
    services: string[];
    weightKg?: number;
    priceBreakdown: PriceBreakdown;
    totalPrice: number;
  }>;
  summary: {
    subtotal: number;
    weightBasedPortion: number;
    totalDiscount: number;
    total: number;
    segment: CustomerSegment;
  };
}> {
  const items = [];
  let subtotal = 0;
  let weightBasedPortion = 0;
  let totalDiscount = 0;

  for (const garment of garments) {
    let garmentTotal = 0;
    const priceBreakdowns: PriceBreakdown[] = [];

    // Calculate price for each service on this garment
    for (const service of garment.services) {
      const breakdown = await calculateItemPrice(
        service.toLowerCase().replace(/\s+/g, '_'),
        segment,
        branchId,
        garment.weightKg
      );

      priceBreakdowns.push(breakdown);
      garmentTotal += breakdown.finalPrice;
      weightBasedPortion += breakdown.weightPortion || 0;
      totalDiscount += breakdown.discount || 0;
    }

    // Combine into single breakdown for the garment
    const combinedBreakdown: PriceBreakdown = {
      baseCalculation: priceBreakdowns.reduce((sum, b) => sum + b.baseCalculation, 0),
      weightPortion: weightBasedPortion > 0 ? weightBasedPortion : undefined,
      discount: totalDiscount > 0 ? totalDiscount : undefined,
      finalPrice: garmentTotal,
      customerSegment: segment,
    };

    items.push({
      ...garment,
      priceBreakdown: combinedBreakdown,
      totalPrice: garmentTotal,
    });

    subtotal += garmentTotal;
  }

  return {
    items,
    summary: {
      subtotal,
      weightBasedPortion,
      totalDiscount,
      total: subtotal, // Already has discounts applied in individual items
      segment,
    },
  };
}

// ============================================
// CUSTOMER SEGMENT DETERMINATION
// ============================================

/**
 * Determine customer segment based on order history
 *
 * @param customer - Customer document
 * @returns Customer segment
 */
export function determineCustomerSegment(customer: Customer): CustomerSegment {
  // Check for corporate agreement (would need to be stored on customer)
  // For now, check based on order count and total spent

  // VIP qualification
  if (
    customer.orderCount >= VIP_THRESHOLDS.minOrders &&
    customer.totalSpent >= VIP_THRESHOLDS.minSpend
  ) {
    return 'vip';
  }

  return 'regular';
}

/**
 * Get customer segment with fresh calculation
 *
 * @param customerId - Customer ID
 * @returns Customer segment
 */
export async function getCustomerSegment(customerId: string): Promise<CustomerSegment> {
  try {
    const customer = await getDocument<Customer>('customers', customerId);
    return determineCustomerSegment(customer);
  } catch {
    return DEFAULT_SEGMENT;
  }
}

// ============================================
// LOAD METRICS & CAPACITY
// ============================================

/**
 * Get load metrics for a branch
 *
 * @param branchId - Branch ID
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Load metrics
 */
export async function getLoadMetrics(
  branchId: string,
  startDate: Date,
  endDate: Date
): Promise<LoadMetrics> {
  const orders = await getDocuments<Order>(
    'orders',
    where('branchId', '==', branchId),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    limit(1000)
  );

  let totalWeightKg = 0;
  const byServiceType: Record<string, number> = {};

  orders.forEach((order) => {
    // Add order total weight
    if (order.totalWeightKg) {
      totalWeightKg += order.totalWeightKg;
    }

    // Track by service type from garments
    order.garments?.forEach((garment) => {
      const weight = garment.weightKg || 0;
      garment.services?.forEach((service) => {
        byServiceType[service] = (byServiceType[service] || 0) + weight;
      });
    });
  });

  return {
    totalWeightKg,
    orderCount: orders.length,
    avgWeightPerOrder: orders.length > 0 ? totalWeightKg / orders.length : 0,
    byServiceType,
    period: { start: startDate, end: endDate },
  };
}

/**
 * Get workstation capacity status
 *
 * @param workstationId - Workstation ID
 * @returns Capacity information
 */
export async function getWorkstationCapacity(
  workstationId: string
): Promise<WorkstationCapacity | null> {
  try {
    return await getDocument<WorkstationCapacity>('workstationCapacity', workstationId);
  } catch {
    return null;
  }
}

/**
 * Check if workstation can accept additional load
 *
 * @param workstationId - Workstation ID
 * @param additionalWeightKg - Weight to add
 * @returns Whether capacity is available
 */
export async function checkWorkstationCapacity(
  workstationId: string,
  additionalWeightKg: number
): Promise<{ available: boolean; remainingCapacity: number; currentLoad: number }> {
  const capacity = await getWorkstationCapacity(workstationId);

  if (!capacity) {
    // No capacity tracking = unlimited
    return { available: true, remainingCapacity: Infinity, currentLoad: 0 };
  }

  const remainingCapacity = capacity.maxDailyKg - capacity.currentLoadKg;
  const available = remainingCapacity >= additionalWeightKg;

  return {
    available,
    remainingCapacity,
    currentLoad: capacity.currentLoadKg,
  };
}

/**
 * Update workstation current load
 *
 * @param workstationId - Workstation ID
 * @param weightKg - Weight to add (positive) or remove (negative)
 */
export async function updateWorkstationLoad(
  workstationId: string,
  weightKg: number
): Promise<void> {
  const capacity = await getWorkstationCapacity(workstationId);

  if (!capacity) return;

  const newLoad = Math.max(0, capacity.currentLoadKg + weightKg);
  const utilizationPercent = capacity.maxDailyKg > 0
    ? Math.round((newLoad / capacity.maxDailyKg) * 100)
    : 0;

  await updateDocument<WorkstationCapacity>('workstationCapacity', workstationId, {
    currentLoadKg: newLoad,
    utilizationPercent,
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// SEED DATA
// ============================================

/**
 * Seed default pricing rules for a branch
 *
 * @param branchId - Branch ID
 */
export async function seedDefaultPricingRules(branchId: string): Promise<void> {
  const defaultRules: Omit<PricingRule, 'ruleId' | 'createdAt' | 'updatedAt'>[] = [
    // Regular wash - per item
    {
      ruleName: 'Regular Wash - Per Item',
      branchId,
      serviceType: 'wash',
      customerSegment: 'regular',
      pricingType: 'per_item',
      basePrice: 150,
      priority: 10,
      isActive: true,
    },
    // VIP wash - per item with discount
    {
      ruleName: 'VIP Wash - Per Item',
      branchId,
      serviceType: 'wash',
      customerSegment: 'vip',
      pricingType: 'per_item',
      basePrice: 150,
      discountPercentage: 15,
      priority: 20,
      isActive: true,
    },
    // Laundry by weight - per kg
    {
      ruleName: 'Laundry by Weight',
      branchId,
      serviceType: 'laundry_kg',
      customerSegment: 'regular',
      pricingType: 'per_kg',
      basePrice: 0,
      pricePerKg: 200,
      minWeightKg: 3,
      priority: 10,
      isActive: true,
    },
    // VIP laundry by weight
    {
      ruleName: 'VIP Laundry by Weight',
      branchId,
      serviceType: 'laundry_kg',
      customerSegment: 'vip',
      pricingType: 'per_kg',
      basePrice: 0,
      pricePerKg: 170,
      minWeightKg: 3,
      discountPercentage: 0,
      priority: 20,
      isActive: true,
    },
    // Dry cleaning - hybrid
    {
      ruleName: 'Dry Cleaning - Hybrid',
      branchId,
      serviceType: 'dry_clean',
      customerSegment: 'regular',
      pricingType: 'hybrid',
      basePrice: 200,
      pricePerKg: 50,
      priority: 10,
      isActive: true,
    },
    // Corporate dry cleaning
    {
      ruleName: 'Corporate Dry Cleaning',
      branchId,
      serviceType: 'dry_clean',
      customerSegment: 'corporate',
      pricingType: 'per_item',
      basePrice: 180,
      discountPercentage: 20,
      priority: 30,
      isActive: true,
    },
    // Iron service
    {
      ruleName: 'Iron Service',
      branchId,
      serviceType: 'iron',
      customerSegment: 'regular',
      pricingType: 'per_item',
      basePrice: 50,
      priority: 10,
      isActive: true,
    },
  ];

  for (const rule of defaultRules) {
    await createPricingRule(rule);
  }
}
