/**
 * Route Optimization API Endpoint
 *
 * Server-side endpoint for Google Maps route optimization.
 * The @googlemaps/google-maps-services-js client only works server-side.
 *
 * @module app/api/maps/optimize-route/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { optimizeRoute, type RouteStop, type Coordinates } from '@/services/google-maps';

interface OptimizeRouteRequest {
  branchLocation: Coordinates;
  stops: RouteStop[];
  returnToStart?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check API key first
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key is not configured. Route optimization is unavailable.' },
        { status: 503 }
      );
    }

    const body: OptimizeRouteRequest = await request.json();

    // Validate request
    if (!body.branchLocation || !body.stops || body.stops.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: branchLocation and stops' },
        { status: 400 }
      );
    }

    // Validate branchLocation
    if (typeof body.branchLocation.lat !== 'number' || typeof body.branchLocation.lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid branchLocation: lat and lng must be numbers' },
        { status: 400 }
      );
    }

    // Validate stops
    for (const stop of body.stops) {
      if (!stop.coordinates || typeof stop.coordinates.lat !== 'number' || typeof stop.coordinates.lng !== 'number') {
        return NextResponse.json(
          { error: 'Invalid stop coordinates: each stop must have valid lat and lng' },
          { status: 400 }
        );
      }
    }

    // Optimize route server-side (default returnToStart to true)
    const returnToStart = body.returnToStart !== false;
    const result = await optimizeRoute(body.branchLocation, body.stops, returnToStart);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Route optimization error:', error);

    // Ensure we always return valid JSON with helpful error info
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to optimize route';

    return NextResponse.json(
      {
        error: errorMessage,
        // Include more details in development for debugging
        ...(process.env.NODE_ENV === 'development' && {
          details: String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
