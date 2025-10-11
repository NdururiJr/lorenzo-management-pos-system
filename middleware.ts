/**
 * Next.js Middleware
 *
 * Protects dashboard routes and handles authentication redirects.
 * Runs on Edge Runtime for optimal performance.
 *
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/login',
  '/customer-login',
  '/verify-otp',
  '/forgot-password',
  '/register',
];

/**
 * Routes that require authentication
 */
const protectedRoutes = ['/dashboard'];

/**
 * Check if path matches a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Middleware function
 *
 * Checks authentication status and redirects accordingly:
 * - Protected routes: Redirect to /login if not authenticated
 * - Auth routes: Redirect to /dashboard if already authenticated
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const token = request.cookies.get('lorenzo_session')?.value;
  const isAuthenticated = !!token;

  // Check if route is protected
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/customer-login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Middleware configuration
 *
 * Specifies which routes the middleware should run on.
 * Excludes static files, API routes, and Next.js internals.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes (if you don't want middleware on API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
