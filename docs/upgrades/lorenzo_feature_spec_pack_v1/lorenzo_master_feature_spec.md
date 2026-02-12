# Lorenzo Dry Cleaners -- Master Feature Specification

**Version:** 1.0
**Status:** Draft
**Date:** February 2026
**Author:** AI Agents Plus Engineering
**System:** Lorenzo Dry Cleaners Management System v2.0

---

## Table of Contents

1. [Document Overview](#1-document-overview)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Shared Schema Registry](#3-shared-schema-registry)
4. [API Design Standards](#4-api-design-standards)
5. [State Machine Standards](#5-state-machine-standards)
6. [Approval Workflow Pattern](#6-approval-workflow-pattern)
7. [AI Agent Architecture](#7-ai-agent-architecture)
8. [Dashboard Architecture](#8-dashboard-architecture)
9. [Real-Time Subscription Pattern](#9-real-time-subscription-pattern)
10. [Audit Logging Standard](#10-audit-logging-standard)
11. [Notification Standard](#11-notification-standard)
12. [Branch-Scoping Standard](#12-branch-scoping-standard)
13. [Report/Export Standard](#13-reportexport-standard)
14. [UI/UX Standards](#14-uiux-standards)
15. [Security Architecture](#15-security-architecture)
16. [Module Dependency Graph](#16-module-dependency-graph)
17. [Cross-Module Integration Patterns](#17-cross-module-integration-patterns)
18. [Testing Standards](#18-testing-standards)

---

## 1. Document Overview

### Purpose

This document is the **master architectural reference** for the Lorenzo Dry Cleaners Feature Spec Pack v1.0. It establishes the shared patterns, type definitions, API standards, and integration contracts that all six feature module specifications must adhere to.

The spec pack consists of seven documents total:

| Document | Module | Maturity | Description |
|----------|--------|----------|-------------|
| **This document** | Master | Draft | Shared architecture and standards |
| Module 1 | Order Management | Draft | Order lifecycle, pipeline, workstation processing |
| Module 2 | Driver & Logistics | Draft | Delivery routing, driver management, fleet ops |
| Module 3 | Proximity Intelligence | Draft | Location-based service offers, geofencing |
| Module 4 | Customer Preferences | Draft | Preference learning, personalization engine |
| Module 5 | AI Insights | Draft | Analytics intelligence, predictive models |
| Module 6 | Voucher System | Draft | Voucher creation, approval, redemption |

### How to Read These Documents

The modules have a defined dependency order. Read them in this sequence:

```
M1 (Orders) --> M6 (Vouchers) --> M2 (Logistics) --> M4 (Preferences) --> M3 (Proximity) --> M5 (AI Insights)
```

**M1** is foundational and has no dependencies. **M5** depends on all other modules as a data consumer. Each module spec references this master document for shared types, patterns, and contracts. When a module spec says "see Master Spec Section N," refer back here.

### Conventions

- File paths are relative to the repository root (`c:\POS\`) unless stated otherwise.
- TypeScript interfaces are sourced from actual codebase files and annotated with their file path.
- `// V2.0` or `// NEW` comment markers indicate fields added for the v2.0 upgrade.
- All new schema fields must be optional for backward compatibility.
- Field names use `camelCase` throughout.

---

## 2. System Architecture Overview

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 4+ |
| Components | shadcn/ui | Latest |
| State | React Context + TanStack Query | -- |
| Forms | React Hook Form + Zod | -- |
| Charts | Recharts | -- |
| Maps | Google Maps JavaScript API | -- |
| Icons | Lucide React | -- |
| PDF | jsPDF | -- |
| Database | Firebase Firestore (NoSQL) | -- |
| Auth | Firebase Authentication | -- |
| Storage | Firebase Storage | -- |
| Hosting | Vercel | -- |
| WhatsApp | Wati.io REST API | v1 |
| Payments | Pesapal API | v3 |
| AI | OpenAI + Anthropic + Google (multi-LLM) | -- |
| Email | Resend | -- |

### Codebase Scale

- **59+ pages** across `app/(dashboard)/`, `app/(auth)/`, `app/(public)/`
- **128+ feature components** in `components/features/`
- **125+ library files** in `lib/`
- **70+ API routes** in `app/api/`
- **43 base UI components** in `components/ui/` (shadcn/ui)

### Key Directory Structure

```
app/
  (auth)/                    # Login, register, OTP verification
  (dashboard)/               # All staff dashboards and management pages
    dashboard/               # Role-dispatched main dashboard
    director/                # Director-specific pages (14 sidebar items)
    gm/                      # GM-specific pages (9 sidebar items)
    pos/                     # Point of Sale interface
    pipeline/                # Order pipeline (Kanban board)
    orders/                  # Order management
    customers/               # Customer management
    reports/                 # Reporting hub
    settings/                # System settings
  (public)/                  # Customer portal
  api/                       # 70+ Next.js API routes
    admin/                   # Admin config, commission rules, delivery fees
    agents/                  # AI agent endpoint
    analytics/               # Director analytics, AI narratives
    auth/                    # SSO token generation
    branches/                # Branch configuration
    customers/               # Customer credit, segmentation
    deliveries/              # Delivery location, classification
    orders/                  # Payments, delivery fees, rewash
    payments/                # Pesapal initiation, callbacks, status
    pricing/                 # Calculate, load metrics, rules
    routing/                 # Order routing, delivery validation
    webhooks/                # Pesapal, biometric, feedback, notifications

components/
  ui/                        # 43 shadcn/ui base components
  features/                  # Domain-specific feature components
    pos/                     # POS components
    director/                # Director dashboard components
    pipeline/                # Pipeline board components
  dashboard/                 # Dashboard layout components
  layouts/                   # App layout wrappers

lib/
  db/                        # Database operations, schema, audit logs
    schema.ts                # 1700+ lines, 40+ interfaces (master schema)
    audit-logs.ts            # Audit logging functions
    gm-dashboard.ts          # GM real-time data subscriptions
  pipeline/                  # Status management, transitions
    status-manager.ts        # Order state machine
  workflows/                 # Approval workflows
    approval.ts              # Multi-tier approval system
  agents/                    # AI agent system (8 agents)
    base-agent.ts            # Abstract base class
    types.ts                 # Agent type definitions
  llm/                       # Multi-LLM provider system
    llm-client.ts            # Unified LLM client
    providers/               # OpenAI, Anthropic, Google, Local
  auth/                      # Authentication utilities, role hierarchy
  reports/                   # Excel and PDF export
  receipts/                  # Receipt PDF generation
  config/                    # System configuration

services/
  wati.ts                    # WhatsApp Business API (Wati.io)

hooks/
  useRealTimeGMDashboard.ts  # Real-time Firestore subscriptions
```

---

## 3. Shared Schema Registry

**Source file:** `lib/db/schema.ts` (1700+ lines, 40+ interfaces)

All modules reference this centralized schema. New modules must extend existing interfaces rather than creating parallel definitions.

### Timestamp Type

```typescript
// lib/db/schema.ts
import { Timestamp as ClientTimestamp } from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

/**
 * Unified Timestamp type that works with both client and admin SDKs.
 * This allows the same schema to be used in both client and server code.
 */
export type Timestamp = ClientTimestamp | AdminTimestamp;
```

### UserRole (16 values)

```typescript
// lib/db/schema.ts
export type UserRole =
  | 'admin'
  | 'director'
  | 'general_manager'
  | 'store_manager'
  | 'workstation_manager'
  | 'workstation_staff'
  | 'satellite_staff'
  | 'manager'
  | 'front_desk'
  | 'workstation'
  | 'driver'
  | 'customer'
  // ===== V2.0 New Roles =====
  | 'finance_manager'     // Financial reports, cash out approvals
  | 'auditor'             // Read-only financial access, audit logs
  | 'logistics_manager'   // Delivery tracking, driver management
  | 'inspector';          // Order inspection at reception
```

### OrderStatus (12 states)

```typescript
// lib/db/schema.ts
export type OrderStatus =
  | 'received'
  | 'inspection'
  | 'queued'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'quality_check'
  | 'packaging'
  | 'queued_for_delivery'   // FR-008: Previously 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'collected';
```

**State flow:** `received --> inspection --> queued --> washing --> drying --> ironing --> quality_check --> packaging --> queued_for_delivery --> out_for_delivery --> delivered | collected`

Terminal states: `delivered`, `collected` (no further transitions allowed).

### PaymentMethod (cashless system)

```typescript
// lib/db/schema.ts
export type PaymentMethod = 'mpesa' | 'card' | 'credit' | 'customer_credit';
```

**Distribution:** M-Pesa 78%, Card 15%, Credit 7%. This is a cashless system -- there is no `cash` payment method.

### PaymentStatus

```typescript
// lib/db/schema.ts
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overpaid';
```

### ServiceType and DeliveryClassification

```typescript
// lib/db/schema.ts
export type ServiceType = 'Normal' | 'Express';
export type DeliveryClassification = 'Small' | 'Bulk';
```

- **Normal:** Standard turnaround (24-48 hours).
- **Express:** 2-hour turnaround, FREE (no surcharge).
- **Small:** Motorcycle delivery (fewer garments, lighter weight).
- **Bulk:** Van delivery (6+ garments or 10+ kg).

### Branch

```typescript
// lib/db/schema.ts
export interface Branch {
  branchId: string;
  name: string;
  branchType: 'main' | 'satellite';
  mainStoreId?: string;          // For satellites: which main store they transfer to
  driverAvailability?: number;
  sortingWindowHours?: number;   // FR-007
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  contactPhone: string;
  active: boolean;
  createdAt: Timestamp;
  config?: BranchConfig;         // FR-074: per-branch targets and settings
}
```

- **main:** Has processing equipment, handles all workstation stages.
- **satellite:** Collection point only, transfers orders to `mainStoreId` for processing.
- **25 branches** across Nairobi (main + satellite mix).

### Key Interface Summary

| Interface | Collection | Primary Fields |
|-----------|-----------|----------------|
| `User` | `users` | uid, email, phone, role, branchId, isSuperAdmin |
| `Customer` | `customers` | customerId, name, phone, segment, creditBalance, loyaltyPoints |
| `Order` | `orders` | orderId, customerId, branchId, status, garments[], serviceType |
| `Garment` | (embedded in Order) | garmentId, type, color, brand, category, services[], price |
| `Branch` | `branches` | branchId, name, branchType, mainStoreId, config |
| `Transaction` | `transactions` | transactionId, orderId, amount, method, status, paymentType |
| `Delivery` | `deliveries` | deliveryId, driverId, orders[], route, status |
| `Notification` | `notifications` | notificationId, type, recipientPhone, status, channel |
| `InventoryItem` | `inventory` | itemId, branchId, name, quantity, reorderLevel |
| `AuditLog` | `auditLogs` | auditLogId, action, resourceType, performedBy, changes |
| `Employee` | `employees` | employeeId, uid, role, branchId, shift, hourlyWage |
| `PricingRule` | `pricingRules` | ruleId, serviceType, customerSegment, pricingType |

### Schema Extension Rules

1. **Add optional fields only** -- existing documents must remain valid without the new field.
2. **Mark new fields** with `// V2.0` or `// NEW` comment markers.
3. **Use `camelCase`** for all field names (never `snake_case`).
4. **Reference existing interfaces** before creating new ones -- check `lib/db/schema.ts` first.
5. **Document the Firestore collection name** for every new interface.
6. **Include JSDoc comments** on every field explaining its purpose.

---

## 4. API Design Standards

**Source directory:** `app/api/` (70+ routes)

### Route Naming Convention

```
app/api/[resource]/route.ts              # Collection-level (GET list, POST create)
app/api/[resource]/[resourceId]/route.ts # Document-level (GET one, PUT update, DELETE remove)
app/api/[resource]/[action]/route.ts     # Action endpoint (POST custom action)
```

**Examples from codebase:**

```
app/api/orders/[orderId]/payments/route.ts
app/api/orders/calculate-delivery-fee/route.ts
app/api/orders/rewash/route.ts
app/api/deliveries/classify/route.ts
app/api/pricing/calculate/route.ts
app/api/payments/initiate/route.ts
app/api/webhooks/pesapal/route.ts
```

### HTTP Method Mapping

| Method | Purpose | Example |
|--------|---------|---------|
| `GET` | Read data | `GET /api/orders` |
| `POST` | Create resource or trigger action | `POST /api/orders/rewash` |
| `PUT` | Update resource | `PUT /api/branches/[branchId]/config` |
| `DELETE` | Remove resource | `DELETE /api/admin/commission-rules/[ruleId]` |

### Request Validation

All incoming request bodies must be validated with Zod schemas before processing:

```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  customerId: z.string().min(1),
  branchId: z.string().min(1),
  serviceType: z.enum(['Normal', 'Express']),
  garments: z.array(GarmentSchema).min(1),
});

// In route handler:
const body = await request.json();
const parsed = CreateOrderSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { success: false, error: parsed.error.issues[0].message },
    { status: 400 }
  );
}
```

### Authentication and Authorization

Every protected API route must:

1. **Verify the Firebase token** from the `Authorization: Bearer <token>` header or `lorenzo_session` cookie.
2. **Check the user's role** against the required permission level.
3. **Scope to branch** -- non-admin users should only access data from their own branch.

```typescript
import { verifyAuthToken } from '@/lib/auth/verify-token';

export async function GET(request: NextRequest) {
  const auth = await verifyAuthToken(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'director', 'general_manager'].includes(auth.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  // ... proceed with authorized logic
}
```

### Response Envelope

All API responses use a consistent envelope structure:

```typescript
// Success response
{
  success: true,
  data: T       // The response payload
}

// Error response
{
  success: false,
  error: string  // Human-readable error message
}
```

### Standard Error Codes

| Status | Meaning | When to Use |
|--------|---------|-------------|
| `400` | Bad Request | Validation failure, malformed input |
| `401` | Unauthorized | Missing or invalid auth token |
| `403` | Forbidden | Valid auth but insufficient role/permission |
| `404` | Not Found | Resource does not exist |
| `500` | Internal Server Error | Unexpected server failure |

### Pagination

List endpoints support pagination via query parameters:

```
GET /api/orders?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `1` | Page number (1-indexed) |
| `limit` | `20` | Items per page (max 100) |
| `sortBy` | `createdAt` | Field to sort by |
| `sortOrder` | `desc` | Sort direction: `asc` or `desc` |

Response includes pagination metadata:

```typescript
{
  success: true,
  data: {
    items: T[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
      hasMore: boolean
    }
  }
}
```

---

## 5. State Machine Standards

**Source file:** `lib/pipeline/status-manager.ts`

Order status transitions are governed by a state machine. All modules that modify order status must use this system.

### Valid Transitions Map

```typescript
// lib/pipeline/status-manager.ts
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received:            ['inspection'],
  inspection:          ['queued'],
  queued:              ['washing'],
  washing:             ['drying'],
  drying:              ['ironing'],
  ironing:             ['quality_check'],
  quality_check:       ['packaging', 'washing'],  // Can return to washing if QA fails
  packaging:           ['queued_for_delivery'],
  queued_for_delivery: ['out_for_delivery', 'collected'],
  out_for_delivery:    ['delivered'],
  delivered:           [],  // Terminal state
  collected:           [],  // Terminal state
};
```

### Core Functions

```typescript
// Check if a specific transition is valid
canTransitionTo(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean

// Get all valid next statuses from current state
getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[]

// Get display configuration (label, colors, description)
getStatusConfig(status: OrderStatus): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  requiresNotification: boolean;
}

// Check if order is in a terminal state
isTerminalStatus(status: OrderStatus): boolean

// Check if status requires WhatsApp notification
requiresNotification(status: OrderStatus): boolean

// Get status group for filtering
getStatusGroup(status: OrderStatus): 'Pending' | 'Processing' | 'Ready' | 'Completed'
```

### Status Groups

| Group | Statuses |
|-------|----------|
| **Pending** | `received`, `inspection`, `queued` |
| **Processing** | `washing`, `drying`, `ironing`, `quality_check`, `packaging` |
| **Ready** | `queued_for_delivery`, `out_for_delivery` |
| **Completed** | `delivered`, `collected` |

### Notification Triggers

WhatsApp notifications are sent when transitioning to:
- `queued_for_delivery` -- "Your order is ready"
- `out_for_delivery` -- "Driver dispatched"
- `delivered` -- "Successfully delivered"

### Side Effects Per Transition

Every status transition must:

1. **Validate** the transition via `canTransitionTo()`.
2. **Update** the order status in Firestore.
3. **Append** to the `statusHistory` array on the order document.
4. **Create an audit log** via `logOrderUpdated()`.
5. **Send notifications** if `requiresNotification()` returns `true`.
6. **Update dashboard metrics** (real-time listeners will pick up Firestore changes automatically).

### Creating New State Machines

New modules that need state machines (e.g., voucher lifecycle, delivery lifecycle) must follow this same pattern:

1. Define a `type` union for all states.
2. Create a `VALID_TRANSITIONS` map.
3. Implement `canTransitionTo()` and `getValidNextStatuses()`.
4. Define side effects for each transition.
5. Place the file in `lib/[module]/status-manager.ts`.

---

## 6. Approval Workflow Pattern

**Source file:** `lib/workflows/approval.ts`

The approval system provides a reusable, multi-tier escalation workflow used by multiple modules (vouchers, cash out, disposal, refunds, etc.).

### Approval Types

```typescript
// lib/workflows/approval.ts
export type ApprovalType =
  | 'voucher'
  | 'cash_out'
  | 'disposal'
  | 'discount'
  | 'refund'
  | 'price_override'
  | 'credit_extension';
```

### Approval Status

```typescript
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
```

### Approval Tiers

```typescript
export type ApprovalTier = 'manager' | 'general_manager' | 'director' | 'admin';
```

Tier hierarchy (lower index = less authority):

```typescript
export const TIER_HIERARCHY: ApprovalTier[] = [
  'manager',
  'general_manager',
  'director',
  'admin'
];
```

### Role-to-Tier Mapping

```typescript
export const ROLE_TO_TIER: Record<string, ApprovalTier | null> = {
  admin: 'admin',
  director: 'director',
  general_manager: 'general_manager',
  store_manager: 'manager',
  manager: 'manager',
  finance_manager: 'manager',
  logistics_manager: 'manager',
  workstation_manager: null,   // Cannot approve
  front_desk: null,
  workstation_staff: null,
  satellite_staff: null,
  driver: null,
  customer: null,
  auditor: null,
  inspector: null,
};
```

### ApprovalRequest Interface

```typescript
// lib/workflows/approval.ts
export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  currentTier: ApprovalTier;
  amount?: number;
  entityId?: string;
  entityType?: string;
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

export interface ApprovalHistoryEntry {
  tier: ApprovalTier;
  userId: string;
  userName: string;
  action: 'approve' | 'reject' | 'escalate' | 'comment';
  comment?: string;
  timestamp: Timestamp;
}
```

### Workflow Configurations

Each approval type has a `WorkflowConfig` that defines tiers, amount thresholds, expiry, and notification channels:

| Type | Tiers | Amount Escalation | Expiry (hours) | Auto-Expire |
|------|-------|-------------------|----------------|-------------|
| `voucher` | GM, Director | GM >= 0, Director >= 5,000 | 48 | Yes |
| `cash_out` | Manager, GM | Manager >= 0, GM >= 2,000 | 24 | Yes |
| `disposal` | GM | -- | 72 | No |
| `discount` | Manager, GM | Manager >= 0, GM >= 1,000 | 4 | Yes |
| `refund` | Manager, GM, Director | Manager >= 0, GM >= 5,000, Director >= 10,000 | 24 | Yes |
| `price_override` | Manager, GM | -- | 2 | Yes |
| `credit_extension` | GM, Director | GM >= 0, Director >= 20,000 | 48 | Yes |

### Multi-Tier Escalation Flow

```
Request Created (pending at required tier)
    |
    v
Tier N reviews:
    |- APPROVE --> status = 'approved', workflow complete
    |- REJECT  --> status = 'rejected', workflow complete
    |- ESCALATE --> currentTier = Tier N+1, status temporarily 'escalated' then 'pending'
    |
    v
Tier N+1 reviews...
    (repeat until approved, rejected, or max tier reached)
    |
    v
If no action before expiresAt:
    status = 'expired' (if autoExpire is true)
```

### Core Functions

```typescript
// Determine which tier is required based on type and amount
getRequiredTier(type: ApprovalType, amount?: number): ApprovalTier

// Check if a user can approve a given request
canApprove(userRole: string, request: ApprovalRequest): boolean

// Create, approve, reject, escalate, comment
createApprovalRequest(data): Promise<string>
approveRequest(requestId, approverId, approverName, approverRole, comment?): Promise<void>
rejectRequest(requestId, rejecterId, rejecterName, rejecterRole, reason): Promise<void>
escalateRequest(requestId, escalatorId, escalatorName, escalatorRole, comment?): Promise<void>
addComment(requestId, userId, userName, userRole, comment): Promise<void>

// Query functions
getPendingApprovalsForUser(userRole, branchId?): Promise<ApprovalRequest[]>
getApprovalsByType(type, status?, branchId?): Promise<ApprovalRequest[]>
getApprovalStats(branchId?, startDate?, endDate?): Promise<ApprovalStats>

// Maintenance
expirePendingRequests(): Promise<number>
```

### Adding New Approval Types

1. Add the new type to the `ApprovalType` union in `lib/workflows/approval.ts`.
2. Add a `WorkflowConfig` entry in the `WORKFLOW_CONFIGS` map.
3. Define the amount thresholds for tier escalation.
4. Set `defaultExpiryHours` and `autoExpire`.
5. Specify `notifyChannels`.

---

## 7. AI Agent Architecture

**Source files:** `lib/agents/base-agent.ts`, `lib/agents/types.ts`, `lib/llm/`

### Agent System Overview

The system uses a multi-agent architecture where specialized agents handle domain-specific tasks, coordinated by an orchestrator.

### Available Agents

| Agent File | Name | Purpose |
|-----------|------|---------|
| `orchestrator-agent.ts` | `orchestrator-agent` | Routes requests to specialist agents |
| `order-agent.ts` | `order-agent` | Order tracking, status, details |
| `customer-agent.ts` | `customer-agent` | Customer profile, history, management |
| `pricing-agent.ts` | `pricing-agent` | Price quotes, service pricing |
| `logistics-agent.ts` | `logistics-agent` | Delivery tracking, route info |
| `analytics-agent.ts` | `analytics-agent` | Business metrics, reports (staff-only) |
| `support-agent.ts` | `support-agent` | Complaints, escalation, help |
| `onboarding-agent.ts` | `onboarding-agent` | Customer registration, phone/email verification |

### BaseAgent Abstract Class

```typescript
// lib/agents/base-agent.ts
export abstract class BaseAgent {
  abstract readonly name: AgentName;
  abstract readonly description: string;
  abstract readonly capabilities: AgentCapability[];

  abstract handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse>;

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    // 1. Validate action exists
    // 2. Check authorization (role-based)
    // 3. Validate required parameters
    // 4. Execute the action via handle()
    // 5. Log response time
    // 6. Return response
  }
}
```

### AgentCapability Interface

```typescript
// lib/agents/types.ts
export interface AgentCapability {
  action: string;                       // Action identifier
  description: string;                  // What this action does
  requiredParams: string[];             // Mandatory parameters
  optionalParams?: string[];            // Optional parameters
  requiresAuth: boolean;               // Whether authentication is needed
  allowedUserTypes?: UserType[];        // 'guest' | 'customer' | 'staff'
  allowedStaffRoles?: StaffRole[];      // Specific staff roles if staff-only
}
```

### Agent Request/Response

```typescript
// lib/agents/types.ts
export interface AgentRequest {
  requestId: string;
  fromAgent: AgentSource;       // 'website-chatbot' | 'staff-assistant' | 'customer-portal' | 'system'
  toAgent: AgentName;
  action: string;
  params: Record<string, unknown>;
  auth: AgentAuth;
  timestamp: string;
}

export interface AgentResponse {
  requestId: string;
  fromAgent: AgentName;
  status: 'success' | 'error' | 'unauthorized' | 'not_found';
  data?: unknown;
  error?: string;
  message?: string;
  timestamp: string;
}
```

### Multi-LLM Provider Chain

**Source:** `lib/llm/llm-client.ts`, `lib/llm/providers/`

The system supports multiple LLM providers with automatic fallback:

```
OpenAI --> Anthropic --> Google --> Local
```

```typescript
// lib/llm/llm-client.ts
export class LLMClient {
  // Primary: use configured provider for agent/function combination
  async chatCompletion(
    agentType: LLMAgentType,
    agentFunction: AgentFunction,
    messages: ChatMessage[],
    options?: Partial<ChatCompletionOptions>
  ): Promise<ChatCompletionResponse>

  // Fallback: try alternative providers on rate limit
  private async tryFallbackProviders(
    failedProvider: LLMProvider,
    messages: ChatMessage[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | null>
}
```

Provider implementations in `lib/llm/providers/`:

| Provider | File | Description |
|----------|------|-------------|
| OpenAI | `openai-provider.ts` | GPT-4 and variants |
| Anthropic | `anthropic-provider.ts` | Claude models |
| Google | `google-provider.ts` | Gemini models |
| Local | `local-provider.ts` | Self-hosted models |

### Convenience Functions

```typescript
// Simple completion
await complete(agentType, agentFunction, messages, options): Promise<string>

// Single prompt
await ask(agentType, agentFunction, prompt, systemPrompt?): Promise<string>
```

---

## 8. Dashboard Architecture

The dashboard architecture follows a **Summary Dashboard + Detail Pages** pattern. The main dashboard shows KPI cards only; detail pages provide full drill-down.

### Director Dashboard

**Route:** `/dashboard` (when role is `director`)

**Summary KPIs (5-8 cards):**

| KPI | Description |
|-----|-------------|
| Revenue today vs target | Today's revenue with target progress bar |
| Total orders today | Count of orders created today |
| On-time delivery % | Delivery performance metric |
| Customer retention | Returning customer percentage |
| Average order value | Mean order value in KES |
| Pending approvals count | Vouchers, cash out, disposal awaiting approval |
| Risk alerts count | Overdue orders, low stock, equipment issues |
| AI recommendations count | Unread AI-generated insights |

**Director Sidebar (14 items in 4 groups):**

```
OVERVIEW
  Executive Dashboard          /dashboard

MODULES
  Orders & Pipeline            /director/orders
  Logistics & Delivery         /director/logistics
  Customer Intelligence        /director/customers
  AI Insights                  /director/insights
  Vouchers & Campaigns         /director/vouchers

OPERATIONS
  Branch Performance           /director/branches
  Financial Overview           /director/financials
  Staff Overview               /director/staff
  Quality Metrics              /director/quality

GOVERNANCE
  Approvals                    /director/approvals
  Strategic Reports            /director/reports
  Settings                     /settings
```

**Director theme:** Dark gradient background (`from-[#0A1A1F] to-[#0D2329]`) with gold accent colors.

### GM Dashboard

**Route:** `/dashboard` (when role is `general_manager`)

**Summary KPIs (real-time):**

| KPI | Description |
|-----|-------------|
| Live order count | Real-time count via Firestore onSnapshot |
| Today's revenue | Real-time revenue sum |
| Avg turnaround | Average processing time in hours |
| Staff on duty | Currently clocked-in staff count |
| Equipment health | Equipment status summary |

**GM Sidebar (9 items):**

```
OVERVIEW
  Operations Dashboard         /dashboard

OPERATIONS
  Live Orders                  /gm/orders
  Deliveries                   /gm/deliveries     (NEW)
  Staff                        /gm/staff
  Equipment                    /gm/equipment

ANALYTICS
  Performance                  /gm/performance
  Voucher Approvals            /gm/vouchers        (NEW)

ADMIN
  My Requests                  /gm/requests
  Settings                     /settings
```

### Staff Dashboard

**Route:** `/dashboard` (when role is `front_desk`, `workstation_staff`, etc.)

**KPIs:**

| KPI | Description |
|-----|-------------|
| Daily item count | Orders/garments processed today |
| Items handled | Total items in current shift |
| Average processing time | Mean time per item |
| Rank | Performance rank among peers |
| Performance chart | 7-day trend line |
| Shift timer | Time remaining in current shift |

---

## 9. Real-Time Subscription Pattern

**Source file:** `hooks/useRealTimeGMDashboard.ts`

### Architecture

The system uses a dual approach:

| Data Criticality | Method | Latency | Use Cases |
|------------------|--------|---------|-----------|
| **Critical** | Firestore `onSnapshot` listeners | 1-2 seconds | Revenue, order count, live queue |
| **Non-critical** | `setInterval` polling | 30s-5min | Staff metrics, equipment, satisfaction |

### Refresh Intervals

```typescript
// hooks/useRealTimeGMDashboard.ts
const REFRESH_INTERVALS = {
  turnaround:   120000,  // 2 minutes
  staff:         60000,  // 1 minute
  equipment:    120000,  // 2 minutes
  issues:        30000,  // 30 seconds
  branches:      60000,  // 1 minute
  satisfaction: 300000,  // 5 minutes
};
```

### Listener Setup Pattern

```typescript
// Set up onSnapshot listener
const unsubscribe = subscribeToTodayOrderCount(
  branchFilter,
  (count) => {
    if (isMounted.current) {
      setOrderCount(count);
      setLastUpdated(new Date());
    }
  },
  handleError
);
unsubscribeRefs.current.push(unsubscribe);
```

### Cleanup Pattern

```typescript
// Track mount state
const isMounted = useRef(true);
const unsubscribeRefs = useRef<(() => void)[]>([]);

// Cleanup on unmount
useEffect(() => {
  isMounted.current = true;
  // ... set up listeners

  return () => {
    isMounted.current = false;
    unsubscribeRefs.current.forEach((unsub) => {
      try { unsub(); } catch (e) { console.warn('Error unsubscribing:', e); }
    });
    unsubscribeRefs.current = [];
  };
}, [dependencies]);
```

### Firestore Query Optimization

- **Compound indexes:** Required for queries combining `branchId` + date range + status filters.
- **`limit()` clauses:** Always limit query result sets to prevent unbounded reads.
- **Branch filtering:** Use `where('branchId', '==', branchId)` on all queries for non-admin users.
- **Date scoping:** Use `where('createdAt', '>=', startOfToday)` to avoid scanning historical data.
- **`onSnapshot` vs `getDocs`:** Use `onSnapshot` only for data that must update in real time. Use `getDocs` for data that can tolerate polling latency.

---

## 10. Audit Logging Standard

**Source file:** `lib/db/audit-logs.ts`, `lib/db/schema.ts`

### AuditLogAction Type

```typescript
// lib/db/schema.ts
export type AuditLogAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'transfer'
  | 'approve'
  | 'reject'
  | 'role_change'
  | 'branch_access_change'
  | 'permission_change';
```

### AuditLog Schema

```typescript
// lib/db/schema.ts -- Collection: auditLogs
export interface AuditLog {
  auditLogId: string;
  action: AuditLogAction;
  resourceType: string;           // 'order', 'inventory', 'user', 'transfer', etc.
  resourceId: string;
  performedBy: string;            // UID
  performedByName: string;        // Denormalized name
  performedByRole: UserRole;      // Role at time of action
  branchId?: string;              // Null for global actions
  additionalBranchIds?: string[]; // For cross-branch actions (transfers)
  description: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
}
```

### Core Function

```typescript
// lib/db/audit-logs.ts
async function createAuditLog(
  action: AuditLogAction,
  resourceType: string,
  resourceId: string,
  performedBy: string,
  performedByName: string,
  performedByRole: UserRole,
  description: string,
  branchId?: string,
  additionalBranchIds?: string[],
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> },
  ipAddress?: string,
  userAgent?: string
): Promise<string>  // Returns auditLogId (format: AUDIT-YYYYMMDD-TIMESTAMP-RANDOM)
```

### Specialized Helpers

| Function | Resource Type | When to Use |
|----------|--------------|-------------|
| `logOrderCreated()` | `order` | New order creation |
| `logOrderUpdated()` | `order` | Status change, field update, payment |
| `logInventoryTransfer()` | `inventory_transfer` | Stock moved between branches |
| `logRoleChange()` | `user` | User role updated |
| `logBranchAccessChange()` | `user` | Branch access list modified |
| `logCrossBranchAction()` | (any) | Action affecting multiple branches |

### Query Functions

```typescript
getAuditLogsByResource(resourceType, resourceId, limit?): Promise<AuditLog[]>
getAuditLogsByBranch(branchId, limit?, action?): Promise<AuditLog[]>
getAuditLogsByUser(userId, limit?): Promise<AuditLog[]>
getRecentAuditLogs(limit?, action?): Promise<AuditLog[]>        // Super admin only
getCrossBranchAuditLogs(limit?): Promise<AuditLog[]>
```

### Module Logging Requirements

**EVERY module must log the following events:**

| Event | Action | Required Fields |
|-------|--------|----------------|
| Create | `create` | resourceType, resourceId, full `after` snapshot |
| Update | `update` | Before/after delta, description of what changed |
| Delete | `delete` | Full `before` snapshot |
| Status change | `update` | Before status, after status |
| Payment event | `create` | Transaction details |
| Approval action | `approve` or `reject` | ApprovalRequest ID, approver info |
| Transfer | `transfer` | From/to branch, item details |

---

## 11. Notification Standard

**Source file:** `services/wati.ts`

### WhatsApp Integration (Wati.io)

| Setting | Value |
|---------|-------|
| Base URL | `https://live-server.wati.io` (env: `WATI_API_ENDPOINT`) |
| Auth | Bearer token (env: `WATI_ACCESS_TOKEN`) |
| Phone format | `254XXXXXXXXX` (no `+` prefix) |
| API version | `/api/v1/sendTemplateMessage` |
| Timeout | 30 seconds |

### Phone Number Formatting

```typescript
// services/wati.ts
formatPhoneNumber('+254712345678')  // Returns '254712345678'
formatPhoneNumber('0712345678')     // Returns '254712345678'

isValidKenyanPhoneNumber(phone)     // Validates: /^254[71]\d{8}$/
```

### Existing Templates (6 active)

| Template Name | Trigger Status | Example Message |
|---------------|---------------|-----------------|
| `order_confirmation` | `received` | "Hi {{name}}, your order {{orderId}} has been received. Total: KES {{amount}}..." |
| `order_ready` | `queued_for_delivery` | "Great news {{name}}! Your order {{orderId}} is ready for {{collectionMethod}}..." |
| `driver_dispatched` | `out_for_delivery` | "Hi {{name}}, your order {{orderId}} is out for delivery! Driver: {{driverName}}..." |
| `driver_nearby` | (proximity trigger) | "Hi {{name}}, our driver is approximately 5 minutes away..." |
| `order_delivered` | `delivered` | "Hi {{name}}, your order {{orderId}} has been successfully delivered..." |
| `payment_reminder` | (scheduled) | "Hi {{name}}, this is a friendly reminder that order {{orderId}} has a pending balance of KES {{balance}}..." |

### NEW Templates Required (require Meta approval)

| Template Name | Module | Description |
|---------------|--------|-------------|
| `proactive_pickup_offer` | M3 (Proximity) | Location-triggered pickup offer |
| `voucher_issued` | M6 (Voucher) | Voucher code sent to customer |
| `voucher_expiry_reminder` | M6 (Voucher) | Reminder before voucher expires |

### Retry Logic

```
Attempt 1 --> wait 1s --> Attempt 2 --> wait 2s --> Attempt 3 --> FAIL
```

- **Max attempts:** 3
- **Backoff:** Exponential (`INITIAL_RETRY_DELAY * 2^(attempt-1)`) = 1s, 2s, 4s
- **Non-retryable errors:** 401 (auth failure), 400 (bad request)
- **On total failure:** Update notification status to `failed` in Firestore

### Notification Collection Schema

```typescript
// lib/db/schema.ts -- Collection: notifications
export interface Notification {
  notificationId: string;
  type: NotificationType;           // 'order_confirmation' | 'order_ready' | etc.
  recipientId: string;              // Customer ID
  recipientPhone: string;           // Format: 254XXXXXXXXX
  message: string;                  // Rendered message text
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  channel: 'whatsapp' | 'sms' | 'email';
  timestamp: Timestamp;
  orderId?: string;
}
```

### Convenience Functions

```typescript
// services/wati.ts
sendOrderConfirmation(phone, { orderId, customerName, amount, estimatedCompletion })
sendOrderReady(phone, { orderId, customerName, collectionMethod, branchName })
sendDriverDispatched(phone, { orderId, customerName }, { driverName, driverPhone, estimatedArrival })
sendDriverNearby(phone, { orderId, customerName })
sendDelivered(phone, { orderId, customerName })
sendPaymentReminder(phone, { orderId, customerName }, balanceDue)
```

### Adding New Notification Types

1. Create the message template text in `services/wati.ts` `templates` map.
2. Submit the template to Meta for approval via Wati.io dashboard.
3. Add the template name to `mapTemplateToNotificationType()`.
4. Create a convenience function following the existing pattern.
5. Add the `NotificationType` value to the type union in `lib/db/schema.ts`.
6. Update this spec document.

---

## 12. Branch-Scoping Standard

### Branch Topology

- **25 branches** across Nairobi (main + satellite).
- **Main store:** Has processing equipment (washing, drying, ironing, etc.). Handles all workstation stages.
- **Satellite store:** Collection point only. Orders are transferred to the `mainStoreId` for processing.

```typescript
// lib/db/schema.ts
interface Branch {
  branchType: 'main' | 'satellite';
  mainStoreId?: string;  // Satellite only: which main store processes its orders
}
```

### Data Isolation Rules

**Every document in Firestore must have a `branchId` field** to enable branch-scoped queries.

| Role | Branch Access |
|------|--------------|
| `admin` (isSuperAdmin: true) | ALL branches |
| `director` | ALL branches |
| `general_manager` | Own branch + branches in `branchAccess[]` |
| `store_manager` | Own branch only |
| `workstation_manager` | Own branch only |
| Staff roles | Own branch only |
| `customer` | N/A (access own orders regardless of branch) |

### Multi-Branch Query Pattern

Firestore `in` operator is limited to **10 values** per query:

```typescript
// For users with multi-branch access
const branchIds = [user.branchId, ...(user.branchAccess || [])];

if (branchIds.length <= 10) {
  // Single query
  where('branchId', 'in', branchIds)
} else {
  // Split into multiple queries and merge results
  const chunks = chunkArray(branchIds, 10);
  const results = await Promise.all(
    chunks.map(chunk => query(collection, where('branchId', 'in', chunk)))
  );
  // Merge and deduplicate
}
```

### Super Admin Override

```typescript
// lib/db/schema.ts
interface User {
  isSuperAdmin?: boolean;  // Bypasses all branch scoping
}
```

When `isSuperAdmin` is `true`, omit the `branchId` filter entirely to return all-branch data.

---

## 13. Report/Export Standard

**Source files:** `lib/reports/export-excel.ts`, `lib/reports/export-pdf.ts`, `lib/receipts/pdf-generator.ts`

### Export Formats

| Format | Library | Use Case |
|--------|---------|----------|
| **Excel (.xlsx)** | `xlsx` (SheetJS) | Multi-sheet workbooks, raw data export |
| **PDF** | `jsPDF` | Receipts, formatted reports, printable documents |
| **CSV** | Custom | Basic data export for reports page |

### Excel Export Pattern

```typescript
// lib/reports/export-excel.ts
import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeSummary?: boolean;
  dateFormat?: string;
}
```

**Standard workbook structure:**
- **Sheet 1 (Detail):** Row-by-row transaction/order data with auto-width columns.
- **Sheet 2 (Summary):** Aggregated totals, averages, breakdowns by category.

### PDF Export Pattern

```typescript
// lib/reports/export-pdf.ts
import { jsPDF } from 'jspdf';

interface PDFExportOptions {
  filename?: string;
  title?: string;
  dateRange?: { start: Date; end: Date };
  branchName?: string;
  showSummary?: boolean;
}
```

### Receipt Generation

**Source:** `lib/receipts/pdf-generator.ts`

Receipts are generated as PDF documents with:
- Company logo and branch info header
- QR code linking to order tracking page
- "CLEANED AT OWNER'S RISK" legal notice
- Terms and conditions link
- Payment summary and garment list

### Filename Convention

```
{report-type}_{branch}_{YYYYMMDD}_to_{YYYYMMDD}.xlsx
```

**Examples:**
- `revenue-report_kilimani_20260201_to_20260228.xlsx`
- `staff-performance_all-branches_20260101_to_20260131.pdf`
- `inventory-valuation_westlands_20260212.xlsx`

### Currency Formatting

All monetary values must use the Kenyan locale:

```typescript
function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
```

### Date Formatting

```typescript
function formatTimestamp(timestamp): string {
  const date = 'seconds' in timestamp
    ? new Date(timestamp.seconds * 1000)
    : timestamp;
  return date.toLocaleString('en-KE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

---

## 14. UI/UX Standards

### Color Palette (Black and White Theme)

| Element | Color | Usage |
|---------|-------|-------|
| Background | `#FFFFFF` | 90%+ of UI surface area |
| Text Primary | `#000000` or `#1F2937` | Headings, body text |
| Text Secondary | `#6B7280` | Labels, descriptions, metadata |
| Borders/Dividers | `#E5E7EB` | Card borders, table dividers |
| Card Backgrounds | `#F9FAFB` | Card surfaces, hover states |

### Accent Colors (Use Sparingly)

| Semantic | Color | Hex | Use Case |
|----------|-------|-----|----------|
| Success | Green | `#10B981` | Completed, paid, approved |
| Warning | Amber | `#F59E0B` | Pending, attention needed |
| Error | Red | `#EF4444` | Failed, overdue, rejected |
| Info | Blue | `#3B82F6` | Informational, links, active |

### Typography

| Property | Value |
|----------|-------|
| Font Family | Inter (sans-serif) |
| Base Size | 16px (1rem) |
| Scale | 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px |

### Design Principles

1. **Minimalistic:** Clean layouts with generous whitespace. No decorative elements.
2. **High Contrast:** Maintain 4.5:1 contrast ratio minimum (WCAG AA).
3. **Mobile-First:** Design for mobile viewports first, enhance for desktop.
4. **Accessible:** WCAG 2.1 Level AA compliance mandatory.

### Component Library

**43 shadcn/ui base components** in `components/ui/`:

Button, Card, Dialog, DropdownMenu, Input, Label, Select, Table, Tabs, Badge, Checkbox, RadioGroup, Switch, Textarea, Tooltip, Sheet, Popover, Command, Calendar, DatePicker, Separator, ScrollArea, Skeleton, Slider, Progress, Avatar, AlertDialog, Alert, Accordion, Aspect Ratio, Collapsible, ContextMenu, HoverCard, Menubar, NavigationMenu, Pagination, Resizable, Sonner (toast), Toggle, ToggleGroup, and more.

### Director Role Exception

The Director dashboard uses a **dark theme** as a visual distinction:

```css
/* Director gradient background */
background: linear-gradient(to bottom right, #0A1A1F, #0D2329);

/* Gold accent for KPI highlights */
color: #D4AF37;  /* Gold */
```

This applies only to `/dashboard` and `/director/*` routes when the user role is `director`.

---

## 15. Security Architecture

### Role-Based Access Control (RBAC)

**Source:** `lib/auth/utils.ts`

```typescript
const roleHierarchy: Record<UserRole, number> = {
  customer: 1,
  driver: 2,
  satellite_staff: 3,
  workstation_staff: 3,
  front_desk: 4,
  workstation: 4,
  manager: 4,
  inspector: 4,
  workstation_manager: 5,
  auditor: 5,
  logistics_manager: 6,
  store_manager: 6,
  finance_manager: 7,
  general_manager: 7,
  director: 8,
  admin: 9,
};
```

**Permission check:**

```typescript
// lib/auth/utils.ts
export function checkUserPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
}
```

### RBAC Access Matrix (Key Features)

| Feature | admin | director | GM | store_mgr | front_desk | workstation | driver | customer |
|---------|:-----:|:--------:|:--:|:---------:|:----------:|:-----------:|:------:|:--------:|
| Create orders | X | X | X | X | X | - | - | - |
| View all branches | X | X | - | - | - | - | - | - |
| Approve vouchers | X | X | X | - | - | - | - | - |
| Manage staff | X | X | X | X | - | - | - | - |
| Financial reports | X | X | X | - | - | - | - | - |
| Audit logs | X | X | X | - | - | - | - | - |
| Process payments | X | X | X | X | X | - | - | - |
| Update order status | X | X | X | X | X | X | - | - |
| View own orders | X | X | X | X | X | X | X | X |
| Driver deliveries | X | X | X | - | - | - | X | - |
| System settings | X | - | - | - | - | - | - | - |

### Authentication

- **Firebase Auth** with email/password and phone OTP.
- **Session cookie:** `lorenzo_session` stored in browser cookies.
- **JWT tokens** for API authentication via `Authorization: Bearer <token>` header.

### Middleware Protection

**Source:** `middleware.ts`

```typescript
// Protected routes (require authentication)
const protectedRoutes = ['/dashboard', '/portal', '/orders', '/profile', '/pipeline'];

// Public routes (no auth required)
const publicRoutes = ['/', '/login', '/customer-login', '/verify-otp', '/forgot-password', '/register'];
```

The middleware runs on Edge Runtime and checks for the `lorenzo_session` cookie. If missing on a protected route, the user is redirected to `/login` with a `from` query parameter for post-login redirect.

### Firestore Security Rules

Role-based read/write permissions are enforced at the Firestore level:

- `users` collection: Users can read their own document; admins can read/write all.
- `orders` collection: Branch-scoped read; staff can create/update; customers can read own orders.
- `auditLogs` collection: Admin/director read; system-write only (no client writes).

### Session Security

- **Session timeout:** 30 minutes of inactivity via `InactivityMonitor` component.
- **Shift-based logout:** Auto-logout at shift end time with 5-minute grace period.
- **Account lockout:** 5 failed login attempts triggers temporary lockout.

---

## 16. Module Dependency Graph

```
M1 (Order Management)
  |
  +--- M6 (Vouchers)           depends on M1: vouchers are applied to orders
  |     |
  +-----+--- M2 (Logistics)    depends on M1: delivers orders
  |           |
  +--- M4 (Preferences)        depends on M1: analyzes order history
  |     |
  +-----+--- M3 (Proximity)    depends on M1: order patterns
  |           depends on M4: preferences and opt-in settings
  |
  +--- M5 (AI Insights)        depends on ALL: data consumer and analytics
```

### Implementation Order

```
Phase 1:  M1 (Order Management)      -- foundational, no dependencies
Phase 2:  M6 (Voucher System)        -- depends on M1 only
Phase 3:  M2 (Driver & Logistics)    -- depends on M1
Phase 4:  M4 (Customer Preferences)  -- depends on M1
Phase 5:  M3 (Proximity Intelligence)-- depends on M1 + M4
Phase 6:  M5 (AI Insights)           -- depends on all modules
```

### Rationale

- **M1 first** because every other module operates on orders.
- **M6 before M2** because vouchers need to integrate with the order payment flow before logistics is built.
- **M4 before M3** because proximity offers depend on customer preference data and opt-in status.
- **M5 last** because it consumes data from all other modules to generate insights.

---

## 17. Cross-Module Integration Patterns

### Event-Driven: Status Change Triggers

When an order transitions status (M1), side effects propagate to other modules:

```
Order status change (M1)
  |
  +--> Notification sent (services/wati.ts)
  |      Templates: order_confirmation, order_ready, driver_dispatched, etc.
  |
  +--> Audit log created (lib/db/audit-logs.ts)
  |      logOrderUpdated() with before/after status
  |
  +--> Dashboard metrics updated (real-time via Firestore onSnapshot)
  |      GM and Director dashboards auto-refresh
  |
  +--> Voucher eligibility check (M6, if applicable)
  |      Apply voucher discount at payment stage
  |
  +--> Delivery assignment (M2, on queued_for_delivery)
         Route optimization and driver assignment
```

### Data Pipeline: Metrics into AI Insights

All modules feed metrics into M5 (AI Insights) via `lib/db/analytics-db.ts`:

```
M1 (orders, status durations, throughput)
M2 (delivery times, route efficiency, driver performance)
M3 (proximity conversions, geofence triggers)
M4 (preference adoption, personalization effectiveness)
M6 (voucher redemption rates, campaign ROI)
    |
    v
M5 AI Insights Engine
    |
    +--> Director AI Narratives (/api/analytics/director/ai-narrative)
    +--> Recommendations (/api/analytics/director/recommendations)
    +--> Predictive Models (order completion ETA, demand forecasting)
```

### Shared Approval Workflow

Multiple modules use the centralized approval system (`lib/workflows/approval.ts`):

| Module | Approval Type | Trigger |
|--------|--------------|---------|
| M6 (Vouchers) | `voucher` | New voucher creation |
| M1 (Orders) | `refund`, `price_override` | Refund request, price change |
| M5 (AI Insights) | `discount` | AI-recommended discount |
| Operations | `cash_out`, `disposal`, `credit_extension` | Finance actions |

### Customer Profile Enrichment

M4 (Preferences) enriches the customer profile data that M3 (Proximity) and M6 (Vouchers) consume:

```
M4 learns preferences:
  - Preferred services
  - Preferred pickup times
  - Communication preferences
  - Garment care preferences
    |
    v
M3 uses preferences:
  - Which customers to target with proximity offers
  - Preferred communication channel for offers
  - Opt-in/opt-out status
    |
    v
M6 uses preferences:
  - Personalized voucher targeting
  - Preferred service types for voucher campaigns
```

### Dashboard Data Contracts

Each module provides data contracts consumed by the Director and GM dashboards:

| Module | Dashboard Data | Consumer |
|--------|---------------|----------|
| M1 | Order count, revenue, pipeline distribution | Director + GM |
| M2 | Delivery performance, route efficiency | Director + GM |
| M3 | Proximity conversions, engagement rate | Director |
| M4 | Preference coverage, personalization score | Director |
| M5 | AI recommendations, risk alerts, insights | Director |
| M6 | Voucher usage, campaign ROI, pending approvals | Director + GM |

---

## 18. Testing Standards

### Testing Framework

| Type | Tool | Description |
|------|------|-------------|
| Unit | Jest | Component and function testing |
| Integration | Jest + Firebase Emulator | API endpoint testing with mocked Firebase |
| E2E | Playwright | Critical user flow testing across browsers |

### Coverage Targets

- **Unit tests:** Target 80%+ code coverage (recommended, not enforced in CI/CD).
- **Integration tests:** All API endpoints must have at least one happy-path test.
- **E2E tests:** Critical flows (order creation, payment, delivery) must be covered.

### Test File Convention

```
__tests__/
  unit/
    status-manager.test.ts
    approval.test.ts
  integration/
    orders-api.test.ts
    payments-api.test.ts
  e2e/
    order-creation.spec.ts
    delivery-flow.spec.ts
```

### CI/CD Pipeline

The pipeline is **relaxed** -- no mandatory automated tests before merge:

1. Developer pushes code to GitHub.
2. Build Next.js app for production.
3. Deploy to Staging (Vercel preview).
4. Run smoke tests on staging.
5. Manual approval by product manager.
6. Deploy to Production (Vercel).
7. Monitor for errors.

Tests are **recommended but not blocking**. Focus is on quality over strict automation gates.

### Module-Specific Testing Requirements

Each module spec must define:

1. **Unit tests** for all state machines and business logic functions.
2. **Integration tests** for new API endpoints.
3. **E2E tests** for primary user flows introduced by the module.
4. **Edge case tests** for approval workflows, branch-scoping, and role-based access.

---

## Appendix: Quick Reference

### File Path Index

| Pattern | File Path |
|---------|-----------|
| Master schema | `lib/db/schema.ts` |
| Status manager | `lib/pipeline/status-manager.ts` |
| Approval workflow | `lib/workflows/approval.ts` |
| Audit logging | `lib/db/audit-logs.ts` |
| Base agent | `lib/agents/base-agent.ts` |
| Agent types | `lib/agents/types.ts` |
| LLM client | `lib/llm/llm-client.ts` |
| LLM types | `lib/llm/types.ts` |
| WhatsApp service | `services/wati.ts` |
| Real-time hook | `hooks/useRealTimeGMDashboard.ts` |
| Excel export | `lib/reports/export-excel.ts` |
| PDF export | `lib/reports/export-pdf.ts` |
| Receipt generator | `lib/receipts/pdf-generator.ts` |
| Role hierarchy | `lib/auth/utils.ts` |
| Middleware | `middleware.ts` |

### Abbreviation Glossary

| Abbreviation | Meaning |
|-------------|---------|
| GM | General Manager |
| KPI | Key Performance Indicator |
| POS | Point of Sale |
| RBAC | Role-Based Access Control |
| KES | Kenyan Shilling |
| QC | Quality Check |
| LLM | Large Language Model |
| OTP | One-Time Password |
| SSO | Single Sign-On |
| ETA | Estimated Time of Arrival |

---

**End of Master Feature Specification**
