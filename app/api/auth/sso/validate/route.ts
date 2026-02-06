/**
 * SSO Token Validation API Route (FR-010)
 *
 * Validates SSO tokens from external systems.
 * Used by external systems to verify incoming SSO tokens.
 *
 * @module app/api/auth/sso/validate/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import {
  validateEncodedToken,
  decodeToken,
  EXTERNAL_SYSTEM_CONFIG,
} from '@/lib/auth/sso-manager';
import type { ExternalSystem } from '@/lib/db/schema';

/**
 * Validation schema for token validation request
 */
const validateTokenSchema = z.object({
  token: z.string().min(1),
  expectedSystem: z.enum(['home_cleaning', 'laundry_app', 'corporate_portal']).optional(),
});

/**
 * POST /api/auth/sso/validate
 *
 * Validate SSO token from external system
 *
 * This endpoint is called by external systems to verify the SSO token
 * they received is valid and get user information.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = validateTokenSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { token, expectedSystem } = validationResult.data;

    // Validate the token
    const tokenValidation = validateEncodedToken(token);

    if (!tokenValidation.valid || !tokenValidation.token) {
      return NextResponse.json(
        {
          success: false,
          error: tokenValidation.error || 'Invalid token',
        },
        { status: 401 }
      );
    }

    const ssoToken = tokenValidation.token;

    // If expected system is provided, verify it matches
    if (expectedSystem && ssoToken.targetSystem !== expectedSystem) {
      return NextResponse.json(
        {
          success: false,
          error: `Token is for ${ssoToken.targetSystem}, not ${expectedSystem}`,
        },
        { status: 403 }
      );
    }

    // Get additional user data from Firestore
    const userDoc = await adminDb.collection('users').doc(ssoToken.userId).get();

    const userData = userDoc.exists ? userDoc.data() : null;

    // Get system config for response
    const systemConfig = EXTERNAL_SYSTEM_CONFIG[ssoToken.targetSystem as ExternalSystem];

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        user: {
          userId: ssoToken.userId,
          email: ssoToken.email,
          name: ssoToken.name,
          role: ssoToken.role,
          branchId: ssoToken.branchId,
          // Additional user data if available
          phone: userData?.phone,
          active: userData?.active ?? true,
        },
        token: {
          tokenId: ssoToken.tokenId,
          issuedAt: ssoToken.issuedAt,
          expiresAt: ssoToken.expiresAt,
          targetSystem: ssoToken.targetSystem,
          systemName: systemConfig?.name,
        },
      },
    });
  } catch (error) {
    console.error('Error validating SSO token:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/sso/validate
 *
 * Quick token validation (returns minimal info)
 * Useful for health checks or quick validation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate the token
    const tokenValidation = validateEncodedToken(token);

    if (!tokenValidation.valid || !tokenValidation.token) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: tokenValidation.error || 'Invalid token',
        },
        { status: 401 }
      );
    }

    const ssoToken = tokenValidation.token;

    return NextResponse.json({
      success: true,
      valid: true,
      userId: ssoToken.userId,
      expiresAt: ssoToken.expiresAt,
      targetSystem: ssoToken.targetSystem,
    });
  } catch (error) {
    console.error('Error validating SSO token:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
