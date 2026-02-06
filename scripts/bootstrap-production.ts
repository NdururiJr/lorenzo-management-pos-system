/**
 * Bootstrap Production Script
 *
 * Initializes minimum required data for production deployment.
 * Run this ONCE before first deployment to create:
 *   1. Initial branch with REAL Nairobi coordinates
 *   2. Company settings document
 *   3. Default pricing for all garment types
 *   4. Admin user with proper Firebase Auth claims
 *
 * Usage:
 *   npx ts-node scripts/bootstrap-production.ts
 *
 * Or via npm script:
 *   npm run bootstrap
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ============================================
// CONFIGURATION - Edit these values as needed
// ============================================

/**
 * Admin user configuration
 * Change these values for your production admin
 */
const ADMIN_CONFIG = {
  email: process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@lorenzodrycleaner.com',
  password: process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Lorenzo2024!SecureAdmin',
  displayName: 'System Administrator',
};

/**
 * Company settings
 */
const COMPANY_SETTINGS = {
  companyName: 'Lorenzo Dry Cleaners',
  defaultRetentionTarget: 80, // percentage
  defaultMarginTarget: 35, // percentage
  defaultTurnaroundHours: 24,
  currency: 'KES',
  mpesaLimits: { min: 10, max: 500000 },
  cardLimits: { min: 100, max: 1000000 },
  cashLimits: { min: 1, max: 10000000 },
};

/**
 * Real Nairobi GPS coordinates for all Lorenzo branches
 * These are accurate locations for maps, routing, and distance calculations
 */
const NAIROBI_BRANCH_COORDINATES: Record<string, { lat: number; lng: number }> = {
  VILLAGE_MARKET: { lat: -1.2294, lng: 36.8036 },
  WESTGATE: { lat: -1.2611, lng: 36.8036 },
  DENNIS_PRITT: { lat: -1.2742, lng: 36.7875 },
  MUTHAIGA: { lat: -1.2533, lng: 36.8361 },
  ADLIFE: { lat: -1.2919, lng: 36.7878 },
  NAIVAS_KILIMANI: { lat: -1.2921, lng: 36.7825 },
  HURLINGHAM: { lat: -1.2986, lng: 36.7981 },
  LAVINGTON: { lat: -1.2745, lng: 36.7661 },
  GREENPARK: { lat: -1.2897, lng: 36.7833 },
  SOUTH_C_NAIVAS: { lat: -1.3156, lng: 36.8247 },
  LANGATA_KOBIL: { lat: -1.3361, lng: 36.7483 },
  BOMAS: { lat: -1.3408, lng: 36.7442 },
  WATERFRONT_KAREN: { lat: -1.3194, lng: 36.7106 },
  FREEDOM_HEIGHTS: { lat: -1.3328, lng: 36.7572 },
  NGONG_SHELL: { lat: -1.3619, lng: 36.6606 },
  IMARA: { lat: -1.3233, lng: 36.8608 },
  NEXTGEN_SOUTH_C: { lat: -1.3172, lng: 36.8256 },
  KILELESHWA: { lat: -1.2786, lng: 36.7789 },
  ARBORETUM: { lat: -1.2694, lng: 36.8047 },
  SHUJAH_MALL: { lat: -1.2917, lng: 36.7881 },
  MYTOWN_KAREN: { lat: -1.3197, lng: 36.6947 },
  // Main processing hub
  KILIMANI_MAIN: { lat: -1.2921, lng: 36.7896 },
};

/**
 * Initial branch configuration (main processing hub)
 */
const INITIAL_BRANCH = {
  branchId: 'KILIMANI_MAIN',
  name: 'Lorenzo Kilimani Main',
  branchType: 'main' as const,
  contactPhone: '+254 700 000 001',
  location: {
    address: 'Kilimani, Nairobi, Kenya',
    coordinates: NAIROBI_BRANCH_COORDINATES.KILIMANI_MAIN,
  },
  dailyTarget: 100000, // KES
  targetTurnaroundHours: 24,
  active: true,
};

/**
 * Garment types with default pricing (KES)
 * Prices based on Nairobi dry cleaning market rates
 */
const DEFAULT_PRICING: Array<{
  garmentType: string;
  services: { wash: number; dryClean: number; iron: number; starch: number; express: number };
}> = [
  {
    garmentType: 'Shirt',
    services: { wash: 150, dryClean: 250, iron: 100, starch: 50, express: 0 },
  },
  {
    garmentType: 'Pants',
    services: { wash: 200, dryClean: 300, iron: 120, starch: 50, express: 0 },
  },
  {
    garmentType: 'Dress',
    services: { wash: 300, dryClean: 500, iron: 150, starch: 75, express: 0 },
  },
  {
    garmentType: 'Suit',
    services: { wash: 500, dryClean: 800, iron: 200, starch: 100, express: 0 },
  },
  {
    garmentType: 'Jacket',
    services: { wash: 400, dryClean: 600, iron: 180, starch: 80, express: 0 },
  },
  {
    garmentType: 'Coat',
    services: { wash: 500, dryClean: 800, iron: 200, starch: 100, express: 0 },
  },
  {
    garmentType: 'Skirt',
    services: { wash: 200, dryClean: 350, iron: 120, starch: 50, express: 0 },
  },
  {
    garmentType: 'Blouse',
    services: { wash: 180, dryClean: 300, iron: 100, starch: 50, express: 0 },
  },
  {
    garmentType: 'Sweater',
    services: { wash: 250, dryClean: 400, iron: 130, starch: 60, express: 0 },
  },
  {
    garmentType: 'Tie',
    services: { wash: 100, dryClean: 200, iron: 80, starch: 30, express: 0 },
  },
  {
    garmentType: 'Scarf',
    services: { wash: 150, dryClean: 250, iron: 80, starch: 40, express: 0 },
  },
  {
    garmentType: 'Bedding',
    services: { wash: 400, dryClean: 600, iron: 150, starch: 100, express: 0 },
  },
  {
    garmentType: 'Curtains',
    services: { wash: 500, dryClean: 800, iron: 200, starch: 150, express: 0 },
  },
  {
    garmentType: 'Wedding Dress',
    services: { wash: 2000, dryClean: 5000, iron: 500, starch: 300, express: 0 },
  },
  {
    garmentType: 'Other',
    services: { wash: 200, dryClean: 350, iron: 120, starch: 60, express: 0 },
  },
];

// ============================================
// SCRIPT IMPLEMENTATION
// ============================================

/**
 * Initialize Firebase Admin SDK
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
        console.log('✓ Firebase Admin initialized with service account');
      } catch (error) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        throw error;
      }
    } else {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
      console.log('   Please add it to your .env.local file');
      process.exit(1);
    }
  }
}

/**
 * Create or update the initial branch
 */
async function createInitialBranch(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n📍 Creating initial branch...');

  const branchRef = db.collection('branches').doc(INITIAL_BRANCH.branchId);
  const branchDoc = await branchRef.get();

  const branchData = {
    ...INITIAL_BRANCH,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (branchDoc.exists) {
    // Update existing branch with real coordinates
    await branchRef.update({
      ...branchData,
      createdAt: branchDoc.data()?.createdAt || Timestamp.now(),
    });
    console.log(`   ✓ Updated: ${INITIAL_BRANCH.name}`);
    console.log(`   ✓ Coordinates: ${INITIAL_BRANCH.location.coordinates.lat}, ${INITIAL_BRANCH.location.coordinates.lng}`);
  } else {
    await branchRef.set(branchData);
    console.log(`   ✓ Created: ${INITIAL_BRANCH.name}`);
    console.log(`   ✓ Coordinates: ${INITIAL_BRANCH.location.coordinates.lat}, ${INITIAL_BRANCH.location.coordinates.lng}`);
  }
}

/**
 * Create company settings document
 */
async function createCompanySettings(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n⚙️  Creating company settings...');

  const settingsRef = db.collection('system_config').doc('company_settings');
  const settingsDoc = await settingsRef.get();

  const settingsData = {
    ...COMPANY_SETTINGS,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  if (settingsDoc.exists) {
    await settingsRef.update({
      ...settingsData,
      createdAt: settingsDoc.data()?.createdAt || Timestamp.now(),
    });
    console.log('   ✓ Updated company settings');
  } else {
    await settingsRef.set(settingsData);
    console.log('   ✓ Created company settings');
  }

  console.log(`   • Company: ${COMPANY_SETTINGS.companyName}`);
  console.log(`   • Currency: ${COMPANY_SETTINGS.currency}`);
  console.log(`   • Default turnaround: ${COMPANY_SETTINGS.defaultTurnaroundHours} hours`);
}

/**
 * Create default pricing for all garment types
 */
async function createDefaultPricing(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n💰 Creating default pricing...');

  let created = 0;
  let updated = 0;

  for (const pricing of DEFAULT_PRICING) {
    const pricingId = `PRICE-${INITIAL_BRANCH.branchId}-${pricing.garmentType.replace(/\s+/g, '-').toUpperCase()}`;
    const pricingRef = db.collection('pricing').doc(pricingId);
    const pricingDoc = await pricingRef.get();

    const pricingData = {
      pricingId,
      branchId: INITIAL_BRANCH.branchId,
      garmentType: pricing.garmentType,
      services: pricing.services,
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (pricingDoc.exists) {
      await pricingRef.update({
        ...pricingData,
        createdAt: pricingDoc.data()?.createdAt || Timestamp.now(),
      });
      updated++;
    } else {
      await pricingRef.set(pricingData);
      created++;
    }
  }

  console.log(`   ✓ Created: ${created} pricing rules`);
  console.log(`   ✓ Updated: ${updated} pricing rules`);
  console.log(`   ✓ Total: ${DEFAULT_PRICING.length} garment types configured`);
}

/**
 * Create admin user with proper Firebase Auth claims
 */
async function createAdminUser(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n👤 Creating admin user...');

  const auth = getAuth();
  let user;

  try {
    // Check if user exists
    user = await auth.getUserByEmail(ADMIN_CONFIG.email);
    console.log(`   ✓ User already exists: ${user.uid}`);

    // Update password and display name
    await auth.updateUser(user.uid, {
      password: ADMIN_CONFIG.password,
      displayName: ADMIN_CONFIG.displayName,
      emailVerified: true,
    });
    console.log('   ✓ Updated user credentials');
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    if (firebaseError.code === 'auth/user-not-found') {
      // Create new user
      user = await auth.createUser({
        email: ADMIN_CONFIG.email,
        password: ADMIN_CONFIG.password,
        displayName: ADMIN_CONFIG.displayName,
        emailVerified: true,
      });
      console.log(`   ✓ Created new user: ${user.uid}`);
    } else {
      throw error;
    }
  }

  // Create or update user document in Firestore
  const userRef = db.collection('users').doc(user.uid);
  const userData = {
    email: ADMIN_CONFIG.email,
    name: ADMIN_CONFIG.displayName,
    role: 'admin',
    branchId: null, // Super admin - access to all branches
    branchAccess: [], // Super admin doesn't need specific branch access
    isSuperAdmin: true,
    active: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const userDoc = await userRef.get();
  if (userDoc.exists) {
    await userRef.update({
      ...userData,
      createdAt: userDoc.data()?.createdAt || Timestamp.now(),
    });
  } else {
    await userRef.set(userData);
  }
  console.log('   ✓ Created/updated user document in Firestore');

  // Set custom claims for role and super admin access
  await auth.setCustomUserClaims(user.uid, {
    role: 'admin',
    branchId: null,
    branchAccess: [],
    isSuperAdmin: true,
  });
  console.log('   ✓ Set Firebase Auth custom claims');

  console.log(`   • Email: ${ADMIN_CONFIG.email}`);
  console.log(`   • Role: admin (Super Admin)`);
  console.log(`   • Branch Access: ALL BRANCHES`);
}

/**
 * Main bootstrap function
 */
async function bootstrap(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        LORENZO DRY CLEANERS - PRODUCTION BOOTSTRAP');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\nInitializing minimum required data for production deployment...\n');

  try {
    initializeFirebaseAdmin();

    const db = getFirestore();

    // Step 1: Create initial branch
    await createInitialBranch(db);

    // Step 2: Create company settings
    await createCompanySettings(db);

    // Step 3: Create default pricing
    await createDefaultPricing(db);

    // Step 4: Create admin user
    await createAdminUser(db);

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                    ✅ BOOTSTRAP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n📋 Summary:');
    console.log(`   • Branch: ${INITIAL_BRANCH.name} (${INITIAL_BRANCH.branchId})`);
    console.log(`   • Coordinates: ${INITIAL_BRANCH.location.coordinates.lat}, ${INITIAL_BRANCH.location.coordinates.lng}`);
    console.log(`   • Pricing: ${DEFAULT_PRICING.length} garment types configured`);
    console.log(`   • Admin: ${ADMIN_CONFIG.email}`);
    console.log('\n🔐 Admin Credentials:');
    console.log(`   • Email: ${ADMIN_CONFIG.email}`);
    console.log(`   • Password: ${ADMIN_CONFIG.password}`);
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Change the admin password after first login');
    console.log('   2. Configure additional branches via Firebase Console or seed-branches.ts');
    console.log('   3. Adjust pricing via the /pricing admin UI');
    console.log('   4. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('\n🚀 The system is now ready for first deployment!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

// Run the bootstrap script
bootstrap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
