/**
 * Pipeline Page
 *
 * Modern pipeline management page with glassmorphic Kanban board.
 * Features animated cards and blue theme.
 *
 * @module app/(dashboard)/pipeline/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertTriangle, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrderExtended, OrderStatus } from '@/lib/db/schema';
import { updateOrderStatus } from '@/lib/db/orders';
import { PipelineHeader } from '@/components/features/pipeline/PipelineHeader';
import { ModernPipelineStats } from '@/components/modern/ModernPipelineStats';
import { ModernPipelineColumn } from '@/components/modern/ModernPipelineColumn';
import { OrderDetailsModal } from '@/components/features/pipeline/OrderDetailsModal';
import { usePipelineFilters } from '@/hooks/usePipelineFilters';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernSection } from '@/components/modern/ModernLayout';
import {
  groupOrdersByStatus,
  calculatePipelineStatistics,
} from '@/lib/pipeline/pipeline-helpers';
import { getAllStatuses, canTransitionTo } from '@/lib/pipeline/status-manager';

export default function PipelinePage() {
  const { user, userData } = useAuth();
  const [orders, setOrders] = useState<OrderExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderExtended | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if user is manager (pipeline is manager-only)
  const isManager =
    userData?.role === 'admin' ||
    userData?.role === 'workstation_manager' ||
    userData?.role === 'store_manager' ||
    userData?.role === 'director' ||
    userData?.role === 'general_manager' ||
    userData?.role === 'manager';

  // Use filters hook
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredOrders,
    hasActiveFilters,
  } = usePipelineFilters(orders);

  // Group filtered orders by status
  const ordersByStatus = groupOrdersByStatus(filteredOrders);

  // Calculate statistics
  const statistics = calculatePipelineStatistics(filteredOrders);

  // Real-time listener for orders
  useEffect(() => {
    // If not admin and no branchId, can't load orders
    if (userData?.role !== 'admin' && !userData?.branchId) return;

    setIsLoading(true);

    const ordersRef = collection(db, 'orders');
    const activeStatuses: OrderStatus[] = [
      'received',
      'queued',
      'washing',
      'drying',
      'ironing',
      'quality_check',
      'packaging',
      'ready',
      'out_for_delivery',
    ];

    let q;

    if (userData?.role === 'admin') {
      // Admin sees all active orders
      q = query(
        ordersRef,
        where('status', 'in', activeStatuses.slice(0, 10)),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Staff sees branch orders
      q = query(
        ordersRef,
        where('branchId', '==', userData?.branchId),
        where('status', 'in', activeStatuses.slice(0, 10)),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as OrderExtended[];

        setOrders(ordersData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders. Please refresh the page.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.branchId, userData?.role]);

  // Handle status change
  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus, _note?: string) => {
      if (!user) return;

      // Find the order
      const order = orders.find((o) => o.orderId === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }

      // Validate transition
      if (!canTransitionTo(order.status, newStatus)) {
        toast.error(`Cannot transition from ${order.status} to ${newStatus}`);
        return;
      }

      try {
        // Optimistic update
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.orderId === orderId ? { ...o, status: newStatus } : o
          )
        );

        // Update in Firestore
        await updateOrderStatus(orderId, newStatus, user.uid);

        toast.success(`Order status updated to ${newStatus}`);

        // Close modal if open
        if (isModalOpen) {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update order status');

        // Rollback optimistic update
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.orderId === orderId ? order : o))
        );
      }
    },
    [user, orders, isModalOpen]
  );

  // Handle order click
  const handleOrderClick = useCallback((order: OrderExtended) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    toast.info('Refreshing orders...');
    // Orders automatically refresh via real-time listener
  }, []);

  // Handle print receipt (placeholder)
  const handlePrintReceipt = useCallback((_orderId: string) => {
    toast.info('Receipt printing coming soon!');
    // TODO: Implement receipt printing
  }, []);

  // Handle print order sheet (placeholder)
  const handlePrintOrderSheet = useCallback((_orderId: string) => {
    toast.info('Order sheet printing coming soon!');
    // TODO: Implement order sheet printing
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-card border-2 border-white/60"
        >
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-8 w-8 mx-auto text-brand-blue" />
            </motion.div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Restrict access to managers only
  if (!isManager) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ModernCard className="max-w-md w-full" hover glowIntensity="medium">
            <ModernCardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex p-4 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30 mb-4"
              >
                <AlertTriangle className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
                Access Restricted
              </h3>
              <p className="text-gray-600">
                The Order Pipeline is only accessible to management roles.
                Please contact your administrator if you need access.
              </p>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </div>
    );
  }

  return (
    <ModernSection animate className="h-screen flex flex-col">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-3 mb-2">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="p-3 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/10"
          >
            <GitBranch className="h-6 w-6 text-brand-blue" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
              Order Pipeline
            </h1>
            <p className="text-sm text-gray-600">
              Real-time order tracking & management
            </p>
          </div>
        </div>
      </motion.div>

      {/* Header with Filters */}
      <PipelineHeader
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onRefresh={handleRefresh}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
        totalOrders={orders.length}
        filteredCount={filteredOrders.length}
      />

      {/* Statistics Dashboard */}
      <ModernPipelineStats stats={statistics} />

      {/* Pipeline Board */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-card border-2 border-white/60"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Loader2 className="h-8 w-8 mx-auto text-brand-blue" />
                  </motion.div>
                  <p className="text-sm text-gray-600">Loading pipeline...</p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {/* Desktop: Horizontal Scrollable Columns */}
              <div className="hidden lg:block h-full">
                <ScrollArea className="h-full w-full">
                  <div className="flex gap-4 p-6 min-w-max">
                    {getAllStatuses()
                      .filter(
                        (status) =>
                          status !== 'delivered' && status !== 'collected'
                      )
                      .map((status, index) => (
                        <motion.div
                          key={status}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ModernPipelineColumn
                            status={status}
                            orders={ordersByStatus[status] || []}
                            onOrderClick={handleOrderClick}
                            onStatusChange={handleStatusChange}
                          />
                        </motion.div>
                      ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Mobile: Accordion-style Columns */}
              <div className="lg:hidden h-full overflow-y-auto">
                <div className="space-y-4 p-4">
                  {getAllStatuses()
                    .filter(
                      (status) =>
                        status !== 'delivered' && status !== 'collected'
                    )
                    .map((status, index) => {
                      const statusOrders = ordersByStatus[status] || [];
                      const count = statusOrders.length;

                      return (
                        <motion.div
                          key={status}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ModernCard hover>
                            <details className="group">
                              <summary className="cursor-pointer p-4 hover:bg-brand-blue/5 transition-colors list-none rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900">
                                    {status}
                                  </h3>
                                  <span className="px-3 py-1 rounded-full bg-brand-blue/10 text-sm text-brand-blue font-medium">
                                    {count} orders
                                  </span>
                                </div>
                              </summary>
                              <ModernCardContent className="space-y-3">
                                {statusOrders.length > 0 ? (
                                  statusOrders.map((order) => (
                                    <motion.div
                                      key={order.orderId}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => handleOrderClick(order)}
                                      className="p-4 bg-gradient-to-r from-brand-blue/5 to-brand-blue/10 border border-brand-blue/20 rounded-2xl cursor-pointer hover:shadow-glow-blue/10 transition-all"
                                    >
                                      <p className="font-mono font-semibold text-sm text-brand-blue">
                                        {order.orderId}
                                      </p>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {order.customerName}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-2">
                                        {order.garments.length} garments • KES{' '}
                                        {order.totalAmount.toLocaleString()}
                                      </p>
                                    </motion.div>
                                  ))
                                ) : (
                                  <p className="text-sm text-center text-gray-500 py-4">
                                    No orders in this stage
                                  </p>
                                )}
                              </ModernCardContent>
                            </details>
                          </ModernCard>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        onStatusChange={handleStatusChange}
        onPrintReceipt={handlePrintReceipt}
        onPrintOrderSheet={handlePrintOrderSheet}
      />
    </ModernSection>
  );
}
