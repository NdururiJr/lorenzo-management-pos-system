/**
 * Firebase Client Configuration
 *
 * This file initializes Firebase services for client-side operations.
 * All Firebase services (Auth, Firestore, Storage) are configured here.
 *
 * @module lib/firebase
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Firebase configuration object constructed from environment variables
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
 * Validates that all required Firebase environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
function validateConfig(): void {
  // Check the actual config values instead of process.env dynamically
  // because Next.js inlines NEXT_PUBLIC_ vars at build time
  const missingVars: string[] = [];

  if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
        'Please ensure all variables are set in your .env.local file.\n' +
        'See .env.example for reference.'
    );
  }
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

  // Check if we already have an initialized app
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Validate config before initializing
  validateConfig();

  return initializeApp(firebaseConfig);
}

// Lazy initialization - only when accessed
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

/**
 * Get Firebase app instance
 */
function getApp(): FirebaseApp | null {
  if (!app && typeof window !== 'undefined') {
    app = getFirebaseApp();
  }
  return app;
}

/**
 * Firebase Authentication instance
 * @example
 * import { auth } from '@/lib/firebase';
 *
 * const user = auth.currentUser;
 * await signInWithEmailAndPassword(auth, email, password);
 */
export const getAuthInstance = (): Auth => {
  if (!authInstance && typeof window !== 'undefined') {
    const firebaseApp = getApp();
    if (firebaseApp) {
      authInstance = getAuth(firebaseApp);
    }
  }
  return authInstance as Auth;
};

/**
 * Firestore Database instance
 * @example
 * import { db } from '@/lib/firebase';
 * import { collection, getDocs } from 'firebase/firestore';
 *
 * const ordersRef = collection(db, 'orders');
 * const snapshot = await getDocs(ordersRef);
 */
export const getDbInstance = (): Firestore => {
  if (!dbInstance && typeof window !== 'undefined') {
    const firebaseApp = getApp();
    if (firebaseApp) {
      dbInstance = getFirestore(firebaseApp);
    }
  }
  return dbInstance as Firestore;
};

/**
 * Firebase Storage instance
 * @example
 * import { storage } from '@/lib/firebase';
 * import { ref, uploadBytes } from 'firebase/storage';
 *
 * const storageRef = ref(storage, 'garments/image.jpg');
 * await uploadBytes(storageRef, file);
 */
export const getStorageInstance = (): FirebaseStorage => {
  if (!storageInstance && typeof window !== 'undefined') {
    const firebaseApp = getApp();
    if (firebaseApp) {
      storageInstance = getStorage(firebaseApp);
    }
  }
  return storageInstance as FirebaseStorage;
};

// Export getters as default exports with lazy initialization
// Using getters to defer initialization until first access
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export const auth: Auth = new Proxy({} as Auth, {
  get(target, prop) {
    if (!_auth) _auth = getAuthInstance();
    return _auth[prop as keyof Auth];
  }
});

export const db: Firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    if (!_db) _db = getDbInstance();
    return _db[prop as keyof Firestore];
  }
});

export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(target, prop) {
    if (!_storage) _storage = getStorageInstance();
    return _storage[prop as keyof FirebaseStorage];
  }
});

/**
 * Firebase app instance (if needed for advanced configuration)
 */
export { getApp as app };

/**
 * Export Firebase config for testing purposes
 * @private
 */
export const config = firebaseConfig;
