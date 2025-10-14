/**
 * Pipeline Column Component
 *
 * Single column in the Kanban board representing one order status.
 *
 * @module components/features/pipeline/PipelineColumn
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderExtended, OrderStatus } from '@/lib/db/schema';
import { getStatusConfig } from '@/lib/pipeline/status-manager';
import { OrderCard } from './OrderCard';
import { formatDuration } from '@/lib/pipeline/pipeline-helpers';

interface PipelineColumnProps {
  status: OrderStatus;
  orders: OrderExtended[];
  onOrderClick: (order: OrderExtended) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  className?: string;
}

export function PipelineColumn({
  status,
  orders,
  onOrderClick,
  onStatusChange,
  className,
}: PipelineColumnProps) {
  const statusConfig = getStatusConfig(status);

  // Calculate average time in this stage
  const avgTime = orders.length > 0
    ? Math.round(
        orders.reduce((sum, order) => {
          const lastStatus = order.statusHistory[order.statusHistory.length - 1];
          if (lastStatus) {
            const timeInStage = Math.floor(
              (Date.now() - lastStatus.timestamp.toDate().getTime()) / (1000 * 60)
            );
            return sum + timeInStage;
          }
          return sum;
        }, 0) / orders.length
      )
    : 0;

  return (
    <div className={cn('w-80 flex-shrink-0 flex flex-col', className)}>
      {/* Column Header */}
      <Card
        className={cn(
          'mb-3 border-2',
          statusConfig.borderColor,
          statusConfig.bgColor
        )}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-black">{statusConfig.label}</h3>
            <Badge
              variant="secondary"
              className={cn(
                'font-bold',
                statusConfig.bgColor,
                statusConfig.textColor
              )}
            >
              {orders.length}
            </Badge>
          </div>

          <p className="text-xs text-gray-600 mb-1">
            {statusConfig.description}
          </p>

          {avgTime > 0 && (
            <p className="text-xs text-gray-500">
              Avg: {formatDuration(avgTime)} in stage
            </p>
          )}
        </div>
      </Card>

      {/* Orders List */}
      <ScrollArea className="flex-1 h-[calc(100vh-320px)]">
        <div className="space-y-3 pr-2">
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onStatusChange={onStatusChange}
                onClick={() => onOrderClick(order)}
              />
            ))
          ) : (
            <Card className="p-8 text-center border-2 border-dashed border-gray-200">
              <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No orders in this stage</p>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
