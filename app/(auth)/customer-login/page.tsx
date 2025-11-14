/**
 * Customer Login Page
 *
 * Email/Password login for customers.
 * Same authentication method as staff but for customer accounts.
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
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerLoginFormData>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: CustomerLoginFormData) => {
    setIsLoading(true);

    try {
      await signIn(data.email, data.password, data.rememberMe || false);
      toast.success('Signed in successfully');
      router.push('/portal');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Dev Login - Quick login for development (redirects to customer portal)
   */
  const handleDevLogin = async () => {
    const devEmail = process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL;
    const devPassword = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD;

    if (!devEmail || !devPassword) {
      toast.error('Dev login credentials not configured');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(devEmail, devPassword, true);
      toast.success('Dev login successful! Redirecting to customer portal... 🚀');
      router.push('/portal');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Dev login failed');
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
            Sign in with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-black">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue('rememberMe', checked as boolean)
                }
                disabled={isLoading}
                className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Remember me for 30 days
              </Label>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-black mb-2">
              New Customer?
            </h3>
            <p className="text-sm text-gray-600">
              Contact your nearest Lorenzo Dry Cleaners branch to create a customer account.
            </p>
          </div>

          {/* Developer Quick Login */}
          {process.env.NODE_ENV === 'development' &&
           process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Developer Quick Login</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Dev Only
                </span>
              </div>
              <Button
                type="button"
                onClick={handleDevLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    🚀 Dev Quick Login
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Quick login directly to customer portal
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
