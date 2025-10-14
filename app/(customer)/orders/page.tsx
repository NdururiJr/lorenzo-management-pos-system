/**
 * Orders List Page
 *
 * List of all orders (active and completed) with filtering.
 *
 * @module app/(customer)/orders/page
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getOrdersByCustomer } from '@/lib/db/orders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { OrdersList } from '@/components/features/customer/OrdersList';
import { Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';

type TabValue = 'all' | 'active' | 'completed';

export default function OrdersListPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all orders
  const { data: allOrders, isLoading, error } = useQuery<OrderExtended[]>({
    queryKey: ['customer-orders', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      return getOrdersByCustomer(user.uid, 100);
    },
    enabled: !!user?.uid,
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
          <p className="text-sm text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-gray-600">
          View and track all your orders
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All ({allOrders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active (
            {allOrders?.filter(
              (o) => !['delivered', 'collected'].includes(o.status)
            ).length || 0}
            )
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed (
            {allOrders?.filter((o) =>
              ['delivered', 'collected'].includes(o.status)
            ).length || 0}
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <OrdersList orders={filteredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
