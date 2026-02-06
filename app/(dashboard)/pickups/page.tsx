/**
 * Pickups Page
 *
 * Modern pickups management interface with glassmorphic design and blue theme.
 * Features smooth animations for tracking and managing garment pickups.
 *
 * @module app/(dashboard)/pickups/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernCard, ModernCardHeader, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { PickupTable } from '@/components/features/pickups/PickupTable';
import { getDocuments } from '@/lib/db';
import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { Order } from '@/lib/db/schema';
import { toast } from 'sonner';

export default function PickupsPage() {
  const { userData: _userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Separate state for each tab
  const [pendingPickups, setPendingPickups] = useState<Order[]>([]);
  const [scheduledPickups, setScheduledPickups] = useState<Order[]>([]);
  const [completedPickups, setCompletedPickups] = useState<Order[]>([]);

  // Load pickups on mount and tab change
  useEffect(() => {
    loadPickups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadPickups = async () => {
    try {
      setLoading(true);

      // Base query: orders where collectionMethod === 'pickup_required'
      const baseConstraints: QueryConstraint[] = [
        where('collectionMethod', '==', 'pickup_required'),
      ];

      // Add tab-specific filters
      let constraints: QueryConstraint[] = [...baseConstraints];

      if (activeTab === 'pending') {
        // Pending: no pickup completion time
        constraints.push(where('pickupCompletedTime', '==', null));
        constraints.push(orderBy('createdAt', 'desc'));
      } else if (activeTab === 'scheduled') {
        // Scheduled: has scheduled time but not completed
        constraints.push(where('pickupCompletedTime', '==', null));
        // Note: Firestore doesn't support filtering on undefined/null for existence
        // We'll filter client-side for pickupScheduledTime
        constraints.push(orderBy('createdAt', 'desc'));
      } else if (activeTab === 'completed') {
        // Completed: has pickup completion time
        // Note: Need to use a different query structure
        constraints = [
          where('collectionMethod', '==', 'pickup_required'),
          orderBy('pickupCompletedTime', 'desc'),
        ];
      }

      const orders = await getDocuments<Order>('orders', ...constraints);

      // Filter results based on tab
      if (activeTab === 'pending') {
        // Pending: no completed time AND no scheduled time
        const filtered = orders.filter(
          (order) => !order.pickupCompletedTime && !order.pickupScheduledTime
        );
        setPendingPickups(filtered);
      } else if (activeTab === 'scheduled') {
        // Scheduled: has scheduled time but not completed
        const filtered = orders.filter(
          (order) => !order.pickupCompletedTime && order.pickupScheduledTime
        );
        setScheduledPickups(filtered);
      } else if (activeTab === 'completed') {
        // Completed: has completion time
        const filtered = orders.filter((order) => order.pickupCompletedTime);
        setCompletedPickups(filtered);
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
      toast.error('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const handlePickupCompleted = () => {
    // Reload pickups after marking as completed
    loadPickups();
    toast.success('Pickup marked as completed');
  };

  const handleRefresh = () => {
    loadPickups();
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'pending':
        return pendingPickups;
      case 'scheduled':
        return scheduledPickups;
      case 'completed':
        return completedPickups;
      default:
        return [];
    }
  };

  const _currentData = getCurrentTabData();

  // Calculate today's counts
  const scheduledToday = scheduledPickups.filter((p) => {
    if (!p.pickupScheduledTime) return false;
    const scheduledDate = p.pickupScheduledTime.toDate();
    const today = new Date();
    return scheduledDate.toDateString() === today.toDateString();
  }).length;

  const completedToday = completedPickups.filter((p) => {
    if (!p.pickupCompletedTime) return false;
    const completedDate = p.pickupCompletedTime.toDate();
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  return (
    <ModernSection animate>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Package className="w-8 h-8 text-brand-blue" />
          </motion.div>
          Pickups
        </h1>
        <p className="text-gray-600 mt-1">
          Manage garment pickups from customer locations
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ModernStatCard
          title="Pending Pickup"
          value={loading ? "--" : pendingPickups.length}
          icon={<Package className="h-5 w-5" />}
          changeLabel="Awaiting pickup"
          delay={0.1}
        />
        <ModernStatCard
          title="Scheduled Today"
          value={loading ? "--" : scheduledToday}
          icon={<Clock className="h-5 w-5" />}
          changeLabel="Scheduled for today"
          delay={0.2}
        />
        <ModernStatCard
          title="Completed Today"
          value={loading ? "--" : completedToday}
          icon={<CheckCircle className="h-5 w-5" />}
          changeLabel="Completed today"
          trend="up"
          delay={0.3}
        />
      </div>

      {/* Pickups Table with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <ModernCard hover={false}>
          <ModernCardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-blue/10">
                <Package className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pickup Orders</h2>
                <p className="text-sm text-gray-600">View and manage orders requiring garment pickup</p>
              </div>
            </div>
          </ModernCardHeader>
          <ModernCardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-xl border border-brand-blue/20">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Pending
                  {pendingPickups.length > 0 && (
                    <ModernBadge variant="secondary" className="ml-1">
                      {pendingPickups.length}
                    </ModernBadge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Scheduled
                  {scheduledPickups.length > 0 && (
                    <ModernBadge variant="secondary" className="ml-1">
                      {scheduledPickups.length}
                    </ModernBadge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-12"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-brand-blue" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <PickupTable
                        pickups={pendingPickups}
                        onPickupCompleted={handlePickupCompleted}
                        onRefresh={handleRefresh}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="scheduled" className="mt-6">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-12"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-brand-blue" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <PickupTable
                        pickups={scheduledPickups}
                        onPickupCompleted={handlePickupCompleted}
                        onRefresh={handleRefresh}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-12"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-8 h-8 text-brand-blue" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <PickupTable
                        pickups={completedPickups}
                        onPickupCompleted={handlePickupCompleted}
                        onRefresh={handleRefresh}
                        showCompleted
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </ModernCardContent>
        </ModernCard>
      </motion.div>
    </ModernSection>
  );
}
