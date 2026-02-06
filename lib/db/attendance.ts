/**
 * Attendance Service
 *
 * Handles employee attendance tracking including clock-in/out,
 * attendance history, and integration with biometric devices.
 *
 * @module lib/db/attendance
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSource,
  Employee,
  ShiftType,
} from './schema';
import {
  startOfDay,
  endOfDay,
  differenceInMinutes,
  isBefore,
  addMinutes,
} from 'date-fns';

// Collection reference
const ATTENDANCE_COLLECTION = 'attendance';
const EMPLOYEES_COLLECTION = 'employees';

/**
 * Shift configuration (times in 24-hour format)
 */
export const SHIFT_CONFIG: Record<ShiftType, { start: string; end: string; graceMinutes: number }> = {
  morning: { start: '06:00', end: '14:00', graceMinutes: 15 },
  afternoon: { start: '14:00', end: '22:00', graceMinutes: 15 },
  night: { start: '22:00', end: '06:00', graceMinutes: 15 },
};

/**
 * Clock in parameters
 */
export interface ClockInParams {
  employeeId: string;
  branchId: string;
  source: AttendanceSource;
  biometricEventId?: string;
  deviceId?: string;
  recordedBy: string;
  notes?: string;
}

/**
 * Clock out parameters
 */
export interface ClockOutParams {
  attendanceId: string;
  recordedBy: string;
  notes?: string;
}

/**
 * Attendance query parameters
 */
export interface AttendanceQueryParams {
  employeeId?: string;
  branchId?: string;
  startDate: Date;
  endDate: Date;
  status?: AttendanceStatus;
}

/**
 * Generate a unique attendance record ID
 */
function generateAttendanceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ATT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Get shift start time for a given date
 */
export function getShiftStartTime(shift: ShiftType, date: Date): Date {
  const config = SHIFT_CONFIG[shift];
  const [hours, minutes] = config.start.split(':').map(Number);
  const shiftStart = new Date(date);
  shiftStart.setHours(hours, minutes, 0, 0);

  // Handle night shift that starts the previous day
  if (shift === 'night' && date.getHours() < 6) {
    shiftStart.setDate(shiftStart.getDate() - 1);
  }

  return shiftStart;
}

/**
 * Get shift end time for a given date
 */
export function getShiftEndTime(shift: ShiftType, date: Date): Date {
  const config = SHIFT_CONFIG[shift];
  const [hours, minutes] = config.end.split(':').map(Number);
  const shiftEnd = new Date(date);
  shiftEnd.setHours(hours, minutes, 0, 0);

  // Handle night shift that ends the next day
  if (shift === 'night') {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  return shiftEnd;
}

/**
 * Determine attendance status based on check-in time
 */
export function determineAttendanceStatus(
  checkInTime: Date,
  shift: ShiftType
): AttendanceStatus {
  const shiftStart = getShiftStartTime(shift, checkInTime);
  const graceMinutes = SHIFT_CONFIG[shift].graceMinutes;
  const gracePeriodEnd = addMinutes(shiftStart, graceMinutes);
  const halfShiftMark = addMinutes(shiftStart, 240); // 4 hours

  if (isBefore(checkInTime, gracePeriodEnd) || checkInTime.getTime() === gracePeriodEnd.getTime()) {
    return 'present';
  } else if (isBefore(checkInTime, halfShiftMark)) {
    return 'late';
  } else {
    return 'half_day';
  }
}

/**
 * Calculate hours worked between check-in and check-out
 */
export function calculateHoursWorked(
  checkIn: Date | Timestamp,
  checkOut: Date | Timestamp
): number {
  const checkInDate = checkIn instanceof Timestamp ? checkIn.toDate() : checkIn;
  const checkOutDate = checkOut instanceof Timestamp ? checkOut.toDate() : checkOut;

  const minutes = differenceInMinutes(checkOutDate, checkInDate);
  return Math.round((minutes / 60) * 100) / 100; // Round to 2 decimal places
}

/**
 * Get employee details
 */
async function getEmployee(employeeId: string): Promise<Employee | null> {
  try {
    const employeeDoc = await getDoc(doc(db, EMPLOYEES_COLLECTION, employeeId));
    if (!employeeDoc.exists()) {
      return null;
    }
    return employeeDoc.data() as Employee;
  } catch (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
}

/**
 * Clock in an employee
 */
export async function clockIn(params: ClockInParams): Promise<AttendanceRecord> {
  const { employeeId, branchId, source, biometricEventId, deviceId, recordedBy, notes } = params;

  // Get employee details for name and shift
  const employee = await getEmployee(employeeId);
  if (!employee) {
    throw new Error(`Employee not found: ${employeeId}`);
  }

  // Check if already clocked in today
  const existingAttendance = await getTodayAttendance(employeeId);
  if (existingAttendance && existingAttendance.checkIn && !existingAttendance.checkOut) {
    throw new Error('Employee is already clocked in');
  }

  const now = new Date();
  const status = determineAttendanceStatus(now, employee.shift);

  const attendanceRecord: Omit<AttendanceRecord, 'attendanceId'> = {
    employeeId,
    employeeName: employee.name,
    branchId,
    date: Timestamp.fromDate(startOfDay(now)),
    checkIn: Timestamp.fromDate(now),
    status,
    recordedBy,
    source,
    biometricEventId,
    deviceId,
    notes,
  };

  // Create the attendance record
  const attendanceId = generateAttendanceId();
  const _docRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);

  const recordWithId: AttendanceRecord = {
    ...attendanceRecord,
    attendanceId,
  };

  await addDoc(collection(db, ATTENDANCE_COLLECTION), recordWithId);

  // Update employee's last attendance timestamp
  await updateDoc(doc(db, EMPLOYEES_COLLECTION, employeeId), {
    lastAttendance: Timestamp.fromDate(now),
  });

  return recordWithId;
}

/**
 * Clock out an employee
 */
export async function clockOut(params: ClockOutParams): Promise<AttendanceRecord> {
  const { attendanceId, recordedBy: _recordedBy, notes } = params;

  // Find the attendance record
  const attendanceQuery = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('attendanceId', '==', attendanceId)
  );

  const snapshot = await getDocs(attendanceQuery);
  if (snapshot.empty) {
    throw new Error(`Attendance record not found: ${attendanceId}`);
  }

  const attendanceDoc = snapshot.docs[0];
  const attendance = attendanceDoc.data() as AttendanceRecord;

  if (attendance.checkOut) {
    throw new Error('Employee is already clocked out');
  }

  if (!attendance.checkIn) {
    throw new Error('Cannot clock out without a clock in');
  }

  const now = new Date();
  // Convert Firestore Timestamp to Date if needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkInTime = (attendance.checkIn as any)?.toDate ? (attendance.checkIn as any).toDate() : new Date(attendance.checkIn as unknown as string);
  const hoursWorked = calculateHoursWorked(checkInTime, now);

  // Update status to half_day if worked less than 4 hours
  let finalStatus = attendance.status;
  if (hoursWorked < 4 && attendance.status !== 'absent') {
    finalStatus = 'half_day';
  }

  const updates: Partial<AttendanceRecord> = {
    checkOut: Timestamp.fromDate(now),
    hoursWorked,
    status: finalStatus,
    notes: notes ? (attendance.notes ? `${attendance.notes}; ${notes}` : notes) : attendance.notes,
  };

  await updateDoc(attendanceDoc.ref, updates);

  return {
    ...attendance,
    ...updates,
  } as AttendanceRecord;
}

/**
 * Get today's attendance record for an employee
 */
export async function getTodayAttendance(employeeId: string): Promise<AttendanceRecord | null> {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  const attendanceQuery = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('employeeId', '==', employeeId),
    where('date', '>=', Timestamp.fromDate(today)),
    where('date', '<=', Timestamp.fromDate(tomorrow)),
    orderBy('date', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(attendanceQuery);
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as AttendanceRecord;
}

/**
 * Get attendance history with filters
 */
export async function getAttendanceHistory(
  params: AttendanceQueryParams
): Promise<AttendanceRecord[]> {
  const { employeeId, branchId, startDate, endDate, status } = params;

  const attendanceQuery = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('date', '>=', Timestamp.fromDate(startOfDay(startDate))),
    where('date', '<=', Timestamp.fromDate(endOfDay(endDate))),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(attendanceQuery);

  let records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);

  // Apply additional filters (Firestore limitation - can't have multiple inequality filters)
  if (employeeId) {
    records = records.filter(r => r.employeeId === employeeId);
  }
  if (branchId) {
    records = records.filter(r => r.branchId === branchId);
  }
  if (status) {
    records = records.filter(r => r.status === status);
  }

  return records;
}

/**
 * Get attendance by employee for a date range
 */
export async function getEmployeeAttendance(
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<AttendanceRecord[]> {
  return getAttendanceHistory({
    employeeId,
    startDate,
    endDate,
  });
}

/**
 * Get branch attendance for a specific date
 */
export async function getBranchAttendance(
  branchId: string,
  date: Date
): Promise<AttendanceRecord[]> {
  return getAttendanceHistory({
    branchId,
    startDate: date,
    endDate: date,
  });
}

/**
 * Calculate attendance statistics for an employee
 */
export async function getAttendanceStats(
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  absentDays: number;
  totalHours: number;
  averageHoursPerDay: number;
}> {
  const records = await getEmployeeAttendance(employeeId, startDate, endDate);

  const stats = {
    totalDays: records.length,
    presentDays: 0,
    lateDays: 0,
    halfDays: 0,
    absentDays: 0,
    totalHours: 0,
    averageHoursPerDay: 0,
  };

  for (const record of records) {
    switch (record.status) {
      case 'present':
        stats.presentDays++;
        break;
      case 'late':
        stats.lateDays++;
        break;
      case 'half_day':
        stats.halfDays++;
        break;
      case 'absent':
        stats.absentDays++;
        break;
    }

    if (record.hoursWorked) {
      stats.totalHours += record.hoursWorked;
    }
  }

  stats.averageHoursPerDay = stats.totalDays > 0
    ? Math.round((stats.totalHours / stats.totalDays) * 100) / 100
    : 0;

  return stats;
}

/**
 * Mark employee as absent (for end-of-day processing)
 */
export async function markAbsent(
  employeeId: string,
  branchId: string,
  date: Date,
  recordedBy: string,
  notes?: string
): Promise<AttendanceRecord> {
  const employee = await getEmployee(employeeId);
  if (!employee) {
    throw new Error(`Employee not found: ${employeeId}`);
  }

  const attendanceId = generateAttendanceId();

  const attendanceRecord: AttendanceRecord = {
    attendanceId,
    employeeId,
    employeeName: employee.name,
    branchId,
    date: Timestamp.fromDate(startOfDay(date)),
    status: 'absent',
    recordedBy,
    source: 'manual',
    notes: notes || 'Marked absent by system/manager',
  };

  await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceRecord);

  return attendanceRecord;
}

/**
 * Update attendance record (for corrections)
 */
export async function updateAttendance(
  attendanceId: string,
  updates: Partial<Pick<AttendanceRecord, 'checkIn' | 'checkOut' | 'status' | 'notes'>>,
  recordedBy: string
): Promise<AttendanceRecord> {
  const attendanceQuery = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('attendanceId', '==', attendanceId)
  );

  const snapshot = await getDocs(attendanceQuery);
  if (snapshot.empty) {
    throw new Error(`Attendance record not found: ${attendanceId}`);
  }

  const attendanceDoc = snapshot.docs[0];
  const currentRecord = attendanceDoc.data() as AttendanceRecord;

  // Recalculate hours if both check-in and check-out are present
  let hoursWorked = currentRecord.hoursWorked;
  const newCheckIn = updates.checkIn || currentRecord.checkIn;
  const newCheckOut = updates.checkOut || currentRecord.checkOut;

  if (newCheckIn && newCheckOut) {
    // Convert Firestore Timestamps to Date if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkInDate = (newCheckIn as any)?.toDate ? (newCheckIn as any).toDate() : new Date(newCheckIn as unknown as string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkOutDate = (newCheckOut as any)?.toDate ? (newCheckOut as any).toDate() : new Date(newCheckOut as unknown as string);
    hoursWorked = calculateHoursWorked(checkInDate, checkOutDate);
  }

  const finalUpdates = {
    ...updates,
    hoursWorked,
    notes: updates.notes
      ? `${currentRecord.notes ? currentRecord.notes + '; ' : ''}Corrected by ${recordedBy}: ${updates.notes}`
      : currentRecord.notes,
  };

  await updateDoc(attendanceDoc.ref, finalUpdates);

  return {
    ...currentRecord,
    ...finalUpdates,
  } as AttendanceRecord;
}

/**
 * Get current shift status for an employee
 */
export async function getCurrentShiftStatus(employeeId: string): Promise<{
  isWorking: boolean;
  currentAttendance: AttendanceRecord | null;
  elapsedSeconds: number;
  shiftType: ShiftType | null;
}> {
  const employee = await getEmployee(employeeId);
  if (!employee) {
    return {
      isWorking: false,
      currentAttendance: null,
      elapsedSeconds: 0,
      shiftType: null,
    };
  }

  const todayAttendance = await getTodayAttendance(employeeId);

  if (!todayAttendance || !todayAttendance.checkIn || todayAttendance.checkOut) {
    return {
      isWorking: false,
      currentAttendance: todayAttendance,
      elapsedSeconds: 0,
      shiftType: employee.shift,
    };
  }

  // Convert Firestore Timestamp to Date if needed (using duck typing for compatibility)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkIn = todayAttendance.checkIn as any;
  const checkInTime = checkIn?.toDate ? checkIn.toDate() : new Date(checkIn);

  const elapsedSeconds = Math.floor((Date.now() - checkInTime.getTime()) / 1000);

  return {
    isWorking: true,
    currentAttendance: todayAttendance,
    elapsedSeconds,
    shiftType: employee.shift,
  };
}

/**
 * Get employees currently working at a branch
 */
export async function getActiveEmployees(branchId: string): Promise<{
  employee: Employee;
  attendance: AttendanceRecord;
  elapsedSeconds: number;
}[]> {
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  // Get today's attendance for the branch
  const attendanceQuery = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('branchId', '==', branchId),
    where('date', '>=', Timestamp.fromDate(today)),
    where('date', '<=', Timestamp.fromDate(tomorrow))
  );

  const snapshot = await getDocs(attendanceQuery);
  const activeEmployees: {
    employee: Employee;
    attendance: AttendanceRecord;
    elapsedSeconds: number;
  }[] = [];

  for (const doc of snapshot.docs) {
    const attendance = doc.data() as AttendanceRecord;

    // Only include employees who are clocked in but not clocked out
    if (attendance.checkIn && !attendance.checkOut) {
      const employee = await getEmployee(attendance.employeeId);
      if (employee) {
        // Convert Firestore Timestamp to Date if needed (using duck typing)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkIn = attendance.checkIn as any;
        const checkInTime = checkIn?.toDate ? checkIn.toDate() : new Date(checkIn);
        const elapsedSeconds = Math.floor((Date.now() - checkInTime.getTime()) / 1000);

        activeEmployees.push({
          employee,
          attendance,
          elapsedSeconds,
        });
      }
    }
  }

  return activeEmployees;
}
