# Lorenzo POS - Integration Points Documentation

This document describes all external service integrations used in the Lorenzo Dry Cleaners POS system.

## 1. Firebase

### Client SDK (`lib/firebase.ts`)

**Purpose:** Client-side authentication, database, and storage operations.

**Services:**
- **Firebase Auth:** User authentication (email/password, phone OTP)
- **Firestore:** Real-time NoSQL database
- **Firebase Storage:** File uploads (garment photos, receipts)

**Configuration:**
```typescript
// Environment variables (NEXT_PUBLIC_*)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Usage:**
```typescript
import { db, auth, storage } from '@/lib/firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';

// Query documents
const q = query(collection(db, 'orders'), where('status', '==', 'ready'));
const snapshot = await getDocs(q);
```

**Key Points:**
- Lazy initialization with Proxy pattern
- Only initializes on client-side (browser)
- Used by React components and hooks

### Admin SDK (`lib/firebase-admin.ts`)

**Purpose:** Server-side operations with full database access.

**Configuration:**
```bash
# Service account JSON (base64 encoded or raw JSON)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

**Usage:**
```typescript
import { adminDb, adminAuth, adminStorage } from '@/lib/firebase-admin';

// Query with Admin SDK
const snapshot = await adminDb.collection('orders')
  .where('branchId', '==', branchId)
  .get();

// Verify ID token
const decodedToken = await adminAuth.verifyIdToken(idToken);

// Set custom claims
await adminAuth.setCustomUserClaims(uid, { role: 'admin', branchId: 'KIL' });
```

**Key Points:**
- Bypasses Firestore security rules
- Required for API routes and server actions
- Uses service account credentials (not user auth)

### Security Rules (`firestore.rules`)

**Helper Functions:**
```javascript
function isAuthenticated() { ... }
function hasRole(role) { ... }
function hasAnyRole(roles) { ... }
function isExecutive() { ... }  // Director/GM
function canAccessBranch(branchId) { ... }
function isSuperAdmin() { ... }
```

**Collection Rules Defined:**
- `users`, `customers`, `orders`, `transactions`
- `branches`, `deliveries`, `inventory`, `pricing`
- `notifications`, `attendance`, `equipment`, `issues`
- `customerFeedback`, `permissionRequests`, `auditLogs`

---

## 2. Pesapal Payment Gateway

**File:** `services/pesapal.ts`

**Purpose:** Process M-Pesa and card payments.

**API Version:** v3

**Configuration:**
```bash
PESAPAL_API_URL=https://cybqa.pesapal.com/pesapalv3  # Sandbox
PESAPAL_API_URL=https://pay.pesapal.com/v3            # Production
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_IPN_URL=https://yourapp.com/api/webhooks/pesapal
```

**Authentication:**
- OAuth 2.0 Bearer Token
- Token cached with 4-minute expiry
- Auto-refresh on expiry

**Key Functions:**

```typescript
// Get OAuth token
export async function getPesapalAccessToken(): Promise<string>

// Submit payment request
export async function submitOrderRequest(data: PesapalPaymentData): Promise<PesapalPaymentResponse>

// Check transaction status
export async function getTransactionStatus(orderTrackingId: string): Promise<PesapalStatusResponse>

// Map Pesapal status to internal status
export function mapPesapalStatus(pesapalStatus: number): TransactionStatus
```

**Payment Flow:**
1. Client initiates payment → `initiateDigitalPayment()`
2. Create pending transaction in Firestore
3. Submit to Pesapal → Get redirect URL
4. Customer completes payment on Pesapal
5. Pesapal sends IPN callback → `/api/webhooks/pesapal`
6. Verify callback and update transaction status
7. Update order payment status

**IPN Webhook Handler:**
```typescript
// app/api/webhooks/pesapal/route.ts
export async function POST(request: Request) {
  // Verify IPN callback
  // Update transaction status
  // Update order payment status
}
```

**Pesapal Status Codes:**
| Code | Meaning | Internal Status |
|------|---------|-----------------|
| 0 | Invalid | failed |
| 1 | Completed | completed |
| 2 | Failed | failed |
| 3 | Reversed | failed |

---

## 3. Wati.io (WhatsApp Business API)

**File:** `services/wati.ts`

**Purpose:** Automated WhatsApp notifications for order lifecycle events.

**Configuration:**
```bash
WATI_API_ENDPOINT=https://live-server.wati.io
WATI_ACCESS_TOKEN=your_access_token
```

**Authentication:**
- Bearer Token in Authorization header
- 30-second timeout
- Retry with exponential backoff (3 attempts)

**Key Functions:**

```typescript
// Format phone number for Wati
export function formatPhoneNumber(phone: string): string
// Example: +254712345678 → 254712345678

// Validate Kenya phone number
export function isValidKenyanPhoneNumber(phone: string): boolean

// Send template message
export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  parameters: string[]
): Promise<WatiResponse>

// Order lifecycle notifications
export async function sendOrderConfirmation(order: Order, customer: Customer): Promise<void>
export async function sendOrderReady(order: Order, customer: Customer): Promise<void>
export async function sendDriverDispatched(order: Order, customer: Customer, driver: User): Promise<void>
export async function sendOrderDelivered(order: Order, customer: Customer): Promise<void>
```

**Message Templates Required:**
| Template Name | Event | Parameters |
|--------------|-------|------------|
| `order_confirmation` | Order created | orderId, customerName, garmentCount, totalAmount |
| `order_ready` | Order ready | orderId, customerName, branchName |
| `driver_dispatched` | Driver assigned | orderId, driverName, estimatedArrival |
| `driver_nearby` | Driver near | orderId, minutes |
| `order_delivered` | Delivered | orderId, customerName |
| `payment_reminder` | Payment due | orderId, amount |

**Notification Logging:**
- All notifications logged to `notifications` collection
- Tracks: type, status, timestamp, recipientPhone, orderId

---

## 4. Google Maps API

**Files:**
- `services/google-maps.ts` - Server-side utilities
- `lib/maps/geocoding.ts` - Address geocoding
- `lib/maps/directions.ts` - Route directions
- `lib/maps/route-optimizer.ts` - Route optimization

**Configuration:**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
```

**APIs Used:**
| API | Purpose | Billing |
|-----|---------|---------|
| Geocoding API | Address → Coordinates | Per request |
| Directions API | Route planning | Per request |
| Distance Matrix API | Multiple distances | Per element |
| Places API | Address autocomplete | Per session |
| Maps JavaScript API | Map display | Per load |

**Key Functions:**

```typescript
// Geocoding (lib/maps/geocoding.ts)
export async function geocodeAddress(address: string): Promise<GeocodeResult>
export async function reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult>

// Directions (lib/maps/directions.ts)
export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  waypoints?: Coordinates[]
): Promise<DirectionsResult>

// Route Optimization (lib/maps/route-optimizer.ts)
export async function optimizeRoute(
  origin: Coordinates,
  stops: DeliveryStop[]
): Promise<OptimizedRoute>
```

**Client-Side Map Component:**
```typescript
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const { isLoaded } = useLoadScript({
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
});
```

**Rate Limits:**
- Geocoding: 50 requests/second
- Directions: 50 requests/second
- Distance Matrix: 1000 elements/request

---

## 5. Resend (Email Service)

**File:** `lib/email/receipt-mailer.ts`, `services/email.ts`

**Purpose:** Send transactional emails (receipts, notifications).

**Configuration:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Key Functions:**

```typescript
// Send receipt email with PDF attachment
export async function sendReceiptEmail(
  customerEmail: string,
  customerName: string,
  order: Order,
  customer: Customer
): Promise<{ success: boolean; error?: string }>

// Send batch emails
export async function sendBatchReceiptEmails(
  receipts: Array<{ email: string; name: string; order: Order; customer: Customer }>
): Promise<{ successful: number; failed: number; errors: Array<...> }>
```

**Email Flow:**
1. Client calls `sendReceiptEmail()`
2. POST to `/api/receipts/email`
3. API route generates PDF with `jsPDF`
4. Send email via Resend API with PDF attachment
5. Return success/failure

**Rate Limits:**
- Free tier: 100 emails/day
- Paid: Based on plan

---

## 6. OpenAI API

**Configuration:**
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

**Use Cases:**
| Feature | Model | Purpose |
|---------|-------|---------|
| AI Recommendations | GPT-4 | Director dashboard insights |
| Order Time Estimation | GPT-3.5 | Predict completion time |
| Analytics Insights | GPT-4 | Generate business narratives |
| Customer Support | GPT-3.5 | Auto-respond to queries |

**API Route:**
```typescript
// app/api/analytics/director/ai-narrative/route.ts
export async function GET() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'system', content: systemPrompt }, ...],
    temperature: 0.7,
    max_tokens: 500,
  });

  return NextResponse.json({ narrative: completion.choices[0].message.content });
}
```

**LLM Configuration (Dynamic):**
- Provider configs stored in `system_config/providers`
- Model assignments in `system_config/model_assignments`
- Supports OpenAI, Anthropic, Google, Local models

---

## 7. Biometric Devices

**File:** `services/biometric.ts`

**Purpose:** Employee attendance tracking via fingerprint/face recognition.

**Supported Vendors:**
- ZKTeco
- Suprema
- Hikvision
- Generic

**Configuration:**
- Device configs stored in `biometricDevices` collection
- Each device has: IP, API endpoint, API key, vendor

**Webhook Handler:**
```typescript
// app/api/webhooks/biometric/route.ts
export async function POST(request: Request) {
  // Parse biometric event
  // Match employee by biometricId
  // Create/update attendance record
}
```

**Event Flow:**
1. Employee scans fingerprint/face
2. Device sends webhook to `/api/webhooks/biometric`
3. Create `biometricEvents` document
4. Match employee by `biometricId`
5. Create/update `attendance` record

---

## 8. Weather Service

**File:** `services/weather.ts`

**Purpose:** Display weather on GM dashboard.

**API:** OpenWeatherMap (or similar)

**Configuration:**
```bash
WEATHER_API_KEY=your_api_key
```

---

## Environment Variables Summary

### Required (Production)

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=

# Payments
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_API_URL=
PESAPAL_IPN_URL=

# WhatsApp
WATI_ACCESS_TOKEN=
WATI_API_ENDPOINT=

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Email
RESEND_API_KEY=
```

### Optional

```bash
# AI Features
OPENAI_API_KEY=

# Weather
WEATHER_API_KEY=

# Webhooks
WEBHOOK_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=
```

---

## Integration Testing Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| Test Wati | WhatsApp integration | `npm run test:wati` |
| Test Email | Email service | `npm run test:email` |
| Test Maps | Google Maps | `npm run test:maps` |

---

## Error Handling Patterns

### Pesapal Errors

```typescript
try {
  const response = await submitOrderRequest(data);
  if (!response.success) {
    // Handle API error
    console.error('Pesapal error:', response.error);
    return { success: false, error: response.error };
  }
} catch (error) {
  // Handle network/timeout error
  console.error('Pesapal request failed:', error);
  throw new Error('Payment service unavailable');
}
```

### Wati Errors (Retry Pattern)

```typescript
async function sendWithRetry(fn: () => Promise<Response>, attempts = 3): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000)); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Graceful Degradation

Notifications are fire-and-forget:
```typescript
// Order creation doesn't fail if notification fails
const orderId = await createOrder(data);

// Fire and forget - don't await
notifyOrderCreated({ order, customer }).catch(err => {
  console.error('Notification failed, order still created:', err);
});

return orderId; // Return immediately
```

---

**Last Updated:** January 2026
**Document Version:** 1.0
