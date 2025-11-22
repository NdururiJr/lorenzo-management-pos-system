/**
 * Create Customer Document for Dev Super Admin
 *
 * This script creates a customer document for the existing
 * Dev Super Admin user to enable testing of the customer portal.
 *
 * Usage: npx tsx scripts/create-admin-customer.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Initialize Firebase Admin
 */
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // Check if service account key is provided
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
      // Use default credentials (works in some environments)
      initializeApp();
    }
  }
}

// Dev Super Admin User ID (from error message)
const ADMIN_USER_ID = 'bAoQKeZp4lg4NwWd8ExtZ3ZnAXz2';

async function createAdminCustomerDocument() {
  console.log('🚀 Creating customer document for Dev Super Admin...\n');

  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();

    const db = getFirestore();
    const auth = getAuth();

    // Step 1: Get existing user details
    console.log('📝 Fetching user details from Firebase Auth...');
    const userRecord = await auth.getUser(ADMIN_USER_ID);
    console.log('✅ Found user:', userRecord.displayName || userRecord.email);

    // Step 2: Create customer document with user ID as document ID
    console.log('\n📝 Creating customer document...');

    const customerData = {
      customerId: ADMIN_USER_ID,
      name: userRecord.displayName || 'Dev Super Admin',
      phone: userRecord.phoneNumber || '+254725462859',
      email: userRecord.email || 'admin@lorenzo-dev.com',
      addresses: [
        {
          label: 'Home',
          address: 'Kilimani, Nairobi',
          coordinates: {
            lat: -1.2921,
            lng: 36.7856,
          },
          source: 'manual',
        },
        {
          label: 'Office',
          address: 'Westlands, Nairobi',
          coordinates: {
            lat: -1.2676,
            lng: 36.8108,
          },
          source: 'manual',
        },
        {
          label: 'Parents Home',
          address: 'Karen, Nairobi',
          coordinates: {
            lat: -1.3197,
            lng: 36.7076,
          },
          source: 'manual',
        },
      ],
      preferences: {
        notifications: true,
        language: 'en',
      },
      orderCount: 5,
      totalSpent: 15000,
      createdAt: Timestamp.now(),
    };

    // Use the user ID as the document ID
    await db.collection('customers').doc(ADMIN_USER_ID).set(customerData);
    console.log('✅ Created customer document with ID:', ADMIN_USER_ID);

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Customer document created for Dev Super Admin');
    console.log('='.repeat(60));
    console.log('\n📋 Customer Details:');
    console.log('  Document ID:', ADMIN_USER_ID);
    console.log('  Name:', customerData.name);
    console.log('  Phone:', customerData.phone);
    console.log('  Email:', customerData.email);
    console.log('  Addresses:', customerData.addresses.length);
    console.log('  Order Count:', customerData.orderCount);
    console.log('  Total Spent: KES', customerData.totalSpent);
    console.log('\n🧪 What You Can Test Now:');
    console.log('  ✓ /profile page - View and edit profile information');
    console.log('  ✓ /portal/request-pickup - Select from', customerData.addresses.length, 'addresses');
    console.log('  ✓ Address management - Add, edit, remove addresses');
    console.log('  ✓ Customer preferences - Notification settings, language');
    console.log('  ✓ Customer statistics - Order count and total spent');
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error creating customer document:', error);
    process.exit(1);
  }
}

// Run the script
createAdminCustomerDocument()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
