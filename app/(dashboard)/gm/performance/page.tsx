'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Building2,
  Clock,
  Users,
  Wrench,
  DollarSign,
  Star,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SetupRequired, SETUP_CONFIGS } from '@/components/ui/setup-required';
import { NoDataAvailable, DATA_GUIDANCE } from '@/components/ui/no-data-available';

interface BranchPerformance {
  branchId: string;
  name: string;
  efficiency: number | null;  // null when insufficient real data
  // Individual components - null means data not available
  turnaroundScore: number;
  staffProductivity: number | null;
  equipmentUtilization: number | null;
  revenueAchievement: number;
  customerSatisfaction: number | null;
  // Additional metrics
  ordersToday: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  // Data availability flags
  hasStaffData: boolean;
  hasEquipmentData: boolean;
  hasFeedbackData: boolean;
}

// Weights for branch efficiency calculation
const EFFICIENCY_WEIGHTS = {
  turnaround: 0.25,      // 25%
  staffProductivity: 0.25, // 25%
  equipmentUtilization: 0.20, // 20%
  revenueAchievement: 0.20, // 20%
  customerSatisfaction: 0.10  // 10%
};

export default function GMPerformancePage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // Verify GM role
  useEffect(() => {
    if (userData && userData.role !== 'general_manager') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  /**
   * Calculate branch efficiency only when all required data is available.
   * Returns null if any component is missing real data.
   */
  const calculateBranchEfficiency = (metrics: {
    turnaroundScore: number;
    staffProductivity: number | null;
    equipmentUtilization: number | null;
    revenueAchievement: number;
    customerSatisfaction: number | null;
  }): number | null => {
    // If any metric is null (no real data), we cannot calculate a valid efficiency
    if (
      metrics.staffProductivity === null ||
      metrics.equipmentUtilization === null ||
      metrics.customerSatisfaction === null
    ) {
      return null;
    }

    return Math.round(
      (metrics.turnaroundScore * EFFICIENCY_WEIGHTS.turnaround) +
      (metrics.staffProductivity * EFFICIENCY_WEIGHTS.staffProductivity) +
      (metrics.equipmentUtilization * EFFICIENCY_WEIGHTS.equipmentUtilization) +
      (metrics.revenueAchievement * EFFICIENCY_WEIGHTS.revenueAchievement) +
      (metrics.customerSatisfaction * EFFICIENCY_WEIGHTS.customerSatisfaction)
    );
  };

  const fetchPerformanceData = async () => {
    try {
      // Fetch branches
      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchList = branchesSnap.docs.map(doc => ({
        id: doc.id,
        name: (doc.data() as { name?: string }).name || doc.id,
        dailyTarget: (doc.data() as { dailyTarget?: number }).dailyTarget,
        hasEquipment: (doc.data() as { branchType?: string }).branchType === 'main'
      }));

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Calculate performance for each branch
      const performanceData: BranchPerformance[] = await Promise.all(
        branchList.map(async (branch) => {
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
          let completedOrders = 0;
          let totalTurnaroundHours = 0;

          ordersSnap.docs.forEach(doc => {
            const data = doc.data();
            revenue += data.totalAmount || 0;
            if (['delivered', 'collected', 'ready', 'queued_for_delivery'].includes(data.status)) {
              completedOrders++;
              if (data.createdAt && data.actualCompletion) {
                const created = data.createdAt.toDate();
                const completed = data.actualCompletion.toDate();
                totalTurnaroundHours += (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
              }
            }
          });

          // Calculate individual scores (0-100)
          const avgTurnaround = completedOrders > 0 ? totalTurnaroundHours / completedOrders : 24;
          const turnaroundScore = Math.max(0, Math.min(100, 100 - ((avgTurnaround - 24) * 5))); // Target: 24 hours

          // ============================================================
          // REAL DATA QUERIES - No Math.random()
          // ============================================================

          // Staff productivity - query from attendance and orders
          let staffProductivity: number | null = null;
          let hasStaffData = false;
          try {
            const attendanceQuery = query(
              collection(db, 'attendance'),
              where('branchId', '==', branch.id),
              where('date', '>=', Timestamp.fromDate(today)),
              where('date', '<', Timestamp.fromDate(tomorrow))
            );
            const attendanceSnap = await getDocs(attendanceQuery);

            if (attendanceSnap.size > 0) {
              hasStaffData = true;
              // Calculate productivity: orders processed per staff hour
              let totalHoursWorked = 0;
              attendanceSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.checkIn) {
                  const checkIn = data.checkIn.toDate();
                  const checkOut = data.checkOut ? data.checkOut.toDate() : new Date();
                  totalHoursWorked += (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
                }
              });
              // Target: 2 orders per hour per staff member (configurable target)
              const expectedOrders = totalHoursWorked * 2;
              if (expectedOrders > 0 && ordersSnap.size > 0) {
                staffProductivity = Math.min(100, Math.round((ordersSnap.size / expectedOrders) * 100));
              }
            }
          } catch {
            // Failed to fetch staff data - leave as null
          }

          // Equipment utilization - query from equipment collection
          let equipmentUtilization: number | null = null;
          let hasEquipmentData = false;
          if (branch.hasEquipment) {
            try {
              const equipmentQuery = query(
                collection(db, 'equipment'),
                where('branchId', '==', branch.id)
              );
              const equipmentSnap = await getDocs(equipmentQuery);

              if (equipmentSnap.size > 0) {
                hasEquipmentData = true;
                let totalUtilization = 0;
                let operationalCount = 0;
                equipmentSnap.docs.forEach(doc => {
                  const data = doc.data();
                  if (data.status === 'operational' || data.status === 'running') {
                    operationalCount++;
                    // Use actual utilization rate if available
                    if (typeof data.utilizationRate === 'number') {
                      totalUtilization += data.utilizationRate;
                    }
                  }
                });
                if (operationalCount > 0) {
                  equipmentUtilization = Math.round(totalUtilization / operationalCount);
                }
              }
            } catch {
              // Failed to fetch equipment data - leave as null
            }
          }

          // Customer satisfaction - query from customerFeedback collection
          let customerSatisfaction: number | null = null;
          let hasFeedbackData = false;
          try {
            // Get feedback from last 30 days for this branch
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const feedbackQuery = query(
              collection(db, 'customerFeedback'),
              where('branchId', '==', branch.id),
              where('submittedAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
            );
            const feedbackSnap = await getDocs(feedbackQuery);

            if (feedbackSnap.size > 0) {
              hasFeedbackData = true;
              let totalRating = 0;
              feedbackSnap.docs.forEach(doc => {
                const data = doc.data();
                // Assuming rating is 1-5, convert to percentage
                totalRating += (data.overallRating || data.rating || 0);
              });
              const avgRating = totalRating / feedbackSnap.size;
              customerSatisfaction = Math.round((avgRating / 5) * 100);
            }
          } catch {
            // Failed to fetch feedback data - leave as null
          }

          // Revenue achievement - only calculate if branch has a daily target
          const revenueAchievement = branch.dailyTarget
            ? Math.min(100, Math.round((revenue / branch.dailyTarget) * 100))
            : 0;

          // Calculate efficiency only if all real data is available
          const efficiency = calculateBranchEfficiency({
            turnaroundScore,
            staffProductivity,
            equipmentUtilization,
            revenueAchievement,
            customerSatisfaction
          });

          // Determine trend based on efficiency (if available) or revenue achievement
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (efficiency !== null) {
            trend = efficiency >= 85 ? 'up' : efficiency >= 70 ? 'stable' : 'down';
          } else if (revenueAchievement > 0) {
            trend = revenueAchievement >= 100 ? 'up' : revenueAchievement >= 80 ? 'stable' : 'down';
          }

          return {
            branchId: branch.id,
            name: branch.name,
            efficiency,
            turnaroundScore,
            staffProductivity,
            equipmentUtilization,
            revenueAchievement,
            customerSatisfaction,
            ordersToday: ordersSnap.size,
            revenue,
            trend,
            hasStaffData,
            hasEquipmentData,
            hasFeedbackData
          } as BranchPerformance;
        })
      );

      // Sort by efficiency (null values go to the end)
      setBranches(performanceData.sort((a, b) => {
        if (a.efficiency === null && b.efficiency === null) return 0;
        if (a.efficiency === null) return 1;
        if (b.efficiency === null) return -1;
        return b.efficiency - a.efficiency;
      }));
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPerformanceData();
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return 'text-green-600';
    if (efficiency >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const selected = selectedBranch ? branches.find(b => b.branchId === selectedBranch) : null;

  if (userData?.role !== 'general_manager') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-500 mt-1">Branch efficiency and performance metrics</p>
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

      {/* Efficiency Formula Info */}
      <ModernCard className="p-4 bg-lorenzo-teal/5 border-lorenzo-teal/20">
        <h3 className="font-medium text-gray-900 mb-2">Branch Efficiency Formula</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="px-2 py-1 bg-white rounded-lg">Turnaround: 25%</span>
          <span className="px-2 py-1 bg-white rounded-lg">Staff Productivity: 25%</span>
          <span className="px-2 py-1 bg-white rounded-lg">Equipment: 20%</span>
          <span className="px-2 py-1 bg-white rounded-lg">Revenue: 20%</span>
          <span className="px-2 py-1 bg-white rounded-lg">Satisfaction: 10%</span>
        </div>
      </ModernCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch List */}
        <div className="lg:col-span-1">
          <ModernCard>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Branch Rankings</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : branches.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No branches found</div>
              ) : (
                branches.map((branch, index) => (
                  <div
                    key={branch.branchId}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedBranch === branch.branchId ? 'bg-lorenzo-teal/10' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBranch(branch.branchId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{branch.name}</h3>
                          <p className="text-xs text-gray-500">
                            {branch.ordersToday} orders | KES {branch.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {branch.efficiency !== null ? (
                          <>
                            <span className={`text-lg font-bold ${getEfficiencyColor(branch.efficiency)}`}>
                              {branch.efficiency}%
                            </span>
                            {branch.trend === 'up' ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : branch.trend === 'down' ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                          </>
                        ) : (
                          <span className="text-sm text-amber-600">Incomplete Data</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ModernCard>
        </div>

        {/* Branch Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <ModernCard>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{selected.name}</h2>
                    <p className="text-sm text-gray-500">Performance Breakdown</p>
                  </div>
                  <div className="text-right">
                    {selected.efficiency !== null ? (
                      <>
                        <span className={`text-3xl font-bold ${getEfficiencyColor(selected.efficiency)}`}>
                          {selected.efficiency}%
                        </span>
                        <p className="text-sm text-gray-500">Overall Efficiency</p>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-medium text-amber-600">Insufficient Data</span>
                        <p className="text-sm text-gray-500">Complete data required</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Turnaround Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Turnaround Time</span>
                      <span className="text-xs text-gray-400">(25%)</span>
                    </div>
                    <span className={`font-semibold ${getEfficiencyColor(selected.turnaroundScore)}`}>
                      {selected.turnaroundScore}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressColor(selected.turnaroundScore)}`}
                      style={{ width: `${selected.turnaroundScore}%` }}
                    />
                  </div>
                </div>

                {/* Staff Productivity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Staff Productivity</span>
                      <span className="text-xs text-gray-400">(25%)</span>
                    </div>
                    {selected.staffProductivity !== null ? (
                      <span className={`font-semibold ${getEfficiencyColor(selected.staffProductivity)}`}>
                        {selected.staffProductivity}%
                      </span>
                    ) : (
                      <span className="text-sm text-amber-600">No Data</span>
                    )}
                  </div>
                  {selected.staffProductivity !== null ? (
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressColor(selected.staffProductivity)}`}
                        style={{ width: `${selected.staffProductivity}%` }}
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">
                        Staff productivity data requires attendance records. Staff must clock in/out.
                      </p>
                    </div>
                  )}
                </div>

                {/* Equipment Utilization */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Equipment Utilization</span>
                      <span className="text-xs text-gray-400">(20%)</span>
                    </div>
                    {selected.equipmentUtilization !== null ? (
                      <span className={`font-semibold ${getEfficiencyColor(selected.equipmentUtilization)}`}>
                        {selected.equipmentUtilization}%
                      </span>
                    ) : (
                      <span className="text-sm text-amber-600">No Data</span>
                    )}
                  </div>
                  {selected.equipmentUtilization !== null ? (
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressColor(selected.equipmentUtilization)}`}
                        style={{ width: `${selected.equipmentUtilization}%` }}
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">
                        {selected.hasEquipmentData === false
                          ? 'Equipment needs to be configured for this branch.'
                          : 'No equipment utilization data available.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Revenue Achievement */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Revenue Achievement</span>
                      <span className="text-xs text-gray-400">(20%)</span>
                    </div>
                    <span className={`font-semibold ${getEfficiencyColor(selected.revenueAchievement)}`}>
                      {selected.revenueAchievement}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressColor(selected.revenueAchievement)}`}
                      style={{ width: `${selected.revenueAchievement}%` }}
                    />
                  </div>
                </div>

                {/* Customer Satisfaction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Customer Satisfaction</span>
                      <span className="text-xs text-gray-400">(10%)</span>
                    </div>
                    {selected.customerSatisfaction !== null ? (
                      <span className={`font-semibold ${getEfficiencyColor(selected.customerSatisfaction)}`}>
                        {selected.customerSatisfaction}%
                      </span>
                    ) : (
                      <span className="text-sm text-amber-600">No Data</span>
                    )}
                  </div>
                  {selected.customerSatisfaction !== null ? (
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressColor(selected.customerSatisfaction)}`}
                        style={{ width: `${selected.customerSatisfaction}%` }}
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">
                        Customer satisfaction data will appear after customers submit feedback.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ModernCard>
          ) : (
            <ModernCard className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Select a Branch</h3>
              <p className="text-sm text-gray-500">
                Click on a branch from the list to view detailed performance metrics
              </p>
            </ModernCard>
          )}
        </div>
      </div>
    </div>
  );
}
