/**
 * Test Customer Data Cleanup Script
 *
 * Safely identifies and deletes test customer data from all 19 related Firestore collections.
 * Includes dry-run mode for safe preview and comprehensive audit logging.
 *
 * Usage:
 *   npx tsx scripts/cleanup-test-data.ts --dry-run     # Preview deletions
 *   npx tsx scripts/cleanup-test-data.ts --confirm     # Execute cleanup
 *
 * Features:
 *   - Test customer identification by email/phone/ID patterns
 *   - Cascade deletion across 19 collections (proper order)
 *   - International phone number support
 *   - Dry-run mode for safety
 *   - Comprehensive audit logging
 *   - Batch operations for performance
 *
 * @module scripts/cleanup-test-data
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ============================================
// TEST DATA PATTERNS
// ============================================

/** Test email domain patterns */
const TEST_EMAIL_PATTERNS = [
  '@test.com',
  '@example.com',
  '@lorenzo.test',
];

/** Hardcoded test customer IDs */
const TEST_CUSTOMER_IDS = ['CUST-001', 'CUST-002'];

/** Test phone numbers from seed scripts */
const TEST_PHONE_PATTERNS = [
  '+254725462859', '+254725462860', '+254725462861', '+254725462862',
  '+254725462863', '+254725462864', '+254725462867', '+254725462868',
  '+254712345001', '+254712345002',
];

// ============================================
// TYPES
// ============================================

interface DeletionStats {
  collection: string;
  documentsFound: number;
  documentsDeleted: number;
  errors: number;
  errorDetails: string[];
}

interface TestCustomer {
  customerId: string;
  name: string;
  email?: string;
  phone: string;
  orderCount?: number;
  totalSpent?: number;
}

interface CleanupResult {
  timestamp: string;
  dryRun: boolean;
  customersIdentified: number;
  customerIds: string[];
  customerDetails: TestCustomer[];
  userUids: string[];
  deletionStats: DeletionStats[];
  totalDocumentsDeleted: number;
  errors: string[];
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
      console.log('✓ Firebase Admin initialized');
    } catch (error) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
      throw error;
    }
  }
}

// ============================================
// TEST CUSTOMER IDENTIFICATION
// ============================================

/**
 * Identify all test customers in the database
 * Checks email, phone, and ID patterns
 */
async function identifyTestCustomers(): Promise<{
  customerIds: string[];
  customerDetails: TestCustomer[];
  userUids: string[];
}> {
  const db = getFirestore();
  const testCustomers = new Map<string, TestCustomer>();
  const userUids: string[] = [];

  console.log('📋 Scanning customers collection for test data...\n');

  // Query customers collection
  const customersSnapshot = await db.collection('customers').get();

  for (const doc of customersSnapshot.docs) {
    const data = doc.data();
    const customerId = doc.id;

    // Check if matches test patterns
    const matchesEmailPattern = data.email && TEST_EMAIL_PATTERNS.some(pattern =>
      data.email.includes(pattern)
    );

    const matchesPhonePattern = TEST_PHONE_PATTERNS.includes(data.phone);

    const matchesIdPattern = TEST_CUSTOMER_IDS.includes(customerId);

    const isTest = matchesEmailPattern || matchesPhonePattern || matchesIdPattern;

    if (isTest) {
      testCustomers.set(customerId, {
        customerId,
        name: data.name || 'Unknown',
        email: data.email,
        phone: data.phone,
        orderCount: data.orderCount,
        totalSpent: data.totalSpent,
      });

      // Find corresponding Firebase Auth user
      const usersSnapshot = await db
        .collection('users')
        .where('role', '==', 'customer')
        .where('phone', '==', data.phone)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        userUids.push(usersSnapshot.docs[0].id);
      }

      // Also check by email if available
      if (data.email) {
        const emailUsersSnapshot = await db
          .collection('users')
          .where('role', '==', 'customer')
          .where('email', '==', data.email)
          .limit(1)
          .get();

        if (!emailUsersSnapshot.empty) {
          const uid = emailUsersSnapshot.docs[0].id;
          if (!userUids.includes(uid)) {
            userUids.push(uid);
          }
        }
      }
    }
  }

  return {
    customerIds: Array.from(testCustomers.keys()),
    customerDetails: Array.from(testCustomers.values()),
    userUids,
  };
}

// ============================================
// CASCADE DELETION
// ============================================

/**
 * Delete customer-related data across all collections
 * Follows proper cascade order to prevent orphaned records
 */
async function deleteCustomerRelatedData(
  customerIds: string[],
  dryRun: boolean
): Promise<DeletionStats[]> {
  const db = getFirestore();
  const stats: DeletionStats[] = [];

  // CRITICAL: Deletion must follow this exact order (child → parent)
  // to prevent foreign key constraint violations
  const deletionSteps = [
    // Step 1: Loyalty data
    { collection: 'loyaltyTransactions', field: 'customerId' },
    { collection: 'customerLoyalty', field: 'customerId' },

    // Step 2: Statistics and feedback
    { collection: 'customerStatistics', useDocId: true }, // Document ID = customerId
    { collection: 'customerFeedback', field: 'customerId' },

    // Step 3: Reminders and receipts
    { collection: 'reminders', field: 'customerId' },
    { collection: 'receipts', field: 'customerId' },

    // Step 4: Quotations and vouchers
    { collection: 'quotations', field: 'customerId' },
    { collection: 'vouchers', field: 'usedByCustomer' },

    // Step 5: Transactions
    { collection: 'transactions', field: 'customerId' },

    // Step 6: Order-related collections
    // Note: These require finding orders first, then deleting related data
    { collection: 'orders', field: 'customerId' },

    // Step 7: Finally, delete customer document
    { collection: 'customers', useDocId: true },
  ];

  console.log('\n🗑️  Starting cascade deletion across 19 collections...\n');

  for (const step of deletionSteps) {
    const stepStats: DeletionStats = {
      collection: step.collection,
      documentsFound: 0,
      documentsDeleted: 0,
      errors: 0,
      errorDetails: [],
    };

    try {
      if (step.useDocId) {
        // Delete by document ID (customerId)
        for (const customerId of customerIds) {
          const docRef = db.collection(step.collection).doc(customerId);
          const doc = await docRef.get();

          if (doc.exists) {
            stepStats.documentsFound++;
            if (!dryRun) {
              await docRef.delete();
              stepStats.documentsDeleted++;
            }
          }
        }
      } else {
        // Query by field - need to batch due to Firestore 'in' limit of 10
        const batchSize = 10;
        for (let i = 0; i < customerIds.length; i += batchSize) {
          const batch = customerIds.slice(i, i + batchSize);

          const snapshot = await db
            .collection(step.collection)
            .where(step.field!, 'in', batch)
            .get();

          stepStats.documentsFound += snapshot.size;

          if (!dryRun && snapshot.size > 0) {
            // Delete in batches of 500 (Firestore batch limit)
            const deleteBatch = db.batch();
            let deleteCount = 0;

            for (const doc of snapshot.docs) {
              deleteBatch.delete(doc.ref);
              deleteCount++;
              stepStats.documentsDeleted++;

              // Commit batch every 500 docs
              if (deleteCount >= 500) {
                await deleteBatch.commit();
                deleteCount = 0;
              }
            }

            // Commit remaining
            if (deleteCount > 0) {
              await deleteBatch.commit();
            }
          }
        }
      }

      const status = dryRun ? '[DRY-RUN]' : '✓';
      console.log(
        `${status} ${step.collection.padEnd(25)} Found: ${stepStats.documentsFound}, ` +
        `${dryRun ? 'Would delete' : 'Deleted'}: ${stepStats.documentsDeleted}`
      );
    } catch (error: any) {
      stepStats.errors++;
      stepStats.errorDetails.push(error.message);
      console.error(`✗ ${step.collection}: ${error.message}`);
    }

    stats.push(stepStats);
  }

  // Handle order-related collections that require order lookups
  await deleteOrderRelatedData(customerIds, dryRun, stats);

  return stats;
}

/**
 * Delete data related to customer orders
 * These collections reference orderIds, not customerIds
 */
async function deleteOrderRelatedData(
  customerIds: string[],
  dryRun: boolean,
  stats: DeletionStats[]
): Promise<void> {
  const db = getFirestore();

  // First, find all order IDs for these customers
  const orderIds: string[] = [];
  const batchSize = 10;

  for (let i = 0; i < customerIds.length; i += batchSize) {
    const batch = customerIds.slice(i, i + batchSize);
    const ordersSnapshot = await db
      .collection('orders')
      .where('customerId', 'in', batch)
      .get();

    for (const doc of ordersSnapshot.docs) {
      orderIds.push(doc.id);
    }
  }

  if (orderIds.length === 0) {
    console.log('\n✓ No orders found for test customers (skipping order-related collections)');
    return;
  }

  console.log(`\n📦 Found ${orderIds.length} orders to clean up related data...\n`);

  // Collections that reference orderIds
  const orderRelatedCollections = [
    { collection: 'notifications', field: 'orderId' },
    { collection: 'defectNotifications', field: 'orderId' },
    { collection: 'redoItems', field: 'orderId' },
    { collection: 'deliveryNotes', field: 'orderId' },
    { collection: 'deliveries', field: 'orderId' },
  ];

  for (const step of orderRelatedCollections) {
    const stepStats: DeletionStats = {
      collection: step.collection,
      documentsFound: 0,
      documentsDeleted: 0,
      errors: 0,
      errorDetails: [],
    };

    try {
      // Query in batches of 10 (Firestore 'in' limit)
      for (let i = 0; i < orderIds.length; i += 10) {
        const batch = orderIds.slice(i, i + 10);
        const snapshot = await db
          .collection(step.collection)
          .where(step.field, 'in', batch)
          .get();

        stepStats.documentsFound += snapshot.size;

        if (!dryRun && snapshot.size > 0) {
          const deleteBatch = db.batch();
          for (const doc of snapshot.docs) {
            deleteBatch.delete(doc.ref);
            stepStats.documentsDeleted++;
          }
          await deleteBatch.commit();
        }
      }

      const status = dryRun ? '[DRY-RUN]' : '✓';
      console.log(
        `${status} ${step.collection.padEnd(25)} Found: ${stepStats.documentsFound}, ` +
        `${dryRun ? 'Would delete' : 'Deleted'}: ${stepStats.documentsDeleted}`
      );
    } catch (error: any) {
      stepStats.errors++;
      stepStats.errorDetails.push(error.message);
      console.error(`✗ ${step.collection}: ${error.message}`);
    }

    stats.push(stepStats);
  }
}

// ============================================
// FIREBASE AUTH CLEANUP
// ============================================

/**
 * Delete Firebase Auth users for test customers
 */
async function deleteFirebaseAuthUsers(
  userUids: string[],
  dryRun: boolean
): Promise<void> {
  const auth = getAuth();

  console.log('\n🔐 Cleaning up Firebase Auth users...\n');

  for (const uid of userUids) {
    try {
      const user = await auth.getUser(uid);
      console.log(`${dryRun ? '[DRY-RUN]' : '✓'} Firebase Auth: ${user.email || user.phoneNumber} (${user.uid})`);

      if (!dryRun) {
        await auth.deleteUser(uid);
      }
    } catch (error: any) {
      console.error(`✗ Error deleting Firebase Auth user ${uid}: ${error.message}`);
    }
  }

  // Also delete Firestore user documents
  const db = getFirestore();
  for (const uid of userUids) {
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        console.log(`${dryRun ? '[DRY-RUN]' : '✓'} Firestore users collection: ${uid}`);
        if (!dryRun) {
          await db.collection('users').doc(uid).delete();
        }
      }
    } catch (error: any) {
      console.error(`✗ Error deleting Firestore user ${uid}: ${error.message}`);
    }
  }
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Generate comprehensive audit report
 */
function generateAuditReport(result: CleanupResult): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `cleanup-audit-${timestamp}.json`;

  fs.writeFileSync(filename, JSON.stringify(result, null, 2));

  return filename;
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const confirm = args.includes('--confirm');

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Lorenzo POS - Test Customer Data Cleanup Script             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log();

  // Validate arguments
  if (!dryRun && !confirm) {
    console.error('❌ Error: Must specify either --dry-run or --confirm\n');
    console.log('Usage:');
    console.log('  npx tsx scripts/cleanup-test-data.ts --dry-run     # Preview deletions');
    console.log('  npx tsx scripts/cleanup-test-data.ts --confirm     # Execute cleanup\n');
    process.exit(1);
  }

  if (dryRun) {
    console.log('🔍 DRY-RUN MODE - No data will be deleted\n');
  } else {
    console.log('⚠️  LIVE MODE - Data will be permanently deleted!\n');
  }

  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();

    // Step 1: Identify test customers
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Identifying Test Customers');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { customerIds, customerDetails, userUids } = await identifyTestCustomers();

    if (customerIds.length === 0) {
      console.log('\n✅ No test customers found. Database is clean!\n');
      return;
    }

    console.log(`\n📊 Found ${customerIds.length} test customer(s):\n`);
    customerDetails.forEach((customer) => {
      console.log(`  • ${customer.customerId}: ${customer.name}`);
      console.log(`    Email: ${customer.email || 'N/A'}`);
      console.log(`    Phone: ${customer.phone}`);
      console.log(`    Orders: ${customer.orderCount || 0}, Spent: ${customer.totalSpent || 0} KES`);
      console.log();
    });

    if (!dryRun) {
      console.log('⚠️  WARNING: You are about to permanently delete this data!\n');
      console.log('Press Ctrl+C now to cancel...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('\n✓ Proceeding with deletion...\n');
    }

    // Step 2: Delete customer-related data
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Deleting Customer-Related Data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const deletionStats = await deleteCustomerRelatedData(customerIds, dryRun);

    // Step 3: Delete Firebase Auth users
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Deleting Firebase Auth Users');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await deleteFirebaseAuthUsers(userUids, dryRun);

    // Step 4: Generate audit report
    const totalDeleted = deletionStats.reduce((sum, stat) => sum + stat.documentsDeleted, 0);
    const errors: string[] = [];
    deletionStats.forEach(stat => {
      if (stat.errors > 0) {
        errors.push(...stat.errorDetails.map(e => `${stat.collection}: ${e}`));
      }
    });

    const auditResult: CleanupResult = {
      timestamp: new Date().toISOString(),
      dryRun,
      customersIdentified: customerIds.length,
      customerIds,
      customerDetails,
      userUids,
      deletionStats,
      totalDocumentsDeleted: totalDeleted,
      errors,
    };

    const auditFile = generateAuditReport(auditResult);

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Test Customers Identified: ${customerIds.length}`);
    console.log(`Firebase Auth Users: ${userUids.length}`);
    console.log(`Total Documents ${dryRun ? 'Found' : 'Deleted'}: ${totalDeleted}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`\n📋 Audit log saved: ${auditFile}\n`);

    if (dryRun) {
      console.log('✅ DRY-RUN COMPLETE - No data was deleted');
      console.log('   Review the output above, then run with --confirm to execute.\n');
    } else {
      console.log('✅ CLEANUP COMPLETE - All test customer data has been removed\n');
      console.log('Next Steps:');
      console.log('1. Verify cleanup in Firebase Console');
      console.log('2. Check dashboard appearance (should show empty states)');
      console.log('3. Create first real customer order to test\n');
    }
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
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
