/**
 * Seed Inventory Script
 *
 * Populates inventory data for the Inventory Management page
 * Creates stock items per branch with various categories
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

type InventoryCategory = 'cleaning' | 'packaging' | 'equipment' | 'chemicals';

interface InventoryItem {
  name: string;
  category: InventoryCategory;
  unit: string;
  baseQuantity: number;
  reorderLevel: number;
  costPerUnit: number;
  supplier?: string;
}

// Common inventory items shared across branches
const commonInventoryItems: InventoryItem[] = [
  // Cleaning supplies
  { name: 'Laundry Detergent Premium', category: 'cleaning', unit: 'liters', baseQuantity: 50, reorderLevel: 20, costPerUnit: 450, supplier: 'CleanPro Kenya' },
  { name: 'Fabric Softener', category: 'cleaning', unit: 'liters', baseQuantity: 30, reorderLevel: 15, costPerUnit: 350, supplier: 'CleanPro Kenya' },
  { name: 'Stain Remover Solution', category: 'cleaning', unit: 'liters', baseQuantity: 20, reorderLevel: 10, costPerUnit: 850, supplier: 'CleanPro Kenya' },
  { name: 'Bleach (Industrial)', category: 'cleaning', unit: 'liters', baseQuantity: 25, reorderLevel: 12, costPerUnit: 280, supplier: 'ChemTech Supplies' },
  { name: 'Dry Cleaning Solvent', category: 'cleaning', unit: 'liters', baseQuantity: 40, reorderLevel: 20, costPerUnit: 1200, supplier: 'DryChem Industries' },
  { name: 'Spot Cleaning Fluid', category: 'cleaning', unit: 'bottles', baseQuantity: 15, reorderLevel: 8, costPerUnit: 650, supplier: 'CleanPro Kenya' },
  { name: 'Leather Cleaner', category: 'cleaning', unit: 'bottles', baseQuantity: 10, reorderLevel: 5, costPerUnit: 950, supplier: 'Premium Leather Care' },
  { name: 'Suede Cleaner', category: 'cleaning', unit: 'bottles', baseQuantity: 8, reorderLevel: 4, costPerUnit: 1100, supplier: 'Premium Leather Care' },

  // Packaging supplies
  { name: 'Garment Bags (Clear)', category: 'packaging', unit: 'pieces', baseQuantity: 500, reorderLevel: 200, costPerUnit: 15, supplier: 'PackRight Ltd' },
  { name: 'Garment Bags (Suit)', category: 'packaging', unit: 'pieces', baseQuantity: 200, reorderLevel: 100, costPerUnit: 45, supplier: 'PackRight Ltd' },
  { name: 'Hanger (Standard)', category: 'packaging', unit: 'pieces', baseQuantity: 300, reorderLevel: 150, costPerUnit: 25, supplier: 'PackRight Ltd' },
  { name: 'Hanger (Premium Wooden)', category: 'packaging', unit: 'pieces', baseQuantity: 100, reorderLevel: 50, costPerUnit: 120, supplier: 'PackRight Ltd' },
  { name: 'Tissue Paper (Acid-Free)', category: 'packaging', unit: 'sheets', baseQuantity: 1000, reorderLevel: 400, costPerUnit: 5, supplier: 'PackRight Ltd' },
  { name: 'Shirt Boxes', category: 'packaging', unit: 'pieces', baseQuantity: 150, reorderLevel: 75, costPerUnit: 65, supplier: 'BoxMart Kenya' },
  { name: 'Collar Stays', category: 'packaging', unit: 'pieces', baseQuantity: 500, reorderLevel: 200, costPerUnit: 8, supplier: 'PackRight Ltd' },
  { name: 'Laundry Tags', category: 'packaging', unit: 'rolls', baseQuantity: 20, reorderLevel: 10, costPerUnit: 350, supplier: 'LabelPrint Kenya' },

  // Equipment parts & supplies
  { name: 'Steam Iron Parts Kit', category: 'equipment', unit: 'kits', baseQuantity: 5, reorderLevel: 2, costPerUnit: 3500, supplier: 'Equipment Plus' },
  { name: 'Press Pad Covers', category: 'equipment', unit: 'pieces', baseQuantity: 10, reorderLevel: 5, costPerUnit: 2800, supplier: 'Equipment Plus' },
  { name: 'Lint Filters', category: 'equipment', unit: 'pieces', baseQuantity: 20, reorderLevel: 10, costPerUnit: 850, supplier: 'Equipment Plus' },
  { name: 'Dryer Belts', category: 'equipment', unit: 'pieces', baseQuantity: 4, reorderLevel: 2, costPerUnit: 4500, supplier: 'Equipment Plus' },
  { name: 'Steam Boiler Descaler', category: 'equipment', unit: 'liters', baseQuantity: 10, reorderLevel: 5, costPerUnit: 780, supplier: 'ChemTech Supplies' },

  // Chemicals
  { name: 'Perchloroethylene', category: 'chemicals', unit: 'liters', baseQuantity: 100, reorderLevel: 40, costPerUnit: 650, supplier: 'DryChem Industries' },
  { name: 'Sizing Spray', category: 'chemicals', unit: 'cans', baseQuantity: 30, reorderLevel: 15, costPerUnit: 380, supplier: 'CleanPro Kenya' },
  { name: 'Anti-Static Spray', category: 'chemicals', unit: 'cans', baseQuantity: 20, reorderLevel: 10, costPerUnit: 420, supplier: 'CleanPro Kenya' },
  { name: 'Water Repellent Spray', category: 'chemicals', unit: 'cans', baseQuantity: 15, reorderLevel: 8, costPerUnit: 780, supplier: 'Premium Leather Care' },
  { name: 'Odor Neutralizer', category: 'chemicals', unit: 'liters', baseQuantity: 20, reorderLevel: 10, costPerUnit: 550, supplier: 'CleanPro Kenya' },
];

// Main branches that hold inventory (processing facilities)
const mainBranches = [
  'VILLAGE_MARKET',
  'WESTGATE',
  'DENNIS_PRITT',
  'MUTHAIGA',
  'ADLIFE',
  'NAIVAS_KILIMANI',
  'HURLINGHAM',
  'LAVINGTON',
  'WATERFRONT_KAREN',
  'KILELESHWA',
];

function randomVariation(base: number, variance: number = 0.3): number {
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.max(1, Math.round(base * factor));
}

function shouldBeLowStock(): boolean {
  // 15% chance of being low stock
  return Math.random() < 0.15;
}

function getRandomDaysAgo(maxDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * maxDays));
  return date;
}

async function seedInventory() {
  console.log('📦 Seeding inventory data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;

    for (const branchId of mainBranches) {
      console.log(`\n📍 Branch: ${branchId}`);

      for (const item of commonInventoryItems) {
        const itemId = `${branchId}-${item.name.replace(/\s+/g, '-').toUpperCase().substring(0, 30)}`;
        const inventoryRef = db.collection('inventory').doc(itemId);
        const existingDoc = await inventoryRef.get();

        const now = Timestamp.now();
        const isLowStock = shouldBeLowStock();

        // Calculate quantity - either low stock or normal variation
        let quantity: number;
        if (isLowStock) {
          // Low stock: between 0 and reorder level
          quantity = Math.floor(Math.random() * item.reorderLevel);
        } else {
          // Normal stock with variation
          quantity = randomVariation(item.baseQuantity);
        }

        const inventoryData = {
          itemId,
          branchId,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity,
          reorderLevel: item.reorderLevel,
          costPerUnit: item.costPerUnit,
          supplier: item.supplier || null,
          lastRestocked: Timestamp.fromDate(getRandomDaysAgo(30)),
          createdAt: existingDoc.exists ? existingDoc.data()?.createdAt : now,
          updatedAt: now,
        };

        if (existingDoc.exists) {
          await inventoryRef.update(inventoryData);
          const stockStatus = quantity <= item.reorderLevel ? '⚠️ LOW' : '✓';
          console.log(`  ${stockStatus} Updated: ${item.name} (${quantity} ${item.unit})`);
          updated++;
        } else {
          await inventoryRef.set(inventoryData);
          const stockStatus = quantity <= item.reorderLevel ? '⚠️ LOW' : '✓';
          console.log(`  ${stockStatus} Created: ${item.name} (${quantity} ${item.unit})`);
          created++;
        }
      }
    }

    console.log(`\n✅ Inventory seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} inventory items`);
    console.log(`   - Updated: ${updated} inventory items`);
    console.log(`   - Total: ${created + updated} items across ${mainBranches.length} branches`);
    console.log(`   - Items per branch: ${commonInventoryItems.length}`);

  } catch (error) {
    console.error('\n❌ Error seeding inventory:', error);
    process.exit(1);
  }
}

seedInventory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
