# Firebase Network Error Troubleshooting Guide

**Error:** `Firebase: Error (auth/network-request-failed)`
**Location:** `contexts\AuthContext.tsx:132` - `user.getIdToken()`

---

## Root Causes

This error typically occurs when:
1. Firebase cannot reach authentication servers
2. API key is restricted or invalid
3. Network/firewall blocking Firebase
4. User session/token is expired

---

## Solution Steps

### Step 1: Verify Internet Connectivity

**Check if you can reach Firebase:**

```bash
# Test Firebase Auth endpoint
curl -I https://identitytoolkit.googleapis.com/

# Test Firestore endpoint
curl -I https://firestore.googleapis.com/
```

**Expected response:** `HTTP/2 405` or `HTTP/2 400` (means server is reachable)
**Problem:** Timeout or connection refused

**If blocked:**
- Check your firewall settings
- Verify VPN/proxy configuration
- Try disabling antivirus temporarily
- Check company/school network restrictions

---

### Step 2: Verify Firebase API Key Restrictions

**In Firebase Console:**

1. Go to: https://console.firebase.google.com/
2. Select project: **lorenzo-dry-cleaners-7302f**
3. Click ⚙️ **Settings** → **Project Settings**
4. Navigate to **General** tab
5. Scroll to **Your apps** section
6. Find your Web app
7. Verify API key matches `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCj5YSMCblpZKXKQZGz3jfLrx73jaiWR3U
   ```

**Check API Key Restrictions:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select project: **lorenzo-dry-cleaners-7302f**
3. Find API key: `AIzaSyCj5YSMCblpZKXKQZGz3jfLrx73jaiWR3U`
4. Click **Edit** (pencil icon)

**Verify settings:**
- **Application restrictions:** Should be **None** or **HTTP referrers** with `localhost:*` allowed
- **API restrictions:** Should include:
  - ✅ Identity Toolkit API
  - ✅ Token Service API
  - ✅ Cloud Firestore API
  - ✅ Firebase Authentication

**If restricted to specific domains:**
Add development domains:
```
http://localhost:3000/*
http://localhost:3001/*
http://127.0.0.1:3000/*
```

---

### Step 3: Check Firebase Authentication Status

**Verify Auth is enabled:**

1. Firebase Console → **Build** → **Authentication**
2. Click **Get Started** if not enabled
3. Go to **Sign-in method** tab
4. Verify **Email/Password** is ✅ Enabled
5. Verify **Phone** (for OTP) is enabled if needed

---

### Step 4: Clear Auth State and Retry

**Clear cached tokens and retry:**

```typescript
// Add this temporarily to AuthContext.tsx around line 130
const getIdToken = useCallback(async () => {
  if (!state.user) return null;
  try {
    // Force token refresh
    return await state.user.getIdToken(true); // ← Add 'true' parameter
  } catch (error) {
    console.error('Error getting ID token:', error);

    // Log detailed error info
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }

    return null;
  }
}, [state.user]);
```

**Force refresh:** The `true` parameter forces Firebase to fetch a new token instead of using cached version.

---

### Step 5: Test with Simple Firebase Auth Call

**Create a test page to isolate the issue:**

Create `app/test-firebase/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { getAuthInstance } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function TestFirebasePage() {
  const [status, setStatus] = useState('Not tested');
  const [error, setError] = useState<string | null>(null);

  const testFirebase = async () => {
    setStatus('Testing...');
    setError(null);

    try {
      const auth = getAuthInstance();

      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      console.log('Auth initialized:', auth);
      console.log('Auth config:', auth.config);

      // Try to sign in with test credentials
      const userCredential = await signInWithEmailAndPassword(
        auth,
        'dev@lorenzo.com',
        'DevPass123!'
      );

      console.log('Sign in successful:', userCredential.user.uid);

      // Try to get ID token
      const token = await userCredential.user.getIdToken();
      console.log('Token received:', token ? 'Success' : 'Failed');

      setStatus('✅ All tests passed!');
    } catch (err) {
      console.error('Firebase test error:', err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus('❌ Test failed');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>

      <button
        onClick={testFirebase}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Firebase Connection
      </button>

      <div className="mt-4">
        <p className="font-semibold">Status: {status}</p>
        {error && (
          <div className="mt-2 p-4 bg-red-100 border border-red-400 rounded">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Open Browser Console (F12) to see detailed logs</h2>
        <p className="text-sm text-gray-600">
          Check for network errors, CORS issues, or API key problems
        </p>
      </div>
    </div>
  );
}
```

**Navigate to:** http://localhost:3000/test-firebase

**Click "Test Firebase Connection"** and check browser console (F12) for detailed errors.

---

### Step 6: Verify Environment Variables Are Loaded

**Check if Next.js is loading the env vars:**

Add temporary debug logging to `lib/firebase.ts`:

```typescript
// Add after line 25 in lib/firebase.ts
console.log('🔍 Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 10) + '...',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});
```

**Expected output in browser console:**
```
🔍 Firebase Config Check: {
  hasApiKey: true,
  hasAuthDomain: true,
  hasProjectId: true,
  apiKeyPrefix: 'AIzaSyCj5Y...',
  authDomain: 'lorenzo-dry-cleaners-7302f.firebaseapp.com',
  projectId: 'lorenzo-dry-cleaners-7302f'
}
```

**If values are missing:**
1. Restart Next.js dev server: `npm run dev`
2. Verify `.env.local` file exists in root directory (not in subdirectories)
3. Check for typos in environment variable names

---

### Step 7: Check Firebase Project Status

**Verify project is active:**

1. Go to: https://console.firebase.google.com/
2. Select project: **lorenzo-dry-cleaners-7302f**
3. Check for billing alerts or quota warnings
4. Verify project is not in "Disabled" state

**Check Firebase Authentication quota:**

1. Firebase Console → **Build** → **Authentication**
2. Click **Usage** tab
3. Verify you haven't exceeded free tier limits:
   - Daily active users: 10,000 (Spark plan)
   - Monthly active users: 50,000 (Spark plan)

---

### Step 8: Test with Different Browser/Incognito

**Browser extensions can block Firebase:**

1. Open incognito/private window
2. Navigate to your app
3. Try authentication again

**If it works in incognito:**
- Disable browser extensions one by one
- Common culprits: Privacy Badger, uBlock Origin, AdBlock
- Whitelist `*.googleapis.com` and `*.firebaseapp.com`

---

### Step 9: Check for CORS Issues (Development Only)

**If running on custom domains/ports:**

Firebase might block requests from unexpected origins.

**Add to `next.config.ts`:**

```typescript
// Add CORS headers for local development
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
        { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
      ],
    },
  ];
},
```

---

### Step 10: Regenerate Firebase Web App Config

**Last resort - recreate web app:**

1. Firebase Console → ⚙️ **Settings** → **Project Settings**
2. Scroll to **Your apps**
3. Find your web app
4. Click **Delete** (⚠️ careful!)
5. Click **Add app** → **Web** (</>)
6. Register new app: "Lorenzo POS Web"
7. Copy NEW configuration:

```typescript
const firebaseConfig = {
  apiKey: "NEW_API_KEY",
  authDomain: "NEW_AUTH_DOMAIN",
  projectId: "lorenzo-dry-cleaners-7302f",
  storageBucket: "NEW_STORAGE_BUCKET",
  messagingSenderId: "NEW_SENDER_ID",
  appId: "NEW_APP_ID"
};
```

8. Update `.env.local` with new values
9. Restart dev server

---

## Common Error Messages and Solutions

### `auth/network-request-failed`
**Cause:** Cannot reach Firebase servers
**Fix:** Check internet, firewall, VPN

### `auth/api-key-not-valid`
**Cause:** Invalid or restricted API key
**Fix:** Verify API key in Firebase Console, check restrictions

### `auth/app-deleted`
**Cause:** Firebase app was deleted
**Fix:** Recreate web app in Firebase Console

### `auth/invalid-api-key`
**Cause:** API key doesn't match project
**Fix:** Copy correct API key from Firebase Console

### `auth/quota-exceeded`
**Cause:** Exceeded Firebase free tier limits
**Fix:** Upgrade to Blaze plan or wait for quota reset

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Internet connection is working
- [ ] Can access https://firebase.google.com
- [ ] `.env.local` file exists in root directory
- [ ] Environment variables start with `NEXT_PUBLIC_`
- [ ] API key matches Firebase Console
- [ ] Firebase Authentication is enabled
- [ ] API key has no domain restrictions (or localhost is allowed)
- [ ] Browser console shows Firebase config is loaded
- [ ] No firewall/VPN blocking googleapis.com
- [ ] Firebase project is active (no billing issues)
- [ ] Tried in incognito mode
- [ ] Restarted Next.js dev server

---

## Still Not Working?

**Get detailed error information:**

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by `googleapis`
4. Try to sign in
5. Look for failed requests (red)
6. Click failed request → **Preview** tab
7. Check error response

**Common network errors:**
- `ERR_CONNECTION_REFUSED` → Firebase servers unreachable
- `ERR_NAME_NOT_RESOLVED` → DNS issue
- `401 Unauthorized` → Invalid API key
- `403 Forbidden` → API key restrictions
- `429 Too Many Requests` → Rate limit/quota exceeded

**Share this info for further debugging:**
- Error code from Network tab
- Full error message from console
- Browser and OS version
- Whether it works in incognito mode
- Whether it works on mobile/different network

---

## Prevention

**To avoid this in future:**

1. **Use environment variable validation:**
   - The `validateConfig()` function in `lib/firebase.ts` already checks this
   - It will throw clear error if vars are missing

2. **Document API key restrictions:**
   - Keep list of allowed domains up to date
   - Add localhost variations for development

3. **Monitor Firebase quota:**
   - Set up billing alerts in Firebase Console
   - Monitor usage regularly

4. **Test after deployment:**
   - Always test authentication after deploying to new environment
   - Verify environment variables are set in production

---

## Additional Resources

- [Firebase Auth Troubleshooting](https://firebase.google.com/docs/auth/web/troubleshooting)
- [Firebase API Key Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Common Firebase Errors](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
