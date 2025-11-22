/**
 * Quick script to check orders in Firestore
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');

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

async function checkOrders() {
  console.log('\n🔍 Checking Firestore data...\n');

  // Check customers
  console.log('📋 CUSTOMERS:');
  const customersRef = collection(db, 'customers');
  const customersSnap = await getDocs(customersRef);
  console.log(`Total customers: ${customersSnap.size}`);

  customersSnap.forEach((doc) => {
    const data = doc.data();
    console.log(`  - ${data.customerId} | ${data.name} | ${data.email}`);
  });

  // Check orders
  console.log('\n📦 ORDERS:');
  const ordersRef = collection(db, 'orders');
  const ordersSnap = await getDocs(ordersRef);
  console.log(`Total orders: ${ordersSnap.size}`);

  if (ordersSnap.size > 0) {
    console.log('\nFirst 5 orders:');
    ordersSnap.docs.slice(0, 5).forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.orderId} | Customer: ${data.customerId} | Status: ${data.status}`);
    });
  }

  // Check orders for specific customer
  const targetCustomerId = 'CUST1763815885782607';
  console.log(`\n🎯 Orders for customer ${targetCustomerId}:`);
  const customerOrdersQuery = query(
    ordersRef,
    where('customerId', '==', targetCustomerId)
  );
  const customerOrdersSnap = await getDocs(customerOrdersQuery);
  console.log(`Found ${customerOrdersSnap.size} orders for this customer`);

  customerOrdersSnap.forEach((doc) => {
    const data = doc.data();
    console.log(`  - ${data.orderId} | Status: ${data.status} | Amount: ${data.totalAmount}`);
  });

  console.log('\n✅ Check complete!\n');
  process.exit(0);
}

checkOrders().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
