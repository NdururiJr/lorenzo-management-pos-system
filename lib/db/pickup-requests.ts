/**
 * Pickup Request Database Operations
 *
 * This file provides type-safe CRUD operations for pickup requests.
 * Used for customer pickup scheduling and driver assignment.
 *
 * @module lib/db/pickup-requests
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
} from './index';
import type { TimeSlot, PickupRequestStatus } from '@/lib/agents/types';

/**
 * Address structure for pickup/delivery
 */
export interface PickupAddress {
  label: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Pickup request stored in Firestore
 */
export interface PickupRequest {
  requestId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  // Service Details
  serviceTypes: string[];
  itemDescription: string;
  expressService: boolean;
  specialInstructions?: string;

  // Pickup Details
  pickupAddress: PickupAddress;
  preferredDate: Timestamp;
  timeSlot: TimeSlot;

  // Status & Assignment
  status: PickupRequestStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  confirmedTime?: Timestamp;

  // Conversion to Order
  convertedOrderId?: string;
  convertedAt?: Timestamp;

  // Metadata
  source: 'website' | 'chatbot' | 'phone';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Generate a unique pickup request ID
 * Format: REQ-[YYYYMMDD]-[RANDOM]
 */
export function generatePickupRequestId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `REQ-${dateStr}-${random}`;
}

/**
 * Create a new pickup request
 *
 * @param data - Pickup request data
 * @returns The created request ID
 */
export async function createPickupRequest(data: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceTypes: string[];
  itemDescription: string;
  expressService?: boolean;
  specialInstructions?: string;
  pickupAddress: PickupAddress;
  preferredDate: Date;
  timeSlot: TimeSlot;
  source?: 'website' | 'chatbot' | 'phone';
}): Promise<string> {
  const requestId = generatePickupRequestId();
  const now = Timestamp.now();

  const request = {
    requestId,
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    serviceTypes: data.serviceTypes,
    itemDescription: data.itemDescription,
    expressService: data.expressService || false,
    specialInstructions: data.specialInstructions,
    pickupAddress: data.pickupAddress,
    preferredDate: Timestamp.fromDate(data.preferredDate),
    timeSlot: data.timeSlot,
    status: 'pending' as const,
    source: data.source || 'website',
    updatedAt: now,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await setDocument<PickupRequest>('pickup_requests', requestId, request as any);

  return requestId;
}

/**
 * Get pickup request by ID
 */
export async function getPickupRequest(requestId: string): Promise<PickupRequest> {
  return getDocument<PickupRequest>('pickup_requests', requestId);
}

/**
 * Get pickup requests by customer ID
 */
export async function getPickupRequestsByCustomer(
  customerId: string,
  limitCount = 20
): Promise<PickupRequest[]> {
  return getDocuments<PickupRequest>(
    'pickup_requests',
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get pickup requests by status
 */
export async function getPickupRequestsByStatus(
  status: PickupRequestStatus,
  limitCount = 50
): Promise<PickupRequest[]> {
  return getDocuments<PickupRequest>(
    'pickup_requests',
    where('status', '==', status),
    orderBy('preferredDate', 'asc'),
    limit(limitCount)
  );
}

/**
 * Get pickup requests by date range
 */
export async function getPickupRequestsByDateRange(
  startDate: Date,
  endDate: Date,
  limitCount = 100
): Promise<PickupRequest[]> {
  return getDocuments<PickupRequest>(
    'pickup_requests',
    where('preferredDate', '>=', Timestamp.fromDate(startDate)),
    where('preferredDate', '<=', Timestamp.fromDate(endDate)),
    orderBy('preferredDate', 'asc'),
    limit(limitCount)
  );
}

/**
 * Get pickup requests assigned to a driver
 */
export async function getPickupRequestsByDriver(
  driverId: string,
  date?: Date
): Promise<PickupRequest[]> {
  const constraints = [
    where('assignedDriverId', '==', driverId),
    orderBy('preferredDate', 'asc'),
  ];

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return getDocuments<PickupRequest>(
      'pickup_requests',
      where('assignedDriverId', '==', driverId),
      where('preferredDate', '>=', Timestamp.fromDate(startOfDay)),
      where('preferredDate', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('preferredDate', 'asc')
    );
  }

  return getDocuments<PickupRequest>('pickup_requests', ...constraints);
}

/**
 * Get pending pickup requests (for staff dashboard)
 */
export async function getPendingPickupRequests(
  limitCount = 50
): Promise<PickupRequest[]> {
  return getDocuments<PickupRequest>(
    'pickup_requests',
    where('status', 'in', ['pending', 'confirmed']),
    orderBy('preferredDate', 'asc'),
    limit(limitCount)
  );
}

/**
 * Update pickup request status
 */
export async function updatePickupRequestStatus(
  requestId: string,
  status: PickupRequestStatus
): Promise<void> {
  await updateDocument<PickupRequest>('pickup_requests', requestId, {
    status,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Assign driver to pickup request
 */
export async function assignDriverToPickup(
  requestId: string,
  driverId: string,
  driverName: string,
  confirmedTime?: Date
): Promise<void> {
  const updates: Partial<PickupRequest> = {
    assignedDriverId: driverId,
    assignedDriverName: driverName,
    status: 'assigned',
    updatedAt: Timestamp.now(),
  };

  if (confirmedTime) {
    updates.confirmedTime = Timestamp.fromDate(confirmedTime);
  }

  await updateDocument<PickupRequest>('pickup_requests', requestId, updates);
}

/**
 * Update pickup request to confirmed
 */
export async function confirmPickupRequest(
  requestId: string,
  confirmedTime?: Date
): Promise<void> {
  const updates: Partial<PickupRequest> = {
    status: 'confirmed',
    updatedAt: Timestamp.now(),
  };

  if (confirmedTime) {
    updates.confirmedTime = Timestamp.fromDate(confirmedTime);
  }

  await updateDocument<PickupRequest>('pickup_requests', requestId, updates);
}

/**
 * Mark pickup as completed (items picked up)
 */
export async function completePickup(requestId: string): Promise<void> {
  await updateDocument<PickupRequest>('pickup_requests', requestId, {
    status: 'picked_up',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Mark pickup as at facility
 */
export async function markPickupAtFacility(requestId: string): Promise<void> {
  await updateDocument<PickupRequest>('pickup_requests', requestId, {
    status: 'at_facility',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Convert pickup request to order
 */
export async function convertPickupToOrder(
  requestId: string,
  orderId: string
): Promise<void> {
  await updateDocument<PickupRequest>('pickup_requests', requestId, {
    status: 'converted',
    convertedOrderId: orderId,
    convertedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

/**
 * Cancel pickup request
 */
export async function cancelPickupRequest(
  requestId: string,
  reason?: string
): Promise<void> {
  const updates: Partial<PickupRequest> = {
    status: 'cancelled',
    updatedAt: Timestamp.now(),
  };

  if (reason) {
    updates.specialInstructions = `Cancelled: ${reason}`;
  }

  await updateDocument<PickupRequest>('pickup_requests', requestId, updates);
}

/**
 * Update pickup request details
 */
export async function updatePickupRequest(
  requestId: string,
  data: Partial<Omit<PickupRequest, 'requestId' | 'createdAt' | 'customerId'>>
): Promise<void> {
  await updateDocument<PickupRequest>('pickup_requests', requestId, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete pickup request (admin only)
 */
export async function deletePickupRequest(requestId: string): Promise<void> {
  return deleteDocument('pickup_requests', requestId);
}

/**
 * Get available time slots for a given date
 * Returns slots that are not fully booked
 */
export async function getAvailableTimeSlots(
  date: Date,
  maxPerSlot = 10
): Promise<TimeSlot[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all requests for this date
  const requests = await getDocuments<PickupRequest>(
    'pickup_requests',
    where('preferredDate', '>=', Timestamp.fromDate(startOfDay)),
    where('preferredDate', '<=', Timestamp.fromDate(endOfDay)),
    where('status', 'in', ['pending', 'confirmed', 'assigned'])
  );

  // Count requests per slot
  const slotCounts: Record<TimeSlot, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
  };

  for (const request of requests) {
    slotCounts[request.timeSlot]++;
  }

  // Return available slots
  const availableSlots: TimeSlot[] = [];
  for (const [slot, count] of Object.entries(slotCounts)) {
    if (count < maxPerSlot) {
      availableSlots.push(slot as TimeSlot);
    }
  }

  return availableSlots;
}

/**
 * Get pickup request statistics for a date range
 */
export async function getPickupRequestStats(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  assigned: number;
  completed: number;
  cancelled: number;
  converted: number;
}> {
  const requests = await getPickupRequestsByDateRange(startDate, endDate, 1000);

  const stats = {
    total: requests.length,
    pending: 0,
    confirmed: 0,
    assigned: 0,
    completed: 0,
    cancelled: 0,
    converted: 0,
  };

  for (const request of requests) {
    switch (request.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'confirmed':
        stats.confirmed++;
        break;
      case 'assigned':
      case 'in_transit':
        stats.assigned++;
        break;
      case 'picked_up':
      case 'at_facility':
        stats.completed++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
      case 'converted':
        stats.converted++;
        break;
    }
  }

  return stats;
}
