/**
 * Authentication Utilities
 *
 * Helper functions for authentication, permissions, and session management.
 *
 * @module lib/auth/utils
 */

import { doc, getDoc } from 'firebase/firestore';
import type { UserRole } from '@/lib/validations/auth';
import Cookies from 'js-cookie';

/**
 * User data interface stored in Firestore
 */
export interface UserData {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  branchId?: string;
  branchAccess?: string[];
  isSuperAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Role hierarchy for permission checking
 * Higher number = more permissions
 */
const roleHierarchy: Record<UserRole, number> = {
  customer: 1,
  driver: 2,
  satellite_staff: 3,
  workstation_staff: 3,
  front_desk: 4,
  workstation: 4,
  manager: 4,
  inspector: 4,           // V2.0: Order inspection at reception
  workstation_manager: 5,
  auditor: 5,             // V2.0: Read-only financial access
  logistics_manager: 6,   // V2.0: Delivery tracking, driver management
  store_manager: 6,
  finance_manager: 7,     // V2.0: Financial reports, cash out approvals
  general_manager: 7,
  director: 8,
  admin: 9,
};

/**
 * Get user role and data from Firestore (client-side)
 *
 * @param uid - User's Firebase Auth UID
 * @returns User data or null if not found
 */
export async function getUserRole(uid: string): Promise<UserData | null> {
  try {
    // Import getDbInstance to ensure we get the initialized instance
    const { getDbInstance } = await import('@/lib/firebase');
    const dbInstance = getDbInstance();

    if (!dbInstance) {
      console.error('Firebase Firestore is not initialized');
      return null;
    }

    const userDoc = await getDoc(doc(dbInstance, 'users', uid));

    if (!userDoc.exists()) {
      console.warn(`User document not found for UID: ${uid}`);
      return null;
    }

    const data = userDoc.data();
    return {
      uid,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role as UserRole,
      branchId: data.branchId,
      branchAccess: data.branchAccess || [],
      isSuperAdmin: data.isSuperAdmin || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      isActive: data.isActive ?? true,
    };
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}


/**
 * Check if user has permission based on role hierarchy
 *
 * @param userRole - Current user's role
 * @param requiredRole - Required role for the action
 * @returns True if user has permission
 *
 * @example
 * // Admin can access manager features
 * checkUserPermission('admin', 'manager') // true
 *
 * // Cashier cannot access manager features
 * checkUserPermission('cashier', 'manager') // false
 */
export function checkUserPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user has any of the specified roles
 *
 * @param userRole - Current user's role
 * @param allowedRoles - Array of allowed roles
 * @returns True if user has one of the allowed roles
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Get list of all branches a user can access
 *
 * @param userData - User data from Firestore
 * @returns Array of branch IDs user can access, or null for super admin (all branches)
 *
 * @example
 * // Super admin - can access all branches
 * getAllowedBranches({ isSuperAdmin: true, branchId: 'A', branchAccess: [] }) // null (means all)
 *
 * // Branch manager with extra access
 * getAllowedBranches({ isSuperAdmin: false, branchId: 'A', branchAccess: ['B', 'C'] }) // ['A', 'B', 'C']
 *
 * // Regular staff with single branch
 * getAllowedBranches({ isSuperAdmin: false, branchId: 'A', branchAccess: [] }) // ['A']
 */
export function getAllowedBranches(userData: UserData): string[] | null {
  // Super admin can access all branches
  if (userData.isSuperAdmin) {
    return null;
  }

  // Build list of allowed branches
  const branches: string[] = [];

  // Add primary branch
  if (userData.branchId) {
    branches.push(userData.branchId);
  }

  // Add additional branches from branchAccess
  if (userData.branchAccess && userData.branchAccess.length > 0) {
    userData.branchAccess.forEach((branchId) => {
      if (!branches.includes(branchId)) {
        branches.push(branchId);
      }
    });
  }

  return branches;
}

/**
 * Check if user can access a specific branch
 *
 * @param userData - User data from Firestore
 * @param branchId - Branch ID to check access for
 * @returns True if user can access the branch
 *
 * @example
 * canAccessBranch(userData, 'branch-A') // true if user has access to branch-A
 */
export function canAccessBranch(userData: UserData | null, branchId: string): boolean {
  if (!userData) {
    return false;
  }

  // Super admin can access all branches
  if (userData.isSuperAdmin) {
    return true;
  }

  // Check if branch is in allowed list
  const allowedBranches = getAllowedBranches(userData);
  return allowedBranches ? allowedBranches.includes(branchId) : false;
}

/**
 * Check if user is a super admin
 *
 * @param userData - User data from Firestore
 * @returns True if user is super admin
 */
export function isSuperAdmin(userData: UserData | null): boolean {
  return userData?.isSuperAdmin || false;
}

/**
 * Format Kenya phone number to standard format
 *
 * @param phone - Phone number in various formats
 * @returns Formatted phone number (+254XXXXXXXXX) or null if invalid
 *
 * @example
 * formatPhoneNumber('0712345678') // '+254712345678'
 * formatPhoneNumber('712345678') // '+254712345678'
 * formatPhoneNumber('+254712345678') // '+254712345678'
 */
export function formatPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle different formats
  if (digits.startsWith('254') && digits.length === 12) {
    // Already in correct format: 254XXXXXXXXX
    return `+${digits}`;
  } else if (digits.startsWith('0') && digits.length === 10) {
    // Format: 07XXXXXXXX or 01XXXXXXXX
    return `+254${digits.slice(1)}`;
  } else if (digits.length === 9) {
    // Format: 7XXXXXXXX or 1XXXXXXXX
    return `+254${digits}`;
  }

  // Invalid format
  return null;
}

// ============================================================================
// OTP FUNCTIONS (DISABLED - KEPT FOR REFERENCE)
// ============================================================================
// Customer authentication has been changed from phone/OTP to email/password
// These functions are kept for reference but should not be used
// ============================================================================

/**
 * Generate a random 6-digit OTP
 *
 * NOTE: This function is disabled. Customers now login with email/password.
 *
 * @returns 6-digit OTP as string
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in memory (for development)
 * In production, this should be stored in Redis or similar
 *
 * NOTE: This is disabled. Customers now login with email/password.
 */
const otpStorage = new Map<string, { otp: string; expiresAt: number }>();

/**
 * Store OTP with expiration time
 *
 * NOTE: This function is disabled. Customers now login with email/password.
 *
 * @param phone - Phone number
 * @param otp - OTP code
 * @param expiryMinutes - Expiry time in minutes (default: 10)
 */
export function storeOTP(phone: string, otp: string, expiryMinutes = 10): void {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
  otpStorage.set(phone, { otp, expiresAt });
}

/**
 * Verify OTP
 *
 * NOTE: This function is disabled. Customers now login with email/password.
 *
 * @param phone - Phone number
 * @param otp - OTP to verify
 * @returns True if OTP is valid and not expired
 */
export function verifyStoredOTP(phone: string, otp: string): boolean {
  const stored = otpStorage.get(phone);

  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(phone);
    return false;
  }

  const isValid = stored.otp === otp;
  if (isValid) {
    otpStorage.delete(phone);
  }

  return isValid;
}

// ============================================================================
// END OF DISABLED OTP FUNCTIONS
// ============================================================================

/**
 * Session management constants
 */
export const SESSION_COOKIE_NAME = 'lorenzo_session';
export const SESSION_DURATION_DAYS = 7;
export const REMEMBER_ME_DURATION_DAYS = 30;

/**
 * Set authentication token in cookie
 *
 * @param token - Firebase ID token
 * @param rememberMe - Whether to extend session duration
 */
export function setAuthToken(token: string, rememberMe = false): void {
  const expires = rememberMe ? REMEMBER_ME_DURATION_DAYS : SESSION_DURATION_DAYS;

  Cookies.set(SESSION_COOKIE_NAME, token, {
    expires,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

/**
 * Get authentication token from cookie
 *
 * @returns Firebase ID token or null if not found
 */
export function getAuthToken(): string | null {
  return Cookies.get(SESSION_COOKIE_NAME) || null;
}

/**
 * Remove authentication token from cookie
 */
export function removeAuthToken(): void {
  Cookies.remove(SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Check if user is authenticated (has valid token)
 *
 * @returns True if user has auth token
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get user display name based on role
 *
 * @param role - User role
 * @returns Display name for the role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: 'Administrator',
    director: 'Director',
    general_manager: 'General Manager',
    store_manager: 'Store Manager',
    workstation_manager: 'Workstation Manager',
    workstation_staff: 'Workstation Staff',
    satellite_staff: 'Satellite Staff',
    manager: 'Branch Manager',
    front_desk: 'Front Desk',
    workstation: 'Workstation',
    driver: 'Delivery Driver',
    customer: 'Customer',
    // V2.0 New Roles
    finance_manager: 'Finance Manager',
    auditor: 'Auditor',
    logistics_manager: 'Logistics Manager',
    inspector: 'Inspector',
  };

  return displayNames[role] || role;
}

/**
 * Get role badge color for UI
 *
 * @param role - User role
 * @returns Tailwind color class
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-black text-white',
    director: 'bg-purple-900 text-white',
    general_manager: 'bg-purple-700 text-white',
    store_manager: 'bg-indigo-700 text-white',
    workstation_manager: 'bg-blue-700 text-white',
    workstation_staff: 'bg-blue-500 text-white',
    satellite_staff: 'bg-teal-600 text-white',
    manager: 'bg-gray-700 text-white',
    front_desk: 'bg-gray-600 text-white',
    workstation: 'bg-gray-600 text-white',
    driver: 'bg-gray-600 text-white',
    customer: 'bg-gray-400 text-white',
    // V2.0 New Roles
    finance_manager: 'bg-green-700 text-white',
    auditor: 'bg-amber-700 text-white',
    logistics_manager: 'bg-cyan-700 text-white',
    inspector: 'bg-orange-600 text-white',
  };

  return colors[role] || 'bg-gray-400 text-white';
}

/**
 * Sanitize user input
 *
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Format timestamp for display
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatAuthTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
