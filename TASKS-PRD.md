# Lorenzo Dry Cleaners - PRD-Based Task Tracker

> **IMPORTANT**: This file takes precedence over `TASKS.md`. Reference this file FIRST for current tasks and priorities.

---

## Quick Reference

| Document | Purpose |
|----------|---------|
| `CLAUDE-PRD.md` | Development instructions |
| `PLANNING-PRD.md` | Project phases and status |
| `docs/PRD-LORENZO-DRY-CLEANERS.md` | Complete specifications |

**Status Legend:** ❌ Not Started | 🔄 In Progress | ✅ Completed | ⚠️ Blocked/Partial

---

## Directory Exclusions

### IGNORE until explicitly instructed:
```
updates/          # Do NOT read or modify
```

---

## Current Sprint: January 2026

### Priority Overview

| Priority | Task Group | Status | Blocking Issues |
|----------|------------|--------|-----------------|
| **P0** | Firebase Security Rules | 🔄 In Progress | GM Dashboard errors |
| **P1** | GM Dashboard Completion | ⚠️ Blocked | Needs P0 complete |
| **P1** | Director Strategic Pages | ❌ Not Started | None |
| **P2** | Biometric UI Completion | ❌ Not Started | None |
| **P2** | AI Features Enhancement | 🔄 In Progress | None |

---

## P0: Firebase Security Rules Fix (CRITICAL)

**Reference:** PRD Appendix A, Section 9
**File:** `firestore.rules`
**Blocking:** GM Dashboard permission errors

### Tasks

- [ ] **Add `isExecutive()` helper function**
  ```javascript
  function isExecutive() {
    return isAuthenticated() && hasAnyRole(['director', 'general_manager']);
  }
  ```

- [ ] **Add `attendance` collection rules**
  - Read: Executives, super admins, branch staff
  - Create: Staff for self, management for branch
  - Update: Staff for self, management for branch
  - Delete: Super admin only

- [ ] **Add `equipment` collection rules**
  - Read: Executives, super admins, branch staff
  - Create: Management for their branches
  - Update: Management, executives
  - Delete: Super admin only

- [ ] **Add `issues` collection rules**
  - Read: Executives, super admins, branch staff
  - Create: Staff for their branch
  - Update: Staff for branch, executives for any
  - Delete: Super admin only

- [ ] **Add `customerFeedback` collection rules**
  - Read: Executives, staff for branch, customer for own
  - Create: Customers for orders, staff on behalf
  - Update: None (immutable)
  - Delete: Super admin only

- [ ] **Add `permissionRequests` collection rules**
  - Read: Director, super admin, GM for own requests
  - Create: GM only, status must be 'pending'
  - Update: Director only (approve/reject)
  - Delete: Super admin only

- [ ] **Update `users` collection for executive cross-branch read**
  ```javascript
  allow read: if isAuthenticated() && (
    currentUserId() == userId ||
    isSuperAdmin() ||
    isExecutive() ||
    (isManagement() && canAccessBranch(resource.data.branchId))
  );
  ```

- [ ] **Update `branches` collection for executive access**
  ```javascript
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    canAccessBranch(branchId)
  );
  ```

- [ ] **Deploy security rules**
  ```bash
  firebase deploy --only firestore:rules
  ```

- [ ] **Verify Director can access GM Dashboard without errors**

- [ ] **Verify GM can access all branches data**

---

## P1: GM Dashboard Completion (85% → 100%)

**Reference:** PRD Section 4.13
**Depends on:** P0 Security Rules Fix

### Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Data Hooks | ✅ Complete | `hooks/useGMDashboard.ts` |
| DB Functions | ✅ Complete | `lib/db/gm-dashboard.ts` |
| Types | ✅ Complete | `types/gm-dashboard.ts` |
| Dashboard Page | 🔄 Partial | Permission errors |
| GM Sidebar | ❌ Not Started | Needs navigation items |
| GM Sub-pages | ❌ Not Started | 4 pages needed |

### Tasks

#### Sidebar Navigation
- [ ] **Add GM navigation items to `ModernSidebar.tsx`**
  ```typescript
  const gmNavigationItems: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders', href: '/gm/orders', icon: Package },
    { label: 'Staff', href: '/gm/staff', icon: Users },
    { label: 'Equipment', href: '/gm/equipment', icon: Wrench },
    { label: 'Performance', href: '/gm/performance', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];
  ```

- [ ] **Update `getNavigationItems()` function for GM role**

#### GM Pages to Create

- [ ] **Create `/gm/orders` page (Live Orders)**
  - File: `app/(dashboard)/gm/orders/page.tsx`
  - Features: Real-time order queue, filters by branch/status
  - Hook: `useGMLiveOrders(branchFilter)`

- [ ] **Create `/gm/staff` page (Staff Management)**
  - File: `app/(dashboard)/gm/staff/page.tsx`
  - Features: Staff on duty across branches, performance metrics
  - Hook: `useGMDashboard()` → `staffOnDuty`

- [ ] **Create `/gm/equipment` page (Equipment Status)**
  - File: `app/(dashboard)/gm/equipment/page.tsx`
  - Features: Equipment health by branch, maintenance schedule
  - Hook: `useGMEquipmentStatus(branchFilter)`

- [ ] **Create `/gm/performance` page (Branch Performance)**
  - File: `app/(dashboard)/gm/performance/page.tsx`
  - Features: Efficiency breakdown, drill-down by branch
  - Hook: `useGMBranchPerformance(branchFilter)`

#### Components to Create

- [ ] **Create `components/features/gm/LiveOrderQueue.tsx`**
  - Real-time order list
  - Status filtering
  - Branch filtering
  - Quick actions (view details, assign)

- [ ] **Create `components/features/gm/StaffOverview.tsx`**
  - Staff on duty cards
  - Performance metrics
  - Attendance status

- [ ] **Create `components/features/gm/EquipmentStatus.tsx`**
  - Equipment health indicators
  - Maintenance alerts
  - Branch grouping

- [ ] **Create `components/features/gm/BranchPerformance.tsx`**
  - Efficiency breakdown chart
  - 5-component weighted calculation
  - Drill-down capability

- [ ] **Create `components/features/gm/BranchDetailView.tsx`**
  - Detailed branch metrics
  - Efficiency component breakdown
  - Historical comparison

---

## P1: Director Strategic Pages

**Reference:** PRD Section 4.12
**File Locations:** `app/(dashboard)/director/*`

### Sidebar Updates

- [ ] **Add Director navigation items to `ModernSidebar.tsx`**
  ```typescript
  const directorNavigationItems: NavItem[] = [
    // MAIN
    { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Strategic Intelligence', href: '/director/intelligence', icon: Brain, badge: 'NEW' },
    // FINANCIAL
    { label: 'Financial Command', href: '/director/financial', icon: Wallet },
    { label: 'Growth Hub', href: '/director/growth', icon: Rocket },
    { label: 'Performance Deep Dive', href: '/director/performance', icon: TrendingUp },
    // GOVERNANCE
    { label: 'Risk & Compliance', href: '/director/risk', icon: ShieldCheck },
    { label: 'Leadership & People', href: '/director/leadership', icon: Users },
    { label: 'Board Room', href: '/director/board', icon: FileText },
    // AI-POWERED
    { label: 'AI Strategy Lab', href: '/director/ai-lab', icon: FlaskConical, badge: 'BETA' },
  ];
  ```

- [ ] **Add section headers in sidebar** (MAIN, FINANCIAL, GOVERNANCE, AI-POWERED)

### Director Pages to Create

| Route | File | Purpose | Priority |
|-------|------|---------|----------|
| `/director/intelligence` | `intelligence/page.tsx` | Market analysis, competitors, sentiment | P1 |
| `/director/financial` | `financial/page.tsx` | P&L, cash flow, budget vs actual | P1 |
| `/director/growth` | `growth/page.tsx` | Expansion, new services, corporate pipeline | P1 |
| `/director/performance` | `performance/page.tsx` | KPI history, branch comparison, cohort analysis | P1 |
| `/director/risk` | `risk/page.tsx` | Risk register, compliance, incidents | P2 |
| `/director/leadership` | `leadership/page.tsx` | Manager scorecards, succession, compensation | P2 |
| `/director/board` | `board/page.tsx` | Report generator, meeting prep, documents | P2 |
| `/director/ai-lab` | `ai-lab/page.tsx` | Scenario builder, simulations, recommendations | P2 |

### Task Details

- [ ] **Create `/director/intelligence` page**
  - Market analysis dashboard
  - Competitor tracking (placeholder)
  - Customer sentiment analysis
  - Industry trends

- [ ] **Create `/director/financial` page**
  - P&L statement view
  - Cash flow analysis
  - Budget vs actual comparison
  - Revenue breakdown by branch/service

- [ ] **Create `/director/growth` page**
  - Expansion opportunities
  - New service pipeline
  - Corporate client prospects
  - Growth metrics

- [ ] **Create `/director/performance` page**
  - Historical KPI trends
  - Branch performance comparison
  - Cohort analysis
  - Drill-down capabilities

- [ ] **Create `/director/risk` page**
  - Risk register table
  - Compliance checklist
  - Incident log
  - Risk heatmap

- [ ] **Create `/director/leadership` page**
  - Manager scorecards
  - Succession planning (placeholder)
  - Team performance
  - Compensation overview

- [ ] **Create `/director/board` page**
  - Report generator
  - Meeting prep documents
  - Document library
  - Board metrics summary

- [ ] **Create `/director/ai-lab` page**
  - Scenario builder
  - What-if simulations
  - AI recommendations
  - Strategic insights

---

## P1: Permission Approval System

**Reference:** PRD Section 8.3
**Collection:** `permissionRequests`

### Database Schema

```typescript
interface PermissionRequest {
  requestId: string;
  userId: string;
  userName: string;
  requestedRole: UserRole;
  requestedBranchId: string;
  requestedBranchAccess: string[];
  requestedBy: string;
  requestedByName: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
}
```

### Tasks

- [ ] **Create `lib/db/permission-requests.ts`**
  - `createPermissionRequest()`
  - `getPermissionRequests(filter)`
  - `approvePermissionRequest(requestId, approvedBy)`
  - `rejectPermissionRequest(requestId, reason)`
  - `getPendingRequestsCount()`

- [ ] **Create `/admin/permission-requests` page**
  - File: `app/(dashboard)/admin/permission-requests/page.tsx`
  - Director-only access
  - Pending requests list
  - Approve/reject actions

- [ ] **Create `PermissionRequestCard.tsx` component**
  - Request details display
  - User info
  - Requested permissions
  - Approve/reject buttons

- [ ] **Add notification badge to sidebar**
  - Show pending approval count
  - Director role only

---

## P2: Biometric Integration UI (60% → 100%)

**Reference:** PRD Appendix H
**Service:** `services/biometric.ts` (666 lines - ✅ Complete)

### Backend Status (Complete)

| Component | Status | Location |
|-----------|--------|----------|
| Multi-vendor adapters | ✅ | `services/biometric.ts` |
| Core functions | ✅ | Device, enrollment, events |
| Webhook endpoint | ✅ | `app/api/webhooks/biometric/route.ts` |
| Schema types | ✅ | In `biometric.ts` |

### UI Tasks (Remaining)

- [ ] **Enhance `/admin/biometric-devices` page**
  - File: `app/(dashboard)/admin/biometric-devices/page.tsx`
  - Device list with status indicators
  - Add device form
  - Edit device settings

- [ ] **Create `BiometricDeviceForm.tsx`**
  - Device registration form
  - Vendor selection (ZKTeco, Suprema, Hikvision, Generic)
  - Branch assignment
  - Connection settings

- [ ] **Create `BiometricDeviceList.tsx`**
  - Device cards with status
  - Last heartbeat indicator
  - Quick actions (edit, deactivate)

- [ ] **Create `BiometricEventLog.tsx`**
  - Event history table
  - Filter by device/employee
  - Processing status
  - Error display

- [ ] **Create `EmployeeEnrollmentForm.tsx`**
  - Biometric ID input
  - Employee selection
  - Enrollment status

- [ ] **Add heartbeat monitoring**
  - Real-time status updates
  - Alert for offline devices

- [ ] **Add manual sync trigger**
  - Force sync button
  - Sync status display

---

## P2: AI Features Enhancement (70% → 100%)

**Reference:** PRD Section 4.15

### Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| OpenAI Integration | ✅ | Agent system complete |
| Director AI Recommendations | ✅ | Integrated |
| Order time estimation | 🔄 | Basic implementation |
| Customer churn prediction | ❌ | Not started |
| Demand forecasting | ❌ | Not started |
| Natural language queries | ❌ | Not started |

### Tasks

- [ ] **Implement customer churn prediction**
  - Analyze order frequency
  - Identify at-risk customers
  - Generate retention recommendations

- [ ] **Implement demand forecasting**
  - Historical order analysis
  - Seasonal patterns
  - Staffing recommendations

- [ ] **Implement natural language queries**
  - "How many orders yesterday?"
  - "Which branch is busiest?"
  - "Show revenue trend"

- [ ] **Implement automated report summaries**
  - Daily summary generation
  - Weekly insights
  - Monthly executive brief

---

## Completed Modules (Reference Only)

### ✅ Core Infrastructure (100%)
- Project setup, Firebase config, CI/CD pipeline
- PRD Reference: Section 2.1

### ✅ Authentication System (100%)
- Email/password, Phone OTP, Role-based access
- PRD Reference: Section 8

### ✅ POS System (100%)
- Order creation, Customer management, Payment processing
- PRD Reference: Section 4.1

### ✅ Order Pipeline (100%)
- Kanban board, Status management, Real-time updates
- PRD Reference: Section 4.2

### ✅ Customer Portal (100%)
- Phone OTP login, Order tracking, Profile management
- PRD Reference: Section 4.3

### ✅ Workstation Management (100%)
- 6-stage processing, Staff assignments, Quality checks
- PRD Reference: Section 4.4

### ✅ WhatsApp Integration (100%)
- Wati.io setup, Message templates, Automated notifications
- PRD Reference: Section 7.1

### ✅ Payment System (100%)
- Pesapal integration, M-Pesa, Card payments
- PRD Reference: Section 7.2

### ✅ Inventory Management (100%)
- Stock tracking, Low stock alerts, Adjustments
- PRD Reference: Section 4.6

### ✅ Director Dashboard (100%)
- Command center at `/dashboard`, AI recommendations, KPIs
- PRD Reference: Section 4.12

---

## Module Completion Summary

| Module | PRD Section | Status | Completion |
|--------|-------------|--------|------------|
| Core Infrastructure | 2.1 | ✅ Complete | 100% |
| Authentication | 8 | ✅ Complete | 100% |
| POS System | 4.1 | ✅ Complete | 100% |
| Order Pipeline | 4.2 | ✅ Complete | 100% |
| Customer Portal | 4.3 | ✅ Complete | 100% |
| Workstation | 4.4 | ✅ Complete | 100% |
| Delivery System | 4.5 | ✅ Complete | 95% |
| WhatsApp | 7.1 | ✅ Complete | 100% |
| Payments | 7.2 | ✅ Complete | 100% |
| Inventory | 4.6 | ✅ Complete | 100% |
| Analytics | 4.10 | ✅ Complete | 100% |
| Employees | 4.7 | ✅ Complete | 95% |
| Director Dashboard | 4.12 | ✅ Complete | 100% |
| GM Dashboard | 4.13 | 🔄 In Progress | 85% |
| Biometric | Appendix H | ⚠️ Partial | 60% |
| AI Features | 4.15 | 🔄 In Progress | 70% |

**Overall Project:** ~92% Complete

---

## Files to Create/Modify

### Priority Order

| Priority | File | Action | Purpose |
|----------|------|--------|---------|
| P0 | `firestore.rules` | Modify | Add security rules |
| P1 | `components/modern/ModernSidebar.tsx` | Modify | Add GM/Director nav |
| P1 | `app/(dashboard)/gm/orders/page.tsx` | Create | Live orders |
| P1 | `app/(dashboard)/gm/staff/page.tsx` | Create | Staff management |
| P1 | `app/(dashboard)/gm/equipment/page.tsx` | Create | Equipment status |
| P1 | `app/(dashboard)/gm/performance/page.tsx` | Create | Performance |
| P1 | `lib/db/permission-requests.ts` | Create | Permission DB |
| P1 | `app/(dashboard)/admin/permission-requests/page.tsx` | Create | Approval queue |
| P1 | `app/(dashboard)/director/intelligence/page.tsx` | Create | Strategic intel |
| P1 | `app/(dashboard)/director/financial/page.tsx` | Create | Financial |
| P1 | `app/(dashboard)/director/growth/page.tsx` | Create | Growth hub |
| P1 | `app/(dashboard)/director/performance/page.tsx` | Create | Performance |
| P2 | `app/(dashboard)/director/risk/page.tsx` | Create | Risk |
| P2 | `app/(dashboard)/director/leadership/page.tsx` | Create | Leadership |
| P2 | `app/(dashboard)/director/board/page.tsx` | Create | Board room |
| P2 | `app/(dashboard)/director/ai-lab/page.tsx` | Create | AI lab |

---

## Testing Checklist

### After P0 (Security Rules)
- [ ] Director can view GM Dashboard without errors
- [ ] GM can query all branches data
- [ ] Attendance collection accessible
- [ ] Equipment collection accessible
- [ ] Issues collection accessible
- [ ] CustomerFeedback collection accessible

### After P1 (GM Dashboard)
- [ ] GM sees correct sidebar navigation
- [ ] Live Orders page loads with data
- [ ] Staff page shows cross-branch staff
- [ ] Equipment page shows all branches
- [ ] Performance page shows efficiency metrics

### After P1 (Director Pages)
- [ ] Director sees strategic sidebar
- [ ] All 8 director pages accessible
- [ ] Permission approval workflow works

---

## Notes

### Task Workflow
1. Check this file for current priorities
2. Reference PRD for specifications
3. Update status as you complete tasks
4. Mark blockers with ⚠️

### Priority Definitions
- **P0:** Critical - Blocking other work
- **P1:** High - Core functionality
- **P2:** Medium - Enhancement
- **P3:** Low - Future consideration

### When Blocked
1. Mark task with ⚠️
2. Note the blocker
3. Move to next available task
4. Communicate to team

---

**Last Updated:** January 2026
**Next Review:** Weekly
**Document Version:** 1.0

---

**Remember:**
- This file takes precedence over TASKS.md
- Reference PRD for detailed specifications
- Ignore `updates/` directory
- Update status immediately upon completion