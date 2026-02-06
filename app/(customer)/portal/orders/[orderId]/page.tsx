'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getOrderByIdForCustomer } from '@/lib/db/orders';
import { ModernSection } from '@/components/modern/ModernLayout';
import { ModernCard, ModernCardContent } from '@/components/modern/ModernCard';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { OrderTrackingTimeline } from '@/components/features/customer/OrderTrackingTimeline';
import { OrderStatusBanner } from '@/components/features/customer/OrderStatusBanner';
import { BranchInfoCard } from '@/components/features/customer/BranchInfoCard';
import { PaymentInfo } from '@/components/features/customer/PaymentInfo';
import { PaymentStub } from '@/components/features/customer/PaymentStub';
import { LiveDriverMap } from '@/components/features/customer/LiveDriverMap';
import type { OrderExtended } from '@/lib/db/schema';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CustomerOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.orderId as string;

  // First, fetch customer profile to get customerId
  const { data: customer } = useQuery({
    queryKey: ['customer-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;

      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('email', '==', user.email), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
      }
      return null;
    },
    enabled: !!user?.email,
  });

  // Then fetch the order using customerId
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<OrderExtended>({
    queryKey: ['order', orderId, customer?.customerId],
    queryFn: async () => {
      if (!customer?.customerId) {
        throw new Error('No customer profile found');
      }
      return getOrderByIdForCustomer(orderId, customer.customerId);
    },
    enabled: !!orderId && !!customer?.customerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <ModernSection animate>
        <FloatingOrbs />
        <ModernCard>
          <ModernCardContent>
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Order Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                This order doesn't exist or you don't have permission to view it.
              </p>
              <Button
                variant="default"
                onClick={() => router.push('/portal')}
                className="bg-brand-blue hover:bg-brand-blue-dark"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Portal
              </Button>
            </div>
          </ModernCardContent>
        </ModernCard>
      </ModernSection>
    );
  }

  return (
    <ModernSection animate>
      <FloatingOrbs />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 pl-0 hover:bg-transparent hover:text-brand-blue"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </motion.div>

      {/* Order Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.orderId}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt.toDate())}
          </p>
        </div>
        <StatusBadge status={order.status} size="lg" />
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <OrderStatusBanner status={order.status} orderId={order.orderId} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <ModernCard>
              <ModernCardContent>
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.garments.map((garment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{garment.type}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {garment.services.join(', ')} • {garment.color}
                        </p>
                        {garment.specialInstructions && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            Note: {garment.specialInstructions}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(garment.price)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                    <span>Total Amount</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>

          {/* Order Tracking Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <ModernCard>
              <ModernCardContent>
                <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
                <OrderTrackingTimeline
                  currentStatus={order.status}
                  statusHistory={(order.statusHistory || []).map((entry) => ({
                    status: entry.status,
                    timestamp: entry.timestamp.toDate(),
                    completedBy: entry.updatedBy,
                  }))}
                  estimatedCompletion={order.estimatedCompletion?.toDate()}
                />
              </ModernCardContent>
            </ModernCard>
          </motion.div>

          {/* Live Driver Tracking - only show when out_for_delivery */}
          {order.status === 'out_for_delivery' && order.deliveryAddress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <LiveDriverMap
                orderId={order.orderId}
                deliveryAddress={order.deliveryAddress}
              />
            </motion.div>
          )}
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <PaymentInfo order={order} />
          </motion.div>

          {/* Payment Stub - Show if payment needed */}
          {order.paymentStatus !== 'paid' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <PaymentStub
                amountDue={order.totalAmount - (order.paidAmount || 0)}
                paymentStatus={order.paymentStatus}
                orderId={order.orderId}
              />
            </motion.div>
          )}

          {/* Branch Information */}
          {order.branchId && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <BranchInfoCard branchId={order.branchId} />
            </motion.div>
          )}

          {/* Delivery/Pickup Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pickup Address */}
                {order.collectionMethod === 'pickup_required' && order.pickupAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Pickup Address
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900">
                        {order.pickupAddress.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {order.returnMethod === 'delivery_required' && order.deliveryAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Delivery Address
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900">
                        {order.deliveryAddress.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Store Collection */}
                {order.collectionMethod === 'dropped_off' &&
                  order.returnMethod === 'customer_collects' && (
                    <p className="text-sm text-gray-600">
                      Drop-off & Store Collection
                    </p>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ModernSection>
  );
}
