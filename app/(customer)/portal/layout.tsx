/**
 * Customer Portal Layout
 *
 * Handles access control for customer portal routes.
 * In production: Only customers can access
 * In development: Staff can access for testing (with dev notice)
 *
 * @module app/(customer)/portal/layout
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, TestTube } from 'lucide-react';
import { motion } from 'framer-motion';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated - redirect to customer login
      router.push('/customer-login');
      return;
    }

    if (!userData) {
      // No user data yet - wait for it to load
      return;
    }

    // In production: Only allow customers
    if (!isDevelopment && userData.role !== 'customer') {
      router.push('/dashboard');
      return;
    }

    // In development: Allow customers and staff (for testing)
    // In production: Only customers
    if (userData.role === 'customer' || isDevelopment) {
      setIsAuthorized(true);
    } else {
      router.push('/dashboard');
    }
  }, [user, userData, loading, router, isDevelopment]);

  // Show loading state while checking authorization
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 mx-auto text-brand-blue" />
          </motion.div>
          <p className="text-sm text-gray-600">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50">
      {/* Development Mode Notice (only visible to staff in dev) */}
      {isDevelopment && userData?.role !== 'customer' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-b border-amber-200 px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <TestTube className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Development Mode - Staff Access Enabled
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                You're viewing the customer portal as{' '}
                <span className="font-semibold">{userData?.role || 'staff'}</span> for
                testing. In production, only customers can access this area.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portal Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">{children}</div>
    </div>
  );
}
