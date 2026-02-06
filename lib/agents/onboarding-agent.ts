/**
 * Onboarding Agent
 *
 * Handles customer self-registration, verification, and profile management.
 * This agent manages the complete onboarding flow:
 * - Customer registration with name, phone, email
 * - WhatsApp OTP verification
 * - Email verification
 * - Password setup and account completion
 * - Profile updates
 *
 * @module lib/agents/onboarding-agent
 */

import { BaseAgent } from './base-agent';
import type { AgentAuth, AgentCapability, AgentResponse } from './types';
import {
  createVerificationRequest,
  getVerificationRequest,
  getVerificationByPhone,
  verifyWhatsAppOTP,
  verifyEmailToken,
  regenerateOTP,
  regenerateEmailToken,
  completeVerification,
  getVerificationStatus,
  hasPendingVerification,
} from '@/lib/db/verification';
import {
  createCustomer,
  getCustomer,
  getCustomerByPhone,
  updateCustomer,
} from '@/lib/db/customers';
import { generateCustomerId } from '@/lib/db/customers';

/**
 * Onboarding Agent - handles customer registration and verification
 */
export class OnboardingAgent extends BaseAgent {
  readonly name = 'onboarding-agent' as const;
  readonly description =
    'Handles customer self-registration, WhatsApp OTP verification, email verification, and profile management.';

  readonly capabilities: AgentCapability[] = [
    {
      action: 'initiate_registration',
      description: 'Start the customer registration process',
      requiredParams: ['name', 'phone', 'email'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'verify_phone',
      description: 'Verify phone number with WhatsApp OTP',
      requiredParams: ['requestId', 'otp'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'verify_email',
      description: 'Verify email address with token',
      requiredParams: ['token'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'resend_otp',
      description: 'Resend WhatsApp OTP for phone verification',
      requiredParams: ['requestId'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'resend_email',
      description: 'Resend email verification link',
      requiredParams: ['requestId'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'complete_registration',
      description: 'Complete registration with password',
      requiredParams: ['requestId', 'password'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'get_verification_status',
      description: 'Get current verification status',
      requiredParams: ['requestId'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'check_existing_account',
      description: 'Check if phone or email already has an account',
      requiredParams: [],
      optionalParams: ['phone', 'email'],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
    {
      action: 'update_profile',
      description: 'Update customer profile information',
      requiredParams: [],
      optionalParams: ['name', 'email', 'phone'],
      requiresAuth: true,
      allowedUserTypes: ['customer'],
    },
    {
      action: 'request_password_reset',
      description: 'Request a password reset link',
      requiredParams: ['email'],
      optionalParams: [],
      requiresAuth: false,
      allowedUserTypes: ['guest'],
    },
  ];

  /**
   * Handle incoming requests
   */
  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = this.generateId();

    switch (action) {
      case 'initiate_registration':
        return this.initiateRegistration(
          requestId,
          params.name as string,
          params.phone as string,
          params.email as string
        );

      case 'verify_phone':
        return this.verifyPhone(
          requestId,
          params.requestId as string,
          params.otp as string
        );

      case 'verify_email':
        return this.verifyEmail(requestId, params.token as string);

      case 'resend_otp':
        return this.resendOTP(requestId, params.requestId as string);

      case 'resend_email':
        return this.resendEmail(requestId, params.requestId as string);

      case 'complete_registration':
        return this.completeRegistration(
          requestId,
          params.requestId as string,
          params.password as string
        );

      case 'get_verification_status':
        return this.getStatus(requestId, params.requestId as string);

      case 'check_existing_account':
        return this.checkExistingAccount(
          requestId,
          params.phone as string | undefined,
          params.email as string | undefined
        );

      case 'update_profile':
        return this.updateProfile(requestId, auth, params);

      case 'request_password_reset':
        return this.requestPasswordReset(requestId, params.email as string);

      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Start the registration process
   */
  private async initiateRegistration(
    requestId: string,
    name: string,
    phone: string,
    email: string
  ): Promise<AgentResponse> {
    try {
      // Normalize phone number
      const normalizedPhone = this.normalizePhoneNumber(phone);
      if (!normalizedPhone) {
        return this.errorResponse(
          requestId,
          'error',
          'Please provide a valid Kenyan phone number (e.g., 0712345678 or +254712345678).'
        );
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();
      if (!this.isValidEmail(normalizedEmail)) {
        return this.errorResponse(
          requestId,
          'error',
          'Please provide a valid email address.'
        );
      }

      // Check if phone already exists
      const existingByPhone = await getCustomerByPhone(normalizedPhone);
      if (existingByPhone) {
        return this.errorResponse(
          requestId,
          'error',
          'An account with this phone number already exists. Please log in instead.'
        );
      }

      // Check for pending verification
      const pendingVerification = await hasPendingVerification(normalizedPhone);
      if (pendingVerification) {
        const existing = await getVerificationByPhone(normalizedPhone);
        if (existing) {
          return this.successResponse(
            requestId,
            {
              requestId: existing.requestId,
              alreadyStarted: true,
              phoneVerified: existing.whatsappVerified,
              emailVerified: existing.emailVerified,
            },
            'You have a pending registration. Please complete your verification.'
          );
        }
      }

      // Generate customer ID for this registration
      const customerId = generateCustomerId();

      // Create verification request
      const verification = await createVerificationRequest({
        customerId,
        name: name.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
      });

      // TODO: Send WhatsApp OTP via Wati.io
      // await sendWhatsAppOTP(normalizedPhone, verification.otp);

      // TODO: Send email verification link via Resend
      // const verificationLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/register/verify?token=${verification.emailToken}`;
      // await sendVerificationEmail(normalizedEmail, name, verificationLink);

      console.log(`[OnboardingAgent] Registration initiated for ${normalizedPhone}`);
      console.log(`[OnboardingAgent] OTP: ${verification.otp}`); // Remove in production
      console.log(`[OnboardingAgent] Email Token: ${verification.emailToken}`); // Remove in production

      return this.successResponse(
        requestId,
        {
          requestId: verification.requestId,
          customerId,
          phone: normalizedPhone,
          email: normalizedEmail,
          otpSent: true,
          emailSent: true,
        },
        `Great! I've sent a 6-digit verification code to your WhatsApp (${normalizedPhone}) and a verification link to ${normalizedEmail}. Please enter the code to verify your phone number.`
      );
    } catch (error) {
      console.error('[OnboardingAgent] Registration error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to start registration. Please try again later.'
      );
    }
  }

  /**
   * Verify phone with OTP
   */
  private async verifyPhone(
    requestId: string,
    verificationId: string,
    otp: string
  ): Promise<AgentResponse> {
    try {
      const result = await verifyWhatsAppOTP(verificationId, otp);

      if (!result.success) {
        return this.errorResponse(requestId, 'error', result.error || 'Verification failed.');
      }

      const status = await getVerificationStatus(verificationId);

      return this.successResponse(
        requestId,
        {
          requestId: verificationId,
          phoneVerified: true,
          emailVerified: status.emailVerified,
          canComplete: status.canComplete,
        },
        status.canComplete
          ? 'Phone verified! Both phone and email are verified. You can now set your password to complete registration.'
          : 'Phone verified! Please also verify your email to complete registration.'
      );
    } catch (error) {
      console.error('[OnboardingAgent] Phone verification error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to verify phone. Please try again.'
      );
    }
  }

  /**
   * Verify email with token
   */
  private async verifyEmail(requestId: string, token: string): Promise<AgentResponse> {
    try {
      const result = await verifyEmailToken(token);

      if (!result.success) {
        return this.errorResponse(requestId, 'error', result.error || 'Verification failed.');
      }

      const status = await getVerificationStatus(result.requestId!);

      return this.successResponse(
        requestId,
        {
          requestId: result.requestId,
          phoneVerified: status.phoneVerified,
          emailVerified: true,
          canComplete: status.canComplete,
        },
        status.canComplete
          ? 'Email verified! Both phone and email are verified. You can now set your password to complete registration.'
          : 'Email verified! Please also verify your phone to complete registration.'
      );
    } catch (error) {
      console.error('[OnboardingAgent] Email verification error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to verify email. Please try again.'
      );
    }
  }

  /**
   * Resend WhatsApp OTP
   */
  private async resendOTP(requestId: string, verificationId: string): Promise<AgentResponse> {
    try {
      const verification = await getVerificationRequest(verificationId);

      if (verification.whatsappVerified) {
        return this.successResponse(
          requestId,
          { alreadyVerified: true },
          'Your phone is already verified!'
        );
      }

      const result = await regenerateOTP(verificationId);

      // TODO: Send WhatsApp OTP via Wati.io
      // await sendWhatsAppOTP(verification.phone, result.otp);

      console.log(`[OnboardingAgent] New OTP: ${result.otp}`); // Remove in production

      return this.successResponse(
        requestId,
        { otpSent: true },
        "I've sent a new verification code to your WhatsApp. Please check and enter it here."
      );
    } catch (error) {
      console.error('[OnboardingAgent] Resend OTP error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to resend code. Please try again.'
      );
    }
  }

  /**
   * Resend email verification
   */
  private async resendEmail(
    requestId: string,
    verificationId: string
  ): Promise<AgentResponse> {
    try {
      const verification = await getVerificationRequest(verificationId);

      if (verification.emailVerified) {
        return this.successResponse(
          requestId,
          { alreadyVerified: true },
          'Your email is already verified!'
        );
      }

      const result = await regenerateEmailToken(verificationId);

      // TODO: Send email verification link via Resend
      // const verificationLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/register/verify?token=${result.emailToken}`;
      // await sendVerificationEmail(verification.email, verification.name, verificationLink);

      console.log(`[OnboardingAgent] New Email Token: ${result.emailToken}`); // Remove in production

      return this.successResponse(
        requestId,
        { emailSent: true },
        "I've sent a new verification link to your email. Please check your inbox (and spam folder)."
      );
    } catch (error) {
      console.error('[OnboardingAgent] Resend email error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to resend email. Please try again.'
      );
    }
  }

  /**
   * Complete registration with password
   */
  private async completeRegistration(
    requestId: string,
    verificationId: string,
    password: string
  ): Promise<AgentResponse> {
    try {
      const verification = await getVerificationRequest(verificationId);
      const status = await getVerificationStatus(verificationId);

      // Check if both verifications are complete
      if (!status.canComplete) {
        const missing: string[] = [];
        if (!status.phoneVerified) missing.push('phone');
        if (!status.emailVerified) missing.push('email');

        return this.errorResponse(
          requestId,
          'error',
          `Please verify your ${missing.join(' and ')} before completing registration.`
        );
      }

      // Validate password
      const passwordError = this.validatePassword(password);
      if (passwordError) {
        return this.errorResponse(requestId, 'error', passwordError);
      }

      // Create the customer account
      const customerId = await createCustomer({
        name: verification.name,
        phone: verification.phone,
        email: verification.email,
      });

      // Mark verification as complete
      await completeVerification(verificationId);

      // TODO: Create Firebase Auth account with password
      // await createFirebaseAuthAccount(verification.email, password, customerId);

      // TODO: Send welcome WhatsApp message
      // await sendWelcomeMessage(verification.phone, verification.name);

      console.log(`[OnboardingAgent] Registration complete for customer ${customerId}`);

      return this.successResponse(
        requestId,
        {
          customerId,
          email: verification.email,
          phone: verification.phone,
          name: verification.name,
          registrationComplete: true,
        },
        `Welcome to Lorenzo Dry Cleaners, ${verification.name}! Your account is now ready. You can log in and schedule your first pickup.`
      );
    } catch (error) {
      console.error('[OnboardingAgent] Complete registration error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to complete registration. Please try again.'
      );
    }
  }

  /**
   * Get verification status
   */
  private async getStatus(
    requestId: string,
    verificationId: string
  ): Promise<AgentResponse> {
    try {
      const status = await getVerificationStatus(verificationId);

      let message = '';
      if (status.canComplete) {
        message = 'Both phone and email are verified! You can now set your password.';
      } else if (status.phoneVerified && !status.emailVerified) {
        message = 'Phone verified. Please check your email to complete verification.';
      } else if (!status.phoneVerified && status.emailVerified) {
        message = 'Email verified. Please enter the WhatsApp code to complete verification.';
      } else {
        message = 'Please verify both your phone and email to continue.';
      }

      return this.successResponse(requestId, status, message);
    } catch (error) {
      console.error('[OnboardingAgent] Get status error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to get verification status.'
      );
    }
  }

  /**
   * Check if phone or email already has an account
   */
  private async checkExistingAccount(
    requestId: string,
    phone?: string,
    email?: string
  ): Promise<AgentResponse> {
    try {
      const results: {
        phoneExists: boolean;
        emailExists: boolean;
        phone?: string;
        email?: string;
      } = {
        phoneExists: false,
        emailExists: false,
      };

      if (phone) {
        const normalizedPhone = this.normalizePhoneNumber(phone);
        if (normalizedPhone) {
          const existing = await getCustomerByPhone(normalizedPhone);
          results.phoneExists = !!existing;
          results.phone = normalizedPhone;
        }
      }

      if (email) {
        // TODO: Check email in Firebase Auth
        results.email = email.toLowerCase().trim();
      }

      return this.successResponse(requestId, results);
    } catch (error) {
      console.error('[OnboardingAgent] Check existing account error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to check existing account.'
      );
    }
  }

  /**
   * Update customer profile
   */
  private async updateProfile(
    requestId: string,
    auth: AgentAuth,
    params: Record<string, unknown>
  ): Promise<AgentResponse> {
    try {
      if (!auth.customerId) {
        return this.errorResponse(requestId, 'unauthorized', 'Please log in to update your profile.');
      }

      const customer = await getCustomer(auth.customerId);
      const updates: Record<string, unknown> = {};

      if (params.name && typeof params.name === 'string') {
        updates.name = params.name.trim();
      }

      if (params.email && typeof params.email === 'string') {
        const normalizedEmail = (params.email as string).toLowerCase().trim();
        if (this.isValidEmail(normalizedEmail)) {
          updates.email = normalizedEmail;
        }
      }

      if (Object.keys(updates).length === 0) {
        return this.successResponse(requestId, { customer }, 'No changes to update.');
      }

      await updateCustomer(auth.customerId, updates);
      const updatedCustomer = await getCustomer(auth.customerId);

      return this.successResponse(
        requestId,
        { customer: updatedCustomer },
        'Your profile has been updated successfully!'
      );
    } catch (error) {
      console.error('[OnboardingAgent] Update profile error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to update profile. Please try again.'
      );
    }
  }

  /**
   * Request password reset
   */
  private async requestPasswordReset(
    requestId: string,
    email: string
  ): Promise<AgentResponse> {
    try {
      const _normalizedEmail = email.toLowerCase().trim();

      // TODO: Send password reset email via Firebase Auth
      // await sendPasswordResetEmail(_normalizedEmail);

      // Always return success to prevent email enumeration
      return this.successResponse(
        requestId,
        { emailSent: true },
        "If an account exists with this email, you'll receive a password reset link shortly."
      );
    } catch (error) {
      console.error('[OnboardingAgent] Password reset error:', error);
      return this.errorResponse(
        requestId,
        'error',
        'Failed to send password reset. Please try again.'
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Normalize phone number to +254 format
   */
  private normalizePhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Handle different formats
    if (digits.startsWith('254') && digits.length === 12) {
      return `+${digits}`;
    }
    if (digits.startsWith('0') && digits.length === 10) {
      return `+254${digits.slice(1)}`;
    }
    if (digits.startsWith('7') && digits.length === 9) {
      return `+254${digits}`;
    }
    if (digits.length === 9) {
      return `+254${digits}`;
    }

    return null;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): string | null {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }
    return null;
  }
}

// Export singleton instance
export const onboardingAgent = new OnboardingAgent();
