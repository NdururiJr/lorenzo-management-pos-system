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

const branches = [
  {
    branchId: 'VILLAGE_MARKET',
    name: 'Village Market Courtyard',
    phone: '+254 113 499 854',
    location: 'Village Market, Gigiri'
  },
  {
    branchId: 'WESTGATE',
    name: 'Westgate Mall 2nd Floor',
    phone: '+254 794 592 392',
    location: 'Westgate Shopping Mall, 2nd Floor'
  },
  {
    branchId: 'DENNIS_PRITT',
    name: 'Dennis Pritt Rd',
    phone: '+254 745 294 808',
    location: 'Dennis Pritt Road'
  },
  {
    branchId: 'MUTHAIGA',
    name: 'Muthaiga Mini Market',
    phone: '+254 759 602 282',
    location: 'Muthaiga Mini Market'
  },
  {
    branchId: 'ADLIFE',
    name: 'Adlife Plaza Mezzanine Flr',
    phone: '+254 724 228 414',
    location: 'Adlife Plaza, Mezzanine Floor'
  },
  {
    branchId: 'NAIVAS_KILIMANI',
    name: 'Naivas Kilimani Mall (Ground Floor)',
    phone: '+254 742 122 985',
    location: 'Naivas Kilimani Mall, Ground Floor'
  },
  {
    branchId: 'HURLINGHAM',
    name: 'Hurlingham Quickmart',
    phone: '+254 706 945 997',
    location: 'Hurlingham Quickmart'
  },
  {
    branchId: 'LAVINGTON',
    name: 'Lavington Legend Valley Mall',
    phone: '+254 741 350 858',
    location: 'Legend Valley Mall, Lavington'
  },
  {
    branchId: 'GREENPARK',
    name: 'Greenpark- Arcadia',
    phone: '+254 769 573 764',
    location: 'Greenpark, Arcadia'
  },
  {
    branchId: 'SOUTH_C_NAIVAS',
    name: 'South C Naivas- South C',
    phone: '+254 700 765 223',
    location: 'Naivas South C'
  },
  {
    branchId: 'LANGATA_KOBIL',
    name: 'Langata Kobil- 1st Floor',
    phone: '+254 792 875 647',
    location: 'Kobil Langata, 1st Floor'
  },
  {
    branchId: 'BOMAS',
    name: 'Bomas Rubis Petrol',
    phone: '+254 791 269 369',
    location: 'Rubis Petrol Station, Bomas'
  },
  {
    branchId: 'WATERFRONT_KAREN',
    name: 'Waterfront Karen (Ground Floor)',
    phone: '+254 748 259 918',
    location: 'Waterfront Mall Karen, Ground Floor'
  },
  {
    branchId: 'FREEDOM_HEIGHTS',
    name: 'Langata Freedom Heights (Ground Floor)',
    phone: '+254 792 905 326',
    location: 'Freedom Heights Mall, Ground Floor, Langata'
  },
  {
    branchId: 'NGONG_SHELL',
    name: 'Ngong Shell Kerarapon',
    phone: '+254 114 445 902',
    location: 'Shell Kerarapon, Ngong'
  },
  {
    branchId: 'IMARA',
    name: 'Imara - Imara Mall Ground Floor',
    phone: '+254 115 094 399',
    location: 'Imara Mall, Ground Floor'
  },
  {
    branchId: 'NEXTGEN_SOUTH_C',
    name: 'Nextgen Mall- South C (Ground Floor)',
    phone: '+254 799 224 299',
    location: 'Nextgen Mall South C, Ground Floor'
  },
  {
    branchId: 'KILELESHWA',
    name: 'Kileleshwa Quickmart',
    phone: '+254 705 704 397',
    location: 'Quickmart Kileleshwa'
  },
  {
    branchId: 'ARBORETUM',
    name: 'Arboretum Shell',
    phone: '+254 703 726 656',
    location: 'Shell Arboretum'
  },
  {
    branchId: 'SHUJAH_MALL',
    name: 'Kilimani - Shujah Mall Opposite Adlife',
    phone: '+254 769 717 450',
    location: 'Shujah Mall, Kilimani (Opposite Adlife)'
  },
  {
    branchId: 'MYTOWN_KAREN',
    name: 'Karen - My Town Mall Opp Karen Hosp',
    phone: '+254 769 718 906',
    location: 'My Town Mall, Karen (Opposite Karen Hospital)'
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
          coordinates: {
            lat: 0, // TODO: Add actual coordinates if needed
            lng: 0,
          },
        },
        branchType: 'main', // Can be changed to 'satellite' as needed
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
