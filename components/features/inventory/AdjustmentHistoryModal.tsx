/**
 * Adjustment History Modal Component
 *
 * Displays the history of stock adjustments for an inventory item.
 *
 * @module components/features/inventory/AdjustmentHistoryModal
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import type { InventoryItem } from '@/app/(dashboard)/inventory/page';

interface AdjustmentHistoryModalProps {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InventoryLog {
  id: string;
  logId: string;
  itemId: string;
  itemName: string;
  type: 'restock' | 'usage';
  oldQuantity: number;
  newQuantity: number;
  amount: number;
  reason?: string;
  userId: string;
  userName: string;
  timestamp: any;
}

export function AdjustmentHistoryModal({ item, open, onOpenChange }: AdjustmentHistoryModalProps) {
  const { data: logs = [], isLoading } = useQuery<InventoryLog[]>({
    queryKey: ['inventory-logs', item.itemId],
    queryFn: async () => {
      const logsRef = collection(db, 'inventory_logs');
      const q = query(
        logsRef,
        where('itemId', '==', item.itemId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryLog[];
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adjustment History</DialogTitle>
          <DialogDescription>
            Stock adjustment history for {item.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 mt-2">Loading history...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>No adjustment history found</p>
              <p className="text-sm mt-1">Stock adjustments will appear here</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50"
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    log.type === 'restock'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {log.type === 'restock' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-black">
                        {log.type === 'restock' ? 'Stock Added' : 'Stock Removed'}
                      </p>
                      <p className="text-sm text-gray-600">
                        By {log.userName} •{' '}
                        {log.timestamp && format(log.timestamp.toDate(), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        log.type === 'restock'
                          ? 'border-green-200 text-green-700 bg-green-50'
                          : 'border-red-200 text-red-700 bg-red-50'
                      }
                    >
                      {log.type === 'restock' ? '+' : '-'}
                      {log.amount} {item.unit}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-700 mt-2">
                    <span>
                      Old: <span className="font-semibold">{log.oldQuantity}</span>
                    </span>
                    <span>→</span>
                    <span>
                      New: <span className="font-semibold">{log.newQuantity}</span>
                    </span>
                  </div>

                  {log.reason && (
                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                      {log.reason}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
