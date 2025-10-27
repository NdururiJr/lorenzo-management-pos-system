/**
 * Route Optimization Utilities
 *
 * Implements TSP (Traveling Salesman Problem) algorithms for optimal delivery routing.
 * Uses nearest neighbor heuristic with 2-opt improvement.
 *
 * @module lib/maps/route-optimizer
 */

import { calculateDistances, haversineDistance, type DistanceResult } from './distance';
import type { Coordinates } from './geocoding';
import { getDirections, type DirectionsRoute } from './directions';

export interface DeliveryStop {
  id: string;
  address: string;
  coordinates: Coordinates;
  orderId: string;
  customerName: string;
  sequence?: number;
}

export interface OptimizedRoute {
  stops: DeliveryStop[];
  totalDistance: number;
  totalDuration: number;
  route?: DirectionsRoute;
  improvement: {
    distanceSaved: number;
    percentageImproved: number;
  };
}

/**
 * Calculate distance matrix between all stops
 * Uses Haversine for speed, optionally can use Google API for accuracy
 *
 * @param stops - Array of delivery stops
 * @param useGoogleAPI - Whether to use Google API (slower but more accurate)
 * @returns Distance matrix
 */
async function calculateDistanceMatrix(
  stops: DeliveryStop[],
  useGoogleAPI: boolean = false
): Promise<number[][]> {
  const n = stops.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  if (useGoogleAPI) {
    // Use Google Distance Matrix API for accurate road distances
    try {
      for (let i = 0; i < n; i++) {
        const origin = stops[i].coordinates;
        const destinations = stops.map((s) => s.coordinates);
        const results = await calculateDistances(origin, destinations);

        for (let j = 0; j < n; j++) {
          matrix[i][j] = results[j].distance;
        }
      }
    } catch (error) {
      console.warn('Google API failed, falling back to Haversine:', error);
      // Fall back to Haversine
      return calculateHaversineMatrix(stops);
    }
  } else {
    // Use Haversine (faster, no API calls)
    return calculateHaversineMatrix(stops);
  }

  return matrix;
}

/**
 * Calculate distance matrix using Haversine formula (offline)
 */
function calculateHaversineMatrix(stops: DeliveryStop[]): number[][] {
  const n = stops.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = haversineDistance(
          stops[i].coordinates,
          stops[j].coordinates
        );
      }
    }
  }

  return matrix;
}

/**
 * Calculate total distance of a route
 */
function calculateRouteDistance(route: number[], distanceMatrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += distanceMatrix[route[i]][route[i + 1]];
  }
  return total;
}

/**
 * Nearest Neighbor algorithm for TSP
 * Greedy approach: always go to the nearest unvisited stop
 *
 * @param distanceMatrix - Distance matrix between all stops
 * @param startIndex - Starting stop index (usually 0 for depot)
 * @returns Array of stop indices in visit order
 */
function nearestNeighbor(distanceMatrix: number[][], startIndex: number = 0): number[] {
  const n = distanceMatrix.length;
  const visited = new Set<number>();
  const route: number[] = [startIndex];
  visited.add(startIndex);

  let current = startIndex;

  while (visited.size < n) {
    let nearest = -1;
    let minDistance = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distanceMatrix[current][i] < minDistance) {
        minDistance = distanceMatrix[current][i];
        nearest = i;
      }
    }

    if (nearest !== -1) {
      route.push(nearest);
      visited.add(nearest);
      current = nearest;
    }
  }

  return route;
}

/**
 * 2-opt improvement algorithm
 * Iteratively improves route by reversing segments
 *
 * @param route - Initial route (array of indices)
 * @param distanceMatrix - Distance matrix
 * @returns Improved route
 */
function twoOptImprovement(route: number[], distanceMatrix: number[][]): number[] {
  let improved = true;
  let bestRoute = [...route];

  while (improved) {
    improved = false;

    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        // Try reversing the segment between i and j
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, j + 1).reverse(),
          ...bestRoute.slice(j + 1),
        ];

        const newDistance = calculateRouteDistance(newRoute, distanceMatrix);
        const oldDistance = calculateRouteDistance(bestRoute, distanceMatrix);

        if (newDistance < oldDistance) {
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

/**
 * Optimize delivery route using TSP algorithms
 * Combines Nearest Neighbor with 2-opt improvement
 *
 * @param stops - Array of delivery stops
 * @param depot - Optional depot/warehouse location (defaults to first stop)
 * @param useGoogleAPI - Use Google API for accurate distances (slower)
 * @returns Optimized route
 */
export async function optimizeRoute(
  stops: DeliveryStop[],
  depot?: Coordinates,
  useGoogleAPI: boolean = false
): Promise<OptimizedRoute> {
  if (stops.length === 0) {
    throw new Error('No stops provided for route optimization');
  }

  if (stops.length === 1) {
    return {
      stops: stops.map((s, i) => ({ ...s, sequence: i + 1 })),
      totalDistance: 0,
      totalDuration: 0,
      improvement: {
        distanceSaved: 0,
        percentageImproved: 0,
      },
    };
  }

  // Add depot as first stop if provided
  const allStops = depot
    ? [
        {
          id: 'depot',
          address: 'Depot',
          coordinates: depot,
          orderId: '',
          customerName: 'Warehouse',
        },
        ...stops,
      ]
    : stops;

  // Calculate distance matrix
  const distanceMatrix = await calculateDistanceMatrix(allStops, useGoogleAPI);

  // Calculate original route distance (sequential order)
  const originalRoute = allStops.map((_, i) => i);
  const originalDistance = calculateRouteDistance(originalRoute, distanceMatrix);

  // Apply Nearest Neighbor
  const nnRoute = nearestNeighbor(distanceMatrix, 0);

  // Apply 2-opt improvement
  const optimizedRoute = twoOptImprovement(nnRoute, distanceMatrix);

  // Calculate optimized distance
  const optimizedDistance = calculateRouteDistance(optimizedRoute, distanceMatrix);

  // Reorder stops according to optimized route
  const optimizedStops = optimizedRoute.map((index, seq) => ({
    ...allStops[index],
    sequence: seq + 1,
  }));

  // Remove depot from final stops if it was added
  const finalStops = depot ? optimizedStops.slice(1) : optimizedStops;

  // Calculate improvement
  const distanceSaved = originalDistance - optimizedDistance;
  const percentageImproved =
    originalDistance > 0 ? (distanceSaved / originalDistance) * 100 : 0;

  // Estimate duration (average speed: 30 km/h in city)
  const averageSpeed = 30000 / 3600; // meters per second
  const totalDuration = optimizedDistance / averageSpeed;

  return {
    stops: finalStops,
    totalDistance: optimizedDistance,
    totalDuration,
    improvement: {
      distanceSaved,
      percentageImproved,
    },
  };
}

/**
 * Get full route with turn-by-turn directions
 * Combines optimized stops with Google Directions API
 *
 * @param optimizedStops - Optimized delivery stops
 * @param depot - Starting depot location
 * @returns Full route with directions
 */
export async function getOptimizedRouteWithDirections(
  optimizedStops: DeliveryStop[],
  depot?: Coordinates
): Promise<DirectionsRoute> {
  if (optimizedStops.length === 0) {
    throw new Error('No stops provided');
  }

  const origin = depot || optimizedStops[0].coordinates;
  const destination = optimizedStops[optimizedStops.length - 1].coordinates;
  const waypoints =
    optimizedStops.length > 2
      ? optimizedStops.slice(1, -1).map((stop) => stop.coordinates)
      : [];

  return getDirections(origin, destination, {
    waypoints,
    mode: 'driving',
    optimizeWaypoints: false, // Already optimized by our TSP
  });
}

/**
 * Compare two routes and return metrics
 */
export function compareRoutes(
  originalStops: DeliveryStop[],
  optimizedResult: OptimizedRoute
): {
  original: { stops: DeliveryStop[]; distance: number };
  optimized: { stops: DeliveryStop[]; distance: number };
  improvement: { distance: number; percentage: number };
} {
  const originalDistance = optimizedResult.totalDistance + optimizedResult.improvement.distanceSaved;

  return {
    original: {
      stops: originalStops,
      distance: originalDistance,
    },
    optimized: {
      stops: optimizedResult.stops,
      distance: optimizedResult.totalDistance,
    },
    improvement: {
      distance: optimizedResult.improvement.distanceSaved,
      percentage: optimizedResult.improvement.percentageImproved,
    },
  };
}
