# Test Account Seeding Guide

This guide explains how to seed test accounts for manual testing.

## Prerequisites

Before seeding test accounts, ensure you have:

1. **Firebase Service Account Key** set in your environment
2. **.env.local** file configured with Firebase credentials
3. **Firebase project** is set up and accessible

## Quick Start

### 1. Seed All Test Accounts

This will create all accounts from the [MANUAL_TESTING_GUIDE.md](../MANUAL_TESTING_GUIDE.md):

```bash
npm run seed:test-accounts
```

This creates:
- **8 staff accounts** (admin, director, manager, front desk, driver, etc.)
- **2 customer accounts** (with order history)
- **1 main branch** (Kilimani Main Store)

## What Gets Created

### Staff Accounts

| Email | Role | Password | Name |
|-------|------|----------|------|
| admin@lorenzo.test | admin | Test@1234 | John Admin |
| director@lorenzo.test | director | Test@1234 | Sarah Director |
| gm@lorenzo.test | general_manager | Test@1234 | Michael Manager |
| sm.main@lorenzo.test | store_manager | Test@1234 | Alice Store Manager |
| wm@lorenzo.test | workstation_manager | Test@1234 | Bob Workstation Manager |
| ws1@lorenzo.test | workstation_staff | Test@1234 | Carol Washing Staff |
| frontdesk@lorenzo.test | front_desk | Test@1234 | Frank Front Desk |
| driver1@lorenzo.test | driver | Test@1234 | George Driver |

### Customer Accounts

| Email | Phone | Password | Order History |
|-------|-------|----------|---------------|
| customer1@test.com | +254712345001 | Test@1234 | 5 orders, 12,500 KES |
| customer2@test.com | +254712345002 | Test@1234 | 2 orders, 5,000 KES |

### Branch

- **Kilimani Main Store** (BR-MAIN-001)
  - Address: Argwings Kodhek Road, Kilimani, Nairobi
  - Contact: +254725462859

## Environment Setup

### Required Environment Variables

Your `.env.local` file should have:

```bash
# Firebase Service Account (for seeding)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'

# Or set individual Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Getting Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Copy the entire JSON content and set it as `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`

**⚠️ SECURITY WARNING:** Never commit this key to version control!

## Troubleshooting

### Error: "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY"

**Solution:** Ensure your service account key is valid JSON and properly escaped in `.env.local`

```bash
# Correct format (single line, escaped quotes)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Error: "auth/email-already-exists"

**Solution:** This is expected! The script updates existing accounts, so this error is handled gracefully.

### Error: "auth/phone-number-already-exists"

**Solution:** The script will update the existing user. This is normal behavior.

### Error: "Insufficient permissions"

**Solution:**
1. Check that your Firebase service account has **Firebase Admin SDK** permissions
2. Go to Firebase Console → Project Settings → Service Accounts
3. Ensure the service account has roles:
   - Firebase Admin SDK Administrator Service Agent
   - Firebase Authentication Admin

### Error: "Collection 'users' does not exist"

**Solution:** This is fine! Firestore will create the collection automatically when you seed.

## Running in Different Environments

### Development (Local)

```bash
# Use .env.local
npm run seed:test-accounts
```

### Staging

```bash
# Set staging Firebase credentials first
export FIREBASE_SERVICE_ACCOUNT_KEY='...'
npm run seed:test-accounts
```

### Production

**⚠️ WARNING:** Do NOT seed test accounts in production!

These accounts are for **testing only**. For production, create real user accounts through your application's registration flow.

## Verifying the Seeding

### 1. Check Firebase Console

1. Go to **Firebase Console** → **Authentication**
2. You should see 10 new users (8 staff + 2 customers)

### 2. Check Firestore

1. Go to **Firebase Console** → **Firestore Database**
2. Check collections:
   - `users` (10 documents)
   - `customers` (2 documents)
   - `branches` (1 document)

### 3. Test Login

Try logging in with any of the test accounts:

```
Email: admin@lorenzo.test
Password: Test@1234
```

## Re-seeding

You can run the seed script multiple times. It will:
- **Update** existing accounts (passwords, names, etc.)
- **Create** new accounts if they don't exist
- **Preserve** existing data (orders, transactions, etc.)

```bash
# Safe to run multiple times
npm run seed:test-accounts
```

## Cleaning Up Test Data

To remove test accounts:

### Option 1: Manual Deletion via Firebase Console

1. Go to **Firebase Console** → **Authentication**
2. Delete users with emails ending in `@lorenzo.test` or `@test.com`
3. Go to **Firestore Database**
4. Delete corresponding documents from `users` and `customers` collections

### Option 2: Script (Coming Soon)

We'll add a cleanup script:

```bash
# Future feature
npm run clean:test-accounts
```

## Additional Seeding Scripts

### Seed Development User (Super Admin)

```bash
npm run seed:dev
```

Creates a super admin with access to all branches.

### Seed Test Orders

```bash
npm run seed:test-orders
```

Creates sample orders for testing the order pipeline.

### Seed Test Driver

```bash
npm run seed:driver
```

Creates a test driver with sample deliveries.

## Common Workflows

### Setting Up New Test Environment

1. **Set up Firebase project**
2. **Configure .env.local**
3. **Seed branches** (included in seed:test-accounts)
4. **Seed test accounts:**
   ```bash
   npm run seed:test-accounts
   ```
5. **Seed test orders** (optional):
   ```bash
   npm run seed:test-orders
   ```
6. **Share credentials** with QA team via MANUAL_TESTING_GUIDE.md

### Before UAT (User Acceptance Testing)

1. **Seed test accounts** in staging environment
2. **Verify all accounts** work
3. **Share MANUAL_TESTING_GUIDE.md** with stakeholders
4. **Provide staging URL** and credentials

### Before Production Launch

1. **DO NOT** seed test accounts in production
2. **Create real admin** user via Firebase Console
3. **Set up production environment** variables
4. **Test with real data**

## Security Best Practices

1. ✅ **Use different passwords** for production accounts
2. ✅ **Keep service account keys** secure (never commit to git)
3. ✅ **Disable test accounts** in production
4. ✅ **Use environment-specific** Firebase projects
5. ✅ **Rotate service account keys** regularly
6. ❌ **Never commit** .env.local to version control
7. ❌ **Never use test accounts** in production

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review Firebase Console logs
3. Contact development team:
   - Gachengoh Marugu: jerry@ai-agentsplus.com
   - Phone: +254 725 462 859

---

**Last Updated:** January 2025
**Version:** 1.0
