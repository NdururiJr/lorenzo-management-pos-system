# Phase 1 Testing Guide: POS & Receipt PDF System

**Date:** October 23, 2025
**Status:** ✅ Implementation Complete - Ready for Testing

---

## 📋 Implementation Summary

### Files Created (5):
1. ✅ `lib/receipts/receipt-template.ts` - Template configuration and helpers
2. ✅ `lib/receipts/pdf-generator.ts` - PDF generation with jsPDF
3. ✅ `lib/email/receipt-mailer.ts` - Email service with Resend
4. ✅ `components/features/orders/ReceiptActions.tsx` - PDF action buttons

### Files Modified (2):
1. ✅ `components/features/pos/ReceiptPreview.tsx` - Integrated PDF generation
2. ✅ `app/(dashboard)/pos/page.tsx` - Updated props for ReceiptPreview

### Dependencies Installed:
```bash
npm install jspdf
npm install --save-dev @types/jspdf
```

---

## 🎯 Test Objectives

1. ✅ Verify PDF generation works correctly
2. ✅ Test download functionality
3. ✅ Test email delivery with attachments
4. ✅ Test print dialog opens correctly
5. ✅ Validate receipt formatting and content
6. ✅ Test error handling for all operations
7. ✅ Verify mobile compatibility

---

## 🧪 Test Cases

### Test 1: Complete POS Workflow
**Objective**: Test end-to-end order creation with receipt generation

**Steps**:
1. Navigate to POS page (`/pos`)
2. Select a customer from the search
3. Add 2-3 garments with different services
4. Click "Create Order & Process Payment"
5. In Payment Modal, select "Cash" tab
6. Enter payment amount and tendered amount
7. Click "Record Cash Payment"
8. Verify payment success toast appears
9. Receipt Preview modal should automatically open

**Expected Results**:
- ✅ Order created successfully
- ✅ Payment recorded
- ✅ Receipt preview modal opens automatically
- ✅ PDF preview displays in iframe
- ✅ Order details visible in summary section
- ✅ Customer name, phone, email displayed correctly

---

### Test 2: PDF Download
**Objective**: Verify PDF download functionality

**Steps**:
1. After completing Test 1, with Receipt Preview open
2. Click "Download PDF" button
3. Check browser downloads

**Expected Results**:
- ✅ PDF file downloads with filename `receipt-{orderId}.pdf`
- ✅ Success toast appears: "Receipt downloaded successfully"
- ✅ PDF opens correctly in PDF viewer
- ✅ Company header with "Lorenzo Dry Cleaners" visible
- ✅ Order details correctly formatted
- ✅ Items table displays all garments
- ✅ Totals section shows subtotal, tax, total, paid, balance
- ✅ Footer with thank you message

---

### Test 3: PDF Email Delivery
**Objective**: Test email receipt with PDF attachment

**Prerequisites**:
- Customer must have valid email address
- RESEND_API_KEY must be configured in `.env.local`

**Steps**:
1. With Receipt Preview open
2. Verify Email button is enabled (not disabled)
3. Click "Email Receipt" button
4. Wait for email to send

**Expected Results**:
- ✅ Loading spinner appears while sending
- ✅ Success toast: "Receipt emailed to {email}"
- ✅ Email received in customer inbox within 5 seconds
- ✅ Email subject: "Receipt for Order {orderId} - Lorenzo Dry Cleaners"
- ✅ Email from: "Lorenzo Dry Cleaners <receipts@lorenzo-dry-cleaners.com>"
- ✅ Email has PDF attachment named `receipt-{orderId}.pdf`
- ✅ Email HTML is professionally formatted:
  - Gradient purple header
  - Order summary box
  - Items table
  - "What's Next?" information box
  - Company footer

**Email Button States**:
- Disabled when: Customer has no email OR PDF not generated yet OR loading
- Enabled when: Customer has email AND PDF generated AND not loading

---

### Test 4: Print Functionality
**Objective**: Verify print dialog opens

**Steps**:
1. With Receipt Preview open
2. Click "Print" button

**Expected Results**:
- ✅ Success toast: "Opening print dialog"
- ✅ New browser window/tab opens with PDF
- ✅ Browser print dialog opens automatically
- ✅ PDF formatted correctly for printing (A4 size)
- ✅ All content visible on single page
- ✅ Can cancel print dialog without errors

---

### Test 5: PDF Content Validation
**Objective**: Verify all PDF content is correct

**What to Check**:
```
✅ Company Header:
  - Company name: "Lorenzo Dry Cleaners"
  - Address: "Kilimani, Nairobi, Kenya"
  - Phone: "+254 XXX XXX XXX"
  - Email: "info@lorenzo-dry-cleaners.com"

✅ Receipt Title:
  - "RECEIPT" centered

✅ Order Information Section:
  - Order ID: {actual order ID}
  - Date: {formatted date with time}
  - Status: {order status}
  - Customer: {customer name}
  - Phone: {formatted phone}
  - Payment: {payment method}

✅ Items Table:
  - Column headers: #, Item Description, Services, Price
  - Each garment row:
    - Sequential number
    - Type, color, brand (if present)
    - Services list
    - Price in KES format
  - Special instructions below item (if present)

✅ Totals Section:
  - Subtotal: {calculated}
  - Tax: {if applicable}
  - Discount: {if applicable}
  - TOTAL: {bold, larger font}
  - Amount Paid: {amount}
  - Balance Due: {red if > 0}

✅ Additional Information:
  - Estimated Completion: {date}
  - Notes: {if present}

✅ Footer:
  - "Thank you for choosing Lorenzo Dry Cleaners!"
  - "For inquiries, please contact us at the details above."
  - Generated on: {current date/time}
```

---

### Test 6: Error Handling
**Objective**: Verify error handling works correctly

#### Test 6a: Email Without Customer Email
**Steps**:
1. Create order for customer WITHOUT email address
2. Complete payment
3. In Receipt Preview, click "Email Receipt"

**Expected**:
- ✅ Error toast: "Customer email address is not available."
- ✅ No email sent
- ✅ Email button is disabled

#### Test 6b: PDF Generation Failure (Simulated)
**Note**: Hard to test without code modification
- System should show error message
- Download/Print/Email buttons should be disabled

#### Test 6c: Email Send Failure
**Steps**:
1. Temporarily set invalid RESEND_API_KEY in `.env.local`
2. Restart dev server
3. Try to email receipt

**Expected**:
- ✅ Error toast: "Failed to send receipt email"
- ✅ Error logged to console
- ✅ Modal remains open (doesn't close)

---

### Test 7: Multiple Operations
**Objective**: Test performing multiple operations on same receipt

**Steps**:
1. Generate receipt
2. Download PDF
3. Email receipt
4. Print receipt
5. Download again

**Expected Results**:
- ✅ All operations work independently
- ✅ PDF generated only once (cached)
- ✅ Multiple downloads create same PDF
- ✅ Multiple emails send correctly

---

### Test 8: Mobile Responsiveness
**Objective**: Verify receipt system works on mobile

**Steps**:
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Complete POS workflow
5. Test all receipt actions

**Expected Results**:
- ✅ Receipt Preview modal displays correctly
- ✅ PDF preview iframe scrollable
- ✅ Action buttons stack vertically on mobile
- ✅ Download works on mobile browser
- ✅ Email button functional
- ✅ Print opens mobile print dialog
- ✅ All text readable without zooming

---

### Test 9: Payment Modal Flow
**Objective**: Verify payment triggers receipt correctly

**Test with different payment methods**:

#### Test 9a: Cash Payment
1. Select Cash tab
2. Enter exact amount
3. Click "Record Cash Payment"
4. Verify receipt opens

#### Test 9b: Partial Cash Payment
1. Select Cash tab
2. Enter amount < total
3. Record payment
4. Verify receipt shows balance due

#### Test 9c: Cash with Change
1. Enter payment amount
2. Enter higher tendered amount
3. Verify change calculation displayed
4. Record payment
5. Receipt should show full payment

---

### Test 10: Receipt Formatting Edge Cases

#### Test 10a: Order with Many Items
**Steps**:
1. Create order with 10+ garments
2. Generate receipt

**Expected**:
- ✅ All items visible in table
- ✅ Items fit on page (may extend to multiple pages if >20 items)

#### Test 10b: Order with Long Special Instructions
**Steps**:
1. Add garment with 200+ character special instructions
2. Generate receipt

**Expected**:
- ✅ Instructions display below item
- ✅ Text wraps correctly

#### Test 10c: Order with Missing Data
**Steps**:
1. Create order with minimal data
2. Generate receipt

**Expected**:
- ✅ Missing fields show "N/A"
- ✅ No JavaScript errors
- ✅ PDF still generates

---

## 🔧 Environment Setup

### Required Environment Variables
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx  # Get from resend.com
```

### Resend Setup
1. Go to [resend.com](https://resend.com)
2. Sign up / Log in
3. Go to API Keys
4. Create new API key
5. Copy to `.env.local`
6. Verify domain (optional for testing, use onboarding domain)

---

## ✅ Success Criteria

Phase 1 is considered **100% complete** when:

- ✅ All 10 test cases pass
- ✅ PDF generates correctly every time
- ✅ Downloads work on desktop and mobile
- ✅ Emails deliver within 5 seconds with correct attachment
- ✅ Print dialog opens successfully
- ✅ Error handling works for all failure scenarios
- ✅ Receipt content matches expected format
- ✅ Mobile experience is smooth
- ✅ No console errors during normal operation
- ✅ No TypeScript compilation errors

---

## 🐛 Known Issues / Limitations

1. **WhatsApp Integration**: Placeholder only (Phase 2)
2. **Receipt Logo**: Company logo not yet added (placeholder in footer)
3. **Multi-page PDFs**: Items >20 may overflow (acceptable for MVP)
4. **Email Retry**: No automatic retry on failure (manual retry required)

---

## 📸 Visual Inspection Checklist

When reviewing generated PDF, verify:

### Typography:
- ✅ Company name is bold and large (20pt)
- ✅ Section headers are medium bold (14pt)
- ✅ Body text is readable (10pt)
- ✅ Footer text is small but readable (8pt)

### Layout:
- ✅ Margins are consistent (20mm all sides)
- ✅ Lines are straight and aligned
- ✅ Tables have proper spacing
- ✅ No text overlap

### Colors:
- ✅ Primary text is black (RGB 0,0,0)
- ✅ Secondary text is gray (RGB 102,102,102)
- ✅ Balance due is red if > 0
- ✅ Divider lines are light gray

### Alignment:
- ✅ Company header centered
- ✅ Totals right-aligned
- ✅ Item descriptions left-aligned
- ✅ Footer centered

---

## 🎉 Next Steps After Phase 1

Once all tests pass:
1. Mark Phase 1 as ✅ Complete
2. Update todo list
3. Begin Phase 2: WhatsApp Integration
4. Phase 2 will enhance the placeholder WhatsApp button

---

## 📞 Support

If tests fail:
1. Check console for errors
2. Verify environment variables
3. Check Resend dashboard for API errors
4. Review Firebase logs for order creation issues

---

**Last Updated:** October 23, 2025
**Phase Status:** ✅ Implementation Complete - Testing In Progress
