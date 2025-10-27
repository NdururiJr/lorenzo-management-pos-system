# Pickup & Delivery System - Complete Implementation Plan

**Date:** October 25, 2025
**Status:** 📋 Planning Complete - Ready for Implementation
**Total Estimated Time:** 20-25 hours

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Business Requirements](#business-requirements)
3. [Technical Architecture](#technical-architecture)
4. [Schema Design](#schema-design)
5. [UI/UX Design](#uiux-design)
6. [WhatsApp Integration](#whatsapp-integration)
7. [Implementation Phases](#implementation-phases)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)

---

## 1. System Overview

### Purpose

Lorenzo Dry Cleaners needs a comprehensive system to manage two-way garment logistics:
- **Pickup Service**: Staff collects dirty garments from customer locations
- **Delivery Service**: Staff delivers clean garments to customer locations

### Key Features

1. **Flexible Collection & Return Methods**
   - Independent selection for collection and return
   - Four possible combinations per order

2. **Address Management**
   - Save multiple addresses per customer
   - Track address source (manual, WhatsApp, Google autocomplete)
   - Smart address selection in POS

3. **WhatsApp Integration**
   - Customers send location via WhatsApp
   - Automatic Google Maps pin extraction
   - Reverse geocoding for human-readable addresses
   - One-click location request from POS

4. **Driver Management**
   - Dedicated pickups page
   - Enhanced deliveries page
   - Driver assignment
   - Status tracking

---

## 2. Business Requirements

### User Stories

#### As a Staff Member:
- I need to select whether garments are being dropped off or need pickup
- I need to select whether customer will collect or needs delivery
- I need to choose from customer's saved addresses
- I need to schedule pickup/delivery times
- I need to add special instructions
- I need to request location from customer via WhatsApp

#### As a Driver:
- I need to see all orders requiring pickup
- I need to see all orders ready for delivery
- I need to see customer address and instructions
- I need to mark pickups/deliveries as completed

#### As a Customer:
- I can send my location via WhatsApp
- I can share Google Maps pins
- My addresses are saved for future orders
- I receive pickup/delivery confirmations

### Four Order Scenarios

| Scenario | Collection Method | Return Method | Use Case |
|----------|-------------------|---------------|----------|
| **Traditional** | Customer drops off | Customer collects | Standard walk-in customer |
| **Delivery Only** | Customer drops off | Deliver to customer | Customer busy at pickup time |
| **Pickup Only** | Pick up from customer | Customer collects | Customer busy now, free later |
| **Full Service** | Pick up from customer | Deliver to customer | Premium door-to-door service |

---

## 3. Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        POS System                            │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Collection      │  │ Return          │                  │
│  │ Method Selector │  │ Method Selector │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
│           │                     │                            │
│           └──────────┬──────────┘                            │
│                      │                                       │
│           ┌──────────▼──────────┐                           │
│           │ Address Selector    │                           │
│           │  - Saved Addresses  │                           │
│           │  - WhatsApp Badge   │                           │
│           │  - Request Location │                           │
│           └──────────┬──────────┘                           │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │   Firestore Orders     │
          │  collectionMethod      │
          │  pickupAddress         │
          │  returnMethod          │
          │  deliveryAddress       │
          └────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  Pickups Page   │         │ Deliveries Page │
│  - Assign Driver│         │ - Assign Driver │
│  - Mark Collected│         │ - Mark Delivered│
└─────────────────┘         └─────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  WhatsApp Integration                        │
│                                                              │
│  Customer → WhatsApp → Wati.io → Webhook                   │
│             (Maps Pin)           (Parse)                    │
│                                     │                        │
│                  ┌──────────────────▼──────────────────┐   │
│                  │ Google Geocoding API                 │   │
│                  │ (Coordinates → Address)              │   │
│                  └──────────────────┬──────────────────┘   │
│                                     │                        │
│                  ┌──────────────────▼──────────────────┐   │
│                  │ Save to Customer Profile             │   │
│                  │ addresses: Address[]                 │   │
│                  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **WhatsApp**: Wati.io Business API
- **Maps**: Google Maps API, Google Geocoding API
- **UI**: Tailwind CSS, shadcn/ui components

---

## 4. Schema Design

### Order Interface Updates

```typescript
// lib/db/schema.ts

export interface Order {
  // ===== Existing Fields =====
  orderId: string;
  customerId: string;
  garments: Garment[];
  status: OrderStatus;
  totalAmount: number;
  // ... other existing fields

  // ===== NEW: Garment Collection =====
  collectionMethod: 'dropped_off' | 'pickup_required';

  // Optional: Only present if collectionMethod === 'pickup_required'
  pickupAddress?: Address;
  pickupInstructions?: string;
  pickupScheduledTime?: Timestamp;
  pickupCompletedTime?: Timestamp;
  pickupAssignedTo?: string; // Employee ID of driver

  // ===== NEW: Garment Return =====
  returnMethod: 'customer_collects' | 'delivery_required';

  // Optional: Only present if returnMethod === 'delivery_required'
  deliveryAddress?: Address;
  deliveryInstructions?: string;
  deliveryScheduledTime?: Timestamp;
  deliveryCompletedTime?: Timestamp;
  deliveryAssignedTo?: string; // Employee ID of driver
}
```

### Address Interface

```typescript
export interface Address {
  label: string; // e.g., "Home", "Office", "Shared via WhatsApp"
  address: string; // Full formatted address
  coordinates?: {
    lat: number;
    lng: number;
  };
  source?: 'manual' | 'whatsapp' | 'google_autocomplete';
  receivedAt?: Timestamp; // When address was added
}
```

### Customer Interface Updates

```typescript
export interface Customer {
  customerId: string;
  name: string;
  phoneNumber: string;
  email?: string;

  // ===== NEW: Multiple Addresses =====
  addresses?: Address[];

  // ... other existing fields
}
```

### Firestore Collection Structure

```
customers/
  └── {customerId}/
        ├── name: string
        ├── phoneNumber: string
        ├── email?: string
        └── addresses: Address[]
              ├── [0]: {
              │     label: "Home"
              │     address: "123 Main St, Nairobi"
              │     coordinates: { lat: -1.2921, lng: 36.8219 }
              │     source: "manual"
              │   }
              └── [1]: {
                    label: "Shared via WhatsApp"
                    address: "456 Office Plaza, Kilimani"
                    coordinates: { lat: -1.2850, lng: 36.7910 }
                    source: "whatsapp"
                    receivedAt: Timestamp
                  }

orders/
  └── {orderId}/
        ├── collectionMethod: "pickup_required"
        ├── pickupAddress: Address
        ├── pickupInstructions: "Ring doorbell twice"
        ├── pickupScheduledTime: Timestamp
        ├── pickupCompletedTime: Timestamp | null
        ├── pickupAssignedTo: "EMP-12345"
        ├── returnMethod: "delivery_required"
        ├── deliveryAddress: Address
        ├── deliveryScheduledTime: Timestamp
        └── ... other order fields
```

---

## 5. UI/UX Design

### POS Order Creation Flow

#### Step 1: Customer & Garments Selection
*(Existing functionality - no changes)*

#### Step 2: Collection Method (NEW)

```
┌─────────────────────────────────────────────────────────┐
│ How will garments be collected?                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ○ Customer Dropped Off (at our location)               │
│  ● Pick Up from Customer                                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📍 Select Pickup Address                           │ │
│  │                                                     │ │
│  │ ▼ Home - 123 Main St, Kilimani              [📍]  │ │
│  │   (Manually entered)                               │ │
│  │                                                     │ │
│  │   Office - 456 Plaza, Westlands            [📍]   │ │
│  │   (Shared via WhatsApp)                            │ │
│  │                                                     │ │
│  │   + Add New Address                                │ │
│  │                                                     │ │
│  │ [Request Location via WhatsApp 💬]                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Pickup Instructions (optional)                     │ │
│  │ ┌───────────────────────────────────────────────┐ │ │
│  │ │ Ring doorbell twice. Gate code: 1234         │ │ │
│  │ └───────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  📅 Scheduled Pickup Time: Oct 25, 2025 at 2:00 PM     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Step 3: Return Method (NEW)

```
┌─────────────────────────────────────────────────────────┐
│ How will clean garments be returned?                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ● Customer Will Collect (at our location)              │
│  ○ Deliver to Customer                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

If "Deliver to Customer" is selected, show same address selection UI as pickup.

#### Step 4: Create Order & Process Payment
*(Existing functionality)*

### Pickups Page Design

```
┌──────────────────────────────────────────────────────────────────┐
│ 📦 Pickups                                     [Refresh] [Filter]│
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Pending Pickup (5)] [Scheduled Today (3)] [Completed (12)]    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Order ID    Customer        Address            Scheduled   │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ ORD-001    John Doe         123 Main St       2:00 PM     │ │
│  │            📞 +254712345678  Kilimani          Today       │ │
│  │            Instructions: Ring twice                        │ │
│  │            Assigned to: [Select Driver ▼]  [Mark Collected]│ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ ORD-002    Jane Smith       456 Office Plaza  3:30 PM     │ │
│  │            📞 +254798765432  (📍 via WhatsApp) Today       │ │
│  │            Assigned to: Driver Mike        [Mark Collected]│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Deliveries Page Design

Similar to Pickups Page, but showing orders ready for delivery.

```
┌──────────────────────────────────────────────────────────────────┐
│ 🚚 Deliveries                                  [Refresh] [Filter]│
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Ready (8)] [Out for Delivery (4)] [Delivered Today (15)]      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Order ID    Customer        Address         Ready Since    │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ ORD-003    Alice Brown      789 Home Ave    Oct 24, 5PM   │ │
│  │            📞 +254712345679  Westlands                     │ │
│  │            Deliver by: Oct 25, 6PM                         │ │
│  │            Assigned to: [Select Driver ▼]  [Mark Delivered]│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
POS Page
├── CustomerSelector (existing)
├── GarmentSelector (existing)
├── CollectionMethodSelector (NEW)
│   ├── RadioGroup (Drop-off / Pickup)
│   └── Conditional Rendering:
│       ├── AddressSelector
│       ├── Textarea (instructions)
│       └── DateTimePicker
├── ReturnMethodSelector (NEW)
│   ├── RadioGroup (Customer Collects / Delivery)
│   └── Conditional Rendering:
│       ├── AddressSelector
│       ├── Textarea (instructions)
│       └── DateTimePicker
└── CreateOrderButton (existing)

AddressSelector Component
├── RequestLocationButton (WhatsApp)
├── Select (dropdown)
│   ├── Saved Addresses (with badges)
│   └── Add New Address option
└── AddressForm (conditional)
    ├── Input (label)
    ├── Input (address)
    └── Checkbox (save to profile)

Pickups Page
├── TabFilters (Pending / Scheduled / Completed)
├── PickupTable
│   ├── OrderRow[]
│   │   ├── OrderInfo
│   │   ├── CustomerInfo
│   │   ├── AddressInfo
│   │   ├── DriverAssignment
│   │   └── MarkCollectedButton
│   └── EmptyState

Deliveries Page
├── TabFilters (Ready / Out for Delivery / Delivered)
├── DeliveryTable
│   ├── OrderRow[]
│   │   ├── OrderInfo
│   │   ├── CustomerInfo
│   │   ├── AddressInfo
│   │   ├── DriverAssignment
│   │   └── MarkDeliveredButton
│   └── EmptyState
```

---

## 6. WhatsApp Integration

### Flow Diagram

```
Customer WhatsApp                    System
      │                                │
      │  1. Send Google Maps Pin       │
      │  "https://maps.google.com/?q=  │
      │   -1.2921,36.8219"             │
      ├────────────────────────────────>
      │                                │
      │                       2. Wati.io Webhook
      │                          receives message
      │                                │
      │                       3. Extract coordinates
      │                          from URL pattern
      │                                │
      │                       4. Google Geocoding API
      │                          (-1.2921, 36.8219)
      │                          → "123 Main St, Kilimani"
      │                                │
      │                       5. Find customer by phone
      │                          in Firestore
      │                                │
      │                       6. Save address to
      │                          customer.addresses[]
      │                                │
      │  7. Confirmation Message       │
      │  "We've saved your location:   │
      │   123 Main St, Kilimani"       │
      <────────────────────────────────┤
      │                                │
```

### Supported Google Maps URL Formats

1. **Direct Coordinates**
   ```
   https://maps.google.com/?q=-1.2921,36.8219
   https://www.google.com/maps?q=-1.2921,36.8219
   ```

2. **Shortened URLs**
   ```
   https://goo.gl/maps/abc123xyz
   https://maps.app.goo.gl/abc123xyz
   ```

3. **Place IDs** (future enhancement)
   ```
   https://maps.google.com/maps?cid=1234567890
   ```

### Wati.io Webhook Payload

```json
{
  "event": "message:received",
  "waId": "254712345678",
  "name": "John Doe",
  "type": "text",
  "text": "Here's my location: https://maps.google.com/?q=-1.2921,36.8219",
  "timestamp": 1698345600000
}
```

### Location Extraction Logic

```typescript
// lib/whatsapp/location-extractor.ts

// Step 1: Pattern Matching
const patterns = [
  /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,  // Direct coordinates
  /goo\.gl\/maps\/([a-zA-Z0-9]+)/,   // Shortened URL
  /maps\.app\.goo\.gl\/([a-zA-Z0-9]+)/ // New format
];

// Step 2: Extract Coordinates
if (directMatch) {
  lat = parseFloat(match[1]);
  lng = parseFloat(match[2]);
}

// Step 3: Follow Redirects (for shortened URLs)
if (shortUrlMatch) {
  fullUrl = await followRedirect(shortUrl);
  // Recursively extract from full URL
}

// Step 4: Reverse Geocoding
const response = await googleMapsClient.reverseGeocode({
  latlng: { lat, lng },
  key: process.env.GOOGLE_GEOCODING_API_KEY
});

// Step 5: Format Address
return {
  lat,
  lng,
  formattedAddress: response.results[0].formatted_address
};
```

### Address Source Tracking

Each address has a `source` field to track origin:

- **`manual`**: Entered by staff in POS
- **`whatsapp`**: Received via WhatsApp location sharing
- **`google_autocomplete`**: Selected from Google Places autocomplete

This allows:
- Visual badges in UI
- Analytics on address collection methods
- Trust indicators (WhatsApp addresses are customer-verified)

---

## 7. Implementation Phases

### Phase 1: Basic Pickup & Delivery (8-10 hours)

**Goal**: Enable staff to select pickup/delivery and manage addresses

#### Tasks:

1. **Schema Updates** (1 hour)
   - Update `Order` interface
   - Update `Customer` interface
   - Create `Address` interface

2. **UI Components** (3-4 hours)
   - `CollectionMethodSelector` component
   - `ReturnMethodSelector` component
   - `AddressSelector` component
   - Address form for new addresses

3. **POS Integration** (2 hours)
   - Add selectors to order creation flow
   - State management
   - Validation logic
   - Update `createOrder()` call

4. **Pickups Page** (2-3 hours)
   - Create pickups page
   - `PickupTable` component
   - Filter tabs
   - Driver assignment
   - Mark as collected functionality

5. **Deliveries Page Updates** (1 hour)
   - Update query to filter by `returnMethod`
   - Update table columns
   - Mark as delivered functionality

**Deliverables:**
- ✅ Staff can select collection/return methods
- ✅ Addresses can be manually added and selected
- ✅ Pickups page shows pickup orders
- ✅ Deliveries page shows delivery orders
- ✅ Drivers can be assigned
- ✅ Orders can be marked as collected/delivered

---

### Phase 2: WhatsApp Integration (8-10 hours)

**Goal**: Enable automatic address extraction from WhatsApp location pins

#### Tasks:

1. **Wati.io Setup** (1-2 hours)
   - Create Wati.io account
   - Connect WhatsApp Business number
   - Configure webhook
   - Add environment variables

2. **Google Geocoding Setup** (30 minutes)
   - Enable Geocoding API
   - Get API key
   - Add to environment variables

3. **Webhook Handler** (2-3 hours)
   - Create webhook route
   - Signature verification
   - Message parsing
   - Customer lookup by phone
   - Address saving logic
   - Confirmation message sending

4. **Location Extraction** (2-3 hours)
   - Pattern matching for URL formats
   - Coordinate extraction
   - URL redirect following
   - Reverse geocoding integration
   - Error handling

5. **POS Integration** (2 hours)
   - "Request Location" button
   - WhatsApp message template
   - Address badges in selector
   - Source indicators

6. **Customer Management** (1 hour)
   - `getCustomerByPhone()` function
   - Address array management
   - Duplicate detection
   - Address editing/deletion

**Deliverables:**
- ✅ Customers can send Google Maps pins via WhatsApp
- ✅ System extracts coordinates and converts to addresses
- ✅ Addresses auto-save to customer profiles
- ✅ WhatsApp addresses display with badges in POS
- ✅ Staff can request location via WhatsApp button

---

### Phase 3: Testing & QA (4-5 hours)

**Goal**: Comprehensive testing of all functionality

#### Test Categories:

1. **Functional Testing** (2 hours)
   - All four order scenarios
   - Address selection
   - Driver assignment
   - Status updates
   - Firestore validation

2. **WhatsApp Integration Testing** (1-2 hours)
   - Location pin extraction (3 formats)
   - Reverse geocoding accuracy
   - Webhook processing
   - Confirmation messages
   - Error cases

3. **UI/UX Testing** (1 hour)
   - Component rendering
   - Conditional displays
   - Loading states
   - Error messages
   - Mobile responsiveness

4. **Performance Testing** (30 minutes)
   - Location extraction speed
   - Page load times with 100+ orders
   - Address dropdown with 50+ addresses

**Deliverables:**
- ✅ All test cases pass
- ✅ Bug fixes applied
- ✅ Performance benchmarks met
- ✅ Documentation updated

---

## 8. Testing Strategy

### Unit Tests

```typescript
// lib/whatsapp/location-extractor.test.ts

describe('extractGoogleMapsLocation', () => {
  it('should extract coordinates from direct URL', async () => {
    const url = 'https://maps.google.com/?q=-1.2921,36.8219';
    const result = await extractGoogleMapsLocation(url);

    expect(result).toEqual({
      lat: -1.2921,
      lng: 36.8219,
      formattedAddress: expect.any(String)
    });
  });

  it('should handle shortened URLs', async () => {
    const url = 'https://goo.gl/maps/abc123';
    const result = await extractGoogleMapsLocation(url);

    expect(result).not.toBeNull();
    expect(result?.lat).toBeDefined();
  });

  it('should return null for invalid URLs', async () => {
    const url = 'https://example.com';
    const result = await extractGoogleMapsLocation(url);

    expect(result).toBeNull();
  });
});
```

### Integration Tests

```typescript
// __tests__/api/webhooks/whatsapp.test.ts

describe('POST /api/webhooks/whatsapp', () => {
  it('should save address when customer sends location', async () => {
    const payload = {
      waId: '254712345678',
      text: 'My location: https://maps.google.com/?q=-1.2921,36.8219'
    };

    const response = await fetch('/api/webhooks/whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    expect(response.status).toBe(200);

    // Verify address saved to Firestore
    const customer = await getCustomerByPhone('254712345678');
    expect(customer.addresses).toHaveLength(1);
    expect(customer.addresses[0].source).toBe('whatsapp');
  });
});
```

### E2E Tests (Manual)

**Test Case 1: Create Pickup + Delivery Order**
1. Go to POS
2. Select customer
3. Add garments
4. Select "Pick Up from Customer"
5. Choose saved address
6. Enter instructions
7. Select "Deliver to Customer"
8. Choose same or different address
9. Click "Create Order"
10. Verify order created successfully
11. Verify order appears on Pickups page
12. Verify order appears on Deliveries page (once ready)

**Test Case 2: WhatsApp Location Sharing**
1. Send WhatsApp message with Google Maps pin from real phone
2. Wait 2-3 seconds
3. Check Firestore customer document
4. Verify address added to `addresses` array
5. Verify `source` = "whatsapp"
6. Verify coordinates saved
7. Go to POS
8. Select that customer
9. Choose "Pick Up from Customer"
10. Verify WhatsApp address appears with badge

**Test Case 3: Request Location**
1. Go to POS
2. Select customer with phone number
3. Choose "Pick Up from Customer"
4. Click "Request Location via WhatsApp"
5. Verify toast notification
6. Check WhatsApp on customer's phone
7. Verify message received with instructions

---

## 9. Deployment Plan

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured:
  - `WATI_API_KEY`
  - `WATI_WEBHOOK_SECRET`
  - `WATI_PHONE_NUMBER`
  - `GOOGLE_GEOCODING_API_KEY`
- [ ] Wati.io webhook URL configured
- [ ] Google Geocoding API enabled and billed
- [ ] Database indexes created:
  - `orders.collectionMethod`
  - `orders.returnMethod`
  - `customers.phoneNumber`
- [ ] Documentation complete
- [ ] Training materials prepared

### Deployment Steps

1. **Deploy Code** (Vercel)
   ```bash
   git add .
   git commit -m "feat: Add pickup & delivery system with WhatsApp integration"
   git push origin main
   ```

2. **Configure Wati.io Webhook**
   - Update webhook URL to production domain
   - Test webhook with sample payload

3. **Database Migration**
   - No migration needed (new fields are optional)
   - Existing orders will continue to work

4. **Smoke Tests**
   - Create test order with all combinations
   - Send test WhatsApp location
   - Verify webhook processing

5. **Monitoring**
   - Watch webhook logs for errors
   - Monitor Geocoding API usage
   - Check Firestore write patterns

### Rollback Plan

If critical issues arise:

1. **Immediate**: Comment out `CollectionMethodSelector` and `ReturnMethodSelector` in POS
2. **Database**: No rollback needed (fields are optional)
3. **Webhook**: Disable in Wati.io dashboard
4. **Code**: Revert to previous commit

---

## 10. Success Metrics

### Business Metrics

- **Adoption Rate**: % of orders using pickup/delivery (target: 30% within 3 months)
- **WhatsApp Usage**: % of addresses from WhatsApp (target: 50%)
- **Customer Satisfaction**: NPS score for pickup/delivery service (target: >8)
- **Efficiency**: Average time from order to pickup (target: <2 hours)

### Technical Metrics

- **Location Extraction Accuracy**: >95%
- **Webhook Processing Time**: <3 seconds
- **Page Load Time**: <1 second for pickups/deliveries pages
- **Error Rate**: <1% for address extraction

### KPIs

- Number of pickup orders per day
- Number of delivery orders per day
- WhatsApp location pins received per day
- Average addresses per customer
- Driver utilization rate

---

## 11. Future Enhancements

### Phase 4: Route Optimization (Not in this plan)
- Batch multiple pickups/deliveries
- Optimize driver routes using Google Directions API
- Minimize travel time and distance

### Phase 5: Real-time Tracking
- Driver location tracking
- Customer notifications: "Driver is 5 minutes away"
- Live map view

### Phase 6: Advanced WhatsApp Features
- Two-way conversations
- Pickup confirmation via WhatsApp
- Delivery confirmation with photo
- Rating collection

### Phase 7: Mobile App for Drivers
- Dedicated driver mobile app
- Offline support
- Barcode scanning
- Photo proof of delivery

---

## 12. Appendix

### Environment Variables Reference

```bash
# .env.local

# Wati.io WhatsApp Business API
WATI_API_KEY=your_wati_api_key_here
WATI_WEBHOOK_SECRET=your_webhook_secret_here
WATI_PHONE_NUMBER=254XXXXXXXXX

# Google Geocoding API
GOOGLE_GEOCODING_API_KEY=your_google_api_key_here

# Optional: Google Places API (for autocomplete)
GOOGLE_PLACES_API_KEY=your_google_api_key_here
```

### Firestore Security Rules

```javascript
// firestore.rules

// Allow customers to read their own addresses
match /customers/{customerId} {
  allow read: if request.auth != null &&
    (request.auth.uid == customerId ||
     hasRole(request.auth.uid, 'staff'));

  allow write: if hasRole(request.auth.uid, 'staff');
}

// Allow staff to read/write orders
match /orders/{orderId} {
  allow read, write: if hasRole(request.auth.uid, 'staff');
}
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/whatsapp` | POST | Receive WhatsApp messages from Wati.io |
| `/api/locations/geocode` | POST | Reverse geocode coordinates (optional wrapper) |
| `/api/customers/{id}/addresses` | GET | Get customer addresses |
| `/api/customers/{id}/addresses` | POST | Add new address |
| `/api/customers/{id}/addresses/{index}` | DELETE | Delete address |

### Key Files Reference

| File Path | Purpose |
|-----------|---------|
| `lib/db/schema.ts` | Type definitions for Order, Customer, Address |
| `lib/db/orders.ts` | Order CRUD operations |
| `lib/db/customers.ts` | Customer CRUD operations |
| `components/features/orders/CollectionMethodSelector.tsx` | Collection method UI |
| `components/features/orders/ReturnMethodSelector.tsx` | Return method UI |
| `components/features/orders/AddressSelector.tsx` | Address selection UI |
| `components/features/pickups/PickupTable.tsx` | Pickups table component |
| `app/(dashboard)/pickups/page.tsx` | Pickups page |
| `app/(dashboard)/deliveries/page.tsx` | Deliveries page (updated) |
| `app/api/webhooks/whatsapp/route.ts` | WhatsApp webhook handler |
| `lib/whatsapp/location-extractor.ts` | Google Maps URL parsing |
| `lib/whatsapp/verify.ts` | Webhook signature verification |
| `lib/whatsapp/send-message.ts` | Send WhatsApp messages |

---

## ✅ Implementation Ready

This plan is complete and ready for implementation. All requirements, technical specifications, and acceptance criteria are defined.

**Next Steps:**
1. Review plan with stakeholders
2. Get approval on timeline and scope
3. Begin Phase 1 implementation
4. Track progress against milestones

**Estimated Total Time:** 20-25 hours
- Phase 1: 8-10 hours
- Phase 2: 8-10 hours
- Phase 3: 4-5 hours

**Questions or Concerns?**
- Contact: Jerry Nduriri (Developer)
- Review: JERRY_TASKS.md for detailed task breakdown
