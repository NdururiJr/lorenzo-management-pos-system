/**
 * Customer Portal Layout
 *
 * Protected layout for customer-facing pages.
 * Redirects to login if not a customer.
 *
 * @module app/(customer)/layout
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { CustomerHeader } from '@/components/features/customer/CustomerHeader';
import { MobileBottomNav } from '@/components/features/customer/MobileBottomNav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Redirect non-customers to dashboard (skip in development mode for testing)
    if (
      process.env.NODE_ENV === 'production' &&
      !loading &&
      user &&
      userData &&
      userData.role !== 'customer'
    ) {
      router.push('/dashboard');
    }
  }, [user, userData, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render portal if not authenticated
  // In development, allow non-customers to access the portal for testing
  if (!user || !userData) {
    return null;
  }

  if (process.env.NODE_ENV === 'production' && userData.role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <CustomerHeader />

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
