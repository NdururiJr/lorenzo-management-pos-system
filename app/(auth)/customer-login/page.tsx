/**
 * Customer Login Page
 *
 * Phone OTP login for customers.
 * Two-step flow: Enter phone -> Enter OTP
 *
 * @module app/(auth)/customer-login/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { customerLoginSchema, type CustomerLoginFormData } from '@/lib/validations/auth';
import { signInWithPhone } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (data: CustomerLoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signInWithPhone(data);

      if (result.success) {
        toast.success(result.data?.message || 'OTP sent successfully');
        // Navigate to OTP verification page with phone number
        router.push(`/verify-otp?phone=${encodeURIComponent(data.phone)}`);
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (_error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Back Link */}
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Staff Login
      </Link>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">
            Customer Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your phone number to receive an OTP
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-black mb-2">
              How it works:
            </h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Enter your phone number</li>
              <li>Receive a 6-digit OTP via SMS</li>
              <li>Enter the OTP to access your account</li>
            </ol>
          </div>

          {/* Development Note */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Development Mode:</strong> OTP will be displayed in the
              console. In production, it will be sent via SMS.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
