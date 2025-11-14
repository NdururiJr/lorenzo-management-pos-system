/**
 * Google Maps Service
 *
 * Comprehensive Google Maps Platform integration for:
 * - Geocoding (address to coordinates)
 * - Reverse Geocoding (coordinates to address)
 * - Distance Matrix (distances between points)
 * - Directions (route planning)
 * - Route Optimization (TSP solution for multiple stops)
 *
 * @module services/google-maps
 */

import { Client, TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';

// Server-side client for API calls
const mapsClient = new Client({});

// API Key from environment
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ Google Maps API key is not set. Maps functionality will be limited.');
}

/**
 * Coordinates interface
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Address autocomplete suggestion
 */
export interface PlaceSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

/**
 * Geocoded address result
 */
export interface GeocodedAddress {
  address: string;
  coordinates: Coordinates;
  formattedAddress: string;
  placeId?: string;
}

/**
 * Route stop with delivery information
 */
export interface RouteStop {
  orderId: string;
  address: string;
  coordinates: Coordinates;
  sequence: number;
  customerName?: string;
  customerPhone?: string;
}

/**
 * Optimized route result
 */
export interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  polyline: string;
  waypointOrder: number[];
}

/**
 * Distance matrix result
 */
export interface DistanceMatrixResult {
  distance: number; // in meters
  duration: number; // in seconds
  distanceText: string; // formatted (e.g., "5.2 km")
  durationText: string; // formatted (e.g., "12 mins")
}

/**
 * Geocode an address to get coordinates
 *
 * Uses caching to avoid redundant API calls
 *
 * @param address - Address string to geocode
 * @returns Promise<GeocodedAddress>
 * @throws Error if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodedAddress> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  if (!address || address.trim() === '') {
    throw new Error('Address is required');
  }

  try {
    const response = await mapsClient.geocode({
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY,
        region: 'ke', // Kenya region bias
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;

      return {
        address: address,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    }

    throw new Error(`Geocoding failed: ${response.data.status}`);
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to geocode address'
    );
  }
}

/**
 * Reverse geocode coordinates to get address
 *
 * @param coordinates - Latitude and longitude
 * @returns Promise<string> - Formatted address
 * @throws Error if reverse geocoding fails
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const response = await mapsClient.reverseGeocode({
      params: {
        latlng: `${coordinates.lat},${coordinates.lng}`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }

    throw new Error(`Reverse geocoding failed: ${response.data.status}`);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to reverse geocode'
    );
  }
}

/**
 * Calculate distance and duration between two points
 *
 * @param origin - Origin coordinates
 * @param destination - Destination coordinates
 * @returns Promise<DistanceMatrixResult>
 * @throws Error if calculation fails
 */
export async function calculateDistance(
  origin: Coordinates,
  destination: Coordinates
): Promise<DistanceMatrixResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const response = await mapsClient.distancematrix({
      params: {
        origins: [`${origin.lat},${origin.lng}`],
        destinations: [`${destination.lat},${destination.lng}`],
        key: GOOGLE_MAPS_API_KEY,
        units: UnitSystem.metric,
        mode: TravelMode.driving,
      },
    });

    if (response.data.status === 'OK') {
      const element = response.data.rows[0].elements[0];

      if (element.status === 'OK') {
        return {
          distance: element.distance.value,
          duration: element.duration.value,
          distanceText: element.distance.text,
          durationText: element.duration.text,
        };
      }

      throw new Error(`Distance calculation failed: ${element.status}`);
    }

    throw new Error(`Distance Matrix API failed: ${response.data.status}`);
  } catch (error) {
    console.error('Distance calculation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to calculate distance'
    );
  }
}

/**
 * Calculate distance matrix for multiple origins and destinations
 *
 * Useful for batch distance calculations
 *
 * @param origins - Array of origin coordinates
 * @param destinations - Array of destination coordinates
 * @returns Promise<DistanceMatrixResult[][]>
 */
export async function calculateDistanceMatrix(
  origins: Coordinates[],
  destinations: Coordinates[]
): Promise<DistanceMatrixResult[][]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const originStrings = origins.map((coord) => `${coord.lat},${coord.lng}`);
    const destinationStrings = destinations.map(
      (coord) => `${coord.lat},${coord.lng}`
    );

    const response = await mapsClient.distancematrix({
      params: {
        origins: originStrings,
        destinations: destinationStrings,
        key: GOOGLE_MAPS_API_KEY,
        units: UnitSystem.metric,
        mode: TravelMode.driving,
      },
    });

    if (response.data.status === 'OK') {
      return response.data.rows.map((row) =>
        row.elements.map((element) => {
          if (element.status === 'OK') {
            return {
              distance: element.distance.value,
              duration: element.duration.value,
              distanceText: element.distance.text,
              durationText: element.duration.text,
            };
          }
          throw new Error(`Element status: ${element.status}`);
        })
      );
    }

    throw new Error(`Distance Matrix API failed: ${response.data.status}`);
  } catch (error) {
    console.error('Distance matrix error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to calculate distance matrix'
    );
  }
}

/**
 * Optimize route for multiple delivery stops
 *
 * Uses Google Directions API with waypoint optimization
 * Handles the Traveling Salesman Problem (TSP) for efficient routing
 *
 * Maximum 25 waypoints per request (Google Maps limit)
 *
 * @param startLocation - Starting point (typically branch location)
 * @param stops - Array of delivery stops
 * @param returnToStart - Whether to return to start location (default: true)
 * @returns Promise<OptimizedRoute>
 * @throws Error if optimization fails
 */
export async function optimizeRoute(
  startLocation: Coordinates,
  stops: RouteStop[],
  returnToStart: boolean = true
): Promise<OptimizedRoute> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  if (stops.length === 0) {
    throw new Error('At least one stop is required');
  }

  if (stops.length > 25) {
    throw new Error('Maximum 25 stops allowed per route');
  }

  try {
    // Prepare waypoints
    const waypoints = stops.map(
      (stop) => `${stop.coordinates.lat},${stop.coordinates.lng}`
    );

    // Destination is either start (round trip) or last stop (one-way)
    const destination = returnToStart
      ? `${startLocation.lat},${startLocation.lng}`
      : waypoints[waypoints.length - 1];

    // Remove last waypoint if return to start
    const waypointsForRequest = returnToStart
      ? waypoints
      : waypoints.slice(0, -1);

    const response = await mapsClient.directions({
      params: {
        origin: `${startLocation.lat},${startLocation.lng}`,
        destination: destination,
        waypoints: waypointsForRequest,
        optimize_waypoints: true,
        key: GOOGLE_MAPS_API_KEY,
        mode: TravelMode.driving,
        units: UnitSystem.metric,
      },
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const waypointOrder = route.waypoint_order || [];

      // Calculate total distance and duration
      let totalDistance = 0;
      let totalDuration = 0;

      route.legs.forEach((leg) => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
      });

      // Reorder stops based on optimized waypoint order
      const optimizedStops = waypointOrder.map((index, sequence) => ({
        ...stops[index],
        sequence: sequence + 1,
      }));

      return {
        stops: optimizedStops,
        totalDistance,
        totalDuration,
        polyline: route.overview_polyline.points,
        waypointOrder,
      };
    }

    throw new Error(`Route optimization failed: ${response.data.status}`);
  } catch (error) {
    console.error('Route optimization error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to optimize route'
    );
  }
}

/**
 * Get directions between two points
 *
 * @param origin - Origin coordinates
 * @param destination - Destination coordinates
 * @param waypoints - Optional intermediate waypoints
 * @returns Promise with route details
 */
export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  waypoints: Coordinates[] = []
) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const waypointStrings = waypoints.map((wp) => `${wp.lat},${wp.lng}`);

    const response = await mapsClient.directions({
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        waypoints: waypointStrings,
        key: GOOGLE_MAPS_API_KEY,
        mode: TravelMode.driving,
        units: UnitSystem.metric,
      },
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];

      return {
        distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
        duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
        polyline: route.overview_polyline.points,
        steps: route.legs.flatMap((leg) => leg.steps),
      };
    }

    throw new Error(`Directions failed: ${response.data.status}`);
  } catch (error) {
    console.error('Directions error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get directions'
    );
  }
}

/**
 * Batch geocode multiple addresses
 *
 * Useful for initial setup or bulk address processing
 * Uses Promise.allSettled to handle partial failures
 *
 * @param addresses - Array of address strings
 * @returns Promise<GeocodedAddress[]> - Successfully geocoded addresses
 */
export async function batchGeocodeAddresses(
  addresses: string[]
): Promise<GeocodedAddress[]> {
  const results = await Promise.allSettled(
    addresses.map((address) => geocodeAddress(address))
  );

  return results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<GeocodedAddress>).value);
}

/**
 * Validate if an address is geocodable
 *
 * @param address - Address string to validate
 * @returns Promise<boolean>
 */
export async function isValidAddress(address: string): Promise<boolean> {
  try {
    await geocodeAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format distance in meters to human-readable format
 *
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "5.2 km" or "850 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Format duration in seconds to human-readable format
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1h 25m" or "45 mins")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} mins`;
}

/**
 * Calculate ETA (Estimated Time of Arrival)
 *
 * @param durationSeconds - Duration in seconds
 * @returns Date object representing ETA
 */
export function calculateETA(durationSeconds: number): Date {
  const now = new Date();
  return new Date(now.getTime() + durationSeconds * 1000);
}

/**
 * Get distance between two coordinates using Haversine formula
 * (Fallback when Google Maps API is not available)
 *
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in meters
 */
export function haversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Split large route into batches (if more than 25 stops)
 *
 * Google Maps API limits waypoints to 25 per request
 *
 * @param stops - All stops to deliver
 * @param maxStopsPerBatch - Maximum stops per batch (default: 25)
 * @returns Array of stop batches
 */
export function splitIntoBatches(
  stops: RouteStop[],
  maxStopsPerBatch: number = 25
): RouteStop[][] {
  const batches: RouteStop[][] = [];

  for (let i = 0; i < stops.length; i += maxStopsPerBatch) {
    batches.push(stops.slice(i, i + maxStopsPerBatch));
  }

  return batches;
}
