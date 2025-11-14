/**
 * Phone Login Form Component (DISABLED)
 *
 * This component is disabled as OTP authentication has been removed.
 * Customers now login with email/password instead.
 * Kept for reference only.
 *
 * @deprecated Use email/password login instead
 * @module components/forms/PhoneLoginForm
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PhoneLoginFormProps {
  onSubmit?: (data: unknown) => Promise<void>;
  isLoading?: boolean;
}

/**
 * This component is no longer used.
 * Customer authentication has been changed to email/password.
 */
export function PhoneLoginForm({ onSubmit, isLoading = false }: PhoneLoginFormProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Component Disabled:</strong> Phone/OTP login has been removed.
        Customers now login with email and password.
      </AlertDescription>
    </Alert>
  );
}
