/**
 * Order Tracking Timeline Component
 *
 * Visual timeline showing order progress from creation to completion.
 * Used in customer portal for order tracking.
 *
 * @module components/features/customer/OrderTrackingTimeline
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Clock,
  Truck,
  Package,
} from 'lucide-react';
import { StatusIcon, type OrderStatus } from '@/components/ui/status-badge';

interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: Date;
  completedBy?: string;
}

interface OrderTrackingTimelineProps {
  statusHistory: StatusHistoryItem[];
  currentStatus: OrderStatus;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  className?: string;
}

const STATUS_TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: 'received', label: 'Order Received' },
  { status: 'washing', label: 'Washing' },
  { status: 'drying', label: 'Drying' },
  { status: 'ironing', label: 'Ironing' },
  { status: 'quality_check', label: 'Quality Check' },
  { status: 'packaging', label: 'Packaging' },
  { status: 'queued_for_delivery', label: 'Ready for Pickup/Delivery' }, // FR-008
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

export function OrderTrackingTimeline({
  statusHistory,
  currentStatus,
  estimatedCompletion,
  actualCompletion,
  className,
}: OrderTrackingTimelineProps) {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusState = (
    status: OrderStatus
  ): 'completed' | 'current' | 'pending' => {
    // Find if this status is in history
    const historyItem = statusHistory.find((h) => h.status === status);
    if (historyItem) return 'completed';

    // Check if it's the current status
    if (status === currentStatus) return 'current';

    return 'pending';
  };

  const getStatusTimestamp = (status: OrderStatus): Date | null => {
    const historyItem = statusHistory.find((h) => h.status === status);
    return historyItem?.timestamp || null;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Timeline */}
      <Card className="p-6">
        <div className="space-y-1">
          {STATUS_TIMELINE.map((item, index) => {
            const state = getStatusState(item.status);
            const timestamp = getStatusTimestamp(item.status);
            const isLast = index === STATUS_TIMELINE.length - 1;

            return (
              <div key={item.status} className="flex gap-4">
                {/* Icon Column */}
                <div className="flex flex-col items-center">
                  {/* Status Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      state === 'completed' &&
                        'bg-green-100 border-2 border-green-500',
                      state === 'current' &&
                        'bg-blue-100 border-2 border-blue-500 animate-pulse',
                      state === 'pending' &&
                        'bg-gray-100 border-2 border-gray-300'
                    )}
                  >
                    {state === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {state === 'current' && (
                      <StatusIcon status={item.status} size="sm" />
                    )}
                    {state === 'pending' && (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'w-0.5 h-12 my-1',
                        state === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      )}
                    />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={cn(
                          'font-semibold',
                          state === 'completed' && 'text-black',
                          state === 'current' && 'text-blue-600',
                          state === 'pending' && 'text-gray-500'
                        )}
                      >
                        {item.label}
                      </h3>
                      {timestamp && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDateTime(timestamp)}
                        </p>
                      )}
                      {state === 'current' && !timestamp && (
                        <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-300">
                          In Progress
                        </Badge>
                      )}
                    </div>

                    {/* Status Badge */}
                    {state === 'completed' && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Estimated Completion */}
      {estimatedCompletion && !actualCompletion && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Estimated Completion</p>
              <p className="text-sm text-blue-700">
                {formatDateTime(estimatedCompletion)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actual Completion */}
      {actualCompletion && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Order Completed</p>
              <p className="text-sm text-green-700">
                {formatDateTime(actualCompletion)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Delivery Info (if applicable) */}
      {currentStatus === 'out_for_delivery' && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Driver En Route</p>
              <p className="text-sm text-amber-700">
                Your order is on its way to you
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Ready for Pickup - FR-008: Updated to use 'queued_for_delivery' */}
      {currentStatus === 'queued_for_delivery' && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Ready for Pickup</p>
              <p className="text-sm text-green-700">
                Your order is ready to be collected
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Compact Timeline Variant
 * Horizontal timeline for smaller spaces
 */
interface CompactTimelineProps {
  currentStatus: OrderStatus;
  className?: string;
}

export function CompactTimeline({
  currentStatus,
  className,
}: CompactTimelineProps) {
  const currentIndex = STATUS_TIMELINE.findIndex(
    (s) => s.status === currentStatus
  );

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}>
      {STATUS_TIMELINE.map((item, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={item.status} className="flex items-center">
            {/* Status Node */}
            <div className="flex flex-col items-center min-w-[80px]">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  isCompleted && 'bg-green-500',
                  isCurrent && 'bg-blue-500 animate-pulse',
                  !isCompleted && !isCurrent && 'bg-gray-300'
                )}
              >
                {isCompleted && (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                )}
                {isCurrent && <Circle className="w-5 h-5 text-white fill-white" />}
                {!isCompleted && !isCurrent && (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <p
                className={cn(
                  'text-xs mt-1 text-center',
                  isCompleted && 'text-green-700 font-medium',
                  isCurrent && 'text-blue-700 font-semibold',
                  !isCompleted && !isCurrent && 'text-gray-500'
                )}
              >
                {item.label}
              </p>
            </div>

            {/* Connecting Line */}
            {index < STATUS_TIMELINE.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mb-6',
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
