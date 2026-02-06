/**
 * Executive Summary Component
 *
 * Displays 5 key performance indicator cards for the director dashboard:
 * - Total Revenue
 * - Total Orders
 * - Average Order Value
 * - Customer Satisfaction
 * - On-Time Delivery Rate
 *
 * Each card shows current value and % change vs previous period.
 *
 * @module components/features/director/ExecutiveSummary
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Package,
  TrendingUp,
  Star,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { Order } from '@/lib/db/schema';

interface ExecutiveSummaryProps {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  branchId: string;
}

interface KPIData {
  revenue: { current: number; previous: number; change: number };
  orders: { current: number; previous: number; change: number };
  aov: { current: number; previous: number; change: number };
  satisfaction: { current: number | null; previous: number | null; change: number | null };
  onTimeRate: { current: number; previous: number; change: number };
}

function getDateRanges(period: string): { current: { start: Date; end: Date }; previous: { start: Date; end: Date } } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let currentStart: Date;
  const currentEnd = now;
  let previousStart: Date;
  let previousEnd: Date;

  switch (period) {
    case 'today':
      currentStart = today;
      previousStart = new Date(today);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = new Date(today);
      previousEnd.setMilliseconds(-1);
      break;
    case 'week':
      // Get Monday of current week
      currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - currentStart.getDay() + 1);
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      break;
    case 'month':
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);
      break;
    case 'quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd.getFullYear(), Math.floor(previousEnd.getMonth() / 3) * 3, 1);
      break;
    case 'year':
    default:
      currentStart = new Date(now.getFullYear(), 0, 1);
      previousEnd = new Date(currentStart);
      previousEnd.setMilliseconds(-1);
      previousStart = new Date(previousEnd.getFullYear(), 0, 1);
      break;
  }

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };
}

export function ExecutiveSummary({ period, branchId }: ExecutiveSummaryProps) {
  const { data: kpiData, isLoading } = useQuery<KPIData>({
    queryKey: ['executive-summary', period, branchId],
    queryFn: async () => {
      const ranges = getDateRanges(period);
      const ordersRef = collection(db, 'orders');

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

      // Calculate metrics
      const currentRevenue = currentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const currentOrderCount = currentOrders.length;
      const previousOrderCount = previousOrders.length;

      const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
      const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

      // On-time delivery rate (orders completed within estimated time)
      const currentCompleted = currentOrders.filter(
        (o) => o.status === 'delivered' || o.status === 'collected'
      );
      const currentOnTime = currentCompleted.filter((o) => {
        if (!o.estimatedCompletion || !o.actualCompletion) return true; // Assume on-time if no data
        return o.actualCompletion.seconds <= o.estimatedCompletion.seconds;
      });
      const currentOnTimeRate = currentCompleted.length > 0
        ? (currentOnTime.length / currentCompleted.length) * 100
        : 100;

      const previousCompleted = previousOrders.filter(
        (o) => o.status === 'delivered' || o.status === 'collected'
      );
      const previousOnTime = previousCompleted.filter((o) => {
        if (!o.estimatedCompletion || !o.actualCompletion) return true;
        return o.actualCompletion.seconds <= o.estimatedCompletion.seconds;
      });
      const previousOnTimeRate = previousCompleted.length > 0
        ? (previousOnTime.length / previousCompleted.length) * 100
        : 100;

      // Customer satisfaction - fetch from customerFeedback collection
      const feedbackRef = collection(db, 'customerFeedback');

      // Fetch current period feedback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentFeedbackConstraints: any[] = [
        where('submittedAt', '>=', Timestamp.fromDate(ranges.current.start)),
        where('submittedAt', '<=', Timestamp.fromDate(ranges.current.end)),
      ];
      if (branchId !== 'all') {
        currentFeedbackConstraints.push(where('branchId', '==', branchId));
      }

      const currentFeedbackQuery = query(feedbackRef, ...currentFeedbackConstraints);
      const currentFeedbackSnapshot = await getDocs(currentFeedbackQuery);

      // Fetch previous period feedback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previousFeedbackConstraints: any[] = [
        where('submittedAt', '>=', Timestamp.fromDate(ranges.previous.start)),
        where('submittedAt', '<=', Timestamp.fromDate(ranges.previous.end)),
      ];
      if (branchId !== 'all') {
        previousFeedbackConstraints.push(where('branchId', '==', branchId));
      }

      const previousFeedbackQuery = query(feedbackRef, ...previousFeedbackConstraints);
      const previousFeedbackSnapshot = await getDocs(previousFeedbackQuery);

      // Calculate average ratings
      let currentSatisfaction: number | null = null;
      let previousSatisfaction: number | null = null;

      if (!currentFeedbackSnapshot.empty) {
        const currentRatings = currentFeedbackSnapshot.docs
          .map(doc => doc.data().overallRating as number)
          .filter(rating => rating !== undefined && rating !== null && rating > 0);

        if (currentRatings.length > 0) {
          const avgRating = currentRatings.reduce((sum, r) => sum + r, 0) / currentRatings.length;
          // Convert 1-5 scale to percentage (0-100)
          currentSatisfaction = (avgRating / 5) * 100;
        }
      }

      if (!previousFeedbackSnapshot.empty) {
        const previousRatings = previousFeedbackSnapshot.docs
          .map(doc => doc.data().overallRating as number)
          .filter(rating => rating !== undefined && rating !== null && rating > 0);

        if (previousRatings.length > 0) {
          const avgRating = previousRatings.reduce((sum, r) => sum + r, 0) / previousRatings.length;
          // Convert 1-5 scale to percentage (0-100)
          previousSatisfaction = (avgRating / 5) * 100;
        }
      }

      const calcChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          change: calcChange(currentRevenue, previousRevenue),
        },
        orders: {
          current: currentOrderCount,
          previous: previousOrderCount,
          change: calcChange(currentOrderCount, previousOrderCount),
        },
        aov: {
          current: currentAOV,
          previous: previousAOV,
          change: calcChange(currentAOV, previousAOV),
        },
        satisfaction: {
          current: currentSatisfaction,
          previous: previousSatisfaction,
          change: currentSatisfaction !== null && previousSatisfaction !== null
            ? calcChange(currentSatisfaction, previousSatisfaction)
            : null,
        },
        onTimeRate: {
          current: currentOnTimeRate,
          previous: previousOnTimeRate,
          change: calcChange(currentOnTimeRate, previousOnTimeRate),
        },
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: kpiData ? formatCurrency(kpiData.revenue.current) : '-',
      change: kpiData?.revenue.change || 0,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
    },
    {
      label: 'Total Orders',
      value: kpiData?.orders.current.toLocaleString() || '-',
      change: kpiData?.orders.change || 0,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'Avg Order Value',
      value: kpiData ? formatCurrency(kpiData.aov.current) : '-',
      change: kpiData?.aov.change || 0,
      icon: TrendingUp,
      color: 'from-violet-500 to-violet-600',
      bgLight: 'bg-violet-50',
    },
    {
      label: 'Customer Satisfaction',
      value: kpiData
        ? kpiData.satisfaction.current !== null
          ? `${kpiData.satisfaction.current.toFixed(1)}%`
          : 'N/A'
        : '-',
      change: kpiData?.satisfaction.change ?? null,
      icon: Star,
      color: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      hideChange: kpiData?.satisfaction.change === null,
    },
    {
      label: 'On-Time Delivery',
      value: kpiData ? `${kpiData.onTimeRate.current.toFixed(1)}%` : '-',
      change: kpiData?.onTimeRate.change || 0,
      icon: Clock,
      color: 'from-lorenzo-teal to-lorenzo-deep-teal',
      bgLight: 'bg-lorenzo-cream',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-lorenzo-teal/10 h-32 flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-lorenzo-teal" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        const changeValue = card.change ?? 0;
        const isPositive = changeValue >= 0;
        const showChange = !('hideChange' in card && card.hideChange);

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-lorenzo-teal/10 hover:shadow-lg hover:shadow-lorenzo-teal/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${card.bgLight}`}>
                <Icon className={`h-5 w-5 bg-linear-to-br ${card.color} bg-clip-text text-transparent`} style={{ color: card.color.includes('emerald') ? '#10b981' : card.color.includes('blue') ? '#3b82f6' : card.color.includes('violet') ? '#8b5cf6' : card.color.includes('amber') ? '#f59e0b' : '#0d9488' }} />
              </div>
              {showChange ? (
                <div
                  className={`flex items-center text-xs font-medium ${
                    isPositive ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(changeValue).toFixed(1)}%
                </div>
              ) : (
                <div className="text-xs font-medium text-gray-400">
                  No data
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
