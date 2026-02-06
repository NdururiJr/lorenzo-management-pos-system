/**
 * Revenue Trends Component
 *
 * Multi-line chart showing revenue and order trends over time.
 * Supports daily/weekly/monthly granularity toggle.
 *
 * @module components/features/director/RevenueTrends
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp, orderBy, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, Loader2 } from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/modern/ModernCard';
import { Button } from '@/components/ui/button';
import type { Order } from '@/lib/db/schema';

interface RevenueTrendsProps {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  branchId: string;
}

type Granularity = 'daily' | 'weekly' | 'monthly';

interface TrendDataPoint {
  label: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

function getDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let start: Date;

  switch (period) {
    case 'today':
      start = today;
      break;
    case 'week':
      start = new Date(today);
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start = new Date(today);
      start.setDate(start.getDate() - 30);
      break;
    case 'quarter':
      start = new Date(today);
      start.setDate(start.getDate() - 90);
      break;
    case 'year':
    default:
      start = new Date(today);
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end: now };
}

function _formatDate(date: Date, granularity: Granularity): string {
  if (granularity === 'monthly') {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  if (granularity === 'weekly') {
    return `Week ${Math.ceil(date.getDate() / 7)}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupOrders(
  orders: Order[],
  granularity: Granularity
): Map<string, Order[]> {
  const groups = new Map<string, Order[]>();

  orders.forEach((order) => {
    if (!order.createdAt) return;

    const date = new Date(order.createdAt.seconds * 1000);
    let key: string;

    if (granularity === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (granularity === 'weekly') {
      // Get start of week (Monday)
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1);
      key = startOfWeek.toISOString().split('T')[0];
    } else {
      key = date.toISOString().split('T')[0];
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(order);
  });

  return groups;
}

export function RevenueTrends({ period, branchId }: RevenueTrendsProps) {
  const [granularity, setGranularity] = useState<Granularity>(
    period === 'today' || period === 'week' ? 'daily' : 'weekly'
  );

  const { data: trendData, isLoading } = useQuery<TrendDataPoint[]>({
    queryKey: ['revenue-trends', period, branchId, granularity],
    queryFn: async () => {
      const range = getDateRange(period);
      const ordersRef = collection(db, 'orders');

      const constraints: QueryConstraint[] = [
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end)),
      ];

      if (branchId !== 'all') {
        constraints.push(where('branchId', '==', branchId));
      }

      constraints.push(orderBy('createdAt', 'asc'));

      const ordersQuery = query(ordersRef, ...constraints);
      const snapshot = await getDocs(ordersQuery);
      const orders = snapshot.docs.map((doc) => doc.data() as Order);

      // Group orders by granularity
      const grouped = groupOrders(orders, granularity);

      // Convert to trend data points
      const dataPoints: TrendDataPoint[] = [];
      const sortedKeys = Array.from(grouped.keys()).sort();

      sortedKeys.forEach((key) => {
        const groupOrders = grouped.get(key)!;
        const revenue = groupOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const orderCount = groupOrders.length;

        // Create readable label
        let label = key;
        if (granularity === 'daily') {
          const date = new Date(key);
          label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (granularity === 'weekly') {
          const date = new Date(key);
          label = `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
        } else {
          const [year, month] = key.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }

        dataPoints.push({
          label,
          revenue,
          orders: orderCount,
          avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        });
      });

      return dataPoints;
    },
    refetchInterval: 120000,
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl p-4 rounded-xl border-2 border-lorenzo-teal/20 shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-emerald-600">
            Revenue: {formatCurrency(payload[0]?.value || 0)}
          </p>
          <p className="text-sm text-blue-600">Orders: {payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ModernCard>
      <ModernCardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-lorenzo-teal" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <p className="text-sm text-gray-500">Track revenue and order patterns</p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
              <Button
                key={g}
                variant={granularity === g ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGranularity(g)}
                className={
                  granularity === g
                    ? 'bg-lorenzo-deep-teal text-white'
                    : 'text-gray-600 hover:text-lorenzo-teal'
                }
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-lorenzo-teal" />
          </div>
        ) : !trendData || trendData.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No trend data available for this period
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  name="Revenue (KES)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
}
