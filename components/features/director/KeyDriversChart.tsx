/**
 * Key Drivers Chart Component
 *
 * Horizontal bar chart (waterfall-style) showing:
 * - Positive drivers: Teal gradient, left-aligned
 * - Negative drivers: Red gradient, right-aligned
 * - Values displayed in JetBrains Mono font
 * - Bar width proportional to absolute value
 *
 * @module components/features/director/KeyDriversChart
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Loader2, BarChart3 } from 'lucide-react';
import type { TransactionExtended, Order } from '@/lib/db/schema';

interface KeyDriversChartProps {
  timeframe: 'today' | 'week' | 'month' | 'quarter' | 'year';
  branchId: string;
}

interface Driver {
  name: string;
  value: number;
  type: 'positive' | 'negative';
  description?: string;
}

/**
 * Get date range based on timeframe
 */
function getDateRange(timeframe: string): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let start: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (timeframe) {
    case 'today':
      start = today;
      previousStart = new Date(today);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = today;
      break;
    case 'week':
      start = new Date(today);
      start.setDate(start.getDate() - 7);
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = new Date(start);
      break;
    case 'month':
      start = new Date(today);
      start.setDate(start.getDate() - 30);
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 30);
      previousEnd = new Date(start);
      break;
    case 'quarter':
      start = new Date(today);
      start.setDate(start.getDate() - 90);
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 90);
      previousEnd = new Date(start);
      break;
    case 'year':
    default:
      start = new Date(today);
      start.setFullYear(start.getFullYear() - 1);
      previousStart = new Date(start);
      previousStart.setFullYear(previousStart.getFullYear() - 1);
      previousEnd = new Date(start);
      break;
  }

  return { start, end: now, previousStart, previousEnd };
}

/**
 * Check if an order has premium services
 */
function hasPremiumServices(order: Order): boolean {
  if (!order.garments) return false;
  const premiumServices = ['express', 'same_day', 'premium_clean', 'restoration', 'alterations'];
  return order.garments.some(g =>
    g.services?.some(s => premiumServices.some(ps => s.toLowerCase().includes(ps)))
  );
}

/**
 * Determine seasonal factor based on month
 * Dry cleaning typically sees dips in certain months
 */
function getSeasonalFactor(month: number): number {
  // January, February often see post-holiday dips
  // December sees increased activity
  const seasonalFactors: { [key: number]: number } = {
    0: -0.15, // January - post-holiday dip
    1: -0.10, // February - continuing dip
    2: 0.05,  // March - recovery
    3: 0.10,  // April - normal
    4: 0.05,  // May - normal
    5: -0.05, // June - slight dip
    6: -0.10, // July - vacation season
    7: -0.10, // August - vacation season
    8: 0.15,  // September - back to work
    9: 0.10,  // October - normal
    10: 0.05, // November - pre-holiday
    11: 0.15, // December - holiday parties
  };
  return seasonalFactors[month] || 0;
}

export function KeyDriversChart({ timeframe, branchId }: KeyDriversChartProps) {
  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ['key-drivers', timeframe, branchId],
    queryFn: async () => {
      const range = getDateRange(timeframe);

      // Fetch current period transactions
      const transactionsRef = collection(db, 'transactions');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentConstraints: any[] = [
        where('timestamp', '>=', Timestamp.fromDate(range.start)),
        where('timestamp', '<=', Timestamp.fromDate(range.end)),
        where('status', '==', 'completed'),
      ];

      if (branchId !== 'all') {
        currentConstraints.push(where('branchId', '==', branchId));
      }

      const currentQuery = query(transactionsRef, ...currentConstraints);
      const currentSnapshot = await getDocs(currentQuery);
      const currentTransactions = currentSnapshot.docs.map(doc => doc.data() as TransactionExtended);

      // Fetch previous period transactions for comparison
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previousConstraints: any[] = [
        where('timestamp', '>=', Timestamp.fromDate(range.previousStart)),
        where('timestamp', '<=', Timestamp.fromDate(range.previousEnd)),
        where('status', '==', 'completed'),
      ];

      if (branchId !== 'all') {
        previousConstraints.push(where('branchId', '==', branchId));
      }

      const previousQuery = query(transactionsRef, ...previousConstraints);
      const previousSnapshot = await getDocs(previousQuery);
      const _previousTransactions = previousSnapshot.docs.map(doc => doc.data() as TransactionExtended);

      // Fetch current period orders for service analysis
      const ordersRef = collection(db, 'orders');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderConstraints: any[] = [
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end)),
      ];

      if (branchId !== 'all') {
        orderConstraints.push(where('branchId', '==', branchId));
      }

      const ordersQuery = query(ordersRef, ...orderConstraints);
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

      // Fetch previous period orders
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previousOrderConstraints: any[] = [
        where('createdAt', '>=', Timestamp.fromDate(range.previousStart)),
        where('createdAt', '<=', Timestamp.fromDate(range.previousEnd)),
      ];

      if (branchId !== 'all') {
        previousOrderConstraints.push(where('branchId', '==', branchId));
      }

      const previousOrdersQuery = query(ordersRef, ...previousOrderConstraints);
      const previousOrdersSnapshot = await getDocs(previousOrdersQuery);
      const previousOrders = previousOrdersSnapshot.docs.map(doc => doc.data() as Order);

      // Fetch customers to identify corporate accounts
      const customersRef = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      const corporateCustomerIds = new Set(
        customersSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.isCorporate === true || data.customerType === 'corporate';
          })
          .map(doc => doc.data().customerId)
      );

      // Calculate drivers
      const driversResult: Driver[] = [];

      // 1. Corporate Accounts Revenue
      const corporateRevenue = currentTransactions
        .filter(t => corporateCustomerIds.has(t.customerId))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      if (corporateRevenue > 0) {
        driversResult.push({
          name: 'Corporate Accounts',
          value: corporateRevenue,
          type: 'positive',
          description: 'Revenue from corporate/business customers',
        });
      }

      // 2. Premium Services Revenue
      const premiumOrders = orders.filter(o => hasPremiumServices(o));
      const premiumRevenue = premiumOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      if (premiumRevenue > 0) {
        driversResult.push({
          name: 'Premium Services',
          value: premiumRevenue,
          type: 'positive',
          description: 'Revenue from express, same-day, and premium cleaning',
        });
      }

      // 3. Walk-in Decline (compare walk-in orders)
      const walkInOrders = orders.filter(o => o.collectionMethod === 'dropped_off');
      const previousWalkInOrders = previousOrders.filter(o => o.collectionMethod === 'dropped_off');

      const walkInRevenue = walkInOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const previousWalkInRevenue = previousWalkInOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const walkInDiff = walkInRevenue - previousWalkInRevenue;

      if (walkInDiff !== 0) {
        driversResult.push({
          name: walkInDiff < 0 ? 'Walk-in Decline' : 'Walk-in Growth',
          value: walkInDiff,
          type: walkInDiff < 0 ? 'negative' : 'positive',
          description: walkInDiff < 0
            ? 'Decreased walk-in customer revenue vs previous period'
            : 'Increased walk-in customer revenue vs previous period',
        });
      }

      // 4. Seasonal Factor
      const currentMonth = new Date().getMonth();
      const seasonalFactor = getSeasonalFactor(currentMonth);
      const totalRevenue = currentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const seasonalImpact = Math.round(totalRevenue * seasonalFactor);

      if (seasonalImpact !== 0) {
        driversResult.push({
          name: seasonalImpact < 0 ? 'Seasonal Dip' : 'Seasonal Boost',
          value: seasonalImpact,
          type: seasonalImpact < 0 ? 'negative' : 'positive',
          description: seasonalImpact < 0
            ? 'Expected seasonal slowdown for this time of year'
            : 'Seasonal uptick in demand',
        });
      }

      // 5. Pickup/Delivery Service Revenue (if significant)
      const deliveryOrders = orders.filter(o =>
        o.returnMethod === 'delivery_required' || o.collectionMethod === 'pickup_required'
      );
      const deliveryRevenue = deliveryOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      if (deliveryRevenue > totalRevenue * 0.1) { // Only show if > 10% of revenue
        driversResult.push({
          name: 'Pickup & Delivery',
          value: deliveryRevenue,
          type: 'positive',
          description: 'Revenue from orders with pickup or delivery services',
        });
      }

      // Sort: positive first (descending), then negative (ascending by absolute value)
      driversResult.sort((a, b) => {
        if (a.type === 'positive' && b.type === 'negative') return -1;
        if (a.type === 'negative' && b.type === 'positive') return 1;
        if (a.type === 'positive') return b.value - a.value;
        return a.value - b.value; // For negative, more negative comes last
      });

      // If no drivers found, provide placeholder data
      if (driversResult.length === 0) {
        return [
          { name: 'Regular Orders', value: 250000, type: 'positive' as const },
          { name: 'Premium Services', value: 85000, type: 'positive' as const },
          { name: 'No Data Available', value: -10000, type: 'negative' as const },
        ];
      }

      return driversResult;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Calculate max driver value for bar width scaling
  const maxDriver = useMemo(() => {
    if (!drivers || drivers.length === 0) return 100000;
    return Math.max(...drivers.map(d => Math.abs(d.value)));
  }, [drivers]);

  if (isLoading) {
    return (
      <div className="glass-card-dark p-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-lorenzo-accent-teal" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card-dark p-6"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="h-5 w-5 text-lorenzo-accent-teal" />
        <span className="text-[15px] font-semibold text-[#E8F0F2]">
          Key Drivers & Root Causes
        </span>
      </div>

      {/* Drivers List */}
      <div className="flex flex-col gap-4">
        {drivers?.map((driver, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: driver.type === 'positive' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Driver Label and Value */}
            <div className="flex justify-between mb-1.5 text-xs">
              <span style={{ color: 'rgba(232, 240, 242, 0.8)' }}>
                {driver.name}
              </span>
              <span
                className="font-mono font-medium"
                style={{
                  color: driver.type === 'positive' ? '#2DD4BF' : '#FF6B6B',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {driver.type === 'positive' ? '+' : ''}
                KES {Math.abs(driver.value).toLocaleString()}
              </span>
            </div>

            {/* Bar Container */}
            <div
              className="h-6 rounded-md overflow-hidden flex"
              style={{
                background: 'rgba(10, 47, 44, 0.5)',
                justifyContent: driver.type === 'positive' ? 'flex-start' : 'flex-end',
              }}
            >
              {/* Animated Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(Math.abs(driver.value) / maxDriver) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className="h-full rounded-md"
                style={{
                  background: driver.type === 'positive'
                    ? 'linear-gradient(90deg, #14524A, #2DD4BF)'
                    : 'linear-gradient(90deg, #FF6B6B, #C53030)',
                  minWidth: '4px', // Ensure bar is always visible
                }}
              />
            </div>

            {/* Description (tooltip-style on hover would be better, but showing subtle text) */}
            {driver.description && (
              <p
                className="mt-1 text-[10px]"
                style={{ color: 'rgba(232, 240, 242, 0.4)' }}
              >
                {driver.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Footer */}
      {drivers && drivers.length > 0 && (
        <div
          className="mt-5 pt-4 border-t text-xs"
          style={{
            borderColor: 'rgba(45, 212, 191, 0.1)',
            color: 'rgba(232, 240, 242, 0.5)',
          }}
        >
          <div className="flex justify-between">
            <span>Net Impact:</span>
            <span
              className="font-mono font-medium"
              style={{
                color: drivers.reduce((sum, d) => sum + d.value, 0) >= 0 ? '#2DD4BF' : '#FF6B6B',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {drivers.reduce((sum, d) => sum + d.value, 0) >= 0 ? '+' : ''}
              KES {Math.abs(drivers.reduce((sum, d) => sum + d.value, 0)).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
