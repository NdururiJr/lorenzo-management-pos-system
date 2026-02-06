# Firebase Quick Start Guide

This is a quick reference for developers working with Firebase in the Lorenzo Dry Cleaners project.

## What's Been Set Up

All Firebase configuration files and utilities have been created and are ready to use:

### Configuration Files Created

1. **`lib/firebase.ts`** - Client-side Firebase configuration
   - Exports: `auth`, `db`, `storage`, `app`
   - Used in: Client components, pages, hooks

2. **`lib/firebase-admin.ts`** - Server-side Firebase Admin SDK
   - Exports: `adminAuth`, `adminDb`, `adminStorage`, `adminApp`
   - Used in: API routes, server components, server actions

3. **`lib/db/schema.ts`** - TypeScript interfaces for all collections
   - Exports: All collection types (User, Customer, Order, etc.)
   - Exports: Helper type guards

4. **`lib/db/index.ts`** - Database helper functions
   - CRUD operations
   - Collection-specific helpers
   - Transaction and batch utilities
   - Pagination helpers

5. **`lib/db/README.md`** - Comprehensive database documentation
   - Usage examples
   - Best practices
   - Error handling patterns

6. **`firestore.rules`** - Security rules with RBAC
   - Role-based access control
   - Collection-level permissions
   - Helper functions

7. **`firestore.indexes.json`** - Composite indexes for queries
   - Optimized for all complex queries
   - Auto-deployed with Firebase CLI

8. **`storage.rules`** - Storage security rules
   - File upload permissions
   - File type validation
   - Size limits

9. **`firebase.json`** - Firebase project configuration
   - Hosting setup
   - Emulator configuration
   - Storage and Firestore references

10. **`FIREBASE_SETUP.md`** - Complete setup instructions
    - Step-by-step Firebase Console setup
    - Environment variable configuration
    - Deployment instructions

## Quick Setup (5 Minutes)

### 1. Install Dependencies (Already Done)
```bash
npm install firebase firebase-admin
npm install -D firebase-tools
```

### 2. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it: `lorenzo-dry-cleaners`
4. Enable Google Analytics (recommended)
5. Create project

### 3. Enable Services
In Firebase Console:
- **Firestore**: Build > Firestore Database > Create database (Production mode)
- **Authentication**: Build > Authentication > Get started > Enable Email/Password and Phone
- **Storage**: Build > Storage > Get started

### 4. Get Configuration
1. Go to Project Settings (⚙️ icon)
2. Scroll to "Your apps" > Click web icon (`</>`)
3. Register app: `Lorenzo Dry Cleaners Web App`
4. Copy the config object

### 5. Set Environment Variables
Create `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Firebase config from step 4:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lorenzo-dry-cleaners.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lorenzo-dry-cleaners
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lorenzo-dry-cleaners.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 6. Generate Service Account Key
1. Project Settings > Service accounts
2. Click "Generate new private key"
3. Save the JSON file
4. Add to `.env.local`:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"lorenzo-dry-cleaners",...}'
```

### 7. Deploy Security Rules
```bash
# Login to Firebase
firebase login

# Initialize project
firebase init
# Select: Firestore, Hosting, Storage
# Use existing files (firestore.rules, firestore.indexes.json)

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 8. Test Your Setup
```bash
npm run dev
```

Visit `http://localhost:3000` - no Firebase errors should appear in console.

## Common Usage Examples

### Client-Side (Components, Pages)

#### Authentication
```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(
  auth,
  email,
  password
);
```

#### Firestore Query
```typescript
import { getOrdersByCustomer } from '@/lib/db';

const orders = await getOrdersByCustomer(customerId, 10);
```

### Server-Side (API Routes, Server Actions)

#### Verify Token
```typescript
import { verifyIdToken } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) return new Response('Unauthorized', { status: 401 });

  try {
    const decodedToken = await verifyIdToken(token);
    // User is authenticated, proceed
  } catch (error) {
    return new Response('Invalid token', { status: 401 });
  }
}
```

#### Create Order
```typescript
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

await adminDb.collection('orders').doc(orderId).set({
  customerId,
  branchId,
  status: 'received',
  totalAmount: 1500,
  createdAt: Timestamp.now(),
});
```

## Project Structure

```
lorenzo-dry-cleaners/
├── lib/
│   ├── firebase.ts              # Client config
│   ├── firebase-admin.ts        # Admin SDK config
│   └── db/
│       ├── schema.ts            # TypeScript types
│       ├── index.ts             # Helper functions
│       └── README.md            # Documentation
├── firestore.rules              # Security rules
├── firestore.indexes.json       # Composite indexes
├── storage.rules                # Storage security
├── firebase.json                # Firebase config
├── FIREBASE_SETUP.md            # Complete setup guide
├── FIREBASE_QUICKSTART.md       # This file
└── .env.local                   # Environment variables (not committed)
```

## Development Workflow

### 1. Local Development
```bash
# Start development server
npm run dev

# Use Firebase Emulator (optional, for offline development)
firebase emulators:start
```

### 2. Deploy Security Rules
```bash
# Deploy all
firebase deploy

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes
```

### 3. Check Security Rules
Test your security rules at: https://firebase.google.com/docs/rules/simulator

## Security Checklist

- [ ] All environment variables in `.env.local` (not committed to Git)
- [ ] Service account key never committed to Git
- [ ] Security rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] Custom claims set for admin users
- [ ] Test phone numbers configured for development

## Useful Commands

```bash
# Login to Firebase
firebase login

# Select project
firebase use lorenzo-dry-cleaners

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
firebase deploy --only hosting

# Start emulators
firebase emulators:start

# View Firebase logs
firebase functions:log

# Open Firebase Console
firebase open
```

## Testing

### Test Authentication
```typescript
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const userCredential = await createUserWithEmailAndPassword(
  auth,
  'test@example.com',
  'password123'
);
console.log('User created:', userCredential.user.uid);
```

### Test Firestore
```typescript
import { createDocument } from '@/lib/db';
import type { Customer } from '@/lib/db/schema';

const customerId = await createDocument<Customer>('customers', {
  name: 'Test Customer',
  phone: '+254712345678',
  addresses: [],
  preferences: { notifications: true, language: 'en' },
  orderCount: 0,
  totalSpent: 0,
});
console.log('Customer created:', customerId);
```

## Next Steps

1. **Create First Admin User**:
   - Sign up via Firebase Console
   - Set custom claims using `setCustomClaims()` from `lib/firebase-admin.ts`

2. **Seed Initial Data**:
   - Create branches
   - Set up pricing
   - Add staff users

3. **Build Features**:
   - Use types from `lib/db/schema.ts`
   - Use helpers from `lib/db/index.ts`
   - Follow examples in `lib/db/README.md`

## Support

- **Full Setup Guide**: See `FIREBASE_SETUP.md`
- **Database Documentation**: See `lib/db/README.md`
- **Firebase Docs**: https://firebase.google.com/docs
- **Project Team**:
  - Gachengoh Marugu - jerry@ai-agentsplus.com
  - Arthur Tutu - arthur@ai-agentsplus.com

---

**Created**: October 10, 2025
**Status**: Ready for development
