'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Star, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getStaffDashboardMetrics } from '@/lib/db/performance';
import type { TimePeriod } from '@/lib/db/schema';

interface ModernStaffProfileProps {
  /** Employee ID to fetch real metrics for */
  employeeId?: string;
  /** Employee name (fallback or override) */
  name: string;
  /** Employee role */
  role: string;
  /** Avatar URL or initials override */
  avatar?: string;
  /** Time period for metrics */
  period?: TimePeriod;
  className?: string;
}

export function ModernStaffProfile({
  employeeId,
  name,
  role,
  avatar,
  period = 'monthly',
  className = '',
}: ModernStaffProfileProps) {
  // Fetch real metrics from performance service
  const { data: dashboardMetrics, isLoading } = useQuery({
    queryKey: ['staff-dashboard-metrics', employeeId, period],
    queryFn: () => employeeId
      ? getStaffDashboardMetrics(employeeId, period)
      : Promise.resolve(null),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract metrics from dashboard data (use daily by default)
  const currentMetrics = dashboardMetrics?.daily;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comparison = (dashboardMetrics as any)?.comparison;

  // Build metrics array from real data or use defaults
  const metrics = currentMetrics
    ? [
        {
          label: 'Customer Satisfaction',
          value: currentMetrics.customerSatisfaction,
          color: '#2DD4BF',
          trend: comparison
            ? currentMetrics.customerSatisfaction - (comparison.previousOrders > 0
              ? comparison.previousOrders // Use orders as proxy
              : currentMetrics.customerSatisfaction)
            : 0,
        },
        {
          label: 'Accuracy',
          value: currentMetrics.accuracy,
          color: '#C9A962',
          trend: 0,
        },
        {
          label: 'Efficiency',
          value: currentMetrics.efficiency,
          color: '#10B981',
          trend: 0,
        },
      ]
    : [
        { label: 'Customer Satisfaction', value: 0, color: '#2DD4BF', trend: 0 },
        { label: 'Accuracy', value: 0, color: '#C9A962', trend: 0 },
        { label: 'Efficiency', value: 0, color: '#10B981', trend: 0 },
      ];

  // Calculate overall rating (average of metrics)
  const rating = currentMetrics
    ? Number(((currentMetrics.customerSatisfaction + currentMetrics.accuracy + currentMetrics.efficiency) / 3 / 20).toFixed(1))
    : 0;

  // Get rank info from dashboardMetrics (rank is a separate property, not within period metrics)
  const rank = dashboardMetrics?.rank?.rank || 0;
  const totalStaff = dashboardMetrics?.rank?.total || 0;

  // Determine badge based on rank
  const getBadgeInfo = () => {
    if (!rank || !totalStaff) {
      return { emoji: '📊', title: 'Calculating...', subtitle: 'Performance being evaluated' };
    }

    const percentile = ((totalStaff - rank + 1) / totalStaff) * 100;

    if (rank === 1) {
      return { emoji: '🥇', title: 'Top Performer', subtitle: `#1 of ${totalStaff} this ${period}` };
    }
    if (rank === 2) {
      return { emoji: '🥈', title: 'Excellent Work', subtitle: `#2 of ${totalStaff} this ${period}` };
    }
    if (rank === 3) {
      return { emoji: '🥉', title: 'Great Progress', subtitle: `#3 of ${totalStaff} this ${period}` };
    }
    if (percentile >= 75) {
      return { emoji: '⭐', title: 'Above Average', subtitle: `Top ${Math.round(100 - percentile)}% this ${period}` };
    }
    if (percentile >= 50) {
      return { emoji: '🎯', title: 'On Track', subtitle: `Ranked #${rank} of ${totalStaff}` };
    }
    return { emoji: '💪', title: 'Keep Going', subtitle: `Room to grow this ${period}` };
  };

  const badge = getBadgeInfo();

  // Generate avatar initials from name
  const initials =
    avatar ||
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  // Get trend icon
  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (trend < -2) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-white/40" />;
  };

  return (
    <div
      className={cn(
        'bg-linear-to-br from-lorenzo-dark-teal to-lorenzo-deep-teal rounded-3xl p-6 text-white',
        className
      )}
    >
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-5">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-16 h-16 rounded-2xl bg-linear-to-br from-lorenzo-gold to-lorenzo-gold-dark flex items-center justify-center text-2xl font-semibold text-lorenzo-dark-teal"
        >
          {initials}
        </motion.div>
        <div className="flex-1">
          <h3 className="text-xl font-medium">{name}</h3>
          <p className="text-sm text-white/60 mt-0.5">{role}</p>
        </div>
        <div className="text-right">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white/50" />
          ) : (
            <>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-lorenzo-gold fill-lorenzo-gold" />
                <span className="text-2xl font-semibold">{rating || '—'}</span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">Rating</p>
            </>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-white/50" />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-xs text-white/60 mb-3">Performance Metrics</p>
            {metrics.map((metric) => (
              <div key={metric.label} className="mb-3">
                <div className="flex justify-between mb-1.5 items-center">
                  <span className="text-sm text-white/80">{metric.label}</span>
                  <div className="flex items-center gap-1.5">
                    {metric.trend !== 0 && getTrendIcon(metric.trend)}
                    <span className="text-sm font-semibold text-white">
                      {metric.value > 0 ? `${metric.value}%` : '—'}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color || '#2DD4BF' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Achievement Badge */}
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <span className="text-2xl">{badge.emoji}</span>
            <div>
              <p className="text-sm font-medium">{badge.title}</p>
              <p className="text-xs text-white/60">{badge.subtitle}</p>
            </div>
          </div>

          {/* No Data Message */}
          {!employeeId && (
            <div className="mt-4 text-center">
              <p className="text-xs text-white/50">
                Connect your employee profile to see real metrics
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
