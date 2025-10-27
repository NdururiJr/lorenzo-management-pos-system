# Lorenzo Dry Cleaners - Comprehensive Testing Checklist

**Generated:** October 20, 2025
**Purpose:** Complete testing guide for all features in JERRY_TASKS.md
**Total Test Cases:** 200+

---

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Milestone 0.5: POS Page Testing](#milestone-05-pos-page-testing-p0-priority)
3. [Milestone 2: Receipt PDF System Testing](#milestone-2-receipt-pdf-system-testing)
4. [Milestone 3: Google Maps Testing](#milestone-3-google-maps-testing)
5. [Milestone 4: Delivery Batch Management Testing](#milestone-4-delivery-batch-management-testing)
6. [Milestone 5: Route Optimization Testing](#milestone-5-route-optimization-testing)
7. [Milestone 6: Driver Dashboard Testing](#milestone-6-driver-dashboard-testing)
8. [Milestone 7: Inventory Management Testing](#milestone-7-inventory-management-testing)
9. [Milestone 8: Inventory Alerts Testing](#milestone-8-inventory-alerts-testing)
10. [Milestone 9: Employee Management Testing](#milestone-9-employee-management-testing)
11. [Milestone 12: WhatsApp Integration Testing](#milestone-12-whatsapp-integration-testing)
12. [Milestone 13: AI Features Testing](#milestone-13-ai-features-testing)
13. [Milestone 14: Final Integration Testing](#milestone-14-final-integration-testing)
14. [Cross-Browser Testing](#cross-browser-testing)
15. [Performance Testing](#performance-testing)
16. [Security Testing](#security-testing)

---

## Pre-Testing Setup

### Environment Setup

**✅ Checklist:**
- [ ] Node.js and npm installed
- [ ] Firebase project configured
- [ ] Environment variables set (.env.local)
- [ ] Development server running (`npm run dev`)
- [ ] Test user account created
- [ ] Test data seeded

**How to Test:**

1. **Verify Node.js installation:**
   ```bash
   node --version  # Should be v20+
   npm --version   # Should be v10+
   ```

2. **Check environment variables:**
   ```bash
   # Navigate to project directory
   cd c:\Users\HomePC\Desktop\lorenzo-workspace\lorenzo-dry-cleaners

   # Verify .env.local exists
   ls .env.local

   # Required variables:
   # - NEXT_PUBLIC_FIREBASE_API_KEY
   # - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   # - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   # - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   # - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   # - NEXT_PUBLIC_FIREBASE_APP_ID
   # - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   # - FIREBASE_SERVICE_ACCOUNT_KEY (base64 encoded)
   # - RESEND_API_KEY
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   - Expected: Server starts on http://localhost:3000
   - Expected: No compilation errors
   - Expected: Console shows "Ready in X ms"

4. **Seed test data:**
   ```bash
   npm run seed:test-orders
   ```
   - Expected: Creates 10 test orders
   - Expected: Creates 5 test customers
   - Expected: Creates test pricing data
   - Expected: No errors in console

5. **Login to application:**
   - Navigate to http://localhost:3000
   - Enter test credentials
   - Expected: Redirected to dashboard
   - Expected: User profile loads

**Expected Results:**
- ✅ Development environment is ready
- ✅ All services are accessible
- ✅ Test data is available
- ✅ User can authenticate

---

## Milestone 0.5: POS Page Testing (P0 PRIORITY)

### Test Suite 1: POS Page Accessibility

**Test Case 1.1: POS Page Loads**
- **URL:** http://localhost:3000/pos
- **Action:** Navigate to POS page
- **Expected Result:**
  - Page loads without errors
  - Title shows "Point of Sale"
  - Customer search section visible
  - Garment entry form visible
  - No 404 error

**Test Case 1.2: Page Layout**
- **Action:** Inspect page structure
- **Expected Result:**
  - 3-column layout on desktop (customer | garments | summary)
  - Single column on mobile
  - Header is sticky on scroll
  - All sections are responsive

**Test Case 1.3: Loading State**
- **Action:** Refresh page
- **Expected Result:**
  - Shows loading spinner briefly
  - "Loading..." text displayed
  - Page content appears smoothly

### Test Suite 2: Customer Selection Workflow

**Test Case 2.1: Search Existing Customer**
- **Action:**
  1. Click on phone number input field
  2. Enter phone number: "+254712345678"
  3. Click "Search" button
- **Expected Result:**
  - Search executes
  - Customer card displays if found
  - Shows customer name, phone, email
  - "Select Customer" button appears

**Test Case 2.2: Select Customer**
- **Action:**
  1. Search for customer (as above)
  2. Click "Select Customer" button
- **Expected Result:**
  - Customer card moves to selected state
  - Search field disappears
  - "Change Customer" button appears
  - Success toast: "Customer selected: [Name]"

**Test Case 2.3: Change Customer**
- **Action:**
  1. Select a customer
  2. Click "Change Customer" button
- **Expected Result:**
  - Customer deselects
  - Search field reappears
  - Can search for different customer

**Test Case 2.4: Create New Customer**
- **Action:**
  1. Click "Create New Customer" button
  2. Fill in form:
     - Name: "Test Customer"
     - Phone: "+254700000001"
     - Email: "test@example.com" (optional)
     - Address: "Nairobi, Kenya" (optional)
  3. Click "Create Customer"
- **Expected Result:**
  - Modal closes
  - New customer is created in database
  - Customer auto-selected
  - Success toast: "Customer created: Test Customer"

**Test Case 2.5: Create Customer Validation**
- **Action:**
  1. Click "Create New Customer"
  2. Submit empty form
- **Expected Result:**
  - Shows validation errors
  - "Name is required"
  - "Phone is required"
  - Form does not submit

**Test Case 2.6: Duplicate Phone Number**
- **Action:**
  1. Try to create customer with existing phone
- **Expected Result:**
  - Error message: "Customer with this phone number already exists"
  - Suggests to search for existing customer

### Test Suite 3: Garment Entry Workflow

**Test Case 3.1: Add Single Garment**
- **Action:**
  1. Select garment type: "Shirt"
  2. Enter color: "White"
  3. Enter brand: "Nike" (optional)
  4. Select services: Check "Wash" and "Iron"
  5. Price auto-calculates: KES 300
  6. Click "Add Garment"
- **Expected Result:**
  - Garment added to list
  - Shows garment card with all details
  - Form resets for next garment
  - Success toast: "Shirt added to order"
  - Subtotal updates

**Test Case 3.2: Add Multiple Garments**
- **Action:**
  1. Add 5 different garments
- **Expected Result:**
  - All garments appear in list
  - Each has unique card
  - Counter shows: "Order Items (5)"
  - Subtotal calculates correctly

**Test Case 3.3: Add Express Service**
- **Action:**
  1. Add garment with "Express" service checked
- **Expected Result:**
  - Price increases (express charge applied)
  - Express badge shows on garment card
  - Estimated completion time reduces to 4 hours

**Test Case 3.4: Remove Garment**
- **Action:**
  1. Add 3 garments
  2. Click "Remove" button on 2nd garment
- **Expected Result:**
  - Garment disappears from list
  - Counter updates: "Order Items (2)"
  - Subtotal recalculates
  - Info toast: "[Type] removed from order"

**Test Case 3.5: Add Special Instructions**
- **Action:**
  1. In garment form, enter special instructions: "Handle with care - delicate fabric"
  2. Add garment
- **Expected Result:**
  - Instructions save with garment
  - Display in garment card
  - Include in order details

**Test Case 3.6: Upload Garment Photo**
- **Action:**
  1. Click "Upload Photo" button
  2. Select image file (< 5MB)
  3. Add garment
- **Expected Result:**
  - Photo uploads to Firebase Storage
  - Thumbnail shows in garment card
  - Photo URL saved with garment

### Test Suite 4: Pricing Calculation

**Test Case 4.1: Base Price Calculation**
- **Action:**
  1. Add shirt with "Wash" service
- **Expected Result:**
  - Price: KES 150
  - Subtotal: KES 150

**Test Case 4.2: Multiple Services Price**
- **Action:**
  1. Add shirt with "Wash", "Dry Clean", "Iron"
- **Expected Result:**
  - Price: KES 450 (cumulative)
  - Subtotal updates

**Test Case 4.3: Express Service Premium**
- **Action:**
  1. Add garment with "Express" checked
- **Expected Result:**
  - Price increases by 50%
  - Express indicator shows

**Test Case 4.4: Bulk Discount (if implemented)**
- **Action:**
  1. Add 10+ garments
- **Expected Result:**
  - Discount applied automatically
  - Shows discount line in summary
  - Total reflects discount

**Test Case 4.5: Subtotal Accuracy**
- **Action:**
  1. Add 3 garments: KES 150, KES 300, KES 450
- **Expected Result:**
  - Subtotal: KES 900
  - No rounding errors

### Test Suite 5: Order Creation Workflow

**Test Case 5.1: Create Complete Order**
- **Action:**
  1. Select customer
  2. Add 3 garments
  3. Review order summary
  4. Click "Process Payment"
- **Expected Result:**
  - Order creates in database
  - Generates unique order ID (format: BRANCH-YYYYMMDD-XXXX)
  - Payment modal opens
  - Success toast: "Order [ID] created successfully!"

**Test Case 5.2: Order Without Customer**
- **Action:**
  1. Add garments without selecting customer
  2. Click "Process Payment"
- **Expected Result:**
  - Error message: "Please select a customer and add garments"
  - Order does not create
  - Payment modal does not open

**Test Case 5.3: Order Without Garments**
- **Action:**
  1. Select customer
  2. Don't add garments
  3. Click "Process Payment"
- **Expected Result:**
  - Error message: "Please select a customer and add garments"
  - "Process Payment" button may be disabled

**Test Case 5.4: Order Data Integrity**
- **Action:**
  1. Create order
  2. Check Firestore database
- **Expected Result:**
  - Order document exists in `orders` collection
  - All fields populated:
    - orderId
    - customerId
    - customerName
    - customerPhone
    - branchId
    - status: "received"
    - garments array
    - totalAmount
    - paidAmount: 0
    - paymentStatus: "pending"
    - estimatedCompletion
    - createdAt
    - createdBy
    - statusHistory array
    - updatedAt

**Test Case 5.5: Estimated Completion Calculation**
- **Action:**
  1. Create order with standard services
- **Expected Result:**
  - Estimated completion: 48 hours from now
  - Displayed in readable format: "Jan 22, 2025 at 3:00 PM"

**Test Case 5.6: Express Order Completion**
- **Action:**
  1. Create order with express service
- **Expected Result:**
  - Estimated completion: 4 hours from now
  - Shows "Express" badge in order summary

### Test Suite 6: Payment Processing

**Test Case 6.1: Cash Payment - Full Amount**
- **Action:**
  1. Create order (Total: KES 900)
  2. In payment modal, select "Cash"
  3. Enter amount: KES 900
  4. Click "Complete Payment"
- **Expected Result:**
  - Payment processes
  - Transaction creates in database
  - Order updates: paidAmount = 900, paymentStatus = "paid"
  - Payment modal closes
  - Receipt preview opens
  - Success toast: "Payment successful!"

**Test Case 6.2: Cash Payment - Partial Amount**
- **Action:**
  1. Create order (Total: KES 900)
  2. Select "Cash"
  3. Enter amount: KES 500
  4. Complete payment
- **Expected Result:**
  - Payment processes
  - Order updates: paidAmount = 500, paymentStatus = "partial"
  - Balance due: KES 400
  - Receipt shows partial payment

**Test Case 6.3: Cash Payment - Overpayment**
- **Action:**
  1. Create order (Total: KES 900)
  2. Enter amount: KES 1000
  3. Complete payment
- **Expected Result:**
  - Payment processes
  - Shows change due: KES 100
  - Receipt includes change amount

**Test Case 6.4: M-Pesa Payment (if Pesapal integrated)**
- **Action:**
  1. Create order
  2. Select "M-Pesa"
  3. Enter phone number
  4. Click "Send STK Push"
- **Expected Result:**
  - STK push sent to phone
  - Shows "Waiting for payment..." spinner
  - After approval, payment completes
  - Receipt generates

**Test Case 6.5: Card Payment (if Pesapal integrated)**
- **Action:**
  1. Create order
  2. Select "Card"
  3. Enter card details
  4. Complete payment
- **Expected Result:**
  - Redirects to Pesapal gateway
  - After successful payment, returns to app
  - Payment confirmed
  - Receipt generates

**Test Case 6.6: Credit Account Payment**
- **Action:**
  1. Create order
  2. Select "Credit Account"
  3. Complete payment
- **Expected Result:**
  - Order saves with paymentStatus: "credit"
  - No immediate payment required
  - Credit balance updates in customer account

**Test Case 6.7: Payment Failure Handling**
- **Action:**
  1. Simulate payment failure (network error)
- **Expected Result:**
  - Error message displays
  - Payment modal stays open
  - "Retry" button appears
  - Order remains in pending state

### Test Suite 7: Receipt Generation

**Test Case 7.1: Receipt Preview**
- **Action:**
  1. Complete payment
  2. Receipt preview opens
- **Expected Result:**
  - Shows complete receipt
  - Company name and logo
  - Order ID
  - Customer details
  - Garment list with prices
  - Subtotal and total
  - Payment method
  - Amount paid
  - Balance (if any)
  - Estimated completion date
  - "Thank you" message

**Test Case 7.2: Download PDF Receipt**
- **Action:**
  1. In receipt preview, click "Download PDF"
- **Expected Result:**
  - PDF generates using jsPDF
  - File downloads: `receipt-[OrderID].pdf`
  - PDF opens in browser
  - All receipt details formatted correctly
  - Company logo displays

**Test Case 7.3: Email Receipt**
- **Action:**
  1. Click "Email Receipt" button
- **Expected Result:**
  - Email sends via Resend
  - Customer receives email
  - Email contains PDF attachment
  - Email body has order summary
  - Success message: "Receipt emailed to [email]"

**Test Case 7.4: Print Receipt**
- **Action:**
  1. Click "Print" button
- **Expected Result:**
  - Browser print dialog opens
  - Receipt formatted for printing
  - Thermal printer support (if available)

**Test Case 7.5: Create Another Order**
- **Action:**
  1. In receipt preview, click "Create Another Order"
- **Expected Result:**
  - Receipt closes
  - Form resets
  - Customer deselects
  - Garments clear
  - Ready for new order
  - Success toast: "Ready for next order"

### Test Suite 8: Form Validation

**Test Case 8.1: Customer Required**
- **Action:**
  1. Try to process payment without customer
- **Expected Result:**
  - Error message shows
  - Payment button disabled or shows error

**Test Case 8.2: Minimum Garments**
- **Action:**
  1. Select customer but add 0 garments
- **Expected Result:**
  - Payment button disabled
  - Message: "Add at least 1 garment"

**Test Case 8.3: Garment Type Required**
- **Action:**
  1. Try to add garment without selecting type
- **Expected Result:**
  - Validation error: "Garment type is required"
  - Add button disabled

**Test Case 8.4: Services Required**
- **Action:**
  1. Try to add garment without selecting any services
- **Expected Result:**
  - Validation error: "Select at least one service"
  - Add button disabled

**Test Case 8.5: Price Validation**
- **Action:**
  1. Check that prices are always positive
- **Expected Result:**
  - No negative prices
  - No zero prices
  - Minimum price: KES 50

### Test Suite 9: Error Handling

**Test Case 9.1: Network Error During Order Creation**
- **Action:**
  1. Disconnect internet
  2. Try to create order
- **Expected Result:**
  - Error message: "Network error. Please check your connection."
  - Order does not create
  - Can retry when connection restored

**Test Case 9.2: Firestore Permission Error**
- **Action:**
  1. Simulate permission denied error
- **Expected Result:**
  - Error message: "Permission denied. Please contact administrator."
  - Helpful guidance provided

**Test Case 9.3: Customer Not Found**
- **Action:**
  1. Search for non-existent phone number
- **Expected Result:**
  - Message: "No customer found with this phone number"
  - "Create New Customer" button highlighted

**Test Case 9.4: Order Creation Timeout**
- **Action:**
  1. Simulate slow network
- **Expected Result:**
  - Shows loading spinner
  - Timeout after 30 seconds
  - Error message: "Request timed out. Please try again."

### Test Suite 10: UI/UX Testing

**Test Case 10.1: Loading States**
- **Action:**
  1. Observe all loading states during workflow
- **Expected Result:**
  - Customer search shows spinner
  - Order creation shows spinner
  - Payment processing shows spinner
  - Buttons disabled during loading

**Test Case 10.2: Success Feedback**
- **Action:**
  1. Complete entire workflow
- **Expected Result:**
  - Toast notifications at each step
  - Success messages are clear
  - Positive feedback (green checkmarks)

**Test Case 10.3: Mobile Responsiveness**
- **Action:**
  1. Open on mobile device (or DevTools mobile view)
  2. Complete order workflow
- **Expected Result:**
  - Layout adapts to mobile
  - Single column layout
  - Touch targets are large (44px min)
  - No horizontal scrolling
  - All buttons accessible

**Test Case 10.4: Tablet Responsiveness**
- **Action:**
  1. Test on tablet (768px - 1024px width)
- **Expected Result:**
  - 2-column layout
  - Comfortable spacing
  - Readable text sizes

**Test Case 10.5: Dark Mode (if implemented)**
- **Action:**
  1. Toggle dark mode
- **Expected Result:**
  - All components adapt
  - Text remains readable
  - Contrast ratios meet WCAG AA

### Test Suite 11: Accessibility Testing

**Test Case 11.1: Keyboard Navigation**
- **Action:**
  1. Navigate entire workflow using only keyboard
  2. Use Tab to move between elements
  3. Use Enter/Space to activate buttons
- **Expected Result:**
  - All interactive elements focusable
  - Focus indicators visible
  - Logical tab order
  - No keyboard traps

**Test Case 11.2: Screen Reader Support**
- **Action:**
  1. Test with NVDA or JAWS screen reader
- **Expected Result:**
  - All content announced
  - Form labels clear
  - Error messages read aloud
  - Button purposes clear

**Test Case 11.3: ARIA Labels**
- **Action:**
  1. Inspect elements for ARIA attributes
- **Expected Result:**
  - aria-label on icon buttons
  - aria-describedby on form fields
  - aria-live on dynamic content
  - aria-invalid on errors

**Test Case 11.4: Color Contrast**
- **Action:**
  1. Use axe DevTools or Lighthouse
  2. Check contrast ratios
- **Expected Result:**
  - Text contrast ≥ 4.5:1 (normal text)
  - Text contrast ≥ 3:1 (large text)
  - UI element contrast ≥ 3:1

**Test Case 11.5: Form Labels**
- **Action:**
  1. Check all form inputs have labels
- **Expected Result:**
  - Every input has associated label
  - Labels are visible (not placeholder-only)
  - Required fields indicated

---

## Milestone 2: Receipt PDF System Testing

### Test Suite 12: PDF Generation

**Test Case 12.1: Generate Basic Receipt PDF**
- **Action:**
  1. Create order with 1 garment
  2. Complete payment
  3. Click "Download PDF"
- **Expected Result:**
  - PDF generates successfully
  - File downloads: `receipt-BRANCH-20250120-0001.pdf`
  - PDF opens in browser

**Test Case 12.2: PDF Content Accuracy**
- **Action:**
  1. Open generated PDF
  2. Verify all content
- **Expected Result:**
  - Company header: "Lorenzo Dry Cleaners"
  - Company address, phone, email
  - Company logo displayed
  - Order ID
  - Date and time
  - Customer name and phone
  - Garment list table:
    - Column headers: #, Item, Color, Services, Price
    - All garments listed
    - Services comma-separated
  - Subtotal line
  - Tax line (if applicable)
  - Total amount (bold)
  - Payment method
  - Amount paid
  - Balance (if partial payment)
  - Estimated completion date
  - Footer: "Thank you for choosing Lorenzo Dry Cleaners!"

**Test Case 12.3: PDF with Multiple Garments**
- **Action:**
  1. Create order with 10 garments
  2. Generate PDF
- **Expected Result:**
  - All 10 garments listed
  - Table formatting preserved
  - No text overflow
  - Total calculates correctly

**Test Case 12.4: PDF with Express Service**
- **Action:**
  1. Create order with express service
  2. Generate PDF
- **Expected Result:**
  - "Express" badge or indicator shows
  - Express charge itemized
  - Estimated completion shows 4 hours

**Test Case 12.5: PDF with Special Instructions**
- **Action:**
  1. Add garment with special instructions
  2. Generate PDF
- **Expected Result:**
  - Instructions appear in PDF
  - Formatted as notes section
  - Readable and clear

**Test Case 12.6: PDF with Company Logo**
- **Action:**
  1. Verify logo file exists: `public/images/lorenzo-logo.png`
  2. Generate PDF
- **Expected Result:**
  - Logo appears in header
  - Properly sized and positioned
  - Good quality (not pixelated)

**Test Case 12.7: PDF with Partial Payment**
- **Action:**
  1. Create order: KES 1000
  2. Pay partial: KES 600
  3. Generate PDF
- **Expected Result:**
  - Shows: Total Amount: KES 1000
  - Shows: Amount Paid: KES 600
  - Shows: Balance Due: KES 400
  - Balance is highlighted or in bold

**Test Case 12.8: PDF Formatting**
- **Action:**
  1. Check PDF appearance
- **Expected Result:**
  - Clean layout
  - Proper alignment
  - Adequate spacing
  - Professional appearance
  - Suitable for printing

### Test Suite 13: Email Receipt Functionality

**Test Case 13.1: Email Receipt to Customer**
- **Action:**
  1. Complete order
  2. Click "Email Receipt"
  3. Enter customer email (if not already provided)
- **Expected Result:**
  - Email sends via Resend API
  - Success message: "Receipt emailed to test@example.com"
  - Email arrives within 1 minute

**Test Case 13.2: Email Content**
- **Action:**
  1. Check customer's email inbox
  2. Open email from Lorenzo Dry Cleaners
- **Expected Result:**
  - Email subject: "Receipt for Order [OrderID] - Lorenzo Dry Cleaners"
  - From: "Lorenzo Dry Cleaners <receipts@lorenzo.com>"
  - Email body includes:
    - Greeting: "Dear [Customer Name],"
    - Order summary
    - Total amount
    - Payment status
    - Estimated completion
    - PDF attachment
    - Contact information
    - Footer with business details

**Test Case 13.3: Email with PDF Attachment**
- **Action:**
  1. Open email attachment
- **Expected Result:**
  - PDF attached to email
  - Filename: `receipt-[OrderID].pdf`
  - PDF is complete and accurate
  - Can open and print

**Test Case 13.4: Email Without Customer Email**
- **Action:**
  1. Create customer without email
  2. Try to email receipt
- **Expected Result:**
  - Prompts for email address
  - Shows input field
  - After entering email, sends successfully

**Test Case 13.5: Email Failure Handling**
- **Action:**
  1. Enter invalid email address
  2. Try to send
- **Expected Result:**
  - Validation error: "Please enter a valid email address"
  - Does not send

**Test Case 13.6: Resend API Integration**
- **Action:**
  1. Verify Resend API key is set
  2. Send test email
- **Expected Result:**
  - API call succeeds
  - No errors in console
  - Email delivers successfully

### Test Suite 14: Print Functionality

**Test Case 14.1: Print Receipt**
- **Action:**
  1. Complete order
  2. Click "Print" button
- **Expected Result:**
  - Browser print dialog opens
  - Receipt formatted for printing
  - Print preview looks clean

**Test Case 14.2: Thermal Printer Support**
- **Action:**
  1. Connect thermal printer (58mm or 80mm)
  2. Print receipt
- **Expected Result:**
  - Receipt prints correctly
  - Text is readable
  - No truncation
  - Proper line spacing

**Test Case 14.3: Print Multiple Copies**
- **Action:**
  1. Print receipt
  2. Click print again
- **Expected Result:**
  - Can print multiple times
  - Each print is identical
  - No degradation

---

## Milestone 3: Google Maps Testing

### Test Suite 15: Google Maps Setup

**Test Case 15.1: API Key Configuration**
- **Action:**
  1. Check `.env.local` for `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  2. Verify API key is valid
- **Expected Result:**
  - API key exists
  - Key has proper restrictions
  - Billing is enabled

**Test Case 15.2: API Key Permissions**
- **Action:**
  1. Check Google Cloud Console
  2. Verify enabled APIs
- **Expected Result:**
  - Maps JavaScript API: Enabled
  - Directions API: Enabled
  - Distance Matrix API: Enabled
  - Places API: Enabled
  - Geocoding API: Enabled

**Test Case 15.3: Map Component Loads**
- **Action:**
  1. Navigate to page with map
  2. Observe map rendering
- **Expected Result:**
  - Map loads successfully
  - Shows Nairobi, Kenya by default
  - No console errors
  - Zoom controls work

### Test Suite 16: Map Functionality

**Test Case 16.1: Display Address on Map**
- **Action:**
  1. Enter address: "Kilimani, Nairobi"
  2. Map should show location
- **Expected Result:**
  - Map centers on Kilimani
  - Marker placed at location
  - Info window shows address

**Test Case 16.2: Geocoding**
- **Action:**
  1. Enter text address
  2. System converts to lat/lng
- **Expected Result:**
  - Geocoding API called
  - Returns coordinates
  - Places marker accurately

**Test Case 16.3: Reverse Geocoding**
- **Action:**
  1. Click on map
  2. System converts lat/lng to address
- **Expected Result:**
  - Gets readable address
  - Displays in UI
  - Can be used in forms

**Test Case 16.4: Multiple Markers**
- **Action:**
  1. Show delivery route with 5 stops
- **Expected Result:**
  - 5 markers appear
  - Each numbered (1, 2, 3, 4, 5)
  - Different colors for different statuses

**Test Case 16.5: Directions Rendering**
- **Action:**
  1. Request directions between two points
- **Expected Result:**
  - Route draws on map
  - Blue line shows path
  - Distance displayed
  - Estimated time shown

---

## Milestone 4: Delivery Batch Management Testing

### Test Suite 17: Batch Creation

**Test Case 17.1: Select Orders for Delivery**
- **Action:**
  1. Navigate to deliveries page
  2. Filter orders: status = "ready", deliveryType = "delivery"
  3. Select 5 orders using checkboxes
- **Expected Result:**
  - Orders displayed in table
  - Checkboxes functional
  - Selection count updates
  - "Create Batch" button enables

**Test Case 17.2: Create Delivery Batch**
- **Action:**
  1. Select orders
  2. Click "Create Batch"
  3. Assign driver from dropdown
  4. Set delivery date
  5. Click "Create Batch"
- **Expected Result:**
  - Batch creates in database
  - Batch ID generated
  - Status: "pending"
  - Orders update with batchId
  - Redirects to batch details

**Test Case 17.3: Batch Validation**
- **Action:**
  1. Try to create batch without selecting orders
- **Expected Result:**
  - Error: "Please select at least one order"
  - Batch does not create

**Test Case 17.4: Driver Assignment**
- **Action:**
  1. Create batch
  2. Assign to "Driver 1"
- **Expected Result:**
  - Driver ID saved in batch
  - Driver can see batch in their dashboard
  - Driver receives notification (if implemented)

---

## Milestone 5: Route Optimization Testing

### Test Suite 18: Route Planning

**Test Case 18.1: Optimize Route**
- **Action:**
  1. Create batch with 5 delivery addresses
  2. Click "Optimize Route"
- **Expected Result:**
  - System calculates optimal order
  - Stops reordered by efficiency
  - Shows total distance
  - Shows estimated time
  - Uses Google Directions API

**Test Case 18.2: Route Visualization**
- **Action:**
  1. View optimized route on map
- **Expected Result:**
  - Map shows all stops
  - Numbered markers (1-5)
  - Route line connects stops in order
  - Branch as starting point (green)
  - Delivery stops (red)

**Test Case 18.3: Distance Calculation**
- **Action:**
  1. Check total distance for route
- **Expected Result:**
  - Distance shown in km
  - Accurate calculation
  - Updates if route changes

**Test Case 18.4: Time Estimation**
- **Action:**
  1. Check estimated delivery time
- **Expected Result:**
  - Considers traffic conditions
  - Shows time for entire route
  - Shows time to each stop

---

## Milestone 6: Driver Dashboard Testing

### Test Suite 19: Driver Login

**Test Case 19.1: Driver Authentication**
- **Action:**
  1. Login as driver user
  2. Role: "driver"
- **Expected Result:**
  - Redirects to driver dashboard
  - Shows assigned batches
  - Mobile-optimized interface

### Test Suite 20: Batch Navigation

**Test Case 20.1: View Assigned Batches**
- **Action:**
  1. Driver dashboard loads
- **Expected Result:**
  - Lists all assigned batches
  - Shows status: pending, in_progress, completed
  - Can filter by status

**Test Case 20.2: Start Delivery**
- **Action:**
  1. Click on batch
  2. Click "Start Delivery"
- **Expected Result:**
  - Batch status updates to "in_progress"
  - Shows first delivery stop
  - Map shows route
  - Can navigate with Google Maps

**Test Case 20.3: Navigate to Stop**
- **Action:**
  1. Click "Navigate" button for stop
- **Expected Result:**
  - Opens Google Maps app (mobile)
  - Opens Google Maps web (desktop)
  - Pre-filled with destination address

**Test Case 20.4: Mark Delivery Complete**
- **Action:**
  1. At delivery location
  2. Click "Mark as Delivered"
  3. Optionally add note
  4. Click "Confirm"
- **Expected Result:**
  - Stop status updates to "completed"
  - Moves to next stop
  - Timestamp recorded
  - Can upload proof of delivery photo

**Test Case 20.5: Complete All Deliveries**
- **Action:**
  1. Mark all stops as completed
- **Expected Result:**
  - Batch status updates to "completed"
  - Returns to batch list
  - Success message

---

## Milestone 7: Inventory Management Testing

### Test Suite 21: Inventory Dashboard

**Test Case 21.1: View Inventory**
- **Action:**
  1. Navigate to /inventory
- **Expected Result:**
  - Displays all inventory items
  - Shows: name, category, quantity, unit, reorder level
  - Can search and filter

**Test Case 21.2: Add New Inventory Item**
- **Action:**
  1. Click "Add Item"
  2. Fill form:
     - Name: "Detergent Powder"
     - Category: "Cleaning Supplies"
     - Quantity: 50
     - Unit: "kg"
     - Reorder Level: 10
     - Supplier: "Supplier XYZ"
  3. Click "Add Item"
- **Expected Result:**
  - Item creates in database
  - Appears in inventory list
  - Success toast

**Test Case 21.3: Update Stock Quantity**
- **Action:**
  1. Click "Adjust Stock" on item
  2. Enter new quantity: +20
  3. Select reason: "Purchase"
  4. Click "Update"
- **Expected Result:**
  - Quantity increases by 20
  - Transaction logged in history
  - Timestamp and user recorded

**Test Case 21.4: Low Stock Alert**
- **Action:**
  1. Set item quantity below reorder level
- **Expected Result:**
  - Item shows red indicator
  - Shows in "Low Stock" section
  - Email notification sent (if configured)

---

## Milestone 8: Inventory Alerts Testing

### Test Suite 22: Automated Alerts

**Test Case 22.1: Daily Stock Check**
- **Action:**
  1. Cloud Function runs at 9 AM daily
- **Expected Result:**
  - Checks all inventory items
  - Identifies items below reorder level
  - Sends email to managers

**Test Case 22.2: Email Alert Content**
- **Action:**
  1. Receive low stock email
- **Expected Result:**
  - Subject: "Low Stock Alert - Lorenzo Dry Cleaners"
  - Lists all low stock items
  - Shows current quantity and reorder level
  - Suggests reorder amounts

---

## Milestone 9: Employee Management Testing

### Test Suite 23: Employee Dashboard

**Test Case 23.1: View Employees**
- **Action:**
  1. Navigate to /employees
- **Expected Result:**
  - Lists all employees
  - Shows: name, role, branch, status
  - Can filter and search

**Test Case 23.2: Add New Employee**
- **Action:**
  1. Click "Add Employee"
  2. Fill form with details
  3. Click "Create"
- **Expected Result:**
  - Employee creates in database
  - Appears in list
  - Can be assigned tasks

**Test Case 23.3: Clock In/Out**
- **Action:**
  1. Employee clicks "Clock In"
- **Expected Result:**
  - Attendance record creates
  - Records timestamp
  - Shows as "On Duty"

**Test Case 23.4: Productivity Tracking**
- **Action:**
  1. View employee profile
- **Expected Result:**
  - Shows orders processed
  - Shows hours worked
  - Shows performance metrics

---

## Milestone 12: WhatsApp Integration Testing

### Test Suite 24: Wati.io Setup

**Test Case 24.1: Wati.io Account**
- **Action:**
  1. Login to Wati.io dashboard
  2. Verify account is active
- **Expected Result:**
  - Account status: Active
  - WhatsApp Business number linked
  - API credentials valid

**Test Case 24.2: Message Templates**
- **Action:**
  1. Check Wati.io dashboard
  2. Verify all 6 templates
- **Expected Result:**
  - order_confirmation: Approved
  - order_ready: Approved
  - driver_dispatched: Approved
  - driver_nearby: Approved
  - order_delivered: Approved
  - payment_reminder: Approved

### Test Suite 25: Notification Sending

**Test Case 25.1: Order Confirmation Notification**
- **Action:**
  1. Create new order
  2. Complete payment
- **Expected Result:**
  - WhatsApp message sent to customer
  - Message content matches template
  - Variables filled correctly (name, order ID, amount, date)
  - Delivers within 30 seconds

**Test Case 25.2: Order Ready Notification**
- **Action:**
  1. Update order status to "ready"
- **Expected Result:**
  - WhatsApp notification sent
  - Message: "Your order [ID] is ready for pickup"
  - Includes branch address and hours

**Test Case 25.3: Driver Dispatched Notification**
- **Action:**
  1. Create delivery batch
  2. Assign driver
- **Expected Result:**
  - Customer receives notification
  - Shows driver name and phone
  - Shows estimated arrival time

**Test Case 25.4: Driver Nearby Notification**
- **Action:**
  1. Driver approaches delivery (within 2km)
- **Expected Result:**
  - Triggers proximity alert
  - Customer receives "driver nearby" message
  - Shows ETA: "5 minutes"

**Test Case 25.5: Delivery Confirmation**
- **Action:**
  1. Driver marks delivery complete
- **Expected Result:**
  - Customer receives confirmation
  - Thanks customer
  - Includes feedback link

**Test Case 25.6: Payment Reminder**
- **Action:**
  1. Order with unpaid balance > 7 days
  2. Scheduled function runs
- **Expected Result:**
  - Sends payment reminder
  - Shows amount due
  - Includes payment link

### Test Suite 26: Error Handling

**Test Case 26.1: Invalid Phone Number**
- **Action:**
  1. Try to send message to invalid number
- **Expected Result:**
  - Error logged
  - Does not block order creation
  - Retries later

**Test Case 26.2: Wati.io API Down**
- **Action:**
  1. Simulate API failure
- **Expected Result:**
  - Queues message
  - Retries after 5 minutes
  - Falls back to SMS after 3 failures

**Test Case 26.3: Rate Limiting**
- **Action:**
  1. Send 100 messages in 1 minute
- **Expected Result:**
  - Respects rate limits
  - Queues excess messages
  - Sends progressively

---

## Milestone 13: AI Features Testing

### Test Suite 27: OpenAI Setup

**Test Case 27.1: OpenAI API Key**
- **Action:**
  1. Verify OPENAI_API_KEY in .env.local
  2. Test API connection
- **Expected Result:**
  - API key valid
  - Can make requests
  - Usage limits set ($50/month)

### Test Suite 28: Completion Time Estimation

**Test Case 28.1: Estimate Standard Order**
- **Action:**
  1. Create order with 3 garments, standard services
  2. AI estimates completion time
- **Expected Result:**
  - Returns estimate: ~24-48 hours
  - Confidence level: 0.7-0.9
  - Displays in UI
  - Staff can override

**Test Case 28.2: Estimate Express Order**
- **Action:**
  1. Create order with express service
- **Expected Result:**
  - AI adjusts estimate: ~4 hours
  - Higher confidence for express
  - Updates automatically

**Test Case 28.3: Track Estimation Accuracy**
- **Action:**
  1. Compare AI estimates to actual completion
  2. View accuracy dashboard
- **Expected Result:**
  - Shows accuracy metrics
  - Mean absolute error < 20%
  - Improves over time

### Test Suite 29: Analytics Insights

**Test Case 29.1: Generate Weekly Insights**
- **Action:**
  1. Navigate to /insights
  2. Click "Generate Insights"
- **Expected Result:**
  - AI analyzes week's data
  - Returns 5 actionable insights
  - Displays with icons
  - Takes < 10 seconds

**Test Case 29.2: Insight Quality**
- **Action:**
  1. Read generated insights
- **Expected Result:**
  - Specific and actionable
  - Based on actual data
  - Relevant to business
  - Example: "Tuesday shows 40% more orders - consider adding staff"

**Test Case 29.3: Trend Prediction**
- **Action:**
  1. View predictions for next week
- **Expected Result:**
  - Predicts order volume
  - Predicts revenue
  - Suggests staffing levels

### Test Suite 30: Report Summarization

**Test Case 30.1: Summarize Daily Report**
- **Action:**
  1. Generate daily report
  2. AI summarizes
- **Expected Result:**
  - 3-4 sentence summary
  - Highlights key metrics
  - Identifies concerns
  - Suggests actions
  - Professional tone

**Test Case 30.2: Executive Summary**
- **Action:**
  1. Generate monthly summary
- **Expected Result:**
  - One-page summary
  - Top 3 achievements
  - Top 3 concerns
  - Recommendations

### Test Suite 31: Customer Behavior Analysis

**Test Case 31.1: Analyze High-Value Customer**
- **Action:**
  1. View customer profile
  2. Click "AI Analysis"
- **Expected Result:**
  - Segment: "VIP"
  - CLV prediction: KES 50,000
  - Recommended offer: "10% loyalty discount"
  - Next order date estimate

**Test Case 31.2: Identify At-Risk Customer**
- **Action:**
  1. Customer hasn't ordered in 60 days
  2. Run analysis
- **Expected Result:**
  - Segment: "At-Risk"
  - Generates win-back offer
  - Drafts personalized message
  - Suggests contact timing

---

## Milestone 14: Final Integration Testing

### Test Suite 32: End-to-End Workflow

**Test Case 32.1: Complete Customer Journey**
- **Action:**
  1. Customer calls to book service
  2. Staff creates order in POS
  3. AI estimates completion time
  4. WhatsApp confirmation sent
  5. Order processed
  6. Status updated to ready
  7. WhatsApp ready notification
  8. Delivery batch created
  9. Driver assigned
  10. Route optimized
  11. WhatsApp driver dispatch
  12. Driver completes delivery
  13. WhatsApp delivery confirmation
  14. Customer feedback request
- **Expected Result:**
  - All steps execute smoothly
  - No errors at any point
  - Notifications deliver correctly
  - Data consistent across systems

**Test Case 32.2: Multi-Branch Operations**
- **Action:**
  1. Create orders at Branch A
  2. Transfer to Branch B
  3. Process at Branch B
- **Expected Result:**
  - Branch isolation maintained
  - Transfers track correctly
  - Reports accurate per branch

---

## Cross-Browser Testing

### Test Suite 33: Browser Compatibility

**Test Case 33.1: Chrome Desktop**
- **Version:** Latest
- **Action:** Complete all workflows
- **Expected Result:** Full functionality

**Test Case 33.2: Firefox Desktop**
- **Version:** Latest
- **Action:** Complete all workflows
- **Expected Result:** Full functionality

**Test Case 33.3: Safari Desktop**
- **Version:** Latest
- **Action:** Complete all workflows
- **Expected Result:** Full functionality

**Test Case 33.4: Edge Desktop**
- **Version:** Latest
- **Action:** Complete all workflows
- **Expected Result:** Full functionality

**Test Case 33.5: Chrome Mobile (Android)**
- **Version:** Latest
- **Action:** Test driver dashboard and POS
- **Expected Result:** Mobile-optimized, fully functional

**Test Case 33.6: Safari Mobile (iOS)**
- **Version:** Latest
- **Action:** Test driver dashboard and POS
- **Expected Result:** Mobile-optimized, fully functional

---

## Performance Testing

### Test Suite 34: Load Testing

**Test Case 34.1: Page Load Speed**
- **Action:**
  1. Measure page load times
  2. Use Lighthouse
- **Expected Result:**
  - POS page: < 2 seconds
  - Dashboard: < 1.5 seconds
  - Performance score: > 90

**Test Case 34.2: Concurrent Orders**
- **Action:**
  1. Create 50 orders simultaneously
- **Expected Result:**
  - System handles load
  - No errors
  - Response time < 3 seconds

**Test Case 34.3: Large Dataset**
- **Action:**
  1. Load page with 1000+ orders
- **Expected Result:**
  - Pagination or virtualization
  - No lag
  - Smooth scrolling

---

## Security Testing

### Test Suite 35: Authentication

**Test Case 35.1: Unauthorized Access**
- **Action:**
  1. Try to access /pos without login
- **Expected Result:**
  - Redirects to login
  - Shows: "Please login to continue"

**Test Case 35.2: Role-Based Access**
- **Action:**
  1. Login as "driver" role
  2. Try to access admin pages
- **Expected Result:**
  - Access denied
  - Error: "Insufficient permissions"

---

## Summary

**Total Test Cases:** 200+
**Estimated Testing Time:** 40-50 hours
**Critical Test Suites:** 1-11 (POS), 24-26 (WhatsApp), 27-31 (AI)
**Recommended Testing Order:**
1. POS Page (P0 Priority)
2. Receipt Generation
3. Payment Processing
4. Delivery Management
5. WhatsApp Notifications
6. AI Features
7. Integration Testing
8. Performance & Security

**Testing Tools Required:**
- Chrome DevTools
- Firefox Developer Tools
- Lighthouse
- axe DevTools (accessibility)
- Postman (API testing)
- Actual mobile devices
- Screen reader (NVDA/JAWS)

**Environment Requirements:**
- Development environment
- Staging environment (recommended)
- Test user accounts (multiple roles)
- Test customer phone numbers
- Test WhatsApp number
- Test OpenAI API key with budget limits

---

**Document Version:** 1.0
**Last Updated:** October 20, 2025
**Maintained By:** Development Team
