/**
 * Staff Registration Page
 *
 * Register new staff members (admin only - protection will be added later).
 * Includes email, password, name, phone, role, and branch selection.
 *
 * @module app/(auth)/register/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormData, userRoles } from '@/lib/validations/auth';
import { registerUser } from '@/app/(auth)/actions';
import { checkPasswordStrength } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '+254',
      role: 'front_desk',
      branchId: '',
    },
  });

  const password = watch('password');
  const role = watch('role');

  // Update password strength indicator
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('password', value);
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const result = await registerUser(data);

      if (result.success) {
        toast.success('User registered successfully');
        router.push('/login');
      } else {
        toast.error(result.error || 'Failed to register user');
      }
    } catch (_error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score === 5) return 'bg-green-600';
    if (score >= 3) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <>
      {/* Back Link */}
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Link>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">
            Register Staff Member
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create a new staff account (Admin only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
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
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-600" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                onChange={handlePasswordChange}
              />
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength.score
                            ? getPasswordStrengthColor(passwordStrength.score)
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">{passwordStrength.feedback}</p>
                </div>
              )}
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-black">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-black">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setValue('role', value as typeof role)}
                disabled={isLoading}
              >
                <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Branch ID */}
            <div className="space-y-2">
              <Label htmlFor="branchId" className="text-black">
                Branch ID
              </Label>
              <Input
                id="branchId"
                type="text"
                placeholder="branch-001"
                disabled={isLoading}
                className="border-gray-300 focus:border-black focus:ring-black"
                aria-invalid={errors.branchId ? 'true' : 'false'}
                aria-describedby={errors.branchId ? 'branch-error' : undefined}
                {...register('branchId')}
              />
              <p className="text-xs text-gray-500">
                Enter the branch ID where this staff member will work
              </p>
              {errors.branchId && (
                <p id="branch-error" className="text-sm text-red-600" role="alert">
                  {errors.branchId.message}
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
                  Registering...
                </>
              ) : (
                'Register Staff Member'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
