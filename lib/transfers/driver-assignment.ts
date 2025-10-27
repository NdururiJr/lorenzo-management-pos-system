/**
 * Driver Assignment Algorithm
 *
 * This file implements the auto-assignment algorithm for drivers
 * to transfer batches based on proximity and capacity.
 *
 * @module lib/transfers/driver-assignment
 */

import { getDocuments } from '../db/index';
import { where } from 'firebase/firestore';
import type { User, Branch } from '../db/schema';

/**
 * Calculate distance between two locations (simplified)
 * In production, use Google Maps Distance Matrix API
 *
 * @param lat1 - Latitude of first location
 * @param lon1 - Longitude of first location
 * @param lat2 - Latitude of second location
 * @param lon2 - Longitude of second location
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get available drivers at a branch
 *
 * @param branchId - Branch ID
 * @returns Array of available drivers
 */
export async function getAvailableDrivers(branchId: string): Promise<User[]> {
  return getDocuments<User>('users', where('role', '==', 'driver'), where('branchId', '==', branchId));
}

/**
 * Auto-assign driver to transfer batch
 * Algorithm factors:
 * 1. Driver availability at satellite store
 * 2. Current workload (number of active batches)
 * 3. Proximity to destination
 *
 * @param satelliteBranchId - Source satellite branch ID
 * @param mainStoreBranchId - Destination main store branch ID
 * @returns Assigned driver ID or null if no drivers available
 */
export async function autoAssignDriver(
  satelliteBranchId: string,
  mainStoreBranchId: string
): Promise<string | null> {
  // Get all drivers at satellite branch
  const drivers = await getAvailableDrivers(satelliteBranchId);

  if (drivers.length === 0) {
    return null; // No drivers available
  }

  // Get active transfer batches to calculate workload
  const activeBatches = await getDocuments<any>(
    'transferBatches',
    where('status', 'in', ['pending', 'in_transit'])
  );

  // Calculate workload for each driver
  const driverWorkload = new Map<string, number>();
  activeBatches.forEach((batch: any) => {
    if (batch.assignedDriverId) {
      const current = driverWorkload.get(batch.assignedDriverId) || 0;
      driverWorkload.set(batch.assignedDriverId, current + 1);
    }
  });

  // Score each driver (lower is better)
  const driverScores = drivers.map((driver) => {
    const workload = driverWorkload.get(driver.uid) || 0;

    // Simple scoring: prioritize drivers with less workload
    // In production, also factor in distance and driver capacity
    const score = workload * 10; // Weight workload heavily

    return {
      driverId: driver.uid,
      score,
      workload,
    };
  });

  // Sort by score (ascending)
  driverScores.sort((a, b) => a.score - b.score);

  // Return driver with lowest score
  return driverScores[0].driverId;
}

/**
 * Get driver workload statistics
 *
 * @param driverId - Driver UID
 * @returns Workload stats
 */
export async function getDriverWorkload(driverId: string): Promise<{
  pendingBatches: number;
  inTransitBatches: number;
  totalActive: number;
}> {
  const activeBatches = await getDocuments<any>(
    'transferBatches',
    where('assignedDriverId', '==', driverId),
    where('status', 'in', ['pending', 'in_transit'])
  );

  const pending = activeBatches.filter((b: any) => b.status === 'pending').length;
  const inTransit = activeBatches.filter((b: any) => b.status === 'in_transit').length;

  return {
    pendingBatches: pending,
    inTransitBatches: inTransit,
    totalActive: activeBatches.length,
  };
}
