/**
 * Washing Station Component
 *
 * Interface for washing staff to view and process washing batches.
 * Washing is handled in batches, not individually.
 *
 * @module components/features/workstation/stages/WashingStation
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Droplet, Inbox, Package, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getProcessingBatchesByStatus } from '@/lib/db/processing-batches';
import { format } from 'date-fns';

export function WashingStation() {
  const { userData } = useAuth();

  // Fetch washing batches assigned to current user
  const { data: myBatches = [], isLoading } = useQuery({
    queryKey: ['my-washing-batches', userData?.uid],
    queryFn: async () => {
      if (!userData?.branchId) return [];
      const allBatches = await getProcessingBatchesByStatus('in_progress', userData.branchId);
      // Filter to batches where user is assigned and stage is washing
      return allBatches.filter(
        (batch) =>
          batch.stage === 'washing' &&
          batch.assignedStaffIds.includes(userData.uid || '')
      );
    },
    enabled: !!userData?.uid && !!userData?.branchId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

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
        <Droplet className="w-4 h-4" />
        <AlertDescription>
          <strong>Washing Station:</strong> View your assigned washing batches. Washing is done in
          batches for efficiency. When a batch is complete, the Workstation Manager will mark it as
          complete in the Active Processes tab, which will automatically move all orders to the
          drying stage.
        </AlertDescription>
      </Alert>

      {/* My Batches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="w-5 h-5" />
            My Washing Batches ({myBatches.length})
          </CardTitle>
          <CardDescription>Batches currently assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {myBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Inbox className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-sm">No washing batches assigned to you</p>
              <p className="text-xs text-gray-400 mt-1">
                New batches will appear here when created by the manager
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBatches.map((batch) => (
                <div
                  key={batch.batchId}
                  className="border rounded-lg p-4 bg-blue-50 border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-black text-lg">{batch.batchId}</h3>
                      <p className="text-sm text-gray-600 mt-1">Washing Stage</p>
                    </div>
                    <Badge className="bg-blue-600 text-white">In Progress</Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">
                        {batch.orderIds.length} order{batch.orderIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{batch.garmentCount} garments</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">
                        {batch.assignedStaffIds.length} staff
                      </span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-gray-600 space-y-1 border-t border-blue-200 pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        Started: {format(batch.startedAt!.toDate(), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {batch.startedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          Duration:{' '}
                          {Math.floor(
                            (Date.now() - batch.startedAt.toMillis()) / 1000 / 60
                          )}{' '}
                          minutes
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order IDs Preview */}
                  <div className="mt-3 border-t border-blue-200 pt-3">
                    <div className="text-xs text-gray-600 mb-2">Orders in this batch:</div>
                    <div className="flex flex-wrap gap-2">
                      {batch.orderIds.slice(0, 5).map((orderId) => (
                        <Badge
                          key={orderId}
                          variant="outline"
                          className="text-xs bg-white border-blue-300"
                        >
                          {orderId}
                        </Badge>
                      ))}
                      {batch.orderIds.length > 5 && (
                        <Badge variant="outline" className="text-xs bg-white border-blue-300">
                          +{batch.orderIds.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-700">
                      <strong>Instructions:</strong> Process all garments in this batch together.
                      When complete, notify your manager to mark the batch as complete.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
