/**
 * Pipeline Statistics Component
 *
 * Dashboard displaying key pipeline metrics and statistics.
 *
 * @module components/features/pipeline/PipelineStats
 */

'use client';

import { Card } from '@/components/ui/card';
import {
  Package,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/pipeline/pipeline-helpers';
import { formatCurrency } from '@/lib/utils/formatters';

interface PipelineStatsProps {
  stats: {
    totalOrders: number;
    todayOrders: number;
    completedOrders: number;
    todayCompleted: number;
    avgProcessingTime: number; // in minutes
    todayRevenue: number;
    overdueCount: number;
    bottlenecks: Array<{ status: string; avgTime: number }>;
  };
  className?: string;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorClass?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  trendValue,
  colorClass = 'text-gray-600',
}: StatCardProps) {
  return (
    <Card className="p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={cn('w-5 h-5', colorClass)} />
            <span className="text-sm font-medium text-gray-600">{label}</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-black">{value}</p>
            {subValue && (
              <p className="text-sm text-gray-500">{subValue}</p>
            )}
          </div>
        </div>

        {trend && trendValue && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
              trend === 'up' && 'bg-green-100 text-green-700',
              trend === 'down' && 'bg-red-100 text-red-700',
              trend === 'neutral' && 'bg-gray-100 text-gray-700'
            )}
          >
            <TrendingUp className="w-3 h-3" />
            {trendValue}
          </div>
        )}
      </div>
    </Card>
  );
}

export function PipelineStats({ stats, className }: PipelineStatsProps) {
  // Calculate completion rate
  const completionRate =
    stats.totalOrders > 0
      ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
      : 0;

  // Get bottleneck summary
  const bottleneckSummary =
    stats.bottlenecks.length > 0
      ? `${stats.bottlenecks[0].status} (${formatDuration(stats.bottlenecks[0].avgTime)})`
      : 'None';

  return (
    <div className={cn('bg-white border-b border-gray-200 px-6 py-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Orders Today */}
        <StatCard
          icon={Package}
          label="Orders Today"
          value={stats.todayOrders}
          subValue={`${stats.totalOrders} total active`}
          colorClass="text-blue-600"
        />

        {/* Completed Today */}
        <StatCard
          icon={CheckCircle2}
          label="Completed Today"
          value={stats.todayCompleted}
          subValue={`${stats.completedOrders} total completed`}
          colorClass="text-green-600"
        />

        {/* Average Processing Time */}
        <StatCard
          icon={Clock}
          label="Avg Processing Time"
          value={formatDuration(stats.avgProcessingTime)}
          subValue="Per order"
          colorClass="text-purple-600"
        />

        {/* Today's Revenue */}
        <StatCard
          icon={DollarSign}
          label="Revenue Today"
          value={formatCurrency(stats.todayRevenue)}
          subValue="From today's orders"
          colorClass="text-emerald-600"
        />

        {/* Overdue Orders */}
        <StatCard
          icon={AlertTriangle}
          label="Overdue Orders"
          value={stats.overdueCount}
          subValue={stats.overdueCount > 0 ? 'Requires attention' : 'On track'}
          colorClass={stats.overdueCount > 0 ? 'text-red-600' : 'text-green-600'}
        />

        {/* Completion Rate */}
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${completionRate}%`}
          subValue={bottleneckSummary}
          colorClass="text-amber-600"
        />
      </div>

      {/* Bottleneck Alert */}
      {stats.bottlenecks.length > 0 && stats.bottlenecks[0].avgTime > 120 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Bottleneck Detected
              </p>
              <p className="text-xs text-amber-700 mt-1">
                The <strong>{stats.bottlenecks[0].status}</strong> stage is
                taking an average of{' '}
                <strong>{formatDuration(stats.bottlenecks[0].avgTime)}</strong>.
                Consider allocating more resources to this stage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Alert */}
      {stats.overdueCount > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                {stats.overdueCount} {stats.overdueCount === 1 ? 'Order' : 'Orders'}{' '}
                Overdue
              </p>
              <p className="text-xs text-red-700 mt-1">
                These orders have passed their estimated completion time. Please
                prioritize them to maintain customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
