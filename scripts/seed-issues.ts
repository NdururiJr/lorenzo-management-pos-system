/**
 * Seed Issues Script
 *
 * Populates sample operational issues for GM Dashboard's Urgent Issues widget
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

type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type IssueCategory = 'equipment' | 'customer_complaint' | 'staff' | 'inventory' | 'order' | 'delivery' | 'payment' | 'other';

interface IssueData {
  branchId: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  reportedByName: string;
  assignedToName?: string;
  daysAgo: number;
}

// Sample issues for demonstration
const sampleIssues: IssueData[] = [
  // Critical/High Priority Open Issues
  {
    branchId: 'VILLAGE_MARKET',
    title: 'Washer 2 making unusual noise',
    description: 'Washer 2 is producing a grinding noise during the spin cycle. Needs immediate inspection to prevent damage.',
    category: 'equipment',
    priority: 'high',
    status: 'open',
    reportedByName: 'Peter Mwangi',
    daysAgo: 0,
  },
  {
    branchId: 'WESTGATE',
    title: 'Customer complaint - Missing item',
    description: 'Customer James Kamau claims his silk tie (Order ORD-WEST-20250107-0042) was not returned with his order.',
    category: 'customer_complaint',
    priority: 'high',
    status: 'in_progress',
    reportedByName: 'Sarah Wanjiku',
    assignedToName: 'Mary Njeri',
    daysAgo: 1,
  },
  {
    branchId: 'NAIVAS_KILIMANI',
    title: 'Dryer 2 overheating',
    description: 'Dryer 2 temperature exceeding normal levels. Currently taken offline for safety.',
    category: 'equipment',
    priority: 'critical',
    status: 'open',
    reportedByName: 'John Ochieng',
    daysAgo: 0,
  },
  {
    branchId: 'MUTHAIGA',
    title: 'Steam Press 2 not heating',
    description: 'Steam press not reaching operating temperature. Affecting pressing capacity.',
    category: 'equipment',
    priority: 'high',
    status: 'in_progress',
    reportedByName: 'Grace Akinyi',
    assignedToName: 'Technical Team',
    daysAgo: 2,
  },

  // Medium Priority Issues
  {
    branchId: 'DENNIS_PRITT',
    title: 'Low detergent stock',
    description: 'Industrial detergent stock running low. Approximately 3 days supply remaining.',
    category: 'inventory',
    priority: 'medium',
    status: 'open',
    reportedByName: 'Faith Muthoni',
    daysAgo: 1,
  },
  {
    branchId: 'LAVINGTON',
    title: 'Delivery delay - Route congestion',
    description: 'Multiple deliveries delayed due to traffic. 4 orders affected in Karen/Langata area.',
    category: 'delivery',
    priority: 'medium',
    status: 'in_progress',
    reportedByName: 'David Kipchoge',
    assignedToName: 'Driver Team Lead',
    daysAgo: 0,
  },
  {
    branchId: 'HURLINGHAM',
    title: 'Staff scheduling conflict',
    description: 'Two staff members scheduled off during peak hours on Saturday. Need coverage.',
    category: 'staff',
    priority: 'medium',
    status: 'open',
    reportedByName: 'Ann Wairimu',
    daysAgo: 2,
  },
  {
    branchId: 'WATERFRONT_KAREN',
    title: 'Payment terminal intermittent',
    description: 'Card payment terminal occasionally times out. M-Pesa still working.',
    category: 'payment',
    priority: 'medium',
    status: 'open',
    reportedByName: 'Michael Otieno',
    daysAgo: 3,
  },

  // Low Priority Issues
  {
    branchId: 'KILELESHWA',
    title: 'AC unit needs filter change',
    description: 'Air conditioning unit running but efficiency reduced. Filter replacement recommended.',
    category: 'other',
    priority: 'low',
    status: 'open',
    reportedByName: 'Lucy Wambui',
    daysAgo: 5,
  },
  {
    branchId: 'ADLIFE',
    title: 'Signage lighting out',
    description: 'External Lorenzo sign light not working. Need electrician visit.',
    category: 'other',
    priority: 'low',
    status: 'open',
    reportedByName: 'James Mutua',
    daysAgo: 7,
  },

  // Resolved Issues (for history)
  {
    branchId: 'VILLAGE_MARKET',
    title: 'Receipt printer paper jam',
    description: 'Thermal printer had paper jam issue. Cleared and tested.',
    category: 'equipment',
    priority: 'medium',
    status: 'resolved',
    reportedByName: 'Peter Mwangi',
    assignedToName: 'Peter Mwangi',
    daysAgo: 2,
  },
  {
    branchId: 'WESTGATE',
    title: 'Customer refund processed',
    description: 'Refund for damaged garment claim ORD-WEST-20250102-0018 completed.',
    category: 'customer_complaint',
    priority: 'high',
    status: 'closed',
    reportedByName: 'Sarah Wanjiku',
    assignedToName: 'Branch Manager',
    daysAgo: 5,
  },
];

async function seedIssues() {
  console.log('⚠️ Seeding issues data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;

    for (const issue of sampleIssues) {
      // Generate a unique issue ID
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
      const issueId = `ISS-${issue.branchId.slice(0, 4)}-${dateStr}-${randomNum}`;

      const issueRef = db.collection('issues').doc(issueId);
      const existingDoc = await issueRef.get();

      const now = new Date();
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - issue.daysAgo);

      const issueData = {
        issueId,
        branchId: issue.branchId,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        priority: issue.priority,
        status: issue.status,
        reportedBy: 'system-seed',
        reportedByName: issue.reportedByName,
        assignedTo: issue.assignedToName ? 'system-assigned' : null,
        assignedToName: issue.assignedToName || null,
        resolution: issue.status === 'resolved' || issue.status === 'closed'
          ? 'Issue has been addressed and resolved.'
          : null,
        createdAt: Timestamp.fromDate(createdAt),
        updatedAt: Timestamp.now(),
        resolvedAt: issue.status === 'resolved' || issue.status === 'closed'
          ? Timestamp.now()
          : null,
        resolvedBy: issue.status === 'resolved' || issue.status === 'closed'
          ? 'system-seed'
          : null,
      };

      if (existingDoc.exists) {
        await issueRef.update(issueData);
        console.log(`✓ Updated: [${issue.priority.toUpperCase()}] ${issue.title}`);
        updated++;
      } else {
        await issueRef.set(issueData);
        console.log(`✓ Created: [${issue.priority.toUpperCase()}] ${issue.title}`);
        created++;
      }
    }

    // Summary by priority
    const priorityCounts = sampleIssues.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = sampleIssues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n✅ Issues seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} issues`);
    console.log(`   - Updated: ${updated} issues`);
    console.log(`   - Total: ${sampleIssues.length} issues`);
    console.log(`\n📈 By Priority:`);
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      console.log(`   - ${priority}: ${count}`);
    });
    console.log(`\n📋 By Status:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

  } catch (error) {
    console.error('\n❌ Error seeding issues:', error);
    process.exit(1);
  }
}

seedIssues()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
