/**
 * Modern Pipeline Statistics Component
 *
 * Glassmorphic dashboard with animated stat cards and alerts.
 *
 * @module components/modern/ModernPipelineStats
 */

'use client';

import { motion } from 'framer-motion';
import {
  Package,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/pipeline/pipeline-helpers';
import { formatCurrency } from '@/lib/utils/formatters';
import { ModernStatCard, MiniStatCard } from './ModernStatCard';

interface ModernPipelineStatsProps {
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

export function ModernPipelineStats({ stats, className }: ModernPipelineStatsProps) {
  // Calculate completion rate
  const completionRate =
    stats.totalOrders > 0
      ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
      : 0;

  // Determine if there are issues
  const hasBottleneck = stats.bottlenecks.length > 0 && stats.bottlenecks[0].avgTime > 120;
  const hasOverdue = stats.overdueCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('px-6 py-4 space-y-4', className)}
    >
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Orders Today */}
        <ModernStatCard
          title="Orders Today"
          value={stats.todayOrders}
          change={stats.totalOrders > 0 ? Math.round((stats.todayOrders / stats.totalOrders) * 100) : 0}
          changeLabel="of total active"
          icon={<Package className="h-5 w-5" />}
          trend="up"
          delay={0.1}
        />

        {/* Completed Today */}
        <ModernStatCard
          title="Completed"
          value={stats.todayCompleted}
          change={completionRate}
          changeLabel="completion rate"
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={completionRate > 70 ? "up" : "down"}
          delay={0.2}
          variant="gradient"
        />

        {/* Average Processing */}
        <ModernStatCard
          title="Avg Processing"
          value={formatDuration(stats.avgProcessingTime)}
          icon={<Clock className="h-5 w-5" />}
          delay={0.3}
        />

        {/* Today's Revenue */}
        <ModernStatCard
          title="Revenue Today"
          value={stats.todayRevenue}
          format="currency"
          change={8}
          changeLabel="vs yesterday"
          icon={<DollarSign className="h-5 w-5" />}
          trend="up"
          delay={0.4}
          variant="solid"
        />

        {/* Overdue Orders */}
        <ModernStatCard
          title="Overdue"
          value={stats.overdueCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={stats.overdueCount > 0 ? "down" : "neutral"}
          changeLabel={stats.overdueCount > 0 ? "needs attention" : "on track"}
          delay={0.5}
          variant={stats.overdueCount > 0 ? "default" : "gradient"}
        />

        {/* Performance */}
        <ModernStatCard
          title="Efficiency"
          value={`${completionRate}%`}
          icon={<Activity className="h-5 w-5" />}
          trend={completionRate > 80 ? "up" : "down"}
          delay={0.6}
        />
      </div>

      {/* Alerts Section */}
      {(hasBottleneck || hasOverdue) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          {/* Bottleneck Alert */}
          {hasBottleneck && (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 backdrop-blur-sm border-2 border-amber-200 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="p-2 rounded-xl bg-amber-200/50"
                >
                  <Zap className="w-5 h-5 text-amber-600" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">
                    Performance Bottleneck Detected
                  </h4>
                  <p className="text-xs text-amber-700">
                    The <span className="font-semibold">{stats.bottlenecks[0].status}</span> stage is
                    taking an average of{' '}
                    <span className="font-semibold">{formatDuration(stats.bottlenecks[0].avgTime)}</span>.
                    Consider allocating more resources to improve throughput.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Overdue Alert */}
          {hasOverdue && (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="p-4 bg-gradient-to-r from-red-50 to-red-100/50 backdrop-blur-sm border-2 border-red-200 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                  className="p-2 rounded-xl bg-red-200/50"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    {stats.overdueCount} {stats.overdueCount === 1 ? 'Order' : 'Orders'} Overdue
                  </h4>
                  <p className="text-xs text-red-700">
                    These orders have exceeded their estimated completion time.
                    Immediate attention required to maintain customer satisfaction.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                  >
                    View Overdue Orders
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Quick Insights */}
      {!hasBottleneck && !hasOverdue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 bg-gradient-to-r from-green-50 to-green-100/50 backdrop-blur-sm border-2 border-green-200 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="p-2 rounded-xl bg-green-200/50"
            >
              <TrendingUp className="w-5 h-5 text-green-600" />
            </motion.div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900">
                Pipeline Running Smoothly
              </h4>
              <p className="text-xs text-green-700 mt-1">
                All orders are progressing well. {completionRate}% completion rate today.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}