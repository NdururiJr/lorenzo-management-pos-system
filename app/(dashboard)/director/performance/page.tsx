'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernButton } from '@/components/modern/ModernButton';
import { SetupRequired } from '@/components/ui/setup-required';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  BarChart3,
  LineChart,
  Users,
  Clock,
  DollarSign,
  Star,
  Download,
  Loader2,
} from 'lucide-react';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface HistoricalKPI {
  month: string;
  revenue: number;
  orders: number;
  satisfaction: number;
  efficiency: number;
}

interface BranchComparison {
  branch: string;
  revenue: number;
  revenueTarget: number;
  orders: number;
  efficiency: number;
  satisfaction: number;
  trend: 'up' | 'down' | 'stable';
}

interface CohortData {
  cohort: string;
  customers: number;
  retention: number;
  ltv: number;
  avgOrders: number;
}

export default function PerformanceDeepDivePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [selectedView, setSelectedView] = useState<'kpi' | 'branch' | 'cohort'>('kpi');
  const [loading, setLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);
  const [historicalKPIs, setHistoricalKPIs] = useState<HistoricalKPI[]>([]);
  const [branchComparison, setBranchComparison] = useState<BranchComparison[]>([]);

  useEffect(() => {
    async function fetchPerformanceData() {
      setLoading(true);
      try {
        // Check for orders in the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const startTimestamp = Timestamp.fromDate(sixMonthsAgo);

        const ordersRef = collection(db, 'orders');
        const ordersQuery = query(
          ordersRef,
          where('createdAt', '>=', startTimestamp),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);

        // Check for branches
        const branchesRef = collection(db, 'branches');
        const branchesSnapshot = await getDocs(branchesRef);

        if (ordersSnapshot.size > 10 && branchesSnapshot.size > 0) {
          // Calculate real KPIs from orders grouped by month
          const ordersByMonth: Record<string, { revenue: number; orders: number }> = {};

          ordersSnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt?.toDate();
            if (date) {
              const monthKey = date.toLocaleString('default', { month: 'short' });
              if (!ordersByMonth[monthKey]) {
                ordersByMonth[monthKey] = { revenue: 0, orders: 0 };
              }
              ordersByMonth[monthKey].revenue += data.paidAmount || 0;
              ordersByMonth[monthKey].orders += 1;
            }
          });

          const kpis: HistoricalKPI[] = Object.entries(ordersByMonth).map(([month, data]) => ({
            month,
            revenue: data.revenue,
            orders: data.orders,
            satisfaction: 0, // Would need feedback collection
            efficiency: 0, // Would need processing time tracking
          }));

          setHistoricalKPIs(kpis.slice(0, 6));

          // Calculate branch comparison
          const branchStats: Record<string, { revenue: number; orders: number }> = {};
          ordersSnapshot.forEach((doc) => {
            const data = doc.data();
            const branchId = data.branchId;
            if (!branchStats[branchId]) {
              branchStats[branchId] = { revenue: 0, orders: 0 };
            }
            branchStats[branchId].revenue += data.paidAmount || 0;
            branchStats[branchId].orders += 1;
          });

          const comparisons: BranchComparison[] = [];
          branchesSnapshot.forEach((doc) => {
            const data = doc.data();
            const stats = branchStats[data.branchId] || { revenue: 0, orders: 0 };
            comparisons.push({
              branch: data.name,
              revenue: stats.revenue,
              revenueTarget: data.dailyTarget ? data.dailyTarget * 30 : 0, // Monthly target
              orders: stats.orders,
              efficiency: 0,
              satisfaction: 0,
              trend: 'stable',
            });
          });

          setBranchComparison(comparisons);
          setHasRealData(true);
        } else {
          setHasRealData(false);
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setHasRealData(false);
      } finally {
        setLoading(false);
      }
    }

    fetchPerformanceData();
  }, [selectedPeriod]);

  const cohortData: CohortData[] = []; // Would need customer cohort tracking

  const maxRevenue = historicalKPIs.length > 0 ? Math.max(...historicalKPIs.map((k) => k.revenue)) : 0;

  const avgRevenue = historicalKPIs.length > 0
    ? historicalKPIs.reduce((sum, k) => sum + k.revenue, 0) / historicalKPIs.length
    : 0;
  const avgOrders = historicalKPIs.length > 0
    ? historicalKPIs.reduce((sum, k) => sum + k.orders, 0) / historicalKPIs.length
    : 0;
  const avgSatisfaction = 0; // Would need feedback collection
  const avgEfficiency = 0; // Would need processing time tracking

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-muted-foreground">Loading performance data...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!hasRealData) {
    return (
      <ModernLayout>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              ANALYTICS
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Performance Deep Dive</h1>
            <p className="text-sm text-muted-foreground mt-1">
              KPI history, branch comparison, and cohort analysis
            </p>
          </div>

          <SetupRequired
            feature="Historical Performance Data"
            description="Performance analytics require sufficient order history (at least 10 orders across multiple months). Data will populate automatically as orders are processed."
            configPath="/pos"
            actionLabel="Go to POS"
            variant="warning"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-500" />
                KPI History
              </h3>
              <p className="text-xs text-muted-foreground">
                Monthly revenue, orders, and efficiency metrics tracked over time.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                Branch Comparison
              </h3>
              <p className="text-xs text-muted-foreground">
                Compare performance across branches with revenue vs target analysis.
              </p>
            </ModernCard>
            <ModernCard className="p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                Cohort Analysis
              </h3>
              <p className="text-xs text-muted-foreground">
                Customer retention and lifetime value by signup cohort.
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
        {/* Data from real orders indicator */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <BarChart3 className="h-4 w-4 flex-shrink-0" />
          <span>Showing data from {historicalKPIs.reduce((sum, k) => sum + k.orders, 0)} orders across {branchComparison.length} branches</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              ANALYTICS
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Performance Deep Dive</h1>
            <p className="text-sm text-muted-foreground mt-1">
              KPI history, branch comparison, and cohort analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
            <ModernButton  size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </ModernButton>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Avg Monthly Revenue"
            value={`KES ${(avgRevenue / 1000).toFixed(0)}K`}
            icon={<DollarSign className="h-5 w-5" />}
            trend="up"
            change={15}
          />
          <ModernStatCard
            title="Avg Monthly Orders"
            value={avgOrders.toFixed(0)}
            icon={<BarChart3 className="h-5 w-5" />}
            trend="up"
            change={12}
          />
          <ModernStatCard
            title="Avg Satisfaction"
            value={avgSatisfaction.toFixed(1)}
            changeLabel="Out of 5.0"
            icon={<Star className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Avg Efficiency"
            value={`${avgEfficiency.toFixed(0)}%`}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: 'kpi', label: 'KPI History', icon: LineChart },
            { key: 'branch', label: 'Branch Comparison', icon: Building2 },
            { key: 'cohort', label: 'Cohort Analysis', icon: Users },
          ].map((tab) => (
            <ModernButton
              key={tab.key}
              variant={selectedView === tab.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView(tab.key as typeof selectedView)}
              leftIcon={<tab.icon className="h-4 w-4" />}
            >
              {tab.label}
            </ModernButton>
          ))}
        </div>

        {/* KPI History View */}
        {selectedView === 'kpi' && (
          <ModernCard className="p-6">
            <h3 className="font-semibold mb-6">Revenue Trend</h3>
            <div className="h-64 flex items-end gap-4">
              {historicalKPIs.map((kpi, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-full max-w-16 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all hover:opacity-90"
                      style={{ height: `${(kpi.revenue / maxRevenue) * 200}px` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{kpi.month}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t">
              {historicalKPIs.slice(-4).map((kpi, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">{kpi.month}</div>
                  <div className="text-lg font-semibold">KES {(kpi.revenue / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground">{kpi.orders} orders</div>
                </div>
              ))}
            </div>
          </ModernCard>
        )}

        {/* Branch Comparison View */}
        {selectedView === 'branch' && (
          <div className="space-y-4">
            {branchComparison.map((branch, index) => (
              <ModernCard key={index} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-amber-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                    }`}>
                      <span className="font-bold text-lg">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{branch.branch}</h3>
                      <p className="text-xs text-muted-foreground">{branch.orders} orders this period</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {branch.trend === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-teal-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`text-lg font-bold ${
                      branch.efficiency >= 85 ? 'text-teal-600' :
                      branch.efficiency >= 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {branch.efficiency}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Revenue</div>
                    <div className="font-semibold">KES {(branch.revenue / 1000000).toFixed(1)}M</div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          branch.revenue >= branch.revenueTarget ? 'bg-teal-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (branch.revenue / branch.revenueTarget) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {((branch.revenue / branch.revenueTarget) * 100).toFixed(0)}% of target
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Orders</div>
                    <div className="font-semibold">{branch.orders}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                    <div className={`font-semibold ${
                      branch.efficiency >= 85 ? 'text-teal-600' :
                      branch.efficiency >= 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {branch.efficiency}%
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Satisfaction</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="font-semibold">{branch.satisfaction}</span>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {/* Cohort Analysis View */}
        {selectedView === 'cohort' && (
          <ModernCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cohort
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customers
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Retention Rate
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Lifetime Value
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Avg Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cohortData.map((cohort, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-medium">{cohort.cohort}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {cohort.customers}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cohort.retention >= 80 ? 'bg-teal-500' :
                                cohort.retention >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${cohort.retention}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            cohort.retention >= 80 ? 'text-teal-600' :
                            cohort.retention >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {cohort.retention}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">KES {cohort.ltv.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{cohort.avgOrders}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCard>
        )}
      </div>
    </ModernLayout>
  );
}
