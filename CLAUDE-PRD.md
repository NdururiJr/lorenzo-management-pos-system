# Lorenzo Dry Cleaners - PRD Implementation Guide

> **IMPORTANT**: This file takes precedence over `CLAUDE.md`. Read this file FIRST before making any changes to the system.

---

## 🔴 PROJECT COMPULSORY CHECKLIST

- **Always read PLANNING-PRD.md at the start of every new conversation**
- **Check TASKS-PRD.md before starting your work**
- **Mark completed tasks immediately**
- **Add newly discovered tasks**

> Note: Use the `-PRD.md` files (PLANNING-PRD.md, TASKS-PRD.md) instead of the original files (PLANNING.md, TASKS.md) as these are the current source of truth aligned with the PRD.

---

## Purpose

This guide directs Claude Code to implement changes based on the comprehensive PRD document. All development work should align with the specifications in the PRD.

---

## Primary Reference Document

**PRD Location:** `docs/PRD-LORENZO-DRY-CLEANERS.md`

The PRD is the **source of truth** for:
- System architecture and technology stack
- Feature specifications and requirements
- Database schema and collections
- API endpoints and integrations
- User roles and permissions
- Security requirements
- Performance benchmarks

**Always consult the PRD before implementing any feature or making changes.**

---

## Directory Exclusions

### IGNORE the following directories until explicitly instructed:

```
updates/          # Do NOT read or modify files in this folder
```

If the user needs work done in excluded directories, they will explicitly state so.

---

## Development Workflow

### Before Starting Any Task:

1. **Read this file (CLAUDE-PRD.md)** - You're doing this now
2. **Consult the PRD** (`docs/PRD-LORENZO-DRY-CLEANERS.md`) for specifications
3. **Check PLANNING.md** for project status and phase
4. **Check TASKS.md** for current task list

### When Implementing Features:

1. **Verify against PRD** - Ensure implementation matches PRD specifications
2. **Follow the tech stack** - Next.js 15+, TypeScript, Firebase, Tailwind CSS, shadcn/ui
3. **Adhere to design system** - Black & white minimalistic theme (see PRD Section 3)
4. **Match database schema** - Use exact field names and types from PRD Section 5
5. **Implement proper security** - Follow RBAC and security rules from PRD

### After Completing Tasks:

1. **Update TASKS.md** - Mark completed tasks immediately
2. **Document changes** - Add any new discovered tasks

---

## Key PRD Sections Reference

| Section | Content | Use When |
|---------|---------|----------|
| Section 1 | Executive Summary | Understanding project scope |
| Section 2 | System Architecture | Making architectural decisions |
| Section 3 | Design System | Building UI components |
| Section 4 | Feature Modules | Implementing specific features |
| Section 5 | Database Schema | Creating/modifying Firestore collections |
| Section 6 | API Specifications | Building API endpoints |
| Section 7 | Integrations | Working with external services |
| Section 8 | User Roles | Implementing permissions |
| Section 9 | Security | Adding authentication/authorization |
| Section 10 | Performance | Optimizing code |
| Section 11 | Testing | Writing tests |
| Section 12 | Deployment | CI/CD and deployment |
| Appendix A | Firestore Collections | Database operations |
| Appendix B | API Endpoints | API implementation |
| Appendix C | Environment Variables | Configuration |
| Appendix D | File Structure | Project organization |
| Appendix E | Custom React Hooks | Data fetching patterns |
| Appendix F | Firestore Indexes | Query optimization |
| Appendix G | Marketing Pages | Public-facing pages |
| Appendix H | Biometric Integration | Attendance system |

---

## Technology Stack (Quick Reference)

```yaml
Frontend:
  - Framework: Next.js 15+ (App Router)
  - Language: TypeScript 5+
  - Styling: Tailwind CSS 4+
  - Components: shadcn/ui
  - State: React Context + TanStack Query
  - Forms: React Hook Form + Zod

Backend:
  - Database: Firebase Firestore
  - Auth: Firebase Authentication
  - Storage: Firebase Storage
  - Functions: Next.js API Routes (not Cloud Functions)

Integrations:
  - WhatsApp: Wati.io
  - Payments: Pesapal v3
  - Maps: Google Maps API
  - Email: Resend
  - AI: OpenAI GPT-4
```

---

## Design System (Quick Reference)

### Colors
```css
/* Primary - Black & White */
--background: #FFFFFF;
--text-primary: #000000;
--text-secondary: #6B7280;
--border: #E5E7EB;
--surface: #F9FAFB;

/* Accent Colors (use sparingly) */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Brand - Teal & Gold */
--brand-teal: #0D9488;
--brand-gold: #F59E0B;
```

### Typography
- Font: Inter (sans-serif)
- Base: 16px (1rem)

### Principles
- Mobile-first responsive design
- WCAG 2.1 Level AA accessibility
- Generous whitespace
- High contrast (4.5:1 minimum)

---

## Database Collections (28 Total)

Core collections from PRD Section 5 and Appendix A:

| Collection | Purpose |
|------------|---------|
| `users` | Staff accounts with roles |
| `customers` | Customer profiles |
| `orders` | Order records |
| `garments` | Individual garment items |
| `transactions` | Payment records |
| `branches` | Branch configuration |
| `deliveries` | Delivery batches |
| `inventory` | Stock items |
| `pricing` | Service pricing |
| `attendance` | Staff attendance |
| `equipment` | Equipment records |
| `issues` | Quality/operational issues |
| `customerFeedback` | Customer reviews |
| `notifications` | Notification logs |
| `permissionRequests` | GM permission requests |
| `transferBatches` | Inter-branch transfers |
| `workstationProcessing` | Processing records |

**Full schema details in PRD Section 5.**

---

## User Roles (10 Total)

| Role | Access Level |
|------|--------------|
| `super_admin` | Full system access |
| `director` | Executive cross-branch access |
| `general_manager` | Cross-branch operational access |
| `branch_manager` | Single branch management |
| `workstation_manager` | Workstation oversight |
| `workstation_staff` | Processing operations |
| `front_desk` | POS and customer service |
| `driver` | Delivery operations |
| `satellite_staff` | Satellite store operations |
| `customer` | Customer portal access |

**Full permissions matrix in PRD Section 8.**

---

## Common Implementation Patterns

### Creating a New Page
```typescript
// app/(dashboard)/[feature]/page.tsx
'use client';

import { ModernLayout } from '@/components/modern/ModernLayout';

export default function FeaturePage() {
  return (
    <ModernLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Feature Title</h1>
        {/* Content */}
      </div>
    </ModernLayout>
  );
}
```

### Data Fetching with TanStack Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFeatureData(branchId: string) {
  return useQuery({
    queryKey: ['feature', branchId],
    queryFn: async () => {
      const q = query(
        collection(db, 'collectionName'),
        where('branchId', '==', branchId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });
}
```

### Firestore Operations
```typescript
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Create
const docRef = await addDoc(collection(db, 'collectionName'), data);

// Update
await updateDoc(doc(db, 'collectionName', docId), updates);
```

---

## Security Rules Reference

The PRD specifies security rules in Section 9. Key helpers:

- `isAuthenticated()` - User is logged in
- `isSuperAdmin()` - Has super_admin role
- `isExecutive()` - Has director or general_manager role
- `isManagement()` - Has management-level role
- `canAccessBranch(branchId)` - User can access specific branch

**Full security rules in `firestore.rules`.**

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/PRD-LORENZO-DRY-CLEANERS.md` | Complete system specification |
| `docs/FIREBASE-MIGRATION-PLAN.md` | Firebase account migration guide |
| `docs/METRICS-CALCULATION-GUIDE.md` | Dashboard metrics formulas |
| `PLANNING-PRD.md` | Project phases and status (USE THIS) |
| `TASKS-PRD.md` | Current task list (USE THIS) |
| `CLAUDE-PRD.md` | This file - PRD implementation guide |
| `PLANNING.md` | Legacy planning file (superseded) |
| `TASKS.md` | Legacy task list (superseded) |
| `CLAUDE.md` | Legacy development guidelines (superseded) |

---

## Checklist Before Submitting Changes

- [ ] Implementation matches PRD specifications
- [ ] Code follows TypeScript strict mode
- [ ] UI follows black & white design system
- [ ] Mobile-responsive design implemented
- [ ] Proper error handling added
- [ ] Security rules considered
- [ ] TASKS.md updated

---

## Questions?

If requirements are unclear:
1. Check the PRD first
2. Check related documentation
3. Ask the user for clarification

**Remember: The PRD (`docs/PRD-LORENZO-DRY-CLEANERS.md`) is the source of truth.**