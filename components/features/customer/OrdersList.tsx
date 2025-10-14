/**
 * Orders List Component
 *
 * Displays a list of orders with pagination.
 *
 * @module components/features/customer/OrdersList
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Package, ArrowRight } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';

interface OrdersListProps {
  orders: OrderExtended[];
}

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">No Orders Found</h3>
            <p className="text-sm text-gray-600">
              No orders match your search criteria.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.orderId} href={`/orders/${order.orderId}`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              {/* Order ID and Date */}
              <div>
                <div className="font-semibold">{order.orderId}</div>
                <div className="text-xs text-gray-600">
                  {formatDate(order.createdAt.toDate())}
                </div>
              </div>

              {/* Status Badge */}
              <StatusBadge status={order.status} />
            </div>

            {/* Order Details */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {order.garments.length} garment{order.garments.length !== 1 ? 's' : ''}
              </div>
              <div className="font-semibold">
                {formatCurrency(order.totalAmount)}
              </div>
            </div>

            {/* View Details Link */}
            <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
              <span className="text-gray-600">View Details</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
