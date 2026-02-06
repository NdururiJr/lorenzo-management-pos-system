/**
 * Branch Comparison Component
 *
 * Sortable table comparing performance across all branches.
 * Shows: Revenue, Orders, Avg Processing Time, Quality Score, Trend
 * Color-coded performance indicators.
 *
 * @module components/features/director/BranchComparison
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getActiveBranches } from '@/lib/db/index';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Building2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Order } from '@/lib/db/schema';

interface BranchComparisonProps {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

interface BranchMetrics {
  branchId: string;
  name: string;
  revenue: number;
  orders: number;
  avgProcessingTime: number; // in hours
  qualityScore: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

type SortField = 'name' | 'revenue' | 'orders' | 'avgProcessingTime' | 'qualityScore';
type SortDirection = 'asc' | 'desc';

/**
 * Get date range for current and previous periods
 * Used to calculate trends by comparing current vs previous period
 */
function getDateRanges(period: string): {
  current: { start: Date; end: Date };
  previous: { start: Date; end: Date };
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let currentStart: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (period) {
    case 'today':
      currentStart = today;
      previousStart = new Date(today);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = new Date(today);
      previousEnd.setMilliseconds(-1); // End of yesterday
      break;
    case 'week':
      currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - currentStart.getDay() + 1); // Monday of current week
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7); // Monday of previous week
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1); // End of previous week
      break;
    case 'month':
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1); // End of previous month
      break;
    case 'quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
      previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
      if (currentQuarter === 0) {
        previousStart = new Date(now.getFullYear() - 1, 9, 1); // Q4 of previous year
      }
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1); // End of previous quarter
      break;
    case 'year':
    default:
      currentStart = new Date(now.getFullYear(), 0, 1);
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1); // End of previous year
      break;
  }

  return {
    current: { start: currentStart, end: now },
    previous: { start: previousStart, end: previousEnd },
  };
}

/**
 * Statuses that indicate an order has passed the quality check stage
 * Orders with these statuses have successfully completed QC
 */
const PASSED_QC_STATUSES = ['packaging', 'ready', 'out_for_delivery', 'delivered', 'collected'];

export function BranchComparison({ period }: BranchComparisonProps) {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data: branchMetrics, isLoading } = useQuery<BranchMetrics[]>({
    queryKey: ['branch-comparison', period],
    queryFn: async () => {
      // Fetch all branches
      const branches = await getActiveBranches();
      const ranges = getDateRanges(period);

      // Fetch orders for current period
      const ordersRef = collection(db, 'orders');
      const currentOrdersQuery = query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(ranges.current.start)),
        where('createdAt', '<=', Timestamp.fromDate(ranges.current.end)),
        orderBy('createdAt', 'desc')
      );
      const currentSnapshot = await getDocs(currentOrdersQuery);
      const currentOrders = currentSnapshot.docs.map((doc) => doc.data() as Order);

      // Fetch orders for previous period (for trend calculation)
      const previousOrdersQuery = query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(ranges.previous.start)),
        where('createdAt', '<=', Timestamp.fromDate(ranges.previous.end)),
        orderBy('createdAt', 'desc')
      );
      const previousSnapshot = await getDocs(previousOrdersQuery);
      const previousOrders = previousSnapshot.docs.map((doc) => doc.data() as Order);

      // Calculate metrics per branch
      const metrics: BranchMetrics[] = branches.map((branch) => {
        // Current period data
        const branchCurrentOrders = currentOrders.filter((o) => o.branchId === branch.branchId);
        const currentRevenue = branchCurrentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const orderCount = branchCurrentOrders.length;

        // Previous period data for trend calculation
        const branchPreviousOrders = previousOrders.filter((o) => o.branchId === branch.branchId);
        const previousRevenue = branchPreviousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Calculate average processing time (from received to queued_for_delivery/delivered) - FR-008
        const completedOrders = branchCurrentOrders.filter(
          (o) => o.status === 'queued_for_delivery' || o.status === 'delivered' || o.status === 'collected'
        );
        let avgProcessingTime = 0;
        if (completedOrders.length > 0) {
          const totalTime = completedOrders.reduce((sum, o) => {
            if (o.createdAt && o.actualCompletion) {
              return sum + (o.actualCompletion.seconds - o.createdAt.seconds);
            }
            return sum;
          }, 0);
          avgProcessingTime = totalTime / completedOrders.length / 3600; // Convert to hours
        }

        // Calculate quality score based on orders that passed quality check
        // Orders with status in PASSED_QC_STATUSES have successfully completed QC
        let qualityScore = 100; // Default to 100% if no orders
        if (branchCurrentOrders.length > 0) {
          const passedQCOrders = branchCurrentOrders.filter((o) =>
            PASSED_QC_STATUSES.includes(o.status)
          );
          qualityScore = (passedQCOrders.length / branchCurrentOrders.length) * 100;
        }

        // Calculate trend as percentage change from previous period revenue
        // Formula: ((current - previous) / previous) * 100
        let trendValue = 0;
        if (previousRevenue > 0) {
          trendValue = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        } else if (currentRevenue > 0) {
          // If no previous revenue but has current revenue, show 100% growth
          trendValue = 100;
        }
        // If both are 0, trendValue remains 0

        // Determine trend direction (threshold of 2% to avoid noise)
        const trend = trendValue > 2 ? 'up' : trendValue < -2 ? 'down' : 'stable';

        return {
          branchId: branch.branchId,
          name: branch.name,
          revenue: currentRevenue,
          orders: orderCount,
          avgProcessingTime,
          qualityScore,
          trend,
          trendValue,
        };
      });

      return metrics;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMetrics = branchMetrics
    ? [...branchMetrics].sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        if (sortField === 'name') {
          return multiplier * a.name.localeCompare(b.name);
        }
        return multiplier * (a[sortField] - b[sortField]);
      })
    : [];

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-white/40" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1 text-lorenzo-accent-teal" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-lorenzo-accent-teal" />
    );
  };

  const TrendIcon = ({ trend, value }: { trend: string; value: number }) => {
    if (trend === 'up') {
      return (
        <span className="flex items-center text-emerald-400 text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          +{value.toFixed(1)}%
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="flex items-center text-red-400 text-sm">
          <TrendingDown className="h-4 w-4 mr-1" />
          {value.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-white/50 text-sm">
        <Minus className="h-4 w-4 mr-1" />
        0%
      </span>
    );
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 95) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Excellent
        </span>
      );
    }
    if (score >= 85) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lorenzo-accent-teal/20 text-lorenzo-accent-teal border border-lorenzo-accent-teal/30">
          Good
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Fair
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
        Needs Attention
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lorenzo-gold/20 rounded-lg">
            <Building2 className="h-5 w-5 text-lorenzo-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Branch Performance</h3>
            <p className="text-sm text-white/50">Compare metrics across all branches</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-lorenzo-accent-teal" />
          </div>
        ) : sortedMetrics.length === 0 ? (
          <div className="text-center py-12 text-white/50">
            No branch data available for this period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead
                    className="cursor-pointer hover:bg-white/5 text-white/70 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center">
                      Branch
                      <SortIcon field="name" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-white/5 text-white/70 text-right transition-colors"
                    onClick={() => handleSort('revenue')}
                  >
                    <span className="flex items-center justify-end">
                      Revenue
                      <SortIcon field="revenue" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-white/5 text-white/70 text-right transition-colors"
                    onClick={() => handleSort('orders')}
                  >
                    <span className="flex items-center justify-end">
                      Orders
                      <SortIcon field="orders" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-white/5 text-white/70 text-right transition-colors"
                    onClick={() => handleSort('avgProcessingTime')}
                  >
                    <span className="flex items-center justify-end">
                      Avg Time
                      <SortIcon field="avgProcessingTime" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-white/5 text-white/70 text-center transition-colors"
                    onClick={() => handleSort('qualityScore')}
                  >
                    <span className="flex items-center justify-center">
                      Quality
                      <SortIcon field="qualityScore" />
                    </span>
                  </TableHead>
                  <TableHead className="text-white/70 text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMetrics.map((branch, index) => (
                  <motion.tr
                    key={branch.branchId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <TableCell className="font-medium text-white">{branch.name}</TableCell>
                    <TableCell className="text-right font-mono text-lorenzo-accent-teal">
                      {formatCurrency(branch.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-white/80">{branch.orders}</TableCell>
                    <TableCell className="text-right text-white/80">
                      {branch.avgProcessingTime > 0
                        ? `${branch.avgProcessingTime.toFixed(1)}h`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPerformanceBadge(branch.qualityScore)}
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendIcon trend={branch.trend} value={branch.trendValue} />
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
