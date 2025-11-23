/**
 * OTP Verification Page (DISABLED)
 *
 * This page has been disabled as OTP authentication has been removed.
 * Customers now login with email/password instead.
 *
 * @module app/(auth)/verify-otp/page
 */

'use client';

// Force dynamic rendering - don't statically generate this page
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * OTP verification is no longer used
 * Redirect to customer login page
 */
export default function VerifyOTPPage() {
  const router = useRouter();

  useEffect(() => {
    toast.info('OTP verification is no longer used. Please login with email and password.');
    router.replace('/customer-login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to customer login...</p>
    </div>
  );
}
