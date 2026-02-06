/**
 * Weather API Route
 *
 * GET /api/weather?location=Nairobi,Kenya
 *
 * Returns current weather conditions, forecast, and operations impact analysis
 * for Lorenzo Dry Cleaners GM Dashboard.
 *
 * Features:
 * - Rate limited (30 req/min) to protect API quota
 * - Server-side caching (15 min) to minimize API calls
 * - Operations impact analysis for delivery/pickup planning
 *
 * @module app/api/weather/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/api/rate-limit';
import {
  fetchWeatherData,
  isWeatherConfigured,
  getWeatherCacheStats,
} from '@/services/weather';

/**
 * GET /api/weather
 *
 * Query parameters:
 * - location: Location string (default: "Nairobi,Kenya")
 * - debug: Include cache stats in response (optional)
 *
 * @returns Weather data with operations impact analysis
 */
export async function GET(request: NextRequest) {
  // 1. Apply rate limiting
  const rateLimitResponse = rateLimit(request, 'weather');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // 2. Check if service is configured
  if (!isWeatherConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Weather service not configured',
        message: 'Set VISUAL_CROSSING_API_KEY in environment variables',
      },
      { status: 503 }
    );
  }

  // 3. Get location from query params (default: Nairobi)
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location') || 'Nairobi,Kenya';
  const includeDebug = searchParams.get('debug') === 'true';

  try {
    // 4. Fetch weather data (with caching)
    const weatherData = await fetchWeatherData(location);

    // 5. Build response
    const response: Record<string, unknown> = {
      success: true,
      data: weatherData,
    };

    // Include cache stats in debug mode
    if (includeDebug) {
      response.cache = getWeatherCacheStats();
    }

    // 6. Return with cache headers
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=900, s-maxage=900', // 15 minutes
        'CDN-Cache-Control': 'public, max-age=900',
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch weather data';

    console.error('[Weather API] Error:', errorMessage);

    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('Invalid API key')) {
      statusCode = 503;
    } else if (errorMessage.includes('rate limit')) {
      statusCode = 429;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
