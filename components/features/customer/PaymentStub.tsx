/**
 * Payment Stub Component
 *
 * Placeholder component for payment functionality.
 * Displays payment information and notifies customers that online
 * payment processing is coming soon.
 *
 * @module components/features/customer/PaymentStub
 */

'use client';

import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { Button } from '@/components/ui/button';
import { CreditCard, Phone, Building2, AlertCircle } from 'lucide-react';

interface PaymentStubProps {
  amountDue: number;
  paymentStatus: string;
  orderId: string;
}

export function PaymentStub({ amountDue, paymentStatus, orderId }: PaymentStubProps) {
  if (paymentStatus === 'paid') {
    return null; // Don't show if already paid
  }

  const remainingAmount = amountDue;

  return (
    <ModernCard className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <ModernCardContent className="!p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-100">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 text-lg">Payment Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                Complete your payment to finalize this order
              </p>
            </div>
          </div>

          {/* Amount Due */}
          <div className="bg-white/80 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Amount Due:</span>
              <span className="text-2xl font-bold text-amber-900">
                Ksh {remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Methods Notice */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Available Payment Methods:</p>

            <div className="grid gap-2">
              {/* M-Pesa */}
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-amber-100">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">M-Pesa</p>
                  <p className="text-xs text-gray-600">Pay via mobile money</p>
                </div>
              </div>

              {/* Card Payment */}
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-amber-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Card Payment</p>
                  <p className="text-xs text-gray-600">Visa, Mastercard, Amex</p>
                </div>
              </div>

              {/* In-Store */}
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-amber-100">
                <Building2 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Pay In-Store</p>
                  <p className="text-xs text-gray-600">Cash or card at pickup</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Online Payment Coming Soon</p>
              <p className="text-xs text-blue-700 mt-1">
                We're working on enabling secure online payments. For now, please pay when you collect your order or contact us to arrange payment.
              </p>
            </div>
          </div>

          {/* Contact Support Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full border-amber-300 hover:bg-amber-50 text-amber-900"
              onClick={() => {
                // WhatsApp contact
                const message = `Hi! I need help with payment for order ${orderId}. Amount due: Ksh ${remainingAmount}`;
                window.open(`https://wa.me/254725462859?text=${encodeURIComponent(message)}`, '_blank');
              }}
            >
              <Phone className="h-4 w-4 mr-2" />
              Contact Us About Payment
            </Button>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
}
