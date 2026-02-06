/**
 * Productivity Dashboard Component
 *
 * Displays real employee productivity metrics, leaderboard, and charts.
 * Fetches data from the performance service with time period filtering.
 *
 * @module components/features/employees/ProductivityDashboard
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  Loader2,
  Star,
  Award,
  Target,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  getDateRangeForPeriod,
  getStaffDashboardMetrics,
} from '@/lib/db/performance';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TimePeriod, Order } from '@/lib/db/schema';

interface Employee {
  id: string;
  displayName: string;
  email: string;
  role: string;
  branchId?: string;
  branchName?: string;
  active?: boolean;
}

interface ProductivityDashboardProps {
  employees: Employee[];
  branchId?: string;
}

interface EmployeeProductivity {
  employeeId: string;
  name: string;
  role: string;
  ordersProcessed: number;
  garmentsProcessed: number;
  revenueGenerated: number;
  avgProcessingTime: number;
  efficiencyScore: number;
  customerSatisfaction: number;
  rank: number;
}

const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'quarterly', label: 'This Quarter' },
  { value: 'yearly', label: 'This Year' },
];

const METRIC_OPTIONS = [
  { value: 'orders', label: 'Orders Processed' },
  { value: 'revenue', label: 'Revenue Generated' },
  { value: 'time', label: 'Processing Time' },
  { value: 'efficiency', label: 'Efficiency Score' },
];

export function ProductivityDashboard({
  employees,
  branchId,
}: ProductivityDashboardProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('weekly');
  const [selectedMetric, setSelectedMetric] = useState<string>('orders');

  // Get date range for selected period
  const dateRange = getDateRangeForPeriod(selectedPeriod, new Date());

  // Fetch all employees' productivity data
  const { data: productivityData, isLoading } = useQuery({
    queryKey: ['productivity-dashboard', branchId, selectedPeriod],
    queryFn: async () => {
      // Query orders within the date range
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('createdAt', '<=', Timestamp.fromDate(dateRange.end)),
        ...(branchId ? [where('branchId', '==', branchId)] : [])
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map((doc) => doc.data() as Order);

      // Aggregate by employee
      const employeeStats = new Map<string, {
        ordersProcessed: number;
        garmentsProcessed: number;
        revenueGenerated: number;
        processingTimes: number[];
      }>();

      orders.forEach((order) => {
        const empId = order.createdBy;
        if (!empId) return;

        const existing = employeeStats.get(empId) || {
          ordersProcessed: 0,
          garmentsProcessed: 0,
          revenueGenerated: 0,
          processingTimes: [],
        };

        existing.ordersProcessed += 1;
        existing.garmentsProcessed += order.garments?.length || 0;
        existing.revenueGenerated += order.paidAmount || 0;

        // Calculate processing time if completed
        if (order.createdAt && order.actualCompletion) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const createdAt = order.createdAt as any;
          const start = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const actualCompletion = order.actualCompletion as any;
          const end = actualCompletion?.toDate ? actualCompletion.toDate() : new Date(actualCompletion);
          const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
          if (minutes > 0 && minutes < 10000) {
            existing.processingTimes.push(minutes);
          }
        }

        employeeStats.set(empId, existing);
      });

      // Build productivity array
      const productivity: EmployeeProductivity[] = [];

      for (const emp of employees) {
        const stats = employeeStats.get(emp.id);
        const avgTime = stats?.processingTimes.length
          ? stats.processingTimes.reduce((a, b) => a + b, 0) / stats.processingTimes.length
          : 0;

        // Fetch real metrics for efficiency and satisfaction
        let efficiencyScore = 0;
        let customerSatisfaction = 0;

        try {
          const metrics = await getStaffDashboardMetrics(emp.id, selectedPeriod);
          // Use the period-specific metrics based on selectedPeriod
          const periodMetrics = metrics?.[selectedPeriod] || metrics?.daily;
          efficiencyScore = periodMetrics?.efficiency || 0;
          customerSatisfaction = periodMetrics?.customerSatisfaction || 0;
        } catch {
          // Use estimated values if metrics not available
          efficiencyScore = stats?.ordersProcessed
            ? Math.min(100, Math.round(stats.ordersProcessed * 5))
            : 0;
        }

        productivity.push({
          employeeId: emp.id,
          name: emp.displayName,
          role: emp.role,
          ordersProcessed: stats?.ordersProcessed || 0,
          garmentsProcessed: stats?.garmentsProcessed || 0,
          revenueGenerated: stats?.revenueGenerated || 0,
          avgProcessingTime: Math.round(avgTime),
          efficiencyScore,
          customerSatisfaction,
          rank: 0,
        });
      }

      // Sort by selected metric and assign ranks
      productivity.sort((a, b) => {
        switch (selectedMetric) {
          case 'revenue':
            return b.revenueGenerated - a.revenueGenerated;
          case 'time':
            return a.avgProcessingTime - b.avgProcessingTime;
          case 'efficiency':
            return b.efficiencyScore - a.efficiencyScore;
          default:
            return b.ordersProcessed - a.ordersProcessed;
        }
      });

      productivity.forEach((emp, idx) => {
        emp.rank = idx + 1;
      });

      return productivity;
    },
    staleTime: 5 * 60 * 1000,
    enabled: employees.length > 0,
  });

  // Calculate aggregated stats
  const aggregatedStats = useMemo(() => {
    if (!productivityData) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        avgProcessingTime: 0,
        avgEfficiency: 0,
      };
    }

    const filtered = selectedEmployee === 'all'
      ? productivityData
      : productivityData.filter((p) => p.employeeId === selectedEmployee);

    const totalOrders = filtered.reduce((sum, p) => sum + p.ordersProcessed, 0);
    const totalRevenue = filtered.reduce((sum, p) => sum + p.revenueGenerated, 0);
    const avgProcessingTime = filtered.length
      ? Math.round(
          filtered.reduce((sum, p) => sum + p.avgProcessingTime, 0) / filtered.length
        )
      : 0;
    const avgEfficiency = filtered.length
      ? Math.round(
          filtered.reduce((sum, p) => sum + p.efficiencyScore, 0) / filtered.length
        )
      : 0;

    return { totalOrders, totalRevenue, avgProcessingTime, avgEfficiency };
  }, [productivityData, selectedEmployee]);

  // Get leaderboard (top 5 performers)
  const leaderboard = useMemo(() => {
    if (!productivityData) return [];
    return productivityData.slice(0, 5);
  }, [productivityData]);

  // Format currency (KES)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get rank badge style
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return { icon: '🥇', bg: 'bg-yellow-100', text: 'text-yellow-800' };
    }
    if (rank === 2) {
      return { icon: '🥈', bg: 'bg-gray-100', text: 'text-gray-800' };
    }
    if (rank === 3) {
      return { icon: '🥉', bg: 'bg-orange-100', text: 'text-orange-800' };
    }
    return { icon: rank.toString(), bg: 'bg-blue-100', text: 'text-blue-800' };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      All Employees
                    </div>
                  </SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select
                value={selectedPeriod}
                onValueChange={(v) => setSelectedPeriod(v as TimePeriod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Date Range Display */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {dateRange.label}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Orders Processed
            </CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold text-black">
                  {aggregatedStats.totalOrders}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedEmployee === 'all' ? 'team total' : 'individual'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue Generated
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(aggregatedStats.totalRevenue)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  collected payments
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Processing Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {aggregatedStats.avgProcessingTime > 0
                    ? `${aggregatedStats.avgProcessingTime} min`
                    : '— min'}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  per order
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Efficiency
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">
                  {aggregatedStats.avgEfficiency > 0
                    ? `${aggregatedStats.avgEfficiency}%`
                    : '—%'}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  team average
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Leaderboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Performers - {TIME_PERIOD_OPTIONS.find((o) => o.value === selectedPeriod)?.label}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            by {METRIC_OPTIONS.find((o) => o.value === selectedMetric)?.label}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((employee, index) => {
                const badge = getRankBadge(employee.rank);
                return (
                  <motion.div
                    key={employee.employeeId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                          badge.bg,
                          badge.text
                        )}
                      >
                        {badge.icon}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {employee.ordersProcessed} orders
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(employee.revenueGenerated)}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-purple-600">
                          {employee.efficiencyScore}%
                        </p>
                        <p className="text-xs text-gray-500">Efficiency</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-yellow-600 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          {employee.customerSatisfaction}%
                        </p>
                        <p className="text-xs text-gray-500">Satisfaction</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No productivity data available</p>
              <p className="text-sm mt-1">
                Process some orders to see metrics
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Team Table (if not already filtered) */}
      {selectedEmployee === 'all' && productivityData && productivityData.length > 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              All Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Rank</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-right py-2 px-3">Orders</th>
                    <th className="text-right py-2 px-3">Garments</th>
                    <th className="text-right py-2 px-3">Revenue</th>
                    <th className="text-right py-2 px-3">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {productivityData.map((emp) => (
                    <tr key={emp.employeeId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">#{emp.rank}</td>
                      <td className="py-2 px-3 font-medium">{emp.name}</td>
                      <td className="py-2 px-3 text-right">{emp.ordersProcessed}</td>
                      <td className="py-2 px-3 text-right">{emp.garmentsProcessed}</td>
                      <td className="py-2 px-3 text-right">
                        {formatCurrency(emp.revenueGenerated)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={cn(
                            'font-medium',
                            emp.efficiencyScore >= 80
                              ? 'text-green-600'
                              : emp.efficiencyScore >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          )}
                        >
                          {emp.efficiencyScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
