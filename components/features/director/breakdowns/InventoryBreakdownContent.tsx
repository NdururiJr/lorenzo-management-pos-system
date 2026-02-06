'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Progress } from '@/components/ui/progress';
import { getInventoryByBranch } from '@/lib/db';
import type { InventoryItem } from '@/lib/db/schema';
import { AlertTriangle, Package, Clock, ShoppingCart } from 'lucide-react';

interface InventoryBreakdownContentProps {
  branchId: string;
}

interface InventoryBreakdown {
  lowStockItems: InventoryItem[];
  criticalItems: InventoryItem[];
  expiringItems: InventoryItem[];
  totalAlerts: number;
}

export function InventoryBreakdownContent({ branchId }: InventoryBreakdownContentProps) {
  const [data, setData] = useState<InventoryBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Get all inventory items for this branch
        const items = await getInventoryByBranch(branchId);

        // Filter low stock items (below reorder level)
        const lowStockItems = items.filter(
          (item) => item.quantity <= item.reorderLevel && item.quantity > 0
        );

        // Filter critical items (out of stock or very low)
        const criticalItems = items.filter(
          (item) => item.quantity <= Math.floor(item.reorderLevel * 0.25)
        );

        // Filter expiring items (within 7 days)
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const expiringItems = items.filter((item) => {
          if (!item.expiryDate) return false;
          // expiryDate is a Timestamp, use toDate() to convert
          const expiryDate = typeof item.expiryDate === 'object' && 'toDate' in item.expiryDate
            ? item.expiryDate.toDate()
            : new Date(item.expiryDate as unknown as string | number);
          return expiryDate <= sevenDaysFromNow && expiryDate >= now;
        });

        setData({
          lowStockItems,
          criticalItems,
          expiringItems,
          totalAlerts: lowStockItems.length + criticalItems.length + expiringItems.length,
        });
      } catch (error) {
        console.error('Error loading inventory breakdown:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No inventory data available
      </div>
    );
  }

  const getStockLevel = (item: InventoryItem) => {
    if (item.reorderLevel === 0) return 100;
    return Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100);
  };

  const getStockColor = (item: InventoryItem) => {
    const level = getStockLevel(item);
    if (level <= 25) return 'text-red-600';
    if (level <= 50) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alert Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {data.criticalItems.length}
              </p>
              <p className="text-xs text-red-700">Critical</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">
                {data.lowStockItems.length}
              </p>
              <p className="text-xs text-amber-700">Low Stock</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {data.expiringItems.length}
              </p>
              <p className="text-xs text-orange-700">Expiring Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Items */}
      {data.criticalItems.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-red-700 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Critical Stock ({data.criticalItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.criticalItems.slice(0, 5).map((item) => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-bold ${getStockColor(item)}`}>
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reorder at {item.reorderLevel}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Items */}
      {data.lowStockItems.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Low Stock Items ({data.lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.lowStockItems
                .filter((item) => !data.criticalItems.includes(item))
                .slice(0, 5)
                .map((item) => (
                  <div key={item.itemId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className={`text-sm font-bold ${getStockColor(item)}`}>
                        {item.quantity} / {item.reorderLevel * 2}
                      </span>
                    </div>
                    <Progress value={getStockLevel(item)} className="h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Items */}
      {data.expiringItems.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-orange-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expiring Soon ({data.expiringItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.expiringItems.slice(0, 5).map((item) => {
                const expiryDate = item.expiryDate?.toDate
                  ? item.expiryDate.toDate()
                  : new Date(item.expiryDate as unknown as string);
                const daysUntilExpiry = Math.ceil(
                  (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} {item.unit} remaining
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        daysUntilExpiry <= 2
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }
                    >
                      {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} left
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts */}
      {data.totalAlerts === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-700">
              All inventory levels healthy
            </p>
            <p className="text-sm text-gray-500">
              No items require immediate attention
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
