# Lorenzo Dry Cleaners - Third-Party Services Integration

This directory contains integration modules for external services used by the Lorenzo Dry Cleaners Management System.

## Available Services

### 1. Pesapal Payment Gateway (`pesapal.ts`)

Handles payment processing for M-Pesa, cards, and bank transfers.

**Features:**
- OAuth 2.0 authentication with token caching
- Payment request submission
- Transaction status queries
- IPN (Instant Payment Notification) handling
- Signature verification
- Sandbox and production environment support

**Usage:**
```typescript
import { submitOrderRequest, getTransactionStatus } from '@/services/pesapal';

// Initiate payment
const result = await submitOrderRequest({
  orderId: 'ORD-001-20231015-0001',
  amount: 1500,
  customerPhone: '+254712345678',
  customerEmail: 'customer@example.com',
  description: 'Dry cleaning services'
});

// Get payment status
const status = await getTransactionStatus(orderTrackingId);
```

**Documentation:**
- API Reference: [Pesapal Developer Docs](https://developer.pesapal.com)
- Environment Variables: `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_API_URL`

---

### 2. Wati.io WhatsApp Integration (`wati.ts`)

Sends automated WhatsApp notifications to customers via Wati.io Business API.

**Features:**
- Template-based message sending
- Retry logic with exponential backoff (3 attempts)
- Phone number validation and formatting (Kenya: +254)
- Firestore notification logging
- Error handling with detailed messages
- Connection testing and template verification

**Available Notifications:**
1. **Order Confirmation** - When order is created
2. **Order Ready** - When order is ready for pickup/delivery
3. **Driver Dispatched** - When driver is assigned to delivery
4. **Driver Nearby** - When driver is ~5 minutes away
5. **Order Delivered** - When delivery is confirmed
6. **Payment Reminder** - For unpaid or partial payments

**Usage:**
```typescript
import { sendOrderConfirmation, sendOrderReady } from '@/services/wati';

// Send order confirmation
await sendOrderConfirmation('+254712345678', {
  orderId: 'ORD-001-20231015-0001',
  customerName: 'John Doe',
  amount: 1500,
  estimatedCompletion: 'October 17, 2023'
});

// Send order ready notification
await sendOrderReady('+254712345678', {
  orderId: 'ORD-001-20231015-0001',
  customerName: 'John Doe',
  collectionMethod: 'pickup',
  branchName: 'Lorenzo Kilimani'
});
```

**Documentation:**
- Setup Guide: `/docs/WATI_SETUP.md`
- Integration Examples: `/docs/WATI_INTEGRATION_EXAMPLES.md`
- API Reference: [Wati.io Docs](https://docs.wati.io)
- Environment Variables: `WATI_API_KEY`, `WATI_API_URL`

**Testing:**
```bash
# Run connection test
npm run test:wati

# Test via API endpoint
curl http://localhost:3000/api/test/wati

# Send test message
npm run test:wati -- --send-test --phone=+254712345678
```

---

## Future Services (To Be Implemented)

### 3. OpenAI Integration (`openai.ts`)

AI-powered features for analytics and predictions.

**Planned Features:**
- Order completion time estimation
- Customer churn prediction
- Route optimization assistance
- Analytics insights generation
- Report summarization

**Environment Variables:** `OPENAI_API_KEY`, `OPENAI_ORGANIZATION_ID`

---

### 4. SMS Service (`sms.ts`)

Fallback SMS service for when WhatsApp fails.

**Providers:**
- Africa's Talking (Kenya-focused)
- Twilio (global)

**Environment Variables:** `AFRICAS_TALKING_API_KEY` or `TWILIO_ACCOUNT_SID`

---

## Service Architecture

### Error Handling

All services implement:
- Try-catch blocks for graceful error handling
- Detailed error logging
- Retry logic for transient failures
- Fallback mechanisms where applicable

### Logging

All API calls are logged:
- Request details (sanitized - no sensitive data)
- Response status
- Errors and exceptions
- Retry attempts

### Rate Limiting

Services respect API rate limits:
- **Wati.io:** 100 messages/second
- **Pesapal:** Standard OAuth limits
- Queue system for high-volume operations (future)

---

## Best Practices

### 1. Environment Variables

Always use environment variables for API keys:

```typescript
// Good
const apiKey = process.env.WATI_API_KEY;

// Bad - Never hardcode
const apiKey = 'sk-abc123...';
```

### 2. Error Handling

Don't let service failures break main operations:

```typescript
try {
  await sendOrderConfirmation(phone, orderData);
} catch (error) {
  console.error('Notification failed:', error);
  // Continue with order creation
}
```

### 3. Async/Await

Always use async/await for service calls:

```typescript
// Good
const result = await submitOrderRequest(paymentData);

// Bad - Don't use .then()
submitOrderRequest(paymentData).then(result => { ... });
```

### 4. Type Safety

Use TypeScript interfaces for all service calls:

```typescript
import type { PesapalPaymentData } from '@/services/pesapal';

const paymentData: PesapalPaymentData = {
  orderId: order.orderId,
  amount: order.totalAmount,
  // ... TypeScript will enforce correct structure
};
```

### 5. Testing

Test services before deployment:

```bash
# Wati.io
npm run test:wati

# Pesapal (requires sandbox credentials)
# Add test script in package.json
```

---

## Monitoring

Monitor service health:

1. **Firestore Console**: Check `notifications` collection for delivery status
2. **Service Dashboards**: Wati.io, Pesapal dashboards for analytics
3. **Application Logs**: Check console for `[Wati]`, `[Pesapal]` prefixed logs
4. **Error Tracking**: Use Sentry or similar for production errors

---

## Security

### API Keys

- Never commit API keys to version control
- Use `.env.local` for local development
- Use platform secrets for production (Vercel, Firebase)
- Rotate keys regularly (every 3-6 months)

### Webhook Security

- Always verify signatures on webhook callbacks
- Use HTTPS only
- Implement rate limiting on webhook endpoints
- Log all webhook calls for audit

### Data Privacy

- Don't log sensitive customer data
- Sanitize phone numbers in logs
- Comply with Kenya Data Protection Act
- Get customer consent for WhatsApp notifications

---

## Support

### Wati.io
- Email: support@wati.io
- Dashboard: Live chat support
- Docs: https://docs.wati.io

### Pesapal
- Email: support@pesapal.com
- Docs: https://developer.pesapal.com
- Phone: Check website for support number

### Internal Support
- Gachengoh Marugu: hello@ai-agentsplus.com
- See CLAUDE.md for full team contacts

---

## Changelog

### v1.0.0 - November 14, 2025
- ✅ Implemented Wati.io WhatsApp integration
- ✅ Complete Pesapal payment integration
- ✅ Added retry logic and error handling
- ✅ Created comprehensive documentation
- ✅ Added test scripts and API endpoints

### Future Versions
- [ ] Implement OpenAI integration
- [ ] Add SMS fallback service
- [ ] Create notification queue system
- [ ] Add webhook handlers
- [ ] Implement advanced analytics

---

**Last Updated:** November 14, 2025
**Lorenzo Dry Cleaners Management System**
**AI Agents Plus**
