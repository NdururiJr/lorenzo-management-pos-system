# Lorenzo Dry Cleaners - PRD-Based Planning Guide

> **IMPORTANT**: This file takes precedence over `PLANNING.md`. Read this file FIRST for current project status and planning guidance.

---

## Purpose

This planning guide directs development work based on the comprehensive PRD document. All project planning, phase tracking, and implementation work should align with the PRD specifications.

---

## Primary Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **PRD** | `docs/PRD-LORENZO-DRY-CLEANERS.md` | Complete system specification |
| **Claude Guide** | `CLAUDE-PRD.md` | Development instructions |
| **Migration Plan** | `docs/FIREBASE-MIGRATION-PLAN.md` | Firebase account migration |
| **Metrics Guide** | `docs/METRICS-CALCULATION-GUIDE.md` | Dashboard metric formulas |

**Always consult the PRD before planning or implementing any feature.**

---

## Directory Exclusions

### IGNORE the following directories until explicitly instructed:

```
updates/          # Do NOT read or modify files in this folder
```

---

## Current Project Status (January 2026)

### Implementation Status Summary

Based on PRD Section 14 (Implementation Status):

| Module | Status | Completion |
|--------|--------|------------|
| Core Infrastructure | ✅ Complete | 100% |
| Authentication System | ✅ Complete | 100% |
| POS System | ✅ Complete | 100% |
| Order Pipeline | ✅ Complete | 100% |
| Customer Portal | ✅ Complete | 100% |
| Workstation Management | ✅ Complete | 100% |
| Delivery System | ✅ Complete | 95% |
| WhatsApp Integration | ✅ Complete | 100% |
| Payment System | ✅ Complete | 100% |
| Inventory Management | ✅ Complete | 100% |
| Analytics & Reports | ✅ Complete | 100% |
| Employee Management | ✅ Complete | 95% |
| Director Dashboard | ✅ Complete | 100% |
| GM Dashboard | 🔄 In Progress | 85% |
| Biometric Integration | ⚠️ Partial | 60% |
| AI Features | 🔄 In Progress | 70% |

---

## Active Development Phases

### Phase A: Firebase Security Rules (P0 - Critical)

**Status:** 🔄 In Progress
**Reference:** PRD Appendix A (Firestore Collections)

**Tasks:**
1. Add `isExecutive()` helper function for cross-branch access
2. Add `attendance` collection rules
3. Add `equipment` collection rules
4. Add `issues` collection rules
5. Add `customerFeedback` collection rules
6. Add `permissionRequests` collection rules
7. Update `users` collection for executive cross-branch read
8. Update `branches` collection for executive access
9. Deploy: `firebase deploy --only firestore:rules`

**Files to Modify:**
- `firestore.rules`

---

### Phase B: GM Dashboard Completion (P1 - High)

**Status:** 🔄 In Progress (85%)
**Reference:** PRD Section 4.13 (GM Operations Dashboard)

**Remaining Tasks:**
1. Fix permission errors for `attendance`, `equipment`, `issues`, `customerFeedback`
2. Update `ModernSidebar.tsx` with GM navigation
3. Create `/gm/orders` page (Live Orders)
4. Create `/gm/staff` page (Staff Management)
5. Create `/gm/equipment` page (Equipment Status)
6. Create `/gm/performance` page (Branch Performance)

**Files to Create:**
- `app/(dashboard)/gm/orders/page.tsx`
- `app/(dashboard)/gm/staff/page.tsx`
- `app/(dashboard)/gm/equipment/page.tsx`
- `app/(dashboard)/gm/performance/page.tsx`

**Files to Modify:**
- `components/modern/ModernSidebar.tsx`

---

### Phase C: Director Strategic Pages (P1 - High)

**Status:** Pending
**Reference:** PRD Section 4.12 (Director Dashboard)

**Pages to Create:**
| Route | Purpose |
|-------|---------|
| `/director/intelligence` | Market analysis, competitors |
| `/director/financial` | P&L, cash flow, budgets |
| `/director/growth` | Expansion, new services |
| `/director/performance` | KPI history, cohort analysis |
| `/director/risk` | Risk register, compliance |
| `/director/leadership` | Manager scorecards |
| `/director/board` | Report generator, documents |
| `/director/ai-lab` | Scenario simulations |

**Files to Create:**
- `app/(dashboard)/director/intelligence/page.tsx`
- `app/(dashboard)/director/financial/page.tsx`
- `app/(dashboard)/director/growth/page.tsx`
- `app/(dashboard)/director/performance/page.tsx`
- `app/(dashboard)/director/risk/page.tsx`
- `app/(dashboard)/director/leadership/page.tsx`
- `app/(dashboard)/director/board/page.tsx`
- `app/(dashboard)/director/ai-lab/page.tsx`

---

### Phase D: Biometric Integration Completion (P2 - Medium)

**Status:** ⚠️ Partial (60%)
**Reference:** PRD Appendix H (Biometric Integration)

**Completed:**
- Service layer (`services/biometric.ts`)
- Multi-vendor adapters (ZKTeco, Suprema, Hikvision, Generic)
- Core functions (enrollment, event processing)
- Webhook endpoint

**Remaining:**
- [ ] Device registration UI
- [ ] Device status monitoring
- [ ] Employee enrollment interface
- [ ] Event log viewer
- [ ] Manual sync trigger

**Files to Create:**
- `app/(dashboard)/admin/biometric-devices/page.tsx` (enhance existing)
- `components/features/admin/BiometricDeviceForm.tsx`
- `components/features/admin/BiometricEventLog.tsx`

---

### Phase E: AI Features Enhancement (P2 - Medium)

**Status:** 🔄 In Progress (70%)
**Reference:** PRD Section 4.15 (AI-Powered Features)

**Completed:**
- OpenAI API integration
- Agent system framework
- Director AI recommendations

**Remaining:**
- [ ] Customer churn prediction
- [ ] Demand forecasting
- [ ] Natural language queries
- [ ] Automated report summaries

---

## Priority Order

| Priority | Phase | Description | Blocking Issues |
|----------|-------|-------------|-----------------|
| P0 | A | Security Rules | GM Dashboard errors |
| P1 | B | GM Dashboard | None after Phase A |
| P1 | C | Director Pages | None |
| P2 | D | Biometric UI | None |
| P2 | E | AI Features | None |

---

## PRD Section Quick Reference

For detailed specifications, refer to these PRD sections:

| Topic | PRD Section |
|-------|-------------|
| System Architecture | Section 2 |
| Design System | Section 3 |
| Feature Modules | Section 4 |
| Database Schema | Section 5 |
| API Specifications | Section 6 |
| Integrations | Section 7 |
| User Roles | Section 8 |
| Security | Section 9 |
| Performance | Section 10 |
| Testing | Section 11 |
| Deployment | Section 12 |
| Custom Hooks | Appendix E |
| Firestore Indexes | Appendix F |
| Marketing Pages | Appendix G |
| Biometric Integration | Appendix H |

---

## Technology Stack Quick Reference

```yaml
Frontend:
  - Next.js 15+ (App Router)
  - TypeScript 5+
  - Tailwind CSS 4+
  - shadcn/ui components
  - TanStack Query v5

Backend:
  - Firebase Firestore (28 collections)
  - Firebase Authentication
  - Firebase Storage
  - 39 Firestore indexes

Integrations:
  - Wati.io (WhatsApp)
  - Pesapal v3 (Payments)
  - Google Maps API
  - OpenAI GPT-4
  - Resend (Email)
```

---

## User Roles Reference

| Role | Level | Access |
|------|-------|--------|
| `super_admin` | 6 | Full system |
| `director` | 6 | Executive cross-branch |
| `general_manager` | 6 | Operations cross-branch |
| `branch_manager` | 4 | Single branch |
| `workstation_manager` | 4 | Workstation oversight |
| `front_desk` | 3 | POS operations |
| `workstation_staff` | 2 | Processing |
| `satellite_staff` | 2 | Satellite operations |
| `driver` | 1 | Deliveries |
| `customer` | 0 | Own orders only |

---

## Branch Configuration

| Branch | Type | ID |
|--------|------|-----|
| Kilimani | Main | `kilimani` |
| Westlands | Main | `westlands` |
| Karen | Satellite | `karen` |
| Lavington | Satellite | `lavington` |
| HQ | Administrative | `HQ` |

---

## Key Metrics (From PRD Section 10)

### Technical KPIs
- Page Load: < 2 seconds (P90)
- API Response: < 500ms (P95)
- Uptime: 99.9%+
- Error Rate: < 0.1%

### Business KPIs
- Order Processing: < 2 minutes
- On-Time Delivery: 95%+
- Customer Satisfaction: 4.5/5+

---

## Development Workflow

### Before Starting Work:

1. **Read this file** (PLANNING-PRD.md)
2. **Consult CLAUDE-PRD.md** for development instructions
3. **Check TASKS.md** for current task list
4. **Reference PRD** for detailed specifications

### When Implementing:

1. Verify implementation matches PRD specifications
2. Follow design system (black & white theme)
3. Use exact database schema from PRD
4. Implement proper security per user role
5. Update TASKS.md as you complete items

---

## Files Changed vs Original PLANNING.md

This document supersedes the following sections of PLANNING.md:

| Section | Status | New Location |
|---------|--------|--------------|
| Project Overview | Updated | PRD Section 1 |
| System Architecture | Updated | PRD Section 2 |
| Technology Stack | Updated | PRD Section 2.1 |
| Development Phases | Updated | This document |
| Database Schema | Updated | PRD Section 5 |
| API Endpoints | Updated | PRD Section 6 |

---

## Related Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| `CLAUDE-PRD.md` | Development guide | Before coding |
| `docs/PRD-LORENZO-DRY-CLEANERS.md` | Full specifications | Feature details |
| `docs/FIREBASE-MIGRATION-PLAN.md` | Migration steps | Account migration |
| `docs/METRICS-CALCULATION-GUIDE.md` | Metric formulas | Dashboard work |
| `TASKS.md` | Current tasks | Task tracking |

---

## Verification Checklist

Before completing any phase:

- [ ] Implementation matches PRD specifications
- [ ] Security rules are properly configured
- [ ] UI follows design system
- [ ] Mobile-responsive design
- [ ] Error handling implemented
- [ ] TASKS.md updated

---

## Contact Information

| Role | Name | Email |
|------|------|-------|
| Lead Developer | Gachengoh Marugu | jerry@ai-agentsplus.com |
| Backend Developer | Arthur Tutu | arthur@ai-agentsplus.com |
| Product Manager | Jerry Nduriri | jerry@ai-agentsplus.com |

---

**Remember:**
1. This file takes precedence over PLANNING.md
2. The PRD is the source of truth for specifications
3. Ignore the `updates/` directory until instructed
4. Check TASKS.md for current work items

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Next Review:** Weekly