# Director Dashboard Production Readiness Plan

## Overview
Make the Director Dashboard fully production-ready for Lawrence Njiru (the only director). The dashboard should automatically display when he logs in at `/dashboard` - not as a separate `/director` route.

**User Decisions:**
- DELETE the `/director` route completely
- Implement real AI integration for recommendations (OpenAI)
- Admins should NOT see director dashboard - they'll get their own tailored dashboard later

---

## Existing AI Agent System (Discovery)

The codebase has a **comprehensive multi-agent AI system** that can power the Director Dashboard:

### Available Agents

| Agent | Location | Purpose | Director Dashboard Use |
|-------|----------|---------|------------------------|
| **Order Agent** | `lib/agents/order-agent.ts` | Order tracking, analytics | `getTodaysSummary`, `getPipelineStats` for KPIs |
| **Customer Agent** | `lib/agents/customer-agent.ts` | Customer insights | `getTopCustomers`, `getCustomerInsights` for retention |
| **Pricing Agent** | `lib/agents/pricing-agent.ts` | Revenue analysis | Service pricing trends |
| **Support Agent** | `lib/agents/support-agent.ts` | Issue tracking | Risk detection from tickets |
| **Logistics Agent** | `lib/agents/logistics-agent.ts` | Pickup/delivery stats | `get_pickup_stats` for operational health |
| **Orchestrator** | `lib/agents/orchestrator-agent.ts` | Conversational AI "Melvin" | Natural language queries |

### LLM Infrastructure

| Component | Location | Purpose |
|-----------|----------|---------|
| **LLM Client** | `lib/llm/llm-client.ts` | Multi-provider abstraction |
| **OpenAI Provider** | `lib/llm/providers/openai-provider.ts` | GPT-4/3.5 integration |
| **Anthropic Provider** | `lib/llm/providers/anthropic-provider.ts` | Claude integration |
| **Google Provider** | `lib/llm/providers/google-provider.ts` | Gemini integration |
| **Config Service** | `lib/config/config-service.ts` | Admin model selection |

### Existing API Endpoints

| Endpoint | Purpose | Use for Dashboard |
|----------|---------|-------------------|
| `POST /api/agents` | Agent router | Query any agent for data |
| `POST /api/analytics/director/ai-narrative` | Executive summaries | AI-generated insights |
| `GET /api/analytics/director/insights` | KPIs, risks, drivers | Dashboard data source |

### Integration Strategy for AIRecommendations

Instead of calling OpenAI directly, use the **existing agent system**:

1. **Call Order Agent** → `getTodaysSummary` for order metrics
2. **Call Customer Agent** → `getCustomerInsights` for retention data
3. **Call Logistics Agent** → `get_pickup_stats` for delivery performance
4. **Call Support Agent** → `getAllTickets` for issue trends
5. **Pass aggregated data to** → `/api/analytics/director/ai-narrative`
6. **LLM generates** → Contextual recommendations

This leverages the existing multi-provider LLM system with fallback support.

---

## Phase 1: Route Integration (P0 - Critical)

### Goal: Director sees his dashboard at `/dashboard` automatically

**File:** `app/(dashboard)/dashboard/page.tsx`

**Changes:**
1. Import director dashboard components
2. Add role check: `if (userData.role === 'director')`
3. Render DirectorDashboard component for directors
4. Keep existing GM and Staff dashboard logic for other roles

```typescript
// Add this check BEFORE general_manager check
if (userData.role === 'director') {
  return <DirectorDashboard />;
}
```

---

## Phase 2: AI Recommendations Integration (P0 - Critical)

### Goal: Real AI-powered recommendations using existing agent system

**File:** `components/features/director/AIRecommendations.tsx`

**Current State:** 100% hardcoded mock data

**Implementation Using Agent System:**

1. **Create new API endpoint** `GET /api/analytics/director/recommendations`
   - Calls Order Agent → `getTodaysSummary`, `getPipelineStats`
   - Calls Customer Agent → `getCustomerInsights`, `getTopCustomers`
   - Calls Logistics Agent → `get_pickup_stats`
   - Aggregates data into structured metrics

2. **Pass to AI Narrative endpoint**
   - Send metrics to `/api/analytics/director/ai-narrative`
   - Uses existing LLM client with multi-provider fallback
   - Returns structured recommendations

3. **Component changes:**
   - Add `useQuery` to fetch from new endpoint
   - Parse AI response into recommendation cards
   - Loading/error states
   - 5-minute cache with React Query
   - Fallback to rule-based recommendations if AI fails

**Files to Create/Modify:**
- `app/api/analytics/director/recommendations/route.ts` (NEW)
- `components/features/director/AIRecommendations.tsx` (REWRITE)

**Agent Actions to Use:**
```typescript
// Order Agent
{ toAgent: 'order-agent', action: 'getTodaysSummary' }
{ toAgent: 'order-agent', action: 'getPipelineStats' }

// Customer Agent
{ toAgent: 'customer-agent', action: 'getCustomerInsights' }

// Logistics Agent
{ toAgent: 'logistics-agent', action: 'get_pickup_stats' }
```

---

## Phase 3: Fix Simulated Data (P1 - High)

### 3.1 BranchComparison Component
**File:** `components/features/director/BranchComparison.tsx`

**Fix:**
- `qualityScore`: Calculate from orders with successful QC vs total
- `trend`: Calculate actual period-over-period revenue change

### 3.2 OperationalHealth Component
**File:** `components/features/director/OperationalHealth.tsx`

**Fix:**
- `activeStaff`: Query `users` where `role in ['workstation_staff', 'front_desk']` AND `active: true`
- `activeDrivers`: Query `users` where `role === 'driver'` AND `active: true`

### 3.3 ExecutiveSummary Component
**File:** `components/features/director/ExecutiveSummary.tsx`

**Fix:**
- Query `customerFeedback` collection for average `overallRating`
- Show "N/A" if no feedback data exists

---

## Phase 4: Cleanup (P2 - Medium)

### 4.1 Delete Standalone Route
**DELETE:** `app/(dashboard)/director/page.tsx`

### 4.2 Remove Sidebar Link
**File:** `components/modern/ModernSidebar.tsx`

Remove the "Director View" menu item (director sees dashboard by default now)

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `app/(dashboard)/dashboard/page.tsx` | Add director dashboard rendering | P0 |
| `components/features/director/AIRecommendations.tsx` | Integrate OpenAI API | P0 |
| `components/features/director/BranchComparison.tsx` | Fix simulated quality/trend | P1 |
| `components/features/director/OperationalHealth.tsx` | Fix simulated staff/driver counts | P1 |
| `components/features/director/ExecutiveSummary.tsx` | Fix hardcoded satisfaction | P1 |
| `app/(dashboard)/director/page.tsx` | DELETE | P2 |
| `components/modern/ModernSidebar.tsx` | Remove Director View link | P2 |

---

## Implementation Order

1. Phase 1 - Route Integration
2. Phase 2 - AI Recommendations
3. Phase 3 - Fix simulated data (3.1, 3.2, 3.3)
4. Phase 4 - Cleanup

---

## Success Criteria

- [ ] Director logs in → sees executive dashboard at `/dashboard`
- [ ] AI recommendations generated from OpenAI based on actual metrics
- [ ] All KPIs show real data (no `Math.random()`)
- [ ] `/director` route deleted
- [ ] No "Director View" link in sidebar

---

## Data Dependencies

Collections queried:
- `orders` - Pipeline status, delayed orders, completion rates
- `transactions` - Revenue, payment methods
- `customers` - Retention metrics
- `branches` - Branch names
- `users` - Staff/driver counts
- `customerFeedback` - Satisfaction scores
