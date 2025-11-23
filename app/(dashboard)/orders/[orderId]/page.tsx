'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/lib/db/orders';
import { PageContainer } from '@/components/ui/page-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, ArrowLeft, User, Phone, MapPin, Navigation, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapView, type MapMarker, MarkerIcons } from '@/components/maps/MapView';
import type { OrderExtended } from '@/lib/db/schema';

export default function DashboardOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, userData } = useAuth();
  const orderId = params.orderId as string;
  const [showContactModal, setShowContactModal] = useState(false);

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

  // Check if user is a driver
  const isDriver = userData?.role === 'driver';

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

          {/* Delivery Location Map - Moved to left column */}
          {order.returnMethod === 'delivery_required' && order.deliveryAddress?.coordinates && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Delivery Location</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const { lat, lng } = order.deliveryAddress!.coordinates!;
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                        '_blank'
                      );
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MapView
                  center={order.deliveryAddress.coordinates}
                  zoom={15}
                  markers={[
                    {
                      id: 'delivery',
                      position: order.deliveryAddress.coordinates,
                      title: order.customerName,
                      icon: MarkerIcons.red,
                    },
                  ]}
                  className="h-[400px] w-full rounded-lg overflow-hidden border"
                />
                <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{order.deliveryAddress.address}</p>
                    {order.deliveryInstructions && (
                      <p className="mt-1 text-amber-600 font-medium">
                        📝 {order.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer Details Only */}
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
              {isDriver ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowContactModal(true)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Customer
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/customers/${order.customerId}`)}
                >
                  View Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Customer Modal (Driver Only) */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Contact Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Customer Name Card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                  <p className="text-lg font-semibold text-gray-900">{order.customerName}</p>
                </div>
              </div>
            </div>

            {/* Phone Number - Call Button */}
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 transition-colors rounded-lg p-4 border-2 border-green-200 hover:border-green-300"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-grow">
                <p className="text-xs text-gray-600 uppercase tracking-wide">Call</p>
                <p className="text-lg font-semibold text-gray-900">{order.customerPhone}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-green-600" />
            </a>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Delivery Address
                    </p>
                    <p className="text-sm font-medium text-gray-900">{order.deliveryAddress.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Instructions */}
            {order.deliveryInstructions && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-amber-900 font-semibold uppercase tracking-wide mb-1">
                      Special Instructions
                    </p>
                    <p className="text-sm text-amber-800 font-medium">
                      {order.deliveryInstructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigate Button */}
            {order.deliveryAddress?.coordinates && (
              <Button
                className="w-full h-12 text-base bg-brand-blue hover:bg-brand-blue-dark"
                onClick={() => {
                  const { lat, lng } = order.deliveryAddress!.coordinates!;
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                    '_blank'
                  );
                }}
              >
                <Navigation className="w-5 h-5 mr-2" />
                Open in Google Maps
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
