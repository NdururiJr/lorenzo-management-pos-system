'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  getPerformanceHistory,
  getDateRangeForPeriod,
  getPerformanceComparison,
  getPreviousPeriod,
} from '@/lib/db/performance';
import type { TimePeriod, PerformanceHistoryItem } from '@/lib/db/schema';
import { format, addDays, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';

interface ModernPerformanceChartProps {
  /** Employee ID to fetch data for */
  employeeId?: string;
  /** Title override */
  title?: string;
  /** Subtitle override */
  subtitle?: string;
  className?: string;
}

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export function ModernPerformanceChart({
  employeeId,
  title = 'My Performance',
  subtitle = 'Orders processed over time',
  className = '',
}: ModernPerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('weekly');
  const [referenceDate, setReferenceDate] = useState(new Date());

  // Get current date range
  const dateRange = getDateRangeForPeriod(selectedPeriod, referenceDate);

  // Fetch performance history
  const { data: history, isLoading } = useQuery({
    queryKey: ['performance-history', employeeId, selectedPeriod, referenceDate.toISOString()],
    queryFn: () => employeeId
      ? getPerformanceHistory(employeeId, selectedPeriod, 7)
      : Promise.resolve([] as PerformanceHistoryItem[]),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch comparison data
  const { data: comparison } = useQuery({
    queryKey: ['performance-comparison', employeeId, selectedPeriod, referenceDate.toISOString()],
    queryFn: () => employeeId
      ? getPerformanceComparison(employeeId, selectedPeriod, referenceDate)
      : Promise.resolve(null),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });

  // Navigate to previous period
  const goToPrevious = () => {
    setReferenceDate(getPreviousPeriod(selectedPeriod, referenceDate));
  };

  // Navigate to next period
  const goToNext = () => {
    const nextDate = (() => {
      switch (selectedPeriod) {
        case 'daily': return addDays(referenceDate, 1);
        case 'weekly': return addWeeks(referenceDate, 1);
        case 'monthly': return addMonths(referenceDate, 1);
        case 'quarterly': return addQuarters(referenceDate, 1);
        case 'yearly': return addYears(referenceDate, 1);
      }
    })();

    // Don't go into future
    if (nextDate <= new Date()) {
      setReferenceDate(nextDate);
    }
  };

  // Go to today
  const goToToday = () => {
    setReferenceDate(new Date());
  };

  // Check if we can go forward
  const canGoNext = (() => {
    const nextDate = (() => {
      switch (selectedPeriod) {
        case 'daily': return addDays(referenceDate, 1);
        case 'weekly': return addWeeks(referenceDate, 1);
        case 'monthly': return addMonths(referenceDate, 1);
        case 'quarterly': return addQuarters(referenceDate, 1);
        case 'yearly': return addYears(referenceDate, 1);
      }
    })();
    return nextDate <= new Date();
  })();

  // Calculate totals from history
  const totalOrders = history?.reduce((sum, h) => sum + h.ordersProcessed, 0) || 0;
  const totalGarments = history?.reduce((sum, h) => sum + h.garmentsProcessed, 0) || 0;
  const targetsMet = history?.filter(h => h.ordersProcessed >= h.targetOrders).length || 0;
  const avgEfficiency = history && history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.metrics.efficiency, 0) / history.length)
    : 0;

  // Max for scaling chart
  const maxOrders = Math.max(...(history?.map(h => h.ordersProcessed) || [1]), 1);

  // Default/fallback data
  const fallbackData = [
    { label: 'Mon', ordersProcessed: 0, targetOrders: 15, garmentsProcessed: 0 },
    { label: 'Tue', ordersProcessed: 0, targetOrders: 15, garmentsProcessed: 0 },
    { label: 'Wed', ordersProcessed: 0, targetOrders: 15, garmentsProcessed: 0 },
    { label: 'Thu', ordersProcessed: 0, targetOrders: 15, garmentsProcessed: 0 },
    { label: 'Fri', ordersProcessed: 0, targetOrders: 15, garmentsProcessed: 0 },
    { label: 'Sat', ordersProcessed: 0, targetOrders: 20, garmentsProcessed: 0 },
    { label: 'Sun', ordersProcessed: 0, targetOrders: 10, garmentsProcessed: 0 },
  ];

  const chartData = history && history.length > 0 ? history : fallbackData;

  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-6 shadow-card-teal border border-lorenzo-teal/10',
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-lorenzo-dark-teal">{title}</h3>
          <p className="text-sm text-lorenzo-teal/60 mt-1">{subtitle}</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1 bg-lorenzo-cream p-1 rounded-xl flex-wrap">
          {TIME_PERIODS.map(period => (
            <button
              key={period.value}
              onClick={() => {
                setSelectedPeriod(period.value);
                setReferenceDate(new Date()); // Reset to current when changing period
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                selectedPeriod === period.value
                  ? 'bg-lorenzo-deep-teal text-white'
                  : 'text-lorenzo-teal hover:bg-lorenzo-teal/10'
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range & Navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={goToPrevious}
          className="p-1.5 rounded-lg hover:bg-lorenzo-cream transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-lorenzo-teal" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-lorenzo-teal/60" />
          <span className="text-sm font-medium text-lorenzo-dark-teal">
            {dateRange.label}
          </span>
          {selectedPeriod === 'weekly' && (
            <span className="text-xs text-lorenzo-teal/50">
              ({format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d')})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs text-lorenzo-teal hover:bg-lorenzo-cream rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canGoNext
                ? 'hover:bg-lorenzo-cream'
                : 'opacity-50 cursor-not-allowed'
            )}
          >
            <ChevronRight className="w-4 h-4 text-lorenzo-teal" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && employeeId ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-lorenzo-teal/50" />
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-lorenzo-cream rounded-2xl">
            <div>
              <p className="text-xs text-lorenzo-teal/60">Total Orders</p>
              <p className="text-2xl font-semibold text-lorenzo-dark-teal mt-1">
                {totalOrders}
              </p>
              {comparison && (
                <p className={cn(
                  'text-xs mt-0.5',
                  comparison.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {comparison.changePercent >= 0 ? '↑' : '↓'} {Math.abs(comparison.changePercent).toFixed(1)}% vs prev
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-lorenzo-teal/60">Garments</p>
              <p className="text-2xl font-semibold text-lorenzo-dark-teal mt-1">
                {totalGarments}
              </p>
              <p className="text-xs text-lorenzo-teal/50 mt-0.5">processed</p>
            </div>
            <div>
              <p className="text-xs text-lorenzo-teal/60">Target Met</p>
              <p className="text-2xl font-semibold text-lorenzo-gold mt-1">
                {targetsMet}/{chartData.length}
              </p>
              {targetsMet >= 5 && (
                <p className="text-xs text-lorenzo-gold mt-0.5">Streak!</p>
              )}
            </div>
            <div>
              <p className="text-xs text-lorenzo-teal/60">Efficiency</p>
              <p className="text-2xl font-semibold text-lorenzo-accent-teal mt-1">
                {avgEfficiency}%
              </p>
              <p className="text-xs text-lorenzo-teal/50 mt-0.5">
                {avgEfficiency >= 85 ? 'Above avg' : avgEfficiency >= 70 ? 'Average' : 'Below avg'}
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div>
            <div className="flex items-end gap-3 h-44 mb-2">
              {chartData.map((data, i) => {
                const height = maxOrders > 0
                  ? (data.ordersProcessed / maxOrders) * 100
                  : 0;
                const metTarget = data.ordersProcessed >= data.targetOrders;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <div className="relative w-full h-full flex flex-col justify-end">
                      {/* Target marker */}
                      {maxOrders > 0 && (
                        <div
                          className="absolute left-0 right-0 h-0.5 bg-lorenzo-gold/50"
                          style={{ bottom: `${(data.targetOrders / maxOrders) * 100}%` }}
                        />
                      )}
                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 5)}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={cn(
                          'w-full rounded-t-lg min-h-5 flex items-start justify-center pt-2',
                          data.ordersProcessed === 0
                            ? 'bg-gray-200'
                            : metTarget
                              ? 'bg-lorenzo-accent-teal'
                              : 'bg-lorenzo-deep-teal'
                        )}
                      >
                        {data.ordersProcessed > 0 && (
                          <span className="text-xs font-semibold text-white">
                            {data.ordersProcessed}
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              {chartData.map((data, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-xs text-lorenzo-teal/60">{data.label}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-lorenzo-accent-teal" />
                <span className="text-xs text-lorenzo-teal">Target met</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-lorenzo-deep-teal" />
                <span className="text-xs text-lorenzo-teal">Below target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-lorenzo-gold" />
                <span className="text-xs text-lorenzo-teal">Target line</span>
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {!employeeId && (
            <div className="text-center py-8">
              <p className="text-sm text-lorenzo-teal/50">
                Connect your employee ID to see real performance data
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
