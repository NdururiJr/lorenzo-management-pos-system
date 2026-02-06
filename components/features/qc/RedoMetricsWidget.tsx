/**
 * Redo Metrics Widget Component (FR-002)
 *
 * Dashboard widget displaying redo items metrics and statistics.
 * Shows redo rate, pending items, trend, and breakdown by reason.
 *
 * @module components/features/qc/RedoMetricsWidget
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface RedoMetricsWidgetProps {
  branchId?: string;
  period?: 'week' | 'month' | 'quarter';
  className?: string;
  compact?: boolean;
}

interface RedoMetricsData {
  totalRedoItems: number;
  byReasonCode: Record<string, number>;
  byBranch: Record<string, number>;
  byStatus: Record<string, number>;
  redoRate: number;
  avgResolutionTime: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  rejectedCount: number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    previousTotal: number;
  };
  period: {
    start: string;
    end: string;
  };
  totalOrdersInPeriod: number;
}

/**
 * Reason code display labels
 */
const REASON_LABELS: Record<string, string> = {
  quality_issue: 'Quality Issue',
  damage: 'Damage',
  incomplete_service: 'Incomplete Service',
  wrong_service: 'Wrong Service',
  customer_complaint: 'Customer Complaint',
  stain_not_removed: 'Stain Not Removed',
  shrinkage: 'Shrinkage',
  color_damage: 'Color Damage',
  other: 'Other',
};

/**
 * Get period start date
 */
function getPeriodStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      return weekStart;
    case 'quarter':
      const quarterStart = new Date(now);
      quarterStart.setDate(quarterStart.getDate() - 90);
      return quarterStart;
    case 'month':
    default:
      const monthStart = new Date(now);
      monthStart.setDate(monthStart.getDate() - 30);
      return monthStart;
  }
}

/**
 * RedoMetricsWidget Component
 */
export function RedoMetricsWidget({
  branchId,
  period = 'month',
  className,
  compact = false,
}: RedoMetricsWidgetProps) {
  const startDate = getPeriodStartDate(period);
  const endDate = new Date();

  const { data: metrics, isLoading, error } = useQuery<RedoMetricsData>({
    queryKey: ['redo-metrics', branchId, period],
    queryFn: async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      const idToken = await currentUser.getIdToken();

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      if (branchId) {
        params.append('branchId', branchId);
      }

      const response = await fetch(`/api/redo-items/metrics?${params}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch redo metrics');
      }

      const result = await response.json();
      return result.data;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  /**
   * Get trend icon component
   */
  const TrendIcon = () => {
    if (!metrics) return null;

    switch (metrics.trend.direction) {
      case 'up':
        return (
          <span className="flex items-center text-red-500 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            +{metrics.trend.percentage.toFixed(1)}%
          </span>
        );
      case 'down':
        return (
          <span className="flex items-center text-emerald-500 text-sm">
            <TrendingDown className="h-4 w-4 mr-1" />
            {metrics.trend.percentage.toFixed(1)}%
          </span>
        );
      default:
        return (
          <span className="flex items-center text-muted-foreground text-sm">
            <Minus className="h-4 w-4 mr-1" />
            Stable
          </span>
        );
    }
  };

  /**
   * Get top reasons sorted by count
   */
  const getTopReasons = () => {
    if (!metrics?.byReasonCode) return [];

    return Object.entries(metrics.byReasonCode)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border bg-card p-6', className)}>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !metrics) {
    return (
      <div className={cn('rounded-xl border bg-card p-6', className)}>
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <span className="text-sm">Unable to load redo metrics</span>
        </div>
      </div>
    );
  }

  // Compact variant for smaller widgets
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-xl border bg-card p-4', className)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg">
              <RefreshCw className="h-4 w-4 text-amber-500" />
            </div>
            <span className="font-medium text-sm">Redo Rate</span>
          </div>
          <TrendIcon />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">{metrics.redoRate.toFixed(2)}%</span>
          <span className="text-sm text-muted-foreground">
            ({metrics.totalRedoItems} items)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {metrics.pendingCount} pending
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {metrics.completedCount} completed
          </span>
        </div>
      </motion.div>
    );
  }

  // Full variant
  const topReasons = getTopReasons();
  const totalReasons = topReasons.reduce((sum, [_, count]) => sum + count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('rounded-xl border bg-card p-6', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <RefreshCw className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold">Redo Items</h3>
            <p className="text-sm text-muted-foreground">
              Last {period === 'week' ? '7 days' : period === 'quarter' ? '90 days' : '30 days'}
            </p>
          </div>
        </div>
        <TrendIcon />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Redo Rate */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-sm text-muted-foreground mb-1">Redo Rate</div>
          <div className="text-2xl font-bold">{metrics.redoRate.toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground">
            {metrics.totalRedoItems} of {metrics.totalOrdersInPeriod} orders
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Resolution</div>
          <div className="text-2xl font-bold">
            {metrics.avgResolutionTime > 0 ? `${metrics.avgResolutionTime.toFixed(1)}h` : '-'}
          </div>
          <div className="text-xs text-muted-foreground">Hours to complete</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mb-6">
        <div className="text-sm font-medium mb-3">Status Overview</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-amber-500/10 p-3">
            <div className="text-lg font-bold text-amber-600">{metrics.pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3">
            <div className="text-lg font-bold text-blue-600">{metrics.inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-3">
            <div className="text-lg font-bold text-emerald-600">{metrics.completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="rounded-lg bg-red-500/10 p-3">
            <div className="text-lg font-bold text-red-600">{metrics.rejectedCount}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>
      </div>

      {/* Top Reasons */}
      {topReasons.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <BarChart3 className="h-4 w-4" />
            Top Reasons
          </div>
          <div className="space-y-3">
            {topReasons.map(([reason, count]) => {
              const percentage = totalReasons > 0 ? (count / totalReasons) * 100 : 0;
              return (
                <div key={reason}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{REASON_LABELS[reason] || reason}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for top reasons */}
      {topReasons.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
          No redo items in this period
        </div>
      )}
    </motion.div>
  );
}

export default RedoMetricsWidget;
