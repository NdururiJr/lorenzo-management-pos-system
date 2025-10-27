/**
 * Active Batches List Component
 *
 * Displays all active delivery batches (pending and in_progress).
 *
 * @module components/features/deliveries/ActiveBatchesList
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  User,
  Calendar,
  Loader2,
  ChevronRight,
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
  notes?: string;
}

interface Driver {
  name: string;
  email: string;
}

export function ActiveBatchesList() {
  // Fetch active deliveries
  const { data: deliveries = [], isLoading, error } = useQuery<Delivery[]>({
    queryKey: ['active-deliveries'],
    queryFn: async () => {
      const deliveriesRef = collection(db, 'deliveries');
      const q = query(
        deliveriesRef,
        where('status', 'in', ['pending', 'in_progress']),
        orderBy('scheduledDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        deliveryId: doc.id,
        ...doc.data(),
      })) as Delivery[];
    },
  });

  // Fetch driver info
  const { data: driversMap = {} } = useQuery<Record<string, Driver>>({
    queryKey: ['drivers-map'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'driver'));
      const snapshot = await getDocs(q);
      const map: Record<string, Driver> = {};
      snapshot.docs.forEach((doc) => {
        map[doc.id] = {
          name: doc.data().name || 'Unknown Driver',
          email: doc.data().email || '',
        };
      });
      return map;
    },
  });

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
            <Truck className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
            <Package className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-600">Loading delivery batches...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading delivery batches</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : 'Failed to load batches'}
          </p>
        </div>
      </Card>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No active delivery batches</p>
          <p className="text-sm mt-1">
            Create a delivery batch by selecting ready orders above
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {deliveries.map((delivery) => {
        const driver = driversMap[delivery.driverId];
        const scheduledDate = delivery.scheduledDate?.toDate();

        return (
          <Card key={delivery.deliveryId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-black">
                    {delivery.deliveryId}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Delivery Batch
                  </p>
                </div>
                {getStatusBadge(delivery.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Driver Info */}
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-black">
                    {driver?.name || 'Unknown Driver'}
                  </div>
                  {driver?.email && (
                    <div className="text-xs text-gray-500">{driver.email}</div>
                  )}
                </div>
              </div>

              {/* Order Count */}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {delivery.orders.length} order{delivery.orders.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Scheduled Date */}
              {scheduledDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {format(scheduledDate, 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              {/* Start Time (if in progress) */}
              {delivery.status === 'in_progress' && delivery.startTime && (
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
                  {delivery.notes}
                </div>
              )}

              {/* View Details Button */}
              <div className="pt-2 border-t">
                <Link href={`/drivers/${delivery.deliveryId}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between hover:bg-gray-100"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
