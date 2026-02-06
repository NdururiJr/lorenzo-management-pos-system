/**
 * Seed Script for Milestone 2
 *
 * Seeds the database with test data for:
 * - Customers
 * - Pricing
 * - Orders
 * - Transactions
 *
 * Usage: npm run seed:milestone2
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
    process.exit(1);
  }
  const serviceAccount = JSON.parse(serviceAccountKey);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * Seed customers
 */
async function seedCustomers() {
  console.log('Seeding customers...');

  const customers = [
    {
      customerId: 'CUST-TEST-001',
      name: 'John Kamau',
      phone: '+254712345678',
      email: 'john.kamau@example.com',
      addresses: [
        {
          id: 'ADDR-001',
          label: 'Home',
          address: 'Kilimani, Nairobi',
          coordinates: { lat: -1.2921, lng: 36.7867 },
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 0,
      totalSpent: 0,
      createdAt: admin.firestore.Timestamp.now(),
    },
    {
      customerId: 'CUST-TEST-002',
      name: 'Mary Wanjiku',
      phone: '+254723456789',
      email: 'mary.wanjiku@example.com',
      addresses: [
        {
          id: 'ADDR-002',
          label: 'Office',
          address: 'Westlands, Nairobi',
          coordinates: { lat: -1.2667, lng: 36.8078 },
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 0,
      totalSpent: 0,
      createdAt: admin.firestore.Timestamp.now(),
    },
    {
      customerId: 'CUST-TEST-003',
      name: 'Peter Ochieng',
      phone: '+254734567890',
      email: 'peter.ochieng@example.com',
      addresses: [
        {
          id: 'ADDR-003',
          label: 'Home',
          address: 'Lavington, Nairobi',
          coordinates: { lat: -1.2833, lng: 36.7667 },
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 0,
      totalSpent: 0,
      createdAt: admin.firestore.Timestamp.now(),
    },
    {
      customerId: 'CUST-TEST-004',
      name: 'Jane Akinyi',
      phone: '+254745678901',
      email: 'jane.akinyi@example.com',
      addresses: [
        {
          id: 'ADDR-004',
          label: 'Home',
          address: 'Parklands, Nairobi',
          coordinates: { lat: -1.2667, lng: 36.8167 },
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 0,
      totalSpent: 0,
      createdAt: admin.firestore.Timestamp.now(),
    },
    {
      customerId: 'CUST-TEST-005',
      name: 'David Kimani',
      phone: '+254756789012',
      email: 'david.kimani@example.com',
      addresses: [
        {
          id: 'ADDR-005',
          label: 'Office',
          address: 'Upper Hill, Nairobi',
          coordinates: { lat: -1.2921, lng: 36.8219 },
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 0,
      totalSpent: 0,
      createdAt: admin.firestore.Timestamp.now(),
    },
  ];

  const batch = db.batch();
  for (const customer of customers) {
    const ref = db.collection('customers').doc(customer.customerId);
    batch.set(ref, customer);
  }
  await batch.commit();

  console.log(`✓ Seeded ${customers.length} customers`);
}

/**
 * Seed pricing for MAIN branch
 */
async function seedPricing() {
  console.log('Seeding pricing...');

  const pricingData = [
    {
      pricingId: 'PRICE-MAIN-SHIRT',
      branchId: 'MAIN',
      garmentType: 'Shirt',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 50,
      },
      active: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      pricingId: 'PRICE-MAIN-PANTS',
      branchId: 'MAIN',
      garmentType: 'Pants',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 50,
      },
      active: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      pricingId: 'PRICE-MAIN-DRESS',
      branchId: 'MAIN',
      garmentType: 'Dress',
      services: {
        wash: 200,
        dryClean: 350,
        iron: 80,
        starch: 40,
        express: 50,
      },
      active: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      pricingId: 'PRICE-MAIN-SUIT',
      branchId: 'MAIN',
      garmentType: 'Suit',
      services: {
        wash: 300,
        dryClean: 500,
        iron: 100,
        starch: 50,
        express: 50,
      },
      active: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      pricingId: 'PRICE-MAIN-BLAZER',
      branchId: 'MAIN',
      garmentType: 'Blazer',
      services: {
        wash: 250,
        dryClean: 400,
        iron: 80,
        starch: 40,
        express: 50,
      },
      active: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      pricingId: 'PRICE-MAIN-JEANS',
      branchId: 'MAIN',
      garmentType: 'Jeans',
      services: {
        wash: 150,
        dryClean: 250,
        iron: 50,
        starch: 30,
        express: 50,
      },
      active: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  const batch = db.batch();
  for (const pricing of pricingData) {
    const ref = db.collection('pricing').doc(pricing.pricingId);
    batch.set(ref, pricing);
  }
  await batch.commit();

  console.log(`✓ Seeded ${pricingData.length} pricing entries`);
}

/**
 * Seed sample orders
 */
async function seedOrders() {
  console.log('Seeding orders...');

  const now = admin.firestore.Timestamp.now();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const twoDaysLater = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const orders = [
    {
      orderId: 'ORD-MAIN-20251015-0001',
      customerId: 'CUST-TEST-001',
      customerName: 'John Kamau',
      customerPhone: '+254712345678',
      branchId: 'MAIN',
      status: 'received',
      garments: [
        {
          garmentId: 'ORD-MAIN-20251015-0001-G01',
          type: 'Shirt',
          color: 'White',
          brand: 'Arrow',
          services: ['wash', 'iron', 'starch'],
          price: 230,
          status: 'received',
        },
        {
          garmentId: 'ORD-MAIN-20251015-0001-G02',
          type: 'Pants',
          color: 'Black',
          services: ['dryClean', 'iron'],
          price: 300,
          status: 'received',
        },
      ],
      totalAmount: 530,
      paidAmount: 530,
      paymentStatus: 'paid',
      paymentMethod: 'mpesa',
      estimatedCompletion: admin.firestore.Timestamp.fromDate(twoDaysLater),
      createdAt: now,
      updatedAt: now,
      createdBy: 'test-admin',
      statusHistory: [
        {
          status: 'received',
          timestamp: now,
          updatedBy: 'test-admin',
        },
      ],
    },
    {
      orderId: 'ORD-MAIN-20251015-0002',
      customerId: 'CUST-TEST-002',
      customerName: 'Mary Wanjiku',
      customerPhone: '+254723456789',
      branchId: 'MAIN',
      status: 'washing',
      garments: [
        {
          garmentId: 'ORD-MAIN-20251015-0002-G01',
          type: 'Dress',
          color: 'Blue',
          services: ['dryClean', 'iron'],
          price: 430,
          status: 'washing',
        },
      ],
      totalAmount: 430,
      paidAmount: 200,
      paymentStatus: 'partial',
      paymentMethod: 'mpesa',
      estimatedCompletion: admin.firestore.Timestamp.fromDate(tomorrow),
      createdAt: now,
      updatedAt: now,
      createdBy: 'test-admin',
      statusHistory: [
        {
          status: 'received',
          timestamp: now,
          updatedBy: 'test-admin',
        },
        {
          status: 'washing',
          timestamp: now,
          updatedBy: 'test-admin',
        },
      ],
    },
    {
      orderId: 'ORD-MAIN-20251015-0003',
      customerId: 'CUST-TEST-003',
      customerName: 'Peter Ochieng',
      customerPhone: '+254734567890',
      branchId: 'MAIN',
      status: 'queued_for_delivery',
      garments: [
        {
          garmentId: 'ORD-MAIN-20251015-0003-G01',
          type: 'Suit',
          color: 'Navy Blue',
          brand: 'Hugo Boss',
          services: ['dryClean', 'iron'],
          price: 600,
          status: 'queued_for_delivery',
        },
        {
          garmentId: 'ORD-MAIN-20251015-0003-G02',
          type: 'Shirt',
          color: 'Light Blue',
          services: ['wash', 'iron', 'starch'],
          price: 230,
          status: 'queued_for_delivery',
        },
      ],
      totalAmount: 830,
      paidAmount: 0,
      paymentStatus: 'pending',
      estimatedCompletion: admin.firestore.Timestamp.fromDate(tomorrow),
      createdAt: now,
      updatedAt: now,
      createdBy: 'test-admin',
      statusHistory: [
        {
          status: 'received',
          timestamp: now,
          updatedBy: 'test-admin',
        },
        {
          status: 'queued_for_delivery',
          timestamp: now,
          updatedBy: 'test-admin',
        },
      ],
    },
    {
      orderId: 'ORD-MAIN-20251015-0004',
      customerId: 'CUST-TEST-004',
      customerName: 'Jane Akinyi',
      customerPhone: '+254745678901',
      branchId: 'MAIN',
      status: 'ironing',
      garments: [
        {
          garmentId: 'ORD-MAIN-20251015-0004-G01',
          type: 'Blazer',
          color: 'Charcoal',
          services: ['dryClean', 'iron'],
          price: 480,
          status: 'ironing',
        },
        {
          garmentId: 'ORD-MAIN-20251015-0004-G02',
          type: 'Jeans',
          color: 'Denim Blue',
          services: ['wash', 'iron'],
          price: 200,
          status: 'ironing',
        },
      ],
      totalAmount: 680,
      paidAmount: 680,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      estimatedCompletion: admin.firestore.Timestamp.fromDate(twoDaysLater),
      createdAt: now,
      updatedAt: now,
      createdBy: 'test-admin',
      statusHistory: [
        {
          status: 'received',
          timestamp: now,
          updatedBy: 'test-admin',
        },
        {
          status: 'ironing',
          timestamp: now,
          updatedBy: 'test-admin',
        },
      ],
    },
    {
      orderId: 'ORD-MAIN-20251015-0005',
      customerId: 'CUST-TEST-005',
      customerName: 'David Kimani',
      customerPhone: '+254756789012',
      branchId: 'MAIN',
      status: 'queued',
      garments: [
        {
          garmentId: 'ORD-MAIN-20251015-0005-G01',
          type: 'Shirt',
          color: 'White',
          services: ['wash', 'iron'],
          price: 200,
          status: 'queued',
        },
        {
          garmentId: 'ORD-MAIN-20251015-0005-G02',
          type: 'Shirt',
          color: 'Pink',
          services: ['wash', 'iron'],
          price: 200,
          status: 'queued',
        },
        {
          garmentId: 'ORD-MAIN-20251015-0005-G03',
          type: 'Pants',
          color: 'Gray',
          services: ['dryClean', 'iron'],
          price: 300,
          status: 'queued',
        },
      ],
      totalAmount: 700,
      paidAmount: 350,
      paymentStatus: 'partial',
      paymentMethod: 'mpesa',
      estimatedCompletion: admin.firestore.Timestamp.fromDate(twoDaysLater),
      createdAt: now,
      updatedAt: now,
      createdBy: 'test-admin',
      statusHistory: [
        {
          status: 'received',
          timestamp: now,
          updatedBy: 'test-admin',
        },
        {
          status: 'queued',
          timestamp: now,
          updatedBy: 'test-admin',
        },
      ],
    },
  ];

  const batch = db.batch();
  for (const order of orders) {
    const ref = db.collection('orders').doc(order.orderId);
    batch.set(ref, order);
  }
  await batch.commit();

  console.log(`✓ Seeded ${orders.length} orders`);
}

/**
 * Seed transactions
 */
async function seedTransactions() {
  console.log('Seeding transactions...');

  const now = admin.firestore.Timestamp.now();

  const transactions = [
    {
      transactionId: 'TXN-TEST-001',
      orderId: 'ORD-MAIN-20251015-0001',
      customerId: 'CUST-TEST-001',
      amount: 530,
      method: 'mpesa',
      status: 'completed',
      timestamp: now,
      processedBy: 'test-admin',
    },
    {
      transactionId: 'TXN-TEST-002',
      orderId: 'ORD-MAIN-20251015-0002',
      customerId: 'CUST-TEST-002',
      amount: 200,
      method: 'mpesa',
      status: 'completed',
      pesapalRef: 'MPESA-TEST-123',
      timestamp: now,
      processedBy: 'test-admin',
      metadata: {
        mpesaTransactionCode: 'QGH12345ABC',
      },
    },
    {
      transactionId: 'TXN-TEST-003',
      orderId: 'ORD-MAIN-20251015-0004',
      customerId: 'CUST-TEST-004',
      amount: 680,
      method: 'card',
      status: 'completed',
      pesapalRef: 'CARD-TEST-456',
      timestamp: now,
      processedBy: 'test-admin',
      metadata: {
        cardLast4: '4242',
      },
    },
    {
      transactionId: 'TXN-TEST-004',
      orderId: 'ORD-MAIN-20251015-0005',
      customerId: 'CUST-TEST-005',
      amount: 350,
      method: 'mpesa',
      status: 'completed',
      timestamp: now,
      processedBy: 'test-admin',
    },
  ];

  const batch = db.batch();
  for (const transaction of transactions) {
    const ref = db.collection('transactions').doc(transaction.transactionId);
    batch.set(ref, transaction);
  }
  await batch.commit();

  console.log(`✓ Seeded ${transactions.length} transactions`);
}

/**
 * Update customer stats based on orders
 */
async function updateCustomerStats() {
  console.log('Updating customer stats...');

  const customerUpdates = [
    { customerId: 'CUST-TEST-001', orderCount: 1, totalSpent: 530 },
    { customerId: 'CUST-TEST-002', orderCount: 1, totalSpent: 430 },
    { customerId: 'CUST-TEST-003', orderCount: 1, totalSpent: 830 },
    { customerId: 'CUST-TEST-004', orderCount: 1, totalSpent: 680 },
    { customerId: 'CUST-TEST-005', orderCount: 1, totalSpent: 700 },
  ];

  const batch = db.batch();
  for (const update of customerUpdates) {
    const ref = db.collection('customers').doc(update.customerId);
    batch.update(ref, {
      orderCount: update.orderCount,
      totalSpent: update.totalSpent,
    });
  }
  await batch.commit();

  console.log(`✓ Updated ${customerUpdates.length} customer stats`);
}

/**
 * Main seeding function
 */
async function seed() {
  try {
    console.log('🌱 Starting Milestone 2 seed...\n');

    await seedCustomers();
    await seedPricing();
    await seedOrders();
    await seedTransactions();
    await updateCustomerStats();

    console.log('\n✅ Milestone 2 seed completed successfully!');
    console.log('\nYou can now:');
    console.log('- View customers in the dashboard');
    console.log('- Create new orders in the POS');
    console.log('- View orders in the pipeline');
    console.log('- Process payments');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seed();
