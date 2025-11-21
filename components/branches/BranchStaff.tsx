'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Mail, Phone, Edit } from 'lucide-react';
import { getDocuments } from '@/lib/db/index';
import type { User, UserRole } from '@/lib/db/schema';
import { where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface BranchStaffProps {
  branchId: string;
}

function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'director':
      return 'bg-indigo-100 text-indigo-700';
    case 'general_manager':
      return 'bg-blue-100 text-blue-700';
    case 'store_manager':
      return 'bg-green-100 text-green-700';
    case 'workstation_manager':
      return 'bg-teal-100 text-teal-700';
    case 'workstation_staff':
      return 'bg-cyan-100 text-cyan-700';
    case 'satellite_staff':
      return 'bg-sky-100 text-sky-700';
    case 'front_desk':
      return 'bg-amber-100 text-amber-700';
    case 'driver':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatRole(role: UserRole): string {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function BranchStaff({ branchId }: BranchStaffProps) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;

  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStaff() {
      try {
        setLoading(true);

        // Get staff assigned to this branch
        const branchStaff = await getDocuments<User>(
          'users',
          where('branchId', '==', branchId),
          where('active', '==', true)
        );

        // Sort by role hierarchy
        const sorted = branchStaff.sort((a, b) => {
          const roleOrder = [
            'director',
            'general_manager',
            'store_manager',
            'workstation_manager',
            'admin',
            'front_desk',
            'workstation_staff',
            'satellite_staff',
            'driver',
          ];
          return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
        });

        setStaff(sorted);
      } catch (error) {
        console.error('Error loading staff:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStaff();
  }, [branchId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <LoadingSkeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <LoadingSkeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Branch Staff
          {staff.length > 0 && <Badge variant="secondary">{staff.length}</Badge>}
        </CardTitle>
        {canManage && (
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Manage Staff
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <EmptyState
            icon={Users}
            heading="No staff assigned"
            description="Staff members assigned to this branch will appear here"
          />
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <div
                key={member.uid}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-black truncate">
                      {member.name}
                    </p>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {formatRole(member.role)}
                    </Badge>
                    {!member.active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {member.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="ml-4">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
