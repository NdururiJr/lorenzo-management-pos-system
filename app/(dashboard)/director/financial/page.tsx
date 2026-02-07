'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernButton } from '@/components/modern/ModernButton';
import { SetupRequired } from '@/components/ui/setup-required';
import { NoDataAvailable } from '@/components/ui/no-data-available';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  PieChart,
  ArrowUpRight,
  Download,
  Calendar,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PLData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: Record<string, number>;
  netProfit: number;
}


export default function FinancialCommandPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [loading, setLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);
  const [realRevenue, setRealRevenue] = useState(0);

  // Fetch real data from Firestore to check if any exists
  useEffect(() => {
    async function checkForRealData() {
      setLoading(true);
      try {
        const now = new Date();
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const startTimestamp = Timestamp.fromDate(quarterStart);

        // Check for transactions
        const transactionsRef = collection(db, 'transactions');
        const transactionsQuery = query(
          transactionsRef,
          where('createdAt', '>=', startTimestamp),
          where('status', '==', 'completed')
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        let revenue = 0;
        transactionsSnapshot.forEach((doc) => {
          revenue += doc.data().amount || 0;
        });

        // Also check orders for paidAmount
        if (revenue === 0) {
          const ordersRef = collection(db, 'orders');
          const ordersQuery = query(
            ordersRef,
            where('createdAt', '>=', startTimestamp)
          );
          const ordersSnapshot = await getDocs(ordersQuery);
          ordersSnapshot.forEach((doc) => {
            revenue += doc.data().paidAmount || 0;
          });
        }

        setRealRevenue(revenue);
        setHasRealData(revenue > 0 || transactionsSnapshot.size > 0);
      } catch (error) {
        console.error('Error checking for financial data:', error);
        setHasRealData(false);
      } finally {
        setLoading(false);
      }
    }

    checkForRealData();
  }, [selectedPeriod]);

  // Use real data if available, otherwise show placeholder with warning
  const plData: PLData = hasRealData
    ? {
        revenue: realRevenue,
        cogs: realRevenue * 0.30,
        grossProfit: realRevenue * 0.70,
        opex: {
          labor: realRevenue * 0.18,
          rent: realRevenue * 0.06,
          utilities: realRevenue * 0.03,
          marketing: realRevenue * 0.015,
          other: realRevenue * 0.04,
        },
        netProfit: realRevenue * 0.70 - realRevenue * 0.325,
      }
    : {
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        opex: { labor: 0, rent: 0, utilities: 0, marketing: 0, other: 0 },
        netProfit: 0,
      };

  const totalOpex = Object.values(plData.opex).reduce((a, b) => a + b, 0);
  const grossMargin = plData.revenue > 0 ? ((plData.grossProfit / plData.revenue) * 100).toFixed(0) : '0';

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-muted-foreground">Loading financial data...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!hasRealData) {
    return (
      <ModernLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              FINANCIAL OVERVIEW
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Financial Command</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete financial picture with P&L, cash flow, and investment tracking
            </p>
          </div>

          {/* No Data State */}
          <SetupRequired
            feature="Financial Data"
            description="No transactions or paid orders found. Financial data will populate automatically as orders are processed and payments are received through the POS system."
            configPath="/pos"
            actionLabel="Go to POS"
            variant="warning"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-teal-500" />
                Revenue Tracking
              </h3>
              <p className="text-xs text-muted-foreground">
                Revenue is calculated from completed transactions and paid orders in the selected period.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-500" />
                Expense Estimates
              </h3>
              <p className="text-xs text-muted-foreground">
                Operating expenses are estimated based on industry averages. Configure actual expense tracking for accurate P&L.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                Historical Data
              </h3>
              <p className="text-xs text-muted-foreground">
                Period comparisons require at least 30 days of order history. Data will appear after sufficient orders are processed.
              </p>
            </ModernCard>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              FINANCIAL OVERVIEW
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Financial Command</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete financial picture with P&L, cash flow, and investment tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">YTD</option>
            </select>
            <ModernButton size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </ModernButton>
          </div>
        </div>

        {/* Expenses Estimated Warning */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Operating expenses are estimated based on industry averages. Configure expense tracking for accurate P&L.</span>
        </div>

        {/* Financial Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Gross Revenue"
            value={`KES ${(plData.revenue / 1000000).toFixed(2)}M`}
            changeLabel="From transactions"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Gross Margin"
            value={`${grossMargin}%`}
            changeLabel="Estimated (70% margin)"
            icon={<PieChart className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Net Profit"
            value={`KES ${(plData.netProfit / 1000000).toFixed(2)}M`}
            changeLabel="After est. expenses"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Cash Position"
            value="--"
            changeLabel="Configure tracking"
            icon={<Wallet className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* P&L Breakdown */}
          <ModernCard className="lg:col-span-3">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-500" />
                <h2 className="font-semibold">P&L Breakdown</h2>
              </div>
              <select className="text-sm border rounded-md px-2 py-1">
                <option>This Quarter</option>
                <option>Last Quarter</option>
                <option>YTD</option>
              </select>
            </div>
            <div className="p-4">
              {/* Revenue Section */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Gross Revenue</span>
                  <span className="font-semibold font-mono">KES {plData.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-red-600">
                  <span>Cost of Goods Sold</span>
                  <span className="font-mono">- KES {plData.cogs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 font-semibold border-t pt-3">
                  <span>Gross Profit</span>
                  <span className="text-teal-600 font-mono">KES {plData.grossProfit.toLocaleString()}</span>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="pt-4">
                <div className="text-xs text-muted-foreground font-medium mb-3">
                  OPERATING EXPENSES (ESTIMATED)
                </div>
                {Object.entries(plData.opex).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 text-sm">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="text-red-600 font-mono">- KES {Math.round(value).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-semibold border-t mt-2">
                  <span>Total Operating Expenses</span>
                  <span className="text-red-600 font-mono">- KES {Math.round(totalOpex).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 text-lg font-bold border-t-2 mt-2">
                  <span>Net Profit (est.)</span>
                  <span className="text-teal-600 font-mono">KES {Math.round(plData.netProfit).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Cash Flow Projection */}
          <ModernCard className="lg:col-span-2">
            <div className="p-4 border-b flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">Cash Flow Projection</h2>
            </div>
            <div className="p-4">
              <NoDataAvailable
                metric="Cash Flow"
                guidance={{
                  message: 'Cash flow projections require cash position tracking to be configured',
                  contactRole: 'director',
                }}
              />
            </div>
          </ModernCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget vs Actual */}
          <ModernCard>
            <div className="p-4 border-b flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <h2 className="font-semibold">Budget vs Actual</h2>
            </div>
            <div className="p-4">
              <NoDataAvailable
                metric="Budget Tracking"
                guidance={{
                  message: 'Budget vs actual tracking requires budgets to be configured for each category',
                  contactRole: 'director',
                }}
              />
            </div>
          </ModernCard>

          {/* Investment Tracker */}
          <ModernCard>
            <div className="p-4 border-b flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold">Investment Tracker</h2>
            </div>
            <div className="p-4">
              <NoDataAvailable
                metric="Investments"
                guidance={{
                  message: 'Track capital investments by adding equipment purchases and major expenditures',
                  contactRole: 'director',
                }}
              />
            </div>
          </ModernCard>
        </div>
      </div>
    </ModernLayout>
  );
}
