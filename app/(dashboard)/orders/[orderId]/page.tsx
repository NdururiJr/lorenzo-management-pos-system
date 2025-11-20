'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/lib/db/orders';
import { PageContainer } from '@/components/ui/page-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import type { OrderExtended } from '@/lib/db/schema';

export default function DashboardOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.orderId as string;

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<OrderExtended>({
    queryKey: ['dashboard-order', orderId],
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

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.orderId}
          </h1>
          <p className="text-sm text-gray-500">
            Created on {formatDate(order.createdAt.toDate())}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Garments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.garments.map((garment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{garment.type}</p>
                        <p className="text-sm text-gray-500">
                          {garment.services.join(', ')} • {garment.color}
                        </p>
                        {garment.brand && (
                          <p className="text-xs text-gray-400">
                            Brand: {garment.brand}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(garment.price)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {garment.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="w-3 h-3" />
                    {order.customerPhone}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/customers/${order.customerId}`)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Collection Method
                </p>
                <p className="text-sm">
                  {order.collectionMethod.replace('_', ' ')}
                </p>
                {order.pickupAddress && (
                  <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mt-0.5" />
                    {order.pickupAddress.address}
                  </div>
                )}
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                  Return Method
                </p>
                <p className="text-sm">
                  {order.returnMethod.replace('_', ' ')}
                </p>
                {order.deliveryAddress && (
                  <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mt-0.5" />
                    {order.deliveryAddress.address}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
