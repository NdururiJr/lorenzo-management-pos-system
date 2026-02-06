/**
 * Seed Processing Batches Script
 *
 * Populates processing batch data for Workstation Queue Management
 * Creates batches at various stages of the cleaning process
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

type ProcessingStage = 'inspection' | 'washing' | 'drying' | 'ironing' | 'quality_check' | 'packaging';
type BatchStatus = 'queued' | 'in_progress' | 'completed';

interface ProcessingBatch {
  batchId: string;
  branchId: string;
  stage: ProcessingStage;
  orderIds: string[];
  garmentCount: number;
  assignedTo?: string;
  assignedToName?: string;
  status: BatchStatus;
  priority: 'normal' | 'rush' | 'express';
  notes?: string;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Processing facilities (main branches)
const processingBranches = [
  'VILLAGE_MARKET',
  'WESTGATE',
  'DENNIS_PRITT',
  'MUTHAIGA',
  'NAIVAS_KILIMANI',
];

// Stage distribution - how many batches at each stage
const stageDistribution: Record<ProcessingStage, { count: number; statusWeights: Record<BatchStatus, number> }> = {
  inspection: { count: 3, statusWeights: { queued: 0.4, in_progress: 0.4, completed: 0.2 } },
  washing: { count: 4, statusWeights: { queued: 0.3, in_progress: 0.5, completed: 0.2 } },
  drying: { count: 3, statusWeights: { queued: 0.3, in_progress: 0.4, completed: 0.3 } },
  ironing: { count: 3, statusWeights: { queued: 0.4, in_progress: 0.4, completed: 0.2 } },
  quality_check: { count: 2, statusWeights: { queued: 0.3, in_progress: 0.5, completed: 0.2 } },
  packaging: { count: 2, statusWeights: { queued: 0.4, in_progress: 0.4, completed: 0.2 } },
};

// Staff names for assignment
const staffByBranch: Record<string, { id: string; name: string }[]> = {
  VILLAGE_MARKET: [
    { id: 'staff-vm-1', name: 'Joseph Kamau' },
    { id: 'staff-vm-2', name: 'Grace Wanjiku' },
    { id: 'staff-vm-3', name: 'Peter Ochieng' },
  ],
  WESTGATE: [
    { id: 'staff-wg-1', name: 'Mary Akinyi' },
    { id: 'staff-wg-2', name: 'John Mwangi' },
  ],
  DENNIS_PRITT: [
    { id: 'staff-dp-1', name: 'Alice Njeri' },
    { id: 'staff-dp-2', name: 'David Kipchoge' },
  ],
  MUTHAIGA: [
    { id: 'staff-mu-1', name: 'Sarah Chebet' },
    { id: 'staff-mu-2', name: 'Michael Otieno' },
  ],
  NAIVAS_KILIMANI: [
    { id: 'staff-nk-1', name: 'Elizabeth Wambui' },
    { id: 'staff-nk-2', name: 'James Mutiso' },
    { id: 'staff-nk-3', name: 'Faith Nyambura' },
  ],
};

function pickWeightedStatus(weights: Record<BatchStatus, number>): BatchStatus {
  const random = Math.random();
  let cumulative = 0;
  for (const [status, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random < cumulative) {
      return status as BatchStatus;
    }
  }
  return 'queued';
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBatchId(branchId: string, stage: string, index: number): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `BATCH-${branchId.substring(0, 4)}-${stage.substring(0, 3).toUpperCase()}-${dateStr}-${String(index).padStart(3, '0')}`;
}

function getHoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

async function getExistingOrderIds(db: FirebaseFirestore.Firestore, branchId: string): Promise<string[]> {
  const ordersSnapshot = await db.collection('orders')
    .where('branchId', '==', branchId)
    .limit(50)
    .get();

  if (ordersSnapshot.empty) {
    // Return some mock order IDs if no orders exist
    return Array.from({ length: 10 }, (_, i) => `ORD-${branchId}-MOCK-${String(i + 1).padStart(4, '0')}`);
  }

  return ordersSnapshot.docs.map(doc => doc.id);
}

async function seedProcessingBatches() {
  console.log('🔄 Seeding processing batch data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;
    let batchIndex = 1;

    for (const branchId of processingBranches) {
      console.log(`\n📍 Branch: ${branchId}`);

      // Get existing order IDs for this branch
      const orderIds = await getExistingOrderIds(db, branchId);
      let orderIndex = 0;

      const branchStaff = staffByBranch[branchId] || [];

      for (const [stage, config] of Object.entries(stageDistribution)) {
        for (let i = 0; i < config.count; i++) {
          const batchId = generateBatchId(branchId, stage, batchIndex++);
          const batchRef = db.collection('processingBatches').doc(batchId);
          const existingDoc = await batchRef.get();

          const now = Timestamp.now();
          const status = pickWeightedStatus(config.statusWeights);

          // Assign 2-5 orders per batch
          const batchOrderCount = Math.floor(Math.random() * 4) + 2;
          const batchOrderIds: string[] = [];
          for (let j = 0; j < batchOrderCount && orderIndex < orderIds.length; j++) {
            batchOrderIds.push(orderIds[orderIndex % orderIds.length]);
            orderIndex++;
          }

          // Assign staff if in_progress
          let assignedTo: string | undefined;
          let assignedToName: string | undefined;
          if (status === 'in_progress' && branchStaff.length > 0) {
            const staff = getRandomElement(branchStaff);
            assignedTo = staff.id;
            assignedToName = staff.name;
          }

          // Set timestamps based on status
          const createdAt = Timestamp.fromDate(getHoursAgo(Math.floor(Math.random() * 8) + 1));
          let startedAt: Timestamp | undefined;
          let completedAt: Timestamp | undefined;

          if (status === 'in_progress' || status === 'completed') {
            startedAt = Timestamp.fromDate(getHoursAgo(Math.floor(Math.random() * 4)));
          }
          if (status === 'completed') {
            completedAt = Timestamp.fromDate(getHoursAgo(Math.floor(Math.random() * 2)));
          }

          // Random priority
          const priorities: Array<'normal' | 'rush' | 'express'> = ['normal', 'normal', 'normal', 'rush', 'express'];
          const priority = getRandomElement(priorities);

          const batchData: ProcessingBatch = {
            batchId,
            branchId,
            stage: stage as ProcessingStage,
            orderIds: batchOrderIds,
            garmentCount: batchOrderIds.length * (Math.floor(Math.random() * 3) + 2), // 2-4 garments per order
            status,
            priority,
            createdAt,
            updatedAt: now,
          };

          if (assignedTo) {
            batchData.assignedTo = assignedTo;
            batchData.assignedToName = assignedToName;
          }
          if (startedAt) {
            batchData.startedAt = startedAt;
          }
          if (completedAt) {
            batchData.completedAt = completedAt;
          }

          // Add notes for some batches
          if (Math.random() < 0.3) {
            const notes = [
              'Handle with care - delicate fabrics',
              'Rush order - priority customer',
              'Contains leather items',
              'Special instructions from customer',
              'Wedding garments - extra care needed',
            ];
            batchData.notes = getRandomElement(notes);
          }

          if (existingDoc.exists) {
            await batchRef.update(batchData as any);
            console.log(`  ✓ Updated: ${stage} batch - ${status} (${batchOrderIds.length} orders)`);
            updated++;
          } else {
            await batchRef.set(batchData);
            console.log(`  ✓ Created: ${stage} batch - ${status} (${batchOrderIds.length} orders)`);
            created++;
          }
        }
      }
    }

    console.log(`\n✅ Processing batch seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} batches`);
    console.log(`   - Updated: ${updated} batches`);
    console.log(`   - Total: ${created + updated} batches across ${processingBranches.length} branches`);

  } catch (error) {
    console.error('\n❌ Error seeding processing batches:', error);
    process.exit(1);
  }
}

seedProcessingBatches()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
