'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  FileCheck,
  X,
  Clock,
  User,
  Package,
  Calendar,
  Phone,
  Edit,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * Get Firebase auth token
 */
async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

interface QuotationItem {
  garmentType: string;
  quantity: number;
  services: string[];
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

interface Quotation {
  id: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  items: QuotationItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  discountReason?: string;
  totalAmount: number;
  status: QuotationStatus;
  validUntil: { toDate: () => Date } | Date | string;
  estimatedCompletion: { toDate: () => Date } | Date | string;
  notes?: string;
  sentAt?: { toDate: () => Date } | Date | string;
  sentVia?: string;
  acceptedAt?: { toDate: () => Date } | Date | string;
  rejectedAt?: { toDate: () => Date } | Date | string;
  rejectionReason?: string;
  convertedOrderId?: string;
  convertedAt?: { toDate: () => Date } | Date | string;
  createdAt: { toDate: () => Date } | Date | string;
  createdBy: string;
  createdByName: string;
}

const STATUS_COLORS: Record<QuotationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  accepted: 'default',
  rejected: 'destructive',
  expired: 'outline',
  converted: 'default',
};

const STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Draft',
  sent: 'Sent to Customer',
  accepted: 'Accepted by Customer',
  rejected: 'Rejected',
  expired: 'Expired',
  converted: 'Converted to Order',
};

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const { quotationId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch quotation
  const fetchQuotation = useCallback(async () => {
    const token = await getAuthToken();
    if (!token || !quotationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotation');
      }

      const data = await response.json();
      setQuotation(data.data);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      alert('Failed to load quotation');
    } finally {
      setIsLoading(false);
    }
  }, [quotationId]);

  useEffect(() => {
    if (user) {
      fetchQuotation();
    }
  }, [user, fetchQuotation]);

  // Helper to safely get date
  const getDate = (dateValue: { toDate: () => Date } | Date | string | undefined): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') return new Date(dateValue);
    if (typeof dateValue.toDate === 'function') return dateValue.toDate();
    return null;
  };

  // Send quotation
  const handleSend = async () => {
    const token = await getAuthToken();
    if (!token || !quotation) return;

    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: 'whatsapp' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send quotation');
      }

      const data = await response.json();
      setQuotation(data.data);

      alert('Quotation sent to customer via WhatsApp');
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to send quotation');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Accept quotation (usually done by customer, but staff can do it too)
  const handleAccept = async () => {
    const token = await getAuthToken();
    if (!token || !quotation) return;

    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept quotation');
      }

      const data = await response.json();
      setQuotation(data.data);

      alert('Quotation accepted');
    } catch (error) {
      console.error('Error accepting quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to accept quotation');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reject quotation
  const handleReject = async () => {
    const token = await getAuthToken();
    if (!token || !quotation) return;

    const reason = prompt('Enter rejection reason (optional):');

    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject quotation');
      }

      const data = await response.json();
      setQuotation(data.data);

      alert('Quotation rejected');
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject quotation');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Convert to order
  const handleConvert = async () => {
    const token = await getAuthToken();
    if (!token || !quotation) return;

    if (!confirm('Convert this quotation to an order?')) {
      return;
    }

    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/quotations/${quotationId}/convert`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionMethod: 'drop_off',
          returnMethod: 'customer_collects',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to convert quotation');
      }

      const data = await response.json();

      alert(`Quotation converted to order ${data.data.order.orderId}`);

      // Navigate to the new order
      router.push(`/orders/${data.data.order.orderId}`);
    } catch (error) {
      console.error('Error converting quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to convert quotation');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </PageContainer>
    );
  }

  if (!quotation) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Quotation not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  const validUntil = getDate(quotation.validUntil);
  const isExpired = validUntil && new Date() > validUntil;

  return (
    <PageContainer>
      <SectionHeader
        title={quotation.quotationId}
        description={`Created by ${quotation.createdByName}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {quotation.status === 'draft' && (
              <>
                <Button variant="outline" onClick={() => router.push(`/quotations/${quotationId}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleSend} disabled={isActionLoading}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Customer
                </Button>
              </>
            )}

            {quotation.status === 'sent' && (
              <>
                <Button variant="outline" onClick={handleAccept} disabled={isActionLoading || !!isExpired}>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Mark as Accepted
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isActionLoading}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            {quotation.status === 'accepted' && (
              <Button onClick={handleConvert} disabled={isActionLoading}>
                <FileCheck className="mr-2 h-4 w-4" />
                Convert to Order
              </Button>
            )}

            {quotation.status === 'converted' && quotation.convertedOrderId && (
              <Button onClick={() => router.push(`/orders/${quotation.convertedOrderId}`)}>
                View Order
              </Button>
            )}
          </div>
        }
      />

      {/* Status Banner */}
      <Card className={`mb-6 ${quotation.status === 'rejected' ? 'border-destructive' : ''}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={STATUS_COLORS[quotation.status]} className="text-base px-4 py-1">
                {STATUS_LABELS[quotation.status]}
              </Badge>
              {isExpired && quotation.status !== 'converted' && quotation.status !== 'rejected' && (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
            {validUntil && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Valid until {formatDate(validUntil)}
              </div>
            )}
          </div>
          {quotation.rejectionReason && (
            <div className="mt-2 text-destructive">
              <strong>Rejection Reason:</strong> {quotation.rejectionReason}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{quotation.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {quotation.customerPhone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items
              </CardTitle>
              <CardDescription>
                {quotation.items.reduce((sum, item) => sum + item.quantity, 0)} total items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {quotation.items.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {item.garmentType} x{item.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.services.join(', ')}
                        </div>
                        {item.specialInstructions && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice)} each
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(quotation.subtotal)}</span>
              </div>
              {quotation.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatCurrency(quotation.deliveryFee)}</span>
                </div>
              )}
              {quotation.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(quotation.discountAmount)}</span>
                </div>
              )}
              {quotation.discountReason && (
                <div className="text-sm text-muted-foreground">
                  ({quotation.discountReason})
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(quotation.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(getDate(quotation.createdAt) || new Date())}</span>
              </div>
              {quotation.sentAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sent via {quotation.sentVia}</span>
                  <span>{formatDate(getDate(quotation.sentAt) || new Date())}</span>
                </div>
              )}
              {quotation.acceptedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accepted</span>
                  <span>{formatDate(getDate(quotation.acceptedAt) || new Date())}</span>
                </div>
              )}
              {quotation.rejectedAt && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Rejected</span>
                  <span>{formatDate(getDate(quotation.rejectedAt) || new Date())}</span>
                </div>
              )}
              {quotation.convertedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Converted</span>
                  <span>{formatDate(getDate(quotation.convertedAt) || new Date())}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Completion</span>
                <span>{formatDate(getDate(quotation.estimatedCompletion) || new Date())}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
