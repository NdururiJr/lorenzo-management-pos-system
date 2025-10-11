# Lorenzo Dry Cleaners Management System - Planning Document

## 📋 Project Overview

**Project Name:** Lorenzo Dry Cleaners Management System  
**Client:** Lorenzo Dry Cleaners, Kilimani, Nairobi, Kenya  
**Company:** AI Agents Plus  
**Timeline:** 6 weeks (October 14 - December 19, 2025)  
**Budget:** $10,000  
**Launch Date:** December 19, 2025  
**Team Lead:** Gachengoh Marugu (hello@ai-agentsplus.com, +254 725 462 859)

---

## 🎯 Vision & Goals

### Project Vision
To build a comprehensive, AI-powered dry cleaning management system that streamlines operations, enhances customer experience, and provides actionable business insights for Lorenzo Dry Cleaners and future multi-branch expansion.

### Primary Objectives
1. **Operational Excellence**: Automate and optimize the complete order lifecycle from reception to delivery
2. **Customer Satisfaction**: Provide real-time order tracking and seamless communication via WhatsApp
3. **Business Intelligence**: Deliver AI-powered analytics and insights for data-driven decision making
4. **Scalability**: Support multi-branch operations with centralized management
5. **Staff Productivity**: Enable efficient workstation management and performance tracking
6. **Revenue Growth**: Streamline payment processing and reduce delivery delays

### Success Criteria
- **Technical KPIs**
  - System uptime: 99.9%+
  - API response time: < 500ms (P95)
  - Page load time: < 2 seconds (P90)
  - Error rate: < 0.1%
  
- **Business KPIs**
  - Order processing time: < 2 minutes
  - On-time delivery rate: 95%+
  - Customer satisfaction: 4.5/5 stars
  - Staff adoption: 100% within 1 week
  - Customer portal registration: 60% within 3 months

### Core User Personas
1. **Front Desk Staff** - Order creation, customer management, payment processing
2. **Workstation Staff** - Order pipeline management, status updates
3. **Branch Manager** - Operations oversight, reporting, staff management
4. **System Admin** - Full system control, user management, configuration
5. **Drivers** - Delivery route optimization, customer communication
6. **Customers** - Order tracking, profile management, payment

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile Web  │  │  PWA/Mobile  │          │
│  │  (Next.js)   │  │ (Responsive) │  │    (Future)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     APPLICATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes / Server                  │  │
│  │  - Route handlers (app/api/*)                            │  │
│  │  - Server actions                                         │  │
│  │  - Middleware (auth, rate limiting)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Firebase Cloud Functions                        │  │
│  │  - Backend business logic                                 │  │
│  │  - Scheduled jobs (cron)                                  │  │
│  │  - Webhook handlers                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Firestore   │  │   Firebase   │  │   Firebase   │          │
│  │  (Database)  │  │    Auth      │  │   Storage    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   INTEGRATION LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ Wati.io │  │Pesapal  │  │ Google  │  │ OpenAI  │           │
│  │(WhatsApp│  │(Payments│  │  Maps   │  │  (AI)   │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Architecture (Next.js 15)
```
app/
├── (auth)/              # Authentication routes
│   ├── login/
│   ├── register/
│   └── verify-otp/
│
├── (dashboard)/         # Protected dashboard routes
│   ├── layout.tsx      # Dashboard layout with sidebar
│   ├── page.tsx        # Dashboard home
│   ├── pos/            # Point of Sale
│   ├── orders/         # Order management
│   ├── pipeline/       # Order pipeline board
│   ├── customers/      # Customer management
│   ├── drivers/        # Driver management
│   ├── deliveries/     # Delivery routes
│   ├── inventory/      # Inventory management
│   ├── analytics/      # Reports & analytics
│   ├── employees/      # Employee management
│   └── settings/       # System settings
│
├── (customer)/         # Customer portal
│   ├── portal/         # Customer dashboard
│   ├── orders/         # Order tracking
│   └── profile/        # Profile management
│
├── api/                # API routes
│   ├── auth/
│   ├── orders/
│   ├── customers/
│   ├── payments/
│   └── webhooks/
│
├── layout.tsx          # Root layout
└── globals.css         # Global styles

components/
├── ui/                 # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
│
├── forms/              # Form components
│   ├── order-form.tsx
│   ├── customer-form.tsx
│   └── payment-form.tsx
│
├── layouts/            # Layout components
│   ├── dashboard-layout.tsx
│   ├── sidebar.tsx
│   └── header.tsx
│
└── features/           # Feature-specific components
    ├── pos/
    ├── pipeline/
    ├── analytics/
    └── driver/
```

#### Backend Architecture (Firebase)
```
Firebase Firestore Collections:
├── users               # System users (staff)
├── customers           # Customer records
├── orders              # Order records
├── branches            # Branch information
├── deliveries          # Delivery batches
├── inventory           # Inventory items
├── transactions        # Payment transactions
├── notifications       # Notification queue
├── analytics           # Cached analytics data
└── audit_logs          # System audit trail

Firebase Cloud Functions:
├── api/                # RESTful API endpoints
├── scheduledJobs/      # Cron jobs
│   ├── dailyReports
│   ├── inventoryAlerts
│   └── cleanupOldData
├── webhooks/           # Third-party webhooks
│   ├── pesapalCallback
│   └── watiWebhook
└── triggers/           # Firestore triggers
    ├── onOrderCreated
    ├── onOrderStatusChanged
    └── onPaymentReceived
```

### Data Flow Diagrams

#### Order Creation Flow
```
Customer arrives → Front Desk Staff logs in → Opens POS
                                                    ↓
                                              Search/Create Customer
                                                    ↓
                                              Add Garments (photos, details)
                                                    ↓
                                              Calculate Price
                                                    ↓
                                              Process Payment (Cash/M-Pesa/Card)
                                                    ↓
                                              Generate Order ID & Receipt
                                                    ↓
                                              Save to Firestore
                                                    ↓
                                              Trigger: Send WhatsApp confirmation
                                                    ↓
                                              Print Receipt (optional)
```

#### Order Pipeline Flow
```
Order Created (status: 'received')
    ↓
Queue (status: 'queued') → Workstation assigns
    ↓
Washing (status: 'washing') → Staff updates
    ↓
Drying (status: 'drying') → Staff updates
    ↓
Ironing (status: 'ironing') → Staff updates
    ↓
Quality Check (status: 'quality_check') → QA staff verifies
    ↓
Packaging (status: 'packaging') → Staff packages
    ↓
Ready for Pickup/Delivery (status: 'ready')
    ↓
    ├─→ Out for Delivery (status: 'out_for_delivery')
    │       ↓
    │   Delivered (status: 'delivered')
    │
    └─→ Collected (status: 'collected')

[WhatsApp notifications sent at: ready, out_for_delivery, delivered]
```

#### Delivery Optimization Flow
```
Manager selects orders for delivery
    ↓
System extracts delivery addresses
    ↓
Google Maps API: Geocode addresses
    ↓
Google Maps API: Calculate optimal route (TSP)
    ↓
Generate delivery batch with waypoints
    ↓
Assign to driver
    ↓
Driver receives route on mobile
    ↓
Driver follows optimized route
    ↓
Update order status at each stop
    ↓
Customer receives "driver nearby" WhatsApp
    ↓
Complete delivery → Update status
    ↓
Collect payment (if COD) → Update transaction
```

### Security Architecture

#### Authentication Flow
```
User enters credentials → Firebase Auth validates
                               ↓
                         Generates JWT token
                               ↓
                    Client stores in httpOnly cookie
                               ↓
                    Every API request includes token
                               ↓
                    Backend validates token + checks role
                               ↓
                    Grants/Denies access based on permissions
```

#### Role-Based Access Control (RBAC)
```
Roles Hierarchy:
├── Admin (Level 5)       → Full system access
├── Manager (Level 4)     → Branch operations + reports
├── Front Desk (Level 3)  → Order creation + payments
├── Workstation (Level 2) → Order status updates
├── Driver (Level 1)      → Delivery management
└── Customer (Level 0)    → Own orders only

Permissions checked on:
- API endpoint level (Cloud Functions)
- Database level (Firestore Security Rules)
- UI level (Component visibility)
```

---

## 🛠️ Technology Stack

### Frontend Technologies

#### Core Framework
- **Next.js 15.0+**
  - App Router (app directory)
  - Server Components
  - Server Actions
  - Route Handlers
  - Middleware
  - Image Optimization
  
- **React 19.0+**
  - Hooks (useState, useEffect, useContext, useReducer)
  - Custom Hooks
  - Context API for global state
  
- **TypeScript 5.0+**
  - Strict mode enabled
  - Type safety throughout
  - Interface definitions

#### Styling & UI
- **Tailwind CSS 4.0+**
  - Utility-first CSS
  - JIT compiler
  - Custom theme configuration
  - Dark mode support (future)
  
- **shadcn/ui**
  - Customizable component library
  - Radix UI primitives
  - Accessible by default
  
- **Lucide React**
  - Icon library
  - Tree-shakeable
  - Consistent design

#### State Management & Data Fetching
- **React Context API**
  - Auth context
  - User preferences
  - Theme context
  
- **TanStack Query (React Query) v5**
  - Server state management
  - Caching strategies
  - Optimistic updates
  - Background refetching
  
- **Zustand** (optional, if needed)
  - Lightweight state management
  - For complex local state

#### Forms & Validation
- **React Hook Form 7.0+**
  - Performance-focused forms
  - Easy validation integration
  
- **Zod 3.0+**
  - TypeScript-first validation
  - Schema definitions
  - Type inference

#### Charts & Visualizations
- **Recharts 2.0+**
  - React-based charting library
  - Responsive charts
  - Customizable
  
- **Chart.js** (alternative)
  - Canvas-based rendering
  - Better performance for large datasets

#### Maps
- **Google Maps JavaScript API**
  - Interactive maps
  - Custom markers
  - Route visualization
  
- **@react-google-maps/api**
  - React wrapper for Google Maps
  - Type-safe

#### PDF Generation
- **jsPDF**
  - Client-side PDF generation
  - Receipt printing
  - Report exports

#### Utilities
- **date-fns**
  - Date manipulation
  - Formatting
  - Time zone handling
  
- **clsx / classnames**
  - Conditional classes
  
- **react-hot-toast**
  - Toast notifications
  - User feedback

### Backend Technologies

#### Database
- **Firebase Firestore**
  - NoSQL document database
  - Real-time updates
  - Offline support
  - Automatic scaling
  - Security rules
  
- **Firestore Indexes**
  - Composite indexes for complex queries
  - Auto-generated and custom

#### Authentication
- **Firebase Authentication**
  - Email/Password
  - Phone Authentication (OTP)
  - JWT token management
  - Session handling
  - Multi-factor authentication (future)

#### Storage
- **Firebase Storage**
  - Garment photos
  - User profile images
  - Receipt PDFs
  - Reports
  - CDN integration

#### Backend Functions
- **Firebase Cloud Functions (Node.js 20)**
  - HTTP triggers (API endpoints)
  - Scheduled functions (cron jobs)
  - Firestore triggers
  - Authentication triggers
  - Storage triggers

#### API Development
- **Express.js**
  - RESTful API routing
  - Middleware support
  
- **CORS**
  - Cross-origin resource sharing
  
- **Helmet.js**
  - Security headers

### Third-Party Integrations

#### WhatsApp Messaging
- **Wati.io REST API**
  - Message templates
  - Template variables
  - Delivery status tracking
  - Webhook support
  - Rate limiting: 100 msgs/sec

#### Payment Processing
- **Pesapal API v3**
  - OAuth 2.0 authentication
  - Card payments
  - M-Pesa integration
  - Bank transfers
  - IPN (Instant Payment Notification)
  - Sandbox & Production environments

#### Maps & Routing
- **Google Maps Platform**
  - Directions API (route optimization)
  - Distance Matrix API (distance/time calculations)
  - Geocoding API (address → coordinates)
  - Places API (address autocomplete)
  - Maps JavaScript API (map visualization)

#### AI & Machine Learning
- **OpenAI API (GPT-4)**
  - Order completion time estimation
  - Customer churn prediction
  - Route optimization assistance
  - Analytics insights generation
  - Report summarization
  - Natural language queries

#### Email
- **Resend**
  - Transactional emails
  - Order confirmations
  - Receipt delivery
  - Report delivery

### Development Tools

#### Code Quality
- **ESLint 9.0+**
  - Code linting
  - Custom rules
  - Next.js plugin
  
- **Prettier 3.0+**
  - Code formatting
  - Auto-formatting on save
  
- **Husky**
  - Git hooks
  - Pre-commit checks
  
- **lint-staged**
  - Lint only staged files

#### Testing
- **Jest 29.0+**
  - Unit testing
  - Component testing
  - Snapshot testing
  
- **React Testing Library**
  - Component testing
  - User-centric tests
  
- **Playwright**
  - E2E testing
  - Cross-browser testing
  - Mobile testing

#### Build & Deployment
- **Vercel** (hosting option)
  - Automatic deployments
  - Preview deployments
  - Edge functions
  
- **Firebase Hosting** (hosting option)
  - CDN integration
  - Custom domains
  - SSL certificates
  
- **GitHub Actions**
  - CI/CD pipelines
  - Automated testing
  - Automated deployments

#### Monitoring & Analytics
- **Firebase Performance Monitoring**
  - Page load times
  - Network requests
  - Custom traces
  
- **Sentry**
  - Error tracking
  - Performance monitoring
  - User session replay
  
- **Google Analytics 4**
  - User behavior tracking
  - Conversion tracking
  - Custom events

#### Development Environment
- **VS Code**
  - Recommended editor
  - Extensions (ESLint, Prettier, Tailwind IntelliSense)
  
- **Postman / Thunder Client**
  - API testing
  - Environment variables
  
- **Firebase Emulator Suite**
  - Local development
  - Test without production costs

---

## 📦 Required Tools & Accounts

### Essential Accounts (Must Have)

#### 1. Firebase (Google Cloud)
- **Account:** Google/Gmail account
- **Setup:**
  1. Go to [Firebase Console](https://console.firebase.google.com)
  2. Create new project: "lorenzo-dry-cleaners"
  3. Enable Firestore Database
  4. Enable Authentication (Email/Password, Phone)
  5. Enable Storage
  6. Enable Cloud Functions (Blaze plan required)
  7. Enable Hosting
- **Credentials Needed:**
  - Firebase Config Object (API keys)
  - Service Account Key (for Cloud Functions)
- **Pricing:** Blaze Plan (Pay-as-you-go) - Estimate: $20-50/month

#### 2. Wati.io (WhatsApp Business API)
- **Account:** Business email required
- **Setup:**
  1. Sign up at [Wati.io](https://wati.io)
  2. Verify business
  3. Link WhatsApp Business number (+254...)
  4. Create message templates
  5. Get API key
- **Credentials Needed:**
  - API Key
  - Base URL
- **Pricing:** ~$49/month (includes 1000 messages)
- **Note:** WhatsApp message templates must be pre-approved

#### 3. Pesapal (Payment Gateway)
- **Account:** Kenyan business required
- **Setup:**
  1. Register at [Pesapal](https://www.pesapal.com)
  2. Submit business documentation (KRA PIN, business registration)
  3. Wait for approval (2-5 days)
  4. Get Sandbox credentials
  5. Test integration in sandbox
  6. Request Production credentials
- **Credentials Needed:**
  - Consumer Key (Sandbox & Production)
  - Consumer Secret (Sandbox & Production)
  - IPN URL
- **Pricing:** 3.5% per transaction + KES 50
- **Note:** Supports M-Pesa, Cards, Bank transfers

#### 4. Google Cloud Platform (Maps API)
- **Account:** Google account (can be same as Firebase)
- **Setup:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Enable billing
  3. Enable APIs:
     - Maps JavaScript API
     - Directions API
     - Distance Matrix API
     - Geocoding API
     - Places API
  4. Create API key with restrictions
- **Credentials Needed:**
  - API Key (restrict to specific domains)
- **Pricing:** $200 free credit/month, then pay-as-you-go
  - Directions API: $5 per 1000 requests
  - Distance Matrix: $5 per 1000 elements
  - Geocoding: $5 per 1000 requests

#### 5. OpenAI (AI Features)
- **Account:** Email required
- **Setup:**
  1. Sign up at [OpenAI Platform](https://platform.openai.com)
  2. Add payment method
  3. Create API key
  4. Set usage limits (recommended: $50/month)
- **Credentials Needed:**
  - API Key
  - Organization ID (if team account)
- **Pricing:** Pay-as-you-go
  - GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
  - Estimate: $30-80/month depending on usage

#### 6. Resend (Email Service)
- **Account:** Email required
- **Setup:**
  1. Sign up at [Resend](https://resend.com)
  2. Verify domain (lorenzo-dry-cleaners.com)
  3. Create API key
- **Credentials Needed:**
  - API Key
- **Pricing:** Free tier (3000 emails/month), then $20/month

#### 7. GitHub (Version Control)
- **Account:** Free GitHub account
- **Setup:**
  1. Create repository: "lorenzo-dry-cleaners"
  2. Set up branch protection rules
  3. Configure GitHub Actions secrets
  4. Add team members
- **Pricing:** Free (Public repo) or $4/month (Private repo)

### Development Tools (Must Install)

#### 1. Node.js & npm
- **Version:** Node.js 20 LTS or higher
- **Download:** [nodejs.org](https://nodejs.org)
- **Verify:**
  ```bash
  node --version  # Should be v20.x.x or higher
  npm --version   # Should be v10.x.x or higher
  ```

#### 2. Git
- **Version:** Latest
- **Download:** [git-scm.com](https://git-scm.com)
- **Verify:**
  ```bash
  git --version
  ```

#### 3. VS Code
- **Download:** [code.visualstudio.com](https://code.visualstudio.com)
- **Required Extensions:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Firebase
  - TypeScript
  - Path Intellisense
  - Auto Rename Tag
  - GitLens

#### 4. Firebase CLI
- **Install:**
  ```bash
  npm install -g firebase-tools
  ```
- **Verify:**
  ```bash
  firebase --version
  ```
- **Login:**
  ```bash
  firebase login
  ```

#### 5. Postman or Thunder Client
- **Postman:** [postman.com](https://postman.com)
- **Thunder Client:** VS Code extension
- **Purpose:** API testing

### Optional Tools (Recommended)

#### 1. Docker
- **Purpose:** Containerization (optional for local dev)
- **Download:** [docker.com](https://docker.com)

#### 2. Figma
- **Purpose:** Design collaboration
- **Account:** Free account at [figma.com](https://figma.com)

#### 3. Notion
- **Purpose:** Project management
- **Account:** Free account at [notion.so](https://notion.so)

#### 4. Sentry
- **Purpose:** Error monitoring
- **Account:** Free tier at [sentry.io](https://sentry.io)

---

## 🚀 Development Environment Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/ai-agentsplus/lorenzo-dry-cleaners.git
cd lorenzo-dry-cleaners
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Variables
Create `.env.local` file in root:
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Wati.io
WATI_API_KEY=your_wati_api_key
WATI_API_URL=https://live-server.wati.io

# Pesapal
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_API_URL=https://cybqa.pesapal.com/pesapalv3  # Sandbox
# PESAPAL_API_URL=https://pay.pesapal.com/pesapalv3  # Production

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Resend
RESEND_API_KEY=your_resend_api_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage

# Start local emulators (optional)
firebase emulators:start
```

### Step 5: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Step 6: Setup Firestore Indexes
Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "branchId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "deliveries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

### Step 7: Setup Firestore Security Rules
Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isManager() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    
    function isFrontDesk() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager', 'front_desk'];
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read: if isAuthenticated();
      allow create: if isFrontDesk();
      allow update: if isFrontDesk() || request.auth.uid == customerId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated();
      allow create: if isFrontDesk();
      allow update: if isAuthenticated();
    }
    
    // More rules...
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Architecture Decisions & Rationale

### Why Next.js 15?
- **Server Components:** Reduce JavaScript bundle size, improve performance
- **App Router:** Modern routing with layouts and nested routes
- **Server Actions:** Simplified form handling and mutations
- **Image Optimization:** Automatic image optimization and lazy loading
- **Built-in TypeScript:** First-class TypeScript support

### Why Firebase?
- **Rapid Development:** Quick setup, no server management
- **Real-time Updates:** Instant UI updates with Firestore listeners
- **Scalability:** Auto-scales with usage
- **Authentication:** Built-in auth with multiple providers
- **Security:** Declarative security rules
- **Cost-Effective:** Free tier suitable for development, pay-as-you-go for production

### Why NoSQL (Firestore) over SQL?
- **Flexible Schema:** Easy to iterate during development
- **Real-time Sync:** Native real-time capabilities
- **Offline Support:** Built-in offline persistence
- **No Server Management:** Fully managed
- **Document Model:** Natural fit for order/customer data

### Why shadcn/ui over Material-UI?
- **Customization:** Full control over component code
- **Bundle Size:** Only import what you use
- **Tailwind Integration:** Seamless with Tailwind CSS
- **Accessibility:** Built on Radix UI primitives
- **Modern Design:** Aligns with black & white theme

### Why TanStack Query?
- **Server State Management:** Separates server state from client state
- **Automatic Caching:** Intelligent caching strategies
- **Background Refetching:** Keeps data fresh
- **Optimistic Updates:** Instant UI feedback
- **Request Deduplication:** Reduces unnecessary API calls

### Why TypeScript?
- **Type Safety:** Catch errors at compile time
- **Better IDE Support:** IntelliSense, autocomplete
- **Self-Documentation:** Types serve as documentation
- **Refactoring:** Safer refactoring with confidence
- **Team Collaboration:** Clearer contracts between modules

---

## 🗓️ Development Phases

### Phase 1: Foundation (Weeks 1-2) ✅
**Status:** To be completed by October 25, 2025

**Deliverables:**
- ✅ Project repository setup
- ✅ Next.js 15 project initialization
- ✅ Firebase project creation and configuration
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Design system and base UI components
- ✅ Database schema design
- ✅ Authentication system (login, registration, OTP)
- ✅ User roles and permissions
- ✅ Dashboard layout and navigation

**Key Files:**
- `/app/layout.tsx` - Root layout
- `/app/(auth)/*` - Authentication pages
- `/components/ui/*` - Base components
- `/lib/firebase.ts` - Firebase configuration
- `/firestore.rules` - Security rules

### Phase 2: Core Modules (Weeks 3-4) 🔄
**Status:** In Progress (October 26 - November 8, 2025)

**Week 3 (Oct 26 - Nov 1):**
- POS System
  - Order creation form
  - Customer search/add
  - Garment entry with photos
  - Pricing calculation
  - Payment processing (Cash, M-Pesa, Card)
  - Receipt generation
  
**Week 4 (Nov 2 - Nov 8):**
- Order Pipeline
  - Visual Kanban board
  - Drag-and-drop (or manual status update)
  - Real-time updates
  - Status change notifications
  - Pipeline statistics dashboard
  
- Customer Portal
  - Customer registration/login (Phone OTP)
  - Order tracking
  - Profile management
  - Order history
  - Receipt download

### Phase 3: Advanced Features (Week 5) 🔄
**Status:** Scheduled (November 9-15, 2025)

**Deliverables:**
- Driver Route Optimization
  - Google Maps integration
  - Address geocoding
  - Route optimization algorithm
  - Driver mobile interface
  - Real-time tracking
  
- WhatsApp Integration
  - Wati.io API setup
  - Message template creation
  - Automated notifications (order status updates)
  - Two-way communication handling
  
- AI Features
  - OpenAI API integration
  - Order completion time estimation
  - Analytics insights generation
  - Customer churn prediction
  - Report summarization
  
- Inventory Management
  - Stock tracking
  - Low stock alerts
  - Reorder reminders
  - Usage analytics
  - Supplier management
  
- Employee Tracking
  - Clock-in/clock-out
  - Shift management
  - Productivity metrics
  - Attendance reports

### Phase 4: Testing & Refinement (Week 6) 🔄
**Status:** Scheduled (November 16 - December 19, 2025)

**Week 1 (Nov 16-22):**
- Unit testing (Jest)
- Integration testing
- E2E testing (Playwright)
- Performance optimization
- Security audit

**Week 2 (Nov 23-29):**
- Bug fixes
- UI/UX refinements
- Mobile responsiveness testing
- Cross-browser testing
- Accessibility audit

**Week 3-4 (Nov 30 - Dec 19):**
- User Acceptance Testing (UAT)
- Final bug fixes
- Documentation completion
- Training materials creation
- Deployment to production
- Post-launch monitoring

---

## 📝 Key Technical Decisions

### 1. Mobile-First Design
**Decision:** Design for mobile screens first, enhance for desktop  
**Rationale:** Front desk staff may use tablets/phones; customers will primarily use mobile  
**Implementation:** Tailwind's responsive classes (sm:, md:, lg:, xl:)

### 2. Black & White Theme
**Decision:** Minimalistic black and white color scheme  
**Rationale:** Professional appearance, high contrast, accessible  
**Implementation:** Custom Tailwind theme with gray scale palette

### 3. Real-Time Updates
**Decision:** Use Firestore real-time listeners for order status  
**Rationale:** Instant feedback for pipeline, customer portal  
**Implementation:** onSnapshot() listeners with TanStack Query

### 4. Optimistic UI Updates
**Decision:** Update UI immediately, rollback on error  
**Rationale:** Better user experience, feels faster  
**Implementation:** TanStack Query's optimistic updates

### 5. Server Components by Default
**Decision:** Use Next.js Server Components unless interactivity needed  
**Rationale:** Reduced JavaScript bundle, better performance  
**Implementation:** Only add 'use client' when necessary

### 6. API Routes vs Cloud Functions
**Decision:** Next.js API routes for simple CRUD, Cloud Functions for complex logic  
**Rationale:** Leverage Next.js for speed, Cloud Functions for background jobs  
**Implementation:** Hybrid approach based on use case

### 7. Environment-Based Configuration
**Decision:** Separate .env files for dev, staging, production  
**Rationale:** Safety, easier testing, clear separation  
**Implementation:** .env.local, .env.staging, .env.production

### 8. Modular Component Structure
**Decision:** Feature-based folder structure  
**Rationale:** Easier to maintain, scales with team  
**Implementation:** `/components/features/[feature-name]/`

### 9. Type-Safe API Contracts
**Decision:** Shared TypeScript types between frontend and backend  
**Rationale:** Reduce errors, better DX  
**Implementation:** `/types/api.ts`, `/types/models.ts`

### 10. Progressive Enhancement
**Decision:** Core features work without JavaScript  
**Rationale:** Accessibility, reliability  
**Implementation:** Form actions with JavaScript enhancement

---

## 📚 Additional Resources

### Documentation Links
- [Project PRD (Product Requirements Document)](./PRD.md)
- [Claude Development Guide](./CLAUDE.md)
- [Tasks List](./TASKS.md)
- [API Documentation](./docs/API.md) *(to be created)*
- [Component Library](./docs/COMPONENTS.md) *(to be created)*

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

### API Documentation
- [Wati.io API Docs](https://docs.wati.io)
- [Pesapal API v3 Docs](https://developer.pesapal.com)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Resend API Docs](https://resend.com/docs)

### Tutorials & Learning Resources
- [Next.js + Firebase Tutorial](https://www.youtube.com/results?search_query=nextjs+firebase+tutorial)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## ✅ Pre-Development Checklist

Before starting development, ensure:

- [ ] All team members have read PLANNING.md
- [ ] All required accounts are created and verified
- [ ] All API keys and credentials are obtained
- [ ] Development environment is set up (Node.js, Git, VS Code)
- [ ] Firebase project is created and configured
- [ ] Repository is cloned locally
- [ ] .env.local is created with all credentials
- [ ] Dependencies are installed (npm install)
- [ ] Development server runs successfully (npm run dev)
- [ ] Team has access to GitHub repository
- [ ] Team has access to Firebase console
- [ ] Communication channels are established (Email, WhatsApp)
- [ ] TASKS.md is created and initial tasks are listed
- [ ] First sprint is planned

---

## 🎯 Success Metrics Tracking

### Technical Metrics (Monitor Weekly)
- **Build Time:** Target < 5 minutes
- **Bundle Size:** Target < 500 KB (gzipped)
- **Lighthouse Score:** Target > 90
- **Test Coverage:** Target > 80%
- **Open Issues:** Target < 10 critical bugs

### Business Metrics (Monitor Monthly)
- **Orders Processed:** Track weekly trend
- **Order Processing Time:** Target < 2 minutes
- **On-Time Deliveries:** Target > 95%
- **Customer Satisfaction:** Target > 4.5/5
- **System Uptime:** Target > 99.9%

---

## 🔄 Continuous Improvement

### Weekly Reviews
- Review completed tasks
- Update TASKS.md
- Identify blockers
- Plan next sprint
- Update documentation

### Monthly Reviews
- Review metrics
- Gather user feedback
- Plan feature enhancements
- Review technical debt
- Update roadmap

---

## 📞 Support & Escalation

### Development Team
- **Gachengoh Marugu** (Lead Developer)
  - Email: hello@ai-agentsplus.com
  - Phone: +254 725 462 859
  
- **Arthur Tutu** (Backend Developer)
  - Email: arthur@ai-agentsplus.com
  
- **Jerry Nduriri** (POS & Product Manager)
  - Email: jerry@ai-agentsplus.com
  - Phone: +254 725 462 859

### Client Contact
- **Lorenzo Dry Cleaners**
  - Location: Kilimani, Nairobi, Kenya
  - Primary Contact: *(to be added)*

---

**Last Updated:** October 10, 2025  
**Next Review:** October 17, 2025 (Weekly)  
**Document Version:** 1.0

---

**Remember:**
1. ✅ Read this PLANNING.md at the start of every new conversation
2. ✅ Check TASKS.md before starting work
3. ✅ Mark completed tasks immediately
4. ✅ Add newly discovered tasks
5. ✅ Keep documentation updated

**Let's build something amazing! 🚀**
