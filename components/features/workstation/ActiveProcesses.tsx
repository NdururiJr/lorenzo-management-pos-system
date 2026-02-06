/**
 * Active Processes Component
 *
 * Displays and manages active processing batches.
 * Allows starting batches and completing batches.
 *
 * @module components/features/workstation/ActiveProcesses
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Activity, Loader2, Inbox, Play, CheckCircle, Users, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getProcessingBatchesByStatus,
  startProcessingBatch,
  completeProcessingBatch,
} from '@/lib/db/processing-batches';
import type { ProcessingBatch } from '@/lib/db/schema';
import { format } from 'date-fns';

export function ActiveProcesses() {
  const { user, userData } = useAuth();
  const [startingBatch, setStartingBatch] = useState<string | null>(null);
  const [completingBatch, setCompletingBatch] = useState<string | null>(null);

  // Fetch pending batches
  const { data: pendingBatches = [], refetch: refetchPending } = useQuery({
    queryKey: ['pending-batches', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getProcessingBatchesByStatus('pending', userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  // Fetch in-progress batches
  const { data: inProgressBatches = [], refetch: refetchInProgress } = useQuery({
    queryKey: ['in-progress-batches', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getProcessingBatchesByStatus('in_progress', userData.branchId);
    },
    enabled: !!userData?.branchId,
  });

  const handleStartBatch = async (batchId: string) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setStartingBatch(batchId);

    try {
      await startProcessingBatch(batchId, user.uid);
      toast.success(`Batch ${batchId} started! Orders moved to processing.`);
      refetchPending();
      refetchInProgress();
    } catch (error) {
      console.error('Error starting batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start batch');
    } finally {
      setStartingBatch(null);
    }
  };

  const handleCompleteBatch = async (batchId: string) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setCompletingBatch(batchId);

    try {
      await completeProcessingBatch(batchId, user.uid);
      toast.success(`Batch ${batchId} completed! Orders moved to next stage.`);
      refetchInProgress();
    } catch (error) {
      console.error('Error completing batch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete batch');
    } finally {
      setCompletingBatch(null);
    }
  };

  const renderBatchCard = (batch: ProcessingBatch, showActions: boolean) => {
    const isStarting = startingBatch === batch.batchId;
    const isCompleting = completingBatch === batch.batchId;

    return (
      <Card key={batch.batchId} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-black text-lg">{batch.batchId}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {batch.stage.charAt(0).toUpperCase() + batch.stage.slice(1)} Stage
                </p>
              </div>
              <Badge
                className={
                  batch.status === 'pending'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }
              >
                {batch.status === 'pending' ? 'Pending Start' : 'In Progress'}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {batch.orderIds.length} order{batch.orderIds.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{batch.garmentCount} garments</span>
              </div>
            </div>

            {/* Assigned Staff */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {batch.assignedStaffIds.length} staff member
                {batch.assignedStaffIds.length !== 1 ? 's' : ''} assigned
              </span>
            </div>

            {/* Timestamps */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Created: {format(batch.createdAt.toDate(), 'MMM d, yyyy h:mm a')}</div>
              {batch.startedAt && (
                <div>Started: {format(batch.startedAt.toDate(), 'MMM d, yyyy h:mm a')}</div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <>
                <Separator />
                <div className="flex gap-2">
                  {batch.status === 'pending' && (
                    <Button
                      onClick={() => handleStartBatch(batch.batchId)}
                      disabled={isStarting}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Batch
                        </>
                      )}
                    </Button>
                  )}
                  {batch.status === 'in_progress' && (
                    <Button
                      onClick={() => handleCompleteBatch(batch.batchId)}
                      disabled={isCompleting}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Batch
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Processing Batches
          </CardTitle>
          <CardDescription>
            Monitor and manage batches currently in processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="in_progress">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="in_progress">
                In Progress ({inProgressBatches.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Start ({pendingBatches.length})
              </TabsTrigger>
            </TabsList>

            {/* In Progress Batches */}
            <TabsContent value="in_progress" className="space-y-4 mt-6">
              {inProgressBatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-sm">No batches in progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inProgressBatches.map((batch) => renderBatchCard(batch, true))}
                </div>
              )}
            </TabsContent>

            {/* Pending Batches */}
            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingBatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-sm">No pending batches</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Create batches in the Queue Management tab
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBatches.map((batch) => renderBatchCard(batch, true))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
