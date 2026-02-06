/**
 * GM Dashboard Database Functions
 *
 * Firestore queries for the General Manager Operations Dashboard
 * @module lib/db/gm-dashboard
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  doc,
  setDoc,
  increment,
  getDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import type {
  OrderMetrics,
  RevenueMetrics,
  TurnaroundMetrics,
  StaffMetrics,
  StaffOnDuty,
  SatisfactionMetrics,
  Equipment,
  EquipmentSummary,
  UrgentIssue,
  BranchPerformance,
  OrderQueueItem,
} from '@/types/gm-dashboard';

/**
 * Get today's date range as Firestore Timestamps
 */
function getTodayRange() {
  const today = new Date();
  return {
    start: Timestamp.fromDate(startOfDay(today)),
    end: Timestamp.fromDate(endOfDay(today)),
  };
}

/**
 * Get yesterday's date range as Firestore Timestamps
 */
function getYesterdayRange() {
  const yesterday = subDays(new Date(), 1);
  return {
    start: Timestamp.fromDate(startOfDay(yesterday)),
    end: Timestamp.fromDate(endOfDay(yesterday)),
  };
}

/**
 * Fetch today's order metrics
 */
export async function fetchTodayOrderMetrics(
  branchFilter: string = 'all'
): Promise<OrderMetrics> {
  const { start, end } = getTodayRange();
  const yesterdayRange = getYesterdayRange();

  try {
    // Today's orders
    let todayQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end)
    );

    if (branchFilter !== 'all') {
      todayQuery = query(
        collection(db, 'orders'),
        where('branchId', '==', branchFilter),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end)
      );
    }

    const todaySnapshot = await getDocs(todayQuery);
    const todayOrders = todaySnapshot.docs.map((doc) => doc.data());

    // Yesterday's orders for trend calculation
    let yesterdayQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', yesterdayRange.start),
      where('createdAt', '<=', yesterdayRange.end)
    );

    if (branchFilter !== 'all') {
      yesterdayQuery = query(
        collection(db, 'orders'),
        where('branchId', '==', branchFilter),
        where('createdAt', '>=', yesterdayRange.start),
        where('createdAt', '<=', yesterdayRange.end)
      );
    }

    const yesterdaySnapshot = await getDocs(yesterdayQuery);

    const total = todayOrders.length;
    const completed = todayOrders.filter(
      (o) => o.status === 'delivered' || o.status === 'collected'
    ).length;
    const inProgress = todayOrders.filter((o) =>
      ['washing', 'drying', 'ironing', 'quality_check', 'packaging'].includes(o.status)
    ).length;
    const pending = todayOrders.filter((o) =>
      ['received', 'queued'].includes(o.status)
    ).length;
    const express = todayOrders.filter((o) => o.priority === 'express').length;

    const yesterdayTotal = yesterdaySnapshot.docs.length;
    const trend =
      yesterdayTotal > 0
        ? Math.round(((total - yesterdayTotal) / yesterdayTotal) * 100)
        : total > 0
        ? 100
        : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      express,
      trend,
    };
  } catch (error) {
    console.error('Error fetching order metrics:', error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      express: 0,
      trend: 0,
    };
  }
}

/**
 * Fetch company-wide default settings
 * Returns defaults only if no branch-specific config exists
 */
async function getCompanyDefaults(): Promise<{
  dailyRevenueTarget: number | null;
  turnaroundTargetHours: number | null;
}> {
  try {
    const settingsSnapshot = await getDocs(collection(db, 'companySettings'));
    if (!settingsSnapshot.empty) {
      const data = settingsSnapshot.docs[0].data();
      return {
        dailyRevenueTarget: data.defaultDailyRevenueTarget || null,
        turnaroundTargetHours: data.defaultTurnaroundHours || null,
      };
    }
  } catch {
    // Company settings not configured
  }
  return {
    dailyRevenueTarget: null,
    turnaroundTargetHours: null,
  };
}

/**
 * Fetch daily target from branch configuration
 * Returns null if no target is configured (instead of hardcoded fallback)
 */
async function getBranchDailyTarget(branchFilter: string): Promise<number | null> {
  // First, try to get company defaults as fallback
  const companyDefaults = await getCompanyDefaults();

  if (branchFilter === 'all') {
    // Sum all branch targets for "all branches" view
    try {
      const branchesSnapshot = await getDocs(
        query(collection(db, 'branches'), where('active', '==', true))
      );
      let totalTarget = 0;
      let hasConfiguredTarget = false;

      branchesSnapshot.docs.forEach((doc) => {
        const branchTarget = doc.data().dailyTarget;
        if (typeof branchTarget === 'number' && branchTarget > 0) {
          totalTarget += branchTarget;
          hasConfiguredTarget = true;
        } else if (companyDefaults.dailyRevenueTarget) {
          // Use company default for branches without specific targets
          totalTarget += companyDefaults.dailyRevenueTarget;
          hasConfiguredTarget = true;
        }
      });

      return hasConfiguredTarget ? totalTarget : null;
    } catch {
      return companyDefaults.dailyRevenueTarget;
    }
  }

  // Get specific branch target
  try {
    const branchSnapshot = await getDocs(
      query(collection(db, 'branches'), where('branchId', '==', branchFilter))
    );
    if (!branchSnapshot.empty) {
      const branchTarget = branchSnapshot.docs[0].data().dailyTarget;
      if (typeof branchTarget === 'number' && branchTarget > 0) {
        return branchTarget;
      }
    }
  } catch {
    // Fall through to company default
  }

  // Return company default or null if not configured
  return companyDefaults.dailyRevenueTarget;
}

/**
 * Fetch today's revenue metrics
 */
export async function fetchTodayRevenue(
  branchFilter: string = 'all'
): Promise<RevenueMetrics> {
  const { start, end } = getTodayRange();
  const yesterdayRange = getYesterdayRange();

  try {
    // Today's transactions
    let todayQuery = query(
      collection(db, 'transactions'),
      where('timestamp', '>=', start),
      where('timestamp', '<=', end),
      where('status', '==', 'completed')
    );

    if (branchFilter !== 'all') {
      todayQuery = query(
        collection(db, 'transactions'),
        where('branchId', '==', branchFilter),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        where('status', '==', 'completed')
      );
    }

    const todaySnapshot = await getDocs(todayQuery);
    const todayRevenue = todaySnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    // Yesterday's revenue for comparison
    let yesterdayQuery = query(
      collection(db, 'transactions'),
      where('timestamp', '>=', yesterdayRange.start),
      where('timestamp', '<=', yesterdayRange.end),
      where('status', '==', 'completed')
    );

    if (branchFilter !== 'all') {
      yesterdayQuery = query(
        collection(db, 'transactions'),
        where('branchId', '==', branchFilter),
        where('timestamp', '>=', yesterdayRange.start),
        where('timestamp', '<=', yesterdayRange.end),
        where('status', '==', 'completed')
      );
    }

    const yesterdaySnapshot = await getDocs(yesterdayQuery);
    const previousDay = yesterdaySnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    // Fetch target from branch configuration (may be null if not configured)
    const target = await getBranchDailyTarget(branchFilter);
    // Only calculate progress if target is configured
    const progress = target !== null && target > 0
      ? Math.round((todayRevenue / target) * 100)
      : null;
    const trend =
      previousDay > 0
        ? Math.round(((todayRevenue - previousDay) / previousDay) * 100)
        : todayRevenue > 0
        ? 100
        : 0;

    return {
      today: todayRevenue,
      target,  // May be null if not configured
      progress, // May be null if target not configured
      currency: 'KES',
      previousDay,
      trend,
    };
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    return {
      today: 0,
      target: null,  // null instead of hardcoded 50000
      progress: null,
      currency: 'KES',
      previousDay: 0,
      trend: 0,
    };
  }
}

/**
 * Fetch turnaround target from branch configuration
 * Returns null if no target is configured (instead of hardcoded fallback)
 */
async function getBranchTurnaroundTarget(branchFilter: string): Promise<number | null> {
  // First, try to get company defaults as fallback
  const companyDefaults = await getCompanyDefaults();

  if (branchFilter === 'all') {
    // Use the average of all branch targets
    try {
      const branchesSnapshot = await getDocs(
        query(collection(db, 'branches'), where('active', '==', true))
      );
      let totalTarget = 0;
      let count = 0;
      branchesSnapshot.docs.forEach((doc) => {
        const target = doc.data().targetTurnaroundHours;
        if (typeof target === 'number' && target > 0) {
          totalTarget += target;
          count++;
        }
      });

      if (count > 0) {
        return Math.round(totalTarget / count);
      }
      // Fall back to company default
      return companyDefaults.turnaroundTargetHours;
    } catch {
      return companyDefaults.turnaroundTargetHours;
    }
  }

  // Get specific branch target
  try {
    const branchSnapshot = await getDocs(
      query(collection(db, 'branches'), where('branchId', '==', branchFilter))
    );
    if (!branchSnapshot.empty) {
      const branchTarget = branchSnapshot.docs[0].data().targetTurnaroundHours;
      if (typeof branchTarget === 'number' && branchTarget > 0) {
        return branchTarget;
      }
    }
  } catch {
    // Fall through to company default
  }

  // Return company default or null if not configured
  return companyDefaults.turnaroundTargetHours;
}

/**
 * Fetch average turnaround time
 */
export async function fetchTurnaroundMetrics(
  branchFilter: string = 'all'
): Promise<TurnaroundMetrics> {
  const { start, end } = getTodayRange();

  try {
    // Get completed orders today
    const completedQuery = query(
      collection(db, 'orders'),
      where('status', 'in', ['delivered', 'collected']),
      where('actualCompletion', '>=', start),
      where('actualCompletion', '<=', end)
    );

    // Note: Firestore doesn't support multiple field inequality filters
    // So we fetch and filter in code for branch
    const snapshot = await getDocs(completedQuery);
    const orders = snapshot.docs
      .map((doc) => doc.data())
      .filter((o) => branchFilter === 'all' || o.branchId === branchFilter);

    // Calculate average turnaround time in hours
    let totalHours = 0;
    let validOrders = 0;

    orders.forEach((order) => {
      if (order.createdAt && order.actualCompletion) {
        const created =
          order.createdAt instanceof Timestamp
            ? order.createdAt.toDate()
            : new Date(order.createdAt);
        const completed =
          order.actualCompletion instanceof Timestamp
            ? order.actualCompletion.toDate()
            : new Date(order.actualCompletion);
        const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
        validOrders++;
      }
    });

    // Only calculate average if we have valid orders
    const averageHours = validOrders > 0 ? totalHours / validOrders : null;

    // Fetch target from branch configuration (may be null if not configured)
    const target = await getBranchTurnaroundTarget(branchFilter);

    // Determine performance only if both averageHours and target are available
    let performance: 'good' | 'warning' | 'critical' | null = null;
    if (averageHours !== null && target !== null) {
      performance =
        averageHours <= target
          ? 'good'
          : averageHours <= target * 1.5
          ? 'warning'
          : 'critical';
    }

    return {
      averageHours: averageHours !== null ? Math.round(averageHours * 10) / 10 : null,
      target,  // May be null if not configured
      performance,
      previousDay: null, // Null instead of hardcoded 24
    };
  } catch (error) {
    console.error('Error fetching turnaround metrics:', error);
    return {
      averageHours: null,
      target: null,  // null instead of hardcoded 24
      performance: null,
      previousDay: null,
    };
  }
}

/**
 * Fetch staff on duty
 */
export async function fetchStaffOnDuty(
  branchFilter: string = 'all'
): Promise<{ staff: StaffOnDuty[]; metrics: StaffMetrics }> {
  const { start, end } = getTodayRange();

  try {
    // Get today's attendance records for clocked-in staff
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('date', '>=', start),
      where('date', '<=', end)
    );

    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceRecords = attendanceSnapshot.docs
      .map((doc) => doc.data())
      .filter((a) => branchFilter === 'all' || a.branchId === branchFilter);

    // Get user details for each attendance record
    const staff: StaffOnDuty[] = [];
    let onBreak = 0;

    for (const record of attendanceRecords) {
      if (record.checkIn && !record.checkOut) {
        // Currently on shift
        try {
          const userDoc = await getDocs(
            query(collection(db, 'users'), where('uid', '==', record.employeeId))
          );

          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            staff.push({
              id: record.employeeId,
              name: userData.name || 'Unknown',
              role: userData.role || 'staff',
              branchId: record.branchId,
              branchName: '', // Will be populated from branches collection
              status: record.onBreak ? 'on_break' : 'active',
              ordersHandled: record.ordersHandled || 0,
              rating: userData.rating || 4.5,
              clockInTime: record.checkIn,
            });
            if (record.onBreak) onBreak++;
          }
        } catch {
          // Skip this record if user lookup fails
        }
      }
    }

    // Get total staff count for the branch
    const usersQuery = query(
      collection(db, 'users'),
      where('active', '==', true),
      where('role', 'not-in', ['customer'])
    );

    const usersSnapshot = await getDocs(usersQuery);
    const totalStaff = usersSnapshot.docs.filter(
      (doc) => branchFilter === 'all' || doc.data().branchId === branchFilter
    ).length;

    // Calculate productivity based on orders handled vs expected
    // Expected: ~2 orders per hour per staff on active processing roles
    const hoursWorked = staff.reduce((sum, s) => {
      if (s.clockInTime) {
        const clockIn = s.clockInTime instanceof Timestamp
          ? s.clockInTime.toDate()
          : new Date(s.clockInTime);
        const now = new Date();
        return sum + Math.min((now.getTime() - clockIn.getTime()) / (1000 * 60 * 60), 8);
      }
      return sum;
    }, 0);

    const totalOrdersHandled = staff.reduce((sum, s) => sum + (s.ordersHandled || 0), 0);
    const expectedOrders = hoursWorked * 2; // 2 orders per hour target
    const productivity = expectedOrders > 0
      ? Math.min(Math.round((totalOrdersHandled / expectedOrders) * 100), 100)
      : 85; // Default if no data

    return {
      staff,
      metrics: {
        onDuty: staff.length,
        total: totalStaff,
        onBreak,
        productivity,
      },
    };
  } catch (error) {
    console.error('Error fetching staff on duty:', error);
    return {
      staff: [],
      metrics: {
        onDuty: 0,
        total: 0,
        onBreak: 0,
        productivity: 0,
      },
    };
  }
}

/**
 * Fetch equipment status
 */
export async function fetchEquipmentStatus(
  branchFilter: string = 'all'
): Promise<{ equipment: Equipment[]; summary: EquipmentSummary }> {
  try {
    let equipmentQuery = query(collection(db, 'equipment'));

    if (branchFilter !== 'all') {
      equipmentQuery = query(
        collection(db, 'equipment'),
        where('branchId', '==', branchFilter)
      );
    }

    const snapshot = await getDocs(equipmentQuery);
    const equipment: Equipment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unknown',
        type: data.type || 'washer',
        status: data.status || 'idle',
        branchId: data.branchId || '',
        currentLoad: data.currentLoad,
        lastMaintenance: data.lastMaintenance,
        nextMaintenance: data.nextMaintenance,
        uptime: data.uptime,
      };
    });

    // Build summary
    const summary: EquipmentSummary = {
      washers: { running: 0, total: 0 },
      dryers: { running: 0, total: 0 },
      presses: { running: 0, total: 0 },
      steamers: { running: 0, total: 0 },
      folders: { running: 0, total: 0 },
    };

    equipment.forEach((e) => {
      const type = `${e.type}s` as keyof EquipmentSummary;
      if (summary[type]) {
        summary[type].total++;
        if (e.status === 'running') {
          summary[type].running++;
        }
      }
    });

    return { equipment, summary };
  } catch (error) {
    console.error('Error fetching equipment status:', error);
    return {
      equipment: [],
      summary: {
        washers: { running: 0, total: 0 },
        dryers: { running: 0, total: 0 },
        presses: { running: 0, total: 0 },
        steamers: { running: 0, total: 0 },
        folders: { running: 0, total: 0 },
      },
    };
  }
}

/**
 * Fetch urgent issues requiring attention
 */
export async function fetchUrgentIssues(
  branchFilter: string = 'all'
): Promise<UrgentIssue[]> {
  try {
    const issuesQuery = query(
      collection(db, 'issues'),
      where('status', 'in', ['open', 'in_progress']),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(issuesQuery);
    const issues: UrgentIssue[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Issue',
          description: data.description || '',
          priority: data.priority || 'medium',
          type: data.type || 'order',
          branchId: data.branchId || '',
          branchName: data.branchName || '',
          createdAt: data.createdAt,
          orderId: data.orderId,
          assignedTo: data.assignedTo,
          status: data.status || 'open',
        };
      })
      .filter((i) => branchFilter === 'all' || i.branchId === branchFilter);

    return issues;
  } catch (error) {
    console.error('Error fetching urgent issues:', error);
    return [];
  }
}

/**
 * Fetch branch performance data
 */
export async function fetchBranchPerformance(
  branchFilter: string = 'all'
): Promise<BranchPerformance[]> {
  const { start, end } = getTodayRange();

  try {
    // Get all branches
    let branchesQuery = query(collection(db, 'branches'), where('active', '==', true));

    if (branchFilter !== 'all') {
      branchesQuery = query(
        collection(db, 'branches'),
        where('branchId', '==', branchFilter)
      );
    }

    const branchesSnapshot = await getDocs(branchesQuery);
    const branches = branchesSnapshot.docs.map((doc) => doc.data());

    const performance: BranchPerformance[] = [];

    for (const branch of branches) {
      // Get orders for this branch today
      const ordersQuery = query(
        collection(db, 'orders'),
        where('branchId', '==', branch.branchId),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end)
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map((doc) => doc.data());

      // Get revenue for this branch today
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('branchId', '==', branch.branchId),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        where('status', '==', 'completed')
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      const revenue = transactionsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0),
        0
      );

      // Get active issues for this branch
      const issuesQuery = query(
        collection(db, 'issues'),
        where('branchId', '==', branch.branchId),
        where('status', 'in', ['open', 'in_progress'])
      );

      const issuesSnapshot = await getDocs(issuesQuery);

      const target = branch.dailyTarget || 50000;
      const targetProgress = target > 0 ? Math.round((revenue / target) * 100) : 0;
      const status: 'on_track' | 'behind' | 'ahead' =
        targetProgress >= 100 ? 'ahead' : targetProgress >= 80 ? 'on_track' : 'behind';

      performance.push({
        branchId: branch.branchId,
        name: branch.name,
        ordersToday: orders.length,
        revenue,
        target,
        targetProgress,
        efficiency: 85, // Default efficiency
        activeIssues: issuesSnapshot.docs.length,
        staffOnDuty: branch.staffOnDuty || 0,
        status,
      });
    }

    return performance;
  } catch (error) {
    console.error('Error fetching branch performance:', error);
    return [];
  }
}

/**
 * Fetch live order queue
 */
export async function fetchLiveOrderQueue(
  branchFilter: string = 'all',
  limitCount: number = 20
): Promise<OrderQueueItem[]> {
  try {
    // Get orders that are in progress
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', 'not-in', ['delivered', 'collected', 'cancelled']),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(ordersQuery);
    const orders: OrderQueueItem[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (branchFilter !== 'all' && data.branchId !== branchFilter) {
        continue;
      }

      // Calculate ETA
      let eta = 'N/A';
      if (data.estimatedCompletion) {
        const estimatedDate =
          data.estimatedCompletion instanceof Timestamp
            ? data.estimatedCompletion.toDate()
            : new Date(data.estimatedCompletion);
        const now = new Date();
        const diffMs = estimatedDate.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));

        if (diffHours <= 0) {
          eta = 'Overdue';
        } else if (diffHours < 24) {
          eta = `${diffHours}h`;
        } else {
          eta = `${Math.round(diffHours / 24)}d`;
        }
      }

      // Get services from garments
      const services = new Set<string>();
      (data.garments || []).forEach((g: { services?: string[] }) => {
        (g.services || []).forEach((s) => services.add(s));
      });

      orders.push({
        orderId: doc.id,
        customerId: data.customerId || '',
        customerName: data.customerName || 'Unknown',
        customerPhone: data.customerPhone || '',
        items: (data.garments || []).length,
        services: Array.from(services),
        status: data.status || 'received',
        priority: data.priority || 'standard',
        createdAt: data.createdAt,
        estimatedCompletion: data.estimatedCompletion,
        eta,
        branchId: data.branchId || '',
        branchName: data.branchName || '',
        assignedTo: data.assignedTo,
      });
    }

    return orders;
  } catch (error) {
    console.error('Error fetching live order queue:', error);
    return [];
  }
}

/**
 * Fetch customer satisfaction metrics from customerFeedback collection
 */
export async function fetchSatisfactionMetrics(
  branchFilter: string = 'all'
): Promise<SatisfactionMetrics> {
  const { start: _todayStart, end: _todayEnd } = getTodayRange();
  const lastWeekStart = Timestamp.fromDate(subDays(new Date(), 7));

  try {
    // Get feedback from the last 30 days for overall score
    const thirtyDaysAgo = Timestamp.fromDate(subDays(new Date(), 30));

    const feedbackQuery = query(
      collection(db, 'customerFeedback'),
      where('submittedAt', '>=', thirtyDaysAgo),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(feedbackQuery);
    const allFeedback = snapshot.docs
      .map((doc) => doc.data())
      .filter((f) => branchFilter === 'all' || f.branchId === branchFilter);

    if (allFeedback.length === 0) {
      // Return default values if no feedback exists
      return {
        score: 4.5,
        totalReviews: 0,
        trend: 0,
      };
    }

    // Calculate average score
    const totalScore = allFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0);
    const score = Math.round((totalScore / allFeedback.length) * 10) / 10;

    // Calculate trend (compare this week vs last week)
    const thisWeekFeedback = allFeedback.filter((f) => {
      const submittedAt = f.submittedAt?.toDate?.() || new Date(f.submittedAt);
      return submittedAt >= lastWeekStart.toDate();
    });

    const lastWeekFeedback = allFeedback.filter((f) => {
      const submittedAt = f.submittedAt?.toDate?.() || new Date(f.submittedAt);
      const twoWeeksAgo = subDays(new Date(), 14);
      return submittedAt >= twoWeeksAgo && submittedAt < lastWeekStart.toDate();
    });

    let trend = 0;
    if (lastWeekFeedback.length > 0) {
      const thisWeekAvg =
        thisWeekFeedback.length > 0
          ? thisWeekFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) /
            thisWeekFeedback.length
          : score;
      const lastWeekAvg =
        lastWeekFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) /
        lastWeekFeedback.length;
      trend = Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100);
    }

    return {
      score,
      totalReviews: allFeedback.length,
      trend,
    };
  } catch (error) {
    console.error('Error fetching satisfaction metrics:', error);
    return {
      score: 4.5,
      totalReviews: 0,
      trend: 0,
    };
  }
}

// ============================================================================
// REAL-TIME LISTENERS (P1 - Performance Optimization)
// These functions provide instant updates instead of polling
// ============================================================================

/**
 * Subscribe to real-time order count updates
 * Updates within 1-2 seconds instead of 15-60 second polling
 */
export function subscribeToTodayOrderCount(
  branchFilter: string,
  onUpdate: (count: number) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const { start, end } = getTodayRange();

  let q = query(
    collection(db, 'orders'),
    where('createdAt', '>=', start),
    where('createdAt', '<=', end)
  );

  if (branchFilter !== 'all') {
    q = query(
      collection(db, 'orders'),
      where('branchId', '==', branchFilter),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end)
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.size);
    },
    (error) => {
      console.error('Real-time order count error:', error);
      onError?.(error);
    }
  );
}

/**
 * Subscribe to real-time revenue updates
 */
export function subscribeToTodayRevenue(
  branchFilter: string,
  onUpdate: (revenue: number) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const { start, end } = getTodayRange();

  let q = query(
    collection(db, 'transactions'),
    where('timestamp', '>=', start),
    where('timestamp', '<=', end),
    where('status', '==', 'completed')
  );

  if (branchFilter !== 'all') {
    q = query(
      collection(db, 'transactions'),
      where('branchId', '==', branchFilter),
      where('timestamp', '>=', start),
      where('timestamp', '<=', end),
      where('status', '==', 'completed')
    );
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const total = snapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0),
        0
      );
      onUpdate(total);
    },
    (error) => {
      console.error('Real-time revenue error:', error);
      onError?.(error);
    }
  );
}

/**
 * Subscribe to real-time live order queue with detailed data
 */
export function subscribeToLiveOrderQueue(
  branchFilter: string,
  onUpdate: (orders: OrderQueueItem[]) => void,
  onError?: (error: Error) => void,
  limitCount: number = 20
): Unsubscribe {
  const q = query(
    collection(db, 'orders'),
    where('status', 'not-in', ['delivered', 'collected', 'cancelled']),
    orderBy('status'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: OrderQueueItem[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (branchFilter !== 'all' && data.branchId !== branchFilter) {
          continue;
        }

        // Calculate ETA
        let eta = 'N/A';
        if (data.estimatedCompletion) {
          const estimatedDate =
            data.estimatedCompletion instanceof Timestamp
              ? data.estimatedCompletion.toDate()
              : new Date(data.estimatedCompletion);
          const now = new Date();
          const diffMs = estimatedDate.getTime() - now.getTime();
          const diffHours = Math.round(diffMs / (1000 * 60 * 60));

          if (diffHours <= 0) {
            eta = 'Overdue';
          } else if (diffHours < 24) {
            eta = `${diffHours}h`;
          } else {
            eta = `${Math.round(diffHours / 24)}d`;
          }
        }

        // Get services from garments
        const services = new Set<string>();
        (data.garments || []).forEach((g: { services?: string[] }) => {
          (g.services || []).forEach((s) => services.add(s));
        });

        orders.push({
          orderId: docSnap.id,
          customerId: data.customerId || '',
          customerName: data.customerName || 'Unknown',
          customerPhone: data.customerPhone || '',
          items: (data.garments || []).length,
          services: Array.from(services),
          status: data.status || 'received',
          priority: data.priority || 'standard',
          createdAt: data.createdAt,
          estimatedCompletion: data.estimatedCompletion,
          eta,
          branchId: data.branchId || '',
          branchName: data.branchName || '',
          assignedTo: data.assignedTo,
        });
      }

      onUpdate(orders);
    },
    (error) => {
      console.error('Real-time order queue error:', error);
      onError?.(error);
    }
  );
}

/**
 * Subscribe to new orders for toast notifications
 * Returns only newly added orders since subscription started
 */
export function subscribeToNewOrders(
  branchFilter: string,
  onNewOrder: (order: { orderId: string; customerName: string; items: number }) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const sessionStart = Timestamp.fromDate(new Date());

  let q = query(
    collection(db, 'orders'),
    where('createdAt', '>=', sessionStart),
    orderBy('createdAt', 'desc')
  );

  if (branchFilter !== 'all') {
    q = query(
      collection(db, 'orders'),
      where('branchId', '==', branchFilter),
      where('createdAt', '>=', sessionStart),
      orderBy('createdAt', 'desc')
    );
  }

  let isFirstSnapshot = true;

  return onSnapshot(
    q,
    (snapshot) => {
      // Skip the first snapshot (existing orders)
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        return;
      }

      // Only process added documents
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          onNewOrder({
            orderId: change.doc.id,
            customerName: data.customerName || 'Unknown',
            items: (data.garments || []).length,
          });
        }
      });
    },
    (error) => {
      console.error('New order subscription error:', error);
      onError?.(error);
    }
  );
}

// ============================================================================
// DAILY STATS (P2 - Pre-computed Aggregates)
// ============================================================================

export interface DailyStats {
  branchId: string;
  date: string; // YYYY-MM-DD format
  orderCount: number;
  revenue: number;
  completedCount: number;
  avgTurnaroundMinutes: number;
  hourlyRevenue: Record<string, number>; // { "09": 5000, "10": 8000 }
  lastUpdated: Timestamp;
}

/**
 * Get the daily stats document ID
 */
function getDailyStatsId(branchId: string, date: Date = new Date()): string {
  return `${branchId}_${format(date, 'yyyy-MM-dd')}`;
}

/**
 * Get daily stats for a branch (or all branches)
 * Falls back to calculating from orders if dailyStats doesn't exist
 */
export async function getDailyStats(
  branchFilter: string = 'all',
  date: Date = new Date()
): Promise<DailyStats | null> {
  try {
    if (branchFilter === 'all') {
      // Aggregate all branches
      const branchesSnapshot = await getDocs(
        query(collection(db, 'branches'), where('active', '==', true))
      );

      let totalOrderCount = 0;
      let totalRevenue = 0;
      let totalCompletedCount = 0;
      const hourlyRevenue: Record<string, number> = {};

      for (const branchDoc of branchesSnapshot.docs) {
        const branchId = branchDoc.data().branchId;
        const statsId = getDailyStatsId(branchId, date);
        const statsDoc = await getDoc(doc(db, 'dailyStats', statsId));

        if (statsDoc.exists()) {
          const data = statsDoc.data() as DailyStats;
          totalOrderCount += data.orderCount || 0;
          totalRevenue += data.revenue || 0;
          totalCompletedCount += data.completedCount || 0;

          // Merge hourly revenue
          Object.entries(data.hourlyRevenue || {}).forEach(([hour, amount]) => {
            hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + amount;
          });
        }
      }

      return {
        branchId: 'all',
        date: format(date, 'yyyy-MM-dd'),
        orderCount: totalOrderCount,
        revenue: totalRevenue,
        completedCount: totalCompletedCount,
        avgTurnaroundMinutes: 0,
        hourlyRevenue,
        lastUpdated: Timestamp.now(),
      };
    }

    // Get specific branch stats
    const statsId = getDailyStatsId(branchFilter, date);
    const statsDoc = await getDoc(doc(db, 'dailyStats', statsId));

    if (statsDoc.exists()) {
      return statsDoc.data() as DailyStats;
    }

    return null;
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return null;
  }
}

/**
 * Update daily stats atomically (called from Cloud Functions)
 * This is the client-side version for testing; production uses Cloud Functions
 */
export async function updateDailyStats(
  branchId: string,
  orderAmount: number,
  isCompleted: boolean = false
): Promise<void> {
  const statsId = getDailyStatsId(branchId);
  const hour = format(new Date(), 'HH');

  try {
    await setDoc(
      doc(db, 'dailyStats', statsId),
      {
        branchId,
        date: format(new Date(), 'yyyy-MM-dd'),
        orderCount: increment(1),
        revenue: increment(orderAmount),
        completedCount: increment(isCompleted ? 1 : 0),
        [`hourlyRevenue.${hour}`]: increment(orderAmount),
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
}

/**
 * Subscribe to real-time daily stats updates
 */
export function subscribeToDailyStats(
  branchFilter: string,
  onUpdate: (stats: DailyStats | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const date = new Date();

  if (branchFilter === 'all') {
    // For "all branches", we need to aggregate multiple documents
    // This is less efficient, so consider a dedicated "all_YYYY-MM-DD" document
    const q = query(
      collection(db, 'dailyStats'),
      where('date', '==', format(date, 'yyyy-MM-dd'))
    );

    return onSnapshot(
      q,
      (snapshot) => {
        let totalOrderCount = 0;
        let totalRevenue = 0;
        let totalCompletedCount = 0;
        const hourlyRevenue: Record<string, number> = {};

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data() as DailyStats;
          totalOrderCount += data.orderCount || 0;
          totalRevenue += data.revenue || 0;
          totalCompletedCount += data.completedCount || 0;

          Object.entries(data.hourlyRevenue || {}).forEach(([hour, amount]) => {
            hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + amount;
          });
        });

        onUpdate({
          branchId: 'all',
          date: format(date, 'yyyy-MM-dd'),
          orderCount: totalOrderCount,
          revenue: totalRevenue,
          completedCount: totalCompletedCount,
          avgTurnaroundMinutes: 0,
          hourlyRevenue,
          lastUpdated: Timestamp.now(),
        });
      },
      (error) => {
        console.error('Real-time daily stats error:', error);
        onError?.(error);
      }
    );
  }

  // Single branch - listen to specific document
  const statsId = getDailyStatsId(branchFilter, date);

  return onSnapshot(
    doc(db, 'dailyStats', statsId),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as DailyStats);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Real-time daily stats error:', error);
      onError?.(error);
    }
  );
}
