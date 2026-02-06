/**
 * Operational Health Component
 *
 * Displays real-time operational status:
 * - Pipeline status summary across branches
 * - Capacity utilization gauge
 * - Delayed orders count with alerts
 * - Quick action buttons
 *
 * @module components/features/director/OperationalHealth
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Loader2,
  Package,
  Truck,
  Users,
  ArrowRight,
} from 'lucide-react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/modern/ModernCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import type { Order } from '@/lib/db/schema';

interface OperationalHealthProps {
  branchId: string;
}

interface HealthMetrics {
  pipelineStatus: {
    received: number;
    processing: number;
    queuedForDelivery: number; // FR-008: Previously 'ready'
    outForDelivery: number;
  };
  delayedOrders: number;
  capacityUtilization: number;
  activeStaff: number;
  activeDrivers: number;
}

export function OperationalHealth({ branchId }: OperationalHealthProps) {
  const { data: metrics, isLoading } = useQuery<HealthMetrics>({
    queryKey: ['operational-health', branchId],
    queryFn: async () => {
      const ordersRef = collection(db, 'orders');

      // Get orders from last 7 days that aren't delivered/collected
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const constraints: any[] = [
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
      ];

      if (branchId !== 'all') {
        constraints.push(where('branchId', '==', branchId));
      }

      const ordersQuery = query(ordersRef, ...constraints);
      const snapshot = await getDocs(ordersQuery);
      const orders = snapshot.docs.map((doc) => doc.data() as Order);

      // Calculate pipeline status
      const activeOrders = orders.filter(
        (o) => o.status !== 'delivered' && o.status !== 'collected'
      );

      // FR-008: Updated 'ready' to 'queued_for_delivery'
      const pipelineStatus = {
        received: activeOrders.filter((o) => o.status === 'received' || o.status === 'queued').length,
        processing: activeOrders.filter((o) =>
          ['washing', 'drying', 'ironing', 'quality_check', 'packaging'].includes(o.status)
        ).length,
        queuedForDelivery: activeOrders.filter((o) => o.status === 'queued_for_delivery').length,
        outForDelivery: activeOrders.filter((o) => o.status === 'out_for_delivery').length,
      };

      // Calculate delayed orders (past estimated completion)
      const now = Timestamp.now();
      const delayedOrders = activeOrders.filter((o) => {
        if (!o.estimatedCompletion) return false;
        return o.estimatedCompletion.seconds < now.seconds;
      }).length;

      // Capacity utilization (simulated - would be based on actual capacity data)
      // Assuming 100 orders/day capacity
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(
        (o) => o.createdAt && o.createdAt.seconds >= Timestamp.fromDate(todayStart).seconds
      ).length;
      const capacityUtilization = Math.min((todayOrders / 100) * 100, 100);

      // Query active staff from users collection
      const usersRef = collection(db, 'users');
      const staffRoles = ['workstation_staff', 'front_desk', 'workstation_manager', 'satellite_staff'];

      let activeStaff = 0;
      let activeDrivers = 0;

      try {
        // Query active staff - handle branch filtering
        if (branchId !== 'all') {
          // For specific branch, query with branchId filter
          const staffQuery = query(
            usersRef,
            where('role', 'in', staffRoles),
            where('active', '==', true),
            where('branchId', '==', branchId)
          );
          const staffSnapshot = await getDocs(staffQuery);
          activeStaff = staffSnapshot.size;

          // Query active drivers for specific branch
          const driverQuery = query(
            usersRef,
            where('role', '==', 'driver'),
            where('active', '==', true),
            where('branchId', '==', branchId)
          );
          const driverSnapshot = await getDocs(driverQuery);
          activeDrivers = driverSnapshot.size;
        } else {
          // For 'all' branches, query without branchId filter
          const staffQuery = query(
            usersRef,
            where('role', 'in', staffRoles),
            where('active', '==', true)
          );
          const staffSnapshot = await getDocs(staffQuery);
          activeStaff = staffSnapshot.size;

          // Query active drivers across all branches
          const driverQuery = query(
            usersRef,
            where('role', '==', 'driver'),
            where('active', '==', true)
          );
          const driverSnapshot = await getDocs(driverQuery);
          activeDrivers = driverSnapshot.size;
        }
      } catch (error) {
        console.error('Error fetching staff/driver counts:', error);
        // Keep default values of 0 on error
      }

      return {
        pipelineStatus,
        delayedOrders,
        capacityUtilization,
        activeStaff,
        activeDrivers,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const totalInPipeline = metrics
    ? metrics.pipelineStatus.received +
      metrics.pipelineStatus.processing +
      metrics.pipelineStatus.queuedForDelivery +
      metrics.pipelineStatus.outForDelivery
    : 0;

  const getUtilizationColor = (value: number) => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-lorenzo-accent-teal/20 rounded-lg">
          <Activity className="h-5 w-5 text-lorenzo-accent-teal" />
        </div>
        <h3 className="text-lg font-semibold text-white">Operational Health</h3>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-lorenzo-accent-teal" />
          </div>
        ) : metrics ? (
          <>
            {/* Delayed Orders Alert */}
            {metrics.delayedOrders > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
              >
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-300">
                    {metrics.delayedOrders} Delayed Orders
                  </p>
                  <p className="text-xs text-red-400/80">Past estimated completion</p>
                </div>
                <Link href="/pipeline?filter=delayed">
                  <Button size="sm" variant="ghost" className="text-red-300 hover:bg-red-500/20 hover:text-red-200">
                    View
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Pipeline Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Pipeline Status</span>
                <span className="text-sm text-white/60">{totalInPipeline} active</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-blue-500/15 border border-blue-500/20 rounded-xl">
                  <p className="text-2xl font-bold text-blue-400">{metrics.pipelineStatus.received}</p>
                  <p className="text-xs text-blue-300/80 mt-1">Received</p>
                </div>
                <div className="text-center p-4 bg-amber-500/15 border border-amber-500/20 rounded-xl">
                  <p className="text-2xl font-bold text-amber-400">{metrics.pipelineStatus.processing}</p>
                  <p className="text-xs text-amber-300/80 mt-1">Processing</p>
                </div>
                <div className="text-center p-4 bg-emerald-500/15 border border-emerald-500/20 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-400">{metrics.pipelineStatus.queuedForDelivery}</p>
                  <p className="text-xs text-emerald-300/80 mt-1">Ready</p>
                </div>
                <div className="text-center p-4 bg-violet-500/15 border border-violet-500/20 rounded-xl">
                  <p className="text-2xl font-bold text-violet-400">{metrics.pipelineStatus.outForDelivery}</p>
                  <p className="text-xs text-violet-300/80 mt-1">Delivery</p>
                </div>
              </div>
            </div>

            {/* Capacity Utilization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Capacity Utilization</span>
                <span className="text-sm font-bold text-white">
                  {metrics.capacityUtilization.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metrics.capacityUtilization >= 90
                      ? 'bg-red-500'
                      : metrics.capacityUtilization >= 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${metrics.capacityUtilization}%` }}
                />
              </div>
              <p className="text-xs text-white/50">
                {metrics.capacityUtilization >= 90
                  ? 'Near capacity - consider load balancing'
                  : metrics.capacityUtilization >= 70
                  ? 'Good utilization'
                  : 'Capacity available'}
              </p>
            </div>

            {/* Staff & Drivers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="p-2.5 bg-lorenzo-accent-teal/20 rounded-lg">
                  <Users className="h-5 w-5 text-lorenzo-accent-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{metrics.activeStaff}</p>
                  <p className="text-xs text-white/50">Active Staff</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="p-2.5 bg-lorenzo-gold/20 rounded-lg">
                  <Truck className="h-5 w-5 text-lorenzo-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{metrics.activeDrivers}</p>
                  <p className="text-xs text-white/50">Active Drivers</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-medium text-white/50 mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/pipeline">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white text-xs"
                  >
                    <Package className="h-3.5 w-3.5 mr-1.5" />
                    Pipeline
                  </Button>
                </Link>
                <Link href="/deliveries">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white text-xs"
                  >
                    <Truck className="h-3.5 w-3.5 mr-1.5" />
                    Deliveries
                  </Button>
                </Link>
                <Link href="/employees">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white text-xs"
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Staff
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-white/50">
            Unable to load operational data
          </div>
        )}
      </div>
    </motion.div>
  );
}
