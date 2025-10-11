# Database Layer Documentation

This directory contains all database-related code for the Lorenzo Dry Cleaners application.

## Files

### `schema.ts`
Contains TypeScript interfaces for all Firestore collections. These types ensure type safety throughout the application.

**Collections:**
- `User` - System users (staff and customers)
- `Customer` - Customer profiles and preferences
- `Order` - Order details and garments
- `Branch` - Branch locations and information
- `Delivery` - Delivery assignments and routes
- `InventoryItem` - Stock management
- `Transaction` - Payment transactions
- `Notification` - System notifications

**Helper Functions:**
- `isStaffRole(role)` - Check if user is staff
- `isManagementRole(role)` - Check if user is admin/manager
- `isOrderInProgress(status)` - Check if order is being processed
- `isOrderReady(status)` - Check if order is ready for customer

### `index.ts`
Contains helper functions for database operations. All functions are type-safe and include error handling.

**Generic Operations:**
- `getDocument<T>(collection, id)` - Get single document
- `getDocuments<T>(collection, ...constraints)` - Query documents
- `createDocument<T>(collection, data)` - Create with auto-ID
- `setDocument<T>(collection, id, data)` - Create with specific ID
- `updateDocument<T>(collection, id, data)` - Update document
- `deleteDocument(collection, id)` - Delete document

**Collection-Specific Helpers:**
- `getUserById(uid)` - Get user by UID
- `getCustomerById(customerId)` - Get customer
- `getCustomerByPhone(phone)` - Find customer by phone
- `getOrderById(orderId)` - Get order
- `getOrdersByCustomer(customerId, limit)` - Customer order history
- `getOrdersByBranchAndStatus(branchId, status, limit)` - Filter orders
- `getBranchById(branchId)` - Get branch
- `getActiveBranches()` - Get all active branches
- `getDeliveryById(deliveryId)` - Get delivery
- `getDeliveriesByDriver(driverId, status?)` - Driver deliveries
- `getInventoryByBranch(branchId)` - Branch inventory
- `getLowStockItems(branchId)` - Low stock alerts
- `getTransactionsByCustomer(customerId, limit)` - Customer transactions
- `getTransactionsByOrder(orderId)` - Order transactions
- `getNotificationsByRecipient(recipientId, limit)` - User notifications
- `updateOrderStatus(orderId, status)` - Update order with timestamp

**Transaction Helpers:**
- `runDatabaseTransaction(callback)` - Run atomic transaction
- `createBatch()` - Create batch write
- `commitBatch(batch)` - Commit batch write

**Pagination:**
- `getPaginatedDocuments(options)` - Get paginated results with cursor

## Usage Examples

### Basic CRUD Operations

#### Create an Order
```typescript
import { createDocument } from '@/lib/db';
import type { Order } from '@/lib/db/schema';

const orderId = await createDocument<Order>('orders', {
  customerId: 'customer-123',
  branchId: 'branch-001',
  status: 'received',
  garments: [...],
  totalAmount: 1500,
  paidAmount: 0,
  paymentStatus: 'pending',
  estimatedCompletion: Timestamp.fromDate(new Date(Date.now() + 86400000)),
  createdBy: 'user-abc',
});
```

#### Get Orders with Filters
```typescript
import { getDocuments } from '@/lib/db';
import { where, orderBy, limit } from 'firebase/firestore';
import type { Order } from '@/lib/db/schema';

const pendingOrders = await getDocuments<Order>(
  'orders',
  where('branchId', '==', 'branch-001'),
  where('status', '==', 'received'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

#### Update Order Status
```typescript
import { updateOrderStatus } from '@/lib/db';

// Automatically adds actualCompletion timestamp if order is completed
await updateOrderStatus('order-123', 'delivered');
```

#### Update Specific Fields
```typescript
import { updateDocument } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';

await updateDocument('orders', 'order-123', {
  paidAmount: 1500,
  paymentStatus: 'paid',
  paymentMethod: 'mpesa',
});
```

### Using Transactions

Transactions ensure atomic operations - all succeed or all fail.

```typescript
import { runDatabaseTransaction } from '@/lib/db';
import { doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const result = await runDatabaseTransaction(async (transaction) => {
  // Get documents
  const orderRef = doc(db, 'orders', orderId);
  const customerRef = doc(db, 'customers', customerId);

  const orderDoc = await transaction.get(orderRef);
  const customerDoc = await transaction.get(customerRef);

  if (!orderDoc.exists() || !customerDoc.exists()) {
    throw new Error('Order or customer not found');
  }

  const order = orderDoc.data();
  const customer = customerDoc.data();

  // Update order
  transaction.update(orderRef, {
    status: 'completed',
    actualCompletion: Timestamp.now(),
  });

  // Update customer stats
  transaction.update(customerRef, {
    orderCount: customer.orderCount + 1,
    totalSpent: customer.totalSpent + order.totalAmount,
  });

  return { order, customer };
});
```

### Using Batch Writes

Batches are faster than transactions but don't read data.

```typescript
import { createBatch, commitBatch } from '@/lib/db';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const batch = createBatch();

// Update multiple orders
orderIds.forEach((orderId) => {
  const orderRef = doc(db, 'orders', orderId);
  batch.update(orderRef, { status: 'ready' });
});

// Create notifications
orderIds.forEach((orderId, index) => {
  const notificationRef = doc(db, 'notifications', `notif-${index}`);
  batch.set(notificationRef, {
    type: 'order_ready',
    recipientId: customerId,
    message: 'Your order is ready!',
    status: 'pending',
    channel: 'whatsapp',
    timestamp: Timestamp.now(),
    orderId,
  });
});

await commitBatch(batch);
```

### Pagination

```typescript
import { getPaginatedDocuments } from '@/lib/db';
import { where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/db/schema';

// First page
const { documents: firstPage, lastDoc } = await getPaginatedDocuments<Order>({
  collectionName: 'orders',
  constraints: [
    where('branchId', '==', 'branch-001'),
    orderBy('createdAt', 'desc'),
  ],
  pageSize: 20,
});

// Next page
const { documents: secondPage, lastDoc: newLastDoc } = await getPaginatedDocuments<Order>({
  collectionName: 'orders',
  constraints: [
    where('branchId', '==', 'branch-001'),
    orderBy('createdAt', 'desc'),
  ],
  pageSize: 20,
  lastDoc: lastDoc, // Pass the last document from previous page
});
```

### Collection-Specific Helpers

#### Find Customer by Phone
```typescript
import { getCustomerByPhone } from '@/lib/db';

const customer = await getCustomerByPhone('+254712345678');
if (!customer) {
  // Customer doesn't exist, create new one
}
```

#### Get Customer Order History
```typescript
import { getOrdersByCustomer } from '@/lib/db';

const orders = await getOrdersByCustomer('customer-123', 10);
```

#### Get Low Stock Items
```typescript
import { getLowStockItems } from '@/lib/db';

const lowStock = await getLowStockItems('branch-001');
if (lowStock.length > 0) {
  // Send reorder alerts
}
```

#### Get Driver's Active Deliveries
```typescript
import { getDeliveriesByDriver } from '@/lib/db';

const activeDeliveries = await getDeliveriesByDriver('driver-456', 'in_progress');
```

## Error Handling

All database functions throw typed errors:

```typescript
import {
  getDocument,
  DocumentNotFoundError,
  DatabaseError
} from '@/lib/db';

try {
  const order = await getDocument('orders', orderId);
  // Process order
} catch (error) {
  if (error instanceof DocumentNotFoundError) {
    // Handle missing document
    console.error('Order not found:', error.message);
  } else if (error instanceof DatabaseError) {
    // Handle database error
    console.error('Database error:', error.message);
    console.error('Original error:', error.originalError);
  } else {
    // Handle unexpected error
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

### 1. Always Use Types
```typescript
// Good
const order = await getDocument<Order>('orders', orderId);

// Bad
const order = await getDocument('orders', orderId);
```

### 2. Handle Errors Properly
```typescript
// Good
try {
  const order = await getDocument<Order>('orders', orderId);
  // Process order
} catch (error) {
  // Handle error appropriately
  showErrorToast('Failed to load order');
}

// Bad
const order = await getDocument<Order>('orders', orderId); // Unhandled promise rejection
```

### 3. Use Collection-Specific Helpers
```typescript
// Good
const customer = await getCustomerByPhone('+254712345678');

// Less ideal (more verbose)
const customers = await getDocuments<Customer>(
  'customers',
  where('phone', '==', '+254712345678'),
  limit(1)
);
const customer = customers[0] || null;
```

### 4. Use Transactions for Related Updates
```typescript
// Good - Atomic operation
await runDatabaseTransaction(async (transaction) => {
  transaction.update(orderRef, { status: 'completed' });
  transaction.update(customerRef, { orderCount: increment(1) });
});

// Bad - Race condition possible
await updateDocument('orders', orderId, { status: 'completed' });
await updateDocument('customers', customerId, { orderCount: newCount });
```

### 5. Implement Optimistic UI Updates
```typescript
// Update UI immediately
setOrders((prev) =>
  prev.map((o) => o.id === orderId ? { ...o, status: 'completed' } : o)
);

// Then sync with database
try {
  await updateOrderStatus(orderId, 'completed');
} catch (error) {
  // Revert UI on error
  setOrders((prev) =>
    prev.map((o) => o.id === orderId ? { ...o, status: originalStatus } : o)
  );
  showErrorToast('Failed to update order');
}
```

## Testing

### Mock Data for Development
```typescript
import { Timestamp } from 'firebase/firestore';
import type { Order, Customer } from '@/lib/db/schema';

const mockCustomer: Customer = {
  customerId: 'customer-test-001',
  name: 'John Doe',
  phone: '+254712345678',
  addresses: [
    {
      label: 'Home',
      address: 'Kilimani, Nairobi',
      coordinates: { lat: -1.2921, lng: 36.7856 },
    },
  ],
  preferences: {
    notifications: true,
    language: 'en',
  },
  createdAt: Timestamp.now(),
  orderCount: 5,
  totalSpent: 7500,
};

const mockOrder: Order = {
  orderId: 'ORD-KIL-20251010-0001',
  customerId: 'customer-test-001',
  branchId: 'branch-001',
  status: 'received',
  garments: [
    {
      garmentId: 'ORD-KIL-20251010-0001-G01',
      type: 'Shirt',
      color: 'White',
      services: ['Dry Cleaning', 'Ironing'],
      price: 500,
      status: 'received',
    },
  ],
  totalAmount: 500,
  paidAmount: 0,
  paymentStatus: 'pending',
  estimatedCompletion: Timestamp.fromDate(new Date(Date.now() + 86400000)),
  createdAt: Timestamp.now(),
  createdBy: 'user-abc',
};
```

### Using Firebase Emulator
```bash
# Start emulators
firebase emulators:start

# In your code, connect to emulators
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## Performance Tips

1. **Use Indexes**: All complex queries require composite indexes (defined in `firestore.indexes.json`)
2. **Limit Query Results**: Always use `limit()` for large collections
3. **Cache Frequently Accessed Data**: Use React Query or similar for caching
4. **Batch Reads**: Use batch operations when reading multiple documents
5. **Avoid N+1 Queries**: Fetch related data in a single query when possible

## Security

All database access is controlled by:
1. **Firestore Security Rules** (`firestore.rules`) - Enforced at the database level
2. **TypeScript Types** - Compile-time type checking
3. **Helper Functions** - Consistent error handling and validation

Always ensure:
- Users can only access data they're authorized to see
- Client-side code never bypasses security rules
- Sensitive operations use Firebase Admin SDK on the server
