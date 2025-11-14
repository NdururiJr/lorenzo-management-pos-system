/**
 * Customer Portal Dashboard Page
 *
 * Landing page for customers after login.
 * Shows active orders, recent activity, and quick actions.
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
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
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
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
          <p className="text-sm text-gray-600">Loading your orders...</p>
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
    <div className="space-y-8">
      {/* Dev Mode Notice for Staff Users */}
      {userData?.role && userData.role !== 'customer' && process.env.NODE_ENV === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Mode:</strong> You are viewing the customer portal as a <strong>{userData.role}</strong> user.
            In production, only customers can access this portal. To test with customer data, create a customer account.
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Header */}
      <WelcomeHeader
        customerName={userData?.name || 'Customer'}
        lastOrderDate={allOrders?.[0]?.createdAt}
        totalOrders={allOrders?.length || 0}
      />

      {/* Active Orders */}
      <ActiveOrders orders={activeOrders} loading={isLoading} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity orders={recentCompletedOrders} />
    </div>
  );
}
