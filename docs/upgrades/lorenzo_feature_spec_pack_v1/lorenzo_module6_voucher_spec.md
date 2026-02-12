# Module 6 -- Voucher & Direct Approval Feature Spec

**Version:** 1.0
**Status:** Draft
**Date:** February 2026
**Author:** AI Agents Plus Engineering
**System:** Lorenzo Dry Cleaners Management System v2.0
**Module Maturity:** `[BUILT]`

---

## Table of Contents

1. [Document Metadata](#1-document-metadata)
2. [Executive Summary](#2-executive-summary)
3. [Existing Foundation](#3-existing-foundation)
4. [Requirements](#4-requirements)
5. [Data Model](#5-data-model)
6. [State Machine / Workflows](#6-state-machine--workflows)
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

---

## 1. Document Metadata

| Field | Value |
|-------|-------|
| Module ID | M6 |
| Module Name | Voucher & Direct Approval |
| Version | 1.0 |
| Status | Draft |
| Date | February 2026 |
| Author | AI Agents Plus Engineering |
| Maturity | `[BUILT]` -- existing voucher system with approval workflows |

### Dependencies

| Dependency | Module | Status | Relationship |
|-----------|--------|--------|-------------|
| Master Spec | Master | Required | Shared types, patterns, API standards, approval workflow pattern (Section 6), audit logging standard (Section 10), notification standard (Section 11) |
| Module 1 | Order Management | Required | Vouchers are applied to orders at POS payment step; order `totalAmount` adjusted by voucher discount; `usedOnOrderId` links voucher to order |
| Module 4 | Customer Preferences | Optional | Customer purchase history and segment data informs campaign targeting rules |
| Module 5 | AI Insights | Optional | AI-recommended campaign parameters, predicted redemption rates, campaign ROI forecasting |

### Terminology

| Term | Definition |
|------|-----------|
| Direct Approval | The multi-tier approval workflow itself (manager -> GM -> director -> admin), not a fast-track bypass. This is the standard path every voucher requiring approval must traverse. |
| Voucher | A single-use promotional discount code with a unique alphanumeric code and optional QR representation |
| Campaign | [NEW] A bulk distribution program that generates and distributes multiple vouchers to a targeted customer segment |
| Template | [NEW] A reusable voucher configuration that can be instantiated into individual vouchers or campaigns |
| Redemption | The act of applying a voucher to an order at POS, consuming the voucher |

---

## 2. Executive Summary

### What This Module Covers

Module 6 defines the complete voucher lifecycle management system for Lorenzo Dry Cleaners: creation, multi-tier approval ("Direct Approval"), distribution, redemption at POS, cancellation, expiry, and analytics. The system supports both single voucher issuance (e.g., customer complaint resolution) and bulk campaign distribution (e.g., holiday promotion for all VIP customers).

### "Direct Approval" Explained

"Direct Approval" refers to the approval workflow itself -- the multi-tier chain where a voucher creation request flows through `manager` -> `general_manager` -> `director` -> `admin` based on the voucher's discount value. This is not a bypass mechanism. It is the standard approval path defined in `lib/workflows/approval.ts` via the `WORKFLOW_CONFIGS.voucher` configuration:

- **Tier 1 (`general_manager`):** Approves vouchers with discount value >= KES 0 (i.e., all vouchers that require approval)
- **Tier 2 (`director`):** Required for vouchers with discount value >= KES 5,000
- **Auto-approve threshold:** Vouchers with percentage discount <= 20% or fixed discount <= KES 1,000 are auto-approved by the creator (see `VOUCHER_CONFIG.approvalThreshold` in `lib/db/vouchers.ts` lines 117-120)
- **Expiry:** Approval requests expire after 48 hours (`WORKFLOW_CONFIGS.voucher.defaultExpiryHours = 48`), with auto-escalation to the next tier

### Business Value

| Value Area | Description |
|-----------|-------------|
| Customer Retention | Issue targeted vouchers to at-risk customers identified by purchase frequency decline |
| Complaint Resolution | Front-desk staff can create vouchers for service recovery, with GM approval for high-value discounts |
| Promotional Campaigns | [NEW] Bulk-generate vouchers for seasonal promotions, distributed via WhatsApp to targeted segments |
| Loyalty Rewards | Tie voucher issuance to loyalty milestones (e.g., 10th order = 15% discount voucher) |
| Revenue Tracking | [NEW] Measure campaign ROI by tracking redemption rates and revenue impact per campaign |

### Current State

The voucher system is fully built with:

- Complete CRUD operations (`lib/db/vouchers.ts`)
- Multi-tier approval workflow (`lib/workflows/approval.ts`)
- QR code generation for vouchers (`lib/receipts/qr-generator.ts`, function `generateVoucherQRCode`)
- Validation and redemption at POS (`validateVoucher`, `redeemVoucher`)
- Voucher statistics aggregation (`getVoucherStats`)
- Scheduled expiry processing (`expireVouchers`)
- Zod validation schema (`lib/validations/orders.ts`, `createVoucherSchema`)
- Audit log category for vouchers (`app/(dashboard)/auditor/audit-logs/page.tsx`, line 87)

### Enhancement Areas

| Area | Status | Description |
|------|--------|-------------|
| Bulk Generation | `[NEW]` | Generate 100-10,000 vouchers in a single operation with template support |
| Campaign System | `[NEW]` | Define target audience, distribution channel, budget, and schedule for bulk voucher campaigns |
| Voucher Templates | `[NEW]` | Reusable voucher configurations (e.g., "VIP 20% Holiday", "Complaint Resolution 10%") |
| Usage Analytics | `[NEW]` | Redemption rate tracking, campaign ROI calculation, discount cost analysis |
| AI-Recommended Campaigns | `[NEW]` | Ties to Module 5 -- AI suggests optimal campaign parameters based on customer data |
| Director Analytics Page | `[NEW]` | `/director/vouchers` -- campaign performance, redemption trends, ROI dashboards |
| GM Approval Page | `[NEW]` | `/gm/vouchers` -- pending approvals queue, active vouchers management |
| Customer Portal Wallet | `[NEW]` | Customers view and manage their available vouchers, QR display, apply at checkout |
| WhatsApp Distribution | `[NEW]` | New templates `voucher_issued` and `voucher_expiring` for automated WhatsApp delivery |

---

## 3. Existing Foundation

### Core Files

| File Path | Purpose | Key Exports |
|-----------|---------|------------|
| `lib/db/vouchers.ts` | Voucher CRUD, validation, redemption, statistics | `Voucher`, `VoucherDiscountType`, `VoucherApprovalStatus`, `VoucherStatus`, `VoucherValidationResult`, `VOUCHER_CONFIG`, `generateVoucherCode()`, `generateVoucherId()`, `requiresApproval()`, `createVoucher()`, `approveVoucher()`, `rejectVoucher()`, `validateVoucher()`, `redeemVoucher()`, `cancelVoucher()`, `getVoucherById()`, `getVoucherByCode()`, `getPendingVouchers()`, `getActiveVouchers()`, `getCustomerVouchers()`, `getVoucherStats()`, `updateVoucherQRCode()`, `expireVouchers()` |
| `lib/db/schema.ts` (lines 3257-3318) | Voucher interface definition in master schema | `VoucherDiscountType`, `VoucherApprovalStatus`, `Voucher` (schema version with `minOrderAmount`, `purpose`, `usedByCustomer`, `usedDate`, `usedOnOrder` field names) |
| `lib/workflows/approval.ts` | Multi-tier approval engine | `ApprovalType` (includes `'voucher'`), `ApprovalStatus`, `ApprovalTier`, `ApprovalRequest`, `ApprovalHistoryEntry`, `WorkflowConfig`, `WORKFLOW_CONFIGS.voucher`, `ROLE_TO_TIER`, `TIER_HIERARCHY`, `getRequiredTier()`, `canApprove()`, `createApprovalRequest()`, `approveRequest()`, `rejectRequest()`, `escalateRequest()`, `addComment()`, `getPendingApprovalsForUser()`, `getApprovalsByType()`, `getApprovalRequest()`, `expirePendingRequests()`, `getApprovalStats()` |
| `lib/db/audit-logs.ts` | Audit log creation and querying | `createAuditLog()`, `getAuditLogsByResource()`, `getAuditLogsByBranch()`, `getAuditLogsByUser()`, `getRecentAuditLogs()` |
| `lib/db/schema.ts` (lines 1528-1577) | Audit log types | `AuditLogAction` (includes `'create'`, `'update'`, `'approve'`, `'reject'`), `AuditLog` |
| `lib/validations/orders.ts` (lines 274-299) | Zod validation for voucher creation | `voucherDiscountTypeEnum`, `createVoucherSchema`, `CreateVoucherInput` |
| `lib/receipts/qr-generator.ts` (lines 184-207) | QR code generation for vouchers | `generateVoucherQRCode()` -- encodes URL `${baseUrl}/pos?voucher=${voucherCode}` with `errorCorrectionLevel: 'Q'` |
| `services/wati.ts` | WhatsApp notification service | `sendWhatsAppMessage()`, `formatPhoneNumber()`, `isValidKenyanPhoneNumber()`, `mapTemplateToNotificationType()`, `createMessageFromTemplate()` |
| `lib/db/index.ts` | Database helper functions | `getDocument()`, `getDocuments()`, `setDocument()`, `updateDocument()`, `generateId()`, `DatabaseError` |
| `lib/reports/export-excel.ts` | Excel export utility | `exportTransactionsToExcel()`, `exportPaymentReport()` |
| `lib/reports/export-pdf.ts` | PDF export utility | `exportTransactionsToPDF()`, `exportPaymentReportPDF()` |

### Related Pages

| Page Path | Purpose |
|-----------|---------|
| `app/(dashboard)/auditor/audit-logs/page.tsx` | Audit log viewer with voucher filter category (line 87: `{ value: 'voucher', label: 'Vouchers' }`) |
| `app/(dashboard)/director/approvals/page.tsx` | Director approval queue (includes voucher approval requests) |
| `app/(dashboard)/gm/requests/page.tsx` | GM request queue (includes voucher approval requests) |

### Schema Discrepancy Note

There are two Voucher interface definitions with slightly different field names:

1. **`lib/db/vouchers.ts`** (operational): Uses `maxDiscountAmount`, `minOrderValue`, `validBranchId`, `customerId`, `customerName`, `usedByCustomerId`, `usedByCustomerName`, `usedOnOrderId`, `usedAt`, `discountedAmount`
2. **`lib/db/schema.ts`** (schema reference): Uses `minOrderAmount`, `purpose`, `usedByCustomer`, `usedByCustomerName`, `usedDate`, `usedOnOrder`

The `lib/db/vouchers.ts` version is authoritative for runtime behavior. A reconciliation task should align `schema.ts` field names with the operational version. This spec uses the `vouchers.ts` field names throughout.

---

## 4. Requirements

### 4.1 Voucher Creation

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-001 | System shall generate unique voucher codes in format `LDC` + 8 alphanumeric characters (excluding ambiguous chars O/0/I/1) using `generateVoucherCode()` | `[EXISTING]` | P0 |
| FR-M6-002 | System shall generate unique voucher IDs in format `VCH-[timestamp36]-[random6]` using `generateVoucherId()` | `[EXISTING]` | P0 |
| FR-M6-003 | System shall support `percentage` and `fixed` discount types (`VoucherDiscountType`) | `[EXISTING]` | P0 |
| FR-M6-004 | Percentage discount shall be capped at 50% (`VOUCHER_CONFIG.maxPercentage`) | `[EXISTING]` | P0 |
| FR-M6-005 | Fixed discount shall be capped at KES 5,000 (`VOUCHER_CONFIG.maxFixedAmount`) | `[EXISTING]` | P0 |
| FR-M6-006 | Voucher shall support optional `maxDiscountAmount` cap for percentage discounts | `[EXISTING]` | P1 |
| FR-M6-007 | Voucher shall support optional `minOrderValue` threshold | `[EXISTING]` | P1 |
| FR-M6-008 | Voucher shall support optional customer-specific assignment via `customerId` | `[EXISTING]` | P1 |
| FR-M6-009 | Voucher shall support optional branch-specific restriction via `validBranchId` | `[EXISTING]` | P1 |
| FR-M6-010 | Default expiry shall be 30 days from creation (`VOUCHER_CONFIG.defaultExpiryDays`), configurable per voucher | `[EXISTING]` | P0 |
| FR-M6-011 | System shall generate QR code for each approved voucher encoding URL `${portalBaseUrl}/pos?voucher=${voucherCode}` via `generateVoucherQRCode()` | `[EXISTING]` | P1 |
| FR-M6-012 | System shall validate voucher creation input against `createVoucherSchema` Zod schema: code 4-20 chars uppercase alphanumeric, positive discount value, percentage 1-100 range | `[EXISTING]` | P0 |
| FR-M6-013 | System shall support bulk voucher generation from a template: specify template ID, quantity (1-10,000), and optional customer segment filter | `[NEW]` | P1 |
| FR-M6-014 | System shall support voucher templates: reusable configurations defining discount type, value, max discount, min order value, expiry days, description, and branch restrictions | `[NEW]` | P1 |
| FR-M6-015 | System shall support `free_service` discount type: voucher covers a specific service category entirely | `[NEW]` | P2 |
| FR-M6-016 | System shall support `loyalty_reward` discount type: voucher auto-generated when customer reaches loyalty milestones | `[NEW]` | P2 |

### 4.2 Approval Workflow (Direct Approval)

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-020 | Vouchers with percentage > 20% or fixed > KES 1,000 shall require approval (`VOUCHER_CONFIG.approvalThreshold`) | `[EXISTING]` | P0 |
| FR-M6-021 | Below-threshold vouchers shall be auto-approved with creator as approver | `[EXISTING]` | P0 |
| FR-M6-022 | Approval workflow shall route to `general_manager` tier for amounts >= KES 0, and `director` tier for amounts >= KES 5,000 (`WORKFLOW_CONFIGS.voucher.amountThresholds`) | `[EXISTING]` | P0 |
| FR-M6-023 | Approver role capability shall be determined by `canApprove()` using `ROLE_TO_TIER` mapping and `TIER_HIERARCHY` ordering: `['manager', 'general_manager', 'director', 'admin']` | `[EXISTING]` | P0 |
| FR-M6-024 | Each approval action (approve, reject, escalate, comment) shall be recorded in `ApprovalHistoryEntry` with tier, userId, userName, action, comment, timestamp | `[EXISTING]` | P0 |
| FR-M6-025 | Approval requests shall auto-expire after 48 hours (`WORKFLOW_CONFIGS.voucher.defaultExpiryHours`) via `expirePendingRequests()` | `[EXISTING]` | P0 |
| FR-M6-026 | Rejected vouchers shall record rejection reason and set voucher status to `cancelled` | `[EXISTING]` | P0 |
| FR-M6-027 | Escalation shall advance the request to the next tier in `TIER_HIERARCHY` via `escalateRequest()`, temporarily setting status to `escalated` then back to `pending` | `[EXISTING]` | P1 |
| FR-M6-028 | Approval notification channels: `['in_app', 'email']` as defined in `WORKFLOW_CONFIGS.voucher.notifyChannels` | `[EXISTING]` | P1 |
| FR-M6-029 | System shall auto-escalate approval requests to the next tier after 24 hours without action (half the expiry window) | `[NEW]` | P1 |
| FR-M6-030 | Bulk campaign voucher approvals shall be batched: approving the campaign approves all constituent vouchers | `[NEW]` | P1 |
| FR-M6-031 | System shall display approval queue badge count on GM and Director sidebar items | `[NEW]` | P1 |

### 4.3 Voucher Redemption

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-040 | System shall validate voucher by code via `validateVoucher()` checking: approval status, used status, active status, expiry date, minimum order value, branch validity, customer assignment | `[EXISTING]` | P0 |
| FR-M6-041 | Discount calculation: percentage type applies `orderTotal * (discountValue / 100)` capped by `maxDiscountAmount`; fixed type applies `min(discountValue, orderTotal)` | `[EXISTING]` | P0 |
| FR-M6-042 | Redemption via `redeemVoucher()` shall set `isUsed=true`, `status='used'`, record `usedByCustomerId`, `usedByCustomerName`, `usedOnOrderId`, `usedAt`, `discountedAmount` | `[EXISTING]` | P0 |
| FR-M6-043 | POS shall support QR code scanning to populate voucher code field | `[EXISTING]` | P1 |
| FR-M6-044 | POS shall support manual voucher code entry | `[EXISTING]` | P0 |
| FR-M6-045 | Customer portal shall support voucher application at online checkout | `[NEW]` | P2 |
| FR-M6-046 | Voucher stacking: by default, only one voucher per order. System shall reject second voucher application with error "Only one voucher per order allowed" | `[NEW]` | P1 |
| FR-M6-047 | If an order with a voucher is cancelled, system shall auto-void the voucher usage and restore voucher to `active` status | `[NEW]` | P1 |

### 4.4 Voucher Distribution

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-050 | Manual distribution: staff issues voucher code to customer verbally, via printed receipt, or shown on screen with QR code | `[EXISTING]` | P0 |
| FR-M6-051 | WhatsApp distribution: send voucher code and QR image to customer via `voucher_issued` template | `[NEW]` | P1 |
| FR-M6-052 | Campaign distribution: batch-send vouchers to targeted customer segment via WhatsApp with rate limiting (max 100 messages/minute, per Wati.io limits) | `[NEW]` | P1 |
| FR-M6-053 | Customer portal distribution: voucher automatically appears in customer's voucher wallet upon creation/approval | `[NEW]` | P2 |

### 4.5 Campaign Management

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-060 | System shall support campaign creation: name, description, template reference, target segment, distribution channel, start/end dates, budget cap | `[NEW]` | P1 |
| FR-M6-061 | Campaign shall auto-generate vouchers based on template for each targeted customer | `[NEW]` | P1 |
| FR-M6-062 | Campaign targeting rules: by customer segment (`regular`, `vip`, `corporate`), by branch, by order count range, by total spend range, by days since last order | `[NEW]` | P1 |
| FR-M6-063 | Campaign budget tracking: sum of maximum potential discount across all campaign vouchers shall not exceed budget cap | `[NEW]` | P1 |
| FR-M6-064 | Campaign status lifecycle: `draft` -> `pending_approval` -> `approved`/`rejected` -> `active` -> `completed`/`cancelled` | `[NEW]` | P1 |
| FR-M6-065 | Campaign dashboard: total vouchers generated, distributed, redeemed, expired, total discount given, campaign ROI | `[NEW]` | P1 |

### 4.6 Voucher Templates

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-070 | System shall support template CRUD: create, read, update, archive templates | `[NEW]` | P1 |
| FR-M6-071 | Template fields: name, description, discount type, discount value, max discount amount, min order value, expiry days, valid branch ID, approval required override | `[NEW]` | P1 |
| FR-M6-072 | Templates shall be versioned: updates create new version, existing vouchers retain original template version | `[NEW]` | P2 |
| FR-M6-073 | System shall provide pre-built templates: "Complaint Resolution 10%", "VIP Holiday 20%", "Loyalty Milestone 15%", "New Customer Welcome 5%" | `[NEW]` | P2 |

### 4.7 Voucher Analytics

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-080 | System shall calculate voucher statistics: total, pending, approved, rejected, used, expired, total discounted amount via `getVoucherStats()` | `[EXISTING]` | P0 |
| FR-M6-081 | System shall calculate redemption rate: `(used / (approved - expired)) * 100` | `[NEW]` | P1 |
| FR-M6-082 | System shall track campaign ROI: `(revenue from orders with campaign vouchers - total discount given) / total discount given * 100` | `[NEW]` | P1 |
| FR-M6-083 | System shall track discount cost over time: daily/weekly/monthly sum of `discountedAmount` across all redeemed vouchers | `[NEW]` | P1 |
| FR-M6-084 | System shall provide approval workflow analytics: average approval time, approval rate, escalation rate via `getApprovalStats()` | `[EXISTING]` | P1 |
| FR-M6-085 | Analytics shall support date range filtering and branch filtering | `[NEW]` | P1 |

### 4.8 AI-Recommended Campaigns

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M6-090 | AI agent shall analyze customer purchase patterns and recommend campaign parameters: target segment, discount percentage, expected redemption rate | `[NEW]` | P2 |
| FR-M6-091 | AI shall predict campaign ROI before launch based on historical redemption data | `[NEW]` | P2 |
| FR-M6-092 | AI recommendations shall be presented as suggestions on the campaign creation form, not auto-applied | `[NEW]` | P2 |
| FR-M6-093 | AI-recommended campaigns shall be tagged with `source: 'ai_recommended'` for tracking effectiveness | `[NEW]` | P2 |

---

## 5. Data Model

### 5.1 Existing: Voucher Interface

**Source:** `lib/db/vouchers.ts` lines 37-94

```typescript
export interface Voucher {
  /** Unique voucher ID (internal) — Format: VCH-[timestamp36]-[random6] */
  voucherId: string;
  /** Human-readable voucher code (for customer use) — Format: LDC + 8 chars */
  voucherCode: string;
  /** QR code data URL (base64 PNG) */
  qrCodeData?: string;
  /** Type of discount */
  discountType: VoucherDiscountType;           // 'percentage' | 'fixed'
  /** Discount value (percentage or fixed amount in KES) */
  discountValue: number;
  /** Maximum discount amount (for percentage type) */
  maxDiscountAmount?: number;
  /** Minimum order value to apply voucher */
  minOrderValue?: number;
  /** Description of the voucher */
  description?: string;
  /** Branch ID this voucher is valid for (null = all branches) */
  validBranchId?: string;
  /** Customer ID if voucher is customer-specific */
  customerId?: string;
  /** Customer name (denormalized) */
  customerName?: string;
  /** User ID who created the voucher */
  createdBy: string;
  /** Creator name (denormalized) */
  createdByName: string;
  /** Approval status */
  approvalStatus: VoucherApprovalStatus;       // 'pending' | 'approved' | 'rejected'
  /** User ID who approved/rejected */
  approvedBy?: string;
  /** Approver name (denormalized) */
  approvedByName?: string;
  /** Approval timestamp */
  approvedAt?: Timestamp;
  /** Rejection reason */
  rejectionReason?: string;
  /** Voucher status */
  status: VoucherStatus;                       // 'active' | 'used' | 'expired' | 'cancelled'
  /** Expiry date */
  expiryDate: Timestamp;
  /** Whether voucher has been used */
  isUsed: boolean;
  /** Customer who used the voucher */
  usedByCustomerId?: string;
  /** Customer name who used it */
  usedByCustomerName?: string;
  /** Order where voucher was applied */
  usedOnOrderId?: string;
  /** Timestamp when voucher was used */
  usedAt?: Timestamp;
  /** Amount actually discounted */
  discountedAmount?: number;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}
```

**Firestore collection:** `vouchers`
**Document ID:** `voucherId`

### 5.2 Existing: Voucher Enums

**Source:** `lib/db/vouchers.ts` lines 22-32

```typescript
export type VoucherDiscountType = 'percentage' | 'fixed';
export type VoucherApprovalStatus = 'pending' | 'approved' | 'rejected';
export type VoucherStatus = 'active' | 'used' | 'expired' | 'cancelled';
```

### 5.3 Existing: Voucher Configuration

**Source:** `lib/db/vouchers.ts` lines 109-124

```typescript
export const VOUCHER_CONFIG = {
  defaultExpiryDays: 30,
  maxPercentage: 50,
  maxFixedAmount: 5000,
  approvalThreshold: {
    percentage: 20,     // >20% requires approval
    fixed: 1000,        // >KES 1,000 requires approval
  },
  codeLength: 8,
  codePrefix: 'LDC',
};
```

### 5.4 Existing: VoucherValidationResult

**Source:** `lib/db/vouchers.ts` lines 99-104

```typescript
export interface VoucherValidationResult {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: number;
  error?: string;
}
```

### 5.5 Existing: ApprovalRequest Interface

**Source:** `lib/workflows/approval.ts` lines 45-92

```typescript
export interface ApprovalRequest {
  id: string;
  type: ApprovalType;                          // 'voucher' | 'cash_out' | 'disposal' | ...
  status: ApprovalStatus;                      // 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired'
  currentTier: ApprovalTier;                   // 'manager' | 'general_manager' | 'director' | 'admin'
  amount?: number;
  entityId?: string;                           // voucherId for voucher approvals
  entityType?: string;                         // 'voucher'
  description: string;
  reason: string;
  requestedBy: string;
  requestedByName: string;
  branchId: string;
  branchName?: string;
  approvalHistory: ApprovalHistoryEntry[];
  finalApprover?: string;
  finalApproverName?: string;
  finalDecisionDate?: Timestamp;
  rejectionReason?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Timestamp;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestore collection:** `approval_requests`

### 5.6 Existing: Voucher Workflow Configuration

**Source:** `lib/workflows/approval.ts` lines 139-150

```typescript
WORKFLOW_CONFIGS.voucher = {
  type: 'voucher',
  displayName: 'Voucher Approval',
  tiers: ['general_manager', 'director'],
  amountThresholds: [
    { tier: 'general_manager', minAmount: 0 },
    { tier: 'director', minAmount: 5000 },
  ],
  defaultExpiryHours: 48,
  autoExpire: true,
  notifyChannels: ['in_app', 'email'],
};
```

### 5.7 Existing: Approval History Entry

**Source:** `lib/workflows/approval.ts` lines 97-110

```typescript
export interface ApprovalHistoryEntry {
  tier: ApprovalTier;
  userId: string;
  userName: string;
  action: 'approve' | 'reject' | 'escalate' | 'comment';
  comment?: string;
  timestamp: Timestamp;
}
```

### 5.8 Existing: AuditLog Interface

**Source:** `lib/db/schema.ts` lines 1545-1577

```typescript
export interface AuditLog {
  auditLogId: string;
  action: AuditLogAction;        // 'create' | 'update' | 'approve' | 'reject' | ...
  resourceType: string;           // 'voucher' for voucher actions
  resourceId: string;             // voucherId
  performedBy: string;
  performedByName: string;
  performedByRole: UserRole;
  branchId?: string;
  additionalBranchIds?: string[];
  description: string;
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}
```

### 5.9 NEW: VoucherTemplate Interface

**Proposed Firestore collection:** `voucherTemplates`

```typescript
export interface VoucherTemplate {
  /** Unique template ID */
  templateId: string;
  /** Template name (e.g., "VIP Holiday 20%") */
  name: string;
  /** Template description */
  description: string;
  /** Discount type */
  discountType: VoucherDiscountType;        // 'percentage' | 'fixed'
  /** Discount value */
  discountValue: number;
  /** Maximum discount amount (for percentage) */
  maxDiscountAmount?: number;
  /** Minimum order value required */
  minOrderValue?: number;
  /** Default expiry in days from voucher creation */
  expiryDays: number;
  /** Branch restriction (null = all branches) */
  validBranchId?: string;
  /** Whether vouchers from this template require approval regardless of threshold */
  forceApproval: boolean;
  /** Template category for organization */
  category: 'complaint_resolution' | 'promotional' | 'loyalty' | 'seasonal' | 'custom';
  /** Whether template is active and available for use */
  isActive: boolean;
  /** Template version number */
  version: number;
  /** User who created the template */
  createdBy: string;
  /** Creator name (denormalized) */
  createdByName: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
}
```

### 5.10 NEW: VoucherCampaign Interface

**Proposed Firestore collection:** `voucherCampaigns`

```typescript
export type CampaignStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'
  | 'active' | 'completed' | 'cancelled';

export type CampaignDistributionChannel = 'manual' | 'whatsapp' | 'customer_portal' | 'email';

export interface CampaignTargetingRules {
  /** Customer segments to target */
  segments?: ('regular' | 'vip' | 'corporate')[];
  /** Branch IDs to target (null = all branches) */
  branchIds?: string[];
  /** Minimum total orders placed */
  minOrderCount?: number;
  /** Maximum total orders placed */
  maxOrderCount?: number;
  /** Minimum total spend (KES) */
  minTotalSpend?: number;
  /** Maximum total spend (KES) */
  maxTotalSpend?: number;
  /** Minimum days since last order */
  minDaysSinceLastOrder?: number;
  /** Maximum days since last order */
  maxDaysSinceLastOrder?: number;
}

export interface VoucherCampaign {
  /** Unique campaign ID */
  campaignId: string;
  /** Campaign name */
  name: string;
  /** Campaign description */
  description: string;
  /** Template used for voucher generation */
  templateId: string;
  /** Template name (denormalized) */
  templateName: string;
  /** Campaign status */
  status: CampaignStatus;
  /** Distribution channel */
  distributionChannel: CampaignDistributionChannel;
  /** Targeting rules */
  targetingRules: CampaignTargetingRules;
  /** Campaign start date */
  startDate: Timestamp;
  /** Campaign end date */
  endDate: Timestamp;
  /** Maximum budget cap (KES) — sum of max potential discounts */
  budgetCap: number;
  /** Actual discount given so far */
  actualDiscountGiven: number;
  /** Number of vouchers generated */
  vouchersGenerated: number;
  /** Number of vouchers distributed (sent to customers) */
  vouchersDistributed: number;
  /** Number of vouchers redeemed */
  vouchersRedeemed: number;
  /** Number of vouchers expired unused */
  vouchersExpired: number;
  /** Total revenue from orders that used campaign vouchers */
  revenueGenerated: number;
  /** Source of campaign creation */
  source: 'manual' | 'ai_recommended';
  /** AI recommendation confidence score (0-1, if source='ai_recommended') */
  aiConfidenceScore?: number;
  /** Associated approval request ID */
  approvalRequestId?: string;
  /** Branch ID where campaign was created */
  branchId?: string;
  /** User who created the campaign */
  createdBy: string;
  /** Creator name (denormalized) */
  createdByName: string;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
}
```

### 5.11 NEW: VoucherAnalytics Interface (Computed, Not Stored)

This interface represents the shape of analytics data computed on-the-fly from the `vouchers` and `voucherCampaigns` collections. It is not stored as a separate Firestore collection.

```typescript
export interface VoucherAnalytics {
  /** Period covered */
  period: { start: Date; end: Date };
  /** Branch filter applied (null = all) */
  branchId?: string;
  /** Total vouchers created in period */
  totalCreated: number;
  /** Total approved */
  totalApproved: number;
  /** Total rejected */
  totalRejected: number;
  /** Total redeemed */
  totalRedeemed: number;
  /** Total expired unused */
  totalExpired: number;
  /** Redemption rate: redeemed / (approved - expired that were never active) */
  redemptionRate: number;
  /** Total discount amount given (sum of discountedAmount) */
  totalDiscountGiven: number;
  /** Average discount per voucher (totalDiscountGiven / totalRedeemed) */
  averageDiscountPerVoucher: number;
  /** Total revenue from voucher orders */
  totalRevenueFromVoucherOrders: number;
  /** Campaign ROI: (revenueFromVoucherOrders - totalDiscountGiven) / totalDiscountGiven */
  campaignROI: number;
  /** Average approval time in hours */
  averageApprovalTimeHours: number;
  /** Approval rate: approved / (approved + rejected) */
  approvalRate: number;
  /** Escalation rate: escalated / total approval requests */
  escalationRate: number;
  /** Breakdown by discount type */
  byDiscountType: {
    percentage: { count: number; totalDiscount: number };
    fixed: { count: number; totalDiscount: number };
  };
  /** Breakdown by campaign */
  byCampaign: {
    campaignId: string;
    campaignName: string;
    vouchersGenerated: number;
    vouchersRedeemed: number;
    redemptionRate: number;
    totalDiscount: number;
    revenue: number;
    roi: number;
  }[];
}
```

### 5.12 NEW: Voucher Field Extensions

The following optional fields are added to the existing `Voucher` interface for campaign and template support:

```typescript
// Added to Voucher interface
{
  /** Campaign ID if voucher was generated by a campaign */
  campaignId?: string;
  /** Campaign name (denormalized) */
  campaignName?: string;
  /** Template ID used to create this voucher */
  templateId?: string;
  /** Template name (denormalized) */
  templateName?: string;
  /** Distribution channel used */
  distributionChannel?: CampaignDistributionChannel;
  /** Whether voucher notification was sent to customer */
  notificationSent?: boolean;
  /** Notification timestamp */
  notificationSentAt?: Timestamp;
}
```

These fields are optional and backward-compatible. Existing vouchers without these fields will continue to function normally.

---

## 6. State Machine / Workflows

### 6.1 Voucher Lifecycle State Machine

```
                    +-----------+
                    |   draft   |  (NEW: only for campaign-generated vouchers)
                    +-----+-----+
                          |
                    createVoucher()
                          |
            +-------------+-------------+
            |                           |
    requiresApproval()=true    requiresApproval()=false
            |                           |
  +---------v---------+     +-----------v-----------+
  | pending_approval  |     |        active         |
  | (approvalStatus=  |     | (approvalStatus=      |
  |  'pending')       |     |  'approved',          |
  +---+-------+---+---+     |  auto-approved by     |
      |       |   |          |  creator)             |
      |       |   |          +-----------+-----------+
      |       |   |                      |
  approve  reject expire         validateVoucher() +
      |       |   |              redeemVoucher()
      |       |   |                      |
  +---v---+   |   |              +-------v-------+
  | active|   |   |              |     used      |
  +---+---+   |   |              | (isUsed=true, |
      |       |   |              |  status='used')|
      |   +---v---v---+          +---------------+
      |   | cancelled |
      |   | (status=  |
      |   | 'cancelled'|
      |   +-----------+
      |
      +----> expireVouchers() ----> +----------+
      |                             |  expired  |
      +----> cancelVoucher() -----> | (status=  |
                                    | 'expired')|
                                    +----------+
```

**Valid State Transitions:**

| From | To | Trigger | Side Effects |
|------|----|---------|-------------|
| `draft` | `pending_approval` | Campaign generation triggers `createVoucher()` with approval required | Creates `ApprovalRequest` in `approval_requests` collection |
| `draft` | `active` | Campaign generation with auto-approve threshold met | Sets `approvedBy` = creator, `approvedAt` = now |
| `pending_approval` | `active` | `approveVoucher()` called by authorized approver | Sets `approvedBy`, `approvedByName`, `approvedAt`; generates QR code |
| `pending_approval` | `cancelled` | `rejectVoucher()` called by authorized approver | Sets `rejectionReason`, `approvalStatus` = `'rejected'`, `status` = `'cancelled'` |
| `pending_approval` | `cancelled` | `expirePendingRequests()` -- 48hr timeout | Approval request status set to `'expired'` |
| `active` | `used` | `redeemVoucher()` called at POS | Sets `isUsed`, `usedByCustomerId`, `usedOnOrderId`, `usedAt`, `discountedAmount` |
| `active` | `expired` | `expireVouchers()` scheduled function | Checks `expiryDate < now` for all `active` vouchers |
| `active` | `cancelled` | `cancelVoucher()` called by authorized user | Sets `status` = `'cancelled'`, optional `rejectionReason` |
| `used` | `active` | [NEW] Order cancellation triggers voucher restoration | Clears `isUsed`, `usedByCustomerId`, `usedOnOrderId`, `usedAt`, `discountedAmount`; restores `status` = `'active'` |

**Invalid Transitions (must be rejected):**

- `used` -> `cancelled` (cannot cancel a used voucher -- enforced by `cancelVoucher()` line 420)
- `expired` -> `active` (expired vouchers cannot be reactivated)
- `cancelled` -> `active` (cancelled vouchers cannot be reactivated)
- `pending_approval` -> `used` (must be approved before use)

### 6.2 Approval Flow State Machine

**Source:** `lib/workflows/approval.ts`

```
              createApprovalRequest()
                       |
                       v
                  +---------+
                  | pending  |  (currentTier = getRequiredTier())
                  +---+--+--+
                      |  |  |
           approve    |  |  |  expire (48h)
                      |  |  |
     +----------------+  |  +----------------+
     |                   |                   |
     v                reject              v
+---------+              |           +---------+
| approved|              v           | expired |
+---------+        +-----------+     +---------+
                   | rejected  |
                   +-----------+

                  escalateRequest()
                       |
                       v
                  +-----------+
                  | escalated |  (momentary -- immediately set back to 'pending'
                  +-----------+   with currentTier advanced to next in TIER_HIERARCHY)
                       |
                       v
                  +---------+
                  | pending  |  (currentTier = TIER_HIERARCHY[previousIndex + 1])
                  +---------+
```

**Tier Hierarchy:** `['manager', 'general_manager', 'director', 'admin']`

**Escalation Logic (from `escalateRequest()` lines 428-478):**

1. Get `currentTierIndex` from `TIER_HIERARCHY.indexOf(request.currentTier)`
2. Compute `nextTierIndex = currentTierIndex + 1`
3. If `nextTierIndex >= TIER_HIERARCHY.length`, throw error "Cannot escalate further"
4. Set `currentTier = TIER_HIERARCHY[nextTierIndex]`
5. Add `ApprovalHistoryEntry` with `action: 'escalate'`
6. Set status to `'escalated'` then immediately back to `'pending'`

**Who Can Approve (from `canApprove()` lines 274-289):**

```
userTierIndex = TIER_HIERARCHY.indexOf(ROLE_TO_TIER[userRole])
requiredTierIndex = TIER_HIERARCHY.indexOf(request.currentTier)
canApprove = userTierIndex >= requiredTierIndex
```

Role-to-tier mapping from `ROLE_TO_TIER` (lines 221-237):
- `admin` -> `'admin'`
- `director` -> `'director'`
- `general_manager` -> `'general_manager'`
- `store_manager` -> `'manager'`
- `manager` -> `'manager'`
- `finance_manager` -> `'manager'`
- `logistics_manager` -> `'manager'`
- All other roles -> `null` (cannot approve)

---

## 7. API Specification

### 7.1 Existing Endpoints

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/vouchers` | `createVoucher()` | Create a new voucher. Returns `{ voucherId, voucherCode, requiresApproval }` |
| GET | `/api/vouchers/:voucherId` | `getVoucherById()` | Get voucher by internal ID |
| GET | `/api/vouchers/code/:code` | `getVoucherByCode()` | Get voucher by human-readable code |
| PUT | `/api/vouchers/:voucherId/approve` | `approveVoucher()` | Approve a pending voucher |
| PUT | `/api/vouchers/:voucherId/reject` | `rejectVoucher()` | Reject a pending voucher with reason |
| POST | `/api/vouchers/validate` | `validateVoucher()` | Validate voucher for an order. Body: `{ voucherCode, orderTotal, customerId?, branchId? }` |
| POST | `/api/vouchers/:voucherId/redeem` | `redeemVoucher()` | Apply voucher to order. Body: `{ orderId, customerId, customerName, discountedAmount }` |
| PUT | `/api/vouchers/:voucherId/cancel` | `cancelVoucher()` | Cancel an active voucher |
| GET | `/api/vouchers/pending` | `getPendingVouchers()` | Get vouchers pending approval. Query: `?branchId=` |
| GET | `/api/vouchers/active` | `getActiveVouchers()` | Get active approved vouchers. Query: `?branchId=` |
| GET | `/api/vouchers/customer/:customerId` | `getCustomerVouchers()` | Get customer's active vouchers |
| GET | `/api/vouchers/stats` | `getVoucherStats()` | Get voucher statistics. Query: `?startDate=&endDate=` |
| PUT | `/api/vouchers/:voucherId/qr` | `updateVoucherQRCode()` | Update QR code data for voucher |

### 7.2 Existing Approval Endpoints

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/approvals` | `createApprovalRequest()` | Create approval request |
| GET | `/api/approvals/:requestId` | `getApprovalRequest()` | Get approval request by ID |
| PUT | `/api/approvals/:requestId/approve` | `approveRequest()` | Approve a request |
| PUT | `/api/approvals/:requestId/reject` | `rejectRequest()` | Reject a request |
| PUT | `/api/approvals/:requestId/escalate` | `escalateRequest()` | Escalate to next tier |
| POST | `/api/approvals/:requestId/comment` | `addComment()` | Add comment to request |
| GET | `/api/approvals/pending` | `getPendingApprovalsForUser()` | Get pending approvals for current user's role |
| GET | `/api/approvals/type/:type` | `getApprovalsByType()` | Get approvals by type (e.g., `voucher`) |
| GET | `/api/approvals/stats` | `getApprovalStats()` | Get approval statistics |

### 7.3 NEW: Bulk & Campaign Endpoints

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| POST | `/api/vouchers/bulk` | Bulk generate vouchers from template | `{ templateId, quantity, customerId[]?, branchId?, campaignId? }` | `{ voucherIds: string[], requiresApproval: boolean }` |
| POST | `/api/vouchers/:voucherId/restore` | Restore a used voucher (order cancellation) | `{ orderId, reason }` | `{ success: boolean }` |
| POST | `/api/campaigns` | Create a new campaign | `VoucherCampaign` (partial) | `{ campaignId }` |
| GET | `/api/campaigns/:campaignId` | Get campaign details | -- | `VoucherCampaign` |
| PUT | `/api/campaigns/:campaignId` | Update campaign (draft only) | Partial `VoucherCampaign` | `{ success: boolean }` |
| POST | `/api/campaigns/:campaignId/submit` | Submit campaign for approval | -- | `{ approvalRequestId }` |
| POST | `/api/campaigns/:campaignId/launch` | Launch approved campaign (generate + distribute) | -- | `{ vouchersGenerated, vouchersDistributed }` |
| PUT | `/api/campaigns/:campaignId/cancel` | Cancel a campaign | `{ reason }` | `{ success: boolean }` |
| GET | `/api/campaigns` | List campaigns | Query: `?status=&branchId=&page=&limit=` | `{ campaigns: VoucherCampaign[], total }` |
| GET | `/api/campaigns/:campaignId/analytics` | Get campaign analytics | Query: `?startDate=&endDate=` | Campaign-specific analytics |
| POST | `/api/templates` | Create voucher template | `VoucherTemplate` (partial) | `{ templateId }` |
| GET | `/api/templates` | List voucher templates | Query: `?category=&isActive=` | `{ templates: VoucherTemplate[] }` |
| GET | `/api/templates/:templateId` | Get template details | -- | `VoucherTemplate` |
| PUT | `/api/templates/:templateId` | Update template | Partial `VoucherTemplate` | `{ success: boolean, newVersion }` |
| PUT | `/api/templates/:templateId/archive` | Archive template (soft delete) | -- | `{ success: boolean }` |
| GET | `/api/vouchers/analytics` | Get voucher analytics dashboard data | Query: `?startDate=&endDate=&branchId=` | `VoucherAnalytics` |
| GET | `/api/vouchers/analytics/export/excel` | Export voucher analytics to Excel | Query: `?startDate=&endDate=&branchId=` | Excel file download |
| GET | `/api/vouchers/analytics/export/pdf` | Export voucher analytics to PDF | Query: `?startDate=&endDate=&branchId=` | PDF file download |

---

## 8. UI Specification

### 8.1 Existing Components

No dedicated voucher UI components currently exist in `components/features/`. Voucher functionality is currently accessed through:

- The auditor audit-logs page with a voucher filter category
- The director approvals page (`app/(dashboard)/director/approvals/page.tsx`)
- The GM requests page (`app/(dashboard)/gm/requests/page.tsx`)

### 8.2 NEW: Page Routes

| Route | Role | Sidebar Section | Page Title | Description |
|-------|------|----------------|------------|-------------|
| `/director/vouchers` | Director | MODULES | Voucher & Campaign Analytics | Campaign performance, redemption trends, ROI dashboards, approval queue summary |
| `/gm/vouchers` | General Manager | OPERATIONS | Voucher Approvals | Pending approval queue, active vouchers table, quick approve/reject |

### 8.3 NEW: Director Vouchers Page (`/director/vouchers`)

**Layout:** Full-width dashboard with tabbed sections

**Tab 1: Overview**
- KPI Cards row:
  - Total Active Vouchers (count)
  - Redemption Rate (percentage gauge)
  - Total Discount Given (KES, current month)
  - Campaign ROI (percentage)
- Redemption Rate Over Time (line chart, daily for past 30 days)
- Discount Cost Tracking (area chart, weekly for past 12 weeks)

**Tab 2: Campaigns**
- Campaign Performance Comparison (horizontal bar chart: vouchers generated vs redeemed per campaign)
- Campaign ROI Table:
  - Campaign Name | Status | Vouchers | Redeemed | Discount Given | Revenue Generated | ROI
- Create Campaign button -> Campaign Builder modal/page

**Tab 3: Analytics**
- Voucher Distribution by Type (donut chart: percentage vs fixed vs free_service vs loyalty_reward)
- Revenue Impact Analysis (stacked bar: revenue with voucher orders vs total revenue, by week)
- Top Campaigns by ROI (ranked list)
- Approval Queue Summary: pending count, avg approval time, escalation rate

**Tab 4: Templates**
- Templates table: Name | Category | Discount | Expiry Days | Active | Created
- Create Template button
- Edit/Archive actions per row

**Export:** Excel/PDF export button on each tab

### 8.4 NEW: GM Vouchers Page (`/gm/vouchers`)

**Layout:** Two-column (60/40) or tabbed

**Section 1: Pending Approvals (primary)**
- List of pending voucher approval requests, sorted by creation date ascending (oldest first)
- Each card shows:
  - Voucher code
  - Discount type and value (e.g., "20% off" or "KES 500 off")
  - Requested by (name, role)
  - Customer name (if customer-specific)
  - Branch
  - Created date, time remaining before expiry
  - Approval history (collapsible)
- Actions per card:
  - Approve (green button)
  - Reject (red button -> reason input modal)
  - Escalate (yellow button -> confirm dialog)
  - Comment (text input)

**Section 2: Active Vouchers**
- Filterable table of active vouchers:
  - Code | Type | Value | Customer | Branch | Expiry | Created By
- Actions: View details, Cancel
- Filter by: branch, discount type, date range, customer-specific vs generic

**Section 3: Recently Processed**
- Table of recently approved/rejected vouchers (last 30 days)
- Shows decision, approver, timestamp

**Badge:** Sidebar item for GM vouchers page shows pending approval count as a red badge number.

### 8.5 NEW: Campaign Builder Component

**Step 1: Basic Info**
- Campaign name (text input)
- Description (textarea)
- Template selection (dropdown of active templates, or create new)
- Distribution channel (radio: Manual, WhatsApp, Customer Portal, Email)

**Step 2: Targeting**
- Customer segment checkboxes (Regular, VIP, Corporate)
- Branch selection (multi-select, or "All Branches")
- Order count range (min/max sliders)
- Total spend range (min/max inputs)
- Days since last order range (min/max inputs)
- Preview: "This campaign will target approximately N customers"

**Step 3: Schedule & Budget**
- Start date (date picker)
- End date (date picker)
- Budget cap (KES input)
- Estimated total discount (calculated from template value * target customer count)
- Warning if estimated discount exceeds budget cap

**Step 4: Review & Submit**
- Summary of all selections
- Submit for Approval button (creates approval request)
- Save as Draft button

### 8.6 NEW: Template Editor Component

- Template name (text input)
- Category (dropdown: Complaint Resolution, Promotional, Loyalty, Seasonal, Custom)
- Discount type (radio: Percentage, Fixed Amount)
- Discount value (number input, with validation per type)
- Max discount amount (number input, shown only for percentage type)
- Min order value (number input, optional)
- Expiry days (number input, default 30)
- Branch restriction (dropdown, optional)
- Force approval (checkbox: "Always require approval regardless of threshold")
- Save Template button

### 8.7 NEW: Customer Portal -- Voucher Wallet

**Route:** `/portal/vouchers` (under customer portal)

**Layout:**
- My Vouchers heading
- Tabs: Available | Used | Expired
- Available tab: list of active vouchers, each showing:
  - Voucher code (large, copyable)
  - QR code image
  - Discount description (e.g., "20% off your next order (max KES 500)")
  - Expiry date with countdown ("Expires in 5 days")
  - Min order value (if applicable)
  - Branch restriction (if applicable)
  - "Use at Checkout" button (if online ordering is available)
- Used tab: history of redeemed vouchers with order link
- Expired tab: expired vouchers (dimmed)

---

## 9. Dashboard & Reporting Outputs

### 9.1 Director Dashboard Widgets

These widgets appear on the main director dashboard (`/dashboard` for director role), not on the dedicated `/director/vouchers` page.

| Widget | Type | Data Source | Description |
|--------|------|------------|-------------|
| Voucher Redemption Rate | Gauge/Percentage | `getVoucherStats()` | `(used / approved) * 100` for current month |
| Campaign ROI | KPI Card | Computed from `voucherCampaigns` | `(revenueGenerated - actualDiscountGiven) / actualDiscountGiven * 100` |
| Discount Cost Tracking | Spark line | `getVoucherStats()` with date range | Cumulative `totalDiscounted` for current month vs previous month |

### 9.2 Director Module Page (`/director/vouchers`)

| Chart/Widget | Type | Data | Purpose |
|-------------|------|------|---------|
| Redemption Rate Over Time | Line chart | Daily redemption rate for past 30 days | Track voucher effectiveness trend |
| Campaign Performance Comparison | Horizontal bar chart | Vouchers generated vs redeemed per campaign | Compare campaign success |
| Voucher Distribution by Type | Donut chart | Count by `discountType` | Understand discount type mix |
| Revenue Impact Analysis | Stacked bar chart | Revenue from voucher orders vs total revenue, by week | Measure voucher contribution |
| Approval Queue Summary | KPI cards | Pending count, avg approval time, escalation rate | Monitor workflow health |
| Top Campaigns by ROI | Ranked table | Campaign name, ROI, redemption rate | Identify best performers |

### 9.3 GM Dashboard Widgets

These widgets appear on the main GM dashboard.

| Widget | Type | Data Source | Description |
|--------|------|------------|-------------|
| Active Voucher Count | KPI Card | `getActiveVouchers()` count | Total currently active vouchers (branch-filtered) |
| Pending Approval Count | Badge on sidebar + KPI Card | `getPendingVouchers()` count | Number of vouchers awaiting approval |

### 9.4 GM Module Page (`/gm/vouchers`)

| Section | Type | Data | Purpose |
|---------|------|------|---------|
| Pending Approvals List | Card list | `getPendingVouchers()` + `getPendingApprovalsForUser()` | Review and action voucher approvals |
| Active Vouchers Table | Data table | `getActiveVouchers()` with filters | Monitor live vouchers |
| Quick Approve/Reject Actions | Inline buttons | Direct actions on pending cards | Streamline approval workflow |

### 9.5 Reports

| Report | Content | Format | Access |
|--------|---------|--------|--------|
| Voucher Usage Report | Redemption rate, discount given by type, campaign performance, top voucher codes by usage | Excel + PDF (via `lib/reports/export-excel.ts` and `lib/reports/export-pdf.ts` patterns) | Director, Admin |
| Campaign ROI Report | Per-campaign: cost (total discount), revenue generated, ROI, redemption rate, target vs actual reach | Excel + PDF | Director, Admin |
| Voucher Approval Audit Report | All approval actions with timestamps, approver, tier, decision, reason | Excel + PDF | Director, Admin, Auditor |

---

## 10. Notification & Messaging Flows

### 10.1 WhatsApp Templates (via `services/wati.ts`)

**NEW Template: `voucher_issued`**

```
Hi {{name}}, you've received a discount voucher from Lorenzo Dry Cleaners!

Code: {{voucherCode}}
Discount: {{discountDescription}}
Valid until: {{expiryDate}}
{{#minOrderValue}}Minimum order: KES {{minOrderValue}}{{/minOrderValue}}

Show this code at any Lorenzo branch or enter it at checkout. Thank you for choosing Lorenzo!
```

Parameters:
- `name`: Customer name
- `voucherCode`: The voucher code (e.g., "LDCAB3K7P2Q9")
- `discountDescription`: Human-readable (e.g., "20% off (max KES 500)" or "KES 300 off")
- `expiryDate`: Formatted date (e.g., "March 15, 2026")
- `minOrderValue`: Optional minimum order amount

**NEW Template: `voucher_expiring`**

```
Hi {{name}}, your Lorenzo Dry Cleaners voucher expires soon!

Code: {{voucherCode}}
Discount: {{discountDescription}}
Expires: {{expiryDate}} ({{daysRemaining}} days left)

Don't miss out — use it on your next order!
```

Parameters:
- `name`: Customer name
- `voucherCode`: The voucher code
- `discountDescription`: Human-readable discount
- `expiryDate`: Formatted date
- `daysRemaining`: Number of days until expiry

### 10.2 WhatsApp Sending Integration

Both templates use the existing `sendWhatsAppMessage()` function from `services/wati.ts`:

```typescript
await sendWhatsAppMessage(
  customerPhone,
  'voucher_issued',  // or 'voucher_expiring'
  {
    name: customerName,
    voucherCode: voucher.voucherCode,
    discountDescription: formatDiscountDescription(voucher),
    expiryDate: formatDate(voucher.expiryDate),
    minOrderValue: voucher.minOrderValue?.toString() || '',
  },
  undefined,         // orderId (not applicable)
  voucher.customerId // customerId for tracking
);
```

The `mapTemplateToNotificationType()` function in `services/wati.ts` (line 329) needs extension:

```typescript
// Add to mapping in mapTemplateToNotificationType()
voucher_issued: 'order_confirmation',     // Reuse existing type or add new NotificationType
voucher_expiring: 'payment_reminder',     // Reuse existing type or add new NotificationType
```

### 10.3 In-App Notifications

| Event | Recipient | Channel | Content |
|-------|-----------|---------|---------|
| Voucher created (requires approval) | GM / Director (based on tier) | In-app + Email | "New voucher approval request: {{voucherCode}} for {{discountDescription}} by {{creatorName}}" |
| Voucher approved | Creator | In-app | "Your voucher {{voucherCode}} has been approved by {{approverName}}" |
| Voucher rejected | Creator | In-app | "Your voucher {{voucherCode}} was rejected by {{approverName}}: {{reason}}" |
| Approval escalated | Next-tier approver | In-app + Email | "Voucher approval escalated to you: {{voucherCode}}" |
| Approval expiring (24h warning) | Current-tier approver | In-app | "Voucher approval {{voucherCode}} expires in 24 hours" |
| Campaign submitted for approval | GM / Director | In-app + Email | "New campaign approval: '{{campaignName}}' with {{voucherCount}} vouchers" |
| Campaign approved | Creator | In-app | "Your campaign '{{campaignName}}' has been approved" |

### 10.4 Campaign Distribution Batch Flow

For WhatsApp campaign distribution:

1. Campaign is approved and launched
2. System queries customers matching `CampaignTargetingRules`
3. For each customer:
   a. Generate voucher from template (with `campaignId` link)
   b. Queue WhatsApp message via `sendWhatsAppMessage()`
4. Rate limiting: max 100 messages per minute (Wati.io constraint: 100 messages/second, but we self-limit to avoid burst issues)
5. Batch processing: process in chunks of 50 customers, with 30-second delay between chunks
6. Track delivery status: update `Voucher.notificationSent` and `notificationSentAt`
7. Failed sends: retry up to 3 times (handled by `sendWhatsAppMessage()` built-in retry with exponential backoff per `services/wati.ts` lines 220-309)
8. Final stats: update `VoucherCampaign.vouchersDistributed` count

---

## 11. Audit & Compliance

All voucher actions generate audit log entries via `createAuditLog()` from `lib/db/audit-logs.ts`.

### 11.1 Audit Events

| Event | `action` | `resourceType` | `description` | `changes` |
|-------|----------|----------------|--------------|-----------|
| Voucher created | `'create'` | `'voucher'` | `"Voucher ${voucherCode} created (${discountType} ${discountValue})"` | `{ after: { voucherId, voucherCode, discountType, discountValue, customerId, validBranchId, approvalStatus } }` |
| Voucher approved | `'approve'` | `'voucher'` | `"Voucher ${voucherCode} approved by ${approverName}"` | `{ before: { approvalStatus: 'pending' }, after: { approvalStatus: 'approved', approvedBy, approvedAt } }` |
| Voucher rejected | `'reject'` | `'voucher'` | `"Voucher ${voucherCode} rejected by ${rejecterName}: ${reason}"` | `{ before: { approvalStatus: 'pending' }, after: { approvalStatus: 'rejected', rejectionReason } }` |
| Voucher redeemed | `'update'` | `'voucher'` | `"Voucher ${voucherCode} redeemed on order ${orderId} for KES ${discountedAmount}"` | `{ before: { isUsed: false, status: 'active' }, after: { isUsed: true, status: 'used', usedOnOrderId, usedByCustomerId, discountedAmount } }` |
| Voucher cancelled | `'update'` | `'voucher'` | `"Voucher ${voucherCode} cancelled: ${reason}"` | `{ before: { status: 'active' }, after: { status: 'cancelled', rejectionReason } }` |
| Voucher expired (batch) | `'update'` | `'voucher'` | `"Voucher ${voucherCode} expired (past expiry date)"` | `{ before: { status: 'active' }, after: { status: 'expired' } }` |
| Voucher restored (order cancellation) | `'update'` | `'voucher'` | `"Voucher ${voucherCode} restored after order ${orderId} cancellation"` | `{ before: { isUsed: true, status: 'used' }, after: { isUsed: false, status: 'active' } }` |
| Campaign created | `'create'` | `'voucher_campaign'` | `"Campaign '${name}' created targeting ${segmentDescription}"` | `{ after: { campaignId, name, templateId, targetingRules, budgetCap } }` |
| Campaign launched | `'update'` | `'voucher_campaign'` | `"Campaign '${name}' launched: ${vouchersGenerated} vouchers generated"` | `{ before: { status: 'approved' }, after: { status: 'active', vouchersGenerated, vouchersDistributed } }` |
| Template created | `'create'` | `'voucher_template'` | `"Template '${name}' created (${discountType} ${discountValue})"` | `{ after: { templateId, name, discountType, discountValue, category } }` |
| Template updated | `'update'` | `'voucher_template'` | `"Template '${name}' updated to version ${version}"` | `{ before: { oldValues }, after: { newValues } }` |

### 11.2 Audit Query Patterns

The audit log viewer at `app/(dashboard)/auditor/audit-logs/page.tsx` already includes a voucher filter (line 87). Audit queries use:

- `getAuditLogsByResource('voucher', voucherId)` -- all actions on a specific voucher
- `getAuditLogsByResource('voucher_campaign', campaignId)` -- all actions on a campaign
- `getAuditLogsByBranch(branchId, limit, 'approve')` -- all approvals at a branch
- `getAuditLogsByUser(userId)` -- all actions by a specific user

### 11.3 Compliance Requirements

- All voucher creation, approval, rejection, and redemption actions are logged immutably
- Audit logs include `performedBy`, `performedByRole`, `branchId`, and `timestamp`
- Before/after state tracking enables full reconstruction of voucher lifecycle
- IP address and user agent optionally captured for security forensics
- Audit logs are retained for minimum 365 days (configurable)

---

## 12. Customer Portal Impact

### 12.1 NEW: Voucher Wallet Page

**Route:** `/portal/vouchers`
**Access:** Authenticated customers only

**Features:**

| Feature | Description |
|---------|-------------|
| Available Vouchers | List of active, approved, non-expired vouchers assigned to the customer (`getCustomerVouchers()`) |
| QR Code Display | Each voucher shows its QR code for scanning at POS |
| Code Copy | Tap-to-copy voucher code to clipboard |
| Expiry Countdown | "Expires in X days" with color coding: green (>7 days), amber (3-7 days), red (<3 days) |
| Voucher Details | Discount description, min order value, branch restrictions |
| Apply at Checkout | [If online ordering exists] Button to apply voucher to current cart |
| Used History | Tab showing redeemed vouchers with order reference and date |
| Expired History | Tab showing expired vouchers (dimmed) |

### 12.2 NEW: Apply Voucher at Checkout

If the customer portal supports online ordering (Module 1 integration):

1. Customer navigates to checkout
2. "Have a voucher?" section with code input field
3. Customer enters code or selects from wallet
4. System calls `validateVoucher()` with order total, customer ID, branch ID
5. If valid: show discount amount, apply to order total
6. If invalid: show error message from `VoucherValidationResult.error`
7. On order confirmation: `redeemVoucher()` is called

### 12.3 NEW: Expiry Alerts

- 3 days before expiry: WhatsApp notification via `voucher_expiring` template
- Customer portal: banner notification "You have a voucher expiring soon!"
- Scheduled function checks daily for vouchers expiring within 3 days

### 12.4 NEW: Campaign Opt-In/Out Preferences

Extend `CustomerPreferences` interface in `lib/db/schema.ts`:

```typescript
export interface CustomerPreferences {
  notifications: boolean;
  language: 'en' | 'sw';
  /** NEW: Whether customer opts in to promotional voucher campaigns */
  voucherCampaignOptIn?: boolean;  // Default: true
}
```

Campaign distribution respects this preference: customers with `voucherCampaignOptIn: false` are excluded from campaign targeting.

---

## 13. Branch Scoping

### 13.1 Branch-Specific Vouchers

The existing `Voucher.validBranchId` field (`lib/db/vouchers.ts` line 55) controls branch restriction:

| `validBranchId` Value | Behavior |
|----------------------|----------|
| `undefined` / `null` | Voucher is valid at all branches |
| Specific branch ID | Voucher is only valid at that branch; `validateVoucher()` rejects if `branchId` parameter does not match (line 348) |

### 13.2 Creation Permissions by Branch

| Creator Role | Can Create For |
|-------------|----------------|
| `store_manager` | Own branch only (`validBranchId` = creator's `branchId`) |
| `general_manager` | Own branch or system-wide (`validBranchId` = optional) |
| `director` | Any branch or system-wide |
| `admin` | Any branch or system-wide |

### 13.3 Approval Visibility

From `getPendingApprovalsForUser()` in `lib/workflows/approval.ts` lines 521-552:

- Roles with tier `'director'` or `'admin'` see all pending approvals (no branch filter)
- Other roles see only approvals from their branch (`where('branchId', '==', branchId)`)

### 13.4 Campaign Branch Targeting

`VoucherCampaign.targetingRules.branchIds`:
- `undefined` / `null` / empty array: Campaign targets customers at all branches
- Specific branch IDs: Campaign targets only customers whose primary branch matches

### 13.5 Analytics Branch Filtering

All analytics endpoints accept optional `branchId` query parameter:
- Director: Can view all branches or filter to specific branch
- GM: Automatically filtered to their managed branch
- Branch-level analytics aggregate only vouchers with `validBranchId` matching or `validBranchId` = null

---

## 14. Business Logic

### 14.1 Voucher Code Generation

**Source:** `lib/db/vouchers.ts`, `generateVoucherCode()` (lines 129-136)

```
Algorithm:
1. Start with prefix "LDC" (VOUCHER_CONFIG.codePrefix)
2. Append 8 random characters from charset:
   "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
   (excludes O/0 and I/1 to avoid visual ambiguity)
3. Total code length: 11 characters (3 prefix + 8 random)
4. Collision probability: ~1 in 32^8 = ~1 in 1.1 trillion per code
```

Example codes: `LDCAB3K7P2Q9`, `LDCXR5T8N4WV`

**For bulk generation:** Ensure uniqueness by querying Firestore for existing codes before committing. If collision detected, regenerate (retry up to 5 times per code).

### 14.2 Voucher ID Generation

**Source:** `lib/db/vouchers.ts`, `generateVoucherId()` (lines 141-145)

```
Algorithm:
1. Get current timestamp as base-36 string
2. Generate 6-character random base-36 string
3. Format: "VCH-{timestamp36}-{random6}" (uppercase)
```

### 14.3 QR Code Generation

**Source:** `lib/receipts/qr-generator.ts`, `generateVoucherQRCode()` (lines 193-207)

```
Input: voucherCode (string)
Output: base64 PNG data URL

URL encoded: "${portalBaseUrl}/pos?voucher=${encodeURIComponent(voucherCode)}"

QR settings:
- Error correction: 'Q' (25% recovery — suitable for printed vouchers)
- Default size: 200px
- Colors: black on white (#000000 / #FFFFFF)
```

The QR encodes a URL that, when scanned at POS, auto-populates the voucher code field. The QR data URL is stored in `Voucher.qrCodeData` via `updateVoucherQRCode()`.

### 14.4 Discount Calculation

**Source:** `lib/db/vouchers.ts`, `validateVoucher()` (lines 357-367)

```typescript
// Percentage discount
if (voucher.discountType === 'percentage') {
  discountAmount = orderTotal * (voucher.discountValue / 100);
  if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
    discountAmount = voucher.maxDiscountAmount;
  }
}

// Fixed discount
if (voucher.discountType === 'fixed') {
  discountAmount = Math.min(voucher.discountValue, orderTotal);
}
```

**Examples:**
- 20% off on KES 3,000 order, no cap: discount = KES 600
- 20% off on KES 3,000 order, max KES 500: discount = KES 500
- KES 1,000 off on KES 800 order: discount = KES 800 (capped at order total)
- KES 500 off on KES 3,000 order: discount = KES 500

### 14.5 Approval Threshold Logic

**Source:** `lib/db/vouchers.ts`, `requiresApproval()` (lines 150-158)

```typescript
function requiresApproval(discountType, discountValue): boolean {
  if (discountType === 'percentage') {
    return discountValue > VOUCHER_CONFIG.approvalThreshold.percentage; // > 20%
  }
  return discountValue > VOUCHER_CONFIG.approvalThreshold.fixed;        // > KES 1,000
}
```

**Auto-approve cases:**
- Percentage discount <= 20%
- Fixed discount <= KES 1,000

**Requires approval cases:**
- Percentage discount > 20% (routes to `general_manager`)
- Fixed discount > KES 1,000 (routes to `general_manager`)
- Fixed/percentage discount >= KES 5,000 equivalent (routes to `director`)

### 14.6 Stacking Rules

**Default:** One voucher per order. No stacking with other vouchers.

**Implementation:** At POS, when a voucher is applied:
1. Check if order already has a voucher applied (`order.appliedVoucherId`)
2. If yes, reject with error: "Only one voucher per order allowed"
3. If no, validate and apply

**Exception:** Corporate agreements (from `lib/db/schema.ts` `CorporateAgreement.discountPercentage`) are not vouchers and can coexist with a voucher. Voucher discount is applied after corporate discount.

### 14.7 Expiry Handling

**Source:** `lib/db/vouchers.ts`, `expireVouchers()` (lines 603-626)

The `expireVouchers()` function is designed to be called by a scheduled Cloud Function (e.g., daily at midnight):

1. Query all vouchers where `status == 'active'` and `expiryDate < now`
2. For each: update `status` to `'expired'`
3. Return count of expired vouchers

**On-access check:** `validateVoucher()` (line 335) also checks expiry at redemption time as a safety net.

### 14.8 Bulk Generation Rate Limits

For bulk voucher generation:

| Parameter | Limit |
|-----------|-------|
| Maximum vouchers per bulk operation | 10,000 |
| Maximum concurrent bulk operations | 1 per user |
| Code uniqueness | Verified against Firestore before commit |
| Collision retry | Up to 5 retries per code |
| Batch write size | 500 documents per Firestore batch |
| Estimated time for 10,000 vouchers | ~60 seconds (20 batches of 500) |

---

## 15. Integration Points

### 15.1 Module 1 -- Order Management

| Integration | Direction | Description |
|-------------|-----------|-------------|
| Voucher applied at POS | M6 -> M1 | When front-desk applies voucher to order, `validateVoucher()` is called with order total. Discount amount is subtracted from `order.totalAmount` and recorded in order payment details. |
| Order cancellation restores voucher | M1 -> M6 | [NEW] When an order with a voucher is cancelled, `redeemVoucher()` is reversed: `isUsed` = false, `status` = `'active'`, usage fields cleared. |
| Order total recalculation | M1 <-> M6 | Voucher discount must be recalculated if order items change after voucher is applied but before payment is finalized. |
| Receipt includes voucher info | M6 -> M1 | Receipt PDF includes voucher code, discount amount, and "Voucher Applied" line item (via `lib/receipts/` pattern). |

### 15.2 Module 4 -- Customer Preferences

| Integration | Direction | Description |
|-------------|-----------|-------------|
| Campaign targeting | M4 -> M6 | Campaign targeting rules use customer `segment` field (`regular`, `vip`, `corporate`) from `lib/db/schema.ts` `Customer` interface (line 147). |
| Purchase history for targeting | M4 -> M6 | `CustomerStatistics` interface fields (`totalOrders`, `totalSpend`, `last12MonthsOrders`, `daysSinceLastOrder`) used for campaign targeting rules. |
| Campaign opt-in preference | M4 <-> M6 | [NEW] `CustomerPreferences.voucherCampaignOptIn` controls whether customer receives campaign vouchers. |

### 15.3 Module 5 -- AI Insights

| Integration | Direction | Description |
|-------------|-----------|-------------|
| AI campaign recommendations | M5 -> M6 | [NEW] AI agent analyzes customer churn risk, purchase decline patterns, and historical campaign performance to recommend campaign parameters. |
| Predicted redemption rate | M5 -> M6 | [NEW] AI predicts expected redemption rate for a proposed campaign based on historical data. |
| Campaign ROI forecast | M5 -> M6 | [NEW] AI estimates expected ROI before campaign launch. |
| Campaign result feedback | M6 -> M5 | [NEW] Actual campaign results (redemption rate, ROI) fed back to AI for model improvement. |

### 15.4 External: Wati.io WhatsApp

| Integration | Description |
|-------------|-------------|
| Voucher issuance notification | `sendWhatsAppMessage()` with `voucher_issued` template |
| Voucher expiry reminder | `sendWhatsAppMessage()` with `voucher_expiring` template |
| Campaign batch distribution | Batch `sendWhatsAppMessage()` calls with rate limiting |
| Template registration | New templates `voucher_issued` and `voucher_expiring` must be submitted to Meta for approval via Wati.io dashboard |

---

## 16. Security & Permissions

### 16.1 RBAC Matrix

| Action | `front_desk` | `store_manager` | `general_manager` | `director` | `admin` | `customer` |
|--------|:----:|:----:|:----:|:----:|:----:|:----:|
| Create voucher (single) | -- | Yes | Yes | Yes | Yes | -- |
| Create voucher (bulk) | -- | -- | Yes | Yes | Yes | -- |
| Approve voucher (tier: manager) | -- | Yes | Yes | Yes | Yes | -- |
| Approve voucher (tier: general_manager) | -- | -- | Yes | Yes | Yes | -- |
| Approve voucher (tier: director) | -- | -- | -- | Yes | Yes | -- |
| Reject voucher | -- | Yes (own tier) | Yes | Yes | Yes | -- |
| Redeem voucher at POS | Yes | Yes | Yes | -- | Yes | -- |
| Cancel voucher | -- | -- | Yes | Yes | Yes | -- |
| View pending vouchers | -- | Yes (own branch) | Yes (own branch) | Yes (all) | Yes (all) | -- |
| View active vouchers | Yes (for POS) | Yes | Yes | Yes | Yes | Own only |
| Create campaign | -- | -- | Yes | Yes | Yes | -- |
| Approve campaign | -- | -- | Yes | Yes | Yes | -- |
| Launch campaign | -- | -- | Yes | Yes | Yes | -- |
| Cancel campaign | -- | -- | Yes | Yes | Yes | -- |
| Create template | -- | -- | Yes | Yes | Yes | -- |
| Update template | -- | -- | Yes | Yes | Yes | -- |
| Archive template | -- | -- | Yes | Yes | Yes | -- |
| View analytics | -- | -- | Yes (own branch) | Yes (all) | Yes (all) | -- |
| Export reports | -- | -- | -- | Yes | Yes | -- |
| View voucher wallet | -- | -- | -- | -- | -- | Yes |
| Apply voucher at checkout | -- | -- | -- | -- | -- | Yes |

### 16.2 Data Access Controls

- Voucher codes are not considered secrets (they are given to customers), but bulk export of all codes should be restricted to Director+ roles
- QR code data URLs contain no sensitive information beyond the voucher code
- Customer-specific voucher assignment (`customerId`) does not expose customer data to other customers
- Campaign targeting rules do not expose individual customer data; only aggregate counts shown during campaign setup

### 16.3 Rate Limiting

| Endpoint | Rate Limit | Scope |
|----------|-----------|-------|
| `POST /api/vouchers` | 10 per minute | Per user |
| `POST /api/vouchers/validate` | 30 per minute | Per user |
| `POST /api/vouchers/bulk` | 1 per 5 minutes | Per user |
| `POST /api/campaigns/:id/launch` | 1 per hour | Per campaign |

---

## 17. Error Handling & Edge Cases

### 17.1 Voucher Validation Errors

All validation errors are returned by `validateVoucher()` in `lib/db/vouchers.ts` (lines 298-376):

| Condition | Error Message | HTTP Status |
|-----------|--------------|-------------|
| Code not found | `"Invalid voucher code"` | 404 |
| Approval pending | `"Voucher is pending approval"` | 409 |
| Already used | `"Voucher has already been used"` | 409 |
| Status not active | `"Voucher is ${voucher.status}"` | 409 |
| Expired | `"Voucher has expired"` | 410 |
| Below minimum order | `"Minimum order value is KES ${minOrderValue}"` | 422 |
| Wrong branch | `"Voucher not valid for this branch"` | 403 |
| Wrong customer | `"Voucher is assigned to another customer"` | 403 |
| [NEW] Already has voucher | `"Only one voucher per order allowed"` | 409 |

### 17.2 Approval Edge Cases

| Scenario | Handling |
|----------|---------|
| Approval timeout (48h) | `expirePendingRequests()` sets status to `'expired'`; voucher becomes `'cancelled'` |
| [NEW] Auto-escalation (24h no action) | Scheduled function escalates to next tier via `escalateRequest()` |
| Approver tries to approve own voucher | Check `request.requestedBy !== approverId`; reject if same person |
| Concurrent approval (two approvers click simultaneously) | Firestore optimistic concurrency: first writer wins; second gets "Request is already approved" error (line 344) |
| Escalation at highest tier | `escalateRequest()` throws "Cannot escalate further - already at highest tier" (line 449) |

### 17.3 Redemption Edge Cases

| Scenario | Handling |
|----------|---------|
| Voucher applied but order cancelled | [NEW] `restoreVoucher()` function reverses redemption, restoring voucher to `active` |
| Voucher applied, order total changes | Recalculate discount via `validateVoucher()` with new total; update `discountedAmount` |
| Voucher expired between validation and redemption | `redeemVoucher()` checks `isUsed` but should also re-check expiry; add safety check |
| Double-redeem race condition | `redeemVoucher()` checks `isUsed` (line 395); Firestore update is atomic per document |

### 17.4 Bulk Generation Edge Cases

| Scenario | Handling |
|----------|---------|
| Code collision during bulk generation | Retry code generation up to 5 times per voucher; if still collides, fail that voucher and continue |
| Bulk operation interrupted (server crash) | Partial write: some vouchers created, others not. Track batch ID; provide resume/cleanup endpoint |
| Template deleted during bulk generation | Load template at start; cache locally for duration of operation |
| 10,000 voucher generation | Process in Firestore batch writes of 500; total ~20 batches; estimated 60 seconds |

### 17.5 Campaign Edge Cases

| Scenario | Handling |
|----------|---------|
| Campaign with 1,000+ recipients (WhatsApp) | Batch send: 50 messages per chunk, 30-second delay between chunks. Total time for 1,000: ~10 minutes |
| Campaign budget exceeded mid-distribution | After each voucher redemption, check `actualDiscountGiven + currentDiscount <= budgetCap`; if exceeded, reject redemption with "Campaign budget exhausted" |
| Customer opts out after voucher issued | Voucher remains valid (already issued) but customer removed from future campaigns |
| Campaign vouchers redeemed after campaign end date | Vouchers have their own `expiryDate` (set from template `expiryDays`); campaign `endDate` only controls distribution window |

---

## 18. Data Migration

### 18.1 Existing Vouchers

No migration required. The existing `vouchers` collection in Firestore is fully backward-compatible. New optional fields (`campaignId`, `templateId`, `distributionChannel`, `notificationSent`, `notificationSentAt`) are added as `undefined` for existing documents and populated only for new vouchers.

### 18.2 New Collections

| Collection | Migration Action |
|-----------|-----------------|
| `voucherTemplates` | Created fresh. No existing data. Seed with pre-built templates (FR-M6-073). |
| `voucherCampaigns` | Created fresh. No existing data. |

### 18.3 Schema Reconciliation

The `Voucher` interface in `lib/db/schema.ts` (lines 3273-3318) should be updated to match the operational `Voucher` interface in `lib/db/vouchers.ts` (lines 37-94). Specifically:

| `schema.ts` Field | `vouchers.ts` Field | Action |
|-------------------|---------------------|--------|
| `minOrderAmount` | `minOrderValue` | Rename to `minOrderValue` |
| `createdByName?` (optional) | `createdByName` (required) | Make required |
| `usedByCustomer` | `usedByCustomerId` | Rename to `usedByCustomerId` |
| `usedDate` | `usedAt` | Rename to `usedAt` |
| `usedOnOrder` | `usedOnOrderId` | Rename to `usedOnOrderId` |
| `purpose` | `description` | Map `purpose` -> `description` |
| (missing) | `maxDiscountAmount` | Add field |
| (missing) | `discountedAmount` | Add field |
| (missing) | `updatedAt` | Add field |
| `approvalDate` | `approvedAt` | Rename to `approvedAt` |

This is a code-only change (no Firestore migration needed) since the runtime uses `vouchers.ts` types.

### 18.4 Firestore Indexes

New composite indexes required:

```
Collection: vouchers
  - Fields: campaignId ASC, status ASC
  - Fields: templateId ASC, createdAt DESC
  - Fields: status ASC, expiryDate ASC (exists implicitly via getActiveVouchers query)

Collection: voucherCampaigns
  - Fields: status ASC, createdAt DESC
  - Fields: branchId ASC, status ASC

Collection: voucherTemplates
  - Fields: isActive ASC, category ASC
  - Fields: isActive ASC, createdAt DESC
```

---

## 19. Testing Strategy

### 19.1 Unit Tests

| Test Area | Functions Under Test | Key Assertions |
|-----------|---------------------|----------------|
| Code generation | `generateVoucherCode()` | Returns 11-char string starting with "LDC"; no ambiguous chars (O/0/I/1); uniqueness over 10,000 runs |
| ID generation | `generateVoucherId()` | Returns string matching `VCH-[A-Z0-9]+-[A-Z0-9]+`; unique |
| Approval threshold | `requiresApproval()` | 20% -> false; 21% -> true; KES 1000 -> false; KES 1001 -> true |
| Discount calculation | `validateVoucher()` | Percentage with cap; percentage without cap; fixed below order; fixed above order |
| Stacking rejection | POS voucher application | Second voucher on same order returns error |
| Tier resolution | `getRequiredTier('voucher', amount)` | KES 0-4999 -> `general_manager`; KES 5000+ -> `director` |
| Can approve | `canApprove(role, request)` | GM can approve GM-tier; GM cannot approve director-tier; director can approve any |
| Zod validation | `createVoucherSchema` | Valid input passes; invalid code format fails; percentage > 100 fails |

### 19.2 Integration Tests

| Test Flow | Steps | Expected Outcome |
|-----------|-------|-----------------|
| Full lifecycle (auto-approve) | Create 10% voucher -> validate -> redeem | Voucher auto-approved, validated successfully, redeemed with correct discount |
| Full lifecycle (with approval) | Create 30% voucher -> pending -> GM approves -> validate -> redeem | Voucher goes to pending, approved by GM, redeemed successfully |
| Rejection flow | Create 25% voucher -> pending -> GM rejects with reason | Voucher status = cancelled, rejection reason stored, cannot be validated |
| Escalation flow | Create KES 6,000 voucher -> GM escalates to director -> director approves | Request escalated, director approves, voucher becomes active |
| Expiry flow | Create voucher with 1-day expiry -> wait -> run expireVouchers() | Voucher status changes to expired; validation returns "Voucher has expired" |
| Order cancellation restore | Create + approve + redeem -> cancel order | Voucher restored to active; can be redeemed again |
| Branch restriction | Create branch-specific voucher -> validate at wrong branch | Validation fails with "Voucher not valid for this branch" |
| Customer-specific | Create customer-specific voucher -> validate with different customer | Validation fails with "Voucher is assigned to another customer" |

### 19.3 End-to-End Tests (Playwright)

| Test | User Flow |
|------|-----------|
| POS voucher application | Login as front_desk -> create order -> enter voucher code -> verify discount applied -> complete payment |
| GM approval workflow | Login as store_manager -> create high-value voucher -> login as GM -> navigate to `/gm/vouchers` -> approve -> verify voucher active |
| Director analytics | Login as director -> navigate to `/director/vouchers` -> verify charts render -> verify data matches expected |
| Customer portal wallet | Login as customer -> navigate to `/portal/vouchers` -> verify voucher list -> verify QR code display |
| Campaign creation | Login as GM -> create campaign -> submit for approval -> login as director -> approve -> launch -> verify vouchers generated |

### 19.4 Performance Tests

| Scenario | Target | Metric |
|----------|--------|--------|
| Bulk generation of 10,000 vouchers | < 120 seconds | Firestore batch write throughput |
| Campaign distribution to 5,000 customers | < 60 minutes | WhatsApp send rate (rate-limited) |
| Voucher validation at POS | < 200ms | Query latency for `getVoucherByCode()` |
| Analytics dashboard load | < 2 seconds | Aggregate computation for 30-day window |
| Concurrent approval requests | Handle 10 simultaneous approvals | No race condition failures |

---

## 20. Implementation Sequence

### Phase 1: Campaign System (Week 1-2)

1. Create `voucherCampaigns` Firestore collection
2. Define `VoucherCampaign` interface in `lib/db/schema.ts`
3. Implement campaign CRUD in `lib/db/campaigns.ts`
4. Implement campaign approval flow (reuse existing `lib/workflows/approval.ts`)
5. Add API routes: `POST /api/campaigns`, `GET /api/campaigns`, `PUT /api/campaigns/:id`, `POST /api/campaigns/:id/submit`, `POST /api/campaigns/:id/launch`, `PUT /api/campaigns/:id/cancel`
6. Add campaign targeting query logic (filter customers by segment, branch, order count, spend, recency)

### Phase 2: Voucher Templates (Week 2-3)

1. Create `voucherTemplates` Firestore collection
2. Define `VoucherTemplate` interface in `lib/db/schema.ts`
3. Implement template CRUD in `lib/db/voucher-templates.ts`
4. Add API routes for templates
5. Seed pre-built templates
6. Update `createVoucher()` to accept optional `templateId`

### Phase 3: Bulk Generation with Template Support (Week 3)

1. Implement `bulkCreateVouchers()` in `lib/db/vouchers.ts`
2. Use Firestore batch writes (500 per batch)
3. Add uniqueness verification for generated codes
4. Implement bulk API endpoint `POST /api/vouchers/bulk`
5. Wire bulk generation into campaign launch flow

### Phase 4: Director `/director/vouchers` Analytics Page (Week 4)

1. Create page at `app/(dashboard)/director/vouchers/page.tsx`
2. Implement `VoucherAnalyticsDashboard` component
3. Build charts: redemption rate line, campaign bar, distribution donut, revenue impact stacked bar
4. Implement analytics computation API: `GET /api/vouchers/analytics`
5. Add Excel/PDF export using existing `lib/reports/` patterns
6. Add sidebar navigation item under MODULES section

### Phase 5: GM `/gm/vouchers` Approval Page (Week 4-5)

1. Create page at `app/(dashboard)/gm/vouchers/page.tsx`
2. Implement `VoucherApprovalQueue` component with approve/reject/escalate actions
3. Implement `ActiveVouchersTable` component with filters
4. Add pending approval badge count to GM sidebar
5. Add sidebar navigation item under OPERATIONS section

### Phase 6: Customer Portal Voucher Wallet (Week 5)

1. Create page at `app/(public)/portal/vouchers/page.tsx`
2. Implement `VoucherWallet` component with Available/Used/Expired tabs
3. Implement QR code display using existing `generateVoucherQRCode()`
4. Add voucher code copy-to-clipboard
5. Add expiry countdown badges
6. Add navigation link in customer portal sidebar

### Phase 7: WhatsApp Distribution Templates (Week 5-6)

1. Register `voucher_issued` template with Meta via Wati.io dashboard
2. Register `voucher_expiring` template with Meta via Wati.io dashboard
3. Extend `mapTemplateToNotificationType()` in `services/wati.ts`
4. Add `createMessageFromTemplate()` templates for new message types
5. Implement batch send logic for campaign distribution
6. Implement daily scheduled function for expiry reminders (3-day warning)

**Note:** Meta template approval typically takes 2-4 weeks. Submit templates early (Phase 1) even if integration code is not ready.

### Phase 8: AI Campaign Recommendations (Week 6+, depends on Module 5)

1. Define AI prompt template for campaign recommendations
2. Implement recommendation endpoint `POST /api/campaigns/ai-recommend`
3. Integrate AI suggestions into campaign builder UI
4. Track AI-recommended campaigns with `source: 'ai_recommended'`
5. Feed campaign results back to AI for model improvement

---

## 21. Open Questions & Risks

### Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|------------|
| WhatsApp template approval lead time | High | High | Submit `voucher_issued` and `voucher_expiring` templates to Meta as soon as possible (2-4 week review cycle). Have fallback: in-app notification + manual distribution |
| Bulk voucher code guessability | Medium | Low | Current charset (32 characters) and length (8 chars) provides ~1.1 trillion combinations. Additionally, codes require database lookup for validation. Consider adding a HMAC-based validation hash for offline validation if needed. |
| Campaign distribution to 5,000+ customers overwhelms Wati.io rate limits | Medium | Medium | Self-imposed rate limiting (100/minute) well below Wati.io's 100/second limit. Batch processing with delays. Monitor Wati.io dashboard for throttling signals. |
| Schema discrepancy between `schema.ts` and `vouchers.ts` causes runtime bugs | Medium | Medium | Reconcile during Phase 1 implementation. The `vouchers.ts` version is authoritative; update `schema.ts` to match. |
| Voucher abuse: customer reuses code on multiple orders | Low | Low | Vouchers are single-use (`isUsed` flag). Atomic Firestore update prevents race conditions. |

### Open Questions

| # | Question | Impact | Proposed Default |
|---|----------|--------|-----------------|
| Q1 | Should vouchers be transferable between customers? | Affects customer-specific vouchers and loyalty rewards | **No** -- customer-specific vouchers are locked to the assigned customer via `customerId`. Generic vouchers (no `customerId`) can be used by anyone. |
| Q2 | What is the maximum discount cap per order when a voucher is applied alongside a corporate agreement discount? | Affects revenue protection for corporate accounts | **50% total discount** -- corporate discount applied first, then voucher discount on the remaining amount, with a floor of 50% of original order total. |
| Q3 | Should there be campaign-level budget tracking that blocks redemption when budget is exhausted? | Affects campaign financial control | **Yes** -- `VoucherCampaign.budgetCap` is enforced at redemption time. When `actualDiscountGiven >= budgetCap`, further campaign voucher redemptions are rejected. |
| Q4 | Should expired vouchers be reissuable (create new voucher with same parameters for same customer)? | Affects customer service convenience | **Yes** -- provide a "Reissue" action on expired vouchers that pre-fills a new voucher creation form with the same parameters. |
| Q5 | How long should voucher data be retained after expiry or use? | Affects storage costs and analytics depth | **24 months** -- after 24 months, voucher records can be archived to cold storage or aggregated into summary statistics. |
| Q6 | Should there be a maximum number of active vouchers per customer? | Affects wallet clutter and potential abuse | **10 active vouchers** per customer. Attempting to issue an 11th shows a warning and requires manager override. |
| Q7 | Should campaign-generated vouchers use the same approval flow as individual vouchers? | Affects workflow complexity | **Campaign-level approval only** -- approving the campaign approves all constituent vouchers. Individual vouchers within a campaign skip the per-voucher approval. |

---

## Appendix A: Firestore Security Rules for Voucher Collections

```javascript
// firestore.rules (additions)
match /vouchers/{voucherId} {
  // Any authenticated user can read (needed for POS validation)
  allow read: if request.auth != null;
  // Only staff roles can create
  allow create: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
       in ['store_manager', 'general_manager', 'director', 'admin'];
  // Only staff roles can update
  allow update: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
       in ['front_desk', 'store_manager', 'general_manager', 'director', 'admin'];
}

match /voucherTemplates/{templateId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
       in ['general_manager', 'director', 'admin'];
}

match /voucherCampaigns/{campaignId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
       in ['general_manager', 'director', 'admin'];
}
```

---

## Appendix B: Voucher Report Excel Template Structure

### Sheet 1: Voucher Usage Report

| Column | Description |
|--------|-------------|
| Voucher Code | Human-readable code (e.g., LDCAB3K7P2Q9) |
| Discount Type | percentage / fixed |
| Discount Value | Percentage or KES amount |
| Status | active / used / expired / cancelled |
| Approval Status | pending / approved / rejected |
| Created By | Staff name |
| Created Date | Timestamp |
| Approved By | Approver name |
| Approved Date | Timestamp |
| Customer | Customer name (if assigned) |
| Branch | Branch name (if restricted) |
| Used By | Customer who redeemed |
| Used On Order | Order ID |
| Used Date | Redemption timestamp |
| Discount Given (KES) | Actual discount amount |
| Expiry Date | Voucher expiry |
| Campaign | Campaign name (if applicable) |

### Sheet 2: Campaign Summary

| Column | Description |
|--------|-------------|
| Campaign Name | Campaign identifier |
| Status | draft / active / completed / cancelled |
| Template | Template name used |
| Target Segment | Customer segments targeted |
| Vouchers Generated | Total vouchers created |
| Vouchers Distributed | Total sent to customers |
| Vouchers Redeemed | Total used |
| Redemption Rate | redeemed / distributed * 100 |
| Total Discount Given (KES) | Sum of discounts |
| Revenue from Voucher Orders (KES) | Order totals where vouchers applied |
| Campaign ROI | (revenue - discount) / discount * 100 |
| Start Date | Campaign start |
| End Date | Campaign end |
| Budget Cap (KES) | Maximum budget |
| Budget Used (KES) | Actual discount given |

### Sheet 3: Approval Audit Trail

| Column | Description |
|--------|-------------|
| Voucher Code | Voucher identifier |
| Request ID | Approval request ID |
| Request Type | voucher |
| Current Tier | Approval tier |
| Status | pending / approved / rejected / expired |
| Requested By | Creator name |
| Requested Date | Request creation timestamp |
| Approver | Final decision maker |
| Decision | approve / reject |
| Decision Date | Timestamp |
| Reason | Rejection reason or comment |
| Time to Decision (hours) | Duration from request to decision |

---

## Appendix C: Scheduled Functions

| Function | Schedule | Description |
|----------|----------|-------------|
| `expireVouchers()` | Daily at 00:00 EAT | Marks active vouchers past `expiryDate` as expired |
| `expirePendingRequests()` | Hourly | Marks approval requests past `expiresAt` as expired |
| `sendExpiryReminders()` | Daily at 09:00 EAT | [NEW] Sends `voucher_expiring` WhatsApp to customers with vouchers expiring within 3 days |
| `autoEscalateApprovals()` | Every 6 hours | [NEW] Escalates voucher approval requests with no action for 24+ hours to next tier |
| `updateCampaignStats()` | Every 4 hours | [NEW] Recalculates `vouchersRedeemed`, `actualDiscountGiven`, `revenueGenerated` for active campaigns |

---

*End of Module 6 -- Voucher & Direct Approval Feature Spec*
