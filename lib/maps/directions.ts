/**
 * Directions Utilities
 *
 * Get turn-by-turn directions and route information using Google Maps Directions API.
 *
 * @module lib/maps/directions
 */

import type { Coordinates } from './geocoding';

export interface DirectionsStep {
  instruction: string;
  distance: number;
  distanceText: string;
  duration: number;
  durationText: string;
  startLocation: Coordinates;
  endLocation: Coordinates;
}

export interface DirectionsRoute {
  /** Total distance in meters */
  distance: number;
  /** Distance in human-readable format */
  distanceText: string;
  /** Total duration in seconds */
  duration: number;
  /** Duration in human-readable format */
  durationText: string;
  /** Polyline encoding of the route (for map display) */
  polyline: string;
  /** Turn-by-turn steps */
  steps: DirectionsStep[];
  /** Start address */
  startAddress: string;
  /** End address */
  endAddress: string;
}

export interface DirectionsOptions {
  /** Travel mode */
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  /** Waypoints to visit along the route */
  waypoints?: Coordinates[];
  /** Optimize waypoint order */
  optimizeWaypoints?: boolean;
  /** Avoid tolls */
  avoidTolls?: boolean;
  /** Avoid highways */
  avoidHighways?: boolean;
  /** Avoid ferries */
  avoidFerries?: boolean;
  /** Get alternative routes */
  alternatives?: boolean;
}

/**
 * Get directions between two points
 *
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @param options - Routing options
 * @returns Promise<DirectionsRoute>
 */
export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  options: DirectionsOptions = {}
): Promise<DirectionsRoute> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`;

    // Add optional parameters
    if (options.mode) {
      url += `&mode=${options.mode}`;
    }

    if (options.waypoints && options.waypoints.length > 0) {
      const waypointsStr = options.waypoints
        .map((wp) => `${wp.lat},${wp.lng}`)
        .join('|');
      url += `&waypoints=${options.optimizeWaypoints ? 'optimize:true|' : ''}${waypointsStr}`;
    }

    const avoid: string[] = [];
    if (options.avoidTolls) avoid.push('tolls');
    if (options.avoidHighways) avoid.push('highways');
    if (options.avoidFerries) avoid.push('ferries');
    if (avoid.length > 0) {
      url += `&avoid=${avoid.join('|')}`;
    }

    if (options.alternatives) {
      url += '&alternatives=true';
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Directions API failed: ${data.status} - ${data.error_message || ''}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.value,
      distanceText: leg.distance.text,
      duration: leg.duration.value,
      durationText: leg.duration.text,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
        distance: step.distance.value,
        distanceText: step.distance.text,
        duration: step.duration.value,
        durationText: step.duration.text,
        startLocation: {
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        },
        endLocation: {
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
      })),
      startAddress: leg.start_address,
      endAddress: leg.end_address,
    };
  } catch (error) {
    console.error('Directions error:', error);
    throw error instanceof Error ? error : new Error('Failed to get directions');
  }
}

/**
 * Get multiple route alternatives
 *
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @param options - Routing options
 * @returns Promise<DirectionsRoute[]>
 */
export async function getRouteAlternatives(
  origin: Coordinates,
  destination: Coordinates,
  options: DirectionsOptions = {}
): Promise<DirectionsRoute[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const mainRoute = await getDirections(origin, destination, {
      ...options,
      alternatives: true,
    });

    // The API returns alternatives in the routes array
    // For now, we return just the main route
    // You can extend this to parse all alternatives
    return [mainRoute];
  } catch (error) {
    console.error('Route alternatives error:', error);
    throw error instanceof Error ? error : new Error('Failed to get route alternatives');
  }
}

/**
 * Decode a polyline string into an array of coordinates
 * Polylines are encoded using Google's encoding algorithm
 *
 * @param encoded - Encoded polyline string
 * @returns Array of coordinates
 */
export function decodePolyline(encoded: string): Coordinates[] {
  const coordinates: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return coordinates;
}

/**
 * Get estimated arrival time based on current time and duration
 *
 * @param durationSeconds - Duration in seconds
 * @param startTime - Optional start time (defaults to now)
 * @returns Estimated arrival Date
 */
export function getEstimatedArrival(
  durationSeconds: number,
  startTime: Date = new Date()
): Date {
  return new Date(startTime.getTime() + durationSeconds * 1000);
}
