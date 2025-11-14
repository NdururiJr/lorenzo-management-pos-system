# Firebase Cloud Functions - Testing Guide

This guide covers how to test all Firebase Cloud Functions locally and in production.

## 🧪 Local Testing with Firebase Emulators

### Setup

1. **Start the emulators:**

```bash
# From project root
firebase emulators:start

# Or from functions directory
cd functions
npm run serve
```

This will start:
- Functions Emulator: http://localhost:5001
- Firestore Emulator: http://localhost:8080
- Auth Emulator: http://localhost:9099
- Storage Emulator: http://localhost:9199
- Emulator UI: http://localhost:4000

### Testing Firestore Triggers

#### Test Order Creation Trigger

1. Go to Firestore Emulator UI: http://localhost:4000/firestore
2. Create a new document in the `orders` collection:

```json
{
  "orderId": "ORD-MAIN-20251114-0001",
  "customerId": "test-customer-id",
  "branchId": "main-branch",
  "status": "received",
  "totalAmount": 2500,
  "paidAmount": 0,
  "paymentStatus": "pending",
  "garments": [
    {
      "garmentId": "ORD-MAIN-20251114-0001-G01",
      "type": "shirt",
      "color": "white",
      "services": ["dry_clean", "iron"],
      "price": 500
    }
  ],
  "createdAt": { "_seconds": 1731600000, "_nanoseconds": 0 },
  "createdBy": "test-user-id"
}
```

3. Check the Functions logs in Emulator UI: http://localhost:4000/logs
4. You should see:
   - "Order created: ORD-MAIN-20251114-0001"
   - Email sending logs
   - WhatsApp sending logs
   - Analytics logs

#### Test Order Status Change Trigger

1. In Firestore Emulator, update an existing order:

```json
{
  "status": "ready"
}
```

2. Check logs for:
   - "Order status changed: received -> ready"
   - Order ready notifications sent

#### Test Payment Trigger

1. Create a document in `transactions` collection:

```json
{
  "transactionId": "TXN-001",
  "orderId": "ORD-MAIN-20251114-0001",
  "customerId": "test-customer-id",
  "amount": 2500,
  "method": "mpesa",
  "status": "completed",
  "timestamp": { "_seconds": 1731600000, "_nanoseconds": 0 },
  "processedBy": "test-user-id"
}
```

2. Check logs for:
   - "Payment received: TXN-001"
   - Payment receipt email sent
   - Order payment status updated

### Testing Scheduled Functions

Since scheduled functions use cron, you need to trigger them manually in the emulator:

#### Method 1: Using Firebase Functions Shell

```bash
cd functions
npm run shell
```

Then run:

```javascript
// Test daily reports
dailyReports()

// Test inventory alerts
inventoryAlerts()

// Test payment reminders
paymentReminders()
```

#### Method 2: Direct HTTP Call

Scheduled functions expose HTTP endpoints in the emulator:

```bash
# Test daily reports
curl -X POST http://localhost:5001/lorenzo-dry-cleaners-dev/us-central1/dailyReports

# Test inventory alerts
curl -X POST http://localhost:5001/lorenzo-dry-cleaners-dev/us-central1/inventoryAlerts

# Test payment reminders
curl -X POST http://localhost:5001/lorenzo-dry-cleaners-dev/us-central1/paymentReminders
```

## 🧪 Testing Individual Functions

### Test Email Utilities

Create a test file `functions/src/test-email.ts`:

```typescript
import * as admin from 'firebase-admin';
import { sendOrderConfirmationEmail } from './utils/email';

admin.initializeApp();

async function testEmail() {
  const result = await sendOrderConfirmationEmail(
    'test@example.com',
    {
      orderId: 'TEST-001',
      customerName: 'John Doe',
      garmentCount: 5,
      totalAmount: 2500,
      estimatedCompletion: 'November 16, 2025',
    }
  );

  console.log('Email result:', result);
}

testEmail();
```

Run:
```bash
cd functions
npx ts-node src/test-email.ts
```

### Test WhatsApp Utilities

Create `functions/src/test-whatsapp.ts`:

```typescript
import * as admin from 'firebase-admin';
import { sendOrderConfirmationWhatsApp } from './utils/whatsapp';

admin.initializeApp();

async function testWhatsApp() {
  const result = await sendOrderConfirmationWhatsApp(
    '+254712345678',
    {
      orderId: 'TEST-001',
      customerName: 'John Doe',
      garmentCount: 5,
      totalAmount: 2500,
      estimatedCompletion: 'November 16, 2025',
    }
  );

  console.log('WhatsApp result:', result);
}

testWhatsApp();
```

Run:
```bash
cd functions
npx ts-node src/test-whatsapp.ts
```

## 🚀 Testing in Production

**⚠️ Important:** Always test thoroughly in staging before production!

### Manual Trigger (Scheduled Functions)

You can manually trigger scheduled functions using gcloud CLI:

```bash
# Test daily reports
gcloud functions call dailyReports --data '{}'

# Test inventory alerts
gcloud functions call inventoryAlerts --data '{}'

# Test payment reminders
gcloud functions call paymentReminders --data '{}'
```

### View Logs

```bash
# Stream logs in real-time
firebase functions:log --follow

# View logs for specific function
firebase functions:log --only onOrderCreated

# View last 100 log entries
firebase functions:log --limit 100
```

## 🧪 Integration Testing

### Test Order Creation Flow (End-to-End)

1. Create a test customer in Firestore
2. Create an order via POS
3. Verify:
   - Order document created
   - Customer receives WhatsApp notification
   - Customer receives email notification
   - Notification logged in `notifications` collection
   - Analytics event logged

### Test Payment Flow

1. Create an order with pending payment
2. Create a payment transaction
3. Verify:
   - Order `paidAmount` updated
   - Order `paymentStatus` updated
   - Customer receives payment receipt email
   - Customer `totalSpent` updated

### Test Order Status Updates

1. Create an order in "received" status
2. Update status to "washing"
3. Update status to "ready"
4. Verify:
   - Customer receives "order ready" notification
   - Status change logged in analytics

## 📊 Test Data Setup

### Create Test Customer

```javascript
// Add to Firestore `customers` collection
{
  "customerId": "TEST-CUST-001",
  "name": "Test Customer",
  "phone": "+254712345678",
  "email": "test@example.com",
  "addresses": [
    {
      "label": "Home",
      "address": "Kilimani, Nairobi",
      "coordinates": { "lat": -1.2921, "lng": 36.8219 }
    }
  ],
  "preferences": {
    "notifications": true,
    "language": "en"
  },
  "orderCount": 0,
  "totalSpent": 0,
  "createdAt": firebase.firestore.FieldValue.serverTimestamp()
}
```

### Create Test Branch

```javascript
// Add to Firestore `branches` collection
{
  "branchId": "test-branch",
  "name": "Test Branch",
  "branchType": "main",
  "location": {
    "address": "Kilimani, Nairobi",
    "coordinates": { "lat": -1.2921, "lng": 36.8219 }
  },
  "contactPhone": "+254712345678",
  "active": true,
  "createdAt": firebase.firestore.FieldValue.serverTimestamp()
}
```

### Create Test Inventory Items

```javascript
// Add to Firestore `inventory` collection
{
  "branchId": "test-branch",
  "name": "Detergent",
  "category": "cleaning",
  "unit": "liters",
  "quantity": 5,
  "reorderLevel": 10,
  "costPerUnit": 500,
  "supplier": "Supplier A",
  "lastRestocked": firebase.firestore.FieldValue.serverTimestamp()
}
```

## 🔍 Debugging Tips

### Enable Verbose Logging

Add this to your functions:

```typescript
import * as functions from 'firebase-functions';

const logger = functions.logger;

export const myFunction = functions.firestore
  .document('collection/{docId}')
  .onCreate((snap, context) => {
    logger.info('Function triggered', { docId: context.params.docId });
    logger.debug('Document data:', snap.data());
    // ... rest of function
  });
```

### Check Function Execution Times

```bash
# View execution times in Cloud Console
gcloud functions logs read --limit 50

# Look for execution time in logs
# Example: "Function execution took 1234 ms"
```

### Test Error Handling

Create invalid test data to ensure error handling works:

```javascript
// Test with missing customer
{
  "orderId": "TEST-001",
  "customerId": "non-existent-customer",
  // ... rest of order data
}
```

Verify:
- Function doesn't crash
- Error is logged
- Appropriate error message

## 📈 Performance Testing

### Load Testing Triggers

Use a script to create multiple orders rapidly:

```typescript
import * as admin from 'firebase-admin';

admin.initializeApp();

async function loadTest() {
  const promises = [];

  for (let i = 0; i < 100; i++) {
    const promise = admin.firestore().collection('orders').add({
      orderId: `LOAD-TEST-${i}`,
      customerId: 'test-customer',
      // ... rest of data
    });
    promises.push(promise);
  }

  await Promise.all(promises);
  console.log('Created 100 test orders');
}

loadTest();
```

Monitor:
- Function execution times
- Error rates
- Memory usage
- Cold start times

## ✅ Testing Checklist

Before deploying to production:

- [ ] All trigger functions tested locally
- [ ] All scheduled functions tested manually
- [ ] Email notifications working
- [ ] WhatsApp notifications working
- [ ] Analytics logging working
- [ ] Error handling tested
- [ ] Retry logic tested
- [ ] Edge cases handled
- [ ] Logs are informative
- [ ] Performance is acceptable
- [ ] Environment variables configured
- [ ] Security rules reviewed
- [ ] Cost optimization reviewed

## 🆘 Common Issues

### Functions Not Triggering Locally

- Ensure emulators are running
- Check Firestore emulator is connected
- Verify document path matches trigger pattern

### Emails Not Sending

- Check Resend API key
- Verify email format is valid
- Check rate limits
- Review Resend dashboard for errors

### WhatsApp Not Sending

- Check Wati.io API key
- Verify phone number format (+254...)
- Check message template exists and is approved
- Review Wati.io logs

### Scheduled Functions Not Running

- Verify cron syntax
- Check timezone (should be Africa/Nairobi)
- Ensure Cloud Scheduler is enabled
- Check billing is enabled (required for scheduled functions)

---

**Happy Testing! 🎉**

For more information, see the main [README.md](./README.md).
