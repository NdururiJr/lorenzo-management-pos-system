/**
 * SSO Manager (FR-010)
 *
 * Handles Single Sign-On token generation and validation for
 * external system integration (Home Cleaning System, Corporate Portal).
 *
 * @module lib/auth/sso-manager
 */

import { createHmac, randomBytes } from 'crypto';
import type { SSOToken, ExternalSystem, UserRole } from '@/lib/db/schema';

// ============================================
// CONSTANTS
// ============================================

/** Default token expiry in seconds (1 hour) */
const DEFAULT_TOKEN_EXPIRY = 3600;

/** SSO secret key for signing tokens */
const SSO_SECRET = process.env.SSO_SECRET_KEY || 'lorenzo-sso-secret-key-change-in-production';

/** External system configurations */
export const EXTERNAL_SYSTEM_CONFIG: Record<ExternalSystem, {
  name: string;
  baseUrl: string;
  callbackPath: string;
  enabled: boolean;
}> = {
  home_cleaning: {
    name: 'Home Cleaning System',
    baseUrl: process.env.HOME_CLEANING_SYSTEM_URL || 'https://homecleaning.lorenzo.co.ke',
    callbackPath: '/auth/sso/callback',
    enabled: true,
  },
  laundry_app: {
    name: 'Laundry App',
    baseUrl: process.env.LAUNDRY_APP_URL || 'https://laundry.lorenzo.co.ke',
    callbackPath: '/auth/sso/callback',
    enabled: false, // Future implementation
  },
  corporate_portal: {
    name: 'Corporate Portal',
    baseUrl: process.env.CORPORATE_PORTAL_URL || 'https://corporate.lorenzo.co.ke',
    callbackPath: '/auth/sso/callback',
    enabled: false, // Future implementation
  },
};

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate a unique token ID
 */
function generateTokenId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Create HMAC signature for token
 */
function createSignature(payload: Omit<SSOToken, 'signature'>): string {
  const data = JSON.stringify({
    tokenId: payload.tokenId,
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    branchId: payload.branchId,
    targetSystem: payload.targetSystem,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
  });

  return createHmac('sha256', SSO_SECRET).update(data).digest('hex');
}

/**
 * Generate SSO token for external system access
 *
 * @param params - Token parameters
 * @returns Generated SSO token
 */
export function generateSSOToken(params: {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string;
  targetSystem: ExternalSystem;
  expirySeconds?: number;
}): SSOToken {
  const now = Math.floor(Date.now() / 1000);
  const expirySeconds = params.expirySeconds ?? DEFAULT_TOKEN_EXPIRY;

  const payload: Omit<SSOToken, 'signature'> = {
    tokenId: generateTokenId(),
    userId: params.userId,
    email: params.email,
    name: params.name,
    role: params.role,
    branchId: params.branchId,
    targetSystem: params.targetSystem,
    issuedAt: now,
    expiresAt: now + expirySeconds,
  };

  const signature = createSignature(payload);

  return {
    ...payload,
    signature,
  };
}

/**
 * Encode SSO token to base64 string for URL transport
 */
export function encodeToken(token: SSOToken): string {
  return Buffer.from(JSON.stringify(token)).toString('base64url');
}

/**
 * Decode base64 token string to SSOToken
 */
export function decodeToken(encodedToken: string): SSOToken | null {
  try {
    const decoded = Buffer.from(encodedToken, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as SSOToken;
  } catch {
    return null;
  }
}

// ============================================
// TOKEN VALIDATION
// ============================================

/**
 * Validation result interface
 */
export interface TokenValidationResult {
  valid: boolean;
  error?: string;
  token?: SSOToken;
}

/**
 * Validate SSO token
 *
 * @param token - Token to validate
 * @returns Validation result
 */
export function validateSSOToken(token: SSOToken): TokenValidationResult {
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (token.expiresAt < now) {
    return { valid: false, error: 'Token has expired' };
  }

  // Verify signature
  const expectedSignature = createSignature(token);
  if (token.signature !== expectedSignature) {
    return { valid: false, error: 'Invalid token signature' };
  }

  // Check target system is enabled
  const systemConfig = EXTERNAL_SYSTEM_CONFIG[token.targetSystem];
  if (!systemConfig?.enabled) {
    return { valid: false, error: 'Target system is not enabled' };
  }

  return { valid: true, token };
}

/**
 * Validate encoded token string
 *
 * @param encodedToken - Base64 encoded token
 * @returns Validation result
 */
export function validateEncodedToken(encodedToken: string): TokenValidationResult {
  const token = decodeToken(encodedToken);
  if (!token) {
    return { valid: false, error: 'Invalid token format' };
  }

  return validateSSOToken(token);
}

// ============================================
// SSO URL GENERATION
// ============================================

/**
 * Generate SSO redirect URL for external system
 *
 * @param token - SSO token
 * @returns Full URL to redirect user to external system
 */
export function generateSSOUrl(token: SSOToken): string {
  const systemConfig = EXTERNAL_SYSTEM_CONFIG[token.targetSystem];
  if (!systemConfig) {
    throw new Error(`Unknown external system: ${token.targetSystem}`);
  }

  const encodedToken = encodeToken(token);
  const callbackUrl = `${systemConfig.baseUrl}${systemConfig.callbackPath}`;

  return `${callbackUrl}?token=${encodedToken}`;
}

/**
 * Generate SSO launch URL with token
 *
 * @param params - Token parameters
 * @returns SSO URL to redirect user
 */
export function generateSSOLaunchUrl(params: {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string;
  targetSystem: ExternalSystem;
}): { url: string; token: SSOToken } {
  const token = generateSSOToken(params);
  const url = generateSSOUrl(token);

  return { url, token };
}

// ============================================
// ROLE-BASED ACCESS
// ============================================

/**
 * Roles allowed to access Home Cleaning System
 */
const HOME_CLEANING_ALLOWED_ROLES: UserRole[] = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
  'manager',
];

/**
 * Roles allowed to access Corporate Portal
 */
const CORPORATE_PORTAL_ALLOWED_ROLES: UserRole[] = [
  'admin',
  'director',
  'general_manager',
];

/**
 * Check if a role can access a specific external system
 *
 * @param role - User role
 * @param system - Target external system
 * @returns Whether access is allowed
 */
export function canAccessExternalSystem(role: UserRole, system: ExternalSystem): boolean {
  switch (system) {
    case 'home_cleaning':
      return HOME_CLEANING_ALLOWED_ROLES.includes(role);
    case 'corporate_portal':
      return CORPORATE_PORTAL_ALLOWED_ROLES.includes(role);
    case 'laundry_app':
      return true; // All roles can access laundry app when enabled
    default:
      return false;
  }
}

/**
 * Get list of external systems a role can access
 *
 * @param role - User role
 * @returns List of accessible external systems
 */
export function getAccessibleSystems(role: UserRole): ExternalSystem[] {
  const systems: ExternalSystem[] = ['home_cleaning', 'laundry_app', 'corporate_portal'];
  return systems.filter((system) => {
    const config = EXTERNAL_SYSTEM_CONFIG[system];
    return config.enabled && canAccessExternalSystem(role, system);
  });
}
