/**
 * Executive Narrative Component
 *
 * Displays an AI-generated morning briefing with:
 * - Business health score
 * - Revenue performance vs forecast
 * - Key wins (highlighted in teal)
 * - Areas needing attention (highlighted in gold)
 *
 * @module components/features/director/ExecutiveNarrative
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import type { Order } from '@/lib/db/schema';
import { getBranchConfig, getCompanySettings } from '@/lib/db/company-settings';
import { NoDataAvailable, DATA_GUIDANCE } from '@/components/ui/no-data-available';

interface ExecutiveNarrativeProps {
  timeframe: string;
  branchId: string;
}

interface NarrativeMetrics {
  revenue: number;
  revenueTarget: number;
  revenueChangePercent: number;
  orderCount: number;
  previousOrderCount: number;
  customerRetention: number | null;
  previousRetention: number | null;
  avgOrderValue: number;
  previousAOV: number;
  onTimeDelivery: number | null;
  premiumServiceRate: number | null;
  premiumTarget: number;
  growthTarget: number;
  retentionTarget: number;
  healthScore: number | null;
  hasInsufficientData: boolean;
}

interface NarrativeSegment {
  text: string;
  highlight?: 'teal' | 'gold' | 'bold';
}

function getDateRanges(timeframe: string): {
  current: { start: Date; end: Date };
  previous: { start: Date; end: Date };
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let currentStart: Date;
  const currentEnd = now;
  let previousStart: Date;
  let previousEnd: Date;

  // Determine period based on timeframe string
  if (timeframe.toLowerCase().includes('today')) {
    currentStart = today;
    previousStart = new Date(today);
    previousStart.setDate(previousStart.getDate() - 1);
    previousEnd = new Date(today);
    previousEnd.setMilliseconds(-1);
  } else if (timeframe.toLowerCase().includes('week')) {
    currentStart = new Date(today);
    currentStart.setDate(currentStart.getDate() - currentStart.getDay() + 1);
    previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(-1);
    previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - 6);
  } else if (timeframe.toLowerCase().includes('month')) {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(-1);
    previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);
  } else if (timeframe.toLowerCase().includes('quarter')) {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
    previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(-1);
    previousStart = new Date(previousEnd.getFullYear(), Math.floor(previousEnd.getMonth() / 3) * 3, 1);
  } else {
    // Default to year
    currentStart = new Date(now.getFullYear(), 0, 1);
    previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(-1);
    previousStart = new Date(previousEnd.getFullYear(), 0, 1);
  }

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };
}

function calculateHealthScore(metrics: Omit<NarrativeMetrics, 'healthScore'>): number | null {
  // If we have insufficient data, return null
  if (metrics.hasInsufficientData) {
    return null;
  }

  // Weighted health score calculation
  const weights = {
    revenueVsTarget: 0.35,
    orderGrowth: 0.20,
    customerRetention: 0.20,
    onTimeDelivery: 0.15,
    premiumServices: 0.10,
  };

  // Revenue vs Target score (0-100)
  const revenueScore = metrics.revenueTarget > 0
    ? Math.min(100, (metrics.revenue / metrics.revenueTarget) * 100)
    : 50; // Neutral if no target

  // Order growth score
  const orderGrowth = metrics.previousOrderCount > 0
    ? ((metrics.orderCount - metrics.previousOrderCount) / metrics.previousOrderCount) * 100
    : 0;
  const orderScore = Math.min(100, Math.max(0, 50 + orderGrowth));

  // Customer retention score (directly as percentage) - use target as fallback if null
  const retentionScore = metrics.customerRetention ?? 50;

  // On-time delivery score - use 50 as neutral if null
  const deliveryScore = metrics.onTimeDelivery ?? 50;

  // Premium services vs target
  const premiumScore = metrics.premiumServiceRate !== null && metrics.premiumTarget > 0
    ? Math.min(100, (metrics.premiumServiceRate / metrics.premiumTarget) * 100)
    : 50;

  const totalScore =
    revenueScore * weights.revenueVsTarget +
    orderScore * weights.orderGrowth +
    retentionScore * weights.customerRetention +
    deliveryScore * weights.onTimeDelivery +
    premiumScore * weights.premiumServices;

  return Math.round(totalScore);
}

function generateNarrative(metrics: NarrativeMetrics): NarrativeSegment[] {
  const segments: NarrativeSegment[] = [];
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  // Opening greeting and health score
  segments.push({ text: `Good ${timeOfDay}. ` });

  // Handle insufficient data case
  if (metrics.hasInsufficientData || metrics.healthScore === null) {
    segments.push({ text: 'Business health score requires ' });
    segments.push({ text: 'more historical data', highlight: 'gold' });
    segments.push({ text: ' for accurate assessment. ' });
  } else {
    segments.push({ text: 'Overall business health is ' });
    const healthLabel = metrics.healthScore >= 85 ? 'strong' : metrics.healthScore >= 70 ? 'good' : 'needs attention';
    segments.push({
      text: `${healthLabel} (Score: ${metrics.healthScore}/100)`,
      highlight: metrics.healthScore >= 70 ? 'teal' : 'gold',
    });
    segments.push({ text: '. ' });
  }

  // Revenue performance - only show if we have target
  if (metrics.revenueTarget > 0) {
    const revenueVsTarget = ((metrics.revenue / metrics.revenueTarget) * 100 - 100).toFixed(0);
    const isRevenuePositive = parseFloat(revenueVsTarget) >= 0;

    if (isRevenuePositive) {
      segments.push({ text: 'Revenue is currently ' });
      segments.push({ text: `${revenueVsTarget}% ahead of forecast`, highlight: 'teal' });
    } else {
      segments.push({ text: 'Revenue is currently ' });
      segments.push({ text: `${Math.abs(parseFloat(revenueVsTarget))}% below forecast`, highlight: 'gold' });
    }

    // Revenue drivers
    if (isRevenuePositive) {
      segments.push({ text: ' driven by improved operational efficiency. ' });
    } else {
      segments.push({ text: ' which requires attention. ' });
    }
  } else {
    segments.push({ text: 'Revenue target is not configured for this branch. ' });
  }

  // Customer retention insight - only show if we have both current and previous data
  if (metrics.customerRetention !== null && metrics.previousRetention !== null) {
    const retentionChange = (metrics.customerRetention - metrics.previousRetention).toFixed(1);
    if (parseFloat(retentionChange) > 0) {
      segments.push({ text: 'Customer retention has improved by ' });
      segments.push({ text: `${retentionChange}%`, highlight: 'teal' });
      segments.push({ text: ' due to proactive engagement and quality service. ' });
    } else if (parseFloat(retentionChange) < 0) {
      segments.push({ text: 'Customer retention has ' });
      segments.push({ text: `declined by ${Math.abs(parseFloat(retentionChange))}%`, highlight: 'gold' });
      segments.push({ text: ' which warrants investigation. ' });
    } else {
      segments.push({ text: `Customer retention is steady at ${metrics.customerRetention.toFixed(0)}%. ` });
    }
  } else if (metrics.customerRetention !== null) {
    segments.push({ text: `Current retention rate is ${metrics.customerRetention.toFixed(0)}%, ` });
    segments.push({ text: 'historical comparison unavailable', highlight: 'gold' });
    segments.push({ text: '. ' });
  }

  // Premium services insight - only show if we have actual data
  if (metrics.premiumServiceRate !== null && metrics.premiumTarget > 0) {
    const premiumVsTarget = metrics.premiumServiceRate - metrics.premiumTarget;
    if (premiumVsTarget < 0) {
      segments.push({ text: 'However, ' });
      segments.push({
        text: `premium service uptake remains ${Math.abs(premiumVsTarget).toFixed(0)}% below target`,
        highlight: 'gold',
      });
      segments.push({ text: ' - consider promotional pricing for specialty items.' });
    } else {
      segments.push({ text: 'Premium services are performing well at ' });
      segments.push({ text: `${premiumVsTarget.toFixed(0)}% above target`, highlight: 'teal' });
      segments.push({ text: '.' });
    }
  }

  return segments;
}

export function ExecutiveNarrative({ timeframe, branchId }: ExecutiveNarrativeProps) {
  const { data: narrative, isLoading, error } = useQuery({
    queryKey: ['executive-narrative', timeframe, branchId],
    queryFn: async (): Promise<NarrativeSegment[]> => {
      const ranges = getDateRanges(timeframe);
      const ordersRef = collection(db, 'orders');

      // Fetch branch config and company settings for targets
      const [branchConfig, companySettings] = await Promise.all([
        branchId !== 'all' ? getBranchConfig(branchId) : null,
        getCompanySettings(),
      ]);

      // Get targets from branch config or company defaults
      const growthTarget = branchConfig?.growthTarget ?? companySettings.defaultGrowthTarget;
      const retentionTarget = branchConfig?.retentionTarget ?? companySettings.defaultRetentionTarget;
      const premiumTarget = branchConfig?.premiumServiceTarget ?? companySettings.defaultPremiumTarget;

      // Fetch current period orders
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentConstraints: any[] = [
        where('createdAt', '>=', Timestamp.fromDate(ranges.current.start)),
        where('createdAt', '<=', Timestamp.fromDate(ranges.current.end)),
      ];
      if (branchId !== 'all') {
        currentConstraints.push(where('branchId', '==', branchId));
      }
      currentConstraints.push(orderBy('createdAt', 'desc'));

      const currentQuery = query(ordersRef, ...currentConstraints);
      const currentSnapshot = await getDocs(currentQuery);
      const currentOrders = currentSnapshot.docs.map((doc) => doc.data() as Order);

      // Fetch previous period orders
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previousConstraints: any[] = [
        where('createdAt', '>=', Timestamp.fromDate(ranges.previous.start)),
        where('createdAt', '<=', Timestamp.fromDate(ranges.previous.end)),
      ];
      if (branchId !== 'all') {
        previousConstraints.push(where('branchId', '==', branchId));
      }
      previousConstraints.push(orderBy('createdAt', 'desc'));

      const previousQuery = query(ordersRef, ...previousConstraints);
      const previousSnapshot = await getDocs(previousQuery);
      const previousOrders = previousSnapshot.docs.map((doc) => doc.data() as Order);

      // Determine if we have insufficient historical data
      const hasInsufficientData = previousOrders.length === 0 && currentOrders.length < 5;

      // Calculate metrics
      const revenue = currentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Revenue target: use branch config monthly target scaled to period, or previous period + growth target
      let revenueTarget = 0;
      if (branchConfig?.monthlyRevenueTarget) {
        // Scale monthly target to the current timeframe
        const daysInPeriod = Math.ceil(
          (ranges.current.end.getTime() - ranges.current.start.getTime()) / (1000 * 60 * 60 * 24)
        );
        revenueTarget = (branchConfig.monthlyRevenueTarget / 30) * daysInPeriod;
      } else if (previousRevenue > 0) {
        // Fall back to previous period + growth target from config
        revenueTarget = previousRevenue * (1 + growthTarget / 100);
      }

      const revenueChangePercent = previousRevenue > 0
        ? ((revenue - previousRevenue) / previousRevenue) * 100
        : 0;

      const orderCount = currentOrders.length;
      const previousOrderCount = previousOrders.length;

      const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
      const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

      // On-time delivery calculation - return null if no completed orders
      const completedOrders = currentOrders.filter(
        (o) => o.status === 'delivered' || o.status === 'collected'
      );
      const onTimeOrders = completedOrders.filter((o) => {
        if (!o.estimatedCompletion || !o.actualCompletion) return true;
        return o.actualCompletion.seconds <= o.estimatedCompletion.seconds;
      });
      const onTimeDelivery: number | null = completedOrders.length > 0
        ? (onTimeOrders.length / completedOrders.length) * 100
        : null; // Return null instead of hardcoded 95%

      // Customer retention (unique returning customers / total unique customers)
      const currentCustomers = new Set(currentOrders.map((o) => o.customerId));
      const previousCustomers = new Set(previousOrders.map((o) => o.customerId));
      const returningCustomers = [...currentCustomers].filter((c) => previousCustomers.has(c));

      // Return null for retention if insufficient data, otherwise calculate
      const customerRetention: number | null = currentCustomers.size > 0
        ? (returningCustomers.length / currentCustomers.size) * 100
        : null; // Return null instead of hardcoded 85%

      // Previous retention: calculate from actual data if available, otherwise null
      const previousRetention: number | null = previousOrders.length >= 5
        ? retentionTarget // Use target as baseline only when we have meaningful previous data
        : null; // No baseline when insufficient historical data

      // Premium services rate (orders with premium/specialty services)
      const premiumOrders = currentOrders.filter((o) =>
        o.garments?.some((g) =>
          g.services?.some((s) =>
            s.toLowerCase().includes('premium') ||
            s.toLowerCase().includes('specialty') ||
            s.toLowerCase().includes('express') ||
            s.toLowerCase().includes('dry clean')
          )
        )
      );
      // Return null for premium rate if no orders, otherwise calculate
      const premiumServiceRate: number | null = orderCount > 0
        ? (premiumOrders.length / orderCount) * 100
        : null; // Return null instead of hardcoded 15%

      const baseMetrics: Omit<NarrativeMetrics, 'healthScore'> = {
        revenue,
        revenueTarget,
        revenueChangePercent,
        orderCount,
        previousOrderCount,
        customerRetention,
        previousRetention,
        avgOrderValue,
        previousAOV,
        onTimeDelivery,
        premiumServiceRate,
        premiumTarget,
        growthTarget,
        retentionTarget,
        hasInsufficientData,
      };

      const healthScore = calculateHealthScore(baseMetrics);
      const metrics: NarrativeMetrics = { ...baseMetrics, healthScore };

      return generateNarrative(metrics);
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 lg:p-8"
    >
      <div className="relative z-10">
        {/* Label */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-lorenzo-gold" />
          <span className="text-xs font-semibold tracking-widest text-lorenzo-gold uppercase">
            Morning Briefing
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4">
          Executive Narrative
        </h2>

        {/* Narrative content */}
        {isLoading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-lorenzo-accent-teal" />
            <span className="text-white/60">Generating insights...</span>
          </div>
        ) : error ? (
          <div className="py-4">
            <NoDataAvailable
              metric="Executive Narrative"
              guidance={DATA_GUIDANCE.historicalComparison}
              className="bg-white/5 border-white/10"
            />
          </div>
        ) : !narrative || narrative.length === 0 ? (
          <div className="py-4">
            <NoDataAvailable
              metric="Business Insights"
              guidance={{
                message: 'No order data available for the selected period. Insights will appear once orders are processed.',
                contactRole: 'branch_manager',
              }}
              className="bg-white/5 border-white/10"
            />
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-lg leading-relaxed text-white/90"
          >
            {narrative.map((segment, index) => {
              if (segment.highlight === 'teal') {
                return (
                  <span key={index} className="font-semibold text-lorenzo-accent-teal">
                    {segment.text}
                  </span>
                );
              }
              if (segment.highlight === 'gold') {
                return (
                  <span key={index} className="font-semibold text-lorenzo-gold">
                    {segment.text}
                  </span>
                );
              }
              if (segment.highlight === 'bold') {
                return (
                  <span key={index} className="font-semibold text-white">
                    {segment.text}
                  </span>
                );
              }
              return <span key={index}>{segment.text}</span>;
            })}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
