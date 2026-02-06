/**
 * Workstation Overview Component
 *
 * Dashboard showing key metrics and statistics for the workstation.
 * Displays order counts by status, batch activity, and staff performance.
 *
 * @module components/features/workstation/WorkstationOverview
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Loader2, Package, Layers, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrdersPendingInspection } from '@/lib/db/workstation';
import { getActiveBatchesByBranch } from '@/lib/db/processing-batches';
import { getOrdersByBranchAndStatus } from '@/lib/db/orders';

export function WorkstationOverview() {
  const { userData } = useAuth();

  // Fetch orders pending inspection
  const { data: pendingInspection = [], isLoading: loadingInspection } = useQuery({
    queryKey: ['pending-inspection', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersPendingInspection(userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  // Fetch queued orders
  const { data: queuedOrders = [], isLoading: loadingQueued } = useQuery({
    queryKey: ['queued-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'queued');
    },
    enabled: !!userData?.branchId,
  });

  // Fetch active batches
  const { data: activeBatches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ['active-batches', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getActiveBatchesByBranch(userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  // Fetch washing orders
  const { data: washingOrders = [] } = useQuery({
    queryKey: ['washing-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'washing');
    },
    enabled: !!userData?.branchId,
  });

  // Fetch drying orders
  const { data: dryingOrders = [] } = useQuery({
    queryKey: ['drying-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'drying');
    },
    enabled: !!userData?.branchId,
  });

  // Fetch ironing orders
  const { data: ironingOrders = [] } = useQuery({
    queryKey: ['ironing-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'ironing');
    },
    enabled: !!userData?.branchId,
  });

  // Fetch quality check orders
  const { data: qualityCheckOrders = [] } = useQuery({
    queryKey: ['quality-check-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'quality_check');
    },
    enabled: !!userData?.branchId,
  });

  // Fetch packaging orders
  const { data: packagingOrders = [] } = useQuery({
    queryKey: ['packaging-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'packaging');
    },
    enabled: !!userData?.branchId,
  });

  const isLoading = loadingInspection || loadingQueued || loadingBatches;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const totalInProcess =
    washingOrders.length +
    dryingOrders.length +
    ironingOrders.length +
    qualityCheckOrders.length +
    packagingOrders.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Pending Inspection</CardDescription>
              <ClipboardList className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{pendingInspection.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting detailed inspection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>In Queue</CardDescription>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{queuedOrders.length}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for batch processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Active Batches</CardDescription>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{activeBatches.length}</div>
            <p className="text-xs text-gray-500 mt-1">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>In Process</CardDescription>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{totalInProcess}</div>
            <p className="text-xs text-gray-500 mt-1">All processing stages</p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Pipeline Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Processing Pipeline
          </CardTitle>
          <CardDescription>Orders by processing stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Washing */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-black">Washing</div>
                  <div className="text-sm text-gray-600">
                    {washingOrders.length} order{washingOrders.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-700">{washingOrders.length}</div>
            </div>

            {/* Drying */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-black">Drying</div>
                  <div className="text-sm text-gray-600">
                    {dryingOrders.length} order{dryingOrders.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-700">{dryingOrders.length}</div>
            </div>

            {/* Ironing */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-black">Ironing</div>
                  <div className="text-sm text-gray-600">
                    {ironingOrders.length} order{ironingOrders.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-700">{ironingOrders.length}</div>
            </div>

            {/* Quality Check */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-black">Quality Check</div>
                  <div className="text-sm text-gray-600">
                    {qualityCheckOrders.length} order{qualityCheckOrders.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700">{qualityCheckOrders.length}</div>
            </div>

            {/* Packaging */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-black">Packaging</div>
                  <div className="text-sm text-gray-600">
                    {packagingOrders.length} order{packagingOrders.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-700">{packagingOrders.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Batches Summary */}
      {activeBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Active Batches
            </CardTitle>
            <CardDescription>Currently processing batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div>
                    <div className="font-medium text-black">{batch.batchId}</div>
                    <div className="text-sm text-gray-600">
                      {batch.stage.charAt(0).toUpperCase() + batch.stage.slice(1)} •{' '}
                      {batch.orderIds.length} orders • {batch.assignedStaffIds.length} staff
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {batch.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
