/**
 * Route Comparison Component
 *
 * Visualizes original vs optimized delivery routes side-by-side.
 *
 * @module components/maps/RouteComparison
 */

'use client';

import { MapView, type MapMarker, type MapRoute } from './MapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingDown, Clock, MapPin } from 'lucide-react';
import { formatDistance, formatDuration, type DeliveryStop, type OptimizedRoute } from '@/lib/maps';

interface RouteComparisonProps {
  originalStops: DeliveryStop[];
  optimizedResult: OptimizedRoute;
  depot?: { lat: number; lng: number };
}

export function RouteComparison({
  originalStops,
  optimizedResult,
  depot,
}: RouteComparisonProps) {
  // Create markers for original route
  const originalMarkers: MapMarker[] = originalStops.map((stop, index) => ({
    id: `original-${stop.id}`,
    position: stop.coordinates,
    label: `${index + 1}`,
    title: `${index + 1}. ${stop.customerName}`,
  }));

  // Create markers for optimized route
  const optimizedMarkers: MapMarker[] = optimizedResult.stops.map((stop) => ({
    id: `optimized-${stop.id}`,
    position: stop.coordinates,
    label: `${stop.sequence}`,
    title: `${stop.sequence}. ${stop.customerName}`,
  }));

  // Add depot marker if provided
  if (depot) {
    const depotMarker: MapMarker = {
      id: 'depot',
      position: depot,
      label: 'D',
      title: 'Depot/Warehouse',
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    };
    originalMarkers.unshift(depotMarker);
    optimizedMarkers.unshift(depotMarker);
  }

  // Create route paths
  const originalPath: MapRoute = {
    path: depot
      ? [depot, ...originalStops.map((s) => s.coordinates)]
      : originalStops.map((s) => s.coordinates),
    color: '#EF4444', // Red
    strokeWeight: 3,
  };

  const optimizedPath: MapRoute = {
    path: depot
      ? [depot, ...optimizedResult.stops.map((s) => s.coordinates)]
      : optimizedResult.stops.map((s) => s.coordinates),
    color: '#10B981', // Green
    strokeWeight: 3,
  };

  // Calculate center point
  const allCoords = [...originalStops.map((s) => s.coordinates)];
  if (depot) allCoords.unshift(depot);

  const center = {
    lat: allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length,
    lng: allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length,
  };

  const originalDistance = optimizedResult.totalDistance + optimizedResult.improvement.distanceSaved;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Distance Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-black">
                {formatDistance(optimizedResult.improvement.distanceSaved)}
              </span>
            </div>
            <Badge variant="outline" className="mt-2 border-green-500 text-green-700 bg-green-50">
              {optimizedResult.improvement.percentageImproved.toFixed(1)}% improvement
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Original Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-black">
                {formatDistance(originalDistance)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Sequential order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Optimized Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-black">
                {formatDistance(optimizedResult.totalDistance)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Clock className="w-3 h-3 inline mr-1" />
              ~{formatDuration(optimizedResult.totalDuration)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Route */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Original Route</CardTitle>
              <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                {formatDistance(originalDistance)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <MapView
              center={center}
              zoom={12}
              markers={originalMarkers}
              routes={[originalPath]}
              className="h-96 rounded-lg overflow-hidden border"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Stop Order:</p>
              <div className="flex flex-wrap gap-2">
                {originalStops.map((stop, index) => (
                  <Badge key={stop.id} variant="outline" className="text-xs">
                    {index + 1}. {stop.customerName}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimized Route */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Optimized Route</CardTitle>
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                {formatDistance(optimizedResult.totalDistance)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <MapView
              center={center}
              zoom={12}
              markers={optimizedMarkers}
              routes={[optimizedPath]}
              className="h-96 rounded-lg overflow-hidden border"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Optimized Order:</p>
              <div className="flex flex-wrap gap-2">
                {optimizedResult.stops.map((stop) => (
                  <Badge key={stop.id} variant="outline" className="text-xs bg-green-50">
                    {stop.sequence}. {stop.customerName}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Arrow */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-6 py-3">
          <span className="text-sm font-semibold text-green-900">
            Saves {formatDistance(optimizedResult.improvement.distanceSaved)}
          </span>
          <ArrowRight className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-green-900">
            {optimizedResult.improvement.percentageImproved.toFixed(1)}% more efficient
          </span>
        </div>
      </div>
    </div>
  );
}
