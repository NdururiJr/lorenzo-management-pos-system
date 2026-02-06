/**
 * Branch Access Utilities
 *
 * Helper functions for managing branch-scoped access control and queries.
 *
 * @module lib/auth/branch-access
 */

import type { UserData } from './utils';
import type { QueryConstraint } from 'firebase/firestore';
import { where } from 'firebase/firestore';

/**
 * Get array of allowed branch IDs for a user
 * Returns null for super admins (indicating all branches allowed)
 *
 * @param userData - User data object
 * @returns Array of branch IDs or null for super admin
 */
export function getAllowedBranchesArray(userData: UserData | null): string[] | null {
  if (!userData) {
    return [];
  }

  // Super admins can access all branches
  if (userData.isSuperAdmin) {
    return null; // null indicates "all branches"
  }

  // Collect all allowed branches (primary + additional access)
  const branches = new Set<string>();

  // Add primary branch if exists
  if (userData.branchId) {
    branches.add(userData.branchId);
  }

  // Add additional branches from branchAccess
  if (userData.branchAccess && Array.isArray(userData.branchAccess)) {
    userData.branchAccess.forEach((branchId) => branches.add(branchId));
  }

  return Array.from(branches);
}

/**
 * Build Firestore query constraints for branch filtering
 * Handles both single-branch and multi-branch queries
 *
 * @param allowedBranches - Array of branch IDs (null for super admin = no filter)
 * @param fieldName - Field name to filter on (default: 'branchId')
 * @returns Array of query constraints
 */
export function buildBranchConstraints(
  allowedBranches: string[] | null,
  fieldName: string = 'branchId'
): QueryConstraint[] {
  // Super admin (null) - no branch filter
  if (allowedBranches === null) {
    return [];
  }

  // No branches allowed
  if (allowedBranches.length === 0) {
    // Return impossible constraint to return no results
    return [where(fieldName, '==', '__NONE__')];
  }

  // Single branch
  if (allowedBranches.length === 1) {
    return [where(fieldName, '==', allowedBranches[0])];
  }

  // Multiple branches (up to 10 for 'in' query)
  if (allowedBranches.length <= 10) {
    return [where(fieldName, 'in', allowedBranches)];
  }

  // More than 10 branches - return first 10 and warn
  // Note: Caller should handle this by splitting into multiple queries
  console.warn(
    `More than 10 branches (${allowedBranches.length}). ` +
    `Firestore 'in' queries support max 10 values. ` +
    `Consider using multiple queries for large branch sets.`
  );
  return [where(fieldName, 'in', allowedBranches.slice(0, 10))];
}

/**
 * Check if user has branch-filtered access
 * @param userData - User data object
 * @returns true if user is branch-scoped, false if super admin (unrestricted)
 */
export function isBranchScoped(userData: UserData | null): boolean {
  if (!userData) {
    return true; // No user = restricted
  }
  return !userData.isSuperAdmin;
}

/**
 * Get branch filter description for UI display
 * @param allowedBranches - Array of branch IDs or null
 * @returns Human-readable description
 */
export function getBranchFilterDescription(allowedBranches: string[] | null): string {
  if (allowedBranches === null) {
    return 'All branches';
  }
  if (allowedBranches.length === 0) {
    return 'No branches';
  }
  if (allowedBranches.length === 1) {
    return `Branch: ${allowedBranches[0]}`;
  }
  return `${allowedBranches.length} branches`;
}

/**
 * Merge results from multiple queries (for >10 branches)
 * Helper to deduplicate results when splitting queries
 *
 * @param resultArrays - Arrays of query results
 * @param idField - Field name to use for deduplication (default: 'id')
 * @returns Deduplicated merged results
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeQueryResults<T extends Record<string, any>>(
  resultArrays: T[][],
  idField: string = 'id'
): T[] {
  const seenIds = new Set<string>();
  const merged: T[] = [];

  for (const results of resultArrays) {
    for (const item of results) {
      const id = item[idField];
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        merged.push(item);
      }
    }
  }

  return merged;
}

/**
 * Split branches into chunks for multiple 'in' queries
 * @param branches - Array of branch IDs
 * @param chunkSize - Max chunk size (default: 10 for Firestore 'in')
 * @returns Array of branch ID chunks
 */
export function chunkBranches(branches: string[], chunkSize: number = 10): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < branches.length; i += chunkSize) {
    chunks.push(branches.slice(i, i + chunkSize));
  }
  return chunks;
}
