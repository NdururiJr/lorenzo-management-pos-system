# Lorenzo Dry Cleaners System Upgrade - Tasks Breakdown

## Document Information

**Project:** Lorenzo Dry Cleaners Management System v2.0  
**Total Duration:** 20 weeks  
**Total Tasks:** 150+ tasks  
**Last Updated:** February 3, 2025  

---

## How to Use This Document

### Task Format

Each task follows this structure:

```
**[TASK-ID] Task Name**
- **Phase:** Phase number and name
- **Sprint:** Sprint number within phase
- **Owner:** Role responsible
- **Duration:** Estimated hours
- **Priority:** Critical/High/Medium/Low
- **Dependencies:** Task IDs that must be completed first
- **Status:** Not Started/In Progress/Blocked/Testing/Complete
- **Tags:** #backend #frontend #database #testing #deployment

**Description:** Brief description of the task

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Subtasks:**
- [ ] Subtask 1
- [ ] Subtask 2
```

### Priority Levels
- **Critical:** Blocking other tasks, must complete first
- **High:** Important for phase completion
- **Medium:** Should complete but can be deferred
- **Low:** Nice to have, can defer to future

### Status Values
- **Not Started:** Task not yet begun
- **In Progress:** Currently being worked on
- **Blocked:** Waiting on dependency or external factor
- **Testing:** Development complete, in testing
- **Complete:** Done and verified

---

## Task Summary by Phase

| Phase | Tasks | Est. Hours | Priority Distribution |
|-------|-------|------------|----------------------|
| Week 0 | 15 | 80 | Critical: 8, High: 5, Medium: 2 |
| Phase 1 (Weeks 1-3) | 20 | 360 | Critical: 10, High: 8, Medium: 2 |
| Phase 2 (Weeks 4-6) | 18 | 360 | Critical: 8, High: 8, Medium: 2 |
| Phase 3 (Weeks 7-9) | 21 | 360 | Critical: 6, High: 12, Medium: 3 |
| Phase 4 (Weeks 10-13) | 28 | 480 | Critical: 8, High: 15, Medium: 5 |
| Phase 5 (Weeks 14-16) | 22 | 360 | Critical: 6, High: 12, Medium: 4 |
| Phase 6 (Weeks 17-18) | 15 | 240 | Critical: 10, High: 5, Medium: 0 |
| Phase 7 (Weeks 19-20) | 18 | 160 | Critical: 8, High: 8, Medium: 2 |
| **Total** | **157** | **2,400** | **Critical: 64, High: 73, Medium: 20** |

---

# WEEK 0: PRE-DEVELOPMENT PHASE

## System Audit & Documentation

**[TASK-001] Document Current Tech Stack**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Lead Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #documentation #audit

**Description:** Complete the "Current System Architecture Documentation" section in claude.md with all details about existing system.

**Acceptance Criteria:**
- [ ] Frontend framework and version documented
- [ ] Backend framework and version documented
- [ ] Database system and version documented
- [ ] All third-party integrations listed
- [ ] Current API endpoints documented
- [ ] User roles and permissions mapped

**Subtasks:**
- [ ] Interview current system users/admins
- [ ] Export current database schema
- [ ] List all frontend components/pages
- [ ] Document backend API structure
- [ ] Identify all integrations (SMS, payment, printer)
- [ ] Update claude.md with findings

---

**[TASK-002] Export and Document Database Schema**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Database Developer
- **Duration:** 2 hours
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #database #documentation

**Description:** Export current database schema, document all tables, relationships, and constraints.

**Acceptance Criteria:**
- [ ] Complete schema export saved
- [ ] ER diagram created
- [ ] All tables documented
- [ ] Foreign keys documented
- [ ] Indexes documented
- [ ] Constraints documented

**Subtasks:**
- [ ] Run database schema export command
- [ ] Create visual ER diagram
- [ ] Document each table's purpose
- [ ] Identify all relationships
- [ ] List all indexes
- [ ] Save documentation in /docs folder

---

**[TASK-003] Map Current Feature Inventory**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Product Manager/Lead Developer
- **Duration:** 3 hours
- **Priority:** High
- **Dependencies:** TASK-001
- **Status:** Not Started
- **Tags:** #documentation #analysis

**Description:** Document all existing features, workflows, and user journeys in current system.

**Acceptance Criteria:**
- [ ] All existing workflows documented
- [ ] User journeys mapped
- [ ] Known bugs/limitations listed
- [ ] Integration points identified
- [ ] Feature inventory complete

**Subtasks:**
- [ ] Document order creation workflow
- [ ] Document customer management features
- [ ] Document payment processing flow
- [ ] Document current reporting capabilities
- [ ] Document user management features
- [ ] List all known bugs or limitations

---

## Environment Setup

**[TASK-004] Set Up Version Control**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Lead Developer
- **Duration:** 2 hours
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #devops #setup

**Description:** Create/configure Git repository with proper branching strategy and team access.

**Acceptance Criteria:**
- [ ] Git repository created (or confirmed)
- [ ] Branch protection rules set
- [ ] Development branch created
- [ ] Feature branch naming convention documented
- [ ] .gitignore configured
- [ ] All team members have access
- [ ] Git workflow documented in README

**Subtasks:**
- [ ] Create repository (GitHub/GitLab/Bitbucket)
- [ ] Set up branch protection for main/master
- [ ] Create development branch
- [ ] Document branch naming: feature/TASK-XXX-description
- [ ] Configure .gitignore for tech stack
- [ ] Add all team members
- [ ] Create README with Git workflow

---

**[TASK-005] Set Up Staging Environment**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** DevOps/Lead Developer
- **Duration:** 6 hours
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #devops #infrastructure #setup

**Description:** Provision and configure staging environment that mirrors production.

**Acceptance Criteria:**
- [ ] Staging server provisioned
- [ ] Database cloned from production
- [ ] Web server configured
- [ ] SSL certificate installed
- [ ] Application deployed and running
- [ ] All features verified working
- [ ] Environment variables configured
- [ ] Backup schedule configured

**Subtasks:**
- [ ] Provision staging server (or create container)
- [ ] Clone production database to staging
- [ ] Configure nginx/Apache on staging
- [ ] Install SSL certificate for staging
- [ ] Deploy current production code
- [ ] Test all existing features
- [ ] Configure staging-specific env vars
- [ ] Set up automated backups
- [ ] Document staging access credentials

---

**[TASK-006] Set Up Local Development Environments**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** All Developers
- **Duration:** 4 hours per developer
- **Priority:** Critical
- **Dependencies:** TASK-004, TASK-005
- **Status:** Not Started
- **Tags:** #development #setup

**Description:** Each developer sets up their local development environment with database and dependencies.

**Acceptance Criteria:**
- [ ] Repository cloned locally
- [ ] Dependencies installed
- [ ] Local database running
- [ ] Staging database imported locally
- [ ] Application runs locally
- [ ] Environment variables configured
- [ ] IDE/editor configured
- [ ] Development workflow tested

**Subtasks:**
- [ ] Clone Git repository
- [ ] Install project dependencies (npm/pip/composer)
- [ ] Set up local database server
- [ ] Import staging database dump
- [ ] Configure local .env file
- [ ] Start application locally
- [ ] Install IDE extensions (linter, formatter)
- [ ] Test local development workflow

---

**[TASK-007] Configure Project Management Tool**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Project Manager
- **Duration:** 3 hours
- **Priority:** High
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #management #setup

**Description:** Set up project board with all tasks, sprints, and team access.

**Acceptance Criteria:**
- [ ] Project workspace created
- [ ] Kanban board configured
- [ ] All tasks from tasks.md imported
- [ ] Sprints/iterations configured
- [ ] Labels/tags set up
- [ ] Team members invited
- [ ] Automation configured

**Subtasks:**
- [ ] Choose tool (Jira/Trello/Asana/GitHub Projects)
- [ ] Create project workspace
- [ ] Set up columns: Backlog, To Do, In Progress, Testing, Done
- [ ] Import tasks from this document
- [ ] Create labels: backend, frontend, database, testing, etc.
- [ ] Configure sprint structure (2-week sprints)
- [ ] Set up automation (if applicable)
- [ ] Invite all team members

---

**[TASK-008] Set Up Communication Channels**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Project Manager
- **Duration:** 1 hour
- **Priority:** High
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #communication #setup

**Description:** Create communication structure for team collaboration.

**Acceptance Criteria:**
- [ ] Chat platform configured
- [ ] Channels created
- [ ] Meeting schedule established
- [ ] Code review process defined
- [ ] Emergency contact protocol set

**Subtasks:**
- [ ] Create Slack/Discord/WhatsApp group
- [ ] Create channels: #general, #dev, #bugs, #deployments
- [ ] Schedule daily standup (9 AM)
- [ ] Schedule weekly review (Monday 2 PM)
- [ ] Document code review process
- [ ] Create emergency contact list
- [ ] Set up shared documentation folder

---

**[TASK-009] Create Documentation Repository**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Technical Writer/Lead Developer
- **Duration:** 2 hours
- **Priority:** Medium
- **Dependencies:** TASK-004
- **Status:** Not Started
- **Tags:** #documentation #setup

**Description:** Organize centralized documentation location in repository.

**Acceptance Criteria:**
- [ ] /docs folder structure created
- [ ] All project documents added
- [ ] Templates created
- [ ] Wiki configured
- [ ] Documentation guidelines written

**Subtasks:**
- [ ] Create /docs folder in repository
- [ ] Add PRD to /docs
- [ ] Add claude.md to /docs
- [ ] Add planning.md to /docs
- [ ] Add tasks.md to /docs
- [ ] Create API documentation template
- [ ] Create migration script template
- [ ] Create code review checklist template
- [ ] Set up wiki (GitHub/GitLab)

---

## Stakeholder Alignment

**[TASK-010] Prepare Kickoff Meeting Materials**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Project Manager
- **Duration:** 2 hours
- **Priority:** High
- **Dependencies:** TASK-001, TASK-003
- **Status:** Not Started
- **Tags:** #management #stakeholder

**Description:** Create presentation and materials for project kickoff meeting.

**Acceptance Criteria:**
- [ ] Presentation slides created
- [ ] Scope summary prepared
- [ ] Timeline visualization ready
- [ ] Budget overview prepared
- [ ] Roles document created
- [ ] Q&A prepared
- [ ] Invites sent

**Subtasks:**
- [ ] Create kickoff presentation (Google Slides/PowerPoint)
- [ ] Summarize project scope and objectives
- [ ] Create timeline Gantt chart
- [ ] Prepare budget overview
- [ ] Create roles and responsibilities document
- [ ] Anticipate questions and prepare answers
- [ ] Send calendar invites to all stakeholders

---

**[TASK-011] Conduct Project Kickoff Meeting**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Project Manager
- **Duration:** 2 hours
- **Priority:** Critical
- **Dependencies:** TASK-010
- **Status:** Not Started
- **Tags:** #management #stakeholder

**Description:** Hold kickoff meeting with all stakeholders and team members.

**Acceptance Criteria:**
- [ ] Meeting conducted
- [ ] All stakeholders attended
- [ ] Scope confirmed
- [ ] Timeline agreed
- [ ] Roles clarified
- [ ] Q&A addressed
- [ ] Meeting notes documented

**Subtasks:**
- [ ] Present project overview (15 min)
- [ ] Present detailed scope (20 min)
- [ ] Review timeline and milestones (15 min)
- [ ] Clarify roles and responsibilities (10 min)
- [ ] Explain communication plan (10 min)
- [ ] Discuss risk management (10 min)
- [ ] Q&A session (30 min)
- [ ] Review next steps (10 min)
- [ ] Document meeting notes and action items

---

**[TASK-012] Obtain Formal Approvals**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Project Manager
- **Duration:** Varies
- **Priority:** Critical
- **Dependencies:** TASK-011
- **Status:** Not Started
- **Tags:** #management #stakeholder

**Description:** Get formal sign-off on scope, budget, and timeline.

**Acceptance Criteria:**
- [ ] Scope approved by management
- [ ] Budget approved
- [ ] Timeline approved
- [ ] Resources confirmed
- [ ] Change process established
- [ ] Approvals documented

**Subtasks:**
- [ ] Get management sign-off on scope
- [ ] Get budget approval from finance
- [ ] Get timeline approval
- [ ] Confirm resource allocation
- [ ] Establish change request process
- [ ] Document all approvals in project files

---

## Technical Preparation

**[TASK-013] Finalize Database Migration Strategy**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Database Developer/Lead Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** TASK-002
- **Status:** Not Started
- **Tags:** #database #planning

**Description:** Plan detailed database migration approach with scripts and rollback procedures.

**Acceptance Criteria:**
- [ ] Migration plan documented
- [ ] New columns identified
- [ ] New tables designed
- [ ] Data migration approach planned
- [ ] Rollback procedures documented
- [ ] First migration script created

**Subtasks:**
- [ ] Review PRD database requirements
- [ ] Plan column additions for existing tables
- [ ] Design all new table structures
- [ ] Plan data migration for existing records
- [ ] Create /database/migrations/v2.0 directory
- [ ] Write first migration script (roles table)
- [ ] Test migration on local database
- [ ] Document rollback procedure for each migration
- [ ] Create migration execution checklist

---

**[TASK-014] Plan API Extension Strategy**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** Backend Lead
- **Duration:** 3 hours
- **Priority:** High
- **Dependencies:** TASK-001
- **Status:** Not Started
- **Tags:** #backend #planning

**Description:** Plan how to extend existing APIs while maintaining backward compatibility.

**Acceptance Criteria:**
- [ ] Existing endpoints documented
- [ ] New endpoints listed
- [ ] Modification approach planned
- [ ] Versioning strategy decided
- [ ] Backward compatibility ensured
- [ ] API documentation template created

**Subtasks:**
- [ ] List all existing API endpoints
- [ ] List all new endpoints needed (from PRD)
- [ ] Plan modifications to existing endpoints
- [ ] Design API versioning strategy (if needed)
- [ ] Document backward compatibility approach
- [ ] Document API naming conventions
- [ ] Create API documentation template
- [ ] Plan authentication/authorization extensions

---

**[TASK-015] Define Testing Strategy**
- **Phase:** Week 0 - Pre-Development
- **Sprint:** Setup Sprint
- **Owner:** QA Lead/Lead Developer
- **Duration:** 2 hours
- **Priority:** High
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #testing #planning

**Description:** Establish comprehensive testing strategy for the project.

**Acceptance Criteria:**
- [ ] Unit testing requirements defined
- [ ] Integration testing approach planned
- [ ] E2E testing strategy documented
- [ ] Testing frameworks selected
- [ ] Code coverage targets set
- [ ] Test data strategy planned

**Subtasks:**
- [ ] Define unit testing requirements (>80% coverage)
- [ ] Define integration testing approach
- [ ] Define E2E testing strategy
- [ ] Select testing frameworks (Jest/Mocha/Pytest)
- [ ] Create test case template
- [ ] Plan test data generation approach
- [ ] Set code coverage targets
- [ ] Plan continuous testing in CI/CD

---

# PHASE 1: FOUNDATION & CRITICAL ENHANCEMENTS (WEEKS 1-3)

## Week 1: Database Migrations & Order Enhancements

### Sprint 1.1: Database Foundation

**[TASK-101] Create Initial Migration Scripts**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.1 - Database Foundation
- **Owner:** Database Developer
- **Duration:** 6 hours
- **Priority:** Critical
- **Dependencies:** TASK-013
- **Status:** Not Started
- **Tags:** #database #migration

**Description:** Create SQL migration scripts for extending existing tables and adding new ones.

**Acceptance Criteria:**
- [ ] All migration files created
- [ ] Each migration has rollback script
- [ ] Scripts tested on local database
- [ ] Existing data preserved
- [ ] All new columns have defaults

**Subtasks:**
- [ ] Create 001_add_roles_table.sql
- [ ] Create 002_extend_users_table.sql
- [ ] Create 003_extend_orders_table.sql
- [ ] Create 004_extend_order_items_table.sql
- [ ] Create 005_extend_customers_table.sql
- [ ] Create 006_extend_branches_table.sql
- [ ] Create rollback script for each migration
- [ ] Test each script on local database copy
- [ ] Verify existing data integrity after migrations

---

**[TASK-102] Execute Migrations on Staging**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.1 - Database Foundation
- **Owner:** Database Developer
- **Duration:** 2 hours
- **Priority:** Critical
- **Dependencies:** TASK-101
- **Status:** Not Started
- **Tags:** #database #migration #deployment

**Description:** Run migration scripts on staging database and verify success.

**Acceptance Criteria:**
- [ ] Staging database backed up
- [ ] Migrations executed successfully
- [ ] All tables verified
- [ ] Rollback tested
- [ ] Application still functional
- [ ] Issues documented

**Subtasks:**
- [ ] Create full backup of staging database
- [ ] Run migration scripts in sequence
- [ ] Verify all tables updated correctly
- [ ] Test rollback on database copy
- [ ] Verify existing application features work
- [ ] Document any issues encountered
- [ ] Update migration log

---

**[TASK-103] Update Database Models/ORM**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.1 - Database Foundation
- **Owner:** Backend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** TASK-102
- **Status:** Not Started
- **Tags:** #backend #database

**Description:** Update application models to reflect new database schema.

**Acceptance Criteria:**
- [ ] All models updated
- [ ] New fields accessible
- [ ] Existing queries work
- [ ] Seeders updated
- [ ] Unit tests pass

**Subtasks:**
- [ ] Update User model (shift_start_time, shift_end_time, last_login)
- [ ] Update Order model (checked_by, is_rewash, original_order_id, etc.)
- [ ] Update OrderItem model (brand, category, tag_number)
- [ ] Update Customer model (customer_type, loyalty_points, last_order_date)
- [ ] Update Branch model (branch_type, manager_id)
- [ ] Update/create database seeders
- [ ] Run unit tests
- [ ] Test model changes locally

---

### Sprint 1.2: Order Creation Enhancement

**[TASK-104] Implement Brand Field**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.2 - Order Enhancement
- **Owner:** Full-Stack Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-103
- **Status:** Not Started
- **Tags:** #frontend #backend #feature

**Description:** Add brand field to order form with "No Brand" checkbox functionality.

**Acceptance Criteria:**
- [ ] Brand input visible on order form
- [ ] "No Brand" checkbox works
- [ ] Validation prevents empty submission
- [ ] Backend stores brand correctly
- [ ] Existing orders show "No Brand"
- [ ] API updated

**Frontend Subtasks:**
- [ ] Add brand text input to order form
- [ ] Add "No Brand" checkbox
- [ ] Implement checkbox logic (disable input when checked)
- [ ] Add validation (brand required unless "No Brand")
- [ ] Update form submission logic
- [ ] Add error messaging
- [ ] Style to match existing design

**Backend Subtasks:**
- [ ] Update POST /api/orders endpoint
- [ ] Add brand field validation
- [ ] Handle "No Brand" value storage
- [ ] Update order response to include brand
- [ ] Update GET /api/orders endpoint
- [ ] Migrate existing orders to "No Brand" default

---

**[TASK-105] Implement Checked By Field**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.2 - Order Enhancement
- **Owner:** Full-Stack Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-104
- **Status:** Not Started
- **Tags:** #frontend #backend #feature

**Description:** Add mandatory "Checked By" field to order form for inspector assignment.

**Acceptance Criteria:**
- [ ] Dropdown populated with inspectors
- [ ] Field mandatory
- [ ] Validation enforced
- [ ] API validates inspector exists
- [ ] Order cannot be created without inspector

**Frontend Subtasks:**
- [ ] Add "Checked By" dropdown to order form
- [ ] Create API call to fetch inspector users
- [ ] Populate dropdown with inspectors
- [ ] Make field mandatory (required attribute)
- [ ] Add validation messaging
- [ ] Update form submission

**Backend Subtasks:**
- [ ] Create GET /api/users/inspectors endpoint
- [ ] Filter users by Inspector role
- [ ] Update POST /api/orders validation
- [ ] Verify checked_by user exists and is inspector
- [ ] Update order response with inspector details
- [ ] Add error handling for invalid inspector

---

**[TASK-106] Implement Category Field (Adult/Children)**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.2 - Order Enhancement
- **Owner:** Full-Stack Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** TASK-105
- **Status:** Not Started
- **Tags:** #frontend #backend #feature

**Description:** Add Adult/Children category selection for each order item.

**Acceptance Criteria:**
- [ ] Category selector on each garment
- [ ] Mandatory selection
- [ ] Validation works
- [ ] Backend stores category
- [ ] Existing items have default

**Frontend Subtasks:**
- [ ] Add Adult/Children radio buttons/dropdown per item
- [ ] Make field mandatory for each item
- [ ] Add validation
- [ ] Update item submission in form
- [ ] Display category in order summary

**Backend Subtasks:**
- [ ] Update order_items creation endpoint
- [ ] Add category validation (must be 'Adult' or 'Children')
- [ ] Update order item response
- [ ] Set default category for existing items
- [ ] Ensure backward compatibility

---

### Sprint 1.3: Service Type Implementation

**[TASK-107] Add Service Type Selector**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.3 - Service Type
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-106
- **Status:** Not Started
- **Tags:** #frontend #feature

**Description:** Add Normal/Express service type selector to order form.

**Acceptance Criteria:**
- [ ] Service type selector visible
- [ ] Clear visual distinction
- [ ] Defaults to "Normal"
- [ ] Selection saved with order
- [ ] Displays in order summary

**Subtasks:**
- [ ] Add Normal/Express toggle or radio buttons
- [ ] Determine: order-level or per-item (clarify with client)
- [ ] Add visual badges/colors for distinction
- [ ] Set default to "Normal" service
- [ ] Update form state management
- [ ] Add service type to order summary display
- [ ] Style according to design system

---

**[TASK-108] Implement Express Pricing Logic**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.3 - Service Type
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** TASK-107
- **Status:** Not Started
- **Tags:** #backend #feature #business-logic

**Description:** Implement automatic 1.5× pricing for express service orders.

**Acceptance Criteria:**
- [ ] Express orders priced at 1.5× normal
- [ ] Calculation accurate
- [ ] Multiplier configurable
- [ ] Pricing breakdown available
- [ ] Unit tests pass

**Subtasks:**
- [ ] Create pricing calculation function
- [ ] Implement 1.5× multiplier for express
- [ ] Fetch multiplier from system_settings table
- [ ] Update order total calculation in API
- [ ] Handle mixed service types (if per-item)
- [ ] Create pricing breakdown in response
- [ ] Write unit tests for pricing logic
- [ ] Update existing pricing endpoints

---

**[TASK-109] Update Price Display UI**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.3 - Service Type
- **Owner:** Frontend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** TASK-108
- **Status:** Not Started
- **Tags:** #frontend #ui

**Description:** Display price breakdown and update prices in real-time based on service type.

**Acceptance Criteria:**
- [ ] Prices update on service type change
- [ ] Breakdown shows normal vs express
- [ ] Total displays service type
- [ ] Tooltip explains pricing
- [ ] Order history shows service type

**Subtasks:**
- [ ] Show price breakdown (Normal: KES X, Express: KES X)
- [ ] Implement real-time price updates on toggle
- [ ] Display total with service type indicator
- [ ] Add tooltip explaining express pricing
- [ ] Update order summary section
- [ ] Update order history view to show service type
- [ ] Test price calculations in UI

---

### Sprint 1.4: Receipt Enhancements

**[TASK-110] Redesign Receipt Template**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.4 - Receipt Enhancement
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** None (can parallel)
- **Status:** Not Started
- **Tags:** #frontend #ui #receipt

**Description:** Create new receipt template with all required elements from PRD.

**Acceptance Criteria:**
- [ ] Receipt includes all elements (per PRD)
- [ ] Prints correctly on thermal printer
- [ ] "CLEANED AT OWNER'S RISK" prominent
- [ ] Professional appearance
- [ ] QR code placement reserved

**Subtasks:**
- [ ] Design new receipt layout structure
- [ ] Add company logo placement
- [ ] Create garment details table
- [ ] Add "CLEANED AT OWNER'S RISK" notice (bold, centered)
- [ ] Reserve position for QR code
- [ ] Add T&C link area
- [ ] Make template responsive for 80mm thermal printer
- [ ] Test print output on actual printer
- [ ] Get design approval from stakeholders

---

**[TASK-111] Implement QR Code Generation**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.4 - Receipt Enhancement
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-110
- **Status:** Not Started
- **Tags:** #backend #feature

**Description:** Generate QR codes for receipts that link to order tracking.

**Acceptance Criteria:**
- [ ] QR code generated for each receipt
- [ ] Scans correctly on mobile
- [ ] Links to order tracking URL
- [ ] QR visible on printed receipt
- [ ] QR data stored in database

**Subtasks:**
- [ ] Install QR code generation library (qrcode or similar)
- [ ] Create QR code generation function
- [ ] Generate QR with order tracking URL
- [ ] Store QR code data in receipts table
- [ ] Create endpoint to serve QR code image
- [ ] Add QR code to receipt API response
- [ ] Test QR code scanning with mobile devices
- [ ] Verify QR codes print clearly

---

**[TASK-112] Create Terms & Conditions Page**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.4 - Receipt Enhancement
- **Owner:** Frontend Developer + Content Writer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #frontend #content

**Description:** Create Terms & Conditions page that QR code can link to.

**Acceptance Criteria:**
- [ ] T&C page created
- [ ] Content legally reviewed
- [ ] Mobile-friendly
- [ ] URL accessible
- [ ] Link works from receipt

**Subtasks:**
- [ ] Create T&C page/modal component
- [ ] Write/compile T&C content
- [ ] Get legal review of content (if required)
- [ ] Create route/URL for T&C (/terms-and-conditions)
- [ ] Make page mobile-friendly and responsive
- [ ] Add link to receipt template
- [ ] Test QR code linking to T&C page
- [ ] Add print functionality to T&C page

---

**[TASK-113] Integrate Receipt Printing**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.4 - Receipt Enhancement
- **Owner:** Backend + Frontend Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** TASK-110, TASK-111
- **Status:** Not Started
- **Tags:** #backend #frontend #integration #printing

**Description:** Update printing system to use new receipt template with QR codes.

**Acceptance Criteria:**
- [ ] Receipt prints with all new elements
- [ ] QR code scannable on print
- [ ] Reprint works
- [ ] Print failures handled
- [ ] Receipt stored in database

**Subtasks:**
- [ ] Update existing print function/API
- [ ] Integrate new receipt template
- [ ] Add QR code to print output
- [ ] Test thermal printer compatibility
- [ ] Handle print failures gracefully
- [ ] Add reprint functionality
- [ ] Store receipt PDF in database
- [ ] Test on actual thermal printer hardware
- [ ] Add print queue if multiple orders

---

### Sprint 1.5: Integration & Testing

**[TASK-114] End-to-End Order Flow Testing**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.5 - Integration Testing
- **Owner:** QA + All Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** TASK-104 through TASK-113
- **Status:** Not Started
- **Tags:** #testing #integration

**Description:** Test complete order creation flow with all new features.

**Acceptance Criteria:**
- [ ] All test scenarios pass
- [ ] No regression bugs
- [ ] Receipt prints correctly
- [ ] QR codes scannable
- [ ] Performance acceptable

**Test Scenarios:**
- [ ] Create order with brand name
- [ ] Create order with "No Brand" checked
- [ ] Create order with checked_by inspector
- [ ] Attempt order without checked_by (should fail)
- [ ] Create Normal service order
- [ ] Create Express service order
- [ ] Verify express pricing (1.5× normal)
- [ ] Print receipt with new template
- [ ] Scan QR code from receipt
- [ ] Verify T&C link works
- [ ] Test on mobile devices
- [ ] Test reprint functionality
- [ ] Verify all existing features still work

---

**[TASK-115] Database Performance Testing**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.5 - Integration Testing
- **Owner:** Database Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** TASK-102
- **Status:** Not Started
- **Tags:** #testing #performance #database

**Description:** Test database performance with new columns and ensure no degradation.

**Acceptance Criteria:**
- [ ] Order creation <500ms
- [ ] Order list loads <1s
- [ ] No performance degradation
- [ ] Indexes optimized
- [ ] Slow queries identified

**Subtasks:**
- [ ] Test query performance with new columns
- [ ] Add indexes where needed
- [ ] Test order creation performance (benchmark)
- [ ] Test order listing performance
- [ ] Profile slow queries using EXPLAIN
- [ ] Optimize identified slow queries
- [ ] Document performance metrics
- [ ] Compare against baseline (pre-migration)

---

**[TASK-116] Phase 1 Bug Fixes**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.5 - Integration Testing
- **Owner:** All Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** TASK-114, TASK-115
- **Status:** Not Started
- **Tags:** #bugfix #refinement

**Description:** Fix all bugs found during Phase 1 testing.

**Acceptance Criteria:**
- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed
- [ ] UI/UX feedback addressed
- [ ] Code reviewed
- [ ] Documentation updated

**Subtasks:**
- [ ] Triage all reported bugs
- [ ] Fix all critical bugs
- [ ] Fix all high-priority bugs
- [ ] Address UI/UX feedback
- [ ] Improve error messages
- [ ] Code cleanup and refactoring
- [ ] Update documentation
- [ ] Conduct code review

---

### Sprint 1.6: Staging Deployment

**[TASK-117] Deploy Phase 1 to Staging**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.6 - Staging Deployment
- **Owner:** DevOps + Lead Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** TASK-116
- **Status:** Not Started
- **Tags:** #deployment #staging

**Description:** Deploy all Phase 1 features to staging environment.

**Acceptance Criteria:**
- [ ] All features on staging
- [ ] No deployment errors
- [ ] Existing features work
- [ ] Smoke tests pass
- [ ] Ready for UAT

**Subtasks:**
- [ ] Merge all feature branches to development
- [ ] Run full test suite
- [ ] Deploy to staging environment
- [ ] Run database migrations on staging (already done in TASK-102)
- [ ] Smoke test all new features
- [ ] Verify existing features still work
- [ ] Check error logs
- [ ] Notify stakeholders staging is ready

---

**[TASK-118] Conduct Phase 1 UAT**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.6 - Staging Deployment
- **Owner:** Product Manager + Key Users
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-117
- **Status:** Not Started
- **Tags:** #testing #uat

**Description:** User acceptance testing with actual staff members.

**Acceptance Criteria:**
- [ ] Key users trained
- [ ] Feedback collected
- [ ] Critical issues addressed
- [ ] User sign-off obtained

**Subtasks:**
- [ ] Prepare UAT test scenarios
- [ ] Invite POS attendants to test
- [ ] Invite inspectors to test
- [ ] Walk through order creation features
- [ ] Walk through receipt printing
- [ ] Collect user feedback
- [ ] Document all issues
- [ ] Prioritize feedback
- [ ] Address critical UAT findings
- [ ] Get user sign-off

---

**[TASK-119] Phase 1 Documentation**
- **Phase:** Phase 1 - Foundation
- **Sprint:** 1.6 - Staging Deployment
- **Owner:** Technical Writer/Developer
- **Duration:** 4 hours
- **Priority:** Medium
- **Dependencies:** TASK-117
- **Status:** Not Started
- **Tags:** #documentation

**Description:** Update all documentation to reflect Phase 1 changes.

**Acceptance Criteria:**
- [ ] API docs updated
- [ ] User manual updated
- [ ] Change log created
- [ ] Database docs updated
- [ ] Release notes ready

**Subtasks:**
- [ ] Document new API endpoints
- [ ] Document modified endpoints
- [ ] Update user manual (order creation section)
- [ ] Create Phase 1 change log
- [ ] Update database schema documentation
- [ ] Update system architecture docs
- [ ] Create Phase 1 release notes
- [ ] Review and publish documentation

---

# PHASE 2: BUSINESS AUTOMATION (WEEKS 4-6)

## Week 4: Delivery Classification System

**[TASK-201] Create Deliveries Table**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.1 - Delivery Backend
- **Owner:** Database Developer
- **Duration:** 3 hours
- **Priority:** Critical
- **Dependencies:** Phase 1 Complete
- **Status:** Not Started
- **Tags:** #database #migration

**Description:** Create deliveries table with migration scripts.

**Acceptance Criteria:**
- [ ] Migration script created
- [ ] Deliveries table created
- [ ] Indexes added
- [ ] Model created
- [ ] Migration tested

**Subtasks:**
- [ ] Create migration 007_create_deliveries_table.sql
- [ ] Add indexes for delivery_status and delivery_date
- [ ] Create Delivery model in application
- [ ] Test migration on local database
- [ ] Create rollback script
- [ ] Run migration on staging

---

**[TASK-202] Implement Delivery Classification Algorithm**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.1 - Delivery Backend
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** TASK-201
- **Status:** Not Started
- **Tags:** #backend #business-logic

**Description:** Create auto-classification logic for Small (Motorcycle) vs Bulk (Van) deliveries.

**Acceptance Criteria:**
- [ ] Classification algorithm works
- [ ] Rules configurable
- [ ] Edge cases handled
- [ ] Unit tests pass

**Subtasks:**
- [ ] Create classifyDelivery() function
- [ ] Implement rules: Small (≤5 garments OR ≤10kg OR ≤KES 5000)
- [ ] Implement rules: Bulk (>5 garments OR >10kg OR >KES 5000)
- [ ] Make rules configurable in system_settings
- [ ] Add default classification rules to settings
- [ ] Create unit tests for all scenarios
- [ ] Test edge cases (exactly 5 garments, etc.)
- [ ] Document algorithm logic

---

**[TASK-203] Create Delivery API Endpoints**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.1 - Delivery Backend
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-202
- **Status:** Not Started
- **Tags:** #backend #api

**Description:** Build API endpoints for delivery management.

**Acceptance Criteria:**
- [ ] All endpoints functional
- [ ] Authorization enforced
- [ ] Validation working
- [ ] Error handling complete

**Endpoints to Create:**
- [ ] POST /api/deliveries/classify
- [ ] PUT /api/deliveries/:id/override
- [ ] GET /api/deliveries/pending
- [ ] PUT /api/deliveries/:id/status
- [ ] GET /api/deliveries/:id

**Subtasks:**
- [ ] Create classify endpoint with auto-classification
- [ ] Create override endpoint (manager only)
- [ ] Create pending deliveries endpoint
- [ ] Create status update endpoint
- [ ] Create delivery details endpoint
- [ ] Add authorization middleware
- [ ] Add input validation
- [ ] Write API tests

---

**[TASK-204] Build Delivery Type Display UI**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.2 - Delivery Frontend
- **Owner:** Frontend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** TASK-203
- **Status:** Not Started
- **Tags:** #frontend #ui

**Description:** Display delivery type on orders with visual indicators.

**Acceptance Criteria:**
- [ ] Delivery type visible
- [ ] Icons/badges display
- [ ] Filter works
- [ ] Clear distinction

**Subtasks:**
- [ ] Add delivery type badge to order summary
- [ ] Show classification on order creation
- [ ] Add visual indicators (Motorcycle/Van icons)
- [ ] Update order list view to show delivery type
- [ ] Add delivery type filter to order list
- [ ] Style badges consistently

---

**[TASK-205] Create Manual Override Interface**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.2 - Delivery Frontend
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** TASK-204
- **Status:** Not Started
- **Tags:** #frontend #ui

**Description:** Allow managers to manually override delivery classification.

**Acceptance Criteria:**
- [ ] Override modal works
- [ ] Manager authorization required
- [ ] Reason captured
- [ ] Audit logged
- [ ] UI updates

**Subtasks:**
- [ ] Create override modal/dialog
- [ ] Require manager role check
- [ ] Show auto-classification details
- [ ] Allow manual selection override
- [ ] Add override reason text field
- [ ] Log override in audit trail
- [ ] Update UI immediately after override
- [ ] Show override indicator on order

---

**[TASK-206] Build Delivery Dashboard**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.2 - Delivery Frontend
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** TASK-205
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Description:** Create delivery tracking and management dashboard.

**Acceptance Criteria:**
- [ ] Dashboard displays deliveries
- [ ] Filters work
- [ ] Status updates
- [ ] Statistics accurate

**Subtasks:**
- [ ] Create delivery tracking page
- [ ] Display pending deliveries list
- [ ] Show Small vs Bulk delivery counts
- [ ] Add status filters (Pending, In Transit, Delivered)
- [ ] Create delivery details modal
- [ ] Add status update functionality
- [ ] Show classification statistics (pie chart)
- [ ] Add date range filter

---

## Week 5: Rewash System

**[TASK-207] Implement Rewash Logic**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.3 - Rewash Backend
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Phase 1 Complete
- **Status:** Not Started
- **Tags:** #backend #business-logic

**Description:** Create rewash request validation and order creation logic.

**Acceptance Criteria:**
- [ ] 24-hour window enforced
- [ ] Linked to original order
- [ ] Tagged as "REWASH"
- [ ] Statistics tracked

**Subtasks:**
- [ ] Create rewash request validation (24-hour check)
- [ ] Check delivery date vs current date
- [ ] Create linked order with "-R" suffix
- [ ] Set is_rewash flag to true
- [ ] Link to original_order_id
- [ ] Add rewash_reason field
- [ ] Update original order status
- [ ] Create rewash statistics query
- [ ] Write unit tests

---

**[TASK-208] Create Rewash API Endpoints**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.3 - Rewash Backend
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-207
- **Status:** Not Started
- **Tags:** #backend #api

**Endpoints to Create:**
- [ ] POST /api/orders/rewash
- [ ] GET /api/orders/:id/rewash-eligibility
- [ ] GET /api/reports/rewash
- [ ] GET /api/staff/:id/rewash-rate

**Subtasks:**
- [ ] Create rewash request endpoint
- [ ] Create eligibility check endpoint
- [ ] Create rewash statistics report endpoint
- [ ] Create staff rewash metrics endpoint
- [ ] Add validation and error handling
- [ ] Write API tests

---

**[TASK-209] Build Rewash Request UI**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.4 - Rewash Frontend
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-208
- **Status:** Not Started
- **Tags:** #frontend #ui

**Description:** Create rewash request interface in order details.

**Acceptance Criteria:**
- [ ] Button shows when eligible
- [ ] Can select garments
- [ ] Reason required
- [ ] Creates new order

**Subtasks:**
- [ ] Add "Rewash" button to order details page
- [ ] Show button only if within 24-hour window
- [ ] Create rewash request modal
- [ ] Display original order details
- [ ] Allow garment selection (which items to rewash)
- [ ] Add reason dropdown/textarea
- [ ] Add customer complaint field
- [ ] Submit and create rewash order
- [ ] Show confirmation message

---

**[TASK-210] Create Rewash Tracking Interface**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.4 - Rewash Frontend
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** TASK-209
- **Status:** Not Started
- **Tags:** #frontend #reporting

**Description:** Display rewash orders and statistics.

**Acceptance Criteria:**
- [ ] Rewash orders marked
- [ ] Link visible
- [ ] Reports accurate
- [ ] Filters work

**Subtasks:**
- [ ] Add "REWASH" badge to order list
- [ ] Link rewash order to original order (bidirectional)
- [ ] Show rewash history on original order
- [ ] Create rewash report page
- [ ] Show staff rewash rate metrics
- [ ] Add filters for rewash orders
- [ ] Display rewash statistics dashboard

---

## Week 6: Automated Reminder System

**[TASK-211] Set Up Job Scheduler Infrastructure**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.5 - Reminder Backend
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #backend #infrastructure

**Description:** Install and configure job scheduler for automated reminders.

**Acceptance Criteria:**
- [ ] Job scheduler installed
- [ ] Queue configured
- [ ] Can schedule jobs
- [ ] Jobs execute correctly
- [ ] Monitoring set up

**Subtasks:**
- [ ] Create migration 008_create_reminders_table.sql
- [ ] Create Reminder model
- [ ] Install job scheduler (Bull/Agenda/node-cron)
- [ ] Set up job queue
- [ ] Configure Redis (if using Bull)
- [ ] Create reminder job templates
- [ ] Test job scheduling locally
- [ ] Set up job monitoring

---

**[TASK-212] Implement Reminder Scheduling Logic**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.5 - Reminder Backend
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** TASK-211
- **Status:** Not Started
- **Tags:** #backend #business-logic #sms

**Description:** Create reminder scheduling system with SMS integration.

**Acceptance Criteria:**
- [ ] Reminders scheduled automatically
- [ ] SMS sent on schedule
- [ ] Failures logged
- [ ] Templates render correctly

**Subtasks:**
- [ ] Create reminder scheduler function
- [ ] Calculate reminder dates (7, 14, 30 days after delivery)
- [ ] Schedule reminders when order delivered
- [ ] Create monthly reminder loop (after 30 days)
- [ ] Create 90-day disposal check
- [ ] Integrate with SMS API (Africa's Talking)
- [ ] Create SMS templates for each type
- [ ] Handle SMS send failures (retry logic)
- [ ] Log all sent reminders in database
- [ ] Test with test phone numbers

**SMS Templates:**
```
7-day: "Hi {name}, order #{orderNo} ready! Collect at {branch}. Lorenzo Dry Cleaners"
14-day: "Reminder: Order #{orderNo} awaiting collection. Contact: {phone}"
30-day: "FINAL NOTICE: Order #{orderNo} must be collected soon. Risk of disposal."
Monthly: "Order #{orderNo} still awaiting collection at {branch}."
90-day (GM): "Order #{orderNo} ({customer}) eligible for disposal. Approve via dashboard."
```

---

**[TASK-213] Implement Disposal Workflow**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.5 - Reminder Backend
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-212
- **Status:** Not Started
- **Tags:** #backend #business-logic

**Description:** Create 90-day disposal eligibility and GM approval workflow.

**Acceptance Criteria:**
- [ ] Orders marked at 90 days
- [ ] GM notified
- [ ] Approval required
- [ ] Actions logged

**Subtasks:**
- [ ] Mark orders "Eligible for Disposal" at 90 days
- [ ] Create GM notification (email/SMS/in-app)
- [ ] Create disposal approval endpoint
- [ ] Update order status on approval
- [ ] Prevent accidental disposal (require confirmation)
- [ ] Log all disposal actions in audit trail
- [ ] Send customer final notice before disposal
- [ ] Update inventory if items disposed

---

**[TASK-214] Build Reminder Management Dashboard**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.6 - Reminder Frontend
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** TASK-213
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Description:** Create reminder dashboard for viewing and managing reminders.

**Acceptance Criteria:**
- [ ] All reminders visible
- [ ] Manual send works
- [ ] Disposal approvals easy
- [ ] Status updates

**Subtasks:**
- [ ] Create reminder management page
- [ ] Show scheduled reminders
- [ ] Display sent reminders
- [ ] Show failed reminders with retry option
- [ ] Add manual send button (for testing/emergency)
- [ ] Show disposal eligible orders
- [ ] Create GM approval interface for disposal
- [ ] Real-time status updates

---

**[TASK-215] Create Reminder Settings Interface**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.6 - Reminder Frontend
- **Owner:** Frontend Developer
- **Duration:** 4 hours
- **Priority:** Low
- **Dependencies:** TASK-214
- **Status:** Not Started
- **Tags:** #frontend #settings

**Description:** Allow configuration of reminder intervals and templates.

**Acceptance Criteria:**
- [ ] Settings configurable
- [ ] Changes saved
- [ ] Templates editable
- [ ] Can disable reminders

**Subtasks:**
- [ ] Create reminder settings page (admin only)
- [ ] Configure reminder intervals (7, 14, 30 days)
- [ ] Enable/disable specific reminder types
- [ ] Edit SMS templates
- [ ] Test configuration changes
- [ ] Save to system_settings table

---

**[TASK-216] Phase 2 Integration Testing**
- **Phase:** Phase 2 - Business Automation
- **Sprint:** 2.6 - Testing
- **Owner:** QA + All Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All Phase 2 tasks
- **Status:** Not Started
- **Tags:** #testing #integration

**Test Scenarios:**
- [ ] Delivery classification accuracy
- [ ] Manual override workflow
- [ ] Rewash request within 24 hours
- [ ] Rewash request after 24 hours (should fail)
- [ ] Reminder scheduling on order delivery
- [ ] SMS sending (test numbers)
- [ ] 90-day disposal workflow
- [ ] GM approval process

**Subtasks:**
- [ ] Test delivery auto-classification
- [ ] Test manager override
- [ ] Test rewash eligibility checks
- [ ] Test reminder creation
- [ ] Send test SMS reminders
- [ ] Test disposal eligibility marking
- [ ] Test GM approval workflow
- [ ] Document all test results

---

# PHASE 3: INVENTORY & VOUCHERS (WEEKS 7-9)

## Week 7: Inventory Module Foundation

**[TASK-301] Create Inventory Database Tables**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.1 - Inventory Backend
- **Owner:** Database Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** Phase 2 Complete
- **Status:** Not Started
- **Tags:** #database #migration

**Subtasks:**
- [ ] Create migration 009_create_inventory_table.sql
- [ ] Create migration 010_create_inventory_transactions_table.sql
- [ ] Add performance indexes
- [ ] Create Inventory model
- [ ] Create InventoryTransaction model
- [ ] Test migrations on staging

---

**[TASK-302] Implement Inventory Core Logic**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.1 - Inventory Backend
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** TASK-301
- **Status:** Not Started
- **Tags:** #backend #business-logic

**Subtasks:**
- [ ] Create stockIn() function
- [ ] Create stockOut() function
- [ ] Create interBranchTransfer() function
- [ ] Implement stock level calculations
- [ ] Create low stock alert logic
- [ ] Validate all stock operations
- [ ] Prevent negative stock
- [ ] Create audit trail for operations

---

**[TASK-303] Create Inventory API Endpoints**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.1 - Inventory Backend
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-302
- **Status:** Not Started
- **Tags:** #backend #api

**Endpoints to Create:**
- [ ] GET /api/inventory/branch/:id
- [ ] POST /api/inventory/stock-in
- [ ] POST /api/inventory/stock-out
- [ ] POST /api/inventory/transfer
- [ ] GET /api/inventory/alerts
- [ ] POST /api/inventory/adjust
- [ ] GET /api/inventory/transactions
- [ ] GET /api/inventory/item/:id

---

**[TASK-304] Build Inventory Dashboard UI**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.2 - Inventory Frontend
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** TASK-303
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Subtasks:**
- [ ] Create inventory overview page
- [ ] Show current stock levels per item
- [ ] Display low stock alerts (highlighted)
- [ ] Add category filters
- [ ] Show total stock value
- [ ] Add search functionality
- [ ] Create item details view
- [ ] Show transaction history per item

---

**[TASK-305] Create Stock In/Out Forms**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.2 - Inventory Frontend
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-304
- **Status:** Not Started
- **Tags:** #frontend #forms

**Subtasks:**
- [ ] Create stock in form
- [ ] Create stock out form
- [ ] Add item selection dropdown
- [ ] Add quantity input with validation
- [ ] Add reason/notes field
- [ ] Add reference number field
- [ ] Validate quantities (prevent negative)
- [ ] Show confirmation dialog
- [ ] Update dashboard after transaction

---

## Week 8: Inventory Reconciliation & Vouchers

**[TASK-306] Implement Reconciliation Backend**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.3 - Reconciliation
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-303
- **Status:** Not Started
- **Tags:** #backend #inventory

**Subtasks:**
- [ ] Create physical count entry endpoint
- [ ] Create reconciliation comparison function
- [ ] Calculate variances (system vs physical)
- [ ] Generate variance report
- [ ] Create stock adjustment workflow
- [ ] Require approval for large variances
- [ ] Log all reconciliation actions

---

**[TASK-307] Build Reconciliation UI**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.3 - Reconciliation
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-306
- **Status:** Not Started
- **Tags:** #frontend #inventory

**Subtasks:**
- [ ] Create reconciliation page
- [ ] Show system stock vs physical count side-by-side
- [ ] Highlight variances in red/yellow
- [ ] Allow count entry per item
- [ ] Calculate variance automatically
- [ ] Submit for approval workflow
- [ ] Show approval status
- [ ] Display variance report with charts

---

**[TASK-308] Create Voucher Database & Backend**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.4 - Voucher System
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #backend #database #voucher

**Subtasks:**
- [ ] Create migration 011_create_vouchers_table.sql
- [ ] Create Voucher model
- [ ] Implement voucher code generation (VCH-YYYYMMDD-XXXXX)
- [ ] Create QR code for vouchers
- [ ] Create voucher validation logic
- [ ] Implement single-use enforcement
- [ ] Create expiry date checking
- [ ] Build GM approval workflow

---

**[TASK-309] Create Voucher API Endpoints**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.4 - Voucher System
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-308
- **Status:** Not Started
- **Tags:** #backend #api #voucher

**Endpoints to Create:**
- [ ] POST /api/vouchers/create
- [ ] PUT /api/vouchers/:id/approve
- [ ] POST /api/vouchers/validate
- [ ] POST /api/vouchers/:id/redeem
- [ ] GET /api/vouchers/pending-approval
- [ ] GET /api/vouchers/:code

---

**[TASK-310] Build Voucher Management UI**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.4 - Voucher System
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** TASK-309
- **Status:** Not Started
- **Tags:** #frontend #voucher

**Subtasks:**
- [ ] Create voucher creation form
- [ ] Add discount type selection (Percentage/Fixed)
- [ ] Add discount value input
- [ ] Add expiry date picker
- [ ] Generate and display QR code
- [ ] Display unique voucher code
- [ ] Create GM approval interface
- [ ] Create voucher validation at POS
- [ ] Apply discount during order creation
- [ ] Mark voucher as used after redemption

---

## Week 9: Delivery Notes & Integration

**[TASK-311] Create Delivery Notes System Backend**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.5 - Delivery Notes
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #backend #database

**Subtasks:**
- [ ] Create migration 012_create_delivery_notes_table.sql
- [ ] Create DeliveryNote model
- [ ] Implement note number generation (TDN-/TRN-)
- [ ] Create tailor note generation logic
- [ ] Create inter-store transfer logic
- [ ] Add status tracking
- [ ] Create return tracking

---

**[TASK-312] Create Delivery Notes API**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.5 - Delivery Notes
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** TASK-311
- **Status:** Not Started
- **Tags:** #backend #api

**Endpoints to Create:**
- [ ] POST /api/delivery-notes/tailor
- [ ] POST /api/delivery-notes/transfer
- [ ] PUT /api/delivery-notes/:id/status
- [ ] GET /api/delivery-notes/pending
- [ ] GET /api/delivery-notes/:id/print
- [ ] PUT /api/delivery-notes/:id/receive

---

**[TASK-313] Build Delivery Notes UI**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.5 - Delivery Notes
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** Medium
- **Dependencies:** TASK-312
- **Status:** Not Started
- **Tags:** #frontend #ui

**Subtasks:**
- [ ] Create tailor delivery note form
- [ ] Create inter-store transfer form
- [ ] Select orders for transfer
- [ ] Add expected return date
- [ ] Add authorization signature
- [ ] Create note tracking page
- [ ] Show note status
- [ ] Add receive/return functionality
- [ ] Generate printable delivery note

---

**[TASK-314] Create Inventory Reports**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.6 - Reports & Testing
- **Owner:** Backend + Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** All inventory complete
- **Status:** Not Started
- **Tags:** #reporting #fullstack

**Reports to Create:**
- [ ] Stock Valuation Report
- [ ] Usage Report
- [ ] Shrinkage Report
- [ ] Low Stock Report
- [ ] Transaction History Report

**Subtasks:**
- [ ] Create report generation endpoints
- [ ] Build report SQL queries
- [ ] Design report layouts (frontend)
- [ ] Add export to PDF
- [ ] Add export to Excel
- [ ] Create report filters (date range, branch)

---

**[TASK-315] Create Voucher Reports**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.6 - Reports & Testing
- **Owner:** Backend + Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** Voucher system complete
- **Status:** Not Started
- **Tags:** #reporting #fullstack

**Reports to Create:**
- [ ] Vouchers Issued Report
- [ ] Vouchers Redeemed Report
- [ ] Voucher Usage Report
- [ ] Discount Impact Report

---

**[TASK-316] Phase 3 Integration Testing**
- **Phase:** Phase 3 - Inventory & Vouchers
- **Sprint:** 3.6 - Testing
- **Owner:** QA + All Developers
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** All Phase 3 tasks
- **Status:** Not Started
- **Tags:** #testing #integration

**Test Scenarios:**
- [ ] Complete inventory workflow (stock in → use → alert)
- [ ] Inter-branch transfer
- [ ] Inventory reconciliation with variance
- [ ] Voucher creation and GM approval
- [ ] Voucher redemption at POS
- [ ] Expired voucher rejection
- [ ] Already-used voucher rejection
- [ ] Tailor delivery note workflow
- [ ] Inter-store transfer workflow
- [ ] All report generation
- [ ] Report exports (PDF/Excel)

---

# PHASE 4: ROLE-BASED DASHBOARDS (WEEKS 10-13)

## Week 10: General Manager Dashboard

**[TASK-401] Create Targets Database & Backend**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.1 - GM Dashboard Foundation
- **Owner:** Database + Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Phase 3 Complete
- **Status:** Not Started
- **Tags:** #database #backend

**Subtasks:**
- [ ] Create migration 013_create_targets_table.sql
- [ ] Create migration 014_create_staff_performance_table.sql
- [ ] Create Targets model
- [ ] Create StaffPerformance model
- [ ] Implement target setting function
- [ ] Support daily/weekly/monthly targets
- [ ] Calculate target achievement
- [ ] Create progress tracking

---

**[TASK-402] Create Targets API Endpoints**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.1 - GM Dashboard Foundation
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-401
- **Status:** Not Started
- **Tags:** #backend #api

**Endpoints to Create:**
- [ ] POST /api/gm/targets
- [ ] GET /api/gm/targets
- [ ] PUT /api/gm/targets/:id
- [ ] GET /api/gm/targets/achievement
- [ ] GET /api/gm/targets/alerts

---

**[TASK-403] Implement Staff Performance Tracking**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.2 - Staff Performance
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** TASK-402
- **Status:** Not Started
- **Tags:** #backend #business-logic

**Subtasks:**
- [ ] Create performance calculation function
- [ ] Track orders booked per staff
- [ ] Track rewash rate per staff
- [ ] Track complaints per staff
- [ ] Track discounts issued per staff
- [ ] Calculate performance score
- [ ] Generate performance reports
- [ ] Create comparative analytics

**Performance Formula:**
```
score = (ordersBooked × 10) - (rewashRate × 5) - (complaints × 15) - (discountsIssued × 2)
```

---

**[TASK-404] Create Staff Performance API**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.2 - Staff Performance
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-403
- **Status:** Not Started
- **Tags:** #backend #api

**Endpoints to Create:**
- [ ] GET /api/gm/staff-performance
- [ ] GET /api/gm/staff-performance/:id
- [ ] POST /api/gm/staff-performance/evaluate
- [ ] GET /api/gm/staff-performance/rankings
- [ ] GET /api/gm/staff-performance/trends

---

## Week 11: GM Dashboard UI & Audit Logs

**[TASK-405] Build GM Dashboard Layout**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.3 - GM Dashboard UI
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-404
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Dashboard Sections:**
- [ ] Overview cards (revenue, orders, approvals)
- [ ] Targets section with progress bars
- [ ] Staff performance table
- [ ] Charts (revenue trend, staff comparison)
- [ ] Approval queue

---

**[TASK-406] Create Staff Appraisal Interface**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.3 - GM Dashboard UI
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-405
- **Status:** Not Started
- **Tags:** #frontend #ui

**Subtasks:**
- [ ] Create staff appraisal modal
- [ ] Show all performance metrics
- [ ] Display order history
- [ ] Show rewash incidents
- [ ] List complaints
- [ ] Display discount history
- [ ] Add notes/comments section
- [ ] Rating interface
- [ ] Save evaluation

---

**[TASK-407] Enhance Audit Logs System**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.4 - Audit Logs
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Audit logs table exists
- **Status:** Not Started
- **Tags:** #backend #audit

**Subtasks:**
- [ ] Log all order edits
- [ ] Log all voucher approvals
- [ ] Log all cash adjustments
- [ ] Log inventory changes
- [ ] Log system setting changes
- [ ] Log user permission changes
- [ ] Create audit search/filter function

---

**[TASK-408] Build Audit Logs Viewer**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.4 - Audit Logs
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-407
- **Status:** Not Started
- **Tags:** #frontend #ui

**Subtasks:**
- [ ] Create audit logs page
- [ ] Display logs in table
- [ ] Add filters (date, user, action type)
- [ ] Add search functionality
- [ ] Show before/after values
- [ ] Highlight critical actions
- [ ] Add export functionality
- [ ] Implement pagination

---

## Week 12: Finance Manager & Auditor Dashboards

**[TASK-409] Create Cash Out System Backend**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.5 - Finance Manager
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #backend #database

**Subtasks:**
- [ ] Create migration 015_create_cash_out_transactions_table.sql
- [ ] Create CashOutTransaction model
- [ ] Implement cash out request creation
- [ ] Create GM approval workflow
- [ ] Track approval status
- [ ] Log all transactions
- [ ] Support all cash out types

**Cash Out Types:** Uncollected Garments, Discounts, Compensation, Order Cancellation

---

**[TASK-410] Create Cash Out API Endpoints**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.5 - Finance Manager
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** TASK-409
- **Status:** Not Started
- **Tags:** #backend #api

**Endpoints to Create:**
- [ ] POST /api/finance/cash-out/request
- [ ] PUT /api/finance/cash-out/:id/approve
- [ ] PUT /api/finance/cash-out/:id/reject
- [ ] GET /api/finance/cash-out/pending
- [ ] GET /api/finance/cash-out/history
- [ ] GET /api/finance/dashboard

---

**[TASK-411] Build Finance Manager Dashboard**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.5 - Finance Manager
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** TASK-410
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Dashboard Sections:**
- [ ] Overview (cash position, outstanding, pending approvals)
- [ ] Cash out request form
- [ ] Approval queue (for GM)
- [ ] Financial reports access

---

**[TASK-412] Configure Auditor Access Control**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.6 - Auditor Dashboard
- **Owner:** Backend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #backend #security

**Subtasks:**
- [ ] Create Auditor role permissions (read-only)
- [ ] Restrict write access
- [ ] Grant access to all financial data
- [ ] Grant access to all audit logs
- [ ] Grant access to inventory reconciliation
- [ ] Create auditor-specific endpoints

---

**[TASK-413] Build Auditor Dashboard**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.6 - Auditor Dashboard
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** TASK-412
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Dashboard Sections:**
- [ ] Financial reports access
- [ ] Inventory reconciliation viewer
- [ ] Comprehensive audit logs
- [ ] Export functionality

---

## Week 13: Logistics Manager Dashboard

**[TASK-414] Enhance Delivery Tracking Backend**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.7 - Logistics Manager
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Delivery system exists
- **Status:** Not Started
- **Tags:** #backend #logistics

**Subtasks:**
- [ ] Enhance delivery status tracking
- [ ] Add driver assignment
- [ ] Create basic route tracking
- [ ] Add delivery time tracking
- [ ] Calculate delivery metrics
- [ ] Create delivery reports

---

**[TASK-415] Create Complaint Management System**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.7 - Logistics Manager
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #backend #database

**Subtasks:**
- [ ] Create Complaints table
- [ ] Create Complaint model
- [ ] Implement complaint logging
- [ ] Create complaint categories
- [ ] Add resolution workflow
- [ ] Track complaint status
- [ ] Link to orders/deliveries

**Categories:** Late delivery, Wrong address, Damaged items, Missing items, Poor driver conduct, Fee disputes

---

**[TASK-416] Build Logistics Manager Dashboard**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.7 - Logistics Manager
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** TASK-414, TASK-415
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Dashboard Sections:**
- [ ] Delivery tracking interface
- [ ] Delivery classification overview
- [ ] Driver management
- [ ] Complaint management interface

---

**[TASK-417] Test Approval Workflows**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.8 - Integration Testing
- **Owner:** QA + Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All dashboards complete
- **Status:** Not Started
- **Tags:** #testing #workflows

**Test Workflows:**
- [ ] Voucher approval
- [ ] Cash out approval
- [ ] Disposal approval
- [ ] Inventory adjustment approval
- [ ] Cross-role permissions
- [ ] Approval notifications

---

**[TASK-418] Dashboard Performance Testing**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.8 - Integration Testing
- **Owner:** QA + Developers
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** All dashboards complete
- **Status:** Not Started
- **Tags:** #testing #performance

**Performance Targets:**
- [ ] Dashboard load <2s
- [ ] Report generation <5s
- [ ] Chart rendering <1s
- [ ] Filter/search <500ms

---

**[TASK-419] Phase 4 End-to-End Testing**
- **Phase:** Phase 4 - Dashboards
- **Sprint:** 4.8 - Integration Testing
- **Owner:** QA + All Developers
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** All Phase 4 complete
- **Status:** Not Started
- **Tags:** #testing #integration

**Test Scenarios:**
- [ ] GM sets targets and tracks achievement
- [ ] GM conducts staff appraisal
- [ ] GM approves voucher request
- [ ] Finance Manager creates cash out request
- [ ] GM approves cash out
- [ ] Auditor views financial reports
- [ ] Auditor exports audit logs
- [ ] Logistics Manager assigns delivery
- [ ] Logistics Manager resolves complaint
- [ ] All reports generate
- [ ] All exports work

---

# PHASE 5: ADVANCED FEATURES & ADMIN (WEEKS 14-16)

## Week 14: Super Admin Controls

**[TASK-501] Create User Management Backend**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.1 - User Management
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Phase 4 Complete
- **Status:** Not Started
- **Tags:** #backend #admin

**Subtasks:**
- [ ] Create user creation endpoint (Super Admin only)
- [ ] Implement role assignment
- [ ] Add branch assignment
- [ ] Set shift times
- [ ] Generate temporary password
- [ ] Send welcome email
- [ ] Force password change on first login

---

**[TASK-502] Implement Role & Permission System**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.1 - User Management
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** TASK-501
- **Status:** Not Started
- **Tags:** #backend #security

**Subtasks:**
- [ ] Create permission structure (JSONB)
- [ ] Define permissions for each role
- [ ] Create permission checking middleware
- [ ] Implement role assignment endpoint
- [ ] Create permission update endpoint
- [ ] Add role hierarchy
- [ ] Log all permission changes

---

**[TASK-503] Build Super Admin Dashboard**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.1 - User Management
- **Owner:** Frontend Developer
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** TASK-502
- **Status:** Not Started
- **Tags:** #frontend #dashboard

**Dashboard Sections:**
- [ ] User management (list, create, edit, deactivate)
- [ ] Role management (view, edit permissions)
- [ ] System settings interface
- [ ] Activity monitoring

---

**[TASK-504] Create Approval Workflow Configuration**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.2 - Workflow Configuration
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Approval systems exist
- **Status:** Not Started
- **Tags:** #backend #configuration

**Subtasks:**
- [ ] Create workflow configuration table
- [ ] Define two-tier approval structure
- [ ] Make thresholds configurable
- [ ] Create workflow rules engine
- [ ] Add approval routing logic
- [ ] Support sequential approvals

---

**[TASK-505] Build Workflow Configuration UI**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.2 - Workflow Configuration
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** TASK-504
- **Status:** Not Started
- **Tags:** #frontend #configuration

**Subtasks:**
- [ ] Create approval rules management page
- [ ] Configure approval thresholds
- [ ] Set up approval routing
- [ ] Define escalation rules
- [ ] Test workflow changes

---

## Week 15: Security & Session Management

**[TASK-506] Implement Inactivity Detection**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.3 - Security
- **Owner:** Full-Stack Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #fullstack #security

**Backend Subtasks:**
- [ ] Create session timeout configuration
- [ ] Implement activity tracking
- [ ] Create session lock endpoint
- [ ] Create session unlock endpoint
- [ ] Preserve session state
- [ ] Log lock/unlock events

**Frontend Subtasks:**
- [ ] Implement activity listeners
- [ ] Create countdown timer
- [ ] Show warning modal (1 min before)
- [ ] Lock screen UI
- [ ] Unlock form

---

**[TASK-507] Implement Shift Control System**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.3 - Security
- **Owner:** Full-Stack Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** User shift times exist
- **Status:** Not Started
- **Tags:** #fullstack #security

**Backend Subtasks:**
- [ ] Create shift validation function
- [ ] Check shift end time
- [ ] Auto-logout at shift end
- [ ] Create manager override endpoint
- [ ] Log shift violations

**Frontend Subtasks:**
- [ ] Show shift time remaining
- [ ] Warning before shift end
- [ ] Auto-logout mechanism
- [ ] Manager override modal

---

**[TASK-508] Create Advanced Reports**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.4 - Enhanced Reporting
- **Owner:** Backend + Frontend Developer
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** Existing reporting
- **Status:** Not Started
- **Tags:** #fullstack #reporting

**Reports to Create:**
1. Express vs Normal Service Report
2. Rewash Report (enhanced)
3. Delivery Type Report
4. Staff Performance Report
5. Voucher Usage Report
6. Revenue Reports (enhanced)

**Subtasks:**
- [ ] Create report generation endpoints
- [ ] Build complex SQL queries
- [ ] Design report layouts
- [ ] Add data visualizations
- [ ] Implement filters

---

**[TASK-509] Implement Report Export Functions**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.4 - Enhanced Reporting
- **Owner:** Backend + Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-508
- **Status:** Not Started
- **Tags:** #fullstack #reporting

**Subtasks:**
- [ ] Implement PDF export for all reports
- [ ] Implement Excel export for all reports
- [ ] Add company branding to PDFs
- [ ] Format Excel for readability
- [ ] Test all exports
- [ ] Add download progress indicators

---

## Week 16: Customer Enhancements & Polish

**[TASK-510] Implement Customer Type & Loyalty Backend**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.5 - Customer Enhancement
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Customer table extended
- **Status:** Not Started
- **Tags:** #backend #feature

**Subtasks:**
- [ ] Implement customer type logic
- [ ] Create loyalty points calculation
- [ ] Points earning rules (1%, 2%, 3%)
- [ ] Points redemption logic
- [ ] Update customer type endpoint
- [ ] Create loyalty points endpoints

**Loyalty Rules:**
- Regular: 1% of order value
- Corporate: 2%
- VIP: 3%
- Redemption: 1 point = KES 1

---

**[TASK-511] Build Enhanced Customer Profile UI**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.5 - Customer Enhancement
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** TASK-510
- **Status:** Not Started
- **Tags:** #frontend #ui

**Enhancements:**
- [ ] Customer type badge
- [ ] Loyalty points display (large)
- [ ] Last order details
- [ ] Lifetime value stats
- [ ] Quick actions panel

---

**[TASK-512] Performance Optimization**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.6 - System Polish
- **Owner:** All Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** All features complete
- **Status:** Not Started
- **Tags:** #optimization #performance

**Optimization Areas:**
- [ ] Database query optimization
- [ ] Add missing indexes
- [ ] Implement caching (Redis)
- [ ] Optimize large reports
- [ ] Code minification
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Bundle size reduction

**Targets:**
- Page load: <2s
- API response: <500ms
- Report generation: <5s

---

**[TASK-513] UI/UX Refinement**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.6 - System Polish
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** Medium
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #frontend #ui #ux

**Refinements:**
- [ ] Consistent styling
- [ ] Improved error messages
- [ ] Loading indicators
- [ ] Success/error notifications
- [ ] Tooltips
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Keyboard shortcuts

---

**[TASK-514] Security Hardening**
- **Phase:** Phase 5 - Advanced Features
- **Sprint:** 5.6 - System Polish
- **Owner:** Backend Developer + Security Expert
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All features complete
- **Status:** Not Started
- **Tags:** #backend #security

**Security Checklist:**
- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF tokens implemented
- [ ] Rate limiting implemented
- [ ] Input validation (all endpoints)
- [ ] Output sanitization
- [ ] Secure password storage verified
- [ ] Session security verified
- [ ] HTTPS enforcement
- [ ] Security headers
- [ ] Dependency vulnerability scan
- [ ] Basic penetration testing

---

# PHASE 6: TESTING & REFINEMENT (WEEKS 17-18)

## Week 17: Comprehensive Testing

**[TASK-601] End-to-End Workflow Testing**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.1 - Integration Testing
- **Owner:** QA + All Developers
- **Duration:** 20 hours (distributed)
- **Priority:** Critical
- **Dependencies:** All features complete
- **Status:** Not Started
- **Tags:** #testing #integration #critical

**Critical Workflows:**
1. Complete order lifecycle
2. Rewash workflow
3. Inventory workflow
4. Voucher workflow
5. Approval workflows
6. Role-based access

[See planning.md for detailed test scenarios]

---

**[TASK-602] Cross-Module Integration Testing**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.1 - Integration Testing
- **Owner:** QA + Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** TASK-601
- **Status:** Not Started
- **Tags:** #testing #integration

**Integration Points:**
- [ ] Order → Receipt → Reminder
- [ ] Order → Delivery → Logistics
- [ ] Voucher → Order → Finance
- [ ] Staff Action → Audit → GM Dashboard
- [ ] Customer → Loyalty → Discount
- [ ] Inventory → Reconciliation → Auditor

---

**[TASK-603] Data Integrity Testing**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.1 - Integration Testing
- **Owner:** QA + Database Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #testing #database

**Tests:**
- [ ] Foreign key constraints
- [ ] Database triggers
- [ ] Cascade deletes/updates
- [ ] Transaction rollbacks
- [ ] Data consistency
- [ ] Concurrent operations
- [ ] Audit trail completeness

---

**[TASK-604] Performance Testing**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.2 - Performance Testing
- **Owner:** QA + Backend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Integration testing complete
- **Status:** Not Started
- **Tags:** #testing #performance

**Benchmarks:**
- [ ] Order creation: <500ms
- [ ] Order list: <1s
- [ ] Dashboard load: <2s
- [ ] Report generation: <5s
- [ ] Receipt printing: <2s
- [ ] Search/filter: <500ms
- [ ] Database queries: <100ms avg

---

**[TASK-605] Load Testing**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.2 - Performance Testing
- **Owner:** QA + DevOps
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** TASK-604
- **Status:** Not Started
- **Tags:** #testing #performance #load

**Load Scenarios:**
- [ ] 10 concurrent users (normal)
- [ ] 50 concurrent users (peak)
- [ ] 100 concurrent users (stress)
- [ ] Sustained load (1 hour)

**Tests:**
- Order creation under load
- Report generation under load
- Dashboard access under load
- Database performance
- API response times

---

## Week 18: UAT & Bug Fixes

**[TASK-606] Prepare for UAT**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.3 - User Acceptance Testing
- **Owner:** Product Manager
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** All testing complete
- **Status:** Not Started
- **Tags:** #uat #preparation

**Subtasks:**
- [ ] Create UAT test plan
- [ ] Prepare UAT environment
- [ ] Create role-specific test scenarios
- [ ] Prepare test data
- [ ] Schedule UAT sessions
- [ ] Invite actual users
- [ ] Prepare feedback forms

---

**[TASK-607] Conduct UAT Sessions**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.3 - User Acceptance Testing
- **Owner:** Product Manager + Stakeholders
- **Duration:** 20 hours (over 3 days)
- **Priority:** Critical
- **Dependencies:** TASK-606
- **Status:** Not Started
- **Tags:** #uat #testing

**Sessions by Role:**
- [ ] POS Attendant (4 hours)
- [ ] Inspector (2 hours)
- [ ] General Manager (4 hours)
- [ ] Finance Manager (3 hours)
- [ ] Auditor (2 hours)
- [ ] Logistics Manager (3 hours)
- [ ] Super Admin (2 hours)

**Deliverable:** Comprehensive feedback report

---

**[TASK-608] Analyze UAT Feedback**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.3 - User Acceptance Testing
- **Owner:** Product Manager + Lead Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** TASK-607
- **Status:** Not Started
- **Tags:** #uat #analysis

**Subtasks:**
- [ ] Compile all feedback
- [ ] Categorize issues (Critical/High/Medium/Low)
- [ ] Prioritize bug fixes
- [ ] Identify UX improvements
- [ ] Create action items
- [ ] Assign to developers

---

**[TASK-609] Fix Critical Bugs**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.4 - Bug Fixes
- **Owner:** All Developers
- **Duration:** 12 hours
- **Priority:** Critical
- **Dependencies:** TASK-608
- **Status:** Not Started
- **Tags:** #bugfix #critical

**Process:**
- [ ] Fix all critical bugs
- [ ] Test fixes thoroughly
- [ ] Verify no regressions
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Re-test on staging

---

**[TASK-610] Implement High-Priority Improvements**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.4 - Bug Fixes
- **Owner:** All Developers
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** TASK-609
- **Status:** Not Started
- **Tags:** #improvement #ux

**Improvements:**
- [ ] UX feedback implementation
- [ ] High-priority bug fixes
- [ ] Error message improvements
- [ ] Missing validations
- [ ] User guidance enhancements

---

**[TASK-611] Final Testing Round**
- **Phase:** Phase 6 - Testing
- **Sprint:** 6.4 - Bug Fixes
- **Owner:** QA + All Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** TASK-610
- **Status:** Not Started
- **Tags:** #testing #final

**Final Tests:**
- [ ] Re-run all integration tests
- [ ] Re-test critical workflows
- [ ] Verify all bug fixes
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Final performance check
- [ ] Final security check

**Acceptance:** All tests pass, no regressions, system stable

---

# PHASE 7: TRAINING & DEPLOYMENT (WEEKS 19-20)

## Week 19: Training & Preparation

**[TASK-701] Create User Manuals**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.1 - Training Materials
- **Owner:** Technical Writer + Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** System finalized
- **Status:** Not Started
- **Tags:** #documentation #training

**Manuals:**
1. POS Attendant Manual
2. Inspector Manual
3. General Manager Manual
4. Finance Manager Manual
5. Auditor Manual
6. Logistics Manager Manual
7. Super Admin Manual

---

**[TASK-702] Create Video Tutorials**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.1 - Training Materials
- **Owner:** Technical Writer + Developer
- **Duration:** 10 hours
- **Priority:** Medium
- **Dependencies:** TASK-701
- **Status:** Not Started
- **Tags:** #documentation #training #video

**Videos:**
- [ ] Order creation (5 min)
- [ ] Receipt printing (3 min)
- [ ] Delivery classification (4 min)
- [ ] Rewash process (4 min)
- [ ] Inventory basics (8 min)
- [ ] Vouchers (6 min)
- [ ] GM Dashboard (10 min)
- [ ] Reports (5 min)

---

**[TASK-703] Create Quick Reference Guides**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.1 - Training Materials
- **Owner:** Technical Writer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #documentation #training

**Guides:**
- [ ] Order creation cheat sheet
- [ ] Keyboard shortcuts
- [ ] Common errors
- [ ] Troubleshooting guide
- [ ] Contact information

---

**[TASK-704] Conduct POS & Inspector Training**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.2 - Training Sessions
- **Owner:** Lead Developer + Trainer
- **Duration:** 8 hours (2 days)
- **Priority:** Critical
- **Dependencies:** TASK-701
- **Status:** Not Started
- **Tags:** #training #staff

**Day 1 - POS (4 hours):**
- Introduction (30 min)
- Order creation hands-on (1 hour)
- Receipt printing (30 min)
- Vouchers (30 min)
- Delivery classification (30 min)
- Q&A and practice (1 hour)

**Day 2 - Inspectors (4 hours):**
- Role overview (30 min)
- Quality checking (1 hour)
- Rewash workflow (1 hour)
- Tag printing (30 min)
- Q&A and practice (1 hour)

---

**[TASK-705] Conduct Managers Training**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.2 - Training Sessions
- **Owner:** Lead Developer + PM
- **Duration:** 8 hours (2 days)
- **Priority:** Critical
- **Dependencies:** TASK-701
- **Status:** Not Started
- **Tags:** #training #management

**Day 1 - GM & Finance (4 hours)**
**Day 2 - Logistics & Auditor (4 hours)**

---

**[TASK-706] Conduct Super Admin Training**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.2 - Training Sessions
- **Owner:** Lead Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** TASK-701
- **Status:** Not Started
- **Tags:** #training #admin

**Agenda:**
- User management (1 hour)
- Role configuration (1 hour)
- System settings (1 hour)
- Troubleshooting (1 hour)

---

**[TASK-707] Final Staging Review**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.3 - Pre-Deployment
- **Owner:** QA + Lead Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** All training complete
- **Status:** Not Started
- **Tags:** #testing #staging #deployment

**Review Checklist:**
- [ ] All features working on staging
- [ ] All bugs fixed
- [ ] All training complete
- [ ] Documentation finalized
- [ ] Migration scripts ready
- [ ] Rollback plan ready
- [ ] Backup scripts tested
- [ ] Monitoring configured

---

**[TASK-708] Prepare Deployment Checklist**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.3 - Pre-Deployment
- **Owner:** DevOps + Lead Developer
- **Duration:** 2 hours
- **Priority:** Critical
- **Dependencies:** TASK-707
- **Status:** Not Started
- **Tags:** #deployment #checklist

**Checklist:**
- [ ] User notification sent
- [ ] Production backup
- [ ] Backup restore tested
- [ ] Migration scripts ready
- [ ] Rollback scripts ready
- [ ] Monitoring alerts configured
- [ ] Emergency contacts ready
- [ ] Deployment time scheduled

---

## Week 20: Production Deployment

**[TASK-709] Execute Database Migration**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.4 - Production Deployment
- **Owner:** Database Developer + DevOps
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** TASK-708
- **Status:** Not Started
- **Tags:** #deployment #database #production

**Steps:**
1. Announce maintenance
2. Stop application
3. Backup database (full)
4. Verify backup
5. Run migrations
6. Verify success
7. Test rollback
8. Sanity check data

**Timeline:** 4-hour window (e.g., 2 AM - 6 AM)

---

**[TASK-710] Deploy Application**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.4 - Production Deployment
- **Owner:** DevOps + Lead Developer
- **Duration:** 3 hours
- **Priority:** Critical
- **Dependencies:** TASK-709
- **Status:** Not Started
- **Tags:** #deployment #production

**Steps:**
1. Deploy new code
2. Update environment variables
3. Install dependencies
4. Configure job scheduler
5. Start application
6. Verify services running
7. Run smoke tests
8. Test critical workflows

---

**[TASK-711] Go-Live & Monitoring**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.4 - Production Deployment
- **Owner:** All Team + DevOps
- **Duration:** 6 hours
- **Priority:** Critical
- **Dependencies:** TASK-710
- **Status:** Not Started
- **Tags:** #deployment #monitoring #production

**Go-Live:**
- [ ] Open system to users
- [ ] Send notification
- [ ] Monitor error logs
- [ ] Watch performance
- [ ] Track user activity
- [ ] Monitor database
- [ ] Ready for quick fixes

**Monitoring (6 hours):**
- Error rate
- Response times
- Database connections
- Job scheduler
- SMS delivery
- Receipt printing
- User logins

---

**[TASK-712] Provide On-Site Support**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.5 - Post-Launch Support
- **Owner:** Lead Developer + Support Team
- **Duration:** 24 hours (3 days, 8 hours each)
- **Priority:** High
- **Dependencies:** Go-live complete
- **Status:** Not Started
- **Tags:** #support #post-launch

**Activities:**
- [ ] On-site presence
- [ ] Immediate issue support
- [ ] Continuous monitoring
- [ ] Quick bug fixes
- [ ] User questions
- [ ] Feedback collection
- [ ] Issue documentation
- [ ] On-the-fly training

---

**[TASK-713] Issue Triage & Resolution**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.5 - Post-Launch Support
- **Owner:** All Developers
- **Duration:** Ongoing (3 days)
- **Priority:** Critical
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #support #bugfix

**Categories:**
1. **Critical** (fix immediately)
2. **High** (fix within 4 hours)
3. **Medium** (fix within 24 hours)
4. **Low** (schedule for later)

---

**[TASK-714] Collect Post-Launch Feedback**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.5 - Post-Launch Support
- **Owner:** Product Manager
- **Duration:** Ongoing (3 days)
- **Priority:** Medium
- **Dependencies:** None
- **Status:** Not Started
- **Tags:** #feedback #post-launch

**Methods:**
- [ ] Daily check-ins
- [ ] Feedback forms
- [ ] Issue tracker
- [ ] Usage observation
- [ ] End-of-week survey

**Topics:**
- Ease of use
- Performance
- Missing features
- Confusing workflows
- Training effectiveness
- Overall satisfaction

---

**[TASK-715] Project Closure Documentation**
- **Phase:** Phase 7 - Deployment
- **Sprint:** 7.5 - Post-Launch Support
- **Owner:** Project Manager
- **Duration:** 4 hours
- **Priority:** Medium
- **Dependencies:** Week 1 post-launch complete
- **Status:** Not Started
- **Tags:** #documentation #closure

**Deliverables:**
- [ ] Project completion report
- [ ] Lessons learned document
- [ ] Final budget reconciliation
- [ ] Success metrics assessment
- [ ] Handover documentation
- [ ] Future enhancements list
- [ ] Celebration and recognition

---

# APPENDICES

## Task Import Templates

### For Jira (CSV Format)
```
Summary,Description,Issue Type,Priority,Assignee,Story Points,Epic Link
[TASK-001] Document Current Tech Stack,Complete documentation...,Task,Critical,Lead Developer,3,Week 0
```

### For Trello (JSON Format)
```json
{
  "name": "[TASK-001] Document Current Tech Stack",
  "desc": "Complete documentation of current system architecture",
  "labels": ["documentation", "audit"],
  "due": null,
  "members": ["lead-developer"]
}
```

### For GitHub Projects
```
- [ ] **[TASK-001] Document Current Tech Stack** (Critical, 4h) @lead-developer
```

---

## Quick Reference

**Total Tasks:** 157  
**Estimated Hours:** 2,400  
**Critical Tasks:** 64  
**High Priority:** 73  
**Medium Priority:** 20  

**Phases:**
- Week 0: 15 tasks
- Phase 1: 19 tasks
- Phase 2: 16 tasks
- Phase 3: 16 tasks
- Phase 4: 19 tasks
- Phase 5: 15 tasks
- Phase 6: 11 tasks
- Phase 7: 15 tasks

---

**Document Version:** 1.0  
**Last Updated:** February 3, 2025  
**Prepared By:** Claude AI Assistant for Ndururi  
**Status:** Ready for Import into PM Tool

---

# End of Tasks Document
