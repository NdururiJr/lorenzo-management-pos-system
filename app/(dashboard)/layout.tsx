/**
 * Dashboard Layout
 *
 * Modern protected layout with glassmorphic sidebar and gradient backgrounds.
 * Features smooth animations and blue theme throughout.
 *
 * @module app/(dashboard)/layout
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ModernSidebar } from '@/components/modern/ModernSidebar';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50" />

      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/5 via-transparent to-white/50" />

      {/* Floating decorative orbs */}
      <FloatingOrbs />

      {/* Modern Sidebar Navigation */}
      <ModernSidebar />

      {/* Main Content Area */}
      <main className="relative z-10 lg:pl-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
