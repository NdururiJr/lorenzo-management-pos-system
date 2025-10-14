# Dev Customer Account Credentials

This document contains the credentials for the development customer account used for testing the customer portal.

---

## 🔑 Dev Customer Account

**Purpose:** Testing customer portal features, order tracking, and profile management

### Login Credentials

**Phone Number:** `+254712000001`
**Email:** `customer@lorenzo-dev.com`
**Password:** `DevCustomer123!` _(if using email/password login)_

### Customer Details

**Name:** Dev Customer
**Address:** Home - Kilimani, Nairobi
**Preferences:**
- Notifications: Enabled
- Language: English

---

## 🧪 How to Use This Account

### Option 1: Phone OTP Login (Recommended)

1. Navigate to: `http://localhost:3000/customer-login`
2. Enter phone number: `+254712000001`
3. Click "Send OTP"
4. Check browser console for OTP
5. Enter OTP and verify
6. You'll be redirected to `/portal`

### Option 2: Create Account Manually (Current Method)

Since we don't have Firebase Admin SDK set up yet, create the account manually:

1. **Create Customer in POS:**
   - Login as staff (Dev Quick Login on `/login`)
   - Go to POS (`/dashboard/pos`)
   - Click "Create New Customer"
   - Fill in:
     - Name: `Dev Customer`
     - Phone: `+254712000001`
     - Email: `customer@lorenzo-dev.com`
     - Address: `Home - Kilimani, Nairobi`
   - Save customer

2. **Create Sample Orders:**
   - With the customer selected, create 3-4 orders
   - Add various garments (shirts, trousers, dress, suit)
   - Process payments (cash, M-Pesa, credit)
   - Complete the orders

3. **Login as Customer:**
   - Logout from staff account
   - Go to `/customer-login`
   - Enter phone: `+254712000001`
   - Get OTP from console
   - Verify OTP
   - ✅ You should now see the orders you created!

---

## 📦 Sample Order Data (For Manual Creation)

### Order 1: In Progress
- **Garments:**
  - White Shirt (Tommy Hilfiger) - Dry Clean + Iron - KES 300
  - Black Trousers (Zara) - Dry Clean + Iron - KES 400
- **Total:** KES 700
- **Status:** Washing
- **Payment:** Paid (Cash)

### Order 2: Ready for Pickup
- **Garments:**
  - Blue Dress (H&M) - Wash + Iron - KES 500
- **Total:** KES 500
- **Status:** Ready
- **Payment:** Paid (M-Pesa)

### Order 3: Completed
- **Garments:**
  - Navy Blue Suit (Hugo Boss) - Dry Clean + Iron - KES 800
  - Light Blue Shirt (Ralph Lauren) - Dry Clean + Iron - KES 300
- **Total:** KES 1,100
- **Status:** Delivered
- **Payment:** Paid (Cash)

---

## 🎯 Testing Checklist

Once you have the dev customer account with orders:

### Customer Portal Features to Test

- [ ] **Login Flow**
  - [ ] Phone OTP login works
  - [ ] OTP verification successful
  - [ ] Redirects to portal

- [ ] **Dashboard**
  - [ ] Customer name displayed correctly
  - [ ] Active orders shown (In Progress orders)
  - [ ] Recent completed orders shown
  - [ ] Order counts accurate

- [ ] **Order Tracking**
  - [ ] Click on an order
  - [ ] Order details displayed
  - [ ] Status timeline shows correctly
  - [ ] Real-time updates work (test with staff updating status)

- [ ] **Profile Management**
  - [ ] View profile information
  - [ ] Edit name and email
  - [ ] Save changes successfully
  - [ ] View saved addresses
  - [ ] Add new address
  - [ ] Edit address
  - [ ] Delete address
  - [ ] Update notification preferences

- [ ] **Order History**
  - [ ] All orders listed
  - [ ] Filter by date
  - [ ] Filter by status
  - [ ] Search by order ID
  - [ ] View order details from history
  - [ ] Download receipt (if implemented)

---

## 🔄 Real-Time Testing Workflow

To test real-time order status updates:

### Setup (2 Browser Windows)

**Window 1 - Customer Portal:**
1. Login as customer (`+254712000001`)
2. Navigate to order tracking page for an active order
3. Keep this window open

**Window 2 - Staff Dashboard:**
1. Login as staff (Dev Quick Login)
2. Go to pipeline (`/dashboard/pipeline`)
3. Find the same order

### Test Real-Time Updates:
1. In Window 2 (Staff), change order status
2. In Window 1 (Customer), watch the status update automatically
3. ✅ Should update within 1-2 seconds without page refresh

---

## 🗑️ Cleanup

To delete the dev customer account and start fresh:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Delete documents:
   - `customers/[customerId]`
   - All `orders` where `customerId` matches
   - `users/[userId]`
4. Go to Firebase Authentication
5. Delete the user with email `customer@lorenzo-dev.com`

---

## 📝 Notes

- **Development Only:** This account is for development and testing only
- **Not for Production:** Do not use these credentials in production
- **OTP in Console:** In development mode, OTPs are logged to browser console
- **No Real SMS:** SMS sending is not configured in development

---

## 🚀 Quick Setup Script (Future)

In the future, we can create a script to automate this:

```bash
npm run db:create-dev-customer
```

This would:
- Create the customer in Firestore
- Create sample orders
- Set up authentication
- Print credentials

For now, use the manual method described above.

---

**Last Updated:** October 14, 2025
**Created By:** Development Team
**Status:** Active for Development Testing
