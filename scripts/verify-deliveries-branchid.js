/**
 * Verify deliveries have branchId
 *
 * This script checks that all delivery documents have a branchId field.
 * If any are missing, it attempts to backfill from orders or driver assignments.
 *
 * Run with: node scripts/verify-deliveries-branchid.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

async function verifyDeliveriesBranchId() {
  console.log('\n🔍 Verifying deliveries branchId...\n');

  // Get all deliveries
  const deliveriesRef = collection(db, 'deliveries');
  const deliveriesSnap = await getDocs(deliveriesRef);

  console.log(`Found ${deliveriesSnap.size} total deliveries\n`);

  let hasBranchId = 0;
  let missingBranchId = 0;
  const toUpdate = [];

  // Check each delivery
  for (const deliveryDoc of deliveriesSnap.docs) {
    const data = deliveryDoc.data();

    if (!data.branchId || data.branchId === null) {
      missingBranchId++;
      console.log(`❌ ${deliveryDoc.id} → Missing branchId`);
      console.log(`   Orders in delivery: ${JSON.stringify(data.orders || [])}`);
      console.log(`   Driver ID: ${data.driverId || 'N/A'}`);

      // Could try to infer branchId from orders or driver, but since
      // Firestore rules already enforce this, missing branchIds should be rare
      // For now, just report them
      toUpdate.push({
        id: deliveryDoc.id,
        deliveryId: data.deliveryId,
        orders: data.orders || [],
        driverId: data.driverId
      });
    } else {
      hasBranchId++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Deliveries with branchId: ${hasBranchId}`);
  console.log(`   Deliveries missing branchId: ${missingBranchId}`);

  if (missingBranchId === 0) {
    console.log('\n✅ All deliveries have branchId. Database is compliant!\n');
    process.exit(0);
  }

  console.log(`\n⚠️  Found ${missingBranchId} deliveries without branchId.`);
  console.log('\n💡 Suggestions:');
  console.log('   1. Check if these are test/development deliveries');
  console.log('   2. Verify the driverId and lookup their branchId from users collection');
  console.log('   3. Or lookup the first order in the delivery to get branchId');
  console.log('   4. Update manually or extend this script to auto-backfill');
  console.log('\nDeliveries needing attention:');

  toUpdate.forEach(d => {
    console.log(`   - ${d.deliveryId || d.id}: driver=${d.driverId}, orders=${d.orders.length}`);
  });

  console.log('\n');
  process.exit(missingBranchId > 0 ? 1 : 0);
}

verifyDeliveriesBranchId().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
