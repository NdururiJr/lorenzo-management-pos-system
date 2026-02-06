/**
 * Orders List Page
 *
 * Modern orders list with glassmorphic design, filtering, and search.
 *
 * @module app/(customer)/portal/orders/page
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getOrdersByCustomer } from '@/lib/db/orders';
import { getCustomerByPhoneOrEmail } from '@/lib/db/customers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { OrdersList } from '@/components/features/customer/OrdersList';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';

type TabValue = 'all' | 'active' | 'completed';

export default function OrdersListPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customer profile by phone OR email (Issue 81 Fix)
  // Supports both phone-authenticated and email-authenticated users
  const { data: customer } = useQuery({
    queryKey: ['customer-profile', user?.phoneNumber, user?.email],
    queryFn: async () => {
      if (!user?.email && !user?.phoneNumber) return null;

      // Use the new combined lookup function
      return getCustomerByPhoneOrEmail(user?.phoneNumber, user?.email);
    },
    enabled: !!(user?.email || user?.phoneNumber),
  });

  // Fetch all orders using customerId
  const { data: allOrders, isLoading, error } = useQuery<OrderExtended[]>({
    queryKey: ['customer-orders', customer?.customerId],
    queryFn: async () => {
      if (!customer?.customerId) return [];
      return getOrdersByCustomer(customer.customerId, 100);
    },
    enabled: !!customer?.customerId,
  });

  // Filter orders based on tab
  const getFilteredOrders = () => {
    if (!allOrders) return [];

    let filtered = allOrders;

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(
        (order) => !['delivered', 'collected'].includes(order.status)
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((order) =>
        ['delivered', 'collected'].includes(order.status)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  if (isLoading) {
    return (
      <ModernSection animate>
        <FloatingOrbs />
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
      </ModernSection>
    );
  }

  if (error) {
    return (
      <ModernSection animate>
        <FloatingOrbs />
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
      </ModernSection>
    );
  }

  return (
    <ModernSection animate>
      <FloatingOrbs />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">
          View and track all your orders
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <ModernCard className="!p-0 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-blue/60" />
            <Input
              type="text"
              placeholder="Search by order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
          </div>
        </ModernCard>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <ModernCard className="!p-2 mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                All ({allOrders?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                Active (
                {allOrders?.filter(
                  (o) => !['delivered', 'collected'].includes(o.status)
                ).length || 0}
                )
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                Completed (
                {allOrders?.filter((o) =>
                  ['delivered', 'collected'].includes(o.status)
                ).length || 0}
                )
              </TabsTrigger>
            </TabsList>
          </ModernCard>

          <TabsContent value={activeTab} className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <OrdersList orders={filteredOrders} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </ModernSection>
  );
}
