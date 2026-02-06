'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Progress } from '@/components/ui/progress';
import { getOrdersByBranch, getPipelineStats } from '@/lib/db/orders';
import type { Order, OrderStatus } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';

interface OrdersBreakdownContentProps {
  branchId: string;
}

interface OrdersBreakdown {
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  recentOrders: Order[];
  total: number;
}

const STATUS_LABELS: Record<string, string> = {
  received: 'Received',
  inspection: 'Inspection',
  queued: 'Queued',
  washing: 'Washing',
  drying: 'Drying',
  ironing: 'Ironing',
  quality_check: 'Quality Check',
  packaging: 'Packaging',
  queued_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  collected: 'Collected',
};

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-gray-100 text-gray-800',
  inspection: 'bg-yellow-100 text-yellow-800',
  queued: 'bg-blue-100 text-blue-800',
  washing: 'bg-cyan-100 text-cyan-800',
  drying: 'bg-orange-100 text-orange-800',
  ironing: 'bg-purple-100 text-purple-800',
  quality_check: 'bg-pink-100 text-pink-800',
  packaging: 'bg-indigo-100 text-indigo-800',
  queued_for_delivery: 'bg-green-100 text-green-800',
  out_for_delivery: 'bg-amber-100 text-amber-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  collected: 'bg-teal-100 text-teal-800',
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-red-100 text-red-800',
};

export function OrdersBreakdownContent({ branchId }: OrdersBreakdownContentProps) {
  const [data, setData] = useState<OrdersBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Get pipeline stats (orders by status)
        const pipelineStats = await getPipelineStats(branchId);

        // Get recent orders
        const orders = await getOrdersByBranch(branchId, 10);

        // Calculate payment status breakdown
        const byPaymentStatus: Record<string, number> = {
          paid: 0,
          partial: 0,
          pending: 0,
        };

        orders.forEach((order) => {
          if (order.paymentStatus) {
            byPaymentStatus[order.paymentStatus] =
              (byPaymentStatus[order.paymentStatus] || 0) + 1;
          }
        });

        // Calculate total
        const total = Object.values(pipelineStats).reduce((sum, count) => sum + count, 0);

        setData({
          byStatus: pipelineStats,
          byPaymentStatus,
          recentOrders: orders,
          total,
        });
      } catch (error) {
        console.error('Error loading orders breakdown:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-32 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No order data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Orders by Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">By Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.byStatus)
              .filter(([, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const percentage = data.total > 0 ? (count / data.total) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {STATUS_LABELS[status] || status}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            {Object.values(data.byStatus).every((count) => count === 0) && (
              <p className="text-sm text-gray-500 text-center py-2">
                No active orders
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders by Payment Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">By Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.byPaymentStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
              >
                <Badge
                  variant="secondary"
                  className={PAYMENT_COLORS[status] || 'bg-gray-100'}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent orders
              </p>
            ) : (
              data.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {order.orderId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {order.customerName} -{' '}
                      {order.createdAt?.toDate
                        ? formatDistanceToNow(order.createdAt.toDate(), {
                            addSuffix: true,
                          })
                        : 'Recently'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[order.status] || 'bg-gray-100'}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      KES {order.totalAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
