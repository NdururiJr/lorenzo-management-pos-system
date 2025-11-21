# Branch Detail Page (/branches/[branchId]) - Implementation Plan

## Objective
Create a branch-specific dashboard page that respects branch independence. Only users allowed for that branch (or super admins) can view/manage it. All data and actions must be filtered by `branchId` per `docs/BRANCH_ACCESS.md`.

## Scope
- Route: `app/(dashboard)/branches/[branchId]/page.tsx` (server component with client children where needed).
- Audience: super admins (all branches) and managers with access to this `branchId`. Others: show access denied.
- Branch independence: all queries and actions must filter by this `branchId`; no cross-branch data leakage.

## Access Control
- Gate entry: if `!isSuperAdmin && !canAccessBranch(branchId)` → 404/access denied.
- Super admin: full actions (edit branch, manage staff, create transfers, view audit, compare metrics).
- Branch manager (`branchId` or in `branchAccess`): view/manage within branch; no global settings.
- Other roles: optional read-only summary or deny (align with product decision; default: deny).

## Page Layout (sections)
1) **Header**: branch name, active/inactive badge, address + phone, actions (Edit Branch, Manage Staff) visible to super admin/manager.
2) **Key Stats** (cards):
   - Orders today/this week (count, trend)
   - Revenue today/this week (if available)
   - Active deliveries (count)
   - Inventory alerts (low stock count)
   - Open transfers (outgoing+incoming)
3) **Tabs/Sections** (stacked on mobile):
   - Overview: recent orders list (5-10), top customers, pipeline snapshot (counts by status), delivery snapshot.
   - Inventory: summary table (top items, low stock), link to full inventory filtered by branch, button to create transfer (if allowed).
   - Transfers: incoming/outgoing list with status chips; actions per role/status (approve, in_transit, receive, reconcile).
   - Staff: branch staff list (names, roles), quick actions (view profile/edit if allowed).
   - Audit: branch audit logs (super admin + managers) with filters (action, resource, date).

## Data/Queries (all filtered by branchId)
- Branch doc: `/branches/{branchId}` (name, contact, active, location).
- Orders summary: counts by status, recent orders (limit 10), revenue (if stored/aggregated).
- Deliveries: active deliveries count; recent deliveries (limit 5-10).
- Inventory: top N items, low-stock items; counts of pendingTransferOut/inTransit.
- Transfers: list by branch (from/to) with statuses; use `lib/db/inventory-transfers.ts`.
- Staff: users/employees with `branchId` or in branchAccess containing this branch (if policy allows viewing cross-branch staff—default restrict to branchId match).
- Audit logs: `auditLogs` filtered by `branchId` (use `getAuditLogsByBranch`).

## Component/Hook Needs
- Branch guard HOC/hook: wrap page to enforce `canAccessBranch(branchId)`.
- Stats cards component (reusable) consuming branch-filtered queries.
- Transfers widgets: list + action buttons tied to transfer functions.
- Audit log list component (filterable) scoped to branchId.
- Access-denied state component.

## Navigation Behavior
- `/branches` cards should link to `/branches/[branchId]` (super admin: all cards; managers: only allowed branches).
- Optional branch selector for super admin within detail page to jump between branches (respecting allowed branches).

## Implementation Steps
1) Add route file `app/(dashboard)/branches/[branchId]/page.tsx` with access guard and data loader skeleton.
2) Create layout components: BranchHeader, BranchStatsGrid, BranchOverview, BranchInventorySummary, BranchTransfersPanel, BranchStaffList, BranchAuditPanel.
3) Wire data fetching to backend functions/API with `branchId` filters; handle loading/error/empty states.
4) Connect transfer actions to `createInventoryTransfer`, `updateTransferStatus`, `approveTransfer`, `receiveTransfer`, `cancelTransfer` (role/status gated).
5) Update `/branches` page to fetch real branches, respect access, and link cards to detail.
6) Add access-denied handling for unauthorized roles.
7) Add Audit log viewer scoped to branchId (super admin + managers).
8) QA using checklist below.

## Manual Verification Checklist (specific test cases)
- Access control: super admin can open any `/branches/{id}`; Branch A manager can open A; cannot open B (404/denied).
- Header data shows correct branch name/contact and active badge; actions visible only to allowed roles.
- Stats reflect only this branch (orders/deliveries/revenue/inventory/transfer counts).
- Orders snapshot: shows only branch orders; clicking an order opens branch-scoped order detail (if allowed).
- Inventory: low-stock list and counts are branch-specific; links go to inventory filtered by branch; create-transfer button visible only to allowed roles.
- Transfers: outgoing/incoming lists show correct statuses for this branch; allowed actions succeed; unauthorized actions blocked in UI and API.
- Staff: displays only staff assigned to this branch (or allowed by policy); super admin can view all.
- Audit: visible only to super admin/managers; entries filtered to branchId; scrolling/pagination works.
- `/branches` list: cards link to `/branches/{id}`; unauthorized branches hidden or denied; super admin sees all.
- Error states: friendly access-denied message for unauthorized; empty states for no data; loading states present.
- Branch independence: no cross-branch records appear when switching between two different branchIds in consecutive tests.

## Notes
- Keep branch independence strict: never show multi-branch aggregates on this page unless super admin explicitly selects “All” (outside this per-branch page).
- Reuse `canAccessBranch` and `allowedBranches` from `AuthContext`; avoid client-only filtering without server-side checks.
