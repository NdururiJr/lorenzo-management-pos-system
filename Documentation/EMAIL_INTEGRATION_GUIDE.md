# Email Integration Guide

This guide shows you exactly where to add email sending code in the Lorenzo Dry Cleaners application.

## Quick Reference

| Event | Function to Call | Location to Add Code |
|-------|-----------------|---------------------|
| Password Reset | `sendPasswordReset()` | ✅ Already integrated in `/app/(auth)/actions.ts` |
| Order Created | `sendOrderConfirmation()` | `/app/(dashboard)/pos/actions.ts` |
| Order Status Changed | `sendOrderStatusUpdate()` | Order update handlers |
| Payment Received | `sendReceipt()` | Payment processing handlers |

---

## 1. Order Confirmation (When Order is Created)

**File:** `/app/(dashboard)/pos/actions.ts` or wherever you create orders

**Add this code after creating an order:**

```typescript
import { sendOrderConfirmation } from '@/services/email';

// After creating order in Firestore
const order = await createOrderInFirestore(orderData);

// Send confirmation email if customer has email
if (orderData.customerEmail) {
  // Don't await - send async to avoid slowing down order creation
  sendOrderConfirmation({
    orderId: order.orderId,
    customerName: orderData.customerName,
    customerEmail: orderData.customerEmail,
    garmentCount: order.garments.length,
    totalAmount: order.totalAmount,
    estimatedCompletion: order.estimatedCompletion,
    branchName: branch.name,
    branchPhone: branch.phone,
    orderDate: order.createdAt,
    trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${order.orderId}`,
  }).catch((error) => {
    console.error('Failed to send order confirmation email:', error);
    // Don't throw - email failure shouldn't stop order creation
  });
}
```

---

## 2. Order Status Update (When Status Changes)

**File:** Order status update handlers (pipeline actions)

**Add this code when order status changes:**

```typescript
import { sendOrderStatusUpdate } from '@/services/email';

// After updating order status in Firestore
await updateOrderStatus(orderId, newStatus);

// Get order and customer data
const order = await getOrder(orderId);
const customer = await getCustomer(order.customerId);

// Send status update email if customer has email
if (customer.email) {
  const statusMessages = {
    washing: 'Your items are being washed with care.',
    drying: 'Your items are being dried.',
    ironing: 'Your items are being pressed and ironed.',
    quality_check: 'Your items are undergoing quality inspection.',
    packaging: 'Your items are being carefully packaged.',
    ready: 'Great news! Your order is ready for pickup.',
    out_for_delivery: 'Your order is on its way!',
    delivered: 'Your order has been delivered. Thank you!',
  };

  sendOrderStatusUpdate({
    orderId: order.orderId,
    customerName: customer.name,
    customerEmail: customer.email,
    oldStatus: order.previousStatus || 'received',
    newStatus: newStatus,
    statusMessage: statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`,
    trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${order.orderId}`,
    estimatedCompletion: order.estimatedCompletion,
  }).catch((error) => {
    console.error('Failed to send status update email:', error);
  });
}
```

---

## 3. Receipt Email (When Payment is Processed)

**File:** Payment processing handlers (Pesapal callback, POS payment)

### Option A: Simple Receipt (No PDF)

```typescript
import { sendReceipt } from '@/services/email';

// After processing payment
const transaction = await processPayment(paymentData);

// Get order and customer data
const order = await getOrder(transaction.orderId);
const customer = await getCustomer(order.customerId);

// Send receipt email if customer has email
if (customer.email) {
  sendReceipt({
    orderId: order.orderId,
    customerName: customer.name,
    customerEmail: customer.email,
    totalAmount: order.totalAmount,
    paidAmount: transaction.amount,
    paymentMethod: transaction.method,
    transactionDate: transaction.timestamp,
    receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/receipts/${order.orderId}`,
  }).catch((error) => {
    console.error('Failed to send receipt email:', error);
  });
}
```

### Option B: Receipt with PDF Attachment

```typescript
import { sendReceipt } from '@/services/email';
import { generateReceiptPDF } from '@/lib/pdf-generator'; // Your PDF generator

// After processing payment
const transaction = await processPayment(paymentData);

// Generate PDF receipt
const pdfBuffer = await generateReceiptPDF(transaction);

// Get order and customer data
const order = await getOrder(transaction.orderId);
const customer = await getCustomer(order.customerId);

// Send receipt email with PDF attachment
if (customer.email) {
  sendReceipt(
    {
      orderId: order.orderId,
      customerName: customer.name,
      customerEmail: customer.email,
      totalAmount: order.totalAmount,
      paidAmount: transaction.amount,
      paymentMethod: transaction.method,
      transactionDate: transaction.timestamp,
    },
    pdfBuffer // PDF attachment
  ).catch((error) => {
    console.error('Failed to send receipt email:', error);
  });
}
```

---

## 4. Password Reset (Already Integrated)

**File:** `/app/(auth)/actions.ts`

This is already implemented! The password reset email is automatically sent when a user requests a password reset.

---

## Integration Checklist

Use this checklist to track email integration progress:

- [x] Password reset email (already integrated)
- [ ] Order confirmation email
  - [ ] Added to order creation in POS
  - [ ] Added to customer portal order creation
  - [ ] Tested with real email address
- [ ] Order status update email
  - [ ] Added to pipeline status changes
  - [ ] Added to workstation status updates
  - [ ] Tested all status transitions
- [ ] Receipt email
  - [ ] Added to cash payment processing
  - [ ] Added to M-Pesa payment processing
  - [ ] Added to Pesapal payment callback
  - [ ] PDF attachment working (optional)
  - [ ] Tested with all payment methods

---

## Testing Your Integration

### 1. Test Individual Emails

```bash
# Test password reset
npm run test:email -- --send-password-reset your-email@example.com

# Test order confirmation
npm run test:email -- --send-order-confirmation your-email@example.com

# Test status update
npm run test:email -- --send-status-update your-email@example.com

# Test receipt
npm run test:email -- --send-receipt your-email@example.com

# Test all emails
npm run test:email -- --send-all your-email@example.com
```

### 2. Test in Application

1. Create a test order with your email address
2. Verify confirmation email arrives
3. Update order status
4. Verify status update email arrives
5. Process payment
6. Verify receipt email arrives

### 3. Check Email Logs

```typescript
// Query email logs in Firestore
const logs = await db.collection('email_logs')
  .where('recipient', '==', 'customer@example.com')
  .orderBy('timestamp', 'desc')
  .limit(10)
  .get();

logs.forEach((doc) => {
  const log = doc.data();
  console.log(`${log.type}: ${log.success ? '✅' : '❌'} ${log.error || ''}`);
});
```

---

## Best Practices

### 1. Don't Block User Operations

```typescript
// ❌ BAD - Blocks order creation if email fails
await sendOrderConfirmation(data);

// ✅ GOOD - Send async, catch errors
sendOrderConfirmation(data).catch(console.error);
```

### 2. Check for Email Before Sending

```typescript
// ❌ BAD - Will fail if email is missing
sendOrderConfirmation({ ...data, customerEmail: customer.email });

// ✅ GOOD - Check first
if (customer.email) {
  sendOrderConfirmation({ ...data, customerEmail: customer.email });
}
```

### 3. Provide Fallback for Missing Data

```typescript
// ✅ GOOD - Provide defaults
sendOrderConfirmation({
  orderId: order.orderId,
  customerName: customer.name || 'Valued Customer',
  customerEmail: customer.email,
  garmentCount: order.garments?.length || 0,
  totalAmount: order.totalAmount || 0,
  // ... etc
});
```

### 4. Log Email Failures

```typescript
sendOrderConfirmation(data).catch((error) => {
  console.error('Email send failed:', {
    orderId: data.orderId,
    customerEmail: data.customerEmail,
    error: error.message,
  });

  // Optionally notify admin
  // notifyAdmin('Email failure', error);
});
```

---

## Common Patterns

### Pattern 1: Fire and Forget

Best for: Non-critical emails (status updates, confirmations)

```typescript
sendOrderConfirmation(data).catch(console.error);
```

### Pattern 2: Wait for Success

Best for: Critical emails (password reset, receipts)

```typescript
const result = await sendReceipt(data);
if (!result.success) {
  console.error('Receipt email failed:', result.error);
  // Maybe show warning to user
}
```

### Pattern 3: Retry on Failure

Best for: High-priority emails

```typescript
async function sendWithRetry(emailFn, data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await emailFn(data);
    if (result.success) return result;

    console.log(`Retry ${i + 1}/${maxRetries}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Email failed after retries');
}

// Usage
await sendWithRetry(sendReceipt, receiptData);
```

---

## Troubleshooting

### Email not sending in development

1. Check `.env.local` has `RESEND_API_KEY`
2. Check email address is valid
3. Check Resend dashboard for errors
4. Check Firestore `email_logs` collection

### Email going to spam

1. Verify domain in Resend dashboard
2. Set up SPF/DKIM/DMARC records
3. Use consistent "from" email
4. Avoid spam trigger words

### Template not rendering correctly

1. Check all props are passed
2. Use `npx email dev` to preview templates
3. Check React Email component syntax

---

## Next Steps

1. Add email sending to order creation
2. Add email sending to status updates
3. Add email sending to payment processing
4. Test all integrations
5. Monitor email logs in Firestore
6. Check Resend dashboard for delivery stats

---

**Questions?** Contact jerry@ai-agentsplus.com

Last Updated: November 14, 2025
