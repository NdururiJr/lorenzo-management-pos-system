/**
 * Quick script to create the WESTLANDS branch in Firestore
 * Run this if you see "Document not found: branches/WESTLANDS" error
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createWestlandsBranch() {
  console.log('\n🏢 Creating WESTLANDS branch...\n');

  const branchRef = doc(db, 'branches', 'WESTLANDS');

  // Check if it already exists
  const branchSnap = await getDoc(branchRef);

  if (branchSnap.exists()) {
    console.log('✅ WESTLANDS branch already exists!');
    console.log('Branch data:', branchSnap.data());
    process.exit(0);
  }

  // Create the branch
  const branch = {
    branchId: 'WESTLANDS',
    name: 'Westlands Main Store',
    branchType: 'main',
    location: {
      address: 'Westlands, Nairobi, Kenya',
      coordinates: { lat: -1.2674, lng: 36.8108 },
    },
    contactPhone: '+254725462859',
    active: true,
    createdAt: Timestamp.now(),
  };

  await setDoc(branchRef, branch);

  console.log('✅ WESTLANDS branch created successfully!');
  console.log('Branch ID:', branch.branchId);
  console.log('Name:', branch.name);
  console.log('Location:', branch.location.address);
  console.log('\n✅ You can now view orders in the customer portal without errors!\n');

  process.exit(0);
}

createWestlandsBranch().catch((error) => {
  console.error('❌ Error creating branch:', error);
  process.exit(1);
});
