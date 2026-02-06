# Firebase Account Migration Plan

## Overview

This plan covers migrating all Firebase content from the current account to a different Firebase account. This includes:
- **Firestore Database** - All 28 collections with documents
- **Firebase Authentication** - User accounts and custom claims
- **Firebase Storage** - Uploaded files (receipts, garment photos, etc.)
- **Security Rules** - Firestore and Storage rules
- **Indexes** - 43 composite indexes for query optimization
- **Environment Configuration** - All API keys and credentials

---

## Pre-Migration Checklist

### 1. New Firebase Project Setup
- [ ] Create new Firebase project in Firebase Console
- [ ] Enable Firestore Database (choose region - ideally same as current)
- [ ] Enable Firebase Authentication
- [ ] Enable Firebase Storage
- [ ] Generate new API keys and service account credentials

### 2. Current Project Inventory

**Services in Use:**
| Service | Status | Data Volume |
|---------|--------|-------------|
| Firestore | Active | 28 collections |
| Authentication | Active | User accounts with custom claims |
| Storage | Active | Garment photos, receipts, uploads |
| Cloud Functions | Not used | N/A (using Next.js API routes) |
| Hosting | May be used | Static assets |

**Firestore Collections (28):**
- `users` - Staff and customer accounts
- `customers` - Customer profiles
- `orders` - Order records
- `transactions` - Payment records
- `branches` - Branch configuration
- `garments` - Garment details
- `deliveries` - Delivery batches
- `inventory` - Stock items
- `inventoryAdjustments` - Stock changes
- `pricing` - Pricing configuration
- `notifications` - Notification logs
- `pickupRequests` - Customer pickup requests
- `attendance` - Staff attendance
- `equipment` - Equipment records
- `issues` - Quality/operational issues
- `customerFeedback` - Customer reviews
- `permissionRequests` - GM permission requests
- `transferBatches` - Inter-branch transfers
- `workstationProcessing` - Processing records
- `orderUpdates` - Order change history
- `auditLogs` - System audit trail
- `systemSettings` - System configuration
- `templates` - WhatsApp/notification templates
- `shifts` - Shift schedules
- `payroll` - Payroll records
- `loyalty` - Customer loyalty data
- `promotions` - Promotional offers
- `analytics` - Analytics snapshots

---

## Phase 1: Export Data from Current Firebase (P0)

### Step 1.1: Export Firestore Data

**Option A: Firebase Console Export (Recommended for Production)**
1. Go to Firebase Console → Firestore
2. Click the 3 dots menu → Export to Cloud Storage
3. Create a GCS bucket if needed
4. Export all collections

**Option B: Script-Based Export (For More Control)**

Create `scripts/firebase-export.ts`:
```typescript
// Export script that dumps all collections to JSON files
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const app = initializeApp({
  credential: cert(require('./service-account.json'))
});

const db = getFirestore(app);

const collections = [
  'users', 'customers', 'orders', 'transactions', 'branches',
  'garments', 'deliveries', 'inventory', 'inventoryAdjustments',
  'pricing', 'notifications', 'pickupRequests', 'attendance',
  'equipment', 'issues', 'customerFeedback', 'permissionRequests',
  'transferBatches', 'workstationProcessing', 'orderUpdates',
  'auditLogs', 'systemSettings', 'templates', 'shifts',
  'payroll', 'loyalty', 'promotions', 'analytics'
];

async function exportData() {
  const exportDir = './firebase-export';
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    fs.writeFileSync(
      `${exportDir}/${collectionName}.json`,
      JSON.stringify(data, null, 2)
    );
    console.log(`Exported ${data.length} documents from ${collectionName}`);
  }
}

exportData();
```

### Step 1.2: Export Authentication Users

**Option A: Firebase Admin SDK Export**
```typescript
// Export users with custom claims
import { getAuth } from 'firebase-admin/auth';

async function exportUsers() {
  const auth = getAuth();
  const users: any[] = [];

  let nextPageToken: string | undefined;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    for (const user of result.users) {
      users.push({
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        customClaims: user.customClaims,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      });
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  fs.writeFileSync('./firebase-export/auth-users.json', JSON.stringify(users, null, 2));
  console.log(`Exported ${users.length} users`);
}
```

**Note:** Passwords cannot be exported. Users will need to reset passwords or use password-less auth.

### Step 1.3: Export Storage Files

**Option A: gsutil (Recommended)**
```bash
# Install Google Cloud SDK first
gsutil -m cp -r gs://[OLD_PROJECT_ID].appspot.com/* ./firebase-export/storage/
```

**Option B: Script-Based Download**
```typescript
import { getStorage } from 'firebase-admin/storage';

async function exportStorage() {
  const bucket = getStorage().bucket();
  const [files] = await bucket.getFiles();

  for (const file of files) {
    const destPath = `./firebase-export/storage/${file.name}`;
    await file.download({ destination: destPath });
    console.log(`Downloaded: ${file.name}`);
  }
}
```

---

## Phase 2: Prepare New Firebase Project (P0)

### Step 2.1: Create New Project
1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Name: `lorenzo-dry-cleaners-v2` (or similar)
4. Choose region (same as old project if possible)
5. Enable Google Analytics (optional)

### Step 2.2: Enable Services
1. **Firestore:**
   - Click "Firestore Database" → "Create Database"
   - Choose "Production mode"
   - Select region (e.g., `us-central1` or `europe-west1`)

2. **Authentication:**
   - Click "Authentication" → "Get Started"
   - Enable "Email/Password" provider
   - Enable "Phone" provider (for OTP)

3. **Storage:**
   - Click "Storage" → "Get Started"
   - Choose "Production mode"
   - Select same region as Firestore

### Step 2.3: Generate New Credentials

**Web App Config:**
1. Go to Project Settings → General
2. Click "Add App" → Web icon
3. Register app name: "Lorenzo POS"
4. Copy the config object:
```javascript
const firebaseConfig = {
  apiKey: "NEW_API_KEY",
  authDomain: "NEW_PROJECT.firebaseapp.com",
  projectId: "NEW_PROJECT_ID",
  storageBucket: "NEW_PROJECT.appspot.com",
  messagingSenderId: "NEW_SENDER_ID",
  appId: "NEW_APP_ID"
};
```

**Service Account (for Admin SDK):**
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Rename to `service-account-new.json`

---

## Phase 3: Deploy Rules and Indexes (P0)

### Step 3.1: Deploy Security Rules

**Firestore Rules:**
1. Go to Firestore → Rules
2. Copy contents from `firestore.rules`
3. Click "Publish"

Or via CLI:
```bash
firebase use NEW_PROJECT_ID
firebase deploy --only firestore:rules
```

**Storage Rules:**
1. Go to Storage → Rules
2. Copy contents from `storage.rules`
3. Click "Publish"

### Step 3.2: Deploy Indexes

1. Go to Firestore → Indexes
2. Create each index from `firestore.indexes.json`

Or via CLI:
```bash
firebase deploy --only firestore:indexes
```

**Note:** 43 indexes will take 10-30 minutes to build.

---

## Phase 4: Import Data to New Firebase (P0)

### Step 4.1: Import Firestore Data

**Option A: Firebase Console Import (If exported to GCS)**
1. Go to Firestore → Import/Export
2. Click "Import"
3. Select the GCS bucket path

**Option B: Script-Based Import**

Create `scripts/firebase-import.ts`:
```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';

const app = initializeApp({
  credential: cert(require('./service-account-new.json'))
});

const db = getFirestore(app);

const collections = [
  'users', 'customers', 'orders', 'transactions', 'branches',
  'garments', 'deliveries', 'inventory', 'inventoryAdjustments',
  'pricing', 'notifications', 'pickupRequests', 'attendance',
  'equipment', 'issues', 'customerFeedback', 'permissionRequests',
  'transferBatches', 'workstationProcessing', 'orderUpdates',
  'auditLogs', 'systemSettings', 'templates', 'shifts',
  'payroll', 'loyalty', 'promotions', 'analytics'
];

async function importData() {
  for (const collectionName of collections) {
    const filePath = `./firebase-export/${collectionName}.json`;
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${collectionName} - file not found`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of data) {
      const { id, ...docData } = doc;
      // Convert timestamp strings back to Firestore Timestamps
      const processedData = processTimestamps(docData);
      batch.set(db.collection(collectionName).doc(id), processedData);
      batchCount++;

      // Firestore batch limit is 500
      if (batchCount === 500) {
        await batch.commit();
        console.log(`Imported 500 documents to ${collectionName}`);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }
    console.log(`Imported ${data.length} documents to ${collectionName}`);
  }
}

function processTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'object') {
    if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
      return new Timestamp(obj._seconds, obj._nanoseconds);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => processTimestamps(item));
    }

    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = processTimestamps(obj[key]);
    }
    return result;
  }

  return obj;
}

importData();
```

### Step 4.2: Import Authentication Users

```typescript
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';

async function importUsers() {
  const auth = getAuth();
  const users = JSON.parse(fs.readFileSync('./firebase-export/auth-users.json', 'utf8'));

  for (const user of users) {
    try {
      // Create user without password (they'll need to reset)
      const newUser = await auth.createUser({
        uid: user.uid, // Preserve original UID
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        disabled: user.disabled,
        emailVerified: user.emailVerified
      });

      // Set custom claims (role, branchId, etc.)
      if (user.customClaims) {
        await auth.setCustomUserClaims(newUser.uid, user.customClaims);
      }

      console.log(`Created user: ${user.email || user.phoneNumber}`);
    } catch (error: any) {
      console.error(`Failed to create user ${user.uid}: ${error.message}`);
    }
  }
}

importUsers();
```

### Step 4.3: Import Storage Files

```bash
# Upload to new Storage bucket
gsutil -m cp -r ./firebase-export/storage/* gs://[NEW_PROJECT_ID].appspot.com/
```

Or via script:
```typescript
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';

async function importStorage() {
  const bucket = getStorage().bucket();
  const storageDir = './firebase-export/storage';

  function uploadDir(dir: string, prefix = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const storagePath = prefix ? `${prefix}/${file}` : file;

      if (fs.statSync(fullPath).isDirectory()) {
        uploadDir(fullPath, storagePath);
      } else {
        bucket.upload(fullPath, { destination: storagePath });
        console.log(`Uploaded: ${storagePath}`);
      }
    }
  }

  uploadDir(storageDir);
}

importStorage();
```

---

## Phase 5: Update Application Configuration (P0)

### Step 5.1: Update Environment Variables

**File:** `.env.local` (and `.env.production`)

```bash
# OLD VALUES - Comment out or remove
# NEXT_PUBLIC_FIREBASE_API_KEY=old_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=old_project.firebaseapp.com
# ...

# NEW VALUES
NEXT_PUBLIC_FIREBASE_API_KEY=NEW_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=NEW_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=NEW_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=NEW_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=NEW_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=NEW_APP_ID

# Admin SDK (if using server-side)
FIREBASE_ADMIN_PROJECT_ID=NEW_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@NEW_PROJECT.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 5.2: Update firebase.json

```json
{
  "projects": {
    "default": "NEW_PROJECT_ID"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Step 5.3: Update .firebaserc

```json
{
  "projects": {
    "default": "NEW_PROJECT_ID"
  }
}
```

---

## Phase 6: Testing & Verification (P1)

### Step 6.1: Test Authentication
1. Log in as existing user (will need password reset)
2. Test OTP login for customers
3. Verify custom claims are preserved (check role in console)

### Step 6.2: Test Firestore Access
1. Log in as Director → Verify dashboard loads
2. Log in as GM → Verify GM dashboard loads
3. Log in as Front Desk → Create a test order
4. Verify all collections are accessible per role

### Step 6.3: Test Storage
1. Upload a new garment photo
2. View existing uploaded files
3. Generate a receipt PDF and verify storage works

### Step 6.4: Verify Data Integrity
```typescript
// Spot check script
async function verifyData() {
  const collections = ['orders', 'customers', 'users', 'branches'];

  for (const name of collections) {
    const oldCount = /* count from export */;
    const newSnap = await db.collection(name).count().get();
    const newCount = newSnap.data().count;

    console.log(`${name}: Old=${oldCount}, New=${newCount}, Match=${oldCount === newCount}`);
  }
}
```

---

## Phase 7: DNS/Deployment Updates (If Applicable)

### Step 7.1: Firebase Hosting (If Used)
```bash
firebase use NEW_PROJECT_ID
firebase deploy --only hosting
```

### Step 7.2: Vercel Deployment
1. Go to Vercel Dashboard
2. Update environment variables with new Firebase config
3. Redeploy application

### Step 7.3: Custom Domain (If Applicable)
1. Update DNS settings if hosting changed
2. Re-issue SSL certificates if needed

---

## Post-Migration Checklist

- [ ] All users can log in (password reset may be required)
- [ ] Director dashboard loads without permission errors
- [ ] GM dashboard loads without permission errors
- [ ] POS can create orders
- [ ] Orders flow through pipeline correctly
- [ ] Payments process correctly (Pesapal still works)
- [ ] WhatsApp notifications send (Wati.io still works)
- [ ] All uploaded files are accessible
- [ ] Reports generate correctly
- [ ] No console errors related to Firebase

---

## Rollback Plan

If migration fails:

1. **Immediate:** Restore `.env.local` to old Firebase config
2. **Redeploy:** Push environment changes to Vercel
3. **Verify:** Old system is operational
4. **Investigate:** Review logs for migration failure cause

---

## Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 1: Export | 1-2 hours | Depends on data volume |
| Phase 2: New Project Setup | 30 mins | Manual Firebase Console work |
| Phase 3: Rules & Indexes | 30-60 mins | Indexes take time to build |
| Phase 4: Import | 1-2 hours | Depends on data volume |
| Phase 5: Config Updates | 30 mins | Environment variables |
| Phase 6: Testing | 2-4 hours | Comprehensive testing |
| **Total** | **6-10 hours** | Plan for a full day |

---

## Important Notes

1. **Password Migration:** Firebase does not allow password export. All users will need to:
   - Reset their password, OR
   - Use phone OTP authentication (already supported)

2. **UIDs Preserved:** User UIDs can be preserved if importing via Admin SDK with explicit UID

3. **Timestamps:** Ensure Firestore Timestamps are properly converted during import

4. **Storage URLs:** If garment photos use direct Storage URLs in documents, verify they still work or update to new bucket URL

5. **Third-Party Integrations:** Pesapal and Wati.io don't need changes - they're separate services

6. **Downtime:** Plan for 1-2 hours of maintenance window during cutover

---

## Files to Modify During Migration

| File | Change |
|------|--------|
| `.env.local` | Update all Firebase config values |
| `.env.production` | Update all Firebase config values |
| `.firebaserc` | Update default project ID |
| `firebase.json` | Update project reference |

## Scripts to Create

| Script | Purpose |
|--------|---------|
| `scripts/firebase-export.ts` | Export all Firestore collections |
| `scripts/firebase-import.ts` | Import data to new project |
| `scripts/auth-export.ts` | Export authentication users |
| `scripts/auth-import.ts` | Import users with custom claims |
| `scripts/verify-migration.ts` | Verify data integrity post-migration |