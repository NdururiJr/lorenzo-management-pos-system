/**
 * Distance Calculation Utilities
 *
 * Calculate distances and travel times using Google Maps Distance Matrix API.
 *
 * @module lib/maps/distance
 */

import type { Coordinates } from './geocoding';

export interface DistanceResult {
  /** Distance in meters */
  distance: number;
  /** Distance in human-readable format (e.g., "5.2 km") */
  distanceText: string;
  /** Duration in seconds */
  duration: number;
  /** Duration in human-readable format (e.g., "15 mins") */
  durationText: string;
}

/**
 * Calculate distance and travel time between two points
 *
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @param mode - Travel mode (driving, walking, bicycling, transit)
 * @returns Promise<DistanceResult>
 */
export async function calculateDistance(
  origin: Coordinates,
  destination: Coordinates,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<DistanceResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=${mode}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API failed: ${data.status}`);
    }

    const element = data.rows[0]?.elements[0];

    if (!element || element.status !== 'OK') {
      throw new Error(`Route not found or unavailable`);
    }

    return {
      distance: element.distance.value,
      distanceText: element.distance.text,
      duration: element.duration.value,
      durationText: element.duration.text,
    };
  } catch (error) {
    console.error('Distance calculation error:', error);
    throw error instanceof Error ? error : new Error('Failed to calculate distance');
  }
}

/**
 * Calculate distances from one origin to multiple destinations
 *
 * @param origin - Starting coordinates
 * @param destinations - Array of destination coordinates
 * @param mode - Travel mode
 * @returns Promise<DistanceResult[]>
 */
export async function calculateDistances(
  origin: Coordinates,
  destinations: Coordinates[],
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<DistanceResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  if (destinations.length === 0) {
    return [];
  }

  try {
    const destinationsStr = destinations
      .map((dest) => `${dest.lat},${dest.lng}`)
      .join('|');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destinationsStr}&mode=${mode}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API failed: ${data.status}`);
    }

    const elements = data.rows[0]?.elements || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return elements.map((element: any) => {
      if (element.status !== 'OK') {
        return {
          distance: 0,
          distanceText: 'N/A',
          duration: 0,
          durationText: 'N/A',
        };
      }

      return {
        distance: element.distance.value,
        distanceText: element.distance.text,
        duration: element.duration.value,
        durationText: element.duration.text,
      };
    });
  } catch (error) {
    console.error('Distances calculation error:', error);
    throw error instanceof Error ? error : new Error('Failed to calculate distances');
  }
}

/**
 * Calculate Haversine distance between two coordinates (in meters)
 * This is a client-side calculation that doesn't require API calls.
 *
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @returns Distance in meters
 */
export function haversineDistance(origin: Coordinates, destination: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (origin.lat * Math.PI) / 180;
  const φ2 = (destination.lat * Math.PI) / 180;
  const Δφ = ((destination.lat - origin.lat) * Math.PI) / 180;
  const Δλ = ((destination.lng - origin.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Format distance in human-readable format
 *
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "5.2 km" or "450 m")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration in human-readable format
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1h 30m" or "45 mins")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} mins`;
}
