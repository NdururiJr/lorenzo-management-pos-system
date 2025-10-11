/**
 * Authentication Layout
 *
 * Minimal centered layout for authentication pages.
 * Black & white theme with no sidebar or navigation.
 *
 * @module app/(auth)/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Lorenzo Dry Cleaners',
  description: 'Sign in to Lorenzo Dry Cleaners',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Lorenzo
          </h1>
          <p className="mt-2 text-sm text-gray-600">Dry Cleaners</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
