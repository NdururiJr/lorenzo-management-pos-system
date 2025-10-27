/**
 * Low Stock Alerts Component
 *
 * Displays prominent alerts for low and critical stock items.
 * Automatically checks stock levels and creates notifications.
 *
 * @module components/features/inventory/LowStockAlerts
 */

'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import type { InventoryItem } from '@/app/(dashboard)/inventory/page';

interface LowStockAlertsProps {
  items: InventoryItem[];
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filter critical and low stock items
  const criticalItems = items.filter((item) => item.quantity < item.reorderLevel);
  const lowStockItems = items.filter(
    (item) => item.quantity >= item.reorderLevel && item.quantity <= item.reorderLevel * 1.2
  );

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async ({
      type,
      title,
      message,
      items: notificationItems,
    }: {
      type: string;
      title: string;
      message: string;
      items: InventoryItem[];
    }) => {
      if (!user?.branchId) throw new Error('No branch ID');

      const notification = {
        type,
        title,
        message,
        branchId: user.branchId,
        itemCount: notificationItems.length,
        items: notificationItems.map((item) => ({
          id: item.itemId,
          name: item.name,
          quantity: item.quantity,
        })),
        createdAt: Timestamp.now(),
        read: false,
      };

      await addDoc(collection(db, 'notifications'), notification);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Auto-create notifications for critical items (once per session)
  useEffect(() => {
    if (criticalItems.length > 0 && user?.branchId) {
      const notificationKey = `critical-stock-notified-${user.branchId}`;
      const lastNotified = sessionStorage.getItem(notificationKey);
      const now = Date.now();

      // Only notify once per hour
      if (!lastNotified || now - parseInt(lastNotified) > 3600000) {
        createNotificationMutation.mutate({
          type: 'critical_stock',
          title: 'Critical Stock Alert',
          message: `${criticalItems.length} items are below reorder level and need immediate attention`,
          items: criticalItems,
        });
        sessionStorage.setItem(notificationKey, now.toString());
      }
    }
  }, [criticalItems.length, user?.branchId]);

  if (criticalItems.length === 0 && lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Critical Stock Alert */}
      {criticalItems.length > 0 && (
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Critical Stock Alert
          </AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              <strong>{criticalItems.length} items</strong> are below their reorder level and
              require immediate restocking:
            </p>
            <div className="space-y-2">
              {criticalItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-red-200"
                >
                  <div>
                    <p className="font-medium text-black">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Current: {item.quantity} {item.unit} | Need: {item.reorderLevel} {item.unit}
                    </p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
              {criticalItems.length > 5 && (
                <p className="text-sm text-gray-700">
                  +{criticalItems.length - 5} more items need restocking
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-lg font-semibold text-yellow-900">
            Low Stock Warning
          </AlertTitle>
          <AlertDescription>
            <p className="mb-3 text-yellow-900">
              <strong>{lowStockItems.length} items</strong> are running low and will need
              restocking soon:
            </p>
            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200"
                >
                  <div>
                    <p className="font-medium text-black">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Current: {item.quantity} {item.unit} | Reorder at: {item.reorderLevel}{' '}
                      {item.unit}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-yellow-500 text-yellow-700 bg-yellow-50"
                  >
                    Low
                  </Badge>
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <p className="text-sm text-yellow-900">
                  +{lowStockItems.length - 3} more items running low
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
