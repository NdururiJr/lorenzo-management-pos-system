/**
 * Seed Workstation Assignments Script
 *
 * Populates staff assignments to workstation stages
 * Maps employees to their assigned processing stages for each shift
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
type ShiftType = 'morning' | 'afternoon' | 'evening';

interface StaffMember {
  userId: string;
  name: string;
  skills: ProcessingStage[];
  primaryStage: ProcessingStage;
}

interface WorkstationAssignment {
  assignmentId: string;
  branchId: string;
  userId: string;
  userName: string;
  stage: ProcessingStage;
  shiftDate: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Staff by branch with their skills
const staffByBranch: Record<string, StaffMember[]> = {
  VILLAGE_MARKET: [
    { userId: 'staff-vm-1', name: 'Joseph Kamau', skills: ['inspection', 'quality_check'], primaryStage: 'inspection' },
    { userId: 'staff-vm-2', name: 'Grace Wanjiku', skills: ['washing', 'drying'], primaryStage: 'washing' },
    { userId: 'staff-vm-3', name: 'Peter Ochieng', skills: ['ironing', 'packaging'], primaryStage: 'ironing' },
    { userId: 'staff-vm-4', name: 'Ruth Nyawira', skills: ['washing', 'drying', 'ironing'], primaryStage: 'drying' },
    { userId: 'staff-vm-5', name: 'Samuel Kiprotich', skills: ['quality_check', 'packaging'], primaryStage: 'quality_check' },
  ],
  WESTGATE: [
    { userId: 'staff-wg-1', name: 'Mary Akinyi', skills: ['inspection', 'washing'], primaryStage: 'inspection' },
    { userId: 'staff-wg-2', name: 'John Mwangi', skills: ['ironing', 'quality_check'], primaryStage: 'ironing' },
    { userId: 'staff-wg-3', name: 'Caroline Wambui', skills: ['drying', 'packaging'], primaryStage: 'packaging' },
    { userId: 'staff-wg-4', name: 'Dennis Ouma', skills: ['washing', 'drying'], primaryStage: 'washing' },
  ],
  DENNIS_PRITT: [
    { userId: 'staff-dp-1', name: 'Alice Njeri', skills: ['inspection', 'quality_check', 'packaging'], primaryStage: 'quality_check' },
    { userId: 'staff-dp-2', name: 'David Kipchoge', skills: ['washing', 'drying', 'ironing'], primaryStage: 'washing' },
    { userId: 'staff-dp-3', name: 'Esther Cherop', skills: ['ironing', 'packaging'], primaryStage: 'ironing' },
  ],
  MUTHAIGA: [
    { userId: 'staff-mu-1', name: 'Sarah Chebet', skills: ['inspection', 'quality_check'], primaryStage: 'inspection' },
    { userId: 'staff-mu-2', name: 'Michael Otieno', skills: ['washing', 'drying'], primaryStage: 'washing' },
    { userId: 'staff-mu-3', name: 'Beatrice Nekesa', skills: ['ironing', 'packaging'], primaryStage: 'ironing' },
    { userId: 'staff-mu-4', name: 'Patrick Wekesa', skills: ['drying', 'quality_check'], primaryStage: 'drying' },
  ],
  NAIVAS_KILIMANI: [
    { userId: 'staff-nk-1', name: 'Elizabeth Wambui', skills: ['inspection', 'washing'], primaryStage: 'inspection' },
    { userId: 'staff-nk-2', name: 'James Mutiso', skills: ['drying', 'ironing'], primaryStage: 'drying' },
    { userId: 'staff-nk-3', name: 'Faith Nyambura', skills: ['quality_check', 'packaging'], primaryStage: 'quality_check' },
    { userId: 'staff-nk-4', name: 'Victor Odongo', skills: ['washing', 'ironing'], primaryStage: 'washing' },
    { userId: 'staff-nk-5', name: 'Ann Moraa', skills: ['packaging', 'inspection'], primaryStage: 'packaging' },
  ],
  LAVINGTON: [
    { userId: 'staff-lv-1', name: 'Christine Adhiambo', skills: ['inspection', 'quality_check'], primaryStage: 'inspection' },
    { userId: 'staff-lv-2', name: 'Kevin Muturi', skills: ['washing', 'drying'], primaryStage: 'washing' },
    { userId: 'staff-lv-3', name: 'Nancy Njoki', skills: ['ironing', 'packaging'], primaryStage: 'ironing' },
  ],
  HURLINGHAM: [
    { userId: 'staff-hu-1', name: 'Daniel Kibet', skills: ['inspection', 'washing', 'drying'], primaryStage: 'washing' },
    { userId: 'staff-hu-2', name: 'Lucy Wangari', skills: ['ironing', 'quality_check', 'packaging'], primaryStage: 'ironing' },
  ],
};

const shiftSchedule: Record<ShiftType, { start: string; end: string }> = {
  morning: { start: '06:00', end: '14:00' },
  afternoon: { start: '14:00', end: '22:00' },
  evening: { start: '22:00', end: '06:00' },
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateRange(daysBack: number, daysForward: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = -daysBack; i <= daysForward; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(formatDate(date));
  }

  return dates;
}

function generateAssignmentId(branchId: string, date: string, shift: string, stage: string, index: number): string {
  return `ASSIGN-${branchId.substring(0, 4)}-${date.replace(/-/g, '')}-${shift.substring(0, 3).toUpperCase()}-${stage.substring(0, 3).toUpperCase()}-${String(index).padStart(2, '0')}`;
}

async function seedWorkstationAssignments() {
  console.log('👷 Seeding workstation assignments...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    let created = 0;
    let updated = 0;

    // Get dates for the past 3 days and next 7 days
    const dates = getDateRange(3, 7);
    const today = formatDate(new Date());

    for (const branchId of Object.keys(staffByBranch)) {
      console.log(`\n📍 Branch: ${branchId}`);
      const staff = staffByBranch[branchId];

      for (const date of dates) {
        // Morning and afternoon shifts only for most days
        const shifts: ShiftType[] = date === today ? ['morning', 'afternoon'] : ['morning', 'afternoon'];

        for (const shiftType of shifts) {
          const schedule = shiftSchedule[shiftType];
          let assignmentIndex = 1;

          for (const member of staff) {
            // Assign to primary stage
            const assignmentId = generateAssignmentId(branchId, date, shiftType, member.primaryStage, assignmentIndex++);
            const assignmentRef = db.collection('workstationAssignments').doc(assignmentId);
            const existingDoc = await assignmentRef.get();

            const now = Timestamp.now();

            // Active if it's today or in the future
            const isActive = date >= today;

            const assignmentData: WorkstationAssignment = {
              assignmentId,
              branchId,
              userId: member.userId,
              userName: member.name,
              stage: member.primaryStage,
              shiftDate: date,
              shiftType,
              startTime: schedule.start,
              endTime: schedule.end,
              active: isActive,
              createdAt: existingDoc.exists ? existingDoc.data()?.createdAt : now,
              updatedAt: now,
            };

            if (existingDoc.exists) {
              await assignmentRef.update(assignmentData as any);
              updated++;
            } else {
              await assignmentRef.set(assignmentData);
              created++;
            }

            // For today's date, also create some secondary assignments (cross-training)
            if (date === today && member.skills.length > 1 && Math.random() < 0.3) {
              const secondaryStage = member.skills.find(s => s !== member.primaryStage);
              if (secondaryStage) {
                const secondaryId = generateAssignmentId(branchId, date, shiftType, secondaryStage, assignmentIndex++);
                const secondaryRef = db.collection('workstationAssignments').doc(secondaryId);

                const secondaryData: WorkstationAssignment = {
                  assignmentId: secondaryId,
                  branchId,
                  userId: member.userId,
                  userName: member.name,
                  stage: secondaryStage,
                  shiftDate: date,
                  shiftType,
                  startTime: schedule.start,
                  endTime: schedule.end,
                  active: true,
                  createdAt: now,
                  updatedAt: now,
                };

                await secondaryRef.set(secondaryData);
                created++;
              }
            }
          }

          if (date === today) {
            console.log(`  ✓ ${shiftType} shift: ${staff.length} staff assigned`);
          }
        }
      }
    }

    console.log(`\n✅ Workstation assignments seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} assignments`);
    console.log(`   - Updated: ${updated} assignments`);
    console.log(`   - Total: ${created + updated} assignments`);
    console.log(`   - Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
    console.log(`   - Branches: ${Object.keys(staffByBranch).length}`);

  } catch (error) {
    console.error('\n❌ Error seeding workstation assignments:', error);
    process.exit(1);
  }
}

seedWorkstationAssignments()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
