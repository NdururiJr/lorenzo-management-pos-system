/**
 * Server-Side Analytics Database Functions
 *
 * This module provides database functions for the analytics agent
 * using Firebase Admin SDK (adminDb). Use these functions ONLY in:
 * - API routes (app/api/*)
 * - Server components
 * - Cloud Functions
 *
 * @module lib/db/server/analytics-db
 */

import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// TYPES
// ============================================

interface TransactionTotals {
  total: number;
  count: number;
  byMethod: {
    mpesa: number;
    card: number;
    credit: number;
    cash: number;
  };
}

interface TodayTransactionSummary {
  total: number;
  count: number;
  mpesa: number;
  card: number;
  credit: number;
}

interface PipelineStats {
  received: number;
  washing: number;
  drying: number;
  ironing: number;
  quality_check: number;
  packaging: number;
  ready: number;
  out_for_delivery: number;
}

interface TopCustomer {
  customerId: string;
  name: string;
  totalSpent: number;
  orderCount: number;
}

interface BranchPerformance {
  branchId: string;
  name: string;
  revenue: number;
  ordersToday: number;
  efficiency: number;
}

interface StaffMetrics {
  overallScore: number;
  ordersProcessed: number;
  avgProcessingTime: number;
}

interface TopPerformer {
  employeeId: string;
  employeeName: string;
  metrics: StaffMetrics;
  rank: number;
}

interface SatisfactionMetrics {
  score: number;
  totalReviews: number;
  breakdown: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

/**
 * Get transaction totals for a date range (Server-side)
 */
export async function getTransactionTotalsServer(
  startDate: Date,
  endDate: Date
): Promise<TransactionTotals> {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const snapshot = await adminDb
      .collection('transactions')
      .where('timestamp', '>=', startTimestamp)
      .where('timestamp', '<=', endTimestamp)
      .where('status', '==', 'completed')
      .get();

    let total = 0;
    let count = 0;
    const byMethod = { mpesa: 0, card: 0, credit: 0, cash: 0 };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const amount = data.amount || 0;
      total += amount;
      count++;

      // Default to 'mpesa' for cashless system (historical cash transactions still tracked)
      const method = (data.method || 'mpesa') as keyof typeof byMethod;
      if (method in byMethod) {
        byMethod[method] += amount;
      }
    });

    return { total, count, byMethod };
  } catch (error) {
    console.error('[Server Analytics DB] Error getting transaction totals:', error);
    return { total: 0, count: 0, byMethod: { mpesa: 0, card: 0, credit: 0, cash: 0 } };
  }
}

/**
 * Get today's transaction summary (Server-side)
 */
export async function getTodayTransactionSummaryServer(): Promise<TodayTransactionSummary> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totals = await getTransactionTotalsServer(today, tomorrow);

  return {
    total: totals.total,
    count: totals.count,
    mpesa: totals.byMethod.mpesa,
    card: totals.byMethod.card,
    credit: totals.byMethod.credit,
  };
}

// ============================================
// ORDER FUNCTIONS
// ============================================

/**
 * Get today's order count for branches (Server-side)
 */
export async function getTodayOrdersCountServer(
  branchIds: string[] | null = null
): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(today);

    let query = adminDb
      .collection('orders')
      .where('createdAt', '>=', startTimestamp);

    if (branchIds && branchIds.length > 0) {
      query = query.where('branchId', 'in', branchIds);
    }

    const snapshot = await query.get();
    return snapshot.size;
  } catch (error) {
    console.error('[Server Analytics DB] Error getting today orders count:', error);
    return 0;
  }
}

/**
 * Get completed orders count today (Server-side)
 */
export async function getCompletedTodayCountServer(
  branchIds: string[] | null = null
): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(today);

    let query = adminDb
      .collection('orders')
      .where('createdAt', '>=', startTimestamp)
      .where('status', 'in', ['delivered', 'collected']);

    if (branchIds && branchIds.length > 0) {
      query = query.where('branchId', 'in', branchIds);
    }

    const snapshot = await query.get();
    return snapshot.size;
  } catch (error) {
    console.error('[Server Analytics DB] Error getting completed count:', error);
    return 0;
  }
}

/**
 * Get today's revenue for branches (Server-side)
 */
export async function getTodayRevenueServer(
  branchIds: string[] | null = null
): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(today);

    let query = adminDb
      .collection('transactions')
      .where('timestamp', '>=', startTimestamp)
      .where('status', '==', 'completed');

    if (branchIds && branchIds.length > 0) {
      query = query.where('branchId', 'in', branchIds);
    }

    const snapshot = await query.get();
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
  } catch (error) {
    console.error('[Server Analytics DB] Error getting today revenue:', error);
    return 0;
  }
}

/**
 * Get pipeline stats for a branch (Server-side)
 */
export async function getPipelineStatsServer(
  branchId: string
): Promise<PipelineStats> {
  try {
    const snapshot = await adminDb
      .collection('orders')
      .where('branchId', '==', branchId)
      .where('status', 'not-in', ['delivered', 'collected', 'cancelled'])
      .get();

    const stats: PipelineStats = {
      received: 0,
      washing: 0,
      drying: 0,
      ironing: 0,
      quality_check: 0,
      packaging: 0,
      ready: 0,
      out_for_delivery: 0,
    };

    snapshot.docs.forEach((doc) => {
      const status = doc.data().status as keyof PipelineStats;
      if (status in stats) {
        stats[status]++;
      }
    });

    return stats;
  } catch (error) {
    console.error('[Server Analytics DB] Error getting pipeline stats:', error);
    return {
      received: 0,
      washing: 0,
      drying: 0,
      ironing: 0,
      quality_check: 0,
      packaging: 0,
      ready: 0,
      out_for_delivery: 0,
    };
  }
}

// ============================================
// CUSTOMER FUNCTIONS
// ============================================

/**
 * Get top customers by total spent (Server-side)
 */
export async function getTopCustomersServer(limit: number = 5): Promise<TopCustomer[]> {
  try {
    const snapshot = await adminDb
      .collection('customers')
      .orderBy('totalSpent', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        customerId: doc.id,
        name: data.name || 'Unknown',
        totalSpent: data.totalSpent || 0,
        orderCount: data.orderCount || 0,
      };
    });
  } catch (error) {
    console.error('[Server Analytics DB] Error getting top customers:', error);
    return [];
  }
}

// ============================================
// BRANCH FUNCTIONS
// ============================================

/**
 * Get branch performance metrics (Server-side)
 */
export async function getBranchPerformanceServer(
  branchId?: string
): Promise<BranchPerformance[]> {
  try {
    let query = adminDb.collection('branches').where('active', '==', true);

    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    const branchesSnapshot = await query.get();
    const branches = branchesSnapshot.docs.map((doc) => ({
      branchId: doc.data().branchId || doc.id,
      name: doc.data().name || 'Unknown Branch',
    }));

    // Get today's stats for each branch
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(today);

    const performancePromises = branches.map(async (branch) => {
      const [ordersSnapshot, transactionsSnapshot] = await Promise.all([
        adminDb
          .collection('orders')
          .where('branchId', '==', branch.branchId)
          .where('createdAt', '>=', startTimestamp)
          .get(),
        adminDb
          .collection('transactions')
          .where('branchId', '==', branch.branchId)
          .where('timestamp', '>=', startTimestamp)
          .where('status', '==', 'completed')
          .get(),
      ]);

      const ordersToday = ordersSnapshot.size;
      const revenue = transactionsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0),
        0
      );

      // Calculate efficiency (completed / total * 100)
      const completedOrders = ordersSnapshot.docs.filter((doc) =>
        ['delivered', 'collected'].includes(doc.data().status)
      ).length;
      const efficiency = ordersToday > 0 ? Math.round((completedOrders / ordersToday) * 100) : 0;

      return {
        branchId: branch.branchId,
        name: branch.name,
        revenue,
        ordersToday,
        efficiency,
      };
    });

    return Promise.all(performancePromises);
  } catch (error) {
    console.error('[Server Analytics DB] Error getting branch performance:', error);
    return [];
  }
}

// ============================================
// STAFF FUNCTIONS
// ============================================

/**
 * Get top performers in a branch (Server-side)
 */
export async function getTopPerformersServer(
  branchId: string,
  limit: number = 5
): Promise<TopPerformer[]> {
  try {
    const snapshot = await adminDb
      .collection('employees')
      .where('branchId', '==', branchId)
      .where('active', '==', true)
      .limit(limit * 2) // Get extra to filter
      .get();

    // Mock performance scores for now (in production, this would come from a performance collection)
    const performers: TopPerformer[] = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        employeeId: doc.id,
        employeeName: data.name || 'Unknown Employee',
        metrics: {
          overallScore: Math.max(60, 100 - index * 5), // Mock decreasing scores
          ordersProcessed: Math.floor(Math.random() * 50) + 10,
          avgProcessingTime: Math.random() * 2 + 0.5,
        },
        rank: index + 1,
      };
    });

    return performers.slice(0, limit);
  } catch (error) {
    console.error('[Server Analytics DB] Error getting top performers:', error);
    return [];
  }
}

// ============================================
// DELIVERY FUNCTIONS
// ============================================

/**
 * Get delivery counts (Server-side)
 */
export async function getDeliveriesCountServer(
  branchIds: string[] | null = null,
  status?: string
): Promise<number> {
  try {
    const collectionRef = adminDb.collection('deliveries');

    // Build query based on status filter
    const query = status
      ? collectionRef.where('status', '==', status)
      : collectionRef;

    // Note: Firestore doesn't support array containsAny with other filters well
    // So we fetch all and filter in memory for branchIds
    const snapshot = await query.get();

    if (!branchIds || branchIds.length === 0) {
      return snapshot.size;
    }

    // Filter by branch
    return snapshot.docs.filter((doc) => {
      const data = doc.data();
      return branchIds.includes(data.branchId);
    }).length;
  } catch (error) {
    console.error('[Server Analytics DB] Error getting deliveries count:', error);
    return 0;
  }
}

// ============================================
// SATISFACTION FUNCTIONS
// ============================================

/**
 * Get satisfaction metrics (Server-side)
 */
export async function getSatisfactionMetricsServer(
  branchId?: string
): Promise<SatisfactionMetrics> {
  try {
    const collectionRef = adminDb.collection('feedback');

    // Build query based on branch filter
    const query = branchId
      ? collectionRef.where('branchId', '==', branchId)
      : collectionRef;

    const snapshot = await query.limit(100).get();

    if (snapshot.empty) {
      return {
        score: 0,
        totalReviews: 0,
        breakdown: { excellent: 0, good: 0, average: 0, poor: 0 },
      };
    }

    let totalScore = 0;
    const breakdown = { excellent: 0, good: 0, average: 0, poor: 0 };

    snapshot.docs.forEach((doc) => {
      const rating = doc.data().rating || 0;
      totalScore += rating;

      if (rating >= 4.5) breakdown.excellent++;
      else if (rating >= 3.5) breakdown.good++;
      else if (rating >= 2.5) breakdown.average++;
      else breakdown.poor++;
    });

    return {
      score: Math.round((totalScore / snapshot.size) * 10) / 10,
      totalReviews: snapshot.size,
      breakdown,
    };
  } catch (error) {
    console.error('[Server Analytics DB] Error getting satisfaction metrics:', error);
    return {
      score: 0,
      totalReviews: 0,
      breakdown: { excellent: 0, good: 0, average: 0, poor: 0 },
    };
  }
}
