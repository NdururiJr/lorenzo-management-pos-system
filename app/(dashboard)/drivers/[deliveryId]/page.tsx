/**
 * Driver Batch Details Page
 *
 * Detailed view of a single delivery batch for drivers.
 * Shows optimized route, turn-by-turn navigation, and delivery completion workflow.
 *
 * @module app/(dashboard)/drivers/[deliveryId]/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  Navigation,
  Phone,
  Package,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Play,
  StopCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { MapView, type MapMarker, type MapRoute } from '@/components/maps/MapView';
import { optimizeRoute, type DeliveryStop } from '@/lib/maps/route-optimizer';
import { geocodeAddress } from '@/lib/maps/geocoding';
import { formatDistance, formatDuration } from '@/lib/maps';
import { toast } from 'sonner';

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
    stops: DeliveryStop[];
  };
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  phoneNumber?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: any[];
  totalAmount: number;
  status: string;
  deliveryStatus?: 'pending' | 'delivered' | 'failed';
  deliveryNotes?: string;
  deliveryProof?: string;
  deliveredAt?: any;
}

export default function DriverBatchDetailsPage() {
  const { deliveryId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState('route');
  const [selectedStop, setSelectedStop] = useState<Order | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [proofPhoto, setProofPhoto] = useState<string>('');

  // Fetch delivery batch
  const { data: delivery, isLoading: loadingDelivery } = useQuery<Delivery>({
    queryKey: ['delivery', deliveryId],
    queryFn: async () => {
      const deliveryRef = doc(db, 'deliveries', deliveryId as string);
      const deliverySnap = await getDoc(deliveryRef);

      if (!deliverySnap.exists()) {
        throw new Error('Delivery not found');
      }

      return {
        deliveryId: deliverySnap.id,
        ...deliverySnap.data(),
      } as Delivery;
    },
    enabled: !!deliveryId,
  });

  // Fetch orders in this batch
  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ['delivery-orders', deliveryId],
    queryFn: async () => {
      if (!delivery?.orders.length) return [];

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('__name__', 'in', delivery.orders));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    },
    enabled: !!delivery?.orders.length,
  });

  // Optimize route on mount
  const { data: optimizedRoute, isLoading: loadingRoute } = useQuery({
    queryKey: ['optimized-route', deliveryId],
    queryFn: async () => {
      if (!orders.length) return null;

      // Convert orders to delivery stops
      const stops: DeliveryStop[] = await Promise.all(
        orders.map(async (order) => {
          const address = order.deliveryAddress
            ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
            : '';

          let coordinates = { lat: 0, lng: 0 };
          try {
            const geocoded = await geocodeAddress(address);
            coordinates = geocoded.coordinates;
          } catch (error) {
            console.error(`Failed to geocode ${address}:`, error);
          }

          return {
            id: order.id,
            address,
            coordinates,
            orderId: order.id,
            customerName: order.customerName,
          };
        })
      );

      // Optimize route
      return optimizeRoute(stops);
    },
    enabled: orders.length > 0,
    staleTime: Infinity, // Only optimize once
  });

  // Start delivery mutation
  const startDeliveryMutation = useMutation({
    mutationFn: async () => {
      const deliveryRef = doc(db, 'deliveries', deliveryId as string);
      await updateDoc(deliveryRef, {
        status: 'in_progress',
        startTime: Timestamp.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['driver-deliveries'] });
      toast.success('Delivery started!');
    },
    onError: (error) => {
      console.error('Start delivery error:', error);
      toast.error('Failed to start delivery');
    },
  });

  // Complete delivery mutation
  const completeDeliveryMutation = useMutation({
    mutationFn: async () => {
      const deliveryRef = doc(db, 'deliveries', deliveryId as string);
      await updateDoc(deliveryRef, {
        status: 'completed',
        endTime: Timestamp.now(),
        completionNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
      queryClient.invalidateQueries({ queryKey: ['driver-deliveries'] });
      toast.success('Delivery completed!');
      router.push('/drivers');
    },
    onError: (error) => {
      console.error('Complete delivery error:', error);
      toast.error('Failed to complete delivery');
    },
  });

  // Mark order as delivered/failed
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      notes,
      proof,
    }: {
      orderId: string;
      status: 'delivered' | 'failed';
      notes?: string;
      proof?: string;
    }) => {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryStatus: status,
        deliveryNotes: notes || '',
        deliveryProof: proof || '',
        deliveredAt: status === 'delivered' ? Timestamp.now() : null,
        status: status === 'delivered' ? 'completed' : 'out_for_delivery',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
      setSelectedStop(null);
      setCompletionNotes('');
      setProofPhoto('');
      toast.success('Order status updated');
    },
    onError: (error) => {
      console.error('Update order error:', error);
      toast.error('Failed to update order status');
    },
  });

  // Create map markers and routes
  const mapMarkers: MapMarker[] =
    optimizedRoute?.stops.map((stop) => ({
      id: stop.id,
      position: stop.coordinates,
      label: `${stop.sequence}`,
      title: `${stop.sequence}. ${stop.customerName}`,
      onClick: () => {
        const order = orders.find((o) => o.id === stop.id);
        if (order) setSelectedStop(order);
      },
    })) || [];

  const mapRoute: MapRoute | undefined = optimizedRoute
    ? {
        path: optimizedRoute.stops.map((s) => s.coordinates),
        color: '#3B82F6',
        strokeWeight: 4,
      }
    : undefined;

  const center =
    mapMarkers.length > 0
      ? mapMarkers[0].position
      : { lat: 40.7128, lng: -74.006 };

  // Get completed/pending counts
  const deliveredCount = orders.filter((o) => o.deliveryStatus === 'delivered').length;
  const failedCount = orders.filter((o) => o.deliveryStatus === 'failed').length;
  const pendingCount = orders.filter(
    (o) => !o.deliveryStatus || o.deliveryStatus === 'pending'
  ).length;

  const isLoading = loadingDelivery || loadingOrders || loadingRoute;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-600 mt-2">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <p className="font-semibold">Delivery not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/drivers')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/drivers')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-black">{delivery.deliveryId}</h1>
                <p className="text-sm text-gray-600">
                  {delivery.scheduledDate &&
                    format(delivery.scheduledDate.toDate(), 'MMM d, yyyy - h:mm a')}
                </p>
              </div>
            </div>
            {getStatusBadge(delivery.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-2xl font-bold text-black">{orders.length}</p>
                <p className="text-xs text-gray-600 mt-1">Total Orders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
                <p className="text-xs text-gray-600 mt-1">Delivered</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-6 h-6 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                <p className="text-xs text-gray-600 mt-1">Failed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {delivery.status === 'pending' && (
          <div className="mb-6">
            <Button
              size="lg"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              onClick={() => startDeliveryMutation.mutate()}
              disabled={startDeliveryMutation.isPending}
            >
              {startDeliveryMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Start Delivery
            </Button>
          </div>
        )}

        {delivery.status === 'in_progress' && pendingCount === 0 && (
          <div className="mb-6">
            <Button
              size="lg"
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
              onClick={() => setShowCompleteDialog(true)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Delivery
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="route">Route</TabsTrigger>
            <TabsTrigger value="stops">Stops ({orders.length})</TabsTrigger>
          </TabsList>

          {/* Route Tab */}
          <TabsContent value="route">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Optimized Route</CardTitle>
                  {optimizedRoute && (
                    <div className="text-sm text-gray-600">
                      {formatDistance(optimizedRoute.totalDistance)} ·{' '}
                      {formatDuration(optimizedRoute.totalDuration)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <MapView
                  center={center}
                  zoom={12}
                  markers={mapMarkers}
                  routes={mapRoute ? [mapRoute] : []}
                  className="h-96 md:h-[500px] rounded-lg overflow-hidden border"
                />

                {optimizedRoute && optimizedRoute.improvement.distanceSaved > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900">
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      Route optimized - Saved{' '}
                      {formatDistance(optimizedRoute.improvement.distanceSaved)} (
                      {optimizedRoute.improvement.percentageImproved.toFixed(1)}% shorter)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stops Tab */}
          <TabsContent value="stops">
            <div className="space-y-3">
              {orders
                .sort((a, b) => {
                  const aStop = optimizedRoute?.stops.find((s) => s.id === a.id);
                  const bStop = optimizedRoute?.stops.find((s) => s.id === b.id);
                  return (aStop?.sequence || 0) - (bStop?.sequence || 0);
                })
                .map((order) => {
                  const stop = optimizedRoute?.stops.find((s) => s.id === order.id);
                  const deliveryStatus = order.deliveryStatus || 'pending';

                  return (
                    <Card
                      key={order.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        deliveryStatus === 'delivered'
                          ? 'bg-green-50 border-green-200'
                          : deliveryStatus === 'failed'
                          ? 'bg-red-50 border-red-200'
                          : ''
                      }`}
                      onClick={() => setSelectedStop(order)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                            {stop?.sequence || '?'}
                          </div>

                          <div className="flex-grow">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-black">
                                  {order.customerName}
                                </p>
                                {order.phoneNumber && (
                                  <p className="text-sm text-gray-600">
                                    <Phone className="w-3 h-3 inline mr-1" />
                                    {order.phoneNumber}
                                  </p>
                                )}
                              </div>
                              {deliveryStatus === 'delivered' && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              )}
                              {deliveryStatus === 'failed' && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>

                            <div className="text-sm text-gray-700 mb-2">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {order.deliveryAddress &&
                                `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>
                                <Package className="w-3 h-3 inline mr-1" />
                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                              </span>
                              <span className="font-semibold">
                                ${order.totalAmount.toFixed(2)}
                              </span>
                            </div>

                            {order.deliveryNotes && (
                              <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                                {order.deliveryNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      {selectedStop && (
        <Dialog open={!!selectedStop} onOpenChange={() => setSelectedStop(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedStop.customerName}</DialogTitle>
              <DialogDescription>
                {selectedStop.deliveryAddress &&
                  `${selectedStop.deliveryAddress.street}, ${selectedStop.deliveryAddress.city}, ${selectedStop.deliveryAddress.state} ${selectedStop.deliveryAddress.zipCode}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Details */}
              <div>
                <Label className="text-sm font-medium">Order Details</Label>
                <div className="mt-2 space-y-2">
                  {selectedStop.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                    >
                      <span>
                        {item.quantity}x {item.type}
                      </span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>${selectedStop.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Notes */}
              {!selectedStop.deliveryStatus ||
                (selectedStop.deliveryStatus === 'pending' && (
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Delivery Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Add any notes about this delivery..."
                      className="mt-2"
                    />
                  </div>
                ))}

              {/* Proof of Delivery */}
              {selectedStop.deliveryStatus === 'delivered' &&
                selectedStop.deliveryProof && (
                  <div>
                    <Label className="text-sm font-medium">Proof of Delivery</Label>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                      {selectedStop.deliveryProof}
                    </div>
                  </div>
                )}
            </div>

            <DialogFooter className="gap-2">
              {(!selectedStop.deliveryStatus ||
                selectedStop.deliveryStatus === 'pending') && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      updateOrderStatusMutation.mutate({
                        orderId: selectedStop.id,
                        status: 'failed',
                        notes: completionNotes,
                      });
                    }}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark as Failed
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      updateOrderStatusMutation.mutate({
                        orderId: selectedStop.id,
                        status: 'delivered',
                        notes: completionNotes,
                        proof: 'Delivered successfully',
                      });
                    }}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    {updateOrderStatusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Mark as Delivered
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Complete Delivery Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Delivery Batch</DialogTitle>
            <DialogDescription>
              All orders have been processed. Add any final notes before completing.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
            <Textarea
              id="completion-notes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Any issues or notes about this delivery batch..."
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => completeDeliveryMutation.mutate()}
              disabled={completeDeliveryMutation.isPending}
            >
              {completeDeliveryMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Complete Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
