/**
 * Defect Notification Metrics Widget Component (FR-003)
 *
 * Dashboard widget displaying defect notification compliance metrics.
 * Shows compliance rate, pending notifications, and defect breakdown.
 *
 * @module components/features/qc/DefectNotificationMetricsWidget
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DefectNotificationMetricsWidgetProps {
  branchId?: string;
  period?: 'week' | 'month' | 'quarter';
  className?: string;
  compact?: boolean;
}

interface DefectMetricsData {
  totalNotifications: number;
  withinTimeline: number;
  missedDeadline: number;
  complianceRate: number;
  avgTimeToNotify: number;
  byDefectType: Record<string, number>;
  byBranch: Record<string, number>;
  byStatus: Record<string, number>;
  pendingCount: number;
  escalatedCount: number;
  resolvedCount: number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    complianceChange: number;
    previousComplianceRate: number;
    previousTotal: number;
  };
  period: {
    start: string;
    end: string;
  };
}

/**
 * Defect type display labels
 */
const DEFECT_LABELS: Record<string, string> = {
  stain_remaining: 'Stain Remaining',
  color_fading: 'Color Fading',
  shrinkage: 'Shrinkage',
  damage: 'Damage',
  missing_buttons: 'Missing Buttons',
  torn_seams: 'Torn Seams',
  discoloration: 'Discoloration',
  odor: 'Odor',
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
 * DefectNotificationMetricsWidget Component
 */
export function DefectNotificationMetricsWidget({
  branchId,
  period = 'month',
  className,
  compact = false,
}: DefectNotificationMetricsWidgetProps) {
  const startDate = getPeriodStartDate(period);
  const endDate = new Date();

  const { data: metrics, isLoading, error } = useQuery<DefectMetricsData>({
    queryKey: ['defect-notification-metrics', branchId, period],
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

      const response = await fetch(`/api/defect-notifications/metrics?${params}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch defect notification metrics');
      }

      const result = await response.json();
      return result.data;
    },
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  /**
   * Get compliance badge color
   */
  const getComplianceBadge = (rate: number) => {
    if (rate >= 95) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
          Excellent
        </Badge>
      );
    }
    if (rate >= 85) {
      return (
        <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
          Good
        </Badge>
      );
    }
    if (rate >= 70) {
      return (
        <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
          Fair
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
        Needs Improvement
      </Badge>
    );
  };

  /**
   * Get trend icon
   */
  const TrendIcon = () => {
    if (!metrics) return null;

    switch (metrics.trend.direction) {
      case 'up':
        return (
          <span className="flex items-center text-emerald-600 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            +{metrics.trend.complianceChange.toFixed(1)}%
          </span>
        );
      case 'down':
        return (
          <span className="flex items-center text-red-600 text-sm">
            <TrendingDown className="h-4 w-4 mr-1" />
            {metrics.trend.complianceChange.toFixed(1)}%
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
   * Get top defect types
   */
  const getTopDefectTypes = () => {
    if (!metrics?.byDefectType) return [];

    return Object.entries(metrics.byDefectType)
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
          <AlertCircle className="h-8 w-8 mb-2" />
          <span className="text-sm">Unable to load defect metrics</span>
        </div>
      </div>
    );
  }

  // Compact variant
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-xl border bg-card p-4', className)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <span className="font-medium text-sm">Notification Compliance</span>
          </div>
          <TrendIcon />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">{metrics.complianceRate.toFixed(1)}%</span>
          {getComplianceBadge(metrics.complianceRate)}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {metrics.pendingCount} pending
          </span>
          {metrics.escalatedCount > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <AlertTriangle className="h-3 w-3" />
              {metrics.escalatedCount} escalated
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Full variant
  const topDefectTypes = getTopDefectTypes();
  const totalDefects = topDefectTypes.reduce((sum, [_, count]) => sum + count, 0);

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
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold">Defect Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Last {period === 'week' ? '7 days' : period === 'quarter' ? '90 days' : '30 days'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getComplianceBadge(metrics.complianceRate)}
          <TrendIcon />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Compliance Rate */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-sm text-muted-foreground mb-1">Compliance Rate</div>
          <div className="text-2xl font-bold">{metrics.complianceRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">
            {metrics.withinTimeline} of {metrics.withinTimeline + metrics.missedDeadline} on time
          </div>
        </div>

        {/* Avg Notification Time */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Notify Time</div>
          <div className="text-2xl font-bold">
            {metrics.avgTimeToNotify > 0 ? `${metrics.avgTimeToNotify.toFixed(1)}h` : '-'}
          </div>
          <div className="text-xs text-muted-foreground">Hours to notify customer</div>
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
          <div className="rounded-lg bg-red-500/10 p-3">
            <div className="text-lg font-bold text-red-600">{metrics.escalatedCount}</div>
            <div className="text-xs text-muted-foreground">Escalated</div>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-3">
            <div className="text-lg font-bold text-emerald-600">{metrics.resolvedCount}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3">
            <div className="text-lg font-bold text-blue-600">{metrics.totalNotifications}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      {/* Timeline Compliance Visual */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Timeline Compliance</span>
          <span className="text-muted-foreground">
            {metrics.withinTimeline} on time / {metrics.missedDeadline} missed
          </span>
        </div>
        <div className="flex gap-1 h-4 rounded-full overflow-hidden">
          {metrics.withinTimeline + metrics.missedDeadline > 0 ? (
            <>
              <div
                className="bg-emerald-500 transition-all"
                style={{
                  width: `${(metrics.withinTimeline / (metrics.withinTimeline + metrics.missedDeadline)) * 100}%`,
                }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{
                  width: `${(metrics.missedDeadline / (metrics.withinTimeline + metrics.missedDeadline)) * 100}%`,
                }}
              />
            </>
          ) : (
            <div className="bg-muted w-full" />
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            On Time
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            Missed
          </span>
        </div>
      </div>

      {/* Top Defect Types */}
      {topDefectTypes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <BarChart3 className="h-4 w-4" />
            Top Defect Types
          </div>
          <div className="space-y-3">
            {topDefectTypes.map(([defectType, count]) => {
              const percentage = totalDefects > 0 ? (count / totalDefects) * 100 : 0;
              return (
                <div key={defectType}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{DEFECT_LABELS[defectType] || defectType}</span>
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

      {/* Empty state */}
      {topDefectTypes.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
          No defects reported in this period
        </div>
      )}
    </motion.div>
  );
}

export default DefectNotificationMetricsWidget;
