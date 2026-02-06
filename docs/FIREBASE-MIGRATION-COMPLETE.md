# Firebase Migration - Completion Guide

## Migration Status: 95% Complete ✅

### What Has Been Migrated

| Item | Status | Details |
|------|--------|---------|
| Security Rules | ✅ Deployed | All rules including `isExecutive()` helper |
| Firestore Indexes | ✅ Deployed | 40 composite indexes |
| Firestore Data | ✅ Migrated | 207 documents across 9 collections |
| Auth Users | ✅ Migrated | 36 users with custom claims preserved |
| Service Account | ✅ Configured | Server-side `.env.local` updated |
| `.firebaserc` | ✅ Updated | Points to new project |

### Collections Migrated

| Collection | Documents |
|------------|-----------|
| branches | 24 |
| customers | 37 |
| deliveries | 4 |
| inventory | 2 |
| notifications | 14 |
| orders | 65 |
| pricing | 11 |
| transactions | 14 |
| users | 36 |
| **Total** | **207** |

---

## ⚠️ ACTION REQUIRED: Complete Client-Side Config

You need to get the **Web App Configuration** from Firebase Console and update `.env.local`.

### Steps:

1. **Go to Firebase Console:**
   - Open https://console.firebase.google.com
   - Select project: `lorenzo-dry-cleaners-7302f`

2. **Navigate to Project Settings:**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

3. **Find Your Web App:**
   - Scroll down to "Your apps" section
   - Click on the Web app icon `</>`
   - If no web app exists, click "Add app" → select Web → register it

4. **Copy the Config Values:**
   Look for the `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",           // ← Copy this
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",      // ← Copy this
     appId: "1:..."                 // ← Copy this
   };
   ```

5. **Update `.env.local`:**
   Replace these placeholders with the actual values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=PASTE_API_KEY_FROM_FIREBASE_CONSOLE
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=PASTE_SENDER_ID_FROM_FIREBASE_CONSOLE
   NEXT_PUBLIC_FIREBASE_APP_ID=PASTE_APP_ID_FROM_FIREBASE_CONSOLE
   ```

---

## User Password Reset Notice

**Important:** Firebase does not allow password export. All users will need to:

1. **Option A:** Use "Forgot Password" on the login page to reset via email
2. **Option B:** Use Phone OTP login (already supported in the system)

### Notify Users

Send this message to your users:
> "We have upgraded our system. Please reset your password using the 'Forgot Password' option on the login page, or use phone OTP to log in."

---

## Verification Checklist

After updating the client config in `.env.local`:

- [ ] Run `npm run dev` and verify the app starts
- [ ] Try logging in as a user (you'll need to reset password first)
- [ ] Verify you can view orders in the dashboard
- [ ] Verify you can create a new order in POS
- [ ] Verify the pipeline board shows data
- [ ] Check that customer portal login works with phone OTP

---

## Files Changed

| File | Change |
|------|--------|
| `.env.local` | Updated Firebase config (needs API key completion) |
| `.firebaserc` | Updated to `lorenzo-dry-cleaners-7302f` |
| `firebase-export/` | Export data backup (can be deleted after verification) |
| `scripts/firebase-export.ts` | Export script (keep for reference) |
| `scripts/firebase-import.ts` | Import script (keep for reference) |

---

## Old Firebase Project

**DO NOT DELETE** the old Firebase project (`lorenzo-dry-cleaners`) until:

1. You have fully tested the new system
2. All users can log in successfully
3. All functionality works as expected
4. Wait at least 1-2 weeks of production usage

When ready to delete:
1. Go to Firebase Console → Old project
2. Project Settings → General → scroll to bottom
3. Click "Delete project"
4. Follow confirmation steps

---

## Troubleshooting

### "Firebase API key invalid"
- Double-check you copied the correct API key from Firebase Console
- Make sure there are no extra spaces

### "User not found" on login
- Users were migrated but need to reset passwords
- Use "Forgot Password" or phone OTP

### "Permission denied" errors
- Security rules are deployed, but user custom claims need to match
- Director should have `role: 'director'`
- GM should have `role: 'general_manager'`
- Verify in Firebase Console → Authentication → Users → click user → scroll to Custom Claims

### "Database not found" errors
- Ensure `.env.local` has `NEXT_PUBLIC_FIREBASE_PROJECT_ID=lorenzo-dry-cleaners-7302f`
- Restart the dev server after changing `.env.local`

---

*Migration completed: January 2026*
