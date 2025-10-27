/**
 * Quality Check Station Component
 *
 * Interface for quality check staff to inspect and approve garments.
 * Quality check is handled per-order, not in batches.
 *
 * @module components/features/workstation/stages/QualityCheckStation
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Eye, Inbox, CheckCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getOrdersByBranchAndStatus } from '@/lib/db/orders';
import { completeStageForGarment } from '@/lib/db/workstation';
import { updateOrderStatus } from '@/lib/db/orders';
import { Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/db/schema';
import { format } from 'date-fns';

export function QualityCheckStation() {
  const { user, userData } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [processingGarments, setProcessingGarments] = useState<Set<string>>(new Set());

  // Fetch orders at quality_check stage
  const { data: qualityCheckOrders = [], refetch, isLoading } = useQuery({
    queryKey: ['quality-check-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'quality_check');
    },
    enabled: !!userData?.branchId,
  });

  const handleToggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCompleteGarment = async (order: Order, garmentId: string) => {
    if (!user || !userData) {
      toast.error('User not authenticated');
      return;
    }

    const processingKey = `${order.orderId}-${garmentId}`;
    setProcessingGarments((prev) => new Set(prev).add(processingKey));

    try {
      // Record start time for this garment
      const startTime = Timestamp.now();

      // Mark garment as complete for quality_check stage
      await completeStageForGarment(
        order.orderId,
        garmentId,
        'quality_check',
        user.uid,
        userData.name || user.email || 'Unknown',
        startTime
      );

      // Check if all garments in order are complete for quality check
      const garment = order.garments.find((g) => g.garmentId === garmentId);
      const allComplete = order.garments.every((g) => {
        if (g.garmentId === garmentId) return true; // Current garment we just completed
        return g.stageHandlers?.quality_check && g.stageHandlers.quality_check.length > 0;
      });

      if (allComplete) {
        // Move order to packaging stage
        await updateOrderStatus(order.orderId, 'packaging', user.uid);
        toast.success(`Order ${order.orderId} quality check complete! Moved to packaging.`);
      } else {
        toast.success('Garment quality check complete');
      }

      refetch();
    } catch (error) {
      console.error('Error completing garment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete garment');
    } finally {
      setProcessingGarments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(processingKey);
        return newSet;
      });
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
        <Eye className="w-4 h-4" />
        <AlertDescription>
          <strong>Quality Check Station:</strong> Inspect each garment to ensure it meets quality
          standards. Check for proper cleaning, pressing, and any remaining issues. When all
          garments in an order pass quality check, the order will automatically move to packaging.
        </AlertDescription>
      </Alert>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Quality Check Queue ({qualityCheckOrders.length})
          </CardTitle>
          <CardDescription>Orders ready for quality inspection</CardDescription>
        </CardHeader>
        <CardContent>
          {qualityCheckOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Inbox className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-sm">No orders at quality check stage</p>
            </div>
          ) : (
            <div className="space-y-4">
              {qualityCheckOrders.map((order) => {
                const completedCount = order.garments.filter(
                  (g) => g.stageHandlers?.quality_check && g.stageHandlers.quality_check.length > 0
                ).length;
                const totalCount = order.garments.length;

                return (
                  <div key={order.orderId} className="border rounded-lg">
                    {/* Order Header */}
                    <button
                      onClick={() => handleToggleOrder(order.orderId)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="font-semibold text-black">{order.orderId}</div>
                          <div className="text-sm text-gray-600">
                            {order.customerName} • {totalCount} garment
                            {totalCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            completedCount === totalCount
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }
                        >
                          {completedCount}/{totalCount} Checked
                        </Badge>
                        {expandedOrder === order.orderId ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedOrder === order.orderId && (
                      <div className="p-4 pt-0 space-y-3">
                        <Separator />

                        {/* Garments Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {order.garments.map((garment) => {
                            const isComplete =
                              garment.stageHandlers?.quality_check &&
                              garment.stageHandlers.quality_check.length > 0;
                            const processingKey = `${order.orderId}-${garment.garmentId}`;
                            const isProcessing = processingGarments.has(processingKey);
                            const hasIssues =
                              garment.conditionAssessment === 'major_issues' ||
                              garment.conditionAssessment === 'minor_issues';

                            return (
                              <div
                                key={garment.garmentId}
                                className={`p-4 rounded-lg border ${
                                  isComplete
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="font-medium text-black">
                                      {garment.type} - {garment.color}
                                    </div>
                                    {garment.brand && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {garment.brand}
                                      </div>
                                    )}
                                  </div>
                                  {isComplete && (
                                    <Badge className="bg-green-600 text-white">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Passed
                                    </Badge>
                                  )}
                                </div>

                                {/* Inspection Info */}
                                {garment.inspectionCompleted && (
                                  <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                                    <div className="text-xs font-medium text-blue-900 mb-1">
                                      Inspection Notes:
                                    </div>
                                    <div className="text-xs text-blue-800">
                                      Condition: {garment.conditionAssessment?.replace('_', ' ')}
                                      {garment.missingButtonsCount && garment.missingButtonsCount > 0 && (
                                        <div className="mt-1">
                                          Missing buttons: {garment.missingButtonsCount}
                                        </div>
                                      )}
                                      {garment.stainDetails && garment.stainDetails.length > 0 && (
                                        <div className="mt-1">
                                          Stains: {garment.stainDetails.length} noted
                                        </div>
                                      )}
                                      {garment.ripDetails && garment.ripDetails.length > 0 && (
                                        <div className="mt-1">
                                          Rips: {garment.ripDetails.length} noted
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Issue Warning */}
                                {hasIssues && !isComplete && (
                                  <Alert variant="destructive" className="mb-3">
                                    <AlertTriangle className="w-4 h-4" />
                                    <AlertDescription className="text-xs">
                                      This garment had issues during inspection. Verify all issues
                                      have been addressed before approving.
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {/* Services */}
                                <div className="text-xs text-gray-600 mb-3">
                                  <div className="font-medium mb-1">Services:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {garment.services.map((service, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs bg-gray-50"
                                      >
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* Completion Info */}
                                {isComplete && garment.stageHandlers?.quality_check?.[0] && (
                                  <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-green-200">
                                    <div>
                                      Approved by: {garment.stageHandlers.quality_check[0].name}
                                    </div>
                                    <div>
                                      {format(
                                        garment.stageHandlers.quality_check[0].completedAt.toDate(),
                                        'MMM d, h:mm a'
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Complete Button */}
                                {!isComplete && (
                                  <Button
                                    onClick={() => handleCompleteGarment(order, garment.garmentId)}
                                    disabled={isProcessing}
                                    className="w-full mt-3 bg-green-600 text-white hover:bg-green-700"
                                    size="sm"
                                  >
                                    {isProcessing ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Approving...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Pass Quality Check
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
