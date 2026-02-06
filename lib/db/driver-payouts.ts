/**
 * Driver Payout Database Operations (FR-009)
 *
 * Handles driver payout management including:
 * - Commission calculation
 * - Payout creation and tracking
 * - Settlement period management
 *
 * @module lib/db/driver-payouts
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  DatabaseError,
} from './index';
import type {
  DriverPayout,
  CommissionRule,
  PayoutStatus,
  PayoutMethod,
  CommissionType,
  Delivery,
  User,
} from './schema';

// ============================================
// CONSTANTS
// ============================================

/** Default settlement period in days */
export const DEFAULT_SETTLEMENT_PERIOD_DAYS = 7;

/** Default commission rate per delivery (KES) */
export const DEFAULT_COMMISSION_RATE = 100;

// ============================================
// ID GENERATION
// ============================================

/**
 * Generate a unique payout ID
 * Format: PAY-[YYYYMMDD]-[XXXX]
 */
export function generatePayoutId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${dateStr}-${random}`;
}

/**
 * Generate a unique commission rule ID
 * Format: RULE-[XXXX]-[YYYY]
 */
export function generateCommissionRuleId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RULE-${timestamp}-${random}`;
}

// ============================================
// COMMISSION RULES CRUD
// ============================================

/**
 * Create a new commission rule
 */
export async function createCommissionRule(
  data: Omit<CommissionRule, 'ruleId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ruleId = generateCommissionRuleId();
  const now = Timestamp.now();

  const rule: CommissionRule = {
    ruleId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument<CommissionRule>('commissionRules', ruleId, rule);
  return ruleId;
}

/**
 * Get a commission rule by ID
 */
export async function getCommissionRule(ruleId: string): Promise<CommissionRule> {
  return getDocument<CommissionRule>('commissionRules', ruleId);
}

/**
 * Get all active commission rules
 */
export async function getActiveCommissionRules(): Promise<CommissionRule[]> {
  return getDocuments<CommissionRule>(
    'commissionRules',
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Get commission rules for a specific branch
 */
export async function getCommissionRulesForBranch(
  branchId: string
): Promise<CommissionRule[]> {
  const rules = await getActiveCommissionRules();
  return rules.filter((rule) => rule.branchId === branchId || rule.branchId === 'ALL');
}

/**
 * Update a commission rule
 */
export async function updateCommissionRule(
  ruleId: string,
  data: Partial<Omit<CommissionRule, 'ruleId' | 'createdAt'>>
): Promise<void> {
  await updateDocument<CommissionRule>('commissionRules', ruleId, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a commission rule
 */
export async function deleteCommissionRule(ruleId: string): Promise<void> {
  await deleteDocument('commissionRules', ruleId);
}

// ============================================
// COMMISSION CALCULATION
// ============================================

/**
 * Calculate commission for a set of deliveries
 */
export async function calculateCommission(
  deliveries: Delivery[],
  branchId: string
): Promise<{
  totalAmount: number;
  baseAmount: number;
  bonusAmount: number;
  deliveryCount: number;
  commissionRate: number;
  ruleApplied: CommissionRule | null;
}> {
  // Get applicable commission rule
  const rules = await getCommissionRulesForBranch(branchId);
  const rule = rules.length > 0 ? rules[0] : null;

  const deliveryCount = deliveries.length;
  let baseAmount = 0;
  let bonusAmount = 0;
  let commissionRate = DEFAULT_COMMISSION_RATE;

  if (rule) {
    commissionRate = rule.baseAmount;

    switch (rule.commissionType) {
      case 'per_delivery':
        baseAmount = deliveryCount * rule.baseAmount;
        break;

      case 'percentage':
        // Calculate based on total delivery distance as proxy for value
        // In production, this would sum order values from the orders collection
        const totalDeliveryDistance = deliveries.reduce((sum, d) => {
          return sum + (d.route?.distance || 0);
        }, 0);
        // Convert distance (meters) to a value factor (1km = 100 KES base)
        const distanceValue = (totalDeliveryDistance / 1000) * 100;
        baseAmount = Math.round(distanceValue * (rule.baseAmount / 100));
        break;

      case 'tiered':
        if (rule.tiers && rule.tiers.length > 0) {
          // Find applicable tier
          const tier = rule.tiers
            .sort((a, b) => b.minDeliveries - a.minDeliveries)
            .find((t) => deliveryCount >= t.minDeliveries);

          if (tier) {
            commissionRate = tier.ratePerDelivery;
            baseAmount = deliveryCount * tier.ratePerDelivery;
          } else {
            // Use lowest tier
            const lowestTier = rule.tiers.sort(
              (a, b) => a.minDeliveries - b.minDeliveries
            )[0];
            commissionRate = lowestTier.ratePerDelivery;
            baseAmount = deliveryCount * lowestTier.ratePerDelivery;
          }
        }
        break;
    }

    // Check for bonus
    if (rule.bonusThreshold && rule.bonusAmount && deliveryCount >= rule.bonusThreshold) {
      bonusAmount = rule.bonusAmount;
    }
  } else {
    // Default calculation if no rule exists
    baseAmount = deliveryCount * DEFAULT_COMMISSION_RATE;
  }

  return {
    totalAmount: baseAmount + bonusAmount,
    baseAmount,
    bonusAmount,
    deliveryCount,
    commissionRate,
    ruleApplied: rule,
  };
}

// ============================================
// DRIVER PAYOUT CRUD
// ============================================

/**
 * Create a new driver payout
 */
export async function createDriverPayout(
  data: Omit<DriverPayout, 'payoutId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const payoutId = generatePayoutId();
  const now = Timestamp.now();

  const payout: DriverPayout = {
    payoutId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument<DriverPayout>('driverPayouts', payoutId, payout);
  return payoutId;
}

/**
 * Get a driver payout by ID
 */
export async function getDriverPayout(payoutId: string): Promise<DriverPayout> {
  return getDocument<DriverPayout>('driverPayouts', payoutId);
}

/**
 * Get all payouts for a driver
 */
export async function getDriverPayouts(
  driverId: string,
  limitCount: number = 50
): Promise<DriverPayout[]> {
  return getDocuments<DriverPayout>(
    'driverPayouts',
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get payouts by status
 */
export async function getPayoutsByStatus(
  status: PayoutStatus,
  limitCount: number = 100
): Promise<DriverPayout[]> {
  return getDocuments<DriverPayout>(
    'driverPayouts',
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get pending payouts for a branch
 */
export async function getPendingPayoutsForBranch(
  branchId: string
): Promise<DriverPayout[]> {
  return getDocuments<DriverPayout>(
    'driverPayouts',
    where('branchId', '==', branchId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Update a driver payout
 */
export async function updateDriverPayout(
  payoutId: string,
  data: Partial<Omit<DriverPayout, 'payoutId' | 'createdAt'>>
): Promise<void> {
  await updateDocument<DriverPayout>('driverPayouts', payoutId, data);
}

/**
 * Mark payout as processing
 */
export async function markPayoutProcessing(
  payoutId: string,
  processedBy: string
): Promise<void> {
  await updateDocument<DriverPayout>('driverPayouts', payoutId, {
    status: 'processing',
    processedBy,
    processedAt: Timestamp.now(),
  });
}

/**
 * Mark payout as completed
 */
export async function markPayoutCompleted(
  payoutId: string,
  mpesaRef?: string
): Promise<void> {
  await updateDocument<DriverPayout>('driverPayouts', payoutId, {
    status: 'completed',
    mpesaRef,
    processedAt: Timestamp.now(),
  });
}

/**
 * Mark payout as failed
 */
export async function markPayoutFailed(
  payoutId: string,
  failureReason: string
): Promise<void> {
  await updateDocument<DriverPayout>('driverPayouts', payoutId, {
    status: 'failed',
    failureReason,
  });
}

// ============================================
// SETTLEMENT PERIOD HELPERS
// ============================================

/**
 * Get settlement period dates (default: last 7 days)
 */
export function getSettlementPeriod(days: number = DEFAULT_SETTLEMENT_PERIOD_DAYS): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

/**
 * Get unpaid deliveries for a driver within a settlement period
 */
export async function getUnpaidDeliveries(
  driverId: string,
  startDate: Date,
  endDate: Date
): Promise<Delivery[]> {
  const deliveries = await getDocuments<Delivery>(
    'deliveries',
    where('driverId', '==', driverId),
    where('status', '==', 'completed'),
    where('endTime', '>=', Timestamp.fromDate(startDate)),
    where('endTime', '<=', Timestamp.fromDate(endDate)),
    orderBy('endTime', 'desc')
  );

  // Filter out deliveries that have already been included in a payout
  const existingPayouts = await getDriverPayouts(driverId);
  const paidDeliveryIds = new Set(
    existingPayouts.flatMap((p) => p.deliveryIds)
  );

  return deliveries.filter((d) => !paidDeliveryIds.has(d.deliveryId));
}

// ============================================
// PAYOUT CREATION WORKFLOW
// ============================================

/**
 * Create a payout for a driver's unpaid deliveries
 */
export async function createPayoutForDriver(
  driverId: string,
  branchId: string,
  paymentMethod: PayoutMethod = 'mpesa'
): Promise<{
  payoutId: string;
  amount: number;
  deliveryCount: number;
  success: boolean;
  error?: string;
}> {
  try {
    // Get driver info
    const driver = await getDocument<User>('users', driverId);
    if (!driver) {
      return {
        payoutId: '',
        amount: 0,
        deliveryCount: 0,
        success: false,
        error: 'Driver not found',
      };
    }

    // Get settlement period
    const { startDate, endDate } = getSettlementPeriod();

    // Get unpaid deliveries
    const deliveries = await getUnpaidDeliveries(driverId, startDate, endDate);

    if (deliveries.length === 0) {
      return {
        payoutId: '',
        amount: 0,
        deliveryCount: 0,
        success: false,
        error: 'No unpaid deliveries found for this period',
      };
    }

    // Calculate commission
    const commission = await calculateCommission(deliveries, branchId);

    // Create payout record
    const payoutId = await createDriverPayout({
      driverId,
      driverName: driver.name || 'Unknown',
      driverPhone: driver.phone || '',
      branchId,
      amount: commission.totalAmount,
      paymentMethod,
      status: 'pending',
      deliveryIds: deliveries.map((d) => d.deliveryId),
      deliveryCount: commission.deliveryCount,
      commissionRuleId: commission.ruleApplied?.ruleId || 'DEFAULT',
      commissionRate: commission.commissionRate,
      baseCommission: commission.baseAmount,
      bonusAmount: commission.bonusAmount,
      deductions: 0,
      periodStart: Timestamp.fromDate(startDate),
      periodEnd: Timestamp.fromDate(endDate),
    });

    return {
      payoutId,
      amount: commission.totalAmount,
      deliveryCount: commission.deliveryCount,
      success: true,
    };
  } catch (error) {
    console.error('Error creating payout:', error);
    return {
      payoutId: '',
      amount: 0,
      deliveryCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// REPORTING
// ============================================

/**
 * Get payout statistics for a period
 */
export async function getPayoutStats(
  branchId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalPayouts: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  completedCount: number;
  completedAmount: number;
  failedCount: number;
}> {
  let payouts: DriverPayout[];

  if (branchId) {
    payouts = await getDocuments<DriverPayout>(
      'driverPayouts',
      where('branchId', '==', branchId),
      orderBy('createdAt', 'desc'),
      limit(1000)
    );
  } else {
    payouts = await getDocuments<DriverPayout>(
      'driverPayouts',
      orderBy('createdAt', 'desc'),
      limit(1000)
    );
  }

  // Filter by date if provided
  if (startDate || endDate) {
    payouts = payouts.filter((p) => {
      const payoutDate = p.createdAt.toDate();
      if (startDate && payoutDate < startDate) return false;
      if (endDate && payoutDate > endDate) return false;
      return true;
    });
  }

  const stats = {
    totalPayouts: payouts.length,
    totalAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    completedCount: 0,
    completedAmount: 0,
    failedCount: 0,
  };

  payouts.forEach((p) => {
    stats.totalAmount += p.amount;

    switch (p.status) {
      case 'pending':
      case 'processing':
        stats.pendingCount++;
        stats.pendingAmount += p.amount;
        break;
      case 'completed':
        stats.completedCount++;
        stats.completedAmount += p.amount;
        break;
      case 'failed':
        stats.failedCount++;
        break;
    }
  });

  return stats;
}

/**
 * Get driver's total earnings
 */
export async function getDriverEarnings(
  driverId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalEarnings: number;
  paidAmount: number;
  pendingAmount: number;
  deliveryCount: number;
  payoutCount: number;
}> {
  const payouts = await getDriverPayouts(driverId);

  // Filter by date if provided
  const filteredPayouts = payouts.filter((p) => {
    const payoutDate = p.createdAt.toDate();
    if (startDate && payoutDate < startDate) return false;
    if (endDate && payoutDate > endDate) return false;
    return true;
  });

  const stats = {
    totalEarnings: 0,
    paidAmount: 0,
    pendingAmount: 0,
    deliveryCount: 0,
    payoutCount: filteredPayouts.length,
  };

  filteredPayouts.forEach((p) => {
    stats.totalEarnings += p.amount;
    stats.deliveryCount += p.deliveryCount;

    if (p.status === 'completed') {
      stats.paidAmount += p.amount;
    } else if (p.status === 'pending' || p.status === 'processing') {
      stats.pendingAmount += p.amount;
    }
  });

  return stats;
}

// ============================================
// SEED DATA
// ============================================

/**
 * Seed default commission rules for a branch
 */
export async function seedDefaultCommissionRules(branchId: string): Promise<void> {
  const defaultRules: Omit<CommissionRule, 'ruleId' | 'createdAt' | 'updatedAt'>[] = [
    {
      branchId,
      name: 'Standard Per-Delivery Commission',
      commissionType: 'per_delivery',
      baseAmount: 100, // KES 100 per delivery
      active: true,
    },
    {
      branchId,
      name: 'High Volume Tiered Commission',
      commissionType: 'tiered',
      baseAmount: 100,
      tiers: [
        { minDeliveries: 1, maxDeliveries: 10, ratePerDelivery: 100 },
        { minDeliveries: 11, maxDeliveries: 25, ratePerDelivery: 120 },
        { minDeliveries: 26, maxDeliveries: 50, ratePerDelivery: 150 },
        { minDeliveries: 51, maxDeliveries: 9999, ratePerDelivery: 200 },
      ],
      bonusThreshold: 30,
      bonusAmount: 500, // KES 500 bonus for 30+ deliveries
      active: false, // Alternative rule, not active by default
    },
  ];

  for (const rule of defaultRules) {
    await createCommissionRule(rule);
  }
}
