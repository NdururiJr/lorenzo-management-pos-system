/**
 * Server-Side Authentication Utilities
 *
 * Helper functions for server-side authentication operations.
 * DO NOT import this in client components.
 *
 * @module lib/auth/server-utils
 */

import { adminDb } from '@/lib/firebase-admin';
import type { UserRole } from '@/lib/validations/auth';

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
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Get user role from Firestore (server-side only)
 *
 * @param uid - User's Firebase Auth UID
 * @returns User data or null if not found
 */
export async function getUserRoleServer(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      console.warn(`User document not found for UID: ${uid}`);
      return null;
    }

    const data = userDoc.data()!;
    return {
      uid,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role as UserRole,
      branchId: data.branchId,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      isActive: data.isActive ?? true,
    };
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}
