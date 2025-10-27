/**
 * Transfer Batch Form Component
 *
 * Form for creating a new transfer batch from satellite to main store.
 * Includes driver assignment (auto or manual).
 *
 * @module components/features/transfers/TransferBatchForm
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, MapPin, User, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createTransferBatch, assignDriverToTransferBatch } from '@/lib/db/transfers';
import { autoAssignDriver, getAvailableDrivers } from '@/lib/transfers/driver-assignment';
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/lib/db/index';
import { where } from 'firebase/firestore';
import type { User as UserType, Branch } from '@/lib/db/schema';

interface TransferBatchFormProps {
  satelliteBranchId: string;
  selectedOrderIds: string[];
  onCancel: () => void;
  onSuccess: (batchId: string) => void;
}

export function TransferBatchForm({
  satelliteBranchId,
  selectedOrderIds,
  onCancel,
  onSuccess,
}: TransferBatchFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'auto' | 'manual'>('auto');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  // Fetch main store branch
  const { data: mainStore } = useQuery({
    queryKey: ['main-store'],
    queryFn: async () => {
      const branches = await getDocuments<Branch>('branches', where('branchType', '==', 'main'));
      return branches[0] || null;
    },
  });

  // Fetch available drivers at satellite branch
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', satelliteBranchId],
    queryFn: () => getAvailableDrivers(satelliteBranchId),
    enabled: assignmentType === 'manual',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !mainStore) {
      toast.error('Missing required data');
      return;
    }

    if (assignmentType === 'manual' && !selectedDriverId) {
      toast.error('Please select a driver');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create transfer batch
      const batchId = await createTransferBatch(
        satelliteBranchId,
        mainStore.branchId,
        selectedOrderIds,
        user.uid
      );

      // Assign driver
      let driverId: string | null = null;

      if (assignmentType === 'auto') {
        driverId = await autoAssignDriver(satelliteBranchId, mainStore.branchId);
        if (!driverId) {
          toast.warning('No drivers available for auto-assignment. Please assign manually.');
        }
      } else {
        driverId = selectedDriverId;
      }

      if (driverId) {
        await assignDriverToTransferBatch(batchId, driverId);
        toast.success(`Transfer batch ${batchId} created and assigned to driver`);
      } else {
        toast.success(`Transfer batch ${batchId} created. Driver assignment pending.`);
      }

      onSuccess(batchId);
    } catch (error) {
      console.error('Error creating transfer batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create transfer batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mainStore) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>Loading main store information...</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Create Transfer Batch
        </CardTitle>
        <CardDescription>
          Create a batch to transfer {selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''} to main store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-black">From: Satellite Store</div>
                <div className="text-gray-500">{satelliteBranchId}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-black">To: Main Store</div>
                <div className="text-gray-500">{mainStore.branchId}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Package className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium text-black">Total Orders</div>
                <div className="text-gray-500">{selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          {/* Driver Assignment */}
          <div className="space-y-3">
            <Label>Driver Assignment</Label>
            <Select value={assignmentType} onValueChange={(value: 'auto' | 'manual') => setAssignmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-assign (Recommended)</SelectItem>
                <SelectItem value="manual">Manual assignment</SelectItem>
              </SelectContent>
            </Select>

            {assignmentType === 'auto' && (
              <Alert>
                <AlertDescription className="text-sm">
                  Driver will be automatically assigned based on availability and workload.
                </AlertDescription>
              </Alert>
            )}

            {assignmentType === 'manual' && (
              <div className="space-y-2">
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.uid} value={driver.uid}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {driver.name || driver.email}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {drivers.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No drivers available at this branch. Please add drivers first.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white hover:bg-gray-800">
              {isSubmitting ? 'Creating...' : 'Create Transfer Batch'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
