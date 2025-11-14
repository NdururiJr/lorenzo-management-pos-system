# Email Service Documentation

## Overview

The Lorenzo Dry Cleaners email service uses **Resend** for sending transactional emails. This document covers setup, usage, and troubleshooting.

## Table of Contents

1. [Setup](#setup)
2. [Architecture](#architecture)
3. [Email Templates](#email-templates)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (it starts with `re_`)

### 2. Configure Domain (Production Only)

For production, you need to verify your domain:

1. Go to Domains in Resend dashboard
2. Add your domain (e.g., `lorenzo-dry-cleaners.com`)
3. Add DNS records as instructed by Resend
4. Wait for verification (usually a few minutes)

### 3. Set Environment Variables

Add to your `.env.local`:

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Lorenzo Dry Cleaners <noreply@lorenzo-dry-cleaners.com>
RESEND_REPLY_TO_EMAIL=support@lorenzo-dry-cleaners.com
```

**Development:** You can use Resend's default domain (`onboarding@resend.dev`) for testing.

**Production:** Use your verified domain.

### 4. Verify Installation

The following packages are already installed:

- `resend` (v6.2.0+)
- `@react-email/components` (v0.5.7+)
- `@react-email/render` (v1.4.0+)

---

## Architecture

### File Structure

```
/lib/resend.ts              # Resend client configuration
/services/email.ts          # Email service functions
/emails/                    # React Email templates
  ├── password-reset.tsx
  ├── order-confirmation.tsx
  ├── order-status-update.tsx
  └── receipt.tsx
```

### Flow Diagram

```
Application Code
    ↓
Email Service Function (/services/email.ts)
    ↓
React Email Template (/emails/*.tsx)
    ↓
Resend API (/lib/resend.ts)
    ↓
Email Delivered to Customer
```

---

## Email Templates

### 1. Password Reset Email

**Template:** `/emails/password-reset.tsx`

**When Sent:** User requests password reset

**Data Required:**
- `email` (string) - Recipient email
- `resetLink` (string) - Password reset URL
- `userName` (string, optional) - User's name

**Features:**
- Secure reset link
- 1-hour expiration notice
- Security warning if not requested

---

### 2. Order Confirmation Email

**Template:** `/emails/order-confirmation.tsx`

**When Sent:** New order is created

**Data Required:**
```typescript
{
  orderId: string;
  customerName: string;
  customerEmail: string;
  garmentCount: number;
  totalAmount: number;
  estimatedCompletion: Date;
  branchName: string;
  branchPhone: string;
  orderDate: Date;
  trackingUrl?: string;
}
```

**Features:**
- Order details summary
- Estimated completion date
- Track order button
- Branch contact information

---

### 3. Order Status Update Email

**Template:** `/emails/order-status-update.tsx`

**When Sent:** Order status changes (e.g., washing → drying → ready)

**Data Required:**
```typescript
{
  orderId: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  statusMessage: string;
  trackingUrl?: string;
  estimatedCompletion?: Date;
}
```

**Features:**
- Color-coded status badge
- Status timeline visualization
- Custom status message

---

### 4. Receipt Email

**Template:** `/emails/receipt.tsx`

**When Sent:** Payment is processed

**Data Required:**
```typescript
{
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  transactionDate: Date;
  receiptUrl?: string;
}
```

**Features:**
- Payment breakdown
- Outstanding balance (if applicable)
- PDF attachment support
- Payment method display

---

## Usage Examples

### Example 1: Send Password Reset Email

```typescript
import { sendPasswordReset } from '@/services/email';

const result = await sendPasswordReset(
  'customer@example.com',
  'https://lorenzo.com/reset?token=abc123',
  'John Doe'
);

if (result.success) {
  console.log('Email sent:', result.id);
} else {
  console.error('Email failed:', result.error);
}
```

### Example 2: Send Order Confirmation

```typescript
import { sendOrderConfirmation } from '@/services/email';

const result = await sendOrderConfirmation({
  orderId: 'ORD-KIL-20251114-0001',
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  garmentCount: 5,
  totalAmount: 2500,
  estimatedCompletion: new Date('2025-11-18'),
  branchName: 'Kilimani Branch',
  branchPhone: '+254 725 462 859',
  orderDate: new Date(),
  trackingUrl: 'https://lorenzo.com/track/ORD-KIL-20251114-0001',
});
```

### Example 3: Send Receipt with PDF

```typescript
import { sendReceipt } from '@/services/email';
import jsPDF from 'jspdf';

// Generate PDF (example)
const doc = new jsPDF();
doc.text('Receipt', 20, 20);
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

const result = await sendReceipt(
  {
    orderId: 'ORD-KIL-20251114-0001',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    totalAmount: 2500,
    paidAmount: 2500,
    paymentMethod: 'mpesa',
    transactionDate: new Date(),
  },
  pdfBuffer // Optional PDF attachment
);
```

### Example 4: Send Order Status Update

```typescript
import { sendOrderStatusUpdate } from '@/services/email';

const result = await sendOrderStatusUpdate({
  orderId: 'ORD-KIL-20251114-0001',
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  oldStatus: 'washing',
  newStatus: 'ready',
  statusMessage: 'Great news! Your order is ready for pickup at our Kilimani branch.',
  trackingUrl: 'https://lorenzo.com/track/ORD-KIL-20251114-0001',
});
```

---

## Error Handling

### Retry Logic

The email service automatically retries failed sends:

- **Max Retries:** 3 attempts
- **Backoff Strategy:** Exponential (1s, 2s, 4s)
- **Total Max Time:** ~7 seconds

### Error Types

1. **Configuration Error:** `RESEND_API_KEY` not set
   - Returns `{ success: false, error: 'Email service not configured' }`
   - Email is logged but not sent

2. **Network Error:** API request fails
   - Retries automatically
   - Returns error after max retries

3. **Invalid Email:** Malformed email address
   - Returns `{ success: false, error: 'Invalid email address' }`

### Error Logging

All email attempts are logged to Firestore in the `email_logs` collection:

```typescript
{
  type: 'password_reset' | 'order_confirmation' | 'order_status_update' | 'receipt' | 'custom',
  recipient: string,
  success: boolean,
  emailId?: string,
  error?: string,
  retryCount: number,
  metadata: { ... },
  timestamp: Date
}
```

---

## Testing

### 1. Test Email Connection

```typescript
import { testEmailConnection } from '@/services/email';

const result = await testEmailConnection('your-email@example.com');

if (result.success) {
  console.log('✅ Email service is working!');
} else {
  console.error('❌ Email service failed:', result.error);
}
```

### 2. Development Testing

In development, emails are sent to the address specified, but Resend may show a warning banner.

**Best Practice:** Use a test email address you control (e.g., your Gmail).

### 3. Preview Email Templates Locally

Install React Email Dev Tools (optional):

```bash
npm install -g @react-email/cli
```

Then preview templates:

```bash
cd /home/user/lorenzo-dry-cleaners
npx email dev
```

This opens a browser at `http://localhost:3000` with live preview of all templates.

### 4. Resend Dashboard

Monitor all sent emails in the Resend dashboard:
- View delivery status
- See open/click rates
- Debug bounce/spam issues

---

## Troubleshooting

### Problem: Emails not sending

**Solution 1:** Check environment variables
```bash
echo $RESEND_API_KEY
echo $RESEND_FROM_EMAIL
```

**Solution 2:** Verify API key in Resend dashboard

**Solution 3:** Check Firestore `email_logs` for error details

---

### Problem: Emails going to spam

**Solution 1:** Verify your domain in Resend

**Solution 2:** Set up SPF, DKIM, and DMARC records

**Solution 3:** Use a consistent "from" email address

**Solution 4:** Avoid spam trigger words in subject lines

---

### Problem: Template rendering issues

**Solution 1:** Check React Email component syntax

**Solution 2:** Verify all props are passed correctly

**Solution 3:** Use `npx email dev` to preview templates

---

### Problem: Rate limiting

Resend free tier limits:
- **100 emails/day** (free tier)
- **50 emails/second** (paid tier)

**Solution:** Upgrade to paid plan or implement queuing

---

## Integration Points

### Where emails are sent in the application:

1. **Password Reset:** `/app/(auth)/actions.ts` → `sendPasswordReset()`
2. **Order Creation:** Add to POS order creation handler
3. **Status Updates:** Add to order status change handlers
4. **Payment Processing:** Add to payment completion handler

### Example Integration (Order Creation):

```typescript
// In your order creation function
import { sendOrderConfirmation } from '@/services/email';

async function createOrder(orderData) {
  // ... create order in Firestore ...

  // Send confirmation email
  if (orderData.customerEmail) {
    await sendOrderConfirmation({
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      garmentCount: order.garments.length,
      totalAmount: order.totalAmount,
      estimatedCompletion: order.estimatedCompletion,
      branchName: branch.name,
      branchPhone: branch.phone,
      orderDate: order.createdAt,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.orderId}`,
    });
  }
}
```

---

## API Reference

### `sendPasswordReset(email, resetLink, userName?)`

Sends password reset email.

**Returns:** `Promise<EmailResult>`

---

### `sendOrderConfirmation(data)`

Sends order confirmation email.

**Returns:** `Promise<EmailResult>`

---

### `sendOrderStatusUpdate(data)`

Sends order status update email.

**Returns:** `Promise<EmailResult>`

---

### `sendReceipt(data, pdfBuffer?)`

Sends receipt email with optional PDF attachment.

**Returns:** `Promise<EmailResult>`

---

### `sendTransactionalEmail(to, subject, reactComponent)`

Sends custom email using any React component.

**Returns:** `Promise<EmailResult>`

---

### `testEmailConnection(email)`

Tests email service configuration.

**Returns:** `Promise<EmailResult>`

---

## Pricing

### Resend Pricing (as of 2025)

- **Free Tier:** 3,000 emails/month, 100 emails/day
- **Paid Tier:** $20/month for 50,000 emails
- **Enterprise:** Custom pricing

**Recommendation:** Start with free tier, upgrade if needed.

---

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Validate email addresses** before sending
3. **Rate limit** email sending to prevent abuse
4. **Log all email attempts** for audit trail
5. **Use HTTPS** for all reset links
6. **Set reset link expiration** (default: 1 hour)
7. **Don't reveal** if email exists (security through obscurity)

---

## Support

**Resend Documentation:** https://resend.com/docs

**React Email Documentation:** https://react.email/docs

**Lorenzo Team Contact:** jerry@ai-agentsplus.com

---

Last Updated: November 14, 2025
