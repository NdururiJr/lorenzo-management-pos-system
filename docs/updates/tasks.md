# Dry Cleaning Management System - Enhancement Tasks

**Project**: Lorenzo Dry Cleaners System Enhancements  
**Duration**: 30 weeks + 1 week pre-implementation  
**Task Management**: Check off tasks as completed  
**Status Tracking**: Use GitHub Issues/Jira to link to these tasks  

---

## How to Use This Document

1. **Before Starting**: Complete ALL Phase 0 tasks
2. **Daily**: Review tasks for current week
3. **Check Off**: Mark tasks complete with `[x]`
4. **Track Blockers**: Note blockers in comments
5. **Update Status**: Keep this document in sync with project board

**Status Indicators**:
- `[ ]` - Not started
- `[x]` - Completed
- `[!]` - Blocked (note blocker in comments)
- `[~]` - In progress

---

## PHASE 0: PRE-IMPLEMENTATION (Week 0)

**Goal**: Complete codebase analysis and create integration plan  
**Duration**: 5 days  
**Team**: Tech Lead + Senior Developer  

### Day 1: Backend & Database Discovery

#### Backend Analysis
- [ ] Clone repository to local machine
  ```bash
  git clone <repository-url>
  cd <project-directory>
  ```

- [ ] Install dependencies and run application
  ```bash
  npm install  # or pip install -r requirements.txt
  npm run dev  # or python manage.py runserver
  ```

- [ ] Verify application runs successfully
  - [ ] Backend accessible at expected port
  - [ ] No console errors
  - [ ] Can access basic endpoints

- [ ] Identify backend technology stack
  - [ ] Check package.json or requirements.txt
  - [ ] Document runtime version (Node.js/Python/etc.)
  - [ ] Document framework (Express/NestJS/FastAPI/Django/etc.)
  - [ ] Document language (TypeScript/JavaScript/Python/etc.)

- [ ] Review project structure
  - [ ] Document folder organization (src/, app/, etc.)
  - [ ] Identify layers (controllers/services/repositories)
  - [ ] Note file naming conventions (kebab-case/camelCase/etc.)

- [ ] Analyze service layer
  - [ ] Locate existing services (services/ or app/services/)
  - [ ] Document service naming pattern
  - [ ] Review 2-3 existing services for patterns
  - [ ] Note dependency injection approach (if any)

- [ ] Analyze middleware
  - [ ] Locate authentication middleware
  - [ ] Locate validation middleware
  - [ ] Locate error handling middleware
  - [ ] Document middleware patterns

- [ ] Review API routes
  - [ ] Document route structure (/api/v1 or /api/)
  - [ ] Note endpoint naming conventions
  - [ ] Review 5-10 existing endpoints
  - [ ] Document HTTP method usage patterns

#### Database Analysis
- [ ] Identify database type
  - [ ] Check config files for database connection
  - [ ] Document database (PostgreSQL/MySQL/MongoDB/etc.)
  - [ ] Document version

- [ ] Access database
  - [ ] Connect using database client
  - [ ] Verify connection successful
  - [ ] Document connection details for team

- [ ] Export database schema
  ```bash
  # PostgreSQL
  pg_dump -U username -d database_name --schema-only > schema.sql
  
  # MySQL
  mysqldump -u username -p database_name --no-data > schema.sql
  ```

- [ ] Document all existing tables
  - [ ] List all table names
  - [ ] Note table naming convention (plural/singular, snake_case/camelCase)
  - [ ] Document critical tables: users, customers, orders, order_items, branches

- [ ] Analyze table structures
  - [ ] Document primary key types (UUID/auto-increment)
  - [ ] Document foreign key patterns
  - [ ] Note timestamp column naming (created_at/createdAt)
  - [ ] Check for soft delete pattern (deleted_at field)

- [ ] Review existing indexes
  - [ ] List all indexes
  - [ ] Note index naming convention
  - [ ] Document index patterns

- [ ] Identify migration system
  - [ ] Locate migration files (migrations/, prisma/, etc.)
  - [ ] Document migration tool (Prisma/Sequelize/TypeORM/raw SQL)
  - [ ] Review 2-3 recent migrations for pattern

- [ ] Document ORM/Query Builder
  - [ ] Identify ORM (Prisma/Sequelize/TypeORM/Mongoose/etc.)
  - [ ] Locate model definitions
  - [ ] Review model patterns
  - [ ] Note query patterns used

### Day 2: Frontend & Mobile Discovery

#### Frontend Analysis
- [ ] Identify frontend framework
  - [ ] Check package.json
  - [ ] Document framework (React/Next.js/Vue/Angular/etc.)
  - [ ] Document version

- [ ] Review project structure
  - [ ] Document folder organization
  - [ ] Identify component organization (atomic/feature-based/etc.)
  - [ ] Note file naming conventions

- [ ] Analyze component patterns
  - [ ] Review 5-10 existing components
  - [ ] Document component structure (functional/class)
  - [ ] Note prop patterns
  - [ ] Document export patterns (default/named)

- [ ] Identify state management
  - [ ] Check for Redux/Zustand/React Query/Context
  - [ ] Locate state configuration
  - [ ] Review state usage in 2-3 components
  - [ ] Document state patterns

- [ ] Review UI library
  - [ ] Identify UI components (Tailwind/MUI/Ant Design/shadcn/etc.)
  - [ ] Document styling approach (CSS-in-JS/Modules/Tailwind)
  - [ ] Note component import patterns
  - [ ] Review theme/design system if exists

- [ ] Analyze form handling
  - [ ] Identify form library (React Hook Form/Formik/etc.)
  - [ ] Review form validation approach
  - [ ] Document form patterns

- [ ] Review API integration
  - [ ] Locate API service files
  - [ ] Document HTTP client (axios/fetch)
  - [ ] Review API call patterns
  - [ ] Note error handling approach

- [ ] Analyze routing
  - [ ] Identify routing library (React Router/Next.js/etc.)
  - [ ] Review route structure
  - [ ] Document protected route pattern

#### Mobile Discovery (if exists)
- [ ] Check for mobile app
  - [ ] Look for mobile/, ios/, android/ folders
  - [ ] Identify framework (React Native/Flutter/Native)

- [ ] If React Native/Flutter exists:
  - [ ] Document navigation library
  - [ ] Review state management
  - [ ] Check offline storage approach
  - [ ] Document API integration pattern
  - [ ] Review push notification setup

- [ ] If no mobile app:
  - [ ] Document as "Mobile app needed for Phase 3"
  - [ ] Note framework recommendation based on team skills

#### Build & Deployment Discovery
- [ ] Review build process
  - [ ] Document build commands
  - [ ] Check webpack/vite/etc. configuration
  - [ ] Note environment-specific builds

- [ ] Identify deployment approach
  - [ ] Check for CI/CD configuration (.github/, .gitlab-ci.yml)
  - [ ] Document deployment process
  - [ ] Note environments (dev/staging/production)

### Day 3: Architecture Documentation

#### Create EXISTING_STACK.md
- [ ] Create new file: `docs/EXISTING_STACK.md`

- [ ] Document Backend section
  ```markdown
  ## Backend
  - **Runtime**: [Node.js v18.x / Python 3.11 / etc.]
  - **Framework**: [Express 4.x / NestJS / FastAPI / etc.]
  - **Language**: [TypeScript / JavaScript / Python]
  - **Database**: [PostgreSQL 14 / MySQL 8 / etc.]
  - **ORM**: [Prisma / Sequelize / TypeORM / etc.]
  - **Auth**: [JWT / Passport / etc.]
  - **Validation**: [Zod / Joi / class-validator / etc.]
  - **Testing**: [Jest / Vitest / pytest / etc.]
  ```

- [ ] Document Frontend section
  ```markdown
  ## Frontend
  - **Framework**: [React 18 / Next.js 14 / etc.]
  - **Language**: [TypeScript / JavaScript]
  - **State**: [Redux Toolkit / Zustand / React Query / etc.]
  - **Styling**: [Tailwind CSS / MUI / etc.]
  - **Forms**: [React Hook Form / Formik / etc.]
  - **HTTP**: [axios / fetch / etc.]
  - **Routing**: [React Router / Next.js / etc.]
  ```

- [ ] Document Database conventions
  ```markdown
  ## Database Schema Conventions
  - **Table naming**: [snake_case / camelCase]
  - **ID type**: [UUID / Integer]
  - **Timestamps**: [created_at/updated_at / createdAt/updatedAt]
  - **Soft deletes**: [Yes/No - deleted_at field?]
  - **Foreign keys**: [Naming pattern]
  ```

- [ ] Document Architecture patterns
  ```markdown
  ## Architecture Patterns
  - **Structure**: [Layered (Controller/Service/Repository) / etc.]
  - **DI**: [Yes/No - which container?]
  - **Error handling**: [Centralized error handler / etc.]
  - **API versioning**: [/api/v1 / /api / none]
  - **Response format**: [{ data, message } / { success, data } / etc.]
  ```

- [ ] Document Existing integrations
  ```markdown
  ## Existing Integrations
  - **SMS**: [Twilio / Africa's Talking / None]
  - **Email**: [SendGrid / AWS SES / None]
  - **Payment**: [None - to be added]
  - **File Storage**: [AWS S3 / Local / None]
  ```

- [ ] Commit EXISTING_STACK.md
  ```bash
  git add docs/EXISTING_STACK.md
  git commit -m "docs: add existing stack documentation"
  git push
  ```

#### Create ARCHITECTURE.md
- [ ] Create new file: `docs/ARCHITECTURE.md`

- [ ] Document system overview
  - [ ] High-level architecture diagram (if possible)
  - [ ] Component overview
  - [ ] Data flow description

- [ ] Document backend architecture
  - [ ] Layer description (Controller → Service → Repository → DB)
  - [ ] Service dependencies
  - [ ] Common patterns used

- [ ] Document frontend architecture
  - [ ] Component hierarchy
  - [ ] State management flow
  - [ ] API integration approach

- [ ] Document key design decisions
  - [ ] Why certain patterns chosen
  - [ ] Known technical debt
  - [ ] Areas needing improvement

- [ ] Commit ARCHITECTURE.md
  ```bash
  git add docs/ARCHITECTURE.md
  git commit -m "docs: add architecture documentation"
  git push
  ```

#### Document Naming Conventions
- [ ] Create naming conventions guide
  - [ ] File naming (kebab-case/camelCase/PascalCase)
  - [ ] Variable naming (camelCase/snake_case)
  - [ ] Function naming (verb-noun pattern)
  - [ ] Component naming (PascalCase)
  - [ ] Test file naming (*.test.ts / *.spec.ts)

### Day 4: Integration Planning

#### Create INTEGRATION_POINTS.md
- [ ] Create new file: `docs/INTEGRATION_POINTS.md`

- [ ] For each feature, document integration points:

**FR-001: Automated Quotation System**
- [ ] Tables to extend: `orders`, `customers`
- [ ] New tables: `quotations`
- [ ] Services to reuse: OrderService, PricingService, NotificationService
- [ ] Components to extend: OrderForm
- [ ] New components: QuotationForm, QuotationApproval

**FR-002: Redo Items Policy**
- [ ] Tables to extend: `orders`
- [ ] New tables: `redo_items`
- [ ] Services to reuse: OrderService, NotificationService
- [ ] Components to extend: OrderDetails
- [ ] New components: RedoItemForm, RedoMetricsWidget

**FR-003: Defect Notification Timelines**
- [ ] Tables to extend: `orders`
- [ ] New tables: `defect_notifications`, `defect_notification_timelines`
- [ ] Services to reuse: NotificationService
- [ ] New services: DefectNotificationService
- [ ] New components: DefectNotificationForm

**FR-004: QC to Customer Service Handover**
- [ ] New tables: `qc_handovers`
- [ ] Services to reuse: OrderService, NotificationService
- [ ] New services: QCHandoverService
- [ ] New components: QCHandoverForm, HandoverQueue

**FR-005: Partial Payment Handling**
- [ ] Tables to extend: `orders`
- [ ] New tables: `payments`
- [ ] Services to reuse: OrderService, NotificationService
- [ ] New services: PaymentService
- [ ] Components to extend: Checkout, OrderDetails
- [ ] New components: PaymentHistory

**FR-006: Multi-Location Routing**
- [ ] Tables to extend: `orders`
- [ ] New tables: `transfer_manifests`, `manifest_items`
- [ ] Services to reuse: OrderService
- [ ] New services: RoutingService, ManifestService
- [ ] New components: ManifestGenerator, RoutingStatus

**FR-007: Sorting Timelines**
- [ ] Tables to extend: `branches`, `orders`
- [ ] Services to extend: RoutingService
- [ ] New services: SortingTimelineService
- [ ] New components: SortingConfiguration

**FR-008: Status Terminology Update**
- [ ] Tables to modify: `orders` (status column values)
- [ ] Files to update: All files referencing "Ready" status
- [ ] Components to update: OrderStatus displays

**FR-009: Payment Processing**
- [ ] Tables to extend: `payments`
- [ ] New integrations: M-Pesa API, PDQ SDK
- [ ] New services: MPesaService, PDQService
- [ ] Mobile app: New payment screens
- [ ] New components: PaymentProcessor

**FR-010: Home Cleaning System Access**
- [ ] New services: SSOService
- [ ] Components to extend: POS Main Menu
- [ ] New components: HomeCleaningButton

**FR-011: Loyalty Points System**
- [ ] Tables to extend: `customers`
- [ ] New tables: `loyalty_points_transactions`, `loyalty_milestones`
- [ ] New services: LoyaltyPointsService
- [ ] New components: PointsBalance, PointsHistory, RedeemPoints

**FR-012: Payment Report Filtering**
- [ ] Services to extend: ReportingService
- [ ] Components to extend: PaymentReports
- [ ] New components: PaymentFilter

**FR-013: Free Delivery Automation**
- [ ] New tables: `system_config`
- [ ] Services to extend: PricingService
- [ ] New services: DeliveryFeeService
- [ ] Components to extend: OrderSummary

**FR-014: Foreign Phone Support**
- [ ] Tables to extend: `customers`
- [ ] New utilities: PhoneValidator
- [ ] Services to extend: SMSService
- [ ] Components to extend: CustomerForm
- [ ] New components: InternationalPhoneInput

**FR-015: Load-Based Pricing**
- [ ] Tables to extend: `order_items`, `orders`
- [ ] New tables: `pricing_rules`
- [ ] Services to extend: PricingService
- [ ] New services: CapacityPlanningService
- [ ] Components to extend: OrderForm

**FR-016: Legacy Data Migration**
- [ ] Migration scripts
- [ ] Validation scripts
- [ ] Rollback procedures

**FR-017: Customer Segmentation**
- [ ] Tables to extend: `customers`
- [ ] New tables: `customer_statistics`, `corporate_agreements`
- [ ] New services: CustomerSegmentationService
- [ ] Scheduled jobs: Daily segment evaluation
- [ ] Components to extend: CustomerDetails

- [ ] Commit INTEGRATION_POINTS.md
  ```bash
  git add docs/INTEGRATION_POINTS.md
  git commit -m "docs: add integration points documentation"
  git push
  ```

#### Identify Potential Conflicts
- [ ] Review integration points for conflicts
  - [ ] Multiple features touching same tables
  - [ ] Overlapping functionality
  - [ ] Competing patterns

- [ ] Document resolution strategy for conflicts
  - [ ] Order of implementation to avoid conflicts
  - [ ] Shared services approach
  - [ ] Communication plan for coordinating changes

#### Create Feature Dependency Map
- [ ] Document which features depend on others
  - [ ] FR-002, FR-003, FR-004 depend on FR-008
  - [ ] FR-001 depends on FR-017, FR-015
  - [ ] FR-009 depends on FR-005
  - [ ] FR-011 depends on FR-017, FR-005
  - [ ] FR-012 depends on FR-009
  - [ ] FR-015 depends on FR-017

### Day 5: Development Environment & Planning

#### Set Up Development Environment
- [ ] Create comprehensive setup guide
  - [ ] Update README.md with setup instructions
  - [ ] Document prerequisites
  - [ ] Document installation steps
  - [ ] Document how to run tests

- [ ] Set up local development environment
  - [ ] Install all dependencies
  - [ ] Configure database
  - [ ] Load sample/test data
  - [ ] Run all existing tests
  - [ ] Verify all tests pass

- [ ] Configure development tools
  - [ ] Set up code editor with project settings
  - [ ] Install recommended extensions
  - [ ] Configure linter
  - [ ] Configure formatter
  - [ ] Set up debugger

- [ ] Set up database client
  - [ ] Install pgAdmin/MySQL Workbench/etc.
  - [ ] Connect to local database
  - [ ] Create saved queries for common tasks

- [ ] Set up API testing
  - [ ] Install Postman/Insomnia
  - [ ] Create collection for existing endpoints
  - [ ] Test 5-10 key endpoints

#### Branch Strategy
- [ ] Define branch naming convention
  ```
  feature/phase-1-fr-002-redo-items
  feature/phase-2-fr-005-partial-payments
  bugfix/fix-status-display
  hotfix/critical-payment-issue
  ```

- [ ] Create main development branches
  ```bash
  git checkout -b develop
  git push -u origin develop
  ```

- [ ] Set up branch protection rules
  - [ ] Require pull request reviews
  - [ ] Require status checks to pass
  - [ ] Require up-to-date branches

#### Create Phase 1 Implementation Plan
- [ ] Break down Phase 1 features into tasks
  - [ ] FR-008: 15 tasks
  - [ ] FR-016: 20 tasks
  - [ ] FR-002: 25 tasks
  - [ ] FR-003: 20 tasks
  - [ ] FR-004: 25 tasks

- [ ] Assign initial task ownership
  - [ ] Assign based on developer strengths
  - [ ] Balance workload across team
  - [ ] Identify tasks requiring pair programming

- [ ] Set up project board
  - [ ] Create columns: Backlog, Ready, In Progress, Review, Done
  - [ ] Add all Phase 1 tasks
  - [ ] Link to this tasks.md file

#### Testing Strategy
- [ ] Document testing approach
  - [ ] Unit test requirements (80% coverage)
  - [ ] Integration test requirements
  - [ ] E2E test approach
  - [ ] Performance test plan

- [ ] Set up testing infrastructure
  - [ ] Configure test database
  - [ ] Set up test data fixtures
  - [ ] Configure CI/CD for tests
  - [ ] Document how to run tests

#### Documentation Standards
- [ ] Create documentation template
  - [ ] API endpoint documentation format
  - [ ] Service documentation format
  - [ ] Component documentation format

- [ ] Set up documentation tools
  - [ ] API documentation (Swagger/OpenAPI)
  - [ ] Code documentation (JSDoc/TSDoc)
  - [ ] README templates

### Phase 0 Exit Criteria Review

- [ ] All discovery documents created
  - [ ] EXISTING_STACK.md complete and reviewed
  - [ ] ARCHITECTURE.md complete and reviewed
  - [ ] INTEGRATION_POINTS.md complete and reviewed

- [ ] Development environment ready
  - [ ] All developers can run system locally
  - [ ] All tests passing
  - [ ] Sample data loaded

- [ ] Phase 1 plan approved
  - [ ] Tasks defined and assigned
  - [ ] Timeline agreed upon
  - [ ] Resources allocated

- [ ] Team alignment
  - [ ] All developers understand existing patterns
  - [ ] Integration strategy clear
  - [ ] Testing approach agreed

- [ ] Stakeholder approval
  - [ ] Tech Lead approval
  - [ ] Project Manager approval
  - [ ] Timeline confirmed

**Phase 0 Sign-Off**:
- [ ] Tech Lead sign-off
- [ ] Schedule Phase 1 kickoff meeting

---

## PHASE 1: QUALITY CONTROL & DATA FOUNDATION (Weeks 1-6)

**Goal**: Establish quality control workflows and migrate legacy data  
**Duration**: 6 weeks  
**Features**: FR-002, FR-003, FR-004, FR-008, FR-016  

---

### Week 1: Status Update & Migration Prep

#### FR-008: Order Status Terminology Update (Days 1-5)

**Day 1: Database Migration Planning**
- [ ] Create feature branch
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/phase-1-fr-008-status-update
  ```

- [ ] Review current order status usage
  - [ ] Search codebase for "Ready" status
    ```bash
    grep -r "Ready" src/
    grep -r "'ready'" src/
    grep -r '"ready"' src/
    ```
  - [ ] Document all locations using "Ready" status
  - [ ] Count occurrences to verify completeness

- [ ] Plan database migration
  - [ ] Check migration tool documentation
  - [ ] Plan migration for status column update
  - [ ] Plan rollback migration

- [ ] Create migration file
  ```bash
  # If using Prisma
  npx prisma migrate dev --name rename-ready-to-queued-for-delivery --create-only
  
  # If using SQL migrations
  npm run migration:create rename_ready_status
  ```

**Day 2: Write Migration**
- [ ] Write UP migration
  ```sql
  -- Update order status values
  UPDATE orders 
  SET status = 'queued_for_delivery' 
  WHERE status = 'ready';
  
  -- If using ENUM, handle enum type update
  -- (PostgreSQL example)
  ALTER TYPE order_status_enum RENAME TO order_status_enum_old;
  CREATE TYPE order_status_enum AS ENUM (
    'pending', 'in_progress', 'qc_review', 
    'queued_for_delivery', 'out_for_delivery', 
    'delivered', 'cancelled'
  );
  ALTER TABLE orders 
    ALTER COLUMN status TYPE order_status_enum 
    USING status::text::order_status_enum;
  DROP TYPE order_status_enum_old;
  ```

- [ ] Write DOWN migration (rollback)
  ```sql
  UPDATE orders 
  SET status = 'ready' 
  WHERE status = 'queued_for_delivery';
  
  -- Reverse enum change if applicable
  ```

- [ ] Test migration in development
  ```bash
  npm run migrate:up
  # Verify data changed correctly
  npm run migrate:down
  # Verify rollback works
  npm run migrate:up
  ```

**Day 3: Backend Code Updates**
- [ ] Update status constants/enums
  - [ ] Find status definitions (constants.ts, enums.ts, etc.)
  - [ ] Change 'ready' to 'queued_for_delivery'
  - [ ] Update status display labels

- [ ] Update service layer
  - [ ] Search for status references in services
  - [ ] Update OrderService status transitions
  - [ ] Update any status validation logic

- [ ] Update validation schemas
  - [ ] Update status enums in validators
  - [ ] Ensure all valid statuses include new value

- [ ] Run unit tests
  ```bash
  npm test
  ```
  - [ ] Fix any failing tests
  - [ ] Update test expectations for new status

**Day 4: API & Frontend Updates**
- [ ] Update API responses
  - [ ] Review serializers/transformers
  - [ ] Ensure status returned correctly
  - [ ] Update API documentation

- [ ] Update frontend constants
  - [ ] Find status constants (constants.ts, enums.ts)
  - [ ] Update status values
  - [ ] Update status display labels
  - [ ] Update status color/icon mappings

- [ ] Update components
  - [ ] Update OrderStatus component
  - [ ] Update StatusBadge component
  - [ ] Update any status filters
  - [ ] Update order lists

**Day 5: Testing & Documentation**
- [ ] Write integration tests
  ```typescript
  describe('Order Status', () => {
    it('should show queued_for_delivery instead of ready', async () => {
      const order = await createTestOrder({ status: 'queued_for_delivery' });
      const response = await api.get(`/orders/${order.id}`);
      expect(response.data.status).toBe('queued_for_delivery');
    });
  });
  ```

- [ ] Manual testing
  - [ ] Create order and move through statuses
  - [ ] Verify status displays correctly in UI
  - [ ] Test status filters
  - [ ] Test status transitions

- [ ] Update documentation
  - [ ] Update API documentation
  - [ ] Update status workflow documentation
  - [ ] Add migration notes to CHANGELOG.md

- [ ] Create pull request
  ```bash
  git add .
  git commit -m "feat(orders): rename Ready status to Queued for Delivery"
  git push origin feature/phase-1-fr-008-status-update
  # Create PR in GitHub/GitLab
  ```

- [ ] Code review
  - [ ] Address review comments
  - [ ] Update based on feedback

#### FR-016: Legacy Data Migration (Days 1-5 - Parallel Track)

**Day 1: Data Mapping**
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b feature/phase-1-fr-016-data-migration
  ```

- [ ] Access legacy system database
  - [ ] Get connection credentials
  - [ ] Connect to legacy database
  - [ ] Export schema
  - [ ] Export sample data (1000 records)

- [ ] Create data mapping document
  - [ ] Create `docs/DATA_MIGRATION_MAPPING.md`
  - [ ] Map legacy tables to new tables
  - [ ] Map legacy columns to new columns
  - [ ] Document data transformations needed

- [ ] Identify data quality issues
  - [ ] Run data quality queries on legacy DB
  - [ ] Document missing required fields
  - [ ] Document invalid data formats
  - [ ] Document duplicate records

**Day 2: Validation Rules**
- [ ] Create validation script
  ```typescript
  // scripts/validate-migration-data.ts
  import { z } from 'zod';
  
  export const customerValidator = z.object({
    name: z.string().min(1),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/),
    email: z.string().email().optional(),
    // ... other fields
  });
  
  export const orderValidator = z.object({
    order_number: z.string().min(1),
    customer_id: z.string(),
    total_amount: z.number().positive(),
    // ... other fields
  });
  ```

- [ ] Test validation rules
  - [ ] Run against sample legacy data
  - [ ] Document validation failures
  - [ ] Plan data cleanup strategies

**Day 3: Migration Script Development**
- [ ] Create migration script
  ```typescript
  // scripts/migrate-legacy-data.ts
  
  export class LegacyDataMigration {
    async migrate(): Promise<MigrationReport> {
      // 1. Connect to legacy database
      // 2. Extract customer data with validation
      // 3. Transform data to new schema
      // 4. Insert into new database with transaction
      // 5. Verify record counts
      // 6. Sample verification
      // 7. Generate report
    }
    
    async rollback(): Promise<void> {
      // Restore from backup
    }
  }
  ```

- [ ] Implement customer migration
  - [ ] Extract customers from legacy DB
  - [ ] Validate each record
  - [ ] Transform to new schema
  - [ ] Handle validation failures
  - [ ] Insert into new DB

- [ ] Implement order migration
  - [ ] Extract orders from legacy DB
  - [ ] Link to migrated customers
  - [ ] Validate each record
  - [ ] Transform to new schema
  - [ ] Insert into new DB

**Day 4: Testing in Development**
- [ ] Create test database backup
  ```bash
  pg_dump -U username -d dev_database > dev_backup.sql
  ```

- [ ] Run migration in development
  ```bash
  npm run migrate:legacy
  ```

- [ ] Verify migration results
  - [ ] Check record counts match
  - [ ] Verify data integrity
  - [ ] Sample check 100 random records
  - [ ] Verify relationships intact

- [ ] Test rollback
  ```bash
  npm run migrate:rollback
  # Restore from backup
  psql -U username -d dev_database < dev_backup.sql
  ```

**Day 5: Documentation**
- [ ] Create migration runbook
  - [ ] Step-by-step migration procedure
  - [ ] Rollback procedure
  - [ ] Verification checklist
  - [ ] Troubleshooting guide

- [ ] Document data transformations
  - [ ] List all transformations applied
  - [ ] Document default values used
  - [ ] Document data quality improvements

- [ ] Create pull request
  ```bash
  git add .
  git commit -m "feat(migration): add legacy data migration scripts"
  git push origin feature/phase-1-fr-016-data-migration
  ```

### Week 2: Migration Execution & Redo Items Start

#### FR-016: Legacy Data Migration Execution (Days 1-3)

**Day 1: Staging Migration**
- [ ] Create staging database backup
  ```bash
  pg_dump -U username -d staging_database > staging_backup_$(date +%Y%m%d).sql
  ```

- [ ] Run migration in staging
  ```bash
  NODE_ENV=staging npm run migrate:legacy
  ```

- [ ] Monitor migration progress
  - [ ] Check logs for errors
  - [ ] Monitor database performance
  - [ ] Track record counts

- [ ] Verify staging migration
  - [ ] Run verification script
  - [ ] Sample check 500 records
  - [ ] Verify all relationships
  - [ ] Check data quality metrics

**Day 2: Production Migration Planning**
- [ ] Create production backup
  ```bash
  pg_dump -U username -d production_database > prod_backup_$(date +%Y%m%d).sql
  ```

- [ ] Schedule production migration window
  - [ ] Coordinate with operations team
  - [ ] Plan downtime window (if needed)
  - [ ] Notify stakeholders

- [ ] Final migration checklist
  - [ ] Backup verified and accessible
  - [ ] Migration script tested in staging
  - [ ] Rollback procedure tested
  - [ ] Team members on standby

**Day 3: Production Migration**
- [ ] Execute production migration
  ```bash
  NODE_ENV=production npm run migrate:legacy
  ```

- [ ] Real-time monitoring
  - [ ] Monitor migration logs
  - [ ] Track progress
  - [ ] Watch for errors

- [ ] Post-migration verification
  - [ ] Run verification script
  - [ ] Compare record counts
  - [ ] Sample verification (5% of records)
  - [ ] Test critical workflows

- [ ] Generate migration report
  - [ ] Total records migrated
  - [ ] Validation failures
  - [ ] Data quality improvements
  - [ ] Migration duration

- [ ] Keep legacy system available
  - [ ] Set to read-only mode
  - [ ] Maintain for 90 days
  - [ ] Document access procedure

#### FR-002: Redo Items Policy (Days 3-5)

**Day 3: Database Schema**
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b feature/phase-1-fr-002-redo-items
  ```

- [ ] Review existing orders table
  - [ ] Check current schema
  - [ ] Identify fields to add
  - [ ] Check for existing redo-related fields

- [ ] Create redo_items table migration
  ```bash
  npx prisma migrate dev --name create-redo-items-table --create-only
  ```

- [ ] Write migration
  ```sql
  CREATE TABLE redo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_order_id UUID NOT NULL REFERENCES orders(id),
    redo_order_id UUID REFERENCES orders(id),
    reason_code VARCHAR(50) NOT NULL,
    reason_description TEXT,
    identified_by UUID NOT NULL REFERENCES users(id),
    identified_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  CREATE INDEX idx_redo_items_original_order ON redo_items(original_order_id);
  CREATE INDEX idx_redo_items_status ON redo_items(status);
  CREATE INDEX idx_redo_items_created_at ON redo_items(created_at);
  ```

- [ ] Run migration
  ```bash
  npm run migrate:up
  ```

**Day 4: Backend Service**
- [ ] Review existing OrderService
  - [ ] Understand order creation pattern
  - [ ] Note validation approach
  - [ ] Document transaction usage

- [ ] Create RedoItemService
  ```typescript
  // src/services/redo-item.service.ts
  export class RedoItemService {
    constructor(
      private db: DatabaseClient,
      private orderService: OrderService,
      private notificationService: NotificationService
    ) {}
    
    async createRedoItem(data: CreateRedoItemDto): Promise<RedoItem> {
      // Implementation following existing patterns
    }
    
    async getRedoMetrics(filters: RedoMetricsFilter): Promise<RedoMetrics> {
      // Metrics calculation
    }
  }
  ```

- [ ] Write unit tests
  ```typescript
  describe('RedoItemService', () => {
    describe('createRedoItem', () => {
      it('should create redo item with zero-charge order', async () => {
        // Test implementation
      });
      
      it('should validate original order exists', async () => {
        // Test implementation
      });
      
      it('should set priority to high', async () => {
        // Test implementation
      });
    });
  });
  ```

**Day 5: API Endpoints**
- [ ] Create validation schemas
  ```typescript
  // src/validators/redo-item.validator.ts
  export const createRedoItemSchema = z.object({
    original_order_id: z.string().uuid(),
    reason_code: z.enum([
      'quality_issue',
      'damage',
      'incomplete_service',
      'customer_complaint',
      'other'
    ]),
    reason_description: z.string().optional()
  });
  ```

- [ ] Create controller
  ```typescript
  // src/controllers/redo-item.controller.ts
  export class RedoItemController {
    constructor(private redoItemService: RedoItemService) {}
    
    create = async (req: Request, res: Response, next: NextFunction) => {
      // Implementation
    };
    
    getMetrics = async (req: Request, res: Response, next: NextFunction) => {
      // Implementation
    };
  }
  ```

- [ ] Create routes
  ```typescript
  // src/routes/redo-items.routes.ts
  router.post('/api/redo-items', 
    authenticate,
    authorize('create_redo_item'),
    validate(createRedoItemSchema),
    redoItemController.create
  );
  
  router.get('/api/redo-items/:id', 
    authenticate,
    redoItemController.getById
  );
  
  router.get('/api/redo-items/metrics',
    authenticate,
    authorize('view_metrics'),
    redoItemController.getMetrics
  );
  ```

- [ ] Test API endpoints
  ```bash
  # Using curl or Postman
  POST /api/redo-items
  GET /api/redo-items/:id
  GET /api/redo-items/metrics
  ```

### Week 3: Redo Items Frontend & Defect Notifications

#### FR-002: Redo Items Frontend (Days 1-3)

**Day 1: QC Form Component**
- [ ] Review existing form components
  - [ ] Check OrderForm implementation
  - [ ] Note form library usage
  - [ ] Document validation approach

- [ ] Create RedoItemForm component
  ```typescript
  // src/components/QC/RedoItemForm.tsx
  export const RedoItemForm = ({ orderId, onSuccess }: Props) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(createRedoItemSchema)
    });
    
    const onSubmit = async (data) => {
      // Implementation
    };
    
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    );
  };
  ```

- [ ] Add form validation
  - [ ] Reason code dropdown
  - [ ] Description textarea
  - [ ] Photo upload (if applicable)

- [ ] Test component
  - [ ] Unit test with React Testing Library
  - [ ] Test form submission
  - [ ] Test validation

**Day 2: Dashboard Metrics Widget**
- [ ] Review existing dashboard widgets
  - [ ] Check widget layout
  - [ ] Note chart library used
  - [ ] Document data fetching pattern

- [ ] Create RedoMetricsWidget
  ```typescript
  // src/components/Dashboard/RedoMetricsWidget.tsx
  export const RedoMetricsWidget = () => {
    const { data, isLoading } = useQuery(
      'redo-metrics',
      () => api.get('/redo-items/metrics')
    );
    
    if (isLoading) return <Loading />;
    
    return (
      <Card>
        <Card.Header>
          <Card.Title>Redo Items by Reason</Card.Title>
        </Card.Header>
        <Card.Content>
          <BarChart data={data.by_reason} />
          <div>Total: {data.total_redo_items}</div>
        </Card.Content>
      </Card>
    );
  };
  ```

- [ ] Add to QC Dashboard
  - [ ] Find existing QC Dashboard page
  - [ ] Import and add widget
  - [ ] Test layout and responsiveness

**Day 3: Integration & Testing**
- [ ] Add redo button to OrderDetails
  ```typescript
  // src/components/Orders/OrderDetails.tsx
  const [showRedoForm, setShowRedoForm] = useState(false);
  
  return (
    <>
      <OrderHeader>
        <Button onClick={() => setShowRedoForm(true)}>
          Flag for Redo
        </Button>
      </OrderHeader>
      
      <Modal 
        isOpen={showRedoForm}
        onClose={() => setShowRedoForm(false)}
      >
        <RedoItemForm 
          orderId={orderId}
          onSuccess={() => {
            setShowRedoForm(false);
            refetchOrder();
          }}
        />
      </Modal>
    </>
  );
  ```

- [ ] Integration testing
  - [ ] Test full flow: QC flags item → Redo order created
  - [ ] Verify metrics update
  - [ ] Test permissions

- [ ] Create PR
  ```bash
  git add .
  git commit -m "feat(qc): add redo items management"
  git push origin feature/phase-1-fr-002-redo-items
  ```

#### FR-003: Defect Notification Timelines (Days 4-5)

**Day 4: Database & Backend**
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b feature/phase-1-fr-003-defect-timelines
  ```

- [ ] Create database schema
  ```sql
  CREATE TABLE defect_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    item_id UUID NOT NULL REFERENCES order_items(id),
    defect_type VARCHAR(50) NOT NULL,
    defect_description TEXT,
    identified_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notification_deadline TIMESTAMP NOT NULL,
    customer_notified_at TIMESTAMP,
    is_within_timeline BOOLEAN GENERATED ALWAYS AS 
      (customer_notified_at <= notification_deadline) STORED,
    notified_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  CREATE TABLE defect_notification_timelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(50) NOT NULL UNIQUE,
    notification_window_hours INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  -- Insert default timelines
  INSERT INTO defect_notification_timelines (service_type, notification_window_hours) VALUES
    ('dry_cleaning', 24),
    ('laundry', 24),
    ('alterations', 48),
    ('repairs', 48);
  ```

- [ ] Create DefectNotificationService
  ```typescript
  export class DefectNotificationService {
    async createDefectNotification(data: CreateDefectDto): Promise<DefectNotification> {
      // Get timeline config
      // Calculate deadline
      // Create notification
      // Schedule reminder
    }
    
    async checkPendingDeadlines(): Promise<void> {
      // Find notifications approaching deadline
      // Send alerts to QC team
    }
    
    async notifyCustomer(notificationId: string, userId: string): Promise<void> {
      // Mark as notified
      // Check if within timeline
      // Send customer notification
      // Flag for review if late
    }
  }
  ```

**Day 5: Scheduled Job & Frontend**
- [ ] Create scheduled job
  ```typescript
  // jobs/defect-deadline-checker.ts
  import cron from 'node-cron';
  
  cron.schedule('0 * * * *', async () => {
    const defectService = new DefectNotificationService();
    await defectService.checkPendingDeadlines();
  });
  ```

- [ ] Create DefectNotificationForm component
  ```typescript
  export const DefectNotificationForm = ({ orderItemId }) => {
    // Form implementation
  };
  ```

- [ ] Add to QC workflow
  - [ ] Integrate into QC inspection screen
  - [ ] Add notification indicators
  - [ ] Test deadline alerts

- [ ] Create PR
  ```bash
  git add .
  git commit -m "feat(qc): add defect notification timelines"
  git push origin feature/phase-1-fr-003-defect-timelines
  ```

### Week 4: QC Handover System

#### FR-004: QC to Customer Service Handover (Days 1-5)

**Day 1: Database Schema**
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b feature/phase-1-fr-004-qc-handover
  ```

- [ ] Create handover table
  ```sql
  CREATE TABLE qc_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    handover_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    photos JSONB,
    qc_notes TEXT,
    recommended_action VARCHAR(100),
    customer_communication_template TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    customer_notified_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  CREATE INDEX idx_qc_handovers_status ON qc_handovers(status);
  CREATE INDEX idx_qc_handovers_order ON qc_handovers(order_id);
  CREATE INDEX idx_qc_handovers_created_at ON qc_handovers(created_at);
  ```

- [ ] Run migration
  ```bash
  npm run migrate:up
  ```

**Day 2: Backend Service**
- [ ] Create QCHandoverService
  ```typescript
  export class QCHandoverService {
    constructor(
      private db: DatabaseClient,
      private notificationService: NotificationService
    ) {}
    
    async createHandover(data: CreateHandoverDto): Promise<QCHandover> {
      // Create handover
      // Generate communication template
      // Send real-time notification to customer service
      // Add to CS task queue
    }
    
    async acknowledgeHandover(handoverId: string, userId: string): Promise<void> {
      // Mark acknowledged
      // Update status
    }
    
    async getHandoverMetrics(): Promise<HandoverMetrics> {
      // Calculate metrics
      // Time from QC to customer notification
    }
  }
  ```

- [ ] Implement real-time notifications
  ```typescript
  // If using WebSockets
  export class NotificationService {
    async notifyCustomerService(handover: QCHandover): Promise<void> {
      io.to('customer-service').emit('new-handover', {
        handover_id: handover.id,
        order_id: handover.order_id,
        type: handover.handover_type,
        priority: this.calculatePriority(handover)
      });
    }
  }
  
  // If using Server-Sent Events
  // Implement SSE endpoint for customer service dashboard
  ```

**Day 3: API Endpoints**
- [ ] Create validation schemas
  ```typescript
  export const createHandoverSchema = z.object({
    order_id: z.string().uuid(),
    handover_type: z.enum(['alteration', 'defect', 'exception']),
    description: z.string().min(10),
    photos: z.array(z.string().url()).optional(),
    qc_notes: z.string().optional(),
    recommended_action: z.string().optional()
  });
  ```

- [ ] Create controller and routes
  ```typescript
  router.post('/api/qc-handovers',
    authenticate,
    authorize('create_handover'),
    validate(createHandoverSchema),
    qcHandoverController.create
  );
  
  router.patch('/api/qc-handovers/:id/acknowledge',
    authenticate,
    authorize('acknowledge_handover'),
    qcHandoverController.acknowledge
  );
  
  router.get('/api/qc-handovers/metrics',
    authenticate,
    qcHandoverController.getMetrics
  );
  ```

**Day 4: Frontend Components**
- [ ] Create QCHandoverForm
  ```typescript
  export const QCHandoverForm = ({ orderId }: Props) => {
    const [photos, setPhotos] = useState<string[]>([]);
    
    const handlePhotoUpload = async (files: FileList) => {
      // Upload photos
      // Add URLs to state
    };
    
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Select label="Type" {...register('handover_type')}>
          <option value="alteration">Alteration</option>
          <option value="defect">Defect</option>
          <option value="exception">Exception</option>
        </Select>
        
        <Textarea label="Description" {...register('description')} />
        
        <PhotoUpload onUpload={handlePhotoUpload} />
        
        <Textarea label="QC Notes" {...register('qc_notes')} />
        
        <Button type="submit">Create Handover</Button>
      </form>
    );
  };
  ```

- [ ] Create HandoverQueue component
  ```typescript
  export const HandoverQueue = () => {
    const { data: handovers } = useQuery('pending-handovers');
    
    useEffect(() => {
      // Subscribe to real-time updates
      const socket = io();
      socket.on('new-handover', (handover) => {
        // Update queue
        // Show notification
      });
      
      return () => socket.disconnect();
    }, []);
    
    return (
      <div>
        {handovers.map(handover => (
          <HandoverCard 
            key={handover.id}
            handover={handover}
            onAcknowledge={handleAcknowledge}
          />
        ))}
      </div>
    );
  };
  ```

**Day 5: Integration & Testing**
- [ ] Add to QC Dashboard
  - [ ] Add handover creation button
  - [ ] Show pending handovers

- [ ] Add to Customer Service Dashboard
  - [ ] Show handover queue
  - [ ] Real-time notifications
  - [ ] Acknowledge functionality

- [ ] Integration testing
  - [ ] Test full handover flow
  - [ ] Test real-time notifications
  - [ ] Test acknowledgment
  - [ ] Test metrics

- [ ] Create PR
  ```bash
  git add .
  git commit -m "feat(qc): add customer service handover system"
  git push origin feature/phase-1-fr-004-qc-handover
  ```

### Week 5-6: Phase 1 Testing & Documentation

#### Week 5: Integration Testing

**Day 1-2: End-to-End Testing**
- [ ] Write E2E tests for redo flow
  ```typescript
  test('QC can flag item for redo', async ({ page }) => {
    await page.goto('/orders/123');
    await page.click('button:has-text("Flag for Redo")');
    await page.selectOption('#reason-code', 'quality_issue');
    await page.fill('#description', 'Item not cleaned properly');
    await page.click('button:has-text("Create Redo Item")');
    await expect(page.locator('.success-message')).toBeVisible();
    
    // Verify redo order created
    const redoOrders = await page.locator('.redo-order').count();
    expect(redoOrders).toBe(1);
  });
  ```

- [ ] Write E2E tests for defect notification
- [ ] Write E2E tests for handover flow
- [ ] Write E2E tests for status updates

**Day 3: Performance Testing**
- [ ] Set up performance test environment
  ```bash
  npm install -g artillery
  ```

- [ ] Create load test scenarios
  ```yaml
  # artillery-config.yml
  config:
    target: 'http://localhost:3000'
    phases:
      - duration: 60
        arrivalRate: 10
  scenarios:
    - name: Create redo item
      flow:
        - post:
            url: '/api/redo-items'
            json:
              original_order_id: '{{ orderId }}'
              reason_code: 'quality_issue'
  ```

- [ ] Run performance tests
  ```bash
  artillery run artillery-config.yml
  ```

- [ ] Analyze results
  - [ ] Response times < 500ms (95th percentile)
  - [ ] No errors under load
  - [ ] Database queries optimized

**Day 4-5: Bug Fixes**
- [ ] Review all bug reports from testing
- [ ] Prioritize critical bugs
- [ ] Fix bugs
- [ ] Re-test fixed issues
- [ ] Update tests to prevent regression

#### Week 6: Documentation & UAT

**Day 1-2: Documentation**
- [ ] Update API documentation
  ```yaml
  # openapi.yml additions
  /api/redo-items:
    post:
      summary: Create redo item
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRedoItem'
      responses:
        201:
          description: Redo item created
  ```

- [ ] Update user documentation
  - [ ] QC workflow guide
  - [ ] Redo items process
  - [ ] Defect notification guide
  - [ ] Handover procedures

- [ ] Create training materials
  - [ ] Screen recording: Creating redo items
  - [ ] Screen recording: Defect notifications
  - [ ] Screen recording: QC handover
  - [ ] Quick reference PDF

- [ ] Update CHANGELOG.md
  ```markdown
  ## Phase 1 - Quality Control & Data Foundation
  
  ### Added
  - FR-002: Redo items policy management
  - FR-003: Defect notification timelines
  - FR-004: QC to customer service handover
  - FR-008: Updated order status terminology
  - FR-016: Legacy data migration completed
  
  ### Changed
  - Order status "Ready" renamed to "Queued for Delivery"
  
  ### Database
  - Added tables: redo_items, defect_notifications, qc_handovers
  - Migrated X customers and Y orders from legacy system
  ```

**Day 3-4: User Acceptance Testing**
- [ ] Prepare UAT environment
  - [ ] Deploy to staging
  - [ ] Load test data
  - [ ] Create test user accounts

- [ ] Conduct UAT sessions
  - [ ] QC Team (2 hours)
    - [ ] Test redo items creation
    - [ ] Test defect notifications
    - [ ] Test handover workflow
  
  - [ ] Customer Service Team (1 hour)
    - [ ] Test receiving handovers
    - [ ] Test acknowledgment flow
  
  - [ ] Operations Manager (1 hour)
    - [ ] Review metrics dashboards
    - [ ] Test reporting

- [ ] Collect feedback
  - [ ] Document issues found
  - [ ] Note usability concerns
  - [ ] Gather improvement suggestions

- [ ] Address UAT feedback
  - [ ] Fix critical issues
  - [ ] Plan enhancements for later

**Day 5: Phase 1 Deployment**
- [ ] Pre-deployment checklist
  - [ ] All tests passing
  - [ ] Code reviewed and approved
  - [ ] Documentation complete
  - [ ] UAT signed off
  - [ ] Database backup created
  - [ ] Rollback plan ready

- [ ] Deploy to production
  ```bash
  # Deploy with feature flags disabled
  git checkout main
  git merge develop
  git tag v1.1.0-phase-1
  git push origin main --tags
  
  # Trigger deployment
  npm run deploy:production
  ```

- [ ] Enable features gradually
  ```bash
  # Enable FR-008 (status update) - low risk
  ./enable-feature.sh status-terminology-update
  
  # Wait 1 hour, monitor
  
  # Enable FR-002 (redo items)
  ./enable-feature.sh redo-items
  
  # Continue with remaining features
  ```

- [ ] Post-deployment verification
  - [ ] Smoke test all new features
  - [ ] Verify existing functionality intact
  - [ ] Monitor error logs
  - [ ] Monitor performance metrics

- [ ] Phase 1 completion sign-off
  - [ ] Operations Manager approval
  - [ ] Tech Lead sign-off
  - [ ] Document lessons learned

---

## PHASE 2: MULTI-LOCATION & CUSTOMER DATA (Weeks 7-14)

**Goal**: Optimize multi-location operations and enhance customer data management  
**Duration**: 8 weeks  
**Features**: FR-005, FR-006, FR-007, FR-014, FR-015, FR-017  

---

### Week 7-8: Partial Payments

#### FR-005: Partial & Advance Payment Handling

**Week 7, Day 1-2: Database Schema**
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b feature/phase-2-fr-005-partial-payments
  ```

- [ ] Review existing orders table
  - [ ] Check for payment-related fields
  - [ ] Document current payment tracking

- [ ] Create payments table
  ```sql
  CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    transaction_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    payment_type VARCHAR(20) NOT NULL,
    metadata JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  ALTER TABLE orders ADD COLUMN total_paid DECIMAL(10, 2) DEFAULT 0;
  ALTER TABLE orders ADD COLUMN balance_due DECIMAL(10, 2) GENERATED ALWAYS AS 
    (total_amount - total_paid) STORED;
  ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid';
  
  CREATE INDEX idx_payments_order ON payments(order_id);
  CREATE INDEX idx_payments_created_at ON payments(created_at);
  ```

**Day 3-4: Payment Service**
- [ ] Create PaymentService
  ```typescript
  export class PaymentService {
    async recordPayment(data: CreatePaymentDto): Promise<Payment> {
      return await this.db.transaction(async (tx) => {
        // Create payment
        // Update order totals
        // Generate receipt
        // Send receipt to customer
        // Schedule balance reminder if needed
      });
    }
    
    async getPaymentHistory(orderId: string): Promise<Payment[]> {
      // Return all payments for order
    }
    
    async scheduleBalanceReminder(order: Order): Promise<void> {
      // Schedule reminder based on configuration
    }
  }
  ```

- [ ] Write unit tests
  - [ ] Test payment recording
  - [ ] Test balance calculation
  - [ ] Test payment history
  - [ ] Test reminders

**Day 5: Receipt Service**
- [ ] Create ReceiptService
  ```typescript
  export class ReceiptService {
    async generateReceipt(payment: Payment): Promise<Buffer> {
      // Generate PDF receipt
      // Include payment details
      // Include remaining balance
    }
    
    async sendReceipt(payment: Payment): Promise<void> {
      // Email receipt
      // SMS notification
    }
  }
  ```

- [ ] Test receipt generation
  - [ ] Verify PDF format
  - [ ] Check all required fields
  - [ ] Test email delivery

**Week 7, Day 6 - Week 8, Day 2: Frontend**
- [ ] Create PaymentForm component
  ```typescript
  export const PaymentForm = ({ order, onSuccess }: Props) => {
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState('cash');
    
    const maxPayment = order.balance_due;
    
    return (
      <form onSubmit={handleSubmit}>
        <Input
          label="Amount"
          type="number"
          max={maxPayment}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        
        <Select label="Payment Method" value={method} onChange={setMethod}>
          <option value="cash">Cash</option>
          <option value="mpesa">M-Pesa</option>
          <option value="card">Card</option>
        </Select>
        
        <div className="balance-info">
          <div>Order Total: KES {order.total_amount}</div>
          <div>Already Paid: KES {order.total_paid}</div>
          <div>This Payment: KES {amount}</div>
          <div>Remaining: KES {order.balance_due - amount}</div>
        </div>
        
        <Button type="submit">Record Payment</Button>
      </form>
    );
  };
  ```

- [ ] Create PaymentHistory component
  ```typescript
  export const PaymentHistory = ({ orderId }: Props) => {
    const { data: payments } = useQuery(
      ['payment-history', orderId],
      () => api.get(`/payments/order/${orderId}`)
    );
    
    return (
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>{formatDate(payment.created_at)}</td>
              <td>KES {payment.amount}</td>
              <td>{payment.payment_method}</td>
              <td>
                <Button onClick={() => downloadReceipt(payment.id)}>
                  Download
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  ```

**Week 8, Day 3-5: Testing & Integration**
- [ ] Integration tests
  - [ ] Test full payment flow
  - [ ] Test multiple partial payments
  - [ ] Test balance calculation
  - [ ] Test receipt generation

- [ ] Add to checkout flow
  - [ ] Integrate PaymentForm
  - [ ] Show payment history
  - [ ] Display balance prominently

- [ ] Add to OrderDetails
  - [ ] Show payment status
  - [ ] Show payment history
  - [ ] Allow additional payments

- [ ] Create PR and merge

### Week 9-11: Multi-Location Routing

#### FR-006 & FR-007: Routing and Sorting Timelines

**Week 9, Day 1-3: Database Schema**
- [ ] Create feature branch
  ```bash
  git checkout develop
  git checkout -b feature/phase-2-fr-006-007-routing
  ```

- [ ] Extend orders table
  ```sql
  ALTER TABLE orders ADD COLUMN source_branch_id UUID REFERENCES branches(id);
  ALTER TABLE orders ADD COLUMN processing_branch_id UUID REFERENCES branches(id);
  ALTER TABLE orders ADD COLUMN assigned_workstation_id UUID REFERENCES workstations(id);
  ALTER TABLE orders ADD COLUMN routing_status VARCHAR(20) DEFAULT 'pending';
  ALTER TABLE orders ADD COLUMN arrived_at_branch TIMESTAMP;
  ALTER TABLE orders ADD COLUMN sorting_completed_at TIMESTAMP;
  ALTER TABLE orders ADD COLUMN earliest_delivery_time TIMESTAMP;
  ```

- [ ] Create manifest tables
  ```sql
  CREATE TABLE transfer_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_number VARCHAR(50) UNIQUE NOT NULL,
    from_branch_id UUID NOT NULL REFERENCES branches(id),
    to_branch_id UUID NOT NULL REFERENCES branches(id),
    transfer_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    received_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  CREATE TABLE manifest_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id UUID NOT NULL REFERENCES transfer_manifests(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    barcode VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  ```

- [ ] Add branch configuration
  ```sql
  ALTER TABLE branches ADD COLUMN sorting_window_hours INTEGER DEFAULT 6;
  ```

**Week 9, Day 4-6: Routing Service**
- [ ] Create OrderRoutingService
  ```typescript
  export class OrderRoutingService {
    async routeOrder(orderId: string): Promise<void> {
      const order = await this.getOrder(orderId);
      
      // Determine processing branch
      const processingBranch = await this.getProcessingBranch(
        order.source_branch_id
      );
      
      // Check workstation capacity
      const workstation = await this.workstationService.findAvailable(
        processingBranch.id,
        order.service_type
      );
      
      // Update routing
      await this.updateOrderRouting(orderId, {
        processing_branch_id: processingBranch.id,
        assigned_workstation_id: workstation.id,
        routing_status: 'assigned'
      });
      
      // Create manifest if different branch
      if (order.source_branch_id !== processingBranch.id) {
        await this.manifestService.addToManifest(order);
      }
      
      // Notify workstation
      await this.notificationService.notifyWorkstation(workstation, order);
    }
  }
  ```

**Week 10: Manifest Service & Sorting Timeline**
- [ ] Create ManifestService
  ```typescript
  export class ManifestService {
    async createManifest(data: CreateManifestDto): Promise<TransferManifest> {
      // Create manifest
      // Generate manifest number
      // Add items
      // Generate barcode labels
    }
    
    async receiveManifest(manifestId: string, userId: string): Promise<void> {
      // Mark received
      // Update order statuses
      // Trigger sorting timeline
    }
  }
  ```

- [ ] Create SortingTimelineService
  ```typescript
  export class SortingTimelineService {
    async recordBranchArrival(orderId: string): Promise<void> {
      const order = await this.getOrder(orderId);
      const branch = await this.getBranch(order.destination_branch_id);
      
      const sortingWindow = branch.sorting_window_hours || 6;
      const earliestDelivery = addHours(new Date(), sortingWindow);
      
      await this.updateOrder(orderId, {
        arrived_at_branch: new Date(),
        earliest_delivery_time: earliestDelivery,
        routing_status: 'arrived'
      });
      
      // Notify relevant staff
      await this.notifyBranchStaff(branch, order, earliestDelivery);
    }
    
    async validateDeliverySchedule(
      orderId: string, 
      scheduledTime: Date
    ): Promise<boolean> {
      const order = await this.getOrder(orderId);
      
      if (scheduledTime < order.earliest_delivery_time) {
        throw new Error(
          `Cannot schedule before ${order.earliest_delivery_time}`
        );
      }
      
      return true;
    }
  }
  ```

**Week 11: Frontend & Testing**
- [ ] Create routing components
- [ ] Create manifest generation UI
- [ ] Create sorting timeline display
- [ ] Integration testing
- [ ] Create PR and merge

### Week 12-13: Customer Data Enhancement

#### FR-014: Foreign Phone Support

**Day 1-3: Implementation**
- [ ] Create feature branch
- [ ] Update database schema
  ```sql
  ALTER TABLE customers ALTER COLUMN phone TYPE VARCHAR(20);
  ALTER TABLE customers ADD COLUMN country_code VARCHAR(5) DEFAULT '+254';
  ALTER TABLE customers ADD COLUMN phone_validated BOOLEAN DEFAULT false;
  ```

- [ ] Install phone validation library
  ```bash
  npm install libphonenumber-js
  ```

- [ ] Create PhoneValidator utility
- [ ] Update CustomerService
- [ ] Update SMSService for international routing
- [ ] Create InternationalPhoneInput component
- [ ] Test phone validation
- [ ] Create PR

#### FR-015: Load-Based Pricing

**Day 4-6: Implementation**
- [ ] Create feature branch
- [ ] Create pricing rules table
- [ ] Update order_items and orders tables
- [ ] Extend PricingService
- [ ] Create CapacityPlanningService
- [ ] Update OrderForm with weight input
- [ ] Test pricing calculations
- [ ] Create PR

### Week 14: Customer Segmentation

#### FR-017: Customer Segmentation

**Day 1-4: Implementation**
- [ ] Create feature branch
- [ ] Create database tables
  ```sql
  ALTER TABLE customers ADD COLUMN segment VARCHAR(20) DEFAULT 'regular';
  ALTER TABLE customers ADD COLUMN vip_qualified_at TIMESTAMP;
  
  CREATE TABLE customer_statistics (
    customer_id UUID PRIMARY KEY REFERENCES customers(id),
    total_orders INTEGER DEFAULT 0,
    total_spend DECIMAL(12, 2) DEFAULT 0,
    last_12_months_orders INTEGER DEFAULT 0,
    last_12_months_spend DECIMAL(12, 2) DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  CREATE TABLE corporate_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(200) NOT NULL,
    agreement_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true
  );
  ```

- [ ] Create CustomerSegmentationService
- [ ] Create scheduled job for evaluation
- [ ] Update PricingService to use segments
- [ ] Test segmentation logic
- [ ] Create PR

**Day 5: Phase 2 Testing & Documentation**
- [ ] Integration testing
- [ ] UAT preparation
- [ ] Documentation updates
- [ ] Deploy to production
- [ ] Phase 2 sign-off

---

## PHASE 3: PAYMENTS & AUTOMATION (Weeks 15-24)

**Goal**: Implement advanced payment processing and automation  
**Duration**: 10 weeks  
**Features**: FR-001, FR-009, FR-012, FR-013  

Due to length constraints, I'll provide the structure:

### Week 15-17: M-Pesa Integration
- [ ] Obtain M-Pesa credentials
- [ ] Set up sandbox environment
- [ ] Implement MPesaService
- [ ] Implement STK Push
- [ ] Implement callbacks
- [ ] Test in sandbox
- [ ] Security audit

### Week 18-19: Mobile Driver App
- [ ] Set up React Native/Flutter project
- [ ] Implement payment screens
- [ ] Integrate with M-Pesa service
- [ ] Implement PDQ integration
- [ ] Implement offline mode
- [ ] Test on devices

### Week 20-22: Quotation System
- [ ] Implement QuotationService
- [ ] PDF generation
- [ ] Email/SMS delivery
- [ ] Approval workflow
- [ ] Frontend implementation
- [ ] Testing

### Week 23-24: Reports & Free Delivery
- [ ] Payment report filtering
- [ ] Export functionality
- [ ] Free delivery automation
- [ ] Configuration management
- [ ] Testing
- [ ] Phase 3 deployment

---

## PHASE 4: LOYALTY & INTEGRATION (Weeks 25-30)

**Goal**: Launch loyalty program and complete integrations  
**Duration**: 6 weeks  
**Features**: FR-010, FR-011  

### Week 25-28: Loyalty Points System
- [ ] Database schema
- [ ] LoyaltyPointsService
- [ ] Points earning logic
- [ ] Milestone system
- [ ] Points redemption
- [ ] Expiration handling
- [ ] Frontend components
- [ ] Testing

### Week 29-30: Final Integration
- [ ] Home Cleaning SSO
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Final UAT
- [ ] Production deployment
- [ ] Project completion sign-off

---

## Post-Implementation Tasks

### Training Delivery
- [ ] QC team training (2 hours)
- [ ] Front desk training (2 hours)
- [ ] Driver training (2 hours)
- [ ] Manager training (2 hours)
- [ ] Create training video library

### Documentation Finalization
- [ ] Complete API documentation
- [ ] User manuals for all roles
- [ ] Administrator guide
- [ ] Troubleshooting guide
- [ ] System architecture documentation

### Handover
- [ ] Knowledge transfer sessions
- [ ] Support procedures documented
- [ ] Escalation paths defined
- [ ] Monitoring dashboards configured

---

## Continuous Tasks (Throughout All Phases)

### Daily
- [ ] Standup meeting (15 min)
- [ ] Code review PRs
- [ ] Monitor production errors
- [ ] Update task status

### Weekly
- [ ] Sprint planning
- [ ] Progress review
- [ ] Update documentation
- [ ] Stakeholder status email

### Per Phase
- [ ] Phase kickoff meeting
- [ ] Phase review meeting
- [ ] UAT sessions
- [ ] Phase deployment
- [ ] Phase sign-off

---

## Task Tracking Tips

1. **Update Daily**: Mark tasks complete as you finish them
2. **Note Blockers**: Add comments when blocked
3. **Link Issues**: Reference GitHub issues/Jira tickets
4. **Track Time**: Note actual vs estimated time
5. **Document Decisions**: Add notes for important decisions
6. **Celebrate Wins**: Acknowledge completed phases!

---

**Last Updated**: January 16, 2026  
**Maintained By**: Tech Lead  
**Review Schedule**: Weekly during implementation
