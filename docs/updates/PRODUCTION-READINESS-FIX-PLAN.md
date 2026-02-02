# Production Readiness Fix Plan - System Accuracy Audit

**Project**: Lorenzo Dry Cleaners System - Production Readiness
**Analysis Date**: January 21, 2026
**Total Issues Identified**: 83+
**Target**: Fix all data accuracy issues before production launch

---

## Executive Summary

A comprehensive audit of the Lorenzo Dry Cleaners system identified **83+ data accuracy issues** across 15 system categories. These issues range from **CRITICAL** (Math.random() generating fake metrics) to **LOW** (minor UI inconsistencies).

### Issue Severity Breakdown

| Severity | Count | Description |
|----------|-------|-------------|
| **CRITICAL** | 24 | System shows fabricated data, broken calculations |
| **HIGH** | 31 | Significant accuracy problems, missing functionality |
| **MEDIUM** | 21 | Hardcoded values, formula improvements needed |
| **LOW** | 7 | Minor issues, nice-to-have fixes |

### Categories Analyzed

1. Director Dashboard
2. GM Dashboard (all sub-pages)
3. Reports Page
4. Pipeline Page
5. Employees Page
6. Order/Payment APIs
7. Analytics APIs
8. Customer/Loyalty APIs
9. Pricing APIs
10. Quotation APIs
11. Seed Scripts
12. Shared Components
13. Workstation/Processing
14. Inventory/Stock Management
15. Customer Portal

---

## User Configuration Requirements

Based on stakeholder feedback, the following configuration scope has been defined:

### Configuration Scope

| Setting | Scope | Access Control |
|---------|-------|----------------|
| Revenue Targets | Per-branch | Director, GM, Systems Admin |
| Retention Targets | Per-branch | Director, GM, Systems Admin |
| Premium Service Targets | Per-branch | Director, GM, Systems Admin |
| Growth Targets | Per-branch | Director, GM, Systems Admin |
| Operating Hours | Per-branch | Director, GM, Systems Admin |
| Stock Thresholds | Per-branch | Director, GM, Systems Admin |

**Note**: GM-assigned staff can modify with Director approval via permission request system.

### Missing Data Handling

When data is not available, the system will show:
- **"No Data Available"** - With guidance on where to upload/request data
- **"Setup Required"** - When configuration is missing (replaces Math.random())

### Customer Registration

- Require **BOTH phone AND email** for customer registration
- Prevents lookup failures for phone-authenticated users

### Data Query Requirements

**CRITICAL**: All dashboard metrics and queries MUST come from the database:
- **No hardcoded values** - All targets, baselines, and thresholds from Firestore
- **No Math.random()** - Real data or "Setup Required" message
- **No invented comparisons** - Show "Insufficient data" when historical data missing

### Database Architecture

**Each branch should have its own data isolation:**

| Approach | Implementation |
|----------|----------------|
| **Collection Structure** | All collections use `branchId` field for filtering |
| **Security Rules** | Firestore rules enforce branch-level access |
| **Query Pattern** | All queries include `.where('branchId', '==', currentBranchId)` |
| **Aggregations** | Per-branch aggregations stored in `branchStats/{branchId}` |
| **Cross-Branch Views** | Director/GM roles can aggregate across branches |

**Firestore Collection Structure:**
```
/orders/{orderId}          -> includes branchId
/transactions/{txId}       -> includes branchId
/customers/{customerId}    -> includes primaryBranchId
/inventory/{itemId}        -> includes branchId
/equipment/{equipmentId}   -> includes branchId
/attendance/{recordId}     -> includes branchId
/branchStats/{branchId}    -> pre-computed branch metrics
  - dailyOrders
  - dailyRevenue
  - completionRate
  - avgTurnaround
  - lastUpdated
```

**Branch-Specific Queries:**
```typescript
// REQUIRED: All queries must filter by branchId
const orders = await getDocs(
  query(
    collection(db, 'orders'),
    where('branchId', '==', currentBranchId),
    where('createdAt', '>=', startOfDay)
  )
);

// For Director/GM: Aggregate across branches
const allBranchStats = await getDocs(
  collection(db, 'branchStats')
);
```

**Firestore Security Rules (Branch Isolation):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function getUserBranchId() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.branchId;
    }

    function hasRole(roles) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in roles;
    }

    // Orders - branch-level access
    match /orders/{orderId} {
      allow read: if request.auth != null &&
        (resource.data.branchId == getUserBranchId() || hasRole(['director', 'gm', 'admin']));
      allow create: if request.auth != null &&
        request.resource.data.branchId == getUserBranchId();
      allow update: if request.auth != null &&
        resource.data.branchId == getUserBranchId();
    }

    // Transactions - branch-level access
    match /transactions/{txId} {
      allow read: if request.auth != null &&
        (resource.data.branchId == getUserBranchId() || hasRole(['director', 'gm', 'admin']));
      allow write: if request.auth != null &&
        resource.data.branchId == getUserBranchId();
    }

    // Branch Stats - read own, directors read all
    match /branchStats/{branchId} {
      allow read: if request.auth != null &&
        (branchId == getUserBranchId() || hasRole(['director', 'gm', 'admin']));
      allow write: if false; // Only Cloud Functions can write
    }

    // Branch Config - only specific roles can modify
    match /branches/{branchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && hasRole(['director', 'gm', 'admin']);
    }
  }
}
```

---

## Mock Data Configuration

### Historical Data Period
- **180 days** (6 months) of historical data

### Branch Structure
| Type | Count | Description |
|------|-------|-------------|
| Main Branches | 5 | With equipment, high volume processing |
| Satellite Branches | 16 | Collection points only, no equipment |
| Head Office | 1 | Not a branch, administrative only |
| **Total** | 21 | Operational branches |

### Operational Parameters

| Parameter | Main Branches | Satellite Branches |
|-----------|---------------|-------------------|
| Daily Order Volume | 50-100 orders | 15-35 orders |
| Staff Count | 10-15 | 3-5 |
| Revenue Target | 100,000 - 150,000 KES/day | 25,000 - 45,000 KES/day |
| Has Equipment | Yes | No |

### Customer Behavior
| Metric | Value |
|--------|-------|
| Repeat Rate | 70% |
| One-Time Rate | 30% |
| AOV Range | 1,200 - 4,000 KES |

### Payment Distribution (Cashless Only)
| Method | Percentage |
|--------|------------|
| M-Pesa | 78% |
| Card | 15% |
| Credit | 7% |

### Service Mix (Premium Focus)
| Service Type | Percentage |
|--------------|------------|
| Regular | 40% |
| Dry Cleaning | 35% |
| Specialty/Express | 25% |

### Order Metrics
| Metric | Target |
|--------|--------|
| On-Time Completion Rate | 85-90% |
| Operating Hours | 7:30 AM - 8:00 PM |
| 24/7 Branches | VILLAGE_MARKET, WESTGATE |

### Issue Types to Seed
- Equipment breakdowns
- Quality defects
- Delivery delays
- Staff absences

---

## CRITICAL Issues (24) - Must Fix

### Issue 1-4: Director Dashboard Hardcoded Values
**Files**: `components/features/director/ExecutiveNarrative.tsx`

| Issue | Current | Fix |
|-------|---------|-----|
| Retention baseline | Hardcoded 80% | Read from branch config |
| Growth forecast | Hardcoded 10% | Read from branch config |
| Premium target | Hardcoded 20% | Read from branch config |
| No historical handling | Shows invented data | Show "No Data Available" |

### Issue 5-8: GM Dashboard Random Values
**File**: `app/(dashboard)/gm/performance/page.tsx`

```typescript
// CURRENT (BROKEN):
const staffProductivity = 75 + Math.floor(Math.random() * 20);  // 75-94%
const equipmentUtilization = 70 + Math.floor(Math.random() * 25);  // 70-94%
const customerSatisfaction = 80 + Math.floor(Math.random() * 15);  // 80-94%
// 55% of efficiency score is random!

// FIX:
// Query real data from Firestore or show "Setup Required"
```

### Issue 27-28: Revenue Calculation Issues
**Files**: Multiple API routes

| Issue | Current | Fix |
|-------|---------|-----|
| Revenue mismatch | Different fields across system | Standardize to `transactions` collection |
| Operating margin | Hardcoded 35% | Read from `companySettings` |

### Issue 32-33: Pipeline Status Issues
**Files**: `hooks/usePipelineFilters.ts`, `app/(dashboard)/pipeline/page.tsx`

| Issue | Current | Fix |
|-------|---------|-----|
| 'ready' status | Doesn't exist (renamed) | Use 'queued_for_delivery' |
| Completed orders | Never queried | Add separate query for stats |

### Issue 43: Estimated Completion Bug
**File**: `lib/db/orders.ts` lines 90-111

```typescript
// CURRENT (BROKEN):
if (garmentCount > 10) {
  hoursToAdd += 24;
} else if (garmentCount > 20) {  // NEVER REACHED!
  hoursToAdd += 48;
}

// FIX:
if (garmentCount > 20) {
  hoursToAdd += 48;
} else if (garmentCount > 10) {
  hoursToAdd += 24;
}
```

### Issue 54-56: Quotation API Issues
**Files**: Various quotation routes

| Issue | File | Fix |
|-------|------|-----|
| Wrong field in conversion | `convert/route.ts` | Use `totalAmount` not `paidAmount` |
| Load metrics missing | `load-metrics/route.ts` | Add `totalWeightKg` field |
| Send is mock | `send/route.ts` | Implement actual send or show "Not Configured" |

### Issue 59-60: Seed Script Data Issues
**Files**: All seed scripts

| Issue | Current | Fix |
|-------|---------|-----|
| Branch ID mismatch | WESTLANDS, MAIN (don't exist) | Use VILLAGE_MARKET, WESTGATE, etc. |
| Missing transactions | 24 of 28 orders have no transactions | Generate transactions for all orders |

### Issue 67-69: Workstation Issues
**File**: `lib/db/workstation.ts`

| Issue | Current | Fix |
|-------|---------|-----|
| Assignment ID | Uses Math.random() | Use UUID or timestamp-based |
| Duration units | Mismatch (seconds vs hours) | Standardize to minutes |
| Efficiency score | Calculation error | Fix formula |

### Issue 74: Hardcoded Stock Threshold
**Files**: 5 locations

```typescript
// CURRENT (in 5 files):
.where('quantity', '<=', quantity * 1.2);  // Hardcoded 1.2x

// FIX:
// Read threshold from branch config
const threshold = branch.lowStockThreshold || 1.2;
.where('quantity', '<=', quantity * threshold);
```

### Issue 81: Customer Portal Lookup
**Files**: Portal pages

```typescript
// CURRENT (BROKEN):
const customer = await getCustomerByEmail(user.email);  // Fails for phone auth

// FIX:
const customer = await getCustomerByPhoneAndEmail(user.phone, user.email);
// Require both at registration
```

---

## HIGH Issues (31) - Important

### GM Dashboard Issues (9-16)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 9 | Random equipment utilization fallback | equipment/page.tsx | Show "Setup Required" |
| 10 | Random hours fallback | equipment/page.tsx | Show "No Data" |
| 11 | Hardcoded mock equipment list | equipment/page.tsx | Fetch from Firestore |
| 12 | Oversimplified productivity (×12) | staff/page.tsx | Improve formula |
| 13 | Attendance field name mismatch | staff/page.tsx | Use correct field |
| 14 | Hardcoded 50K revenue target | gm-dashboard.ts | Use branch config |
| 15 | Hardcoded 24h turnaround target | gm-dashboard.ts | Use branch config |
| 16 | Hardcoded branch dropdown | GMDashboardHeader.tsx | Fetch from Firestore |

### API Issues (40-58)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 40 | Default delivery fee hardcoded | calculate-delivery-fee/route.ts | Read from config |
| 42 | 'overpaid' not in schema | payments/route.ts | Add to schema |
| 45 | VIP threshold mismatch | pricing vs segmentation | Use consistent definition |
| 48 | Retention invented when missing | director/insights/route.ts | Show "No Data" |
| 51 | Overpayment not tracked | credit/route.ts | Track and notify |
| 58 | Driver bonus never executes | driver-payouts/route.ts | Fix threshold logic |

### Workstation/Processing Issues (70-73)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 70 | Missing stage mappings | workstation.ts | Add all stages |
| 71 | Inspection null guard missing | workstation.ts | Add null checks |
| 73 | Time unit mismatch | MajorIssuesReviewModal.tsx | Align units |

### Inventory Issues (75-77)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 75 | Race condition in stock adjustment | inventory components | Use transactions |
| 76 | Cost per unit fallback to zero | inventory components | Require value |
| 77 | Random seed data | inventory scripts | Use realistic data |

### Customer Portal Issues (82-83)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 82 | Hardcoded operating hours | portal components | Read from branch |
| 83 | Address display missing cases | portal components | Add fallbacks |

---

## Implementation Phases

### Phase 1: Schema & Configuration Infrastructure (Week 1)

#### 1.1 Update Branch Schema
**File**: `lib/db/schema.ts`

```typescript
interface BranchConfig {
  // Targets (per-branch configurable)
  dailyRevenueTarget: number;
  monthlyRevenueTarget: number;
  retentionTarget: number;           // e.g., 80%
  premiumServiceTarget: number;      // e.g., 20%
  growthTarget: number;              // e.g., 10%
  turnaroundTargetHours: number;     // e.g., 24

  // Operational
  operatingHours: {
    weekday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string } | null;
    is24Hours: boolean;
  };
  branchType: 'main' | 'satellite';
  hasEquipment: boolean;

  // Stock thresholds
  lowStockThreshold: number;         // Multiplier, e.g., 1.2

  // Contact
  whatsappNumber: string;

  // Timestamps
  configUpdatedAt: Timestamp;
  configUpdatedBy: string;
}
```

#### 1.2 Create Company Settings Collection
**New file**: `lib/db/company-settings.ts`

```typescript
interface CompanySettings {
  defaultRetentionTarget: number;
  defaultPremiumTarget: number;
  defaultGrowthTarget: number;
  defaultTurnaroundHours: number;
  defaultLowStockThreshold: number;
  mpesaMinAmount: number;
  mpesaMaxAmount: number;
  cardMinAmount: number;
  operatingCostRatio: number;
  defaultDeliveryFee: number;
  defaultDistanceKm: number;
  lastUpdatedBy: string;
  lastUpdatedAt: Timestamp;
}
```

### Phase 2: Realistic Mock Data Generator (Week 1-2)

**New file**: `scripts/seed-realistic-data.ts`

Key functions:
- `generateHistoricalOrders()` - 180 days of orders
- `generateStaffData()` - Staff with attendance patterns
- `generateEquipment()` - Equipment for main branches only
- `generateFeedback()` - Customer feedback
- `generateTransactions()` - Transactions for all orders
- `generateIssues()` - Various issue types

### Phase 3: Critical Dashboard Fixes (Week 2)

Files to modify:
1. `components/features/director/ExecutiveNarrative.tsx` - Remove hardcoded values
2. `app/(dashboard)/gm/performance/page.tsx` - Remove Math.random()
3. `app/(dashboard)/pipeline/page.tsx` - Fix status, add completed query
4. `hooks/usePipelineFilters.ts` - Update status mapping

### Phase 4: Critical API Fixes (Week 3)

Files to modify:
1. `lib/db/orders.ts` - Fix garment count logic
2. `app/api/quotations/[quotationId]/convert/route.ts` - Fix field name
3. `app/api/pricing/load-metrics/route.ts` - Fix non-existent field
4. `app/api/analytics/director/insights/route.ts` - Remove hardcoded margin

### Phase 5: High Priority Fixes (Week 4)

1. Fix workstation issues
2. Fix inventory issues
3. Fix customer portal (require both phone + email)
4. Fetch branches from Firestore for dropdowns

### Phase 6: Medium/Low Priority + Testing (Week 5)

1. Fix remaining medium issues
2. Fix low priority issues
3. Comprehensive testing
4. Documentation update

---

## "No Data Available" Component

**New file**: `components/ui/no-data-available.tsx`

```typescript
interface NoDataAvailableProps {
  metric: string;
  guidance: {
    message: string;
    contactRole?: 'admin' | 'gm' | 'director';
    uploadPath?: string;
  };
}
```

### Guidance Messages

| Metric | Guidance |
|--------|----------|
| Staff Productivity | "Contact your Branch Manager to assign staff to orders" |
| Equipment Utilization | "Contact System Admin to configure equipment for this branch" |
| Customer Satisfaction | "Feedback data will appear after customer reviews" |
| Revenue Targets | "Contact Director to set branch revenue targets" |
| Historical Comparisons | "Insufficient historical data. Check back in 30 days" |

---

## Files to Create

| File | Purpose |
|------|---------|
| `scripts/seed-realistic-data.ts` | Comprehensive 180-day data generator |
| `components/ui/no-data-available.tsx` | Missing data guidance component |
| `lib/db/company-settings.ts` | Company-wide settings functions |

## Files to Modify (By Priority)

### Critical (24 files)
| File | Changes |
|------|---------|
| `lib/db/schema.ts` | Add BranchConfig interface |
| `components/features/director/ExecutiveNarrative.tsx` | Remove 3 hardcoded values |
| `app/(dashboard)/gm/performance/page.tsx` | Remove 4 Math.random() calls |
| `app/api/analytics/director/insights/route.ts` | Remove 3 hardcoded values |
| `lib/db/orders.ts` | Fix garment count logic |
| `app/api/quotations/[quotationId]/convert/route.ts` | Fix field name |
| `app/api/quotations/[quotationId]/send/route.ts` | Implement actual send |
| `app/api/pricing/load-metrics/route.ts` | Fix non-existent field |
| `hooks/usePipelineFilters.ts` | Fix 'ready' status |
| `app/(dashboard)/pipeline/page.tsx` | Add completed query, inspection status |
| `lib/db/workstation.ts` | Fix ID generation, units, efficiency |
| Portal pages | Require both phone + email |

### High (15 files)
| File | Changes |
|------|---------|
| `app/(dashboard)/gm/equipment/page.tsx` | Remove random fallbacks |
| `components/dashboard/gm/GMDashboardHeader.tsx` | Fetch branches from DB |
| `scripts/seed-branches.ts` | Add real coordinates, config |
| `scripts/seed-test-orders.ts` | Replace with realistic generator |
| `app/(dashboard)/reports/page.tsx` | Fix MTD calculation |
| Various API routes | Fix VIP threshold, bonus logic |

### Medium (11 files)
| File | Changes |
|------|---------|
| `app/(dashboard)/employees/page.tsx` | Replace "--" placeholders |
| `lib/payments/payment-service.ts` | Make limits configurable |
| `lib/db/gm-dashboard.ts` | Use branch-specific targets |
| Various components | Add bounds checking |

---

## Verification Plan

After implementation:

1. **Re-seed database** with new realistic generator
   ```bash
   npm run seed:branches
   npm run seed:realistic-data
   ```

2. **Verify GM Dashboard**:
   - Refresh 5x - values should NOT change (no random)
   - All metrics show real data or "Setup Required"

3. **Verify Director Dashboard**:
   - Health score based on real inputs
   - Narrative shows accurate comparisons or "Insufficient data"

4. **Verify Pipeline**:
   - "Ready" filter shows orders (uses queued_for_delivery)
   - Completion stats non-zero
   - Inspection status visible

5. **Verify Customer Portal**:
   - Registration requires both phone AND email
   - Operating hours fetched from branch

6. **Verify Config Access**:
   - Only Director/GM/Admin can modify targets
   - GM assignments require Director approval

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Random values in dashboards | 8+ | 0 |
| Hardcoded baselines | 15+ | 0 |
| Missing transactions | 24/28 orders | 0 |
| Branch ID mismatches | 3 scripts | 0 |
| Historical data | 0 days | 180 days |
| "No Data" handling | Missing | Complete |

---

## Related Documents

- Full Analysis: `docs/COMPLETE-SYSTEM-ANALYSIS.md`
- Plan File: `C:\Users\HomePC\.claude\plans\sequential-forging-tide.md`

---

**Last Updated**: January 21, 2026
**Status**: Ready for Implementation
**Next Steps**: Approve plan and begin Phase 1