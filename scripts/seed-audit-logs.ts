/**
 * Seed Audit Logs Script
 *
 * Populates audit log data for Director Dashboard compliance tracking
 * Creates system activity logs across various action types
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

type AuditAction =
  | 'login'
  | 'logout'
  | 'order_create'
  | 'order_update'
  | 'order_status_change'
  | 'payment_received'
  | 'payment_refund'
  | 'customer_create'
  | 'customer_update'
  | 'staff_create'
  | 'staff_update'
  | 'permission_change'
  | 'price_update'
  | 'inventory_adjust'
  | 'settings_change'
  | 'report_generate'
  | 'data_export';

type ResourceType = 'order' | 'customer' | 'user' | 'payment' | 'inventory' | 'settings' | 'report' | 'system';

interface AuditLog {
  logId: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  branchId: string;
  branchName: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  timestamp: Timestamp;
}

// Users who generate audit logs
const users = [
  { id: 'director-001', name: 'Lawrence Kariuki', role: 'director', email: 'lawrence@lorenzo.com', branch: 'HQ' },
  { id: 'gm-001', name: 'Grace Muthoni', role: 'general_manager', email: 'grace@lorenzo.com', branch: 'HQ' },
  { id: 'sm-vm-001', name: 'Michael Ouma', role: 'store_manager', email: 'michael@lorenzo.com', branch: 'VILLAGE_MARKET' },
  { id: 'sm-wg-001', name: 'Sarah Wanjiku', role: 'store_manager', email: 'sarah@lorenzo.com', branch: 'WESTGATE' },
  { id: 'sm-dp-001', name: 'Peter Njoroge', role: 'store_manager', email: 'peter@lorenzo.com', branch: 'DENNIS_PRITT' },
  { id: 'fd-vm-001', name: 'Elizabeth Akinyi', role: 'front_desk', email: 'elizabeth@lorenzo.com', branch: 'VILLAGE_MARKET' },
  { id: 'fd-wg-001', name: 'James Mutua', role: 'front_desk', email: 'james@lorenzo.com', branch: 'WESTGATE' },
  { id: 'fd-dp-001', name: 'Nancy Moraa', role: 'front_desk', email: 'nancy@lorenzo.com', branch: 'DENNIS_PRITT' },
  { id: 'ws-vm-001', name: 'David Kipchoge', role: 'workstation_staff', email: 'david@lorenzo.com', branch: 'VILLAGE_MARKET' },
  { id: 'ws-wg-001', name: 'Faith Wambui', role: 'workstation_staff', email: 'faith@lorenzo.com', branch: 'WESTGATE' },
];

// Branch names
const branchNames: Record<string, string> = {
  'HQ': 'Headquarters',
  'VILLAGE_MARKET': 'Village Market',
  'WESTGATE': 'Westgate',
  'DENNIS_PRITT': 'Dennis Pritt',
  'MUTHAIGA': 'Muthaiga',
  'NAIVAS_KILIMANI': 'Naivas Kilimani',
};

// IP addresses for realism
const ipAddresses = [
  '197.232.100.45',
  '41.89.225.178',
  '105.163.42.89',
  '197.248.156.23',
  '41.90.65.112',
  '105.29.89.201',
  '197.156.78.34',
  '41.212.45.167',
];

// User agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 13) Chrome/119.0.0.0 Mobile',
  'Lorenzo POS Terminal/2.1.0',
];

// Action configurations with weights and details
const actionConfigs: Record<AuditAction, { weight: number; resourceType: ResourceType; detailGenerator: () => Record<string, any> }> = {
  login: {
    weight: 0.15,
    resourceType: 'system',
    detailGenerator: () => ({ method: 'email_password', success: true }),
  },
  logout: {
    weight: 0.10,
    resourceType: 'system',
    detailGenerator: () => ({ sessionDuration: `${Math.floor(Math.random() * 480) + 30} minutes` }),
  },
  order_create: {
    weight: 0.20,
    resourceType: 'order',
    detailGenerator: () => ({
      garmentCount: Math.floor(Math.random() * 8) + 1,
      totalAmount: Math.floor(Math.random() * 5000) + 500,
      paymentMethod: getRandomElement(['cash', 'mpesa', 'card']),
    }),
  },
  order_update: {
    weight: 0.08,
    resourceType: 'order',
    detailGenerator: () => ({
      field: getRandomElement(['notes', 'deadline', 'garments', 'customer']),
      changeType: 'modification',
    }),
  },
  order_status_change: {
    weight: 0.15,
    resourceType: 'order',
    detailGenerator: () => ({
      fromStatus: getRandomElement(['received', 'washing', 'drying', 'ironing']),
      toStatus: getRandomElement(['drying', 'ironing', 'quality_check', 'queued_for_delivery']),
    }),
  },
  payment_received: {
    weight: 0.12,
    resourceType: 'payment',
    detailGenerator: () => ({
      amount: Math.floor(Math.random() * 5000) + 500,
      method: getRandomElement(['mpesa', 'card']), // Cashless system - no cash
      transactionRef: `TXN${Date.now().toString().slice(-8)}`,
    }),
  },
  payment_refund: {
    weight: 0.02,
    resourceType: 'payment',
    detailGenerator: () => ({
      amount: Math.floor(Math.random() * 1000) + 100,
      reason: getRandomElement(['damaged item', 'customer complaint', 'overcharge correction']),
    }),
  },
  customer_create: {
    weight: 0.05,
    resourceType: 'customer',
    detailGenerator: () => ({
      source: getRandomElement(['walk-in', 'referral', 'online', 'corporate']),
    }),
  },
  customer_update: {
    weight: 0.03,
    resourceType: 'customer',
    detailGenerator: () => ({
      field: getRandomElement(['phone', 'email', 'address', 'preferences']),
    }),
  },
  staff_create: {
    weight: 0.02,
    resourceType: 'user',
    detailGenerator: () => ({
      role: getRandomElement(['front_desk', 'workstation_staff', 'driver']),
    }),
  },
  staff_update: {
    weight: 0.02,
    resourceType: 'user',
    detailGenerator: () => ({
      field: getRandomElement(['role', 'branch', 'permissions', 'status']),
    }),
  },
  permission_change: {
    weight: 0.01,
    resourceType: 'user',
    detailGenerator: () => ({
      permissionType: getRandomElement(['role_upgrade', 'branch_access', 'feature_access']),
      approver: 'director',
    }),
  },
  price_update: {
    weight: 0.01,
    resourceType: 'settings',
    detailGenerator: () => ({
      category: getRandomElement(['dry_cleaning', 'laundry', 'specialty']),
      changePercent: `${Math.random() < 0.5 ? '+' : '-'}${Math.floor(Math.random() * 15) + 1}%`,
    }),
  },
  inventory_adjust: {
    weight: 0.02,
    resourceType: 'inventory',
    detailGenerator: () => ({
      item: getRandomElement(['detergent', 'hangers', 'bags', 'chemicals']),
      adjustment: Math.floor(Math.random() * 50) - 25,
      reason: getRandomElement(['restock', 'usage', 'damage', 'audit']),
    }),
  },
  settings_change: {
    weight: 0.01,
    resourceType: 'settings',
    detailGenerator: () => ({
      setting: getRandomElement(['operating_hours', 'notification_templates', 'branch_config']),
    }),
  },
  report_generate: {
    weight: 0.03,
    resourceType: 'report',
    detailGenerator: () => ({
      reportType: getRandomElement(['daily_sales', 'monthly_revenue', 'staff_performance', 'inventory']),
      format: getRandomElement(['pdf', 'excel', 'csv']),
    }),
  },
  data_export: {
    weight: 0.01,
    resourceType: 'report',
    detailGenerator: () => ({
      exportType: getRandomElement(['customers', 'orders', 'transactions']),
      recordCount: Math.floor(Math.random() * 500) + 50,
    }),
  },
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeightedAction(): AuditAction {
  const random = Math.random();
  let cumulative = 0;
  for (const [action, config] of Object.entries(actionConfigs)) {
    cumulative += config.weight;
    if (random < cumulative) {
      return action as AuditAction;
    }
  }
  return 'order_create';
}

function getRandomTimestamp(daysBack: number): Date {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * daysBack));
  pastDate.setHours(Math.floor(Math.random() * 14) + 7); // 7 AM to 9 PM
  pastDate.setMinutes(Math.floor(Math.random() * 60));
  pastDate.setSeconds(Math.floor(Math.random() * 60));
  return pastDate;
}

function generateLogId(index: number): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `AUDIT-${dateStr}-${String(index).padStart(6, '0')}`;
}

function generateResourceId(resourceType: ResourceType): string {
  const prefix = resourceType.substring(0, 3).toUpperCase();
  return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
}

async function seedAuditLogs() {
  console.log('📝 Seeding audit log data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;

    // Target: 100 audit log entries over 30 days
    const targetLogs = 100;
    const daysBack = 30;

    const actionCounts: Record<AuditAction, number> = {} as Record<AuditAction, number>;
    for (const action of Object.keys(actionConfigs)) {
      actionCounts[action as AuditAction] = 0;
    }

    console.log(`Creating ${targetLogs} audit log entries spanning ${daysBack} days...\n`);

    for (let i = 1; i <= targetLogs; i++) {
      const logId = generateLogId(i);
      const logRef = db.collection('auditLogs').doc(logId);
      const existingDoc = await logRef.get();

      const user = getRandomElement(users);
      const action = pickWeightedAction();
      const config = actionConfigs[action];
      const timestamp = Timestamp.fromDate(getRandomTimestamp(daysBack));

      actionCounts[action]++;

      const logData: AuditLog = {
        logId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userEmail: user.email,
        branchId: user.branch,
        branchName: branchNames[user.branch] || user.branch,
        action,
        resourceType: config.resourceType,
        resourceId: generateResourceId(config.resourceType),
        details: config.detailGenerator(),
        ipAddress: getRandomElement(ipAddresses),
        userAgent: getRandomElement(userAgents),
        timestamp,
      };

      if (existingDoc.exists) {
        await logRef.update(logData as any);
        updated++;
      } else {
        await logRef.set(logData);
        created++;
      }

      // Progress indicator
      if (i % 20 === 0 || i === targetLogs) {
        console.log(`  ✓ Created ${i}/${targetLogs} audit logs`);
      }
    }

    console.log(`\n✅ Audit logs seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} audit log entries`);
    console.log(`   - Updated: ${updated} audit log entries`);
    console.log(`   - Total: ${created + updated} audit log entries`);
    console.log(`   - Time span: Last ${daysBack} days`);
    console.log(`\n📋 Action Distribution:`);

    // Sort actions by count
    const sortedActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 0);

    for (const [action, count] of sortedActions) {
      console.log(`   - ${action}: ${count}`);
    }

  } catch (error) {
    console.error('\n❌ Error seeding audit logs:', error);
    process.exit(1);
  }
}

seedAuditLogs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
