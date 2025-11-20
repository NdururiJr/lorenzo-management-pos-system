/**
 * Order Summary Component
 *
 * Displays order details, pricing, and actions for the POS system.
 *
 * @module components/features/pos/OrderSummary
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Save, Trash2, Calendar } from 'lucide-react';
import { PaymentBadge } from '@/components/ui/payment-badge';
import type { PaymentStatus } from '@/components/ui/payment-badge';

interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
}

interface Garment {
  garmentId: string;
  type: string;
  color: string;
  services: string[];
  price: number;
}

interface OrderSummaryProps {
  customer?: Customer;
  garments: Garment[];
  subtotal: number;
  tax?: number;
  total: number;
  estimatedCompletion?: Date;
  paymentStatus?: PaymentStatus;
  onProcessPayment: () => void;
  onSaveDraft?: () => void;
  onClearOrder?: () => void;
  isProcessing?: boolean;
  className?: string;
}

export function OrderSummary({
  customer,
  garments,
  subtotal,
  tax = 0,
  total,
  estimatedCompletion,
  paymentStatus = 'pending',
  onProcessPayment,
  onSaveDraft,
  onClearOrder,
  isProcessing = false,
  className,
}: OrderSummaryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const hasItems = garments.length > 0;

  return (
    <Card className={`${className} sticky top-20`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-black">Order Summary</h2>
        </div>

        <Separator />

        {/* Customer Info */}
        {customer ? (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Customer</h3>
            <div className="space-y-1">
              <p className="font-semibold text-black">{customer.name}</p>
              <p className="text-sm text-gray-600">{customer.phone}</p>
              {customer.email && (
                <p className="text-sm text-gray-500">{customer.email}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No customer selected</p>
          </div>
        )}

        <Separator />

        {/* Garments List */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Garments: {garments.length}{' '}
            {garments.length === 1 ? 'item' : 'items'}
          </h3>

          {garments.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {garments.map((garment) => (
                <div
                  key={garment.garmentId}
                  className="flex items-start justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black truncate">
                      {garment.type} ({garment.color})
                    </p>
                    <p className="text-xs text-gray-500">
                      {garment.services.join(', ')}
                    </p>
                  </div>
                  <span className="font-semibold text-black ml-2 flex-shrink-0">
                    KES {garment.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No items added yet</p>
          )}
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-black">
              KES {subtotal.toLocaleString()}
            </span>
          </div>

          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (16%)</span>
              <span className="font-medium text-black">
                KES {tax.toLocaleString()}
              </span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-black">Total</span>
            <span className="text-2xl font-bold text-black">
              KES {total.toLocaleString()}
            </span>
          </div>
        </div>

        <Separator />

        {/* Estimated Completion */}
        {estimatedCompletion && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Est. Completion
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(estimatedCompletion)}</span>
            </div>
          </div>
        )}

        {paymentStatus !== 'pending' && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </h3>
              <PaymentBadge status={paymentStatus} size="md" />
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={onProcessPayment}
            disabled={!hasItems || !customer || isProcessing}
            className="w-full h-11 bg-brand-blue hover:bg-brand-blue-dark text-white"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Process Payment
          </Button>

          {onSaveDraft && (
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={!hasItems || !customer || isProcessing}
              className="w-full h-11 border-gray-300"
            >
              <Save className="w-5 h-5 mr-2" />
              Save as Draft
            </Button>
          )}

          {onClearOrder && (
            <Button
              variant="ghost"
              onClick={onClearOrder}
              disabled={!hasItems || isProcessing}
              className="w-full h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear Order
            </Button>
          )}
        </div>

        {/* Help Text */}
        {!customer && (
          <p className="text-xs text-center text-gray-500">
            Select a customer to continue
          </p>
        )}
        {customer && !hasItems && (
          <p className="text-xs text-center text-gray-500">
            Add garments to process payment
          </p>
        )}
      </div>
    </Card>
  );
}
