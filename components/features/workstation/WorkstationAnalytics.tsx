/**
 * Workstation Analytics Component
 *
 * Displays overall workstation performance analytics and metrics.
 * Shows aggregate data across all staff and stages.
 *
 * @module components/features/workstation/WorkstationAnalytics
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Activity, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getOrdersByBranch } from '@/lib/db/orders';
import { getActiveBatchesByBranch } from '@/lib/db/processing-batches';
import type { Order } from '@/lib/db/schema';

const STAGES = [
  { value: 'inspection', label: 'Inspection', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'washing', label: 'Washing', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'drying', label: 'Drying', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'ironing', label: 'Ironing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'quality_check', label: 'Quality Check', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'packaging', label: 'Packaging', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
];

export function WorkstationAnalytics() {
  const { userData } = useAuth();

  // Check if user is manager
  const isManager =
    userData?.role === 'workstation_manager' ||
    userData?.role === 'store_manager' ||
    userData?.role === 'director' ||
    userData?.role === 'general_manager';

  // Fetch all orders at this branch
  const { data: allOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['all-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranch(userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  // Fetch active batches
  const { data: activeBatches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['active-batches', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getActiveBatchesByBranch(userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  if (!isManager) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Only Workstation Managers can view workstation analytics.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingOrders || isLoadingBatches) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Calculate analytics
  const ordersByStage = STAGES.reduce((acc, stage) => {
    acc[stage.value] = allOrders.filter((o) => o.status === stage.value).length;
    return acc;
  }, {} as Record<string, number>);

  const totalInProgress = Object.values(ordersByStage).reduce((sum, count) => sum + count, 0);

  // Completed orders (queued_for_delivery status) - FR-008
  const completedOrders = allOrders.filter((o) => o.status === 'queued_for_delivery').length;

  // Calculate average processing time for completed orders
  const calculateAvgProcessingTime = (orders: Order[]) => {
    const completedWithTimes = orders.filter(
      (o) => o.status === 'queued_for_delivery' && o.createdAt && o.actualCompletion
    );

    if (completedWithTimes.length === 0) return 0;

    const totalMinutes = completedWithTimes.reduce((sum, order) => {
      const start = order.createdAt.toDate().getTime();
      const end = order.actualCompletion!.toDate().getTime();
      const minutes = (end - start) / (1000 * 60);
      return sum + minutes;
    }, 0);

    return totalMinutes / completedWithTimes.length;
  };

  const avgProcessingTime = calculateAvgProcessingTime(allOrders);

  // Orders with major issues
  const ordersWithMajorIssues = allOrders.filter((o) =>
    o.garments.some((g) => g.conditionAssessment === 'major_issues')
  ).length;

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h ${mins}m`;
  };

  // Calculate bottleneck stage (stage with most orders)
  const bottleneckStage = STAGES.reduce((max, stage) => {
    const count = ordersByStage[stage.value] || 0;
    const maxCount = ordersByStage[max.value] || 0;
    return count > maxCount ? stage : max;
  }, STAGES[0]);

  const hasBottleneck = (ordersByStage[bottleneckStage.value] || 0) > 5;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Activity className="w-4 h-4" />
        <AlertDescription>
          <strong>Workstation Analytics:</strong> View overall workstation performance metrics,
          processing times, and stage distribution across all orders.
        </AlertDescription>
      </Alert>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total In Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-black mt-2">{totalInProgress}</p>
                <p className="text-xs text-gray-500 mt-1">orders</p>
              </div>
              <Activity className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-black mt-2">{completedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">orders ready</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Avg Processing Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                <p className="text-2xl font-bold text-black mt-2">
                  {avgProcessingTime > 0 ? formatDuration(avgProcessingTime) : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">per order</p>
              </div>
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Major Issues */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Major Issues</p>
                <p className="text-3xl font-bold text-black mt-2">{ordersWithMajorIssues}</p>
                <p className="text-xs text-gray-500 mt-1">orders flagged</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Stage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Orders by Processing Stage
          </CardTitle>
          <CardDescription>
            Distribution of orders across different workstation stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const count = ordersByStage[stage.value] || 0;
              const percentage = totalInProgress > 0 ? (count / totalInProgress) * 100 : 0;

              return (
                <div key={stage.value}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${stage.color} border`}>{stage.label}</Badge>
                      {stage.value === bottleneckStage.value && hasBottleneck && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Bottleneck
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-black">
                      {count} order{count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {percentage > 0 ? `${percentage.toFixed(1)}%` : '0%'} of total in progress
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Batches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Batches
          </CardTitle>
          <CardDescription>Currently processing batches for washing and drying</CardDescription>
        </CardHeader>
        <CardContent>
          {activeBatches.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200">
              No active batches at this time
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBatches.map((batch) => {
                const stageInfo = STAGES.find((s) => s.value === batch.stage);
                const isProcessing = batch.status === 'in_progress';

                return (
                  <div
                    key={batch.batchId}
                    className={`p-4 rounded-lg border ${
                      isProcessing
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-black">{batch.batchId}</div>
                      <Badge
                        className={`${
                          isProcessing
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {batch.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Stage:</span>
                        <Badge className={stageInfo?.color || 'bg-gray-100'}>
                          {stageInfo?.label || batch.stage}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Orders:</span>
                        <span className="font-semibold text-black">
                          {batch.orderIds.length}
                        </span>
                      </div>

                      {batch.assignedStaffIds && batch.assignedStaffIds.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Staff:</span>
                          <span className="font-medium text-black">
                            {batch.assignedStaffIds.length} assigned
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 mt-2">
                        Created: {batch.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Bottleneck Warning */}
          {hasBottleneck && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-amber-800">
                <strong>Bottleneck Detected:</strong> The {bottleneckStage.label} stage has{' '}
                {ordersByStage[bottleneckStage.value]} orders waiting. Consider assigning more
                staff to this stage or creating batches to improve throughput.
              </AlertDescription>
            </Alert>
          )}

          {/* Low Activity */}
          {totalInProgress === 0 && (
            <Alert>
              <AlertDescription>
                No orders currently in progress. All orders are either completed or awaiting
                inspection from the POS.
              </AlertDescription>
            </Alert>
          )}

          {/* High Productivity */}
          {totalInProgress > 20 && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                <strong>High Activity:</strong> {totalInProgress} orders currently being
                processed. Workstation is operating at high capacity.
              </AlertDescription>
            </Alert>
          )}

          {/* Major Issues Alert */}
          {ordersWithMajorIssues > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                <strong>Attention Required:</strong> {ordersWithMajorIssues} order
                {ordersWithMajorIssues !== 1 ? 's have' : ' has'} major issues flagged.
                Review and approve these orders to continue processing.
              </AlertDescription>
            </Alert>
          )}

          {/* Good Performance */}
          {totalInProgress > 0 &&
            !hasBottleneck &&
            ordersWithMajorIssues === 0 &&
            avgProcessingTime > 0 &&
            avgProcessingTime < 2880 && ( // Less than 2 days
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  <strong>Performing Well:</strong> Processing times are good and no major
                  bottlenecks detected. Keep up the great work!
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
