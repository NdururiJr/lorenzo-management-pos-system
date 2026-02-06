/**
 * Deliveries Management Page
 *
 * Modern delivery management with glassmorphic design and animations.
 * Features route optimization and batch management.
 *
 * @module app/(dashboard)/deliveries/page
 */

'use client';

import { useState } from 'react';
import { Truck, Package, Calendar, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderSelectionTable } from '@/components/features/deliveries/OrderSelectionTable';
import { DeliveryBatchForm } from '@/components/features/deliveries/DeliveryBatchForm';
import { ActiveBatchesList } from '@/components/features/deliveries/ActiveBatchesList';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Coordinates } from '@/services/google-maps';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { useAuth } from '@/hooks/useAuth';
import { getAllowedBranchesArray } from '@/lib/auth/branch-access';
import {
  getPendingDeliveriesCountForBranches,
  getTodayDeliveriesCountForBranches,
} from '@/lib/db/deliveries';

// Default branch location (Kilimani, Nairobi)
const BRANCH_LOCATION: Coordinates = {
  lat: -1.2921,
  lng: 36.7872,
};

export default function DeliveriesPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('create');

  const { userData } = useAuth();
  const allowedBranches = userData ? getAllowedBranchesArray(userData) : [];

  // Fetch ready orders count (branch-filtered)
  const { data: readyOrdersCount = 0 } = useQuery({
    queryKey: ['ready-orders-count', allowedBranches],
    queryFn: async () => {
      const ordersRef = collection(db, 'orders');

      // Super admin - all branches
      if (allowedBranches === null) {
        const q = query(ordersRef, where('status', '==', 'ready'));
        const snapshot = await getDocs(q);
        return snapshot.size;
      }

      // No branches
      if (allowedBranches.length === 0) {
        return 0;
      }

      // Single branch
      if (allowedBranches.length === 1) {
        const q = query(
          ordersRef,
          where('branchId', '==', allowedBranches[0]),
          where('status', '==', 'ready')
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
      }

      // Multiple branches <= 10
      if (allowedBranches.length <= 10) {
        const q = query(
          ordersRef,
          where('branchId', 'in', allowedBranches),
          where('status', '==', 'ready')
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
      }

      // More than 10 branches - query each branch
      let total = 0;
      for (const branchId of allowedBranches) {
        const q = query(
          ordersRef,
          where('branchId', '==', branchId),
          where('status', '==', 'ready')
        );
        const snapshot = await getDocs(q);
        total += snapshot.size;
      }
      return total;
    },
    enabled: !!userData,
  });

  // Fetch pending deliveries count (branch-filtered)
  const { data: pendingDeliveriesCount = 0 } = useQuery({
    queryKey: ['pending-deliveries-count', allowedBranches],
    queryFn: () => getPendingDeliveriesCountForBranches(allowedBranches),
    enabled: !!userData,
  });

  // Fetch today's deliveries count (branch-filtered)
  const { data: todayDeliveriesCount = 0 } = useQuery({
    queryKey: ['today-deliveries-count', allowedBranches],
    queryFn: () => getTodayDeliveriesCountForBranches(allowedBranches),
    enabled: !!userData,
  });

  const handleBatchCreated = () => {
    setSelectedOrders([]);
    setShowBatchForm(false);
  };

  return (
    <ModernSection animate className="min-h-screen">
      {/* Page Header */}
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
            className="p-3 rounded-2xl bg-linear-to-br from-brand-blue/20 to-brand-blue/10"
          >
            <Truck className="h-6 w-6 text-brand-blue" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
              Delivery Management
            </h1>
            <p className="text-sm text-gray-600">
              Create and manage delivery batches for efficient route planning
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ModernStatCard
            title="Ready for Delivery"
            value={readyOrdersCount}
            icon={<Package className="h-5 w-5" />}
            changeLabel="Orders ready"
            delay={0.1}
            variant="gradient"
          />

          <ModernStatCard
            title="Pending Batches"
            value={pendingDeliveriesCount}
            icon={<Truck className="h-5 w-5" />}
            changeLabel="Awaiting assignment"
            delay={0.2}
          />

          <ModernStatCard
            title="Today's Deliveries"
            value={todayDeliveriesCount}
            icon={<Calendar className="h-5 w-5" />}
            changeLabel="Scheduled today"
            delay={0.3}
            variant="solid"
          />

          <ModernStatCard
            title="Active Routes"
            value={pendingDeliveriesCount > 0 ? pendingDeliveriesCount : 0}
            icon={<Route className="h-5 w-5" />}
            changeLabel="In progress"
            delay={0.4}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <ModernCard delay={0.5} hover glowIntensity="low">
        <ModernCardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 backdrop-blur-sm">
              <TabsTrigger
                value="create"
                className="flex items-center gap-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white"
              >
                <Package className="w-4 h-4" />
                Create Delivery
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="flex items-center gap-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white"
              >
                <Truck className="w-4 h-4" />
                Active Batches
              </TabsTrigger>
            </TabsList>

            {/* Create Delivery Tab */}
            <TabsContent value="create" className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="create-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Order Selection Section */}
                  <ModernCard>
                    <ModernCardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Select Orders for Delivery
                          </h2>
                          <p className="text-sm text-gray-600">
                            Choose orders that are ready for delivery and create an optimized batch
                          </p>
                        </div>
                        {selectedOrders.length > 0 && (
                          <ModernBadge variant="primary" size="lg" gradient>
                            {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                          </ModernBadge>
                        )}
                      </div>

                      <OrderSelectionTable
                        selectedOrders={selectedOrders}
                        onSelectionChange={setSelectedOrders}
                        onCreateBatch={() => setShowBatchForm(true)}
                      />
                    </ModernCardContent>
                  </ModernCard>

                  {/* Batch Creation Form */}
                  {showBatchForm && selectedOrders.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <ModernCard hover glowIntensity="medium">
                        <ModernCardContent className="p-6">
                          <DeliveryBatchForm
                            selectedOrderIds={selectedOrders}
                            onCancel={() => setShowBatchForm(false)}
                            onSuccess={handleBatchCreated}
                            branchLocation={BRANCH_LOCATION}
                          />
                        </ModernCardContent>
                      </ModernCard>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Active Batches Tab */}
            <TabsContent value="active">
              <AnimatePresence mode="wait">
                <motion.div
                  key="active-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ModernCard>
                    <ModernCardContent className="p-6">
                      <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Active Delivery Batches</h2>
                        <p className="text-sm text-gray-600">
                          Monitor ongoing and scheduled delivery batches
                        </p>
                      </div>

                      <ActiveBatchesList />
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </ModernCardContent>
      </ModernCard>
    </ModernSection>
  );
}
