'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { AlertTriangle, Package, ArrowRight, Plus } from 'lucide-react';
import { getLowStockItems, getInventoryByBranch } from '@/lib/db/index';
import type { InventoryItem } from '@/lib/db/schema';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface BranchInventoryProps {
  branchId: string;
}

export function BranchInventory({ branchId }: BranchInventoryProps) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;

  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [topItems, setTopItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);

        // Load low stock items
        const lowStock = await getLowStockItems(branchId);
        setLowStockItems(lowStock);

        // Load top items by quantity
        const allItems = await getInventoryByBranch(branchId);
        const sorted = allItems
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10);
        setTopItems(sorted);
      } catch (error) {
        console.error('Error loading inventory:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, [branchId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton className="h-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Link href={`/inventory?branchId=${branchId}`}>
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            View Full Inventory
          </Button>
        </Link>
        {canManage && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Transfer
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Low Stock Alerts
              {lowStockItems.length > 0 && (
                <Badge variant="destructive">{lowStockItems.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <EmptyState
                icon={Package}
                heading="No low stock alerts"
                description="All items are sufficiently stocked"
              />
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-700">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {item.reorderLevel}
                        </p>
                      </div>
                      <Badge variant="destructive" className="shrink-0">
                        Low
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Stock Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Items</CardTitle>
            <Link href={`/inventory?branchId=${branchId}`}>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <EmptyState
                icon={Package}
                heading="No inventory items"
                description="Start by adding inventory items"
              />
            ) : (
              <div className="space-y-2">
                {topItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-black">
                        {item.quantity} {item.unit}
                      </p>
                      {item.quantity > item.reorderLevel * 2 && (
                        <Badge variant="secondary" className="mt-1">
                          Well Stocked
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
