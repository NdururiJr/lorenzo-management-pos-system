# Order Pipeline System - Architecture

## Component Hierarchy

```
PipelinePage (/app/(dashboard)/pipeline/page.tsx)
│
├─ PipelineHeader
│  ├─ Search Input (Order ID, Customer Name, Phone)
│  ├─ Date Range Select (Today, Week, Month, All)
│  ├─ Status Group Select (Pending, Processing, Ready, Completed)
│  ├─ Refresh Button
│  └─ Clear Filters Button
│
├─ PipelineStats
│  ├─ Stat Cards (6 cards)
│  │  ├─ Orders Today
│  │  ├─ Completed Today
│  │  ├─ Avg Processing Time
│  │  ├─ Revenue Today
│  │  ├─ Overdue Orders
│  │  └─ Completion Rate
│  │
│  ├─ Bottleneck Alert (conditional)
│  └─ Overdue Alert (conditional)
│
├─ Pipeline Board (Desktop)
│  └─ Horizontal Scroll Area
│     └─ PipelineColumn (x11)
│        ├─ Column Header (Status Name, Count, Avg Time)
│        └─ Scroll Area (Order Cards)
│           └─ OrderCard (multiple)
│              ├─ Order Info Display
│              └─ Status Change Dropdown
│
├─ Pipeline Board (Mobile)
│  └─ Accordion-style Columns
│     └─ Expandable Section (x11)
│        ├─ Summary (Status, Count)
│        └─ Order List (when expanded)
│           └─ Simplified Order Cards
│
└─ OrderDetailsModal
   ├─ Modal Header (Order ID, Status, Payment)
   ├─ Customer Information Card
   ├─ Garments List Card
   ├─ Payment Information Card
   ├─ Status History Timeline Card
   ├─ Order Timeline Card
   ├─ Special Instructions Card (conditional)
   ├─ Update Status Card
   │  ├─ Status Select Dropdown
   │  ├─ Notes Textarea
   │  └─ Update Button
   └─ Footer Actions
      ├─ Print Order Sheet Button
      └─ View Receipt Button
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Firestore                            │
│                    (orders collection)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Real-time Listener (onSnapshot)
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      PipelinePage                            │
│                                                               │
│  State:                                                       │
│  - orders: OrderExtended[]                                   │
│  - selectedOrder: OrderExtended | null                       │
│  - isModalOpen: boolean                                      │
│                                                               │
│  Actions:                                                     │
│  - handleStatusChange(orderId, newStatus, note?)             │
│  - handleOrderClick(order)                                   │
│  - handleRefresh()                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Pass orders to usePipelineFilters hook
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   usePipelineFilters                         │
│                                                               │
│  Input: orders[]                                             │
│  Output:                                                      │
│  - filteredOrders: OrderExtended[]                           │
│  - statusCounts: Record<Status, number>                      │
│  - filters: PipelineFilters                                  │
│  - updateFilter(key, value)                                  │
│  - resetFilters()                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ filteredOrders
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Pipeline Helpers                            │
│                                                               │
│  - groupOrdersByStatus(orders)                               │
│    → Record<Status, OrderExtended[]>                         │
│                                                               │
│  - calculatePipelineStatistics(orders)                       │
│    → { totalOrders, completedOrders, avgTime, ... }         │
│                                                               │
│  - calculateTimeInCurrentStage(order)                        │
│    → number (minutes)                                        │
│                                                               │
│  - identifyBottlenecks(orders)                               │
│    → Bottleneck[]                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ ordersByStatus, statistics
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Render Components                               │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │         PipelineHeader                   │                │
│  │  (filters, search, refresh)              │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │         PipelineStats                    │                │
│  │  (statistics, alerts)                    │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │      PipelineColumn (x11)                │                │
│  │  ┌─────────────────────────────────┐    │                │
│  │  │    OrderCard (multiple)          │    │                │
│  │  └─────────────────────────────────┘    │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ User clicks order
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│               OrderDetailsModal                              │
│                                                               │
│  - Display complete order info                               │
│  - Allow status change with validation                       │
│  - Add notes                                                 │
│  - Print actions                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ User changes status
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│             Status Manager Validation                        │
│                                                               │
│  - canTransitionTo(current, new)                             │
│  - If valid: proceed                                         │
│  - If invalid: show error toast                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Valid transition
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Optimistic UI Update                            │
│                                                               │
│  1. Immediately update local state                           │
│  2. Update UI (order card, modal)                            │
│  3. Show loading indicator                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Call updateOrderStatus()
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Database Update                                 │
│                                                               │
│  updateOrderStatus(orderId, status, userId)                  │
│  - Update order.status                                       │
│  - Add to order.statusHistory                                │
│  - Update order.updatedAt                                    │
│  - Set actualCompletion if terminal status                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Success / Failure
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Feedback to User                                │
│                                                               │
│  Success:                                                     │
│  - Show success toast                                        │
│  - Keep optimistic update                                    │
│  - Real-time listener syncs latest data                      │
│                                                               │
│  Failure:                                                     │
│  - Show error toast                                          │
│  - Rollback optimistic update                                │
│  - Restore previous state                                    │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ If requiresNotification(status)
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│          WhatsApp Notification (Future)                      │
│                                                               │
│  Cloud Function Trigger:                                     │
│  - onOrderStatusChanged                                      │
│  - If status in ['ready', 'out_for_delivery', 'delivered']  │
│  - Send WhatsApp message via Wati.io                         │
└─────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────┐
│                   Global State                        │
│                   (React Context)                     │
│                                                        │
│  - user (from AuthContext)                            │
│  - branchId                                           │
│  - role                                               │
└──────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│                 Component State                       │
│                 (useState in PipelinePage)            │
│                                                        │
│  - orders: OrderExtended[]                            │
│  - isLoading: boolean                                 │
│  - selectedOrder: OrderExtended | null                │
│  - isModalOpen: boolean                               │
└──────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│                  Filter State                         │
│              (usePipelineFilters hook)                │
│                                                        │
│  - filters: PipelineFilters                           │
│    - branchId: string                                 │
│    - dateRange: 'today' | 'week' | 'month' | 'all'   │
│    - customerId: string                               │
│    - staffId: string                                  │
│    - searchQuery: string                              │
│    - statusGroup: 'all' | 'pending' | ...            │
│                                                        │
│  - filteredOrders: OrderExtended[] (computed)         │
│  - statusCounts: Record<Status, number> (computed)    │
│  - hasActiveFilters: boolean (computed)               │
└──────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│               Computed State                          │
│               (useMemo hooks)                         │
│                                                        │
│  - ordersByStatus: Record<Status, OrderExtended[]>    │
│    = groupOrdersByStatus(filteredOrders)              │
│                                                        │
│  - statistics: PipelineStatistics                     │
│    = calculatePipelineStatistics(filteredOrders)      │
│                                                        │
│  - bottlenecks: Bottleneck[]                          │
│    = identifyBottlenecks(filteredOrders)              │
│                                                        │
│  - overdueOrders: OrderExtended[]                     │
│    = getOverdueOrders(filteredOrders)                 │
└──────────────────────────────────────────────────────┘
```

## File Dependencies

```
app/(dashboard)/pipeline/page.tsx
├── contexts/AuthContext
├── lib/firebase
├── lib/db/orders
│   └── updateOrderStatus()
│
├── hooks/usePipelineFilters
│
├── lib/pipeline/status-manager
│   ├── canTransitionTo()
│   ├── getValidNextStatuses()
│   ├── getStatusConfig()
│   └── getAllStatuses()
│
├── lib/pipeline/pipeline-helpers
│   ├── groupOrdersByStatus()
│   ├── calculatePipelineStatistics()
│   ├── calculateTimeInCurrentStage()
│   ├── identifyBottlenecks()
│   ├── getOverdueOrders()
│   ├── formatDuration()
│   └── formatTimeUntilDue()
│
└── components/features/pipeline/
    ├── PipelineHeader
    ├── PipelineStats
    ├── PipelineColumn
    │   └── OrderCard
    └── OrderDetailsModal
```

## Database Schema

```
Firestore: orders/{orderId}
{
  orderId: "ORD-MAIN-20251015-0001",
  customerId: "CUST-0001",
  customerName: "John Kamau",           // Denormalized
  customerPhone: "+254712345678",       // Denormalized
  branchId: "MAIN",
  status: "washing",                    // Current status

  garments: [
    {
      garmentId: "ORD-MAIN-20251015-0001-G01",
      type: "Shirt",
      color: "White",
      brand: "Polo",
      services: ["wash", "iron"],
      price: 200,
      status: "washing",
      specialInstructions: "Remove stain on collar",
      photos: ["gs://bucket/garment1.jpg"]
    }
  ],

  totalAmount: 830,
  paidAmount: 830,
  paymentStatus: "paid",
  paymentMethod: "cash",

  estimatedCompletion: Timestamp,       // When order should be done
  actualCompletion: Timestamp,          // When actually completed

  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user-uid-123",

  driverId: "driver-uid-456",           // If assigned
  deliveryAddress: "Kilimani, Nairobi",
  specialInstructions: "Call before delivery",

  statusHistory: [
    {
      status: "received",
      timestamp: Timestamp,
      updatedBy: "user-uid-123"
    },
    {
      status: "queued",
      timestamp: Timestamp,
      updatedBy: "user-uid-123"
    },
    {
      status: "washing",
      timestamp: Timestamp,
      updatedBy: "user-uid-789"
    }
  ]
}
```

## API Surface

### Status Manager

```typescript
// Check if transition is valid
canTransitionTo(current: OrderStatus, next: OrderStatus): boolean

// Get valid next statuses
getValidNextStatuses(current: OrderStatus): OrderStatus[]

// Get status configuration
getStatusConfig(status: OrderStatus): StatusConfig

// Check if notification required
requiresNotification(status: OrderStatus): boolean

// Get all statuses
getAllStatuses(): OrderStatus[]

// Check if terminal
isTerminalStatus(status: OrderStatus): boolean

// Get status group
getStatusGroup(status: OrderStatus): string
```

### Pipeline Helpers

```typescript
// Group orders by status
groupOrdersByStatus(orders: OrderExtended[]): Record<OrderStatus, OrderExtended[]>

// Calculate time in current stage
calculateTimeInCurrentStage(order: OrderExtended): number

// Calculate total processing time
calculateTotalProcessingTime(order: OrderExtended): number

// Calculate average time per stage
calculateAverageTimePerStage(orders: OrderExtended[]): Record<OrderStatus, number>

// Identify bottlenecks
identifyBottlenecks(orders: OrderExtended[], topN: number): Bottleneck[]

// Check if order is overdue
isOrderOverdue(order: OrderExtended): boolean

// Get overdue orders
getOverdueOrders(orders: OrderExtended[]): OrderExtended[]

// Calculate urgency score
calculateUrgencyScore(order: OrderExtended): number

// Sort by urgency
sortByUrgency(orders: OrderExtended[]): OrderExtended[]

// Format duration
formatDuration(minutes: number): string

// Format time until due
formatTimeUntilDue(timestamp: Timestamp): string

// Get urgency color class
getUrgencyColorClass(order: OrderExtended): string

// Calculate pipeline statistics
calculatePipelineStatistics(orders: OrderExtended[]): PipelineStatistics
```

### Pipeline Filters Hook

```typescript
const {
  filters,              // Current filter values
  updateFilter,         // Update single filter
  resetFilters,         // Reset all filters
  filteredOrders,       // Filtered order list
  statusCounts,         // Count per status
  hasActiveFilters      // Boolean flag
} = usePipelineFilters(orders)
```

## Type Definitions

```typescript
// Order status type
type OrderStatus =
  | 'received'
  | 'queued'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'quality_check'
  | 'packaging'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'collected';

// Extended order with denormalized fields
interface OrderExtended extends Order {
  customerName: string;
  customerPhone: string;
  updatedAt: Timestamp;
  statusHistory: StatusHistoryEntry[];
}

// Status history entry
interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Timestamp;
  updatedBy: string;
}

// Pipeline filters
interface PipelineFilters {
  branchId: string;
  dateRange: 'today' | 'week' | 'month' | 'all';
  customerId: string;
  staffId: string;
  searchQuery: string;
  statusGroup: 'all' | 'pending' | 'processing' | 'ready' | 'completed';
}

// Pipeline statistics
interface PipelineStatistics {
  totalOrders: number;
  todayOrders: number;
  completedOrders: number;
  todayCompleted: number;
  avgProcessingTime: number;
  todayRevenue: number;
  statusCounts: Record<string, number>;
  bottlenecks: Bottleneck[];
  overdueCount: number;
}

// Bottleneck
interface Bottleneck {
  status: OrderStatus;
  avgTime: number;
}
```

## Error Handling

```typescript
// Firestore listener error
onSnapshot(query,
  (snapshot) => {
    // Success handler
  },
  (error) => {
    console.error('Error fetching orders:', error);
    toast.error('Failed to load orders. Please refresh.');
    setIsLoading(false);
  }
);

// Status update error
try {
  await updateOrderStatus(orderId, newStatus, userId);
  toast.success('Status updated');
} catch (error) {
  console.error('Error updating status:', error);
  toast.error('Failed to update status');
  // Rollback optimistic update
  setOrders(previousOrders);
}

// Validation error
if (!canTransitionTo(order.status, newStatus)) {
  toast.error(`Cannot transition from ${order.status} to ${newStatus}`);
  return;
}
```

## Performance Considerations

### Query Optimization
- Use composite indexes for multi-field queries
- Limit query results (default 200 per query)
- Only fetch active orders (exclude 'delivered' and 'collected')
- Use `where('status', 'in', [...])` for multiple statuses

### Computation Optimization
- Memoize filtered orders (`useMemo`)
- Memoize statistics calculation (`useMemo`)
- Debounce search input (future enhancement)
- Use virtual scrolling for 100+ orders (future enhancement)

### Real-Time Optimization
- Single listener per page (not per component)
- Automatic cleanup on unmount
- Optimistic updates for instant feedback
- Batched updates when possible

### Rendering Optimization
- React.memo for OrderCard components
- Key-based reconciliation (use orderId as key)
- Lazy load modal content
- Conditional rendering of expensive components

---

**Last Updated**: October 11, 2025
**Version**: 1.0.0
