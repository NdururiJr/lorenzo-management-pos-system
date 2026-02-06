/**
 * Firebase Export Script
 *
 * Exports all Firestore collections from the OLD Firebase project to JSON files.
 * Also exports Firebase Authentication users with their custom claims.
 *
 * Usage: npx tsx scripts/firebase-export.ts
 *
 * Output: Creates ./firebase-export/ directory with JSON files for each collection
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// OLD Firebase service account credentials (from .env.local)
const OLD_SERVICE_ACCOUNT: ServiceAccount = {
  projectId: 'lorenzo-dry-cleaners',
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCjSEBK3qP8MLKB
BWBthCMUXs/ta22eOtrlsaN8ge7Hb3TPpuNEHSUZSYpESJMLwybzZ+wohW2bBEFW
Rr7VF5cMrdJ+GT88ATq9xEZQfhXK8tkT2TqIF2NNMcFJMQnhDVFcoudkvDTdU//x
NJXuSP+Z5QeqQutuPLjBS9vLA+osz/G86MJIo7wc826Sunpimn8AeVx7rsHILjtA
MHNYMDNOYO/JwOzT5/ngjBVxN0pBNPDxPeYKvg5zmf5s0MW9+o/YKIA+4sZGE+a7
XhmiEXX8JZVoqkbuiWk1KCQObaTqC6Mnq+dHwcdNCYWh0i//N2kPH8qGqwlJhahj
EE17u6GdAgMBAAECggEAA4OBaq49Pib4Hs50UEPPLQsk4B/3MgTKabX3mPoDOIR3
MYuOvKXNHHmyJ+nRGQ6Zu63JVBsaJdAi7c3duzn9bj1RWC67GlOQC/Es1PxmakGG
lvN0qH53jK8DUOVlKCDzifhLEKZiLT8dzpCwoOBheIWh5n6RKjduGS7EnvfjGRRW
dDa9r+QnPkCpoKHbXPkWEaldrBwhmyj3Hdd6ZXZ1JnUguiRWb9XsbTm3abJaa5q/
FXONSix4ImiUXVXy5soCCA2Uyx79ECyp1HLCoVLYm/ByYXCbysjbZNZOs2Cu/yON
UFq+K+aX43BF1rNrUy+Y4VC+/ALAzQGQlOei2yTGOwKBgQDdwrS+WgakBVYxaLgJ
v56fig84rQigszkI+NmEs+6prX825+HuOaFz7Nl/KdiP+gaROGXDPn7AIdBBleXA
4avuCDbRozORdqfmTKqrg3dvlMNzzFRa7G5Jd3SBexQjxgtqmUNIsORfvHm839hp
fEgmqPlbD6kDR+2x7BMCTT6RewKBgQC8fiJRG/f1JfQQeXI9cS77Vep4M3cmBVV/
dd1S7MhCuSxd33Hwr02JbaLS8OGQvETGm+KViHTVz7BdpZP4+2+4QWSPBeC6b1+6
46zc7FxbLVc33h781iaQUmLHSC8ySJY4iXYC1ffarhDi9MFDV80RHRU6KOkUjbLB
8B2X7sAxxwKBgGtVGfYnzJ8GljlD3g+Z10SQpd1gopRlKm3VRDKehB1MBA6nHQsY
ibR6JqsNrevBr/wJt/dQADkuJIYZ7yH0GCsVfrLossTtEUa+RLzO3Lf84LzjYNDB
LoAQeStSTuUhrdTiaVZ9h4tuxd1M2onzxVgw4L/aTItx/PHouSqcCHSRAoGAJd08
rYhtxfwqzAhpb3hGFM0Mfbrw611U8HbPz/GqxOSHyg+xxsSgUcQJWlBzL2zyb+cu
nBU+Sxked6FkWTbBGYVhWu22WB05YMSNnA+K+fHgvGNNXEL0mjdCin+wo2w7aP4M
C8PJt08SK1U5YXrIwfBSrE09jRht2VGP0E5wo08CgYBIxLuJoLXKnsqwUlr/fyll
FOGadk7Ibyi2wXR0YNmfcZonVz8NOqS4/gymJEoivQ85UkCASfLk33Lon+2ZXcjH
NoeueOkzyP7cuuuOmXvKgcfdWy0Gzc3mjrFo96acNc7lwMc9y57nh6VKznaXOOPk
kF5xkAX0fYhUMmKLG32GMg==
-----END PRIVATE KEY-----`,
  clientEmail: 'firebase-adminsdk-fbsvc@lorenzo-dry-cleaners.iam.gserviceaccount.com',
};

// Initialize Firebase Admin with OLD project credentials
const app = initializeApp({
  credential: cert(OLD_SERVICE_ACCOUNT),
  projectId: 'lorenzo-dry-cleaners',
}, 'old-firebase');

const db = getFirestore(app);
const auth = getAuth(app);

// All collections to export
const COLLECTIONS = [
  'users',
  'customers',
  'orders',
  'transactions',
  'branches',
  'garments',
  'deliveries',
  'inventory',
  'inventoryAdjustments',
  'pricing',
  'notifications',
  'pickupRequests',
  'attendance',
  'equipment',
  'issues',
  'customerFeedback',
  'permissionRequests',
  'transferBatches',
  'workstationProcessing',
  'orderUpdates',
  'auditLogs',
  'systemSettings',
  'templates',
  'shifts',
  'payroll',
  'loyalty',
  'promotions',
  'analytics',
];

// Export directory
const EXPORT_DIR = './firebase-export';

/**
 * Converts Firestore Timestamps to serializable objects
 */
function serializeDocument(data: any): any {
  if (data === null || data === undefined) return data;

  if (data instanceof Timestamp) {
    return {
      _type: 'Timestamp',
      _seconds: data.seconds,
      _nanoseconds: data.nanoseconds,
    };
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeDocument(item));
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const key of Object.keys(data)) {
      result[key] = serializeDocument(data[key]);
    }
    return result;
  }

  return data;
}

/**
 * Export a single collection to JSON file
 */
async function exportCollection(collectionName: string): Promise<number> {
  try {
    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`  ⚪ ${collectionName}: 0 documents (empty)`);
      return 0;
    }

    const documents = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...serializeDocument(doc.data()),
    }));

    const filePath = path.join(EXPORT_DIR, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

    console.log(`  ✅ ${collectionName}: ${documents.length} documents`);
    return documents.length;
  } catch (error: any) {
    console.error(`  ❌ ${collectionName}: Error - ${error.message}`);
    return 0;
  }
}

/**
 * Export all Firebase Authentication users
 */
async function exportAuthUsers(): Promise<number> {
  console.log('\n📤 Exporting Authentication Users...');

  const users: any[] = [];
  let nextPageToken: string | undefined;

  try {
    do {
      const result = await auth.listUsers(1000, nextPageToken);

      for (const user of result.users) {
        users.push({
          uid: user.uid,
          email: user.email || null,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber || null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          disabled: user.disabled,
          customClaims: user.customClaims || {},
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
          providerData: user.providerData.map(provider => ({
            providerId: provider.providerId,
            uid: provider.uid,
            displayName: provider.displayName,
            email: provider.email,
            phoneNumber: provider.phoneNumber,
            photoURL: provider.photoURL,
          })),
        });
      }

      nextPageToken = result.pageToken;
    } while (nextPageToken);

    const filePath = path.join(EXPORT_DIR, 'auth-users.json');
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    console.log(`  ✅ auth-users: ${users.length} users exported`);
    console.log('\n⚠️  NOTE: Passwords cannot be exported. Users will need to reset their passwords or use phone OTP.');

    return users.length;
  } catch (error: any) {
    console.error(`  ❌ auth-users: Error - ${error.message}`);
    return 0;
  }
}

/**
 * Main export function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           Firebase Data Export - OLD Project');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nSource Project: lorenzo-dry-cleaners`);
  console.log(`Export Directory: ${EXPORT_DIR}`);
  console.log(`Collections to Export: ${COLLECTIONS.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Create export directory
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
    console.log(`📁 Created export directory: ${EXPORT_DIR}\n`);
  }

  // Export Firestore collections
  console.log('📤 Exporting Firestore Collections...\n');

  let totalDocuments = 0;
  let exportedCollections = 0;

  for (const collection of COLLECTIONS) {
    const count = await exportCollection(collection);
    totalDocuments += count;
    if (count > 0) exportedCollections++;
  }

  // Export Auth users
  const userCount = await exportAuthUsers();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                     EXPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  📊 Collections Exported: ${exportedCollections}/${COLLECTIONS.length}`);
  console.log(`  📄 Total Documents: ${totalDocuments}`);
  console.log(`  👤 Auth Users: ${userCount}`);
  console.log(`  📁 Export Location: ${path.resolve(EXPORT_DIR)}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n✅ Export complete! You can now run the import script.');
  console.log('   Usage: npx tsx scripts/firebase-import.ts\n');

  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Export failed:', error);
  process.exit(1);
});
