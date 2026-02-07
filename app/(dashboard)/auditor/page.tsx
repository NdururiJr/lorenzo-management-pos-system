'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  FileText,
  Shield,
  TrendingUp,
  Download,
  Calendar,
  RefreshCw,
  DollarSign,
  Package,
  Users,
  Eye,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import { getRecentAuditLogs } from '@/lib/db/audit-logs';
import { getCashOutStats } from '@/lib/db/cash-out';
import { getActiveBranches } from '@/lib/db/index';
import type { Branch, AuditLog } from '@/lib/db/schema';
import Link from 'next/link';

type DateRange = 'today' | '7d' | '30d' | 'mtd';

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'auditor'];

interface FinancialSummary {
  totalRevenue: number;
  totalTransactions: number;
  totalCashOuts: number;
  pendingCashOuts: number;
  discrepancies: number;
  previousPeriodRevenue: number;
}

interface AuditSummary {
  totalLogs: number;
  byAction: Record<string, number>;
  byResourceType: Record<string, number>;
  recentActivity: AuditLog[];
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  transfer: 'Transferred',
  approve: 'Approved',
  reject: 'Rejected',
  login: 'Login',
  logout: 'Logout',
  role_change: 'Role Changed',
  branch_access_change: 'Access Changed',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  transfer: 'bg-purple-100 text-purple-800',
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  login: 'bg-gray-100 text-gray-800',
  logout: 'bg-gray-100 text-gray-800',
  role_change: 'bg-amber-100 text-amber-800',
  branch_access_change: 'bg-amber-100 text-amber-800',
};

export default function AuditorDashboardPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalTransactions: 0,
    totalCashOuts: 0,
    pendingCashOuts: 0,
    discrepancies: 0,
    previousPeriodRevenue: 0,
  });
  const [auditSummary, setAuditSummary] = useState<AuditSummary>({
    totalLogs: 0,
    byAction: {},
    byResourceType: {},
    recentActivity: [],
  });

  // Check role access
  useEffect(() => {
    if (userData && !ALLOWED_ROLES.includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  // Fetch branches
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

    // Previous period for comparison
    const periodLength = Math.ceil((now.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(rangeStart);
    previousStart.setDate(previousStart.getDate() - periodLength);

    return { today, monthStart, rangeStart, previousStart };
  }, [dateRange]);

  const fetchData = useCallback(async () => {
    if (!userData) return;

    try {
      const { rangeStart, previousStart } = dateFilters;

      // Fetch transactions for revenue data
      const transactionsRef = collection(db, 'transactions');
      const transactionsQuery = query(
        transactionsRef,
        where('timestamp', '>=', Timestamp.fromDate(previousStart)),
        where('status', '==', 'completed')
      );
      const transactionsSnap = await getDocs(transactionsQuery);

      let currentRevenue = 0;
      let currentTransactions = 0;
      let previousRevenue = 0;

      transactionsSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (selectedBranchId !== 'all' && data.branchId !== selectedBranchId) return;

        const amount = data.amount || 0;
        const timestamp = data.timestamp?.toDate() || new Date();

        if (timestamp >= rangeStart) {
          currentRevenue += amount;
          currentTransactions++;
        } else {
          previousRevenue += amount;
        }
      });

      // Fetch cash out stats
      const cashStats = await getCashOutStats(
        rangeStart,
        new Date(),
        selectedBranchId !== 'all' ? selectedBranchId : undefined
      );

      // Fetch audit logs
      const auditLogs = await getRecentAuditLogs(500);

      // Filter by date and branch
      const filteredLogs = auditLogs.filter((log) => {
        const logTime = log.timestamp?.toDate?.() || new Date();
        if (logTime < rangeStart) return false;
        if (selectedBranchId !== 'all' && log.branchId !== selectedBranchId) return false;
        return true;
      });

      // Aggregate audit data
      const byAction: Record<string, number> = {};
      const byResourceType: Record<string, number> = {};

      filteredLogs.forEach((log) => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        byResourceType[log.resourceType] = (byResourceType[log.resourceType] || 0) + 1;
      });

      setFinancialSummary({
        totalRevenue: currentRevenue,
        totalTransactions: currentTransactions,
        totalCashOuts: cashStats.processedAmount,
        pendingCashOuts: cashStats.pendingAmount,
        discrepancies: cashStats.rejectedCount, // Using rejected count as a proxy for discrepancies
        previousPeriodRevenue: previousRevenue,
      });

      setAuditSummary({
        totalLogs: filteredLogs.length,
        byAction,
        byResourceType,
        recentActivity: filteredLogs.slice(0, 10),
      });
    } catch (error) {
      console.error('Error fetching auditor data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData, dateFilters, selectedBranchId]);

  useEffect(() => {
    fetchData();
  }, [userData, dateRange, selectedBranchId, dateFilters, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleExport = () => {
    // Generate CSV export
    const rows = [
      ['Financial Summary Report'],
      [`Period: ${dateRange}`],
      [`Generated: ${new Date().toISOString()}`],
      [''],
      ['Metric', 'Value'],
      ['Total Revenue', financialSummary.totalRevenue.toString()],
      ['Total Transactions', financialSummary.totalTransactions.toString()],
      ['Total Cash Outs', financialSummary.totalCashOuts.toString()],
      ['Pending Cash Outs', financialSummary.pendingCashOuts.toString()],
      ['Discrepancies', financialSummary.discrepancies.toString()],
      [''],
      ['Audit Activity by Action'],
      ...Object.entries(auditSummary.byAction).map(([action, count]) => [action, count.toString()]),
      [''],
      ['Audit Activity by Resource'],
      ...Object.entries(auditSummary.byResourceType).map(([type, count]) => [type, count.toString()]),
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const revenueChange =
    financialSummary.previousPeriodRevenue > 0
      ? ((financialSummary.totalRevenue - financialSummary.previousPeriodRevenue) /
          financialSummary.previousPeriodRevenue) *
        100
      : 0;

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Auditor Dashboard"
        description="Read-only financial oversight and audit trail monitoring"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Read-Only Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-700">
          <Eye className="w-5 h-5" />
          <span className="font-medium">Read-Only Access</span>
        </div>
        <p className="text-sm text-blue-600 mt-1">
          This dashboard provides read-only access to financial data and audit logs for oversight
          purposes.
        </p>
      </div>

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
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(financialSummary.totalRevenue)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {revenueChange >= 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">{revenueChange.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">{Math.abs(revenueChange).toFixed(1)}%</span>
                    </>
                  )}
                  <span className="ml-1">vs previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{financialSummary.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">Completed payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Outs</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialSummary.totalCashOuts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(financialSummary.pendingCashOuts)} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditSummary.totalLogs}</div>
                <p className="text-xs text-muted-foreground">Logged activities</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity by Action */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Action Type</CardTitle>
                    <CardDescription>Distribution of audit events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(auditSummary.byAction).length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No activity recorded</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(auditSummary.byAction)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 8)
                          .map(([action, count]) => (
                            <div key={action}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm capitalize">
                                  {ACTION_LABELS[action] || action.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{
                                    width: `${(count / auditSummary.totalLogs) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Activity by Resource */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity by Resource Type</CardTitle>
                    <CardDescription>What resources were affected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(auditSummary.byResourceType).length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No activity recorded</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(auditSummary.byResourceType)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 8)
                          .map(([resource, count]) => (
                            <div key={resource}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm capitalize">
                                  {resource.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${(count / auditSummary.totalLogs) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest audit log entries</CardDescription>
                  </div>
                  <Link href="/auditor/audit-logs">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {auditSummary.recentActivity.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No recent activity</p>
                  ) : (
                    <div className="space-y-4">
                      {auditSummary.recentActivity.map((log, index) => (
                        <div
                          key={log.auditLogId || index}
                          className="flex items-start justify-between py-3 border-b last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100'}>
                              {ACTION_LABELS[log.action] || log.action}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">{log.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                By {log.performedByName} • {log.resourceType}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {log.timestamp?.toDate?.().toLocaleString() || 'Unknown time'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit-logs">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Full Audit Trail</CardTitle>
                    <CardDescription>Complete history of system activities</CardDescription>
                  </div>
                  <Link href="/auditor/audit-logs">
                    <Button>
                      <FileText className="w-4 h-4 mr-2" />
                      View Full Logs
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Click &quot;View Full Logs&quot; to access the complete audit trail with
                    advanced filtering and search capabilities.
                  </p>
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
                            Financial performance analysis
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/finance">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Finance Overview</h3>
                          <p className="text-sm text-gray-500">Cash outs and payments</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/auditor/audit-logs">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Audit Logs</h3>
                          <p className="text-sm text-gray-500">Complete activity history</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/inventory">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <Package className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Inventory Review</h3>
                          <p className="text-sm text-gray-500">Stock levels and transfers</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/transactions">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Transaction History</h3>
                          <p className="text-sm text-gray-500">All payment records</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/employees">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <Users className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Staff Activity</h3>
                          <p className="text-sm text-gray-500">Employee records</p>
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
