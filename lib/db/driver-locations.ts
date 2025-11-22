/**
 * Driver Location Database Functions
 *
 * Provides real-time location tracking for drivers during active deliveries.
 * Used in customer portal for live delivery tracking.
 *
 * @module lib/db/driver-locations
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { DriverLocation } from './schema';

/**
 * Get current driver location for a delivery
 *
 * @param deliveryId - Delivery ID
 * @returns Promise<DriverLocation | null>
 */
export async function getDriverLocation(
  deliveryId: string
): Promise<DriverLocation | null> {
  const locationRef = doc(db, 'driverLocations', deliveryId);
  const locationSnap = await getDoc(locationRef);

  if (!locationSnap.exists()) {
    return null;
  }

  return locationSnap.data() as DriverLocation;
}

/**
 * Update driver location
 *
 * @param deliveryId - Delivery ID
 * @param location - New location coordinates
 * @param heading - Optional heading/direction in degrees
 * @param speed - Optional speed in meters per second
 * @returns Promise<void>
 */
export async function updateDriverLocation(
  deliveryId: string,
  location: { lat: number; lng: number },
  heading?: number,
  speed?: number
): Promise<void> {
  const locationRef = doc(db, 'driverLocations', deliveryId);
  const locationDoc = await getDoc(locationRef);

  const data: Partial<DriverLocation> = {
    location,
    heading,
    speed,
    lastUpdated: Timestamp.now(),
    isActive: true,
  };

  if (locationDoc.exists()) {
    // Update existing location
    await updateDoc(locationRef, data);
  } else {
    // Create new location document
    // Note: driverId should be set when creating the location
    await setDoc(locationRef, {
      deliveryId,
      ...data,
    } as DriverLocation);
  }
}

/**
 * Initialize driver location tracking for a delivery
 *
 * @param deliveryId - Delivery ID
 * @param driverId - Driver UID
 * @param initialLocation - Initial location coordinates
 * @returns Promise<void>
 */
export async function initializeDriverLocation(
  deliveryId: string,
  driverId: string,
  initialLocation: { lat: number; lng: number }
): Promise<void> {
  const locationRef = doc(db, 'driverLocations', deliveryId);

  const locationData: DriverLocation = {
    deliveryId,
    driverId,
    location: initialLocation,
    lastUpdated: Timestamp.now(),
    isActive: true,
  };

  await setDoc(locationRef, locationData);
}

/**
 * Deactivate driver location tracking
 * Called when delivery is completed
 *
 * @param deliveryId - Delivery ID
 * @returns Promise<void>
 */
export async function deactivateDriverLocation(
  deliveryId: string
): Promise<void> {
  const locationRef = doc(db, 'driverLocations', deliveryId);

  await updateDoc(locationRef, {
    isActive: false,
    lastUpdated: Timestamp.now(),
  });
}

/**
 * Subscribe to real-time driver location updates
 *
 * @param deliveryId - Delivery ID
 * @param callback - Callback function called on location updates
 * @returns Unsubscribe function
 */
export function subscribeToDriverLocation(
  deliveryId: string,
  callback: (location: DriverLocation | null) => void
): Unsubscribe {
  const locationRef = doc(db, 'driverLocations', deliveryId);

  return onSnapshot(
    locationRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as DriverLocation);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to driver location:', error);
      callback(null);
    }
  );
}

/**
 * Check if driver location is stale
 * Returns true if no updates for more than 5 minutes
 *
 * @param location - Driver location document
 * @returns boolean
 */
export function isLocationStale(location: DriverLocation | null): boolean {
  if (!location || !location.lastUpdated) {
    return true;
  }

  const now = new Date();
  const lastUpdate = location.lastUpdated.toDate();
  const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 1000 / 60;

  return minutesSinceUpdate > 5;
}
