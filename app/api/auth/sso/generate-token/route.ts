/**
 * SSO Token Generation API Route (FR-010)
 *
 * Generates SSO tokens for external system access.
 *
 * @module app/api/auth/sso/generate-token/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { z } from 'zod';
import {
  generateSSOToken,
  generateSSOUrl,
  encodeToken,
  canAccessExternalSystem,
  EXTERNAL_SYSTEM_CONFIG,
} from '@/lib/auth/sso-manager';
import { recordExternalAccess, getUserLinkForSystem } from '@/lib/db/external-system-links';
import type { ExternalSystem, UserRole } from '@/lib/db/schema';

/**
 * Validation schema for token generation request
 */
const generateTokenSchema = z.object({
  targetSystem: z.enum(['home_cleaning', 'laundry_app', 'corporate_portal']),
  returnUrl: z.string().url().optional(),
});

/**
 * POST /api/auth/sso/generate-token
 *
 * Generate SSO token for external system access
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateTokenSchema.safeParse(body);

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

    const { targetSystem } = validationResult.data;

    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data()!;
    const userRole = userData.role as UserRole;

    // Check if target system is enabled
    const systemConfig = EXTERNAL_SYSTEM_CONFIG[targetSystem as ExternalSystem];
    if (!systemConfig?.enabled) {
      return NextResponse.json(
        { success: false, error: `${systemConfig?.name || targetSystem} is not currently available` },
        { status: 400 }
      );
    }

    // Check role-based access
    if (!canAccessExternalSystem(userRole, targetSystem as ExternalSystem)) {
      return NextResponse.json(
        {
          success: false,
          error: `Your role (${userRole}) does not have access to ${systemConfig.name}`,
        },
        { status: 403 }
      );
    }

    // Generate SSO token
    const ssoToken = generateSSOToken({
      userId: decodedToken.uid,
      email: userData.email || decodedToken.email || '',
      name: userData.name || 'Unknown User',
      role: userRole,
      branchId: userData.branchId || 'HQ',
      targetSystem: targetSystem as ExternalSystem,
    });

    // Generate redirect URL
    const ssoUrl = generateSSOUrl(ssoToken);
    const encodedToken = encodeToken(ssoToken);

    // Record access if user has a link
    const link = await getUserLinkForSystem(decodedToken.uid, targetSystem as ExternalSystem);
    if (link) {
      await recordExternalAccess(link.linkId);
    }

    return NextResponse.json({
      success: true,
      data: {
        token: encodedToken,
        url: ssoUrl,
        expiresAt: ssoToken.expiresAt,
        targetSystem: targetSystem,
        systemName: systemConfig.name,
      },
    });
  } catch (error) {
    console.error('Error generating SSO token:', error);
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
