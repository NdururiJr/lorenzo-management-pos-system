# CRM & Marketing Features Build Plan

**Date:** January 23, 2026
**Status:** Approved for Future Implementation
**GitHub Branch:** `feature/crm-marketing-module`
**Reference:** TSEA-ERP CRM proposal analysis

---

## Executive Summary

**Decision:** Build CRM/marketing features in-house rather than integrate external TSEA-ERP system.

**Rationale:**
- Single system, single database (Firestore)
- Lower total cost of ownership ($0 vs $20-100+/month)
- Full customization control
- No vendor dependency
- Staff uses one UI, one login
- Leverage existing WhatsApp integration (Wati.io)

**Estimated Total Effort:** 4-6 weeks post-launch

---

## Features to Build (from TSEA-ERP Analysis)

### Feature Summary

| Feature | Priority | Effort | Value |
|---------|----------|--------|-------|
| Customer source tracking | P2 | 2 days | High |
| Lead/Inquiry pipeline | P3 | 1 week | High |
| WhatsApp lead capture | P3 | 3-5 days | High |
| Facebook lead webhook | P4 | 3-5 days | Medium |
| Instagram lead webhook | P4 | 2-3 days | Medium |
| Google Business webhook | P4 | 3-5 days | Medium |
| Auto-assignment rules | P4 | 3-5 days | High |
| SLA tracking & alerts | P4 | 3-5 days | Medium |
| Campaign ROI dashboard | P5 | 1 week | High |

---

## Phase 1: Customer Source Tracking (Week 1)

### Overview
Track how customers discover Lorenzo Dry Cleaners to measure marketing effectiveness.

### Schema Changes

**File:** `lib/db/schema.ts`

```typescript
// Add to Customer interface
export interface Customer {
  // ... existing fields ...

  // NEW: Marketing attribution
  source?: CustomerSource;
  campaign?: string;                // Marketing campaign name
  referredBy?: string;              // Customer ID if referral
  firstInquiryAt?: Timestamp;       // When they first contacted us
  convertedAt?: Timestamp;          // When they placed first order
  acquisitionChannel?: string;      // More specific than source

  // NEW: CRM linking (for future if we ever integrate)
  externalCrmId?: string;
}

export type CustomerSource =
  | 'walk_in'
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'google'
  | 'website'
  | 'referral'
  | 'phone_call'
  | 'corporate'
  | 'other';
```

### Files to Modify

| File | Changes |
|------|---------|
| `lib/db/schema.ts` | Add CustomerSource type and new fields |
| `lib/db/customers.ts` | Update createCustomer, updateCustomer functions |
| `components/features/pos/CustomerSearch.tsx` | Add source dropdown when creating new customer |
| `components/features/pos/CustomerCard.tsx` | Display source badge |
| `app/(customer)/portal/register/page.tsx` | Add "How did you hear about us?" field |
| `app/(dashboard)/admin/seed-data/page.tsx` | Include source in test data |

### UI Components

```typescript
// components/ui/source-badge.tsx
const sourceConfig: Record<CustomerSource, { label: string; icon: LucideIcon; color: string }> = {
  walk_in: { label: 'Walk-in', icon: Store, color: 'gray' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'green' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'blue' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'pink' },
  google: { label: 'Google', icon: Search, color: 'red' },
  website: { label: 'Website', icon: Globe, color: 'purple' },
  referral: { label: 'Referral', icon: Users, color: 'orange' },
  phone_call: { label: 'Phone', icon: Phone, color: 'teal' },
  corporate: { label: 'Corporate', icon: Building, color: 'slate' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'gray' },
};
```

---

## Phase 2: Lead/Inquiry Pipeline (Week 2)

### Overview
Track pre-order inquiries through a sales pipeline before they become customers/orders.

### New Collection: `inquiries`

**File:** `lib/db/schema.ts`

```typescript
export interface Inquiry {
  inquiryId: string;              // Format: INQ-YYYYMMDD-XXXX

  // Contact info
  name: string;
  phone: string;
  email?: string;

  // Source tracking
  source: CustomerSource;
  campaign?: string;
  originalMessage?: string;       // Their first message/inquiry

  // Pipeline status
  status: InquiryStatus;
  assignedTo?: string;            // Staff userId
  branchId: string;

  // Service interest
  interestedServices?: string[];  // ['dry_clean', 'laundry', 'alterations']
  estimatedValue?: number;        // Potential order value

  // Follow-up tracking
  lastContactedAt?: Timestamp;
  nextFollowUpAt?: Timestamp;
  contactAttempts: number;

  // Conversion
  convertedToCustomerId?: string;
  convertedToOrderId?: string;
  lostReason?: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type InquiryStatus =
  | 'new'           // Just received
  | 'contacted'     // Initial response sent
  | 'qualified'     // Confirmed interest
  | 'quoted'        // Price/service quoted
  | 'converted'     // Became customer/order
  | 'lost';         // Did not convert
```

### New Files to Create

| File | Purpose |
|------|---------|
| `lib/db/inquiries.ts` | CRUD operations for inquiries |
| `app/(dashboard)/inquiries/page.tsx` | Inquiry pipeline board (Kanban) |
| `components/features/inquiries/InquiryPipeline.tsx` | Pipeline board component |
| `components/features/inquiries/InquiryCard.tsx` | Card for each inquiry |
| `components/features/inquiries/InquiryDetailsModal.tsx` | Full inquiry details |
| `components/features/inquiries/CreateInquiryModal.tsx` | Manual inquiry creation |
| `components/features/inquiries/ConvertInquiryModal.tsx` | Convert to customer/order |

### Pipeline Board Design

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│    NEW      │  CONTACTED  │  QUALIFIED  │   QUOTED    │  CONVERTED  │
│    (12)     │     (8)     │     (5)     │     (3)     │     (15)    │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ John S. │ │ │ Mary K. │ │ │ Peter M.│ │ │ Jane D. │ │ │ Alex T. │ │
│ │ WhatsApp│ │ │ Facebook│ │ │ Website │ │ │ KES 5K  │ │ │ ORD-001 │ │
│ │ 2m ago  │ │ │ Sarah   │ │ │ Mike    │ │ │ Today   │ │ │ ✓ Done  │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │
│     ...     │     ...     │     ...     │     ...     │     ...     │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## Phase 3: WhatsApp Lead Capture (Week 3)

### Overview
Automatically create inquiries when new customers message via WhatsApp.

### Webhook Enhancement

**File:** `app/api/webhooks/wati/inquiry/route.ts`

```typescript
// Wati.io webhook for incoming messages
export async function POST(request: Request) {
  const payload = await request.json();

  // Check if this is a new contact (not existing customer)
  const existingCustomer = await getCustomerByPhone(payload.waId);

  if (!existingCustomer) {
    // Create new inquiry
    const inquiry: Partial<Inquiry> = {
      name: payload.pushName || 'WhatsApp User',
      phone: payload.waId,
      source: 'whatsapp',
      originalMessage: payload.text,
      status: 'new',
      branchId: await determineNearestBranch(payload), // or default
      contactAttempts: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await createInquiry(inquiry);

    // Auto-assign to available front desk staff
    await autoAssignInquiry(inquiry.inquiryId);

    // Send notification to assigned staff
    await notifyStaff(inquiry);
  }

  return NextResponse.json({ success: true });
}
```

### Integration Points

| System | Integration |
|--------|-------------|
| Wati.io | Configure webhook URL in Wati dashboard |
| Notifications | Alert staff of new inquiry |
| Auto-assignment | Round-robin to front desk staff |

---

## Phase 4: Social Media Webhooks (Week 4)

### Facebook Lead Ads

**File:** `app/api/webhooks/facebook/lead/route.ts`

```typescript
// Facebook Lead Ads webhook
// Requires: Facebook App, Lead Ads access, webhook verification

export async function POST(request: Request) {
  const payload = await request.json();

  // Verify webhook signature
  if (!verifyFacebookSignature(request, payload)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field === 'leadgen') {
        const leadData = await fetchLeadDetails(change.value.leadgen_id);

        const inquiry: Partial<Inquiry> = {
          name: leadData.full_name,
          phone: leadData.phone_number,
          email: leadData.email,
          source: 'facebook',
          campaign: leadData.ad_name || leadData.campaign_name,
          originalMessage: `Facebook Lead Ad: ${leadData.form_name}`,
          status: 'new',
          interestedServices: parseServices(leadData),
          branchId: determineBranch(leadData),
        };

        await createInquiry(inquiry);
      }
    }
  }

  return NextResponse.json({ success: true });
}
```

### Instagram Lead Ads

**File:** `app/api/webhooks/instagram/lead/route.ts`

Same as Facebook (uses Meta Graph API).

### Google Business Messages

**File:** `app/api/webhooks/google/message/route.ts`

```typescript
// Google Business Messages webhook
// Requires: Google Business Profile, Business Messages API

export async function POST(request: Request) {
  const payload = await request.json();

  const inquiry: Partial<Inquiry> = {
    name: payload.sender.displayName || 'Google User',
    phone: payload.sender.phoneNumber,
    source: 'google',
    originalMessage: payload.message?.text,
    status: 'new',
  };

  await createInquiry(inquiry);

  return NextResponse.json({ success: true });
}
```

### Required API Setup

| Platform | Requirements |
|----------|-------------|
| Facebook | Facebook App, Lead Ads permission, Business verification |
| Instagram | Connected to Facebook Page, Lead Ads enabled |
| Google | Google Business Profile, Business Messages API enabled |

---

## Phase 5: Auto-Assignment & SLA (Week 5)

### Auto-Assignment Rules

**File:** `lib/assignments/auto-assign.ts`

```typescript
export interface AssignmentRule {
  ruleId: string;
  name: string;
  type: 'round_robin' | 'load_based' | 'territory' | 'source';
  priority: number;
  conditions: AssignmentCondition[];
  assignTo: string[];  // User IDs or role
  active: boolean;
}

export interface AssignmentCondition {
  field: 'source' | 'branchId' | 'estimatedValue' | 'services';
  operator: 'equals' | 'in' | 'greater_than';
  value: string | string[] | number;
}

// Round-robin assignment
export async function assignRoundRobin(
  inquiryId: string,
  eligibleStaff: string[]
): Promise<string> {
  // Get last assigned staff
  const lastAssignment = await getLastAssignment();

  // Find next in rotation
  const currentIndex = eligibleStaff.indexOf(lastAssignment?.assignedTo || '');
  const nextIndex = (currentIndex + 1) % eligibleStaff.length;
  const assignedTo = eligibleStaff[nextIndex];

  // Update inquiry
  await updateInquiry(inquiryId, { assignedTo });

  // Record assignment
  await recordAssignment(inquiryId, assignedTo);

  return assignedTo;
}
```

### SLA Tracking

**File:** `lib/sla/sla-tracker.ts`

```typescript
export interface SLAConfig {
  firstResponseMinutes: number;      // e.g., 120 (2 hours)
  followUpHours: number;             // e.g., 24
  autoCloseAfterDays: number;        // e.g., 7
  escalateAfterMissedFollowUps: number; // e.g., 2
}

export interface SLAStatus {
  inquiryId: string;
  firstResponseDue: Timestamp;
  firstResponseMet: boolean;
  nextFollowUpDue: Timestamp;
  missedFollowUps: number;
  escalated: boolean;
  autoCloseAt: Timestamp;
}

// Cloud Function to check SLA breaches
export const checkSLABreaches = onSchedule('every 15 minutes', async () => {
  const overdueInquiries = await getOverdueInquiries();

  for (const inquiry of overdueInquiries) {
    // Send reminder to assigned staff
    await sendSLAReminder(inquiry);

    // Escalate if needed
    if (inquiry.missedFollowUps >= config.escalateAfterMissedFollowUps) {
      await escalateToManager(inquiry);
    }

    // Auto-close if past threshold
    if (isReadyForAutoClose(inquiry)) {
      await updateInquiry(inquiry.inquiryId, {
        status: 'lost',
        lostReason: 'No response - auto-closed'
      });
    }
  }
});
```

---

## Phase 6: Campaign Analytics Dashboard (Week 6)

### Overview
Director-level dashboard showing marketing ROI and lead source performance.

### New Page

**File:** `app/(dashboard)/director/marketing/page.tsx`

### Dashboard Metrics

```typescript
interface MarketingMetrics {
  // Lead metrics
  totalLeads: number;
  leadsBySource: Record<CustomerSource, number>;
  conversionRateBySource: Record<CustomerSource, number>;

  // Campaign metrics
  campaignPerformance: CampaignMetric[];

  // Revenue attribution
  revenueBySource: Record<CustomerSource, number>;
  customerLifetimeValueBySource: Record<CustomerSource, number>;

  // Cost metrics (if tracking ad spend)
  costPerLead?: Record<CustomerSource, number>;
  costPerAcquisition?: Record<CustomerSource, number>;
  roi?: Record<string, number>; // By campaign
}

interface CampaignMetric {
  campaignName: string;
  source: CustomerSource;
  leads: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  cost?: number;
  roi?: number;
}
```

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────┐
│                    MARKETING PERFORMANCE                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   156    │  │   68%    │  │  KES 2.4M │  │   312%   │           │
│  │  Leads   │  │ Convert  │  │  Revenue  │  │   ROI    │           │
│  │ This Month│  │  Rate    │  │ Attributed│  │          │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│                                                                    │
│  LEADS BY SOURCE                    CONVERSION BY SOURCE           │
│  ┌────────────────────────┐        ┌────────────────────────┐     │
│  │ WhatsApp    ████████ 45│        │ Referral    ████████ 82%│     │
│  │ Facebook    ██████   32│        │ WhatsApp    ██████   71%│     │
│  │ Walk-in     █████    28│        │ Google      █████    65%│     │
│  │ Google      ████     22│        │ Walk-in     ████     58%│     │
│  │ Instagram   ███      15│        │ Facebook    ███      45%│     │
│  │ Referral    ██       14│        │ Instagram   ██       38%│     │
│  └────────────────────────┘        └────────────────────────┘     │
│                                                                    │
│  CAMPAIGN PERFORMANCE                                              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Campaign          │ Source   │ Leads │ Conv │ Revenue │ ROI  │ │
│  ├───────────────────┼──────────┼───────┼──────┼─────────┼──────┤ │
│  │ January Promo     │ Facebook │   45  │  28  │ KES 84K │ 420% │ │
│  │ Corporate Outreach│ LinkedIn │   12  │   8  │ KES 120K│ 600% │ │
│  │ Google Ads Q1     │ Google   │   32  │  18  │ KES 54K │ 180% │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Timeline

### Post-Launch Schedule

| Week | Phase | Features | Effort |
|------|-------|----------|--------|
| Week 1 | Phase 1 | Customer source tracking | 2 days |
| Week 2 | Phase 2 | Lead/Inquiry pipeline | 5 days |
| Week 3 | Phase 3 | WhatsApp lead capture | 3-5 days |
| Week 4 | Phase 4 | Facebook/Instagram/Google webhooks | 5 days |
| Week 5 | Phase 5 | Auto-assignment & SLA | 5 days |
| Week 6 | Phase 6 | Campaign analytics dashboard | 5 days |

---

## Files Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `lib/db/inquiries.ts` | Inquiry CRUD operations |
| `lib/assignments/auto-assign.ts` | Auto-assignment logic |
| `lib/sla/sla-tracker.ts` | SLA monitoring |
| `app/(dashboard)/inquiries/page.tsx` | Inquiry pipeline board |
| `app/(dashboard)/director/marketing/page.tsx` | Marketing dashboard |
| `app/api/webhooks/wati/inquiry/route.ts` | WhatsApp lead capture |
| `app/api/webhooks/facebook/lead/route.ts` | Facebook lead webhook |
| `app/api/webhooks/instagram/lead/route.ts` | Instagram lead webhook |
| `app/api/webhooks/google/message/route.ts` | Google Business webhook |
| `components/features/inquiries/InquiryPipeline.tsx` | Pipeline board |
| `components/features/inquiries/InquiryCard.tsx` | Inquiry card |
| `components/features/inquiries/InquiryDetailsModal.tsx` | Details modal |
| `components/features/inquiries/CreateInquiryModal.tsx` | Create modal |
| `components/features/inquiries/ConvertInquiryModal.tsx` | Convert modal |
| `components/ui/source-badge.tsx` | Source indicator badge |
| `functions/src/scheduled/sla-checker.ts` | SLA breach checker |

### Files to Modify

| File | Changes |
|------|---------|
| `lib/db/schema.ts` | Add Inquiry interface, CustomerSource type |
| `lib/db/customers.ts` | Add source fields to customer operations |
| `components/features/pos/CustomerSearch.tsx` | Source dropdown |
| `components/features/pos/CustomerCard.tsx` | Display source |
| `app/(customer)/portal/register/page.tsx` | "How did you hear about us?" |
| `components/layout/Sidebar.tsx` | Add Inquiries menu item |
| `firestore.rules` | Add inquiries collection rules |
| `firestore.indexes.json` | Add inquiry indexes |

---

## External API Requirements

### Facebook/Instagram (Meta)

1. Create Facebook App at developers.facebook.com
2. Add "Lead Ads" product
3. Complete Business Verification
4. Configure webhook URL
5. Subscribe to `leadgen` events

### Google Business

1. Verify Google Business Profile
2. Enable Business Messages API
3. Configure webhook URL
4. Set up agent in Business Communications Console

### Wati.io (Already Integrated)

1. Configure additional webhook for new contacts
2. Update webhook URL to include inquiry endpoint

---

## Success Metrics

### KPIs to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lead capture rate | 100% | All inquiries auto-captured |
| First response time | < 2 hours | Average time to first contact |
| Conversion rate | > 50% | Inquiries → Customers |
| Source attribution | 100% | All customers have source |
| Campaign ROI | > 200% | Revenue / Ad spend |

---

## Notes for Implementation

1. **Start with Phase 1** - Source tracking provides immediate value with minimal effort
2. **Phase 2 is foundational** - Pipeline board needed before webhooks make sense
3. **External APIs require setup** - Facebook/Google verification takes time
4. **Test thoroughly** - Webhook failures = lost leads
5. **Monitor costs** - Additional Firestore writes for inquiries

---

## Git Branch Strategy

```bash
# Create feature branch
git checkout -b feature/crm-marketing-module

# Sub-branches for each phase
git checkout -b feature/crm-phase-1-source-tracking
git checkout -b feature/crm-phase-2-inquiry-pipeline
git checkout -b feature/crm-phase-3-whatsapp-leads
git checkout -b feature/crm-phase-4-social-webhooks
git checkout -b feature/crm-phase-5-auto-assignment
git checkout -b feature/crm-phase-6-marketing-dashboard

# Merge each phase into main feature branch
# Then merge to develop when complete
```

---

**Document Created:** January 23, 2026
**Status:** Approved for Future Implementation
**Owner:** Development Team
**Review Date:** Post-launch + 2 weeks