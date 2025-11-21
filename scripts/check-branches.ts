import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({ credential: cert(serviceAccount) });
      } catch (error) {
        console.error('Failed to parse service account key');
        initializeApp();
      }
    } else {
      initializeApp();
    }
  }
}

async function checkBranchesAndUser() {
  initializeFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();

  // Check user
  try {
    const user = await auth.getUserByEmail('dev@lorenzo.com');
    console.log('\n=== USER INFO ===');
    console.log('UID:', user.uid);
    console.log('Email:', user.email);

    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('\nFirestore User Data:');
      console.log('- role:', userData?.role);
      console.log('- isSuperAdmin:', userData?.isSuperAdmin);
      console.log('- branchId:', userData?.branchId);
      console.log('- branchAccess:', userData?.branchAccess);
    }

    // Check custom claims
    const userRecord = await auth.getUser(user.uid);
    console.log('\nCustom Claims:');
    console.log(JSON.stringify(userRecord.customClaims, null, 2));
  } catch (error) {
    console.error('Error checking user:', error);
  }

  // Check branches
  try {
    console.log('\n=== BRANCHES IN FIRESTORE ===');
    const branchesSnap = await db.collection('branches').get();
    console.log(`Total branches: ${branchesSnap.size}`);

    branchesSnap.forEach(doc => {
      const data = doc.data();
      console.log(`\n- ${doc.id}`);
      console.log(`  Name: ${data.name}`);
      console.log(`  Active: ${data.active}`);
      console.log(`  Type: ${data.branchType || 'N/A'}`);
    });
  } catch (error) {
    console.error('Error checking branches:', error);
  }
}

checkBranchesAndUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
