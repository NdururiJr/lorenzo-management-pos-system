# Lorenzo Dry Cleaners - Production Readiness Guide

> **🔴 CRITICAL**: 83+ data accuracy issues must be fixed before production launch.
> **REQUIRED FIRST STEP**: Read and analyze before fixing anything.

---

## MANDATORY: Analysis Before Fixes

**Before applying ANY fix, Claude MUST:**

1. **Read the fix plan** - `PRODUCTION-READINESS-FIX-PLAN.md` in this folder
2. **Read the task list** - `PRODUCTION-READINESS-TASKS.md` in this folder
3. **Analyze affected files** - Understand current implementation before changing
4. **Understand surrounding code patterns** - Match existing conventions
5. **Maintain context** - Know what the issue is and why the fix is needed

---

## Key Documents

| Document | Purpose | Priority |
|----------|---------|----------|
| `PRODUCTION-READINESS-FIX-PLAN.md` | Complete 83+ issue analysis, requirements, schemas | READ FIRST |
| `PRODUCTION-READINESS-TASKS.md` | Day-by-day task checklist for 5-week implementation | Reference during work |
| `docs/COMPLETE-SYSTEM-ANALYSIS.md` | Full technical deep-dive analysis | Background context |

---

## Issue Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **CRITICAL** | 24 | Math.random() fake data, broken calculations, wrong fields |
| **HIGH** | 31 | Hardcoded values, missing functionality, data mismatches |
| **MEDIUM** | 21 | Formula improvements, config should be dynamic |
| **LOW** | 7 | Minor issues, nice-to-have fixes |

---

## Parallel Sub-Agent Execution Strategy

**Launch multiple specialized agents to work on independent fix categories simultaneously.**

### Phase 1-2: Infrastructure (Sequential - Dependencies Exist)
Single agent handles schema and seed data because later phases depend on these.

### Phase 3-4: Dashboard & API Fixes (Parallel - 4 Agents)

Launch these agents simultaneously in a single message:

| Agent Type | Focus Area | Key Files |
|------------|------------|-----------|
| `firebase-architect` | Schema, security rules, branch config | `lib/db/schema.ts`, `firestore.rules`, `lib/db/company-settings.ts` |
| `pos-developer` | GM/Director dashboard fixes | `app/(dashboard)/gm/performance/page.tsx`, `ExecutiveNarrative.tsx` |
| `pipeline-developer` | Pipeline status, order flow | `hooks/usePipelineFilters.ts`, `app/(dashboard)/pipeline/page.tsx` |
| `integrations-specialist` | API route fixes | `app/api/quotations/`, `app/api/analytics/` |

### Phase 5-6: Portal & Testing (Parallel - 3 Agents)

| Agent Type | Focus Area | Key Files |
|------------|------------|-----------|
| `customer-portal-developer` | Auth, phone+email requirement | Portal pages, `app/(auth)/actions.ts` |
| `performance-optimizer` | Query optimization, branch isolation | DB queries, hooks |
| `test-automation-engineer` | Verification tests | Test files |

---

## Example: Launching Parallel Agents

When ready to fix Phase 3-4 issues, launch ALL agents in a single message:

```
**Agent 1 - firebase-architect:**
"Read PRODUCTION-READINESS-FIX-PLAN.md first. Then analyze and implement:
1. Add BranchConfig interface to lib/db/schema.ts
2. Create lib/db/company-settings.ts with CompanySettings interface
3. Update firestore.rules with branch isolation security rules
Reference Issues 74, 59-60 from the fix plan."

**Agent 2 - pos-developer:**
"Read PRODUCTION-READINESS-FIX-PLAN.md Issues 5-8 first. Then analyze and fix:
1. Remove Math.random() from app/(dashboard)/gm/performance/page.tsx
2. Replace with real database queries or SetupRequired component
3. Fix hardcoded values in components/features/director/ExecutiveNarrative.tsx (Issues 1-4)
Query real targets from branch config."

**Agent 3 - pipeline-developer:**
"Read PRODUCTION-READINESS-FIX-PLAN.md Issues 32-36 first. Then analyze and fix:
1. Fix 'ready' status to 'queued_for_delivery' in hooks/usePipelineFilters.ts
2. Add completed orders query in app/(dashboard)/pipeline/page.tsx
3. Add 'inspection' to activeStatuses array
Ensure completion stats are calculated correctly."

**Agent 4 - integrations-specialist:**
"Read PRODUCTION-READINESS-FIX-PLAN.md Issues 43, 54-56 first. Then analyze and fix:
1. Fix garment count logic in lib/db/orders.ts (else-if never reached)
2. Fix wrong field in app/api/quotations/[quotationId]/convert/route.ts
3. Fix or flag quotation send as not configured
Ensure APIs return accurate data."
```

---

## Core Requirements (All Fixes Must Follow)

### 1. All Queries From Database
```typescript
// ❌ WRONG - Hardcoded values
const retentionTarget = 80;

// ✅ CORRECT - From database
const branchConfig = await getBranchConfig(branchId);
const retentionTarget = branchConfig?.retentionTarget ?? companySettings.defaultRetentionTarget;
```

### 2. Branch Data Isolation
```typescript
// ✅ REQUIRED - All queries filter by branchId
const orders = await getDocs(
  query(
    collection(db, 'orders'),
    where('branchId', '==', currentBranchId),
    where('createdAt', '>=', startOfDay)
  )
);
```

### 3. No Math.random()
```typescript
// ❌ WRONG - Random values
const staffProductivity = 75 + Math.floor(Math.random() * 20);

// ✅ CORRECT - Real data or fallback UI
const { data } = useStaffProductivity(branchId);
if (!data) return <SetupRequired metric="Staff Productivity" />;
```

### 4. Phone + Email Required
```typescript
// ❌ WRONG - Email only lookup (fails for phone auth)
const customer = await getCustomerByEmail(user.email);

// ✅ CORRECT - Require both at registration
const customer = await getCustomerByPhoneOrEmail(user.phone, user.email);
```

### 5. 180 Days Historical Data
Seed realistic data spanning 180 days for meaningful period comparisons.

---

## Critical Files Quick Reference

### CRITICAL Priority (Fix First)

| File | Issues | Agent |
|------|--------|-------|
| `app/(dashboard)/gm/performance/page.tsx` | 4 Math.random() calls | pos-developer |
| `components/features/director/ExecutiveNarrative.tsx` | 3 hardcoded values | pos-developer |
| `lib/db/orders.ts` | Garment count logic bug | integrations-specialist |
| `hooks/usePipelineFilters.ts` | 'ready' status doesn't exist | pipeline-developer |
| `app/(dashboard)/pipeline/page.tsx` | Missing completed query | pipeline-developer |
| `app/api/quotations/[quotationId]/convert/route.ts` | Wrong field name | integrations-specialist |

### New Files to Create

| File | Purpose | Agent |
|------|---------|-------|
| `scripts/seed-realistic-data.ts` | 180-day data generator | firebase-architect |
| `components/ui/no-data-available.tsx` | Missing data guidance | ui-designer |
| `components/ui/setup-required.tsx` | Config missing message | ui-designer |
| `lib/db/company-settings.ts` | Company settings functions | firebase-architect |

---

## Verification After Fixes

**MANDATORY: Run build after EVERY phase of development.**

### Build & Type Check (Required After Each Phase)
```bash
# 1. TypeScript type checking
npx tsc --noEmit

# 2. Run linter
npm run lint

# 3. Production build (MUST PASS)
npm run build
```

**If build fails:** Fix all errors before proceeding to next phase. Do not skip this step.

### Functional Verification (After Build Passes)

1. **GM Dashboard**: Refresh 5x - values should NOT change (no random)
2. **All metrics**: Show real data or "Setup Required"
3. **Director Dashboard**: Health score based on real data
4. **Pipeline**: "Ready" filter works, stats accurate
5. **Customer Portal**: Registration requires phone + email
6. **Security**: Branch isolation enforced

### Phase Completion Checklist

Before moving to the next phase, Claude MUST:
- [ ] Run `npx tsc --noEmit` - no type errors
- [ ] Run `npm run lint` - no lint errors (or only warnings)
- [ ] Run `npm run build` - build succeeds
- [ ] Test affected features manually (if dev server available)
- [ ] Mark completed tasks in PRODUCTION-READINESS-TASKS.md

---

## Important Notes for Claude

1. **Always analyze before fixing** - Read the file, understand the current implementation
2. **Match existing patterns** - Follow the codebase conventions
3. **Use specialized agents** - Each agent has skills matched to the fix category
4. **Reference the fix plan** - Every issue is documented with file locations and fix approach
5. **Maintain context** - If resuming, re-read the plan documents to restore context
6. **Check task completion** - Mark tasks complete in PRODUCTION-READINESS-TASKS.md as you go
7. **RUN BUILD AFTER EACH PHASE** - Never skip the build step. Fix all errors before proceeding.

### Build Commands Summary
```bash
npx tsc --noEmit    # Type check
npm run lint        # Lint check
npm run build       # Production build (REQUIRED)
```

---

**Last Updated**: January 21, 2026
**Status**: Ready for Implementation
**Total Issues**: 83+
