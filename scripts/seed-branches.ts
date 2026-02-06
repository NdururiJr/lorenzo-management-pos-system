/**
 * Seed Branches Script
 *
 * Populates all Lorenzo Dry Cleaners branches into Firestore
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({ credential: cert(serviceAccount) });
      } catch (error) {
        console.error('Failed to parse service account key');
        initializeApp();
      }
    } else {
      initializeApp();
    }
  }
}

/**
 * Real Nairobi GPS coordinates for all Lorenzo branches
 * These are accurate locations for maps, routing, and distance calculations
 */
const NAIROBI_COORDINATES: Record<string, { lat: number; lng: number }> = {
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
};

// Branch configuration with daily targets and turnaround times
// Larger/busier branches have higher targets
const branches = [
  {
    branchId: 'VILLAGE_MARKET',
    name: 'Village Market Courtyard',
    phone: '+254 113 499 854',
    location: 'Village Market, Gigiri',
    coordinates: NAIROBI_COORDINATES.VILLAGE_MARKET,
    dailyTarget: 75000, // KES - High traffic mall
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'WESTGATE',
    name: 'Westgate Mall 2nd Floor',
    phone: '+254 794 592 392',
    location: 'Westgate Shopping Mall, 2nd Floor',
    coordinates: NAIROBI_COORDINATES.WESTGATE,
    dailyTarget: 80000, // KES - Premium mall location
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'DENNIS_PRITT',
    name: 'Dennis Pritt Rd',
    phone: '+254 745 294 808',
    location: 'Dennis Pritt Road',
    coordinates: NAIROBI_COORDINATES.DENNIS_PRITT,
    dailyTarget: 45000, // KES - Smaller standalone
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'MUTHAIGA',
    name: 'Muthaiga Mini Market',
    phone: '+254 759 602 282',
    location: 'Muthaiga Mini Market',
    coordinates: NAIROBI_COORDINATES.MUTHAIGA,
    dailyTarget: 55000, // KES - Affluent area
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'ADLIFE',
    name: 'Adlife Plaza Mezzanine Flr',
    phone: '+254 724 228 414',
    location: 'Adlife Plaza, Mezzanine Floor',
    coordinates: NAIROBI_COORDINATES.ADLIFE,
    dailyTarget: 50000, // KES
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'NAIVAS_KILIMANI',
    name: 'Naivas Kilimani Mall (Ground Floor)',
    phone: '+254 742 122 985',
    location: 'Naivas Kilimani Mall, Ground Floor',
    coordinates: NAIROBI_COORDINATES.NAIVAS_KILIMANI,
    dailyTarget: 65000, // KES - High foot traffic
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'HURLINGHAM',
    name: 'Hurlingham Quickmart',
    phone: '+254 706 945 997',
    location: 'Hurlingham Quickmart',
    coordinates: NAIROBI_COORDINATES.HURLINGHAM,
    dailyTarget: 40000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'LAVINGTON',
    name: 'Lavington Legend Valley Mall',
    phone: '+254 741 350 858',
    location: 'Legend Valley Mall, Lavington',
    coordinates: NAIROBI_COORDINATES.LAVINGTON,
    dailyTarget: 60000, // KES - Upscale neighborhood
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'GREENPARK',
    name: 'Greenpark- Arcadia',
    phone: '+254 769 573 764',
    location: 'Greenpark, Arcadia',
    coordinates: NAIROBI_COORDINATES.GREENPARK,
    dailyTarget: 35000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'SOUTH_C_NAIVAS',
    name: 'South C Naivas- South C',
    phone: '+254 700 765 223',
    location: 'Naivas South C',
    coordinates: NAIROBI_COORDINATES.SOUTH_C_NAIVAS,
    dailyTarget: 45000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'LANGATA_KOBIL',
    name: 'Langata Kobil- 1st Floor',
    phone: '+254 792 875 647',
    location: 'Kobil Langata, 1st Floor',
    coordinates: NAIROBI_COORDINATES.LANGATA_KOBIL,
    dailyTarget: 35000, // KES - Petrol station location
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'BOMAS',
    name: 'Bomas Rubis Petrol',
    phone: '+254 791 269 369',
    location: 'Rubis Petrol Station, Bomas',
    coordinates: NAIROBI_COORDINATES.BOMAS,
    dailyTarget: 30000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'WATERFRONT_KAREN',
    name: 'Waterfront Karen (Ground Floor)',
    phone: '+254 748 259 918',
    location: 'Waterfront Mall Karen, Ground Floor',
    coordinates: NAIROBI_COORDINATES.WATERFRONT_KAREN,
    dailyTarget: 70000, // KES - Premium Karen location
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'FREEDOM_HEIGHTS',
    name: 'Langata Freedom Heights (Ground Floor)',
    phone: '+254 792 905 326',
    location: 'Freedom Heights Mall, Ground Floor, Langata',
    coordinates: NAIROBI_COORDINATES.FREEDOM_HEIGHTS,
    dailyTarget: 40000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'NGONG_SHELL',
    name: 'Ngong Shell Kerarapon',
    phone: '+254 114 445 902',
    location: 'Shell Kerarapon, Ngong',
    coordinates: NAIROBI_COORDINATES.NGONG_SHELL,
    dailyTarget: 25000, // KES - Smaller satellite
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'IMARA',
    name: 'Imara - Imara Mall Ground Floor',
    phone: '+254 115 094 399',
    location: 'Imara Mall, Ground Floor',
    coordinates: NAIROBI_COORDINATES.IMARA,
    dailyTarget: 35000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'NEXTGEN_SOUTH_C',
    name: 'Nextgen Mall- South C (Ground Floor)',
    phone: '+254 799 224 299',
    location: 'Nextgen Mall South C, Ground Floor',
    coordinates: NAIROBI_COORDINATES.NEXTGEN_SOUTH_C,
    dailyTarget: 45000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'KILELESHWA',
    name: 'Kileleshwa Quickmart',
    phone: '+254 705 704 397',
    location: 'Quickmart Kileleshwa',
    coordinates: NAIROBI_COORDINATES.KILELESHWA,
    dailyTarget: 50000, // KES - Good residential area
    targetTurnaroundHours: 24,
  },
  {
    branchId: 'ARBORETUM',
    name: 'Arboretum Shell',
    phone: '+254 703 726 656',
    location: 'Shell Arboretum',
    coordinates: NAIROBI_COORDINATES.ARBORETUM,
    dailyTarget: 40000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'SHUJAH_MALL',
    name: 'Kilimani - Shujah Mall Opposite Adlife',
    phone: '+254 769 717 450',
    location: 'Shujah Mall, Kilimani (Opposite Adlife)',
    coordinates: NAIROBI_COORDINATES.SHUJAH_MALL,
    dailyTarget: 45000, // KES
    targetTurnaroundHours: 48,
  },
  {
    branchId: 'MYTOWN_KAREN',
    name: 'Karen - My Town Mall Opp Karen Hosp',
    phone: '+254 769 718 906',
    location: 'My Town Mall, Karen (Opposite Karen Hospital)',
    coordinates: NAIROBI_COORDINATES.MYTOWN_KAREN,
    dailyTarget: 55000, // KES - Karen area
    targetTurnaroundHours: 24,
  },
];

async function seedBranches() {
  console.log('🌱 Seeding branches...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const branch of branches) {
      const branchRef = db.collection('branches').doc(branch.branchId);
      const branchDoc = await branchRef.get();

      const branchData = {
        branchId: branch.branchId,
        name: branch.name,
        contactPhone: branch.phone,
        location: {
          address: `${branch.location}, Nairobi, Kenya`,
          coordinates: branch.coordinates, // Real Nairobi GPS coordinates
        },
        branchType: 'main', // Can be changed to 'satellite' as needed
        dailyTarget: branch.dailyTarget, // Daily revenue target in KES
        targetTurnaroundHours: branch.targetTurnaroundHours, // Target turnaround time
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (branchDoc.exists) {
        // Update existing branch
        await branchRef.update({
          ...branchData,
          createdAt: branchDoc.data()?.createdAt || Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        console.log(`✓ Updated: ${branch.name}`);
        updated++;
      } else {
        // Create new branch
        await branchRef.set(branchData);
        console.log(`✓ Created: ${branch.name}`);
        created++;
      }
    }

    console.log(`\n✅ Seed completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} branches`);
    console.log(`   - Updated: ${updated} branches`);
    console.log(`   - Total: ${branches.length} branches`);
    console.log(`\n🔄 Please refresh your browser to see all branches!`);

  } catch (error) {
    console.error('\n❌ Error seeding branches:', error);
    process.exit(1);
  }
}

seedBranches()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
