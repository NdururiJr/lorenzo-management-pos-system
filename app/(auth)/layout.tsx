/**
 * Authentication Layout
 *
 * Modern authentication layout with gradient background and glassmorphic effects.
 * Blue brand theme matching the main site design.
 *
 * @module app/(auth)/layout
 */

import type { Metadata } from 'next';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50" />

      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/5 via-transparent to-white/50" />

      {/* Floating decorative orbs */}
      <FloatingOrbs />

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo with enhanced styling */}
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent animate-gradient">
              Lorenzo
            </h1>
            <p className="mt-2 text-lg font-medium text-brand-blue-dark/80">Dry Cleaners</p>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-blue/10 to-transparent" />
    </div>
  );
}
