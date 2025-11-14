/**
 * Deliveries Management Page
 *
 * Allows staff to create and manage delivery batches by selecting ready orders,
 * assigning drivers, and scheduling deliveries with route optimization.
 *
 * @module app/(dashboard)/deliveries/page
 */

'use client';

import { useState } from 'react';
import { Truck, Package, Calendar, TrendingUp, Map } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderSelectionTable } from '@/components/features/deliveries/OrderSelectionTable';
import { DeliveryBatchForm } from '@/components/features/deliveries/DeliveryBatchForm';
import { ActiveBatchesList } from '@/components/features/deliveries/ActiveBatchesList';
import { DeliveryMapView } from '@/components/features/deliveries/DeliveryMapView';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RouteStop, Coordinates } from '@/services/google-maps';

// Default branch location (Kilimani, Nairobi)
const BRANCH_LOCATION: Coordinates = {
  lat: -1.2921,
  lng: 36.7872,
};

export default function DeliveriesPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('create');

  // Fetch ready orders count
  const { data: readyOrdersCount = 0 } = useQuery({
    queryKey: ['ready-orders-count'],
    queryFn: async () => {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('status', '==', 'ready'));
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
  });

  // Fetch pending deliveries count
  const { data: pendingDeliveriesCount = 0 } = useQuery({
    queryKey: ['pending-deliveries-count'],
    queryFn: async () => {
      const deliveriesRef = collection(db, 'deliveries');
      const q = query(deliveriesRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
  });

  // Fetch today's deliveries count
  const { data: todayDeliveriesCount = 0 } = useQuery({
    queryKey: ['today-deliveries-count'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deliveriesRef = collection(db, 'deliveries');
      const q = query(
        deliveriesRef,
        where('scheduledDate', '>=', Timestamp.fromDate(today))
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
  });

  const handleBatchCreated = () => {
    setSelectedOrders([]);
    setShowBatchForm(false);
  };

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
              <h1 className="text-2xl font-bold text-black">Delivery Management</h1>
              <p className="text-gray-600 text-sm">
                Create and manage delivery batches for efficient route planning
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Ready for Delivery</CardDescription>
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {readyOrdersCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">Orders ready to be delivered</p>
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
                <div className="text-2xl font-bold text-black">
                  {pendingDeliveriesCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Delivery batches awaiting assignment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Today's Deliveries</CardDescription>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {todayDeliveriesCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Scheduled for delivery today
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Create Delivery
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Active Batches
            </TabsTrigger>
          </TabsList>

          {/* Create Delivery Tab */}
          <TabsContent value="create" className="space-y-8">
            {/* Order Selection Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Select Orders for Delivery
                  </h2>
                  <p className="text-sm text-gray-600">
                    Choose orders that are ready for delivery and create an optimized batch
                  </p>
                </div>
                {selectedOrders.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-black">{selectedOrders.length}</span>{' '}
                    order{selectedOrders.length !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              <OrderSelectionTable
                selectedOrders={selectedOrders}
                onSelectionChange={setSelectedOrders}
                onCreateBatch={() => setShowBatchForm(true)}
              />
            </div>

            {/* Batch Creation Form */}
            {showBatchForm && selectedOrders.length > 0 && (
              <DeliveryBatchForm
                selectedOrderIds={selectedOrders}
                onCancel={() => setShowBatchForm(false)}
                onSuccess={handleBatchCreated}
                branchLocation={BRANCH_LOCATION}
              />
            )}
          </TabsContent>

          {/* Active Batches Tab */}
          <TabsContent value="active">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-black">Active Delivery Batches</h2>
              <p className="text-sm text-gray-600">
                Monitor ongoing and scheduled delivery batches
              </p>
            </div>

            <ActiveBatchesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
