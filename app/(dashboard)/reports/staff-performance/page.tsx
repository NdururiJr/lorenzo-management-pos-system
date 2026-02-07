'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  Award,
  Download,
  Loader2,
  RefreshCw,
  BarChart3,
  Target,
  Star,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getActiveBranches } from '@/lib/db/index';
import type { Branch, User, Order } from '@/lib/db/schema';
import { formatCurrency } from '@/lib/utils';
import { getRoleDisplayName } from '@/lib/auth/utils';

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'store_manager'];

type DateRange = 'today' | '7d' | '30d' | 'mtd';

interface StaffMetrics {
  userId: string;
  name: string;
  role: string;
  branchId?: string;
  ordersBooked: number;
  ordersProcessed: number;
  totalRevenue: number;
  avgOrderValue: number;
  rewashCount: number;
  rewashRate: number;
  onTimeRate: number;
  rating: number;
  score: number;
}

export default function StaffPerformanceReportPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffMetrics, setStaffMetrics] = useState<StaffMetrics[]>([]);

  // Access control
  useEffect(() => {
    if (userData && !ALLOWED_ROLES.includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const getDateFilter = useCallback((): Date => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        now.setHours(0, 0, 0, 0);
        return now;
      case '7d':
        now.setDate(now.getDate() - 7);
        return now;
      case '30d':
        now.setDate(now.getDate() - 30);
        return now;
      case 'mtd':
        now.setDate(1);
        now.setHours(0, 0, 0, 0);
        return now;
      default:
        now.setDate(now.getDate() - 30);
        return now;
    }
  }, [dateRange]);

  const fetchUsers = useCallback(async (): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs
      .map((doc) => doc.data() as User)
      .filter((user) => user.role !== 'customer' && user.active);
  }, []);

  const fetchOrders = useCallback(async (): Promise<Order[]> => {
    const ordersRef = collection(db, 'orders');
    const startDate = Timestamp.fromDate(getDateFilter());

    let ordersQuery = query(ordersRef, where('createdAt', '>=', startDate));

    if (selectedBranchId !== 'all') {
      ordersQuery = query(ordersRef, where('createdAt', '>=', startDate), where('branchId', '==', selectedBranchId));
    }

    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map((doc) => doc.data() as Order);
  }, [getDateFilter, selectedBranchId]);

  const calculateScore = useCallback((orders: number, aov: number, rewashRate: number, onTimeRate: number): number => {
    // Weighted scoring:
    // - Orders volume: 30%
    // - AOV performance: 20%
    // - Rewash rate (lower is better): 25%
    // - On-time rate: 25%
    const ordersScore = Math.min(100, orders * 2); // 50 orders = 100 score
    const aovScore = Math.min(100, (aov / 2000) * 100); // 2000 KES avg = 100 score
    const rewashScore = Math.max(0, 100 - rewashRate * 10); // 0% rewash = 100, 10% = 0
    const onTimeScore = onTimeRate;

    return Math.round(ordersScore * 0.3 + aovScore * 0.2 + rewashScore * 0.25 + onTimeScore * 0.25);
  }, []);

  const calculateMetrics = useCallback((users: User[], orders: Order[]): StaffMetrics[] => {
    return users.map((user) => {
      const userOrders = orders.filter((o) => o.createdBy === user.uid);
      const rewashOrders = userOrders.filter((o) => o.isRewash);
      const completedOrders = userOrders.filter(
        (o) => o.status === 'delivered' || o.status === 'collected'
      );

      const totalRevenue = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const avgOrderValue = userOrders.length > 0 ? totalRevenue / userOrders.length : 0;
      const rewashRate = userOrders.length > 0 ? (rewashOrders.length / userOrders.length) * 100 : 0;

      // Calculate on-time rate (orders completed before or on estimated completion)
      const onTimeOrders = completedOrders.filter((o) => {
        if (!o.actualCompletion || !o.estimatedCompletion) return true;
        return o.actualCompletion.toMillis() <= o.estimatedCompletion.toMillis();
      });
      const onTimeRate = completedOrders.length > 0 ? (onTimeOrders.length / completedOrders.length) * 100 : 100;

      // Calculate performance score (weighted average)
      const score = calculateScore(userOrders.length, avgOrderValue, rewashRate, onTimeRate);

      return {
        userId: user.uid,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        ordersBooked: userOrders.length,
        ordersProcessed: completedOrders.length,
        totalRevenue,
        avgOrderValue,
        rewashCount: rewashOrders.length,
        rewashRate,
        onTimeRate,
        rating: Math.min(5, score / 20), // Convert to 5-star rating
        score,
      };
    }).filter((m) => m.ordersBooked > 0 || m.ordersProcessed > 0) // Only include staff with activity
      .sort((a, b) => b.score - a.score);
  }, [calculateScore]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [branchesData, usersData, ordersData] = await Promise.all([
        getActiveBranches(),
        fetchUsers(),
        fetchOrders(),
      ]);

      setBranches(branchesData);

      // Calculate metrics for each staff member
      const metrics = calculateMetrics(usersData, ordersData);
      setStaffMetrics(metrics);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchOrders, calculateMetrics]);

  useEffect(() => {
    if (userData && ALLOWED_ROLES.includes(userData.role)) {
      fetchData();
    }
  }, [userData, dateRange, selectedBranchId, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Role', 'Orders Booked', 'Orders Processed', 'Revenue', 'Avg Order', 'Rewash Rate', 'On-Time Rate', 'Score'],
      ...staffMetrics.map((m) => [
        m.name,
        getRoleDisplayName(m.role as never),
        m.ordersBooked,
        m.ordersProcessed,
        m.totalRevenue.toFixed(2),
        m.avgOrderValue.toFixed(2),
        m.rewashRate.toFixed(1) + '%',
        m.onTimeRate.toFixed(1) + '%',
        m.score,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-performance-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const topPerformer = staffMetrics[0];
  const avgScore = staffMetrics.length > 0
    ? Math.round(staffMetrics.reduce((sum, m) => sum + m.score, 0) / staffMetrics.length)
    : 0;
  const totalOrders = staffMetrics.reduce((sum, m) => sum + m.ordersBooked, 0);
  const totalRevenue = staffMetrics.reduce((sum, m) => sum + m.totalRevenue, 0);

  // Chart data
  const chartData = staffMetrics.slice(0, 10).map((m) => ({
    name: m.name.split(' ')[0],
    orders: m.ordersBooked,
    revenue: m.totalRevenue / 1000, // In thousands
    score: m.score,
  }));

  const radarData = topPerformer
    ? [
        { metric: 'Orders', value: Math.min(100, topPerformer.ordersBooked * 2) },
        { metric: 'Revenue', value: Math.min(100, (topPerformer.avgOrderValue / 2000) * 100) },
        { metric: 'Quality', value: Math.max(0, 100 - topPerformer.rewashRate * 10) },
        { metric: 'On-Time', value: topPerformer.onTimeRate },
        { metric: 'Score', value: topPerformer.score },
      ]
    : [];

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Staff Performance Report"
        description="Analyze staff productivity, quality metrics, and performance scores"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="mtd">Month to Date</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.branchId} value={branch.branchId}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Top Performer</p>
                <p className="text-xl font-bold">{topPerformer?.name || 'N/A'}</p>
                <p className="text-sm text-gray-500">Score: {topPerformer?.score || 0}</p>
              </div>
              <Award className="w-10 h-10 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold">{avgScore}</p>
              </div>
              <Target className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Staff</CardTitle>
            <CardDescription>Orders and revenue by staff member (Top 10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#3b82f6" />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue (K)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {topPerformer && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performer Profile</CardTitle>
              <CardDescription>{topPerformer.name} - Performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name={topPerformer.name}
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance Details</CardTitle>
          <CardDescription>Detailed metrics for all staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Order</TableHead>
                <TableHead className="text-right">Rewash Rate</TableHead>
                <TableHead className="text-right">On-Time</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No performance data available for this period
                  </TableCell>
                </TableRow>
              ) : (
                staffMetrics.map((metric, index) => (
                  <TableRow key={metric.userId}>
                    <TableCell>
                      {index === 0 ? (
                        <Badge className="bg-amber-500">
                          <Star className="w-3 h-3 mr-1" />1
                        </Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-gray-400">2</Badge>
                      ) : index === 2 ? (
                        <Badge className="bg-amber-700">3</Badge>
                      ) : (
                        <span className="text-gray-500">{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleDisplayName(metric.role as never)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{metric.ordersBooked}</TableCell>
                    <TableCell className="text-right">{formatCurrency(metric.totalRevenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(metric.avgOrderValue)}</TableCell>
                    <TableCell className="text-right">
                      <span className={metric.rewashRate > 5 ? 'text-red-600' : 'text-green-600'}>
                        {metric.rewashRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={metric.onTimeRate < 80 ? 'text-red-600' : 'text-green-600'}>
                        {metric.onTimeRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          metric.score >= 80
                            ? 'bg-green-500'
                            : metric.score >= 60
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }
                      >
                        {metric.score}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
