# Launch Readiness Implementation Plan

This is the single guide for Claude/code to make the project ship-ready. It consolidates build fixes, notifications, data hygiene, portal hardening, rules, and final testing.

## Objectives
- Fix the Next.js build error (React Email conflict) and get `npm run build` passing.
- Finalize notifications (WhatsApp via WATI + email via Resend) on key order events.
- Clean and secure data for transactions/deliveries; enforce branch scoping in rules.
- Harden the customer portal end-to-end (no dead ends; tracking/pickup stubs; security).
- Ensure security, indexes, and tests are in place for launch.

## 1) Build Fix: Replace React Email Templates
- Remove reliance on `@react-email/*` (build blocker). **Action:** delete `@react-email/render` (and any `@react-email/*`) from package.json and ensure no imports remain.
- Use a Next 15–compatible approach:
  - Replace templates with plain HTML (or MJML compiled to HTML) rendered server-side.
  - Keep all 6 senders and the 7 email functions intact: sendPasswordReset, sendOrderConfirmation, sendOrderStatusUpdate, sendReceipt, sendEmployeeInvitation, sendPaymentReminder, sendPickupRequestConfirmation.
- Implementation steps:
  1. Remove `@react-email/components` and `@react-email/render` from dependencies; clean imports.
  2. Store templates as HTML (or MJML compiled) in a safe location (`email-templates/` is fine).
  3. In `services/email.ts`, render HTML server-side (no `<Html>` React component); pass `from` using existing EMAIL_SENDERS config.
  4. Ensure all 7 email functions still send with proper sender addresses.
  5. Run `npm run build` to confirm success.

## 2) Notifications (WATI + Resend)
- Events: order created (confirmation), status ready (pickup/delivery), status delivered/collected (thank you), optional payment reminder/receipt.
- WhatsApp: use WATI templates (order_received, order_ready, order_delivered). Env: WATI_API_KEY, WATI_API_URL.
- Email: use Resend with new HTML templates; sender addresses per event (orders@, support@, billing@, delivery@, hr@, noreply@).
- Backend wiring:
  - Use `functions/src/utils/whatsapp.ts` and `functions/src/triggers/notifications.ts` (or equivalent) to send on events.
  - Log each send to `notifications` collection (pending/sent/failed, recipient, orderId, timestamp).
  - Test via `/api/test/wati` in dev.

## 3) Data Hygiene & Rules
- Transactions:
  - Ensure `branchId` on all transaction docs. Backfill from orders (Admin SDK script). Add indexes: (branchId + timestamp), (branchId + status + timestamp), (branchId + method + timestamp).
  - Firestore rules: transactions read/write only if `canAccessBranch(resource.data.branchId)`; super admin bypass; branchId immutable.
- Deliveries:
  - Verify deliveries docs have `branchId`; backfill if missing. Add indexes for branchId + status/date if needed. Ensure pending/today counts are branch-filtered.
  - Firestore rules: deliveries read/write only if `canAccessBranch(resource.data.branchId)`; super admin bypass.
- Pricing:
  - Firestore rules: writes admin-only (`isSuperAdmin()`), branchId immutable; reads for staff.

## 4) Customer Portal Hardening
- Implement any remaining items from `docs/CUSTOMER_PORTAL_IMPROVEMENTS.md`:
  - Order detail: timeline (OrderTrackingTimeline), branch/contact info, delivery/pickup details, ready banner, payment/receipt stubs, unauthorized handling.
  - Dashboard: active orders with status/ETA/branch, QuickActions wired (pickup request stub, contact support, track orders), banners/toasts for key statuses.
  - Orders list: filters (status/date), status badges, search; optional reorder.
  - Profile/Addresses: personal info, addresses, preferences with validation and toasts.
  - Dev mode notice retained for staff in dev; production guard to block non-customers.

## 5) Live Tracking (Customer View)
- Driver writes location to a Firestore doc per delivery (lat, lng, heading?, speed?, lastUpdatedAt), throttled ~10–15s.
- Rules: driver can write only their delivery; customer can read only deliveries containing their order.
- Order detail (`/portal/orders/[orderId]`): when `out_for_delivery`, subscribe to location doc; render Google Maps with driver + customer markers, optional route polyline; ETA via Distance Matrix; fallback when stale (“location unavailable”); show driver name/phone.

## 6) Security & Privacy
- Portal: production guard for customers; dev-mode notice for staff in development only.
- No client writes to pricing/transactions/notifications; enforce via rules.
- Ensure branch scoping everywhere (rules + queries + server checks). Keep branchId immutable on updates.
- Stop showing location after delivery completion; do not expose other customers’ data.

## 7) Testing & Verification
- Build: `npm run build` passes (React Email issue resolved); TS/lint passing.
- Notifications: WATI + Resend send on create/ready/delivered; `/api/test/wati` works; notifications logged.
- Data: transaction branchId backfill done; deliveries branchId verified; indexes deployed.
- Portal: customer E2E has no dead ends (dashboard/orders/detail/profile/addresses), stubs don’t crash; dev-mode notice visible to staff in dev; production blocks staff.
- Live tracking: simulate driver updates → map/ETA updates; stale fallback works; rules block unauthorized reads/writes.
- Rules: pricing admin-only writes; transactions/deliveries branch-scoped; branchId immutable.

## Deliverables
- Code changes implementing above (build fix, notifications wiring, data backfills/indexes, portal/livetracking updates, rules).
- Updated docs: note the build fix and email rendering change in `docs/SHIP_READINESS_AND_EMAIL_SENDERS_COMPLETE.md` (or add a short section).
- Brief report: what changed, tests run (or blocked), and any remaining risks.
