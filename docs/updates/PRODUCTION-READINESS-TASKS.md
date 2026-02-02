# Production Readiness Fix Tasks

**Project**: Lorenzo Dry Cleaners - Production Readiness Audit
**Total Issues**: 83+
**Start Date**: TBD
**Target Completion**: 5 weeks

---

## How to Use This Document

1. **Before Starting**: Complete ALL Phase 1 tasks first
2. **Daily**: Review tasks for current phase
3. **Check Off**: Mark tasks complete with `[x]`
4. **Track Blockers**: Note blockers in comments
5. **Update Status**: Keep this document in sync with progress

**Status Indicators**:
- `[ ]` - Not started
- `[x]` - Completed
- `[!]` - Blocked (note blocker in comments)
- `[~]` - In progress

---

## PHASE 1: SCHEMA & CONFIGURATION INFRASTRUCTURE (Week 1)

**Goal**: Establish per-branch configuration and company settings
**Duration**: 5 days
**Priority**: CRITICAL - All other phases depend on this

---

### Day 1: Branch Configuration Schema

#### Update lib/db/schema.ts
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b fix/phase-1-branch-config-schema
  ```

- [ ] Add BranchConfig interface
  ```typescript
  interface BranchConfig {
    dailyRevenueTarget: number;
    monthlyRevenueTarget: number;
    retentionTarget: number;
    premiumServiceTarget: number;
    growthTarget: number;
    turnaroundTargetHours: number;
    operatingHours: {
      weekday: { open: string; close: string };
      saturday: { open: string; close: string };
      sunday: { open: string; close: string } | null;
      is24Hours: boolean;
    };
    branchType: 'main' | 'satellite';
    hasEquipment: boolean;
    lowStockThreshold: number;
    whatsappNumber: string;
    configUpdatedAt: Timestamp;
    configUpdatedBy: string;
  }
  ```

- [ ] Update Branch type to include BranchConfig
- [ ] Add real coordinates field to Branch type
- [ ] Run TypeScript check
  ```bash
  npx tsc --noEmit
  ```

#### Create lib/db/company-settings.ts
- [ ] Create new file
- [ ] Add CompanySettings interface
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

- [ ] Add getCompanySettings() function
- [ ] Add updateCompanySettings() function
- [ ] Add validation for settings updates

---

### Day 2: Branch Data Functions

#### Update lib/db/branches.ts (or create if not exists)
- [ ] Add getBranchConfig(branchId) function
- [ ] Add updateBranchConfig(branchId, config, userId) function
- [ ] Add getBranchTargets(branchId) function
- [ ] Add function to get default values from companySettings when branch config missing

#### Create Branch Stats Collection
- [ ] Add branchStats collection type
  ```typescript
  interface BranchStats {
    branchId: string;
    date: string; // YYYY-MM-DD
    dailyOrders: number;
    dailyRevenue: number;
    completionRate: number;
    avgTurnaround: number;
    lastUpdated: Timestamp;
  }
  ```

- [ ] Add updateBranchStats() function (for Cloud Functions)
- [ ] Add getBranchStats(branchId, date) function
- [ ] Add getBranchStatsRange(branchId, startDate, endDate) function

---

### Day 3: Firestore Security Rules

#### Update firestore.rules
- [ ] Add helper function getUserBranchId()
- [ ] Add helper function hasRole(roles)
- [ ] Add branch-level read/write rules for orders
- [ ] Add branch-level read/write rules for transactions
- [ ] Add branch-level read/write rules for inventory
- [ ] Add branch-level read/write rules for equipment
- [ ] Add branch-level read/write rules for attendance
- [ ] Add read-only rules for branchStats (only Cloud Functions write)
- [ ] Add role-based rules for branch config updates
- [ ] Test rules with Firebase emulator
  ```bash
  firebase emulators:start
  ```

---

### Day 4: No Data Available Component

#### Create components/ui/no-data-available.tsx
- [ ] Create NoDataAvailable component
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

- [ ] Add guidance messages for each metric type
- [ ] Style component with Tailwind (minimal, black/white theme)
- [ ] Add icon (info icon from Lucide)
- [ ] Export from components/ui/index.ts

#### Create components/ui/setup-required.tsx
- [ ] Create SetupRequired component (for when config is missing)
- [ ] Add link to configuration page
- [ ] Style consistently with NoDataAvailable

---

### Day 5: Phase 1 Testing & PR

#### Testing
- [ ] Test getBranchConfig with existing and new branches
- [ ] Test getCompanySettings
- [ ] Test security rules with different user roles
- [ ] Test NoDataAvailable component renders correctly
- [ ] Test SetupRequired component renders correctly

#### Create PR
- [ ] Review all changes
- [ ] Run linter
  ```bash
  npm run lint
  ```
- [ ] Run build
  ```bash
  npm run build
  ```
- [ ] Create pull request
  ```bash
  git add .
  git commit -m "feat: add branch configuration schema and company settings"
  git push origin fix/phase-1-branch-config-schema
  ```
- [ ] Get code review
- [ ] Merge to develop

---

## PHASE 2: REALISTIC MOCK DATA GENERATOR (Week 1-2)

**Goal**: Create comprehensive seed data for 180 days
**Duration**: 5 days
**Priority**: CRITICAL - Required for dashboard testing

---

### Day 6: Seed Script Structure

#### Create scripts/seed-realistic-data.ts
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b fix/phase-2-realistic-seed-data
  ```

- [ ] Create seed script file
- [ ] Add configuration constants
  ```typescript
  const CONFIG = {
    startDate: subDays(new Date(), 180),
    endDate: new Date(),
    branches: { main: 5, satellite: 16 },
    orderVolume: {
      main: { min: 50, max: 100 },
      satellite: { min: 15, max: 35 }
    },
    staffCount: {
      main: { min: 10, max: 15 },
      satellite: { min: 3, max: 5 }
    },
    revenueTargets: {
      main: { min: 100000, max: 150000 },
      satellite: { min: 25000, max: 45000 }
    },
    customers: { repeatRate: 0.70, oneTimeRate: 0.30 },
    payments: { mpesa: 0.78, card: 0.15, credit: 0.07 },
    orders: { onTimeRate: 0.875, aovMin: 1200, aovMax: 4000 },
    services: { regular: 0.40, dryClean: 0.35, specialty: 0.25 }
  };
  ```

- [ ] Add VALID_BRANCH_IDS constant (from seed-branches.ts)
  ```typescript
  const VALID_BRANCH_IDS = {
    main: ['VILLAGE_MARKET', 'WESTGATE', 'DENNIS_PRITT', 'HURLINGHAM', 'LAVINGTON'],
    satellite: ['MUTHAIGA', 'KILELESHWA', 'ADLIFE', 'NAIVAS_KILIMANI',
                'GREENPARK', 'SOUTH_C_NAIVAS', 'LANGATA_KOBIL', 'BOMAS',
                'WATERFRONT_KAREN', 'FREEDOM_HEIGHTS', 'NGONG_SHELL',
                'IMARA', 'NEXTGEN_SOUTH_C', 'ARBORETUM', 'SHUJAH_MALL', 'MYTOWN_KAREN']
  };
  ```

---

### Day 7: Customer & Order Generation

#### Add Customer Generation
- [ ] Add generateCustomers() function
  - Generate 500-1000 customers
  - 70% should be repeat customers (orderCount > 1)
  - 30% one-time customers
  - All have both phone AND email (required)
  - Distribute across branches by primaryBranchId

#### Add Order Generation
- [ ] Add generateOrdersForDay(date, branchId) function
  - Use branch type to determine volume
  - Use CONFIG.services for service mix
  - Calculate realistic totalAmount (1,200-4,000 KES AOV)
  - Set appropriate status based on order age
  - 85-90% should be completed on-time

- [ ] Add generateHistoricalOrders() function
  - Loop through 180 days
  - For each day, loop through all branches
  - Generate appropriate volume per branch
  - Create corresponding transactions

---

### Day 8: Transaction & Staff Generation

#### Add Transaction Generation
- [ ] Add generateTransactionForOrder(order) function
  - Match payment to order
  - Use CONFIG.payments distribution (78% M-Pesa)
  - All orders must have transactions
  - Status: 'completed' for most, some 'pending'

#### Add Staff Generation
- [ ] Add generateStaffForBranch(branchId, branchType) function
  - Main: 10-15 staff
  - Satellite: 3-5 staff
  - Various roles per branch

#### Add Attendance Generation
- [ ] Add generateAttendanceForStaff(staffId, days) function
  - Generate 180 days of attendance
  - Include some absences (realistic patterns)
  - Weekend variations

---

### Day 9: Equipment, Issues & Feedback

#### Add Equipment Generation (Main Branches Only)
- [ ] Add generateEquipmentForBranch(branchId) function
  - Only for main branches (hasEquipment: true)
  - Types: washer (3), dryer (3), iron (4), press (2), steamer (2)
  - Some in maintenance/offline status
  - Generate utilization history

#### Add Issues Generation
- [ ] Add generateIssues(orders) function
  - Equipment breakdowns
  - Quality defects
  - Delivery delays
  - Staff absences
  - Link to relevant orders

#### Add Feedback Generation
- [ ] Add generateFeedback(orders, customers) function
  - Generate ~50 feedback entries per branch
  - Average rating ~4.0
  - Realistic distribution (some 5s, some 3s, few 1-2s)

---

### Day 10: Testing & Integration

#### Test Seed Script
- [ ] Run seed script in development
  ```bash
  npx ts-node scripts/seed-realistic-data.ts
  ```

- [ ] Verify data counts
  - [ ] Customers: 500-1000
  - [ ] Orders: ~1000+ per main branch, ~500+ per satellite
  - [ ] Transactions: Match order count
  - [ ] Staff: Correct per branch type
  - [ ] Equipment: Only in main branches

- [ ] Verify data relationships
  - [ ] All orders have valid branchId
  - [ ] All orders have corresponding transactions
  - [ ] All customers have valid primaryBranchId
  - [ ] Historical orders have realistic status progression

#### Add npm script
- [ ] Add to package.json
  ```json
  "scripts": {
    "seed:realistic": "ts-node scripts/seed-realistic-data.ts"
  }
  ```

#### Create PR
- [ ] Create pull request
- [ ] Get code review
- [ ] Merge to develop

---

## PHASE 3: CRITICAL DASHBOARD FIXES (Week 2)

**Goal**: Remove all Math.random() and hardcoded values from dashboards
**Duration**: 5 days
**Priority**: CRITICAL

---

### Day 11: Director Dashboard Fixes

#### Fix components/features/director/ExecutiveNarrative.tsx
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b fix/phase-3-director-dashboard
  ```

- [ ] Remove hardcoded 80% retention baseline (line ~273)
  - Replace with getBranchConfig() or show "No Data Available"

- [ ] Remove hardcoded 10% growth forecast (line ~242)
  - Replace with getBranchConfig().growthTarget

- [ ] Remove hardcoded 20% premium target (line ~288)
  - Replace with getBranchConfig().premiumServiceTarget

- [ ] Add proper "insufficient data" handling
  ```typescript
  if (previousPeriodOrders.length === 0) {
    return {
      narrative: "Insufficient historical data for comparison.",
      healthScore: null,
    };
  }
  ```

#### Fix components/features/director/DirectorKPICards.tsx
- [ ] Add null checks for missing data
- [ ] Use NoDataAvailable component when data missing
- [ ] Remove any hardcoded comparison values

---

### Day 12: GM Dashboard Performance Page

#### Fix app/(dashboard)/gm/performance/page.tsx
- [ ] Remove Math.random() for staffProductivity (line ~132)
  - Query from database or show SetupRequired

- [ ] Remove Math.random() for equipmentUtilization (line ~135)
  - Query from equipment collection or show SetupRequired

- [ ] Remove Math.random() for customerSatisfaction (line ~141)
  - Query from customerFeedback collection

- [ ] Fix efficiency score calculation (55% was random)
  - Only calculate with real data
  - Show "Insufficient Data" if components missing

#### Add real data queries
- [ ] Add useStaffProductivity() hook
- [ ] Add useEquipmentUtilization() hook
- [ ] Add useCustomerSatisfaction() hook

---

### Day 13: GM Dashboard Equipment Page

#### Fix app/(dashboard)/gm/equipment/page.tsx
- [ ] Remove random utilization fallback (line ~101)
  - Show SetupRequired instead

- [ ] Remove random hours fallback (line ~104)
  - Show "No tracking data" instead

- [ ] Remove hardcoded mock equipment list (lines ~109-171)
  - Fetch from Firestore
  - Show "No equipment configured" if empty

---

### Day 14: GM Dashboard Branch Dropdown

#### Fix components/dashboard/gm/GMDashboardHeader.tsx
- [ ] Remove hardcoded branch list (lines ~59-63)
- [ ] Add useBranches() hook to fetch from Firestore
- [ ] Filter based on user's access (role-based)
- [ ] Handle loading state

#### Fix lib/db/gm-dashboard.ts
- [ ] Remove hardcoded 50K revenue target (line ~146)
  - Use getBranchConfig().dailyRevenueTarget

- [ ] Remove hardcoded 24h turnaround target (line ~272)
  - Use getBranchConfig().turnaroundTargetHours

---

### Day 15: Phase 3 Testing & PR

#### Testing
- [ ] Refresh GM Dashboard 5x - values should NOT change
- [ ] Verify all metrics show real data or appropriate fallback
- [ ] Test with branch that has no data configured
- [ ] Test Director Dashboard narratives

#### Create PR
- [ ] Run linter
- [ ] Run build
- [ ] Create pull request
- [ ] Get code review
- [ ] Merge to develop

---

## PHASE 4: CRITICAL API FIXES (Week 3)

**Goal**: Fix broken logic and wrong field references in APIs
**Duration**: 5 days
**Priority**: CRITICAL

---

### Day 16: Order Logic Fixes

#### Fix lib/db/orders.ts - Estimated Completion Bug
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b fix/phase-4-api-fixes
  ```

- [ ] Fix garment count logic (lines ~90-111)
  ```typescript
  // BEFORE (BROKEN):
  if (garmentCount > 10) {
    hoursToAdd += 24;
  } else if (garmentCount > 20) {  // NEVER REACHED!
    hoursToAdd += 48;
  }

  // AFTER (FIXED):
  if (garmentCount > 20) {
    hoursToAdd += 48;
  } else if (garmentCount > 10) {
    hoursToAdd += 24;
  }
  ```

- [ ] Add unit test for garment count logic

---

### Day 17: Quotation API Fixes

#### Fix app/api/quotations/[quotationId]/convert/route.ts
- [ ] Fix wrong field in conversion (line ~332)
  ```typescript
  // BEFORE (WRONG):
  totalSpent: customerData.totalSpent + conversionData.paidAmount

  // AFTER (CORRECT):
  totalSpent: customerData.totalSpent + conversionData.totalAmount
  ```

#### Fix app/api/quotations/[quotationId]/send/route.ts
- [ ] Remove mock send (lines ~216-228)
- [ ] Implement actual WhatsApp/email send
- [ ] OR show "Not Configured" status if integration missing
- [ ] Add proper error handling

#### Fix app/api/pricing/load-metrics/route.ts
- [ ] Fix non-existent field reference (lines ~105-107)
- [ ] Add totalWeightKg field to order schema
- [ ] OR remove load metrics feature if not needed

---

### Day 18: Analytics API Fixes

#### Fix app/api/analytics/director/insights/route.ts
- [ ] Remove hardcoded 35% operating margin (lines ~297-304)
  - Get from companySettings.operatingCostRatio

- [ ] Remove hardcoded previous retention calculation (line ~293)
  - Query actual previous period data
  - Show "Insufficient data" if not available

- [ ] Standardize revenue calculation
  - Use transactions collection sum
  - Not order.paidAmount

---

### Day 19: Pipeline Fixes

#### Fix hooks/usePipelineFilters.ts
- [ ] Fix 'ready' status to 'queued_for_delivery' (line ~81)
  ```typescript
  // BEFORE:
  case 'ready':
    return ['ready', 'out_for_delivery'].includes(status);

  // AFTER:
  case 'ready':
    return ['queued_for_delivery', 'out_for_delivery'].includes(status);
  ```

#### Fix app/(dashboard)/pipeline/page.tsx
- [ ] Add 'inspection' status to activeStatuses array (lines ~84-93)
- [ ] Add separate query for completed orders (delivered, collected)
- [ ] Fix completionRate calculation (currently always 0)
- [ ] Fix avgProcessingTime calculation (currently always 0)

---

### Day 20: Phase 4 Testing & PR

#### Testing
- [ ] Test order creation with different garment counts
- [ ] Test quotation conversion updates correct field
- [ ] Test pipeline "Ready" filter shows orders
- [ ] Test completion stats are non-zero
- [ ] Test Director insights with real data

#### Create PR
- [ ] Run linter
- [ ] Run build
- [ ] Create pull request
- [ ] Get code review
- [ ] Merge to develop

---

## PHASE 5: HIGH PRIORITY FIXES (Week 4)

**Goal**: Fix workstation, inventory, and customer portal issues
**Duration**: 5 days
**Priority**: HIGH

---

### Day 21: Workstation Fixes

#### Fix lib/db/workstation.ts
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b fix/phase-5-high-priority
  ```

- [ ] Fix assignment ID generation (uses Math.random())
  - Use UUID or timestamp-based ID

- [ ] Fix duration unit mismatch (seconds vs hours)
  - Standardize to minutes

- [ ] Fix efficiency score calculation error
  - Review and correct formula

- [ ] Add missing stage mappings

- [ ] Add null guards for inspection

---

### Day 22: Inventory Fixes

#### Fix inventory components
- [ ] Fix race condition in stock adjustment
  - Use Firestore transactions

- [ ] Fix cost per unit fallback to zero
  - Require value or show error

- [ ] Remove random seed data from inventory scripts
  - Use realistic seed data

- [ ] Fix ID generation (uses Math.random())
  - Use server-side generation

---

### Day 23: Customer Portal Fixes

#### Fix portal authentication
- [ ] Require BOTH phone AND email for registration
  - Update registration form validation
  - Update auth/actions.ts

- [ ] Fix customer lookup (fails for phone auth users)
  - Query by phone AND email

#### Fix portal components
- [ ] Remove hardcoded operating hours
  - Fetch from branch config

- [ ] Add address display fallbacks
  - Handle missing cases

- [ ] Fix overpaid status display
  - Currently never displays

---

### Day 24: Reports Page Fixes

#### Fix app/(dashboard)/reports/page.tsx
- [ ] Fix MTD change calculation (line ~178)
  - Compare to same period last month
  - Not 1 day vs entire month

#### Fix revenue consistency
- [ ] Standardize to use transactions collection
- [ ] Match Director dashboard calculation

---

### Day 25: Phase 5 Testing & PR

#### Testing
- [ ] Test workstation assignment creation
- [ ] Test inventory stock adjustment (concurrent)
- [ ] Test customer registration requires both phone and email
- [ ] Test customer portal shows correct operating hours
- [ ] Test reports page MTD calculation

#### Create PR
- [ ] Run linter
- [ ] Run build
- [ ] Create pull request
- [ ] Get code review
- [ ] Merge to develop

---

## PHASE 6: MEDIUM/LOW PRIORITY FIXES (Week 5)

**Goal**: Fix remaining issues and comprehensive testing
**Duration**: 5 days
**Priority**: MEDIUM/LOW

---

### Day 26: Medium Priority Fixes

#### Employees Page
- [ ] Replace "--" placeholders (lines ~263-275)
  - Calculate from real data
  - Show NoDataAvailable if missing

#### Productivity formulas
- [ ] Fix oversimplified productivity (×12 formula)
  - Use more sophisticated calculation
  - Consider quality, complexity, time

#### Payment limits
- [ ] Make payment limits configurable
  - Read from companySettings

---

### Day 27: Low Priority Fixes

#### Deliveries Page
- [ ] Fix "Active Routes" duplication
  - Calculate distinct routes

#### Loyalty Points
- [ ] Document rounding policy
  - Add to user-facing documentation

#### Double Rounding
- [ ] Fix pricing calculation rounding
  - Round once at end

---

### Day 28-29: Comprehensive Testing

#### Dashboard Testing
- [ ] Test GM Dashboard with full seed data
- [ ] Test Director Dashboard with full seed data
- [ ] Test Pipeline with all statuses
- [ ] Test Reports page accuracy

#### API Testing
- [ ] Test all fixed API endpoints
- [ ] Test with edge cases (empty data, null values)
- [ ] Test security rules (branch isolation)

#### Customer Portal Testing
- [ ] Test registration flow
- [ ] Test order tracking
- [ ] Test profile management

---

### Day 30: Final Verification & Documentation

#### Verification Checklist
- [ ] GM Dashboard: Refresh 5x - values stable (no random)
- [ ] All metrics show real data or "Setup Required"
- [ ] Director Dashboard: Health score based on real data
- [ ] Pipeline: "Ready" filter works, stats accurate
- [ ] Customer Portal: Registration requires phone + email
- [ ] Security: Branch isolation enforced

#### Documentation Updates
- [ ] Update PLANNING.md with completed tasks
- [ ] Update TASKS.md main file
- [ ] Update API documentation if changed
- [ ] Create release notes

#### Final Deployment
- [ ] Run full test suite
- [ ] Deploy to staging
- [ ] Smoke test in staging
- [ ] Deploy to production
- [ ] Monitor for 24 hours

---

## Post-Implementation Tasks

### Monitoring Setup
- [ ] Set up error monitoring for new components
- [ ] Add dashboard performance monitoring
- [ ] Set up alerts for data anomalies

### Training Materials
- [ ] Update staff training for new features
- [ ] Document "No Data Available" meanings
- [ ] Document branch configuration process

### Handover
- [ ] Knowledge transfer for branch config management
- [ ] Document how to add new branches
- [ ] Document how to modify targets

---

## Summary of Files to Modify

### CRITICAL Priority (24 files)
| File | Issue Count |
|------|-------------|
| `lib/db/schema.ts` | Add BranchConfig |
| `components/features/director/ExecutiveNarrative.tsx` | 3 fixes |
| `app/(dashboard)/gm/performance/page.tsx` | 4 fixes |
| `app/api/analytics/director/insights/route.ts` | 3 fixes |
| `lib/db/orders.ts` | 1 fix |
| `app/api/quotations/[quotationId]/convert/route.ts` | 1 fix |
| `app/api/quotations/[quotationId]/send/route.ts` | 1 fix |
| `app/api/pricing/load-metrics/route.ts` | 1 fix |
| `hooks/usePipelineFilters.ts` | 1 fix |
| `app/(dashboard)/pipeline/page.tsx` | 2 fixes |
| `lib/db/workstation.ts` | 3 fixes |
| Portal pages | Multiple fixes |

### HIGH Priority (15 files)
| File | Issue Count |
|------|-------------|
| `app/(dashboard)/gm/equipment/page.tsx` | 3 fixes |
| `components/dashboard/gm/GMDashboardHeader.tsx` | 1 fix |
| `scripts/seed-*.ts` | Multiple fixes |
| `app/(dashboard)/reports/page.tsx` | 2 fixes |
| Various API routes | Multiple fixes |

### Files to Create
| File | Purpose |
|------|---------|
| `scripts/seed-realistic-data.ts` | 180-day data generator |
| `components/ui/no-data-available.tsx` | Missing data component |
| `components/ui/setup-required.tsx` | Config missing component |
| `lib/db/company-settings.ts` | Company settings functions |

---

**Last Updated**: January 21, 2026
**Status**: Ready for Implementation
**Total Tasks**: 150+