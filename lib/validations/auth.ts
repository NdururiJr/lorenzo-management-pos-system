/**
 * Authentication Form Validation Schemas
 *
 * Zod schemas for all authentication forms with proper validation rules.
 * Updated for FR-014: International phone number support
 *
 * @module lib/validations/auth
 */

import { z } from 'zod';
import { validatePhoneNumber, isPhoneValid, type PhoneValidationResult } from '@/lib/utils/phone-validator';

/**
 * Email validation regex (RFC 5322 compliant)
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Kenya phone number regex (+254 followed by 9 digits)
 * @deprecated Use validatePhoneNumber from phone-validator instead for international support
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
  // V2.0 New Roles
  'finance_manager',
  'auditor',
  'logistics_manager',
  'inspector',
] as const;

export type UserRole = (typeof userRoles)[number];

/**
 * Staff Registration Schema
 * For admin to create new staff accounts
 * Updated for FR-014: International phone support
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
    .refine(
      (val) => isPhoneValid(val, 'KE'),
      'Please enter a valid phone number (e.g., +254712345678 or international format)'
    ),
  role: z.enum(userRoles, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  branchId: z.string().min(1, 'Please select a branch'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * International Customer Registration Schema (FR-014)
 * Supports foreign phone numbers with country selection
 *
 * Issue 81 Fix: Email is now REQUIRED (not optional) to support customer lookup
 * by both phone and email for phone-authenticated and email-authenticated users.
 */
export const internationalCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => isPhoneValid(val),
      'Please enter a valid phone number in international format'
    ),
  countryCode: z
    .string()
    .length(2, 'Country code must be 2 characters')
    .optional(),
  // Issue 81 Fix: Email is now required for customer registration
  // This ensures customers can be found via both phone and email lookup
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
});

export type InternationalCustomerFormData = z.infer<typeof internationalCustomerSchema>;

/**
 * Customer Registration Schema (Issue 81 Fix)
 * Requires BOTH phone AND email to prevent lookup failures
 */
export const customerRegistrationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => isPhoneValid(val, 'KE'),
      'Please enter a valid phone number (e.g., +254712345678)'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type CustomerRegistrationFormData = z.infer<typeof customerRegistrationSchema>;

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Phone number format validation helper (Kenya only)
 * @deprecated Use isValidPhone for international support
 */
export function isValidKenyaPhone(phone: string): boolean {
  return kenyaPhoneRegex.test(phone);
}

/**
 * International phone number validation helper (FR-014)
 * Supports phone numbers from any country
 *
 * @param phone - Phone number to validate
 * @param defaultCountry - Default country code if not included in phone (default: 'KE')
 * @returns True if valid international phone number
 */
export function isValidPhone(phone: string, defaultCountry: string = 'KE'): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return isPhoneValid(phone, defaultCountry as any);
}

/**
 * Get detailed phone validation result (FR-014)
 *
 * @param phone - Phone number to validate
 * @param defaultCountry - Default country code
 * @returns Detailed validation result
 */
export function getPhoneValidation(phone: string, defaultCountry: string = 'KE'): PhoneValidationResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return validatePhoneNumber(phone, defaultCountry as any);
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
