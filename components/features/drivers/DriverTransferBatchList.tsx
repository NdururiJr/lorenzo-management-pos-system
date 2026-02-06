/**
 * Driver Transfer Batch List Component
 *
 * Displays a list of transfer batches assigned to a driver.
 * Shows active batches (pending and in_transit) by default.
 *
 * @module components/features/drivers/DriverTransferBatchList
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, Truck, Inbox, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DriverTransferBatchCard } from './DriverTransferBatchCard';
import { getTransferBatchesByDriver } from '@/lib/db/transfers';

interface DriverTransferBatchListProps {
  driverId: string;
}

export function DriverTransferBatchList({ driverId }: DriverTransferBatchListProps) {
  const {
    data: batches = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['driver-transfer-batches', driverId],
    queryFn: () => getTransferBatchesByDriver(driverId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const pendingBatches = batches.filter((b) => b.status === 'pending');
  const inTransitBatches = batches.filter((b) => b.status === 'in_transit');
  const receivedBatches = batches.filter((b) => b.status === 'received');

  const activeBatchesCount = pendingBatches.length + inTransitBatches.length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lorenzo-teal mb-4" />
        <p className="text-sm text-gray-500">Loading transfer batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Transfer Batches
          </h3>
          <p className="text-sm text-gray-500">
            {activeBatchesCount > 0
              ? `${activeBatchesCount} active transfer${activeBatchesCount !== 1 ? 's' : ''}`
              : 'No active transfers'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Inbox className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No transfer batches assigned</p>
          <p className="text-sm text-gray-400 mt-1">
            Transfer batches will appear here when assigned to you
          </p>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Active ({activeBatchesCount})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Pending ({pendingBatches.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed ({receivedBatches.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Tab - Shows both pending and in_transit */}
          <TabsContent value="active" className="mt-4 space-y-4">
            {activeBatchesCount === 0 ? (
              <EmptyState message="No active transfers" />
            ) : (
              [...pendingBatches, ...inTransitBatches]
                .sort((a, b) => {
                  // Prioritize in_transit over pending
                  if (a.status === 'in_transit' && b.status !== 'in_transit') return -1;
                  if (b.status === 'in_transit' && a.status !== 'in_transit') return 1;
                  return b.createdAt.toMillis() - a.createdAt.toMillis();
                })
                .map((batch) => (
                  <DriverTransferBatchCard
                    key={batch.batchId}
                    batch={batch}
                    onStatusChange={refetch}
                  />
                ))
            )}
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending" className="mt-4 space-y-4">
            {pendingBatches.length === 0 ? (
              <EmptyState message="No pending transfers" />
            ) : (
              pendingBatches.map((batch) => (
                <DriverTransferBatchCard
                  key={batch.batchId}
                  batch={batch}
                  onStatusChange={refetch}
                />
              ))
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="mt-4 space-y-4">
            {receivedBatches.length === 0 ? (
              <EmptyState message="No completed transfers" />
            ) : (
              receivedBatches.slice(0, 10).map((batch) => (
                <DriverTransferBatchCard
                  key={batch.batchId}
                  batch={batch}
                  onStatusChange={refetch}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <Inbox className="w-8 h-8 text-gray-300 mb-2" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
