/**
 * Firebase Admin SDK Configuration
 *
 * This file initializes Firebase Admin SDK for server-side operations.
 * Used in API routes, serverless functions, and server components.
 *
 * @module lib/firebase-admin
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

/**
 * Parse service account credentials from environment variable
 * Supports both JSON string and base64 encoded JSON
 */
function getServiceAccountCredentials() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.\n' +
        'Please add your Firebase service account JSON to .env.local\n' +
        'You can either:\n' +
        '1. Set it as a JSON string: FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'\n' +
        '2. Set it as base64: FIREBASE_SERVICE_ACCOUNT_KEY=base64_encoded_json'
    );
  }

  try {
    // Try parsing as JSON first
    return JSON.parse(serviceAccount);
  } catch {
    // If that fails, try decoding from base64
    try {
      const decoded = Buffer.from(serviceAccount, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error(
        'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.\n' +
          'Ensure it is valid JSON or base64 encoded JSON.\n' +
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Initialize Firebase Admin SDK (singleton pattern)
 * Only initializes once, even if called multiple times
 */
let adminApp: App;

try {
  if (getApps().length === 0) {
    const credentials = getServiceAccountCredentials();

    adminApp = initializeApp({
      credential: cert(credentials),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log('Firebase Admin SDK initialized successfully');
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  throw error;
}

/**
 * Firebase Admin Auth instance
 * Use for server-side authentication operations
 *
 * @example
 * import { adminAuth } from '@/lib/firebase-admin';
 *
 * // Verify ID token
 * const decodedToken = await adminAuth.verifyIdToken(idToken);
 *
 * // Create custom token
 * const customToken = await adminAuth.createCustomToken(uid);
 *
 * // Get user by email
 * const user = await adminAuth.getUserByEmail(email);
 */
export const adminAuth: Auth = getAuth(adminApp);

/**
 * Firebase Admin Firestore instance
 * Use for server-side database operations
 *
 * @example
 * import { adminDb } from '@/lib/firebase-admin';
 *
 * // Create document
 * await adminDb.collection('orders').doc(orderId).set(orderData);
 *
 * // Query documents
 * const snapshot = await adminDb.collection('orders')
 *   .where('status', '==', 'pending')
 *   .get();
 *
 * // Use transactions
 * await adminDb.runTransaction(async (transaction) => {
 *   const docRef = adminDb.collection('orders').doc(orderId);
 *   const doc = await transaction.get(docRef);
 *   transaction.update(docRef, { status: 'completed' });
 * });
 */
export const adminDb: Firestore = getFirestore(adminApp);

/**
 * Firebase Admin Storage instance
 * Use for server-side file operations
 *
 * @example
 * import { adminStorage } from '@/lib/firebase-admin';
 *
 * // Get bucket
 * const bucket = adminStorage.bucket();
 *
 * // Upload file
 * await bucket.upload(localFilePath, {
 *   destination: 'garments/image.jpg',
 * });
 *
 * // Get download URL
 * const file = bucket.file('garments/image.jpg');
 * const [url] = await file.getSignedUrl({
 *   action: 'read',
 *   expires: Date.now() + 15 * 60 * 1000, // 15 minutes
 * });
 */
export const adminStorage: Storage = getStorage(adminApp);

/**
 * Firebase Admin app instance
 * Export for advanced configuration if needed
 */
export { adminApp };

/**
 * Helper function to verify Firebase ID token
 * Commonly used in API route middleware
 *
 * @param idToken - The Firebase ID token from the client
 * @returns Decoded token with user information
 * @throws Error if token is invalid or expired
 *
 * @example
 * import { verifyIdToken } from '@/lib/firebase-admin';
 *
 * export async function GET(request: Request) {
 *   const token = request.headers.get('Authorization')?.split('Bearer ')[1];
 *   if (!token) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *
 *   try {
 *     const decodedToken = await verifyIdToken(token);
 *     const uid = decodedToken.uid;
 *     // Proceed with authenticated request
 *   } catch (error) {
 *     return new Response('Invalid token', { status: 401 });
 *   }
 * }
 */
export async function verifyIdToken(idToken: string) {
  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Helper function to get user by UID
 *
 * @param uid - The user's unique identifier
 * @returns User record from Firebase Auth
 * @throws Error if user not found
 *
 * @example
 * import { getUserById } from '@/lib/firebase-admin';
 *
 * const user = await getUserById('abc123');
 * console.log(user.email, user.displayName);
 */
export async function getUserById(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('User not found');
  }
}

/**
 * Helper function to create custom claims for role-based access control
 *
 * @param uid - The user's unique identifier
 * @param claims - Custom claims object (e.g., { role: 'admin' })
 *
 * @example
 * import { setCustomClaims } from '@/lib/firebase-admin';
 *
 * await setCustomClaims('abc123', { role: 'admin', branchId: 'branch-001' });
 */
export async function setCustomClaims(
  uid: string,
  claims: Record<string, unknown>
) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    console.log(`Custom claims set for user ${uid}:`, claims);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new Error('Failed to set custom claims');
  }
}
