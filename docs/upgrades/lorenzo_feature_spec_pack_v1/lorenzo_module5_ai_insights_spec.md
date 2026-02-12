# Module 5 -- AI Insight & Recommendation Engine Feature Spec

**Document ID:** SPEC-M5-AI-INSIGHTS
**Module:** AI Insight & Recommendation Engine
**Version:** 1.0.0
**Status:** Draft
**Author:** Claude Opus 4.6 / AI Agents Plus
**Created:** 2026-02-12
**Last Updated:** 2026-02-12
**Maturity:** Partially Built -- Dashboard Intelligence Layer

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
22. [Appendix A: Full Data Pipeline Matrix](#appendix-a-full-data-pipeline-matrix)
23. [Appendix B: Agent Capability Catalog](#appendix-b-agent-capability-catalog)
24. [Appendix C: LLM Provider Configuration Reference](#appendix-c-llm-provider-configuration-reference)

---

## 1. Document Metadata

| Field | Value |
|---|---|
| Module Number | 5 |
| Module Name | AI Insight & Recommendation Engine |
| Parent System | Lorenzo Dry Cleaners Management System |
| Dependencies | Module 1 (Order Management), Module 2 (Driver & Logistics), Module 3 (Proximity Intelligence), Module 4 (Customer Preferences), Module 6 (Voucher & Loyalty) |
| Upstream Inputs | Orders, transactions, customers, deliveries, inventory, staff performance, branch metrics, feedback, transfers, vouchers -- all data from ALL other modules |
| Downstream Outputs | Director dashboard widgets, GM dashboard widgets, AI recommendations, automated insights, anomaly alerts, demand forecasts, executive reports, audit logs |
| Primary Firestore Collections | `orders`, `transactions`, `customers`, `deliveries`, `branches`, `employees`, `feedback`, `inventory`, `transfers`, `auditLogs`, `system_config`, `approval_requests`, NEW: `aiInsights`, `aiRecommendations`, `analyticsSnapshots`, `insightSchedules` |
| Primary Source Files | `lib/agents/`, `lib/llm/`, `lib/db/server/analytics-db.ts`, `lib/db/gm-dashboard.ts`, `lib/db/performance.ts`, `lib/db/audit-logs.ts`, `lib/reports/`, `lib/workflows/approval.ts` |
| Frontend Component Directories | `components/features/director/`, `components/dashboard/gm/`, `components/dashboard/` |
| API Route Directories | `app/api/agents/`, `app/api/analytics/`, `app/api/director/` |

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | 2026-02-12 | Claude Opus 4.6 | Initial comprehensive specification |

---

## 2. Executive Summary

The AI Insight & Recommendation Engine is the **dashboard intelligence layer** for the Lorenzo Dry Cleaners Management System. It is unique among all modules in that it **consumes data from every other module** (M1 through M4, M6) and **outputs to every management dashboard** in the system. Its purpose is to transform raw operational data into actionable intelligence through AI-powered analytics, predictions, recommendations, and anomaly detection.

### Current State (Partially Built)

The existing foundation is substantial:

- **8 AI Agents** -- A multi-agent system with orchestrator, order, customer, pricing, support, analytics, onboarding, and logistics agents, all extending a common `BaseAgent` abstract class with capability-based authorization
- **Multi-LLM Infrastructure** -- A provider-agnostic LLM client supporting OpenAI, Anthropic, Google, and local models with automatic fallback chain, rate-limit handling, and per-agent/per-function model assignment configured through admin UI
- **Director Dashboard** -- 20+ widget components providing executive-level intelligence including KPI cards, predictive performance charts, key drivers analysis, branch comparison, revenue trends, risk radar, AI recommendations, operational health, and executive narrative
- **GM Operations Dashboard** -- Real-time dashboard with Firestore `onSnapshot` listeners delivering 1-2 second update latency for order count, revenue, live order queue, and daily stats, plus polled data for turnaround, staff, equipment, issues, branches, and satisfaction
- **Server-Side Analytics** -- Firebase Admin SDK-powered analytics database (`analytics-db.ts`) providing transaction totals, order counts, pipeline stats, top customers, branch performance, staff metrics, delivery counts, and satisfaction metrics
- **Approval Workflow System** -- Multi-tier approval engine supporting 7 approval types (voucher, cash_out, disposal, discount, refund, price_override, credit_extension) with configurable tier escalation, amount thresholds, expiry, and notification channels
- **Audit Logging** -- Comprehensive audit trail with action/resource/user tracking, before/after snapshots, cross-branch logging, and query capabilities by resource, branch, user, and action type
- **Report Export** -- PDF (jsPDF) and Excel (xlsx) export for payment reports with formatted timestamps, currency, and payment method labels

### What Needs to Be Built (New)

- **Automated Insight Generation** -- Scheduled daily pipeline (6 AM EAT) that collects data from all modules, runs AI analysis, and produces categorized insights with severity, confidence, and expiration
- **Recommendation Engine with Approval Workflow** -- AI-generated recommendations with expected impact, estimated effort, tiered approval routing (operational to GM, strategic to director), implementation tracking, and actual-impact measurement
- **Predictive Analytics / Demand Forecasting** -- Exponential smoothing with day-of-week and monthly seasonality, confidence intervals, and automated alerts when forecasts deviate significantly from actuals
- **Anomaly Detection** -- Rolling 30-day baseline with 2-sigma warning and 3-sigma critical thresholds across revenue, order volume, delivery performance, and customer metrics
- **Impact Tracking** -- Closed-loop measurement of recommendation outcomes comparing predicted vs actual impact with ROI calculation
- **Consolidated Insights Page** -- A single `/director/insights` page that absorbs the currently orphaned `/director/ai-lab`, `/director/risk`, and `/director/intelligence` pages into a unified intelligence command center
- **Analytics Snapshot System** -- Periodic metric capture for historical trend analysis and baseline computation, stored in a dedicated `analyticsSnapshots` collection

---

## 3. Existing Foundation

### 3.1 AI Agent System

The multi-agent architecture is located under `lib/agents/` and consists of the following files:

| File Path | Agent | Description |
|---|---|---|
| `lib/agents/base-agent.ts` | `BaseAgent` (abstract) | Abstract base class providing request processing, capability matching, authorization checking, parameter validation, response formatting, and utility methods (currency/date formatting). All agents extend this class. |
| `lib/agents/orchestrator-agent.ts` | `OrchestratorAgent` | Main conversational agent using OpenAI for natural language understanding. Routes to specialist agents based on classified intent. Manages conversation history (in-memory Map). Handles 15+ intent types including ORDER_TRACKING, PRICING, SERVICES, SCHEDULE_PICKUP, PICKUP_STATUS, CANCEL_PICKUP. Falls back to pattern-based responses when OpenAI is unavailable. |
| `lib/agents/analytics-agent.ts` | `AnalyticsAgent` | Business analytics specialist for executives and managers. Provides 9 capabilities: `getRevenueAnalytics`, `getOrderAnalytics`, `getCustomerAnalytics`, `getStaffPerformance`, `getBranchComparison`, `getDriverAnalytics`, `getTrendAnalysis`, `getNaturalLanguageQuery`, `getDashboardSummary`. Uses server-side analytics-db functions. Supports branch-scoped access with executive override. Classifies business queries into 9 intent categories (ANALYTICS_REVENUE, ANALYTICS_ORDERS, ANALYTICS_CUSTOMERS, ANALYTICS_STAFF, ANALYTICS_BRANCH, ANALYTICS_DELIVERY, ANALYTICS_TREND, ANALYTICS_FORECAST, ANALYTICS_GENERAL). |
| `lib/agents/order-agent.ts` | `OrderAgent` | Order management specialist handling order status, history, and details |
| `lib/agents/customer-agent.ts` | `CustomerAgent` | Customer profile and history management |
| `lib/agents/pricing-agent.ts` | `PricingAgent` | Service pricing, quotes, and promotions |
| `lib/agents/support-agent.ts` | `SupportAgent` | Customer support, complaints, and escalation |
| `lib/agents/onboarding-agent.ts` | `OnboardingAgent` | Customer registration and verification |
| `lib/agents/logistics-agent.ts` | `LogisticsAgent` | Pickup scheduling, delivery tracking, slot management |
| `lib/agents/openai-service.ts` | OpenAI Service | LLM integration for natural language understanding. Supports configurable LLM client (via `USE_CONFIGURABLE_LLM` env flag) or direct OpenAI. Provides `generateResponse`, `generateDataResponse`, `classifyIntent`, `getFallbackResponse`, `isOpenAIConfigured`. Contains "Melvin" persona context for customer-facing chatbot. |
| `lib/agents/agent-router.ts` | `AgentRouter` | Singleton router for directing requests to agents. Handles registration, validation, routing, and capability discovery. |
| `lib/agents/types.ts` | Type Definitions | Defines `AgentName` (9 agents), `AgentSource` (4 sources), `UserType`, `StaffRole` (9 roles), `AgentAuth`, `AgentRequest`, `AgentResponse`, `ChatMessage`, `AgentInteraction`, `ChatConversation`, `Intent` (35 intents), `AgentCapability`, plus helper functions `generateRequestId`, `hasStaffAccess`, `hasManagementAccess`, `canAccessBranch`. |
| `lib/agents/index.ts` | Module Entry | Central export and initialization. `initializeAgents()` registers all 8 agents with the router. Provides `sendToAgent` convenience wrapper. |

### 3.2 Multi-LLM Infrastructure

The LLM abstraction layer is located under `lib/llm/` and provides provider-agnostic AI operations:

| File Path | Component | Description |
|---|---|---|
| `lib/llm/llm-client.ts` | `LLMClient` | Unified client that selects provider based on configuration. Supports `chatCompletion(agentType, agentFunction, messages, options)` with automatic model selection via `getModelForRequest()`. Implements fallback chain on rate limit (iterates `globalConfig.fallbackOrder`, skipping failed provider). Provides `chatCompletionWithProvider()` for direct provider access and `isProviderAvailable()` for health checks. Exports convenience functions `complete()` and `ask()`. |
| `lib/llm/types.ts` | Type Definitions | Defines `ChatRole`, `ChatMessage`, `ChatCompletionOptions` (temperature, maxTokens, stopSequences, topP, frequencyPenalty, presencePenalty), `ChatCompletionResponse` (content, finishReason, usage, model, provider), `ChatCompletionChunk`, `LLMRequestContext`, `ProviderClientConfig`. Error classes: `LLMError`, `RateLimitError` (with retryAfterMs), `AuthenticationError`. Interface: `LLMProviderInterface` with `chatCompletion`, optional `streamChatCompletion`, and `isAvailable`. |
| `lib/llm/providers/base-provider.ts` | `BaseProvider` | Abstract base implementing `LLMProviderInterface`. Provides `fetchWithTimeout` with configurable timeout (default 30s) and `parseErrorResponse`. Requires subclasses to implement `chatCompletion`, `isAvailable`, `getApiUrl`, `getHeaders`. |
| `lib/llm/providers/openai-provider.ts` | `OpenAIProvider` | OpenAI API implementation. Default base URL: `https://api.openai.com/v1`. Bearer token auth. |
| `lib/llm/providers/anthropic-provider.ts` | `AnthropicProvider` | Anthropic Claude API implementation. |
| `lib/llm/providers/google-provider.ts` | `GoogleProvider` | Google Gemini API implementation. |
| `lib/llm/providers/local-provider.ts` | `LocalProvider` | Local/self-hosted model support (e.g., Ollama, LM Studio). |

**Schema Types (from `lib/db/schema.ts`):**

- `LLMProvider`: `'openai' | 'anthropic' | 'google' | 'local'`
- `AgentFunction`: `'chat_response' | 'intent_classification' | 'data_response' | 'analytics_insights' | 'time_estimation'`
- `LLMAgentType`: `'orchestrator' | 'order' | 'pricing' | 'customer' | 'support' | 'onboarding' | 'logistics' | 'analytics'`
- `ProviderConfig`: Per-provider settings with encrypted API keys (AES-256-GCM), available models, connection status, and test history. Stored in `system_config/providers/{providerId}`.
- `ModelAssignment`: Per-agent/per-function model routing with priority, temperature, and maxTokens. Supports wildcard (`*`) for global defaults. Stored in `system_config/model_assignments/{assignmentId}`.
- `GlobalLLMConfig`: System-wide settings including `defaultProvider`, `defaultModel`, `enableFallback`, `fallbackOrder` (array of LLMProvider), `requestTimeoutMs`, `enableRequestLogging`, `maxRetries`, `rateLimitPerMinute`. Stored in `system_config/global/llm_settings`.

### 3.3 Director Dashboard Components

Located under `components/features/director/`, the following 20+ components form the director intelligence command:

| File Path | Component | Description |
|---|---|---|
| `components/features/director/InsightsHeader.tsx` | `InsightsHeader` | Dashboard header with title, branch selector, timeframe selector, and controls |
| `components/features/director/ExecutiveSummary.tsx` | `ExecutiveSummary` | 5 KPI cards: Total Revenue, Total Orders, Average Order Value, Customer Satisfaction, On-Time Delivery Rate. Each shows current value and % change vs previous period. Accepts `period` ('today'/'week'/'month'/'quarter'/'year') and `branchId`. Queries `orders` and `transactions` directly from Firestore. |
| `components/features/director/ExecutiveNarrative.tsx` | `ExecutiveNarrative` | AI-generated morning briefing. Computes business health score, revenue performance vs forecast (from `companySettings` branch config targets), highlights key wins (teal) and areas needing attention (gold). Uses `NarrativeMetrics` including revenue, revenueTarget, revenueChangePercent, orderCount, customerRetention, avgOrderValue, onTimeDelivery, premiumServiceRate, healthScore. |
| `components/features/director/DirectorKPICards.tsx` | `DirectorKPICards` | 4 KPI cards: Revenue (KES X.XM), Operating Margin, Customer Retention (repeat/total), Avg Order Value. Real-time via `onSnapshot` listeners. Styled with teal gradient cards, JetBrains Mono for numbers, change indicators (green positive, gold warning). |
| `components/features/director/DirectorStatsGrid.tsx` | `DirectorStatsGrid` | Stats grid showing: Today's Orders, Today's Revenue, Active Deliveries, Inventory Alerts, Open Transfers. Each stat has a drill-down modal with breakdowns (OrdersBreakdownContent, RevenueBreakdownContent, DeliveriesBreakdownContent, InventoryBreakdownContent, TransfersBreakdownContent). |
| `components/features/director/PredictivePerformanceChart.tsx` | `PredictivePerformanceChart` | SVG bar chart showing 6 months of revenue: 3 historical (solid teal gradient bars) + 3 projected (semi-transparent teal bars). Features: gold goal line, confidence corridor (shaded purple area for projections), trajectory line (dashed teal connecting projection points). Queries `transactions` collection for historical data and computes projections with growth factor. |
| `components/features/director/KeyDriversChart.tsx` | `KeyDriversChart` | Horizontal waterfall-style bar chart. Positive drivers: teal gradient, left-aligned. Negative drivers: red gradient, right-aligned. Values in JetBrains Mono. Bar width proportional to absolute value. Computes drivers from transactions and orders data comparing current vs previous period. |
| `components/features/director/BranchComparison.tsx` | `BranchComparison` | Sortable comparison table across all branches. Columns: Name, Revenue, Orders, Avg Processing Time, Quality Score, Trend. Color-coded performance indicators. Supports sorting by any column (ascending/descending). Uses `getActiveBranches()` plus per-branch order/transaction queries. |
| `components/features/director/RevenueTrends.tsx` | `RevenueTrends` | Multi-line area chart using Recharts (`AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`). Shows revenue and order trends over time. Supports daily/weekly/monthly granularity toggle. |
| `components/features/director/OperationalHealth.tsx` | `OperationalHealth` | Real-time operational status panel: Pipeline status summary (received, processing, queued_for_delivery, out_for_delivery), capacity utilization gauge, delayed orders count with alerts, active staff and drivers count. Quick action buttons linking to pipeline and delivery pages. |
| `components/features/director/RiskRadar.tsx` | `RiskRadar` | "Watchlist (Anomalies & Risks)" panel. Detects: Delayed Orders (past estimatedCompletion), Walk-in Decline (week-over-week order drop >15%), Equipment/Capacity Issues (processing >80% capacity), Payment Overdue (pending payments older than 7 days). Each risk has severity (medium/high), category, and metadata. |
| `components/features/director/AIRecommendations.tsx` | `AIRecommendations` | AI-generated recommendations panel. Types: opportunity, optimization, risk. Each has title, description, impact statement, priority (high/medium/low), and action buttons. Fetches from `/api/director/recommendations` API. Falls back to hardcoded recommendations when API unavailable. Data source indicator: 'ai' or 'rule-based'. |
| `components/features/director/DirectorSearchModal.tsx` | `DirectorSearchModal` | Global search modal for the director dashboard |
| `components/features/director/StatBreakdownModal.tsx` | `StatBreakdownModal` | Modal for drilling down into individual stats |
| `components/features/director/DirectorFooter.tsx` | `DirectorFooter` / `DirectorFooterInline` | Footer components for the director dashboard |
| `components/features/director/breakdowns/OrdersBreakdownContent.tsx` | `OrdersBreakdownContent` | Detailed orders breakdown for stat drill-down |
| `components/features/director/breakdowns/RevenueBreakdownContent.tsx` | `RevenueBreakdownContent` | Detailed revenue breakdown for stat drill-down |
| `components/features/director/breakdowns/DeliveriesBreakdownContent.tsx` | `DeliveriesBreakdownContent` | Detailed deliveries breakdown for stat drill-down |
| `components/features/director/breakdowns/InventoryBreakdownContent.tsx` | `InventoryBreakdownContent` | Detailed inventory breakdown for stat drill-down |
| `components/features/director/breakdowns/TransfersBreakdownContent.tsx` | `TransfersBreakdownContent` | Detailed transfers breakdown for stat drill-down |

### 3.4 GM Operations Dashboard

Located under `components/dashboard/`:

| File Path | Component | Description |
|---|---|---|
| `components/dashboard/GMOperationsDashboard.tsx` | `GMOperationsDashboard` | Main GM dashboard container. Dark glassmorphism theme (`#0A1A1F` to `#0D2329`) with toggle to light theme. Branch filter, search. Uses `useGMDashboard` hook. Renders: `GMDashboardHeader`, `GMMetricsRow`, `GMLiveOrderQueue`, `GMBranchPerformance`, `GMEquipmentStatus`, `GMWeatherWidget`, `GMUrgentIssues`, `GMStaffOnDuty`, `GMQuickActions`. |
| `hooks/useRealTimeGMDashboard.ts` | `useRealTimeGMDashboard` | Real-time hook using Firestore `onSnapshot` listeners. Real-time (1-2s latency): order count, revenue, live orders queue, daily stats, new order toast notifications. Polled (30s-5min): turnaround metrics, staff on duty, equipment status, urgent issues, branch performance, satisfaction metrics. Exports lightweight hooks: `useRealTimeOrderCount`, `useRealTimeRevenue`, `useRealTimeLiveOrders`. |

### 3.5 Server-Side Analytics Database

| File Path | Description |
|---|---|
| `lib/db/server/analytics-db.ts` | Firebase Admin SDK analytics functions. Provides: `getTransactionTotalsServer(startDate, endDate)` returning total, count, byMethod (mpesa/card/credit/cash); `getTodayTransactionSummaryServer()`; `getTodayOrdersCountServer(branchIds?)` and `getCompletedTodayCountServer(branchIds?)`; `getTodayRevenueServer(branchIds?)`; `getPipelineStatsServer(branchId)` returning counts per status (received through out_for_delivery); `getTopCustomersServer(limit)` returning customerId, name, totalSpent, orderCount sorted by totalSpent desc; `getBranchPerformanceServer(branchId?)` computing per-branch revenue, ordersToday, and efficiency (completed/total * 100); `getTopPerformersServer(branchId, limit)` returning employeeId, employeeName, metrics (overallScore, ordersProcessed, avgProcessingTime), rank; `getDeliveriesCountServer(branchIds?, status?)`; `getSatisfactionMetricsServer(branchId?)` returning score, totalReviews, breakdown (excellent/good/average/poor). |

### 3.6 Approval Workflow System

| File Path | Description |
|---|---|
| `lib/workflows/approval.ts` | Multi-tier approval system. Types: `ApprovalType` = voucher, cash_out, disposal, discount, refund, price_override, credit_extension. Statuses: pending, approved, rejected, escalated, expired. Tiers: manager, general_manager, director, admin. Each type has `WorkflowConfig` with display name, required tiers, optional amount thresholds for escalation, default expiry hours, auto-expire flag, and notification channels. Role-to-tier mapping covers all 14 user roles. Functions: `createApprovalRequest`, `approveRequest`, `rejectRequest`, `escalateRequest`, `addComment`, `getPendingApprovalsForUser`, `getApprovalsByType`, `getApprovalRequest`, `expirePendingRequests`, `getApprovalStats`. |

### 3.7 Audit Logging

| File Path | Description |
|---|---|
| `lib/db/audit-logs.ts` | Comprehensive audit trail. Actions: create, update, delete, transfer, approve, reject, role_change, branch_access_change, permission_change. Per entry: auditLogId, action, resourceType, resourceId, performedBy (uid + name + role), branchId, additionalBranchIds, description, changes (before/after), ipAddress, userAgent, timestamp. Convenience functions: `logOrderCreated`, `logOrderUpdated`, `logInventoryTransfer`, `logRoleChange`, `logBranchAccessChange`, `logCrossBranchAction`. Query functions: `getAuditLogsByResource`, `getAuditLogsByBranch`, `getAuditLogsByUser`, `getRecentAuditLogs`, `getCrossBranchAuditLogs`. |

### 3.8 Report Export

| File Path | Description |
|---|---|
| `lib/reports/export-pdf.ts` | PDF export using jsPDF. `ExportTransaction` interface with customerName, branchName. `PDFExportOptions` with filename, title, dateRange, branchName, showSummary. Formats timestamps, currency (KES), and payment methods (M-Pesa, Card, Cash, Credit, Store Credit). |
| `lib/reports/export-excel.ts` | Excel export using xlsx library. `ExcelExportOptions` with filename, sheetName, includeSummary, dateFormat. Same formatting utilities as PDF export. |

### 3.9 Director Dashboard Pages (Existing Routes)

The following pages exist under `app/(dashboard)/director/`:

| Route | File Path | Description |
|---|---|---|
| `/director/insights` | `app/(dashboard)/director/insights/page.tsx` | Main director insights dashboard |
| `/director/ai-lab` | `app/(dashboard)/director/ai-lab/page.tsx` | AI experimentation page (orphaned) |
| `/director/risk` | `app/(dashboard)/director/risk/page.tsx` | Risk analysis page (orphaned) |
| `/director/intelligence` | `app/(dashboard)/director/intelligence/page.tsx` | Business intelligence page (orphaned) |
| `/director/board` | `app/(dashboard)/director/board/page.tsx` | Director board overview |
| `/director/branches` | `app/(dashboard)/director/branches/page.tsx` | Branch management |
| `/director/branches/[branchId]` | `app/(dashboard)/director/branches/[branchId]/page.tsx` | Individual branch view |
| `/director/approvals` | `app/(dashboard)/director/approvals/page.tsx` | Approval queue |
| `/director/financial` | `app/(dashboard)/director/financial/page.tsx` | Financial overview |
| `/director/financials` | `app/(dashboard)/director/financials/page.tsx` | Detailed financials |
| `/director/growth` | `app/(dashboard)/director/growth/page.tsx` | Growth metrics |
| `/director/leadership` | `app/(dashboard)/director/leadership/page.tsx` | Leadership dashboard |
| `/director/performance` | `app/(dashboard)/director/performance/page.tsx` | Performance analytics |
| `/director/quality` | `app/(dashboard)/director/quality/page.tsx` | Quality metrics |
| `/director/reports` | `app/(dashboard)/director/reports/page.tsx` | Report generation |
| `/director/staff` | `app/(dashboard)/director/staff/page.tsx` | Staff management |

### 3.10 GM Dashboard Pages (Existing Routes)

| Route | File Path |
|---|---|
| `/gm/equipment` | `app/(dashboard)/gm/equipment/page.tsx` |
| `/gm/orders` | `app/(dashboard)/gm/orders/page.tsx` |
| `/gm/performance` | `app/(dashboard)/gm/performance/page.tsx` |
| `/gm/requests` | `app/(dashboard)/gm/requests/page.tsx` |
| `/gm/staff` | `app/(dashboard)/gm/staff/page.tsx` |

---

## 4. Requirements

### 4.1 Director Dashboard Intelligence [EXISTING -- Document & Enhance]

**FR-M5-001**: The system SHALL display an `ExecutiveSummary` component showing 5 KPI cards (Total Revenue, Total Orders, Average Order Value, Customer Satisfaction, On-Time Delivery Rate) with period-over-period change percentages.
**Status:** EXISTING -- `components/features/director/ExecutiveSummary.tsx`

**FR-M5-002**: The system SHALL display a `DirectorKPICards` component showing 4 real-time KPI cards (Revenue, Operating Margin, Customer Retention, Avg Order Value) using Firestore `onSnapshot` listeners for instant updates.
**Status:** EXISTING -- `components/features/director/DirectorKPICards.tsx`

**FR-M5-003**: The system SHALL display an `ExecutiveNarrative` component generating a morning briefing with business health score (0-100), revenue performance vs target, key wins (highlighted teal), and areas needing attention (highlighted gold).
**Status:** EXISTING -- `components/features/director/ExecutiveNarrative.tsx`

**FR-M5-004**: The system SHALL display a `PredictivePerformanceChart` showing 3 months of historical revenue (solid bars) and 3 months of projected revenue (semi-transparent bars) with goal line and confidence corridor.
**Status:** EXISTING -- `components/features/director/PredictivePerformanceChart.tsx`

**FR-M5-005**: The system SHALL display a `KeyDriversChart` with horizontal waterfall-style bars showing positive drivers (teal) and negative drivers (red) with proportional bar widths.
**Status:** EXISTING -- `components/features/director/KeyDriversChart.tsx`

**FR-M5-006**: The system SHALL display a `BranchComparison` table with sortable columns (Name, Revenue, Orders, Avg Processing Time, Quality Score, Trend) and color-coded performance indicators.
**Status:** EXISTING -- `components/features/director/BranchComparison.tsx`

**FR-M5-007**: The system SHALL display a `RevenueTrends` area chart using Recharts with daily/weekly/monthly granularity toggle showing revenue and order trends over time.
**Status:** EXISTING -- `components/features/director/RevenueTrends.tsx`

**FR-M5-008**: The system SHALL display an `OperationalHealth` panel showing pipeline status summary, capacity utilization gauge, delayed orders count, and active staff/driver counts.
**Status:** EXISTING -- `components/features/director/OperationalHealth.tsx`

**FR-M5-009**: The system SHALL display a `RiskRadar` panel detecting and showing: Delayed Orders, Walk-in Decline (>15% WoW drop), Equipment/Capacity Issues (>80%), and Payment Overdue (>7 days) with severity classification.
**Status:** EXISTING -- `components/features/director/RiskRadar.tsx`

**FR-M5-010**: The system SHALL display an `AIRecommendations` panel showing AI-generated recommendations of types: opportunity, optimization, and risk, each with title, description, impact statement, priority, and action buttons.
**Status:** EXISTING -- `components/features/director/AIRecommendations.tsx`

**FR-M5-011**: The system SHALL display a `DirectorStatsGrid` with drill-down modals for Today's Orders, Today's Revenue, Active Deliveries, Inventory Alerts, and Open Transfers.
**Status:** EXISTING -- `components/features/director/DirectorStatsGrid.tsx`

### 4.2 GM Dashboard Intelligence [EXISTING -- Document]

**FR-M5-012**: The GM dashboard SHALL display real-time order count, revenue, and live order queue with 1-2 second update latency via Firestore `onSnapshot` listeners.
**Status:** EXISTING -- `hooks/useRealTimeGMDashboard.ts`, `components/dashboard/GMOperationsDashboard.tsx`

**FR-M5-013**: The GM dashboard SHALL display polled data including turnaround metrics (2 min), staff on duty (1 min), equipment status (2 min), urgent issues (30 sec), branch performance (1 min), and satisfaction metrics (5 min).
**Status:** EXISTING -- `hooks/useRealTimeGMDashboard.ts`

**FR-M5-014**: The GM dashboard SHALL display toast notifications for new orders with order ID, customer name, and item count.
**Status:** EXISTING -- `hooks/useRealTimeGMDashboard.ts`

**FR-M5-015**: The GM dashboard SHALL support dark glassmorphism and light theme toggle with localStorage persistence.
**Status:** EXISTING -- `components/dashboard/GMOperationsDashboard.tsx`

### 4.3 AI Agent System [EXISTING -- Document & Enhance]

**FR-M5-016**: The system SHALL provide an `AnalyticsAgent` with 9 capabilities: `getRevenueAnalytics`, `getOrderAnalytics`, `getCustomerAnalytics`, `getStaffPerformance`, `getBranchComparison`, `getDriverAnalytics`, `getTrendAnalysis`, `getNaturalLanguageQuery`, `getDashboardSummary`.
**Status:** EXISTING -- `lib/agents/analytics-agent.ts`

**FR-M5-017**: The `getNaturalLanguageQuery` capability SHALL classify business queries into 9 intent categories and fetch relevant data based on intent, then generate an AI narrative response via the configured LLM provider.
**Status:** EXISTING -- `lib/agents/analytics-agent.ts`

**FR-M5-018**: The system SHALL support multi-LLM operations with automatic provider selection based on `ModelAssignment` configuration, per-agent/per-function model routing, and configurable fallback chain (OpenAI -> Anthropic -> Google -> Local).
**Status:** EXISTING -- `lib/llm/llm-client.ts`, `lib/llm/providers/`

### 4.4 Automated Insight Generation [NEW]

**FR-M5-019**: The system SHALL run an automated insight generation pipeline daily at 06:00 EAT (East Africa Time) that:
1. Collects data snapshots from all source modules (orders, transactions, customers, deliveries, inventory, staff, branches, feedback)
2. Computes period-over-period comparisons (today vs yesterday, this week vs last week, this month vs last month)
3. Runs anomaly detection against 30-day rolling baselines
4. Generates AI-powered narrative insights via the configured LLM provider
5. Stores insights in the `aiInsights` collection with severity, confidence, category, and expiration

**FR-M5-020**: Insights SHALL be categorized into the following types:
- `revenue_insight` -- Revenue trends, anomalies, and opportunities
- `order_insight` -- Order volume, pipeline health, and turnaround patterns
- `customer_insight` -- Retention, churn risk, acquisition, and segment shifts
- `delivery_insight` -- Delivery performance, driver efficiency, and route optimization opportunities
- `staff_insight` -- Staff performance trends, productivity anomalies, and scheduling recommendations
- `branch_insight` -- Branch comparison insights, underperformance alerts, and capacity issues
- `inventory_insight` -- Stock level warnings, consumption pattern changes, and cost optimization
- `financial_insight` -- Payment method shifts, outstanding balance alerts, and margin analysis

**FR-M5-021**: Each generated insight SHALL include:
- Unique `insightId` (format: `INS-YYYYMMDD-XXXXXX`)
- `type` (from FR-M5-020 categories)
- `severity`: `info` | `warning` | `critical`
- `confidence`: 0.0 to 1.0 (model confidence score)
- `title`: Human-readable headline (max 120 characters)
- `description`: Detailed explanation with specific numbers and context (max 1000 characters)
- `dataPoints`: Array of supporting data points with labels and values
- `affectedBranches`: Array of branchIds this insight applies to (empty = all branches)
- `generatedBy`: Agent/pipeline identifier
- `generatedAt`: Timestamp
- `expiresAt`: Timestamp (default 72 hours from generation)
- `status`: `generated` | `active` | `acknowledged` | `dismissed` | `expired`

**FR-M5-022**: The system SHALL support on-demand insight generation triggered by authorized users (director, admin) via the `/director/insights` page with a "Generate Now" button.

**FR-M5-023**: Insights with severity `critical` SHALL trigger immediate notifications via in-app notification, email (Resend), and optionally WhatsApp (Wati.io) to the appropriate role holders (director for cross-branch, GM for branch-specific).

### 4.5 Recommendation Engine [NEW]

**FR-M5-024**: The system SHALL generate actionable recommendations based on insights, each containing:
- Unique `recommendationId` (format: `REC-YYYYMMDD-XXXXXX`)
- `insightId`: Reference to the triggering insight (nullable for standalone recommendations)
- `type`: `operational` | `strategic` | `financial` | `staffing` | `marketing`
- `title`: Human-readable title (max 120 characters)
- `description`: Detailed recommendation with rationale (max 2000 characters)
- `expectedImpact`: Structured impact prediction with `metric` (e.g., "revenue", "orders", "retention"), `direction` ("increase" | "decrease"), `magnitude` (percentage or absolute), and `timeframe` (days)
- `estimatedEffort`: `low` | `medium` | `high`
- `estimatedCost`: Optional KES amount for implementation
- `status`: `generated` | `pending_review` | `pending_approval` | `approved` | `rejected` | `implementing` | `implemented` | `tracking` | `completed` | `cancelled`
- `approvalTier`: `general_manager` | `director` (determined by recommendation type)
- `approvedBy`: User ID of approver
- `approvedAt`: Timestamp
- `implementedAt`: Timestamp
- `actualImpact`: Measured actual impact (same structure as expectedImpact)
- `impactMeasuredAt`: Timestamp when actual impact was measured
- `tags`: Array of string tags for categorization and search

**FR-M5-025**: Recommendation approval SHALL follow the existing approval workflow pattern (`lib/workflows/approval.ts`):
- `operational` recommendations route to the **General Manager** for approval
- `strategic` and `financial` recommendations route to the **Director** for approval
- `staffing` recommendations route to the **General Manager** first; if value exceeds KES 50,000, escalate to **Director**
- `marketing` recommendations route to the **Director** for approval

**FR-M5-026**: When a recommendation is approved and implemented, the system SHALL begin tracking actual impact metrics for the specified `timeframe` period, then compute the variance between `expectedImpact` and `actualImpact` and generate a follow-up insight documenting the result.

### 4.6 Predictive Analytics / Demand Forecasting [NEW]

**FR-M5-027**: The system SHALL compute demand forecasts using exponential smoothing with:
- **Base model**: Simple exponential smoothing (alpha = 0.3) on daily order volume
- **Day-of-week seasonality**: Multiplicative seasonal factors computed from 90-day history (Mon-Sun)
- **Monthly seasonality**: Multiplicative monthly factors computed from 12-month history
- **Confidence intervals**: 80% and 95% prediction intervals based on historical forecast error variance
- **Forecast horizon**: 14 days rolling forecast updated daily

**FR-M5-028**: The demand forecast SHALL be displayed in the `/director/insights` page as a `DemandForecastChart` component showing:
- Actual daily order volume (solid line, past 30 days)
- Forecasted daily order volume (dashed line, next 14 days)
- 80% confidence band (light shaded area)
- 95% confidence band (lighter shaded area)
- Day-of-week labels on x-axis
- Hover tooltip with exact values and confidence ranges

**FR-M5-029**: The system SHALL generate automatic alerts when actual daily order volume deviates from the forecast by more than 2 standard deviations (warning) or 3 standard deviations (critical).

**FR-M5-030**: Branch-level demand forecasts SHALL be available when a specific branch is selected, using branch-specific historical data for seasonal factor computation.

### 4.7 Anomaly Detection [NEW]

**FR-M5-031**: The system SHALL maintain a rolling 30-day baseline for the following metrics and detect anomalies using statistical thresholds:

| Metric | Source Collection | Baseline | Warning (2 sigma) | Critical (3 sigma) |
|---|---|---|---|---|
| Daily Revenue | `transactions` | 30-day rolling mean and std dev | > 2 sigma deviation | > 3 sigma deviation |
| Daily Order Volume | `orders` | 30-day rolling mean and std dev | > 2 sigma deviation | > 3 sigma deviation |
| Completion Rate | `orders` (completed/total) | 30-day rolling mean | < 2 sigma below mean | < 3 sigma below mean |
| On-Time Delivery Rate | `deliveries` | 30-day rolling mean | < 2 sigma below mean | < 3 sigma below mean |
| Average Order Value | `orders` (totalAmount/count) | 30-day rolling mean and std dev | > 2 sigma deviation | > 3 sigma deviation |
| Customer Acquisition | `customers` (new/day) | 30-day rolling mean | < 2 sigma below mean | < 3 sigma below mean |
| Rewash Rate | `orders` (rewash/total) | 30-day rolling mean | > 2 sigma above mean | > 3 sigma above mean |
| Staff Utilization | `employees` (active/total) | 30-day rolling mean | < 2 sigma below mean | < 3 sigma below mean |

**FR-M5-032**: Detected anomalies SHALL be represented as insights (type = relevant category + severity = warning or critical) and displayed in the `AnomalyAlertPanel` component on the `/director/insights` page.

**FR-M5-033**: The anomaly detection pipeline SHALL run hourly during business hours (07:00-21:00 EAT) and every 4 hours outside business hours.

### 4.8 Impact Tracking [NEW]

**FR-M5-034**: The system SHALL track the actual impact of implemented recommendations by:
1. Recording the baseline metric values at the time of implementation
2. Monitoring the target metric for the specified `timeframe` duration
3. Computing the actual change (absolute and percentage)
4. Comparing actual vs expected impact
5. Generating a follow-up insight with the result (positive: "Recommendation X exceeded expectations by Y%", negative: "Recommendation X fell short by Y%")

**FR-M5-035**: Impact tracking results SHALL be displayed in a `RecommendationImpactTracker` component showing:
- Recommendation title and original expected impact
- Progress bar showing elapsed time vs total timeframe
- Current actual impact vs expected (color-coded: green if on track, amber if behind, red if significantly behind)
- Final result summary when tracking period completes

**FR-M5-036**: A cumulative impact dashboard SHALL show total ROI of all implemented recommendations over the past 30/60/90 days.

### 4.9 Executive Reporting [ENHANCE]

**FR-M5-037**: The system SHALL generate automated executive summary reports (PDF and Excel) containing:
- Period KPI summary (revenue, orders, AOV, retention, delivery rate)
- Top 3 insights of the period with severity and status
- Active recommendations and their current status
- Anomalies detected and resolution status
- Branch performance rankings
- Demand forecast for the next 14 days
- Cumulative recommendation impact summary

**FR-M5-038**: Executive reports SHALL be available on-demand via the `/director/reports` page and optionally scheduled for automatic generation and email delivery (weekly on Monday 06:00 EAT, monthly on 1st of month 06:00 EAT).

**FR-M5-039**: The system SHALL extend existing PDF export (`lib/reports/export-pdf.ts`) and Excel export (`lib/reports/export-excel.ts`) to support insight and recommendation data alongside transaction data.

### 4.10 Analytics Snapshot System [NEW]

**FR-M5-040**: The system SHALL capture periodic analytics snapshots stored in the `analyticsSnapshots` collection for historical trend analysis:
- **Hourly** (during business hours): order count, revenue, pipeline distribution
- **Daily** (at 23:59 EAT): Full metric snapshot including all anomaly detection metrics, per-branch breakdowns, top customers, staff performance summaries
- **Weekly** (Sunday 23:59 EAT): Aggregated weekly summary with week-over-week comparisons
- **Monthly** (last day of month 23:59 EAT): Monthly aggregate with month-over-month and year-over-year comparisons

**FR-M5-041**: Snapshots SHALL be used by the anomaly detection pipeline for baseline computation and by the demand forecasting system for seasonal factor calculation.

**FR-M5-042**: Snapshots older than 24 months SHALL be automatically archived (moved to a cold storage collection `analyticsSnapshotsArchive`) to manage Firestore document volume.

---

## 5. Data Model

### 5.1 New Collections

#### `aiInsights` Collection

```typescript
interface AIInsight {
  /** Unique insight ID. Format: INS-YYYYMMDD-XXXXXX */
  insightId: string;
  /** Insight type/category */
  type: InsightType;
  /** Severity level */
  severity: 'info' | 'warning' | 'critical';
  /** Model confidence score (0.0 - 1.0) */
  confidence: number;
  /** Human-readable headline (max 120 chars) */
  title: string;
  /** Detailed explanation with numbers and context (max 1000 chars) */
  description: string;
  /** Supporting data points */
  dataPoints: InsightDataPoint[];
  /** Branch IDs this applies to (empty = all) */
  affectedBranches: string[];
  /** Agent or pipeline that generated this */
  generatedBy: string;
  /** When this insight was generated */
  generatedAt: Timestamp;
  /** When this insight expires */
  expiresAt: Timestamp;
  /** Current lifecycle status */
  status: InsightStatus;
  /** User who acknowledged/dismissed (if applicable) */
  statusChangedBy?: string;
  /** When status was last changed */
  statusChangedAt?: Timestamp;
  /** Related recommendation IDs (if any were generated from this insight) */
  relatedRecommendationIds: string[];
  /** Source module that the data primarily came from */
  sourceModule: 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'cross-module';
  /** Period this insight covers */
  period: {
    start: Timestamp;
    end: Timestamp;
    label: string; // e.g., "Today", "This Week", "February 2026"
  };
  /** Tags for search and categorization */
  tags: string[];
}

type InsightType =
  | 'revenue_insight'
  | 'order_insight'
  | 'customer_insight'
  | 'delivery_insight'
  | 'staff_insight'
  | 'branch_insight'
  | 'inventory_insight'
  | 'financial_insight'
  | 'anomaly_alert'
  | 'forecast_deviation'
  | 'recommendation_result';

type InsightStatus = 'generated' | 'active' | 'acknowledged' | 'dismissed' | 'expired';

interface InsightDataPoint {
  /** Display label */
  label: string;
  /** Current value */
  value: number | string;
  /** Previous/comparison value */
  previousValue?: number | string;
  /** Change percentage */
  changePercent?: number;
  /** Unit (e.g., "KES", "%", "orders", "minutes") */
  unit: string;
  /** Whether this change is positive for the business */
  isPositive?: boolean;
}
```

#### `aiRecommendations` Collection

```typescript
interface AIRecommendation {
  /** Unique recommendation ID. Format: REC-YYYYMMDD-XXXXXX */
  recommendationId: string;
  /** Reference to triggering insight (nullable) */
  insightId?: string;
  /** Recommendation category */
  type: RecommendationType;
  /** Human-readable title (max 120 chars) */
  title: string;
  /** Detailed recommendation with rationale (max 2000 chars) */
  description: string;
  /** Structured impact prediction */
  expectedImpact: ImpactPrediction;
  /** Estimated implementation effort */
  estimatedEffort: 'low' | 'medium' | 'high';
  /** Optional estimated cost in KES */
  estimatedCost?: number;
  /** Current lifecycle status */
  status: RecommendationStatus;
  /** Required approval tier */
  approvalTier: 'general_manager' | 'director';
  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** Branch IDs this applies to (empty = all) */
  affectedBranches: string[];
  /** Who generated this recommendation */
  generatedBy: string;
  /** Generation timestamp */
  generatedAt: Timestamp;
  /** Reference to approval request (if submitted for approval) */
  approvalRequestId?: string;
  /** User who approved */
  approvedBy?: string;
  /** Approval timestamp */
  approvedAt?: Timestamp;
  /** Rejection reason (if rejected) */
  rejectionReason?: string;
  /** User who marked as implemented */
  implementedBy?: string;
  /** Implementation timestamp */
  implementedAt?: Timestamp;
  /** Implementation notes */
  implementationNotes?: string;
  /** Measured actual impact */
  actualImpact?: ImpactPrediction;
  /** When actual impact was measured */
  impactMeasuredAt?: Timestamp;
  /** Impact variance (actual - expected, as percentage) */
  impactVariance?: number;
  /** Tracking end date (implementedAt + timeframe) */
  trackingEndsAt?: Timestamp;
  /** Tags for search and categorization */
  tags: string[];
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
}

type RecommendationType = 'operational' | 'strategic' | 'financial' | 'staffing' | 'marketing';

type RecommendationStatus =
  | 'generated'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'implementing'
  | 'implemented'
  | 'tracking'
  | 'completed'
  | 'cancelled';

interface ImpactPrediction {
  /** Target metric name */
  metric: string;
  /** Expected direction */
  direction: 'increase' | 'decrease';
  /** Magnitude (percentage change or absolute value) */
  magnitude: number;
  /** Whether magnitude is percentage or absolute */
  magnitudeType: 'percentage' | 'absolute';
  /** Timeframe in days for this impact to materialize */
  timeframeDays: number;
  /** Baseline value at time of prediction/implementation */
  baselineValue?: number;
  /** Unit for display */
  unit: string;
}
```

#### `analyticsSnapshots` Collection

```typescript
interface AnalyticsSnapshot {
  /** Unique snapshot ID. Format: SNAP-YYYYMMDD-HH-XXXXXX */
  snapshotId: string;
  /** Snapshot granularity */
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  /** When this snapshot was captured */
  capturedAt: Timestamp;
  /** Period this snapshot covers */
  periodStart: Timestamp;
  periodEnd: Timestamp;
  /** Branch ID (null = all branches aggregate) */
  branchId: string | null;
  /** Revenue metrics */
  revenue: {
    total: number;
    byMethod: { mpesa: number; card: number; credit: number };
    transactionCount: number;
  };
  /** Order metrics */
  orders: {
    total: number;
    completed: number;
    completionRate: number;
    averageOrderValue: number;
    newCustomerOrders: number;
    returningCustomerOrders: number;
  };
  /** Pipeline distribution */
  pipeline: {
    received: number;
    inspection: number;
    queued: number;
    washing: number;
    drying: number;
    ironing: number;
    quality_check: number;
    packaging: number;
    queued_for_delivery: number;
    out_for_delivery: number;
  };
  /** Delivery metrics */
  delivery: {
    totalDeliveries: number;
    completedDeliveries: number;
    pendingDeliveries: number;
    onTimeRate: number;
    averageDeliveryTime: number; // minutes
  };
  /** Customer metrics */
  customers: {
    totalActive: number;
    newCustomers: number;
    returningCustomers: number;
    retentionRate: number;
    averageSatisfaction: number;
  };
  /** Staff metrics */
  staff: {
    totalOnDuty: number;
    averageUtilization: number;
    topPerformerScore: number;
  };
  /** Inventory summary (daily+ only) */
  inventory?: {
    lowStockAlerts: number;
    totalItemsTracked: number;
    totalInventoryValue: number;
  };
  /** Computed anomaly flags */
  anomalies: AnomalyFlag[];
}

interface AnomalyFlag {
  /** Metric that triggered the anomaly */
  metric: string;
  /** Observed value */
  observedValue: number;
  /** Expected baseline value (30-day mean) */
  expectedValue: number;
  /** Standard deviations from mean */
  sigmaDeviation: number;
  /** Anomaly severity */
  severity: 'warning' | 'critical';
}
```

#### `insightSchedules` Collection

```typescript
interface InsightSchedule {
  /** Unique schedule ID */
  scheduleId: string;
  /** Schedule name */
  name: string;
  /** Cron expression (e.g., "0 6 * * *" for daily at 6 AM) */
  cronExpression: string;
  /** Timezone (e.g., "Africa/Nairobi") */
  timezone: string;
  /** Types of insights to generate */
  insightTypes: InsightType[];
  /** Branch scope (empty = all branches) */
  branchScope: string[];
  /** Whether this schedule is active */
  enabled: boolean;
  /** Last successful execution */
  lastRunAt?: Timestamp;
  /** Last run status */
  lastRunStatus?: 'success' | 'partial_failure' | 'failure';
  /** Last run error (if any) */
  lastRunError?: string;
  /** Number of insights generated in last run */
  lastRunInsightCount?: number;
  /** Notification recipients for results */
  notifyRecipients: {
    role: string;
    channel: 'email' | 'in_app' | 'whatsapp';
  }[];
  /** Created by */
  createdBy: string;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}
```

### 5.2 Extended Schema Types

Add to `lib/db/schema.ts`:

```typescript
// ============================================
// AI INSIGHT & RECOMMENDATION TYPES (M5)
// ============================================

export type InsightType =
  | 'revenue_insight'
  | 'order_insight'
  | 'customer_insight'
  | 'delivery_insight'
  | 'staff_insight'
  | 'branch_insight'
  | 'inventory_insight'
  | 'financial_insight'
  | 'anomaly_alert'
  | 'forecast_deviation'
  | 'recommendation_result';

export type InsightStatus = 'generated' | 'active' | 'acknowledged' | 'dismissed' | 'expired';

export type RecommendationType = 'operational' | 'strategic' | 'financial' | 'staffing' | 'marketing';

export type RecommendationStatus =
  | 'generated'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'implementing'
  | 'implemented'
  | 'tracking'
  | 'completed'
  | 'cancelled';

export type SnapshotGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';
```

### 5.3 Firestore Indexes Required

```
// aiInsights
- status ASC, generatedAt DESC
- type ASC, status ASC, generatedAt DESC
- severity ASC, status ASC, generatedAt DESC
- affectedBranches ARRAY_CONTAINS, status ASC, generatedAt DESC

// aiRecommendations
- status ASC, generatedAt DESC
- type ASC, status ASC, generatedAt DESC
- approvalTier ASC, status ASC, generatedAt DESC
- affectedBranches ARRAY_CONTAINS, status ASC

// analyticsSnapshots
- granularity ASC, capturedAt DESC
- branchId ASC, granularity ASC, capturedAt DESC
- granularity ASC, branchId ASC, periodStart ASC, periodEnd ASC
```

---

## 6. State Machine / Workflows

### 6.1 Insight Lifecycle

```
                  ┌──────────────┐
                  │   generated  │  (Pipeline creates insight)
                  └──────┬───────┘
                         │ auto-transition (immediate)
                         v
                  ┌──────────────┐
         ┌────── │    active     │ ──────┐
         │       └──────┬───────┘        │
         │              │                │
    user action    user action     TTL expires
         │              │                │
         v              v                v
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ acknowledged │ │  dismissed   │ │   expired    │
  └──────────────┘ └──────────────┘ └──────────────┘
```

**Transitions:**
- `generated` -> `active`: Automatic, immediate after creation
- `active` -> `acknowledged`: User clicks "Acknowledge" (records userId)
- `active` -> `dismissed`: User clicks "Dismiss" (records userId and optional reason)
- `active` -> `expired`: System job runs when `expiresAt` < now

### 6.2 Recommendation Lifecycle

```
  ┌──────────────┐
  │  generated   │  (AI generates recommendation)
  └──────┬───────┘
         │ auto or manual
         v
  ┌──────────────┐
  │ pending_review│  (Visible to reviewers)
  └──────┬───────┘
         │ submit for approval
         v
  ┌──────────────┐
  │pending_approval│──────────┐
  └──────┬───────┘           │
         │                    │
    approved              rejected
         │                    │
         v                    v
  ┌──────────────┐    ┌──────────────┐
  │   approved   │    │   rejected   │
  └──────┬───────┘    └──────────────┘
         │
    mark implementing
         │
         v
  ┌──────────────┐
  │ implementing │
  └──────┬───────┘
         │
    mark implemented
         │
         v
  ┌──────────────┐
  │ implemented  │
  └──────┬───────┘
         │ auto (tracking period starts)
         v
  ┌──────────────┐
  │   tracking   │  (Monitoring actual impact)
  └──────┬───────┘
         │ tracking period ends
         v
  ┌──────────────┐
  │  completed   │  (Final impact measured)
  └──────────────┘

  Any state (except completed) can transition to:
  ┌──────────────┐
  │  cancelled   │
  └──────────────┘
```

**Transitions:**
- `generated` -> `pending_review`: Automatic or manual trigger
- `pending_review` -> `pending_approval`: Reviewer submits for approval (creates `ApprovalRequest` via `lib/workflows/approval.ts`)
- `pending_approval` -> `approved`: Approval granted (by GM or Director per tier)
- `pending_approval` -> `rejected`: Approval denied (with reason)
- `approved` -> `implementing`: User marks implementation started
- `implementing` -> `implemented`: User marks implementation complete (records implementedAt, implementationNotes)
- `implemented` -> `tracking`: Automatic when baseline metrics are captured
- `tracking` -> `completed`: Automatic when `trackingEndsAt` is reached (measures actual impact)
- Any -> `cancelled`: Manual cancellation with reason

### 6.3 Analysis Pipeline

```
  ┌──────────────┐
  │  scheduled   │  (Cron trigger or manual)
  └──────┬───────┘
         │
         v
  ┌──────────────┐
  │  collecting  │  (Fetching data from all modules)
  └──────┬───────┘
         │
         v
  ┌──────────────┐
  │  analyzing   │  (Running anomaly detection, forecasting)
  └──────┬───────┘
         │
         v
  ┌──────────────┐
  │  generating  │  (AI narrative generation via LLM)
  └──────┬───────┘
         │
         v
  ┌──────────────┐
  │ distributing │  (Storing insights, sending notifications)
  └──────┬───────┘
         │
         v
  ┌──────────────┐
  │  completed   │  (Pipeline run complete)
  └──────────────┘
```

---

## 7. API Specification

### 7.1 Insight APIs

**GET `/api/insights`**
- Query Params: `status`, `type`, `severity`, `branchId`, `limit`, `offset`, `startDate`, `endDate`
- Auth: Staff (GM, director, admin)
- Response: `{ insights: AIInsight[], total: number, hasMore: boolean }`

**GET `/api/insights/:insightId`**
- Auth: Staff (GM, director, admin)
- Response: `AIInsight`

**PATCH `/api/insights/:insightId/status`**
- Body: `{ status: 'acknowledged' | 'dismissed', reason?: string }`
- Auth: Staff (GM, director, admin)
- Response: `{ success: true, insight: AIInsight }`

**POST `/api/insights/generate`**
- Body: `{ types?: InsightType[], branchScope?: string[] }`
- Auth: Director, Admin only
- Response: `{ pipelineRunId: string, status: 'started' }`

### 7.2 Recommendation APIs

**GET `/api/recommendations`**
- Query Params: `status`, `type`, `priority`, `approvalTier`, `branchId`, `limit`, `offset`
- Auth: Staff (GM, director, admin)
- Response: `{ recommendations: AIRecommendation[], total: number }`

**GET `/api/recommendations/:recommendationId`**
- Auth: Staff (GM, director, admin)
- Response: `AIRecommendation`

**PATCH `/api/recommendations/:recommendationId/status`**
- Body: `{ status: RecommendationStatus, notes?: string, reason?: string }`
- Auth: Depends on transition (see Section 6.2)
- Response: `{ success: true, recommendation: AIRecommendation }`

**POST `/api/recommendations/:recommendationId/submit-approval`**
- Body: `{ comment?: string }`
- Auth: GM, Director, Admin
- Response: `{ approvalRequestId: string }`

**POST `/api/recommendations/:recommendationId/implement`**
- Body: `{ implementationNotes: string }`
- Auth: GM, Director, Admin
- Response: `{ success: true, trackingEndsAt: string }`

### 7.3 Analytics Snapshot APIs

**GET `/api/analytics/snapshots`**
- Query Params: `granularity`, `branchId`, `startDate`, `endDate`, `limit`
- Auth: Staff (GM, director, admin, auditor)
- Response: `{ snapshots: AnalyticsSnapshot[] }`

**GET `/api/analytics/baseline`**
- Query Params: `metric`, `branchId`, `days` (default 30)
- Auth: Staff (analytics roles)
- Response: `{ mean: number, stdDev: number, dataPoints: number, lastUpdated: string }`

### 7.4 Forecast APIs

**GET `/api/analytics/forecast`**
- Query Params: `metric` (default 'orders'), `branchId`, `horizonDays` (default 14)
- Auth: Staff (GM, director, admin)
- Response: `{ forecasts: ForecastDataPoint[], model: string, lastTrainedAt: string }`

```typescript
interface ForecastDataPoint {
  date: string;
  predicted: number;
  lower80: number;
  upper80: number;
  lower95: number;
  upper95: number;
  actual?: number; // populated for historical dates
}
```

### 7.5 Anomaly Detection APIs

**GET `/api/analytics/anomalies`**
- Query Params: `severity`, `metric`, `branchId`, `startDate`, `endDate`, `limit`
- Auth: Staff (GM, director, admin)
- Response: `{ anomalies: AnomalyFlag[], total: number }`

### 7.6 Executive Report APIs

**POST `/api/reports/executive`**
- Body: `{ period: 'weekly' | 'monthly', branchId?: string, format: 'pdf' | 'excel' }`
- Auth: Director, Admin
- Response: Binary file download

**POST `/api/reports/executive/schedule`**
- Body: `{ frequency: 'weekly' | 'monthly', recipients: string[], format: 'pdf' | 'excel' }`
- Auth: Director, Admin
- Response: `{ scheduleId: string }`

### 7.7 Existing Analytics Agent API (Enhanced)

**POST `/api/agents/analytics`**
- Body: `{ action: string, params: Record<string, unknown> }`
- Auth: Staff (per capability allowedStaffRoles)
- New actions to add:
  - `getInsightSummary`: Returns active insight counts by type and severity
  - `getRecommendationQueue`: Returns pending recommendations for the user's approval tier
  - `getAnomalyReport`: Returns current anomaly status for all tracked metrics
  - `getForecastSummary`: Returns 7-day forecast summary with deviation alerts

---

## 8. UI Specification

### 8.1 Director Dashboard Widgets (Existing)

The director dashboard (`/director/insights`) currently renders the following components from `components/features/director/`:

1. **InsightsHeader** -- Title, branch selector, timeframe selector
2. **ExecutiveSummary** -- 5 KPI cards with change indicators
3. **ExecutiveNarrative** -- AI morning briefing with health score
4. **DirectorKPICards** -- 4 real-time KPI cards
5. **DirectorStatsGrid** -- 5 stat cards with drill-down modals
6. **PredictivePerformanceChart** -- 6-month revenue bar chart (3 actual + 3 projected)
7. **KeyDriversChart** -- Waterfall-style positive/negative driver bars
8. **BranchComparison** -- Sortable branch performance table
9. **RevenueTrends** -- Multi-line area chart with granularity toggle
10. **OperationalHealth** -- Pipeline/capacity/delay status panel
11. **RiskRadar** -- Anomaly and risk watchlist
12. **AIRecommendations** -- AI-generated recommendation cards
13. **DirectorFooter** -- Dashboard footer with metadata

**Breakdowns (drill-down modals):**
14. **StatBreakdownModal** -- Generic modal container
15. **OrdersBreakdownContent** -- Orders stat detail
16. **RevenueBreakdownContent** -- Revenue stat detail
17. **DeliveriesBreakdownContent** -- Delivery stat detail
18. **InventoryBreakdownContent** -- Inventory stat detail
19. **TransfersBreakdownContent** -- Transfer stat detail

**Utility:**
20. **DirectorSearchModal** -- Global search

### 8.2 GM Dashboard Widgets (Existing)

The GM dashboard (`/gm`) renders the following from `components/dashboard/gm/`:

1. **GMDashboardHeader** -- Header with branch filter and theme toggle
2. **GMMetricsRow** -- Real-time metrics: order count, revenue, completion rate
3. **GMLiveOrderQueue** -- Live order feed with real-time updates
4. **GMBranchPerformance** -- Branch comparison for GM scope
5. **GMEquipmentStatus** -- Equipment/machine status
6. **GMWeatherWidget** -- Weather information (external)
7. **GMUrgentIssues** -- Urgent issues requiring GM attention
8. **GMStaffOnDuty** -- Current staff roster and status
9. **GMQuickActions** -- Quick action buttons (new order, view pipeline, etc.)

### 8.3 New Components [NEW]

#### Consolidated `/director/insights` Page Redesign

The `/director/insights` page SHALL be redesigned to absorb the orphaned pages (`/director/ai-lab`, `/director/risk`, `/director/intelligence`) into a unified tabbed interface:

**Tab 1: Dashboard** (default)
- Existing widgets: ExecutiveSummary, ExecutiveNarrative, DirectorKPICards, PredictivePerformanceChart, KeyDriversChart

**Tab 2: Insights Feed**
- NEW: `InsightsFeed` component
  - Filterable list of AI insights sorted by severity then recency
  - Filter chips: All | Critical | Warning | Info | Revenue | Orders | Customers | Delivery | Staff
  - Each insight card shows: severity badge, title, description preview, affected branches, age, action buttons (Acknowledge, Dismiss, View Details)
  - Expandable detail view with full description and data points
  - "Generate Now" button (director/admin only)

**Tab 3: Recommendations**
- NEW: `RecommendationQueue` component
  - Split view: "Pending Review" (left column), "In Progress" (right column)
  - Each recommendation card shows: type badge, priority, title, expected impact, estimated effort, status, action buttons
  - Status-aware actions: Review -> Submit for Approval -> Track Implementation -> View Results
  - Filter by type, priority, status

**Tab 4: Forecasting**
- NEW: `DemandForecastChart` component
  - Line chart: 30 days historical + 14 days forecast
  - Confidence bands (80% and 95%)
  - Deviation alerts highlighted
  - Branch selector
  - Metric selector (orders, revenue)
- NEW: `SeasonalPatternView` component
  - Day-of-week heatmap showing typical patterns
  - Monthly trend comparison

**Tab 5: Anomalies**
- NEW: `AnomalyTimeline` component
  - Timeline view of detected anomalies
  - Severity color coding (amber = warning, red = critical)
  - Click to expand with detailed analysis
  - Links to related insights
- Absorbs content from `/director/risk` page

**Tab 6: Impact**
- NEW: `RecommendationImpactTracker` component
  - Cards for each recommendation in tracking/completed state
  - Progress bars, actual vs expected comparison
  - Cumulative ROI summary at top
- NEW: `InsightTimeline` component
  - Chronological view of all insight activity
  - Filter by type, severity, and date range

#### New Shared Components

**`AnomalyAlertPanel`** -- Compact panel suitable for embedding in any dashboard (director or GM) showing current active anomalies with severity and one-line description. Links to full anomaly detail.

**`InsightBadge`** -- Small badge component showing insight count by severity (e.g., "2 critical, 5 warnings") for use in navigation sidebars and headers.

**`ForecastMiniChart`** -- Compact sparkline-style forecast visualization for embedding in KPI cards.

### 8.4 GM Dashboard Enhancements

**FR-M5-043**: The GM dashboard SHALL add a new `GMAIInsightsPanel` widget (collapsed by default, expandable) showing:
- Count of active insights relevant to the GM's branch
- Top 3 most critical insights with one-line summaries
- Link to full insight detail (opens in modal or navigates to filtered view)
- Recommendation count pending GM approval

---

## 9. Dashboard & Reporting Outputs

### 9.1 Complete Data Pipeline Matrix

This is the critical matrix showing how data flows from source modules through AI processing to output widgets:

| Source Module | Source Collections | Data Points | AI Processing | Output Widget(s) | Target Dashboard |
|---|---|---|---|---|---|
| **M1 (Orders)** | `orders`, `transactions` | Revenue, AOV, order volume, pipeline distribution, turnaround time, rewash rate, payment method mix | Trend analysis, forecasting, anomaly detection, narrative generation | ExecutiveSummary, DirectorKPICards, PredictivePerformanceChart, KeyDriversChart, RevenueTrends, GMMetricsRow, GMLiveOrderQueue | Director, GM |
| **M2 (Logistics)** | `deliveries`, `driverLocations` | Delivery %, on-time rate, driver utilization, route efficiency, failed deliveries | Performance scoring, anomaly detection, route optimization recommendations | OperationalHealth, RiskRadar, DeliveriesBreakdownContent, DemandForecastChart | Director, GM |
| **M3 (Proximity)** | `customers`, `pickupRequests` | Customer acquisition, conversion rate, response time, geographic distribution | Campaign analysis, acquisition trend detection | CustomerInsight cards, InsightsFeed | Director |
| **M4 (Preferences)** | `customers`, `feedback`, `customerStatistics` | Retention rate, churn risk, satisfaction score, segment distribution, loyalty engagement | Churn prediction, segment shift detection, satisfaction trend analysis | ExecutiveSummary (Satisfaction), RiskRadar (churn alerts), CustomerInsight cards | Director, GM |
| **M5 (AI Engine)** | `aiInsights`, `aiRecommendations`, `analyticsSnapshots` | Insight counts, recommendation pipeline, anomaly flags, forecast accuracy | Meta-analysis (insight quality tracking) | InsightsFeed, RecommendationQueue, AnomalyTimeline, RecommendationImpactTracker | Director |
| **M6 (Vouchers)** | `vouchers`, `approval_requests` | Redemption rate, voucher ROI, approval turnaround, discount impact on revenue | ROI analysis, campaign effectiveness | InsightsFeed (voucher insights), ExecutiveNarrative (mentions) | Director |
| **Staff** | `employees`, `attendance` | Staff count, utilization, performance scores, shift coverage | Performance anomaly detection, staffing recommendations | OperationalHealth, GMStaffOnDuty, StaffInsight cards | Director, GM |
| **Inventory** | `inventory`, `inventoryTransactions` | Stock levels, consumption rates, low-stock alerts, cost trends | Consumption pattern analysis, reorder recommendations | DirectorStatsGrid (Inventory Alerts), InventoryBreakdownContent, InsightsFeed | Director |
| **Branches** | `branches`, computed metrics | Per-branch revenue, orders, efficiency, capacity | Branch comparison, underperformance detection | BranchComparison, GMBranchPerformance, BranchInsight cards | Director, GM |

### 9.2 Director Summary Bar

The director dashboard header SHALL display a summary bar with 5-8 KPI badges:

| KPI | Source | Computation | Format |
|---|---|---|---|
| Today's Revenue | `transactions` (today) | Sum of completed transaction amounts | KES X.XM |
| Today's Orders | `orders` (today) | Count of orders created today | N orders |
| On-Time Delivery Rate | `deliveries` (last 7 days) | Completed on-time / total completed * 100 | XX% |
| Customer Retention | `customers` + `orders` (last 30 days) | Returning customers / total unique customers * 100 | XX% |
| Staff Utilization | `employees` (today) | Active staff / total on-duty * 100 | XX% |
| Pending Recommendations | `aiRecommendations` | Count where status = pending_review OR pending_approval | N pending |
| Active Anomalies | `aiInsights` | Count where type = anomaly_alert AND status = active | N anomalies |
| Forecast Accuracy | `analyticsSnapshots` + forecasts | MAPE of last 7 days' forecasts | XX% |

### 9.3 Executive Report Contents

The automated executive report (PDF/Excel) SHALL contain:

**Section 1: Period Summary**
- Date range and report generation metadata
- 6 headline KPIs with period-over-period change

**Section 2: Revenue Analysis**
- Total revenue with breakdown by payment method
- Revenue trend chart (daily for weekly report, weekly for monthly)
- Top 5 revenue-generating branches
- Revenue per order trend

**Section 3: Operations Summary**
- Total orders with completion rate
- Average turnaround time
- Pipeline distribution snapshot
- Delivery performance metrics

**Section 4: AI Insights Summary**
- Top 5 insights by severity
- Insight distribution by type (pie chart)
- Critical insights requiring action

**Section 5: Recommendation Status**
- Active recommendations and their status
- Implemented recommendations with impact measurement
- Pending approvals summary

**Section 6: Anomaly Report**
- Anomalies detected during the period
- Resolution status for each
- Metrics currently outside normal bounds

**Section 7: Demand Forecast**
- 14-day order volume forecast
- Expected peak days
- Staffing recommendations based on forecast

**Section 8: Branch Rankings**
- Branch performance table (revenue, orders, efficiency, satisfaction)
- Top and bottom performers highlighted

---

## 10. Notification & Messaging Flows

### 10.1 Critical Insight Notification

**Trigger:** Insight created with severity = `critical`
**Recipients:** Director (all critical), GM (branch-specific critical)
**Channels:**
- In-app notification (immediate)
- Email via Resend (immediate)
- WhatsApp via Wati.io (if configured, for critical only)

**Email Template:**
```
Subject: [CRITICAL] Lorenzo Insights: {insight.title}
Body:
A critical business insight has been detected:

{insight.title}
Severity: CRITICAL
Confidence: {insight.confidence * 100}%
Affected Branches: {insight.affectedBranches.join(', ') || 'All Branches'}

{insight.description}

Key Data Points:
{insight.dataPoints.map(dp => `- ${dp.label}: ${dp.value} ${dp.unit} (${dp.changePercent}% change)`)}

View in Dashboard: {dashboardUrl}/director/insights?insightId={insight.insightId}
```

### 10.2 Recommendation Approval Request

**Trigger:** Recommendation submitted for approval
**Recipients:** Users with appropriate approval tier role
**Channels:** In-app notification, Email

### 10.3 Recommendation Impact Result

**Trigger:** Recommendation tracking period completes
**Recipients:** Original requester + approver
**Channels:** In-app notification, Email

### 10.4 Anomaly Detected

**Trigger:** Anomaly detected during hourly check
**Recipients:** GM (branch-specific), Director (cross-branch or critical)
**Channels:** In-app notification (warning), In-app + Email (critical)

### 10.5 Scheduled Report Delivery

**Trigger:** Scheduled report generated (weekly/monthly)
**Recipients:** Configured recipients in `insightSchedules`
**Channels:** Email with PDF/Excel attachment

---

## 11. Audit & Compliance

### 11.1 Auditable Actions

All M5 operations SHALL be audit-logged using the existing `lib/db/audit-logs.ts` infrastructure:

| Action | Resource Type | Logged Fields |
|---|---|---|
| Insight generated | `ai_insight` | insightId, type, severity, generatedBy |
| Insight acknowledged | `ai_insight` | insightId, acknowledgedBy |
| Insight dismissed | `ai_insight` | insightId, dismissedBy, reason |
| Recommendation generated | `ai_recommendation` | recommendationId, type, generatedBy |
| Recommendation status change | `ai_recommendation` | recommendationId, oldStatus, newStatus, changedBy |
| Recommendation approved | `ai_recommendation` | recommendationId, approvedBy, approvalTier |
| Recommendation rejected | `ai_recommendation` | recommendationId, rejectedBy, reason |
| Recommendation implemented | `ai_recommendation` | recommendationId, implementedBy, notes |
| Impact measured | `ai_recommendation` | recommendationId, expectedImpact, actualImpact, variance |
| Pipeline run | `ai_pipeline` | pipelineRunId, triggeredBy, insightCount, duration |
| Schedule created/modified | `insight_schedule` | scheduleId, changedBy, changes |
| LLM call | `llm_request` | provider, model, agentType, agentFunction, tokenUsage, responseTime |

### 11.2 LLM Cost Tracking

Every LLM API call SHALL log:
- Provider and model used
- Input token count
- Output token count
- Estimated cost (based on provider pricing)
- Response time
- Whether fallback was triggered
- Request context (agentType, agentFunction)

Monthly LLM cost reports SHALL be available to admin users only via `/api/analytics/llm-costs`.

### 11.3 Data Retention

| Data Type | Retention Period | Archive Strategy |
|---|---|---|
| `aiInsights` | 12 months active | Move to `aiInsightsArchive` |
| `aiRecommendations` | 24 months active | Move to `aiRecommendationsArchive` |
| `analyticsSnapshots` (hourly) | 3 months | Delete after aggregation to daily |
| `analyticsSnapshots` (daily) | 12 months | Move to `analyticsSnapshotsArchive` |
| `analyticsSnapshots` (weekly/monthly) | 24 months | Move to archive |
| LLM request logs | 6 months | Delete |

---

## 12. Customer Portal Impact

Module 5 is primarily an **internal intelligence layer** and has **minimal direct impact on the customer portal**. However:

**FR-M5-044**: Customer-facing impact is limited to:
1. **Improved Service Quality** -- Anomaly detection and recommendations lead to faster issue resolution, which indirectly improves customer experience
2. **Better ETA Predictions** -- Demand forecasting data MAY be used to provide more accurate order completion estimates in the customer portal (dependent on M1 integration)
3. **Proactive Communication** -- When critical anomalies affect specific customers (e.g., delays), the system MAY trigger proactive notification via WhatsApp/SMS before the customer inquires

**FR-M5-045**: No customer-facing dashboard or insight data SHALL be exposed. All AI insights, recommendations, and anomaly details are staff-only.

---

## 13. Branch Scoping

### 13.1 Branch Access Rules

| Role | Insight Visibility | Recommendation Visibility | Anomaly Visibility | Snapshot Access |
|---|---|---|---|---|
| Admin | All branches | All recommendations | All anomalies | All branches + aggregate |
| Director | All branches | All recommendations | All anomalies | All branches + aggregate |
| General Manager | Own branch only | Own branch recommendations | Own branch anomalies | Own branch only |
| Store Manager | Own branch only (view-only) | None | Own branch anomalies (view-only) | None |
| Auditor | All branches (read-only) | All (read-only) | All (read-only) | All (read-only) |
| Other Roles | None | None | None | None |

### 13.2 Branch-Specific vs Cross-Branch Insights

- Insights with `affectedBranches = []` (empty) are **cross-branch** and visible to director/admin only
- Insights with specific branchIds are visible to GMs of those branches AND director/admin
- The insight generation pipeline SHALL generate both branch-specific insights (per branch) AND aggregate cross-branch insights

### 13.3 Multi-Branch Director View

When the director selects "All Branches" in the InsightsHeader:
- KPI cards show aggregate numbers
- Insights feed shows all insights across branches
- Anomaly timeline shows all anomalies
- Branch comparison is fully visible
- Recommendations show all pending approvals

When a specific branch is selected:
- KPI cards show branch-specific numbers
- Insights feed is filtered to that branch
- Anomaly timeline shows only that branch's anomalies
- Recommendations filtered to that branch

---

## 14. Business Logic

### 14.1 Insight Generation Pipeline

The daily insight generation pipeline (triggered at 06:00 EAT or on-demand) follows this sequence:

**Step 1: Data Collection (collecting)**
```
1. Fetch today's analytics snapshot (if exists) or compute fresh
2. Fetch yesterday's snapshot for comparison
3. Fetch last 7 days' snapshots for weekly trend
4. Fetch last 30 days' snapshots for monthly trend and baseline
5. Fetch current anomaly flags from latest snapshot
6. Fetch active orders pipeline stats per branch
7. Fetch pending approval requests
8. Fetch recent customer feedback
```

**Step 2: Statistical Analysis (analyzing)**
```
1. Compute period-over-period changes:
   - Revenue: today vs yesterday, this week vs last week, this month vs last month
   - Orders: same comparisons
   - AOV, retention, delivery rate, satisfaction: same comparisons
2. Run anomaly detection on all tracked metrics (see FR-M5-031)
3. Update demand forecast model with latest data
4. Compute branch rankings
5. Identify top positive and negative drivers
```

**Step 3: AI Narrative Generation (generating)**
```
1. Construct data context string from all collected metrics
2. For each insight type where data warrants an insight:
   a. Build system prompt: "You are a business analyst for Lorenzo Dry Cleaners..."
   b. Build user prompt with specific data context and instruction
   c. Call LLM via llm-client.ts with agentType='analytics', agentFunction='analytics_insights'
   d. Parse response into structured insight (title, description, dataPoints)
   e. Assign severity based on magnitude of change and anomaly flags
   f. Assign confidence based on data quality and model characteristics
3. Generate recommendations from insights exceeding threshold severity
```

**Step 4: Distribution (distributing)**
```
1. Store all generated insights in `aiInsights` collection
2. Store all generated recommendations in `aiRecommendations` collection
3. Trigger notifications for critical insights (see Section 10)
4. Update insight schedule's lastRunAt and lastRunStatus
5. Log pipeline run in audit trail
```

### 14.2 LLM Fallback Chain

The system uses the configured fallback chain from `GlobalLLMConfig.fallbackOrder`:

```
Primary: OpenAI (gpt-4 or configured model)
  |-- On RateLimitError or timeout -->
Fallback 1: Anthropic (claude-3-sonnet or configured model)
  |-- On RateLimitError or timeout -->
Fallback 2: Google (gemini-pro or configured model)
  |-- On RateLimitError or timeout -->
Fallback 3: Local model (if configured)
  |-- On all failures -->
Rule-Based Fallback: Generate insights using pure statistical analysis
  (no natural language narrative, just structured data with computed severity)
```

### 14.3 Anomaly Detection Algorithm

For each tracked metric:

```typescript
function detectAnomaly(
  currentValue: number,
  historicalValues: number[] // last 30 days
): AnomalyFlag | null {
  const mean = historicalValues.reduce((s, v) => s + v, 0) / historicalValues.length;
  const variance = historicalValues.reduce((s, v) => s + (v - mean) ** 2, 0) / historicalValues.length;
  const stdDev = Math.sqrt(variance);

  // Avoid false positives when stdDev is very small
  if (stdDev < mean * 0.01) return null; // Less than 1% coefficient of variation

  const sigmaDeviation = Math.abs(currentValue - mean) / stdDev;

  if (sigmaDeviation >= 3.0) {
    return { metric, observedValue: currentValue, expectedValue: mean, sigmaDeviation, severity: 'critical' };
  } else if (sigmaDeviation >= 2.0) {
    return { metric, observedValue: currentValue, expectedValue: mean, sigmaDeviation, severity: 'warning' };
  }

  return null;
}
```

### 14.4 Demand Forecasting Algorithm

```typescript
function exponentialSmoothing(
  historicalData: number[], // daily values, most recent last
  alpha: number = 0.3,     // smoothing factor
  dayOfWeekFactors: number[], // [Mon, Tue, ..., Sun] multiplicative factors
  horizonDays: number = 14
): ForecastDataPoint[] {
  // Initialize level with first observation
  let level = historicalData[0];

  // Train on historical data
  for (let i = 1; i < historicalData.length; i++) {
    const deseasonalized = historicalData[i] / dayOfWeekFactors[i % 7];
    level = alpha * deseasonalized + (1 - alpha) * level;
  }

  // Compute forecast error variance for confidence intervals
  const errors: number[] = [];
  let tempLevel = historicalData[0];
  for (let i = 1; i < historicalData.length; i++) {
    const forecast = tempLevel * dayOfWeekFactors[i % 7];
    errors.push(historicalData[i] - forecast);
    const deseasonalized = historicalData[i] / dayOfWeekFactors[i % 7];
    tempLevel = alpha * deseasonalized + (1 - alpha) * tempLevel;
  }
  const errorVariance = errors.reduce((s, e) => s + e * e, 0) / errors.length;
  const errorStdDev = Math.sqrt(errorVariance);

  // Generate forecasts
  const forecasts: ForecastDataPoint[] = [];
  const startDay = historicalData.length; // day index for day-of-week

  for (let h = 1; h <= horizonDays; h++) {
    const dowIndex = (startDay + h) % 7;
    const predicted = level * dayOfWeekFactors[dowIndex];

    // Confidence intervals widen with horizon
    const intervalWidth = errorStdDev * Math.sqrt(h);
    const z80 = 1.28;
    const z95 = 1.96;

    forecasts.push({
      date: computeDate(h),
      predicted: Math.round(predicted),
      lower80: Math.round(predicted - z80 * intervalWidth),
      upper80: Math.round(predicted + z80 * intervalWidth),
      lower95: Math.round(predicted - z95 * intervalWidth),
      upper95: Math.round(predicted + z95 * intervalWidth),
    });
  }

  return forecasts;
}
```

### 14.5 Recommendation Approval Routing

```typescript
function getApprovalTierForRecommendation(rec: AIRecommendation): ApprovalTier {
  switch (rec.type) {
    case 'operational':
      return 'general_manager';
    case 'strategic':
    case 'financial':
    case 'marketing':
      return 'director';
    case 'staffing':
      return (rec.estimatedCost && rec.estimatedCost > 50000)
        ? 'director'
        : 'general_manager';
    default:
      return 'director';
  }
}
```

### 14.6 Impact Tracking Logic

When a recommendation transitions to `implemented`:
1. Capture baseline value for the target metric at `implementedAt`
2. Set `trackingEndsAt = implementedAt + expectedImpact.timeframeDays`
3. Create a scheduled job to measure actual impact at `trackingEndsAt`

When tracking period ends:
1. Fetch current value of target metric
2. Compute actual change: `(currentValue - baselineValue) / baselineValue * 100`
3. Store as `actualImpact`
4. Compute variance: `actualImpact.magnitude - expectedImpact.magnitude`
5. Generate a `recommendation_result` insight documenting the outcome
6. Transition status to `completed`

---

## 15. Integration Points

### 15.1 Module Dependencies (Data Sources)

| Module | Integration Method | Data Flow | Frequency |
|---|---|---|---|
| M1 (Orders) | Firestore queries via `analytics-db.ts` | Orders, transactions, pipeline stats | Real-time (snapshots) + daily (pipeline) |
| M2 (Logistics) | Firestore queries | Deliveries, driver locations, routes | Hourly + daily |
| M3 (Proximity) | Firestore queries | Pickup requests, customer locations | Daily |
| M4 (Preferences) | Firestore queries | Customer stats, feedback, segments | Daily |
| M6 (Vouchers) | Firestore queries | Voucher redemptions, approval stats | Daily |

### 15.2 External Service Dependencies

| Service | Purpose | Integration Point |
|---|---|---|
| OpenAI API | Primary LLM for narrative generation | `lib/llm/providers/openai-provider.ts` |
| Anthropic API | Fallback LLM | `lib/llm/providers/anthropic-provider.ts` |
| Google AI API | Second fallback LLM | `lib/llm/providers/google-provider.ts` |
| Resend | Email notifications for critical insights | `services/email.ts` (existing) |
| Wati.io | WhatsApp notifications for critical insights | `services/wati.ts` (existing) |

### 15.3 Internal System Dependencies

| System | Dependency | Description |
|---|---|---|
| Firebase Admin SDK | `lib/firebase-admin.ts` | Server-side Firestore access for analytics-db.ts |
| Firebase Client SDK | `lib/firebase.ts` | Client-side Firestore access for director/GM dashboards |
| Approval Workflow | `lib/workflows/approval.ts` | Recommendation approval routing |
| Audit Logging | `lib/db/audit-logs.ts` | All M5 actions are audit-logged |
| Report Export | `lib/reports/export-pdf.ts`, `lib/reports/export-excel.ts` | Executive report generation |
| Auth Context | `contexts/AuthContext.tsx` | User role and branch access for authorization |

---

## 16. Security & Permissions

### 16.1 Role-Based Access Control

| Permission | Admin | Director | GM | Store Manager | Auditor | Finance Manager | Other Roles |
|---|---|---|---|---|---|---|---|
| View insights (all branches) | Yes | Yes | No | No | Yes (read-only) | No | No |
| View insights (own branch) | Yes | Yes | Yes | View only | Yes | No | No |
| Acknowledge/dismiss insights | Yes | Yes | Yes (own branch) | No | No | No | No |
| View recommendations | Yes | Yes | Yes (own branch) | No | Yes (read-only) | No | No |
| Submit recommendation for approval | Yes | Yes | Yes | No | No | No | No |
| Approve recommendations (operational) | Yes | Yes | Yes | No | No | No | No |
| Approve recommendations (strategic) | Yes | Yes | No | No | No | No | No |
| Trigger on-demand insight generation | Yes | Yes | No | No | No | No | No |
| Configure insight schedules | Yes | Yes | No | No | No | No | No |
| View anomalies | Yes | Yes | Yes (own branch) | View only | Yes | No | No |
| View forecasts | Yes | Yes | Yes (own branch) | No | Yes | No | No |
| View analytics snapshots | Yes | Yes | Yes (own branch) | No | Yes | No | No |
| Generate executive reports | Yes | Yes | No | No | Yes | No | No |
| View LLM costs | Yes | No | No | No | No | No | No |
| Configure LLM providers | Yes | No | No | No | No | No | No |
| Modify LLM model assignments | Yes | Yes | No | No | No | No | No |

### 16.2 API Authentication

All M5 API endpoints require Firebase Authentication JWT tokens. The middleware checks:
1. Valid JWT token in `Authorization: Bearer {token}` header
2. User role extracted from custom claims or `users` collection
3. Branch access validated against `user.branchId` and `user.branchAccess`
4. Specific capability checked against the RBAC table above

### 16.3 Data Protection

- LLM API keys are encrypted at rest using AES-256-GCM (existing `ProviderConfig.encryptedApiKey`)
- No customer PII is sent to LLM providers -- only aggregated metrics and anonymized data points
- Insight descriptions may reference branch names but never individual customer names, phone numbers, or financial details
- LLM request logs are retained for 6 months and then purged

---

## 17. Error Handling & Edge Cases

### 17.1 LLM Failure Scenarios

| Scenario | Handling |
|---|---|
| Primary LLM provider rate-limited | Automatic fallback to next provider in chain |
| All LLM providers unavailable | Generate rule-based insights (statistical analysis only, no narrative). Set `generatedBy = 'rule-engine'` and `confidence = 0.5`. |
| LLM returns malformed response | Retry once with simplified prompt. If still fails, skip narrative generation for that insight and log warning. |
| LLM response exceeds token limit | Truncate at natural sentence boundary. Add "[truncated]" suffix. |
| LLM API key expired/invalid | Mark provider as `disconnected` in `ProviderConfig`. Send admin notification. Skip to next fallback. |

### 17.2 Data Availability Edge Cases

| Scenario | Handling |
|---|---|
| Insufficient historical data for anomaly detection (< 14 days) | Skip anomaly detection for that metric. Display "Insufficient data" message. Build baseline silently. |
| Insufficient data for demand forecasting (< 30 days) | Use simple average instead of exponential smoothing. Widen confidence intervals by 2x. Display "Limited forecast accuracy" notice. |
| Branch has zero orders for a day | Include in baseline as a valid data point (zero is meaningful). Do not flag as anomaly unless it deviates from the rolling baseline. |
| Firebase Firestore read quota exceeded | Implement exponential backoff. Reduce snapshot granularity temporarily. Alert admin. |
| Concurrent insight generation runs | Use distributed lock (Firestore transaction on a `pipelineLock` document). Second run waits or skips with log message. |

### 17.3 Approval Edge Cases

| Scenario | Handling |
|---|---|
| Approver no longer has the required role | Recommendation stays in `pending_approval`. System re-evaluates and notifies next eligible approver. |
| Recommendation becomes irrelevant before approval | Allow cancellation from `pending_approval` state with reason. |
| Impact tracking metric no longer available | Mark tracking as `incomplete`. Generate insight noting measurement failure. |
| Multiple recommendations for same issue | Allow it, but show a "Related Recommendations" link. Do not auto-deduplicate. |

---

## 18. Data Migration

### 18.1 New Collection Initialization

Since M5 introduces 4 new collections (`aiInsights`, `aiRecommendations`, `analyticsSnapshots`, `insightSchedules`), no migration of existing data is needed. However:

1. **Backfill analytics snapshots**: Run a one-time backfill job to create daily snapshots for the past 90 days using historical `orders` and `transactions` data. This provides an immediate baseline for anomaly detection and forecasting.

2. **Create default insight schedule**: Insert a default schedule for daily insight generation at 06:00 EAT.

3. **Create default model assignments**: If not already configured, create model assignments for the new `analytics_insights` agent function:
   ```
   agentType: 'analytics'
   agentFunction: 'analytics_insights'
   provider: 'openai'
   model: 'gpt-4'
   temperature: 0.3
   maxTokens: 2000
   ```

### 18.2 Schema Extensions

Add new types to `lib/db/schema.ts` as defined in Section 5.2. These are additive-only changes with no breaking modifications to existing types.

### 18.3 Firestore Security Rules

Add rules for new collections:

```
match /aiInsights/{insightId} {
  allow read: if isAuthenticated() && hasManagementAccess();
  allow write: if isAuthenticated() && hasRole('admin');
  // System writes via Admin SDK bypass rules
}

match /aiRecommendations/{recommendationId} {
  allow read: if isAuthenticated() && hasManagementAccess();
  allow write: if isAuthenticated() && (hasRole('admin') || hasRole('director') || hasRole('general_manager'));
}

match /analyticsSnapshots/{snapshotId} {
  allow read: if isAuthenticated() && hasManagementAccess();
  allow write: if false; // Admin SDK only
}

match /insightSchedules/{scheduleId} {
  allow read: if isAuthenticated() && (hasRole('admin') || hasRole('director'));
  allow write: if isAuthenticated() && (hasRole('admin') || hasRole('director'));
}
```

---

## 19. Testing Strategy

### 19.1 Unit Tests

| Test Area | Files to Test | Key Scenarios |
|---|---|---|
| Anomaly detection algorithm | `lib/analytics/anomaly-detection.ts` (new) | Normal data, 2-sigma boundary, 3-sigma boundary, low variance data, zero values, single data point |
| Demand forecasting | `lib/analytics/demand-forecast.ts` (new) | Historical data processing, seasonal factor computation, confidence interval calculation, edge cases (weekends, holidays) |
| Insight generation | `lib/analytics/insight-generator.ts` (new) | Data context construction, LLM prompt formatting, response parsing, severity assignment, confidence scoring |
| Recommendation routing | `lib/analytics/recommendation-engine.ts` (new) | Approval tier determination, type-to-tier mapping, amount threshold escalation |
| Impact tracking | `lib/analytics/impact-tracker.ts` (new) | Baseline capture, variance computation, result insight generation |

### 19.2 Integration Tests

| Test Area | Key Scenarios |
|---|---|
| Insight API endpoints | CRUD operations, filtering, status transitions, authorization (role-based) |
| Recommendation lifecycle | Full flow from generation through approval to impact measurement |
| Pipeline execution | End-to-end pipeline run with mocked data sources and LLM responses |
| LLM fallback chain | Primary failure -> fallback success, all providers fail -> rule-based fallback |
| Notification delivery | Critical insight triggers email and in-app notification |

### 19.3 E2E Tests (Playwright)

| Test Flow | Steps |
|---|---|
| Director views insights | Login as director -> Navigate to /director/insights -> Verify tabs load -> Switch to Insights Feed -> Filter by severity -> Acknowledge an insight |
| GM views branch insights | Login as GM -> Verify only branch-specific insights visible -> Verify no cross-branch data leaks |
| Recommendation approval | Login as GM -> View pending recommendation -> Submit for approval -> Login as director -> Approve -> Verify status change |
| On-demand generation | Login as director -> Click "Generate Now" -> Verify pipeline runs -> Verify new insights appear |

### 19.4 Performance Tests

| Metric | Target | Test Method |
|---|---|---|
| Insight API response time | < 500ms (P95) | Load test with 100 concurrent requests |
| Pipeline execution time | < 5 minutes for full run | Timer on pipeline run with production-scale data |
| Dashboard widget load time | < 2 seconds per widget | Lighthouse performance audit |
| LLM response time | < 10 seconds per insight | Timer on LLM calls with timeout enforcement |
| Anomaly detection (8 metrics) | < 1 second | Unit test with 30-day dataset |

---

## 20. Implementation Sequence

### Phase 1: Foundation (Week 1-2)

1. **Schema & Types** -- Add new types to `lib/db/schema.ts`, create Firestore indexes
2. **Analytics Snapshot System** -- Implement `analyticsSnapshots` collection, hourly/daily capture jobs, backfill script
3. **Anomaly Detection Module** -- Implement statistical anomaly detection on snapshot data
4. **Database layer** -- Create `lib/db/ai-insights.ts`, `lib/db/ai-recommendations.ts`, `lib/db/analytics-snapshots.ts` with CRUD operations

### Phase 2: AI Pipeline (Week 3-4)

5. **Insight Generation Pipeline** -- Implement the 4-step pipeline (collect, analyze, generate, distribute)
6. **LLM Integration for Insights** -- Add `analytics_insights` function handling in LLM client, create insight-specific prompts
7. **Recommendation Generation** -- Implement recommendation engine that produces recommendations from high-severity insights
8. **Scheduling** -- Implement cron-based scheduling for daily pipeline and hourly anomaly detection

### Phase 3: Approval & Tracking (Week 5)

9. **Recommendation Approval Integration** -- Extend `lib/workflows/approval.ts` with new `ai_recommendation` approval type
10. **Impact Tracking** -- Implement baseline capture, tracking period management, and actual impact measurement
11. **Notification Flows** -- Wire up critical insight notifications and recommendation approval notifications

### Phase 4: UI (Week 6-7)

12. **Consolidated Insights Page** -- Redesign `/director/insights` with tabbed interface
13. **InsightsFeed Component** -- Filterable insight list with severity badges and action buttons
14. **RecommendationQueue Component** -- Split-view recommendation management
15. **DemandForecastChart Component** -- Line chart with confidence bands
16. **AnomalyTimeline Component** -- Timeline visualization of anomalies
17. **RecommendationImpactTracker Component** -- Impact tracking cards with progress bars
18. **GM Dashboard Enhancement** -- Add `GMAIInsightsPanel` widget

### Phase 5: Reporting & Polish (Week 8)

19. **Executive Report Generation** -- Extend PDF/Excel export for insight and recommendation data
20. **Scheduled Report Delivery** -- Implement weekly/monthly report email scheduling
21. **Orphaned Page Consolidation** -- Redirect `/director/ai-lab`, `/director/risk`, `/director/intelligence` to `/director/insights` with appropriate tab
22. **LLM Cost Dashboard** -- Admin-only LLM usage and cost tracking page
23. **Testing & QA** -- Full test suite execution, performance validation

---

## 21. Open Questions & Risks

### Open Questions

| ID | Question | Impact | Owner | Status |
|---|---|---|---|---|
| OQ-001 | Should the anomaly detection pipeline run as a Firebase Cloud Function (cron-triggered) or as a Next.js API route with external cron (e.g., Vercel Cron)? | Architecture | Engineering | Open |
| OQ-002 | What is the acceptable monthly LLM cost budget for insight generation? This determines how many insights can be AI-narrated vs rule-based. | Cost | Director | Open |
| OQ-003 | Should demand forecasting account for Kenyan public holidays (Jamhuri Day, Madaraka Day, etc.)? This requires maintaining a holiday calendar. | Accuracy | Product | Open |
| OQ-004 | Should the system support manual insight creation (e.g., a director typing a custom insight for record-keeping)? | Feature scope | Product | Open |
| OQ-005 | What is the desired behavior when a GM dismisses a critical insight? Should it require a reason? Should the director be notified? | Compliance | Product | Open |
| OQ-006 | Should the insight generation pipeline generate branch-specific insights for all 21+ branches, or only branches that meet a minimum activity threshold? | Performance / Cost | Engineering | Open |
| OQ-007 | For impact tracking, how do we isolate the effect of a single recommendation from other concurrent changes in the business? | Accuracy | Data Science | Open |

### Risks

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-001 | LLM costs exceed budget due to high insight volume | Medium | High | Set daily LLM call limits. Use rule-based generation for low-severity insights. Monitor costs weekly. |
| R-002 | LLM hallucination produces misleading insights | Medium | High | Always include underlying data points alongside narrative. Add confidence score. Require human review for critical insights before notification. |
| R-003 | Anomaly detection false positives overwhelm users | Medium | Medium | Start with conservative thresholds (3-sigma only). Allow users to tune sensitivity. Implement anomaly acknowledgement to prevent repeat alerts. |
| R-004 | Demand forecast inaccuracy reduces trust in the system | Medium | Medium | Display confidence intervals prominently. Show historical forecast accuracy metric. Start with simple model and iterate. |
| R-005 | Pipeline execution time exceeds acceptable window | Low | Medium | Implement parallel data collection. Set hard timeout (10 min). Generate partial results if timeout hit. |
| R-006 | Firestore read costs increase significantly from snapshot queries | Medium | Medium | Optimize queries with proper indexes. Cache baselines in memory. Batch reads. |
| R-007 | Users ignore insights and recommendations, reducing ROI | Medium | High | Track engagement metrics (view, acknowledge, dismiss rates). Improve insight quality based on feedback. Limit volume to avoid fatigue. |
| R-008 | Concurrent pipeline runs corrupt data | Low | High | Implement distributed lock via Firestore document transaction. |

---

## Appendix A: Full Data Pipeline Matrix

### Revenue Intelligence Pipeline

```
Source: transactions (completed, grouped by day)
  -> Compute: daily totals, WoW change, MoM change, YoY change
  -> Compute: payment method distribution shift
  -> Compute: AOV trend
  -> Anomaly Check: daily revenue vs 30-day baseline
  -> Forecast: 14-day revenue forecast
  -> LLM: Generate revenue narrative
  -> Output: revenue_insight (stored in aiInsights)
  -> Output: DirectorKPICards.revenue, ExecutiveSummary.revenue
  -> Output: PredictivePerformanceChart data
  -> Output: RevenueTrends chart data
```

### Order Intelligence Pipeline

```
Source: orders (grouped by day, by status)
  -> Compute: daily volume, completion rate, turnaround time
  -> Compute: pipeline bottleneck analysis (which stage has most items)
  -> Compute: rewash rate trend
  -> Anomaly Check: daily orders vs 30-day baseline
  -> Anomaly Check: completion rate vs baseline
  -> Anomaly Check: rewash rate vs baseline
  -> Forecast: 14-day order volume forecast
  -> LLM: Generate order narrative
  -> Output: order_insight (stored in aiInsights)
  -> Output: ExecutiveSummary.orders, GMMetricsRow
  -> Output: OperationalHealth pipeline distribution
  -> Output: DemandForecastChart data
```

### Customer Intelligence Pipeline

```
Source: customers + orders (joined by customerId)
  -> Compute: new vs returning customer ratio
  -> Compute: retention rate (30-day, 60-day, 90-day)
  -> Compute: churn risk (customers with no order in 60+ days)
  -> Compute: segment distribution shift (regular/VIP/corporate)
  -> Compute: satisfaction trend (from feedback collection)
  -> Anomaly Check: acquisition rate vs baseline
  -> Anomaly Check: retention vs baseline
  -> LLM: Generate customer narrative
  -> Output: customer_insight (stored in aiInsights)
  -> Output: DirectorKPICards.retention, ExecutiveSummary.satisfaction
  -> Output: RiskRadar (churn alerts)
```

### Delivery Intelligence Pipeline

```
Source: deliveries (grouped by day, by status)
  -> Compute: on-time rate, average delivery time
  -> Compute: failed delivery rate and reasons
  -> Compute: driver utilization (deliveries per driver)
  -> Anomaly Check: on-time rate vs baseline
  -> Anomaly Check: delivery volume vs baseline
  -> LLM: Generate delivery narrative
  -> Output: delivery_insight (stored in aiInsights)
  -> Output: ExecutiveSummary.onTimeRate
  -> Output: OperationalHealth delivery section
  -> Output: DeliveriesBreakdownContent
```

### Branch Intelligence Pipeline

```
Source: all above metrics, grouped by branchId
  -> Compute: per-branch ranking on revenue, orders, efficiency
  -> Compute: branch deviation from system average
  -> Compute: branch trend (improving/declining/stable)
  -> Anomaly Check: per-branch vs system baseline
  -> LLM: Generate branch comparison narrative
  -> Output: branch_insight (stored in aiInsights)
  -> Output: BranchComparison table data
  -> Output: GMBranchPerformance
```

---

## Appendix B: Agent Capability Catalog

### AnalyticsAgent Capabilities (Existing)

| Action | Required Params | Optional Params | Allowed Roles | Description |
|---|---|---|---|---|
| `getRevenueAnalytics` | `period` | `branchId`, `startDate`, `endDate` | admin, director, general_manager, store_manager | Revenue breakdown by period, branch, payment method |
| `getOrderAnalytics` | `period` | `branchId` | admin, director, general_manager, store_manager | Order counts, status distribution, turnaround metrics |
| `getCustomerAnalytics` | `period` | `limit` | admin, director, general_manager, store_manager | Top customers, retention metrics |
| `getStaffPerformance` | `staffId`, `period` | `branchId` | admin, director, general_manager, store_manager | Individual staff performance |
| `getBranchComparison` | `period` | `branchIds` | admin, director | Cross-branch performance comparison |
| `getDriverAnalytics` | `period` | `driverId`, `branchId` | admin, director, general_manager, store_manager | Delivery stats and driver efficiency |
| `getTrendAnalysis` | `metric`, `period` | `branchId` | admin, director | Period-over-period comparison |
| `getNaturalLanguageQuery` | `query` | `branchId`, `timeframe` | admin, director | Process natural language business questions |
| `getDashboardSummary` | (none) | `branchId` | admin, director, general_manager, store_manager | Executive dashboard summary |

### AnalyticsAgent Capabilities (New -- to be added)

| Action | Required Params | Optional Params | Allowed Roles | Description |
|---|---|---|---|---|
| `getInsightSummary` | (none) | `branchId`, `types`, `severity` | admin, director, general_manager | Active insight counts by type and severity |
| `getRecommendationQueue` | (none) | `branchId`, `status`, `type` | admin, director, general_manager | Pending recommendations for user's tier |
| `getAnomalyReport` | (none) | `branchId`, `metric` | admin, director, general_manager | Current anomaly status for tracked metrics |
| `getForecastSummary` | (none) | `branchId`, `metric`, `horizonDays` | admin, director, general_manager | Forecast summary with deviation alerts |

---

## Appendix C: LLM Provider Configuration Reference

### Recommended Model Assignments for M5

| Agent Type | Agent Function | Provider | Model | Temperature | Max Tokens | Rationale |
|---|---|---|---|---|---|---|
| `analytics` | `analytics_insights` | openai | gpt-4 | 0.3 | 2000 | Low temperature for factual analysis. High token limit for detailed narratives. |
| `analytics` | `chat_response` | openai | gpt-4 | 0.5 | 1500 | Slightly higher temperature for conversational natural language queries. |
| `analytics` | `data_response` | openai | gpt-3.5-turbo | 0.2 | 1000 | Faster/cheaper model for structured data formatting. |

### Fallback Configuration

```json
{
  "enableFallback": true,
  "fallbackOrder": ["openai", "anthropic", "google", "local"],
  "requestTimeoutMs": 30000,
  "maxRetries": 2,
  "rateLimitPerMinute": 60
}
```

### Estimated LLM Costs (Monthly)

| Usage | Calls/Day | Avg Tokens/Call | Monthly Cost (OpenAI GPT-4) |
|---|---|---|---|
| Daily insight pipeline (8 insight types) | 8 | 3000 (in) + 2000 (out) | ~$14.40 |
| On-demand NL queries (10/day est.) | 10 | 2000 (in) + 1000 (out) | ~$9.00 |
| Recommendation generation (3/day est.) | 3 | 2000 (in) + 1500 (out) | ~$3.15 |
| Anomaly narrative (5/day est.) | 5 | 1500 (in) + 1000 (out) | ~$3.75 |
| Executive report narrative (4/month) | 0.13 | 5000 (in) + 3000 (out) | ~$0.30 |
| **Monthly Total (Estimated)** | | | **~$30.60** |

*Note: Costs assume GPT-4 pricing at $30/1M input tokens, $60/1M output tokens. Using GPT-3.5-turbo for data_response reduces costs by ~60% for those calls. Actual costs depend on usage patterns.*

---

**End of Module 5 -- AI Insight & Recommendation Engine Feature Spec**
