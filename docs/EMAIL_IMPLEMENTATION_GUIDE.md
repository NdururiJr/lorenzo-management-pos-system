# Email Implementation Guide

Complete guide to the email notification system using Resend.

## Overview

The Lorenzo Dry Cleaners system sends automated, branded email notifications for key events across the customer lifecycle, staff operations, and authentication flows. All emails follow the black & white minimalistic design system.

## Email Infrastructure

### Core Files
- **Service**: `services/email.ts` - Email sending functions with retry logic
- **Config**: `lib/resend.ts` - Resend client configuration
- **Templates**: `emails/*.tsx` - React Email templates
- **Logs**: Firestore `email_logs` collection - Email attempt tracking

### Features
- ✅ Retry logic with exponential backoff (max 3 retries)
- ✅ Comprehensive error handling
- ✅ Email attempt logging to Firestore
- ✅ Branded, responsive templates
- ✅ WCAG AA accessible design
- ✅ PDF attachment support (receipts)

## Email Templates

### 1. Authentication & Account

#### Password Reset (`emails/password-reset.tsx`)
**Function**: `sendPasswordReset(email, resetLink, userName?)`

**Triggered When**: User requests password reset

**Contains**:
- Reset link with expiration notice
- Security reminder
- Contact information

**Usage**:
```typescript
import { sendPasswordReset } from '@/services/email';

await sendPasswordReset(
  'customer@example.com',
  'https://app.lorenzo.com/reset?token=xyz',
  'John Doe'
);
```

#### Employee Invitation (`emails/employee-invitation.tsx`)
**Function**: `sendEmployeeInvitation(data)`

**Triggered When**: Admin creates new employee account

**Contains**:
- Role and branch assignment
- Temporary password (if applicable)
- Login instructions
- Getting started checklist

**Data Interface**:
```typescript
interface EmployeeInvitationData {
  employeeName: string;
  employeeEmail: string;
  role: string;
  branchName: string;
  temporaryPassword?: string;
  loginUrl: string;
  invitedBy: string;
}
```

**Usage**:
```typescript
import { sendEmployeeInvitation } from '@/services/email';

await sendEmployeeInvitation({
  employeeName: 'Jane Smith',
  employeeEmail: 'jane@lorenzo.com',
  role: 'front_desk',
  branchName: 'Kilimani Branch',
  temporaryPassword: 'Temp123!',
  loginUrl: 'https://app.lorenzo.com/login',
  invitedBy: 'Admin Manager',
});
```

### 2. Customer Lifecycle

#### Order Confirmation (`emails/order-confirmation.tsx`)
**Function**: `sendOrderConfirmation(data)`

**Triggered When**: New order is created at POS

**Contains**:
- Order number and date
- Item count and total amount
- Estimated completion date
- Branch information
- Track order button

**Data Interface**:
```typescript
interface OrderConfirmationData {
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

**Usage**:
```typescript
import { sendOrderConfirmation } from '@/services/email';

await sendOrderConfirmation({
  orderId: 'ORD-KIL-20250122-0001',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  garmentCount: 5,
  totalAmount: 2500,
  estimatedCompletion: new Date('2025-01-25'),
  branchName: 'Kilimani Branch',
  branchPhone: '+254 725 462 859',
  orderDate: new Date(),
  trackingUrl: 'https://portal.lorenzo.com/orders/ORD-KIL-20250122-0001',
});
```

#### Order Status Update (`emails/order-status-update.tsx`)
**Function**: `sendOrderStatusUpdate(data)`

**Triggered When**: Order status changes (washing, drying, ironing, ready, out_for_delivery, delivered)

**Contains**:
- Status badge with color coding
- Status-specific message
- Progress timeline
- Estimated completion (if applicable)
- Track order button

**Data Interface**:
```typescript
interface OrderStatusUpdateData {
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

**Status Color Mapping**:
- **Ready**: Green (#10B981)
- **Out for Delivery**: Blue (#3B82F6)
- **Delivered/Collected**: Green (#10B981)
- **Processing (washing, drying, ironing, etc.)**: Amber (#F59E0B)

**Usage**:
```typescript
import { sendOrderStatusUpdate } from '@/services/email';

await sendOrderStatusUpdate({
  orderId: 'ORD-KIL-20250122-0001',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  oldStatus: 'washing',
  newStatus: 'ready',
  statusMessage: 'Great news! Your order is ready for pickup at our Kilimani branch.',
  trackingUrl: 'https://portal.lorenzo.com/orders/ORD-KIL-20250122-0001',
  estimatedCompletion: new Date('2025-01-25'),
});
```

#### Payment Receipt (`emails/receipt.tsx`)
**Function**: `sendReceipt(data, pdfBuffer?)`

**Triggered When**: Payment is completed

**Contains**:
- Transaction details
- Payment method
- Amount paid
- Receipt download link
- Optional PDF attachment

**Data Interface**:
```typescript
interface ReceiptData {
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

**Usage**:
```typescript
import { sendReceipt } from '@/services/email';

// With PDF attachment
const receiptPdf = generateReceiptPdf(order); // Returns Buffer
await sendReceipt({
  orderId: 'ORD-KIL-20250122-0001',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  totalAmount: 2500,
  paidAmount: 2500,
  paymentMethod: 'M-Pesa',
  transactionDate: new Date(),
  receiptUrl: 'https://app.lorenzo.com/receipts/ORD-KIL-20250122-0001.pdf',
}, receiptPdf);
```

#### Payment Reminder (`emails/payment-reminder.tsx`)
**Function**: `sendPaymentReminder(data)`

**Triggered When**: Order is ready but payment is pending/partial

**Contains**:
- Amount due (highlighted)
- Payment breakdown
- Payment methods (M-Pesa, Card, In-Store, WhatsApp)
- Payment instructions
- Due date (if applicable)

**Data Interface**:
```typescript
interface PaymentReminderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paidAmount: number;
  amountDue: number;
  orderStatus: string;
  branchName: string;
  branchPhone: string;
  paymentUrl?: string;
  dueDate?: Date;
}
```

**Usage**:
```typescript
import { sendPaymentReminder } from '@/services/email';

await sendPaymentReminder({
  orderId: 'ORD-KIL-20250122-0001',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  totalAmount: 2500,
  paidAmount: 1000,
  amountDue: 1500,
  orderStatus: 'ready',
  branchName: 'Kilimani Branch',
  branchPhone: '+254 725 462 859',
  paymentUrl: 'https://portal.lorenzo.com/orders/ORD-KIL-20250122-0001',
  dueDate: new Date('2025-01-30'),
});
```

#### Pickup Request Confirmation (`emails/pickup-request.tsx`)
**Function**: `sendPickupRequestConfirmation(data)`

**Triggered When**: Customer requests garment pickup

**Contains**:
- Request ID
- Pickup address and date
- Contact information
- 4-step process explanation
- Important reminders
- Contact options (phone, WhatsApp)

**Data Interface**:
```typescript
interface PickupRequestData {
  customerName: string;
  customerEmail: string;
  pickupAddress: string;
  pickupDate?: Date;
  pickupTimeSlot?: string;
  contactPhone: string;
  specialInstructions?: string;
  requestId: string;
  branchName: string;
  branchPhone: string;
  trackingUrl?: string;
}
```

**Usage**:
```typescript
import { sendPickupRequestConfirmation } from '@/services/email';

await sendPickupRequestConfirmation({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  pickupAddress: '123 Kimathi Street, Kilimani, Nairobi',
  pickupDate: new Date('2025-01-23'),
  pickupTimeSlot: '10:00 AM - 12:00 PM',
  contactPhone: '+254 712 345 678',
  specialInstructions: 'Please call 5 minutes before arrival',
  requestId: 'PKP-20250122-0001',
  branchName: 'Kilimani Branch',
  branchPhone: '+254 725 462 859',
  trackingUrl: 'https://portal.lorenzo.com/pickup-requests/PKP-20250122-0001',
});
```

## Integration with Backend Triggers

### Cloud Functions Setup

**File**: `functions/src/triggers/notifications.ts`

```typescript
import { sendOrderConfirmation, sendOrderStatusUpdate, sendReceipt, sendPaymentReminder } from '@/services/email';
import { sendWhatsAppMessage } from '@/utils/whatsapp';

/**
 * Trigger: Order Created
 */
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const customer = await getCustomer(order.customerId);

    // Send WhatsApp notification
    await sendWhatsAppMessage({
      template: 'order_received',
      to: customer.phone,
      params: [customer.name, order.orderId, /* ... */],
    });

    // Send email confirmation
    if (customer.email) {
      await sendOrderConfirmation({
        orderId: order.orderId,
        customerName: customer.name,
        customerEmail: customer.email,
        garmentCount: order.garments.length,
        totalAmount: order.totalAmount,
        estimatedCompletion: order.estimatedCompletion.toDate(),
        branchName: branch.name,
        branchPhone: branch.contactPhone,
        orderDate: order.createdAt.toDate(),
        trackingUrl: `https://portal.lorenzo.com/orders/${order.orderId}`,
      });
    }
  });

/**
 * Trigger: Order Status Updated
 */
export const onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === after.status) return;

    const customer = await getCustomer(after.customerId);

    // Send WhatsApp for key status changes
    if (['ready', 'out_for_delivery', 'delivered'].includes(after.status)) {
      await sendWhatsAppMessage({
        template: `order_${after.status}`,
        to: customer.phone,
        params: [customer.name, after.orderId],
      });
    }

    // Send email update
    if (customer.email) {
      await sendOrderStatusUpdate({
        orderId: after.orderId,
        customerName: customer.name,
        customerEmail: customer.email,
        oldStatus: before.status,
        newStatus: after.status,
        statusMessage: getStatusMessage(after.status),
        trackingUrl: `https://portal.lorenzo.com/orders/${after.orderId}`,
        estimatedCompletion: after.estimatedCompletion?.toDate(),
      });
    }

    // Send payment reminder if order is ready and payment pending
    if (after.status === 'ready' && after.paymentStatus !== 'paid') {
      if (customer.email) {
        await sendPaymentReminder({
          orderId: after.orderId,
          customerName: customer.name,
          customerEmail: customer.email,
          totalAmount: after.totalAmount,
          paidAmount: after.paidAmount || 0,
          amountDue: after.totalAmount - (after.paidAmount || 0),
          orderStatus: after.status,
          branchName: branch.name,
          branchPhone: branch.contactPhone,
          paymentUrl: `https://portal.lorenzo.com/orders/${after.orderId}`,
        });
      }
    }
  });

/**
 * Trigger: Payment Completed
 */
export const onPaymentCompleted = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const transaction = snap.data();

    if (transaction.status !== 'completed') return;

    const order = await getOrder(transaction.orderId);
    const customer = await getCustomer(order.customerId);

    // Send receipt email
    if (customer.email) {
      const receiptPdf = await generateReceiptPdf(order, transaction);

      await sendReceipt({
        orderId: order.orderId,
        customerName: customer.name,
        customerEmail: customer.email,
        totalAmount: order.totalAmount,
        paidAmount: transaction.amount,
        paymentMethod: transaction.method,
        transactionDate: transaction.timestamp.toDate(),
        receiptUrl: `https://app.lorenzo.com/receipts/${order.orderId}.pdf`,
      }, receiptPdf);
    }
  });
```

## Email Logs

All email attempts are logged to Firestore for tracking and debugging.

**Collection**: `email_logs`

**Document Schema**:
```typescript
{
  type: 'order_confirmation' | 'order_status_update' | 'receipt' |
        'password_reset' | 'employee_invitation' | 'payment_reminder' |
        'pickup_request' | 'custom';
  recipient: string;
  success: boolean;
  emailId?: string;           // Resend email ID
  error?: string;
  retryCount: number;
  metadata: {
    orderId?: string;
    amount?: number;
    role?: string;
    // ... other contextual data
  };
  timestamp: Date;
}
```

## Testing

### Test Email Connection

```typescript
import { testEmailConnection } from '@/services/email';

const result = await testEmailConnection('test@example.com');
console.log(result); // { success: true, id: 'resend-email-id' }
```

### Manual Testing Checklist

- [ ] **Password Reset**: Verify link works, expires properly
- [ ] **Employee Invitation**: Verify temp password works, login flow succeeds
- [ ] **Order Confirmation**: Verify all order details correct, tracking link works
- [ ] **Order Status Update**: Test each status (washing, ready, delivered), verify timeline accuracy
- [ ] **Payment Receipt**: Verify PDF attachment works, amounts correct
- [ ] **Payment Reminder**: Verify amount due calculation, payment methods shown
- [ ] **Pickup Request**: Verify all details correct, contact options work

### Test via API Endpoint

**File**: `app/api/test/email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation } from '@/services/email';

export async function POST(request: NextRequest) {
  const { testEmail } = await request.json();

  const result = await sendOrderConfirmation({
    orderId: 'TEST-001',
    customerName: 'Test Customer',
    customerEmail: testEmail,
    garmentCount: 3,
    totalAmount: 1500,
    estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    branchName: 'Kilimani Branch',
    branchPhone: '+254 725 462 859',
    orderDate: new Date(),
    trackingUrl: 'https://portal.lorenzo.com/orders/TEST-001',
  });

  return NextResponse.json(result);
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Resend API
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL="Lorenzo Dry Cleaners <noreply@lorenzo-dry-cleaners.com>"
RESEND_REPLY_TO_EMAIL="support@lorenzo-dry-cleaners.com"
```

### Domain Setup (Resend Dashboard)

1. Add domain: `lorenzo-dry-cleaners.com`
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain
4. Set as default sending domain

## Design Standards

All email templates follow these design principles:

- **Black & White Theme**: Primary black (#000000), white (#FFFFFF), grays for secondary
- **Accent Colors**: Green (success), Amber (warning), Red (error), Blue (info)
- **Typography**: System fonts, 16px base size
- **Responsive**: Mobile-first design
- **Accessible**: WCAG AA contrast ratios, semantic HTML
- **Consistent Layout**: Header (black), content (white), footer (gray border)

## Ship-Readiness Checklist

- [x] All email templates created
- [x] Email service functions implemented
- [x] Error handling and retry logic in place
- [x] Email logging to Firestore
- [x] Backend triggers configured (see NOTIFICATIONS_AND_LIVE_TRACKING_PLAN.md)
- [ ] Environment variables set in production
- [ ] Domain verified in Resend dashboard
- [ ] Test emails sent successfully
- [ ] Email logs verified in Firestore
- [ ] WhatsApp + Email coordination tested

## Troubleshooting

### Email Not Sending

1. Check Resend API key is set: `isResendConfigured()`
2. Check domain is verified in Resend dashboard
3. Check email logs in Firestore for error messages
4. Verify recipient email is valid
5. Check Resend dashboard for delivery status

### Email Goes to Spam

1. Verify SPF, DKIM, DMARC records
2. Check sender domain reputation
3. Ensure "from" address matches verified domain
4. Avoid spam trigger words in subject/body
5. Test with email testing tools (mail-tester.com)

### Template Rendering Issues

1. Check React Email component syntax
2. Verify all props are passed correctly
3. Test template in isolation
4. Check for console errors during render
5. Use Resend preview feature

## Support

For email-related issues:
- **Technical Issues**: Check Firestore `email_logs` collection
- **Resend Dashboard**: https://resend.com/emails
- **Documentation**: https://resend.com/docs

---

**Last Updated**: January 22, 2025
**Status**: Ship-Ready ✅
