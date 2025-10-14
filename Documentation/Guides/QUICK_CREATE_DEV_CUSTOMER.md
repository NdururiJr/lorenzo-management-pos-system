# Quick Guide: Create Dev Customer Account

**Time Required:** 10-15 minutes
**Goal:** Create a test customer with sample orders for testing

---

## 📝 Step-by-Step Instructions

### Step 1: Login as Staff (2 minutes)

1. Open browser: `http://localhost:3000`
2. Click "Staff Login"
3. Click "Dev Quick Login" button
4. ✅ You should be on `/dashboard`

---

### Step 2: Create Dev Customer (3 minutes)

1. Click "POS" in the sidebar (or go to `/dashboard/pos`)
2. In the customer search box, type: `+254712000001`
3. You should see "No customers found"
4. Click "Create New Customer"
5. Fill in the form:
   ```
   Name: Dev Customer
   Phone: +254712000001
   Email: customer@lorenzo-dev.com

   Address Label: Home
   Address: Kilimani, Nairobi

   [✓] Enable WhatsApp notifications
   Language: English
   ```
6. Click "Create Customer"
7. ✅ Customer should now be selected in POS

---

### Step 3: Create Order 1 - In Progress (3 minutes)

**Order Details:**
- Customer: Dev Customer (already selected)
- Status will be: Washing

**Add Garments:**

1. Click "Add Garment" button
2. Fill in first garment:
   ```
   Type: Shirt
   Color: White
   Brand: Tommy Hilfiger (optional)
   Services: [✓] Dry Clean, [✓] Iron
   Special Instructions: Handle with care
   ```

3. Click "Add Garment" again for second garment:
   ```
   Type: Trousers
   Color: Black
   Brand: Zara (optional)
   Services: [✓] Dry Clean, [✓] Iron
   ```

**Process Payment:**
4. Scroll down to payment section
5. Total should be: KES 700 (or based on your pricing)
6. Payment Method: Select "Cash"
7. Amount Tendered: Enter `1000`
8. Change should calculate automatically
9. Click "Complete Payment"
10. ✅ Order created! You should see order ID

**Update Status to Washing:**
11. Go to Pipeline (`/dashboard/pipeline`)
12. Find the order you just created (should be in "Received" column)
13. Click on the order card
14. Click "Change Status" or similar
15. Select "Washing"
16. ✅ Order is now in Washing status

---

### Step 4: Create Order 2 - Ready (3 minutes)

**Order Details:**
- Customer: Search for `+254712000001` and select
- Status will be: Ready

**Add Garment:**
1. Click "Add Garment"
2. Fill in:
   ```
   Type: Dress
   Color: Blue
   Brand: H&M (optional)
   Services: [✓] Wash, [✓] Iron
   Special Instructions: Delicate fabric
   ```

**Process Payment:**
3. Payment Method: Select "M-Pesa"
4. Total: KES 500 (or based on pricing)
5. Complete payment
6. ✅ Order created!

**Update Status to Ready:**
7. Go to Pipeline
8. Find the order
9. Update status through all stages to "Ready":
   - Received → Queued → Washing → Drying → Ironing → Quality Check → Packaging → Ready
10. ✅ Order is now Ready for pickup

---

### Step 5: Create Order 3 - Delivered (3 minutes)

**Order Details:**
- Customer: Search for `+254712000001` and select
- Status will be: Delivered

**Add Garments:**
1. Click "Add Garment":
   ```
   Type: Suit
   Color: Navy Blue
   Brand: Hugo Boss (optional)
   Services: [✓] Dry Clean, [✓] Iron
   ```

2. Click "Add Garment" again:
   ```
   Type: Shirt
   Color: Light Blue
   Brand: Ralph Lauren (optional)
   Services: [✓] Dry Clean, [✓] Iron
   ```

**Process Payment:**
3. Payment Method: Cash
4. Total: KES 1,100 (or based on pricing)
5. Complete payment
6. ✅ Order created!

**Update Status to Delivered:**
7. Go to Pipeline
8. Find the order
9. Update status all the way to "Delivered"
10. ✅ Order is completed!

---

### Step 6: Verify Customer Data (1 minute)

1. Open Firebase Console: `https://console.firebase.google.com`
2. Select your project: "lorenzo-dry-cleaners"
3. Go to Firestore Database
4. Check these collections:

**Customers Collection:**
- [ ] Find customer with phone `+254712000001`
- [ ] Verify `orderCount` = 3
- [ ] Verify `totalSpent` shows correct total

**Orders Collection:**
- [ ] Find 3 orders for this customer
- [ ] Verify statuses: washing, ready, delivered
- [ ] Verify order details are correct

---

### Step 7: Test Customer Portal (2 minutes)

1. **Logout from Staff:**
   - Click "Sign Out" button in dashboard
   - Should redirect to home page

2. **Login as Customer:**
   - Click "Customer Login"
   - Enter phone: `+254712000001`
   - Click "Send OTP"
   - Check browser console (F12 → Console tab)
   - Copy the OTP (6 digits)
   - Paste OTP in verification page
   - Click "Verify OTP"

3. **Verify Portal:**
   - ✅ Should redirect to `/portal`
   - ✅ Should see "Welcome, Dev Customer"
   - ✅ Should see 2 active orders (washing, ready)
   - ✅ Should see 1 completed order (delivered)
   - ✅ No error messages!

4. **Test Order Tracking:**
   - Click on one of the active orders
   - ✅ Order details should display
   - ✅ Status timeline should show
   - ✅ Garment list should show

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Dev customer created with phone `+254712000001`
- [ ] 3 orders created with different statuses
- [ ] Customer can login with phone OTP
- [ ] Customer portal displays orders correctly
- [ ] No errors in browser console
- [ ] Order tracking works
- [ ] Profile shows customer info

---

## 🎉 You're Done!

You now have a fully functional dev customer account for testing!

### What You Can Test Now:

1. ✅ Customer login flow (Phone OTP)
2. ✅ Customer dashboard (active & completed orders)
3. ✅ Order tracking with real-time updates
4. ✅ Profile management
5. ✅ Order history
6. ✅ Real-time status updates (keep portal open, update in pipeline)

---

## �� Troubleshooting

### Issue: Customer not found when logging in
- Check Firebase Auth - user with phone `+254712000001` should exist
- User should have `role: 'customer'` in Firestore users collection

### Issue: No orders showing in portal
- Check orders collection - should have 3 orders with matching `customerId`
- Verify browser console for errors
- Check that orders have correct customer ID

### Issue: OTP not showing in console
- Make sure you're in development mode (`NODE_ENV=development`)
- Check browser console (F12 → Console)
- OTP should be logged as: "OTP for +254712000001: 123456"

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console for data
3. Verify all environment variables are set
4. Try creating orders again with different data

---

**Ready to test? Let's go! 🚀**
