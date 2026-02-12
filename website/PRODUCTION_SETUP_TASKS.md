# Production Setup Tasks - Lorenzo Dry Cleaners Website

**Date:** February 12, 2026
**Purpose:** Configure third-party services for production deployment

---

## Overview

After deploying the website code changes, you must configure external services:
1. **Resend** - Email service for contact form notifications
2. **Wati.io** - WhatsApp integration for admin notifications

**Estimated Time:** 2-3 hours (including DNS propagation wait time)

---

## Task 1: Resend Domain Verification

**Purpose:** Verify `lorenzodrycleaners.co.ke` domain to send emails from `noreply@lorenzodrycleaners.co.ke`

### Prerequisites
- Resend account created (sign up at https://resend.com if not done)
- Access to domain DNS settings (via domain registrar or DNS provider)
- Admin access to the domain registrar account

### Steps

#### 1.1 Access Resend Dashboard
- [ ] Navigate to https://resend.com/login
- [ ] Log in with your Resend account credentials
- [ ] Verify you're on the correct account (check top-right profile icon)

#### 1.2 Add Domain
- [ ] Click on **"Domains"** in the left sidebar
- [ ] Click the **"Add Domain"** button (top-right)
- [ ] Enter domain: `lorenzodrycleaners.co.ke`
- [ ] Click **"Add"** or **"Continue"**

#### 1.3 Get DNS Records
After adding the domain, Resend will provide DNS records to verify ownership. You'll typically see:

**Record 1: SPF Record**
```
Type: TXT
Name: @ (or lorenzodrycleaners.co.ke)
Value: v=spf1 include:amazonses.com ~all
TTL: 3600 (or default)
```

**Record 2: DKIM Record (Example)**
```
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (long string)
TTL: 3600
```

**Record 3: DMARC Record (Optional but recommended)**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@lorenzodrycleaners.co.ke
TTL: 3600
```

**Record 4: Return-Path (CNAME)**
```
Type: CNAME
Name: resend
Value: feedback.resend.com
TTL: 3600
```

- [ ] **Copy all DNS records** provided by Resend (use the "Copy" buttons)
- [ ] Save records in a secure note (you'll need them in the next step)

> **Note:** The exact values will be specific to your Resend account. Use the EXACT values shown in your Resend dashboard.

#### 1.4 Add DNS Records to Domain Registrar

**If your domain is with a registrar (e.g., Namecheap, GoDaddy, Safaricom Kenya):**

- [ ] Log into your domain registrar account
- [ ] Navigate to **Domain Management** → **DNS Settings** (or **Advanced DNS**)
- [ ] Locate your domain: `lorenzodrycleaners.co.ke`
- [ ] Click **"Manage DNS"** or **"DNS Records"**

**For each record from step 1.3:**

**Add SPF Record:**
- [ ] Click **"Add New Record"** or **"Add Record"**
- [ ] Select Type: **TXT**
- [ ] Host/Name: `@` (represents root domain)
- [ ] Value: `v=spf1 include:amazonses.com ~all` (paste from Resend)
- [ ] TTL: `3600` (or leave default)
- [ ] Click **"Save"** or **"Add Record"**

**Add DKIM Record:**
- [ ] Click **"Add New Record"**
- [ ] Select Type: **TXT**
- [ ] Host/Name: `resend._domainkey` (or as shown in Resend)
- [ ] Value: (paste the long DKIM value from Resend)
- [ ] TTL: `3600`
- [ ] Click **"Save"**

**Add DMARC Record:**
- [ ] Click **"Add New Record"**
- [ ] Select Type: **TXT**
- [ ] Host/Name: `_dmarc`
- [ ] Value: `v=DMARC1; p=none; rua=mailto:admin@lorenzodrycleaners.co.ke`
- [ ] TTL: `3600`
- [ ] Click **"Save"**

**Add Return-Path (CNAME):**
- [ ] Click **"Add New Record"**
- [ ] Select Type: **CNAME**
- [ ] Host/Name: `resend`
- [ ] Target/Value: `feedback.resend.com`
- [ ] TTL: `3600`
- [ ] Click **"Save"**

- [ ] **Verify all records are saved** (they should appear in the DNS records list)
- [ ] **Take a screenshot** of the DNS records page (for reference)

#### 1.5 Verify Domain in Resend

**DNS propagation takes 15 minutes to 48 hours. Most propagate within 1-2 hours.**

- [ ] Return to Resend dashboard → **Domains**
- [ ] Find `lorenzodrycleaners.co.ke` in the list
- [ ] Wait 15-30 minutes after adding DNS records
- [ ] Click **"Verify"** or **"Check DNS Records"** button
- [ ] If verification fails, click **"Check again"** every 30 minutes
- [ ] **Success indicator:** Green checkmark ✅ next to domain status

**Troubleshooting if verification fails:**
- [ ] Use DNS checker tool: https://dnschecker.org
  - Enter `lorenzodrycleaners.co.ke` and check TXT records globally
- [ ] Verify TTL hasn't expired (may need to wait longer)
- [ ] Double-check DNS records match exactly (no extra spaces)
- [ ] Contact domain registrar support if issues persist

#### 1.6 Get Production API Key

- [ ] In Resend dashboard, click **"API Keys"** (left sidebar)
- [ ] Click **"Create API Key"**
- [ ] Name: `Lorenzo Website Production`
- [ ] Permission: **Full Access** (or **Send Access** if you prefer limited scope)
- [ ] Click **"Create"**
- [ ] **IMPORTANT:** Copy the API key immediately (starts with `re_`)
  ```
  Example: re_123abc456def789ghi012jkl345mno678pqr
  ```
- [ ] **Save the API key securely** (you won't be able to see it again)
- [ ] Recommended: Store in password manager (1Password, LastPass, etc.)

**DO NOT share or commit this key to git.**

#### 1.7 Test Email Sending (Optional but Recommended)

Using Resend's test interface:

- [ ] In Resend dashboard, go to **"Emails"** → **"Send Test"**
- [ ] Configure test email:
  - From: `noreply@lorenzodrycleaners.co.ke`
  - To: Your personal email address
  - Subject: `Test Email from Lorenzo Website`
  - Body: `This is a test email to verify domain setup.`
- [ ] Click **"Send"**
- [ ] Check your inbox (and spam folder) for the test email
- [ ] **Success:** Email received from `noreply@lorenzodrycleaners.co.ke`

---

## Task 2: Wati.io Setup for WhatsApp Notifications

**Purpose:** Configure WhatsApp notifications to admin phone +254728400200

### Prerequisites
- Wati.io account created (sign up at https://wati.io if not done)
- Admin phone number: **+254728400200** (must have WhatsApp installed)
- Access to the phone to scan QR code or receive verification OTP

### Steps

#### 2.1 Access Wati.io Dashboard
- [ ] Navigate to https://app.wati.io/login (or https://wati.io/login)
- [ ] Log in with your Wati.io account credentials
- [ ] Verify you're on the **Production** account (not sandbox)

#### 2.2 Connect WhatsApp Business Number

**Option A: If phone is already connected, skip to 2.3**

**Option B: Connect new phone number:**

- [ ] Click **"Settings"** (gear icon) in the left sidebar
- [ ] Navigate to **"Phone Numbers"** or **"WhatsApp Numbers"**
- [ ] Click **"Add New Number"** or **"Connect Phone"**
- [ ] Select method:
  - **QR Code Method:** Scan QR with phone +254728400200
  - **OTP Method:** Enter phone +254728400200, receive verification code
- [ ] Follow on-screen instructions to complete setup
- [ ] **Verify:** Phone number +254728400200 appears as "Connected"

#### 2.3 Verify Admin Phone Number

- [ ] In Wati.io dashboard, go to **"Team"** or **"Users"**
- [ ] Verify admin user is configured with phone: **+254728400200**
- [ ] If not listed, click **"Add Team Member"**
  - Name: `Admin / Lorenzo Team`
  - Phone: `+254728400200`
  - Role: `Admin`
  - Click **"Save"**

#### 2.4 Get API Credentials

**Step 2.4.1: Get API Endpoint URL**

- [ ] In Wati.io dashboard, click **"API"** or **"Integrations"** (left sidebar)
- [ ] Look for **"API Endpoint"** or **"Base URL"**
- [ ] Copy the API endpoint URL. Format will be:
  ```
  https://live-server-XXXXX.wati.io
  ```
  Example: `https://live-server-123456.wati.io`

  **Note:** The `XXXXX` is your unique server ID.

- [ ] **Save this URL** - you'll need it for Vercel environment variables

**Step 2.4.2: Generate Access Token**

- [ ] In **API** or **Integrations** section, find **"API Keys"** or **"Access Tokens"**
- [ ] Click **"Create New Token"** or **"Generate Token"**
- [ ] Configure token:
  - Name: `Lorenzo Website Production`
  - Permissions: **Send Messages** (minimum required)
  - Expiry: **Never** (or set long expiry like 1 year)
- [ ] Click **"Generate"** or **"Create"**
- [ ] **IMPORTANT:** Copy the access token immediately
  ```
  Example format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzd...
  ```
- [ ] **Save the token securely** (you may not be able to see it again)
- [ ] Recommended: Store in password manager

**DO NOT share or commit this token to git.**

#### 2.5 Test WhatsApp API (Highly Recommended)

Using API testing tool (Postman, Thunder Client, or curl):

**Test Message Request:**

```bash
curl -X POST "https://live-server-XXXXX.wati.io/api/v1/sendSessionMessage" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "whatsappNumber": "+254728400200",
    "message": "🔔 Test notification from Lorenzo Website API integration"
  }'
```

**Replace:**
- `https://live-server-XXXXX.wati.io` with your API endpoint from step 2.4.1
- `YOUR_ACCESS_TOKEN` with your token from step 2.4.2

**Expected Response (Success):**
```json
{
  "result": true,
  "info": "Message sent successfully"
}
```

**Verification Steps:**
- [ ] Run the curl command (or use Postman)
- [ ] Check WhatsApp on phone +254728400200
- [ ] **Success:** Test message received on WhatsApp
- [ ] If error, verify:
  - Access token is correct
  - API endpoint URL is correct
  - Phone number format is `+254728400200` (with + sign)
  - Wati.io account has active subscription

#### 2.6 Configure Rate Limits (Optional)

To prevent spam and control costs:

- [ ] In Wati.io dashboard, go to **"Settings"** → **"API Settings"**
- [ ] Set rate limits (if available):
  - Max messages per minute: `10` (contact form won't exceed this)
  - Max messages per day: `100`
- [ ] Click **"Save"**

---

## Task 3: Update Vercel Environment Variables

**Purpose:** Add production API keys to Vercel deployment

### Prerequisites
- Vercel account access
- Project deployed: `lorenzo-dry-cleaners` (website)
- Resend API key from Task 1.6
- Wati.io credentials from Task 2.4

### Steps

#### 3.1 Access Vercel Dashboard
- [ ] Navigate to https://vercel.com
- [ ] Log in to your account
- [ ] Select project: **`lorenzo-dry-cleaners-website`** (or similar website project name)

#### 3.2 Navigate to Environment Variables
- [ ] Click **"Settings"** tab (top navigation)
- [ ] Click **"Environment Variables"** (left sidebar)

#### 3.3 Add/Update Production Environment Variables

**Add NEXT_PUBLIC_WEBSITE_URL:**
- [ ] Click **"Add New"** or **"Add Environment Variable"**
- [ ] Key: `NEXT_PUBLIC_WEBSITE_URL`
- [ ] Value: `https://lorenzodrycleaners.co.ke`
- [ ] Environments: Select **Production** only
- [ ] Click **"Save"**

**Add NEXT_PUBLIC_POS_API_URL:**
- [ ] Click **"Add New"**
- [ ] Key: `NEXT_PUBLIC_POS_API_URL`
- [ ] Value: `https://lorenzo-dry-cleaners.vercel.app`
- [ ] Environments: Select **Production** only
- [ ] Click **"Save"**

**Add RESEND_API_KEY:**
- [ ] Click **"Add New"**
- [ ] Key: `RESEND_API_KEY`
- [ ] Value: (paste API key from Task 1.6, starts with `re_`)
- [ ] Environments: Select **Production** only
- [ ] **Important:** Mark as **Sensitive** (encrypted in Vercel)
- [ ] Click **"Save"**

**Add WATI_API_ENDPOINT:**
- [ ] Click **"Add New"**
- [ ] Key: `WATI_API_ENDPOINT`
- [ ] Value: (paste endpoint from Task 2.4.1, e.g., `https://live-server-123456.wati.io`)
- [ ] Environments: Select **Production** only
- [ ] Click **"Save"**

**Add WATI_ACCESS_TOKEN:**
- [ ] Click **"Add New"**
- [ ] Key: `WATI_ACCESS_TOKEN`
- [ ] Value: (paste access token from Task 2.4.2)
- [ ] Environments: Select **Production** only
- [ ] **Important:** Mark as **Sensitive** (encrypted in Vercel)
- [ ] Click **"Save"**

**Add Firebase Environment Variables (if not already set):**

From `website/.env.local`, add these if missing:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

For each, set Environments to **Production**.

#### 3.4 Trigger Redeployment

After adding environment variables:

- [ ] Go to **"Deployments"** tab
- [ ] Click **"..."** (three dots) on latest deployment
- [ ] Select **"Redeploy"**
- [ ] Confirm redeployment
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] **Verify:** Deployment status shows ✅ "Ready"

---

## Task 4: Production Testing

**Purpose:** Verify contact form works end-to-end in production

### Steps

#### 4.1 Test Contact Form Submission

- [ ] Navigate to production website: https://lorenzodrycleaners.co.ke/contact
- [ ] Fill out the contact form:
  - Name: `Test User`
  - Email: Your personal email
  - Phone: `+254700000000` (or your phone)
  - Subject: `Production Test - Contact Form`
  - Message: `Testing contact form integration with Resend and Wati.io`
- [ ] Click **"Send Message"**
- [ ] **Verify:** Success message appears

#### 4.2 Verify Firestore Storage

- [ ] Open Firebase Console: https://console.firebase.google.com
- [ ] Select project: **lorenzo-dry-cleaners**
- [ ] Navigate to **Firestore Database**
- [ ] Open collection: **`contacts`**
- [ ] **Verify:** New document created with your test submission
- [ ] Check fields:
  - `name`: "Test User"
  - `email`: Your email
  - `subject`: "Production Test - Contact Form"
  - `status`: "new"
  - `createdAt`: Recent timestamp

#### 4.3 Verify Email Delivery (Resend)

**Check Admin Email:**
- [ ] Open email inbox for: `info@lorenzodrycleaners.co.ke`
- [ ] **Verify:** Email received from `noreply@lorenzodrycleaners.co.ke`
- [ ] Subject: `New Contact Form: Production Test - Contact Form`
- [ ] Body contains your test message
- [ ] Email not in spam folder

**Check Customer Confirmation Email:**
- [ ] Open your personal email inbox
- [ ] **Verify:** Email received from `noreply@lorenzodrycleaners.co.ke`
- [ ] Subject: `Thank you for contacting Lorenzo Dry Cleaners`
- [ ] Body contains confirmation message
- [ ] Email not in spam folder

**If emails in spam:**
- [ ] Mark as "Not Spam"
- [ ] Add `noreply@lorenzodrycleaners.co.ke` to contacts
- [ ] Consider improving DMARC policy (change `p=none` to `p=quarantine`)

#### 4.4 Verify WhatsApp Notification (Wati.io)

- [ ] Open WhatsApp on phone: **+254728400200**
- [ ] **Verify:** New message received from your Wati.io business number
- [ ] Message format:
  ```
  🔔 *New Contact Form Submission*

  *Name:* Test User
  *Email:* your-email@example.com
  *Phone:* +254700000000
  *Subject:* Production Test - Contact Form

  *Message:*
  Testing contact form integration with Resend and Wati.io
  ```

#### 4.5 Check Vercel Logs

- [ ] Go to Vercel dashboard → **lorenzo-dry-cleaners-website** project
- [ ] Click **"Logs"** tab
- [ ] Filter by **"Functions"**
- [ ] Look for `/api/contact` route logs
- [ ] **Verify:**
  - `Contact saved to Firestore: [doc-id]`
  - `Admin email sent successfully`
  - `Customer confirmation email sent successfully`
  - `WhatsApp notification sent successfully`
- [ ] **No errors** should appear

#### 4.6 Test Error Handling

**Test Invalid Email:**
- [ ] Submit form with email: `invalid-email`
- [ ] **Verify:** Validation error shown
- [ ] No submission to Firestore

**Test Missing Required Fields:**
- [ ] Submit form with empty fields
- [ ] **Verify:** Required field errors shown

---

## Task 5: Enable Vercel Features (Optional but Recommended)

### 5.1 Enable Skew Protection

- [ ] In Vercel project settings, go to **"Deployment Protection"**
- [ ] Enable **"Skew Protection"**
- [ ] **Purpose:** Prevents version mismatch issues during deployments

### 5.2 Enable Speed Insights

- [ ] In Vercel project settings, go to **"Speed Insights"**
- [ ] Click **"Enable Speed Insights"**
- [ ] **Purpose:** Monitor Core Web Vitals and page performance

### 5.3 Enable Analytics

- [ ] In Vercel project settings, go to **"Analytics"**
- [ ] Click **"Enable Analytics"**
- [ ] **Purpose:** Track page views and user behavior

---

## Checklist Summary

**Before Production:**
- [ ] Task 1: Resend domain verified ✅
- [ ] Task 1.6: Resend API key saved securely
- [ ] Task 2: Wati.io phone connected (+254728400200)
- [ ] Task 2.4: Wati.io API credentials saved securely
- [ ] Task 3: All Vercel environment variables configured
- [ ] Task 3.4: Production redeployment completed

**Production Testing:**
- [ ] Task 4.1: Contact form submits successfully
- [ ] Task 4.2: Firestore document created
- [ ] Task 4.3: Emails delivered (admin + customer)
- [ ] Task 4.4: WhatsApp notification received
- [ ] Task 4.5: No errors in Vercel logs

**Optional Enhancements:**
- [ ] Task 5.1: Skew Protection enabled
- [ ] Task 5.2: Speed Insights enabled
- [ ] Task 5.3: Analytics enabled

---

## Troubleshooting

### Issue: Resend domain verification stuck

**Solutions:**
1. Wait longer (DNS can take up to 48 hours)
2. Check DNS propagation: https://dnschecker.org
3. Verify exact DNS record values (no trailing dots, no extra spaces)
4. Clear browser cache and retry verification
5. Contact Resend support: support@resend.com

### Issue: WhatsApp API returns 401 Unauthorized

**Solutions:**
1. Verify access token is correct (no extra spaces)
2. Check token hasn't expired
3. Regenerate token in Wati.io dashboard
4. Verify account has active subscription

### Issue: Emails sent but land in spam

**Solutions:**
1. Set DMARC policy to `p=quarantine` instead of `p=none`
2. Add SPF record: `v=spf1 include:amazonses.com -all` (note: `-all` instead of `~all`)
3. Warm up domain by sending small volumes first
4. Ask recipients to mark as "Not Spam"

### Issue: Contact form fails with 500 error

**Solutions:**
1. Check Vercel logs for detailed error
2. Verify Firebase credentials are correct
3. Verify Resend API key is valid
4. Test API endpoints individually (Firestore, Resend, Wati.io)
5. Check Firestore security rules allow writes to `contacts` collection

---

## Security Reminders

**DO NOT:**
- ❌ Commit API keys to git
- ❌ Share API keys in Slack/email
- ❌ Store keys in unencrypted files
- ❌ Use production keys in development

**DO:**
- ✅ Store keys in Vercel environment variables (marked as Sensitive)
- ✅ Use password manager for key storage
- ✅ Rotate keys every 6-12 months
- ✅ Use separate keys for development/production
- ✅ Monitor API usage regularly

---

## Support Contacts

- **Resend Support:** support@resend.com | https://resend.com/support
- **Wati.io Support:** support@wati.io | https://help.wati.io
- **Vercel Support:** https://vercel.com/help
- **Firebase Support:** https://firebase.google.com/support

---

**Good luck with production setup! 🚀**
