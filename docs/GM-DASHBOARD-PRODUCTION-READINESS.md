# GM Dashboard Production Readiness Plan

## Overview

This document outlines all requirements for the GM Operations Dashboard to work seamlessly in production. The dashboard was implemented with role-based detection at `/dashboard` for users with `general_manager` role.

**Dashboard Location:** `app/(dashboard)/dashboard/page.tsx`
**Main Component:** `components/dashboard/GMOperationsDashboard.tsx`
**Data Hook:** `hooks/useGMDashboard.ts`
**Database Functions:** `lib/db/gm-dashboard.ts`

---

## Executive Summary

| Category | Items | Status |
|----------|-------|--------|
| Missing Firestore Collections | 2 | ✅ COMPLETED |
| Missing Collection Fields | 2 | ✅ COMPLETED |
| Missing Firestore Indexes | 4 | ✅ COMPLETED |
| Hardcoded Values to Configure | 6 | ✅ COMPLETED |
| Incomplete Implementations | 3 | ✅ COMPLETED |
| Code Quality Issues | 10+ | ✅ COMPLETED |
| Missing Seed Data | 3 collections | ✅ COMPLETED |

### Implementation Status (Updated 2026-01-08)

**⚠️ CRITICAL: Firebase Security Rules Fix Required**

The GM Dashboard is experiencing `Missing or insufficient permissions` errors because:
1. 4 collections lack security rules: `attendance`, `equipment`, `issues`, `customerFeedback`
2. GM needs `isExecutive()` cross-branch access (operates from HQ, not individual branches)

**See:** `docs/DIRECTOR-SECURITY-SIDEBAR-PLAN.md` for the complete security rules fix plan.

**All other blocking issues have been resolved:**

1. **Schema Updates** (`lib/db/schema.ts`)
   - ✅ Added `Equipment` interface with status tracking
   - ✅ Added `Issue` interface for operational issues
   - ✅ Added `dailyTarget` and `targetTurnaroundHours` to `Branch` interface

2. **Firestore Indexes** (`firestore.indexes.json`)
   - ✅ Added equipment collection indexes (branchId+status, branchId+active+type)
   - ✅ Added issues collection indexes (status+createdAt, branchId+status+createdAt, priority)

3. **Seed Scripts** (`scripts/`)
   - ✅ Created `seed-equipment.ts` - Equipment for 10 branches
   - ✅ Created `seed-issues.ts` - Sample operational issues
   - ✅ Created `seed-attendance.ts` - Staff attendance records
   - ✅ Updated `seed-branches.ts` - Added dailyTarget values per branch

4. **Dynamic Data Fetching** (`lib/db/gm-dashboard.ts`)
   - ✅ Revenue targets now fetched from branch configuration
   - ✅ Turnaround targets now fetched from branch configuration
   - ✅ Satisfaction metrics now query customerFeedback collection
   - ✅ Staff productivity calculated from actual hours/orders

5. **UI Improvements** (`components/dashboard/gm/`)
   - ✅ GMQuickActions: Uses Next.js router, added Send Alert modal
   - ✅ GMUrgentIssues: Take Action and View All use proper navigation

### To Deploy

Run these commands to seed the database:
```bash
npx ts-node scripts/seed-branches.ts      # Updates branch targets
npx ts-node scripts/seed-equipment.ts     # Creates equipment records
npx ts-node scripts/seed-issues.ts        # Creates sample issues
npx ts-node scripts/seed-attendance.ts    # Creates attendance for today
firebase deploy --only firestore:indexes  # Deploy new indexes
```

---

## Part 1: Missing Firestore Collections

### 1.1 Equipment Collection (NEW - CRITICAL)

**Purpose:** Track washing machines, dryers, presses, steamers, and folders

**Required Schema:**
```typescript
interface Equipment {
  id: string;                    // Document ID
  name: string;                  // e.g., "Washer #1", "Industrial Press A"
  type: 'washer' | 'dryer' | 'press' | 'steamer' | 'folder';
  status: 'running' | 'idle' | 'maintenance' | 'offline';
  branchId: string;              // Branch assignment
  currentLoad?: number;          // Items currently processing
  lastMaintenance?: Timestamp;   // Last maintenance date
  nextMaintenance?: Timestamp;   // Scheduled maintenance
  uptime?: number;               // Uptime percentage (0-100)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Impact if Missing:** Equipment Status widget shows empty, all equipment counts = 0

**File Reference:** `lib/db/gm-dashboard.ts` lines 393-456

---

### 1.2 Issues Collection (NEW - CRITICAL)

**Purpose:** Track operational issues requiring management attention

**Required Schema:**
```typescript
interface Issue {
  id: string;                    // Document ID
  title: string;                 // Brief issue title
  description: string;           // Detailed description
  priority: 'high' | 'medium' | 'low';
  type: 'equipment' | 'order' | 'staff' | 'customer' | 'inventory';
  status: 'open' | 'in_progress' | 'resolved';
  branchId: string;              // Branch where issue occurred
  branchName: string;            // Denormalized for display
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  orderId?: string;              // Related order (if applicable)
  assignedTo?: string;           // Staff UID assigned to resolve
  resolution?: string;           // How issue was resolved
}
```

**Impact if Missing:** Urgent Issues widget shows empty

**File Reference:** `lib/db/gm-dashboard.ts` lines 461-497

---

## Part 2: Missing Fields in Existing Collections

### 2.1 Branch Collection - Add Fields

**Location:** `lib/db/schema.ts` Branch interface

**Fields to Add:**
```typescript
interface Branch {
  // ... existing fields ...
  dailyTarget?: number;          // Daily revenue target in KES
  staffOnDuty?: number;          // Current staff count (denormalized)
}
```

**Current Workaround:** Hardcoded to 50,000 KES (`lib/db/gm-dashboard.ts` line 202)

**Impact:** All branches show same target; no branch-specific goals

---

## Part 3: Firestore Indexes Required

Add to `firestore.indexes.json`:

```json
{
  "collectionGroup": "equipment",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "branchId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "equipment",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "branchId", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "issues",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "issues",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "branchId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

## Part 4: Seed Data Required

### 4.1 Equipment Seed Data

Create `scripts/seed-equipment.ts`:

```typescript
// Minimum equipment per branch
const EQUIPMENT_PER_BRANCH = [
  { name: 'Washer #1', type: 'washer', status: 'running' },
  { name: 'Washer #2', type: 'washer', status: 'idle' },
  { name: 'Dryer #1', type: 'dryer', status: 'running' },
  { name: 'Dryer #2', type: 'dryer', status: 'idle' },
  { name: 'Press #1', type: 'press', status: 'running' },
  { name: 'Press #2', type: 'press', status: 'maintenance' },
  { name: 'Steamer #1', type: 'steamer', status: 'idle' },
  { name: 'Folder #1', type: 'folder', status: 'running' },
];
```

**Scope:** At minimum, seed main branch (BR-MAIN-001) with 8 equipment items

---

### 4.2 Issues Seed Data

Create `scripts/seed-issues.ts`:

```typescript
const SAMPLE_ISSUES = [
  {
    title: 'Washer #2 Making Unusual Noise',
    description: 'Industrial washer producing grinding sound during spin cycle',
    priority: 'high',
    type: 'equipment',
    status: 'open',
  },
  {
    title: 'Customer Complaint - Delayed Order',
    description: 'Order ORD-MAIN-20251015-0003 delayed by 2 days',
    priority: 'high',
    type: 'customer',
    status: 'in_progress',
  },
  {
    title: 'Detergent Stock Running Low',
    description: 'Industrial detergent at 15% capacity, reorder needed',
    priority: 'medium',
    type: 'inventory',
    status: 'open',
  },
  {
    title: 'Staff Scheduling Conflict',
    description: 'Two staff members requested same shift off',
    priority: 'low',
    type: 'staff',
    status: 'open',
  },
];
```

---

### 4.3 Attendance Seed Data

Create `scripts/seed-attendance.ts`:

```typescript
// Create attendance records for today to populate "Staff on Duty"
const TODAY_ATTENDANCE = [
  { employeeId: 'gm-uid', checkIn: '08:00', status: 'active', ordersHandled: 0 },
  { employeeId: 'frontdesk-uid', checkIn: '08:30', status: 'active', ordersHandled: 12 },
  { employeeId: 'ws1-uid', checkIn: '07:00', status: 'active', ordersHandled: 25 },
  { employeeId: 'driver1-uid', checkIn: '09:00', status: 'on_break', ordersHandled: 8 },
];
```

**Impact if Missing:** Staff On Duty section shows 0 staff members

---

## Part 5: Hardcoded Values to Configure

| Location | Current Value | Description | Recommended Fix |
|----------|---------------|-------------|-----------------|
| `lib/db/gm-dashboard.ts:202` | `50000` | Daily revenue target (KES) | Fetch from `branch.dailyTarget` |
| `lib/db/gm-dashboard.ts:277` | `24` | Turnaround time target (hours) | Create system settings collection |
| `lib/db/gm-dashboard.ts:374` | `85` | Staff productivity % | Calculate from actual metrics |
| `lib/db/gm-dashboard.ts:571` | `85` | Branch efficiency % | Calculate from orders/staff ratio |
| `lib/db/gm-dashboard.ts:666-676` | Mock data | Satisfaction metrics | Query `customerFeedback` collection |
| `components/dashboard/gm/GMDashboardHeader.tsx:60-65` | 2 branches | Branch dropdown list | Fetch from `branches` collection |

---

## Part 6: Incomplete Implementations

### 6.1 Send Alert Button (GMQuickActions.tsx:63-66)

**Current State:** `console.log('Send alert')` - no functionality

**Required Implementation:**
- Create alert modal component
- Add `alerts` or `notifications` Firestore integration
- Send push/WhatsApp notifications to staff

---

### 6.2 Satisfaction Metrics (lib/db/gm-dashboard.ts:666-676)

**Current State:** Returns hardcoded mock data:
```typescript
return {
  score: 4.7,
  totalReviews: 156,
  trend: 5,
};
```

**Required Implementation:**
- Query `customerFeedback` collection
- Calculate average rating
- Count reviews for period
- Calculate trend vs previous period

---

### 6.3 Take Action Button (GMUrgentIssues.tsx)

**Current State:** Button exists but no navigation/action

**Required Implementation:**
- Navigate to issue detail page, OR
- Open issue resolution modal

---

## Part 7: Code Quality Issues

### 7.1 Console Statements to Remove

| File | Line | Statement |
|------|------|-----------|
| `GMQuickActions.tsx` | 65 | `console.log('Send alert')` |
| `lib/db/gm-dashboard.ts` | Multiple | `console.error(...)` statements |

**Recommendation:** Replace with proper error logging service (Sentry, etc.)

---

### 7.2 Navigation Issues

**Problem:** Using `window.location.href` instead of Next.js router

**Locations:**
- `GMLiveOrderQueue.tsx:139, 378`
- `GMStaffOnDuty.tsx:325`
- `GMQuickActions.tsx:95, 158, 169`

**Fix:**
```typescript
// Before
window.location.href = '/orders'

// After
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/orders');
```

---

### 7.3 Missing Error UI

**Problem:** Components don't display error messages when queries fail

**Affected Components:** All GM dashboard components

**Fix:** Add error state handling:
```typescript
if (isError) {
  return <ErrorCard message="Failed to load data" onRetry={refetch} />;
}
```

---

## Part 8: Implementation Checklist

### Phase 1: Database Setup (BLOCKING)

- [ ] Add `Equipment` interface to `lib/db/schema.ts`
- [ ] Add `Issue` interface to `lib/db/schema.ts`
- [ ] Add `dailyTarget` field to `Branch` interface
- [ ] Add indexes to `firestore.indexes.json`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`

### Phase 2: Seed Scripts (BLOCKING)

- [ ] Create `scripts/seed-equipment.ts`
- [ ] Create `scripts/seed-issues.ts`
- [ ] Create `scripts/seed-attendance.ts`
- [ ] Update `scripts/seed-branches.ts` to include `dailyTarget`
- [ ] Add npm script: `"seed:gm": "ts-node scripts/seed-gm-dashboard.ts"`

### Phase 3: Data Functions (HIGH)

- [ ] Implement real `fetchSatisfactionMetrics()` querying `customerFeedback`
- [ ] Implement dynamic branch list in header
- [ ] Calculate real productivity/efficiency metrics
- [ ] Fetch `dailyTarget` from branch documents

### Phase 4: UI Completion (MEDIUM)

- [ ] Implement Send Alert modal and functionality
- [ ] Implement Take Action navigation/modal for issues
- [ ] Replace `window.location.href` with Next.js router
- [ ] Add error state UI to all components
- [ ] Add skeleton loading states per section

### Phase 5: Code Quality (MEDIUM)

- [ ] Remove all `console.log` statements
- [ ] Replace `console.error` with error logging service
- [ ] Add input validation for data processing
- [ ] Add time zone handling for reports

---

## Part 9: Testing Requirements

### Manual Testing Checklist

1. **Login as GM:** `gm@lorenzo.test` / `Test@1234`
2. **Verify Dashboard Loads:** All 8 sections render
3. **Verify Theme Toggle:** Switch between dark/light modes
4. **Verify Branch Filter:** Filter changes data in all sections
5. **Verify Refresh:** Manual refresh updates all data
6. **Verify Navigation:** All "View All" and action links work
7. **Verify Real-Time Updates:** Data refreshes per configured intervals

### Data Verification

| Section | Expected Data Source | Verify Shows |
|---------|---------------------|--------------|
| Orders Today | `orders` collection | Real order counts |
| Revenue | `transactions` collection | Real revenue totals |
| Turnaround | `orders` collection | Calculated average |
| Staff on Duty | `attendance` + `users` | Real staff list |
| Equipment | `equipment` collection | Real equipment status |
| Urgent Issues | `issues` collection | Real issue list |
| Branch Performance | Multiple collections | Real branch metrics |
| Live Order Queue | `orders` collection | Active orders |

---

## Part 10: Production Deployment Checklist

### Pre-Deployment

- [ ] All Phase 1-3 items completed
- [ ] Seed scripts executed in production Firestore
- [ ] Firestore indexes deployed and built
- [ ] Security rules updated for new collections
- [ ] Error logging service configured

### Deployment Day

- [ ] Deploy code changes
- [ ] Run seed scripts (if not already run)
- [ ] Verify dashboard loads for GM user
- [ ] Monitor for Firestore read/write errors
- [ ] Check browser console for errors

### Post-Deployment

- [ ] Monitor Firestore usage metrics
- [ ] Check error logging for issues
- [ ] Gather GM user feedback
- [ ] Plan Phase 4-5 improvements

---

## File Reference Summary

| Purpose | File Path |
|---------|-----------|
| Dashboard Page | `app/(dashboard)/dashboard/page.tsx` |
| Main Container | `components/dashboard/GMOperationsDashboard.tsx` |
| Header | `components/dashboard/gm/GMDashboardHeader.tsx` |
| Metrics Row | `components/dashboard/gm/GMMetricsRow.tsx` |
| Order Queue | `components/dashboard/gm/GMLiveOrderQueue.tsx` |
| Branch Performance | `components/dashboard/gm/GMBranchPerformance.tsx` |
| Equipment Status | `components/dashboard/gm/GMEquipmentStatus.tsx` |
| Urgent Issues | `components/dashboard/gm/GMUrgentIssues.tsx` |
| Staff on Duty | `components/dashboard/gm/GMStaffOnDuty.tsx` |
| Quick Actions | `components/dashboard/gm/GMQuickActions.tsx` |
| Data Hook | `hooks/useGMDashboard.ts` |
| DB Functions | `lib/db/gm-dashboard.ts` |
| Type Definitions | `types/gm-dashboard.ts` |
| Schema | `lib/db/schema.ts` |
| Indexes | `firestore.indexes.json` |

---

## Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Database Setup | 2-3 hours | BLOCKING |
| Phase 2: Seed Scripts | 2-3 hours | BLOCKING |
| Phase 3: Data Functions | 4-6 hours | HIGH |
| Phase 4: UI Completion | 3-4 hours | MEDIUM |
| Phase 5: Code Quality | 2-3 hours | MEDIUM |
| **Total** | **13-19 hours** | |

---

## Part 11: AI Agent Integration

The project has a comprehensive multi-agent AI system in `lib/agents/` that can enhance the GM Dashboard with intelligent features.

### Existing AI Agents

| Agent | Location | Purpose | Auth Required |
|-------|----------|---------|---------------|
| **Orchestrator** | `lib/agents/orchestrator-agent.ts` | Main chat interface, intent routing | No |
| **Order Agent** | `lib/agents/order-agent.ts` | Order tracking, analytics | Yes |
| **Customer Agent** | `lib/agents/customer-agent.ts` | Customer profiles, insights | Yes |
| **Pricing Agent** | `lib/agents/pricing-agent.ts` | Service quotes, pricing | No |
| **Support Agent** | `lib/agents/support-agent.ts` | Tickets, escalation | Mixed |
| **Onboarding Agent** | `lib/agents/onboarding-agent.ts` | Registration, verification | No |
| **Logistics Agent** | `lib/agents/logistics-agent.ts` | Pickup scheduling, driver management | Yes |

### API Endpoint

**URL:** `POST /api/agents`
**Location:** `app/api/agents/route.ts`

**Request Format:**
```typescript
{
  "toAgent": "order-agent",
  "action": "getTodaysSummary",
  "params": { "branchId": "BR-MAIN-001" },
  "source": "gm-dashboard"
}
```

### Integration Opportunities

#### 11.1 AI-Powered Order Insights (Order Agent)

**Agent Actions Available:**
- `getTodaysSummary` - Daily order summary (management only)
- `getPipelineStats` - Pipeline statistics (staff only)
- `getOrdersByStatus` - Filter orders by status (staff only)

**Dashboard Integration:**
```typescript
// In GMMetricsRow.tsx or new GMInsights component
import { sendToAgent } from '@/lib/agents';

const insights = await sendToAgent('order-agent', 'getTodaysSummary', {
  branchId: branchFilter
}, staffToken);
```

**Use Cases:**
- Add "AI Insights" card showing order trends
- Predict daily completion rate
- Identify bottlenecks in pipeline

---

#### 11.2 Customer Analytics (Customer Agent)

**Agent Actions Available:**
- `getTopCustomers` - Top customers by spending (management only)
- `getCustomerInsights` - Detailed analytics (staff only)
- `getRecentCustomers` - Recently registered (staff only)

**Dashboard Integration:**
- Add "Top Customers" widget to GM Dashboard
- Show customer retention metrics
- Display VIP customer alerts

---

#### 11.3 Support Ticket Integration (Support Agent)

**Agent Actions Available:**
- `getAllTickets` - Get all support tickets (staff only)
- `updateTicket` - Update ticket status (staff only)
- `escalateToHuman` - Request human support (public)

**Dashboard Integration:**
Replace current Urgent Issues implementation with support tickets:

```typescript
// In GMUrgentIssues.tsx
const tickets = await sendToAgent('support-agent', 'getAllTickets', {
  status: 'open',
  priority: 'high'
}, staffToken);
```

**Benefits:**
- Unified issue tracking with customer support
- Automatic escalation routing
- Full ticket lifecycle management

---

#### 11.4 Logistics & Pickup Dashboard (Logistics Agent)

**Agent Actions Available:**
- `get_pending_pickups` - View pending requests (management)
- `get_pickup_stats` - Analytics (management)
- `assign_driver` - Assign driver to pickup (management)

**Dashboard Integration:**
- Add "Pending Pickups" widget
- Show pickup volume trends
- Driver assignment from dashboard

---

#### 11.5 AI Chat Assistant for GM

**Agent:** Orchestrator Agent

**Implementation:**
Add floating chat button to GM Dashboard that connects to AI assistant:

```typescript
// New component: GMChatAssistant.tsx
const response = await sendToAgent('orchestrator', 'chat', {
  message: userMessage,
  sessionId: gmSessionId,
  context: 'gm-dashboard'
}, staffToken);
```

**Capabilities:**
- Natural language order queries ("How many express orders today?")
- Quick customer lookups ("Find orders for John Smith")
- Issue reporting via chat
- Performance questions ("What's our turnaround time this week?")

---

### New Agent: Dashboard Agent (RECOMMENDED)

Create a specialized agent for GM Dashboard needs:

**File:** `lib/agents/dashboard-agent.ts`

**Actions:**
```typescript
const DASHBOARD_ACTIONS = {
  // Real-time metrics with AI analysis
  'getMetricsWithInsights': {
    description: 'Get dashboard metrics with AI-generated insights',
    requiresAuth: true,
    allowedRoles: ['management']
  },

  // Predictive analytics
  'predictDailyRevenue': {
    description: 'Predict end-of-day revenue based on current trends',
    requiresAuth: true,
    allowedRoles: ['management']
  },

  // Equipment health prediction
  'predictEquipmentIssues': {
    description: 'Predict equipment maintenance needs',
    requiresAuth: true,
    allowedRoles: ['management']
  },

  // Staffing recommendations
  'getStaffingRecommendations': {
    description: 'AI recommendations for optimal staffing',
    requiresAuth: true,
    allowedRoles: ['management']
  },

  // Alert generation
  'generateAlerts': {
    description: 'Generate intelligent alerts for anomalies',
    requiresAuth: true,
    allowedRoles: ['management']
  }
};
```

---

### Implementation Plan for Agent Integration

#### Phase 6: Agent Integration (NEW)

- [ ] Create `GMChatAssistant.tsx` floating chat component
- [ ] Integrate Order Agent for `getTodaysSummary` in metrics
- [ ] Replace issues with Support Agent `getAllTickets`
- [ ] Add Logistics Agent `get_pending_pickups` widget
- [ ] Create Dashboard Agent with AI insights
- [ ] Add "AI Insights" card to dashboard

#### Estimated Additional Effort

| Task | Effort |
|------|--------|
| Chat Assistant Component | 2-3 hours |
| Order Agent Integration | 1-2 hours |
| Support Agent Integration | 2-3 hours |
| Logistics Widget | 2-3 hours |
| Dashboard Agent | 4-6 hours |
| **Total Agent Integration** | **11-17 hours** |

---

### Agent System Files Reference

| File | Purpose |
|------|---------|
| `lib/agents/index.ts` | Agent initialization & exports |
| `lib/agents/base-agent.ts` | Base agent class with auth/validation |
| `lib/agents/agent-router.ts` | Request routing singleton |
| `lib/agents/openai-service.ts` | OpenAI/LLM integration |
| `lib/agents/orchestrator-agent.ts` | Main chat orchestrator |
| `lib/agents/order-agent.ts` | Order data specialist |
| `lib/agents/customer-agent.ts` | Customer data specialist |
| `lib/agents/pricing-agent.ts` | Pricing specialist |
| `lib/agents/support-agent.ts` | Support tickets |
| `lib/agents/onboarding-agent.ts` | Registration flow |
| `lib/agents/logistics-agent.ts` | Pickup/delivery management |
| `app/api/agents/route.ts` | API endpoint |

---

## Updated Estimated Total Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Database Setup | 2-3 hours | BLOCKING |
| Phase 2: Seed Scripts | 2-3 hours | BLOCKING |
| Phase 3: Data Functions | 4-6 hours | HIGH |
| Phase 4: UI Completion | 3-4 hours | MEDIUM |
| Phase 5: Code Quality | 2-3 hours | MEDIUM |
| Phase 6: Agent Integration | 11-17 hours | ENHANCEMENT |
| **Total** | **24-36 hours** | |

---

*Document Created: January 2026*
*Last Updated: January 2026*
