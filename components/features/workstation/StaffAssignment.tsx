/**
 * Staff Assignment Component
 *
 * Allows workstation managers to assign staff to specific processing stages.
 * Staff can be assigned permanently to a stage (washing, drying, ironing, etc.)
 *
 * @module components/features/workstation/StaffAssignment
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Loader2, UserPlus, X, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getDocuments } from '@/lib/db/index';
import { where } from 'firebase/firestore';
import { assignStaffToPermanentStage, getActiveStaffAssignments } from '@/lib/db/workstation';
import { updateDocument } from '@/lib/db/index';
import type { User, WorkstationAssignment } from '@/lib/db/schema';

type Stage = 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging';

const STAGES: { value: Stage; label: string; color: string }[] = [
  { value: 'inspection', label: 'Inspection', color: 'bg-amber-100 text-amber-700' },
  { value: 'washing', label: 'Washing', color: 'bg-blue-100 text-blue-700' },
  { value: 'drying', label: 'Drying', color: 'bg-orange-100 text-orange-700' },
  { value: 'ironing', label: 'Ironing', color: 'bg-purple-100 text-purple-700' },
  { value: 'quality_check', label: 'Quality Check', color: 'bg-green-100 text-green-700' },
  { value: 'packaging', label: 'Packaging', color: 'bg-indigo-100 text-indigo-700' },
];

export function StaffAssignment() {
  const { user, userData } = useAuth();
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<Stage>('washing');
  const [isAssigning, setIsAssigning] = useState(false);

  // Check if user is manager
  const isManager =
    userData?.role === 'workstation_manager' ||
    userData?.role === 'store_manager' ||
    userData?.role === 'director' ||
    userData?.role === 'general_manager';

  // Fetch workstation staff at this branch
  const { data: workstationStaff = [], refetch: refetchStaff } = useQuery({
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

  // Fetch active staff assignments
  const { data: assignments = [], refetch: refetchAssignments, isLoading } = useQuery({
    queryKey: ['staff-assignments', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getActiveStaffAssignments(userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  const handleAssignStaff = async () => {
    if (!selectedStaff || !user || !userData?.branchId) {
      toast.error('Please select a staff member');
      return;
    }

    const staff = workstationStaff.find((s) => s.uid === selectedStaff);
    if (!staff) {
      toast.error('Staff member not found');
      return;
    }

    // Check if staff already assigned to this stage
    const existingAssignment = assignments.find(
      (a) => a.staffId === selectedStaff && a.permanentStage === selectedStage
    );

    if (existingAssignment) {
      toast.error(`${staff.name} is already assigned to ${selectedStage}`);
      return;
    }

    setIsAssigning(true);

    try {
      await assignStaffToPermanentStage(
        selectedStaff,
        staff.name || staff.email,
        selectedStage,
        userData.branchId,
        user.uid
      );

      toast.success(`${staff.name} assigned to ${selectedStage} stage`);
      setSelectedStaff('');
      refetchAssignments();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign staff');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string, staffName: string, stage: string) => {
    if (!window.confirm(`Remove ${staffName} from ${stage} stage?`)) {
      return;
    }

    try {
      await updateDocument<WorkstationAssignment>('workstationAssignments', assignmentId, {
        isActive: false,
      });

      toast.success(`${staffName} removed from ${stage}`);
      refetchAssignments();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove assignment');
    }
  };

  if (!isManager) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Only Workstation Managers can manage staff assignments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Group assignments by stage
  const assignmentsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.value] = assignments.filter((a) => a.permanentStage === stage.value);
    return acc;
  }, {} as Record<Stage, WorkstationAssignment[]>);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Settings className="w-4 h-4" />
        <AlertDescription>
          <strong>Staff Assignment:</strong> Assign workstation staff to specific processing stages.
          Staff will be able to view and process orders at their assigned stages.
        </AlertDescription>
      </Alert>

      {/* Assign New Staff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Staff to Stage
          </CardTitle>
          <CardDescription>Select a staff member and assign them to a processing stage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workstationStaff.length === 0 ? (
            <Alert>
              <AlertDescription>
                No workstation staff found at this branch. Please create workstation staff accounts
                first.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Staff Selection */}
              <div className="space-y-2">
                <Label htmlFor="staff">Select Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger id="staff">
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

              {/* Stage Selection */}
              <div className="space-y-2">
                <Label htmlFor="stage">Select Processing Stage</Label>
                <Select value={selectedStage} onValueChange={(value: Stage) => setSelectedStage(value)}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assign Button */}
              <Button
                onClick={handleAssignStaff}
                disabled={!selectedStaff || isAssigning}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign to {STAGES.find((s) => s.value === selectedStage)?.label}
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Staff Assignments
          </CardTitle>
          <CardDescription>View and manage staff assigned to each stage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {STAGES.map((stage) => {
            const stageAssignments = assignmentsByStage[stage.value] || [];

            return (
              <div key={stage.value}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${stage.color} border-0`}>{stage.label}</Badge>
                    <span className="text-sm text-gray-600">
                      ({stageAssignments.length} staff assigned)
                    </span>
                  </div>
                </div>

                {stageAssignments.length === 0 ? (
                  <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
                    No staff assigned to this stage
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stageAssignments.map((assignment) => (
                      <div
                        key={assignment.assignmentId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-black">{assignment.staffName}</div>
                          <div className="text-xs text-gray-500">
                            Assigned on{' '}
                            {new Date(assignment.createdAt.toDate()).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRemoveAssignment(
                              assignment.assignmentId,
                              assignment.staffName,
                              stage.label
                            )
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {stage.value !== 'packaging' && <Separator className="mt-6" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
