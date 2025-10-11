/**
 * Authentication Server Actions
 *
 * Server-side functions for authentication operations.
 * These run on the server and interact with Firebase Admin SDK.
 *
 * @module app/(auth)/actions
 */

'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import {
  generateOTP,
  storeOTP,
  verifyStoredOTP,
  formatPhoneNumber,
} from '@/lib/auth/utils';
import { getUserRoleServer } from '@/lib/auth/server-utils';
import type {
  LoginFormData,
  CustomerLoginFormData,
  OTPFormData,
  ForgotPasswordFormData,
  RegisterFormData,
} from '@/lib/validations/auth';

/**
 * Action result interface
 */
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Sign in with email and password
 * Validates credentials and returns user data
 *
 * @param data - Login form data
 * @returns Action result with user data
 */
export async function signInWithEmail(
  data: LoginFormData
): Promise<ActionResult<{ uid: string; email: string }>> {
  try {
    // Get user by email
    const user = await adminAuth.getUserByEmail(data.email);

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Check if user is active
    const userData = await getUserRoleServer(user.uid);
    if (!userData?.isActive) {
      return {
        success: false,
        error: 'Account is disabled. Please contact support.',
      };
    }

    // Note: Password verification happens on client-side with Firebase Auth
    // This action is mainly for additional validation and logging
    return {
      success: true,
      data: {
        uid: user.uid,
        email: user.email!,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'Failed to sign in. Please check your credentials.',
    };
  }
}

/**
 * Send OTP to phone number
 * Generates and stores OTP for phone verification
 *
 * @param data - Customer login form data with phone number
 * @returns Action result with success status
 */
export async function signInWithPhone(
  data: CustomerLoginFormData
): Promise<ActionResult<{ message: string }>> {
  try {
    const formattedPhone = formatPhoneNumber(data.phone);

    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    // Check if user exists with this phone number
    const usersSnapshot = await adminDb
      .collection('users')
      .where('phone', '==', formattedPhone)
      .limit(1)
      .get();

    // If user doesn't exist, create a customer account
    if (usersSnapshot.empty) {
      // Generate UID for new user
      const uid = `customer_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await adminDb.collection('users').doc(uid).set({
        uid,
        phone: formattedPhone,
        role: 'customer',
        name: 'Customer', // Will be updated later
        email: '', // Optional for customers
        branchId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generate OTP
    const otp = generateOTP();
    storeOTP(formattedPhone, otp);

    // TODO: In production, send OTP via SMS service (e.g., Africa's Talking, Twilio)
    console.log(`OTP for ${formattedPhone}: ${otp}`);

    return {
      success: true,
      data: {
        message: `OTP sent to ${formattedPhone}. For development, check console.`,
      },
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      error: 'Failed to send OTP. Please try again.',
    };
  }
}

/**
 * Verify OTP code
 * Validates OTP and creates custom token for authentication
 *
 * @param data - OTP form data
 * @returns Action result with custom token
 */
export async function verifyOTP(
  data: OTPFormData
): Promise<ActionResult<{ customToken: string; uid: string }>> {
  try {
    if (!data.phone) {
      return {
        success: false,
        error: 'Phone number is required',
      };
    }

    const formattedPhone = formatPhoneNumber(data.phone);

    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    // Verify OTP
    const isValid = verifyStoredOTP(formattedPhone, data.otp);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid or expired OTP',
      };
    }

    // Get user by phone number
    const usersSnapshot = await adminDb
      .collection('users')
      .where('phone', '==', formattedPhone)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const userDoc = usersSnapshot.docs[0];
    const uid = userDoc.id;

    // Create custom token for authentication
    const customToken = await adminAuth.createCustomToken(uid);

    return {
      success: true,
      data: {
        customToken,
        uid,
      },
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      error: 'Failed to verify OTP. Please try again.',
    };
  }
}

/**
 * Send password reset email
 *
 * @param data - Forgot password form data
 * @returns Action result with success status
 */
export async function sendPasswordReset(
  data: ForgotPasswordFormData
): Promise<ActionResult<{ message: string }>> {
  try {
    // Check if user exists
    const user = await adminAuth.getUserByEmail(data.email);

    if (!user) {
      // Don't reveal if email exists for security
      return {
        success: true,
        data: {
          message:
            'If an account exists with this email, a password reset link has been sent.',
        },
      };
    }

    // Generate password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(data.email);

    // TODO: In production, send email via email service (e.g., SendGrid, AWS SES)
    console.log(`Password reset link for ${data.email}: ${resetLink}`);

    return {
      success: true,
      data: {
        message:
          'If an account exists with this email, a password reset link has been sent.',
      },
    };
  } catch (error) {
    console.error('Send password reset error:', error);
    return {
      success: false,
      error: 'Failed to send password reset email. Please try again.',
    };
  }
}

/**
 * Register new user (admin only)
 * Creates user in Firebase Auth and Firestore
 *
 * @param data - Registration form data
 * @returns Action result with user UID
 */
export async function registerUser(
  data: RegisterFormData
): Promise<ActionResult<{ uid: string }>> {
  try {
    const formattedPhone = formatPhoneNumber(data.phone);

    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    // Check if email already exists
    try {
      await adminAuth.getUserByEmail(data.email);
      return {
        success: false,
        error: 'Email already in use',
      };
    } catch (_error) {
      // Email doesn't exist, proceed with registration
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
      phoneNumber: formattedPhone,
    });

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: data.role,
      branchId: data.branchId,
    });

    // Create user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: data.email,
      name: data.name,
      phone: formattedPhone,
      role: data.role,
      branchId: data.branchId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: {
        uid: userRecord.uid,
      },
    };
  } catch (error: unknown) {
    console.error('Register user error:', error);

    let errorMessage = 'Failed to register user';
    if (error instanceof Error && 'code' in error) {
      const code = (error as { code: string }).code;
      if (code === 'auth/email-already-exists') {
        errorMessage = 'Email already in use';
      } else if (code === 'auth/invalid-password') {
        errorMessage = 'Password is too weak';
      } else if (code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Sign out user (cleanup action)
 * Can be used for additional server-side cleanup if needed
 *
 * @returns Action result
 */
export async function signOutUser(): Promise<ActionResult> {
  try {
    // Any server-side cleanup can go here
    // (e.g., clear session data, log activity)

    return {
      success: true,
    };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: 'Failed to sign out',
    };
  }
}

/**
 * Resend OTP
 * Generates new OTP and sends to phone
 *
 * @param phone - Phone number
 * @returns Action result
 */
export async function resendOTP(
  phone: string
): Promise<ActionResult<{ message: string }>> {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    // Generate new OTP
    const otp = generateOTP();
    storeOTP(formattedPhone, otp);

    // TODO: Send OTP via SMS
    console.log(`New OTP for ${formattedPhone}: ${otp}`);

    return {
      success: true,
      data: {
        message: 'New OTP sent successfully',
      },
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      error: 'Failed to resend OTP',
    };
  }
}
