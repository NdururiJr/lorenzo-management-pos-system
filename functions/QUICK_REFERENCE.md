# Firebase Cloud Functions - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install dependencies
cd /home/user/lorenzo-dry-cleaners/functions
npm install

# 2. Configure environment (choose one)
# Option A: Local testing
cp .env.functions .env
# Edit .env with your API keys

# Option B: Production
firebase functions:config:set wati.api_key="your_key"
firebase functions:config:set resend.api_key="your_key"

# 3. Build
npm run build

# 4. Test locally
firebase emulators:start

# 5. Deploy
firebase deploy --only functions
```

## 📋 All 10 Functions at a Glance

| Function | Type | Trigger | What It Does |
|----------|------|---------|--------------|
| `onOrderCreated` | Firestore | Order created | Sends confirmation email + WhatsApp |
| `onOrderStatusChanged` | Firestore | Order updated | Sends "ready" notifications |
| `updateOrderEstimate` | Firestore | Order created | Calculates completion time |
| `onPaymentReceived` | Firestore | Transaction created | Sends receipt, updates order |
| `onPaymentStatusChanged` | Firestore | Transaction updated | Handles refunds/failures |
| `onNotificationFailed` | Firestore | Notification failed | Retries up to 3 times |
| `cleanupOldNotifications` | Scheduled | Daily midnight | Deletes old notifications |
| `dailyReports` | Scheduled | 6 AM daily | Emails daily summary to managers |
| `inventoryAlerts` | Scheduled | Every 6 hours | Alerts on low stock |
| `paymentReminders` | Scheduled | 10 AM daily | Reminds unpaid orders |

## 🛠️ Common Commands

### Development
```bash
npm run build              # Compile TypeScript
npm run build:watch        # Compile and watch
npm run serve              # Start emulators
npx ts-node scripts/test-functions.ts  # Run tests
```

### Deployment
```bash
firebase deploy --only functions                    # Deploy all
firebase deploy --only functions:onOrderCreated     # Deploy one
firebase functions:list                             # List deployed
```

### Monitoring
```bash
firebase functions:log                    # View logs
firebase functions:log --follow           # Stream logs
firebase functions:log --only functionName # Specific function
```

### Configuration
```bash
firebase functions:config:set key.value="val"  # Set variable
firebase functions:config:get                  # View all
firebase functions:config:unset key.value      # Remove
```

## 🔗 Integration Points

### When These Events Happen...
- ✅ Order created in POS → `onOrderCreated` fires
- ✅ Payment processed → `onPaymentReceived` fires
- ✅ Order status updated → `onOrderStatusChanged` fires
- ✅ Daily at 6 AM → `dailyReports` runs
- ✅ Every 6 hours → `inventoryAlerts` runs
- ✅ Daily at 10 AM → `paymentReminders` runs

### These Notifications Are Sent...
- 📧 Email via Resend API
- 💬 WhatsApp via Wati.io API
- 📊 Analytics logged to Firestore

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Exports all functions |
| `src/triggers/orders.ts` | Order lifecycle triggers |
| `src/triggers/payments.ts` | Payment triggers |
| `src/scheduled/reports.ts` | Daily reports |
| `src/utils/email.ts` | Email utilities |
| `src/utils/whatsapp.ts` | WhatsApp utilities |
| `README.md` | Full documentation |
| `TESTING.md` | Testing guide |
| `DEPLOYMENT.md` | Deployment guide |

## 🔒 Required API Keys

```bash
# Must have
WATI_API_KEY=...              # From wati.io
RESEND_API_KEY=...            # From resend.com

# Optional (for now)
OPENAI_API_KEY=...            # For AI features
PESAPAL_CONSUMER_KEY=...      # For payment webhooks
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Functions not triggering | Check `firebase functions:list` |
| Email not sending | Verify Resend API key, check logs |
| WhatsApp not sending | Verify Wati API key, check templates |
| Build fails | Run `npm install`, check TypeScript errors |
| Deploy fails | Update Firebase CLI: `npm i -g firebase-tools@latest` |

## 📊 Testing Checklist

- [ ] Create test order → Check email received
- [ ] Create test order → Check WhatsApp received
- [ ] Process payment → Check receipt sent
- [ ] Update order status to "ready" → Check notification
- [ ] Manually trigger `dailyReports()` → Check email
- [ ] Check low inventory → Trigger `inventoryAlerts()`
- [ ] Create order with pending payment → Wait for reminder

## 💰 Cost Monitoring

Set budget alerts for:
- Firebase Functions: $10/month
- Resend: $20/month (after free tier)
- Wati.io: $49/month
- **Total: ~$80/month**

## 📞 Need Help?

1. Check logs: `firebase functions:log`
2. Read: `/functions/README.md`
3. Test locally: `firebase emulators:start`
4. Contact: jerry@ai-agentsplus.com

## ⚡ Pro Tips

- Use emulators for all testing before deploying
- Set `maxInstances` to prevent runaway costs
- Monitor logs regularly for errors
- Test WhatsApp templates before production
- Enable billing alerts
- Keep functions small and focused
- Use TypeScript for type safety
- Log important events for debugging

---

**Last Updated:** November 14, 2025
**Total Functions:** 10
**Total Code:** ~1,900 lines
**Documentation:** ~1,100 lines
