/**
 * Routing Metrics Component (FR-006)
 *
 * Displays real-time metrics for order routing including:
 * - Orders pending routing
 * - Orders in transit between branches
 * - Queue depth by workstation stage
 * - Orders ready for return/delivery
 *
 * @module components/features/workstation/RoutingMetrics
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  Route,
  Truck,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Clock,
  Package,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface RoutingMetrics {
  pendingRouting: number;
  inTransit: number;
  queueByStage: Record<string, number>;
  readyForReturn: number;
  totalInProcess: number;
}

export function RoutingMetrics() {
  const { userData } = useAuth();

  // Fetch routing metrics
  const {
    data: metrics,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<RoutingMetrics>({
    queryKey: ['routing-metrics', userData?.branchId],
    queryFn: async () => {
      if (!userData?.branchId) {
        return {
          pendingRouting: 0,
          inTransit: 0,
          queueByStage: {},
          readyForReturn: 0,
          totalInProcess: 0,
        };
      }

      const response = await fetch(
        `/api/routing?branchId=${userData.branchId}&type=metrics`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.metrics;
    },
    enabled: !!userData?.branchId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Stage labels for display
  const stageLabels: Record<string, string> = {
    inspection: 'Inspection',
    washing: 'Washing',
    drying: 'Drying',
    ironing: 'Ironing',
    quality_check: 'Quality Check',
    packaging: 'Packaging',
  };

  // Stage colors
  const stageColors: Record<string, string> = {
    inspection: 'bg-blue-500',
    washing: 'bg-cyan-500',
    drying: 'bg-yellow-500',
    ironing: 'bg-orange-500',
    quality_check: 'bg-purple-500',
    packaging: 'bg-green-500',
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Order Routing
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const totalInQueue = metrics?.totalInProcess || 0;
  const maxQueueDepth = Math.max(
    ...Object.values(metrics?.queueByStage || { default: 0 }),
    1
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Order Routing
            </CardTitle>
            <CardDescription>Real-time routing status</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold">{metrics?.pendingRouting || 0}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Truck className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{metrics?.inTransit || 0}</div>
            <div className="text-xs text-gray-500">In Transit</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Package className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">{totalInQueue}</div>
            <div className="text-xs text-gray-500">Processing</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{metrics?.readyForReturn || 0}</div>
            <div className="text-xs text-gray-500">Ready</div>
          </div>
        </div>

        {/* Queue by Stage */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Queue by Stage</h4>
          <div className="space-y-3">
            {Object.entries(stageLabels).map(([stage, label]) => {
              const count = metrics?.queueByStage?.[stage] || 0;
              const percentage = (count / maxQueueDepth) * 100;

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{label}</span>
                    <Badge variant="outline" className="font-mono">
                      {count}
                    </Badge>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${stageColors[stage]}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Order Flow</h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50">
                {metrics?.pendingRouting || 0} Pending
              </Badge>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                {metrics?.inTransit || 0} Transit
              </Badge>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50">
                {totalInQueue} Process
              </Badge>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">
                {metrics?.readyForReturn || 0} Ready
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
