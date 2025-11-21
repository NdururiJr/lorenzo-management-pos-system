/**
 * Backfill Deliveries BranchId Script
 *
 * Adds branchId field to existing delivery documents by looking up
 * the branchId from the first order in each delivery.
 *
 * Usage: npm run backfill:deliveries-branchid
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Initialize Firebase Admin
 */
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
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
      try {
        initializeApp();
        console.log('✓ Firebase Admin initialized with default credentials\n');
      } catch (error) {
        console.error('\n❌ Firebase initialization failed!');
        console.error('   Please set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local\n');
        throw error;
      }
    }
  }
}

interface DeliveryDoc {
  deliveryId: string;
  orders: string[];
  branchId?: string;
}

interface OrderDoc {
  orderId: string;
  branchId: string;
}

interface BackfillResult {
  deliveryId: string;
  status: 'success' | 'error' | 'skipped';
  branchId?: string;
  error?: string;
}

/**
 * Backfill branchId for a single delivery
 */
async function backfillDeliveryBranchId(
  db: FirebaseFirestore.Firestore,
  delivery: DeliveryDoc
): Promise<BackfillResult> {
  try {
    // Check if branchId already exists
    if (delivery.branchId) {
      return {
        deliveryId: delivery.deliveryId,
        status: 'skipped',
        branchId: delivery.branchId,
      };
    }

    // Check if delivery has orders
    if (!delivery.orders || delivery.orders.length === 0) {
      return {
        deliveryId: delivery.deliveryId,
        status: 'error',
        error: 'No orders in delivery',
      };
    }

    // Get the first order to extract branchId
    const firstOrderId = delivery.orders[0];
    const orderDoc = await db.collection('orders').doc(firstOrderId).get();

    if (!orderDoc.exists) {
      return {
        deliveryId: delivery.deliveryId,
        status: 'error',
        error: `Order ${firstOrderId} not found`,
      };
    }

    const orderData = orderDoc.data() as OrderDoc;

    if (!orderData.branchId) {
      return {
        deliveryId: delivery.deliveryId,
        status: 'error',
        error: `Order ${firstOrderId} has no branchId`,
      };
    }

    // Update delivery document with branchId
    await db.collection('deliveries').doc(delivery.deliveryId).update({
      branchId: orderData.branchId,
    });

    return {
      deliveryId: delivery.deliveryId,
      status: 'success',
      branchId: orderData.branchId,
    };
  } catch (error: any) {
    return {
      deliveryId: delivery.deliveryId,
      status: 'error',
      error: error.message,
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🔄 Backfilling Deliveries BranchId\n');

  try {
    // Initialize Firebase
    initializeFirebaseAdmin();
    const db = getFirestore();

    // Fetch all deliveries
    const deliveriesSnapshot = await db.collection('deliveries').get();

    if (deliveriesSnapshot.empty) {
      console.log('⚠️  No deliveries found in database');
      console.log('   Nothing to backfill\n');
      process.exit(0);
    }

    console.log(`📦 Found ${deliveriesSnapshot.size} deliveries\n`);

    // Process each delivery
    const results: BackfillResult[] = [];

    for (const doc of deliveriesSnapshot.docs) {
      const delivery = {
        deliveryId: doc.id,
        ...doc.data(),
      } as DeliveryDoc;

      console.log(`Processing: ${delivery.deliveryId}`);
      const result = await backfillDeliveryBranchId(db, delivery);
      results.push(result);

      if (result.status === 'success') {
        console.log(`  ✓ Added branchId: ${result.branchId}`);
      } else if (result.status === 'skipped') {
        console.log(`  ↻ Already has branchId: ${result.branchId}`);
      } else {
        console.log(`  ✗ Error: ${result.error}`);
      }
    }

    // Display results table
    console.log('\n\n📊 Results Summary\n');
    console.log('═'.repeat(100));
    console.log(
      '| Delivery ID'.padEnd(30) +
      '| Status'.padEnd(15) +
      '| Branch ID'.padEnd(30) +
      '| Error'.padEnd(26) +
      '|'
    );
    console.log('═'.repeat(100));

    for (const result of results) {
      const statusIcon = result.status === 'success' ? '✓' : result.status === 'skipped' ? '↻' : '✗';
      const statusText = `${statusIcon} ${result.status.toUpperCase()}`;

      console.log(
        `| ${result.deliveryId.substring(0, 28).padEnd(28)}` +
        `| ${statusText.padEnd(13)}` +
        `| ${(result.branchId || '-').substring(0, 28).padEnd(28)}` +
        `| ${(result.error || '-').substring(0, 24).padEnd(24)}` +
        `|`
      );
    }

    console.log('═'.repeat(100));

    // Summary statistics
    const success = results.filter((r) => r.status === 'success').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    console.log('\n📈 Summary:');
    console.log(`   Success: ${success}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors:  ${errors}`);
    console.log(`   Total:   ${results.length}\n`);

    if (errors > 0) {
      console.log('⚠️  Some deliveries failed to backfill. Review errors above.\n');
    } else {
      console.log('✅ Backfill complete!\n');
    }
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

export { main as backfillDeliveriesBranchId };
