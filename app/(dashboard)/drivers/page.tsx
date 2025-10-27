/**
 * Drivers Dashboard Page
 *
 * Main dashboard for drivers to view their assigned delivery batches.
 * Shows today's deliveries, pending batches, and delivery history.
 *
 * @module app/(dashboard)/drivers/page
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader2,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Delivery {
  deliveryId: string;
  driverId: string;
  orders: string[];
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate?: any;
  startTime?: any;
  endTime?: any;
  notes?: string;
  route?: {
    distance: number;
    estimatedDuration: number;
    stops: any[];
  };
}

export default function DriversPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('today');

  // Fetch driver's deliveries
  const { data: deliveries = [], isLoading } = useQuery<Delivery[]>({
    queryKey: ['driver-deliveries', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      const deliveriesRef = collection(db, 'deliveries');
      const q = query(
        deliveriesRef,
        where('driverId', '==', user.uid),
        orderBy('scheduledDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        deliveryId: doc.id,
        ...doc.data(),
      })) as Delivery[];
    },
    enabled: !!user?.uid,
  });

  // Filter deliveries by tab
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayDeliveries = deliveries.filter((d) => {
    if (!d.scheduledDate) return false;
    const date = d.scheduledDate.toDate();
    return date >= todayStart && date <= todayEnd;
  });

  const pendingDeliveries = deliveries.filter((d) => d.status === 'pending');
  const inProgressDeliveries = deliveries.filter((d) => d.status === 'in_progress');
  const completedDeliveries = deliveries.filter((d) => d.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
            <Navigation className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => {
    const scheduledDate = delivery.scheduledDate?.toDate();

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-black">
                {delivery.deliveryId}
              </CardTitle>
              {scheduledDate && (
                <p className="text-xs text-gray-500 mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {format(scheduledDate, 'MMM d, yyyy - h:mm a')}
                </p>
              )}
            </div>
            {getStatusBadge(delivery.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Orders Count */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {delivery.orders.length} order{delivery.orders.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Route Info */}
          {delivery.route && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                {delivery.route.stops.length} stop{delivery.route.stops.length !== 1 ? 's' : ''}
                {delivery.route.distance > 0 && (
                  <span className="text-gray-500 ml-1">
                    · {(delivery.route.distance / 1000).toFixed(1)} km
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Start Time */}
          {delivery.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                Started: {format(delivery.startTime.toDate(), 'h:mm a')}
              </span>
            </div>
          )}

          {/* Notes */}
          {delivery.notes && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {delivery.notes}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 border-t">
            <Link href={`/drivers/${delivery.deliveryId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between hover:bg-gray-100"
              >
                <span>
                  {delivery.status === 'pending'
                    ? 'Start Delivery'
                    : delivery.status === 'in_progress'
                    ? 'Continue Delivery'
                    : 'View Details'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-600 mt-2">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Driver Dashboard</h1>
              <p className="text-gray-600 text-sm">Your assigned delivery batches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-black">{todayDeliveries.length}</p>
                <p className="text-xs text-gray-600 mt-1">Today's Deliveries</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingDeliveries.length}</p>
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{inProgressDeliveries.length}</p>
                <p className="text-xs text-gray-600 mt-1">In Progress</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedDeliveries.length}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="today">Today ({todayDeliveries.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingDeliveries.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressDeliveries.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedDeliveries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            {todayDeliveries.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">No deliveries scheduled for today</p>
                  <p className="text-sm mt-1">Check back later or view pending batches</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayDeliveries.map((delivery) => (
                  <DeliveryCard key={delivery.deliveryId} delivery={delivery} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingDeliveries.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">No pending deliveries</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingDeliveries.map((delivery) => (
                  <DeliveryCard key={delivery.deliveryId} delivery={delivery} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {inProgressDeliveries.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">No deliveries in progress</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressDeliveries.map((delivery) => (
                  <DeliveryCard key={delivery.deliveryId} delivery={delivery} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedDeliveries.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">No completed deliveries</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedDeliveries.map((delivery) => (
                  <DeliveryCard key={delivery.deliveryId} delivery={delivery} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
