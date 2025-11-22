/**
 * Recent Activity Component
 *
 * Displays recent completed orders.
 *
 * @module components/features/customer/RecentActivity
 */

'use client';

import Link from 'next/link';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';

interface RecentActivityProps {
  orders: OrderExtended[];
}

export function RecentActivity({ orders }: RecentActivityProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Link href="/portal/orders">
          <Button variant="ghost" size="sm">
            View All History
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <ModernCard>
        <ModernCardContent className="!p-4">
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.orderId} href={`/portal/orders/${order.orderId}`}>
                <div className="flex items-center justify-between py-2 hover:bg-brand-blue/5 rounded-lg px-2 -mx-2 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{order.orderId}</div>
                      <div className="text-xs text-gray-600">
                        {order.status === 'delivered' ? 'Delivered' : 'Collected'}{' '}
                        on{' '}
                        {formatDate(
                          order.actualCompletion?.toDate() ||
                            order.updatedAt.toDate()
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
}
