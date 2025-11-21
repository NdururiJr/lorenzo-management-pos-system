# Prompt for Codex - Branch Detail Implementation Verification

Copy and paste this entire prompt to Codex:

---

## Task 1: Verify Branch Detail Page Implementation

Please thoroughly review the implementation report at `docs/BRANCH_DETAIL_IMPLEMENTATION_REPORT.md` and verify that everything outlined in `docs/BRANCH_DETAIL_PAGE_PLAN.md` has been properly implemented.

### Verification Checklist

For each item, check the actual code files and confirm:

1. **Route Structure**
   - [ ] Verify `app/(dashboard)/branches/[branchId]/page.tsx` exists and has proper access control
   - [ ] Check that unauthorized users are redirected
   - [ ] Verify loading states are implemented

2. **Component Files**
   - [ ] Verify all 8 component files exist in `components/branches/`:
     - BranchDetailContent.tsx
     - BranchHeader.tsx
     - BranchStatsGrid.tsx
     - BranchOverview.tsx
     - BranchInventory.tsx
     - BranchTransfers.tsx
     - BranchStaff.tsx
     - BranchAudit.tsx

3. **Access Control**
   - [ ] Check that super admins can access all branches
   - [ ] Check that branch managers only see branches in their allowedBranches array
   - [ ] Verify proper access denied messages are shown

4. **Data Filtering**
   - [ ] Verify all Firestore queries filter by branchId
   - [ ] Check BranchStatsGrid queries are branch-scoped
   - [ ] Check BranchOverview queries are branch-scoped
   - [ ] Check BranchInventory queries are branch-scoped
   - [ ] Check BranchTransfers queries are branch-scoped
   - [ ] Check BranchStaff queries are branch-scoped
   - [ ] Check BranchAudit queries are branch-scoped

5. **UI/UX Features**
   - [ ] Verify 5 tabs are implemented: Overview, Inventory, Transfers, Staff, Audit
   - [ ] Check loading states (LoadingSpinner, LoadingSkeleton)
   - [ ] Check empty states (EmptyState component)
   - [ ] Verify status badges have proper colors
   - [ ] Check that branch list page cards are clickable

6. **Build Status**
   - [ ] Run `npm run build` and confirm it completes successfully
   - [ ] Verify no TypeScript errors
   - [ ] Verify no blocking ESLint errors

7. **Type Safety**
   - [ ] Check all components have proper TypeScript interfaces
   - [ ] Verify props are properly typed
   - [ ] Check that no 'any' types are used unnecessarily

### Output Format

Please provide a structured report with:

1. **Summary:** Overall verification status (Pass/Fail)
2. **Detailed Findings:**
   - Items that passed verification ✅
   - Items that failed or are incomplete ❌
   - Items that need clarification ⚠️
3. **Gaps Identified:** Any missing functionality or bugs found
4. **Recommendations:** Any improvements or fixes needed

---

## Task 2: Create Branch Filtering Implementation Plan

After completing the verification, please create a comprehensive implementation plan to fix the following branch filtering gaps:

### Issues Identified

1. **Dashboard Page** (`app/(dashboard)/dashboard/page.tsx`)
   - Currently shows hardcoded sample stats
   - Needs real data fetching with branch filtering
   - Stats should show: Today's Orders, Pending Orders, Completed Today, Today's Revenue
   - Must filter by user's branchId (or all branches for super admin)

2. **Deliveries Page** (`app/(dashboard)/deliveries/page.tsx`)
   - Ready orders query: NO branch filter (line 42-50)
   - Pending deliveries query: NO branch filter (line 52-61)
   - Today's deliveries query: NO branch filter (line 64-77)
   - **All users currently see ALL deliveries across all branches**
   - Need to implement branch filtering for non-super-admins

3. **Customers Page** (`app/(dashboard)/customers/page.tsx`)
   - `searchCustomers()` does NOT filter by branch (line 34)
   - `getRecentCustomers()` does NOT filter by branch (line 37)
   - **All users currently see ALL customers across all branches**
   - Need to decide: Should customers be branch-specific or shared across all branches?

### Requirements for the Plan

Please create a detailed implementation plan (`docs/BRANCH_FILTERING_IMPLEMENTATION_PLAN.md`) that includes:

1. **Scope Definition**
   - Which pages need branch filtering?
   - Should customers be branch-scoped or system-wide?
   - Should deliveries be branch-scoped or system-wide?

2. **Implementation Steps**
   - Files to modify
   - Helper functions to create or update
   - Firestore queries to modify
   - Database schema changes (if needed)

3. **Access Control Rules**
   - Super admin: See all data across all branches
   - Branch manager: See only their branch's data
   - Multi-branch users: See combined data from all accessible branches

4. **Data Migration Considerations**
   - Do existing customers need branchId?
   - Do existing deliveries need branchId?
   - Migration script required?

5. **Testing Requirements**
   - Unit tests needed
   - Integration tests needed
   - Manual testing checklist

6. **Security Implications**
   - Firestore security rules updates
   - API endpoint protection
   - Data privacy considerations

7. **Performance Impact**
   - Query optimization needed
   - Indexing requirements
   - Caching strategy

8. **Backward Compatibility**
   - Impact on existing data
   - Impact on existing users
   - Rollback plan

### Deliverable

Create `docs/BRANCH_FILTERING_IMPLEMENTATION_PLAN.md` with:
- Clear problem statement
- Proposed solution architecture
- Step-by-step implementation guide
- Code examples for key changes
- Testing strategy
- Rollout plan

---

## Expected Timeline

- **Task 1 (Verification):** 15-20 minutes
- **Task 2 (Plan Creation):** 30-40 minutes
- **Total:** ~1 hour

Please complete both tasks and provide the verification report inline and the implementation plan as a new .md file.
