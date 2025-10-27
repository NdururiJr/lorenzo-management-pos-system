# Quick Test Guide - Critical Features Only

**Purpose:** Rapid testing checklist for essential functionality
**Time Required:** 2-3 hours
**Last Updated:** October 20, 2025

---

## 🚀 Quick Start Testing

### Prerequisites (5 minutes)

1. **Start the development server:**
   ```bash
   cd c:\Users\HomePC\Desktop\lorenzo-workspace\lorenzo-dry-cleaners
   npm run dev
   ```
   ✅ Server runs on http://localhost:3000

2. **Login to application:**
   - Navigate to http://localhost:3000
   - Login with test credentials
   - ✅ Dashboard loads successfully

---

## ⚡ Critical Test Suite (30 minutes)

### 1. POS Page - Complete Order Flow (10 minutes)

**Test Steps:**

1. Navigate to http://localhost:3000/pos
   - ✅ Page loads (no 404 error)
   - ✅ Shows "Point of Sale" header

2. Search and select customer:
   - Enter phone: "+254712345678"
   - Click "Search"
   - ✅ Customer found
   - Click "Select Customer"
   - ✅ Customer selected successfully

3. Add garments:
   - Select type: "Shirt"
   - Enter color: "White"
   - Check services: "Wash" + "Iron"
   - ✅ Price calculates (e.g., KES 300)
   - Click "Add Garment"
   - ✅ Garment appears in list
   - Repeat for 2 more garments

4. Review order:
   - ✅ Shows 3 garments
   - ✅ Subtotal is correct
   - ✅ "Process Payment" button enabled

5. Process payment:
   - Click "Process Payment"
   - ✅ Order creates (shows order ID)
   - ✅ Payment modal opens
   - Select "Cash"
   - Enter amount (full payment)
   - Click "Complete Payment"
   - ✅ Payment processes successfully

6. View receipt:
   - ✅ Receipt preview opens
   - ✅ All order details displayed
   - Click "Download PDF"
   - ✅ PDF downloads successfully
   - ✅ PDF contains all information

**PASS CRITERIA:** All 6 steps complete without errors

---

### 2. Customer Management (5 minutes)

**Test Steps:**

1. Create new customer:
   - On POS page, click "Create New Customer"
   - Fill form:
     - Name: "Test Customer"
     - Phone: "+254700000999"
     - Email: "test@test.com"
   - Click "Create"
   - ✅ Customer creates successfully
   - ✅ Auto-selected for order

2. Search existing customer:
   - Click "Change Customer"
   - Search for customer created above
   - ✅ Customer found
   - ✅ Can select and use

**PASS CRITERIA:** Can create and search customers

---

### 3. Receipt PDF Generation (5 minutes)

**Test Steps:**

1. Complete an order (use steps from #1)
2. Download PDF receipt
3. Open PDF and verify:
   - ✅ Company name and logo
   - ✅ Order ID
   - ✅ Customer details
   - ✅ Garment list with prices
   - ✅ Total amount
   - ✅ Payment information
   - ✅ Estimated completion date

**PASS CRITERIA:** PDF generates with all required information

---

### 4. Order Pipeline (5 minutes)

**Test Steps:**

1. Navigate to http://localhost:3000/pipeline
   - ✅ Pipeline page loads
   - ✅ Shows order statuses:
     - Received
     - Processing
     - Ready
     - Delivered

2. Find order created in Test #1:
   - ✅ Order appears in "Received" column
   - Can drag to "Processing"
   - ✅ Status updates

3. Update order status:
   - Drag order through pipeline
   - ✅ Each status change saves
   - ✅ Timestamps update

**PASS CRITERIA:** Orders flow through pipeline

---

### 5. Authentication & Permissions (3 minutes)

**Test Steps:**

1. Logout:
   - Click user menu
   - Click "Logout"
   - ✅ Redirects to login

2. Try to access protected route:
   - Navigate to http://localhost:3000/pos
   - ✅ Redirects to login
   - ✅ Shows "Please login" message

3. Login again:
   - Enter credentials
   - ✅ Redirects to dashboard
   - ✅ User data loads

**PASS CRITERIA:** Authentication protects routes

---

### 6. Mobile Responsiveness (2 minutes)

**Test Steps:**

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Navigate through app:
   - Dashboard ✅
   - POS page ✅
   - Pipeline ✅

5. Check layout:
   - ✅ Single column on mobile
   - ✅ No horizontal scroll
   - ✅ Touch targets ≥ 44px
   - ✅ Text readable

**PASS CRITERIA:** App is usable on mobile

---

## 🔍 Feature Verification (1 hour)

### 7. Database Functions

**Orders:**
```bash
# Open Firestore console
# Check "orders" collection
```
- ✅ Orders save correctly
- ✅ All fields populated
- ✅ Timestamps accurate

**Customers:**
- ✅ Customers save with all data
- ✅ Phone numbers formatted correctly
- ✅ Can query by phone

**Transactions:**
- ✅ Payments create transactions
- ✅ Links to order
- ✅ Amount and method recorded

---

### 8. Google Maps Integration

**Test if implemented:**

1. Navigate to delivery/route page
2. Check if map loads:
   - ✅ Map displays
   - ✅ Can place markers
   - ✅ Shows locations
   - ✅ API key works

**If not implemented:** Skip this test

---

### 9. Inventory Management

**Test if implemented:**

1. Navigate to /inventory
2. Check inventory list:
   - ✅ Items display
   - ✅ Can add new items
   - ✅ Can adjust quantities
   - ✅ Low stock indicators work

**If not implemented:** Note in results

---

### 10. Employee Management

**Test if implemented:**

1. Navigate to /employees
2. Check employee features:
   - ✅ List employees
   - ✅ Add new employee
   - ✅ Clock in/out functionality
   - ✅ Productivity tracking

**If not implemented:** Note in results

---

## 🎯 WhatsApp Integration Tests (if implemented)

### 11. WhatsApp Notifications

**Setup required:**
- Wati.io account active
- API credentials in .env.local

**Test Steps:**

1. Create order (POS flow)
2. Check customer's WhatsApp:
   - ✅ Receives order confirmation
   - ✅ Message content is correct
   - ✅ Variables filled (name, order ID, amount)

3. Update order to "ready":
   - ✅ Customer receives "order ready" notification

**If not implemented:** Note in results

---

## 🤖 AI Features Tests (if implemented)

### 12. OpenAI Integration

**Setup required:**
- OpenAI API key in .env.local

**Test Steps:**

1. Create order and check AI estimate:
   - ✅ AI suggests completion time
   - ✅ Confidence level shown
   - ✅ Can override manually

2. Navigate to /insights:
   - ✅ Generate weekly insights
   - ✅ Insights are relevant
   - ✅ Takes < 10 seconds

**If not implemented:** Note in results

---

## 📊 Performance Tests (30 minutes)

### 13. Load Time

**Test with Lighthouse:**

```bash
# Open Chrome DevTools
# Go to Lighthouse tab
# Run audit for "Performance"
```

**Target Scores:**
- ✅ Performance: > 90
- ✅ Accessibility: > 90
- ✅ Best Practices: > 90
- ✅ SEO: > 80

### 14. Page Load Speed

**Measure key pages:**

| Page | Target | Actual | Pass/Fail |
|------|--------|--------|-----------|
| Dashboard | < 2s | ___ | ___ |
| POS | < 2s | ___ | ___ |
| Pipeline | < 2s | ___ | ___ |
| Orders List | < 2.5s | ___ | ___ |

---

## 🔒 Security Tests (15 minutes)

### 15. Authentication

- ✅ Cannot access app without login
- ✅ Sessions expire after timeout
- ✅ Logout clears session

### 16. Authorization

- ✅ Drivers cannot access admin pages
- ✅ Staff cannot modify system settings
- ✅ Role-based permissions work

### 17. Data Security

- ✅ API keys not exposed in browser
- ✅ Firestore rules prevent unauthorized access
- ✅ Sensitive data encrypted

---

## 📝 Test Results Template

```
TEST DATE: _______________
TESTER: _______________
ENVIRONMENT: Development / Staging / Production

CRITICAL TESTS (Must Pass):
[ ] Test 1: POS Order Flow - PASS / FAIL
[ ] Test 2: Customer Management - PASS / FAIL
[ ] Test 3: Receipt PDF - PASS / FAIL
[ ] Test 4: Order Pipeline - PASS / FAIL
[ ] Test 5: Authentication - PASS / FAIL
[ ] Test 6: Mobile Responsive - PASS / FAIL

FEATURE TESTS:
[ ] Test 7: Database Functions - PASS / FAIL / N/A
[ ] Test 8: Google Maps - PASS / FAIL / N/A
[ ] Test 9: Inventory - PASS / FAIL / N/A
[ ] Test 10: Employees - PASS / FAIL / N/A
[ ] Test 11: WhatsApp - PASS / FAIL / N/A
[ ] Test 12: AI Features - PASS / FAIL / N/A

PERFORMANCE TESTS:
[ ] Test 13: Lighthouse Score - PASS / FAIL
[ ] Test 14: Load Speed - PASS / FAIL

SECURITY TESTS:
[ ] Test 15-17: Security - PASS / FAIL

OVERALL RESULT: PASS / FAIL
CRITICAL BUGS: _______________
NOTES: _______________
```

---

## 🚨 What to Do If Tests Fail

### Common Issues and Fixes:

**1. POS Page 404:**
- File missing: Create `app/(dashboard)/pos/page.tsx`
- See JERRY_TASKS.md Milestone 0.5 for implementation

**2. API Errors:**
- Check .env.local variables
- Verify Firebase config
- Check API key permissions

**3. Database Errors:**
- Verify Firestore rules
- Check indexes deployed
- Ensure collections exist

**4. PDF Generation Fails:**
- Verify jsPDF installed: `npm list jspdf`
- Check receipt functions exist in `lib/receipts/`
- Ensure logo file exists: `public/images/lorenzo-logo.png`

**5. WhatsApp Not Sending:**
- Verify Wati.io credentials
- Check API key is valid
- Ensure templates are approved

**6. AI Features Not Working:**
- Verify OpenAI API key
- Check usage limits not exceeded
- Ensure openai npm package installed

---

## 📞 Support

**Issues?** Check:
1. Console errors (F12)
2. Network tab for failed requests
3. Firebase console for database issues
4. Environment variables are set

**Documentation:**
- Full testing: See TESTING_CHECKLIST.md
- Implementation: See JERRY_TASKS.md
- Setup: See SETUP_GUIDE.md

---

**Next Steps After Testing:**
1. Document all test results
2. Create bug tickets for failures
3. Prioritize fixes (P0 > P1 > P2)
4. Retest after fixes
5. Sign off for deployment

**Ready for Production When:**
- ✅ All critical tests pass (Tests 1-6)
- ✅ No P0 or P1 bugs
- ✅ Performance meets targets
- ✅ Security tests pass
- ✅ Mobile experience acceptable
