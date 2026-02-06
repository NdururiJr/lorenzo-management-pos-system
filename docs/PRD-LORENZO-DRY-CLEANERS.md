# Product Requirements Document (PRD)
## Lorenzo Dry Cleaners Management System

**Version:** 2.0
**Last Updated:** January 15, 2026
**Status:** Production Development
**Document Owner:** AI Agents Plus

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Business Objectives](#3-business-objectives)
4. [User Personas & Roles](#4-user-personas--roles)
5. [System Architecture](#5-system-architecture)
6. [Feature Specifications](#6-feature-specifications)
7. [Data Models & Schema](#7-data-models--schema)
8. [Integration Requirements](#8-integration-requirements)
9. [Security & Compliance](#9-security--compliance)
10. [Performance Requirements](#10-performance-requirements)
11. [Design System](#11-design-system)
12. [Implementation Status](#12-implementation-status)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Plan](#14-deployment-plan)
15. [Success Metrics](#15-success-metrics)
16. [Appendices](#appendices)

---

## 1. Executive Summary

### 1.1 Vision Statement

Build a comprehensive, AI-powered dry cleaning management system that transforms Lorenzo Dry Cleaners' operations through digital automation, real-time customer engagement, and data-driven business intelligence.

### 1.2 Project Snapshot

| Attribute | Value |
|-----------|-------|
| **Client** | Lorenzo Dry Cleaners, Kilimani, Nairobi, Kenya |
| **Developer** | AI Agents Plus |
| **Timeline** | 6 weeks (October 14 - December 19, 2025) |
| **Budget** | $10,000 USD |
| **Current Status** | ~65% Complete |
| **Technology** | Next.js 15 + Firebase + TypeScript |

### 1.3 Key Deliverables

1. **Point of Sale (POS) System** - Complete order lifecycle management
2. **Order Pipeline Board** - Visual Kanban-style workflow tracking
3. **Customer Portal** - Self-service order tracking and profile management
4. **Workstation Management** - 6-stage garment processing system
5. **Driver & Delivery System** - Route optimization and real-time tracking
6. **Executive Dashboards** - Director and GM operations views
7. **WhatsApp Integration** - Automated customer notifications
8. **Payment Processing** - M-Pesa, card, and cash payments

---

## 2. Project Overview

### 2.1 Background

Lorenzo Dry Cleaners operates multiple branches in Nairobi, Kenya, currently managing operations through manual processes and disparate systems. This creates inefficiencies in:

- Order tracking and status communication
- Staff productivity monitoring
- Customer engagement and retention
- Financial reporting and analytics
- Multi-branch coordination

### 2.2 Problem Statement

The current operational model suffers from:

1. **Manual Order Tracking** - Paper-based systems lead to lost orders and status confusion
2. **Poor Customer Communication** - Customers call repeatedly for order updates
3. **Inefficient Routing** - Drivers navigate without optimized routes
4. **Limited Visibility** - Management lacks real-time operational insights
5. **Fragmented Payments** - No unified payment tracking across methods
6. **Satellite Store Coordination** - Manual transfer management between branches

### 2.3 Solution Overview

A unified digital platform that:

- Digitizes the complete order lifecycle from reception to delivery
- Automates customer notifications via WhatsApp
- Optimizes delivery routes using Google Maps
- Provides real-time dashboards for executives
- Enables self-service customer portal
- Integrates multiple payment methods (M-Pesa, Card, Cash)
- Supports multi-branch operations with satellite store transfers

---

## 3. Business Objectives

### 3.1 Primary Goals

| Goal | Target | Measurement |
|------|--------|-------------|
| **Operational Efficiency** | 50% reduction in order processing time | Average time from received to ready |
| **Customer Satisfaction** | 4.5/5.0 average rating | Customer feedback surveys |
| **On-Time Delivery** | 95% delivery success rate | Orders delivered within promised window |
| **Staff Productivity** | 1.5 orders/staff-hour | Orders completed per staff member |
| **Digital Adoption** | 100% staff usage within 1 week | System login and activity metrics |
| **Customer Portal Adoption** | 60% registration within 3 months | Active customer portal accounts |

### 3.2 Success Criteria

**Technical KPIs:**
- System uptime: 99.9%+
- API response time: < 500ms (P95)
- Page load time: < 2 seconds (P90)
- Error rate: < 0.1%

**Business KPIs:**
- Order processing time: < 2 minutes (POS entry)
- WhatsApp message delivery: 95%+
- Payment success rate: 98%+
- Route optimization savings: 20% fuel reduction

### 3.3 Return on Investment

| Investment | Expected Return |
|------------|-----------------|
| Development Cost: $10,000 | Staff time savings: $2,000/month |
| Integration Costs: $500/month | Customer retention increase: 15% |
| Hosting Costs: $200/month | Delivery efficiency: 20% cost reduction |
| **Total Year 1:** ~$18,400 | **Estimated Savings:** $36,000+ |

---

## 4. User Personas & Roles

### 4.1 Role Hierarchy

```
Admin (Super Admin)
├── Director (Lawrence) - Strategic oversight
│   └── General Manager (Grace) - Operations management
│       ├── Store Manager - Branch operations
│       │   ├── Workstation Manager - Processing oversight
│       │   │   └── Workstation Staff - Garment processing
│       │   ├── Front Desk - POS operations
│       │   └── Satellite Staff - Satellite store operations
│       └── Driver - Delivery operations
└── Customer - Self-service portal
```

### 4.2 Detailed Role Specifications

#### 4.2.1 Admin
**Responsibilities:** Full system configuration and user management
**Access Level:** All features, all branches
**Key Actions:**
- Create/manage user accounts
- Configure system settings
- Access audit logs
- Manage pricing rules
- Branch configuration

#### 4.2.2 Director
**Responsibilities:** Strategic business oversight and executive decisions
**Access Level:** All branches (read), strategic dashboards
**Key Actions:**
- View cross-branch analytics
- Approve permission requests from GM
- Access financial reports
- Monitor operational health
- AI-powered recommendations

**Dashboard Features:**
- Command Center with KPIs
- Branch performance comparison
- Risk radar and opportunity alerts
- Executive narrative/morning briefing
- Strategic intelligence pages

#### 4.2.3 General Manager (GM)
**Responsibilities:** Day-to-day operations management
**Access Level:** All branches (read/limited write)
**Key Actions:**
- Cross-branch order monitoring
- Staff performance tracking
- Equipment status management
- Issue resolution
- Request Director approvals

**Dashboard Features:**
- Live order queue (all branches)
- Staff attendance and productivity
- Equipment utilization
- Branch efficiency metrics
- Permission request creation

#### 4.2.4 Store Manager
**Responsibilities:** Single branch operations
**Access Level:** Assigned branch only
**Key Actions:**
- Order management
- Staff scheduling
- Inventory management
- Customer issue resolution
- Local reporting

#### 4.2.5 Workstation Manager
**Responsibilities:** Processing workflow oversight
**Access Level:** Workstation features, assigned branch
**Key Actions:**
- Approve major issues
- Batch assignment
- Quality control
- Staff performance monitoring
- Process optimization

#### 4.2.6 Workstation Staff
**Responsibilities:** Garment processing
**Access Level:** Processing queue only
**Key Actions:**
- Detailed garment inspection
- Stage progression updates
- Issue flagging
- Quality documentation

#### 4.2.7 Front Desk
**Responsibilities:** Customer-facing operations
**Access Level:** POS, customer management
**Key Actions:**
- Order creation
- Customer registration
- Payment processing
- Receipt generation
- Initial garment inspection

#### 4.2.8 Satellite Staff
**Responsibilities:** Satellite store operations
**Access Level:** Satellite-specific features
**Key Actions:**
- Order creation (satellite)
- Transfer batch initiation
- Customer service
- Local inventory

#### 4.2.9 Driver
**Responsibilities:** Pickup and delivery operations
**Access Level:** Assigned deliveries only
**Key Actions:**
- View assigned routes
- Update delivery status
- Collect payments
- Capture proof of delivery
- GPS location sharing

#### 4.2.10 Customer
**Responsibilities:** Self-service order management
**Access Level:** Own orders and profile only
**Key Actions:**
- Track order status
- View order history
- Manage addresses
- Download receipts
- Request pickups
- Provide feedback

---

## 5. System Architecture

### 5.1 Technology Stack

#### Frontend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 15.5.4 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.1.0 |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | Latest |
| State Management | React Context + TanStack Query | 5.90.2 |
| Forms | React Hook Form + Zod | 7.65.0 / 3.25.76 |
| Charts | Recharts | 3.3.0 |
| Maps | @react-google-maps/api | 2.20.7 |
| PDF Generation | jsPDF | 3.0.3 |
| Animations | Framer Motion | 12.23.24 |
| Icons | Lucide React | 0.545.0 |

#### Backend
| Component | Technology | Version |
|-----------|------------|---------|
| Database | Firebase Firestore | Latest |
| Authentication | Firebase Auth | Latest |
| Storage | Firebase Storage | Latest |
| Functions | Firebase Cloud Functions | Node.js 20 |
| Admin SDK | firebase-admin | 13.5.0 |
| AI | OpenAI API | 6.15.0 |
| Email | Resend | 6.2.0 |

#### Third-Party Integrations
| Service | Provider | Purpose |
|---------|----------|---------|
| WhatsApp | Wati.io | Customer notifications |
| Payments | Pesapal v3 | M-Pesa, Card payments |
| Maps | Google Maps Platform | Route optimization, geocoding |
| AI | OpenAI GPT-4 | Insights, time estimation |
| Email | Resend | Receipt delivery |

### 5.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   POS App    │  │Customer Portal│  │ Driver App  │          │
│  │  (Desktop)   │  │   (Mobile)   │  │  (Mobile)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                           │                                      │
│                    Next.js 15 (App Router)                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Next.js API Routes                      │  │
│  │  /api/orders  /api/payments  /api/webhooks  /api/auth    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │   Wati.io  │  │  Pesapal   │  │Google Maps │  │  OpenAI  │  │
│  │  WhatsApp  │  │  Payments  │  │   Routes   │  │    AI    │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Firebase Platform                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ Firestore  │  │   Auth     │  │  Storage   │         │  │
│  │  │ (Database) │  │  (Users)   │  │  (Files)   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Database Collections

| Collection | Purpose | Document Count (Est.) |
|------------|---------|----------------------|
| `users` | Staff accounts | 50-100 |
| `customers` | Customer profiles | 1,000-10,000 |
| `orders` | Order records | 10,000-100,000/year |
| `transactions` | Payment records | 10,000-100,000/year |
| `branches` | Branch configuration | 5-10 |
| `deliveries` | Delivery batches | 1,000-5,000/year |
| `inventory` | Stock items | 100-500 |
| `notifications` | Message queue | 50,000-200,000/year |
| `pricing` | Service pricing | 50-100 |
| `attendance` | Staff clock-in/out | 10,000-50,000/year |
| `equipment` | Equipment status | 50-100 |
| `issues` | Operational issues | 500-2,000/year |
| `customerFeedback` | Reviews/ratings | 1,000-5,000/year |
| `permissionRequests` | Approval workflows | 100-500/year |
| `transferBatches` | Inter-branch transfers | 500-2,000/year |
| `processingBatches` | Workstation batches | 5,000-20,000/year |
| `auditLogs` | System audit trail | 100,000+/year |

---

## 6. Feature Specifications

### 6.1 Point of Sale (POS) System

**Priority:** P0 (Critical)
**Status:** ✅ Complete
**Location:** `/app/(dashboard)/pos/page.tsx`

#### 6.1.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| POS-001 | Customer search by name/phone | ✅ |
| POS-002 | New customer registration with phone validation | ✅ |
| POS-003 | Garment entry with type, color, brand, services | ✅ |
| POS-004 | Photo upload for each garment | ✅ |
| POS-005 | Multiple garment support per order | ✅ |
| POS-006 | Automatic price calculation | ✅ |
| POS-007 | Initial inspection (notable damages) | ✅ |
| POS-008 | Payment methods: Cash, M-Pesa, Card, Credit | ✅ |
| POS-009 | Partial payment support | ✅ |
| POS-010 | Receipt generation (PDF) | ✅ |
| POS-011 | Receipt email delivery | ✅ |
| POS-012 | Collection method selection (drop-off/pickup) | ✅ |
| POS-013 | Return method selection (collect/delivery) | ✅ |
| POS-014 | Address management with Google Places | ✅ |

#### 6.1.2 User Flow

```
1. Customer Search/Creation
   └── Search existing OR create new
       └── Phone validation (+254 format)
       └── Address entry with autocomplete

2. Garment Entry
   └── Select service category
   └── Choose garment type
   └── Add services (wash, iron, etc.)
   └── Upload photos (optional)
   └── Initial inspection
       └── Notable damages? → Photo + notes

3. Order Summary
   └── Review garments and prices
   └── Apply discounts/promotions
   └── Select collection method
   └── Select return method

4. Payment Processing
   └── Choose payment method
   └── Process payment (full/partial)
   └── Generate receipt

5. Order Confirmation
   └── WhatsApp notification sent
   └── Receipt printed/emailed
   └── Order appears in pipeline
```

#### 6.1.3 Business Rules

- **Order ID Format:** `ORD-[BRANCH]-[YYYYMMDD]-[####]`
- **Garment ID Format:** `[ORDER-ID]-G[##]`
- **Phone Validation:** Must match Kenyan format (+254XXXXXXXXX)
- **Customer Deduplication:** Phone number must be unique
- **Minimum Order:** No minimum; single garment allowed
- **Estimated Completion:**
  - Base: 48 hours
  - Express: 24 hours (50% reduction)
  - Large orders (>10 items): +24 hours
  - Very large orders (>20 items): +48 hours

---

### 6.2 Order Pipeline Board

**Priority:** P0 (Critical)
**Status:** ✅ Complete
**Location:** `/app/(dashboard)/pipeline/page.tsx`

#### 6.2.1 Pipeline Stages

| Stage | Description | Typical Duration |
|-------|-------------|------------------|
| `received` | Order created at POS | Immediate |
| `queued` | Awaiting processing | 0-4 hours |
| `washing` | Washing in progress | 1-2 hours |
| `drying` | Drying in progress | 1-2 hours |
| `ironing` | Ironing in progress | 1-3 hours |
| `quality_check` | Final inspection | 15-30 minutes |
| `packaging` | Packaging for return | 15-30 minutes |
| `ready` | Ready for collection/delivery | Until pickup |
| `out_for_delivery` | Driver en route | 1-4 hours |
| `delivered` | Delivered to customer | Final |
| `collected` | Customer collected | Final |

#### 6.2.2 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| PIP-001 | Visual Kanban board with columns per status | ✅ |
| PIP-002 | Real-time updates via Firestore listeners | ✅ |
| PIP-003 | Drag-and-drop status updates | ✅ |
| PIP-004 | Filter by branch, date, customer, order ID | ✅ |
| PIP-005 | Pipeline statistics dashboard | ✅ |
| PIP-006 | Staff assignment tracking | ✅ |
| PIP-007 | Status history with timestamps | ✅ |
| PIP-008 | Mobile-responsive scrollable columns | ✅ |

---

### 6.3 Customer Portal

**Priority:** P1 (High)
**Status:** ✅ Complete
**Location:** `/app/(customer)/portal/`

#### 6.3.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| CUS-001 | Phone OTP authentication | ✅ |
| CUS-002 | Order tracking with real-time status | ✅ |
| CUS-003 | Visual status timeline | ✅ |
| CUS-004 | Estimated completion display | ✅ |
| CUS-005 | Live driver location (Google Maps) | ✅ |
| CUS-006 | Address management (add/edit/delete) | ✅ |
| CUS-007 | Profile editing (name, phone, email) | ✅ |
| CUS-008 | Notification preferences | ✅ |
| CUS-009 | Order history with filters | ✅ |
| CUS-010 | Receipt download (PDF) | ✅ |
| CUS-011 | Re-order functionality | ✅ |
| CUS-012 | Pickup request scheduling | ✅ |
| CUS-013 | Feedback/rating submission | ✅ |

---

### 6.4 Workstation Management System

**Priority:** P0 (Critical)
**Status:** ✅ Complete
**Location:** `/app/(dashboard)/workstation/page.tsx`

#### 6.4.1 Processing Stages

| Stage | Interface | Staff Role |
|-------|-----------|------------|
| Inspection | `InspectionQueue.tsx` | Workstation Staff |
| Washing | Stage interface | Workstation Staff |
| Drying | `DryingStation.tsx` | Workstation Staff |
| Ironing | `IroningStation.tsx` | Workstation Staff |
| Quality Check | `QualityCheckStation.tsx` | Workstation Manager |
| Packaging | `PackagingStation.tsx` | Workstation Staff |

#### 6.4.2 Inspection Workflow

**Stage 1 - Initial Inspection (POS)**
- Notable damages documentation
- Photo upload (required for damages)
- Basic condition assessment

**Stage 2 - Detailed Inspection (Workstation)**
- Comprehensive defect assessment
- Stain details with location mapping
- Rip/tear documentation
- Missing buttons count
- Recommended actions
- Additional time estimation
- Photo evidence (multiple)

#### 6.4.3 Major Issues Workflow

```
1. Staff detects major issue
   └── Document with photos (required)
   └── Flag for manager approval

2. Workstation Manager reviews
   └── Approve to proceed
   └── Reject with notes
   └── Escalate to customer contact

3. Resolution
   └── Customer notified via WhatsApp
   └── Processing continues or halts
```

#### 6.4.4 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| WRK-001 | Initial inspection at POS | ✅ |
| WRK-002 | Detailed workstation inspection | ✅ |
| WRK-003 | Batch processing creation | ✅ |
| WRK-004 | Stage-specific interfaces (6 stages) | ✅ |
| WRK-005 | Staff assignment tracking | ✅ |
| WRK-006 | Performance metrics per staff | ✅ |
| WRK-007 | Major issues with photo documentation | ✅ |
| WRK-008 | Manager approval workflow | ✅ |
| WRK-009 | Processing time tracking | ✅ |
| WRK-010 | Quality metrics dashboard | ✅ |

---

### 6.5 Delivery & Driver Management

**Priority:** P1 (High)
**Status:** ⚠️ 70% Complete
**Location:** `/app/(dashboard)/deliveries/page.tsx`

#### 6.5.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| DEL-001 | Delivery batch creation from ready orders | ✅ |
| DEL-002 | Driver assignment with capacity | ✅ |
| DEL-003 | Address geocoding (Google) | ✅ |
| DEL-004 | Route optimization (TSP algorithm) | ✅ |
| DEL-005 | Distance/time estimation | ✅ |
| DEL-006 | Map visualization with markers | ✅ |
| DEL-007 | Delivery status tracking | ✅ |
| DEL-008 | Real-time driver GPS tracking | ⚠️ Partial |
| DEL-009 | Driver mobile interface | ⚠️ Basic |
| DEL-010 | Delivery confirmation with photo | ❌ Pending |
| DEL-011 | Turn-by-turn navigation | ❌ Pending |
| DEL-012 | Customer notification (driver nearby) | ✅ |

#### 6.5.2 Route Optimization

**Algorithm:** Traveling Salesman Problem (TSP) approximation
**API:** Google Directions API with waypoint optimization
**Constraints:**
- Maximum 25 waypoints per route
- Driver capacity limits
- Time window considerations
- Traffic-aware routing

---

### 6.6 WhatsApp Integration (Wati.io)

**Priority:** P1 (High)
**Status:** ✅ Complete
**Location:** `/services/wati.ts`

#### 6.6.1 Message Templates

| Template | Trigger | Content |
|----------|---------|---------|
| `order_confirmation` | Order created | Order ID, items, estimated completion |
| `order_ready` | Status = ready | Pickup location, business hours |
| `driver_dispatched` | Delivery assigned | Driver name, vehicle, ETA |
| `driver_nearby` | ETA < 5 minutes | Arrival notification |
| `order_delivered` | Status = delivered | Thank you message, feedback link |
| `payment_reminder` | Unpaid balance | Amount due, payment options |

#### 6.6.2 Technical Specifications

- **Authentication:** Bearer token (API Key)
- **Rate Limit:** 100 messages/second
- **Retry Logic:** 3 attempts with exponential backoff
- **Fallback:** SMS via alternative provider
- **Logging:** All messages logged to Firestore

---

### 6.7 Payment Processing (Pesapal)

**Priority:** P0 (Critical)
**Status:** ✅ Complete
**Location:** `/services/pesapal.ts`

#### 6.7.1 Supported Payment Methods

| Method | Provider | Processing Time |
|--------|----------|-----------------|
| M-Pesa | Pesapal | Instant |
| Card (Visa/MC) | Pesapal | Instant |
| Cash | Manual | Instant |
| Credit Account | Internal | Deferred |

#### 6.7.2 Payment Flow

```
1. Initiate Payment
   └── Generate Pesapal order
   └── Redirect to payment page (or STK push for M-Pesa)

2. Customer Completes Payment
   └── Pesapal processes transaction
   └── IPN webhook triggered

3. Verify & Update
   └── Verify callback signature
   └── Update transaction status
   └── Update order payment status

4. Notification
   └── WhatsApp receipt (if full payment)
   └── Payment confirmation message
```

#### 6.7.3 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| PAY-001 | M-Pesa STK push | ✅ |
| PAY-002 | Card payment redirect | ✅ |
| PAY-003 | Cash payment recording | ✅ |
| PAY-004 | Credit account (deferred) | ✅ |
| PAY-005 | Partial payment support | ✅ |
| PAY-006 | Payment status tracking | ✅ |
| PAY-007 | Refund processing | ✅ |
| PAY-008 | IPN webhook handling | ✅ |
| PAY-009 | Signature verification | ✅ |

---

### 6.8 Executive Dashboards

**Priority:** P1 (High)
**Status:** ⚠️ 80% Complete

#### 6.8.1 Director Dashboard

**Location:** `/app/(dashboard)/dashboard/page.tsx` (role-based)
**Status:** ✅ Complete

**Features:**
- Command Center with real-time KPIs
- Executive narrative (morning briefing)
- AI-powered recommendations
- Risk radar and opportunity alerts
- Branch performance comparison
- Operational health indicators
- Predictive analytics charts

**Strategic Sidebar Pages:**
| Page | Purpose | Status |
|------|---------|--------|
| Intelligence | Market analysis, sentiment | ✅ |
| Financial Command | P&L, cash flow, budget vs actual | ✅ |
| Growth Hub | Expansion, new services | ✅ |
| Performance Deep Dive | KPI history, cohort analysis | ✅ |
| Risk & Compliance | Risk register, incidents | ✅ |
| Leadership & People | Manager scorecards | ✅ |
| Board Room | Report generator, meeting prep | ✅ |
| AI Strategy Lab | Scenario builder, simulations | ✅ |

#### 6.8.2 GM Dashboard

**Location:** `/app/(dashboard)/gm/`
**Status:** ⚠️ 70% Complete (security rules needed)

**Features:**
- Live order queue (cross-branch)
- Staff attendance and productivity
- Equipment utilization monitoring
- Branch efficiency metrics
- Permission request management

**Branch Efficiency Formula:**
| Component | Weight | Calculation |
|-----------|--------|-------------|
| Turnaround Efficiency | 25% | `100 - ((Actual - Target) / Target × 100)` |
| Staff Productivity | 25% | `(Orders/Staff-Hour) / Target × 100` |
| Equipment Utilization | 20% | `(Running/Available) / 75% × 100` |
| Revenue Achievement | 20% | `(Actual/Target) × 100` |
| Customer Satisfaction | 10% | `(Rating/5.0) × 100` |

---

### 6.9 Satellite Store Integration

**Priority:** P0 (Critical)
**Status:** ✅ Complete
**Location:** `/lib/db/inventory-transfers.ts`

#### 6.9.1 Transfer Workflow

```
1. Satellite creates order
   └── originBranchId = satellite
   └── destinationBranchId = main store

2. Transfer batch created
   └── Multiple orders grouped
   └── Driver auto-assigned

3. Transfer in progress
   └── Driver picks up from satellite
   └── GPS tracking enabled

4. Main store receives
   └── Batch confirmation
   └── Orders enter main store pipeline

5. Processing at main store
   └── Standard workstation flow
   └── Track processing batch

6. Return to customer
   └── Delivery to customer address OR
   └── Return to satellite for collection
```

---

### 6.10 Inventory Management

**Priority:** P1 (High)
**Status:** ✅ Complete
**Location:** `/app/(dashboard)/inventory/page.tsx`

#### 6.10.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| INV-001 | Stock item management | ✅ |
| INV-002 | Stock level tracking | ✅ |
| INV-003 | Low stock alerts | ✅ |
| INV-004 | Reorder level configuration | ✅ |
| INV-005 | Usage analytics | ✅ |
| INV-006 | Inter-branch transfers | ✅ |
| INV-007 | Supplier management | ✅ |
| INV-008 | Cost tracking | ✅ |

---

### 6.11 Employee Management

**Priority:** P1 (High)
**Status:** ✅ Complete
**Location:** `/app/(dashboard)/employees/page.tsx`

#### 6.11.1 Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| EMP-001 | Staff creation and management | ✅ |
| EMP-002 | Role assignment | ✅ |
| EMP-003 | Branch assignment | ✅ |
| EMP-004 | Attendance clock-in/out | ✅ |
| EMP-005 | Shift scheduling | ⚠️ Basic |
| EMP-006 | Performance metrics | ✅ |
| EMP-007 | Productivity tracking | ✅ |

---

## 7. Data Models & Schema

### 7.1 Core Entities

#### 7.1.1 User

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  phone: string;
  role: UserRole;                 // 10 role types
  name: string;
  branchId: string;
  createdAt: Timestamp;
  active: boolean;
  customClaims?: {
    role: UserRole;
    branchId: string;
    isSuperAdmin: boolean;
    branchAccess: string[];
  };
}

type UserRole =
  | 'admin'
  | 'director'
  | 'general_manager'
  | 'store_manager'
  | 'workstation_manager'
  | 'workstation_staff'
  | 'satellite_staff'
  | 'front_desk'
  | 'driver'
  | 'customer';
```

#### 7.1.2 Customer

```typescript
interface Customer {
  customerId: string;             // CUST-[TIMESTAMP]-[RANDOM]
  name: string;
  phone: string;                  // Unique, +254 format
  email?: string;
  addresses: Address[];
  preferences: {
    notifications: boolean;
    language: 'en' | 'sw';
  };
  createdAt: Timestamp;
  orderCount: number;             // Denormalized
  totalSpent: number;             // Denormalized
}

interface Address {
  id: string;
  label: string;                  // Home, Work, etc.
  address: string;
  coordinates: { lat: number; lng: number };
  isDefault: boolean;
}
```

#### 7.1.3 Order

```typescript
interface Order {
  orderId: string;                // ORD-[BRANCH]-[YYYYMMDD]-[####]
  customerId: string;
  branchId: string;
  status: OrderStatus;
  garments: Garment[];

  // Financials
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: PaymentMethod;

  // Timing
  estimatedCompletion: Timestamp;
  actualCompletion?: Timestamp;
  createdAt: Timestamp;
  createdBy: string;

  // Collection
  collectionMethod: 'dropped_off' | 'pickup_required';
  pickupAddress?: string;
  pickupScheduledTime?: Timestamp;
  pickupAssignedTo?: string;

  // Return
  returnMethod: 'customer_collects' | 'delivery_required';
  deliveryAddress?: string;
  deliveryScheduledTime?: Timestamp;
  deliveryAssignedTo?: string;

  // Satellite Store
  originBranchId?: string;
  destinationBranchId?: string;
  transferBatchId?: string;

  // Workstation
  majorIssuesDetected: boolean;
  majorIssuesReviewedBy?: string;
  processingBatchId?: string;
  deliveryId?: string;

  specialInstructions?: string;
}

type OrderStatus =
  | 'received' | 'queued'
  | 'washing' | 'drying' | 'ironing'
  | 'quality_check' | 'packaging'
  | 'ready' | 'out_for_delivery'
  | 'delivered' | 'collected';

type PaymentMethod = 'cash' | 'mpesa' | 'card' | 'credit';
```

#### 7.1.4 Garment

```typescript
interface Garment {
  garmentId: string;              // [ORDER-ID]-G[##]
  type: string;
  color: string;
  brand?: string;
  services: string[];
  price: number;
  status: OrderStatus;
  specialInstructions?: string;

  // Initial Inspection (POS - Stage 1)
  hasNotableDamage: boolean;
  initialInspectionNotes?: string;
  initialInspectionPhotos?: string[];

  // Detailed Inspection (Workstation - Stage 2)
  inspectionCompleted: boolean;
  inspectionCompletedBy?: string;
  inspectionCompletedAt?: Timestamp;
  conditionAssessment?: 'good' | 'minor_issues' | 'major_issues';
  missingButtonsCount?: number;
  stainDetails?: StainDetail[];
  ripDetails?: RipDetail[];
  damagePhotos?: string[];
  recommendedActions?: string[];
  estimatedAdditionalTime?: number;

  // Process Tracking
  stageHandlers: {
    inspection?: string;
    washing?: string;
    drying?: string;
    ironing?: string;
    quality_check?: string;
    packaging?: string;
  };
  stageDurations?: {
    [stage: string]: number;      // Minutes per stage
  };
}
```

#### 7.1.5 Branch

```typescript
interface Branch {
  branchId: string;
  name: string;
  branchType: 'main' | 'satellite';
  mainStoreId?: string;           // For satellites
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  contactPhone: string;
  active: boolean;
  createdAt: Timestamp;

  // Targets
  dailyTarget: number;            // Revenue target (KES)
  targetTurnaroundHours: number;  // Default: 24
  driverAvailability?: number;    // Capacity
}
```

#### 7.1.6 Transaction

```typescript
interface Transaction {
  transactionId: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  pesapalRef?: string;
  timestamp: Timestamp;
  processedBy: string;
  refundReason?: string;
  refundedAt?: Timestamp;
}
```

#### 7.1.7 Delivery

```typescript
interface Delivery {
  deliveryId: string;
  driverId: string;
  orders: string[];               // Order IDs
  route: {
    optimized: boolean;
    stops: DeliveryStop[];
    distance: number;             // km
    estimatedDuration: number;    // minutes
  };
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Timestamp;
  endTime?: Timestamp;
}

interface DeliveryStop {
  orderId: string;
  address: string;
  coordinates: { lat: number; lng: number };
  sequence: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp?: Timestamp;
  notes?: string;
  photoProof?: string;
}
```

---

## 8. Integration Requirements

### 8.1 Wati.io (WhatsApp)

| Attribute | Value |
|-----------|-------|
| **API Endpoint** | `https://live-server-{number}.wati.io/api/v1` |
| **Authentication** | Bearer token (API Key) |
| **Rate Limit** | 100 messages/second |
| **Retry Policy** | 3 attempts, exponential backoff |
| **Fallback** | SMS via alternative provider |

**Environment Variables:**
```
WATI_ACCESS_TOKEN=your_api_key
WATI_API_ENDPOINT=https://live-server-XX.wati.io
```

### 8.2 Pesapal (Payments)

| Attribute | Value |
|-----------|-------|
| **API Version** | v3 |
| **Sandbox URL** | `https://cybqa.pesapal.com/pesapalv3` |
| **Production URL** | `https://pay.pesapal.com/v3` |
| **Authentication** | OAuth 2.0 |
| **IPN Callback** | `/api/webhooks/pesapal` |

**Environment Variables:**
```
PESAPAL_CONSUMER_KEY=your_key
PESAPAL_CONSUMER_SECRET=your_secret
PESAPAL_API_URL=https://pay.pesapal.com/v3
```

### 8.3 Google Maps Platform

| API | Purpose | Quota |
|-----|---------|-------|
| Directions API | Route calculation | 2,500/day (free) |
| Distance Matrix API | Distance/time | 2,500/day (free) |
| Geocoding API | Address validation | 2,500/day (free) |
| Places API | Address autocomplete | 2,500/day (free) |

**Environment Variables:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

### 8.4 OpenAI (AI Features)

| Feature | Model | Usage |
|---------|-------|-------|
| Time Estimation | GPT-4 | Order completion prediction |
| Analytics Insights | GPT-4 | Business intelligence |
| Report Summaries | GPT-4 | Executive briefings |

**Environment Variables:**
```
OPENAI_API_KEY=your_key
```

### 8.5 Resend (Email)

| Feature | Usage |
|---------|-------|
| Receipt Delivery | Order receipts via email |
| Transactional | Password reset, notifications |

**Environment Variables:**
```
RESEND_API_KEY=your_key
```

---

## 9. Security & Compliance

### 9.1 Authentication

| Method | Use Case | Implementation |
|--------|----------|----------------|
| Email/Password | Staff login | Firebase Auth |
| Phone OTP | Customer login | Firebase Auth |
| JWT Tokens | API authorization | Firebase custom claims |
| Session Cookies | Web sessions | httpOnly, secure |

### 9.2 Authorization

**Role-Based Access Control (RBAC):**
- Custom claims on Firebase Auth tokens
- Component-level rendering based on role
- API endpoint middleware validation
- Firestore security rules per collection

**Security Rules Strategy:**
```javascript
// Example: Orders collection
match /orders/{orderId} {
  allow read: if isAuthenticated() && (
    isSuperAdmin() ||
    isExecutive() ||
    (isStaff() && canAccessBranch(resource.data.branchId)) ||
    resource.data.customerId == currentUserId()
  );

  allow create: if isStaff() &&
    canAccessBranch(request.resource.data.branchId);

  allow update: if isStaff() &&
    canAccessBranch(resource.data.branchId);
}
```

### 9.3 Data Protection

| Aspect | Implementation |
|--------|----------------|
| **In Transit** | TLS 1.3 (HTTPS) |
| **At Rest** | AES-256 (Firebase default) |
| **Backups** | Daily automated, encrypted |
| **PII Handling** | Phone/email encrypted |

### 9.4 Compliance

| Regulation | Status |
|------------|--------|
| Kenya Data Protection Act | ✅ Compliant |
| PCI DSS (via Pesapal) | ✅ Compliant |
| GDPR (awareness) | ✅ Principles applied |

### 9.5 Security Best Practices

- [ ] Input validation on all forms (Zod)
- [ ] SQL injection prevention (Firestore parameterized)
- [ ] XSS protection (React escaping)
- [ ] CSRF protection (SameSite cookies)
- [ ] Rate limiting on API endpoints
- [ ] Audit logging for sensitive operations
- [ ] Secret management (environment variables)

---

## 10. Performance Requirements

### 10.1 Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time (P90) | < 2 seconds | ~1.5s |
| API Response Time (P95) | < 500ms | ~300ms |
| Database Query Time | < 100ms (simple) | ~50ms |
| Concurrent Users | 100+ per branch | Untested |
| System Uptime | 99.9% | TBD |
| Error Rate | < 0.1% | TBD |

### 10.2 Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| **Caching** | TanStack Query with stale-while-revalidate |
| **Database Indexing** | 43 composite indexes defined |
| **Code Splitting** | Next.js automatic chunking |
| **Image Optimization** | Next.js Image component |
| **CDN** | Vercel Edge Network |
| **Lazy Loading** | Dynamic imports for heavy components |

### 10.3 Scalability

- **Horizontal:** Firebase auto-scales reads/writes
- **Geographic:** Multi-region deployment possible
- **Data:** Archival strategy for old orders (>1 year)

---

## 11. Design System

### 11.1 Color Palette

**Primary Theme (Black & White):**
| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#FFFFFF` | 90%+ of UI |
| Text Primary | `#000000` | Headings, important text |
| Text Secondary | `#6B7280` | Descriptions, labels |
| Borders | `#E5E7EB` | Dividers, input borders |
| Light Background | `#F9FAFB` | Cards, hover states |

**Accent Colors (Sparingly):**
| Color | Hex | Usage |
|-------|-----|-------|
| Success | `#10B981` | Completed, approved |
| Warning | `#F59E0B` | Attention needed |
| Error | `#EF4444` | Errors, critical |
| Info | `#3B82F6` | Information, links |

**Alternative Theme (Teal & Gold):**
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Teal | `#2DD4BF` | Buttons, accents |
| Dark Teal | `#0F3D38` | Text, headers |
| Gold Accent | `#C9A962` | Premium highlights |
| Cream | `#F5F5F0` | Background |

### 11.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 48px | 700 |
| H2 | Inter | 36px | 600 |
| H3 | Inter | 24px | 600 |
| H4 | Inter | 20px | 500 |
| Body | Inter | 16px | 400 |
| Small | Inter | 14px | 400 |
| Caption | Inter | 12px | 400 |

### 11.3 Component Library

**Base Components (shadcn/ui):**
- Button, Input, Label, Card, Dialog
- Dropdown Menu, Select, Checkbox, Radio
- Textarea, Badge, Alert, Toast
- Tabs, Table, Avatar, Separator
- Skeleton, Breadcrumb, Popover, Calendar

**Custom Components (Modern Design):**
- ModernButton, ModernCard, ModernInput
- ModernSidebar, ModernStatCard, ModernBadge
- ModernPipelineColumn, ModernPipelineStats
- ModernLayout, ModernPerformanceChart

### 11.4 Design Principles

1. **Minimalistic** - Clean layouts, generous whitespace
2. **High Contrast** - 4.5:1 ratio minimum (WCAG AA)
3. **Mobile-First** - Design for mobile, enhance for desktop
4. **Accessible** - WCAG 2.1 Level AA compliance
5. **Consistent** - Uniform spacing, typography, colors
6. **Responsive** - Fluid layouts, breakpoint-aware

---

## 12. Implementation Status

### 12.1 Overall Progress

| Milestone | Target Date | Status | Completion |
|-----------|-------------|--------|------------|
| **M1: Foundation** | Oct 25, 2025 | ✅ Complete | 100% |
| **M2: Core Modules** | Nov 8, 2025 | ✅ Complete | 85% |
| **M3: Advanced Features** | Nov 15, 2025 | 🔄 In Progress | 75% |
| **M4: Testing & Launch** | Dec 19, 2025 | ⏳ Pending | 0% |
| **Overall** | Dec 19, 2025 | 🔄 In Progress | **65%** |

### 12.2 Feature Status

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| POS System | P0 | ✅ 100% | Production-ready |
| Order Pipeline | P0 | ✅ 100% | Real-time Kanban |
| Customer Portal | P1 | ✅ 100% | OTP auth, tracking |
| Workstation System | P0 | ✅ 100% | 6-stage processing |
| WhatsApp Integration | P1 | ✅ 100% | 6 templates |
| Payment Processing | P0 | ✅ 100% | Pesapal integrated |
| Delivery Management | P1 | ⚠️ 70% | GPS tracking pending |
| Director Dashboard | P1 | ✅ 100% | AI recommendations |
| GM Dashboard | P1 | ⚠️ 70% | Security rules needed |
| Inventory Management | P1 | ✅ 100% | Stock tracking |
| Employee Management | P1 | ✅ 100% | Attendance tracking |
| AI Features | P2 | ⚠️ 30% | Time estimation only |
| Testing Suite | P1 | ⏳ 20% | 13 test files |

### 12.3 Known Issues

**Critical (Must Fix Before Launch):**
1. Firebase security rules missing for: attendance, equipment, issues, customerFeedback, permissionRequests
2. Executive cross-branch access not working (isExecutive() helper needed)

**High Priority:**
1. Driver real-time GPS tracking incomplete
2. Delivery confirmation workflow (photo proof) not implemented

**Medium Priority:**
1. Test coverage below 80% target
2. AI analytics insights not generating

---

## 13. Testing Strategy

### 13.1 Test Types

| Type | Framework | Coverage Target |
|------|-----------|-----------------|
| Unit Tests | Jest | 80%+ |
| Integration Tests | Jest | Key workflows |
| E2E Tests | Playwright | Critical paths |
| Performance Tests | Custom | Load scenarios |

### 13.2 Test Files

| File | Purpose | Status |
|------|---------|--------|
| `pos-order-creation.spec.ts` | POS workflow | ✅ |
| `customer-portal.spec.ts` | Customer flows | ✅ |
| `order-lifecycle.test.ts` | Order flow | ✅ |
| `pricing.test.ts` | Price calculation | ✅ |
| `validation.test.ts` | Input validation | ✅ |
| `payment-service.test.ts` | Payment processing | ✅ |
| `transactions.test.ts` | Transaction handling | ✅ |
| `status-transitions.test.ts` | Pipeline logic | ✅ |

### 13.3 Test Scenarios

**Critical Path Tests:**
1. Order creation to completion
2. Customer registration and login
3. Payment processing (all methods)
4. WhatsApp notification delivery
5. Delivery batch and route optimization

---

## 14. Deployment Plan

### 14.1 Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:3000 | Local development |
| Staging | staging.lorenzo.app | Pre-production testing |
| Production | app.lorenzo.co.ke | Live system |

### 14.2 Deployment Checklist

**Pre-Deployment:**
- [ ] All critical bugs fixed
- [ ] UAT completed with client
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Backup strategy verified

**Deployment Day:**
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Get client approval
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Monitor for 2 hours
- [ ] Notify team

**Post-Deployment:**
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify integrations
- [ ] Collect user feedback
- [ ] Document issues

### 14.3 Rollback Plan

1. Revert environment variables to previous version
2. Redeploy previous build from Vercel
3. Verify rollback success
4. Investigate failure cause
5. Plan remediation

---

## 15. Success Metrics

### 15.1 Technical KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| System Uptime | 99.9%+ | Firebase/Vercel monitoring |
| API Response (P95) | < 500ms | Application logs |
| Page Load (P90) | < 2 seconds | Web Vitals |
| Error Rate | < 0.1% | Sentry/logs |
| Test Coverage | 80%+ | Jest coverage report |

### 15.2 Business KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Order Processing | < 2 minutes | POS entry time |
| On-Time Delivery | 95%+ | Delivery vs promised time |
| Customer Satisfaction | 4.5/5.0 | Feedback ratings |
| Staff Adoption | 100% in 1 week | Login activity |
| Portal Registration | 60% in 3 months | Customer accounts |
| WhatsApp Delivery | 95%+ | Message status logs |
| Payment Success | 98%+ | Transaction success rate |

### 15.3 Efficiency Metrics

| Metric | Before | Target | Improvement |
|--------|--------|--------|-------------|
| Order Entry Time | 5 min | 2 min | 60% faster |
| Customer Inquiries | 50/day | 10/day | 80% reduction |
| Delivery Cost | KES 500/trip | KES 400/trip | 20% savings |
| Staff Utilization | 60% | 80% | 33% improvement |

---

## Appendices

### A. Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Wati.io
WATI_ACCESS_TOKEN=
WATI_API_ENDPOINT=

# Pesapal
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_API_URL=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=
```

### B. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Staff registration |
| `/api/auth/login` | POST | Login |
| `/api/auth/verify-otp` | POST | OTP verification |
| `/api/orders` | GET/POST | Order CRUD |
| `/api/orders/[id]` | GET/PUT | Order details |
| `/api/payments/[id]/status` | GET | Payment status |
| `/api/webhooks/pesapal` | POST | Payment callback |
| `/api/webhooks/order-notifications` | POST | Status notifications |
| `/api/geocode` | POST | Address geocoding |
| `/api/deliveries/[id]/location` | GET | Driver location |
| `/api/receipts/email` | POST | Email receipt |
| `/api/contact` | POST | Contact form |
| `/api/test/wati` | GET | WhatsApp test |

### C. File Structure

```
lorenzo-dry-cleaners/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (customer)/portal/   # Customer portal
│   ├── (dashboard)/         # Staff dashboard
│   │   ├── dashboard/       # Main dashboard
│   │   ├── pos/            # Point of Sale
│   │   ├── pipeline/       # Order pipeline
│   │   ├── workstation/    # Workstation management
│   │   ├── deliveries/     # Delivery management
│   │   ├── inventory/      # Inventory
│   │   ├── employees/      # Employee management
│   │   ├── director/       # Director pages
│   │   ├── gm/             # GM pages
│   │   └── ...
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Base UI (shadcn)
│   ├── modern/              # Modern design system
│   ├── features/            # Feature components
│   └── layout/              # Layout components
├── lib/
│   ├── db/                  # Database operations
│   ├── maps/                # Google Maps helpers
│   ├── payments/            # Payment processing
│   └── utils/               # Utilities
├── services/                # External integrations
├── types/                   # TypeScript types
├── hooks/                   # Custom hooks
├── tests/                   # Test files
└── docs/                    # Documentation
```

### D. Team Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Development Team | Jerry Ndururi in collaboration with AI Agents Plus | jerry@ai-agentsplus.com | +254 725 462 859 |
| Backend Developer | Arthur Tutu | arthur@ai-agentsplus.com | - |
| Product Manager | Jerry Nduriri | jerry@ai-agentsplus.com | +254 725 462 859 |

### E. Custom React Hooks

#### E.1 useWeather Hook

**Location:** `hooks/useWeather.ts` (118 lines)
**Purpose:** TanStack Query hook for fetching weather data for the GM Dashboard

```typescript
interface UseWeatherOptions {
  location?: string;        // Default: "Nairobi,Kenya"
  enabled?: boolean;        // Default: true
  refetchInterval?: number; // Default: 15 minutes
}

// Usage
const { data, isLoading, error } = useWeather();

// Returns WeatherData with:
// - current: { temp, conditions, humidity, windSpeed }
// - operationsImpact: { level, description, recommendations }
```

**Features:**
- Auto-refresh every 15 minutes
- 10-minute stale time
- 2 retry attempts with 5s delay
- Placeholder data during refresh
- Prefetch capability

#### E.2 useGMDashboard Hook

**Location:** `hooks/useGMDashboard.ts` (259 lines)
**Purpose:** Comprehensive data fetching for GM Operations Dashboard

**Refresh Intervals:**
| Data Type | Interval | Purpose |
|-----------|----------|---------|
| Live Orders | 15 seconds | Real-time order queue |
| Urgent Issues | 30 seconds | Critical issue alerts |
| Orders Today | 30 seconds | Order metrics |
| Revenue | 1 minute | Financial tracking |
| Staff on Duty | 1 minute | Attendance monitoring |
| Branch Performance | 1 minute | Efficiency metrics |
| Equipment Status | 2 minutes | Equipment health |
| Turnaround | 2 minutes | Processing times |
| Satisfaction | 5 minutes | Customer ratings |

**Available Hooks:**
```typescript
// All data combined
useGMDashboard({ branchFilter: 'all', enabled: true })

// Individual data hooks
useGMOrderMetrics(branchFilter)      // Order counts
useGMRevenueMetrics(branchFilter)    // Revenue data
useGMLiveOrders(branchFilter)        // Live order queue
useGMUrgentIssues(branchFilter)      // Urgent issues list
useGMBranchPerformance(branchFilter) // Branch efficiency
useGMEquipmentStatus(branchFilter)   // Equipment status
```

**Returns:**
```typescript
interface UseGMDashboardResult {
  data: Partial<GMDashboardData>;
  isLoading: boolean;
  isError: boolean;
  errors: Error[];
  refetchAll: () => void;
}
```

---

### F. Firestore Indexes (Complete List)

**Location:** `firestore.indexes.json`
**Total Indexes:** 39 composite indexes

#### F.1 Orders Collection (8 indexes)

| Fields | Purpose |
|--------|---------|
| `branchId` + `status` + `createdAt DESC` | Pipeline board by branch |
| `customerId` + `createdAt DESC` | Customer order history |
| `branchId` + `paymentStatus` + `createdAt DESC` | Payment tracking |
| `driverId` + `status` + `createdAt DESC` | Driver assignments |
| `branchId` + `estimatedCompletion ASC` | Due date tracking |
| `status` + `createdAt DESC` | Global status filtering |
| `branchId` + `createdAt DESC` | Branch order list |

#### F.2 Deliveries Collection (3 indexes)

| Fields | Purpose |
|--------|---------|
| `driverId` + `status` + `startTime DESC` | Driver delivery list |
| `status` + `startTime DESC` | Global delivery tracking |
| `branchId` + `status` + `startTime DESC` | Branch deliveries |

#### F.3 Transactions Collection (6 indexes)

| Fields | Purpose |
|--------|---------|
| `customerId` + `timestamp DESC` | Customer payment history |
| `orderId` + `timestamp DESC` | Order payments |
| `status` + `timestamp DESC` | Payment status tracking |
| `branchId` + `timestamp DESC` | Branch transactions |
| `branchId` + `status` + `timestamp DESC` | Branch payment status |
| `branchId` + `method` + `timestamp DESC` | Payment method analysis |

#### F.4 Inventory Collection (2 indexes)

| Fields | Purpose |
|--------|---------|
| `branchId` + `category` + `name ASC` | Inventory listing |
| `branchId` + `quantity ASC` | Low stock detection |

#### F.5 Notifications Collection (2 indexes)

| Fields | Purpose |
|--------|---------|
| `recipientId` + `timestamp DESC` | User notifications |
| `status` + `timestamp DESC` | Notification queue |

#### F.6 Customers Collection (2 indexes)

| Fields | Purpose |
|--------|---------|
| `orderCount DESC` + `createdAt DESC` | Top customers |
| `totalSpent DESC` + `createdAt DESC` | High-value customers |

#### F.7 Users Collection (1 index)

| Fields | Purpose |
|--------|---------|
| `role` + `branchId` + `createdAt DESC` | Staff by role/branch |

#### F.8 Pricing Collection (1 index)

| Fields | Purpose |
|--------|---------|
| `branchId` + `active` + `garmentType ASC` | Active pricing rules |

#### F.9 Employees Collection (1 index)

| Fields | Purpose |
|--------|---------|
| `branchId` + `active` + `role ASC` | Branch staff list |

#### F.10 Attendance Collection (2 indexes)

| Fields | Purpose |
|--------|---------|
| `branchId` + `date DESC` | Branch attendance |
| `employeeId` + `date DESC` | Employee attendance history |

#### F.11 Inventory Transactions Collection (2 indexes)

| Fields | Purpose |
|--------|---------|
| `branchId` + `timestamp DESC` | Branch stock movements |
| `itemId` + `timestamp DESC` | Item movement history |

#### F.12 Receipts Collection (2 indexes)

| Fields | Purpose |
|--------|---------|
| `orderId` + `generatedAt DESC` | Order receipts |
| `customerId` + `generatedAt DESC` | Customer receipts |

#### F.13 Equipment Collection (3 indexes)

| Fields | Purpose |
|--------|---------|
| `branchId` + `status ASC` | Equipment status |
| `branchId` + `active` + `type ASC` | Active equipment |
| `branchId` + `nextMaintenanceAt ASC` | Maintenance scheduling |

#### F.14 Issues Collection (4 indexes)

| Fields | Purpose |
|--------|---------|
| `status` + `createdAt DESC` | Global issues |
| `branchId` + `status` + `createdAt DESC` | Branch issues |
| `branchId` + `priority` + `createdAt DESC` | Priority issues |
| `assignedTo` + `status` + `createdAt DESC` | Assigned issues |

---

### G. Marketing & Public Pages

**Location:** `app/` (root-level pages)

#### G.1 Marketing Pages

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| Home | `/` | Landing page with hero, features, pricing | ✅ |
| About | `/about` | Company information | ✅ |
| Services | `/services` | Service catalog with pricing | ✅ |
| Contact | `/contact` | Contact form, location map | ✅ |
| FAQ | `/faq` | Frequently asked questions | ✅ |
| Blog | `/blog` | Blog listing | ✅ |
| Blog Post | `/blog/[slug]` | Individual blog post | ✅ |

#### G.2 Legal Pages

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| Privacy Policy | `/privacy` | Data privacy policy | ✅ |
| Terms of Service | `/terms` | Service terms | ✅ |

#### G.3 Utility Pages

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| Help | `/help` | Help documentation | ✅ |
| Feedback | `/feedback/[orderId]` | Order feedback form | ✅ |

#### G.4 Marketing Components

**Location:** `components/marketing/`

| Component | Purpose |
|-----------|---------|
| `HeroVideo.tsx` | Video hero section |
| `FeaturesGrid.tsx` | Feature showcase grid |
| `PricingSection.tsx` | Pricing table display |
| `CTABand.tsx` | Call-to-action banner |
| `ServicesGrid.tsx` | Services showcase |
| `StatsBar.tsx` | Statistics display |
| `Testimonials.tsx` | Customer testimonials |

---

### H. Biometric Integration

**Location:** `services/biometric.ts` (666 lines)
**Status:** ⚠️ 60% Complete (Service layer complete, UI partial)

#### H.1 Supported Vendors

| Vendor | Adapter Class | Devices |
|--------|---------------|---------|
| **ZKTeco** | `ZKTecoAdapter` | ZKBioAccess Cloud, ZKBioTime series |
| **Suprema** | `SupremaAdapter` | BioStar 2 devices |
| **Hikvision** | `HikvisionAdapter` | DS-K series |
| **Generic** | `GenericAdapter` | Any webhook-compatible device |

#### H.2 Event Types

```typescript
type BiometricEventType = 'clock_in' | 'clock_out' | 'unknown';
type BiometricVendor = 'zkteco' | 'suprema' | 'hikvision' | 'generic';
```

#### H.3 Core Functions

**Device Management:**
```typescript
getDevice(deviceId)           // Get device by ID
getDeviceByIP(ipAddress)      // Get device by IP
getDeviceBySerial(serialNumber) // Get device by serial
createDevice(device)          // Create new device
updateDevice(deviceId, updates) // Update device config
deactivateDevice(deviceId)    // Deactivate device
getBranchDevices(branchId)    // List branch devices
updateDeviceHeartbeat(deviceId) // Update heartbeat timestamp
```

**Employee Enrollment:**
```typescript
getEmployeeByBiometricId(biometricId) // Find employee by biometric
enrollEmployee(employeeId, biometricId) // Enroll biometric ID
unenrollBiometricId(employeeId, biometricId) // Remove biometric ID
```

**Event Processing:**
```typescript
recordBiometricEvent(deviceId, branchId, eventData, employeeId?) // Record event
processClockEvent(event)      // Process clock in/out
getUnprocessedEvents(limit)   // Get pending events
```

#### H.4 Webhook Flow

```
1. Biometric device sends webhook
   └── POST /api/webhooks/biometric
       ├── Extract device ID (from header/payload)
       ├── Get device config from Firestore
       └── Get appropriate adapter

2. Parse event data
   └── Adapter.parseWebhookPayload(payload)
       └── Returns: { biometricId, eventType, timestamp }

3. Find employee
   └── getEmployeeByBiometricId(biometricId)
       └── Query employees where biometricIds contains ID

4. Record event
   └── recordBiometricEvent(...)
       └── Store in biometricEvents collection

5. Process clock event
   └── processClockEvent(event)
       ├── If clock_in → clockIn({...})
       └── If clock_out → clockOut({...})
           └── Update attendance collection
```

#### H.5 API Endpoint

**Location:** `app/api/webhooks/biometric/route.ts`

```typescript
POST /api/webhooks/biometric

Headers:
  X-Device-ID: string      // Device identifier
  X-Device-Serial: string  // Device serial number
  Authorization: Bearer <token> // Optional API key

Body: (varies by vendor)
  ZKTeco: { user_id, punch_time, punch_type, device_sn }
  Suprema: { user_id, datetime, event_type_id, device_id }
  Hikvision: { employeeNo, time, eventType }
  Generic: { biometricId, eventType, timestamp }
```

#### H.6 Admin UI

**Location:** `app/(dashboard)/admin/biometric-devices/page.tsx`

**Features (Planned):**
- [ ] Device registration form
- [ ] Device list with status indicators
- [ ] Heartbeat monitoring
- [ ] Employee enrollment interface
- [ ] Event log viewer
- [ ] Manual sync trigger

#### H.7 Schema Additions

```typescript
interface BiometricDevice {
  deviceId: string;
  branchId: string;
  name: string;
  vendor: BiometricVendor;
  ipAddress?: string;
  serialNumber?: string;
  secretKey?: string;
  active: boolean;
  lastHeartbeat?: Timestamp;
  lastSync?: Timestamp;
  createdAt: Timestamp;
}

interface BiometricEvent {
  eventId: string;
  deviceId: string;
  branchId: string;
  employeeId?: string;
  biometricId: string;
  eventType: BiometricEventType;
  timestamp: Timestamp;
  rawData?: Record<string, unknown>;
  processed: boolean;
  processingError?: string;
  attendanceRecordId?: string;
}

interface Employee {
  // ... existing fields
  biometricIds?: string[];      // Array of enrolled biometric IDs
  biometricEnrolled?: boolean;  // Quick check flag
}
```

---

### I. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 14, 2025 | AI Agents Plus | Initial PRD |
| 1.5 | Nov 15, 2025 | AI Agents Plus | Added workstation, integrations |
| 2.0 | Jan 15, 2026 | AI Agents Plus | Comprehensive update with implementation status |
| 2.1 | Jan 15, 2026 | AI Agents Plus | Added hooks, indexes, marketing pages, biometric details |

---

**Document Classification:** Internal
**Review Cycle:** Weekly
**Next Review:** January 22, 2026

---

*This PRD is a living document and will be updated as the project evolves. For questions or clarifications, contact the development team.*