/**
 * Staff Login Page
 *
 * Modern staff login with glassmorphic design and blue theme.
 * Matches the main site aesthetic with smooth animations.
 *
 * @module app/(auth)/login/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Rocket, UserCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await signIn(data.email, data.password, data.rememberMe || false);
      toast.success('Signed in successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Dev Login - Quick login for development
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
      toast.success('Dev login successful! 🚀');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Dev login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard className="p-8">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-full flex items-center justify-center shadow-glow-blue/30"
            >
              <UserCircle className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
            Staff Login
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
            transition={{ delay: 0.3, duration: 0.4 }}
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
            transition={{ delay: 0.4, duration: 0.4 }}
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
            transition={{ delay: 0.5, duration: 0.4 }}
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
            transition={{ delay: 0.6, duration: 0.4 }}
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

          {/* Dev Login Button - Only shown in development */}
          {process.env.NODE_ENV === 'development' &&
           process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
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
            </motion.div>
          )}
        </form>

        {/* Customer Login Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="pt-6 border-t border-brand-blue/10"
        >
          <p className="text-sm text-center text-gray-600">
            Are you a customer?{' '}
            <Link
              href="/customer-login"
              className="font-medium text-brand-blue hover:text-brand-blue-dark transition-colors duration-300 hover:underline"
            >
              Login Here
            </Link>
          </p>
        </motion.div>
      </div>
    </AuthCard>
  );
}
