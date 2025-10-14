/**
 * Pipeline Board Component
 *
 * Kanban-style board for managing order workflow.
 * Displays orders organized by status with drag-and-drop or click-to-update.
 *
 * Performance Optimizations:
 * - Memoized column calculations
 * - Memoized statistics calculations
 * - Optimized re-renders with useMemo
 *
 * @module components/features/pipeline/PipelineBoard
 */

'use client';

import { useState, useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/components/ui/status-badge';
import type { OrderExtended } from '@/lib/db/schema';
import { OrderCard } from './OrderCard';

interface PipelineColumn {
  status: OrderStatus;
  label: string;
  color: string;
  orders: OrderExtended[];
}

interface PipelineBoardProps {
  orders: OrderExtended[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick: (order: OrderExtended) => void;
  className?: string;
}

const PIPELINE_COLUMNS: Omit<PipelineColumn, 'orders'>[] = [
  { status: 'received', label: 'Received', color: 'gray' },
  { status: 'queued', label: 'Queued', color: 'gray' },
  { status: 'washing', label: 'Washing', color: 'blue' },
  { status: 'drying', label: 'Drying', color: 'blue' },
  { status: 'ironing', label: 'Ironing', color: 'blue' },
  { status: 'quality_check', label: 'Quality Check', color: 'purple' },
  { status: 'packaging', label: 'Packaging', color: 'cyan' },
  { status: 'ready', label: 'Ready', color: 'green' },
  { status: 'out_for_delivery', label: 'Out for Delivery', color: 'amber' },
  { status: 'delivered', label: 'Delivered', color: 'green' },
];

export const PipelineBoard = memo(function PipelineBoard({
  orders,
  onStatusChange,
  onOrderClick,
  className,
}: PipelineBoardProps) {
  const [selectedColumn, setSelectedColumn] = useState<OrderStatus | null>(null);

  // Memoize grouping orders by status - only recalculate when orders change
  const columns: PipelineColumn[] = useMemo(() => {
    return PIPELINE_COLUMNS.map((col) => ({
      ...col,
      orders: orders.filter((order) => order.status === col.status),
    }));
  }, [orders]);

  // Memoize statistics calculation function
  const getColumnStats = useMemo(() => {
    return (columnOrders: OrderExtended[]) => {
      const total = columnOrders.length;
      // Calculate average time in current stage
      const now = new Date();
      const avgTime =
        total > 0
          ? Math.round(
              columnOrders.reduce((sum, o) => {
                const lastStatusChange = o.statusHistory[o.statusHistory.length - 1];
                const timeInStage = lastStatusChange
                  ? (now.getTime() - lastStatusChange.timestamp.toMillis()) / (1000 * 60)
                  : 0;
                return sum + timeInStage;
              }, 0) / total
            )
          : 0;

      return { total, avgTime };
    };
  }, []);

  return (
    <div className={cn('h-full', className)}>
      {/* Desktop: Horizontal Scroll */}
      <div className="hidden lg:block">
        <ScrollArea className="w-full pb-4">
          <div className="flex gap-4 min-w-max p-1">
            {columns.map((column) => {
              const stats = getColumnStats(column.orders);

              return (
                <div
                  key={column.status}
                  className="w-80 flex-shrink-0"
                >
                  {/* Column Header */}
                  <Card className="mb-3">
                    <div className={cn(
                      'p-4 rounded-t-lg',
                      `bg-${column.color}-50 border-b border-${column.color}-200`
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-black">
                          {column.label}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'font-bold',
                            `bg-${column.color}-100 text-${column.color}-700`
                          )}
                        >
                          {stats.total}
                        </Badge>
                      </div>
                      {stats.avgTime > 0 && (
                        <p className="text-xs text-gray-600">
                          Avg: {stats.avgTime}min in stage
                        </p>
                      )}
                    </div>
                  </Card>

                  {/* Orders List */}
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-3 pr-2">
                      {column.orders.length > 0 ? (
                        column.orders.map((order) => (
                          <OrderCard
                            key={order.orderId}
                            order={order}
                            onStatusChange={onStatusChange}
                            onClick={() => onOrderClick(order)}
                          />
                        ))
                      ) : (
                        <Card className="p-8 text-center border-2 border-dashed border-gray-200">
                          <p className="text-sm text-gray-500">
                            No orders in this stage
                          </p>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile: Tabs or Accordion */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {columns.map((column) => {
            const stats = getColumnStats(column.orders);
            const isSelected = selectedColumn === column.status;

            return (
              <Card key={column.status} className="overflow-hidden">
                {/* Column Header (Collapsible) */}
                <button
                  onClick={() =>
                    setSelectedColumn(isSelected ? null : column.status)
                  }
                  className={cn(
                    'w-full p-4 flex items-center justify-between text-left transition-colors',
                    `bg-${column.color}-50 hover:bg-${column.color}-100`
                  )}
                >
                  <div>
                    <h3 className="font-semibold text-black">
                      {column.label}
                    </h3>
                    {stats.avgTime > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Avg: {stats.avgTime}min in stage
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'font-bold',
                      `bg-${column.color}-100 text-${column.color}-700`
                    )}
                  >
                    {stats.total}
                  </Badge>
                </button>

                {/* Orders List (Expandable) */}
                {isSelected && (
                  <div className="p-4 space-y-3 bg-white">
                    {column.orders.length > 0 ? (
                      column.orders.map((order) => (
                        <OrderCard
                          key={order.orderId}
                          order={order}
                          onStatusChange={onStatusChange}
                          onClick={() => onOrderClick(order)}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-center text-gray-500 py-4">
                        No orders in this stage
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
});
