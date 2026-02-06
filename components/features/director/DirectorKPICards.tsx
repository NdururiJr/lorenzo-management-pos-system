/**
 * Director KPI Cards Component
 *
 * Displays 4 key performance indicator cards for the director dashboard:
 * - Revenue: Total revenue from transactions (format: KES X.XM)
 * - Operating Margin: (revenue - estimated costs) / revenue
 * - Customer Retention: Repeat customers / total customers
 * - Avg Order Value: Total revenue / order count
 *
 * Each card shows:
 * - Label (uppercase, small, muted)
 * - Icon in teal circle background
 * - Large value (font-mono for numbers)
 * - Change indicator with arrow (green for positive, gold for warning)
 * - Subtitle explanation
 *
 * @module components/features/director/DirectorKPICards
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingBag,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { Order, Customer, TransactionExtended } from '@/lib/db/schema';
import type { LucideIcon } from 'lucide-react';

/**
 * CSS styles for KPI cards - injected as style tag
 */
const kpiCardStyles = `
.kpi-card {
  background: linear-gradient(
    145deg,
    rgba(20, 82, 74, 0.2) 0%,
    rgba(10, 47, 44, 0.3) 100%
  );
  border: 1px solid rgba(45, 212, 191, 0.1);
  border-radius: 14px;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  border-color: rgba(45, 212, 191, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(45, 212, 191, 0.4),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover::before {
  opacity: 1;
}
`;

interface DirectorKPICardsProps {
  timeframe: 'today' | 'week' | 'month' | 'quarter' | 'year';
  branchId: string; // 'all' or specific branch ID
}

interface KPICardData {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'warning' | 'negative';
  subtitle: string;
  icon: LucideIcon;
}

interface KPIMetrics {
  revenue: number;
  revenueGoal: number;
  operatingMargin: number;
  marginGoal: number;
  customerRetention: number;
  retentionPrevious: number;
  avgOrderValue: number;
  aovGoal: number;
  orderCount: number;
  repeatCustomers: number;
  totalCustomers: number;
}

/**
 * Get date range based on timeframe
 */
function getDateRange(timeframe: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start: Date;

  switch (timeframe) {
    case 'today':
      start = today;
      break;
    case 'week':
      // Get Monday of current week
      start = new Date(today);
      start.setDate(start.getDate() - start.getDay() + 1);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    case 'year':
    default:
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return { start, end: now };
}

/**
 * Format currency in millions (KES X.XM)
 */
function formatRevenueMillions(amount: number): string {
  if (amount >= 1000000) {
    return `KES ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 100000) {
    return `KES ${(amount / 1000).toFixed(0)}K`;
  } else if (amount >= 1000) {
    return `KES ${(amount / 1000).toFixed(1)}K`;
  }
  return `KES ${amount.toLocaleString()}`;
}

/**
 * Format currency for AOV (KES X,XXX)
 */
function formatCurrency(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString()}`;
}

export function DirectorKPICards({ timeframe, branchId }: DirectorKPICardsProps) {
  // Real-time revenue state (updates within 2-5 seconds per PR-052)
  const [realtimeRevenue, setRealtimeRevenue] = useState<number | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Set up real-time revenue listener
  useEffect(() => {
    const range = getDateRange(timeframe);

    // Build query for real-time revenue updates
    const transactionsRef = collection(db, 'transactions');
    const constraints: QueryConstraint[] = [
      where('timestamp', '>=', Timestamp.fromDate(range.start)),
      where('timestamp', '<=', Timestamp.fromDate(range.end)),
      where('status', '==', 'completed'),
    ];
    if (branchId !== 'all') {
      constraints.push(where('branchId', '==', branchId));
    }

    const q = query(transactionsRef, ...constraints);

    // Subscribe to real-time updates
    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        setRealtimeRevenue(total);
      },
      (error) => {
        console.error('Real-time revenue listener error:', error);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [timeframe, branchId]);

  const { data: metrics, isLoading, error } = useQuery<KPIMetrics>({
    queryKey: ['director-kpi-cards', timeframe, branchId],
    queryFn: async () => {
      const range = getDateRange(timeframe);

      // Build query constraints for orders
      const ordersRef = collection(db, 'orders');
      const orderConstraints: QueryConstraint[] = [
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end)),
      ];
      if (branchId !== 'all') {
        orderConstraints.push(where('branchId', '==', branchId));
      }
      orderConstraints.push(orderBy('createdAt', 'desc'));

      // Fetch orders
      const orderQuery = query(ordersRef, ...orderConstraints);
      const orderSnapshot = await getDocs(orderQuery);
      const orders = orderSnapshot.docs.map((doc) => doc.data() as Order);

      // Build query constraints for transactions
      const transactionsRef = collection(db, 'transactions');
      const txnConstraints: QueryConstraint[] = [
        where('timestamp', '>=', Timestamp.fromDate(range.start)),
        where('timestamp', '<=', Timestamp.fromDate(range.end)),
        where('status', '==', 'completed'),
      ];
      if (branchId !== 'all') {
        txnConstraints.push(where('branchId', '==', branchId));
      }

      // Fetch transactions for accurate revenue
      const txnQuery = query(transactionsRef, ...txnConstraints);
      const txnSnapshot = await getDocs(txnQuery);
      const transactions = txnSnapshot.docs.map((doc) => doc.data() as TransactionExtended);

      // Calculate total revenue from completed transactions
      const revenue = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);

      // Fallback to order paidAmount if no transactions
      const orderRevenue = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
      const finalRevenue = revenue > 0 ? revenue : orderRevenue;

      // Calculate order count
      const orderCount = orders.length;

      // Calculate average order value
      const avgOrderValue = orderCount > 0 ? finalRevenue / orderCount : 0;

      // Fetch customers for retention calculation
      const customersRef = collection(db, 'customers');

      // Get all customers to calculate retention
      const customerQuery = query(customersRef, orderBy('createdAt', 'desc'));
      const customerSnapshot = await getDocs(customerQuery);
      const customers = customerSnapshot.docs.map((doc) => doc.data() as Customer);

      // Calculate customer metrics
      const totalCustomers = customers.length;
      // Repeat customers are those with orderCount > 1
      const repeatCustomers = customers.filter((c) => (c.orderCount || 0) > 1).length;
      const customerRetention = totalCustomers > 0
        ? (repeatCustomers / totalCustomers) * 100
        : 0;

      // Operating margin calculation
      // Using 68% cost estimate as specified
      const estimatedCostRatio = 0.68;
      const operatingMargin = finalRevenue > 0
        ? ((finalRevenue - finalRevenue * estimatedCostRatio) / finalRevenue) * 100
        : 0;

      // Goals/targets for comparison
      // These could be fetched from a settings collection in the future
      const revenueGoal = getRevenueGoal(timeframe);
      const marginGoal = 30; // 30% target margin
      const aovGoal = 1900; // KES 1,900 target AOV
      const retentionPrevious = 82; // Previous period retention for comparison

      return {
        revenue: finalRevenue,
        revenueGoal,
        operatingMargin,
        marginGoal,
        customerRetention,
        retentionPrevious,
        avgOrderValue,
        aovGoal,
        orderCount,
        repeatCustomers,
        totalCustomers,
      };
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  /**
   * Get revenue goal based on timeframe
   */
  function getRevenueGoal(timeframe: string): number {
    switch (timeframe) {
      case 'today':
        return 100000; // KES 100K daily goal
      case 'week':
        return 600000; // KES 600K weekly goal
      case 'month':
        return 2400000; // KES 2.4M monthly goal
      case 'quarter':
        return 7200000; // KES 7.2M quarterly goal
      case 'year':
        return 28800000; // KES 28.8M yearly goal
      default:
        return 2400000;
    }
  }

  /**
   * Build KPI cards data from metrics
   */
  function buildKPICards(metrics: KPIMetrics): KPICardData[] {
    const revenueChange = metrics.revenueGoal > 0
      ? ((metrics.revenue - metrics.revenueGoal) / metrics.revenueGoal) * 100
      : 0;
    const revenueChangeType = revenueChange >= 0 ? 'positive' : 'warning';
    const revenueSubtitle = revenueChange >= 0
      ? `Pacing to exceed target by ${formatRevenueMillions(Math.abs(metrics.revenue - metrics.revenueGoal))}`
      : `${Math.abs(revenueChange).toFixed(0)}% below target`;

    const marginChange = metrics.operatingMargin - metrics.marginGoal;
    const marginChangeType = marginChange >= 0 ? 'positive' : 'warning';
    const marginSubtitle = marginChange >= 0
      ? 'Improved efficiency from operations'
      : 'Cost optimization opportunities identified';

    const retentionChange = metrics.customerRetention - metrics.retentionPrevious;
    const retentionChangeType = retentionChange >= 0 ? 'positive' : 'warning';
    const retentionSubtitle = retentionChange >= 0
      ? 'WhatsApp reminders driving repeat visits'
      : 'Customer re-engagement programs needed';

    const aovChange = metrics.aovGoal > 0
      ? ((metrics.avgOrderValue - metrics.aovGoal) / metrics.aovGoal) * 100
      : 0;
    const aovChangeType = aovChange >= 0 ? 'positive' : 'warning';
    const aovSubtitle = aovChange >= 0
      ? 'Premium services uptake above target'
      : 'Premium services uptake below target';

    return [
      {
        label: 'REVENUE',
        value: formatRevenueMillions(metrics.revenue),
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(0)}% vs Goal`,
        changeType: revenueChangeType,
        subtitle: revenueSubtitle,
        icon: DollarSign,
      },
      {
        label: 'OPERATING MARGIN',
        value: `${metrics.operatingMargin.toFixed(0)}%`,
        change: `${marginChange >= 0 ? '+' : ''}${marginChange.toFixed(0)}% vs Goal`,
        changeType: marginChangeType,
        subtitle: marginSubtitle,
        icon: TrendingUp,
      },
      {
        label: 'CUSTOMER RETENTION',
        value: `${metrics.customerRetention.toFixed(0)}%`,
        change: `${retentionChange >= 0 ? '+' : ''}${retentionChange.toFixed(0)}% vs LY`,
        changeType: retentionChangeType,
        subtitle: retentionSubtitle,
        icon: Users,
      },
      {
        label: 'AVG ORDER VALUE',
        value: formatCurrency(metrics.avgOrderValue),
        change: `${aovChange >= 0 ? '+' : ''}${aovChange.toFixed(0)}% vs Goal`,
        changeType: aovChangeType,
        subtitle: aovSubtitle,
        icon: ShoppingBag,
      },
    ];
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="kpi-card h-36 flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-lorenzo-accent-teal" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="kpi-card h-36 flex items-center justify-center text-[#E8F0F2]/50 text-sm"
          >
            Unable to load data
          </div>
        ))}
      </div>
    );
  }

  // Use real-time revenue if available, otherwise fall back to queried metrics
  const effectiveMetrics: KPIMetrics = {
    ...metrics,
    revenue: realtimeRevenue !== null ? realtimeRevenue : metrics.revenue,
    // Recalculate dependent values based on real-time revenue
    avgOrderValue: metrics.orderCount > 0
      ? (realtimeRevenue !== null ? realtimeRevenue : metrics.revenue) / metrics.orderCount
      : 0,
    operatingMargin: (realtimeRevenue !== null ? realtimeRevenue : metrics.revenue) > 0
      ? (((realtimeRevenue !== null ? realtimeRevenue : metrics.revenue) - (realtimeRevenue !== null ? realtimeRevenue : metrics.revenue) * 0.68) / (realtimeRevenue !== null ? realtimeRevenue : metrics.revenue)) * 100
      : 0,
  };

  const kpiCards = buildKPICards(effectiveMetrics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpiCards.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="kpi-card group"
          >
            {/* Header row with label and icon */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] tracking-[1.5px] font-medium text-[#E8F0F2]/50">
                {kpi.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-lorenzo-accent-teal/10 flex items-center justify-center">
                <IconComponent size={16} className="text-lorenzo-accent-teal" />
              </div>
            </div>

            {/* Value */}
            <div className="text-[28px] font-bold font-mono text-[#E8F0F2] mb-1">
              {kpi.value}
            </div>

            {/* Change indicator */}
            <div
              className={`flex items-center gap-1 text-xs font-medium mb-2 ${
                kpi.changeType === 'positive'
                  ? 'text-lorenzo-accent-teal'
                  : 'text-lorenzo-gold'
              }`}
            >
              {kpi.changeType === 'positive' ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {kpi.change}
            </div>

            {/* Subtitle */}
            <p className="text-[11px] text-[#E8F0F2]/50 leading-relaxed">
              {kpi.subtitle}
            </p>
          </motion.div>
        );
      })}

      {/* Inject styles for kpi-card class */}
      <style dangerouslySetInnerHTML={{ __html: kpiCardStyles }} />
    </div>
  );
}

export default DirectorKPICards;
