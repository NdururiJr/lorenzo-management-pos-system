/**
 * Cleanup script to delete orders linked to non-existent or duplicate customers
 * Run this before re-seeding data to keep the database clean
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, query, where } = require('firebase/firestore');

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

async function cleanupOrphanedOrders() {
  console.log('\n🧹 Starting cleanup of orphaned orders...\n');

  // Get all customers
  const customersRef = collection(db, 'customers');
  const customersSnap = await getDocs(customersRef);
  const validCustomerIds = new Set();

  customersSnap.forEach((doc) => {
    const data = doc.data();
    validCustomerIds.add(data.customerId);
    console.log(`✅ Valid customer: ${data.customerId} (${data.email})`);
  });

  console.log(`\nFound ${validCustomerIds.size} valid customers\n`);

  // Get all orders
  const ordersRef = collection(db, 'orders');
  const ordersSnap = await getDocs(ordersRef);

  console.log(`Found ${ordersSnap.size} total orders\n`);

  let orphanedCount = 0;
  let validCount = 0;
  const orphanedOrders = [];

  // Check each order
  ordersSnap.forEach((orderDoc) => {
    const data = orderDoc.data();
    if (!validCustomerIds.has(data.customerId)) {
      orphanedCount++;
      orphanedOrders.push({ id: orderDoc.id, customerId: data.customerId, orderId: data.orderId });
      console.log(`❌ Orphaned: ${data.orderId} -> ${data.customerId}`);
    } else {
      validCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Valid orders: ${validCount}`);
  console.log(`   Orphaned orders: ${orphanedCount}`);

  if (orphanedCount === 0) {
    console.log('\n✅ No orphaned orders found. Database is clean!\n');
    process.exit(0);
  }

  console.log(`\n⚠️  About to delete ${orphanedCount} orphaned orders...`);
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Delete orphaned orders
  for (const order of orphanedOrders) {
    await deleteDoc(doc(db, 'orders', order.id));
    console.log(`🗑️  Deleted: ${order.orderId}`);
  }

  console.log(`\n✅ Cleanup complete! Deleted ${orphanedCount} orphaned orders.\n`);
  process.exit(0);
}

cleanupOrphanedOrders().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
