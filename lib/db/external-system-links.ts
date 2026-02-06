/**
 * External System Links Database Operations (FR-010)
 *
 * Provides CRUD operations for managing external system account links.
 * Supports linking Lorenzo accounts to external systems like
 * Home Cleaning, Laundry App, and Corporate Portal.
 *
 * @module lib/db/external-system-links
 */

import { Timestamp, where, orderBy } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
} from './index';
import type { ExternalSystemLink, ExternalSystem, ExternalLinkStatus } from './schema';

// ============================================
// CONSTANTS
// ============================================

/** Collection name */
const COLLECTION_NAME = 'externalSystemLinks';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique link ID
 */
export function generateLinkId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `EXTLINK-${timestamp}-${random}`.toUpperCase();
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new external system link
 *
 * @param data - Link data without generated fields
 * @returns Created link ID
 */
export async function createExternalSystemLink(
  data: Omit<ExternalSystemLink, 'linkId' | 'linkedAt' | 'lastSyncAt' | 'lastAccessAt'>
): Promise<string> {
  const linkId = generateLinkId();
  const now = Timestamp.now();

  const link: ExternalSystemLink = {
    linkId,
    ...data,
    linkedAt: now,
  };

  await setDocument<ExternalSystemLink>(COLLECTION_NAME, linkId, link);
  return linkId;
}

/**
 * Get an external system link by ID
 *
 * @param linkId - Link ID
 * @returns The link
 */
export async function getExternalSystemLink(linkId: string): Promise<ExternalSystemLink> {
  return getDocument<ExternalSystemLink>(COLLECTION_NAME, linkId);
}

/**
 * Get all links for a user
 *
 * @param userId - User ID
 * @returns User's external system links
 */
export async function getUserExternalLinks(userId: string): Promise<ExternalSystemLink[]> {
  return getDocuments<ExternalSystemLink>(
    COLLECTION_NAME,
    where('userId', '==', userId),
    orderBy('linkedAt', 'desc')
  );
}

/**
 * Get active links for a user
 *
 * @param userId - User ID
 * @returns User's active external system links
 */
export async function getUserActiveLinks(userId: string): Promise<ExternalSystemLink[]> {
  return getDocuments<ExternalSystemLink>(
    COLLECTION_NAME,
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
}

/**
 * Get a user's link for a specific external system
 *
 * @param userId - User ID
 * @param externalSystem - External system name
 * @returns The link if exists
 */
export async function getUserLinkForSystem(
  userId: string,
  externalSystem: ExternalSystem
): Promise<ExternalSystemLink | null> {
  const links = await getDocuments<ExternalSystemLink>(
    COLLECTION_NAME,
    where('userId', '==', userId),
    where('externalSystem', '==', externalSystem),
    where('status', '==', 'active')
  );

  return links.length > 0 ? links[0] : null;
}

/**
 * Update an external system link
 *
 * @param linkId - Link ID
 * @param data - Partial link updates
 */
export async function updateExternalSystemLink(
  linkId: string,
  data: Partial<Omit<ExternalSystemLink, 'linkId' | 'linkedAt'>>
): Promise<void> {
  await updateDocument<ExternalSystemLink>(COLLECTION_NAME, linkId, data);
}

/**
 * Record access to external system
 *
 * @param linkId - Link ID
 */
export async function recordExternalAccess(linkId: string): Promise<void> {
  await updateExternalSystemLink(linkId, {
    lastAccessAt: Timestamp.now(),
  });
}

/**
 * Revoke an external system link
 *
 * @param linkId - Link ID
 * @param revokedBy - User ID of who revoked
 * @param reason - Revocation reason
 */
export async function revokeExternalSystemLink(
  linkId: string,
  revokedBy: string,
  reason?: string
): Promise<void> {
  await updateExternalSystemLink(linkId, {
    status: 'revoked' as ExternalLinkStatus,
    revokedAt: Timestamp.now(),
    revokedBy,
    revocationReason: reason,
  });
}

/**
 * Delete an external system link
 *
 * @param linkId - Link ID
 */
export async function deleteExternalSystemLink(linkId: string): Promise<void> {
  await deleteDocument(COLLECTION_NAME, linkId);
}

// ============================================
// LINK MANAGEMENT
// ============================================

/**
 * Link user account to external system
 *
 * @param params - Link parameters
 * @returns Created link ID
 */
export async function linkUserToExternalSystem(params: {
  userId: string;
  userName: string;
  externalSystem: ExternalSystem;
  externalUserId: string;
  externalUsername?: string;
  permissions?: string[];
}): Promise<string> {
  // Check if active link already exists
  const existingLink = await getUserLinkForSystem(params.userId, params.externalSystem);

  if (existingLink) {
    // Update existing link instead of creating new
    await updateExternalSystemLink(existingLink.linkId, {
      externalUserId: params.externalUserId,
      externalUsername: params.externalUsername,
      permissions: params.permissions,
      status: 'active',
      lastSyncAt: Timestamp.now(),
    });
    return existingLink.linkId;
  }

  // Create new link
  return createExternalSystemLink({
    userId: params.userId,
    userName: params.userName,
    externalSystem: params.externalSystem,
    externalUserId: params.externalUserId,
    externalUsername: params.externalUsername,
    status: 'active',
    permissions: params.permissions,
  });
}

/**
 * Unlink user account from external system
 *
 * @param userId - User ID
 * @param externalSystem - External system name
 * @param revokedBy - User ID of who unlinked
 */
export async function unlinkUserFromExternalSystem(
  userId: string,
  externalSystem: ExternalSystem,
  revokedBy: string
): Promise<void> {
  const link = await getUserLinkForSystem(userId, externalSystem);

  if (link) {
    await revokeExternalSystemLink(link.linkId, revokedBy, 'User initiated unlink');
  }
}

/**
 * Check if user has active link to external system
 *
 * @param userId - User ID
 * @param externalSystem - External system name
 * @returns Whether user has active link
 */
export async function hasActiveLink(
  userId: string,
  externalSystem: ExternalSystem
): Promise<boolean> {
  const link = await getUserLinkForSystem(userId, externalSystem);
  return link !== null && link.status === 'active';
}

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Get all links for an external system (admin)
 *
 * @param externalSystem - External system name
 * @returns All links for the system
 */
export async function getLinksForSystem(
  externalSystem: ExternalSystem
): Promise<ExternalSystemLink[]> {
  return getDocuments<ExternalSystemLink>(
    COLLECTION_NAME,
    where('externalSystem', '==', externalSystem),
    orderBy('linkedAt', 'desc')
  );
}

/**
 * Get all active links (admin)
 *
 * @returns All active external system links
 */
export async function getAllActiveLinks(): Promise<ExternalSystemLink[]> {
  return getDocuments<ExternalSystemLink>(
    COLLECTION_NAME,
    where('status', '==', 'active'),
    orderBy('linkedAt', 'desc')
  );
}

/**
 * Bulk revoke links for a user (when user is deactivated)
 *
 * @param userId - User ID
 * @param revokedBy - Admin user ID
 */
export async function revokeAllUserLinks(
  userId: string,
  revokedBy: string
): Promise<void> {
  const links = await getUserActiveLinks(userId);

  for (const link of links) {
    await revokeExternalSystemLink(link.linkId, revokedBy, 'User account deactivated');
  }
}
