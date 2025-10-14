# Testing Notes - Milestone 1 & 2

**Date:** October 14, 2025

---

## ✅ Issues Fixed

### Issue 1: Customer Portal Error for Staff Users

**Problem:** When accessing `/portal` as a staff user (admin/manager), the page showed "Failed to load orders."

**Cause:** The customer portal was trying to fetch orders using `getOrdersByCustomer(user.uid)`, but staff users don't have customer orders associated with their user ID.

**Solution:**
- Updated the customer portal to detect staff users in development mode
- Returns empty array for staff users instead of trying to fetch non-existent orders
- Added helpful dev mode notice explaining that staff users won't have customer data
- Shows proper empty state for staff users viewing the portal

**Files Changed:**
- `app/(customer)/portal/page.tsx`

---

## 🧪 How to Properly Test Features

### Testing Customer Portal

You have **three options** to test the customer portal:

#### Option 1: Use Customer OTP Login (Recommended)
1. Navigate to `/customer-login`
2. Enter a Kenya phone number (e.g., +254712345678)
3. Click "Send OTP"
4. Check browser console for the OTP
5. Enter the OTP on the verification page
6. You'll be logged in as a customer and redirected to `/portal`
7. ✅ **Now create orders for this customer using POS**
8. ✅ **Portal will show those orders**

#### Option 2: Create a Test Customer Account
1. Use POS to create a new customer
2. Note the customer's phone number
3. Logout from staff account
4. Login using customer OTP flow (Option 1)
5. ✅ **Any orders created for this customer will appear**

#### Option 3: Use Dev Login to Portal (Limited)
1. Navigate to `/customer-login`
2. Click "Quick Login to Customer Portal" button
3. You'll be logged in as admin but viewing `/portal`
4. ⚠️ **Note:** You won't see any orders because admin users don't have customer orders
5. ℹ️ **This is for UI/layout testing only**

---

## 📝 Complete Testing Workflow

### For Complete Customer Portal Testing:

1. **Create Test Data (As Staff User)**
   - Login as staff (use Dev Quick Login on `/login`)
   - Go to POS (`/dashboard/pos`)
   - Create a new customer (phone: +254712345678)
   - Create an order for this customer
   - Add garments, process payment
   - Note the Order ID

2. **Test Customer Portal (As Customer)**
   - Logout from staff account
   - Go to `/customer-login`
   - Enter the customer phone (+254712345678)
   - Get OTP from console and verify
   - ✅ **Now you're in the portal as that customer**
   - ✅ **You should see the order you created**

3. **Test Real-Time Updates**
   - Keep customer portal open
   - In another browser/incognito window, login as staff
   - Go to pipeline and update the order status
   - ✅ **Customer portal should update in real-time**

---

## 🎯 Testing Checklist Updates

Based on the fixes, update your testing checklist:

### ✅ Customer Portal Testing - Corrected Steps

**Prerequisites:**
- Have at least one customer created in POS
- Have at least one order created for that customer

**Test Steps:**

1. **Customer Login Flow**
   - [ ] Navigate to `/customer-login`
   - [ ] Enter customer phone number
   - [ ] Receive OTP (check console in dev mode)
   - [ ] Verify OTP successfully
   - [ ] Redirected to `/portal`

2. **Customer Dashboard**
   - [ ] Customer name displayed correctly
   - [ ] Active orders section shows orders
   - [ ] If customer has orders, they appear in list
   - [ ] If customer has no orders, empty state shows
   - [ ] No error messages appear

3. **Dev Mode Testing (Staff User)**
   - [ ] Navigate to `/customer-login`
   - [ ] Click "Quick Login to Customer Portal"
   - [ ] Redirected to `/portal`
   - [ ] Dev mode notice appears explaining you're viewing as staff
   - [ ] Empty state shows (no customer orders)
   - [ ] No error messages appear

---

## 🐛 Known Limitations in Development Mode

### Customer Portal
- Staff users viewing `/portal` will see empty state (no orders)
- This is expected - staff users don't have customer orders
- To test with real data, use customer OTP login

### Roles & Permissions
- In development mode, staff can access `/portal` for testing
- In production mode, only customers can access `/portal`
- This is controlled by `process.env.NODE_ENV` checks

---

## 💡 Quick Testing Tips

### Create Test Orders Quickly

```javascript
// Staff workflow:
1. Login as staff (Dev Quick Login)
2. Go to POS
3. Search customer by phone
4. If not found, create new customer
5. Add garments (minimum: type, color, services)
6. Process cash payment
7. Complete order

// Customer workflow:
1. Logout from staff
2. Go to /customer-login
3. Enter customer phone
4. Verify OTP
5. View orders in portal
```

### Testing Order Status Updates

```javascript
// Setup: Need 2 browser windows/sessions
Window 1: Customer logged in, viewing /portal (order tracking)
Window 2: Staff logged in, viewing /dashboard/pipeline

// Test:
1. In Window 2 (Staff), update order status
2. In Window 1 (Customer), watch order status update in real-time
3. ✅ Should update within 1-2 seconds
```

---

## 📊 Current Status

### ✅ Working Features
- Authentication (Staff Email/Password)
- Authentication (Customer Phone OTP)
- POS System (Order Creation)
- Payment Processing (Cash, Credit)
- Pipeline Board (Order Management)
- Customer Portal (with proper role handling)
- Real-time updates

### ⚠️ Limitations
- Pesapal integration (needs sandbox testing)
- Receipt PDF generation (needs testing)
- WhatsApp notifications (not yet implemented - Milestone 3)
- Google Maps (not yet implemented - Milestone 3)
- AI features (not yet implemented - Milestone 3)

---

## 🚀 Next Steps

1. ✅ Complete Milestone 1 & 2 testing using checklist
2. ✅ Create test customers and orders
3. ✅ Test real-time updates between staff and customer portals
4. ✅ Document any bugs found
5. ✅ Get sign-off on Milestone 1 & 2
6. ⏭️ Move to Milestone 3 (Advanced Features)

---

## 📝 Notes for Future Testing

### Creating Realistic Test Data

For thorough testing, create:
- **5-10 customers** with valid Kenya phone numbers
- **20-30 orders** in various statuses
- **Different payment methods** (cash, credit, partial)
- **Multiple garment types** per order
- **Orders with photos** (test image upload)
- **Orders with special instructions**

### Database Seeding Script (Future)

Consider creating a seed script:
```bash
npm run db:seed
```

This would automatically create test data including:
- Test customers
- Test orders
- Test transactions
- Various order statuses

---

**Remember:** Always test with realistic data and user flows. Don't just test the "happy path" - test edge cases, errors, and boundary conditions!

---

**Last Updated:** October 14, 2025
**Status:** Issues fixed, ready for comprehensive testing
