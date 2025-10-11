/**
 * Seed Development User Script
 *
 * Creates a development user in Firebase for quick testing.
 * This script should only be run in development environments.
 *
 * Usage:
 *   npx ts-node scripts/seed-dev-user.ts
 *
 * Or add to package.json:
 *   "seed:dev": "ts-node scripts/seed-dev-user.ts"
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Development user configuration
const DEV_USER = {
  email: process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL || 'dev@lorenzo.com',
  password: process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD || 'DevPass123!',
  displayName: 'Dev Admin',
  role: 'admin' as const,
  branch: 'main-branch',
};

/**
 * Initialize Firebase Admin
 */
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // Check if service account key is provided
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (error) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        throw error;
      }
    } else {
      // Use default credentials (works in some environments)
      initializeApp();
    }
  }
}

/**
 * Create or update the development user
 */
async function seedDevUser() {
  console.log('🌱 Seeding development user...\n');

  try {
    initializeFirebaseAdmin();

    const auth = getAuth();
    const db = getFirestore();

    // Check if user exists
    let user;
    try {
      user = await auth.getUserByEmail(DEV_USER.email);
      console.log('✓ User already exists:', user.uid);

      // Update password if needed
      await auth.updateUser(user.uid, {
        password: DEV_USER.password,
        displayName: DEV_USER.displayName,
      });
      console.log('✓ Updated user password and display name');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await auth.createUser({
          email: DEV_USER.email,
          password: DEV_USER.password,
          displayName: DEV_USER.displayName,
          emailVerified: true,
        });
        console.log('✓ Created new user:', user.uid);
      } else {
        throw error;
      }
    }

    // Create or update user document in Firestore
    const userRef = db.collection('users').doc(user.uid);
    const userData = {
      email: DEV_USER.email,
      name: DEV_USER.displayName,
      role: DEV_USER.role,
      branchId: DEV_USER.branch,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRef.set(userData, { merge: true });
    console.log('✓ Updated user document in Firestore');

    // Set custom claims for role
    await auth.setCustomUserClaims(user.uid, {
      role: DEV_USER.role,
      branchId: DEV_USER.branch,
    });
    console.log('✓ Set custom user claims');

    console.log('\n✅ Development user seeded successfully!\n');
    console.log('📧 Email:', DEV_USER.email);
    console.log('🔑 Password:', DEV_USER.password);
    console.log('👤 Role:', DEV_USER.role);
    console.log('\n🚀 You can now use the "Dev Quick Login" button on the login page!\n');
  } catch (error) {
    console.error('\n❌ Error seeding development user:', error);
    process.exit(1);
  }
}

// Run the script
seedDevUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
