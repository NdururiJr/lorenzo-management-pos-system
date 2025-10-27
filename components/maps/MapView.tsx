/**
 * Map View Component
 *
 * Google Maps integration component with markers, routes, and interactive controls.
 *
 * @module components/maps/MapView
 */

'use client';

import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import type { Coordinates } from '@/lib/maps';

const DEFAULT_CENTER: Coordinates = {
  lat: -1.286389, // Nairobi, Kenya
  lng: 36.817223,
};

const DEFAULT_ZOOM = 13;

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export interface MapMarker {
  id: string;
  position: Coordinates;
  label?: string;
  title?: string;
  icon?: string;
  onClick?: () => void;
}

export interface MapRoute {
  path: Coordinates[];
  color?: string;
  strokeWeight?: number;
}

interface MapViewProps {
  center?: Coordinates;
  zoom?: number;
  markers?: MapMarker[];
  routes?: MapRoute[];
  onMapClick?: (position: Coordinates) => void;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
}

export function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  routes = [],
  onMapClick,
  onMarkerClick,
  className = '',
}: MapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onMapClick) {
        onMapClick({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
    },
    [onMapClick]
  );

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      setSelectedMarker(markerId);
      if (onMarkerClick) {
        onMarkerClick(markerId);
      }
    },
    [onMarkerClick]
  );

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold">Error loading maps</p>
          <p className="text-sm text-gray-600 mt-1">
            {loadError.message || 'Failed to load Google Maps'}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-600 mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={MAP_OPTIONS}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            label={marker.label}
            icon={marker.icon}
            onClick={() => handleMarkerClick(marker.id)}
          >
            {selectedMarker === marker.id && marker.title && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div className="p-2">
                  <p className="font-semibold text-black">{marker.title}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Render routes */}
        {routes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            path={route.path}
            options={{
              strokeColor: route.color || '#000000',
              strokeOpacity: 0.8,
              strokeWeight: route.strokeWeight || 4,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

/**
 * Simple marker icon helper
 */
export const MarkerIcons = {
  default: undefined,
  blue: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  red: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  green: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  yellow: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
};
