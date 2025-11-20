/**
 * Order Details Modal Component
 *
 * Full-screen modal displaying complete order information with status management.
 *
 * @module components/features/pipeline/OrderDetailsModal
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { PaymentBadge } from '@/components/ui/payment-badge';
import {
  User,
  Phone,
  Package,
  DollarSign,
  Clock,
  Calendar,
  FileText,
  Printer,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderExtended, OrderStatus } from '@/lib/db/schema';
import { getStatusConfig, getValidNextStatuses } from '@/lib/pipeline/status-manager';
import { formatCurrency, formatRelativeTime, formatDateTime } from '@/lib/utils/formatters';
import { formatDuration, formatTimeUntilDue } from '@/lib/pipeline/pipeline-helpers';

interface OrderDetailsModalProps {
  order: OrderExtended | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onPrintReceipt?: (orderId: string) => void;
  onPrintOrderSheet?: (orderId: string) => void;
}

export function OrderDetailsModal({
  order,
  open,
  onClose,
  onStatusChange,
  onPrintReceipt,
  onPrintOrderSheet,
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const validNextStatuses = getValidNextStatuses(order.status);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;

    setIsUpdating(true);
    try {
      await onStatusChange(order.orderId, selectedStatus, statusNote);
      setSelectedStatus('');
      setStatusNote('');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate total garments
  const garmentCount = order.garments.length;

  // Calculate balance due
  const balanceDue = order.totalAmount - order.paidAmount;

  // Get time in current stage
  const lastStatusEntry = order.statusHistory[order.statusHistory.length - 1];
  const timeInCurrentStage = lastStatusEntry
    ? Math.floor(
        (Date.now() - lastStatusEntry.timestamp.toDate().getTime()) / (1000 * 60)
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-mono font-bold">
                {order.orderId}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={order.status} />
                <PaymentBadge status={order.paymentStatus} />
                <span className="text-sm text-gray-500">
                  Created {formatRelativeTime(order.createdAt.toDate())}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-black">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-black flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.customerPhone}
                  </p>
                </div>
                {order.deliveryAddress && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium text-black flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                      {order.deliveryAddress.address}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Garments List */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Garments ({garmentCount})
              </h3>
              <div className="space-y-3">
                {order.garments.map((garment, index) => (
                  <div
                    key={garment.garmentId}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-black">
                        {index + 1}. {garment.type} - {garment.color}
                      </p>
                      {garment.brand && (
                        <p className="text-sm text-gray-500">Brand: {garment.brand}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {garment.services.map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                      {garment.specialInstructions && (
                        <p className="text-xs text-gray-600 mt-2">
                          Note: {garment.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {formatCurrency(garment.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-black">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(order.paidAmount)}
                  </span>
                </div>
                {balanceDue > 0 && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium text-gray-900">Balance Due</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                )}
                {order.paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="text-gray-700 capitalize">
                      {order.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Status History Timeline */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Status History
              </h3>
              <div className="space-y-3">
                {order.statusHistory.map((entry, index) => {
                  const config = getStatusConfig(entry.status);
                  const isLatest = index === order.statusHistory.length - 1;
                  const nextEntry = order.statusHistory[index + 1];
                  const duration = nextEntry
                    ? Math.floor(
                        (nextEntry.timestamp.toDate().getTime() -
                          entry.timestamp.toDate().getTime()) /
                          (1000 * 60)
                      )
                    : timeInCurrentStage;

                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            config.bgColor,
                            config.textColor
                          )}
                        >
                          {isLatest ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>
                        {index < order.statusHistory.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-black">{config.label}</p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(entry.timestamp.toDate())}
                          </p>
                        </div>
                        {duration > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {formatDuration(duration)}
                          </p>
                        )}
                        {isLatest && (
                          <Badge variant="secondary" className="mt-1">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Order Timeline */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-black">
                    {formatDateTime(order.createdAt.toDate())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Completion</span>
                  <span
                    className={cn(
                      'font-medium',
                      order.estimatedCompletion.toDate() < new Date() &&
                        !order.actualCompletion
                        ? 'text-red-600'
                        : 'text-black'
                    )}
                  >
                    {formatDateTime(order.estimatedCompletion.toDate())}
                    <span className="text-xs ml-2">
                      ({formatTimeUntilDue(order.estimatedCompletion)})
                    </span>
                  </span>
                </div>
                {order.actualCompletion && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Completion</span>
                    <span className="text-green-600 font-medium">
                      {formatDateTime(order.actualCompletion.toDate())}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <Card className="p-4 border-gray-200">
                <h3 className="font-semibold text-black mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Special Instructions
                </h3>
                <p className="text-sm text-gray-700">{order.specialInstructions}</p>
              </Card>
            )}

            {/* Change Status Section */}
            {validNextStatuses.length > 0 && (
              <Card className="p-4 border-gray-200 bg-blue-50">
                <h3 className="font-semibold text-black mb-3">Update Status</h3>
                <div className="space-y-3">
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
                  >
                    <SelectTrigger className="border-gray-300 bg-white">
                      <SelectValue placeholder="Select new status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {validNextStatuses.map((status) => {
                        const config = getStatusConfig(status);
                        return (
                          <SelectItem key={status} value={status}>
                            {config.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="Add a note (optional)..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={2}
                    className="resize-none border-gray-300 bg-white"
                  />

                  <Button
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || selectedStatus === order.status || isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
          {onPrintOrderSheet && (
            <Button
              variant="outline"
              onClick={() => onPrintOrderSheet(order.orderId)}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Order Sheet
            </Button>
          )}
          {onPrintReceipt && (
            <Button
              variant="outline"
              onClick={() => onPrintReceipt(order.orderId)}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Receipt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
