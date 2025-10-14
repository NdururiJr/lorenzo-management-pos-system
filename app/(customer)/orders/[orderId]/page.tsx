/**
 * Order Tracking Detail Page
 *
 * Detailed view of a single order with real-time tracking.
 *
 * @module app/(customer)/orders/[orderId]/page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrderTrackingTimeline } from '@/components/features/customer/OrderTrackingTimeline';
import { OrderDetails } from '@/components/features/customer/OrderDetails';
import { PaymentInfo } from '@/components/features/customer/PaymentInfo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { OrderExtended } from '@/lib/db/schema';
import Link from 'next/link';

interface OrderTrackingPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Unwrap params promise
  useEffect(() => {
    params.then((p) => setOrderId(p.orderId));
  }, [params]);

  useEffect(() => {
    if (!user || !orderId) return;

    const orderRef = doc(db, 'orders', orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError('Order not found');
          setLoading(false);
          return;
        }

        const orderData = {
          ...snapshot.data(),
          orderId: snapshot.id,
        } as OrderExtended;

        // Check if this order belongs to the current customer
        if (orderData.customerId !== user.uid) {
          setError('You do not have permission to view this order');
          setLoading(false);
          return;
        }

        // Show toast notification if status changed
        if (previousStatus && orderData.status !== previousStatus) {
          toast.success(`Order status updated to: ${orderData.status.replace('_', ' ')}`);
        }

        setPreviousStatus(orderData.status);
        setOrder(orderData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, orderId, previousStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
          <p className="text-sm text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Order {order.orderId}</h1>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt.toDate()).toLocaleDateString('en-KE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      <OrderTrackingTimeline
        currentStatus={order.status}
        statusHistory={order.statusHistory.map((h) => ({
          status: h.status,
          timestamp: h.timestamp.toDate(),
        }))}
        estimatedCompletion={order.estimatedCompletion?.toDate()}
        actualCompletion={order.actualCompletion?.toDate()}
      />

      {/* Order Details */}
      <OrderDetails order={order} />

      {/* Payment Information */}
      <PaymentInfo order={order} />
    </div>
  );
}
