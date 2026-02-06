# Lorenzo Dry Cleaners - Firebase Cloud Functions

This directory contains all Firebase Cloud Functions for the Lorenzo Dry Cleaners application.

## 📁 Structure

```
functions/
├── src/
│   ├── index.ts              # Main entry point
│   ├── triggers/             # Firestore triggers
│   │   ├── orders.ts         # Order-related triggers
│   │   ├── payments.ts       # Payment-related triggers
│   │   └── notifications.ts  # Notification retry logic
│   ├── scheduled/            # Scheduled functions (cron jobs)
│   │   ├── reports.ts        # Daily reports
│   │   ├── inventory.ts      # Inventory alerts
│   │   └── reminders.ts      # Payment reminders
│   └── utils/                # Utility functions
│       ├── email.ts          # Email utilities (Resend)
│       ├── whatsapp.ts       # WhatsApp utilities (Wati.io)
│       └── analytics.ts      # Analytics logging
├── package.json
├── tsconfig.json
└── .env.functions            # Environment variables
```

## 🚀 Functions Overview

### Firestore Triggers

#### Order Triggers
- **`onOrderCreated`** - Triggered when a new order is created
  - Sends order confirmation email
  - Sends order confirmation WhatsApp message
  - Logs analytics event
  - Increments order counter

- **`onOrderStatusChanged`** - Triggered when order status changes
  - Sends notification when order is ready
  - Logs status change events
  - Tracks completed orders

- **`updateOrderEstimate`** - Triggered on order creation
  - Calculates estimated completion time if not provided
  - Updates order document

#### Payment Triggers
- **`onPaymentReceived`** - Triggered when a payment is completed
  - Updates order payment status
  - Sends payment receipt email
  - Updates customer total spent
  - Logs payment analytics

- **`onPaymentStatusChanged`** - Triggered when payment status changes
  - Handles payment failures
  - Processes refunds
  - Logs payment status changes

#### Notification Triggers
- **`onNotificationFailed`** - Triggered when a notification fails
  - Implements retry logic with exponential backoff
  - Maximum 3 retry attempts
  - Falls back to alternative channels

- **`cleanupOldNotifications`** - Daily cleanup
  - Removes notifications older than 30 days
  - Runs at midnight daily

### Scheduled Functions (Cron Jobs)

#### Daily Reports
- **Schedule:** Every day at 6 AM EAT
- **Purpose:** Generate and send daily summary reports
- **Recipients:** Branch managers and admins
- **Metrics:**
  - Total orders
  - Total garments processed
  - Total revenue
  - Completed orders
  - Pending orders
  - Orders by status
  - Payment methods breakdown

#### Inventory Alerts
- **Schedule:** Every 6 hours
- **Purpose:** Check inventory levels and alert managers
- **Logic:**
  - Checks all items against reorder levels
  - Sends email alerts when items are below reorder level
  - Groups alerts by branch

#### Payment Reminders
- **Schedule:** Every day at 10 AM EAT
- **Purpose:** Send payment reminders for outstanding balances
- **Logic:**
  - Finds orders with partial or pending payments
  - Sends reminders via WhatsApp and email
  - Waits 3 days between reminders

## 🛠️ Setup & Installation

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment Variables

Copy `.env.functions` and add your API keys:

```bash
cp .env.functions .env.local
```

Or use Firebase CLI to set config:

```bash
firebase functions:config:set wati.api_key="your_wati_key"
firebase functions:config:set wati.api_url="https://live-server.wati.io"
firebase functions:config:set resend.api_key="your_resend_key"
firebase functions:config:set resend.from_email="noreply@lorenzo-dry-cleaners.com"
```

### 3. Build Functions

```bash
npm run build
```

### 4. Test Locally with Emulators

```bash
npm run serve
```

This will start:
- Functions Emulator: http://localhost:5001
- Firestore Emulator: http://localhost:8080
- Auth Emulator: http://localhost:9099
- Emulator UI: http://localhost:4000

## 📦 Deployment

### Deploy All Functions

```bash
npm run deploy
```

### Deploy Specific Functions

```bash
# Deploy only order triggers
firebase deploy --only functions:onOrderCreated,functions:onOrderStatusChanged

# Deploy only scheduled functions
firebase deploy --only functions:dailyReports,functions:inventoryAlerts,functions:paymentReminders
```

### View Deployment Status

```bash
firebase functions:list
```

## 🧪 Testing

### Test with Emulators

1. Start emulators:
```bash
npm run serve
```

2. Create test data in Firestore
3. Observe function executions in the Emulator UI

### Test Individual Functions

You can test functions using the Firebase Functions Shell:

```bash
npm run shell
```

Then run commands like:

```javascript
// Test order creation trigger
onOrderCreated({ orderId: 'TEST-001', customerId: 'customer123', ... })

// Test scheduled function
dailyReports()
```

### Manual Testing in Production

**⚠️ Be careful when testing in production!**

```bash
# Trigger a scheduled function manually
gcloud functions call dailyReports --data '{}'

# View recent logs
npm run logs
```

## 📊 Monitoring

### View Logs

```bash
# All logs
firebase functions:log

# Specific function
firebase functions:log --only onOrderCreated

# Last 100 lines
firebase functions:log --limit 100

# Follow (live stream)
firebase functions:log --follow
```

### Error Tracking

Functions are automatically monitored in:
- Firebase Console: Functions → Logs
- Google Cloud Console: Operations → Logging
- (Optional) Sentry integration for error tracking

## 🔧 Common Tasks

### Update Environment Variables

```bash
# Set a variable
firebase functions:config:set service.api_key="new_key"

# Get all variables
firebase functions:config:get

# Unset a variable
firebase functions:config:unset service.api_key

# After updating, redeploy
npm run deploy
```

### Delete a Function

```bash
firebase functions:delete functionName
```

### Update Node.js Version

Edit `package.json` and `functions/package.json`:

```json
{
  "engines": {
    "node": "20"
  }
}
```

Then redeploy.

## ⚡ Performance Optimization

### Memory & Timeout Settings

You can customize memory and timeout for specific functions:

```typescript
export const dailyReports = functions
  .runWith({ memory: '1GB', timeoutSeconds: 300 })
  .pubsub.schedule('0 6 * * *')
  .onRun(async (context) => {
    // ...
  });
```

### Cost Optimization

- **Minimize cold starts:** Keep functions warm by using scheduled pings
- **Batch operations:** Process multiple items in a single invocation
- **Use regions wisely:** Deploy to regions close to your users (e.g., europe-west1 for Kenya)
- **Set resource limits:** Don't over-allocate memory

### Region Configuration

To deploy to a specific region:

```typescript
export const onOrderCreated = functions
  .region('europe-west1')
  .firestore.document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    // ...
  });
```

## 🐛 Troubleshooting

### Functions Not Triggering

1. Check function deployment status:
```bash
firebase functions:list
```

2. Verify Firestore security rules allow writes

3. Check function logs for errors:
```bash
firebase functions:log --only functionName
```

### Environment Variables Not Working

1. Verify variables are set:
```bash
firebase functions:config:get
```

2. Redeploy after changing config

3. Check for typos in variable names

### Email/WhatsApp Not Sending

1. Verify API keys are correct
2. Check rate limits (Wati: 100 msgs/sec, Resend: varies by plan)
3. Review logs for specific errors
4. Test API endpoints directly (Postman)

### Scheduled Functions Not Running

1. Check cron syntax:
```bash
firebase functions:list | grep schedule
```

2. Verify timezone is correct (Africa/Nairobi)

3. Check Cloud Scheduler in Google Cloud Console

## 📚 Additional Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Cron Schedule Syntax](https://crontab.guru/)
- [Wati.io API Documentation](https://docs.wati.io)
- [Resend API Documentation](https://resend.com/docs)

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Validate all inputs** in functions
4. **Implement rate limiting** for user-triggered functions
5. **Use Firebase App Check** to prevent abuse
6. **Review Firestore security rules** regularly
7. **Monitor function invocations** for unusual patterns

## 📞 Support

For issues or questions:
- Check logs: `firebase functions:log`
- Review documentation above
- Contact: jerry@ai-agentsplus.com

---

**Last Updated:** November 14, 2025
**Functions Version:** 1.0.0
**Node.js Version:** 20
