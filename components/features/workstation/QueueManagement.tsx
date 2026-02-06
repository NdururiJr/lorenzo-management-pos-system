/**
 * Queue Management Component
 *
 * Allows workstation managers to create processing batches from queued orders.
 * Batches are used for washing and drying stages.
 *
 * @module components/features/workstation/QueueManagement
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Layers, Loader2, Inbox, Users, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getOrdersByBranchAndStatus } from '@/lib/db/orders';
import { createProcessingBatch } from '@/lib/db/processing-batches';
import { getStaffByStage } from '@/lib/db/workstation';
import type { ProcessingBatchStage } from '@/lib/db/schema';

export function QueueManagement() {
  const { user, userData } = useAuth();
  const [selectedStage, setSelectedStage] = useState<ProcessingBatchStage>('washing');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch queued orders
  const { data: queuedOrders = [], refetch, isLoading } = useQuery({
    queryKey: ['queued-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'queued');
    },
    enabled: !!userData?.branchId,
  });

  // Fetch staff for selected stage
  const { data: stageStaff = [] } = useQuery({
    queryKey: ['stage-staff', selectedStage, userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getStaffByStage(selectedStage, userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  const handleOrderToggle = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter((id) => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === queuedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(queuedOrders.map((o) => o.orderId));
    }
  };

  const handleStaffToggle = (staffId: string) => {
    if (selectedStaffIds.includes(staffId)) {
      setSelectedStaffIds(selectedStaffIds.filter((id) => id !== staffId));
    } else {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    }
  };

  const handleCreateBatch = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error('Please select at least one order');
      return;
    }

    if (selectedStaffIds.length === 0) {
      toast.error('Please assign at least one staff member');
      return;
    }

    if (!user || !userData?.branchId) {
      toast.error('User data not available');
      return;
    }

    setIsCreating(true);

    try {
      const batchId = await createProcessingBatch(
        selectedStage,
        selectedOrderIds,
        selectedStaffIds,
        userData.branchId,
        user.uid
      );

      toast.success(
        `Processing batch ${batchId} created with ${selectedOrderIds.length} order${
          selectedOrderIds.length !== 1 ? 's' : ''
        }`
      );

      // Reset form
      setSelectedOrderIds([]);
      setSelectedStaffIds([]);
      refetch();
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create batch');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <AlertDescription>
          Create processing batches for washing and drying stages. Select orders from the queue,
          choose the processing stage, assign staff, and create the batch. Orders will be grouped
          together for efficient processing.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Create Processing Batch
          </CardTitle>
          <CardDescription>
            Group queued orders into batches for washing or drying
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stage Selection */}
          <div className="space-y-2">
            <Label htmlFor="stage">Processing Stage</Label>
            <Select value={selectedStage} onValueChange={(value: ProcessingBatchStage) => setSelectedStage(value)}>
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="washing">Washing</SelectItem>
                <SelectItem value="drying">Drying</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Note: Ironing, Quality Check, and Packaging are handled individually, not in batches.
            </p>
          </div>

          <Separator />

          {/* Order Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Orders ({queuedOrders.length} available)</Label>
              {queuedOrders.length > 0 && (
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  {selectedOrderIds.length === queuedOrders.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {queuedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 border rounded-lg">
                <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-sm">No orders in queue</p>
                <p className="text-xs text-gray-400 mt-1">
                  Orders will appear here after inspection is completed
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {queuedOrders.map((order) => (
                  <label
                    key={order.orderId}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border"
                  >
                    <Checkbox
                      checked={selectedOrderIds.includes(order.orderId)}
                      onCheckedChange={() => handleOrderToggle(order.orderId)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-black">{order.orderId}</div>
                      <div className="text-sm text-gray-600">
                        {order.customerName} • {order.garments.length} garment
                        {order.garments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.garments.reduce((sum, _g) => sum + 1, 0)} items
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedOrderIds.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Package className="w-4 h-4" />
                  <span>
                    {selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Staff Assignment */}
          <div className="space-y-3">
            <Label>Assign Staff ({stageStaff.length} available)</Label>

            {stageStaff.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No staff assigned to {selectedStage} stage. Please assign staff in Staff Management
                  first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 border rounded-lg p-4">
                {stageStaff.map((staff) => (
                  <label
                    key={staff.uid}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border"
                  >
                    <Checkbox
                      checked={selectedStaffIds.includes(staff.uid)}
                      onCheckedChange={() => handleStaffToggle(staff.uid)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-black">{staff.name || staff.email}</div>
                      <div className="text-sm text-gray-600">
                        {staff.role === 'workstation_staff' ? 'Workstation Staff' : staff.role}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedStaffIds.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Users className="w-4 h-4" />
                  <span>
                    {selectedStaffIds.length} staff member{selectedStaffIds.length !== 1 ? 's' : ''} assigned
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Create Batch Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleCreateBatch}
              disabled={isCreating || selectedOrderIds.length === 0 || selectedStaffIds.length === 0}
              className="w-full bg-black text-white hover:bg-gray-800"
              size="lg"
            >
              {isCreating ? 'Creating Batch...' : `Create ${selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1)} Batch`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
