/**
 * Inventory Management Page
 *
 * Modern inventory management with glassmorphic design and animations.
 * Features stock tracking, alerts, and comprehensive item management.
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  DollarSign,
  Plus,
  Search,
  Loader2,
  BoxesIcon,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InventoryTable } from '@/components/features/inventory/InventoryTable';
import { AddItemModal } from '@/components/features/inventory/AddItemModal';
import { LowStockAlerts } from '@/components/features/inventory/LowStockAlerts';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernButton } from '@/components/modern/ModernButton';
import { ModernBadge } from '@/components/modern/ModernBadge';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expiryDate?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastRestocked?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedAt?: any;
}

export default function InventoryPage() {
  const { userData } = useAuth();
  const _queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'low' | 'good'>('all');

  // Fetch inventory items
  const { data: inventory = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory', userData?.branchId],
    queryFn: async () => {
      if (!userData?.branchId) return [];

      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef,
        where('branchId', '==', userData.branchId),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
    },
    enabled: !!userData?.branchId,
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
    <ModernSection animate className="min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="p-3 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/10"
            >
              <BoxesIcon className="h-6 w-6 text-brand-blue" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-sm text-gray-600">
                Track and manage your inventory items
              </p>
            </div>
          </div>
          <ModernButton
            onClick={() => setShowAddModal(true)}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Item
          </ModernButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Total Items"
            value={totalItems}
            icon={<Package className="h-5 w-5" />}
            changeLabel="In inventory"
            delay={0.1}
          />

          <ModernStatCard
            title="Critical Stock"
            value={criticalItems}
            icon={<AlertTriangle className="h-5 w-5" />}
            changeLabel="Below reorder level"
            trend={criticalItems > 0 ? 'down' : 'neutral'}
            delay={0.2}
            variant={criticalItems > 0 ? 'default' : 'gradient'}
          />

          <ModernStatCard
            title="Low Stock"
            value={lowStockItems}
            icon={<AlertCircle className="h-5 w-5" />}
            changeLabel="Needs attention"
            trend={lowStockItems > 5 ? 'down' : 'neutral'}
            delay={0.3}
          />

          <ModernStatCard
            title="Total Value"
            value={totalValue}
            format="currency"
            icon={<DollarSign className="h-5 w-5" />}
            changeLabel="Inventory worth"
            delay={0.4}
            variant="solid"
          />
        </div>

      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ModernCard className="mb-6">
          <ModernCardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-brand-blue" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {(searchTerm || selectedCategory !== 'all' || stockFilter !== 'all') && (
                <ModernBadge variant="primary" size="sm">
                  Active
                </ModernBadge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-blue/60 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-brand-blue/20 focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/50 border-brand-blue/20 focus:border-brand-blue">
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
                <ModernButton
                  variant={stockFilter === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStockFilter('all')}
                  className="flex-1"
                >
                  All
                </ModernButton>
                <ModernButton
                  variant={stockFilter === 'critical' ? 'danger' : 'ghost'}
                  size="sm"
                  onClick={() => setStockFilter('critical')}
                  className="flex-1"
                >
                  Critical
                </ModernButton>
                <ModernButton
                  variant={stockFilter === 'low' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setStockFilter('low')}
                  className="flex-1"
                >
                  Low
                </ModernButton>
                <ModernButton
                  variant={stockFilter === 'good' ? 'success' : 'ghost'}
                  size="sm"
                  onClick={() => setStockFilter('good')}
                  className="flex-1"
                >
                  Good
                </ModernButton>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end">
                <ModernBadge variant="secondary" gradient>
                  {filteredItems.length} of {totalItems} items
                </ModernBadge>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </motion.div>

      {/* Low Stock Alerts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <LowStockAlerts items={filteredItems} />
      </motion.div>

      {/* Inventory Table */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModernCard hover glowIntensity="low">
              <ModernCardContent className="py-12">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-8 h-8 mx-auto text-brand-blue" />
                  </motion.div>
                  <p className="text-sm text-gray-600 mt-2">Loading inventory...</p>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ModernCard hover glowIntensity="medium">
              <ModernCardContent className="py-12">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Package className="w-12 h-12 mx-auto mb-3 text-brand-blue/50" />
                  </motion.div>
                  <p className="font-semibold text-gray-900">No items found</p>
                  <p className="text-sm mt-1 text-gray-600">
                    {searchTerm || selectedCategory !== 'all' || stockFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Add your first inventory item to get started'}
                  </p>
                  {!searchTerm && selectedCategory === 'all' && stockFilter === 'all' && (
                    <ModernButton
                      onClick={() => setShowAddModal(true)}
                      variant="primary"
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="mt-4"
                    >
                      Add Item
                    </ModernButton>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.7 }}
          >
            <ModernCard hover glowIntensity="low">
              <ModernCardContent className="p-0">
                <InventoryTable items={filteredItems} />
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AddItemModal open={showAddModal} onOpenChange={setShowAddModal} />
    </ModernSection>
  );
}
