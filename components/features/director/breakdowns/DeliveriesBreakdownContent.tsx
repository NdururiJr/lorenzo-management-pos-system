'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getDeliveriesByBranch } from '@/lib/db/deliveries';
import type { Delivery } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { Truck, User, Clock, MapPin, Package } from 'lucide-react';

interface DeliveriesBreakdownContentProps {
  branchId: string;
}

interface DeliveriesBreakdown {
  byStatus: Record<string, number>;
  activeDeliveries: Delivery[];
  total: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

export function DeliveriesBreakdownContent({ branchId }: DeliveriesBreakdownContentProps) {
  const [data, setData] = useState<DeliveriesBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Get today's deliveries
        const deliveries = await getDeliveriesByBranch(branchId);

        // Calculate by status (DeliveryStatus: 'pending' | 'in_progress' | 'completed')
        const byStatus: Record<string, number> = {
          pending: 0,
          in_progress: 0,
          completed: 0,
        };

        deliveries.forEach((delivery) => {
          const status = delivery.status || 'pending';
          byStatus[status] = (byStatus[status] || 0) + 1;
        });

        // Get active deliveries (not completed)
        const activeDeliveries = deliveries.filter(
          (d) => d.status !== 'completed'
        );

        setData({
          byStatus,
          activeDeliveries,
          total: deliveries.length,
        });
      } catch (error) {
        console.error('Error loading deliveries breakdown:', error);
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
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No delivery data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deliveries by Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">By Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div
                key={status}
                className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                  count > 0 ? 'bg-gray-50' : 'bg-gray-50/50'
                }`}
              >
                <span
                  className={`text-2xl font-bold ${
                    count > 0 ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {count}
                </span>
                <Badge
                  variant="secondary"
                  className={`mt-1 ${STATUS_COLORS[status] || 'bg-gray-100'}`}
                >
                  {STATUS_LABELS[status] || status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Deliveries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Active Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.activeDeliveries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No active deliveries
              </p>
            ) : (
              data.activeDeliveries.map((delivery) => (
                <div
                  key={delivery.deliveryId}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {delivery.deliveryId}
                    </span>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[delivery.status] || 'bg-gray-100'}
                    >
                      {STATUS_LABELS[delivery.status] || delivery.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{delivery.driverId || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>
                        {delivery.orders?.length || 0} order
                        {(delivery.orders?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {delivery.route && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {delivery.route.stops?.length || 0} stops -{' '}
                        {delivery.route.distance
                          ? `${(delivery.route.distance / 1000).toFixed(1)} km`
                          : 'Distance TBD'}
                      </span>
                    </div>
                  )}

                  {delivery.startTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Started{' '}
                        {delivery.startTime.toDate
                          ? formatDistanceToNow(delivery.startTime.toDate(), {
                              addSuffix: true,
                            })
                          : 'recently'}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {data.byStatus.pending + data.byStatus.assigned}
              </p>
              <p className="text-xs text-gray-500">Awaiting</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {data.byStatus.in_transit}
              </p>
              <p className="text-xs text-gray-500">In Transit</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {data.byStatus.completed}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
