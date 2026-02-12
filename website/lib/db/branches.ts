/**
 * Branch Database Functions
 *
 * Functions for fetching branch data from Firestore (read-only).
 * Used for location pages and branch listings on the website.
 *
 * @module website/lib/db/branches
 */

import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { Branch } from './types';

/**
 * Get all active branches from Firestore
 * @returns Promise with array of active branches
 */
export async function getActiveBranches(): Promise<Branch[]> {
  if (!db) {
    console.warn('Firestore not initialized. Returning empty branches array.');
    return [];
  }

  try {
    const branchesRef = collection(db, 'branches');
    const q = query(branchesRef, where('active', '==', true));
    const snapshot = await getDocs(q);

    const branches: Branch[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      branches.push({
        branchId: doc.id,
        name: data.name,
        branchType: data.branchType,
        location: {
          address: data.location?.address || '',
          coordinates: {
            lat: data.location?.coordinates?.lat || 0,
            lng: data.location?.coordinates?.lng || 0,
          },
        },
        contactPhone: data.contactPhone || '+254728400200',
        active: data.active,
      });
    });

    return branches;
  } catch (error) {
    console.error('Error fetching active branches:', error);
    return [];
  }
}

/**
 * Get a single branch by ID
 * @param branchId - The branch ID to fetch
 * @returns Promise with branch data or null if not found
 */
export async function getBranchById(branchId: string): Promise<Branch | null> {
  if (!db) {
    console.warn('Firestore not initialized. Returning null.');
    return null;
  }

  try {
    const branchRef = doc(db, 'branches', branchId);
    const branchSnap = await getDoc(branchRef);

    if (!branchSnap.exists()) {
      return null;
    }

    const data = branchSnap.data();
    return {
      branchId: branchSnap.id,
      name: data.name,
      branchType: data.branchType,
      location: {
        address: data.location?.address || '',
        coordinates: {
          lat: data.location?.coordinates?.lat || 0,
          lng: data.location?.coordinates?.lng || 0,
        },
      },
      contactPhone: data.contactPhone || '+254728400200',
      active: data.active,
    };
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
  if (!db) {
    console.warn('Firestore not initialized. Returning empty branches array.');
    return [];
  }

  try {
    const branchesRef = collection(db, 'branches');
    const snapshot = await getDocs(branchesRef);

    const branches: Branch[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      branches.push({
        branchId: doc.id,
        name: data.name,
        branchType: data.branchType,
        location: {
          address: data.location?.address || '',
          coordinates: {
            lat: data.location?.coordinates?.lat || 0,
            lng: data.location?.coordinates?.lng || 0,
          },
        },
        contactPhone: data.contactPhone || '+254728400200',
        active: data.active,
      });
    });

    return branches;
  } catch (error) {
    console.error('Error fetching all branches:', error);
    return [];
  }
}
