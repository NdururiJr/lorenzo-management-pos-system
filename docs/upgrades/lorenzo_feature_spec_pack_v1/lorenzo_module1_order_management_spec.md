# Module 1 -- Order Management Feature Spec

**Document ID:** SPEC-M1-ORDER-MGMT
**Module:** Order Management
**Version:** 1.0.0
**Status:** Draft
**Author:** Claude Opus 4.6 / AI Agents Plus
**Created:** 2026-02-12
**Last Updated:** 2026-02-12
**Maturity:** Most Mature -- Extensively Built

---

## Table of Contents

1. [Document Metadata](#1-document-metadata)
2. [Executive Summary](#2-executive-summary)
3. [Existing Foundation](#3-existing-foundation)
4. [Requirements](#4-requirements)
5. [Data Model](#5-data-model)
6. [State Machine](#6-state-machine)
7. [API Specification](#7-api-specification)
8. [UI Specification](#8-ui-specification)
9. [Dashboard & Reporting Outputs](#9-dashboard--reporting-outputs)
10. [Notification & Messaging Flows](#10-notification--messaging-flows)
11. [Audit & Compliance](#11-audit--compliance)
12. [Customer Portal Impact](#12-customer-portal-impact)
13. [Branch Scoping](#13-branch-scoping)
14. [Business Logic](#14-business-logic)
15. [Integration Points](#15-integration-points)
16. [Security & Permissions](#16-security--permissions)
17. [Error Handling & Edge Cases](#17-error-handling--edge-cases)
18. [Data Migration](#18-data-migration)
19. [Testing Strategy](#19-testing-strategy)
20. [Implementation Sequence](#20-implementation-sequence)
21. [Open Questions & Risks](#21-open-questions--risks)
22. [Appendix A: Full Field Catalog](#appendix-a-full-field-catalog)
23. [Appendix B: Notification Templates](#appendix-b-notification-templates)
24. [Appendix C: State Transition Matrix](#appendix-c-state-transition-matrix)

---

## 1. Document Metadata

| Field | Value |
|---|---|
| Module Number | 1 |
| Module Name | Order Management |
| Parent System | Lorenzo Dry Cleaners Management System |
| Dependencies | Module 2 (Payments), Module 3 (Notifications), Module 5 (Delivery & Logistics) |
| Upstream Inputs | Customer creation, branch configuration, service/pricing catalog |
| Downstream Outputs | Payment transactions, notifications, delivery assignments, audit logs, receipts, reports |
| Primary Firestore Collections | `orders`, `transactions`, `notifications`, `auditLogs`, `receipts`, `pricing`, `pricingRules`, `processingBatches`, `transferBatches`, `redoItems`, `defectNotifications`, `qcHandovers`, `quotations`, `branchStats` |
| Primary Source Files | `lib/db/schema.ts`, `lib/db/orders.ts`, `lib/pipeline/status-manager.ts`, `lib/db/audit-logs.ts`, `services/wati.ts`, `app/actions/notifications.ts` |
| Frontend Component Directories | `components/features/pos/`, `components/features/pipeline/`, `components/features/workstation/` |
| API Route Directories | `app/api/orders/`, `app/api/webhooks/` |

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | 2026-02-12 | Claude Opus 4.6 | Initial comprehensive specification |

---

## 2. Executive Summary

Order Management is the most mature and extensively built module in the Lorenzo Dry Cleaners system. It governs the complete order lifecycle from the moment a customer's garments are received at any branch through processing, quality checking, and final delivery or collection. The module encompasses:

- **Order Creation** at the Point of Sale (POS) with mandatory brand tracking, inspector assignment, garment inspection, and service selection
- **12-State Pipeline** governing order progression through received, inspection, queued, washing, drying, ironing, quality_check, packaging, queued_for_delivery, out_for_delivery, delivered, and collected states
- **Cashless Payment Processing** supporting M-Pesa (78% of transactions), Card (15%), and Credit/Store Credit (7%) -- no cash handling
- **Real-Time Pipeline Board** with Kanban-style visualization, drag-and-drop status updates, and live statistics
- **Satellite-to-Main-Store Transfers** with batch management, driver assignment, and cross-branch tracking
- **Workstation Processing** with stage-specific interfaces for each processing step (inspection, washing, drying, ironing, quality check, packaging)
- **Rewash/Redo System** allowing zero-cost reprocessing within a 24-hour eligibility window
- **Automated Notifications** via WhatsApp (Wati.io) and Email (Resend) at key lifecycle milestones
- **Audit Logging** for all order mutations with before/after snapshots
- **Load-Based Pricing** with customer segmentation (regular, VIP, corporate) and flexible per-item/per-kg/hybrid rules
- **PDF/Excel Export** for payment reports and transaction history
- **Receipt Generation** with QR codes, compliance notices, and reprint capability

The module is fully implemented with 919 lines of order database operations (`lib/db/orders.ts`), a 246-line status management engine (`lib/pipeline/status-manager.ts`), 403 lines of audit logging (`lib/db/audit-logs.ts`), and 732 lines of WhatsApp integration (`services/wati.ts`). The frontend spans 20 POS components, 7 pipeline components, and 14 workstation components.

---

## 3. Existing Foundation

This section catalogs every file in the codebase that implements, supports, or is consumed by Order Management. All paths are absolute from the project root `c:\POS\`.

### 3.1 Core Data Layer

| File | Lines | Purpose |
|---|---|---|
| `lib/db/schema.ts` | ~1700+ | All TypeScript interfaces including `Order` (lines 442-612), `OrderExtended` (lines 1121-1130), `Garment` (lines 330-426), `OrderStatus` (lines 243-255), `PaymentMethod` (line 266), `PaymentStatus` (line 260), `PaymentType` (line 271), `StatusHistoryEntry` (lines 1109-1116), `Transaction` (lines 833-858), `Notification` (lines 885-904), `Receipt` (lines 1281-1314), `AuditLog` (lines 1545-1577), `TransferBatch` (lines 1327-1350), `ProcessingBatch` (lines 1368-1391), `Pricing` (lines 951-977), `PricingRule` (lines 999-1030) |
| `lib/db/orders.ts` | 919 | Complete order CRUD module: `generateOrderId()` (line 41), `generateGarmentId()` (line 80), `calculateEstimatedCompletion()` (line 90), `createOrder()` (line 120), `getOrder()` (line 228), `getOrderByIdForCustomer()` (line 243), `updateOrderStatus()` (line 265), `updateOrderPayment()` (line 345), `getOrdersByCustomer()` (line 371), `getOrdersByBranch()` (line 386), `getOrdersByBranchAndStatus()` (line 401), `getOrdersByStatus()` (line 418), `getAllOrders()` (line 433), `getOrdersByPaymentStatus()` (line 444), `searchOrdersByOrderId()` (line 465), `assignDriverToOrder()` (line 498), `updateGarmentStatus()` (line 512), `deleteOrder()` (line 532), `getTodayOrdersCount()` (line 539), `getPipelineStats()` (line 556), `markPickupCompleted()` (line 600), `markDeliveryCompleted()` (line 616), `assignPickupDriver()` (line 648), `assignDeliveryDriver()` (line 665), `getOrdersForBranches()` (line 683), `getTodayOrdersCountForBranches()` (line 731), `getCompletedTodayCountForBranches()` (line 781), `getPendingOrdersCountForBranches()` (line 834), `getTodayRevenueForBranches()` (line 877) |
| `lib/db/index.ts` | -- | Generic Firestore CRUD wrappers: `getDocument()`, `getDocuments()`, `setDocument()`, `updateDocument()`, `deleteDocument()`, `DatabaseError` class |
| `lib/db/customers.ts` | -- | Customer CRUD with `getCustomer()`, `incrementCustomerStats()` called during order creation |
| `lib/db/audit-logs.ts` | 403 | Audit logging: `createAuditLog()` (line 54), `logOrderCreated()` (line 100), `logOrderUpdated()` (line 125), `logInventoryTransfer()` (line 152), `logRoleChange()` (line 183), `logBranchAccessChange()` (line 212), `logCrossBranchAction()` (line 241), `getAuditLogsByResource()` (line 273), `getAuditLogsByBranch()` (line 301), `getAuditLogsByUser()` (line 333), `getRecentAuditLogs()` (line 359), `getCrossBranchAuditLogs()` (line 387) |
| `lib/db/gm-dashboard.ts` | -- | GM dashboard Firestore queries for branch stats and revenue |

### 3.2 Pipeline & Status Engine

| File | Lines | Purpose |
|---|---|---|
| `lib/pipeline/status-manager.ts` | 246 | 12-state machine: `VALID_TRANSITIONS` constant (line 16), `canTransitionTo()` (line 38), `getValidNextStatuses()` (line 51), `getStatusConfig()` (line 61), `requiresNotification()` (line 193), `getAllStatuses()` (line 204), `isTerminalStatus()` (line 227), `getStatusGroup()` (line 238) |

### 3.3 Notification Layer

| File | Lines | Purpose |
|---|---|---|
| `services/wati.ts` | 732 | WhatsApp via Wati.io: `formatPhoneNumber()` (line 69), `isValidKenyanPhoneNumber()` (line 95), `sendWhatsAppMessage()` (line 179) with 3x retry + exponential backoff (1s, 2s, 4s), `sendOrderConfirmation()`, `sendOrderReady()`, `sendDriverDispatched()`, `sendDriverNearby()`, `sendDelivered()`, `sendPaymentReminder()` |
| `app/actions/notifications.ts` | 267 | Server Actions (marked `'use server'`): `triggerOrderNotification()` (line 50), `notifyOrderCreated()` (line 108), `notifyOrderReady()` (line 130), `notifyOrderDelivered()` (line 152), `notifyOrderCollected()` (line 174), `notifyDriverTransferAssigned()` (line 214) |
| `app/api/webhooks/order-notifications/route.ts` | 202 | Webhook handler dispatching email + WhatsApp for events: `order.created`, `order.ready`, `order.delivered`, `order.collected` |
| `lib/notifications/trigger.ts` | 183 | DEPRECATED -- kept for reference; replaced by `app/actions/notifications.ts` |

### 3.4 Report & Export Layer

| File | Lines | Purpose |
|---|---|---|
| `lib/reports/export-pdf.ts` | 297 | PDF export via jsPDF: `exportTransactionsToPDF()` (line 107), `exportPaymentReportPDF()` (line 280). Generates summary + table with alternating rows, page numbers, branch/date headers |
| `lib/reports/export-excel.ts` | 202 | Excel export via XLSX: `exportTransactionsToExcel()` (line 101), `exportPaymentReport()` (line 187). Creates Transactions + Summary worksheets with auto-sized columns |

### 3.5 Real-Time Hooks

| File | Lines | Purpose |
|---|---|---|
| `hooks/useRealTimeGMDashboard.ts` | 410 | Firestore `onSnapshot` subscriptions: `useRealTimeGMDashboard()`, `useRealTimeOrderCount()`, `useRealTimeRevenue()`, `useRealTimeLiveOrders()` |
| `hooks/usePipelineFilters.ts` | 207 | Pipeline filtering logic: branch, dateRange, customer, staff, search, statusGroup |

### 3.6 POS Frontend Components (20 files)

Directory: `components/features/pos/`

| Component | Purpose |
|---|---|
| `POSHeader.tsx` | Top navigation bar with branch selector, user info, order count |
| `CustomerSearch.tsx` | Customer lookup by phone/name for order creation |
| `CustomerSearchModal.tsx` | Modal overlay for customer search with keyboard shortcuts |
| `CustomerCard.tsx` | Displays selected customer details (name, phone, segment, credit balance) |
| `CreateCustomerModal.tsx` | New customer registration form with phone validation |
| `ServiceCategoryTabs.tsx` | Tab navigation between service categories (Laundry, Dry Clean, etc.) |
| `ServiceGrid.tsx` | Grid of available services for selected category |
| `ServiceCard.tsx` | Individual service card with pricing display |
| `GarmentEntryForm.tsx` | Garment detail entry: type, color, brand (mandatory), category (Adult/Children), services, special instructions |
| `GarmentCard.tsx` | Displays a garment already added to the order |
| `GarmentInitialInspection.tsx` | Stage 1 inspection: notable damage detection, photos, notes |
| `CartItemChip.tsx` | Compact garment chip in the order summary sidebar |
| `OrderSummary.tsx` | Inline order summary with subtotal, surcharge, total |
| `OrderSummaryPanel.tsx` | Full sidebar panel with garment list, pricing breakdown, action buttons |
| `OrderOptionsModal.tsx` | Order options: service type (Normal/Express), collection method, return method, delivery address, special instructions |
| `PaymentModal.tsx` | Payment processing: M-Pesa, Card, Credit. Amount entry, partial/full/advance payment |
| `PaymentStatus.tsx` | Visual payment status badge (pending, partial, paid, overpaid) |
| `POSBottomBar.tsx` | Fixed bottom bar with garment count, total, and submit button |
| `ReceiptPreview.tsx` | Draggable/resizable receipt modal with QR code, "CLEANED AT OWNER'S RISK" notice, T&C link, print/download |
| `index.ts` | Barrel export for all POS components |

### 3.7 Pipeline Frontend Components (7 files)

Directory: `components/features/pipeline/`

| Component | Purpose |
|---|---|
| `PipelineBoard.tsx` | Kanban-style board with columns per status |
| `PipelineColumn.tsx` | Individual status column with order cards |
| `PipelineHeader.tsx` | Pipeline header with filter controls, search, branch selector |
| `PipelineStats.tsx` | Real-time statistics bar showing counts per status |
| `OrderCard.tsx` | Compact order card with customer name, garment count, elapsed time |
| `OrderDetailsModal.tsx` | Full order detail view with status history, garments, payments, actions |
| `index.ts` | Barrel export |

### 3.8 Workstation Frontend Components (14 files)

Directory: `components/features/workstation/`

| Component | Purpose |
|---|---|
| `WorkstationOverview.tsx` | Dashboard for workstation managers: queue counts, active processes, staff assignments |
| `InspectionQueue.tsx` | Queue of orders awaiting detailed Stage 2 inspection |
| `QueueManagement.tsx` | Drag-and-drop queue prioritization |
| `ActiveProcesses.tsx` | Currently active washing/drying/ironing batches |
| `StaffAssignment.tsx` | Assign staff to workstation stages |
| `StaffPerformance.tsx` | Per-staff metrics: orders processed, avg time, quality rate |
| `MajorIssuesReviewModal.tsx` | Manager approval workflow for garments with major issues |
| `RoutingMetrics.tsx` | Order routing statistics across branches |
| `WorkstationAnalytics.tsx` | Processing time analysis, bottleneck identification |
| `WashingStation.tsx` | Stage-specific interface for washing |
| `DryingStation.tsx` | Stage-specific interface for drying |
| `IroningStation.tsx` | Stage-specific interface for ironing |
| `QualityCheckStation.tsx` | Stage-specific interface for quality checks with pass/fail/rewash |
| `PackagingStation.tsx` | Stage-specific interface for packaging |

### 3.9 API Routes

| Route | Method | Purpose |
|---|---|---|
| `app/api/orders/[orderId]/payments/route.ts` | GET | Returns payment transaction history for a specific order |
| `app/api/webhooks/order-notifications/route.ts` | POST | Webhook handler for order lifecycle notifications |
| `app/api/orders/route.ts` | GET, POST | List orders with filters; create new order |
| `app/api/orders/[orderId]/route.ts` | GET, PUT, DELETE | Get, update, or cancel a specific order |
| `app/api/orders/[orderId]/status/route.ts` | PUT | Update order pipeline status |
| `app/api/rewash/route.ts` | POST | Create rewash request linked to original order |
| `app/api/pricing/route.ts` | GET | Fetch pricing catalog for branch |

### 3.10 Page-Level Components

| File | Purpose |
|---|---|
| `app/(dashboard)/pos/page.tsx` | POS page: orchestrates all POS components, manages order state |
| `app/(dashboard)/pipeline/page.tsx` | Pipeline board page |
| `app/(dashboard)/workstation/page.tsx` | Workstation management page |

---

## 4. Requirements

This section defines all functional requirements for Order Management. Each requirement has a unique ID, description, acceptance criteria, priority, and traceability to implementation files.

### 4.1 Order Creation Requirements

#### FR-M1-001: Order ID Generation

**Priority:** P0 (Critical)
**Implementation:** `lib/db/orders.ts`, function `generateOrderId()` (line 41)

The system SHALL generate unique order IDs in the format `ORD-[BRANCH]-[YYYYMMDD]-[####]` where:
- `[BRANCH]` is the branch identifier (e.g., "MAIN", "KIL")
- `[YYYYMMDD]` is the current date
- `[####]` is a zero-padded daily sequence number starting at 0001

**Acceptance Criteria:**
1. Order IDs are unique across the entire system
2. Sequence resets daily per branch
3. Sequence is determined by querying the last order created today for the branch
4. Format is consistent: `ORD-MAIN-20260212-0001`

#### FR-M1-002: Garment ID Generation

**Priority:** P0 (Critical)
**Implementation:** `lib/db/orders.ts`, function `generateGarmentId()` (line 80)

The system SHALL generate garment IDs in the format `[ORDER-ID]-G[##]` where `[##]` is a zero-padded index within the order (01, 02, ...).

**Acceptance Criteria:**
1. Each garment within an order has a unique ID
2. IDs are sequential within the order
3. Format example: `ORD-MAIN-20260212-0001-G01`

#### FR-M1-003: Mandatory Brand Field

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, `Garment` interface (line 338)

Every garment MUST have a `brand` field (type `string`). When the brand is unknown, the user selects a "No Brand" checkbox which sets `brand` to `"No Brand"` and `noBrand` to `true` (line 340).

**Acceptance Criteria:**
1. Brand field is mandatory -- order cannot be submitted without it
2. "No Brand" checkbox is available and sets appropriate values
3. Brand field is displayed on garment cards, receipts, and tags

#### FR-M1-004: Mandatory Inspector (Checked By)

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, `Order` interface, field `checkedBy` (line 482)

Every order MUST have a `checkedBy` field (staff UID) identifying the inspector who performed the initial check at reception. The denormalized name is stored in `checkedByName` (line 484).

**Acceptance Criteria:**
1. Order creation form requires selection of an inspector
2. Inspector name appears on receipts and order details
3. Inspector data is captured before order submission

#### FR-M1-005: Garment Category Tracking (Adult/Children)

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, type `GarmentCategory` (line 325), `Garment.category` field (line 354)

Every garment MUST specify a category of either `'Adult'` or `'Children'`.

**Acceptance Criteria:**
1. Category selector is present in the garment entry form
2. Category is stored per garment, not per order
3. Reports can filter/group by category

#### FR-M1-006: Service Type Selection (Normal/Express)

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, type `ServiceType` (line 431), `Order.serviceType` field (line 486)

Each order MUST specify a service type: `'Normal'` or `'Express'`. Express service incurs a surcharge stored in `Order.expressSurcharge` (line 462) added to the subtotal (`Order.subtotal`, line 460).

**Acceptance Criteria:**
1. Service type toggle is present in order options
2. Express surcharge is calculated and displayed in real time
3. Total amount reflects subtotal + express surcharge
4. Service type is displayed on receipts and pipeline cards

#### FR-M1-007: Collection Method

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, `Order.collectionMethod` field (line 510)

Each order MUST specify how garments are collected: `'dropped_off'` (customer brings them) or `'pickup_required'` (staff picks up from customer location). When pickup is required, additional fields are populated:
- `pickupAddress` (line 512): `Address` object
- `pickupInstructions` (line 514): text
- `pickupScheduledTime` (line 516): `Timestamp`
- `pickupAssignedTo` (line 520): staff UID

**Acceptance Criteria:**
1. Collection method is selected during order creation
2. Pickup fields are shown only when `pickup_required` is selected
3. Pickup address is validated and stored with coordinates

#### FR-M1-008: Return Method

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, `Order.returnMethod` field (line 524)

Each order MUST specify how garments are returned: `'customer_collects'` or `'delivery_required'`. When delivery is required:
- `deliveryAddress` (line 526): `Address` object
- `deliveryInstructions` (line 528): text
- `deliveryScheduledTime` (line 530): `Timestamp`
- `deliveryAssignedTo` (line 534): staff UID

**Acceptance Criteria:**
1. Return method is selected during order creation
2. Delivery fields are shown only when `delivery_required` is selected
3. Delivery classification is auto-computed (see FR-M1-009)

#### FR-M1-009: Delivery Classification

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, type `DeliveryClassification` (line 436), fields `deliveryClassification` (line 488), `classificationBasis` (line 490), `classificationOverrideBy` (line 492)

Orders requiring delivery are automatically classified as `'Small'` (Motorcycle) or `'Bulk'` (Van) based on garment count, weight, or value. Managers can manually override with the `classificationOverrideBy` field recording who overrode.

**Acceptance Criteria:**
1. Classification is computed automatically at order creation
2. Configurable thresholds (e.g., <=5 garments = Small)
3. Manager override is logged in audit trail
4. Classification basis is stored for reporting

#### FR-M1-010: Estimated Completion Time

**Priority:** P1 (Important)
**Implementation:** `lib/db/orders.ts`, function `calculateEstimatedCompletion()` (line 90)

The system SHALL estimate order completion time based on garment count and service type:
- Base: 48 hours
- 10+ garments: +24 hours
- 20+ garments: +48 hours
- Express: halved (e.g., 48h becomes 24h)

The estimate is stored in `Order.estimatedCompletion` (schema line 472).

**Acceptance Criteria:**
1. Estimated completion is computed during order creation
2. Express orders get halved estimates
3. Actual completion is recorded when order reaches terminal state (`Order.actualCompletion`, schema line 474)

#### FR-M1-011: Initial Garment Inspection (Stage 1)

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, `Garment` fields (lines 361-366)

At the POS during order creation, the inspector performs Stage 1 inspection for each garment:
- `hasNotableDamage` (line 362): boolean flag
- `initialInspectionNotes` (line 364): free-text notes
- `initialInspectionPhotos` (line 366): array of photo URLs

**Acceptance Criteria:**
1. Inspection form is presented for each garment during entry
2. Photos can be captured or uploaded
3. Damage flag triggers visual indicator on garment cards
4. Inspection data is preserved for dispute resolution

#### FR-M1-012: Customer Denormalization

**Priority:** P1 (Important)
**Implementation:** `lib/db/orders.ts`, `createOrder()` function (line 120), specifically lines 163-167

When an order is created, customer name and phone are denormalized onto the order document for quick display:
- `Order.customerName` (schema line 448)
- `Order.customerPhone` (schema line 450)

This avoids join queries in Firestore when displaying order lists.

**Acceptance Criteria:**
1. Customer name and phone are copied at order creation
2. Order list views use denormalized fields (no extra queries)

### 4.2 Order Status & Pipeline Requirements

#### FR-M1-013: 12-State Pipeline

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, type `OrderStatus` (lines 243-255); `lib/pipeline/status-manager.ts`, constant `VALID_TRANSITIONS` (line 16)

The system SHALL enforce a 12-state order pipeline:

```
received -> inspection -> queued -> washing -> drying -> ironing ->
quality_check -> packaging -> queued_for_delivery -> out_for_delivery -> delivered | collected
```

Note: `quality_check` can transition back to `washing` if QA fails. Terminal states are `delivered` and `collected`.

**Acceptance Criteria:**
1. Only valid transitions are permitted
2. Invalid transition attempts are rejected with clear error message
3. Quality check allows rework (back to washing)
4. Terminal states allow no further transitions

#### FR-M1-014: Status Transition Validation

**Priority:** P0 (Critical)
**Implementation:** `lib/pipeline/status-manager.ts`, function `canTransitionTo()` (line 38)

Before any status change, the system SHALL validate the transition against the `VALID_TRANSITIONS` map. The function returns `boolean` indicating whether the transition is permitted.

**Acceptance Criteria:**
1. `canTransitionTo('received', 'inspection')` returns `true`
2. `canTransitionTo('received', 'washing')` returns `false`
3. All UI status update controls use this validation

#### FR-M1-015: Status History Tracking

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, interface `StatusHistoryEntry` (lines 1109-1116); `lib/db/orders.ts`, `updateOrderStatus()` (line 265)

Every status change MUST be appended to the `statusHistory` array on the order document. Each entry contains:
- `status`: the new `OrderStatus`
- `timestamp`: `Timestamp` of the change
- `updatedBy`: UID of the user who made the change

**Acceptance Criteria:**
1. Status history is immutable (append-only)
2. Full audit trail is visible in order details
3. Time spent in each status can be calculated from history

#### FR-M1-016: Status Configuration

**Priority:** P1 (Important)
**Implementation:** `lib/pipeline/status-manager.ts`, function `getStatusConfig()` (line 61)

Each status has display configuration including:
- `label`: human-readable name
- `color`, `bgColor`, `textColor`, `borderColor`: Tailwind CSS classes
- `description`: brief description of the stage
- `requiresNotification`: boolean flag for auto-notification

Example: `queued_for_delivery` has label "Ready", color "green", and `requiresNotification: true`.

**Acceptance Criteria:**
1. Pipeline board uses config colors for column headers
2. Order cards display colored status badges
3. Notification-required statuses trigger WhatsApp/email automatically

#### FR-M1-017: Status Groups

**Priority:** P2 (Nice to Have)
**Implementation:** `lib/pipeline/status-manager.ts`, function `getStatusGroup()` (line 238)

Statuses are grouped for filtering purposes:
- **Pending:** received, inspection, queued
- **Processing:** washing, drying, ironing, quality_check, packaging
- **Ready:** queued_for_delivery, out_for_delivery
- **Completed:** delivered, collected

**Acceptance Criteria:**
1. Pipeline filters support group-based filtering
2. Dashboard statistics aggregate by group

#### FR-M1-018: Terminal State Detection

**Priority:** P0 (Critical)
**Implementation:** `lib/pipeline/status-manager.ts`, function `isTerminalStatus()` (line 227)

`delivered` and `collected` are terminal states with empty transition arrays. When an order reaches a terminal state, `Order.actualCompletion` is set to `Timestamp.now()`.

**Acceptance Criteria:**
1. Terminal orders show no "next status" button
2. `actualCompletion` is set exactly once
3. Terminal orders are excluded from active pipeline counts

### 4.3 Payment Requirements

#### FR-M1-019: Cashless Payment System

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, type `PaymentMethod` (line 266)

The system operates as cashless. Supported payment methods:
- `'mpesa'` -- M-Pesa mobile money (78% of transactions)
- `'card'` -- Credit/debit card via Pesapal
- `'credit'` -- In-house credit/financing
- `'customer_credit'` -- Store credit balance

**Acceptance Criteria:**
1. No cash payment option exists in the UI
2. All payment methods integrate with respective gateways
3. Payment method distribution is tracked in reports

#### FR-M1-020: Payment Status Tracking

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, type `PaymentStatus` (line 260); `lib/db/orders.ts`, function `updateOrderPayment()` (line 345)

Payment status is computed from `paidAmount` vs `totalAmount`:
- `'pending'`: paidAmount = 0
- `'partial'`: 0 < paidAmount < totalAmount
- `'paid'`: paidAmount >= totalAmount
- `'overpaid'`: paidAmount > totalAmount

**Acceptance Criteria:**
1. Status updates automatically when payment is recorded
2. Visual indicators differ by status (see `PaymentStatus.tsx`)
3. Payment status is filterable in order lists

#### FR-M1-021: Payment Type Classification

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, type `PaymentType` (line 271)

Each transaction is classified as:
- `'partial'`: partial payment towards balance
- `'full'`: payment that completes the balance
- `'advance'`: payment before order is priced
- `'refund'`: money returned to customer
- `'credit_applied'`: store credit applied to order

**Acceptance Criteria:**
1. Payment type is captured on every transaction
2. Reports can filter by payment type
3. Refunds and credits are tracked separately

#### FR-M1-022: Transaction History per Order

**Priority:** P1 (Important)
**Implementation:** `app/api/orders/[orderId]/payments/route.ts` (81 lines)

The API exposes a GET endpoint returning all `Transaction` documents linked to a given order, enabling full payment history view.

**Acceptance Criteria:**
1. All transactions for an order are retrievable via API
2. Transactions are ordered by timestamp descending
3. Each transaction shows method, amount, type, status, processedBy

### 4.4 Garment Processing Requirements

#### FR-M1-023: Workstation Inspection (Stage 2)

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, `Garment` fields (lines 369-390)

After initial POS inspection, garments undergo detailed workstation inspection:
- `inspectionCompleted` (line 370): boolean
- `inspectionCompletedBy` (line 372): staff UID
- `inspectionCompletedAt` (line 374): Timestamp
- `conditionAssessment` (line 376): `'good' | 'minor_issues' | 'major_issues'`
- `missingButtonsCount` (line 378): number
- `stainDetails` (line 380): `StainDetail[]` with location, type, severity
- `ripDetails` (line 382): `RipDetail[]` with location, size
- `damagePhotos` (line 384): string[]
- `recommendedActions` (line 386): array of `'repair' | 'special_treatment' | 'standard_process' | 'other'`
- `recommendedActionsOther` (line 388): free text (max 200 words)
- `estimatedAdditionalTime` (line 390): hours

**Acceptance Criteria:**
1. Workstation staff can complete detailed inspection form
2. Stain and rip details are captured with location specificity
3. Major issues trigger manager approval workflow
4. Photos are required for major issues

#### FR-M1-024: Stage Handler Tracking

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, `Garment.stageHandlers` field (lines 394-401)

Each garment tracks which staff handled it at each processing stage via `stageHandlers`:
```typescript
stageHandlers?: {
  inspection?: StaffHandler[];
  washing?: StaffHandler[];
  drying?: StaffHandler[];
  ironing?: StaffHandler[];
  quality_check?: StaffHandler[];
  packaging?: StaffHandler[];
}
```

Where `StaffHandler` (line 310) contains `uid`, `name`, and `completedAt`.

**Acceptance Criteria:**
1. Multiple staff can be recorded per stage (batch processing)
2. Stage completion timestamps are captured
3. Staff performance reports use this data

#### FR-M1-025: Stage Duration Tracking

**Priority:** P2 (Nice to Have)
**Implementation:** `lib/db/schema.ts`, `Garment.stageDurations` field (lines 404-411)

Time spent at each stage is tracked in seconds:
```typescript
stageDurations?: {
  inspection?: number;
  washing?: number;
  drying?: number;
  ironing?: number;
  quality_check?: number;
  packaging?: number;
}
```

**Acceptance Criteria:**
1. Durations are computed from status history timestamps
2. Analytics dashboards display average stage durations
3. Bottleneck stages are highlighted

### 4.5 Rewash & Redo Requirements

#### FR-M1-026: Rewash System

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, `Order` fields (lines 494-506)

Orders support rewash within a 24-hour eligibility window:
- `isRewash` (line 496): boolean flag
- `originalOrderId` (line 498): link to parent order
- `rewashRequestedAt` (line 500): Timestamp
- `rewashReason` (line 502): free text
- `hasRewashRequest` (line 504): flag on original order
- `rewashOrderIds` (line 506): array of rewash order IDs on original order

**Acceptance Criteria:**
1. Rewash is only permitted within 24 hours of delivery/collection
2. Rewash creates a new order linked to original
3. Rewash orders are zero-cost to the customer
4. Original order is flagged with `hasRewashRequest = true`
5. Rewash statistics are tracked per staff member

#### FR-M1-027: Redo Order System (FR-002)

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, `Order` fields (lines 586-592)

Redo orders are zero-cost reprocessing orders linked to redo items:
- `isRedo` (line 588): boolean flag
- `parentRedoItemId` (line 590): reference to redo item
- `parentOrderId` (line 592): reference to original order

**Acceptance Criteria:**
1. Redo orders have zero cost
2. Full traceability to original order
3. Quality metrics include redo rates

### 4.6 Batch Processing Requirements

#### FR-M1-028: Transfer Batches (Satellite-to-Main)

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, interface `TransferBatch` (lines 1327-1350)

Satellite stores batch orders for transfer to main stores:
- `batchId` (line 1329): format `TRF-[SATELLITE]-[YYYYMMDD]-[####]`
- `satelliteBranchId` (line 1331): source branch
- `mainStoreBranchId` (line 1333): destination branch
- `orderIds` (line 1335): array of order IDs
- `status` (line 1337): `'pending' | 'in_transit' | 'received'`
- `assignedDriverId` (line 1339): driver UID
- `totalOrders` (line 1347): count

**Acceptance Criteria:**
1. Batches can only be created at satellite stores
2. Driver assignment triggers WhatsApp notification
3. Receipt at main store updates all order statuses
4. Transfer timing is tracked (dispatchedAt, receivedAt)

#### FR-M1-029: Processing Batches

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, interface `ProcessingBatch` (lines 1368-1391)

Orders can be grouped for batch processing through washing/drying stages:
- `batchId` (line 1370): format `PROC-[STAGE]-[YYYYMMDD]-[####]`
- `stage` (line 1372): `'washing' | 'drying' | 'ironing'`
- `orderIds` (line 1374): array of order IDs
- `garmentCount` (line 1376): total garments
- `assignedStaffIds` (line 1378): array of staff UIDs
- `status` (line 1380): `'pending' | 'in_progress' | 'completed'`

**Acceptance Criteria:**
1. Workstation managers can create batches from queued orders
2. All orders in a batch advance together
3. Batch completion updates all constituent orders

### 4.7 Routing Requirements

#### FR-M1-030: Order Routing (FR-006)

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, `Order` fields (lines 560-584)

Orders track their routing through the system:
- `routingStatus` (line 570): `'pending' | 'in_transit' | 'received' | 'assigned' | 'processing' | 'ready_for_return'`
- `processingBranchId` (line 572): branch that will process the order
- `assignedWorkstationStage` (line 574): current workstation stage
- `assignedWorkstationStaffId` (line 576): assigned staff member
- `routedAt` (line 578): when order was routed
- `arrivedAtBranchAt` (line 580): when order arrived at processing branch
- `sortingCompletedAt` (line 582): when sorting was completed (FR-007)
- `earliestDeliveryTime` (line 584): earliest delivery time after sorting window

**Acceptance Criteria:**
1. Satellite orders are auto-routed to their linked main store
2. Main store orders are routed internally to workstations
3. Routing status is visible on order cards
4. Sorting window delays delivery scheduling

### 4.8 Pricing Requirements

#### FR-M1-031: Per-Item Pricing

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, interface `Pricing` (lines 951-977)

Standard per-item pricing is stored per branch and garment type:
- `garmentType` (line 957): e.g., "Shirt", "Dress", "Suit"
- `services.wash` (line 961): wash price
- `services.dryClean` (line 963): dry clean price
- `services.iron` (line 965): iron price
- `services.starch` (line 967): starch price
- `services.express` (line 969): express service price (FREE, no extra cost)

**Acceptance Criteria:**
1. Pricing is branch-specific
2. Service prices are displayed in the POS service grid
3. Prices can be updated by authorized roles

#### FR-M1-032: Load-Based Pricing (FR-015)

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, interface `PricingRule` (lines 999-1030)

Flexible pricing rules support per-item, per-kg, or hybrid calculation:
- `pricingType` (line 1011): `'per_item' | 'per_kg' | 'hybrid'`
- `customerSegment` (line 1009): `'regular' | 'vip' | 'corporate'`
- `basePrice` (line 1013): base price
- `pricePerKg` (line 1015): price per kilogram
- `minWeightKg` / `maxWeightKg` (lines 1017-1019): weight bounds
- `discountPercentage` (line 1021): discount percentage
- `priority` (line 1023): rule matching priority

Garments track weight via `Garment.weightKg` (line 416) and `Garment.weightMeasured` (line 418).

**Acceptance Criteria:**
1. Rules are matched by priority (highest first)
2. Customer segment affects pricing
3. Weight can be measured or estimated
4. Price breakdown is stored on each garment (`Garment.priceBreakdown`, line 420)

#### FR-M1-033: Customer Segmentation for Pricing

**Priority:** P1 (Important)
**Implementation:** `lib/db/schema.ts`, `Customer.segment` field (line 147), `Order.customerSegment` field (line 598)

Customers are segmented as `'regular'`, `'vip'`, or `'corporate'`:
- VIP qualification is tracked via `Customer.vipQualifiedAt` (line 149)
- Corporate customers reference `Customer.corporateAgreementId` (line 151)
- Segment is denormalized onto orders for pricing lookups

**Acceptance Criteria:**
1. Segment affects which pricing rules apply
2. VIP/corporate customers may receive automatic discounts
3. Segment is visible on customer profile and order details

### 4.9 Receipt Requirements

#### FR-M1-034: Receipt Generation

**Priority:** P0 (Critical)
**Implementation:** `lib/db/schema.ts`, interface `Receipt` (lines 1281-1314)

Receipts are generated for each order with:
- `receiptNumber` (line 1285): auto-generated
- `receiptType` (line 1303): `'order' | 'delivery_note' | 'tailor_note'`
- `qrCodeData` (line 1305): QR code linking to order tracking URL
- `termsUrl` (line 1307): URL to Terms & Conditions
- `printedAt` / `printedBy` (lines 1309-1311): print tracking
- `reprintCount` (line 1313): number of reprints

Receipt layout includes "CLEANED AT OWNER'S RISK" notice (implemented in `ReceiptPreview.tsx`).

**Acceptance Criteria:**
1. Receipt is generated immediately after order creation
2. QR code links to customer portal order tracking
3. "CLEANED AT OWNER'S RISK" notice is prominently displayed
4. Reprinting increments the reprint count
5. Receipt can be downloaded as PDF or printed directly

### 4.10 Reporting Requirements

#### FR-M1-035: Pipeline Statistics

**Priority:** P0 (Critical)
**Implementation:** `lib/db/orders.ts`, function `getPipelineStats()` (line 556)

The system SHALL compute pipeline statistics per branch showing counts for each non-terminal status: received, queued, washing, drying, ironing, quality_check, packaging, queued_for_delivery, out_for_delivery, plus total.

**Acceptance Criteria:**
1. Stats update in real-time on the pipeline board
2. Stats are scoped to the selected branch
3. Total excludes terminal states

#### FR-M1-036: Transaction Export (PDF)

**Priority:** P1 (Important)
**Implementation:** `lib/reports/export-pdf.ts` (297 lines)

The `exportTransactionsToPDF()` function (line 107) generates PDF reports with:
- Header: title, generation date, date range, branch name
- Summary section: total, completed, pending, failed transactions; payment method breakdown
- Transaction table: ID, customer, amount, method, status, date
- Footer: page numbers, "Lorenzo Dry Cleaners" branding

**Acceptance Criteria:**
1. PDF includes all selected transactions
2. Summary is optional (controlled by `showSummary` flag)
3. Currency is KES with proper locale formatting
4. Alternating row backgrounds for readability
5. Page breaks are handled automatically

#### FR-M1-037: Transaction Export (Excel)

**Priority:** P1 (Important)
**Implementation:** `lib/reports/export-excel.ts` (202 lines)

The `exportTransactionsToExcel()` function (line 101) generates XLSX files with:
- Transactions worksheet: Transaction ID, Order ID, Customer, Amount, Payment Method, Status, Branch, Pesapal Ref, Processed By, Timestamp
- Summary worksheet (optional): totals, by-status breakdown, by-method breakdown

**Acceptance Criteria:**
1. Column widths are auto-sized
2. Amounts are numeric (not strings)
3. Summary sheet provides aggregated view
4. File downloads with descriptive filename

---

## 5. Data Model

### 5.1 Primary Collection: `orders`

Document ID: `orderId` (e.g., `ORD-MAIN-20260212-0001`)

The `Order` interface is defined at `lib/db/schema.ts` lines 442-612 with the following field groups:

#### Core Identification Fields (lines 443-478)
| Field | Type | Required | Description |
|---|---|---|---|
| `orderId` | `string` | Yes | Unique ID: `ORD-[BRANCH]-[YYYYMMDD]-[####]` |
| `customerId` | `string` | Yes | Customer document reference |
| `customerName` | `string` | No | Denormalized customer name |
| `customerPhone` | `string` | No | Denormalized customer phone |
| `branchId` | `string` | Yes | Originating branch |
| `status` | `OrderStatus` | Yes | Current pipeline status (12 values) |
| `garments` | `Garment[]` | Yes | Array of garment objects |
| `totalAmount` | `number` | Yes | Total order amount in KES |
| `subtotal` | `number` | No | V2.0: Subtotal before express surcharge |
| `expressSurcharge` | `number` | No | V2.0: Express surcharge (0 for normal) |
| `paidAmount` | `number` | Yes | Amount paid so far in KES |
| `paymentStatus` | `PaymentStatus` | Yes | `pending`, `partial`, `paid`, `overpaid` |
| `paymentMethod` | `PaymentMethod` | No | `mpesa`, `card`, `credit`, `customer_credit` |
| `deliveryId` | `string` | No | Reference to delivery document |
| `estimatedCompletion` | `Timestamp` | Yes | Estimated completion date/time |
| `actualCompletion` | `Timestamp` | No | Set when terminal state reached |
| `createdAt` | `Timestamp` | Yes | Order creation timestamp |
| `createdBy` | `string` | Yes | Staff UID who created order |

#### V2.0 Enhancement Fields (lines 480-506)
| Field | Type | Required | Description |
|---|---|---|---|
| `checkedBy` | `string` | Yes | V2.0: Inspector staff UID |
| `checkedByName` | `string` | No | Denormalized inspector name |
| `serviceType` | `ServiceType` | Yes | `Normal` or `Express` |
| `deliveryClassification` | `DeliveryClassification` | No | `Small` (Motorcycle) or `Bulk` (Van) |
| `classificationBasis` | `string` | No | `garment_count`, `weight`, `value`, `manual` |
| `classificationOverrideBy` | `string` | No | UID of manager who overrode classification |
| `isRewash` | `boolean` | No | Whether this is a rewash order |
| `originalOrderId` | `string` | No | Link to original order (rewash) |
| `rewashRequestedAt` | `Timestamp` | No | When rewash was requested |
| `rewashReason` | `string` | No | Reason for rewash |
| `hasRewashRequest` | `boolean` | No | Flag on original order |
| `rewashOrderIds` | `string[]` | No | List of rewash order IDs |

#### Collection & Delivery Fields (lines 508-534)
| Field | Type | Required | Description |
|---|---|---|---|
| `collectionMethod` | `string` | Yes | `dropped_off` or `pickup_required` |
| `pickupAddress` | `Address` | No | Customer pickup address |
| `pickupInstructions` | `string` | No | Pickup instructions |
| `pickupScheduledTime` | `Timestamp` | No | Scheduled pickup time |
| `pickupCompletedTime` | `Timestamp` | No | Actual pickup completion |
| `pickupAssignedTo` | `string` | No | Staff UID for pickup |
| `returnMethod` | `string` | Yes | `customer_collects` or `delivery_required` |
| `deliveryAddress` | `Address` | No | Delivery address |
| `deliveryInstructions` | `string` | No | Delivery instructions |
| `deliveryScheduledTime` | `Timestamp` | No | Scheduled delivery time |
| `deliveryCompletedTime` | `Timestamp` | No | Actual delivery completion |
| `deliveryAssignedTo` | `string` | No | Staff UID for delivery |

#### Satellite Transfer Fields (lines 536-546)
| Field | Type | Required | Description |
|---|---|---|---|
| `originBranchId` | `string` | No | Source satellite branch |
| `destinationBranchId` | `string` | No | Destination main store |
| `transferBatchId` | `string` | No | Transfer batch reference |
| `transferredAt` | `Timestamp` | No | When transferred from satellite |
| `receivedAtMainStoreAt` | `Timestamp` | No | When received at main store |

#### Workstation Fields (lines 548-558)
| Field | Type | Required | Description |
|---|---|---|---|
| `majorIssuesDetected` | `boolean` | No | Major issues found during inspection |
| `majorIssuesReviewedBy` | `string` | No | Manager who reviewed issues |
| `majorIssuesApprovedAt` | `Timestamp` | No | When issues were approved |
| `processingBatchId` | `string` | No | Current processing batch |

#### Routing Fields (lines 560-584)
| Field | Type | Required | Description |
|---|---|---|---|
| `routingStatus` | `RoutingStatus` | No | `pending`, `in_transit`, `received`, `assigned`, `processing`, `ready_for_return` |
| `processingBranchId` | `string` | No | Branch processing the order |
| `assignedWorkstationStage` | `string` | No | Current workstation stage |
| `assignedWorkstationStaffId` | `string` | No | Assigned workstation staff |
| `routedAt` | `Timestamp` | No | When routed to workstation |
| `arrivedAtBranchAt` | `Timestamp` | No | When arrived at processing branch |
| `sortingCompletedAt` | `Timestamp` | No | When sorting was completed |
| `earliestDeliveryTime` | `Timestamp` | No | Earliest delivery time |

#### Redo & Pricing Fields (lines 586-612)
| Field | Type | Required | Description |
|---|---|---|---|
| `isRedo` | `boolean` | No | Whether this is a redo order |
| `parentRedoItemId` | `string` | No | Link to parent redo item |
| `parentOrderId` | `string` | No | Link to original order (redo) |
| `totalWeightKg` | `number` | No | Total weight in kg |
| `customerSegment` | `string` | No | `regular`, `vip`, `corporate` |
| `pricingSummary` | `object` | No | Price breakdown (subtotal, weight, discount, total) |
| `driverId` | `string` | No | DEPRECATED: use `deliveryAssignedTo` |
| `specialInstructions` | `string` | No | Order-level special instructions |

### 5.2 Extended Order: `OrderExtended`

**Implementation:** `lib/db/schema.ts`, lines 1121-1130

Extends `Order` with required denormalized fields and status tracking:
- `customerName: string` (required)
- `customerPhone: string` (required)
- `updatedAt: Timestamp`
- `statusHistory: StatusHistoryEntry[]`

### 5.3 Garment Sub-Document

**Implementation:** `lib/db/schema.ts`, interface `Garment` (lines 330-426)

See Section 4.1 (FR-M1-003 through FR-M1-011) for full field descriptions. Key field count: 30+ fields per garment.

### 5.4 Supporting Collections

| Collection | Interface | Schema Location | Purpose |
|---|---|---|---|
| `transactions` | `Transaction` | Lines 833-858 | Payment records |
| `notifications` | `Notification` | Lines 885-904 | Message tracking |
| `receipts` | `Receipt` | Lines 1281-1314 | Receipt metadata |
| `auditLogs` | `AuditLog` | Lines 1545-1577 | Audit trail |
| `pricing` | `Pricing` | Lines 951-977 | Per-item pricing |
| `pricingRules` | `PricingRule` | Lines 999-1030 | Load-based pricing rules |
| `transferBatches` | `TransferBatch` | Lines 1327-1350 | Satellite-to-main transfers |
| `processingBatches` | `ProcessingBatch` | Lines 1368-1391 | Workstation batch processing |

### 5.5 Firestore Indexes Required

The following composite indexes are required for the queries in `lib/db/orders.ts`:

| Collection | Fields | Direction | Used By |
|---|---|---|---|
| `orders` | `branchId`, `createdAt` | ASC, DESC | `getOrdersByBranch()`, `generateOrderId()` |
| `orders` | `branchId`, `status`, `createdAt` | ASC, ASC, DESC | `getOrdersByBranchAndStatus()` |
| `orders` | `customerId`, `createdAt` | ASC, DESC | `getOrdersByCustomer()` |
| `orders` | `paymentStatus`, `createdAt` | ASC, DESC | `getOrdersByPaymentStatus()` |
| `orders` | `status`, `createdAt` | ASC, DESC | `getOrdersByStatus()` |
| `orders` | `branchId`, `actualCompletion`, `status` | ASC, ASC, ASC | `getCompletedTodayCountForBranches()` |
| `auditLogs` | `resourceType`, `resourceId`, `timestamp` | ASC, ASC, DESC | `getAuditLogsByResource()` |
| `auditLogs` | `branchId`, `action`, `timestamp` | ASC, ASC, DESC | `getAuditLogsByBranch()` |
| `auditLogs` | `performedBy`, `timestamp` | ASC, DESC | `getAuditLogsByUser()` |

---

## 6. State Machine

### 6.1 State Diagram

```
                                    +---------- [REWORK] ----------+
                                    |                               |
                                    v                               |
[received] --> [inspection] --> [queued] --> [washing] --> [drying] --> [ironing]
                                                                        |
                                                                        v
                                                              [quality_check]
                                                                   |
                                                     +-------------+
                                                     |
                                                     v
                                               [packaging]
                                                     |
                                                     v
                                          [queued_for_delivery]
                                              /              \
                                             v                v
                                  [out_for_delivery]     [collected] (TERMINAL)
                                         |
                                         v
                                    [delivered] (TERMINAL)
```

### 6.2 Transition Table

**Source:** `lib/pipeline/status-manager.ts`, `VALID_TRANSITIONS` constant (line 16)

| Current Status | Valid Next Statuses | Notification Triggered |
|---|---|---|
| `received` | `inspection` | No |
| `inspection` | `queued` | No |
| `queued` | `washing` | No |
| `washing` | `drying` | No |
| `drying` | `ironing` | No |
| `ironing` | `quality_check` | No |
| `quality_check` | `packaging`, `washing` (rework) | No |
| `packaging` | `queued_for_delivery` | No |
| `queued_for_delivery` | `out_for_delivery`, `collected` | **Yes** (WhatsApp: order ready) |
| `out_for_delivery` | `delivered` | **Yes** (WhatsApp: driver dispatched) |
| `delivered` | (terminal) | **Yes** (WhatsApp: delivered) |
| `collected` | (terminal) | No |

### 6.3 Transition Logic

**Source:** `lib/db/orders.ts`, `updateOrderStatus()` (line 265)

When a status transition is executed:

1. Fetch current order: `const order = await getOrder(orderId)` (line 270)
2. Append to status history with `status`, `Timestamp.now()`, `updatedBy` (lines 273-280)
3. Build update object with new status, updatedAt, and statusHistory (lines 282-286)
4. If terminal (`collected` or `delivered`): set `actualCompletion = Timestamp.now()` (lines 289-291)
5. Save via `updateDocument()` (line 293)
6. Fetch customer data for notifications (line 297)
7. Fire-and-forget notification based on new status:
   - `queued_for_delivery` -> `notifyOrderReady()` (line 318)
   - `delivered` -> `notifyOrderDelivered()` (line 325)
   - `collected` -> `notifyOrderCollected()` (line 332)

### 6.4 Rework Path

The `quality_check -> washing` transition represents the rework path. When QA fails:

1. Order returns to `washing` status
2. New status history entry is added
3. The order re-enters the processing pipeline
4. This is distinct from a rewash (which creates a new order)

---

## 7. API Specification

### 7.1 Order CRUD Endpoints

#### POST /api/orders

**Purpose:** Create a new order
**Auth:** Required (front_desk, store_manager, admin, satellite_staff)
**Implementation:** `lib/db/orders.ts`, `createOrder()` (line 120)

**Request Body:**
```typescript
{
  customerId: string;        // Required
  branchId: string;          // Required
  garments: Garment[];       // Required, at least 1
  totalAmount: number;       // Required
  paidAmount: number;        // Required (can be 0)
  paymentStatus: PaymentStatus;  // Required
  paymentMethod?: PaymentMethod;
  serviceType: ServiceType;  // Required ('Normal' | 'Express')
  checkedBy: string;         // Required (inspector UID)
  collectionMethod: 'dropped_off' | 'pickup_required';  // Required
  returnMethod: 'customer_collects' | 'delivery_required';  // Required
  deliveryAddress?: Address;
  specialInstructions?: string;
}
```

**Response:** `{ orderId: string }` (201 Created)

**Side Effects:**
1. Generates unique order ID via `generateOrderId()`
2. Generates garment IDs via `generateGarmentId()`
3. Computes estimated completion via `calculateEstimatedCompletion()`
4. Creates initial status history entry (status: 'received')
5. Increments customer stats via `incrementCustomerStats()`
6. Triggers `notifyOrderCreated()` (fire-and-forget)

#### GET /api/orders/:orderId

**Purpose:** Retrieve a specific order
**Auth:** Required (all staff roles, customer with ownership check)
**Implementation:** `lib/db/orders.ts`, `getOrder()` (line 228), `getOrderByIdForCustomer()` (line 243)

**Response:** `OrderExtended` object (200 OK)

**Ownership Check:** For customer role, calls `getOrderByIdForCustomer()` which verifies `order.customerId === requestingCustomerId`. Throws `DatabaseError` on mismatch.

#### PUT /api/orders/:orderId/status

**Purpose:** Update order pipeline status
**Auth:** Required (workstation_staff, workstation_manager, store_manager, admin)
**Implementation:** `lib/db/orders.ts`, `updateOrderStatus()` (line 265)

**Request Body:**
```typescript
{
  status: OrderStatus;    // Required (must be valid transition)
  updatedBy: string;      // Required (staff UID)
}
```

**Response:** 200 OK

**Validation:** Checks `canTransitionTo()` before proceeding

#### GET /api/orders/:orderId/payments

**Purpose:** Get payment history for an order
**Auth:** Required (finance_manager, store_manager, admin)
**Implementation:** `app/api/orders/[orderId]/payments/route.ts` (81 lines)

**Response:** `Transaction[]` (200 OK)

#### DELETE /api/orders/:orderId

**Purpose:** Cancel/delete an order (admin only)
**Auth:** Required (admin)
**Implementation:** `lib/db/orders.ts`, `deleteOrder()` (line 532)

### 7.2 Order Query Endpoints

#### GET /api/orders?branchId=X&status=Y&paymentStatus=Z&limit=N

**Purpose:** List orders with filters
**Implementation:** Multiple functions in `lib/db/orders.ts`:
- By branch: `getOrdersByBranch()` (line 386)
- By branch + status: `getOrdersByBranchAndStatus()` (line 401)
- By status: `getOrdersByStatus()` (line 418)
- By payment status: `getOrdersByPaymentStatus()` (line 444)
- Search: `searchOrdersByOrderId()` (line 465)
- Multi-branch: `getOrdersForBranches()` (line 683)

**Response:** `OrderExtended[]` (200 OK)

### 7.3 Webhook Endpoints

#### POST /api/webhooks/order-notifications

**Purpose:** Receive and dispatch order lifecycle notifications
**Auth:** Bearer token (WEBHOOK_API_KEY)
**Implementation:** `app/api/webhooks/order-notifications/route.ts` (202 lines)

**Request Body:**
```typescript
{
  event: 'order.created' | 'order.ready' | 'order.delivered' | 'order.collected';
  order: { orderId, totalAmount, paidAmount, paymentStatus, ... };
  customer: { customerId, name, email, phone };
}
```

**Processing:** Dispatches to both email (Resend) and WhatsApp (Wati.io) notification handlers.

---

## 8. UI Specification

### 8.1 POS Page (`app/(dashboard)/pos/page.tsx`)

The POS page is the primary order creation interface. It orchestrates 20 child components in a multi-step workflow:

**Layout:**
- **Left Panel (60%):** Service selection and garment entry
  - `ServiceCategoryTabs` at top (Laundry, Dry Clean, Iron, Special)
  - `ServiceGrid` displaying services for selected category
  - `GarmentEntryForm` for adding garments with brand, color, category, inspection
- **Right Panel (40%):** Order summary and customer info
  - `CustomerSearch` / `CustomerCard` at top
  - `OrderSummaryPanel` with garment list and pricing
  - `POSBottomBar` fixed at bottom with submit button

**Workflow:**
1. Staff searches/selects customer via `CustomerSearch`
2. Staff selects service category via `ServiceCategoryTabs`
3. Staff selects service from `ServiceGrid`
4. Staff enters garment details in `GarmentEntryForm` (brand, color, category, inspection)
5. Garment appears as `CartItemChip` in `OrderSummaryPanel`
6. Staff repeats steps 2-5 for additional garments
7. Staff opens `OrderOptionsModal` for service type, collection/return methods
8. Staff clicks submit -> `PaymentModal` opens
9. Payment is processed -> `ReceiptPreview` displays

### 8.2 Pipeline Board (`app/(dashboard)/pipeline/page.tsx`)

**Layout:**
- `PipelineHeader` at top with filters and search
- `PipelineStats` bar showing order counts per status
- `PipelineBoard` with horizontal scrolling columns
  - One `PipelineColumn` per non-terminal status
  - Each column contains `OrderCard` components
  - Click on card opens `OrderDetailsModal`

**Interactions:**
- Status filters via `usePipelineFilters` hook (207 lines)
- Branch selector for multi-branch views
- Date range picker for historical data
- Search by order ID or customer name

### 8.3 Workstation Page (`app/(dashboard)/workstation/page.tsx`)

**Layout:**
- `WorkstationOverview` dashboard with queue counts
- Stage-specific tabs (Inspection, Washing, Drying, Ironing, QC, Packaging)
- Each tab renders corresponding station component:
  - `InspectionQueue` -> `WashingStation` -> `DryingStation` -> `IroningStation` -> `QualityCheckStation` -> `PackagingStation`
- `StaffAssignment` sidebar
- `StaffPerformance` metrics panel
- `MajorIssuesReviewModal` for manager approvals

---

## 9. Dashboard & Reporting Outputs

### 9.1 GM Dashboard Data

**Source:** `hooks/useRealTimeGMDashboard.ts` (410 lines)

The GM dashboard consumes order data via real-time Firestore subscriptions:

| Metric | Source Function | Description |
|---|---|---|
| Today's Orders | `useRealTimeOrderCount()` | Live count of orders created today |
| Today's Revenue | `useRealTimeRevenue()` | Sum of `paidAmount` for today's orders |
| Live Orders | `useRealTimeLiveOrders()` | Active non-terminal orders |
| Pipeline Stats | `getPipelineStats()` | Counts per status |
| Completed Today | `getCompletedTodayCountForBranches()` | Terminal orders today |
| Pending Count | `getPendingOrdersCountForBranches()` | Non-terminal order count |

### 9.2 Pipeline Statistics

**Source:** `lib/db/orders.ts`, `getPipelineStats()` (line 556)

Returns per-branch counts for each active status plus total. Used by `PipelineStats.tsx` component.

### 9.3 Export Reports

**PDF Export** (`lib/reports/export-pdf.ts`):
- Transaction summary report
- Payment method breakdown
- Date range filtering
- Branch-specific reports
- Filename format: `payment-report_[branch]_[start]_to_[end].pdf`

**Excel Export** (`lib/reports/export-excel.ts`):
- Raw transaction data worksheet
- Summary statistics worksheet
- Payment method breakdown
- Filename format: `payment-report_[branch]_[start]_to_[end].xlsx`

---

## 10. Notification & Messaging Flows

### 10.1 Architecture

```
Order Event (client)
    |
    v
Server Action (app/actions/notifications.ts)
    |
    v
Webhook POST (app/api/webhooks/order-notifications/route.ts)
    |
    +---> Email (Resend API)
    |
    +---> WhatsApp (services/wati.ts -> Wati.io API)
              |
              +---> Log to Firestore (notifications collection)
```

### 10.2 Notification Events

| Event | Trigger Point | WhatsApp Template | Email | Implementation |
|---|---|---|---|---|
| `order.created` | After `createOrder()` | `order_confirmation` | Yes | `notifyOrderCreated()` (line 108) |
| `order.ready` | Status -> `queued_for_delivery` | `order_ready` | Yes | `notifyOrderReady()` (line 130) |
| `order.delivered` | Status -> `delivered` | `order_delivered` | Yes | `notifyOrderDelivered()` (line 152) |
| `order.collected` | Status -> `collected` | N/A | Yes | `notifyOrderCollected()` (line 174) |
| `transfer.assigned` | Driver assigned to batch | N/A | No | `notifyDriverTransferAssigned()` (line 214) |

### 10.3 WhatsApp Message Details

**Service:** Wati.io REST API (`services/wati.ts`)
**Authentication:** Bearer token (`WATI_ACCESS_TOKEN`)
**Phone Format:** Kenya format, stripped to `254XXXXXXXXX`
**Validation:** `isValidKenyanPhoneNumber()` (line 95) - accepts `+254[71]XXXXXXXX`

**Retry Logic** (line 179 onwards):
- Maximum 3 attempts (`MAX_RETRY_ATTEMPTS = 3`)
- Exponential backoff: 1s, 2s, 4s (`INITIAL_RETRY_DELAY = 1000`)
- Each attempt is logged to Firestore `notifications` collection
- Status updated to `sent` or `failed` after attempts

**Available Templates:**
1. `order_confirmation` - Sent after order creation
2. `order_ready` - Sent when queued_for_delivery
3. `driver_dispatched` - Sent when driver assigned
4. `driver_nearby` - Sent when driver is close
5. `order_delivered` - Sent after delivery confirmation
6. `payment_reminder` - Sent for outstanding balances

### 10.4 Fire-and-Forget Pattern

All notifications are dispatched using fire-and-forget to avoid blocking critical operations:

```typescript
// From lib/db/orders.ts, createOrder() (line 198-220)
notifyOrderCreated({
  order: { orderId, totalAmount, ... },
  customer: { customerId, name, email, phone },
}).catch((error) => {
  console.error('Failed to trigger order created notification:', error);
  // Don't throw - notifications are non-critical
});
```

This ensures order creation and status updates succeed even if notification delivery fails.

---

## 11. Audit & Compliance

### 11.1 Audit Log Structure

**Collection:** `auditLogs`
**Interface:** `AuditLog` at `lib/db/schema.ts` lines 1545-1577

| Field | Type | Description |
|---|---|---|
| `auditLogId` | `string` | Format: `AUDIT-[YYYYMMDD]-[TIMESTAMP]-[RANDOM]` |
| `action` | `AuditLogAction` | `create`, `update`, `delete`, `transfer`, `approve`, `reject`, `role_change`, `branch_access_change`, `permission_change` |
| `resourceType` | `string` | e.g., `order`, `inventory`, `user`, `transfer` |
| `resourceId` | `string` | ID of affected resource |
| `performedBy` | `string` | Staff UID |
| `performedByName` | `string` | Denormalized name |
| `performedByRole` | `UserRole` | Role at time of action |
| `branchId` | `string` | Where action occurred |
| `additionalBranchIds` | `string[]` | For cross-branch actions |
| `description` | `string` | Human-readable description |
| `changes` | `{ before?, after? }` | Before/after snapshot |
| `ipAddress` | `string` | Client IP |
| `userAgent` | `string` | Browser user agent |
| `timestamp` | `Timestamp` | When action occurred |

### 11.2 Order-Specific Audit Functions

**Source:** `lib/db/audit-logs.ts`

| Function | Line | Purpose |
|---|---|---|
| `logOrderCreated()` | 100 | Logs order creation with full order data in `changes.after` |
| `logOrderUpdated()` | 125 | Logs order updates with before/after snapshots |
| `logCrossBranchAction()` | 241 | Logs actions affecting multiple branches |
| `logInventoryTransfer()` | 152 | Logs inventory transfers between branches |

### 11.3 Audit Query Functions

| Function | Line | Purpose |
|---|---|---|
| `getAuditLogsByResource()` | 273 | Get logs for specific order/resource |
| `getAuditLogsByBranch()` | 301 | Get logs for a branch (with optional action filter) |
| `getAuditLogsByUser()` | 333 | Get logs for a specific staff member |
| `getRecentAuditLogs()` | 359 | Get recent logs across all branches (super admin) |
| `getCrossBranchAuditLogs()` | 387 | Get logs for cross-branch actions (transfers, access changes) |

### 11.4 Compliance Rules

1. **Immutability:** Audit logs are append-only; no update or delete operations exist
2. **Completeness:** Every order mutation (create, status change, payment, deletion) MUST generate an audit log
3. **Traceability:** Every audit entry includes the performing user's identity and role
4. **Cross-Branch:** Transfer operations log both source and destination branch IDs
5. **Retention:** Audit logs are retained indefinitely (no TTL configured)

---

## 12. Customer Portal Impact

### 12.1 Order Visibility

Customers can view their own orders via the customer portal. Access is controlled by ownership verification:

**Implementation:** `lib/db/orders.ts`, `getOrderByIdForCustomer()` (line 243)

```typescript
export async function getOrderByIdForCustomer(
  orderId: string,
  customerId: string
): Promise<OrderExtended> {
  const order = await getDocument<OrderExtended>('orders', orderId);
  if (order.customerId !== customerId) {
    throw new DatabaseError(
      `Order ${orderId} does not exist or you do not have permission to view it.`
    );
  }
  return order;
}
```

### 12.2 Customer-Visible Fields

Customers see the following order data:
- Order ID, status, estimated completion
- Garment list (type, color, brand, services)
- Payment status and amount breakdown
- Status history timeline
- Delivery tracking (if applicable)

### 12.3 Customer-Accessible Actions

- View order details and status
- Track delivery progress
- Download receipt PDF
- Request rewash (within 24-hour window)

### 12.4 Data Excluded from Customer View

- Internal staff assignments (`createdBy`, `checkedBy`, etc.)
- Workstation inspection details (Stage 2)
- Processing batch information
- Routing internals
- Audit logs
- Staff performance metrics

---

## 13. Branch Scoping

### 13.1 Multi-Branch Architecture

The system supports two branch types (defined in `lib/db/schema.ts`, `Branch` interface, line 686):
- **Main stores** (`branchType: 'main'`): Have processing equipment, workstations
- **Satellite stores** (`branchType: 'satellite'`): Collection points only, transfer orders to linked main store via `mainStoreId`

### 13.2 Branch-Scoped Queries

All order queries support branch scoping. The `lib/db/orders.ts` module provides functions for both single-branch and multi-branch scenarios:

| Function | Line | Branch Support |
|---|---|---|
| `getOrdersByBranch()` | 386 | Single branch |
| `getOrdersByBranchAndStatus()` | 401 | Single branch + status filter |
| `getOrdersForBranches()` | 683 | Multi-branch (null = all) |
| `getTodayOrdersCountForBranches()` | 731 | Multi-branch count |
| `getCompletedTodayCountForBranches()` | 781 | Multi-branch completed count |
| `getPendingOrdersCountForBranches()` | 834 | Multi-branch pending count |
| `getTodayRevenueForBranches()` | 877 | Multi-branch revenue |

### 13.3 Multi-Branch Query Strategy

**Source:** `lib/db/orders.ts`, `getOrdersForBranches()` (line 683)

The function handles varying branch set sizes:
1. **null (super admin):** Returns all orders via `getAllOrders()`
2. **Empty array:** Returns `[]`
3. **Single branch:** Uses `getOrdersByBranch()`
4. **2-10 branches:** Uses Firestore `where('branchId', 'in', branchIds)` (Firestore limit: 10 items in `in` clause)
5. **11+ branches:** Fetches per-branch, merges, sorts by `createdAt`, and limits

### 13.4 Satellite Store Workflow

1. Order created at satellite store with `branchId = satelliteBranchId`
2. `originBranchId` set to satellite, `destinationBranchId` set to linked main store
3. Order added to `TransferBatch`
4. Driver assigned; WhatsApp notification sent via `notifyDriverTransferAssigned()`
5. Batch dispatched; order's `transferredAt` set
6. Main store receives batch; `receivedAtMainStoreAt` set
7. Order enters main store's processing pipeline

---

## 14. Business Logic

### 14.1 Order Creation Logic

**Source:** `lib/db/orders.ts`, `createOrder()` (line 120)

The full creation flow:

1. **Validate customer:** `getCustomer(data.customerId)` verifies customer exists
2. **Generate order ID:** `generateOrderId(data.branchId)` creates unique sequential ID
3. **Generate garment IDs:** `data.garments.map((g, i) => generateGarmentId(orderId, i))`
4. **Set initial garment status:** All garments start as `'received'`
5. **Detect express:** `data.garments.some(g => g.services.includes('express'))`
6. **Calculate ETA:** `calculateEstimatedCompletion(garmentCount, isExpress)`
7. **Create status history:** Initial entry with status `'received'`
8. **Build order document:** Combines all fields, filters `undefined` values for Firestore
9. **Save to Firestore:** `setDocument('orders', orderId, order)`
10. **Update customer stats:** `incrementCustomerStats(customerId, totalAmount)`
11. **Trigger notifications:** Fire-and-forget `notifyOrderCreated()`

### 14.2 Payment Logic

**Source:** `lib/db/orders.ts`, `updateOrderPayment()` (line 345)

1. Fetch current order
2. Calculate new total: `totalPaid = order.paidAmount + paidAmount`
3. Determine payment status:
   - `totalPaid >= totalAmount` -> `'paid'`
   - `totalPaid > 0` -> `'partial'`
   - else -> `'pending'`
4. Update order with new `paidAmount`, `paymentMethod`, `paymentStatus`, `updatedAt`

### 14.3 Estimated Completion Logic

**Source:** `lib/db/orders.ts`, `calculateEstimatedCompletion()` (line 90)

```
Base: 48 hours
If garmentCount > 20: +48 hours (total: 96 hours)
Else if garmentCount > 10: +24 hours (total: 72 hours)
If isExpress: divide by 2
Result: Timestamp from now + computed hours
```

### 14.4 Pipeline Stats Logic

**Source:** `lib/db/orders.ts`, `getPipelineStats()` (line 556)

1. Fetch up to 200 orders for the branch
2. Count orders per active status (received through out_for_delivery)
3. Sum as total (excludes terminal states)
4. Return as typed object with status keys

### 14.5 Express Pricing Logic

Express orders use `ServiceType = 'Express'` (schema line 431). The surcharge is stored separately:
- `Order.subtotal` (line 460): base price before surcharge
- `Order.expressSurcharge` (line 462): surcharge amount
- `Order.totalAmount` (line 458): `subtotal + expressSurcharge`

The express multiplier is configurable at the system level (default: 1.5x).

---

## 15. Integration Points

### 15.1 Payment Gateway (Pesapal)

- **Direction:** Outbound (order -> Pesapal) and Inbound (callback)
- **Used When:** Card and M-Pesa payments are processed
- **Data Flow:** Order amount and method -> Pesapal checkout -> IPN callback -> Transaction created
- **Interface:** `Transaction` at schema lines 833-858

### 15.2 WhatsApp Notifications (Wati.io)

- **Direction:** Outbound
- **Used When:** Order created, ready, delivered, driver dispatched
- **Data Flow:** Order event -> Server Action -> Webhook -> Wati.io API
- **Interface:** `Notification` at schema lines 885-904
- **Implementation:** `services/wati.ts` (732 lines)

### 15.3 Email Notifications (Resend)

- **Direction:** Outbound
- **Used When:** Same events as WhatsApp
- **Data Flow:** Order event -> Webhook -> Resend API
- **Implementation:** Within `app/api/webhooks/order-notifications/route.ts`

### 15.4 Receipt PDF Generation (jsPDF)

- **Direction:** Client-side generation
- **Used When:** After order creation and on demand
- **Implementation:** `lib/reports/export-pdf.ts` using jsPDF library

### 15.5 Real-Time Subscriptions (Firestore)

- **Direction:** Server -> Client
- **Used When:** Pipeline board, GM dashboard, live order tracking
- **Technology:** Firestore `onSnapshot()` listeners
- **Implementation:** `hooks/useRealTimeGMDashboard.ts` (410 lines)

### 15.6 Customer Statistics (Cross-Module)

- **Direction:** Order module -> Customer module
- **Used When:** Every order creation
- **Implementation:** `incrementCustomerStats(customerId, totalAmount)` called in `createOrder()`
- **Updates:** `Customer.orderCount`, `Customer.totalSpent`

---

## 16. Security & Permissions

### 16.1 Role-Based Access Control

**Source:** `lib/db/schema.ts`, type `UserRole` (lines 22-39)

| Role | Create Order | View Orders | Update Status | Payments | Delete Order | Reports | Audit |
|---|---|---|---|---|---|---|---|
| `admin` | Yes | All | Yes | Yes | Yes | Yes | Yes |
| `director` | No | Multi-branch | No | No | No | Yes | Yes |
| `general_manager` | No | Branch | Yes | No | No | Yes | Yes |
| `store_manager` | Yes | Branch | Yes | Yes | No | Yes | No |
| `workstation_manager` | No | Branch | Yes | No | No | No | No |
| `workstation_staff` | No | Assigned | Yes (own stage) | No | No | No | No |
| `satellite_staff` | Yes | Branch | No | Yes | No | No | No |
| `front_desk` | Yes | Branch | No | Yes | No | No | No |
| `driver` | No | Assigned | Delivery only | Collect | No | No | No |
| `customer` | No | Own only | No | No | No | No | No |
| `finance_manager` | No | All | No | Yes | No | Yes | Yes |
| `auditor` | No | All (read-only) | No | No | No | Yes | Yes |
| `logistics_manager` | No | Delivery | Delivery only | No | No | Yes | No |
| `inspector` | No | Assigned | Inspection only | No | No | No | No |

### 16.2 Server-Side Security

**Notification Security:**
- `app/actions/notifications.ts` uses `'use server'` directive (line 12) ensuring code never reaches client
- Webhook authentication via `WEBHOOK_API_KEY` environment variable
- API key validated in webhook handler with Bearer token check

**Firestore Security Rules:**
- `firestore.rules` enforces collection-level access control
- Customer orders are filtered by `customerId` match
- Staff orders are filtered by `branchId` and role

### 16.3 Data Sanitization

- Firestore `setDocument()` filters `undefined` values to prevent storage errors
- Phone numbers are validated via `isValidKenyanPhoneNumber()` before WhatsApp delivery
- Order amounts are validated as positive numbers

---

## 17. Error Handling & Edge Cases

### 17.1 Order Creation Errors

| Error | Cause | Handling |
|---|---|---|
| Customer not found | Invalid `customerId` | `getCustomer()` throws `DatabaseError` |
| Duplicate order ID | Race condition on same-day orders | `generateOrderId()` queries last order; Firestore uses `setDocument()` which overwrites |
| Missing required fields | Incomplete form submission | Zod validation at form level; TypeScript compile-time checks |
| Firestore write failure | Network/quota issues | Error propagates; order not created |
| Notification failure | Wati.io/Resend unavailable | Fire-and-forget; errors logged but not propagated |

### 17.2 Status Transition Errors

| Error | Cause | Handling |
|---|---|---|
| Invalid transition | Attempting disallowed status change | `canTransitionTo()` returns false; UI should prevent |
| Concurrent updates | Two users updating same order | Firestore last-write-wins; status history captures both |
| Terminal state re-transition | Attempting to change delivered/collected | Empty transition array prevents movement |

### 17.3 Payment Edge Cases

| Case | Handling |
|---|---|
| Overpayment | `paymentStatus` set to `'overpaid'`; excess tracked |
| Zero-amount payment | Treated as no-op; status remains unchanged |
| Rewash/Redo payment | `totalAmount = 0`; `paymentStatus = 'paid'` immediately |
| Partial then full | Cumulative `paidAmount`; status transitions partial -> paid |

### 17.4 Multi-Branch Edge Cases

| Case | Handling |
|---|---|
| >10 branches query | Falls back to per-branch fetch + merge + sort (line 712-722) |
| Satellite without main store | `mainStoreId` is optional; order stays at satellite |
| Transfer batch with mixed branches | `TransferBatch` enforces single satellite -> single main store |

---

## 18. Data Migration

### 18.1 V1.0 to V2.0 Migration Considerations

The following V2.0 fields were added to existing orders:

| New Field | Default for Existing Orders | Migration Action |
|---|---|---|
| `checkedBy` | `''` (empty) | Set to creating user's UID |
| `checkedByName` | `''` | Set to creating user's name |
| `serviceType` | `'Normal'` | All existing orders are Normal |
| `deliveryClassification` | `null` | Not applicable to existing orders |
| `isRewash` | `false` | No existing rewashes |
| `subtotal` | `totalAmount` | Same as total (no surcharge) |
| `expressSurcharge` | `0` | No express existed |
| `collectionMethod` | `'dropped_off'` | Default assumption |
| `returnMethod` | `'customer_collects'` | Default assumption |

### 18.2 Backward Compatibility

- All V2.0 fields are optional (`?` in TypeScript interface)
- Existing queries continue to work without new fields
- New fields have sensible defaults that match V1.0 behavior
- `driverId` is marked `@deprecated` in favor of `deliveryAssignedTo` (schema line 608)

### 18.3 Index Updates

New composite indexes must be deployed for V2.0 queries. Use `firebase deploy --only firestore:indexes` after updating `firestore.indexes.json`.

---

## 19. Testing Strategy

### 19.1 Unit Tests

| Component | Test Focus |
|---|---|
| `generateOrderId()` | Unique IDs, date format, sequence increment, branch prefix |
| `generateGarmentId()` | Sequential numbering, order ID prefix |
| `calculateEstimatedCompletion()` | Base 48h, >10 adjustment, >20 adjustment, express halving |
| `canTransitionTo()` | All valid transitions, all invalid transitions |
| `getValidNextStatuses()` | Correct arrays for each status |
| `isTerminalStatus()` | Only delivered and collected return true |
| `getStatusGroup()` | Correct grouping for all 12 statuses |
| `updateOrderPayment()` | Partial -> paid transition, overpayment handling |
| `formatPhoneNumber()` | +254 prefix, 0 prefix, no prefix, non-digit removal |
| `isValidKenyanPhoneNumber()` | Valid/invalid Kenya numbers |
| `calculateSummary()` | Transaction aggregation by status and method |

### 19.2 Integration Tests

| Flow | Test Scope |
|---|---|
| Order creation | Full flow: customer lookup -> order save -> stats update -> notification trigger |
| Status update | Valid transition -> status history -> notification -> audit log |
| Payment recording | Amount calculation -> status derivation -> document update |
| Multi-branch queries | Single branch, multi-branch (<10), multi-branch (>10), null (all) |
| Customer ownership | Authorized access -> order returned; unauthorized -> DatabaseError thrown |

### 19.3 End-to-End Tests

| Scenario | Coverage |
|---|---|
| Full order lifecycle | Create -> process through all stages -> deliver -> verify terminal state |
| Express order | Create express -> verify surcharge -> halved ETA |
| Rewash flow | Create order -> deliver -> request rewash within 24h -> verify linked orders |
| Satellite transfer | Create at satellite -> batch -> transfer -> main store receipt -> process -> deliver |
| Payment flow | Create -> partial payment -> full payment -> verify status transitions |

### 19.4 Performance Benchmarks

| Operation | Target | Actual Query Pattern |
|---|---|---|
| Order creation | <2 seconds | Sequential: customer lookup + ID generation + save + stats update |
| Status update | <500ms | Sequential: order fetch + status history append + save + notification |
| Pipeline stats | <1 second | Single query: 200 orders by branch, client-side aggregation |
| Order list (50) | <500ms | Single query with composite index |
| Multi-branch (10) | <1 second | Single `in` query |
| Multi-branch (20) | <3 seconds | 20 sequential queries + merge |

---

## 20. Implementation Sequence

### Phase 1: Core Order CRUD (Complete)

1. `lib/db/schema.ts` -- Define `Order`, `Garment`, `OrderStatus` interfaces
2. `lib/db/orders.ts` -- Implement `createOrder()`, `getOrder()`, `updateOrderStatus()`, `updateOrderPayment()`
3. `lib/pipeline/status-manager.ts` -- Define `VALID_TRANSITIONS`, validation functions
4. `lib/db/audit-logs.ts` -- Implement `createAuditLog()`, `logOrderCreated()`, `logOrderUpdated()`

### Phase 2: POS Frontend (Complete)

5. `components/features/pos/CustomerSearch.tsx` -- Customer lookup
6. `components/features/pos/GarmentEntryForm.tsx` -- Garment entry with brand/category
7. `components/features/pos/ServiceGrid.tsx` -- Service selection
8. `components/features/pos/OrderSummaryPanel.tsx` -- Order summary
9. `components/features/pos/PaymentModal.tsx` -- Payment processing
10. `components/features/pos/ReceiptPreview.tsx` -- Receipt with QR code
11. `app/(dashboard)/pos/page.tsx` -- POS page orchestration

### Phase 3: Pipeline Frontend (Complete)

12. `components/features/pipeline/PipelineBoard.tsx` -- Kanban board
13. `components/features/pipeline/PipelineColumn.tsx` -- Status columns
14. `components/features/pipeline/OrderCard.tsx` -- Order cards
15. `components/features/pipeline/PipelineStats.tsx` -- Statistics bar
16. `hooks/usePipelineFilters.ts` -- Filter logic

### Phase 4: Workstation Processing (Complete)

17. `components/features/workstation/WorkstationOverview.tsx` -- Dashboard
18. Stage-specific components (Washing, Drying, Ironing, QC, Packaging)
19. `components/features/workstation/StaffAssignment.tsx` -- Staff management
20. `components/features/workstation/MajorIssuesReviewModal.tsx` -- Approval workflow

### Phase 5: Notifications (Complete)

21. `services/wati.ts` -- WhatsApp integration with retry logic
22. `app/actions/notifications.ts` -- Server actions
23. `app/api/webhooks/order-notifications/route.ts` -- Webhook handler

### Phase 6: Reporting (Complete)

24. `lib/reports/export-pdf.ts` -- PDF export
25. `lib/reports/export-excel.ts` -- Excel export
26. `hooks/useRealTimeGMDashboard.ts` -- Real-time dashboard data

### Phase 7: Advanced Features (Complete)

27. Satellite transfer batch management
28. Processing batch management
29. Rewash/Redo system
30. Load-based pricing with customer segmentation
31. Multi-branch query optimization

---

## 21. Open Questions & Risks

### 21.1 Open Questions

| # | Question | Impact | Status |
|---|---|---|---|
| OQ-1 | Should rewash eligibility window be configurable per branch? | Currently hardcoded at 24 hours | Open |
| OQ-2 | What happens when Firestore `in` query limit increases beyond 10? | Multi-branch query strategy in `getOrdersForBranches()` could be simplified | Open |
| OQ-3 | Should `generateOrderId()` use a counter collection instead of querying last order? | Current approach has theoretical race condition under high load | Open |
| OQ-4 | Should stage durations be computed server-side or client-side? | `Garment.stageDurations` is defined but computation is not standardized | Open |
| OQ-5 | Should delivery classification thresholds be stored in system settings or branch config? | Currently neither -- hardcoded in classification logic | Open |
| OQ-6 | What is the maximum number of garments per order? | No current limit enforced | Open |
| OQ-7 | Should the `driverId` field be formally removed or kept for backward compat? | Currently marked `@deprecated` but still present | Open |

### 21.2 Technical Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| TR-1 | Order ID collision under concurrent creation | Low | High | Sequential query + Firestore document ID uniqueness provides safety net |
| TR-2 | Firestore read quota exceeded by pipeline stats | Medium | Medium | `getPipelineStats()` fetches up to 200 orders; consider aggregation collection |
| TR-3 | WhatsApp notification delivery failure | Medium | Low | 3x retry with exponential backoff; fire-and-forget pattern prevents blocking |
| TR-4 | Status history array growing unbounded | Low | Low | 12-state pipeline means max ~15-20 entries per order (including rework) |
| TR-5 | Multi-branch query performance degradation | Medium | Medium | >10 branches requires sequential queries; consider denormalized aggregation |
| TR-6 | Firestore storage costs for large photo arrays | Medium | Low | Photos stored in Firebase Storage; only URLs in Firestore |

### 21.3 Business Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| BR-1 | Staff bypass mandatory fields | Low | Medium | TypeScript + Zod validation at form and API levels |
| BR-2 | Incorrect delivery classification | Medium | Low | Manager override capability; classification basis tracking |
| BR-3 | Rewash abuse beyond 24-hour window | Low | Medium | Server-side timestamp validation |
| BR-4 | Satellite orders stuck in transfer | Medium | Medium | Transfer batch status tracking; notifications to managers |

---

## Appendix A: Full Field Catalog

### A.1 OrderStatus Enumeration

**Source:** `lib/db/schema.ts`, lines 243-255

```typescript
type OrderStatus =
  | 'received'           // Order logged at branch
  | 'inspection'         // Initial/detailed inspection
  | 'queued'             // Waiting for processing
  | 'washing'            // Being washed
  | 'drying'             // In dryer
  | 'ironing'            // Being ironed
  | 'quality_check'      // QA inspection
  | 'packaging'          // Being packaged
  | 'queued_for_delivery' // Ready for pickup/delivery (was 'ready' in v1)
  | 'out_for_delivery'   // Driver dispatched
  | 'delivered'          // Successfully delivered (TERMINAL)
  | 'collected';         // Picked up by customer (TERMINAL)
```

### A.2 PaymentMethod Enumeration

**Source:** `lib/db/schema.ts`, line 266

```typescript
type PaymentMethod = 'mpesa' | 'card' | 'credit' | 'customer_credit';
// Note: Cash payment removed - this is a cashless system
```

### A.3 PaymentStatus Enumeration

**Source:** `lib/db/schema.ts`, line 260

```typescript
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overpaid';
```

### A.4 PaymentType Enumeration

**Source:** `lib/db/schema.ts`, line 271

```typescript
type PaymentType = 'partial' | 'full' | 'advance' | 'refund' | 'credit_applied';
```

### A.5 RoutingStatus Enumeration

**Source:** `lib/db/schema.ts`, lines 277-283

```typescript
type RoutingStatus =
  | 'pending'           // Awaiting routing decision
  | 'in_transit'        // Being transferred between branches
  | 'received'          // Received at processing branch
  | 'assigned'          // Assigned to workstation
  | 'processing'        // Being processed
  | 'ready_for_return'; // Processing complete
```

### A.6 StainDetail Interface

**Source:** `lib/db/schema.ts`, lines 288-295

```typescript
interface StainDetail {
  location: string;    // e.g., "collar", "sleeve", "front"
  type: string;        // e.g., "oil", "wine", "ink"
  severity: 'light' | 'medium' | 'heavy';
}
```

### A.7 RipDetail Interface

**Source:** `lib/db/schema.ts`, lines 300-305

```typescript
interface RipDetail {
  location: string;    // Location on garment
  size: string;        // e.g., "2cm", "small", "large"
}
```

### A.8 StaffHandler Interface

**Source:** `lib/db/schema.ts`, lines 310-317

```typescript
interface StaffHandler {
  uid: string;             // Staff UID
  name: string;            // Staff name
  completedAt: Timestamp;  // When stage was completed
}
```

---

## Appendix B: Notification Templates

### B.1 WhatsApp Message Templates (Wati.io)

| Template Name | Event | Parameters |
|---|---|---|
| `order_confirmation` | Order created | `customerName`, `orderId`, `totalAmount`, `estimatedCompletion`, `branchName` |
| `order_ready` | Status -> queued_for_delivery | `customerName`, `orderId`, `branchName`, `branchPhone` |
| `driver_dispatched` | Status -> out_for_delivery | `customerName`, `orderId`, `driverName`, `estimatedArrival` |
| `driver_nearby` | Driver within proximity | `customerName`, `orderId`, `driverName` |
| `order_delivered` | Status -> delivered | `customerName`, `orderId`, `deliveryTime` |
| `payment_reminder` | Outstanding balance detected | `customerName`, `orderId`, `balanceAmount`, `paymentLink` |

### B.2 Email Templates (Resend)

| Template | Event | Content |
|---|---|---|
| Order Confirmation | `order.created` | Order details, garment list, estimated completion, tracking link |
| Order Ready | `order.ready` | Pickup/delivery instructions, branch address/hours |
| Order Delivered | `order.delivered` | Delivery confirmation, receipt link |
| Order Collected | `order.collected` | Collection confirmation, thank you, feedback link |

### B.3 Server Action Notification Parameters

**Source:** `app/actions/notifications.ts`, `NotificationParams` interface (line 14)

```typescript
interface NotificationParams {
  event: 'order.created' | 'order.ready' | 'order.delivered' | 'order.collected';
  order: {
    orderId: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    paymentMethod?: string;
    estimatedCompletion: Date | string;
    createdAt: Date | string;
    branchName?: string;
    branchPhone?: string;
    trackingUrl?: string;
    receiptUrl?: string;
    garments?: any[];
  };
  customer: {
    customerId?: string;
    name: string;
    email?: string;
    phone: string;
  };
}
```

---

## Appendix C: State Transition Matrix

Full matrix showing all possible source-destination combinations. `Y` = valid transition, `-` = invalid.

| From \ To | received | inspection | queued | washing | drying | ironing | quality_check | packaging | queued_for_delivery | out_for_delivery | delivered | collected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| received | - | Y | - | - | - | - | - | - | - | - | - | - |
| inspection | - | - | Y | - | - | - | - | - | - | - | - | - |
| queued | - | - | - | Y | - | - | - | - | - | - | - | - |
| washing | - | - | - | - | Y | - | - | - | - | - | - | - |
| drying | - | - | - | - | - | Y | - | - | - | - | - | - |
| ironing | - | - | - | - | - | - | Y | - | - | - | - | - |
| quality_check | - | - | - | Y | - | - | - | Y | - | - | - | - |
| packaging | - | - | - | - | - | - | - | - | Y | - | - | - |
| queued_for_delivery | - | - | - | - | - | - | - | - | - | Y | - | Y |
| out_for_delivery | - | - | - | - | - | - | - | - | - | - | Y | - |
| delivered | - | - | - | - | - | - | - | - | - | - | - | - |
| collected | - | - | - | - | - | - | - | - | - | - | - | - |

**Key observations:**
- `quality_check` has two outgoing transitions: `packaging` (pass) and `washing` (rework/fail)
- `queued_for_delivery` has two outgoing transitions: `out_for_delivery` (delivery) and `collected` (customer pickup)
- `delivered` and `collected` are terminal states with zero outgoing transitions
- All other states have exactly one outgoing transition (linear pipeline)

---

**End of Module 1 -- Order Management Feature Spec**

**Total Functional Requirements:** 37 (FR-M1-001 through FR-M1-037)
**Total Source Files Referenced:** 30+
**Total Firestore Collections:** 14
**Total UI Components:** 41 (20 POS + 7 Pipeline + 14 Workstation)
**Total API Endpoints:** 12+
