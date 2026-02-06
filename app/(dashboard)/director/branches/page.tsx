'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Activity,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BranchMetrics {
  branchId: string;
  name: string;
  efficiency: number;
  ordersToday: number;
  revenue: number;
  staffOnDuty: number;
  turnaroundHours: number;
  trend: 'up' | 'down' | 'stable';
}

export default function DirectorBranchesPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Verify director role
  useEffect(() => {
    if (userData && userData.role !== 'director') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchBranchMetrics = async () => {
    try {
      // Fetch all branches
      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchList = branchesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch metrics for each branch
      const metricsPromises = branchList.map(async (branch) => {
        // Fetch today's orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('branchId', '==', branch.id),
          where('createdAt', '>=', Timestamp.fromDate(today)),
          where('createdAt', '<', Timestamp.fromDate(tomorrow))
        );
        const ordersSnap = await getDocs(ordersQuery);

        // Calculate revenue
        let revenue = 0;
        ordersSnap.docs.forEach(doc => {
          const data = doc.data();
          revenue += data.totalAmount || 0;
        });

        // Fetch staff on duty
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('branchId', '==', branch.id),
          where('date', '>=', Timestamp.fromDate(today)),
          where('clockOut', '==', null)
        );
        let staffOnDuty = 0;
        try {
          const attendanceSnap = await getDocs(attendanceQuery);
          staffOnDuty = attendanceSnap.size;
        } catch {
          // Attendance collection might not exist yet
          staffOnDuty = 0;
        }

        // Calculate efficiency (simplified calculation)
        const completedOrders = ordersSnap.docs.filter(d =>
          ['delivered', 'collected', 'ready'].includes(d.data().status)
        ).length;
        const efficiency = ordersSnap.size > 0
          ? Math.round((completedOrders / ordersSnap.size) * 100)
          : 85; // Default efficiency

        return {
          branchId: branch.id,
          name: (branch as { name?: string }).name || branch.id,
          efficiency,
          ordersToday: ordersSnap.size,
          revenue,
          staffOnDuty,
          turnaroundHours: 24, // Placeholder
          trend: efficiency >= 85 ? 'up' : efficiency >= 70 ? 'stable' : 'down'
        } as BranchMetrics;
      });

      const metrics = await Promise.all(metricsPromises);
      setBranches(metrics);
    } catch (error) {
      console.error('Error fetching branch metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBranchMetrics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBranchMetrics();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-amber-500" />;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return 'text-green-500';
    if (efficiency >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  if (userData?.role !== 'director') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Branch Performance</h1>
          <p className="text-gray-500 mt-1">Monitor all branch operations and metrics</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lorenzo-teal/10 rounded-lg">
              <Building2 className="w-5 h-5 text-lorenzo-teal" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Branches</p>
              <p className="text-xl font-semibold">{branches.length}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Efficiency</p>
              <p className="text-xl font-semibold">
                {branches.length > 0
                  ? Math.round(branches.reduce((a, b) => a + b.efficiency, 0) / branches.length)
                  : 0}%
              </p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders Today</p>
              <p className="text-xl font-semibold">
                {branches.reduce((a, b) => a + b.ordersToday, 0)}
              </p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-semibold">
                KES {branches.reduce((a, b) => a + b.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Branch List */}
      <ModernCard>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Branches</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading branch data...</div>
          ) : branches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No branches found</div>
          ) : (
            branches.map((branch) => (
              <div
                key={branch.branchId}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/director/branches/${branch.branchId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-lorenzo-teal/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-lorenzo-teal" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{branch.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {branch.ordersToday} orders
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {branch.staffOnDuty} staff
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          KES {branch.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(branch.trend)}
                        <span className={`text-lg font-semibold ${getEfficiencyColor(branch.efficiency)}`}>
                          {branch.efficiency}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Efficiency</p>
                    </div>
                    <ModernBadge
                      variant={branch.efficiency >= 85 ? 'success' : branch.efficiency >= 70 ? 'warning' : 'danger'}
                    >
                      {branch.efficiency >= 85 ? 'Excellent' : branch.efficiency >= 70 ? 'Good' : 'Needs Attention'}
                    </ModernBadge>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>
    </div>
  );
}
