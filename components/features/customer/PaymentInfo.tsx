/**
 * Payment Info Component
 *
 * Displays payment information and receipt download option.
 *
 * @module components/features/customer/PaymentInfo
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/formatters';
import { Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { OrderExtended } from '@/lib/db/schema';
import { toast } from 'sonner';

interface PaymentInfoProps {
  order: OrderExtended;
}

export function PaymentInfo({ order }: PaymentInfoProps) {
  const handleDownloadReceipt = () => {
    // TODO: Implement receipt generation and download
    // Check if receipt URL exists in order (type assertion for future implementation)
    const orderWithReceipt = order as OrderExtended & { receiptUrl?: string };
    if (orderWithReceipt.receiptUrl) {
      // Open receipt in new tab or download
      window.open(orderWithReceipt.receiptUrl, '_blank');
    } else {
      // Show placeholder toast
      toast.info('Receipt download coming soon', {
        description: 'Please contact the store for a copy of your receipt.',
      });
    }
  };

  const handlePayBalance = () => {
    // TODO: Implement Pesapal payment integration
    toast.info('Payment flow coming soon', {
      description: 'Please contact the store to pay your remaining balance.',
    });
  };

  const getPaymentStatusConfig = () => {
    switch (order.paymentStatus) {
      case 'paid':
        return {
          label: 'Paid',
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-700 border-green-300',
        };
      case 'partial':
        return {
          label: 'Partially Paid',
          icon: Clock,
          className: 'bg-amber-100 text-amber-700 border-amber-300',
        };
      case 'overpaid':
        return {
          label: 'Overpaid',
          icon: CheckCircle2,
          className: 'bg-blue-100 text-blue-700 border-blue-300',
        };
      case 'pending':
      default:
        return {
          label: 'Pending',
          icon: AlertCircle,
          className: 'bg-red-100 text-red-700 border-red-300',
        };
    }
  };

  const statusConfig = getPaymentStatusConfig();
  const StatusIcon = statusConfig.icon;
  const remainingBalance = order.totalAmount - order.paidAmount;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Payment Information</h2>

      <div className="space-y-4">
        {/* Total Amount */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Amount</span>
          <span className="font-semibold text-lg">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        <Separator />

        {/* Amount Paid */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Amount Paid</span>
          <span className="font-semibold">
            {formatCurrency(order.paidAmount)}
          </span>
        </div>

        {/* Remaining Balance */}
        {remainingBalance > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Remaining Balance</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        )}

        <Separator />

        {/* Payment Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Payment Status</span>
          <Badge className={statusConfig.className}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Payment Method */}
        {order.paymentMethod && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium capitalize">
              {order.paymentMethod.replace('_', ' ')}
            </span>
          </div>
        )}

        <Separator />

        {/* Payment Actions */}
        <div className="space-y-2">
          {/* Pay Balance Button - only show if not fully paid */}
          {remainingBalance > 0 && (
            <Button
              variant="default"
              className="w-full bg-brand-blue hover:bg-brand-blue-dark"
              onClick={handlePayBalance}
            >
              Pay Balance ({formatCurrency(remainingBalance)})
            </Button>
          )}

          {/* Download Receipt - only show if paid */}
          {order.paymentStatus === 'paid' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadReceipt}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
