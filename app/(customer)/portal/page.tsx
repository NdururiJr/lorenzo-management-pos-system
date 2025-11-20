/**
 * Customer Portal Dashboard Page
 *
 * Modern customer portal with glassmorphic cards and blue theme.
 * Shows active orders, recent activity, and quick actions with animations.
 *
 * @module app/(customer)/portal/page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getOrdersByCustomer } from '@/lib/db/orders';
import { WelcomeHeader } from '@/components/features/customer/WelcomeHeader';
import { ActiveOrders } from '@/components/features/customer/ActiveOrders';
import { QuickActions } from '@/components/features/customer/QuickActions';
import { RecentActivity } from '@/components/features/customer/RecentActivity';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernSection } from '@/components/modern/ModernLayout';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';

export default function CustomerPortalPage() {
  const { user, userData } = useAuth();

  // Fetch all orders for this customer
  const { data: allOrders, isLoading, error } = useQuery<OrderExtended[]>({
    queryKey: ['customer-orders', user?.uid, userData?.role],
    queryFn: async () => {
      if (!user?.uid) return [];
      // If user is staff (not customer), return empty array for development testing
      if (userData?.role && userData.role !== 'customer') {
        console.log('Staff user accessing customer portal (dev mode) - No customer orders to show');
        return [];
      }
      return getOrdersByCustomer(user.uid, 50);
    },
    enabled: !!user?.uid && !!userData,
  });

  // Filter active orders (not delivered or collected)
  const activeOrders = allOrders?.filter(
    (order) => !['delivered', 'collected'].includes(order.status)
  ) || [];

  // Filter recent completed orders
  const recentCompletedOrders = allOrders
    ?.filter((order) => ['delivered', 'collected'].includes(order.status))
    .slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ModernCard className="p-8">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 mx-auto text-brand-blue" />
            </motion.div>
            <p className="text-sm text-gray-600">Loading your orders...</p>
          </div>
        </ModernCard>
      </div>
    );
  }

  if (error) {
    return (
      <ModernCard className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
        <ModernCardContent className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-red-100">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Orders</h3>
            <p className="text-sm text-red-700 mt-1">
              Failed to load your orders. Please try refreshing the page.
            </p>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <ModernSection animate>
      {/* Dev Mode Notice for Staff Users */}
      {userData?.role && userData.role !== 'customer' && process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ModernCard className="bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 border-brand-blue/20 mb-6">
            <ModernCardContent className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-brand-blue/20">
                <Info className="h-5 w-5 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-blue-dark">Development Mode</h3>
                <p className="text-sm text-gray-700 mt-1">
                  You are viewing the customer portal as a <strong>{userData.role}</strong> user.
                  In production, only customers can access this portal. To test with customer data, create a customer account.
                </p>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      )}

      {/* Welcome Header with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <WelcomeHeader
          customerName={userData?.name || 'Customer'}
          lastOrderDate={allOrders?.[0]?.createdAt}
          totalOrders={allOrders?.length || 0}
        />
      </motion.div>

      {/* Active Orders with stagger animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ActiveOrders orders={activeOrders} loading={isLoading} />
      </motion.div>

      {/* Quick Actions with scale animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <QuickActions />
      </motion.div>

      {/* Recent Activity with slide animation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <RecentActivity orders={recentCompletedOrders} />
      </motion.div>
    </ModernSection>
  );
}