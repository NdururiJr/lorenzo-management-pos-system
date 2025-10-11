/**
 * OTP Verification Page
 *
 * 6-digit OTP input with timer and resend functionality.
 * Auto-submits when all digits are entered.
 *
 * @module app/(auth)/verify-otp/page
 */

'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { otpSchema, type OTPFormData } from '@/lib/validations/auth';
import { verifyOTP, resendOTP } from '@/app/(auth)/actions';
import { setAuthToken } from '@/lib/auth/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
      phone,
    },
  });

  const otpValue = watch('otp');

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otpValue.length === 6 && !isLoading) {
      handleSubmit(onSubmit)();
    }
  }, [otpValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: OTPFormData) => {
    if (!phone) {
      toast.error('Phone number is missing');
      router.push('/customer-login');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOTP({ ...data, phone });

      if (result.success && result.data) {
        // Sign in with custom token
        await signInWithCustomToken(auth, result.data.customToken);

        // Get ID token and store it
        const user = auth.currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          setAuthToken(idToken, false);
        }

        toast.success('OTP verified successfully');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Invalid OTP');
        setValue('otp', '');
        inputRefs.current[0]?.focus();
      }
    } catch (_error) {
      toast.error('An unexpected error occurred');
      setValue('otp', '');
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !phone) return;

    setIsResending(true);

    try {
      const result = await resendOTP(phone);

      if (result.success) {
        toast.success('New OTP sent successfully');
        setTimeLeft(600);
        setCanResend(false);
        setValue('otp', '');
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.error || 'Failed to resend OTP');
      }
    } catch (_error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('otp', value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!phone) {
    router.push('/customer-login');
    return null;
  }

  return (
    <>
      {/* Back Link */}
      <Link
        href="/customer-login"
        className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Phone Entry
      </Link>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter the 6-digit code sent to {phone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-black">
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black text-center text-2xl tracking-widest font-mono"
                aria-invalid={errors.otp ? 'true' : 'false'}
                aria-describedby={errors.otp ? 'otp-error' : undefined}
                {...register('otp')}
                onChange={handleOTPChange}
                ref={(e) => {
                  register('otp').ref(e);
                  inputRefs.current[0] = e;
                }}
                autoFocus
              />
              {errors.otp && (
                <p id="otp-error" className="text-sm text-red-600" role="alert">
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {timeLeft > 0 ? (
                  <>
                    OTP expires in{' '}
                    <span className="font-medium text-black">
                      {formatTime(timeLeft)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600">OTP has expired</span>
                )}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || otpValue.length !== 6}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                disabled={!canResend || isResending}
                onClick={handleResendOTP}
                className="text-sm text-gray-600 hover:text-black"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend OTP'
                )}
              </Button>
            </div>
          </form>

          {/* Development Note */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Development Mode:</strong> Check the console for the OTP
              code.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
