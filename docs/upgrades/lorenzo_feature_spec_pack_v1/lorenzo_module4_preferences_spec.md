# Module 4 -- Customer Preference Memory Feature Spec

**Version:** 1.0
**Status:** Draft
**Date:** February 2026
**Author:** AI Agents Plus Engineering
**System:** Lorenzo Dry Cleaners Management System v2.0
**Module Maturity:** `[PARTIALLY BUILT]`

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
| Module ID | M4 |
| Module Name | Customer Preference Memory |
| Version | 1.0 |
| Status | Draft |
| Date | February 2026 |
| Maturity | `[PARTIALLY BUILT]` -- Customer CRUD, basic preferences, segmentation, and AI customer agent exist. Conversation capture, AI preference extraction, customer briefs, and POS suggestions are new. |
| Dependencies | Master Spec (required), Module 1 (required -- order history data feeds preference analysis), Module 3 (consumer -- proximity offers use preference opt-in data) |
| Consumed By | Module 3 (Proximity Intelligence), Module 5 (AI Insights), Module 6 (Voucher System) |
| Primary Stakeholders | Director, General Manager, Front Desk Staff, Customers |
| Requirement IDs | FR-M4-001 through FR-M4-042 |

---

## 2. Executive Summary

### What This Module Does

Module 4 implements a **Customer Intelligence System** that captures conversations from multiple channels (WhatsApp messages via Wati.io webhooks and staff observations entered at POS), extracts structured preferences using AI (multi-provider LLM), builds comprehensive preference profiles, and surfaces actionable customer briefs at the point of service. It transforms raw interactions into personalized service delivery.

### Business Value

- **Increased retention:** Personalized service remembers customer preferences across visits, reducing friction and building loyalty.
- **Higher average order value:** Preference-based service suggestions at POS encourage add-on services aligned with customer history.
- **Improved customer lifetime value:** Knowing communication preferences (timing, channel, frequency) reduces notification fatigue and increases engagement.
- **Operational efficiency:** AI-generated customer briefs at POS eliminate the need for staff to manually recall customer history.
- **Data-driven segmentation:** Preference data enriches existing customer segments (`regular`, `vip`, `corporate`) with behavioral intelligence.

### Current State (What Exists)

The system already has:

- **Customer CRUD** (`lib/db/customers.ts`) -- Full create, read, update, delete with phone validation, search, address management, and preference updates.
- **Customer interface** (`lib/db/schema.ts`, lines 109-162) -- Fields: `customerId`, `name`, `phone`, `email`, `addresses`, `preferences`, `createdAt`, `orderCount`, `totalSpent`, `creditBalance`, `countryCode`, `segment`, `vipQualifiedAt`, `corporateAgreementId`, `customerType`, `loyaltyPoints`, `lastOrderDate`.
- **CustomerPreferences interface** (`lib/db/schema.ts`, lines 98-103) -- Fields: `notifications` (boolean), `language` ('en' | 'sw').
- **Customer segmentation** (`app/api/customers/segmentation/route.ts`) -- VIP evaluation, corporate linking, segment summary, statistics.
- **CustomerStatistics interface** (`lib/db/schema.ts`, lines 216-237) -- Fields: `totalOrders`, `totalSpend`, `last12MonthsOrders`, `last12MonthsSpend`, `avgOrderValue`, `daysSinceLastOrder`, `currentSegment`.
- **AI Customer Agent** (`lib/agents/customer-agent.ts`) -- Actions: `getProfile`, `getOrderSummary`, `getSpendHistory`, `searchCustomer`, `getTopCustomers`, `getRecentCustomers`, `getCustomerInsights`.
- **Base Agent pattern** (`lib/agents/base-agent.ts`) -- Abstract class with `processRequest()`, authorization checking, parameter validation, and response formatting.
- **Agent types** (`lib/agents/types.ts`) -- `AgentName` includes `'customer-agent'`, `CustomerSummary` interface, `AgentAuth` for RBAC.
- **Multi-provider LLM** (`lib/llm/`) -- `LLMClient` with `chatCompletion()`, provider fallback chain (OpenAI -> Anthropic -> Google -> Local), `complete()` and `ask()` convenience functions.
- **LLM types** (`lib/llm/types.ts`) -- `ChatMessage`, `ChatCompletionOptions`, `ChatCompletionResponse`, `LLMProviderInterface`.
- **LLM schema types** (`lib/db/schema.ts`, lines 1613-1742) -- `LLMProvider`, `LLMAgentType` (includes `'customer'`), `AgentFunction`, `GlobalLLMConfig`, `ModelAssignment`, `ProviderConfig`.
- **WhatsApp service** (`services/wati.ts`) -- Outbound message sending via Wati.io API, phone formatting, retry logic, notification logging. Currently outbound-only; no inbound webhook receiver.
- **Audit logging** (`lib/db/audit-logs.ts`) -- `createAuditLog()` with action types, resource tracking, before/after change recording, branch scoping.
- **AuditLog interface** (`lib/db/schema.ts`, lines 1545-1577) -- Fields: `auditLogId`, `action`, `resourceType`, `resourceId`, `performedBy`, `performedByName`, `performedByRole`, `branchId`, `description`, `changes`, `timestamp`.

### Enhancement Areas (What This Module Adds)

1. **Conversation Capture -- WhatsApp Channel:** NEW webhook endpoint to receive inbound and outbound Wati.io messages and store them as `CustomerConversation` documents.
2. **Conversation Capture -- Staff Notes Channel:** NEW POS interface for staff to enter observations, verbal requests, complaints, and special needs during or after order creation.
3. **AI Preference Extraction:** NEW pipeline that processes conversation batches through LLM to extract structured preference data with confidence scores.
4. **Customer Preference Profiles:** NEW structured data store for service preferences, timing preferences, communication preferences, and special needs.
5. **Customer Briefs:** NEW AI-generated natural-language summaries shown at POS when a customer is selected during order creation.
6. **POS Suggestions:** NEW auto-fill from order history during order creation (suggested services, preferred garment care options).
7. **Enhanced Segmentation:** ENHANCE existing segmentation with preference-based clusters and behavioral signals.
8. **Preference-driven Communication:** ENHANCE notification timing, frequency, and channel selection based on extracted preferences.

---

## 3. Existing Foundation

### Customer Data Layer

| File | Path | Purpose | Key Exports |
|------|------|---------|-------------|
| Customer CRUD | `lib/db/customers.ts` | Database operations | `createCustomer()`, `getCustomer()`, `getCustomerByPhone()`, `searchCustomers()`, `updateCustomer()`, `updateCustomerPreferences()`, `incrementCustomerStats()`, `getRecentCustomers()`, `getTopCustomers()`, `deleteCustomer()`, `getCustomerByPhoneOrEmail()`, `getCustomerByEmail()`, `getCustomersByCountry()`, `getInternationalCustomers()`, `updateCustomerPhone()`, `addCustomerAddress()`, `updateCustomerAddress()`, `removeCustomerAddress()`, `isPhoneRegistered()`, `generateCustomerId()` |
| Schema Types | `lib/db/schema.ts` | Type definitions | `Customer` (lines 109-162), `CustomerPreferences` (lines 98-103), `CustomerStatistics` (lines 216-237), `Address` (lines 79-93), `CustomerSegment` (line 991), `CorporateAgreement` (lines 177-210) |
| Customer Credit API | `app/api/customers/[customerId]/credit/route.ts` | Credit balance management | GET (balance + history), POST (add credit), PUT (apply credit to order) |
| Segmentation API | `app/api/customers/segmentation/route.ts` | Segment management | GET (summary, by segment, by customer, approaching VIP), POST (evaluate, set_segment, link_corporate, unlink_corporate, update_statistics) |
| Corporate API | `app/api/corporate/route.ts` | Corporate agreements | CRUD for corporate customer agreements |
| Loyalty API | `app/api/loyalty/customers/[customerId]/route.ts` | Loyalty points | Customer loyalty data |
| Loyalty Points API | `app/api/loyalty/customers/[customerId]/points/route.ts` | Points transactions | Points history and operations |

### AI Agent Layer

| File | Path | Purpose | Key Exports |
|------|------|---------|-------------|
| Customer Agent | `lib/agents/customer-agent.ts` | Customer queries | `CustomerAgent` class with 7 capabilities: `getProfile`, `getOrderSummary`, `getSpendHistory`, `searchCustomer`, `getTopCustomers`, `getRecentCustomers`, `getCustomerInsights` |
| Base Agent | `lib/agents/base-agent.ts` | Agent framework | `BaseAgent` abstract class with `processRequest()`, `checkAuthorization()`, `validateParams()`, `successResponse()`, `errorResponse()` |
| Agent Types | `lib/agents/types.ts` | Type definitions | `AgentName`, `AgentAuth`, `AgentRequest`, `AgentResponse`, `AgentCapability`, `CustomerSummary`, `ChatConversation`, `ChatMessage`, `Intent` (includes `CUSTOMER_PREFERENCES`) |
| Agent Router | `lib/agents/agent-router.ts` | Request routing | Routes requests to appropriate agent |
| Agent Index | `lib/agents/index.ts` | Module exports | Barrel exports for all agents |
| Agents API | `app/api/agents/route.ts` | HTTP endpoint | REST API for agent interactions |

### LLM Layer

| File | Path | Purpose | Key Exports |
|------|------|---------|-------------|
| LLM Client | `lib/llm/llm-client.ts` | Unified LLM client | `LLMClient` class with `chatCompletion()`, `chatCompletionWithProvider()`, `isProviderAvailable()`, `tryFallbackProviders()`; convenience functions `getLLMClient()`, `complete()`, `ask()` |
| LLM Types | `lib/llm/types.ts` | Type definitions | `ChatMessage`, `ChatRole`, `ChatCompletionOptions`, `ChatCompletionResponse`, `ChatCompletionChunk`, `LLMRequestContext`, `ProviderClientConfig`, `LLMError`, `RateLimitError`, `AuthenticationError`, `LLMProviderInterface` |
| Base Provider | `lib/llm/providers/base-provider.ts` | Provider framework | `BaseProvider` abstract class with `fetchWithTimeout()`, `parseErrorResponse()` |
| OpenAI Provider | `lib/llm/providers/openai-provider.ts` | OpenAI integration | GPT-4 and GPT-3.5 support |
| Anthropic Provider | `lib/llm/providers/anthropic-provider.ts` | Anthropic integration | Claude model support |
| Google Provider | `lib/llm/providers/google-provider.ts` | Google integration | Gemini model support |
| Local Provider | `lib/llm/providers/local-provider.ts` | Local model | Ollama / local model support |
| LLM Index | `lib/llm/index.ts` | Module exports | Barrel exports |

### WhatsApp Integration

| File | Path | Purpose | Key Exports |
|------|------|---------|-------------|
| Wati Service | `services/wati.ts` | WhatsApp messaging | `sendWhatsAppMessage()`, `sendOrderConfirmation()`, `sendOrderReady()`, `sendDriverDispatched()`, `sendDriverNearby()`, `sendDelivered()`, `sendPaymentReminder()`, `testWatiConnection()`, `getMessageTemplates()`, `formatPhoneNumber()`, `isValidKenyanPhoneNumber()` |
| Wati Test API | `app/api/test/wati/route.ts` | Connection testing | Wati.io API connectivity test |
| Pesapal Webhook | `app/api/webhooks/pesapal/route.ts` | Payment webhooks | Example of existing webhook pattern |
| Biometric Webhook | `app/api/webhooks/biometric/route.ts` | Biometric webhooks | Example of existing webhook pattern |
| Feedback Webhook | `app/api/webhooks/feedback/route.ts` | Feedback webhooks | Example of existing webhook pattern |
| Order Notification Webhook | `app/api/webhooks/order-notifications/route.ts` | Order webhooks | Example of existing webhook pattern |

### POS Components (Customer Display)

| File | Path | Purpose |
|------|------|---------|
| CustomerCard | `components/features/pos/CustomerCard.tsx` | Displays selected customer info in POS -- avatar, name, phone, email, order count, total spent. Props: `customer: Customer`, `onChangeCustomer`, `onEditCustomer` |
| CustomerSearch | `components/features/pos/CustomerSearch.tsx` | Search customers by name/phone with debounced results, recent customers on load. Uses `searchCustomers()` and `getRecentCustomers()` from `lib/db/customers.ts` |
| CustomerSearchModal | `components/features/pos/CustomerSearchModal.tsx` | Modal wrapper for customer search |
| CreateCustomerModal | `components/features/pos/CreateCustomerModal.tsx` | New customer creation form |
| GarmentEntryForm | `components/features/pos/GarmentEntryForm.tsx` | Garment entry with type, color, brand, category, services, instructions. Has `specialInstructions` field |
| OrderSummary | `components/features/pos/OrderSummary.tsx` | Order summary display |
| OrderSummaryPanel | `components/features/pos/OrderSummaryPanel.tsx` | Side panel order summary |
| POSHeader | `components/features/pos/POSHeader.tsx` | POS page header |
| POS Page | `app/(dashboard)/pos/page.tsx` | Main POS page -- orchestrates customer selection, garment entry, order creation |

### Audit & Compliance

| File | Path | Purpose | Key Exports |
|------|------|---------|-------------|
| Audit Logs | `lib/db/audit-logs.ts` | Audit log operations | `createAuditLog()`, `logOrderCreated()`, `logOrderUpdated()`, `logInventoryTransfer()`, `logRoleChange()`, `logBranchAccessChange()`, `logCrossBranchAction()`, `getAuditLogsByResource()`, `getAuditLogsByBranch()`, `getAuditLogsByUser()`, `getRecentAuditLogs()`, `getCrossBranchAuditLogs()` |
| Audit Types | `lib/db/schema.ts` | Type definitions | `AuditLogAction` (lines 1528-1537): `'create'`, `'update'`, `'delete'`, `'transfer'`, `'approve'`, `'reject'`, `'role_change'`, `'branch_access_change'`, `'permission_change'`; `AuditLog` interface (lines 1545-1577) |

### Hooks

| File | Path | Purpose |
|------|------|---------|
| useAuth | `hooks/useAuth.ts` | Authentication context access -- provides `user`, `userData`, `signIn`, `signOut`, `isAdmin` |
| useGMDashboard | `hooks/useGMDashboard.ts` | GM dashboard data |
| useRealTimeGMDashboard | `hooks/useRealTimeGMDashboard.ts` | Real-time GM dashboard updates |
| usePipelineFilters | `hooks/usePipelineFilters.ts` | Pipeline filter state |
| useWeather | `hooks/useWeather.ts` | Weather data |

---

## 4. Requirements

### 4.1 Customer Profile (Existing CRUD)

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-001 | System shall maintain customer records with fields: `customerId`, `name`, `phone`, `email`, `addresses`, `preferences`, `createdAt`, `orderCount`, `totalSpent`, `creditBalance`, `segment`, `customerType`, `loyaltyPoints`, `lastOrderDate`. | `[EXISTING]` | P0 |
| FR-M4-002 | System shall support customer search by name or phone number with debounced results (300ms delay) and recent customer listing. | `[EXISTING]` | P0 |
| FR-M4-003 | System shall validate and normalize phone numbers to E.164 format before storage, supporting international numbers via `validatePhoneNumber()` and `formatPhoneE164()` from `lib/utils/phone-validator`. | `[EXISTING]` | P0 |
| FR-M4-004 | System shall store basic customer preferences: `notifications` (boolean) and `language` ('en' or 'sw') via the `CustomerPreferences` interface. | `[EXISTING]` | P0 |
| FR-M4-005 | System shall add a `preferenceProfileId` optional field to the `Customer` interface linking to the customer's `CustomerPreferenceProfile` document. | `[ENHANCE]` | P1 |
| FR-M4-006 | System shall add a `lastConversationAt` optional Timestamp field to the `Customer` interface tracking when the most recent conversation (WhatsApp or staff note) was recorded. | `[ENHANCE]` | P2 |
| FR-M4-007 | System shall add a `conversationCount` optional number field to the `Customer` interface tracking total conversations captured. | `[ENHANCE]` | P2 |

### 4.2 Conversation Capture -- WhatsApp Channel

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-008 | System shall provide a webhook endpoint at `POST /api/webhooks/wati` to receive Wati.io webhook payloads for inbound and outbound WhatsApp messages. | `[NEW]` | P0 |
| FR-M4-009 | Webhook handler shall parse Wati.io payload to extract: sender phone number, message text, timestamp, message direction (inbound/outbound), and message ID. | `[NEW]` | P0 |
| FR-M4-010 | Webhook handler shall normalize the sender phone number using `formatPhoneE164()` and match it to an existing customer via `getCustomerByPhone()`. If no match is found, the conversation shall be stored with `customerId: null` for later linking. | `[NEW]` | P0 |
| FR-M4-011 | Webhook handler shall create a `CustomerConversation` document in the `customerConversations` Firestore collection for each received message. | `[NEW]` | P0 |
| FR-M4-012 | Webhook handler shall implement idempotent processing by checking `conversationId` (derived from Wati.io message ID) before creating a document to prevent duplicates on webhook retry. | `[NEW]` | P1 |
| FR-M4-013 | Webhook handler shall update the customer's `lastConversationAt` and increment `conversationCount` after successfully storing a conversation. | `[NEW]` | P1 |
| FR-M4-014 | Webhook shall respond with HTTP 200 within 5 seconds to prevent Wati.io retry. All processing beyond acknowledgment shall be asynchronous. | `[NEW]` | P0 |

### 4.3 Conversation Capture -- Staff Notes Channel

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-015 | System shall provide a `StaffNoteInput` component in the POS interface that allows front desk and workstation staff to enter free-text observations about a customer. | `[NEW]` | P0 |
| FR-M4-016 | Staff notes shall be associated with the current order (if in order creation context) or standalone if entered from customer profile. | `[NEW]` | P1 |
| FR-M4-017 | Staff notes shall be stored as `CustomerConversation` documents with `channel: 'staff_note'`, `staffId`, `staffName`, `branchId`, and optional `orderId`. | `[NEW]` | P0 |
| FR-M4-018 | System shall provide `POST /api/customers/:customerId/notes` API endpoint for creating staff notes. | `[NEW]` | P0 |
| FR-M4-019 | Staff notes shall support categorization tags: `'verbal_request'`, `'complaint'`, `'observation'`, `'special_need'`, `'compliment'`, `'general'`. | `[NEW]` | P1 |
| FR-M4-020 | Staff note entry shall be accessible during order creation (inline below customer card) and from the customer detail view. | `[NEW]` | P1 |

### 4.4 AI Preference Extraction

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-021 | System shall implement a preference extraction pipeline that collects the last N conversations (WhatsApp + staff notes) for a customer and sends them to the configured LLM for structured extraction. | `[NEW]` | P0 |
| FR-M4-022 | LLM extraction shall use the `LLMClient.chatCompletion()` method with `agentType: 'customer'` and a new `AgentFunction` value `'preference_extraction'` to be added to the `AgentFunction` type in `lib/db/schema.ts`. | `[NEW]` | P0 |
| FR-M4-023 | LLM extraction prompt shall request JSON output with the following categories: `servicePreferences`, `timingPreferences`, `communicationPreferences`, `specialNeeds`, each with field-level `confidence` scores (0.0 to 1.0). | `[NEW]` | P0 |
| FR-M4-024 | Extraction pipeline shall merge new extractions with existing profile data using a "higher confidence wins, no data loss" strategy: new fields overwrite only when the new confidence score exceeds the existing confidence score. | `[NEW]` | P0 |
| FR-M4-025 | Extraction shall run as a batch job every 6 hours for customers with new conversations since their last extraction, not real-time per message. | `[NEW]` | P1 |
| FR-M4-026 | System shall provide `POST /api/customers/:customerId/extract-preferences` API endpoint to trigger on-demand extraction for a single customer. | `[NEW]` | P1 |
| FR-M4-027 | Extraction shall use the LLM fallback chain defined in `GlobalLLMConfig.fallbackOrder` (default: OpenAI -> Anthropic -> Google -> Local) when the primary provider fails. | `[NEW]` | P1 |
| FR-M4-028 | Each extraction event shall log: model used, provider, token usage, confidence scores, number of conversations processed, and duration to the audit log via `createAuditLog()`. | `[NEW]` | P1 |

### 4.5 Customer Preference Profiles

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-029 | System shall create and maintain a `CustomerPreferenceProfile` document in the `customerPreferenceProfiles` Firestore collection for each customer that has undergone preference extraction. | `[NEW]` | P0 |
| FR-M4-030 | Profile shall include `servicePreferences`: preferred service types (e.g., `['dry_clean', 'iron']`), starch preference (`'none'`, `'light'`, `'medium'`, `'heavy'`), fabric care notes, preferred garment categories. | `[NEW]` | P0 |
| FR-M4-031 | Profile shall include `timingPreferences`: preferred pickup days (array of weekday names), preferred pickup time window (e.g., `'morning'`, `'afternoon'`, `'evening'`), preferred delivery window, typical turnaround tolerance. | `[NEW]` | P1 |
| FR-M4-032 | Profile shall include `communicationPreferences`: preferred channel (`'whatsapp'`, `'sms'`, `'email'`), preferred contact frequency (`'per_order'`, `'daily_digest'`, `'weekly'`), preferred language, quiet hours (do not disturb time range). | `[NEW]` | P1 |
| FR-M4-033 | Profile shall include `specialNeeds`: allergies or sensitivities (e.g., chemical sensitivity), accessibility requirements, specific handling instructions that apply to all orders. | `[NEW]` | P1 |
| FR-M4-034 | System shall provide `GET /api/customers/:customerId/preferences` API endpoint to retrieve the full preference profile. | `[NEW]` | P0 |

### 4.6 Customer Briefs (AI-Generated POS Summaries)

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-035 | System shall generate an AI-powered `CustomerBrief` when a customer is selected at POS, combining preference profile, last 5 orders, total spend, visit frequency, and segment into a 2-3 sentence natural language summary with 3-5 key preference bullets. | `[NEW]` | P0 |
| FR-M4-036 | Brief generation shall use `LLMClient.chatCompletion()` with `agentType: 'customer'` and a new `AgentFunction` value `'brief_generation'` to be added to the `AgentFunction` type. | `[NEW]` | P0 |
| FR-M4-037 | Briefs shall be cached for 24 hours. A new brief is generated only if the existing one is older than 24 hours or missing. Cache key: `customerId`. | `[NEW]` | P1 |
| FR-M4-038 | System shall provide `GET /api/customers/:customerId/brief` API endpoint returning the cached or freshly generated brief. | `[NEW]` | P0 |
| FR-M4-039 | Brief response shall include: `summary` (string), `keyPreferences` (string[]), `lastOrderInfo` (object), `suggestedServices` (string[]), `generatedAt` (timestamp), `modelUsed` (string). | `[NEW]` | P0 |

### 4.7 POS Suggestions from Order History

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-040 | When a customer is selected at POS, the system shall auto-suggest the most frequently ordered garment types and services based on order history analysis via `getOrdersByCustomer()` from `lib/db/orders.ts`. | `[NEW]` | P1 |
| FR-M4-041 | Suggestions shall appear as quick-action chips in the `GarmentEntryForm` component (file: `components/features/pos/GarmentEntryForm.tsx`) allowing one-tap addition of previously ordered service combinations. | `[NEW]` | P2 |

### 4.8 Enhanced Customer Segmentation

| ID | Requirement | Tag | Priority |
|----|------------|-----|----------|
| FR-M4-042 | Existing segmentation API (`app/api/customers/segmentation/route.ts`) shall be enhanced with a `type: 'preference_cluster'` query parameter that returns customers grouped by preference similarity (e.g., "express-preferring", "starch-heavy", "weekend-only"). | `[ENHANCE]` | P2 |

---

## 5. Data Model

### 5.1 Existing: Customer Interface

**Source:** `lib/db/schema.ts`, lines 109-162
**Collection:** `customers`

```typescript
export interface Customer {
  customerId: string;           // Format: CUST-[TIMESTAMP]-[RANDOM]
  name: string;
  phone: string;                // E.164 format (+254712345678)
  email?: string;
  addresses: Address[];
  preferences: CustomerPreferences;
  createdAt: Timestamp;
  orderCount: number;
  totalSpent: number;
  creditBalance?: number;
  lastCreditUpdate?: Timestamp;

  // International Phone (FR-014)
  countryCode?: string;         // ISO 3166-1 alpha-2 (e.g., 'KE')
  phoneValidated?: boolean;
  nationalNumber?: string;
  phoneFormatted?: string;

  // Segmentation (FR-017)
  segment?: 'regular' | 'vip' | 'corporate';
  vipQualifiedAt?: Timestamp;
  corporateAgreementId?: string;
  lastSegmentEvaluation?: Timestamp;

  // V2.0 Enhancement Fields
  customerType?: 'Regular' | 'Corporate' | 'VIP';
  loyaltyPoints?: number;
  lastOrderDate?: Timestamp;

  // === NEW: Module 4 Fields ===
  preferenceProfileId?: string;     // FK to customerPreferenceProfiles
  lastConversationAt?: Timestamp;   // Most recent conversation timestamp
  conversationCount?: number;       // Total conversations captured
}
```

### 5.2 Existing: CustomerPreferences Interface

**Source:** `lib/db/schema.ts`, lines 98-103

```typescript
export interface CustomerPreferences {
  notifications: boolean;
  language: 'en' | 'sw';
}
```

This interface is preserved as-is. The new extended preference data lives in the separate `CustomerPreferenceProfile` document to avoid breaking existing code that depends on the `CustomerPreferences` shape.

### 5.3 Existing: CustomerStatistics Interface

**Source:** `lib/db/schema.ts`, lines 216-237
**Collection:** `customerStatistics`

```typescript
export interface CustomerStatistics {
  customerId: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate?: Timestamp;
  last12MonthsOrders: number;
  last12MonthsSpend: number;
  avgOrderValue: number;
  daysSinceLastOrder?: number;
  currentSegment: 'regular' | 'vip' | 'corporate';
  updatedAt: Timestamp;
}
```

### 5.4 NEW: CustomerConversation Interface

**Collection:** `customerConversations`

```typescript
/**
 * A single captured conversation message from any channel.
 * Collection: customerConversations
 *
 * @module lib/db/schema (to be added)
 */
export interface CustomerConversation {
  /** Unique conversation document ID */
  conversationId: string;

  /** Reference to customer. Null if WhatsApp message from unrecognized number */
  customerId: string | null;

  /** Source channel of the conversation */
  channel: 'whatsapp' | 'staff_note';

  /** Direction of the message (for WhatsApp). Staff notes are always 'inbound'. */
  direction: 'inbound' | 'outbound';

  /** Raw message content / note text */
  content: string;

  /** Timestamp when message was sent or note was created */
  timestamp: Timestamp;

  /** Staff UID who entered the note (only for channel: 'staff_note') */
  staffId?: string;

  /** Staff name who entered the note (denormalized, only for channel: 'staff_note') */
  staffName?: string;

  /** Branch where note was entered (only for channel: 'staff_note') */
  branchId?: string;

  /** Related order ID (if note was created during order creation) */
  orderId?: string;

  /** Note category tag (only for channel: 'staff_note') */
  noteCategory?: 'verbal_request' | 'complaint' | 'observation'
    | 'special_need' | 'compliment' | 'general';

  /** Wati.io message ID (for deduplication, only for channel: 'whatsapp') */
  externalMessageId?: string;

  /** Customer phone number (for WhatsApp messages, used for later linking if customerId is null) */
  customerPhone?: string;

  /** Whether this conversation has been processed by the preference extraction pipeline */
  extractionProcessed: boolean;

  /** Timestamp when extraction processing occurred */
  extractionProcessedAt?: Timestamp;

  /** Metadata from the source system */
  metadata?: Record<string, unknown>;
}
```

**Firestore Indexes Required:**

```
customerConversations:
  - customerId ASC, timestamp DESC
  - customerId ASC, extractionProcessed ASC, timestamp DESC
  - customerPhone ASC, timestamp DESC
  - externalMessageId ASC (unique constraint via application logic)
  - channel ASC, timestamp DESC
```

### 5.5 NEW: CustomerPreferenceProfile Interface

**Collection:** `customerPreferenceProfiles`

```typescript
/**
 * Structured preference profile built from AI extraction of conversations.
 * Collection: customerPreferenceProfiles
 *
 * @module lib/db/schema (to be added)
 */
export interface CustomerPreferenceProfile {
  /** Unique profile document ID */
  profileId: string;

  /** Reference to customer */
  customerId: string;

  /** Service preferences extracted from conversations and order history */
  servicePreferences: {
    /** Preferred service types (e.g., 'dry_clean', 'wash', 'iron', 'starch') */
    preferredServices: string[];
    /** Starch level preference */
    starchPreference?: 'none' | 'light' | 'medium' | 'heavy';
    /** Specific fabric care notes (e.g., "hand wash silk items") */
    fabricCareNotes?: string[];
    /** Preferred garment categories (e.g., 'suits', 'shirts', 'dresses') */
    preferredGarmentTypes?: string[];
    /** Confidence score for service preferences (0.0 - 1.0) */
    confidence: number;
  };

  /** Timing preferences for pickups and deliveries */
  timingPreferences: {
    /** Preferred pickup days (e.g., ['monday', 'wednesday', 'friday']) */
    preferredPickupDays?: string[];
    /** Preferred pickup time window */
    preferredPickupWindow?: 'morning' | 'afternoon' | 'evening';
    /** Preferred delivery days */
    preferredDeliveryDays?: string[];
    /** Preferred delivery time window */
    preferredDeliveryWindow?: 'morning' | 'afternoon' | 'evening';
    /** Typical turnaround tolerance ('standard' = normal, 'fast' = prefers express) */
    turnaroundPreference?: 'standard' | 'fast';
    /** Confidence score (0.0 - 1.0) */
    confidence: number;
  };

  /** Communication preferences */
  communicationPreferences: {
    /** Preferred communication channel */
    preferredChannel?: 'whatsapp' | 'sms' | 'email';
    /** Preferred contact frequency */
    contactFrequency?: 'per_order' | 'daily_digest' | 'weekly';
    /** Preferred language for communications */
    preferredLanguage?: 'en' | 'sw';
    /** Quiet hours -- do not disturb time range */
    quietHoursStart?: string; // HH:MM format
    quietHoursEnd?: string;   // HH:MM format
    /** Whether customer has opted out of promotional messages */
    promotionalOptOut?: boolean;
    /** Confidence score (0.0 - 1.0) */
    confidence: number;
  };

  /** Special needs and requirements */
  specialNeeds: {
    /** Allergies or chemical sensitivities */
    allergiesOrSensitivities?: string[];
    /** Accessibility requirements */
    accessibilityNeeds?: string[];
    /** Permanent handling instructions (apply to all orders) */
    permanentInstructions?: string[];
    /** Confidence score (0.0 - 1.0) */
    confidence: number;
  };

  /** Array of conversationIds that contributed to this profile */
  sourceConversationIds: string[];

  /** Total number of conversations analyzed */
  totalConversationsAnalyzed: number;

  /** LLM model used for most recent extraction */
  lastModelUsed: string;

  /** LLM provider used for most recent extraction */
  lastProviderUsed: string;

  /** Timestamp of profile creation */
  createdAt: Timestamp;

  /** Timestamp of last profile update */
  lastUpdated: Timestamp;

  /** Version counter (incremented on each extraction merge) */
  version: number;
}
```

**Firestore Indexes Required:**

```
customerPreferenceProfiles:
  - customerId ASC (unique -- one profile per customer)
  - lastUpdated DESC
```

### 5.6 NEW: CustomerBrief Interface

**Collection:** `customerBriefs` (cache collection, documents expire after 24h via TTL)

```typescript
/**
 * AI-generated customer summary shown at POS during order creation.
 * Collection: customerBriefs
 *
 * @module lib/db/schema (to be added)
 */
export interface CustomerBrief {
  /** Document ID (same as customerId for easy lookup) */
  customerId: string;

  /** Natural language summary of the customer (2-3 sentences) */
  summary: string;

  /** Key preferences as bullet points (3-5 items) */
  keyPreferences: string[];

  /** Last order information */
  lastOrderInfo: {
    orderId: string;
    date: Timestamp;
    totalAmount: number;
    garmentCount: number;
    services: string[];
  } | null;

  /** AI-suggested services for the next order */
  suggestedServices: string[];

  /** Suggested garment types based on history */
  suggestedGarmentTypes: string[];

  /** Customer segment for display */
  segment: 'regular' | 'vip' | 'corporate';

  /** Visit frequency label */
  visitFrequency: string; // e.g., "Weekly regular", "Monthly visitor", "First-time"

  /** Timestamp when brief was generated */
  generatedAt: Timestamp;

  /** TTL field for Firestore auto-deletion (24 hours from generation) */
  expiresAt: Timestamp;

  /** LLM model used */
  modelUsed: string;

  /** LLM provider used */
  providerUsed: string;

  /** Token usage for cost tracking */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

### 5.7 NEW: PreferenceExtractionJob Interface

**Collection:** `preferenceExtractionJobs` (operational, tracks batch processing)

```typescript
/**
 * Tracks batch preference extraction jobs.
 * Collection: preferenceExtractionJobs
 *
 * @module lib/db/schema (to be added)
 */
export interface PreferenceExtractionJob {
  /** Unique job ID */
  jobId: string;

  /** Job status */
  status: 'pending' | 'processing' | 'completed' | 'failed';

  /** Customer IDs to process in this batch */
  customerIds: string[];

  /** Number of customers processed so far */
  processedCount: number;

  /** Number of customers that failed extraction */
  failedCount: number;

  /** Number of customers successfully extracted */
  successCount: number;

  /** Job creation timestamp */
  createdAt: Timestamp;

  /** Job start timestamp */
  startedAt?: Timestamp;

  /** Job completion timestamp */
  completedAt?: Timestamp;

  /** Error message if job failed */
  errorMessage?: string;

  /** Trigger type */
  trigger: 'scheduled' | 'manual' | 'webhook';
}
```

### 5.8 Schema Type Additions to `lib/db/schema.ts`

The following additions are required to the existing schema file:

```typescript
// Add to AgentFunction type (line ~1618)
export type AgentFunction =
  | 'chat_response'
  | 'intent_classification'
  | 'data_response'
  | 'analytics_insights'
  | 'time_estimation'
  | 'preference_extraction'    // NEW: M4
  | 'brief_generation';        // NEW: M4

// Add to AuditLogAction type (line ~1528)
export type AuditLogAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'transfer'
  | 'approve'
  | 'reject'
  | 'role_change'
  | 'branch_access_change'
  | 'permission_change'
  | 'preference_extraction'    // NEW: M4
  | 'data_export'              // NEW: M4 (GDPR)
  | 'data_deletion';           // NEW: M4 (GDPR)
```

---

## 6. State Machine / Workflows

### 6.1 Conversation-to-Preference Pipeline

```
                                         +-----------------+
                                         |                 |
Wati.io Webhook --------> conversation   |                 |
                          _received  ----+-> queued_for    |
Staff Note Entry -------> conversation   |   _extraction --+-> extracting --> extracted --> profile_updated
                          _received  ----+                 |
                                         |                 |
                                         +--(batch job)----+
```

**States:**

| State | Description | Trigger | Next State |
|-------|-------------|---------|------------|
| `conversation_received` | A new `CustomerConversation` document has been created. `extractionProcessed: false`. | Wati.io webhook or staff note POST | `queued_for_extraction` |
| `queued_for_extraction` | Customer has unprocessed conversations. The batch job will pick them up on next run. | 6-hour batch scheduler or manual trigger | `extracting` |
| `extracting` | LLM is processing the customer's conversations. A `PreferenceExtractionJob` is in `processing` state. | Batch job starts processing customer | `extracted` or `failed` |
| `extracted` | LLM has returned structured preference data. Raw result awaiting merge. | LLM returns successfully | `profile_updated` |
| `profile_updated` | Preference data merged into `CustomerPreferenceProfile`. Source conversations marked `extractionProcessed: true`. | Merge logic completes | Terminal (until next conversation) |
| `failed` | Extraction failed (LLM error, timeout, all providers down). | LLM error after fallback exhaustion | `queued_for_extraction` (retry on next batch) |

**Batch Job Schedule:**

- Runs every 6 hours (00:00, 06:00, 12:00, 18:00 EAT).
- Query: `customerConversations` where `extractionProcessed == false`, grouped by `customerId`.
- Process up to 100 customers per batch.
- For each customer, collect last 20 unprocessed conversations.
- On-demand extraction (`POST /api/customers/:id/extract-preferences`) bypasses the schedule.

### 6.2 Customer Brief Generation Pipeline

```
POS customer lookup --> check cache --> [miss] --> generating --> ready --> displayed
                                    --> [hit & fresh] ----------------> displayed
                                    --> [hit & stale] --> generating --> ready --> displayed
```

**States:**

| State | Description | Trigger | Next State |
|-------|-------------|---------|------------|
| `triggered_by_POS_lookup` | Customer selected at POS. System checks `customerBriefs` collection for existing brief. | `GET /api/customers/:id/brief` called | `cache_hit` or `generating` |
| `cache_hit` | Brief exists and `generatedAt` is within 24 hours. Return cached brief. | Document found with valid TTL | `displayed` |
| `generating` | Brief not found or stale. System calls LLM to generate. | Cache miss or TTL expired | `ready` |
| `ready` | Brief generated and written to `customerBriefs` collection. | LLM returns successfully | `displayed` |
| `displayed` | Brief JSON returned to POS client for rendering in `CustomerBriefCard`. | API response sent | Terminal |

**Cache TTL:** 24 hours. Implemented via Firestore `expiresAt` field. Clients check `generatedAt` age; the API re-generates if older than 24h.

**Brief Generation Time Target:** Under 3 seconds (including LLM call). If LLM times out, return a fallback brief built from order history data only (no AI summary).

---

## 7. API Specification

### 7.1 Existing Endpoints (Customer)

| Method | Path | Source File | Description |
|--------|------|-------------|-------------|
| GET | `/api/customers/segmentation` | `app/api/customers/segmentation/route.ts` | Get segment summary, customers by segment, approaching VIP |
| POST | `/api/customers/segmentation` | `app/api/customers/segmentation/route.ts` | Evaluate segment, set segment, link/unlink corporate, update statistics |
| GET | `/api/customers/[customerId]/credit` | `app/api/customers/[customerId]/credit/route.ts` | Get credit balance and history |
| POST | `/api/customers/[customerId]/credit` | `app/api/customers/[customerId]/credit/route.ts` | Add credit to customer account |
| PUT | `/api/customers/[customerId]/credit` | `app/api/customers/[customerId]/credit/route.ts` | Apply credit to an order |
| POST | `/api/agents` | `app/api/agents/route.ts` | Agent interactions (customer-agent accessible here) |

### 7.2 NEW: Wati.io Webhook Receiver

**`POST /api/webhooks/wati`**

File: `app/api/webhooks/wati/route.ts` (NEW)

**Purpose:** Receives inbound and outbound WhatsApp messages from Wati.io webhook.

**Authentication:** Wati.io webhook secret validation (HMAC signature in `X-Wati-Signature` header, validated against `WATI_WEBHOOK_SECRET` environment variable).

**Request Body (Wati.io payload):**

```json
{
  "id": "wamid.HBgMMjU0NzEyMzQ1Njc4...",
  "whatsappMessageId": "wamid.HBgMMjU0NzEyMzQ1Njc4...",
  "eventType": "message",
  "timestamp": "2026-02-12T10:30:00.000Z",
  "waId": "254712345678",
  "text": "Hi, I need my suits ready by Friday please",
  "type": "text",
  "statusString": "RECEIVED",
  "listReply": null,
  "replyContextId": null
}
```

**Response:**

```json
{
  "success": true,
  "conversationId": "CONV-abc123..."
}
```

**Status Codes:**

| Code | Meaning |
|------|---------|
| 200 | Message received and stored |
| 400 | Invalid payload format |
| 401 | Invalid webhook signature |
| 409 | Duplicate message (idempotent -- already processed) |
| 500 | Internal server error |

### 7.3 NEW: Staff Notes

**`POST /api/customers/:customerId/notes`**

File: `app/api/customers/[customerId]/notes/route.ts` (NEW)

**Purpose:** Staff adds an observation or note about a customer.

**Authentication:** Requires authenticated staff session. Roles: `front_desk`, `workstation_staff`, `workstation_manager`, `store_manager`, `general_manager`, `admin`.

**Request Body:**

```json
{
  "content": "Customer mentioned they are allergic to certain fabric softeners. Prefers unscented detergent.",
  "noteCategory": "special_need",
  "orderId": "ORD-KIL-20260212-0045",
  "branchId": "branch-kilimani"
}
```

**Response:**

```json
{
  "success": true,
  "conversationId": "CONV-note-xyz789...",
  "customerId": "CUST-ABC123",
  "message": "Note added successfully"
}
```

**`GET /api/customers/:customerId/conversations`**

File: `app/api/customers/[customerId]/conversations/route.ts` (NEW)

**Purpose:** List all conversations for a customer (WhatsApp + staff notes).

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `channel` | `'whatsapp'` or `'staff_note'` | all | Filter by channel |
| `limit` | number | 50 | Max results |
| `offset` | number | 0 | Pagination offset |
| `startDate` | ISO string | -- | Filter from date |
| `endDate` | ISO string | -- | Filter to date |

**Response:**

```json
{
  "success": true,
  "customerId": "CUST-ABC123",
  "conversations": [
    {
      "conversationId": "CONV-abc123",
      "channel": "whatsapp",
      "direction": "inbound",
      "content": "Hi, I need my suits ready by Friday please",
      "timestamp": "2026-02-12T10:30:00.000Z",
      "extractionProcessed": true
    },
    {
      "conversationId": "CONV-note-xyz789",
      "channel": "staff_note",
      "direction": "inbound",
      "content": "Customer prefers unscented detergent due to allergies",
      "timestamp": "2026-02-12T11:00:00.000Z",
      "staffName": "Jane Wanjiku",
      "noteCategory": "special_need",
      "orderId": "ORD-KIL-20260212-0045",
      "extractionProcessed": false
    }
  ],
  "total": 2
}
```

### 7.4 NEW: Preference Profile

**`GET /api/customers/:customerId/preferences`**

File: `app/api/customers/[customerId]/preferences/route.ts` (NEW)

**Purpose:** Get the full structured preference profile for a customer.

**Authentication:** Requires authenticated session. Access depends on role (see Section 16).

**Response:**

```json
{
  "success": true,
  "customerId": "CUST-ABC123",
  "profile": {
    "profileId": "PREF-abc123",
    "servicePreferences": {
      "preferredServices": ["dry_clean", "iron"],
      "starchPreference": "light",
      "fabricCareNotes": ["Hand wash silk items", "Low heat for cashmere"],
      "preferredGarmentTypes": ["suits", "shirts", "dresses"],
      "confidence": 0.85
    },
    "timingPreferences": {
      "preferredPickupDays": ["monday", "wednesday"],
      "preferredPickupWindow": "morning",
      "preferredDeliveryDays": ["wednesday", "friday"],
      "preferredDeliveryWindow": "evening",
      "turnaroundPreference": "standard",
      "confidence": 0.72
    },
    "communicationPreferences": {
      "preferredChannel": "whatsapp",
      "contactFrequency": "per_order",
      "preferredLanguage": "en",
      "quietHoursStart": "21:00",
      "quietHoursEnd": "07:00",
      "promotionalOptOut": false,
      "confidence": 0.90
    },
    "specialNeeds": {
      "allergiesOrSensitivities": ["fabric softener sensitivity"],
      "accessibilityNeeds": [],
      "permanentInstructions": ["Use unscented detergent"],
      "confidence": 0.95
    },
    "totalConversationsAnalyzed": 15,
    "lastUpdated": "2026-02-12T06:00:00.000Z",
    "version": 3
  },
  "hasProfile": true
}
```

If no profile exists:

```json
{
  "success": true,
  "customerId": "CUST-ABC123",
  "profile": null,
  "hasProfile": false,
  "message": "No preference profile yet. Preferences will be extracted after conversations are captured."
}
```

### 7.5 NEW: Customer Brief

**`GET /api/customers/:customerId/brief`**

File: `app/api/customers/[customerId]/brief/route.ts` (NEW)

**Purpose:** Get AI-generated customer brief for POS display.

**Authentication:** Requires authenticated staff session. Roles: `front_desk`, `store_manager`, `general_manager`, `admin`.

**Response:**

```json
{
  "success": true,
  "customerId": "CUST-ABC123",
  "brief": {
    "summary": "Mary Kamau is a VIP customer visiting weekly since 2024, spending an average of KES 3,200 per order. She prefers dry cleaning for her professional wardrobe and is sensitive to scented detergents.",
    "keyPreferences": [
      "Prefers dry cleaning for suits and dresses",
      "Allergic to scented fabric softener -- use unscented only",
      "Likes Monday morning pickups, Friday evening deliveries",
      "Prefers WhatsApp updates, no calls after 9 PM",
      "Always requests light starch on shirts"
    ],
    "lastOrderInfo": {
      "orderId": "ORD-KIL-20260210-0023",
      "date": "2026-02-10T08:30:00.000Z",
      "totalAmount": 3500,
      "garmentCount": 5,
      "services": ["dry_clean", "iron"]
    },
    "suggestedServices": ["dry_clean", "iron", "starch"],
    "suggestedGarmentTypes": ["suit_jacket", "dress_shirt", "dress"],
    "segment": "vip",
    "visitFrequency": "Weekly regular",
    "generatedAt": "2026-02-12T10:30:00.000Z",
    "modelUsed": "gpt-4",
    "providerUsed": "openai"
  },
  "cached": true,
  "cacheAge": "2h 15m"
}
```

### 7.6 NEW: Trigger Preference Extraction

**`POST /api/customers/:customerId/extract-preferences`**

File: `app/api/customers/[customerId]/extract-preferences/route.ts` (NEW)

**Purpose:** Manually trigger preference extraction for a single customer.

**Authentication:** Requires authenticated staff session. Roles: `store_manager`, `general_manager`, `admin`.

**Request Body:**

```json
{
  "maxConversations": 30,
  "forceReextract": false
}
```

**Response:**

```json
{
  "success": true,
  "customerId": "CUST-ABC123",
  "conversationsProcessed": 12,
  "profileVersion": 4,
  "extractionDuration": "2.3s",
  "modelUsed": "gpt-4",
  "message": "Preference extraction completed successfully"
}
```

---

## 8. UI Specification

### 8.1 Existing POS Components (to be Enhanced)

| Component | File | Enhancement |
|-----------|------|-------------|
| `CustomerCard` | `components/features/pos/CustomerCard.tsx` | Add `CustomerBriefCard` below the existing card when a customer is selected. |
| `CustomerSearch` | `components/features/pos/CustomerSearch.tsx` | No changes to search. Brief loading triggered after `onSelectCustomer` fires. |
| `GarmentEntryForm` | `components/features/pos/GarmentEntryForm.tsx` | Add "Quick Add" suggestion chips above the garment type selector based on customer's previous orders. |
| POS Page | `app/(dashboard)/pos/page.tsx` | Orchestrate `CustomerBriefCard` display and `StaffNoteInput` rendering. |

### 8.2 NEW: CustomerBriefCard Component

**File:** `components/features/pos/CustomerBriefCard.tsx` (NEW)

**Purpose:** Displays the AI-generated customer brief immediately below `CustomerCard` when a customer is selected during order creation.

**Layout:**

```
+---------------------------------------------------------------+
| AI Customer Brief                                    [Refresh] |
|---------------------------------------------------------------|
| "Mary Kamau is a VIP customer visiting weekly since 2024..."  |
|                                                               |
| Key Preferences:                                              |
|   * Prefers dry cleaning for suits and dresses                |
|   * Allergic to scented softener -- unscented only            |
|   * Monday AM pickups, Friday PM deliveries                   |
|   * WhatsApp updates, quiet after 9 PM                        |
|   * Light starch on shirts                                    |
|                                                               |
| Suggested Services: [Dry Clean] [Iron] [Starch]              |
|                                                               |
| Last order: ORD-KIL-20260210-0023 (Feb 10, KES 3,500)       |
+---------------------------------------------------------------+
```

**Props:**

```typescript
interface CustomerBriefCardProps {
  customerId: string;
  onServiceSuggestionClick?: (service: string) => void;
  onGarmentTypeSuggestionClick?: (garmentType: string) => void;
}
```

**Behavior:**

- Fetches brief from `GET /api/customers/:id/brief` on mount.
- Shows loading skeleton while brief generates (max 3s).
- If brief generation times out, shows fallback: order count, total spent, last order date.
- "Refresh" button forces re-generation (bypasses cache).
- Service suggestion chips are clickable and pre-fill the `GarmentEntryForm`.
- Collapses to a single-line summary on mobile viewport.

### 8.3 NEW: StaffNoteInput Component

**File:** `components/features/pos/StaffNoteInput.tsx` (NEW)

**Purpose:** Inline text input for staff to record observations about the customer during or after order creation.

**Layout:**

```
+---------------------------------------------------------------+
| Add Note About Customer                                       |
|---------------------------------------------------------------|
| [Category: v] [............text input..............] [Save]   |
|                                                               |
| Categories: verbal_request | complaint | observation |        |
|             special_need | compliment | general               |
+---------------------------------------------------------------+
```

**Props:**

```typescript
interface StaffNoteInputProps {
  customerId: string;
  orderId?: string;
  branchId: string;
  onNoteSaved?: (conversationId: string) => void;
}
```

**Behavior:**

- Category defaults to `'general'`.
- Submits to `POST /api/customers/:customerId/notes`.
- Requires `staffId` and `staffName` from `useAuth()` hook.
- Clears input and shows success toast on save.
- Expandable/collapsible to avoid cluttering POS when not in use.
- Maximum note length: 1000 characters.

### 8.4 NEW: Director Customer Intelligence Page

**Route:** `/director/customers` (NEW)

**File:** `app/(dashboard)/director/customers/page.tsx` (NEW)

**Purpose:** Combined M3 + M4 data view. Sidebar "MODULES" section entry point.

**Layout (Desktop):**

```
+---------------------------------------------------------------+
| Customer Intelligence                    [Date Range] [Export] |
|---------------------------------------------------------------|
| KPI Cards Row:                                                |
| [Retention Rate] [Preference Coverage] [Avg LTV] [Churn Risk]|
|---------------------------------------------------------------|
| Left Column (60%):                     Right Column (40%):    |
|  - Retention trend line chart           - Segment donut chart |
|  - Top service preferences bar chart    - Churn risk list     |
|  - New vs returning trend               - Communication prefs |
|---------------------------------------------------------------|
| Customer Table:                                               |
| [Search] [Filter by segment] [Filter by preference]          |
| Name | Phone | Segment | Orders | LTV | Pref Coverage | ...  |
+---------------------------------------------------------------+
```

**KPI Cards:**

| KPI | Calculation | Source |
|-----|-------------|--------|
| Customer Retention Rate | (Customers with 2+ orders in last 90 days) / (Total active customers) | Order history |
| Preference Coverage % | (Customers with `CustomerPreferenceProfile`) / (Total customers) | `customerPreferenceProfiles` count |
| Average Customer LTV | Average of `totalSpent` across all customers | `customers` collection |
| Churn Risk Count | Customers with `daysSinceLastOrder > 60` and `orderCount >= 3` | `customerStatistics` |

### 8.5 NEW: Customer Portal Preference Editor

**Route:** `/portal/preferences` (NEW or enhanced within existing portal)

**Purpose:** Allow customers to directly view and edit their extracted preferences and communication settings.

**Sections:**

1. **Service Preferences** -- Read-only display of AI-extracted preferences + manual override toggles.
2. **Communication Preferences** -- Editable: preferred channel, frequency, language, quiet hours.
3. **Delivery Preferences** -- Editable: preferred pickup/delivery days and time windows.
4. **Privacy Controls** -- Opt-in/out for AI analysis, data export request, deletion request.
5. **Your Profile Summary** -- AI-generated summary showing what the system knows about them (transparency).

### 8.6 NEW: Customer Portal Conversation History

**Route:** `/portal/conversations` (NEW)

**Purpose:** Allow customers to view their WhatsApp message history and staff interaction notes.

**Behavior:**

- Shows conversations in chronological order (newest first).
- WhatsApp messages show direction (sent/received).
- Staff notes show the staff member name and note category.
- Customer can flag inaccurate notes for review.

---

## 9. Dashboard & Reporting Outputs

### 9.1 Director Dashboard Integration

The Director Dashboard (`/director`) receives the following data points from Module 4:

| Widget | Type | Data Source | Refresh |
|--------|------|-------------|---------|
| Customer Retention Rate | KPI Tile | `customerStatistics` aggregation | Real-time |
| Key Drivers: Top Service Prefs | Bar Chart | `customerPreferenceProfiles` aggregation | Daily |
| Risk Radar: Walk-in Decline | Trend Line | Order volume by customer type over time | Daily |
| Risk Radar: Churn Signals | Alert List | `customerStatistics` where `daysSinceLastOrder > 60` | Real-time |

### 9.2 Director Module Page (`/director/customers`)

| Chart | Type | Description |
|-------|------|-------------|
| Customer retention trends | Line chart | Retention rate over 12 months |
| Preference coverage % | Progress gauge | % of customers with preference profiles |
| Top service preferences | Horizontal bar chart | Top 10 preferred services across customer base |
| Customer segments by preference cluster | Donut chart | Distribution of preference-based clusters |
| Churn risk analysis | Table with risk scores | Customers at risk with last order date and LTV |
| Communication preference breakdown | Stacked bar | WhatsApp vs SMS vs Email by segment |
| New vs returning customer trends | Dual-line chart | Monthly new and returning customer counts |

### 9.3 GM Dashboard Integration

| Widget | Type | Data Source |
|--------|------|-------------|
| Repeat Customer Rate | KPI Percentage | (Orders from returning customers) / (Total orders) for the branch |

### 9.4 Staff POS Integration

| Widget | Component | Trigger |
|--------|-----------|---------|
| Customer Brief Card | `CustomerBriefCard` | Customer selected during order creation |
| Service Suggestions | Chips in `GarmentEntryForm` | Customer selected and brief loaded |
| Staff Note Input | `StaffNoteInput` | Always visible below customer card |

### 9.5 Reports

| Report | Audience | Contents |
|--------|----------|----------|
| Customer Preference Report | Director, GM | Aggregate preference data: top services, timing patterns, communication channel distribution, special needs summary |
| Retention Analysis Report | Director, GM | Retention rate trends, churn risk breakdown, customer lifecycle stages, re-engagement candidates |
| Segment Performance Report | Director | Revenue and order volume per segment (regular/VIP/corporate), preference-enriched segment insights |
| Conversation Volume Report | Director, GM | Daily/weekly conversation counts by channel, staff note frequency by branch, extraction pipeline metrics |

---

## 10. Notification & Messaging Flows

### 10.1 Direct Notifications from Module 4

Module 4 does **not** directly send notifications to customers. It is a **data capture and analysis** module. However, the preference data it produces **informs** notification behavior in other modules:

### 10.2 Preference-Informed Notifications (Cross-Module)

| Consumer Module | How Preferences Are Used | Relevant Preference Fields |
|-----------------|--------------------------|---------------------------|
| Module 1 (Orders) | Order status notifications respect `communicationPreferences.preferredChannel` and `quietHoursStart`/`quietHoursEnd`. If customer prefers SMS, order-ready message goes via SMS instead of WhatsApp. | `preferredChannel`, `quietHoursStart`, `quietHoursEnd`, `preferredLanguage` |
| Module 3 (Proximity) | Proximity pickup offers check `communicationPreferences.promotionalOptOut` before sending. Offer frequency respects `contactFrequency`. | `promotionalOptOut`, `contactFrequency` |
| Module 6 (Vouchers) | Voucher distribution uses preferred channel. Promotional vouchers skip customers with `promotionalOptOut: true`. | `preferredChannel`, `promotionalOptOut` |

### 10.3 Wati.io Webhook Integration (Receive Path)

This module **receives** messages from Wati.io but does not send them. The receive path is:

```
Customer sends WhatsApp message
  --> Wati.io receives and stores
    --> Wati.io triggers webhook to POST /api/webhooks/wati
      --> System stores as CustomerConversation
        --> Batch job extracts preferences (6h cycle)
```

The existing `services/wati.ts` file handles the **send** path (outbound). Module 4 adds the **receive** path (inbound). These are complementary and do not conflict.

---

## 11. Audit & Compliance

### 11.1 Audit Events

All Module 4 operations that modify data are logged via the existing `createAuditLog()` function from `lib/db/audit-logs.ts`.

| Event | `action` | `resourceType` | `resourceId` | Additional `changes` Data |
|-------|----------|-----------------|--------------|---------------------------|
| Staff note created | `create` | `customer_conversation` | `conversationId` | `{ after: { customerId, channel, noteCategory, content (truncated to 200 chars) } }` |
| WhatsApp conversation stored | `create` | `customer_conversation` | `conversationId` | `{ after: { customerId, channel: 'whatsapp', direction } }` |
| Preference profile created | `create` | `customer_preference_profile` | `profileId` | `{ after: { customerId, version: 1, modelUsed } }` |
| Preference profile updated (extraction) | `update` | `customer_preference_profile` | `profileId` | `{ before: { version: N, lastUpdated }, after: { version: N+1, lastUpdated, modelUsed, conversationsProcessed } }` |
| Preference profile manually edited | `update` | `customer_preference_profile` | `profileId` | `{ before: { [changed fields] }, after: { [changed fields] } }` |
| Customer brief generated | `create` | `customer_brief` | `customerId` | `{ after: { modelUsed, providerUsed, tokenUsage } }` |
| Customer data exported | `data_export` | `customer` | `customerId` | `{ after: { exportType: 'full', requestedBy } }` |
| Customer data deleted | `data_deletion` | `customer` | `customerId` | `{ before: { conversationCount, hasProfile }, after: { deleted: true } }` |
| Extraction job started | `create` | `preference_extraction_job` | `jobId` | `{ after: { trigger, customerCount } }` |
| Extraction job completed | `update` | `preference_extraction_job` | `jobId` | `{ before: { status: 'processing' }, after: { status: 'completed', successCount, failedCount } }` |

### 11.2 Immutable Conversation Records

`CustomerConversation` documents are **append-only**. Once created, they cannot be edited or deleted through the normal API. The only modification allowed is setting `extractionProcessed: true` and `extractionProcessedAt` after extraction processing.

Deletion is only permitted through the GDPR/DPA data deletion flow, which requires `admin` role and creates a `data_deletion` audit log entry.

### 11.3 Staff Note Attribution

Every staff note records:

- `staffId` -- UID from Firebase Auth (from `useAuth()`)
- `staffName` -- denormalized name
- `branchId` -- where the note was entered
- `timestamp` -- server-generated, not client-supplied

### 11.4 AI Extraction Audit Trail

Every LLM call for preference extraction or brief generation logs:

- Model identifier (e.g., `gpt-4`, `claude-3-opus`)
- Provider (`openai`, `anthropic`, `google`, `local`)
- Token usage (`promptTokens`, `completionTokens`)
- Confidence scores per preference category
- Number of source conversations
- Extraction duration in milliseconds

### 11.5 Customer Consent and Data Protection

**Kenya Data Protection Act & GDPR Compliance:**

- Customer **consent tracking:** A `dataConsentGiven` boolean field should be added to `CustomerPreferences` indicating whether the customer has agreed to AI-based preference analysis.
- Default: `true` for new customers (opt-out model, since preference extraction improves service).
- Customer can opt out via the portal preference editor, which sets `promotionalOptOut: true` and `dataConsentGiven: false`.
- When `dataConsentGiven: false`, the extraction pipeline skips this customer entirely.
- **Data Export:** Customers can request a full export of their data (conversations, preference profile, order history) via `GET /api/customers/:id/data-export`. Response: JSON file.
- **Data Deletion:** Customers can request deletion via the portal. Admin must approve. Process: delete all `customerConversations`, delete `customerPreferenceProfiles`, delete `customerBriefs`, log `data_deletion` audit entry. Customer core record (`customers` collection) is retained with `name: "DELETED"`, `phone: "DELETED"` per DPA retention requirements.

---

## 12. Customer Portal Impact

### 12.1 Enhanced Preferences Editor

**Current state:** The existing `CustomerPreferences` interface only has `notifications` (boolean) and `language` ('en' | 'sw'). There is no portal UI for editing these beyond what the customer creation form provides.

**Enhancement:**

| Section | Fields | Editable | Source |
|---------|--------|----------|--------|
| Service Preferences | Preferred services, starch level, fabric care notes, garment types | Read-only (AI-extracted) with "This doesn't seem right" feedback button | `CustomerPreferenceProfile.servicePreferences` |
| Communication Preferences | Preferred channel, frequency, language, quiet hours | Fully editable by customer | `CustomerPreferenceProfile.communicationPreferences` |
| Delivery Preferences | Pickup days/times, delivery days/times, turnaround preference | Fully editable by customer | `CustomerPreferenceProfile.timingPreferences` |
| Special Needs | Allergies, accessibility, permanent instructions | Editable by customer (additions only -- removals require staff verification) | `CustomerPreferenceProfile.specialNeeds` |

### 12.2 NEW: "Your Profile" AI Summary

A card on the portal home page showing the AI-generated summary of what the system knows about the customer. Built from the `CustomerBrief.summary` field.

**Purpose:** Transparency. Customers should know what data the system has inferred about them. This builds trust and allows correction.

### 12.3 NEW: Conversation History Viewer

Shows a chronological list of:

- WhatsApp messages exchanged (both directions)
- Staff notes about the customer (staff name visible, note category shown)

Customers can flag any conversation entry as "incorrect" or "private -- please remove," which creates a review task for the store manager.

### 12.4 NEW: Privacy Controls

| Control | Description | Default |
|---------|-------------|---------|
| AI Analysis Opt-In/Out | Toggle whether conversations are analyzed for preferences | Opted in |
| Data Export | "Download my data" button -- generates JSON export | N/A |
| Deletion Request | "Delete my data" button -- sends request to admin for approval | N/A |
| Promotional Opt-Out | Toggle whether promotional offers (M3, M6) are sent | Opted in |

---

## 13. Branch Scoping

### 13.1 Customer-Level Data (Not Branch-Scoped)

Customer preference profiles and briefs are **customer-level, not branch-specific**:

- `CustomerPreferenceProfile` -- one profile per customer across all branches.
- `CustomerBrief` -- one brief per customer, not scoped to branch.
- `CustomerConversation` (WhatsApp) -- not branch-scoped (WhatsApp conversations happen independent of branch).

### 13.2 Branch-Tagged Data

- `CustomerConversation` (staff notes) -- tagged with `branchId` where the note was entered. This allows branch-level analysis: "What do staff at Kilimani branch observe about this customer vs Westlands?"
- Order history used for preference analysis can be filtered by branch if needed, but the default is all-branch analysis.

### 13.3 Visibility Rules by Role

| Role | All Customers | Branch Customers Only | Notes |
|------|---------------|----------------------|-------|
| `admin` | All data | N/A | Full access |
| `director` | All data | N/A | Full access |
| `general_manager` | -- | Customers who have ordered at their branch(es) | Filtered by `branchId` or `branchAccess[]` from `User` |
| `store_manager` | -- | Customers who have ordered at their branch | Filtered by `branchId` |
| `front_desk` | -- | Brief only (not conversations or full profile) | Only `CustomerBrief` at POS |
| `workstation_staff` | -- | No access to preference data | Can add staff notes only |
| `customer` | Own data only | N/A | Portal access to own profile, conversations, preferences |

### 13.4 Cross-Branch Customer Handling

A customer who visits multiple branches has:

- **One preference profile** (global).
- **Staff notes from each branch** (tagged with `branchId`).
- **One brief** (generated from all-branch data).

GM at Branch A sees the full brief (including data from Branch B orders) but can filter staff notes to see only those entered at their branch.

---

## 14. Business Logic

### 14.1 Preference Extraction Algorithm

```
function extractPreferences(customerId: string):
  1. Fetch customer record from `customers` collection
  2. Fetch last N unprocessed conversations from `customerConversations`
     WHERE customerId == customerId AND extractionProcessed == false
     ORDER BY timestamp DESC, LIMIT 20
  3. If no conversations found, return early (no-op)
  4. Fetch existing CustomerPreferenceProfile (if exists)
  5. Build LLM prompt:
     - System prompt: "You are a customer preference extraction engine for Lorenzo Dry Cleaners..."
     - User prompt: formatted conversations with timestamps, channels, and content
     - Response format: JSON matching CustomerPreferenceProfile shape with confidence scores
  6. Call LLMClient.chatCompletion(
       agentType: 'customer',
       agentFunction: 'preference_extraction',
       messages: [systemPrompt, userPrompt],
       options: { temperature: 0.2, maxTokens: 2000 }
     )
  7. Parse LLM JSON response
  8. If existing profile exists, MERGE:
     - For each preference field, compare new confidence vs existing confidence
     - If newConfidence > existingConfidence: overwrite with new value
     - If newConfidence <= existingConfidence: keep existing value
     - NEVER remove existing data (only add or overwrite)
     - Append new conversationIds to sourceConversationIds array
     - Increment version
  9. If no existing profile: create new CustomerPreferenceProfile document
  10. Mark processed conversations: set extractionProcessed = true, extractionProcessedAt = now
  11. Update customer record: lastConversationAt, conversationCount
  12. Log audit event via createAuditLog()
  13. Return extraction result
```

### 14.2 Customer Brief Generation Algorithm

```
function generateBrief(customerId: string):
  1. Check customerBriefs collection for existing brief
  2. If brief exists AND generatedAt < 24 hours ago: return cached brief
  3. Fetch customer record
  4. Fetch CustomerPreferenceProfile (if exists)
  5. Fetch last 5 orders via getOrdersByCustomer(customerId, 5)
  6. Calculate:
     - Average order value = totalSpent / orderCount
     - Visit frequency = "Weekly" | "Bi-weekly" | "Monthly" | "Occasional" | "First-time"
       Based on: avgDaysBetweenOrders from CustomerAgent.getCustomerInsights()
     - Top garment types (from order garments)
     - Top services (from order garments)
  7. Build LLM prompt:
     - System prompt: "Generate a concise customer brief for a dry cleaning POS..."
     - User prompt: customer data, preference profile, order history, statistics
     - Requested output: { summary: string, keyPreferences: string[], suggestedServices: string[] }
  8. Call LLMClient.chatCompletion(
       agentType: 'customer',
       agentFunction: 'brief_generation',
       messages: [systemPrompt, userPrompt],
       options: { temperature: 0.3, maxTokens: 500 }
     )
  9. Parse response
  10. Write CustomerBrief document with TTL (expiresAt = now + 24h)
  11. Return brief
```

**Fallback if LLM fails:**

If the LLM call times out (> 3 seconds) or errors:

```
fallback brief = {
  summary: `${customer.name} has placed ${customer.orderCount} orders totaling KES ${customer.totalSpent.toLocaleString()}.`,
  keyPreferences: ["Order history available but AI summary temporarily unavailable"],
  suggestedServices: topServicesFromHistory,
  suggestedGarmentTypes: topGarmentTypesFromHistory,
  generatedAt: now,
  modelUsed: "fallback",
  providerUsed: "none"
}
```

### 14.3 LLM Fallback Chain

As defined in `GlobalLLMConfig` (in `lib/db/schema.ts`, lines 1717-1742) and implemented in `LLMClient.tryFallbackProviders()` (in `lib/llm/llm-client.ts`, lines 121-154):

```
Primary: OpenAI (gpt-4) --> Fallback 1: Anthropic (claude-3) --> Fallback 2: Google (gemini) --> Fallback 3: Local (ollama)
```

If all providers fail:
- **For extraction:** Queue customer for retry on next batch cycle.
- **For brief generation:** Return fallback brief from order history data only.

### 14.4 Extraction Scheduling

| Parameter | Value |
|-----------|-------|
| Batch frequency | Every 6 hours |
| Max customers per batch | 100 |
| Max conversations per customer per extraction | 20 |
| Extraction timeout per customer | 15 seconds |
| Total batch timeout | 30 minutes |
| Retry on failure | Next scheduled batch |

Implementation: Use Next.js API route triggered by external scheduler (e.g., Vercel Cron Jobs, Firebase Cloud Functions scheduled trigger, or external cron service).

**Cron endpoint:** `POST /api/cron/extract-preferences` (protected by `CRON_SECRET` environment variable).

---

## 15. Integration Points

### 15.1 Module 1 (Order Management)

| Direction | Data Flow | Description |
|-----------|-----------|-------------|
| M4 --> M1 | `CustomerBrief.suggestedServices` | POS uses brief to suggest services during order creation |
| M1 --> M4 | Order history (garments, services, `specialInstructions`) | Preference extraction analyzes past order data |
| M4 --> M1 | `communicationPreferences` | Order notifications (from `services/wati.ts`) respect channel and quiet hour preferences |
| M1 --> M4 | Staff notes at order creation | `GarmentEntryForm.specialInstructions` content can be captured as staff notes |

### 15.2 Module 3 (Proximity Intelligence)

| Direction | Data Flow | Description |
|-----------|-----------|-------------|
| M4 --> M3 | `communicationPreferences.promotionalOptOut` | Proximity offers skip opted-out customers |
| M4 --> M3 | `communicationPreferences.contactFrequency` | Offer frequency respects customer's preferred contact cadence |
| M4 --> M3 | `timingPreferences` | Proximity offers sent during preferred time windows |

### 15.3 Module 5 (AI Insights)

| Direction | Data Flow | Description |
|-----------|-----------|-------------|
| M4 --> M5 | `CustomerPreferenceProfile` | Preference data feeds customer value scoring and churn prediction models |
| M4 --> M5 | `CustomerConversation` | Conversation volume and sentiment used for engagement scoring |
| M5 --> M4 | Churn risk scores | Brief generation incorporates churn risk signals from M5 |

### 15.4 Module 6 (Voucher System)

| Direction | Data Flow | Description |
|-----------|-----------|-------------|
| M4 --> M6 | `communicationPreferences.preferredChannel` | Voucher delivery uses customer's preferred channel |
| M4 --> M6 | `servicePreferences.preferredServices` | Voucher targeting: send "20% off dry cleaning" to customers who prefer dry cleaning |
| M4 --> M6 | `communicationPreferences.promotionalOptOut` | Skip opted-out customers for promotional vouchers |

### 15.5 External: Wati.io

| Direction | Integration | Details |
|-----------|-------------|---------|
| Wati.io --> M4 | Webhook (inbound messages) | `POST /api/webhooks/wati` receives message payloads |
| M4 reads | Wati.io API (message history) | Optional backfill: `GET /api/v1/getMessages` to pull historical conversation data |
| Existing | M4 does not modify | `services/wati.ts` outbound sending remains unchanged; M4 only reads |

### 15.6 External: LLM Providers

| Direction | Integration | Details |
|-----------|-------------|---------|
| M4 --> LLM | Preference extraction | `LLMClient.chatCompletion(agentType: 'customer', agentFunction: 'preference_extraction')` |
| M4 --> LLM | Brief generation | `LLMClient.chatCompletion(agentType: 'customer', agentFunction: 'brief_generation')` |
| LLM --> M4 | Structured JSON response | Parsed and merged into `CustomerPreferenceProfile` |

---

## 16. Security & Permissions

### 16.1 RBAC Matrix

| Action | `front_desk` | `workstation_staff` | `store_manager` | `general_manager` | `director` | `admin` | `customer` |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View customer brief at POS | Brief only | -- | Full | Full | Full | Full | -- |
| Add staff notes | Yes | Yes | Yes | Yes | -- | Yes | -- |
| View own staff notes | Yes | Yes | Yes | Yes | Yes | Yes | -- |
| View all staff notes (branch) | -- | -- | Yes | Yes | Yes | Yes | -- |
| View WhatsApp conversations | -- | -- | Yes | Yes | Yes | Yes | -- |
| View preference profile | -- | -- | Yes | Yes | Yes | Yes | -- |
| Edit preferences (manual override) | -- | -- | Yes | Yes | -- | Yes | -- |
| Trigger preference extraction | -- | -- | Yes | Yes | -- | Yes | -- |
| View analytics / Director page | -- | -- | -- | Branch only | All | All | -- |
| Export customer data | -- | -- | -- | -- | Yes | Yes | -- |
| Delete customer data (GDPR/DPA) | -- | -- | -- | -- | -- | Yes | -- |
| View own conversations (portal) | -- | -- | -- | -- | -- | -- | Yes |
| Edit own communication prefs | -- | -- | -- | -- | -- | -- | Yes |
| Request data export | -- | -- | -- | -- | -- | -- | Yes |
| Request data deletion | -- | -- | -- | -- | -- | -- | Yes |

### 16.2 Webhook Security

The Wati.io webhook endpoint (`POST /api/webhooks/wati`) is secured by:

1. **HMAC signature validation:** Wati.io signs webhook payloads. The handler validates the `X-Wati-Signature` header against the `WATI_WEBHOOK_SECRET` environment variable.
2. **IP allowlisting (optional):** Wati.io sends webhooks from known IP ranges. These can be allowlisted at the infrastructure level.
3. **Rate limiting:** Max 100 webhook calls per minute to prevent abuse.
4. **No authentication context:** Webhook payloads do not carry user sessions. The handler operates with system-level privileges for writing `CustomerConversation` documents only.

### 16.3 API Authentication

All new API endpoints (except the Wati.io webhook) require Firebase Authentication session cookies or Bearer tokens, validated using the existing auth middleware pattern used throughout `app/api/`.

### 16.4 Data Isolation

- Customer portal endpoints return **only** the authenticated customer's own data. The `customerId` is derived from the session token, not from URL parameters.
- Staff endpoints use `branchId` and `branchAccess[]` from the `User` record to filter visible customers.
- Conversation content is treated as **sensitive personal data** and encrypted at rest (Firestore default AES-256).

---

## 17. Error Handling & Edge Cases

### 17.1 LLM Extraction Failure

| Scenario | Handling |
|----------|---------|
| LLM returns invalid JSON | Log error, retry with stricter prompt (add JSON schema example), queue for next batch if retry fails |
| LLM timeout (> 15s per customer) | Skip customer, mark as unprocessed, retry on next batch |
| All LLM providers unavailable | Log critical error, preserve raw conversations (they are already stored), queue entire batch for retry |
| LLM returns low-confidence results (all fields < 0.3) | Store but flag for manual review; do not overwrite existing higher-confidence data |
| Rate limit hit | Use `RateLimitError.retryAfterMs` from `lib/llm/types.ts` to schedule retry |

### 17.2 Customer with No Conversations

| Scenario | Handling |
|----------|---------|
| Customer selected at POS, no conversations exist | Skip extraction, show "No preferences yet" in `CustomerBriefCard`. Show order-history-only fallback brief |
| Customer with conversations but extraction never ran | Show "Preferences being analyzed" message. Trigger on-demand extraction if staff clicks refresh |
| New customer (0 orders, 0 conversations) | Show "New customer -- no history available" in brief card. Staff note input is still available |

### 17.3 Conflicting Preferences

| Scenario | Resolution |
|----------|------------|
| WhatsApp says "I prefer morning pickups" but staff note says "Customer requested afternoon pickup" | Higher confidence wins. If confidence is equal, most recent conversation takes precedence |
| Customer changes preference (e.g., used to prefer dry clean, now prefers wash only) | New extraction overwrites if confidence >= existing. The merge strategy ensures recent data with sufficient confidence supersedes old data |
| Customer tells staff one thing but writes something different on WhatsApp | Both are captured as separate conversations. LLM resolves during extraction. If contradictory, LLM assigns lower confidence to the ambiguous field and flags it |

### 17.4 Wati.io Webhook Edge Cases

| Scenario | Handling |
|----------|---------|
| Duplicate webhook delivery (Wati retry) | Check `externalMessageId` before creating document. Return 409 if already exists |
| Message from unknown phone number | Store with `customerId: null` and `customerPhone` populated. A background job periodically attempts to match unlinked conversations to customers |
| Media message (image, document) | Store metadata only (`type: 'image'`, URL reference). Do not process media content for preference extraction |
| Group message | Ignore. Only process direct customer-to-business messages |
| Webhook signature validation fails | Return 401. Log the attempt. Do not store any data |

### 17.5 Customer Data Deletion

| Scenario | Process |
|----------|---------|
| Customer requests data deletion | 1. Admin receives request notification. 2. Admin reviews and approves. 3. System deletes: all `customerConversations` for customer, `customerPreferenceProfiles` document, `customerBriefs` document. 4. Customer core record anonymized (`name: "DELETED"`, `phone: "DELETED"`). 5. Audit log records `data_deletion` action. 6. Process irreversible once confirmed |

### 17.6 Staff Note Moderation

| Scenario | Handling |
|----------|---------|
| Staff enters inappropriate or irrelevant note | Notes are immutable once created. Store manager can flag a note as "hidden" (soft-delete) but the audit trail preserves the original content. The flagged note is excluded from future preference extraction |
| Staff accidentally enters note on wrong customer | Staff cannot delete or move notes. Store manager can add a follow-up note: "Previous note CONV-xxx was entered in error, please disregard." The hidden flag prevents extraction |

---

## 18. Data Migration

### 18.1 Existing Data Preservation

- The existing `CustomerPreferences` interface (`{ notifications: boolean, language: 'en' | 'sw' }`) on the `Customer` document is **preserved as-is**.
- The new `preferenceProfileId`, `lastConversationAt`, and `conversationCount` fields are added as **optional** fields on `Customer` -- no migration needed for existing documents.
- Existing customer segmentation logic in `app/api/customers/segmentation/route.ts` continues to work unchanged.
- Existing `CustomerAgent` in `lib/agents/customer-agent.ts` continues to work unchanged; its `getCustomerInsights()` method already calculates top garment types and services, which Module 4 can leverage.

### 18.2 New Collections (No Migration Needed)

| Collection | Status | Notes |
|------------|--------|-------|
| `customerConversations` | Created fresh | No existing data to migrate |
| `customerPreferenceProfiles` | Created fresh | One profile per customer, created on first extraction |
| `customerBriefs` | Created fresh | Cache collection, auto-expires via TTL |
| `preferenceExtractionJobs` | Created fresh | Operational tracking, no migration |

### 18.3 Backfill Opportunity

**Source:** The `Garment.specialInstructions` field (from `lib/db/schema.ts`, line 348) on existing orders contains customer-specific instructions that have been entered by staff during order creation.

**Backfill process:**

1. **Scheduled job** (one-time): Query all orders, extract non-empty `specialInstructions` from garments.
2. For each order with instructions, create a `CustomerConversation` document:
   - `channel: 'staff_note'`
   - `content: specialInstructions`
   - `staffId: order.createdBy`
   - `timestamp: order.createdAt`
   - `noteCategory: 'observation'`
   - `orderId: order.orderId`
   - `extractionProcessed: false`
3. Run preference extraction batch for all backfilled customers.
4. This populates initial preference profiles from historical data.

**Estimated scope:** Depends on order volume. If 10,000 orders with 30% having special instructions, this creates ~3,000 conversation documents for ~1,500 unique customers.

### 18.4 Schema Changes Summary

| File | Change | Type |
|------|--------|------|
| `lib/db/schema.ts` | Add `CustomerConversation` interface | NEW interface |
| `lib/db/schema.ts` | Add `CustomerPreferenceProfile` interface | NEW interface |
| `lib/db/schema.ts` | Add `CustomerBrief` interface | NEW interface |
| `lib/db/schema.ts` | Add `PreferenceExtractionJob` interface | NEW interface |
| `lib/db/schema.ts` | Add `'preference_extraction'` and `'brief_generation'` to `AgentFunction` type | EXTEND type |
| `lib/db/schema.ts` | Add `'preference_extraction'`, `'data_export'`, `'data_deletion'` to `AuditLogAction` type | EXTEND type |
| `lib/db/schema.ts` | Add optional fields to `Customer` interface: `preferenceProfileId`, `lastConversationAt`, `conversationCount` | EXTEND interface |

---

## 19. Testing Strategy

### 19.1 Unit Tests

| Test Area | File | Description |
|-----------|------|-------------|
| Preference extraction prompt engineering | `__tests__/lib/preference-extraction.test.ts` | Verify LLM prompt generates valid JSON matching `CustomerPreferenceProfile` shape. Mock LLM responses with various conversation patterns. |
| Confidence score merge logic | `__tests__/lib/preference-merge.test.ts` | Test that higher confidence overwrites, lower confidence preserves existing, no data loss on merge. |
| Brief generation fallback | `__tests__/lib/brief-generation.test.ts` | Test fallback brief when LLM fails. Verify order-history-only brief is valid. |
| Wati.io webhook parsing | `__tests__/api/webhooks/wati.test.ts` | Test payload parsing, phone normalization, customer matching, idempotent processing. |
| Staff note creation | `__tests__/api/customers/notes.test.ts` | Test note creation, validation, category tagging, audit logging. |
| RBAC enforcement | `__tests__/api/customers/preferences-rbac.test.ts` | Test that each role can only access data they are authorized for per the RBAC matrix. |

### 19.2 Integration Tests

| Test Area | Description |
|-----------|-------------|
| Wati.io webhook -> Conversation storage -> Firestore | Mock Wati.io webhook, verify document created in `customerConversations` with correct fields |
| LLM extraction pipeline | Mock LLM provider, send test conversations, verify `CustomerPreferenceProfile` created/updated correctly |
| Staff note -> Extraction -> Brief | End-to-end flow: create staff note, trigger extraction, verify brief includes extracted data |
| Customer portal -> View preferences | Verify customer can see their own preference profile and conversation history |

### 19.3 End-to-End Tests (Playwright)

| Test Flow | Steps |
|-----------|-------|
| Staff note entry at POS | 1. Login as front_desk. 2. Navigate to POS. 3. Select customer. 4. Enter staff note. 5. Verify note appears in conversation history. 6. Trigger extraction. 7. Verify brief updates with note content. |
| Customer brief display | 1. Login as front_desk. 2. Navigate to POS. 3. Select customer with existing profile. 4. Verify `CustomerBriefCard` renders with summary, key preferences, and suggested services. |
| Director analytics page | 1. Login as director. 2. Navigate to `/director/customers`. 3. Verify KPI cards render. 4. Verify charts render with data. 5. Test search and filter functionality. |
| Customer portal preferences | 1. Login as customer. 2. Navigate to portal preferences. 3. Verify communication preferences are editable. 4. Change preferred channel. 5. Verify change persists on reload. |

### 19.4 Performance Tests

| Test | Target | Method |
|------|--------|--------|
| Batch extraction for 100 customers | Complete within 30 minutes | Load test with mock LLM (50ms response time) |
| Brief generation response time | Under 3 seconds (including LLM call) | Benchmark with real LLM provider |
| Webhook throughput | Handle 100 webhooks/second | Load test with concurrent requests |
| Customer search with preference data | Under 500ms response time | Benchmark with 10,000 customer records |
| Director analytics page load | Under 2 seconds | Lighthouse performance audit |

---

## 20. Implementation Sequence

### Phase 1: Conversation Capture Infrastructure (Week 1-2)

1. **Add schema types** to `lib/db/schema.ts`: `CustomerConversation`, add optional fields to `Customer`, extend `AgentFunction` and `AuditLogAction`.
2. **Create `customerConversations` Firestore collection** with indexes.
3. **Build staff note API:** `POST /api/customers/:customerId/notes` and `GET /api/customers/:customerId/conversations`.
4. **Build `StaffNoteInput` component** (`components/features/pos/StaffNoteInput.tsx`).
5. **Integrate `StaffNoteInput` into POS page** below `CustomerCard`.

### Phase 2: Wati.io Webhook Receiver (Week 2-3)

6. **Build Wati.io webhook endpoint:** `POST /api/webhooks/wati` with signature validation, payload parsing, customer matching, and `CustomerConversation` creation.
7. **Configure Wati.io webhook** in Wati.io dashboard to point to the endpoint.
8. **Test with live WhatsApp messages** (sandbox/test phone number).

### Phase 3: AI Preference Extraction Pipeline (Week 3-4)

9. **Add schema types:** `CustomerPreferenceProfile`, `PreferenceExtractionJob`.
10. **Create `customerPreferenceProfiles` Firestore collection** with indexes.
11. **Build extraction logic:** LLM prompt engineering, JSON parsing, confidence scoring, merge algorithm.
12. **Build extraction API:** `POST /api/customers/:customerId/extract-preferences`.
13. **Build batch extraction cron:** `POST /api/cron/extract-preferences`.
14. **Build preference API:** `GET /api/customers/:customerId/preferences`.

### Phase 4: Customer Brief Generation for POS (Week 4-5)

15. **Add schema type:** `CustomerBrief`.
16. **Create `customerBriefs` Firestore collection.**
17. **Build brief generation logic:** LLM prompt, fallback, caching.
18. **Build brief API:** `GET /api/customers/:customerId/brief`.
19. **Build `CustomerBriefCard` component** (`components/features/pos/CustomerBriefCard.tsx`).
20. **Integrate `CustomerBriefCard` into POS page** below `CustomerCard`.
21. **Add service suggestion chips** to `GarmentEntryForm`.

### Phase 5: Director Analytics Page (Week 5-6)

22. **Build Director Customer Intelligence page** at `/director/customers`.
23. **Build KPI aggregation queries** for retention, preference coverage, LTV, churn.
24. **Build chart components** (retention trends, service preferences, segments).
25. **Add sidebar navigation entry** for Director.

### Phase 6: Customer Portal Enhancements (Week 6-7)

26. **Build preference editor** in customer portal.
27. **Build conversation history viewer** in customer portal.
28. **Build "Your Profile" AI summary card** in portal.
29. **Build privacy controls** (opt-in/out, data export, deletion request).

### Phase 7: Backfill and Polish (Week 7-8)

30. **Build backfill job** to extract preferences from existing order `specialInstructions`.
31. **Run backfill** for existing customers.
32. **Performance optimization:** Cache tuning, query optimization, LLM prompt refinement.
33. **End-to-end testing** of all flows.

---

## 21. Open Questions & Risks

### Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **LLM costs at scale:** Each extraction uses ~2K tokens, each brief ~800 tokens. At 1,000 active customers with 6-hourly extraction, monthly cost could reach $50-200 depending on provider. | Medium | High | Batch processing to minimize calls. Cache briefs for 24h. Use cheaper models (GPT-3.5) for extraction, GPT-4 for briefs. Monitor via `tokenUsage` tracking. |
| **Customer privacy concerns:** Some customers may object to AI analysis of their WhatsApp conversations. | High | Medium | Implement clear opt-out. Show customers what data is collected (portal transparency). Comply with Kenya Data Protection Act. Default consent model with easy opt-out. |
| **Preference data accuracy:** LLM extraction is probabilistic, not deterministic. Confidence scores may not reflect actual accuracy. | Medium | High | Confidence thresholds (only surface data above 0.5 confidence). Human-in-the-loop: staff can manually override extracted preferences. Customer can flag incorrect preferences. |
| **Wati.io webhook reliability:** Wati.io webhook delivery may fail or arrive out of order. | Low | Medium | Idempotent processing via `externalMessageId`. Wati.io has built-in retry. Consider periodic pull-based sync as backup. |
| **Staff note quality:** Staff may enter incomplete, incorrect, or inappropriate notes. | Medium | Medium | Note categorization helps filter. Moderation flags for store managers. Training materials for staff on note-taking best practices. |
| **LLM provider downtime:** If all LLM providers are down, extraction and brief generation halt. | Medium | Low | Fallback briefs from order history (no LLM needed). Extraction queued for retry. System degrades gracefully -- POS still works without briefs. |

### Open Questions

| # | Question | Proposed Answer | Decision Status |
|---|----------|-----------------|-----------------|
| 1 | Should customers be explicitly told their WhatsApp conversations are analyzed by AI? | **Yes.** Transparency builds trust. Add a one-time WhatsApp notification explaining the feature and how to opt out. | Recommended |
| 2 | How to handle multi-language conversations (English + Swahili mix)? | LLM models (GPT-4, Claude) handle multilingual input well. The extraction prompt should explicitly state "Conversations may be in English, Swahili, or a mix. Extract preferences regardless of language." | Recommended |
| 3 | Should preference profiles be versioned (keep history) or overwrite? | **Version with increment counter.** Current version is the active one. Previous versions are not stored separately (saves storage) but the `version` counter and `sourceConversationIds` array provide an audit trail. If full version history is needed later, add a `preferenceProfileHistory` subcollection. | Recommended -- start simple |
| 4 | What is the minimum number of conversations before extraction is worthwhile? | **3 conversations minimum.** Below this threshold, confidence scores will be too low to be useful. Skip extraction for customers with fewer than 3 conversations. | Proposed |
| 5 | Should brief generation be synchronous (POS waits) or asynchronous (background generation)? | **Synchronous with timeout.** POS calls GET /api/customers/:id/brief. If cached brief exists, return immediately. If not, generate synchronously with 3-second timeout. If LLM exceeds timeout, return fallback brief immediately. This ensures POS never waits more than 3 seconds. | Recommended |
| 6 | Should the system capture WhatsApp media (images, documents)? | **Not in v1.** Store metadata reference only. Image analysis for preference extraction (e.g., photos of preferred garments) is a future enhancement. | Deferred |
| 7 | How long should conversation data be retained? | **24 months.** Conversations older than 24 months are archived (moved to cold storage) and excluded from extraction. This balances data utility with privacy. | Proposed |
| 8 | Should extraction use the full conversation thread or just the latest messages? | **Rolling window of 20 most recent unprocessed conversations.** This captures recent preferences while keeping LLM context window manageable. The cumulative profile in `CustomerPreferenceProfile` retains knowledge from older conversations via the merge strategy. | Recommended |

---

## Appendix A: LLM Prompt Templates

### A.1 Preference Extraction Prompt

**System Prompt:**

```
You are a customer preference extraction engine for Lorenzo Dry Cleaners, a premium dry cleaning service in Nairobi, Kenya. Your job is to analyze customer conversations (WhatsApp messages and staff observation notes) and extract structured preference data.

Output ONLY valid JSON matching the schema below. Do not include markdown formatting, code fences, or explanatory text. Each preference category must include a confidence score between 0.0 (no evidence) and 1.0 (strong evidence from multiple sources).

If a preference cannot be determined from the conversations, set the field to null and the confidence to 0.0. Never invent preferences that are not supported by the conversation evidence.

Conversations may be in English, Swahili, or a mix of both languages. Extract preferences regardless of language.
```

**User Prompt Template:**

```
Customer: {customerName} ({customerId})
Segment: {segment}
Order Count: {orderCount}
Total Spent: KES {totalSpent}

=== Conversations (most recent first) ===

[{timestamp}] [{channel}] [{direction}]: {content}
[{timestamp}] [{channel}] [{direction}]: {content}
...

=== End Conversations ===

Extract the following preference categories:

{
  "servicePreferences": {
    "preferredServices": string[] | null,
    "starchPreference": "none" | "light" | "medium" | "heavy" | null,
    "fabricCareNotes": string[] | null,
    "preferredGarmentTypes": string[] | null,
    "confidence": number
  },
  "timingPreferences": {
    "preferredPickupDays": string[] | null,
    "preferredPickupWindow": "morning" | "afternoon" | "evening" | null,
    "preferredDeliveryDays": string[] | null,
    "preferredDeliveryWindow": "morning" | "afternoon" | "evening" | null,
    "turnaroundPreference": "standard" | "fast" | null,
    "confidence": number
  },
  "communicationPreferences": {
    "preferredChannel": "whatsapp" | "sms" | "email" | null,
    "contactFrequency": "per_order" | "daily_digest" | "weekly" | null,
    "preferredLanguage": "en" | "sw" | null,
    "quietHoursStart": string | null,
    "quietHoursEnd": string | null,
    "promotionalOptOut": boolean | null,
    "confidence": number
  },
  "specialNeeds": {
    "allergiesOrSensitivities": string[] | null,
    "accessibilityNeeds": string[] | null,
    "permanentInstructions": string[] | null,
    "confidence": number
  }
}
```

### A.2 Brief Generation Prompt

**System Prompt:**

```
You are generating a concise customer brief for staff at Lorenzo Dry Cleaners POS (Point of Sale). The brief should help front desk staff provide personalized service.

Generate:
1. A "summary" - 2-3 sentences describing the customer, their value, and key characteristics.
2. "keyPreferences" - 3 to 5 bullet points of the most actionable preferences for this order.
3. "suggestedServices" - Array of service IDs likely needed based on history.

Be concise, professional, and actionable. Use the customer's name. Mention their segment status if VIP or corporate. Highlight any special needs or sensitivities prominently.

Output ONLY valid JSON. No markdown, no code fences, no explanatory text.
```

**User Prompt Template:**

```
Customer: {customerName}
Phone: {phone}
Segment: {segment}
Member since: {memberSince}
Total orders: {orderCount}
Total spent: KES {totalSpent}
Average order: KES {avgOrderValue}
Visit frequency: {visitFrequency}
Days since last order: {daysSinceLastOrder}

Preference Profile:
{JSON.stringify(preferenceProfile, null, 2)}

Last 5 Orders:
{orders.map(o => `- ${o.orderId} (${o.date}): ${o.garmentCount} items, KES ${o.totalAmount}, services: ${o.services.join(', ')}`).join('\n')}

Generate the customer brief JSON:
{
  "summary": string,
  "keyPreferences": string[],
  "suggestedServices": string[]
}
```

---

## Appendix B: Environment Variables

The following environment variables are required for Module 4:

| Variable | Description | Required |
|----------|-------------|----------|
| `WATI_WEBHOOK_SECRET` | Secret key for validating Wati.io webhook signatures | Yes (for webhook endpoint) |
| `CRON_SECRET` | Secret key for authenticating cron job API calls | Yes (for batch extraction) |
| `WATI_ACCESS_TOKEN` | Existing -- used by `services/wati.ts` for outbound. Also used for optional message history pull. | Already configured |
| `WATI_API_ENDPOINT` | Existing -- Wati.io API base URL. | Already configured |

No additional LLM-related environment variables are needed as the multi-provider LLM configuration is managed through Firestore (`system_config` collection) and the existing `lib/llm/` and `lib/config/` modules.

---

## Appendix C: Firestore Security Rules Additions

```javascript
// Add to existing firestore.rules

// Customer Conversations - append-only for webhook, read for staff
match /customerConversations/{conversationId} {
  allow read: if isAuthenticated() && (
    isStaff() ||
    resource.data.customerId == request.auth.uid
  );
  allow create: if isAuthenticated() && isStaff();
  // Webhook creates use admin SDK (bypasses rules)
  allow update: if isAuthenticated() && isStaff() &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['extractionProcessed', 'extractionProcessedAt']);
  allow delete: if isAuthenticated() && isAdmin();
}

// Customer Preference Profiles
match /customerPreferenceProfiles/{profileId} {
  allow read: if isAuthenticated() && (
    isStaff() ||
    resource.data.customerId == request.auth.uid
  );
  allow create, update: if isAuthenticated() && isStaff();
  allow delete: if isAuthenticated() && isAdmin();
}

// Customer Briefs (cache)
match /customerBriefs/{customerId} {
  allow read: if isAuthenticated() && isStaff();
  allow create, update: if isAuthenticated() && isStaff();
  allow delete: if isAuthenticated() && isStaff();
}

// Preference Extraction Jobs (operational)
match /preferenceExtractionJobs/{jobId} {
  allow read: if isAuthenticated() && isManagement();
  allow create, update: if false; // Server-side only (admin SDK)
}
```

---

## Appendix D: New File Manifest

| File Path | Type | Description |
|-----------|------|-------------|
| `app/api/webhooks/wati/route.ts` | API Route | Wati.io webhook receiver |
| `app/api/customers/[customerId]/notes/route.ts` | API Route | Staff note creation |
| `app/api/customers/[customerId]/conversations/route.ts` | API Route | Conversation history listing |
| `app/api/customers/[customerId]/preferences/route.ts` | API Route | Preference profile retrieval |
| `app/api/customers/[customerId]/brief/route.ts` | API Route | Customer brief generation/retrieval |
| `app/api/customers/[customerId]/extract-preferences/route.ts` | API Route | Manual extraction trigger |
| `app/api/customers/[customerId]/data-export/route.ts` | API Route | GDPR data export |
| `app/api/cron/extract-preferences/route.ts` | API Route | Batch extraction cron endpoint |
| `components/features/pos/CustomerBriefCard.tsx` | Component | AI brief display at POS |
| `components/features/pos/StaffNoteInput.tsx` | Component | Staff note entry at POS |
| `lib/db/conversations.ts` | DB Module | CustomerConversation CRUD operations |
| `lib/db/preference-profiles.ts` | DB Module | CustomerPreferenceProfile CRUD operations |
| `lib/db/customer-briefs.ts` | DB Module | CustomerBrief cache operations |
| `lib/services/preference-extraction.ts` | Service | LLM-based preference extraction logic |
| `lib/services/brief-generation.ts` | Service | LLM-based brief generation logic |
| `app/(dashboard)/director/customers/page.tsx` | Page | Director Customer Intelligence page |
| `hooks/useCustomerBrief.ts` | Hook | React hook for fetching customer brief |
| `hooks/useCustomerPreferences.ts` | Hook | React hook for fetching preference profile |

---

*End of Module 4 -- Customer Preference Memory Feature Spec*
