/**
 * Customer Login Page
 *
 * Modern customer login with glassmorphic design and blue theme.
 * Matches the main site aesthetic with smooth animations.
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
import { motion } from 'framer-motion';
import { customerLoginSchema, type CustomerLoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, Lock, Rocket } from 'lucide-react';

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
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-brand-blue-dark/70 hover:text-brand-blue transition-all duration-300 mb-6 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Staff Login
        </Link>
      </motion.div>

      <AuthCard className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
              Customer Login
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in with your email and password
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <AuthInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                disabled={isLoading}
                icon={<Mail className="h-5 w-5" />}
                error={errors.email?.message}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-blue hover:text-brand-blue-dark transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <AuthInput
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  icon={<Lock className="h-5 w-5" />}
                  error={errors.password?.message}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
              </div>
            </motion.div>

            {/* Remember Me */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue('rememberMe', checked as boolean)
                }
                disabled={isLoading}
                className="border-brand-blue/30 data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-600 cursor-pointer hover:text-brand-blue transition-colors"
              >
                Remember me for 30 days
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <AuthButton
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                Sign In
              </AuthButton>
            </motion.div>
          </form>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="p-5 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-blue-100/5 rounded-2xl border border-brand-blue/10"
          >
            <h3 className="text-sm font-semibold text-brand-blue-dark mb-2">
              New Customer?
            </h3>
            <p className="text-sm text-gray-600">
              Contact your nearest Lorenzo Dry Cleaners branch to create a customer account.
            </p>
          </motion.div>

          {/* Developer Quick Login */}
          {process.env.NODE_ENV === 'development' &&
           process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="pt-6 border-t border-brand-blue/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-brand-blue-dark">Developer Quick Login</h3>
                <span className="text-xs bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-medium">
                  Dev Only
                </span>
              </div>
              <AuthButton
                type="button"
                onClick={handleDevLogin}
                disabled={isLoading}
                isLoading={isLoading}
                variant="secondary"
                className="w-full"
                size="md"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Dev Quick Login
              </AuthButton>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Quick login directly to customer portal
              </p>
            </motion.div>
          )}
        </div>
      </AuthCard>
    </>
  );
}
