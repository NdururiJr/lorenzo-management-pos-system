/**
 * GM Dashboard Data Fetching Hook
 *
 * React Query hook for fetching all GM Operations Dashboard data
 * with automatic refresh intervals
 *
 * @module hooks/useGMDashboard
 */

'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import {
  fetchTodayOrderMetrics,
  fetchTodayRevenue,
  fetchTurnaroundMetrics,
  fetchStaffOnDuty,
  fetchEquipmentStatus,
  fetchUrgentIssues,
  fetchBranchPerformance,
  fetchLiveOrderQueue,
  fetchSatisfactionMetrics,
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
  GMDashboardData,
} from '@/types/gm-dashboard';

/**
 * Refresh intervals in milliseconds
 */
const REFRESH_INTERVALS = {
  orders: 30000, // 30 seconds
  revenue: 60000, // 1 minute
  turnaround: 120000, // 2 minutes
  staff: 60000, // 1 minute
  equipment: 120000, // 2 minutes
  issues: 30000, // 30 seconds
  branches: 60000, // 1 minute
  liveOrders: 15000, // 15 seconds
  satisfaction: 300000, // 5 minutes
} as const;

interface UseGMDashboardOptions {
  branchFilter?: string;
  enabled?: boolean;
}

interface UseGMDashboardResult {
  data: Partial<GMDashboardData>;
  isLoading: boolean;
  isError: boolean;
  errors: Error[];
  refetchAll: () => void;
}

/**
 * Hook for fetching all GM dashboard data with automatic refresh
 */
export function useGMDashboard({
  branchFilter = 'all',
  enabled = true,
}: UseGMDashboardOptions = {}): UseGMDashboardResult {
  const results = useQueries({
    queries: [
      {
        queryKey: ['gm-orders-today', branchFilter],
        queryFn: () => fetchTodayOrderMetrics(branchFilter),
        refetchInterval: REFRESH_INTERVALS.orders,
        enabled,
        staleTime: REFRESH_INTERVALS.orders / 2,
      },
      {
        queryKey: ['gm-revenue-today', branchFilter],
        queryFn: () => fetchTodayRevenue(branchFilter),
        refetchInterval: REFRESH_INTERVALS.revenue,
        enabled,
        staleTime: REFRESH_INTERVALS.revenue / 2,
      },
      {
        queryKey: ['gm-turnaround', branchFilter],
        queryFn: () => fetchTurnaroundMetrics(branchFilter),
        refetchInterval: REFRESH_INTERVALS.turnaround,
        enabled,
        staleTime: REFRESH_INTERVALS.turnaround / 2,
      },
      {
        queryKey: ['gm-staff-on-duty', branchFilter],
        queryFn: () => fetchStaffOnDuty(branchFilter),
        refetchInterval: REFRESH_INTERVALS.staff,
        enabled,
        staleTime: REFRESH_INTERVALS.staff / 2,
      },
      {
        queryKey: ['gm-equipment-status', branchFilter],
        queryFn: () => fetchEquipmentStatus(branchFilter),
        refetchInterval: REFRESH_INTERVALS.equipment,
        enabled,
        staleTime: REFRESH_INTERVALS.equipment / 2,
      },
      {
        queryKey: ['gm-urgent-issues', branchFilter],
        queryFn: () => fetchUrgentIssues(branchFilter),
        refetchInterval: REFRESH_INTERVALS.issues,
        enabled,
        staleTime: REFRESH_INTERVALS.issues / 2,
      },
      {
        queryKey: ['gm-branch-performance', branchFilter],
        queryFn: () => fetchBranchPerformance(branchFilter),
        refetchInterval: REFRESH_INTERVALS.branches,
        enabled,
        staleTime: REFRESH_INTERVALS.branches / 2,
      },
      {
        queryKey: ['gm-live-orders', branchFilter],
        queryFn: () => fetchLiveOrderQueue(branchFilter),
        refetchInterval: REFRESH_INTERVALS.liveOrders,
        enabled,
        staleTime: REFRESH_INTERVALS.liveOrders / 2,
      },
      {
        queryKey: ['gm-satisfaction', branchFilter],
        queryFn: () => fetchSatisfactionMetrics(branchFilter),
        refetchInterval: REFRESH_INTERVALS.satisfaction,
        enabled,
        staleTime: REFRESH_INTERVALS.satisfaction / 2,
      },
    ],
  });

  const [
    ordersResult,
    revenueResult,
    turnaroundResult,
    staffResult,
    equipmentResult,
    issuesResult,
    branchesResult,
    liveOrdersResult,
    satisfactionResult,
  ] = results;

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const errors = results
    .filter((r) => r.error)
    .map((r) => r.error as Error);

  const refetchAll = () => {
    results.forEach((r) => r.refetch());
  };

  const data: Partial<GMDashboardData> = {
    orders: ordersResult.data,
    revenue: revenueResult.data,
    turnaround: turnaroundResult.data,
    staff: staffResult.data?.metrics,
    staffOnDuty: staffResult.data?.staff,
    equipment: equipmentResult.data?.equipment,
    equipmentSummary: equipmentResult.data?.summary,
    issues: issuesResult.data,
    branches: branchesResult.data,
    liveOrders: liveOrdersResult.data,
    satisfaction: satisfactionResult.data,
    lastUpdated: new Date(),
  };

  return {
    data,
    isLoading,
    isError,
    errors,
    refetchAll,
  };
}

/**
 * Hook for fetching only order metrics
 */
export function useGMOrderMetrics(branchFilter: string = 'all') {
  return useQuery<OrderMetrics>({
    queryKey: ['gm-orders-today', branchFilter],
    queryFn: () => fetchTodayOrderMetrics(branchFilter),
    refetchInterval: REFRESH_INTERVALS.orders,
    staleTime: REFRESH_INTERVALS.orders / 2,
  });
}

/**
 * Hook for fetching only revenue metrics
 */
export function useGMRevenueMetrics(branchFilter: string = 'all') {
  return useQuery<RevenueMetrics>({
    queryKey: ['gm-revenue-today', branchFilter],
    queryFn: () => fetchTodayRevenue(branchFilter),
    refetchInterval: REFRESH_INTERVALS.revenue,
    staleTime: REFRESH_INTERVALS.revenue / 2,
  });
}

/**
 * Hook for fetching only live order queue
 */
export function useGMLiveOrders(branchFilter: string = 'all') {
  return useQuery<OrderQueueItem[]>({
    queryKey: ['gm-live-orders', branchFilter],
    queryFn: () => fetchLiveOrderQueue(branchFilter),
    refetchInterval: REFRESH_INTERVALS.liveOrders,
    staleTime: REFRESH_INTERVALS.liveOrders / 2,
  });
}

/**
 * Hook for fetching only urgent issues
 */
export function useGMUrgentIssues(branchFilter: string = 'all') {
  return useQuery<UrgentIssue[]>({
    queryKey: ['gm-urgent-issues', branchFilter],
    queryFn: () => fetchUrgentIssues(branchFilter),
    refetchInterval: REFRESH_INTERVALS.issues,
    staleTime: REFRESH_INTERVALS.issues / 2,
  });
}

/**
 * Hook for fetching only branch performance
 */
export function useGMBranchPerformance(branchFilter: string = 'all') {
  return useQuery<BranchPerformance[]>({
    queryKey: ['gm-branch-performance', branchFilter],
    queryFn: () => fetchBranchPerformance(branchFilter),
    refetchInterval: REFRESH_INTERVALS.branches,
    staleTime: REFRESH_INTERVALS.branches / 2,
  });
}

/**
 * Hook for fetching only equipment status
 */
export function useGMEquipmentStatus(branchFilter: string = 'all') {
  return useQuery<{ equipment: Equipment[]; summary: EquipmentSummary }>({
    queryKey: ['gm-equipment-status', branchFilter],
    queryFn: () => fetchEquipmentStatus(branchFilter),
    refetchInterval: REFRESH_INTERVALS.equipment,
    staleTime: REFRESH_INTERVALS.equipment / 2,
  });
}
