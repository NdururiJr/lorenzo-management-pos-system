/**
 * SSO Account Linking API Route (FR-010)
 *
 * Handles linking/unlinking Lorenzo accounts with external systems.
 *
 * @module app/api/auth/sso/link-account/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { z } from 'zod';
import { canAccessExternalSystem, EXTERNAL_SYSTEM_CONFIG } from '@/lib/auth/sso-manager';
import {
  linkUserToExternalSystem,
  unlinkUserFromExternalSystem,
  getUserExternalLinks,
  hasActiveLink,
} from '@/lib/db/external-system-links';
import type { ExternalSystem, UserRole } from '@/lib/db/schema';

/**
 * Validation schema for link request
 */
const linkAccountSchema = z.object({
  externalSystem: z.enum(['home_cleaning', 'laundry_app', 'corporate_portal']),
  externalUserId: z.string().min(1),
  externalUsername: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Validation schema for unlink request
 */
const unlinkAccountSchema = z.object({
  externalSystem: z.enum(['home_cleaning', 'laundry_app', 'corporate_portal']),
});

/**
 * POST /api/auth/sso/link-account
 *
 * Link user account to external system
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
    const validationResult = linkAccountSchema.safeParse(body);

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

    const { externalSystem, externalUserId, externalUsername, permissions } = validationResult.data;

    // Get user data
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data()!;
    const userRole = userData.role as UserRole;

    // Check if system is enabled
    const systemConfig = EXTERNAL_SYSTEM_CONFIG[externalSystem as ExternalSystem];
    if (!systemConfig?.enabled) {
      return NextResponse.json(
        { success: false, error: `${systemConfig?.name || externalSystem} is not currently available` },
        { status: 400 }
      );
    }

    // Check role-based access
    if (!canAccessExternalSystem(userRole, externalSystem as ExternalSystem)) {
      return NextResponse.json(
        {
          success: false,
          error: `Your role (${userRole}) does not have access to ${systemConfig.name}`,
        },
        { status: 403 }
      );
    }

    // Link the account
    const linkId = await linkUserToExternalSystem({
      userId: decodedToken.uid,
      userName: userData.name || 'Unknown User',
      externalSystem: externalSystem as ExternalSystem,
      externalUserId,
      externalUsername,
      permissions,
    });

    return NextResponse.json({
      success: true,
      data: {
        linkId,
        externalSystem,
        externalUserId,
        systemName: systemConfig.name,
        message: `Successfully linked to ${systemConfig.name}`,
      },
    });
  } catch (error) {
    console.error('Error linking account:', error);
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
 * DELETE /api/auth/sso/link-account
 *
 * Unlink user account from external system
 */
export async function DELETE(request: NextRequest) {
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
    const validationResult = unlinkAccountSchema.safeParse(body);

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

    const { externalSystem } = validationResult.data;

    // Check if link exists
    const hasLink = await hasActiveLink(decodedToken.uid, externalSystem as ExternalSystem);

    if (!hasLink) {
      return NextResponse.json(
        {
          success: false,
          error: `No active link found for ${externalSystem}`,
        },
        { status: 404 }
      );
    }

    // Unlink the account
    await unlinkUserFromExternalSystem(
      decodedToken.uid,
      externalSystem as ExternalSystem,
      decodedToken.uid // Self-revocation
    );

    const systemConfig = EXTERNAL_SYSTEM_CONFIG[externalSystem as ExternalSystem];

    return NextResponse.json({
      success: true,
      data: {
        externalSystem,
        systemName: systemConfig?.name,
        message: `Successfully unlinked from ${systemConfig?.name || externalSystem}`,
      },
    });
  } catch (error) {
    console.error('Error unlinking account:', error);
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
 * GET /api/auth/sso/link-account
 *
 * Get user's external system links
 */
export async function GET(request: NextRequest) {
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

    // Get user's links
    const links = await getUserExternalLinks(decodedToken.uid);

    // Enrich with system info
    const enrichedLinks = links.map((link) => {
      const systemConfig = EXTERNAL_SYSTEM_CONFIG[link.externalSystem];
      return {
        ...link,
        systemName: systemConfig?.name,
        systemEnabled: systemConfig?.enabled ?? false,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedLinks,
      count: enrichedLinks.length,
    });
  } catch (error) {
    console.error('Error getting account links:', error);
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
