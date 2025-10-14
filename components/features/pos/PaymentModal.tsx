/**
 * Payment Modal Component
 *
 * This component provides a modal interface for processing payments.
 * Supports Cash, M-Pesa, Card, and Credit payments.
 *
 * @module components/features/pos/PaymentModal
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DollarSign,
  Smartphone,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  processCashPayment,
  initiateDigitalPayment,
  processCreditPayment,
  checkPaymentStatus,
} from '@/lib/payments/payment-service';
import type { OrderExtended } from '@/lib/db/schema';
import { toast } from 'sonner';

interface PaymentModalProps {
  order: OrderExtended;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function PaymentModal({
  order,
  open,
  onClose,
  onSuccess,
  userId,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cash payment state
  const [cashAmount, setCashAmount] = useState('');
  const [amountTendered, setAmountTendered] = useState('');

  // Digital payment state
  const [digitalAmount, setDigitalAmount] = useState('');
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone);
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [, setTransactionId] = useState<string | null>(null);

  // Credit payment state
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');

  // Calculate balance due
  const balanceDue = order.totalAmount - order.paidAmount;

  // Set default amounts when modal opens
  useEffect(() => {
    if (open) {
      const defaultAmount = balanceDue.toString();
      setCashAmount(defaultAmount);
      setDigitalAmount(defaultAmount);
      setCreditAmount(defaultAmount);
      setError(null);
      setPaymentProcessing(false);
      setTransactionId(null);
    }
  }, [open, balanceDue]);

  // Calculate change for cash payment
  const calculateChange = () => {
    const amount = parseFloat(cashAmount) || 0;
    const tendered = parseFloat(amountTendered) || 0;
    return Math.max(0, tendered - amount);
  };

  // Handle cash payment
  const handleCashPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(cashAmount);
      const tendered = amountTendered ? parseFloat(amountTendered) : amount;

      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > balanceDue) {
        throw new Error('Payment amount exceeds balance due');
      }

      if (tendered < amount) {
        throw new Error('Amount tendered is less than payment amount');
      }

      const result = await processCashPayment({
        orderId: order.orderId,
        customerId: order.customerId,
        amount,
        amountTendered: tendered,
        change: tendered - amount,
        userId,
      });

      if (result.success) {
        toast.success('Cash payment recorded successfully');
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to process payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle digital payment (M-Pesa/Card)
  const handleDigitalPayment = async (method: 'mpesa' | 'card') => {
    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(digitalAmount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > balanceDue) {
        throw new Error('Payment amount exceeds balance due');
      }

      if (!customerPhone) {
        throw new Error('Please enter customer phone number');
      }

      const result = await initiateDigitalPayment({
        orderId: order.orderId,
        customerId: order.customerId,
        amount,
        customerPhone,
        customerEmail,
        method,
        userId,
      });

      if (result.success && result.redirectUrl && result.transactionId) {
        setTransactionId(result.transactionId);
        setPaymentProcessing(true);

        // Open payment URL in new tab
        window.open(result.redirectUrl, '_blank');

        // Start polling for payment status
        startPaymentStatusPolling(result.transactionId);

        toast.success('Payment initiated. Please complete payment in the new tab.');
      } else {
        setError(result.error || 'Failed to initiate payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  // Poll for payment status
  const startPaymentStatusPolling = (txnId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (60 * 5 seconds)

    const pollInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        setPaymentProcessing(false);
        setError('Payment confirmation timeout. Please check payment status manually.');
        return;
      }

      try {
        const status = await checkPaymentStatus(txnId, true);

        if (status?.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentProcessing(false);
          toast.success('Payment confirmed successfully!');
          onSuccess();
          onClose();
        } else if (status?.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentProcessing(false);
          setError('Payment failed. Please try again.');
        }
      } catch (err) {
        console.error('Payment status check error:', err);
      }
    }, 5000); // Check every 5 seconds
  };

  // Handle credit payment
  const handleCreditPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(creditAmount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > balanceDue) {
        throw new Error('Payment amount exceeds balance due');
      }

      const result = await processCreditPayment({
        orderId: order.orderId,
        customerId: order.customerId,
        amount,
        userId,
        creditNote,
      });

      if (result.success) {
        toast.success('Credit payment recorded successfully');
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to process payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{order.orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total Amount:</span>
            <span>KES {order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Already Paid:</span>
            <span className="font-medium">KES {order.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-green-600 border-t pt-2">
            <span>Balance Due:</span>
            <span>KES {balanceDue.toLocaleString()}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Processing Alert */}
        {paymentProcessing && (
          <Alert>
            <LoadingSpinner className="h-4 w-4" />
            <AlertDescription>
              Waiting for payment confirmation... Please complete payment in the opened tab.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Method Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cash" disabled={paymentProcessing}>
              <DollarSign className="h-4 w-4 mr-2" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="mpesa" disabled={paymentProcessing}>
              <Smartphone className="h-4 w-4 mr-2" />
              M-Pesa
            </TabsTrigger>
            <TabsTrigger value="card" disabled={paymentProcessing}>
              <CreditCard className="h-4 w-4 mr-2" />
              Card
            </TabsTrigger>
            <TabsTrigger value="credit" disabled={paymentProcessing}>
              <FileText className="h-4 w-4 mr-2" />
              Credit
            </TabsTrigger>
          </TabsList>

          {/* Cash Payment Tab */}
          <TabsContent value="cash" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cash-amount">Payment Amount (KES)</Label>
              <Input
                id="cash-amount"
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={balanceDue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount-tendered">Amount Tendered (KES)</Label>
              <Input
                id="amount-tendered"
                type="number"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder="0.00"
                min="0"
              />
            </div>

            {amountTendered && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Change:</span>
                  <span className="text-blue-600">
                    KES {calculateChange().toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleCashPayment}
              disabled={loading || !cashAmount}
              className="w-full"
            >
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              Record Cash Payment
            </Button>
          </TabsContent>

          {/* M-Pesa Payment Tab */}
          <TabsContent value="mpesa" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mpesa-amount">Payment Amount (KES)</Label>
              <Input
                id="mpesa-amount"
                type="number"
                value={digitalAmount}
                onChange={(e) => setDigitalAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={balanceDue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mpesa-phone">Customer Phone Number</Label>
              <Input
                id="mpesa-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+254 712 345 678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mpesa-email">Customer Email (Optional)</Label>
              <Input
                id="mpesa-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Customer will be redirected to complete M-Pesa payment. Please wait for confirmation.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => handleDigitalPayment('mpesa')}
              disabled={loading || !digitalAmount || !customerPhone}
              className="w-full"
            >
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              Initiate M-Pesa Payment
            </Button>
          </TabsContent>

          {/* Card Payment Tab */}
          <TabsContent value="card" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-amount">Payment Amount (KES)</Label>
              <Input
                id="card-amount"
                type="number"
                value={digitalAmount}
                onChange={(e) => setDigitalAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={balanceDue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-phone">Customer Phone Number</Label>
              <Input
                id="card-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+254 712 345 678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-email">Customer Email (Optional)</Label>
              <Input
                id="card-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Customer will be redirected to Pesapal to complete card payment securely.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => handleDigitalPayment('card')}
              disabled={loading || !digitalAmount || !customerPhone}
              className="w-full"
            >
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              Initiate Card Payment
            </Button>
          </TabsContent>

          {/* Credit Payment Tab */}
          <TabsContent value="credit" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credit-amount">Payment Amount (KES)</Label>
              <Input
                id="credit-amount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                max={balanceDue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit-note">Credit Note (Optional)</Label>
              <Input
                id="credit-note"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                placeholder="Note about credit payment"
              />
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                This will be added to the customer&apos;s credit account balance.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCreditPayment}
              disabled={loading || !creditAmount}
              className="w-full"
            >
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              Record Credit Payment
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
