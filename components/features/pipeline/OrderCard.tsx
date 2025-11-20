/**
 * Pipeline Order Card Component
 *
 * Compact card displaying order information in the pipeline.
 *
 * Performance Optimizations:
 * - Memoized to prevent unnecessary re-renders
 * - Only re-renders when order ID or status changes
 * - Memoized calculations for time and urgency
 *
 * @module components/features/pipeline/OrderCard
 */

'use client';

import { memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, type OrderStatus } from '@/components/ui/status-badge';
import { PaymentBadge } from '@/components/ui/payment-badge';
import { ChevronDown, User, Package, DollarSign, Clock, Calendar, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { OrderExtended } from '@/lib/db/schema';
import { getValidNextStatuses, getStatusConfig } from '@/lib/pipeline/status-manager';
import {
  calculateTimeInCurrentStage,
  formatDuration,
  formatTimeUntilDue,
  getUrgencyColorClass,
} from '@/lib/pipeline/pipeline-helpers';

interface OrderCardProps {
  order: OrderExtended;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onClick?: () => void;
  className?: string;
}

export const OrderCard = memo(function OrderCard({
  order,
  onStatusChange,
  onClick,
  className,
}: OrderCardProps) {
  // Memoize valid next statuses
  const validNextStatuses = useMemo(
    () => getValidNextStatuses(order.status),
    [order.status]
  );

  // Memoize time in current stage calculation
  const timeInStage = useMemo(
    () => calculateTimeInCurrentStage(order),
    [order]
  );

  // Memoize urgency color class
  const urgencyClass = useMemo(
    () => getUrgencyColorClass(order),
    [order]
  );

  // Get current stage handlers (for workstation stages)
  const currentStageHandlers = useMemo(() => {
    const workstationStages: Array<'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging'> = [
      'inspection',
      'washing',
      'drying',
      'ironing',
      'quality_check',
      'packaging',
    ];

    if (!workstationStages.includes(order.status as any)) return null;

    // Get handlers for current stage from garments
    const handlersSet = new Set<string>();
    order.garments.forEach((garment) => {
      const handlers = garment.stageHandlers?.[order.status as 'inspection'];
      if (handlers) {
        handlers.forEach((handler) => {
          handlersSet.add(handler.name);
        });
      }
    });

    return handlersSet.size > 0 ? Array.from(handlersSet) : null;
  }, [order]);

  return (
    <Card
      className={cn(
        'p-4 border-2 transition-all cursor-pointer hover:shadow-lg',
        urgencyClass,
        className
      )}
      onClick={onClick}
    >
      {/* Order ID */}
      <div className="mb-3">
        <p className="font-mono font-semibold text-sm text-black">
          {order.orderId}
        </p>
        <StatusBadge status={order.status} size="sm" className="mt-1" />
      </div>

      <div className="space-y-2">
        {/* Customer */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-900 truncate">{order.customerName}</span>
        </div>

        {/* Garments */}
        <div className="flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-600">
            {order.garments.length}{' '}
            {order.garments.length === 1 ? 'garment' : 'garments'}
          </span>
        </div>

        {/* Payment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-semibold text-gray-900">
              KES {order.totalAmount.toLocaleString()}
            </span>
          </div>
          <PaymentBadge status={order.paymentStatus} size="sm" showIcon={false} />
        </div>

        {/* Time in Stage */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-600">
            {formatDuration(timeInStage)} in this stage
          </span>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span
            className={cn(
              'font-medium',
              order.estimatedCompletion.toDate() < new Date()
                ? 'text-red-600'
                : 'text-gray-600'
            )}
          >
            Due: {formatTimeUntilDue(order.estimatedCompletion)}
          </span>
        </div>

        {/* Staff Handlers (for workstation stages) */}
        {currentStageHandlers && currentStageHandlers.length > 0 && (
          <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
            <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Staff Assigned:</div>
              <div className="text-gray-900 text-xs">
                {currentStageHandlers.slice(0, 2).join(', ')}
                {currentStageHandlers.length > 2 && (
                  <span className="text-gray-500"> +{currentStageHandlers.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Status Button */}
      {validNextStatuses.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 border-gray-300"
            >
              Change Status
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {validNextStatuses.map((status) => {
              const config = getStatusConfig(status);
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(order.orderId, status);
                  }}
                >
                  {config.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if orderId or status changes
  return (
    prevProps.order.orderId === nextProps.order.orderId &&
    prevProps.order.status === nextProps.order.status &&
    prevProps.order.paymentStatus === nextProps.order.paymentStatus
  );
});
