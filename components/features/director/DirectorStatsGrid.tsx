'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import {
  ShoppingBag,
  DollarSign,
  Truck,
  AlertTriangle,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';
import { getTodayOrdersCount, getPipelineStats } from '@/lib/db/orders';
import { getTransfersByBranch } from '@/lib/db/inventory-transfers';
import { StatBreakdownModal } from './StatBreakdownModal';
import { OrdersBreakdownContent } from './breakdowns/OrdersBreakdownContent';
import { RevenueBreakdownContent } from './breakdowns/RevenueBreakdownContent';
import { DeliveriesBreakdownContent } from './breakdowns/DeliveriesBreakdownContent';
import { InventoryBreakdownContent } from './breakdowns/InventoryBreakdownContent';
import { TransfersBreakdownContent } from './breakdowns/TransfersBreakdownContent';

interface DirectorStatsGridProps {
  branchId: string;
}

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  activeDeliveries: number;
  inventoryAlerts: number;
  openTransfers: number;
}

type ModalType = 'orders' | 'revenue' | 'deliveries' | 'inventory' | 'transfers' | null;

export function DirectorStatsGrid({ branchId }: DirectorStatsGridProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        // Get today's orders count
        const todayOrders = await getTodayOrdersCount(branchId);

        // Get pipeline stats for active deliveries
        const pipelineStats = await getPipelineStats(branchId);
        const activeDeliveries = pipelineStats['out_for_delivery'] || 0;

        // Get open transfers (draft, requested, approved, in_transit)
        const transfers = await getTransfersByBranch(branchId, 'both');
        const openTransfers = transfers.filter(
          (t) =>
            ['draft', 'requested', 'approved', 'in_transit'].includes(t.status)
        ).length;

        setStats({
          todayOrders,
          todayRevenue: 0, // TODO: Calculate from transactions
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

  const handleCardClick = (type: ModalType) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

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
      hoverBg: 'hover:bg-blue-50/50',
      type: 'orders' as const,
    },
    {
      title: 'Revenue Today',
      value: `KES ${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBg: 'hover:bg-green-50/50',
      type: 'revenue' as const,
    },
    {
      title: 'Active Deliveries',
      value: stats.activeDeliveries,
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-50/50',
      type: 'deliveries' as const,
    },
    {
      title: 'Inventory Alerts',
      value: stats.inventoryAlerts,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      hoverBg: 'hover:bg-amber-50/50',
      type: 'inventory' as const,
    },
    {
      title: 'Open Transfers',
      value: stats.openTransfers,
      icon: ArrowUpDown,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverBg: 'hover:bg-indigo-50/50',
      type: 'transfers' as const,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`cursor-pointer transition-all duration-200 ${stat.hoverBg} hover:shadow-md hover:scale-[1.02] group`}
              onClick={() => handleCardClick(stat.type)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-black">
                    {stat.value}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click for breakdown
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders Breakdown Modal */}
      <StatBreakdownModal
        open={activeModal === 'orders'}
        onClose={closeModal}
        title="Orders Breakdown"
        viewAllLink="/pipeline"
        viewAllLabel="View Pipeline"
      >
        <OrdersBreakdownContent branchId={branchId} />
      </StatBreakdownModal>

      {/* Revenue Breakdown Modal */}
      <StatBreakdownModal
        open={activeModal === 'revenue'}
        onClose={closeModal}
        title="Revenue Breakdown"
        viewAllLink="/transactions"
        viewAllLabel="View All Transactions"
      >
        <RevenueBreakdownContent branchId={branchId} />
      </StatBreakdownModal>

      {/* Deliveries Breakdown Modal */}
      <StatBreakdownModal
        open={activeModal === 'deliveries'}
        onClose={closeModal}
        title="Active Deliveries"
        viewAllLink="/deliveries"
        viewAllLabel="View All Deliveries"
      >
        <DeliveriesBreakdownContent branchId={branchId} />
      </StatBreakdownModal>

      {/* Inventory Breakdown Modal */}
      <StatBreakdownModal
        open={activeModal === 'inventory'}
        onClose={closeModal}
        title="Inventory Alerts"
        viewAllLink="/inventory"
        viewAllLabel="View Inventory"
      >
        <InventoryBreakdownContent branchId={branchId} />
      </StatBreakdownModal>

      {/* Transfers Breakdown Modal */}
      <StatBreakdownModal
        open={activeModal === 'transfers'}
        onClose={closeModal}
        title="Open Transfers"
        viewAllLink="/transfers"
        viewAllLabel="View All Transfers"
      >
        <TransfersBreakdownContent branchId={branchId} />
      </StatBreakdownModal>
    </>
  );
}
