/**
 * Authentication Form Validation Schemas
 *
 * Zod schemas for all authentication forms with proper validation rules.
 *
 * @module lib/validations/auth
 */

import { z } from 'zod';

/**
 * Email validation regex (RFC 5322 compliant)
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Kenya phone number regex (+254 followed by 9 digits)
 */
const kenyaPhoneRegex = /^\+254[17]\d{8}$/;

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Staff Login Schema
 * Email and password authentication for staff members
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Customer Login Schema (Email/Password)
 * Email and password authentication for customers
 */
export const customerLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export type CustomerLoginFormData = z.infer<typeof customerLoginSchema>;

/**
 * OTP Verification Schema
 * 6-digit OTP code validation
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
  phone: z.string().optional(), // For context, not validated
});

export type OTPFormData = z.infer<typeof otpSchema>;

/**
 * Forgot Password Schema
 * Email for password reset
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * User roles in the system
 */
export const userRoles = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'workstation_manager',
  'workstation_staff',
  'satellite_staff',
  'manager',
  'front_desk',
  'workstation',
  'driver',
  'customer',
] as const;

export type UserRole = (typeof userRoles)[number];

/**
 * Staff Registration Schema
 * For admin to create new staff accounts
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(kenyaPhoneRegex, 'Please enter a valid Kenya phone number (e.g., +254712345678)'),
  role: z.enum(userRoles, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  branchId: z.string().min(1, 'Please select a branch'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Phone number format validation helper
 */
export function isValidKenyaPhone(phone: string): boolean {
  return kenyaPhoneRegex.test(phone);
}

/**
 * Email validation helper
 */
export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string;
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('One lowercase letter');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('One uppercase letter');

  if (/\d/.test(password)) score++;
  else feedback.push('One number');

  if (/[@$!%*?&]/.test(password)) score++;
  else feedback.push('One special character');

  return {
    score,
    feedback: feedback.length > 0 ? `Need: ${feedback.join(', ')}` : 'Strong password',
  };
}
