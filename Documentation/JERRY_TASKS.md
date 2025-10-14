# 👨‍💻 Jerry Nduriri - Task Breakdown

**Role:** POS & Product Manager, Operations Specialist
**Branch:** `feature/milestone-3-operations`
**Timeline:** 4 weeks (Oct 14 - Nov 10, 2025)
**Focus:** Delivery Management, Inventory, Employee Tracking, Receipts

---

## 📋 Quick Task Overview

| Week | Focus | Hours | Status |
|------|-------|-------|--------|
| Week 1 | Setup & Learning | 8-10h | ❌ Not Started |
| Week 2 | Receipt PDF & Maps Setup | 16-20h | ❌ Not Started |
| Week 3 | Driver & Delivery Management | 16-20h | ❌ Not Started |
| Week 4 | Inventory & Employee Tracking | 16-20h | ❌ Not Started |

**Total Estimated Time:** 56-70 hours (~4 weeks)

---

## Week 1: Setup & Familiarization (Oct 14-20)

### Monday-Tuesday: Environment Setup
- [ ] Clone repository: `git clone https://github.com/[org]/lorenzo-dry-cleaners.git`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` file (ask Gachengoh for credentials)
- [ ] Run dev server: `npm run dev`
- [ ] Verify localhost:3000 loads
- [ ] Create feature branch: `git checkout -b feature/milestone-3-operations`

### Wednesday-Thursday: Documentation & Testing
- [ ] Read CLAUDE.md (development guidelines)
- [ ] Read PLANNING.md (project overview)
- [ ] Read TASKS.md (current tasks)
- [ ] Test existing features:
  - [ ] Login as staff (use dev credentials)
  - [ ] Test customer portal (use dev quick login)
  - [ ] Test pipeline board
  - [ ] Create 2-3 test orders manually in Firebase Console
- [ ] Review existing components in `components/features/`
- [ ] Review database functions in `lib/db/`

### Friday: Planning & Questions
- [ ] Review Week 2 tasks in detail
- [ ] Ask questions in WhatsApp group
- [ ] Weekly sync call (3:00 PM)

---

## Week 2: Receipt PDF & Google Maps Setup (Oct 21-27)

### Receipt PDF Completion (10-12 hours)

#### Monday-Tuesday: Implement PDF Generation
- [ ] Review existing `lib/receipts/` directory
- [ ] Install jsPDF if needed:
```bash
npm install jspdf
```
- [ ] Create or update `lib/receipts/pdf-generator.ts`:
```typescript
import jsPDF from "jspdf";

export function generateReceiptPDF(order: Order) {
  const doc = new jsPDF();

  // Company header
  doc.setFontSize(20);
  doc.text("Lorenzo Dry Cleaners", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text("Kilimani, Nairobi | +254...", 105, 28, { align: "center" });

  // Order details
  doc.setFontSize(14);
  doc.text(`Order ID: ${order.orderId}`, 20, 45);
  doc.text(`Date: ${formatDate(order.createdAt)}`, 20, 52);
  doc.text(`Customer: ${order.customerName}`, 20, 59);

  // Garment list (table)
  let y = 75;
  order.garments.forEach((garment, index) => {
    doc.text(`${index + 1}. ${garment.type} - ${garment.color}`, 20, y);
    doc.text(`Services: ${garment.services.join(", ")}`, 30, y + 7);
    doc.text(`KES ${garment.price}`, 170, y, { align: "right" });
    y += 20;
  });

  // Total
  doc.setFontSize(16);
  doc.text(`Total: KES ${order.totalAmount}`, 170, y + 10, { align: "right" });

  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for choosing Lorenzo Dry Cleaners!", 105, 280, { align: "center" });

  return doc;
}

export function downloadReceipt(order: Order) {
  const pdf = generateReceiptPDF(order);
  pdf.save(`receipt-${order.orderId}.pdf`);
}
```

#### Tuesday-Wednesday: Integrate with UI
- [ ] Update `components/features/pos/ReceiptPreview.tsx`
- [ ] Add "Download PDF" button:
```typescript
import { downloadReceipt } from "@/lib/receipts/pdf-generator";

function ReceiptPreview({ order }) {
  const handleDownload = () => {
    downloadReceipt(order);
  };

  return (
    <div>
      {/* Receipt preview UI */}
      <Button onClick={handleDownload}>
        Download PDF
      </Button>
    </div>
  );
}
```
- [ ] Test PDF generation with various orders
- [ ] Verify PDF opens correctly
- [ ] Test on mobile (download works)

#### Wednesday-Thursday: Email & Print Functionality
- [ ] Review email service in `services/resend.ts` (if exists)
- [ ] Or create email sending function:
```typescript
export async function emailReceipt(
  customerEmail: string,
  order: Order,
  pdfBlob: Blob
) {
  // Use Resend API to send email with PDF attachment
}
```
- [ ] Add "Email Receipt" button
- [ ] Implement print functionality:
```typescript
function printReceipt() {
  window.print();
}
```
- [ ] Test email delivery (5+ test emails)
- [ ] Test print (Chrome print preview)

#### Thursday-Friday: Testing & PR
- [ ] Generate 20+ test receipts with different orders:
  - [ ] 1 garment
  - [ ] Multiple garments (5+)
  - [ ] Different services
  - [ ] Various prices
- [ ] Test PDF download on desktop
- [ ] Test PDF download on mobile
- [ ] Send 5+ test emails
- [ ] Test print functionality
- [ ] Fix any formatting issues
- [ ] Create PR: "feat(receipts): complete PDF download and email functionality"

### Google Maps Setup (6-8 hours)

#### Friday: Set Up Google Maps API
- [ ] Go to Google Cloud Console (https://console.cloud.google.com)
- [ ] Create new project or select existing Firebase project
- [ ] Enable APIs:
  - [ ] Maps JavaScript API
  - [ ] Directions API
  - [ ] Distance Matrix API
  - [ ] Geocoding API
  - [ ] Places API
- [ ] Create API key
- [ ] Set API key restrictions (HTTP referrers: localhost, your-domain.com)
- [ ] Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```
- [ ] Install Google Maps React library:
```bash
npm install @react-google-maps/api
```

#### Friday Afternoon: Create Map Component
- [ ] Create `components/features/driver/Map.tsx`:
```typescript
"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function Map({ center, markers }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        center={center}
        zoom={12}
        mapContainerStyle={{ width: "100%", height: "500px" }}
      >
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
```
- [ ] Test map display (create simple test page)
- [ ] Verify markers show correctly
- [ ] Create PR: "feat(maps): set up Google Maps integration"

**End of Week Deliverables:**
- ✅ Receipt PDF generation complete
- ✅ 20+ test PDFs generated
- ✅ Email functionality working
- ✅ Google Maps displaying correctly
- ✅ 2 PRs created and submitted

---

## Week 3: Driver & Delivery Management (Oct 28 - Nov 3)

### Create Deliveries Page (6-8 hours)

#### Monday-Tuesday: Build Delivery Batch UI
- [ ] Create `app/(dashboard)/deliveries/page.tsx`
- [ ] Fetch orders with status "ready":
```typescript
const { data: readyOrders } = useQuery({
  queryKey: ["ready-orders"],
  queryFn: async () => {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("status", "==", "ready"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
});
```
- [ ] Create UI:
  - Table with checkboxes for order selection
  - Driver dropdown (list of drivers from users collection)
  - Delivery date picker
  - "Create Delivery Batch" button
- [ ] Implement multi-select for orders
- [ ] Group orders by delivery area/zone (optional)

### Route Optimization (12-16 hours)

#### Tuesday-Thursday: Implement Optimization Algorithm
- [ ] Create `lib/routing/route-optimizer.ts`:
```typescript
export async function optimizeRoute(orders: Order[]) {
  // Extract delivery addresses
  const addresses = orders.map(o => o.deliveryAddress);

  // Geocode addresses to coordinates
  const coordinates = await Promise.all(
    addresses.map(addr => geocodeAddress(addr))
  );

  // Call Google Directions API with waypoint optimization
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${coordinates[0]}` +
    `&destination=${coordinates[coordinates.length - 1]}` +
    `&waypoints=optimize:true|${coordinates.slice(1, -1).join("|")}` +
    `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();

  return {
    optimizedOrder: data.routes[0].waypoint_order,
    distance: data.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0),
    duration: data.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0),
  };
}

async function geocodeAddress(address: string) {
  // Call Geocoding API
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?` +
    `address=${encodeURIComponent(address)}` +
    `&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();
  return data.results[0].geometry.location;
}
```
- [ ] Wire up optimization on "Create Delivery Batch" button click
- [ ] Display optimized route on map (use Map component)
- [ ] Show route details (distance, estimated time)
- [ ] Save delivery batch to Firestore:
```typescript
const deliveryBatch = {
  deliveryId: generateId(),
  driverId: selectedDriver,
  orders: selectedOrderIds,
  route: {
    optimized: true,
    stops: optimizedStops,
    distance: totalDistance,
    estimatedDuration: totalDuration,
  },
  status: "pending",
  createdAt: serverTimestamp(),
};
await addDoc(collection(db, "deliveries"), deliveryBatch);
```

### Driver Dashboard (8-10 hours)

#### Thursday-Friday: Create Driver Interface
- [ ] Create `app/(dashboard)/drivers/page.tsx`
- [ ] Fetch deliveries for logged-in driver:
```typescript
const { data: myDeliveries } = useQuery({
  queryKey: ["my-deliveries", user.uid],
  queryFn: async () => {
    const q = query(
      collection(db, "deliveries"),
      where("driverId", "==", user.uid),
      where("status", "in", ["pending", "in_progress"]),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
});
```
- [ ] Display delivery list with:
  - Delivery ID
  - Number of orders
  - Total distance
  - Estimated time
  - "Start Delivery" button
- [ ] Display route on map with numbered markers
- [ ] Create stop list (ordered):
  - Order ID
  - Customer name
  - Customer address
  - Customer phone
  - "Mark as Delivered" button
  - "Customer Not Home" button
- [ ] Add "Navigate" button (opens Google Maps app):
```typescript
function openNavigation(address: string) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  window.open(url, "_blank");
}
```
- [ ] Implement status updates:
```typescript
async function updateDeliveryStatus(deliveryId, stopIndex, status) {
  const deliveryRef = doc(db, "deliveries", deliveryId);
  await updateDoc(deliveryRef, {
    [`route.stops.${stopIndex}.status`]: status,
    [`route.stops.${stopIndex}.timestamp`]: serverTimestamp(),
  });
}
```
- [ ] Add COD payment collection (if payment on delivery)
- [ ] Make UI mobile-friendly (driver will use on phone)

### Testing (4 hours)

#### Friday: Integration Testing
- [ ] Create 5+ delivery batches:
  - [ ] 5 stops
  - [ ] 10 stops
  - [ ] 20 stops
  - [ ] Different areas of Nairobi
- [ ] Test route optimization
- [ ] Verify routes display correctly on map
- [ ] Test driver interface on actual phone (Chrome mobile)
- [ ] Test delivery status updates
- [ ] Test navigation button (opens Google Maps)
- [ ] Test real-time updates (change status, verify it updates immediately)
- [ ] Document test results
- [ ] Create PR: "feat(delivery): complete driver and delivery management system"

**End of Week Deliverables:**
- ✅ Delivery batch creation working
- ✅ Route optimization functional
- ✅ Driver dashboard complete
- ✅ Mobile interface tested on phone
- ✅ 10+ delivery batches created and tested
- ✅ PR created and submitted

---

## Week 4: Inventory & Employee Management (Nov 4-10)

### Inventory Management (12-14 hours)

#### Monday-Tuesday: Create Inventory Page
- [ ] Create `app/(dashboard)/inventory/page.tsx`
- [ ] Fetch inventory items from Firestore:
```typescript
const { data: inventory } = useQuery({
  queryKey: ["inventory"],
  queryFn: async () => {
    const snapshot = await getDocs(collection(db, "inventory"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
});
```
- [ ] Create table UI:
  - Columns: Item Name, Category, Quantity, Unit, Reorder Level, Status
  - Color-code stock levels:
    - Red: quantity < reorder level
    - Yellow: quantity <= reorder level * 1.2
    - Green: quantity > reorder level * 1.2
  - "Add Item" button
  - Search/filter functionality
- [ ] Create add/edit item modal:
  - Item name (required)
  - Category dropdown: Detergents, Softeners, Hangers, Packaging, Stain Removers, Others
  - Quantity (number)
  - Unit (dropdown: liters, kg, pieces)
  - Reorder level (number)
  - Cost per unit (optional)
  - Supplier (optional)
  - Expiry date (optional)

#### Tuesday-Wednesday: Stock Adjustments
- [ ] Add "Adjust Stock" button for each item
- [ ] Create stock adjustment modal:
  - Adjustment type: Add (restock) or Remove (usage)
  - Quantity
  - Reason/notes
- [ ] Implement stock adjustment:
```typescript
async function adjustStock(itemId, adjustment) {
  const itemRef = doc(db, "inventory", itemId);
  const item = await getDoc(itemRef);
  const newQuantity = item.data().quantity + adjustment.amount;

  await updateDoc(itemRef, {
    quantity: newQuantity,
    lastAdjustment: {
      type: adjustment.type,
      amount: adjustment.amount,
      reason: adjustment.reason,
      timestamp: serverTimestamp(),
      userId: currentUser.uid,
    },
  });

  // Log adjustment in audit trail
  await addDoc(collection(db, "inventory_logs"), {
    itemId,
    oldQuantity: item.data().quantity,
    newQuantity,
    adjustment,
    timestamp: serverTimestamp(),
  });
}
```
- [ ] Display adjustment history

#### Wednesday-Thursday: Alerts & Reports
- [ ] Implement low stock alerts:
  - Create Cloud Function scheduled job (runs daily):
```typescript
export const checkLowStock = functions.pubsub
  .schedule("every day 09:00")
  .timeZone("Africa/Nairobi")
  .onRun(async () => {
    const snapshot = await db.collection("inventory").get();
    const lowStockItems = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.quantity < data.reorderLevel;
    });

    if (lowStockItems.length > 0) {
      // Send notification to admin/manager
      // Create alert in dashboard
    }
  });
```
- [ ] Display low stock badge in dashboard
- [ ] Create inventory reports page:
  - Stock summary (total items, total value)
  - Low stock items list
  - Usage analytics (most used items)
  - Stock value calculation
- [ ] Test with 50+ inventory items

### Employee Management (12-14 hours)

#### Thursday-Friday: Create Employees Page
- [ ] Create `app/(dashboard)/employees/page.tsx`
- [ ] Fetch employees from Firestore:
```typescript
const { data: employees } = useQuery({
  queryKey: ["employees"],
  queryFn: async () => {
    const q = query(
      collection(db, "users"),
      where("role", "in", ["front_desk", "workstation", "driver", "manager"])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
});
```
- [ ] Create table UI:
  - Columns: Name, Role, Branch, Status, Today's Attendance
  - "Add Employee" button (admin only)
  - Filter by branch, role, status
- [ ] Create add/edit employee form:
  - Name, email, phone
  - Role dropdown
  - Branch dropdown
  - Status: Active/Inactive
- [ ] Implement CRUD operations

#### Friday: Attendance Tracking
- [ ] Create clock-in/out interface:
  - Display current time
  - "Clock In" button (records timestamp)
  - "Clock Out" button (records timestamp)
  - Display current status (clocked in/out)
- [ ] Implement clock-in:
```typescript
async function clockIn(employeeId) {
  await addDoc(collection(db, "attendance"), {
    employeeId,
    date: format(new Date(), "yyyy-MM-dd"),
    clockIn: serverTimestamp(),
    clockOut: null,
    hoursWorked: null,
  });
}

async function clockOut(employeeId, attendanceId) {
  const attendanceRef = doc(db, "attendance", attendanceId);
  const clockInTime = (await getDoc(attendanceRef)).data().clockIn.toDate();
  const clockOutTime = new Date();
  const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

  await updateDoc(attendanceRef, {
    clockOut: serverTimestamp(),
    hoursWorked,
  });
}
```
- [ ] Display attendance history (calendar view)
- [ ] Calculate hours worked per day/week/month

#### Friday: Productivity Metrics
- [ ] Create productivity dashboard:
  - Orders processed per employee (today/week/month)
  - Average processing time
  - Orders completed vs pending
  - Quality issues (if tracked)
- [ ] Query orders by employee:
```typescript
const employeeOrders = await getDocs(
  query(
    collection(db, "orders"),
    where("createdBy", "==", employeeId),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate)
  )
);
```
- [ ] Display metrics in charts (use Recharts)
- [ ] Create reports:
  - Attendance report (date range)
  - Productivity report (by employee)
  - Hours worked report

### Testing (2 hours)

#### Friday Afternoon:
- [ ] Test inventory system:
  - [ ] Add 50+ items
  - [ ] Adjust stock 20+ times
  - [ ] Trigger low stock alerts
  - [ ] Generate reports
- [ ] Test employee system:
  - [ ] Add 10+ employees
  - [ ] Clock in/out 20+ times
  - [ ] Track orders to employees
  - [ ] Generate productivity reports
- [ ] Document any issues
- [ ] Create PR: "feat(operations): complete inventory and employee management"

**End of Week Deliverables:**
- ✅ Inventory management complete
- ✅ 50+ items tracked
- ✅ Low stock alerts working
- ✅ Employee tracking complete
- ✅ 10+ employees added
- ✅ Attendance and productivity metrics working
- ✅ PR created and submitted

---

## Daily Routine

### Morning (9:00 AM):
- [ ] Post standup in WhatsApp group:
```
Yesterday: [what you completed]
Today: [what you'll work on]
Blockers: [any issues] or "None"
```
- [ ] Pull latest changes: `git pull origin feature/milestone-3-operations`
- [ ] Review GitHub notifications

### During Day:
- [ ] Code and test features
- [ ] Commit frequently: `git commit -m "description"`
- [ ] Push changes: `git push origin feature/milestone-3-operations`
- [ ] Ask questions in WhatsApp if stuck

### End of Day (5:00 PM):
- [ ] Push all changes to GitHub
- [ ] Update TASKS.md if completed major task
- [ ] Document any blockers

---

## Git Commands Reference

```bash
# Start new feature
git checkout feature/milestone-3-operations
git pull
git checkout -b feature/milestone-3-operations/inventory

# Work and commit
git add .
git commit -m "feat(inventory): add stock adjustment"
git push origin feature/milestone-3-operations/inventory

# Merge to main branch
git checkout feature/milestone-3-operations
git merge feature/milestone-3-operations/inventory
git push origin feature/milestone-3-operations

# Create PR on GitHub
# Go to repository → Pull Requests → New Pull Request
# Base: main ← Compare: feature/milestone-3-operations
```

---

## Testing Checklist

### Receipt PDF:
- [ ] PDF generates for all order types
- [ ] Company logo displays correctly
- [ ] Order details are accurate
- [ ] Garment list formatted correctly
- [ ] Prices calculate correctly
- [ ] Total is accurate
- [ ] PDF downloads on desktop
- [ ] PDF downloads on mobile
- [ ] Email sends successfully
- [ ] Print works correctly

### Delivery System:
- [ ] Can create delivery batches
- [ ] Route optimization works
- [ ] Map displays routes correctly
- [ ] Numbered markers show on map
- [ ] Driver dashboard shows assigned deliveries
- [ ] Can update delivery status
- [ ] "Navigate" button opens Google Maps
- [ ] Mobile UI is usable on phone
- [ ] Real-time updates work
- [ ] COD payment collection works

### Inventory:
- [ ] Can add new items
- [ ] Can edit items
- [ ] Stock adjustments work correctly
- [ ] Low stock alerts trigger
- [ ] Stock level colors display correctly
- [ ] Reports generate correctly
- [ ] Search/filter works
- [ ] Audit trail logs all changes

### Employee Management:
- [ ] Can add new employees
- [ ] Can edit employee details
- [ ] Clock-in records timestamp
- [ ] Clock-out calculates hours
- [ ] Attendance history displays correctly
- [ ] Productivity metrics calculate correctly
- [ ] Reports generate correctly
- [ ] Shift assignments work

---

## Resources

### Documentation:
- [CLAUDE.md](../CLAUDE.md) - Development guidelines
- [PLANNING.md](../PLANNING.md) - Project overview
- [TASKS.md](../TASKS.md) - Main task list
- [DEVELOPER_WORK_DISTRIBUTION.md](../DEVELOPER_WORK_DISTRIBUTION.md) - Full distribution plan

### API Docs:
- [Google Maps API](https://developers.google.com/maps)
- [Google Directions API](https://developers.google.com/maps/documentation/directions)
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Firebase Docs](https://firebase.google.com/docs)

### Code References:
- Customer portal components: `components/features/customer/`
- Pipeline components: `components/features/pipeline/`
- Database functions: `lib/db/`
- Example pages: `app/(dashboard)/pipeline/page.tsx`

---

## Support

**Team Lead:** Gachengoh Marugu
- Email: hello@ai-agentsplus.com
- Phone/WhatsApp: +254 725 462 859

**Teammate:** Arthur Tutu
- Email: arthur@ai-agentsplus.com

---

**Last Updated:** October 14, 2025
**Status:** Ready to start!

**Good luck, Jerry! Let's build something amazing! 🚀**
