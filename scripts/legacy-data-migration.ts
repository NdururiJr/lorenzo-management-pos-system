/**
 * Legacy Data Migration Script
 *
 * FR-016: Legacy Data Migration
 *
 * Migrates customer and order data from external legacy systems (Excel, CSV)
 * into the Lorenzo Dry Cleaners Firebase system.
 *
 * Features:
 * - Validates all data before migration
 * - Generates detailed error reports
 * - Supports dry-run mode for testing
 * - Creates audit trail of migrated records
 * - Handles duplicate detection
 * - Provides rollback information
 *
 * Usage:
 *   npx tsx scripts/legacy-data-migration.ts --input ./legacy-data --dry-run
 *   npx tsx scripts/legacy-data-migration.ts --input ./legacy-data
 *
 * Expected Input Files (in input directory):
 *   - customers.json or customers.csv
 *   - orders.json or orders.csv
 *   - garments.json or garments.csv (optional)
 *   - transactions.json or transactions.csv (optional)
 *
 * @module scripts/legacy-data-migration
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, WriteBatch } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import {
  validateLegacyCustomers,
  validateLegacyOrders,
  validateLegacyGarments,
  validateLegacyTransactions,
  type LegacyCustomer,
  type LegacyOrder,
  type LegacyGarment,
  type LegacyTransaction,
  type ValidationResult,
} from '../lib/validations/legacy-data';

// ============================================
// CONFIGURATION
// ============================================

interface MigrationConfig {
  inputDir: string;
  dryRun: boolean;
  batchSize: number;
  defaultBranchId: string;
  skipDuplicates: boolean;
}

// Parse command line arguments
function parseArgs(): MigrationConfig {
  const args = process.argv.slice(2);
  const config: MigrationConfig = {
    inputDir: './legacy-data',
    dryRun: false,
    batchSize: 500,
    defaultBranchId: 'kilimani', // Default to Kilimani branch
    skipDuplicates: true,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        config.inputDir = args[++i];
        break;
      case '--dry-run':
      case '-d':
        config.dryRun = true;
        break;
      case '--batch-size':
        config.batchSize = parseInt(args[++i], 10);
        break;
      case '--branch':
      case '-b':
        config.defaultBranchId = args[++i];
        break;
      case '--force-duplicates':
        config.skipDuplicates = false;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }

  return config;
}

function printUsage(): void {
  console.log(`
Legacy Data Migration Script

Usage:
  npx tsx scripts/legacy-data-migration.ts [options]

Options:
  --input, -i <dir>      Input directory containing legacy data files (default: ./legacy-data)
  --dry-run, -d          Validate only, don't actually import data
  --batch-size <n>       Number of records per batch (default: 500)
  --branch, -b <id>      Default branch ID for orders (default: kilimani)
  --force-duplicates     Don't skip duplicate records
  --help, -h             Show this help message

Expected Input Files:
  - customers.json       Customer records
  - orders.json          Order records
  - garments.json        Garment/item records (optional)
  - transactions.json    Payment records (optional)

Example:
  npx tsx scripts/legacy-data-migration.ts --input ./legacy-data --dry-run
  npx tsx scripts/legacy-data-migration.ts --input ./legacy-data
`);
}

// ============================================
// FIREBASE INITIALIZATION
// ============================================

let db: FirebaseFirestore.Firestore;

function initializeFirebase(): void {
  // Load service account from environment or file
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), 'lorenzo-dry-cleaners-7302f-firebase-adminsdk-fbsvc-f2d2378f82.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Service account file not found: ${serviceAccountPath}`);
    console.error('   Set GOOGLE_APPLICATION_CREDENTIALS environment variable or place the file in the project root.');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;

  const app = initializeApp({
    credential: cert(serviceAccount),
  }, 'migration');

  db = getFirestore(app);
  console.log('✅ Firebase initialized');
}

// ============================================
// FILE LOADING
// ============================================

interface LoadedData {
  customers: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  garments: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
}

function loadInputFiles(inputDir: string): LoadedData {
  const data: LoadedData = {
    customers: [],
    orders: [],
    garments: [],
    transactions: [],
  };

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  const fileTypes: (keyof LoadedData)[] = ['customers', 'orders', 'garments', 'transactions'];

  for (const fileType of fileTypes) {
    const jsonPath = path.join(inputDir, `${fileType}.json`);
    const csvPath = path.join(inputDir, `${fileType}.csv`);

    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, 'utf8');
      data[fileType] = JSON.parse(content);
      console.log(`  📄 Loaded ${data[fileType].length} ${fileType} from JSON`);
    } else if (fs.existsSync(csvPath)) {
      data[fileType] = parseCSV(csvPath);
      console.log(`  📄 Loaded ${data[fileType].length} ${fileType} from CSV`);
    } else {
      console.log(`  ⚪ No ${fileType} file found`);
    }
  }

  return data;
}

/**
 * Simple CSV parser (for basic CSV files)
 * For complex CSVs, consider using a library like csv-parse
 */
function parseCSV(filePath: string): Record<string, unknown>[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter((line) => line.trim());

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const records: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, unknown> = {};

    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = values[j]?.trim().replace(/^"|"$/g, '') || '';
    }

    records.push(record);
  }

  return records;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

interface MigrationResult {
  collection: string;
  imported: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

/**
 * Checks for existing customer by phone number
 */
async function checkExistingCustomer(phone: string): Promise<string | null> {
  const snapshot = await db.collection('customers')
    .where('phone', '==', phone)
    .limit(1)
    .get();

  return snapshot.empty ? null : snapshot.docs[0].id;
}

/**
 * Migrates validated customers to Firestore
 */
async function migrateCustomers(
  customers: LegacyCustomer[],
  config: MigrationConfig
): Promise<MigrationResult> {
  const result: MigrationResult = {
    collection: 'customers',
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Map to store phone -> customerId for order linking
  const customerMap = new Map<string, string>();

  for (let i = 0; i < customers.length; i += config.batchSize) {
    const batch: WriteBatch = config.dryRun ? null as any : db.batch();
    const batchCustomers = customers.slice(i, i + config.batchSize);

    for (const customer of batchCustomers) {
      try {
        // Check for duplicates
        if (config.skipDuplicates) {
          const existingId = await checkExistingCustomer(customer.phone);
          if (existingId) {
            customerMap.set(customer.phone, existingId);
            result.skipped++;
            continue;
          }
        }

        // Generate customer ID
        const customerId = `CUST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        // Build customer document
        const customerDoc = {
          customerId,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          addresses: customer.address
            ? [{
                label: customer.addressLabel || 'Home',
                address: customer.address,
                source: 'manual' as const,
              }]
            : [],
          preferences: {
            notifications: customer.notificationsEnabled ?? true,
            language: customer.language || 'en',
          },
          createdAt: Timestamp.fromDate(customer.createdAt as Date),
          orderCount: customer.totalOrders || 0,
          totalSpent: customer.totalSpent || 0,
          // Migration metadata
          _migration: {
            source: 'legacy',
            legacyId: customer.legacyId,
            migratedAt: Timestamp.now(),
          },
        };

        if (!config.dryRun) {
          const docRef = db.collection('customers').doc(customerId);
          batch.set(docRef, customerDoc);
        }

        customerMap.set(customer.phone, customerId);
        result.imported++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: i + result.imported + result.skipped + result.failed,
          error: error.message,
        });
      }
    }

    if (!config.dryRun && result.imported > 0) {
      await batch.commit();
    }

    // Progress indicator
    const progress = Math.min(100, Math.round(((i + batchCustomers.length) / customers.length) * 100));
    process.stdout.write(`\r  📥 customers: ${i + batchCustomers.length}/${customers.length} (${progress}%)`);
  }

  console.log('');

  // Save customer map for order migration
  const mapPath = path.join(config.inputDir, '.customer-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(Object.fromEntries(customerMap), null, 2));

  return result;
}

/**
 * Generates a unique order ID
 */
function generateOrderId(branchId: string, date: Date): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${branchId.toUpperCase().slice(0, 3)}-${dateStr}-${random}`;
}

/**
 * Migrates validated orders to Firestore
 */
async function migrateOrders(
  orders: LegacyOrder[],
  garments: LegacyGarment[],
  config: MigrationConfig
): Promise<MigrationResult> {
  const result: MigrationResult = {
    collection: 'orders',
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Load customer map
  const mapPath = path.join(config.inputDir, '.customer-map.json');
  const customerMap = new Map<string, string>(
    fs.existsSync(mapPath)
      ? Object.entries(JSON.parse(fs.readFileSync(mapPath, 'utf8')))
      : []
  );

  // Group garments by legacy order ID
  const garmentsByOrder = new Map<string, LegacyGarment[]>();
  for (const garment of garments) {
    const existing = garmentsByOrder.get(garment.legacyOrderId) || [];
    existing.push(garment);
    garmentsByOrder.set(garment.legacyOrderId, existing);
  }

  // Map to store legacyOrderId -> new orderId
  const orderMap = new Map<string, string>();

  for (let i = 0; i < orders.length; i += config.batchSize) {
    const batch: WriteBatch = config.dryRun ? null as any : db.batch();
    const batchOrders = orders.slice(i, i + config.batchSize);

    for (const order of batchOrders) {
      try {
        // Resolve customer ID
        let customerId = order.customerId;
        if (!customerId && order.customerPhone) {
          customerId = customerMap.get(order.customerPhone);
        }

        if (!customerId) {
          result.failed++;
          result.errors.push({
            row: i + result.imported + result.skipped + result.failed,
            error: `Cannot find customer for order ${order.legacyOrderId}`,
          });
          continue;
        }

        // Resolve branch ID
        const branchId = order.branchId || config.defaultBranchId;

        // Generate order ID
        const orderId = generateOrderId(branchId, order.createdAt as Date);

        // Build garments array
        const orderGarments = garmentsByOrder.get(order.legacyOrderId) || [];
        const garmentsArray = orderGarments.map((g, idx) => ({
          garmentId: `${orderId}-G${String(idx + 1).padStart(2, '0')}`,
          type: g.type,
          color: g.color || 'Not specified',
          brand: g.brand,
          services: Array.isArray(g.services) ? g.services : [g.services],
          price: g.price || 0,
          status: order.status as string,
          specialInstructions: g.specialInstructions,
          initialInspectionNotes: g.damageNotes,
        }));

        // Build order document
        const orderDoc = {
          orderId,
          customerId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          branchId,
          status: order.status,
          garments: garmentsArray,
          totalAmount: order.totalAmount || 0,
          paidAmount: order.paidAmount || 0,
          paymentStatus: order.paymentStatus || 'pending',
          paymentMethod: order.paymentMethod,
          estimatedCompletion: Timestamp.fromDate(
            new Date((order.createdAt as Date).getTime() + 24 * 60 * 60 * 1000)
          ),
          actualCompletion: order.completedAt
            ? Timestamp.fromDate(order.completedAt as Date)
            : null,
          createdAt: Timestamp.fromDate(order.createdAt as Date),
          createdBy: 'migration',
          collectionMethod: order.collectionMethod || 'dropped_off',
          returnMethod: order.returnMethod || 'customer_collects',
          deliveryAddress: order.deliveryAddress
            ? {
                label: 'Delivery',
                address: order.deliveryAddress,
              }
            : undefined,
          specialInstructions: order.specialInstructions,
          // Migration metadata
          _migration: {
            source: 'legacy',
            legacyOrderId: order.legacyOrderId,
            migratedAt: Timestamp.now(),
          },
        };

        if (!config.dryRun) {
          const docRef = db.collection('orders').doc(orderId);
          batch.set(docRef, orderDoc);
        }

        orderMap.set(order.legacyOrderId, orderId);
        result.imported++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: i + result.imported + result.skipped + result.failed,
          error: error.message,
        });
      }
    }

    if (!config.dryRun && result.imported > 0) {
      await batch.commit();
    }

    // Progress indicator
    const progress = Math.min(100, Math.round(((i + batchOrders.length) / orders.length) * 100));
    process.stdout.write(`\r  📥 orders: ${i + batchOrders.length}/${orders.length} (${progress}%)`);
  }

  console.log('');

  // Save order map for transaction migration
  const orderMapPath = path.join(config.inputDir, '.order-map.json');
  fs.writeFileSync(orderMapPath, JSON.stringify(Object.fromEntries(orderMap), null, 2));

  return result;
}

/**
 * Migrates validated transactions to Firestore
 */
async function migrateTransactions(
  transactions: LegacyTransaction[],
  config: MigrationConfig
): Promise<MigrationResult> {
  const result: MigrationResult = {
    collection: 'transactions',
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Load order map
  const mapPath = path.join(config.inputDir, '.order-map.json');
  const orderMap = new Map<string, string>(
    fs.existsSync(mapPath)
      ? Object.entries(JSON.parse(fs.readFileSync(mapPath, 'utf8')))
      : []
  );

  for (let i = 0; i < transactions.length; i += config.batchSize) {
    const batch: WriteBatch = config.dryRun ? null as any : db.batch();
    const batchTxns = transactions.slice(i, i + config.batchSize);

    for (const txn of batchTxns) {
      try {
        // Resolve order ID
        const orderId = orderMap.get(txn.legacyOrderId);
        if (!orderId) {
          result.skipped++;
          continue;
        }

        // Generate transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        // Build transaction document
        const txnDoc = {
          transactionId,
          orderId,
          customerId: '', // Will need to look up from order if needed
          branchId: config.defaultBranchId,
          amount: txn.amount,
          method: txn.method,
          status: txn.status,
          pesapalRef: txn.reference,
          timestamp: Timestamp.fromDate(txn.timestamp as Date),
          processedBy: 'migration',
          // Migration metadata
          _migration: {
            source: 'legacy',
            migratedAt: Timestamp.now(),
          },
        };

        if (!config.dryRun) {
          const docRef = db.collection('transactions').doc(transactionId);
          batch.set(docRef, txnDoc);
        }

        result.imported++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: i + result.imported + result.skipped + result.failed,
          error: error.message,
        });
      }
    }

    if (!config.dryRun && result.imported > 0) {
      await batch.commit();
    }

    // Progress indicator
    const progress = Math.min(100, Math.round(((i + batchTxns.length) / transactions.length) * 100));
    process.stdout.write(`\r  📥 transactions: ${i + batchTxns.length}/${transactions.length} (${progress}%)`);
  }

  console.log('');

  return result;
}

// ============================================
// REPORTING
// ============================================

interface MigrationReport {
  timestamp: string;
  config: MigrationConfig;
  validation: {
    customers: ValidationResult<LegacyCustomer>['summary'];
    orders: ValidationResult<LegacyOrder>['summary'];
    garments: ValidationResult<LegacyGarment>['summary'];
    transactions: ValidationResult<LegacyTransaction>['summary'];
  };
  migration: MigrationResult[];
  summary: {
    totalRecords: number;
    totalImported: number;
    totalSkipped: number;
    totalFailed: number;
    duration: number;
  };
}

function generateReport(
  config: MigrationConfig,
  validationResults: MigrationReport['validation'],
  migrationResults: MigrationResult[],
  startTime: number
): MigrationReport {
  const totalRecords =
    validationResults.customers.total +
    validationResults.orders.total +
    validationResults.garments.total +
    validationResults.transactions.total;

  const totalImported = migrationResults.reduce((sum, r) => sum + r.imported, 0);
  const totalSkipped = migrationResults.reduce((sum, r) => sum + r.skipped, 0);
  const totalFailed = migrationResults.reduce((sum, r) => sum + r.failed, 0);

  return {
    timestamp: new Date().toISOString(),
    config,
    validation: validationResults,
    migration: migrationResults,
    summary: {
      totalRecords,
      totalImported,
      totalSkipped,
      totalFailed,
      duration: Date.now() - startTime,
    },
  };
}

function printReport(report: MigrationReport): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                     MIGRATION REPORT');
  console.log('═══════════════════════════════════════════════════════════════');

  console.log('\n📊 VALIDATION SUMMARY');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`  Customers:    ${report.validation.customers.valid} valid, ${report.validation.customers.invalid} invalid`);
  console.log(`  Orders:       ${report.validation.orders.valid} valid, ${report.validation.orders.invalid} invalid`);
  console.log(`  Garments:     ${report.validation.garments.valid} valid, ${report.validation.garments.invalid} invalid`);
  console.log(`  Transactions: ${report.validation.transactions.valid} valid, ${report.validation.transactions.invalid} invalid`);

  if (report.config.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No data was actually imported');
  } else {
    console.log('\n📥 MIGRATION SUMMARY');
    console.log('─────────────────────────────────────────────────────────────');
    for (const result of report.migration) {
      console.log(`  ${result.collection}:`);
      console.log(`    Imported: ${result.imported}`);
      console.log(`    Skipped:  ${result.skipped}`);
      console.log(`    Failed:   ${result.failed}`);
    }
  }

  console.log('\n📈 TOTALS');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`  Total Records:  ${report.summary.totalRecords}`);
  console.log(`  Total Imported: ${report.summary.totalImported}`);
  console.log(`  Total Skipped:  ${report.summary.totalSkipped}`);
  console.log(`  Total Failed:   ${report.summary.totalFailed}`);
  console.log(`  Duration:       ${(report.summary.duration / 1000).toFixed(2)}s`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// ============================================
// MAIN
// ============================================

async function main(): Promise<void> {
  const startTime = Date.now();
  const config = parseArgs();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           Legacy Data Migration - FR-016');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nInput Directory: ${config.inputDir}`);
  console.log(`Dry Run: ${config.dryRun ? 'Yes (validation only)' : 'No (will import)'}`);
  console.log(`Default Branch: ${config.defaultBranchId}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Initialize Firebase
  if (!config.dryRun) {
    initializeFirebase();
  }

  // Load input files
  console.log('📂 Loading input files...');
  const data = loadInputFiles(config.inputDir);

  // Validate data
  console.log('\n🔍 Validating data...\n');

  const customerValidation = validateLegacyCustomers(data.customers);
  console.log(`  Customers: ${customerValidation.summary.valid} valid, ${customerValidation.summary.invalid} invalid`);

  const orderValidation = validateLegacyOrders(data.orders);
  console.log(`  Orders: ${orderValidation.summary.valid} valid, ${orderValidation.summary.invalid} invalid`);

  const garmentValidation = validateLegacyGarments(data.garments);
  console.log(`  Garments: ${garmentValidation.summary.valid} valid, ${garmentValidation.summary.invalid} invalid`);

  const transactionValidation = validateLegacyTransactions(data.transactions);
  console.log(`  Transactions: ${transactionValidation.summary.valid} valid, ${transactionValidation.summary.invalid} invalid`);

  // Write validation errors to file
  const validationErrorsPath = path.join(config.inputDir, 'validation-errors.json');
  fs.writeFileSync(validationErrorsPath, JSON.stringify({
    customers: customerValidation.invalid,
    orders: orderValidation.invalid,
    garments: garmentValidation.invalid,
    transactions: transactionValidation.invalid,
  }, null, 2));
  console.log(`\n  📄 Validation errors written to: ${validationErrorsPath}`);

  // Migration
  const migrationResults: MigrationResult[] = [];

  if (!config.dryRun) {
    console.log('\n📥 Migrating data...\n');

    // Migrate customers first
    if (customerValidation.valid.length > 0) {
      const customerResult = await migrateCustomers(customerValidation.valid, config);
      migrationResults.push(customerResult);
    }

    // Then orders (which need customer references)
    if (orderValidation.valid.length > 0) {
      const orderResult = await migrateOrders(
        orderValidation.valid,
        garmentValidation.valid,
        config
      );
      migrationResults.push(orderResult);
    }

    // Finally transactions (which need order references)
    if (transactionValidation.valid.length > 0) {
      const txnResult = await migrateTransactions(transactionValidation.valid, config);
      migrationResults.push(txnResult);
    }
  }

  // Generate and print report
  const report = generateReport(
    config,
    {
      customers: customerValidation.summary,
      orders: orderValidation.summary,
      garments: garmentValidation.summary,
      transactions: transactionValidation.summary,
    },
    migrationResults,
    startTime
  );

  printReport(report);

  // Save full report
  const reportPath = path.join(config.inputDir, 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}\n`);

  if (config.dryRun) {
    console.log('✅ Validation complete! Run without --dry-run to perform migration.\n');
  } else {
    console.log('✅ Migration complete!\n');
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
