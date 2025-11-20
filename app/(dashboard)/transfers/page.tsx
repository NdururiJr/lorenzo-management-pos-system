/**
 * Transfers Management Page
 *
 * Modern transfers management with glassmorphic design and blue theme.
 * Features batch transfers between satellite and main stores with animations.
 *
 * @module app/(dashboard)/transfers/page
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Truck, Package, ArrowRight, Inbox, Building2, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransferBatchForm } from '@/components/features/transfers/TransferBatchForm';
import { TransferBatchCard } from '@/components/features/transfers/TransferBatchCard';
import { IncomingBatchesList } from '@/components/features/transfers/IncomingBatchesList';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernButton } from '@/components/modern/ModernButton';
import { ModernBadge } from '@/components/modern/ModernBadge';
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
      <ModernSection animate className="min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="p-3 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/10"
            >
              <Inbox className="h-6 w-6 text-brand-blue" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
                Incoming Transfers
              </h1>
              <p className="text-sm text-gray-600">
                View and receive transfer batches from satellite stores
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ModernCard hover glowIntensity="low">
            <ModernCardContent className="p-6">
              <IncomingBatchesList />
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </ModernSection>
    );
  }

  // Satellite store view
  return (
    <ModernSection animate className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="p-3 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/10"
          >
            <Truck className="h-6 w-6 text-brand-blue" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
              Transfer Management
            </h1>
            <p className="text-sm text-gray-600">
              Create and manage transfer batches to main store
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModernStatCard
            title="Ready for Transfer"
            value={receivedOrders.length}
            icon={<Package className="h-5 w-5" />}
            changeLabel="At satellite store"
            delay={0.1}
          />

          <ModernStatCard
            title="Pending Batches"
            value={pendingBatchesCount}
            icon={<Truck className="h-5 w-5" />}
            changeLabel="Awaiting pickup"
            delay={0.2}
            variant="gradient"
          />

          <ModernStatCard
            title="Total Batches"
            value={outgoingBatches.length}
            icon={<ArrowRight className="h-5 w-5" />}
            changeLabel="All outgoing"
            delay={0.3}
            variant="solid"
          />
        </div>
      </motion.div>

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
                <ModernButton
                  onClick={handleCreateBatch}
                  variant="primary"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Create Batch ({selectedOrderIds.length})
                </ModernButton>
              )}
            </div>

            <ModernCard hover glowIntensity="low">
              <ModernCardContent className="p-6">
                {receivedOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No orders ready for transfer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <ModernButton
                        variant="secondary"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedOrderIds.length === receivedOrders.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </ModernButton>
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
              </ModernCardContent>
            </ModernCard>
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
                <ModernCard>
                  <ModernCardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No pending batches</p>
                  </ModernCardContent>
                </ModernCard>
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
                <ModernCard>
                  <ModernCardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No batches in transit</p>
                  </ModernCardContent>
                </ModernCard>
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
                <ModernCard>
                  <ModernCardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-sm">No received batches</p>
                  </ModernCardContent>
                </ModernCard>
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
    </ModernSection>
  );
}
