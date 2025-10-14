/**
 * Pipeline Filters Hook
 *
 * Custom hook for managing pipeline filters and search.
 *
 * @module hooks/usePipelineFilters
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { OrderExtended, OrderStatus } from '@/lib/db/schema';

export interface PipelineFilters {
  branchId: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  customerId: string;
  staffId: string;
  searchQuery: string;
  statusGroup: 'all' | 'pending' | 'processing' | 'ready' | 'completed';
}

const initialFilters: PipelineFilters = {
  branchId: '',
  dateRange: 'all',
  customerId: '',
  staffId: '',
  searchQuery: '',
  statusGroup: 'all',
};

/**
 * Check if order matches date range filter
 */
function matchesDateRange(
  order: OrderExtended,
  dateRange: PipelineFilters['dateRange']
): boolean {
  if (dateRange === 'all') return true;

  const now = new Date();
  const orderDate = order.createdAt.toDate();

  switch (dateRange) {
    case 'today': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return orderDate >= today;
    }
    case 'week': {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo;
    }
    case 'month': {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= monthAgo;
    }
    default:
      return true;
  }
}

/**
 * Check if order matches status group filter
 */
function matchesStatusGroup(
  order: OrderExtended,
  statusGroup: PipelineFilters['statusGroup']
): boolean {
  if (statusGroup === 'all') return true;

  const status = order.status;

  switch (statusGroup) {
    case 'pending':
      return ['received', 'queued'].includes(status);
    case 'processing':
      return ['washing', 'drying', 'ironing', 'quality_check', 'packaging'].includes(
        status
      );
    case 'ready':
      return ['ready', 'out_for_delivery'].includes(status);
    case 'completed':
      return ['delivered', 'collected'].includes(status);
    default:
      return true;
  }
}

/**
 * Hook for managing pipeline filters
 */
export function usePipelineFilters(orders: OrderExtended[]) {
  const [filters, setFilters] = useState<PipelineFilters>(initialFilters);

  // Update individual filter
  const updateFilter = useCallback(
    <K extends keyof PipelineFilters>(key: K, value: PipelineFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Branch filter
      if (filters.branchId && order.branchId !== filters.branchId) {
        return false;
      }

      // Date range filter
      if (!matchesDateRange(order, filters.dateRange)) {
        return false;
      }

      // Customer filter
      if (filters.customerId && order.customerId !== filters.customerId) {
        return false;
      }

      // Staff filter (check who last updated the order)
      if (filters.staffId) {
        const lastUpdate =
          order.statusHistory[order.statusHistory.length - 1];
        if (lastUpdate && lastUpdate.updatedBy !== filters.staffId) {
          return false;
        }
      }

      // Status group filter
      if (!matchesStatusGroup(order, filters.statusGroup)) {
        return false;
      }

      // Search query (order ID, customer name, phone)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesOrderId = order.orderId.toLowerCase().includes(query);
        const matchesCustomerName = order.customerName
          .toLowerCase()
          .includes(query);
        const matchesPhone = order.customerPhone.includes(query);

        if (!matchesOrderId && !matchesCustomerName && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filters]);

  // Count orders per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      received: 0,
      queued: 0,
      washing: 0,
      drying: 0,
      ironing: 0,
      quality_check: 0,
      packaging: 0,
      ready: 0,
      out_for_delivery: 0,
      delivered: 0,
      collected: 0,
    };

    filteredOrders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });

    return counts;
  }, [filteredOrders]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.branchId !== '' ||
      filters.dateRange !== 'all' ||
      filters.customerId !== '' ||
      filters.staffId !== '' ||
      filters.searchQuery !== '' ||
      filters.statusGroup !== 'all'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredOrders,
    statusCounts,
    hasActiveFilters,
  };
}
