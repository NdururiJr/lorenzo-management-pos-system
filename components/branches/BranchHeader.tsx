'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Store, MapPin, Phone, Edit, Users, ArrowLeft } from 'lucide-react';
import type { Branch } from '@/lib/db/schema';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface BranchHeaderProps {
  branch: Branch;
}

export function BranchHeader({ branch }: BranchHeaderProps) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/branches">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-brand-blue/10 p-2 rounded-lg">
                  <Store className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-semibold text-black">{branch.name}</h1>
                    <Badge variant={branch.active ? 'default' : 'secondary'}>
                      {branch.active ? 'Active' : 'Inactive'}
                    </Badge>
                    {branch.branchType && (
                      <Badge variant="outline" className="capitalize">
                        {branch.branchType}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Branch ID: {branch.branchId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branch.location?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-sm text-gray-600">{branch.location.address}</p>
                    </div>
                  </div>
                )}

                {branch.contactPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact</p>
                      <p className="text-sm text-gray-600">{branch.contactPhone}</p>
                    </div>
                  </div>
                )}
              </div>

              {branch.branchType === 'satellite' && branch.mainStoreId && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Main Store:</span>
                  <span>{branch.mainStoreId}</span>
                </div>
              )}
            </div>

            {canManage && (
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Branch
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Staff
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
