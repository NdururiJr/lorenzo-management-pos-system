/**
 * Live Driver Map Component
 *
 * Real-time driver tracking map for customer orders that are out for delivery.
 * Shows driver location, customer location, route, and estimated arrival time.
 *
 * @module components/features/customer/LiveDriverMap
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapView, type MapMarker, type MapRoute, MarkerIcons } from '@/components/maps/MapView';
import { isLocationStale } from '@/lib/db/driver-locations';
import { calculateDistance, type DistanceResult } from '@/lib/maps/distance';
import { getDelivery } from '@/lib/db/deliveries';
import { getUser } from '@/lib/db/users';
import { getOrder } from '@/lib/db/orders';
import type { DriverLocation, Delivery, User } from '@/lib/db/schema';
import { Loader2, MapPin, Phone, Clock, AlertCircle, Car } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LiveDriverMapProps {
  orderId: string;
  deliveryAddress: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export function LiveDriverMap({ orderId, deliveryAddress }: LiveDriverMapProps) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [driverInfo, setDriverInfo] = useState<User | null>(null);
  const [eta, setEta] = useState<DistanceResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch delivery information
  useEffect(() => {
    async function fetchDelivery() {
      try {
        setIsLoading(true);
        setError(null);

        // Get order to find deliveryId
        const order = await getOrder(orderId);

        if (!order.deliveryId) {
          setError('This order is not yet out for delivery.');
          setIsLoading(false);
          return;
        }

        // Fetch delivery details
        const deliveryData = await getDelivery(order.deliveryId);
        setDelivery(deliveryData);
      } catch (err: any) {
        console.error('Failed to fetch delivery:', err);
        setError(err.message || 'Failed to load delivery information.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDelivery();
  }, [orderId]);

  // Poll driver location updates via secure API endpoint
  // Replaces direct Firestore subscription to prevent unauthorized access
  useEffect(() => {
    if (!delivery) return;

    async function fetchDriverLocation() {
      if (!delivery) return; // Additional null check for TypeScript

      try {
        const response = await fetch(
          `/api/deliveries/${delivery.deliveryId}/location?orderId=${orderId}`
        );

        if (!response.ok) {
          if (response.status === 403) {
            setError('Unable to access driver location for this order.');
          }
          return;
        }

        const data = await response.json();
        const location = data.location;

        setDriverLocation(location);

        // Calculate ETA when location updates
        if (
          location &&
          !isLocationStale(location) &&
          deliveryAddress.coordinates
        ) {
          calculateDistance(location.location, deliveryAddress.coordinates)
            .then(setEta)
            .catch((err) => console.error('Failed to calculate ETA:', err));
        }
      } catch (err: any) {
        console.error('Failed to fetch driver location:', err);
      }
    }

    // Initial fetch
    fetchDriverLocation();

    // Poll every 5 seconds for real-time updates
    const pollInterval = setInterval(fetchDriverLocation, 5000);

    return () => clearInterval(pollInterval);
  }, [delivery, orderId, deliveryAddress.coordinates]);

  // Fetch driver information
  useEffect(() => {
    async function fetchDriver() {
      if (!delivery?.driverId) return;

      try {
        const driver = await getUser(delivery.driverId);
        setDriverInfo(driver);
      } catch (err) {
        console.error('Failed to fetch driver info:', err);
      }
    }

    fetchDriver();
  }, [delivery]);

  // Prepare map markers and route
  const markers: MapMarker[] = [];
  const routes: MapRoute[] = [];

  if (driverLocation && !isLocationStale(driverLocation)) {
    // Driver marker
    markers.push({
      id: 'driver',
      position: driverLocation.location,
      title: `Driver: ${driverInfo?.name || 'On the way'}`,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });
  }

  if (deliveryAddress.coordinates) {
    // Customer delivery location marker
    markers.push({
      id: 'customer',
      position: deliveryAddress.coordinates,
      title: 'Delivery Location',
      icon: MarkerIcons.red,
    });

    // Draw route line if both markers exist
    if (driverLocation && !isLocationStale(driverLocation)) {
      routes.push({
        path: [driverLocation.location, deliveryAddress.coordinates],
        color: '#22BBFF',
        strokeWeight: 3,
      });
    }
  }

  // Calculate center point for map
  const mapCenter =
    driverLocation && !isLocationStale(driverLocation)
      ? driverLocation.location
      : deliveryAddress.coordinates || { lat: -1.286389, lng: 36.817223 };

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  const locationIsStale = isLocationStale(driverLocation);

  return (
    <Card className="overflow-hidden">
      {/* Driver Info Header */}
      {driverInfo && (
        <div className="p-4 bg-brand-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold">
                {driverInfo.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{driverInfo.name}</p>
                <p className="text-sm text-gray-600">Your Driver</p>
              </div>
            </div>
            {driverInfo.phone && (
              <a
                href={`tel:${driverInfo.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Call</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ETA Display */}
      {eta && !locationIsStale && (
        <div className="p-4 bg-green-50 border-b border-green-100">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Estimated Arrival</p>
              <p className="text-lg font-semibold text-green-800">{eta.durationText}</p>
              <p className="text-xs text-green-600">{eta.distanceText} away</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Stale Warning */}
      {locationIsStale && (
        <div className="p-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Location unavailable</p>
              <p className="text-xs text-amber-600">
                {driverLocation
                  ? `Last updated ${formatDistanceToNow(driverLocation.lastUpdated.toDate(), { addSuffix: true })}`
                  : 'Driver location not available'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative">
        <MapView
          center={mapCenter}
          zoom={14}
          markers={markers}
          routes={routes}
          className="h-[400px] w-full"
        />

        {/* Live indicator */}
        {!locationIsStale && driverLocation && (
          <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Live</span>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-500">Delivery Address</p>
            <p className="text-sm text-gray-900 mt-1">{deliveryAddress.address}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
