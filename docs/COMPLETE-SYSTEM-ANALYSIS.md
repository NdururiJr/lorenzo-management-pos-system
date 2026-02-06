# Order-to-Dashboard Data Flow Analysis

## Overview

**Question:** When an order is created, how does it reflect on the GM and Director dashboards? Is this accurately captured?

---

## Executive Summary

### Current Architecture

| Aspect | Status | Assessment |
|--------|--------|------------|
| Order Creation | ✅ Working | Orders stored correctly in Firestore |
| GM Dashboard Visibility | ⚠️ Delayed | 15-60 second polling latency |
| Director Dashboard Visibility | ⚠️ Delayed | 30-60 second polling + 1min cache |
| Real-time Updates | ❌ Missing | No Firestore listeners used |
| Pre-computed Aggregations | ❌ Missing | All calculations done on-demand |

### Key Finding
**Orders DO reflect on dashboards, but with 15-60 second delay due to polling architecture. No real-time listeners are used.**

---

## 1. Order Creation Flow

### Entry Point
**File:** `app/(dashboard)/pos/page.tsx` - Lines 240-372

### Data Stored
```typescript
{
  orderId: "ORD-[BRANCH]-[YYYYMMDD]-[####]",
  customerId, customerName, customerPhone,
  branchId,
  status: 'received',
  garments: [...],
  totalAmount, paidAmount: 0, paymentStatus: 'pending',
  estimatedCompletion,
  statusHistory: [{ status: 'received', timestamp, updatedBy }],
  collectionMethod, returnMethod,
  createdAt, updatedAt, createdBy
}
```

### Post-Creation Actions
1. **Customer stats updated:** `incrementCustomerStats(customerId, totalAmount)`
2. **Notifications triggered:** `notifyOrderCreated()` (fire-and-forget)
3. **Firebase Function:** `onOrderCreated` trigger logs analytics

---

## 2. GM Dashboard Data Flow

### Data Source
**File:** `hooks/useGMDashboard.ts`

### Refresh Intervals
| Metric | Interval | Data Source |
|--------|----------|-------------|
| Live Order Queue | 15 seconds | `orders` collection |
| Today's Orders | 30 seconds | `orders` where createdAt >= today |
| Urgent Issues | 30 seconds | `issues` collection |
| Staff On Duty | 1 minute | `attendance` + `users` |
| Revenue | 1 minute | `transactions` collection |
| Branch Performance | 1 minute | Multiple queries per branch |
| Turnaround | 2 minutes | `orders` (completed) |
| Equipment | 2 minutes | `equipment` collection |
| Satisfaction | 5 minutes | `customerFeedback` |

### How New Orders Appear

1. **Live Order Queue** (fastest - 15s):
   - Queries: `orders WHERE status NOT IN [delivered, collected, cancelled]`
   - New order appears within 15 seconds

2. **Today's Orders Count** (30s):
   - Queries: `orders WHERE createdAt >= startOfDay`
   - Increments count within 30 seconds

3. **Pipeline Stats** (on-demand):
   - Calculated from filtered orders by status
   - Shows in pipeline board when page refreshes

### Query Pattern (Direct Firestore)
```typescript
// No pre-computed aggregations
const todayOrders = await getDocs(
  query(collection(db, 'orders'),
    where('createdAt', '>=', startOfDay),
    where('createdAt', '<=', endOfDay)
  )
);
// Count, filter, calculate in JavaScript
```

---

## 3. Director Dashboard Data Flow

### Data Sources

#### A. Client-Side (DirectorKPICards)
**File:** `components/features/director/DirectorKPICards.tsx`

| Metric | Query | Refresh |
|--------|-------|---------|
| Revenue | `transactions WHERE status='completed'` | 60 seconds |
| Orders | `orders WHERE createdAt in range` | 60 seconds |
| AOV | Calculated from revenue/orders | 60 seconds |
| Retention | `customers` - filter by orderCount | 60 seconds |

#### B. Server-Side API
**Endpoint:** `GET /api/analytics/director/insights`
- 1-minute cache header
- Aggregates: orders, transactions, customers, equipment, issues
- Generates: risks, drivers, recommendations, health score

### How New Orders Appear

1. **Order Count KPI** (60s):
   - Increments within 1 minute of creation

2. **Revenue KPI** (60s + payment):
   - Only shows after payment transaction created
   - Transaction must have `status='completed'`

3. **API Insights** (1min cache):
   - Re-fetches after cache expires
   - Calculates completion rate, risk detection

---

## 4. Gap Analysis

### What IS Captured ✅

| Data Point | GM Dashboard | Director Dashboard |
|------------|--------------|-------------------|
| New order count | ✅ Yes (30s) | ✅ Yes (60s) |
| Order in queue | ✅ Yes (15s) | ❌ No (strategic view) |
| Pipeline status | ✅ Yes (on refresh) | ❌ No |
| Branch filtering | ✅ Yes | ✅ Yes |
| Today vs yesterday trend | ✅ Yes | ✅ Yes |

### What is NOT Captured ❌

| Missing Feature | Impact | Dashboard |
|-----------------|--------|-----------|
| Real-time order creation notification | Staff unaware of new orders for 15-60s | Both |
| Pre-computed daily aggregates | Expensive queries on every refresh | Both |
| Order creation webhook to dashboards | No push notification | Both |
| Historical trend storage | Recalculates on every view | Director |
| Revenue by hour tracking | Can't see peak times | Both |

### Latency Issues

```
Order Created → Firestore Write → [15-60 second wait] → Dashboard Poll → Display

Timeline:
0s     - Order created in Firestore
0-15s  - GM Live Queue still shows old data
15s    - GM Live Queue refreshes (order appears)
30s    - GM Today's Orders count updates
60s    - Director KPIs update
60s    - API Insights cache expires (if called)
```

---

## 5. Recommendations

### Priority 1: Add Real-Time Listeners (High Impact)

**Current:** Polling every 15-60 seconds
**Proposed:** Firestore `onSnapshot` listeners for critical data

```typescript
// Example: Real-time order count
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'orders'), where('createdAt', '>=', startOfDay)),
    (snapshot) => {
      setTodayOrderCount(snapshot.size);
    }
  );
  return unsubscribe;
}, []);
```

**Files to modify:**
- `hooks/useGMDashboard.ts` - Add real-time listeners
- `components/features/director/DirectorKPICards.tsx` - Add listeners

### Priority 2: Pre-Computed Daily Aggregates (Medium Impact)

**Problem:** Every dashboard refresh queries ALL orders for the day
**Solution:** Cloud Function that updates daily stats on order create

**New collection:** `dailyStats/{branchId}_{date}`
```typescript
{
  branchId: string,
  date: '2025-01-21',
  orderCount: number,
  revenue: number,
  completedCount: number,
  avgTurnaround: number,
  lastUpdated: timestamp
}
```

**Trigger:** `onOrderCreated` function increments counters atomically

### Priority 3: Dashboard Notifications (Low Impact)

**Add toast notifications** when new orders arrive:
- Use Firestore listener on `orders` collection
- Show toast: "New order received: ORD-MAIN-20250121-0045"

---

## 6. Critical Files

### Order Creation
- `app/(dashboard)/pos/page.tsx`:240-372
- `lib/db/orders.ts` - `createOrder()` function

### GM Dashboard
- `hooks/useGMDashboard.ts` - All data fetching
- `lib/db/gm-dashboard.ts` - Query functions
- `app/(dashboard)/gm/page.tsx` - Dashboard UI

### Director Dashboard
- `components/features/director/DirectorKPICards.tsx`
- `app/api/analytics/director/insights/route.ts`
- `app/(dashboard)/director/page.tsx`

### Triggers
- `functions/src/triggers/orders.ts` - `onOrderCreated`

---

## 7. Verification Steps

To verify current behavior:

1. **Create test order in POS**
2. **Open GM Dashboard** in separate tab
   - Watch "Live Order Queue" - should appear within 15s
   - Watch "Today's Orders" counter - should increment within 30s
3. **Open Director Dashboard** in separate tab
   - Watch "Total Orders" KPI - should increment within 60s
4. **Complete payment** for the order
   - GM Dashboard revenue should update within 60s
   - Director Dashboard revenue should update within 60s

---

## 8. Conclusion

**Is order data accurately captured on dashboards?**

✅ **YES** - Orders are accurately captured and displayed
⚠️ **BUT** - With 15-60 second delay due to polling architecture

**Recommended improvements:**
1. Add Firestore real-time listeners for instant updates
2. Implement pre-computed daily aggregates for performance
3. Add visual notifications for new orders

The current architecture works correctly but could be optimized for real-time responsiveness.

---

## PART 2: Director Dashboard Metrics Accuracy Analysis

### The Message in Question

```
"Good afternoon. Overall business health is needs attention (Score: 59/100).
Revenue is currently 52% below forecast which requires attention.
Customer retention has improved by 8.9% due to proactive engagement and quality service.
Premium services are performing well at 5% above target."
```

---

## 9. Where This Message Is Generated

**File:** `components/features/director/ExecutiveNarrative.tsx`

**Component:** `ExecutiveNarrative` - displays "Morning Briefing" / "Executive Narrative"

**Data Source:** Real Firestore queries via TanStack Query (useQuery hook)

---

## 10. Health Score Calculation (59/100)

### Formula (Weighted)

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Revenue vs Target | 35% | `(revenue / revenueTarget) × 100` capped at 100 |
| Order Growth | 20% | `50 + growth%`, clamped 0-100 |
| Customer Retention | 20% | Direct percentage (0-100) |
| On-Time Delivery | 15% | `(onTime / completed) × 100` |
| Premium Services | 10% | `(premiumRate / 20%) × 100` capped at 100 |

### Label Assignment
- ≥85: "strong"
- 70-84: "good"
- <70: "needs attention" ← **59 falls here**

### Is It Accurate?
⚠️ **PARTIALLY** - The calculation formula is correct, but inputs have issues (see below)

---

## 11. "52% Below Forecast" Calculation

### How It's Calculated
```typescript
revenueTarget = previousPeriodRevenue × 1.10  // 10% growth expectation - HARDCODED
revenueVariance = (currentRevenue / revenueTarget) × 100 - 100
```

### The Problem

**Seeded Data Reality:**
- Total seeded transactions: **1,760 KES** (only 4 transactions)
- Branch daily targets: **1,065,000 KES** total (21 branches × 25K-80K each)

**Mismatch Analysis:**
- If comparing to branch `dailyTarget`: 1,760 / 50,000 = 3.5% of target → **96.5% below**
- If comparing to previous period: Previous period likely has 0 or minimal data → **massive variance**

### Is It Accurate?
❌ **NO** - The "52% below forecast" is based on:
1. Hardcoded 10% growth expectation (not actual forecast)
2. Previous period revenue that may be $0 or minimal in seeded data
3. Mismatch between seeded order data and branch targets

---

## 12. "Customer Retention Improved by 8.9%" Calculation

### How It's Calculated
```typescript
// Current period customers who also ordered in previous period
const returningCustomers = currentCustomers.filter(c => previousCustomers.has(c));
const currentRetention = (returningCustomers.length / currentCustomers.size) × 100;

// PROBLEM: Previous retention is HARDCODED
const previousRetention = 80;  // ← LINE 273 - NOT FROM DATABASE!

const retentionChange = currentRetention - previousRetention;
```

### Seeded Data Reality
- Total customers seeded: **16**
- Repeat customers: **Almost none** (most have 1 order each)
- Previous period customers: Likely **0** (orders are recent)

### Is It Accurate?
❌ **NO** - The 8.9% improvement is:
1. Compared against **hardcoded 80%** baseline, not actual previous retention
2. Seeded customers mostly have single orders (no repeat business)
3. No historical order data to calculate real retention

---

## 13. "Premium Services 5% Above Target" Calculation

### How It's Calculated
```typescript
// Count orders with premium/specialty/express services
const premiumOrders = orders.filter(o =>
  o.garments?.some(g =>
    g.services?.some(s =>
      s.includes('premium') || s.includes('specialty') || s.includes('express')
    )
  )
);

const premiumRate = (premiumOrders.length / totalOrders) × 100;
const premiumTarget = 20;  // ← HARDCODED 20% target

const premiumVariance = premiumRate - premiumTarget;
```

### Seeded Data Reality
- Seeded orders have services like: "washing", "ironing", "starch", "express"
- Some orders include "express" service (counted as premium)
- Target is hardcoded at 20%

### Is It Accurate?
⚠️ **PARTIALLY** - The calculation is correct but:
1. Target (20%) is hardcoded, not configurable
2. Depends on seeded order service types matching keywords

---

## 14. Seeded Data vs Dashboard Expectations

### What's Actually Seeded

| Data Type | Count | Total Value | Source Script |
|-----------|-------|-------------|---------------|
| Orders | 28 | 5,470 KES | seed-test-orders, seed-milestone2, create-dev-customer |
| Transactions | 4 | 1,760 KES | seed-milestone2 only |
| Customers | 16 | - | Various scripts |
| Branches | 21 | 1,065,000 KES daily target | seed-branches |
| Feedback | ~50 | ~4.0 avg rating | seed-customer-feedback |

### Critical Data Gaps

| Gap | Impact on Dashboard |
|-----|---------------------|
| **Branch ID mismatch** | Orders use "WESTLANDS", "MAIN" but branches use "VILLAGE_MARKET", "WESTGATE" |
| **Missing transactions** | 24+ orders have no payment transactions |
| **No repeat customers** | Retention calculation will be 0% or near-zero |
| **No historical data** | Previous period comparisons fail |
| **Hardcoded baselines** | 80% retention, 20% premium, 10% growth all fake |

---

## 15. Root Causes of Inaccurate Metrics

### Issue 1: Hardcoded Comparison Values

**Location:** `ExecutiveNarrative.tsx`

```typescript
// Line 273 - Should query actual previous retention
const previousRetention = 80;  // HARDCODED!

// Line 288 - Should be from branch/company config
const premiumTarget = 20;  // HARDCODED!

// Line 242 - Should be actual forecast/budget
const revenueTarget = previousRevenue * 1.10;  // HARDCODED 10% growth!
```

### Issue 2: Branch ID Inconsistency

**seed-branches.ts uses:**
- VILLAGE_MARKET, WESTGATE, WATERFRONT_KAREN, DENNIS_PRITT, etc.

**seed-test-orders.ts uses:**
- WESTLANDS (not in branch seed!)

**seed-milestone2.ts uses:**
- MAIN, BR-MAIN-001 (not in branch seed!)

**Result:** Dashboard queries for branch targets return nothing or defaults

### Issue 3: Incomplete Transaction Seeding

- Only 4 transactions seeded for 28 orders
- Revenue metrics use `transactions` collection
- Most seeded revenue is invisible to dashboards

### Issue 4: No Historical Data

- All orders created in last 7 days
- Previous period (week/month ago) has **zero data**
- Comparison calculations produce meaningless results

---

## 16. Recommendations to Fix

### Priority 1: Remove Hardcoded Values

**Files to modify:**
- `components/features/director/ExecutiveNarrative.tsx`

**Changes:**
```typescript
// Replace hardcoded previousRetention with actual calculation
const previousRetention = previousCustomers.size > 0
  ? calculateActualRetention(previousOrders, olderOrders)
  : null;  // Show "No baseline data" instead of fake 80%

// Replace hardcoded premiumTarget with branch config
const premiumTarget = branch?.premiumServiceTarget || company?.defaultPremiumTarget || 20;

// Replace hardcoded growth expectation with actual forecast
const revenueTarget = branch?.monthlyForecast || (previousRevenue * 1.10);
```

### Priority 2: Fix Branch ID Consistency

**Files to modify:**
- `scripts/seed-test-orders.ts` - Use branch IDs from seed-branches.ts
- `scripts/seed-milestone2.ts` - Use consistent branch IDs

**Or create mapping:**
```typescript
const branchMapping = {
  'WESTLANDS': 'KILELESHWA',  // Map to actual seeded branch
  'MAIN': 'VILLAGE_MARKET',
};
```

### Priority 3: Seed Complete Transaction Data

**Add to seed scripts:**
```typescript
// For every order with paidAmount > 0, create transaction
for (const order of orders) {
  if (order.paidAmount > 0) {
    await createTransaction({
      orderId: order.orderId,
      amount: order.paidAmount,
      status: 'completed',
      // ...
    });
  }
}
```

### Priority 4: Seed Historical Data

**Add to seed scripts:**
- Create orders from 30, 60, 90 days ago
- Create corresponding transactions
- Create customer activity history
- This enables meaningful comparisons

### Priority 5: Add "No Data" Handling

**In ExecutiveNarrative.tsx:**
```typescript
if (previousPeriodOrders.length === 0) {
  return {
    narrative: "Insufficient historical data for comparison. " +
               `Current period has ${currentOrders.length} orders.`,
    healthScore: null,  // Don't show misleading score
  };
}
```

---

## 17. Files Requiring Changes

| File | Changes Needed |
|------|----------------|
| `components/features/director/ExecutiveNarrative.tsx` | Remove hardcoded values, add data validation |
| `lib/db/schema.ts` | Add `premiumServiceTarget`, `monthlyForecast` to Branch |
| `scripts/seed-branches.ts` | Add forecast/target fields |
| `scripts/seed-test-orders.ts` | Use consistent branch IDs, add historical orders |
| `scripts/seed-milestone2.ts` | Use consistent branch IDs |
| `hooks/useGMDashboard.ts` | Add null checks for missing data |
| `components/features/director/DirectorKPICards.tsx` | Handle zero/null data gracefully |

---

## 18. Verification After Fixes

1. **Re-seed database** with consistent branch IDs and historical data
2. **Check Executive Narrative** shows accurate or "no data" messages
3. **Verify health score** reflects actual metrics (not hardcoded baselines)
4. **Confirm revenue comparison** uses actual previous period data
5. **Test retention calculation** with known repeat customer data
6. **Validate premium services** calculation matches order services

---

## 19. Summary

### Current State: ❌ Metrics Are NOT Accurate

| Metric | Status | Reason |
|--------|--------|--------|
| Health Score (59/100) | ⚠️ Misleading | Based on flawed inputs |
| Revenue -52% | ❌ Inaccurate | Hardcoded 10% growth, no real forecast |
| Retention +8.9% | ❌ Inaccurate | Compared to hardcoded 80%, not real data |
| Premium +5% | ⚠️ Partially OK | Calculation correct, target hardcoded |

### Root Causes

1. **Hardcoded baseline values** instead of database queries
2. **Inconsistent branch IDs** between seeds
3. **Missing transaction records** for orders
4. **No historical data** for period comparisons
5. **No graceful handling** of missing/zero data

### Recommended Approach

1. First, fix the data consistency issues (branch IDs, transactions)
2. Then, replace hardcoded values with database queries
3. Add proper "no data available" messaging
4. Seed historical data for meaningful comparisons
5. Add configurable targets to branch/company settings

---

## PART 3: GM Dashboard Accuracy Issues

### 20. Critical Issues - Random/Fake Values

#### Issue 20.1: Staff Productivity (Performance Page) - CRITICAL
**File:** `app/(dashboard)/gm/performance/page.tsx` lines 132-141

```typescript
const staffProductivity = 75 + Math.floor(Math.random() * 20);  // 75-94%
```

**Problem:** Uses `Math.random()` - completely fabricated data, changes on every page load.

---

#### Issue 20.2: Equipment Utilization (Performance Page) - CRITICAL
**File:** `app/(dashboard)/gm/performance/page.tsx` line 135

```typescript
const equipmentUtilization = 70 + Math.floor(Math.random() * 25);  // 70-94%
```

**Problem:** Uses `Math.random()` - no connection to actual equipment data.

---

#### Issue 20.3: Customer Satisfaction (Performance Page) - CRITICAL
**File:** `app/(dashboard)/gm/performance/page.tsx` line 141

```typescript
const customerSatisfaction = 80 + Math.floor(Math.random() * 15);  // 80-94%
```

**Problem:** Uses `Math.random()` despite `customerFeedback` collection existing with real data.

---

#### Issue 20.4: Branch Efficiency Score - CRITICAL
**File:** `app/(dashboard)/gm/performance/page.tsx` lines 65-79

**Formula:**
```typescript
efficiency = (turnaroundScore × 0.25) +
             (staffProductivity × 0.25) +    // RANDOM!
             (equipmentUtilization × 0.20) + // RANDOM!
             (revenueAchievement × 0.20) +
             (customerSatisfaction × 0.10)   // RANDOM!
```

**Problem:** 55% of the efficiency formula uses random data. The entire score is meaningless.

---

### 21. Equipment Page Issues

#### Issue 21.1: Utilization Fallback to Random
**File:** `app/(dashboard)/gm/equipment/page.tsx` line 101

```typescript
utilizationRate: data.utilizationRate || Math.floor(Math.random() * 40) + 60  // 60-99%
```

**Problem:** When data missing, generates random 60-99% instead of showing "No data".

---

#### Issue 21.2: Hours Today Fallback to Random
**File:** `app/(dashboard)/gm/equipment/page.tsx` line 104

```typescript
hoursToday: data.hoursToday || Math.floor(Math.random() * 8)  // 0-7 hours
```

**Problem:** Generates random hours when actual tracking doesn't exist.

---

#### Issue 21.3: Hardcoded Mock Equipment List
**File:** `app/(dashboard)/gm/equipment/page.tsx` lines 109-171

When `equipment` collection doesn't exist, falls back to hardcoded mock data with 6 equipment items. No indication to user that data is simulated.

---

### 22. Staff Page Issues

#### Issue 22.1: Oversimplified Productivity Formula
**File:** `app/(dashboard)/gm/staff/page.tsx` line 155

```typescript
productivity: Math.min(100, ordersCompleted * 12)
```

**Problem:**
- Assumes 1 order = 8.3% productivity (12 orders = 100%)
- Ignores quality, complexity, time spent
- If seeded orders lack `createdBy` field, all staff show 0%

---

#### Issue 22.2: Attendance Field Name Mismatch
**File:** `app/(dashboard)/gm/staff/page.tsx` line 111

```typescript
if (data.userId && !data.clockOut) {
```

**Problem:** Code expects `userId` but attendance records may use `employeeId` or `uid`.

---

### 23. Revenue & Target Issues

#### Issue 23.1: Hardcoded Default Revenue Target
**File:** `lib/db/gm-dashboard.ts` lines 146-178

```typescript
const DEFAULT_TARGET = 50000;  // KES - hardcoded fallback
```

**Problem:** If branch lacks `dailyTarget`, defaults to 50,000 KES. All metrics compare against this assumption.

---

#### Issue 23.2: Hardcoded Default Turnaround Target
**File:** `lib/db/gm-dashboard.ts` lines 272-309

```typescript
const DEFAULT_TURNAROUND = 24;  // hours - hardcoded fallback
```

**Problem:** If branch lacks `targetTurnaroundHours`, defaults to 24 hours.

---

### 24. Component Display Issues

#### Issue 24.1: GMDashboardHeader - Hardcoded Mock Branches
**File:** `components/dashboard/gm/GMDashboardHeader.tsx` lines 59-63

```typescript
const branches = [
  { id: 'all', name: 'All Branches' },
  { id: 'BR-MAIN-001', name: 'Kilimani Main Store' },
  { id: 'BR-SAT-001', name: 'Westlands Satellite' },
];
```

**Problem:** Branch dropdown is hardcoded, not fetched from Firestore. Users can't filter by actual branches.

---

#### Issue 24.2: No Bounds Checking on Scores
**Files:** Multiple components

- `GMMetricsRow.tsx`: Satisfaction score can be >5 or <0
- `GMBranchPerformance.tsx`: Target progress can be negative or >100%
- `GMStaffOnDuty.tsx`: Rating can be any number, not validated 0-5

---

#### Issue 24.3: NaN Handling in Utilization
**File:** `components/dashboard/gm/GMEquipmentStatus.tsx` lines 178-181

```typescript
const utilizationPercent = card.total > 0
  ? Math.round((card.running / card.total) * 100)
  : 0;
```

**Problem:** If `card.running` is undefined, result is `NaN`. Color coding breaks.

---

### 25. Status & Schema Mismatches

#### Issue 25.1: Order Status Values Mismatch
**File:** `app/(dashboard)/gm/orders/page.tsx` lines 36-41

Code checks for statuses like `'pressing'` and `'sorting'` which don't exist in the schema.

---

#### Issue 25.2: Equipment Status Type Mismatch

- Page interface expects: `'operational' | 'maintenance' | 'offline'`
- Type definition uses: `'running' | 'idle' | 'maintenance' | 'offline'`

---

### 26. GM Dashboard Summary

| Metric | Status | Severity | Root Cause |
|--------|--------|----------|------------|
| Staff Productivity | ❌ RANDOM | CRITICAL | `Math.random()` |
| Equipment Utilization | ❌ RANDOM | CRITICAL | `Math.random()` |
| Customer Satisfaction | ❌ RANDOM | CRITICAL | `Math.random()` |
| Branch Efficiency | ❌ 55% FAKE | CRITICAL | Cascade of random |
| Equipment Hours | ❌ RANDOM fallback | HIGH | Missing data handling |
| Staff Productivity | ⚠️ Oversimplified | HIGH | `orders × 12` formula |
| Revenue Target | ⚠️ Hardcoded 50K | MEDIUM | Missing branch config |
| Turnaround Target | ⚠️ Hardcoded 24h | MEDIUM | Missing branch config |
| Branch Dropdown | ❌ Hardcoded | HIGH | Not fetching from DB |

---

## PART 4: Complete Issues Inventory

### All Identified Accuracy Issues (21 Total)

| # | Dashboard | Component/File | Issue | Severity |
|---|-----------|----------------|-------|----------|
| 1 | Director | ExecutiveNarrative.tsx | Hardcoded 80% retention baseline | CRITICAL |
| 2 | Director | ExecutiveNarrative.tsx | Hardcoded 20% premium target | HIGH |
| 3 | Director | ExecutiveNarrative.tsx | Hardcoded 10% growth forecast | CRITICAL |
| 4 | Director | DirectorKPICards.tsx | No historical data handling | HIGH |
| 5 | GM | performance/page.tsx | Random staffProductivity (75-94%) | CRITICAL |
| 6 | GM | performance/page.tsx | Random equipmentUtilization (70-94%) | CRITICAL |
| 7 | GM | performance/page.tsx | Random customerSatisfaction (80-94%) | CRITICAL |
| 8 | GM | performance/page.tsx | 55% of efficiency is random | CRITICAL |
| 9 | GM | equipment/page.tsx | Random utilization fallback (60-99%) | HIGH |
| 10 | GM | equipment/page.tsx | Random hours fallback (0-7h) | HIGH |
| 11 | GM | equipment/page.tsx | Hardcoded mock equipment list | HIGH |
| 12 | GM | staff/page.tsx | Oversimplified productivity (×12) | HIGH |
| 13 | GM | staff/page.tsx | Attendance field name mismatch | MEDIUM |
| 14 | GM | gm-dashboard.ts | Hardcoded 50K revenue target | MEDIUM |
| 15 | GM | gm-dashboard.ts | Hardcoded 24h turnaround target | MEDIUM |
| 16 | GM | GMDashboardHeader.tsx | Hardcoded branch dropdown | HIGH |
| 17 | GM | Multiple components | No bounds checking on scores | MEDIUM |
| 18 | GM | GMEquipmentStatus.tsx | NaN handling in utilization | MEDIUM |
| 19 | Both | Seed scripts | Branch ID inconsistency | HIGH |
| 20 | Both | Seed scripts | Missing transactions for orders | HIGH |
| 21 | Both | Seed scripts | No historical data | HIGH |

---

## PART 5: Files Requiring Changes

| File | Changes Needed | Priority |
|------|----------------|----------|
| `app/(dashboard)/gm/performance/page.tsx` | Remove Math.random(), use real data | CRITICAL |
| `components/features/director/ExecutiveNarrative.tsx` | Remove hardcoded baselines | CRITICAL |
| `app/(dashboard)/gm/equipment/page.tsx` | Remove random fallbacks | HIGH |
| `components/dashboard/gm/GMDashboardHeader.tsx` | Fetch branches from Firestore | HIGH |
| `scripts/seed-test-orders.ts` | Use consistent branch IDs | HIGH |
| `scripts/seed-milestone2.ts` | Use consistent branch IDs | HIGH |
| `app/(dashboard)/gm/staff/page.tsx` | Fix productivity calculation | HIGH |
| `lib/db/gm-dashboard.ts` | Use branch-specific targets | MEDIUM |
| `lib/db/schema.ts` | Add missing config fields | MEDIUM |
| `components/dashboard/gm/*.tsx` | Add bounds checking | MEDIUM |

---

## PART 6: Reports Page Accuracy Issues

### 27. Revenue Calculation Mismatch - CRITICAL

Different files use different fields for revenue:

| Component | Field Used | Issue |
|-----------|-----------|-------|
| Reports page | `order.totalAmount` | Includes unpaid orders |
| Director insights API | `order.paidAmount` | Only paid amounts |
| Daily email reports | `transaction.amount` | Only completed transactions |

**Problem:** Same metric calculated differently across system.

---

### 28. Operating Margin Hardcoded - CRITICAL
**File:** `app/api/analytics/director/insights/route.ts`

```typescript
const estimatedCosts = currentRevenue * 0.35; // HARDCODED
```

**Problem:** No cost tracking exists. Margin is invented.

---

### 29. MTD Change Calculation Wrong - HIGH
**File:** `app/(dashboard)/reports/page.tsx`

Compares today's revenue to MTD - always shows ~-93% "decline". Meaningless.

---

### 30. Customer Retention Invented - HIGH
When no historical data, assumes 95% of current retention. Fake data.

---

## PART 7: Pipeline Page Accuracy Issues

### 31. Status Mismatch 'ready' vs 'queued_for_delivery' - CRITICAL
**File:** `hooks/usePipelineFilters.ts`

"Ready" filter uses old status name. Returns zero orders.

---

### 32. Completed Orders Not Queried - CRITICAL
Pipeline excludes `delivered` and `collected` from query, so:
- Completion rate always = 0%
- Processing time always = 0
- Today completed always = 0

**All completion statistics are broken.**

---

### 33. Inspection Status Missing - HIGH
Orders in 'inspection' stage are invisible on pipeline.

---

### 34. Hardcoded Revenue Change - MEDIUM
Shows fake "+8% vs yesterday" - never calculated.

---

## PART 8: Other Dashboard Pages Issues

### 35. Employees Page Hardcoded Placeholders - MEDIUM
"Clocked In Today" and "Avg Productivity" show "--" instead of data.

---

### 36. Productivity Efficiency Estimated - MEDIUM
Efficiency = `orders × 5`. Not actual measurement.

---

## PART 9: Complete Issues Inventory

### Total: 36+ Accuracy Issues Identified

| Severity | Count |
|----------|-------|
| CRITICAL | 10 |
| HIGH | 13 |
| MEDIUM | 10 |
| LOW | 3 |

### By Dashboard/Page

| Page | Issues |
|------|--------|
| Director Dashboard | 4 |
| GM Dashboard | 12 |
| Reports Page | 5 |
| Pipeline Page | 5 |
| Employees Page | 2 |
| Other Pages | 2 |
| Seed Scripts | 3 |
| Shared Components | 6 |

---

## PART 10: Master Fix Priority List

### Phase A: CRITICAL Fixes
1. Remove `Math.random()` from GM performance page
2. Remove hardcoded 80% retention baseline
3. Remove hardcoded 10% growth forecast
4. Fix pipeline 'ready' → 'queued_for_delivery'
5. Query completed orders separately for pipeline stats
6. Standardize revenue calculation field
7. Remove hardcoded 35% operating margin

### Phase B: HIGH Priority Fixes
8. Add 'inspection' status to pipeline
9. Remove random equipment fallbacks
10. Fix hardcoded branch dropdown
11. Standardize branch IDs in seed scripts
12. Add transactions for seeded orders
13. Seed historical data
14. Fix MTD change calculation
15. Calculate statistics from ALL orders

### Phase C: MEDIUM Priority Fixes
16. Replace "--" placeholders in employees page
17. Fix productivity efficiency formula
18. Use reorderLevel for low stock alerts
19. Replace hardcoded revenue change %
20. Add bounds checking to components
21. Fix hardcoded default targets

### Phase D: LOW Priority Fixes
22. Fix "Active Routes" duplication
23. Add NaN handling to utilization
24. Fix bottleneck threshold

---

## PART 11: API Routes Accuracy Issues

### Order & Payment API Issues

#### Issue 40: Default Delivery Fee Hardcoded - HIGH
**File:** `app/api/orders/calculate-delivery-fee/route.ts` line 17

```typescript
const DEFAULT_DELIVERY_FEE = 200;  // HARDCODED
```

When no delivery rules match, flat 200 KES applied. Not configurable.

---

#### Issue 41: 5km Distance Assumption - MEDIUM
**File:** `app/api/orders/calculate-delivery-fee/route.ts` line 209

```typescript
fee = feeCalculation.value * 5; // Default 5km when distance missing
```

Silent assumption when distance not provided.

---

#### Issue 42: 'overpaid' Status Not in Schema - HIGH
**File:** `app/api/payments/route.ts` lines 83-84

Code assigns 'overpaid' status but schema only defines: `'pending' | 'partial' | 'paid'`

---

#### Issue 43: Estimated Completion Logic Bug - CRITICAL
**File:** `lib/db/orders.ts` lines 90-111

```typescript
if (garmentCount > 10) {
  hoursToAdd += 24;
} else if (garmentCount > 20) {  // NEVER REACHED!
  hoursToAdd += 48;
}
```

Second condition never executes. 50-garment orders get same time as 11-garment orders.

---

#### Issue 44: Payment Method Limits Hardcoded - MEDIUM
**File:** `lib/payments/payment-service.ts` line 375

```typescript
mpesa: orderAmount >= 10 && orderAmount <= 500000,  // HARDCODED
card: orderAmount >= 10,  // HARDCODED
```

Should be configurable per branch/system.

---

#### Issue 45: VIP Threshold Mismatch - HIGH
**Files:** `app/api/pricing/calculate/route.ts` vs `app/api/customers/segmentation/route.ts`

- Pricing uses `orderCount` (all-time)
- Segmentation uses `last12MonthsOrders`
- Same customer classified differently!

---

### Analytics API Issues

#### Issue 46: Revenue Uses paidAmount Instead of Transactions - CRITICAL
**File:** `app/api/analytics/director/insights/route.ts` line 109

Uses `order.paidAmount` instead of summing actual completed transactions. Revenue underreported.

---

#### Issue 47: Operating Margin Hardcoded 35% - CRITICAL
**File:** `app/api/analytics/director/insights/route.ts` lines 297-304

```typescript
const estimatedCosts = currentRevenue * 0.35;  // HARDCODED
```

No cost tracking. Margin is invented.

---

#### Issue 48: Customer Retention Uses Proxy Value - HIGH
**File:** `app/api/analytics/director/insights/route.ts` line 293

```typescript
const previousRetention = currentRetention * 0.95;  // FABRICATED
```

When no historical data, assumes 95% of current.

---

#### Issue 49: Compliance Rate Defaults to 100% - HIGH
**File:** `app/api/defect-notifications/metrics/route.ts` line 166

```typescript
: 100;  // Defaults to 100% if no data
```

Shows perfect compliance when data is missing.

---

#### Issue 50: Impact Projections Use Arbitrary Multipliers - MEDIUM
**File:** `app/api/analytics/director/recommendations/route.ts`

Lines 445, 470, 482, 494 use hardcoded percentages (5%, 15%, 20%) for impact estimates. No correlation to actual data.

---

### Customer & Loyalty API Issues

#### Issue 51: Customer Credit Overpayment Not Handled - HIGH
**File:** `app/api/customers/[customerId]/credit/route.ts` lines 264-270

Sets 'overpaid' status but doesn't track overpayment amount or trigger refund.

---

#### Issue 52: VIP Progress Can Exceed 100% - MEDIUM
**File:** `app/api/customers/segmentation/route.ts` lines 156-160

Progress calculation doesn't cap at 100% before display.

---

#### Issue 53: Loyalty Points Rounding Arbitrary - LOW
**File:** `app/api/loyalty/customers/[customerId]/points/route.ts` line 216

```typescript
const discountValue = Math.floor(points / ratio) * 10;  // Rounds to nearest 10
```

Undocumented rounding policy.

---

#### Issue 54: Quotation Conversion Updates Wrong Field - CRITICAL
**File:** `app/api/quotations/[quotationId]/convert/route.ts` line 332

```typescript
totalSpent: customerData.totalSpent + conversionData.paidAmount  // WRONG!
```

Should use `totalAmount`, not `paidAmount`. Corrupts customer lifetime value.

---

#### Issue 55: Load Metrics Field Doesn't Exist - CRITICAL
**File:** `app/api/pricing/load-metrics/route.ts` lines 105-107

References `order.totalWeightKg` but field doesn't exist in schema. Metrics always 0.

---

#### Issue 56: Quotation Send is Mock - CRITICAL
**File:** `app/api/quotations/[quotationId]/send/route.ts` lines 216-228

```typescript
messageSent = true;  // Simulate success for now
```

WhatsApp/email never actually sent. Status updated to 'sent' falsely.

---

### Pricing API Issues

#### Issue 57: Double Rounding in Discount - LOW
**File:** `app/api/pricing/calculate/route.ts` lines 112-115

Discount and final price rounded separately. Could accumulate rounding errors.

---

#### Issue 58: Driver Bonus Never Executes - HIGH
**File:** `app/api/admin/driver-payouts/route.ts` line 312

Default `bonusThreshold = 0`, so condition `bonusThreshold > 0` never true. Drivers never get bonuses.

---

## PART 12: Complete Issues Inventory (Updated with APIs)

### Total: 58 Accuracy Issues Identified

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Director Dashboard | 2 | 2 | 0 | 0 | 4 |
| GM Dashboard | 4 | 4 | 4 | 0 | 12 |
| Reports Page | 2 | 2 | 1 | 0 | 5 |
| Pipeline Page | 2 | 2 | 1 | 0 | 5 |
| Other Pages | 0 | 0 | 2 | 1 | 3 |
| Order/Payment APIs | 1 | 2 | 2 | 0 | 5 |
| Analytics APIs | 2 | 2 | 1 | 0 | 5 |
| Customer/Loyalty APIs | 2 | 2 | 1 | 1 | 6 |
| Pricing APIs | 0 | 1 | 0 | 1 | 2 |
| Quotation APIs | 2 | 0 | 0 | 0 | 2 |
| Seed Scripts | 0 | 3 | 0 | 0 | 3 |
| Shared Components | 0 | 2 | 2 | 2 | 6 |
| **TOTAL** | **17** | **22** | **14** | **5** | **58** |

---

## PART 13: Master Files List

### All Files Requiring Changes

| File | Issue Count | Priority |
|------|-------------|----------|
| `app/(dashboard)/gm/performance/page.tsx` | 4 | CRITICAL |
| `components/features/director/ExecutiveNarrative.tsx` | 3 | CRITICAL |
| `app/api/analytics/director/insights/route.ts` | 3 | CRITICAL |
| `lib/db/orders.ts` | 1 | CRITICAL |
| `app/api/quotations/[quotationId]/convert/route.ts` | 1 | CRITICAL |
| `app/api/quotations/[quotationId]/send/route.ts` | 1 | CRITICAL |
| `app/api/pricing/load-metrics/route.ts` | 1 | CRITICAL |
| `hooks/usePipelineFilters.ts` | 1 | CRITICAL |
| `app/(dashboard)/pipeline/page.tsx` | 2 | CRITICAL |
| `app/api/payments/route.ts` | 1 | HIGH |
| `app/api/orders/calculate-delivery-fee/route.ts` | 2 | HIGH |
| `app/api/customers/segmentation/route.ts` | 2 | HIGH |
| `app/api/pricing/calculate/route.ts` | 1 | HIGH |
| `app/api/customers/[customerId]/credit/route.ts` | 1 | HIGH |
| `app/api/admin/driver-payouts/route.ts` | 1 | HIGH |
| `app/api/defect-notifications/metrics/route.ts` | 1 | HIGH |
| `app/(dashboard)/gm/equipment/page.tsx` | 3 | HIGH |
| `components/dashboard/gm/GMDashboardHeader.tsx` | 1 | HIGH |
| `scripts/seed-*.ts` | 3 | HIGH |
| `app/(dashboard)/reports/page.tsx` | 2 | HIGH |
| `components/modern/ModernPipelineStats.tsx` | 1 | MEDIUM |
| `app/(dashboard)/employees/page.tsx` | 2 | MEDIUM |
| `lib/payments/payment-service.ts` | 1 | MEDIUM |
| `app/api/analytics/director/recommendations/route.ts` | 1 | MEDIUM |
| `lib/db/gm-dashboard.ts` | 2 | MEDIUM |
| `app/api/pricing/calculate/route.ts` | 1 | LOW |
| `app/api/loyalty/customers/[customerId]/points/route.ts` | 1 | LOW |

---

## PART 14: Seed Script Data Audit

### Data Counts Summary

| Collection | Records | Source Scripts |
|-----------|---------|----------------|
| branches | 20 | seed-branches.ts |
| customers | 16+ | seed-test-orders, seed-milestone2, create-dev-customer |
| orders | 28 | seed-test-orders (20), seed-milestone2 (5), create-dev-customer (3) |
| transactions | 4 | seed-milestone2 only |
| pricing | 6 | seed-milestone2 |
| equipment | 60+ | seed-equipment |
| inventory | 250 | seed-inventory (10 branches × 25 items) |
| attendance | 28 | seed-attendance (today only) |
| issues | 12 | seed-issues |
| processingBatches | 85+ | seed-processing-batches |
| workstationAssignments | 200+ | seed-workstation-assignments |
| auditLogs | 100 | seed-audit-logs |
| pickupRequests | 25 | seed-pickup-requests |
| permissionRequests | 15 | seed-permission-requests |
| customerFeedback | 50 | seed-customer-feedback |

---

### Critical Data Issues

#### Issue 59: Branch ID Mismatches - CRITICAL

| Script | Branch ID Used | In seed-branches.ts? |
|--------|----------------|---------------------|
| seed-test-orders.ts | **WESTLANDS** | ❌ NO |
| seed-milestone2.ts | **MAIN** | ❌ NO |
| create-dev-customer.ts | **main-branch** | ❌ NO |
| seed-branches.ts | VILLAGE_MARKET, WESTGATE, etc. | ✅ YES |

**Impact:** 28 orders reference non-existent branches. Dashboard branch filters won't work.

---

#### Issue 60: Missing Transactions - CRITICAL

| Orders Source | Order Count | Transactions Created | Gap |
|---------------|-------------|---------------------|-----|
| seed-test-orders.ts | 20 | **0** | 20 missing |
| seed-milestone2.ts | 5 | 4 | 1 missing |
| create-dev-customer.ts | 3 | **0** | 3 missing |
| **TOTAL** | 28 | 4 | **24 missing** |

**Impact:** Revenue shows 1,760 KES (4 transactions) instead of ~8,000 KES (28 orders). 78% of revenue invisible.

---

#### Issue 61: No Historical Data - HIGH

| Data Type | Date Range | Historical? |
|-----------|------------|-------------|
| Orders | Last 7 days only | ❌ NO |
| Transactions | Today only | ❌ NO |
| Attendance | Today only | ❌ NO |
| Feedback | Last 30 days | ⚠️ Partial |
| Audit logs | Last 30 days | ⚠️ Partial |

**Impact:** Period comparisons (yesterday, last week, last month) fail or show 0.

---

#### Issue 62: Revenue Totals Mismatch - HIGH

**Actual Order Amounts:**
- seed-test-orders.ts: ~5,000 KES
- seed-milestone2.ts: 3,070 KES
- create-dev-customer.ts: 2,300 KES
- **Total: ~10,370 KES**

**Recorded Transactions:**
- seed-milestone2.ts only: **1,760 KES**
- **Gap: ~8,610 KES unreported (83%)**

**Daily Branch Targets:**
- Total across 20 branches: **1,065,000 KES/day**
- Actual seeded: 1,760 KES
- **Percentage of target: 0.16%**

---

#### Issue 63: Branch Coordinates All Zeros - MEDIUM

```typescript
// ALL branches in seed-branches.ts
coordinates: { lat: 0, lng: 0 }  // PLACEHOLDER
```

**Impact:** Maps, route optimization, distance calculations all fail.

---

#### Issue 64: No Repeat Customers - HIGH

| Source | Customers | Orders per Customer |
|--------|-----------|---------------------|
| seed-test-orders.ts | 10 | 2 orders each |
| seed-milestone2.ts | 5 | 1 order each |
| create-dev-customer.ts | 1 | 3 orders |

**Impact:** Customer retention calculation shows near-0% (few repeat customers).

---

#### Issue 65: Processing Pipeline Disconnected - HIGH

No linking between:
- Orders → Processing Batches (processingBatches.orderIds don't match real orders)
- Processing Batches → Workstation Assignments
- Assignments → Staff Performance Metrics

**Impact:** Pipeline page shows batches but can't track actual order processing.

---

### Valid Branch IDs (from seed-branches.ts)

```
VILLAGE_MARKET, WESTGATE, DENNIS_PRITT, MUTHAIGA, ADLIFE,
NAIVAS_KILIMANI, HURLINGHAM, LAVINGTON, GREENPARK, SOUTH_C_NAIVAS,
LANGATA_KOBIL, BOMAS, WATERFRONT_KAREN, FREEDOM_HEIGHTS, NGONG_SHELL,
IMARA, NEXTGEN_SOUTH_C, KILELESHWA, ARBORETUM, SHUJAH_MALL, MYTOWN_KAREN
```

---

## PART 15: Complete Issues Inventory (Final)

### Total: 66 Accuracy Issues Identified

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Director Dashboard | 2 | 2 | 0 | 0 | 4 |
| GM Dashboard | 4 | 4 | 4 | 0 | 12 |
| Reports Page | 2 | 2 | 1 | 0 | 5 |
| Pipeline Page | 2 | 2 | 1 | 0 | 5 |
| Other Pages | 0 | 0 | 2 | 1 | 3 |
| Order/Payment APIs | 1 | 2 | 2 | 0 | 5 |
| Analytics APIs | 2 | 2 | 1 | 0 | 5 |
| Customer/Loyalty APIs | 2 | 2 | 1 | 1 | 6 |
| Pricing APIs | 0 | 1 | 0 | 1 | 2 |
| Quotation APIs | 2 | 0 | 0 | 0 | 2 |
| Seed Scripts | 2 | 4 | 1 | 0 | 7 |
| Shared Components | 0 | 2 | 2 | 2 | 6 |
| **TOTAL** | **21** | **25** | **15** | **5** | **66** |

---

## PART 16: Recommended Fix Sequence

### Phase 1: Fix Seed Data (Foundation)
**Must fix first - all other fixes depend on clean data**

1. Update `seed-test-orders.ts` to use valid branch ID (e.g., VILLAGE_MARKET)
2. Update `seed-milestone2.ts` to use valid branch ID (e.g., WESTGATE)
3. Update `create-dev-customer.ts` to use valid branch ID
4. Add transactions for ALL orders in `seed-test-orders.ts`
5. Add transactions for ALL orders in `create-dev-customer.ts`
6. Add real coordinates to `seed-branches.ts`
7. Create historical orders (30, 60, 90 days ago)

### Phase 2: Fix Critical Dashboard Code
8. Remove `Math.random()` from GM performance page
9. Remove hardcoded 80% retention baseline
10. Remove hardcoded 10% growth forecast
11. Fix pipeline 'ready' → 'queued_for_delivery'
12. Query completed orders separately for stats

### Phase 3: Fix Critical API Code
13. Fix estimated completion logic bug (else-if)
14. Fix quotation conversion field (totalAmount not paidAmount)
15. Fix load metrics non-existent field
16. Standardize revenue calculation (use transactions)
17. Remove hardcoded 35% operating margin

### Phase 4: Fix High Priority Issues
18. Add 'inspection' status to pipeline
19. Remove random equipment fallbacks
20. Fix hardcoded branch dropdown
21. Fix VIP threshold mismatch
22. Fix driver bonus threshold

### Phase 5: Fix Medium Priority Issues
23. Replace "--" placeholders
24. Fix productivity formulas
25. Add bounds checking
26. Make targets configurable

---

## PART 17: Files Changed Summary

### Seed Scripts (Fix First)
- `scripts/seed-test-orders.ts` - Change WESTLANDS → VILLAGE_MARKET, add transactions
- `scripts/seed-milestone2.ts` - Change MAIN → WESTGATE
- `scripts/create-dev-customer.ts` - Change main-branch → valid ID
- `scripts/seed-branches.ts` - Add real coordinates

### Dashboard Pages
- `app/(dashboard)/gm/performance/page.tsx` - Remove Math.random() (4 places)
- `app/(dashboard)/gm/equipment/page.tsx` - Remove random fallbacks (3 places)
- `app/(dashboard)/pipeline/page.tsx` - Add inspection, fix completed query
- `app/(dashboard)/employees/page.tsx` - Replace "--" placeholders
- `app/(dashboard)/reports/page.tsx` - Fix MTD calculation

### Components
- `components/features/director/ExecutiveNarrative.tsx` - Remove hardcoded baselines
- `components/dashboard/gm/GMDashboardHeader.tsx` - Fetch branches from DB
- `components/modern/ModernPipelineStats.tsx` - Calculate revenue change
- `hooks/usePipelineFilters.ts` - Fix 'ready' → 'queued_for_delivery'

### API Routes
- `lib/db/orders.ts` - Fix garment count logic
- `app/api/quotations/[quotationId]/convert/route.ts` - Fix field name
- `app/api/pricing/load-metrics/route.ts` - Fix non-existent field
- `app/api/analytics/director/insights/route.ts` - Remove hardcoded margin
- `app/api/payments/route.ts` - Add 'overpaid' to schema or handle
- `app/api/admin/driver-payouts/route.ts` - Fix bonus threshold

### Lib Files
- `lib/db/gm-dashboard.ts` - Use branch-specific targets
- `lib/db/schema.ts` - Add missing config fields
- `lib/payments/payment-service.ts` - Make limits configurable

---

## PART 18: Verification Plan

After fixes are applied:

1. **Re-seed database**
   ```bash
   npm run seed:branches
   npm run seed:test-orders
   npm run seed:milestone2
   ```

2. **Verify branch IDs**
   - Open Pipeline page → Branch dropdown should show 20+ branches
   - Orders should appear under correct branches

3. **Verify revenue**
   - Director Dashboard → Revenue should show ~10,370 KES
   - Reports page → Same revenue figure

4. **Verify no random values**
   - Refresh GM Performance page 5 times
   - Staff Productivity, Equipment Utilization should NOT change

5. **Verify pipeline**
   - Pipeline page → Filter by "Ready" should show orders
   - Completion stats should show non-zero values

6. **Verify historical comparisons**
   - Director Narrative should show "vs yesterday" with actual data
   - Or show "Insufficient historical data" message

---

## PART 19: Document History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-21 | 1.0 | Initial analysis of Order-to-Dashboard data flow |
| 2026-01-21 | 2.0 | Added Director Dashboard metrics accuracy analysis |
| 2026-01-21 | 3.0 | Added GM Dashboard accuracy issues |
| 2026-01-21 | 4.0 | Added Reports, Pipeline, Employees page issues |
| 2026-01-21 | 5.0 | Added API Routes accuracy issues |
| 2026-01-21 | 6.0 | Added Seed Script data audit, complete inventory (66 issues) |
| 2026-01-21 | 7.0 | Added Workstation, Inventory, Customer Portal issues (100+ total) |

---

## PART 20: Workstation & Processing Accuracy Issues

### Critical Issues

#### Issue 67: Non-Deterministic Assignment ID Generation - CRITICAL
**File:** `lib/db/workstation.ts` line 32
```typescript
function generateAssignmentId(): string {
  return `ASSIGN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`.toUpperCase();
}
```
**Problem:** Uses `Math.random()` for ID generation - potential collisions in high-frequency operations.

---

#### Issue 68: Duration Calculation Unit Mismatch - CRITICAL
**File:** `lib/db/workstation.ts` lines 270-273
```typescript
duration = Math.floor(duration / 1000); // Convert to seconds
```
**Problem:** Duration stored in SECONDS but later calculations divide by 3600 assuming hours. Mixed units corrupt all time-based metrics.

---

#### Issue 69: Efficiency Score Calculation Error - CRITICAL
**File:** `lib/db/workstation.ts` lines 388-390
```typescript
metrics.efficiencyScore = totalTime > 0 ? metrics.totalOrdersProcessed / (totalTime / 3600) : 0;
```
**Problem:** Formula creates wildly inflated efficiency scores due to unit mismatch. Staff performance rankings completely unreliable.

---

#### Issue 70: Missing Stage Mapping - HIGH
**File:** `lib/db/processing-batches.ts` lines 70-78
```typescript
const stageMap: Record<ProcessingBatchStage, OrderStatus> = {
  washing: 'drying',
  drying: 'ironing',
  ironing: 'quality_check',
};
return stageMap[currentStage];  // Returns undefined for unmapped stages!
```
**Problem:** No mapping for all stages. Returns `undefined` silently, orders could get stuck with invalid status.

---

#### Issue 71: Inspection Status Missing Null Guard - HIGH
**File:** `lib/db/workstation.ts` lines 428-431
```typescript
return order.garments.every((garment) => garment.inspectionCompleted === true);
```
**Problem:** No null check on `order` or `order.garments`. If garments array is empty, returns `true` (vacuous truth).

---

#### Issue 72: Wrong Completion Status in Analytics - MEDIUM
**File:** `components/features/workstation/WorkstationAnalytics.tsx` lines 93-94
```typescript
const completedOrders = allOrders.filter((o) => o.status === 'queued_for_delivery').length;
```
**Problem:** `queued_for_delivery` is NOT completion. Should be `delivered` or `collected`.

---

#### Issue 73: Time Unit Mismatch in Major Issues Modal - HIGH
**File:** `components/features/workstation/MajorIssuesReviewModal.tsx` + `lib/db/workstation.ts`
**Problem:** UI accepts time in MINUTES but database function treats it as HOURS (multiplies by 3600000ms). Time adjustments off by 60x.

---

## PART 21: Inventory & Stock Management Accuracy Issues

### Critical Issues

#### Issue 74: Hardcoded Stock Threshold (1.2x) - CRITICAL
**Files:** Multiple locations (5 places)
- `app/(dashboard)/inventory/page.tsx` lines 117-118, 128
- `components/features/inventory/InventoryTable.tsx` lines 62, 69, 107
- `components/features/inventory/LowStockAlerts.tsx` line 37

```typescript
if (stockFilter === 'low') matchesStock = ratio >= 1 && ratio <= 1.2;
```
**Problem:** 1.2x multiplier hardcoded in 5 locations with no central configuration. Cannot adjust without code changes.

---

#### Issue 75: Race Condition in Stock Adjustment - HIGH
**File:** `components/features/inventory/StockAdjustmentModal.tsx` lines 82-99
```typescript
const itemDoc = await getDoc(itemRef);  // Fetch
const currentQuantity = itemDoc.data()?.quantity || 0;
// GAP - another request could modify here
await updateDoc(itemRef, { quantity: calculatedNewQuantity });
```
**Problem:** No transaction protection. Lost updates if two staff adjust same item simultaneously.

---

#### Issue 76: Cost Per Unit Fallback to Zero - HIGH
**File:** `app/(dashboard)/inventory/page.tsx` lines 130-133
```typescript
const totalValue = inventory.reduce(
  (sum, item) => sum + (item.costPerUnit || 0) * item.quantity, 0
);
```
**Problem:** Missing costs treated as zero, inflating inventory value incorrectly.

---

#### Issue 77: Random Seed Data for Inventory - HIGH
**File:** `scripts/seed-inventory.ts` lines 95-109, 136, 152
```typescript
function randomVariation(base: number, variance: number = 0.3): number {
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.max(1, Math.round(base * factor));
}
```
**Problem:** Non-reproducible test data. Each seed produces different inventory levels.

---

#### Issue 78: Item ID Generation Uses Math.random() - MEDIUM
**File:** `components/features/inventory/AddItemModal.tsx` line 65
```typescript
return `ITM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```
**Problem:** Client-side ID generation with collision potential.

---

#### Issue 79: Transfer ID Uses Math.random() - MEDIUM
**File:** `lib/db/inventory-transfers.ts` lines 35-42
```typescript
const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
return `TRF-INV-${dateStr}-${random}`;
```
**Problem:** Same-day transfers could get duplicate IDs.

---

#### Issue 80: Adjustment History Limited to 50 - LOW
**File:** `components/features/inventory/AdjustmentHistoryModal.tsx` line 57
```typescript
limit(50)
```
**Problem:** Older adjustments not accessible. No pagination for audit trail.

---

## PART 22: Customer Portal Accuracy Issues

### Critical Issues

#### Issue 81: Customer Lookup by Email Instead of ID - CRITICAL
**Files:** 4 portal pages
- `app/(customer)/portal/page.tsx` line 49
- `app/(customer)/portal/orders/page.tsx` line 41
- `app/(customer)/portal/orders/[orderId]/page.tsx` line 39
- `app/(customer)/portal/profile/page.tsx` line 40

```typescript
const q = query(customersRef, where('email', '==', user.email), limit(1));
```
**Problem:**
- Phone-authenticated users may not have email
- No index validation
- Could silently fail for customers without email field

---

#### Issue 82: Hardcoded Operating Hours - HIGH
**File:** `components/features/customer/BranchInfoCard.tsx` lines 111-113
```typescript
<p>Mon - Fri: 8:00 AM - 6:00 PM</p>
<p>Sat: 9:00 AM - 5:00 PM</p>
<p>Sun: Closed</p>
```
**Problem:** Hours hardcoded, not fetched from branch data. Always shows same hours for all branches.

---

#### Issue 83: Address Display Missing Cases - HIGH
**File:** `app/(customer)/portal/orders/[orderId]/page.tsx` lines 279-314
**Problem:** Missing display cases:
- `pickup_required` + `customer_collects` - no address shown
- `dropped_off` + `delivery_required` - delivery address won't display

---

#### Issue 84: Overpaid Status Never Displays - MEDIUM
**File:** `components/features/customer/PaymentInfo.tsx` lines 79, 105-112
```typescript
const remainingBalance = order.totalAmount - order.paidAmount;
{remainingBalance > 0 && (...)}  // Only shows if balance positive
```
**Problem:** Overpaid customers see nothing - negative balance case not handled.

---

#### Issue 85: Live Driver Map Missing Fallback - MEDIUM
**File:** `app/(customer)/portal/orders/[orderId]/page.tsx` lines 216-227
```typescript
{order.status === 'out_for_delivery' && order.deliveryAddress && (
  <LiveDriverMap ... />
)}
```
**Problem:** No map shown for customer_collects case. No message explaining why.

---

#### Issue 86: Hardcoded WhatsApp Number - LOW
**File:** `components/features/customer/PaymentStub.tsx` line 110
```typescript
window.open(`https://wa.me/254725462859?text=...`, '_blank');
```
**Problem:** Static phone number instead of branch/business settings.

---

#### Issue 87: Ambiguous ETA Label - MEDIUM
**File:** `components/features/customer/ActiveOrders.tsx` lines 98-115
```typescript
{isPastDue ? 'Overdue: ' : 'Ready '}  // "Ready" is ambiguous
```
**Problem:** Label says "Ready X days ago" when it should say "Expected".

---

## PART 23: Updated Complete Issues Inventory

### Total: 100+ Accuracy Issues Identified

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Director Dashboard | 2 | 2 | 0 | 0 | 4 |
| GM Dashboard | 4 | 4 | 4 | 0 | 12 |
| Reports Page | 2 | 2 | 1 | 0 | 5 |
| Pipeline Page | 2 | 2 | 1 | 0 | 5 |
| Other Dashboard Pages | 0 | 0 | 2 | 1 | 3 |
| Order/Payment APIs | 1 | 2 | 2 | 0 | 5 |
| Analytics APIs | 2 | 2 | 1 | 0 | 5 |
| Customer/Loyalty APIs | 2 | 2 | 1 | 1 | 6 |
| Pricing APIs | 0 | 1 | 0 | 1 | 2 |
| Quotation APIs | 2 | 0 | 0 | 0 | 2 |
| Seed Scripts | 2 | 4 | 1 | 0 | 7 |
| Shared Components | 0 | 2 | 2 | 2 | 6 |
| **Workstation/Processing** | **3** | **3** | **1** | **0** | **7** |
| **Inventory/Stock** | **1** | **3** | **2** | **1** | **7** |
| **Customer Portal** | **1** | **2** | **3** | **1** | **7** |
| **TOTAL** | **24** | **31** | **21** | **7** | **83** |

---

## PART 24: Additional Files Requiring Changes

### Workstation Files
| File | Issue Count | Priority |
|------|-------------|----------|
| `lib/db/workstation.ts` | 4 | CRITICAL |
| `lib/db/processing-batches.ts` | 1 | HIGH |
| `components/features/workstation/WorkstationAnalytics.tsx` | 1 | MEDIUM |
| `components/features/workstation/MajorIssuesReviewModal.tsx` | 1 | HIGH |

### Inventory Files
| File | Issue Count | Priority |
|------|-------------|----------|
| `app/(dashboard)/inventory/page.tsx` | 2 | CRITICAL |
| `components/features/inventory/InventoryTable.tsx` | 1 | CRITICAL |
| `components/features/inventory/LowStockAlerts.tsx` | 1 | CRITICAL |
| `components/features/inventory/StockAdjustmentModal.tsx` | 2 | HIGH |
| `components/features/inventory/AddItemModal.tsx` | 1 | MEDIUM |
| `lib/db/inventory-transfers.ts` | 1 | MEDIUM |
| `scripts/seed-inventory.ts` | 1 | HIGH |

### Customer Portal Files
| File | Issue Count | Priority |
|------|-------------|----------|
| `app/(customer)/portal/page.tsx` | 1 | CRITICAL |
| `app/(customer)/portal/orders/page.tsx` | 1 | CRITICAL |
| `app/(customer)/portal/orders/[orderId]/page.tsx` | 2 | HIGH |
| `app/(customer)/portal/profile/page.tsx` | 1 | CRITICAL |
| `components/features/customer/BranchInfoCard.tsx` | 1 | HIGH |
| `components/features/customer/PaymentInfo.tsx` | 1 | MEDIUM |
| `components/features/customer/ActiveOrders.tsx` | 1 | MEDIUM |
| `components/features/customer/PaymentStub.tsx` | 1 | LOW |

---

## PART 25: Updated Fix Sequence

### Phase 1: Fix Seed Data (Foundation) - 7 items
1-7. (Previous items remain)

### Phase 2: Fix Critical Dashboard Code - 5 items
8-12. (Previous items remain)

### Phase 3: Fix Critical API Code - 5 items
13-17. (Previous items remain)

### Phase 4: Fix High Priority Issues - 5 items
18-22. (Previous items remain)

### Phase 5: Fix Workstation/Processing - NEW
23. Fix assignment ID generation (remove Math.random)
24. Standardize duration units (seconds vs hours)
25. Fix efficiency score calculation
26. Add missing stage mappings
27. Fix time unit mismatch in major issues modal

### Phase 6: Fix Inventory/Stock - NEW
28. Extract hardcoded 1.2x threshold to constants
29. Add transaction protection for stock adjustments
30. Handle missing cost per unit properly
31. Fix seed data randomness

### Phase 7: Fix Customer Portal - NEW
32. Add customer lookup by ID fallback for phone auth
33. Fetch branch operating hours from database
34. Handle all address display cases
35. Fix overpaid status display
36. Add driver map fallback message