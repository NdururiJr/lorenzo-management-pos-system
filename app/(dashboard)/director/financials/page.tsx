'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FinancialSummary {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
  cashRevenue: number;
  mpesaRevenue: number;
  cardRevenue: number;
  pendingPayments: number;
  revenueGrowth: number;
}

interface BranchRevenue {
  branchId: string;
  name: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export default function DirectorFinancialsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummary>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    averageOrderValue: 0,
    cashRevenue: 0,
    mpesaRevenue: 0,
    cardRevenue: 0,
    pendingPayments: 0,
    revenueGrowth: 0
  });
  const [branchRevenue, setBranchRevenue] = useState<BranchRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Verify director role
  useEffect(() => {
    if (userData && userData.role !== 'director') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchFinancials = async () => {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Fetch all transactions for the month
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', Timestamp.fromDate(monthAgo)),
        where('status', '==', 'completed')
      );
      const transactionsSnap = await getDocs(transactionsQuery);

      let todayRev = 0, weekRev = 0, monthRev = 0;
      let cashRev = 0, mpesaRev = 0, cardRev = 0;
      let orderCount = 0;

      transactionsSnap.docs.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        const timestamp = data.timestamp?.toDate() || new Date();

        monthRev += amount;
        orderCount++;

        if (timestamp >= weekAgo) weekRev += amount;
        if (timestamp >= today && timestamp < tomorrow) todayRev += amount;

        // Payment method breakdown
        switch (data.method) {
          case 'cash':
            cashRev += amount;
            break;
          case 'mpesa':
            mpesaRev += amount;
            break;
          case 'card':
            cardRev += amount;
            break;
        }
      });

      // Fetch pending payments
      const pendingQuery = query(
        collection(db, 'orders'),
        where('paymentStatus', 'in', ['pending', 'partial'])
      );
      const pendingSnap = await getDocs(pendingQuery);
      let pendingTotal = 0;
      pendingSnap.docs.forEach(doc => {
        const data = doc.data();
        pendingTotal += (data.totalAmount || 0) - (data.paidAmount || 0);
      });

      // Calculate growth (compare to previous period)
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
      previousWeekSnap.docs.forEach(doc => {
        previousWeekRev += doc.data().amount || 0;
      });
      const growth = previousWeekRev > 0
        ? ((weekRev - previousWeekRev) / previousWeekRev) * 100
        : 0;

      setSummary({
        todayRevenue: todayRev,
        weekRevenue: weekRev,
        monthRevenue: monthRev,
        averageOrderValue: orderCount > 0 ? Math.round(monthRev / orderCount) : 0,
        cashRevenue: cashRev,
        mpesaRevenue: mpesaRev,
        cardRevenue: cardRev,
        pendingPayments: pendingTotal,
        revenueGrowth: Math.round(growth)
      });

      // Fetch branch breakdown
      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchMap: Record<string, { name: string; revenue: number; orders: number }> = {};

      branchesSnap.docs.forEach(doc => {
        branchMap[doc.id] = {
          name: (doc.data() as { name?: string }).name || doc.id,
          revenue: 0,
          orders: 0
        };
      });

      transactionsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.branchId && branchMap[data.branchId]) {
          branchMap[data.branchId].revenue += data.amount || 0;
          branchMap[data.branchId].orders++;
        }
      });

      const totalRevenue = monthRev || 1;
      const branchList = Object.entries(branchMap).map(([id, data]) => ({
        branchId: id,
        name: data.name,
        revenue: data.revenue,
        orderCount: data.orders,
        percentage: Math.round((data.revenue / totalRevenue) * 100)
      })).sort((a, b) => b.revenue - a.revenue);

      setBranchRevenue(branchList);
    } catch (error) {
      console.error('Error fetching financials:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFinancials();
  };

  if (userData?.role !== 'director') {
    return null;
  }

  const displayRevenue = period === 'today'
    ? summary.todayRevenue
    : period === 'week'
    ? summary.weekRevenue
    : summary.monthRevenue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Financial Overview</h1>
          <p className="text-gray-500 mt-1">Track revenue, payments, and financial performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            className={period === p ? 'bg-lorenzo-teal hover:bg-lorenzo-teal/90' : ''}
          >
            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue ({period})</p>
              <p className="text-2xl font-semibold mt-1">
                KES {displayRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
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
            <span className="text-gray-500">vs last week</span>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-semibold mt-1">
                KES {summary.averageOrderValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-semibold mt-1 text-amber-600">
                KES {summary.pendingPayments.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Wallet className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Month Total</p>
              <p className="text-2xl font-semibold mt-1">
                KES {summary.monthRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModernCard>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Payment Methods</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wallet className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Cash</span>
              </div>
              <span className="font-semibold">KES {summary.cashRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">M-Pesa</span>
              </div>
              <span className="font-semibold">KES {summary.mpesaRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Card</span>
              </div>
              <span className="font-semibold">KES {summary.cardRevenue.toLocaleString()}</span>
            </div>
          </div>
        </ModernCard>

        {/* Branch Revenue Breakdown */}
        <ModernCard>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Revenue by Branch</h2>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading...</p>
            ) : branchRevenue.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              branchRevenue.slice(0, 5).map((branch) => (
                <div key={branch.branchId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{branch.name}</span>
                    <span className="text-sm font-medium">
                      KES {branch.revenue.toLocaleString()} ({branch.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lorenzo-teal rounded-full"
                      style={{ width: `${branch.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
