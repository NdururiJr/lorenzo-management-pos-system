/**
 * Active Orders Component
 *
 * Displays customer's active orders (not yet delivered/collected).
 *
 * @module components/features/customer/ActiveOrders
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ArrowRight, Package } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';

interface ActiveOrdersProps {
  orders: OrderExtended[];
  loading?: boolean;
}

export function ActiveOrders({ orders, loading }: ActiveOrdersProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">No Active Orders</h3>
            <p className="text-sm text-gray-600">
              You don&apos;t have any orders in progress right now.
            </p>
          </div>
          <Link href="/orders">
            <Button variant="outline">View Order History</Button>
          </Link>
        </div>
      </Card>
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
          <Link key={order.orderId} href={`/portal/orders/${order.orderId}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
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

                {/* Estimated Completion */}
                {order.estimatedCompletion && order.status !== 'ready' && (
                  <div className="text-xs text-gray-600">
                    Due: {formatDate(order.estimatedCompletion.toDate())}
                  </div>
                )}

                {/* Ready Status */}
                {order.status === 'ready' && (
                  <div className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded">
                    Ready for pickup!
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
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
