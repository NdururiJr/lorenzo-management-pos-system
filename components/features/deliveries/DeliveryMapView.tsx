/**
 * Delivery Map View Component
 *
 * Interactive map showing delivery route with all stops.
 * Uses Google Maps JavaScript API via @react-google-maps/api
 *
 * @module components/features/deliveries/DeliveryMapView
 */

'use client';

import { useCallback, useState, useMemo } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Polyline,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { Loader2, MapPin, Navigation, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RouteStop, Coordinates } from '@/services/google-maps';

const libraries: ('places' | 'geometry' | 'drawing')[] = ['places', 'geometry'];

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.5rem',
};

// Default center (Kilimani, Nairobi)
const defaultCenter: Coordinates = {
  lat: -1.2921,
  lng: 36.7872,
};

// Map options
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

interface DeliveryMapViewProps {
  /** Delivery stops to display */
  stops: RouteStop[];
  /** Starting location (branch) */
  startLocation: Coordinates;
  /** Optimized route polyline */
  polyline?: string;
  /** Whether map is in view-only mode */
  viewOnly?: boolean;
  /** Callback when requesting navigation */
  onNavigate?: (stop: RouteStop) => void;
}

export function DeliveryMapView({
  stops,
  startLocation,
  polyline,
  viewOnly = false,
  onNavigate,
}: DeliveryMapViewProps) {
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Calculate map bounds to fit all markers
  const bounds = useMemo(() => {
    if (!isLoaded) return null;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(startLocation.lat, startLocation.lng));

    stops.forEach((stop) => {
      bounds.extend(new google.maps.LatLng(stop.coordinates.lat, stop.coordinates.lng));
    });

    return bounds;
  }, [isLoaded, startLocation, stops]);

  // Fit map to bounds when map loads
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);
      if (bounds) {
        map.fitBounds(bounds);
      }
    },
    [bounds]
  );

  // Handle marker click
  const handleMarkerClick = useCallback((stop: RouteStop) => {
    setSelectedStop(stop);
  }, []);

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedStop(null);
  }, []);

  // Handle navigation request
  const handleNavigate = useCallback(
    (stop: RouteStop) => {
      if (onNavigate) {
        onNavigate(stop);
      } else {
        // Open Google Maps in new tab
        const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.coordinates.lat},${stop.coordinates.lng}`;
        window.open(url, '_blank');
      }
    },
    [onNavigate]
  );

  // Polyline options
  const polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#000000',
    strokeOpacity: 0.8,
    strokeWeight: 4,
  };

  // Loading state
  if (!isLoaded) {
    return (
      <Card className="p-8 flex items-center justify-center" style={{ height: '600px' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (loadError) {
    return (
      <Card className="p-8 flex items-center justify-center bg-red-50" style={{ height: '600px' }}>
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 font-semibold">Failed to load map</p>
          <p className="text-sm text-gray-600 mt-2">
            {loadError.message || 'Please check your internet connection and try again.'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={startLocation}
        zoom={12}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* Starting location (branch) marker */}
        <Marker
          position={startLocation}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#000000" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="20" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          }}
          title="Branch Location"
        />

        {/* Delivery stop markers */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.orderId}
            position={stop.coordinates}
            label={{
              text: `${stop.sequence || index + 1}`,
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 16,
              fillColor: '#10B981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            onClick={() => handleMarkerClick(stop)}
            title={`Stop ${stop.sequence || index + 1}: ${stop.customerName || stop.orderId}`}
          />
        ))}

        {/* Info window for selected stop */}
        {selectedStop && (
          <InfoWindow
            position={selectedStop.coordinates}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-black mb-2">
                Stop {selectedStop.sequence}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Order:</span> {selectedStop.orderId}
                </p>
                {selectedStop.customerName && (
                  <p className="text-gray-600">
                    <span className="font-medium">Customer:</span> {selectedStop.customerName}
                  </p>
                )}
                {selectedStop.customerPhone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {selectedStop.customerPhone}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span> {selectedStop.address}
                </p>
              </div>
              {!viewOnly && (
                <Button
                  size="sm"
                  className="mt-3 w-full bg-black hover:bg-gray-800 text-white"
                  onClick={() => handleNavigate(selectedStop)}
                >
                  <Navigation className="w-3 h-3 mr-2" />
                  Navigate
                </Button>
              )}
            </div>
          </InfoWindow>
        )}

        {/* Route polyline (if available) */}
        {polyline && (
          <Polyline
            path={google.maps.geometry.encoding.decodePath(polyline)}
            options={polylineOptions}
          />
        )}
      </GoogleMap>

      {/* Map legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
            <span className="text-gray-700">Branch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
            <span className="text-gray-700">Delivery Stop</span>
          </div>
          {polyline && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-black"></div>
              <span className="text-gray-700">Optimized Route</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
