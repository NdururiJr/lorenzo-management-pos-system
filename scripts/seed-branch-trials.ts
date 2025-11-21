/**
 * Seed Trial Branch Manager Accounts
 *
 * Creates one trial manager account per branch for testing.
 * Email pattern: <slug>@lorenzo.com
 * Password: DevPass123! (or NEXT_PUBLIC_DEV_LOGIN_PASSWORD)
 *
 * Usage: npm run seed:branch-trials
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Default password for trial accounts
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD || 'DevPass123!';

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
        console.log('✓ Firebase Admin initialized with service account\n');
      } catch (error) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        throw error;
      }
    } else {
      // Use default credentials (works in some environments like Cloud Shell)
      try {
        initializeApp();
        console.log('✓ Firebase Admin initialized with default credentials\n');
      } catch (error) {
        console.error('\n❌ Firebase initialization failed!');
        console.error('   Please set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local\n');
        console.error('   To get your service account key:');
        console.error('   1. Go to Firebase Console → Project Settings → Service Accounts');
        console.error('   2. Click "Generate New Private Key"');
        console.error('   3. Add to .env.local as: FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'');
        console.error('   (Entire JSON as a single-line string)\n');
        throw error;
      }
    }
  }
}

/**
 * Slugify branch name for email
 * @param name - Branch name
 * @returns Slugified string
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

interface Branch {
  branchId: string;
  name: string;
  branchType?: string;
  active?: boolean;
}

interface AccountResult {
  email: string;
  branchName: string;
  branchId: string;
  status: 'created' | 'updated' | 'error';
  error?: string;
}

/**
 * Create or update a trial manager account for a branch
 */
async function createTrialAccount(
  auth: ReturnType<typeof getAuth>,
  db: ReturnType<typeof getFirestore>,
  branch: Branch
): Promise<AccountResult> {
  const slug = slugify(branch.name);
  const email = `${slug}@lorenzo.com`;
  const displayName = `Branch Manager - ${branch.name}`;

  try {
    let user;
    let isNew = false;

    // Try to get existing user
    try {
      user = await auth.getUserByEmail(email);
      console.log(`  ↻ User exists: ${email}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await auth.createUser({
          email,
          password: DEFAULT_PASSWORD,
          displayName,
          emailVerified: true,
        });
        isNew = true;
        console.log(`  ✓ Created user: ${email}`);
      } else {
        throw error;
      }
    }

    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      role: 'manager',
      branchId: branch.branchId,
      branchAccess: [],
      isSuperAdmin: false,
    });

    // Create/update user document in Firestore
    await db.collection('users').doc(user.uid).set(
      {
        uid: user.uid,
        email,
        name: displayName,
        role: 'manager',
        branchId: branch.branchId,
        branchAccess: [],
        isSuperAdmin: false,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      email,
      branchName: branch.name,
      branchId: branch.branchId,
      status: isNew ? 'created' : 'updated',
    };
  } catch (error: any) {
    console.error(`  ✗ Error for ${email}:`, error.message);
    return {
      email,
      branchName: branch.name,
      branchId: branch.branchId,
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🔐 Seeding Trial Branch Manager Accounts\n');
  console.log(`📍 Password: ${DEFAULT_PASSWORD}\n`);

  try {
    // Initialize Firebase
    initializeFirebaseAdmin();

    const auth = getAuth();
    const db = getFirestore();

    // Fetch all branches
    const branchesSnapshot = await db.collection('branches').get();

    if (branchesSnapshot.empty) {
      console.log('⚠️  No branches found in database');
      console.log('   Run branch seeding script first or create branches manually\n');
      process.exit(0);
    }

    const branches: Branch[] = [];
    branchesSnapshot.forEach((doc) => {
      const data = doc.data();
      branches.push({
        branchId: doc.id,
        name: data.name,
        branchType: data.branchType,
        active: data.active,
      });
    });

    console.log(`📦 Found ${branches.length} branches\n`);

    // Create accounts for each branch
    const results: AccountResult[] = [];

    for (const branch of branches) {
      console.log(`Processing: ${branch.name}`);
      const result = await createTrialAccount(auth, db, branch);
      results.push(result);
    }

    // Display results table
    console.log('\n\n📊 Results Summary\n');
    console.log('═'.repeat(100));
    console.log(
      '| Email'.padEnd(40) +
      '| Branch Name'.padEnd(30) +
      '| Status'.padEnd(15) +
      '| Branch ID'.padEnd(15) +
      '|'
    );
    console.log('═'.repeat(100));

    for (const result of results) {
      const statusIcon = result.status === 'created' ? '✓' : result.status === 'updated' ? '↻' : '✗';
      const statusText = `${statusIcon} ${result.status.toUpperCase()}`;

      console.log(
        `| ${result.email.padEnd(38)}` +
        `| ${result.branchName.substring(0, 28).padEnd(28)}` +
        `| ${statusText.padEnd(13)}` +
        `| ${result.branchId.substring(0, 13).padEnd(13)}` +
        `|`
      );

      if (result.error) {
        console.log(`|   Error: ${result.error}`.padEnd(99) + '|');
      }
    }

    console.log('═'.repeat(100));

    // Summary statistics
    const created = results.filter((r) => r.status === 'created').length;
    const updated = results.filter((r) => r.status === 'updated').length;
    const errors = results.filter((r) => r.status === 'error').length;

    console.log('\n📈 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors:  ${errors}`);
    console.log(`   Total:   ${results.length}\n`);

    // Login instructions
    console.log('🔑 Login Instructions:');
    console.log(`   Password for all accounts: ${DEFAULT_PASSWORD}`);
    if (results.length > 0) {
      console.log(`   Example: ${results[0].email} / ${DEFAULT_PASSWORD}\n`);
    }

    console.log('✅ Seeding complete!\n');
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as seedBranchTrials };
