# Shipping Readiness Plan (Notifications, Emails, Rules, Data Hygiene)

Use this as the final checklist for Claude/code to make the project ship-ready. It consolidates outstanding work on notifications, rules/migrations, and email coverage/design.

## Critical Remaining Items
1) **Pricing/Transactions Rules**
   - Firestore rules: pricing writes admin-only (`isSuperAdmin()`), branchId immutable; transactions read/write only if `canAccessBranch(resource.data.branchId)`, super admin bypass.
   - Server/helpers: enforce same checks server-side; no client writes to pricing/transactions.

2) **Transactions Data Hygiene**
   - Schema: branchId added to Transaction (already in code).
   - Migration: backfill existing transactions’ branchId from related orders; write a script (Admin SDK) to update docs.
   - Indexes: add composite indexes for `transactions` on (branchId + timestamp), (branchId + status + timestamp), (branchId + method + timestamp).

3) **Deliveries Branch Scoping**
   - Verify deliveries docs include `branchId`. If missing, backfill from orders/assignments.
   - Add/verify Firestore rules for deliveries: read/write only if `canAccessBranch(resource.data.branchId)` (super admin bypass).
   - Ensure pending/today counts on deliveries page use branch filters; add indexes as needed.

4) **Customer Portal End-to-End**
   - Complete any remaining items from `docs/CUSTOMER_PORTAL_IMPROVEMENTS.md` and `docs/NOTIFICATIONS_AND_LIVE_TRACKING_PLAN.md` (notifications, live tracking, request pickup stub, profile/addresses, payment/receipt stubs) so customers can navigate end-to-end without dead ends.

5) **Build Health**
   - Resolve Next.js prerender error (`_error` page) so `npm run build` passes. Add custom 404/500 if needed.

## Email Coverage (Resend) – Events & Templates
Design consistent, branded templates (match current blue/modern aesthetic). Recommended emails:
1) **Authentication & Account**
   - Password reset (staff/customer, if email auth used).
   - Employee invitation (branch staff/manager), with temp password or set-password link.
2) **Staff Operations (optional)**
   - Branch staff assignment/driver assignment notifications (if desired).
3) **Customer Lifecycle**
   - Order confirmation (order received).
   - Order ready (pickup/delivery ready).
   - Order delivered/collected (thank you).
   - Payment receipt (when paid/partially paid).
   - Payment reminder (if `paymentStatus !== 'paid'` after ready).
   - Pickup request received (if request pickup flow used).
4) **Receipts**
   - Receipt email with link/PDF (can be stubbed until receipt generation is ready).

Implementation notes:
- Use `services/email.ts` / `lib/resend.ts`; add templates under `emails/` for each event.
- Trigger alongside WhatsApp sends in order triggers (see notifications plan).
- Include basic data: customer name, orderId, branch, status, totals, CTA link to portal.

## WhatsApp (WATI) & Email Triggers (recap)
- Events: order created → confirmation; status ready → ready notice; status delivered/collected → thank you; payment reminder (optional); payment receipt (when paid).
- Channels: WhatsApp via WATI (templates), email via Resend (templates), log to `notifications`.
- Use existing code refs: WATI (`docs/WATI_SETUP.md`, `docs/WATI_INTEGRATION_EXAMPLES.md`, `services/wati.ts`, `functions/src/utils/whatsapp.ts`, `functions/src/triggers/notifications.ts`), Resend (`services/email.ts`, `lib/resend.ts`, `emails/*.tsx`).

## Live Tracking (recap)
- Driver writes location to Firestore doc (one per delivery, throttled ~10–15s).
- Rules: driver can write only their delivery; customer can read only deliveries containing their order.
- Customer order detail listens to location doc; renders Google Maps with driver + customer markers, ETA via Distance Matrix; fallback when stale.

## Verification Checklist (ship-ready)
- Pricing: non-admin cannot write; super admin can; rules enforce; UI aligned.
- Transactions: branchId present on all docs; rules enforce; indexes exist; UI shows branch-scoped data.
- Deliveries: branchId present; rules enforce; counts filtered; indexes OK.
- Customer portal: no dead ends; order detail timeline/tracking; request pickup stub; pay/receipt stubs; profile/addresses; dev-mode notice retained in dev; prod blocks non-customers.
- Notifications: WhatsApp/email fire on key events; notifications logged; test endpoint works.
- Build: TS/lint/build pass; `_error` prerender issue resolved.

## Files to Update
- `firestore.rules` (pricing/transactions/deliveries rules)
- Migration scripts (transactions branchId backfill; deliveries branchId if needed; indexes)
- `emails/*.tsx` (new templates)
- `functions/src/triggers/notifications.ts` (ensure triggers fire on events)
- Customer portal files per improvement plans
- Build config/custom error pages if needed
