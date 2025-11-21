/**
 * Delivery Database Functions
 *
 * CRUD operations for the deliveries collection.
 *
 * @module lib/db/deliveries
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Delivery, DeliveryStatus } from './schema';

/**
 * Generate a unique delivery ID
 *
 * Format: DEL-[YYYYMMDD]-[####]
 */
export function generateDeliveryId(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `DEL${dateStr}${random}`;
}

/**
 * Create a new delivery
 *
 * @param delivery - Delivery data
 * @returns Promise<void>
 */
export async function createDelivery(delivery: Delivery): Promise<void> {
  const deliveryRef = doc(db, 'deliveries', delivery.deliveryId);
  await setDoc(deliveryRef, delivery);
}

/**
 * Get a single delivery by ID
 *
 * @param deliveryId - Delivery ID
 * @returns Promise<Delivery>
 * @throws Error if delivery not found
 */
export async function getDelivery(deliveryId: string): Promise<Delivery> {
  const deliveryRef = doc(db, 'deliveries', deliveryId);
  const deliverySnap = await getDoc(deliveryRef);

  if (!deliverySnap.exists()) {
    throw new Error(`Delivery not found: ${deliveryId}`);
  }

  return deliverySnap.data() as Delivery;
}

/**
 * Get all deliveries for a specific driver
 *
 * @param driverId - Driver UID
 * @param status - Optional status filter
 * @returns Promise<Delivery[]>
 */
export async function getDeliveriesByDriver(
  driverId: string,
  status?: DeliveryStatus
): Promise<Delivery[]> {
  const deliveriesRef = collection(db, 'deliveries');

  let q = query(
    deliveriesRef,
    where('driverId', '==', driverId),
    orderBy('startTime', 'desc')
  );

  if (status) {
    q = query(
      deliveriesRef,
      where('driverId', '==', driverId),
      where('status', '==', status),
      orderBy('startTime', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Delivery);
}

/**
 * Get all active deliveries (pending or in_progress)
 *
 * @returns Promise<Delivery[]>
 */
export async function getActiveDeliveries(): Promise<Delivery[]> {
  const deliveriesRef = collection(db, 'deliveries');

  const pendingQuery = query(
    deliveriesRef,
    where('status', '==', 'pending'),
    orderBy('startTime', 'desc')
  );

  const inProgressQuery = query(
    deliveriesRef,
    where('status', '==', 'in_progress'),
    orderBy('startTime', 'desc')
  );

  const [pendingSnap, inProgressSnap] = await Promise.all([
    getDocs(pendingQuery),
    getDocs(inProgressQuery),
  ]);

  const pending = pendingSnap.docs.map((doc) => doc.data() as Delivery);
  const inProgress = inProgressSnap.docs.map((doc) => doc.data() as Delivery);

  return [...inProgress, ...pending];
}

/**
 * Get all deliveries with optional status filter
 *
 * @param status - Optional status filter
 * @returns Promise<Delivery[]>
 */
export async function getAllDeliveries(status?: DeliveryStatus): Promise<Delivery[]> {
  const deliveriesRef = collection(db, 'deliveries');

  let q = query(deliveriesRef, orderBy('startTime', 'desc'));

  if (status) {
    q = query(
      deliveriesRef,
      where('status', '==', status),
      orderBy('startTime', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Delivery);
}

/**
 * Update delivery status
 *
 * @param deliveryId - Delivery ID
 * @param status - New status
 * @param startTime - Optional start timestamp (for in_progress status)
 * @param endTime - Optional end timestamp (for completed status)
 * @returns Promise<void>
 */
export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  startTime?: Timestamp,
  endTime?: Timestamp
): Promise<void> {
  const deliveryRef = doc(db, 'deliveries', deliveryId);

  const updates: Partial<Delivery> = {
    status,
  };

  if (startTime) {
    updates.startTime = startTime;
  }

  if (endTime) {
    updates.endTime = endTime;
  }

  await updateDoc(deliveryRef, updates);
}

/**
 * Update delivery route
 *
 * @param deliveryId - Delivery ID
 * @param route - New route data
 * @returns Promise<void>
 */
export async function updateDeliveryRoute(
  deliveryId: string,
  route: Delivery['route']
): Promise<void> {
  const deliveryRef = doc(db, 'deliveries', deliveryId);
  await updateDoc(deliveryRef, { route });
}

/**
 * Update a specific stop status in a delivery
 *
 * @param deliveryId - Delivery ID
 * @param orderId - Order ID
 * @param stopStatus - New stop status
 * @param timestamp - Completion/failure timestamp
 * @returns Promise<void>
 */
export async function updateDeliveryStop(
  deliveryId: string,
  orderId: string,
  stopStatus: 'completed' | 'failed',
  timestamp: Timestamp
): Promise<void> {
  const delivery = await getDelivery(deliveryId);

  // Find and update the stop
  const updatedStops = delivery.route.stops.map((stop) => {
    if (stop.orderId === orderId) {
      return {
        ...stop,
        status: stopStatus,
        timestamp,
      };
    }
    return stop;
  });

  const deliveryRef = doc(db, 'deliveries', deliveryId);
  await updateDoc(deliveryRef, {
    route: {
      ...delivery.route,
      stops: updatedStops,
    },
  });

  // Check if all stops are completed
  const allCompleted = updatedStops.every(
    (stop) => stop.status === 'completed' || stop.status === 'failed'
  );

  if (allCompleted) {
    await updateDeliveryStatus(deliveryId, 'completed', undefined, Timestamp.now());
  }
}

/**
 * Delete a delivery
 *
 * @param deliveryId - Delivery ID
 * @returns Promise<void>
 */
export async function deleteDelivery(deliveryId: string): Promise<void> {
  const deliveryRef = doc(db, 'deliveries', deliveryId);
  await deleteDoc(deliveryRef);
}

/**
 * Batch create multiple deliveries
 *
 * @param deliveries - Array of delivery data
 * @returns Promise<void>
 */
export async function batchCreateDeliveries(deliveries: Delivery[]): Promise<void> {
  const batch = writeBatch(db);

  deliveries.forEach((delivery) => {
    const deliveryRef = doc(db, 'deliveries', delivery.deliveryId);
    batch.set(deliveryRef, delivery);
  });

  await batch.commit();
}

/**
 * Get deliveries for multiple branches with status filter
 *
 * @param branchIds - Array of branch IDs (null for all branches)
 * @param status - Optional status filter
 * @returns Promise<number> - Count of deliveries
 */
export async function getDeliveriesCountForBranches(
  branchIds: string[] | null,
  status?: DeliveryStatus
): Promise<number> {
  const deliveriesRef = collection(db, 'deliveries');

  // Super admin - all branches
  if (branchIds === null) {
    const constraints = [];
    if (status) {
      constraints.push(where('status', '==', status));
    }
    const q = query(deliveriesRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // No branches
  if (branchIds.length === 0) {
    return 0;
  }

  // Single branch
  if (branchIds.length === 1) {
    const constraints = [where('branchId', '==', branchIds[0])];
    if (status) {
      constraints.push(where('status', '==', status));
    }
    const q = query(deliveriesRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Multiple branches <= 10 (use 'in' query)
  if (branchIds.length <= 10) {
    const constraints = [where('branchId', 'in', branchIds)];
    if (status) {
      constraints.push(where('status', '==', status));
    }
    const q = query(deliveriesRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // More than 10 branches - query each separately and sum
  let total = 0;
  for (const branchId of branchIds) {
    const constraints = [where('branchId', '==', branchId)];
    if (status) {
      constraints.push(where('status', '==', status));
    }
    const q = query(deliveriesRef, ...constraints);
    const snapshot = await getDocs(q);
    total += snapshot.size;
  }
  return total;
}

/**
 * Get pending deliveries count for branches
 *
 * @param branchIds - Array of branch IDs (null for all branches)
 * @returns Promise<number>
 */
export async function getPendingDeliveriesCountForBranches(
  branchIds: string[] | null
): Promise<number> {
  return getDeliveriesCountForBranches(branchIds, 'pending');
}

/**
 * Get today's deliveries count for branches
 *
 * @param branchIds - Array of branch IDs (null for all branches)
 * @returns Promise<number>
 */
export async function getTodayDeliveriesCountForBranches(
  branchIds: string[] | null
): Promise<number> {
  const deliveriesRef = collection(db, 'deliveries');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  // Super admin - all branches
  if (branchIds === null) {
    const q = query(
      deliveriesRef,
      where('startTime', '>=', todayTimestamp)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // No branches
  if (branchIds.length === 0) {
    return 0;
  }

  // Single branch
  if (branchIds.length === 1) {
    const q = query(
      deliveriesRef,
      where('branchId', '==', branchIds[0]),
      where('startTime', '>=', todayTimestamp)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Multiple branches <= 10 (use 'in' query)
  if (branchIds.length <= 10) {
    const q = query(
      deliveriesRef,
      where('branchId', 'in', branchIds),
      where('startTime', '>=', todayTimestamp)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // More than 10 branches - query each separately and sum
  let total = 0;
  for (const branchId of branchIds) {
    const q = query(
      deliveriesRef,
      where('branchId', '==', branchId),
      where('startTime', '>=', todayTimestamp)
    );
    const snapshot = await getDocs(q);
    total += snapshot.size;
  }
  return total;
}

/**
 * Get delivery statistics for a driver
 *
 * @param driverId - Driver UID
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @returns Promise<DeliveryStats>
 */
export interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  totalOrders: number;
  completedOrders: number;
  totalDistance: number;
  totalDuration: number;
  averageOrdersPerDelivery: number;
}

export async function getDriverDeliveryStats(
  driverId: string,
  startDate?: Date,
  endDate?: Date
): Promise<DeliveryStats> {
  const deliveries = await getDeliveriesByDriver(driverId);

  // Filter by date range if provided
  let filteredDeliveries = deliveries;
  if (startDate || endDate) {
    filteredDeliveries = deliveries.filter((delivery) => {
      if (!delivery.startTime) return false;

      const deliveryDate = delivery.startTime.toDate();

      if (startDate && deliveryDate < startDate) return false;
      if (endDate && deliveryDate > endDate) return false;

      return true;
    });
  }

  const stats: DeliveryStats = {
    totalDeliveries: filteredDeliveries.length,
    completedDeliveries: filteredDeliveries.filter((d) => d.status === 'completed')
      .length,
    totalOrders: 0,
    completedOrders: 0,
    totalDistance: 0,
    totalDuration: 0,
    averageOrdersPerDelivery: 0,
  };

  filteredDeliveries.forEach((delivery) => {
    stats.totalOrders += delivery.orders.length;
    stats.totalDistance += delivery.route.distance;
    stats.totalDuration += delivery.route.estimatedDuration;

    // Count completed orders
    const completedStops = delivery.route.stops.filter(
      (stop) => stop.status === 'completed'
    );
    stats.completedOrders += completedStops.length;
  });

  stats.averageOrdersPerDelivery =
    stats.totalDeliveries > 0
      ? Math.round((stats.totalOrders / stats.totalDeliveries) * 10) / 10
      : 0;

  return stats;
}
