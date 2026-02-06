/**
 * GM Branch Performance Component
 *
 * Branch cards showing orders, revenue, target progress, efficiency, and issues
 *
 * @module components/dashboard/gm/GMBranchPerformance
 */

'use client';

import { motion } from 'framer-motion';
import {
  Store,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BranchPerformance, GMDashboardTheme } from '@/types/gm-dashboard';

interface GMBranchPerformanceProps {
  branches: BranchPerformance[];
  themeMode: GMDashboardTheme;
}

export function GMBranchPerformance({
  branches,
  themeMode,
}: GMBranchPerformanceProps) {
  const isDark = themeMode === 'operations';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead':
        return isDark
          ? 'border-l-green-500 bg-green-500/5'
          : 'border-l-green-500 bg-green-50/50';
      case 'on_track':
        return isDark
          ? 'border-l-[#2DD4BF] bg-[#2DD4BF]/5'
          : 'border-l-lorenzo-accent-teal bg-lorenzo-accent-teal/5';
      case 'behind':
        return isDark
          ? 'border-l-red-500 bg-red-500/5'
          : 'border-l-red-500 bg-red-50/50';
      default:
        return isDark
          ? 'border-l-gray-500 bg-white/5'
          : 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ahead':
        return {
          text: 'Ahead',
          className: isDark
            ? 'bg-green-500/20 text-green-400'
            : 'bg-green-50 text-green-600',
          icon: <TrendingUp className="w-3 h-3" />,
        };
      case 'on_track':
        return {
          text: 'On Track',
          className: isDark
            ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]'
            : 'bg-lorenzo-accent-teal/10 text-lorenzo-accent-teal',
          icon: <Target className="w-3 h-3" />,
        };
      case 'behind':
        return {
          text: 'Behind',
          className: isDark
            ? 'bg-red-500/20 text-red-400'
            : 'bg-red-50 text-red-600',
          icon: <TrendingDown className="w-3 h-3" />,
        };
      default:
        return {
          text: 'Unknown',
          className: isDark
            ? 'bg-white/10 text-white/60'
            : 'bg-gray-100 text-gray-500',
          icon: null,
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        'rounded-2xl p-5',
        isDark
          ? 'bg-white/5 backdrop-blur-xl border border-white/10'
          : 'bg-white border border-black/5 shadow-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isDark ? 'bg-[#C9A962]/20' : 'bg-lorenzo-gold/10'
            )}
          >
            <Store
              className={cn(
                'w-5 h-5',
                isDark ? 'text-[#C9A962]' : 'text-lorenzo-gold'
              )}
            />
          </div>
          <div>
            <h3
              className={cn(
                'font-semibold',
                isDark ? 'text-white' : 'text-gray-900'
              )}
            >
              Branch Performance
            </h3>
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {branches.length} active branches
            </p>
          </div>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.length === 0 ? (
          <div
            className={cn(
              'col-span-full text-center py-10',
              isDark ? 'text-white/40' : 'text-gray-400'
            )}
          >
            <Store className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No branch data available</p>
          </div>
        ) : (
          branches.map((branch, index) => {
            const statusBadge = getStatusBadge(branch.status);

            return (
              <motion.div
                key={branch.branchId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  'rounded-xl p-4 border-l-4 transition-all hover:scale-[1.02]',
                  getStatusColor(branch.status),
                  isDark
                    ? 'border border-white/5'
                    : 'border border-black/5'
                )}
              >
                {/* Branch Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4
                      className={cn(
                        'font-medium',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {branch.name}
                    </h4>
                    <p
                      className={cn(
                        'text-xs',
                        isDark ? 'text-white/40' : 'text-gray-400'
                      )}
                    >
                      {branch.branchId}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      statusBadge.className
                    )}
                  >
                    {statusBadge.icon}
                    {statusBadge.text}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p
                      className={cn(
                        'text-xs',
                        isDark ? 'text-white/40' : 'text-gray-400'
                      )}
                    >
                      Orders Today
                    </p>
                    <p
                      className={cn(
                        'text-xl font-semibold gm-number',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {branch.ordersToday}
                    </p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-xs',
                        isDark ? 'text-white/40' : 'text-gray-400'
                      )}
                    >
                      Revenue
                    </p>
                    <p
                      className={cn(
                        'text-xl font-semibold gm-number',
                        isDark ? 'text-[#C9A962]' : 'text-lorenzo-gold'
                      )}
                    >
                      {formatCurrency(branch.revenue)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={isDark ? 'text-white/60' : 'text-gray-500'}>
                      Target Progress
                    </span>
                    <span
                      className={cn(
                        'font-medium gm-number',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {branch.targetProgress}%
                    </span>
                  </div>
                  <div
                    className={cn(
                      'h-2 rounded-full overflow-hidden',
                      isDark ? 'bg-white/10' : 'bg-gray-100'
                    )}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(branch.targetProgress, 100)}%` }}
                      transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                      className={cn(
                        'h-full rounded-full',
                        branch.targetProgress >= 100
                          ? 'bg-green-500'
                          : branch.targetProgress >= 80
                          ? isDark
                            ? 'bg-[#2DD4BF]'
                            : 'bg-lorenzo-accent-teal'
                          : 'bg-amber-500'
                      )}
                    />
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Users
                      className={cn(
                        'w-3.5 h-3.5',
                        isDark ? 'text-white/40' : 'text-gray-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        isDark ? 'text-white/60' : 'text-gray-500'
                      )}
                    >
                      {branch.staffOnDuty} staff
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-xs',
                        isDark ? 'text-white/60' : 'text-gray-500'
                      )}
                    >
                      {branch.efficiency}% efficiency
                    </span>
                  </div>
                  {branch.activeIssues > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-amber-500">
                        {branch.activeIssues} issue{branch.activeIssues > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
