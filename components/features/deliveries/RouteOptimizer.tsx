/**
 * Route Optimizer Component
 *
 * UI for optimizing delivery routes using Google Maps Directions API.
 * Handles route calculation, displays metrics, and allows reordering.
 *
 * @module components/features/deliveries/RouteOptimizer
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Navigation,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Route as RouteIcon,
} from 'lucide-react';
import {
  optimizeRoute,
  formatDistance,
  formatDuration,
  calculateETA,
  type RouteStop,
  type Coordinates,
  type OptimizedRoute,
} from '@/services/google-maps';
import { format } from 'date-fns';

interface RouteOptimizerProps {
  /** Starting location (branch) */
  startLocation: Coordinates;
  /** Delivery stops to optimize */
  stops: RouteStop[];
  /** Whether to return to start location */
  returnToStart?: boolean;
  /** Callback when route is optimized */
  onRouteOptimized?: (route: OptimizedRoute) => void;
  /** Callback to update stops order */
  onStopsReordered?: (stops: RouteStop[]) => void;
}

export function RouteOptimizer({
  startLocation,
  stops,
  returnToStart = true,
  onRouteOptimized,
  onStopsReordered,
}: RouteOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (stops.length === 0) {
      setError('No stops to optimize');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const result = await optimizeRoute(startLocation, stops, returnToStart);
      setOptimizedRoute(result);

      if (onRouteOptimized) {
        onRouteOptimized(result);
      }

      if (onStopsReordered) {
        onStopsReordered(result.stops);
      }
    } catch (err) {
      console.error('Route optimization error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to optimize route'
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  // Calculate ETA
  const eta = optimizedRoute
    ? calculateETA(optimizedRoute.totalDuration)
    : null;

  return (
    <div className="space-y-4">
      {/* Optimize Button */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-black">Route Optimization</h3>
            <p className="text-sm text-gray-600 mt-1">
              Optimize delivery route for minimum time and distance
            </p>
          </div>
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing || stops.length === 0}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <RouteIcon className="w-4 h-4 mr-2" />
                Optimize Route
              </>
            )}
          </Button>
        </div>

        {/* Stops count */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {stops.length} stop{stops.length !== 1 ? 's' : ''} to deliver
          </span>
          {stops.length > 25 && (
            <Badge variant="destructive" className="ml-2">
              Exceeds 25 stop limit
            </Badge>
          )}
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Optimization Results */}
      {optimizedRoute && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-black">Route Optimized</h3>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              Optimized
            </Badge>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Distance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                <Navigation className="w-4 h-4" />
                <span>Total Distance</span>
              </div>
              <p className="text-2xl font-bold text-black">
                {formatDistance(optimizedRoute.totalDistance)}
              </p>
            </div>

            {/* Total Duration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>Estimated Time</span>
              </div>
              <p className="text-2xl font-bold text-black">
                {formatDuration(optimizedRoute.totalDuration)}
              </p>
            </div>

            {/* ETA */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>Estimated Arrival</span>
              </div>
              <p className="text-2xl font-bold text-black">
                {eta ? format(eta, 'h:mm a') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Optimized Stop Order */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-black mb-3">Optimized Stop Order</h4>
            <div className="space-y-2">
              {/* Starting point */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
                  S
                </div>
                <div className="flex-1">
                  <p className="font-medium text-black">Branch (Start)</p>
                  <p className="text-xs text-gray-500">
                    {startLocation.lat.toFixed(6)}, {startLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Delivery stops */}
              {optimizedRoute.stops.map((stop, index) => (
                <div
                  key={stop.orderId}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                    {stop.sequence}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">
                      {stop.customerName || `Order ${stop.orderId}`}
                    </p>
                    <p className="text-sm text-gray-600">{stop.address}</p>
                    {stop.customerPhone && (
                      <p className="text-xs text-gray-500 mt-1">
                        {stop.customerPhone}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stop.orderId}
                  </Badge>
                </div>
              ))}

              {/* Return to start (if enabled) */}
              {returnToStart && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
                    E
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">Return to Branch</p>
                    <p className="text-xs text-gray-500">End of route</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Route optimization considers real-time traffic
              conditions and road closures. Actual travel time may vary.
            </p>
          </div>
        </Card>
      )}

      {/* Help Text */}
      {!optimizedRoute && !error && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex gap-3">
            <RouteIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-gray-700">How Route Optimization Works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Analyzes all delivery addresses and current traffic</li>
                <li>Calculates the most efficient order to minimize time and distance</li>
                <li>Considers real-time road conditions</li>
                <li>Maximum 25 stops per route (Google Maps limit)</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
