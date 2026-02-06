'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  Download,
  Calendar,
  Wallet,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import {
  getCashOutStats,
  getPendingCashOuts,
  getUnprocessedCashOuts,
  type CashOutTransaction,
} from '@/lib/db/cash-out';
import { getActiveBranches } from '@/lib/db/index';
import type { Order, Branch } from '@/lib/db/schema';
import Link from 'next/link';

type DateRange = 'today' | '7d' | '30d' | 'mtd';

interface FinancialSummary {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
  pendingPayments: number;
  revenueGrowth: number;
  cashOutTotal: number;
  uncollectedCount: number;
}

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'finance_manager'];

export default function FinanceDashboardPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    averageOrderValue: 0,
    pendingPayments: 0,
    revenueGrowth: 0,
    cashOutTotal: 0,
    uncollectedCount: 0,
  });
  const [pendingCashOuts, setPendingCashOuts] = useState<CashOutTransaction[]>([]);
  const [uncollectedOrders, setUncollectedOrders] = useState<Order[]>([]);
  const [cashOutStats, setCashOutStats] = useState<Awaited<ReturnType<typeof getCashOutStats>> | null>(null);

  // Check role access
  useEffect(() => {
    if (userData && !ALLOWED_ROLES.includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  // Fetch branches for filter
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchList = await getActiveBranches();
        setBranches(branchList);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

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
      case 'mtd':
        rangeStart = monthStart;
        break;
      case '30d':
      default:
        rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 30);
        break;
    }

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return { today, monthStart, rangeStart, weekAgo, monthAgo };
  }, [dateRange]);

  const fetchData = async () => {
    if (!userData) return;

    try {
      const { today, weekAgo, monthAgo, rangeStart } = dateFilters;

      // Fetch transactions for revenue data
      const transactionsRef = collection(db, 'transactions');
      const transactionsQuery = query(
        transactionsRef,
        where('timestamp', '>=', Timestamp.fromDate(monthAgo)),
        where('status', '==', 'completed')
      );
      const transactionsSnap = await getDocs(transactionsQuery);

      let todayRev = 0,
        weekRev = 0,
        monthRev = 0,
        orderCount = 0;

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      transactionsSnap.docs.forEach((doc) => {
        const data = doc.data();
        // Filter by branch if needed
        if (selectedBranchId !== 'all' && data.branchId !== selectedBranchId) return;

        const amount = data.amount || 0;
        const timestamp = data.timestamp?.toDate() || new Date();

        monthRev += amount;
        orderCount++;

        if (timestamp >= weekAgo) weekRev += amount;
        if (timestamp >= today && timestamp < tomorrow) todayRev += amount;
      });

      // Fetch pending payments
      const pendingQuery = query(
        collection(db, 'orders'),
        where('paymentStatus', 'in', ['pending', 'partial'])
      );
      const pendingSnap = await getDocs(pendingQuery);
      let pendingTotal = 0;
      pendingSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (selectedBranchId !== 'all' && data.branchId !== selectedBranchId) return;
        pendingTotal += (data.totalAmount || 0) - (data.paidAmount || 0);
      });

      // Calculate growth
      const previousWeekStart = new Date(weekAgo);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      const previousWeekQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', Timestamp.fromDate(previousWeekStart)),
        where('timestamp', '<', Timestamp.fromDate(weekAgo)),
        where('status', '==', 'completed')
      );
      const previousWeekSnap = await getDocs(previousWeekQuery);
      let previousWeekRev = 0;
      previousWeekSnap.docs.forEach((doc) => {
        if (selectedBranchId !== 'all' && doc.data().branchId !== selectedBranchId) return;
        previousWeekRev += doc.data().amount || 0;
      });
      const growth = previousWeekRev > 0 ? ((weekRev - previousWeekRev) / previousWeekRev) * 100 : 0;

      // Fetch cash out stats
      const cashStats = await getCashOutStats(
        rangeStart,
        new Date(),
        selectedBranchId !== 'all' ? selectedBranchId : undefined
      );
      setCashOutStats(cashStats);

      // Fetch pending cash outs
      const pending = await getPendingCashOuts(
        selectedBranchId !== 'all' ? selectedBranchId : undefined
      );
      setPendingCashOuts(pending);

      // Fetch uncollected orders (ready for 90+ days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const uncollectedQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'ready'),
        where('updatedAt', '<=', Timestamp.fromDate(ninetyDaysAgo))
      );
      const uncollectedSnap = await getDocs(uncollectedQuery);
      const uncollected = uncollectedSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as unknown as Order))
        .filter((o) => selectedBranchId === 'all' || o.branchId === selectedBranchId);
      setUncollectedOrders(uncollected);

      setSummary({
        todayRevenue: todayRev,
        weekRevenue: weekRev,
        monthRevenue: monthRev,
        averageOrderValue: orderCount > 0 ? Math.round(monthRev / orderCount) : 0,
        pendingPayments: pendingTotal,
        revenueGrowth: Math.round(growth),
        cashOutTotal: cashStats.processedAmount,
        uncollectedCount: uncollected.length,
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData, dateRange, selectedBranchId, dateFilters]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Finance Dashboard"
        description="Manage cash outs, track revenue, and monitor financial health"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
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
                  <SelectItem value="mtd">Month to Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {branches.length > 0 && (
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.todayRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {summary.revenueGrowth >= 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">{summary.revenueGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">{Math.abs(summary.revenueGrowth)}%</span>
                    </>
                  )}
                  <span className="ml-1">vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {formatCurrency(summary.pendingPayments)}
                </div>
                <p className="text-xs text-muted-foreground">Outstanding balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Out Total</CardTitle>
                <Wallet className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.cashOutTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {cashOutStats?.processedCount || 0} processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uncollected Orders</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.uncollectedCount}</div>
                <p className="text-xs text-muted-foreground">90+ days old</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cash-outs">
                Cash Outs
                {pendingCashOuts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingCashOuts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="uncollected">
                Uncollected
                {uncollectedOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {uncollectedOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Summary</CardTitle>
                    <CardDescription>Revenue breakdown for selected period</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Today</span>
                      <span className="font-semibold">{formatCurrency(summary.todayRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">This Week</span>
                      <span className="font-semibold">{formatCurrency(summary.weekRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">{formatCurrency(summary.monthRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="font-semibold">
                        {formatCurrency(summary.averageOrderValue)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash Out Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cash Out Summary</CardTitle>
                    <CardDescription>Cash outs for selected period</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-600">Pending Approval</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(cashOutStats?.pendingAmount || 0)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({cashOutStats?.pendingCount || 0})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Approved</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(cashOutStats?.approvedAmount || 0)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({cashOutStats?.approvedCount || 0})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-gray-600">Rejected</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(cashOutStats?.rejectedAmount || 0)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({cashOutStats?.rejectedCount || 0})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Processed</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">
                          {formatCurrency(cashOutStats?.processedAmount || 0)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({cashOutStats?.processedCount || 0})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cash Out by Type */}
              {cashOutStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cash Outs by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(cashOutStats.byType).map(([type, data]) => (
                        <div
                          key={type}
                          className="p-3 bg-gray-50 rounded-lg text-center"
                        >
                          <p className="text-xs text-gray-500 capitalize">
                            {type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-lg font-semibold mt-1">
                            {formatCurrency(data.amount)}
                          </p>
                          <p className="text-xs text-gray-400">{data.count} transactions</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Cash Outs Tab */}
            <TabsContent value="cash-outs" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Pending Cash Out Requests</CardTitle>
                    <CardDescription>Requests awaiting approval</CardDescription>
                  </div>
                  <Link href="/finance/cash-out">
                    <Button>
                      <FileText className="w-4 h-4 mr-2" />
                      Manage All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {pendingCashOuts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-2" />
                      <p>No pending cash out requests</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingCashOuts.slice(0, 5).map((cashOut) => (
                        <div
                          key={cashOut.transactionId}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {cashOut.transactionType.replace(/_/g, ' ')}
                              </Badge>
                              {cashOut.orderDisplayId && (
                                <span className="text-sm text-gray-500">
                                  {cashOut.orderDisplayId}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{cashOut.reason}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              By {cashOut.requestedByName} • {cashOut.branchName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-red-600">
                              {formatCurrency(cashOut.amount)}
                            </p>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                        </div>
                      ))}
                      {pendingCashOuts.length > 5 && (
                        <p className="text-center text-sm text-gray-500">
                          And {pendingCashOuts.length - 5} more...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Uncollected Tab */}
            <TabsContent value="uncollected" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Uncollected Orders (90+ Days)</CardTitle>
                    <CardDescription>Orders eligible for disposal</CardDescription>
                  </div>
                  <Link href="/finance/uncollected">
                    <Button>
                      <Package className="w-4 h-4 mr-2" />
                      Manage All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {uncollectedOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-2" />
                      <p>No orders eligible for disposal</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uncollectedOrders.slice(0, 5).map((order) => {
                        const daysOld = Math.floor(
                          (Date.now() - (order.createdAt?.toDate?.() || new Date()).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <div
                            key={order.orderId}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{order.orderId}</span>
                                <Badge variant="destructive">{daysOld} days old</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {order.customerName || 'Unknown Customer'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {order.garments?.length || 0} garments
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">
                                {formatCurrency(order.totalAmount || 0)}
                              </p>
                              <Badge
                                variant={
                                  order.paymentStatus === 'paid' ? 'default' : 'secondary'
                                }
                              >
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      {uncollectedOrders.length > 5 && (
                        <p className="text-center text-sm text-gray-500">
                          And {uncollectedOrders.length - 5} more...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/reports">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Revenue Reports</h3>
                          <p className="text-sm text-gray-500">
                            Daily, weekly, monthly breakdowns
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/finance/cash-out">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <Wallet className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Cash Out Reports</h3>
                          <p className="text-sm text-gray-500">
                            Discounts, refunds, compensations
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/transactions">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Transaction History</h3>
                          <p className="text-sm text-gray-500">All payment transactions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/finance/uncollected">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <Package className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Uncollected Items</h3>
                          <p className="text-sm text-gray-500">Orders pending collection</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/finance/discounts">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Discount Analysis</h3>
                          <p className="text-sm text-gray-500">Discount usage and trends</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/auditor/audit-logs">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Audit Logs</h3>
                          <p className="text-sm text-gray-500">Financial audit trail</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </PageContainer>
  );
}
