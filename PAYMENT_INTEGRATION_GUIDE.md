# Payment Integration Guide - Lorenzo Dry Cleaners

## Overview

This document provides a complete guide to the Pesapal payment gateway integration for the Lorenzo Dry Cleaners POS system.

## Table of Contents

1. [Architecture](#architecture)
2. [Payment Methods Supported](#payment-methods-supported)
3. [Setup Instructions](#setup-instructions)
4. [Testing](#testing)
5. [API Reference](#api-reference)
6. [Component Usage](#component-usage)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Payment Flow

```
┌────────────┐
│   POS UI   │
└─────┬──────┘
      │ 1. Select payment method
      ↓
┌────────────────────┐
│  Payment Service   │
│  (payment-service) │
└─────┬──────────────┘
      │
      ├─ 2a. Cash → Record immediately
      │
      ├─ 2b. Credit → Record with note
      │
      ├─ 2c. M-Pesa/Card → Pesapal API
      │           │
      │           ↓
      │    ┌──────────────┐
      │    │ Pesapal API  │
      │    └──────┬───────┘
      │           │ 3. Get redirect URL
      │           ↓
      │    Customer completes payment
      │           │
      │           ↓ 4. IPN Callback
      │    ┌──────────────┐
      │    │   Webhook    │
      │    └──────┬───────┘
      │           │
      └───────────┴─ 5. Update status
                  │
                  ↓
           ┌──────────────┐
           │  Firestore   │
           │ (transactions)│
           └──────────────┘
```

### File Structure

```
lorenzo-dry-cleaners/
├── services/
│   └── pesapal.ts                    # Pesapal API client
├── lib/
│   ├── payments/
│   │   ├── payment-service.ts        # Payment processing logic
│   │   └── payment-types.ts          # TypeScript types
│   └── receipts/
│       └── receipt-generator.ts      # PDF receipt generation
├── components/features/pos/
│   ├── PaymentModal.tsx              # Payment UI
│   ├── PaymentStatus.tsx             # Real-time status display
│   └── ReceiptPreview.tsx            # Receipt preview & download
└── app/api/
    ├── webhooks/pesapal/route.ts     # IPN callback handler
    └── payments/[id]/status/route.ts # Status query endpoint
```

---

## Payment Methods Supported

### 1. Cash Payments

- **Status:** Immediately completed
- **Features:**
  - Amount tendered tracking
  - Change calculation
  - Instant receipt generation
- **Use Case:** Walk-in customers paying with physical cash

### 2. M-Pesa (via Pesapal)

- **Status:** Pending → Completed/Failed
- **Requirements:**
  - Customer phone number (Kenyan format: +254...)
  - Customer email (optional)
- **Features:**
  - STK push to customer phone
  - Transaction code tracking
  - Real-time status updates
- **Limits:** KES 10 - KES 500,000 per transaction

### 3. Card Payments (via Pesapal)

- **Status:** Pending → Completed/Failed
- **Supported Cards:**
  - Visa
  - Mastercard
- **Requirements:**
  - Customer phone number
  - Customer email (optional)
- **Features:**
  - Secure redirect to Pesapal payment page
  - 3D Secure support
  - Real-time status updates
- **Limits:** Minimum KES 10

### 4. Credit Account

- **Status:** Immediately completed
- **Features:**
  - Credit note tracking
  - Customer account balance (future)
  - Payment history
- **Use Case:** Regular customers with credit accounts

---

## Setup Instructions

### Step 1: Create Pesapal Account

1. Visit [Pesapal](https://www.pesapal.com)
2. Sign up for a business account
3. Submit required documents:
   - Business registration certificate
   - KRA PIN certificate
   - ID/Passport of business owner
4. Wait for approval (2-5 business days)

### Step 2: Get Sandbox Credentials

1. Log into Pesapal dashboard
2. Navigate to **Settings → API Credentials**
3. Copy **Consumer Key** (Sandbox)
4. Copy **Consumer Secret** (Sandbox)
5. Copy **IPN Registration URL** from your app: `https://your-domain.com/api/webhooks/pesapal`

### Step 3: Register IPN URL

#### Option A: Using Pesapal Dashboard

1. Go to **Settings → IPN Settings**
2. Click **Register New IPN**
3. Enter your IPN URL: `https://your-domain.com/api/webhooks/pesapal`
4. Select notification type: **POST**
5. Save and copy the **IPN ID**

#### Option B: Programmatically (Recommended)

Create a setup script:

```typescript
// scripts/setup-pesapal.ts
import { registerIPNUrl } from '@/services/pesapal';

async function setupPesapal() {
  const ipnUrl = process.env.PESAPAL_IPN_URL || 'https://your-domain.com/api/webhooks/pesapal';

  const result = await registerIPNUrl(ipnUrl, 'POST');

  if (result.success) {
    console.log('IPN registered successfully!');
    console.log('IPN ID:', result.ipnId);
    console.log('Add this to your .env.local file:');
    console.log(`PESAPAL_IPN_ID=${result.ipnId}`);
  } else {
    console.error('IPN registration failed:', result.error);
  }
}

setupPesapal();
```

Run the script:

```bash
npx ts-node scripts/setup-pesapal.ts
```

### Step 4: Configure Environment Variables

Add to your `.env.local` file:

```env
# Pesapal Sandbox
PESAPAL_CONSUMER_KEY=your_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_consumer_secret_here
PESAPAL_API_URL=https://cybqa.pesapal.com/pesapalv3
PESAPAL_IPN_URL=https://your-domain.com/api/webhooks/pesapal
PESAPAL_IPN_ID=your_ipn_id_here
```

For **production**, change:

```env
PESAPAL_API_URL=https://pay.pesapal.com/pesapalv3
```

### Step 5: Test Connection

```bash
npm run test:pesapal
```

Or create a test page in your app:

```typescript
// app/test-pesapal/page.tsx
import { testPesapalConnection } from '@/services/pesapal';

export default async function TestPesapalPage() {
  const result = await testPesapalConnection();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pesapal Connection Test</h1>
      {result.success ? (
        <div className="text-green-600">✓ {result.message}</div>
      ) : (
        <div className="text-red-600">✗ {result.message}</div>
      )}
    </div>
  );
}
```

---

## Testing

### Sandbox Testing Credentials

#### Test M-Pesa

- **Phone Number:** `+254 700 000 000` (any Kenyan number in sandbox)
- **PIN:** `1234` (sandbox environment)

#### Test Cards

**Visa (Success):**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

**Visa (Failure):**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

**Mastercard (Success):**
- Card Number: `5500 0000 0000 0004`
- Expiry: Any future date
- CVV: Any 3 digits

### Test Scenarios

#### 1. Test Cash Payment

```typescript
const result = await processCashPayment({
  orderId: 'ORD-MAIN-20251015-0001',
  customerId: 'CUST-123',
  amount: 500,
  amountTendered: 1000,
  userId: 'user-123',
});

console.log('Transaction ID:', result.transactionId);
console.log('Change:', 500); // KES 500 change
```

#### 2. Test M-Pesa Payment

```typescript
const result = await initiateDigitalPayment({
  orderId: 'ORD-MAIN-20251015-0002',
  customerId: 'CUST-123',
  amount: 1500,
  customerPhone: '+254712345678',
  customerEmail: 'customer@example.com',
  method: 'mpesa',
  userId: 'user-123',
});

console.log('Redirect URL:', result.redirectUrl);
// Open URL to complete payment
```

#### 3. Test Payment Status Polling

```typescript
const status = await checkPaymentStatus(transactionId, true);

console.log('Status:', status.status); // 'pending', 'completed', or 'failed'
console.log('Amount:', status.amount);
```

#### 4. Test Webhook Callback

Use ngrok or similar tool to expose localhost:

```bash
ngrok http 3000
```

Update your IPN URL to the ngrok URL:

```
https://abc123.ngrok.io/api/webhooks/pesapal
```

### Manual Testing Checklist

- [ ] Cash payment records successfully
- [ ] Change calculation is correct
- [ ] M-Pesa payment initiates and redirects
- [ ] M-Pesa payment completes successfully
- [ ] Card payment initiates and redirects
- [ ] Card payment completes successfully
- [ ] Payment failure is handled gracefully
- [ ] IPN callback updates transaction status
- [ ] Real-time status updates work
- [ ] Receipt generates with correct data
- [ ] Receipt downloads as PDF
- [ ] Receipt prints correctly

---

## API Reference

### Payment Service Functions

#### `processCashPayment(data: CashPaymentData): Promise<PaymentResult>`

Process a cash payment.

**Parameters:**
- `orderId` (string): Order ID
- `customerId` (string): Customer ID
- `amount` (number): Payment amount in KES
- `amountTendered` (number, optional): Amount given by customer
- `userId` (string): ID of user processing payment

**Returns:**
```typescript
{
  success: boolean;
  transactionId?: string;
  error?: string;
  message?: string;
}
```

#### `initiateDigitalPayment(data: DigitalPaymentData): Promise<PaymentResult>`

Initiate M-Pesa or Card payment via Pesapal.

**Parameters:**
- `orderId` (string): Order ID
- `customerId` (string): Customer ID
- `amount` (number): Payment amount in KES
- `customerPhone` (string): Customer phone (+254...)
- `customerEmail` (string): Customer email
- `method` ('mpesa' | 'card'): Payment method
- `userId` (string): ID of user processing payment

**Returns:**
```typescript
{
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}
```

#### `processCreditPayment(data: CreditPaymentData): Promise<PaymentResult>`

Process a credit account payment.

**Parameters:**
- `orderId` (string): Order ID
- `customerId` (string): Customer ID
- `amount` (number): Payment amount in KES
- `userId` (string): ID of user processing payment
- `creditNote` (string, optional): Note about credit payment

#### `checkPaymentStatus(transactionId: string, checkPesapal?: boolean): Promise<PaymentStatusResult | null>`

Check the status of a payment transaction.

**Parameters:**
- `transactionId` (string): Transaction ID
- `checkPesapal` (boolean, optional): Whether to query Pesapal for latest status

**Returns:**
```typescript
{
  transactionId: string;
  orderId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  method: PaymentMethod;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

---

## Component Usage

### PaymentModal

Payment modal for processing all payment types.

```tsx
import { PaymentModal } from '@/components/features/pos/PaymentModal';

function POSPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderExtended | null>(null);

  const handlePaymentSuccess = () => {
    // Refresh order data
    // Show success message
    setShowPaymentModal(false);
  };

  return (
    <>
      <Button onClick={() => setShowPaymentModal(true)}>
        Process Payment
      </Button>

      {selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          userId="current-user-id"
        />
      )}
    </>
  );
}
```

### PaymentStatus

Display real-time payment status.

```tsx
import { PaymentStatus } from '@/components/features/pos/PaymentStatus';

function TransactionView({ transactionId, orderId, amount, method }) {
  return (
    <PaymentStatus
      transactionId={transactionId}
      orderId={orderId}
      amount={amount}
      method={method}
      showDetails={true}
    />
  );
}
```

### ReceiptPreview

Preview and download/print receipts.

```tsx
import { ReceiptPreview } from '@/components/features/pos/ReceiptPreview';

function OrderComplete({ order }) {
  const [showReceipt, setShowReceipt] = useState(false);

  return (
    <>
      <Button onClick={() => setShowReceipt(true)}>
        View Receipt
      </Button>

      <ReceiptPreview
        orderId={order.orderId}
        orderDetails={{
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          paidAmount: order.paidAmount,
        }}
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </>
  );
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Failed to authenticate with Pesapal"

**Cause:** Invalid consumer key or secret.

**Solution:**
- Verify credentials in `.env.local`
- Ensure you're using the correct environment (sandbox vs production)
- Check that credentials don't have extra spaces or quotes

#### 2. "IPN callback not received"

**Cause:** Webhook URL not accessible or not registered.

**Solutions:**
- Ensure your app is publicly accessible (use ngrok for local testing)
- Verify IPN URL is correctly registered in Pesapal dashboard
- Check that your webhook endpoint is working: `GET https://your-domain.com/api/webhooks/pesapal`
- Review server logs for incoming requests

#### 3. "Payment stuck in pending status"

**Cause:** Customer didn't complete payment or callback failed.

**Solutions:**
- Check payment status in Pesapal dashboard
- Manually query Pesapal API with `checkPaymentStatus(transactionId, true)`
- Check if IPN callback was received (check logs)
- If payment was completed in Pesapal but status not updated, manually trigger callback

#### 4. "Invalid phone number format"

**Cause:** Phone number not in correct format.

**Solution:**
- Ensure phone starts with `+254` or `254`
- Remove any spaces or special characters
- Example: `+254712345678` ✓, `0712345678` ✗

#### 5. "Payment amount exceeds balance due"

**Cause:** Trying to pay more than what's owed.

**Solution:**
- Verify order balance: `order.totalAmount - order.paidAmount`
- Handle partial payments correctly
- Refresh order data before processing payment

### Debug Mode

Enable debug logging:

```typescript
// services/pesapal.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Pesapal Request:', requestData);
  console.log('Pesapal Response:', response.data);
}
```

### Testing Webhook Locally

1. Install ngrok: `npm install -g ngrok`
2. Start your app: `npm run dev`
3. Expose localhost: `ngrok http 3000`
4. Update IPN URL in Pesapal dashboard to ngrok URL
5. Test payment and watch logs

### Pesapal Dashboard

Monitor all transactions in real-time:
- Login to [Pesapal Dashboard](https://www.pesapal.com/dashboard)
- Navigate to **Transactions**
- Search by Order ID or Transaction ID
- View detailed payment flow and status

---

## Security Best Practices

### 1. Protect API Credentials

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Rotate credentials regularly (every 3 months)

### 2. Verify Webhook Signatures

Always verify that callbacks are from Pesapal:

```typescript
const isValid = verifyPesapalSignature(
  orderTrackingId,
  merchantReference,
  signature
);

if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
}
```

### 3. Validate Payment Amounts

Always verify payment amounts match:

```typescript
const order = await getOrder(orderId);
const balanceDue = order.totalAmount - order.paidAmount;

if (amount > balanceDue) {
  throw new Error('Payment exceeds balance due');
}
```

### 4. Use HTTPS

- Always use HTTPS in production
- Ensure SSL certificate is valid
- Test with SSL tools: https://www.ssllabs.com/ssltest/

### 5. Log All Transactions

Log all payment attempts for audit trail:

```typescript
console.log({
  event: 'payment_initiated',
  orderId,
  amount,
  method,
  userId,
  timestamp: new Date().toISOString(),
});
```

---

## Production Checklist

Before going live:

- [ ] Switch to production Pesapal credentials
- [ ] Update PESAPAL_API_URL to production URL
- [ ] Register production IPN URL
- [ ] Test with real M-Pesa account (small amount)
- [ ] Test with real card (small amount)
- [ ] Verify webhook is receiving callbacks
- [ ] Set up monitoring and alerts
- [ ] Document customer support procedures
- [ ] Train staff on payment processing
- [ ] Have rollback plan ready

---

## Support

### Pesapal Support

- **Email:** support@pesapal.com
- **Phone:** +254 709 986 000
- **Documentation:** https://developer.pesapal.com

### Lorenzo Dry Cleaners Dev Team

- **Gachengoh Marugu:** hello@ai-agentsplus.com, +254 725 462 859
- **Arthur Tutu:** arthur@ai-agentsplus.com
- **Jerry Nduriri:** jerry@ai-agentsplus.com, +254 725 462 859

---

**Last Updated:** October 11, 2025
**Version:** 1.0
