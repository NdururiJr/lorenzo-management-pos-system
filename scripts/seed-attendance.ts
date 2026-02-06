/**
 * Seed Attendance Script
 *
 * Populates today's attendance records for GM Dashboard's Staff On Duty widget
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

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';
type UserRole = 'front_desk' | 'workstation_staff' | 'driver' | 'store_manager' | 'workstation_manager';

interface StaffMember {
  employeeId: string;
  name: string;
  role: UserRole;
  branchId: string;
  status: AttendanceStatus;
  checkInHour: number; // Hour of the day (0-23)
  checkInMinute: number;
}

// Sample staff members across branches with today's attendance
const staffAttendance: StaffMember[] = [
  // VILLAGE_MARKET Branch
  { employeeId: 'EMP-VM-001', name: 'Peter Mwangi', role: 'store_manager', branchId: 'VILLAGE_MARKET', status: 'present', checkInHour: 7, checkInMinute: 45 },
  { employeeId: 'EMP-VM-002', name: 'Grace Akinyi', role: 'front_desk', branchId: 'VILLAGE_MARKET', status: 'present', checkInHour: 7, checkInMinute: 55 },
  { employeeId: 'EMP-VM-003', name: 'John Ochieng', role: 'workstation_staff', branchId: 'VILLAGE_MARKET', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-VM-004', name: 'Mary Njeri', role: 'workstation_staff', branchId: 'VILLAGE_MARKET', status: 'late', checkInHour: 8, checkInMinute: 30 },
  { employeeId: 'EMP-VM-005', name: 'David Kipchoge', role: 'driver', branchId: 'VILLAGE_MARKET', status: 'present', checkInHour: 8, checkInMinute: 0 },

  // WESTGATE Branch
  { employeeId: 'EMP-WG-001', name: 'Sarah Wanjiku', role: 'store_manager', branchId: 'WESTGATE', status: 'present', checkInHour: 7, checkInMinute: 50 },
  { employeeId: 'EMP-WG-002', name: 'Michael Otieno', role: 'front_desk', branchId: 'WESTGATE', status: 'present', checkInHour: 8, checkInMinute: 5 },
  { employeeId: 'EMP-WG-003', name: 'Faith Muthoni', role: 'workstation_staff', branchId: 'WESTGATE', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-WG-004', name: 'James Mutua', role: 'driver', branchId: 'WESTGATE', status: 'present', checkInHour: 7, checkInMinute: 55 },

  // NAIVAS_KILIMANI Branch
  { employeeId: 'EMP-NK-001', name: 'Ann Wairimu', role: 'store_manager', branchId: 'NAIVAS_KILIMANI', status: 'present', checkInHour: 7, checkInMinute: 40 },
  { employeeId: 'EMP-NK-002', name: 'Joseph Kamau', role: 'front_desk', branchId: 'NAIVAS_KILIMANI', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-NK-003', name: 'Lucy Wambui', role: 'workstation_staff', branchId: 'NAIVAS_KILIMANI', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-NK-004', name: 'Samuel Njoroge', role: 'workstation_staff', branchId: 'NAIVAS_KILIMANI', status: 'late', checkInHour: 8, checkInMinute: 45 },
  { employeeId: 'EMP-NK-005', name: 'Paul Omondi', role: 'driver', branchId: 'NAIVAS_KILIMANI', status: 'present', checkInHour: 7, checkInMinute: 50 },

  // MUTHAIGA Branch
  { employeeId: 'EMP-MT-001', name: 'Elizabeth Nyambura', role: 'store_manager', branchId: 'MUTHAIGA', status: 'present', checkInHour: 7, checkInMinute: 55 },
  { employeeId: 'EMP-MT-002', name: 'Patrick Kimani', role: 'front_desk', branchId: 'MUTHAIGA', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-MT-003', name: 'Caroline Wangari', role: 'workstation_staff', branchId: 'MUTHAIGA', status: 'present', checkInHour: 8, checkInMinute: 5 },

  // LAVINGTON Branch
  { employeeId: 'EMP-LV-001', name: 'Daniel Maina', role: 'store_manager', branchId: 'LAVINGTON', status: 'present', checkInHour: 7, checkInMinute: 45 },
  { employeeId: 'EMP-LV-002', name: 'Christine Achieng', role: 'front_desk', branchId: 'LAVINGTON', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-LV-003', name: 'Martin Odhiambo', role: 'workstation_staff', branchId: 'LAVINGTON', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-LV-004', name: 'Rose Nduta', role: 'workstation_staff', branchId: 'LAVINGTON', status: 'present', checkInHour: 7, checkInMinute: 55 },
  { employeeId: 'EMP-LV-005', name: 'Kevin Musyoka', role: 'driver', branchId: 'LAVINGTON', status: 'present', checkInHour: 8, checkInMinute: 10 },

  // WATERFRONT_KAREN Branch
  { employeeId: 'EMP-WK-001', name: 'Rebecca Chebet', role: 'store_manager', branchId: 'WATERFRONT_KAREN', status: 'present', checkInHour: 7, checkInMinute: 50 },
  { employeeId: 'EMP-WK-002', name: 'Dennis Korir', role: 'front_desk', branchId: 'WATERFRONT_KAREN', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-WK-003', name: 'Agnes Mwende', role: 'workstation_staff', branchId: 'WATERFRONT_KAREN', status: 'present', checkInHour: 8, checkInMinute: 5 },
  { employeeId: 'EMP-WK-004', name: 'Brian Kiprop', role: 'driver', branchId: 'WATERFRONT_KAREN', status: 'present', checkInHour: 7, checkInMinute: 55 },

  // HURLINGHAM Branch
  { employeeId: 'EMP-HR-001', name: 'Nancy Wafula', role: 'store_manager', branchId: 'HURLINGHAM', status: 'present', checkInHour: 7, checkInMinute: 45 },
  { employeeId: 'EMP-HR-002', name: 'George Ogutu', role: 'front_desk', branchId: 'HURLINGHAM', status: 'late', checkInHour: 8, checkInMinute: 25 },
  { employeeId: 'EMP-HR-003', name: 'Esther Nyokabi', role: 'workstation_staff', branchId: 'HURLINGHAM', status: 'present', checkInHour: 8, checkInMinute: 0 },

  // KILELESHWA Branch
  { employeeId: 'EMP-KL-001', name: 'Victor Onyango', role: 'store_manager', branchId: 'KILELESHWA', status: 'present', checkInHour: 7, checkInMinute: 55 },
  { employeeId: 'EMP-KL-002', name: 'Gladys Moraa', role: 'front_desk', branchId: 'KILELESHWA', status: 'present', checkInHour: 8, checkInMinute: 0 },
  { employeeId: 'EMP-KL-003', name: 'Collins Wekesa', role: 'workstation_staff', branchId: 'KILELESHWA', status: 'present', checkInHour: 8, checkInMinute: 0 },
];

async function seedAttendance() {
  console.log('👥 Seeding attendance data for today...\n');

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    // Get today's date at midnight for the attendance date field
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    let created = 0;
    let updated = 0;

    // Group by branch for display
    const branchGroups = staffAttendance.reduce((acc, staff) => {
      if (!acc[staff.branchId]) acc[staff.branchId] = [];
      acc[staff.branchId].push(staff);
      return acc;
    }, {} as Record<string, StaffMember[]>);

    for (const [branchId, staffList] of Object.entries(branchGroups)) {
      console.log(`\n📍 Branch: ${branchId}`);

      for (const staff of staffList) {
        const attendanceId = `ATT-${staff.employeeId}-${dateStr}`;
        const attendanceRef = db.collection('attendance').doc(attendanceId);
        const existingDoc = await attendanceRef.get();

        // Create check-in timestamp
        const checkInTime = new Date(today);
        checkInTime.setHours(staff.checkInHour, staff.checkInMinute, 0, 0);

        // Create check-out timestamp (random between 5-8 PM for those who have checked out)
        const checkOutTime = new Date(today);
        const currentHour = new Date().getHours();
        const hasCheckedOut = currentHour > 17 && Math.random() > 0.3; // 70% chance after 5 PM
        if (hasCheckedOut) {
          checkOutTime.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
        }

        // Calculate hours worked
        let hoursWorked: number | null = null;
        if (hasCheckedOut) {
          hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          hoursWorked = Math.round(hoursWorked * 10) / 10; // Round to 1 decimal
        }

        const attendanceData = {
          attendanceId,
          employeeId: staff.employeeId,
          employeeName: staff.name,
          branchId: staff.branchId,
          date: Timestamp.fromDate(today),
          checkIn: Timestamp.fromDate(checkInTime),
          checkOut: hasCheckedOut ? Timestamp.fromDate(checkOutTime) : null,
          status: staff.status,
          hoursWorked,
          notes: staff.status === 'late' ? 'Arrived late to work' : null,
          recordedBy: 'system-seed',
          source: 'manual' as const,
        };

        if (existingDoc.exists) {
          await attendanceRef.update(attendanceData);
          console.log(`  ✓ Updated: ${staff.name} (${staff.role}) - ${staff.status}`);
          updated++;
        } else {
          await attendanceRef.set(attendanceData);
          console.log(`  ✓ Created: ${staff.name} (${staff.role}) - ${staff.status}`);
          created++;
        }
      }
    }

    // Summary statistics
    const statusCounts = staffAttendance.reduce((acc, staff) => {
      acc[staff.status] = (acc[staff.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const roleCounts = staffAttendance.reduce((acc, staff) => {
      acc[staff.role] = (acc[staff.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n✅ Attendance seed completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${created} attendance records`);
    console.log(`   - Updated: ${updated} attendance records`);
    console.log(`   - Total staff: ${staffAttendance.length}`);
    console.log(`   - Branches covered: ${Object.keys(branchGroups).length}`);
    console.log(`\n📈 By Status:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });
    console.log(`\n👔 By Role:`);
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count}`);
    });

  } catch (error) {
    console.error('\n❌ Error seeding attendance:', error);
    process.exit(1);
  }
}

seedAttendance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
