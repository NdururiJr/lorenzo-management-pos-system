'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import {
  ShoppingBag,
  DollarSign,
  Truck,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { getTodayOrdersCount, getPipelineStats } from '@/lib/db/orders';
import { getTransfersByBranch } from '@/lib/db/inventory-transfers';

interface BranchStatsGridProps {
  branchId: string;
}

interface Stats {
  todayOrders: number;
  weekOrders: number;
  activeDeliveries: number;
  inventoryAlerts: number;
  openTransfers: number;
}

export function BranchStatsGrid({ branchId }: BranchStatsGridProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        // Get today's orders count
        const todayOrders = await getTodayOrdersCount(branchId);

        // Get pipeline stats for active deliveries
        const pipelineStats = await getPipelineStats(branchId);
        const activeDeliveries =
          (pipelineStats['out_for_delivery'] || 0);

        // Get open transfers (draft, requested, approved, in_transit)
        const transfers = await getTransfersByBranch(branchId, 'both');
        const openTransfers = transfers.filter(
          t => ['draft', 'requested', 'approved', 'in_transit'].includes(t.status)
        ).length;

        setStats({
          todayOrders,
          weekOrders: 0, // TODO: Implement week calculation
          activeDeliveries,
          inventoryAlerts: 0, // TODO: Implement inventory alerts
          openTransfers,
        });
      } catch (error) {
        console.error('Error loading branch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [branchId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <LoadingSkeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Orders Today',
      value: stats.todayOrders,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Revenue Today',
      value: 'KES 0', // TODO: Calculate revenue
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Deliveries',
      value: stats.activeDeliveries,
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Inventory Alerts',
      value: stats.inventoryAlerts,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Open Transfers',
      value: stats.openTransfers,
      icon: ArrowUpDown,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
