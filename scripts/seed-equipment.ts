/**
 * Seed Equipment Script
 *
 * Populates equipment data for GM Dashboard's Equipment Status widget
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

type EquipmentStatus = 'running' | 'idle' | 'maintenance' | 'offline';
type EquipmentType = 'washer' | 'dryer' | 'press' | 'steamer' | 'other';

interface EquipmentData {
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  model?: string;
}

// Main branches with their equipment configurations
const branchEquipment: Record<string, EquipmentData[]> = {
  VILLAGE_MARKET: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'Electrolux W5180H' },
    { name: 'Washer 2', type: 'washer', status: 'running', model: 'Electrolux W5180H' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'Electrolux T5290' },
    { name: 'Dryer 2', type: 'dryer', status: 'idle', model: 'Electrolux T5290' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Hoffman Press' },
    { name: 'Steam Press 2', type: 'press', status: 'running', model: 'Hoffman Press' },
    { name: 'Garment Steamer', type: 'steamer', status: 'idle', model: 'Jiffy J-4000' },
  ],
  WESTGATE: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'LG Commercial WM' },
    { name: 'Washer 2', type: 'washer', status: 'maintenance', model: 'LG Commercial WM' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'LG Commercial TD' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Forenta Press' },
    { name: 'Garment Steamer', type: 'steamer', status: 'running', model: 'Jiffy J-4000' },
  ],
  DENNIS_PRITT: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'Speed Queen SC40' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'Speed Queen ST40' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Hoffman Press' },
    { name: 'Garment Steamer', type: 'steamer', status: 'idle', model: 'Jiffy Steamer' },
  ],
  MUTHAIGA: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'Speed Queen SC40' },
    { name: 'Washer 2', type: 'washer', status: 'idle', model: 'Speed Queen SC40' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'Speed Queen ST40' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Forenta 46SKA' },
    { name: 'Steam Press 2', type: 'press', status: 'offline', model: 'Forenta 46SKA' },
  ],
  ADLIFE: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'Electrolux W5180H' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'Electrolux T5290' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Hoffman Press' },
  ],
  NAIVAS_KILIMANI: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'LG Commercial WM' },
    { name: 'Washer 2', type: 'washer', status: 'running', model: 'LG Commercial WM' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'LG Commercial TD' },
    { name: 'Dryer 2', type: 'dryer', status: 'maintenance', model: 'LG Commercial TD' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Hoffman Press' },
    { name: 'Garment Steamer', type: 'steamer', status: 'running', model: 'Jiffy J-4000' },
  ],
  HURLINGHAM: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'Speed Queen SC40' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'Speed Queen ST40' },
    { name: 'Steam Press 1', type: 'press', status: 'idle', model: 'Forenta Press' },
  ],
  LAVINGTON: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'Electrolux W5180H' },
    { name: 'Washer 2', type: 'washer', status: 'running', model: 'Electrolux W5180H' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'Electrolux T5290' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Hoffman Press' },
    { name: 'Steam Press 2', type: 'press', status: 'running', model: 'Hoffman Press' },
  ],
  WATERFRONT_KAREN: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'Electrolux W5180H' },
    { name: 'Washer 2', type: 'washer', status: 'idle', model: 'Electrolux W5180H' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'Electrolux T5290' },
    { name: 'Dryer 2', type: 'dryer', status: 'running', model: 'Electrolux T5290' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Hoffman Press' },
    { name: 'Garment Steamer', type: 'steamer', status: 'running', model: 'Jiffy J-4000' },
  ],
  KILELESHWA: [
    { name: 'Washer 1', type: 'washer', status: 'running', model: 'LG Commercial WM' },
    { name: 'Dryer 1', type: 'dryer', status: 'running', model: 'LG Commercial TD' },
    { name: 'Steam Press 1', type: 'press', status: 'running', model: 'Forenta Press' },
  ],
};

async function seedEquipment() {
  console.log('🔧 Seeding equipment data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;

    for (const [branchId, equipmentList] of Object.entries(branchEquipment)) {
      console.log(`\n📍 Branch: ${branchId}`);

      for (const equipment of equipmentList) {
        const equipmentId = `${branchId}-${equipment.name.replace(/\s+/g, '-').toUpperCase()}`;
        const equipmentRef = db.collection('equipment').doc(equipmentId);
        const existingDoc = await equipmentRef.get();

        const now = Timestamp.now();
        const lastMaintenanceDate = new Date();
        lastMaintenanceDate.setDate(lastMaintenanceDate.getDate() - Math.floor(Math.random() * 30));

        const nextMaintenanceDate = new Date();
        nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + Math.floor(Math.random() * 60) + 30);

        const equipmentData = {
          equipmentId,
          branchId,
          name: equipment.name,
          type: equipment.type,
          status: equipment.status,
          model: equipment.model || null,
          active: equipment.status !== 'offline',
          lastMaintenanceAt: Timestamp.fromDate(lastMaintenanceDate),
          nextMaintenanceAt: Timestamp.fromDate(nextMaintenanceDate),
          createdAt: existingDoc.exists ? existingDoc.data()?.createdAt : now,
          updatedAt: now,
        };

        if (existingDoc.exists) {
          await equipmentRef.update(equipmentData);
          console.log(`  ✓ Updated: ${equipment.name} (${equipment.status})`);
          updated++;
        } else {
          await equipmentRef.set(equipmentData);
          console.log(`  ✓ Created: ${equipment.name} (${equipment.status})`);
          created++;
        }
      }
    }

    console.log(`\n✅ Equipment seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} equipment items`);
    console.log(`   - Updated: ${updated} equipment items`);
    console.log(`   - Total: ${created + updated} equipment items across ${Object.keys(branchEquipment).length} branches`);

  } catch (error) {
    console.error('\n❌ Error seeding equipment:', error);
    process.exit(1);
  }
}

seedEquipment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
