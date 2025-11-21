# Dashboard E2E Plan by Role

This plan tells Claude/code what to build/change and how to validate end-to-end for each role on the dashboard side. It assumes branch-scoped RBAC per `BRANCH_ACCESS.md` and filtering fixes per `BRANCH_FILTERING_IMPLEMENTATION_PLAN.md`.

## Objectives
- Make the dashboard experience correct per role (super admin, branch manager, front desk, workstation, driver). 
- Expose branch context in the UI (user chip) and enforce branch filtering everywhere.
- Provide trial accounts (one per branch) to test end-to-end flows.

## Required Code Changes
1) **User chip branch context (Sidebar)**
   - File: `components/layout/Sidebar.tsx`
   - Under the user name/role, render branch name (lookup by `branchId`) for non-super-admins. For super admin, show "All branches" and optionally current branch selection if selector exists.
   - If `branchId` is missing, show "No branch assigned".

2) **Navigation visibility (Sidebar)**
   - Confirm nav roles: Branch manager should NOT see `Branches` nav; should see Dashboard, Orders (incl. Create), Pipeline (if allowed), Workstation (if workstation role), Customers, Deliveries, Inventory, Reports, Staff, Pricing, Transactions, Settings.
   - Front desk: POS/Orders/Customers/Transactions only; hide Workstation, Branches, Inventory, Reports, Pricing.
   - Workstation staff: Workstation + Orders/Pipeline read-only; hide CRM/Inventory/Branches.
   - Driver: Deliveries only (and maybe read-only Orders for assigned deliveries).

3) **Branch filtering fixes (must implement)**
   - Dashboard stats (`app/(dashboard)/dashboard/page.tsx`): replace hardcoded stats with branch-scoped queries using `allowedBranches` and `isSuperAdmin` (Orders Today, Pending Orders, Completed Today, Today’s Revenue).
   - Deliveries (`app/(dashboard)/deliveries/page.tsx`): add branch filters to ready orders, pending deliveries, today’s deliveries; use `in` or multi-query fallback for multi-branch users.
   - Branch detail transfers: fix `getTransfersByBranch` usage (`'from'|'to'|'both'`), count open transfers correctly, and ensure branch-scoped data.
   - Audit tab: allow managers to view branch audit logs (not just admin/super admin).
   - Unauthorized branch access: 404/redirect instead of inline alert.

4) **Trial account seeding (one per branch)**
   - New script: `scripts/seed-branch-trials.ts` (Node/TS with Firebase Admin).
   - For each branch doc in `branches` collection, create a user:
     - Email pattern: `<slug>@lorenzo.com` (slugify branch name, e.g., `adlife-plaza@lorenzo.com`).
     - Password: reuse `NEXT_PUBLIC_DEV_LOGIN_PASSWORD` or set `DevPass123!`.
     - Role: `manager` (or specified per branch if provided); `isSuperAdmin: false`.
     - Claims/docs: `branchId` set to branch doc ID, `branchAccess: []`, `active: true`, `name: Branch Manager - <branch name>`.
   - Idempotent: update existing users if they already exist; refresh custom claims.
   - Output a table/log of created/updated accounts.

5) **Branch lookup helper**
   - Add a helper to fetch branch name by `branchId` (cache/client-side) for Sidebar chip and anywhere branch labels are needed.

## Trial Accounts to Produce (examples)
- `adlife-plaza@lorenzo.com` / `DevPass123!` (branchId: <Adlife Plaza Mezzanine Flr>)
- `arboretum-shell@lorenzo.com` / `DevPass123!`
- `bomas-rubis@lorenzo.com` / `DevPass123!`
- ... one per branch doc (use the existing 22 branches seeded).
- Super admin remains `dev@lorenzo.com` / `DevPass123!`.

## Role-Based UX Expectations
- **Super Admin**: Sees all nav items; Branches list; can open any branch detail; user chip shows "All branches"; data unfiltered.
- **Branch Manager**: Sees branch-scoped nav; Branches nav hidden; user chip shows their branch name; data filtered to their branch; cannot access other branches.
- **Front Desk**: POS/Orders/Customers/Transactions; branch chip shows branch; data filtered; no Branches/Inventory/Reports.
- **Workstation Manager/Staff**: Workstation + limited Orders/Pipeline; branch chip shows branch; data filtered.
- **Driver**: Deliveries only; assigned deliveries constrained to branch; branch chip shows branch.
- **Customer (portal)**: Out of scope for dashboard; still branch-agnostic on their orders.

## E2E Test Checklist by Role (manual)
- Super admin: access all branches; Branches page visible; branch detail loads; audit tab visible; deliveries/dashboard show all data.
- Branch manager: cannot see Branches nav; chip shows branch name; branch detail accessible only for own branch; dashboard/deliveries scoped; audit tab visible; other branches 404/denied.
- Front desk: chip shows branch name; can create orders only for branch; deliveries/dashboard scoped; Branches/Inventory hidden.
- Workstation staff: can update stages for branch orders; cannot access Branches/Inventory; dashboard scoped.
- Driver: sees only deliveries; only assigned deliveries from branch.
- Trial accounts: verify login works for a few branches; data visibility matches branch.

## Implementation Steps (for Claude/code)
1. Update `Sidebar.tsx` to render branch name and adjust role visibility per above.
2. Add branch lookup helper (client-safe) to resolve branch name by `branchId` with caching.
3. Fix branch detail issues: transfer queries, open transfer count, audit visibility, unauthorized redirect.
4. Implement branch filtering on dashboard stats and deliveries page per `BRANCH_FILTERING_IMPLEMENTATION_PLAN.md`.
5. Add `scripts/seed-branch-trials.ts` to create manager accounts per branch; log credentials mapping.
6. Run/build/test (lint/TS/build) if environment allows; otherwise document blocked tests.
7. Provide verification notes and any remaining gaps.
