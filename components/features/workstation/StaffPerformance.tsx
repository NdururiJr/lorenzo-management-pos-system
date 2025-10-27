/**
 * Staff Performance Component
 *
 * Displays performance metrics for workstation staff members.
 * Shows efficiency scores, orders processed, average time per stage, etc.
 *
 * @module components/features/workstation/StaffPerformance
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Award, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getDocuments } from '@/lib/db/index';
import { where } from 'firebase/firestore';
import { getStaffPerformanceMetrics } from '@/lib/db/workstation';
import type { User } from '@/lib/db/schema';

const STAGES = [
  { value: 'inspection', label: 'Inspection' },
  { value: 'washing', label: 'Washing' },
  { value: 'drying', label: 'Drying' },
  { value: 'ironing', label: 'Ironing' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'packaging', label: 'Packaging' },
];

export function StaffPerformance() {
  const { userData } = useAuth();
  const [selectedStaff, setSelectedStaff] = useState<string>('');

  // Check if user is manager
  const isManager =
    userData?.role === 'workstation_manager' ||
    userData?.role === 'store_manager' ||
    userData?.role === 'director' ||
    userData?.role === 'general_manager';

  // Fetch workstation staff at this branch
  const { data: workstationStaff = [] } = useQuery({
    queryKey: ['workstation-staff', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getDocuments<User>(
        'users',
        where('branchId', '==', userData.branchId),
        where('role', '==', 'workstation_staff')
      );
    },
    enabled: !!userData?.branchId,
  });

  // Fetch performance metrics for selected staff
  const { data: performanceMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['staff-performance', selectedStaff],
    queryFn: () => {
      if (!selectedStaff) return null;
      return getStaffPerformanceMetrics(selectedStaff);
    },
    enabled: !!selectedStaff,
  });

  if (!isManager) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Only Workstation Managers can view staff performance metrics.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getEfficiencyLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <BarChart3 className="w-4 h-4" />
        <AlertDescription>
          <strong>Staff Performance:</strong> View individual staff member performance metrics
          including efficiency scores, orders processed, and average time per stage.
        </AlertDescription>
      </Alert>

      {/* Staff Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Staff Member
          </CardTitle>
          <CardDescription>Choose a staff member to view their performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {workstationStaff.length === 0 ? (
            <Alert>
              <AlertDescription>
                No workstation staff found at this branch. Performance metrics will appear here once
                staff members are added.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="staff-select">Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger id="staff-select">
                  <SelectValue placeholder="Choose a staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {workstationStaff.map((staff) => (
                    <SelectItem key={staff.uid} value={staff.uid}>
                      {staff.name || staff.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoadingMetrics && selectedStaff && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {!isLoadingMetrics && performanceMetrics && selectedStaff && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Efficiency Score */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-3xl font-bold text-black">
                        {performanceMetrics.efficiencyScore}
                      </p>
                      <Badge
                        className={`${getEfficiencyColor(performanceMetrics.efficiencyScore)} border`}
                      >
                        {getEfficiencyLabel(performanceMetrics.efficiencyScore)}
                      </Badge>
                    </div>
                  </div>
                  <Award className="w-10 h-10 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            {/* Total Orders Processed */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Orders Processed</p>
                    <p className="text-3xl font-bold text-black mt-2">
                      {performanceMetrics.totalOrdersProcessed}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* Total Stages Completed */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stages Completed</p>
                    <p className="text-3xl font-bold text-black mt-2">
                      {Object.values(performanceMetrics.stagesCompleted).reduce(
                        (sum, count) => sum + count,
                        0
                      )}
                    </p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Average Time Per Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Average Time Per Stage
              </CardTitle>
              <CardDescription>
                Average processing time for each stage this staff member has worked on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(performanceMetrics.avgTimePerStage).length === 0 ? (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200">
                  No stage processing data available yet
                </div>
              ) : (
                <div className="space-y-3">
                  {STAGES.map((stage) => {
                    const avgTime = performanceMetrics.avgTimePerStage[stage.value];
                    if (avgTime === undefined) return null;

                    return (
                      <div
                        key={stage.value}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <div className="font-medium text-black">{stage.label}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {performanceMetrics.stagesCompleted[stage.value] || 0} garments
                            completed
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-lg font-semibold text-black">
                            {formatDuration(avgTime)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stages Completed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Stages Completed Breakdown
              </CardTitle>
              <CardDescription>
                Number of garments processed at each stage by this staff member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(performanceMetrics.stagesCompleted).length === 0 ? (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200">
                  No stage completion data available yet
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STAGES.map((stage) => {
                    const count = performanceMetrics.stagesCompleted[stage.value];
                    if (!count) return null;

                    return (
                      <div
                        key={stage.value}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                      >
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {stage.label}
                        </div>
                        <div className="text-2xl font-bold text-black">{count}</div>
                        <div className="text-xs text-gray-600 mt-1">garments</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {performanceMetrics.efficiencyScore >= 90 && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    <strong>Excellent Performance!</strong> This staff member consistently delivers
                    high-quality work efficiently.
                  </AlertDescription>
                </Alert>
              )}

              {performanceMetrics.efficiencyScore >= 75 &&
                performanceMetrics.efficiencyScore < 90 && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      <strong>Good Performance.</strong> This staff member is performing well and
                      meeting expectations.
                    </AlertDescription>
                  </Alert>
                )}

              {performanceMetrics.efficiencyScore < 60 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertDescription className="text-amber-800">
                    <strong>Needs Attention.</strong> Consider providing additional training or
                    support to improve efficiency.
                  </AlertDescription>
                </Alert>
              )}

              {performanceMetrics.totalOrdersProcessed === 0 && (
                <Alert>
                  <AlertDescription>
                    This staff member has not processed any orders yet. Metrics will appear once
                    they begin working on orders.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* No Staff Selected */}
      {!selectedStaff && workstationStaff.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-sm">Select a staff member to view their performance metrics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
