/**
 * Receive Batch Modal Component
 *
 * Modal for confirming receipt of transfer batch at main store.
 * Automatically moves all orders in batch to inspection status.
 *
 * @module components/features/transfers/ReceiveBatchModal
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Package, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { markBatchReceived } from '@/lib/db/transfers';
import type { TransferBatch } from '@/lib/db/schema';
import { format } from 'date-fns';

interface ReceiveBatchModalProps {
  batch: TransferBatch;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceiveBatchModal({ batch, onClose, onSuccess }: ReceiveBatchModalProps) {
  const { user } = useAuth();
  const [isReceiving, setIsReceiving] = useState(false);

  const handleReceive = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsReceiving(true);

    try {
      await markBatchReceived(batch.batchId, user.uid);
      toast.success(
        `Batch ${batch.batchId} received! All ${batch.totalOrders} order${batch.totalOrders !== 1 ? 's' : ''} moved to inspection.`
      );
      onSuccess();
    } catch (error) {
      console.error('Error receiving batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to receive batch');
    } finally {
      setIsReceiving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Receive Transfer Batch
          </DialogTitle>
          <DialogDescription>Confirm receipt of batch from satellite store</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Batch Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Batch ID:</span>
              <span className="font-medium text-black">{batch.batchId}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">From:</span>
              <span className="font-medium text-black">{batch.satelliteBranchId}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Orders:</span>
              <span className="font-medium text-black">
                {batch.totalOrders} order{batch.totalOrders !== 1 ? 's' : ''}
              </span>
            </div>

            {batch.dispatchedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Dispatched:</span>
                <span className="font-medium text-black">
                  {format(batch.dispatchedAt.toDate(), 'MMM d, h:mm a')}
                </span>
              </div>
            )}

            {batch.assignedDriverId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Driver:</span>
                <span className="font-medium text-black">{batch.assignedDriverId}</span>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Confirming receipt will automatically move all{' '}
              {batch.totalOrders} order{batch.totalOrders !== 1 ? 's' : ''} in this batch to{' '}
              <strong>inspection</strong> status. They will appear in the Workstation Inspection
              Queue.
            </AlertDescription>
          </Alert>

          {/* Order IDs Preview (first 5) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Orders in this batch:</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto">
              {batch.orderIds.slice(0, 5).map((orderId) => (
                <div key={orderId} className="text-xs font-mono text-gray-700">
                  {orderId}
                </div>
              ))}
              {batch.orderIds.length > 5 && (
                <div className="text-xs text-gray-500 italic">
                  ... and {batch.orderIds.length - 5} more
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isReceiving}>
            Cancel
          </Button>
          <Button
            onClick={handleReceive}
            disabled={isReceiving}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isReceiving ? 'Receiving...' : 'Confirm Receipt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
