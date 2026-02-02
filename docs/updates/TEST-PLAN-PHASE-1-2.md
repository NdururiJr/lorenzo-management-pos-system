# Lorenzo POS System - Comprehensive Test Plan
## All Phases (1, 2, 3 & 4) + Production Readiness

**Document Version:** 2.2
**Last Updated:** January 24, 2026
**Author:** Jerry Ndururi in collaboration with AI Agents Plus

---

## EXECUTION SUMMARY (January 24, 2026)

### Scripts Executed Successfully

| Script | Status | What It Created |
|--------|--------|-----------------|
| `bootstrap-production.ts` | ✅ COMPLETED | Initial branch, company settings, 15 pricing rules, admin user |
| `seed-branches.ts` | ✅ COMPLETED | Updated all 21 branches with real Nairobi GPS coordinates |
| `seed-test-accounts.ts` | ✅ COMPLETED | 8 staff accounts + 2 customer accounts |

### Data Created in Firebase

**Branch:** KILIMANI_MAIN (Lorenzo Kilimani Main)
- Coordinates: -1.2921, 36.7896 (Real Nairobi location)

**Admin User:**
- Email: `admin@lorenzodrycleaner.com`
- Password: `Lorenzo2024!SecureAdmin`
- Role: Super Admin with all branch access

**Staff Test Accounts (all use password: `Test@1234`):**
- `admin@lorenzo.test` - Admin
- `director@lorenzo.test` - Director
- `gm@lorenzo.test` - General Manager
- `store_manager@lorenzo.test` - Store Manager
- `workstation_manager@lorenzo.test` - Workstation Manager
- `workstation_staff@lorenzo.test` - Workstation Staff
- `front_desk@lorenzo.test` - Front Desk
- `driver@lorenzo.test` - Driver

**Customer Test Accounts:**
- `+254700000001` / `Test@1234` - Regular customer
- `+254700000002` / `Test@1234` - VIP customer

**Pricing:** 15 garment types configured (Shirt, Pants, Dress, Suit, etc.)

**All 21 Branches:** Updated with real Nairobi GPS coordinates

---

### What YOU Need to Test Manually

| Test ID | What to Test | How to Test |
|---------|--------------|-------------|
| PR-002 | First user registration | Go to `/register`, create new account |
| PR-003 | First order creation | Login as `front_desk@lorenzo.test`, go to `/pos`, create order |
| PR-004 | Dashboard with no orders | Login, go to `/dashboard`, verify it loads without errors |
| PR-005 | Pipeline with no orders | Go to `/pipeline`, verify empty state shows |
| PR-010 to PR-017 | Director Dashboard pages | Login as `director@lorenzo.test`, visit each `/director/*` page |
| PR-030 to PR-033 | Empty State components | Visit pages with no data, verify proper messaging |
| PR-040 to PR-042 | Maps & Location | View branch on map, verify correct Nairobi location |
| PR-050 to PR-054 | Real-time updates | Open 2 browser tabs, create order in one, verify other updates |

### Quick Start Testing

```bash
# 1. Start the dev server (if not running)
npm run dev

# 2. Open browser to http://localhost:3000

# 3. Login with one of these accounts:
#    - Admin: admin@lorenzodrycleaner.com / Lorenzo2024!SecureAdmin
#    - Director: director@lorenzo.test / Test@1234
#    - Front Desk: front_desk@lorenzo.test / Test@1234

# 4. Test each page manually per the checklist above
```

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Production Readiness Testing](#2-production-readiness-testing)
3. [Test Accounts & Credentials](#3-test-accounts--credentials)
4. [Phase 1 Features Test Plan](#4-phase-1-features-test-plan)
5. [Phase 2 Features Test Plan](#5-phase-2-features-test-plan)
6. [API Endpoint Testing](#6-api-endpoint-testing)
7. [Integration Testing](#7-integration-testing)
8. [Regression Testing Checklist](#8-regression-testing-checklist)
9. [Known Issues & Workarounds](#9-known-issues--workarounds)
10. [Phase 3 Features Test Plan](#10-phase-3-features-test-plan)
11. [Phase 4 Features Test Plan](#11-phase-4-features-test-plan)

---

## 1. Test Environment Setup

### 1.1 Application URLs

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | `http://localhost:3000` | Local development testing |
| Staging | TBD | Pre-production testing |
| Production | TBD | Live system |

### 1.2 Starting the Application

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Build and verify no errors
npm run build
```

### 1.3 Firebase Project

- **Project ID:** `lorenzo-dry-cleaners-7302f`
- **Console:** https://console.firebase.google.com/project/lorenzo-dry-cleaners-7302f

### 1.4 Production Bootstrap (NEW)

Before first deployment to a new environment, run the bootstrap script:

```bash
# Initialize minimum required data for production
npx tsx scripts/bootstrap-production.ts
```

This creates:
- Initial branch (KILIMANI_MAIN) with real Nairobi coordinates
- Company settings document
- Default pricing for all garment types
- Admin user with proper Firebase claims

---

## 2. Production Readiness Testing

### 2.1 Empty Database Tests (CRITICAL)

These tests verify the system works correctly with NO seed data.

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| PR-001 | Bootstrap script | 1. Start with empty Firestore<br>2. Run `npx tsx scripts/bootstrap-production.ts`<br>3. Check Firestore | Branch, pricing, and settings created | ✅ **COMPLETED** |
| PR-002 | First user registration | 1. Navigate to `/register`<br>2. Create account | User created with branchId assigned | ⬜ **MANUAL** |
| PR-003 | First order creation | 1. Login as staff<br>2. Navigate to `/pos`<br>3. Create order | Order created successfully, pricing applied | ⬜ **MANUAL** |
| PR-004 | Dashboard with no orders | 1. Login<br>2. Navigate to `/dashboard` | Dashboard loads, shows "No data" states | ⬜ **MANUAL** |
| PR-005 | Pipeline with no orders | 1. Navigate to `/pipeline` | Shows empty state, no crash | ⬜ **MANUAL** |

### 2.2 Director Dashboard Tests (CRITICAL)

These pages were updated to show real data or appropriate empty states.

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| PR-010 | Financial page - no data | 1. Login as Director<br>2. Go to `/director/financial`<br>3. Verify display | Shows SetupRequired, not fake numbers | ⬜ |
| PR-011 | Financial page - with data | 1. Create orders with payments<br>2. Refresh financial page | Shows real revenue from transactions | ⬜ |
| PR-012 | Performance page - no data | 1. Go to `/director/performance` | Shows SetupRequired when <10 orders | ⬜ |
| PR-013 | Performance page - with data | 1. Create 10+ orders<br>2. Refresh page | Shows real KPI data grouped by month | ⬜ |
| PR-014 | Board page - no data | 1. Go to `/director/board` | Shows empty state for documents/meetings | ⬜ |
| PR-015 | Growth page - no data | 1. Go to `/director/growth` | Shows SetupRequired for expansion data | ⬜ |
| PR-016 | Leadership page - no data | 1. Go to `/director/leadership` | Shows SetupRequired, no fake manager scores | ⬜ |
| PR-017 | Leadership page - with users | 1. Create manager users<br>2. Refresh page | Shows real manager data from users collection | ⬜ |

### 2.3 Seed Data Validation Tests

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| PR-020 | Branch coordinates | 1. Run seed-branches.ts<br>2. Check coordinates in Firestore | Real Nairobi GPS coords, NOT (0,0) | ✅ **COMPLETED** |
| PR-021 | Order status values | 1. Run seed-test-orders.ts<br>2. Check order statuses | Uses 'queued_for_delivery' NOT 'ready' | ✅ **VERIFIED** (code uses correct status) |
| PR-022 | Branch ID validation | 1. Run seed-test-orders.ts<br>2. Check branchId values | Uses VILLAGE_MARKET (valid), NOT WESTLANDS | ✅ **VERIFIED** (code uses VILLAGE_MARKET) |
| PR-023 | Date range | 1. Run seed-test-orders.ts<br>2. Check order dates | Orders span 180 days for period comparisons | ✅ **VERIFIED** (code generates 180 days) |

### 2.4 Empty State UI Components

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| PR-030 | SetupRequired display | 1. Clear all data<br>2. Visit affected pages | SetupRequired component shows with action | ⬜ |
| PR-031 | NoDataAvailable display | 1. Visit pages with partial data | NoDataAvailable shows for missing metrics | ⬜ |
| PR-032 | Loading states | 1. Visit dashboard pages | Loading spinner shows during data fetch | ⬜ |
| PR-033 | Graceful fallbacks | 1. Test pages with incomplete data | No "NaN", "undefined", or crashes | ⬜ |

### 2.5 Maps & Location Tests

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| PR-040 | Branch map display | 1. View branch on map | Marker at correct Nairobi location | ⬜ |
| PR-041 | Delivery routing | 1. Create delivery batch<br>2. View route | Route calculated from real coordinates | ⬜ |
| PR-042 | Distance calculation | 1. Calculate delivery fee by distance | Realistic km values (not 0 or millions) | ⬜ |

> **Note:** Branch coordinate validation is covered by PR-020 and PR-022 in Section 2.3. These tests focus on runtime behavior rather than seed data validation.

### 2.6 Performance & Real-Time Tests (P1 - Before Launch)

**Source:** `docs/updates/PERFORMANCE-RECOMMENDATIONS-JAN22-2026.md`

These tests verify the system meets production performance requirements.

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| PR-050 | Real-time order updates | 1. Open GM Dashboard in Tab A<br>2. Create order in POS in Tab B<br>3. Observe Tab A | Dashboard updates within 2 seconds (not 15-60) | ⬜ |
| PR-051 | No manual refresh needed | 1. Open Pipeline board<br>2. Progress order to next stage in another tab | Pipeline updates automatically without refresh | ⬜ |
| PR-052 | Director KPI real-time | 1. Open Director Dashboard<br>2. Complete payment in POS | Revenue KPI updates within 5 seconds | ⬜ |
| PR-053 | Dashboard load time | 1. Clear browser cache<br>2. Login and navigate to Dashboard<br>3. Time until data displays | Page loads in < 3 seconds with 100+ orders | ⬜ |
| PR-054 | Firestore listener cleanup | 1. Navigate between pages rapidly<br>2. Check browser DevTools console | No "listener already exists" or memory leak warnings | ⬜ |

### 2.7 Performance Benchmarks (P2 - Within 30 Days)

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| PR-060 | Pre-computed aggregates exist | 1. Check Firestore for `dailyStats` collection | Collection exists with today's stats | ⬜ |
| PR-061 | Dashboard reads optimized | 1. Open Dashboard with DevTools Network tab<br>2. Count Firestore reads | Reads from `dailyStats` not raw `orders` | ⬜ |
| PR-062 | Toast notifications | 1. Open GM Dashboard<br>2. Create new order in POS | Toast notification appears for new order | ⬜ |
| PR-063 | High volume performance | 1. Seed 500 orders<br>2. Load GM Dashboard<br>3. Measure load time | Dashboard loads in < 5 seconds | ⬜ |

> **Reference:** See `docs/updates/PERFORMANCE-RECOMMENDATIONS-JAN22-2026.md` for implementation details.

---

## 3. Test Accounts & Credentials

### 3.1 Production Admin Account (Created by Bootstrap Script)

**Created by `bootstrap-production.ts`:**

| URL | Email | Password | Role | Notes |
|-----|-------|----------|------|-------|
| `/login` | `admin@lorenzodrycleaner.com` | `Lorenzo2024!SecureAdmin` | Super Admin | **Change password after first login!** |

### 3.2 Staff Test Accounts (Created by seed-test-accounts.ts)

**All accounts created with password: `Test@1234`**

| Email | Role | Branch | Status |
|-------|------|--------|--------|
| `admin@lorenzo.test` | Admin | All Branches | ✅ CREATED |
| `director@lorenzo.test` | Director | All Branches | ✅ CREATED |
| `gm@lorenzo.test` | General Manager | KILIMANI_MAIN | ✅ CREATED |
| `store_manager@lorenzo.test` | Store Manager | KILIMANI_MAIN | ✅ CREATED |
| `workstation_manager@lorenzo.test` | Workstation Manager | KILIMANI_MAIN | ✅ CREATED |
| `workstation_staff@lorenzo.test` | Workstation Staff | KILIMANI_MAIN | ✅ CREATED |
| `front_desk@lorenzo.test` | Front Desk | KILIMANI_MAIN | ✅ CREATED |
| `driver@lorenzo.test` | Driver | KILIMANI_MAIN | ✅ CREATED |

### 3.3 Customer Test Accounts (Created by seed-test-accounts.ts)

| Phone Number | Password | Segment | Status |
|--------------|----------|---------|--------|
| `+254700000001` | `Test@1234` | Regular | ✅ CREATED |
| `+254700000002` | `Test@1234` | VIP | ✅ CREATED |

### 3.4 Legacy Staff Accounts (Reference Only)

> **Note:** These accounts may not exist unless seed-milestone2.ts was run separately.

All staff accounts use password: **`Test@1234`**

| Email | Role | Branch | Testing Focus |
|-------|------|--------|---------------|
| `branch.manager@lorenzo.co.ke` | Branch Manager | Kilimani (HQ) | Branch operations, staff management |
| `front.desk@lorenzo.co.ke` | Front Desk | Kilimani (HQ) | Order creation, POS, payments |
| `workstation.manager@lorenzo.co.ke` | Workstation Manager | Kilimani (HQ) | Processing, quality control |
| `workstation.staff@lorenzo.co.ke` | Workstation Staff | Kilimani (HQ) | Stage operations |
| `satellite.staff@lorenzo.co.ke` | Satellite Staff | Village Market | Satellite operations, transfers |
| `driver@lorenzo.co.ke` | Driver | Kilimani (HQ) | Deliveries, route optimization |
| `director@lorenzo.co.ke` | Director | All Branches | Strategic dashboards, approvals |
| `gm@lorenzo.co.ke` | General Manager | All Branches | GM dashboard, operations |

### 3.5 Role-Based Access Matrix

| Feature/Page | Super Admin | Director | GM | Branch Mgr | Front Desk | Workstation | Driver | Customer |
|--------------|:-----------:|:--------:|:--:|:----------:|:----------:|:-----------:|:------:|:--------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| POS | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Pipeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Workstation | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Deliveries | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pricing Mgmt | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Director Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Customer Portal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Phase 1 Features Test Plan

### 4.1 FR-002: Redo Items Policy Management

**Feature Description:** Track and manage items that need to be re-processed due to quality issues.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR002-01 | Create redo item | 1. Navigate to Quality Check station<br>2. Select completed order<br>3. Click "Create Redo"<br>4. Fill redo reason and details<br>5. Submit | Redo item created with link to parent order | ⬜ |
| FR002-02 | View redo metrics | 1. Login as Branch Manager<br>2. Navigate to Dashboard<br>3. Check Redo Metrics widget | Shows redo count, rate, and trends | ⬜ |
| FR002-03 | Track redo history | 1. Open order with redo<br>2. Check order history tab | Shows redo creation and resolution timeline | ⬜ |
| FR002-04 | Redo notification | 1. Create redo item<br>2. Check notifications | Relevant staff receives redo notification | ⬜ |

#### API Endpoints to Test

```bash
# Create redo item
POST /api/redo-items
Content-Type: application/json
{
  "orderId": "ORD-KLM-20260120-0001",
  "garmentId": "ORD-KLM-20260120-0001-G01",
  "reason": "stain_not_removed",
  "notes": "Customer reported stain still visible"
}

# Get redo items for order
GET /api/redo-items?orderId=ORD-KLM-20260120-0001

# Get redo metrics
GET /api/redo-items/metrics?branchId=kilimani&period=30d
```

---

### 4.2 FR-003: Defect Notification Timelines

**Feature Description:** Configurable deadlines for notifying customers about garment defects.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR003-01 | Configure timeline | 1. Login as Branch Manager<br>2. Go to Settings > Notifications<br>3. Set defect notification deadline (e.g., 24 hours)<br>4. Save | Timeline saved successfully | ⬜ |
| FR003-02 | Trigger notification | 1. Create order with defect noted<br>2. Wait for deadline<br>3. Check notification log | Customer notified before deadline | ⬜ |
| FR003-03 | Escalation alert | 1. Create defect without resolution<br>2. Approach deadline<br>3. Check staff notifications | Staff receives escalation warning | ⬜ |
| FR003-04 | Override timeline | 1. Mark defect as "Contacted"<br>2. Check notification status | Deadline timer paused/cancelled | ⬜ |

#### API Endpoints to Test

```bash
# Get notification timelines
GET /api/defect-notifications/timelines

# Update timeline configuration
PUT /api/defect-notifications/timelines
{
  "branchId": "kilimani",
  "deadlineHours": 24,
  "escalationHours": 20
}

# Get pending defect notifications
GET /api/defect-notifications?status=pending
```

---

### 4.3 FR-004: QC to Customer Service Handover

**Feature Description:** Formal handover process from Quality Control to Customer Service for issue resolution.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR004-01 | Create handover | 1. Login as QC staff<br>2. Complete quality check with issue<br>3. Click "Escalate to CS"<br>4. Fill handover form<br>5. Submit | Handover created and visible in CS queue | ⬜ |
| FR004-02 | View CS queue | 1. Login as Customer Service<br>2. Navigate to Handover Queue<br>3. View pending items | All pending handovers displayed | ⬜ |
| FR004-03 | Accept handover | 1. Select handover from queue<br>2. Click "Accept"<br>3. Add notes | Handover status updated, timestamp recorded | ⬜ |
| FR004-04 | Resolve handover | 1. Contact customer<br>2. Record resolution<br>3. Complete handover | Handover marked complete, order updated | ⬜ |

---

### 4.4 FR-008: Order Status Terminology Update

**Feature Description:** Updated order status labels for clarity.

#### Status Mapping

| Old Status | New Status | Display Label |
|------------|------------|---------------|
| `ready` | `queued_for_delivery` | "Queued for Delivery" |
| `out_for_delivery` | `out_for_delivery` | "Out for Delivery" |
| `delivered` | `delivered` | "Delivered" |
| `collected` | `collected` | "Collected" |

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR008-01 | Status display | 1. Create order through full cycle<br>2. Check status at each stage | New status labels displayed correctly | ⬜ |
| FR008-02 | Pipeline board | 1. Navigate to Pipeline<br>2. Check column headers | "Queued for Delivery" column visible | ⬜ |
| FR008-03 | Customer portal | 1. Login as customer<br>2. View order status | Customer sees updated status labels | ⬜ |
| FR008-04 | Notifications | 1. Progress order to "Queued for Delivery"<br>2. Check notification | Notification uses new terminology | ⬜ |

> **Note:** Seed data validation for status values is covered by PR-021 in Section 2.3

---

### 4.5 FR-016: Legacy Data Migration

**Feature Description:** Tools to migrate data from previous systems.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR016-01 | Import validation | 1. Prepare CSV with legacy data<br>2. Upload to migration tool<br>3. Run validation | Validation report shows errors/warnings | ⬜ |
| FR016-02 | Data transformation | 1. Upload valid legacy data<br>2. Preview transformations<br>3. Confirm mappings | Data correctly mapped to new schema | ⬜ |
| FR016-03 | Import execution | 1. Run import<br>2. Monitor progress<br>3. Verify imported records | Records created in Firestore | ⬜ |
| FR016-04 | Rollback capability | 1. Run import<br>2. Identify issue<br>3. Execute rollback | Imported records removed cleanly | ⬜ |

---

## 5. Phase 2 Features Test Plan

### 5.1 FR-005: Partial & Advance Payment Handling

**Feature Description:** Support for partial payments and advance deposits on orders.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR005-01 | Advance payment | 1. Create order (total: KES 5,000)<br>2. Accept KES 2,000 advance<br>3. Complete order | Order shows partial payment status | ⬜ |
| FR005-02 | Balance calculation | 1. View order with partial payment<br>2. Check balance display | Balance = Total - Paid shown correctly | ⬜ |
| FR005-03 | Final payment | 1. Order ready for collection<br>2. Process remaining balance<br>3. Complete payment | Order marked as fully paid | ⬜ |
| FR005-04 | Payment history | 1. View order details<br>2. Check payment history tab | All payment transactions listed | ⬜ |
| FR005-05 | Multiple payments | 1. Create order<br>2. Make 3 partial payments<br>3. Verify totals | All payments tracked, total correct | ⬜ |

#### API Endpoints to Test

```bash
# Process partial payment
POST /api/payments
{
  "orderId": "ORD-KLM-20260120-0001",
  "amount": 2000,
  "method": "mpesa",
  "type": "advance"
}

# Get payment history for order
GET /api/payments?orderId=ORD-KLM-20260120-0001

# Get pending balances
GET /api/payments/pending?branchId=kilimani
```

---

### 5.2 FR-006: Front Desk to Workstation Routing

**Feature Description:** Automatic routing of orders from front desk to appropriate workstation based on services selected.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR006-01 | Auto-routing | 1. Create order with "Dry Clean" service<br>2. Submit order<br>3. Check workstation queue | Order appears in correct workstation queue | ⬜ |
| FR006-02 | Multi-service routing | 1. Create order with multiple services<br>2. Submit order<br>3. Verify routing | Order routed to first service station | ⬜ |
| FR006-03 | Priority routing | 1. Create "Express" order<br>2. Submit order<br>3. Check queue position | Express order prioritized in queue | ⬜ |
| FR006-04 | Branch transfer routing | 1. Create order at satellite<br>2. Submit order<br>3. Verify transfer batch | Order grouped for transfer to main | ⬜ |

---

### 5.3 FR-007: Inter-Branch Sorting Timelines

**Feature Description:** Configurable timelines for sorting and transferring orders between branches.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR007-01 | Configure timeline | 1. Login as Branch Manager<br>2. Go to Settings > Transfers<br>3. Set sorting deadline (e.g., 4 hours)<br>4. Save | Timeline saved successfully | ⬜ |
| FR007-02 | Deadline tracking | 1. Create transfer batch<br>2. Wait for deadline approach<br>3. Check dashboard | Warning displayed for approaching deadline | ⬜ |
| FR007-03 | Overdue alerts | 1. Let sorting deadline pass<br>2. Check notifications | Alert sent to branch manager | ⬜ |
| FR007-04 | Complete before deadline | 1. Create transfer batch<br>2. Complete sorting early<br>3. Mark as ready | No deadline alerts triggered | ⬜ |

#### API Endpoints to Test

```bash
# Get sorting timelines
GET /api/transfers/timelines

# Update sorting timeline
PUT /api/transfers/timelines
{
  "sourceBranchId": "VILLAGE_MARKET",
  "destinationBranchId": "KILIMANI_MAIN",
  "sortingDeadlineHours": 4,
  "transferDeadlineHours": 8
}

# Get overdue transfers
GET /api/transfers/overdue
```

---

### 5.4 FR-014: Foreign Phone Number Support

**Feature Description:** Support for international phone numbers in customer registration.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR014-01 | UK number | 1. Register customer<br>2. Enter `+44 7911 123456`<br>3. Submit | Number accepted and formatted | ⬜ |
| FR014-02 | US number | 1. Register customer<br>2. Enter `+1 555 123 4567`<br>3. Submit | Number accepted and formatted | ⬜ |
| FR014-03 | Invalid number | 1. Register customer<br>2. Enter `12345`<br>3. Submit | Validation error displayed | ⬜ |
| FR014-04 | Country detection | 1. Enter number with country code<br>2. Check display | Country flag shown correctly | ⬜ |
| FR014-05 | Local format | 1. Enter Kenyan number without +254<br>2. Check formatting | Auto-formatted to +254XXXXXXXXX | ⬜ |

#### Supported Number Formats

| Country | Format | Example |
|---------|--------|---------|
| Kenya | +254 XXX XXXXXX | +254 712 345 678 |
| UK | +44 XXXX XXXXXX | +44 7911 123456 |
| US | +1 XXX XXX XXXX | +1 555 123 4567 |
| Tanzania | +255 XXX XXX XXX | +255 712 345 678 |
| Uganda | +256 XXX XXX XXX | +256 712 345 678 |

---

### 5.5 FR-015: Load-Based Pricing

**Feature Description:** Pricing based on weight (per kg) or quantity, in addition to per-item pricing.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR015-01 | Per-kg pricing | 1. Create order for "Laundry by Weight"<br>2. Enter weight: 5kg<br>3. View price | Price = Rate per kg × 5 | ⬜ |
| FR015-02 | Minimum charge | 1. Enter weight: 0.5kg<br>2. Check price calculation | Minimum charge applied if below threshold | ⬜ |
| FR015-03 | Hybrid pricing | 1. Select "Mixed Load"<br>2. Enter items + weight<br>3. View breakdown | Both per-item and per-kg charges shown | ⬜ |
| FR015-04 | Price display | 1. Configure load-based service<br>2. View POS | Per-kg rate displayed clearly | ⬜ |

#### API Endpoints to Test

```bash
# Create load-based pricing
POST /api/pricing
{
  "serviceId": "laundry-by-weight",
  "name": "Laundry by Weight",
  "pricingType": "per_kg",
  "ratePerKg": 200,
  "minimumKg": 2,
  "minimumCharge": 400
}

# Calculate order price
POST /api/pricing/calculate
{
  "services": [
    { "serviceId": "laundry-by-weight", "weightKg": 5 },
    { "serviceId": "dry-clean-suit", "quantity": 2 }
  ]
}

# Get pricing for service
GET /api/pricing/laundry-by-weight
```

---

### 5.6 FR-017: Customer Segmentation

**Feature Description:** Automatic customer segmentation into Regular, VIP, and Corporate tiers.

#### VIP Qualification Criteria

A customer qualifies for VIP status if they meet **either** of these criteria within the last 12 months:
- **10+ orders** placed
- **KES 50,000+** total spend

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR017-01 | VIP by orders | 1. Create customer with 10+ orders<br>2. Trigger segment evaluation<br>3. Check segment | Customer promoted to VIP | ⬜ |
| FR017-02 | VIP by spend | 1. Create customer with KES 50,000+ spend<br>2. Trigger segment evaluation<br>3. Check segment | Customer promoted to VIP | ⬜ |
| FR017-03 | Regular status | 1. Create new customer<br>2. Check segment | Customer is "Regular" | ⬜ |
| FR017-04 | Corporate link | 1. Link customer to corporate agreement<br>2. Trigger evaluation<br>3. Check segment | Customer shows as "Corporate" | ⬜ |
| FR017-05 | Segment badge | 1. View customer in POS<br>2. Check segment display | VIP/Corporate badge visible | ⬜ |
| FR017-06 | Statistics update | 1. Complete order for customer<br>2. Check customer statistics | Order count and total spend updated | ⬜ |

#### API Endpoints to Test

```bash
# Evaluate customer segment
POST /api/customers/segmentation
{
  "action": "evaluate",
  "customerId": "cust_123"
}

# Update customer statistics
POST /api/customers/segmentation
{
  "action": "update_statistics",
  "customerId": "cust_123"
}

# Batch evaluate all customers
POST /api/customers/segmentation
{
  "action": "batch_evaluate"
}

# Get VIP customers
GET /api/customers?segment=vip

# Get customer statistics
GET /api/customers/cust_123/statistics
```

#### Segment Definitions

| Segment | Criteria | Benefits |
|---------|----------|----------|
| Regular | Default for all new customers | Standard pricing, standard service |
| VIP | 10+ orders OR KES 50K+ in 12 months | Priority processing, dedicated support |
| Corporate | Linked to corporate agreement | Contract pricing, account billing |

---

## 6. API Endpoint Testing

### 6.1 Phase 1 Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/redo-items` | POST | Create redo item | Staff |
| `/api/redo-items` | GET | List redo items | Staff |
| `/api/redo-items/metrics` | GET | Get redo metrics | Manager |
| `/api/defect-notifications` | GET | List defect notifications | Staff |
| `/api/defect-notifications/timelines` | GET/PUT | Manage timelines | Manager |
| `/api/qc-handovers` | POST | Create handover | QC Staff |
| `/api/qc-handovers` | GET | List handovers | Staff |

### 6.2 Phase 2 Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/payments` | POST | Process payment | Staff |
| `/api/payments/pending` | GET | Get pending balances | Staff |
| `/api/transfers/timelines` | GET/PUT | Manage sort timelines | Manager |
| `/api/transfers/overdue` | GET | Get overdue transfers | Manager |
| `/api/pricing` | POST/PUT | Manage pricing | Manager |
| `/api/pricing/calculate` | POST | Calculate order price | Staff |
| `/api/customers/segmentation` | POST | Segment evaluation | Staff |

---

## 7. Integration Testing

### 7.1 Payment Flow Integration

```
1. Create Order →
2. Accept Advance Payment →
3. Process Through Pipeline →
4. Complete Final Payment →
5. Verify Transaction Records
```

**Test Steps:**
1. Create order (KES 5,000 total)
2. Accept advance (KES 2,000 via M-Pesa)
3. Verify order status shows "Partial Payment"
4. Complete order processing
5. Collect remaining balance (KES 3,000 via Card)
6. Verify:
   - Order marked "Paid"
   - Two transaction records exist
   - Transaction totals match order total
   - Receipt shows both payments

### 7.2 Customer Segmentation Integration

```
1. New Customer Created →
2. Place Multiple Orders →
3. Automatic Segment Evaluation →
4. VIP Status Applied →
5. Benefits Visible in POS
```

**Test Steps:**
1. Create new customer
2. Verify segment = "Regular"
3. Create 10 orders for customer
4. Trigger segment evaluation
5. Verify segment = "VIP"
6. Open customer in POS
7. Verify VIP badge displayed

### 7.3 Inter-Branch Transfer Integration

```
1. Order at Satellite →
2. Auto-Group for Transfer →
3. Driver Assignment →
4. Transfer to Main →
5. Process at Main →
6. Return to Satellite →
7. Customer Collection
```

**Test Steps:**
1. Login as Satellite staff (Village Market)
2. Create order
3. Verify auto-transfer batch creation
4. Check sorting timeline starts
5. Complete sorting before deadline
6. Verify driver assignment
7. Track transfer status
8. Confirm receipt at main branch
9. Process order
10. Return transfer to satellite
11. Customer collects

### 7.4 Director Dashboard Data Flow (NEW)

```
1. Empty Database →
2. Run Bootstrap Script →
3. Create Test Orders →
4. Verify Director Pages →
5. Check Real Data Display
```

**Test Steps:**
1. Start with empty Firestore
2. Run `npx tsx scripts/bootstrap-production.ts`
3. Login as Director
4. Navigate to `/director/financial` - verify SetupRequired shows
5. Create 5 orders via POS with payments
6. Refresh Financial page - verify real revenue displays
7. Navigate to `/director/leadership` - verify real manager data
8. Verify no hardcoded fake numbers (like "92% performance")

---

## 8. Regression Testing Checklist

After implementing Phase 1 & 2 features, verify these existing features still work:

### 8.1 Core POS Functions

- [ ] Create new customer
- [ ] Search existing customer
- [ ] Add garments to order
- [ ] Apply pricing correctly
- [ ] Process cash payment
- [ ] Process M-Pesa payment
- [ ] Generate receipt PDF
- [ ] Print receipt

### 8.2 Pipeline Functions

- [ ] View pipeline board
- [ ] Drag order between stages
- [ ] View order details modal
- [ ] Update order status
- [ ] Filter by branch
- [ ] Search orders
- [ ] "Queued for Delivery" column displays correctly

### 8.3 Customer Portal

- [ ] Customer login (OTP)
- [ ] View order history
- [ ] Track current order
- [ ] Update profile
- [ ] Request pickup

### 8.4 Reports

- [ ] Daily sales report
- [ ] Branch performance
- [ ] Staff productivity
- [ ] Export to CSV/PDF

### 8.5 Director Dashboard (NEW)

> **See Section 2.2** for detailed Director Dashboard test cases (PR-010 through PR-017).
> This section is a quick regression checklist referencing those tests.

- [ ] PR-010 to PR-017 pass (see Section 2.2)
- [ ] No "NaN" or fake hardcoded values displayed

---

## 9. Known Issues & Workarounds

### 9.1 Build Warnings

The build produces warnings that do not affect functionality:

| Warning | Location | Impact |
|---------|----------|--------|
| Unused variable `activeDevices` | biometric-devices/page.tsx:434 | None - future feature |
| Unused imports | Multiple director pages | None - cleanup needed |
| Missing useEffect dependency | Multiple pages | None - intentional pattern |

### 9.2 CSS Warning

```
@import rules must precede all rules aside from @charset and @layer statements
```

**Location:** `globals.css` - Google Fonts import
**Impact:** None - styling works correctly
**Fix:** Move @import to top of file (low priority)

### 9.3 Test Data Requirements

Some features require seed data to test properly. The updated seed scripts now include:

- **Real Nairobi coordinates** for all 21 branches
- **180 days of order history** for period comparisons
- **'queued_for_delivery' status** instead of deprecated 'ready'
- **Valid branch IDs** (VILLAGE_MARKET instead of WESTLANDS)

```bash
# Bootstrap production (empty database)
npx tsx scripts/bootstrap-production.ts

# Seed test data
npx tsx scripts/seed-branches.ts
npx tsx scripts/seed-test-orders.ts
npx tsx scripts/seed-milestone2.ts
```

### 9.4 Director Dashboard Placeholders

Some Director pages intentionally show placeholder data for future AI features:

| Page | Status | Notes |
|------|--------|-------|
| `/director/ai-lab` | Placeholder | Future AI scenario builder |
| `/director/insights` | Placeholder | Future OpenAI integration |
| `/director/risk` | Placeholder | Future compliance tracking |
| `/director/intelligence` | Placeholder | Future market analysis |

These are marked with "// Mock data - In production, fetch from API/Firestore" comments.

---

## 10. Phase 3 Features Test Plan

### 10.1 FR-001: Automated Quotation System

**Feature Description:** Create professional quotations that can be sent to customers and converted to orders.

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR001-01 | Create quotation | 1. Login as Front Desk<br>2. Navigate to Quotations<br>3. Click "New Quotation"<br>4. Select customer<br>5. Add items with services<br>6. Save as draft | Quotation created with ID format QT-[BRANCH]-[DATE]-[####] | ⬜ |
| FR001-02 | Calculate totals | 1. Create quotation with multiple items<br>2. Check subtotal and total | Totals calculated correctly | ⬜ |
| FR001-03 | Send quotation | 1. Open draft quotation<br>2. Click "Send to Customer"<br>3. Confirm WhatsApp send | Status changes to "sent", customer receives WhatsApp | ⬜ |
| FR001-04 | Accept quotation | 1. Open sent quotation<br>2. Click "Mark as Accepted" | Status changes to "accepted" | ⬜ |
| FR001-05 | Convert to order | 1. Open accepted quotation<br>2. Click "Convert to Order"<br>3. Confirm conversion | Order created with quotation items, quotation marked "converted" | ⬜ |
| FR001-06 | Reject quotation | 1. Open sent quotation<br>2. Click "Mark as Rejected" | Status changes to "rejected" | ⬜ |
| FR001-07 | Quotation expiry | 1. Create quotation with 7-day validity<br>2. Check after validity period | Status changes to "expired" | ⬜ |

#### API Endpoints to Test

```bash
# Create quotation
POST /api/quotations
Authorization: Bearer <token>
Content-Type: application/json
{
  "customerId": "CUST-001",
  "branchId": "KILIMANI_MAIN",
  "items": [
    {
      "garmentType": "Suit",
      "quantity": 2,
      "services": ["dry_clean", "iron"],
      "unitPrice": 600,
      "totalPrice": 1200
    }
  ],
  "validityDays": 7
}

# List quotations
GET /api/quotations?branchId=KILIMANI_MAIN&status=draft

# Get single quotation
GET /api/quotations/QT-KLM-20260120-0001

# Update quotation
PUT /api/quotations/QT-KLM-20260120-0001
{
  "items": [...],
  "notes": "Updated pricing"
}

# Send quotation
POST /api/quotations/QT-KLM-20260120-0001/send

# Convert to order
POST /api/quotations/QT-KLM-20260120-0001/convert
```

---

### 10.2 FR-009: Driver Payment Processing

**Feature Description:** Calculate and process driver commissions with M-Pesa disbursement.

#### Commission Rule Types

| Type | Description | Example |
|------|-------------|---------|
| `per_delivery` | Fixed amount per delivery | KES 100 per delivery |
| `percentage` | Percentage of delivery value | 10% of order total |
| `tiered` | Rate varies by delivery count | 1-10: KES 80, 11-20: KES 100, 21+: KES 120 |

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR009-01 | Create commission rule | 1. Login as Admin<br>2. Go to Settings > Commission Rules<br>3. Create per_delivery rule (KES 100) | Rule created and active | ⬜ |
| FR009-02 | Calculate payout (per delivery) | 1. Driver completes 15 deliveries<br>2. Calculate payout | Payout = 15 × 100 = KES 1,500 | ⬜ |
| FR009-03 | Calculate payout (tiered) | 1. Configure tiered rule<br>2. Driver completes 25 deliveries | Payout uses correct tier rates | ⬜ |
| FR009-04 | Apply bonus | 1. Set bonus threshold (20 deliveries)<br>2. Driver completes 25 deliveries | Bonus amount added to payout | ⬜ |
| FR009-05 | Process M-Pesa payout | 1. Approve calculated payout<br>2. Process disbursement | M-Pesa sent, status = "completed" | ⬜ |
| FR009-06 | View payout history | 1. Go to Driver Settlements<br>2. Select driver | All past payouts displayed | ⬜ |

#### API Endpoints to Test

```bash
# Create commission rule
POST /api/admin/commission-rules
{
  "branchId": "ALL",
  "name": "Standard Driver Commission",
  "commissionType": "per_delivery",
  "baseAmount": 100,
  "bonusThreshold": 20,
  "bonusAmount": 500,
  "active": true
}

# Calculate driver payout
POST /api/drivers/driver-001/calculate-payout
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-15"
}

# Process payout
POST /api/admin/driver-payouts
{
  "driverId": "driver-001",
  "amount": 1500,
  "paymentMethod": "mpesa",
  "deliveryIds": ["DEL-001", "DEL-002", ...]
}

# Get payout history
GET /api/drivers/driver-001/payouts
```

---

### 10.3 FR-012: Payment Report Filtering & Export

**Feature Description:** Enhanced transaction filtering with Excel and PDF export capabilities.

#### Available Filters

| Filter | Description |
|--------|-------------|
| Date Range | Custom start/end dates |
| Branch | Filter by branch |
| Payment Method | cash, mpesa, card, pesapal, customer_credit |
| Payment Status | pending, completed, failed, refunded |
| Amount Range | Min/Max amount |

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR012-01 | Filter by date range | 1. Go to Transactions<br>2. Set custom date range<br>3. Apply filter | Only transactions in range shown | ⬜ |
| FR012-02 | Filter by payment method | 1. Select "M-Pesa" filter<br>2. Apply | Only M-Pesa transactions shown | ⬜ |
| FR012-03 | Filter by amount range | 1. Set min: 1000, max: 5000<br>2. Apply | Only transactions in range shown | ⬜ |
| FR012-04 | Export to CSV | 1. Apply filters<br>2. Click Export > CSV | CSV file downloaded with filtered data | ⬜ |
| FR012-05 | Export to Excel | 1. Apply filters<br>2. Click Export > Excel | Excel file with transactions + summary sheet | ⬜ |
| FR012-06 | Export to PDF | 1. Apply filters<br>2. Click Export > PDF | PDF report with header, summary, and table | ⬜ |
| FR012-07 | Clear filters | 1. Apply multiple filters<br>2. Click "Clear Filters" | All filters reset, full data shown | ⬜ |

---

### 10.4 FR-013: Free Delivery Automation

**Feature Description:** Automatic delivery fee calculation based on configurable rules.

#### Default Delivery Fee Rules

| Rule | Priority | Condition | Fee |
|------|----------|-----------|-----|
| VIP Free Delivery | 100 | Customer segment = VIP | Free |
| Corporate Free Delivery | 95 | Customer segment = Corporate | Free |
| High Value Order | 80 | Order ≥ KES 5,000 | Free |
| Medium Value Order | 70 | Order ≥ KES 2,500 | KES 100 |
| Distance-Based | 50 | Up to 50km | KES 20/km (min 200, max 1000) |
| Standard Delivery | 10 | Default | KES 200 |

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR013-01 | VIP free delivery | 1. Create order for VIP customer<br>2. Check delivery fee | Fee = 0, reason shows "VIP Free Delivery" | ⬜ |
| FR013-02 | High value free delivery | 1. Create order total ≥ KES 5,000<br>2. Check delivery fee | Fee = 0, reason shows "High Value Order" | ⬜ |
| FR013-03 | Medium value reduced | 1. Create order KES 2,500-4,999<br>2. Check delivery fee | Fee = KES 100 | ⬜ |
| FR013-04 | Standard delivery | 1. Create order < KES 2,500 for regular customer<br>2. Check delivery fee | Fee = KES 200 | ⬜ |
| FR013-05 | Create custom rule | 1. Go to Settings > Delivery Fees<br>2. Create new rule with conditions | Rule saved and active | ⬜ |
| FR013-06 | Rule priority | 1. Create overlapping rules<br>2. Test order matching both | Higher priority rule applied | ⬜ |

#### API Endpoints to Test

```bash
# Calculate delivery fee
POST /api/orders/calculate-delivery-fee
Authorization: Bearer <token>
{
  "branchId": "KILIMANI_MAIN",
  "orderAmount": 3500,
  "customerSegment": "regular",
  "distanceKm": 8
}

# Response
{
  "success": true,
  "data": {
    "fee": 100,
    "isFree": false,
    "ruleApplied": "DFRULE-xxx",
    "ruleName": "Medium Value Order - Reduced Delivery",
    "feeType": "fixed",
    "reason": "Medium Value Order - Reduced Delivery"
  }
}

# List delivery fee rules
GET /api/admin/delivery-fee-rules?branchId=KILIMANI_MAIN

# Create delivery fee rule
POST /api/admin/delivery-fee-rules
{
  "branchId": "ALL",
  "name": "Weekend Free Delivery",
  "priority": 90,
  "conditions": {
    "minOrderAmount": 2000,
    "daysOfWeek": [0, 6]
  },
  "feeCalculation": {
    "type": "free",
    "value": 0
  },
  "active": true
}
```

---

## 11. Phase 4 Features Test Plan

### 11.1 FR-010: Home Cleaning System Access (SSO)

**Feature Description:** Single Sign-On integration with external Home Cleaning system.

#### Role-Based Access

| Role | Can Access Home Cleaning | Can Access Corporate Portal |
|------|--------------------------|----------------------------|
| Director | ✅ | ✅ |
| General Manager | ✅ | ✅ |
| Store Manager | ✅ | ❌ |
| Branch Manager | ✅ | ❌ |
| Front Desk | ❌ | ❌ |
| Driver | ❌ | ❌ |

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR010-01 | Generate SSO token | 1. Login as Director<br>2. Call generate-token API | Valid token returned with correct user info | ⬜ |
| FR010-02 | Token validation | 1. Generate token<br>2. Validate via API | Validation succeeds, user data returned | ⬜ |
| FR010-03 | Token expiry | 1. Generate token<br>2. Wait for expiry (1 hour)<br>3. Validate | Validation fails with "Token expired" | ⬜ |
| FR010-04 | Role access - allowed | 1. Login as Director<br>2. Request home_cleaning access | Token generated successfully | ⬜ |
| FR010-05 | Role access - denied | 1. Login as Front Desk<br>2. Request home_cleaning access | 403 error - access denied | ⬜ |
| FR010-06 | Link account | 1. Call link-account API<br>2. Provide external user ID | Link created and active | ⬜ |
| FR010-07 | Unlink account | 1. Call DELETE link-account<br>2. Specify system | Link status = "revoked" | ⬜ |

#### API Endpoints to Test

```bash
# Generate SSO token
POST /api/auth/sso/generate-token
Authorization: Bearer <firebase-token>
{
  "targetSystem": "home_cleaning"
}

# Response
{
  "success": true,
  "data": {
    "token": "base64-encoded-token",
    "url": "https://homecleaning.lorenzo.co.ke/auth/sso/callback?token=...",
    "expiresAt": 1737417600,
    "targetSystem": "home_cleaning",
    "systemName": "Home Cleaning System"
  }
}

# Validate SSO token
POST /api/auth/sso/validate
{
  "token": "base64-encoded-token",
  "expectedSystem": "home_cleaning"
}

# Quick validation
GET /api/auth/sso/validate?token=base64-encoded-token

# Link account
POST /api/auth/sso/link-account
Authorization: Bearer <firebase-token>
{
  "externalSystem": "home_cleaning",
  "externalUserId": "HC-USER-123",
  "externalUsername": "john@homecleaning.co.ke"
}

# Get user's links
GET /api/auth/sso/link-account

# Unlink account
DELETE /api/auth/sso/link-account
{
  "externalSystem": "home_cleaning"
}
```

---

### 11.2 FR-011: Loyalty Points System

**Feature Description:** Customer loyalty program with points earning, tiers, and redemption.

#### Tier Structure

| Tier | Points Required | Discount | Free Delivery | Other Benefits |
|------|-----------------|----------|---------------|----------------|
| Bronze | 0 | 0% | ❌ | Base earning rate |
| Silver | 500 | 5% | Orders > 2000 KES | - |
| Gold | 2,000 | 10% | ✅ Always | Priority processing |
| Platinum | 5,000 | 15% | ✅ Always | Birthday gift, all benefits |

#### Points Earning

| Action | Points | Notes |
|--------|--------|-------|
| Order Completed | 1 per 10 KES | Base rate |
| Birthday Month | 2x multiplier | Double points |
| Referral | 500 points | When referred customer completes first order |
| Welcome Bonus | 200 points | On enrollment |

#### Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| FR011-01 | Create loyalty program | 1. Login as Admin<br>2. Go to Loyalty > Programs<br>3. Create program with tiers | Program created with 4 tiers | ⬜ |
| FR011-02 | Enroll customer | 1. Select customer<br>2. Enroll in loyalty program | Customer enrolled as Bronze, gets 200 welcome points | ⬜ |
| FR011-03 | Award points on order | 1. Complete order for enrolled customer<br>2. Check loyalty balance | Points added: orderAmount ÷ 10 | ⬜ |
| FR011-04 | Tier upgrade | 1. Customer reaches 500 points<br>2. Check tier | Tier upgraded to Silver | ⬜ |
| FR011-05 | Redeem points | 1. Customer has 1000 points<br>2. Redeem 500 points at checkout | 500 points deducted, discount applied | ⬜ |
| FR011-06 | Insufficient balance | 1. Customer has 100 points<br>2. Try to redeem 500 | Redemption rejected, error message | ⬜ |
| FR011-07 | Birthday bonus | 1. Set customer birthday<br>2. Complete order in birthday month | Points earned at 2x rate | ⬜ |
| FR011-08 | View points history | 1. Open customer loyalty page<br>2. Check transaction history | All point transactions listed with reasons | ⬜ |
| FR011-09 | Tier benefits | 1. Create order for Gold customer<br>2. Check delivery fee | Free delivery applied automatically | ⬜ |

#### API Endpoints to Test

```bash
# Create loyalty program
POST /api/loyalty/programs
Authorization: Bearer <token>
{
  "name": "Lorenzo Rewards",
  "branchId": "ALL",
  "pointsPerKES": 10,
  "minPointsToRedeem": 100,
  "pointsToKESRatio": 10,
  "active": true
}

# Get customer loyalty status
GET /api/loyalty/customers/CUST-001

# Response
{
  "success": true,
  "data": {
    "loyaltyId": "LOY-xxx",
    "customerId": "CUST-001",
    "programId": "PROG-xxx",
    "totalPointsEarned": 1250,
    "totalPointsRedeemed": 200,
    "currentBalance": 1050,
    "currentTier": {
      "name": "Silver",
      "discountPercentage": 5,
      "freeDeliveryThreshold": 2000
    }
  }
}

# Enroll customer
POST /api/loyalty/customers/CUST-001
{
  "programId": "PROG-xxx",
  "birthday": "1990-05-15"
}

# Award points
POST /api/loyalty/customers/CUST-001/points
{
  "action": "award",
  "points": 350,
  "reason": "order_completed",
  "orderId": "ORD-xxx"
}

# Redeem points
POST /api/loyalty/customers/CUST-001/points
{
  "action": "redeem",
  "points": 500,
  "reason": "checkout_discount",
  "orderId": "ORD-xxx"
}

# Get transaction history
GET /api/loyalty/transactions?customerId=CUST-001&limit=50

# Response
{
  "success": true,
  "data": [...],
  "summary": {
    "totalEarned": 1250,
    "totalRedeemed": 200,
    "totalExpired": 0,
    "totalBonus": 200
  },
  "count": 15
}
```

---

## 12. Integration Testing - All Phases

### 12.1 Full Order Lifecycle with Loyalty

```
1. Customer enrolls in loyalty program →
2. Customer places order (gets welcome bonus) →
3. Order processed through pipeline →
4. Delivery fee calculated (free for VIP) →
5. Points awarded on completion →
6. Tier upgrade check →
7. Customer redeems points on next order →
8. Verify discount applied
```

### 12.2 Quotation to Order Flow

```
1. Staff creates quotation →
2. Send quotation via WhatsApp →
3. Customer accepts quotation →
4. Convert to order →
5. Process order normally →
6. Points awarded →
7. Driver delivers →
8. Commission calculated
```

### 12.3 Driver Settlement Flow

```
1. Driver completes multiple deliveries →
2. Settlement period ends →
3. Calculate payout with commission rules →
4. Apply bonuses if threshold met →
5. Process M-Pesa disbursement →
6. Record transaction →
7. Notify driver
```

---

## 13. Phase 3 & 4 Regression Checklist

After implementing Phase 3 & 4 features, verify these existing features still work:

### 13.1 Core Features

- [ ] POS order creation still works
- [ ] Pipeline status updates work
- [ ] Payment processing (all methods) works
- [ ] Customer portal accessible
- [ ] Notifications sending

### 13.2 Phase 1 & 2 Features

- [ ] Redo items creation works
- [ ] Defect notifications trigger
- [ ] QC handover process works
- [ ] Partial payments still function
- [ ] Inter-branch transfers work
- [ ] Customer segmentation updates correctly
- [ ] Load-based pricing calculates correctly
- [ ] Foreign phone numbers validate

### 13.3 Production Readiness (NEW)

> **See Section 2** for detailed Production Readiness tests and **Appendix D** for pre-deployment checklist.
> This section provides quick regression verification.

- [ ] Section 2.1 Empty Database Tests pass (PR-001 to PR-005)
- [ ] Section 2.2 Director Dashboard Tests pass (PR-010 to PR-017)
- [ ] Section 2.3 Seed Data Validation passes (PR-020 to PR-023)
- [ ] Section 2.6 Performance & Real-Time Tests pass (PR-050 to PR-054) **P1 BEFORE LAUNCH**
- [ ] Section 2.7 Performance Benchmarks pass (PR-060 to PR-063) **P2 within 30 days**

---

## Appendix A: Quick Test Commands

```bash
# Run build to verify no errors
npm run build

# Start development server
npm run dev

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Bootstrap production (empty database) ✅ RAN ON JAN 24, 2026
npx tsx scripts/bootstrap-production.ts

# Seed branches with real coordinates ✅ RAN ON JAN 24, 2026
npx tsx scripts/seed-branches.ts

# Seed test accounts ✅ RAN ON JAN 24, 2026
npx tsx scripts/seed-test-accounts.ts

# Optional: Seed test orders (if you need sample orders)
npx tsx scripts/seed-test-orders.ts

# Optional: Seed milestone 2 data
npx tsx scripts/seed-milestone2.ts
```

### Scripts Already Executed (January 24, 2026)

The following scripts have been executed and their data is in Firebase:

1. **`bootstrap-production.ts`** - Created KILIMANI_MAIN branch, admin user, 15 pricing rules
2. **`seed-branches.ts`** - Updated all 21 branches with real Nairobi coordinates
3. **`seed-test-accounts.ts`** - Created 8 staff accounts + 2 customer accounts

---

## Appendix B: Debugging Tips

### Check API Response
Open browser DevTools (F12) → Network tab → Filter by "api"

### Check Firebase Data
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Browse collections

### Check Auth State
Open browser DevTools → Application → Storage → IndexedDB → firebaseLocalStorageDb

### Clear Cache
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
// Reload page
```

### Verify Branch Coordinates
Check that branch coordinates are real Nairobi locations, not (0,0):
```bash
# In Firebase Console, check branches collection
# Each branch should have coordinates like:
# VILLAGE_MARKET: { lat: -1.2294, lng: 36.8036 }
```

---

## Appendix C: Contact Information

For issues during testing:

- **Development Team:** Jerry Ndururi in collaboration with AI Agents Plus
- **Technical Lead:** Gachengoh Marugu (+254 725 462 859)
- **Product Manager:** Jerry Nduriri (jerry@ai-agentsplus.com)

---

## Appendix D: Production Readiness Checklist

Before deploying to production, verify all tests in **Section 2: Production Readiness Testing**.

### Quick Reference (Cross-references to Section 2)

| Category | Tests | Section | Priority |
|----------|-------|---------|----------|
| Bootstrap & Data | PR-001 to PR-003 | 2.1 | P0 |
| Director Dashboard | PR-010 to PR-017 | 2.2 | P0 |
| Seed Data Validation | PR-020 to PR-023 | 2.3 | P0 |
| Empty State Components | PR-030 to PR-033 | 2.4 | P0 |
| Maps & Locations | PR-040 to PR-042 | 2.5 | P0 |
| **Performance & Real-Time** | PR-050 to PR-054 | 2.6 | **P1** |
| **Performance Benchmarks** | PR-060 to PR-063 | 2.7 | P2 |

### Final Sign-off

- [ ] All PR-xxx tests marked ✅ in Section 2
- [ ] No JavaScript errors in console on any page
- [ ] TypeScript build succeeds (`npm run build`)

---

## Appendix E: Execution Log (January 24, 2026)

### Bootstrap Production Script Output

```
LORENZO DRY CLEANERS - PRODUCTION BOOTSTRAP

✓ Firebase Admin initialized with service account

📍 Creating initial branch...
   ✓ Created: Lorenzo Kilimani Main
   ✓ Coordinates: -1.2921, 36.7896

⚙️  Creating company settings...
   ✓ Created company settings
   • Company: Lorenzo Dry Cleaners
   • Currency: KES
   • Default turnaround: 24 hours

💰 Creating default pricing...
   ✓ Created: 15 pricing rules
   ✓ Total: 15 garment types configured

👤 Creating admin user...
   ✓ Created new user: AbGUm1lBazMgVp7aOOvRXd5rnO52
   ✓ Created/updated user document in Firestore
   ✓ Set Firebase Auth custom claims
   • Email: admin@lorenzodrycleaner.com
   • Role: admin (Super Admin)
   • Branch Access: ALL BRANCHES

✅ BOOTSTRAP COMPLETE!
```

### Seed Branches Script Output

```
✓ Updated: Village Market Courtyard
✓ Updated: Westgate Mall 2nd Floor
✓ Updated: Dennis Pritt Rd
... (all 21 branches)
✅ Seed completed - 21 branches updated with real Nairobi coordinates
```

### Seed Test Accounts Script Output

```
✓ Created admin user: admin@lorenzo.test
✓ Created director user: director@lorenzo.test
✓ Created gm user: gm@lorenzo.test
✓ Created store_manager user: store_manager@lorenzo.test
✓ Created workstation_manager user: workstation_manager@lorenzo.test
✓ Created workstation_staff user: workstation_staff@lorenzo.test
✓ Created front_desk user: front_desk@lorenzo.test
✓ Created driver user: driver@lorenzo.test
✓ Created customer user: +254700000001
✓ Created VIP customer: +254700000002
✅ All test accounts created successfully
```

---

**End of Test Plan Document**
