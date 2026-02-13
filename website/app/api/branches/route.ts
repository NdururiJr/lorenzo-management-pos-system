/**
 * Branches API Route
 *
 * Fetches active branches from Firestore for the website
 * This API route acts as a proxy to avoid SSR Firebase connection issues
 *
 * @module api/branches
 */

import { NextResponse } from 'next/server';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

interface Branch {
  branchId: string;
  name: string;
  branchType: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contactPhone: string;
  active: boolean;
}

/**
 * GET /api/branches
 * Get all active branches
 */
export async function GET(request: Request) {
  try {
    // Check if Firebase is initialized
    if (!db) {
      console.error('[API] Firestore not initialized');
      return NextResponse.json(
        { error: 'Database connection unavailable', branches: [] },
        { status: 503 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('id');

    // If specific branch ID requested
    if (branchId) {
      const branchRef = doc(db, 'branches', branchId);
      const branchSnap = await getDoc(branchRef);

      if (!branchSnap.exists()) {
        return NextResponse.json(
          { error: 'Branch not found', branch: null },
          { status: 404 }
        );
      }

      const data = branchSnap.data();
      const branch: Branch = {
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

      return NextResponse.json({ branch });
    }

    // Get all active branches
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

    console.log(`[API] Fetched ${branches.length} active branches`);

    return NextResponse.json({ branches });
  } catch (error) {
    console.error('[API] Error fetching branches:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch branches',
        message: error instanceof Error ? error.message : 'Unknown error',
        branches: [],
      },
      { status: 500 }
    );
  }
}
