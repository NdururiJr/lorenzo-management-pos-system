# Setup Guide - Lorenzo Dry Cleaners

This guide walks you through setting up all external services required for Jerry's features.

## Table of Contents

1. [Google Cloud Platform Setup](#google-cloud-platform-setup)
2. [Resend Email Service Setup](#resend-email-service-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Environment Variables](#environment-variables)
5. [Testing Configuration](#testing-configuration)

---

## Google Cloud Platform Setup

### Prerequisites
- Google account
- Credit card for billing (free tier available)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** dropdown → **NEW PROJECT**
3. Project details:
   - **Project name**: `lorenzo-dry-cleaners`
   - **Organization**: (leave default or select your organization)
   - Click **CREATE**
4. Wait for project creation (30-60 seconds)
5. Select your new project from the dropdown

### Step 2: Enable Billing

1. Navigate to **Billing** in the left sidebar
2. Click **LINK A BILLING ACCOUNT**
3. If you don't have a billing account:
   - Click **CREATE BILLING ACCOUNT**
   - Enter billing information
   - Complete verification
4. Link the billing account to your project
5. **Note**: Google Maps Platform offers $200/month free credit

### Step 3: Enable Required APIs

You need to enable 5 Google Maps Platform APIs. Navigate to **APIs & Services** → **Library**:

#### 1. Maps JavaScript API
- Search for: **Maps JavaScript API**
- Click on it → Click **ENABLE**
- **Purpose**: Display interactive maps in the driver dashboard

#### 2. Directions API
- Search for: **Directions API**
- Click **ENABLE**
- **Purpose**: Calculate routes between delivery stops

#### 3. Distance Matrix API
- Search for: **Distance Matrix API**
- Click **ENABLE**
- **Purpose**: Calculate distances and travel times

#### 4. Geocoding API
- Search for: **Geocoding API**
- Click **ENABLE**
- **Purpose**: Convert addresses to coordinates

#### 5. Places API
- Search for: **Places API**
- Click **ENABLE**
- **Purpose**: Address autocomplete for customer addresses

### Step 4: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. Your API key will be created
4. Click on the API key name to configure it

### Step 5: Restrict API Key (Recommended)

**Important**: Restrict your API key to prevent unauthorized use!

#### Application Restrictions
1. Select **HTTP referrers (web sites)**
2. Add your allowed domains:
   ```
   localhost:3000
   *.lorenzo-dry-cleaners.com
   *.vercel.app
   ```
3. Click **ADD**

#### API Restrictions
1. Select **Restrict key**
2. Check only the 5 APIs you enabled:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API
   - Places API
3. Click **SAVE**

### Step 6: Copy API Key

1. Copy your API key
2. Store it securely (you'll add it to `.env.local` later)
3. Example format: `AIzaSyBjX1234567890AbCdEfGhIjKlMnOpQrS`

### Monthly Usage Estimates

Based on typical dry cleaning operations (100 orders/day, 20 deliveries/day):

| API | Monthly Calls | Cost | Free Tier |
|-----|--------------|------|-----------|
| Maps JavaScript API | 600 (daily views) | $0 | Free up to 28,000 loads |
| Directions API | 600 (route calculations) | $3.00 | $200 free credit |
| Distance Matrix API | 1,200 (distance checks) | $6.00 | $200 free credit |
| Geocoding API | 200 (new addresses) | $2.00 | $200 free credit |
| Places API | 400 (autocomplete) | $11.20 | $200 free credit |
| **TOTAL** | - | **~$22.20** | **Covered by $200 credit** |

**Result**: Well within the $200/month free tier! 🎉

---

## Resend Email Service Setup

### Step 1: Create Resend Account

1. Go to [Resend](https://resend.com/)
2. Click **Sign Up**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email
4. Verify your email address

### Step 2: Get API Key

1. After logging in, go to [API Keys](https://resend.com/api-keys)
2. Click **+ Create API Key**
3. Settings:
   - **Name**: `lorenzo-dry-cleaners-production`
   - **Permission**: Full Access
   - **Domain**: (select your verified domain, or use the default)
4. Click **Add**
5. **IMPORTANT**: Copy the API key immediately (you won't see it again!)
6. Format: `re_abcdefgh12345678_ABCDEFGHIJKLMNOPQRST`

### Step 3: Verify Domain (Optional but Recommended)

To send from your own domain (e.g., `receipts@lorenzo-dry-cleaners.com`):

1. Go to **Domains** → **+ Add Domain**
2. Enter your domain: `lorenzo-dry-cleaners.com`
3. Add the DNS records provided by Resend to your domain registrar:
   - **MX Record**
   - **TXT Record (SPF)**
   - **TXT Record (DKIM)**
4. Wait for verification (can take up to 48 hours)
5. Once verified, you can send from `receipts@lorenzo-dry-cleaners.com`

**For Development**: You can use Resend's default domain for testing:
- From address: `onboarding@resend.dev`
- **Note**: Can only send to your own email during testing

### Step 4: Test API Key

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Hello from Resend!</p>"
  }'
```

### Resend Pricing

| Plan | Monthly Emails | Cost |
|------|----------------|------|
| Free | 100 emails/day | $0 |
| Pro  | 50,000/month | $20 |

**Estimate**: 100 orders/day × 2 emails (confirmation + ready) = 200 emails/day
- **Recommendation**: Start with Pro plan ($20/month)

---

## Firebase Configuration

### Step 1: Check Firestore Indexes

Deploy the Firestore indexes for optimal query performance:

```bash
cd c:\Users\HomePC\Desktop\lorenzo-workspace\lorenzo-dry-cleaners
firebase deploy --only firestore:indexes
```

Expected output:
```
✔ Deploy complete!

Indexes:
  - employees
  - attendance
  - inventory_transactions
  - receipts
```

### Step 2: Update Firestore Security Rules

The new collections need security rules. Edit `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ... existing rules ...

    // Employees Collection
    match /employees/{employeeId} {
      allow read: if request.auth != null &&
        (request.auth.token.role in ['admin', 'manager'] ||
         request.auth.uid == resource.data.uid);

      allow write: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager'];
    }

    // Attendance Collection
    match /attendance/{attendanceId} {
      allow read: if request.auth != null &&
        (request.auth.token.role in ['admin', 'manager', 'front_desk'] ||
         request.auth.uid == resource.data.employeeId);

      allow create, update: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager', 'front_desk'];

      allow delete: if request.auth != null &&
        request.auth.token.role in ['admin'];
    }

    // Inventory Collection
    match /inventory/{itemId} {
      allow read: if request.auth != null;

      allow write: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager', 'workstation'];
    }

    // Inventory Transactions Collection
    match /inventory_transactions/{transactionId} {
      allow read: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager', 'workstation'];

      allow create: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager', 'workstation'];

      allow update, delete: if request.auth != null &&
        request.auth.token.role in ['admin'];
    }

    // Receipts Collection
    match /receipts/{receiptId} {
      allow read: if request.auth != null;

      allow create: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager', 'front_desk'];

      allow update, delete: if request.auth != null &&
        request.auth.token.role in ['admin'];
    }
  }
}
```

Deploy the security rules:

```bash
firebase deploy --only firestore:rules
```

### Step 3: Setup Firebase Storage Rules

For storing receipt PDFs, update `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Receipts folder
    match /receipts/{orderId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager', 'front_desk'];
    }

    // Employee photos folder
    match /employees/{employeeId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.token.role in ['admin', 'manager'];
    }
  }
}
```

Deploy storage rules:

```bash
firebase deploy --only storage
```

---

## Environment Variables

### Step 1: Update `.env.local`

Add the new environment variables to your `.env.local` file:

```bash
# Existing Firebase variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps Platform API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBjX1234567890AbCdEfGhIjKlMnOpQrS

# Resend API Key (Server-side only - no NEXT_PUBLIC prefix!)
RESEND_API_KEY=re_abcdefgh12345678_ABCDEFGHIJKLMNOPQRST
```

### Step 2: Verify Environment Variables

Create a test script: `scripts/test-env.ts`

```typescript
/**
 * Test Environment Variables
 * Run with: npx tsx scripts/test-env.ts
 */

console.log('Testing Environment Variables...\n');

// Test Google Maps API Key
if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  console.log('✓ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set');
  console.log(`  Value: ${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10)}...`);
} else {
  console.log('✗ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is NOT set');
}

// Test Resend API Key
if (process.env.RESEND_API_KEY) {
  console.log('✓ RESEND_API_KEY is set');
  console.log(`  Value: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
} else {
  console.log('✗ RESEND_API_KEY is NOT set');
}

// Test Firebase variables
const firebaseVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

console.log('\nFirebase Configuration:');
firebaseVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✓ ${varName} is set`);
  } else {
    console.log(`✗ ${varName} is NOT set`);
  }
});

console.log('\n✅ Environment check complete!');
```

Run the test:

```bash
npx tsx scripts/test-env.ts
```

### Step 3: Production Environment Variables

For deployment (Vercel/Netlify/etc.), add these variables in your hosting platform:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable from `.env.local`
4. **Important**: Keep `RESEND_API_KEY` secret (server-side only)

---

## Testing Configuration

### Test 1: Receipt PDF Generation

```typescript
import { generateReceipt, downloadReceipt } from '@/lib/receipts';

// Test with a real order ID from your database
const testOrderId = 'WESTLANDS20251019000';

try {
  await downloadReceipt(testOrderId);
  console.log('✓ Receipt PDF generated successfully!');
} catch (error) {
  console.error('✗ Receipt generation failed:', error);
}
```

### Test 2: Email Service

```typescript
import { sendReceiptEmail } from '@/lib/receipts';

const testOrderId = 'WESTLANDS202510190001';
const testEmail = 'your-email@example.com';

try {
  const result = await sendReceiptEmail(testOrderId, testEmail);
  if (result.success) {
    console.log('✓ Email sent successfully!');
  } else {
    console.error('✗ Email failed:', result.error);
  }
} catch (error) {
  console.error('✗ Email error:', error);
}
```

### Test 3: Google Maps API

Create a test page: `app/test-maps/page.tsx`

```typescript
'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export default function TestMapsPage() {
  const center = {
    lat: -1.2921,
    lng: 36.8219,
  };

  return (
    <div>
      <h1>Google Maps API Test</h1>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
          center={center}
          zoom={13}
        >
          <Marker position={center} label="Nairobi" />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
```

Visit: `http://localhost:3000/test-maps`

---

## Troubleshooting

### Google Maps Issues

**Error: "RefererNotAllowedMapError"**
- **Fix**: Add your domain to API key restrictions in Google Cloud Console

**Error: "ApiNotActivatedMapError"**
- **Fix**: Enable the required API in Google Cloud Console

**Maps not loading**
- **Fix**: Check browser console for errors
- **Fix**: Verify API key is correct in `.env.local`
- **Fix**: Ensure you've enabled billing in Google Cloud

### Resend Email Issues

**Error: "Invalid API key"**
- **Fix**: Verify `RESEND_API_KEY` in `.env.local` is correct
- **Fix**: Ensure no extra spaces or quotes

**Emails not sending**
- **Fix**: Check Resend dashboard for errors
- **Fix**: Verify recipient email is correct
- **Fix**: Check spam folder

**Error: "Domain not verified"**
- **Fix**: Use `onboarding@resend.dev` for testing
- **Fix**: Complete domain verification in Resend dashboard

### Firebase Issues

**Error: "Missing or insufficient permissions"**
- **Fix**: Deploy Firestore security rules: `firebase deploy --only firestore:rules`

**Indexes not working**
- **Fix**: Deploy indexes: `firebase deploy --only firestore:indexes`
- **Fix**: Wait 5-10 minutes for indexes to build

---

## Next Steps

Once all services are configured:

1. ✅ Test receipt PDF generation
2. ✅ Test email sending with a real order
3. ✅ Test Google Maps display
4. ✅ Create test deliveries and routes
5. ✅ Test end-to-end workflow: Order → Receipt → Email

---

## Support Resources

- **Google Maps Platform**: [Documentation](https://developers.google.com/maps/documentation)
- **Resend**: [Documentation](https://resend.com/docs)
- **Firebase**: [Documentation](https://firebase.google.com/docs)

---

**Last Updated**: October 19, 2025
**Maintained by**: Lorenzo Tech Team
