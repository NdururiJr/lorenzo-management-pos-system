/**
 * Predictive Performance Chart Component
 *
 * SVG-based bar chart showing revenue performance with:
 * - Historical data (past 3 months): Solid teal gradient bars
 * - Projected data (next 3 months): Semi-transparent teal bars
 * - Goal line: Dashed gold line across chart
 * - Confidence corridor: Shaded purple area for projections
 * - Trajectory line: Dashed teal connecting projection points
 *
 * @module components/features/director/PredictivePerformanceChart
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp } from 'lucide-react';
import type { TransactionExtended } from '@/lib/db/schema';

interface PredictivePerformanceChartProps {
  timeframe: 'today' | 'week' | 'month' | 'quarter' | 'year';
  branchId: string;
  /** Optional branch name for display - if not provided, will show branchId or "All Branches" */
  branchName?: string;
}

interface MonthlyRevenueData {
  month: string;
  monthKey: string;
  actual?: number;
  projected?: number;
  goal: number;
  isProjection: boolean;
  isSampleData?: boolean;
}

/**
 * Get the date range for fetching historical data (past 3 months)
 */
function getHistoricalDateRange(): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1); // Start of 3 months ago
  return { start, end };
}

/**
 * Get month names for the chart (3 past + 3 future)
 */
function getMonthLabels(): string[] {
  const months = [];
  const now = new Date();

  // Past 3 months (including current)
  for (let i = 2; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en-US', { month: 'short' }));
  }

  // Future 3 months
  for (let i = 1; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(date.toLocaleDateString('en-US', { month: 'short' }));
  }

  return months;
}

/**
 * Calculate linear projection based on historical trend
 */
function calculateProjections(
  historicalData: number[],
  baseGoal: number
): { projections: number[]; confidenceUpper: number[]; confidenceLower: number[] } {
  if (historicalData.length < 2) {
    // Not enough data, use simple growth assumption
    const lastValue = historicalData[historicalData.length - 1] || baseGoal;
    return {
      projections: [lastValue * 1.05, lastValue * 1.10, lastValue * 1.15],
      confidenceUpper: [lastValue * 1.12, lastValue * 1.18, lastValue * 1.25],
      confidenceLower: [lastValue * 0.98, lastValue * 1.02, lastValue * 1.05],
    };
  }

  // Calculate average growth rate
  let totalGrowthRate = 0;
  for (let i = 1; i < historicalData.length; i++) {
    if (historicalData[i - 1] > 0) {
      totalGrowthRate += (historicalData[i] - historicalData[i - 1]) / historicalData[i - 1];
    }
  }
  const avgGrowthRate = totalGrowthRate / (historicalData.length - 1);

  // Clamp growth rate to reasonable bounds
  const growthRate = Math.max(-0.1, Math.min(0.3, avgGrowthRate));

  const lastValue = historicalData[historicalData.length - 1] || baseGoal;
  const projections: number[] = [];
  const confidenceUpper: number[] = [];
  const confidenceLower: number[] = [];

  for (let i = 1; i <= 3; i++) {
    const projected = lastValue * Math.pow(1 + growthRate, i);
    projections.push(projected);
    // Confidence corridor widens as we project further
    const uncertainty = 0.08 * i;
    confidenceUpper.push(projected * (1 + uncertainty));
    confidenceLower.push(projected * (1 - uncertainty));
  }

  return { projections, confidenceUpper, confidenceLower };
}

export function PredictivePerformanceChart({ timeframe, branchId, branchName }: PredictivePerformanceChartProps) {
  // Determine display name for the branch
  const displayBranchName = useMemo(() => {
    if (branchId === 'all') return 'All Branches';
    if (branchName) return branchName;
    // Fallback: format branchId for display (e.g., "BR-KILIMANI-001" -> "Kilimani")
    const parts = branchId.split('-');
    if (parts.length >= 2) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    }
    return branchId;
  }, [branchId, branchName]);
  const _monthLabels = useMemo(() => getMonthLabels(), []);

  const { data: revenueData, isLoading, error } = useQuery<MonthlyRevenueData[]>({
    queryKey: ['predictive-performance', timeframe, branchId],
    queryFn: async () => {
      const range = getHistoricalDateRange();
      const transactionsRef = collection(db, 'transactions');

      // Build query with proper ordering for Firestore composite index
      // Index required: branchId (ASC) + status (ASC) + timestamp (DESC)
      // Or for 'all' branches: status (ASC) + timestamp (DESC)
      let transactionsQuery;

      if (branchId !== 'all') {
        // Query for specific branch - uses branchId + status + timestamp index
        transactionsQuery = query(
          transactionsRef,
          where('branchId', '==', branchId),
          where('status', '==', 'completed'),
          where('timestamp', '>=', Timestamp.fromDate(range.start)),
          where('timestamp', '<=', Timestamp.fromDate(range.end)),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Query for all branches - uses status + timestamp index
        transactionsQuery = query(
          transactionsRef,
          where('status', '==', 'completed'),
          where('timestamp', '>=', Timestamp.fromDate(range.start)),
          where('timestamp', '<=', Timestamp.fromDate(range.end)),
          orderBy('timestamp', 'desc')
        );
      }

      const snapshot = await getDocs(transactionsQuery);

      // Debug: Log query results
      console.log(`[PredictivePerformanceChart] Queried transactions for branchId: ${branchId}`);
      console.log(`[PredictivePerformanceChart] Date range: ${range.start.toISOString()} to ${range.end.toISOString()}`);
      console.log(`[PredictivePerformanceChart] Found ${snapshot.size} completed transactions`);

      // Group transactions by month
      const monthlyRevenue = new Map<string, number>();

      snapshot.docs.forEach((doc) => {
        const transaction = doc.data() as TransactionExtended;
        if (transaction.timestamp && transaction.amount) {
          const date = new Date(transaction.timestamp.seconds * 1000);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const current = monthlyRevenue.get(monthKey) || 0;
          monthlyRevenue.set(monthKey, current + transaction.amount);
        }
      });

      // Debug: Log monthly revenue breakdown
      console.log('[PredictivePerformanceChart] Monthly revenue:', Object.fromEntries(monthlyRevenue));

      // Build historical data array
      const now = new Date();
      const historicalValues: number[] = [];
      const result: MonthlyRevenueData[] = [];

      // If no transaction data exists, use sample data for visualization
      const hasRealData = monthlyRevenue.size > 0;

      // Sample data values (deterministic, trending upward)
      const sampleDataValues = [520000, 610000, 680000];

      // Past 3 months (including current)
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });

        // Use real data if available, otherwise use sample data for demo
        const actual = hasRealData
          ? (monthlyRevenue.get(monthKey) || 0)
          : sampleDataValues[2 - i]; // Trending upward sample data

        historicalValues.push(actual);

        // Goal is 10% above average or previous month
        const baseGoal = actual > 0 ? actual * 1.1 : 700000;

        result.push({
          month: monthLabel,
          monthKey,
          actual,
          goal: baseGoal,
          isProjection: false,
          isSampleData: !hasRealData,
        });
      }

      // Calculate base goal from historical average
      const avgRevenue = historicalValues.filter(v => v > 0).length > 0
        ? historicalValues.filter(v => v > 0).reduce((a, b) => a + b, 0) / historicalValues.filter(v => v > 0).length
        : 700000;

      // Calculate projections
      const { projections, confidenceUpper: _confidenceUpper, confidenceLower: _confidenceLower } = calculateProjections(historicalValues, avgRevenue);

      // Future 3 months
      for (let i = 0; i < 3; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        // Goal grows by 5% each month
        const goal = avgRevenue * Math.pow(1.05, i + 1);

        result.push({
          month: monthLabel,
          monthKey,
          projected: projections[i],
          goal,
          isProjection: true,
          isSampleData: !hasRealData,
        });
      }

      return result;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Calculate chart dimensions and scale
  const chartHeight = 190;
  const chartWidth = 600; // Fixed width for path calculations
  const maxValue = useMemo(() => {
    if (!revenueData) return 1200000;
    const allValues = revenueData.flatMap(d => [d.actual || 0, d.projected || 0, d.goal]);
    return Math.max(...allValues, 1200000) * 1.1;
  }, [revenueData]);

  // Calculate projected vs goal difference for annotation
  const projectedVsGoal = useMemo(() => {
    if (!revenueData) return 0;
    const lastProjection = revenueData.find(d => d.isProjection && d.projected);
    const lastGoal = revenueData.find(d => d.isProjection)?.goal || 0;
    if (lastProjection && lastProjection.projected) {
      return lastProjection.projected - lastGoal;
    }
    return 0;
  }, [revenueData]);

  // Format Y-axis labels
  const yAxisLabels = useMemo(() => {
    const step = maxValue / 4;
    return [
      `KES ${(maxValue / 1000000).toFixed(1)}M`,
      `KES ${((step * 3) / 1000).toFixed(0)}K`,
      `KES ${((step * 2) / 1000).toFixed(0)}K`,
      `KES ${((step) / 1000).toFixed(0)}K`,
      'KES 0',
    ];
  }, [maxValue]);

  // Build confidence corridor path
  const confidencePath = useMemo(() => {
    if (!revenueData) return '';

    const projectionData = revenueData.filter(d => d.isProjection);
    if (projectionData.length === 0) return '';

    const historicalData = revenueData.filter(d => !d.isProjection);
    const avgRevenue = historicalData.filter(d => (d.actual || 0) > 0).length > 0
      ? historicalData.filter(d => (d.actual || 0) > 0).reduce((a, d) => a + (d.actual || 0), 0) / historicalData.filter(d => (d.actual || 0) > 0).length
      : 700000;

    const historicalValues = historicalData.map(d => d.actual || 0);
    const { confidenceUpper, confidenceLower } = calculateProjections(historicalValues, avgRevenue);

    // Build path: upper line forward, lower line backward (use pixel values, not percentages)
    const startX = (2.5 / 6) * chartWidth;
    const upperPoints = confidenceUpper.map((val, i) => {
      const x = ((3 + i + 0.5) / 6) * chartWidth;
      const y = chartHeight - (val / maxValue) * chartHeight;
      return `L ${x} ${y}`;
    });

    const lowerPoints = confidenceLower.map((val, i) => {
      const x = ((3 + (2 - i) + 0.5) / 6) * chartWidth;
      const y = chartHeight - (val / maxValue) * chartHeight;
      return `L ${x} ${y}`;
    }).reverse();

    const startY = chartHeight - ((historicalValues[historicalValues.length - 1] || avgRevenue) / maxValue) * chartHeight;

    return `M ${startX} ${startY} ${upperPoints.join(' ')} ${lowerPoints.join(' ')} Z`;
  }, [revenueData, maxValue, chartHeight, chartWidth]);

  // Build goal line path (use pixel values, not percentages)
  const goalPath = useMemo(() => {
    if (!revenueData) return '';

    return revenueData.map((d, i) => {
      const x = ((i + 0.5) / 6) * chartWidth;
      const y = chartHeight - (d.goal / maxValue) * chartHeight;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  }, [revenueData, maxValue, chartHeight, chartWidth]);

  // Build trajectory line path (connecting projection centers) - use pixel values
  const trajectoryPath = useMemo(() => {
    if (!revenueData) return '';

    const historicalData = revenueData.filter(d => !d.isProjection);
    const projectionData = revenueData.filter(d => d.isProjection);

    if (historicalData.length === 0 || projectionData.length === 0) return '';

    const lastActual = historicalData[historicalData.length - 1];
    const startX = ((historicalData.length - 0.5) / 6) * chartWidth;
    const startY = chartHeight - ((lastActual.actual || 0) / maxValue) * chartHeight;

    let path = `M ${startX} ${startY}`;

    projectionData.forEach((d, i) => {
      const x = ((historicalData.length + i + 0.5) / 6) * chartWidth;
      const y = chartHeight - ((d.projected || 0) / maxValue) * chartHeight;
      path += ` L ${x} ${y}`;
    });

    return path;
  }, [revenueData, maxValue, chartHeight, chartWidth]);

  if (isLoading) {
    return (
      <div className="glass-card-dark p-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-lorenzo-accent-teal" />
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[PredictivePerformanceChart] Query error:', error);
    return (
      <div className="glass-card-dark p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-red-400" />
          <span className="text-[15px] font-semibold text-red-400">
            Error Loading Performance Data
          </span>
        </div>
        <p className="text-sm text-gray-400">
          Unable to fetch transaction data. Please check console for details.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-dark p-6"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-lorenzo-accent-teal" />
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#E8F0F2]">
              Predictive Performance vs. Goal (Revenue)
            </span>
            <span className="text-[11px] text-[#E8F0F2]/60">
              {displayBranchName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {revenueData?.[0]?.isSampleData && (
            <span className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-medium">
              Sample Data
            </span>
          )}
          {/* Branch indicator badge */}
          <span className={`text-[10px] px-2 py-1 rounded font-medium ${
            branchId === 'all'
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'bg-teal-500/20 text-teal-400'
          }`}>
            {branchId === 'all' ? 'Company-wide' : 'Single Branch'}
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-[220px] pl-[50px] pb-[30px]">
        {/* Y-axis labels */}
        <div
          className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between text-[10px] font-mono"
          style={{ color: 'rgba(232, 240, 242, 0.4)' }}
        >
          {yAxisLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>

        {/* Chart SVG - use viewBox for scaling with numeric coordinates */}
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMax slice"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * (chartHeight / 4)}
              x2={chartWidth}
              y2={i * (chartHeight / 4)}
              stroke="rgba(45, 212, 191, 0.08)"
            />
          ))}

          {/* Confidence Corridor */}
          {confidencePath && (
            <path
              d={confidencePath}
              fill="url(#confidenceGradient)"
              opacity="0.3"
            />
          )}

          {/* Goal line */}
          {goalPath && (
            <path
              d={goalPath}
              fill="none"
              stroke="rgba(201, 169, 98, 0.6)"
              strokeWidth="2"
              strokeDasharray="6,4"
            />
          )}

          {/* Actual bars (historical) */}
          {revenueData?.filter(d => !d.isProjection).map((d, i) => {
            const barWidth = chartWidth / 6 * 0.65; // 65% of slot width
            const barX = (i / 6) * chartWidth + (chartWidth / 6 - barWidth) / 2;
            const barHeight = Math.max(4, ((d.actual || 0) / maxValue) * chartHeight);
            const barY = chartHeight - barHeight;
            return (
              <rect
                key={`actual-${i}`}
                className="transition-all duration-300 hover:opacity-80"
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="url(#actualGradient)"
                rx="4"
              />
            );
          })}

          {/* Projected bars */}
          {revenueData?.filter(d => d.isProjection).map((d, i) => {
            const barWidth = chartWidth / 6 * 0.65; // 65% of slot width
            const barX = ((i + 3) / 6) * chartWidth + (chartWidth / 6 - barWidth) / 2;
            const barHeight = Math.max(4, ((d.projected || 0) / maxValue) * chartHeight);
            const barY = chartHeight - barHeight;
            return (
              <rect
                key={`projected-${i}`}
                className="transition-all duration-300 hover:opacity-90"
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="url(#projectedGradient)"
                rx="4"
                opacity="0.7"
              />
            );
          })}

          {/* Trajectory line */}
          {trajectoryPath && (
            <path
              d={trajectoryPath}
              fill="none"
              stroke="#2DD4BF"
              strokeWidth="2"
              strokeDasharray="4,4"
              opacity="0.8"
            />
          )}

          {/* Projection annotation - positioned at top center of projection area */}
          {projectedVsGoal !== 0 && (
            <g transform={`translate(${(4.5 / 6) * chartWidth}, 20)`}>
              <rect
                x="-90"
                y="-14"
                width="180"
                height="28"
                rx="4"
                fill="rgba(10, 47, 44, 0.95)"
                stroke={projectedVsGoal > 0 ? "rgba(45, 212, 191, 0.5)" : "rgba(239, 68, 68, 0.5)"}
                strokeWidth="1"
              />
              <text
                x="0"
                y="5"
                fill={projectedVsGoal > 0 ? "#2DD4BF" : "#F87171"}
                fontSize="11"
                textAnchor="middle"
                fontWeight="500"
                fontFamily="'JetBrains Mono', monospace"
              >
                {projectedVsGoal > 0
                  ? `↑ Projected +KES ${Math.round(Math.abs(projectedVsGoal) / 1000)}K vs goal`
                  : `↓ Projected -KES ${Math.round(Math.abs(projectedVsGoal) / 1000)}K vs goal`
                }
              </text>
            </g>
          )}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#14524A" />
            </linearGradient>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4AE3D0" />
              <stop offset="100%" stopColor="#1E6B5E" />
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div
          className="flex justify-around pt-2 text-[10px]"
          style={{ color: 'rgba(232, 240, 242, 0.4)' }}
        >
          {revenueData?.map((d, i) => (
            <span
              key={i}
              style={{ color: d.isProjection ? 'rgba(232, 240, 242, 0.25)' : 'rgba(232, 240, 242, 0.4)' }}
            >
              {d.month}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-3 text-[11px]" style={{ color: 'rgba(232, 240, 242, 0.6)' }}>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: 'linear-gradient(180deg, #2DD4BF, #14524A)' }}
          />
          <span>Historical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm opacity-70"
            style={{ background: 'linear-gradient(180deg, #4AE3D0, #1E6B5E)' }}
          />
          <span>Current Trajectory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm opacity-30"
            style={{ background: 'linear-gradient(180deg, #6366F1, #4F46E5)' }}
          />
          <span>Confidence Corridor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-0.5"
            style={{ background: '#C9A962' }}
          />
          <span>Goal</span>
        </div>
      </div>
    </motion.div>
  );
}
