/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiting for API endpoints.
 * For production with multiple instances, use Redis-based solution.
 *
 * @module lib/api/rate-limit
 */

import { NextResponse } from 'next/server';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Rate limit store entry
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limiting
 * Note: This won't persist across serverless function invocations
 * For production, consider using Upstash Redis or similar
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60000);
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  /** AI agents - expensive, limit heavily */
  agents: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  /** Geocoding - Google API quota protection */
  geocode: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute
  /** Contact form - spam prevention */
  contact: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  /** Payment endpoints */
  payments: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
  /** Weather API - protect Visual Crossing quota (1000/day free) */
  weather: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute
  /** General API */
  general: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
} as const;

/**
 * Get client identifier from request
 * Uses IP address or session ID
 */
export function getClientId(request: Request): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // Priority: Cloudflare > X-Real-IP > X-Forwarded-For > fallback
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  // Fallback to a hash of user agent + accept-language as rough identifier
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';
  return `fallback-${hashString(userAgent + acceptLanguage)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if request is rate limited
 *
 * @param clientId - Unique client identifier
 * @param endpoint - Endpoint name for config lookup
 * @param config - Optional custom rate limit config
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  clientId: string,
  endpoint: keyof typeof RATE_LIMITS | string,
  config?: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limitConfig = config || RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.general;

  const key = `${endpoint}:${clientId}`;
  const entry = rateLimitStore.get(key);

  // No existing entry or expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limitConfig.windowMs,
    });

    return {
      allowed: true,
      remaining: limitConfig.maxRequests - 1,
      resetIn: limitConfig.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= limitConfig.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: limitConfig.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Rate limit middleware for API routes
 *
 * @param request - Incoming request
 * @param endpoint - Endpoint name for config lookup
 * @param config - Optional custom rate limit config
 * @returns NextResponse if rate limited, null if allowed
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = rateLimit(request, 'contact');
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Continue with request handling
 * }
 */
export function rateLimit(
  request: Request,
  endpoint: keyof typeof RATE_LIMITS | string,
  config?: RateLimitConfig
): NextResponse | null {
  const clientId = getClientId(request);
  const result = checkRateLimit(clientId, endpoint, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(result.resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(result.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + result.resetIn),
        },
      }
    );
  }

  return null;
}

/**
 * Add rate limit headers to response
 *
 * @param response - Response to add headers to
 * @param remaining - Remaining requests
 * @param resetIn - Time until reset in ms
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetIn: number
): NextResponse {
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Date.now() + resetIn));
  return response;
}
