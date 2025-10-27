/**
 * Transfers Management Page
 *
 * Allows satellite store staff to create transfer batches to main store.
 * Shows outgoing batches and allows main store staff to view incoming batches.
 *
 * @module app/(dashboard)/transfers/page
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Truck, Package, ArrowRight, Inbox } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransferBatchForm } from '@/components/features/transfers/TransferBatchForm';
import { TransferBatchCard } from '@/components/features/transfers/TransferBatchCard';
import { IncomingBatchesList } from '@/components/features/transfers/IncomingBatchesList';
import {
  getTransferBatchesBySatellite,
  getTransferBatchesByStatus,
  getPendingTransferBatches,
} from '@/lib/db/transfers';
import { getOrdersByBranchAndStatus } from '@/lib/db/orders';
import { getDocument } from '@/lib/db/index';
import type { Branch } from '@/lib/db/schema';

export default function TransfersPage() {
  const { user, userData } = useAuth();
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [showBatchForm, setShowBatchForm] = useState(false);

  // Fetch branch info to check if main or satellite
  const { data: branch } = useQuery({
    queryKey: ['branch', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return null;
      return getDocument<Branch>('branches', userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  // Fetch orders ready for transfer (satellite stores only)
  const { data: receivedOrders = [] } = useQuery({
    queryKey: ['received-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId || branch?.branchType !== 'satellite') return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'received');
    },
    enabled: !!userData?.branchId && branch?.branchType === 'satellite',
  });

  // Fetch outgoing batches (satellite stores)
  const { data: outgoingBatches = [], refetch: refetchOutgoing } = useQuery({
    queryKey: ['outgoing-batches', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId || branch?.branchType !== 'satellite') return [];
      return getTransferBatchesBySatellite(userData.branchId);
    },
    enabled: !!userData?.branchId && branch?.branchType === 'satellite',
  });

  // Fetch pending batches count
  const { data: pendingBatchesCount = 0 } = useQuery({
    queryKey: ['pending-batches-count'],
    queryFn: async () => {
      const batches = await getPendingTransferBatches();
      return batches.length;
    },
  });

  const handleCreateBatch = () => {
    if (selectedOrderIds.length === 0) {
      return;
    }
    setShowBatchForm(true);
  };

  const handleBatchCreated = () => {
    setSelectedOrderIds([]);
    setShowBatchForm(false);
    refetchOutgoing();
  };

  const handleCancelBatchForm = () => {
    setShowBatchForm(false);
  };

  const handleOrderToggle = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === receivedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(receivedOrders.map((o) => o.orderId));
    }
  };

  // Main store view
  if (branch?.branchType === 'main') {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Inbox className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Incoming Transfers</h1>
                <p className="text-gray-600 text-sm">
                  View and receive transfer batches from satellite stores
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <IncomingBatchesList />
        </div>
      </div>
    );
  }

  // Satellite store view
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Transfer Management</h1>
              <p className="text-gray-600 text-sm">
                Create and manage transfer batches to main store
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Ready for Transfer</CardDescription>
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{receivedOrders.length}</div>
                <p className="text-xs text-gray-500 mt-1">Orders at satellite store</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Pending Batches</CardDescription>
                  <Truck className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{pendingBatchesCount}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Awaiting driver pickup
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Total Batches</CardDescription>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">{outgoingBatches.length}</div>
                <p className="text-xs text-gray-500 mt-1">All outgoing batches</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Order Selection Section */}
        {!showBatchForm && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Select Orders for Transfer
                </h2>
                <p className="text-sm text-gray-600">
                  Choose received orders to create a transfer batch to main store
                </p>
              </div>
              {selectedOrderIds.length > 0 && (
                <Button
                  onClick={handleCreateBatch}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Create Batch ({selectedOrderIds.length})
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="p-6">
                {receivedOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No orders ready for transfer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedOrderIds.length === receivedOrders.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                      <span className="text-sm text-gray-600">
                        {selectedOrderIds.length} of {receivedOrders.length} selected
                      </span>
                    </div>

                    <div className="space-y-2">
                      {receivedOrders.map((order) => (
                        <label
                          key={order.orderId}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.orderId)}
                            onChange={() => handleOrderToggle(order.orderId)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-black">{order.orderId}</div>
                            <div className="text-sm text-gray-600">
                              {order.customerName} • {order.garments.length} item
                              {order.garments.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            KES {order.totalAmount.toLocaleString()}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Batch Creation Form */}
        {showBatchForm && userData?.branchId && (
          <TransferBatchForm
            satelliteBranchId={userData.branchId}
            selectedOrderIds={selectedOrderIds}
            onCancel={handleCancelBatchForm}
            onSuccess={handleBatchCreated}
          />
        )}

        {/* Outgoing Batches */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black">Outgoing Transfer Batches</h2>
            <p className="text-sm text-gray-600">Monitor batches being transferred to main store</p>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending (
                {outgoingBatches.filter((b) => b.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="in_transit">
                In Transit (
                {outgoingBatches.filter((b) => b.status === 'in_transit').length})
              </TabsTrigger>
              <TabsTrigger value="received">
                Received (
                {outgoingBatches.filter((b) => b.status === 'received').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {outgoingBatches.filter((b) => b.status === 'pending').length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No pending batches</p>
                  </CardContent>
                </Card>
              ) : (
                outgoingBatches
                  .filter((b) => b.status === 'pending')
                  .map((batch) => (
                    <TransferBatchCard
                      key={batch.batchId}
                      batch={batch}
                      onStatusChange={refetchOutgoing}
                    />
                  ))
              )}
            </TabsContent>

            <TabsContent value="in_transit" className="space-y-4 mt-6">
              {outgoingBatches.filter((b) => b.status === 'in_transit').length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No batches in transit</p>
                  </CardContent>
                </Card>
              ) : (
                outgoingBatches
                  .filter((b) => b.status === 'in_transit')
                  .map((batch) => (
                    <TransferBatchCard key={batch.batchId} batch={batch} showActions={false} />
                  ))
              )}
            </TabsContent>

            <TabsContent value="received" className="space-y-4 mt-6">
              {outgoingBatches.filter((b) => b.status === 'received').length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No received batches</p>
                  </CardContent>
                </Card>
              ) : (
                outgoingBatches
                  .filter((b) => b.status === 'received')
                  .map((batch) => (
                    <TransferBatchCard key={batch.batchId} batch={batch} showActions={false} />
                  ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
