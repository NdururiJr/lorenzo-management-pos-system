# Branch Access & RBAC Implementation Guide

This document defines how branch-scoped access, roles, and cross-branch inventory transfers must be implemented. Claude/code should follow this as the contract for UI gating, API/Functions enforcement, and Firestore security rules.

## Roles & Scopes
- **Super Admin (Directors/top management):** System-wide read/write across all branches, manage roles, pricing, branch config, and analytics. Flag: `isSuperAdmin=true`.
- **Branch Manager:** Full read/write for their branch. Optional extra branches granted via claims (`branchAccess: [branchIds]`). Cannot change global settings unless also super admin.
- **Front Desk:** Branch-bound. Create/edit customers, create orders, take payments, print/send receipts. No cross-branch access.
- **Workstation Manager/Staff:** Branch-bound. View/update assigned orders/batches/stages, log issues, attach photos. No payments or cross-branch access.
- **Driver:** Branch-bound. View assigned deliveries/stops, customer contact for assigned orders only, update delivery status, collect COD if allowed. No other branch visibility.
- **Inventory Staff (if present; else manager handles):** Branch-bound inventory CRUD for their branch, can initiate/receive transfers. No cross-branch visibility beyond transfer partner details.
- **Customer:** Only their own orders/profile, irrespective of branch.

## Branch Scoping Rules
- Every domain document must carry a `branchId` (orders, deliveries, inventory, transactions, analytics slices, workstation batches).
- Cross-branch artifacts add both `fromBranchId` and `toBranchId` (inventory transfers) or `sourceBranchId`/`targetBranchId` for any other transfer flows.
- Default visibility is limited to `branchId` matching the user’s primary branch claim. Additional branches are opt-in via `branchAccess` array claim. Super admin bypasses.
- UI must filter queries by allowed branches and hide navigation to other branches unless claim allows. API/Functions and Firestore rules must enforce the same constraints.

## Domain Permissions (summary)
- **Orders/Garments:** Create/update within branch → front desk, branch manager. Status/stage updates → workstation staff/manager for same branch. Super admin → all.
- **Payments/Transactions:** Create/read within branch → front desk, branch manager. Refunds/voids → branch manager or super admin. No access for workstation staff/drivers.
- **Deliveries:** Create/assign routes within branch → branch manager (or delivery coordinator role if added). Drivers → only their assigned deliveries in their branch. Super admin → all.
- **Workstation/Batches:** Branch-bound. Workstation roles update stages/metrics; managers oversee branch queues. No cross-branch edits.
- **Inventory (per-branch stock):** CRUD and adjustments within branch → inventory staff/branch manager. Pricing catalogs may be global; if branch-specific pricing, managers can edit only their branch; super admin can edit all.
- **Users/Roles:** Super admin manages all users and roles. Branch manager may onboard/edit staff for their own branch only (not elevate to super admin).
- **Analytics/Reports:** Branch-scoped views for managers; system-wide views for super admin. Multi-branch comparisons only for super admin.

## Inventory Transfer Flow (cross-branch)
- **Data model:** `transferId`, `fromBranchId`, `toBranchId`, `items:[{inventoryItemId, name, unit, quantity, costPerUnit}]`, `status` (`draft` → `requested` → `approved` → `in_transit` → `received` → `reconciled` | `rejected` | `cancelled`), `requestedBy`, `approvedBy`, `dispatchedAt`, `receivedAt`, `notes`, `auditTrail` (timestamps/userIds).
- **Permissions:**
  - Create/request: inventory staff or manager of `fromBranchId`.
  - Approve/reject: manager of `fromBranchId` or super admin.
  - Mark in_transit: sender branch staff/driver.
  - Receive: inventory staff/manager of `toBranchId`.
  - Reconcile (adjust quantities, log discrepancies): manager of `toBranchId` (or super admin). Any discrepancy must write to `auditTrail` and optionally raise a notification.
- **Stock adjustments:**
  - On approve → reserve or decrement `fromBranch` stock (depending on policy: either `reserved` field or direct deduct + `pendingTransferOut`).
  - On receive → increment `toBranch` stock, clear `pendingTransferOut`/`inTransit` counts, log reconciliation deltas.
  - If rejected/cancelled → release reservations.
- **Notifications:** Send to both branches on status changes; log audit entries.

## Security Enforcement Layers
- **Claims shape:** `{ uid, role, branchId, branchAccess?: string[], isSuperAdmin?: boolean }`.
- **Firestore rules (pattern):**
  - Require auth.
  - Allow super admin → all collections.
  - For branch-bound docs: allow read/write if `request.auth.token.branchId == resource.data.branchId` OR `branchId` in `branchAccess` array. Writes must also check requested writes do not change `branchId` outside allowed set.
  - For transfer docs: allow if user is super admin OR user’s allowed branches contain `fromBranchId` or `toBranchId`, and action aligns with role (e.g., only sender can approve, only receiver can receive).
  - Deny role escalation unless `isSuperAdmin`.
- **API/Functions:** Duplicate all rule checks server-side (never trust client). Derive allowedBranches = `[branchId, ...branchAccess]` for non-super-admin, else `*`. Reject payloads with mismatched branch IDs. Add audit logging for admin/manager actions and all cross-branch transfers.
- **UI guards:**
  - Query filters must include allowedBranches. No client-side toggles to bypass.
  - Hide/disable actions based on role (e.g., no refund buttons for workstation staff, no cross-branch selectors for branch managers unless claim allows).
  - Force branch selector to allowed branches only.

## Data Tagging Standards (must-haves)
- `orders`, `garments`, `transactions`, `deliveries`, `workstationBatches`, `notifications`, `analytics` docs: `branchId`.
- `inventory` docs: `branchId`, quantities (`onHand`, `reserved`, `pendingTransferOut`, `inTransit`).
- Transfer docs: `fromBranchId`, `toBranchId` plus status timestamps and audit.
- User docs: `role`, `branchId`, optional `branchAccess`, `isSuperAdmin`.

## UI/UX Expectations
- Branch manager default view auto-filters to their primary `branchId`. If `branchAccess` has more branches, provide a controlled branch switcher limited to those IDs.
- Super admin can filter by any branch or “All” and can view cross-branch comparisons.
- Super admin in `/branches`: clicking any branch should open that branch’s detail/dashboard with full access (all actions enabled), while still logging actions to audit.
- Inventory transfer UI: clear sender/receiver, status chips, and reconciliation summary showing any deltas.
- Error states: show “access denied for this branch” rather than generic failures.

## Manual Verification Checklist (specific test cases)
- **Claims & Roles:** Log in as super admin → can see all branches and global settings. Log in as branch manager (Branch A only) → cannot see Branch B data. Log in as manager with `branchAccess=[A,B]` → can access A and B, not C. Log in as front desk/workstation/driver → sees only own branch and assigned entities.
- **Firestore Rules:** From Branch A user, attempt to read/write Branch B docs in Firestore (orders, inventory, deliveries) → denied. From manager with `branchAccess=[A,B]`, read/write A and B succeed, C denied. Super admin can read/write all.
- **Branch Filtering (UI/API):** Check list pages (orders, deliveries, inventory, reports) return only allowed branches. Branch selector shows only allowed branches; super admin sees all + “All”.
- **/branches Navigation:** As super admin, click any branch card/row → branch detail/dashboard opens with full actions enabled. As Branch A manager, other branches either hidden or denied with proper “access denied for this branch.”
- **Orders/Payments:** Branch A front desk creates order/payment → succeeds. Same user tries to update Branch B order or refund → denied. Super admin can refund any branch.
- **Deliveries/Drivers:** Branch A driver sees only assigned deliveries from Branch A; cannot load Branch B routes. Branch manager can create/assign deliveries only within own allowed branches.
- **Workstation:** Branch-bound staff can move stages only for their branch. Attempt to move Branch B order from Branch A account → denied.
- **Inventory Transfers:** Sender (Branch A) can create/request; approve requires Branch A manager or super admin. Mark in_transit from sender; receiver (Branch B) can receive/reconcile; stock adjusts correctly (reserve/deduct on approve; add on receive; release on reject/cancel). Try cross-branch actions from unauthorized branch → denied. Audit trail written for each status change.
- **Data Tagging Integrity:** Attempt to change `branchId` on existing docs → denied. Transfer docs always have both `fromBranchId` and `toBranchId`.
- **Audit Logging:** Verify admin/manager actions and all transfer status changes emit audit entries with user, branch, timestamp, action.
- **Edge Cases:** Reject/cancel transfer releases reservations. Reconciliation with discrepancy logs delta. Manager with extra branches cannot edit global settings; only super admin can elevate roles.

## Testing Checklist
- Authenticated user with branch A cannot read/write branch B docs via API or Firestore.
- Branch manager with `branchAccess=[A,B]` can switch between A and B but not C.
- Super admin can access all branches and perform global actions.
- Inventory transfer: sender can request/approve; receiver can receive; stock adjustments occur correctly; rejected/cancelled releases reservations; audit entries recorded.
- UI hides actions/branches the user is not allowed to use; attempts to bypass via API are denied by server and Firestore rules.

## Implementation Notes
- Keep `branchId` immutable after creation; to move data across branches, create a new record or use a transfer workflow with audit.
- Always enforce branch scope at the lowest layers (rules + API). Client filters are not sufficient.
- Log all cross-branch actions (especially inventory transfers and role changes) to audit logs for traceability.
