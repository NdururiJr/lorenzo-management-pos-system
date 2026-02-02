# Dry Cleaning Management System - Enhancement Project Planning

**Project Name**: Lorenzo Dry Cleaners System Enhancements - Phase 2  
**Project Type**: Feature Enhancement & Integration  
**Current System Status**: 65% Complete  
**Planning Date**: January 16, 2026  
**Planned Start Date**: TBD  
**Estimated Completion**: 30 weeks (~7 months)  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Project Scope](#project-scope)
4. [Implementation Phases](#implementation-phases)
5. [Pre-Implementation Checklist](#pre-implementation-checklist)
6. [Resource Requirements](#resource-requirements)
7. [Timeline & Milestones](#timeline--milestones)
8. [Risk Management](#risk-management)
9. [Success Criteria](#success-criteria)
10. [Integration Strategy](#integration-strategy)
11. [Communication Plan](#communication-plan)
12. [Appendices](#appendices)

---

## Executive Summary

### Project Goals

Enhance the existing Dry Cleaning Management System (65% complete) with 17 critical features across four domains:

1. **Customer Experience**: Automated quotations, flexible payments, loyalty rewards
2. **Operational Efficiency**: Multi-location coordination, quality control workflows
3. **Financial Management**: Advanced payment processing, comprehensive reporting
4. **Data Quality**: Customer segmentation, accurate legacy data migration

### Expected Outcomes

- **40%** reduction in operational bottlenecks
- **25%** improvement in customer satisfaction scores
- **15-20%** increase in repeat customer revenue through loyalty program
- **95%+** payment collection rate (up from 83%)
- **<5%** inter-branch processing delays (down from 22%)

### Critical Success Factors

✅ Seamless integration with existing 65% complete system  
✅ Zero breaking changes to existing functionality  
✅ Comprehensive codebase analysis before implementation  
✅ Phased rollout with testing between phases  
✅ Stakeholder buy-in and user training  

---

## Current State Assessment

### System Maturity: 65% Complete

**What Exists (Confirmed Required)**:
- [ ] Customer management system
- [ ] Order creation and tracking
- [ ] Branch management
- [ ] User authentication and authorization
- [ ] Basic order status workflow
- [ ] Payment recording (basic)
- [ ] Reporting infrastructure
- [ ] POS interface
- [ ] Database with established schema

**What's Missing (To Be Added)**:
- Automated quotation system
- Redo items tracking
- Defect notification workflows
- QC to customer service handover
- Partial payment support
- Multi-location routing automation
- M-Pesa/PDQ payment integration
- Loyalty points system
- Customer segmentation automation
- International phone support
- Load-based pricing
- Free delivery automation

### Technology Stack Discovery Required

**Before implementation starts, document:**

```markdown
## Backend
- Runtime & Version: [To be discovered]
- Framework: [To be discovered]
- Database: [To be discovered]
- ORM/Query Builder: [To be discovered]
- Authentication: [To be discovered]
- Testing Framework: [To be discovered]

## Frontend
- Framework: [To be discovered]
- State Management: [To be discovered]
- UI Library: [To be discovered]
- Form Handling: [To be discovered]

## Architecture
- Pattern: [To be discovered - Layered/DDD/etc.]
- File Organization: [To be discovered]
- API Structure: [To be discovered]
- Error Handling: [To be discovered]
```

**Action**: Create `EXISTING_STACK.md` during Pre-Implementation phase (Week 0)

---

## Project Scope

### In Scope

#### Phase 1: Quality Control & Data Foundation (6 weeks)
- [ ] **FR-002**: Redo Items Policy Management
- [ ] **FR-003**: Defect Notification Timelines
- [ ] **FR-004**: QC to Customer Service Handover
- [ ] **FR-008**: Order Status Terminology Update
- [ ] **FR-016**: Legacy Data Migration Accuracy

#### Phase 2: Multi-Location & Customer Data (8 weeks)
- [ ] **FR-005**: Partial & Advance Payment Handling
- [ ] **FR-006**: Front Desk to Workstation Routing
- [ ] **FR-007**: Inter-Branch Sorting & Processing Timelines
- [ ] **FR-014**: Foreign Phone Number Support
- [ ] **FR-015**: Load-Based Pricing (Kilograms)
- [ ] **FR-017**: Customer Segmentation & Criteria

#### Phase 3: Payments & Automation (10 weeks)
- [ ] **FR-001**: Automated Quotation System
- [ ] **FR-009**: Driver Payment Processing (M-Pesa STK Push / PDQ)
- [ ] **FR-012**: Payment Report Filtering
- [ ] **FR-013**: Free Pickup & Delivery Threshold Automation

#### Phase 4: Loyalty & Integration (6 weeks)
- [ ] **FR-010**: Home Cleaning System Access (POS Link)
- [ ] **FR-011**: Loyalty Points System

### Out of Scope

❌ Development of separate Home Cleaning system (only integration point)  
❌ Hardware procurement for PDQ machines  
❌ Marketing campaigns for loyalty program  
❌ POS UI redesign (only feature additions)  
❌ Mobile app redesign (only payment features)  

### Assumptions

1. Existing 65% of system is stable and tested
2. Database can be extended without major restructuring
3. Development team has access to all existing code
4. Staging environment mirrors production
5. Third-party API access (M-Pesa, SMS) can be obtained
6. Existing customers in database have valid data

### Constraints

- **No Downtime**: All deployments via feature flags
- **No Breaking Changes**: Existing APIs must remain functional
- **Budget**: Phased approach allows for budget allocation per phase
- **Training**: Must happen during business hours without closing branches

---

## Implementation Phases

### Phase 0: Pre-Implementation (Week 0 - Before starting Phase 1)

**Duration**: 1 week  
**Team**: Lead Developer + 1 Senior Developer

**Objectives**:
1. Complete codebase analysis
2. Document existing architecture
3. Create integration plan
4. Set up development environment
5. Establish testing strategy

**Deliverables**:
- [ ] `EXISTING_STACK.md` - Complete technology stack documentation
- [ ] `ARCHITECTURE.md` - Current system architecture documentation
- [ ] `INTEGRATION_POINTS.md` - Identified integration points for all 17 features
- [ ] `DATABASE_SCHEMA.md` - Current database schema documentation
- [ ] Development environment setup guide updated
- [ ] Testing strategy document
- [ ] Feature branch strategy finalized

**Exit Criteria**:
- ✅ All developers can run system locally
- ✅ Database schema fully documented
- ✅ Existing patterns and conventions documented
- ✅ Integration approach approved by tech lead
- ✅ Phase 1 detailed implementation plan created

---

### Phase 1: Quality Control & Data Foundation

**Duration**: 6 weeks  
**Priority**: High  
**Dependencies**: None (can start immediately after Phase 0)

#### Week 1-2: Database & Backend Foundation

**FR-008**: Order Status Terminology Update
- Days 1-2: Database migration planning
- Days 3-4: Create and test migration (rename 'Ready' → 'Queued for Delivery')
- Day 5: Update all backend references
- Day 6: Update API responses
- Day 7-8: Update frontend displays
- Day 9-10: Testing and validation

**FR-016**: Legacy Data Migration (Parallel track)
- Week 1: Data mapping and validation rules
- Week 2: Migration script development and testing

**Sprint Deliverables**:
- [ ] Status terminology updated across system
- [ ] Migration scripts tested in dev environment
- [ ] All tests passing

#### Week 3-4: Redo Items & QC Workflows

**FR-002**: Redo Items Policy Management
- Days 1-3: Database schema (redo_items table)
- Days 4-6: Backend service implementation
- Days 7-9: API endpoints
- Day 10: Frontend QC form component
- Days 11-12: Dashboard metrics widget
- Days 13-14: Integration testing

**FR-003**: Defect Notification Timelines
- Days 1-2: Database schema (defect_notifications)
- Days 3-4: Notification service
- Days 5-6: Scheduled job for deadline checks
- Days 7-8: Frontend notification interface
- Days 9-10: Testing

**Sprint Deliverables**:
- [ ] QC staff can flag redo items
- [ ] Zero-charge redo orders generated automatically
- [ ] Defect timelines configured and enforced
- [ ] Dashboard shows redo metrics

#### Week 5-6: QC Handover & Migration Execution

**FR-004**: QC to Customer Service Handover
- Days 1-3: Handover database schema
- Days 4-6: Backend handover service
- Days 7-8: Real-time notification system
- Days 9-10: Frontend handover interface
- Days 11-12: Testing and refinement

**FR-016**: Legacy Data Migration Execution
- Day 13: Final migration testing in staging
- Day 14: Production migration execution
- Day 15: Validation and verification

**Sprint Deliverables**:
- [ ] QC can create formal handovers
- [ ] Customer service receives real-time notifications
- [ ] Legacy data migrated with <0.1% error rate
- [ ] Phase 1 complete and stable

**Phase 1 Exit Criteria**:
- ✅ All 5 features deployed to production
- ✅ Existing functionality unaffected
- ✅ All automated tests passing
- ✅ User acceptance testing completed
- ✅ Documentation updated
- ✅ Performance benchmarks met

---

### Phase 2: Multi-Location & Customer Data

**Duration**: 8 weeks  
**Priority**: High  
**Dependencies**: Phase 1 complete

#### Week 7-8: Payment System Enhancement

**FR-005**: Partial & Advance Payment Handling
- Days 1-3: Database schema (payments table, order totals)
- Days 4-7: Payment service implementation
- Days 8-10: Payment history tracking
- Days 11-12: Frontend payment interface
- Days 13-14: Receipt generation
- Day 15-16: Testing

**Sprint Deliverables**:
- [ ] Multiple payments per order supported
- [ ] Balance tracking functional
- [ ] Automated reminders configured

#### Week 9-11: Multi-Location Routing

**FR-006**: Front Desk to Workstation Routing
- Week 9 Days 1-4: Database schema (routing fields, manifests)
- Week 9 Days 5-8: Routing service implementation
- Week 9 Days 9-12: Manifest generation
- Week 10 Days 1-6: Frontend routing interface
- Week 10 Days 7-12: Testing and refinement

**FR-007**: Inter-Branch Sorting Timelines
- Week 11 Days 1-4: Sorting window configuration
- Week 11 Days 5-8: Timeline calculation service
- Week 11 Days 9-10: Delivery scheduling validation
- Week 11 Days 11-12: Frontend timeline display

**Sprint Deliverables**:
- [ ] Orders route automatically to correct branch
- [ ] Transfer manifests generated with barcodes
- [ ] 6-hour sorting window enforced
- [ ] Delivery scheduling respects timelines

#### Week 12-13: Customer Data Enhancement

**FR-014**: Foreign Phone Number Support
- Days 1-3: Database schema update (phone field expansion)
- Days 4-6: Phone validation service
- Days 7-9: Frontend phone input component
- Days 10-12: SMS routing by country code

**FR-015**: Load-Based Pricing
- Days 1-3: Database schema (weight fields, pricing rules)
- Days 4-7: Pricing calculation service
- Days 8-10: Capacity planning integration
- Days 11-12: Frontend weight input
- Days 13-14: Testing

**Sprint Deliverables**:
- [ ] International phone numbers supported
- [ ] Weight-based pricing functional
- [ ] Capacity planning considers load

#### Week 14: Customer Segmentation

**FR-017**: Customer Segmentation & Criteria
- Days 1-3: Database schema (segments, criteria)
- Days 4-6: Segmentation service
- Days 7-9: Automatic promotion logic
- Days 10-11: Reporting by segment
- Day 12: Scheduled job for evaluation

**Sprint Deliverables**:
- [ ] Customers automatically categorized (Regular/VIP/Corporate)
- [ ] VIP promotions automated
- [ ] Segment-based pricing applied

**Phase 2 Exit Criteria**:
- ✅ All 6 features deployed to production
- ✅ Multi-location workflows optimized
- ✅ Payment flexibility achieved
- ✅ Customer data quality improved
- ✅ All tests passing
- ✅ UAT completed

---

### Phase 3: Payments & Automation

**Duration**: 10 weeks  
**Priority**: High  
**Dependencies**: Phase 2 complete

#### Week 15-17: M-Pesa Integration

**External Dependency**: M-Pesa API access, credentials, sandbox

**FR-009**: Driver Payment Processing (Backend)
- Week 15 Days 1-5: M-Pesa API integration
- Week 15 Days 6-10: STK Push implementation
- Week 15 Days 11-12: Callback handling
- Week 16 Days 1-6: PDQ terminal integration
- Week 16 Days 7-12: Payment reconciliation
- Week 17 Days 1-4: Offline payment queue
- Week 17 Days 5-8: Error handling and retries
- Week 17 Days 9-12: Testing (sandbox)

**Sprint Deliverables**:
- [ ] M-Pesa STK Push functional
- [ ] PDQ integration complete
- [ ] Offline mode working
- [ ] Payment callbacks handled

#### Week 18-19: Mobile Driver App

**FR-009**: Driver Payment Processing (Mobile)
- Days 1-4: Mobile payment service
- Days 5-8: Payment UI screens
- Days 9-10: Offline sync implementation
- Days 11-12: Testing on actual devices

**Sprint Deliverables**:
- [ ] Drivers can initiate M-Pesa payments
- [ ] Drivers can process card payments
- [ ] Offline payments queue for sync

#### Week 20-22: Quotation System

**FR-001**: Automated Quotation System
- Week 20 Days 1-4: Database schema (quotations)
- Week 20 Days 5-8: Pricing calculation service
- Week 20 Days 9-12: Quotation generation
- Week 21 Days 1-4: PDF document generation
- Week 21 Days 5-8: Email/SMS delivery
- Week 21 Days 9-12: Approval workflow
- Week 22 Days 1-6: Frontend quotation interface
- Week 22 Days 7-12: Testing and refinement

**Sprint Deliverables**:
- [ ] Quotations generated automatically
- [ ] Sent within 2 minutes of order submission
- [ ] Customer can approve/reject via link
- [ ] Orders created from approved quotations

#### Week 23-24: Reporting & Automation

**FR-012**: Payment Report Filtering
- Days 1-4: Report query builder
- Days 5-8: Payment method filtering
- Days 9-10: Export functionality (CSV/Excel)
- Days 11-12: Frontend report interface

**FR-013**: Free Delivery Threshold Automation
- Days 1-3: Configuration system
- Days 4-6: Delivery fee calculation
- Days 7-9: Real-time threshold messaging
- Days 10-12: Testing

**Sprint Deliverables**:
- [ ] Payment reports filterable by method
- [ ] Export to CSV/Excel functional
- [ ] Free delivery applied automatically at threshold
- [ ] Proximity messaging encourages upsell

**Phase 3 Exit Criteria**:
- ✅ All 4 features deployed to production
- ✅ M-Pesa integration live and tested
- ✅ Mobile app payment features functional
- ✅ Quotation system operational
- ✅ All tests passing
- ✅ Security audit passed (PCI DSS for payments)

---

### Phase 4: Loyalty & Integration

**Duration**: 6 weeks  
**Priority**: Medium  
**Dependencies**: Phase 3 complete

#### Week 25-28: Loyalty Points System

**FR-011**: Loyalty Points System
- Week 25 Days 1-4: Database schema (points transactions, milestones)
- Week 25 Days 5-8: Points earning logic
- Week 25 Days 9-12: Points redemption logic
- Week 26 Days 1-4: Milestone detection
- Week 26 Days 5-8: Points expiration logic
- Week 26 Days 9-12: Scheduled jobs (expiry, evaluation)
- Week 27 Days 1-6: Frontend points balance display
- Week 27 Days 7-12: Redemption interface
- Week 28 Days 1-6: Admin dashboard for points management
- Week 28 Days 7-12: Testing and refinement

**Sprint Deliverables**:
- [ ] Points earned automatically (1 per 100 KES)
- [ ] Milestone bonuses awarded
- [ ] Points redeemable for discounts
- [ ] Expiration warnings sent 30 days before
- [ ] Admin can manage points and milestones

#### Week 29-30: Home Cleaning Integration & Final Testing

**FR-010**: Home Cleaning System Access
- Days 1-3: SSO token generation
- Days 4-6: Authentication handoff
- Days 7-9: POS button integration
- Days 10-12: Testing with Home Cleaning system

**Final Integration Testing**:
- Days 13-15: End-to-end testing of all features
- Days 16-18: Performance testing under load
- Days 19-21: Security audit
- Days 22-24: User acceptance testing
- Days 25-30: Bug fixes and final refinements

**Sprint Deliverables**:
- [ ] POS links to Home Cleaning system
- [ ] SSO authentication working
- [ ] All 17 features tested together
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed

**Phase 4 Exit Criteria**:
- ✅ All 17 features deployed to production
- ✅ Loyalty program launched
- ✅ Home Cleaning integration functional
- ✅ System running stable for 2 weeks
- ✅ <5 critical incidents during stability period
- ✅ All stakeholders signed off
- ✅ Training completed
- ✅ Documentation finalized

---

## Pre-Implementation Checklist

### Week 0: Discovery & Planning

#### Day 1-2: Codebase Analysis

**Backend Discovery**:
- [ ] Clone repository and ensure it runs locally
- [ ] Identify backend technology (Node.js/Python/PHP/etc.)
- [ ] Document framework (Express/NestJS/Django/Laravel/etc.)
- [ ] Find database configuration and connection
- [ ] Identify database type and version
- [ ] Document ORM/query builder in use
- [ ] Review existing service layer structure
- [ ] Document authentication mechanism
- [ ] Review existing middleware patterns
- [ ] Document error handling approach
- [ ] Review logging implementation
- [ ] Document testing framework and approach

**Frontend Discovery**:
- [ ] Identify frontend framework (React/Vue/Angular/etc.)
- [ ] Document state management approach
- [ ] Review component organization pattern
- [ ] Document UI library/design system
- [ ] Review form handling approach
- [ ] Document API integration pattern
- [ ] Review routing implementation
- [ ] Document styling approach (CSS/Tailwind/etc.)

**Database Discovery**:
- [ ] Export current database schema
- [ ] Document all existing tables
- [ ] Document column naming conventions (snake_case/camelCase)
- [ ] Document ID type (UUID/auto-increment)
- [ ] Document timestamp approach (created_at/createdAt)
- [ ] Review existing relationships and foreign keys
- [ ] Document existing indexes
- [ ] Review migration system in use
- [ ] Document any triggers or stored procedures

**Mobile Discovery** (if exists):
- [ ] Identify mobile framework (React Native/Flutter/Native)
- [ ] Document navigation approach
- [ ] Review state management
- [ ] Document offline storage mechanism
- [ ] Review push notification implementation

#### Day 3: Architecture Documentation

- [ ] Create `EXISTING_STACK.md` with all findings
- [ ] Document layered architecture (if applicable)
- [ ] Map existing API endpoints and patterns
- [ ] Document naming conventions (files, functions, variables)
- [ ] Document code organization pattern
- [ ] Review existing utilities and helpers
- [ ] Document dependency injection approach (if any)

#### Day 4: Integration Planning

- [ ] Review each of 17 features against existing code
- [ ] Identify which tables need extension vs creation
- [ ] Identify which services can be reused
- [ ] Identify which components can be reused
- [ ] Document integration points for each feature
- [ ] Create `INTEGRATION_POINTS.md`
- [ ] Flag any potential breaking changes
- [ ] Identify technical risks

#### Day 5: Development Environment

- [ ] Set up local development environment
- [ ] Verify all tests pass
- [ ] Set up database with sample data
- [ ] Configure environment variables
- [ ] Set up debugging tools
- [ ] Configure code editor/IDE with project standards
- [ ] Review and update `.env.example`

### Environment Setup Requirements

**Required Access**:
- [ ] Repository access (GitHub/GitLab/Bitbucket)
- [ ] Database access (development, staging)
- [ ] API documentation access
- [ ] Existing deployment documentation
- [ ] Design files/mockups (if available)
- [ ] M-Pesa sandbox credentials (Phase 3)
- [ ] PDQ terminal test environment (Phase 3)
- [ ] SMS gateway test credentials
- [ ] Email service test credentials

**Required Tools**:
- [ ] Git client
- [ ] Code editor (VS Code/WebStorm/etc.)
- [ ] Database client (pgAdmin/MySQL Workbench/etc.)
- [ ] API testing tool (Postman/Insomnia)
- [ ] Node.js/Python (matching project version)
- [ ] Docker (if used)
- [ ] Mobile development tools (if applicable)

---

## Resource Requirements

### Team Composition

**Core Team** (Full-time):
- **Tech Lead** (1): Architecture decisions, code review, technical guidance
- **Senior Backend Developer** (1): Complex integrations (M-Pesa, payment processing)
- **Backend Developer** (2): Feature implementation, API development
- **Frontend Developer** (2): UI components, state management
- **Mobile Developer** (1): Driver app payment features (Phase 3)
- **QA Engineer** (1): Test planning, automated testing, UAT coordination
- **DevOps Engineer** (0.5): Deployment, monitoring, infrastructure

**Supporting Team** (Part-time):
- **Product Owner** (0.25): Requirements clarification, prioritization
- **Database Administrator** (0.25): Schema review, migration support
- **UX/UI Designer** (0.25): Component design, user flows
- **Technical Writer** (0.25): Documentation

**Stakeholders** (As needed):
- Finance Manager: Payment features review
- Operations Manager: Workflow validation
- QC Supervisor: Quality control features
- Branch Managers: Multi-location testing
- Customer Service Lead: Handover workflow review

### Tools & Infrastructure

**Development**:
- [ ] Development environment for each developer
- [ ] Code repository (GitHub/GitLab)
- [ ] CI/CD pipeline
- [ ] Code quality tools (ESLint, Prettier, etc.)
- [ ] Testing frameworks
- [ ] Code coverage tools

**Testing**:
- [ ] Staging environment (mirrors production)
- [ ] Test data sets
- [ ] M-Pesa sandbox environment
- [ ] PDQ test terminals (2-3 units)
- [ ] Mobile test devices (Android & iOS)
- [ ] Load testing tools
- [ ] Security scanning tools

**Monitoring & Logging**:
- [ ] Application monitoring (New Relic/DataDog/etc.)
- [ ] Error tracking (Sentry/Rollbar)
- [ ] Log aggregation (ELK stack/CloudWatch)
- [ ] Performance monitoring
- [ ] Uptime monitoring

**Communication**:
- [ ] Project management tool (Jira/Linear/etc.)
- [ ] Communication platform (Slack/Teams)
- [ ] Documentation platform (Confluence/Notion)
- [ ] Video conferencing for standups

### Third-Party Services

**Required Integrations**:
- [ ] M-Pesa API (Safaricom Daraja API)
  - Consumer key & secret
  - Business shortcode
  - Passkey
  - Sandbox access
  
- [ ] PDQ Terminal Provider
  - SDK/API documentation
  - Test terminals
  - Merchant account
  
- [ ] SMS Gateway
  - API credentials
  - International delivery capability
  - Test credits
  
- [ ] Email Service (SendGrid/AWS SES)
  - API keys
  - Verified sender domain
  - Template system access

### Budget Considerations

**Development Costs** (30 weeks):
- Team salaries
- Third-party service fees (M-Pesa, SMS, Email)
- Infrastructure costs (servers, databases)
- Testing tools and devices
- Training materials

**One-Time Costs**:
- PDQ terminal hardware (3-5 units @ ~$300-500 each)
- M-Pesa integration setup fees
- Security audit
- Performance testing tools

**Ongoing Costs** (post-launch):
- Transaction fees (M-Pesa, card payments)
- SMS delivery charges
- Email service fees
- Infrastructure scaling
- Support and maintenance

---

## Timeline & Milestones

### High-Level Timeline

```
Week 0:    ████ Pre-Implementation (Discovery & Planning)
Week 1-6:  ████████████ Phase 1: Quality Control & Data
Week 7-14: ████████████████ Phase 2: Multi-Location & Customer Data
Week 15-24: ████████████████████ Phase 3: Payments & Automation
Week 25-30: ████████████ Phase 4: Loyalty & Integration
```

### Key Milestones

| Week | Milestone | Success Criteria |
|------|-----------|------------------|
| 0 | Pre-Implementation Complete | All discovery documents created, environment setup |
| 2 | FR-008 & FR-016 Complete | Status terminology updated, legacy data migrated |
| 4 | FR-002 & FR-003 Complete | Redo system functional, defect timelines enforced |
| 6 | **Phase 1 Complete** | All 5 features live, UAT passed |
| 8 | FR-005 Complete | Partial payments functional |
| 11 | FR-006 & FR-007 Complete | Multi-location routing optimized |
| 14 | **Phase 2 Complete** | All 6 features live, multi-location workflows efficient |
| 17 | M-Pesa Integration Complete | STK Push functional, tested in sandbox |
| 19 | Mobile App Updated | Driver payment features deployed |
| 22 | Quotation System Complete | Automated quotations operational |
| 24 | **Phase 3 Complete** | All 4 features live, payment integrations functional |
| 28 | Loyalty System Complete | Points earning and redemption functional |
| 30 | **Project Complete** | All 17 features live, stable, documented |

### Critical Path

**Phase 1 → Phase 2 → Phase 3 → Phase 4** (Sequential - each phase builds on previous)

**Within phases, some features can be parallelized**:
- Phase 1: FR-016 (migration) can run parallel to other features
- Phase 2: FR-014 & FR-015 can be developed in parallel
- Phase 3: FR-012 & FR-013 can be developed in parallel

**External Dependencies (Critical)**:
- M-Pesa API access (needed by Week 15)
- PDQ terminal hardware (needed by Week 16)
- Home Cleaning system SSO specification (needed by Week 29)

---

## Risk Management

### Technical Risks

#### Risk 1: M-Pesa API Integration Challenges
- **Probability**: Medium
- **Impact**: High
- **Phase**: 3
- **Mitigation**:
  - Start M-Pesa sandbox testing in Week 10 (before Phase 3)
  - Allocate 2 extra weeks in Phase 3 timeline
  - Have fallback to manual payment recording
  - Maintain close contact with M-Pesa support
- **Contingency**: If integration fails, implement offline payment queue and manual reconciliation as temporary solution

#### Risk 2: Legacy Data Migration Failures
- **Probability**: Medium
- **Impact**: High
- **Phase**: 1
- **Mitigation**:
  - Multiple test migrations in staging
  - 5% sample validation
  - Keep legacy system in read-only mode for 90 days
  - Comprehensive rollback plan
  - Data backup before migration
- **Contingency**: Rollback to backup, fix issues, retry migration

#### Risk 3: Existing Code Conflicts
- **Probability**: Medium
- **Impact**: Medium
- **Phase**: All
- **Mitigation**:
  - Thorough pre-implementation analysis (Week 0)
  - Feature flags for all new functionality
  - Comprehensive integration testing
  - Gradual rollout to minimize blast radius
- **Contingency**: Feature flags allow instant rollback without deployment

#### Risk 4: Performance Degradation
- **Probability**: Low-Medium
- **Impact**: High
- **Phase**: 2, 3
- **Mitigation**:
  - Performance testing after each phase
  - Database query optimization
  - Proper indexing strategy
  - Caching for frequently accessed data
  - Load testing before production deployment
- **Contingency**: Database optimization, horizontal scaling if needed

#### Risk 5: Third-Party Service Downtime
- **Probability**: Low
- **Impact**: Medium
- **Phase**: 3, 4
- **Mitigation**:
  - Offline queue for M-Pesa payments
  - Retry mechanisms with exponential backoff
  - Multiple SMS/email providers configured
  - Graceful degradation strategies
- **Contingency**: Temporary manual processes while services recover

### Organizational Risks

#### Risk 6: Scope Creep
- **Probability**: High
- **Impact**: High
- **Phase**: All
- **Mitigation**:
  - Strict change control process
  - Feature freeze 4 weeks before UAT
  - Document all new requests for "Phase 2.5" or future releases
  - Product owner approval required for scope changes
- **Contingency**: Move non-critical features to future releases

#### Risk 7: User Adoption Resistance
- **Probability**: Medium
- **Impact**: Medium
- **Phase**: All (especially 3, 4)
- **Mitigation**:
  - Early user involvement in UAT
  - Comprehensive training program
  - Champion users in each branch
  - Gradual rollout with support period
  - Excellent documentation and help materials
- **Contingency**: Extended training period, one-on-one sessions for struggling users

#### Risk 8: Stakeholder Availability
- **Probability**: Medium
- **Impact**: Medium
- **Phase**: All
- **Mitigation**:
  - Schedule UAT sessions well in advance
  - Record demo videos for async review
  - Delegate approvals where appropriate
  - Clear escalation path for decisions
- **Contingency**: Proceed with available stakeholders, document decisions

#### Risk 9: Resource Turnover
- **Probability**: Low-Medium
- **Impact**: High
- **Phase**: All
- **Mitigation**:
  - Comprehensive documentation
  - Pair programming for knowledge sharing
  - Code reviews ensure multiple people understand each feature
  - Detailed onboarding documentation
- **Contingency**: Rapid replacement hiring, temporary contractor support

### Timeline Risks

#### Risk 10: Phase Overruns
- **Probability**: Medium
- **Impact**: Medium
- **Phase**: All
- **Mitigation**:
  - Built-in buffer in each phase (80/20 rule - plan for 80% of time)
  - Weekly progress tracking
  - Early warning system for delays
  - Scope reduction if necessary
- **Contingency**: Move lower-priority features to future phases, extend timeline if critical

#### Risk 11: External Dependency Delays
- **Probability**: Medium
- **Impact**: Medium
- **Phase**: 3
- **Mitigation**:
  - Early engagement with M-Pesa, PDQ providers
  - Parallel development using mocks
  - Buffer time in Phase 3 schedule
  - Clear SLAs with vendors
- **Contingency**: Extend Phase 3, implement mock integrations for testing

---

## Success Criteria

### Phase-Level Success Criteria

#### Phase 1 Success
- [ ] All 5 features deployed to production without breaking existing functionality
- [ ] Redo items can be created and tracked
- [ ] QC to customer service handover operational
- [ ] Legacy data migrated with <0.1% error rate
- [ ] Order status terminology updated consistently
- [ ] All existing tests still passing
- [ ] New tests achieve 80%+ code coverage
- [ ] UAT approval from QC team and Operations Manager
- [ ] Documentation updated

#### Phase 2 Success
- [ ] All 6 features deployed to production
- [ ] Partial payments recorded correctly
- [ ] Multi-location routing reducing delays to <5%
- [ ] International phone numbers validated properly
- [ ] Weight-based pricing calculating accurately
- [ ] Customer segmentation automating promotions
- [ ] Performance benchmarks maintained
- [ ] UAT approval from Branch Managers and Finance Manager

#### Phase 3 Success
- [ ] All 4 features deployed to production
- [ ] M-Pesa payments processing successfully (>95% success rate)
- [ ] Driver mobile app functional on Android & iOS
- [ ] Quotations generating within 2 minutes
- [ ] Payment reports filtering accurately
- [ ] Free delivery applying at correct thresholds
- [ ] Security audit passed (PCI DSS compliance)
- [ ] UAT approval from Delivery Drivers and Finance Manager

#### Phase 4 Success
- [ ] All 2 features deployed to production
- [ ] Loyalty points earning and redeeming correctly
- [ ] Home Cleaning system accessible via SSO
- [ ] Full end-to-end system test passed
- [ ] System stable for 2 weeks with <5 critical incidents
- [ ] All stakeholder sign-offs received

### Overall Project Success

**Business Metrics** (measured 3 months post-launch):
- [ ] Customer satisfaction score ≥ 90% (from 72%)
- [ ] Order processing time < 10 minutes (from 18 minutes)
- [ ] Payment collection rate ≥ 95% (from 83%)
- [ ] Repeat customer rate ≥ 65% (from 45%)
- [ ] Inter-branch delays < 5% (from 22%)

**Technical Metrics**:
- [ ] API response time < 500ms (95th percentile)
- [ ] Page load time < 2 seconds
- [ ] 99.9% uptime during business hours
- [ ] Zero data loss incidents
- [ ] Zero security breaches

**Quality Metrics**:
- [ ] Code coverage ≥ 80%
- [ ] Zero critical bugs in production
- [ ] All documentation complete and up-to-date
- [ ] All training materials delivered
- [ ] User adoption rate > 90%

---

## Integration Strategy

### Core Integration Principles

1. **Analyze First, Code Second**
   - Mandatory 1-week pre-implementation analysis
   - Document existing patterns before writing code
   - Create integration plan for each feature

2. **Reuse > Extend > Create**
   - Priority: Reuse existing code
   - Second: Extend existing services/components
   - Last resort: Create new files/services

3. **Match Existing Patterns**
   - Use same naming conventions
   - Follow same file organization
   - Use same libraries and frameworks
   - Match API response formats
   - Follow same error handling

4. **Zero Breaking Changes**
   - Feature flags for all new functionality
   - Backward compatibility maintained
   - Existing APIs unchanged
   - Database migrations reversible

5. **Continuous Integration**
   - Integrate frequently (daily if possible)
   - Run all tests before merging
   - Code review for pattern adherence
   - Integration testing between features

### Integration Checkpoints

**Before Starting Any Feature**:
- [ ] Reviewed similar existing features
- [ ] Documented integration points
- [ ] Identified reusable services/components
- [ ] Planned database changes (extend vs create)
- [ ] Verified approach with tech lead

**During Development**:
- [ ] Following existing code patterns
- [ ] Reusing existing utilities
- [ ] Writing tests in existing style
- [ ] Maintaining existing API contracts
- [ ] Documenting as you go

**Before Submitting PR**:
- [ ] All existing tests passing
- [ ] New tests written and passing
- [ ] Code coverage maintained/improved
- [ ] No duplicate functionality created
- [ ] Documentation updated
- [ ] Self-reviewed against integration checklist

**Before Deploying**:
- [ ] Integration tests passing
- [ ] Performance tests passing
- [ ] Security scan clean
- [ ] Stakeholder approval obtained
- [ ] Rollback plan prepared

---

## Communication Plan

### Daily Communication

**Daily Standup** (15 minutes, 9:00 AM):
- What was completed yesterday
- What's planned for today
- Any blockers or risks
- Team: All developers, QA, Tech Lead

### Weekly Communication

**Sprint Planning** (Monday, 1 hour):
- Review last sprint deliverables
- Plan current sprint tasks
- Assign responsibilities
- Team: Full team + Product Owner

**Tech Sync** (Wednesday, 30 minutes):
- Architecture decisions
- Integration challenges
- Code review feedback
- Team: Tech Lead, Senior Developers

**Progress Review** (Friday, 30 minutes):
- Demo completed features
- Update project timeline
- Discuss risks and mitigation
- Team: Full team + Stakeholders (as needed)

### Phase Communication

**Phase Kickoff Meeting** (2 hours):
- Review phase objectives
- Detailed feature walkthrough
- Assign feature ownership
- Set phase expectations
- Team: Full team + All stakeholders

**Phase Review Meeting** (2 hours):
- Demo all phase features
- Gather stakeholder feedback
- Review metrics and success criteria
- Plan for next phase
- Team: Full team + All stakeholders

**UAT Sessions** (End of each phase):
- Hands-on testing by actual users
- Feedback collection
- Bug identification
- Training preview
- Participants: Users from each role + QA + Product Owner

### Stakeholder Communication

**Weekly Status Email** (Every Friday):
- Progress summary
- Completed features
- Upcoming milestones
- Risks and issues
- To: General Manager, IT Manager, Operations Manager

**Monthly Executive Briefing** (30 minutes):
- High-level progress
- Budget status
- Timeline updates
- Major decisions needed
- To: General Manager, Finance Manager

### Documentation

**Living Documents** (Updated continuously):
- `EXISTING_STACK.md` - Technology stack
- `ARCHITECTURE.md` - System architecture
- `INTEGRATION_POINTS.md` - Feature integration details
- `DATABASE_SCHEMA.md` - Database documentation
- `API_DOCUMENTATION.md` - API endpoints
- `CHANGELOG.md` - All changes

**Phase Deliverables**:
- Feature documentation
- API updates
- User guides
- Training materials
- Release notes

---

## Appendices

### Appendix A: Detailed Feature Requirements

Refer to **PRD (Product Requirements Document)** for:
- Complete user stories for each feature
- Detailed acceptance criteria
- Business rules and logic
- UI/UX requirements

### Appendix B: Technical Implementation Guide

Refer to **claude.md** for:
- Codebase analysis procedures
- Integration patterns and examples
- Code standards and conventions
- Testing strategies
- Common pitfalls to avoid

### Appendix C: Feature Dependency Matrix

```
FR-008 (Status Update) → No dependencies
FR-016 (Data Migration) → No dependencies
FR-002 (Redo Items) → Requires FR-008
FR-003 (Defect Timelines) → Requires FR-008
FR-004 (QC Handover) → Requires FR-002, FR-003
FR-005 (Partial Payments) → Requires FR-008
FR-006 (Routing) → Requires FR-008
FR-007 (Sorting Timelines) → Requires FR-006
FR-014 (Phone Numbers) → No dependencies
FR-015 (Weight Pricing) → Requires FR-017
FR-017 (Segmentation) → No dependencies
FR-001 (Quotations) → Requires FR-017, FR-015
FR-009 (Payment Processing) → Requires FR-005
FR-012 (Payment Reports) → Requires FR-009
FR-013 (Free Delivery) → Requires FR-017
FR-010 (Home Cleaning) → No dependencies
FR-011 (Loyalty) → Requires FR-017, FR-005
```

### Appendix D: Testing Strategy

**Unit Testing**:
- Minimum 80% code coverage
- Test all business logic
- Mock external dependencies
- Run on every commit

**Integration Testing**:
- Test API endpoints
- Test database operations
- Test third-party integrations
- Run before merging to main

**End-to-End Testing**:
- Test complete user workflows
- Test across all features
- Run before each phase deployment

**Performance Testing**:
- Load test with 300 concurrent users
- Stress test to find breaking points
- Run after Phase 2 and Phase 3

**Security Testing**:
- Penetration testing
- Vulnerability scanning
- PCI DSS compliance (Phase 3)
- Run before production deployment

**User Acceptance Testing**:
- Real users test in staging environment
- Test all workflows for their role
- 2-week UAT period per phase
- Sign-off required before production

### Appendix E: Training Plan

**Phase 1 Training** (After Phase 1 deployment):
- QC Team: Redo items, defect timelines, handover workflow (2 hours)
- All Staff: Updated order statuses (30 minutes)

**Phase 2 Training** (After Phase 2 deployment):
- Front Desk: Partial payments, routing (1.5 hours)
- Branch Managers: Sorting timelines, capacity planning (1 hour)
- All Staff: International phone numbers (30 minutes)

**Phase 3 Training** (After Phase 3 deployment):
- Delivery Drivers: Mobile payment app (2 hours)
- Front Desk: Quotation system (1 hour)
- Finance: Payment reporting (1 hour)
- Management: Analytics and reporting (1 hour)

**Phase 4 Training** (After Phase 4 deployment):
- All Staff: Loyalty points system (1 hour)
- Front Desk: Points redemption (30 minutes)
- Management: Loyalty analytics (30 minutes)

**Training Materials**:
- Video tutorials for each feature
- Quick reference guides (PDF)
- Interactive sandbox environment
- FAQ documents
- Live Q&A sessions

### Appendix F: Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] Documentation updated
- [ ] UAT completed and signed off
- [ ] Performance testing passed
- [ ] Security scan clean
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Stakeholder notification sent
- [ ] Feature flags configured

**Deployment**:
- [ ] Deploy to staging first
- [ ] Smoke test in staging
- [ ] Deploy to production (blue-green or canary)
- [ ] Enable feature flags gradually
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Verify key workflows

**Post-Deployment**:
- [ ] Confirm all features functional
- [ ] Monitor for 24 hours
- [ ] Address any issues immediately
- [ ] Update status to stakeholders
- [ ] Schedule training sessions
- [ ] Gather initial user feedback
- [ ] Document lessons learned

### Appendix G: Rollback Procedures

**Feature Flag Rollback** (Immediate - 5 minutes):
```bash
# Disable feature flag
./disable-feature.sh <feature-name>
# No deployment needed
```

**Code Rollback** (Fast - 15 minutes):
```bash
# Revert to previous deployment
git revert <commit-hash>
git push origin main
# Trigger deployment pipeline
./deploy.sh production rollback
```

**Database Rollback** (Medium - 30-60 minutes):
```bash
# Run rollback migration
npm run migrate:down
# Or restore from backup if migration failed
./restore-db.sh <backup-timestamp>
```

---

## Approval & Sign-Off

### Planning Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| General Manager | | | |
| IT Manager | | | |
| Operations Manager | | | |
| Finance Manager | | | |
| Tech Lead | | | |
| Product Owner | | | |

### Phase Sign-Offs

| Phase | Approver | Signature | Date |
|-------|----------|-----------|------|
| Pre-Implementation | Tech Lead | | |
| Phase 1 | Operations Manager | | |
| Phase 2 | Operations Manager | | |
| Phase 3 | Finance Manager | | |
| Phase 4 | General Manager | | |

---

## Document Version Control

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-16 | Initial planning document | Planning Team |
| | | | |
| | | | |

---

**Next Steps**:

1. **Review this planning document** with all stakeholders
2. **Secure approvals** for budget and timeline
3. **Assemble the team** and assign roles
4. **Begin Week 0** - Pre-Implementation phase
5. **Create EXISTING_STACK.md** through codebase analysis
6. **Kick off Phase 1** with team alignment meeting

---

**Document Maintained By**: Tech Lead  
**Last Updated**: January 16, 2026  
**Next Review Date**: Weekly during implementation
