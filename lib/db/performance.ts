/**
 * Performance Service
 *
 * Calculates staff performance metrics including customer satisfaction,
 * accuracy, and efficiency scores. Supports multiple time periods with
 * real calendar synchronization.
 *
 * @module lib/db/performance
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  StaffMetrics,
  TimePeriod,
  PerformanceHistoryItem,
  DashboardMetrics,
  Order,
  CustomerFeedback,
  ProcessingBenchmarks,
  Garment,
} from './schema';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  format,
} from 'date-fns';
import { getAttendanceStats } from './attendance';

// Collections
const ORDERS_COLLECTION = 'orders';
const FEEDBACK_COLLECTION = 'customerFeedback';
const EMPLOYEES_COLLECTION = 'employees';

/**
 * Date range with label
 */
export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Default processing benchmarks (minutes per garment)
 */
const DEFAULT_BENCHMARKS: ProcessingBenchmarks = {
  benchmarkId: 'default',
  branchId: 'default',
  times: {
    inspection: 3,
    washing: 45,
    drying: 30,
    ironing: 8,
    quality_check: 2,
    packaging: 2,
  },
  batchSizes: {
    washing: 20,
    drying: 20,
  },
  targetGarmentsPerHour: 8,
  targetOrdersPerDay: 15,
  updatedAt: Timestamp.now(),
  updatedBy: 'system',
};

/**
 * Targets for different time periods
 */
const PERIOD_TARGETS: Record<TimePeriod, { orders: number; garments: number }> = {
  daily: { orders: 15, garments: 45 },
  weekly: { orders: 90, garments: 270 },
  monthly: { orders: 360, garments: 1080 },
  quarterly: { orders: 1080, garments: 3240 },
  yearly: { orders: 4320, garments: 12960 },
};

/**
 * Get date range for a specific time period
 * Synchronized with real calendar (Kenya uses Monday as week start)
 */
export function getDateRangeForPeriod(
  period: TimePeriod,
  referenceDate: Date = new Date()
): DateRange {
  const weekOptions = { weekStartsOn: 1 as const }; // Monday

  switch (period) {
    case 'daily':
      return {
        start: startOfDay(referenceDate),
        end: endOfDay(referenceDate),
        label: format(referenceDate, 'EEEE, MMM d, yyyy'),
      };
    case 'weekly':
      return {
        start: startOfWeek(referenceDate, weekOptions),
        end: endOfWeek(referenceDate, weekOptions),
        label: `Week of ${format(startOfWeek(referenceDate, weekOptions), 'MMM d')}`,
      };
    case 'monthly':
      return {
        start: startOfMonth(referenceDate),
        end: endOfMonth(referenceDate),
        label: format(referenceDate, 'MMMM yyyy'),
      };
    case 'quarterly':
      return {
        start: startOfQuarter(referenceDate),
        end: endOfQuarter(referenceDate),
        label: `Q${Math.ceil((referenceDate.getMonth() + 1) / 3)} ${format(referenceDate, 'yyyy')}`,
      };
    case 'yearly':
      return {
        start: startOfYear(referenceDate),
        end: endOfYear(referenceDate),
        label: format(referenceDate, 'yyyy'),
      };
  }
}

/**
 * Navigate to previous period
 */
export function getPreviousPeriod(period: TimePeriod, referenceDate: Date): Date {
  switch (period) {
    case 'daily':
      return subDays(referenceDate, 1);
    case 'weekly':
      return subWeeks(referenceDate, 1);
    case 'monthly':
      return subMonths(referenceDate, 1);
    case 'quarterly':
      return subQuarters(referenceDate, 1);
    case 'yearly':
      return subYears(referenceDate, 1);
  }
}

/**
 * Get orders processed by a staff member in a date range
 */
async function getOrdersHandledByStaff(
  staffId: string,
  dateRange: DateRange
): Promise<Order[]> {
  // Query orders within the date range
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
    where('createdAt', '<=', Timestamp.fromDate(dateRange.end)),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(ordersQuery);
  const allOrders = snapshot.docs.map(doc => doc.data() as Order);

  // Filter orders where staff handled any garment
  return allOrders.filter(order => {
    if (!order.garments) return false;

    return order.garments.some(garment => {
      if (!garment.stageHandlers) return false;

      // Check all stages for this staff
      return Object.values(garment.stageHandlers).some(handlers =>
        handlers?.some(handler => handler.uid === staffId)
      );
    });
  });
}

/**
 * Get garments processed by a staff member
 */
function getGarmentsHandledByStaff(orders: Order[], staffId: string): Garment[] {
  const garments: Garment[] = [];

  for (const order of orders) {
    if (!order.garments) continue;

    for (const garment of order.garments) {
      if (!garment.stageHandlers) continue;

      // Check if staff handled this garment at any stage
      const wasHandled = Object.values(garment.stageHandlers).some(handlers =>
        handlers?.some(handler => handler.uid === staffId)
      );

      if (wasHandled) {
        garments.push(garment);
      }
    }
  }

  return garments;
}

/**
 * Get customer feedback related to a staff member
 */
async function getStaffFeedback(
  staffId: string,
  dateRange: DateRange
): Promise<CustomerFeedback[]> {
  const feedbackQuery = query(
    collection(db, FEEDBACK_COLLECTION),
    where('submittedAt', '>=', Timestamp.fromDate(dateRange.start)),
    where('submittedAt', '<=', Timestamp.fromDate(dateRange.end)),
    orderBy('submittedAt', 'desc')
  );

  const snapshot = await getDocs(feedbackQuery);
  const allFeedback = snapshot.docs.map(doc => doc.data() as CustomerFeedback);

  // Filter feedback that includes ratings for this staff
  return allFeedback.filter(feedback =>
    feedback.staffRatings?.some(rating => rating.staffId === staffId)
  );
}

/**
 * Calculate customer satisfaction score
 *
 * Formula:
 * - 50% from direct staff ratings
 * - 30% from overall order ratings (for orders they handled)
 * - 20% bonus for zero complaints
 */
export async function calculateCustomerSatisfaction(
  staffId: string,
  dateRange: DateRange
): Promise<number> {
  const feedback = await getStaffFeedback(staffId, dateRange);

  if (feedback.length === 0) {
    return 0; // No data available
  }

  // Calculate direct staff ratings (50%)
  let directRatingsSum = 0;
  let directRatingsCount = 0;

  for (const fb of feedback) {
    if (fb.staffRatings) {
      for (const rating of fb.staffRatings) {
        if (rating.staffId === staffId) {
          directRatingsSum += rating.rating;
          directRatingsCount++;
        }
      }
    }
  }

  const avgDirectRating = directRatingsCount > 0
    ? directRatingsSum / directRatingsCount
    : 2.5; // Default middle rating

  // Calculate overall order ratings (30%)
  const orderRatings = feedback.map(fb => fb.overallRating);
  const avgOrderRating = orderRatings.length > 0
    ? orderRatings.reduce((sum, r) => sum + r, 0) / orderRatings.length
    : 2.5;

  // Check for complaints (20%)
  const hasComplaints = feedback.some(fb =>
    fb.staffRatings?.some(r =>
      r.staffId === staffId && r.rating <= 2
    )
  );
  const noComplaintsBonus = hasComplaints ? 0 : 1;

  // Calculate final score (normalized to 0-100)
  const score = (
    (avgDirectRating / 5 * 0.5) +
    (avgOrderRating / 5 * 0.3) +
    (noComplaintsBonus * 0.2)
  ) * 100;

  return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate accuracy score
 *
 * Formula:
 * - 40% QC pass rate
 * - 25% no rework needed
 * - 25% no damage claims
 * - 10% express order timing bonus
 */
export async function calculateAccuracyScore(
  staffId: string,
  dateRange: DateRange
): Promise<number> {
  const orders = await getOrdersHandledByStaff(staffId, dateRange);
  const garments = getGarmentsHandledByStaff(orders, staffId);

  if (garments.length === 0) {
    return 0; // No data available
  }

  // Calculate QC pass rate (40%)
  let qcPassed = 0;
  let qcTotal = 0;
  let reworkCount = 0;

  for (const garment of garments) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qc = (garment as any).qualityCheck;
    if (qc) {
      qcTotal++;
      if (qc.passed) qcPassed++;
      if (qc.reworkRequired) reworkCount++;
    }
  }

  const qcPassRate = qcTotal > 0 ? qcPassed / qcTotal : 1;
  const reworkRate = garments.length > 0 ? reworkCount / garments.length : 0;

  // Calculate damage claim rate (25%)
  let verifiedDamageClaimCount = 0;
  for (const order of orders) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const claims = (order as any).damageClaims;
    if (claims) {
      for (const claim of claims) {
        if (claim.status === 'verified' && claim.responsibleStaffId === staffId) {
          verifiedDamageClaimCount++;
        }
      }
    }
  }
  const damageRate = garments.length > 0 ? verifiedDamageClaimCount / garments.length : 0;

  // Calculate express order timing bonus (10%)
  let expressOnTime = 0;
  let expressTotal = 0;
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

  for (const order of orders) {
    const services = order.garments?.flatMap(g => g.services) || [];
    const isExpress = services.some(s => s.toLowerCase().includes('express'));

    if (isExpress) {
      expressTotal++;
      if (order.actualCompletion && order.createdAt) {
        // Convert Firestore Timestamps to Date using duck typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createdAtRaw = order.createdAt as any;
        const createdAt = createdAtRaw?.toDate ? createdAtRaw.toDate() : new Date(createdAtRaw);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const completedAtRaw = order.actualCompletion as any;
        const completedAt = completedAtRaw?.toDate ? completedAtRaw.toDate() : new Date(completedAtRaw);
        const timeTaken = completedAt.getTime() - createdAt.getTime();

        if (timeTaken <= TWO_HOURS_MS) {
          expressOnTime++;
        }
      }
    }
  }

  const expressBonus = expressTotal > 0
    ? (expressOnTime / expressTotal) * 0.1
    : 0.1; // Full bonus if no express orders

  // Calculate base accuracy
  let accuracy = (
    (qcPassRate * 0.4) +
    ((1 - reworkRate) * 0.25) +
    ((1 - damageRate) * 0.25) +
    expressBonus
  ) * 100;

  // Apply penalties
  if (verifiedDamageClaimCount > 0) {
    accuracy -= verifiedDamageClaimCount * 2; // -2% per verified claim
  }
  if (reworkRate > 0.1) {
    accuracy -= 5; // -5% if rework rate > 10%
  }

  return Math.max(0, Math.min(100, Math.round(accuracy * 10) / 10));
}

/**
 * Calculate efficiency score
 *
 * Formula:
 * - 40% time vs benchmark
 * - 35% throughput (garments per hour)
 * - 25% accuracy influence
 */
export async function calculateEfficiencyScore(
  staffId: string,
  dateRange: DateRange
): Promise<number> {
  const orders = await getOrdersHandledByStaff(staffId, dateRange);
  const garments = getGarmentsHandledByStaff(orders, staffId);

  if (garments.length === 0) {
    return 0; // No data available
  }

  // Get attendance for hours worked
  const attendanceStats = await getAttendanceStats(
    staffId,
    dateRange.start,
    dateRange.end
  );

  const totalHoursWorked = attendanceStats.totalHours || 1; // Avoid division by zero

  // Calculate time efficiency (40%)
  const timeEfficiencies: number[] = [];

  for (const garment of garments) {
    if (garment.stageDurations) {
      for (const [stage, duration] of Object.entries(garment.stageDurations)) {
        if (duration && duration > 0) {
          const benchmark = DEFAULT_BENCHMARKS.times[stage as keyof typeof DEFAULT_BENCHMARKS.times];
          if (benchmark) {
            const benchmarkSeconds = benchmark * 60;
            // Efficiency: benchmark / actual (capped at 1.2 for being faster)
            const efficiency = Math.min(benchmarkSeconds / duration, 1.2);
            timeEfficiencies.push(efficiency);
          }
        }
      }
    }
  }

  const avgTimeEfficiency = timeEfficiencies.length > 0
    ? timeEfficiencies.reduce((sum, e) => sum + e, 0) / timeEfficiencies.length
    : 0.8; // Default 80%

  // Calculate throughput (35%)
  const garmentsPerHour = garments.length / totalHoursWorked;
  const targetGarmentsPerHour = DEFAULT_BENCHMARKS.targetGarmentsPerHour;
  const throughputScore = Math.min(garmentsPerHour / targetGarmentsPerHour, 1.2);

  // Get accuracy component (25%)
  const accuracyScore = await calculateAccuracyScore(staffId, dateRange);
  const accuracyComponent = accuracyScore / 100;

  // Calculate final efficiency
  const efficiency = (
    (avgTimeEfficiency * 0.4) +
    (throughputScore * 0.35) +
    (accuracyComponent * 0.25)
  ) * 100;

  // Cap at 105% for exceptional performance
  return Math.max(0, Math.min(105, Math.round(efficiency * 10) / 10));
}

/**
 * Calculate all staff metrics for a date range
 */
export async function calculateStaffMetrics(
  staffId: string,
  dateRange: DateRange
): Promise<StaffMetrics> {
  const [satisfaction, accuracy, efficiency] = await Promise.all([
    calculateCustomerSatisfaction(staffId, dateRange),
    calculateAccuracyScore(staffId, dateRange),
    calculateEfficiencyScore(staffId, dateRange),
  ]);

  // Calculate overall score (weighted average)
  const overallScore = (satisfaction * 0.35) + (accuracy * 0.35) + (efficiency * 0.30);

  return {
    customerSatisfaction: satisfaction,
    accuracy,
    efficiency,
    overallScore: Math.round(overallScore * 10) / 10,
    updatedAt: new Date(),
  };
}

/**
 * Get staff rank within their branch
 */
export async function getStaffRank(
  staffId: string,
  branchId?: string
): Promise<{ rank: number; total: number }> {
  // Get all employees in the branch
  const employeesQuery = collection(db, EMPLOYEES_COLLECTION);
  const snapshot = await getDocs(
    branchId
      ? query(employeesQuery, where('branchId', '==', branchId), where('active', '==', true))
      : query(employeesQuery, where('active', '==', true))
  );

  const employees = snapshot.docs.map(doc => ({
    employeeId: doc.data().employeeId,
    uid: doc.data().uid,
  }));

  if (employees.length === 0) {
    return { rank: 0, total: 0 };
  }

  // Get weekly metrics for all employees
  const weekRange = getDateRangeForPeriod('weekly');
  const scores: { id: string; score: number }[] = [];

  for (const employee of employees) {
    const metrics = await calculateStaffMetrics(employee.uid || employee.employeeId, weekRange);
    scores.push({
      id: employee.uid || employee.employeeId,
      score: metrics.overallScore,
    });
  }

  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);

  // Find rank
  const rank = scores.findIndex(s => s.id === staffId) + 1;

  return {
    rank: rank > 0 ? rank : employees.length,
    total: employees.length,
  };
}

/**
 * Get dashboard metrics with all time periods
 */
export async function getStaffDashboardMetrics(
  staffId: string,
  branchId?: string
): Promise<DashboardMetrics> {
  const now = new Date();

  // Get real calendar-based ranges
  const dailyRange = getDateRangeForPeriod('daily', now);
  const weeklyRange = getDateRangeForPeriod('weekly', now);
  const monthlyRange = getDateRangeForPeriod('monthly', now);
  const quarterlyRange = getDateRangeForPeriod('quarterly', now);
  const yearlyRange = getDateRangeForPeriod('yearly', now);

  const [daily, weekly, monthly, quarterly, yearly, rank] = await Promise.all([
    calculateStaffMetrics(staffId, dailyRange),
    calculateStaffMetrics(staffId, weeklyRange),
    calculateStaffMetrics(staffId, monthlyRange),
    calculateStaffMetrics(staffId, quarterlyRange),
    calculateStaffMetrics(staffId, yearlyRange),
    getStaffRank(staffId, branchId),
  ]);

  return {
    daily: { ...daily, period: dailyRange.label },
    weekly: { ...weekly, period: weeklyRange.label },
    monthly: { ...monthly, period: monthlyRange.label },
    quarterly: { ...quarterly, period: quarterlyRange.label },
    yearly: { ...yearly, period: yearlyRange.label },
    rank,
    lastUpdated: now,
  };
}

/**
 * Get performance history for charts
 */
export async function getPerformanceHistory(
  staffId: string,
  period: TimePeriod,
  count: number = 7
): Promise<PerformanceHistoryItem[]> {
  const now = new Date();
  const history: PerformanceHistoryItem[] = [];

  for (let i = count - 1; i >= 0; i--) {
    let referenceDate: Date;
    let label: string;

    switch (period) {
      case 'daily':
        referenceDate = subDays(now, i);
        label = format(referenceDate, 'EEE');
        break;
      case 'weekly':
        referenceDate = subWeeks(now, i);
        label = `W${format(referenceDate, 'w')}`;
        break;
      case 'monthly':
        referenceDate = subMonths(now, i);
        label = format(referenceDate, 'MMM');
        break;
      case 'quarterly':
        referenceDate = subQuarters(now, i);
        label = `Q${Math.ceil((referenceDate.getMonth() + 1) / 3)}`;
        break;
      case 'yearly':
        referenceDate = subYears(now, i);
        label = format(referenceDate, 'yyyy');
        break;
    }

    const range = getDateRangeForPeriod(period, referenceDate);
    const metrics = await calculateStaffMetrics(staffId, range);

    // Get orders and garments processed
    const orders = await getOrdersHandledByStaff(staffId, range);
    const garments = getGarmentsHandledByStaff(orders, staffId);

    history.push({
      date: referenceDate,
      label,
      fullLabel: range.label,
      ordersProcessed: orders.length,
      garmentsProcessed: garments.length,
      metrics,
      targetOrders: PERIOD_TARGETS[period].orders,
    });
  }

  return history;
}

/**
 * Get comparison with previous period
 */
export async function getPerformanceComparison(
  staffId: string,
  period: TimePeriod,
  currentDate: Date = new Date()
): Promise<{
  current: StaffMetrics;
  previous: StaffMetrics;
  changePercent: number;
}> {
  const currentRange = getDateRangeForPeriod(period, currentDate);
  const previousDate = getPreviousPeriod(period, currentDate);
  const previousRange = getDateRangeForPeriod(period, previousDate);

  const [current, previous] = await Promise.all([
    calculateStaffMetrics(staffId, currentRange),
    calculateStaffMetrics(staffId, previousRange),
  ]);

  const changePercent = previous.overallScore > 0
    ? ((current.overallScore - previous.overallScore) / previous.overallScore) * 100
    : 0;

  return {
    current,
    previous,
    changePercent: Math.round(changePercent * 10) / 10,
  };
}

/**
 * Get top performers in a branch
 */
export async function getTopPerformers(
  branchId: string,
  limit: number = 5
): Promise<{
  employeeId: string;
  employeeName: string;
  metrics: StaffMetrics;
  rank: number;
}[]> {
  const employeesQuery = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('branchId', '==', branchId),
    where('active', '==', true)
  );

  const snapshot = await getDocs(employeesQuery);
  const employees = snapshot.docs.map(doc => ({
    employeeId: doc.data().employeeId || doc.id,
    employeeName: doc.data().name,
    uid: doc.data().uid,
  }));

  const weekRange = getDateRangeForPeriod('weekly');
  const performersWithMetrics = await Promise.all(
    employees.map(async (emp) => ({
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      metrics: await calculateStaffMetrics(emp.uid || emp.employeeId, weekRange),
    }))
  );

  // Sort by overall score
  performersWithMetrics.sort((a, b) => b.metrics.overallScore - a.metrics.overallScore);

  // Add rank and limit
  return performersWithMetrics.slice(0, limit).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

/**
 * Get orders processed count for a date range
 */
export async function getOrdersProcessedCount(
  staffId: string,
  dateRange: DateRange
): Promise<number> {
  const orders = await getOrdersHandledByStaff(staffId, dateRange);
  return orders.length;
}

/**
 * Get garments processed count for a date range
 */
export async function getGarmentsProcessedCount(
  staffId: string,
  dateRange: DateRange
): Promise<number> {
  const orders = await getOrdersHandledByStaff(staffId, dateRange);
  const garments = getGarmentsHandledByStaff(orders, staffId);
  return garments.length;
}
