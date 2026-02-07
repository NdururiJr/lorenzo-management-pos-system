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
  Zap,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getActiveBranches } from '@/lib/db/index';
import type { Branch, Order } from '@/lib/db/schema';
import { formatCurrency } from '@/lib/utils';

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'store_manager', 'finance_manager'];

type DateRange = 'today' | '7d' | '30d' | 'mtd';

const COLORS = {
  express: '#ef4444',
  normal: '#3b82f6',
};

interface ServiceMetrics {
  type: 'Normal' | 'Express';
  orderCount: number;
  revenue: number;
  avgOrderValue: number;
  avgGarments: number;
  expressPercentage?: number;
}

export default function ServiceTypeReportPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [normalMetrics, setNormalMetrics] = useState<ServiceMetrics | null>(null);
  const [expressMetrics, setExpressMetrics] = useState<ServiceMetrics | null>(null);
  const [trendData, setTrendData] = useState<Array<{ date: string; express: number; normal: number }>>([]);

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [branchesData, ordersData] = await Promise.all([getActiveBranches(), fetchOrders()]);

      setBranches(branchesData);

      // Calculate metrics
      const normalOrders = ordersData.filter((o) => o.serviceType === 'Normal' || !o.serviceType);
      const expressOrders = ordersData.filter((o) => o.serviceType === 'Express');

      const normalRevenue = normalOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const expressRevenue = expressOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const normalGarments = normalOrders.reduce((sum, o) => sum + (o.garments?.length || 0), 0);
      const expressGarments = expressOrders.reduce((sum, o) => sum + (o.garments?.length || 0), 0);

      setNormalMetrics({
        type: 'Normal',
        orderCount: normalOrders.length,
        revenue: normalRevenue,
        avgOrderValue: normalOrders.length > 0 ? normalRevenue / normalOrders.length : 0,
        avgGarments: normalOrders.length > 0 ? normalGarments / normalOrders.length : 0,
      });

      setExpressMetrics({
        type: 'Express',
        orderCount: expressOrders.length,
        revenue: expressRevenue,
        avgOrderValue: expressOrders.length > 0 ? expressRevenue / expressOrders.length : 0,
        avgGarments: expressOrders.length > 0 ? expressGarments / expressOrders.length : 0,
        expressPercentage:
          ordersData.length > 0 ? (expressOrders.length / ordersData.length) * 100 : 0,
      });

      // Calculate trend data
      const trend = calculateTrendData(ordersData);
      setTrendData(trend);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    if (userData && ALLOWED_ROLES.includes(userData.role)) {
      fetchData();
    }
  }, [userData, dateRange, selectedBranchId, fetchData]);

  const calculateTrendData = (orders: Order[]) => {
    const dateMap: Record<string, { express: number; normal: number }> = {};

    orders.forEach((order) => {
      const date = order.createdAt?.toDate?.().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!date) return;

      if (!dateMap[date]) {
        dateMap[date] = { express: 0, normal: 0 };
      }

      if (order.serviceType === 'Express') {
        dateMap[date].express++;
      } else {
        dateMap[date].normal++;
      }
    });

    return Object.entries(dateMap)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .slice(-14); // Last 14 days
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleExport = () => {
    const data = [
      ['Metric', 'Normal Service', 'Express Service'],
      ['Order Count', normalMetrics?.orderCount || 0, expressMetrics?.orderCount || 0],
      ['Revenue', normalMetrics?.revenue || 0, expressMetrics?.revenue || 0],
      ['Avg Order Value', normalMetrics?.avgOrderValue?.toFixed(2) || 0, expressMetrics?.avgOrderValue?.toFixed(2) || 0],
      ['Avg Garments', normalMetrics?.avgGarments?.toFixed(1) || 0, expressMetrics?.avgGarments?.toFixed(1) || 0],
    ];

    const csv = data.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-type-report-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart data
  const pieData = [
    { name: 'Normal', value: normalMetrics?.orderCount || 0 },
    { name: 'Express', value: expressMetrics?.orderCount || 0 },
  ];

  const revenueData = [
    { name: 'Normal', value: normalMetrics?.revenue || 0 },
    { name: 'Express', value: expressMetrics?.revenue || 0 },
  ];

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

  const totalOrders = (normalMetrics?.orderCount || 0) + (expressMetrics?.orderCount || 0);
  const totalRevenue = (normalMetrics?.revenue || 0) + (expressMetrics?.revenue || 0);

  return (
    <PageContainer>
      <SectionHeader
        title="Service Type Report"
        description="Compare Normal vs Express service performance"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <Package className="w-10 h-10 text-gray-300" />
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
              <DollarSign className="w-10 h-10 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Normal Service</p>
                <p className="text-2xl font-bold text-blue-700">{normalMetrics?.orderCount || 0}</p>
                <p className="text-xs text-blue-500">{formatCurrency(normalMetrics?.revenue || 0)}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Express Service</p>
                <p className="text-2xl font-bold text-red-700">{expressMetrics?.orderCount || 0}</p>
                <p className="text-xs text-red-500">{formatCurrency(expressMetrics?.revenue || 0)}</p>
              </div>
              <Zap className="w-10 h-10 text-red-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
            <CardDescription>Normal vs Express orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    <Cell fill={COLORS.normal} />
                    <Cell fill={COLORS.express} />
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Comparison</CardTitle>
            <CardDescription>Revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {revenueData.map((entry, index) => (
                      <Cell key={index} fill={index === 0 ? COLORS.normal : COLORS.express} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Trend</CardTitle>
          <CardDescription>Daily orders by service type (Last 14 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="normal"
                  name="Normal"
                  stroke={COLORS.normal}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="express"
                  name="Express"
                  stroke={COLORS.express}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Normal Service Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Orders</span>
                <span className="font-bold">{normalMetrics?.orderCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Revenue</span>
                <span className="font-bold">{formatCurrency(normalMetrics?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg Order Value</span>
                <span className="font-bold">{formatCurrency(normalMetrics?.avgOrderValue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg Garments/Order</span>
                <span className="font-bold">{normalMetrics?.avgGarments?.toFixed(1) || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              Express Service Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Orders</span>
                <span className="font-bold">{expressMetrics?.orderCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Revenue</span>
                <span className="font-bold">{formatCurrency(expressMetrics?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg Order Value</span>
                <span className="font-bold">{formatCurrency(expressMetrics?.avgOrderValue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg Garments/Order</span>
                <span className="font-bold">{expressMetrics?.avgGarments?.toFixed(1) || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-500">Express Rate</span>
                <Badge className="bg-red-500">
                  {expressMetrics?.expressPercentage?.toFixed(1) || 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
