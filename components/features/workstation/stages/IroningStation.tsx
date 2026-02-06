/**
 * Ironing Station Component
 *
 * Interface for ironing staff to process individual orders.
 * Ironing is handled per-order, not in batches.
 *
 * @module components/features/workstation/stages/IroningStation
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Shirt, Inbox, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

export function IroningStation() {
  const { user, userData } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [processingGarments, setProcessingGarments] = useState<Set<string>>(new Set());

  // Fetch orders at ironing stage
  const { data: ironingOrders = [], refetch, isLoading } = useQuery({
    queryKey: ['ironing-orders', userData?.branchId],
    queryFn: () => {
      if (!userData?.branchId) return [];
      return getOrdersByBranchAndStatus(userData.branchId, 'ironing');
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

      // Mark garment as complete for ironing stage
      await completeStageForGarment(
        order.orderId,
        garmentId,
        'ironing',
        user.uid,
        userData.name || user.email || 'Unknown',
        startTime
      );

      // Check if all garments in order are complete for ironing
      const _garment = order.garments.find((g) => g.garmentId === garmentId);
      const allComplete = order.garments.every((g) => {
        if (g.garmentId === garmentId) return true; // Current garment we just completed
        return g.stageHandlers?.ironing && g.stageHandlers.ironing.length > 0;
      });

      if (allComplete) {
        // Move order to quality_check stage
        await updateOrderStatus(order.orderId, 'quality_check', user.uid);
        toast.success(`Order ${order.orderId} ironing complete! Moved to quality check.`);
      } else {
        toast.success('Garment ironing complete');
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
        <Shirt className="w-4 h-4" />
        <AlertDescription>
          <strong>Ironing Station:</strong> Process garments individually at the ironing stage.
          When all garments in an order are complete, the order will automatically move to the
          quality check stage.
        </AlertDescription>
      </Alert>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Ironing Queue ({ironingOrders.length})
          </CardTitle>
          <CardDescription>Orders ready for ironing</CardDescription>
        </CardHeader>
        <CardContent>
          {ironingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Inbox className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-sm">No orders at ironing stage</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ironingOrders.map((order) => {
                const completedCount = order.garments.filter(
                  (g) => g.stageHandlers?.ironing && g.stageHandlers.ironing.length > 0
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
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }
                        >
                          {completedCount}/{totalCount} Complete
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
                              garment.stageHandlers?.ironing &&
                              garment.stageHandlers.ironing.length > 0;
                            const processingKey = `${order.orderId}-${garment.garmentId}`;
                            const isProcessing = processingGarments.has(processingKey);

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
                                      Done
                                    </Badge>
                                  )}
                                </div>

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

                                {/* Special Instructions */}
                                {garment.specialInstructions && (
                                  <div className="text-xs text-gray-600 mb-3 p-2 bg-amber-50 rounded border border-amber-200">
                                    <div className="font-medium mb-1">Special Instructions:</div>
                                    <div>{garment.specialInstructions}</div>
                                  </div>
                                )}

                                {/* Completion Info */}
                                {isComplete && garment.stageHandlers?.ironing?.[0] && (
                                  <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-green-200">
                                    <div>
                                      Completed by: {garment.stageHandlers.ironing[0].name}
                                    </div>
                                    <div>
                                      {format(
                                        garment.stageHandlers.ironing[0].completedAt.toDate(),
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
                                    className="w-full mt-3 bg-purple-600 text-white hover:bg-purple-700"
                                    size="sm"
                                  >
                                    {isProcessing ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Completing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Complete Ironing
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
