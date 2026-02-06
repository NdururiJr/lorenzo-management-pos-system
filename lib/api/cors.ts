/**
 * CORS Middleware for Cross-Origin API Access
 *
 * Enables the website to communicate with the POS API when deployed separately.
 * Validates origins against allowed list and handles preflight requests.
 *
 * @module lib/api/cors
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Get allowed origins from environment variable
 * Falls back to localhost for development
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim());
  }

  // Default allowed origins for development
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check wildcard patterns (e.g., *.lorenzo.co.ke)
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      if (origin.endsWith(domain)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * CORS headers configuration
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With, X-Request-ID, X-Session-ID',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  // Set origin header if allowed
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Add other CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');

  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden',
    });
  }

  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, origin);
}

/**
 * CORS middleware wrapper for API routes
 *
 * @example
 * ```typescript
 * // app/api/agents/route.ts
 * import { withCors } from '@/lib/api/cors';
 *
 * async function handler(request: NextRequest) {
 *   // Your API logic
 *   return NextResponse.json({ data: 'result' });
 * }
 *
 * export const POST = withCors(handler);
 * export const OPTIONS = withCors(handlePreflight);
 * ```
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const origin = request.headers.get('origin');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handlePreflight(request);
    }

    // Check origin for actual requests
    if (origin && !isOriginAllowed(origin)) {
      return new NextResponse(
        JSON.stringify({ error: 'Origin not allowed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Execute handler and add CORS headers
    const response = await handler(request);
    return addCorsHeaders(response, origin);
  };
}

/**
 * Create a JSON response with CORS headers
 */
export function corsJsonResponse(
  data: unknown,
  origin: string | null,
  status = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response, origin);
}

/**
 * Create an error response with CORS headers
 */
export function corsErrorResponse(
  error: string,
  origin: string | null,
  status = 500
): NextResponse {
  const response = NextResponse.json({ error }, { status });
  return addCorsHeaders(response, origin);
}
