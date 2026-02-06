/**
 * Verification Database Operations
 *
 * This file provides type-safe CRUD operations for verification requests.
 * Used for customer self-registration with WhatsApp OTP and email verification.
 *
 * @module lib/db/verification
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import crypto from 'crypto';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  DatabaseError,
} from './index';
import type { VerificationStatus } from '@/lib/agents/types';

/**
 * Verification request stored in Firestore
 */
export interface VerificationRequest {
  requestId: string;
  customerId: string;
  name: string;
  phone: string;
  email: string;
  whatsappOTP: string; // Hashed
  whatsappOTPExpiry: Timestamp;
  whatsappVerified: boolean;
  emailToken: string;
  emailTokenExpiry: Timestamp;
  emailVerified: boolean;
  status: VerificationStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Generate a unique verification request ID
 * Format: VER-[TIMESTAMP]-[RANDOM]
 */
export function generateVerificationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `VER-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash an OTP for secure storage
 */
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify an OTP against a hashed value
 */
export function verifyOTPHash(otp: string, hashedOTP: string): boolean {
  return hashOTP(otp) === hashedOTP;
}

/**
 * Generate a secure email verification token
 */
export function generateEmailToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new verification request
 *
 * @param data - Initial verification data
 * @returns The created request ID and plain OTP (to send via WhatsApp)
 */
export async function createVerificationRequest(data: {
  customerId: string;
  name: string;
  phone: string;
  email: string;
}): Promise<{ requestId: string; otp: string; emailToken: string }> {
  const requestId = generateVerificationId();
  const otp = generateOTP();
  const emailToken = generateEmailToken();

  const now = Timestamp.now();
  const otpExpiry = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes
  const emailExpiry = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const request = {
    requestId,
    customerId: data.customerId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    whatsappOTP: hashOTP(otp),
    whatsappOTPExpiry: otpExpiry,
    whatsappVerified: false,
    emailToken,
    emailTokenExpiry: emailExpiry,
    emailVerified: false,
    status: 'pending' as const,
    updatedAt: now,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await setDocument<VerificationRequest>('verification_requests', requestId, request as any);

  return { requestId, otp, emailToken };
}

/**
 * Get verification request by ID
 */
export async function getVerificationRequest(
  requestId: string
): Promise<VerificationRequest> {
  return getDocument<VerificationRequest>('verification_requests', requestId);
}

/**
 * Get verification request by customer ID
 */
export async function getVerificationByCustomerId(
  customerId: string
): Promise<VerificationRequest | null> {
  try {
    const requests = await getDocuments<VerificationRequest>(
      'verification_requests',
      where('customerId', '==', customerId),
      where('status', '!=', 'expired'),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    return requests.length > 0 ? requests[0] : null;
  } catch {
    return null;
  }
}

/**
 * Get verification request by phone number
 */
export async function getVerificationByPhone(
  phone: string
): Promise<VerificationRequest | null> {
  try {
    const requests = await getDocuments<VerificationRequest>(
      'verification_requests',
      where('phone', '==', phone),
      where('status', '!=', 'expired'),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    return requests.length > 0 ? requests[0] : null;
  } catch {
    return null;
  }
}

/**
 * Get verification request by email
 */
export async function getVerificationByEmail(
  email: string
): Promise<VerificationRequest | null> {
  try {
    const requests = await getDocuments<VerificationRequest>(
      'verification_requests',
      where('email', '==', email.toLowerCase()),
      where('status', '!=', 'expired'),
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    return requests.length > 0 ? requests[0] : null;
  } catch {
    return null;
  }
}

/**
 * Verify WhatsApp OTP
 *
 * @param requestId - Verification request ID
 * @param otp - OTP entered by user
 * @returns Success status and error message if failed
 */
export async function verifyWhatsAppOTP(
  requestId: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const request = await getVerificationRequest(requestId);

    // Check if already verified
    if (request.whatsappVerified) {
      return { success: true };
    }

    // Check if OTP expired
    if (request.whatsappOTPExpiry.toMillis() < Date.now()) {
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }

    // Verify OTP
    if (!verifyOTPHash(otp, request.whatsappOTP)) {
      return { success: false, error: 'Invalid OTP. Please try again.' };
    }

    // Update verification status
    const newStatus: VerificationStatus = request.emailVerified
      ? 'completed'
      : 'phone_verified';

    await updateDocument<VerificationRequest>('verification_requests', requestId, {
      whatsappVerified: true,
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    throw new DatabaseError('Failed to verify OTP', error);
  }
}

/**
 * Verify email token
 *
 * @param token - Email verification token
 * @returns Success status and request ID if found
 */
export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    // Find request by token
    const requests = await getDocuments<VerificationRequest>(
      'verification_requests',
      where('emailToken', '==', token),
      limit(1)
    );

    if (requests.length === 0) {
      return { success: false, error: 'Invalid verification link.' };
    }

    const request = requests[0];

    // Check if already verified
    if (request.emailVerified) {
      return { success: true, requestId: request.requestId };
    }

    // Check if token expired
    if (request.emailTokenExpiry.toMillis() < Date.now()) {
      return { success: false, error: 'Verification link has expired. Please request a new one.' };
    }

    // Update verification status
    const newStatus: VerificationStatus = request.whatsappVerified
      ? 'completed'
      : 'email_verified';

    await updateDocument<VerificationRequest>('verification_requests', request.requestId, {
      emailVerified: true,
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    return { success: true, requestId: request.requestId };
  } catch (error) {
    throw new DatabaseError('Failed to verify email', error);
  }
}

/**
 * Regenerate OTP for a verification request
 *
 * @param requestId - Verification request ID
 * @returns New OTP to send via WhatsApp
 */
export async function regenerateOTP(requestId: string): Promise<{ otp: string }> {
  const otp = generateOTP();
  const otpExpiry = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes

  await updateDocument<VerificationRequest>('verification_requests', requestId, {
    whatsappOTP: hashOTP(otp),
    whatsappOTPExpiry: otpExpiry,
    updatedAt: Timestamp.now(),
  });

  return { otp };
}

/**
 * Regenerate email verification token
 *
 * @param requestId - Verification request ID
 * @returns New email token
 */
export async function regenerateEmailToken(
  requestId: string
): Promise<{ emailToken: string }> {
  const emailToken = generateEmailToken();
  const emailExpiry = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await updateDocument<VerificationRequest>('verification_requests', requestId, {
    emailToken,
    emailTokenExpiry: emailExpiry,
    updatedAt: Timestamp.now(),
  });

  return { emailToken };
}

/**
 * Mark verification as completed
 *
 * @param requestId - Verification request ID
 */
export async function completeVerification(requestId: string): Promise<void> {
  await updateDocument<VerificationRequest>('verification_requests', requestId, {
    status: 'completed',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Mark verification as expired
 *
 * @param requestId - Verification request ID
 */
export async function expireVerification(requestId: string): Promise<void> {
  await updateDocument<VerificationRequest>('verification_requests', requestId, {
    status: 'expired',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete verification request (cleanup after successful registration)
 */
export async function deleteVerificationRequest(requestId: string): Promise<void> {
  return deleteDocument('verification_requests', requestId);
}

/**
 * Check if phone number has pending verification
 */
export async function hasPendingVerification(phone: string): Promise<boolean> {
  const request = await getVerificationByPhone(phone);
  return request !== null && request.status !== 'completed' && request.status !== 'expired';
}

/**
 * Get verification status summary
 */
export async function getVerificationStatus(
  requestId: string
): Promise<{
  requestId: string;
  phone: string;
  email: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  status: VerificationStatus;
  canComplete: boolean;
}> {
  const request = await getVerificationRequest(requestId);

  return {
    requestId: request.requestId,
    phone: request.phone,
    email: request.email,
    phoneVerified: request.whatsappVerified,
    emailVerified: request.emailVerified,
    status: request.status,
    canComplete: request.whatsappVerified && request.emailVerified,
  };
}
