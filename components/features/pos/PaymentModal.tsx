/**
 * Payment Modal Component (FR-005 Enhanced)
 *
 * This component provides a modal interface for processing payments.
 * Supports M-Pesa, Card, Credit, Cash, and Customer Credit Balance payments.
 *
 * @module components/features/pos/PaymentModal
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Smartphone,
  CreditCard,
  FileText,
  AlertCircle,
  Wallet,
  CheckCircle,
} from 'lucide-react';
import {
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
  // Default to M-Pesa (cashless system)
  const [activeTab, setActiveTab] = useState('mpesa');
  const [loading, setLoading] = useState(false);

  // Customer credit balance state (FR-005)
  const [customerCreditBalance, setCustomerCreditBalance] = useState(0);
  const [useCustomerCredit, setUseCustomerCredit] = useState(false);
  const [creditAmountToApply, setCreditAmountToApply] = useState(0);
  const [loadingCredit, setLoadingCredit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Digital payment state
  const [digitalAmount, setDigitalAmount] = useState('');
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone);
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [, setTransactionId] = useState<string | null>(null);

  // Credit payment state
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');

  // Payment history state (for partial payments)
  interface PaymentHistoryItem {
    transactionId: string;
    amount: number;
    method: string;
    status: string;
    timestamp: Date;
  }
  const [previousPayments, setPreviousPayments] = useState<PaymentHistoryItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Calculate balance due (accounting for customer credit if applied)
  const balanceDue = order.totalAmount - order.paidAmount;
  const effectiveBalanceDue = useCustomerCredit
    ? Math.max(0, balanceDue - creditAmountToApply)
    : balanceDue;

  // Fetch customer credit balance (FR-005)
  const fetchCustomerCredit = useCallback(async () => {
    if (!order.customerId) return;

    setLoadingCredit(true);
    try {
      const response = await fetch(`/api/customers/${order.customerId}/credit`);
      if (response.ok) {
        const data = await response.json();
        setCustomerCreditBalance(data.creditBalance || 0);
        // Auto-calculate optimal credit application
        if (data.creditBalance > 0) {
          setCreditAmountToApply(Math.min(data.creditBalance, balanceDue));
        }
      }
    } catch (err) {
      console.error('Failed to fetch customer credit:', err);
    } finally {
      setLoadingCredit(false);
    }
  }, [order.customerId, balanceDue]);

  // Fetch payment history for partial payments
  const fetchPaymentHistory = useCallback(async () => {
    if (!order.orderId) return;

    setLoadingPayments(true);
    try {
      const response = await fetch(`/api/orders/${order.orderId}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPreviousPayments(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setLoadingPayments(false);
    }
  }, [order.orderId]);

  // Set default amounts when modal opens
  useEffect(() => {
    if (open) {
      const defaultAmount = balanceDue.toString();
      setDigitalAmount(defaultAmount);
      setCreditAmount(defaultAmount);
      setError(null);
      setPaymentProcessing(false);
      setTransactionId(null);
      setUseCustomerCredit(false);
      setCreditAmountToApply(0);
      setPreviousPayments([]);

      // Fetch customer credit balance
      fetchCustomerCredit();

      // Fetch payment history if there are previous payments
      if (order.paidAmount > 0) {
        fetchPaymentHistory();
      }
    }
  }, [open, balanceDue, fetchCustomerCredit, fetchPaymentHistory, order.paidAmount]);

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

  // Poll for payment status with exponential backoff (high-volume optimized)
  // Reduces API calls: 5s → 10s → 20s → 30s (cap) instead of fixed 5s
  // At 100 concurrent payments: 72,000 calls/hr → ~18,000 calls/hr
  const startPaymentStatusPolling = (txnId: string) => {
    const paymentAmount = parseFloat(digitalAmount) || 0;
    const startTime = Date.now();
    const maxDuration = 5 * 60 * 1000; // 5 minutes max
    const initialDelay = 5000; // Start at 5 seconds
    const maxDelay = 30000; // Cap at 30 seconds

    let currentDelay = initialDelay;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      // Check if we've exceeded max duration
      if (Date.now() - startTime > maxDuration) {
        setPaymentProcessing(false);
        setError('Payment confirmation timeout. Please check payment status manually.');
        return;
      }

      try {
        const status = await checkPaymentStatus(txnId, true);

        if (status?.status === 'completed') {
          setPaymentProcessing(false);

          // Check if this was a partial or full payment
          const newPaidAmount = order.paidAmount + paymentAmount;
          const isFullyPaid = newPaidAmount >= order.totalAmount;

          if (isFullyPaid) {
            // Full payment - close modal
            toast.success('Payment complete! Order fully paid.');
            onSuccess();
            onClose();
          } else {
            // Partial payment - refresh and allow another payment
            const remainingBalance = order.totalAmount - newPaidAmount;
            toast.success(
              `Partial payment of KES ${paymentAmount.toLocaleString()} received! Remaining: KES ${remainingBalance.toLocaleString()}`
            );

            // Refresh payment history
            fetchPaymentHistory();

            // Update the digital amount to remaining balance
            setDigitalAmount(remainingBalance.toString());

            // Call onSuccess to refresh order data in parent component
            onSuccess();
          }
          return; // Stop polling
        } else if (status?.status === 'failed') {
          setPaymentProcessing(false);
          setError('Payment failed. Please try again.');
          return; // Stop polling
        }

        // Payment still pending - schedule next poll with exponential backoff
        currentDelay = Math.min(currentDelay * 2, maxDelay);
        timeoutId = setTimeout(poll, currentDelay);
      } catch (err) {
        console.error('Payment status check error:', err);
        // On error, continue polling with backoff
        currentDelay = Math.min(currentDelay * 2, maxDelay);
        timeoutId = setTimeout(poll, currentDelay);
      }
    };

    // Start first poll after initial delay
    timeoutId = setTimeout(poll, initialDelay);

    // Return cleanup function (though not used currently)
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-lorenzo-cream p-4 rounded-lg space-y-2">
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
          <div className="flex justify-between text-xl font-bold text-lorenzo-deep-teal border-t pt-2">
            <span>Balance Due:</span>
            <span>KES {balanceDue.toLocaleString()}</span>
          </div>
        </div>

        {/* Customer Credit Section (FR-005) */}
        {customerCreditBalance > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Customer Credit Available</span>
              </div>
              <span className="text-lg font-bold text-green-700">
                KES {customerCreditBalance.toLocaleString()}
              </span>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Checkbox
                id="use-credit"
                checked={useCustomerCredit}
                onCheckedChange={(checked) => {
                  setUseCustomerCredit(!!checked);
                  if (checked) {
                    setCreditAmountToApply(Math.min(customerCreditBalance, balanceDue));
                    // Update digital amount to remaining balance
                    const remaining = balanceDue - Math.min(customerCreditBalance, balanceDue);
                    setDigitalAmount(remaining > 0 ? remaining.toString() : '0');
                  } else {
                    setCreditAmountToApply(0);
                    setDigitalAmount(balanceDue.toString());
                  }
                }}
                disabled={paymentProcessing}
              />
              <div className="flex-1">
                <Label htmlFor="use-credit" className="cursor-pointer">
                  Apply customer credit to this order
                </Label>
                {useCustomerCredit && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="credit-apply-amount" className="text-sm text-gray-600">
                        Amount to apply:
                      </Label>
                      <Input
                        id="credit-apply-amount"
                        type="number"
                        value={creditAmountToApply}
                        onChange={(e) => {
                          const val = Math.min(
                            parseFloat(e.target.value) || 0,
                            customerCreditBalance,
                            balanceDue
                          );
                          setCreditAmountToApply(val);
                          setDigitalAmount((balanceDue - val).toString());
                        }}
                        className="w-32 h-8"
                        min="0"
                        max={Math.min(customerCreditBalance, balanceDue)}
                      />
                    </div>
                    <div className="flex justify-between text-sm bg-green-100 p-2 rounded">
                      <span>Remaining to pay:</span>
                      <span className="font-medium">
                        KES {effectiveBalanceDue.toLocaleString()}
                      </span>
                    </div>
                    {effectiveBalanceDue === 0 && (
                      <Alert className="bg-green-100 border-green-300">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Customer credit covers the full balance! Click &quot;Apply Credit Only&quot; to complete.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </div>

            {useCustomerCredit && effectiveBalanceDue === 0 && (
              <Button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await fetch(`/api/customers/${order.customerId}/credit`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: order.orderId,
                        amount: creditAmountToApply,
                        branchId: order.branchId,
                        processedBy: userId,
                      }),
                    });

                    if (response.ok) {
                      toast.success('Customer credit applied successfully!');
                      onSuccess();
                      onClose();
                    } else {
                      const data = await response.json();
                      setError(data.error || 'Failed to apply credit');
                    }
                  } catch (err) {
                    setError('Failed to apply customer credit');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? <LoadingSpinner className="mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Apply Credit Only (KES {creditAmountToApply.toLocaleString()})
              </Button>
            )}
          </div>
        )}

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

        {/* Payment Method Tabs (Cashless System) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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

          {/* M-Pesa Payment Tab (Enhanced for Partial Payments) */}
          <TabsContent value="mpesa" className="space-y-4">
            {/* Prominent Remaining Balance Display */}
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg text-center">
              <div className="text-sm text-amber-700">Remaining Balance</div>
              <div className="text-2xl font-bold text-amber-900">
                KES {balanceDue.toLocaleString()}
              </div>
              {balanceDue !== order.totalAmount && (
                <div className="text-xs text-amber-600 mt-1">
                  ({Math.round((order.paidAmount / order.totalAmount) * 100)}% paid)
                </div>
              )}
            </div>

            {/* Payment History Section (for orders with previous payments) */}
            {order.paidAmount > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">Payment History</div>
                {loadingPayments ? (
                  <div className="flex items-center justify-center py-2">
                    <LoadingSpinner className="h-4 w-4" />
                    <span className="ml-2 text-sm text-blue-600">Loading...</span>
                  </div>
                ) : previousPayments.length > 0 ? (
                  <div className="space-y-1 text-sm">
                    {previousPayments.map((payment) => (
                      <div key={payment.transactionId} className="flex justify-between text-blue-700">
                        <span>
                          {payment.method.toUpperCase()} - {new Date(payment.timestamp).toLocaleDateString()}
                        </span>
                        <span className={payment.status === 'completed' ? 'text-green-600' : 'text-amber-600'}>
                          KES {payment.amount.toLocaleString()}
                          {payment.status !== 'completed' && ` (${payment.status})`}
                        </span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium text-blue-900">
                      <span>Total Paid:</span>
                      <span>KES {order.paidAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-blue-600">Previous payments recorded but details unavailable.</p>
                )}
              </div>
            )}

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

            {/* Quick Amount Buttons for Partial Payments */}
            <div className="grid grid-cols-4 gap-2">
              {/* Filter preset amounts to only show those less than balanceDue */}
              {[500, 1000, 2000].filter(amt => amt < balanceDue).map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setDigitalAmount(amt.toString())}
                  className={digitalAmount === amt.toString() ? 'border-lorenzo-teal bg-lorenzo-cream' : ''}
                >
                  KES {amt.toLocaleString()}
                </Button>
              ))}
              {/* Always show Full button with unique key */}
              <Button
                key="full-amount"
                variant="outline"
                size="sm"
                onClick={() => setDigitalAmount(balanceDue.toString())}
                className={digitalAmount === balanceDue.toString() ? 'border-lorenzo-teal bg-lorenzo-cream' : ''}
              >
                Full
              </Button>
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
                Customer will be redirected to complete M-Pesa payment. Partial payments are supported - pay any amount up to the balance.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => handleDigitalPayment('mpesa')}
              disabled={loading || !digitalAmount || !customerPhone}
              className="w-full bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white"
            >
              {loading ? <LoadingSpinner className="mr-2" /> : <Smartphone className="mr-2 h-4 w-4" />}
              {parseFloat(digitalAmount || '0') < balanceDue
                ? `Pay KES ${parseFloat(digitalAmount || '0').toLocaleString()} (Partial)`
                : 'Initiate M-Pesa Payment (Full)'}
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
              className="w-full bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white"
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
              className="w-full bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white"
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
