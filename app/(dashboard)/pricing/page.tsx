'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { getPricingByBranch, getActivePricing } from '@/lib/db/pricing';
import type { Pricing } from '@/lib/db/schema';
import { Plus, RefreshCw, Edit, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AddPricingModal } from '@/components/features/pricing/AddPricingModal';

export default function PricingPage() {
  const router = useRouter();
  const { userData, isAdmin } = useAuth();

  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState<Pricing | null>(null);

  // Page guard - only super admins can access
  const isSuperAdmin = userData?.isSuperAdmin || false;

  // Define hooks BEFORE any conditional returns
  const fetchPricing = useCallback(async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      let fetchedPricing: Pricing[] = [];

      if (userData.branchId) {
        fetchedPricing = await getPricingByBranch(userData.branchId);
      } else if (isAdmin) {
        // If admin without branch, show all active pricing or maybe a selector later
        fetchedPricing = await getActivePricing();
      }

      setPricing(fetchedPricing);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, isAdmin]);

  useEffect(() => {
    if (userData && !isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [userData, isSuperAdmin, router]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // If not super admin, show access denied message
  if (userData && !isSuperAdmin) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Lock className="w-16 h-16 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 text-center max-w-md">
            Pricing management is restricted to super administrators only.
            Please contact your system administrator if you need access.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </PageContainer>
    );
  }

  const columns: DataTableColumn<Pricing>[] = [
    {
      header: 'Garment Type',
      accessor: (item) => (
        <span className="font-medium">{item.garmentType}</span>
      ),
      sortable: true,
      sortKey: 'garmentType',
    },
    {
      header: 'Wash',
      accessor: (item) => formatCurrency(item.services.wash),
    },
    {
      header: 'Dry Clean',
      accessor: (item) => formatCurrency(item.services.dryClean),
    },
    {
      header: 'Iron',
      accessor: (item) => formatCurrency(item.services.iron),
    },
    {
      header: 'Starch',
      accessor: (item) => formatCurrency(item.services.starch),
    },
    {
      header: 'Express',
      accessor: () => 'FREE',
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditingPricing(item);
            setShowAddModal(true);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Pricing"
        description="Manage service prices for garment types"
        action={
          <Button
            onClick={() => {
              setEditingPricing(null);
              setShowAddModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={fetchPricing} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={pricing}
          isLoading={isLoading}
          pagination={{
            currentPage: 1,
            pageSize: 50,
            totalItems: pricing.length,
            onPageChange: () => {},
          }}
          emptyState={{
            icon: Edit,
            heading: 'No pricing found',
            description: 'Get started by adding pricing for garment types.',
            action: {
              label: 'Add Pricing',
              onClick: () => {
                setEditingPricing(null);
                setShowAddModal(true);
              },
            },
          }}
        />
      </div>

      {/* Add/Edit Pricing Modal */}
      <AddPricingModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) {
            setEditingPricing(null);
          }
        }}
        editPricing={editingPricing}
      />
    </PageContainer>
  );
}
