/**
 * Phone Login Form Component
 *
 * Phone number input with Kenya format validation.
 * Two-step process: Phone -> OTP verification.
 *
 * @module components/forms/PhoneLoginForm
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerLoginSchema, type CustomerLoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface PhoneLoginFormProps {
  onSubmit: (data: CustomerLoginFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PhoneLoginForm({ onSubmit, isLoading = false }: PhoneLoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginFormData>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: {
      phone: '+254',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-black">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+254712345678"
          disabled={isLoading}
          className="border-gray-300 focus:border-black focus:ring-black"
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          {...register('phone')}
        />
        <p className="text-xs text-gray-500">
          Enter your Kenya phone number starting with +254
        </p>
        {errors.phone && (
          <p
            id="phone-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black hover:bg-gray-800 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending OTP...
          </>
        ) : (
          'Send OTP'
        )}
      </Button>
    </form>
  );
}
