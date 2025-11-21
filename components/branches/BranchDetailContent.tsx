'use client';

import { useState, useEffect } from 'react';
import { getBranchById } from '@/lib/db/index';
import type { Branch } from '@/lib/db/schema';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchHeader } from './BranchHeader';
import { BranchStatsGrid } from './BranchStatsGrid';
import { BranchOverview } from './BranchOverview';
import { BranchInventory } from './BranchInventory';
import { BranchTransfers } from './BranchTransfers';
import { BranchStaff } from './BranchStaff';
import { BranchAudit } from './BranchAudit';

interface BranchDetailContentProps {
  branchId: string;
}

export function BranchDetailContent({ branchId }: BranchDetailContentProps) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranch() {
      try {
        setLoading(true);
        setError(null);
        const branchData = await getBranchById(branchId);
        setBranch(branchData);
      } catch (err) {
        console.error('Error loading branch:', err);
        setError('Failed to load branch details');
      } finally {
        setLoading(false);
      }
    }

    loadBranch();
  }, [branchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertDescription>
          {error || 'Branch not found'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <BranchHeader branch={branch} />

      <BranchStatsGrid branchId={branchId} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BranchOverview branchId={branchId} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <BranchInventory branchId={branchId} />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <BranchTransfers branchId={branchId} />
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <BranchStaff branchId={branchId} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <BranchAudit branchId={branchId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
