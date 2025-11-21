# Dashboard Feature Remediation Plan (Pricing, Staff, Reports, Transactions)

## Goals
- Fix broken pricing actions and lock pricing writes to top-level management (super admin ± director/general_manager), branch users read-only.
- Enforce branch scoping for employee views; improve Add Employee modal UX and flow.
- Design/implement Reports page (phase 1) with meaningful KPIs/visuals.
- Design/implement Transactions page (phase 1) with branch-scoped listing and details.

## Roles (pricing clarification)
- **Super Admin** (and optionally **Director/General Manager** if enabled): Full pricing CRUD. Nav visible. Can view all staff/transactions/reports across branches.
- **Branch Manager**: Pricing read-only (nav hidden). Sees staff for own branches only. Sees branch-scoped reports/transactions.
- **Front Desk / Workstation / Driver**: No Pricing nav; limited modules per existing nav; no staff management access.

## Feature Workstreams & Steps

### A) Pricing (critical: broken “Add Pricing” + admin-only writes)
1. **Nav visibility**: `components/layout/Sidebar.tsx` – set Pricing nav `requireSuperAdmin: true` (or include director/general_manager if desired). Hide for others.
2. **Page guard**: `app/(dashboard)/pricing/page.tsx` – if not allowed role, redirect/deny; show read-only message if needed.
3. **Add/Edit modal**: Create `components/features/pricing/AddPricingModal.tsx` with fields: garmentType, wash, dryClean, iron, starch, express%, active. Branch selector only for super admin; branch locked for others. Validation via zod.
4. **Wire actions**: Pricing page “Add Pricing” button and empty-state action open modal. Edit action opens modal prefilled.
5. **Backend calls**: Use `setPricing`, `updatePricingServices`, `activate/deactivatePricing`. On success, refetch list; toast success/error.
6. **Firestore rules**: In `firestore.rules`, pricing collection allow write only `isSuperAdmin()` (and optionally director/general_manager). Read for authenticated staff. Keep branchId immutable on update.
7. **Copy**: Note “Pricing managed centrally” for non-admins.

### B) Employee Access Control (security)
1. **Page access**: `app/(dashboard)/employees/page.tsx` – guard so only super admin and branch managers can view; others redirect/deny.
2. **Branch-scoped fetch**: Use `allowedBranches`/`isSuperAdmin` from `useAuth`. If super admin -> fetch all (paginated). If allowedBranches <=10 -> `where('branchId','in', allowedBranches)`. Else loop branches and merge results (de-dupe). Include branchId/name in table for super admin.
3. **Branch access support**: For users with `branchAccess`, include those branches in allowed list.
4. **Rules**: `firestore.rules` already restricts users reads; verify no gaps. If adding new server helpers, apply same branch filters.
5. **UI**: Show branch column for super admin; hide for branch managers.

### C) Add Employee Modal UX (high)
1. **Fields**: Full name (required), email (required), phone (+254 validation), role (front_desk, workstation_staff, driver, manager, etc.), branch selector (super admin only; managers locked to own branch), start date, status active toggle.
2. **Flow**: On submit, call backend/Cloud Function/server action to create Firebase Auth user, set claims (role, branchId, branchAccess=[], isSuperAdmin=false), and Firestore user doc. Send invite email or generate temp password (documented).
3. **Validation/UX**: Inline errors, disable while submitting, success/error toasts, close on success. Keep accessibility (labels, focus trap, keyboard submit/escape).
4. **Files**: Update `components/features/employees/AddEmployeeModal.tsx`; add server action/Cloud Function if needed; handle errors gracefully.

### D) Reports Page (phase 1 design/implementation)
1. **UI**: Replace placeholder in `app/(dashboard)/reports/page.tsx` with KPI cards + charts (Recharts/Chart.js). Filters: date range (today/7d/30d/custom), branch selector (super admin/all vs allowed branches), status/payment method where applicable.
2. **KPIs**: Revenue (today/MTD), Orders (today/MTD), AOV, Paid vs Pending, On-time deliveries %, Turnaround time, Return rate, Low stock alerts, Staff productivity (orders per staff), Workstation throughput.
3. **Charts**: Time series for orders/revenue, pie/donut for payment methods/status, funnel for pipeline, bar for staff productivity. Table for recent metrics.
4. **Data layer**: Add helpers/aggregations (on-demand or precomputed) to fetch summaries per branchIds/date range. Enforce branch filtering in queries.
5. **Exports**: Add CSV/PDF export for tables/summaries (phase 1 CSV is sufficient).

### E) Transactions Page (phase 1)
1. **Schema**: Add `branchId` to Transaction model/docs; backfill from orders. Update `createTransaction` to set branchId from order.branchId.
2. **Rules**: Update `firestore.rules` for transactions to enforce `canAccessBranch(resource.data.branchId)` for reads/writes; super admin full.
3. **UI**: Replace placeholder in `app/(dashboard)/transactions/page.tsx` with data table, filters (date range, branch, status, method, customer/order), search by ID, summary cards (total revenue, pending, failed, refunds). Detail modal for a transaction. Export CSV.
4. **Data fetch**: Add branch-scoped queries (use allowedBranches/isSuperAdmin with `in` or multi-fetch). Tie into POS/payment flows that create transactions.
5. **Integration**: Ensure POS/payment create transactions with branchId and update order payment status as today.

## Security
- Enforce branch scoping at UI, server/helpers, and Firestore rules (pricing writes admin-only; transactions/ users/ deliveries branch-filtered).
- Keep branchId immutable on updates for branch-scoped collections.
- Audit: log pricing and role/user changes if audit system is available.

## Testing Checklist
- Pricing: Non-admin cannot see nav/actions; super admin can add/edit; Firestore write allowed only for super admin.
- Employees: Super admin sees all with branch column; manager sees only own/branchAccess; unauthorized roles denied.
- Add Employee: Validation, branch assignment correct, user created with claims; errors handled.
- Reports: Data reflects selected branch/date filters; super admin can see all; branch users see scoped data.
- Transactions: After schema update, transactions show per branch; super admin sees all; filters work; exports work.
- Build/tests: Run TS/lint/build; address any failures.

## Deliverables for Claude/code
- Implement changes above in relevant files (Sidebar, pricing page + modal, employees page + modal, reports and transactions pages, Firestore rules, pricing/transactions helpers, optional server actions/Cloud Functions).
- Provide brief report of changes and tests run (or blocked).
