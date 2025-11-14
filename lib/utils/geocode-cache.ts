/**
 * Geocoding Cache Utility
 *
 * Caches geocoded addresses in Firestore to reduce Google Maps API costs.
 * Implements a simple cache with TTL (time-to-live) for address lookups.
 *
 * @module lib/utils/geocode-cache
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { geocodeAddress, type GeocodedAddress, type Coordinates } from '@/services/google-maps';

/**
 * Cached geocoding result
 */
interface GeocodingCacheEntry {
  address: string;
  coordinates: Coordinates;
  formattedAddress: string;
  placeId?: string;
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

// Cache collection name
const CACHE_COLLECTION = 'geocoding_cache';

// Default cache TTL (30 days)
const DEFAULT_TTL_DAYS = 30;

/**
 * Generate cache key from address
 *
 * @param address - Address string
 * @returns Cache key (normalized address)
 */
function generateCacheKey(address: string): string {
  return address.toLowerCase().trim().replace(/\s+/g, '_');
}

/**
 * Check if cache entry is expired
 *
 * @param entry - Cache entry
 * @returns True if expired
 */
function isCacheExpired(entry: GeocodingCacheEntry): boolean {
  return entry.expiresAt.toMillis() < Date.now();
}

/**
 * Get geocoded address from cache or API
 *
 * This function checks the cache first and only calls the Google Maps API
 * if the address is not cached or the cache has expired.
 *
 * @param address - Address to geocode
 * @param ttlDays - Cache TTL in days (default: 30)
 * @returns Promise<GeocodedAddress>
 */
export async function getCachedGeocode(
  address: string,
  ttlDays: number = DEFAULT_TTL_DAYS
): Promise<GeocodedAddress> {
  const cacheKey = generateCacheKey(address);
  const cacheRef = doc(db, CACHE_COLLECTION, cacheKey);

  try {
    // Check cache first
    const cacheDoc = await getDoc(cacheRef);

    if (cacheDoc.exists()) {
      const cacheEntry = cacheDoc.data() as GeocodingCacheEntry;

      // Check if cache is still valid
      if (!isCacheExpired(cacheEntry)) {
        console.log(`✅ Cache hit for address: ${address}`);
        return {
          address: cacheEntry.address,
          coordinates: cacheEntry.coordinates,
          formattedAddress: cacheEntry.formattedAddress,
          placeId: cacheEntry.placeId,
        };
      } else {
        console.log(`⚠️ Cache expired for address: ${address}`);
      }
    }

    // Cache miss or expired - call Google Maps API
    console.log(`📍 Geocoding address (cache miss): ${address}`);
    const result = await geocodeAddress(address);

    // Cache the result
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      now.toMillis() + ttlDays * 24 * 60 * 60 * 1000
    );

    const cacheEntry: GeocodingCacheEntry = {
      address: result.address,
      coordinates: result.coordinates,
      formattedAddress: result.formattedAddress,
      placeId: result.placeId,
      cachedAt: now,
      expiresAt,
    };

    await setDoc(cacheRef, cacheEntry);

    return result;
  } catch (error) {
    console.error('Error in getCachedGeocode:', error);
    throw error;
  }
}

/**
 * Batch geocode addresses with caching
 *
 * @param addresses - Array of addresses to geocode
 * @param ttlDays - Cache TTL in days (default: 30)
 * @returns Promise<GeocodedAddress[]>
 */
export async function batchCachedGeocode(
  addresses: string[],
  ttlDays: number = DEFAULT_TTL_DAYS
): Promise<GeocodedAddress[]> {
  const results: GeocodedAddress[] = [];

  for (const address of addresses) {
    try {
      const result = await getCachedGeocode(address, ttlDays);
      results.push(result);
    } catch (error) {
      console.error(`Failed to geocode address: ${address}`, error);
      // Continue with other addresses even if one fails
    }
  }

  return results;
}

/**
 * Pre-cache an address
 *
 * Useful for pre-populating cache during off-peak hours
 *
 * @param address - Address to cache
 * @param coordinates - Known coordinates
 * @param ttlDays - Cache TTL in days (default: 30)
 */
export async function preCacheAddress(
  address: string,
  coordinates: Coordinates,
  ttlDays: number = DEFAULT_TTL_DAYS
): Promise<void> {
  const cacheKey = generateCacheKey(address);
  const cacheRef = doc(db, CACHE_COLLECTION, cacheKey);

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + ttlDays * 24 * 60 * 60 * 1000
  );

  const cacheEntry: GeocodingCacheEntry = {
    address,
    coordinates,
    formattedAddress: address,
    cachedAt: now,
    expiresAt,
  };

  await setDoc(cacheRef, cacheEntry);
}

/**
 * Clear expired cache entries
 *
 * Run this periodically (e.g., daily) to clean up old entries
 *
 * @returns Promise<number> - Number of entries deleted
 */
export async function clearExpiredCache(): Promise<number> {
  const cacheRef = collection(db, CACHE_COLLECTION);
  const now = Timestamp.now();

  // Query for expired entries
  const q = query(cacheRef, where('expiresAt', '<', now));
  const snapshot = await getDocs(q);

  let deletedCount = 0;

  // Delete expired entries
  const deletePromises = snapshot.docs.map(async (docSnap) => {
    await docSnap.ref.delete();
    deletedCount++;
  });

  await Promise.all(deletePromises);

  console.log(`🗑️ Cleared ${deletedCount} expired cache entries`);

  return deletedCount;
}

/**
 * Get cache statistics
 *
 * @returns Promise with cache stats
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
}> {
  const cacheRef = collection(db, CACHE_COLLECTION);
  const snapshot = await getDocs(cacheRef);

  const now = Timestamp.now();
  let validEntries = 0;
  let expiredEntries = 0;

  snapshot.docs.forEach((doc) => {
    const entry = doc.data() as GeocodingCacheEntry;
    if (entry.expiresAt.toMillis() > now.toMillis()) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  });

  return {
    totalEntries: snapshot.size,
    validEntries,
    expiredEntries,
  };
}

/**
 * Invalidate cache for a specific address
 *
 * @param address - Address to invalidate
 */
export async function invalidateCacheEntry(address: string): Promise<void> {
  const cacheKey = generateCacheKey(address);
  const cacheRef = doc(db, CACHE_COLLECTION, cacheKey);

  await cacheRef.delete();
}

/**
 * Clear all cache entries
 *
 * Use with caution! This will delete all cached geocoding results.
 */
export async function clearAllCache(): Promise<void> {
  const cacheRef = collection(db, CACHE_COLLECTION);
  const snapshot = await getDocs(cacheRef);

  const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(deletePromises);

  console.log(`🗑️ Cleared all ${snapshot.size} cache entries`);
}
