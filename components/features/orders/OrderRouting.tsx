/**
 * Order Routing Component (FR-006)
 *
 * Allows front desk staff to route orders to workstations.
 * Shows routing status and provides controls for manual routing.
 *
 * @module components/features/orders/OrderRouting
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Route,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Order, RoutingStatus } from '@/lib/db/schema';

interface OrderRoutingProps {
  order: Order;
  onRoutingComplete?: () => void;
}

// Routing status configuration
const routingStatusConfig: Record<RoutingStatus, {
  label: string;
  color: string;
  icon: React.ElementType;
}> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-blue-500',
    icon: Truck,
  },
  received: {
    label: 'Received',
    color: 'bg-cyan-500',
    icon: Package,
  },
  assigned: {
    label: 'Assigned',
    color: 'bg-purple-500',
    icon: Route,
  },
  processing: {
    label: 'Processing',
    color: 'bg-orange-500',
    icon: RefreshCw,
  },
  ready_for_return: {
    label: 'Ready',
    color: 'bg-green-500',
    icon: CheckCircle2,
  },
};

// Workstation stages
const workstationStages = [
  { value: 'inspection', label: 'Inspection' },
  { value: 'washing', label: 'Washing' },
  { value: 'drying', label: 'Drying' },
  { value: 'ironing', label: 'Ironing' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'packaging', label: 'Packaging' },
];

export function OrderRouting({ order, onRoutingComplete }: OrderRoutingProps) {
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('inspection');

  const currentStatus = order.routingStatus || 'pending';
  const statusConfig = routingStatusConfig[currentStatus];
  const StatusIcon = statusConfig?.icon || Clock;

  // Route order to workstation
  const handleRouteToWorkstation = async () => {
    if (!userData?.uid) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          userId: userData.uid,
          action: 'route_to_workstation',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      onRoutingComplete?.();
    } catch (error) {
      console.error('Error routing order:', error);
      toast.error('Failed to route order');
    } finally {
      setIsLoading(false);
    }
  };

  // Assign to specific stage
  const handleAssignToStage = async () => {
    if (!userData?.uid || !selectedStage) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          userId: userData.uid,
          action: 'assign_to_stage',
          stage: selectedStage,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      setShowAssignDialog(false);
      onRoutingComplete?.();
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark order as received
  const handleMarkReceived = async () => {
    if (!userData?.uid) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          userId: userData.uid,
          action: 'mark_received',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      onRoutingComplete?.();
    } catch (error) {
      console.error('Error marking received:', error);
      toast.error('Failed to mark order as received');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete processing
  const handleCompleteProcessing = async () => {
    if (!userData?.uid) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          userId: userData.uid,
          action: 'complete_processing',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      onRoutingComplete?.();
    } catch (error) {
      console.error('Error completing processing:', error);
      toast.error('Failed to complete processing');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which action buttons to show based on status
  const renderActionButtons = () => {
    switch (currentStatus) {
      case 'pending':
        return (
          <Button
            onClick={handleRouteToWorkstation}
            disabled={isLoading}
            className="w-full"
          >
            <Route className="w-4 h-4 mr-2" />
            Route to Workstation
          </Button>
        );

      case 'in_transit':
        return (
          <Button
            onClick={handleMarkReceived}
            disabled={isLoading}
            className="w-full"
          >
            <Package className="w-4 h-4 mr-2" />
            Mark as Received
          </Button>
        );

      case 'received':
      case 'assigned':
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(true)}
              disabled={isLoading}
              className="flex-1"
            >
              <Route className="w-4 h-4 mr-2" />
              Reassign Stage
            </Button>
            {currentStatus === 'assigned' && (
              <Button
                onClick={handleCompleteProcessing}
                disabled={isLoading}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        );

      case 'processing':
        return (
          <Button
            onClick={handleCompleteProcessing}
            disabled={isLoading}
            className="w-full"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Processing
          </Button>
        );

      case 'ready_for_return':
        return (
          <Badge className="bg-green-500 text-white py-2 px-4">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Ready for Delivery/Collection
          </Badge>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Route className="w-5 h-5" />
            Order Routing
          </CardTitle>
          <CardDescription>
            Track and manage order routing through the processing pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 ${statusConfig?.color.replace('bg-', 'text-')}`} />
              <div>
                <div className="text-sm font-medium">Current Status</div>
                <div className="text-xs text-gray-500">
                  {statusConfig?.label || 'Unknown'}
                </div>
              </div>
            </div>
            <Badge className={`${statusConfig?.color} text-white`}>
              {statusConfig?.label}
            </Badge>
          </div>

          {/* Routing Info */}
          {(order.processingBranchId || order.originBranchId) && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              {order.originBranchId && order.originBranchId !== order.branchId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Origin Branch</span>
                  <span className="font-medium">{order.originBranchId}</span>
                </div>
              )}
              {order.processingBranchId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Processing Branch</span>
                  <span className="font-medium">{order.processingBranchId}</span>
                </div>
              )}
              {order.assignedWorkstationStage && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Current Stage</span>
                  <Badge variant="outline">
                    {workstationStages.find(s => s.value === order.assignedWorkstationStage)?.label || order.assignedWorkstationStage}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Sorting Window Info (FR-007) */}
          {order.earliestDeliveryTime && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-800">
                    Sorting Window
                  </div>
                  <div className="text-xs text-amber-700">
                    Earliest delivery: {new Date(order.earliestDeliveryTime.toDate?.() || order.earliestDeliveryTime).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {renderActionButtons()}
          </div>
        </CardContent>
      </Card>

      {/* Stage Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Workstation Stage</DialogTitle>
            <DialogDescription>
              Select the workstation stage to assign this order to.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {workstationStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignToStage} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Route className="w-4 h-4 mr-2" />
              )}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
