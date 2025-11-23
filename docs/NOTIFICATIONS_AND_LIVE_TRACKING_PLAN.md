# Notifications & Live Tracking Implementation Plan

Deliverables for Claude/code: implement outbound notifications (WhatsApp via WATI + email via Resend) for key order events, and add customer-facing live delivery tracking. Keep existing dev-mode notice for staff testing; production should block non-customers from portal.

## Scope
- Events: order received (creation), order ready (pickup/delivery), order delivered/collected (thank you).
- Channels: WhatsApp (WATI) + Email (Resend). Log to `notifications` collection.
- Live tracking: show driver location + ETA to customers when status is `out_for_delivery`.

## Environment & Config
Add to `.env.local` (and functions env if using Cloud Functions):
```
WATI_API_KEY=your_wati_api_key
WATI_API_URL=https://app.wati.io/api/v1
RESEND_API_KEY=your_resend_api_key
```
If staging/prod, add equivalents there.

## WATI Setup
1) In WATI dashboard: create/verify number; get API key/base URL; create and approve templates:
   - `order_received` (vars: customerName, orderId, branchName, summary, pickup/delivery info)
   - `order_ready`
   - `order_delivered` (thank you)
2) Note template variable order; use it in payloads.

## Email (Resend) Setup
- Use existing services/email (`services/email.ts`, `lib/resend.ts`) and templates: `emails/order-confirmation.tsx`, `emails/order-status-update.tsx`, `emails/receipt.tsx`.

## Backend Implementation
- Use/extend existing WATI utilities:
  - `services/wati.ts` (frontend) for tests.
  - `functions/src/utils/whatsapp.ts` for server-side sends.
  - `functions/src/triggers/notifications.ts` (or order status trigger) to send on events.
- Add/confirm notification trigger logic:
  - On order creation: send WhatsApp `order_received` + Resend order confirmation email.
  - On status change to `ready`: send WhatsApp `order_ready` + Resend status update email.
  - On status change to `delivered`/`collected`: send WhatsApp thank-you + Resend status/receipt email (if receipt URL available).
- Log each send attempt to `notifications` collection (fields: type, recipient, phone/email, status pending/sent/failed, timestamp, orderId).
- Keep client writes to notifications disabled; use server/Cloud Functions only.

## Frontend Test Endpoint
- `/api/test/wati` exists: use to validate WATI creds/templates with a test number in dev.

## Live Tracking (Customer View)
- Data model: one Firestore doc per delivery with location updates (e.g., `deliveries/{deliveryId}/location` or `driverLocations/{deliveryId}`):
  - `{ deliveryId, driverId, lat, lng, heading?, speed?, lastUpdatedAt }`
- Driver app/client: send location updates every ~10–15 seconds; throttle to avoid quota overages.
- Firestore rules: only the assigned driver can write their delivery location; customers can read only if they own an order in that delivery.
- Portal integration (`/portal/orders/[orderId]`):
  - When status is `out_for_delivery`, subscribe via onSnapshot to the delivery/location doc.
  - Render Google Maps with driver marker + customer destination; optional route polyline using Directions API.
  - Compute ETA/distance via Distance Matrix on latest position; refresh on updates.
  - Fallback banner if no updates for N minutes: “Driver location unavailable.”
  - Show driver name/phone; allow call/WhatsApp contact.

## Frontend (Portal) Hooks
- Order detail: add timeline (OrderTrackingTimeline), live tracking map when `out_for_delivery`, receipt/pay CTA handling remains per customer portal plan.
- Quick actions: keep stubs where payment/receipt not implemented; ensure no blocking errors.

## Security
- Portal: production guard for customers only; keep dev-mode notice for staff in development.
- Firestore rules: ensure transactions, pricing, deliveries, and notifications are write-protected; customers can only read their data.
- Stop location display after delivery completion; don’t expose other customers’ data.

## Testing Checklist
- WhatsApp: `/api/test/wati` → receives message on test number.
- Order lifecycle (dev/staging):
  - Create order → receives WhatsApp + email confirmation; notification logged.
  - Mark ready → receives ready WhatsApp + email.
  - Mark delivered → receives thank-you WhatsApp + email (receipt link if available).
- Live tracking:
  - Simulate driver location updates → map updates, ETA updates; fallback message when stale.
- Rules: driver cannot write to other deliveries; customer cannot read other deliveries; notifications writable only by backend.

## References (existing code/docs)
- WATI: `docs/WATI_SETUP.md`, `docs/WATI_INTEGRATION_EXAMPLES.md`, `services/wati.ts`, `functions/src/utils/whatsapp.ts`, `functions/src/triggers/notifications.ts`, `app/api/test/wati/route.ts`
- Resend: `services/email.ts`, `lib/resend.ts`, `emails/*.tsx`
- Branch lookup: `lib/utils/branch-lookup.ts`
- Customer portal plan: `docs/CUSTOMER_PORTAL_IMPROVEMENTS.md`
