/**
 * Orders List Component
 *
 * Displays a list of orders with modern glassmorphic design.
 *
 * @module components/features/customer/OrdersList
 */

'use client';

import Link from 'next/link';
import { ModernCard } from '@/components/modern/ModernCard';
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
      <ModernCard>
        <div className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-brand-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">No Orders Found</h3>
            <p className="text-sm text-gray-600">
              No orders match your search criteria.
            </p>
          </div>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.orderId} href={`/portal/orders/${order.orderId}`}>
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

              {/* View Details Link */}
              <div className="pt-2 border-t border-gray-200/50 flex items-center justify-between text-sm group">
                <span className="text-brand-blue font-medium group-hover:underline">
                  View Details
                </span>
                <ArrowRight className="w-4 h-4 text-brand-blue transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </ModernCard>
        </Link>
      ))}
    </div>
  );
}
