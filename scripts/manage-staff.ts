/**
 * Staff Account Management Script
 *
 * Command-line tool for managing staff accounts in Firebase.
 * Supports list, add, update, and delete operations.
 * Includes international phone number validation.
 *
 * Usage:
 *   npx tsx scripts/manage-staff.ts list                    # List all staff
 *   npx tsx scripts/manage-staff.ts list --role=front_desk  # Filter by role
 *   npx tsx scripts/manage-staff.ts list --test-only        # Show only test accounts
 *
 *   npx tsx scripts/manage-staff.ts add \
 *     --email="jane@lorenzo.com" \
 *     --name="Jane Doe" \
 *     --phone="+254712345678" \
 *     --role="front_desk" \
 *     --branchId="BR-MAIN-001" \
 *     --password="SecurePass123!"
 *
 *   npx tsx scripts/manage-staff.ts update \
 *     --email="jane@lorenzo.com" \
 *     --new-phone="+254799887766"
 *
 *   npx tsx scripts/manage-staff.ts delete \
 *     --email="jane@lorenzo.com" \
 *     --confirm
 *
 * @module scripts/manage-staff
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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

interface StaffAccount {
  uid: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  branchId?: string;
  active: boolean;
  createdAt: Date;
}

// ============================================
// PHONE VALIDATION
// ============================================

/**
 * Basic phone validation for E.164 format
 * International numbers supported
 */
function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Must start with +
  if (!cleaned.startsWith('+')) {
    return { valid: false, error: 'Phone must start with + (international format)' };
  }

  // Must be followed by digits
  if (!/^\+\d{10,15}$/.test(cleaned)) {
    return { valid: false, error: 'Phone must be +[country code][number] (10-15 digits total)' };
  }

  return { valid: true };
}

/**
 * Normalize phone to E.164 format
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '');
}

// ============================================
// FIREBASE INITIALIZATION
// ============================================

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found.\n' +
          'Please set it in your .env.local file.'
      );
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
      throw error;
    }
  }
}

// ============================================
// STAFF OPERATIONS
// ============================================

/**
 * List all staff accounts with optional filtering
 */
async function listStaff(options: { role?: UserRole; testOnly?: boolean } = {}) {
  const db = getFirestore();
  const snapshot = await db.collection('users').get();

  const staff: StaffAccount[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Filter out customers
    if (data.role === 'customer') continue;

    // Apply role filter
    if (options.role && data.role !== options.role) continue;

    // Apply test-only filter
    if (options.testOnly) {
      const isTest =
        data.email?.includes('@lorenzo.test') || data.email?.includes('@test.com');
      if (!isTest) continue;
    }

    staff.push({
      uid: doc.id,
      email: data.email,
      phone: data.phone,
      name: data.name,
      role: data.role,
      branchId: data.branchId,
      active: data.active ?? true,
      createdAt: data.createdAt?.toDate() || new Date(),
    });
  }

  return staff;
}

/**
 * Add a new staff member
 */
async function addStaff(options: {
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  branchId: string;
  password: string;
}): Promise<string> {
  const auth = getAuth();
  const db = getFirestore();

  // Validate phone format
  const phoneValidation = validatePhoneNumber(options.phone);
  if (!phoneValidation.valid) {
    throw new Error(`Invalid phone number: ${phoneValidation.error}`);
  }

  const normalizedPhone = normalizePhone(options.phone);

  // Check email uniqueness
  try {
    await auth.getUserByEmail(options.email);
    throw new Error(`Email ${options.email} already exists`);
  } catch (error: any) {
    if (error.code !== 'auth/user-not-found') throw error;
  }

  // Check phone uniqueness
  const phoneCheck = await db
    .collection('users')
    .where('phone', '==', normalizedPhone)
    .limit(1)
    .get();

  if (!phoneCheck.empty) {
    throw new Error(`Phone ${normalizedPhone} already exists`);
  }

  // Create Firebase Auth user
  const userRecord = await auth.createUser({
    email: options.email,
    password: options.password,
    displayName: options.name,
    phoneNumber: normalizedPhone,
    emailVerified: true,
  });

  // Set custom claims
  await auth.setCustomUserClaims(userRecord.uid, {
    role: options.role,
    branchId: options.branchId,
  });

  // Create Firestore document
  await db
    .collection('users')
    .doc(userRecord.uid)
    .set({
      uid: userRecord.uid,
      email: options.email,
      phone: normalizedPhone,
      name: options.name,
      role: options.role,
      branchId: options.branchId,
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

  return userRecord.uid;
}

/**
 * Update an existing staff member
 */
async function updateStaff(
  email: string,
  updates: {
    name?: string;
    phone?: string;
    role?: UserRole;
    branchId?: string;
    active?: boolean;
  }
): Promise<void> {
  const auth = getAuth();
  const db = getFirestore();

  // Find user by email
  const userRecord = await auth.getUserByEmail(email);

  // Validate phone if provided
  if (updates.phone) {
    const phoneValidation = validatePhoneNumber(updates.phone);
    if (!phoneValidation.valid) {
      throw new Error(`Invalid phone number: ${phoneValidation.error}`);
    }

    const normalizedPhone = normalizePhone(updates.phone);

    // Check phone uniqueness (exclude current user)
    const phoneCheck = await db
      .collection('users')
      .where('phone', '==', normalizedPhone)
      .limit(2)
      .get();

    const otherUsers = phoneCheck.docs.filter((doc) => doc.id !== userRecord.uid);
    if (otherUsers.length > 0) {
      throw new Error(
        `Phone ${normalizedPhone} is already used by another staff member`
      );
    }

    updates.phone = normalizedPhone;
  }

  // Update Firebase Auth
  const authUpdates: any = {};
  if (updates.name) authUpdates.displayName = updates.name;
  if (updates.phone) authUpdates.phoneNumber = updates.phone;

  if (Object.keys(authUpdates).length > 0) {
    await auth.updateUser(userRecord.uid, authUpdates);
  }

  // Update custom claims if role or branch changed
  if (updates.role || updates.branchId) {
    const currentUser = await auth.getUser(userRecord.uid);
    const currentClaims = currentUser.customClaims || {};

    await auth.setCustomUserClaims(userRecord.uid, {
      ...currentClaims,
      role: updates.role || currentClaims.role,
      branchId: updates.branchId || currentClaims.branchId,
    });
  }

  // Update Firestore
  const firestoreUpdates: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  await db.collection('users').doc(userRecord.uid).update(firestoreUpdates);
}

/**
 * Delete a staff member
 */
async function deleteStaff(email: string, confirm: boolean): Promise<void> {
  if (!confirm) {
    throw new Error('Must specify --confirm to delete staff account');
  }

  const auth = getAuth();
  const db = getFirestore();

  // Find user by email
  const userRecord = await auth.getUserByEmail(email);

  // Delete Firestore document
  await db.collection('users').doc(userRecord.uid).delete();

  // Delete Firebase Auth user
  await auth.deleteUser(userRecord.uid);
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Lorenzo POS - Staff Account Management                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log();

  if (!command || command === 'help') {
    console.log('Usage: npx tsx scripts/manage-staff.ts <command>\n');
    console.log('Commands:');
    console.log('  list                    List all staff accounts');
    console.log('  list --role=<role>      Filter by role');
    console.log('  list --test-only        Show only test accounts');
    console.log();
    console.log('  add --email=<email> --name=<name> --phone=<phone> --role=<role> --branchId=<id> --password=<pass>');
    console.log('    Create a new staff account');
    console.log();
    console.log('  update --email=<email> [--new-phone=<phone>] [--new-role=<role>] [--active=<true|false>]');
    console.log('    Update an existing staff account');
    console.log();
    console.log('  delete --email=<email> --confirm');
    console.log('    Delete a staff account (requires confirmation)');
    console.log();
    console.log('Roles: admin, director, general_manager, store_manager,');
    console.log('       workstation_manager, workstation_staff, front_desk, driver');
    console.log();
    console.log('Phone Format: +[country code][number] (e.g., +254712345678, +12025550123)');
    console.log();
    return;
  }

  // Initialize Firebase Admin
  initializeFirebaseAdmin();

  try {
    switch (command) {
      case 'list': {
        const roleArg = args.find((a) => a.startsWith('--role='));
        const role = roleArg?.split('=')[1] as UserRole | undefined;
        const testOnly = args.includes('--test-only');

        const staff = await listStaff({ role, testOnly });

        if (staff.length === 0) {
          console.log('No staff accounts found matching the criteria.\n');
          return;
        }

        console.log(`Found ${staff.length} staff account(s):\n`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        staff.forEach((s) => {
          console.log(`Email:    ${s.email}`);
          console.log(`Name:     ${s.name}`);
          console.log(`Phone:    ${s.phone}`);
          console.log(`Role:     ${s.role}`);
          console.log(`Branch:   ${s.branchId || 'N/A'}`);
          console.log(`Status:   ${s.active ? 'Active' : 'Inactive'}`);
          console.log(`Created:  ${s.createdAt.toISOString().split('T')[0]}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });

        console.log();
        break;
      }

      case 'add': {
        const getArg = (name: string) => {
          const arg = args.find((a) => a.startsWith(`--${name}=`));
          return arg?.split('=')[1];
        };

        const email = getArg('email');
        const name = getArg('name');
        const phone = getArg('phone');
        const role = getArg('role') as UserRole;
        const branchId = getArg('branchId');
        const password = getArg('password');

        if (!email || !name || !phone || !role || !branchId || !password) {
          console.error(
            '❌ Error: Missing required arguments\n\n' +
              'Required: --email, --name, --phone, --role, --branchId, --password\n'
          );
          process.exit(1);
        }

        console.log('Creating staff account...\n');
        console.log(`Email:    ${email}`);
        console.log(`Name:     ${name}`);
        console.log(`Phone:    ${phone}`);
        console.log(`Role:     ${role}`);
        console.log(`Branch:   ${branchId}`);
        console.log();

        const uid = await addStaff({ email, name, phone, role, branchId, password });

        console.log('✅ Staff account created successfully!\n');
        console.log(`UID: ${uid}`);
        console.log();
        console.log('The staff member can now login with:');
        console.log(`  Email:    ${email}`);
        console.log(`  Password: ${password}`);
        console.log();
        break;
      }

      case 'update': {
        const getArg = (name: string) => {
          const arg = args.find((a) => a.startsWith(`--${name}=`));
          return arg?.split('=')[1];
        };

        const email = getArg('email');
        const newPhone = getArg('new-phone');
        const newRole = getArg('new-role') as UserRole | undefined;
        const newBranch = getArg('new-branch');
        const activeArg = getArg('active');
        const active = activeArg ? activeArg === 'true' : undefined;

        if (!email) {
          console.error('❌ Error: Missing --email argument\n');
          process.exit(1);
        }

        const updates: any = {};
        if (newPhone) updates.phone = newPhone;
        if (newRole) updates.role = newRole;
        if (newBranch) updates.branchId = newBranch;
        if (active !== undefined) updates.active = active;

        if (Object.keys(updates).length === 0) {
          console.error(
            '❌ Error: No updates specified\n\n' +
              'Provide at least one: --new-phone, --new-role, --new-branch, --active\n'
          );
          process.exit(1);
        }

        console.log(`Updating staff account: ${email}\n`);
        console.log('Updates:');
        Object.entries(updates).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        console.log();

        await updateStaff(email, updates);

        console.log('✅ Staff account updated successfully!\n');
        break;
      }

      case 'delete': {
        const emailArg = args.find((a) => a.startsWith('--email='));
        const email = emailArg?.split('=')[1];
        const confirm = args.includes('--confirm');

        if (!email) {
          console.error('❌ Error: Missing --email argument\n');
          process.exit(1);
        }

        if (!confirm) {
          console.error(
            '❌ Error: Must specify --confirm to delete staff account\n\n' +
              'This action is permanent and cannot be undone.\n'
          );
          process.exit(1);
        }

        console.log(`⚠️  WARNING: Deleting staff account: ${email}\n`);
        console.log('This action is permanent and cannot be undone.');
        console.log('Press Ctrl+C now to cancel...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log();

        await deleteStaff(email, confirm);

        console.log('✅ Staff account deleted successfully!\n');
        break;
      }

      default:
        console.error(`❌ Unknown command: ${command}\n`);
        console.log('Run "npx tsx scripts/manage-staff.ts help" for usage information.\n');
        process.exit(1);
    }
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
