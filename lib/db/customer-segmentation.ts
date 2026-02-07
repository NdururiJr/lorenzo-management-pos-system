/**
 * Customer Segmentation Service (FR-017)
 *
 * Provides customer segmentation functionality including:
 * - Segment evaluation (regular, VIP, corporate)
 * - VIP promotion based on order history
 * - Corporate agreement management
 * - Customer statistics tracking
 *
 * @module lib/db/customer-segmentation
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
  Customer,
  CustomerSegment,
  CorporateAgreement,
  CustomerStatistics,
  Order,
} from './schema';

// ============================================
// CONSTANTS
// ============================================

/** VIP qualification thresholds */
export const VIP_THRESHOLDS = {
  /** Minimum orders in last 12 months to qualify for VIP */
  minOrders: 10,
  /** Minimum spend in last 12 months to qualify for VIP (KES) */
  minSpend: 50000,
  /** Period in months for evaluation */
  periodMonths: 12,
};

/** Segment priority (higher = better perks) */
export const SEGMENT_PRIORITY: Record<CustomerSegment, number> = {
  regular: 1,
  vip: 2,
  corporate: 3,
};

// ============================================
// SEGMENT EVALUATION
// ============================================

/**
 * Evaluate and update customer segment
 *
 * @param customerId - Customer ID
 * @returns Updated segment
 */
export async function evaluateCustomerSegment(customerId: string): Promise<CustomerSegment> {
  try {
    const customer = await getDocument<Customer>('customers', customerId);

    // Check for corporate status first (highest priority)
    if (customer.corporateAgreementId) {
      // Verify agreement is active
      try {
        const agreement = await getDocument<CorporateAgreement>(
          'corporateAgreements',
          customer.corporateAgreementId
        );
        if (agreement.isActive) {
          if (customer.segment !== 'corporate') {
            await updateDocument<Customer>('customers', customerId, {
              segment: 'corporate',
              lastSegmentEvaluation: Timestamp.now(),
            });
          }
          return 'corporate';
        }
      } catch {
        // Agreement doesn't exist or is invalid, continue evaluation
      }
    }

    // Calculate statistics for VIP evaluation
    const stats = await getOrCreateCustomerStatistics(customerId);

    // Check VIP criteria
    const qualifiesForVIP =
      stats.last12MonthsOrders >= VIP_THRESHOLDS.minOrders ||
      stats.last12MonthsSpend >= VIP_THRESHOLDS.minSpend;

    if (qualifiesForVIP) {
      if (customer.segment !== 'vip') {
        await promoteToVIP(customerId);
      }
      return 'vip';
    }

    // Check if needs demotion from VIP
    if (customer.segment === 'vip') {
      await updateDocument<Customer>('customers', customerId, {
        segment: 'regular',
        lastSegmentEvaluation: Timestamp.now(),
      });
    }

    return 'regular';
  } catch (error) {
    throw new DatabaseError('Failed to evaluate customer segment', error);
  }
}

/**
 * Promote customer to VIP status
 *
 * @param customerId - Customer ID
 */
export async function promoteToVIP(customerId: string): Promise<void> {
  await updateDocument<Customer>('customers', customerId, {
    segment: 'vip',
    vipQualifiedAt: Timestamp.now(),
    lastSegmentEvaluation: Timestamp.now(),
  });

  // Update statistics with new segment
  await updateDocument<CustomerStatistics>('customerStatistics', customerId, {
    currentSegment: 'vip',
    updatedAt: Timestamp.now(),
  });

  // TODO: Trigger VIP promotion notification
  // await sendVIPPromotionNotification(customerId);
}

/**
 * Get customer's current segment
 *
 * @param customerId - Customer ID
 * @returns Customer segment
 */
export async function getCustomerSegment(customerId: string): Promise<CustomerSegment> {
  try {
    const customer = await getDocument<Customer>('customers', customerId);
    return customer.segment || 'regular';
  } catch {
    return 'regular';
  }
}

// ============================================
// CUSTOMER STATISTICS
// ============================================

/**
 * Get or create customer statistics
 *
 * @param customerId - Customer ID
 * @returns Customer statistics
 */
export async function getOrCreateCustomerStatistics(
  customerId: string
): Promise<CustomerStatistics> {
  try {
    return await getDocument<CustomerStatistics>('customerStatistics', customerId);
  } catch {
    // Statistics don't exist, create them
    return await updateCustomerStatistics(customerId);
  }
}

/**
 * Update customer statistics based on order history
 *
 * @param customerId - Customer ID
 * @returns Updated statistics
 */
export async function updateCustomerStatistics(
  customerId: string
): Promise<CustomerStatistics> {
  const customer = await getDocument<Customer>('customers', customerId);

  // Calculate 12 months ago
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  // Get orders from last 12 months
  const recentOrders = await getDocuments<Order>(
    'orders',
    where('customerId', '==', customerId),
    where('createdAt', '>=', Timestamp.fromDate(twelveMonthsAgo)),
    where('status', 'in', ['delivered', 'collected']),
    orderBy('createdAt', 'desc'),
    limit(500)
  );

  // Calculate statistics
  let last12MonthsSpend = 0;
  let lastOrderDate: Date | undefined;

  recentOrders.forEach((order) => {
    last12MonthsSpend += order.totalAmount || 0;
    if (!lastOrderDate) {
      lastOrderDate = order.createdAt?.toDate?.();
    }
  });

  const totalOrders = customer.orderCount || 0;
  const totalSpend = customer.totalSpent || 0;
  const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : undefined;

  const stats: CustomerStatistics = {
    customerId,
    totalOrders,
    totalSpend,
    lastOrderDate: lastOrderDate ? Timestamp.fromDate(lastOrderDate) : undefined,
    last12MonthsOrders: recentOrders.length,
    last12MonthsSpend,
    avgOrderValue: Math.round(avgOrderValue),
    daysSinceLastOrder,
    currentSegment: customer.segment || 'regular',
    updatedAt: Timestamp.now(),
  };

  await setDocument<CustomerStatistics>('customerStatistics', customerId, stats);

  return stats;
}

/**
 * Refresh statistics for all customers (batch job)
 * Should be run periodically (e.g., daily)
 *
 * @param limitCount - Maximum customers to process
 * @returns Number of customers processed
 */
export async function refreshAllCustomerStatistics(limitCount = 100): Promise<number> {
  const customers = await getDocuments<Customer>(
    'customers',
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  let processed = 0;

  for (const customer of customers) {
    try {
      await updateCustomerStatistics(customer.customerId);
      await evaluateCustomerSegment(customer.customerId);
      processed++;
    } catch (error) {
      console.error(`Failed to update statistics for ${customer.customerId}:`, error);
    }
  }

  return processed;
}

// ============================================
// CORPORATE AGREEMENT MANAGEMENT
// ============================================

/**
 * Generate unique agreement ID
 */
export function generateAgreementId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `AGR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a corporate agreement
 *
 * @param data - Agreement data
 * @returns Created agreement ID
 */
export async function createCorporateAgreement(
  data: Omit<CorporateAgreement, 'agreementId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const agreementId = generateAgreementId();

  const agreement: CorporateAgreement = {
    agreementId,
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDocument<CorporateAgreement>('corporateAgreements', agreementId, agreement);
  return agreementId;
}

/**
 * Get corporate agreement by ID
 */
export async function getCorporateAgreement(agreementId: string): Promise<CorporateAgreement> {
  return getDocument<CorporateAgreement>('corporateAgreements', agreementId);
}

/**
 * Get all active corporate agreements
 */
export async function getActiveCorporateAgreements(): Promise<CorporateAgreement[]> {
  return getDocuments<CorporateAgreement>(
    'corporateAgreements',
    where('isActive', '==', true),
    orderBy('companyName', 'asc')
  );
}

/**
 * Update corporate agreement
 */
export async function updateCorporateAgreement(
  agreementId: string,
  data: Partial<Omit<CorporateAgreement, 'agreementId' | 'createdAt'>>
): Promise<void> {
  await updateDocument<CorporateAgreement>('corporateAgreements', agreementId, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Link customer to corporate agreement
 *
 * @param customerId - Customer ID
 * @param agreementId - Corporate agreement ID
 */
export async function linkCustomerToCorporate(
  customerId: string,
  agreementId: string
): Promise<void> {
  // Verify agreement exists and is active
  const agreement = await getCorporateAgreement(agreementId);
  if (!agreement.isActive) {
    throw new DatabaseError('Corporate agreement is not active');
  }

  // Update customer
  await updateDocument<Customer>('customers', customerId, {
    segment: 'corporate',
    corporateAgreementId: agreementId,
    lastSegmentEvaluation: Timestamp.now(),
  });

  // Update statistics
  try {
    await updateDocument<CustomerStatistics>('customerStatistics', customerId, {
      currentSegment: 'corporate',
      updatedAt: Timestamp.now(),
    });
  } catch {
    // Statistics might not exist yet
  }
}

/**
 * Unlink customer from corporate agreement
 *
 * @param customerId - Customer ID
 */
export async function unlinkCustomerFromCorporate(customerId: string): Promise<void> {
  // Remove corporate link and re-evaluate segment
  await updateDocument<Customer>('customers', customerId, {
    corporateAgreementId: undefined,
    lastSegmentEvaluation: Timestamp.now(),
  });

  // Re-evaluate segment (might be VIP or regular)
  await evaluateCustomerSegment(customerId);
}

/**
 * Get all customers linked to a corporate agreement
 *
 * @param agreementId - Agreement ID
 * @returns Array of customers
 */
export async function getCorporateCustomers(agreementId: string): Promise<Customer[]> {
  return getDocuments<Customer>(
    'customers',
    where('corporateAgreementId', '==', agreementId),
    orderBy('name', 'asc')
  );
}

/**
 * Deactivate corporate agreement
 *
 * @param agreementId - Agreement ID
 * @param unlinkCustomers - Whether to unlink all customers
 */
export async function deactivateCorporateAgreement(
  agreementId: string,
  unlinkCustomers: boolean = false
): Promise<void> {
  await updateDocument<CorporateAgreement>('corporateAgreements', agreementId, {
    isActive: false,
    updatedAt: Timestamp.now(),
  });

  if (unlinkCustomers) {
    const customers = await getCorporateCustomers(agreementId);
    for (const customer of customers) {
      await unlinkCustomerFromCorporate(customer.customerId);
    }
  }
}

// ============================================
// SEGMENT QUERIES
// ============================================

/**
 * Get customers by segment
 *
 * @param segment - Customer segment
 * @param limitCount - Maximum results
 * @returns Array of customers
 */
export async function getCustomersBySegment(
  segment: CustomerSegment,
  limitCount = 50
): Promise<Customer[]> {
  return getDocuments<Customer>(
    'customers',
    where('segment', '==', segment),
    orderBy('totalSpent', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get VIP customers
 */
export async function getVIPCustomers(limitCount = 50): Promise<Customer[]> {
  return getCustomersBySegment('vip', limitCount);
}

/**
 * Get customers approaching VIP status
 * (Within 80% of either threshold)
 *
 * @param limitCount - Maximum results
 * @returns Array of customers with their progress
 */
export async function getCustomersApproachingVIP(
  limitCount = 50
): Promise<Array<Customer & { vipProgress: { orders: number; spend: number } }>> {
  // Get regular customers with significant activity
  const customers = await getDocuments<Customer>(
    'customers',
    where('segment', '==', 'regular'),
    orderBy('totalSpent', 'desc'),
    limit(100)
  );

  const approaching = [];

  for (const customer of customers) {
    try {
      const stats = await getOrCreateCustomerStatistics(customer.customerId);

      const orderProgress = (stats.last12MonthsOrders / VIP_THRESHOLDS.minOrders) * 100;
      const spendProgress = (stats.last12MonthsSpend / VIP_THRESHOLDS.minSpend) * 100;

      // Check if approaching (>= 60% of either threshold)
      if (orderProgress >= 60 || spendProgress >= 60) {
        approaching.push({
          ...customer,
          vipProgress: {
            orders: Math.round(orderProgress),
            spend: Math.round(spendProgress),
          },
        });
      }
    } catch {
      // Skip customers without statistics
    }

    if (approaching.length >= limitCount) break;
  }

  return approaching;
}

/**
 * Get segment statistics summary
 */
export async function getSegmentSummary(): Promise<{
  regular: number;
  vip: number;
  corporate: number;
  total: number;
}> {
  const [regular, vip, corporate] = await Promise.all([
    getDocuments<Customer>('customers', where('segment', '==', 'regular'), limit(1000)),
    getDocuments<Customer>('customers', where('segment', '==', 'vip'), limit(1000)),
    getDocuments<Customer>('customers', where('segment', '==', 'corporate'), limit(1000)),
  ]);

  return {
    regular: regular.length,
    vip: vip.length,
    corporate: corporate.length,
    total: regular.length + vip.length + corporate.length,
  };
}
