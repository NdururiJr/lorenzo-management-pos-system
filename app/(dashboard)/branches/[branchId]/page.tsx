'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/ui/page-container';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BranchDetailContent } from '@/components/branches/BranchDetailContent';

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userData, isSuperAdmin, canAccessBranch, loading: authLoading } = useAuth();
  const branchId = params.branchId as string;

  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!authLoading && userData) {
      // Check if user can access this branch
      const hasAccess = isSuperAdmin || canAccessBranch(branchId);

      if (!hasAccess) {
        // Redirect to branches page if access denied
        router.push('/branches');
        return;
      }

      setCheckingAccess(false);
    } else if (!authLoading && !userData) {
      // Not authenticated
      router.push('/login');
    }
  }, [authLoading, userData, isSuperAdmin, canAccessBranch, branchId, router]);

  if (authLoading || checkingAccess) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="large" />
        </div>
      </PageContainer>
    );
  }

  return <BranchDetailContent branchId={branchId} />;
}
