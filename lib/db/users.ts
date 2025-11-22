/**
 * User Database Operations
 *
 * This file provides type-safe CRUD operations for the users collection.
 * All functions include proper error handling and validation.
 *
 * @module lib/db/users
 */

import { where, orderBy, limit, Timestamp } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  DatabaseError,
} from './index';
import type { User } from './schema';

/**
 * Get user by UID
 */
export async function getUser(uid: string): Promise<User> {
  return getDocument<User>('users', uid);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await getDocuments<User>(
      'users',
      where('email', '==', email),
      limit(1)
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get user by email', error);
  }
}

/**
 * Get user by phone number
 */
export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    const users = await getDocuments<User>(
      'users',
      where('phone', '==', phone),
      limit(1)
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get user by phone', error);
  }
}

/**
 * Create a new user
 */
export async function createUser(
  uid: string,
  data: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const user: User = {
    uid,
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  } as User;

  await setDocument<User>('users', uid, user);
}

/**
 * Update user details
 */
export async function updateUser(
  uid: string,
  data: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<void> {
  const updates = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  return updateDocument<User>('users', uid, updates);
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: string): Promise<User[]> {
  return getDocuments<User>('users', where('role', '==', role));
}

/**
 * Get users by branch
 */
export async function getUsersByBranch(branchId: string): Promise<User[]> {
  return getDocuments<User>('users', where('branchId', '==', branchId));
}

/**
 * Get all active users
 */
export async function getActiveUsers(): Promise<User[]> {
  return getDocuments<User>(
    'users',
    where('active', '==', true),
    orderBy('name', 'asc')
  );
}

/**
 * Deactivate user account
 */
export async function deactivateUser(uid: string): Promise<void> {
  return updateDocument<User>('users', uid, {
    active: false,
  });
}

/**
 * Activate user account
 */
export async function activateUser(uid: string): Promise<void> {
  return updateDocument<User>('users', uid, {
    active: true,
  });
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(uid: string): Promise<void> {
  return deleteDocument('users', uid);
}
