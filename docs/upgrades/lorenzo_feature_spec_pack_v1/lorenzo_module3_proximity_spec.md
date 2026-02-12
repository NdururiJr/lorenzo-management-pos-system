# Module 3 -- Proximity Pickup Offers Feature Spec

**Version:** 1.0
**Status:** Draft
**Date:** February 2026
**Author:** AI Agents Plus Engineering
**System:** Lorenzo Dry Cleaners Management System v2.0
**Maturity:** `[NEW]` -- Entirely new module; no existing code.
**Dependencies:** Master Spec (required), Module 1 (required -- order history is the primary data source for pattern analysis), Module 4 (required -- customer preferences for opt-in/communication channel preferences)

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
| Module | 3 -- Proximity Pickup Offers |
| Version | 1.0 |
| Status | Draft |
| Date | February 2026 |
| Author | AI Agents Plus Engineering |
| Maturity | `[NEW]` |
| Master Spec | Required -- see `lorenzo_master_feature_spec.md` |
| Dependency: Module 1 | **Required** -- Order history is the PRIMARY data source for pattern detection. The `orders` collection (`lib/db/orders.ts`) provides `createdAt`, `branchId`, `customerId`, `status` fields that feed the pattern analysis engine. |
| Dependency: Module 4 | **Required** -- Customer preference opt-in status and communication channel preferences determine whether a customer can receive proactive offers and through which channel. |
| Dependency: Module 5 | Optional -- AI Insights module can consume offer performance data for broader analytics; offer generation can optionally leverage LLM for sophisticated pattern analysis beyond statistical methods. |
| Dependency: Module 6 | Optional -- Voucher system allows special deal offers to include voucher codes. |

### Terminology

| Term | Definition |
|------|-----------|
| **Pattern** | A statistically significant regularity in a customer's order history (frequency, day-of-week, time-of-day, branch preference). |
| **Proximity Offer** | A proactive message sent to a customer suggesting a pickup based on their detected order pattern. NOT GPS-based. |
| **Cooldown** | The minimum time gap between consecutive offers sent to the same customer. |
| **Confidence Score** | A 0.0-1.0 float measuring how statistically reliable a detected pattern is. |
| **Conversion** | When a customer places an order within 72 hours of accepting a proximity offer. |
| **Offer Window** | The time range before a predicted next-order date during which an offer is sent (default: 3 days before predicted date). |

---

## 2. Executive Summary

### What This Module Does

The Proximity Pickup Offers module is a **predictive scheduling system** that analyzes customer order patterns and proactively sends pickup offers via WhatsApp when a customer is **likely to need service**. It does NOT use real-time GPS tracking, geofencing, or any location-based services. Instead, it examines historical order data to detect:

- **Frequency patterns**: "This customer places an order roughly every 14 days"
- **Day-of-week patterns**: "This customer visits on Tuesdays"
- **Time-of-day patterns**: "This customer typically drops off in the morning"
- **Branch preference patterns**: "This customer always visits the Kilimani branch"

When the system predicts a customer is approaching their next order window, it sends a WhatsApp message like: *"Hi Sarah, based on your usual schedule, would you like us to pick up your laundry this Tuesday? Reply YES to confirm or LATER to skip."*

### What This Module Is NOT

- **NOT real-time GPS/geofencing** -- There is no location tracking whatsoever
- **NOT a recommendation engine** -- It does not suggest new services or upsell
- **NOT a generic marketing blast system** -- Each offer is personalized to a specific customer's pattern
- **NOT a booking system** -- It prompts customers, who then confirm or decline

### Business Value

| Benefit | Mechanism |
|---------|-----------|
| Increased order frequency | Customers who forget to schedule are reminded at the right time |
| Improved retention | Proactive engagement reduces churn from forgetfulness |
| Higher lifetime value | More frequent orders compound over time |
| Operational efficiency | Predictable order volume enables better resource planning |
| Customer satisfaction | Customers feel known and valued by personalized timing |
| Revenue attribution | Clear measurement of offer-driven revenue |

### Current State

Nothing exists for this module. The entire system must be built from scratch, leveraging:
- Existing order history data (the `orders` collection in Firestore)
- Existing customer data (the `customers` collection in Firestore)
- Existing WhatsApp integration (Wati.io via `services/wati.ts`)
- Existing agent infrastructure (`lib/agents/base-agent.ts`)
- Existing LLM client (`lib/llm/llm-client.ts`)

### Key Components

1. **Pattern Detection Engine** -- Analyzes order history to detect frequency, timing, and branch patterns
2. **Eligibility Scoring** -- Determines which customers should receive offers and when
3. **Cooldown System** -- Prevents offer fatigue with configurable gaps between offers
4. **Opt-In Management** -- Customer consent tracking for GDPR/Kenya DPA compliance
5. **Offer Generation Pipeline** -- Creates personalized offers based on detected patterns
6. **Offer Distribution** -- WhatsApp delivery via Wati.io with response tracking
7. **Conversion Attribution** -- Links accepted offers to resulting orders
8. **Analytics Dashboard** -- Conversion rates, revenue attribution, pattern accuracy

---

## 3. Existing Foundation

This module is entirely `[NEW]` but builds upon these existing codebase files:

### Data Sources

| File | Path | Relevance |
|------|------|-----------|
| Customer CRUD | `lib/db/customers.ts` | Customer data: `customerId`, `name`, `phone`, `orderCount`, `totalSpent`, `lastOrderDate`, `preferences`. Functions: `getCustomer()`, `updateCustomer()`, `searchCustomers()`, `getTopCustomers()`. |
| Order CRUD | `lib/db/orders.ts` | Order history: `orderId`, `customerId`, `branchId`, `createdAt`, `status`. Functions: `getOrdersByCustomer()`, `getOrdersByBranch()`, `getAllOrders()`. |
| Schema types | `lib/db/schema.ts` | Interfaces: `Customer` (line 109), `Order` (line 442), `OrderStatus`, `CustomerPreferences` (line 98), `Timestamp`, `Branch` (line 686). |
| Customer statistics | `lib/db/schema.ts` | Interface: `CustomerStatistics` (line 216) with `totalOrders`, `lastOrderDate`, `last12MonthsOrders`, `avgOrderValue`, `daysSinceLastOrder`. |

### Communication Infrastructure

| File | Path | Relevance |
|------|------|-----------|
| Wati.io service | `services/wati.ts` | WhatsApp message sending with retry logic. Functions: `sendWhatsAppMessage()`, `formatPhoneNumber()`, `isValidKenyanPhoneNumber()`, `logNotification()`, `updateNotificationStatus()`. Supports template messages with parameters. |
| Notification trigger | `lib/notifications/trigger.ts` | Deprecated but shows webhook pattern for order notifications. Use `app/actions/notifications` pattern instead (server actions). |

### Agent Infrastructure

| File | Path | Relevance |
|------|------|-----------|
| Base agent | `lib/agents/base-agent.ts` | Abstract class with `processRequest()`, `handle()`, `successResponse()`, `errorResponse()`, authorization checks (`checkAuthorization()`), parameter validation. New `ProximityAgent` will extend this. |
| Agent types | `lib/agents/types.ts` | `AgentName`, `AgentAuth`, `AgentRequest`, `AgentResponse`, `AgentCapability`, `StaffRole`. Must extend `AgentName` to include `'proximity-agent'`. |
| Customer agent | `lib/agents/customer-agent.ts` | Pattern to follow for customer data access within agents. |
| LLM client | `lib/llm/llm-client.ts` | `LLMClient` class with `chatCompletion()` for multi-provider LLM access. `getLLMClient()`, `complete()`, `ask()` convenience functions. |
| LLM types | `lib/llm/types.ts` | `ChatMessage`, `ChatCompletionOptions`, `ChatCompletionResponse`. |

### Audit & Analytics

| File | Path | Relevance |
|------|------|-----------|
| Audit logs | `lib/db/audit-logs.ts` | `createAuditLog()` function signature: `(action, resourceType, resourceId, performedBy, performedByName, performedByRole, description, branchId, additionalBranchIds, changes)`. Uses `AuditLogAction` type: `'create' | 'update' | 'delete' | 'transfer' | 'approve' | 'reject' | 'role_change' | 'branch_access_change' | 'permission_change'`. |
| Server analytics | `lib/db/server/analytics-db.ts` | Server-side analytics using `adminDb` (Firebase Admin). Pattern for aggregation queries. Functions like `getTopCustomersServer()`, `getBranchPerformanceServer()`. |

### API Route Pattern

| File | Path | Relevance |
|------|------|-----------|
| Example routes | `app/api/` | 70+ API route files showing Next.js App Router API pattern. All use `export async function POST/GET/PUT(request: NextRequest)` pattern with `NextResponse.json()` returns. Auth validation pattern using Firebase Admin SDK. |

---

## 4. Requirements

All requirements are tagged `[NEW]` since this is an entirely new module.

### Pattern Detection Engine

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-001 | System SHALL analyze a customer's order history (last 12 months) to detect frequency patterns (average days between orders). | P0 | [NEW] |
| FR-M3-002 | System SHALL detect day-of-week preference by analyzing distribution of order creation days across the customer's history. | P0 | [NEW] |
| FR-M3-003 | System SHALL detect time-of-day preference by clustering order creation times into morning (7-12), afternoon (12-17), and evening (17-20) windows. | P1 | [NEW] |
| FR-M3-004 | System SHALL detect branch preference by identifying the mode (most frequent) `branchId` across a customer's orders. | P0 | [NEW] |
| FR-M3-005 | System SHALL calculate a confidence score (0.0-1.0) for each detected pattern based on: number of orders analyzed, regularity of frequency, recency of last order. | P0 | [NEW] |
| FR-M3-006 | System SHALL predict the next order date as: `lastOrderDate + avgFrequencyDays`, adjusted to nearest preferred day-of-week. | P0 | [NEW] |
| FR-M3-007 | System SHALL require a minimum of 3 completed orders for pattern detection (configurable via `ProximityConfig.minOrdersForPattern`). | P0 | [NEW] |
| FR-M3-008 | System SHALL re-analyze patterns on a configurable schedule (default: weekly) and on-demand via API trigger. | P1 | [NEW] |
| FR-M3-009 | System SHALL persist detected patterns in the `customerOrderPatterns` Firestore collection. | P0 | [NEW] |
| FR-M3-010 | System MAY optionally use LLM (via `lib/llm/llm-client.ts`) for sophisticated pattern analysis when statistical methods produce low-confidence results. | P2 | [NEW] |

### Eligibility Scoring

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-011 | System SHALL check that a customer has opted in to proactive offers (`proximityOptIn === true` on the Customer document) before generating any offer. | P0 | [NEW] |
| FR-M3-012 | System SHALL check that a customer's pattern confidence exceeds the branch threshold (default: 0.6) before generating an offer. | P0 | [NEW] |
| FR-M3-013 | System SHALL check that the days since the last offer sent to this customer exceeds the cooldown period (default: 7 days). | P0 | [NEW] |
| FR-M3-014 | System SHALL check that the total offers sent to this customer in the current month does not exceed `maxOffersPerMonth` (default: 4). | P0 | [NEW] |
| FR-M3-015 | System SHALL check that the customer does not have an active or pending offer (status `generated` or `sent`). | P0 | [NEW] |
| FR-M3-016 | System SHALL check that the predicted next order date falls within the offer window (default: next 3 days). | P0 | [NEW] |
| FR-M3-017 | System SHALL produce a composite eligibility score combining pattern confidence, customer value (totalSpent), and response history (past conversion rate). | P1 | [NEW] |

### Cooldown System

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-018 | After an offer is sent, the system SHALL enforce a cooldown of N days (configurable per branch, default: 7) before the next offer to the same customer. | P0 | [NEW] |
| FR-M3-019 | After an offer is declined by the customer, the system SHALL enforce a cooldown of 2N days (double the standard cooldown). | P0 | [NEW] |
| FR-M3-020 | After an offer is ignored (no response within expiry window, default: 48 hours), the system SHALL enforce a cooldown of N days and mark the offer as `ignored`. | P0 | [NEW] |
| FR-M3-021 | After 3 consecutive ignored offers, the system SHALL suspend offers for 30 days and generate an alert for the GM of the customer's preferred branch. | P0 | [NEW] |
| FR-M3-022 | The cooldown period SHALL be stored on the `OfferSchedule` document and checked during eligibility scoring. | P0 | [NEW] |

### Opt-In Management

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-023 | Existing customers SHALL default to `proximityOptIn = false` (opted OUT). Explicit opt-in is required for compliance. | P0 | [NEW] |
| FR-M3-024 | New customers SHALL be presented with a proximity opt-in option during registration (customer portal). | P1 | [NEW] |
| FR-M3-025 | Customers SHALL be able to opt in or out at any time via the customer portal. | P0 | [NEW] |
| FR-M3-026 | Admin/GM SHALL be able to override a customer's opt-in status (with audit log). | P1 | [NEW] |
| FR-M3-027 | When a customer opts out, ALL pending offers (status `generated` or `sent`) SHALL be immediately cancelled. | P0 | [NEW] |
| FR-M3-028 | Opt-in/opt-out changes SHALL be recorded in the audit log with timestamp, actor, and reason. | P0 | [NEW] |

### Offer Generation

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-029 | System SHALL generate personalized offer messages referencing the customer's name, predicted day, preferred time window, and preferred branch. | P0 | [NEW] |
| FR-M3-030 | System SHALL support two offer types: `regular_pickup` (based on pattern alone) and `special_deal` (pattern + attached voucher from Module 6). | P0 | [NEW] |
| FR-M3-031 | Each generated offer SHALL include: `offerId`, `customerId`, `branchId`, `type`, `suggestedPickupDate`, `suggestedPickupTime`, `patternBasis`, `confidenceScore`, `expiresAt`. | P0 | [NEW] |
| FR-M3-032 | System SHALL batch-generate offers daily (configurable time, default: 8:00 AM EAT) for all eligible customers. | P0 | [NEW] |
| FR-M3-033 | System SHALL enforce a maximum of 100 offers per branch per day to prevent accidental mass-send. | P0 | [NEW] |
| FR-M3-034 | Generated offers SHALL be placed in `generated` status for review before sending, OR auto-sent if the branch config permits auto-send (`autoSendOffers = true`). | P1 | [NEW] |

### Offer Distribution

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-035 | System SHALL send offers via WhatsApp using the Wati.io API (following the pattern in `services/wati.ts` function `sendWhatsAppMessage()`). | P0 | [NEW] |
| FR-M3-036 | System SHALL use approved WhatsApp Business API message templates (see Section 10 for template definitions). | P0 | [NEW] |
| FR-M3-037 | If WhatsApp delivery fails after 3 retries (per existing Wati.io retry logic), the system SHALL mark the offer as `sent` but log a delivery failure, and NOT count it as `ignored`. | P0 | [NEW] |
| FR-M3-038 | System SHALL record the `sentAt` timestamp when the offer is successfully dispatched to Wati.io. | P0 | [NEW] |

### Response Tracking

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-039 | System SHALL accept customer responses via WhatsApp webhook (YES/CONFIRM, NO/DECLINE, LATER/SKIP). | P0 | [NEW] |
| FR-M3-040 | A `YES`/`CONFIRM` response SHALL transition the offer to `accepted` status and trigger pickup scheduling. | P0 | [NEW] |
| FR-M3-041 | A `NO`/`DECLINE` response SHALL transition the offer to `declined` status and enforce double cooldown (FR-M3-019). | P0 | [NEW] |
| FR-M3-042 | A `LATER`/`SKIP` response SHALL transition the offer to `declined` status with reason `later` and enforce standard cooldown. | P1 | [NEW] |
| FR-M3-043 | If no response is received within the expiry window (default: 48 hours), the offer SHALL transition to `ignored`. | P0 | [NEW] |
| FR-M3-044 | The `respondedAt` timestamp SHALL be recorded on the `ProximityOffer` document. | P0 | [NEW] |

### Conversion Attribution

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-045 | If a customer places an order within 72 hours of accepting an offer, the system SHALL mark the offer as `converted` and link it to the resulting `orderId`. | P0 | [NEW] |
| FR-M3-046 | Revenue from converted offers SHALL be attributed as the full order `totalAmount`. | P0 | [NEW] |
| FR-M3-047 | Conversion rate SHALL be calculated as: `converted offers / (accepted + declined + ignored offers)` and displayed in analytics. | P1 | [NEW] |
| FR-M3-048 | If a customer places an order BEFORE a pending offer is sent, the system SHALL cancel the pending offer (customer self-served). | P1 | [NEW] |

### Offer Analytics

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-049 | System SHALL track and display: total offers sent, conversion rate, revenue attributed, avg response time, opt-in rate. | P1 | [NEW] |
| FR-M3-050 | System SHALL generate a monthly proximity offer performance report exportable as CSV/Excel. | P2 | [NEW] |
| FR-M3-051 | Director dashboard SHALL include a proximity offers summary card with key metrics. | P1 | [NEW] |
| FR-M3-052 | GM dashboard SHALL include branch-level offer performance summary. | P1 | [NEW] |

### Special Deals Integration

| ID | Requirement | Priority | Tag |
|----|------------|----------|-----|
| FR-M3-053 | System SHALL support attaching a voucher code (from Module 6) to a `special_deal` type offer. | P2 | [NEW] |
| FR-M3-054 | When a `special_deal` offer is generated, the system SHALL reference the `voucherId` from the voucher system and include deal details in the WhatsApp message. | P2 | [NEW] |
| FR-M3-055 | Voucher attachment SHALL be optional and configurable per branch. | P2 | [NEW] |

---

## 5. Data Model

All interfaces below are **NEW**. They will be added to `lib/db/schema.ts` following the existing pattern of TypeScript interfaces with JSDoc annotations.

### 5.1 ProximityOffer

**Firestore Collection:** `proximityOffers`
**Document ID:** `offerId` (auto-generated)

```typescript
/**
 * Proximity offer document structure
 * Collection: proximityOffers
 *
 * Represents a single proactive pickup offer sent to a customer
 * based on their detected order pattern.
 *
 * @see FR-M3-029 through FR-M3-048
 */
export interface ProximityOffer {
  /** Unique offer identifier. Format: PROX-[YYYYMMDD]-[RANDOM] */
  offerId: string;

  /** Reference to customer. Maps to customers.customerId */
  customerId: string;

  /** Customer name (denormalized for display) */
  customerName: string;

  /** Customer phone in E.164 format (denormalized for WhatsApp sending) */
  customerPhone: string;

  /** Branch this offer targets (customer's preferred branch) */
  branchId: string;

  /** Offer type */
  type: ProximityOfferType;

  /** Current offer status */
  status: ProximityOfferStatus;

  /** The personalized message sent/to-be-sent to the customer */
  offerMessage: string;

  /** Suggested date for pickup (YYYY-MM-DD) */
  suggestedPickupDate: string;

  /** Suggested time window for pickup */
  suggestedPickupTime: 'morning' | 'afternoon' | 'evening';

  /** Optional: Voucher ID if this is a special_deal offer (ties to Module 6) */
  voucherId?: string;

  /** Description of the pattern that triggered this offer */
  patternBasis: string;

  /** Reference to the CustomerOrderPattern that triggered this offer */
  patternId?: string;

  /** Confidence score of the underlying pattern (0.0-1.0) */
  confidenceScore: number;

  /** Timestamp when offer was sent via WhatsApp */
  sentAt?: Timestamp;

  /** Timestamp when customer responded */
  respondedAt?: Timestamp;

  /** Customer's response text (raw WhatsApp reply) */
  responseText?: string;

  /** Parsed response category */
  responseCategory?: 'accepted' | 'declined' | 'later' | 'unknown';

  /** Order ID if this offer converted into an order */
  convertedOrderId?: string;

  /** Revenue attributed if converted (full order totalAmount) */
  attributedRevenue?: number;

  /** Wati.io notification ID for tracking delivery status */
  watiNotificationId?: string;

  /** Whether WhatsApp delivery was confirmed */
  whatsappDelivered?: boolean;

  /** Offer creation timestamp */
  createdAt: Timestamp;

  /** Offer expiry timestamp (default: 48 hours after sentAt) */
  expiresAt: Timestamp;

  /** Who or what generated this offer ('system' for batch, userId for manual) */
  generatedBy: string;

  /** Batch ID if generated as part of a batch run */
  batchId?: string;
}

/** Offer type classification */
export type ProximityOfferType = 'regular_pickup' | 'special_deal';

/** Offer lifecycle status */
export type ProximityOfferStatus =
  | 'generated'     // Created, pending send
  | 'approved'      // Approved by GM (if manual approval required)
  | 'sent'          // Sent via WhatsApp
  | 'accepted'      // Customer replied YES
  | 'declined'      // Customer replied NO
  | 'ignored'       // No response within expiry window
  | 'expired'       // Past expiresAt without conversion
  | 'converted'     // Customer placed an order (linked via convertedOrderId)
  | 'cancelled';    // Cancelled (customer opted out, or self-served before send)
```

### 5.2 CustomerOrderPattern

**Firestore Collection:** `customerOrderPatterns`
**Document ID:** `customerId` (one pattern document per customer)

```typescript
/**
 * Customer order pattern document structure
 * Collection: customerOrderPatterns
 *
 * Stores the detected ordering patterns for a customer,
 * computed by analyzing their order history.
 *
 * @see FR-M3-001 through FR-M3-009
 */
export interface CustomerOrderPattern {
  /** Customer ID (also the document ID) */
  customerId: string;

  /** Average days between consecutive orders */
  avgFrequencyDays: number;

  /** Standard deviation of order frequency (lower = more regular) */
  frequencyStdDev: number;

  /** Preferred day of week (0=Sunday, 1=Monday, ..., 6=Saturday) */
  preferredDayOfWeek: number;

  /** Day-of-week distribution (counts per day, 0-6) */
  dayOfWeekDistribution: number[];

  /** Whether day-of-week preference is statistically significant */
  dayOfWeekSignificant: boolean;

  /** Preferred time of day */
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';

  /** Time-of-day distribution (counts per window) */
  timeOfDayDistribution: {
    morning: number;   // 07:00-12:00
    afternoon: number; // 12:00-17:00
    evening: number;   // 17:00-20:00
  };

  /** Most frequently visited branch ID */
  preferredBranchId: string;

  /** Branch visit distribution (branchId -> count) */
  branchDistribution: Record<string, number>;

  /** Date of the customer's most recent order (for recency calculation) */
  lastOrderDate: Timestamp;

  /** Predicted date of next order */
  nextPredictedDate: string; // YYYY-MM-DD

  /** Overall pattern confidence score (0.0-1.0) */
  patternConfidence: number;

  /** Breakdown of confidence components */
  confidenceBreakdown: {
    /** Based on order count relative to minimum threshold */
    volumeScore: number;
    /** Based on frequency regularity (inverse of coefficient of variation) */
    regularityScore: number;
    /** Based on recency of last order */
    recencyScore: number;
    /** Based on strength of day-of-week preference */
    dayPreferenceScore: number;
  };

  /** Seasonal variation detected (if any) */
  seasonalVariation?: {
    /** Whether seasonal pattern is significant */
    detected: boolean;
    /** Peak months (1-12) */
    peakMonths?: number[];
    /** Low months (1-12) */
    lowMonths?: number[];
  };

  /** Total number of orders analyzed to produce this pattern */
  totalOrdersAnalyzed: number;

  /** Date range of orders analyzed */
  analysisWindow: {
    from: Timestamp;
    to: Timestamp;
  };

  /** When this pattern was last computed */
  lastAnalyzedAt: Timestamp;

  /** Whether this pattern is considered stale (no order in 60+ days) */
  isStale: boolean;

  /** Version of the analysis algorithm used */
  algorithmVersion: string;
}
```

### 5.3 OfferSchedule

**Firestore Collection:** `offerSchedules`
**Document ID:** `customerId` (one schedule per customer)

```typescript
/**
 * Offer schedule document structure
 * Collection: offerSchedules
 *
 * Tracks the scheduling state for a customer's proximity offers,
 * including cooldown enforcement and attempt tracking.
 *
 * @see FR-M3-018 through FR-M3-022
 */
export interface OfferSchedule {
  /** Schedule ID (same as customerId for 1:1 mapping) */
  scheduleId: string;

  /** Reference to customer */
  customerId: string;

  /** Next eligible date for an offer (YYYY-MM-DD) */
  nextOfferDate: string;

  /** Planned offer type for next offer */
  nextOfferType: ProximityOfferType;

  /** Reference to the customer's detected pattern */
  patternId: string;

  /** Cooldown end date -- no offers before this date */
  cooldownUntil: Timestamp;

  /** Total offers sent to this customer (lifetime) */
  totalAttempts: number;

  /** Offers sent this month */
  monthlyAttempts: number;

  /** Month tracker for resetting monthly count (YYYY-MM) */
  currentMonth: string;

  /** Total conversions (lifetime) */
  totalConversions: number;

  /** This customer's personal conversion rate */
  conversionRate: number;

  /** Consecutive ignored offers count (resets on accepted/declined) */
  consecutiveIgnored: number;

  /** Whether offers are suspended for this customer */
  suspended: boolean;

  /** Reason for suspension (if suspended) */
  suspensionReason?: string;

  /** Date when suspension expires (if suspended) */
  suspensionExpiresAt?: Timestamp;

  /** Last offer sent date */
  lastOfferDate?: Timestamp;

  /** Last offer ID sent */
  lastOfferId?: string;

  /** Last offer outcome */
  lastOfferOutcome?: ProximityOfferStatus;

  /** When this schedule was last updated */
  updatedAt: Timestamp;
}
```

### 5.4 ProximityConfig

**Firestore Collection:** `proximityConfig`
**Document ID:** `branchId` or `'global'`

```typescript
/**
 * Proximity configuration document structure
 * Collection: proximityConfig
 *
 * Configurable thresholds and limits for the proximity offer system.
 * Can be set globally or per-branch (branch overrides global).
 *
 * @see FR-M3-007, FR-M3-012 through FR-M3-016, FR-M3-033
 */
export interface ProximityConfig {
  /** Branch ID or 'global' for system-wide defaults */
  configId: string;

  /** Minimum number of completed orders required for pattern detection */
  minOrdersForPattern: number; // Default: 3

  /** Minimum cooldown days between offers to the same customer */
  cooldownDays: number; // Default: 7

  /** Maximum offers per customer per month */
  maxOffersPerMonth: number; // Default: 4

  /** Minimum pattern confidence threshold for offer generation */
  confidenceThreshold: number; // Default: 0.6

  /** Hours before an unanswered offer expires */
  offerExpiryHours: number; // Default: 48

  /** Days before predicted order date to send the offer */
  offerWindowDays: number; // Default: 3

  /** Maximum offers per branch per day (rate limit) */
  maxOffersPerBranchPerDay: number; // Default: 100

  /** Days of week when offers can be sent (0=Sunday, 6=Saturday) */
  enabledDaysOfWeek: number[]; // Default: [1,2,3,4,5] (Mon-Fri)

  /** Specific dates when no offers should be sent (YYYY-MM-DD) */
  blackoutDates: string[]; // Default: []

  /** Hour of day to run batch generation (0-23, EAT) */
  batchGenerationHour: number; // Default: 8 (8:00 AM EAT)

  /** Whether to auto-send generated offers or require manual approval */
  autoSendOffers: boolean; // Default: false

  /** Consecutive ignored count before suspension */
  maxConsecutiveIgnored: number; // Default: 3

  /** Days of suspension after max consecutive ignored */
  suspensionDays: number; // Default: 30

  /** Conversion attribution window in hours */
  conversionWindowHours: number; // Default: 72

  /** Days after last order before pattern is considered stale */
  patternStaleDays: number; // Default: 60

  /** Whether this module is enabled for the branch */
  enabled: boolean; // Default: false

  /** Whether special deal offers (with vouchers) are enabled */
  specialDealsEnabled: boolean; // Default: false

  /** Last updated timestamp */
  updatedAt: Timestamp;

  /** Who last updated this config */
  updatedBy: string;
}
```

### 5.5 Customer Interface Extension

The existing `Customer` interface in `lib/db/schema.ts` (line 109) must be extended with the following fields:

```typescript
// Add to Customer interface in lib/db/schema.ts

  // ===== Proximity Offers (Module 3) =====

  /** Whether customer has opted in to receive proactive pickup offers */
  proximityOptIn?: boolean;

  /** When customer opted in/out (for compliance tracking) */
  proximityOptInChangedAt?: Timestamp;

  /** Who changed the opt-in status ('self' for customer, userId for admin override) */
  proximityOptInChangedBy?: string;
```

### 5.6 Firestore Index Requirements

```
// Composite indexes required for proximityOffers collection
proximityOffers: customerId ASC, status ASC, createdAt DESC
proximityOffers: branchId ASC, status ASC, createdAt DESC
proximityOffers: status ASC, expiresAt ASC
proximityOffers: batchId ASC, status ASC

// Composite indexes required for customerOrderPatterns
customerOrderPatterns: preferredBranchId ASC, patternConfidence DESC
customerOrderPatterns: isStale ASC, lastAnalyzedAt ASC

// Composite indexes required for offerSchedules
offerSchedules: suspended ASC, nextOfferDate ASC
offerSchedules: cooldownUntil ASC, suspended ASC
```

---

## 6. State Machine / Workflows

### 6.1 Pattern Analysis Pipeline

```
                          +-----------------+
                          |  SCHEDULED_SCAN |  (triggered by cron or manual API)
                          +-----------------+
                                  |
                                  v
                         +------------------+
                         | ANALYZING_ORDERS |  (query orders, compute statistics)
                         +------------------+
                              /         \
                             /           \
                            v             v
                 +------------------+  +--------------+
                 | PATTERN_DETECTED |  |  NO_PATTERN  |  (insufficient data or irregular)
                 +------------------+  +--------------+
                         |                    |
                         v                    v
                +--------------------+    (skip customer)
                | ELIGIBILITY_CHECK  |
                +--------------------+
                     /           \
                    /             \
                   v               v
          +------------------+  +---------+
          | OFFER_GENERATED  |  | SKIPPED |  (failed eligibility)
          +------------------+  +---------+
```

**State Transitions:**

| From | To | Trigger | Side Effects |
|------|----|---------|--------------|
| SCHEDULED_SCAN | ANALYZING_ORDERS | Cron job fires at `batchGenerationHour` OR manual API call | Query all customers with `proximityOptIn = true` |
| ANALYZING_ORDERS | PATTERN_DETECTED | Order count >= `minOrdersForPattern` AND statistical tests pass | Upsert `CustomerOrderPattern` document |
| ANALYZING_ORDERS | NO_PATTERN | Order count < minimum OR pattern is too irregular | Skip customer; optionally mark pattern as low-confidence |
| PATTERN_DETECTED | ELIGIBILITY_CHECK | Pattern confidence >= `confidenceThreshold` | Run all eligibility checks (FR-M3-011 through FR-M3-016) |
| ELIGIBILITY_CHECK | OFFER_GENERATED | All eligibility checks pass | Create `ProximityOffer` with status `generated`; update `OfferSchedule` |
| ELIGIBILITY_CHECK | SKIPPED | Any eligibility check fails | Log reason; no offer created |

### 6.2 Offer Lifecycle

```
  +------------+
  | GENERATED  |  (created by batch or manual generation)
  +------------+
       |
       |  (auto-send OR manual approval)
       v
  +----------+
  |   SENT   |  (dispatched via WhatsApp)
  +----------+
     / | \  \
    /  |  \  \____________________________
   /   |   \                               \
  v    v    v                               v
+----------+ +----------+ +---------+  +-----------+
| ACCEPTED | | DECLINED | | IGNORED |  | CANCELLED |
+----------+ +----------+ +---------+  +-----------+
     |                                        |
     |  (customer places order                |
     |   within 72 hours)                     |
     v                                        |
+-----------+                                 |
| CONVERTED |  (linked to orderId)            |
+-----------+                                 |
                                              |
  Also: SENT --> CANCELLED (customer opts out while offer pending)
  Also: GENERATED --> CANCELLED (customer self-served before send)
  Also: ACCEPTED --> EXPIRED (72h passed without order placement)
```

**State Transitions:**

| From | To | Trigger | Side Effects |
|------|----|---------|--------------|
| `generated` | `approved` | GM clicks "Approve" in OfferQueueManager (only if `autoSendOffers = false`) | Audit log: offer approved |
| `generated` | `sent` | Auto-send enabled OR manually triggered send | Call `sendWhatsAppMessage()` via Wati.io; record `sentAt`; start expiry timer |
| `approved` | `sent` | System dispatches approved offer | Call `sendWhatsAppMessage()` via Wati.io; record `sentAt` |
| `generated` | `cancelled` | Customer places an order before offer is sent (self-served) | Update `OfferSchedule.lastOfferOutcome` |
| `sent` | `accepted` | Customer WhatsApp reply: YES/CONFIRM | Record `respondedAt`; reset `consecutiveIgnored` to 0; optionally trigger pickup scheduling |
| `sent` | `declined` | Customer WhatsApp reply: NO/DECLINE | Record `respondedAt`; enforce 2x cooldown; reset `consecutiveIgnored` to 0 |
| `sent` | `declined` | Customer WhatsApp reply: LATER/SKIP | Record `respondedAt`; enforce 1x cooldown; `responseCategory = 'later'` |
| `sent` | `ignored` | Expiry timer fires (48h default) with no response | Increment `consecutiveIgnored`; enforce 1x cooldown; check for suspension trigger |
| `sent` | `cancelled` | Customer opts out while offer is pending | Immediately cancel; audit log |
| `accepted` | `converted` | Customer places order within `conversionWindowHours` (72h) | Link `convertedOrderId`; record `attributedRevenue`; increment `totalConversions` |
| `accepted` | `expired` | `conversionWindowHours` passes without order | Offer accepted but customer did not follow through; still counts as engagement |
| `ignored` | -- | 3 consecutive ignores | Suspend customer offers for `suspensionDays`; alert GM |

### 6.3 Expiry Batch Job

A scheduled job runs hourly to:
1. Query `proximityOffers` where `status = 'sent'` AND `expiresAt <= now()`
2. Transition each to `ignored`
3. Update corresponding `OfferSchedule` (increment `consecutiveIgnored`, set cooldown)
4. Check suspension trigger

A second scheduled job runs hourly to:
1. Query `proximityOffers` where `status = 'accepted'` AND `expiresAt <= now() + conversionWindowHours`
2. Check if a matching order exists for the customer
3. If yes: transition to `converted`; if no: transition to `expired`

---

## 7. API Specification

All endpoints are **NEW**. They follow the Next.js App Router API pattern used throughout the codebase (e.g., `app/api/pricing/rules/route.ts`).

**Base path:** `/api/proximity/`

### 7.1 POST /api/proximity/analyze

**Description:** Trigger pattern analysis for all opted-in customers or a specific customer.

```typescript
// Request
POST /api/proximity/analyze
Authorization: Bearer <firebase-jwt>
Content-Type: application/json

{
  customerId?: string;    // If provided, analyze only this customer. If omitted, analyze all eligible.
  branchId?: string;      // If provided, analyze only customers for this branch.
  forceReanalyze?: boolean; // If true, re-analyze even if pattern is fresh. Default: false.
}

// Response 200
{
  success: true,
  data: {
    customersAnalyzed: number;
    patternsDetected: number;
    patternsUpdated: number;
    errors: number;
    duration: number; // milliseconds
  }
}

// Response 403
{
  success: false,
  error: "Insufficient permissions. Required: general_manager, director, or admin."
}
```

**Auth:** Requires `general_manager`, `director`, or `admin` role.

### 7.2 GET /api/proximity/patterns/:customerId

**Description:** Get a customer's detected order patterns.

```typescript
// Request
GET /api/proximity/patterns/CUST-ABC123
Authorization: Bearer <firebase-jwt>

// Response 200
{
  success: true,
  data: CustomerOrderPattern // Full pattern document
}

// Response 404
{
  success: false,
  error: "No pattern found for customer CUST-ABC123"
}
```

**Auth:** Requires `store_manager`, `general_manager`, `director`, or `admin` role. Customer can view their own pattern via the customer portal endpoint.

### 7.3 POST /api/proximity/offers

**Description:** Generate and queue offers for eligible customers.

```typescript
// Request
POST /api/proximity/offers
Authorization: Bearer <firebase-jwt>
Content-Type: application/json

{
  branchId?: string;      // Generate for a specific branch. Omit for all branches.
  customerId?: string;    // Generate for a specific customer (manual one-off offer).
  offerType?: ProximityOfferType; // Default: 'regular_pickup'
  voucherId?: string;     // For 'special_deal' type only.
  forceGenerate?: boolean; // Skip eligibility checks (admin only). Default: false.
}

// Response 200
{
  success: true,
  data: {
    offersGenerated: number;
    offersSkipped: number;
    skippedReasons: Record<string, number>; // e.g., { "cooldown_active": 5, "no_pattern": 12 }
    offers: Array<{
      offerId: string;
      customerId: string;
      customerName: string;
      status: ProximityOfferStatus;
    }>;
  }
}
```

**Auth:** Requires `general_manager`, `director`, or `admin` role.

### 7.4 POST /api/proximity/offers/:offerId/send

**Description:** Send a specific offer via WhatsApp.

```typescript
// Request
POST /api/proximity/offers/PROX-20260212-XYZ/send
Authorization: Bearer <firebase-jwt>

// Response 200
{
  success: true,
  data: {
    offerId: string;
    whatsappStatus: 'sent' | 'failed';
    watiNotificationId?: string;
    error?: string;
  }
}

// Response 400
{
  success: false,
  error: "Offer is not in 'generated' or 'approved' status"
}
```

**Auth:** Requires `general_manager`, `director`, or `admin` role.

### 7.5 POST /api/proximity/offers/:offerId/respond

**Description:** Record a customer's response to an offer. Called by WhatsApp webhook handler.

```typescript
// Request
POST /api/proximity/offers/PROX-20260212-XYZ/respond
Authorization: Bearer <webhook-api-key>
Content-Type: application/json

{
  responseText: string;   // Raw WhatsApp message text
  responseFrom: string;   // Phone number (E.164)
  timestamp: string;      // ISO 8601
}

// Response 200
{
  success: true,
  data: {
    offerId: string;
    parsedResponse: 'accepted' | 'declined' | 'later' | 'unknown';
    newStatus: ProximityOfferStatus;
    cooldownApplied: boolean;
    cooldownUntil?: string; // YYYY-MM-DD
  }
}
```

**Auth:** Webhook API key authentication (same pattern as `app/api/webhooks/order-notifications/route.ts`).

### 7.6 GET /api/proximity/offers

**Description:** List offers with filters.

```typescript
// Request
GET /api/proximity/offers?status=sent&branchId=BRANCH-001&limit=50&offset=0
Authorization: Bearer <firebase-jwt>

// Query Parameters
{
  status?: ProximityOfferStatus;
  branchId?: string;
  customerId?: string;
  type?: ProximityOfferType;
  dateFrom?: string;  // YYYY-MM-DD
  dateTo?: string;    // YYYY-MM-DD
  limit?: number;     // Default: 50, Max: 200
  offset?: number;    // Default: 0
}

// Response 200
{
  success: true,
  data: {
    offers: ProximityOffer[];
    total: number;
    hasMore: boolean;
  }
}
```

**Auth:** `store_manager`, `general_manager`, `director`, or `admin`.

### 7.7 GET /api/proximity/analytics

**Description:** Get offer conversion analytics.

```typescript
// Request
GET /api/proximity/analytics?branchId=BRANCH-001&period=30d
Authorization: Bearer <firebase-jwt>

// Query Parameters
{
  branchId?: string;    // Omit for all branches
  period?: '7d' | '30d' | '90d' | '12m'; // Default: '30d'
}

// Response 200
{
  success: true,
  data: {
    summary: {
      totalOffersSent: number;
      totalAccepted: number;
      totalDeclined: number;
      totalIgnored: number;
      totalConverted: number;
      totalExpired: number;
      conversionRate: number;       // percentage
      acceptanceRate: number;       // percentage
      revenueAttributed: number;    // KES
      avgResponseTimeMinutes: number;
      optInRate: number;            // percentage of customers opted in
    };
    trends: Array<{
      date: string;   // YYYY-MM-DD
      sent: number;
      accepted: number;
      declined: number;
      ignored: number;
      converted: number;
      revenue: number;
    }>;
    topPatterns: Array<{
      patternDescription: string;
      customerCount: number;
      conversionRate: number;
    }>;
    branchBreakdown: Array<{
      branchId: string;
      branchName: string;
      offersSent: number;
      conversionRate: number;
      revenueAttributed: number;
    }>;
    responseBreakdown: {
      accepted: number;
      declined: number;
      ignored: number;
      later: number;
    };
  }
}
```

**Auth:** `general_manager`, `director`, or `admin`.

### 7.8 PUT /api/proximity/config

**Description:** Update proximity configuration for a branch or globally.

```typescript
// Request
PUT /api/proximity/config
Authorization: Bearer <firebase-jwt>
Content-Type: application/json

{
  configId: string;  // branchId or 'global'
  updates: Partial<Omit<ProximityConfig, 'configId' | 'updatedAt' | 'updatedBy'>>;
}

// Response 200
{
  success: true,
  data: ProximityConfig // Updated config
}
```

**Auth:** `director` or `admin` only.

### 7.9 GET /api/proximity/config

**Description:** Get proximity configuration.

```typescript
// Request
GET /api/proximity/config?configId=BRANCH-001
Authorization: Bearer <firebase-jwt>

// Response 200
{
  success: true,
  data: {
    effective: ProximityConfig;    // Merged global + branch overrides
    global: ProximityConfig;       // Global defaults
    branch?: ProximityConfig;      // Branch-specific overrides (if any)
  }
}
```

**Auth:** `general_manager`, `director`, or `admin`.

### 7.10 POST /api/customers/:customerId/proximity-optin

**Description:** Customer opts in or out of proactive offers.

```typescript
// Request
POST /api/customers/CUST-ABC123/proximity-optin
Authorization: Bearer <firebase-jwt>
Content-Type: application/json

{
  optIn: boolean;
  reason?: string; // Optional reason for the change
}

// Response 200
{
  success: true,
  data: {
    customerId: string;
    proximityOptIn: boolean;
    changedAt: string;      // ISO 8601
    cancelledOffers: number; // Number of pending offers cancelled (if opting out)
  }
}
```

**Auth:** Customer (self-service, must match `customerId`), or `admin` (override for any customer).

---

## 8. UI Specification

All components and pages below are **NEW**.

### 8.1 Page Routes

| Route | Role Access | Description |
|-------|------------|-------------|
| `/director/customers` | Director | Customer Intelligence page -- shared with Module 4. Proximity section shows pattern analytics, offer performance, and top converting patterns. |
| `/gm/proximity` | GM | Branch-level proximity management -- offer queue, config, branch analytics. |

### 8.2 Admin/Staff Components

#### ProximityConfigPanel

**Location:** `components/features/proximity/ProximityConfigPanel.tsx`
**Used on:** `/director/customers` (Director), `/gm/proximity` (GM)

**Description:** Configuration form for proximity offer thresholds and limits.

**Fields (maps to `ProximityConfig`):**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Enabled | Toggle | false | Master switch for the module per branch |
| Min Orders for Pattern | Number input | 3 | Minimum order history required |
| Cooldown Days | Number input | 7 | Days between offers |
| Max Offers/Month | Number input | 4 | Monthly offer cap per customer |
| Confidence Threshold | Slider (0.0-1.0) | 0.6 | Minimum pattern confidence |
| Offer Expiry Hours | Number input | 48 | Hours before unanswered offer expires |
| Offer Window Days | Number input | 3 | Days before predicted date to send |
| Max Offers/Branch/Day | Number input | 100 | Daily rate limit |
| Batch Generation Hour | Select (0-23) | 8 | When daily batch runs |
| Auto-Send | Toggle | false | Skip manual approval |
| Enabled Days | Checkbox group | Mon-Fri | Days when offers can be sent |
| Blackout Dates | Date picker (multi) | [] | Holiday/blocked dates |
| Special Deals | Toggle | false | Enable voucher-attached offers |

**Design:** Follows the `BranchConfigPanel` pattern from the existing branch management UI. Uses shadcn/ui form components (Input, Switch, Slider, Select, Checkbox). Card layout with sections.

#### OfferQueueManager

**Location:** `components/features/proximity/OfferQueueManager.tsx`
**Used on:** `/gm/proximity`

**Description:** Table of pending/recent offers with approve, reject, and send actions.

**Table columns:**
- Customer Name
- Phone
- Offer Type (badge: regular_pickup / special_deal)
- Suggested Date
- Confidence (progress bar, 0-100%)
- Pattern Basis (truncated text)
- Status (badge with color)
- Actions (Send / Approve / Cancel / View)

**Filters:**
- Status dropdown (generated, approved, sent, accepted, declined, ignored, converted, cancelled)
- Date range picker
- Search by customer name/phone

**Bulk actions:**
- "Approve All" (for generated offers)
- "Send All Approved"
- "Cancel Selected"

**Design:** Uses shadcn/ui DataTable pattern with pagination (50 per page). Follow the table pattern used in existing admin tables throughout the codebase.

#### PatternVisualization

**Location:** `components/features/proximity/PatternVisualization.tsx`
**Used on:** Customer detail view, `/director/customers`

**Description:** Visual display of a customer's detected order patterns.

**Sections:**
1. **Frequency Chart** -- Horizontal bar showing days between orders (with avg line and std dev band)
2. **Day-of-Week Heatmap** -- 7-column bar chart showing order distribution by day (highlight preferred day)
3. **Time-of-Day Distribution** -- 3-segment bar (morning/afternoon/evening) with preference highlighted
4. **Branch Preference** -- Pie chart of branch visit distribution
5. **Confidence Gauge** -- Circular gauge showing overall pattern confidence with breakdown tooltip
6. **Prediction** -- Card showing "Next predicted order: [date], [time], [branch]" with confidence badge

**Design:** Uses Recharts for charts (consistent with `components/features/director/KeyDriversChart.tsx` and `components/features/director/PredictivePerformanceChart.tsx`).

#### OfferAnalyticsDashboard

**Location:** `components/features/proximity/OfferAnalyticsDashboard.tsx`
**Used on:** `/director/customers` (proximity section)

**Description:** Comprehensive analytics for proximity offer performance.

**Charts and metrics (detailed in Section 9).**

### 8.3 Customer Portal Components

#### OfferInbox

**Location:** `components/features/customer-portal/OfferInbox.tsx`
**Used on:** Customer portal main page

**Description:** List of pending and past offers for the authenticated customer.

**For each offer:**
- Offer message text
- Suggested pickup date and time
- Status badge (pending, accepted, declined, expired)
- Action buttons: "Accept" / "Decline" / "Schedule Later"
- If special_deal: Show voucher details

**Design:** Card list, sorted by date descending. Pending offers at top with prominent action buttons. Past offers below in muted style.

#### ProximityOptInToggle

**Location:** `components/features/customer-portal/ProximityOptInToggle.tsx`
**Used on:** Customer portal settings/preferences page

**Description:** Prominent toggle for customer to opt in/out of proactive pickup offers.

**Layout:**
- Icon + heading: "Proactive Pickup Reminders"
- Description text: "We'll analyze your visit pattern and suggest pickup times before you need to remember. You can opt out at any time."
- Toggle switch: ON/OFF
- When toggling OFF: Confirmation dialog: "Are you sure? You won't receive any proactive pickup suggestions."
- Status indicator: "You are currently [opted in / opted out]"
- Last changed: "[date]"

**Design:** Uses shadcn/ui Switch component. Follows the pattern of other preference toggles in the customer portal.

#### OfferHistory

**Location:** `components/features/customer-portal/OfferHistory.tsx`
**Used on:** Customer portal

**Description:** Historical view of all past offers with outcomes.

**Table/list columns:**
- Date Sent
- Suggested Pickup
- Your Response (accepted/declined/ignored)
- Outcome (converted to order / expired)
- Order Link (if converted)

#### CustomerPatternView (Optional -- P2)

**Location:** `components/features/customer-portal/CustomerPatternView.tsx`
**Used on:** Customer portal (under "My Activity" or "Insights")

**Description:** Transparency page showing the customer what patterns the system detected.

**Content:**
- "We've noticed you typically visit on [Tuesdays]"
- "You usually drop off in the [morning]"
- "Your preferred branch is [Kilimani]"
- "You visit roughly every [14 days]"
- Link to opt-in/out toggle

---

## 9. Dashboard & Reporting Outputs

### 9.1 Director Dashboard (Risk Radar)

**Integration point:** Existing Director dashboard's Risk Radar component.

**New alert:** "Low Proximity Offer Conversion Rate"
- Trigger: Branch-level conversion rate falls below 10% over a 30-day window
- Severity: Warning (amber)
- Action: Link to `/director/customers` proximity section

### 9.2 Director Module Page (`/director/customers` -- Proximity Section)

This section is added to the shared Customer Intelligence page alongside Module 4 content.

**Charts:**

| Chart | Type | Data Source |
|-------|------|-------------|
| Offer Conversion Rate Over Time | Line chart (Recharts `<LineChart>`) | `GET /api/proximity/analytics` `trends[]` |
| Revenue Attributed to Proactive Offers | Bar chart (Recharts `<BarChart>`) | `trends[].revenue` |
| Offer Volume by Branch | Bar chart (horizontal) | `branchBreakdown[]` |
| Pattern Confidence Distribution | Histogram (Recharts `<BarChart>`) | Query `customerOrderPatterns` collection, bin by `patternConfidence` |
| Opt-In Rate Trend | Line chart | Query `customers` collection, aggregate `proximityOptIn = true` over time |
| Top Converting Patterns | Table (shadcn/ui DataTable) | `topPatterns[]` |
| Customer Response Breakdown | Pie chart (Recharts `<PieChart>`) | `responseBreakdown` |

**KPI Cards (top row):**
- Total Offers Sent (this period)
- Conversion Rate (percentage, with trend arrow)
- Revenue Attributed (KES, with trend arrow)
- Avg Response Time
- Active Opted-In Customers

### 9.3 GM Dashboard

**New card:** "Proximity Offers -- [Branch Name]"

**Metrics:**
- Offers sent today: [N]
- Pending approval: [N] (with link to `/gm/proximity`)
- This month's conversion rate: [X%]
- Revenue from offers: KES [amount]

### 9.4 Reports

**Proximity Offer Performance Report (CSV/Excel export):**

Columns:
- Report Period
- Branch
- Total Offers Generated
- Total Offers Sent
- Total Accepted
- Total Declined
- Total Ignored
- Total Converted
- Conversion Rate (%)
- Revenue Attributed (KES)
- Avg Confidence Score
- Opt-In Rate (%)
- Top Pattern (description)
- Avg Response Time (minutes)

**Customer Engagement Report (CSV/Excel export):**

Columns:
- Customer ID
- Customer Name
- Phone
- Preferred Branch
- Opt-In Status
- Pattern Confidence
- Total Offers Received
- Total Accepted
- Total Declined
- Total Ignored
- Conversion Rate
- Lifetime Revenue
- Last Offer Date
- Next Predicted Order

---

## 10. Notification & Messaging Flows

### 10.1 WhatsApp Templates

All templates require Meta Business API approval. **Lead time: 2-4 weeks.** Template submission must begin in the first week of implementation.

#### Template: `proactive_pickup_offer`

**Category:** Marketing
**Language:** English (en)

```
Hi {{1}}, based on your usual schedule, would you like us to pick up your
laundry this {{2}}? We can have a driver at your door in the {{3}}.

Reply:
YES - Schedule pickup
NO - Skip this time
LATER - Remind me later

Lorenzo Dry Cleaners {{4}}
```

**Parameters:**
| Param | Maps To | Example |
|-------|---------|---------|
| `{{1}}` | `customer.name` | "Sarah" |
| `{{2}}` | `suggestedPickupDate` formatted as day name | "Tuesday" |
| `{{3}}` | `suggestedPickupTime` | "morning (8AM-12PM)" |
| `{{4}}` | Branch name | "- Kilimani Branch" |

**Wati.io integration:**

```typescript
// Following the pattern from services/wati.ts sendWhatsAppMessage()
await sendWhatsAppMessage(
  customer.phone,
  'proactive_pickup_offer',
  {
    '1': customer.name,
    '2': dayName,           // e.g., "Tuesday"
    '3': timeWindowLabel,   // e.g., "morning (8AM-12PM)"
    '4': `- ${branchName}`, // e.g., "- Kilimani Branch"
  },
  undefined,  // no orderId
  customer.customerId
);
```

#### Template: `special_deal_offer`

**Category:** Marketing
**Language:** English (en)

```
Hi {{1}}, we have a special offer for you!

{{2}}

Would you like to schedule a pickup this {{3}}?

Reply:
YES - Schedule pickup & claim offer
NO - Skip this time

Valid until: {{4}}
Lorenzo Dry Cleaners {{5}}
```

**Parameters:**
| Param | Maps To | Example |
|-------|---------|---------|
| `{{1}}` | `customer.name` | "Sarah" |
| `{{2}}` | Deal description from voucher | "20% off your next order!" |
| `{{3}}` | `suggestedPickupDate` formatted | "Tuesday morning" |
| `{{4}}` | Voucher expiry date | "March 15, 2026" |
| `{{5}}` | Branch name | "- Kilimani Branch" |

### 10.2 Response Handling

When a customer replies to a WhatsApp offer, the Wati.io webhook fires to our existing webhook infrastructure. A new handler must be added:

**Webhook endpoint:** `POST /api/webhooks/proximity-response`

**Response parsing logic:**

```typescript
function parseProximityResponse(text: string): 'accepted' | 'declined' | 'later' | 'unknown' {
  const normalized = text.trim().toLowerCase();

  // Accepted patterns
  if (['yes', 'y', 'confirm', 'ok', 'okay', 'sure', 'schedule', 'ndio', 'sawa'].includes(normalized)) {
    return 'accepted';
  }

  // Declined patterns
  if (['no', 'n', 'decline', 'skip', 'stop', 'hapana', 'cancel'].includes(normalized)) {
    return 'declined';
  }

  // Later patterns
  if (['later', 'not now', 'remind', 'next time', 'baadaye'].includes(normalized)) {
    return 'later';
  }

  return 'unknown';
}
```

If `unknown`: Log the raw response and leave offer in `sent` status for manual review. Do NOT auto-expire.

### 10.3 In-App Notifications

| Recipient | Notification | Trigger |
|-----------|-------------|---------|
| GM | "X offers generated for your branch today" | Batch generation completes |
| GM | "Customer [name] accepted a pickup offer" | Offer accepted |
| GM | "3 offers expired without response for [branch]" | Expiry batch job |
| GM | "Offers suspended for [customer] -- 3 consecutive ignores" | Suspension trigger |
| Director | "Branch [name] proximity conversion below 10%" | Risk radar trigger |
| Admin | "WhatsApp template pending approval -- submit to Meta" | System startup check |

### 10.4 Template Approval Timeline

```
Week 1: Draft templates, create Wati.io template request
Week 1-2: Submit to Meta for Business API approval
Week 2-4: Wait for Meta review (avg 5-7 business days, up to 4 weeks)
Week 3-4: If rejected, revise and resubmit
Week 4+: Templates available for production use
```

**CRITICAL:** Template submission must begin in parallel with code development, not after.

---

## 11. Audit & Compliance

All proximity actions generate audit logs following the pattern in `lib/db/audit-logs.ts` using `createAuditLog()`.

### 11.1 Audit Events

| Event | Action | Resource Type | Resource ID | Description |
|-------|--------|--------------|-------------|-------------|
| Pattern analysis run | `create` | `proximity_analysis` | batch ID | "Pattern analysis batch completed: X customers analyzed, Y patterns detected" |
| Pattern detected/updated | `create` or `update` | `customer_order_pattern` | customerId | "Order pattern detected for customer [name]: every [N] days, [day], [time], [branch]" |
| Offer generated | `create` | `proximity_offer` | offerId | "Proximity offer generated for [customer], confidence [X], pickup [date]" |
| Offer approved | `approve` | `proximity_offer` | offerId | "Proximity offer approved by [GM name]" |
| Offer sent | `update` | `proximity_offer` | offerId | "Proximity offer sent via WhatsApp to [phone]" |
| Offer response received | `update` | `proximity_offer` | offerId | "Customer responded: [accepted/declined/later]" |
| Offer expired | `update` | `proximity_offer` | offerId | "Proximity offer expired without response" |
| Offer converted | `update` | `proximity_offer` | offerId | "Proximity offer converted to order [orderId], KES [amount]" |
| Offer cancelled | `delete` | `proximity_offer` | offerId | "Proximity offer cancelled: [reason]" |
| Customer opt-in change | `update` | `customer` | customerId | "Customer [name] proximity opt-in changed to [true/false] by [actor]" |
| Config updated | `update` | `proximity_config` | configId | "Proximity config updated: [field changes]" |
| Customer suspended | `update` | `offer_schedule` | customerId | "Offers suspended for [customer]: 3 consecutive ignores" |

### 11.2 Compliance Requirements

**GDPR / Kenya Data Protection Act (DPA) 2019:**

| Requirement | Implementation |
|-------------|---------------|
| Explicit consent required | `proximityOptIn` must be explicitly set to `true` by customer action. Never default to `true`. |
| Right to withdraw consent | Opt-out via customer portal (`POST /api/customers/:id/proximity-optin`) is immediate and irrevocable until customer opts back in. |
| Data minimization | Pattern data (`CustomerOrderPattern`) stores only aggregated statistics, not individual order details. |
| Transparency | `CustomerPatternView` component (P2) shows customer what patterns are detected. |
| Right to erasure | When customer requests account deletion, all `customerOrderPatterns`, `offerSchedules`, and `proximityOffers` for that customer must be deleted. |
| Audit trail | All opt-in/out changes are logged with timestamp, actor, and reason. |
| Data retention | `proximityOffers` older than 12 months SHALL be archived/deleted. `customerOrderPatterns` are recomputed and don't accumulate. |

---

## 12. Customer Portal Impact

### 12.1 New Pages/Sections

| Component | Priority | Description |
|-----------|----------|-------------|
| `OfferInbox` | P0 | Pending offers with accept/decline buttons. Prominent on customer portal home. |
| `ProximityOptInToggle` | P0 | Opt-in/out toggle on settings/preferences page. Must be easy to find. |
| `OfferHistory` | P1 | Past offers with outcomes. Under "My Orders" or separate tab. |
| `CustomerPatternView` | P2 | Optional transparency page showing detected patterns. |

### 12.2 Integration with Existing Portal

The customer portal does not have existing components at `components/features/customer-portal/` (directory is empty per glob search). These components will be the first customer portal feature components.

**Navigation addition:**
- Add "Pickup Offers" menu item to customer portal sidebar/nav
- Add "Notification Preferences" section to customer settings page (shared with Module 4)
- Show offer badge count on nav item when pending offers exist

### 12.3 Mobile Responsiveness

All customer portal components must follow mobile-first design:
- `OfferInbox`: Full-width cards, large touch targets for accept/decline buttons
- `ProximityOptInToggle`: Standard mobile switch component
- `OfferHistory`: Responsive table/card list that stacks on mobile

---

## 13. Branch Scoping

### 13.1 Branch-Specific Offers

Offers are always branch-specific. The target branch is determined by the customer's **historical branch visits** as detected by the pattern analysis engine.

**Logic:**
1. `CustomerOrderPattern.preferredBranchId` = mode of `branchId` across customer's orders
2. Offer is tagged with this `branchId`
3. If customer visits multiple branches with similar frequency, use the most recently visited branch
4. If a branch is deactivated (`Branch.active = false`), fall back to the second-most-visited branch

### 13.2 Configuration Scoping

```
ProximityConfig (global) --> ProximityConfig (branch override)
```

Branch-specific config overrides global defaults. If a branch has no specific config, global defaults apply. Resolution:

```typescript
function getEffectiveConfig(branchId: string): ProximityConfig {
  const globalConfig = getConfig('global');
  const branchConfig = getConfig(branchId);

  if (!branchConfig) return globalConfig;

  // Branch overrides global for all defined fields
  return { ...globalConfig, ...branchConfig, configId: branchId };
}
```

### 13.3 Visibility Rules

| Role | Scope |
|------|-------|
| Director | All branches: all offers, all patterns, all analytics, config for any branch |
| Admin | Same as Director |
| General Manager | Own branch only: offers for customers whose `preferredBranchId` matches GM's branch |
| Store Manager | Own branch only: can view offers and patterns, cannot modify config |
| Customer | Self only: own offers, own patterns, own opt-in |

### 13.4 Cross-Branch Customers

A customer who visits multiple branches is associated with their **most frequently visited** branch for offer purposes. They will NOT receive duplicate offers from different branches.

If a customer's pattern indicates branch A but they place an order at branch B, the system:
1. Updates `branchDistribution` in `CustomerOrderPattern`
2. If branch B becomes the new mode, updates `preferredBranchId`
3. Future offers target branch B

---

## 14. Business Logic

This section contains the detailed algorithms that power the proximity offer system.

### 14.1 Pattern Detection Algorithm

**File:** `lib/proximity/pattern-engine.ts` (NEW)

```typescript
/**
 * Analyze a customer's order history and detect patterns.
 *
 * @param customerId - Customer ID
 * @param config - Effective ProximityConfig
 * @returns CustomerOrderPattern or null if insufficient data
 *
 * Algorithm:
 * 1. Query customer's last 12 months of completed orders
 * 2. Calculate order frequency (avg days between orders)
 * 3. Detect day-of-week pattern (chi-square test)
 * 4. Detect time-of-day preference (mode of time windows)
 * 5. Detect branch preference (mode of branchIds)
 * 6. Calculate composite confidence score
 * 7. Predict next order date
 */
async function analyzeCustomerPattern(
  customerId: string,
  config: ProximityConfig
): Promise<CustomerOrderPattern | null> {
  // Step 1: Query orders
  const orders = await getOrdersByCustomer(customerId, 200); // lib/db/orders.ts
  const completedOrders = orders.filter(o =>
    ['delivered', 'collected'].includes(o.status)
  );

  // Require minimum order count
  if (completedOrders.length < config.minOrdersForPattern) {
    return null;
  }

  // Sort by creation date ascending
  const sorted = completedOrders.sort(
    (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
  );

  // Filter to last 12 months
  const twelveMonthsAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  const recentOrders = sorted.filter(
    o => o.createdAt.toMillis() >= twelveMonthsAgo
  );

  if (recentOrders.length < config.minOrdersForPattern) {
    return null;
  }

  // Step 2: Calculate frequency
  const gaps: number[] = [];
  for (let i = 1; i < recentOrders.length; i++) {
    const gapMs = recentOrders[i].createdAt.toMillis()
                - recentOrders[i - 1].createdAt.toMillis();
    const gapDays = gapMs / (24 * 60 * 60 * 1000);
    gaps.push(gapDays);
  }

  const avgFrequencyDays = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const frequencyStdDev = Math.sqrt(
    gaps.reduce((s, g) => s + Math.pow(g - avgFrequencyDays, 2), 0) / gaps.length
  );
  const coefficientOfVariation = frequencyStdDev / avgFrequencyDays;

  // Step 3: Day-of-week analysis
  const dayOfWeekDistribution = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  recentOrders.forEach(o => {
    const day = o.createdAt.toDate().getDay();
    dayOfWeekDistribution[day]++;
  });

  // Chi-square test for uniformity
  const expected = recentOrders.length / 7;
  const chiSquare = dayOfWeekDistribution.reduce(
    (sum, observed) => sum + Math.pow(observed - expected, 2) / expected, 0
  );
  // Chi-square critical value for df=6, alpha=0.05 is 12.59
  const dayOfWeekSignificant = chiSquare > 12.59;

  const preferredDayOfWeek = dayOfWeekDistribution.indexOf(
    Math.max(...dayOfWeekDistribution)
  );

  // Step 4: Time-of-day analysis
  const timeOfDayDistribution = { morning: 0, afternoon: 0, evening: 0 };
  recentOrders.forEach(o => {
    const hour = o.createdAt.toDate().getHours();
    if (hour >= 7 && hour < 12) timeOfDayDistribution.morning++;
    else if (hour >= 12 && hour < 17) timeOfDayDistribution.afternoon++;
    else timeOfDayDistribution.evening++;
  });

  const preferredTimeOfDay = (
    Object.entries(timeOfDayDistribution) as [string, number][]
  ).reduce((max, entry) =>
    entry[1] > max[1] ? entry : max
  )[0] as 'morning' | 'afternoon' | 'evening';

  // Step 5: Branch preference
  const branchDistribution: Record<string, number> = {};
  recentOrders.forEach(o => {
    branchDistribution[o.branchId] = (branchDistribution[o.branchId] || 0) + 1;
  });

  const preferredBranchId = Object.entries(branchDistribution).reduce(
    (max, entry) => entry[1] > max[1] ? entry : max
  )[0];

  // Step 6: Confidence score
  const volumeScore = Math.min(recentOrders.length / (config.minOrdersForPattern * 3), 1.0);
  const regularityScore = Math.max(0, 1 - coefficientOfVariation);
  const lastOrderDate = recentOrders[recentOrders.length - 1].createdAt;
  const daysSinceLastOrder = (Date.now() - lastOrderDate.toMillis()) / (24 * 60 * 60 * 1000);
  const recencyScore = Math.max(0, 1 - (daysSinceLastOrder / (avgFrequencyDays * 3)));
  const dayPreferenceScore = dayOfWeekSignificant ? 1.0 : 0.5;

  const patternConfidence = (
    volumeScore * 0.25 +
    regularityScore * 0.35 +
    recencyScore * 0.25 +
    dayPreferenceScore * 0.15
  );

  // Step 7: Predict next order date
  const predictedMs = lastOrderDate.toMillis() + (avgFrequencyDays * 24 * 60 * 60 * 1000);
  let predictedDate = new Date(predictedMs);

  // Adjust to nearest preferred day of week
  if (dayOfWeekSignificant) {
    const currentDay = predictedDate.getDay();
    let daysToAdd = preferredDayOfWeek - currentDay;
    if (daysToAdd < -3) daysToAdd += 7; // Prefer next occurrence
    if (daysToAdd > 3) daysToAdd -= 7;  // Prefer previous occurrence
    predictedDate = new Date(predictedDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  const isStale = daysSinceLastOrder > config.patternStaleDays;

  return {
    customerId,
    avgFrequencyDays: Math.round(avgFrequencyDays * 10) / 10,
    frequencyStdDev: Math.round(frequencyStdDev * 10) / 10,
    preferredDayOfWeek,
    dayOfWeekDistribution,
    dayOfWeekSignificant,
    preferredTimeOfDay,
    timeOfDayDistribution,
    preferredBranchId,
    branchDistribution,
    lastOrderDate,
    nextPredictedDate: predictedDate.toISOString().split('T')[0],
    patternConfidence: Math.round(patternConfidence * 1000) / 1000,
    confidenceBreakdown: {
      volumeScore: Math.round(volumeScore * 1000) / 1000,
      regularityScore: Math.round(regularityScore * 1000) / 1000,
      recencyScore: Math.round(recencyScore * 1000) / 1000,
      dayPreferenceScore: Math.round(dayPreferenceScore * 1000) / 1000,
    },
    totalOrdersAnalyzed: recentOrders.length,
    analysisWindow: {
      from: recentOrders[0].createdAt,
      to: lastOrderDate,
    },
    lastAnalyzedAt: Timestamp.now(),
    isStale,
    algorithmVersion: '1.0.0',
  };
}
```

### 14.2 Eligibility Scoring Algorithm

**File:** `lib/proximity/eligibility.ts` (NEW)

```typescript
/**
 * Check if a customer is eligible for a proximity offer.
 *
 * @param customerId - Customer ID
 * @param pattern - Detected order pattern
 * @param schedule - Existing offer schedule (or null)
 * @param config - Effective ProximityConfig
 * @returns Eligibility result with reason if ineligible
 */
interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  score?: number; // Composite eligibility score (0.0-1.0)
}

async function checkEligibility(
  customer: Customer,
  pattern: CustomerOrderPattern,
  schedule: OfferSchedule | null,
  config: ProximityConfig
): Promise<EligibilityResult> {

  // Check 1: Customer opted in (FR-M3-011)
  if (!customer.proximityOptIn) {
    return { eligible: false, reason: 'not_opted_in' };
  }

  // Check 2: Pattern confidence (FR-M3-012)
  if (pattern.patternConfidence < config.confidenceThreshold) {
    return { eligible: false, reason: 'low_confidence' };
  }

  // Check 3: Pattern not stale
  if (pattern.isStale) {
    return { eligible: false, reason: 'stale_pattern' };
  }

  // Check 4: Cooldown period (FR-M3-013)
  if (schedule && schedule.cooldownUntil) {
    const cooldownEnd = schedule.cooldownUntil.toDate();
    if (new Date() < cooldownEnd) {
      return { eligible: false, reason: 'cooldown_active' };
    }
  }

  // Check 5: Monthly limit (FR-M3-014)
  if (schedule) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyCount = schedule.currentMonth === currentMonth
      ? schedule.monthlyAttempts
      : 0;
    if (monthlyCount >= config.maxOffersPerMonth) {
      return { eligible: false, reason: 'monthly_limit_reached' };
    }
  }

  // Check 6: No active offer (FR-M3-015)
  const activeOffers = await getActiveOffersForCustomer(customer.customerId);
  if (activeOffers.length > 0) {
    return { eligible: false, reason: 'active_offer_exists' };
  }

  // Check 7: Predicted date within offer window (FR-M3-016)
  const predictedDate = new Date(pattern.nextPredictedDate);
  const now = new Date();
  const daysUntilPredicted = (predictedDate.getTime() - now.getTime())
    / (24 * 60 * 60 * 1000);

  if (daysUntilPredicted > config.offerWindowDays || daysUntilPredicted < -1) {
    return { eligible: false, reason: 'outside_offer_window' };
  }

  // Check 8: Offers not suspended (FR-M3-021)
  if (schedule?.suspended) {
    return { eligible: false, reason: 'suspended' };
  }

  // Check 9: Today is an enabled day (config.enabledDaysOfWeek)
  const today = new Date().getDay();
  if (!config.enabledDaysOfWeek.includes(today)) {
    return { eligible: false, reason: 'day_not_enabled' };
  }

  // Check 10: Not a blackout date
  const todayStr = new Date().toISOString().split('T')[0];
  if (config.blackoutDates.includes(todayStr)) {
    return { eligible: false, reason: 'blackout_date' };
  }

  // Calculate composite eligibility score (FR-M3-017)
  const conversionRate = schedule?.conversionRate ?? 0.5; // Default 50% for new
  const customerValue = Math.min(customer.totalSpent / 50000, 1.0); // Normalize to 50K KES

  const score = (
    pattern.patternConfidence * 0.4 +
    customerValue * 0.3 +
    conversionRate * 0.3
  );

  return { eligible: true, score };
}
```

### 14.3 Cooldown System

**Rules (all configurable via `ProximityConfig`):**

| Trigger | Cooldown Duration | Additional Effects |
|---------|------------------|--------------------|
| Offer sent | `cooldownDays` (default: 7 days) | Normal cooldown |
| Offer declined (NO) | `2 * cooldownDays` (default: 14 days) | Double cooldown; reset `consecutiveIgnored` |
| Offer declined (LATER) | `cooldownDays` (default: 7 days) | Standard cooldown; reset `consecutiveIgnored` |
| Offer ignored (expired) | `cooldownDays` (default: 7 days) | Increment `consecutiveIgnored` |
| 3 consecutive ignores | `suspensionDays` (default: 30 days) | Suspend all offers; notify GM |
| Offer accepted | 0 days (no cooldown) | Reset `consecutiveIgnored`; await conversion |

**Implementation:**

```typescript
function calculateCooldown(
  outcome: 'accepted' | 'declined' | 'later' | 'ignored',
  config: ProximityConfig,
  schedule: OfferSchedule
): { cooldownUntil: Date; suspended: boolean; suspensionReason?: string } {

  const now = new Date();

  switch (outcome) {
    case 'accepted':
      return { cooldownUntil: now, suspended: false };

    case 'declined':
      return {
        cooldownUntil: addDays(now, config.cooldownDays * 2),
        suspended: false,
      };

    case 'later':
      return {
        cooldownUntil: addDays(now, config.cooldownDays),
        suspended: false,
      };

    case 'ignored': {
      const newIgnoredCount = schedule.consecutiveIgnored + 1;
      if (newIgnoredCount >= config.maxConsecutiveIgnored) {
        return {
          cooldownUntil: addDays(now, config.suspensionDays),
          suspended: true,
          suspensionReason: `${newIgnoredCount} consecutive offers ignored`,
        };
      }
      return {
        cooldownUntil: addDays(now, config.cooldownDays),
        suspended: false,
      };
    }
  }
}
```

### 14.4 Offer Expiry Logic

Offers expire after `offerExpiryHours` (default: 48 hours) from `sentAt`.

```typescript
// Expiry batch job (runs hourly)
async function processExpiredOffers(): Promise<number> {
  const now = Timestamp.now();

  // Find sent offers past their expiry
  const expiredOffers = await adminDb
    .collection('proximityOffers')
    .where('status', '==', 'sent')
    .where('expiresAt', '<=', now)
    .get();

  let processed = 0;

  for (const doc of expiredOffers.docs) {
    const offer = doc.data() as ProximityOffer;

    // Transition to ignored
    await doc.ref.update({
      status: 'ignored',
      respondedAt: now, // Mark as "responded" at expiry time
      responseCategory: 'ignored',
    });

    // Update schedule
    await updateScheduleForOutcome(offer.customerId, 'ignored');

    // Audit log
    await createAuditLog(
      'update', 'proximity_offer', offer.offerId,
      'system', 'System', 'admin' as UserRole,
      `Proximity offer expired without response`,
      offer.branchId
    );

    processed++;
  }

  return processed;
}
```

### 14.5 Conversion Attribution

```typescript
/**
 * Check if any recently accepted offers should be attributed
 * to a new order. Called when a new order is created.
 *
 * @param customerId - Customer who placed the order
 * @param orderId - The new order ID
 * @param orderAmount - Order total amount (KES)
 */
async function checkConversionAttribution(
  customerId: string,
  orderId: string,
  orderAmount: number
): Promise<void> {
  const config = await getEffectiveConfig('global');
  const windowMs = config.conversionWindowHours * 60 * 60 * 1000;
  const windowStart = Timestamp.fromMillis(Date.now() - windowMs);

  // Find accepted offers within the conversion window
  const acceptedOffers = await adminDb
    .collection('proximityOffers')
    .where('customerId', '==', customerId)
    .where('status', '==', 'accepted')
    .where('respondedAt', '>=', windowStart)
    .get();

  if (acceptedOffers.empty) return;

  // Attribute to the most recent accepted offer
  const offer = acceptedOffers.docs[0];
  await offer.ref.update({
    status: 'converted',
    convertedOrderId: orderId,
    attributedRevenue: orderAmount,
  });

  // Update schedule
  const scheduleRef = adminDb.collection('offerSchedules').doc(customerId);
  const schedule = await scheduleRef.get();
  if (schedule.exists) {
    const data = schedule.data() as OfferSchedule;
    await scheduleRef.update({
      totalConversions: (data.totalConversions || 0) + 1,
      conversionRate: ((data.totalConversions || 0) + 1) /
                      ((data.totalAttempts || 1)),
      updatedAt: Timestamp.now(),
    });
  }

  // Audit log
  await createAuditLog(
    'update', 'proximity_offer', offer.id,
    'system', 'System', 'admin' as UserRole,
    `Proximity offer converted: order ${orderId}, KES ${orderAmount}`,
    (offer.data() as ProximityOffer).branchId
  );
}
```

### 14.6 Offer Message Generation

```typescript
/**
 * Generate a personalized offer message for a customer.
 */
function generateOfferMessage(
  customer: Customer,
  pattern: CustomerOrderPattern,
  suggestedDate: string,
  branchName: string,
  offerType: ProximityOfferType,
  voucherDetails?: string
): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
                     'Thursday', 'Friday', 'Saturday'];
  const date = new Date(suggestedDate);
  const dayName = dayNames[date.getDay()];

  const timeLabels = {
    morning: 'morning (8AM-12PM)',
    afternoon: 'afternoon (12PM-5PM)',
    evening: 'evening (5PM-8PM)',
  };
  const timeLabel = timeLabels[pattern.preferredTimeOfDay];

  if (offerType === 'special_deal' && voucherDetails) {
    return `Hi ${customer.name}, we have a special offer for you! ` +
           `${voucherDetails} ` +
           `Would you like to schedule a pickup this ${dayName} ${timeLabel}? ` +
           `Reply YES to confirm or NO to skip. Lorenzo Dry Cleaners - ${branchName}`;
  }

  return `Hi ${customer.name}, based on your usual schedule, ` +
         `would you like us to pick up your laundry this ${dayName}? ` +
         `We can have a driver at your door in the ${timeLabel}. ` +
         `Reply YES to confirm or NO to skip. Lorenzo Dry Cleaners - ${branchName}`;
}
```

### 14.7 LLM-Enhanced Pattern Analysis (P2)

For customers where statistical methods produce low-confidence results (confidence between 0.3 and 0.6), the system can optionally use the LLM client for deeper analysis.

```typescript
import { ask } from '@/lib/llm/llm-client';

/**
 * Use LLM to analyze irregular order patterns.
 * Falls back to statistical result if LLM is unavailable.
 */
async function llmEnhancedAnalysis(
  customerId: string,
  orderDates: Date[],
  statisticalPattern: CustomerOrderPattern
): Promise<CustomerOrderPattern> {
  try {
    const prompt = `Analyze this customer's order history dates and identify any patterns:
    Dates: ${orderDates.map(d => d.toISOString().split('T')[0]).join(', ')}

    Statistical analysis found:
    - Average frequency: ${statisticalPattern.avgFrequencyDays} days
    - Standard deviation: ${statisticalPattern.frequencyStdDev} days
    - Preferred day: ${statisticalPattern.preferredDayOfWeek}
    - Confidence: ${statisticalPattern.patternConfidence}

    Are there seasonal patterns, holiday-related gaps, or other patterns
    the statistical model might miss? Respond in JSON format:
    { "adjustedConfidence": number, "notes": string, "seasonalPeaks": number[] }`;

    const response = await ask(
      'analytics',        // LLMAgentType
      'data_response',    // AgentFunction
      prompt,
      'You are a data analyst specializing in customer behavior pattern detection.'
    );

    const parsed = JSON.parse(response);
    return {
      ...statisticalPattern,
      patternConfidence: Math.max(
        statisticalPattern.patternConfidence,
        parsed.adjustedConfidence
      ),
      seasonalVariation: parsed.seasonalPeaks?.length > 0
        ? { detected: true, peakMonths: parsed.seasonalPeaks }
        : statisticalPattern.seasonalVariation,
    };
  } catch {
    // LLM unavailable, use statistical result
    return statisticalPattern;
  }
}
```

---

## 15. Integration Points

### 15.1 Module 1 -- Order Management

| Direction | Integration | Details |
|-----------|------------|---------|
| M3 reads M1 | Order history | Pattern detection queries `orders` collection via `getOrdersByCustomer()` from `lib/db/orders.ts`. Uses `createdAt`, `branchId`, `status`, `customerId` fields. |
| M3 triggers M1 | Order creation | When a customer accepts an offer and schedules a pickup, it can trigger the existing order creation flow. However, the actual order creation remains a manual step by the customer/staff. |
| M1 triggers M3 | Conversion check | When `createOrder()` in `lib/db/orders.ts` is called, it should invoke `checkConversionAttribution()` to see if this order was driven by a proximity offer. Add a hook to the existing `createOrder()` function. |
| M1 triggers M3 | Self-serve detection | When an order is created, check if the customer has a pending (`generated`) offer. If so, cancel it (customer self-served). |

### 15.2 Module 4 -- Customer Preferences

| Direction | Integration | Details |
|-----------|------------|---------|
| M3 reads M4 | Opt-in status | M4 manages customer communication preferences. M3 checks `customer.proximityOptIn` which may be managed by M4's preference engine. |
| M3 reads M4 | Communication preferences | M4 may define preferred communication channels (WhatsApp vs email vs SMS). M3 should respect this if M4 is implemented. Initially, M3 defaults to WhatsApp. |
| M3 reads M4 | Timing preferences | M4 may learn customer timing preferences through conversation. M3 can use this to refine `preferredTimeOfDay` if M4 data is available. |

### 15.3 Module 5 -- AI Insights

| Direction | Integration | Details |
|-----------|------------|---------|
| M3 feeds M5 | Offer performance data | M5's analytics engine can consume `proximityOffers` collection for cross-module analytics. Offer conversion rates feed into broader business intelligence. |
| M5 enhances M3 | Advanced pattern detection | M5's LLM integration (via `lib/llm/llm-client.ts`) can provide more sophisticated pattern analysis than pure statistical methods. See Section 14.7. |

### 15.4 Module 6 -- Voucher System

| Direction | Integration | Details |
|-----------|------------|---------|
| M3 reads M6 | Voucher data | For `special_deal` offers, M3 reads voucher details (code, discount, expiry) from M6's voucher collection. `ProximityOffer.voucherId` references M6's voucher document. |
| M3 triggers M6 | Voucher redemption | When a `special_deal` offer is converted (customer places order), M3 can signal M6 to mark the voucher as redeemed. |

### 15.5 External: Wati.io

| Direction | Integration | Details |
|-----------|------------|---------|
| M3 sends | WhatsApp messages | Uses existing `sendWhatsAppMessage()` from `services/wati.ts` with new templates: `proactive_pickup_offer`, `special_deal_offer`. |
| M3 receives | Webhook responses | New webhook endpoint `POST /api/webhooks/proximity-response` receives customer replies routed from Wati.io. |

### 15.6 Hook into Order Creation

The following hook must be added to `lib/db/orders.ts` `createOrder()` function (around line 196, after `incrementCustomerStats()`):

```typescript
// In createOrder() - after incrementCustomerStats()

// Proximity offer: Check for conversion attribution (Module 3)
import { checkConversionAttribution, cancelPendingOffers } from '@/lib/proximity/hooks';

// Fire and forget - don't block order creation
checkConversionAttribution(data.customerId, orderId, data.totalAmount)
  .catch(err => console.error('Proximity conversion check failed:', err));

// Cancel any pending (generated, not yet sent) offers for this customer
cancelPendingOffers(data.customerId)
  .catch(err => console.error('Proximity pending cancel failed:', err));
```

---

## 16. Security & Permissions

### 16.1 RBAC Matrix

| Action | customer | front_desk | store_manager | general_manager | director | admin |
|--------|----------|------------|---------------|-----------------|----------|-------|
| View own offers | Yes (self) | -- | -- | -- | -- | -- |
| View own patterns | Yes (self) | -- | -- | -- | -- | -- |
| Opt-in/out (self) | Yes | -- | -- | -- | Yes (override) | Yes (override) |
| View offer queue | -- | -- | Read | Read/Write | Read/Write | Read/Write |
| Approve/reject offers | -- | -- | -- | Yes | Yes | Yes |
| Send offers | -- | -- | -- | Yes | Yes | Yes |
| View customer patterns | -- | -- | Read (own branch) | Read (own branch) | Read (all) | Read (all) |
| View analytics | -- | -- | -- | Read (own branch) | Read (all) | Read (all) |
| Modify config | -- | -- | -- | -- | Yes | Yes |
| Trigger manual analysis | -- | -- | -- | Yes (own branch) | Yes (all) | Yes (all) |
| Export reports | -- | -- | -- | -- | Yes | Yes |

### 16.2 API Authentication

All `/api/proximity/*` endpoints require Firebase JWT authentication, validated using the same pattern as existing API routes (e.g., `app/api/pricing/rules/route.ts`).

The `/api/webhooks/proximity-response` endpoint uses webhook API key authentication (matching `app/api/webhooks/order-notifications/route.ts`).

### 16.3 Data Access Controls

- **Firestore Security Rules** must be added for new collections:
  - `proximityOffers`: Staff can read offers for their branch; customers can read their own offers.
  - `customerOrderPatterns`: Staff can read; customers can read their own.
  - `offerSchedules`: Staff only (no customer access).
  - `proximityConfig`: Only `director` and `admin` can write; `general_manager` can read.

### 16.4 Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| POST /api/proximity/analyze | 10 requests | per hour |
| POST /api/proximity/offers | 20 requests | per hour |
| POST /api/proximity/offers/:id/send | 200 requests | per hour |
| POST /api/webhooks/proximity-response | 1000 requests | per hour |
| GET /api/proximity/* | 100 requests | per minute |

---

## 17. Error Handling & Edge Cases

### 17.1 Edge Cases

| Scenario | Handling |
|----------|---------|
| Customer with < 3 orders | Skip during pattern analysis; no `CustomerOrderPattern` created. Log as "insufficient data". |
| Customer with very irregular patterns (CV > 1.0) | Set `patternConfidence` very low (likely < threshold); skip offer generation. |
| WhatsApp delivery failure (all 3 retries fail) | Mark offer as `sent` (we attempted), log delivery failure in audit. Do NOT mark as `ignored`. Wati.io retry logs are already tracked. |
| Customer opts out while offer is pending (`status = 'sent'`) | Cancel the pending offer immediately. Audit log with reason "customer_opted_out". |
| Pattern becomes stale (no order in 60+ days) | Set `isStale = true` on `CustomerOrderPattern`. Eligibility check rejects stale patterns. Pattern will be refreshed if customer places a new order. |
| Duplicate offer prevention | Use Firestore transaction when creating an offer: check no active offer exists for this customer before inserting. |
| Customer places order BEFORE offer is sent | In `createOrder()` hook: check for `generated` offers and cancel them. Customer self-served. |
| Branch deactivated after offer generated | Check `Branch.active` before sending. If inactive, cancel offer and log. |
| Customer phone number invalid | `isValidKenyanPhoneNumber()` check (from `services/wati.ts`) before sending. If invalid, cancel offer, log, and exclude from future batches until phone is updated. |
| Concurrent batch + manual offer generation | Use Firestore transactions for all offer creation to prevent race conditions. |
| WhatsApp template not yet approved by Meta | Detect template rejection in Wati.io response. Fall back to a generic approved template if available, or skip sending and alert admin. |
| Customer responds with unexpected text | Parse as `unknown`; leave offer in `sent` status; flag for manual review by store manager. |
| Timezone handling | All dates/times in East Africa Time (EAT, UTC+3). `batchGenerationHour` is in EAT. Pattern analysis uses EAT for day-of-week and time-of-day calculations. |
| Public holidays | Use `blackoutDates` in config. No offers sent on blackout dates. |
| Customer visits branch outside pattern (e.g., emergency visit) | Single outlier visits do not break the pattern. Pattern is re-analyzed weekly; one visit outside the pattern will slightly shift averages but not invalidate the pattern unless frequency is highly irregular. |
| 100+ offers per branch per day limit hit | Prioritize by eligibility score (highest score first). Log skipped offers with reason "daily_limit_reached". |

### 17.2 Error Recovery

| Error | Recovery |
|-------|---------|
| Pattern analysis batch fails mid-run | Each customer is analyzed independently. Failed customers are logged and retried on the next run. Batch reports partial success. |
| Firestore write failure during offer creation | Transaction rollback. Retry up to 3 times with exponential backoff. |
| Wati.io API timeout | Existing retry logic in `services/wati.ts` handles this (3 retries with exponential backoff). |
| LLM call failure (for P2 enhanced analysis) | Graceful fallback to statistical-only analysis. No user-facing error. |
| Webhook delivery failure (Wati.io -> our API) | Wati.io provides webhook retry mechanisms. Configure Wati.io to retry 3x. Implement idempotent webhook handler (check if response already recorded). |
| Expiry batch job fails | Run hourly, so next run catches missed expirations. Alert admin if 2+ consecutive failures. |

---

## 18. Data Migration

### 18.1 No Existing Data to Migrate

This is an entirely new module. All four Firestore collections (`proximityOffers`, `customerOrderPatterns`, `offerSchedules`, `proximityConfig`) are created fresh.

### 18.2 Initial Setup

1. **Create global config document:**

```typescript
// proximityConfig/global
{
  configId: 'global',
  minOrdersForPattern: 3,
  cooldownDays: 7,
  maxOffersPerMonth: 4,
  confidenceThreshold: 0.6,
  offerExpiryHours: 48,
  offerWindowDays: 3,
  maxOffersPerBranchPerDay: 100,
  enabledDaysOfWeek: [1, 2, 3, 4, 5],
  blackoutDates: [],
  batchGenerationHour: 8,
  autoSendOffers: false,
  maxConsecutiveIgnored: 3,
  suspensionDays: 30,
  conversionWindowHours: 72,
  patternStaleDays: 60,
  enabled: false,  // Start disabled
  specialDealsEnabled: false,
  updatedAt: Timestamp.now(),
  updatedBy: 'system',
}
```

2. **Set all existing customers to `proximityOptIn = false`** (compliance: default opt-OUT):

```typescript
// One-time migration script
const customers = await adminDb.collection('customers').get();
const batch = adminDb.batch();
customers.docs.forEach(doc => {
  if (doc.data().proximityOptIn === undefined) {
    batch.update(doc.ref, { proximityOptIn: false });
  }
});
await batch.commit();
```

3. **Backfill opportunity:** Run pattern analysis on existing order history to pre-populate `customerOrderPatterns`. This provides immediate value when the module is enabled.

```typescript
// Backfill script
POST /api/proximity/analyze
{ forceReanalyze: true }
```

This will analyze all customers with sufficient order history and create pattern documents, even though the module is not yet enabled for sending.

### 18.3 Rollback Plan

If the module needs to be disabled:
1. Set `ProximityConfig.enabled = false` (globally or per-branch)
2. Cancel all pending offers (status `generated` or `sent`)
3. Pattern data and schedule data can remain (no harm in keeping it)
4. No schema changes to core collections need reverting (all new fields are optional)

---

## 19. Testing Strategy

### 19.1 Unit Tests

**File:** `__tests__/lib/proximity/pattern-engine.test.ts`

| Test Case | Description |
|-----------|------------|
| `analyzeCustomerPattern` with regular weekly customer | Should detect ~7-day frequency, correct day-of-week, confidence > 0.8 |
| `analyzeCustomerPattern` with irregular customer | Should produce low confidence < 0.4 |
| `analyzeCustomerPattern` with < 3 orders | Should return null |
| `analyzeCustomerPattern` with seasonal gap | Should detect seasonal variation |
| `checkEligibility` - all checks pass | Should return `eligible: true` with score |
| `checkEligibility` - not opted in | Should return `eligible: false, reason: 'not_opted_in'` |
| `checkEligibility` - cooldown active | Should return `eligible: false, reason: 'cooldown_active'` |
| `checkEligibility` - monthly limit | Should return `eligible: false, reason: 'monthly_limit_reached'` |
| `checkEligibility` - stale pattern | Should return `eligible: false, reason: 'stale_pattern'` |
| `calculateCooldown` - declined | Should return `2 * cooldownDays` |
| `calculateCooldown` - 3rd ignored | Should return `suspended: true` |
| `parseProximityResponse` - various inputs | "yes", "YES", "ndio", "no", "hapana", "later", "baadaye", "random text" |
| `generateOfferMessage` | Should produce correct personalized text |
| Chi-square day-of-week test | Verify statistical significance threshold |

### 19.2 Integration Tests

**File:** `__tests__/api/proximity/*.test.ts`

| Test Case | Description |
|-----------|------------|
| POST /api/proximity/analyze | Mock Firestore, verify pattern documents created |
| POST /api/proximity/offers | Mock patterns, verify offers generated for eligible customers |
| POST /api/proximity/offers/:id/send | Mock Wati.io, verify WhatsApp message sent and status updated |
| POST /api/proximity/offers/:id/respond | Verify status transitions for accept, decline, ignore |
| POST /api/webhooks/proximity-response | Verify webhook authentication and response routing |
| GET /api/proximity/analytics | Verify aggregation math |
| Opt-out cancels pending offers | Create offer, opt out, verify cancelled |
| Conversion attribution | Create accepted offer, create order, verify conversion linked |

### 19.3 End-to-End Tests

**File:** `e2e/proximity-offers.spec.ts` (Playwright)

| Flow | Steps |
|------|-------|
| Full lifecycle | 1. Seed customer with 5 regular orders (Tuesdays) -> 2. Run pattern analysis -> 3. Verify pattern detected -> 4. Generate offer -> 5. Mock WhatsApp send -> 6. Mock customer reply YES -> 7. Create order -> 8. Verify conversion attributed |
| Opt-in/out flow | 1. Customer logs into portal -> 2. Navigate to preferences -> 3. Toggle proximity on -> 4. Verify `proximityOptIn = true` -> 5. Toggle off -> 6. Verify pending offers cancelled |
| GM approval flow | 1. Set `autoSendOffers = false` -> 2. Generate offers -> 3. GM logs in -> 4. View offer queue -> 5. Approve offer -> 6. Verify sent |
| Cooldown enforcement | 1. Send offer -> 2. Decline -> 3. Attempt new offer -> 4. Verify rejected (cooldown) -> 5. Wait cooldown period -> 6. Verify eligible |

### 19.4 Performance Tests

| Test | Target | Method |
|------|--------|--------|
| Pattern analysis for 10,000 customers | < 5 minutes | Batch processing with parallel Firestore reads |
| Offer generation for 500 eligible customers | < 2 minutes | Batch creation with write batching |
| Analytics aggregation query | < 3 seconds | Indexed Firestore queries |
| Expiry batch job (1,000 expired offers) | < 1 minute | Batch updates |

### 19.5 Edge Case Tests

| Test | Description |
|------|------------|
| Duplicate offer prevention | Concurrent offer generation should not create duplicates (Firestore transaction test) |
| Timezone boundary | Orders at 23:55 EAT vs 00:05 EAT should be classified to correct day |
| Customer with exactly `minOrdersForPattern` orders | Should generate a pattern (boundary test) |
| Customer with orders at multiple branches (50/50 split) | Should pick the most recently visited branch |
| Empty WhatsApp response | Should be parsed as `unknown`, not crash |
| Offer created just before customer opts out | Race condition test |

---

## 20. Implementation Sequence

### Phase 1: Data Model & Infrastructure (Week 1)

1. Add new interfaces to `lib/db/schema.ts`: `ProximityOffer`, `CustomerOrderPattern`, `OfferSchedule`, `ProximityConfig`, `ProximityOfferType`, `ProximityOfferStatus`
2. Extend `Customer` interface with `proximityOptIn`, `proximityOptInChangedAt`, `proximityOptInChangedBy`
3. Extend `AuditLogAction` type if needed (current actions may suffice with `resourceType` differentiation)
4. Extend `AgentName` type to include `'proximity-agent'` in `lib/agents/types.ts`
5. Create Firestore collections and composite indexes
6. Create global `ProximityConfig` default document
7. Run migration script to set `proximityOptIn = false` on all existing customers
8. Create `lib/proximity/` directory with module structure:
   - `lib/proximity/pattern-engine.ts`
   - `lib/proximity/eligibility.ts`
   - `lib/proximity/offer-generator.ts`
   - `lib/proximity/cooldown.ts`
   - `lib/proximity/hooks.ts`
   - `lib/proximity/config.ts`
   - `lib/proximity/types.ts`

### Phase 2: Pattern Detection Engine (Week 2)

9. Implement `analyzeCustomerPattern()` in `lib/proximity/pattern-engine.ts`
10. Implement batch analysis function (iterate all opted-in customers)
11. Implement `POST /api/proximity/analyze` API route
12. Implement `GET /api/proximity/patterns/:customerId` API route
13. Write unit tests for pattern detection algorithm
14. Write integration tests for pattern API

### Phase 3: Eligibility & Offer Generation (Week 3)

15. Implement `checkEligibility()` in `lib/proximity/eligibility.ts`
16. Implement cooldown calculation in `lib/proximity/cooldown.ts`
17. Implement offer generation pipeline in `lib/proximity/offer-generator.ts`
18. Implement `POST /api/proximity/offers` API route
19. Implement `GET /api/proximity/offers` API route
20. Implement daily batch generation job (cron/scheduled function)
21. Write unit tests for eligibility and cooldown

### Phase 4: WhatsApp Integration (Week 3-4)

22. **CRITICAL: Submit WhatsApp templates to Meta for approval** (start in Week 1, approval needed by Week 4)
23. Add new templates to `services/wati.ts` template definitions
24. Implement `POST /api/proximity/offers/:id/send` API route
25. Implement `POST /api/webhooks/proximity-response` webhook handler
26. Implement response parsing logic
27. Implement `POST /api/proximity/offers/:id/respond` API route
28. Write integration tests with mocked Wati.io

### Phase 5: Conversion & Lifecycle (Week 4)

29. Add hook to `lib/db/orders.ts` `createOrder()` for conversion attribution
30. Add hook to `lib/db/orders.ts` `createOrder()` for pending offer cancellation
31. Implement expiry batch job (hourly)
32. Implement conversion check batch job (hourly)
33. Implement schedule update logic for all offer outcomes
34. Write E2E tests for full lifecycle

### Phase 6: Admin UI (Week 5)

35. Build `ProximityConfigPanel` component
36. Build `OfferQueueManager` component
37. Build `PatternVisualization` component
38. Add proximity section to `/gm/proximity` page
39. Integrate config panel into Director customer page

### Phase 7: Director Analytics (Week 5-6)

40. Implement `GET /api/proximity/analytics` API route
41. Implement `GET /api/proximity/config` and `PUT /api/proximity/config` API routes
42. Build `OfferAnalyticsDashboard` component
43. Add proximity section to `/director/customers` page
44. Add Risk Radar alert for low conversion rate
45. Add GM dashboard proximity card

### Phase 8: Customer Portal (Week 6)

46. Build `ProximityOptInToggle` component
47. Build `OfferInbox` component
48. Build `OfferHistory` component
49. Implement `POST /api/customers/:id/proximity-optin` API route
50. Add customer portal navigation items
51. Optionally build `CustomerPatternView` (P2)

### Phase 9: Backfill & Reports (Week 6-7)

52. Run pattern analysis backfill on existing order history
53. Implement CSV/Excel export for proximity reports
54. Build report generation logic
55. Final E2E testing
56. Performance testing

---

## 21. Open Questions & Risks

### Critical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| **WhatsApp template rejection by Meta** | Module cannot send offers via WhatsApp until approved | Medium | Submit templates in Week 1. Have backup generic template. Consider in-app notifications as fallback. |
| **Wati.io rate limits for batch sending** | Cannot send 100+ offers simultaneously | Medium | Implement staggered sending (e.g., 10 offers per minute). Check Wati.io plan limits. |
| **Customer perception -- offers feel invasive** | Customer backlash, opt-outs, brand damage | Medium | Careful message wording. Conservative defaults (low frequency, easy opt-out). Monitor opt-out rate. |
| **Pattern accuracy -- customers not as regular as assumed** | Low conversion rate, wasted messages | High | Conservative confidence threshold (0.6). Require 3+ orders minimum. Monitor and adjust thresholds. |
| **Template lead time exceeds 4 weeks** | Delays module launch | Low | Start template submission on Day 1. Prepare contingency (in-app only mode). |

### Open Questions

| # | Question | Impact | Proposed Answer |
|---|----------|--------|----------------|
| 1 | Should GM manually approve each offer batch, or auto-send if confidence > threshold? | UX vs efficiency | **Default to manual approval** (`autoSendOffers = false`). Allow GM to switch to auto-send per branch once they trust the system. |
| 2 | Should offers include a direct "schedule pickup" link? | Requires customer portal deep-linking | **P2 enhancement.** Initially, customer replies YES and staff follows up. Later, include a portal link for self-scheduling. |
| 3 | How to handle public holidays and seasonal variations in patterns? | Offer timing accuracy | **Use `blackoutDates` config for known holidays.** Kenyan public holidays (Mashujaa Day, Madaraka Day, etc.) should be pre-configured. Seasonal detection is P2 (see Section 14.7). |
| 4 | What is the right minimum order count for pattern detection? | Balance accuracy vs reach | **Proposed: 3 orders.** Lower allows more customers to be reached but reduces confidence. Higher (5+) limits audience but increases accuracy. Configurable per branch. |
| 5 | Should the system send offers in Kiswahili for customers with `language: 'sw'`? | Personalization vs template management | **P2 enhancement.** Requires separate WhatsApp templates in Kiswahili. Additional Meta approval time. Start with English only. |
| 6 | Can a customer respond to an offer after it expires? | Late response handling | **No.** Expired offers cannot be re-activated. The response is logged but the offer remains `ignored`. Customer would need to wait for the next offer. |
| 7 | How does this interact with existing order notifications? | Notification fatigue | **Proximity offers are distinct from order lifecycle notifications.** The `proactive_pickup_offer` template is a marketing template, not a transactional one. Cooldown prevents overlap. |
| 8 | Should converted revenue be gross or net (after discounts/vouchers)? | Revenue attribution accuracy | **Use `totalAmount` (gross).** This is the amount the customer committed to pay. Discount attribution belongs to the voucher module (M6). |

### Future Enhancements (Post-Launch)

| Enhancement | Description | Priority |
|-------------|------------|----------|
| Kiswahili templates | Offer messages in customer's preferred language | P2 |
| Self-service scheduling | Link in WhatsApp message to customer portal for scheduling | P2 |
| Seasonal pattern detection | Advanced ML model for seasonal/weather-correlated patterns | P2 |
| A/B testing framework | Test different message templates and sending times | P2 |
| SMS fallback | Send via SMS if customer doesn't use WhatsApp | P2 |
| Customer feedback loop | After conversion, ask "Was our timing right?" to improve patterns | P2 |
| Multi-channel delivery | Support in-app push notifications alongside WhatsApp | P2 |
| Predictive accuracy dashboard | Track how accurate predictions are vs actual order dates | P2 |

---

## Appendix A: Offer ID Format

```
PROX-[YYYYMMDD]-[RANDOM5]
Example: PROX-20260212-A7X2K
```

Generated by:
```typescript
function generateOfferId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PROX-${dateStr}-${random}`;
}
```

## Appendix B: Batch ID Format

```
BATCH-[YYYYMMDD]-[HHMM]-[RANDOM3]
Example: BATCH-20260212-0800-K3M
```

Used to group offers generated in the same batch run for tracking and debugging.

## Appendix C: Day-of-Week Reference

| Value | Day |
|-------|-----|
| 0 | Sunday |
| 1 | Monday |
| 2 | Tuesday |
| 3 | Wednesday |
| 4 | Thursday |
| 5 | Friday |
| 6 | Saturday |

JavaScript `Date.getDay()` convention. Consistent with Firestore `Timestamp.toDate().getDay()`.

## Appendix D: Time Window Reference

| Window | Hours (EAT) | Label in Message |
|--------|------------|-----------------|
| Morning | 07:00 - 12:00 | "morning (8AM-12PM)" |
| Afternoon | 12:00 - 17:00 | "afternoon (12PM-5PM)" |
| Evening | 17:00 - 20:00 | "evening (5PM-8PM)" |

## Appendix E: Firestore Security Rules

```
// Add to firestore.rules

match /proximityOffers/{offerId} {
  // Staff can read offers for their branch
  allow read: if request.auth != null &&
    (isStaff() || resource.data.customerId == getCustomerIdForUser());
  // Only server-side writes (admin SDK)
  allow write: if false;
}

match /customerOrderPatterns/{customerId} {
  allow read: if request.auth != null &&
    (isStaff() || customerId == getCustomerIdForUser());
  allow write: if false;
}

match /offerSchedules/{customerId} {
  allow read: if request.auth != null && isStaff();
  allow write: if false;
}

match /proximityConfig/{configId} {
  allow read: if request.auth != null && isStaff();
  allow write: if false;
}
```

All writes go through server-side API routes using Firebase Admin SDK (`adminDb`), following the established pattern in `lib/db/server/analytics-db.ts`.

---

**End of Module 3 -- Proximity Pickup Offers Feature Spec**
