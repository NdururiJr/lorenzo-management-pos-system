# Lorenzo Dry Cleaners System Upgrade - Project Planning Document

## Executive Summary

**Project Name:** Lorenzo Dry Cleaners Management System v2.0 Upgrade  
**Project Manager:** Ndururi  
**Start Date:** [To be determined]  
**Target Completion:** 18-20 weeks from start  
**Budget:** [To be determined]  
**Project Type:** System Enhancement & Upgrade  

**Objective:** Upgrade existing laundry management system with 18 major feature enhancements while maintaining 100% backward compatibility and zero operational disruption.

---

## Table of Contents

1. [Project Timeline Overview](#project-timeline-overview)
2. [Pre-Development Phase (Week 0)](#pre-development-phase-week-0)
3. [Phase 1: Foundation & Critical Enhancements](#phase-1-foundation--critical-enhancements-weeks-1-3)
4. [Phase 2: Business Automation](#phase-2-business-automation-weeks-4-6)
5. [Phase 3: Inventory & Vouchers](#phase-3-inventory--vouchers-weeks-7-9)
6. [Phase 4: Role-Based Dashboards](#phase-4-role-based-dashboards-weeks-10-13)
7. [Phase 5: Advanced Features & Admin](#phase-5-advanced-features--admin-weeks-14-16)
8. [Phase 6: Testing & Refinement](#phase-6-testing--refinement-weeks-17-18)
9. [Phase 7: Training & Deployment](#phase-7-training--deployment-weeks-19-20)
10. [Resource Allocation](#resource-allocation)
11. [Risk Management Plan](#risk-management-plan)
12. [Quality Assurance Plan](#quality-assurance-plan)
13. [Communication Plan](#communication-plan)
14. [Success Criteria](#success-criteria)

---

## Project Timeline Overview

### Gantt Chart Summary

```
Week 0:   [Pre-Dev & System Audit]
Weeks 1-3:  [Phase 1: Foundation]
Weeks 4-6:  [Phase 2: Automation]
Weeks 7-9:  [Phase 3: Inventory & Vouchers]
Weeks 10-13: [Phase 4: Dashboards]
Weeks 14-16: [Phase 5: Advanced Features]
Weeks 17-18: [Phase 6: Testing]
Weeks 19-20: [Phase 7: Deployment]
```

### Critical Path

```
System Audit → Database Migration → Order Enhancement → Reminder System → 
Inventory Module → GM Dashboard → Admin Controls → Testing → Deployment
```

### Milestones

| Milestone | Target Week | Deliverables |
|-----------|-------------|--------------|
| M0: Project Kickoff | Week 0 | System audit complete, environment setup |
| M1: Phase 1 Complete | Week 3 | Enhanced orders, receipts, express pricing |
| M2: Phase 2 Complete | Week 6 | Delivery classification, rewash, reminders |
| M3: Phase 3 Complete | Week 9 | Inventory module, vouchers, delivery notes |
| M4: Phase 4 Complete | Week 13 | All role-based dashboards operational |
| M5: Phase 5 Complete | Week 16 | Admin controls, security, reports |
| M6: Testing Complete | Week 18 | All tests passed, bugs fixed |
| M7: Production Launch | Week 20 | System live, staff trained |

---

## Pre-Development Phase (Week 0)

### Objectives
- Document current system architecture
- Set up development environments
- Establish project governance
- Prepare for Phase 1 development

### Tasks Breakdown

#### 1. System Audit & Documentation (Days 1-2)

**Task 1.1: Current Tech Stack Documentation**
- **Owner:** Lead Developer
- **Duration:** 4 hours
- **Deliverable:** Completed "Current System Architecture Documentation" section in claude.md

**Subtasks:**
- [ ] Document frontend framework and version
- [ ] Document backend framework and version
- [ ] Document database system and version
- [ ] Document hosting and infrastructure
- [ ] List all current API endpoints
- [ ] Map current user roles and permissions
- [ ] Identify third-party service integrations
- [ ] Document current printer setup

**Task 1.2: Database Schema Export**
- **Owner:** Database Administrator/Developer
- **Duration:** 2 hours
- **Deliverable:** Current database schema documentation

**Subtasks:**
- [ ] Export database schema (tables, columns, relationships)
- [ ] Document existing indexes
- [ ] Document existing constraints
- [ ] Identify foreign key relationships
- [ ] Create visual ER diagram
- [ ] Document stored procedures (if any)
- [ ] Document triggers (if any)

**Task 1.3: Current Feature Inventory**
- **Owner:** Product Manager/Developer
- **Duration:** 3 hours
- **Deliverable:** Complete list of existing features and workflows

**Subtasks:**
- [ ] Document all existing order workflows
- [ ] Document customer management features
- [ ] Document payment processing flows
- [ ] Document current reporting capabilities
- [ ] Document user management features
- [ ] Identify integration points for new features
- [ ] List known bugs or limitations

#### 2. Environment Setup (Days 2-3)

**Task 2.1: Version Control Setup**
- **Owner:** Lead Developer
- **Duration:** 2 hours
- **Deliverable:** Git repository configured with branching strategy

**Subtasks:**
- [ ] Create/confirm Git repository
- [ ] Set up branch protection rules
- [ ] Create development branch
- [ ] Create feature branch naming convention
- [ ] Set up .gitignore properly
- [ ] Document Git workflow in README
- [ ] Add all team members to repository

**Task 2.2: Staging Environment Setup**
- **Owner:** DevOps/Developer
- **Duration:** 6 hours
- **Deliverable:** Fully functional staging environment

**Subtasks:**
- [ ] Provision staging server (if not exists)
- [ ] Clone production database to staging
- [ ] Configure web server on staging
- [ ] Set up SSL certificate for staging
- [ ] Deploy current production code to staging
- [ ] Verify all features work on staging
- [ ] Configure staging-specific environment variables
- [ ] Set up database backup schedule for staging
- [ ] Document staging access credentials

**Task 2.3: Development Environment Setup**
- **Owner:** All Developers
- **Duration:** 4 hours per developer
- **Deliverable:** Local development environment for each developer

**Subtasks:**
- [ ] Clone repository locally
- [ ] Install required dependencies
- [ ] Set up local database
- [ ] Import staging database to local
- [ ] Configure local environment variables
- [ ] Verify application runs locally
- [ ] Set up IDE/code editor
- [ ] Install linting and formatting tools
- [ ] Test local development workflow

#### 3. Project Management Setup (Days 3-4)

**Task 3.1: Project Management Tool Configuration**
- **Owner:** Project Manager
- **Duration:** 3 hours
- **Deliverable:** Project board with all tasks

**Tool Options:**
- [ ] Trello
- [ ] Jira
- [ ] Asana
- [ ] GitHub Projects
- [ ] Monday.com

**Subtasks:**
- [ ] Create project workspace
- [ ] Set up project board/kanban
- [ ] Create epics for each phase
- [ ] Import all tasks from this planning document
- [ ] Assign initial tasks to team members
- [ ] Set up labels/tags (Frontend, Backend, Database, etc.)
- [ ] Configure sprint/iteration structure
- [ ] Set up automation rules (if applicable)
- [ ] Invite all stakeholders

**Task 3.2: Communication Channels Setup**
- **Owner:** Project Manager
- **Duration:** 1 hour
- **Deliverable:** Communication structure established

**Subtasks:**
- [ ] Create project Slack/Discord/WhatsApp group
- [ ] Set up weekly meeting schedule
- [ ] Create daily standup schedule
- [ ] Set up code review process
- [ ] Establish emergency contact protocol
- [ ] Create shared documentation folder
- [ ] Set up meeting notes template

**Task 3.3: Documentation Repository**
- **Owner:** Technical Writer/Developer
- **Duration:** 2 hours
- **Deliverable:** Centralized documentation location

**Subtasks:**
- [ ] Create /docs folder in repository
- [ ] Add PRD to /docs
- [ ] Add claude.md to /docs
- [ ] Add planning.md to /docs
- [ ] Create API documentation template
- [ ] Create database migration template
- [ ] Create code review checklist
- [ ] Set up wiki (GitHub/GitLab/Confluence)

#### 4. Stakeholder Alignment (Days 4-5)

**Task 4.1: Kickoff Meeting Preparation**
- **Owner:** Project Manager
- **Duration:** 2 hours
- **Deliverable:** Kickoff meeting presentation

**Subtasks:**
- [ ] Prepare kickoff presentation slides
- [ ] Summarize project scope and objectives
- [ ] Present timeline and milestones
- [ ] Prepare budget overview
- [ ] Create roles and responsibilities document
- [ ] Prepare Q&A document
- [ ] Send meeting invites to all stakeholders

**Task 4.2: Kickoff Meeting**
- **Owner:** Project Manager
- **Duration:** 2 hours
- **Attendees:** All stakeholders, development team, management

**Agenda:**
- Project overview and objectives (15 min)
- Detailed scope presentation (20 min)
- Timeline and milestones review (15 min)
- Roles and responsibilities (10 min)
- Communication plan (10 min)
- Risk management overview (10 min)
- Q&A session (30 min)
- Next steps and action items (10 min)

**Deliverable:** Meeting notes with action items

**Task 4.3: Sign-off and Approvals**
- **Owner:** Project Manager
- **Duration:** Varies
- **Deliverable:** Formal project approval

**Subtasks:**
- [ ] Get management sign-off on scope
- [ ] Get budget approval
- [ ] Get timeline approval
- [ ] Confirm resource allocation
- [ ] Establish change request process
- [ ] Document approval in project records

#### 5. Technical Preparation (Day 5)

**Task 5.1: Database Migration Strategy Finalization**
- **Owner:** Database Lead/Architect
- **Duration:** 4 hours
- **Deliverable:** Detailed migration plan

**Subtasks:**
- [ ] Review PRD database requirements
- [ ] Plan column additions to existing tables
- [ ] Design new table structures
- [ ] Plan data migration for existing records
- [ ] Create migration scripts directory structure
- [ ] Write first migration script (roles table)
- [ ] Test migration script on local database
- [ ] Document rollback procedures
- [ ] Create migration checklist

**Task 5.2: API Extension Planning**
- **Owner:** Backend Lead
- **Duration:** 3 hours
- **Deliverable:** API extension plan

**Subtasks:**
- [ ] Review existing API endpoints
- [ ] List all new endpoints needed
- [ ] Plan modifications to existing endpoints
- [ ] Design API versioning strategy (if needed)
- [ ] Plan backward compatibility approach
- [ ] Document API naming conventions
- [ ] Create API documentation template
- [ ] Plan authentication/authorization extensions

**Task 5.3: Testing Strategy**
- **Owner:** QA Lead/Developer
- **Duration:** 2 hours
- **Deliverable:** Testing strategy document

**Subtasks:**
- [ ] Define unit testing requirements
- [ ] Define integration testing requirements
- [ ] Define E2E testing requirements
- [ ] Select testing frameworks
- [ ] Create test case template
- [ ] Plan test data generation
- [ ] Define code coverage targets
- [ ] Set up continuous testing strategy

### Week 0 Deliverables Summary

- ✅ Complete system architecture documentation
- ✅ Staging environment fully operational
- ✅ Development environments set up
- ✅ Project management system configured
- ✅ Communication channels established
- ✅ Stakeholder buy-in and approvals
- ✅ Database migration strategy documented
- ✅ API extension plan created
- ✅ Testing strategy defined

### Week 0 Success Criteria

- [ ] All team members can access repository
- [ ] All team members have working dev environments
- [ ] Staging environment mirrors production
- [ ] All documentation is centralized and accessible
- [ ] All stakeholders aware of timeline and commitments
- [ ] Project board has all Phase 1 tasks

---

## Phase 1: Foundation & Critical Enhancements (Weeks 1-3)

### Phase Objectives
- Enhance order creation workflow
- Improve receipt system
- Implement express service pricing
- Run initial database migrations
- Establish development rhythm

### Week 1: Database Migrations & Order Enhancements

#### Sprint 1.1: Database Foundation (Days 1-2)

**Task 1.1.1: Create Migration Scripts**
- **Owner:** Database Developer
- **Duration:** 6 hours
- **Priority:** Critical
- **Dependencies:** Week 0 complete

**Subtasks:**
- [ ] Create `001_add_roles_table.sql`
- [ ] Create `002_extend_users_table.sql`
- [ ] Create `003_extend_orders_table.sql`
- [ ] Create `004_extend_order_items_table.sql`
- [ ] Create `005_extend_customers_table.sql`
- [ ] Create `006_extend_branches_table.sql`
- [ ] Add rollback script for each migration
- [ ] Test each script on local database

**Acceptance Criteria:**
- All migration scripts execute without errors
- Rollback scripts successfully reverse migrations
- Existing data remains intact after migrations
- All new columns have appropriate defaults

**Task 1.1.2: Run Migrations on Staging**
- **Owner:** Database Developer
- **Duration:** 2 hours
- **Priority:** Critical
- **Dependencies:** Task 1.1.1

**Subtasks:**
- [ ] Backup staging database
- [ ] Run migration scripts sequentially
- [ ] Verify all tables updated correctly
- [ ] Test rollback on staging copy
- [ ] Document any issues encountered
- [ ] Verify application still functions

**Acceptance Criteria:**
- Staging database schema updated successfully
- Existing features still work on staging
- All new columns accessible
- Rollback tested and verified

**Task 1.1.3: Update ORM/Models**
- **Owner:** Backend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** Task 1.1.2

**Subtasks:**
- [ ] Update User model with new fields
- [ ] Update Order model with new fields
- [ ] Update OrderItem model with new fields
- [ ] Update Customer model with new fields
- [ ] Update Branch model with new fields
- [ ] Create/update database seeders
- [ ] Test model changes locally

**Acceptance Criteria:**
- All models reflect new schema
- Existing queries still work
- New fields accessible in code
- Unit tests pass

#### Sprint 1.2: Order Creation Enhancement (Days 3-5)

**Task 1.2.1: Brand Field Implementation**
- **Owner:** Frontend + Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 1.1.3

**Frontend Subtasks:**
- [ ] Add brand text input to order form
- [ ] Add "No Brand" checkbox
- [ ] Implement checkbox logic (disable input when checked)
- [ ] Add validation (brand required)
- [ ] Update form submission logic
- [ ] Add error messaging
- [ ] Style new fields to match existing design

**Backend Subtasks:**
- [ ] Update order creation API endpoint
- [ ] Add brand validation
- [ ] Handle "No Brand" value
- [ ] Update order response to include brand
- [ ] Update order list endpoint
- [ ] Add migration for existing orders (default to "No Brand")

**Acceptance Criteria:**
- Brand field visible on order form
- "No Brand" checkbox works correctly
- Validation prevents submission without brand
- Existing orders show "No Brand" by default
- API correctly stores brand value

**Task 1.2.2: Checked By Field Implementation**
- **Owner:** Frontend + Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 1.2.1

**Frontend Subtasks:**
- [ ] Add "Checked By" dropdown to order form
- [ ] Populate dropdown with inspector users
- [ ] Make field mandatory
- [ ] Add validation messaging
- [ ] Update form submission

**Backend Subtasks:**
- [ ] Update order creation API
- [ ] Add checked_by validation
- [ ] Filter users by Inspector role
- [ ] Create endpoint to fetch inspectors
- [ ] Update order response

**Acceptance Criteria:**
- "Checked By" dropdown populated with inspectors
- Field is mandatory
- API validates checked_by exists
- Order cannot be created without inspector

**Task 1.2.3: Category Field Implementation**
- **Owner:** Frontend + Backend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** Task 1.2.2

**Frontend Subtasks:**
- [ ] Add Adult/Children radio buttons or dropdown
- [ ] Add to each garment item in order
- [ ] Make field mandatory
- [ ] Add validation
- [ ] Update item submission

**Backend Subtasks:**
- [ ] Update order item creation
- [ ] Add category validation
- [ ] Update order item response
- [ ] Ensure backward compatibility

**Acceptance Criteria:**
- Category selection available for each garment
- Cannot submit without category selection
- API validates category value
- Existing items show default category

### Week 2: Service Type & Receipt Enhancements

#### Sprint 1.3: Service Type Implementation (Days 1-2)

**Task 1.3.1: Service Type Selector**
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Week 1 tasks complete

**Subtasks:**
- [ ] Add Normal/Express toggle or radio buttons
- [ ] Apply to entire order or per-item (clarify with client)
- [ ] Add visual distinction (badges, colors)
- [ ] Set default to "Normal"
- [ ] Update form state management
- [ ] Add service type to order summary

**Acceptance Criteria:**
- Service type selector visible
- Clear visual distinction between types
- Defaults to Normal service
- Selection saved with order

**Task 1.3.2: Express Pricing Logic**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** Task 1.3.1

**Subtasks:**
- [ ] Create pricing calculation function
- [ ] Implement 1.5× multiplier for express
- [ ] Get multiplier from system_settings table
- [ ] Update order total calculation
- [ ] Handle mixed service types (if applicable)
- [ ] Create pricing breakdown in response
- [ ] Add unit tests for pricing logic
- [ ] Update existing pricing API

**Acceptance Criteria:**
- Express orders priced at 1.5× normal
- Calculation accurate for all scenarios
- Multiplier configurable in settings
- Pricing breakdown shows normal vs express

**Task 1.3.3: Price Display Updates**
- **Owner:** Frontend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** Task 1.3.2

**Subtasks:**
- [ ] Show price breakdown (Normal: X, Express: X)
- [ ] Real-time price update on service type change
- [ ] Display total with service type indicator
- [ ] Add tooltip explaining express pricing
- [ ] Update order summary
- [ ] Update order history view

**Acceptance Criteria:**
- Prices update in real-time
- Clear breakdown visible
- Express prices clearly marked
- User understands pricing difference

#### Sprint 1.4: Receipt Enhancements (Days 3-5)

**Task 1.4.1: Receipt Template Redesign**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** None (can parallel)

**Subtasks:**
- [ ] Design new receipt layout
- [ ] Add company logo placement
- [ ] Create garment details table
- [ ] Add "CLEANED AT OWNER'S RISK" notice
- [ ] Position for QR code
- [ ] Add T&C link area
- [ ] Make template responsive for printing
- [ ] Test print output

**Acceptance Criteria:**
- Receipt includes all required elements (per PRD)
- Prints correctly on thermal printer
- "CLEANED AT OWNER'S RISK" prominently displayed
- Professional appearance

**Task 1.4.2: QR Code Generation**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 1.4.1

**Subtasks:**
- [ ] Install QR code generation library
- [ ] Create QR code generation function
- [ ] Generate QR with order tracking URL
- [ ] Store QR code data in receipts table
- [ ] Create endpoint to serve QR code image
- [ ] Add QR code to receipt API response
- [ ] Test QR code scanning

**Acceptance Criteria:**
- QR code generated for each receipt
- Scans correctly on mobile devices
- Links to order tracking page
- QR code visible on printed receipt

**Task 1.4.3: Terms & Conditions Page**
- **Owner:** Frontend Developer + Content Writer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** None

**Subtasks:**
- [ ] Create T&C page/modal
- [ ] Write/compile T&C content (legal review)
- [ ] Create route/URL for T&C
- [ ] Make page mobile-friendly
- [ ] Add link to receipt
- [ ] Test QR code linking to T&C

**Acceptance Criteria:**
- T&C page accessible via URL
- Content legally reviewed (if required)
- Mobile-friendly display
- Link works from receipt
- QR code can link to T&C

**Task 1.4.4: Receipt Printing Integration**
- **Owner:** Backend + DevOps
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** Tasks 1.4.1, 1.4.2

**Subtasks:**
- [ ] Update existing print function
- [ ] Integrate new receipt template
- [ ] Add QR code to print output
- [ ] Test thermal printer compatibility
- [ ] Handle print failures gracefully
- [ ] Add reprint functionality
- [ ] Store receipt in database
- [ ] Test on actual hardware

**Acceptance Criteria:**
- Receipt prints with all new elements
- QR code scannable on printed receipt
- Reprint works from order history
- Print failures logged and handled

### Week 3: Testing & Integration

#### Sprint 1.5: Integration & Testing (Days 1-3)

**Task 1.5.1: End-to-End Order Flow Testing**
- **Owner:** QA + All Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All Week 1-2 tasks

**Test Scenarios:**
- [ ] Create order with brand
- [ ] Create order with "No Brand"
- [ ] Create order with checked_by
- [ ] Create order without checked_by (should fail)
- [ ] Create Normal service order
- [ ] Create Express service order
- [ ] Verify pricing calculation
- [ ] Print receipt with new template
- [ ] Scan QR code
- [ ] Verify T&C link
- [ ] Test on mobile devices
- [ ] Test reprint functionality

**Acceptance Criteria:**
- All test scenarios pass
- No regression bugs in existing features
- Receipt prints correctly every time
- QR codes always scannable

**Task 1.5.2: Database Performance Testing**
- **Owner:** Database Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** All migrations complete

**Subtasks:**
- [ ] Test query performance with new columns
- [ ] Add indexes if needed
- [ ] Test order creation performance
- [ ] Test order listing performance
- [ ] Profile slow queries
- [ ] Optimize as needed
- [ ] Document performance metrics

**Acceptance Criteria:**
- Order creation < 500ms
- Order list loads < 1 second
- No performance degradation vs baseline
- All indexes in place

**Task 1.5.3: Bug Fixes & Refinement**
- **Owner:** All Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** Task 1.5.1

**Subtasks:**
- [ ] Fix all critical bugs
- [ ] Fix high-priority bugs
- [ ] Address UI/UX feedback
- [ ] Improve error messages
- [ ] Optimize code
- [ ] Code cleanup
- [ ] Update documentation

**Acceptance Criteria:**
- Zero critical bugs
- All high-priority bugs fixed
- Code reviewed and approved
- Documentation updated

#### Sprint 1.6: Deployment to Staging (Days 4-5)

**Task 1.6.1: Staging Deployment**
- **Owner:** DevOps + Lead Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** All testing complete

**Subtasks:**
- [ ] Merge all feature branches to development
- [ ] Run full test suite
- [ ] Deploy to staging environment
- [ ] Run database migrations on staging
- [ ] Smoke test all features
- [ ] Verify existing features still work
- [ ] Test with actual users (if possible)

**Acceptance Criteria:**
- All features working on staging
- No deployment errors
- Existing features unaffected
- Stakeholders can test

**Task 1.6.2: User Acceptance Testing (UAT)**
- **Owner:** Product Manager + Key Users
- **Duration:** 8 hours (over 2 days)
- **Priority:** High
- **Dependencies:** Task 1.6.1

**Subtasks:**
- [ ] Prepare UAT checklist
- [ ] Invite key users to test
- [ ] Walk through new features
- [ ] Collect feedback
- [ ] Document issues
- [ ] Prioritize feedback
- [ ] Address critical UAT findings

**Acceptance Criteria:**
- Key users trained on new features
- Feedback documented
- Critical issues addressed
- User sign-off obtained

**Task 1.6.3: Phase 1 Documentation**
- **Owner:** Technical Writer/Developer
- **Duration:** 4 hours
- **Priority:** Medium
- **Dependencies:** Phase 1 complete

**Subtasks:**
- [ ] Document new API endpoints
- [ ] Update user manual
- [ ] Create change log
- [ ] Document database changes
- [ ] Update system architecture docs
- [ ] Create release notes

**Acceptance Criteria:**
- All documentation updated
- API docs complete and accurate
- Change log published
- Release notes ready

### Phase 1 Deliverables Summary

- ✅ Database schema extended successfully
- ✅ Enhanced order creation with brand, checked_by, category
- ✅ Express service pricing implemented
- ✅ Improved receipt system with QR codes
- ✅ Terms & Conditions page created
- ✅ All features tested and deployed to staging
- ✅ User acceptance testing complete
- ✅ Documentation updated

### Phase 1 Success Criteria

- [ ] All order creation enhancements working
- [ ] Express pricing calculating correctly
- [ ] Receipts printing with all new elements
- [ ] QR codes scannable
- [ ] Zero critical bugs
- [ ] Existing features unaffected
- [ ] Staging deployment successful
- [ ] User sign-off obtained

---

## Phase 2: Business Automation (Weeks 4-6)

### Phase Objectives
- Implement delivery classification system
- Build rewash workflow
- Deploy automated reminder system
- Establish job scheduling infrastructure

### Week 4: Delivery Classification System

#### Sprint 2.1: Delivery Classification Backend (Days 1-3)

**Task 2.1.1: Create Deliveries Table**
- **Owner:** Database Developer
- **Duration:** 3 hours
- **Priority:** Critical
- **Dependencies:** Phase 1 complete

**Subtasks:**
- [ ] Create migration `007_create_deliveries_table.sql`
- [ ] Add indexes for performance
- [ ] Create Delivery model
- [ ] Test migration on staging
- [ ] Add rollback script

**Acceptance Criteria:**
- Deliveries table created
- Model accessible in code
- Migration tested successfully

**Task 2.1.2: Classification Algorithm**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** Task 2.1.1

**Subtasks:**
- [ ] Create classifyDelivery function
- [ ] Implement rules (garment count, weight, value)
- [ ] Make rules configurable (system_settings)
- [ ] Add default classification rules
- [ ] Create unit tests for classification
- [ ] Test edge cases
- [ ] Document algorithm logic

**Classification Rules:**
```javascript
Small Delivery (Motorcycle):
- ≤ 5 garments OR
- ≤ 10 kg OR
- ≤ KES 5,000

Bulk Delivery (Van):
- > 5 garments OR
- > 10 kg OR
- > KES 5,000
```

**Acceptance Criteria:**
- Classification algorithm works correctly
- Rules configurable in database
- Edge cases handled
- Unit tests pass

**Task 2.1.3: Delivery API Endpoints**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 2.1.2

**Endpoints to Create:**
- [ ] POST `/api/deliveries/classify` - Auto-classify delivery
- [ ] PUT `/api/deliveries/:id/override` - Manual override
- [ ] GET `/api/deliveries/pending` - Get pending deliveries
- [ ] PUT `/api/deliveries/:id/status` - Update delivery status
- [ ] GET `/api/deliveries/:id` - Get delivery details

**Acceptance Criteria:**
- All endpoints functional
- Authorization checks in place
- Validation working
- Error handling implemented

#### Sprint 2.2: Delivery Classification Frontend (Days 4-5)

**Task 2.2.1: Delivery Type Display**
- **Owner:** Frontend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** Task 2.1.3

**Subtasks:**
- [ ] Add delivery type badge to order summary
- [ ] Show classification on order creation
- [ ] Add visual indicators (Motorcycle/Van icons)
- [ ] Update order list view
- [ ] Add delivery type filter

**Acceptance Criteria:**
- Delivery type visible on orders
- Clear visual distinction
- Icons/badges display correctly

**Task 2.2.2: Manual Override Interface**
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** Task 2.2.1

**Subtasks:**
- [ ] Create override modal/form
- [ ] Require manager authorization
- [ ] Show auto-classification details
- [ ] Allow override selection
- [ ] Add override reason field
- [ ] Log override in audit trail
- [ ] Update UI after override

**Acceptance Criteria:**
- Managers can override classification
- Override requires authorization
- Reason captured and logged
- UI updates immediately

**Task 2.2.3: Delivery Dashboard**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Task 2.2.2

**Subtasks:**
- [ ] Create delivery tracking page
- [ ] Show pending deliveries list
- [ ] Display Small vs Bulk counts
- [ ] Add status filters
- [ ] Create delivery details view
- [ ] Add status update functionality
- [ ] Show classification statistics

**Acceptance Criteria:**
- Dashboard displays all deliveries
- Filters work correctly
- Status updates in real-time
- Statistics accurate

### Week 5: Rewash System

#### Sprint 2.3: Rewash Backend (Days 1-3)

**Task 2.3.1: Rewash Logic Implementation**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** None

**Subtasks:**
- [ ] Create rewash request validation
- [ ] Check 24-hour eligibility window
- [ ] Create linked order with "-R" suffix
- [ ] Set is_rewash flag
- [ ] Link to original order
- [ ] Add rewash reason field
- [ ] Update original order status
- [ ] Create rewash statistics query

**Acceptance Criteria:**
- Rewash only allowed within 24 hours
- New order linked to original
- Tagged as "REWASH"
- Original order updated

**Task 2.3.2: Rewash API Endpoints**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 2.3.1

**Endpoints to Create:**
- [ ] POST `/api/orders/rewash` - Create rewash request
- [ ] GET `/api/orders/:id/rewash-eligibility` - Check eligibility
- [ ] GET `/api/reports/rewash` - Rewash statistics
- [ ] GET `/api/staff/:id/rewash-rate` - Staff rewash metrics

**Acceptance Criteria:**
- All endpoints working
- Eligibility check accurate
- Statistics calculated correctly
- Staff metrics available

#### Sprint 2.4: Rewash Frontend (Days 4-5)

**Task 2.4.1: Rewash Button & Form**
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 2.3.2

**Subtasks:**
- [ ] Add "Rewash" button to order details
- [ ] Show button only if eligible
- [ ] Create rewash request modal
- [ ] Show original order details
- [ ] Allow garment selection (which items to rewash)
- [ ] Add reason dropdown/textarea
- [ ] Add customer complaint field
- [ ] Confirm and submit rewash

**Acceptance Criteria:**
- Button visible only when eligible
- Can select specific garments
- Reason required
- Submission creates new order

**Task 2.4.2: Rewash Tracking Interface**
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** Task 2.4.1

**Subtasks:**
- [ ] Add "REWASH" badge to order list
- [ ] Link rewash to original order
- [ ] Show rewash history on order
- [ ] Create rewash report page
- [ ] Show staff rewash metrics
- [ ] Add filters for rewash orders

**Acceptance Criteria:**
- Rewash orders clearly marked
- Link between orders visible
- Reports show accurate data
- Filters work correctly

### Week 6: Automated Reminder System

#### Sprint 2.5: Reminder System Backend (Days 1-3)

**Task 2.5.1: Create Reminders Infrastructure**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** None

**Subtasks:**
- [ ] Create migration `008_create_reminders_table.sql`
- [ ] Create Reminder model
- [ ] Install job scheduler (Bull, Agenda, or cron)
- [ ] Set up job queue
- [ ] Configure Redis (if using Bull)
- [ ] Create reminder templates
- [ ] Test job scheduling locally

**Acceptance Criteria:**
- Reminders table created
- Job scheduler configured
- Can schedule jobs
- Jobs execute on schedule

**Task 2.5.2: Reminder Scheduling Logic**
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** Task 2.5.1

**Subtasks:**
- [ ] Create reminder scheduler function
- [ ] Calculate reminder dates (7, 14, 30 days)
- [ ] Schedule reminders on order delivery
- [ ] Create monthly reminder loop (after 30 days)
- [ ] Create 90-day disposal check
- [ ] Integrate with SMS API
- [ ] Create SMS templates for each reminder type
- [ ] Handle SMS failures
- [ ] Log all sent reminders

**Reminder Templates:**
```
7-day: "Hi [Name], your order #[OrderNo] is ready! Collect at [Branch]. Lorenzo Dry Cleaners"
14-day: "Reminder: Order #[OrderNo] awaiting collection. Contact us: [Phone]"
30-day: "FINAL NOTICE: Order #[OrderNo] must be collected soon. Risk of disposal. [Phone]"
Monthly: "Order #[OrderNo] still awaiting collection. Please collect at [Branch]."
90-day (to GM): "Order #[OrderNo] ([Customer]) eligible for disposal. Approve via dashboard."
```

**Acceptance Criteria:**
- Reminders scheduled automatically
- SMS sent on schedule
- Failures logged and retried
- Templates render correctly

**Task 2.5.3: Disposal Workflow**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 2.5.2

**Subtasks:**
- [ ] Mark orders "Eligible for Disposal" at 90 days
- [ ] Create GM notification system
- [ ] Create disposal approval endpoint
- [ ] Update order status on approval
- [ ] Prevent accidental disposal
- [ ] Log disposal actions
- [ ] Send customer final notice

**Acceptance Criteria:**
- Orders marked at 90 days
- GM receives notifications
- Approval required before disposal
- All actions logged

#### Sprint 2.6: Reminder System Frontend (Days 4-5)

**Task 2.6.1: Reminder Dashboard**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Task 2.5.3

**Subtasks:**
- [ ] Create reminder management page
- [ ] Show scheduled reminders
- [ ] Display sent reminders
- [ ] Show failed reminders
- [ ] Add manual send button
- [ ] Show disposal eligible orders
- [ ] Create approval interface for GM

**Acceptance Criteria:**
- All reminders visible
- Can manually send reminders
- Disposal approvals easy to process
- Status updates in real-time

**Task 2.6.2: Reminder Settings**
- **Owner:** Frontend Developer
- **Duration:** 4 hours
- **Priority:** Low
- **Dependencies:** Task 2.6.1

**Subtasks:**
- [ ] Create reminder settings page
- [ ] Configure reminder intervals
- [ ] Enable/disable specific reminders
- [ ] Edit SMS templates
- [ ] Test configuration changes

**Acceptance Criteria:**
- Settings configurable
- Changes saved correctly
- Templates editable
- Can disable reminders

**Task 2.6.3: Testing & Integration**
- **Owner:** QA + All Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All Week 4-6 tasks

**Test Scenarios:**
- [ ] Delivery classification accuracy
- [ ] Manual override workflow
- [ ] Rewash request within 24 hours
- [ ] Rewash request after 24 hours (should fail)
- [ ] Reminder scheduling
- [ ] SMS sending (use test numbers)
- [ ] 90-day disposal workflow
- [ ] GM approval process

**Acceptance Criteria:**
- All features working together
- No integration issues
- SMS successfully sent
- Disposal workflow secure

### Phase 2 Deliverables Summary

- ✅ Delivery classification system operational
- ✅ Rewash system fully functional
- ✅ Automated reminder system deployed
- ✅ Job scheduler configured
- ✅ SMS integration working
- ✅ Disposal workflow with GM approval
- ✅ All features tested end-to-end

### Phase 2 Success Criteria

- [ ] Deliveries auto-classified correctly
- [ ] Managers can override classification
- [ ] Rewash requests working within 24h window
- [ ] Reminders sending on schedule
- [ ] SMS delivery confirmed
- [ ] 90-day disposal requires GM approval
- [ ] No critical bugs
- [ ] Performance acceptable

---

## Phase 3: Inventory & Vouchers (Weeks 7-9)

### Phase Objectives
- Build complete inventory management module
- Implement voucher system with approvals
- Create delivery notes system
- Establish multi-branch inventory tracking

### Week 7: Inventory Module Foundation

#### Sprint 3.1: Inventory Database & Backend (Days 1-3)

**Task 3.1.1: Inventory Database Setup**
- **Owner:** Database Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** Phase 2 complete

**Subtasks:**
- [ ] Create migration `009_create_inventory_table.sql`
- [ ] Create migration `010_create_inventory_transactions_table.sql`
- [ ] Add indexes for performance
- [ ] Create Inventory model
- [ ] Create InventoryTransaction model
- [ ] Test migrations on staging

**Acceptance Criteria:**
- Both tables created successfully
- Models accessible in code
- Indexes in place
- Migration tested

**Task 3.1.2: Inventory Core Logic**
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** Task 3.1.1

**Subtasks:**
- [ ] Create stock in function
- [ ] Create stock out function
- [ ] Create inter-branch transfer function
- [ ] Implement stock level calculations
- [ ] Create low stock alert logic
- [ ] Validate stock operations
- [ ] Prevent negative stock
- [ ] Create audit trail for all operations

**Acceptance Criteria:**
- Stock in/out working correctly
- Transfers between branches functional
- Low stock alerts triggered
- Cannot have negative stock
- All operations logged

**Task 3.1.3: Inventory API Endpoints**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 3.1.2

**Endpoints to Create:**
- [ ] GET `/api/inventory/branch/:id` - Get branch inventory
- [ ] POST `/api/inventory/stock-in` - Record stock in
- [ ] POST `/api/inventory/stock-out` - Record stock out
- [ ] POST `/api/inventory/transfer` - Inter-branch transfer
- [ ] GET `/api/inventory/alerts` - Get low stock alerts
- [ ] POST `/api/inventory/adjust` - Stock adjustment
- [ ] GET `/api/inventory/transactions` - Transaction history
- [ ] GET `/api/inventory/item/:id` - Item details

**Acceptance Criteria:**
- All endpoints functional
- Validation in place
- Authorization checks working
- Error handling complete

#### Sprint 3.2: Inventory Frontend (Days 4-5)

**Task 3.2.1: Inventory Dashboard**
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Task 3.1.3

**Subtasks:**
- [ ] Create inventory overview page
- [ ] Show current stock levels
- [ ] Display low stock alerts (highlighted)
- [ ] Add category filters
- [ ] Show stock value
- [ ] Add search functionality
- [ ] Create item details view
- [ ] Show transaction history per item

**Acceptance Criteria:**
- All inventory items visible
- Alerts prominently displayed
- Filters work correctly
- Search functional
- Transaction history accessible

**Task 3.2.2: Stock In/Out Forms**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 3.2.1

**Subtasks:**
- [ ] Create stock in form
- [ ] Create stock out form
- [ ] Add item selection
- [ ] Add quantity input
- [ ] Add reason/notes field
- [ ] Add reference number field
- [ ] Validate quantities
- [ ] Show confirmation
- [ ] Update dashboard after transaction

**Acceptance Criteria:**
- Forms easy to use
- Validation prevents errors
- Confirmation before submit
- Dashboard updates immediately

### Week 8: Inventory Reconciliation & Vouchers

#### Sprint 3.3: Inventory Reconciliation (Days 1-2)

**Task 3.3.1: Reconciliation Backend**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Week 7 complete

**Subtasks:**
- [ ] Create physical count entry endpoint
- [ ] Create reconciliation comparison function
- [ ] Calculate variances
- [ ] Generate variance report
- [ ] Create stock adjustment workflow
- [ ] Require auditor/manager approval for adjustments
- [ ] Log all reconciliation actions

**Acceptance Criteria:**
- Can enter physical counts
- Variances calculated correctly
- Approval required for large variances
- All actions logged

**Task 3.3.2: Reconciliation Frontend**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 3.3.1

**Subtasks:**
- [ ] Create reconciliation page
- [ ] Show system stock vs physical count
- [ ] Highlight variances
- [ ] Allow count entry per item
- [ ] Calculate variance automatically
- [ ] Submit for approval
- [ ] Show approval status
- [ ] Display variance report

**Acceptance Criteria:**
- Easy to enter physical counts
- Variances clearly visible
- Approval workflow clear
- Reports downloadable

#### Sprint 3.4: Voucher System (Days 3-5)

**Task 3.4.1: Voucher Database & Backend**
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** None (can parallel)

**Subtasks:**
- [ ] Create migration `011_create_vouchers_table.sql`
- [ ] Create Voucher model
- [ ] Implement voucher code generation (unique)
- [ ] Create QR code for vouchers
- [ ] Create voucher validation logic
- [ ] Implement single-use enforcement
- [ ] Create expiry date checking
- [ ] Build approval workflow

**Voucher Code Format:** `VCH-YYYYMMDD-XXXXX` (e.g., VCH-20250203-00001)

**Acceptance Criteria:**
- Vouchers table created
- Unique codes generated
- QR codes created
- Validation working
- Single-use enforced

**Task 3.4.2: Voucher API Endpoints**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 3.4.1

**Endpoints to Create:**
- [ ] POST `/api/vouchers/create` - Create voucher
- [ ] PUT `/api/vouchers/:id/approve` - GM approval
- [ ] POST `/api/vouchers/validate` - Validate code
- [ ] POST `/api/vouchers/:id/redeem` - Redeem voucher
- [ ] GET `/api/vouchers/pending-approval` - Pending vouchers
- [ ] GET `/api/vouchers/:code` - Get voucher details

**Acceptance Criteria:**
- All endpoints functional
- Call center vouchers require approval
- Redemption marks voucher as used
- Expired vouchers rejected

**Task 3.4.3: Voucher Frontend**
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Task 3.4.2

**Subtasks:**
- [ ] Create voucher creation form
- [ ] Add discount type selection (%, Fixed)
- [ ] Add discount value input
- [ ] Add expiry date picker
- [ ] Generate QR code on creation
- [ ] Display voucher code
- [ ] Create GM approval interface
- [ ] Create voucher validation at POS
- [ ] Apply discount during order creation
- [ ] Mark voucher as used

**Acceptance Criteria:**
- Easy to create vouchers
- QR codes generated
- GM approval workflow smooth
- Validation at POS works
- Discount applied correctly

### Week 9: Delivery Notes & Integration

#### Sprint 3.5: Delivery Notes System (Days 1-3)

**Task 3.5.1: Delivery Notes Database & Backend**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** None

**Subtasks:**
- [ ] Create migration `012_create_delivery_notes_table.sql`
- [ ] Create DeliveryNote model
- [ ] Implement note number generation
- [ ] Create tailor note generation logic
- [ ] Create inter-store transfer logic
- [ ] Add status tracking
- [ ] Create return tracking

**Note Number Formats:**
- Tailor: `TDN-YYYYMMDD-XXX`
- Transfer: `TRN-YYYYMMDD-XXX`

**Acceptance Criteria:**
- Delivery notes table created
- Note numbers unique
- Status tracking works
- Both note types supported

**Task 3.5.2: Delivery Notes API**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** Task 3.5.1

**Endpoints to Create:**
- [ ] POST `/api/delivery-notes/tailor` - Create tailor note
- [ ] POST `/api/delivery-notes/transfer` - Create transfer note
- [ ] PUT `/api/delivery-notes/:id/status` - Update status
- [ ] GET `/api/delivery-notes/pending` - Pending notes
- [ ] GET `/api/delivery-notes/:id/print` - Print note
- [ ] PUT `/api/delivery-notes/:id/receive` - Mark received

**Acceptance Criteria:**
- All endpoints working
- Status updates tracked
- Print generates PDF
- Receiving updates status

**Task 3.5.3: Delivery Notes Frontend**
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** Medium
- **Dependencies:** Task 3.5.2

**Subtasks:**
- [ ] Create tailor note form
- [ ] Create transfer note form
- [ ] Select orders for transfer
- [ ] Add expected return date
- [ ] Add authorization
- [ ] Create note tracking page
- [ ] Show note status
- [ ] Add receive/return functionality
- [ ] Print delivery note

**Acceptance Criteria:**
- Easy to create both note types
- Can select multiple orders
- Status visible
- Print function works
- Receiving updates orders

#### Sprint 3.6: Phase 3 Testing & Integration (Days 4-5)

**Task 3.6.1: Inventory Reports**
- **Owner:** Backend + Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** All inventory features complete

**Reports to Create:**
- [ ] Stock Valuation Report
- [ ] Usage Report
- [ ] Shrinkage Report
- [ ] Low Stock Report
- [ ] Transaction History Report

**Subtasks:**
- [ ] Create report generation endpoints
- [ ] Build report queries
- [ ] Design report layouts
- [ ] Add export to PDF
- [ ] Add export to Excel
- [ ] Create report scheduling (optional)

**Acceptance Criteria:**
- All reports generate correctly
- Data accurate
- Export functions work
- Reports printable

**Task 3.6.2: Voucher Reports**
- **Owner:** Backend + Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** Voucher system complete

**Reports to Create:**
- [ ] Vouchers Issued Report
- [ ] Vouchers Redeemed Report
- [ ] Voucher Usage Report
- [ ] Discount Impact Report

**Acceptance Criteria:**
- Reports show accurate data
- Can filter by date range
- Export functions work

**Task 3.6.3: End-to-End Testing**
- **Owner:** QA + All Developers
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** All Phase 3 features

**Test Scenarios:**
- [ ] Complete inventory workflow (stock in → use → low stock alert)
- [ ] Inter-branch transfer
- [ ] Inventory reconciliation with variance
- [ ] Voucher creation and approval
- [ ] Voucher redemption at POS
- [ ] Expired voucher rejection
- [ ] Already-used voucher rejection
- [ ] Tailor delivery note workflow
- [ ] Inter-store transfer workflow
- [ ] All reports generation
- [ ] Report exports

**Acceptance Criteria:**
- All workflows complete successfully
- No integration bugs
- Performance acceptable
- Reports accurate

### Phase 3 Deliverables Summary

- ✅ Complete inventory management system
- ✅ Multi-branch inventory tracking
- ✅ Inventory reconciliation with approvals
- ✅ Voucher system with QR codes
- ✅ GM approval workflow for vouchers
- ✅ Delivery notes (tailor & transfers)
- ✅ Inventory and voucher reports
- ✅ All features tested and integrated

### Phase 3 Success Criteria

- [ ] Inventory tracks stock accurately
- [ ] Low stock alerts working
- [ ] Inter-branch transfers functional
- [ ] Reconciliation identifies variances
- [ ] Vouchers generate correctly
- [ ] QR codes scannable
- [ ] GM approval required for call center vouchers
- [ ] Single-use enforcement works
- [ ] Delivery notes track items
- [ ] All reports accurate
- [ ] Zero critical bugs

---

## Phase 4: Role-Based Dashboards (Weeks 10-13)

### Phase Objectives
- Build General Manager Dashboard
- Create Finance Manager Dashboard
- Develop Auditor Dashboard
- Implement Logistics Manager Dashboard
- Establish approval workflow system
- Create comprehensive reporting suite

### Week 10: General Manager Dashboard

#### Sprint 4.1: GM Dashboard Foundation (Days 1-3)

**Task 4.1.1: Dashboard Database Setup**
- **Owner:** Database Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** Phase 3 complete

**Subtasks:**
- [ ] Create migration `013_create_targets_table.sql`
- [ ] Create migration `014_create_staff_performance_table.sql`
- [ ] Create Targets model
- [ ] Create StaffPerformance model
- [ ] Test migrations

**Acceptance Criteria:**
- Tables created successfully
- Models accessible
- Migrations tested

**Task 4.1.2: Targets System Backend**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 4.1.1

**Subtasks:**
- [ ] Create target setting function
- [ ] Support daily/weekly/monthly targets
- [ ] Support branch-level targets
- [ ] Support individual staff targets
- [ ] Calculate target achievement
- [ ] Create progress tracking
- [ ] Generate alerts for under-performance

**Acceptance Criteria:**
- Can set all target types
- Achievement calculated accurately
- Progress tracked in real-time
- Alerts generated

**Task 4.1.3: Targets API Endpoints**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 4.1.2

**Endpoints to Create:**
- [ ] POST `/api/gm/targets` - Set targets
- [ ] GET `/api/gm/targets` - Get all targets
- [ ] PUT `/api/gm/targets/:id` - Update target
- [ ] GET `/api/gm/targets/achievement` - Get achievement data
- [ ] GET `/api/gm/targets/alerts` - Get under-performance alerts

**Acceptance Criteria:**
- All endpoints functional
- Only GM can access
- Data validated
- Achievement calculation accurate

#### Sprint 4.2: Staff Performance System (Days 4-5)

**Task 4.2.1: Performance Tracking Backend**
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Task 4.1.3

**Subtasks:**
- [ ] Create performance calculation function
- [ ] Track orders booked per staff
- [ ] Track rewash rate per staff
- [ ] Track complaints per staff
- [ ] Track discounts issued per staff
- [ ] Calculate performance score
- [ ] Generate performance reports
- [ ] Create comparative analytics

**Performance Score Formula:**
```javascript
score = (ordersBooked * 10) - (rewashRate * 5) - (complaints * 15) - (discountsIssued * 2)
```

**Acceptance Criteria:**
- All metrics tracked accurately
- Performance score calculated correctly
- Comparative reports available
- Historical data preserved

**Task 4.2.2: Performance API Endpoints**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 4.2.1

**Endpoints to Create:**
- [ ] GET `/api/gm/staff-performance` - All staff metrics
- [ ] GET `/api/gm/staff-performance/:id` - Individual staff
- [ ] POST `/api/gm/staff-performance/evaluate` - Create evaluation
- [ ] GET `/api/gm/staff-performance/rankings` - Staff rankings
- [ ] GET `/api/gm/staff-performance/trends` - Performance trends

**Acceptance Criteria:**
- All endpoints working
- Metrics accurate
- Rankings correct
- Trends calculated properly

### Week 11: GM Dashboard Frontend & Audit Logs

#### Sprint 4.3: GM Dashboard UI (Days 1-3)

**Task 4.3.1: Dashboard Layout**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Week 10 complete

**Dashboard Sections:**
1. Overview Cards
   - [ ] Today's revenue
   - [ ] Weekly revenue
   - [ ] Monthly revenue
   - [ ] Active orders
   - [ ] Pending approvals

2. Targets Section
   - [ ] Set/view targets interface
   - [ ] Progress indicators (circular progress)
   - [ ] Achievement percentages
   - [ ] Under-performance alerts

3. Staff Performance Section
   - [ ] Staff performance table
   - [ ] Individual metrics
   - [ ] Performance scores
   - [ ] Rankings
   - [ ] Trend charts

4. Charts & Visualizations
   - [ ] Revenue trend (line chart)
   - [ ] Staff comparison (bar chart)
   - [ ] Service type distribution (pie chart)
   - [ ] Target achievement (gauge)

**Acceptance Criteria:**
- Dashboard loads quickly (<2s)
- All data displays correctly
- Charts interactive
- Responsive design

**Task 4.3.2: Staff Appraisal Interface**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 4.3.1

**Subtasks:**
- [ ] Create staff appraisal modal/page
- [ ] Show all performance metrics
- [ ] Display order history
- [ ] Show rewash incidents
- [ ] List complaints
- [ ] Display discount history
- [ ] Add notes/comments section
- [ ] Rating/scoring interface
- [ ] Save evaluation

**Acceptance Criteria:**
- All metrics visible
- Easy to navigate
- Can add notes
- Evaluation saved correctly

#### Sprint 4.4: Audit Logs System (Days 4-5)

**Task 4.4.1: Audit Logs Backend Enhancement**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Audit_logs table exists

**Subtasks:**
- [ ] Enhance audit log capture
- [ ] Log all order edits
- [ ] Log all voucher approvals
- [ ] Log all cash adjustments
- [ ] Log inventory changes
- [ ] Log system setting changes
- [ ] Log user permission changes
- [ ] Create audit search/filter function

**Acceptance Criteria:**
- All critical actions logged
- Logs immutable (append-only)
- Searchable and filterable
- Performance acceptable

**Task 4.4.2: Audit Logs Viewer**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 4.4.1

**Subtasks:**
- [ ] Create audit logs page
- [ ] Display logs in table format
- [ ] Add filters (date, user, action type)
- [ ] Add search functionality
- [ ] Show before/after values
- [ ] Highlight critical actions
- [ ] Add export functionality
- [ ] Pagination for large datasets

**Acceptance Criteria:**
- All logs visible
- Filters work correctly
- Search fast and accurate
- Export works
- Pagination smooth

### Week 12: Finance Manager & Auditor Dashboards

#### Sprint 4.5: Finance Manager Dashboard (Days 1-3)

**Task 4.5.1: Cash Out System Backend**
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** None

**Subtasks:**
- [ ] Create migration `015_create_cash_out_transactions_table.sql`
- [ ] Create CashOutTransaction model
- [ ] Implement cash out request creation
- [ ] Create GM approval workflow
- [ ] Track approval status
- [ ] Log all cash out transactions
- [ ] Create reports for cash outs

**Cash Out Types:**
- Uncollected Garments
- Discounts
- Compensation
- Order Cancellation

**Acceptance Criteria:**
- All cash out types supported
- GM approval required
- All transactions logged
- Reports available

**Task 4.5.2: Cash Out API Endpoints**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Task 4.5.1

**Endpoints to Create:**
- [ ] POST `/api/finance/cash-out/request` - Create request
- [ ] PUT `/api/finance/cash-out/:id/approve` - GM approval
- [ ] PUT `/api/finance/cash-out/:id/reject` - GM rejection
- [ ] GET `/api/finance/cash-out/pending` - Pending approvals
- [ ] GET `/api/finance/cash-out/history` - All transactions
- [ ] GET `/api/finance/dashboard` - Finance dashboard data

**Acceptance Criteria:**
- All endpoints working
- Authorization enforced
- Approval workflow complete
- History tracked

**Task 4.5.3: Finance Manager Dashboard UI**
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Task 4.5.2

**Dashboard Sections:**
1. Overview
   - [ ] Daily cash position
   - [ ] Outstanding payments
   - [ ] Pending approvals count
   - [ ] Monthly cash out summary

2. Cash Out Interface
   - [ ] Create cash out request form
   - [ ] Select transaction type
   - [ ] Enter amount and reason
   - [ ] Attach evidence (optional)
   - [ ] Submit for approval

3. Approval Queue (for GM viewing on finance page)
   - [ ] List pending approvals
   - [ ] Show request details
   - [ ] Approve/reject buttons
   - [ ] Add approval notes

4. Financial Reports
   - [ ] Access to financial reports
   - [ ] Daily revenue
   - [ ] Payment method analysis
   - [ ] Outstanding balances
   - [ ] Cash out summary

**Acceptance Criteria:**
- All sections functional
- Easy to create requests
- GM can approve from dashboard
- Reports accurate

#### Sprint 4.6: Auditor Dashboard (Days 4-5)

**Task 4.6.1: Auditor Access Control**
- **Owner:** Backend Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** None

**Subtasks:**
- [ ] Create Auditor role permissions (read-only)
- [ ] Restrict write access
- [ ] Grant access to all financial data
- [ ] Grant access to all audit logs
- [ ] Grant access to inventory reconciliation
- [ ] Create auditor-specific endpoints

**Acceptance Criteria:**
- Auditors have read-only access
- Cannot modify any data
- Can view all reports
- Can export data

**Task 4.6.2: Auditor Dashboard UI**
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Task 4.6.1

**Dashboard Sections:**
1. Financial Reports Access
   - [ ] Profit & Loss statement
   - [ ] Cash flow report
   - [ ] Revenue analysis
   - [ ] Expense breakdown
   - [ ] Payment method analysis

2. Inventory Reconciliation
   - [ ] View reconciliation history
   - [ ] Variance analysis
   - [ ] Approve/reject adjustments
   - [ ] Export reconciliation reports

3. Audit Logs
   - [ ] Comprehensive audit trail
   - [ ] Advanced filtering
   - [ ] Variance tracking
   - [ ] Anomaly detection

4. Reports Export
   - [ ] Export all reports
   - [ ] Schedule reports (optional)
   - [ ] Generate custom reports

**Acceptance Criteria:**
- All reports accessible
- Read-only enforced
- Export functions work
- Interface user-friendly

### Week 13: Logistics Manager Dashboard & Integration

#### Sprint 4.7: Logistics Manager Dashboard (Days 1-3)

**Task 4.7.1: Delivery Tracking Enhancement**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** Delivery system from Phase 2

**Subtasks:**
- [ ] Enhance delivery status tracking
- [ ] Add driver assignment
- [ ] Create route tracking (basic)
- [ ] Add delivery time tracking
- [ ] Calculate delivery metrics
- [ ] Create delivery reports

**Acceptance Criteria:**
- All deliveries tracked
- Status updates in real-time
- Metrics calculated accurately
- Reports available

**Task 4.7.2: Complaint Management Backend**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** None

**Subtasks:**
- [ ] Create Complaints table
- [ ] Create Complaint model
- [ ] Implement complaint logging
- [ ] Create complaint categories
- [ ] Add resolution workflow
- [ ] Track complaint status
- [ ] Link complaints to orders/deliveries

**Complaint Categories:**
- Late delivery
- Wrong address
- Damaged items during delivery
- Missing items
- Poor driver conduct
- Delivery fee disputes

**Acceptance Criteria:**
- Complaints logged correctly
- Status tracking works
- Resolution workflow complete
- Linked to relevant records

**Task 4.7.3: Logistics Dashboard UI**
- **Owner:** Frontend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Tasks 4.7.1, 4.7.2

**Dashboard Sections:**
1. Delivery Tracking
   - [ ] Pending deliveries list
   - [ ] In-progress deliveries
   - [ ] Completed deliveries
   - [ ] Failed deliveries
   - [ ] Delivery status map (optional)

2. Delivery Classification Overview
   - [ ] Small vs Bulk distribution
   - [ ] Classification accuracy
   - [ ] Override rate
   - [ ] Cost analysis

3. Driver Management
   - [ ] Active drivers
   - [ ] Driver assignments
   - [ ] Driver performance
   - [ ] Driver ratings

4. Complaint Management
   - [ ] Open complaints
   - [ ] Complaint details
   - [ ] Resolution interface
   - [ ] Complaint history
   - [ ] Customer notifications

**Acceptance Criteria:**
- All deliveries visible
- Easy to manage drivers
- Complaints easy to resolve
- Metrics accurate

#### Sprint 4.8: Phase 4 Integration & Testing (Days 4-5)

**Task 4.8.1: Approval Workflow Testing**
- **Owner:** QA + Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All dashboards complete

**Test Workflows:**
- [ ] Voucher approval workflow
- [ ] Cash out approval workflow
- [ ] Disposal approval workflow
- [ ] Inventory adjustment approval
- [ ] Cross-role permissions
- [ ] Approval notifications

**Acceptance Criteria:**
- All approvals require GM
- Notifications sent
- Audit trail complete
- No permission bypasses

**Task 4.8.2: Dashboard Performance Testing**
- **Owner:** QA + Developers
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** All dashboards complete

**Performance Targets:**
- Dashboard load time: <2 seconds
- Report generation: <5 seconds
- Chart rendering: <1 second
- Filter/search: <500ms

**Subtasks:**
- [ ] Test each dashboard load time
- [ ] Profile slow queries
- [ ] Optimize as needed
- [ ] Add caching where appropriate
- [ ] Test with realistic data volumes

**Acceptance Criteria:**
- All dashboards meet performance targets
- No UI lag
- Reports generate quickly
- User experience smooth

**Task 4.8.3: End-to-End Dashboard Testing**
- **Owner:** QA + All Developers
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** All Phase 4 features

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
- [ ] All reports generate correctly
- [ ] All exports work

**Acceptance Criteria:**
- All workflows complete successfully
- No role permission issues
- All reports accurate
- No critical bugs

### Phase 4 Deliverables Summary

- ✅ General Manager Dashboard with targets & appraisals
- ✅ Finance Manager Dashboard with cash out system
- ✅ Auditor Dashboard with comprehensive access
- ✅ Logistics Manager Dashboard with delivery tracking
- ✅ Approval workflow system operational
- ✅ Comprehensive audit logging
- ✅ Staff performance tracking
- ✅ Complaint management system
- ✅ All dashboards tested and integrated

### Phase 4 Success Criteria

- [ ] All 4 role-based dashboards functional
- [ ] Approval workflows secure and audited
- [ ] Targets setting and tracking works
- [ ] Staff performance metrics accurate
- [ ] Cash out system requires GM approval
- [ ] Auditors have read-only access
- [ ] Delivery tracking operational
- [ ] Complaint resolution workflow smooth
- [ ] All reports generate correctly
- [ ] Performance targets met
- [ ] Zero critical bugs

---

## Phase 5: Advanced Features & Admin (Weeks 14-16)

### Phase Objectives
- Implement Super Admin controls
- Build auto-lock and shift control
- Complete enhanced reporting suite
- Finalize customer page enhancements
- System-wide security hardening

### Week 14: Super Admin Controls

#### Sprint 5.1: User Management System (Days 1-3)

**Task 5.1.1: User Creation Backend**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Roles system exists

**Subtasks:**
- [ ] Create user creation endpoint
- [ ] Implement role assignment
- [ ] Add branch assignment
- [ ] Set shift times
- [ ] Generate temporary password
- [ ] Send welcome email
- [ ] Create user activation flow
- [ ] Force password change on first login

**Acceptance Criteria:**
- Only Super Admin can create users
- All required fields validated
- Welcome email sent
- Password change enforced

**Task 5.1.2: Role & Permission Management**
- **Owner:** Backend Developer
- **Duration:** 10 hours
- **Priority:** Critical
- **Dependencies:** Task 5.1.1

**Subtasks:**
- [ ] Create permission structure (JSONB in roles table)
- [ ] Define permissions for each role
- [ ] Create permission checking middleware
- [ ] Implement role assignment endpoint
- [ ] Create permission update endpoint
- [ ] Add role hierarchy
- [ ] Log all permission changes

**Permission Structure Example:**
```javascript
{
  orders: { create: true, read: true, update: true, delete: false },
  customers: { create: true, read: true, update: true, delete: false },
  reports: { view: "all", export: true },
  approvals: { vouchers: true, cashOut: true },
  inventory: { view: true, adjust: true },
  branches: { access: ["own_branch"] }
}
```

**Acceptance Criteria:**
- All roles have defined permissions
- Permissions enforced on all endpoints
- Permission changes logged
- Hierarchy respected

**Task 5.1.3: Super Admin Dashboard UI**
- **Owner:** Frontend Developer
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** Tasks 5.1.1, 5.1.2

**Dashboard Sections:**
1. User Management
   - [ ] User list with roles
   - [ ] Create user form
   - [ ] Edit user interface
   - [ ] Deactivate/activate users
   - [ ] Reset password
   - [ ] Change role

2. Role Management
   - [ ] List all roles
   - [ ] View role permissions
   - [ ] Edit role permissions
   - [ ] Create custom roles (optional)

3. System Settings
   - [ ] Configurable settings interface
   - [ ] Inactivity timeout
   - [ ] Express multiplier
   - [ ] Reminder intervals
   - [ ] Disposal threshold
   - [ ] Delivery classification rules

4. Activity Monitoring
   - [ ] Active users
   - [ ] Recent logins
   - [ ] Failed login attempts
   - [ ] User activity logs

**Acceptance Criteria:**
- All user management functions work
- Role permissions editable
- System settings configurable
- Activity visible in real-time

#### Sprint 5.2: Approval Workflow Configuration (Days 4-5)

**Task 5.2.1: Workflow Configuration Backend**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Approval systems exist

**Subtasks:**
- [ ] Create workflow configuration table
- [ ] Define two-tier approval structure
- [ ] Make approval thresholds configurable
- [ ] Create workflow rules engine
- [ ] Add approval routing logic
- [ ] Support sequential approvals (GM → Director)

**Approval Rules:**
- Vouchers (from call center): GM approval
- Cash out (<KES 10,000): GM approval
- Cash out (>KES 10,000): GM + Director approval
- Large discounts (>10%): GM approval
- Inventory adjustments (>threshold): GM approval
- Staff role changes: Director approval

**Acceptance Criteria:**
- Rules configurable
- Routing works correctly
- Sequential approvals function
- Thresholds adjustable

**Task 5.2.2: Approval Configuration UI**
- **Owner:** Frontend Developer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** Task 5.2.1

**Subtasks:**
- [ ] Create approval rules management page
- [ ] Configure approval thresholds
- [ ] Set up approval routing
- [ ] Define escalation rules
- [ ] Test approval workflows

**Acceptance Criteria:**
- Rules easy to configure
- Changes take effect immediately
- Approval routing visible
- Testing confirms functionality

### Week 15: Security & Session Management

#### Sprint 5.3: Auto-Lock & Shift Control (Days 1-3)

**Task 5.3.1: Inactivity Detection Backend**
- **Owner:** Backend Developer
- **Duration:** 6 hours
- **Priority:** High
- **Dependencies:** None

**Subtasks:**
- [ ] Create session timeout configuration
- [ ] Implement activity tracking
- [ ] Create session lock endpoint
- [ ] Create session unlock endpoint
- [ ] Preserve session state during lock
- [ ] Log all lock/unlock events

**Acceptance Criteria:**
- Inactivity timeout configurable
- Sessions lock after timeout
- State preserved during lock
- Unlock requires re-authentication

**Task 5.3.2: Inactivity Detection Frontend**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 5.3.1

**Subtasks:**
- [ ] Implement activity listeners (mouse, keyboard)
- [ ] Create countdown timer
- [ ] Show warning modal (1 minute before lock)
- [ ] Lock screen UI
- [ ] Unlock form
- [ ] Reset activity timer on action
- [ ] Test across all pages

**Acceptance Criteria:**
- Detects user activity
- Warning shows before lock
- Lock screen prevents access
- Unlock restores session
- Works on all pages

**Task 5.3.3: Shift Control System**
- **Owner:** Backend + Frontend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** User shift times in database

**Backend Subtasks:**
- [ ] Create shift validation function
- [ ] Check shift end time
- [ ] Auto-logout at shift end
- [ ] Create manager override endpoint
- [ ] Log shift violations
- [ ] Send shift end warnings

**Frontend Subtasks:**
- [ ] Show shift time remaining
- [ ] Warning before shift end (5 minutes)
- [ ] Auto-logout at shift end
- [ ] Manager override modal
- [ ] Display shift status

**Acceptance Criteria:**
- Users auto-logged out at shift end
- Warning displayed
- Manager can override
- All violations logged

#### Sprint 5.4: Enhanced Reporting Suite (Days 4-5)

**Task 5.4.1: Advanced Report Generation**
- **Owner:** Backend Developer
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** Existing reporting infrastructure

**Reports to Complete/Enhance:**

1. **Express vs Normal Service Report**
   - [ ] Count comparison
   - [ ] Revenue comparison
   - [ ] Average order value
   - [ ] Conversion rate
   - [ ] Trend analysis

2. **Rewash Report** (already started in Phase 2)
   - [ ] Total rewash count
   - [ ] Rewash rate by staff
   - [ ] Rewash reasons breakdown
   - [ ] Cost impact analysis
   - [ ] Trend over time

3. **Delivery Type Report**
   - [ ] Small vs Bulk count
   - [ ] Cost analysis
   - [ ] Delivery success rate
   - [ ] Average delivery time
   - [ ] Driver performance

4. **Staff Performance Report**
   - [ ] Individual metrics
   - [ ] Team rankings
   - [ ] Performance trends
   - [ ] Top performers
   - [ ] Areas for improvement

5. **Voucher Usage Report**
   - [ ] Vouchers issued
   - [ ] Vouchers redeemed
   - [ ] Redemption rate
   - [ ] Discount impact on revenue
   - [ ] Most popular vouchers

6. **Revenue Reports** (enhance existing)
   - [ ] Daily revenue with breakdown
   - [ ] Weekly revenue with trends
   - [ ] Monthly revenue with comparison
   - [ ] Year-over-year analysis
   - [ ] Revenue by branch
   - [ ] Revenue by service type
   - [ ] Revenue by customer type

**Acceptance Criteria:**
- All reports generate correctly
- Data accurate
- Charts/visualizations included
- Export to PDF and Excel

**Task 5.4.2: Report Export Functions**
- **Owner:** Backend + Frontend Developer
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 5.4.1

**Subtasks:**
- [ ] Implement PDF export (all reports)
- [ ] Implement Excel export (all reports)
- [ ] Add company branding to PDFs
- [ ] Format Excel for readability
- [ ] Test all exports
- [ ] Add download progress indicators

**Acceptance Criteria:**
- PDF exports professional
- Excel exports formatted
- All reports exportable
- Downloads work on all browsers

### Week 16: Customer Enhancements & Final Polish

#### Sprint 5.5: Customer Page Enhancements (Days 1-2)

**Task 5.5.1: Customer Type & Loyalty Backend**
- **Owner:** Backend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Customer table extended

**Subtasks:**
- [ ] Implement customer type logic
- [ ] Create loyalty points calculation
- [ ] Points earning rules (% of order value)
- [ ] Points redemption logic
- [ ] Points expiry rules (optional)
- [ ] Update customer type endpoint
- [ ] Create loyalty points endpoints

**Loyalty Points Rules:**
- Regular: 1% of order value
- Corporate: 2% of order value
- VIP: 3% of order value
- Redemption: 1 point = KES 1

**Acceptance Criteria:**
- Customer types assignable
- Loyalty points calculated correctly
- Redemption works
- Points history tracked

**Task 5.5.2: Enhanced Customer Profile UI**
- **Owner:** Frontend Developer
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Task 5.5.1

**Profile Enhancements:**
- [ ] Customer type badge (Regular/Corporate/VIP)
- [ ] Loyalty points balance (large display)
- [ ] Last order date and details
- [ ] Days since last order
- [ ] Total lifetime value
- [ ] Order frequency stats
- [ ] Favorite services
- [ ] Preferred branch
- [ ] Payment method preference

**Quick Actions:**
- [ ] Create new order button
- [ ] View all orders
- [ ] Apply loyalty discount
- [ ] Send message/reminder
- [ ] Update customer type
- [ ] View account statement

**Acceptance Criteria:**
- All customer info displayed
- Quick actions work
- Loyalty points prominent
- Last order info accurate

#### Sprint 5.6: System-Wide Polish & Optimization (Days 3-5)

**Task 5.6.1: Performance Optimization**
- **Owner:** All Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** All features complete

**Optimization Areas:**
- [ ] Database query optimization
- [ ] Add missing indexes
- [ ] Implement caching (Redis)
- [ ] Optimize large reports
- [ ] Code minification
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Bundle size reduction

**Performance Targets:**
- Page load: <2 seconds
- API response: <500ms
- Report generation: <5 seconds
- Search/filter: <500ms

**Acceptance Criteria:**
- All targets met
- No performance regressions
- User experience smooth

**Task 5.6.2: UI/UX Refinement**
- **Owner:** Frontend Developer + Designer
- **Duration:** 10 hours
- **Priority:** Medium
- **Dependencies:** None

**Refinement Areas:**
- [ ] Consistent styling across all pages
- [ ] Improved error messages
- [ ] Loading indicators
- [ ] Success/error notifications
- [ ] Tooltips for complex features
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Keyboard shortcuts

**Acceptance Criteria:**
- Consistent look and feel
- User-friendly error messages
- Mobile experience good
- Accessibility standards met

**Task 5.6.3: Security Hardening**
- **Owner:** Backend Developer + Security Expert
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All features complete

**Security Checklist:**
- [ ] SQL injection prevention (verify)
- [ ] XSS protection (verify)
- [ ] CSRF tokens (implement)
- [ ] Rate limiting (implement)
- [ ] Input validation (all endpoints)
- [ ] Output sanitization
- [ ] Secure password storage (verify)
- [ ] Session security (verify)
- [ ] HTTPS enforcement
- [ ] Security headers
- [ ] Dependency vulnerability scan
- [ ] Penetration testing (basic)

**Acceptance Criteria:**
- All security measures in place
- No critical vulnerabilities
- Security scan passes
- Penetration test results acceptable

### Phase 5 Deliverables Summary

- ✅ Super Admin controls operational
- ✅ User and role management complete
- ✅ Auto-lock and shift control implemented
- ✅ Complete reporting suite with exports
- ✅ Customer enhancements (type & loyalty)
- ✅ System-wide performance optimization
- ✅ UI/UX refinements
- ✅ Security hardening complete

### Phase 5 Success Criteria

- [ ] Super Admin can manage all users and roles
- [ ] Permissions enforced system-wide
- [ ] Auto-lock works on inactivity
- [ ] Shift control auto-logs out users
- [ ] All 6+ report types generate correctly
- [ ] PDF and Excel exports work
- [ ] Customer types and loyalty points functional
- [ ] System meets performance targets
- [ ] No security vulnerabilities
- [ ] UI consistent and polished
- [ ] Zero critical bugs

---

## Phase 6: Testing & Refinement (Weeks 17-18)

### Phase Objectives
- Comprehensive integration testing
- User acceptance testing with actual users
- Performance testing and optimization
- Security testing and hardening
- Bug fixes and refinements
- Documentation finalization

### Week 17: Comprehensive Testing

#### Sprint 6.1: Integration Testing (Days 1-3)

**Task 6.1.1: End-to-End Workflow Testing**
- **Owner:** QA Lead + All Developers
- **Duration:** 20 hours (across all team members)
- **Priority:** Critical
- **Dependencies:** All features complete

**Critical Workflows to Test:**

1. **Complete Order Lifecycle**
   - [ ] Create order with all new fields
   - [ ] Select Express service (verify pricing)
   - [ ] Print receipt (verify QR code, T&C link, notice)
   - [ ] Classify delivery (verify auto-classification)
   - [ ] Assign delivery
   - [ ] Complete delivery
   - [ ] Trigger reminders (verify 7, 14, 30 days)
   - [ ] Test 90-day disposal workflow

2. **Rewash Workflow**
   - [ ] Create rewash request within 24 hours
   - [ ] Verify rewash request after 24 hours fails
   - [ ] Check rewash order linked to original
   - [ ] Verify rewash statistics

3. **Inventory Workflow**
   - [ ] Stock in items
   - [ ] Use inventory (stock out)
   - [ ] Trigger low stock alert
   - [ ] Inter-branch transfer
   - [ ] Physical count and reconciliation
   - [ ] Approve adjustment

4. **Voucher Workflow**
   - [ ] Create voucher (call center)
   - [ ] GM approval process
   - [ ] QR code generation
   - [ ] Voucher validation at POS
   - [ ] Apply discount to order
   - [ ] Verify single-use enforcement
   - [ ] Test expired voucher rejection

5. **Approval Workflows**
   - [ ] Voucher approval (call center → GM)
   - [ ] Cash out approval (<threshold: GM only)
   - [ ] Cash out approval (>threshold: GM → Director)
   - [ ] Disposal approval (90 days → GM)
   - [ ] Inventory adjustment approval

6. **Role-Based Access**
   - [ ] Test each role can access correct features
   - [ ] Test each role cannot access restricted features
   - [ ] Test permission enforcement on all endpoints
   - [ ] Test dashboard access by role

**Acceptance Criteria:**
- All workflows complete successfully
- No workflow breaks or errors
- All integrations working
- Permissions enforced correctly

**Task 6.1.2: Cross-Module Integration**
- **Owner:** QA + Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** Task 6.1.1

**Integration Points to Test:**
- [ ] Order → Receipt → Reminder
- [ ] Order → Delivery → Logistics Dashboard
- [ ] Order → Inventory (if consumables tracked per order)
- [ ] Voucher → Order → Finance Report
- [ ] Staff Action → Audit Log → GM Dashboard
- [ ] Customer → Loyalty Points → Discount
- [ ] Inventory → Reconciliation → Auditor Dashboard
- [ ] Cash Out → Approval → Finance Report

**Acceptance Criteria:**
- All modules communicate correctly
- Data flows accurately
- No integration bugs
- Performance acceptable

**Task 6.1.3: Data Integrity Testing**
- **Owner:** QA + Database Developer
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** None

**Tests:**
- [ ] Verify foreign key constraints
- [ ] Test database triggers (if any)
- [ ] Verify cascade deletes/updates
- [ ] Test transaction rollbacks
- [ ] Verify data consistency
- [ ] Test concurrent operations
- [ ] Verify audit trail completeness

**Acceptance Criteria:**
- Data integrity maintained
- No orphaned records
- Transactions atomic
- Audit trail complete

#### Sprint 6.2: Performance & Load Testing (Days 4-5)

**Task 6.2.1: Performance Testing**
- **Owner:** QA + Backend Developer
- **Duration:** 10 hours
- **Priority:** High
- **Dependencies:** Integration testing complete

**Performance Benchmarks:**
- [ ] Order creation: <500ms
- [ ] Order list (100 orders): <1s
- [ ] Dashboard load: <2s
- [ ] Report generation: <5s
- [ ] Receipt printing: <2s
- [ ] Search/filter: <500ms
- [ ] Database queries: <100ms average

**Tools:**
- Use tools like Apache JMeter, k6, or Lighthouse
- Test with realistic data volumes

**Subtasks:**
- [ ] Baseline all critical operations
- [ ] Profile slow queries
- [ ] Optimize as needed
- [ ] Re-test after optimization
- [ ] Document performance metrics

**Acceptance Criteria:**
- All operations meet performance targets
- No performance regressions
- Optimization complete

**Task 6.2.2: Load Testing**
- **Owner:** QA + DevOps
- **Duration:** 8 hours
- **Priority:** Medium
- **Dependencies:** Task 6.2.1

**Load Scenarios:**
- [ ] 10 concurrent users (normal load)
- [ ] 50 concurrent users (peak load)
- [ ] 100 concurrent users (stress test)
- [ ] Sustained load (1 hour)

**Tests:**
- [ ] Order creation under load
- [ ] Report generation under load
- [ ] Dashboard access under load
- [ ] Database performance under load
- [ ] API response times under load

**Acceptance Criteria:**
- System stable under peak load
- No crashes or timeouts
- Performance degradation acceptable
- Auto-scaling works (if implemented)

### Week 18: UAT & Bug Fixes

#### Sprint 6.3: User Acceptance Testing (Days 1-3)

**Task 6.3.1: UAT Preparation**
- **Owner:** Product Manager
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** All testing complete

**Subtasks:**
- [ ] Create UAT test plan
- [ ] Prepare UAT environment (staging)
- [ ] Create test scenarios for each role
- [ ] Prepare test data
- [ ] Schedule UAT sessions
- [ ] Invite actual users (POS, GM, Finance, etc.)
- [ ] Prepare feedback forms

**Acceptance Criteria:**
- UAT plan complete
- Environment ready
- Users scheduled
- Feedback mechanism in place

**Task 6.3.2: Conduct UAT Sessions**
- **Owner:** Product Manager + All Stakeholders
- **Duration:** 20 hours (over 3 days)
- **Priority:** Critical
- **Dependencies:** Task 6.3.1

**UAT Sessions by Role:**

1. **POS Attendant Session (4 hours)**
   - Test order creation with new fields
   - Test receipt printing
   - Test delivery classification
   - Test voucher redemption
   - Provide feedback

2. **Inspector Session (2 hours)**
   - Test quality checking workflow
   - Test rewash requests
   - Provide feedback

3. **General Manager Session (4 hours)**
   - Test GM dashboard
   - Test target setting
   - Test staff appraisals
   - Test approval workflows
   - Provide feedback

4. **Finance Manager Session (3 hours)**
   - Test finance dashboard
   - Test cash out system
   - Test financial reports
   - Provide feedback

5. **Auditor Session (2 hours)**
   - Test auditor dashboard
   - Test report access
   - Test audit logs
   - Provide feedback

6. **Logistics Manager Session (3 hours)**
   - Test logistics dashboard
   - Test delivery tracking
   - Test complaint management
   - Provide feedback

7. **Super Admin Session (2 hours)**
   - Test user management
   - Test system settings
   - Provide feedback

**Deliverable:** Comprehensive feedback report

**Task 6.3.3: Feedback Analysis & Prioritization**
- **Owner:** Product Manager + Lead Developer
- **Duration:** 4 hours
- **Priority:** High
- **Dependencies:** Task 6.3.2

**Subtasks:**
- [ ] Compile all feedback
- [ ] Categorize issues (Critical, High, Medium, Low)
- [ ] Prioritize bug fixes
- [ ] Identify UX improvements
- [ ] Create action items
- [ ] Assign to developers

**Acceptance Criteria:**
- All feedback documented
- Issues prioritized
- Action plan created
- Tasks assigned

#### Sprint 6.4: Bug Fixes & Refinements (Days 4-5)

**Task 6.4.1: Critical Bug Fixes**
- **Owner:** All Developers
- **Duration:** 12 hours
- **Priority:** Critical
- **Dependencies:** Task 6.3.3

**Process:**
- [ ] Fix all critical bugs first
- [ ] Test fixes thoroughly
- [ ] Verify no regressions
- [ ] Update documentation if needed
- [ ] Deploy fixes to staging
- [ ] Re-test on staging

**Acceptance Criteria:**
- Zero critical bugs remain
- All fixes tested
- No new bugs introduced

**Task 6.4.2: High-Priority Improvements**
- **Owner:** All Developers
- **Duration:** 8 hours
- **Priority:** High
- **Dependencies:** Task 6.4.1

**Improvements:**
- [ ] Implement high-priority UX feedback
- [ ] Fix high-priority bugs
- [ ] Improve error messages
- [ ] Add missing validations
- [ ] Enhance user guidance

**Acceptance Criteria:**
- All high-priority items addressed
- UX improvements implemented
- User feedback incorporated

**Task 6.4.3: Final Testing Round**
- **Owner:** QA + All Developers
- **Duration:** 8 hours
- **Priority:** Critical
- **Dependencies:** All fixes complete

**Final Tests:**
- [ ] Re-run all integration tests
- [ ] Re-test all critical workflows
- [ ] Verify all bug fixes
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Final performance check
- [ ] Final security check

**Acceptance Criteria:**
- All tests pass
- No regressions
- System stable
- Ready for production

### Phase 6 Deliverables Summary

- ✅ Comprehensive integration testing complete
- ✅ Performance and load testing passed
- ✅ User acceptance testing conducted
- ✅ All critical bugs fixed
- ✅ High-priority improvements implemented
- ✅ System stable and production-ready
- ✅ All stakeholders satisfied

### Phase 6 Success Criteria

- [ ] All integration tests passing
- [ ] Performance meets all targets
- [ ] Load testing successful
- [ ] UAT feedback positive
- [ ] Zero critical bugs
- [ ] All high-priority issues addressed
- [ ] No regressions from fixes
- [ ] System approved for production
- [ ] Documentation complete

---

## Phase 7: Training & Deployment (Weeks 19-20)

### Phase Objectives
- Prepare comprehensive training materials
- Conduct role-specific training sessions
- Deploy to production with zero downtime
- Provide on-site support
- Monitor system post-launch
- Gather feedback for future improvements

### Week 19: Training & Preparation

#### Sprint 7.1: Training Material Development (Days 1-2)

**Task 7.1.1: User Manuals Creation**
- **Owner:** Technical Writer + Developers
- **Duration:** 12 hours
- **Priority:** High
- **Dependencies:** System finalized

**Manuals to Create:**

1. **POS Attendant Manual**
   - [ ] Order creation with new fields
   - [ ] Brand and "No Brand" usage
   - [ ] Express vs Normal selection
   - [ ] Receipt printing
   - [ ] Voucher redemption
   - [ ] Delivery classification
   - [ ] Common troubleshooting

2. **Inspector Manual**
   - [ ] Quality checking process
   - [ ] Rewash request creation
   - [ ] Tag printing
   - [ ] Common issues

3. **General Manager Manual**
   - [ ] Dashboard navigation
   - [ ] Target setting
   - [ ] Staff appraisals
   - [ ] Approval workflows
   - [ ] Report generation
   - [ ] System settings

4. **Finance Manager Manual**
   - [ ] Cash out requests
   - [ ] Approval process
   - [ ] Financial reports
   - [ ] Payment reconciliation

5. **Auditor Manual**
   - [ ] Report access
   - [ ] Audit log review
   - [ ] Inventory reconciliation
   - [ ] Variance analysis

6. **Logistics Manager Manual**
   - [ ] Delivery tracking
   - [ ] Driver management
   - [ ] Complaint resolution
   - [ ] Route planning

7. **Super Admin Manual**
   - [ ] User management
   - [ ] Role configuration
   - [ ] System settings
   - [ ] Backup and restore

**Format:** PDF with screenshots and step-by-step instructions

**Acceptance Criteria:**
- All manuals complete
- Clear and easy to follow
- Screenshots included
- PDF formatted professionally

**Task 7.1.2: Video Tutorials**
- **Owner:** Technical Writer + Developer
- **Duration:** 10 hours
- **Priority:** Medium
- **Dependencies:** Task 7.1.1

**Videos to Create:**
- [ ] Order creation walkthrough (5 min)
- [ ] Receipt printing and QR codes (3 min)
- [ ] Delivery classification (4 min)
- [ ] Rewash process (4 min)
- [ ] Inventory management basics (8 min)
- [ ] Voucher creation and redemption (6 min)
- [ ] GM Dashboard overview (10 min)
- [ ] Report generation and export (5 min)

**Acceptance Criteria:**
- All videos recorded
- Clear audio and video quality
- Hosted on accessible platform
- Linked from user manuals

**Task 7.1.3: Quick Reference Guides**
- **Owner:** Technical Writer
- **Duration:** 6 hours
- **Priority:** Medium
- **Dependencies:** None

**Quick Guides (1-2 pages each):**
- [ ] Order creation cheat sheet
- [ ] Keyboard shortcuts
- [ ] Common error messages
- [ ] Troubleshooting guide
- [ ] Contact information

**Acceptance Criteria:**
- Printable format
- Laminated copies for staff
- Digital copies available

#### Sprint 7.2: Training Sessions (Days 3-5)

**Task 7.2.1: POS Attendants & Inspectors Training**
- **Owner:** Lead Developer + Trainer
- **Duration:** 8 hours (2 days, 4 hours each)
- **Priority:** Critical
- **Dependencies:** Training materials complete

**Day 1 - POS Attendants (4 hours):**
- Introduction and overview (30 min)
- Order creation hands-on (1 hour)
- Receipt printing practice (30 min)
- Voucher redemption (30 min)
- Delivery classification (30 min)
- Q&A and practice (1 hour)

**Day 2 - Inspectors (4 hours):**
- Introduction and role overview (30 min)
- Quality checking process (1 hour)
- Rewash workflow (1 hour)
- Tag printing (30 min)
- Q&A and practice (1 hour)

**Acceptance Criteria:**
- All POS staff trained
- All inspectors trained
- Hands-on practice completed
- Questions answered

**Task 7.2.2: Managers Training**
- **Owner:** Lead Developer + Project Manager
- **Duration:** 8 hours (2 days, 4 hours each)
- **Priority:** Critical
- **Dependencies:** Training materials complete

**Day 1 - GM & Finance Manager (4 hours):**
- GM Dashboard walkthrough (1.5 hours)
- Target setting and tracking (30 min)
- Staff appraisals (30 min)
- Approval workflows (1 hour)
- Finance Manager features (30 min)

**Day 2 - Logistics & Auditor (4 hours):**
- Logistics Dashboard (1.5 hours)
- Delivery tracking and management (1 hour)
- Complaint resolution (30 min)
- Auditor features overview (1 hour)

**Acceptance Criteria:**
- All managers trained
- Dashboard navigation comfortable
- Approval process understood
- Reports generation mastered

**Task 7.2.3: Super Admin Training**
- **Owner:** Lead Developer
- **Duration:** 4 hours (1 day)
- **Priority:** High
- **Dependencies:** Training materials complete

**Training Agenda:**
- User management (1 hour)
- Role and permission configuration (1 hour)
- System settings management (1 hour)
- Troubleshooting and support (1 hour)

**Acceptance Criteria:**
- Super Admin fully trained
- Can manage all system aspects
- Understands troubleshooting
- Comfortable with all features

#### Sprint 7.3: Pre-Deployment Preparation (Day 5)

**Task 7.3.1: Final Staging Review**
- **Owner:** QA + Lead Developer
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** All training complete

**Review Checklist:**
- [ ] All features working on staging
- [ ] All bugs fixed
- [ ] All training complete
- [ ] Documentation finalized
- [ ] Database migration scripts ready
- [ ] Rollback plan ready
- [ ] Backup scripts tested
- [ ] Monitoring tools configured

**Acceptance Criteria:**
- Staging environment perfect replica of production
- All stakeholders satisfied
- Green light for production deployment

**Task 7.3.2: Deployment Checklist Preparation**
- **Owner:** DevOps + Lead Developer
- **Duration:** 2 hours
- **Priority:** Critical
- **Dependencies:** Task 7.3.1

**Checklist Items:**
- [ ] Notify all users of maintenance window
- [ ] Backup production database
- [ ] Test backup restore
- [ ] Prepare migration scripts
- [ ] Prepare rollback scripts
- [ ] Configure monitoring alerts
- [ ] Prepare emergency contacts list
- [ ] Schedule deployment time (off-peak hours)

**Acceptance Criteria:**
- Checklist complete
- All stakeholders notified
- Deployment plan clear
- Emergency procedures ready

### Week 20: Production Deployment & Support

#### Sprint 7.4: Production Deployment (Days 1-2)

**Task 7.4.1: Database Migration**
- **Owner:** Database Developer + DevOps
- **Duration:** 4 hours
- **Priority:** Critical
- **Dependencies:** All preparation complete

**Migration Steps:**
1. [ ] Announce system maintenance (1 hour before)
2. [ ] Stop application gracefully
3. [ ] Backup production database (full backup)
4. [ ] Verify backup integrity
5. [ ] Run migration scripts sequentially
6. [ ] Verify all migrations successful
7. [ ] Test rollback (on backup copy)
8. [ ] Sanity check migrated data

**Timeline:**
- Maintenance window: 4 hours (e.g., 2 AM - 6 AM)
- Expected duration: 2-3 hours
- Buffer: 1-2 hours

**Acceptance Criteria:**
- All migrations successful
- Data integrity maintained
- Rollback tested
- Database ready for new code

**Task 7.4.2: Application Deployment**
- **Owner:** DevOps + Lead Developer
- **Duration:** 3 hours
- **Priority:** Critical
- **Dependencies:** Task 7.4.1

**Deployment Steps:**
1. [ ] Deploy new application code
2. [ ] Update environment variables
3. [ ] Install new dependencies
4. [ ] Configure job scheduler (for reminders)
5. [ ] Start application
6. [ ] Verify all services running
7. [ ] Run smoke tests
8. [ ] Test critical workflows
9. [ ] Verify existing features work

**Smoke Tests:**
- [ ] Login works
- [ ] Create order
- [ ] Print receipt
- [ ] View dashboard (each role)
- [ ] Generate report
- [ ] Send test reminder
- [ ] Test voucher redemption

**Acceptance Criteria:**
- Application deployed successfully
- All services running
- Smoke tests passed
- No errors in logs

**Task 7.4.3: Go-Live & Monitoring**
- **Owner:** All Team + DevOps
- **Duration:** 6 hours (Day 2)
- **Priority:** Critical
- **Dependencies:** Task 7.4.2

**Go-Live Checklist:**
- [ ] Open system to users
- [ ] Send "system ready" notification
- [ ] Monitor error logs actively
- [ ] Watch system performance
- [ ] Track user activity
- [ ] Monitor database performance
- [ ] Be ready for quick fixes
- [ ] Collect initial feedback

**Monitoring (First 6 hours):**
- Error rate
- Response times
- Database connections
- Job scheduler
- SMS delivery
- Receipt printing
- User logins
- Feature usage

**Acceptance Criteria:**
- System stable
- Users can access
- No critical errors
- Performance acceptable
- All features working

#### Sprint 7.5: On-Site Support (Days 3-5)

**Task 7.5.1: On-Site Presence**
- **Owner:** Lead Developer + Support Team
- **Duration:** 3 days (8 hours each)
- **Priority:** High
- **Dependencies:** Go-live complete

**Day 3-5 Activities:**
- [ ] Be on-site for immediate support
- [ ] Help users with any issues
- [ ] Monitor system continuously
- [ ] Quick bug fixes
- [ ] Answer questions
- [ ] Collect feedback
- [ ] Document issues
- [ ] Train on-the-fly if needed

**Acceptance Criteria:**
- Support provided
- Issues resolved quickly
- Users comfortable with system
- Feedback documented

**Task 7.5.2: Issue Triage & Resolution**
- **Owner:** All Developers
- **Duration:** Ongoing (3 days)
- **Priority:** Critical
- **Dependencies:** None

**Issue Categories:**
1. **Critical (fix immediately)**
   - System down
   - Cannot create orders
   - Cannot print receipts
   - Data loss

2. **High (fix within 4 hours)**
   - Feature not working
   - Performance issues
   - Report generation fails

3. **Medium (fix within 24 hours)**
   - UI issues
   - Minor bugs
   - UX improvements

4. **Low (schedule for later)**
   - Feature requests
   - Nice-to-have improvements

**Acceptance Criteria:**
- All critical issues resolved
- High-priority issues addressed
- Medium/low issues documented
- System stable

**Task 7.5.3: Feedback Collection**
- **Owner:** Product Manager
- **Duration:** Ongoing (3 days)
- **Priority:** Medium
- **Dependencies:** None

**Feedback Methods:**
- [ ] Daily check-ins with users
- [ ] Feedback forms
- [ ] Issue tracker
- [ ] Observation of usage
- [ ] Surveys (end of week 1)

**Feedback Topics:**
- Ease of use
- Performance
- Missing features
- Confusing workflows
- Training effectiveness
- Overall satisfaction

**Acceptance Criteria:**
- Feedback collected daily
- Issues documented
- User sentiment tracked
- Improvement areas identified

### Phase 7 Deliverables Summary

- ✅ Comprehensive training materials (manuals, videos, guides)
- ✅ All staff trained on their roles
- ✅ Production deployment successful
- ✅ System live and stable
- ✅ On-site support provided
- ✅ Initial issues resolved
- ✅ Feedback collected for future improvements

### Phase 7 Success Criteria

- [ ] All training sessions completed
- [ ] 100% staff trained
- [ ] Production deployment successful
- [ ] Zero downtime (or minimal, planned)
- [ ] All critical issues resolved within SLA
- [ ] System stable for 3 days
- [ ] User satisfaction >80%
- [ ] No data loss
- [ ] All features working in production
- [ ] Feedback positive overall

---

## Resource Allocation

### Team Structure

**Core Team:**
1. **Project Manager** (Ndururi or designated)
   - Overall project coordination
   - Stakeholder communication
   - Risk management
   - Timeline tracking
   - Resource allocation

2. **Lead Developer** (Full-Stack)
   - Technical leadership
   - Architecture decisions
   - Code reviews
   - Complex feature development
   - Team mentoring

3. **Backend Developer** (1-2 persons)
   - API development
   - Database design and migration
   - Business logic implementation
   - Integration development
   - Performance optimization

4. **Frontend Developer** (1-2 persons)
   - UI/UX implementation
   - Dashboard development
   - Form and validation logic
   - Responsive design
   - Component development

5. **Database Developer/DBA**
   - Database schema design
   - Migration scripts
   - Query optimization
   - Performance tuning
   - Backup and recovery

6. **QA Engineer**
   - Test planning
   - Test execution
   - Bug tracking
   - UAT coordination
   - Quality assurance

7. **DevOps Engineer** (part-time or as needed)
   - Environment setup
   - Deployment automation
   - Monitoring setup
   - Server management
   - Backup systems

8. **Technical Writer** (part-time)
   - User manuals
   - API documentation
   - Training materials
   - Video tutorials

**Extended Team:**
- UI/UX Designer (consultation)
- Security Expert (consultation)
- Lorenzo Dry Cleaners Subject Matter Experts
- Actual end users for UAT

### Time Allocation

**By Phase:**

| Phase | Duration | Developer Hours | Total Team Hours |
|-------|----------|----------------|------------------|
| Week 0 | 1 week | 40 | 80 |
| Phase 1 | 3 weeks | 240 | 360 |
| Phase 2 | 3 weeks | 240 | 360 |
| Phase 3 | 3 weeks | 240 | 360 |
| Phase 4 | 4 weeks | 320 | 480 |
| Phase 5 | 3 weeks | 240 | 360 |
| Phase 6 | 2 weeks | 160 | 240 |
| Phase 7 | 2 weeks | 80 | 160 |
| **Total** | **20 weeks** | **1,560** | **2,400** |

**Weekly Commitment:**
- Full-time: 40 hours/week
- Part-time: 20 hours/week
- Consultation: 4-8 hours/week

### Budget Considerations

**Development Costs:**
- Lead Developer: [Rate] × 20 weeks
- Backend Developer(s): [Rate] × 20 weeks
- Frontend Developer(s): [Rate] × 20 weeks
- Database Developer: [Rate] × 20 weeks
- QA Engineer: [Rate] × 20 weeks
- DevOps (part-time): [Rate] × 10 weeks
- Technical Writer (part-time): [Rate] × 8 weeks

**Infrastructure Costs:**
- Staging server: [Cost/month] × 5 months
- Development tools and licenses
- Testing tools
- SSL certificates
- Domain renewal (if needed)

**Third-Party Services:**
- SMS API costs (for reminders)
- Email service costs
- Payment gateway fees (if applicable)
- Cloud storage (for backups)

**Training & Support:**
- On-site support (Week 20)
- Training materials production
- Post-deployment support (4 weeks)

**Contingency:**
- 10-15% of total budget for unexpected costs

---

## Risk Management Plan

### Risk Matrix

| Risk ID | Risk Description | Probability | Impact | Severity | Mitigation Strategy |
|---------|-----------------|-------------|--------|----------|-------------------|
| R1 | Database migration fails | Low | Critical | High | Test migrations extensively, have rollback plan |
| R2 | Integration issues between modules | Medium | High | High | Continuous integration testing, early integration |
| R3 | Performance degradation | Medium | High | High | Performance testing, optimization, caching |
| R4 | User resistance to change | High | Medium | High | Comprehensive training, gradual rollout |
| R5 | Scope creep | High | Medium | High | Strict change management, prioritization |
| R6 | Key team member unavailable | Low | High | Medium | Knowledge sharing, documentation, backup resources |
| R7 | Third-party service failure | Low | Medium | Low | Fallback mechanisms, alternative providers |
| R8 | Security vulnerabilities | Low | Critical | High | Security testing, code reviews, penetration testing |
| R9 | Data loss during migration | Very Low | Critical | High | Multiple backups, tested restore procedures |
| R10 | Budget overrun | Medium | Medium | Medium | Regular budget tracking, early warning system |

### Mitigation Strategies

**R1: Database Migration Failure**
- **Prevention:**
  - Test all migrations on staging multiple times
  - Peer review migration scripts
  - Test with production data copy
- **Mitigation:**
  - Maintain detailed rollback scripts
  - Practice rollback procedure
  - Schedule migration during low-traffic period
  - Have database expert on standby

**R2: Integration Issues**
- **Prevention:**
  - Continuous integration testing
  - Early and frequent integration
  - API contract testing
  - Integration tests in CI/CD pipeline
- **Mitigation:**
  - Feature flags for gradual rollout
  - Modular architecture for isolation
  - Comprehensive logging for debugging

**R3: Performance Degradation**
- **Prevention:**
  - Performance testing in every phase
  - Code profiling
  - Query optimization
  - Caching strategy
- **Mitigation:**
  - Performance monitoring
  - Quick optimization patches
  - Scaling options (if needed)

**R4: User Resistance**
- **Prevention:**
  - Early user involvement (UAT)
  - Comprehensive training
  - Clear communication of benefits
  - Gradual feature introduction
- **Mitigation:**
  - Extended support period
  - Quick response to feedback
  - Additional training sessions
  - Champions program (power users)

**R5: Scope Creep**
- **Prevention:**
  - Strict change management process
  - Regular scope reviews
  - Prioritization framework
  - Stakeholder alignment
- **Mitigation:**
  - Move new requests to Phase 2 (post-launch)
  - Evaluate impact before accepting changes
  - Get formal approval for scope changes

### Risk Monitoring

**Weekly Risk Review:**
- Review risk matrix
- Update probabilities and impacts
- Identify new risks
- Review mitigation effectiveness
- Escalate high-severity risks

**Risk Escalation:**
- High severity: Immediate escalation to project sponsor
- Medium severity: Weekly review with project manager
- Low severity: Monitored and documented

---

## Quality Assurance Plan

### Quality Standards

**Code Quality:**
- [ ] Code follows established style guide
- [ ] All functions documented
- [ ] Complex logic has comments
- [ ] No hardcoded values
- [ ] Environment variables used for configuration
- [ ] Error handling comprehensive
- [ ] Code reviewed before merge

**Testing Requirements:**
- [ ] Unit test coverage >80%
- [ ] All critical paths have integration tests
- [ ] All features have E2E tests
- [ ] All bugs have regression tests
- [ ] Performance tests for critical operations

**Documentation Standards:**
- [ ] All API endpoints documented
- [ ] Database schema documented
- [ ] User manuals complete
- [ ] Code documentation up to date
- [ ] Change log maintained

### Quality Gates

**Phase Completion Gates:**

Each phase must meet these criteria before proceeding:
1. All features developed and tested
2. Code reviewed and merged
3. Documentation updated
4. Stakeholder demo and approval
5. Deployment to staging successful
6. No critical bugs outstanding

**Production Deployment Gate:**
1. All phases complete
2. UAT successful
3. All critical bugs fixed
4. Performance testing passed
5. Security testing passed
6. Training complete
7. Stakeholder sign-off
8. Rollback plan tested

### Code Review Process

**Review Checklist:**
- [ ] Code follows style guide
- [ ] No security vulnerabilities
- [ ] No performance issues
- [ ] Error handling adequate
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No breaking changes (or properly communicated)

**Review Process:**
1. Developer creates pull request
2. Automated tests run
3. Code reviewed by lead developer
4. Feedback addressed
5. Second review if major changes
6. Approval and merge

---

## Communication Plan

### Meetings Schedule

**Daily Standups (15 minutes)**
- **Time:** 9:00 AM (or agreed time)
- **Attendees:** All developers
- **Format:**
  - What did you do yesterday?
  - What will you do today?
  - Any blockers?

**Weekly Progress Review (1 hour)**
- **Time:** Every Monday at 2:00 PM
- **Attendees:** Full team + stakeholders
- **Agenda:**
  - Week's progress review
  - Upcoming week's plan
  - Blockers and risks
  - Demo of completed features
  - Q&A

**Sprint Planning (2 hours)**
- **Frequency:** Every 1-2 weeks (depending on sprint length)
- **Attendees:** Full team
- **Agenda:**
  - Review previous sprint
  - Plan next sprint tasks
  - Estimate effort
  - Assign tasks

**Phase Review Meetings (2 hours)**
- **Frequency:** End of each phase
- **Attendees:** Full team + all stakeholders
- **Agenda:**
  - Demo all phase features
  - Review achievements
  - Gather feedback
  - Sign-off for next phase

### Communication Channels

**Instant Messaging:**
- Platform: Slack/Discord/WhatsApp
- Channels:
  - #general: General discussion
  - #development: Technical discussions
  - #bugs: Bug reports and tracking
  - #deployments: Deployment notifications
  - #random: Non-work chat

**Email:**
- Weekly progress reports
- Stakeholder updates
- Formal approvals
- Documentation sharing

**Project Management Tool:**
- Task tracking
- Issue tracking
- Sprint planning
- Progress visualization

**Video Calls:**
- Daily standups (optional, if remote)
- Weekly reviews
- Phase reviews
- Training sessions
- Ad-hoc problem-solving

### Stakeholder Communication

**Weekly Update Email:**
- **To:** Management, project sponsor
- **Content:**
  - Progress this week
  - Completed tasks
  - Upcoming tasks
  - Risks and issues
  - Budget status
  - Next week's plan

**Monthly Executive Summary:**
- **To:** Senior management, directors
- **Content:**
  - Overall progress (% complete)
  - Major milestones achieved
  - Major milestones upcoming
  - Budget status
  - Key risks
  - Support needed

---

## Success Criteria

### Technical Success Metrics

**Functionality:**
- [ ] All 18 feature categories implemented
- [ ] All features working as specified in PRD
- [ ] Zero critical bugs in production
- [ ] <5 high-priority bugs in first month

**Performance:**
- [ ] Page load time <2 seconds
- [ ] API response time <500ms
- [ ] Report generation <5 seconds
- [ ] System uptime >99.5%

**Quality:**
- [ ] Code coverage >80%
- [ ] All tests passing
- [ ] Security scan passes
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

**Compatibility:**
- [ ] Backward compatible with existing system
- [ ] Works on all major browsers
- [ ] Mobile responsive
- [ ] Printer integration working

### Business Success Metrics

**Adoption:**
- [ ] 100% staff trained within 2 weeks
- [ ] 80% feature adoption within 1 month
- [ ] User satisfaction score >4/5
- [ ] <10 support tickets per week after month 1

**Operational Efficiency:**
- [ ] Order processing time reduced by 20%
- [ ] Inventory shrinkage reduced by 30%
- [ ] Rewash rate <2%
- [ ] On-time delivery rate >95%
- [ ] Customer reminder response rate >40%

**Financial:**
- [ ] Project completed within budget (±10%)
- [ ] ROI achieved within 12 months
- [ ] Operational cost reduction of 15%
- [ ] Revenue increase of 10% (from improved customer satisfaction)

### User Satisfaction Metrics

**Training:**
- [ ] 90% of users feel confident using the system
- [ ] Training materials rated >4/5
- [ ] <5 repeat questions per feature

**Usability:**
- [ ] System rated as easy to use (>4/5)
- [ ] Workflow feels natural (>4/5)
- [ ] Users prefer new system over old (>80%)

**Support:**
- [ ] Support response time <1 hour
- [ ] Issue resolution time <24 hours (critical)
- [ ] User feels supported (>4/5)

---

## Post-Launch Plan

### First Week Post-Launch

**Daily Activities:**
- [ ] Monitor system performance
- [ ] Track error logs
- [ ] Respond to support tickets
- [ ] Collect user feedback
- [ ] Quick bug fixes
- [ ] Daily check-in with users

**End of Week 1:**
- [ ] Generate usage report
- [ ] Compile feedback
- [ ] Identify priority issues
- [ ] Plan Week 2 fixes

### First Month Post-Launch

**Weeks 2-4:**
- [ ] Weekly check-ins with users
- [ ] Address all high-priority issues
- [ ] Continue monitoring
- [ ] Generate monthly report
- [ ] User satisfaction survey

**End of Month 1:**
- [ ] Comprehensive usage analysis
- [ ] Feature adoption report
- [ ] User satisfaction survey results
- [ ] ROI preliminary assessment
- [ ] Plan for future improvements

### Future Enhancements (Post-Launch)

**Potential Phase 2 Features:**
- Mobile app for customers
- Advanced analytics and AI insights
- Predictive inventory management
- Customer self-service portal
- Integration with accounting software
- Advanced route optimization
- Automated pricing suggestions
- Customer feedback system
- SMS two-way communication

**Continuous Improvement:**
- Regular feature updates
- Performance optimization
- Security patches
- User feedback implementation
- Quarterly reviews with stakeholders

---

## Appendices

### A. Glossary

**Technical Terms:**
- **API:** Application Programming Interface
- **CRUD:** Create, Read, Update, Delete
- **JWT:** JSON Web Token
- **ORM:** Object-Relational Mapping
- **UAT:** User Acceptance Testing
- **CI/CD:** Continuous Integration/Continuous Deployment

**Business Terms:**
- **GM:** General Manager
- **POS:** Point of Sale
- **KES:** Kenyan Shillings
- **ROI:** Return on Investment
- **SLA:** Service Level Agreement

### B. Reference Documents

- Laundry Management System Upgrade PRD v2.0
- claude.md - Project Technical Guide
- Existing System Documentation
- API Documentation
- Database Schema

### C. Tools & Technologies

**Development:**
- Version Control: Git/GitHub/GitLab
- IDE: VS Code, WebStorm, or preferred
- Database: PostgreSQL/MySQL (as per current system)
- Backend: (To be confirmed based on existing system)
- Frontend: (To be confirmed based on existing system)

**Testing:**
- Unit Testing: Jest, Mocha, or PyTest
- E2E Testing: Cypress, Selenium, or Playwright
- Load Testing: JMeter or k6
- API Testing: Postman, Insomnia

**Project Management:**
- Task Tracking: Jira, Trello, Asana, or GitHub Projects
- Communication: Slack, Discord, or WhatsApp
- Documentation: Google Docs, Confluence, or Notion

**DevOps:**
- Server: (To be confirmed - VPS/Cloud)
- Monitoring: (To be set up)
- Backup: (To be set up)

### D. Contact Information

**Project Team:**
- Project Manager: [Name, Email, Phone]
- Lead Developer: [Name, Email, Phone]
- Backend Developer: [Name, Email, Phone]
- Frontend Developer: [Name, Email, Phone]
- QA Engineer: [Name, Email, Phone]

**Client Stakeholders:**
- General Manager: [Name, Email, Phone]
- Director: [Name, Email, Phone]
- IT Contact: [Name, Email, Phone]

**Emergency Contacts:**
- On-call Developer: [Phone]
- System Administrator: [Phone]
- Project Sponsor: [Phone]

---

**Document Version:** 1.0  
**Last Updated:** February 3, 2025  
**Prepared By:** Claude AI Assistant for Ndururi  
**Status:** Ready for Execution

**Next Action:** Fill in "Current System Architecture Documentation" in claude.md and schedule Week 0 kickoff meeting.

---

# End of Planning Document
