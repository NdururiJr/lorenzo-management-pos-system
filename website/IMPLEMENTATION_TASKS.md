# Lorenzo Website - Implementation Tasks

**Generated:** 2026-02-12
**Source:** Production deployment audit
**Estimated Total Time:** ~2.75 hours

---

## 🔴 PRIORITY 1: CRITICAL - HARDCODED STAGING URLS (SEO Impact)

### Task 1.1: Fix JsonLd.tsx Hardcoded URLs
**File:** `website/components/seo/JsonLd.tsx`
**Estimated Time:** 15 minutes

- [ ] **Step 1:** Open `website/components/seo/JsonLd.tsx`
- [ ] **Step 2:** Add base URL helper at the top of the file (after imports):
  ```typescript
  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_WEBSITE_URL ||
           process.env.NEXT_PUBLIC_APP_URL ||
           'https://lorenzodrycleaners.co.ke';
  };
  ```
- [ ] **Step 3:** Update LocalBusinessJsonLd component:
  - [ ] Line 25: Replace `"@id": "https://lorenzo-dry-cleaners-website.vercel.app"` with `"@id": getBaseUrl()`
  - [ ] Line 28: Replace `"url": "https://lorenzo-dry-cleaners-website.vercel.app"` with `"url": getBaseUrl()`
  - [ ] Line 50: Replace `"image": "https://lorenzo-dry-cleaners-website.vercel.app/og-image.jpg"` with `"image": \`${getBaseUrl()}/og-image.jpg\``
- [ ] **Step 4:** Update BlogPostingJsonLd component:
  - [ ] Line 137: Replace `"image": "https://lorenzo-dry-cleaners-website.vercel.app/og-image.jpg"` with `"image": \`${getBaseUrl()}/og-image.jpg\``
- [ ] **Step 5:** Update ContactPageJsonLd component:
  - [ ] Line 154: Replace `"url": "https://lorenzo-dry-cleaners-website.vercel.app/contact"` with `"url": \`${getBaseUrl()}/contact\``
- [ ] **Step 6:** Save file
- [ ] **Step 7:** Verify no TypeScript errors: `npm run build` (from website folder)

**Verification:**
```bash
cd website
grep -n "lorenzo-dry-cleaners-website.vercel.app" components/seo/JsonLd.tsx
# Should return no results
```

---

### Task 1.2: Fix blog/[slug]/page.tsx Hardcoded URL
**File:** `website/app/blog/[slug]/page.tsx`
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Open `website/app/blog/[slug]/page.tsx`
- [ ] **Step 2:** Add base URL constant at the top of the component (around line 115):
  ```typescript
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ||
                  process.env.NEXT_PUBLIC_APP_URL ||
                  'https://lorenzodrycleaners.co.ke';
  ```
- [ ] **Step 3:** Locate line 120 (BlogPostingJsonLd url prop)
- [ ] **Step 4:** Replace:
  ```typescript
  // OLD:
  url={`https://lorenzo-dry-cleaners-website.vercel.app/blog/${slug}`}

  // NEW:
  url={`${baseUrl}/blog/${slug}`}
  ```
- [ ] **Step 5:** Save file
- [ ] **Step 6:** Verify no TypeScript errors

**Verification:**
```bash
cd website
grep -n "lorenzo-dry-cleaners-website.vercel.app" app/blog/[slug]/page.tsx
# Should return no results
```

---

## 🔴 PRIORITY 2: CRITICAL - BROKEN CUSTOMER LOGIN LINKS

### Task 2.1: Fix Header.tsx Customer Login Links
**File:** `website/components/marketing/Header.tsx`
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Open `website/components/marketing/Header.tsx`
- [ ] **Step 2:** Add POS_URL constant at the top of the component (around line 15):
  ```typescript
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';
  ```
- [ ] **Step 3:** Update line 109 (Desktop "Book Now" button):
  - Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
- [ ] **Step 4:** Update line 156 (Mobile "Book Now" button):
  - Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
- [ ] **Step 5:** Save file

**Verification:**
```bash
cd website
grep -n 'href="/customer-login"' components/marketing/Header.tsx
# Should return no results
```

---

### Task 2.2: Fix AboutLorenzo.tsx Customer Login Link
**File:** `website/components/marketing/AboutLorenzo.tsx`
**Estimated Time:** 3 minutes

- [ ] **Step 1:** Open `website/components/marketing/AboutLorenzo.tsx`
- [ ] **Step 2:** Add POS_URL constant at the top of the component:
  ```typescript
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';
  ```
- [ ] **Step 3:** Update line 284 ("Get Started Today" button):
  - Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
- [ ] **Step 4:** Save file

**Verification:**
```bash
grep -n 'href="/customer-login"' components/marketing/AboutLorenzo.tsx
# Should return no results
```

---

### Task 2.3: Fix CompanyStory.tsx Customer Login Link
**File:** `website/components/marketing/CompanyStory.tsx`
**Estimated Time:** 3 minutes

- [ ] **Step 1:** Open `website/components/marketing/CompanyStory.tsx`
- [ ] **Step 2:** Add POS_URL constant at the top of the component:
  ```typescript
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';
  ```
- [ ] **Step 3:** Update line 99 ("Book Now" link):
  - Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
- [ ] **Step 4:** Save file

**Verification:**
```bash
grep -n 'href="/customer-login"' components/marketing/CompanyStory.tsx
# Should return no results
```

---

### Task 2.4: Fix PricingSection.tsx Customer Login Links
**File:** `website/components/marketing/PricingSection.tsx`
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Open `website/components/marketing/PricingSection.tsx`
- [ ] **Step 2:** Add POS_URL constant at the top of the component:
  ```typescript
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';
  ```
- [ ] **Step 3:** Update all 4 "Get Started" button links:
  - Line 33: Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
  - Line 51: Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
  - Line 70: Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
  - Line 155: Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
- [ ] **Step 4:** Save file

**Verification:**
```bash
grep -n 'href="/customer-login"' components/marketing/PricingSection.tsx
# Should return no results
```

---

### Task 2.5: Fix about/page.tsx Customer Login Link
**File:** `website/app/about/page.tsx`
**Estimated Time:** 3 minutes

- [ ] **Step 1:** Open `website/app/about/page.tsx`
- [ ] **Step 2:** Add POS_URL constant at the top of the component:
  ```typescript
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';
  ```
- [ ] **Step 3:** Update line 112 (CTA button):
  - Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
- [ ] **Step 4:** Save file

**Verification:**
```bash
grep -n 'href="/customer-login"' app/about/page.tsx
# Should return no results
```

---

### Task 2.6: Fix services/page.tsx Customer Login Link
**File:** `website/app/services/page.tsx`
**Estimated Time:** 3 minutes

- [ ] **Step 1:** Open `website/app/services/page.tsx`
- [ ] **Step 2:** Add POS_URL constant at the top of the component:
  ```typescript
  const POS_URL = process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';
  ```
- [ ] **Step 3:** Update line 136 (CTA button):
  - Replace `href="/customer-login"` with `href={`${POS_URL}/customer-login`}`
- [ ] **Step 4:** Save file

**Verification:**
```bash
grep -n 'href="/customer-login"' app/services/page.tsx
# Should return no results
```

---

### Task 2.7: Verify All Customer Login Links Fixed
**Estimated Time:** 2 minutes

- [ ] **Step 1:** Run global search for remaining hardcoded links:
  ```bash
  cd website
  grep -r 'href="/customer-login"' app/ components/
  ```
- [ ] **Step 2:** Verify no results returned (all fixed)
- [ ] **Step 3:** Build project to check for TypeScript errors:
  ```bash
  npm run build
  ```
- [ ] **Step 4:** Confirm build succeeds

---

## 🟡 PRIORITY 3: HIGH - CONTACT FORM IMPLEMENTATION

### Task 3.1: Check/Create Firebase Configuration
**File:** `website/lib/firebase.ts`
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Check if `website/lib/firebase.ts` exists:
  ```bash
  cd website
  ls -la lib/firebase.ts
  ```
- [ ] **Step 2:** If file exists, verify it has Firestore initialized:
  - [ ] Check for `import { getFirestore } from 'firebase/firestore'`
  - [ ] Check for `export const db = getFirestore(app);`
- [ ] **Step 3:** If file doesn't exist or missing Firestore, create/update:
  ```typescript
  import { initializeApp, getApps } from 'firebase/app';
  import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  export const db = getFirestore(app);
  ```
- [ ] **Step 4:** Save file
- [ ] **Step 5:** Verify Firebase package is installed:
  ```bash
  grep "firebase" package.json
  # Should show "firebase": "^12.7.0"
  ```

---

### Task 3.2: Implement Contact Form Backend - Imports & Setup
**File:** `website/app/api/contact/route.ts`
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Open `website/app/api/contact/route.ts`
- [ ] **Step 2:** Add imports at the top (after existing imports):
  ```typescript
  import { Resend } from 'resend';
  import { db } from '@/lib/firebase';
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  ```
- [ ] **Step 3:** Add configuration constants after imports:
  ```typescript
  const resend = new Resend(process.env.RESEND_API_KEY);

  const watiConfig = {
    apiEndpoint: process.env.WATI_API_ENDPOINT || 'https://live-server-123456.wati.io',
    accessToken: process.env.WATI_ACCESS_TOKEN,
  };
  ```
- [ ] **Step 4:** Save file (don't build yet - more changes coming)

---

### Task 3.3: Implement Contact Form Backend - Firestore Storage
**File:** `website/app/api/contact/route.ts`
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Locate the POST handler function
- [ ] **Step 2:** Remove the simulated delay (line with `await new Promise`)
- [ ] **Step 3:** Remove the TODO comment block (lines 34-38)
- [ ] **Step 4:** Replace the `return NextResponse.json` success response with:
  ```typescript
  try {
    // 1. Save to Firestore (critical - must succeed)
    const contactDoc = await addDoc(collection(db, 'contacts'), {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject,
      message: body.message,
      status: 'new',
      createdAt: serverTimestamp(),
      processedAt: null,
    });

    console.log('Contact saved to Firestore:', contactDoc.id);

    // Email and WhatsApp implementations will be added in next steps

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: contactDoc.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process contact form. Please try again.'
      },
      { status: 500 }
    );
  }
  ```
- [ ] **Step 5:** Save file

---

### Task 3.4: Implement Contact Form Backend - Email Sending
**File:** `website/app/api/contact/route.ts`
**Estimated Time:** 15 minutes

- [ ] **Step 1:** Inside the try block, after Firestore save, add email sending:
  ```typescript
  // 2. Send emails (important but not critical)
  try {
    // Admin notification email
    const adminEmail = await resend.emails.send({
      from: 'noreply@lorenzodrycleaners.co.ke',
      to: 'admin@lorenzo-dry-cleaners.com', // TODO: Update with actual admin email
      subject: `New Contact Form: ${body.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0A2F2C; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #0A2F2C; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🔔 New Contact Form Submission</h2>
              </div>
              <div class="content">
                <div class="field">
                  <span class="label">Name:</span> ${body.name}
                </div>
                <div class="field">
                  <span class="label">Email:</span> ${body.email}
                </div>
                <div class="field">
                  <span class="label">Phone:</span> ${body.phone || 'Not provided'}
                </div>
                <div class="field">
                  <span class="label">Subject:</span> ${body.subject}
                </div>
                <div class="field">
                  <span class="label">Message:</span><br/>
                  ${body.message.replace(/\n/g, '<br/>')}
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Admin email sent:', adminEmail.id);

    // Customer confirmation email
    const customerEmail = await resend.emails.send({
      from: 'noreply@lorenzodrycleaners.co.ke',
      to: body.email,
      subject: 'Thank you for contacting Lorenzo Dry Cleaners',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0A2F2C; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>✅ We received your message!</h2>
              </div>
              <div class="content">
                <p>Hi ${body.name},</p>
                <p>Thank you for reaching out to Lorenzo Dry Cleaners. Our team will respond to your inquiry within 24 hours.</p>
                <p><strong>Your message:</strong></p>
                <p style="background: white; padding: 15px; border-left: 4px solid #0A2F2C;">
                  ${body.message.replace(/\n/g, '<br/>')}
                </p>
              </div>
              <div class="footer">
                <p>Lorenzo Dry Cleaners | Nairobi, Kenya</p>
                <p>Phone: +254 725 462 859 | Email: info@lorenzodrycleaners.co.ke</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Customer confirmation email sent:', customerEmail.id);
  } catch (emailError) {
    console.error('Failed to send emails:', emailError);
    // Don't fail the entire request if emails fail
    // Contact is already saved to Firestore
  }
  ```
- [ ] **Step 2:** Save file

---

### Task 3.5: Implement Contact Form Backend - WhatsApp Integration
**File:** `website/app/api/contact/route.ts`
**Estimated Time:** 10 minutes

- [ ] **Step 1:** After the email sending try-catch block, add WhatsApp notification:
  ```typescript
  // 3. Send WhatsApp notification (optional enhancement)
  if (watiConfig.accessToken) {
    try {
      const whatsappResponse = await fetch(
        `${watiConfig.apiEndpoint}/api/v1/sendSessionMessage`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${watiConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            whatsappNumber: '+254725462859', // Admin phone number
            message: `🔔 *New Contact Form Submission*\n\n*Name:* ${body.name}\n*Email:* ${body.email}\n*Phone:* ${body.phone || 'Not provided'}\n*Subject:* ${body.subject}\n\n*Message:*\n${body.message}`,
          }),
        }
      );

      if (whatsappResponse.ok) {
        console.log('WhatsApp notification sent successfully');
      } else {
        console.error('WhatsApp API error:', await whatsappResponse.text());
      }
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification:', whatsappError);
      // Don't fail the request if WhatsApp fails
    }
  } else {
    console.log('WhatsApp integration not configured (WATI_ACCESS_TOKEN missing)');
  }
  ```
- [ ] **Step 2:** Save file
- [ ] **Step 3:** Verify the complete try-catch structure looks correct:
  ```typescript
  try {
    // 1. Firestore save
    // 2. Email sending (nested try-catch)
    // 3. WhatsApp notification (nested try-catch)
    return NextResponse.json({ success: true, ... });
  } catch (error) {
    // Main error handler
  }
  ```

---

### Task 3.6: Test Contact Form Backend Locally
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Verify environment variables in `.env.local`:
  ```bash
  cd website
  cat .env.local | grep -E "(RESEND|WATI|FIREBASE)"
  ```
- [ ] **Step 2:** Build the project:
  ```bash
  npm run build
  ```
- [ ] **Step 3:** Fix any TypeScript errors if they appear
- [ ] **Step 4:** Start development server:
  ```bash
  npm run dev
  ```
- [ ] **Step 5:** Open browser to `http://localhost:3001/contact`
- [ ] **Step 6:** Fill out and submit contact form
- [ ] **Step 7:** Check console output for:
  - "Contact saved to Firestore: [document-id]"
  - Email sending logs (may fail if Resend not configured locally - that's OK)
  - WhatsApp logs (may fail if Wati not configured locally - that's OK)
- [ ] **Step 8:** Verify Firestore document created (if Firebase configured)

---

## 🟡 PRIORITY 4: HIGH - SECURITY HEADER (CSP)

### Task 4.1: Add Content Security Policy Header
**File:** `website/next.config.ts`
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Open `website/next.config.ts`
- [ ] **Step 2:** Locate the `headers` array (should be around line 40-80)
- [ ] **Step 3:** Find the last header object (should be "X-Content-Type-Options" or similar)
- [ ] **Step 4:** After the last header object (before the closing `]`), add a comma and new CSP header:
  ```typescript
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://firebase.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com",
      "media-src 'self' https:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
  ```
- [ ] **Step 5:** Ensure proper comma placement (no trailing comma after last header)
- [ ] **Step 6:** Save file
- [ ] **Step 7:** Build to verify syntax:
  ```bash
  npm run build
  ```
- [ ] **Step 8:** Fix any syntax errors

**Verification:**
```bash
cd website
npm run build && npm run start
curl -I http://localhost:3001 | grep "Content-Security-Policy"
# Should show the CSP header
```

---

## 🟢 PRIORITY 5: MEDIUM - ENVIRONMENT VARIABLES

### Task 5.1: Update .env.example Documentation
**File:** `website/.env.example`
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Open `website/.env.example`
- [ ] **Step 2:** Verify or add website URL variables at the top:
  ```env
  # Website URLs (REQUIRED)
  NEXT_PUBLIC_WEBSITE_URL=https://lorenzodrycleaners.co.ke
  NEXT_PUBLIC_APP_URL=https://lorenzodrycleaners.co.ke
  NEXT_PUBLIC_POS_API_URL=https://lorenzo-dry-cleaners.vercel.app
  ```
- [ ] **Step 3:** Verify or add Resend section:
  ```env
  # Email Service (REQUIRED for contact form)
  RESEND_API_KEY=re_your_api_key_here
  ```
- [ ] **Step 4:** Add or verify WhatsApp section:
  ```env
  # WhatsApp Integration - Wati.io (OPTIONAL)
  WATI_API_ENDPOINT=https://live-server-123456.wati.io
  WATI_ACCESS_TOKEN=your_wati_access_token_here
  ```
- [ ] **Step 5:** Verify Firebase section exists:
  ```env
  # Firebase Configuration (REQUIRED)
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  ```
- [ ] **Step 6:** Save file
- [ ] **Step 7:** Add comments explaining each variable's purpose

---

### Task 5.2: Update .env.local for Development
**File:** `website/.env.local`
**Estimated Time:** 3 minutes

- [ ] **Step 1:** Open `website/.env.local`
- [ ] **Step 2:** Update or add website URLs:
  ```env
  NEXT_PUBLIC_WEBSITE_URL=http://localhost:3001
  NEXT_PUBLIC_APP_URL=http://localhost:3001
  NEXT_PUBLIC_POS_API_URL=http://localhost:3000
  ```
- [ ] **Step 3:** Add Resend API key (if available for testing):
  ```env
  RESEND_API_KEY=re_your_dev_api_key
  ```
- [ ] **Step 4:** Add Wati.io credentials (if available for testing):
  ```env
  WATI_API_ENDPOINT=https://live-server-your-id.wati.io
  WATI_ACCESS_TOKEN=your_dev_token
  ```
- [ ] **Step 5:** Verify Firebase credentials are present (from existing setup)
- [ ] **Step 6:** Save file
- [ ] **Step 7:** Restart dev server to pick up new variables

---

## 🟢 PRIORITY 6: MEDIUM - SEO ENHANCEMENTS

### Task 6.1: Add FAQPageJsonLd to FAQ Page
**File:** `website/app/faq/page.tsx`
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Open `website/app/faq/page.tsx`
- [ ] **Step 2:** Add import at the top:
  ```typescript
  import { FAQPageJsonLd } from '@/components/seo/JsonLd';
  ```
- [ ] **Step 3:** Find the FAQ data structure in the component
- [ ] **Step 4:** Create a structured FAQ array for JSON-LD (at the top of the component):
  ```typescript
  const faqSchemaData = [
    {
      question: "What services do you offer?",
      answer: "We offer professional dry cleaning, laundry, ironing, and alteration services for all types of garments including suits, dresses, curtains, and more."
    },
    // Add more FAQs from the existing component data
    // Copy question/answer pairs from the FAQ sections
  ];
  ```
- [ ] **Step 5:** Add the FAQPageJsonLd component before the main content return:
  ```typescript
  return (
    <>
      <FAQPageJsonLd faqs={faqSchemaData} />
      {/* Existing FAQ page content */}
    </>
  );
  ```
- [ ] **Step 6:** Map all existing FAQ items to the faqSchemaData array
- [ ] **Step 7:** Save file
- [ ] **Step 8:** Build to verify:
  ```bash
  npm run build
  ```

---

### Task 6.2: Add FAQPageJsonLd to Help Page (Optional)
**File:** `website/app/help/page.tsx`
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Open `website/app/help/page.tsx`
- [ ] **Step 2:** Check if page has FAQ-style content (questions and answers)
- [ ] **Step 3:** If yes, repeat Task 6.1 steps for this page
- [ ] **Step 4:** If no, mark as N/A and skip
- [ ] **Step 5:** Save file

---

## 🧪 COMPREHENSIVE TESTING & VERIFICATION

### Task 7.1: Build & Type Check
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Clean build directory:
  ```bash
  cd website
  rm -rf .next
  ```
- [ ] **Step 2:** Run production build:
  ```bash
  npm run build
  ```
- [ ] **Step 3:** Verify build succeeds with 0 errors
- [ ] **Step 4:** Check for warnings - review and fix any critical ones
- [ ] **Step 5:** Run linter:
  ```bash
  npm run lint
  ```
- [ ] **Step 6:** Verify 0 ESLint errors/warnings

---

### Task 7.2: Test All Customer Login Links
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Start development server:
  ```bash
  npm run dev
  ```
- [ ] **Step 2:** Open browser to `http://localhost:3001`
- [ ] **Step 3:** Test Header "Book Now" buttons:
  - [ ] Desktop header button → Should go to `http://localhost:3000/customer-login`
  - [ ] Mobile header button → Should go to `http://localhost:3000/customer-login`
- [ ] **Step 4:** Scroll to About section, click "Get Started" → Should go to POS login
- [ ] **Step 5:** Navigate to `/about` page, click CTA button → Should go to POS login
- [ ] **Step 6:** Navigate to `/services` page:
  - [ ] Test pricing section "Get Started" buttons (4 of them) → All go to POS login
  - [ ] Test bottom CTA button → Should go to POS login
- [ ] **Step 7:** Open footer, click "Track Order" → Should go to `http://localhost:3000/customer-login`
- [ ] **Step 8:** Open footer, click "Staff Only" → Should go to `http://localhost:3000/login`
- [ ] **Step 9:** Document any broken links

---

### Task 7.3: Test Structured Data (JSON-LD)
**Estimated Time:** 15 minutes

- [ ] **Step 1:** Navigate to homepage `http://localhost:3001`
- [ ] **Step 2:** View page source (Ctrl+U or Cmd+U)
- [ ] **Step 3:** Search for `@type": "LocalBusiness"`
- [ ] **Step 4:** Verify URL shows `http://localhost:3001` (NOT vercel staging URL)
- [ ] **Step 5:** Copy the LocalBusiness JSON-LD script
- [ ] **Step 6:** Validate at https://validator.schema.org/
  - [ ] Paste JSON-LD
  - [ ] Verify "No errors"
  - [ ] Check for warnings
- [ ] **Step 7:** Navigate to `/blog` page
- [ ] **Step 8:** View source, verify BlogPosting schema uses correct domain
- [ ] **Step 9:** Navigate to `/services` page
- [ ] **Step 10:** View source, verify Service schema uses correct domain
- [ ] **Step 11:** Navigate to `/faq` page
- [ ] **Step 12:** View source, verify FAQPage schema is present and valid
- [ ] **Step 13:** Document any schema.org validation errors

---

### Task 7.4: Test Contact Form End-to-End
**Estimated Time:** 15 minutes

- [ ] **Step 1:** Navigate to `/contact` page
- [ ] **Step 2:** Open browser dev tools console
- [ ] **Step 3:** Fill out contact form with test data:
  - Name: Test User
  - Email: test@example.com
  - Phone: +254712345678
  - Subject: Test Submission
  - Message: This is a test message for contact form validation
- [ ] **Step 4:** Submit form
- [ ] **Step 5:** Verify success message appears on screen
- [ ] **Step 6:** Check console for logs:
  - [ ] "Contact saved to Firestore: [document-id]"
  - [ ] Email sending logs (admin + customer)
  - [ ] WhatsApp notification log
- [ ] **Step 7:** Check Firestore database:
  - [ ] Navigate to Firebase Console → Firestore
  - [ ] Find `contacts` collection
  - [ ] Verify new document exists with test data
- [ ] **Step 8:** Check admin email inbox (if Resend configured)
- [ ] **Step 9:** Check test email inbox for confirmation (if Resend configured)
- [ ] **Step 10:** Check admin WhatsApp for notification (if Wati configured)
- [ ] **Step 11:** Test form validation:
  - [ ] Submit empty form → Should show validation errors
  - [ ] Submit invalid email → Should show email format error
  - [ ] Submit invalid phone format → Should show phone error
- [ ] **Step 12:** Document any issues

---

### Task 7.5: Test Security Headers
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Build and start production mode:
  ```bash
  npm run build
  npm run start
  ```
- [ ] **Step 2:** Check headers using curl:
  ```bash
  curl -I http://localhost:3001
  ```
- [ ] **Step 3:** Verify presence of security headers:
  - [ ] `Content-Security-Policy: default-src 'self'; ...`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] **Step 4:** Test in browser:
  - [ ] Open DevTools → Network tab
  - [ ] Reload page
  - [ ] Click on document request
  - [ ] Check Response Headers
  - [ ] Verify CSP header is present
- [ ] **Step 5:** Document any missing headers

---

### Task 7.6: Test Responsive Design & Images
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Open site in desktop browser
- [ ] **Step 2:** Navigate through all pages:
  - [ ] Homepage - Check hero video, images load
  - [ ] About - Check hero image loads
  - [ ] Services - Check service images
  - [ ] Blog - Check blog post images
  - [ ] Contact - Check contact page rendering
- [ ] **Step 3:** Open browser DevTools (F12)
- [ ] **Step 4:** Switch to mobile view (iPhone/Android)
- [ ] **Step 5:** Navigate through all pages again
- [ ] **Step 6:** Verify:
  - [ ] All images load properly
  - [ ] No broken image icons
  - [ ] Images are optimized (check Network tab for AVIF/WebP)
  - [ ] Hero video plays on mobile
  - [ ] Mobile navigation works
- [ ] **Step 7:** Test on actual mobile device if available
- [ ] **Step 8:** Document any rendering issues

---

### Task 7.7: Performance Testing
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Open Chrome/Edge in Incognito mode
- [ ] **Step 2:** Navigate to `http://localhost:3001`
- [ ] **Step 3:** Open DevTools → Lighthouse tab
- [ ] **Step 4:** Run Lighthouse audit:
  - Mode: Desktop
  - Categories: Performance, Accessibility, Best Practices, SEO
- [ ] **Step 5:** Review scores:
  - [ ] Performance: Target 90+
  - [ ] Accessibility: Target 95+
  - [ ] Best Practices: Target 95+
  - [ ] SEO: Target 95+
- [ ] **Step 6:** Run mobile audit
- [ ] **Step 7:** Review Core Web Vitals:
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] **Step 8:** Document any performance issues
- [ ] **Step 9:** Take screenshots of Lighthouse scores for reference

---

## 📦 PRE-DEPLOYMENT CHECKLIST

### Task 8.1: Final Code Review
**Estimated Time:** 15 minutes

- [ ] **Step 1:** Review all modified files for:
  - [ ] No console.log statements in production code
  - [ ] No commented-out code blocks
  - [ ] Proper error handling
  - [ ] TypeScript types are correct
  - [ ] No hardcoded staging URLs remain
- [ ] **Step 2:** Search for remaining staging URLs:
  ```bash
  cd website
  grep -r "lorenzo-dry-cleaners-website.vercel.app" .
  grep -r "vercel.app" app/ components/ | grep -v node_modules
  ```
- [ ] **Step 3:** Verify no results (all staging URLs removed)
- [ ] **Step 4:** Review .env.example completeness
- [ ] **Step 5:** Verify .gitignore includes `.env.local`

---

### Task 8.2: Dependency Audit
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Check for outdated packages:
  ```bash
  cd website
  npm outdated
  ```
- [ ] **Step 2:** Review critical updates (security patches)
- [ ] **Step 3:** Check for vulnerabilities:
  ```bash
  npm audit
  ```
- [ ] **Step 4:** Fix high/critical vulnerabilities if any:
  ```bash
  npm audit fix
  ```
- [ ] **Step 5:** Document any unfixed vulnerabilities

---

### Task 8.3: Documentation Update
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Update `website/README.md`:
  - [ ] Verify environment variables section is current
  - [ ] Update deployment instructions if needed
  - [ ] Add notes about Wati.io integration
- [ ] **Step 2:** Create/update deployment notes:
  - [ ] Document required Vercel environment variables
  - [ ] List Resend domain verification requirements
  - [ ] Note Wati.io setup requirements
  - [ ] Add admin email address to update
  - [ ] Add admin phone number to verify
- [ ] **Step 3:** Review CLAUDE.md for any website-specific notes needed

---

## 🚀 DEPLOYMENT PREPARATION

### Task 9.1: Prepare Vercel Environment Variables List
**Estimated Time:** 5 minutes

Create a deployment checklist document with Vercel environment variables:

- [ ] **Step 1:** Create `website/DEPLOYMENT.md` file
- [ ] **Step 2:** List all required production environment variables:
  ```markdown
  ## Vercel Environment Variables (Production)

  ### Website URLs
  - NEXT_PUBLIC_WEBSITE_URL=https://lorenzodrycleaners.co.ke
  - NEXT_PUBLIC_APP_URL=https://lorenzodrycleaners.co.ke
  - NEXT_PUBLIC_POS_API_URL=https://lorenzo-dry-cleaners.vercel.app

  ### Email Service (Resend)
  - RESEND_API_KEY=re_[get from Resend dashboard]
  - NOTE: Verify domain lorenzodrycleaners.co.ke in Resend first

  ### WhatsApp (Wati.io)
  - WATI_API_ENDPOINT=https://live-server-[your-id].wati.io
  - WATI_ACCESS_TOKEN=[get from Wati.io dashboard]
  - NOTE: Verify phone +254725462859 in Wati.io

  ### Firebase (Copy from .env.local)
  - NEXT_PUBLIC_FIREBASE_API_KEY=
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  - NEXT_PUBLIC_FIREBASE_APP_ID=
  ```
- [ ] **Step 3:** Document Vercel project settings:
  - [ ] Enable Skew Protection
  - [ ] Enable Speed Insights
  - [ ] Enable Analytics
  - [ ] Custom domain: lorenzodrycleaners.co.ke
- [ ] **Step 4:** Save file

---

### Task 9.2: Test Production Build Locally
**Estimated Time:** 10 minutes

- [ ] **Step 1:** Clean and rebuild:
  ```bash
  cd website
  rm -rf .next
  npm run build
  ```
- [ ] **Step 2:** Verify build output:
  - [ ] Check for "Compiled successfully"
  - [ ] Review page generation (Static/SSG pages)
  - [ ] Check bundle sizes (should be reasonable)
- [ ] **Step 3:** Start production server:
  ```bash
  npm run start
  ```
- [ ] **Step 4:** Test production site at `http://localhost:3001`
- [ ] **Step 5:** Quick smoke test:
  - [ ] Homepage loads
  - [ ] Navigation works
  - [ ] Contact form works
  - [ ] No console errors
- [ ] **Step 6:** Stop server (Ctrl+C)

---

### Task 9.3: Git Commit Changes
**Estimated Time:** 5 minutes

- [ ] **Step 1:** Check git status:
  ```bash
  cd website
  git status
  ```
- [ ] **Step 2:** Review all modified files
- [ ] **Step 3:** Stage changes:
  ```bash
  git add .
  ```
- [ ] **Step 4:** Create commit:
  ```bash
  git commit -m "feat(website): fix production deployment issues

  - Replace hardcoded staging URLs with environment variables in JsonLd and blog pages
  - Fix customer login links to use POS_API_URL across all components
  - Implement contact form with Resend email, Firestore storage, and Wati.io WhatsApp notifications
  - Add Content-Security-Policy header for enhanced security
  - Add FAQPageJsonLd to FAQ page for improved SEO
  - Update environment variable documentation

  Addresses production deployment audit findings

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
  ```
- [ ] **Step 5:** Verify commit created:
  ```bash
  git log -1
  ```

---

## ✅ POST-IMPLEMENTATION VERIFICATION

### Task 10.1: Final Verification Checklist
**Estimated Time:** 10 minutes

Run through this checklist to ensure everything is completed:

- [ ] **URLs Fixed:**
  - [ ] No hardcoded `lorenzo-dry-cleaners-website.vercel.app` URLs remain
  - [ ] All blog pages use environment variables
  - [ ] JSON-LD structured data uses getBaseUrl()

- [ ] **Customer Login Links:**
  - [ ] Header.tsx - both desktop and mobile buttons
  - [ ] AboutLorenzo.tsx - "Get Started" button
  - [ ] CompanyStory.tsx - "Book Now" link
  - [ ] PricingSection.tsx - all 4 "Get Started" buttons
  - [ ] about/page.tsx - CTA button
  - [ ] services/page.tsx - CTA button
  - [ ] All use POS_URL environment variable

- [ ] **Contact Form:**
  - [ ] Firestore storage implemented
  - [ ] Admin email notification via Resend
  - [ ] Customer confirmation email via Resend
  - [ ] WhatsApp notification via Wati.io
  - [ ] Error handling for all integrations
  - [ ] Frontend shows success/error messages

- [ ] **Security:**
  - [ ] Content-Security-Policy header added
  - [ ] All existing security headers still present

- [ ] **SEO:**
  - [ ] FAQPageJsonLd added to FAQ page
  - [ ] All structured data validates with schema.org

- [ ] **Environment Variables:**
  - [ ] .env.example updated with all variables
  - [ ] .env.local updated for development
  - [ ] DEPLOYMENT.md created with production values

- [ ] **Testing:**
  - [ ] Build succeeds with no errors
  - [ ] Linting passes
  - [ ] All links tested and working
  - [ ] Contact form tested end-to-end
  - [ ] Security headers verified
  - [ ] Lighthouse audit scores acceptable

- [ ] **Documentation:**
  - [ ] README.md updated if needed
  - [ ] DEPLOYMENT.md created
  - [ ] Changes committed to git

---

## 📝 IMPLEMENTATION NOTES

### Important Phone Numbers & Emails to Update

Before production deployment, verify these values are correct:

1. **Admin Email** (in `website/app/api/contact/route.ts`):
   - Currently: `admin@lorenzo-dry-cleaners.com`
   - Update to actual admin email address

2. **Admin WhatsApp** (in `website/app/api/contact/route.ts`):
   - Currently: `+254725462859`
   - Verify this is correct admin number

3. **Customer Service Info** (in email templates):
   - Phone: +254 725 462 859
   - Email: info@lorenzodrycleaners.co.ke
   - Verify these match actual contact info

### Resend Domain Verification

Before production deployment:
1. Log into Resend dashboard
2. Add domain: `lorenzodrycleaners.co.ke`
3. Add required DNS records (SPF, DKIM, DMARC)
4. Wait for verification (can take up to 48 hours)
5. Test email sending from verified domain

### Wati.io Setup

Before production deployment:
1. Log into Wati.io dashboard
2. Verify admin phone number: +254725462859
3. Get API endpoint URL (format: https://live-server-[id].wati.io)
4. Generate access token from API settings
5. Test WhatsApp API with sample message

### Firebase Firestore Setup

Ensure Firestore rules allow contact form submissions:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{contactId} {
      allow create: if true; // Allow public contact form submissions
      allow read, update, delete: if request.auth != null; // Only authenticated users can read/modify
    }
  }
}
```

---

## 🎯 SUCCESS METRICS

After deployment, verify these metrics:

- ✅ **Build Success:** Website builds without errors
- ✅ **Zero Hardcoded URLs:** No staging URLs in production code
- ✅ **Working Links:** All customer login links navigate to POS system
- ✅ **Contact Form:** Submissions saved to Firestore with email + WhatsApp notifications
- ✅ **Security:** All headers present including CSP
- ✅ **SEO:** Structured data validates with schema.org
- ✅ **Performance:** Lighthouse scores >90 for all categories
- ✅ **Accessibility:** WCAG 2.1 Level AA compliant

---

## 🚨 ROLLBACK PLAN

If critical issues occur after deployment:

1. **Immediate Rollback:**
   ```bash
   vercel rollback [deployment-url]
   ```

2. **Git Revert:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Check Environment Variables:**
   - Verify all Vercel env vars are set correctly
   - Check Resend domain verification status
   - Verify Wati.io credentials are valid

4. **Review Logs:**
   - Vercel deployment logs
   - Contact form API errors
   - Firebase Firestore errors

---

**END OF IMPLEMENTATION TASKS**

Total Tasks: 80+
Estimated Completion Time: ~2.75 hours
Last Updated: 2026-02-12
