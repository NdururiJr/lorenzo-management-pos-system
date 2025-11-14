# Firebase Cloud Functions - Deployment Guide

Step-by-step guide for deploying Firebase Cloud Functions to production.

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All functions tested locally with emulators
- [ ] Environment variables configured
- [ ] Code reviewed and approved
- [ ] No console.logs with sensitive data
- [ ] Error handling implemented
- [ ] Retry logic tested
- [ ] Performance optimized
- [ ] Security rules reviewed
- [ ] Budget alerts configured
- [ ] Monitoring set up

## 🔧 Initial Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Select Firebase Project

```bash
firebase use <project-id>
```

To see available projects:
```bash
firebase projects:list
```

### 4. Install Function Dependencies

```bash
cd functions
npm install
```

## ⚙️ Configure Environment Variables

### Option 1: Using Firebase Functions Config (Recommended)

Set environment variables using Firebase CLI:

```bash
# Wati.io (WhatsApp)
firebase functions:config:set wati.api_key="your_wati_api_key"
firebase functions:config:set wati.api_url="https://live-server.wati.io"

# Resend (Email)
firebase functions:config:set resend.api_key="your_resend_api_key"
firebase functions:config:set resend.from_email="noreply@lorenzo-dry-cleaners.com"

# Pesapal (Payments)
firebase functions:config:set pesapal.consumer_key="your_pesapal_key"
firebase functions:config:set pesapal.consumer_secret="your_pesapal_secret"
firebase functions:config:set pesapal.api_url="https://pay.pesapal.com/pesapalv3"

# OpenAI
firebase functions:config:set openai.api_key="your_openai_key"

# Application
firebase functions:config:set app.url="https://lorenzo-dry-cleaners.com"
```

View current configuration:
```bash
firebase functions:config:get
```

### Option 2: Using .env Files (Local Development)

For local testing, create `.env` in functions directory:

```bash
WATI_API_KEY=your_key
RESEND_API_KEY=your_key
# ... etc
```

## 🚀 Deployment Steps

### Step 1: Build Functions

```bash
cd functions
npm run build
```

Verify build succeeded - check for `lib/` directory with compiled JavaScript.

### Step 2: Test with Emulators (Recommended)

```bash
firebase emulators:start
```

Test all critical flows:
- Order creation
- Payment processing
- Status updates
- Scheduled functions

### Step 3: Deploy to Staging (If Available)

```bash
# Switch to staging project
firebase use staging

# Deploy
firebase deploy --only functions
```

### Step 4: Deploy to Production

```bash
# Switch to production project
firebase use production

# Deploy all functions
firebase deploy --only functions
```

### Step 5: Verify Deployment

```bash
# List all deployed functions
firebase functions:list

# Check logs
firebase functions:log --limit 50
```

## 🎯 Selective Deployment

Deploy specific functions instead of all:

### Deploy Only Triggers

```bash
firebase deploy --only functions:onOrderCreated,functions:onOrderStatusChanged,functions:onPaymentReceived
```

### Deploy Only Scheduled Functions

```bash
firebase deploy --only functions:dailyReports,functions:inventoryAlerts,functions:paymentReminders
```

### Deploy Single Function

```bash
firebase deploy --only functions:onOrderCreated
```

## 🔄 Updating Functions

### Update Function Code

1. Make changes to source code
2. Test locally with emulators
3. Build: `npm run build`
4. Deploy: `firebase deploy --only functions:functionName`

### Update Environment Variables

```bash
# Update variable
firebase functions:config:set key.value="new_value"

# Redeploy affected functions
firebase deploy --only functions:affectedFunction
```

## 📊 Post-Deployment Monitoring

### View Logs

```bash
# Stream logs in real-time
firebase functions:log --follow

# View logs for specific function
firebase functions:log --only onOrderCreated

# View last 100 entries
firebase functions:log --limit 100
```

### Check Function Health

Visit Firebase Console:
1. Go to Functions section
2. Check invocation counts
3. Check error rates
4. Monitor execution times
5. Review logs

### Set Up Alerts

In Google Cloud Console:
1. Go to Cloud Functions
2. Click on a function
3. Go to "Metrics" tab
4. Create alerting policies for:
   - Error rate > 5%
   - Execution time > 30 seconds
   - Invocation count spike

## 🔒 Security Best Practices

### 1. Restrict Function Access

```typescript
// Only allow authenticated users
export const myFunction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }
  // ... function logic
});
```

### 2. Validate Inputs

```typescript
import { z } from 'zod';

const schema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
});

export const processPayment = functions.https.onCall(async (data, context) => {
  const validated = schema.parse(data); // Throws if invalid
  // ... function logic
});
```

### 3. Rate Limiting

```typescript
import * as functions from 'firebase-functions';

export const rateLimitedFunction = functions
  .runWith({
    maxInstances: 10, // Limit concurrent executions
  })
  .https.onCall(async (data, context) => {
    // ... function logic
  });
```

## 💰 Cost Optimization

### 1. Set Resource Limits

```typescript
export const myFunction = functions
  .runWith({
    memory: '256MB', // Don't over-allocate
    timeoutSeconds: 60, // Set appropriate timeout
    maxInstances: 100, // Prevent runaway costs
  })
  .firestore.document('collection/{docId}')
  .onCreate(async (snap, context) => {
    // ... function logic
  });
```

### 2. Choose Appropriate Region

Deploy to regions close to your users:

```typescript
export const myFunction = functions
  .region('europe-west1') // Closer to Kenya than us-central1
  .firestore.document('collection/{docId}')
  .onCreate(async (snap, context) => {
    // ... function logic
  });
```

### 3. Batch Operations

Process multiple items in a single invocation:

```typescript
export const batchProcess = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const items = await getItemsToProcess(); // Get multiple items
    await Promise.all(items.map(item => processItem(item))); // Process in parallel
  });
```

### 4. Monitor Costs

Set up budget alerts in Google Cloud Console:
1. Go to Billing
2. Set up Budget & Alerts
3. Recommended: Alert at 50%, 75%, 90%, 100% of budget

## 🐛 Troubleshooting Deployment

### Build Fails

```bash
# Clear build cache
cd functions
rm -rf lib/
rm -rf node_modules/
npm install
npm run build
```

### Deployment Fails

```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Check Firebase project
firebase use
```

### Functions Not Executing

1. Check function is deployed:
```bash
firebase functions:list
```

2. Check logs for errors:
```bash
firebase functions:log --only functionName
```

3. Verify trigger configuration (document path, schedule, etc.)

### Environment Variables Not Working

```bash
# Verify config is set
firebase functions:config:get

# Clone config from another project
firebase functions:config:clone --from <source-project>

# After changing config, always redeploy
firebase deploy --only functions
```

## 🔄 Rollback Procedure

If a deployment causes issues:

### Quick Rollback

```bash
# Redeploy previous version (if you have it in git)
git checkout previous-commit
cd functions
npm run build
firebase deploy --only functions
```

### Delete Problematic Function

```bash
firebase functions:delete functionName
```

### Emergency: Disable All Functions

In Firebase Console:
1. Go to Functions
2. Click on each function
3. Click "Delete"

Or via CLI:
```bash
firebase functions:delete --force function1 function2 function3
```

## 📚 Additional Resources

- [Firebase Functions Best Practices](https://firebase.google.com/docs/functions/best-practices)
- [Cloud Functions Pricing](https://firebase.google.com/pricing)
- [Cloud Functions Quotas](https://firebase.google.com/docs/functions/quotas)
- [Troubleshooting Guide](https://firebase.google.com/docs/functions/troubleshooting)

## 📞 Support

If you encounter issues:
1. Check logs: `firebase functions:log`
2. Review [TESTING.md](./TESTING.md)
3. Check Firebase Status: https://status.firebase.google.com
4. Contact: hello@ai-agentsplus.com

---

**Last Updated:** November 14, 2025
**Deployment Version:** 1.0.0
