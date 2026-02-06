# Lorenzo POS - Architecture Documentation

This document describes the architectural patterns and conventions used throughout the Lorenzo Dry Cleaners POS system.

## Project Structure

```
c:\POS\
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: Authentication
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Registration page
│   │   └── actions.ts            # Auth server actions
│   ├── (customer)/               # Route group: Customer portal
│   │   └── portal/
│   │       ├── page.tsx          # Dashboard
│   │       ├── orders/           # Order tracking
│   │       ├── profile/          # Profile management
│   │       └── layout.tsx        # Customer layout
│   ├── (dashboard)/              # Route group: Staff dashboard
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── pos/page.tsx          # Point of Sale
│   │   ├── pipeline/page.tsx     # Order pipeline
│   │   ├── deliveries/page.tsx   # Delivery management
│   │   ├── inventory/page.tsx    # Inventory management
│   │   ├── employees/page.tsx    # Employee management
│   │   ├── workstation/page.tsx  # Workstation processing
│   │   ├── director/             # Director-only pages
│   │   ├── gm/                   # GM-only pages
│   │   └── layout.tsx            # Dashboard layout
│   ├── api/                      # API routes
│   │   ├── health/route.ts       # Health check endpoint
│   │   ├── webhooks/             # External webhooks
│   │   ├── analytics/            # Analytics endpoints
│   │   └── admin/                # Admin config endpoints
│   ├── globals.css               # Global styles + CSS variables
│   └── layout.tsx                # Root layout
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── pos/                  # POS components
│   │   ├── pipeline/             # Pipeline components
│   │   ├── orders/               # Order components
│   │   ├── deliveries/           # Delivery components
│   │   ├── customer/             # Customer portal components
│   │   ├── workstation/          # Workstation components
│   │   ├── director/             # Director dashboard components
│   │   └── gm/                   # GM dashboard components
│   ├── modern/                   # Modern UI components (theme-aware)
│   │   ├── ModernSidebar.tsx     # Role-based sidebar
│   │   ├── ModernCard.tsx        # Card component
│   │   ├── ModernButton.tsx      # Button component
│   │   └── ModernStatCard.tsx    # Statistics card
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx           # Legacy sidebar
│   │   └── NotificationBell.tsx  # Notification component
│   └── forms/                    # Reusable form components
├── lib/
│   ├── db/                       # Database operations
│   │   ├── index.ts              # Generic CRUD helpers
│   │   ├── schema.ts             # TypeScript interfaces
│   │   ├── orders.ts             # Order operations
│   │   ├── customers.ts          # Customer operations
│   │   ├── pricing.ts            # Pricing operations
│   │   └── ...
│   ├── validations/              # Zod schemas
│   │   └── orders.ts             # Order validation schemas
│   ├── payments/                 # Payment integration
│   │   ├── index.ts              # Payment exports
│   │   ├── payment-service.ts    # Pesapal integration
│   │   └── payment-types.ts      # Payment types
│   ├── maps/                     # Google Maps integration
│   │   ├── geocoding.ts          # Address geocoding
│   │   ├── directions.ts         # Route directions
│   │   └── route-optimizer.ts    # Route optimization
│   ├── email/                    # Email service
│   │   └── receipt-mailer.ts     # Receipt email
│   ├── notifications/            # Notification system
│   │   └── trigger.ts            # Notification triggers
│   ├── utils/                    # Utility functions
│   │   └── constants.ts          # Application constants
│   ├── firebase.ts               # Firebase client SDK
│   └── firebase-admin.ts         # Firebase Admin SDK
├── hooks/                        # Custom React hooks
│   └── useGMDashboard.ts         # GM dashboard data hook
├── types/                        # Additional TypeScript types
├── scripts/                      # Database seeding scripts
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # E2E tests
└── docs/                         # Documentation
```

## Architectural Patterns

### 1. Route Groups

Next.js route groups organize pages by access level:

```
(auth)      → Public authentication pages
(customer)  → Customer-only pages (requires customer role)
(dashboard) → Staff pages (requires staff role)
```

**Layout Hierarchy:**
```
app/layout.tsx (root)
  ├── (auth)/layout.tsx → No sidebar, centered content
  ├── (customer)/portal/layout.tsx → Customer sidebar
  └── (dashboard)/layout.tsx → Staff sidebar (ModernSidebar)
```

### 2. Component Organization

**Feature Components:** `components/features/{feature}/`
- Specific to a single feature/page
- Not reused across features
- Example: `components/features/pos/CustomerSearch.tsx`

**Modern Components:** `components/modern/`
- Theme-aware, role-aware components
- Use Lorenzo design system (teal/gold)
- Support director dark theme
- Example: `ModernSidebar.tsx` with `isDirector` conditional styling

**UI Components:** `components/ui/`
- Base shadcn/ui components
- No business logic
- Highly reusable
- Example: `button.tsx`, `dialog.tsx`

### 3. Database Layer

**File Structure:**
```
lib/db/
├── index.ts      # Generic CRUD operations
├── schema.ts     # All TypeScript interfaces
├── orders.ts     # Order-specific operations
├── customers.ts  # Customer-specific operations
└── ...
```

**Generic CRUD Pattern (`lib/db/index.ts`):**

```typescript
// Get single document
export async function getDocument<T>(collection: string, id: string): Promise<T>

// Get multiple documents with filters
export async function getDocuments<T>(
  collection: string,
  ...constraints: QueryConstraint[]
): Promise<T[]>

// Create document with auto-ID
export async function createDocument<T>(collection: string, data: T): Promise<string>

// Create document with specific ID
export async function setDocument<T>(collection: string, id: string, data: T): Promise<void>

// Update document
export async function updateDocument<T>(collection: string, id: string, data: Partial<T>): Promise<void>

// Delete document
export async function deleteDocument(collection: string, id: string): Promise<void>
```

**Error Classes:**
```typescript
// Thrown when document not found
class DocumentNotFoundError extends Error

// Thrown for database operation failures
class DatabaseError extends Error
```

**Collection-Specific Operations:**

Each collection has dedicated functions that use the generic CRUD:

```typescript
// lib/db/orders.ts
export async function createOrder(data: OrderInput): Promise<string>
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>
export async function getOrdersByBranch(branchId: string): Promise<Order[]>

// lib/db/customers.ts
export async function createCustomer(data: CustomerInput): Promise<string>
export async function getCustomerByPhone(phone: string): Promise<Customer | null>
```

### 4. Validation Pattern

**Zod Schema Location:** `lib/validations/`

```typescript
// lib/validations/orders.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  branchId: z.string().min(1, 'Branch is required'),
  garments: z.array(garmentSchema).min(1).max(50),
  paymentMethod: z.enum(['mpesa', 'card', 'credit']).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
```

**Form Integration:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrderSchema, type CreateOrderInput } from '@/lib/validations/orders';

const form = useForm<CreateOrderInput>({
  resolver: zodResolver(createOrderSchema),
});
```

### 5. API Route Pattern

**Location:** `app/api/{feature}/route.ts`

**Standard Structure:**
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Use Admin SDK for server-side operations
    const result = await adminDb.collection('...').get();

    return NextResponse.json({
      status: 'healthy',
      data: result,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Key Rules:**
- Use `adminDb` (Admin SDK) for server-side Firestore operations
- Never use client SDK (`db`) in API routes
- Always return `NextResponse.json()`
- Include proper error handling

### 6. Firebase SDK Usage

**Client SDK (`lib/firebase.ts`):**
- Used in React components (client-side)
- Lazy initialization with Proxy pattern
- Requires browser environment

```typescript
import { db, auth, storage } from '@/lib/firebase';
```

**Admin SDK (`lib/firebase-admin.ts`):**
- Used in API routes and server actions
- Bypasses security rules (full access)
- Requires service account credentials

```typescript
import { adminDb, adminAuth } from '@/lib/firebase-admin';
```

### 7. Data Fetching Pattern

**Client-Side (TanStack Query):**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['orders', branchId],
  queryFn: () => getOrdersByBranch(branchId),
  staleTime: 30000, // 30 seconds
});

// Mutate data
const mutation = useMutation({
  mutationFn: createOrder,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    toast.success('Order created');
  },
});
```

**Server-Side (API Routes):**
```typescript
// Direct Firestore queries using Admin SDK
const snapshot = await adminDb.collection('orders').where('branchId', '==', id).get();
```

### 8. Authentication & Authorization

**Custom Claims (Firebase Auth):**
```typescript
interface CustomClaims {
  role: UserRole;
  branchId?: string;
  branchAccess?: string[];
  isSuperAdmin?: boolean;
}
```

**Role-Based Access:**
```typescript
// In components
const { userRole } = useAuth();

// Director-specific styling
const isDirector = userRole === 'director';

// Permission check
if (!['admin', 'director', 'general_manager'].includes(userRole)) {
  return <AccessDenied />;
}
```

**Security Rules (`firestore.rules`):**
```javascript
function isAuthenticated() {
  return request.auth != null;
}

function hasRole(role) {
  return request.auth.token.role == role;
}

function isExecutive() {
  return hasAnyRole(['director', 'general_manager']);
}
```

### 9. Constants Pattern

**Location:** `lib/utils/constants.ts`

```typescript
// Enums as const arrays
export const ORDER_STATUSES = [
  { value: 'received', label: 'Received', color: 'bg-gray-100' },
  { value: 'washing', label: 'Washing', color: 'bg-cyan-100' },
  // ...
] as const;

export const GARMENT_TYPES = [
  'Shirt', 'Pants', 'Dress', 'Suit', ...
] as const;

export const SERVICE_TYPES = [
  { value: 'wash', label: 'Wash', description: '...' },
  // ...
] as const;
```

### 10. Styling Conventions

**Theme Variables (globals.css):**
```css
@theme {
  /* Teal palette */
  --color-lorenzo-dark-teal: #0A2F2C;
  --color-lorenzo-teal: #145751;
  --color-lorenzo-accent-teal: #2DD4BF;

  /* Gold palette */
  --color-lorenzo-gold: #C9A962;

  /* Shadows */
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.08);
  --shadow-glow-teal: 0 0 24px rgba(45, 212, 191, 0.4);
}
```

**Role-Based Theming:**
```typescript
// Director gets dark theme
const isDirector = userRole === 'director';

<div className={cn(
  "rounded-2xl p-6",
  isDirector
    ? "bg-[#0A1A1F] text-white border-white/10"
    : "bg-white text-gray-900 border-gray-200"
)} />
```

**Glass Card Pattern:**
```css
.glass-card {
  background: linear-gradient(135deg,
    rgba(10, 26, 31, 0.95),
    rgba(13, 35, 41, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
}
```

## ID Generation Patterns

**Order ID:** `ORD-{BRANCH}-{YYYYMMDD}-{####}`
- Example: `ORD-KIL-20251015-0001`

**Garment ID:** `{ORDER_ID}-G{##}`
- Example: `ORD-KIL-20251015-0001-G01`

**Transaction ID:** Auto-generated by Firestore

**Transfer Batch ID:** `TRF-{SATELLITE}-{YYYYMMDD}-{####}`
- Example: `TRF-SAT1-20251015-0001`

**Processing Batch ID:** `PROC-{STAGE}-{YYYYMMDD}-{####}`
- Example: `PROC-WASHING-20251015-0001`

## Error Handling

**Database Errors:**
```typescript
try {
  const order = await getOrder(orderId);
} catch (error) {
  if (error instanceof DocumentNotFoundError) {
    // Handle not found
    return notFound();
  }
  if (error instanceof DatabaseError) {
    // Handle database error
    console.error('Database error:', error.originalError);
    throw new Error('Failed to fetch order');
  }
  throw error;
}
```

**API Response Errors:**
```typescript
return NextResponse.json(
  {
    error: 'Validation failed',
    details: errors.array()
  },
  { status: 400 }
);
```

**Toast Notifications:**
```typescript
import { toast } from 'sonner';

// Success
toast.success('Order created successfully');

// Error
toast.error('Failed to create order');

// With description
toast('Order Status', {
  description: 'Order has been moved to washing',
});
```

## Testing Conventions

**Unit Tests:** `tests/unit/{feature}/{file}.test.ts`
```typescript
import { calculatePrice } from '@/lib/db/pricing';

describe('calculatePrice', () => {
  it('calculates correct price for wash service', () => {
    const result = calculatePrice('Shirt', ['wash']);
    expect(result).toBe(150);
  });
});
```

**Integration Tests:** `tests/integration/{flow}.test.ts`
```typescript
describe('Order Lifecycle', () => {
  it('creates and processes order through pipeline', async () => {
    const orderId = await createOrder(testData);
    await updateOrderStatus(orderId, 'washing');
    // ...
  });
});
```

**E2E Tests:** `tests/e2e/{feature}.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('POS order creation', async ({ page }) => {
  await page.goto('/pos');
  await page.click('[data-testid="new-order"]');
  // ...
});
```

---

**Last Updated:** January 2026
**Document Version:** 1.0
