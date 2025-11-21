# Branch Filtering Implementation Plan

## Problem Statement
Branch-scoped visibility is inconsistent across dashboard, deliveries, and customers pages. Non-super-admin users can see cross-branch data because queries are not filtered by allowed branches. We must align UI queries, server helpers, and rules with BRANCH_ACCESS.md so users only see data for branches they’re allowed to access, while super admins can see all.

## Scope
- **Dashboard** (`app/(dashboard)/dashboard/page.tsx`): replace hardcoded stats with branch-filtered data (Orders Today, Pending Orders, Completed Today, Today’s Revenue) using user’s branch scope (all for super admin).
- **Deliveries** (`app/(dashboard)/deliveries/page.tsx`): add branch filters for ready orders, pending deliveries, and today’s deliveries. Non-super-admin users see only their allowed branches; super admin sees all.
- **Customers** (`app/(dashboard)/customers/page.tsx`): clarify policy: customers are system-wide (global), but order/history views per user must be filtered by allowed branches. Staff can search/select any customer; order lists/history must be branch-scoped to user’s access. (If policy changes to branch-scoped customers, adjust schema and rules accordingly; default here: global customers.)

## Access Control Rules
- **Super admin**: unrestricted; can query all branches (no branch filter or explicit “all”).
- **Branch manager/staff**: filter queries by `branchId` in allowedBranches (primary + branchAccess). For aggregations, use `where('branchId','in', allowedBranches)` where in-length <=10; otherwise fetch per-branch and merge client-side.
- **Multi-branch users**: combine data across allowedBranches only.

## Implementation Steps

### 1) Shared Helpers
- Create/extend helper in `lib/auth/utils.ts` or a new `lib/auth/branch-access.ts`:
  - `getAllowedBranchesArray(userData): string[]` (super admin -> empty array or `null` to indicate all).
  - `buildBranchConstraints(allowedBranches)` to return Firestore constraints for `in` queries when <=10; fallback to multiple queries merged client-side when >10.
- Add a utility in `lib/db` (e.g., `lib/db/branch-filters.ts`) to standardize branch-scoped fetches for multi-branch users (fetch per branch when `in` is not usable).

### 2) Dashboard Page (`app/(dashboard)/dashboard/page.tsx`)
- Replace hardcoded stats with data hooks that accept `allowedBranches` & `isSuperAdmin` from `useAuth`.
- Queries needed:
  - Orders today: count of orders with `createdAt >= today`, filtered by branchId in allowedBranches (or all for super admin).
  - Pending orders: count where `status` in [received, queued, inspection] filtered by branch.
  - Completed today: count where status ∈ [delivered, collected], `actualCompletion >= today`, filtered by branch.
  - Today’s revenue: sum of transactions/payments today for allowed branches (fallback: sum order `paidAmount` for orders completed today).
- Implement loading/error states; ensure no cross-branch leakage.

### 3) Deliveries Page (`app/(dashboard)/deliveries/page.tsx`)
- Add `useAuth` to get `allowedBranches`/`isSuperAdmin`.
- Update queries:
  - Ready orders: add `where('branchId','==', branch)` or `in` based on allowedBranches.
  - Pending deliveries: add branch filter(s) on deliveries collection.
  - Today’s deliveries: add branch filter(s) and date constraint.
- When `allowedBranches.length > 10`, loop branchIds and sum sizes; otherwise use `in` query.
- Ensure React Query keys include allowedBranches to refetch on role/branch changes.

### 4) Customers Page (`app/(dashboard)/customers/page.tsx`)
- Confirm policy: Customers are global. Keep search global; keep creation global.
- For order/history views in this page (if present), filter orders by allowedBranches.
- If downstream components render customer order lists, pass `allowedBranches` and filter queries accordingly.
- If policy shifts to branch-scoped customers, add `branchId` to customers, migrate data, update rules and queries (see Data Migration section).

### 5) Firestore Query Updates
- Add branch-aware fetch helpers in `lib/db`:
  - Orders: `getOrdersForBranches(branchIds: string[])` with `in`/multi-query merge.
  - Deliveries: `getDeliveriesForBranches(branchIds, status?, dateRange?)`.
  - Transactions: `getTransactionsForBranches(branchIds, dateRange?)` for revenue.
- Update pages to use these helpers instead of raw collection queries.

### 6) Access Control & UI Guards
- Surface access-denied UI if `allowedBranches` is empty for non-super-admin and page requires data.
- Ensure branch selectors (if added later) are constrained to allowedBranches; super admin gets “All”.

### 7) Data Migration Considerations
- Current assumption: customers are global → no `branchId` needed.
- Deliveries currently lack branch filters; verify each delivery doc already has `branchId`. If missing:
  - Add `branchId` to deliveries schema; backfill via related orders’ branchId.
  - Write a one-time script (admin SDK) to set `branchId` on deliveries and ensure indexes.
- If policy changes to branch-scoped customers: add `branchId` array or primary branch field to customers, migrate existing docs, and update rules to allow global read for staff but scoped order access.

### 8) Testing Requirements
- Unit tests: helpers for building branch constraints; multi-branch merge logic; branch-aware queries.
- Integration tests: dashboard stats for single-branch user vs. super admin; deliveries counts reflect only allowed branches; customers page shows global customers but order histories filtered.
- Manual checklist:
  - Login as super admin: see all stats/deliveries; numbers reflect all branches.
  - Login as Branch A manager: stats/deliveries include only Branch A; cannot see Branch B deliveries/orders.
  - Multi-branch user (A,B): stats/deliveries combine A+B; not C.
  - Customers page: search returns global customers; customer order lists show only allowed-branch orders.

### 9) Security Implications
- Firestore rules: ensure deliveries collection enforces branch-based reads/writes (add `canAccessBranch(resource.data.branchId)` where missing). Verify orders/transactions rules already scoped.
- API endpoints: if any server routes fetch deliveries/orders/customers, add branch filtering server-side using claims.
- Data privacy: avoid exposing contact info/stats across branches for non-super-admins.

### 10) Performance & Indexing
- Add/verify indexes for:
  - `orders`: branchId + createdAt, branchId + status + createdAt
  - `deliveries`: branchId + status, branchId + scheduledDate
  - `transactions`: branchId + timestamp
- For multi-branch queries, prefer `in` when branch count ≤10; otherwise parallel queries + aggregate client-side.
- Cache with React Query; include branch dependencies in keys.

### 11) Backward Compatibility & Rollback
- Keep customers global to avoid schema migration unless required.
- If adding branchId to deliveries, perform migration in a script; keep a feature flag to fall back to old queries during rollout.
- Rollback plan: revert pages to previous (global) queries if scoped queries break; keep migration scripts idempotent.

## Code Examples
- Branch-constrained fetch (single branch):
```ts
const ordersSnap = await getDocs(query(collection(db,'orders'), where('branchId','==', branchId), where('createdAt','>=', today)));
```
- Multi-branch helper (<=10 branches):
```ts
const q = query(collection(db,'deliveries'), where('branchId','in', allowedBranches), where('status','==','pending'));
```
- Multi-branch fallback (>10 branches):
```ts
const results = await Promise.all(allowedBranches.map(b => getDocs(query(collection(db,'orders'), where('branchId','==', b), where('createdAt','>=', today)))));
const total = results.reduce((sum, snap) => sum + snap.size, 0);
```

## Rollout Plan
1) Implement helpers and update dashboard/deliveries/customers to use them.
2) Add/verify Firestore indexes; deploy rules if deliveries rules change.
3) Run targeted manual tests (super admin, single-branch manager, multi-branch user).
4) If adding branchId to deliveries, run migration script in staging then production.
5) Monitor for query errors and performance; adjust indexes or batching as needed.
