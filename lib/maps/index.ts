/**
 * Maps Module Exports
 *
 * Centralized exports for all map-related utilities.
 *
 * @module lib/maps
 */

// Geocoding
export {
  geocodeAddress,
  reverseGeocode,
  getAddressSuggestions,
  getPlaceDetails,
  type Coordinates,
  type GeocodeResult,
} from './geocoding';

// Distance calculations
export {
  calculateDistance,
  calculateDistances,
  haversineDistance,
  formatDistance,
  formatDuration,
  type DistanceResult,
} from './distance';

// Directions
export {
  getDirections,
  getRouteAlternatives,
  decodePolyline,
  getEstimatedArrival,
  type DirectionsRoute,
  type DirectionsStep,
  type DirectionsOptions,
} from './directions';

// Route Optimization
export {
  optimizeRoute,
  getOptimizedRouteWithDirections,
  compareRoutes,
  type DeliveryStop,
  type OptimizedRoute,
} from './route-optimizer';
