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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getOrdersByCustomer } from '@/lib/db/orders';
import { getCustomerByPhoneOrEmail } from '@/lib/db/customers';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernSection } from '@/components/modern/ModernLayout';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';
import Link from 'next/link';

export default function CustomerPortalPage() {
  const { user, userData } = useAuth();

  // Debug: Log auth status
  console.log('[Customer Portal] Auth State:', {
    email: user?.email,
    isSuperAdmin: userData?.isSuperAdmin,
    role: userData?.role,
    uid: user?.uid
  });

  // Fetch customer record by phone OR email (Issue 81 Fix)
  // Supports both phone-authenticated and email-authenticated users
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-profile', user?.phoneNumber, user?.email],
    queryFn: async () => {
      if (!user?.email && !user?.phoneNumber) {
        console.log('[Customer Portal] No user email or phone found');
        return null;
      }

      console.log('[Customer Portal] Looking for customer with:', {
        phone: user?.phoneNumber,
        email: user?.email
      });

      // Use the new combined lookup function that supports both phone and email
      const customerData = await getCustomerByPhoneOrEmail(
        user?.phoneNumber,
        user?.email
      );

      if (customerData) {
        console.log('[Customer Portal] Found customer:', customerData.customerId);
        return customerData;
      }

      console.log('[Customer Portal] No customer record found for phone/email');
      return null;
    },
    enabled: !!(user?.email || user?.phoneNumber),
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
      <ModernCard className="bg-linear-to-br from-red-50 to-red-100/50 border-red-200">
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
        <ModernCard className="bg-linear-to-br from-amber-50 to-orange-50 border-amber-200">
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

  const totalOrders = allOrders?.length || 0;
  const pendingPayments = allOrders?.filter(o => o.paymentStatus !== 'paid').length || 0;

  return (
    <ModernSection animate>
      <FloatingOrbs />

      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {customer?.name || 'Customer'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your orders
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {/* Total Orders */}
        <ModernCard className="hover:shadow-glow-blue transition-all cursor-pointer">
          <ModernCardContent className="p-6!">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-brand-blue/10">
                <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Active Orders */}
        <ModernCard className="hover:shadow-glow-blue transition-all cursor-pointer">
          <ModernCardContent className="p-6!">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeOrders.length}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Pending Payments */}
        <ModernCard className="hover:shadow-glow-blue transition-all cursor-pointer">
          <ModernCardContent className="p-6!">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingPayments}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </motion.div>

      {/* Recent Orders Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/portal/orders"
            className="text-brand-blue hover:text-brand-blue-dark font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <ModernCard>
            <ModernCardContent className="p-8! text-center">
              <svg className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600">No active orders</p>
              <p className="text-sm text-gray-500 mt-1">Your current orders will appear here</p>
            </ModernCardContent>
          </ModernCard>
        ) : (
          <div className="grid gap-4">
            {activeOrders.slice(0, 3).map((order, index) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                <ModernCard className="hover:shadow-glow-blue transition-all cursor-pointer">
                  <ModernCardContent className="p-4!">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{order.orderId}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'queued_for_delivery' ? 'bg-green-100 text-green-700' :
                            order.status === 'out_for_delivery' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.garments.length} garment{order.garments.length !== 1 ? 's' : ''} • Ksh {order.totalAmount}
                        </p>
                      </div>
                      <Link
                        href={`/portal/orders/${order.orderId}`}
                        className="text-brand-blue hover:text-brand-blue-dark font-medium text-sm"
                      >
                        Track →
                      </Link>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Link href="/portal/request-pickup">
          <ModernCard className="hover:shadow-glow-blue transition-all cursor-pointer h-full">
            <ModernCardContent className="p-6!">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-brand-blue text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Request Pickup</h3>
                  <p className="text-sm text-gray-600">Schedule a pickup for your laundry</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </Link>

        <Link href="/portal/contact">
          <ModernCard className="hover:shadow-glow-blue transition-all cursor-pointer h-full">
            <ModernCardContent className="p-6!">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Contact Support</h3>
                  <p className="text-sm text-gray-600">Get help with your orders</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </Link>
      </motion.div>
    </ModernSection>
  );
}