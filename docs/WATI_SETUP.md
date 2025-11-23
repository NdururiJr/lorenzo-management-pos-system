# Wati.io WhatsApp Integration Setup Guide

## Overview

This guide walks you through setting up Wati.io WhatsApp Business API integration for Lorenzo Dry Cleaners. The integration enables automated WhatsApp notifications for order updates, delivery status, and payment reminders.

## Prerequisites

1. **WhatsApp Business Account**: Must have a verified WhatsApp Business account
2. **Wati.io Account**: Sign up at [https://wati.io](https://wati.io)
3. **Kenya Phone Number**: +254... format required for WhatsApp Business

## Step 1: Create Wati.io Account

1. Go to [https://wati.io](https://wati.io)
2. Click "Sign Up" and create an account
3. Choose a pricing plan (starts at ~$49/month for 1000 messages)
4. Complete business verification

## Step 2: Link WhatsApp Business Number

1. Log in to Wati.io dashboard
2. Navigate to **Settings** > **WhatsApp Number**
3. Click **Add Number**
4. Follow the verification process:
   - Enter your business phone number (+254...)
   - Receive and enter verification code
   - Wait for WhatsApp approval (usually 1-2 business days)

## Step 3: Create Message Templates

WhatsApp requires pre-approved message templates for business notifications. Create the following templates in Wati.io:

### Template 1: Order Confirmation
- **Name**: `order_confirmation`
- **Category**: ORDER_UPDATE
- **Language**: English
- **Message**:
  ```
  Hi {{1}}, your order {{2}} has been received. Total: KES {{3}}. Estimated completion: {{4}}. Thank you for choosing Lorenzo Dry Cleaners!
  ```
- **Parameters**:
  1. `name` - Customer name
  2. `orderId` - Order ID
  3. `amount` - Total amount
  4. `date` - Estimated completion date

### Template 2: Order Ready
- **Name**: `order_ready`
- **Category**: ORDER_UPDATE
- **Language**: English
- **Message**:
  ```
  Great news {{1}}! Your order {{2}} is ready for {{3}} at {{4}}. Thank you for your patience!
  ```
- **Parameters**:
  1. `name` - Customer name
  2. `orderId` - Order ID
  3. `collectionMethod` - "pickup" or "delivery"
  4. `branchName` - Branch location

### Template 3: Driver Dispatched
- **Name**: `driver_dispatched`
- **Category**: ORDER_UPDATE
- **Language**: English
- **Message**:
  ```
  Hi {{1}}, your order {{2}} is out for delivery! Driver: {{3}}, Phone: {{4}}. ETA: {{5}} minutes.
  ```
- **Parameters**:
  1. `name` - Customer name
  2. `orderId` - Order ID
  3. `driverName` - Driver's name
  4. `driverPhone` - Driver's phone
  5. `eta` - Estimated arrival time

### Template 4: Driver Nearby
- **Name**: `driver_nearby`
- **Category**: ORDER_UPDATE
- **Language**: English
- **Message**:
  ```
  Hi {{1}}, our driver is approximately 5 minutes away with your order {{2}}. Please be ready to receive your delivery.
  ```
- **Parameters**:
  1. `name` - Customer name
  2. `orderId` - Order ID

### Template 5: Order Delivered
- **Name**: `order_delivered`
- **Category**: ORDER_UPDATE
- **Language**: English
- **Message**:
  ```
  Hi {{1}}, your order {{2}} has been successfully delivered. Thank you for choosing Lorenzo Dry Cleaners! We look forward to serving you again.
  ```
- **Parameters**:
  1. `name` - Customer name
  2. `orderId` - Order ID

### Template 6: Payment Reminder
- **Name**: `payment_reminder`
- **Category**: PAYMENT_UPDATE
- **Language**: English
- **Message**:
  ```
  Hi {{1}}, this is a friendly reminder that order {{2}} has a pending balance of KES {{3}}. Please pay at your earliest convenience. Thank you!
  ```
- **Parameters**:
  1. `name` - Customer name
  2. `orderId` - Order ID
  3. `balance` - Balance amount

## Step 4: Submit Templates for Approval

1. In Wati.io dashboard, go to **Message Templates**
2. Create each template as shown above
3. Click **Submit for Approval**
4. Wait for WhatsApp approval (typically 24-48 hours)
5. Once approved, templates will be marked as "APPROVED"

## Step 5: Get API Credentials

1. In Wati.io dashboard, navigate to **API Docs** (usually in the sidebar or Settings menu)
2. Copy your **Access Token**:
   - This is a JWT token that looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **IMPORTANT**: Copy only the token itself, NOT the word "Bearer"
   - If you see "Bearer eyJ...", copy only the part after "Bearer " (excluding the space)
3. Copy the **API Endpoint** URL:
   - It should look like: `https://live-mt-server.wati.io/1051875`
   - **IMPORTANT**: Use the complete URL including your instance ID (the number at the end)
   - Note: Some accounts show `live-mt-server`, others show `live-server` - use exactly what's shown in your dashboard

## Step 6: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Wati.io WhatsApp Business API
# Get these from https://app.wati.io/dashboard > API Docs

# Access Token - JWT token WITHOUT "Bearer" prefix
WATI_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_token

# API Endpoint - Complete URL including your instance ID
# Example: https://live-mt-server.wati.io/1051875
# Note: URL may vary - use exactly what's shown in your Wati dashboard
WATI_API_ENDPOINT=https://live-mt-server.wati.io/YOUR_INSTANCE_ID
```

**Important Notes**:
- Replace `YOUR_INSTANCE_ID` with your actual instance ID (e.g., `1051875`)
- Do NOT include "Bearer" in the access token
- The endpoint URL must include `/YOUR_INSTANCE_ID` at the end
- Some accounts use `live-mt-server`, others use `live-server` - copy exactly from your dashboard

## Step 7: Test the Integration

Run the test script to verify the connection:

```bash
npm run test:wati
```

Or test in Node.js console:

```javascript
import { testWatiConnection, getMessageTemplates } from '@/services/wati';

// Test connection
const connectionTest = await testWatiConnection();
console.log(connectionTest);

// Get approved templates
const templates = await getMessageTemplates();
console.log(templates);
```

## Usage Examples

### Send Order Confirmation

```typescript
import { sendOrderConfirmation } from '@/services/wati';

await sendOrderConfirmation('+254712345678', {
  orderId: 'ORD-001-20231015-0001',
  customerName: 'John Doe',
  amount: 1500,
  estimatedCompletion: 'October 17, 2023'
});
```

### Send Order Ready Notification

```typescript
import { sendOrderReady } from '@/services/wati';

await sendOrderReady('+254712345678', {
  orderId: 'ORD-001-20231015-0001',
  customerName: 'John Doe',
  collectionMethod: 'pickup',
  branchName: 'Lorenzo Kilimani'
});
```

### Send Driver Dispatched

```typescript
import { sendDriverDispatched } from '@/services/wati';

await sendDriverDispatched(
  '+254712345678',
  {
    orderId: 'ORD-001-20231015-0001',
    customerName: 'John Doe'
  },
  {
    driverName: 'Peter Mwangi',
    driverPhone: '+254723456789',
    estimatedArrival: 30
  }
);
```

### Send Payment Reminder

```typescript
import { sendPaymentReminder } from '@/services/wati';

await sendPaymentReminder(
  '+254712345678',
  {
    orderId: 'ORD-001-20231015-0001',
    customerName: 'John Doe'
  },
  500 // Balance amount in KES
);
```

## Automatic Notifications

The system automatically sends notifications based on order status changes:

| Event | Notification Template | Trigger |
|-------|----------------------|---------|
| Order Created | `order_confirmation` | When POS creates new order |
| Order Ready | `order_ready` | When status changes to "ready" |
| Driver Assigned | `driver_dispatched` | When delivery route is created |
| Driver Nearby | `driver_nearby` | When driver is ~5 min away |
| Order Delivered | `order_delivered` | When delivery is confirmed |
| Payment Due | `payment_reminder` | Scheduled job for unpaid balances |

## Error Handling

The Wati.io service includes robust error handling:

1. **Retry Logic**: Failed messages are retried 3 times with exponential backoff
2. **Firestore Logging**: All attempts are logged to the `notifications` collection
3. **Phone Validation**: Kenya phone numbers are validated before sending
4. **Error Messages**: Detailed error messages for debugging

### Notification Status Tracking

Check notification status in Firestore:

```typescript
import { adminDb } from '@/lib/firebase-admin';

const notificationsRef = adminDb.collection('notifications');
const snapshot = await notificationsRef
  .where('orderId', '==', 'ORD-001-20231015-0001')
  .get();

snapshot.forEach(doc => {
  const notification = doc.data();
  console.log(notification.status); // 'pending', 'sent', 'delivered', 'failed'
});
```

## Rate Limits

Wati.io API rate limits:
- **100 messages per second**
- **1000 messages per month** (on basic plan)
- Upgrade plan for higher limits

## Troubleshooting

### Problem: "404 Not Found" errors

**Solution**:
1. **Check API Endpoint URL format**: Must include your instance ID
   - ❌ Wrong: `https://live-server.wati.io`
   - ✅ Correct: `https://live-mt-server.wati.io/1051875`
2. **Verify URL from dashboard**: Copy the exact URL shown in your Wati API Docs
3. **Check for `live-mt-server` vs `live-server`**: Different accounts use different formats
4. **Ensure API access is enabled**: Look for padlock icons on API endpoints in dashboard
   - If you see padlocks, you may need to:
     - Upgrade your Wati plan to include API access
     - Contact Wati support to enable API access
     - Check if your trial account has API access enabled

### Problem: "401 Unauthorized" or "Authentication failed - invalid API key"

**Solution**:
1. **Remove "Bearer" prefix**: Access token should NOT include "Bearer"
   - ❌ Wrong: `WATI_ACCESS_TOKEN=Bearer eyJhbGciOi...`
   - ✅ Correct: `WATI_ACCESS_TOKEN=eyJhbGciOi...`
2. **Check for extra spaces**: Ensure no leading/trailing spaces in `.env.local`
3. **Regenerate token**: Get a fresh Access Token from Wati dashboard (Dashboard > API Docs)
4. **Password change**: Note that changing your Wati account password invalidates the token
5. **Trial account**: Verify your trial account hasn't expired (Wati trials are typically 4-7 days)

### Problem: "Template not found"

**Solution**:
1. Ensure template is approved in Wati.io dashboard
2. Check template name matches exactly (case-sensitive)
3. Wait for template approval (can take 24-48 hours)

### Problem: "Invalid phone number"

**Solution**:
1. Ensure phone number is in Kenya format (+254...)
2. Phone must be registered on WhatsApp
3. Use `isValidKenyanPhoneNumber()` to validate before sending

### Problem: Messages not being delivered

**Solution**:
1. Check Firestore `notifications` collection for error messages
2. Verify customer's phone number is active on WhatsApp
3. Check Wati.io dashboard for delivery reports
4. Ensure you haven't exceeded message quota

### Problem: "Bad request - check template name and parameters"

**Solution**:
1. **Match all template parameters**: Template with 4 parameters requires exactly 4 values
   - Example: If template has `{{name}}`, `{{dashboard_url}}`, `{{tenant_id}}`, `{{username}}`
   - You MUST provide all 4 parameters in your API call
2. **Check parameter count**: Template with 3 params needs exactly 3 values (not 2, not 4)
3. **Verify parameter names**: Parameter names must match template variable names
4. **Convert to strings**: Ensure parameter values are strings (convert numbers: `amount.toString()`)
5. **Template name case-sensitive**: Use exact template name (e.g., `order_confirmation` not `Order_Confirmation`)

## Monitoring

Monitor WhatsApp notifications:

1. **Wati.io Dashboard**: View delivery reports and analytics
2. **Firestore Console**: Query `notifications` collection
3. **Application Logs**: Check console for `[Wati]` prefixed logs

## Cost Optimization

Tips to optimize WhatsApp messaging costs:

1. **Avoid Duplicate Messages**: Check if notification already sent before sending
2. **Batch Notifications**: Group related updates when possible
3. **User Preferences**: Respect customer notification preferences
4. **Test in Sandbox**: Use sandbox mode for development/testing

## Support

- **Wati.io Support**: support@wati.io or via dashboard chat
- **Documentation**: [https://docs.wati.io](https://docs.wati.io)
- **API Reference**: Available in Wati.io dashboard under "API Docs"

## Next Steps

After setup is complete:

1. **Integrate with Order Flow**: Add notification triggers to order status updates
2. **Test with Real Orders**: Send test orders and verify notifications
3. **Monitor Performance**: Track delivery rates and customer feedback
4. **Optimize Templates**: Refine message templates based on user feedback

## Security Best Practices

1. **Never commit API keys**: Always use environment variables
2. **Rotate keys regularly**: Change API keys every 3-6 months
3. **Limit access**: Only grant API access to necessary team members
4. **Monitor usage**: Set up alerts for unusual activity
5. **Use HTTPS only**: Never send API requests over HTTP

---

**Last Updated**: November 23, 2025 (Testing completed successfully)
**Wati.io Integration Version**: 1.0
**Lorenzo Dry Cleaners Management System**

**Note**: Configuration tested and verified working with Wati trial account on November 23, 2025.
