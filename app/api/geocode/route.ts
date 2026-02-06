/**
 * Geocoding API Route
 *
 * Server-side endpoint for geocoding addresses.
 * Use this from server components or when client-side geocoding isn't suitable.
 * Rate limited to protect Google Maps API quota.
 *
 * @module app/api/geocode/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode, type Coordinates } from '@/services/google-maps';
import { rateLimit } from '@/lib/api/rate-limit';

/**
 * POST /api/geocode
 *
 * Geocode an address to coordinates
 *
 * Request body:
 * {
 *   "address": "Kilimani, Nairobi, Kenya"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "address": "Kilimani, Nairobi, Kenya",
 *     "coordinates": { "lat": -1.2921, "lng": 36.7872 },
 *     "formattedAddress": "Kilimani, Nairobi, Kenya",
 *     "placeId": "ChIJ..."
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting (30 requests per minute to protect Google API quota)
  const rateLimitResponse = rateLimit(request, 'geocode');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Address is required and must be a string',
        },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Geocoding error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to geocode address',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/geocode?lat=-1.2921&lng=36.7872
 *
 * Reverse geocode coordinates to address
 *
 * Query parameters:
 * - lat: Latitude
 * - lng: Longitude
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "address": "Kilimani, Nairobi, Kenya"
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting (30 requests per minute to protect Google API quota)
  const rateLimitResponse = rateLimit(request, 'geocode');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: 'Latitude and longitude are required',
        },
        { status: 400 }
      );
    }

    const coordinates: Coordinates = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
        },
        { status: 400 }
      );
    }

    const address = await reverseGeocode(coordinates);

    return NextResponse.json({
      success: true,
      data: {
        address,
      },
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reverse geocode',
      },
      { status: 500 }
    );
  }
}
