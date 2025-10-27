# Resend API Fix: Client-Side to Server-Side Migration

**Date:** October 24, 2025
**Issue:** Runtime error - Missing Resend API key in client-side component
**Status:** ✅ Fixed

---

## 🐛 Problem

### Error Message:
```
Missing API key. Pass it to the constructor `new Resend("re_123")`
lib\email\receipt-mailer.ts (13:16)
```

### Root Cause:
The `receipt-mailer.ts` file was initializing the Resend SDK at module load time:
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

This code was being imported by `ReceiptPreview.tsx`, which is a **client-side component** (`'use client'`).

**Problem**:
- Environment variables like `RESEND_API_KEY` are only available on the server
- Client-side components cannot access `process.env` server variables
- This caused a runtime error when the POS page loaded

---

## ✅ Solution

### Architecture Change:
Moved email sending from client-side to server-side using Next.js API Route.

### Files Changed:

#### 1. Created `app/api/receipts/email/route.ts` ✅
**Purpose**: Server-side API endpoint for sending emails

**Key Features**:
- Runs exclusively on server (has access to `process.env.RESEND_API_KEY`)
- Initializes Resend SDK safely
- Generates PDF blob
- Creates HTML email template
- Sends email with attachment via Resend
- Returns success/error response

**Endpoint**: `POST /api/receipts/email`

**Request Body**:
```typescript
{
  customerEmail: string;
  customerName: string;
  order: any;
  customer: any;
}
```

**Response**:
```typescript
{
  success: boolean;
  emailId?: string;  // Resend email ID on success
  error?: string;    // Error message on failure
}
```

#### 2. Updated `lib/email/receipt-mailer.ts` ✅
**Purpose**: Client-side wrapper that calls API route

**Changes**:
- Removed `import { Resend } from 'resend'`
- Removed `const resend = new Resend(...)`
- Removed `createReceiptEmailHTML()` function (moved to API route)
- `sendReceiptEmail()` now calls `/api/receipts/email` via fetch
- `sendBatchReceiptEmails()` still works (calls updated `sendReceiptEmail()`)

**New Flow**:
```typescript
Client Component (ReceiptPreview)
    ↓
sendReceiptEmail() in receipt-mailer.ts
    ↓
fetch('/api/receipts/email')
    ↓
API Route (Server-side)
    ↓
Resend SDK
    ↓
Email Sent
```

---

## 🔧 Technical Details

### Why API Routes?

**Next.js API Routes**:
- Run exclusively on server
- Have full access to environment variables
- Can safely use server-only packages (like Resend)
- Are automatically secured (not exposed to client)

**Alternative Approaches Considered**:
1. ❌ Server Actions - Would work, but API routes are more RESTful
2. ❌ Server Component - Receipt preview needs interactivity (buttons, modals)
3. ✅ **API Route** - Best practice for server-side operations from client components

---

## 📋 Migration Summary

### Before (Broken):
```
Client Component
  ↓
Import receipt-mailer.ts
  ↓
const resend = new Resend(process.env.RESEND_API_KEY)  ❌ Error!
```

### After (Fixed):
```
Client Component
  ↓
Call receipt-mailer.ts
  ↓
fetch('/api/receipts/email')  ✅ Works!
  ↓
API Route initializes Resend on server
```

---

## 🧪 Testing

### How to Test:
1. Ensure `RESEND_API_KEY` is in `.env.local`
2. Restart dev server (`npm run dev`)
3. Create an order in POS
4. Complete payment
5. In Receipt Preview, click "Email Receipt"
6. Check for success toast

### Expected Results:
- ✅ No runtime errors on page load
- ✅ Email button enabled (if customer has email)
- ✅ Clicking email button shows loading state
- ✅ Success toast appears
- ✅ Email received in inbox
- ✅ PDF attachment included

---

## 🔐 Security Improvements

### Before:
- API key would have been exposed if client tried to access it
- Not a security issue (Next.js prevents it), but caused error

### After:
- ✅ API key stays on server
- ✅ Client never sees or touches the key
- ✅ API route can add additional validation/authentication if needed
- ✅ Rate limiting can be added to API route

---

## 📊 Performance

### Network Request:
- Client → API Route: ~10-50ms (local)
- API Route → Resend: ~200-500ms (email send)
- **Total**: ~210-550ms (acceptable for email operation)

### Comparison to Direct Resend:
- If it worked client-side: ~200-500ms
- Current solution: +10-50ms overhead
- **Trade-off**: Minimal overhead for proper architecture

---

## 🎯 Best Practices Applied

1. ✅ **Separation of Concerns**: Client handles UI, server handles secrets
2. ✅ **Security**: API keys never exposed to client
3. ✅ **Error Handling**: API route has comprehensive error handling
4. ✅ **Type Safety**: Proper TypeScript types throughout
5. ✅ **Logging**: Console logs for debugging on server
6. ✅ **REST API**: Follows REST conventions (POST for creating email)

---

## 🚀 Next Steps

1. ✅ API route created
2. ✅ Client-side wrapper updated
3. ⏳ Test email sending
4. ⏳ Verify PDF attachment works
5. ⏳ Continue with Phase 1 testing

---

## 📝 Code References

### API Route:
[app/api/receipts/email/route.ts](../app/api/receipts/email/route.ts)

### Client Wrapper:
[lib/email/receipt-mailer.ts](../lib/email/receipt-mailer.ts)

### Component Using It:
[components/features/pos/ReceiptPreview.tsx](../components/features/pos/ReceiptPreview.tsx)

---

**Status**: ✅ Fixed and ready for testing
**Impact**: No user-facing changes, just architectural improvement