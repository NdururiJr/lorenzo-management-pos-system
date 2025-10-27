# 👨‍💻 Jerry's Task Breakdown - Milestone 3 Operations

**Developer:** Jerry Nduriri
**Role:** POS & Product Manager, Operations Specialist
**Branch:** `feature/milestone-3-operations`
**Timeline:** 4 Weeks (November 4-29, 2025)
**Focus:** POS Page, Receipt PDF, Delivery Management, Inventory, Employee Tracking, WhatsApp, AI Features

---

## 🚨 CRITICAL: Priority P0 Task

**IMPORTANT:** The POS page (`/app/(dashboard)/pos/page.tsx`) does NOT exist and returns a 404 error. This is a **blocking issue** that must be completed FIRST before any other tasks. See Milestone 0.5 below.

---

## 📊 Quick Overview

| Milestone | Focus Area | Duration | Status |
|-----------|------------|----------|--------|
| 0 | Setup & Prerequisites | 4-6 hours | ⏳ Not Started |
| **0.5** | **Complete POS Page (P0)** | **4-6 hours** | **⏳ Not Started** |
| 2 | Receipt PDF System | 10-12 hours | ⏳ Not Started |
| **2.5** | **Delivery & Pickup System** | **20-25 hours** | **⏳ Not Started** |
| 3 | Google Maps Setup | 6-8 hours | ⏳ Not Started |
| 4 | Delivery Batch Management | 6-8 hours | ⏳ Not Started |
| 5 | Route Optimization | 12-14 hours | ⏳ Not Started |
| 6 | Driver Dashboard | 8-10 hours | ⏳ Not Started |
| 7 | Inventory Management | 12-14 hours | ⏳ Not Started |
| 8 | Inventory Alerts | 4 hours | ⏳ Not Started |
| 9 | Employee Management | 12-14 hours | ⏳ Not Started |
| 10 | Testing & QA | 8-10 hours | ⏳ Not Started |
| 11 | Deployment | 2-4 hours | ⏳ Not Started |
| 12 | WhatsApp Integration (Wati.io) | 8-10 hours | ⏳ Not Started |
| 13 | AI Features (OpenAI) | 10-12 hours | ⏳ Not Started |
| 14 | Final Integration & Testing | 4-6 hours | ⏳ Not Started |

**Total Estimated Time:** 126-159 hours (~5 weeks)

---

## 🎯 Success Criteria

### Receipt PDF System
- ✅ 100% of paid orders have downloadable receipts
- ✅ Email delivery success rate > 98%
- ✅ PDF generation time < 2 seconds
- ✅ **Receipt modal is draggable and resizable for better UX** **NEW**

### Delivery & Pickup System
- ✅ Staff can select pickup/delivery independently
- ✅ Pickups page shows only pickup orders
- ✅ Deliveries page shows only delivery orders
- ✅ WhatsApp location extraction accuracy > 95%
- ✅ Location processing time < 3 seconds
- ✅ Addresses auto-save to customer profiles

### Delivery Optimization
- ✅ 30% reduction in average delivery time
- ✅ Route optimization accuracy > 95%
- ✅ Routes calculated in < 10 seconds for 20 stops

### Inventory Management
- ✅ Zero stock-outs for critical items
- ✅ Low stock alerts sent 100% of the time
- ✅ Dashboard loads in < 1 second

### Employee Tracking
- ✅ 100% attendance capture
- ✅ Productivity metrics accurate within 5%
- ✅ Real-time clock-in/out updates

---

## 📋 Milestone 0: Setup & Prerequisites (4-6 hours)

**Week:** Pre-implementation
**Goal:** Set up all required accounts, tools, and configurations

### Environment Setup

- [ ] **Clone and verify repository**
  ```bash
  cd c:\Users\HomePC\Desktop\lorenzo-workspace\lorenzo-dry-cleaners
  git checkout -b feature/milestone-3-operations
  npm install
  npm run dev
  ```
  - Verify server starts on http://localhost:3000
  - Verify no console errors
  - Verify POS page works at `/pos`

- [ ] **Install required dependencies**
  ```bash
  npm install jspdf @types/jspdf date-fns recharts
  npm install @react-google-maps/api @googlemaps/google-maps-services-js
  npm install @types/google.maps --save-dev
  ```
  - Verify all packages install successfully
  - Check `package.json` for version updates

### Google Cloud Platform Setup ⭐ CRITICAL

- [ ] **Create/access Google Cloud account**
  - Go to https://console.cloud.google.com
  - Use existing Firebase Gmail account
  - Accept terms and conditions

- [ ] **Enable billing**
  - Navigate to **Billing** → **Link a billing account**
  - Add payment method (credit card)
  - Verify billing is active
  - Set up budget alerts ($50/month recommended)

- [ ] **Enable required APIs** (5 APIs)
  - Navigate to **APIs & Services** → **Library**
  - Search and enable:
    - [ ] Maps JavaScript API
    - [ ] Directions API
    - [ ] Distance Matrix API
    - [ ] Geocoding API
    - [ ] Places API (optional)
  - Verify all 5 APIs show as "Enabled" in dashboard

- [ ] **Create and configure API key**
  - Navigate to **APIs & Services** → **Credentials**
  - Click **Create Credentials** → **API Key**
  - Copy the API key immediately
  - Click **Restrict Key**
  - Set **Application restrictions**:
    - Select "HTTP referrers (web sites)"
    - Add referrers:
      - `http://localhost:3000/*`
      - `http://localhost:3001/*`
      - `https://your-production-domain.com/*`
  - Set **API restrictions**:
    - Select "Restrict key"
    - Select the 5 enabled APIs
  - Save restrictions

- [ ] **Add API key to environment**
  - Open `.env.local`
  - Add line:
    ```bash
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your_key_here
    ```
  - Restart dev server
  - Verify env variable loads: `console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)`

- [ ] **Test API key**
  - Create test file at `app/test-maps/page.tsx`
  - Add simple map component
  - Navigate to `/test-maps`
  - Verify map displays without errors
  - Check Google Cloud Console → APIs → Dashboard for usage

### Firebase Setup

- [ ] **Verify Firebase configuration**
  - Check `.env.local` has all Firebase keys
  - Test Firebase connection: create a test document in Firestore
  - Verify Firestore rules allow authenticated writes

- [ ] **Set up Cloud Functions directory**
  ```bash
  cd functions
  npm install firebase-functions firebase-admin
  cd ..
  ```
  - Verify `functions` directory exists
  - Check `functions/package.json` has correct dependencies

### Firestore Schema Deployment

- [ ] **Create firestore.indexes.json**
  - Create file in project root
  - Add indexes for:
    - [ ] `deliveries` collection
    - [ ] `inventory` collection
    - [ ] `attendance` collection
    - [ ] `inventory_logs` collection
  - Content:
    ```json
    {
      "indexes": [
        {
          "collectionGroup": "deliveries",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "driverId", "order": "ASCENDING" },
            { "fieldPath": "status", "order": "ASCENDING" },
            { "fieldPath": "createdAt", "order": "DESCENDING" }
          ]
        },
        {
          "collectionGroup": "inventory",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "branchId", "order": "ASCENDING" },
            { "fieldPath": "category", "order": "ASCENDING" },
            { "fieldPath": "quantity", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "attendance",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "employeeId", "order": "ASCENDING" },
            { "fieldPath": "date", "order": "DESCENDING" }
          ]
        },
        {
          "collectionGroup": "inventory_logs",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "itemId", "order": "ASCENDING" },
            { "fieldPath": "timestamp", "order": "DESCENDING" }
          ]
        }
      ]
    }
    ```

- [ ] **Update firestore.rules**
  - Open `firestore.rules`
  - Add rules for new collections:
    ```javascript
    // Deliveries collection
    match /deliveries/{deliveryId} {
      allow read: if isAuthenticated();
      allow create: if isManager();
      allow update: if isManager() ||
                      (isDriver() && resource.data.driverId == request.auth.uid);
    }

    // Inventory collection
    match /inventory/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isManager() || isFrontDesk();
    }

    // Inventory logs collection
    match /inventory_logs/{logId} {
      allow read: if isAuthenticated();
      allow create: if isManager() || isFrontDesk();
      allow update, delete: if false; // Logs are immutable
    }

    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isManager() ||
                      resource.data.employeeId == request.auth.uid;
    }
    ```

- [ ] **Deploy indexes and rules**
  ```bash
  firebase deploy --only firestore:indexes
  firebase deploy --only firestore:rules
  ```
  - Verify deployment succeeds
  - Check Firebase Console → Firestore → Indexes
  - Verify all 4 indexes are building/ready

### Resend Email Verification

- [ ] **Verify Resend configuration**
  - Check `.env.local` has `RESEND_API_KEY`
  - Log in to Resend dashboard
  - Verify domain is configured
  - Check sending limits (3,000/month free)

- [ ] **Test email sending**
  - Create test API route at `app/api/test-email/route.ts`
  - Send test email to your address
  - Verify email received
  - Check Resend dashboard for delivery status

### TypeScript Type Definitions

- [ ] **Create type definitions**
  - Create `types/deliveries.ts`:
    ```typescript
    export interface Delivery {
      deliveryId: string;
      driverId: string;
      orders: string[];
      route: DeliveryRoute;
      status: 'pending' | 'in_progress' | 'completed';
      startTime?: Timestamp;
      endTime?: Timestamp;
      createdAt: Timestamp;
      createdBy: string;
    }

    export interface DeliveryRoute {
      optimized: boolean;
      stops: DeliveryStop[];
      distance: number;
      estimatedDuration: number;
      polyline?: string;
    }

    export interface DeliveryStop {
      orderId: string;
      address: string;
      coordinates: { lat: number; lng: number };
      sequence: number;
      status: 'pending' | 'completed' | 'failed';
      timestamp?: Timestamp;
      notes?: string;
    }
    ```

  - Create `types/inventory.ts`:
    ```typescript
    export interface InventoryItem {
      itemId: string;
      branchId: string;
      name: string;
      category: string;
      unit: string;
      quantity: number;
      reorderLevel: number;
      costPerUnit?: number;
      supplier?: string;
      lastRestocked: Timestamp;
      expiryDate?: Timestamp;
      createdAt: Timestamp;
      updatedAt: Timestamp;
    }

    export interface InventoryLog {
      logId: string;
      itemId: string;
      type: 'restock' | 'usage';
      oldQuantity: number;
      newQuantity: number;
      amount: number;
      reason?: string;
      userId: string;
      timestamp: Timestamp;
    }
    ```

  - Create `types/employees.ts`:
    ```typescript
    export interface Attendance {
      attendanceId: string;
      employeeId: string;
      date: string; // YYYY-MM-DD
      clockIn: Timestamp;
      clockOut?: Timestamp;
      hoursWorked?: number;
      breakTime?: number;
      notes?: string;
    }
    ```

### Testing & Verification

- [ ] **Verify all setup complete**
  - [ ] Dev server runs without errors
  - [ ] All npm packages installed
  - [ ] Google Maps API key works
  - [ ] Firebase connection active
  - [ ] Firestore indexes deployed
  - [ ] Security rules updated
  - [ ] Email sending works
  - [ ] Type definitions created

**Acceptance Criteria:**
- ✅ All dependencies installed successfully
- ✅ Google Maps API key configured and tested
- ✅ Firestore indexes deployed
- ✅ Security rules updated
- ✅ Email sending verified
- ✅ No console errors in dev environment

---

## 📋 Milestone 0.5: Complete POS Page (4-6 hours) ⚠️ PRIORITY P0

**Week:** IMMEDIATE - Must complete before other milestones
**Goal:** Create the missing POS page by assembling existing components
**Priority:** P0 - BLOCKING ISSUE

### 🚨 Critical Context

**DISCOVERED ISSUE:** The POS page at `/app/(dashboard)/pos/page.tsx` does NOT exist and returns a 404 error. All POS components are built and working, but they have never been assembled into a working page. This is a **blocking P0 priority** task that must be completed before any other work.

**Why This is Critical:**
- The POS system is the core revenue-generating feature
- Without it, staff cannot create orders or process payments
- All POS components exist but are not being used
- This was incorrectly assumed to be complete in Milestone 2

### POS Page Creation

- [ ] **Create the POS page file**
  - Create file: `app/(dashboard)/pos/page.tsx`
  - Mark as client component: `'use client';`
  - Import all required POS components
  - Set up page structure and layout

- [ ] **Import and assemble existing components**
  - Import from `components/features/pos/`:
    ```typescript
    import { CustomerSearch } from '@/components/features/pos/CustomerSearch';
    import { CreateCustomerModal } from '@/components/features/pos/CreateCustomerModal';
    import { CustomerCard } from '@/components/features/pos/CustomerCard';
    import { GarmentEntryForm } from '@/components/features/pos/GarmentEntryForm';
    import { GarmentCard } from '@/components/features/pos/GarmentCard';
    import { OrderSummary } from '@/components/features/pos/OrderSummary';
    import { PaymentModal } from '@/components/features/pos/PaymentModal';
    import { PaymentStatus } from '@/components/features/pos/PaymentStatus';
    import { ReceiptPreview } from '@/components/features/pos/ReceiptPreview';
    ```
  - Verify all components exist and are exported correctly
  - Check component props and interfaces

### State Management Implementation

- [ ] **Set up order creation state**
  ```typescript
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date>();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  ```

- [ ] **Implement customer selection workflow**
  - Handle customer search results
  - Handle customer selection from search
  - Handle new customer creation
  - Clear customer selection
  - Display selected customer info with CustomerCard

- [ ] **Implement garment entry workflow**
  - Handle garment form submission
  - Add garment to array
  - Handle garment removal
  - Handle garment editing
  - Validate garment data
  - Display garment list with GarmentCard components

### Wire Up Database Functions

- [ ] **Connect customer operations**
  - Import customer CRUD functions from `@/lib/db/customers`
  - Wire up customer search:
    ```typescript
    import { getCustomerByPhone, createCustomer } from '@/lib/db/customers';
    ```
  - Handle customer creation in CreateCustomerModal
  - Handle customer selection state updates

- [ ] **Connect pricing calculations**
  - Import pricing functions from `@/lib/db/pricing`
  - Calculate garment prices:
    ```typescript
    import { calculateGarmentPrice, calculateOrderTotal } from '@/lib/db/pricing';
    ```
  - Update totals when garments change
  - Apply discounts if applicable
  - Calculate tax if applicable

- [ ] **Connect order creation**
  - Import order functions from `@/lib/db/orders`
  - Implement order creation:
    ```typescript
    import { createOrder, generateOrderId } from '@/lib/db/orders';

    const handleCreateOrder = async () => {
      const orderId = generateOrderId(branchId);
      const orderData = {
        orderId,
        customerId: selectedCustomer!.customerId,
        branchId: user.branchId,
        garments,
        totalAmount,
        status: 'received',
        estimatedCompletion,
        notes: orderNotes,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      };

      const newOrder = await createOrder(orderData);
      setCurrentOrder(newOrder);
      setIsPaymentModalOpen(true);
    };
    ```

- [ ] **Connect transaction handling**
  - Import transaction functions from `@/lib/db/transactions`
  - Handle payment processing:
    ```typescript
    import { createTransaction, processPayment } from '@/lib/db/transactions';
    ```
  - Handle cash payments
  - Handle M-Pesa payments (Pesapal)
  - Handle card payments (Pesapal)
  - Handle partial payments
  - Update order payment status

- [ ] **Connect receipt generation**
  - Import receipt functions from `@/lib/receipts`
  - Generate receipt after successful payment
  - Trigger receipt download
  - Trigger receipt email sending

### Complete Order Creation Workflow

- [ ] **Step 1: Search/Create Customer**
  - Display CustomerSearch component
  - Handle search by phone number
  - Display search results
  - Allow customer selection
  - Show CreateCustomerModal button
  - Handle new customer creation
  - Display selected customer with CustomerCard

- [ ] **Step 2: Add Garments**
  - Display GarmentEntryForm
  - Collect garment details:
    - Garment type (dropdown)
    - Color
    - Brand/Label
    - Services (checkboxes: wash, dry clean, iron, starch, express)
    - Special instructions
    - Photo upload (optional)
  - Validate garment data
  - Add to garments array
  - Display GarmentCard for each garment
  - Allow garment removal/editing
  - Require at least 1 garment

- [ ] **Step 3: Calculate Pricing**
  - Display OrderSummary component
  - Show itemized garment list with prices
  - Calculate subtotal
  - Apply discounts (if any)
  - Calculate tax (if applicable)
  - Show total amount
  - Allow order notes input
  - Set estimated completion date

- [ ] **Step 4: Process Payment**
  - Open PaymentModal on "Complete Order" button
  - Show payment options:
    - Cash
    - M-Pesa (Pesapal integration)
    - Card (Pesapal integration)
    - Credit Account
  - Handle payment method selection
  - Process payment
  - Show PaymentStatus component with results
  - Handle payment success
  - Handle payment failure with retry

- [ ] **Step 5: Generate Receipt**
  - Display ReceiptPreview component
  - Show receipt with all order details
  - Provide "Download PDF" button
  - Provide "Email Receipt" button
  - Provide "Print" button
  - Allow "Create Another Order" to reset form
  - Redirect to order details or pipeline

### Validation & Error Handling

- [ ] **Form validation**
  - Validate customer selection (required)
  - Validate at least 1 garment added
  - Validate garment details (type, services)
  - Validate estimated completion date (future date)
  - Show validation errors clearly
  - Disable "Complete Order" if invalid

- [ ] **Error handling**
  - Handle customer search errors
  - Handle customer creation errors
  - Handle pricing calculation errors
  - Handle order creation errors
  - Handle payment processing errors
  - Handle receipt generation errors
  - Show user-friendly error messages with toast
  - Log errors to console for debugging

- [ ] **Edge cases**
  - Handle empty search results
  - Handle duplicate phone numbers
  - Handle missing pricing data
  - Handle network errors
  - Handle Firestore errors
  - Handle payment timeout
  - Allow order save as draft (optional)

### UI/UX Polish

- [ ] **Loading states**
  - Show spinner during customer search
  - Show spinner during order creation
  - Show spinner during payment processing
  - Disable buttons during loading
  - Show "Processing..." messages

- [ ] **Success feedback**
  - Show success toast on customer creation
  - Show success toast on order creation
  - Show success animation on payment success
  - Show confetti on completed order (optional)
  - Clear form on success

- [ ] **Mobile responsiveness**
  - Test on mobile screens (320px+)
  - Stack components vertically on small screens
  - Ensure touch targets are large enough (44px min)
  - Test landscape orientation
  - Ensure all buttons are accessible
  - Test on actual mobile devices

- [ ] **Accessibility**
  - Add proper ARIA labels
  - Ensure keyboard navigation works
  - Add focus indicators
  - Test with screen reader
  - Ensure color contrast is sufficient

### Testing

- [ ] **Test complete flow end-to-end**
  - [ ] Search for existing customer
  - [ ] Create new customer
  - [ ] Add 1 garment
  - [ ] Add 5 garments
  - [ ] Add 10+ garments
  - [ ] Remove garments
  - [ ] Edit garments
  - [ ] Calculate pricing correctly
  - [ ] Process cash payment
  - [ ] Process M-Pesa payment
  - [ ] Process card payment
  - [ ] Process partial payment
  - [ ] Generate receipt PDF
  - [ ] Email receipt
  - [ ] Print receipt
  - [ ] Create another order

- [ ] **Test error scenarios**
  - [ ] Customer not found
  - [ ] Customer creation fails
  - [ ] No garments added
  - [ ] Pricing calculation fails
  - [ ] Order creation fails
  - [ ] Payment fails
  - [ ] Receipt generation fails
  - [ ] Email sending fails
  - [ ] Network disconnects mid-flow

- [ ] **Test on different browsers**
  - [ ] Chrome desktop
  - [ ] Firefox desktop
  - [ ] Safari desktop
  - [ ] Edge desktop
  - [ ] Chrome mobile (Android)
  - [ ] Safari mobile (iOS)

- [ ] **Performance testing**
  - [ ] Page loads in < 2 seconds
  - [ ] No unnecessary re-renders
  - [ ] Smooth animations
  - [ ] No memory leaks
  - [ ] Fast form submissions

**Acceptance Criteria:**
- ✅ POS page exists and loads without errors
- ✅ Can search for existing customers
- ✅ Can create new customers
- ✅ Can add/remove/edit garments
- ✅ Pricing calculates correctly
- ✅ Can process cash payments
- ✅ Can process M-Pesa payments
- ✅ Can process card payments
- ✅ Can process partial payments
- ✅ Order saves to Firestore
- ✅ Receipt generates as PDF
- ✅ Receipt can be emailed
- ✅ Receipt can be printed
- ✅ Complete workflow takes < 3 minutes
- ✅ Works on mobile devices
- ✅ Zero console errors
- ✅ All validations work
- ✅ Error messages are clear

**🚨 DO NOT PROCEED TO OTHER MILESTONES UNTIL THIS IS COMPLETE! 🚨**

---

## 📋 Milestone 2: Receipt PDF System (10-12 hours)

**Week:** Week 2, Days 1-2
**Goal:** Implement PDF generation for receipts with download and email functionality

### Core PDF Generation

- [ ] **Create PDF generator utility**
  - Create file: `lib/receipts/pdf-generator.ts`
  - Import jsPDF:
    ```typescript
    import jsPDF from 'jspdf';
    import type { Order } from '@/lib/db/schema';
    ```
  - Create `generateReceiptPDF` function
  - Add function signature:
    ```typescript
    export function generateReceiptPDF(order: Order): jsPDF {
      const doc = new jsPDF();
      // Implementation here
      return doc;
    }
    ```

- [ ] **Design receipt template**
  - Add company header:
    - Company name: "Lorenzo Dry Cleaners"
    - Address: "Kilimani, Nairobi, Kenya"
    - Phone: "+254 XXX XXX XXX"
    - Font size: 20pt for name, 10pt for details
    - Center alignment
  - Add receipt details:
    - Order ID
    - Date (formatted)
    - Customer name and phone
    - Branch ID
  - Create garment list table:
    - Columns: #, Item, Color, Services, Price
    - Loop through `order.garments`
    - Format prices with KES prefix
  - Add totals section:
    - Subtotal
    - Tax (if applicable)
    - Total amount
    - Amount paid
    - Balance (if partial payment)
  - Add footer:
    - "Thank you for choosing Lorenzo Dry Cleaners!"
    - Estimated completion date
    - Terms and conditions (optional)

- [ ] **Add company logo**
  - Place logo file in `public/images/lorenzo-logo.png`
  - Load image in PDF:
    ```typescript
    const logoImg = '/images/lorenzo-logo.png';
    doc.addImage(logoImg, 'PNG', 15, 10, 40, 20);
    ```
  - Test logo displays correctly
  - Handle missing logo gracefully

- [ ] **Implement receipt template helper**
  - Create file: `lib/receipts/receipt-template.ts`
  - Create helper functions:
    - `formatDate(timestamp: Timestamp): string`
    - `formatPrice(amount: number): string`
    - `formatPhoneNumber(phone: string): string`
  - Export template configuration:
    ```typescript
    export const RECEIPT_CONFIG = {
      pageWidth: 210, // A4 width in mm
      pageHeight: 297, // A4 height in mm
      margins: { top: 20, left: 20, right: 20, bottom: 20 },
      fonts: {
        header: 20,
        subheader: 14,
        body: 10,
        footer: 8,
      },
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#333333',
      },
    };
    ```

### Download Functionality

- [ ] **Implement download function**
  - Add to `lib/receipts/pdf-generator.ts`:
    ```typescript
    export function downloadReceipt(order: Order): void {
      const pdf = generateReceiptPDF(order);
      const filename = `receipt-${order.orderId}.pdf`;
      pdf.save(filename);
    }
    ```
  - Test download on desktop browsers (Chrome, Firefox, Safari)
  - Test download on mobile browsers (Chrome Android, Safari iOS)

- [ ] **Implement PDF blob generation** (for email attachments)
  - Add function:
    ```typescript
    export function generateReceiptBlob(order: Order): Blob {
      const pdf = generateReceiptPDF(order);
      return pdf.output('blob');
    }
    ```

### Email Integration

- [ ] **Create email service**
  - Create file: `lib/email/receipt-mailer.ts`
  - Import Resend:
    ```typescript
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    ```
  - Create `sendReceiptEmail` function:
    ```typescript
    export async function sendReceiptEmail(
      customerEmail: string,
      customerName: string,
      order: Order
    ): Promise<void> {
      const pdfBlob = generateReceiptBlob(order);
      const pdfBuffer = await pdfBlob.arrayBuffer();

      await resend.emails.send({
        from: 'receipts@lorenzo-dry-cleaners.com',
        to: customerEmail,
        subject: `Receipt for Order ${order.orderId}`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Dear ${customerName},</p>
          <p>Please find attached your receipt for order ${order.orderId}.</p>
          <p>Your order total: KES ${order.totalAmount.toLocaleString()}</p>
          <p>Estimated completion: ${formatDate(order.estimatedCompletion)}</p>
          <p>Thank you for choosing Lorenzo Dry Cleaners!</p>
        `,
        attachments: [{
          filename: `receipt-${order.orderId}.pdf`,
          content: Buffer.from(pdfBuffer),
        }],
      });
    }
    ```

- [ ] **Test email sending**
  - Send test email to 5+ different addresses
  - Verify PDF attachment opens correctly
  - Check spam folders
  - Verify delivery in Resend dashboard

### UI Integration

- [x] **Update ReceiptPreview component** ✅
  - Open `components/features/pos/ReceiptPreview.tsx`
  - Import download function:
    ```typescript
    import { downloadReceipt } from '@/lib/receipts/pdf-generator';
    import { sendReceiptEmail } from '@/lib/email/receipt-mailer';
    ```
  - Add "Download PDF" button:
    ```typescript
    <Button onClick={() => downloadReceipt(order)}>
      <Download className="w-4 h-4 mr-2" />
      Download PDF
    </Button>
    ```
  - Add "Email Receipt" button:
    ```typescript
    <Button onClick={handleEmailReceipt} variant="outline">
      <Mail className="w-4 h-4 mr-2" />
      Email Receipt
    </Button>
    ```
  - Implement `handleEmailReceipt` function with loading state
  - Add success/error toast notifications

- [x] **Add print functionality** ✅
  - Add "Print" button:
    ```typescript
    <Button onClick={() => window.print()} variant="outline">
      <Printer className="w-4 h-4 mr-2" />
      Print
    </Button>
    ```
  - PDF print functionality implemented

- [x] **Make receipt preview draggable and resizable** ✅ **NEW FEATURE**
  - Implemented pure React drag-and-drop functionality
  - Features:
    - **Drag**: Grab header to move modal anywhere on screen
    - **Resize**: 8 resize handles (4 corners + 4 edges)
    - **Constraints**:
      - Min size: 600px × 400px
      - Max size: 90vw × 90vh
    - **Visual indicators**:
      - Grip icon in header
      - Cursor changes (grab/grabbing for drag)
      - Resize cursors for all handles
      - Hover effects on resize handles
    - **Auto-center**: Modal centers on first open
  - Implementation details:
    - No external dependencies (pure React)
    - Uses `useState` for position/size tracking
    - `useEffect` for mouse event handling
    - `useRef` for modal DOM reference
    - Smooth dragging with delta calculations
    - Multi-directional resizing support

### Testing

- [ ] **Test PDF generation**
  - [ ] Generate PDF for order with 1 garment
  - [ ] Generate PDF for order with 5 garments
  - [ ] Generate PDF for order with 10+ garments
  - [ ] Test with all service types (Wash, Dry Clean, Iron, Starch, Express)
  - [ ] Test with different payment statuses (paid, partial, pending)
  - [ ] Verify company logo displays
  - [ ] Verify all text is readable
  - [ ] Verify formatting is correct
  - [ ] Verify totals calculate correctly

- [ ] **Test download functionality**
  - [ ] Test on Chrome desktop
  - [ ] Test on Firefox desktop
  - [ ] Test on Safari desktop
  - [ ] Test on Chrome mobile (Android)
  - [ ] Test on Safari mobile (iOS)
  - [ ] Verify filename format: `receipt-ORD-XXX.pdf`

- [ ] **Test email delivery**
  - [ ] Send to Gmail address
  - [ ] Send to Outlook address
  - [ ] Send to Yahoo address
  - [ ] Send to custom domain email
  - [ ] Send 10 test emails total
  - [ ] Verify 100% delivery rate
  - [ ] Check spam folders
  - [ ] Verify PDF attachment opens correctly
  - [ ] Verify email content displays properly

- [ ] **Test print functionality**
  - [ ] Print preview displays correctly
  - [ ] No broken layouts
  - [ ] Buttons hidden in print view
  - [ ] Page breaks appropriate

- [ ] **Test drag and resize functionality** **NEW**
  - [ ] **Drag testing**:
    - [ ] Modal can be dragged by clicking and holding header
    - [ ] Drag cursor shows correctly (grab → grabbing)
    - [ ] Modal stays within viewport when dragged
    - [ ] Grip icon visible in header
    - [ ] Smooth dragging movement
  - [ ] **Resize testing**:
    - [ ] All 4 corner handles work (nw, ne, se, sw)
    - [ ] All 4 edge handles work (n, e, s, w)
    - [ ] Resize cursors display correctly for each direction
    - [ ] Cannot resize below minimum (600px × 400px)
    - [ ] Cannot resize above maximum (90vw × 90vh)
    - [ ] Content reflows correctly during resize
    - [ ] PDF iframe height adjusts to modal size
    - [ ] Hover effect shows on resize handles
  - [ ] **User experience**:
    - [ ] Modal centers on first open
    - [ ] All functionality works while dragging/resizing
    - [ ] No performance issues during drag/resize
    - [ ] Works with multiple monitor setups
    - [ ] Modal doesn't break on window resize

**Acceptance Criteria:**
- ✅ PDF generates for all order types
- ✅ Download works on desktop and mobile
- ✅ Email delivery success rate > 98%
- ✅ PDF includes company logo and branding
- ✅ Print functionality works correctly
- ✅ PDF generation time < 2 seconds
- ✅ **Receipt modal is draggable and resizable** **NEW**
- ✅ **Modal respects size constraints** **NEW**
- ✅ **Drag/resize provides good UX** **NEW**

---

## 📋 Milestone 2.5: Delivery & Pickup System (20-25 hours)

**Week:** Week 2, Days 3-5
**Goal:** Implement comprehensive garment collection and delivery system with WhatsApp address sharing

### Overview

This milestone covers TWO order fulfillment types:
1. **Pickup Orders**: Staff picks up dirty garments from customer's location (home, office, etc.)
2. **Delivery Orders**: Staff delivers clean garments to customer's location

Each order can have independent collection and return methods, resulting in four possible combinations:
- **Drop-off + Customer collects** (traditional - customer brings and picks up)
- **Drop-off + Delivery** (customer brings, we deliver clean garments)
- **Pickup + Customer collects** (we collect dirty garments, customer picks up clean ones)
- **Pickup + Delivery** (full-service door-to-door)

---

### Phase 1: Basic Delivery & Pickup Options (8-10 hours)

#### Schema Updates

- [ ] **Update Order interface**
  - Open `lib/db/schema.ts`
  - Add to Order interface:
    ```typescript
    // Garment Collection
    collectionMethod: 'dropped_off' | 'pickup_required';
    pickupAddress?: Address;
    pickupInstructions?: string;
    pickupScheduledTime?: Timestamp;
    pickupCompletedTime?: Timestamp;
    pickupAssignedTo?: string; // Employee ID

    // Garment Return
    returnMethod: 'customer_collects' | 'delivery_required';
    deliveryAddress?: Address;
    deliveryInstructions?: string;
    deliveryScheduledTime?: Timestamp;
    deliveryCompletedTime?: Timestamp;
    deliveryAssignedTo?: string; // Employee ID
    ```

- [ ] **Update Address interface**
  - Add to Address interface:
    ```typescript
    export interface Address {
      label: string; // e.g., "Home", "Office", "Shared via WhatsApp"
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      source?: 'manual' | 'whatsapp' | 'google_autocomplete';
      receivedAt?: Timestamp;
    }
    ```

- [ ] **Update Customer interface**
  - Add addresses array:
    ```typescript
    export interface Customer {
      // ... existing fields
      addresses?: Address[];
    }
    ```

#### UI Components - Collection & Return Methods

- [ ] **Create CollectionMethodSelector component**
  - Create file: `components/features/orders/CollectionMethodSelector.tsx`
  - Radio button group:
    - "Customer Dropped Off" (default)
    - "Pick Up from Customer"
  - When "Pick Up from Customer" selected:
    - Show AddressSelector component
    - Show pickup instructions textarea
    - Show pickup date/time picker
  - Props:
    ```typescript
    interface CollectionMethodSelectorProps {
      value: 'dropped_off' | 'pickup_required';
      onChange: (method: 'dropped_off' | 'pickup_required') => void;
      selectedAddress?: Address;
      onAddressChange: (address: Address | undefined) => void;
      instructions?: string;
      onInstructionsChange: (instructions: string) => void;
      scheduledTime?: Date;
      onScheduledTimeChange: (time: Date | undefined) => void;
    }
    ```

- [ ] **Create ReturnMethodSelector component**
  - Create file: `components/features/orders/ReturnMethodSelector.tsx`
  - Radio button group:
    - "Customer Will Collect" (default)
    - "Deliver to Customer"
  - When "Deliver to Customer" selected:
    - Show AddressSelector component
    - Show delivery instructions textarea
    - Show delivery date/time picker (defaults to estimated completion date)
  - Same props structure as CollectionMethodSelector

- [ ] **Create AddressSelector component**
  - Create file: `components/features/orders/AddressSelector.tsx`
  - Dropdown/select showing customer's saved addresses
  - Each address shows:
    - Label (e.g., "Home")
    - Full address
    - Badge if from WhatsApp: "📍 Shared via WhatsApp"
  - "Add New Address" option
  - If "Add New Address":
    - Show address input form
    - Optional: Google Places Autocomplete
    - Save to customer profile option
  - Props:
    ```typescript
    interface AddressSelectorProps {
      customerId: string;
      value?: Address;
      onChange: (address: Address | undefined) => void;
      label?: string;
    }
    ```

#### POS Page Integration

- [ ] **Update POS order creation flow**
  - Open `app/(dashboard)/pos/page.tsx`
  - After customer selection and garment selection
  - Before "Create Order & Process Payment" button
  - Add two sections:
    1. **"How will garments be collected?"**
       - Render `<CollectionMethodSelector />`
    2. **"How will clean garments be returned?"**
       - Render `<ReturnMethodSelector />`
  - Add state management:
    ```typescript
    const [collectionMethod, setCollectionMethod] = useState<'dropped_off' | 'pickup_required'>('dropped_off');
    const [pickupAddress, setPickupAddress] = useState<Address | undefined>();
    const [pickupInstructions, setPickupInstructions] = useState('');
    const [pickupScheduledTime, setPickupScheduledTime] = useState<Date | undefined>();

    const [returnMethod, setReturnMethod] = useState<'customer_collects' | 'delivery_required'>('customer_collects');
    const [deliveryAddress, setDeliveryAddress] = useState<Address | undefined>();
    const [deliveryInstructions, setDeliveryInstructions] = useState('');
    const [deliveryScheduledTime, setDeliveryScheduledTime] = useState<Date | undefined>();
    ```
  - Pass data to `createOrder()`:
    ```typescript
    const order = await createOrder({
      // ... existing fields
      collectionMethod,
      pickupAddress,
      pickupInstructions,
      pickupScheduledTime,
      returnMethod,
      deliveryAddress,
      deliveryInstructions,
      deliveryScheduledTime,
    });
    ```

- [ ] **Update createOrder function**
  - Open `lib/db/orders.ts`
  - Update `createOrder` to accept new fields
  - Apply conditional field assignment (Firestore undefined fix pattern):
    ```typescript
    if (data.collectionMethod === 'pickup_required') {
      if (data.pickupAddress !== undefined) {
        order.pickupAddress = data.pickupAddress;
      }
      if (data.pickupInstructions !== undefined) {
        order.pickupInstructions = data.pickupInstructions;
      }
      if (data.pickupScheduledTime !== undefined) {
        order.pickupScheduledTime = Timestamp.fromDate(data.pickupScheduledTime);
      }
    }

    if (data.returnMethod === 'delivery_required') {
      if (data.deliveryAddress !== undefined) {
        order.deliveryAddress = data.deliveryAddress;
      }
      if (data.deliveryInstructions !== undefined) {
        order.deliveryInstructions = data.deliveryInstructions;
      }
      if (data.deliveryScheduledTime !== undefined) {
        order.deliveryScheduledTime = Timestamp.fromDate(data.deliveryScheduledTime);
      }
    }
    ```

#### Pickups Page

- [ ] **Create pickups page**
  - Create file: `app/(dashboard)/pickups/page.tsx`
  - Fetch orders where `collectionMethod === 'pickup_required'`
  - Filter tabs:
    - "Pending Pickup" (pickupCompletedTime is null)
    - "Scheduled" (has pickupScheduledTime)
    - "Completed" (has pickupCompletedTime)
  - Query:
    ```typescript
    const pickupOrders = await getDocuments<Order>(
      'orders',
      where('collectionMethod', '==', 'pickup_required'),
      orderBy('pickupScheduledTime', 'asc')
    );
    ```

- [ ] **Create PickupTable component**
  - Create file: `components/features/pickups/PickupTable.tsx`
  - Columns:
    - Order ID
    - Customer Name
    - Phone Number
    - Pickup Address
    - Scheduled Time
    - Instructions
    - Assigned To (driver)
    - Status
    - Actions
  - Actions:
    - "Assign Driver" dropdown
    - "Mark as Collected" button (opens confirmation)
    - "View Details" link to order page

- [ ] **Implement "Mark as Collected" functionality**
  - Update `lib/db/orders.ts`
  - Add function:
    ```typescript
    export async function markPickupCompleted(
      orderId: string,
      employeeId: string
    ): Promise<void> {
      await updateDocument<Order>('orders', orderId, {
        pickupCompletedTime: Timestamp.now(),
        pickupAssignedTo: employeeId,
      });
    }
    ```
  - Show success toast
  - Refresh pickup list

#### Deliveries Page Updates

- [ ] **Update deliveries page**
  - Open `app/(dashboard)/deliveries/page.tsx`
  - Update query to fetch orders where `returnMethod === 'delivery_required'`
  - Add filter: only show orders that are ready (status === 'ready' or 'processing' complete)
  - Query:
    ```typescript
    const deliveryOrders = await getDocuments<Order>(
      'orders',
      where('returnMethod', '==', 'delivery_required'),
      where('status', 'in', ['ready', 'completed']),
      orderBy('deliveryScheduledTime', 'asc')
    );
    ```

- [ ] **Update DeliveryTable component**
  - Open existing `components/features/deliveries/DeliveryTable.tsx`
  - Ensure columns include:
    - Order ID
    - Customer Name
    - Delivery Address
    - Scheduled Time
    - Instructions
    - Assigned To
    - Status
    - Actions

- [ ] **Implement "Mark as Delivered" functionality**
  - Update `lib/db/orders.ts`
  - Add function:
    ```typescript
    export async function markDeliveryCompleted(
      orderId: string,
      employeeId: string
    ): Promise<void> {
      await updateDocument<Order>('orders', orderId, {
        deliveryCompletedTime: Timestamp.now(),
        deliveryAssignedTo: employeeId,
      });
    }
    ```

---

### Phase 2: WhatsApp Google Maps Integration (8-10 hours)

#### Wati.io Setup

- [ ] **Create Wati.io account**
  - Go to https://wati.io
  - Sign up for account
  - Connect WhatsApp Business number
  - Verify number
  - Complete setup wizard

- [ ] **Configure webhook**
  - In Wati.io dashboard, go to "Settings" → "Webhooks"
  - Add webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
  - Select events to receive:
    - "Message Received"
    - "Message Location"
  - Save webhook configuration
  - Copy API key and webhook secret

- [ ] **Add environment variables**
  - Open `.env.local`
  - Add:
    ```
    WATI_API_KEY=your_wati_api_key
    WATI_WEBHOOK_SECRET=your_webhook_secret
    WATI_PHONE_NUMBER=your_whatsapp_business_number
    ```
  - Add to `.env.example` for documentation

#### Google Geocoding API Setup

- [ ] **Enable Google Geocoding API**
  - Go to Google Cloud Console
  - Enable "Geocoding API"
  - Get API key (can use same key as Maps API)
  - Add to `.env.local`:
    ```
    GOOGLE_GEOCODING_API_KEY=your_api_key
    ```

- [ ] **Install Google Maps Services**
  ```bash
  npm install @googlemaps/google-maps-services-js
  ```

#### WhatsApp Webhook Handler

- [ ] **Create webhook route**
  - Create file: `app/api/webhooks/whatsapp/route.ts`
  - Implement POST handler:
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { extractGoogleMapsLocation } from '@/lib/whatsapp/location-extractor';
    import { getCustomerByPhone, updateCustomer } from '@/lib/db/customers';
    import { verifyWatiWebhook } from '@/lib/whatsapp/verify';

    export async function POST(request: NextRequest) {
      try {
        // Verify webhook authenticity
        const signature = request.headers.get('x-wati-signature');
        const body = await request.text();

        if (!verifyWatiWebhook(body, signature)) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const data = JSON.parse(body);
        const { waId, text, type } = data;

        // Check if message contains Google Maps link
        if (type === 'text' && text && (
          text.includes('maps.google.com') ||
          text.includes('goo.gl/maps') ||
          text.includes('maps.app.goo.gl')
        )) {
          // Extract location from link
          const location = await extractGoogleMapsLocation(text);

          if (location) {
            // Find customer by phone
            const customer = await getCustomerByPhone(waId);

            if (customer) {
              // Add address to customer profile
              const newAddress: Address = {
                label: 'Shared via WhatsApp',
                address: location.formattedAddress,
                coordinates: {
                  lat: location.lat,
                  lng: location.lng,
                },
                source: 'whatsapp',
                receivedAt: Timestamp.now(),
              };

              // Update customer addresses
              const addresses = customer.addresses || [];
              addresses.push(newAddress);

              await updateCustomer(customer.customerId, {
                addresses,
              });

              // Send confirmation message back
              await sendWhatsAppMessage(
                waId,
                `Thank you! We've saved your location: ${location.formattedAddress}`
              );
            }
          }
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('WhatsApp webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
      }
    }
    ```

#### Location Extraction Utility

- [ ] **Create location extractor**
  - Create file: `lib/whatsapp/location-extractor.ts`
  - Implement extraction logic:
    ```typescript
    import { Client } from '@googlemaps/google-maps-services-js';

    const client = new Client({});

    export interface ExtractedLocation {
      lat: number;
      lng: number;
      formattedAddress: string;
    }

    export async function extractGoogleMapsLocation(
      text: string
    ): Promise<ExtractedLocation | null> {
      try {
        // Pattern 1: Direct coordinates in URL
        // https://maps.google.com/?q=-1.2345,36.7890
        const coordsMatch = text.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);

        if (coordsMatch) {
          const lat = parseFloat(coordsMatch[1]);
          const lng = parseFloat(coordsMatch[2]);

          // Reverse geocode to get address
          const response = await client.reverseGeocode({
            params: {
              latlng: { lat, lng },
              key: process.env.GOOGLE_GEOCODING_API_KEY!,
            },
          });

          if (response.data.results.length > 0) {
            return {
              lat,
              lng,
              formattedAddress: response.data.results[0].formatted_address,
            };
          }
        }

        // Pattern 2: Shortened URL (goo.gl/maps/abc or maps.app.goo.gl/abc)
        const shortUrlMatch = text.match(/(goo\.gl\/maps\/|maps\.app\.goo\.gl\/)([a-zA-Z0-9]+)/);

        if (shortUrlMatch) {
          // Follow redirect to get full URL
          const shortUrl = shortUrlMatch[0];
          const fullUrl = await followRedirect(shortUrl);

          // Recursively extract from full URL
          return extractGoogleMapsLocation(fullUrl);
        }

        return null;
      } catch (error) {
        console.error('Location extraction error:', error);
        return null;
      }
    }

    async function followRedirect(url: string): Promise<string> {
      const response = await fetch(`https://${url}`, {
        redirect: 'follow',
        method: 'HEAD',
      });
      return response.url;
    }
    ```

- [ ] **Create webhook verification utility**
  - Create file: `lib/whatsapp/verify.ts`
  - Implement signature verification:
    ```typescript
    import crypto from 'crypto';

    export function verifyWatiWebhook(
      payload: string,
      signature: string | null
    ): boolean {
      if (!signature) return false;

      const secret = process.env.WATI_WEBHOOK_SECRET!;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    }
    ```

#### WhatsApp Message Sending

- [ ] **Create WhatsApp message sender**
  - Create file: `lib/whatsapp/send-message.ts`
  - Implement Wati.io API call:
    ```typescript
    export async function sendWhatsAppMessage(
      phoneNumber: string,
      message: string
    ): Promise<boolean> {
      try {
        const response = await fetch('https://live-server-XXXXX.wati.io/api/v1/sendSessionMessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WATI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageText: message,
            whatsappNumber: phoneNumber,
          }),
        });

        return response.ok;
      } catch (error) {
        console.error('WhatsApp send error:', error);
        return false;
      }
    }
    ```

#### POS "Request Location" Feature

- [ ] **Add "Request Location" button to AddressSelector**
  - Open `components/features/orders/AddressSelector.tsx`
  - Add button above address dropdown:
    ```typescript
    <Button
      variant="outline"
      onClick={handleRequestLocation}
      disabled={!customer.phoneNumber || isRequesting}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Request Location via WhatsApp
    </Button>
    ```

- [ ] **Implement request location handler**
  - Add function:
    ```typescript
    const handleRequestLocation = async () => {
      setIsRequesting(true);

      const message = `Hi ${customer.name}! Could you please share your location with us?

To share:
1. Tap the attachment icon (📎)
2. Select "Location"
3. Choose your address

Or simply send us a Google Maps link of your address.

Thank you!`;

      const success = await sendWhatsAppMessage(
        customer.phoneNumber,
        message
      );

      if (success) {
        toast.success('Location request sent via WhatsApp');
      } else {
        toast.error('Failed to send location request');
      }

      setIsRequesting(false);
    };
    ```

#### Customer Address Management

- [ ] **Update customer database functions**
  - Open `lib/db/customers.ts`
  - Add function:
    ```typescript
    export async function getCustomerByPhone(
      phoneNumber: string
    ): Promise<Customer | null> {
      const customers = await getDocuments<Customer>(
        'customers',
        where('phoneNumber', '==', phoneNumber),
        limit(1)
      );
      return customers.length > 0 ? customers[0] : null;
    }
    ```

- [ ] **Create address management UI**
  - In `AddressSelector` component
  - Show all saved addresses with source badges:
    - 📍 "Shared via WhatsApp" (green badge)
    - ✏️ "Manually entered" (gray badge)
    - 🗺️ "Google Autocomplete" (blue badge)
  - Allow editing/deleting addresses
  - Show timestamp when address was added

---

### Phase 3: Testing & Validation (4-5 hours)

#### Pickup & Delivery Testing

- [ ] **Test order creation combinations**
  - [ ] Create order: Drop-off + Customer collects (no addresses needed)
  - [ ] Create order: Drop-off + Delivery (delivery address required)
  - [ ] Create order: Pickup + Customer collects (pickup address required)
  - [ ] Create order: Pickup + Delivery (both addresses required)
  - [ ] Verify validation errors if address not provided when required
  - [ ] Verify order saves correctly to Firestore
  - [ ] Verify no undefined field errors

- [ ] **Test pickups page**
  - [ ] Verify only pickup orders appear
  - [ ] Test "Pending Pickup" filter
  - [ ] Test "Scheduled" filter
  - [ ] Test "Completed" filter
  - [ ] Assign driver to pickup order
  - [ ] Mark pickup as completed
  - [ ] Verify order moves to "Completed" tab
  - [ ] Verify pickupCompletedTime is set

- [ ] **Test deliveries page**
  - [ ] Verify only delivery orders appear
  - [ ] Verify only "ready" orders appear
  - [ ] Assign driver to delivery order
  - [ ] Mark delivery as completed
  - [ ] Verify deliveryCompletedTime is set

#### WhatsApp Integration Testing

- [ ] **Test Google Maps link extraction**
  - [ ] Send direct coordinates link: `https://maps.google.com/?q=-1.2921,36.8219`
  - [ ] Send shortened link: `https://goo.gl/maps/abc123`
  - [ ] Send new format: `https://maps.app.goo.gl/abc123`
  - [ ] Verify coordinates extracted correctly
  - [ ] Verify reverse geocoding works
  - [ ] Verify address is human-readable
  - [ ] Test with 10+ different locations

- [ ] **Test webhook processing**
  - [ ] Send WhatsApp message with location from real phone
  - [ ] Verify webhook receives message
  - [ ] Verify signature verification works
  - [ ] Verify customer is found by phone number
  - [ ] Verify address is added to customer profile
  - [ ] Verify confirmation message is sent back
  - [ ] Check Firestore for saved address

- [ ] **Test address display in POS**
  - [ ] Open POS with customer who sent location
  - [ ] Select "Pickup from Customer"
  - [ ] Open AddressSelector
  - [ ] Verify "Shared via WhatsApp" address appears
  - [ ] Verify badge displays correctly
  - [ ] Verify timestamp shows
  - [ ] Select WhatsApp address
  - [ ] Create order successfully

- [ ] **Test "Request Location" button**
  - [ ] Click "Request Location" button
  - [ ] Verify WhatsApp message is sent
  - [ ] Verify message contains instructions
  - [ ] Verify toast notification shows
  - [ ] Test with 5+ different customers
  - [ ] Verify button is disabled if no phone number

#### Error Handling Testing

- [ ] **Test edge cases**
  - [ ] Invalid Google Maps link (no coordinates)
  - [ ] Malformed WhatsApp webhook payload
  - [ ] Customer not found in system
  - [ ] Geocoding API failure
  - [ ] Wati.io API failure
  - [ ] Duplicate addresses (don't save duplicates)
  - [ ] Very long address strings (truncate if needed)

#### Performance Testing

- [ ] **Test performance**
  - [ ] Measure location extraction time (should be < 3 seconds)
  - [ ] Test with 50+ saved addresses (dropdown performance)
  - [ ] Test pickups page with 100+ orders
  - [ ] Test deliveries page with 100+ orders
  - [ ] Verify no lag when selecting addresses

---

### Acceptance Criteria

- ✅ Staff can select "Pickup" or "Drop-off" for garment collection
- ✅ Staff can select "Delivery" or "Customer Collects" for garment return
- ✅ Both methods can be selected independently
- ✅ Address is required when pickup or delivery is selected
- ✅ Pickups page shows only orders requiring pickup
- ✅ Deliveries page shows only orders requiring delivery
- ✅ Driver can be assigned to pickup/delivery orders
- ✅ Orders can be marked as "Collected" or "Delivered"
- ✅ WhatsApp location pins are extracted with >95% accuracy
- ✅ Extracted addresses are human-readable and accurate
- ✅ Addresses auto-save to customer profile
- ✅ WhatsApp addresses display with badge in POS
- ✅ "Request Location" button sends WhatsApp message
- ✅ Location extraction completes in < 3 seconds
- ✅ No undefined field errors in Firestore
- ✅ System handles 100+ orders on pickups/deliveries pages without lag

---

## 📋 Milestone 3: Google Maps Setup (6-8 hours)

**Week:** Week 2, Days 3-4
**Goal:** Set up Google Maps integration and create reusable map components

### Map Component Creation

- [ ] **Create base Map component**
  - Create file: `components/features/driver/Map.tsx`
  - Mark as client component: `'use client';`
  - Import Google Maps:
    ```typescript
    import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
    ```
  - Define component props:
    ```typescript
    interface MapProps {
      center: { lat: number; lng: number };
      markers?: Array<{ lat: number; lng: number; label?: string }>;
      zoom?: number;
      height?: string;
    }
    ```
  - Implement component:
    ```typescript
    export function Map({ center, markers = [], zoom = 12, height = '500px' }: MapProps) {
      return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            center={center}
            zoom={zoom}
            mapContainerStyle={{ width: '100%', height }}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
                label={marker.label}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      );
    }
    ```

- [ ] **Test Map component**
  - Create test page: `app/test-maps/page.tsx`
  - Display map with Nairobi center:
    ```typescript
    const nairobiCenter = { lat: -1.286389, lng: 36.817223 };
    ```
  - Add multiple test markers (5+)
  - Navigate to `/test-maps`
  - Verify map displays without errors
  - Test zoom controls
  - Test marker interactions

### Geocoding Service

- [ ] **Create geocoding service**
  - Create file: `lib/maps/geocoding-service.ts`
  - Install dependencies if needed:
    ```bash
    npm install @googlemaps/google-maps-services-js
    ```
  - Implement geocoding function:
    ```typescript
    import { Client } from '@googlemaps/google-maps-services-js';

    const client = new Client({});

    export async function geocodeAddress(
      address: string
    ): Promise<{ lat: number; lng: number } | null> {
      try {
        const response = await client.geocode({
          params: {
            address,
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          },
        });

        if (response.data.results.length > 0) {
          const { lat, lng } = response.data.results[0].geometry.location;
          return { lat, lng };
        }

        return null;
      } catch (error) {
        console.error('Geocoding error:', error);
        return null;
      }
    }
    ```

- [ ] **Create batch geocoding function**
  - Add to `lib/maps/geocoding-service.ts`:
    ```typescript
    export async function geocodeAddresses(
      addresses: string[]
    ): Promise<Array<{ address: string; coordinates: { lat: number; lng: number } | null }>> {
      const results = await Promise.all(
        addresses.map(async (address) => ({
          address,
          coordinates: await geocodeAddress(address),
        }))
      );
      return results;
    }
    ```

- [ ] **Test geocoding**
  - Test with Nairobi addresses:
    - [ ] "Kilimani, Nairobi, Kenya"
    - [ ] "Westlands, Nairobi, Kenya"
    - [ ] "Ngong Road, Nairobi, Kenya"
    - [ ] "Karen, Nairobi, Kenya"
    - [ ] "Lavington, Nairobi, Kenya"
  - Verify coordinates returned are accurate
  - Test error handling for invalid addresses
  - Check API usage in Google Cloud Console

### Directions Service Setup

- [ ] **Create directions service**
  - Create file: `lib/maps/directions-service.ts`
  - Implement basic directions function:
    ```typescript
    export async function getDirections(
      origin: { lat: number; lng: number },
      destination: { lat: number; lng: number },
      waypoints?: Array<{ lat: number; lng: number }>
    ): Promise<google.maps.DirectionsResult | null> {
      try {
        const directionsService = new google.maps.DirectionsService();

        const request: google.maps.DirectionsRequest = {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          waypoints: waypoints?.map(wp => ({
            location: new google.maps.LatLng(wp.lat, wp.lng),
            stopover: true,
          })),
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        };

        const result = await directionsService.route(request);
        return result;
      } catch (error) {
        console.error('Directions error:', error);
        return null;
      }
    }
    ```

### Map Utilities

- [ ] **Create map utilities**
  - Create file: `lib/maps/map-utils.ts`
  - Add distance calculation:
    ```typescript
    export function calculateDistance(
      point1: { lat: number; lng: number },
      point2: { lat: number; lng: number }
    ): number {
      // Haversine formula
      const R = 6371e3; // Earth radius in meters
      const φ1 = point1.lat * Math.PI / 180;
      const φ2 = point2.lat * Math.PI / 180;
      const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
      const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // Distance in meters
    }
    ```
  - Add bounds calculation:
    ```typescript
    export function calculateBounds(
      points: Array<{ lat: number; lng: number }>
    ): google.maps.LatLngBounds {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(point => {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
      });
      return bounds;
    }
    ```

### Testing & Verification

- [ ] **Test all map services**
  - [ ] Map component displays correctly
  - [ ] Markers show on map
  - [ ] Geocoding converts addresses to coordinates
  - [ ] Directions API returns routes
  - [ ] Distance calculations are accurate
  - [ ] No console errors
  - [ ] API usage within free tier limits

- [ ] **Performance testing**
  - [ ] Map loads in < 2 seconds
  - [ ] Geocoding responds in < 1 second per address
  - [ ] Batch geocoding (10 addresses) < 5 seconds
  - [ ] No memory leaks on map component

**Acceptance Criteria:**
- ✅ Map component displays correctly
- ✅ Can add markers to map
- ✅ Geocoding converts addresses to coordinates
- ✅ Directions service returns routes
- ✅ No console errors
- ✅ API usage stays within budget

---

## 📋 Milestone 4: Delivery Batch Management (6-8 hours)

**Week:** Week 3, Days 1-2
**Goal:** Create UI for selecting orders and creating delivery batches

### Deliveries Page Setup

- [ ] **Create deliveries page**
  - Create file: `app/(dashboard)/deliveries/page.tsx`
  - Mark as client component: `'use client';`
  - Set up page structure:
    ```typescript
    export default function DeliveriesPage() {
      return (
        <div className="min-h-screen bg-gray-50 pb-8">
          <div className="bg-white border-b sticky top-0 z-10">
            {/* Header */}
          </div>
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Content */}
          </div>
        </div>
      );
    }
    ```

- [ ] **Add page header**
  - Title: "Delivery Management"
  - Subtitle: "Create and manage delivery batches"
  - Icon: Truck icon from lucide-react
  - Stats cards:
    - Ready orders count
    - Pending deliveries count
    - Today's deliveries count

### Order Selection UI

- [ ] **Create OrderSelectionTable component**
  - Create file: `components/features/deliveries/OrderSelectionTable.tsx`
  - Fetch orders with status "ready":
    ```typescript
    const { data: readyOrders } = useQuery({
      queryKey: ['ready-orders'],
      queryFn: async () => {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('status', '==', 'ready'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
    });
    ```
  - Create table with columns:
    - [ ] Checkbox for selection
    - [ ] Order ID
    - [ ] Customer Name
    - [ ] Customer Phone
    - [ ] Delivery Address
    - [ ] Total Amount
    - [ ] Created Date
  - Implement row selection state
  - Add "Select All" checkbox
  - Show selected count in header

- [ ] **Implement multi-select functionality**
  - Create state for selected orders:
    ```typescript
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    ```
  - Handle individual checkbox:
    ```typescript
    const handleSelect = (orderId: string) => {
      setSelectedOrders(prev =>
        prev.includes(orderId)
          ? prev.filter(id => id !== orderId)
          : [...prev, orderId]
      );
    };
    ```
  - Handle select all:
    ```typescript
    const handleSelectAll = () => {
      if (selectedOrders.length === readyOrders.length) {
        setSelectedOrders([]);
      } else {
        setSelectedOrders(readyOrders.map(order => order.id));
      }
    };
    ```

### Delivery Batch Form

- [ ] **Create DeliveryBatchForm component**
  - Create file: `components/features/deliveries/DeliveryBatchForm.tsx`
  - Add form fields:
    - [ ] Driver selection dropdown
    - [ ] Delivery date picker
    - [ ] Notes/instructions textarea (optional)
  - Fetch available drivers:
    ```typescript
    const { data: drivers } = useQuery({
      queryKey: ['drivers'],
      queryFn: async () => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'driver'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
    });
    ```

- [ ] **Add form validation**
  - Use react-hook-form + Zod:
    ```typescript
    const deliveryBatchSchema = z.object({
      driverId: z.string().min(1, 'Driver is required'),
      deliveryDate: z.date(),
      notes: z.string().optional(),
    });

    type DeliveryBatchForm = z.infer<typeof deliveryBatchSchema>;
    ```
  - Show validation errors
  - Disable submit if no orders selected

- [ ] **Implement batch creation**
  - Create "Create Delivery Batch" button
  - Handle form submission:
    ```typescript
    const handleCreateBatch = async (data: DeliveryBatchForm) => {
      if (selectedOrders.length === 0) {
        toast.error('Please select at least one order');
        return;
      }

      setIsCreating(true);
      try {
        // Will implement route optimization in next milestone
        const batch = {
          driverId: data.driverId,
          orders: selectedOrders,
          deliveryDate: data.deliveryDate,
          notes: data.notes,
          status: 'pending',
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        };

        // Temporary: Save without optimization
        await addDoc(collection(db, 'deliveries'), batch);

        toast.success('Delivery batch created successfully!');
        setSelectedOrders([]);
      } catch (error) {
        console.error('Error creating batch:', error);
        toast.error('Failed to create delivery batch');
      } finally {
        setIsCreating(false);
      }
    };
    ```

### UI Polish

- [ ] **Add empty states**
  - No ready orders:
    ```typescript
    <EmptyState
      icon={Package}
      title="No orders ready for delivery"
      description="Orders will appear here when they reach 'ready' status"
    />
    ```
  - No drivers available:
    ```typescript
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        No drivers available. Please add drivers in the Employees section.
      </AlertDescription>
    </Alert>
    ```

- [ ] **Add loading states**
  - Skeleton loaders for table
  - Loading spinner for form submission
  - Disabled buttons during loading

- [ ] **Add success feedback**
  - Toast notification on batch creation
  - Confetti animation (optional)
  - Redirect to batch details or driver dashboard

### Testing

- [ ] **Test order selection**
  - [ ] Can select individual orders
  - [ ] Can select all orders
  - [ ] Can deselect orders
  - [ ] Selected count displays correctly
  - [ ] Empty state shows when no orders

- [ ] **Test form validation**
  - [ ] Driver field is required
  - [ ] Date field is required
  - [ ] Cannot submit without selections
  - [ ] Error messages display

- [ ] **Test batch creation**
  - [ ] Batch saves to Firestore
  - [ ] Selected orders clear after creation
  - [ ] Toast notification shows
  - [ ] Can create multiple batches

**Acceptance Criteria:**
- ✅ Can view ready orders
- ✅ Can select multiple orders
- ✅ Can assign driver
- ✅ Can set delivery date
- ✅ Batch saves to Firestore
- ✅ Form validates correctly

---

## 📋 Milestone 5: Route Optimization (12-14 hours)

**Week:** Week 3, Days 3-4
**Goal:** Implement Google Maps route optimization for delivery batches

### Route Optimizer Core

- [ ] **Create route optimizer**
  - Create file: `lib/routing/route-optimizer.ts`
  - Import required services
  - Define types:
    ```typescript
    interface RouteOptimizationResult {
      optimizedOrder: number[];
      stops: DeliveryStop[];
      distance: number;
      duration: number;
      polyline?: string;
    }
    ```

- [ ] **Implement optimization function**
  ```typescript
  export async function optimizeRoute(
    orders: Order[]
  ): Promise<RouteOptimizationResult> {
    // 1. Extract delivery addresses
    const addresses = orders.map(order => order.deliveryAddress);

    // 2. Geocode all addresses
    const geocodedAddresses = await geocodeAddresses(addresses);

    // 3. Filter out failed geocoding
    const validAddresses = geocodedAddresses.filter(
      addr => addr.coordinates !== null
    );

    if (validAddresses.length === 0) {
      throw new Error('No valid addresses to optimize');
    }

    // 4. Call Directions API with waypoint optimization
    const origin = validAddresses[0].coordinates!;
    const destination = validAddresses[validAddresses.length - 1].coordinates!;
    const waypoints = validAddresses.slice(1, -1).map(addr => addr.coordinates!);

    const directions = await getDirections(origin, destination, waypoints);

    if (!directions) {
      throw new Error('Failed to get directions');
    }

    // 5. Extract optimized waypoint order
    const waypointOrder = directions.routes[0].waypoint_order || [];

    // 6. Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    directions.routes[0].legs.forEach(leg => {
      totalDistance += leg.distance?.value || 0;
      totalDuration += leg.duration?.value || 0;
    });

    // 7. Create ordered stops
    const stops: DeliveryStop[] = validAddresses.map((addr, index) => ({
      orderId: orders[index].orderId,
      address: addr.address,
      coordinates: addr.coordinates!,
      sequence: index + 1,
      status: 'pending',
    }));

    return {
      optimizedOrder: [0, ...waypointOrder.map(i => i + 1), validAddresses.length - 1],
      stops,
      distance: totalDistance,
      duration: totalDuration,
      polyline: directions.routes[0].overview_polyline?.points,
    };
  }
  ```

- [ ] **Add error handling**
  - Handle geocoding failures
  - Handle API rate limits
  - Handle no valid routes
  - Log errors with context

### Integration with Delivery Batch

- [ ] **Update batch creation**
  - Modify `DeliveryBatchForm` component
  - Call route optimizer before saving:
    ```typescript
    const handleCreateBatch = async (data: DeliveryBatchForm) => {
      setIsCreating(true);
      try {
        // Get full order objects
        const selectedOrderObjects = readyOrders.filter(order =>
          selectedOrders.includes(order.id)
        );

        // Optimize route
        toast.info('Optimizing route...');
        const optimizationResult = await optimizeRoute(selectedOrderObjects);

        // Create batch with optimized route
        const batch: Delivery = {
          deliveryId: generateDeliveryId(),
          driverId: data.driverId,
          orders: selectedOrders,
          route: {
            optimized: true,
            stops: optimizationResult.stops,
            distance: optimizationResult.distance,
            estimatedDuration: optimizationResult.duration,
            polyline: optimizationResult.polyline,
          },
          status: 'pending',
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        };

        await setDoc(doc(db, 'deliveries', batch.deliveryId), batch);

        // Update order statuses to "out_for_delivery"
        await Promise.all(
          selectedOrders.map(orderId =>
            updateDoc(doc(db, 'orders', orderId), {
              status: 'out_for_delivery',
              updatedAt: serverTimestamp(),
            })
          )
        );

        toast.success(`Route optimized! Distance: ${(optimizationResult.distance / 1000).toFixed(1)} km`);
      } catch (error) {
        console.error('Error creating batch:', error);
        toast.error('Failed to optimize route');
      } finally {
        setIsCreating(false);
      }
    };
    ```

### Route Visualization

- [ ] **Create RouteMap component**
  - Create file: `components/features/deliveries/RouteMap.tsx`
  - Display optimized route on map
  - Show numbered markers for each stop
  - Draw route polyline
  - Fit bounds to show all stops

- [ ] **Implement marker numbering**
  ```typescript
  {stops.map((stop, index) => (
    <Marker
      key={stop.orderId}
      position={stop.coordinates}
      label={{
        text: String(stop.sequence),
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
      icon={{
        url: 'data:image/svg+xml;base64,...', // Custom pin with number
        scaledSize: new google.maps.Size(40, 40),
      }}
    />
  ))}
  ```

- [ ] **Add route polyline**
  ```typescript
  import { Polyline } from '@react-google-maps/api';

  {route.polyline && (
    <Polyline
      path={google.maps.geometry.encoding.decodePath(route.polyline)}
      options={{
        strokeColor: '#000000',
        strokeWeight: 4,
        strokeOpacity: 0.8,
      }}
    />
  )}
  ```

### Route Details Display

- [ ] **Create RouteDetails component**
  - Create file: `components/features/deliveries/RouteDetails.tsx`
  - Display route information:
    - [ ] Total distance (km)
    - [ ] Estimated duration (hours, minutes)
    - [ ] Number of stops
    - [ ] Estimated fuel cost (optional)
  - Format display:
    ```typescript
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    };

    const formatDistance = (meters: number): string => {
      return `${(meters / 1000).toFixed(1)} km`;
    };
    ```

- [ ] **Add stop list**
  - Ordered list of stops
  - Show stop sequence number
  - Show customer name and address
  - Show phone number
  - Show order total

### Optimization Performance

- [ ] **Add optimization caching**
  - Cache geocoded coordinates in Firestore:
    ```typescript
    // Update order schema to include geocoded address
    interface Order {
      // ... existing fields
      deliveryCoordinates?: { lat: number; lng: number };
    }
    ```
  - Check cache before geocoding
  - Update cache on successful geocoding

- [ ] **Add progress indicators**
  - Show progress during optimization:
    - "Geocoding addresses... (1/10)"
    - "Calculating optimal route..."
    - "Saving delivery batch..."
  - Use progress bar or stepper component

### Testing

- [ ] **Test route optimization**
  - [ ] Test with 5 stops
  - [ ] Test with 10 stops
  - [ ] Test with 20 stops
  - [ ] Test with 25 stops (API limit)
  - [ ] Verify route is logical
  - [ ] Check distance calculations
  - [ ] Check duration estimates

- [ ] **Test error handling**
  - [ ] Invalid addresses
  - [ ] Failed geocoding
  - [ ] API rate limits
  - [ ] No valid route
  - [ ] Network errors

- [ ] **Test visualization**
  - [ ] Map displays route
  - [ ] Markers numbered correctly
  - [ ] Polyline shows route
  - [ ] All stops visible
  - [ ] Route details accurate

**Acceptance Criteria:**
- ✅ Route optimization works for 5-25 stops
- ✅ Map displays optimized route
- ✅ Distance and time estimates accurate
- ✅ Numbered markers show sequence
- ✅ Handles errors gracefully
- ✅ Performance < 10 seconds for 20 stops

---

## 📋 Milestone 6: Driver Dashboard (8-10 hours)

**Week:** Week 3, Day 5
**Goal:** Create mobile-optimized driver interface for delivery execution

### Driver Dashboard Page

- [ ] **Create drivers page**
  - Create file: `app/(dashboard)/drivers/page.tsx`
  - Mark as client component
  - Add mobile-first responsive design
  - Set up page structure

- [ ] **Fetch driver's deliveries**
  ```typescript
  const { data: myDeliveries } = useQuery({
    queryKey: ['my-deliveries', user.uid],
    queryFn: async () => {
      const q = query(
        collection(db, 'deliveries'),
        where('driverId', '==', user.uid),
        where('status', 'in', ['pending', 'in_progress']),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  ```

### Delivery List UI

- [ ] **Create delivery cards**
  - Show for each delivery:
    - [ ] Delivery ID
    - [ ] Number of stops
    - [ ] Total distance
    - [ ] Estimated duration
    - [ ] Status badge
    - [ ] "Start Delivery" button (if pending)
    - [ ] "View Route" button (if in progress)

- [ ] **Implement "Start Delivery" action**
  ```typescript
  const handleStartDelivery = async (deliveryId: string) => {
    try {
      await updateDoc(doc(db, 'deliveries', deliveryId), {
        status: 'in_progress',
        startTime: serverTimestamp(),
      });
      toast.success('Delivery started!');
    } catch (error) {
      console.error('Error starting delivery:', error);
      toast.error('Failed to start delivery');
    }
  };
  ```

### Route Map Display

- [ ] **Create RouteMap component for driver**
  - Create file: `components/features/driver/RouteMap.tsx`
  - Display delivery route
  - Show current location (if available)
  - Highlight next stop
  - Show completed stops in different color

- [ ] **Add current location tracking**
  ```typescript
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);
  ```

### Stop List Component

- [ ] **Create StopList component**
  - Create file: `components/features/driver/StopList.tsx`
  - Display ordered list of stops
  - Show for each stop:
    - [ ] Stop number
    - [ ] Customer name
    - [ ] Customer phone (clickable tel: link)
    - [ ] Delivery address
    - [ ] Order amount
    - [ ] Status badge
    - [ ] Action buttons

- [ ] **Implement stop card**
  ```typescript
  <Card className={`
    ${stop.status === 'completed' ? 'bg-green-50' : 'bg-white'}
    ${stop.status === 'failed' ? 'bg-red-50' : ''}
  `}>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Stop {stop.sequence}</span>
        <Badge>{stop.status}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="font-semibold">{customerName}</p>
      <a href={`tel:${customerPhone}`} className="text-blue-600">
        {customerPhone}
      </a>
      <p className="text-sm text-gray-600">{stop.address}</p>
      <p className="font-semibold mt-2">KES {orderAmount}</p>
    </CardContent>
    <CardFooter className="flex gap-2">
      <Button onClick={() => handleNavigate(stop)}>
        <Navigation className="w-4 h-4 mr-2" />
        Navigate
      </Button>
      <Button onClick={() => handleMarkDelivered(stop)}>
        <CheckCircle className="w-4 h-4 mr-2" />
        Delivered
      </Button>
      <Button variant="outline" onClick={() => handleCustomerNotHome(stop)}>
        <XCircle className="w-4 h-4 mr-2" />
        Not Home
      </Button>
    </CardFooter>
  </Card>
  ```

### Navigation Integration

- [ ] **Create NavigationButton component**
  - Create file: `components/features/driver/NavigationButton.tsx`
  - Implement Google Maps deep link:
    ```typescript
    export function NavigationButton({ address, coordinates }: NavigationButtonProps) {
      const handleNavigate = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
        window.open(url, '_blank');
      };

      return (
        <Button onClick={handleNavigate}>
          <Navigation className="w-4 h-4 mr-2" />
          Navigate
        </Button>
      );
    }
    ```

- [ ] **Test navigation**
  - Test on desktop (opens Google Maps in browser)
  - Test on Android (opens Google Maps app)
  - Test on iOS (opens Apple Maps or Google Maps app)

### Delivery Status Updates

- [ ] **Implement "Mark as Delivered" function**
  ```typescript
  const handleMarkDelivered = async (stop: DeliveryStop, deliveryId: string) => {
    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      const delivery = await getDoc(deliveryRef);
      const route = delivery.data()?.route;

      // Update stop status
      const updatedStops = route.stops.map((s: DeliveryStop) =>
        s.orderId === stop.orderId
          ? { ...s, status: 'completed', timestamp: serverTimestamp() }
          : s
      );

      await updateDoc(deliveryRef, {
        'route.stops': updatedStops,
      });

      // Update order status
      await updateDoc(doc(db, 'orders', stop.orderId), {
        status: 'delivered',
        updatedAt: serverTimestamp(),
      });

      toast.success(`Delivery ${stop.sequence} marked as completed!`);
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery status');
    }
  };
  ```

- [ ] **Implement "Customer Not Home" function**
  ```typescript
  const handleCustomerNotHome = async (stop: DeliveryStop, deliveryId: string) => {
    const notes = prompt('Add notes (optional):');

    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      const delivery = await getDoc(deliveryRef);
      const route = delivery.data()?.route;

      const updatedStops = route.stops.map((s: DeliveryStop) =>
        s.orderId === stop.orderId
          ? { ...s, status: 'failed', timestamp: serverTimestamp(), notes }
          : s
      );

      await updateDoc(deliveryRef, {
        'route.stops': updatedStops,
      });

      toast.warning('Delivery marked as failed. Customer will be notified.');
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery status');
    }
  };
  ```

### COD Payment Collection (Optional)

- [ ] **Add COD payment collection**
  - Show payment input for COD orders
  - Record payment amount
  - Update order payment status
  - Add to driver's cash collection total

### Mobile Optimization

- [ ] **Optimize for mobile**
  - Large touch targets (min 44px)
  - Sticky action buttons
  - Swipe gestures for stop cards
  - Offline support with service worker
  - Battery-efficient location tracking

- [ ] **Add PWA features**
  - Installable as app
  - Offline fallback
  - Background sync
  - Push notifications for new deliveries

### Testing

- [ ] **Test driver dashboard**
  - [ ] Deliveries fetch correctly
  - [ ] Can start delivery
  - [ ] Route displays on map
  - [ ] Current location shows
  - [ ] Stop list displays correctly
  - [ ] Can mark stops as delivered
  - [ ] Can mark customer not home
  - [ ] Navigation opens Google Maps

- [ ] **Test on actual mobile devices**
  - [ ] Test on Android phone
  - [ ] Test on iPhone
  - [ ] Test touch interactions
  - [ ] Test navigation integration
  - [ ] Test offline functionality
  - [ ] Test battery usage

- [ ] **Test real-time updates**
  - [ ] Manager sees driver progress
  - [ ] Customer receives notifications
  - [ ] Status updates reflect immediately

**Acceptance Criteria:**
- ✅ Driver sees assigned deliveries
- ✅ Can start delivery
- ✅ Route displays on map
- ✅ Can navigate to each stop
- ✅ Can mark stops as completed/failed
- ✅ Real-time updates work
- ✅ UI is mobile-optimized
- ✅ Works on iOS and Android

---

## 📋 Milestone 7: Inventory Management (12-14 hours)

**Week:** Week 4, Days 1-2
**Goal:** Build comprehensive inventory tracking and management system

### Inventory Page Setup

- [ ] **Create inventory page**
  - Create file: `app/(dashboard)/inventory/page.tsx`
  - Mark as client component
  - Add page header with stats
  - Set up grid layout

- [ ] **Fetch inventory items**
  ```typescript
  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'inventory'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });
  ```

### Inventory Table Component

- [ ] **Create InventoryTable component**
  - Create file: `components/features/inventory/InventoryTable.tsx`
  - Create table with columns:
    - [ ] Item Name
    - [ ] Category
    - [ ] Current Quantity
    - [ ] Unit
    - [ ] Reorder Level
    - [ ] Status (color-coded)
    - [ ] Last Restocked
    - [ ] Actions

- [ ] **Implement stock level color coding**
  ```typescript
  const getStockLevelColor = (quantity: number, reorderLevel: number) => {
    if (quantity < reorderLevel) return 'text-red-600 bg-red-50'; // Critical
    if (quantity <= reorderLevel * 1.2) return 'text-yellow-600 bg-yellow-50'; // Low
    return 'text-green-600 bg-green-50'; // Good
  };
  ```

- [ ] **Add stock level badge**
  ```typescript
  <Badge className={getStockLevelColor(item.quantity, item.reorderLevel)}>
    {quantity} {unit}
  </Badge>
  ```

### Add Item Modal

- [ ] **Create AddItemModal component**
  - Create file: `components/features/inventory/AddItemModal.tsx`
  - Use Dialog from shadcn/ui
  - Create form with fields:
    - [ ] Item Name (required)
    - [ ] Category (dropdown)
    - [ ] Quantity (number)
    - [ ] Unit (dropdown: kg, liters, pieces)
    - [ ] Reorder Level (number)
    - [ ] Cost Per Unit (optional)
    - [ ] Supplier (optional)
    - [ ] Expiry Date (optional)

- [ ] **Implement form validation**
  ```typescript
  const inventoryItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.enum(['detergents', 'softeners', 'hangers', 'packaging', 'stain_removers', 'others']),
    quantity: z.number().min(0, 'Quantity must be positive'),
    unit: z.enum(['kg', 'liters', 'pieces']),
    reorderLevel: z.number().min(0, 'Reorder level must be positive'),
    costPerUnit: z.number().optional(),
    supplier: z.string().optional(),
    expiryDate: z.date().optional(),
  });
  ```

- [ ] **Implement item creation**
  ```typescript
  const handleAddItem = async (data: InventoryItemForm) => {
    try {
      const item: InventoryItem = {
        itemId: generateItemId(),
        branchId: userData.branchId,
        ...data,
        lastRestocked: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'inventory', item.itemId), item);
      toast.success('Item added successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };
  ```

### Edit Item Modal

- [ ] **Create EditItemModal component**
  - Reuse AddItemModal with edit mode
  - Pre-fill form with existing data
  - Update instead of create

- [ ] **Implement item update**
  ```typescript
  const handleUpdateItem = async (itemId: string, data: InventoryItemForm) => {
    try {
      await updateDoc(doc(db, 'inventory', itemId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast.success('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };
  ```

### Stock Adjustment Modal

- [ ] **Create StockAdjustmentModal component**
  - Create file: `components/features/inventory/StockAdjustmentModal.tsx`
  - Add form fields:
    - [ ] Adjustment Type (radio: Add/Remove)
    - [ ] Quantity (number)
    - [ ] Reason (textarea)
  - Show current stock and new stock preview

- [ ] **Implement stock adjustment**
  ```typescript
  const handleStockAdjustment = async (
    itemId: string,
    type: 'restock' | 'usage',
    amount: number,
    reason?: string
  ) => {
    try {
      const itemRef = doc(db, 'inventory', itemId);
      const item = await getDoc(itemRef);
      const currentQuantity = item.data()?.quantity || 0;
      const newQuantity = type === 'restock'
        ? currentQuantity + amount
        : currentQuantity - amount;

      if (newQuantity < 0) {
        toast.error('Cannot reduce stock below zero');
        return;
      }

      // Update inventory item
      await updateDoc(itemRef, {
        quantity: newQuantity,
        lastRestocked: type === 'restock' ? serverTimestamp() : item.data()?.lastRestocked,
        updatedAt: serverTimestamp(),
      });

      // Log adjustment in audit trail
      const log: InventoryLog = {
        logId: generateLogId(),
        itemId,
        type,
        oldQuantity: currentQuantity,
        newQuantity,
        amount,
        reason,
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      await setDoc(doc(db, 'inventory_logs', log.logId), log);

      toast.success(`Stock ${type === 'restock' ? 'added' : 'removed'} successfully!`);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to adjust stock');
    }
  };
  ```

### Search & Filter

- [ ] **Add search functionality**
  - Add search input above table
  - Filter by item name (client-side)
  ```typescript
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = inventory?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  ```

- [ ] **Add category filter**
  - Add category dropdown
  - Filter by selected category
  ```typescript
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = inventory?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  ```

- [ ] **Add stock level filter**
  - Filter buttons: All / Critical / Low / Good
  ```typescript
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'low' | 'good'>('all');

  const getFilteredByStock = (items: InventoryItem[]) => {
    if (stockFilter === 'all') return items;
    return items.filter(item => {
      const ratio = item.quantity / item.reorderLevel;
      if (stockFilter === 'critical') return ratio < 1;
      if (stockFilter === 'low') return ratio >= 1 && ratio <= 1.2;
      if (stockFilter === 'good') return ratio > 1.2;
      return true;
    });
  };
  ```

### Adjustment History

- [ ] **Create AdjustmentHistory component**
  - Create file: `components/features/inventory/AdjustmentHistory.tsx`
  - Fetch logs for specific item:
    ```typescript
    const { data: logs } = useQuery({
      queryKey: ['inventory-logs', itemId],
      queryFn: async () => {
        const q = query(
          collection(db, 'inventory_logs'),
          where('itemId', '==', itemId),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
    });
    ```
  - Display log entries with:
    - [ ] Date/time
    - [ ] Type (restock/usage)
    - [ ] Amount changed
    - [ ] Old → New quantity
    - [ ] User who made change
    - [ ] Reason

### Low Stock Badge

- [ ] **Create LowStockAlert component**
  - Create file: `components/features/inventory/LowStockAlert.tsx`
  - Show badge in header with count
  - Click to filter critical items
  ```typescript
  const lowStockCount = inventory?.filter(
    item => item.quantity < item.reorderLevel
  ).length || 0;

  <Badge variant="destructive">
    {lowStockCount} low stock items
  </Badge>
  ```

### Testing

- [ ] **Test inventory management**
  - [ ] Add 50+ inventory items
  - [ ] Test all categories
  - [ ] Edit item details
  - [ ] Delete items
  - [ ] Adjust stock (add)
  - [ ] Adjust stock (remove)
  - [ ] Search functionality
  - [ ] Category filter
  - [ ] Stock level filter
  - [ ] View adjustment history

- [ ] **Test color coding**
  - [ ] Critical items show red
  - [ ] Low items show yellow
  - [ ] Good items show green
  - [ ] Badge displays correctly

- [ ] **Test audit trail**
  - [ ] Logs record all changes
  - [ ] Logs are immutable
  - [ ] History displays correctly

**Acceptance Criteria:**
- ✅ Can add inventory items
- ✅ Can edit items
- ✅ Can adjust stock quantities
- ✅ Color-coded stock levels
- ✅ Search and filter work
- ✅ Audit trail logs all changes
- ✅ Low stock items highlighted

---

## 📋 Milestone 8: Inventory Alerts (4 hours)

**Week:** Week 4, Day 3
**Goal:** Set up automated low stock alerts via Cloud Functions

### Cloud Function Setup

- [ ] **Create scheduled function**
  - Create file: `functions/src/scheduledJobs/checkLowStock.ts`
  - Import dependencies:
    ```typescript
    import * as functions from 'firebase-functions';
    import * as admin from 'firebase-admin';
    import { Resend } from 'resend';
    ```

- [ ] **Implement low stock check**
  ```typescript
  export const checkLowStock = functions.pubsub
    .schedule('every day 09:00')
    .timeZone('Africa/Nairobi')
    .onRun(async (context) => {
      const db = admin.firestore();

      // Query all inventory items
      const snapshot = await db.collection('inventory').get();

      // Filter low stock items
      const lowStockItems = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.quantity < item.reorderLevel);

      if (lowStockItems.length === 0) {
        console.log('No low stock items found');
        return null;
      }

      console.log(`Found ${lowStockItems.length} low stock items`);

      // Group by branch
      const itemsByBranch = lowStockItems.reduce((acc, item) => {
        if (!acc[item.branchId]) acc[item.branchId] = [];
        acc[item.branchId].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // Send alerts for each branch
      for (const [branchId, items] of Object.entries(itemsByBranch)) {
        await sendLowStockAlert(branchId, items);
      }

      return null;
    });
  ```

### Email Alert

- [ ] **Implement email alert function**
  ```typescript
  async function sendLowStockAlert(branchId: string, items: any[]) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get branch manager email
    const managersSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'manager')
      .where('branchId', '==', branchId)
      .get();

    const managerEmails = managersSnapshot.docs.map(doc => doc.data().email);

    if (managerEmails.length === 0) {
      console.log(`No managers found for branch ${branchId}`);
      return;
    }

    // Create email HTML
    const itemsList = items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity} ${item.unit}</td>
        <td>${item.reorderLevel} ${item.unit}</td>
        <td>${item.category}</td>
      </tr>
    `).join('');

    const html = `
      <h2>Low Stock Alert - ${branchId}</h2>
      <p>The following items are below their reorder level:</p>
      <table border="1" cellpadding="5">
        <tr>
          <th>Item</th>
          <th>Current Stock</th>
          <th>Reorder Level</th>
          <th>Category</th>
        </tr>
        ${itemsList}
      </table>
      <p>Please restock these items as soon as possible.</p>
    `;

    // Send email
    await resend.emails.send({
      from: 'alerts@lorenzo-dry-cleaners.com',
      to: managerEmails,
      subject: `Low Stock Alert - ${branchId} - ${items.length} items`,
      html,
    });

    console.log(`Sent low stock alert to ${managerEmails.length} managers`);
  }
  ```

### Dashboard Notification

- [ ] **Create dashboard notification**
  - Add notification to Firestore:
    ```typescript
    // In checkLowStock function
    await db.collection('notifications').add({
      type: 'low_stock',
      branchId,
      itemCount: items.length,
      items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
    ```

- [ ] **Display notifications in UI**
  - Add notification bell icon in header
  - Show unread count badge
  - Click to view notifications
  - Mark as read functionality

### Testing & Deployment

- [ ] **Test locally with emulator**
  ```bash
  firebase emulators:start --only functions
  ```
  - Manually trigger function
  - Verify low stock items detected
  - Check email sent
  - Verify notification created

- [ ] **Deploy to production**
  ```bash
  cd functions
  npm install
  cd ..
  firebase deploy --only functions
  ```
  - Verify deployment succeeds
  - Check Firebase Console → Functions
  - Verify schedule is set correctly

- [ ] **Monitor execution**
  - Check function logs daily
  - Verify emails sending
  - Monitor email delivery rate
  - Check for errors

**Acceptance Criteria:**
- ✅ Function runs daily at 9 AM
- ✅ Detects low stock items
- ✅ Sends email to managers
- ✅ Creates dashboard notification
- ✅ No errors in function logs

---

## 📋 Milestone 9: Employee Management (12-14 hours)

**Week:** Week 4, Days 4-5
**Goal:** Build employee tracking with attendance and productivity metrics

### Employees Page Setup

- [ ] **Create employees page**
  - Create file: `app/(dashboard)/employees/page.tsx`
  - Add page header
  - Create tabs for:
    - [ ] All Employees
    - [ ] Attendance
    - [ ] Productivity

### Employee Table

- [ ] **Create EmployeeTable component**
  - Create file: `components/features/employees/EmployeeTable.tsx`
  - Fetch employees:
    ```typescript
    const { data: employees } = useQuery({
      queryKey: ['employees'],
      queryFn: async () => {
        const q = query(
          collection(db, 'users'),
          where('role', 'in', ['front_desk', 'workstation', 'driver', 'manager'])
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
    });
    ```
  - Display columns:
    - [ ] Name
    - [ ] Email
    - [ ] Phone
    - [ ] Role
    - [ ] Branch
    - [ ] Status (Active/Inactive)
    - [ ] Today's Status (Clocked In/Out)
    - [ ] Actions

### Add/Edit Employee

- [ ] **Create AddEmployeeModal component**
  - Create file: `components/features/employees/AddEmployeeModal.tsx`
  - Form fields:
    - [ ] Full Name (required)
    - [ ] Email (required)
    - [ ] Phone (required)
    - [ ] Role (dropdown: front_desk, workstation, driver, manager)
    - [ ] Branch (dropdown)
    - [ ] Status (toggle: Active/Inactive)
  - Use Firebase Auth to create user account
  - Save additional data in Firestore users collection

- [ ] **Implement employee creation**
  ```typescript
  const handleAddEmployee = async (data: EmployeeForm) => {
    try {
      // Create auth account (admin SDK required)
      // Or use Cloud Function to create user
      const createUserFunction = httpsCallable(functions, 'createEmployee');
      const result = await createUserFunction(data);

      toast.success('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };
  ```

### Clock In/Out System

- [ ] **Create ClockInOut component**
  - Create file: `components/features/employees/ClockInOut.tsx`
  - Display current time
  - Show current status (clocked in/out)
  - Large clock-in button
  - Large clock-out button

- [ ] **Implement clock-in**
  ```typescript
  const handleClockIn = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Check if already clocked in today
      const existingAttendance = await getDocs(
        query(
          collection(db, 'attendance'),
          where('employeeId', '==', user.uid),
          where('date', '==', today),
          where('clockOut', '==', null)
        )
      );

      if (!existingAttendance.empty) {
        toast.error('Already clocked in today');
        return;
      }

      const attendance: Attendance = {
        attendanceId: generateAttendanceId(),
        employeeId: user.uid,
        date: today,
        clockIn: serverTimestamp(),
        clockOut: null,
        hoursWorked: null,
      };

      await setDoc(doc(db, 'attendance', attendance.attendanceId), attendance);
      toast.success('Clocked in successfully!');
    } catch (error) {
      console.error('Error clocking in:', error);
      toast.error('Failed to clock in');
    }
  };
  ```

- [ ] **Implement clock-out**
  ```typescript
  const handleClockOut = async (attendanceId: string) => {
    try {
      const attendanceRef = doc(db, 'attendance', attendanceId);
      const attendanceDoc = await getDoc(attendanceRef);

      if (!attendanceDoc.exists()) {
        toast.error('No active clock-in found');
        return;
      }

      const clockInTime = attendanceDoc.data().clockIn.toDate();
      const clockOutTime = new Date();
      const hoursWorked = differenceInHours(clockOutTime, clockInTime);

      await updateDoc(attendanceRef, {
        clockOut: serverTimestamp(),
        hoursWorked,
      });

      toast.success(`Clocked out! Hours worked: ${hoursWorked.toFixed(1)}`);
    } catch (error) {
      console.error('Error clocking out:', error);
      toast.error('Failed to clock out');
    }
  };
  ```

### Attendance History

- [ ] **Create AttendanceHistory component**
  - Create file: `components/features/employees/AttendanceHistory.tsx`
  - Display calendar view
  - Show for each day:
    - [ ] Clock-in time
    - [ ] Clock-out time
    - [ ] Hours worked
    - [ ] Status (present/absent/late)

- [ ] **Implement calendar view**
  - Use date-fns for calendar logic
  - Color code days:
    - Green: Present
    - Red: Absent
    - Yellow: Late
    - Gray: Future/weekend

### Productivity Dashboard

- [ ] **Create ProductivityDashboard component**
  - Create file: `components/features/employees/ProductivityDashboard.tsx`
  - Fetch employee's orders:
    ```typescript
    const { data: employeeOrders } = useQuery({
      queryKey: ['employee-orders', employeeId, dateRange],
      queryFn: async () => {
        const q = query(
          collection(db, 'orders'),
          where('createdBy', '==', employeeId),
          where('createdAt', '>=', dateRange.start),
          where('createdAt', '<=', dateRange.end)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
    });
    ```

- [ ] **Calculate productivity metrics**
  ```typescript
  const metrics = {
    ordersProcessed: employeeOrders?.length || 0,
    totalRevenue: employeeOrders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0,
    averageOrderValue: totalRevenue / ordersProcessed || 0,
    averageProcessingTime: calculateAverageProcessingTime(employeeOrders),
  };
  ```

- [ ] **Create productivity charts**
  - Install recharts if not already installed
  - Create charts:
    - [ ] Orders per day (line chart)
    - [ ] Revenue per day (bar chart)
    - [ ] Service distribution (pie chart)

- [ ] **Implement charts**
  ```typescript
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="orders" stroke="#000" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
  ```

### Reports Generation

- [ ] **Create report generator**
  - Create file: `lib/employees/report-generator.ts`
  - Implement attendance report:
    ```typescript
    export async function generateAttendanceReport(
      employeeId: string,
      startDate: Date,
      endDate: Date
    ) {
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '>=', format(startDate, 'yyyy-MM-dd')),
        where('date', '<=', format(endDate, 'yyyy-MM-dd'))
      );

      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => doc.data());

      const totalDays = records.length;
      const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
      const averageHours = totalHours / totalDays;

      return {
        totalDays,
        totalHours,
        averageHours,
        records,
      };
    }
    ```

- [ ] **Implement productivity report**
  ```typescript
  export async function generateProductivityReport(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Fetch orders
    // Calculate metrics
    // Return report data
  }
  ```

- [ ] **Add export to CSV/PDF**
  - Export button for each report
  - Generate CSV using library or manual
  - Generate PDF using jsPDF

### Testing

- [ ] **Test employee management**
  - [ ] Add 10+ employees
  - [ ] Edit employee details
  - [ ] Activate/deactivate employees
  - [ ] Filter by role
  - [ ] Filter by branch
  - [ ] Search employees

- [ ] **Test attendance tracking**
  - [ ] Clock in 20+ times
  - [ ] Clock out correctly
  - [ ] Hours calculated accurately
  - [ ] Cannot clock in twice
  - [ ] Cannot clock out without clock in
  - [ ] Attendance history displays

- [ ] **Test productivity metrics**
  - [ ] Orders count correctly
  - [ ] Revenue calculates correctly
  - [ ] Charts display data
  - [ ] Date range filters work

- [ ] **Test reports**
  - [ ] Attendance report generates
  - [ ] Productivity report generates
  - [ ] Export to CSV works
  - [ ] Export to PDF works

**Acceptance Criteria:**
- ✅ Can add/edit employees
- ✅ Clock-in/out works correctly
- ✅ Hours calculated accurately
- ✅ Attendance history displays
- ✅ Productivity metrics accurate
- ✅ Charts visualize data
- ✅ Reports generate correctly

---

## 📋 Milestone 10: Testing & Quality Assurance (8-10 hours)

**Week:** End of Week 4
**Goal:** Comprehensive testing of all features

### Receipt PDF Testing

- [ ] **Functional testing**
  - [ ] PDF generates for 1 garment order
  - [ ] PDF generates for 10+ garment order
  - [ ] All service types display correctly
  - [ ] Company logo displays
  - [ ] Prices calculate correctly
  - [ ] Totals accurate
  - [ ] Customer details correct

- [ ] **Download testing**
  - [ ] Desktop Chrome
  - [ ] Desktop Firefox
  - [ ] Desktop Safari
  - [ ] Mobile Chrome (Android)
  - [ ] Mobile Safari (iOS)
  - [ ] Filename format correct

- [ ] **Email testing**
  - [ ] Send to Gmail
  - [ ] Send to Outlook
  - [ ] Send to Yahoo
  - [ ] Send to custom domain
  - [ ] Total: 10+ test emails
  - [ ] Delivery rate > 98%
  - [ ] PDF attachment opens

- [ ] **Print testing**
  - [ ] Print preview correct
  - [ ] No broken layouts
  - [ ] Buttons hidden in print

### Delivery System Testing

- [ ] **Route optimization testing**
  - [ ] 5 stops
  - [ ] 10 stops
  - [ ] 20 stops
  - [ ] 25 stops (max)
  - [ ] Routes are logical
  - [ ] Distance accurate
  - [ ] Time estimates realistic

- [ ] **Map visualization testing**
  - [ ] Map displays
  - [ ] Route shows correctly
  - [ ] Markers numbered
  - [ ] Polyline visible
  - [ ] All stops visible
  - [ ] Bounds fit correctly

- [ ] **Driver dashboard testing**
  - [ ] Test on Android phone
  - [ ] Test on iPhone
  - [ ] Navigation button works
  - [ ] Mark delivered works
  - [ ] Customer not home works
  - [ ] Real-time updates
  - [ ] Mobile UI responsive

### Inventory Testing

- [ ] **CRUD operations**
  - [ ] Add 50+ items
  - [ ] Edit items
  - [ ] Delete items
  - [ ] Search works
  - [ ] Filters work

- [ ] **Stock adjustments**
  - [ ] Add stock 20+ times
  - [ ] Remove stock 20+ times
  - [ ] Audit trail logs
  - [ ] Cannot go negative

- [ ] **Alerts testing**
  - [ ] Trigger low stock
  - [ ] Email sent
  - [ ] Dashboard badge shows
  - [ ] Cloud Function executes

### Employee Testing

- [ ] **Attendance testing**
  - [ ] Clock in works
  - [ ] Clock out works
  - [ ] Hours calculated
  - [ ] History displays
  - [ ] Cannot double clock-in

- [ ] **Productivity testing**
  - [ ] Orders tracked to employee
  - [ ] Metrics calculate
  - [ ] Charts display
  - [ ] Reports generate

### Cross-Browser Testing

- [ ] **Desktop browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Mobile browsers**
  - [ ] Chrome Android
  - [ ] Safari iOS
  - [ ] Samsung Internet

### Performance Testing

- [ ] **Page load times**
  - [ ] All pages < 2 seconds
  - [ ] No unnecessary re-renders
  - [ ] Images optimized

- [ ] **API performance**
  - [ ] Route optimization < 10 seconds
  - [ ] PDF generation < 2 seconds
  - [ ] Database queries optimized

- [ ] **Mobile performance**
  - [ ] Smooth scrolling
  - [ ] No lag on interactions
  - [ ] Battery efficient

### Accessibility Testing

- [ ] **Keyboard navigation**
  - [ ] All features accessible
  - [ ] Focus indicators visible
  - [ ] Tab order logical

- [ ] **Screen reader testing**
  - [ ] Semantic HTML
  - [ ] ARIA labels
  - [ ] Alt text for images

- [ ] **Color contrast**
  - [ ] Text readable
  - [ ] Buttons clear
  - [ ] Status indicators distinguishable

### Security Testing

- [ ] **Authentication**
  - [ ] Protected routes work
  - [ ] Unauthenticated users redirected
  - [ ] Role-based access enforced

- [ ] **Firestore rules**
  - [ ] Rules prevent unauthorized access
  - [ ] Drivers can only see their deliveries
  - [ ] Employees can only clock themselves
  - [ ] Audit logs immutable

- [ ] **API keys**
  - [ ] Keys not exposed in client
  - [ ] Keys have restrictions
  - [ ] Usage within limits

### Error Handling Testing

- [ ] **Network errors**
  - [ ] Offline functionality
  - [ ] Retry logic
  - [ ] User-friendly messages

- [ ] **Invalid data**
  - [ ] Form validation
  - [ ] Error messages clear
  - [ ] Cannot submit invalid data

- [ ] **Edge cases**
  - [ ] Empty lists
  - [ ] Null values
  - [ ] Very long text
  - [ ] Special characters

**Acceptance Criteria:**
- ✅ All features work as expected
- ✅ No critical bugs
- ✅ Performance targets met
- ✅ Mobile experience excellent
- ✅ Accessibility standards met
- ✅ Security verified

---

## 📋 Milestone 11: Deployment (2-4 hours)

**Week:** End of Week 4
**Goal:** Deploy all features to production

### Pre-Deployment Checklist

- [ ] **Code review**
  - [ ] All code committed
  - [ ] No console.logs
  - [ ] No commented code
  - [ ] No TODO comments
  - [ ] TypeScript errors resolved

- [ ] **Environment variables**
  - [ ] Production API keys set
  - [ ] Google Maps API key configured
  - [ ] Resend API key set
  - [ ] Firebase config correct

- [ ] **Database**
  - [ ] Firestore indexes deployed
  - [ ] Security rules updated
  - [ ] Test data cleaned

- [ ] **Testing**
  - [ ] All tests passing
  - [ ] E2E tests complete
  - [ ] Manual testing done

### Firestore Deployment

- [ ] **Deploy indexes**
  ```bash
  firebase deploy --only firestore:indexes
  ```
  - Verify deployment succeeds
  - Wait for indexes to build
  - Check Firebase Console

- [ ] **Deploy security rules**
  ```bash
  firebase deploy --only firestore:rules
  ```
  - Verify rules deployed
  - Test with production data

### Cloud Functions Deployment

- [ ] **Deploy functions**
  ```bash
  cd functions
  npm install
  npm run build
  cd ..
  firebase deploy --only functions
  ```
  - Verify all functions deployed
  - Check function logs
  - Test scheduled function

### Application Deployment

- [ ] **Build application**
  ```bash
  npm run build
  ```
  - Verify build succeeds
  - Check for warnings
  - Verify bundle size

- [ ] **Deploy to Vercel** (or Firebase Hosting)
  ```bash
  vercel --prod
  ```
  - Verify deployment
  - Check preview URL
  - Test production site

### Post-Deployment Verification

- [ ] **Smoke testing**
  - [ ] Homepage loads
  - [ ] Login works
  - [ ] POS page works
  - [ ] Deliveries page works
  - [ ] Inventory page works
  - [ ] Employees page works

- [ ] **Feature verification**
  - [ ] Receipt PDF generates
  - [ ] Email sends
  - [ ] Maps display
  - [ ] Route optimization works
  - [ ] Driver dashboard works
  - [ ] Inventory alerts work
  - [ ] Clock in/out works

- [ ] **Monitoring**
  - [ ] Check Sentry for errors
  - [ ] Monitor Google Cloud usage
  - [ ] Monitor Resend email delivery
  - [ ] Check Firebase quotas

### Documentation

- [ ] **Update documentation**
  - [ ] README.md
  - [ ] API documentation
  - [ ] User guides
  - [ ] Admin guides

- [ ] **Create training materials**
  - [ ] Video walkthroughs
  - [ ] Step-by-step guides
  - [ ] FAQ document

**Acceptance Criteria:**
- ✅ All services deployed
- ✅ Production site works
- ✅ No errors in logs
- ✅ Monitoring active
- ✅ Documentation updated

---

## 📋 Milestone 12: WhatsApp Integration (8-10 hours)

**Week:** Week 5, Days 1-2
**Goal:** Integrate WhatsApp business messaging via Wati.io for automated customer notifications

### Wati.io Setup

- [ ] **Create Wati.io account**
  - Go to https://wati.io
  - Sign up for business account
  - Complete verification process
  - Choose appropriate plan (Business or Growth)
  - Review pricing ($49-99/month recommended)

- [ ] **Link WhatsApp Business number**
  - Obtain dedicated WhatsApp Business number (+254...)
  - Verify phone number with WhatsApp
  - Link number to Wati.io account
  - Complete Meta Business verification
  - Set up WhatsApp Business profile:
    - Business name: "Lorenzo Dry Cleaners"
    - Description
    - Business category: "Laundry & Dry Cleaning"
    - Address and hours
    - Profile photo

- [ ] **Get Wati.io API credentials**
  - Navigate to API settings in Wati dashboard
  - Generate API key
  - Copy base URL
  - Store in environment variables:
    ```bash
    WATI_API_KEY=your_api_key_here
    WATI_BASE_URL=https://live-server-XXXX.wati.io
    ```

- [ ] **Install HTTP client**
  - Axios is already installed (verify in package.json)
  - Or use native fetch API
  - Create Wati service wrapper

### Message Templates

- [ ] **Create "Order Confirmation" template**
  - Template name: `order_confirmation`
  - Content:
    ```
    Hello {{customer_name}},

    Thank you for choosing Lorenzo Dry Cleaners! ✨

    Your order has been received.
    Order ID: {{order_id}}
    Total Amount: KES {{total_amount}}
    Estimated Completion: {{completion_date}}

    We'll notify you when your order is ready!

    Need help? Reply to this message.
    ```
  - Submit for WhatsApp approval

- [ ] **Create "Order Ready" template**
  - Template name: `order_ready`
  - Content:
    ```
    Good news {{customer_name}}! 🎉

    Your order {{order_id}} is ready for pickup/delivery!

    You can collect it at:
    {{branch_name}}
    {{branch_address}}

    Business Hours: Mon-Sat, 8AM-7PM

    See you soon!
    ```
  - Submit for WhatsApp approval

- [ ] **Create "Driver Dispatched" template**
  - Template name: `driver_dispatched`
  - Content:
    ```
    Hi {{customer_name}},

    Your order {{order_id}} is out for delivery! 🚗

    Driver: {{driver_name}}
    Driver Phone: {{driver_phone}}

    Estimated arrival: {{eta}}

    Please ensure someone is available to receive the order.
    ```
  - Submit for WhatsApp approval

- [ ] **Create "Driver Nearby" template**
  - Template name: `driver_nearby`
  - Content:
    ```
    {{customer_name}}, your driver is almost there! 📍

    Order {{order_id}} will arrive in approximately {{minutes}} minutes.

    Driver: {{driver_name}}
    Phone: {{driver_phone}}

    Please be ready to receive your order.
    ```
  - Submit for WhatsApp approval

- [ ] **Create "Order Delivered" template**
  - Template name: `order_delivered`
  - Content:
    ```
    Thank you {{customer_name}}! ✅

    Your order {{order_id}} has been delivered.

    We hope you're satisfied with our service!

    Rate your experience: {{feedback_link}}

    We look forward to serving you again!
    Lorenzo Dry Cleaners
    ```
  - Submit for WhatsApp approval

- [ ] **Create "Payment Reminder" template**
  - Template name: `payment_reminder`
  - Content:
    ```
    Hello {{customer_name}},

    Friendly reminder about your pending payment:

    Order ID: {{order_id}}
    Amount Due: KES {{amount_due}}
    Due Date: {{due_date}}

    Pay now: {{payment_link}}

    Questions? Reply to this message.

    Thank you!
    Lorenzo Dry Cleaners
    ```
  - Submit for WhatsApp approval

### Notification Service Implementation

- [ ] **Create Wati service file**
  - Create file: `lib/services/wati.ts`
  - Import axios or fetch
  - Create base configuration:
    ```typescript
    const WATI_BASE_URL = process.env.WATI_BASE_URL;
    const WATI_API_KEY = process.env.WATI_API_KEY;

    const watiClient = axios.create({
      baseURL: WATI_BASE_URL,
      headers: {
        'Authorization': `Bearer ${WATI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    ```

- [ ] **Implement message sending function**
  ```typescript
  export async function sendWhatsAppMessage(
    phoneNumber: string,
    templateName: string,
    parameters: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Format phone number (ensure +254 format)
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const response = await watiClient.post('/api/v1/sendTemplateMessage', {
        whatsappNumber: formattedPhone,
        template_name: templateName,
        broadcast_name: `${templateName}_${Date.now()}`,
        parameters,
      });

      console.log(`WhatsApp sent: ${templateName} to ${formattedPhone}`);
      return { success: true };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message',
      };
    }
  }
  ```

- [ ] **Create notification helper functions**
  ```typescript
  export async function sendOrderConfirmation(order: Order, customer: Customer) {
    return sendWhatsAppMessage(customer.phone, 'order_confirmation', {
      customer_name: customer.name,
      order_id: order.orderId,
      total_amount: order.totalAmount.toLocaleString(),
      completion_date: formatDate(order.estimatedCompletion),
    });
  }

  export async function sendOrderReady(order: Order, customer: Customer, branch: Branch) {
    return sendWhatsAppMessage(customer.phone, 'order_ready', {
      customer_name: customer.name,
      order_id: order.orderId,
      branch_name: branch.name,
      branch_address: branch.address,
    });
  }

  export async function sendDriverDispatched(
    order: Order,
    customer: Customer,
    driver: User,
    eta: string
  ) {
    return sendWhatsAppMessage(customer.phone, 'driver_dispatched', {
      customer_name: customer.name,
      order_id: order.orderId,
      driver_name: driver.name,
      driver_phone: driver.phone,
      eta,
    });
  }

  // ... similar functions for other templates
  ```

- [ ] **Implement notification queue system**
  - Create queue collection in Firestore:
    ```typescript
    interface NotificationQueue {
      queueId: string;
      type: 'whatsapp' | 'sms' | 'email';
      recipient: string;
      templateName: string;
      parameters: Record<string, string>;
      status: 'pending' | 'sent' | 'failed';
      attempts: number;
      createdAt: Timestamp;
      sentAt?: Timestamp;
      error?: string;
    }
    ```
  - Add notifications to queue instead of sending immediately
  - Create Cloud Function to process queue

- [ ] **Implement retry logic**
  - Retry failed messages up to 3 times
  - Exponential backoff (5min, 15min, 1hour)
  - Log all attempts
  - Mark as failed after 3 attempts

- [ ] **Create notification log**
  - Log all notification attempts in Firestore
  - Store success/failure status
  - Store error messages
  - Create admin view to see notification history

- [ ] **Add fallback to SMS**
  - If WhatsApp fails after retries, fallback to SMS
  - Use Africa's Talking SMS API
  - Simpler message format for SMS
  - Log fallback usage

### Automated Triggers

- [ ] **Trigger on order creation**
  - In `createOrder` function, add:
    ```typescript
    // After order is created
    const customer = await getCustomerById(order.customerId);
    await sendOrderConfirmation(order, customer);
    ```
  - Handle errors gracefully
  - Don't block order creation if notification fails

- [ ] **Trigger when order is ready**
  - In `updateOrderStatus` when status becomes 'ready':
    ```typescript
    if (status === 'ready') {
      const customer = await getCustomerById(order.customerId);
      const branch = await getBranchById(order.branchId);
      await sendOrderReady(order, customer, branch);
    }
    ```

- [ ] **Trigger when driver is dispatched**
  - When delivery batch is created:
    ```typescript
    // In createDeliveryBatch
    for (const orderId of batch.orders) {
      const order = await getOrderById(orderId);
      const customer = await getCustomerById(order.customerId);
      const driver = await getUserById(batch.driverId);
      const eta = calculateETA(order.deliveryAddress);
      await sendDriverDispatched(order, customer, driver, eta);
    }
    ```

- [ ] **Trigger when driver is nearby**
  - Create Cloud Function that monitors driver location
  - When driver is within 2km of delivery address:
    ```typescript
    const eta = '5 minutes';
    await sendWhatsAppMessage(customer.phone, 'driver_nearby', {
      customer_name: customer.name,
      order_id: order.orderId,
      minutes: '5',
      driver_name: driver.name,
      driver_phone: driver.phone,
    });
    ```
  - Only send once per delivery

- [ ] **Trigger on successful delivery**
  - When driver marks delivery as completed:
    ```typescript
    if (stopStatus === 'completed') {
      const order = await getOrderById(orderId);
      const customer = await getCustomerById(order.customerId);
      await sendWhatsAppMessage(customer.phone, 'order_delivered', {
        customer_name: customer.name,
        order_id: order.orderId,
        feedback_link: `https://lorenzo.com/feedback/${order.orderId}`,
      });
    }
    ```

- [ ] **Trigger payment reminders**
  - Create scheduled Cloud Function (runs daily at 9 AM)
  - Find orders with unpaid balance > 7 days old
  - Send payment reminder
  - Track reminder count (max 3 reminders)

### Cloud Function Triggers

- [ ] **Create notification processor function**
  - Create file: `functions/src/notifications/processQueue.ts`
  - Schedule to run every 5 minutes
  - Process pending notifications from queue
  - Update notification status
  - Implement retry logic

- [ ] **Create driver proximity detector**
  - Listen to driver location updates
  - Calculate distance to next delivery stop
  - Trigger "driver nearby" notification at 2km
  - Mark notification as sent to avoid duplicates

### Testing

- [ ] **Test template creation**
  - All 6 templates created in Wati dashboard
  - All templates approved by WhatsApp
  - Template variables correctly mapped

- [ ] **Test message sending**
  - Send test message for each template
  - Verify message received on WhatsApp
  - Verify formatting is correct
  - Test with 10+ different phone numbers

- [ ] **Test automated triggers**
  - Create order → verify confirmation sent
  - Mark order ready → verify ready notification
  - Create delivery → verify driver dispatch notification
  - Complete delivery → verify delivery confirmation
  - Test payment reminder (manually trigger)

- [ ] **Test error handling**
  - Invalid phone number
  - Wati API down
  - Template not found
  - WhatsApp number blocked
  - Rate limiting

- [ ] **Test queue system**
  - Queue processes messages
  - Retries work correctly
  - Failed messages logged
  - SMS fallback works

**Acceptance Criteria:**
- ✅ Wati.io account set up and configured
- ✅ WhatsApp Business number linked
- ✅ All 6 message templates created and approved
- ✅ Message sending function works
- ✅ Notifications sent on order creation
- ✅ Notifications sent when order ready
- ✅ Notifications sent on driver dispatch
- ✅ Notifications sent on delivery
- ✅ Payment reminders work
- ✅ Queue system processes messages
- ✅ Retry logic works
- ✅ SMS fallback works
- ✅ All notifications logged
- ✅ 100% delivery rate achieved

---

## 📋 Milestone 13: AI Features (10-12 hours)

**Week:** Week 5, Days 3-4
**Goal:** Integrate OpenAI for intelligent features (completion time estimation, analytics insights, report summarization)

### OpenAI Setup

- [ ] **Create OpenAI account**
  - Go to https://platform.openai.com
  - Sign up for account
  - Complete verification
  - Add payment method

- [ ] **Get API key**
  - Navigate to API keys section
  - Create new API key
  - Copy key immediately
  - Store in environment variables:
    ```bash
    OPENAI_API_KEY=sk-...your_key_here
    ```

- [ ] **Set usage limits**
  - Go to Usage limits in settings
  - Set monthly budget: $50
  - Set up email alerts at $25 and $40
  - Monitor usage regularly

- [ ] **Install OpenAI SDK**
  ```bash
  npm install openai
  ```

- [ ] **Create OpenAI service file**
  - Create file: `lib/services/openai.ts`
  - Initialize client:
    ```typescript
    import OpenAI from 'openai';

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    export default openai;
    ```

### Order Completion Time Estimation

- [ ] **Collect historical data**
  - Query last 100 completed orders
  - Extract features:
    - Number of garments
    - Service types (wash, dry clean, iron, etc.)
    - Express service (yes/no)
    - Day of week
    - Time of day
    - Actual completion time
  - Export to JSON for training

- [ ] **Create estimation function**
  ```typescript
  export async function estimateCompletionTime(order: {
    garmentsCount: number;
    services: string[];
    isExpress: boolean;
    createdAt: Date;
  }): Promise<{ hours: number; confidence: number }> {
    const prompt = `Based on historical dry cleaning data, estimate completion time:

    Order Details:
    - Garments: ${order.garmentsCount}
    - Services: ${order.services.join(', ')}
    - Express: ${order.isExpress ? 'Yes' : 'No'}
    - Day: ${format(order.createdAt, 'EEEE')}
    - Time: ${format(order.createdAt, 'HH:mm')}

    Historical averages:
    - Standard wash: 24 hours
    - Express wash: 4 hours
    - Dry clean: 48 hours
    - Express dry clean: 8 hours

    Provide completion time in hours and confidence level (0-1).
    Respond in JSON format: { "hours": number, "confidence": number }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  }
  ```

- [ ] **Integrate into order creation**
  - Call estimation function when creating order
  - Display estimated completion to staff
  - Show confidence level
  - Allow manual override
  - Store both AI estimate and final estimate

- [ ] **Track accuracy**
  - Compare AI estimates to actual completion times
  - Calculate mean absolute error
  - Display accuracy metrics in admin dashboard
  - Use feedback to improve prompts

### Analytics Insights Dashboard

- [ ] **Create insights generation function**
  ```typescript
  export async function generateWeeklyInsights(
    orders: Order[],
    revenue: number,
    customerCount: number
  ): Promise<string[]> {
    const prompt = `Analyze this week's dry cleaning business data and provide 5 actionable insights:

    Data:
    - Total Orders: ${orders.length}
    - Revenue: KES ${revenue.toLocaleString()}
    - New Customers: ${customerCount}
    - Average Order Value: KES ${(revenue / orders.length).toFixed(0)}
    - Busiest Day: ${findBusiestDay(orders)}
    - Most Common Services: ${findTopServices(orders)}

    Provide insights in this format:
    1. [Insight about trend]
    2. [Recommendation for improvement]
    3. [Opportunity identified]
    4. [Risk or concern]
    5. [Prediction for next week]

    Be specific and actionable. Focus on practical business decisions.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const insights = response.choices[0].message.content
      .split('\n')
      .filter(line => line.match(/^\d+\./));

    return insights;
  }
  ```

- [ ] **Create insights dashboard**
  - Create page: `app/(dashboard)/insights/page.tsx`
  - Fetch weekly/monthly data
  - Generate AI insights
  - Display insights with icons
  - Add "Generate New Insights" button
  - Show generation timestamp
  - Allow saving favorite insights

- [ ] **Implement trend prediction**
  - Predict next week's order volume
  - Predict revenue forecast
  - Identify growing/declining services
  - Suggest optimal staffing levels

- [ ] **Customer churn risk identification**
  - Identify customers who haven't ordered in 30+ days
  - Calculate churn probability using AI
  - Suggest retention strategies
  - Generate personalized win-back messages

### Report Summarization

- [ ] **Create report summary function**
  ```typescript
  export async function summarizeReport(
    reportData: any,
    reportType: 'daily' | 'weekly' | 'monthly'
  ): Promise<string> {
    const prompt = `Summarize this ${reportType} report in 3-4 sentences for a business owner:

    ${JSON.stringify(reportData, null, 2)}

    Focus on:
    1. Overall performance (good/bad/neutral)
    2. Key highlights (top metrics)
    3. Areas of concern (if any)
    4. Actionable recommendation

    Write in a professional but friendly tone.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0].message.content;
  }
  ```

- [ ] **Add summaries to existing reports**
  - Daily revenue report
  - Weekly performance report
  - Monthly business review
  - Employee productivity report
  - Inventory usage report

- [ ] **Generate executive summaries**
  - One-page summary of monthly performance
  - Highlight top 3 achievements
  - Highlight top 3 concerns
  - Recommended actions for next month
  - Export as PDF

### Customer Engagement Features

- [ ] **Analyze customer behavior**
  ```typescript
  export async function analyzeCustomerBehavior(customer: Customer, orders: Order[]) {
    const prompt = `Analyze this customer's behavior and provide insights:

    Customer: ${customer.name}
    Total Orders: ${orders.length}
    Total Spent: KES ${orders.reduce((sum, o) => sum + o.totalAmount, 0)}
    Average Order: KES ${orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length}
    Frequency: ${calculateFrequency(orders)}
    Last Order: ${formatDate(orders[0].createdAt)}
    Preferred Services: ${findPreferredServices(orders)}

    Provide:
    1. Customer segment (VIP, Regular, Occasional, At-Risk)
    2. Lifetime value prediction (1-2 years)
    3. Recommended promotion or offer
    4. Next likely order date

    Respond in JSON format.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }
  ```

- [ ] **Predict customer lifetime value**
  - Use AI to estimate future revenue from customer
  - Display CLV in customer profile
  - Identify high-value customers
  - Suggest retention strategies

- [ ] **Generate personalized promotions**
  - Analyze customer preferences
  - Suggest tailored discounts
  - Generate personalized WhatsApp message
  - Track promotion effectiveness

- [ ] **Recommend retention strategies**
  - Identify at-risk customers (no order in 60+ days)
  - Generate personalized win-back offer
  - Suggest optimal contact timing
  - Draft re-engagement message

### Testing & Optimization

- [ ] **Test all AI functions**
  - [ ] Completion time estimation (20+ orders)
  - [ ] Insights generation (5+ reports)
  - [ ] Report summarization (all report types)
  - [ ] Customer analysis (10+ customers)
  - [ ] Verify JSON response parsing
  - [ ] Test error handling

- [ ] **Monitor API costs**
  - Track tokens used per request
  - Calculate cost per feature
  - Set up cost alerts
  - Optimize prompts to reduce tokens

- [ ] **Optimize prompts**
  - A/B test different prompt formats
  - Reduce token usage where possible
  - Improve response accuracy
  - Standardize JSON output formats

- [ ] **Cache AI responses**
  - Cache insights for 24 hours
  - Cache customer analysis for 7 days
  - Invalidate cache on new data
  - Show cached indicator in UI

**Acceptance Criteria:**
- ✅ OpenAI API integrated and working
- ✅ Completion time estimation accurate (< 20% error)
- ✅ Weekly insights generated automatically
- ✅ Report summaries helpful and accurate
- ✅ Customer behavior analysis working
- ✅ CLV predictions reasonable
- ✅ Personalized promotions generated
- ✅ API costs < $50/month
- ✅ All responses cached appropriately
- ✅ Error handling robust
- ✅ Admin can monitor AI usage
- ✅ AI features improve business decisions

---

## 📋 Milestone 14: Final Integration & Testing (4-6 hours)

**Week:** Week 5, Day 5
**Goal:** Integration testing of all new features and final QA before deployment

### Integration Testing

- [ ] **Test complete POS workflow with new features**
  - Create order with AI time estimation
  - Verify WhatsApp confirmation sent
  - Check pricing calculations
  - Process payment
  - Verify receipt generated
  - Check all integrations work together

- [ ] **Test delivery workflow end-to-end**
  - Create delivery batch
  - Verify WhatsApp driver dispatch sent
  - Driver navigates route
  - Driver marks deliveries complete
  - Verify WhatsApp delivery confirmations
  - Check all statuses updated

- [ ] **Test AI features**
  - Generate weekly insights
  - Summarize multiple reports
  - Analyze customer behavior
  - Verify accuracy and usefulness
  - Test with real business data

- [ ] **Test WhatsApp notifications**
  - Trigger all 6 notification types
  - Verify delivery on actual phones
  - Check formatting on different devices
  - Test retry logic with failures
  - Verify SMS fallback

### Cross-Feature Testing

- [ ] **Test order flow with all integrations**
  - POS order creation
  - AI estimates completion time
  - WhatsApp confirmation sent
  - Order moves through pipeline
  - Status updates trigger notifications
  - Receipt emailed
  - Inventory deducted
  - Analytics updated

- [ ] **Test delivery with all integrations**
  - Orders marked ready
  - WhatsApp ready notification
  - Delivery batch created with route optimization
  - WhatsApp driver dispatch notification
  - Driver nearby notification
  - Delivery completed
  - WhatsApp delivery confirmation
  - Customer feedback request

- [ ] **Test reporting with AI**
  - Generate daily/weekly/monthly reports
  - AI summarizes each report
  - Insights generated
  - Export reports as PDF
  - Email reports to stakeholders

### Performance Testing

- [ ] **Load testing**
  - Create 50 orders simultaneously
  - Create 10 delivery batches
  - Generate 20 reports
  - Verify no performance degradation
  - Check database query performance

- [ ] **AI performance**
  - Measure response times for estimates
  - Measure insight generation time
  - Verify caching works
  - Monitor API costs
  - Ensure < 5 second response times

- [ ] **WhatsApp performance**
  - Send 100 notifications
  - Verify delivery rate > 95%
  - Check queue processing time
  - Monitor retry success rate

### Final QA Checklist

- [ ] **All P0 tasks complete**
  - POS page working
  - Receipts generating
  - Deliveries optimizing
  - Inventory tracking
  - Employee management
  - WhatsApp notifications
  - AI features

- [ ] **All integrations tested**
  - Payment processing
  - Google Maps
  - Resend (email)
  - Wati.io (WhatsApp)
  - OpenAI
  - Firebase services

- [ ] **Documentation complete**
  - SETUP_GUIDE.md updated
  - API documentation current
  - User guides created
  - Training materials ready

- [ ] **No critical bugs**
  - Zero console errors
  - No data loss scenarios
  - No security vulnerabilities
  - All error handling working

**Acceptance Criteria:**
- ✅ All features integrated smoothly
- ✅ No conflicts between features
- ✅ Performance meets targets
- ✅ All notifications working
- ✅ AI features helpful
- ✅ Ready for deployment
- ✅ User acceptance approved

---

## 📝 Daily Routine

### Morning (9:00 AM)
- [ ] Post standup in WhatsApp:
  ```
  Yesterday: [what you completed]
  Today: [what you'll work on]
  Blockers: [any issues] or "None"
  ```
- [ ] Pull latest changes: `git pull origin feature/milestone-3-operations`
- [ ] Review GitHub notifications
- [ ] Check milestone progress

### During Day
- [ ] Code and test features
- [ ] Commit frequently with descriptive messages
- [ ] Push changes regularly
- [ ] Ask questions in WhatsApp if stuck
- [ ] Update task checklist

### End of Day (5:00 PM)
- [ ] Push all changes to GitHub
- [ ] Update task status
- [ ] Document any blockers
- [ ] Plan next day's work

---

## 🔄 Git Workflow

### Start New Feature
```bash
git checkout feature/milestone-3-operations
git pull
git checkout -b feature/milestone-3-operations/receipt-pdf
```

### Work and Commit
```bash
git add .
git commit -m "feat(receipts): implement PDF generation"
git push origin feature/milestone-3-operations/receipt-pdf
```

### Merge to Main Branch
```bash
git checkout feature/milestone-3-operations
git merge feature/milestone-3-operations/receipt-pdf
git push origin feature/milestone-3-operations
```

### Create Pull Request
- Go to GitHub repository
- Click "Pull Requests" → "New Pull Request"
- Base: `main` ← Compare: `feature/milestone-3-operations`
- Add description and screenshots
- Request review
- Wait for approval

---

## 🆘 Troubleshooting

### Google Maps Issues
- **Map not displaying:** Check API key, billing enabled
- **Geocoding fails:** Check address format, API limits
- **Route optimization slow:** Reduce number of waypoints

### Email Issues
- **Emails not sending:** Check Resend API key, domain verified
- **Emails in spam:** Configure SPF/DKIM records
- **Attachment too large:** Compress PDF

### Firebase Issues
- **Permission denied:** Check Firestore rules
- **Index required:** Deploy firestore.indexes.json
- **Quota exceeded:** Upgrade plan or optimize queries

### Development Issues
- **TypeScript errors:** Run `npm run type-check`
- **Build fails:** Check for console.logs, fix linting
- **Tests failing:** Run `npm test` and fix errors

---

## 📚 Resources

### Documentation
- [JERRY_PLANNING.md](./JERRY_PLANNING.md) - Architecture and tools
- [PLANNING.md](../PLANNING.md) - Overall project plan
- [CLAUDE.md](../CLAUDE.md) - Development guidelines

### External Resources
- [Google Maps API](https://developers.google.com/maps)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Resend Documentation](https://resend.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Recharts Documentation](https://recharts.org/)

---

**Last Updated:** October 19, 2025
**Status:** Ready to Start
**Total Tasks:** 500+

**Good luck, Jerry! Let's build something amazing! 🚀**
