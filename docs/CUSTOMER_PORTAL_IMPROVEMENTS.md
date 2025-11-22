# Customer Portal Improvements Plan (/customer-login → /portal)

Goal: Upgrade the customer-facing portal so customers can log in and manage orders with a polished UI consistent with the current dashboard design (blue gradient/modern cards, responsive layout). This plan is for Claude/code to implement. Keep the existing dev-mode notice for staff testing.

## Scope

- Route: `/portal` (dashboard), `/portal/orders`, `/portal/orders/[orderId]`
- Audience: Customers only (block staff in production)
- Deliverables: UX parity with dashboard styling, richer order tracking, payments/receipts, profile/addresses, quick actions, better empty/error states, and secure access control.

## Design Direction

- Match current dashboard aesthetic (blue gradient, modern cards, consistent typography, spacing, and animations).
- Mobile-first; responsive grids/stacks.
- Clear hierarchy: hero/header, active orders, quick actions, recent/completed, profile/addresses.

## Required Changes

### 1) Access Control

- Add production guard/middleware: only users with `role === 'customer'` may access `/portal` routes; others redirected or denied. Keep the existing dev-mode notice/allowance for staff testing in development.
- Keep Firestore rules: orders readable only when `customerId == auth.uid`.
- Order detail query should be ownership-aware (do not fetch arbitrary order first and then deny).

### 2) Portal Dashboard (/portal)

- Components to wire/enhance:
  - WelcomeHeader: show customer name, last order date, total orders; add branch context for active orders (e.g., “Handled by: <branch>”).
  - ActiveOrders: show status badges, ETA, branch handling, and a CTA to pay/receipt if applicable.
  - QuickActions: real actions (Request Pickup, Contact Support/WhatsApp, View Receipts). Hook to forms or mailto/wa links.
  - RecentActivity: show last few completed orders with status and dates.
- Empty/error states: actionable guidance (e.g., “No orders yet—request a pickup”).
- Loading states: skeletons consistent with dashboard.

### 3) Orders List (/portal/orders)

- Filters: status tabs already exist; add date range and search by order/customer reference.
- Status badges with consistent colors; show last update time.
- Reorder button (if business allows) to duplicate a past order.
- Pagination or “load more” if needed beyond 100.

### 4) Order Detail (/portal/orders/[orderId])

- Ownership-safe data fetch (scoped to current customer).
- Add OrderTrackingTimeline (component exists): show status history with timestamps.
- Show branch handling the order and contact info.
- Delivery/pickup info: addresses, scheduled times, driver info when out_for_delivery.
- Payments:
  - If `paymentStatus !== 'paid'`, show “Pay balance” CTA (hook to payment flow).
  - Show transaction history if available.
- Receipt download if paid.
- Ready banner when status = ready.
- Improve unauthorized/not found messaging with link back to portal.

### 5) Profile & Addresses

- Add a Profile section/page in portal using existing components:
  - PersonalInfoSection: name, email, phone (with edit).
  - AddressesSection + Add/Edit Address modals: manage addresses.
  - PreferencesSection: notification preferences, language.
- Ensure forms validate phone (+254), email, required fields; toasts on success/error.

### 6) Notifications/Comms (lite)

- Add in-app banners/toasts for key statuses (ready, out_for_delivery).
- Optional: surface last notification sent (WhatsApp/SMS) if available.

### 7) UI/UX Polish

- Align styling with dashboard (cards, shadows, padding, typography).
- Mobile nav: ensure navigation between dashboard, orders, profile is reachable (MobileBottomNav exists; ensure it’s used or add).
- Accessibility: labeled inputs, focus management in dialogs, keyboard navigation, sufficient contrast, aria-live for toasts/errors.

### 8) Security & Privacy

- Block staff access in production.
- Ensure no cross-customer data leakage: all queries must include `customerId == uid`.
- Avoid exposing internal IDs beyond order/transaction IDs needed for customers.

## Files to Touch (primary)

- `app/(customer)/portal/page.tsx`
- `app/(customer)/portal/orders/page.tsx`
- `app/(customer)/portal/orders/[orderId]/page.tsx`
- `app/(customer)/portal/layout.tsx` (if adding guards/layout tweaks)
- `components/features/customer/*` (WelcomeHeader, ActiveOrders, OrdersList, OrderDetails, OrderTrackingTimeline, QuickActions, RecentActivity, PersonalInfoSection, AddressesSection, PreferencesSection, MobileBottomNav)
- Auth/guards if needed (middleware/server actions)

## Testing Checklist (manual)

- Customer login → redirected to `/portal`; staff cannot access `/portal`.
- Dashboard shows active orders with correct status/ETA/branch; quick actions work.
- Orders list filters/search work; counts correct; empty state helpful.
- Order detail shows timeline, payment status, receipt (when paid), pay CTA (when pending), branch info; unauthorized access blocked.
- Profile: can update info/addresses/preferences with validation and toasts.
- Mobile: navigation and layouts responsive; dialogs usable.
- Accessibility: keyboard focus, labeled fields, contrast.

## Notes

- Keep branch scoping intact via Firestore rules and client queries.
- If payment flow is not ready, stub the “Pay balance” CTA with a clear TODO/action placeholder.
