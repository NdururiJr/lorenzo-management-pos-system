'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/lib/db/orders';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import type { OrderExtended } from '@/lib/db/schema';

export default function CustomerOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.orderId as string;

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<OrderExtended>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      return getOrder(orderId);
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600">
            Order not found
          </h2>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Security check: Ensure the order belongs to the current user
  if (user && order.customerId !== user.uid) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600">Unauthorized</h2>
          <p>You do not have permission to view this order.</p>
          <Button
            variant="ghost"
            onClick={() => router.push('/portal')}
            className="mt-4"
          >
            Return to Portal
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 pl-0 hover:bg-transparent hover:text-brand-blue"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.orderId}
          </h1>
          <p className="text-gray-500">
            Placed on {formatDate(order.createdAt.toDate())}
          </p>
        </div>
        <StatusBadge status={order.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.garments.map((garment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{garment.type}</p>
                      <p className="text-sm text-gray-500">
                        {garment.services.join(', ')} • {garment.color}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(garment.price)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline/History could go here */}
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.collectionMethod === 'pickup_required' && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Pickup Address
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm">
                      {order.pickupAddress?.address || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              {order.returnMethod === 'delivery_required' && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Delivery Address
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm">
                      {order.deliveryAddress?.address || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              {order.collectionMethod === 'dropped_off' &&
                order.returnMethod === 'customer_collects' && (
                  <p className="text-sm text-gray-500">
                    Store Drop-off & Collection
                  </p>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : order.paymentStatus === 'partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Paid Amount</span>
                <span className="font-medium">
                  {formatCurrency(order.paidAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
