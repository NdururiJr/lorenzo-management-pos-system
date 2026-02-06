/**
 * Customer Service Page (FR-004)
 *
 * Dashboard page for Customer Service staff to manage QC handovers
 * and customer communications.
 *
 * @module app/(dashboard)/customer-service/page
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { HandoverQueue } from '@/components/features/customer-service/HandoverQueue';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Clock, CheckCircle, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';

/**
 * Fetch handover metrics
 */
async function fetchHandoverMetrics(branchId?: string) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const idToken = await currentUser.getIdToken();
  const params = new URLSearchParams();
  if (branchId) params.set('branchId', branchId);

  const response = await fetch(`/api/qc-handovers/metrics?${params}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) return null;
  const result = await response.json();
  return result.data;
}

export default function CustomerServicePage() {
  const { user, userData } = useAuth();

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['qc-handover-metrics', userData?.branchId],
    queryFn: () => fetchHandoverMetrics(userData?.branchId),
    enabled: !!user,
  });

  return (
    <PageContainer>
      <SectionHeader
        title="Customer Service"
        description="Manage customer communications and resolve QC handovers"
      />

      {/* Instructions Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          This page shows handovers from Quality Control that require customer communication.
          Acknowledge each handover, contact the customer using the suggested message, and
          document the resolution.
        </AlertDescription>
      </Alert>

      {/* Stats Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700">Pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-amber-700">
                  {metrics.pendingCount || 0}
                </span>
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700">In Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-700">
                  {metrics.inProgressCount || 0}
                </span>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700">Resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-700">
                  {metrics.resolvedCount || 0}
                </span>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-700">Avg Resolution Time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-700">
                  {metrics.avgTimeToResolve
                    ? `${metrics.avgTimeToResolve.toFixed(1)}h`
                    : '-'}
                </span>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Handover Queue */}
      <HandoverQueue branchId={userData?.branchId} />
    </PageContainer>
  );
}
