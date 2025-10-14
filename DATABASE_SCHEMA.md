# Database Schema Documentation

This document provides comprehensive documentation for the Lorenzo Dry Cleaners Firestore database structure.

## Collections Overview

### 1. `users` Collection
Stores system user accounts (staff members).

**Document ID:** Firebase Auth UID

**Schema:**
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;            // User email
  phone: string;            // Kenya format: +254XXXXXXXXX
  role: 'admin' | 'manager' | 'front_desk' | 'workstation' | 'driver' | 'customer';
  name: string;             // Full name
  branchId: string;         // Branch assignment (for staff)
  createdAt: Timestamp;
  active: boolean;
}
```

**Indexes:**
- `role` (ASC) + `branchId` (ASC) + `createdAt` (DESC)

---

### 2. `customers` Collection
Stores customer records and profiles.

**Document ID:** Auto-generated (Format: `CUST-[TIMESTAMP]-[RANDOM]`)

**Schema:**
```typescript
{
  customerId: string;
  name: string;
  phone: string;            // Unique, +254XXXXXXXXX
  email?: string;
  addresses: [
    {
      id: string;
      label: string;         // "Home", "Office", etc.
      address: string;
      coordinates?: {
        lat: number;
        lng: number;
      }
    }
  ];
  preferences: {
    notifications: boolean;
    language: 'en' | 'sw';
  };
  createdAt: Timestamp;
  orderCount: number;        // Computed field
  totalSpent: number;        // Computed field (KES)
}
```

**Indexes:**
- `phone` (ASC) - for customer lookup
- `createdAt` (DESC) - for recent customers
- `orderCount` (DESC) + `createdAt` (DESC) - for top customers
- `totalSpent` (DESC) + `createdAt` (DESC) - for VIP customers

---

### 3. `orders` Collection
Stores order records and lifecycle.

**Document ID:** Order ID (Format: `ORD-[BRANCH]-[YYYYMMDD]-[####]`)

**Schema:**
```typescript
{
  orderId: string;
  customerId: string;        // Reference to customers
  customerName: string;      // Denormalized
  customerPhone: string;     // Denormalized
  branchId: string;
  status: 'received' | 'queued' | 'washing' | 'drying' | 'ironing' |
          'quality_check' | 'packaging' | 'ready' | 'out_for_delivery' |
          'delivered' | 'collected';
  garments: [
    {
      garmentId: string;     // Format: [ORDER-ID]-G[##]
      type: string;          // "Shirt", "Pants", etc.
      color: string;
      brand?: string;
      services: string[];    // ["wash", "iron", "starch"]
      price: number;         // KES
      status: string;
      specialInstructions?: string;
      photos?: string[];     // Firebase Storage URLs
    }
  ];
  totalAmount: number;       // KES
  paidAmount: number;        // KES
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: 'cash' | 'mpesa' | 'card' | 'credit';
  estimatedCompletion: Timestamp;
  actualCompletion?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;         // User UID
  driverId?: string;         // For deliveries
  deliveryAddress?: string;
  specialInstructions?: string;
  statusHistory: [
    {
      status: string;
      timestamp: Timestamp;
      updatedBy: string;     // User UID
    }
  ];
}
```

**Indexes:**
- `branchId` (ASC) + `status` (ASC) + `createdAt` (DESC)
- `customerId` (ASC) + `createdAt` (DESC)
- `status` (ASC) + `createdAt` (DESC)
- `branchId` (ASC) + `createdAt` (DESC)
- `branchId` (ASC) + `paymentStatus` (ASC) + `createdAt` (DESC)
- `driverId` (ASC) + `status` (ASC) + `createdAt` (DESC)
- `branchId` (ASC) + `estimatedCompletion` (ASC)

---

### 4. `transactions` Collection
Stores payment transaction records.

**Document ID:** Auto-generated (Format: `TXN-[TIMESTAMP]-[RANDOM]`)

**Schema:**
```typescript
{
  transactionId: string;
  orderId: string;           // Reference to orders
  customerId: string;        // Reference to customers
  amount: number;            // KES
  method: 'cash' | 'mpesa' | 'card' | 'credit';
  status: 'pending' | 'completed' | 'failed';
  pesapalRef?: string;       // For M-Pesa/Card payments
  timestamp: Timestamp;
  processedBy: string;       // User UID
  metadata?: {
    mpesaTransactionCode?: string;
    cardLast4?: string;
    gatewayResponse?: string;
  };
}
```

**Indexes:**
- `orderId` (ASC) + `timestamp` (DESC)
- `customerId` (ASC) + `timestamp` (DESC)
- `status` (ASC) + `timestamp` (DESC)

---

### 5. `pricing` Collection
Stores garment pricing by branch.

**Document ID:** Pricing ID (Format: `PRICE-[BRANCH]-[GARMENT-TYPE]`)

**Schema:**
```typescript
{
  pricingId: string;
  branchId: string;
  garmentType: string;       // "Shirt", "Pants", etc.
  services: {
    wash: number;            // KES
    dryClean: number;        // KES
    iron: number;            // KES
    starch: number;          // KES
    express: number;         // Percentage surcharge
  };
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `branchId` (ASC) + `active` (ASC) + `garmentType` (ASC)

---

### 6. `branches` Collection
Stores branch information.

**Document ID:** Branch ID (e.g., "MAIN", "KIL")

**Schema:**
```typescript
{
  branchId: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  contactPhone: string;
  active: boolean;
  createdAt: Timestamp;
}
```

**Indexes:**
- None (small collection)

---

### 7. `deliveries` Collection
Stores delivery batch information.

**Document ID:** Auto-generated

**Schema:**
```typescript
{
  deliveryId: string;
  driverId: string;          // User UID
  orders: string[];          // Array of order IDs
  route: {
    optimized: boolean;
    stops: [
      {
        orderId: string;
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
        sequence: number;
        status: 'pending' | 'completed' | 'failed';
        timestamp?: Timestamp;
      }
    ];
    distance: number;        // Meters
    estimatedDuration: number; // Seconds
  };
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: Timestamp;
  endTime?: Timestamp;
}
```

**Indexes:**
- `driverId` (ASC) + `status` (ASC) + `startTime` (DESC)
- `status` (ASC) + `startTime` (DESC)

---

### 8. `inventory` Collection
Stores inventory items by branch.

**Document ID:** Auto-generated

**Schema:**
```typescript
{
  itemId: string;
  branchId: string;
  name: string;
  category: string;
  unit: string;              // "kg", "liters", "pieces"
  quantity: number;
  reorderLevel: number;
  costPerUnit: number;       // KES
  supplier?: string;
  lastRestocked: Timestamp;
  expiryDate?: Timestamp;
}
```

**Indexes:**
- `branchId` (ASC) + `category` (ASC) + `name` (ASC)
- `branchId` (ASC) + `quantity` (ASC) - for low stock alerts

---

### 9. `notifications` Collection
Stores notification queue.

**Document ID:** Auto-generated

**Schema:**
```typescript
{
  notificationId: string;
  type: 'order_confirmation' | 'order_ready' | 'driver_dispatched' |
        'driver_nearby' | 'delivered' | 'payment_reminder';
  recipientId: string;
  recipientPhone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  channel: 'whatsapp' | 'sms' | 'email';
  timestamp: Timestamp;
  orderId?: string;
}
```

**Indexes:**
- `recipientId` (ASC) + `timestamp` (DESC)
- `status` (ASC) + `timestamp` (DESC)

---

## Security Rules

All collections are protected by role-based access control (RBAC):

### Role Hierarchy
1. **admin** - Full system access
2. **manager** - Branch-level management
3. **front_desk** - Order creation and payment processing
4. **workstation** - Order status updates
5. **driver** - Delivery management
6. **customer** - Personal data access only

### Key Security Rules
- All endpoints require authentication
- Customers can only access their own data
- Staff can only access data from their assigned branch (except admins)
- Certain operations (delete, user management) are admin-only
- All transactions are immutable (no deletions allowed)

---

## Database Operations

### Customer Operations
- `createCustomer()` - Create new customer
- `getCustomer()` - Get customer by ID
- `getCustomerByPhone()` - Find customer by phone
- `searchCustomers()` - Search by name or phone
- `updateCustomer()` - Update customer details
- `incrementCustomerStats()` - Update order count and total spent

### Order Operations
- `createOrder()` - Create new order with garments
- `getOrder()` - Get order by ID
- `updateOrderStatus()` - Update order status
- `updateOrderPayment()` - Record payment
- `getOrdersByCustomer()` - Get customer's order history
- `getOrdersByBranchAndStatus()` - Filter orders for pipeline
- `getPipelineStats()` - Get order counts by status

### Transaction Operations
- `createTransaction()` - Record new transaction
- `updateTransactionStatus()` - Update transaction status
- `getTransactionsByOrder()` - Get order's payment history
- `getTodayTransactionSummary()` - Get daily transaction totals

### Pricing Operations
- `setPricing()` - Create/update pricing
- `getPricingByGarmentType()` - Get pricing for garment
- `calculateGarmentPrice()` - Calculate price for garment
- `calculateTotalPrice()` - Calculate order total
- `seedDefaultPricing()` - Seed default pricing for branch

---

## Seeding Data

### Seed Development User
```bash
npm run seed:dev
```
Creates an admin user for development.

### Seed Milestone 2 Data
```bash
npm run seed:milestone2
```
Creates:
- 5 test customers
- Pricing for common garment types
- 5 sample orders with various statuses
- 4 sample transactions
- Updates customer stats

---

## Data Flow Examples

### Order Creation Flow
1. Front desk searches for customer (or creates new)
2. Adds garments with types and services
3. System calculates price based on pricing table
4. Staff processes payment (creates transaction)
5. System generates order ID and saves to Firestore
6. System updates customer stats (orderCount, totalSpent)
7. System triggers order confirmation notification

### Order Status Update Flow
1. Workstation staff updates order status
2. System adds entry to statusHistory
3. System updates order.updatedAt
4. Real-time listener notifies dashboard/pipeline
5. If status is "ready", trigger notification to customer

### Payment Processing Flow
1. Staff creates transaction record
2. If using Pesapal, initiate payment
3. Pesapal sends callback on completion
4. System updates transaction status
5. System updates order paymentStatus
6. If fully paid, update order.paymentStatus to "paid"

---

## Performance Optimization

### Indexing Strategy
- Composite indexes for common query patterns
- Single-field indexes for lookups
- Avoid indexes on frequently changing fields

### Denormalization
- Customer name and phone in orders (avoid lookups)
- Computed fields (orderCount, totalSpent) updated via transactions

### Query Limits
- Default limit of 50-100 for list queries
- Pagination for large result sets
- Real-time listeners only for active data

---

## Backup Strategy

### Automated Backups
- Firebase automated daily backups
- 7-day retention
- Encrypted storage

### Manual Backups
Use Firebase Admin SDK or console to export collections before major changes.

---

## Migration Guidelines

### Adding New Fields
1. Add field to TypeScript interface
2. Update validation schemas
3. Deploy code
4. Backfill existing documents if needed

### Removing Fields
1. Remove from validation schemas
2. Deploy code
3. Remove from TypeScript interface
4. Clean up existing documents (optional)

### Changing Field Types
1. Add new field with correct type
2. Migrate data (Cloud Function or script)
3. Update code to use new field
4. Remove old field

---

## Troubleshooting

### Common Issues

**Missing Index Error**
- Check `firestore.indexes.json`
- Deploy indexes: `firebase deploy --only firestore:indexes`

**Permission Denied**
- Check user role and custom claims
- Verify security rules
- Check branch assignment

**Document Not Found**
- Verify document ID format
- Check if document exists
- Verify user has read permission

---

## Related Files

- **Schema Definitions:** `lib/db/schema.ts`
- **Database Utilities:** `lib/db/*.ts`
- **Validation Schemas:** `lib/validations/*.ts`
- **Security Rules:** `firestore.rules`
- **Indexes:** `firestore.indexes.json`
- **Seed Scripts:** `scripts/seed-*.ts`

---

Last Updated: October 15, 2025
