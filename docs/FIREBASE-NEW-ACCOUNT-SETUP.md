# New Firebase Account Setup Guide

**Purpose:** Step-by-step instructions for preparing a new Firebase account before migrating data from the old account.

**Created:** January 2026

---

## Prerequisites

- Access to [Firebase Console](https://console.firebase.google.com)
- Google account for the new Firebase project
- Current project's `.firebaserc` and `firestore.rules` files

---

## Step 1: Create the New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add Project"**
3. Enter project name (e.g., `lorenzo-dry-cleaners-v2`)
4. Choose whether to enable Google Analytics (optional, but recommended)
5. Select your Google Analytics account if enabled
6. Click **"Create Project"** and wait for it to complete

---

## Step 2: Set Up Firestore Database

1. In the Firebase Console sidebar, click **"Firestore Database"**
2. Click **"Create Database"**
3. Select **"Start in production mode"** (security rules will be deployed later)
4. Choose your location/region:
   - Recommended: Same region as your old project for consistency
   - Options: `us-central1`, `europe-west1`, etc.
   - **Important:** This cannot be changed after creation
5. Click **"Enable"**

---

## Step 3: Set Up Firebase Authentication

1. In the sidebar, click **"Authentication"**
2. Click **"Get Started"**
3. Go to the **"Sign-in method"** tab
4. Enable these providers:
   - **Email/Password**: Click → Toggle "Enable" → Save
   - **Phone**: Click → Toggle "Enable" → Save (required for customer OTP login)

---

## Step 4: Set Up Firebase Storage

1. In the sidebar, click **"Storage"**
2. Click **"Get Started"**
3. Select **"Start in production mode"**
4. Choose the same location as your Firestore database
5. Click **"Done"**

---

## Step 5: Register Your Web App

1. Go to **Project Settings** (gear icon near "Project Overview")
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Enter app nickname: `Lorenzo POS`
5. Check "Also set up Firebase Hosting" if you plan to use it
6. Click **"Register app"**
7. **Copy the entire config object** - you'll need this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_NEW_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

8. Click **"Continue to console"**

---

## Step 6: Generate Service Account Credentials

1. Go to **Project Settings** → **"Service accounts"** tab
2. Ensure "Firebase Admin SDK" is selected
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the confirmation dialog
5. A JSON file will download - **keep this secure**
6. Rename it to something clear like `firebase-admin-new.json`

---

## Step 7: Prepare Environment Variables

Create a new `.env.local` file (or update existing) with the new values:

```bash
# New Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_new_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# New Firebase Admin SDK (from the JSON file)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Step 8: Configure Firebase CLI

1. Open terminal in your project directory
2. Run: `firebase login` (if not already logged in)
3. Run: `firebase use --add`
4. Select your new project from the list
5. Give it an alias like `production-new`

---

## Step 9: Update Firebase Configuration Files

Update `.firebaserc`:
```json
{
  "projects": {
    "default": "your-new-project-id"
  }
}
```

---

## Step 10: Deploy Security Rules (After Data Migration)

Once data is migrated, deploy the rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## Step 11: Deploy Firestore Indexes

Deploy all 43 composite indexes:
```bash
firebase deploy --only firestore:indexes
```

**Note:** This takes 10-30 minutes to complete. You can monitor progress in Firebase Console → Firestore → Indexes.

---

## Checklist Summary

| Step | Task | Status |
|------|------|--------|
| 1 | Create new Firebase project | ☐ |
| 2 | Enable Firestore (production mode, choose region) | ☐ |
| 3 | Enable Authentication (Email/Password + Phone) | ☐ |
| 4 | Enable Storage (same region as Firestore) | ☐ |
| 5 | Register web app and copy config | ☐ |
| 6 | Generate service account JSON | ☐ |
| 7 | Prepare new environment variables | ☐ |
| 8 | Configure Firebase CLI with new project | ☐ |
| 9 | Update `.firebaserc` | ☐ |
| 10 | Deploy security rules (after migration) | ☐ |
| 11 | Deploy indexes (after migration) | ☐ |

---

## After Setup - Before Migration

Once the new account is ready, you'll need to:

1. **Export data** from old Firebase (Firestore, Auth users, Storage files)
2. **Import data** to new Firebase
3. **Set custom claims** for Director (Lawrence) and GM (Grace) with:
   ```javascript
   {
     role: 'director',  // or 'general_manager'
     branchId: 'HQ',
     isSuperAdmin: false
   }
   ```
4. **Notify users** that they may need to reset passwords (Firebase doesn't export passwords)

---

## Collections to Migrate (28 Total)

The following Firestore collections will need to be migrated:

| Collection | Description |
|------------|-------------|
| `users` | Staff and customer accounts |
| `customers` | Customer profiles |
| `orders` | Order records |
| `transactions` | Payment records |
| `branches` | Branch configuration |
| `garments` | Garment details |
| `deliveries` | Delivery batches |
| `inventory` | Stock items |
| `inventoryAdjustments` | Stock changes |
| `pricing` | Pricing configuration |
| `notifications` | Notification logs |
| `pickupRequests` | Customer pickup requests |
| `attendance` | Staff attendance |
| `equipment` | Equipment records |
| `issues` | Quality/operational issues |
| `customerFeedback` | Customer reviews |
| `permissionRequests` | GM permission requests |
| `transferBatches` | Inter-branch transfers |
| `workstationProcessing` | Processing records |
| `orderUpdates` | Order change history |
| `auditLogs` | System audit trail |
| `systemSettings` | System configuration |
| `templates` | WhatsApp/notification templates |
| `shifts` | Shift schedules |
| `payroll` | Payroll records |
| `loyalty` | Customer loyalty data |
| `promotions` | Promotional offers |
| `analytics` | Analytics snapshots |

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

## Related Documentation

- [Full Migration Plan](./FIREBASE-MIGRATION-PLAN.md) - Complete migration process with export/import scripts
- [Security Rules](../firestore.rules) - Firestore security rules to deploy
- [Indexes](../firestore.indexes.json) - 43 composite indexes to recreate

---

*Document Created: January 2026*