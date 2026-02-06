/**
 * Seed Permission Requests Script
 *
 * Populates permission request data for Director approval workflow
 * Creates requests in various approval states
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

type RequestStatus = 'pending' | 'approved' | 'rejected';
type UserRole = 'front_desk' | 'workstation_staff' | 'workstation_manager' | 'store_manager' | 'driver' | 'satellite_staff';

interface PermissionRequest {
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedRole: UserRole;
  currentRole?: UserRole;
  requestedBranchId: string;
  requestedBranchName: string;
  requestedBranchAccess: string[];
  requestedBy: string;
  requestedByName: string;
  requestedByRole: string;
  reason: string;
  status: RequestStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// GM who creates the requests
const gmInfo = {
  id: 'gm-grace-001',
  name: 'Grace Muthoni',
  role: 'general_manager',
};

// Director who approves
const directorInfo = {
  id: 'director-lawrence-001',
  name: 'Lawrence Kariuki',
};

// Branches
const branches: Record<string, string> = {
  'VILLAGE_MARKET': 'Village Market',
  'WESTGATE': 'Westgate',
  'DENNIS_PRITT': 'Dennis Pritt',
  'MUTHAIGA': 'Muthaiga',
  'NAIVAS_KILIMANI': 'Naivas Kilimani',
  'HURLINGHAM': 'Hurlingham',
  'LAVINGTON': 'Lavington',
  'WATERFRONT_KAREN': 'Waterfront Karen',
  'KILELESHWA': 'Kileleshwa',
  'ADLIFE': 'Adlife',
};

// Staff for permission requests
const newStaffMembers = [
  { id: 'new-staff-001', name: 'Peter Njoroge', email: 'peter.njoroge@lorenzo.com', phone: '+254711001001' },
  { id: 'new-staff-002', name: 'Mary Wangari', email: 'mary.wangari@lorenzo.com', phone: '+254711001002' },
  { id: 'new-staff-003', name: 'John Ochieng', email: 'john.ochieng@lorenzo.com', phone: '+254711001003' },
  { id: 'new-staff-004', name: 'Sarah Chebet', email: 'sarah.chebet@lorenzo.com', phone: '+254711001004' },
  { id: 'new-staff-005', name: 'David Kipchoge', email: 'david.kipchoge@lorenzo.com', phone: '+254711001005' },
  { id: 'new-staff-006', name: 'Elizabeth Akinyi', email: 'elizabeth.akinyi@lorenzo.com', phone: '+254711001006' },
  { id: 'new-staff-007', name: 'James Mutua', email: 'james.mutua@lorenzo.com', phone: '+254711001007' },
  { id: 'new-staff-008', name: 'Nancy Moraa', email: 'nancy.moraa@lorenzo.com', phone: '+254711001008' },
  { id: 'new-staff-009', name: 'Michael Ouma', email: 'michael.ouma@lorenzo.com', phone: '+254711001009' },
  { id: 'new-staff-010', name: 'Faith Wambui', email: 'faith.wambui@lorenzo.com', phone: '+254711001010' },
  { id: 'new-staff-011', name: 'Samuel Kosgei', email: 'samuel.kosgei@lorenzo.com', phone: '+254711001011' },
  { id: 'new-staff-012', name: 'Caroline Njeri', email: 'caroline.njeri@lorenzo.com', phone: '+254711001012' },
  { id: 'new-staff-013', name: 'Dennis Otieno', email: 'dennis.otieno@lorenzo.com', phone: '+254711001013' },
  { id: 'new-staff-014', name: 'Alice Cherop', email: 'alice.cherop@lorenzo.com', phone: '+254711001014' },
  { id: 'new-staff-015', name: 'Victor Wekesa', email: 'victor.wekesa@lorenzo.com', phone: '+254711001015' },
];

// Reasons for permission requests
const requestReasons: Record<UserRole, string[]> = {
  front_desk: [
    'New hire for customer reception - completed training',
    'Transfer from another branch - experienced staff',
    'Promotion from trainee position',
    'Seasonal hire for peak period',
  ],
  workstation_staff: [
    'New hire for processing team - 2 years experience in garment care',
    'Cross-training completion - ready for workstation duties',
    'Temporary assignment to cover leave',
    'Transferred from satellite store',
  ],
  workstation_manager: [
    'Promotion from workstation staff - excellent performance',
    'Internal transfer - previously managed at another branch',
    'New hire - 5 years management experience',
  ],
  store_manager: [
    'Promotion from workstation manager - ready for branch oversight',
    'New branch opening - experienced manager assignment',
    'Transfer from another branch to cover vacancy',
  ],
  driver: [
    'New hire - valid license and clean record',
    'Temporary driver for peak season',
    'Transfer from logistics partner',
  ],
  satellite_staff: [
    'New satellite location staff assignment',
    'Transfer from main branch for satellite expansion',
    'Part-time satellite staff position',
  ],
};

// Rejection reasons
const rejectionReasons = [
  'Background check not yet completed',
  'Training certification missing',
  'Need more experience before this role',
  'Budget constraints - try again next month',
  'Position already filled',
];

// Status distribution
const statusDistribution: Record<RequestStatus, number> = {
  pending: 5,    // 5 awaiting approval
  approved: 7,   // 7 approved
  rejected: 3,   // 3 rejected
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(Math.floor(Math.random() * 10) + 8); // 8 AM to 6 PM
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function generateRequestId(index: number): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `PERM-${dateStr}-${String(index).padStart(4, '0')}`;
}

async function seedPermissionRequests() {
  console.log('🔐 Seeding permission request data...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;
    let requestIndex = 1;
    let staffIndex = 0;

    const branchIds = Object.keys(branches);
    const roles: UserRole[] = ['front_desk', 'workstation_staff', 'workstation_manager', 'store_manager', 'driver', 'satellite_staff'];

    const statusCounts: Record<RequestStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    for (const [status, count] of Object.entries(statusDistribution)) {
      console.log(`\n📋 Creating ${count} ${status} permission requests...`);

      for (let i = 0; i < count; i++) {
        const requestId = generateRequestId(requestIndex++);
        const requestRef = db.collection('permissionRequests').doc(requestId);
        const existingDoc = await requestRef.get();

        const now = Timestamp.now();
        const staff = newStaffMembers[staffIndex % newStaffMembers.length];
        staffIndex++;

        const branchId = getRandomElement(branchIds);
        const branchName = branches[branchId];
        const requestedRole = getRandomElement(roles);
        const reasons = requestReasons[requestedRole];
        const reason = getRandomElement(reasons);

        // Set created date based on status
        let createdAt: Timestamp;
        switch (status) {
          case 'pending':
            // Recent - within last 3 days
            createdAt = Timestamp.fromDate(getDaysAgo(Math.floor(Math.random() * 3)));
            break;
          case 'approved':
          case 'rejected':
            // Older - 3 to 30 days ago
            createdAt = Timestamp.fromDate(getDaysAgo(Math.floor(Math.random() * 27) + 3));
            break;
          default:
            createdAt = now;
        }

        const requestData: PermissionRequest = {
          requestId,
          userId: staff.id,
          userName: staff.name,
          userEmail: staff.email,
          userPhone: staff.phone,
          requestedRole,
          requestedBranchId: branchId,
          requestedBranchName: branchName,
          requestedBranchAccess: [branchId],
          requestedBy: gmInfo.id,
          requestedByName: gmInfo.name,
          requestedByRole: gmInfo.role,
          reason,
          status: status as RequestStatus,
          createdAt,
          updatedAt: now,
        };

        // Add approval details for approved requests
        if (status === 'approved') {
          requestData.approvedBy = directorInfo.id;
          requestData.approvedByName = directorInfo.name;
          // Approved 1-2 days after creation
          const createdDate = createdAt.toDate();
          createdDate.setDate(createdDate.getDate() + Math.floor(Math.random() * 2) + 1);
          requestData.approvedAt = Timestamp.fromDate(createdDate);
        }

        // Add rejection details for rejected requests
        if (status === 'rejected') {
          requestData.approvedBy = directorInfo.id;
          requestData.approvedByName = directorInfo.name;
          requestData.rejectionReason = getRandomElement(rejectionReasons);
        }

        // Some requests might be for role changes (upgrades)
        if (Math.random() < 0.3 && requestedRole !== 'front_desk') {
          const lowerRoles: UserRole[] = ['front_desk', 'workstation_staff', 'satellite_staff'];
          requestData.currentRole = getRandomElement(lowerRoles);
        }

        if (existingDoc.exists) {
          await requestRef.update(requestData as any);
          console.log(`  ✓ Updated: ${status} - ${staff.name} → ${requestedRole} at ${branchName}`);
          updated++;
        } else {
          await requestRef.set(requestData);
          console.log(`  ✓ Created: ${status} - ${staff.name} → ${requestedRole} at ${branchName}`);
          created++;
        }

        statusCounts[status as RequestStatus]++;
      }
    }

    console.log(`\n✅ Permission requests seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} permission requests`);
    console.log(`   - Updated: ${updated} permission requests`);
    console.log(`   - Total: ${created + updated} permission requests`);
    console.log(`\n📋 Status Distribution:`);
    console.log(`   - Pending (awaiting Director approval): ${statusCounts.pending}`);
    console.log(`   - Approved: ${statusCounts.approved}`);
    console.log(`   - Rejected: ${statusCounts.rejected}`);

  } catch (error) {
    console.error('\n❌ Error seeding permission requests:', error);
    process.exit(1);
  }
}

seedPermissionRequests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
