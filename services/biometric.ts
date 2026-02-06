/**
 * Biometric Service
 *
 * Device abstraction layer for biometric attendance systems.
 * Supports multiple vendors: ZKTeco, Suprema, Hikvision, and generic devices.
 *
 * @module services/biometric
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
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  BiometricDevice,
  BiometricEvent,
  BiometricVendor,
  BiometricEventType,
  Employee,
} from '@/lib/db/schema';
import { clockIn, clockOut, getTodayAttendance } from '@/lib/db/attendance';

// Collections
const DEVICES_COLLECTION = 'biometricDevices';
const EVENTS_COLLECTION = 'biometricEvents';
const EMPLOYEES_COLLECTION = 'employees';

/**
 * Parsed biometric event data from device webhook
 */
export interface BiometricEventData {
  biometricId: string;
  eventType: BiometricEventType;
  timestamp: Date;
  rawData?: Record<string, unknown>;
}

/**
 * Biometric adapter interface for vendor abstraction
 */
export interface BiometricAdapter {
  vendor: BiometricVendor;
  parseWebhookPayload(payload: unknown): BiometricEventData;
  validateSignature?(payload: unknown, signature: string, secretKey: string): boolean;
}

/**
 * ZKTeco adapter for ZKBioAccess Cloud / ZKBioTime devices
 */
export class ZKTecoAdapter implements BiometricAdapter {
  vendor: BiometricVendor = 'zkteco';

  parseWebhookPayload(payload: unknown): BiometricEventData {
    const data = payload as Record<string, unknown>;

    // ZKTeco payload format (may vary by device model)
    // Common fields: user_id, punch_time, punch_type, device_sn
    const biometricId = String(data.user_id || data.userId || data.pin || '');
    const punchType = data.punch_type || data.punchType || data.status;

    // Determine event type
    let eventType: BiometricEventType = 'unknown';
    if (punchType === 0 || punchType === 'in' || punchType === 'clock_in') {
      eventType = 'clock_in';
    } else if (punchType === 1 || punchType === 'out' || punchType === 'clock_out') {
      eventType = 'clock_out';
    }

    // Parse timestamp
    const punchTime = data.punch_time || data.punchTime || data.time;
    let timestamp: Date;
    if (typeof punchTime === 'string') {
      timestamp = new Date(punchTime);
    } else if (typeof punchTime === 'number') {
      timestamp = new Date(punchTime * 1000); // Unix timestamp
    } else {
      timestamp = new Date();
    }

    return {
      biometricId,
      eventType,
      timestamp,
      rawData: data,
    };
  }

  validateSignature(payload: unknown, signature: string, secretKey: string): boolean {
    // ZKTeco signature validation varies by setup
    // Implement based on your ZKBioAccess configuration
    // For now, return true if signature matches simple hash
    if (!signature || !secretKey) return true;

    // Basic validation - in production, use proper HMAC validation
    const expectedSignature = Buffer.from(
      JSON.stringify(payload) + secretKey
    ).toString('base64').substring(0, 32);

    return signature === expectedSignature;
  }
}

/**
 * Suprema adapter for BioStar 2 devices
 */
export class SupremaAdapter implements BiometricAdapter {
  vendor: BiometricVendor = 'suprema';

  parseWebhookPayload(payload: unknown): BiometricEventData {
    const data = payload as Record<string, unknown>;

    // Suprema BioStar 2 payload format
    // Common fields: user_id, datetime, event_type_id, device_id
    const biometricId = String(data.user_id || data.userId || '');
    const eventTypeId = data.event_type_id || data.eventTypeId;

    let eventType: BiometricEventType = 'unknown';
    // BioStar 2 event type IDs
    if (eventTypeId === 4608 || eventTypeId === 'IDENTIFY_SUCCESS_ENTRY') {
      eventType = 'clock_in';
    } else if (eventTypeId === 4609 || eventTypeId === 'IDENTIFY_SUCCESS_EXIT') {
      eventType = 'clock_out';
    }

    const datetime = data.datetime || data.time || data.timestamp;
    let timestamp: Date;
    if (typeof datetime === 'string') {
      timestamp = new Date(datetime);
    } else {
      timestamp = new Date();
    }

    return {
      biometricId,
      eventType,
      timestamp,
      rawData: data,
    };
  }

  validateSignature(payload: unknown, signature: string, secretKey: string): boolean {
    // Suprema uses API key in headers, not payload signature
    return true;
  }
}

/**
 * Hikvision adapter for DS-K series devices
 */
export class HikvisionAdapter implements BiometricAdapter {
  vendor: BiometricVendor = 'hikvision';

  parseWebhookPayload(payload: unknown): BiometricEventData {
    const data = payload as Record<string, unknown>;

    // Hikvision ISAPI format (XML/JSON)
    // Common fields: employeeNo, time, eventType
    const biometricId = String(data.employeeNo || data.employeeNoString || '');
    const eventType_raw = data.eventType || data.type;

    let eventType: BiometricEventType = 'unknown';
    if (eventType_raw === 'in' || eventType_raw === 'entry' || eventType_raw === 1) {
      eventType = 'clock_in';
    } else if (eventType_raw === 'out' || eventType_raw === 'exit' || eventType_raw === 2) {
      eventType = 'clock_out';
    }

    const time = data.time || data.dateTime || data.timestamp;
    let timestamp: Date;
    if (typeof time === 'string') {
      // Hikvision format: YYYY-MM-DDTHH:mm:ss+08:00
      timestamp = new Date(time);
    } else {
      timestamp = new Date();
    }

    return {
      biometricId,
      eventType,
      timestamp,
      rawData: data,
    };
  }
}

/**
 * Generic adapter for custom devices
 */
export class GenericAdapter implements BiometricAdapter {
  vendor: BiometricVendor = 'generic';

  parseWebhookPayload(payload: unknown): BiometricEventData {
    const data = payload as Record<string, unknown>;

    // Look for common field names
    const biometricId = String(
      data.biometricId ||
      data.user_id ||
      data.userId ||
      data.employeeId ||
      data.cardNo ||
      data.pin ||
      ''
    );

    const eventType_raw = data.eventType || data.event_type || data.type || data.action;
    let eventType: BiometricEventType = 'unknown';

    if (
      eventType_raw === 'clock_in' ||
      eventType_raw === 'in' ||
      eventType_raw === 'entry' ||
      eventType_raw === 0
    ) {
      eventType = 'clock_in';
    } else if (
      eventType_raw === 'clock_out' ||
      eventType_raw === 'out' ||
      eventType_raw === 'exit' ||
      eventType_raw === 1
    ) {
      eventType = 'clock_out';
    }

    const time =
      data.timestamp ||
      data.time ||
      data.datetime ||
      data.date_time ||
      data.eventTime;

    let timestamp: Date;
    if (typeof time === 'string') {
      timestamp = new Date(time);
    } else if (typeof time === 'number') {
      timestamp = new Date(time * 1000);
    } else {
      timestamp = new Date();
    }

    return {
      biometricId,
      eventType,
      timestamp,
      rawData: data,
    };
  }
}

/**
 * Get the appropriate adapter for a vendor
 */
export function getAdapter(vendor: BiometricVendor): BiometricAdapter {
  switch (vendor) {
    case 'zkteco':
      return new ZKTecoAdapter();
    case 'suprema':
      return new SupremaAdapter();
    case 'hikvision':
      return new HikvisionAdapter();
    default:
      return new GenericAdapter();
  }
}

/**
 * Get biometric device by ID
 */
export async function getDevice(deviceId: string): Promise<BiometricDevice | null> {
  const deviceQuery = query(
    collection(db, DEVICES_COLLECTION),
    where('deviceId', '==', deviceId),
    limit(1)
  );

  const snapshot = await getDocs(deviceQuery);
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as BiometricDevice;
}

/**
 * Get device by IP address
 */
export async function getDeviceByIP(ipAddress: string): Promise<BiometricDevice | null> {
  const deviceQuery = query(
    collection(db, DEVICES_COLLECTION),
    where('ipAddress', '==', ipAddress),
    where('active', '==', true),
    limit(1)
  );

  const snapshot = await getDocs(deviceQuery);
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as BiometricDevice;
}

/**
 * Get device by serial number
 */
export async function getDeviceBySerial(serialNumber: string): Promise<BiometricDevice | null> {
  const deviceQuery = query(
    collection(db, DEVICES_COLLECTION),
    where('serialNumber', '==', serialNumber),
    where('active', '==', true),
    limit(1)
  );

  const snapshot = await getDocs(deviceQuery);
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as BiometricDevice;
}

/**
 * Get employee by biometric ID
 */
export async function getEmployeeByBiometricId(
  biometricId: string
): Promise<Employee | null> {
  const employeeQuery = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('biometricIds', 'array-contains', biometricId),
    where('active', '==', true),
    limit(1)
  );

  const snapshot = await getDocs(employeeQuery);
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as Employee;
}

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BIO-${timestamp}-${random}`.toUpperCase();
}

/**
 * Record a biometric event
 */
export async function recordBiometricEvent(
  deviceId: string,
  branchId: string,
  eventData: BiometricEventData,
  employeeId?: string
): Promise<BiometricEvent> {
  const eventId = generateEventId();

  const event: BiometricEvent = {
    eventId,
    deviceId,
    branchId,
    employeeId,
    biometricId: eventData.biometricId,
    eventType: eventData.eventType,
    timestamp: Timestamp.fromDate(eventData.timestamp),
    rawData: eventData.rawData,
    processed: false,
  };

  await addDoc(collection(db, EVENTS_COLLECTION), event);

  return event;
}

/**
 * Process a clock event (create attendance record)
 */
export async function processClockEvent(event: BiometricEvent): Promise<{
  success: boolean;
  attendanceId?: string;
  error?: string;
}> {
  if (!event.employeeId) {
    return {
      success: false,
      error: 'No employee associated with this biometric ID',
    };
  }

  try {
    if (event.eventType === 'clock_in') {
      // Clock in
      const attendance = await clockIn({
        employeeId: event.employeeId,
        branchId: event.branchId,
        source: 'biometric',
        biometricEventId: event.eventId,
        deviceId: event.deviceId,
        recordedBy: 'system',
      });

      // Update event as processed
      await updateBiometricEvent(event.eventId, {
        processed: true,
        attendanceRecordId: attendance.attendanceId,
      });

      return {
        success: true,
        attendanceId: attendance.attendanceId,
      };
    } else if (event.eventType === 'clock_out') {
      // Get today's attendance to clock out
      const todayAttendance = await getTodayAttendance(event.employeeId);

      if (!todayAttendance || !todayAttendance.checkIn) {
        return {
          success: false,
          error: 'No clock-in record found for today',
        };
      }

      if (todayAttendance.checkOut) {
        return {
          success: false,
          error: 'Already clocked out today',
        };
      }

      const attendance = await clockOut({
        attendanceId: todayAttendance.attendanceId,
        recordedBy: 'system',
        notes: `Biometric clock-out from device ${event.deviceId}`,
      });

      // Update event as processed
      await updateBiometricEvent(event.eventId, {
        processed: true,
        attendanceRecordId: attendance.attendanceId,
      });

      return {
        success: true,
        attendanceId: attendance.attendanceId,
      };
    } else {
      return {
        success: false,
        error: 'Unknown event type',
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update event with error
    await updateBiometricEvent(event.eventId, {
      processed: true,
      processingError: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update biometric event
 */
async function updateBiometricEvent(
  eventId: string,
  updates: Partial<BiometricEvent>
): Promise<void> {
  const eventQuery = query(
    collection(db, EVENTS_COLLECTION),
    where('eventId', '==', eventId),
    limit(1)
  );

  const snapshot = await getDocs(eventQuery);
  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, updates);
  }
}

/**
 * Enroll an employee's biometric ID
 */
export async function enrollEmployee(
  employeeId: string,
  biometricId: string
): Promise<void> {
  // Check if biometric ID is already enrolled
  const existingEmployee = await getEmployeeByBiometricId(biometricId);
  if (existingEmployee) {
    throw new Error(`Biometric ID ${biometricId} is already enrolled for employee ${existingEmployee.name}`);
  }

  // Get employee
  const employeeQuery = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('employeeId', '==', employeeId),
    limit(1)
  );

  const snapshot = await getDocs(employeeQuery);
  if (snapshot.empty) {
    throw new Error(`Employee not found: ${employeeId}`);
  }

  const employeeDoc = snapshot.docs[0];
  const employee = employeeDoc.data() as Employee;

  // Add biometric ID
  const existingIds = employee.biometricIds || [];
  if (existingIds.includes(biometricId)) {
    throw new Error('Biometric ID already enrolled for this employee');
  }

  await updateDoc(employeeDoc.ref, {
    biometricIds: [...existingIds, biometricId],
    biometricEnrolled: true,
  });
}

/**
 * Remove an employee's biometric ID
 */
export async function unenrollBiometricId(
  employeeId: string,
  biometricId: string
): Promise<void> {
  const employeeQuery = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('employeeId', '==', employeeId),
    limit(1)
  );

  const snapshot = await getDocs(employeeQuery);
  if (snapshot.empty) {
    throw new Error(`Employee not found: ${employeeId}`);
  }

  const employeeDoc = snapshot.docs[0];
  const employee = employeeDoc.data() as Employee;

  const existingIds = employee.biometricIds || [];
  const updatedIds = existingIds.filter(id => id !== biometricId);

  await updateDoc(employeeDoc.ref, {
    biometricIds: updatedIds,
    biometricEnrolled: updatedIds.length > 0,
  });
}

/**
 * Get all devices for a branch
 */
export async function getBranchDevices(branchId: string): Promise<BiometricDevice[]> {
  const deviceQuery = query(
    collection(db, DEVICES_COLLECTION),
    where('branchId', '==', branchId),
    where('active', '==', true)
  );

  const snapshot = await getDocs(deviceQuery);
  return snapshot.docs.map(doc => doc.data() as BiometricDevice);
}

/**
 * Get unprocessed events
 */
export async function getUnprocessedEvents(limitCount: number = 100): Promise<BiometricEvent[]> {
  const eventQuery = query(
    collection(db, EVENTS_COLLECTION),
    where('processed', '==', false),
    limit(limitCount)
  );

  const snapshot = await getDocs(eventQuery);
  return snapshot.docs.map(doc => doc.data() as BiometricEvent);
}

/**
 * Update device heartbeat
 */
export async function updateDeviceHeartbeat(deviceId: string): Promise<void> {
  const deviceQuery = query(
    collection(db, DEVICES_COLLECTION),
    where('deviceId', '==', deviceId),
    limit(1)
  );

  const snapshot = await getDocs(deviceQuery);
  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, {
      lastHeartbeat: Timestamp.now(),
    });
  }
}

/**
 * Create a new biometric device
 */
export async function createDevice(
  device: Omit<BiometricDevice, 'deviceId' | 'createdAt' | 'lastSync'>
): Promise<BiometricDevice> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  const deviceId = `DEV-${timestamp}-${random}`.toUpperCase();

  const newDevice: BiometricDevice = {
    ...device,
    deviceId,
    createdAt: Timestamp.now(),
    lastSync: Timestamp.now(),
  };

  await addDoc(collection(db, DEVICES_COLLECTION), newDevice);

  return newDevice;
}

/**
 * Update device configuration
 */
export async function updateDevice(
  deviceId: string,
  updates: Partial<Omit<BiometricDevice, 'deviceId' | 'createdAt'>>
): Promise<void> {
  const deviceQuery = query(
    collection(db, DEVICES_COLLECTION),
    where('deviceId', '==', deviceId),
    limit(1)
  );

  const snapshot = await getDocs(deviceQuery);
  if (snapshot.empty) {
    throw new Error(`Device not found: ${deviceId}`);
  }

  await updateDoc(snapshot.docs[0].ref, updates);
}

/**
 * Deactivate a device
 */
export async function deactivateDevice(deviceId: string): Promise<void> {
  await updateDevice(deviceId, { active: false });
}
