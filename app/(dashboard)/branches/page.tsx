'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getActiveBranches } from '@/lib/db/index';
import { useAuth } from '@/contexts/AuthContext';
import type { Branch } from '@/lib/db/schema';
import Link from 'next/link';

export default function BranchesPage() {
  const { isSuperAdmin, allowedBranches } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranches() {
      try {
        setLoading(true);
        const allBranches = await getActiveBranches();

        // Filter branches based on access
        const accessibleBranches = isSuperAdmin
          ? allBranches
          : allBranches.filter((branch) =>
              allowedBranches?.includes(branch.branchId)
            );

        setBranches(accessibleBranches);
      } catch (error) {
        console.error('Error loading branches:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, [isSuperAdmin, allowedBranches]);

  return (
    <PageContainer>
      <SectionHeader
        title="Branch Management"
        description="Manage store locations and settings"
        action={
          !loading && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {branches.length} Location{branches.length !== 1 ? 's' : ''}
            </Badge>
          )
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <LoadingSkeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <LoadingSkeleton className="h-4 w-32 mb-2" />
                <LoadingSkeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : branches.length === 0 ? (
        <EmptyState
          icon={Store}
          heading="No branches available"
          description="You don't have access to any branches or no branches exist in the system"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Link key={branch.branchId} href={`/branches/${branch.branchId}`}>
              <Card className="hover:shadow-md hover:border-gray-300 transition-all cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Store className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                      <span className="truncate">{branch.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {branch.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{branch.contactPhone}</span>
                    </div>
                  )}
                  {branch.location?.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{branch.location.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Badge
                      variant={branch.active ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {branch.active ? 'Active' : 'Inactive'}
                    </Badge>
                    {branch.branchType && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {branch.branchType}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
