/**
 * Customer Portal Layout
 *
 * Modern customer portal with glassmorphic design and blue theme.
 * Features gradient backgrounds and smooth animations.
 *
 * @module app/(customer)/layout
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CustomerHeader } from '@/components/features/customer/CustomerHeader';
import { MobileBottomNav } from '@/components/features/customer/MobileBottomNav';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';

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
      <div className="relative min-h-screen overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50" />
        <FloatingOrbs />

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-card border-2 border-white/60"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-8 w-8 mx-auto text-brand-blue" />
              </motion.div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </motion.div>
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
    <div className="relative min-h-screen overflow-hidden pb-20 md:pb-0">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50" />

      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/5 via-transparent to-white/50" />

      {/* Floating decorative orbs */}
      <FloatingOrbs />

      {/* Top decorative blur */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <CustomerHeader />

        {/* Main content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-6 max-w-4xl"
        >
          {children}
        </motion.main>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
