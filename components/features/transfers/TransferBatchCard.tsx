/**
 * Transfer Batch Card Component
 *
 * Displays a single transfer batch with status and action buttons.
 *
 * @module components/features/transfers/TransferBatchCard
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Truck, Package, MapPin, User, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { markBatchDispatched } from '@/lib/db/transfers';
import type { TransferBatch, TransferBatchStatus } from '@/lib/db/schema';
import { format } from 'date-fns';

interface TransferBatchCardProps {
  batch: TransferBatch;
  onStatusChange?: () => void;
  showActions?: boolean;
}

const statusConfig: Record<
  TransferBatchStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  pending: {
    label: 'Pending Pickup',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    description: 'Awaiting driver pickup',
  },
  in_transit: {
    label: 'In Transit',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'En route to main store',
  },
  received: {
    label: 'Received',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Delivered to main store',
  },
};

export function TransferBatchCard({ batch, onStatusChange, showActions = true }: TransferBatchCardProps) {
  const [isDispatching, setIsDispatching] = useState(false);

  const config = statusConfig[batch.status];

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      await markBatchDispatched(batch.batchId);
      toast.success(`Batch ${batch.batchId} marked as dispatched`);
      onStatusChange?.();
    } catch (error) {
      console.error('Error dispatching batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to dispatch batch');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-black">{batch.batchId}</h3>
                <p className="text-sm text-gray-500">
                  Created {format(batch.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <Badge className={`${config.bgColor} ${config.color} border-0`}>{config.label}</Badge>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>From</span>
              </div>
              <div className="font-medium text-black">{batch.satelliteBranchId}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>To</span>
              </div>
              <div className="font-medium text-black">{batch.mainStoreBranchId}</div>
            </div>
          </div>

          {/* Orders Count */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {batch.totalOrders} order{batch.totalOrders !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Driver Information */}
          {batch.assignedDriverId && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Driver: {batch.assignedDriverId}</span>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-1 text-sm">
            {batch.dispatchedAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Dispatched: {format(batch.dispatchedAt.toDate(), 'MMM d, h:mm a')}</span>
              </div>
            )}
            {batch.receivedAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Received: {format(batch.receivedAt.toDate(), 'MMM d, h:mm a')}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && batch.status === 'pending' && batch.assignedDriverId && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                onClick={handleDispatch}
                disabled={isDispatching}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                {isDispatching ? 'Dispatching...' : 'Mark as Dispatched'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {batch.status === 'pending' && !batch.assignedDriverId && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              Waiting for driver assignment
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
