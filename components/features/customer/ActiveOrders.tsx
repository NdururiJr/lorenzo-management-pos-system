/**
 * Active Orders Component
 *
 * Displays customer's active orders (not yet delivered/collected).
 * Shows branch handling the order, ETA, and payment status.
 *
 * @module components/features/customer/ActiveOrders
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ArrowRight, Package, MapPin, Clock } from 'lucide-react';
import { getBranchName } from '@/lib/utils/branch-lookup';
import type { OrderExtended } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';

interface ActiveOrdersProps {
  orders: OrderExtended[];
  loading?: boolean;
}

function OrderCard({ order }: { order: OrderExtended }) {
  const [branchName, setBranchName] = useState<string>('Loading...');

  useEffect(() => {
    async function fetchBranchName() {
      if (order.branchId) {
        const name = await getBranchName(order.branchId);
        setBranchName(name);
      }
    }
    fetchBranchName();
  }, [order.branchId]);

  const isPastDue =
    order.estimatedCompletion &&
    order.estimatedCompletion.toDate() < new Date() &&
    order.status !== 'ready' &&
    order.status !== 'delivered' &&
    order.status !== 'collected';

  return (
    <Link href={`/portal/orders/${order.orderId}`}>
      <ModernCard className="!p-4 hover:shadow-glow-blue transition-all cursor-pointer hover:scale-[1.01]">
        <div className="space-y-3">
          {/* Order Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-sm">{order.orderId}</div>
              <div className="text-xs text-gray-600">
                {formatDate(order.createdAt.toDate())}
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Branch Info */}
          {order.branchId && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>Handled by: {branchName}</span>
            </div>
          )}

          {/* Order Details */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {order.garments.length} garment
              {order.garments.length !== 1 ? 's' : ''}
            </div>
            <div className="font-semibold">
              {formatCurrency(order.totalAmount)}
            </div>
          </div>

          {/* Payment Status - show if not paid */}
          {order.paymentStatus !== 'paid' && (
            <div className="text-xs">
              <span
                className={`px-2 py-1 rounded ${
                  order.paymentStatus === 'pending'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {order.paymentStatus === 'pending' ? 'Payment Pending' : 'Partially Paid'}
              </span>
            </div>
          )}

          {/* ETA Display */}
          {order.estimatedCompletion &&
            order.status !== 'ready' &&
            order.status !== 'delivered' &&
            order.status !== 'collected' && (
              <div
                className={`flex items-center gap-1.5 text-xs ${
                  isPastDue ? 'text-amber-600' : 'text-gray-600'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {isPastDue ? 'Overdue: ' : 'Ready '}
                  {formatDistanceToNow(order.estimatedCompletion.toDate(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}

          {/* Ready Status */}
          {order.status === 'ready' && (
            <div className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded">
              Ready for pickup!
            </div>
          )}

          {/* Out for Delivery Status */}
          {order.status === 'out_for_delivery' && (
            <div className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded">
              Driver on the way!
            </div>
          )}

          {/* Track Order Button */}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <span>
              Track Order
              <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Button>
        </div>
      </ModernCard>
    </Link>
  );
}

export function ActiveOrders({ orders, loading }: ActiveOrdersProps) {
  if (loading) {
    return (
      <ModernCard>
        <ModernCardContent className="!p-6">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200/50 rounded-xl"></div>
            <div className="h-24 bg-gray-200/50 rounded-xl"></div>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  if (orders.length === 0) {
    return (
      <ModernCard>
        <ModernCardContent className="!p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">No Active Orders</h3>
              <p className="text-sm text-gray-600">
                You don&apos;t have any orders in progress right now.
              </p>
            </div>
            <Link href="/portal/orders">
              <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
                View Order History
              </Button>
            </Link>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Active Orders ({orders.length})
        </h2>
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.orderId} order={order} />
        ))}
      </div>
    </div>
  );
}
