/**
 * Custom 404 Not Found Page
 *
 * This page is displayed when a route doesn't exist.
 *
 * @module app/not-found
 */

import Link from 'next/link';
import { Home, Search } from 'lucide-react';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="relative">
            <h1 className="text-[150px] font-bold text-gray-200 leading-none">
              404
            </h1>
            <Search className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-semibold text-black">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <p className="text-sm text-gray-500">
            or{' '}
            <Link href="/" className="text-black font-medium hover:underline">
              return to homepage
            </Link>
          </p>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            If you believe this is an error, please{' '}
            <a
              href="mailto:hello@ai-agentsplus.com"
              className="text-black font-medium hover:underline"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
