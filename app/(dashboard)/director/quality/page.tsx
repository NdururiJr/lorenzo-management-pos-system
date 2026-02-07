'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { Button } from '@/components/ui/button';
import {
  Star,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Building2,
  Package
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface QualityMetrics {
  satisfactionScore: number;
  issueRate: number;
  resolutionRate: number;
  returnRate: number;
  qualityTrend: 'up' | 'down' | 'stable';
}

interface BranchQuality {
  branchId: string;
  name: string;
  satisfactionScore: number;
  issuesCount: number;
  resolvedCount: number;
}

interface RecentIssue {
  id: string;
  branchName: string;
  type: string;
  severity: string;
  status: string;
  createdAt: Date;
}

export default function DirectorQualityPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<QualityMetrics>({
    satisfactionScore: 0,
    issueRate: 0,
    resolutionRate: 0,
    returnRate: 0,
    qualityTrend: 'stable'
  });
  const [branchQuality, setBranchQuality] = useState<BranchQuality[]>([]);
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Verify director role
  useEffect(() => {
    if (userData && userData.role !== 'director') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchQualityData = async () => {
    try {
      // Fetch branches
      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchMap: Record<string, string> = {};
      branchesSnap.docs.forEach(doc => {
        const data = doc.data() as { name?: string };
        branchMap[doc.id] = data.name || doc.id;
      });

      // Fetch customer feedback for satisfaction score
      let totalSatisfaction = 0;
      let feedbackCount = 0;
      try {
        const feedbackSnap = await getDocs(
          query(collection(db, 'customerFeedback'), orderBy('createdAt', 'desc'), limit(100))
        );
        feedbackSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.rating) {
            totalSatisfaction += data.rating;
            feedbackCount++;
          }
        });
      } catch {
        // Collection might not exist yet
      }

      const avgSatisfaction = feedbackCount > 0
        ? Math.round((totalSatisfaction / feedbackCount) * 20) // Convert 1-5 to percentage
        : 85; // Default

      // Fetch issues
      let totalIssues = 0;
      let resolvedIssues = 0;
      const branchIssues: Record<string, { issues: number; resolved: number }> = {};
      const issuesList: RecentIssue[] = [];

      try {
        const issuesSnap = await getDocs(
          query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(100))
        );
        issuesSnap.docs.forEach(doc => {
          const data = doc.data();
          totalIssues++;

          if (data.status === 'resolved') {
            resolvedIssues++;
          }

          if (data.branchId) {
            if (!branchIssues[data.branchId]) {
              branchIssues[data.branchId] = { issues: 0, resolved: 0 };
            }
            branchIssues[data.branchId].issues++;
            if (data.status === 'resolved') {
              branchIssues[data.branchId].resolved++;
            }
          }

          if (issuesList.length < 10) {
            issuesList.push({
              id: doc.id,
              branchName: branchMap[data.branchId] || 'Unknown',
              type: data.type || 'General',
              severity: data.severity || 'medium',
              status: data.status || 'open',
              createdAt: data.createdAt?.toDate() || new Date()
            });
          }
        });
      } catch {
        // Collection might not exist yet
      }

      // Fetch orders for return rate
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const ordersSnap = await getDocs(
        query(
          collection(db, 'orders'),
          where('createdAt', '>=', Timestamp.fromDate(monthAgo))
        )
      );

      let returnedOrders = 0;
      ordersSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'returned' || data.hasQualityIssue) {
          returnedOrders++;
        }
      });

      const returnRate = ordersSnap.size > 0
        ? Math.round((returnedOrders / ordersSnap.size) * 100)
        : 0;

      setMetrics({
        satisfactionScore: avgSatisfaction,
        issueRate: ordersSnap.size > 0 ? Math.round((totalIssues / ordersSnap.size) * 100) : 0,
        resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100,
        returnRate,
        qualityTrend: avgSatisfaction >= 85 ? 'up' : avgSatisfaction >= 70 ? 'stable' : 'down'
      });

      // Build branch quality data
      const branchQualityList = Object.entries(branchMap).map(([id, name]) => {
        const issues = branchIssues[id] || { issues: 0, resolved: 0 };
        return {
          branchId: id,
          name,
          satisfactionScore: avgSatisfaction, // Would be per-branch in real implementation
          issuesCount: issues.issues,
          resolvedCount: issues.resolved
        };
      });

      setBranchQuality(branchQualityList);
      setRecentIssues(issuesList);
    } catch (error) {
      console.error('Error fetching quality data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQualityData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQualityData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (userData?.role !== 'director') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quality Metrics</h1>
          <p className="text-gray-500 mt-1">Monitor service quality and customer satisfaction</p>
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

      {/* Quality Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Satisfaction Score</p>
              <p className="text-2xl font-semibold mt-1">{metrics.satisfactionScore}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {metrics.qualityTrend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={metrics.qualityTrend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {metrics.qualityTrend === 'up' ? 'Improving' : 'Declining'}
            </span>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Issue Rate</p>
              <p className="text-2xl font-semibold mt-1">{metrics.issueRate}%</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolution Rate</p>
              <p className="text-2xl font-semibold mt-1">{metrics.resolutionRate}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Return Rate</p>
              <p className="text-2xl font-semibold mt-1">{metrics.returnRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </ModernCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Quality */}
        <ModernCard>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quality by Branch</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : branchQuality.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No data available</div>
            ) : (
              branchQuality.map((branch) => (
                <div key={branch.branchId} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{branch.name}</span>
                    </div>
                    <ModernBadge
                      variant={branch.satisfactionScore >= 85 ? 'success' : 'warning'}
                    >
                      {branch.satisfactionScore}%
                    </ModernBadge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{branch.issuesCount} issues</span>
                    <span>{branch.resolvedCount} resolved</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ModernCard>

        {/* Recent Issues */}
        <ModernCard>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Issues</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : recentIssues.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No recent issues</div>
            ) : (
              recentIssues.map((issue) => (
                <div key={issue.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{issue.type}</p>
                      <p className="text-sm text-gray-500">{issue.branchName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ModernBadge variant={getSeverityColor(issue.severity) as 'danger' | 'warning' | 'secondary'}>
                        {issue.severity}
                      </ModernBadge>
                      <ModernBadge
                        variant={issue.status === 'resolved' ? 'success' : 'secondary'}
                      >
                        {issue.status}
                      </ModernBadge>
                    </div>
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
