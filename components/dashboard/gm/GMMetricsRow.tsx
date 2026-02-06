/**
 * GM Metrics Row Component
 *
 * Five metric cards: Orders Today, Revenue, Avg Turnaround, Staff on Duty, Satisfaction
 *
 * @module components/dashboard/gm/GMMetricsRow
 */

'use client';

import { motion } from 'framer-motion';
import {
  Package,
  DollarSign,
  Clock,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  OrderMetrics,
  RevenueMetrics,
  TurnaroundMetrics,
  StaffMetrics,
  SatisfactionMetrics,
  GMDashboardTheme,
} from '@/types/gm-dashboard';

interface GMMetricsRowProps {
  orders?: OrderMetrics;
  revenue?: RevenueMetrics;
  turnaround?: TurnaroundMetrics;
  staff?: StaffMetrics;
  satisfaction?: SatisfactionMetrics;
  themeMode: GMDashboardTheme;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  progress?: number | null;  // Can be null if target not configured
  isDark: boolean;
  delay: number;
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  trend,
  progress,
  isDark,
  delay,
}: MetricCardProps) {
  const trendPositive = trend && trend > 0;
  const trendNegative = trend && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'p-5 rounded-2xl transition-all duration-300',
        isDark
          ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10'
          : 'bg-white border border-black/5 shadow-sm hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            isDark ? 'bg-[#2DD4BF]/20' : 'bg-lorenzo-accent-teal/10'
          )}
        >
          <div className={isDark ? 'text-[#2DD4BF]' : 'text-lorenzo-accent-teal'}>
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trendPositive
                ? isDark
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-green-50 text-green-600'
                : trendNegative
                ? isDark
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-red-50 text-red-600'
                : isDark
                ? 'bg-white/10 text-white/60'
                : 'bg-gray-100 text-gray-500'
            )}
          >
            {trendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : trendNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {Math.abs(trend || 0)}%
          </div>
        )}
      </div>

      <p
        className={cn(
          'text-sm mb-1',
          isDark ? 'text-white/60' : 'text-gray-500'
        )}
      >
        {label}
      </p>

      <p
        className={cn(
          'text-3xl font-semibold gm-number',
          isDark ? 'text-white' : 'text-lorenzo-dark-teal'
        )}
      >
        {value}
      </p>

      {subtext && (
        <p
          className={cn(
            'text-xs mt-1',
            isDark ? 'text-white/40' : 'text-gray-400'
          )}
        >
          {subtext}
        </p>
      )}

      {progress !== undefined && progress !== null && (
        <div className="mt-3">
          <div
            className={cn(
              'h-2 rounded-full overflow-hidden',
              isDark ? 'bg-white/10' : 'bg-gray-100'
            )}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, delay: delay + 0.2 }}
              className={cn(
                'h-full rounded-full',
                isDark
                  ? 'bg-gradient-to-r from-[#2DD4BF] to-[#C9A962]'
                  : 'bg-gradient-to-r from-lorenzo-accent-teal to-lorenzo-gold'
              )}
            />
          </div>
          <p
            className={cn(
              'text-xs mt-1',
              isDark ? 'text-white/40' : 'text-gray-400'
            )}
          >
            {progress}% of target
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function GMMetricsRow({
  orders,
  revenue,
  turnaround,
  staff,
  satisfaction,
  themeMode,
}: GMMetricsRowProps) {
  const isDark = themeMode === 'operations';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        icon={<Package className="w-5 h-5" />}
        label="Orders Today"
        value={orders?.total || 0}
        subtext={`${orders?.completed || 0} completed, ${orders?.inProgress || 0} in progress`}
        trend={orders?.trend}
        isDark={isDark}
        delay={0.1}
      />

      <MetricCard
        icon={<DollarSign className="w-5 h-5" />}
        label="Revenue"
        value={formatCurrency(revenue?.today || 0)}
        progress={revenue?.progress}
        trend={revenue?.trend}
        isDark={isDark}
        delay={0.15}
      />

      <MetricCard
        icon={<Clock className="w-5 h-5" />}
        label="Avg. Turnaround"
        value={turnaround?.averageHours !== null && turnaround?.averageHours !== undefined
          ? `${turnaround.averageHours}h`
          : 'No data'}
        subtext={turnaround?.target !== null && turnaround?.target !== undefined
          ? `Target: ${turnaround.target}h`
          : 'Target not set'}
        isDark={isDark}
        delay={0.2}
      />

      <MetricCard
        icon={<Users className="w-5 h-5" />}
        label="Staff on Duty"
        value={staff?.onDuty || 0}
        subtext={`${staff?.onBreak || 0} on break, ${staff?.productivity || 0}% productivity`}
        isDark={isDark}
        delay={0.25}
      />

      <MetricCard
        icon={<Star className="w-5 h-5" />}
        label="Satisfaction"
        value={satisfaction?.score?.toFixed(1) || '0.0'}
        subtext={`${satisfaction?.totalReviews || 0} reviews`}
        trend={satisfaction?.trend}
        isDark={isDark}
        delay={0.3}
      />
    </div>
  );
}
