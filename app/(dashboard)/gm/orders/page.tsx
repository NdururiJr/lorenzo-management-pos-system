'use client';

import { useState, useEffect, useRef } from 'react';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import { useGMOrderMetrics } from '@/hooks/useGMDashboard';
import { useRealTimeLiveOrders } from '@/hooks/useRealTimeGMDashboard';
import { subscribeToNewOrders } from '@/lib/db/gm-dashboard';
import { toast } from 'sonner';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'in_progress' | 'ready' | 'vip';

export default function GMLiveOrdersPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  // Use real-time hook instead of polling (PR-050, PR-062)
  const { orders, isLoading: ordersLoading } = useRealTimeLiveOrders(branchFilter);
  const { data: metrics, isLoading: metricsLoading, refetch: refetchOrders } = useGMOrderMetrics(branchFilter);

  // Subscribe to new order notifications (PR-062)
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;

    const unsubscribe = subscribeToNewOrders(
      branchFilter,
      (order) => {
        if (isMounted.current) {
          toast.success(`New Order Received`, {
            description: `${order.orderId} - ${order.customerName} (${order.items} items)`,
            duration: 5000,
          });
        }
      },
      (error) => {
        console.error('New order subscription error:', error);
      }
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [branchFilter]);

  const filteredOrders = orders?.filter((order) => {
    // Apply filter
    if (filter === 'in_progress' && !['washing', 'drying', 'ironing', 'pressing', 'sorting'].includes(order.status)) {
      return false;
    }
    // FR-008: Updated 'ready' to 'queued_for_delivery'
    if (filter === 'ready' && order.status !== 'queued_for_delivery') {
      return false;
    }
    if (filter === 'vip' && order.priority !== 'express') {
      return false;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderId.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.includes(query)
      );
    }

    return true;
  }) || [];

  // FR-008: Updated 'ready' to 'queued_for_delivery'
  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (status) {
      case 'queued_for_delivery':
        return 'success';
      case 'pressing':
      case 'ironing':
        return 'warning';
      case 'washing':
      case 'drying':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'express') {
      return <ModernBadge variant="warning" size="sm">VIP</ModernBadge>;
    }
    return null;
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              OPERATIONS • REAL-TIME
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Live Order Queue</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage all active orders in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Branches</option>
              <option value="kilimani">Kilimani</option>
              <option value="westlands">Westlands</option>
            </select>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => refetchOrders()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </ModernButton>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Total Orders"
            value={metricsLoading ? '...' : metrics?.total.toString() || '0'}
            changeLabel={`${metrics?.completed || 0} completed`}
            icon={<Package className="h-5 w-5" />}
            trend={metrics?.trend && metrics.trend > 0 ? 'up' : metrics?.trend && metrics.trend < 0 ? 'down' : 'neutral'}
            change={metrics?.trend ? Math.abs(metrics.trend) : undefined}
          />
          <ModernStatCard
            title="In Progress"
            value={metricsLoading ? '...' : metrics?.inProgress.toString() || '0'}
            changeLabel="Active processing"
            icon={<Clock className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Express Orders"
            value={metricsLoading ? '...' : metrics?.express.toString() || '0'}
            changeLabel="Priority handling"
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Pending Pickup"
            value={metricsLoading ? '...' : metrics?.pending.toString() || '0'}
            changeLabel="Ready for customer"
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'ready', label: 'Ready' },
              { key: 'vip', label: 'VIP Only' },
            ].map((item) => (
              <ModernButton
                key={item.key}
                variant={filter === item.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(item.key as FilterType)}
              >
                {item.label}
              </ModernButton>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ModernButton variant="secondary" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
              Filter
            </ModernButton>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-4 w-64 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <ModernCard className="overflow-hidden">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-40" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div>Order ID</div>
                <div className="col-span-2">Customer</div>
                <div>Branch</div>
                <div>Status</div>
                <div>Items</div>
                <div>ETA</div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {filteredOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-teal-600">
                        {order.orderId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          order.createdAt instanceof Date
                            ? order.createdAt
                            : order.createdAt.toDate(),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{order.customerName}</p>
                        {getPriorityBadge(order.priority)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {order.customerPhone}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      {order.branchName}
                    </div>

                    <div>
                      <ModernBadge variant={getStatusColor(order.status)} size="sm">
                        {order.status.replace('_', ' ')}
                      </ModernBadge>
                    </div>

                    <div className="text-sm font-medium">
                      {order.items}
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          order.status === 'queued_for_delivery' ? 'text-teal-600' : ''
                        }`}
                      >
                        {order.eta}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ModernCard>
      </div>
    </ModernLayout>
  );
}
