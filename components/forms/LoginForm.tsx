/**
 * Reusable Login Form Component
 *
 * Email/Password login form with validation.
 *
 * @module components/forms/LoginForm
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  onForgotPasswordClick?: () => void;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  showRememberMe = true,
  showForgotPassword = true,
  onForgotPasswordClick,
}: LoginFormProps) {
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

  return (
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
          {showForgotPassword && (
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Forgot password?
            </button>
          )}
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
      {showRememberMe && (
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
      )}

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
  );
}
