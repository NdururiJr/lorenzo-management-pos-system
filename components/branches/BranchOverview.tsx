'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArrowRight, ShoppingBag, TrendingUp } from 'lucide-react';
import { getOrdersByBranch, getPipelineStats } from '@/lib/db/orders';
import type { Order, OrderStatus } from '@/lib/db/schema';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface BranchOverviewProps {
  branchId: string;
}

export function BranchOverview({ branchId }: BranchOverviewProps) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  // FR-008: Updated 'ready' to 'queued_for_delivery'
  const [pipelineStats, setPipelineStats] = useState<{
    received: number;
    queued: number;
    washing: number;
    drying: number;
    ironing: number;
    quality_check: number;
    packaging: number;
    queued_for_delivery: number;
    out_for_delivery: number;
    total: number;
  }>({
    received: 0,
    queued: 0,
    washing: 0,
    drying: 0,
    ironing: 0,
    quality_check: 0,
    packaging: 0,
    queued_for_delivery: 0,
    out_for_delivery: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);

        // Load recent orders (limit 10)
        const orders = await getOrdersByBranch(branchId, 10);
        setRecentOrders(orders);

        // Load pipeline stats
        const stats = await getPipelineStats(branchId);
        setPipelineStats(stats);
      } catch (error) {
        console.error('Error loading overview:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, [branchId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton className="h-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const pipelineData = [
    { status: 'received', label: 'Received', count: pipelineStats['received'] || 0 },
    { status: 'queued', label: 'Queued', count: pipelineStats['queued'] || 0 },
    { status: 'washing', label: 'Washing', count: pipelineStats['washing'] || 0 },
    { status: 'drying', label: 'Drying', count: pipelineStats['drying'] || 0 },
    { status: 'ironing', label: 'Ironing', count: pipelineStats['ironing'] || 0 },
    { status: 'quality_check', label: 'Quality Check', count: pipelineStats['quality_check'] || 0 },
    { status: 'packaging', label: 'Packaging', count: pipelineStats['packaging'] || 0 },
    { status: 'queued_for_delivery', label: 'Ready', count: pipelineStats['queued_for_delivery'] || 0 }, // FR-008
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          <Link href={`/orders?branchId=${branchId}`}>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              heading="No orders yet"
              description="Orders will appear here once created"
            />
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <Link
                  key={order.orderId}
                  href={`/orders/${order.orderId}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {order.orderId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.garments?.length || 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-black">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Snapshot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Pipeline Status</CardTitle>
          <Link href={`/pipeline?branchId=${branchId}`}>
            <Button variant="ghost" size="sm">
              View Pipeline
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {Object.values(pipelineStats).every(count => count === 0) ? (
            <EmptyState
              icon={TrendingUp}
              heading="No active orders"
              description="Pipeline status will appear here"
            />
          ) : (
            <div className="space-y-2">
              {pipelineData.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status as OrderStatus} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-black">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
