# Jerry's Milestone 3 Operations - Planning Document

**Developer:** Jerry Nduriri
**Role:** POS & Product Manager, Operations Specialist
**Branch:** `feature/milestone-3-operations`
**Timeline:** 3 Weeks (Weeks 2-4)
**Focus Areas:** Receipt PDF, Delivery Management, Inventory, Employee Tracking

---

## 🎯 Vision & Objectives

### Project Vision
To complete the operational backbone of Lorenzo Dry Cleaners Management System by implementing critical business operations features including automated receipt generation, intelligent delivery route optimization, comprehensive inventory management, and employee productivity tracking.

### Primary Objectives
1. **Receipt Automation**: Enable PDF generation and email delivery of receipts for all completed orders
2. **Delivery Optimization**: Reduce delivery time and fuel costs through AI-powered route optimization
3. **Inventory Intelligence**: Prevent stock-outs through automated tracking and alerts
4. **Employee Accountability**: Track attendance, productivity, and performance metrics
5. **Operational Efficiency**: Streamline manual processes and reduce administrative overhead

### Success Criteria
- **Receipt PDF**: Generate and download receipts for 100% of paid orders
- **Delivery Routes**: Reduce average delivery time by 30% through optimization
- **Inventory Alerts**: Zero stock-outs for critical supplies
- **Employee Tracking**: 100% attendance capture and productivity metrics
- **System Performance**: All features work seamlessly on mobile devices

---

## 🏗️ System Architecture

### High-Level Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     JERRY'S FEATURE MODULES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Receipt    │  │  Delivery    │  │  Inventory   │          │
│  │     PDF      │  │ Optimization │  │ Management   │          │
│  │  Generator   │  │   & Routes   │  │   & Alerts   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Employee   │  │    Driver    │  │   Reports    │          │
│  │   Tracking   │  │  Dashboard   │  │   & Email    │          │
│  │ & Attendance │  │   (Mobile)   │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ API Calls / Firebase Integration
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   INTEGRATION LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Google Maps Platform                                    │   │
│  │  - Directions API (route optimization)                   │   │
│  │  - Distance Matrix API (time/distance calculations)      │   │
│  │  - Geocoding API (address → coordinates)                 │   │
│  │  - Maps JavaScript API (visualization)                   │   │
│  │  - Places API (address autocomplete)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Document Generation                                     │   │
│  │  - jsPDF (client-side PDF generation)                    │   │
│  │  - PDF templates for receipts, order sheets, reports     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Email Service (Resend)                                  │   │
│  │  - Transactional emails                                  │   │
│  │  - Receipt delivery                                      │   │
│  │  - Report distribution                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Firebase Services                                       │   │
│  │  - Firestore (data storage)                              │   │
│  │  - Cloud Functions (scheduled jobs, triggers)            │   │
│  │  - Storage (PDF storage)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Feature-Specific Architecture

#### 1. Receipt PDF System
```
Order Payment Complete
    ↓
Generate Receipt Data
    ↓
jsPDF Creates PDF Document
    ├─→ Download to User (Browser)
    ├─→ Upload to Firebase Storage
    └─→ Send via Email (Resend API)
```

**Components:**
- `lib/receipts/pdf-generator.ts` - Core PDF generation logic
- `lib/receipts/receipt-template.ts` - Receipt template formatting
- `components/features/pos/ReceiptPreview.tsx` - UI integration
- `lib/email/receipt-mailer.ts` - Email delivery service

#### 2. Delivery Route Optimization System
```
Manager Selects Ready Orders
    ↓
Extract Delivery Addresses
    ↓
Geocoding API: Address → Coordinates
    ↓
Directions API: Calculate Optimal Route (TSP)
    ↓
Generate Delivery Batch with Waypoints
    ↓
Assign to Driver
    ↓
Driver Mobile Interface
    ↓
Real-time Status Updates
    ↓
Completion & COD Collection
```

**Components:**
- `app/(dashboard)/deliveries/page.tsx` - Delivery batch creation UI
- `lib/routing/route-optimizer.ts` - Google Maps API integration
- `lib/routing/geocoding-service.ts` - Address geocoding
- `app/(dashboard)/drivers/page.tsx` - Driver mobile dashboard
- `components/features/driver/Map.tsx` - Map visualization
- `components/features/driver/RouteList.tsx` - Route stops display
- `components/features/driver/NavigationButton.tsx` - Google Maps deep link

#### 3. Inventory Management System
```
Inventory Item Stock Level
    ↓
Check Against Reorder Level
    ↓
If Low: Trigger Alert
    ↓
    ├─→ Dashboard Notification
    ├─→ Email to Manager
    └─→ Create Reorder Task
```

**Components:**
- `app/(dashboard)/inventory/page.tsx` - Inventory dashboard
- `components/features/inventory/InventoryTable.tsx` - Item list
- `components/features/inventory/StockAdjustmentModal.tsx` - Stock updates
- `components/features/inventory/LowStockAlert.tsx` - Alert component
- `lib/inventory/stock-manager.ts` - Stock calculation logic
- `functions/scheduledJobs/checkLowStock.ts` - Daily cron job

#### 4. Employee Management System
```
Employee Clock-In
    ↓
Record Timestamp in Firestore
    ↓
Track Work Duration
    ↓
Clock-Out
    ↓
Calculate Hours Worked
    ↓
Generate Productivity Metrics
    ↓
Display in Reports
```

**Components:**
- `app/(dashboard)/employees/page.tsx` - Employee management UI
- `components/features/employees/EmployeeTable.tsx` - Employee list
- `components/features/employees/ClockInOut.tsx` - Attendance tracking
- `components/features/employees/ProductivityDashboard.tsx` - Metrics display
- `lib/employees/attendance-tracker.ts` - Attendance logic
- `lib/employees/productivity-calculator.ts` - Metrics calculation

---

## 🛠️ Technology Stack

### Core Technologies (Already in Use)

#### Frontend
- **Next.js 15.0+** - React framework
- **React 19.0+** - UI library
- **TypeScript 5.0+** - Type safety
- **Tailwind CSS 4.0+** - Styling
- **shadcn/ui** - Component library

#### Backend
- **Firebase Firestore** - Database
- **Firebase Cloud Functions** - Serverless functions
- **Firebase Storage** - File storage
- **Firebase Authentication** - User auth

### New Libraries Required for Jerry's Features

#### PDF Generation
```bash
npm install jspdf
npm install @types/jspdf --save-dev
```

**Purpose:** Client-side PDF generation for receipts and reports

**Usage:**
```typescript
import jsPDF from 'jspdf';

const doc = new jsPDF();
doc.text('Lorenzo Dry Cleaners', 20, 20);
doc.save('receipt.pdf');
```

**Documentation:** https://github.com/parallax/jsPDF

#### Google Maps Integration
```bash
npm install @react-google-maps/api
npm install @googlemaps/google-maps-services-js
npm install @types/google.maps --save-dev
```

**Purpose:** Map visualization and route optimization

**Usage:**
```typescript
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

<LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
  <GoogleMap center={center} zoom={12}>
    <Marker position={position} />
  </GoogleMap>
</LoadScript>
```

**Documentation:** https://react-google-maps-api-docs.netlify.app/

#### Date Handling
```bash
npm install date-fns
```

**Purpose:** Date formatting and manipulation for reports and schedules

**Usage:**
```typescript
import { format, addDays, differenceInHours } from 'date-fns';

const formattedDate = format(new Date(), 'PPP');
const workHours = differenceInHours(clockOut, clockIn);
```

**Documentation:** https://date-fns.org/

#### Charts & Visualizations
```bash
npm install recharts
```

**Purpose:** Productivity charts and inventory analytics

**Usage:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart data={productivityData}>
  <Line type="monotone" dataKey="ordersProcessed" stroke="#000" />
</LineChart>
```

**Documentation:** https://recharts.org/

#### Email Service (Already Available)
**Resend** is already configured in the project.

**Usage:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'receipts@lorenzo-dry-cleaners.com',
  to: customer.email,
  subject: 'Your Receipt',
  attachments: [{ filename: 'receipt.pdf', content: pdfBuffer }],
});
```

---

## 📦 Required Tools & API Keys

### 1. Google Cloud Platform (Maps APIs) ⭐ CRITICAL

**Account Required:** Google Cloud account (can use existing Firebase account)

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project or create new project
3. Enable Billing (required for all Maps APIs)
4. Navigate to **APIs & Services** → **Library**
5. Enable the following APIs:
   - ✅ **Maps JavaScript API** (map visualization)
   - ✅ **Directions API** (route optimization)
   - ✅ **Distance Matrix API** (time/distance calculations)
   - ✅ **Geocoding API** (address → coordinates)
   - ✅ **Places API** (address autocomplete - optional)
6. Navigate to **APIs & Services** → **Credentials**
7. Create API Key
8. Set API Key Restrictions:
   - **Application restrictions:** HTTP referrers
   - **Website restrictions:**
     - `http://localhost:3000/*` (development)
     - `https://your-domain.com/*` (production)
   - **API restrictions:** Restrict to the 5 APIs above

**Environment Variables:**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your_key_here
```

**Pricing (Pay-as-you-go):**
- **Free Tier:** $200/month credit (covers ~40,000 requests)
- **Directions API:** $5 per 1,000 requests
- **Distance Matrix API:** $5 per 1,000 elements
- **Geocoding API:** $5 per 1,000 requests
- **Maps JavaScript API:** $7 per 1,000 loads
- **Estimated Monthly Cost:** $20-80 (depending on delivery volume)

**Documentation:**
- [Google Maps Platform Overview](https://developers.google.com/maps/documentation)
- [Directions API Guide](https://developers.google.com/maps/documentation/directions)
- [Distance Matrix API Guide](https://developers.google.com/maps/documentation/distance-matrix)
- [Geocoding API Guide](https://developers.google.com/maps/documentation/geocoding)

**Testing Checklist:**
- [ ] API key created
- [ ] All 5 APIs enabled
- [ ] Billing enabled
- [ ] API restrictions configured
- [ ] Test geocoding request works
- [ ] Test directions request works
- [ ] Map displays in browser

---

### 2. Resend (Email Service) ⭐ ALREADY CONFIGURED

**Account Status:** ✅ Already set up in project

**Verification Needed:**
- [ ] Verify API key is in `.env.local`
- [ ] Verify domain is configured (lorenzo-dry-cleaners.com)
- [ ] Test email sending works

**Environment Variables:**
```bash
RESEND_API_KEY=re_...your_key_here
```

**Pricing:**
- **Free Tier:** 3,000 emails/month
- **Pro Plan:** $20/month (50,000 emails/month)

**Usage for Receipts:**
```typescript
await resend.emails.send({
  from: 'receipts@lorenzo-dry-cleaners.com',
  to: customer.email,
  subject: `Receipt for Order ${orderId}`,
  html: '<p>Thank you for your order!</p>',
  attachments: [{
    filename: `receipt-${orderId}.pdf`,
    content: pdfBuffer,
  }],
});
```

**Documentation:** https://resend.com/docs

---

### 3. Firebase Cloud Functions (Scheduled Jobs) ⭐ ALREADY CONFIGURED

**Account Status:** ✅ Firebase project already exists

**Required for:**
- Daily low stock inventory alerts
- Scheduled reports
- Cleanup jobs

**Setup:**
```bash
# Install Firebase Functions dependencies
cd functions
npm install firebase-functions firebase-admin
```

**Example Scheduled Function:**
```typescript
// functions/src/scheduledJobs/checkLowStock.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const checkLowStock = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    const snapshot = await admin.firestore().collection('inventory').get();

    const lowStockItems = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.quantity < data.reorderLevel;
    });

    if (lowStockItems.length > 0) {
      // Send email alert to manager
      // Create dashboard notification
    }
  });
```

**Deploy:**
```bash
firebase deploy --only functions
```

**Pricing:**
- **Invocations:** 2M/month free, then $0.40 per million
- **Compute Time:** 400,000 GB-seconds/month free
- **Network:** 5GB/month free
- **Estimated Cost:** $5-15/month

---

### 4. Development Tools

#### VS Code Extensions (Recommended)
```
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Firebase
- TypeScript
- Path Intellisense
- Auto Rename Tag
- GitLens
- REST Client (for API testing)
```

#### Browser DevTools
- **Chrome DevTools** - Primary debugging
- **React Developer Tools** - Component inspection
- **Firebase DevTools** - Firestore inspection

#### Testing Tools
- **Postman** or **Thunder Client** - API testing
- **Chrome Mobile Emulator** - Mobile testing (especially for driver dashboard)
- **Lighthouse** - Performance testing

---

## 📋 Database Schema Extensions

### New Firestore Collections

#### 1. `deliveries` Collection
```typescript
interface Delivery {
  deliveryId: string;              // Auto-generated ID
  driverId: string;                // User ID of assigned driver
  orders: string[];                // Array of order IDs
  route: {
    optimized: boolean;            // Whether route was optimized
    stops: DeliveryStop[];         // Ordered list of stops
    distance: number;              // Total distance in meters
    estimatedDuration: number;     // Total time in seconds
    polyline?: string;             // Encoded route polyline
  };
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Timestamp;           // When driver started
  endTime?: Timestamp;             // When driver completed
  createdAt: Timestamp;
  createdBy: string;               // Manager who created batch
}

interface DeliveryStop {
  orderId: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sequence: number;                // Order in route (1, 2, 3...)
  status: 'pending' | 'completed' | 'failed';
  timestamp?: Timestamp;           // When marked as completed/failed
  notes?: string;                  // Driver notes
}
```

#### 2. `inventory` Collection
```typescript
interface InventoryItem {
  itemId: string;                  // Auto-generated ID
  branchId: string;                // Branch reference
  name: string;                    // Item name (e.g., "Detergent - Tide")
  category: string;                // Category (detergents, softeners, etc.)
  unit: string;                    // Unit of measurement (kg, liters, pieces)
  quantity: number;                // Current quantity
  reorderLevel: number;            // Minimum quantity before alert
  costPerUnit?: number;            // Cost in KES
  supplier?: string;               // Supplier name
  lastRestocked: Timestamp;        // Last restock date
  expiryDate?: Timestamp;          // Expiry date (if applicable)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 3. `inventory_logs` Collection
```typescript
interface InventoryLog {
  logId: string;                   // Auto-generated ID
  itemId: string;                  // Reference to inventory item
  type: 'restock' | 'usage';       // Type of adjustment
  oldQuantity: number;             // Quantity before adjustment
  newQuantity: number;             // Quantity after adjustment
  amount: number;                  // Amount added or removed
  reason?: string;                 // Reason for adjustment
  userId: string;                  // User who made adjustment
  timestamp: Timestamp;
}
```

#### 4. `attendance` Collection
```typescript
interface Attendance {
  attendanceId: string;            // Auto-generated ID
  employeeId: string;              // User ID
  date: string;                    // Date in YYYY-MM-DD format
  clockIn: Timestamp;              // Clock-in time
  clockOut?: Timestamp;            // Clock-out time (null if still clocked in)
  hoursWorked?: number;            // Calculated hours
  breakTime?: number;              // Break time in minutes
  notes?: string;                  // Manager notes
}
```

### Firestore Indexes Required

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

**Deploy Indexes:**
```bash
firebase deploy --only firestore:indexes
```

---

## 🔐 Security Considerations

### Firestore Security Rules Updates

```javascript
// Add to firestore.rules

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

### API Key Security

**Google Maps API Key:**
- ✅ Set HTTP referrer restrictions
- ✅ Restrict to specific APIs only
- ✅ Monitor usage in Google Cloud Console
- ✅ Set daily quota limits to prevent abuse

**Resend API Key:**
- ✅ Never expose in client-side code
- ✅ Only use in server-side functions or API routes
- ✅ Rotate keys every 90 days

---

## 📊 Implementation Roadmap

### Week 2: Receipt PDF & Google Maps Setup (16-20 hours)

#### Days 1-2: Receipt PDF Generation (10-12 hours)
**Files to Create:**
- `lib/receipts/pdf-generator.ts`
- `lib/receipts/receipt-template.ts`
- `lib/email/receipt-mailer.ts`

**Tasks:**
- [ ] Install jsPDF: `npm install jspdf @types/jspdf`
- [ ] Create PDF generator function
- [ ] Design receipt template (company header, order details, garment list, total)
- [ ] Add company logo to PDF
- [ ] Implement download functionality
- [ ] Integrate with ReceiptPreview component
- [ ] Test with various order types (1 garment, 10+ garments, different services)
- [ ] Implement email sending via Resend
- [ ] Test email delivery to 5+ addresses
- [ ] Add print functionality (window.print())
- [ ] Mobile responsiveness testing

**Acceptance Criteria:**
- ✅ PDF generates for any order
- ✅ PDF includes all order details accurately
- ✅ Download button works on desktop and mobile
- ✅ Email delivery works
- ✅ Print preview displays correctly

#### Days 3-4: Google Maps Setup (6-8 hours)
**Files to Create:**
- `components/features/driver/Map.tsx`
- `lib/maps/geocoding-service.ts`

**Tasks:**
- [ ] Create Google Cloud account (if not exists)
- [ ] Enable billing
- [ ] Enable required Maps APIs (5 APIs)
- [ ] Create API key with restrictions
- [ ] Add API key to `.env.local`
- [ ] Install Google Maps library: `npm install @react-google-maps/api`
- [ ] Create Map component
- [ ] Test map display with markers
- [ ] Test geocoding (address → coordinates)
- [ ] Create simple test page at `/test-maps`
- [ ] Verify API usage in Cloud Console

**Acceptance Criteria:**
- ✅ Map displays correctly
- ✅ Can add markers to map
- ✅ Geocoding converts addresses to coordinates
- ✅ No console errors
- ✅ API usage stays within free tier

---

### Week 3: Delivery Management (16-20 hours)

#### Days 1-2: Delivery Batch UI (6-8 hours)
**Files to Create:**
- `app/(dashboard)/deliveries/page.tsx`
- `components/features/deliveries/OrderSelectionTable.tsx`
- `components/features/deliveries/DeliveryBatchForm.tsx`

**Tasks:**
- [ ] Create deliveries page
- [ ] Fetch orders with status "ready"
- [ ] Create order selection table with checkboxes
- [ ] Add driver dropdown (fetch from users collection)
- [ ] Add delivery date picker
- [ ] Implement multi-select functionality
- [ ] Create "Create Delivery Batch" button
- [ ] Display selected orders count

**Acceptance Criteria:**
- ✅ Can select multiple orders
- ✅ Can assign driver
- ✅ Can set delivery date
- ✅ Form validates before submission

#### Days 3-4: Route Optimization (12-14 hours)
**Files to Create:**
- `lib/routing/route-optimizer.ts`
- `lib/routing/geocoding-service.ts`
- `lib/routing/directions-service.ts`

**Tasks:**
- [ ] Extract delivery addresses from selected orders
- [ ] Implement geocoding for all addresses
- [ ] Call Google Directions API with waypoint optimization
- [ ] Parse optimized route response
- [ ] Calculate total distance and duration
- [ ] Generate ordered delivery stops
- [ ] Display route on map
- [ ] Show route details (distance, time, waypoints)
- [ ] Save delivery batch to Firestore
- [ ] Update order statuses to "out_for_delivery"

**Acceptance Criteria:**
- ✅ Route optimization works for 5+ stops
- ✅ Route optimization works for 20+ stops
- ✅ Map displays optimized route with numbered markers
- ✅ Distance and time estimates are accurate
- ✅ Delivery batch saved to Firestore

#### Days 5: Driver Dashboard (8-10 hours)
**Files to Create:**
- `app/(dashboard)/drivers/page.tsx`
- `components/features/driver/RouteMap.tsx`
- `components/features/driver/StopList.tsx`
- `components/features/driver/NavigationButton.tsx`

**Tasks:**
- [ ] Create driver dashboard page
- [ ] Fetch deliveries for logged-in driver
- [ ] Display delivery list
- [ ] Show route on map with numbered markers
- [ ] Create ordered stop list
- [ ] Add "Navigate" button (opens Google Maps app)
- [ ] Implement "Mark as Delivered" button
- [ ] Implement "Customer Not Home" button
- [ ] Update delivery status in real-time
- [ ] Test on actual mobile device

**Acceptance Criteria:**
- ✅ Driver sees assigned deliveries
- ✅ Route displays on map
- ✅ Can navigate to each stop
- ✅ Can mark stops as completed
- ✅ Real-time updates work
- ✅ UI is mobile-friendly

---

### Week 4: Inventory & Employee Management (16-20 hours)

#### Days 1-2: Inventory Management (12-14 hours)
**Files to Create:**
- `app/(dashboard)/inventory/page.tsx`
- `components/features/inventory/InventoryTable.tsx`
- `components/features/inventory/AddItemModal.tsx`
- `components/features/inventory/StockAdjustmentModal.tsx`
- `lib/inventory/stock-manager.ts`

**Tasks:**
- [ ] Create inventory page
- [ ] Fetch inventory items from Firestore
- [ ] Create inventory table with color-coded stock levels
- [ ] Implement add item modal
- [ ] Implement edit item modal
- [ ] Implement stock adjustment modal
- [ ] Add search/filter functionality
- [ ] Create adjustment history view
- [ ] Implement low stock calculation
- [ ] Create low stock badge component

**Acceptance Criteria:**
- ✅ Can add inventory items
- ✅ Can edit inventory items
- ✅ Can adjust stock quantities
- ✅ Low stock items display in red
- ✅ Search and filter work

#### Days 3: Inventory Alerts (4 hours)
**Files to Create:**
- `functions/src/scheduledJobs/checkLowStock.ts`
- `components/features/inventory/LowStockAlert.tsx`

**Tasks:**
- [ ] Create Cloud Function for daily low stock check
- [ ] Schedule function to run daily at 9 AM
- [ ] Query inventory items below reorder level
- [ ] Send email alert to manager
- [ ] Create dashboard notification
- [ ] Test Cloud Function locally with emulator
- [ ] Deploy Cloud Function
- [ ] Verify scheduled execution

**Acceptance Criteria:**
- ✅ Cloud Function runs daily
- ✅ Email alert sent when low stock detected
- ✅ Dashboard shows low stock badge

#### Days 4-5: Employee Management (12-14 hours)
**Files to Create:**
- `app/(dashboard)/employees/page.tsx`
- `components/features/employees/EmployeeTable.tsx`
- `components/features/employees/AddEmployeeModal.tsx`
- `components/features/employees/ClockInOut.tsx`
- `components/features/employees/AttendanceHistory.tsx`
- `components/features/employees/ProductivityDashboard.tsx`
- `lib/employees/attendance-tracker.ts`
- `lib/employees/productivity-calculator.ts`

**Tasks:**
- [ ] Create employees page
- [ ] Fetch employees from users collection
- [ ] Create employee table
- [ ] Implement add/edit employee form
- [ ] Create clock-in/out interface
- [ ] Implement clock-in logic (save to attendance collection)
- [ ] Implement clock-out logic (calculate hours)
- [ ] Create attendance history view (calendar)
- [ ] Calculate hours worked per day/week/month
- [ ] Create productivity dashboard
- [ ] Query orders by employee
- [ ] Display productivity metrics (orders processed, avg time)
- [ ] Create charts with Recharts
- [ ] Implement attendance report generation
- [ ] Implement productivity report generation

**Acceptance Criteria:**
- ✅ Can add employees
- ✅ Can edit employee details
- ✅ Clock-in/out works correctly
- ✅ Hours calculated accurately
- ✅ Attendance history displays
- ✅ Productivity metrics accurate
- ✅ Reports generate correctly

---

## ✅ Testing Checklist

### Receipt PDF Testing
- [ ] Generate PDF for order with 1 garment
- [ ] Generate PDF for order with 10+ garments
- [ ] Test all service types (Wash, Dry Clean, Iron, Starch, Express)
- [ ] Verify company logo displays
- [ ] Verify order ID, date, customer name accurate
- [ ] Verify garment list formatted correctly
- [ ] Verify prices calculate correctly
- [ ] Verify total is accurate
- [ ] Test download on desktop (Chrome, Firefox, Safari)
- [ ] Test download on mobile (Chrome Android, Safari iOS)
- [ ] Send 10 test emails
- [ ] Verify email delivery
- [ ] Test print functionality (Chrome print preview)

### Delivery System Testing
- [ ] Create delivery batch with 5 stops
- [ ] Create delivery batch with 10 stops
- [ ] Create delivery batch with 20 stops
- [ ] Test route optimization accuracy
- [ ] Verify map displays routes correctly
- [ ] Verify numbered markers show on map
- [ ] Verify distance calculation
- [ ] Verify time estimation
- [ ] Test driver dashboard on actual phone
- [ ] Test "Navigate" button opens Google Maps app
- [ ] Test "Mark as Delivered" updates status
- [ ] Test real-time updates (manager sees driver progress)
- [ ] Test COD payment collection (if implemented)

### Inventory Testing
- [ ] Add 50+ inventory items
- [ ] Test all categories (detergents, softeners, hangers, etc.)
- [ ] Adjust stock 20+ times
- [ ] Trigger low stock alerts
- [ ] Verify color-coded stock levels
- [ ] Test search functionality
- [ ] Test filter functionality
- [ ] Generate inventory reports
- [ ] Verify audit trail logs all changes
- [ ] Test scheduled Cloud Function (low stock check)

### Employee Management Testing
- [ ] Add 10+ employees
- [ ] Edit employee details
- [ ] Clock in 20+ times
- [ ] Clock out and verify hours calculated
- [ ] Test attendance history display
- [ ] Track orders to employees
- [ ] Verify productivity metrics
- [ ] Generate attendance reports
- [ ] Generate productivity reports
- [ ] Test reports with different date ranges

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All features tested locally
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] API keys configured
- [ ] Firestore indexes deployed
- [ ] Security rules updated

### Deployment Steps
```bash
# 1. Deploy Firestore indexes
firebase deploy --only firestore:indexes

# 2. Deploy Firestore rules
firebase deploy --only firestore:rules

# 3. Deploy Cloud Functions
firebase deploy --only functions

# 4. Deploy to production (Vercel or Firebase Hosting)
npm run build
vercel --prod
# OR
firebase deploy --only hosting
```

### Post-Deployment
- [ ] Verify all features work in production
- [ ] Test with real data
- [ ] Monitor error logs (Sentry)
- [ ] Monitor API usage (Google Cloud Console)
- [ ] Monitor Cloud Function executions
- [ ] Monitor email sending (Resend dashboard)
- [ ] User acceptance testing

---

## 📚 Resources & Documentation

### Google Maps Platform
- [Directions API Documentation](https://developers.google.com/maps/documentation/directions)
- [Distance Matrix API Documentation](https://developers.google.com/maps/documentation/distance-matrix)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding)
- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps Documentation](https://react-google-maps-api-docs.netlify.app/)

### PDF Generation
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [jsPDF Examples](https://parall.ax/products/jspdf)
- [PDF Best Practices](https://pdfobject.com/)

### Email Service
- [Resend Documentation](https://resend.com/docs)
- [Resend Email Best Practices](https://resend.com/docs/send-with-nodejs)

### Firebase
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

### Charting
- [Recharts Documentation](https://recharts.org/)
- [Recharts Examples](https://recharts.org/en-US/examples)

---

## 💡 Tips & Best Practices

### Route Optimization
1. **Batch Geocoding:** Geocode addresses in parallel to reduce latency
2. **Cache Coordinates:** Store geocoded coordinates in Firestore to avoid repeated API calls
3. **Limit Waypoints:** Google Directions API supports max 25 waypoints
4. **Handle Errors:** Some addresses may fail geocoding - provide fallback
5. **Test with Real Addresses:** Use actual Nairobi addresses for accurate testing

### PDF Generation
1. **Use Templates:** Create reusable PDF templates for consistency
2. **Test Thoroughly:** PDFs render differently on various devices
3. **Optimize Size:** Keep PDF file size small for email delivery
4. **Add Branding:** Include company logo and colors
5. **Mobile-Friendly:** Ensure PDFs are readable on mobile devices

### Inventory Management
1. **Set Realistic Reorder Levels:** Based on actual usage patterns
2. **Track Usage Trends:** Use analytics to predict stock needs
3. **Category Organization:** Group items logically for easy management
4. **Audit Trail:** Log all stock adjustments for accountability
5. **Automated Alerts:** Don't rely solely on manual checks

### Employee Tracking
1. **Privacy Considerations:** Only track necessary data
2. **Accurate Time Tracking:** Use server timestamps, not client time
3. **Break Time:** Account for breaks in hours calculation
4. **Shift Patterns:** Consider different shift schedules
5. **Productivity Fairness:** Context matters - don't just count orders

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

#### Receipt PDF System
- **Target:** 100% of paid orders have downloadable receipts
- **Metric:** Email delivery success rate > 98%
- **Performance:** PDF generation time < 2 seconds

#### Delivery Optimization
- **Target:** 30% reduction in average delivery time
- **Metric:** Route optimization accuracy > 95%
- **Performance:** Routes calculated in < 10 seconds for 20 stops

#### Inventory Management
- **Target:** Zero stock-outs for critical items
- **Metric:** Low stock alerts sent 100% of the time
- **Performance:** Dashboard loads in < 1 second

#### Employee Tracking
- **Target:** 100% attendance capture
- **Metric:** Productivity metrics accurate within 5%
- **Performance:** Real-time clock-in/out updates

---

## 📞 Support & Escalation

### Technical Issues
- **Google Maps API:** [Google Maps Support](https://developers.google.com/maps/support)
- **Firebase:** [Firebase Support](https://firebase.google.com/support)
- **Resend:** [Resend Support](https://resend.com/docs/support)

### Team Communication
- **WhatsApp Group:** For daily standups and questions
- **GitHub Issues:** For bug tracking
- **Weekly Sync:** Friday 3:00 PM (30 minutes)

### Escalation Path
1. Check documentation first
2. Ask in WhatsApp group
3. Create GitHub issue
4. Contact Gachengoh Marugu (Team Lead)

---

**Last Updated:** October 19, 2025
**Document Version:** 1.0
**Status:** Ready for Implementation

---

**Remember:**
✅ Read JERRY_TASKS.md daily for detailed task breakdowns
✅ Update your progress in WhatsApp group
✅ Test on mobile devices (especially driver dashboard)
✅ Ask questions early - don't wait until blocked
✅ Focus on one feature at a time

**You've got this, Jerry! Let's build something amazing! 🚀**
