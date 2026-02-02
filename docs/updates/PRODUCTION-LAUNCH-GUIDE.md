# Lorenzo POS System - Production Launch Guide

**Document Version:** 1.0
**Last Updated:** January 24, 2026
**Author:** Jerry Ndururi in collaboration with AI Agents Plus

---

## Step-by-Step Deployment Checklist

---

## Step 1: Execute Test Plan

**File Location:** [docs/updates/TEST-PLAN-PHASE-1-2.md](TEST-PLAN-PHASE-1-2.md)

### 1.1 Pre-Test Setup

```bash
# Ensure dependencies are installed
npm install

# Verify build passes
npm run build

# Start development server
npm run dev
```

### 1.2 Execute Tests by Priority

**P0 - Must Pass Before Deployment:**

| Section | Tests | What to Verify |
|---------|-------|----------------|
| 2.1 Empty Database | PR-001 to PR-005 | System doesn't crash with no data |
| 2.2 Director Dashboard | PR-010 to PR-017 | No fake/hardcoded values, proper empty states |
| 2.3 Seed Data Validation | PR-020 to PR-023 | Valid branch coordinates, correct statuses |
| 2.4 Empty State Components | PR-030 to PR-033 | SetupRequired/NoDataAvailable components work |
| 2.5 Maps & Locations | PR-040 to PR-042 | Real Nairobi coordinates display correctly |

**P1 - Must Pass Before Go-Live:**

| Section | Tests | What to Verify |
|---------|-------|----------------|
| 2.6 Performance & Real-Time | PR-050 to PR-054 | Updates within 2-5 seconds, no polling delays |

**P2 - Within 30 Days Post-Launch:**

| Section | Tests | What to Verify |
|---------|-------|----------------|
| 2.7 Performance Benchmarks | PR-060 to PR-063 | dailyStats collection, toast notifications |

### 1.3 Test Execution Commands

```bash
# Run unit tests
npm test

# Run specific test file
npm test -- tests/unit/payments/transactions.test.ts

# Run E2E tests (requires running server)
npm run test:e2e

# Run with coverage
npm test -- --coverage
```

---

## Step 2: Create & Run Bootstrap Script

**File Location:** `scripts/bootstrap-production.ts` (TO BE CREATED)

### 2.1 Create the Bootstrap Script

```bash
# Create the file
touch scripts/bootstrap-production.ts
```

### 2.2 Bootstrap Script Content

The script should create:
1. Initial branch (KILIMANI_MAIN) with real coordinates
2. Company settings document
3. Default pricing for all garment types
4. Admin user with proper Firebase Auth claims

### 2.3 Add Script to package.json

```json
{
  "scripts": {
    "bootstrap": "npx ts-node scripts/bootstrap-production.ts"
  }
}
```

### 2.4 Run Bootstrap Script

```bash
# Set environment variables first (see Step 4)
# Then run:
npm run bootstrap

# Expected output:
# ✓ Created branch: KILIMANI_MAIN
# ✓ Created company settings
# ✓ Created 15 pricing rules
# ✓ Created admin user: admin@lorenzodrycleaner.com
# ✅ Production bootstrap complete!
```

---

## Step 3: Deploy Firestore Indexes

**File Location:** `firestore.indexes.json`

### 3.1 Review Indexes

```bash
# View current index configuration
cat firestore.indexes.json
```

### 3.2 Deploy Indexes

```bash
# Login to Firebase (if not already)
firebase login

# Select project
firebase use <project-id>

# Deploy only indexes
firebase deploy --only firestore:indexes

# Expected output:
# ✔  firestore: released indexes to <project-id>
```

### 3.3 Verify Indexes in Console

1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to Firestore Database → Indexes
4. Confirm all indexes show "Enabled" status (may take a few minutes)

---

## Step 4: Configure Environment Variables

**File Locations:**
- Template: `.env.example`
- Local: `.env.local` (create this, never commit)

### 4.1 Required Environment Variables

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Server-side only)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# OR as separate variables:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Integrations
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
WATI_ACCESS_TOKEN=your-wati-token
WATI_API_ENDPOINT=https://live-server.wati.io
PESAPAL_CONSUMER_KEY=your-pesapal-key
PESAPAL_CONSUMER_SECRET=your-pesapal-secret
PESAPAL_API_URL=https://pay.pesapal.com/v3
RESEND_API_KEY=your-resend-key
OPENAI_API_KEY=your-openai-key
```

### 4.2 For Staging Environment

Create `.env.staging`:
```bash
# Use Pesapal sandbox
PESAPAL_API_URL=https://cybqa.pesapal.com/pesapalv3

# Use test Firebase project
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lorenzo-staging
```

### 4.3 For Production Environment

Set variables in your hosting platform:

**Firebase Hosting:**
```bash
firebase functions:config:set \
  pesapal.key="your-production-key" \
  pesapal.secret="your-production-secret" \
  wati.token="your-production-token"
```

**Vercel:**
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Follow prompts for each variable
```

---

## Step 5: Deploy to Staging for UAT

### 5.1 Build for Staging

```bash
# Set staging environment
cp .env.staging .env.local

# Build
npm run build

# Test locally first
npm run start
```

### 5.2 Deploy to Staging

**Option A: Firebase Hosting (Staging Channel)**
```bash
# Create staging channel
firebase hosting:channel:create staging

# Deploy to staging
firebase hosting:channel:deploy staging

# Output will include preview URL:
# https://lorenzo-staging--staging-abc123.web.app
```

**Option B: Vercel Preview**
```bash
# Push to staging branch
git checkout -b staging
git push origin staging

# Vercel auto-deploys preview URL
```

### 5.3 UAT Checklist

Have stakeholders test:

| Area | Test Actions |
|------|--------------|
| **Login** | Login with phone OTP, email/password |
| **POS** | Create order, add garments, process payment |
| **Pipeline** | Progress order through all stages |
| **Customer Portal** | View orders, track status |
| **Reports** | Generate daily/weekly reports |
| **Payments** | Test M-Pesa, card payments (sandbox) |
| **Notifications** | Verify WhatsApp messages received |

### 5.4 UAT Sign-off

- [ ] All critical workflows tested
- [ ] No JavaScript errors in console
- [ ] Performance acceptable (pages load < 3s)
- [ ] Stakeholder approval received

---

## Step 6: Production Deployment

### 6.1 Pre-Deployment Checklist

```bash
# Final build verification
npm run build

# Verify no TypeScript errors
npx tsc --noEmit

# Check for security issues
npm audit

# Verify all tests pass
npm test
```

### 6.2 Production Environment Setup

```bash
# Set production environment
cp .env.production .env.local

# Update to production API URLs
# - Pesapal: https://pay.pesapal.com/v3
# - Wati: https://live-server.wati.io
```

### 6.3 Deploy to Production

**Firebase Hosting:**
```bash
# Deploy hosting and functions
firebase deploy --only hosting,functions

# Or deploy everything
firebase deploy
```

**Vercel:**
```bash
# Merge to main branch
git checkout main
git merge staging
git push origin main

# Vercel auto-deploys to production
```

### 6.4 Post-Deployment Verification

```bash
# Check production URL
curl -I https://lorenzo.web.app

# Verify Firestore connection
# (Login to app and check data loads)
```

### 6.5 Smoke Tests on Production

| Test | Steps | Expected |
|------|-------|----------|
| Homepage loads | Visit production URL | Page loads < 3s |
| Login works | Login with admin credentials | Dashboard appears |
| Create order | Create test order in POS | Order saved successfully |
| Real-time updates | Open Dashboard in 2 tabs | Updates sync < 5s |
| Payment works | Process test payment | Transaction recorded |

### 6.6 Monitor for Issues

```bash
# Watch Firebase logs
firebase functions:log --follow

# Check Sentry for errors (if configured)
# Check browser console on production
```

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server

# Testing
npm test                       # Run unit tests
npm run test:e2e              # Run E2E tests

# Build
npm run build                  # Production build
npm run start                  # Run production build locally

# Firebase
firebase login                 # Login to Firebase
firebase use <project-id>      # Select project
firebase deploy                # Deploy all
firebase deploy --only hosting # Deploy hosting only
firebase deploy --only functions # Deploy functions only
firebase deploy --only firestore:indexes # Deploy indexes

# Bootstrap
npm run bootstrap              # Initialize production data

# Verification
npx tsc --noEmit              # Check TypeScript
npm audit                      # Security audit
```

---

## Rollback Procedure

If issues occur after deployment:

```bash
# Firebase - rollback to previous version
firebase hosting:rollback

# Or deploy previous release
git checkout <previous-commit>
npm run build
firebase deploy --only hosting
```

---

## File References

| Document | Location | Purpose |
|----------|----------|---------|
| Test Plan | `docs/updates/TEST-PLAN-PHASE-1-2.md` | Comprehensive test cases |
| Performance Recommendations | `docs/updates/PERFORMANCE-RECOMMENDATIONS-JAN22-2026.md` | Real-time implementation details |
| Bootstrap Script | `scripts/bootstrap-production.ts` | Initialize production data |
| Firestore Indexes | `firestore.indexes.json` | Database index configuration |
| Environment Template | `.env.example` | Required environment variables |

---

## Support Contacts

- **Development Team:** Jerry Ndururi in collaboration with AI Agents Plus
- **Technical Lead:** Gachengoh Marugu (+254 725 462 859)
- **Product Manager:** Jerry Ndururi (jerry@ai-agentsplus.com)

---

**End of Production Launch Guide**
