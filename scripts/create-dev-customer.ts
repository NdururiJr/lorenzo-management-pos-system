/**
 * Create Dev Customer Account with Test Orders
 *
 * This script creates a test customer account and sample orders
 * for development and testing purposes.
 *
 * Usage: npx tsx scripts/create-dev-customer.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp();
}

const auth = getAuth();
const db = getFirestore();

// Dev customer credentials
const DEV_CUSTOMER = {
  phone: '+254712000001',
  email: 'customer@lorenzo-dev.com',
  password: 'DevCustomer123!',
  name: 'Dev Customer',
};

// Sample orders data
const SAMPLE_ORDERS = [
  {
    garments: [
      {
        type: 'Shirt',
        color: 'White',
        brand: 'Tommy Hilfiger',
        services: ['Dry Clean', 'Iron'],
        price: 300,
        specialInstructions: 'Handle with care',
      },
      {
        type: 'Trousers',
        color: 'Black',
        brand: 'Zara',
        services: ['Dry Clean', 'Iron'],
        price: 400,
        specialInstructions: '',
      },
    ],
    status: 'washing',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
  },
  {
    garments: [
      {
        type: 'Dress',
        color: 'Blue',
        brand: 'H&M',
        services: ['Wash', 'Iron'],
        price: 500,
        specialInstructions: 'Delicate fabric',
      },
    ],
    status: 'ready',
    paymentStatus: 'paid',
    paymentMethod: 'mpesa',
  },
  {
    garments: [
      {
        type: 'Suit',
        color: 'Navy Blue',
        brand: 'Hugo Boss',
        services: ['Dry Clean', 'Iron'],
        price: 800,
        specialInstructions: '',
      },
      {
        type: 'Shirt',
        color: 'Light Blue',
        brand: 'Ralph Lauren',
        services: ['Dry Clean', 'Iron'],
        price: 300,
        specialInstructions: '',
      },
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
  },
];

async function createDevCustomer() {
  console.log('🚀 Starting dev customer creation...\n');

  try {
    // Step 1: Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(DEV_CUSTOMER.email);
      console.log('✅ User already exists:', userRecord.uid);
    } catch (error) {
      // User doesn't exist, create it
      console.log('📝 Creating Firebase Auth user...');
      userRecord = await auth.createUser({
        email: DEV_CUSTOMER.email,
        phoneNumber: DEV_CUSTOMER.phone,
        password: DEV_CUSTOMER.password,
        displayName: DEV_CUSTOMER.name,
        emailVerified: true,
      });
      console.log('✅ Created user:', userRecord.uid);
    }

    const userId = userRecord.uid;

    // Step 2: Create or update customer document
    const customerId = `CUST-${Date.now()}`;
    console.log('\n📝 Creating customer document...');

    await db.collection('customers').doc(customerId).set({
      customerId,
      name: DEV_CUSTOMER.name,
      phone: DEV_CUSTOMER.phone,
      email: DEV_CUSTOMER.email,
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          address: 'Kilimani, Nairobi',
          coordinates: {
            lat: -1.2921,
            lng: 36.7856,
          },
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 0,
      totalSpent: 0,
      createdAt: Timestamp.now(),
    });
    console.log('✅ Created customer:', customerId);

    // Step 3: Create user document with customer role
    console.log('\n📝 Creating user document...');
    await db.collection('users').doc(userId).set({
      uid: userId,
      email: DEV_CUSTOMER.email,
      phone: DEV_CUSTOMER.phone,
      name: DEV_CUSTOMER.name,
      role: 'customer',
      branchId: 'main-branch',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    });
    console.log('✅ Created user document');

    // Step 4: Create sample orders
    console.log('\n📝 Creating sample orders...');
    let totalSpent = 0;

    for (let i = 0; i < SAMPLE_ORDERS.length; i++) {
      const orderData = SAMPLE_ORDERS[i];
      const orderId = `ORD-DEV-${Date.now()}-${String(i + 1).padStart(4, '0')}`;

      // Calculate total
      const totalAmount = orderData.garments.reduce((sum, g) => sum + g.price, 0);
      totalSpent += totalAmount;

      // Add garment IDs
      const garmentsWithIds = orderData.garments.map((garment, idx) => ({
        garmentId: `${orderId}-G${String(idx + 1).padStart(2, '0')}`,
        ...garment,
        status: orderData.status,
        photos: [],
      }));

      // Calculate estimated completion (2 days from now)
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + 2);

      // Create status history
      const statusHistory = [
        {
          status: 'received',
          timestamp: Timestamp.now(),
          updatedBy: 'system',
        },
      ];

      if (orderData.status !== 'received') {
        statusHistory.push({
          status: orderData.status,
          timestamp: Timestamp.now(),
          updatedBy: 'system',
        });
      }

      await db.collection('orders').doc(orderId).set({
        orderId,
        customerId,
        customerName: DEV_CUSTOMER.name,
        customerPhone: DEV_CUSTOMER.phone,
        branchId: 'main-branch',
        status: orderData.status,
        garments: garmentsWithIds,
        totalAmount,
        paidAmount: totalAmount,
        paymentStatus: orderData.paymentStatus,
        paymentMethod: orderData.paymentMethod,
        estimatedCompletion: Timestamp.fromDate(estimatedCompletion),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'system',
        statusHistory,
      });

      console.log(`✅ Created order ${i + 1}/${SAMPLE_ORDERS.length}: ${orderId}`);
    }

    // Step 5: Update customer stats
    console.log('\n📝 Updating customer statistics...');
    await db.collection('customers').doc(customerId).update({
      orderCount: SAMPLE_ORDERS.length,
      totalSpent,
    });
    console.log('✅ Updated customer stats');

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Dev customer account created');
    console.log('='.repeat(60));
    console.log('\n📋 Customer Details:');
    console.log('  Name:', DEV_CUSTOMER.name);
    console.log('  Phone:', DEV_CUSTOMER.phone);
    console.log('  Email:', DEV_CUSTOMER.email);
    console.log('  Password:', DEV_CUSTOMER.password);
    console.log('  Customer ID:', customerId);
    console.log('  User ID:', userId);
    console.log('\n📦 Orders Created:', SAMPLE_ORDERS.length);
    console.log('  Total Spent: KES', totalSpent);
    console.log('\n🧪 How to Test:');
    console.log('  1. Go to http://localhost:3000/customer-login');
    console.log('  2. Enter phone:', DEV_CUSTOMER.phone);
    console.log('  3. Click "Send OTP"');
    console.log('  4. Check console for OTP and verify');
    console.log('  5. You should see', SAMPLE_ORDERS.length, 'orders in the portal');
    console.log('\n  OR use email login (if implemented):');
    console.log('  Email:', DEV_CUSTOMER.email);
    console.log('  Password:', DEV_CUSTOMER.password);
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error creating dev customer:', error);
    process.exit(1);
  }
}

// Run the script
createDevCustomer()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
