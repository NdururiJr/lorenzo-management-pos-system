/**
 * Branch Lookup Utilities with Caching
 *
 * Client-side helper to fetch and cache branch names by branchId
 * for UI components like the Sidebar user chip.
 */

import { getBranchById } from '@/lib/db';
import type { Branch } from '@/lib/db/schema';

// In-memory cache for branch data
const branchCache = new Map<string, Branch>();
const fetchPromises = new Map<string, Promise<Branch>>();

/**
 * Get branch name by branchId with caching
 * @param branchId - The branch document ID
 * @returns Branch name or fallback text
 */
export async function getBranchName(branchId: string | null | undefined): Promise<string> {
  if (!branchId) {
    return 'No branch assigned';
  }

  // Check cache first
  const cached = branchCache.get(branchId);
  if (cached) {
    return cached.name;
  }

  // Check if fetch is already in progress
  const existingPromise = fetchPromises.get(branchId);
  if (existingPromise) {
    const branch = await existingPromise;
    return branch.name;
  }

  // Fetch from database
  const fetchPromise = getBranchById(branchId);
  fetchPromises.set(branchId, fetchPromise);

  try {
    const branch = await fetchPromise;
    branchCache.set(branchId, branch);
    fetchPromises.delete(branchId);
    return branch.name;
  } catch (error) {
    console.error(`Failed to fetch branch ${branchId}:`, error);
    fetchPromises.delete(branchId);
    return 'Unknown branch';
  }
}

/**
 * Get full branch data by branchId with caching
 * @param branchId - The branch document ID
 * @returns Branch object or null
 */
export async function getBranchData(branchId: string | null | undefined): Promise<Branch | null> {
  if (!branchId) {
    return null;
  }

  // Check cache first
  const cached = branchCache.get(branchId);
  if (cached) {
    return cached;
  }

  // Check if fetch is already in progress
  const existingPromise = fetchPromises.get(branchId);
  if (existingPromise) {
    return await existingPromise;
  }

  // Fetch from database
  const fetchPromise = getBranchById(branchId);
  fetchPromises.set(branchId, fetchPromise);

  try {
    const branch = await fetchPromise;
    branchCache.set(branchId, branch);
    fetchPromises.delete(branchId);
    return branch;
  } catch (error) {
    console.error(`Failed to fetch branch ${branchId}:`, error);
    fetchPromises.delete(branchId);
    return null;
  }
}

/**
 * Clear branch cache (useful for testing or when branch data changes)
 */
export function clearBranchCache() {
  branchCache.clear();
  fetchPromises.clear();
}

/**
 * Preload branch data into cache
 * @param branch - Branch object to cache
 */
export function cacheBranch(branch: Branch) {
  if (branch.branchId) {
    branchCache.set(branch.branchId, branch);
  }
}
