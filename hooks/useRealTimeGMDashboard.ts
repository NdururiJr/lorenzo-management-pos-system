/**
 * Real-Time GM Dashboard Hook
 *
 * Uses Firestore onSnapshot listeners for instant updates (1-2 seconds)
 * instead of polling (15-60 seconds).
 *
 * Performance Test: PR-050, PR-051, PR-052
 *
 * @module hooks/useRealTimeGMDashboard
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  subscribeToTodayOrderCount,
  subscribeToTodayRevenue,
  subscribeToLiveOrderQueue,
  subscribeToNewOrders,
  subscribeToDailyStats,
  fetchTodayOrderMetrics,
  fetchTodayRevenue,
  fetchTurnaroundMetrics,
  fetchStaffOnDuty,
  fetchEquipmentStatus,
  fetchUrgentIssues,
  fetchBranchPerformance,
  fetchSatisfactionMetrics,
  type DailyStats,
} from '@/lib/db/gm-dashboard';
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
 * Refresh intervals for non-critical data (still uses polling)
 */
const REFRESH_INTERVALS = {
  turnaround: 120000, // 2 minutes
  staff: 60000, // 1 minute
  equipment: 120000, // 2 minutes
  issues: 30000, // 30 seconds
  branches: 60000, // 1 minute
  satisfaction: 300000, // 5 minutes
} as const;

interface RealTimeGMDashboardData {
  // Real-time data (instant updates via onSnapshot)
  orderCount: number;
  revenue: number;
  liveOrders: OrderQueueItem[];
  dailyStats: DailyStats | null;

  // Polled data (less frequent updates)
  orders: OrderMetrics | null;
  revenueMetrics: RevenueMetrics | null;
  turnaround: TurnaroundMetrics | null;
  staff: StaffMetrics | null;
  staffOnDuty: StaffOnDuty[];
  equipment: Equipment[];
  equipmentSummary: EquipmentSummary | null;
  issues: UrgentIssue[];
  branches: BranchPerformance[];
  satisfaction: SatisfactionMetrics | null;

  // Metadata
  lastUpdated: Date;
  isLoading: boolean;
  isError: boolean;
  errors: Error[];
}

interface UseRealTimeGMDashboardOptions {
  branchFilter?: string;
  enabled?: boolean;
  enableToastNotifications?: boolean;
}

interface UseRealTimeGMDashboardResult {
  data: RealTimeGMDashboardData;
  refetchAll: () => void;
}

/**
 * Real-time GM Dashboard hook
 *
 * Key features:
 * - Order count updates in 1-2 seconds (not 30 seconds)
 * - Revenue updates in 1-2 seconds (not 60 seconds)
 * - Live order queue updates in 1-2 seconds (not 15 seconds)
 * - Toast notifications for new orders
 * - Proper listener cleanup on unmount
 */
export function useRealTimeGMDashboard({
  branchFilter = 'all',
  enabled = true,
  enableToastNotifications = true,
}: UseRealTimeGMDashboardOptions = {}): UseRealTimeGMDashboardResult {
  // Real-time state
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [liveOrders, setLiveOrders] = useState<OrderQueueItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);

  // Polled state
  const [orders, setOrders] = useState<OrderMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [turnaround, setTurnaround] = useState<TurnaroundMetrics | null>(null);
  const [staff, setStaff] = useState<StaffMetrics | null>(null);
  const [staffOnDuty, setStaffOnDuty] = useState<StaffOnDuty[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentSummary, setEquipmentSummary] = useState<EquipmentSummary | null>(null);
  const [issues, setIssues] = useState<UrgentIssue[]>([]);
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [satisfaction, setSatisfaction] = useState<SatisfactionMetrics | null>(null);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Error[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Track if component is mounted
  const isMounted = useRef(true);

  // Store unsubscribe functions
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Cleanup function
  const cleanup = useCallback(() => {
    unsubscribeRefs.current.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        console.warn('Error unsubscribing:', e);
      }
    });
    unsubscribeRefs.current = [];
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    if (!enabled) return;

    isMounted.current = true;
    cleanup(); // Clean up any existing listeners

    const handleError = (error: Error) => {
      if (isMounted.current) {
        setErrors((prev) => [...prev, error]);
      }
    };

    // Subscribe to real-time order count
    const unsubOrderCount = subscribeToTodayOrderCount(
      branchFilter,
      (count) => {
        if (isMounted.current) {
          setOrderCount(count);
          setLastUpdated(new Date());
        }
      },
      handleError
    );
    unsubscribeRefs.current.push(unsubOrderCount);

    // Subscribe to real-time revenue
    const unsubRevenue = subscribeToTodayRevenue(
      branchFilter,
      (rev) => {
        if (isMounted.current) {
          setRevenue(rev);
          setLastUpdated(new Date());
        }
      },
      handleError
    );
    unsubscribeRefs.current.push(unsubRevenue);

    // Subscribe to real-time live order queue
    const unsubLiveOrders = subscribeToLiveOrderQueue(
      branchFilter,
      (ordersData) => {
        if (isMounted.current) {
          setLiveOrders(ordersData);
          setLastUpdated(new Date());
        }
      },
      handleError
    );
    unsubscribeRefs.current.push(unsubLiveOrders);

    // Subscribe to daily stats (P2 feature)
    const unsubDailyStats = subscribeToDailyStats(
      branchFilter,
      (stats) => {
        if (isMounted.current) {
          setDailyStats(stats);
        }
      },
      handleError
    );
    unsubscribeRefs.current.push(unsubDailyStats);

    // Subscribe to new orders for toast notifications
    if (enableToastNotifications) {
      const unsubNewOrders = subscribeToNewOrders(
        branchFilter,
        (order) => {
          if (isMounted.current) {
            toast.info(`New Order: ${order.orderId}`, {
              description: `${order.customerName} - ${order.items} item(s)`,
              duration: 5000,
            });
          }
        },
        handleError
      );
      unsubscribeRefs.current.push(unsubNewOrders);
    }

    // Mark as loaded after setting up listeners
    setIsLoading(false);

    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [branchFilter, enabled, enableToastNotifications, cleanup]);

  // Fetch polled data (less critical, less frequent updates)
  const fetchPolledData = useCallback(async () => {
    if (!enabled) return;

    try {
      const [
        ordersData,
        revenueData,
        turnaroundData,
        staffData,
        equipmentData,
        issuesData,
        branchesData,
        satisfactionData,
      ] = await Promise.all([
        fetchTodayOrderMetrics(branchFilter),
        fetchTodayRevenue(branchFilter),
        fetchTurnaroundMetrics(branchFilter),
        fetchStaffOnDuty(branchFilter),
        fetchEquipmentStatus(branchFilter),
        fetchUrgentIssues(branchFilter),
        fetchBranchPerformance(branchFilter),
        fetchSatisfactionMetrics(branchFilter),
      ]);

      if (isMounted.current) {
        setOrders(ordersData);
        setRevenueMetrics(revenueData);
        setTurnaround(turnaroundData);
        setStaff(staffData.metrics);
        setStaffOnDuty(staffData.staff);
        setEquipment(equipmentData.equipment);
        setEquipmentSummary(equipmentData.summary);
        setIssues(issuesData);
        setBranches(branchesData);
        setSatisfaction(satisfactionData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching polled data:', error);
      if (isMounted.current) {
        setErrors((prev) => [...prev, error as Error]);
      }
    }
  }, [branchFilter, enabled]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (!enabled) return;

    fetchPolledData();

    // Set up polling intervals for non-real-time data
    const intervals = [
      setInterval(fetchPolledData, REFRESH_INTERVALS.turnaround),
    ];

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [fetchPolledData, enabled]);

  const refetchAll = useCallback(() => {
    fetchPolledData();
    // Real-time data doesn't need manual refresh - it's always up to date
  }, [fetchPolledData]);

  return {
    data: {
      orderCount,
      revenue,
      liveOrders,
      dailyStats,
      orders,
      revenueMetrics,
      turnaround,
      staff,
      staffOnDuty,
      equipment,
      equipmentSummary,
      issues,
      branches,
      satisfaction,
      lastUpdated,
      isLoading,
      isError: errors.length > 0,
      errors,
    },
    refetchAll,
  };
}

/**
 * Hook for just the real-time order count (lightweight)
 */
export function useRealTimeOrderCount(branchFilter: string = 'all') {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToTodayOrderCount(
      branchFilter,
      (newCount) => {
        setCount(newCount);
        setIsLoading(false);
      },
      (error) => {
        console.error('Real-time order count error:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [branchFilter]);

  return { count, isLoading };
}

/**
 * Hook for just the real-time revenue (lightweight)
 */
export function useRealTimeRevenue(branchFilter: string = 'all') {
  const [revenue, setRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToTodayRevenue(
      branchFilter,
      (newRevenue) => {
        setRevenue(newRevenue);
        setIsLoading(false);
      },
      (error) => {
        console.error('Real-time revenue error:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [branchFilter]);

  return { revenue, isLoading };
}

/**
 * Hook for real-time live order queue
 */
export function useRealTimeLiveOrders(branchFilter: string = 'all') {
  const [orders, setOrders] = useState<OrderQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLiveOrderQueue(
      branchFilter,
      (newOrders) => {
        setOrders(newOrders);
        setIsLoading(false);
      },
      (error) => {
        console.error('Real-time live orders error:', error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [branchFilter]);

  return { orders, isLoading };
}
