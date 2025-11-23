/**
 * Seed Test Accounts Script
 *
 * Creates all test accounts for manual testing based on MANUAL_TESTING_GUIDE.md
 * This script creates users, customers, and sample data for testing.
 *
 * Usage:
 *   npx ts-node scripts/seed-test-accounts.ts
 *
 * Or add to package.json:
 *   "seed:test": "ts-node scripts/seed-test-accounts.ts"
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Test password for all accounts
const TEST_PASSWORD = 'Test@1234';

// Test branches (must exist before seeding users)
const TEST_BRANCHES = {
  mainBranch: {
    branchId: 'BR-MAIN-001',
    name: 'Kilimani Main Store',
    branchType: 'main',
    location: {
      address: 'Argwings Kodhek Road, Kilimani, Nairobi',
      coordinates: {
        lat: -1.2921,
        lng: 36.7872,
      },
    },
    contactPhone: '+254725462859',
    active: true,
    driverAvailability: 3,
  },
};

// Test user accounts (staff)
const TEST_USERS = [
  {
    email: 'admin@lorenzo.test',
    phone: '+254725462859',
    password: TEST_PASSWORD,
    name: 'John Admin',
    role: 'admin',
    branchId: 'BR-MAIN-001',
  },
  {
    email: 'director@lorenzo.test',
    phone: '+254725462860',
    password: TEST_PASSWORD,
    name: 'Sarah Director',
    role: 'director',
    branchId: 'BR-MAIN-001',
  },
  {
    email: 'gm@lorenzo.test',
    phone: '+254725462861',
    password: TEST_PASSWORD,
    name: 'Michael Manager',
    role: 'general_manager',
    branchId: 'BR-MAIN-001',
  },
  {
    email: 'sm.main@lorenzo.test',
    phone: '+254725462862',
    password: TEST_PASSWORD,
    name: 'Alice Store Manager',
    role: 'store_manager',
    branchId: 'BR-MAIN-001',
  },
  {
    email: 'wm@lorenzo.test',
    phone: '+254725462863',
    password: TEST_PASSWORD,
    name: 'Bob Workstation Manager',
    role: 'workstation_manager',
    branchId: 'BR-MAIN-001',
  },
  {
    email: 'ws1@lorenzo.test',
    phone: '+254725462864',
    password: TEST_PASSWORD,
    name: 'Carol Washing Staff',
    role: 'workstation_staff',
    branchId: 'BR-MAIN-001',
  },
  {
    email: 'frontdesk@lorenzo.test',
    phone: '+254725462867',
    password: TEST_PASSWORD,
    name: 'Frank Front Desk',
    role: 'front_desk',
    branchId: 'BR-MAIN-001',
  },
  {
    email: 'driver1@lorenzo.test',
    phone: '+254725462868',
    password: TEST_PASSWORD,
    name: 'George Driver',
    role: 'driver',
    branchId: 'BR-MAIN-001',
  },
];

// Test customer accounts
const TEST_CUSTOMERS = [
  {
    customerId: 'CUST-001',
    name: 'Jane Customer',
    phone: '+254712345001',
    email: 'customer1@test.com',
    password: TEST_PASSWORD,
    addresses: [
      {
        label: 'Home',
        address: 'Lavington Green, Nairobi',
        coordinates: {
          lat: -1.2804,
          lng: 36.7664,
        },
      },
      {
        label: 'Office',
        address: 'Westlands Office Park, Nairobi',
        coordinates: {
          lat: -1.2656,
          lng: 36.8088,
        },
      },
    ],
    preferences: {
      notifications: true,
      language: 'en',
    },
    orderCount: 5,
    totalSpent: 12500,
  },
  {
    customerId: 'CUST-002',
    name: 'Mark Customer',
    phone: '+254712345002',
    email: 'customer2@test.com',
    password: TEST_PASSWORD,
    addresses: [
      {
        label: 'Home',
        address: 'Karen Hardy Estate, Nairobi',
        coordinates: {
          lat: -1.3186,
          lng: 36.7014,
        },
      },
    ],
    preferences: {
      notifications: true,
      language: 'en',
    },
    orderCount: 2,
    totalSpent: 5000,
  },
];

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
      } catch (error) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        throw error;
      }
    } else {
      // Use default credentials
      initializeApp();
    }
  }
}

/**
 * Seed branches
 */
async function seedBranches(db: FirebaseFirestore.Firestore) {
  console.log('\n📍 Seeding branches...');

  const branchRef = db.collection('branches').doc(TEST_BRANCHES.mainBranch.branchId);
  await branchRef.set({
    ...TEST_BRANCHES.mainBranch,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true });

  console.log(`✓ Created/Updated branch: ${TEST_BRANCHES.mainBranch.name}`);
}

/**
 * Seed staff user accounts
 */
async function seedUsers(auth: any, db: FirebaseFirestore.Firestore) {
  console.log('\n👥 Seeding staff accounts...');

  for (const userData of TEST_USERS) {
    try {
      let user;

      // Check if user exists
      try {
        user = await auth.getUserByEmail(userData.email);
        console.log(`✓ User exists: ${userData.email}`);

        // Update password
        await auth.updateUser(user.uid, {
          password: userData.password,
          displayName: userData.name,
          phoneNumber: userData.phone,
        });
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          user = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.name,
            phoneNumber: userData.phone,
            emailVerified: true,
          });
          console.log(`✓ Created user: ${userData.email}`);
        } else {
          throw error;
        }
      }

      // Create/update user document in Firestore
      const userRef = db.collection('users').doc(user.uid);
      await userRef.set({
        uid: user.uid,
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        role: userData.role,
        branchId: userData.branchId,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      // Set custom claims
      await auth.setCustomUserClaims(user.uid, {
        role: userData.role,
        branchId: userData.branchId,
      });

      console.log(`  - Role: ${userData.role}`);
      console.log(`  - Branch: ${userData.branchId}`);
    } catch (error) {
      console.error(`❌ Error seeding user ${userData.email}:`, error);
    }
  }
}

/**
 * Seed customer accounts
 */
async function seedCustomers(auth: any, db: FirebaseFirestore.Firestore) {
  console.log('\n🛍️  Seeding customer accounts...');

  for (const customerData of TEST_CUSTOMERS) {
    try {
      let user;

      // Check if user exists by email
      try {
        user = await auth.getUserByEmail(customerData.email);
        console.log(`✓ Customer exists: ${customerData.email}`);

        // Update password
        await auth.updateUser(user.uid, {
          password: customerData.password,
          displayName: customerData.name,
          phoneNumber: customerData.phone,
        });
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          user = await auth.createUser({
            email: customerData.email,
            password: customerData.password,
            displayName: customerData.name,
            phoneNumber: customerData.phone,
            emailVerified: true,
          });
          console.log(`✓ Created customer: ${customerData.email}`);
        } else {
          throw error;
        }
      }

      // Create/update user document in Firestore (for auth)
      const userRef = db.collection('users').doc(user.uid);
      await userRef.set({
        uid: user.uid,
        email: customerData.email,
        phone: customerData.phone,
        name: customerData.name,
        role: 'customer',
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      // Set custom claims
      await auth.setCustomUserClaims(user.uid, {
        role: 'customer',
      });

      // Create/update customer document in Firestore (for orders)
      const customerRef = db.collection('customers').doc(customerData.customerId);
      await customerRef.set({
        customerId: customerData.customerId,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        addresses: customerData.addresses,
        preferences: customerData.preferences,
        orderCount: customerData.orderCount,
        totalSpent: customerData.totalSpent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      console.log(`  - Customer ID: ${customerData.customerId}`);
      console.log(`  - Order Count: ${customerData.orderCount}`);
      console.log(`  - Total Spent: ${customerData.totalSpent} KES`);
    } catch (error) {
      console.error(`❌ Error seeding customer ${customerData.email}:`, error);
    }
  }
}

/**
 * Main seeding function
 */
async function seedTestAccounts() {
  console.log('🌱 Seeding test accounts for manual testing...\n');
  console.log('📖 Based on: MANUAL_TESTING_GUIDE.md\n');

  try {
    initializeFirebaseAdmin();

    const auth = getAuth();
    const db = getFirestore();

    // Seed in order
    await seedBranches(db);
    await seedUsers(auth, db);
    await seedCustomers(auth, db);

    console.log('\n✅ All test accounts seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 STAFF ACCOUNTS (All use password: Test@1234)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    TEST_USERS.forEach(user => {
      console.log(`  📧 ${user.email.padEnd(30)} | ${user.role.padEnd(20)} | ${user.name}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛍️  CUSTOMER ACCOUNTS (All use password: Test@1234)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    TEST_CUSTOMERS.forEach(customer => {
      console.log(`  📧 ${customer.email.padEnd(30)} | ${customer.phone} | ${customer.name}`);
      console.log(`     Orders: ${customer.orderCount}, Spent: ${customer.totalSpent} KES`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 DEFAULT PASSWORD FOR ALL ACCOUNTS: Test@1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n💡 Next Steps:');
    console.log('   1. Share MANUAL_TESTING_GUIDE.md with your QA team');
    console.log('   2. Manual testers can now login with these accounts');
    console.log('   3. All accounts use the same password: Test@1234\n');
  } catch (error) {
    console.error('\n❌ Error seeding test accounts:', error);
    process.exit(1);
  }
}

// Run the script
seedTestAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
