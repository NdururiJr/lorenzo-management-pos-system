/**
 * Delivery Table Component
 *
 * Displays delivery orders in a table format with actions to:
 * - Assign drivers to deliveries
 * - Mark deliveries as completed
 * - View order details
 *
 * @module components/features/deliveries/DeliveryTable
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  ExternalLink,
  RefreshCw,
  Calendar,
  Bike,
  Truck,
} from 'lucide-react';
import type { Order, DeliveryClassification } from '@/lib/db/schema';
import { classifyDelivery, getClassificationColor } from '@/lib/delivery/classification';
import { markDeliveryCompleted, assignDeliveryDriver } from '@/lib/db/orders';
import { toast } from 'sonner';

interface DeliveryTableProps {
  deliveries: Order[];
  onDeliveryCompleted?: () => void;
  onRefresh?: () => void;
  showCompleted?: boolean;
}

export function DeliveryTable({
  deliveries,
  onDeliveryCompleted,
  onRefresh,
  showCompleted = false,
}: DeliveryTableProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      await assignDeliveryDriver(orderId, driverId);
      toast.success('Driver assigned successfully');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedOrder) return;

    try {
      setIsCompleting(true);
      await markDeliveryCompleted(selectedOrder.orderId);
      toast.success('Delivery marked as completed');
      setShowCompleteDialog(false);
      setSelectedOrder(null);
      if (onDeliveryCompleted) onDeliveryCompleted();
    } catch (error) {
      console.error('Error marking delivery as completed:', error);
      toast.error('Failed to mark delivery as completed');
    } finally {
      setIsCompleting(false);
    }
  };

  const openCompleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setShowCompleteDialog(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (order: Order): string => {
    if (!order.deliveryAddress) return 'No address';
    return order.deliveryAddress.address;
  };

  const getStatusBadge = (order: Order) => {
    if (order.deliveryCompletedTime) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Delivered
        </Badge>
      );
    }
    if (order.deliveryScheduledTime) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-yellow-300 text-yellow-700">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  /**
   * V2.0: Get classification badge for delivery type
   */
  const getClassificationBadge = (order: Order) => {
    // Use stored classification or calculate it
    const classification: DeliveryClassification = order.deliveryClassification || classifyDelivery(order).classification;
    const colors = getClassificationColor(classification);
    const isOverridden = order.classificationBasis === 'manual';

    if (classification === 'Small') {
      return (
        <Badge
          variant="outline"
          className={`${colors.bg} ${colors.text} ${colors.border} ${isOverridden ? 'ring-1 ring-blue-400' : ''}`}
          title={isOverridden ? 'Manually overridden' : 'Auto-classified'}
        >
          <Bike className="w-3 h-3 mr-1" />
          Small
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className={`${colors.bg} ${colors.text} ${colors.border} ${isOverridden ? 'ring-1 ring-blue-400' : ''}`}
        title={isOverridden ? 'Manually overridden' : 'Auto-classified'}
      >
        <Truck className="w-3 h-3 mr-1" />
        Bulk
      </Badge>
    );
  };

  if (deliveries.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            {showCompleted ? 'No completed deliveries' : 'No pending deliveries'}
          </p>
          <p className="text-sm">
            {showCompleted
              ? 'Completed deliveries will appear here'
              : 'New delivery orders will appear here'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Refresh Button */}
        {onRefresh && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Delivery Address</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Status</TableHead>
                {!showCompleted && <TableHead>Assigned Driver</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((order) => (
                <TableRow key={order.orderId}>
                  {/* Order ID */}
                  <TableCell className="font-medium">
                    {order.orderId}
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* V2.0: Delivery Type Classification */}
                  <TableCell>
                    {getClassificationBadge(order)}
                  </TableCell>

                  {/* Delivery Address */}
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div className="flex items-start gap-1 text-sm">
                        <MapPin className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate" title={formatAddress(order)}>
                          {order.deliveryAddress?.label || 'Address'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {formatAddress(order)}
                      </div>
                      {order.deliveryInstructions && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          Note: {order.deliveryInstructions.substring(0, 40)}
                          {order.deliveryInstructions.length > 40 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Scheduled Time */}
                  <TableCell>
                    {order.deliveryScheduledTime ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(order.deliveryScheduledTime)}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {order.estimatedCompletion
                          ? formatDate(order.estimatedCompletion)
                          : 'Not set'}
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(order)}</TableCell>

                  {/* Assigned Driver (only for non-completed) */}
                  {!showCompleted && (
                    <TableCell>
                      <Select
                        value={order.deliveryAssignedTo || ''}
                        onValueChange={(value) =>
                          handleAssignDriver(order.orderId, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Assign driver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="driver1">Driver 1</SelectItem>
                          <SelectItem value="driver2">Driver 2</SelectItem>
                          <SelectItem value="driver3">Driver 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      {!showCompleted && !order.deliveryCompletedTime && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openCompleteDialog(order)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Completion Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Delivery as Completed</DialogTitle>
            <DialogDescription>
              Confirm that clean garments have been successfully delivered to the
              customer's location.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order ID:</span>
                <span className="font-medium">{selectedOrder.orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Customer:</span>
                <span className="font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Address:</span>
                <span className="font-medium text-right max-w-[200px]">
                  {formatAddress(selectedOrder)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
              disabled={isCompleting}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkCompleted} disabled={isCompleting}>
              {isCompleting ? 'Marking...' : 'Confirm Delivery Completed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
