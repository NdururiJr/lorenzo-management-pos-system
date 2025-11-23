# Manual Testing Guide - Lorenzo Dry Cleaners Management System

**Version:** 1.0
**Last Updated:** January 2025
**Project:** Lorenzo Dry Cleaners Management System

---

## Table of Contents

1. [Introduction](#introduction)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Accounts](#test-accounts)
4. [Testing Checklist](#testing-checklist)
5. [Feature Testing](#feature-testing)
   - [Authentication & Login](#1-authentication--login)
   - [POS System](#2-pos-system)
   - [Order Pipeline](#3-order-pipeline)
   - [Customer Portal](#4-customer-portal)
   - [Deliveries & Drivers](#5-deliveries--drivers)
   - [Reports & Analytics](#6-reports--analytics)
6. [Cross-Browser Testing](#cross-browser-testing)
7. [Mobile Responsiveness](#mobile-responsiveness)
8. [Bug Reporting](#bug-reporting)
9. [Appendix](#appendix)

---

## Introduction

This guide provides step-by-step instructions for manually testing the Lorenzo Dry Cleaners Management System. Follow each test case carefully and document any issues you find.

### Testing Objectives

- Verify all features work as expected
- Identify bugs and usability issues
- Test across different browsers and devices
- Validate user workflows end-to-end
- Ensure data integrity and security

### Who Should Use This Guide

- QA Testers
- Product Managers
- Business Stakeholders
- UAT (User Acceptance Testing) Teams

---

## Test Environment Setup

### Prerequisites

1. **Browser Requirements:**
   - Google Chrome (latest version)
   - Firefox (latest version)
   - Safari (latest version)
   - Edge (latest version)

2. **Device Requirements:**
   - Desktop (Windows/Mac)
   - Tablet (iPad or Android)
   - Mobile Phone (iOS or Android)

3. **Network:**
   - Stable internet connection
   - Minimum 5 Mbps speed

### URLs

- **Staging Environment:** `https://staging.lorenzo-drycleaners.com`
- **Production Environment:** `https://lorenzo-drycleaners.com` (test after UAT approval only)

### Test Data

- Use test customers (see [Test Accounts](#test-accounts))
- Do not use real payment information in staging
- Use test phone numbers: +254712345678, +254722345678
- Use test email addresses ending with `@test.lorenzo.com`

---

## Test Accounts

### Admin Account
- **Email:** admin@lorenzo.test
- **Phone:** +254725462859
- **Password:** Test@1234
- **Name:** John Admin
- **Role:** Full system access
- **Branch:** All branches

### Front Desk Account
- **Email:** frontdesk@lorenzo.test
- **Phone:** +254725462867
- **Password:** Test@1234
- **Name:** Frank Front Desk
- **Role:** POS operations
- **Branch:** Main Branch (Kilimani)

### Driver Account
- **Email:** driver1@lorenzo.test
- **Phone:** +254725462868
- **Password:** Test@1234
- **Name:** George Driver
- **Role:** Delivery management
- **Branch:** Main Branch (Kilimani)

### Store Manager Account
- **Email:** sm.main@lorenzo.test
- **Phone:** +254725462862
- **Password:** Test@1234
- **Name:** Alice Store Manager
- **Role:** Store operations
- **Branch:** Main Branch (Kilimani)

### Customer Account (With Order History)
- **Name:** Jane Customer
- **Phone:** +254712345001
- **Email:** customer1@test.com
- **Password:** Test@1234 (or use Phone OTP login)
- **Role:** Customer portal access
- **Order History:** 5 previous orders, Total spent: 12,500 KES
- **Addresses:**
  - Home: Lavington Green, Nairobi
  - Office: Westlands Office Park, Nairobi

### Additional Test Customer (New Customer)
- **Name:** Mark Customer
- **Phone:** +254712345002
- **Email:** customer2@test.com
- **Password:** Test@1234 (or use Phone OTP login)
- **Order History:** 2 previous orders, Total spent: 5,000 KES

---

## Testing Checklist

Use this checklist to track your testing progress:

### Core Features
- [ ] User Login (All Roles)
- [ ] Create New Order (POS)
- [ ] Update Order Status (Pipeline)
- [ ] Customer Order Tracking (Portal)
- [ ] Payment Processing (Cash, M-Pesa, Card)
- [ ] Receipt Generation (PDF)
- [ ] Delivery Assignment
- [ ] Route Optimization
- [ ] WhatsApp Notifications
- [ ] Reports & Analytics

### UI/UX
- [ ] Black & White Design Consistency
- [ ] Mobile Responsiveness
- [ ] Button Accessibility
- [ ] Form Validation
- [ ] Error Messages
- [ ] Loading States
- [ ] Navigation Flow

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Devices
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

---

## Feature Testing

## 1. Authentication & Login

### Test Case 1.1: Admin Login
**Priority:** High
**Test ID:** MT-AUTH-001

**Steps:**
1. Navigate to `https://staging.lorenzo-drycleaners.com`
2. Enter email: `admin@lorenzo.test`
3. Enter password: `Test@1234`
4. Click "Login" button

**Expected Result:**
- User is redirected to admin dashboard
- Navigation shows all menu items (Orders, Pipeline, Deliveries, Analytics, Settings)
- User name "Admin User" appears in top-right corner
- No error messages displayed

**What to Check:**
- ✅ Login succeeds within 2 seconds
- ✅ Dashboard loads completely
- ✅ All navigation items are visible
- ❌ Any error messages or failed requests

---

### Test Case 1.2: Invalid Login
**Priority:** High
**Test ID:** MT-AUTH-002

**Steps:**
1. Navigate to login page
2. Enter email: `admin@lorenzo.test`
3. Enter password: `WrongPassword123`
4. Click "Login" button

**Expected Result:**
- Login fails with error message
- Error message displays: "Invalid email or password"
- User remains on login page
- Password field is cleared

**What to Check:**
- ✅ Appropriate error message is shown
- ✅ User is not logged in
- ❌ System crashes or shows generic error

---

### Test Case 1.3: Customer Phone OTP Login
**Priority:** High
**Test ID:** MT-AUTH-003

**Steps:**
1. Navigate to `/portal` (customer portal)
2. Enter phone: `+254712345001`
3. Click "Send OTP" button
4. Wait for OTP (check WhatsApp or console logs in staging)
5. Enter 6-digit OTP
6. Click "Verify" button

**Expected Result:**
- OTP is sent to phone/WhatsApp
- Success message: "OTP sent to your phone"
- OTP input fields appear
- After verification, user is redirected to `/portal/orders`
- User can see their orders

**What to Check:**
- ✅ OTP is received (WhatsApp or SMS)
- ✅ Verification succeeds with correct OTP
- ✅ Verification fails with incorrect OTP
- ✅ "Resend OTP" button works
- ❌ User can bypass OTP verification

---

### Test Case 1.4: Session Timeout
**Priority:** Medium
**Test ID:** MT-AUTH-004

**Steps:**
1. Login as any user
2. Leave the browser idle for 30 minutes
3. Try to perform any action (e.g., create order)

**Expected Result:**
- Session expires after 30 minutes
- User is redirected to login page
- Message: "Session expired. Please login again."

**What to Check:**
- ✅ Session timeout works correctly
- ✅ User is prompted to re-login
- ❌ User can still perform actions after timeout

---

## 2. POS System

### Test Case 2.1: Create Order with Existing Customer
**Priority:** High
**Test ID:** MT-POS-001

**Steps:**
1. Login as front desk user (`frontdesk@lorenzo.test`)
2. Click "New Order" button
3. Search for customer: `+254712345001` or `Jane Customer`
4. Select customer from search results
5. Click "Add Garment" button
6. Select garment type: "Shirt"
7. Enter color: "White"
8. Select services: "Wash" and "Iron"
9. Verify price calculation appears (should show ~200 KES)
10. Click "Add Garment" again
11. Select garment type: "Pants"
12. Enter color: "Black"
13. Select services: "Dry Clean"
14. Verify total price (should show ~450 KES)
15. Select payment method: "Cash"
16. Enter amount paid: `450`
17. Click "Create Order" button

**Expected Result:**
- Customer details auto-fill after selection (Name: Jane Customer)
- Garment prices calculate correctly
- Total price updates as garments are added
- Order is created successfully
- Order ID is displayed (format: ORD-BR-MAIN-001-YYYYMMDD-####)
- Success message: "Order created successfully"
- Receipt preview appears

**What to Check:**
- ✅ Customer search works (by phone or name)
- ✅ Prices calculate correctly (check pricing table)
- ✅ Total amount is accurate
- ✅ Order ID format is correct
- ✅ Receipt contains all order details
- ❌ Duplicate orders created
- ❌ Wrong customer assigned
- ❌ Incorrect pricing

---

### Test Case 2.2: Create Order with New Customer
**Priority:** High
**Test ID:** MT-POS-002

**Steps:**
1. Login as front desk user
2. Click "New Order" button
3. Click "New Customer" button
4. Enter customer name: "Jane Smith"
5. Enter phone: `+254733445566`
6. Enter email: `jane.smith@test.lorenzo.com`
7. Click "Save Customer" button
8. Add garment: "Dress", "Red", "Dry Clean + Iron"
9. Select payment method: "M-Pesa"
10. Enter amount paid: `350`
11. Click "Create Order" button

**Expected Result:**
- New customer is created successfully
- Customer appears in search results immediately
- Order creation proceeds normally
- Customer receives WhatsApp notification (if enabled)

**What to Check:**
- ✅ Customer is saved to database
- ✅ Phone number validation works (+254 format)
- ✅ Email validation works
- ✅ Customer can be searched immediately after creation
- ❌ Duplicate customers created
- ❌ Invalid phone numbers accepted

---

### Test Case 2.3: Partial Payment
**Priority:** High
**Test ID:** MT-POS-003

**Steps:**
1. Create order with total amount of 600 KES
2. Enter amount paid: `300`
3. Click "Create Order" button
4. Confirm partial payment warning

**Expected Result:**
- System displays warning: "Partial payment: 300 KES paid, 300 KES balance"
- Order payment status: "Partial"
- Balance due: 300 KES
- Order is created successfully
- Customer can pay balance later

**What to Check:**
- ✅ Partial payment warning is clear
- ✅ Balance is calculated correctly
- ✅ Payment status is "Partial" in order details
- ✅ Receipt shows balance due
- ❌ Order marked as fully paid

---

### Test Case 2.4: Express Service Surcharge
**Priority:** Medium
**Test ID:** MT-POS-004

**Steps:**
1. Create order with garment: "Shirt", "Wash + Iron" (200 KES)
2. Check "Express Service" checkbox
3. Verify price updates

**Expected Result:**
- Express surcharge applied: 50% of total
- New price: 200 + (200 × 0.5) = 300 KES
- Total amount updates automatically
- Express badge appears on garment

**What to Check:**
- ✅ Surcharge is exactly 50% of total
- ✅ Price updates immediately when express is selected
- ✅ Price recalculates when express is deselected
- ❌ Wrong surcharge percentage

---

### Test Case 2.5: Receipt Generation
**Priority:** High
**Test ID:** MT-POS-005

**Steps:**
1. Create any order successfully
2. Click "Print Receipt" or "View Receipt" button
3. Review receipt modal/PDF

**Expected Result:**
- Receipt opens in modal or new tab
- Receipt contains:
  - Order ID
  - Customer name and phone
  - Order date
  - List of garments with services
  - Individual garment prices
  - Total amount
  - Amount paid
  - Balance due (if partial payment)
  - Payment method
  - Lorenzo Dry Cleaners logo and address
  - Terms and conditions
- Receipt is printer-friendly (A4 or 80mm thermal)
- PDF download works

**What to Check:**
- ✅ All information is correct
- ✅ Formatting is clean and professional
- ✅ Print button works
- ✅ Download button works
- ✅ Receipt is readable on mobile
- ❌ Missing or incorrect information
- ❌ Formatting issues

---

### Test Case 2.6: Order Validation
**Priority:** High
**Test ID:** MT-POS-006

**Steps:**
1. Try to create order without selecting customer
2. Try to create order without adding garments
3. Try to create order with garment but no color
4. Try to create order with garment but no services
5. Try to create order with payment amount > total

**Expected Result:**
- Each validation should show appropriate error:
  - "Customer is required"
  - "Add at least one garment"
  - "Color is required for all garments"
  - "Select at least one service for each garment"
  - "Payment amount cannot exceed total amount"
- Order is not created until all validations pass

**What to Check:**
- ✅ Clear error messages for each validation
- ✅ Error messages appear near the relevant field
- ✅ User can correct errors and resubmit
- ❌ Order created with invalid data
- ❌ Generic or unclear error messages

---

## 3. Order Pipeline

### Test Case 3.1: View Pipeline Board
**Priority:** High
**Test ID:** MT-PIPE-001

**Steps:**
1. Login as admin or store manager
2. Navigate to "Pipeline" or "Orders" page
3. View the Kanban-style board

**Expected Result:**
- Pipeline displays 12 status columns:
  1. Received
  2. Inspection
  3. Queued
  4. Washing
  5. Drying
  6. Ironing
  7. Quality Check
  8. Packaging
  9. Ready
  10. Out for Delivery
  11. Delivered
  12. Collected
- Each column shows order count
- Orders are displayed as cards with:
  - Order ID
  - Customer name
  - Garment count
  - Urgency indicator (color: red, orange, amber, gray)
  - Time in current stage

**What to Check:**
- ✅ All status columns are visible
- ✅ Orders appear in correct columns
- ✅ Order cards show all required information
- ✅ Urgency colors make sense (red = overdue, gray = on time)
- ❌ Missing status columns
- ❌ Orders in wrong columns

---

### Test Case 3.2: Update Order Status
**Priority:** High
**Test ID:** MT-PIPE-002

**Steps:**
1. View pipeline board
2. Click on an order in "Received" status
3. Click "Move to Inspection" button
4. Verify order moves to "Inspection" column
5. Continue moving order through each status

**Expected Result:**
- Order moves to next status immediately
- Real-time update (no page refresh needed)
- Status history is recorded
- Timestamp for each status change
- Invalid transitions are blocked (e.g., can't skip from Washing to Ready)

**What to Check:**
- ✅ Order moves smoothly between statuses
- ✅ UI updates without refresh
- ✅ Status history shows all transitions
- ✅ Invalid transitions show error message
- ❌ Order disappears or duplicates
- ❌ Status doesn't update

---

### Test Case 3.3: QA Failure Scenario
**Priority:** Medium
**Test ID:** MT-PIPE-003

**Steps:**
1. Move order to "Quality Check" status
2. Click "Fail QA" button
3. Select reason: "Stain not removed"
4. Add notes: "Collar still has stain"
5. Confirm QA failure

**Expected Result:**
- Order moves back to "Washing" status
- Reason and notes are recorded
- Staff is notified
- Order is flagged for attention
- Customer is NOT notified yet

**What to Check:**
- ✅ Order returns to correct status (Washing)
- ✅ QA failure is logged in order history
- ✅ Staff receives notification
- ❌ Customer is notified prematurely
- ❌ Order gets stuck

---

### Test Case 3.4: Overdue Orders
**Priority:** Medium
**Test ID:** MT-PIPE-004

**Steps:**
1. View pipeline board
2. Identify orders marked as overdue (red urgency indicator)
3. Click on overdue order
4. View estimated vs actual time

**Expected Result:**
- Overdue orders have red urgency indicator
- Order details show:
  - Estimated completion time
  - Current time in stage
  - Total processing time
  - Time overdue
- Overdue orders appear at top of each column

**What to Check:**
- ✅ Overdue calculation is accurate
- ✅ Urgency colors are correct
- ✅ Overdue orders are prioritized in UI
- ❌ Wrong urgency indicators

---

### Test Case 3.5: Pipeline Statistics
**Priority:** Low
**Test ID:** MT-PIPE-005

**Steps:**
1. View pipeline board
2. Check statistics at top of page

**Expected Result:**
- Statistics display:
  - Total orders in pipeline
  - Orders per status
  - Average processing time
  - Overdue count
  - Expected completions today

**What to Check:**
- ✅ Statistics match actual order counts
- ✅ Numbers update in real-time
- ❌ Incorrect counts

---

## 4. Customer Portal

### Test Case 4.1: Customer Login
**Priority:** High
**Test ID:** MT-CUST-001

**Steps:**
1. Navigate to `/portal`
2. Enter phone: `+254712345678`
3. Click "Send OTP"
4. Enter OTP received
5. Click "Verify"

**Expected Result:**
- User is logged into customer portal
- Dashboard shows customer name
- "My Orders" page loads
- Navigation shows: Orders, Profile, Logout

**What to Check:**
- ✅ OTP sent within 30 seconds
- ✅ Login succeeds with correct OTP
- ✅ Login fails with incorrect OTP
- ✅ "Resend OTP" works after 60 seconds
- ❌ Bypass OTP verification

---

### Test Case 4.2: View Order History
**Priority:** High
**Test ID:** MT-CUST-002

**Steps:**
1. Login as customer
2. View "My Orders" page

**Expected Result:**
- All customer's orders are displayed
- Each order shows:
  - Order ID
  - Date
  - Status badge
  - Number of garments
  - Total amount
  - Balance due (if any)
- Orders sorted by date (newest first)
- Can filter by status: All, In Progress, Ready, Completed

**What to Check:**
- ✅ Only customer's own orders are visible
- ✅ Order information is accurate
- ✅ Status badges have correct colors
- ✅ Filters work correctly
- ❌ See other customers' orders
- ❌ Missing orders

---

### Test Case 4.3: Track Order in Real-Time
**Priority:** High
**Test ID:** MT-CUST-003

**Steps:**
1. Login as customer
2. Click on an order in progress
3. View order details page

**Expected Result:**
- Status timeline is displayed
- Current status is highlighted
- Completed statuses have checkmarks
- Future statuses are grayed out
- Shows:
  - Time in current stage
  - Estimated completion time
  - Live updates indicator

**What to Check:**
- ✅ Timeline is accurate
- ✅ Current status is clearly highlighted
- ✅ Updates in real-time (within 5 seconds)
- ✅ Estimated completion is reasonable
- ❌ Timeline doesn't update
- ❌ Wrong status shown

---

### Test Case 4.4: View Order Details
**Priority:** High
**Test ID:** MT-CUST-004

**Steps:**
1. Click on any order
2. View full order details

**Expected Result:**
- Order details page shows:
  - Order ID
  - Order date
  - Current status
  - List of garments with services
  - Total amount
  - Amount paid
  - Balance due
  - Payment history
  - Delivery address (if applicable)
  - Estimated completion
  - Receipt download button

**What to Check:**
- ✅ All information is accurate
- ✅ Garment list is complete
- ✅ Payment breakdown is correct
- ✅ Receipt download works
- ❌ Missing information
- ❌ Incorrect amounts

---

### Test Case 4.5: Update Profile
**Priority:** Medium
**Test ID:** MT-CUST-005

**Steps:**
1. Navigate to Profile page
2. Click "Edit Profile"
3. Update name: "John Updated Doe"
4. Update email: "john.updated@test.lorenzo.com"
5. Click "Save Changes"

**Expected Result:**
- Profile updates successfully
- Success message: "Profile updated successfully"
- New information is displayed immediately
- Changes persist after logout/login

**What to Check:**
- ✅ All fields can be updated
- ✅ Changes are saved correctly
- ✅ Validation works (email format, phone format)
- ❌ Changes don't persist
- ❌ Can update to invalid data

---

### Test Case 4.6: Manage Addresses
**Priority:** Medium
**Test ID:** MT-CUST-006

**Steps:**
1. Navigate to Profile page
2. Scroll to Addresses section
3. Click "Add New Address"
4. Enter label: "Home"
5. Enter address: "Kimathi Street, Nairobi"
6. Click on map to set location
7. Click "Save Address"

**Expected Result:**
- New address is added
- Address appears in list with label
- Map shows pin at selected location
- Can set default address
- Can edit or delete addresses

**What to Check:**
- ✅ Address is saved correctly
- ✅ Map integration works
- ✅ Can add multiple addresses
- ✅ Can set default address
- ✅ Can delete addresses
- ❌ Invalid coordinates saved
- ❌ Can't save address

---

### Test Case 4.7: Notification Preferences
**Priority:** Low
**Test ID:** MT-CUST-007

**Steps:**
1. Navigate to Profile page
2. Scroll to Notification Preferences
3. Toggle "WhatsApp notifications" OFF
4. Toggle "Email notifications" ON
5. Click "Save Preferences"

**Expected Result:**
- Preferences are saved
- Success message displayed
- Customer receives notifications via selected channels only
- Preferences persist after logout/login

**What to Check:**
- ✅ Toggles work correctly
- ✅ Preferences are saved
- ✅ Notifications respect preferences
- ❌ Receives notifications after opting out

---

### Test Case 4.8: Payment Stub (Unpaid Balance)
**Priority:** Medium
**Test ID:** MT-CUST-008

**Steps:**
1. Login as customer with order having unpaid balance
2. View order with balance due
3. Click "Pay Balance" button

**Expected Result:**
- Payment options are displayed:
  - M-Pesa
  - Card (Pesapal)
- Balance amount is shown
- Payment methods are clickable
- Selecting M-Pesa shows STK push instructions
- Selecting Card redirects to Pesapal

**What to Check:**
- ✅ Payment stub is visible for orders with balance
- ✅ Payment stub is hidden for fully paid orders
- ✅ Balance amount is correct
- ✅ Payment options work
- ❌ Payment stub shown for fully paid orders
- ❌ Wrong balance amount

---

## 5. Deliveries & Drivers

### Test Case 5.1: View Assigned Deliveries
**Priority:** High
**Test ID:** MT-DELIV-001

**Steps:**
1. Login as driver (`driver1@lorenzo.test`)
2. View "My Deliveries" page

**Expected Result:**
- List of assigned deliveries is displayed
- Each delivery shows:
  - Delivery ID
  - Number of orders
  - Delivery status (Pending, In Progress, Completed)
  - Customer addresses
  - Optimized route map
  - Estimated distance and time

**What to Check:**
- ✅ Only driver's own deliveries are visible
- ✅ Delivery information is accurate
- ✅ Map shows all stops
- ❌ See other drivers' deliveries
- ❌ Map doesn't load

---

### Test Case 5.2: Start Delivery
**Priority:** High
**Test ID:** MT-DELIV-002

**Steps:**
1. View delivery details
2. Click "Start Delivery" button
3. Confirm start

**Expected Result:**
- Delivery status changes to "In Progress"
- Start time is recorded
- Route navigation begins
- First stop is highlighted
- Driver can see customer contact info

**What to Check:**
- ✅ Status updates correctly
- ✅ Start time is accurate
- ✅ Navigation works
- ✅ Customer info is visible
- ❌ Can start already started delivery

---

### Test Case 5.3: Complete Delivery Stop
**Priority:** High
**Test ID:** MT-DELIV-003

**Steps:**
1. Navigate to first stop
2. Click "Mark as Delivered" button
3. Optional: Upload proof of delivery photo
4. Optional: Collect payment (if balance due)
5. Get customer signature (if required)
6. Confirm delivery

**Expected Result:**
- Stop is marked as completed
- Completion time is recorded
- Photo is uploaded (if taken)
- Payment is recorded (if collected)
- Order status changes to "Delivered"
- Customer receives WhatsApp notification
- Next stop is highlighted

**What to Check:**
- ✅ Delivery is recorded correctly
- ✅ Photo upload works
- ✅ Payment collection works
- ✅ Customer notification sent
- ✅ Order status updates
- ❌ Can't complete delivery
- ❌ Notification not sent

---

### Test Case 5.4: Complete Entire Delivery
**Priority:** High
**Test ID:** MT-DELIV-004

**Steps:**
1. Complete all stops in delivery
2. View delivery summary
3. Click "Complete Delivery" button

**Expected Result:**
- Delivery status changes to "Completed"
- End time is recorded
- Summary shows:
  - Total stops completed
  - Total distance traveled
  - Total time taken
  - Total payments collected
- Driver can view completed deliveries in history

**What to Check:**
- ✅ All stops are completed
- ✅ Summary is accurate
- ✅ Status updates correctly
- ❌ Can complete with pending stops

---

### Test Case 5.5: Route Optimization
**Priority:** Medium
**Test ID:** MT-DELIV-005

**Steps:**
1. View delivery with multiple stops (5+)
2. Check route order
3. Click "Re-optimize Route" button (if available)

**Expected Result:**
- Route is optimized for shortest distance/time
- Stops are reordered logically
- Map shows optimized path
- Estimated time and distance are recalculated

**What to Check:**
- ✅ Route makes logical sense
- ✅ Optimization reduces distance/time
- ✅ Map updates with new route
- ❌ Route is inefficient

---

### Test Case 5.6: Failed Delivery
**Priority:** Medium
**Test ID:** MT-DELIV-006

**Steps:**
1. At a delivery stop, click "Mark as Failed"
2. Select reason: "Customer not available"
3. Add notes: "Called customer, no answer"
4. Confirm

**Expected Result:**
- Stop is marked as failed
- Reason and notes are recorded
- Store manager is notified
- Order remains in "Out for Delivery" status
- Delivery can be rescheduled

**What to Check:**
- ✅ Failure is recorded correctly
- ✅ Manager receives notification
- ✅ Order status is appropriate
- ❌ Order marked as delivered

---

## 6. Reports & Analytics

### Test Case 6.1: View Dashboard
**Priority:** High
**Test ID:** MT-REPORT-001

**Steps:**
1. Login as admin or manager
2. View main dashboard

**Expected Result:**
- Dashboard displays key metrics:
  - Today's orders (count and revenue)
  - Orders in pipeline (count per status)
  - Orders due today
  - Overdue orders
  - Deliveries in progress
  - Top customers
  - Revenue chart (daily/weekly/monthly)
  - Popular services
- All metrics update in real-time

**What to Check:**
- ✅ All metrics are accurate
- ✅ Charts load correctly
- ✅ Numbers match actual data
- ❌ Wrong calculations
- ❌ Charts don't render

---

### Test Case 6.2: Generate Financial Report
**Priority:** High
**Test ID:** MT-REPORT-002

**Steps:**
1. Navigate to Reports page
2. Select "Financial Report"
3. Select date range: Last 30 days
4. Click "Generate Report"

**Expected Result:**
- Report displays:
  - Total revenue
  - Cash payments
  - M-Pesa payments
  - Card payments
  - Credit (unpaid balance)
  - Number of orders
  - Average order value
  - Daily breakdown chart
- Can export to PDF or Excel

**What to Check:**
- ✅ Revenue totals are accurate
- ✅ Payment method breakdown is correct
- ✅ Charts are readable
- ✅ Export works
- ❌ Wrong totals
- ❌ Export fails

---

### Test Case 6.3: Generate Customer Report
**Priority:** Medium
**Test ID:** MT-REPORT-003

**Steps:**
1. Navigate to Reports page
2. Select "Customer Report"
3. Select date range or top N customers
4. Click "Generate Report"

**Expected Result:**
- Report displays:
  - Customer name
  - Total orders
  - Total spent
  - Average order value
  - Last order date
  - Customer status (active/inactive)
- Can filter and sort
- Can export

**What to Check:**
- ✅ Customer data is accurate
- ✅ Sorting works
- ✅ Filters work
- ✅ Export works

---

### Test Case 6.4: AI Insights (Optional)
**Priority:** Low
**Test ID:** MT-REPORT-004

**Steps:**
1. View analytics dashboard
2. Click "AI Insights" or "Ask AI" button
3. View generated insights

**Expected Result:**
- AI provides insights like:
  - Order completion time predictions
  - Customer churn risk
  - Busy hours/days
  - Revenue trends
  - Recommendations

**What to Check:**
- ✅ Insights make sense
- ✅ Recommendations are actionable
- ❌ Insights are irrelevant

---

## Cross-Browser Testing

Test all critical features across different browsers:

### Test Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Login | ⬜ | ⬜ | ⬜ | ⬜ |
| Create Order | ⬜ | ⬜ | ⬜ | ⬜ |
| Pipeline Board | ⬜ | ⬜ | ⬜ | ⬜ |
| Customer Portal | ⬜ | ⬜ | ⬜ | ⬜ |
| Payment Processing | ⬜ | ⬜ | ⬜ | ⬜ |
| Receipt PDF | ⬜ | ⬜ | ⬜ | ⬜ |
| Google Maps | ⬜ | ⬜ | ⬜ | ⬜ |
| WhatsApp Integration | ⬜ | ⬜ | ⬜ | ⬜ |

### Known Browser Issues
- **Safari:** WebP images may not display (should fallback to PNG)
- **Firefox:** PDF download uses different API
- **Edge:** Some CSS grid layouts may differ slightly

---

## Mobile Responsiveness

### Test on Different Screen Sizes

1. **Mobile (375px x 667px):** iPhone SE
2. **Mobile (390px x 844px):** iPhone 12/13
3. **Mobile (360px x 800px):** Android
4. **Tablet (768px x 1024px):** iPad
5. **Desktop (1920px x 1080px):** Full HD

### Mobile Test Cases

#### MT-MOBILE-001: POS on Mobile
**Steps:**
1. Open POS on mobile device
2. Create order

**Expected Result:**
- All fields are accessible
- Buttons are tappable (minimum 44px)
- Forms scroll properly
- Keyboard doesn't overlap fields
- Layout is single column

**What to Check:**
- ✅ All features work on mobile
- ✅ Text is readable (minimum 14px)
- ✅ No horizontal scrolling
- ❌ Elements overlap
- ❌ Buttons too small

---

#### MT-MOBILE-002: Customer Portal on Mobile
**Steps:**
1. Login to customer portal on mobile
2. View orders and order details

**Expected Result:**
- Navigation uses hamburger menu
- Order cards stack vertically
- Timeline is horizontal scrollable
- All information is readable
- Images resize appropriately

**What to Check:**
- ✅ Mobile navigation works
- ✅ Content is readable
- ✅ No layout breaks
- ❌ Content cut off

---

#### MT-MOBILE-003: Driver App on Mobile
**Steps:**
1. Login as driver on mobile
2. View delivery
3. Use navigation

**Expected Result:**
- Map fills screen
- Navigation is easy to tap
- Customer info is readable
- "Mark as Delivered" button is prominent
- Works in portrait and landscape

**What to Check:**
- ✅ Map loads on mobile
- ✅ GPS location works
- ✅ Turn-by-turn navigation works
- ❌ Map doesn't load
- ❌ GPS doesn't work

---

## Bug Reporting

### How to Report a Bug

When you find a bug, document it with the following information:

1. **Bug ID:** MT-BUG-XXX (assign sequential number)
2. **Title:** Short description (e.g., "Login fails with correct password")
3. **Priority:** Critical / High / Medium / Low
4. **Feature:** Which feature is affected
5. **Test Case ID:** Related test case (if applicable)
6. **Steps to Reproduce:** Clear, numbered steps
7. **Expected Result:** What should happen
8. **Actual Result:** What actually happens
9. **Environment:**
   - Browser: (Chrome 120, Firefox 121, etc.)
   - Device: (Desktop, Mobile, Tablet)
   - OS: (Windows 11, macOS 14, iOS 17, Android 14)
   - Screen Size: (1920x1080, 375x667, etc.)
10. **Screenshots/Videos:** Attach visual evidence
11. **Console Errors:** Copy any errors from browser console (F12)
12. **Additional Notes:** Any other relevant information

### Bug Report Template

```markdown
**Bug ID:** MT-BUG-001
**Title:** Login button not responding on Safari
**Priority:** High
**Feature:** Authentication
**Test Case ID:** MT-AUTH-001

**Steps to Reproduce:**
1. Open Safari browser
2. Navigate to login page
3. Enter email: admin@lorenzo.com
4. Enter password: Test@1234
5. Click "Login" button

**Expected Result:**
User should be logged in and redirected to dashboard

**Actual Result:**
Nothing happens when clicking login button. Button appears to be unresponsive.

**Environment:**
- Browser: Safari 17.2
- Device: MacBook Pro
- OS: macOS Sonoma 14.2
- Screen Size: 1920x1080

**Screenshots:**
[Attach screenshot]

**Console Errors:**
```
TypeError: Cannot read property 'user' of undefined
  at handleLogin (auth.ts:45)
```

**Additional Notes:**
- Works fine on Chrome and Firefox
- Only affects Safari
- Both desktop and mobile Safari
```

### Bug Severity Levels

- **Critical:** System crash, data loss, security vulnerability, unable to proceed
- **High:** Major feature broken, impacts many users, workaround is difficult
- **Medium:** Feature partially works, impacts some users, workaround exists
- **Low:** Minor issue, cosmetic, impacts few users, easy workaround

---

## Appendix

### A. Test Data Reference

#### Sample Customers
- **Jane Customer:** +254712345001, customer1@test.com (5 orders, 12,500 KES spent)
- **Mark Customer:** +254712345002, customer2@test.com (2 orders, 5,000 KES spent)

#### Sample Orders (Will be created during testing)
- Orders will have format: **ORD-BR-MAIN-001-YYYYMMDD-####**
- Example: ORD-BR-MAIN-001-20250123-0001

#### Payment Methods
- **Cash:** Direct cash payment
- **M-Pesa:** Use test number: +254712000001 (sandbox)
- **Card:** Use Pesapal test cards (check documentation)

### B. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't login | Clear browser cache, check credentials |
| Map not loading | Check Google Maps API key, check internet |
| Receipt not downloading | Check browser popup blocker |
| OTP not received | Check WhatsApp, check phone number format |
| Images not loading | Check Firebase Storage configuration |
| Page loading slowly | Check network speed, check browser extensions |

### C. Contact Information

**For Testing Issues:**
- **QA Lead:** [Name]
- **Email:** qa@ai-agentsplus.com
- **Phone:** +254 725 462 859

**For Technical Issues:**
- **Dev Lead:** Gachengoh Marugu
- **Email:** hello@ai-agentsplus.com
- **Phone:** +254 725 462 859

**For Product Questions:**
- **Product Manager:** Jerry Nduriri
- **Email:** jerry@ai-agentsplus.com
- **Phone:** +254 725 462 859

### D. Testing Schedule

**Week 1:** Core Features (Auth, POS, Pipeline)
**Week 2:** Customer Portal, Deliveries
**Week 3:** Reports, Cross-Browser Testing
**Week 4:** Mobile Responsiveness, Bug Fixes
**Week 5:** UAT with Stakeholders
**Week 6:** Final Testing & Approval

### E. Glossary

- **POS:** Point of Sale system
- **OTP:** One-Time Password
- **QA:** Quality Assurance
- **UAT:** User Acceptance Testing
- **STK Push:** M-Pesa payment prompt
- **Kanban:** Visual workflow board
- **Surcharge:** Additional fee (e.g., express service)
- **Pipeline:** Order processing workflow

---

**End of Manual Testing Guide**

**Version:** 1.0
**Last Updated:** January 2025
**Next Review:** Before UAT (User Acceptance Testing)

---

## Quick Reference Card

Print this section and keep it handy during testing:

### Essential Test Accounts
- Admin: `admin@lorenzo.test` / `Test@1234`
- Front Desk: `frontdesk@lorenzo.test` / `Test@1234`
- Driver: `driver1@lorenzo.test` / `Test@1234`
- Store Manager: `sm.main@lorenzo.test` / `Test@1234`
- Customer: `+254712345001` or `customer1@test.com` (OTP or password login)

### Essential Test Data
- Test Customer 1 (Jane): `+254712345001` / `customer1@test.com`
- Test Customer 2 (Mark): `+254712345002` / `customer2@test.com`
- Test M-Pesa: `+254712000001` (sandbox)
- All Passwords: `Test@1234`

### Quick Commands
- Open Browser Console: `F12` or `Ctrl+Shift+I`
- Clear Cache: `Ctrl+Shift+Delete`
- Refresh Page: `F5` or `Ctrl+R`
- Hard Refresh: `Ctrl+F5` or `Ctrl+Shift+R`

### Reporting Template
```
Bug ID: MT-BUG-XXX
Title: [Short description]
Priority: [Critical/High/Medium/Low]
Steps: [1, 2, 3...]
Expected: [What should happen]
Actual: [What happened]
Browser: [Chrome/Firefox/Safari/Edge]
Screenshot: [Attach]
```

### Status Indicators
✅ Test Passed
❌ Test Failed
⚠️ Test Blocked
⏭️ Test Skipped
🔄 Test In Progress

---

**Happy Testing! 🧪**
