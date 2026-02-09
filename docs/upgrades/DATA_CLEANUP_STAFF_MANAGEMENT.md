# Database Cleanup & Staff Management Implementation Plan

**Plan Location:** Should be moved to `docs/upgrades/DATA_CLEANUP_STAFF_MANAGEMENT.md` after approval

**Implementation Branch:** `feature/data-cleanup-staff-management`

**Created:** February 7, 2026

---

## Context

The Lorenzo POS system currently contains test/seed data from development that needs to be removed before accepting real production data. Additionally, the seed staff accounts need to be replaced with real staff credentials while supporting multiple staff members per role. The company serves both Kenyan and international clients, requiring international phone number support.

**Current State:**
- Test customers: CUST-001, CUST-002, plus 10 seed customers with @example.com/@test.com emails
- Test staff: 8 accounts (frontdesk@lorenzo.test, admin@lorenzo.test, etc.)
- Customer data spread across 19 Firestore collections with complex foreign key relationships
- Director and GM dashboards populated with fake seed data
- Phone validation currently Kenyan-only (+254XXXXXXXXX)

**Critical Requirements:**
1. ✅ Delete ONLY test customers (preserve any real customers already entered)
2. ✅ Add real staff accounts first, keep test accounts temporarily for safe transition
3. ✅ Support international phone numbers for both staff and customers
4. ✅ Preserve dashboard appearance (Director/GM) even after deleting seed data
5. ✅ Implement on new git branch for safe testing
6. ✅ Admin UI for staff management (no command-line requirement)

## User Decisions

Based on user clarifications:

| Decision Point | User Choice | Rationale |
|---------------|-------------|-----------|
| Deletion Scope | Delete ONLY test customers | Preserve any real customers already created |
| Staff Migration | Add real accounts first, keep test temporarily | Safe transition with no downtime |
| Backup Method | Need Cloud Storage setup instructions | Not currently configured |
| Timing | Schedule for maintenance window | Not urgent, plan carefully |
| Staff Management UI | Add to admin dashboard | More user-friendly than scripts |
| Admin Permissions | Create and edit only (no delete) | Safety measure |
| Phone Validation | International E.164 format | Company serves non-Kenyan clients |
| Dashboard Data | Preserve appearance with empty states | Director/GM dashboards must look professional |

---

## Git Workflow

### Branch Strategy

**Main Branch:** `main` (production-ready code)

**Feature Branch:** `feature/data-cleanup-staff-management`

**Workflow:**

```bash
# Step 1: Create feature branch
git checkout main
git pull origin main
git checkout -b feature/data-cleanup-staff-management

# Step 2: Implement changes (scripts + UI)
git add scripts/cleanup-test-data.ts
git add scripts/manage-staff.ts
git add app/api/admin/staff/
git add app/(dashboard)/admin/staff-management/
git add docs/upgrades/DATA_CLEANUP_STAFF_MANAGEMENT.md
git commit -m "feat: add database cleanup and staff management

- Add cleanup-test-data.ts script for safe test data deletion
- Add manage-staff.ts script for command-line staff management
- Add admin staff management UI (create/edit capabilities)
- Support international phone numbers (E.164 format)
- Add empty state handling for dashboards
- Include comprehensive documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Step 3: Push to remote
git push origin feature/data-cleanup-staff-management

# Step 4: Create pull request
gh pr create --title "Database Cleanup & Staff Management" \
  --body "$(cat <<'EOF'
## Summary
- Safe test customer data cleanup with cascade deletion
- Staff management scripts and admin UI
- International phone number support
- Dashboard empty state handling

## Test Plan
- [ ] Run cleanup script in dry-run mode
- [ ] Verify test customer identification
- [ ] Test staff management UI
- [ ] Verify international phone validation
- [ ] Check dashboard appearance with empty data
- [ ] Full end-to-end test on staging

🤖 Generated with Claude Code
EOF
)"

# Step 5: After review and approval, merge to main
git checkout main
git merge feature/data-cleanup-staff-management
git push origin main

# Step 6: Execute cleanup on production (after merge)
# Run scripts from main branch during scheduled maintenance
```

---

## International Phone Number Support

### Current Issue

The existing system has **partial** international phone support:
- `lib/utils/phone-validator.ts` already supports international numbers via libphonenumber-js
- However, scripts and forms currently assume Kenyan-only format

### Solution

Use the existing phone validation infrastructure throughout:

**File:** `lib/utils/phone-validator.ts` (Already exists - FR-014 implementation)

```typescript
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export interface PhoneValidation {
  valid: boolean;
  e164: string | null;          // +254712345678
  formatted: string | null;      // (0712) 345-678 (Kenyan) or +1 (202) 555-0123 (US)
  country: CountryCode | null;   // 'KE', 'US', 'GB', etc.
  nationalNumber: string | null; // 712345678
  error?: string;
}

/**
 * Validate and normalize any international phone number
 * @param phone - Phone number in any format
 * @param defaultCountry - Default country if no country code provided (default: 'KE')
 */
export function validatePhoneNumber(
  phone: string,
  defaultCountry: CountryCode = 'KE'
): PhoneValidation {
  try {
    // Clean input
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Parse with libphonenumber-js
    const phoneNumber = parsePhoneNumber(cleaned, defaultCountry);

    if (!phoneNumber) {
      return {
        valid: false,
        e164: null,
        formatted: null,
        country: null,
        nationalNumber: null,
        error: 'Invalid phone number format'
      };
    }

    // Validate
    if (!phoneNumber.isValid()) {
      return {
        valid: false,
        e164: null,
        formatted: null,
        country: null,
        nationalNumber: null,
        error: `Invalid phone number for ${phoneNumber.country || defaultCountry}`
      };
    }

    return {
      valid: true,
      e164: phoneNumber.format('E.164'),           // +254712345678
      formatted: phoneNumber.formatInternational(), // +254 712 345 678
      country: phoneNumber.country || defaultCountry,
      nationalNumber: phoneNumber.nationalNumber.toString(),
    };
  } catch (error: any) {
    return {
      valid: false,
      e164: null,
      formatted: null,
      country: null,
      nationalNumber: null,
      error: error.message
    };
  }
}

/**
 * Format phone number to E.164 (storage format)
 */
export function formatPhoneE164(phone: string, defaultCountry: CountryCode = 'KE'): string {
  const validation = validatePhoneNumber(phone, defaultCountry);
  return validation.e164 || phone; // Fallback to original if invalid
}

/**
 * Check if phone number is Kenyan
 */
export function isKenyanNumber(phone: string): boolean {
  const validation = validatePhoneNumber(phone, 'KE');
  return validation.country === 'KE';
}
```

### Updated Validation Rules

**For Staff Management:**
```typescript
// In scripts/manage-staff.ts and app/api/admin/staff/route.ts

import { validatePhoneNumber } from '@/lib/utils/phone-validator';

// Validate phone (supports international)
const phoneValidation = validatePhoneNumber(phone);

if (!phoneValidation.valid) {
  throw new Error(`Invalid phone number: ${phoneValidation.error}`);
}

// Store in E.164 format
const normalizedPhone = phoneValidation.e164!;

// Check uniqueness
const existingPhone = await db.collection('users')
  .where('phone', '==', normalizedPhone)
  .limit(1)
  .get();

if (!existingPhone.empty) {
  throw new Error(`Phone number already in use`);
}

// Create user with normalized phone
await adminAuth.createUser({
  phoneNumber: normalizedPhone, // E.164 format required by Firebase Auth
  // ... other fields
});
```

**For UI Forms:**
```typescript
// In app/(dashboard)/admin/staff-management/page.tsx

<div>
  <Label>Phone* (International format)</Label>
  <Input
    type="tel"
    required
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
    placeholder="+254712345678 or +1234567890"
  />
  <p className="text-xs text-gray-500 mt-1">
    Format: +[country code][number] (e.g., +254712345678 for Kenya, +12025550123 for US)
  </p>
</div>

// Client-side validation
const phoneValidation = validatePhoneNumber(formData.phone);
if (!phoneValidation.valid) {
  setError(`Invalid phone: ${phoneValidation.error}`);
  return;
}
```

**Examples of Valid International Numbers:**
- Kenya: `+254712345678`, `0712345678` (auto-detected as Kenya)
- United States: `+12025550123`
- United Kingdom: `+442071234567`
- Uganda: `+256712345678`
- Tanzania: `+255712345678`
- Rwanda: `+250788123456`

---

## Dashboard Data Retention Strategy

### Problem

After deleting test customer data and seed staff:
- Director dashboard shows metrics (revenue, orders, customers) - will be empty
- GM dashboard shows performance charts - will be empty
- Other role dashboards may show "No data" states
- Empty dashboards look unprofessional and may confuse users

### Solution: Graceful Empty States + Optional Demo Data Mode

**Approach 1: Empty States (Recommended for Production)**

Update all dashboard components to show professional empty states:

**File:** `components/dashboard/EmptyState.tsx` (Create new)

```typescript
import { FileX, TrendingUp, Users, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: 'orders' | 'customers' | 'revenue' | 'inventory';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'orders',
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const icons = {
    orders: FileX,
    customers: Users,
    revenue: TrendingUp,
    inventory: Package
  };

  const Icon = icons[icon];

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-center max-w-sm mb-6">{description}</p>

        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  );
}
```

**Update Director Dashboard:** `app/(dashboard)/director/page.tsx`

```typescript
// Add empty state handling
const hasData = kpis.totalRevenue > 0 || kpis.totalOrders > 0;

return (
  <div className="space-y-6">
    {!hasData ? (
      // Empty state
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmptyState
          icon="revenue"
          title="No Revenue Data Yet"
          description="Start processing orders to see revenue metrics and trends appear here."
        />

        <EmptyState
          icon="orders"
          title="No Orders Yet"
          description="Revenue, profit margins, and performance charts will appear as orders are processed."
        />

        <EmptyState
          icon="customers"
          title="No Customer Data"
          description="Customer analytics and segmentation will be available once customers place orders."
        />

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your dashboard is ready! Here's what you can do:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Staff can create customer orders at the front desk</li>
              <li>• Real-time metrics will appear as data accumulates</li>
              <li>• Reports and analytics become available with historical data</li>
              <li>• Trend charts show patterns after 7 days of activity</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    ) : (
      // Existing dashboard with data
      <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* ... existing KPI cards ... */}
        </div>

        {/* Charts */}
        {/* ... existing charts ... */}
      </>
    )}
  </div>
);
```

**Update GM Dashboard:** `app/(dashboard)/general-manager/page.tsx`

```typescript
// Similar empty state handling
const hasOrders = dashboardData.recentOrders.length > 0;
const hasMetrics = dashboardData.totalRevenue > 0;

return (
  <div className="space-y-6">
    {!hasOrders && !hasMetrics ? (
      <EmptyState
        icon="orders"
        title="Dashboard Ready"
        description="Performance metrics, order tracking, and operational insights will appear as the team processes orders."
        actionLabel="View Staff Management"
        onAction={() => router.push('/admin/staff-management')}
      />
    ) : (
      // Existing dashboard
      <>
        {/* ... existing content ... */}
      </>
    )}
  </div>
);
```

**Approach 2: Demo Data Mode (Optional for Testing/Training)**

Add a toggle to enable demo data for testing purposes:

**File:** `lib/demo-data.ts` (Create new)

```typescript
/**
 * Demo Data Generator for Empty Dashboards
 * Enable via admin settings for training/demo purposes
 */

export const DEMO_MODE_ENABLED = false; // Set via admin settings

export function getDemoCustomers() {
  if (!DEMO_MODE_ENABLED) return [];

  return [
    {
      customerId: 'DEMO-001',
      name: 'Demo Customer 1',
      email: 'demo1@example.com',
      phone: '+254700000001',
      orderCount: 5,
      totalSpent: 12500,
      isDemoData: true
    },
    // ... more demo customers
  ];
}

export function getDemoOrders() {
  if (!DEMO_MODE_ENABLED) return [];

  return [
    {
      orderId: 'DEMO-ORD-001',
      customerName: 'Demo Customer 1',
      totalAmount: 2500,
      status: 'completed',
      createdAt: new Date(),
      isDemoData: true
    },
    // ... more demo orders
  ];
}

// In dashboards, merge demo data with real data
const customers = await getCustomers();
const displayCustomers = [...customers, ...getDemoCustomers()];
```

**Enable Demo Mode via Admin Settings:**

```typescript
// In admin dashboard
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={demoModeEnabled}
    onChange={(e) => setDemoModeEnabled(e.target.checked)}
  />
  <Label>Enable Demo Data (for training/testing)</Label>
</div>
```

### Recommendation

**Use Approach 1 (Empty States) for Production:**
- More professional
- Clear communication that system is ready
- No confusion between demo and real data
- Encourages staff to start using system

**Use Approach 2 (Demo Data) Only for:**
- Training new staff
- Demo presentations
- UI/UX testing
- Client demonstrations

---

## Critical Files to Create/Modify

### Files to Create (7 new files):

1. **`scripts/cleanup-test-data.ts`** (New script)
   - Test customer identification and deletion
   - Cascade deletion across 19 collections
   - Dry-run mode, audit logging
   - International phone support

2. **`scripts/manage-staff.ts`** (New script)
   - Command-line staff management
   - List, add, update, delete operations
   - International phone validation
   - Safety features

3. **`app/api/admin/staff/route.ts`** (New API route)
   - POST: Create staff
   - GET: List staff
   - PATCH: Update staff
   - International phone support

4. **`app/(dashboard)/admin/staff-management/page.tsx`** (New page)
   - Staff management UI
   - Add/edit forms
   - International phone input
   - Role-based access control

5. **`components/dashboard/EmptyState.tsx`** (New component)
   - Reusable empty state component
   - Professional appearance
   - Action buttons

6. **`docs/upgrades/DATA_CLEANUP_STAFF_MANAGEMENT.md`** (New documentation)
   - Complete operational guide
   - Cloud Storage setup
   - Troubleshooting
   - Verification procedures

7. **`lib/demo-data.ts`** (Optional - for demo mode)
   - Demo data generators
   - Toggle for enabling/disabling
   - Training purposes only

### Files to Modify (5 existing files):

8. **`app/(dashboard)/director/page.tsx`** (Update)
   - Add empty state handling
   - Conditional rendering based on data availability
   - Professional "no data" experience

9. **`app/(dashboard)/general-manager/page.tsx`** (Update)
   - Add empty state handling
   - Similar to director dashboard
   - Actionable empty states

10. **`scripts/seed-test-data.ts`** (Update - optional)
    - Add international phone examples
    - Update for reference purposes
    - Document test data patterns

11. **Admin navigation/sidebar** (Update)
    - Add "Staff Management" link
    - Show only for admin/director roles
    - Update routing

12. **`lib/db/customers.ts`** (Verify - should already support international)
    - Confirm uses `validatePhoneNumber`
    - Verify E.164 storage format
    - No changes needed if FR-014 is complete

### Files to Reference (Implementation patterns):

13. **`lib/utils/phone-validator.ts`** (Already exists)
    - FR-014 implementation
    - International phone validation
    - E.164 normalization

14. **`lib/firebase-admin.ts`** (Already exists)
    - Firebase Admin SDK setup
    - Used for all server-side operations

15. **`lib/db/schema.ts`** (Already exists)
    - Type definitions
    - Customer and staff data structures

---

## Implementation Steps

### Phase 0: Branch Setup (15 minutes)

**Step 0.1: Create Feature Branch**
```bash
cd "c:\Users\ADMIN\Documents\Projects\Lorenzo Project\lorenzo management pos system"

# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/data-cleanup-staff-management

# Push branch to remote
git push -u origin feature/data-cleanup-staff-management
```

**Step 0.2: Initial Commit (Plan Documentation)**
```bash
# Move this plan to docs/upgrades/
cp "C:\Users\ADMIN\.claude\plans\data-cleanup-staff-management-plan.md" \
   "docs/upgrades/DATA_CLEANUP_STAFF_MANAGEMENT.md"

git add docs/upgrades/DATA_CLEANUP_STAFF_MANAGEMENT.md
git commit -m "docs: add data cleanup and staff management plan

- Comprehensive implementation plan
- International phone support
- Dashboard empty state strategy
- Git workflow documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

### Phase 1: Cloud Storage Setup (30 minutes)

**Step 1.1: Create Firebase Storage Bucket**
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase use lorenzo-dry-cleaners-7302f

# Create storage bucket
firebase deploy --only storage
```

**Step 1.2: Configure Storage Rules**

Create `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /backups/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Deploy:
```bash
firebase deploy --only storage:rules
```

**Step 1.3: Test Backup**
```bash
gcloud firestore export gs://lorenzo-dry-cleaners-7302f.appspot.com/backups/test-$(date +%Y%m%d-%H%M%S)
gsutil ls gs://lorenzo-dry-cleaners-7302f.appspot.com/backups/
```

### Phase 2: Create Scripts (2-3 days)

**Step 2.1: Create Cleanup Script**

Create `scripts/cleanup-test-data.ts` with:
- Test customer identification (updated for international phones)
- Cascade deletion logic
- Dry-run mode
- Audit logging

**Step 2.2: Create Staff Management Script**

Create `scripts/manage-staff.ts` with:
- List/add/update/delete operations
- International phone validation using `validatePhoneNumber`
- Safety features

**Step 2.3: Test Scripts Locally**
```bash
# Test cleanup (dry-run)
npx tsx scripts/cleanup-test-data.ts --dry-run

# Test staff listing
npx tsx scripts/manage-staff.ts list

# Commit scripts
git add scripts/cleanup-test-data.ts scripts/manage-staff.ts
git commit -m "feat: add database cleanup and staff management scripts

- cleanup-test-data.ts: Safe test data deletion with cascade
- manage-staff.ts: CLI staff account management
- Support international phone numbers (E.164)
- Dry-run mode and audit logging

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

### Phase 3: Create Admin UI (1-2 days)

**Step 3.1: Create API Route**

Create `app/api/admin/staff/route.ts`:
- POST endpoint (create staff)
- GET endpoint (list staff)
- PATCH endpoint (update staff)
- International phone validation

**Step 3.2: Create Staff Management Page**

Create `app/(dashboard)/admin/staff-management/page.tsx`:
- Staff list with search/filter
- Add staff modal
- Edit staff modal
- International phone input with format hints

**Step 3.3: Add Navigation Link**

Update admin sidebar to include "Staff Management"

**Step 3.4: Commit UI**
```bash
git add app/api/admin/staff/ app/(dashboard)/admin/staff-management/
git commit -m "feat: add admin staff management UI

- REST API for staff CRUD operations
- Admin dashboard page with list/add/edit
- International phone number support
- Role-based access control

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

### Phase 4: Add Empty State Handling (4-6 hours)

**Step 4.1: Create Empty State Component**

Create `components/dashboard/EmptyState.tsx`

**Step 4.2: Update Director Dashboard**

Modify `app/(dashboard)/director/page.tsx`:
- Add empty state detection
- Conditional rendering
- Professional "no data" messaging

**Step 4.3: Update GM Dashboard**

Modify `app/(dashboard)/general-manager/page.tsx`:
- Similar empty state handling

**Step 4.4: Test Empty States**

Delete test data and verify dashboards look professional

**Step 4.5: Commit**
```bash
git add components/dashboard/EmptyState.tsx
git add app/(dashboard)/director/page.tsx
git add app/(dashboard)/general-manager/page.tsx
git commit -m "feat: add dashboard empty state handling

- EmptyState component for professional no-data displays
- Director and GM dashboards handle empty data gracefully
- Actionable messaging for getting started

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

### Phase 5: Create Full Backup (30 minutes)

**Step 5.1: Export to Cloud Storage**
```bash
gcloud firestore export gs://lorenzo-dry-cleaners-7302f.appspot.com/backups/pre-cleanup-$(date +%Y%m%d-%H%M%S)
gsutil ls -lh gs://lorenzo-dry-cleaners-7302f.appspot.com/backups/
```

**Step 5.2: Document Current State**
```bash
npx tsx scripts/manage-staff.ts list > staff-backup-$(date +%Y%m%d).txt
```

### Phase 6: Testing & Pull Request (1 day)

**Step 6.1: End-to-End Testing**

Test on feature branch:
- [ ] Run cleanup script (dry-run)
- [ ] Verify test customer identification
- [ ] Test international phone validation (+254, +1, +44, etc.)
- [ ] Test staff management UI (add/edit)
- [ ] Verify dashboard empty states
- [ ] Test role-based access

**Step 6.2: Create Pull Request**
```bash
gh pr create --title "Database Cleanup & Staff Management Implementation" \
  --body "$(cat <<'EOF'
## Summary
Implements comprehensive database cleanup and staff management system with international phone support and professional empty state handling.

### Features
- ✅ Safe test customer data cleanup with cascade deletion
- ✅ Command-line and UI-based staff management
- ✅ International phone number support (E.164 format)
- ✅ Professional dashboard empty states
- ✅ Role-based access control
- ✅ Comprehensive documentation

### Changes
- New: scripts/cleanup-test-data.ts
- New: scripts/manage-staff.ts
- New: app/api/admin/staff/route.ts
- New: app/(dashboard)/admin/staff-management/page.tsx
- New: components/dashboard/EmptyState.tsx
- Updated: Director and GM dashboards for empty state handling
- New: docs/upgrades/DATA_CLEANUP_STAFF_MANAGEMENT.md

### Test Plan
- [x] Cleanup script dry-run validates test customer identification
- [x] International phone validation works for multiple countries
- [x] Staff management UI creates/edits accounts correctly
- [x] Dashboard empty states display professionally
- [x] Role-based access prevents unauthorized access
- [x] Full backup created before cleanup

### Deployment Notes
- Requires scheduled maintenance window for cleanup execution
- Backup verification required before running cleanup
- Staff training recommended before rollout

🤖 Generated with Claude Code
EOF
)"
```

**Step 6.3: Code Review & Approval**

Request review from team, address feedback

**Step 6.4: Merge to Main**
```bash
# After approval
git checkout main
git merge feature/data-cleanup-staff-management
git push origin main
```

### Phase 7: Production Deployment (Scheduled Maintenance)

**Pre-Deployment Checklist:**
- [ ] Pull latest main branch
- [ ] Verify backup exists and is accessible
- [ ] Schedule maintenance window (communicate to team)
- [ ] Prepare rollback plan

**During Maintenance:**
1. Stop accepting new orders (optional - communicate downtime)
2. Run cleanup script with --confirm
3. Verify deletion statistics
4. Check audit log
5. Verify dashboard empty states

**Post-Deployment:**
1. Resume operations
2. Create first real customer order (test)
3. Verify dashboards update correctly
4. Train staff on new staff management UI
5. Monitor for issues

---

## International Phone Examples

**Valid Formats (All Supported):**

| Country | Example | E.164 Format | Notes |
|---------|---------|--------------|-------|
| Kenya | 0712345678 | +254712345678 | Default country |
| Kenya | +254712345678 | +254712345678 | Explicit format |
| United States | (202) 555-0123 | +12025550123 | US format |
| United Kingdom | 020 7123 4567 | +442071234567 | UK format |
| Uganda | +256712345678 | +256712345678 | East Africa |
| Tanzania | +255712345678 | +255712345678 | East Africa |
| Rwanda | +250788123456 | +250788123456 | East Africa |
| South Africa | +27821234567 | +27821234567 | Southern Africa |
| Nigeria | +2348012345678 | +2348012345678 | West Africa |
| India | +919876543210 | +919876543210 | Asia |
| China | +8613912345678 | +8613912345678 | Asia |

**Storage Format:**
All phone numbers stored in E.164 format (`+[country code][number]`) for:
- Consistency
- Firebase Auth compatibility
- International compatibility
- Easy searching/matching

**Display Format:**
Phone numbers displayed in international format with spaces:
- Kenya: +254 712 345 678
- US: +1 (202) 555-0123
- UK: +44 20 7123 4567

---

## Dashboard Empty State Examples

### Director Dashboard

**Before (With Seed Data):**
- Revenue: KES 2,450,000
- Orders: 142 orders
- Customers: 85 customers
- Charts showing trends

**After (Empty State):**
```
┌─────────────────────────────────────────┐
│  📊 No Revenue Data Yet                 │
│                                         │
│  Start processing orders to see         │
│  revenue metrics and trends here.       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📋 No Orders Yet                       │
│                                         │
│  Revenue, profit margins, and           │
│  performance charts will appear as      │
│  orders are processed.                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Getting Started                        │
│  ─────────────────────                  │
│  Your dashboard is ready! Here's what   │
│  you can do:                            │
│                                         │
│  • Staff can create customer orders     │
│  • Real-time metrics appear as data     │
│    accumulates                          │
│  • Reports available with historical    │
│    data                                 │
│  • Trend charts show after 7 days       │
└─────────────────────────────────────────┘
```

### GM Dashboard

**Before (With Seed Data):**
- Today's Orders: 12
- Pending Orders: 8
- Recent Activity: Order timeline
- Performance Charts

**After (Empty State):**
```
┌─────────────────────────────────────────┐
│  📊 Dashboard Ready                     │
│                                         │
│  Performance metrics, order tracking,   │
│  and operational insights will appear   │
│  as the team processes orders.          │
│                                         │
│  [View Staff Management] →              │
└─────────────────────────────────────────┘
```

---

## Verification

### After Cleanup - Firestore Check

1. **Customers Collection:**
   - Expected: 0 documents (or only real customers)
   - Verify: No CUST-001, CUST-002
   - Verify: No @test.com/@example.com emails

2. **Orders Collection:**
   - Expected: No orders with test customerIds
   - Verify: Query for CUST-001, CUST-002 returns empty

3. **Firebase Auth:**
   - Expected: No users with test email patterns
   - Verify: Only real staff accounts remain

### After UI Changes - Dashboard Check

1. **Director Dashboard (Empty):**
   - [ ] Shows professional empty states
   - [ ] No error messages or crashes
   - [ ] Actionable "Getting Started" guidance
   - [ ] Renders within 2 seconds

2. **GM Dashboard (Empty):**
   - [ ] Shows professional empty state
   - [ ] "View Staff Management" button works
   - [ ] No broken charts or components

3. **Director Dashboard (With Data):**
   - [ ] After creating first order, metrics update
   - [ ] Charts display correctly
   - [ ] No layout shifts or glitches

### International Phone Validation

**Test Cases:**

```bash
# Test Kenyan number (default)
npx tsx scripts/manage-staff.ts add \
  --email="test.ke@lorenzo.com" \
  --name="Test Kenya" \
  --phone="0712345678" \
  --role="front_desk" \
  --branchId="BR-MAIN-001" \
  --password="Test123!"

# Expected: Success, stored as +254712345678

# Test US number
npx tsx scripts/manage-staff.ts add \
  --email="test.us@lorenzo.com" \
  --name="Test USA" \
  --phone="+12025550123" \
  --role="front_desk" \
  --branchId="BR-MAIN-001" \
  --password="Test123!"

# Expected: Success, stored as +12025550123

# Test UK number
npx tsx scripts/manage-staff.ts add \
  --email="test.uk@lorenzo.com" \
  --name="Test UK" \
  --phone="+442071234567" \
  --role="front_desk" \
  --branchId="BR-MAIN-001" \
  --password="Test123!"

# Expected: Success, stored as +442071234567

# Test invalid number
npx tsx scripts/manage-staff.ts add \
  --email="test.invalid@lorenzo.com" \
  --name="Test Invalid" \
  --phone="123" \
  --role="front_desk" \
  --branchId="BR-MAIN-001" \
  --password="Test123!"

# Expected: Error "Invalid phone number: too short"
```

**UI Testing:**

1. Open Admin → Staff Management
2. Click "Add New Staff"
3. Test various phone formats:
   - 0712345678 (Kenyan without +254)
   - +254712345678 (Kenyan with +254)
   - +12025550123 (US)
   - +442071234567 (UK)
   - (202) 555-0123 (US with formatting)
   - 020 7123 4567 (UK with spaces)
4. Verify all valid formats are accepted
5. Verify invalid formats show clear error messages

---

## Risk Assessment

### Low Risk
- Running scripts in dry-run mode
- Creating backups
- Adding new staff accounts (parallel to test)
- Creating empty state components
- UI-only changes (no data modification)

### Medium Risk
- Running cleanup script with --confirm
- Updating director/GM dashboards
- Changing phone validation logic

### High Risk
- Deleting staff accounts currently in use
- Running cleanup without backup verification
- Modifying deletion order in script

### Mitigation

**For Cleanup:**
1. Always run --dry-run first
2. Always verify backup before --confirm
3. Test on staging/development first
4. Review audit log after execution
5. Have rollback plan ready

**For Phone Validation:**
1. Test extensively with various country codes
2. Verify existing phone numbers still work
3. Ensure E.164 normalization is consistent
4. Check Firebase Auth compatibility

**For Dashboard Changes:**
1. Test empty state rendering
2. Verify conditional logic works
3. Ensure no crashes with empty data
4. Test transition from empty to populated

**For Git Workflow:**
1. Use feature branch (never commit directly to main)
2. Require PR review before merge
3. Test thoroughly on feature branch
4. Communicate changes to team
5. Deploy during scheduled maintenance

---

## Success Criteria

### Technical Success
- [ ] Test customer data deleted cleanly (no orphaned records)
- [ ] International phone validation works for all major countries
- [ ] Staff management UI creates/edits accounts successfully
- [ ] Dashboards display professionally with empty data
- [ ] Dashboards update correctly as data accumulates
- [ ] Firebase Auth and Firestore stay synchronized
- [ ] Audit logs capture all operations
- [ ] Zero data loss of real customer/staff data

### User Experience Success
- [ ] Admin can manage staff without command-line knowledge
- [ ] International phone numbers work seamlessly
- [ ] Director sees professional dashboard (not "error" or "no data" messages)
- [ ] GM dashboard provides clear guidance when empty
- [ ] Staff can create orders and see real-time updates
- [ ] Error messages are clear and actionable

### Business Success
- [ ] System ready for production use with real data
- [ ] Multiple front desk staff can work concurrently
- [ ] International clients can be onboarded
- [ ] Dashboards professional enough for stakeholder demos
- [ ] Team confident in system reliability
- [ ] Clear path for scaling as business grows

---

## Timeline

**Total Estimated Time: 5-7 days**

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 0: Branch Setup | 15 min | Create feature branch, initial commit |
| Phase 1: Cloud Storage | 30 min | Setup backup infrastructure |
| Phase 2: Scripts | 2-3 days | Create cleanup and staff management scripts |
| Phase 3: Admin UI | 1-2 days | Build staff management interface |
| Phase 4: Empty States | 4-6 hours | Update dashboards for empty data |
| Phase 5: Backup | 30 min | Create full database backup |
| Phase 6: Testing & PR | 1 day | Comprehensive testing, create PR |
| Phase 7: Deployment | 1-2 hours | Production deployment during maintenance |

**Recommended Schedule:**
- Week 1: Phases 0-4 (Development)
- Week 2: Phases 5-6 (Testing, PR review)
- Week 3: Phase 7 (Scheduled maintenance deployment)

---

## Next Steps

1. **Review this plan** - Approve or request changes
2. **Create feature branch** - Start Phase 0
3. **Begin implementation** - Follow phases sequentially
4. **Regular commits** - Push progress to feature branch
5. **Create PR** - After testing completion
6. **Schedule maintenance** - Plan deployment window
7. **Execute deployment** - During scheduled maintenance

**Questions for Clarification:**
- When would you like to schedule the maintenance window?
- Do you want demo data mode as an option?
- Any specific countries besides those listed for phone validation?
- Should we create a staging environment first?

---

**Plan Status:** Ready for Implementation

**Last Updated:** February 7, 2026

**Plan Location:** To be moved to `docs/upgrades/DATA_CLEANUP_STAFF_MANAGEMENT.md` after approval
