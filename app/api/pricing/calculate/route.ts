/**
 * Price Calculation API (FR-015)
 *
 * Calculates prices using load-based pricing rules.
 *
 * @module app/api/pricing/calculate
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { CustomerSegment, PricingType } from '@/lib/db/schema';

// ============================================
// TYPES
// ============================================

interface PricingRule {
  ruleId: string;
  ruleName: string;
  serviceType: string;
  customerSegment: CustomerSegment;
  pricingType: PricingType;
  basePrice: number;
  pricePerKg?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  discountPercentage?: number;
  priority: number;
  branchId: string;
  isActive: boolean;
}

interface PriceBreakdown {
  baseCalculation: number;
  weightPortion?: number;
  discount?: number;
  finalPrice: number;
  pricingRuleId?: string;
  pricingRuleName?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function findBestPricingRule(
  serviceType: string,
  segment: CustomerSegment,
  branchId: string,
  weightKg?: number
): Promise<PricingRule | null> {
  // Query for matching rules
  const snapshot = await adminDb
    .collection('pricingRules')
    .where('isActive', '==', true)
    .where('serviceType', '==', serviceType)
    .orderBy('priority', 'desc')
    .get();

  const rules = snapshot.docs.map((doc) => doc.data() as PricingRule);

  // Filter by branch and segment
  const matchingRules = rules.filter((rule) => {
    const matchesBranch = rule.branchId === branchId || rule.branchId === 'ALL';
    const matchesSegment = rule.customerSegment === segment || rule.customerSegment === 'regular';

    // Check weight constraints
    if (weightKg !== undefined) {
      if (rule.minWeightKg && weightKg < rule.minWeightKg) return false;
      if (rule.maxWeightKg && weightKg > rule.maxWeightKg) return false;
    }

    return matchesBranch && matchesSegment;
  });

  // Prioritize exact segment match
  const exactMatch = matchingRules.find((r) => r.customerSegment === segment);
  if (exactMatch) return exactMatch;

  // Fall back to regular segment
  return matchingRules.find((r) => r.customerSegment === 'regular') || matchingRules[0] || null;
}

function calculatePrice(
  rule: PricingRule,
  weightKg?: number,
  quantity: number = 1
): PriceBreakdown {
  let baseCalculation = 0;
  let weightPortion = 0;

  switch (rule.pricingType) {
    case 'per_item':
      baseCalculation = rule.basePrice * quantity;
      break;

    case 'per_kg':
      if (weightKg && weightKg > 0) {
        weightPortion = (rule.pricePerKg || 0) * weightKg;
      }
      break;

    case 'hybrid':
      baseCalculation = rule.basePrice * quantity;
      if (weightKg && weightKg > 0) {
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
  };
}

async function getCustomerSegment(customerId: string): Promise<CustomerSegment> {
  try {
    const customerDoc = await adminDb.collection('customers').doc(customerId).get();
    if (!customerDoc.exists) return 'regular';

    const customer = customerDoc.data();

    // Check stored segment
    if (customer?.segment) {
      return customer.segment as CustomerSegment;
    }

    // Calculate segment based on history
    const orderCount = customer?.orderCount || 0;
    const totalSpent = customer?.totalSpent || 0;

    // VIP thresholds
    if (orderCount >= 10 && totalSpent >= 50000) {
      return 'vip';
    }

    return 'regular';
  } catch {
    return 'regular';
  }
}

// ============================================
// POST /api/pricing/calculate - Calculate prices
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branchId,
      customerId,
      customerSegment: providedSegment,
      items,
    } = body;

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Determine customer segment
    let segment: CustomerSegment = providedSegment || 'regular';
    if (customerId && !providedSegment) {
      segment = await getCustomerSegment(customerId);
    }

    // Calculate prices for each item
    const calculatedItems = [];
    let totalWeight = 0;
    let subtotal = 0;
    let totalWeightPortion = 0;
    let totalDiscount = 0;

    for (const item of items) {
      const { serviceType, services, weightKg, quantity = 1 } = item;

      // If multiple services, calculate each
      const servicesToCalculate = services && Array.isArray(services)
        ? services
        : [serviceType];

      let itemTotal = 0;
      const serviceBreakdowns: PriceBreakdown[] = [];

      for (const service of servicesToCalculate) {
        const normalizedService = service.toLowerCase().replace(/\s+/g, '_');
        const rule = await findBestPricingRule(normalizedService, segment, branchId, weightKg);

        if (!rule) {
          // No rule found, try fallback to traditional pricing
          serviceBreakdowns.push({
            baseCalculation: 0,
            finalPrice: 0,
            pricingRuleName: 'No rule found',
          });
          continue;
        }

        const breakdown = calculatePrice(rule, weightKg, quantity);
        serviceBreakdowns.push(breakdown);
        itemTotal += breakdown.finalPrice;
        totalWeightPortion += breakdown.weightPortion || 0;
        totalDiscount += breakdown.discount || 0;
      }

      if (weightKg) {
        totalWeight += weightKg;
      }

      subtotal += itemTotal;

      calculatedItems.push({
        ...item,
        priceBreakdown: serviceBreakdowns.length === 1
          ? serviceBreakdowns[0]
          : {
              baseCalculation: serviceBreakdowns.reduce((s, b) => s + b.baseCalculation, 0),
              weightPortion: totalWeightPortion > 0 ? totalWeightPortion : undefined,
              discount: totalDiscount > 0 ? totalDiscount : undefined,
              finalPrice: itemTotal,
            },
        totalPrice: itemTotal,
      });
    }

    return NextResponse.json({
      success: true,
      items: calculatedItems,
      summary: {
        itemCount: items.length,
        totalWeight: totalWeight > 0 ? totalWeight : undefined,
        subtotal,
        weightBasedPortion: totalWeightPortion > 0 ? totalWeightPortion : undefined,
        totalDiscount: totalDiscount > 0 ? totalDiscount : undefined,
        total: subtotal,
        customerSegment: segment,
      },
    });
  } catch (error) {
    console.error('Error calculating prices:', error);
    return NextResponse.json(
      { error: 'Failed to calculate prices' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/pricing/calculate - Get pricing info
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const serviceType = searchParams.get('serviceType');

    if (!branchId || !serviceType) {
      return NextResponse.json(
        { error: 'branchId and serviceType are required' },
        { status: 400 }
      );
    }

    // Get available pricing rules for this service
    const snapshot = await adminDb
      .collection('pricingRules')
      .where('isActive', '==', true)
      .where('serviceType', '==', serviceType)
      .orderBy('priority', 'desc')
      .get();

    const rules = snapshot.docs
      .map((doc) => doc.data())
      .filter((rule) => rule.branchId === branchId || rule.branchId === 'ALL');

    // Group by segment
    const bySegment: Record<string, object[]> = {};
    rules.forEach((rule) => {
      const segment = rule.customerSegment || 'regular';
      if (!bySegment[segment]) bySegment[segment] = [];
      bySegment[segment].push({
        ruleId: rule.ruleId,
        ruleName: rule.ruleName,
        pricingType: rule.pricingType,
        basePrice: rule.basePrice,
        pricePerKg: rule.pricePerKg,
        discountPercentage: rule.discountPercentage,
      });
    });

    return NextResponse.json({
      success: true,
      serviceType,
      branchId,
      rulesBySegment: bySegment,
      totalRules: rules.length,
    });
  } catch (error) {
    console.error('Error fetching pricing info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing info' },
      { status: 500 }
    );
  }
}
