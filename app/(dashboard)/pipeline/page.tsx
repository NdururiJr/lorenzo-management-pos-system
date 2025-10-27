/**
 * Pipeline Page
 *
 * Main order pipeline management page with Kanban board.
 * Real-time order tracking and status management.
 *
 * @module app/(dashboard)/pipeline/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import type { OrderExtended, OrderStatus } from '@/lib/db/schema';
import { updateOrderStatus } from '@/lib/db/orders';
import { PipelineHeader } from '@/components/features/pipeline/PipelineHeader';
import { PipelineStats } from '@/components/features/pipeline/PipelineStats';
import { PipelineColumn } from '@/components/features/pipeline/PipelineColumn';
import { OrderDetailsModal } from '@/components/features/pipeline/OrderDetailsModal';
import { usePipelineFilters } from '@/hooks/usePipelineFilters';
import {
  groupOrdersByStatus,
  calculatePipelineStatistics,
  calculateTimeInCurrentStage,
} from '@/lib/pipeline/pipeline-helpers';
import { getAllStatuses, canTransitionTo } from '@/lib/pipeline/status-manager';

export default function PipelinePage() {
  const { user, userData } = useAuth();
  const [orders, setOrders] = useState<OrderExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderExtended | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if user is manager (pipeline is manager-only)
  const isManager =
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
    statusCounts,
    hasActiveFilters,
  } = usePipelineFilters(orders);

  // Group filtered orders by status
  const ordersByStatus = groupOrdersByStatus(filteredOrders);

  // Calculate statistics
  const statistics = calculatePipelineStatistics(filteredOrders);

  // Real-time listener for orders
  useEffect(() => {
    if (!userData?.branchId) return;

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

    const q = query(
      ordersRef,
      where('branchId', '==', userData.branchId),
      where('status', 'in', activeStatuses.slice(0, 10)), // Firestore 'in' limit is 10
      orderBy('createdAt', 'desc')
    );

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
  }, [userData?.branchId]);

  // Handle status change
  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus, note?: string) => {
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
  const handlePrintReceipt = useCallback((orderId: string) => {
    toast.info('Receipt printing coming soon!');
    // TODO: Implement receipt printing
  }, []);

  // Handle print order sheet (placeholder)
  const handlePrintOrderSheet = useCallback((orderId: string) => {
    toast.info('Order sheet printing coming soon!');
    // TODO: Implement order sheet printing
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Restrict access to managers only
  if (!isManager) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-6">
        <Card className="max-w-md w-full p-6">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Access Restricted:</strong> The Order Pipeline is only accessible to
              management roles. Please contact your administrator if you need access.
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
      <PipelineStats stats={statistics} />

      {/* Pipeline Board */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading pipeline...</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Desktop: Horizontal Scrollable Columns */}
            <div className="hidden lg:block h-full">
              <ScrollArea className="h-full w-full">
                <div className="flex gap-4 p-6 min-w-max">
                  {getAllStatuses()
                    .filter((status) => status !== 'delivered' && status !== 'collected')
                    .map((status) => (
                      <PipelineColumn
                        key={status}
                        status={status}
                        orders={ordersByStatus[status] || []}
                        onOrderClick={handleOrderClick}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                </div>
              </ScrollArea>
            </div>

            {/* Mobile: Accordion-style Columns */}
            <div className="lg:hidden h-full overflow-y-auto">
              <div className="space-y-4 p-4">
                {getAllStatuses()
                  .filter((status) => status !== 'delivered' && status !== 'collected')
                  .map((status) => {
                    const statusOrders = ordersByStatus[status] || [];
                    const count = statusOrders.length;

                    return (
                      <Card key={status} className="overflow-hidden">
                        <details className="group">
                          <summary className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 transition-colors list-none">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-black">{status}</h3>
                              <span className="text-sm text-gray-600">{count} orders</span>
                            </div>
                          </summary>
                          <div className="p-4 space-y-3">
                            {statusOrders.length > 0 ? (
                              statusOrders.map((order) => (
                                <div
                                  key={order.orderId}
                                  onClick={() => handleOrderClick(order)}
                                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                                >
                                  <p className="font-mono font-semibold text-sm">
                                    {order.orderId}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {order.customerName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {order.garments.length} garments • KES{' '}
                                    {order.totalAmount.toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-center text-gray-500 py-4">
                                No orders in this stage
                              </p>
                            )}
                          </div>
                        </details>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
}
