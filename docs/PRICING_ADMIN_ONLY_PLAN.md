# Pricing Management – Admin Only Plan

## Objective
Lock pricing creation/updates to top-level management only (super admin, and optionally director/general_manager), keep branch users read-only, and remove pricing nav/actions for branch-level roles.

## Roles & Access
- **Super Admin (required):** Full CRUD on pricing.
- **Director/General Manager (optional):** If desired, allow CRUD; otherwise read-only.
- **Branch Manager & below:** Read-only (can view prices), no add/edit/delete, Pricing nav hidden.
- **Customers/Drivers/Front Desk/Workstation:** Read-only or no access as per current nav; no write.

## Data Model Guidance
- Keep pricing centralized. Either:
  - Use existing `pricing` docs with `branchId` but only super admin can write; branches read only.
  - Or allow a `global` branchId/null for shared pricing; retain branchId for future overrides but still enforce super-admin-only writes.
- No branch-level overrides by default.

## Implementation Steps (for Claude/code)
1) **Navigation Visibility**
   - File: `components/layout/Sidebar.tsx`
   - Make `Pricing` nav visible only to super admin (and optionally director/general_manager if you want). Add `requireSuperAdmin: true` or adjust roles accordingly.

2) **Pricing Page Guard**
   - File: `app/(dashboard)/pricing/page.tsx`
   - Add guard: if not `isSuperAdmin` (or allowed top-level role), redirect/deny with access message.
   - Remove or hide add/edit actions for non-allowed roles.

3) **Actions Gating**
   - File: `app/(dashboard)/pricing/page.tsx`
   - “Add Pricing” button and empty-state action: show only for allowed roles; otherwise hide/disable.
   - Edit action likewise.

4) **Firestore Rules**
   - File: `firestore.rules`
   - Pricing collection: allow read to authenticated staff; allow create/update/delete **only** if `isSuperAdmin()` (and optionally check role == director/general_manager if you choose). Ensure branchId immutability if present.

5) **Backend Helpers**
   - Files: `lib/db/pricing.ts`, any server actions/functions
   - Enforce role/claim checks server-side before calling `setPricing`, `updatePricingServices`, `deactivatePricing`, `activatePricing`, `deletePricing`, `seedDefaultPricing`.

6) **UI Copy**
   - On pricing page, add a note (for non-admins) that pricing is managed centrally by management.

7) **Optional: Global Pricing Flag**
   - If you want a single global pricing set, allow `branchId = 'global'` or null; adjust queries to fetch global if branch pricing not found. Keep writes admin-only.

## Security Considerations
- Enforce at all layers: Sidebar visibility, page guard, server-side checks, Firestore rules.
- Prevent branchId tampering: in rules, deny branchId changes by non-super-admin; keep branchId immutable on update.
- Audit: log pricing changes (if audit system is in place) with performer and timestamp.

## Testing Checklist
- Login as super admin: Pricing nav visible; can add/edit pricing; Firestore writes succeed.
- Login as branch manager/front desk: Pricing nav hidden; direct navigation to `/pricing` yields access denied/redirect; cannot trigger add/edit; Firestore writes denied by rules.
- Verify Firestore rules: non-super-admin cannot write to `pricing`; super admin can.
- If global fallback: ensure branch users can read pricing; queries return global/default when no branch-specific pricing.
