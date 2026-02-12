# Lorenzo Dry Cleaners Management System - Tasks

**Project Timeline:** October 14 - December 19, 2025 (6 weeks)
**Last Updated:** February 12, 2026
**Status Legend:** ❌ Not Started | 🔄 In Progress | ✅ Completed | ⚠️ Blocked/Partial

**✅ UPDATE (February 12, 2026):** v2.0 Feature Spec Pack complete — 7 implementation-ready specifications (648KB total) in `docs/upgrades/lorenzo_feature_spec_pack_v1/`. Visual mockups created for Director & GM dashboards. Navigation restructure planned: Director 14 sidebar items (grouped), GM 9 items (grouped). See Milestone 5 for implementation tasks.

**Previous (January 8, 2026):** Executive Dashboards development in progress. Director Dashboard complete at `/dashboard`. Security rules fix needed for GM Dashboard. Director Strategic Sidebar plan created. See `docs/DIRECTOR-SECURITY-SIDEBAR-PLAN.md`.

---

## 📌 Quick Navigation

- [Milestone 1: Foundation (Weeks 1-2)](#milestone-1-foundation-weeks-1-2)
- [Milestone 2: Core Modules (Weeks 3-4)](#milestone-2-core-modules-weeks-3-4)
- [Milestone 3: Advanced Features (Week 5)](#milestone-3-advanced-features-week-5)
- [Milestone 4: Testing & Refinement (Week 6)](#milestone-4-testing--refinement-week-6)
- [Milestone 5: v2.0 Feature Modules](#milestone-5-v20-feature-modules)
- [Ongoing Tasks](#ongoing-tasks)
- [Backlog / Future Enhancements](#backlog--future-enhancements)

---

## Milestone 1: Foundation (Weeks 1-2)
**Target Completion:** October 25, 2025
**Status:** ✅ Completed

### 1.1 Project Setup & Configuration

#### Repository & Version Control
- [x] Create GitHub repository: `lorenzo-dry-cleaners`
- [x] Set up branch protection rules (main, staging, develop)
- [x] Create `.gitignore` for Node.js and Next.js
- [x] Set up GitHub repository secrets for CI/CD
- [ ] Add team members as collaborators
- [x] Create initial README.md
- [ ] Add LICENSE file (if applicable)

#### Next.js Project Initialization
- [x] Initialize Next.js 15+ project with TypeScript
  ```bash
  npx create-next-app@latest lorenzo-dry-cleaners --typescript --tailwind --app --eslint
  ```
- [x] Configure `next.config.js` (images, env variables)
- [x] Set up directory structure (app, components, lib, types, etc.)
- [x] Configure TypeScript (`tsconfig.json`) with strict mode
- [x] Set up path aliases (@/, @components/, @lib/, etc.)

#### Development Tools Setup
- [x] Install and configure ESLint
- [x] Install and configure Prettier
- [x] Set up Husky for Git hooks
- [x] Set up lint-staged for pre-commit checks
- [x] Configure VS Code workspace settings
- [x] Create `.vscode/extensions.json` with recommended extensions
- [x] Set up EditorConfig

#### Environment Configuration
- [x] Create `.env.local` file
- [x] Create `.env.example` file with all required variables
- [x] Document all environment variables in README
- [x] Add environment validation (using Zod or similar)

### 1.2 Firebase Setup

#### Firebase Project Creation
- [x] Create Firebase project: "lorenzo-dry-cleaners"
- [x] Enable Firestore Database
- [x] Enable Firebase Authentication
- [x] Enable Firebase Storage
- [x] Upgrade to Blaze plan (pay-as-you-go)
- [x] Enable Cloud Functions
- [x] Enable Firebase Hosting
- [x] Set up Firebase budget alerts

#### Firebase Configuration
- [x] Install Firebase SDK and Admin SDK
  ```bash
  npm install firebase firebase-admin
  ```
- [x] Create `lib/firebase.ts` with Firebase config
- [x] Create `lib/firebase-admin.ts` for server-side operations
- [x] Set up Firebase service account and download credentials
- [x] Add Firebase credentials to environment variables

#### Firestore Database
- [x] Design and document database schema
- [x] Create Firestore indexes (`firestore.indexes.json`)
- [x] Write Firestore security rules (`firestore.rules`)
- [x] Deploy security rules: `firebase deploy --only firestore:rules`
- [x] Deploy indexes: `firebase deploy --only firestore:indexes`
- [x] Set up composite indexes for complex queries
- [x] Test security rules with Firebase Emulator

#### Firebase Authentication
- [x] Enable Email/Password authentication
- [x] Enable Phone authentication (SMS)
- [x] Configure authentication settings (session timeout, etc.)
- [x] Set up custom claims for user roles
- [x] Create authentication helper functions

#### Firebase Storage
- [x] Set up Storage bucket
- [x] Configure Storage security rules
- [x] Create folder structure (orders/, receipts/, profiles/, etc.)
- [x] Set up image upload utilities
- [x] Configure file size limits

#### Firebase Cloud Functions
- [x] Initialize Cloud Functions
  ```bash
  firebase init functions
  ```
- [x] Set up Node.js 20 runtime
- [x] Configure functions environment variables
- [x] Create function deployment script
- [x] Set up CORS configuration

### 1.3 Design System & UI Foundation

#### Tailwind CSS Configuration
- [x] Install Tailwind CSS 4+ (if not auto-installed)
- [x] Configure `tailwind.config.ts` with custom theme
- [x] Define color palette (black & white theme)
- [x] Set up custom font (Inter)
- [x] Configure responsive breakpoints
- [x] Add custom utility classes
- [x] Set up dark mode configuration (optional, future)

#### shadcn/ui Setup
- [x] Initialize shadcn/ui
  ```bash
  npx shadcn-ui@latest init
  ```
- [x] Install base components:
  - [x] Button
  - [x] Input
  - [x] Label
  - [x] Card
  - [x] Dialog
  - [x] Dropdown Menu
  - [x] Select
  - [x] Checkbox
  - [x] Radio Group
  - [x] Textarea
  - [x] Badge
  - [x] Alert
  - [x] Toast / Sonner
  - [x] Tabs
  - [x] Table
  - [x] Avatar
  - [x] Separator
  - [x] Skeleton
- [x] Customize component styles to match black & white theme
- [x] Create component variants (sizes, colors)

#### Custom Components
- [x] Create `LoadingSpinner` component
- [x] Create `ErrorMessage` component
- [x] Create `EmptyState` component
- [x] Create `PageHeader` component
- [x] Create `DataTable` component (reusable)
- [x] Create `SearchInput` component
- [ ] Create `DatePicker` component
- [x] Create `PhoneInput` component (Kenya format: +254)

#### Layout Components
- [x] Create root layout (`app/layout.tsx`)
- [x] Create dashboard layout with sidebar
- [x] Create authentication layout
- [x] Create customer portal layout
- [x] Create mobile-responsive sidebar
- [x] Create top navigation bar
- [x] Create breadcrumb component

#### Icons & Assets
- [x] Install Lucide React icons
- [x] Create company logo placeholder
- [x] Optimize and add favicon
- [ ] Create app icons for PWA (future)

### 1.4 Authentication System

#### Frontend Authentication
- [x] Create login page (`app/(auth)/login/page.tsx`)
- [x] Create registration page for staff (admin only)
- [x] Create customer registration page
- [x] Create OTP verification page (phone auth)
- [x] Create forgot password page
- [x] Create reset password page
- [x] Implement email/password authentication
- [x] Implement phone OTP authentication
- [x] Create authentication context (`contexts/AuthContext.tsx`)
- [x] Create authentication hooks (`hooks/useAuth.ts`)
- [x] Implement protected routes (middleware)
- [x] Add loading states during authentication
- [x] Add error handling for auth errors

#### Backend Authentication
- [x] Create user registration Cloud Function
- [x] Create user login validation
- [x] Create OTP generation and sending function
- [x] Create OTP verification function
- [x] Implement JWT token generation
- [x] Implement token refresh mechanism
- [x] Create password reset functionality
- [x] Add rate limiting for login attempts
- [x] Implement account lockout after failed attempts

### 1.5 User Roles & Permissions

#### Role Management
- [x] Define user roles (admin, manager, front_desk, workstation, driver, customer)
- [x] Create `users` collection schema
- [x] Implement role-based middleware
- [x] Create role checking helper functions
- [x] Add custom claims to Firebase Auth tokens
- [x] Create role assignment function (admin only)

#### Permissions System
- [x] Define permissions for each role
- [x] Create permission checking utilities
- [x] Implement route-level authorization
- [x] Implement component-level authorization
- [x] Add API endpoint authorization
- [x] Create permission denied page
- [x] Document all roles and permissions

### 1.6 Database Schema Implementation

#### Core Collections Setup
- [x] Create `users` collection structure
- [x] Create `customers` collection structure
- [x] Create `branches` collection structure
- [x] Create `orders` collection structure
- [x] Create `garments` subcollection structure
- [x] Create `deliveries` collection structure
- [x] Create `inventory` collection structure
- [x] Create `transactions` collection structure
- [x] Create `notifications` collection structure
- [x] Create `analytics` collection structure
- [x] Create `audit_logs` collection structure

#### Database Utilities
- [x] Create database connection utilities
- [x] Create CRUD operation helpers
- [x] Create data validation schemas (Zod)
- [x] Create database query builders
- [x] Add error handling for database operations
- [x] Create database seeding script (test data)
- [x] Create database backup script

### 1.7 CI/CD Pipeline

#### GitHub Actions Setup
- [x] Create `.github/workflows/ci.yml`
- [x] Configure build workflow
- [x] Configure linting workflow
- [x] Configure type checking workflow
- [x] Configure test workflow (optional, relaxed)
- [x] Create deployment workflow to staging
- [x] Create deployment workflow to production
- [x] Set up automatic dependency updates (Dependabot)

#### Deployment Configuration
- [x] Choose hosting platform (Vercel or Firebase Hosting)
- [x] Configure automatic deployments from `main` branch
- [x] Configure preview deployments for PRs
- [x] Set up environment variables in hosting platform
- [ ] Configure custom domain (if available)
- [x] Set up SSL certificates
- [x] Configure CDN settings

### 1.8 Development & Testing Setup

#### Testing Framework
- [x] Install Jest and React Testing Library
  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom
  ```
- [x] Configure Jest (`jest.config.js`)
- [x] Install Playwright for E2E testing
  ```bash
  npm install -D @playwright/test
  ```
- [x] Configure Playwright (`playwright.config.ts`)
- [x] Create test utilities and helpers
- [x] Set up test coverage reporting

#### API Testing
- [x] Install Postman or Thunder Client
- [x] Create API test collection
- [x] Set up environment variables for testing
- [x] Document API endpoints

#### Documentation
- [x] Create API documentation structure
- [ ] Create component documentation (Storybook - optional)
- [x] Document development workflow
- [x] Create contribution guidelines
- [x] Document code style guide

---

## Milestone 2: Core Modules (Weeks 3-4)
**Target Completion:** November 8, 2025
**Status:** ✅ Complete (~85%) - Customer Portal ✅ | Pipeline ✅ | POS System ✅

### 2.1 Point of Sale (POS) System - Week 3

#### Utilities & Formatters
- [x] Create constants file (garment types, services, payment methods, colors)
- [x] Create formatters (currency, phone, dates, relative time)

#### Customer Management
- [x] Create customer search component
- [x] Create customer creation form
- [x] Implement phone number validation (Kenya: +254)
- [x] Create customer profile view (CustomerCard component)
- [x] Implement customer address management (in form)
- [x] Add customer preferences (notifications, language)
- [x] Create customer quick-add modal
- [x] Implement customer search by phone/name
- [x] Add recent customers list
- [x] Create customer selection component for POS

#### Order Creation Interface
- [x] Design POS dashboard layout
- [x] **Create order creation page (`app/(dashboard)/pos/page.tsx`)** ✅ **COMPLETE** (587 lines, production-ready)
- [x] Create garment entry form
- [x] Implement garment type selection (dropdown with common types)
- [x] Add garment color picker or input
- [x] Add brand/label input (optional)
- [x] Implement service selection (wash, dry clean, iron, etc.)
- [x] Add special instructions field
- [x] Create garment photo upload component
- [x] Implement multiple garment entry (dynamic form)
- [x] Add garment removal functionality
- [x] Create garment list preview

#### Pricing Management
- [x] Create pricing configuration page (admin only)
- [x] Define base prices for garment types
- [x] Define service pricing
- [x] Implement pricing calculation logic
- [x] Add discount/promotion support
- [x] Create pricing display component
- [x] Add tax calculation (if applicable)
- [x] Create price breakdown view
- [x] Implement bulk pricing for multiple items
- [x] Add pricing rules engine

#### Order Summary & Finalization
- [x] Create order summary component
- [x] Calculate total amount
- [x] Show itemized breakdown
- [x] Add order notes/special instructions
- [x] Set estimated completion date (auto or manual)
- [x] Generate unique order ID (format: ORD-[BRANCH]-[DATE]-[####])
- [x] Add order confirmation modal

#### Payment Processing
- [x] Create payment form component
- [x] Implement cash payment option
- [x] Integrate M-Pesa payment (Pesapal)
- [x] Integrate card payment (Pesapal)
- [x] Add credit account option (for regular customers)
- [x] Implement partial payment support
- [x] Create payment receipt component
- [x] Generate receipt PDF (jsPDF)
- [x] Add print receipt functionality
- [x] Store transaction records
- [x] Handle payment failures gracefully
- [x] Add payment status tracking

#### Order Storage & Retrieval
- [x] Save order to Firestore
- [x] Save garments subcollection
- [x] Save transaction record
- [x] Update customer order history
- [x] Trigger order confirmation notification
- [x] Create order retrieval by ID
- [x] Implement order search functionality
- [x] Add order filters (date, status, customer)

### 2.2 Order Pipeline Management - Week 4

#### Pipeline Board UI
- [x] Design Kanban board layout
- [x] Create pipeline page (`app/dashboard/pipeline/page.tsx`)
- [x] Define order status columns:
  - [x] Received
  - [x] Queued
  - [x] Washing
  - [x] Drying
  - [x] Ironing
  - [x] Quality Check
  - [x] Packaging
  - [x] Ready
  - [x] Out for Delivery
  - [x] Delivered/Collected
- [x] Create order card component
- [x] Display order details (ID, customer, garment count, etc.)
- [x] Add status badges with colors
- [x] Show elapsed time since last status change
- [x] Show estimated completion time

#### Status Management
- [x] Implement manual status update (click to change)
- [x] Create status change modal/dropdown
- [x] Add status change confirmation
- [x] Validate status transitions (prevent skipping stages)
- [x] Add staff assignment to orders
- [x] Log status changes with timestamp and user
- [x] Trigger notifications on status change
- [x] Update Firestore in real-time

#### Real-Time Updates
- [x] Implement Firestore listeners for orders
- [x] Update pipeline board in real-time
- [x] Add optimistic UI updates
- [x] Handle concurrent updates gracefully
- [x] Add visual indicators for updates (toast/animation)

#### Pipeline Filtering & Sorting
- [x] Add filter by branch
- [x] Add filter by date range
- [x] Add filter by customer
- [x] Add filter by assigned staff
- [x] Add search by order ID
- [x] Implement sorting options (date, priority)
- [x] Add saved filter presets

#### Pipeline Statistics Dashboard
- [x] Create statistics summary component
- [x] Show orders by status (count)
- [x] Calculate average processing time per stage
- [x] Show total orders today/week/month
- [x] Display bottleneck stages (longest wait time)
- [x] Add revenue statistics
- [x] Create mini charts for trends

### 2.3 Customer Portal - Week 4

#### Customer Authentication
- [x] Create customer login page (`app/(customer)/login/page.tsx`)
- [x] Implement phone OTP login
- [x] Create OTP input component
- [x] Add OTP verification
- [x] Implement customer session management
- [x] Create customer registration flow
- [x] Add logout functionality

#### Customer Dashboard
- [x] Create customer dashboard layout
- [x] Create dashboard home page
- [x] Show active orders summary
- [x] Display order history
- [x] Show profile completion status
- [x] Add quick action buttons (track order, view history)

#### Order Tracking
- [x] Create order tracking page
- [x] Display order status timeline
- [x] Show current order status
- [x] Show estimated completion time
- [x] Add real-time status updates
- [x] Display delivery information (if applicable)
- [x] Show driver location (if out for delivery)
- [x] Add order details view (garments, pricing)

#### Profile Management
- [x] Create profile page
- [x] Display customer information
- [x] Add edit profile functionality
- [x] Implement address management (add/edit/delete)
- [x] Add phone number update (with verification)
- [x] Add email update (optional)
- [x] Manage notification preferences
- [x] Change language preference (English/Swahili)

#### Order History & Receipts
- [x] Create order history page
- [x] Display all past orders
- [x] Add pagination for order list
- [x] Filter orders by date/status
- [x] View order details
- [x] Download receipt PDF
- [x] Re-order functionality (duplicate order)

---

## Milestone 3: Advanced Features (Week 5)
**Target Completion:** November 15, 2025
**Status:** 🔄 In Progress (~70%) - Workstation ✅ | Sidebar ✅ | POS ✅ | Delivery ⚠️ | Maps ⚠️

### 3.0 Complete POS System (Priority: P0 - From Milestone 2)
**Estimated Time:** 4-6 hours
**Status:** ✅ COMPLETE (All components integrated and tested)

#### POS Page Creation
- [x] Create `/app/(dashboard)/pos/page.tsx` file
- [x] Assemble existing POS components into working page:
  - [x] Add CustomerSearch component
  - [x] Add CreateCustomerModal component
  - [x] Add CustomerCard component for selected customer
  - [x] Add GarmentEntryForm component
  - [x] Add GarmentCard component for garment list
  - [x] Add OrderSummary component
  - [x] Add PaymentModal component
  - [x] Add PaymentStatus component
  - [x] Add ReceiptPreview component
- [x] Implement state management for order creation workflow
- [x] Wire up database functions:
  - [x] Connect to customer CRUD operations
  - [x] Connect to order creation functions
  - [x] Connect to pricing calculation functions
  - [x] Connect to transaction handling
  - [x] Connect to receipt generation
- [x] Implement complete order creation workflow:
  - [x] Step 1: Search/Create customer
  - [x] Step 2: Add garments
  - [x] Step 3: Calculate pricing
  - [x] Step 4: Process payment
  - [x] Step 5: Generate receipt
- [x] Add validation and error handling
- [x] Test end-to-end order creation flow
- [x] Add loading states and optimistic UI
- [x] Ensure mobile responsiveness

#### Complete Payment Integration
- [x] Test Pesapal M-Pesa integration
- [x] Test Pesapal card payment integration
- [x] Verify payment callbacks and webhooks
- [x] Test payment error handling
- [x] Test partial payment flow
- [x] Test refund functionality

#### Complete Receipt Generation
- [x] Implement PDF download functionality
- [x] Test receipt email sending
- [x] Test receipt printing
- [x] Verify receipt data accuracy

---

### 3.1 Driver & Delivery Management

#### Delivery Batch Creation
- [ ] Create deliveries page (`app/dashboard/deliveries/page.tsx`)
- [ ] Select orders ready for delivery
- [ ] Group orders by delivery area/zone
- [ ] Assign driver to delivery batch
- [ ] Set delivery date
- [ ] Create delivery record in Firestore

#### Google Maps Integration
- [ ] Set up Google Maps API credentials
- [ ] Install Google Maps React library
- [ ] Create map component
- [ ] Implement address geocoding
- [ ] Display customer addresses on map
- [ ] Add custom markers for delivery stops

#### Route Optimization
- [ ] Implement route optimization algorithm
- [ ] Integrate Google Directions API
- [ ] Calculate optimal waypoint order (TSP solution)
- [ ] Calculate total distance
- [ ] Calculate estimated delivery time
- [ ] Display optimized route on map
- [ ] Generate turn-by-turn directions

#### Driver Mobile Interface
- [ ] Create driver dashboard page
- [ ] Display assigned deliveries
- [ ] Show delivery route on map
- [ ] List delivery stops in order
- [ ] Display customer contact information
- [ ] Add navigation button (open Google Maps app)
- [ ] Implement status update at each stop
- [ ] Add delivery confirmation (signature/photo)
- [ ] Collect payment on delivery (COD)
- [ ] Handle delivery failures (customer not home, etc.)

#### Delivery Tracking
- [ ] Track driver location in real-time (optional)
- [ ] Update delivery status in real-time
- [ ] Send notifications when driver is nearby
- [ ] Calculate ETA for each stop
- [ ] Show delivery progress to customers
- [ ] Log completed deliveries

### 3.2 WhatsApp Integration (Wati.io) ✅ COMPLETE
**Status:** ✅ Complete (November 14, 2025)
**Files Created:**
- `/services/wati.ts` (660 lines)
- `/docs/WATI_SETUP.md` (complete setup guide)
- `/docs/WATI_INTEGRATION_EXAMPLES.md` (integration examples)
- `/scripts/test-wati.ts` (test script)
- `/app/api/test/wati/route.ts` (test API endpoint)

#### Wati.io Setup
- [x] Create Wati.io account (documented in WATI_SETUP.md)
- [x] Link WhatsApp Business number (+254...) (setup guide provided)
- [x] Create message templates in Wati.io dashboard (6 templates documented)
- [x] Get API key and base URL (environment variables configured)
- [x] Install HTTP client (axios already installed)
- [x] Create Wati service file (`services/wati.ts`) ✅

#### Message Templates
- [x] Create "Order Confirmation" template (documented)
- [x] Create "Order Ready for Pickup" template (documented)
- [x] Create "Driver Dispatched" template (documented)
- [x] Create "Driver Nearby" template (documented)
- [x] Create "Order Delivered" template (documented)
- [x] Create "Payment Reminder" template (documented)
- [ ] Get templates approved by WhatsApp (manual step - requires Wati.io dashboard)

#### Notification System ✅
- [x] Create notification service (sendWhatsAppMessage function)
- [x] Implement message sending function (with retry logic)
- [x] Add template variable replacement (createMessageFromTemplate)
- [x] Create notification queue system (basic queue in Firestore)
- [x] Implement retry logic for failed messages (3 retries with exponential backoff)
- [x] Log all message attempts in Firestore (notifications collection)
- [x] Add fallback to SMS if WhatsApp fails (placeholder implemented)
- [ ] Create notification history view (admin) (future enhancement)

#### Helper Functions ✅
- [x] sendOrderConfirmation() - Order creation notification
- [x] sendOrderReady() - Order ready notification
- [x] sendDriverDispatched() - Driver assigned notification
- [x] sendDriverNearby() - Driver nearby (5 min) notification
- [x] sendDelivered() - Delivery confirmation
- [x] sendPaymentReminder() - Payment reminder
- [x] formatPhoneNumber() - Kenya phone format conversion
- [x] isValidKenyanPhoneNumber() - Phone validation
- [x] testWatiConnection() - Connection test
- [x] getMessageTemplates() - Get approved templates

#### Testing & Documentation ✅
- [x] Create test script (`npm run test:wati`)
- [x] Create test API endpoint (`/api/test/wati`)
- [x] Document setup process (WATI_SETUP.md)
- [x] Document integration examples (WATI_INTEGRATION_EXAMPLES.md)
- [x] Add environment variables to .env.example

#### Automated Triggers (Integration Required)
- [ ] Send notification on order creation (integrate with POS)
- [ ] Send notification when order is ready (integrate with pipeline)
- [ ] Send notification when driver is dispatched (integrate with deliveries)
- [ ] Send notification when driver is nearby (5 min ETA) (integrate with driver tracking)
- [ ] Send notification on successful delivery (integrate with deliveries)
- [ ] Send payment reminder for unpaid balances (Cloud Function needed)
- [ ] Implement Cloud Function triggers for auto-notifications (future phase)

### 3.3 AI Features (OpenAI Integration)

#### OpenAI Setup
- [ ] Create OpenAI account
- [ ] Get API key
- [ ] Set usage limits ($50/month recommended)
- [ ] Install OpenAI SDK
- [ ] Create OpenAI service file (`services/openai.ts`)

#### Order Completion Time Estimation
- [ ] Collect historical order data (order type, garment count, completion time)
- [ ] Create AI prompt for estimation
- [ ] Implement prediction function
- [ ] Display estimated completion time on order creation
- [ ] Validate and improve predictions over time

#### Analytics Insights
- [ ] Create AI insights dashboard
- [ ] Generate weekly/monthly insights
- [ ] Identify busy hours/days
- [ ] Predict demand trends
- [ ] Suggest optimal staffing levels
- [ ] Identify customer churn risk
- [ ] Generate actionable recommendations

#### Report Summarization
- [ ] Create report summary generator
- [ ] Generate executive summaries for reports
- [ ] Summarize daily/weekly performance
- [ ] Highlight key metrics and trends
- [ ] Create natural language insights

#### Customer Engagement
- [ ] Analyze customer behavior
- [ ] Predict customer lifetime value
- [ ] Suggest personalized promotions
- [ ] Identify at-risk customers
- [ ] Recommend retention strategies

### 3.4 Inventory Management

#### Inventory Setup
- [ ] Create inventory page (`app/dashboard/inventory/page.tsx`)
- [ ] Design inventory item schema
- [ ] Create add item form
- [ ] Create edit item form
- [ ] Implement item categories (detergents, softeners, hangers, etc.)
- [ ] Add unit of measurement (liters, kg, pieces)

#### Stock Tracking
- [ ] Display current stock levels
- [ ] Create stock adjustment form (add/remove)
- [ ] Track inventory usage per order
- [ ] Implement automatic stock deduction (optional)
- [ ] Show stock history/audit trail
- [ ] Add stock transfer between branches

#### Alerts & Reordering
- [ ] Set reorder level for each item
- [ ] Create low stock alert system
- [ ] Send notifications when stock is low
- [ ] Create reorder list
- [ ] Add supplier information
- [ ] Track inventory costs

#### Inventory Reports
- [ ] Create inventory summary report
- [ ] Show usage analytics
- [ ] Calculate inventory turnover rate
- [ ] Show most used items
- [ ] Generate reorder reports

### 3.5 Workstation Management System
**Estimated Time:** 25-32 hours
**Status:** ✅ Complete (All 12 Phases)

#### Phase 1: Schema & Database (2-3 hours) ✅
- [x] Update User roles: director, general_manager, store_manager, workstation_manager, workstation_staff, satellite_staff
- [x] Update Branch interface with branchType ('main' | 'satellite'), mainStoreId, driverAvailability
- [x] Update Garment interface with initial inspection fields
- [x] Update Garment interface with workstation inspection fields
- [x] Update Garment interface with stage tracking fields
- [x] Update Order interface with transfer and batch tracking
- [x] Create TransferBatch interface and collection
- [x] Create ProcessingBatch interface and collection
- [x] Create WorkstationAssignment interface and collection

#### Phase 2: Database Functions (2-3 hours) ✅
- [x] Create lib/db/transfers.ts with transfer batch functions
- [x] Create lib/db/processing-batches.ts with batch management
- [x] Create lib/db/workstation.ts with inspection and stage functions
- [x] Update lib/db/orders.ts for automatic status transitions

#### Phase 3: POS Initial Inspection (1-2 hours) ✅
- [x] Create GarmentInitialInspection.tsx component
- [x] Update POS page with initial inspection integration

#### Phase 4: Satellite Store Transfer System (3-4 hours) ✅
- [x] Create transfers page for batch management
- [x] Create TransferBatchForm component
- [x] Create IncomingBatchesList component
- [x] Create ReceiveBatchModal component
- [x] Implement auto driver assignment algorithm

#### Phase 5: Workstation Page (4-5 hours) ✅
- [x] Create workstation page with role-based access control
- [x] Create Overview tab with stats and metrics
- [x] Create InspectionQueue component with detailed inspection form
- [x] Create QueueManagement component for batch creation
- [x] Create ActiveProcesses component for monitoring
- [x] Create Completed tab for archive

#### Phase 6: Stage-Specific Interfaces (3-4 hours) ✅
- [x] Create WashingStation component
- [x] Create DryingStation component
- [x] Create IroningStation component
- [x] Create QualityCheckStation component
- [x] Create PackagingStation component

#### Phase 7: Staff Management (2-3 hours) ✅
- [x] Create StaffAssignment component
- [x] Update auth permissions for workstation roles
- [x] Update navigation sidebar with workstation link

#### Phase 8: Major Issues Workflow (1-2 hours) ✅
- [x] Create workstation notifications system
- [x] Create MajorIssuesReviewModal component

#### Phase 9: Performance Metrics (2-3 hours) ✅
- [x] Create StaffPerformance dashboard
- [x] Create WorkstationAnalytics component

#### Phase 10: Pipeline Updates (1 hour) ✅
- [x] Update pipeline page with inspection column
- [x] Restrict pipeline to manager-only access
- [x] Display staff handlers on order cards

#### Phase 11: Mobile Responsiveness (2 hours) ✅
- [x] Ensure tablet compatibility for all workstation interfaces
- [x] Responsive forms and grids
- [x] Mobile-first design approach

#### Phase 12: Testing & Documentation (2-3 hours) ✅
- [x] Test all workstation workflows
- [x] Create WORKSTATION_SYSTEM.md documentation (445 lines)
- [x] Test role-based access control
- [x] Test auto status transitions
- [x] Create WORKSTATION_SYSTEM_PLAN.md (1,186 lines)

### 3.5.1 Sidebar Navigation System (Additional Enhancement)
**Estimated Time:** 2-3 hours
**Status:** ✅ Complete
**Date Completed:** October 27, 2025

#### Sidebar Component Creation
- [x] Create Sidebar component (`components/layout/Sidebar.tsx`)
- [x] Design navigation structure with icons
- [x] Implement role-based navigation filtering
- [x] Create hierarchical menu with sub-items
- [x] Add user profile dropdown
- [x] Implement logout functionality

#### Mobile Responsiveness
- [x] Create hamburger menu for mobile
- [x] Implement slide-in drawer animation
- [x] Add backdrop overlay for mobile
- [x] Ensure touch-friendly interactions

#### Active State & Styling
- [x] Implement active route detection
- [x] Style active menu items (black background)
- [x] Add hover states (gray background)
- [x] Create expandable sub-menus with chevron icons
- [x] Add solid background to dropdown menu panel

#### Integration
- [x] Integrate sidebar into dashboard layout
- [x] Adjust main content area padding
- [x] Update workstation page layout
- [x] Test navigation across all pages
- [x] Verify role-based access control in sidebar

#### Navigation Structure
- [x] Dashboard (all roles)
- [x] Orders with sub-menu (All Orders, Create Order, Pipeline)
- [x] Workstation (workstation roles only)
- [x] Customers (front desk, managers)
- [x] Deliveries (drivers, managers)
- [x] Inventory (managers only)
- [x] Reports (managers only)
- [x] Staff (managers only)
- [x] Pricing (managers only)
- [x] Transactions (cashiers, managers)
- [x] Branches (director+)
- [x] Settings (managers only)

### 3.5.2 Executive Dashboards (Director & GM)
**Estimated Time:** 20-25 hours
**Status:** 🔄 In Progress
**Reference:** See `docs/DIRECTOR-SECURITY-SIDEBAR-PLAN.md` for full implementation details.

#### Phase 1: Firebase Security Rules Fix (P0 - Critical)
- [ ] Add `isExecutive()` helper function to `firestore.rules`
- [ ] Add `attendance` collection security rules
- [ ] Add `equipment` collection security rules
- [ ] Add `issues` collection security rules
- [ ] Add `customerFeedback` collection security rules
- [ ] Add `permissionRequests` collection security rules
- [ ] Update `users` collection rules for executive cross-branch read
- [ ] Update `branches` collection rules for executive access
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

#### Phase 2: Director Dashboard (P0) ✅
- [x] Create Director Dashboard with dark theme at `/dashboard`
- [x] Implement role-based dashboard routing (director → DirectorDashboard)
- [x] Create InsightsHeader with filters (timeframe, branch)
- [x] Create ExecutiveNarrative / Morning Briefing component
- [x] Create DirectorKPICards with real-time data
- [x] Create PredictivePerformanceChart
- [x] Create KeyDriversChart
- [x] Create RiskRadar component
- [x] Create AIRecommendations with agent system integration
- [x] Create BranchComparison analytics
- [x] Create OperationalHealth indicators
- [x] Create DirectorFooterInline

#### Phase 3: Director Strategic Sidebar (P0)
- [ ] Create directorNavigationItems array with 9 strategic pages
- [ ] Update ModernSidebar.tsx with role-based navigation
- [ ] Add section headers (MAIN, FINANCIAL, GOVERNANCE, AI-POWERED)
- [ ] Create `/director/intelligence` page (Strategic Intelligence)
- [ ] Create `/director/financial` page (Financial Command)
- [ ] Create `/director/growth` page (Growth Hub)
- [ ] Create `/director/performance` page (Performance Deep Dive)
- [ ] Create `/director/risk` page (Risk & Compliance)
- [ ] Create `/director/leadership` page (Leadership & People)
- [ ] Create `/director/board` page (Board Room)
- [ ] Create `/director/ai-lab` page (AI Strategy Lab)

#### Phase 4: GM Operations Dashboard (P1)
- [x] Create GM Operations Dashboard at `/dashboard` for general_manager role
- [ ] Fix Firebase permission errors for GM Dashboard queries
- [ ] Verify cross-branch data access for executives

#### Phase 5: Permission Approval System (P1)
- [ ] Create `permissionRequests` collection schema
- [ ] Create `lib/db/permission-requests.ts` database functions
- [ ] Create `/admin/permission-requests` page for Director approval queue
- [ ] Create PermissionRequestCard component
- [ ] Add notification badge on sidebar for pending approvals
- [ ] Implement approval/rejection workflow

#### Phase 6: Custom Claims Setup
- [ ] Set Director (Lawrence) custom claims: `{ role: 'director', branchId: 'HQ' }`
- [ ] Set GM (Grace) custom claims: `{ role: 'general_manager', branchId: 'HQ' }`
- [ ] Create "HQ" branch document in `branches` collection
- [ ] Verify executives can query cross-branch data

### 3.6 Employee Management & Tracking

#### Employee Management
- [ ] Create employees page (`app/dashboard/employees/page.tsx`)
- [ ] Display all staff members
- [ ] Create add employee form (admin only)
- [ ] Create edit employee form
- [ ] Assign roles to employees
- [ ] Assign employees to branches
- [ ] Manage employee status (active/inactive)
- [ ] Store employee contact information

#### Attendance & Shifts
- [ ] Create attendance tracking system
- [ ] Implement clock-in/clock-out interface
- [ ] Create shift schedule management
- [ ] Define shift types (morning, afternoon, night)
- [ ] Assign employees to shifts
- [ ] Track late arrivals and early departures
- [ ] Generate attendance reports

#### Productivity Metrics
- [ ] Track orders processed per employee
- [ ] Calculate average processing time
- [ ] Track order completion rate
- [ ] Measure quality issues (returns/complaints)
- [ ] Create productivity dashboard
- [ ] Generate employee performance reports
- [ ] Compare performance across employees

#### Payroll Integration (Optional/Future)
- [ ] Calculate hours worked
- [ ] Track overtime hours
- [ ] Generate payroll summaries
- [ ] Export payroll data

---

## Milestone 4: Testing & Refinement (Week 6)
**Target Completion:** December 19, 2025  
**Status:** ❌ Not Started

### 4.1 Testing - Weeks 1-2 (Nov 16-29)

#### Unit Testing
- [ ] Write tests for utility functions
- [ ] Test form validation schemas
- [ ] Test database helpers
- [ ] Test authentication helpers
- [ ] Test pricing calculation logic
- [ ] Test route optimization algorithm
- [ ] Achieve 80%+ code coverage (recommended)

#### Component Testing
- [ ] Test UI components (Button, Input, etc.)
- [ ] Test form components
- [ ] Test authentication components
- [ ] Test POS components
- [ ] Test pipeline components
- [ ] Test customer portal components

#### Integration Testing
- [ ] Test API endpoints (orders, customers, payments)
- [ ] Test authentication flow
- [ ] Test order creation flow
- [ ] Test payment processing
- [ ] Test notification sending
- [ ] Test route optimization
- [ ] Test database operations

#### End-to-End Testing
- [ ] Test complete order workflow (create → deliver)
- [ ] Test POS system (customer search, order creation, payment)
- [ ] Test pipeline (status updates, real-time sync)
- [ ] Test customer portal (login, tracking, profile)
- [ ] Test driver interface
- [ ] Test admin features
- [ ] Test cross-browser compatibility (Chrome, Safari, Firefox)
- [ ] Test mobile responsiveness

#### Performance Testing
- [ ] Test page load times (target < 2s)
- [ ] Test API response times (target < 500ms)
- [ ] Load test with 100 concurrent users
- [ ] Test real-time updates performance
- [ ] Test image upload performance
- [ ] Optimize slow queries
- [ ] Implement caching strategies

#### Security Testing
- [ ] Test authentication security
- [ ] Test authorization (role-based access)
- [ ] Test API security (rate limiting, validation)
- [ ] Test XSS protection
- [ ] Test SQL injection prevention
- [ ] Test CSRF protection
- [ ] Audit Firestore security rules
- [ ] Test payment security (PCI compliance via Pesapal)

### 4.2 Bug Fixes & Optimization - Week 2 (Nov 23-29)

#### Critical Bugs
- [ ] Fix any critical bugs blocking deployment
- [ ] Fix security vulnerabilities
- [ ] Fix data loss issues
- [ ] Fix payment processing errors

#### UI/UX Refinements
- [ ] Fix layout issues on mobile
- [ ] Improve form validation feedback
- [ ] Add loading states where missing
- [ ] Improve error messages
- [ ] Add empty states
- [ ] Improve navigation flow
- [ ] Polish animations and transitions
- [ ] Ensure consistent spacing and alignment

#### Performance Optimization
- [ ] Optimize images (compress, WebP format)
- [ ] Implement code splitting
- [ ] Lazy load components
- [ ] Optimize database queries (add indexes)
- [ ] Implement caching (React Query)
- [ ] Reduce bundle size
- [ ] Optimize API responses

#### Accessibility Audit
- [ ] Test with screen readers
- [ ] Ensure keyboard navigation works
- [ ] Check color contrast (WCAG AA)
- [ ] Add ARIA labels where needed
- [ ] Test with browser accessibility tools
- [ ] Ensure focus indicators are visible
- [ ] Test with various text sizes

### 4.3 User Acceptance Testing (UAT) - Weeks 3-4 (Nov 30 - Dec 19)

#### UAT Preparation
- [ ] Create UAT test cases
- [ ] Prepare test data
- [ ] Set up staging environment
- [ ] Create UAT documentation
- [ ] Schedule UAT sessions with Lorenzo Dry Cleaners

#### UAT Execution
- [ ] Conduct staff training (front desk, workstation, drivers)
- [ ] Observe staff using the system
- [ ] Collect feedback and issues
- [ ] Document requested changes
- [ ] Prioritize feedback (must-have vs. nice-to-have)

#### UAT Feedback Implementation
- [ ] Fix critical issues found during UAT
- [ ] Implement high-priority feature requests
- [ ] Refine UI based on user feedback
- [ ] Update documentation based on feedback

### 4.4 Documentation - Ongoing

#### Technical Documentation
- [ ] Complete API documentation
- [ ] Document database schema
- [ ] Document authentication flow
- [ ] Document deployment process
- [ ] Create architecture diagrams
- [ ] Document environment setup
- [ ] Create troubleshooting guide

#### User Documentation
- [ ] Create admin user guide
- [ ] Create front desk user guide
- [ ] Create workstation staff guide
- [ ] Create driver user guide
- [ ] Create customer portal guide
- [ ] Create FAQ document
- [ ] Record video tutorials (optional)

#### Training Materials
- [ ] Create onboarding slides
- [ ] Create quick reference guides
- [ ] Create training videos (screen recordings)
- [ ] Prepare live training session materials

### 4.5 Deployment Preparation - Week 4 (Dec 16-19)

#### Pre-Deployment Checklist
- [ ] All critical bugs fixed
- [ ] UAT sign-off received
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation completed
- [ ] Training materials ready
- [ ] Database migrations tested
- [ ] Backup strategy verified
- [ ] Rollback plan prepared

#### Production Environment Setup
- [ ] Set up production Firebase project
- [ ] Configure production environment variables
- [ ] Set up production domain and SSL
- [ ] Configure production API keys (Wati, Pesapal, etc.)
- [ ] Set up production monitoring (Sentry)
- [ ] Configure production backups
- [ ] Set up production logging
- [ ] Test production environment

#### Deployment
- [ ] Deploy to staging and verify
- [ ] Run smoke tests on staging
- [ ] Get final approval from client
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Run smoke tests on production
- [ ] Monitor for errors (2 hours post-deployment)

#### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all integrations working
- [ ] Test critical user flows
- [ ] Set up monitoring alerts
- [ ] Schedule follow-up meeting with client
- [ ] Collect initial user feedback

#### Go-Live Support
- [ ] Be available for emergency support
- [ ] Monitor system closely for first 24 hours
- [ ] Address any urgent issues immediately
- [ ] Document any post-launch issues
- [ ] Schedule post-launch review meeting

---

## Milestone 5: v2.0 Feature Modules
**Target:** February - April 2026
**Status:** 🔄 Specification Complete | Implementation Not Started
**Spec Pack:** `docs/upgrades/lorenzo_feature_spec_pack_v1/` (7 docs, 648KB)
**Visual Mockups:** `docs/upgrades/lorenzo_feature_spec_pack_v1/mockups.pen`

### 5.0 v2.0 Specification & Planning ✅
**Status:** ✅ Complete (February 12, 2026)

#### Specification Documents
- [x] Write Master Feature Spec (`lorenzo_master_feature_spec.md`, 57KB)
- [x] Write Module 1: Order Management spec (`lorenzo_module1_order_management_spec.md`, 90KB)
- [x] Write Module 2: Driver & Logistics spec (`lorenzo_module2_driver_logistics_spec.md`, 91KB)
- [x] Write Module 3: Proximity Offers spec (`lorenzo_module3_proximity_spec.md`, 107KB)
- [x] Write Module 4: Customer Preferences spec (`lorenzo_module4_preferences_spec.md`, 103KB)
- [x] Write Module 5: AI Insights spec (`lorenzo_module5_ai_insights_spec.md`, 107KB)
- [x] Write Module 6: Voucher & Approval spec (`lorenzo_module6_voucher_spec.md`, 94KB)

#### Visual Mockups
- [x] Create Director Executive Dashboard mockup (.pen file)
- [x] Create GM Operations Dashboard mockup (.pen file)

#### Planning Updates
- [x] Update PLANNING.md with v2.0 roadmap and navigation restructure
- [x] Update TASKS.md with Milestone 5 implementation tasks

### 5.1 Phase 5a: Foundation — M1 Order Enhancements + M6 Voucher Enhancements
**Status:** ❌ Not Started
**Estimated Time:** 4-6 weeks
**Dependencies:** None (builds on existing foundation)
**Spec References:** `lorenzo_module1_order_management_spec.md` Sections 5-8, 20; `lorenzo_module6_voucher_spec.md` Sections 5-8, 20

#### M1: Order Management Enhancements `[ENHANCE]`
- [ ] Add batch status update API endpoint and UI (select multiple orders, change status)
- [ ] Enhance order search with advanced filters (garment type, service, date range, staff)
- [ ] Add order analytics hooks for Module 5 data pipeline
- [ ] Implement order timeline audit trail UI (show all status changes with who/when)
- [ ] Add order priority system (standard, rush, VIP)
- [ ] Enhance order notes with staff @mentions and timestamps
- [ ] Create order export functionality (CSV/Excel with multi-sheet support)
- [ ] Add order duplication (re-order) from order history
- [ ] Implement order split/merge operations for complex orders
- [ ] Wire up all 6 WhatsApp notification triggers to status transitions

#### M6: Voucher & Approval Enhancements `[ENHANCE]`
- [ ] Create VoucherTemplate interface and `voucherTemplates` Firestore collection
- [ ] Create VoucherCampaign interface and `voucherCampaigns` Firestore collection
- [ ] Build bulk voucher generation UI (generate N vouchers from template)
- [ ] Build campaign management page (`/director/vouchers`)
- [ ] Add voucher usage analytics dashboard (redemption rate, revenue impact)
- [ ] Enhance approval workflow with multi-tier approval (manager → director)
- [ ] Add voucher QR code generation for customer portal
- [ ] Create customer portal voucher wallet (view, apply, history)
- [ ] Add WhatsApp notification when voucher issued + expiry reminder
- [ ] Implement voucher auto-expiry Cloud Function (scheduled daily)

### 5.2 Phase 5b: Extensions — M2 Driver & Logistics + M4 Customer Preferences
**Status:** ❌ Not Started
**Estimated Time:** 6-8 weeks
**Dependencies:** Phase 5a (M1 order enhancements)
**Spec References:** `lorenzo_module2_driver_logistics_spec.md` Sections 5-8, 20; `lorenzo_module4_preferences_spec.md` Sections 5-8, 20

#### M2: Driver & Logistics `[ENHANCE]`
- [ ] Implement driver performance scoring algorithm (on-time %, deliveries/day, customer rating)
- [ ] Build driver leaderboard dashboard widget
- [ ] Add ETA recalculation on route deviation or delay
- [ ] Implement failed delivery workflow (photo proof, reschedule, customer notification)
- [ ] Add multi-stop batch optimization with time windows
- [ ] Create delivery analytics page (`/director/logistics`)
- [ ] Build GM deliveries page (`/gm/deliveries`) with active deliveries and urgent issues
- [ ] Enhance satellite transfer routing (auto-assign driver, optimize batch transfers)
- [ ] Add delivery-specific WhatsApp templates (failed/rescheduled notification)
- [ ] Implement real-time driver location subscription (onSnapshot)

#### M4: Customer Preferences & AI `[ENHANCE/NEW]`
- [ ] Create `customerConversations` Firestore collection (WhatsApp + staff notes)
- [ ] Create `customerPreferenceProfiles` Firestore collection (AI-extracted)
- [ ] Build Wati.io webhook endpoint to capture inbound customer WhatsApp messages
- [ ] Build staff notes capture UI at POS order creation (observations, verbal requests)
- [ ] Implement AI preference extraction pipeline (LLM analyzes conversations → structured preferences)
- [ ] Create CustomerBrief card component (AI summary shown at POS during order creation)
- [ ] Build customer intelligence page (`/director/customers`) with retention, segments, preference coverage
- [ ] Enhance customer portal with preferences editor (service prefs, communication prefs)
- [ ] Add AI-generated "your profile" summary to customer portal
- [ ] Create preference-driven POS auto-fill (suggest services based on customer history)

### 5.3 Phase 5c: Intelligence — M3 Proximity Offers + M5 AI Insights
**Status:** ❌ Not Started
**Estimated Time:** 8-10 weeks
**Dependencies:** Phase 5b (M4 customer preferences, M2 logistics)
**Spec References:** `lorenzo_module3_proximity_spec.md` Sections 5-8, 14, 20; `lorenzo_module5_ai_insights_spec.md` Sections 5-8, 14, 20

#### M3: Proximity Pickup Offers `[NEW]` (Pattern-Based, NOT GPS)
- [ ] Create ProximityOffer interface and `proximityOffers` Firestore collection
- [ ] Create OfferSchedule interface and `offerSchedules` Firestore collection
- [ ] Build pattern detection engine (analyze customer order frequency, timing, branch visited)
- [ ] Implement eligibility scoring algorithm (recency-weighted frequency analysis)
- [ ] Build cooldown system to prevent offer fatigue (configurable per-customer)
- [ ] Create proactive offer scheduling Cloud Function (daily batch processing)
- [ ] Register new WhatsApp templates with Meta (proactive_pickup_offer, special_deal_offer)
- [ ] Build offer response tracking (accepted/declined/ignored via webhook)
- [ ] Create customer portal offer inbox (pending offers, opt-in/out toggle, history)
- [ ] Build offer analytics dashboard (`/director/customers` tab)
- [ ] Implement opt-in management (customer portal + staff override)

#### M5: AI Insights & Dashboard Intelligence `[ENHANCE]`
- [ ] Create AIInsight interface and `aiInsights` Firestore collection
- [ ] Create AIRecommendation interface and `aiRecommendations` Firestore collection
- [ ] Create AnalyticsSnapshot interface and `analyticsSnapshots` Firestore collection
- [ ] Build data pipeline: Orders (M1) → revenue/volume metrics for AI analysis
- [ ] Build data pipeline: Logistics (M2) → delivery performance for AI analysis
- [ ] Build data pipeline: Preferences (M4) → retention/churn signals for AI analysis
- [ ] Build data pipeline: Proximity (M3) → campaign effectiveness for AI analysis
- [ ] Build data pipeline: Vouchers (M6) → discount impact for AI analysis
- [ ] Implement automated insight scheduling (Cloud Function, configurable frequency)
- [ ] Build recommendation approval workflow (AI generates → director approves/rejects)
- [ ] Implement anomaly detection (statistical + LLM-based)
- [ ] Build demand forecasting (predictive analytics using historical patterns)
- [ ] Enhance Director Executive Dashboard with AI-powered widgets
- [ ] Build AI Insights detail page (`/director/insights`) with predictions, anomalies, recommendations
- [ ] Implement impact tracking (track recommendation outcomes over time)
- [ ] Create exportable insight reports (PDF/Excel, scheduled weekly/monthly)
- [ ] Implement LLM fallback chain (OpenAI → Anthropic → Google → Local)

### 5.4 Phase 5d: Integration & Navigation Restructure
**Status:** ❌ Not Started
**Estimated Time:** 2-3 weeks
**Dependencies:** Phases 5a-5c
**Spec References:** `lorenzo_master_feature_spec.md` Sections 7-8

#### Navigation Restructure
- [ ] Update `components/modern/ModernSidebar.tsx` — Director navigation (14 items, 4 groups)
- [ ] Update `components/modern/ModernSidebar.tsx` — GM navigation (9 items, 3 groups)
- [ ] Migrate/absorb 7 orphaned director pages into new module detail pages
- [ ] Add section headers (OVERVIEW, MODULES, OPERATIONS, GOVERNANCE) to sidebar
- [ ] Add notification badges for pending approvals on sidebar items

#### Cross-Module Integration Testing
- [ ] Test data flow: Order creation → all module pipelines → dashboard widgets
- [ ] Test notification flows: status changes → WhatsApp templates → delivery tracking
- [ ] Test audit trail: all CRUD operations → audit log entries with before/after
- [ ] Test customer portal: order tracking + voucher wallet + preferences + offer inbox
- [ ] Test branch scoping: main vs satellite behavior across all modules
- [ ] Test RBAC: verify 14 roles × module access permissions
- [ ] Test real-time subscriptions: onSnapshot for critical, polling for non-critical
- [ ] Test LLM fallback chain: provider failures → graceful degradation
- [ ] Performance test: dashboard load times with full module data (<2s target)
- [ ] E2E test: complete customer journey (order → process → deliver → offer → re-order)

---

## Ongoing Tasks

### Daily
- [ ] Review and respond to GitHub issues
- [ ] Monitor CI/CD pipeline
- [ ] Check error logs (Sentry)
- [ ] Review pull requests
- [ ] Update TASKS.md with progress

### Weekly
- [ ] Team standup meeting
- [ ] Review sprint progress
- [ ] Update PLANNING.md if needed
- [ ] Review and prioritize backlog
- [ ] Check performance metrics
- [ ] Review security alerts
- [ ] Update documentation

### Monthly
- [ ] Review business metrics with client
- [ ] Gather user feedback
- [ ] Plan next month's features
- [ ] Review technical debt
- [ ] Update roadmap
- [ ] Review and optimize costs (Firebase, APIs)

---

## Backlog / Future Enhancements

### Phase 2 Features (Post-Launch)
- [ ] Multi-language support (Swahili)
- [ ] Dark mode
- [ ] Progressive Web App (PWA) support
- [ ] Offline mode for POS
- [ ] Mobile apps (iOS/Android)
- [ ] Customer loyalty program
- [ ] Referral system
- [ ] SMS notifications (fallback for WhatsApp)
- [ ] Email marketing integration
- [ ] Advanced reporting dashboard
- [ ] Export reports to Excel/PDF
- [ ] Automated inventory reordering
- [ ] Integration with accounting software (QuickBooks, Xero)
- [ ] Multi-branch view for admins
- [ ] Franchise management features
- [ ] Advanced AI features (demand forecasting, dynamic pricing)
- [ ] Customer feedback/rating system
- [ ] QR code for order tracking
- [ ] Barcode scanning for garments
- [ ] RFID tracking (if feasible)
- [ ] Live chat support
- [ ] Push notifications
- [ ] Calendar integration for pickups/deliveries
- [ ] Subscription-based services
- [ ] Corporate accounts management
- [ ] Gift vouchers/coupons

### Technical Improvements
- [ ] Implement GraphQL (if needed)
- [ ] Set up microservices architecture (if scale requires)
- [ ] Implement advanced caching (Redis)
- [ ] Set up CDN for static assets
- [ ] Implement WebSockets for real-time features
- [ ] Add service workers for offline support
- [ ] Implement A/B testing framework
- [ ] Set up feature flags
- [ ] Implement advanced analytics (Mixpanel, Amplitude)
- [ ] Add automated integration tests in CI/CD
- [ ] Set up automated performance testing
- [ ] Implement chaos engineering for resilience testing

---

## Notes for Task Management

### How to Use This File
1. **At the start of each work session:**
   - Read PLANNING.md
   - Review TASKS.md
   - Pick a task to work on
   - Mark task as 🔄 In Progress

2. **When completing a task:**
   - Mark task as ✅ Completed
   - Update the "Last Updated" date at the top
   - Commit changes to GitHub
   - Add any new discovered tasks

3. **If blocked:**
   - Mark task as ⚠️ Blocked
   - Add a note explaining the blocker
   - Move to next available task
   - Communicate blocker to team

### Task Priority Levels
- **P0 (Critical):** Must be completed for launch
- **P1 (High):** Important but not blocking
- **P2 (Medium):** Nice to have
- **P3 (Low):** Future enhancement

### Estimated Hours
Feel free to add time estimates next to tasks:
```
- [ ] Create login page [4 hours]
- [ ] Implement authentication [8 hours]
```

### Task Dependencies
If a task depends on another, note it:
```
- [ ] Deploy to production [depends on: UAT completion]
- [ ] Test payment flow [depends on: Pesapal setup]
```

---

## Team Assignments (Optional)

### Gachengoh Marugu (Lead Developer)
- Overall project coordination
- Architecture decisions
- Code reviews
- Complex feature implementation

### Arthur Tutu (Backend Developer)
- Firebase setup and configuration
- Cloud Functions development
- API endpoint development
- Database schema implementation
- Third-party integrations

### Jerry Nduriri (POS & Product Manager)
- POS system development
- Product requirements clarification
- UAT coordination
- User training

---

## Progress Tracking

### Milestone Progress
- **Milestone 1 (Foundation):** ✅ 100% (108/108 tasks)
- **Milestone 2 (Core Modules):** ✅ ~85% (112/132 tasks) - Customer Portal ✅ | Pipeline ✅ | POS System ✅
- **Milestone 3 (Advanced Features):** 🔄 ~75% (140/186 tasks) - Workstation ✅ | Sidebar ✅ | POS ✅ | Executive Dashboards 🔄 | Delivery ⚠️ | Maps ⚠️
- **Milestone 4 (Testing & Refinement):** ❌ 0% (0/97 tasks)
- **Milestone 5 (v2.0 Feature Modules):** 🔄 Specs ✅ (7/7 docs + mockups) | Implementation ❌ (0/~81 tasks)

**v1.x Progress:** ~65% (360/523 tasks) - POS ✅ | Workstation ✅ | Director Dashboard ✅ | GM Dashboard 🔄
**v2.0 Progress:** Specification 100% | Implementation 0%

### Weekly Velocity
- **Week 1 (Oct 10-17):** 108 tasks completed ✅ (Milestone 1 - Foundation)
- **Week 2 (Oct 11-14):** ~112 tasks completed ✅ (Milestone 2 - Customer Portal ✅, Pipeline ✅, POS ✅)
- **Week 3 (Oct 14-21):** 0 tasks completed (Testing & Documentation)
- **Week 4 (Oct 21-27):** 115 tasks completed ✅ (Milestone 3 - Workstation System + Sidebar Navigation)
- **Week 5 (Oct 28-Nov 3):** TBD (Focus: Delivery System + Google Maps)
- **Week 6 (Nov 4-10):** TBD (Focus: Testing & UAT)
- **Jan 2026:** Executive Dashboards 🔄 (Director Dashboard ✅, Security Rules 🔄, Strategic Sidebar 🔄)
- **Feb 12, 2026:** v2.0 Feature Spec Pack complete ✅ (7 docs, 648KB, 2 visual mockups)

---

**Last Updated:** February 12, 2026
**Next Review:** February 19, 2026 (Weekly)
**Status:** Milestones 1-2 ✅ | Milestone 3 🔄 (~75%) | Milestone 4 ❌ | **Milestone 5 v2.0 Specs ✅ — Next: Complete M3 remaining tasks (Delivery, Maps) then begin Phase 5a implementation** 🎯

---

**Remember:**
- ✅ Update this file daily
- ✅ Mark completed tasks immediately
- ✅ Add new tasks as discovered
- ✅ Communicate blockers to the team
- ✅ Celebrate small wins! 🎉
