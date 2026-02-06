'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBranchById } from '@/lib/db/index';
import type { Branch } from '@/lib/db/schema';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchHeader } from '@/components/branches/BranchHeader';
import { BranchOverview } from '@/components/branches/BranchOverview';
import { BranchInventory } from '@/components/branches/BranchInventory';
import { BranchTransfers } from '@/components/branches/BranchTransfers';
import { BranchStaff } from '@/components/branches/BranchStaff';
import { BranchAudit } from '@/components/branches/BranchAudit';
import { DirectorStatsGrid } from '@/components/features/director/DirectorStatsGrid';
import { useAuth } from '@/contexts/AuthContext';

export default function DirectorBranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  const branchId = params.branchId as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has director access
  const hasAccess = userData?.role === 'director' || userData?.role === 'admin';

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

    if (branchId) {
      loadBranch();
    }
  }, [branchId]);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            You do not have permission to access this page. Director or Admin role required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/director/branches')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Branches
        </Button>
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error || 'Branch not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/director/branches')}
        className="mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to All Branches
      </Button>

      {/* Branch Header */}
      <BranchHeader branch={branch} />

      {/* Interactive Stats Grid - Director Version with Drill-Down */}
      <DirectorStatsGrid branchId={branchId} />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
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
