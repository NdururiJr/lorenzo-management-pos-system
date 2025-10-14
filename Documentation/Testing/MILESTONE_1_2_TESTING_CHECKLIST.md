# Milestone 1 & 2 Testing Checklist
**Lorenzo Dry Cleaners Management System**

**Date Created:** October 14, 2025
**Milestones Covered:**
- ✅ Milestone 1: Foundation (Weeks 1-2)
- ✅ Milestone 2: Core Modules (Weeks 3-4)

---

## 🎯 Testing Overview

This checklist covers comprehensive testing for Milestones 1 and 2 to ensure all features are working correctly before moving to Milestone 3 (Advanced Features).

**Testing Environment:** Development
**Browser Testing:** Chrome, Firefox, Safari (desktop and mobile)
**Mobile Testing:** iOS Safari, Android Chrome

---

## 📋 Milestone 1: Foundation Testing

### 1.1 Project Setup & Infrastructure ✅

#### Build & Development Server
- [ ] Run `npm install` - all dependencies install without errors
- [ ] Run `npm run dev` - development server starts on port 3000 (or 3001)
- [ ] Run `npm run build` - production build completes successfully (no errors, only warnings acceptable)
- [ ] Run `npm run lint` - no critical linting errors
- [ ] Check `.env.local` - all required environment variables are set

#### CI/CD Pipeline
- [ ] Push to GitHub - commit goes through without errors
- [ ] Pre-commit hooks run (linting, formatting)
- [ ] GitHub Actions workflow triggered (if configured)

---

### 1.2 Firebase Integration ✅

#### Firebase Authentication
- [ ] Firebase SDK initializes without errors (check console)
- [ ] Authentication instance created successfully
- [ ] Firestore database connection established
- [ ] Firebase Storage accessible

#### Firestore Database
- [ ] Can read from Firestore collections
- [ ] Can write to Firestore collections
- [ ] Security rules are deployed
- [ ] Indexes are deployed
- [ ] Check Firebase console - collections visible

---

### 1.3 Authentication System ✅

#### Staff Login (Email/Password)
**Test User:** Use dev credentials from `.env.local`

1. **Login Page** (`/login`)
   - [ ] Navigate to `/login` - page loads correctly
   - [ ] Page displays:
     - [ ] Email input field
     - [ ] Password input field
     - [ ] "Remember me" checkbox
     - [ ] "Sign In" button
     - [ ] "Forgot password?" link
     - [ ] "Dev Quick Login" button (dev mode only)
     - [ ] Link to customer login

2. **Valid Login**
   - [ ] Enter valid email and password
   - [ ] Click "Sign In"
   - [ ] Loading state shows (spinner or disabled button)
   - [ ] Success toast notification appears
   - [ ] Redirects to `/dashboard`
   - [ ] User session persists (refresh page, still logged in)

3. **Invalid Login**
   - [ ] Enter invalid email - error message shows
   - [ ] Enter wrong password - error message shows
   - [ ] Try with empty fields - validation errors show
   - [ ] Check error messages are user-friendly

4. **Dev Quick Login**
   - [ ] Click "Dev Quick Login" button
   - [ ] Automatically logs in with dev credentials
   - [ ] Success toast shows
   - [ ] Redirects to `/dashboard`

5. **Remember Me**
   - [ ] Login with "Remember me" checked
   - [ ] Close browser and reopen
   - [ ] Still logged in (session persists)

6. **Forgot Password**
   - [ ] Click "Forgot password?" link
   - [ ] Redirects to `/forgot-password`
   - [ ] Enter email and submit
   - [ ] Password reset email sent (check console in dev mode)

#### Customer Login (Phone OTP)

1. **Customer Login Page** (`/customer-login`)
   - [ ] Navigate to `/customer-login` - page loads correctly
   - [ ] Page displays:
     - [ ] Phone number input (prefilled with +254)
     - [ ] "Send OTP" button
     - [ ] "Back to Staff Login" link
     - [ ] "Dev Quick Login to Customer Portal" button (dev mode)
     - [ ] Development mode notice
     - [ ] "How it works" info box

2. **Valid Phone Number**
   - [ ] Enter valid Kenya phone number (+254712345678)
   - [ ] Click "Send OTP"
   - [ ] Loading state shows
   - [ ] Success toast shows "OTP sent successfully"
   - [ ] Redirects to `/verify-otp?phone=+254712345678`
   - [ ] OTP displayed in browser console (dev mode)

3. **Invalid Phone Number**
   - [ ] Enter invalid format - validation error shows
   - [ ] Try without +254 prefix - validation error shows
   - [ ] Try with wrong number length - validation error shows

4. **Dev Quick Login (Customer)**
   - [ ] Click "Quick Login to Customer Portal"
   - [ ] Logs in with dev credentials
   - [ ] Redirects to `/portal` (customer portal)
   - [ ] Can access customer portal features

5. **OTP Verification** (`/verify-otp`)
   - [ ] OTP input page displays correctly
   - [ ] Shows 6 separate input boxes
   - [ ] Auto-focuses on first input
   - [ ] Can type one digit per box
   - [ ] Auto-advances to next box
   - [ ] Can paste 6-digit code
   - [ ] "Verify OTP" button enabled when all 6 digits entered
   - [ ] "Resend OTP" link visible (with countdown timer)

6. **Valid OTP**
   - [ ] Enter correct OTP from console
   - [ ] Click "Verify OTP"
   - [ ] Success toast shows
   - [ ] Redirects to `/portal` (customer portal)

7. **Invalid OTP**
   - [ ] Enter wrong OTP
   - [ ] Error toast shows
   - [ ] OTP inputs clear
   - [ ] Focus returns to first input

8. **Resend OTP**
   - [ ] Wait for countdown to finish
   - [ ] Click "Resend OTP"
   - [ ] New OTP generated (check console)
   - [ ] Success toast shows
   - [ ] Countdown restarts

#### Logout
- [ ] Click logout button in dashboard
- [ ] Clears authentication state
- [ ] Redirects to home page (`/`)
- [ ] Cannot access protected routes
- [ ] Cookie/session cleared

---

### 1.4 User Roles & Permissions ✅

#### Role-Based Access Control (RBAC)

1. **Test with Admin User**
   - [ ] Login as admin
   - [ ] Can access all dashboard features
   - [ ] Can view all pages in sidebar
   - [ ] Can create/edit/delete resources

2. **Test with Front Desk User** (if available)
   - [ ] Login as front desk
   - [ ] Can access POS
   - [ ] Can create orders
   - [ ] Can manage customers
   - [ ] Cannot access admin-only features

3. **Test with Customer User**
   - [ ] Login as customer
   - [ ] Can only access customer portal
   - [ ] Cannot access dashboard
   - [ ] Redirect happens if try to access `/dashboard`

#### Protected Routes
- [ ] Try accessing `/dashboard` without login - redirects to `/login`
- [ ] Try accessing `/portal` without login - redirects to `/customer-login`
- [ ] Try accessing `/pos` without login - redirects to `/login`
- [ ] Try accessing `/pipeline` without login - redirects to `/login`

---

### 1.5 Design System & UI Components ✅

#### Theme & Styling
- [ ] Black & white color scheme applied
- [ ] Inter font loaded correctly
- [ ] High contrast maintained (WCAG AA)
- [ ] Consistent spacing throughout
- [ ] Clean, minimalistic design

#### Base UI Components (shadcn/ui)

Test the following components on a test page or in existing pages:

1. **Button**
   - [ ] Default variant works
   - [ ] Hover state visible
   - [ ] Disabled state works
   - [ ] Loading state (if implemented)
   - [ ] Different sizes work

2. **Input**
   - [ ] Can type in input field
   - [ ] Focus state visible
   - [ ] Error state visible
   - [ ] Disabled state works
   - [ ] Placeholder text shows

3. **Card**
   - [ ] Card displays with correct border
   - [ ] CardHeader, CardContent, CardFooter render correctly
   - [ ] Hover effects work (if any)

4. **Dialog/Modal**
   - [ ] Opens when triggered
   - [ ] Displays content correctly
   - [ ] Can close with X button
   - [ ] Can close with Cancel button
   - [ ] Can close by clicking overlay
   - [ ] ESC key closes dialog

5. **Toast Notifications**
   - [ ] Success toasts show (green)
   - [ ] Error toasts show (red)
   - [ ] Info toasts show (blue)
   - [ ] Auto-dismiss after timeout
   - [ ] Can manually dismiss

6. **Select/Dropdown**
   - [ ] Opens on click
   - [ ] Shows options
   - [ ] Can select option
   - [ ] Updates displayed value
   - [ ] Can search (if searchable)

7. **Checkbox**
   - [ ] Can check/uncheck
   - [ ] Visual state changes
   - [ ] Works in forms

8. **Badge**
   - [ ] Different variants render correctly
   - [ ] Colors applied correctly

#### Layout Components

1. **Dashboard Layout**
   - [ ] Sidebar displays on desktop
   - [ ] Sidebar collapses on mobile
   - [ ] Top navigation visible
   - [ ] User profile menu works
   - [ ] Logout button visible
   - [ ] Active route highlighted in sidebar

2. **Customer Portal Layout**
   - [ ] Header shows customer name
   - [ ] Mobile bottom navigation visible
   - [ ] Logout button works
   - [ ] Page content displays correctly

#### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Sidebar collapses on mobile
- [ ] Mobile menu works
- [ ] No horizontal scroll
- [ ] Text readable at all sizes
- [ ] Buttons accessible with touch

---

## 📋 Milestone 2: Core Modules Testing

### 2.1 Point of Sale (POS) System ✅

**Prerequisites:** Login as staff user (admin or front desk)

#### Navigation to POS
- [ ] Click "POS" in sidebar or navigate to `/dashboard/pos`
- [ ] POS page loads without errors
- [ ] Page displays correctly

#### Customer Management

1. **Customer Search**
   - [ ] Search input visible and functional
   - [ ] Type customer phone number
   - [ ] Existing customers appear in results
   - [ ] Can select customer from results
   - [ ] Customer details populate (CustomerCard)
   - [ ] Shows customer name, phone, email
   - [ ] Shows order count and total spent

2. **Create New Customer**
   - [ ] Click "Create New Customer" button
   - [ ] Modal/form opens
   - [ ] Form fields display:
     - [ ] Name (required)
     - [ ] Phone (required, Kenya format)
     - [ ] Email (optional)
     - [ ] Address label (optional)
     - [ ] Address (optional)
     - [ ] Notification preferences (checkbox)
     - [ ] Language preference (English/Swahili)
   - [ ] Enter valid details
   - [ ] Click "Create Customer"
   - [ ] Success toast shows
   - [ ] Customer saved to Firestore
   - [ ] Customer auto-selected in POS

3. **Customer Search - No Results**
   - [ ] Search for non-existent phone
   - [ ] "No customers found" message shows
   - [ ] "Create New Customer" button visible

4. **Customer Validation**
   - [ ] Try to create without name - error shows
   - [ ] Try invalid phone format - error shows
   - [ ] Try invalid email format - error shows

#### Garment Entry

1. **Add First Garment**
   - [ ] "Add Garment" button visible
   - [ ] Click "Add Garment"
   - [ ] Garment entry form displays
   - [ ] Form fields:
     - [ ] Garment type (dropdown with options)
     - [ ] Color (dropdown or color picker)
     - [ ] Brand (optional text input)
     - [ ] Services (checkboxes: Wash, Dry Clean, Iron, etc.)
     - [ ] Special instructions (textarea)
     - [ ] Photo upload button
     - [ ] Remove garment button

2. **Fill Garment Details**
   - [ ] Select garment type (e.g., "Shirt")
   - [ ] Select color (e.g., "White")
   - [ ] Enter brand (optional)
   - [ ] Check services (e.g., "Dry Clean" + "Iron")
   - [ ] Add special instructions
   - [ ] Garment ID auto-generated

3. **Upload Garment Photo**
   - [ ] Click "Upload Photo" button
   - [ ] File picker opens
   - [ ] Select image file (JPG/PNG)
   - [ ] Image uploads successfully
   - [ ] Thumbnail preview shows
   - [ ] Can remove photo
   - [ ] Can upload multiple photos

4. **Add Multiple Garments**
   - [ ] Click "Add Garment" again
   - [ ] Second garment form appears
   - [ ] Can fill details independently
   - [ ] Garment IDs increment (G01, G02, etc.)
   - [ ] Add 3-5 garments to test

5. **Remove Garment**
   - [ ] Click "Remove" button on a garment
   - [ ] Confirmation prompt (optional)
   - [ ] Garment removed from list
   - [ ] Remaining garments persist

6. **Garment Validation**
   - [ ] Try to proceed without garment type - error shows
   - [ ] Try to proceed without color - error shows
   - [ ] Try to proceed without services - error shows

#### Pricing Calculation

1. **Auto-Calculation**
   - [ ] Price automatically calculated based on:
     - [ ] Garment type
     - [ ] Selected services
   - [ ] Price displays for each garment
   - [ ] Total amount displays at bottom
   - [ ] Total updates when garments added/removed

2. **Price Breakdown**
   - [ ] Can view itemized breakdown
   - [ ] Shows each garment price
   - [ ] Shows services breakdown
   - [ ] Shows subtotal
   - [ ] Shows any discounts (if applicable)
   - [ ] Shows tax (if applicable)
   - [ ] Shows final total

3. **Test Different Scenarios**
   - [ ] Single garment order
   - [ ] Multiple garments order (same type)
   - [ ] Multiple garments order (different types)
   - [ ] Garments with different service combinations

#### Order Summary & Finalization

1. **Order Summary Display**
   - [ ] Customer info displayed correctly
   - [ ] All garments listed
   - [ ] Garment details accurate
   - [ ] Total amount correct
   - [ ] Estimated completion date shown (auto or manual)

2. **Special Instructions**
   - [ ] Can add order-level special instructions
   - [ ] Text saved with order

3. **Delivery Options** (if available)
   - [ ] Option for pickup or delivery
   - [ ] If delivery, address selection works
   - [ ] Can add delivery notes

4. **Order ID Generation**
   - [ ] Order ID generated in format: ORD-BRANCH-YYYYMMDD-####
   - [ ] Order ID unique
   - [ ] Order ID displayed in summary

#### Payment Processing

1. **Cash Payment**
   - [ ] Select "Cash" payment method
   - [ ] Enter amount tendered
   - [ ] Calculate change automatically
   - [ ] Display change amount
   - [ ] Click "Complete Payment"
   - [ ] Payment marked as "Completed"
   - [ ] Transaction record created
   - [ ] Order saved to Firestore
   - [ ] Success toast shows
   - [ ] Receipt option available

2. **Partial Payment**
   - [ ] Select payment method
   - [ ] Enter amount less than total
   - [ ] Payment status set to "Partial"
   - [ ] Remaining balance calculated
   - [ ] Order saved with partial payment
   - [ ] Can process remaining payment later

3. **Credit Payment** (if enabled)
   - [ ] Select "Credit" payment method
   - [ ] Can add credit note/reference
   - [ ] Payment status set accordingly
   - [ ] Order saved

4. **Card/M-Pesa Payment** (Pesapal Integration)
   - [ ] Select "Card" or "M-Pesa"
   - [ ] Payment initiation request sent to Pesapal
   - [ ] Redirect URL received (sandbox mode)
   - [ ] Can test payment flow (in sandbox)
   - [ ] Payment status updated after callback

5. **Payment Validation**
   - [ ] Cannot proceed without payment
   - [ ] Cannot pay more than owed (unless overpayment allowed)
   - [ ] Amount tendered must be >= total (for cash)

#### Receipt Generation

1. **Receipt Display**
   - [ ] Receipt preview shows after payment
   - [ ] Receipt contains:
     - [ ] Lorenzo Dry Cleaners header
     - [ ] Branch information
     - [ ] Order ID
     - [ ] Date and time
     - [ ] Customer name and phone
     - [ ] Itemized list of garments
     - [ ] Services per garment
     - [ ] Prices per garment
     - [ ] Subtotal
     - [ ] Total amount
     - [ ] Amount paid
     - [ ] Payment method
     - [ ] Balance (if partial)
     - [ ] Estimated completion date
     - [ ] Barcode or QR code (if implemented)
     - [ ] Footer with contact info

2. **Receipt Actions**
   - [ ] "Print Receipt" button works
   - [ ] Opens print dialog
   - [ ] Receipt formatted for printing
   - [ ] "Download PDF" button works
   - [ ] PDF downloads correctly
   - [ ] PDF contains all receipt info
   - [ ] "Send via Email" (if implemented)
   - [ ] "Send via WhatsApp" (if implemented)

3. **Receipt Storage**
   - [ ] Receipt saved in Firestore
   - [ ] Receipt accessible from order details
   - [ ] Receipt accessible from customer history

#### Order Storage & Retrieval

1. **Order Saved to Firestore**
   - [ ] Open Firebase console
   - [ ] Navigate to `orders` collection
   - [ ] Find newly created order
   - [ ] Verify all fields saved correctly:
     - [ ] orderId
     - [ ] customerId
     - [ ] branchId
     - [ ] status ('received')
     - [ ] garments array
     - [ ] totalAmount
     - [ ] paidAmount
     - [ ] paymentStatus
     - [ ] paymentMethod
     - [ ] estimatedCompletion
     - [ ] createdAt
     - [ ] createdBy

2. **Customer Updated**
   - [ ] Navigate to `customers` collection
   - [ ] Find customer document
   - [ ] Verify `orderCount` incremented
   - [ ] Verify `totalSpent` updated

3. **Transaction Record**
   - [ ] Navigate to `transactions` collection
   - [ ] Find transaction document
   - [ ] Verify transaction details:
     - [ ] transactionId
     - [ ] orderId
     - [ ] customerId
     - [ ] amount
     - [ ] method
     - [ ] status ('completed')
     - [ ] timestamp
     - [ ] processedBy

#### POS Error Handling

- [ ] Test with invalid customer data - graceful error
- [ ] Test with missing required fields - validation messages
- [ ] Test with network error - retry option or error message
- [ ] Test concurrent order creation - no conflicts

---

### 2.2 Order Pipeline Management ✅

**Prerequisites:** Login as staff user, have at least 5-10 test orders in various statuses

#### Navigation to Pipeline
- [ ] Click "Pipeline" in sidebar or navigate to `/dashboard/pipeline`
- [ ] Pipeline page loads without errors
- [ ] Kanban board displays

#### Pipeline Board UI

1. **Status Columns Display**
   - [ ] All status columns visible:
     - [ ] Received
     - [ ] Queued
     - [ ] Washing
     - [ ] Drying
     - [ ] Ironing
     - [ ] Quality Check
     - [ ] Packaging
     - [ ] Ready
     - [ ] Out for Delivery
     - [ ] Delivered/Collected
   - [ ] Columns arranged horizontally (desktop)
   - [ ] Can scroll horizontally if needed

2. **Order Cards**
   - [ ] Orders displayed as cards in respective columns
   - [ ] Card shows:
     - [ ] Order ID
     - [ ] Customer name
     - [ ] Number of garments
     - [ ] Estimated completion time
     - [ ] Elapsed time since last status change
     - [ ] Status badge with color coding
   - [ ] Card design clean and readable
   - [ ] Card hover effect visible

3. **Empty States**
   - [ ] Columns with no orders show "No orders" message
   - [ ] Message is clear and user-friendly

#### Manual Status Updates

1. **Update Order Status**
   - [ ] Click on an order card
   - [ ] Order details modal opens
   - [ ] Modal shows full order details:
     - [ ] Customer info
     - [ ] Garments list
     - [ ] Current status
     - [ ] Status history timeline
   - [ ] "Change Status" button or dropdown visible
   - [ ] Click "Change Status"
   - [ ] Dropdown shows available next statuses
   - [ ] Select new status (e.g., move from "Received" to "Queued")
   - [ ] Confirmation prompt (optional)
   - [ ] Status updates in Firestore
   - [ ] Order card moves to new column
   - [ ] Success toast shows
   - [ ] Status history updated

2. **Status Validation**
   - [ ] Cannot skip stages (if validation enabled)
   - [ ] Cannot move backward inappropriately
   - [ ] Appropriate error messages show

3. **Bulk Status Update** (if implemented)
   - [ ] Select multiple orders (checkbox)
   - [ ] "Update Status" button enabled
   - [ ] Select new status for all
   - [ ] All orders update simultaneously

#### Real-Time Updates

1. **Test Real-Time Sync**
   - [ ] Open pipeline in two different browser windows/tabs
   - [ ] Change status in one window
   - [ ] Other window updates automatically
   - [ ] No page refresh needed
   - [ ] Update happens within 1-2 seconds

2. **Optimistic UI Updates**
   - [ ] Change status
   - [ ] UI updates immediately (before server confirmation)
   - [ ] If server fails, rollback happens
   - [ ] Error toast shows on failure

3. **Multiple Users**
   - [ ] Have two users logged in
   - [ ] Both viewing pipeline
   - [ ] One user updates order
   - [ ] Other user sees change in real-time

#### Filtering & Search

1. **Filter by Branch**
   - [ ] Branch filter dropdown visible
   - [ ] Select a branch
   - [ ] Only orders from that branch show
   - [ ] Order count updates

2. **Filter by Date Range**
   - [ ] Date range filter visible
   - [ ] Select start and end dates
   - [ ] Only orders in date range show
   - [ ] Can clear date filter

3. **Filter by Customer**
   - [ ] Customer search/filter input
   - [ ] Type customer name or phone
   - [ ] Orders filtered to that customer

4. **Search by Order ID**
   - [ ] Search input visible
   - [ ] Type order ID (e.g., ORD-BR1-20251014-0001)
   - [ ] Matching order highlights
   - [ ] Can click to view details

5. **Combined Filters**
   - [ ] Apply multiple filters simultaneously
   - [ ] Results accurate
   - [ ] Can clear all filters

6. **No Results**
   - [ ] Apply filter with no matching orders
   - [ ] "No orders found" message shows
   - [ ] Option to clear filters

#### Pipeline Statistics

1. **Summary Dashboard**
   - [ ] Statistics panel visible (top or side)
   - [ ] Shows key metrics:
     - [ ] Total orders
     - [ ] Orders by status (count per column)
     - [ ] Average processing time per stage
     - [ ] Orders today/this week/this month
     - [ ] Revenue today/this week/this month
     - [ ] Bottleneck stages (longest wait time)

2. **Real-Time Stats**
   - [ ] Stats update when orders move
   - [ ] Counts accurate
   - [ ] Charts/graphs render correctly (if implemented)

3. **Performance Indicators**
   - [ ] Highlight overdue orders (past estimated completion)
   - [ ] Show orders taking longer than average
   - [ ] Color coding for priority/urgency

#### Pipeline Responsive Design

- [ ] Test on desktop - all columns visible
- [ ] Test on tablet - can scroll columns or stacked view
- [ ] Test on mobile - vertical card layout or swipe between columns
- [ ] Order cards readable at all sizes
- [ ] Filters accessible on mobile

#### Pipeline Error Handling

- [ ] Test status update with network error - retry option
- [ ] Test with large number of orders - pagination or virtualization
- [ ] Test real-time listener reconnection after disconnect

---

### 2.3 Customer Portal ✅

**Prerequisites:** Login as customer user (use customer phone OTP or dev login)

#### Navigation to Portal
- [ ] After customer login, redirects to `/portal`
- [ ] Portal page loads without errors
- [ ] Customer dashboard displays

#### Customer Dashboard

1. **Welcome Header**
   - [ ] Displays customer name
   - [ ] Shows greeting (Good morning/afternoon/evening)
   - [ ] Shows profile completion status (if applicable)

2. **Active Orders Summary**
   - [ ] Card shows active orders count
   - [ ] Lists current orders in progress
   - [ ] Each order shows:
     - [ ] Order ID
     - [ ] Current status
     - [ ] Number of garments
     - [ ] Estimated completion date
     - [ ] "Track Order" button

3. **Recent Activity**
   - [ ] Shows recent completed orders
   - [ ] Shows recent status updates
   - [ ] Shows recent transactions

4. **Quick Actions**
   - [ ] "Track Order" button
   - [ ] "View History" button
   - [ ] "Update Profile" button
   - [ ] "Download Receipt" button

#### Order Tracking

1. **Track Active Order**
   - [ ] Click "Track Order" on an active order
   - [ ] Redirects to `/orders/[orderId]`
   - [ ] Order tracking page loads
   - [ ] Page shows:
     - [ ] Order ID
     - [ ] Current status (large, prominent)
     - [ ] Estimated completion time
     - [ ] Status timeline (visual)

2. **Status Timeline**
   - [ ] Timeline shows all statuses
   - [ ] Completed statuses marked (checkmark/color)
   - [ ] Current status highlighted
   - [ ] Future statuses grayed out
   - [ ] Timeline shows timestamps for completed stages
   - [ ] Timeline updates in real-time

3. **Order Details**
   - [ ] Customer information
   - [ ] List of garments:
     - [ ] Garment type
     - [ ] Color
     - [ ] Services
     - [ ] Photo (if uploaded)
     - [ ] Special instructions
   - [ ] Pricing breakdown
   - [ ] Payment status
   - [ ] Delivery info (if applicable)

4. **Real-Time Updates**
   - [ ] Open tracking page
   - [ ] Have staff update order status in pipeline
   - [ ] Customer portal updates automatically
   - [ ] No page refresh needed
   - [ ] Status timeline animates

5. **Delivery Tracking** (if order is out for delivery)
   - [ ] Shows "Out for Delivery" status
   - [ ] Shows driver name (if available)
   - [ ] Shows estimated delivery time
   - [ ] Shows "Driver Nearby" notification when close
   - [ ] Map shows driver location (if implemented)

6. **Order Completed**
   - [ ] Status shows "Delivered" or "Collected"
   - [ ] Shows completion timestamp
   - [ ] Option to download receipt
   - [ ] Option to reorder (duplicate order)
   - [ ] Option to rate service (if implemented)

#### Profile Management

1. **View Profile**
   - [ ] Click "Profile" or navigate to `/profile`
   - [ ] Profile page loads
   - [ ] Displays:
     - [ ] Name
     - [ ] Phone number
     - [ ] Email (if set)
     - [ ] Saved addresses
     - [ ] Notification preferences
     - [ ] Language preference

2. **Edit Profile**
   - [ ] Click "Edit Profile"
   - [ ] Form fields become editable
   - [ ] Can update:
     - [ ] Name
     - [ ] Email
   - [ ] Cannot change phone (or requires verification)
   - [ ] Click "Save"
   - [ ] Success toast shows
   - [ ] Changes saved to Firestore
   - [ ] UI updates with new info

3. **Address Management**
   - [ ] "Addresses" section visible
   - [ ] Lists all saved addresses
   - [ ] Each address shows:
     - [ ] Label (Home, Office, etc.)
     - [ ] Full address
     - [ ] Edit button
     - [ ] Delete button
     - [ ] Set as default button (if applicable)

4. **Add New Address**
   - [ ] Click "Add Address"
   - [ ] Modal or form opens
   - [ ] Fields:
     - [ ] Address label (required)
     - [ ] Full address (required)
     - [ ] Coordinates (auto or manual)
   - [ ] Enter address details
   - [ ] Click "Save"
   - [ ] Address added to list
   - [ ] Saved to Firestore

5. **Edit Address**
   - [ ] Click "Edit" on an address
   - [ ] Form pre-fills with address data
   - [ ] Update fields
   - [ ] Click "Save"
   - [ ] Address updated

6. **Delete Address**
   - [ ] Click "Delete" on an address
   - [ ] Confirmation prompt shows
   - [ ] Confirm deletion
   - [ ] Address removed from list
   - [ ] Removed from Firestore

7. **Update Phone Number** (if allowed)
   - [ ] Option to change phone number
   - [ ] Enter new phone
   - [ ] OTP sent to new number
   - [ ] Verify OTP
   - [ ] Phone number updated

8. **Notification Preferences**
   - [ ] Toggle for WhatsApp notifications
   - [ ] Toggle for SMS notifications (if available)
   - [ ] Toggle for email notifications (if available)
   - [ ] Preferences save on change
   - [ ] Saved to Firestore

9. **Language Preference**
   - [ ] Dropdown or toggle for language (English/Swahili)
   - [ ] Select Swahili
   - [ ] UI labels change to Swahili (if implemented)
   - [ ] Or note that full translation coming soon

#### Order History

1. **View Order History**
   - [ ] Navigate to order history page
   - [ ] Lists all past orders
   - [ ] Ordered by date (most recent first)
   - [ ] Each order shows:
     - [ ] Order ID
     - [ ] Date created
     - [ ] Status
     - [ ] Total amount
     - [ ] Number of garments
     - [ ] "View Details" button

2. **Order Details from History**
   - [ ] Click "View Details" on an order
   - [ ] Order details page opens
   - [ ] Shows full order information
   - [ ] Shows payment information
   - [ ] Option to download receipt

3. **Download Receipt**
   - [ ] Click "Download Receipt"
   - [ ] PDF generates
   - [ ] PDF downloads to device
   - [ ] PDF contains all order details
   - [ ] PDF formatted correctly

4. **Re-Order**
   - [ ] Click "Re-Order" button (if implemented)
   - [ ] Confirmation prompt
   - [ ] Creates new order with same garments
   - [ ] Redirects to new order tracking page

5. **Pagination**
   - [ ] If more than 10-20 orders, pagination visible
   - [ ] Can navigate to next/previous pages
   - [ ] Can select page number
   - [ ] "Load More" button (infinite scroll alternative)

6. **Filter Order History**
   - [ ] Filter by date range
   - [ ] Filter by status
   - [ ] Search by order ID

#### Customer Portal Responsive Design

- [ ] Test on desktop
- [ ] Test on tablet
- [ ] Test on mobile
- [ ] Mobile bottom navigation works
- [ ] All features accessible on mobile
- [ ] Forms usable on small screens

#### Customer Portal Error Handling

- [ ] Test with no orders - empty state shows
- [ ] Test profile update failure - error message shows
- [ ] Test network error during tracking - retry option
- [ ] Test accessing another customer's order - access denied

---

## 🔒 Security & Authorization Testing

### Authentication & Session Management

1. **Token Expiration**
   - [ ] Login and wait for session timeout (30 minutes)
   - [ ] After timeout, redirected to login
   - [ ] Cannot access protected routes

2. **Concurrent Sessions**
   - [ ] Login in two browsers
   - [ ] Logout in one browser
   - [ ] Other browser session still valid (or invalidated based on design)

3. **Direct URL Access**
   - [ ] Try accessing `/dashboard` without login - redirects to `/login`
   - [ ] Try accessing `/portal` without login - redirects to `/customer-login`
   - [ ] Try accessing protected API routes - 401 Unauthorized

### Role-Based Access Control

1. **Customer Cannot Access Staff Features**
   - [ ] Login as customer
   - [ ] Try navigating to `/dashboard` - access denied or redirect
   - [ ] Try navigating to `/dashboard/pos` - access denied
   - [ ] Try navigating to `/dashboard/pipeline` - access denied

2. **Staff Cannot Access Customer Portal**
   - [ ] Login as staff (if portal is customer-only in production)
   - [ ] Try navigating to `/portal` - access denied (in production mode)
   - [ ] Development mode allows for testing

3. **Front Desk Cannot Access Admin Features** (if applicable)
   - [ ] Login as front desk user
   - [ ] Try accessing admin-only settings - access denied
   - [ ] Try managing users - access denied

### Data Security

1. **Firestore Security Rules**
   - [ ] Try reading another customer's orders via API - denied
   - [ ] Try updating another user's profile - denied
   - [ ] Try deleting orders without permission - denied

2. **XSS Protection**
   - [ ] Enter `<script>alert('XSS')</script>` in form fields
   - [ ] Data sanitized, script doesn't execute
   - [ ] Special characters escaped

---

## 📊 Performance Testing

### Page Load Times

- [ ] Home page (`/`) loads in < 2 seconds
- [ ] Login page loads in < 1 second
- [ ] Dashboard loads in < 2 seconds
- [ ] POS page loads in < 2 seconds
- [ ] Pipeline page loads in < 3 seconds (with many orders)
- [ ] Customer portal loads in < 2 seconds
- [ ] Profile page loads in < 1 second

### API Response Times

- [ ] Create order API < 1 second
- [ ] Update order status API < 500ms
- [ ] Fetch orders list API < 1 second
- [ ] Customer search API < 500ms
- [ ] Get order details API < 500ms

### Real-Time Updates

- [ ] Order status update reflects in < 2 seconds
- [ ] Pipeline board updates in < 2 seconds
- [ ] Customer tracking updates in < 2 seconds

### Large Data Sets

- [ ] Pipeline with 100+ orders - loads and renders
- [ ] Order history with 50+ orders - pagination works
- [ ] Customer search with 100+ customers - search fast

---

## 🌍 Cross-Browser & Device Testing

### Desktop Browsers

#### Chrome (Latest)
- [ ] All features work
- [ ] UI renders correctly
- [ ] Animations smooth
- [ ] No console errors

#### Firefox (Latest)
- [ ] All features work
- [ ] UI renders correctly
- [ ] Animations smooth
- [ ] No console errors

#### Safari (Latest)
- [ ] All features work
- [ ] UI renders correctly
- [ ] Animations smooth
- [ ] No console errors

### Mobile Browsers

#### iOS Safari
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] Forms usable
- [ ] No horizontal scroll

#### Android Chrome
- [ ] All features work
- [ ] Touch interactions smooth
- [ ] Forms usable
- [ ] No horizontal scroll

### Device Testing

- [ ] iPhone (portrait and landscape)
- [ ] iPad (portrait and landscape)
- [ ] Android phone (portrait and landscape)
- [ ] Android tablet (portrait and landscape)

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Can navigate forms with keyboard
- [ ] Can submit forms with Enter key
- [ ] Modals can be closed with ESC key
- [ ] Dropdowns navigable with arrow keys

### Screen Reader Testing
- [ ] Use NVDA (Windows) or VoiceOver (Mac)
- [ ] All important content announced
- [ ] Form labels announced
- [ ] Error messages announced
- [ ] Button purposes clear
- [ ] Images have alt text

### Color Contrast
- [ ] Text meets WCAG AA contrast ratio (4.5:1)
- [ ] Interactive elements distinguishable
- [ ] Status badges color-coded and labeled

### Focus Management
- [ ] Focus moves logically
- [ ] Focus returns appropriately after modal close
- [ ] No focus traps

---

## 🐛 Error Handling & Edge Cases

### Network Errors

- [ ] Disconnect internet during operation
- [ ] Appropriate error message shows
- [ ] Retry option available
- [ ] Offline indicator visible (if implemented)

### Validation Errors

- [ ] Clear error messages for invalid input
- [ ] Error messages positioned near relevant fields
- [ ] Multiple errors displayed correctly

### Empty States

- [ ] Dashboard with no orders - friendly message
- [ ] Customer with no order history - helpful message
- [ ] Pipeline with no orders - clear state
- [ ] Customer search with no results - create option

### Concurrent Operations

- [ ] Two users updating same order - conflict handling
- [ ] Two orders created simultaneously - both succeed
- [ ] Status update during order creation - no conflicts

### Data Integrity

- [ ] Order cannot be created without customer
- [ ] Order cannot be created without garments
- [ ] Payment amount cannot exceed order total (unless allowed)
- [ ] Garment count matches actual garments list

---

## 📝 Data Validation Testing

### Phone Numbers (Kenya Format)

- [ ] Valid: +254712345678 ✅
- [ ] Valid: +254722345678 ✅
- [ ] Valid: +254733345678 ✅
- [ ] Invalid: 254712345678 ❌ (missing +)
- [ ] Invalid: 0712345678 ❌ (wrong format)
- [ ] Invalid: +25471234567 ❌ (too short)
- [ ] Invalid: +2547123456789 ❌ (too long)

### Email Addresses

- [ ] Valid: user@example.com ✅
- [ ] Valid: user.name@example.co.ke ✅
- [ ] Invalid: user@example ❌
- [ ] Invalid: @example.com ❌
- [ ] Invalid: user@.com ❌

### Order IDs

- [ ] Format: ORD-BRANCH-YYYYMMDD-#### ✅
- [ ] Example: ORD-BR1-20251014-0001 ✅
- [ ] Unique across all orders ✅
- [ ] Sequential within a day ✅

### Dates

- [ ] Past dates allowed for order history
- [ ] Future dates allowed for estimated completion
- [ ] Date formats consistent (YYYY-MM-DD or localized)

---

## 📸 Visual Regression Testing (Optional)

If you have screenshot tools:

- [ ] Take screenshots of all main pages
- [ ] Compare with design mockups
- [ ] Check layout consistency
- [ ] Verify spacing and alignment
- [ ] Check font sizes and weights

---

## 🎉 Success Criteria

### Milestone 1 & 2 Complete When:

- [ ] ✅ All authentication flows work correctly
- [ ] ✅ Staff can login and access dashboard
- [ ] ✅ Customers can login and access portal
- [ ] ✅ POS system functional end-to-end
- [ ] ✅ Can create order from customer search to receipt
- [ ] ✅ Payment processing works for all methods
- [ ] ✅ Receipts generate correctly
- [ ] ✅ Order pipeline displays orders correctly
- [ ] ✅ Can update order status manually
- [ ] ✅ Real-time updates work
- [ ] ✅ Customer portal displays orders
- [ ] ✅ Order tracking works with live updates
- [ ] ✅ Profile management functional
- [ ] ✅ Order history accessible
- [ ] ✅ No critical bugs
- [ ] ✅ No console errors in production mode
- [ ] ✅ Performance benchmarks met
- [ ] ✅ Responsive on mobile and desktop
- [ ] ✅ Role-based access control working
- [ ] ✅ Data persists correctly in Firestore

---

## 📋 Bug Tracking Template

When you find a bug during testing, document it:

```
**Bug ID:** BUG-001
**Title:** Brief description
**Severity:** Critical / High / Medium / Low
**Module:** POS / Pipeline / Portal / Auth / etc.
**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:** What should happen
**Actual Result:** What actually happens
**Browser/Device:** Chrome 119, Windows 11
**Screenshot:** (attach if applicable)
**Notes:** Additional context
```

---

## ✅ Testing Completion Checklist

Mark each section when complete:

- [ ] **Milestone 1 - Foundation** - All tests passed
- [ ] **Milestone 2.1 - POS System** - All tests passed
- [ ] **Milestone 2.2 - Pipeline** - All tests passed
- [ ] **Milestone 2.3 - Customer Portal** - All tests passed
- [ ] **Security Testing** - All tests passed
- [ ] **Performance Testing** - Benchmarks met
- [ ] **Cross-Browser Testing** - All browsers tested
- [ ] **Accessibility Testing** - WCAG AA compliance verified
- [ ] **Error Handling** - All edge cases handled
- [ ] **Data Validation** - All validation rules working
- [ ] **Bug Report** - All bugs documented and prioritized

---

**Testing Completed By:** ___________________________
**Date:** ___________________________
**Sign-Off:** ___________________________

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Document all bugs** found during testing
2. **Prioritize bugs** (Critical → High → Medium → Low)
3. **Fix critical and high-priority bugs**
4. **Re-test fixed bugs**
5. **Get stakeholder sign-off** on Milestone 1 & 2
6. **Prepare for Milestone 3** (Advanced Features)
7. **Celebrate the completion!** 🎉

---

**Good luck with your testing!** 💪
