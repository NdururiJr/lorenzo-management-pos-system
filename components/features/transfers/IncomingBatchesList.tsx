/**
 * Incoming Batches List Component
 *
 * Shows incoming transfer batches for main store staff.
 * Allows receiving batches and viewing details.
 *
 * @module components/features/transfers/IncomingBatchesList
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Package, Inbox } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransferBatchCard } from './TransferBatchCard';
import { ReceiveBatchModal } from './ReceiveBatchModal';
import { getTransferBatchesByStatus } from '@/lib/db/transfers';

export function IncomingBatchesList() {
  const { userData } = useAuth();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Fetch in-transit batches
  const { data: inTransitBatches = [], refetch: refetchInTransit } = useQuery({
    queryKey: ['transfer-batches', 'in_transit', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getTransferBatchesByStatus('in_transit', userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  // Fetch received batches (recent)
  const { data: receivedBatches = [], refetch: refetchReceived } = useQuery({
    queryKey: ['transfer-batches', 'received', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getTransferBatchesByStatus('received', userData.branchId, 20);
    },
    enabled: !!userData?.branchId,
  });

  const handleOpenReceiveModal = (batchId: string) => {
    setSelectedBatchId(batchId);
    setShowReceiveModal(true);
  };

  const handleCloseReceiveModal = () => {
    setSelectedBatchId(null);
    setShowReceiveModal(false);
  };

  const handleBatchReceived = () => {
    refetchInTransit();
    refetchReceived();
    handleCloseReceiveModal();
  };

  const selectedBatch = inTransitBatches.find((b) => b.batchId === selectedBatchId);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Incoming Transfer Batches
          </CardTitle>
          <CardDescription>View and receive batches from satellite stores</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="in_transit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="in_transit">
                In Transit ({inTransitBatches.length})
              </TabsTrigger>
              <TabsTrigger value="received">
                Received ({receivedBatches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="in_transit" className="space-y-4 mt-6">
              {inTransitBatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-sm">No batches in transit</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inTransitBatches.map((batch) => (
                    <div key={batch.batchId} className="relative">
                      <TransferBatchCard batch={batch} showActions={false} />
                      <div className="mt-2">
                        <button
                          onClick={() => handleOpenReceiveModal(batch.batchId)}
                          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Receive Batch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="received" className="space-y-4 mt-6">
              {receivedBatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-sm">No received batches</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedBatches.map((batch) => (
                    <TransferBatchCard key={batch.batchId} batch={batch} showActions={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Receive Batch Modal */}
      {showReceiveModal && selectedBatch && (
        <ReceiveBatchModal
          batch={selectedBatch}
          onClose={handleCloseReceiveModal}
          onSuccess={handleBatchReceived}
        />
      )}
    </>
  );
}
