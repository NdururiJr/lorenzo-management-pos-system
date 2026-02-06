# Firebase Setup Guide

This guide walks you through setting up Firebase for the Lorenzo Dry Cleaners project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Firebase Project](#create-firebase-project)
3. [Enable Firebase Services](#enable-firebase-services)
4. [Configure Authentication](#configure-authentication)
5. [Generate Service Account Key](#generate-service-account-key)
6. [Set Up Environment Variables](#set-up-environment-variables)
7. [Deploy Security Rules and Indexes](#deploy-security-rules-and-indexes)
8. [Initialize Firebase CLI](#initialize-firebase-cli)
9. [Test Your Setup](#test-your-setup)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- A Google account
- Node.js 18+ installed
- Firebase CLI installed globally: `npm install -g firebase-tools`
- The Lorenzo Dry Cleaners project cloned locally

---

## Create Firebase Project

### Step 1: Go to Firebase Console

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"

### Step 2: Configure Your Project

1. **Project name**: Enter `lorenzo-dry-cleaners` (or your preferred name)
2. **Google Analytics**: Enable it (recommended for monitoring)
   - Select or create an Analytics account
   - Choose "Kenya" as the location
3. Click "Create project"
4. Wait for the project to be created (this may take a minute)

### Step 3: Register Your Web App

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. **App nickname**: Enter `Lorenzo Dry Cleaners Web App`
3. **Firebase Hosting**: Check this box (we'll use it for deployment)
4. Click "Register app"
5. **Important**: Copy the Firebase configuration object - you'll need this later
6. Click "Continue to console"

---

## Enable Firebase Services

### Enable Firestore Database

1. In the Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. **Security rules**: Select "Start in production mode" (we'll deploy custom rules later)
4. **Location**: Choose `eur3 (europe-west)` or the closest to Kenya
5. Click "Enable"

### Enable Authentication

1. Go to **Build** > **Authentication**
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Enable it
   - **Phone**: Enable it (we'll configure it next)

### Configure Phone Authentication

1. Still in Authentication, go to **Sign-in method** tab
2. Click on "Phone" provider
3. **Enable**: Toggle it on
4. **Test phone numbers** (optional for development):
   - Add test numbers like `+254700000000` with verification code `123456`
5. Click "Save"

### Enable Cloud Storage

1. Go to **Build** > **Storage**
2. Click "Get started"
3. **Security rules**: Start in production mode
4. **Storage location**: Same as Firestore location
5. Click "Done"

---

## Configure Authentication

### Set Up Custom Claims (Role-Based Access Control)

Custom claims are set programmatically. After deploying your app, you'll need to:

1. Create your first admin user via Firebase Console
2. Use Firebase Admin SDK to set custom claims (see `lib/firebase-admin.ts`)

**Example (run this once in a Node.js script or Firebase Function):**

```javascript
const admin = require('firebase-admin');

// Set admin role
await admin.auth().setCustomUserClaims(userId, {
  role: 'admin',
  branchId: null, // Admins access all branches
});
```

### Configure Authorized Domains

1. In **Authentication** > **Settings** > **Authorized domains**
2. Add your production domain (e.g., `lorenzo-cleaners.web.app`)
3. Add your custom domain if you have one (e.g., `app.lorenzocleaners.co.ke`)
4. `localhost` is already authorized for development

---

## Generate Service Account Key

The service account key is required for Firebase Admin SDK (server-side operations).

### Step 1: Generate the Key

1. In Firebase Console, click the **gear icon** (⚙️) > **Project settings**
2. Go to **Service accounts** tab
3. Click "Generate new private key"
4. A JSON file will be downloaded - **keep this file secure!**

### Step 2: Prepare the Key for Environment Variables

You have two options:

#### Option 1: Use JSON directly (simpler)

1. Open the downloaded JSON file
2. Copy the entire contents
3. Remove all line breaks to make it a single line
4. Wrap it in single quotes

Example:
```
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"lorenzo-dry-cleaners",...}'
```

#### Option 2: Base64 encode (more secure)

1. Open terminal in the directory with the JSON file
2. Run:
   ```bash
   # On Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("path/to/serviceAccountKey.json"))

   # On macOS/Linux
   base64 -i path/to/serviceAccountKey.json
   ```
3. Copy the output

Example:
```
FIREBASE_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6ImxvcmVuem8t...
```

---

## Set Up Environment Variables

### Step 1: Create `.env.local` File

In the project root, create a `.env.local` file:

```bash
cp .env.example .env.local
```

### Step 2: Fill in Firebase Configuration

Replace the placeholder values with your actual Firebase config:

```bash
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lorenzo-dry-cleaners.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lorenzo-dry-cleaners
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lorenzo-dry-cleaners.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

**Where to find these values:**

- Go to Firebase Console > Project Settings > General
- Scroll to "Your apps" section
- Click on your web app
- Copy the config object values

### Step 3: Verify Environment Variables

Make sure `.env.local` is in your `.gitignore` file (it should be by default in Next.js projects).

**Never commit `.env.local` to version control!**

---

## Deploy Security Rules and Indexes

### Step 1: Login to Firebase CLI

```bash
firebase login
```

This will open a browser window for authentication.

### Step 2: Initialize Firebase Project

```bash
firebase init
```

Select the following features:
- **Firestore**: Yes
- **Hosting**: Yes (if you want to deploy to Firebase Hosting)
- **Storage**: Yes

Configuration:
- **Select project**: Choose the Firebase project you created
- **Firestore rules file**: Use `firestore.rules` (already exists)
- **Firestore indexes file**: Use `firestore.indexes.json` (already exists)
- **Public directory**: Enter `out` (for Next.js static export) or `.next` (for SSR)
- **Single-page app**: Yes
- **GitHub Actions**: No (we use our own CI/CD)

### Step 3: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This deploys the security rules defined in `firestore.rules`.

### Step 4: Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

This creates the composite indexes needed for complex queries. Index creation may take a few minutes.

### Step 5: Deploy Storage Rules (Optional)

Create a `storage.rules` file:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /garments/{imageId} {
      // Allow authenticated staff to upload images
      allow write: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager', 'front_desk'];

      // Allow authenticated users to read images
      allow read: if request.auth != null;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy:
```bash
firebase deploy --only storage
```

---

## Initialize Firebase CLI

### Configure Firebase Project

Create a `firebase.json` file in your project root:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

---

## Test Your Setup

### Test 1: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`. You should see no Firebase connection errors in the console.

### Test 2: Test Authentication

Create a simple test page to verify Firebase is working:

```typescript
// app/test-firebase/page.tsx
'use client';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function TestFirebase() {
  const [status, setStatus] = useState('');

  const testAuth = async () => {
    try {
      // Test creating a user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'test@example.com',
        'password123'
      );
      setStatus(`Auth success! UID: ${userCredential.user.uid}`);
    } catch (error: any) {
      setStatus(`Auth error: ${error.message}`);
    }
  };

  const testFirestore = async () => {
    try {
      // Test writing to Firestore
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello Firebase!',
        timestamp: new Date(),
      });
      setStatus(`Firestore success! Doc ID: ${docRef.id}`);
    } catch (error: any) {
      setStatus(`Firestore error: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Page</h1>
      <div className="space-y-4">
        <button
          onClick={testAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Authentication
        </button>
        <button
          onClick={testFirestore}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Firestore
        </button>
        <p className="mt-4">{status}</p>
      </div>
    </div>
  );
}
```

### Test 3: Verify Security Rules

Try accessing Firestore without authentication - it should fail. This confirms your security rules are working.

---

## Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"

**Solution**: Make sure all environment variables are set correctly in `.env.local` and restart your dev server.

### Issue: "Insufficient permissions" when accessing Firestore

**Solution**:
1. Check that security rules are deployed: `firebase deploy --only firestore:rules`
2. Ensure the user is authenticated and has the correct role claims
3. Check that custom claims are set for the user

### Issue: "Index not found" errors

**Solution**:
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Wait a few minutes for indexes to build
3. Check index status in Firebase Console > Firestore > Indexes

### Issue: Service Account Key not working

**Solution**:
1. Ensure the JSON is properly formatted (no line breaks if using Option 1)
2. Try base64 encoding (Option 2)
3. Verify the file has all required fields: `type`, `project_id`, `private_key`, `client_email`

### Issue: Phone authentication not working

**Solution**:
1. Verify phone provider is enabled in Firebase Console
2. Check that reCAPTCHA is not blocking (use test phone numbers for development)
3. Ensure the phone number format is correct: `+254700000000`

### Issue: CORS errors when accessing Firebase Storage

**Solution**:
1. Set CORS configuration for your storage bucket
2. Create a `cors.json` file:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "https://your-domain.com"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
3. Apply CORS configuration:
   ```bash
   gsutil cors set cors.json gs://your-bucket-name.appspot.com
   ```

---

## Next Steps

After completing this setup:

1. **Create your first admin user**:
   - Use Firebase Console to create a user with email/password
   - Run a script to set admin custom claims (see `lib/firebase-admin.ts`)

2. **Seed initial data**:
   - Create branches
   - Set up pricing
   - Add staff users

3. **Test the application**:
   - Create a test order
   - Test payment flow
   - Verify notifications work

4. **Monitor your setup**:
   - Go to Firebase Console > Usage and billing
   - Check authentication usage
   - Monitor Firestore reads/writes

---

## Useful Commands

```bash
# Login to Firebase
firebase login

# List your projects
firebase projects:list

# Switch project
firebase use lorenzo-dry-cleaners

# Deploy everything
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# Deploy only hosting
firebase deploy --only hosting

# Open Firebase Console
firebase open

# View logs
firebase functions:log

# Start local emulators (for testing without affecting production)
firebase emulators:start
```

---

## Security Best Practices

1. **Never commit** `.env.local` or service account keys to Git
2. **Rotate service account keys** every 90 days
3. **Use custom claims** for role-based access control (don't store roles in Firestore only)
4. **Enable App Check** to prevent unauthorized access to your Firebase resources
5. **Monitor usage** regularly to detect unusual activity
6. **Set up billing alerts** to avoid unexpected costs
7. **Use Firebase Emulator Suite** for local development
8. **Test security rules** thoroughly before deploying to production

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Next.js with Firebase](https://github.com/vercel/next.js/tree/canary/examples/with-firebase)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

---

**Last Updated**: October 10, 2025

For questions or issues, contact the development team:
- **Gachengoh Marugu** - jerry@ai-agentsplus.com
- **Arthur Tutu** - arthur@ai-agentsplus.com
