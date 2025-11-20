/**
 * Drivers Dashboard Page
 *
 * Modern driver dashboard with glassmorphic design and blue theme.
 * Features smooth animations for viewing and managing delivery batches.
 *
 * @module app/(dashboard)/drivers/page
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader2,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernCard, ModernCardHeader, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernButton } from '@/components/modern/ModernButton';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';

interface Delivery {
  deliveryId: string;
  driverId: string;
  orders: string[];
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate?: any;
  startTime?: any;
  endTime?: any;
  notes?: string;
  route?: {
    distance: number;
    estimatedDuration: number;
    stops: any[];
  };
}

export default function DriversPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('today');

  // Fetch driver's deliveries
  const { data: deliveries = [], isLoading } = useQuery<Delivery[]>({
    queryKey: ['driver-deliveries', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      const deliveriesRef = collection(db, 'deliveries');
      const q = query(
        deliveriesRef,
        where('driverId', '==', user.uid),
        orderBy('scheduledDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        deliveryId: doc.id,
        ...doc.data(),
      })) as Delivery[];
    },
    enabled: !!user?.uid,
  });

  // Filter deliveries by tab
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayDeliveries = deliveries.filter((d) => {
    if (!d.scheduledDate) return false;
    const date = d.scheduledDate.toDate();
    return date >= todayStart && date <= todayEnd;
  });

  const pendingDeliveries = deliveries.filter((d) => d.status === 'pending');
  const inProgressDeliveries = deliveries.filter((d) => d.status === 'in_progress');
  const completedDeliveries = deliveries.filter((d) => d.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <ModernBadge variant="warning">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </ModernBadge>
        );
      case 'in_progress':
        return (
          <ModernBadge variant="primary">
            <Navigation className="w-3 h-3 mr-1" />
            In Progress
          </ModernBadge>
        );
      case 'completed':
        return (
          <ModernBadge variant="success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </ModernBadge>
        );
      default:
        return <ModernBadge>{status}</ModernBadge>;
    }
  };

  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => {
    const scheduledDate = delivery.scheduledDate?.toDate();

    return (
      <ModernCard hover glowIntensity="medium">
        <ModernCardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {delivery.deliveryId}
              </h3>
              {scheduledDate && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(scheduledDate, 'MMM d, yyyy - h:mm a')}
                </p>
              )}
            </div>
            {getStatusBadge(delivery.status)}
          </div>
        </ModernCardHeader>

        <ModernCardContent className="space-y-3">
          {/* Orders Count */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-blue/10">
              <Package className="w-4 h-4 text-brand-blue" />
            </div>
            <span className="text-sm text-gray-700">
              {delivery.orders.length} order{delivery.orders.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Route Info */}
          {delivery.route && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-blue/10">
                <MapPin className="w-4 h-4 text-brand-blue" />
              </div>
              <span className="text-sm text-gray-700">
                {delivery.route.stops.length} stop{delivery.route.stops.length !== 1 ? 's' : ''}
                {delivery.route.distance > 0 && (
                  <span className="text-gray-500 ml-1">
                    · {(delivery.route.distance / 1000).toFixed(1)} km
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Start Time */}
          {delivery.startTime && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-blue/10">
                <Clock className="w-4 h-4 text-brand-blue" />
              </div>
              <span className="text-sm text-gray-700">
                Started: {format(delivery.startTime.toDate(), 'h:mm a')}
              </span>
            </div>
          )}

          {/* Notes */}
          {delivery.notes && (
            <div className="text-xs text-gray-700 bg-brand-blue/5 p-3 rounded-lg border border-brand-blue/10">
              <AlertCircle className="w-3 h-3 inline mr-1 text-brand-blue" />
              {delivery.notes}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 border-t border-brand-blue/10">
            <Link href={`/drivers/${delivery.deliveryId}`}>
              <ModernButton
                variant="secondary"
                size="sm"
                className="w-full"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                {delivery.status === 'pending'
                  ? 'Start Delivery'
                  : delivery.status === 'in_progress'
                  ? 'Continue Delivery'
                  : 'View Details'}
              </ModernButton>
            </Link>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ModernCard className="p-8">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 mx-auto text-brand-blue" />
            </motion.div>
            <p className="text-gray-600">Loading deliveries...</p>
          </div>
        </ModernCard>
      </div>
    );
  }

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
            <Truck className="w-8 h-8 text-brand-blue" />
          </motion.div>
          Driver Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Your assigned delivery batches</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ModernStatCard
          title="Today's Deliveries"
          value={todayDeliveries.length}
          icon={<Calendar className="h-5 w-5" />}
          delay={0.1}
        />
        <ModernStatCard
          title="Pending"
          value={pendingDeliveries.length}
          icon={<Clock className="h-5 w-5" />}
          delay={0.2}
        />
        <ModernStatCard
          title="In Progress"
          value={inProgressDeliveries.length}
          icon={<Navigation className="h-5 w-5" />}
          delay={0.3}
        />
        <ModernStatCard
          title="Completed"
          value={completedDeliveries.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend="up"
          delay={0.4}
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-white/70 backdrop-blur-xl border border-brand-blue/20 mb-6">
            <TabsTrigger value="today">Today ({todayDeliveries.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingDeliveries.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressDeliveries.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedDeliveries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <AnimatePresence mode="wait">
              {todayDeliveries.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ModernCard className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-dashed border-2 border-gray-300">
                    <ModernCardContent className="py-12">
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Calendar className="w-16 h-16 mx-auto text-gray-300" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-gray-900">No deliveries scheduled for today</p>
                          <p className="text-sm text-gray-500 mt-1">Check back later or view pending batches</p>
                        </div>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {todayDeliveries.map((delivery, index) => (
                    <motion.div
                      key={delivery.deliveryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DeliveryCard delivery={delivery} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="pending">
            <AnimatePresence mode="wait">
              {pendingDeliveries.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ModernCard className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-dashed border-2 border-gray-300">
                    <ModernCardContent className="py-12">
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle2 className="w-16 h-16 mx-auto text-gray-300" />
                        </motion.div>
                        <p className="font-semibold text-gray-900">No pending deliveries</p>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {pendingDeliveries.map((delivery, index) => (
                    <motion.div
                      key={delivery.deliveryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DeliveryCard delivery={delivery} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="in-progress">
            <AnimatePresence mode="wait">
              {inProgressDeliveries.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ModernCard className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-dashed border-2 border-gray-300">
                    <ModernCardContent className="py-12">
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Navigation className="w-16 h-16 mx-auto text-gray-300" />
                        </motion.div>
                        <p className="font-semibold text-gray-900">No deliveries in progress</p>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {inProgressDeliveries.map((delivery, index) => (
                    <motion.div
                      key={delivery.deliveryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DeliveryCard delivery={delivery} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="completed">
            <AnimatePresence mode="wait">
              {completedDeliveries.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ModernCard className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-dashed border-2 border-gray-300">
                    <ModernCardContent className="py-12">
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Package className="w-16 h-16 mx-auto text-gray-300" />
                        </motion.div>
                        <p className="font-semibold text-gray-900">No completed deliveries</p>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {completedDeliveries.map((delivery, index) => (
                    <motion.div
                      key={delivery.deliveryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DeliveryCard delivery={delivery} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </ModernSection>
  );
}
