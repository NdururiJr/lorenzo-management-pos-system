/**
 * Inventory Management Page
 *
 * Comprehensive inventory tracking and management system.
 * Allows staff to manage inventory items, track stock levels,
 * perform stock adjustments, and view adjustment history.
 *
 * @module app/(dashboard)/inventory/page
 */

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import { InventoryTable } from '@/components/features/inventory/InventoryTable';
import { AddItemModal } from '@/components/features/inventory/AddItemModal';
import { LowStockAlerts } from '@/components/features/inventory/LowStockAlerts';
import { format } from 'date-fns';

export interface InventoryItem {
  id: string;
  itemId: string;
  branchId: string;
  name: string;
  category: 'detergents' | 'softeners' | 'hangers' | 'packaging' | 'stain_removers' | 'others';
  quantity: number;
  unit: 'kg' | 'liters' | 'pieces';
  reorderLevel: number;
  costPerUnit?: number;
  supplier?: string;
  expiryDate?: any;
  lastRestocked?: any;
  createdAt?: any;
  updatedAt?: any;
}

const CATEGORY_LABELS: Record<string, string> = {
  detergents: 'Detergents',
  softeners: 'Softeners',
  hangers: 'Hangers',
  packaging: 'Packaging',
  stain_removers: 'Stain Removers',
  others: 'Others',
};

export default function InventoryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'low' | 'good'>('all');

  // Fetch inventory items
  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory', user?.branchId],
    queryFn: async () => {
      if (!user?.branchId) return [];

      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef,
        where('branchId', '==', user.branchId),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
    },
    enabled: !!user?.branchId,
  });

  // Filter items
  const filteredItems = inventory.filter((item) => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    // Stock level filter
    let matchesStock = true;
    if (stockFilter !== 'all') {
      const ratio = item.quantity / item.reorderLevel;
      if (stockFilter === 'critical') matchesStock = ratio < 1;
      if (stockFilter === 'low') matchesStock = ratio >= 1 && ratio <= 1.2;
      if (stockFilter === 'good') matchesStock = ratio > 1.2;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate stats
  const totalItems = inventory.length;
  const criticalItems = inventory.filter((item) => item.quantity < item.reorderLevel).length;
  const lowStockItems = inventory.filter(
    (item) => item.quantity >= item.reorderLevel && item.quantity <= item.reorderLevel * 1.2
  ).length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + (item.costPerUnit || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Inventory Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track and manage your inventory items
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Items
              </CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{totalItems}</div>
              <p className="text-xs text-gray-600 mt-1">In inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Critical Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
              <p className="text-xs text-gray-600 mt-1">Below reorder level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Low Stock
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              <p className="text-xs text-gray-600 mt-1">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Inventory worth</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="detergents">Detergents</SelectItem>
                  <SelectItem value="softeners">Softeners</SelectItem>
                  <SelectItem value="hangers">Hangers</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="stain_removers">Stain Removers</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>

              {/* Stock Level Filter */}
              <div className="flex gap-2">
                <Button
                  variant={stockFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStockFilter('all')}
                  className="flex-1"
                >
                  All
                </Button>
                <Button
                  variant={stockFilter === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStockFilter('critical')}
                  className="flex-1"
                >
                  Critical
                </Button>
                <Button
                  variant={stockFilter === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStockFilter('low')}
                  className="flex-1"
                >
                  Low
                </Button>
                <Button
                  variant={stockFilter === 'good' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStockFilter('good')}
                  className="flex-1"
                >
                  Good
                </Button>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end text-sm text-gray-600">
                Showing {filteredItems.length} of {totalItems} items
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <LowStockAlerts items={filteredItems} />

        {/* Inventory Table */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">Loading inventory...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-semibold">No items found</p>
                <p className="text-sm mt-1">
                  {searchTerm || selectedCategory !== 'all' || stockFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first inventory item to get started'}
                </p>
                {!searchTerm && selectedCategory === 'all' && stockFilter === 'all' && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <InventoryTable items={filteredItems} />
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
