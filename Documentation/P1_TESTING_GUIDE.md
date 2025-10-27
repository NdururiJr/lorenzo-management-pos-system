# P1 Features Testing Guide

**Date:** October 22, 2025
**Status:** All P1 Milestones Complete - Ready for Testing
**Progress:** 100% Implementation → Testing Phase

---

## 🎯 Testing Overview

All 4 P1 High Priority milestones have been fully implemented:
- ✅ M3: Google Maps Integration
- ✅ M4: Delivery Batch Management
- ✅ M5: Route Optimization
- ✅ M6: Driver Dashboard

This guide provides step-by-step testing instructions for each feature.

---

## 📋 Pre-Testing Setup

### 1. Environment Variables
Ensure `.env.local` has:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 2. Test Users
You need at least:
- **Admin User**: `dev@lorenzo.com` / `DevPass123!`
- **Driver User**: Create via Firebase console with role `driver`

### 3. Test Data
Create test orders with delivery addresses:
1. Navigate to `/pos`
2. Create customers with full addresses
3. Create orders for these customers
4. Mark orders as "ready" for delivery

### 4. Start Development Server
```bash
cd lorenzo-dry-cleaners
npm run dev
```

---

## 🧪 Testing Checklist

## Milestone 4: Delivery Batch Management

### Page: `/deliveries`

**File:** `app/(dashboard)/deliveries/page.tsx`

#### Test 1: View Deliveries Page
- [ ] Navigate to `/deliveries`
- [ ] Page loads without errors
- [ ] Stats cards display correctly:
  - [ ] Ready Orders count
  - [ ] Pending Deliveries count
  - [ ] Today's Deliveries count
- [ ] All three sections visible:
  - [ ] Order Selection Table
  - [ ] Create Batch Form (when orders selected)
  - [ ] Active Batches List

#### Test 2: Select Orders for Delivery
**Component:** `OrderSelectionTable.tsx`

- [ ] Table displays orders with status "ready"
- [ ] Only orders with delivery addresses shown
- [ ] Each order row shows:
  - [ ] Order ID
  - [ ] Customer name
  - [ ] Phone number
  - [ ] Delivery address
  - [ ] Total amount
  - [ ] Created date
- [ ] Checkbox selection works
- [ ] "Select All" checkbox works
- [ ] Selected rows highlighted in blue
- [ ] "Create Delivery Batch" button appears when orders selected
- [ ] Empty state shows when no ready orders
- [ ] Loading spinner shows during fetch

#### Test 3: Create Delivery Batch
**Component:** `DeliveryBatchForm.tsx`

- [ ] Click "Create Delivery Batch" button
- [ ] Form appears with:
  - [ ] Driver selection dropdown
  - [ ] Scheduled date picker with calendar
  - [ ] Notes/instructions textarea
  - [ ] Batch summary showing selected orders
- [ ] Driver dropdown populated with active drivers
- [ ] Calendar component works correctly
- [ ] Can select future date
- [ ] Form validation works:
  - [ ] Driver required
  - [ ] Date required
  - [ ] Notes optional
- [ ] Click "Create Batch" button
- [ ] Loading spinner shows during creation
- [ ] Success toast appears
- [ ] Orders removed from selection table
- [ ] Order statuses updated to "out_for_delivery"
- [ ] New batch appears in Active Batches list
- [ ] Stats cards update automatically

#### Test 4: View Active Batches
**Component:** `ActiveBatchesList.tsx`

- [ ] Active batches displayed as cards
- [ ] Each card shows:
  - [ ] Delivery ID
  - [ ] Status badge (color-coded)
  - [ ] Assigned driver name
  - [ ] Order count
  - [ ] Scheduled date
  - [ ] Start time (if in progress)
  - [ ] Notes (if present)
  - [ ] "View Details" button
- [ ] Status badges correct:
  - [ ] Yellow for "pending"
  - [ ] Blue for "in_progress"
  - [ ] Green for "completed"
- [ ] Empty state shows when no active batches
- [ ] Loading spinner during fetch
- [ ] Click "View Details" navigates to driver page

---

## Milestone 6: Driver Dashboard

### Page: `/drivers`

**File:** `app/(dashboard)/drivers/page.tsx`

#### Test 5: Driver Dashboard Main Page
- [ ] Login as driver user
- [ ] Navigate to `/drivers`
- [ ] Page loads without errors
- [ ] Header shows:
  - [ ] Truck icon
  - [ ] "Driver Dashboard" title
  - [ ] "Your assigned delivery batches" subtitle
- [ ] Stats cards display:
  - [ ] Today's Deliveries count
  - [ ] Pending count (yellow)
  - [ ] In Progress count (blue)
  - [ ] Completed count (green)
- [ ] Tabs visible:
  - [ ] Today (with count)
  - [ ] Pending (with count)
  - [ ] In Progress (with count)
  - [ ] Completed (with count)
- [ ] Only shows batches assigned to logged-in driver

#### Test 6: Delivery Cards
- [ ] Each delivery card shows:
  - [ ] Delivery ID
  - [ ] Scheduled date and time
  - [ ] Status badge
  - [ ] Order count
  - [ ] Route info (stops, distance if available)
  - [ ] Start time (if in progress)
  - [ ] Notes (if present)
  - [ ] Action button:
    - [ ] "Start Delivery" for pending
    - [ ] "Continue Delivery" for in progress
    - [ ] "View Details" for completed
- [ ] Cards are clickable
- [ ] Mobile-responsive layout (grid adapts to screen size)
- [ ] Empty states work for each tab
- [ ] Loading spinner during data fetch

#### Test 7: Tab Filtering
- [ ] Click "Today" tab:
  - [ ] Shows only deliveries scheduled for today
  - [ ] Empty state if none today
- [ ] Click "Pending" tab:
  - [ ] Shows only pending deliveries
  - [ ] Empty state if none pending
- [ ] Click "In Progress" tab:
  - [ ] Shows only in-progress deliveries
  - [ ] Empty state if none in progress
- [ ] Click "Completed" tab:
  - [ ] Shows only completed deliveries
  - [ ] Empty state if none completed
- [ ] Counts in tabs match displayed cards

### Page: `/drivers/[deliveryId]`

**File:** `app/(dashboard)/drivers/[deliveryId]/page.tsx`

#### Test 8: Batch Detail Page - Header
- [ ] Click on a delivery card from main dashboard
- [ ] Navigates to `/drivers/[deliveryId]`
- [ ] Page loads without errors
- [ ] Header shows:
  - [ ] Back button to dashboard
  - [ ] Delivery ID
  - [ ] Scheduled date/time
  - [ ] Status badge
- [ ] Back button returns to `/drivers`

#### Test 9: Stats Cards
- [ ] Four stat cards display:
  - [ ] Total Orders count
  - [ ] Delivered count (green)
  - [ ] Pending count (yellow)
  - [ ] Failed count (red)
- [ ] Counts are accurate
- [ ] Icons display correctly

#### Test 10: Start Delivery Workflow
**For Pending Deliveries:**
- [ ] "Start Delivery" button visible
- [ ] Button shows blue with play icon
- [ ] Click "Start Delivery"
- [ ] Loading spinner shows
- [ ] Status updates to "in_progress"
- [ ] Start time recorded
- [ ] Success toast appears
- [ ] Button disappears after start
- [ ] Stats update automatically

#### Test 11: Route Tab - Map View
- [ ] Route tab selected by default
- [ ] Map loads correctly
- [ ] All delivery stops shown as markers
- [ ] Markers numbered sequentially (optimized order)
- [ ] Route polyline displayed in blue
- [ ] Markers clickable
- [ ] Click marker opens order details
- [ ] Map auto-centers on route
- [ ] Map responsive to screen size
- [ ] If route optimized:
  - [ ] Green success banner shows
  - [ ] Distance saved displayed
  - [ ] Percentage improvement shown

#### Test 12: Stops Tab - Order List
- [ ] Click "Stops" tab
- [ ] All orders displayed as cards
- [ ] Orders sorted by optimized sequence
- [ ] Each stop card shows:
  - [ ] Sequence number in blue circle
  - [ ] Customer name
  - [ ] Phone number (clickable)
  - [ ] Delivery address
  - [ ] Item count
  - [ ] Total amount
  - [ ] Delivery notes (if present)
- [ ] Completed stops have green background
- [ ] Failed stops have red background
- [ ] Pending stops have white background
- [ ] Status icons (checkmark/X) displayed
- [ ] Cards clickable to open details

#### Test 13: Order Detail Dialog
- [ ] Click on a stop card
- [ ] Dialog opens with order details
- [ ] Dialog shows:
  - [ ] Customer name in title
  - [ ] Full delivery address
  - [ ] Order items list with quantities and prices
  - [ ] Total amount
  - [ ] Delivery notes textarea (if pending)
- [ ] For pending orders:
  - [ ] "Mark as Failed" button (red)
  - [ ] "Mark as Delivered" button (green)
  - [ ] Can add delivery notes
- [ ] For completed orders:
  - [ ] Proof of delivery displayed
  - [ ] No action buttons
- [ ] Close button works
- [ ] Click outside closes dialog

#### Test 14: Mark Order as Delivered
- [ ] Open pending order dialog
- [ ] Optionally add delivery notes
- [ ] Click "Mark as Delivered"
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] Dialog closes
- [ ] Order status updates to "delivered"
- [ ] Card background turns green
- [ ] Checkmark icon appears
- [ ] Stats cards update
- [ ] Delivered count increments
- [ ] Pending count decrements

#### Test 15: Mark Order as Failed
- [ ] Open pending order dialog
- [ ] Add delivery notes (reason for failure)
- [ ] Click "Mark as Failed"
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] Dialog closes
- [ ] Order status updates to "failed"
- [ ] Card background turns red
- [ ] X icon appears
- [ ] Stats cards update
- [ ] Failed count increments
- [ ] Pending count decrements

#### Test 16: Complete Batch Workflow
**Prerequisites:** All orders must be marked as delivered or failed

- [ ] After last order processed:
  - [ ] "Complete Delivery" button appears (green)
  - [ ] Button shows checkmark icon
- [ ] Click "Complete Delivery"
- [ ] Completion dialog opens:
  - [ ] Title: "Complete Delivery Batch"
  - [ ] Description explaining all orders processed
  - [ ] Completion notes textarea (optional)
  - [ ] Cancel button
  - [ ] Complete button (green)
- [ ] Add optional completion notes
- [ ] Click "Complete Batch"
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] Status updates to "completed"
- [ ] End time recorded
- [ ] Auto-redirects to `/drivers` dashboard
- [ ] Batch moves to "Completed" tab
- [ ] Stats update on dashboard

#### Test 17: Error Handling
- [ ] Test with invalid delivery ID in URL
  - [ ] Shows "Delivery not found" error
  - [ ] Back to dashboard button works
- [ ] Test with delivery assigned to different driver
  - [ ] Access denied or appropriate error
- [ ] Test network errors:
  - [ ] Error toast displays
  - [ ] Data doesn't corrupt
  - [ ] Can retry action

---

## Milestone 3: Google Maps Integration

### Component: `MapView.tsx`

#### Test 18: Map Loading
- [ ] Maps load on driver batch detail page
- [ ] Loading spinner shows while loading
- [ ] No console errors
- [ ] Google Maps logo visible
- [ ] Map controls (zoom, street view) visible
- [ ] Map tiles load completely

#### Test 19: Markers
- [ ] All delivery stops shown as markers
- [ ] Markers have numbered labels
- [ ] Labels match sequence order
- [ ] Hover shows stop name
- [ ] Click marker triggers callback
- [ ] Markers positioned correctly on addresses

#### Test 20: Route Polyline
- [ ] Route line drawn between stops
- [ ] Line color is blue (#3B82F6)
- [ ] Line follows roads (not straight)
- [ ] All stops connected in sequence
- [ ] Line visible and clear

#### Test 21: Map Interactions
- [ ] Can zoom in/out
- [ ] Can pan/drag map
- [ ] Can switch to satellite view
- [ ] Can enter street view
- [ ] Map bounds auto-fit to show all stops
- [ ] Responsive to screen size changes

### Utilities: Geocoding

#### Test 22: Address Geocoding
**Test in browser console or create test page:**

```javascript
import { geocodeAddress } from '@/lib/maps';

// Test valid address
const result = await geocodeAddress('1600 Amphitheatre Parkway, Mountain View, CA');
console.log(result);
// Should return coordinates and formatted address
```

- [ ] Valid addresses return coordinates
- [ ] Formatted address returned
- [ ] Invalid addresses throw errors
- [ ] Partial addresses work
- [ ] International addresses work

#### Test 23: Distance Calculations
```javascript
import { calculateDistance, haversineDistance } from '@/lib/maps';

const origin = { lat: 37.7749, lng: -122.4194 }; // SF
const dest = { lat: 34.0522, lng: -118.2437 }; // LA

// Test Google API
const distance = await calculateDistance(origin, dest, 'driving');
console.log(distance);

// Test Haversine
const haversine = haversineDistance(origin, dest);
console.log(haversine);
```

- [ ] Returns distance in meters
- [ ] Returns duration in seconds
- [ ] Distance text human-readable
- [ ] Duration text human-readable
- [ ] Different travel modes work
- [ ] Haversine provides fallback

---

## Milestone 5: Route Optimization

### Component: `RouteComparison.tsx`

#### Test 24: Route Optimization Algorithm
**Automatic when viewing batch with multiple stops**

- [ ] Optimization runs automatically
- [ ] Loading indicator during optimization
- [ ] Original route calculated
- [ ] Optimized route calculated
- [ ] Distance savings computed
- [ ] Percentage improvement shown
- [ ] No errors in console

#### Test 25: Route Comparison Display
**On delivery batch page with 3+ orders:**

- [ ] Two maps shown side-by-side (desktop)
- [ ] Stacked vertically on mobile
- [ ] Left map: Original route (red)
- [ ] Right map: Optimized route (green)
- [ ] Both maps show same stops
- [ ] Route colors distinct and clear
- [ ] Stop numbers match sequences

#### Test 26: Improvement Metrics
- [ ] Stats cards above maps show:
  - [ ] Distance Saved (meters/km)
  - [ ] Original Distance
  - [ ] Optimized Distance
  - [ ] Percentage Improved
  - [ ] Estimated Duration
- [ ] Green banner shows savings
- [ ] Improvement arrow indicator
- [ ] Metrics accurate and consistent

#### Test 27: Stop Sequence Comparison
- [ ] Below each map, stop order shown
- [ ] Original sequence matches input order
- [ ] Optimized sequence different (if improved)
- [ ] Badge labels for each stop
- [ ] Optimized stops have green background
- [ ] Customer names visible

#### Test 28: Algorithm Validation
**Test with known routes:**

- [ ] Create batch with 5+ orders
- [ ] Note original total distance
- [ ] View optimized route
- [ ] Verify optimized distance < original
- [ ] Check sequence makes logical sense
- [ ] Test with different starting points
- [ ] Test with orders in cluster
- [ ] Test with spread-out orders

---

## 🔧 Troubleshooting

### Common Issues:

**1. Maps Not Loading**
- Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Verify API key has Maps JavaScript API enabled
- Check browser console for API errors
- Ensure billing enabled on Google Cloud

**2. Orders Not Appearing**
- Ensure orders have `status: 'ready'`
- Verify delivery addresses exist
- Check Firestore security rules
- Confirm user authenticated

**3. Driver Can't See Batches**
- Verify user role is `driver`
- Check driverId matches batch assignment
- Confirm authentication working
- Check query filters in code

**4. Route Optimization Not Working**
- Ensure 2+ orders in batch
- Check coordinates geocoded correctly
- Verify no network errors
- Test with smaller batch first

**5. Mutations Failing**
- Check Firestore permissions
- Verify document IDs correct
- Check data types (Timestamp, etc.)
- Look for validation errors

---

## ✅ Testing Completion Checklist

### Milestone 4: Delivery Management
- [ ] All Test 1-4 items passed
- [ ] Can create batches end-to-end
- [ ] No console errors
- [ ] Mobile responsive verified

### Milestone 6: Driver Dashboard
- [ ] All Test 5-17 items passed
- [ ] Complete delivery workflow tested
- [ ] All status transitions work
- [ ] Error handling verified
- [ ] Mobile interface tested

### Milestone 3: Google Maps
- [ ] All Test 18-23 items passed
- [ ] Maps display correctly
- [ ] Geocoding working
- [ ] Distance calculations accurate

### Milestone 5: Route Optimization
- [ ] All Test 24-28 items passed
- [ ] Optimization algorithm working
- [ ] Improvements verified
- [ ] Visual comparison clear

---

## 📊 Test Results Template

```markdown
# P1 Testing Results

**Tester:** [Your Name]
**Date:** [Date]
**Environment:** Development / Staging / Production

## Summary
- Total Tests: 28 test sections
- Passed: __
- Failed: __
- Blocked: __

## Failed Tests
[If any, list here with details]

## Issues Found
1. [Issue description]
   - Severity: Critical / Major / Minor
   - Steps to reproduce:
   - Expected:
   - Actual:
   - Screenshots:

## Recommendations
[Any suggestions for improvements]

## Sign-off
All P1 features working as expected: ✅ / ❌
```

---

## 🎯 Next Steps After Testing

1. **Fix any bugs found** during testing
2. **Performance testing** with larger datasets
3. **Security audit** of Firestore rules
4. **User acceptance testing** with real drivers
5. **Move to P2 features** (Customer Portal, Reports, etc.)

---

**Document Version:** 1.0
**Last Updated:** October 22, 2025
**Status:** Ready for Testing
