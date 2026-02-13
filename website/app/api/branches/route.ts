/**
 * Branches API Route
 *
 * Fetches active branches from Firestore for the website
 * This API route acts as a proxy to avoid SSR Firebase connection issues
 *
 * @module api/branches
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

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
    // Firebase Admin SDK is initialized automatically

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('id');
    const includeInactive = searchParams.get('all') === 'true';

    // If specific branch ID requested
    if (branchId) {
      const branchRef = adminDb.collection('branches').doc(branchId);
      const branchSnap = await branchRef.get();

      if (!branchSnap.exists) {
        return NextResponse.json(
          { error: 'Branch not found', branch: null },
          { status: 404 }
        );
      }

      const data = branchSnap.data();
      if (!data) {
        return NextResponse.json(
          { error: 'Branch data unavailable', branch: null },
          { status: 404 }
        );
      }

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

    // Get branches (active only or all based on query param)
    const branchesRef = adminDb.collection('branches');
    const q = includeInactive
      ? branchesRef
      : branchesRef.where('active', '==', true);
    const snapshot = await q.get();

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
