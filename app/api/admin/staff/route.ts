/**
 * Staff Management API Route
 *
 * Provides REST API endpoints for managing staff accounts.
 * Only accessible by admin and director roles.
 *
 * Endpoints:
 *   POST   /api/admin/staff       - Create new staff account
 *   GET    /api/admin/staff       - List all staff accounts
 *   PATCH  /api/admin/staff       - Update staff account
 *   DELETE /api/admin/staff       - Not implemented (use scripts for safety)
 *
 * @module app/api/admin/staff
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { validatePhoneNumber } from '@/lib/utils/phone-validator';

// ============================================
// TYPES
// ============================================

type UserRole =
  | 'admin'
  | 'director'
  | 'general_manager'
  | 'store_manager'
  | 'workstation_manager'
  | 'workstation_staff'
  | 'front_desk'
  | 'driver';

interface CreateStaffRequest {
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  branchId: string;
  password: string;
}

interface UpdateStaffRequest {
  uid: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  branchId?: string;
  active?: boolean;
}

// ============================================
// AUTH VERIFICATION
// ============================================

/**
 * Verify that the request is from an admin or director
 */
async function verifyAdminAccess(request: NextRequest): Promise<{ authorized: boolean; userRole?: string; error?: string }> {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return { authorized: false, error: 'No session found' };
    }

    // Verify session
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userRole = decodedClaims.role as string;

    // Check if user is admin or director
    if (userRole !== 'admin' && userRole !== 'director') {
      return { authorized: false, error: 'Insufficient permissions' };
    }

    return { authorized: true, userRole };
  } catch (error: any) {
    return { authorized: false, error: error.message };
  }
}

// ============================================
// POST - CREATE STAFF ACCOUNT
// ============================================

export async function POST(request: NextRequest) {
  // Verify admin access
  const auth = await verifyAdminAccess(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized', details: auth.error },
      { status: 403 }
    );
  }

  try {
    const body: CreateStaffRequest = await request.json();
    const { email, name, phone, role, branchId, password } = body;

    // Validate required fields
    if (!email || !name || !phone || !role || !branchId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number (international support)
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: `Invalid phone number: ${phoneValidation.error}` },
        { status: 400 }
      );
    }

    const normalizedPhone = phoneValidation.e164!;

    // Check email uniqueness
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    } catch (err: any) {
      if (err.code !== 'auth/user-not-found') throw err;
    }

    // Check phone uniqueness
    const phoneCheck = await adminDb
      .collection('users')
      .where('phone', '==', normalizedPhone)
      .limit(1)
      .get();

    if (!phoneCheck.empty) {
      return NextResponse.json(
        { error: 'Phone number already exists' },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: normalizedPhone,
      emailVerified: true,
    });

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role,
      branchId,
    });

    // Create Firestore document
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      phone: normalizedPhone,
      name,
      role,
      branchId,
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message: `Staff account created: ${email}`,
    });
  } catch (error: any) {
    console.error('Error creating staff account:', error);
    return NextResponse.json(
      { error: 'Failed to create staff account', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// GET - LIST STAFF ACCOUNTS
// ============================================

export async function GET(request: NextRequest) {
  // Verify admin access
  const auth = await verifyAdminAccess(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized', details: auth.error },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');

    // Get all users from Firestore
    const snapshot = await adminDb.collection('users').get();

    const staff = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role,
          branchId: data.branchId,
          active: data.active ?? true,
          createdAt: data.createdAt?.toDate().toISOString(),
        };
      })
      .filter((user: any) => {
        // Exclude customers
        if (user.role === 'customer') return false;

        // Apply role filter if provided
        if (roleFilter && user.role !== roleFilter) return false;

        return true;
      });

    return NextResponse.json({ staff });
  } catch (error: any) {
    console.error('Error listing staff:', error);
    return NextResponse.json(
      { error: 'Failed to list staff', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - UPDATE STAFF ACCOUNT
// ============================================

export async function PATCH(request: NextRequest) {
  // Verify admin access
  const auth = await verifyAdminAccess(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized', details: auth.error },
      { status: 403 }
    );
  }

  try {
    const body: UpdateStaffRequest = await request.json();
    const { uid, name, phone, role, branchId, active } = body;

    if (!uid) {
      return NextResponse.json(
        { error: 'Missing uid' },
        { status: 400 }
      );
    }

    // Validate phone if provided
    let normalizedPhone: string | undefined;
    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: `Invalid phone number: ${phoneValidation.error}` },
          { status: 400 }
        );
      }

      normalizedPhone = phoneValidation.e164!;

      // Check phone uniqueness (exclude current user)
      const phoneCheck = await adminDb
        .collection('users')
        .where('phone', '==', normalizedPhone)
        .limit(2)
        .get();

      const otherUsers = phoneCheck.docs.filter((doc) => doc.id !== uid);
      if (otherUsers.length > 0) {
        return NextResponse.json(
          { error: 'Phone number already in use by another staff member' },
          { status: 400 }
        );
      }
    }

    // Update Firebase Auth
    const authUpdates: any = {};
    if (name) authUpdates.displayName = name;
    if (normalizedPhone) authUpdates.phoneNumber = normalizedPhone;

    if (Object.keys(authUpdates).length > 0) {
      await adminAuth.updateUser(uid, authUpdates);
    }

    // Update custom claims if role or branch changed
    if (role || branchId) {
      const currentUser = await adminAuth.getUser(uid);
      const currentClaims = currentUser.customClaims || {};

      await adminAuth.setCustomUserClaims(uid, {
        ...currentClaims,
        role: role || currentClaims.role,
        branchId: branchId || currentClaims.branchId,
      });
    }

    // Update Firestore
    const firestoreUpdates: any = {
      updatedAt: Timestamp.now(),
    };

    if (name) firestoreUpdates.name = name;
    if (normalizedPhone) firestoreUpdates.phone = normalizedPhone;
    if (role) firestoreUpdates.role = role;
    if (branchId) firestoreUpdates.branchId = branchId;
    if (active !== undefined) firestoreUpdates.active = active;

    await adminDb.collection('users').doc(uid).update(firestoreUpdates);

    return NextResponse.json({
      success: true,
      message: 'Staff account updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff account', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - NOT IMPLEMENTED
// ============================================

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Delete operation not available via API',
      message: 'For safety, staff deletion must be done using the manage-staff.ts script',
    },
    { status: 405 }
  );
}
