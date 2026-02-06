'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Download,
  Calendar,
  Loader2,
} from 'lucide-react';
import { collection, query, where, getDocs, Timestamp, orderBy, type QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getActiveBranches } from '@/lib/db/index';
import type { Order, Branch } from '@/lib/db/schema';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

type DateRange = 'today' | '7d' | '30d' | 'custom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface ReportData {
  revenue: { today: number; mtd: number; change: number };
  orders: { today: number; mtd: number; change: number };
  aov: number;
  paidVsPending: { paid: number; pending: number };
  ordersByStatus: Array<{ name: string; value: number }>;
  revenueOverTime: Array<{ date: string; revenue: number; orders: number }>;
}

export default function ReportsPage() {
  const { userData } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  const isSuperAdmin = userData?.isSuperAdmin || false;
  const allowedBranches = isSuperAdmin
    ? null
    : userData?.branchId
    ? [userData.branchId, ...(userData.branchAccess || [])]
    : [];

  // Fetch branches for filter
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches-for-reports'],
    queryFn: async () => {
      if (!isSuperAdmin) return [];
      return getActiveBranches();
    },
    enabled: isSuperAdmin,
  });

  // Calculate date ranges
  const dateFilters = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let rangeStart: Date;
    switch (dateRange) {
      case 'today':
        rangeStart = today;
        break;
      case '7d':
        rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 7);
        break;
      case '30d':
      default:
        rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 30);
        break;
    }

    return {
      today: Timestamp.fromDate(today),
      monthStart: Timestamp.fromDate(monthStart),
      rangeStart: Timestamp.fromDate(rangeStart),
    };
  }, [dateRange]);

  // Fetch orders data
  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['reports', selectedBranchId, dateRange, allowedBranches],
    queryFn: async () => {
      const ordersRef = collection(db, 'orders');
      const constraints: QueryConstraint[] = [];

      // Apply branch filter
      if (selectedBranchId !== 'all') {
        constraints.push(where('branchId', '==', selectedBranchId));
      } else if (!isSuperAdmin && allowedBranches && allowedBranches.length > 0) {
        if (allowedBranches.length <= 10) {
          constraints.push(where('branchId', 'in', allowedBranches));
        }
        // For >10 branches, we'd need to fetch separately and merge (simplified here)
      }

      constraints.push(where('createdAt', '>=', dateFilters.rangeStart));
      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(ordersRef, ...constraints);
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as unknown as Order));

      // Calculate metrics
      const todayOrders = orders.filter(
        (o) => o.createdAt && o.createdAt.seconds >= dateFilters.today.seconds
      );
      const mtdOrders = orders.filter(
        (o) => o.createdAt && o.createdAt.seconds >= dateFilters.monthStart.seconds
      );

      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const mtdRevenue = mtdOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const paid = orders.filter((o) => o.paymentStatus === 'paid').length;
      const pending = orders.filter((o) => o.paymentStatus !== 'paid').length;

      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ordersByStatus = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value,
      }));

      // Revenue over time (group by day)
      const revenueByDay = orders.reduce((acc, order) => {
        if (!order.createdAt) return acc;
        const date = new Date(order.createdAt.seconds * 1000).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { revenue: 0, orders: 0 };
        }
        acc[date].revenue += order.totalAmount || 0;
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);

      const revenueOverTime = Object.entries(revenueByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14); // Last 14 days

      return {
        revenue: {
          today: todayRevenue,
          mtd: mtdRevenue,
          change: mtdRevenue > 0 ? ((todayRevenue / mtdRevenue) * 100 - 100) : 0,
        },
        orders: {
          today: todayOrders.length,
          mtd: mtdOrders.length,
          change: mtdOrders.length > 0 ? ((todayOrders.length / mtdOrders.length) * 100 - 100) : 0,
        },
        aov: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length : 0,
        paidVsPending: { paid, pending },
        ordersByStatus,
        revenueOverTime,
      };
    },
    enabled: !!userData,
  });

  const handleExport = () => {
    if (!reportData) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Today Revenue', formatCurrency(reportData.revenue.today)],
      ['MTD Revenue', formatCurrency(reportData.revenue.mtd)],
      ['Today Orders', reportData.orders.today.toString()],
      ['MTD Orders', reportData.orders.mtd.toString()],
      ['Average Order Value', formatCurrency(reportData.aov)],
      ['Paid Orders', reportData.paidVsPending.paid.toString()],
      ['Pending Orders', reportData.paidVsPending.pending.toString()],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Reports & Analytics"
        description="View business performance and insights"
        action={
          <Button onClick={handleExport} variant="outline" disabled={isLoading || !reportData}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isSuperAdmin && branches.length > 0 && (
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select branch" />
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
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : reportData ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.revenue.today)}</div>
                <p className="text-xs text-muted-foreground">
                  MTD: {formatCurrency(reportData.revenue.mtd)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.orders.today}</div>
                <p className="text-xs text-muted-foreground">MTD: {reportData.orders.mtd}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.aov)}</div>
                <p className="text-xs text-muted-foreground">Per order</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid vs Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.paidVsPending.paid}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.paidVsPending.pending} pending
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Daily revenue for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Distribution of order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={(props: any) => {
                        const { name, percent } = props;
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.ordersByStatus.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Orders Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Orders Timeline</CardTitle>
              <CardDescription>Number of orders per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#10b981" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No data available</h3>
            <p className="text-sm text-gray-500 mt-2">
              There are no orders for the selected period and branch.
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
