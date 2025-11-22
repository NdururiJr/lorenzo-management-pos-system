/**
 * Customer Portal Dashboard Page
 *
 * Modern customer portal with glassmorphic cards and blue theme.
 * Features sidebar navigation and displays active orders and recent activity.
 *
 * @module app/(customer)/portal/page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getOrdersByCustomer } from '@/lib/db/orders';
import { ActiveOrders } from '@/components/features/customer/ActiveOrders';
import { RecentActivity } from '@/components/features/customer/RecentActivity';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernSection } from '@/components/modern/ModernLayout';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CustomerPortalPage() {
  const { user, userData } = useAuth();

  // Debug: Log auth status
  console.log('[Customer Portal] Auth State:', {
    email: user?.email,
    isSuperAdmin: userData?.isSuperAdmin,
    role: userData?.role,
    uid: user?.uid
  });

  // Fetch customer record by email or phone
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) {
        console.log('[Customer Portal] No user email found');
        return null;
      }

      console.log('[Customer Portal] Looking for customer with email:', user.email);

      // Try to find customer by email
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('email', '==', user.email), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const customerData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
        console.log('[Customer Portal] Found customer:', customerData.customerId);
        return customerData;
      }

      console.log('[Customer Portal] No customer record found for email:', user.email);
      return null;
    },
    enabled: !!user?.email,
  });

  // Fetch all orders for this customer
  const { data: allOrders, isLoading, error } = useQuery<OrderExtended[]>({
    queryKey: ['customer-orders', customer?.customerId],
    queryFn: async () => {
      if (!customer?.customerId) {
        console.log('[Customer Portal] No customerId, skipping order fetch');
        return [];
      }
      console.log('[Customer Portal] Fetching orders for customer:', customer.customerId);

      // Debug: Check if ANY orders exist in the database
      const allOrdersRef = collection(db, 'orders');
      const allOrdersSnap = await getDocs(allOrdersRef);
      console.log('[Customer Portal] DEBUG - Total orders in database:', allOrdersSnap.size);
      if (allOrdersSnap.size > 0) {
        const firstOrder = allOrdersSnap.docs[0].data();
        console.log('[Customer Portal] DEBUG - First order customerId:', firstOrder.customerId);
        console.log('[Customer Portal] DEBUG - Looking for customerId:', customer.customerId);
      }

      const orders = await getOrdersByCustomer(customer.customerId, 50);
      console.log('[Customer Portal] Fetched orders:', orders.length, 'orders');
      console.log('[Customer Portal] Order statuses:', orders.map(o => o.status));
      return orders;
    },
    enabled: !!customer?.customerId,
  });

  // Filter active orders (not delivered or collected)
  const activeOrders = allOrders?.filter(
    (order) => !['delivered', 'collected'].includes(order.status)
  ) || [];

  // Filter recent completed orders
  const recentCompletedOrders = allOrders
    ?.filter((order) => ['delivered', 'collected'].includes(order.status))
    .slice(0, 3) || [];

  console.log('[Customer Portal] Total orders:', allOrders?.length || 0);
  console.log('[Customer Portal] Active orders:', activeOrders.length);
  console.log('[Customer Portal] Completed orders:', recentCompletedOrders.length);

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

  // Show message if no customer record found
  if (!customerLoading && !customer) {
    return (
      <ModernSection>
        <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <ModernCardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="p-3 rounded-full bg-amber-100 w-16 h-16 mx-auto flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 text-lg">No Customer Profile Found</h3>
                <p className="text-sm text-amber-700 mt-2">
                  We couldn't find a customer profile linked to your account ({user?.email || 'unknown'}).
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  Please run the "Generate Test Data" tool at{' '}
                  <a href="/admin/seed-data" className="underline font-medium">
                    /admin/seed-data
                  </a>{' '}
                  to create sample orders for testing.
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </ModernSection>
    );
  }

  return (
    <ModernSection animate>
      <FloatingOrbs />

      {/* Active Orders with stagger animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ActiveOrders orders={activeOrders} loading={isLoading} />
      </motion.div>

      {/* Recent Activity with slide animation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <RecentActivity orders={recentCompletedOrders} />
      </motion.div>
    </ModernSection>
  );
}