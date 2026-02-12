# Module 2 -- Driver & Logistics Feature Spec

| Field              | Value                                                                 |
|--------------------|-----------------------------------------------------------------------|
| **Module**         | 2 -- Driver & Logistics                                              |
| **Status**         | PARTIALLY BUILT -- delivery CRUD, route optimizer, driver tracking exist; needs enhancement |
| **Priority**       | P1                                                                    |
| **Owner**          | Jerry Ndururi / AI Agents Plus                                        |
| **Last Updated**   | 2026-02-12                                                            |
| **Depends On**     | Module 1 (Order Enhancement), Module 5 (Reporting)                    |
| **Blocks**         | Module 3 (Inventory) for inter-branch logistics, Module 6 (Vouchers) for delivery-based promos |

---

## 1. Executive Summary

Module 2 enhances Lorenzo Dry Cleaners' existing delivery and driver management infrastructure into a comprehensive logistics platform. The current system provides delivery batch creation, TSP-based route optimization (Nearest Neighbor + 2-opt), real-time driver location tracking via Firestore, Google Maps integration (Directions, Distance Matrix, Geocoding, Places), and delivery classification (Small/Motorcycle vs Bulk/Van). However, several gaps exist: driver performance scoring is hardcoded with `Math.random()`, ETA is computed once at dispatch without recalculation, failed deliveries have no rescheduling workflow, time-window optimization is unsupported, proof of delivery is text-only (no photo), satellite store transfers lack end-to-end tracking, and the customer portal driver map has no geofence-triggered notifications.

This spec defines 76 functional requirements across driver assignment, route optimization enhancement, real-time tracking, failed delivery workflows, satellite transfer logistics, driver payouts, geofencing, and reporting. It extends 6 existing Firestore collections, adds 3 new collections, introduces 9 new API endpoints, builds 4 new UI pages, and enhances 8 existing components. The goal: reduce average delivery time by 20%, achieve 95%+ on-time delivery rate, and cut failed delivery rescheduling from manual to automated within 24 hours.

---

## 2. Existing Foundation

This section documents what is already built, referencing actual file paths, function names, interfaces, and component names from the codebase.

### 2.1 Database Layer (`lib/db/deliveries.ts`)

**File:** `c:\POS\lib\db\deliveries.ts`

The delivery CRUD module provides the following exports:

| Function | Purpose | Line |
|----------|---------|------|
| `generateDeliveryId()` | Generates ID in format `DEL[YYYYMMDD][####]` | 31 |
| `createDelivery(delivery: Delivery)` | Creates a single delivery document in `deliveries` collection | 49 |
| `getDelivery(deliveryId: string)` | Fetches a single delivery by ID | 61 |
| `getDeliveriesByDriver(driverId, status?)` | Fetches all deliveries for a driver with optional status filter, ordered by `startTime desc` | 79 |
| `getActiveDeliveries()` | Returns pending + in_progress deliveries | 109 |
| `getAllDeliveries(status?)` | Lists all deliveries with optional status filter | 141 |
| `getDeliveriesByBranch(branchId, status?)` | Branch-scoped delivery listing | 165 |
| `updateDeliveryStatus(deliveryId, status, startTime?, endTime?)` | Updates delivery status with optional timestamps | 194 |
| `updateDeliveryRoute(deliveryId, route)` | Replaces the delivery route object | 224 |
| `updateDeliveryStop(deliveryId, orderId, stopStatus, timestamp)` | Updates individual stop status; **auto-completes delivery when all stops are `completed` or `failed`** (line 270) | 241 |
| `deleteDelivery(deliveryId)` | Hard-deletes a delivery document | 285 |
| `batchCreateDeliveries(deliveries[])` | Uses Firestore `writeBatch` for atomic multi-delivery creation | 296 |
| `getDeliveriesCountForBranches(branchIds, status?)` | Count query with branch-array handling (uses `in` for <=10, loops for >10) | 314 |
| `getPendingDeliveriesCountForBranches(branchIds)` | Shorthand for pending count | 378 |
| `getTodayDeliveriesCountForBranches(branchIds)` | Filters by `startTime >= today midnight` | 390 |
| `getDriverDeliveryStats(driverId, startDate?, endDate?)` | Computes `DeliveryStats` aggregate | 467 |

**`DeliveryStats` interface** (line 457):
```typescript
export interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  totalOrders: number;
  completedOrders: number;
  totalDistance: number;    // meters
  totalDuration: number;   // seconds
  averageOrdersPerDelivery: number;
}
```

**Known gaps:**
- `deleteDelivery()` is a hard delete with no soft-delete/archive pattern
- No `failedDeliveries` counter in `DeliveryStats`
- No on-time/late delivery tracking
- No rescheduling function for failed stops

### 2.2 Driver Location Tracking (`lib/db/driver-locations.ts`)

**File:** `c:\POS\lib\db\driver-locations.ts`

Collection: `driverLocations` -- document ID matches `deliveryId`.

| Function | Purpose | Line |
|----------|---------|------|
| `getDriverLocation(deliveryId)` | One-time fetch of driver location | 28 |
| `updateDriverLocation(deliveryId, location, heading?, speed?)` | Upserts location data with `Timestamp.now()` | 50 |
| `initializeDriverLocation(deliveryId, driverId, initialLocation)` | Creates the location tracking document when a delivery starts | 88 |
| `deactivateDriverLocation(deliveryId)` | Sets `isActive: false` when delivery completes | 113 |
| `subscribeToDriverLocation(deliveryId, callback)` | Real-time `onSnapshot` listener returning `Unsubscribe` | 131 |
| `isLocationStale(location)` | Returns `true` if no update for >5 minutes (line 169) | 160 |

**`DriverLocation` interface** (schema.ts line 1586):
```typescript
export interface DriverLocation {
  deliveryId: string;
  driverId: string;
  location: { lat: number; lng: number };
  heading?: number;     // 0-360 degrees
  speed?: number;       // meters per second
  lastUpdated: Timestamp;
  isActive: boolean;
}
```

**Known gaps:**
- No location history (only stores current position)
- No geofence proximity calculation
- No ETA recalculation on location update
- Stale threshold is hardcoded at 5 minutes (not configurable)

### 2.3 Route Optimization (`lib/maps/route-optimizer.ts`)

**File:** `c:\POS\lib\maps\route-optimizer.ts`

| Function | Purpose | Line |
|----------|---------|------|
| `optimizeRoute(stops, depot?, useGoogleAPI?)` | Main entry point: builds distance matrix, runs Nearest Neighbor + 2-opt, returns `OptimizedRoute` | 196 |
| `getOptimizedRouteWithDirections(optimizedStops, depot?)` | Gets Google Directions for an already-optimized route | 284 |
| `compareRoutes(originalStops, optimizedResult)` | Returns before/after metrics for route comparison | 309 |

**Internal algorithms:**
- `calculateDistanceMatrix(stops, useGoogleAPI)` -- Haversine by default, Google API optional (line 42)
- `calculateHaversineMatrix(stops)` -- O(n^2) offline computation (line 79)
- `nearestNeighbor(distanceMatrix, startIndex)` -- Greedy TSP heuristic (line 120)
- `twoOptImprovement(route, distanceMatrix)` -- Iterative segment-reversal improvement (line 157)

**`OptimizedRoute` interface:**
```typescript
export interface OptimizedRoute {
  stops: DeliveryStop[];       // Reordered with sequence numbers
  totalDistance: number;        // meters
  totalDuration: number;        // seconds (estimated at 30 km/h city speed)
  route?: DirectionsRoute;      // Optional Google Directions
  improvement: {
    distanceSaved: number;      // meters saved vs original order
    percentageImproved: number; // percentage improvement
  };
}
```

**Known gaps:**
- No time-window constraints (all stops treated as any-time)
- Average speed hardcoded at 30 km/h (line 263), no traffic awareness
- No re-optimization when a stop fails or is skipped
- Max waypoints not enforced (Google API limits to 25)
- No clustering for multi-driver optimization

### 2.4 Google Maps Integration (`lib/maps/`)

**Files and exports:**

| File | Key Exports | Purpose |
|------|-------------|---------|
| `c:\POS\lib\maps\geocoding.ts` | `geocodeAddress()`, `reverseGeocode()`, `getAddressSuggestions()`, `getPlaceDetails()`, `Coordinates`, `GeocodeResult` | Address-to-coordinate conversion, autocomplete |
| `c:\POS\lib\maps\distance.ts` | `calculateDistance()`, `calculateDistances()`, `haversineDistance()`, `formatDistance()`, `formatDuration()`, `DistanceResult` | Distance/duration computation |
| `c:\POS\lib\maps\directions.ts` | `getDirections()`, `getRouteAlternatives()`, `decodePolyline()`, `getEstimatedArrival()`, `DirectionsRoute`, `DirectionsStep`, `DirectionsOptions` | Turn-by-turn navigation and polyline rendering |
| `c:\POS\lib\maps\index.ts` | Barrel re-exports | Consolidated import path |
| `c:\POS\lib\maps\route-optimizer.ts` | (see section 2.3) | TSP optimization |

### 2.5 Delivery Classification (`lib/delivery/classification.ts`)

**File:** `c:\POS\lib\delivery\classification.ts`

| Function/Constant | Purpose | Line |
|--------------------|---------|------|
| `CLASSIFICATION_THRESHOLDS` | Small: maxGarments=5, maxWeight=10kg, maxValue=KES 5000; Bulk: inverse | 17 |
| `classifyDelivery(order: Order)` | Returns `ClassificationResult` with classification, basis, details, reason | 125 |
| `classifyMultipleDeliveries(orders[])` | Batch classification returning `Map<orderId, ClassificationResult>` | 181 |
| `estimateGarmentWeight(garments[])` | Weight estimation per garment type (20+ type mappings) | 70 |
| `getVehicleRecommendation(classification)` | Returns `{ vehicleType, description, maxCapacity }` | 196 |
| `canOverrideClassification(userRole)` | Checks against allowed roles: admin, director, general_manager, store_manager, logistics_manager | 219 |
| `createOverrideRecord(...)` | Builds audit-ready override record | 234 |
| `getClassificationColor(classification)` | UI badge colors (green for Small, amber for Bulk) | 264 |
| `getClassificationIcon(classification)` | `'Bike'` or `'Truck'` | 287 |
| `validateOverrideRequest(current, new, reason)` | Validates override: different classification + reason >= 10 chars | 294 |

**`ClassificationResult` interface:**
```typescript
export interface ClassificationResult {
  classification: DeliveryClassification; // 'Small' | 'Bulk'
  basis: 'garment_count' | 'weight' | 'value' | 'manual';
  details: { garmentCount: number; estimatedWeight?: number; orderValue: number };
  reason: string;
}
```

### 2.6 Schema Definitions (`lib/db/schema.ts`)

**File:** `c:\POS\lib\db\schema.ts`

Key types and interfaces for this module:

| Type/Interface | Line | Description |
|----------------|------|-------------|
| `StopStatus` | 728 | `'pending' \| 'completed' \| 'failed'` |
| `DeliveryStop` | 733 | Stop with orderId, address, coordinates, sequence, status, timestamp |
| `DeliveryRoute` | 754 | Route with optimized flag, stops[], distance (meters), estimatedDuration (seconds) |
| `DeliveryStatus` | 768 | `'pending' \| 'in_progress' \| 'completed' \| 'failed'` |
| `Delivery` | 774 | Core delivery document with deliveryId, driverId, branchId, orders[], route, status, startTime?, endTime?, deliveryType? |
| `DeliveryClassification` | 436 | `'Small' \| 'Bulk'` |
| `DriverLocation` | 1586 | Real-time location tracking (see section 2.2) |
| `DeliveryNoteType` | 3323 | `'tailor_transfer' \| 'inter_store_transfer'` |
| `DeliveryNoteStatus` | 3328 | `'sent' \| 'in_transit' \| 'received' \| 'returned'` |
| `DeliveryNote` | 3336 | Transfer note with noteId, noteNumber, noteType, fromLocation, toLocation, orderIds[], status, etc. |
| `DeliveryFeeType` | 2770 | `'free' \| 'fixed' \| 'per_km' \| 'percentage'` |
| `DeliveryFeeRule` | 2775 | Dynamic fee rules with conditions (minOrderAmount, customerSegments, maxDistanceKm, daysOfWeek, time ranges) |
| `DriverPayout` | 2710 | Payout record with amount, deliveryIds[], commissionRate, bonusAmount, deductions, mpesaRef, bankRef |
| `NotificationType` | 863 | Includes `'driver_dispatched'`, `'driver_nearby'`, `'delivered'` |
| `AuditLog` | ~1540 | Audit log with action, resourceType, resourceId, changes (before/after), etc. |

### 2.7 WhatsApp Notifications (`services/wati.ts`)

**File:** `c:\POS\services\wati.ts`

| Function | Purpose |
|----------|---------|
| `sendWhatsAppMessage(phone, templateName, params)` | Core message sender with Wati.io API |
| `sendDriverDispatched(phone, params)` | Template: `driver_dispatched` |
| `sendDriverNearby(phone, params)` | Template: `driver_nearby` |
| `sendDelivered(phone, params)` | Template: `order_delivered` |
| `formatPhoneNumber(phone)` | Converts Kenyan phone formats to `254...` |
| `isValidKenyanPhoneNumber(phone)` | Validates phone number format |
| `sendSMSFallback(phone, message)` | Placeholder for SMS fallback when WhatsApp fails |

- **Retry logic:** 3 attempts with exponential backoff (initial delay 1s)
- **Rate limit:** Wati.io supports 100 messages/second
- **Notification logging:** All attempts logged to Firestore `notifications` collection

### 2.8 Audit Logging (`lib/db/audit-logs.ts`)

**File:** `c:\POS\lib\db\audit-logs.ts`

| Function | Purpose |
|----------|---------|
| `createAuditLog(action, resourceType, resourceId, performedBy, ...)` | Core audit log creation |
| `logOrderCreated(...)` | Order creation audit |
| `logOrderUpdated(...)` | Order update audit |
| `logInventoryTransfer(...)` | Inventory transfer audit |
| `logCrossBranchAction(...)` | Cross-branch action audit |
| `getAuditLogsByResource(resourceType, resourceId)` | Query logs by resource |
| `getAuditLogsByBranch(branchId)` | Query logs by branch |

Audit log ID format: `AUDIT-[YYYYMMDD]-[TIMESTAMP]-[RANDOM]`

### 2.9 Existing UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `DeliveryTable` | `c:\POS\components\features\deliveries\DeliveryTable.tsx` | Tabular view of deliveries with driver assignment, completion confirmation, classification badges |
| `DeliveryBatchForm` | `c:\POS\components\features\deliveries\DeliveryBatchForm.tsx` | Batch creation form: driver selection, scheduling, geocoding, route optimization, map preview |
| `RouteOptimizer` | `c:\POS\components\features\deliveries\RouteOptimizer.tsx` | Route optimization UI calling `/api/maps/optimize-route`; displays metrics, stop ordering; warns when >25 stops |
| `DeliveryMapView` | `c:\POS\components\features\deliveries\DeliveryMapView.tsx` | Google Maps interactive map with markers, polyline, navigation using `@react-google-maps/api` |
| `ActiveBatchesList` | `c:\POS\components\features\deliveries\ActiveBatchesList.tsx` | Cards showing pending/in_progress batches with driver info |
| `LiveDriverMap` | `c:\POS\components\features\customer\LiveDriverMap.tsx` | Customer-facing real-time driver tracking; polls `/api/deliveries/[deliveryId]/location` every 5 seconds; shows ETA and stale warning |
| `DriverTransferBatchList` | `c:\POS\components\features\drivers\DriverTransferBatchList.tsx` | Transfer batches for driver view with active/pending/completed tabs |
| `DeliveriesBreakdownContent` | `c:\POS\components\features\director\breakdowns\DeliveriesBreakdownContent.tsx` | Director drill-down for delivery metrics by branch |

### 2.10 Existing Pages

| Page | File | Purpose |
|------|------|---------|
| Delivery Management | `c:\POS\app\(dashboard)\deliveries\page.tsx` | Stats (ready orders, pending batches, today's deliveries), order selection, batch creation, active batches tabs |
| Logistics Dashboard | `c:\POS\app\(dashboard)\logistics\page.tsx` | KPIs, driver status, classification stats, recent deliveries, pending pickups. **Note:** On-time rate is hardcoded placeholder `Math.random()` at line 208 |
| Driver Dashboard | `c:\POS\app\(dashboard)\drivers\page.tsx` | Today/transfers/pending/in-progress/completed tabs |
| Driver Batch Detail | `c:\POS\app\(dashboard)\drivers\[deliveryId]\page.tsx` | Route map, stop-by-stop delivery, mark delivered/failed, start/complete delivery mutations |

### 2.11 Existing API Routes

| Endpoint | File | Method | Purpose |
|----------|------|--------|---------|
| `/api/deliveries/classify` | `c:\POS\app\api\deliveries\classify\route.ts` | POST/GET | Auto-classify delivery; manager override |
| `/api/deliveries/[deliveryId]/location` | `c:\POS\app\api\deliveries\[deliveryId]\location\route.ts` | GET | Secure driver location with order ownership verification |

### 2.12 Excel Export (`lib/reports/export-excel.ts`)

**File:** `c:\POS\lib\reports\export-excel.ts`

Provides `exportTransactionsToExcel()` and `exportPaymentReport()` using the `xlsx` library. Pattern to replicate for delivery report exports.

---

## 3. Functional Requirements

### 3.1 Driver Assignment & Management (FR-M2-001 through FR-M2-012)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-001 | System shall support manual driver assignment from a dropdown of available drivers when creating a delivery batch via `DeliveryBatchForm` | P0 | BUILT |
| FR-M2-002 | System shall support automatic driver assignment based on driver availability, current workload (active delivery count), and proximity to branch | P1 | NEW |
| FR-M2-003 | System shall maintain a driver availability status (`available`, `on_delivery`, `off_duty`, `on_break`) per driver per branch | P1 | NEW |
| FR-M2-004 | System shall prevent assigning more than one active delivery batch to a driver simultaneously | P0 | NEW |
| FR-M2-005 | System shall allow GM/admin to override the one-active-batch constraint with audit logging via `createAuditLog()` | P1 | NEW |
| FR-M2-006 | System shall display driver delivery statistics (`DeliveryStats`) in the driver selection dropdown during batch creation | P1 | PARTIAL -- stats exist via `getDriverDeliveryStats()` but not shown in UI |
| FR-M2-007 | System shall track driver vehicle type (motorcycle/van) and match to delivery classification (`Small` -> motorcycle, `Bulk` -> van) | P1 | NEW |
| FR-M2-008 | System shall compute a driver performance score using actual delivery data (replacing `Math.random()` at `logistics/page.tsx` line 208) | P0 | NEW |
| FR-M2-009 | Driver performance score formula: `score = (onTimeRate * 40) + (completionRate * 30) + (customerRating * 20) + (efficiencyBonus * 10)` where each factor is 0-100 | P1 | NEW |
| FR-M2-010 | System shall display driver performance dashboard with weekly/monthly trends using Recharts | P1 | NEW |
| FR-M2-011 | System shall allow drivers to set their availability status from the driver mobile interface (`drivers/page.tsx`) | P1 | NEW |
| FR-M2-012 | System shall notify logistics manager when all drivers for a branch are off-duty or on-delivery (via WhatsApp using `sendWhatsAppMessage()`) | P2 | NEW |

### 3.2 Route Optimization Enhancement (FR-M2-013 through FR-M2-024)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-013 | System shall continue using Nearest Neighbor + 2-opt TSP optimization via `optimizeRoute()` as the primary algorithm | P0 | BUILT |
| FR-M2-014 | System shall support time-window constraints per stop (earliest/latest delivery time) in the route optimizer | P1 | NEW |
| FR-M2-015 | System shall enforce Google Maps API limit of 25 waypoints per directions request; for >25 stops, split into sub-routes | P0 | PARTIAL -- `RouteOptimizer.tsx` warns but doesn't enforce |
| FR-M2-016 | System shall support re-optimization when a stop is marked as failed, removing the failed stop and recalculating the remaining route | P1 | NEW |
| FR-M2-017 | System shall cache geocoded addresses in Firestore to reduce Google Maps API calls (addresses are geocoded each time in `DeliveryBatchForm`) | P1 | NEW |
| FR-M2-018 | System shall provide Google Traffic-aware routing by passing `departure_time=now` to the Directions API when `useGoogleAPI=true` | P2 | NEW |
| FR-M2-019 | System shall support multi-driver route optimization: partition stops into clusters, assign each cluster to a driver | P2 | NEW |
| FR-M2-020 | System shall show before/after route comparison using `compareRoutes()` with distance saved and percentage improved | P0 | BUILT |
| FR-M2-021 | System shall recalculate ETA for remaining stops each time a driver updates their location (currently ETA computed once at dispatch) | P1 | NEW |
| FR-M2-022 | System shall estimate delivery duration using actual road-distance speed (currently hardcoded at 30 km/h in `route-optimizer.ts` line 263) | P1 | NEW |
| FR-M2-023 | System shall store the optimization metadata (algorithm used, computation time, improvement percentage) in the delivery document | P2 | NEW |
| FR-M2-024 | System shall provide a "re-optimize" button on the driver batch detail page (`drivers/[deliveryId]/page.tsx`) for remaining undelivered stops | P1 | NEW |

### 3.3 Real-Time Driver Tracking (FR-M2-025 through FR-M2-036)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-025 | System shall track driver location in real-time using Firestore `driverLocations` collection with `onSnapshot` via `subscribeToDriverLocation()` | P0 | BUILT |
| FR-M2-026 | System shall initialize location tracking when driver starts delivery via `initializeDriverLocation()` and deactivate via `deactivateDriverLocation()` on completion | P0 | BUILT |
| FR-M2-027 | System shall store location history (breadcrumb trail) in a subcollection `driverLocations/{deliveryId}/history` for route replay | P1 | NEW |
| FR-M2-028 | System shall detect stale driver location using `isLocationStale()` (>5 minutes) and display warning in customer portal (`LiveDriverMap`) | P0 | BUILT |
| FR-M2-029 | System shall make the stale threshold configurable via system settings (currently hardcoded at 5 minutes in `driver-locations.ts` line 169) | P2 | NEW |
| FR-M2-030 | System shall provide geofence detection: trigger notification when driver enters a 500m radius around the next delivery stop | P1 | NEW |
| FR-M2-031 | System shall automatically send `driver_nearby` WhatsApp notification via `sendDriverNearby()` when geofence triggers | P1 | NEW |
| FR-M2-032 | Customer portal (`LiveDriverMap`) shall display real-time ETA based on current driver location and remaining route distance | P1 | PARTIAL -- ETA shown but not recalculated from live position |
| FR-M2-033 | System shall support driver location updates at minimum 15-second intervals from the driver mobile interface | P1 | NEW |
| FR-M2-034 | System shall batch driver location updates when the device is offline and push when connectivity returns | P2 | NEW |
| FR-M2-035 | System shall display all active drivers on a fleet map for logistics manager view | P1 | NEW |
| FR-M2-036 | System shall secure driver location API endpoint (`/api/deliveries/[deliveryId]/location`) with order ownership verification (currently implemented) | P0 | BUILT |

### 3.4 Delivery Lifecycle Management (FR-M2-037 through FR-M2-048)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-037 | System shall support the delivery status flow: `pending` -> `in_progress` -> `completed` (or `failed`) as defined by `DeliveryStatus` type | P0 | BUILT |
| FR-M2-038 | System shall auto-complete delivery when all stops are `completed` or `failed` via `updateDeliveryStop()` auto-completion logic (line 270) | P0 | BUILT |
| FR-M2-039 | System shall require proof of delivery (photo + recipient signature) before a stop can be marked as `completed` | P1 | NEW |
| FR-M2-040 | Proof of delivery photos shall be uploaded to Firebase Storage under `deliveries/{deliveryId}/proof/{orderId}/` | P1 | NEW |
| FR-M2-041 | System shall require a failure reason when marking a stop as `failed` (options: customer_absent, wrong_address, refused_delivery, access_denied, other) | P0 | NEW |
| FR-M2-042 | System shall automatically create a rescheduled delivery for failed stops within 24 hours | P1 | NEW |
| FR-M2-043 | System shall limit rescheduling attempts to 3 per order; after 3 failures, escalate to logistics manager for manual resolution | P1 | NEW |
| FR-M2-044 | System shall send WhatsApp notification to customer when delivery fails with failure reason and rescheduling information | P1 | NEW |
| FR-M2-045 | System shall track delivery time windows: record `estimatedArrival`, `actualArrival`, and compute `onTime` boolean per stop | P1 | NEW |
| FR-M2-046 | System shall update order status to `out_for_delivery` when delivery batch is dispatched and to `delivered` when stop is completed | P0 | PARTIAL -- out_for_delivery set in DeliveryBatchForm; delivered not auto-set |
| FR-M2-047 | System shall support soft-delete for deliveries (archive instead of hard delete via `deleteDelivery()`) | P2 | NEW |
| FR-M2-048 | System shall allow drivers to add notes per stop (text + optional photo) during delivery | P1 | NEW |

### 3.5 Delivery Classification Enhancement (FR-M2-049 through FR-M2-056)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-049 | System shall auto-classify deliveries using `classifyDelivery()` with thresholds: Small (<=5 garments OR <=10kg OR <=KES 5000), Bulk (exceeds any) | P0 | BUILT |
| FR-M2-050 | System shall support manager override of classification with mandatory reason (>=10 chars) validated by `validateOverrideRequest()` | P0 | BUILT |
| FR-M2-051 | Classification override shall be restricted to roles defined in `canOverrideClassification()`: admin, director, general_manager, store_manager, logistics_manager | P0 | BUILT |
| FR-M2-052 | System shall make classification thresholds configurable via system settings (currently hardcoded in `CLASSIFICATION_THRESHOLDS`) | P1 | NEW |
| FR-M2-053 | System shall display classification badges using `getClassificationColor()` (green=Small, amber=Bulk) and `getClassificationIcon()` (Bike/Truck) | P0 | BUILT |
| FR-M2-054 | System shall log all classification overrides via `createOverrideRecord()` and persist to audit logs | P0 | BUILT |
| FR-M2-055 | System shall provide classification analytics: ratio of Small vs Bulk, override frequency, accuracy of auto-classification | P1 | NEW |
| FR-M2-056 | System shall support combined-order classification for batch deliveries (aggregate garment count/weight/value across all orders in batch) | P1 | NEW |

### 3.6 Satellite Store Transfers (FR-M2-057 through FR-M2-064)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-057 | System shall support creation of transfer delivery notes using `DeliveryNote` interface with `noteType: 'inter_store_transfer'` | P0 | PARTIAL -- schema exists, full workflow not built |
| FR-M2-058 | System shall track transfer status flow: `sent` -> `in_transit` -> `received` (or `returned`) per `DeliveryNoteStatus` | P0 | PARTIAL -- types defined but no UI for status transitions |
| FR-M2-059 | System shall auto-assign drivers for satellite transfers based on `branch.driverAvailability` (carrying capacity) | P1 | NEW |
| FR-M2-060 | System shall generate transfer note numbers in format `TRN-[YYYYMMDD]-[###]` and auto-populate `noteNumber` field | P0 | NEW |
| FR-M2-061 | System shall require receiving confirmation at destination branch with staff sign-off (updates `receivedBy` and `actualReturnDate`) | P1 | NEW |
| FR-M2-062 | System shall flag discrepancies between sent and received garment counts and escalate to logistics manager | P1 | NEW |
| FR-M2-063 | System shall support tailor transfer notes (`noteType: 'tailor_transfer'`) with expected and actual return dates | P0 | PARTIAL -- schema exists |
| FR-M2-064 | System shall display transfer batches in `DriverTransferBatchList` component with active/pending/completed tabs | P0 | BUILT |

### 3.7 Driver Payouts (FR-M2-065 through FR-M2-070)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-065 | System shall compute driver payouts using `DriverPayout` interface with configurable commission rates per `commissionRuleId` | P1 | PARTIAL -- schema exists, no computation logic |
| FR-M2-066 | System shall support payout methods: M-Pesa (`mpesaRef`) and bank transfer (`bankRef`) | P1 | NEW |
| FR-M2-067 | System shall generate weekly payout summaries grouped by driver with `periodStart` and `periodEnd` | P1 | NEW |
| FR-M2-068 | System shall support bonus amounts and deductions with mandatory reason fields | P1 | NEW |
| FR-M2-069 | System shall require GM approval before processing payouts >KES 10,000 | P1 | NEW |
| FR-M2-070 | System shall integrate with the `DeliveryFeeRule` system for automatic fee calculation based on conditions (minOrderAmount, customerSegments, maxDistanceKm) | P1 | PARTIAL -- schema exists |

### 3.8 Notifications & Messaging (FR-M2-071 through FR-M2-076)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-M2-071 | System shall send `driver_dispatched` WhatsApp notification when delivery batch starts via `sendDriverDispatched()` | P0 | BUILT |
| FR-M2-072 | System shall send `driver_nearby` WhatsApp notification when driver enters geofence via `sendDriverNearby()` | P1 | PARTIAL -- function exists, geofence trigger not implemented |
| FR-M2-073 | System shall send `order_delivered` WhatsApp notification when stop is completed via `sendDelivered()` | P0 | BUILT |
| FR-M2-074 | System shall send delivery failure notification to customer with rescheduling details (new template: `delivery_failed`) | P1 | NEW |
| FR-M2-075 | System shall send transfer confirmation notifications to both origin and destination branches for satellite transfers | P1 | NEW |
| FR-M2-076 | System shall fallback to SMS when WhatsApp delivery fails (using `sendSMSFallback()` -- currently placeholder, needs implementation) | P2 | NEW |

---

## 4. Data Model

### 4.1 Existing Collections (with enhancements)

#### 4.1.1 `deliveries` Collection -- Enhanced

Extends the existing `Delivery` interface (`schema.ts` line 774):

```typescript
export interface Delivery {
  // --- EXISTING FIELDS ---
  deliveryId: string;                    // Format: DEL[YYYYMMDD][####]
  driverId: string;                      // Assigned driver UID
  branchId: string;                      // Origin branch
  orders: string[];                      // Order IDs in this delivery
  route: DeliveryRoute;                  // Route details
  status: DeliveryStatus;               // pending | in_progress | completed | failed
  startTime?: Timestamp;                // When driver started
  endTime?: Timestamp;                  // When delivery completed
  deliveryType?: 'small' | 'bulk';     // Classification

  // --- NEW FIELDS (Module 2 Enhancement) ---
  scheduledDate?: Timestamp;            // When delivery is scheduled for
  driverVehicleType?: 'motorcycle' | 'van'; // Vehicle used for this delivery
  optimizationMetadata?: {
    algorithm: string;                   // e.g., 'nearest_neighbor_2opt'
    computationTimeMs: number;          // Time to compute optimization
    improvementPercentage: number;      // Route improvement achieved
    originalDistance: number;            // Distance before optimization
  };
  proofOfDelivery?: {
    [orderId: string]: {
      photoUrls: string[];              // Firebase Storage paths
      recipientName?: string;           // Who received
      signature?: string;               // Base64 signature data
      timestamp: Timestamp;
    };
  };
  failureDetails?: {
    [orderId: string]: {
      reason: 'customer_absent' | 'wrong_address' | 'refused_delivery' | 'access_denied' | 'other';
      notes?: string;
      photoUrl?: string;
      rescheduledDeliveryId?: string;   // Link to rescheduled delivery
      rescheduleAttempt: number;        // 1, 2, or 3
    };
  };
  isRescheduled?: boolean;              // Whether this is a rescheduled delivery
  originalDeliveryId?: string;          // Link to original failed delivery
  isArchived?: boolean;                 // Soft delete flag
  archivedAt?: Timestamp;
  archivedBy?: string;
  createdBy: string;                    // UID of user who created the batch
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 4.1.2 `DeliveryStop` -- Enhanced

Extends existing `DeliveryStop` (`schema.ts` line 733):

```typescript
export interface DeliveryStop {
  // --- EXISTING FIELDS ---
  orderId: string;
  address: string;
  coordinates: { lat: number; lng: number };
  sequence: number;
  status: StopStatus;                    // pending | completed | failed
  timestamp?: Timestamp;                 // Completion/failure timestamp

  // --- NEW FIELDS ---
  timeWindow?: {
    earliest: Timestamp;                 // Earliest acceptable delivery time
    latest: Timestamp;                   // Latest acceptable delivery time
  };
  estimatedArrival?: Timestamp;          // Computed ETA for this stop
  actualArrival?: Timestamp;             // When driver actually arrived
  onTime?: boolean;                      // Was delivery within time window
  customerName?: string;                 // Denormalized for driver display
  customerPhone?: string;               // For driver to contact customer
  notes?: string;                        // Driver notes for this stop
  notePhotos?: string[];                // Photo URLs attached to notes
}
```

#### 4.1.3 `driverLocations` Collection -- Enhanced

Extends `DriverLocation` (`schema.ts` line 1586):

```typescript
export interface DriverLocation {
  // --- EXISTING FIELDS ---
  deliveryId: string;
  driverId: string;
  location: { lat: number; lng: number };
  heading?: number;
  speed?: number;
  lastUpdated: Timestamp;
  isActive: boolean;

  // --- NEW FIELDS ---
  batteryLevel?: number;                 // Device battery percentage (0-100)
  accuracy?: number;                     // GPS accuracy in meters
  nextStopId?: string;                   // Current target stop orderId
  distanceToNextStop?: number;          // Meters to next stop
  etaToNextStop?: number;               // Seconds to next stop
}
```

### 4.2 New Collections

#### 4.2.1 `driverProfiles` Collection (NEW)

```typescript
export interface DriverProfile {
  /** Driver UID (same as user UID, document ID) */
  driverId: string;
  /** Home branch assignment */
  branchId: string;
  /** Current availability status */
  availabilityStatus: 'available' | 'on_delivery' | 'off_duty' | 'on_break';
  /** Last status change timestamp */
  statusChangedAt: Timestamp;
  /** Assigned vehicle */
  vehicle: {
    type: 'motorcycle' | 'van';
    plateNumber: string;
    make?: string;
    model?: string;
  };
  /** Performance metrics (rolling 30-day) */
  performance: {
    totalDeliveries: number;
    completedDeliveries: number;
    failedDeliveries: number;
    onTimeRate: number;                  // 0-100 percentage
    completionRate: number;              // 0-100 percentage
    averageCustomerRating: number;       // 1-5 stars
    performanceScore: number;            // Computed composite score 0-100
    lastCalculated: Timestamp;
  };
  /** Driver license details */
  license?: {
    number: string;
    expiryDate: Timestamp;
    category: string;
  };
  /** Emergency contact */
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 4.2.2 `failedDeliveries` Collection (NEW)

```typescript
export interface FailedDeliveryRecord {
  /** Unique record ID */
  failedDeliveryId: string;
  /** Original delivery ID */
  originalDeliveryId: string;
  /** Order ID that failed */
  orderId: string;
  /** Customer ID */
  customerId: string;
  /** Failure reason */
  reason: 'customer_absent' | 'wrong_address' | 'refused_delivery' | 'access_denied' | 'other';
  /** Additional notes */
  notes?: string;
  /** Photo evidence URL */
  photoUrl?: string;
  /** Reschedule attempt number (1, 2, or 3) */
  attemptNumber: number;
  /** Rescheduled delivery ID (if rescheduled) */
  rescheduledDeliveryId?: string;
  /** Rescheduled date */
  rescheduledDate?: Timestamp;
  /** Resolution status */
  resolutionStatus: 'pending_reschedule' | 'rescheduled' | 'escalated' | 'resolved' | 'cancelled';
  /** Escalated to (logistics manager UID) */
  escalatedTo?: string;
  /** Resolution notes */
  resolutionNotes?: string;
  /** Branch ID */
  branchId: string;
  /** Driver who attempted delivery */
  driverId: string;
  /** Failure timestamp */
  failedAt: Timestamp;
  /** Resolution timestamp */
  resolvedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 4.2.3 `locationHistory` Subcollection (NEW)

Stored as `driverLocations/{deliveryId}/history/{autoId}`:

```typescript
export interface LocationHistoryPoint {
  /** Location coordinates */
  location: { lat: number; lng: number };
  /** Heading in degrees */
  heading?: number;
  /** Speed in m/s */
  speed?: number;
  /** GPS accuracy in meters */
  accuracy?: number;
  /** Timestamp of this reading */
  timestamp: Timestamp;
}
```

### 4.3 Firestore Indexes Required

```
// deliveries collection
deliveries: { branchId ASC, status ASC, startTime DESC }
deliveries: { driverId ASC, status ASC, startTime DESC }
deliveries: { status ASC, scheduledDate ASC }
deliveries: { branchId ASC, startTime >= }

// driverProfiles collection
driverProfiles: { branchId ASC, availabilityStatus ASC }
driverProfiles: { performance.performanceScore DESC }

// failedDeliveries collection
failedDeliveries: { branchId ASC, resolutionStatus ASC, createdAt DESC }
failedDeliveries: { orderId ASC, attemptNumber ASC }

// locationHistory subcollection
driverLocations/{deliveryId}/history: { timestamp DESC }
```

---

## 5. State Machines

### 5.1 Delivery Lifecycle

```
                                    +-----------+
                          +-------->|  failed   |
                          |         +-----------+
                          |              |
                          | (all stops   | (manual resolution /
                          |  failed)     |  rescheduled)
                          |              v
+----------+  start   +-------------+  +------------+
| pending  |--------->| in_progress |  | rescheduled |
+----------+          +-------------+  +------------+
     |                     |
     |                     | (all stops completed/failed)
     | (cancelled          |
     |  before start)      v
     |               +------------+
     +-------------->| completed  |
     (edge case)     +------------+
```

**Transition rules:**
- `pending` -> `in_progress`: Driver taps "Start Delivery" -> calls `updateDeliveryStatus(id, 'in_progress', Timestamp.now())`
- `in_progress` -> `completed`: Auto-triggered by `updateDeliveryStop()` when all stops are `completed` or `failed` (line 270)
- `in_progress` -> `failed`: All stops marked `failed` (subset of auto-completion logic)
- `pending` -> `completed`: Not normally allowed; edge case for zero-stop deliveries

### 5.2 Stop Status Flow

```
+----------+  driver arrives  +--------+  proof submitted  +-----------+
| pending  |----------------->| active |------------------>| completed |
+----------+                  +--------+                   +-----------+
                                  |
                                  | delivery failed
                                  v
                              +--------+  auto-reschedule  +--------------+
                              | failed |------------------>| rescheduled  |
                              +--------+                   +--------------+
```

### 5.3 Satellite Transfer Lifecycle

```
+------+  items dispatched  +-----------+  confirmed pickup  +----------+
| sent |------------------->| in_transit|-------------------->| received |
+------+                    +-----------+                     +----------+
                                 |                                 |
                                 | discrepancy                     | items returned
                                 v                                 v
                           +-----------+                     +----------+
                           | escalated |                     | returned |
                           +-----------+                     +----------+
```

### 5.4 Failed Delivery Resolution Flow

```
+-------------------+   auto (attempt < 3)   +--------------+   dispatched   +-------------------+
| pending_reschedule|------------------------>| rescheduled  |-------------->| (back to delivery) |
+-------------------+                        +--------------+              +-------------------+
        |
        | (attempt >= 3)
        v
+-------------------+   logistics manager   +----------+
|    escalated      |---------------------->| resolved |
+-------------------+                       +----------+
        |
        | (customer cancels)
        v
+-------------------+
|    cancelled      |
+-------------------+
```

---

## 6. API Specification

### 6.1 Existing Endpoints (to be preserved)

| Method | Endpoint | Handler | Purpose |
|--------|----------|---------|---------|
| POST | `/api/deliveries/classify` | `classify/route.ts` | Auto-classify delivery |
| GET | `/api/deliveries/classify` | `classify/route.ts` | Get classification for order |
| GET | `/api/deliveries/[deliveryId]/location` | `[deliveryId]/location/route.ts` | Get driver location (secured with order ownership check) |

### 6.2 New Endpoints

#### 6.2.1 Driver Profile Management

```
GET    /api/drivers/profiles
```
- **Auth:** `admin`, `director`, `general_manager`, `logistics_manager`
- **Query params:** `branchId`, `availabilityStatus`, `vehicleType`
- **Response:** `{ drivers: DriverProfile[], total: number }`

```
GET    /api/drivers/profiles/:driverId
```
- **Auth:** Driver (own profile), `admin`, `general_manager`, `logistics_manager`
- **Response:** `{ driver: DriverProfile }`

```
PUT    /api/drivers/profiles/:driverId/status
```
- **Auth:** Driver (own status), `admin`, `general_manager`
- **Body:** `{ availabilityStatus: 'available' | 'on_delivery' | 'off_duty' | 'on_break' }`
- **Response:** `{ success: boolean }`
- **Side effects:** Creates audit log, notifies logistics manager if last available driver goes off-duty

#### 6.2.2 Delivery Lifecycle

```
POST   /api/deliveries/:deliveryId/stops/:orderId/proof
```
- **Auth:** `driver`
- **Body:** `multipart/form-data` with `photo`, `recipientName`, `signature` (base64)
- **Response:** `{ proofId: string, photoUrls: string[] }`
- **Side effects:** Uploads to Firebase Storage `deliveries/{deliveryId}/proof/{orderId}/`

```
POST   /api/deliveries/:deliveryId/stops/:orderId/fail
```
- **Auth:** `driver`
- **Body:** `{ reason: FailureReason, notes?: string, photoUrl?: string }`
- **Response:** `{ failedDeliveryId: string, rescheduledDeliveryId?: string }`
- **Side effects:** Creates `FailedDeliveryRecord`, auto-reschedules if attempt < 3, sends WhatsApp failure notification

#### 6.2.3 Route Re-optimization

```
POST   /api/deliveries/:deliveryId/reoptimize
```
- **Auth:** `driver`, `admin`, `logistics_manager`
- **Body:** `{ excludeFailedStops?: boolean }`
- **Response:** `{ optimizedRoute: OptimizedRoute, improvement: { distanceSaved, percentageImproved } }`
- **Side effects:** Updates delivery route via `updateDeliveryRoute()`, recalculates ETAs for all remaining stops

#### 6.2.4 Failed Delivery Management

```
GET    /api/deliveries/failed
```
- **Auth:** `admin`, `general_manager`, `logistics_manager`
- **Query params:** `branchId`, `resolutionStatus`, `startDate`, `endDate`
- **Response:** `{ failedDeliveries: FailedDeliveryRecord[], total: number }`

```
PUT    /api/deliveries/failed/:failedDeliveryId/resolve
```
- **Auth:** `admin`, `general_manager`, `logistics_manager`
- **Body:** `{ resolutionStatus: 'resolved' | 'cancelled', resolutionNotes: string }`
- **Response:** `{ success: boolean }`
- **Side effects:** Updates resolution, creates audit log, notifies customer

#### 6.2.5 Driver Performance

```
GET    /api/drivers/:driverId/performance
```
- **Auth:** Driver (own), `admin`, `general_manager`, `logistics_manager`
- **Query params:** `period` (`7d`, `30d`, `90d`, `all`)
- **Response:** `{ performance: DriverPerformanceMetrics, trend: TimeSeriesData[] }`

#### 6.2.6 Fleet Map

```
GET    /api/deliveries/fleet/locations
```
- **Auth:** `admin`, `general_manager`, `logistics_manager`
- **Query params:** `branchId`
- **Response:** `{ drivers: Array<{ driverId, driverName, location, deliveryId, status, lastUpdated }> }`

#### 6.2.7 Driver Location Update (from mobile)

```
POST   /api/deliveries/:deliveryId/location
```
- **Auth:** `driver`
- **Body:** `{ location: { lat, lng }, heading?, speed?, accuracy?, batteryLevel? }`
- **Response:** `{ success: boolean, etaToNextStop?: number }`
- **Side effects:** Updates `driverLocations`, appends to `locationHistory`, triggers geofence check, recalculates ETA

---

## 7. UI Specification

### 7.1 New Pages

#### 7.1.1 Director Logistics Overview (`/director/logistics`)

**Purpose:** Bird's-eye view of delivery operations across all branches.

**Layout:**
- KPI row: Total Deliveries Today, On-Time Rate, Failed Rate, Active Drivers, Avg Delivery Time
- Fleet map (all active drivers from all branches)
- Branch comparison table (deliveries, on-time rate, failed rate per branch)
- Classification distribution chart (Small vs Bulk stacked bar by branch)
- Driver leaderboard (top 10 by performance score)

**Data sources:** `getDeliveriesCountForBranches(null)`, `getTodayDeliveriesCountForBranches(null)`, `/api/deliveries/fleet/locations`, `DeliveriesBreakdownContent` (existing)

#### 7.1.2 GM Delivery Dashboard (`/gm/deliveries`)

**Purpose:** Branch-specific delivery management and oversight.

**Layout:**
- Tab 1: Active Deliveries (uses enhanced `DeliveryTable` with proof-of-delivery status column)
- Tab 2: Failed Deliveries (pending reschedule, escalated, resolved)
- Tab 3: Driver Performance (performance scores, rankings, trends for branch drivers)
- Tab 4: Transfer Notes (satellite transfer tracking using `DeliveryNote` data)
- Tab 5: Payouts (pending/processed driver payouts)

**Data sources:** `getDeliveriesByBranch()`, `getDriverDeliveryStats()`, failed delivery records, driver profiles

#### 7.1.3 Fleet Map View (`/logistics/fleet`)

**Purpose:** Real-time fleet visualization for logistics manager.

**Layout:**
- Full-screen Google Map with all active driver markers
- Sidebar: list of active drivers with status badges
- Click driver: show delivery details, route polyline, remaining stops
- Color-coded markers: green=available, blue=on_delivery, gray=off_duty
- Alert banner for stale locations (>5 min without update)

**Data sources:** `/api/deliveries/fleet/locations`, `subscribeToDriverLocation()` for selected driver

#### 7.1.4 Driver Performance Dashboard (`/drivers/performance`)

**Purpose:** Driver self-service performance view.

**Layout:**
- Performance score gauge (0-100)
- Delivery stats: completed, failed, on-time rate
- Weekly trend chart
- Recent delivery history with ratings
- Earnings summary (links to payouts)

**Data sources:** `/api/drivers/:driverId/performance`, `getDriverDeliveryStats()`

### 7.2 Enhanced Existing Components

#### 7.2.1 `DeliveryBatchForm` Enhancements

**File:** `c:\POS\components\features\deliveries\DeliveryBatchForm.tsx`

Additions:
- Auto-assign driver button (calls auto-assignment algorithm)
- Vehicle type indicator next to driver name
- Time window picker per stop (earliest/latest)
- Delivery priority selector (normal, urgent, scheduled)
- Address geocode caching indicator (cached vs fresh lookup)

#### 7.2.2 `DeliveryTable` Enhancements

**File:** `c:\POS\components\features\deliveries\DeliveryTable.tsx`

Additions:
- Proof-of-delivery status column (icon: camera with check/pending)
- Failed stop count column with rescheduling status
- On-time indicator column (green check / red X)
- Click-to-expand for delivery route details
- Bulk actions: archive, re-assign driver

#### 7.2.3 `LiveDriverMap` Enhancements

**File:** `c:\POS\components\features\customer\LiveDriverMap.tsx`

Additions:
- Dynamic ETA recalculated from live driver position
- Geofence proximity indicator ("Driver is X minutes away")
- Route polyline showing remaining path to customer
- Driver details card (name, vehicle type, photo)
- Switch from 5-second polling to Firestore `onSnapshot` real-time subscription

#### 7.2.4 Driver Batch Detail Enhancements

**File:** `c:\POS\app\(dashboard)\drivers\[deliveryId]\page.tsx`

Additions:
- "Re-optimize Route" button for remaining stops
- Proof of delivery photo capture (camera integration)
- Failure reason selection dialog with required notes
- Stop notes text field with photo attachment
- Real-time ETA per remaining stop

#### 7.2.5 `RouteOptimizer` Enhancements

**File:** `c:\POS\components\features\deliveries\RouteOptimizer.tsx`

Additions:
- Enforce 25-stop limit (split into sub-routes when exceeded)
- Time-window visualization (timeline view per stop)
- Traffic-aware toggle (passes `departure_time=now`)
- Multi-driver optimization option
- Optimization metadata display (algorithm, computation time, improvement)

#### 7.2.6 Logistics Dashboard Page Enhancement

**File:** `c:\POS\app\(dashboard)\logistics\page.tsx`

Fixes:
- Replace `Math.random()` on-time rate (line 208) with actual computed on-time rate from delivery data
- Add failed delivery stats section
- Add fleet map thumbnail (click to open full fleet map)
- Add driver availability summary

#### 7.2.7 `DeliveriesBreakdownContent` Enhancement

**File:** `c:\POS\components\features\director\breakdowns\DeliveriesBreakdownContent.tsx`

Additions:
- On-time rate per branch
- Failed delivery rate per branch
- Driver performance comparison table
- Classification distribution chart

#### 7.2.8 `DriverTransferBatchList` Enhancement

**File:** `c:\POS\components\features\drivers\DriverTransferBatchList.tsx`

Additions:
- Receiving confirmation button with garment count verification
- Discrepancy reporting form
- Transfer note printable view
- ETA to destination display

### 7.3 New Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `DriverPerformanceCard` | Shows driver score, delivery stats, trend | `components/features/drivers/` |
| `ProofOfDeliveryCapture` | Camera/signature capture for delivery proof | `components/features/drivers/` |
| `FailureReasonDialog` | Modal for selecting failure reason + notes | `components/features/drivers/` |
| `FleetMapView` | Full-screen fleet map with driver markers | `components/features/logistics/` |
| `FailedDeliveryList` | Table of failed deliveries with resolution actions | `components/features/deliveries/` |
| `DriverPayoutSummary` | Payout calculation and history for a driver | `components/features/drivers/` |
| `DeliveryTimelineView` | Visual timeline of delivery stops with ETA/actual times | `components/features/deliveries/` |
| `TransferConfirmationForm` | Form for receiving and confirming satellite transfers | `components/features/deliveries/` |
| `GeofenceIndicator` | Shows proximity status on customer map | `components/features/customer/` |

---

## 8. Dashboard & Reporting Outputs

### 8.1 Logistics KPI Dashboard

| Metric | Source | Update Frequency |
|--------|--------|-----------------|
| Total Deliveries Today | `getTodayDeliveriesCountForBranches()` | Real-time |
| Active Deliveries | `getActiveDeliveries()` | Real-time |
| On-Time Delivery Rate | Computed from `DeliveryStop.onTime` field | Hourly |
| Failed Delivery Rate | `failedDeliveries` collection count / total | Hourly |
| Average Delivery Time | `Delivery.endTime - Delivery.startTime` aggregate | Daily |
| Driver Utilization Rate | Active drivers / total available drivers | Real-time |
| Route Optimization Savings | `optimizationMetadata.improvementPercentage` average | Daily |

### 8.2 Reports

| Report | Data Source | Export Format |
|--------|------------|---------------|
| Daily Delivery Report | `getAllDeliveries()` filtered by date | Excel (via `xlsx` library, pattern from `export-excel.ts`) |
| Driver Performance Report | `DriverProfile.performance` + `DeliveryStats` | Excel + PDF |
| Failed Delivery Report | `failedDeliveries` collection | Excel |
| Classification Distribution Report | `classifyMultipleDeliveries()` aggregation | Excel |
| Route Efficiency Report | `optimizationMetadata` from deliveries | Excel |
| Satellite Transfer Report | `deliveryNotes` collection | Excel |
| Driver Payout Report | `driverPayouts` collection | Excel + PDF |

### 8.3 Report Export Pattern

Follow the existing pattern from `c:\POS\lib\reports\export-excel.ts`:
1. Use `XLSX.utils.json_to_sheet()` for data
2. Set column widths via `sheet['!cols']`
3. Add summary sheet with `calculateSummary()` pattern
4. Download via `XLSX.writeFile(workbook, filename)`

Create new export module: `lib/reports/export-delivery-reports.ts`

---

## 9. Notification & Messaging Flows

### 9.1 Existing Templates (via `services/wati.ts`)

| Template | Trigger | Parameters |
|----------|---------|------------|
| `driver_dispatched` | Delivery batch status -> `in_progress` | `{driverName, estimatedTime, orderNumber}` |
| `driver_nearby` | Geofence trigger (500m radius) | `{driverName, minutesAway, orderNumber}` |
| `order_delivered` | Stop status -> `completed` | `{orderNumber, deliveredTo}` |

### 9.2 New Templates Required

| Template | Trigger | Parameters |
|----------|---------|------------|
| `delivery_failed` | Stop status -> `failed` | `{orderNumber, failureReason, rescheduledDate, contactNumber}` |
| `delivery_rescheduled` | Auto-reschedule created | `{orderNumber, newDate, timeWindow}` |
| `transfer_dispatched` | Transfer note status -> `sent` | `{noteNumber, fromBranch, toBranch, garmentCount}` |
| `transfer_received` | Transfer note status -> `received` | `{noteNumber, receivedAt, garmentCount}` |
| `driver_all_unavailable` | All branch drivers off-duty | `{branchName, timestamp}` |
| `delivery_escalated` | Failed delivery attempt >= 3 | `{orderNumber, customerName, customerPhone, attemptCount}` |

### 9.3 Notification Flow

```
Delivery Event
     |
     v
Check notification type
     |
     v
Format phone via formatPhoneNumber() (Kenyan +254 format)
     |
     v
Send via sendWhatsAppMessage() with template
     |
     +---> Success: Log to notifications collection (status: 'sent')
     |
     +---> Failure (attempt 1/3): Retry with exponential backoff
     |
     +---> Failure (attempt 3/3): Call sendSMSFallback() [TODO: implement]
                                  Log to notifications collection (status: 'failed')
```

---

## 10. Audit & Compliance

### 10.1 Auditable Events

All events use `createAuditLog()` from `c:\POS\lib\db\audit-logs.ts`:

| Event | `action` | `resourceType` | Notes |
|-------|----------|----------------|-------|
| Delivery created | `delivery_created` | `delivery` | Includes all stop details |
| Delivery status changed | `delivery_status_changed` | `delivery` | Before/after status in `changes` |
| Stop completed | `stop_completed` | `delivery` | Includes proof-of-delivery reference |
| Stop failed | `stop_failed` | `delivery` | Includes failure reason |
| Classification overridden | `classification_override` | `delivery` | Uses `createOverrideRecord()` |
| Route re-optimized | `route_reoptimized` | `delivery` | Before/after route metrics |
| Driver assigned | `driver_assigned` | `delivery` | Driver ID and assignment method (manual/auto) |
| Driver status changed | `driver_status_changed` | `driver_profile` | Before/after availability |
| Transfer note created | `transfer_created` | `delivery_note` | Includes origin/destination |
| Transfer received | `transfer_received` | `delivery_note` | Includes discrepancy details if any |
| Payout processed | `payout_processed` | `driver_payout` | Amount, method, approval chain |
| Failed delivery escalated | `delivery_escalated` | `failed_delivery` | Attempt count, escalation target |

### 10.2 Data Retention

- Delivery records: Retained indefinitely (soft-deleted after 1 year inactive)
- Location history: Retained 90 days, then archived
- Audit logs: Retained 365 days minimum (per Kenya Data Protection Act compliance)
- Proof-of-delivery photos: Retained 180 days in Firebase Storage

---

## 11. Customer Portal Impact

### 11.1 Current Customer Features

- `LiveDriverMap` component: Polls `/api/deliveries/[deliveryId]/location` every 5 seconds
- Shows driver marker on Google Map
- Displays ETA (computed once at dispatch)
- Shows stale location warning via `isLocationStale()`

### 11.2 Enhanced Customer Experience

| Feature | Current | Enhanced |
|---------|---------|----------|
| Driver location | 5-second polling | Real-time Firestore `onSnapshot` |
| ETA display | Static (dispatch-time computation) | Dynamic (recalculated on each location update) |
| Proximity alert | None | "Driver is X minutes away" with geofence trigger |
| Delivery proof | Not visible | Customer receives photo confirmation of delivery |
| Failed delivery | No notification | WhatsApp notification with reason + reschedule info |
| Driver info | None | Name, vehicle type, phone (masked) |
| Route visualization | None | Polyline showing remaining route to customer |

### 11.3 Security

- Driver phone number shown to customer with last 4 digits masked: `+254****5678`
- Location access requires valid order ownership (existing check in `/api/deliveries/[deliveryId]/location`)
- Location tracking automatically deactivated on delivery completion via `deactivateDriverLocation()`
- No location history exposed to customers

---

## 12. Branch Scoping

### 12.1 Data Visibility Rules

| Role | Delivery Visibility | Driver Visibility |
|------|--------------------|--------------------|
| `admin` / `director` | All branches (`branchIds: null` -> queries all) | All drivers |
| `general_manager` | Own branch only (`getDeliveriesByBranch(branchId)`) | Branch drivers only |
| `store_manager` | Own branch only | Branch drivers only |
| `logistics_manager` | All branches (logistics is cross-branch) | All drivers |
| `driver` | Own assigned deliveries (`getDeliveriesByDriver(driverId)`) | Own profile only |
| `front_desk` | Own branch, read-only delivery status | N/A |
| `customer` | Own order deliveries only | Current driver location for own order |

### 12.2 Satellite Transfer Scoping

- Transfer notes are visible to both origin and destination branches
- Uses `logCrossBranchAction()` for audit trail across branches
- `branchId` on delivery note refers to the creating branch
- Both `fromLocation` and `toLocation` determine visibility scope

---

## 13. Business Logic

### 13.1 Route Optimization Algorithm

**Current implementation** (from `c:\POS\lib\maps\route-optimizer.ts`):

```
1. Build distance matrix (Haversine default, Google API optional)
2. Run Nearest Neighbor from depot (index 0)
3. Improve with 2-opt segment reversal
4. Compute improvement metrics vs original sequential order
5. Estimate duration at 30 km/h average city speed
```

**Enhancements:**

```
1. Build distance matrix (with geocode cache lookup first)
2. Apply time-window constraints to filter valid orderings
3. Run Nearest Neighbor with time-window awareness
4. Improve with 2-opt (reject reversals that violate time windows)
5. For multi-driver: cluster stops by proximity, assign clusters to drivers
6. For >25 stops: split into sub-routes of max 25 stops each
7. Compute ETA per stop using actual Google Directions duration
8. Store optimization metadata in delivery document
```

### 13.2 Driver Auto-Assignment Algorithm

```
1. Get all drivers with availabilityStatus == 'available' for branchId
2. Filter by vehicle type matching delivery classification:
   - Small -> motorcycle drivers
   - Bulk -> van drivers
3. Sort candidates by:
   a. Current workload (fewer active deliveries first)
   b. Performance score (higher score first)
   c. Proximity to branch (if location available, closer first)
4. Select top candidate
5. If no candidates available:
   a. Check other vehicle type drivers (with override warning)
   b. Notify logistics manager of shortage
```

### 13.3 ETA Calculation

**Current:** Single computation at dispatch using `route.estimatedDuration` based on 30 km/h average.

**Enhanced:**

```typescript
function recalculateETA(
  driverLocation: DriverLocation,
  remainingStops: DeliveryStop[]
): DeliveryStop[] {
  // For each remaining stop, compute:
  // 1. Distance from driver (or previous stop) using Haversine
  // 2. Duration = distance / averageSpeed (or Google API if available)
  // 3. estimatedArrival = now + cumulative duration
  // 4. onTime = estimatedArrival <= timeWindow.latest (if time window set)
}
```

Recalculation triggers:
- Driver location update (every 15 seconds)
- Stop completed (remaining route changes)
- Stop failed (if re-optimization triggered)

### 13.4 Failed Delivery Auto-Reschedule Rules

```
IF stop.status == 'failed' AND failedDeliveryRecord.attemptNumber < 3:
  1. Create new FailedDeliveryRecord with attemptNumber = previous + 1
  2. Set rescheduledDate = next business day
  3. Create new delivery batch with single stop
  4. Set resolutionStatus = 'rescheduled'
  5. Send delivery_rescheduled WhatsApp to customer
  6. Send delivery_failed WhatsApp to customer

IF stop.status == 'failed' AND failedDeliveryRecord.attemptNumber >= 3:
  1. Set resolutionStatus = 'escalated'
  2. Assign to logistics manager (escalatedTo field)
  3. Send delivery_escalated notification to logistics manager
  4. Create audit log with escalation details
```

### 13.5 Driver Performance Scoring Formula

```typescript
function calculateDriverPerformanceScore(stats: {
  onTimeRate: number;           // 0-100, weight: 40%
  completionRate: number;       // 0-100, weight: 30%
  averageCustomerRating: number; // 1-5 (normalized to 0-100), weight: 20%
  efficiencyBonus: number;      // 0-100 (route adherence), weight: 10%
}): number {
  const normalizedRating = ((stats.averageCustomerRating - 1) / 4) * 100;
  return (
    stats.onTimeRate * 0.40 +
    stats.completionRate * 0.30 +
    normalizedRating * 0.20 +
    stats.efficiencyBonus * 0.10
  );
}
```

Recalculated: Daily at midnight via Cloud Function, or on-demand via `/api/drivers/:driverId/performance`.

### 13.6 Satellite Transfer Batch Logic

```
1. Orders at satellite branch marked as 'ready_for_transfer'
2. System groups orders by destination main store
3. Auto-creates transfer delivery note with noteType: 'inter_store_transfer'
4. Assigns driver based on branch.driverAvailability
5. Generates noteNumber: TRN-[YYYYMMDD]-[###]
6. Status flow: sent -> in_transit -> received
7. Receiving branch staff confirms with garment count
8. Discrepancies flagged and escalated
```

### 13.7 Geofence Detection Logic

```typescript
function checkGeofence(
  driverLocation: { lat: number; lng: number },
  stopLocation: { lat: number; lng: number },
  radiusMeters: number = 500
): boolean {
  const distance = haversineDistance(driverLocation, stopLocation);
  return distance <= radiusMeters;
}
```

Executed on every driver location update. When triggered:
1. Send `driver_nearby` WhatsApp notification (if not already sent for this stop)
2. Update `LiveDriverMap` component with proximity indicator
3. Mark geofence entry in location history

---

## 14. Integration Points

### 14.1 Module Dependencies

| Module | Integration Point | Direction |
|--------|-------------------|-----------|
| Module 1 (Order Enhancement) | Order status updates (`out_for_delivery`, `delivered`) | M2 writes to orders |
| Module 1 (Order Enhancement) | Order garment data for classification | M2 reads from orders |
| Module 3 (Inventory) | Delivery supplies tracking (packaging, bags) | M2 triggers inventory deduction |
| Module 4 (Customer Reminders) | Delivery success triggers reminder cancellation | M2 notifies M4 |
| Module 5 (Reporting) | Delivery metrics feed into operational reports | M2 provides data to M5 |
| Module 6 (Vouchers) | Delivery-based promo vouchers (e.g., free delivery voucher) | M2 consumes vouchers from M6 |

### 14.2 External Service Integration

| Service | Usage | Config |
|---------|-------|--------|
| Google Maps Directions API | Route computation, turn-by-turn navigation | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| Google Maps Distance Matrix API | Distance/duration calculations via `calculateDistance()` | Same key |
| Google Maps Geocoding API | Address-to-coordinate conversion via `geocodeAddress()` | Same key |
| Google Maps Places API | Address autocomplete via `getAddressSuggestions()` | Same key |
| Wati.io WhatsApp API | All delivery notifications | `WATI_ACCESS_TOKEN`, `WATI_API_ENDPOINT` |
| Firebase Storage | Proof-of-delivery photos, delivery note documents | Firebase project config |
| Firebase Firestore | All delivery/driver data, real-time subscriptions | Firebase project config |

---

## 15. Security & Permissions

### 15.1 RBAC Matrix for Module 2

| Action | admin | director | general_manager | store_manager | logistics_manager | front_desk | driver | customer |
|--------|-------|----------|----------------|---------------|-------------------|------------|--------|----------|
| Create delivery batch | Yes | No | Yes | Yes | Yes | No | No | No |
| Start delivery | No | No | No | No | No | No | Yes (own) | No |
| Mark stop completed | No | No | No | No | No | No | Yes (own) | No |
| Mark stop failed | No | No | No | No | No | No | Yes (own) | No |
| View all deliveries | Yes | Yes | Branch | Branch | Yes | Branch (read) | Own | Own order |
| Assign driver | Yes | No | Yes | Yes | Yes | No | No | No |
| Override classification | Yes | Yes | Yes | Yes | Yes | No | No | No |
| View fleet map | Yes | Yes | Yes | No | Yes | No | No | No |
| Manage failed deliveries | Yes | No | Yes | No | Yes | No | No | No |
| Process payouts | Yes | No | Yes (approve) | No | No | No | No | No |
| View driver performance | Yes | Yes | Branch | No | Yes | No | Own | No |
| Update driver location | No | No | No | No | No | No | Yes (own) | No |
| View driver location | Yes | Yes | Branch | No | Yes | No | Own delivery | Own order |
| Archive delivery | Yes | No | Yes | No | Yes | No | No | No |
| View audit logs | Yes | Yes | Yes | No | Yes | No | No | No |

### 15.2 Firestore Security Rules

```javascript
// deliveries collection
match /deliveries/{deliveryId} {
  allow read: if isAuthenticated() &&
    (hasRole('admin') || hasRole('director') || hasRole('logistics_manager') ||
     (hasRole('general_manager') && resource.data.branchId == getUserBranch()) ||
     (hasRole('store_manager') && resource.data.branchId == getUserBranch()) ||
     (hasRole('front_desk') && resource.data.branchId == getUserBranch()) ||
     (hasRole('driver') && resource.data.driverId == request.auth.uid));
  allow create: if isAuthenticated() &&
    (hasRole('admin') || hasRole('general_manager') || hasRole('store_manager') || hasRole('logistics_manager'));
  allow update: if isAuthenticated() &&
    (hasRole('admin') || hasRole('general_manager') || hasRole('logistics_manager') ||
     (hasRole('driver') && resource.data.driverId == request.auth.uid));
}

// driverLocations collection
match /driverLocations/{deliveryId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() &&
    (hasRole('admin') || hasRole('driver'));
}

// driverProfiles collection
match /driverProfiles/{driverId} {
  allow read: if isAuthenticated() &&
    (hasRole('admin') || hasRole('director') || hasRole('general_manager') ||
     hasRole('logistics_manager') || request.auth.uid == driverId);
  allow write: if isAuthenticated() &&
    (hasRole('admin') || hasRole('general_manager') ||
     (request.auth.uid == driverId && onlyUpdating(['availabilityStatus', 'statusChangedAt'])));
}

// failedDeliveries collection
match /failedDeliveries/{recordId} {
  allow read: if isAuthenticated() &&
    (hasRole('admin') || hasRole('general_manager') || hasRole('logistics_manager'));
  allow create: if isAuthenticated() && hasRole('driver');
  allow update: if isAuthenticated() &&
    (hasRole('admin') || hasRole('general_manager') || hasRole('logistics_manager'));
}
```

### 15.3 API Route Protection

All new API routes must:
1. Verify Firebase Auth token via middleware
2. Check user role against RBAC matrix
3. Validate branch scope for branch-restricted roles
4. Rate-limit driver location updates to 1 per 10 seconds per driver
5. Validate request body with Zod schemas (consistent with existing codebase pattern)

---

## 16. Error Handling & Edge Cases

### 16.1 Error Scenarios

| Scenario | Current Handling | Required Handling |
|----------|-----------------|-------------------|
| Google Maps API quota exceeded | `console.warn` and fallback to Haversine (route-optimizer.ts line 64) | Fallback to Haversine + alert admin via audit log |
| Driver location update fails | Error logged in `subscribeToDriverLocation` error handler | Retry 3x, then mark location as stale |
| Delivery batch creation with 0 orders | No validation | Reject with 400 error |
| Driver assigned to delivery but goes off-duty | No handling | Alert logistics manager, offer reassignment |
| Concurrent stop completion updates | Possible race condition in `updateDeliveryStop()` | Use Firestore transaction for atomic update |
| Geofence false positive (GPS drift) | N/A | Require 2 consecutive geofence triggers within 30 seconds |
| Firebase Storage upload fails (proof of delivery) | N/A | Retry 3x, allow driver to proceed with text-only proof |
| All rescheduling attempts exhausted | N/A | Escalate to logistics manager with full history |
| Transfer note garment count mismatch | N/A | Block "received" status, require discrepancy report |
| Driver phone offline for >30 minutes during delivery | N/A | Mark location as stale, alert logistics manager |

### 16.2 Data Consistency

- Use Firestore `writeBatch()` for atomic multi-document updates (already used in `batchCreateDeliveries()`)
- Use Firestore transactions for read-modify-write operations (e.g., `updateDeliveryStop()` should use transaction)
- Denormalize customer name/phone on `DeliveryStop` to avoid N+1 queries during delivery
- Store driver name on `Delivery` document for display without joins

---

## 17. Data Migration

### 17.1 Existing Data

| Collection | Records (est.) | Migration Action |
|------------|---------------|-----------------|
| `deliveries` | 500+ | Add new optional fields (no breaking changes); backfill `createdAt`, `updatedAt` |
| `driverLocations` | ~50 active | No migration needed (ephemeral data) |
| `orders` | 3000+ | No changes to order schema in this module |

### 17.2 Migration Steps

1. **Create new collections:** `driverProfiles`, `failedDeliveries` (empty, no migration)
2. **Backfill `deliveries`:** Add `createdAt = startTime`, `updatedAt = endTime || startTime`, `isArchived = false` to all existing documents
3. **Create `driverProfiles`:** For each existing user with role `driver`, create a profile with:
   - `availabilityStatus: 'available'`
   - `performance`: computed from `getDriverDeliveryStats()`
   - `vehicle`: default to `{ type: 'motorcycle', plateNumber: 'TBD' }`
4. **Compute initial performance scores:** Run scoring formula against existing delivery data
5. **Create Firestore indexes:** Deploy all indexes from section 4.3

### 17.3 Rollback Plan

- New fields on `deliveries` are all optional -- safe to ignore if rolled back
- New collections can be deleted without affecting existing data
- No existing fields modified or removed

---

## 18. Testing Strategy

### 18.1 Unit Tests

| Test Area | File | Key Test Cases |
|-----------|------|---------------|
| Route Optimization | `__tests__/lib/maps/route-optimizer.test.ts` | 0 stops, 1 stop, 2 stops, 25 stops, >25 stops (split), time-window constraints |
| Classification | `__tests__/lib/delivery/classification.test.ts` | Boundary values (5/6 garments, 10/10.01 kg, 5000/5001 KES), override validation |
| ETA Calculation | `__tests__/lib/maps/eta.test.ts` | Recalculation accuracy, stale location handling |
| Geofence Detection | `__tests__/lib/maps/geofence.test.ts` | Inside/outside/boundary radius, false positive mitigation |
| Driver Scoring | `__tests__/lib/drivers/performance.test.ts` | Score formula accuracy, edge cases (0 deliveries, all failed) |
| Failed Delivery Logic | `__tests__/lib/delivery/failed-delivery.test.ts` | Auto-reschedule (attempt 1-3), escalation, resolution |

### 18.2 Integration Tests

| Test Area | Key Test Cases |
|-----------|---------------|
| Delivery lifecycle | Create -> assign -> start -> complete all stops -> verify auto-complete |
| Failed delivery flow | Fail stop -> verify auto-reschedule -> fail 3x -> verify escalation |
| Location tracking | Initialize -> update -> subscribe -> deactivate -> verify history |
| Classification + override | Auto-classify -> override -> verify audit log |
| Transfer notes | Create -> dispatch -> receive -> verify garment counts |

### 18.3 E2E Tests (Playwright)

| Test Flow | Steps |
|-----------|-------|
| Full delivery cycle | Login as front_desk -> create batch -> login as driver -> start delivery -> complete all stops -> verify order status updated |
| Failed delivery | Login as driver -> fail a stop -> verify reschedule created -> verify customer notification sent |
| Fleet map | Login as logistics_manager -> open fleet map -> verify all active drivers shown |
| Classification override | Login as GM -> view delivery -> override classification -> verify audit log entry |

---

## 19. Implementation Sequence

### Phase 1: Foundation (Week 1-2)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 1.1 | Create `driverProfiles` collection + CRUD functions | None | `lib/db/driver-profiles.ts` (new) |
| 1.2 | Create `failedDeliveries` collection + CRUD functions | None | `lib/db/failed-deliveries.ts` (new) |
| 1.3 | Add new fields to `Delivery` interface | None | `lib/db/schema.ts` |
| 1.4 | Add new fields to `DeliveryStop` interface | None | `lib/db/schema.ts` |
| 1.5 | Deploy Firestore indexes | 1.1-1.4 | `firestore.indexes.json` |
| 1.6 | Run data migration for existing deliveries | 1.3, 1.5 | `scripts/migrate-deliveries.ts` (new) |
| 1.7 | Create initial driver profiles from existing users | 1.1, 1.5 | `scripts/seed-driver-profiles.ts` (new) |

### Phase 2: Driver Management (Week 2-3)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 2.1 | Implement driver availability management | 1.1 | `lib/db/driver-profiles.ts`, API routes |
| 2.2 | Build driver auto-assignment algorithm | 2.1 | `lib/delivery/driver-assignment.ts` (new) |
| 2.3 | Implement driver performance scoring (replace `Math.random()`) | 1.1 | `lib/delivery/driver-performance.ts` (new), `logistics/page.tsx` |
| 2.4 | Build `DriverPerformanceCard` component | 2.3 | `components/features/drivers/DriverPerformanceCard.tsx` (new) |
| 2.5 | Create driver performance API endpoint | 2.3 | `app/api/drivers/[driverId]/performance/route.ts` (new) |
| 2.6 | Build `/drivers/performance` page | 2.4, 2.5 | `app/(dashboard)/drivers/performance/page.tsx` (new) |

### Phase 3: Enhanced Delivery Lifecycle (Week 3-4)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 3.1 | Implement proof-of-delivery capture | 1.3 | `ProofOfDeliveryCapture.tsx` (new), Firebase Storage config |
| 3.2 | Implement failure reason dialog | 1.2 | `FailureReasonDialog.tsx` (new) |
| 3.3 | Implement auto-reschedule logic | 1.2, 3.2 | `lib/delivery/failed-delivery-handler.ts` (new) |
| 3.4 | Add failed delivery API endpoints | 3.3 | `app/api/deliveries/failed/` (new) |
| 3.5 | Build `FailedDeliveryList` component | 3.4 | `components/features/deliveries/FailedDeliveryList.tsx` (new) |
| 3.6 | Enhance `drivers/[deliveryId]/page.tsx` with proof + failure UI | 3.1, 3.2 | `app/(dashboard)/drivers/[deliveryId]/page.tsx` |

### Phase 4: Enhanced Route Optimization (Week 4-5)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 4.1 | Add time-window support to route optimizer | None | `lib/maps/route-optimizer.ts` |
| 4.2 | Enforce 25-stop limit with auto-splitting | None | `lib/maps/route-optimizer.ts` |
| 4.3 | Implement ETA recalculation on location update | None | `lib/maps/eta-calculator.ts` (new) |
| 4.4 | Add re-optimize API endpoint | 4.1 | `app/api/deliveries/[deliveryId]/reoptimize/route.ts` (new) |
| 4.5 | Implement address geocode caching | None | `lib/maps/geocode-cache.ts` (new) |
| 4.6 | Enhance `RouteOptimizer.tsx` with new features | 4.1, 4.2 | `components/features/deliveries/RouteOptimizer.tsx` |

### Phase 5: Real-Time Tracking Enhancement (Week 5-6)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 5.1 | Implement location history subcollection | None | `lib/db/driver-locations.ts` |
| 5.2 | Implement geofence detection | None | `lib/maps/geofence.ts` (new) |
| 5.3 | Wire geofence to WhatsApp notifications | 5.2 | `services/wati.ts`, notification flow |
| 5.4 | Build fleet map view | None | `FleetMapView.tsx` (new), `/logistics/fleet` page |
| 5.5 | Enhance `LiveDriverMap` with real-time ETA + geofence | 4.3, 5.2 | `components/features/customer/LiveDriverMap.tsx` |
| 5.6 | Implement driver location update API | 5.1, 5.2 | `app/api/deliveries/[deliveryId]/location/route.ts` |

### Phase 6: Satellite Transfers (Week 6-7)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 6.1 | Build transfer note CRUD functions | None | `lib/db/delivery-notes.ts` (new) |
| 6.2 | Build `TransferConfirmationForm` component | 6.1 | `components/features/deliveries/TransferConfirmationForm.tsx` (new) |
| 6.3 | Enhance `DriverTransferBatchList` | 6.1, 6.2 | `components/features/drivers/DriverTransferBatchList.tsx` |
| 6.4 | Add transfer notification templates | 6.1 | `services/wati.ts` |
| 6.5 | Build discrepancy reporting flow | 6.1 | `lib/delivery/transfer-discrepancy.ts` (new) |

### Phase 7: Payouts & Reporting (Week 7-8)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 7.1 | Build driver payout computation logic | Phase 2 | `lib/delivery/driver-payouts.ts` (new) |
| 7.2 | Build `DriverPayoutSummary` component | 7.1 | `components/features/drivers/DriverPayoutSummary.tsx` (new) |
| 7.3 | Create delivery report export functions | None | `lib/reports/export-delivery-reports.ts` (new) |
| 7.4 | Build GM delivery dashboard | Phase 3-6 | `app/(dashboard)/gm/deliveries/page.tsx` (new) |
| 7.5 | Build director logistics overview | Phase 3-6 | `app/(dashboard)/director/logistics/page.tsx` (new) |

### Phase 8: Notification Enhancements (Week 8)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 8.1 | Create new WhatsApp templates in Wati.io dashboard | None | External (Wati.io portal) |
| 8.2 | Implement `sendSMSFallback()` | None | `services/wati.ts` |
| 8.3 | Wire all new notification triggers | Phase 3, 5, 6 | Various event handlers |

### Phase 9: Testing (Week 8-9)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 9.1 | Write unit tests for all new business logic | Phase 1-7 | `__tests__/` directory |
| 9.2 | Write integration tests for delivery lifecycle | Phase 3 | `__tests__/integration/` |
| 9.3 | Write E2E tests for critical flows | Phase 1-8 | `tests/e2e/` |
| 9.4 | Performance testing (location updates at scale) | Phase 5 | Load test scripts |

### Phase 10: Polish & Documentation (Week 9-10)

| Step | Task | Dependencies | Files Affected |
|------|------|-------------|----------------|
| 10.1 | Update Firestore security rules | All phases | `firestore.rules` |
| 10.2 | Finalize all Firestore indexes | All phases | `firestore.indexes.json` |
| 10.3 | Create driver training materials | All phases | `docs/training/` |
| 10.4 | UAT with logistics team | All phases | N/A |

---

## 20. Open Questions & Risks

### 20.1 Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| Q1 | Should the 30 km/h average speed in `route-optimizer.ts` be replaced with Google Traffic-aware routing for all optimizations, or only when explicitly requested? | P1 - ETA accuracy | Jerry |
| Q2 | What is the SMS fallback provider for `sendSMSFallback()`? Africa's Talking vs Twilio vs other? | P1 - Notification reliability | Jerry |
| Q3 | Should driver location history be stored in a subcollection (current plan) or a separate top-level collection for easier querying? | P2 - Query performance | Jerry |
| Q4 | What is the maximum payout amount that can be auto-approved vs requiring GM approval? Spec says KES 10,000 -- confirm with client. | P1 - Payout workflow | Client |
| Q5 | Should failed delivery rescheduling respect customer time-window preferences, or default to same time next day? | P1 - Customer experience | Client |
| Q6 | Do we need offline-first capability for the driver app (service worker + local storage), or is persistent connectivity assumed? | P2 - Driver UX | Jerry |
| Q7 | Should the fleet map show historical routes (breadcrumb trail) or only current positions? | P2 - Logistics manager UX | Jerry |
| Q8 | Is the geofence radius (500m) appropriate for Nairobi traffic conditions, or should it be configurable per branch? | P1 - Notification accuracy | Client |

### 20.2 Technical Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Google Maps API cost escalation from frequent route re-optimization and ETA recalculation | Medium | High | Cache aggressively, use Haversine for ETA recalculation, only use Google API for initial optimization |
| R2 | Firestore write limits hit by frequent driver location updates (1 write per 15 sec per driver) | Low | High | Batch writes, consider RTDB for location data if >50 concurrent drivers |
| R3 | GPS accuracy issues in Nairobi (urban canyon effect, poor connectivity) | High | Medium | Use accuracy field to filter unreliable readings, increase stale threshold in poor-signal areas |
| R4 | Driver phone battery drain from continuous location reporting | Medium | Medium | Optimize update interval (15s when active, 60s when near stop), batch offline updates |
| R5 | Concurrent modification of delivery documents by driver and admin | Medium | Medium | Use Firestore transactions for all write operations, implement optimistic locking |
| R6 | WhatsApp template approval delays (Wati.io requires Meta approval for new templates) | Medium | Low | Submit templates early in implementation, have SMS fallback ready |
| R7 | Data migration disrupts active deliveries | Low | High | Run migration during off-hours, only add optional fields, no breaking changes |

### 20.3 Dependencies on External Teams

| Dependency | Team | Status | Risk |
|------------|------|--------|------|
| WhatsApp template approval for new templates | Wati.io / Meta | Not submitted | Medium -- 2-5 day approval cycle |
| Google Maps API quota increase request | Google Cloud | Not submitted | Low -- standard quota sufficient initially |
| SMS provider selection and integration | Internal | Decision pending (Q2) | Medium -- blocks notification fallback |
| Driver training materials and schedule | Operations | Not started | Low -- parallel to development |

---

## Appendix A: File Index

| Category | File Path | Status |
|----------|-----------|--------|
| **Database** | `c:\POS\lib\db\deliveries.ts` | Existing -- enhance |
| **Database** | `c:\POS\lib\db\driver-locations.ts` | Existing -- enhance |
| **Database** | `c:\POS\lib\db\schema.ts` | Existing -- extend interfaces |
| **Database** | `c:\POS\lib\db\audit-logs.ts` | Existing -- use as-is |
| **Database** | `c:\POS\lib\db\driver-profiles.ts` | NEW |
| **Database** | `c:\POS\lib\db\failed-deliveries.ts` | NEW |
| **Database** | `c:\POS\lib\db\delivery-notes.ts` | NEW |
| **Maps** | `c:\POS\lib\maps\route-optimizer.ts` | Existing -- enhance |
| **Maps** | `c:\POS\lib\maps\geocoding.ts` | Existing -- use as-is |
| **Maps** | `c:\POS\lib\maps\distance.ts` | Existing -- use as-is |
| **Maps** | `c:\POS\lib\maps\directions.ts` | Existing -- use as-is |
| **Maps** | `c:\POS\lib\maps\index.ts` | Existing -- extend exports |
| **Maps** | `c:\POS\lib\maps\geofence.ts` | NEW |
| **Maps** | `c:\POS\lib\maps\geocode-cache.ts` | NEW |
| **Maps** | `c:\POS\lib\maps\eta-calculator.ts` | NEW |
| **Classification** | `c:\POS\lib\delivery\classification.ts` | Existing -- enhance |
| **Business Logic** | `c:\POS\lib\delivery\driver-assignment.ts` | NEW |
| **Business Logic** | `c:\POS\lib\delivery\driver-performance.ts` | NEW |
| **Business Logic** | `c:\POS\lib\delivery\failed-delivery-handler.ts` | NEW |
| **Business Logic** | `c:\POS\lib\delivery\driver-payouts.ts` | NEW |
| **Business Logic** | `c:\POS\lib\delivery\transfer-discrepancy.ts` | NEW |
| **Reports** | `c:\POS\lib\reports\export-excel.ts` | Existing -- pattern reference |
| **Reports** | `c:\POS\lib\reports\export-delivery-reports.ts` | NEW |
| **Services** | `c:\POS\services\wati.ts` | Existing -- extend with new templates |
| **Components** | `c:\POS\components\features\deliveries\DeliveryTable.tsx` | Existing -- enhance |
| **Components** | `c:\POS\components\features\deliveries\DeliveryBatchForm.tsx` | Existing -- enhance |
| **Components** | `c:\POS\components\features\deliveries\RouteOptimizer.tsx` | Existing -- enhance |
| **Components** | `c:\POS\components\features\deliveries\DeliveryMapView.tsx` | Existing -- use as-is |
| **Components** | `c:\POS\components\features\deliveries\ActiveBatchesList.tsx` | Existing -- use as-is |
| **Components** | `c:\POS\components\features\deliveries\FailedDeliveryList.tsx` | NEW |
| **Components** | `c:\POS\components\features\deliveries\DeliveryTimelineView.tsx` | NEW |
| **Components** | `c:\POS\components\features\deliveries\TransferConfirmationForm.tsx` | NEW |
| **Components** | `c:\POS\components\features\customer\LiveDriverMap.tsx` | Existing -- enhance |
| **Components** | `c:\POS\components\features\customer\GeofenceIndicator.tsx` | NEW |
| **Components** | `c:\POS\components\features\drivers\DriverTransferBatchList.tsx` | Existing -- enhance |
| **Components** | `c:\POS\components\features\drivers\DriverPerformanceCard.tsx` | NEW |
| **Components** | `c:\POS\components\features\drivers\ProofOfDeliveryCapture.tsx` | NEW |
| **Components** | `c:\POS\components\features\drivers\FailureReasonDialog.tsx` | NEW |
| **Components** | `c:\POS\components\features\drivers\DriverPayoutSummary.tsx` | NEW |
| **Components** | `c:\POS\components\features\logistics\FleetMapView.tsx` | NEW |
| **Components** | `c:\POS\components\features\director\breakdowns\DeliveriesBreakdownContent.tsx` | Existing -- enhance |
| **Pages** | `c:\POS\app\(dashboard)\deliveries\page.tsx` | Existing -- enhance |
| **Pages** | `c:\POS\app\(dashboard)\logistics\page.tsx` | Existing -- fix + enhance |
| **Pages** | `c:\POS\app\(dashboard)\drivers\page.tsx` | Existing -- enhance |
| **Pages** | `c:\POS\app\(dashboard)\drivers\[deliveryId]\page.tsx` | Existing -- enhance |
| **Pages** | `c:\POS\app\(dashboard)\drivers\performance\page.tsx` | NEW |
| **Pages** | `c:\POS\app\(dashboard)\logistics\fleet\page.tsx` | NEW |
| **Pages** | `c:\POS\app\(dashboard)\gm\deliveries\page.tsx` | NEW |
| **Pages** | `c:\POS\app\(dashboard)\director\logistics\page.tsx` | NEW |
| **API** | `c:\POS\app\api\deliveries\classify\route.ts` | Existing |
| **API** | `c:\POS\app\api\deliveries\[deliveryId]\location\route.ts` | Existing -- extend with POST |
| **API** | `c:\POS\app\api\deliveries\[deliveryId]\reoptimize\route.ts` | NEW |
| **API** | `c:\POS\app\api\deliveries\[deliveryId]\stops\[orderId]\proof\route.ts` | NEW |
| **API** | `c:\POS\app\api\deliveries\[deliveryId]\stops\[orderId]\fail\route.ts` | NEW |
| **API** | `c:\POS\app\api\deliveries\failed\route.ts` | NEW |
| **API** | `c:\POS\app\api\deliveries\failed\[failedDeliveryId]\resolve\route.ts` | NEW |
| **API** | `c:\POS\app\api\deliveries\fleet\locations\route.ts` | NEW |
| **API** | `c:\POS\app\api\drivers\profiles\route.ts` | NEW |
| **API** | `c:\POS\app\api\drivers\[driverId]\performance\route.ts` | NEW |
| **API** | `c:\POS\app\api\drivers\[driverId]\status\route.ts` | NEW |
| **Config** | `c:\POS\firestore.rules` | Existing -- extend |
| **Config** | `c:\POS\firestore.indexes.json` | Existing -- extend |
| **Scripts** | `c:\POS\scripts\migrate-deliveries.ts` | NEW |
| **Scripts** | `c:\POS\scripts\seed-driver-profiles.ts` | NEW |

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **Batch** | A delivery batch is a single trip by a driver, containing one or more stops (orders) |
| **Stop** | An individual delivery destination within a batch |
| **TSP** | Traveling Salesman Problem -- the optimization problem solved by the route optimizer |
| **2-opt** | A local search algorithm that improves routes by reversing segments |
| **Nearest Neighbor** | A greedy TSP heuristic that always visits the closest unvisited stop |
| **Geofence** | A virtual boundary around a geographic location that triggers events when crossed |
| **Haversine** | A formula for calculating great-circle distances between two points on a sphere |
| **ETA** | Estimated Time of Arrival |
| **POD** | Proof of Delivery (photo + signature) |
| **Classification** | Categorization of a delivery as Small (Motorcycle) or Bulk (Van) |
| **Satellite Store** | A collection point (branch) that transfers orders to a main store for processing |
| **Transfer Note** | A document tracking the movement of garments between locations |
| **Payout** | Commission payment to a driver for completed deliveries |
| **Stale Location** | A driver location that has not been updated within the threshold (default 5 minutes) |

---

*End of Module 2 -- Driver & Logistics Feature Spec*
*Total Functional Requirements: 76 (FR-M2-001 through FR-M2-076)*
*New Files: 28 | Enhanced Files: 18 | Total Files Affected: 46*
