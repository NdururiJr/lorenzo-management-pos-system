/**
 * Backfill branchId for transactions
 *
 * This script updates all transactions that are missing branchId by looking up
 * the related order and copying its branchId.
 *
 * Run with: node scripts/backfill-transaction-branchid.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function backfillTransactionBranchIds() {
  console.log('\n🔄 Starting transaction branchId backfill...\n');

  // Get all transactions
  const transactionsRef = collection(db, 'transactions');
  const transactionsSnap = await getDocs(transactionsRef);

  console.log(`Found ${transactionsSnap.size} total transactions\n`);

  let needsBackfill = 0;
  let hasBranchId = 0;
  let errors = 0;
  const toUpdate = [];

  // Check each transaction
  for (const txDoc of transactionsSnap.docs) {
    const data = txDoc.data();

    if (!data.branchId || data.branchId === null) {
      needsBackfill++;

      // Look up the related order to get branchId
      if (data.orderId) {
        try {
          const orderRef = doc(db, 'orders', data.orderId);
          const orderSnap = await getDoc(orderRef);

          if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            if (orderData.branchId) {
              toUpdate.push({
                id: txDoc.id,
                transactionId: data.transactionId,
                orderId: data.orderId,
                branchId: orderData.branchId
              });
              console.log(`✓ ${data.transactionId} → will set branchId to ${orderData.branchId} (from order ${data.orderId})`);
            } else {
              console.log(`⚠️  ${data.transactionId} → order ${data.orderId} also missing branchId`);
              errors++;
            }
          } else {
            console.log(`❌ ${data.transactionId} → order ${data.orderId} not found`);
            errors++;
          }
        } catch (error) {
          console.log(`❌ ${data.transactionId} → Error looking up order: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`❌ ${data.transactionId} → No orderId to lookup`);
        errors++;
      }
    } else {
      hasBranchId++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Transactions with branchId: ${hasBranchId}`);
  console.log(`   Transactions needing backfill: ${needsBackfill}`);
  console.log(`   Transactions ready to update: ${toUpdate.length}`);
  console.log(`   Errors/unable to backfill: ${errors}`);

  if (toUpdate.length === 0) {
    console.log('\n✅ No transactions need backfill. Database is up to date!\n');
    process.exit(0);
  }

  console.log(`\n⚠️  About to update ${toUpdate.length} transactions...`);
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Update transactions with branchId
  let updated = 0;
  let updateErrors = 0;

  for (const tx of toUpdate) {
    try {
      const txRef = doc(db, 'transactions', tx.id);
      await updateDoc(txRef, { branchId: tx.branchId });
      console.log(`✅ Updated: ${tx.transactionId} → branchId: ${tx.branchId}`);
      updated++;
    } catch (error) {
      console.log(`❌ Failed to update ${tx.transactionId}: ${error.message}`);
      updateErrors++;
    }
  }

  console.log(`\n📈 Final Results:`);
  console.log(`   Successfully updated: ${updated}`);
  console.log(`   Update errors: ${updateErrors}`);
  console.log(`   Total errors: ${errors + updateErrors}`);

  if (updated > 0) {
    console.log(`\n✅ Backfill complete! Updated ${updated} transactions.\n`);
  }

  if (errors + updateErrors > 0) {
    console.log(`\n⚠️  ${errors + updateErrors} transactions could not be updated. Please review manually.\n`);
  }

  process.exit(0);
}

backfillTransactionBranchIds().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
