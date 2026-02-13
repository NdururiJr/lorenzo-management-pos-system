/**
 * Branch Database Functions
 *
 * Functions for fetching branch data via API routes (avoids SSR Firebase issues).
 * Used for location pages and branch listings on the website.
 *
 * @module website/lib/db/branches
 */

import type { Branch } from './types';

/**
 * Get the base API URL based on environment
 */
function getApiBaseUrl(): string {
  // In production, use the production URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // In Vercel preview deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost for development
  return 'http://localhost:3001';
}

/**
 * Get all active branches from API
 * @returns Promise with array of active branches
 */
export async function getActiveBranches(): Promise<Branch[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/branches`, {
      cache: 'no-store', // Always get fresh data for SSR
    });

    if (!response.ok) {
      console.error(`Failed to fetch branches: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.branches || [];
  } catch (error) {
    console.error('Error fetching active branches:', error);
    return [];
  }
}

/**
 * Get a single branch by ID from API
 * @param branchId - The branch ID to fetch
 * @returns Promise with branch data or null if not found
 */
export async function getBranchById(branchId: string): Promise<Branch | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/branches?id=${branchId}`, {
      cache: 'no-store', // Always get fresh data for SSR
    });

    if (!response.ok) {
      console.error(`Failed to fetch branch ${branchId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.branch || null;
  } catch (error) {
    console.error(`Error fetching branch ${branchId}:`, error);
    return null;
  }
}

/**
 * Get all branches (including inactive ones) for admin purposes
 * @returns Promise with array of all branches
 */
export async function getAllBranches(): Promise<Branch[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/branches?all=true`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch all branches: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.branches || [];
  } catch (error) {
    console.error('Error fetching all branches:', error);
    return [];
  }
}
