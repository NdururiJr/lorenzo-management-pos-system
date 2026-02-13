/**
 * Firebase Admin SDK Configuration (Lazy Initialization)
 *
 * This file initializes Firebase Admin SDK for server-side operations.
 * Uses lazy initialization to avoid build-time errors.
 *
 * @module lib/firebase-admin
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

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
 * Initialize Firebase Admin SDK (lazy, singleton pattern)
 */
let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  // Check if already initialized
  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  // Initialize new app
  const credentials = getServiceAccountCredentials();
  adminApp = initializeApp({
    credential: cert(credentials),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  console.log('[Firebase Admin] Initialized successfully');
  return adminApp;
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
/**
 * Get Firebase Admin Auth instance (lazy)
 */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return getAdminAuth()[prop as keyof Auth];
  },
});

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
/**
 * Get Firebase Admin Firestore instance (lazy)
 */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    return getAdminDb()[prop as keyof Firestore];
  },
});

/**
 * Helper function to verify Firebase ID token
 */
export async function verifyIdToken(idToken: string) {
  try {
    return await getAdminAuth().verifyIdToken(idToken);
  } catch (error) {
    console.error('[Firebase Admin] Error verifying ID token:', error);
    throw new Error('Invalid or expired token');
  }
}

