/**
 * Seed Test Orders Script
 *
 * Generates test customers and orders for development/testing.
 * Run this script to populate the database with realistic test data.
 *
 * Usage: npx tsx scripts/seed-test-orders.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp, doc, setDoc } from 'firebase/firestore';
import  { setDocument } from '../lib/db/index.js';

// Firebase config (from environment or hardcoded for script)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data constants
const BRANCH_ID = 'WESTLANDS';

const TEST_CUSTOMERS = [
  {
    name: 'Rachel Wangare',
    phone: '+254712345001',
    email: 'rachel.wangare@example.com',
  },
  {
    name: 'Kelvin Kamau',
    phone: '+254723456002',
    email: 'kelvin.kamau@example.com',
  },
  {
    name: 'Rose Reeves Wangechi',
    phone: '+254734567003',
    email: 'rose.wangechi@example.com',
  },
  {
    name: 'David Mwangi',
    phone: '+254745678004',
    email: 'david.mwangi@example.com',
  },
  {
    name: 'Grace Njeri',
    phone: '+254756789005',
    email: 'grace.njeri@example.com',
  },
  {
    name: 'Peter Omondi',
    phone: '+254767890006',
    email: 'peter.omondi@example.com',
  },
  {
    name: 'Faith Akinyi',
    phone: '+254778901007',
    email: 'faith.akinyi@example.com',
  },
  {
    name: 'Michael Kipchoge',
    phone: '+254789012008',
    email: 'michael.kipchoge@example.com',
  },
  {
    name: 'Esther Wambui',
    phone: '+254790123009',
    email: 'esther.wambui@example.com',
  },
  {
    name: 'James Mutua',
    phone: '+254701234010',
    email: 'james.mutua@example.com',
  },
];

const GARMENT_TYPES = [
  'Shirt',
  'Pants',
  'Dress',
  'Suit',
  'Jacket',
  'Skirt',
  'Blouse',
  'Coat',
  'Trousers',
  'Blazer',
];

const COLORS = [
  'White',
  'Black',
  'Blue',
  'Navy',
  'Gray',
  'Brown',
  'Beige',
  'Red',
  'Green',
  'Pink',
];

const SERVICES_OPTIONS = [
  { name: 'Wash', price: 150 },
  { name: 'Dry Clean', price: 250 },
  { name: 'Iron', price: 50 },
  { name: 'Starch', price: 30 },
  { name: 'Express', price: 100 },
];

const ORDER_STATUSES = [
  'received',
  'queued',
  'washing',
  'drying',
  'ironing',
  'quality_check',
  'packaging',
  'ready',
  'out_for_delivery',
] as const;

const PAYMENT_METHODS = ['cash', 'mpesa', 'card', 'credit'] as const;

/**
 * Generate a random selection from an array
 */
function randomSelect<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random services for a garment
 */
function generateRandomServices(): { services: string[]; price: number } {
  const numServices = Math.floor(Math.random() * 3) + 1; // 1-3 services
  const selectedServices: typeof SERVICES_OPTIONS = [];
  let totalPrice = 0;

  // Always include one main service (Wash or Dry Clean)
  const mainService = Math.random() > 0.5 ? SERVICES_OPTIONS[0] : SERVICES_OPTIONS[1];
  selectedServices.push(mainService);
  totalPrice += mainService.price;

  // Add additional services randomly
  for (let i = 0; i < numServices - 1; i++) {
    const service = randomSelect(SERVICES_OPTIONS.slice(2)); // Iron, Starch, or Express
    if (!selectedServices.includes(service)) {
      selectedServices.push(service);
      totalPrice += service.price;
    }
  }

  return {
    services: selectedServices.map((s) => s.name),
    price: totalPrice,
  };
}

/**
 * Generate a customer ID
 * Note: Simple alphanumeric format for Firestore
 */
function generateCustomerId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CUST${timestamp}${random}`;
}

/**
 * Generate an order ID
 * Note: Firestore document IDs must not contain forward slashes
 * Using simple alphanumeric format
 */
function generateOrderId(sequence: number): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const sequenceStr = String(sequence).padStart(4, '0');
  return `${BRANCH_ID}${dateStr}${sequenceStr}`;
}

/**
 * Generate a garment ID
 * Note: Simple alphanumeric format
 */
function generateGarmentId(orderId: string, index: number): string {
  const indexStr = String(index + 1).padStart(2, '0');
  return `${orderId}G${indexStr}`;
}

/**
 * Create a test customer
 */
async function createCustomer(customerData: typeof TEST_CUSTOMERS[0]) {
  const customerId = generateCustomerId();

  const customer = {
    customerId,
    name: customerData.name,
    phone: customerData.phone,
    email: customerData.email,
    addresses: [],
    preferences: {
      notifications: true,
      language: 'en' as const,
    },
    createdAt: Timestamp.now(),
    orderCount: 0,
    totalSpent: 0,
  };

  // Use the customerId as the document ID directly
  const customerRef = doc(db, 'customers', customerId);
  await setDoc(customerRef, customer);
  console.log(`✓ Created customer: ${customer.name} (${customerId})`);

  return customer;
}

/**
 * Create a test order
 */
async function createOrder(
  customer: Awaited<ReturnType<typeof createCustomer>>,
  orderNumber: number,
  userId: string
) {
  const orderId = generateOrderId(orderNumber);

  // Generate 2-5 garments
  const numGarments = Math.floor(Math.random() * 4) + 2;
  const garments = [];
  let totalAmount = 0;

  for (let i = 0; i < numGarments; i++) {
    const { services, price } = generateRandomServices();
    const garment = {
      garmentId: generateGarmentId(orderId, i),
      type: randomSelect(GARMENT_TYPES),
      color: randomSelect(COLORS),
      services,
      price,
      status: 'received',
    };
    garments.push(garment);
    totalAmount += price;
  }

  // Random payment status
  const paymentStatus = Math.random() > 0.3 ? 'paid' : Math.random() > 0.5 ? 'partial' : 'pending';
  const paidAmount = paymentStatus === 'paid'
    ? totalAmount
    : paymentStatus === 'partial'
    ? Math.floor(totalAmount * 0.5)
    : 0;

  // Random status from the pipeline
  const status = randomSelect([...ORDER_STATUSES]);

  // Random creation time in the last 7 days
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const createdAt = Timestamp.fromDate(
    new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000)
  );

  // Estimated completion: 48 hours from creation
  const estimatedCompletion = Timestamp.fromDate(
    new Date(createdAt.toMillis() + 48 * 60 * 60 * 1000)
  );

  const order = {
    orderId,
    customerId: customer.customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    branchId: BRANCH_ID,
    status,
    garments,
    totalAmount,
    paidAmount,
    paymentStatus: paymentStatus as 'paid' | 'partial' | 'pending',
    paymentMethod: paidAmount > 0 ? randomSelect(PAYMENT_METHODS) : undefined,
    estimatedCompletion,
    createdAt,
    createdBy: userId,
    statusHistory: [
      {
        status: 'received' as const,
        timestamp: createdAt,
        updatedBy: userId,
      },
      ...(status !== 'received' ? [{
        status,
        timestamp: Timestamp.fromDate(new Date(createdAt.toMillis() + 60 * 60 * 1000)),
        updatedBy: userId,
      }] : []),
    ],
    updatedAt: Timestamp.now(),
  };

  // Use the orderId as the document ID directly
  const orderRef = doc(db, 'orders', orderId);
  await setDoc(orderRef, order);
  console.log(`✓ Created order: ${orderId} - Status: ${status} - Amount: KES ${totalAmount}`);

  return order;
}

/**
 * Main seed function
 */
async function seedTestData() {
  console.log('\n🌱 Starting seed process...\n');
  console.log(`Branch: ${BRANCH_ID}`);
  console.log(`Customers to create: ${TEST_CUSTOMERS.length}`);
  console.log(`Orders to create: 20\n`);

  try {
    // Create a dummy user ID for orders
    const testUserId = 'seed-script-user';

    // Create customers
    console.log('📋 Creating customers...');
    const customers = [];
    for (const customerData of TEST_CUSTOMERS) {
      const customer = await createCustomer(customerData);
      customers.push(customer);
    }

    console.log(`\n✓ Created ${customers.length} customers\n`);

    // Create orders (20 total, distributed across customers)
    console.log('📦 Creating orders...');
    const ordersPerCustomer = Math.ceil(20 / customers.length);
    let orderNumber = 1;

    for (let i = 0; i < 20; i++) {
      const customer = customers[i % customers.length];
      await createOrder(customer, orderNumber, testUserId);
      orderNumber++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n✓ Created 20 orders\n`);
    console.log('✅ Seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   - ${customers.length} customers created`);
    console.log(`   - 20 orders created`);
    console.log(`   - Orders distributed across all pipeline stages`);
    console.log(`   - Payment statuses: paid, partial, and pending`);
    console.log(`\n🎉 You can now view the orders in the Pipeline page!\n`);

  } catch (error) {
    console.error('\n❌ Error during seed:', error);
    throw error;
  }
}

// Run the seed
seedTestData()
  .then(() => {
    console.log('Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
