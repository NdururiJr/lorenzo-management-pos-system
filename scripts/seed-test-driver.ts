/**
 * Seed Test Driver Script
 *
 * Creates a test driver account with sample delivery batches and orders
 * for testing the driver interface.
 *
 * Usage:
 *   npx ts-node scripts/seed-test-driver.ts
 *
 * Test Driver Credentials:
 *   Email: driver@lorenzo.com
 *   Password: Driver@123
 *   Role: driver
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Test driver configuration
const TEST_DRIVER = {
  email: 'driver@lorenzo.com',
  password: 'Driver@123',
  displayName: 'John Mwangi',
  role: 'driver' as const,
  phone: '+254712345678',
  branchId: 'main-branch',
};

// Sample customers with realistic Nairobi addresses
const SAMPLE_CUSTOMERS = [
  {
    id: 'CUST-TEST-001',
    name: 'Sarah Wanjiru',
    phone: '+254722111222',
    email: 'sarah.w@example.com',
    address: 'Riverside Drive, Westlands, Nairobi',
    coordinates: { lat: -1.2686, lng: 36.8086 },
  },
  {
    id: 'CUST-TEST-002',
    name: 'David Kamau',
    phone: '+254733444555',
    email: 'david.k@example.com',
    address: 'Wood Avenue, Kilimani, Nairobi',
    coordinates: { lat: -1.2899, lng: 36.7836 },
  },
  {
    id: 'CUST-TEST-003',
    name: 'Grace Achieng',
    phone: '+254744666777',
    email: 'grace.a@example.com',
    address: 'Karen Road, Karen, Nairobi',
    coordinates: { lat: -1.3196, lng: 36.7073 },
  },
  {
    id: 'CUST-TEST-004',
    name: 'James Omondi',
    phone: '+254755888999',
    email: 'james.o@example.com',
    address: 'Ngong Road, Kilimani, Nairobi',
    coordinates: { lat: -1.2949, lng: 36.7813 },
  },
  {
    id: 'CUST-TEST-005',
    name: 'Mary Njeri',
    phone: '+254766000111',
    email: 'mary.n@example.com',
    address: 'Dennis Pritt Road, Kilimani, Nairobi',
    coordinates: { lat: -1.2908, lng: 36.7864 },
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
      initializeApp();
    }
  }
}

/**
 * Create or update test driver user
 */
async function createDriverUser(auth: any, db: any): Promise<string> {
  console.log('👤 Creating test driver user...');

  let user;
  try {
    user = await auth.getUserByEmail(TEST_DRIVER.email);
    console.log('  ✓ Driver user already exists:', user.uid);

    await auth.updateUser(user.uid, {
      password: TEST_DRIVER.password,
      displayName: TEST_DRIVER.displayName,
    });
    console.log('  ✓ Updated password');
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      user = await auth.createUser({
        email: TEST_DRIVER.email,
        password: TEST_DRIVER.password,
        displayName: TEST_DRIVER.displayName,
        emailVerified: true,
      });
      console.log('  ✓ Created new driver user:', user.uid);
    } else {
      throw error;
    }
  }

  // Create user document in Firestore
  await db.collection('users').doc(user.uid).set({
    email: TEST_DRIVER.email,
    name: TEST_DRIVER.displayName,
    role: TEST_DRIVER.role,
    phone: TEST_DRIVER.phone,
    branchId: TEST_DRIVER.branchId,
    active: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true });
  console.log('  ✓ Created user document in Firestore');

  // Set custom claims
  await auth.setCustomUserClaims(user.uid, {
    role: TEST_DRIVER.role,
    branchId: TEST_DRIVER.branchId,
  });
  console.log('  ✓ Set custom user claims');

  return user.uid;
}

/**
 * Create sample customers
 */
async function createSampleCustomers(db: any) {
  console.log('\n👥 Creating sample customers...');

  for (const customer of SAMPLE_CUSTOMERS) {
    await db.collection('customers').doc(customer.id).set({
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      addresses: [
        {
          label: 'Home',
          address: customer.address,
          coordinates: customer.coordinates,
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 0,
      totalSpent: 0,
      createdAt: Timestamp.now(),
    }, { merge: true });
  }

  console.log(`  ✓ Created ${SAMPLE_CUSTOMERS.length} customers`);
}

/**
 * Create sample orders
 */
async function createSampleOrders(db: any, deliveryId: string, customerIds: string[], status: string) {
  const orders: string[] = [];

  for (const customerId of customerIds) {
    const customer = SAMPLE_CUSTOMERS.find(c => c.id === customerId)!;
    const orderNum = Math.floor(Math.random() * 9000) + 1000;
    const orderId = `ORD-MAIN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${orderNum}`;

    const garments = [
      { type: 'Suit', service: 'Dry Clean', price: 800, color: 'Navy Blue' },
      { type: 'Shirt', service: 'Wash & Iron', price: 150, color: 'White' },
      { type: 'Trousers', service: 'Dry Clean', price: 400, color: 'Grey' },
    ];

    const totalAmount = garments.reduce((sum, g) => sum + g.price, 0);

    // Build order data object
    const orderData: any = {
      orderId,
      customerId: customer.id,
      customerName: customer.name,
      phoneNumber: customer.phone,
      branchId: 'main-branch',
      status: status === 'completed' ? 'delivered' : status === 'in_progress' ? 'out_for_delivery' : 'ready',
      deliveryId,
      collectionMethod: 'pickup_required', // Customer requests pickup
      returnMethod: 'delivery_required', // Will be delivered back
      pickupAddress: 'Lorenzo Dry Cleaners, Kilimani, Nairobi',
      deliveryAddress: {
        label: 'Home',
        address: customer.address,
        coordinates: customer.coordinates,
      },
      items: garments,
      garments: garments.map((g, idx) => ({
        garmentId: `${orderId}-G${(idx + 1).toString().padStart(2, '0')}`,
        type: g.type,
        color: g.color,
        services: [g.service],
        price: g.price,
        status: status === 'completed' ? 'delivered' : 'ready',
      })),
      totalAmount,
      paidAmount: totalAmount,
      paymentStatus: 'paid',
      paymentMethod: 'mpesa',
      deliveryStatus: status === 'completed' ? 'delivered' : 'pending',
      createdAt: Timestamp.now(),
      createdBy: 'admin-test',
      estimatedCompletion: Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ),
    };

    // Only add deliveryInstructions if needed (Firestore doesn't accept undefined)
    if (orderNum % 2 === 0) {
      orderData.deliveryInstructions = 'Call before arrival';
    }

    await db.collection('orders').doc(orderId).set(orderData);

    orders.push(orderId);
  }

  return orders;
}

/**
 * Create sample delivery batches
 */
async function createDeliveryBatches(db: any, driverId: string) {
  console.log('\n🚚 Creating sample delivery batches...');

  // 1. Pending Delivery (scheduled for today)
  const pendingOrders = await createSampleOrders(
    db,
    'DEL-PENDING-001',
    ['CUST-TEST-001', 'CUST-TEST-002', 'CUST-TEST-003'],
    'pending'
  );

  await db.collection('deliveries').doc('DEL-PENDING-001').set({
    deliveryId: 'DEL-PENDING-001',
    driverId,
    orders: pendingOrders,
    status: 'pending',
    scheduledDate: Timestamp.now(),
    notes: 'Morning delivery batch',
    route: {
      distance: 8500, // meters
      estimatedDuration: 1200, // seconds (20 minutes)
      stops: SAMPLE_CUSTOMERS.slice(0, 3).map((c, idx) => ({
        id: c.id,
        orderId: pendingOrders[idx],
        address: c.address,
        coordinates: c.coordinates,
        customerName: c.name,
        sequence: idx + 1,
        status: 'pending',
      })),
    },
    createdAt: Timestamp.now(),
  });
  console.log('  ✓ Created pending delivery (DEL-PENDING-001)');

  // 2. In Progress Delivery
  const inProgressOrders = await createSampleOrders(
    db,
    'DEL-PROGRESS-001',
    ['CUST-TEST-004', 'CUST-TEST-005'],
    'in_progress'
  );

  await db.collection('deliveries').doc('DEL-PROGRESS-001').set({
    deliveryId: 'DEL-PROGRESS-001',
    driverId,
    orders: inProgressOrders,
    status: 'in_progress',
    scheduledDate: Timestamp.now(),
    startTime: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)), // Started 30 mins ago
    notes: 'Afternoon delivery batch',
    route: {
      distance: 5200,
      estimatedDuration: 900,
      stops: SAMPLE_CUSTOMERS.slice(3, 5).map((c, idx) => ({
        id: c.id,
        orderId: inProgressOrders[idx],
        address: c.address,
        coordinates: c.coordinates,
        customerName: c.name,
        sequence: idx + 1,
        status: idx === 0 ? 'completed' : 'pending',
      })),
    },
    createdAt: Timestamp.now(),
  });
  console.log('  ✓ Created in-progress delivery (DEL-PROGRESS-001)');

  // Update first order in in-progress delivery to delivered
  await db.collection('orders').doc(inProgressOrders[0]).update({
    deliveryStatus: 'delivered',
    deliveredAt: Timestamp.now(),
    status: 'delivered',
  });

  // 3. Completed Delivery
  const completedOrders = await createSampleOrders(
    db,
    'DEL-COMPLETE-001',
    ['CUST-TEST-001', 'CUST-TEST-002'],
    'completed'
  );

  await db.collection('deliveries').doc('DEL-COMPLETE-001').set({
    deliveryId: 'DEL-COMPLETE-001',
    driverId,
    orders: completedOrders,
    status: 'completed',
    scheduledDate: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Yesterday
    startTime: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    endTime: Timestamp.fromDate(new Date(Date.now() - 23 * 60 * 60 * 1000)), // Completed 1 hour later
    notes: 'All deliveries completed successfully',
    route: {
      distance: 6300,
      estimatedDuration: 1080,
      stops: SAMPLE_CUSTOMERS.slice(0, 2).map((c, idx) => ({
        id: c.id,
        orderId: completedOrders[idx],
        address: c.address,
        coordinates: c.coordinates,
        customerName: c.name,
        sequence: idx + 1,
        status: 'completed',
      })),
    },
    createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
  });
  console.log('  ✓ Created completed delivery (DEL-COMPLETE-001)');

  console.log(`\n  📦 Total: 3 deliveries with ${pendingOrders.length + inProgressOrders.length + completedOrders.length} orders`);
}

/**
 * Main seed function
 */
async function seedTestDriver() {
  console.log('🌱 Seeding test driver account with sample data...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    initializeFirebaseAdmin();

    const auth = getAuth();
    const db = getFirestore();

    // Create driver user
    const driverId = await createDriverUser(auth, db);

    // Create sample customers
    await createSampleCustomers(db);

    // Create delivery batches with orders
    await createDeliveryBatches(db, driverId);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test driver seeded successfully!\n');
    console.log('📧 Email:    driver@lorenzo.com');
    console.log('🔑 Password: Driver@123');
    console.log('👤 Role:     driver');
    console.log('📱 Phone:    +254712345678\n');
    console.log('📊 Sample Data Created:');
    console.log('   • 5 test customers');
    console.log('   • 7 test orders');
    console.log('   • 3 delivery batches:');
    console.log('     - 1 Pending (3 orders)');
    console.log('     - 1 In Progress (2 orders, 1 delivered)');
    console.log('     - 1 Completed (2 orders)\n');
    console.log('🚀 Next Steps:');
    console.log('   1. Navigate to: http://localhost:3000/login');
    console.log('   2. Login with driver credentials above');
    console.log('   3. View dashboard at: /drivers');
    console.log('   4. Test delivery workflows!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('\n❌ Error seeding test driver:', error);
    process.exit(1);
  }
}

// Run the script
seedTestDriver()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
