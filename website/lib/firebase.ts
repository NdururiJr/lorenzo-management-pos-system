/**
 * Firebase Client Configuration for Website
 *
 * This file initializes Firebase services for client-side operations.
 * Uses the same Firebase project as the POS system for shared authentication.
 *
 * @module lib/firebase
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Firebase configuration object constructed from environment variables
 * Uses the same Firebase project as the POS system
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Check if Firebase config is available
 */
function hasValidConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

/**
 * Initialize Firebase app (singleton pattern)
 * Only initializes once, even if called multiple times
 */
function getFirebaseApp(): FirebaseApp | null {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if we have valid config
  if (!hasValidConfig()) {
    console.warn('Firebase config not available. Auth features will be disabled.');
    return null;
  }

  // Check if we already have an initialized app
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp(firebaseConfig);
}

// Lazy initialization - only when accessed
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

/**
 * Get Firebase app instance
 */
export function getApp(): FirebaseApp | null {
  if (!app && typeof window !== 'undefined') {
    app = getFirebaseApp();
  }
  return app;
}

/**
 * Get Firebase Authentication instance
 * Returns null if Firebase is not configured
 */
export function getAuthInstance(): Auth | null {
  if (!authInstance && typeof window !== 'undefined') {
    const firebaseApp = getApp();
    if (firebaseApp) {
      authInstance = getAuth(firebaseApp);
    }
  }
  return authInstance;
}

/**
 * Check if Firebase Auth is available
 */
export function isFirebaseAuthAvailable(): boolean {
  return hasValidConfig() && typeof window !== 'undefined';
}
