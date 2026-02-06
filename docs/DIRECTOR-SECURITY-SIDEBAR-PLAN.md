# Director/GM Dashboard - Security Rules & Strategic Navigation

## Overview

This plan addresses three major requirements:

1. **Security Rules Fix** - Add missing collection rules and executive cross-branch access
2. **HQ Staff Roles** - Support non-executive staff at HQ with limited permissions
3. **Director Strategic Sidebar** - Complete sidebar overhaul for director's strategic navigation

---

# PART A: Firebase Security Rules Fix

## Problem

The GM Dashboard (`lib/db/gm-dashboard.ts`) is throwing `Missing or insufficient permissions` errors because:

1. **Missing Security Rules** - 4 collections have NO rules defined:
   - `attendance`
   - `equipment`
   - `issues`
   - `customerFeedback`

2. **Director/GM Branch Access** - The Director (Lawrence) and GM (Grace) operate from HQ, not individual branches. Current rules require `canAccessBranch()` which fails if they don't have a proper `branchId`.

3. **HQ Staff** - Other staff at HQ (not executives) need limited access without executive privileges.

## Collections Queried by GM Dashboard

| Collection | Functions | Has Rules? |
|------------|-----------|------------|
| `orders` | fetchTodayOrderMetrics, fetchTurnaroundMetrics, fetchBranchPerformance, fetchLiveOrderQueue | ✅ Yes |
| `transactions` | fetchTodayRevenue, fetchBranchPerformance | ✅ Yes |
| `branches` | getBranchDailyTarget, getBranchTurnaroundTarget, fetchBranchPerformance | ✅ Yes |
| `users` | fetchStaffOnDuty | ✅ Yes (but needs cross-branch) |
| `attendance` | fetchStaffOnDuty | ❌ **MISSING** |
| `equipment` | fetchEquipmentStatus | ❌ **MISSING** |
| `issues` | fetchUrgentIssues, fetchBranchPerformance | ❌ **MISSING** |
| `customerFeedback` | fetchSatisfactionMetrics | ❌ **MISSING** |

---

## Solution

### Part 1: Add Helper Function for Executive Roles

Add a helper that grants Director and GM cross-branch read access:

```javascript
/**
 * Check if user is an executive (Director or GM) who can read all branches
 */
function isExecutive() {
  return isAuthenticated() && hasAnyRole(['director', 'general_manager']);
}
```

### Part 2: Update Existing Rules for Cross-Branch Access

Update `users`, `branches`, `orders`, and `transactions` rules to allow executives to read across all branches without `canAccessBranch()` requirement.

### Part 3: Add Missing Collection Rules

Add security rules for the 4 missing collections:

---

## Phase 1: Add Security Rules (P0 - Critical)

**File:** `firestore.rules`

### 1.1 Add `isExecutive()` Helper Function

After the `isManagement()` function (line ~103), add:

```javascript
/**
 * Check if user is an executive (Director/GM) who can view all branches
 */
function isExecutive() {
  return isAuthenticated() && hasAnyRole(['director', 'general_manager']);
}
```

### 1.2 Add `attendance` Collection Rules

```javascript
// ============================================
// ATTENDANCE COLLECTION
// ============================================

match /attendance/{attendanceId} {
  // Executives and super admins can read all attendance
  // Staff can read attendance from their branch
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    (isStaff() && canAccessBranch(resource.data.branchId))
  );

  // Staff can create their own attendance records
  // Management can create attendance for their branch
  allow create: if isAuthenticated() && (
    isSuperAdmin() ||
    (isStaff() && resource.data.employeeId == currentUserId()) ||
    (isManagement() && canAccessBranch(request.resource.data.branchId))
  );

  // Staff can update their own attendance (clock out, break)
  // Management can update attendance in their branch
  allow update: if isAuthenticated() && (
    isSuperAdmin() ||
    (isStaff() && resource.data.employeeId == currentUserId()) ||
    (isManagement() && canAccessBranch(resource.data.branchId))
  );

  // Only super admins can delete attendance records
  allow delete: if isSuperAdmin();
}
```

### 1.3 Add `equipment` Collection Rules

```javascript
// ============================================
// EQUIPMENT COLLECTION
// ============================================

match /equipment/{equipmentId} {
  // Executives and super admins can read all equipment
  // Staff can read equipment from their branch
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    (isStaff() && canAccessBranch(resource.data.branchId))
  );

  // Only management can create equipment in their branches
  allow create: if isManagement() && canAccessBranch(request.resource.data.branchId);

  // Management can update equipment in their branches
  // Executives and super admins can update any equipment
  allow update: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    (isManagement() && canAccessBranch(resource.data.branchId))
  );

  // Only super admins can delete equipment
  allow delete: if isSuperAdmin();
}
```

### 1.4 Add `issues` Collection Rules

```javascript
// ============================================
// ISSUES COLLECTION
// ============================================

match /issues/{issueId} {
  // Executives and super admins can read all issues
  // Staff can read issues from their branch
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    (isStaff() && canAccessBranch(resource.data.branchId))
  );

  // Staff can create issues in their branch
  allow create: if isStaff() && canAccessBranch(request.resource.data.branchId);

  // Staff can update issues in their branch
  // Executives can update any issue
  allow update: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    (isStaff() && canAccessBranch(resource.data.branchId))
  );

  // Only super admins can delete issues
  allow delete: if isSuperAdmin();
}
```

### 1.5 Add `customerFeedback` Collection Rules

```javascript
// ============================================
// CUSTOMER FEEDBACK COLLECTION
// ============================================

match /customerFeedback/{feedbackId} {
  // Executives and super admins can read all feedback
  // Staff can read feedback from their branch
  // Customers can read their own feedback
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    (isStaff() && canAccessBranch(resource.data.branchId)) ||
    resource.data.customerId == currentUserId()
  );

  // Customers can create feedback for their orders
  // Staff can create feedback on behalf of customers
  allow create: if isAuthenticated() && (
    request.resource.data.customerId == currentUserId() ||
    isStaff()
  );

  // Feedback is immutable - no updates allowed
  allow update: if false;

  // Only super admins can delete feedback
  allow delete: if isSuperAdmin();
}
```

### 1.6 Update `users` Collection for Executive Cross-Branch Read

Update the users read rule (line ~160-164) to allow executives to read all users:

```javascript
match /users/{userId} {
  // Users can read their own profile
  // Super admins can read all profiles
  // Executives can read all profiles (for staff overview)
  // Managers can read profiles in their allowed branches
  allow read: if isAuthenticated() && (
    currentUserId() == userId ||
    isSuperAdmin() ||
    isExecutive() ||
    (isManagement() && canAccessBranch(resource.data.branchId))
  );
  // ... rest remains the same
}
```

### 1.7 Update `branches` Collection for Executive Access

Update branches read rule to allow executives to read all branches:

```javascript
match /branches/{branchId} {
  // All authenticated users can read branches they have access to
  // Super admins and executives can read all branches
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    canAccessBranch(branchId)
  );
  // ... rest remains the same
}
```

---

## Phase 2: Set Custom Claims for Director & GM (P0 - Critical)

Ensure Lawrence (Director) and Grace (GM) have proper custom claims set:

```javascript
// Via Firebase Admin SDK or Firebase Console
{
  role: 'director',      // or 'general_manager'
  branchId: 'HQ',        // Special HQ branch for executives
  isSuperAdmin: false,   // Only for true super admins
  branchAccess: []       // Optional: list specific branches if needed
}
```

**Option A:** Create an "HQ" branch document in `branches` collection (RECOMMENDED)
**Option B:** Update security rules to handle null/undefined branchId for executives

### 2.2 HQ Staff (Non-Executive)

For other HQ staff who need branch-level access but aren't executives:

```javascript
// Custom claims for HQ staff
{
  role: 'front_desk',     // or any operational role
  branchId: 'HQ',         // HQ branch
  isSuperAdmin: false,
  branchAccess: []        // Empty - only HQ access unless specified
}
```

These staff will have normal branch-scoped access (to HQ only), not executive cross-branch access.

---

# PART B: Permission Approval Workflow

## Director Approves New Staff Permissions

When GM creates a new staff member, the Director must approve their permissions.

### Phase 3: Permission Approval System (P1 - High)

#### 3.1 Database Schema Addition

**Collection:** `permissionRequests`

```typescript
interface PermissionRequest {
  requestId: string;
  userId: string;           // User being granted permissions
  userName: string;
  requestedRole: UserRole;
  requestedBranchId: string;
  requestedBranchAccess: string[];
  requestedBy: string;      // GM's userId
  requestedByName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;      // Director's userId
  approvedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
}
```

#### 3.2 Security Rules for Permission Requests

```javascript
// ============================================
// PERMISSION REQUESTS COLLECTION
// ============================================

match /permissionRequests/{requestId} {
  // Director can read all permission requests
  // GM can read their own requests
  allow read: if isAuthenticated() && (
    hasRole('director') ||
    isSuperAdmin() ||
    resource.data.requestedBy == currentUserId()
  );

  // GM can create permission requests
  allow create: if hasRole('general_manager') &&
    request.resource.data.status == 'pending' &&
    request.resource.data.requestedBy == currentUserId();

  // Only Director can approve/reject
  allow update: if hasRole('director') &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['status', 'approvedBy', 'approvedAt', 'rejectionReason']);

  // Only super admin can delete
  allow delete: if isSuperAdmin();
}
```

#### 3.3 UI Components

**Files to Create:**
- `app/(dashboard)/admin/permission-requests/page.tsx` - Director's approval queue
- `components/features/admin/PermissionRequestCard.tsx` - Request card component
- `lib/db/permission-requests.ts` - Database functions

**Director View:** Notification badge on sidebar showing pending approvals

---

# PART C: Director Strategic Sidebar

## Complete Sidebar Overhaul for Director Role

The Director needs a strategic navigation structure, not operational menus.

### Phase 4: Director Sidebar Implementation (P0 - Critical)

#### 4.1 Director Navigation Structure

Based on the reference design (`reference/lorenzo-director-full-dashboard.jsx`):

```typescript
// Director-specific navigation items
const directorNavigationItems: NavItem[] = [
  // MAIN
  {
    label: 'Command Center',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Strategic Intelligence',
    href: '/director/intelligence',
    icon: Brain,
    badge: 'NEW',
  },

  // FINANCIAL
  {
    label: 'Financial Command',
    href: '/director/financial',
    icon: Wallet,
  },
  {
    label: 'Growth Hub',
    href: '/director/growth',
    icon: Rocket,
  },
  {
    label: 'Performance Deep Dive',
    href: '/director/performance',
    icon: TrendingUp,
  },

  // GOVERNANCE
  {
    label: 'Risk & Compliance',
    href: '/director/risk',
    icon: ShieldCheck,
    badge: '2', // Dynamic badge for pending items
  },
  {
    label: 'Leadership & People',
    href: '/director/leadership',
    icon: Users,
  },
  {
    label: 'Board Room',
    href: '/director/board',
    icon: FileText,
  },

  // AI-POWERED
  {
    label: 'AI Strategy Lab',
    href: '/director/ai-lab',
    icon: FlaskConical,
    badge: 'BETA',
  },
];
```

#### 4.2 Sidebar Component Updates

**File:** `components/modern/ModernSidebar.tsx`

Add role-based navigation:

```typescript
// Determine which navigation to show based on role
const getNavigationItems = (role: UserRole): NavItem[] => {
  if (role === 'director') {
    return directorNavigationItems;
  }
  // Default operational navigation for all other roles
  return operationalNavigationItems;
};
```

#### 4.3 Director Route Pages to Create

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/director/intelligence` | `StrategicIntelligencePage` | Market analysis, competitors, sentiment |
| `/director/financial` | `FinancialCommandPage` | P&L, cash flow, budget vs actual |
| `/director/growth` | `GrowthHubPage` | Expansion, new services, corporate pipeline |
| `/director/performance` | `PerformanceDeepDivePage` | KPI history, branch comparison, cohort analysis |
| `/director/risk` | `RiskCompliancePage` | Risk register, compliance, incidents |
| `/director/leadership` | `LeadershipPeoplePage` | Manager scorecards, succession, compensation |
| `/director/board` | `BoardRoomPage` | Report generator, meeting prep, documents |
| `/director/ai-lab` | `AIStrategyLabPage` | Scenario builder, simulations, recommendations |

#### 4.4 Files to Create

**Route Pages:**
- `app/(dashboard)/director/intelligence/page.tsx`
- `app/(dashboard)/director/financial/page.tsx`
- `app/(dashboard)/director/growth/page.tsx`
- `app/(dashboard)/director/performance/page.tsx`
- `app/(dashboard)/director/risk/page.tsx`
- `app/(dashboard)/director/leadership/page.tsx`
- `app/(dashboard)/director/board/page.tsx`
- `app/(dashboard)/director/ai-lab/page.tsx`

**Components (per reference file):**
- `components/features/director/StrategicIntelligence.tsx`
- `components/features/director/FinancialCommand.tsx`
- `components/features/director/GrowthHub.tsx`
- `components/features/director/PerformanceDeepDive.tsx`
- `components/features/director/RiskCompliance.tsx`
- `components/features/director/LeadershipPeople.tsx`
- `components/features/director/BoardRoom.tsx`
- `components/features/director/AIStrategyLab.tsx`

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `firestore.rules` | Add isExecutive() helper, add 5 missing collection rules (attendance, equipment, issues, customerFeedback, permissionRequests), update users/branches rules | P0 |
| `components/modern/ModernSidebar.tsx` | Add role-based navigation, director-specific sidebar | P0 |
| `app/(dashboard)/director/*` | Create 8 new director route pages | P1 |
| `components/features/director/*` | Create 8 new strategic components | P1 |
| `lib/db/permission-requests.ts` | Create permission request database functions | P1 |
| `app/(dashboard)/admin/permission-requests/page.tsx` | Director's approval queue | P1 |

---

## Implementation Order

### Phase 1: Security Rules (P0)
1. Add `isExecutive()` helper function
2. Add `attendance` collection rules
3. Add `equipment` collection rules
4. Add `issues` collection rules
5. Add `customerFeedback` collection rules
6. Add `permissionRequests` collection rules
7. Update `users` collection rules for executive cross-branch read
8. Update `branches` collection rules for executive access
9. Deploy rules: `firebase deploy --only firestore:rules`

### Phase 2: Director Sidebar (P0)
10. Update `ModernSidebar.tsx` with role-based navigation
11. Create director navigation items array
12. Add section headers (MAIN, FINANCIAL, GOVERNANCE, AI-POWERED)

### Phase 3: Director Routes (P1)
13. Create `/director/intelligence` page
14. Create `/director/financial` page
15. Create `/director/growth` page
16. Create `/director/performance` page
17. Create `/director/risk` page
18. Create `/director/leadership` page
19. Create `/director/board` page
20. Create `/director/ai-lab` page

### Phase 4: Permission Workflow (P1)
21. Create `permissionRequests` collection schema
22. Create `lib/db/permission-requests.ts`
23. Create permission approval UI for Director

---

## Success Criteria

- [ ] Director (Lawrence) can view dashboard without permission errors
- [ ] GM (Grace) can view GM dashboard without permission errors
- [ ] Both can see data across all branches
- [ ] HQ staff have appropriate branch-scoped access
- [ ] No `Missing or insufficient permissions` errors in console
- [ ] Director sees strategic sidebar (9 items, not operational menus)
- [ ] Director can navigate to all 8 strategic pages
- [ ] Director can approve/reject permission requests from GM

---

---

# PART D: GM Strategic Sidebar & Dashboard Improvements

## Overview

Implement a dedicated GM sidebar and improve the GM dashboard based on the reference design (`reference/lorenzo-gm-dashboard-full.jsx`).

### GM Navigation Structure

Based on the reference file, the GM needs 6 operational pages:

```typescript
const gmNavigationItems: NavItem[] = [
  // OPERATIONS
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Live Orders',
    href: '/gm/orders',
    icon: Package,
    badge: '29', // Dynamic count of active orders
  },
  {
    label: 'Staff',
    href: '/gm/staff',
    icon: Users,
  },
  {
    label: 'Equipment',
    href: '/gm/equipment',
    icon: Wrench,
  },
  {
    label: 'Performance',
    href: '/gm/performance',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
```

### Phase 5: GM Sidebar Implementation (P1)

#### 5.1 Update ModernSidebar.tsx

Add GM navigation items and extend role-based routing:

```typescript
const getNavigationItems = (role: UserRole): NavItem[] => {
  if (role === 'director') {
    return directorNavigationItems;
  }
  if (role === 'general_manager') {
    return gmNavigationItems;
  }
  // Default operational navigation for all other roles
  return operationalNavigationItems;
};
```

#### 5.2 GM Route Pages to Create

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/gm/orders` | `LiveOrdersPage` | Real-time order queue with filters |
| `/gm/staff` | `StaffManagementPage` | Staff on duty, performance metrics |
| `/gm/equipment` | `EquipmentStatusPage` | Equipment status by branch |
| `/gm/performance` | `BranchPerformancePage` | Efficiency breakdown with drill-down |

#### 5.3 Files to Create

**Route Pages:**
- `app/(dashboard)/gm/orders/page.tsx`
- `app/(dashboard)/gm/staff/page.tsx`
- `app/(dashboard)/gm/equipment/page.tsx`
- `app/(dashboard)/gm/performance/page.tsx`

**Components (extract from reference file):**
- `components/features/gm/LiveOrderQueue.tsx`
- `components/features/gm/StaffOverview.tsx`
- `components/features/gm/EquipmentStatus.tsx`
- `components/features/gm/BranchPerformance.tsx`
- `components/features/gm/BranchDetailView.tsx`

---

# PART E: Metrics Calculation Documentation

See `docs/METRICS-CALCULATION-GUIDE.md` for comprehensive metrics documentation including:
- Branch Efficiency Formula (5-component weighted average)
- Turnaround Efficiency calculation
- Staff Productivity calculation
- Equipment Utilization calculation
- Revenue Achievement calculation
- Customer Satisfaction calculation

---

## Updated Implementation Order

### Phase 1: Security Rules (P0) - Existing
1-9. (As previously listed)

### Phase 2: Director Sidebar (P0) - Existing
10-12. (As previously listed)

### Phase 3: Director Routes (P1) - Existing
13-20. (As previously listed)

### Phase 4: Permission Workflow (P1) - Existing
21-23. (As previously listed)

### Phase 5: GM Sidebar (P1) - NEW
24. Update `ModernSidebar.tsx` with GM navigation items
25. Create `/gm/orders` page (Live Orders)
26. Create `/gm/staff` page (Staff Management)
27. Create `/gm/equipment` page (Equipment Status)
28. Create `/gm/performance` page (Branch Performance)

### Phase 6: Metrics Documentation (P1) - NEW
29. Create `docs/METRICS-CALCULATION-GUIDE.md`
30. Update `lib/db/gm-dashboard.ts` with proper efficiency calculation
31. Create `BranchDetailView.tsx` with efficiency breakdown UI
32. Add configuration values to branch schema

---

## Updated Success Criteria

- [ ] Director (Lawrence) can view dashboard without permission errors
- [ ] GM (Grace) can view GM dashboard without permission errors
- [ ] Both can see data across all branches
- [ ] HQ staff have appropriate branch-scoped access
- [ ] No `Missing or insufficient permissions` errors in console
- [ ] Director sees strategic sidebar (9 items)
- [ ] GM sees operational sidebar (6 items)
- [ ] Director can navigate to all 8 strategic pages
- [ ] GM can navigate to all 4 GM-specific pages
- [ ] Director can approve/reject permission requests from GM
- [ ] Branch efficiency shows weighted 5-component breakdown
- [ ] Metrics documentation is complete and accessible
- [ ] All metric calculations match the documented formulas

---

## Previous Plan (COMPLETED)

### Director Dashboard Production Readiness - DONE ✅

- ✅ Phase 1: Route Integration - Director sees dashboard at `/dashboard`
- ✅ Phase 2: AI Recommendations - Integrated with agent system
- ✅ Phase 3: Fixed simulated data in BranchComparison, OperationalHealth, ExecutiveSummary
- ✅ Phase 4: Deleted `/director` route and sidebar link
