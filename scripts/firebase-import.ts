/**
 * Firebase Import Script
 *
 * Imports all Firestore collections and Auth users from JSON export files
 * into the NEW Firebase project.
 *
 * Prerequisites:
 *   1. Run firebase-export.ts first to create the export files
 *   2. New Firebase project must be set up with Firestore and Auth enabled
 *   3. Service account credentials for the new project
 *
 * Usage: npx tsx scripts/firebase-import.ts
 *
 * Input: Reads from ./firebase-export/ directory
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, WriteBatch } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// NEW Firebase service account credentials
// Load from the JSON file provided by user
const serviceAccountPath = path.join(process.cwd(), 'lorenzo-dry-cleaners-7302f-firebase-adminsdk-fbsvc-f2d2378f82.json');
const NEW_SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;

// Initialize Firebase Admin with NEW project credentials
const app = initializeApp({
  credential: cert(NEW_SERVICE_ACCOUNT),
  projectId: 'lorenzo-dry-cleaners-7302f',
}, 'new-firebase');

const db = getFirestore(app);
const auth = getAuth(app);

// Import directory (where export files are located)
const IMPORT_DIR = './firebase-export';

// Collections to import (order matters for dependencies)
const COLLECTIONS = [
  // Core configuration first
  'branches',
  'systemSettings',
  'pricing',
  'templates',

  // Users and customers
  'users',
  'customers',

  // Core business data
  'orders',
  'garments',
  'transactions',

  // Operations
  'deliveries',
  'pickupRequests',
  'transferBatches',
  'workstationProcessing',

  // Supporting data
  'inventory',
  'inventoryAdjustments',
  'attendance',
  'equipment',
  'issues',

  // Feedback and analytics
  'customerFeedback',
  'notifications',
  'orderUpdates',
  'auditLogs',

  // Other
  'permissionRequests',
  'shifts',
  'payroll',
  'loyalty',
  'promotions',
  'analytics',
];

/**
 * Converts serialized Timestamp objects back to Firestore Timestamps
 */
function deserializeDocument(data: any): any {
  if (data === null || data === undefined) return data;

  // Check if this is a serialized Timestamp
  if (
    typeof data === 'object' &&
    data._type === 'Timestamp' &&
    typeof data._seconds === 'number' &&
    typeof data._nanoseconds === 'number'
  ) {
    return new Timestamp(data._seconds, data._nanoseconds);
  }

  if (Array.isArray(data)) {
    return data.map(item => deserializeDocument(item));
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const key of Object.keys(data)) {
      result[key] = deserializeDocument(data[key]);
    }
    return result;
  }

  return data;
}

/**
 * Import a single collection from JSON file
 */
async function importCollection(collectionName: string): Promise<number> {
  const filePath = path.join(IMPORT_DIR, `${collectionName}.json`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚪ ${collectionName}: No export file found`);
    return 0;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const documents = JSON.parse(fileContent);

    if (!Array.isArray(documents) || documents.length === 0) {
      console.log(`  ⚪ ${collectionName}: Empty or invalid file`);
      return 0;
    }

    // Firestore batch write limit is 500 operations
    const BATCH_SIZE = 500;
    let importedCount = 0;

    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch: WriteBatch = db.batch();
      const batchDocs = documents.slice(i, i + BATCH_SIZE);

      for (const doc of batchDocs) {
        const { _id, ...docData } = doc;
        const processedData = deserializeDocument(docData);
        const docRef = db.collection(collectionName).doc(_id);
        batch.set(docRef, processedData);
      }

      await batch.commit();
      importedCount += batchDocs.length;

      // Progress indicator for large collections
      if (documents.length > BATCH_SIZE) {
        const progress = Math.min(100, Math.round((importedCount / documents.length) * 100));
        process.stdout.write(`\r  📥 ${collectionName}: ${importedCount}/${documents.length} (${progress}%)`);
      }
    }

    if (documents.length > BATCH_SIZE) {
      process.stdout.write('\n');
    }

    console.log(`  ✅ ${collectionName}: ${importedCount} documents imported`);
    return importedCount;
  } catch (error: any) {
    console.error(`  ❌ ${collectionName}: Error - ${error.message}`);
    return 0;
  }
}

/**
 * Import Firebase Authentication users with custom claims
 */
async function importAuthUsers(): Promise<{ imported: number; failed: number }> {
  console.log('\n📥 Importing Authentication Users...');

  const filePath = path.join(IMPORT_DIR, 'auth-users.json');

  if (!fs.existsSync(filePath)) {
    console.log('  ⚪ auth-users: No export file found');
    return { imported: 0, failed: 0 };
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const users = JSON.parse(fileContent);

    if (!Array.isArray(users) || users.length === 0) {
      console.log('  ⚪ auth-users: Empty or invalid file');
      return { imported: 0, failed: 0 };
    }

    let imported = 0;
    let failed = 0;
    const failedUsers: string[] = [];

    for (const user of users) {
      try {
        // Create user without password (they'll need to reset)
        const createRequest: any = {
          uid: user.uid, // Preserve original UID for data consistency
          disabled: user.disabled,
          emailVerified: user.emailVerified,
        };

        // Only add optional fields if they exist
        if (user.email) createRequest.email = user.email;
        if (user.phoneNumber) createRequest.phoneNumber = user.phoneNumber;
        if (user.displayName) createRequest.displayName = user.displayName;
        if (user.photoURL) createRequest.photoURL = user.photoURL;

        await auth.createUser(createRequest);

        // Set custom claims if they exist (role, branchId, etc.)
        if (user.customClaims && Object.keys(user.customClaims).length > 0) {
          await auth.setCustomUserClaims(user.uid, user.customClaims);
        }

        imported++;

        // Progress indicator
        if (users.length > 10) {
          const progress = Math.round(((imported + failed) / users.length) * 100);
          process.stdout.write(`\r  📥 auth-users: ${imported + failed}/${users.length} (${progress}%)`);
        }
      } catch (error: any) {
        failed++;
        failedUsers.push(`${user.email || user.phoneNumber || user.uid}: ${error.message}`);
      }
    }

    if (users.length > 10) {
      process.stdout.write('\n');
    }

    console.log(`  ✅ auth-users: ${imported} imported, ${failed} failed`);

    if (failedUsers.length > 0 && failedUsers.length <= 10) {
      console.log('\n  ⚠️  Failed users:');
      failedUsers.forEach(msg => console.log(`     - ${msg}`));
    } else if (failedUsers.length > 10) {
      console.log(`\n  ⚠️  ${failedUsers.length} users failed to import. Check logs for details.`);
      // Write failed users to a log file
      const logPath = path.join(IMPORT_DIR, 'failed-users.log');
      fs.writeFileSync(logPath, failedUsers.join('\n'));
      console.log(`     Failed users logged to: ${logPath}`);
    }

    console.log('\n  ⚠️  IMPORTANT: Users will need to reset their passwords!');
    console.log('     Firebase does not allow password export/import.');
    console.log('     Users can:');
    console.log('       1. Use "Forgot Password" to reset via email');
    console.log('       2. Use Phone OTP login (already supported)');

    return { imported, failed };
  } catch (error: any) {
    console.error(`  ❌ auth-users: Error - ${error.message}`);
    return { imported: 0, failed: 0 };
  }
}

/**
 * Verify import by checking document counts
 */
async function verifyImport(): Promise<void> {
  console.log('\n🔍 Verifying Import...\n');

  let allMatch = true;

  for (const collectionName of COLLECTIONS) {
    const filePath = path.join(IMPORT_DIR, `${collectionName}.json`);

    if (!fs.existsSync(filePath)) continue;

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const exportedDocs = JSON.parse(fileContent);
      const exportedCount = Array.isArray(exportedDocs) ? exportedDocs.length : 0;

      const snapshot = await db.collection(collectionName).count().get();
      const importedCount = snapshot.data().count;

      const match = exportedCount === importedCount;
      const status = match ? '✅' : '⚠️';

      if (!match) allMatch = false;

      console.log(`  ${status} ${collectionName}: Expected ${exportedCount}, Found ${importedCount}`);
    } catch (error: any) {
      console.log(`  ❌ ${collectionName}: Verification failed - ${error.message}`);
      allMatch = false;
    }
  }

  if (allMatch) {
    console.log('\n✅ All collections verified successfully!');
  } else {
    console.log('\n⚠️  Some collections have count mismatches. Please review above.');
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           Firebase Data Import - NEW Project');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nTarget Project: lorenzo-dry-cleaners-7302f`);
  console.log(`Import Directory: ${IMPORT_DIR}`);
  console.log(`Collections to Import: ${COLLECTIONS.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Check if import directory exists
  if (!fs.existsSync(IMPORT_DIR)) {
    console.error(`❌ Import directory not found: ${IMPORT_DIR}`);
    console.error('   Please run the export script first:');
    console.error('   npx tsx scripts/firebase-export.ts');
    process.exit(1);
  }

  // Confirm before proceeding
  console.log('⚠️  WARNING: This will import data into the NEW Firebase project.');
  console.log('   Existing documents with the same IDs will be OVERWRITTEN.\n');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Import Firestore collections
  console.log('📥 Importing Firestore Collections...\n');

  let totalDocuments = 0;
  let importedCollections = 0;

  for (const collection of COLLECTIONS) {
    const count = await importCollection(collection);
    totalDocuments += count;
    if (count > 0) importedCollections++;
  }

  // Import Auth users
  const authResult = await importAuthUsers();

  // Verify import
  await verifyImport();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                     IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  📊 Collections Imported: ${importedCollections}/${COLLECTIONS.length}`);
  console.log(`  📄 Total Documents: ${totalDocuments}`);
  console.log(`  👤 Auth Users Imported: ${authResult.imported}`);
  if (authResult.failed > 0) {
    console.log(`  ⚠️  Auth Users Failed: ${authResult.failed}`);
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n✅ Import complete!');
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Update .env.local with new Firebase credentials');
  console.log('   2. Test the application with the new Firebase project');
  console.log('   3. Notify users about password reset requirement');
  console.log('   4. Delete old Firebase project (after thorough testing)\n');

  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Import failed:', error);
  process.exit(1);
});
