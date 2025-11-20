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
import { Plus, RefreshCw, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PricingPage() {
  const router = useRouter();
  const { user, userData, isAdmin } = useAuth();

  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchPricing();
  }, [fetchPricing]);

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
      header: 'Express (+%)',
      accessor: (item) => `${item.services.express}%`,
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement edit modal or page
            console.log('Edit pricing', item.pricingId);
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
          <Button onClick={() => console.log('Add pricing')}>
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
              onClick: () => console.log('Add pricing'),
            },
          }}
        />
      </div>
    </PageContainer>
  );
}
