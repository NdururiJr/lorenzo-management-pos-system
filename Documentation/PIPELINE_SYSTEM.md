# Order Pipeline Management System

## Overview

The Order Pipeline Management System is a Kanban-style interface for tracking and managing orders through their complete lifecycle at Lorenzo Dry Cleaners. It provides real-time visibility into order status, bottleneck identification, and optimized workflow management.

## Features

### 1. Real-Time Pipeline Board
- **11 Status Columns**: Received, Queued, Washing, Drying, Ironing, Quality Check, Packaging, Ready, Out for Delivery, Delivered, Collected
- **Live Updates**: Firestore real-time listeners automatically sync changes across all users
- **Visual Indicators**: Color-coded urgency levels based on estimated completion time
- **Responsive Design**: Desktop (horizontal scroll) and mobile (accordion) layouts

### 2. Order Status Management
- **Validated Transitions**: Prevents invalid status changes (can't skip stages)
- **Manual Updates**: Click-to-update or dropdown status selection
- **Status History**: Complete timeline of all status changes with timestamps
- **Optimistic UI**: Immediate visual feedback with automatic rollback on errors

### 3. Advanced Filtering
- **Search**: By order ID, customer name, or phone number
- **Date Range**: Today, This Week, This Month, All Time
- **Status Group**: Pending, Processing, Ready, Completed
- **Branch Filter**: Filter by specific branch (for multi-branch users)
- **Combined Filters**: Apply multiple filters simultaneously

### 4. Pipeline Analytics
- **Real-Time Statistics**:
  - Orders today vs. total active
  - Completed orders today vs. total completed
  - Average processing time per order
  - Today's revenue
  - Overdue order count
  - Completion rate

- **Bottleneck Detection**:
  - Identifies stages with longest average time
  - Visual alerts when bottlenecks exceed threshold
  - Actionable recommendations

- **Performance Metrics**:
  - Time spent in each stage
  - Average processing time per stage
  - Order velocity trends

### 5. Order Details Modal
Comprehensive order information including:
- Customer details (name, phone, delivery address)
- Complete garment list with services and pricing
- Payment information with balance due
- Status history timeline with duration per stage
- Special instructions
- Quick status update controls
- Print receipt and order sheet options

## File Structure

```
app/(dashboard)/pipeline/
└── page.tsx                          # Main pipeline page

components/features/pipeline/
├── PipelineBoard.tsx                 # Kanban board layout (legacy)
├── PipelineColumn.tsx                # Single status column
├── PipelineHeader.tsx                # Filters and search
├── PipelineStats.tsx                 # Statistics dashboard
├── OrderCard.tsx                     # Individual order card
├── OrderDetailsModal.tsx             # Full order details
└── index.ts                          # Component exports

lib/pipeline/
├── status-manager.ts                 # Status transition logic
└── pipeline-helpers.ts               # Helper functions

hooks/
└── usePipelineFilters.ts             # Filter state management
```

## Usage

### Basic Usage

```typescript
import PipelinePage from '@/app/(dashboard)/pipeline/page';

// The page is automatically routed at /dashboard/pipeline
// No additional setup required
```

### Status Management

```typescript
import { canTransitionTo, getValidNextStatuses } from '@/lib/pipeline/status-manager';

// Check if transition is valid
const isValid = canTransitionTo('washing', 'drying'); // true
const isInvalid = canTransitionTo('washing', 'ready'); // false

// Get valid next statuses
const nextStatuses = getValidNextStatuses('washing'); // ['drying']
```

### Pipeline Helpers

```typescript
import {
  groupOrdersByStatus,
  calculatePipelineStatistics,
  identifyBottlenecks,
  getOverdueOrders,
} from '@/lib/pipeline/pipeline-helpers';

// Group orders by status
const grouped = groupOrdersByStatus(orders);

// Calculate statistics
const stats = calculatePipelineStatistics(orders);

// Identify bottlenecks
const bottlenecks = identifyBottlenecks(orders, 3); // Top 3

// Get overdue orders
const overdue = getOverdueOrders(orders);
```

### Filtering

```typescript
import { usePipelineFilters } from '@/hooks/usePipelineFilters';

function PipelineComponent({ orders }) {
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredOrders,
    hasActiveFilters,
  } = usePipelineFilters(orders);

  return (
    <div>
      <input
        value={filters.searchQuery}
        onChange={(e) => updateFilter('searchQuery', e.target.value)}
      />
      {/* ... */}
    </div>
  );
}
```

## Order Status Flow

```
Order Created (status: 'received')
    ↓
Queue (status: 'queued')
    ↓
Washing (status: 'washing')
    ↓
Drying (status: 'drying')
    ↓
Ironing (status: 'ironing')
    ↓
Quality Check (status: 'quality_check')
    ↓ (can go back to 'washing' if QA fails)
Packaging (status: 'packaging')
    ↓
Ready (status: 'ready')
    ↓
    ├─→ Out for Delivery (status: 'out_for_delivery')
    │       ↓
    │   Delivered (status: 'delivered')
    │
    └─→ Collected (status: 'collected')
```

## Status Transition Rules

Defined in `lib/pipeline/status-manager.ts`:

```typescript
const VALID_TRANSITIONS = {
  received: ['queued'],
  queued: ['washing'],
  washing: ['drying'],
  drying: ['ironing'],
  ironing: ['quality_check'],
  quality_check: ['packaging', 'washing'], // Can return if QA fails
  packaging: ['ready'],
  ready: ['out_for_delivery', 'collected'],
  out_for_delivery: ['delivered'],
  delivered: [], // Terminal
  collected: [], // Terminal
};
```

## WhatsApp Notifications

Automatic notifications are triggered when orders reach:
- **ready**: "Your order is ready for pickup!"
- **out_for_delivery**: "Driver dispatched! Your order is on the way."
- **delivered**: "Order successfully delivered. Thank you!"

Implementation in Cloud Functions (future enhancement):

```typescript
// functions/src/triggers/onOrderStatusChanged.ts
export const onOrderStatusChanged = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newStatus = change.after.data().status;
    const requiresNotification = ['ready', 'out_for_delivery', 'delivered'];

    if (requiresNotification.includes(newStatus)) {
      await sendWhatsAppNotification(change.after.data());
    }
  });
```

## Performance Optimization

### 1. Real-Time Listeners
- Only active orders are listened to (not 'delivered' or 'collected')
- Firestore queries are indexed for performance
- Automatic cleanup on component unmount

### 2. Optimistic Updates
- UI updates immediately on status change
- Rollback on error to maintain consistency
- Toast notifications for user feedback

### 3. Memoization
- Filtered orders calculated only when dependencies change
- Statistics computed with useMemo
- Prevents unnecessary re-renders

### 4. Virtual Scrolling (Future)
For large datasets (100+ orders), implement virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: orders.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => 150,
});
```

## Firestore Queries

### Main Query (Pipeline Page)

```typescript
const ordersRef = collection(db, 'orders');
const q = query(
  ordersRef,
  where('branchId', '==', user.branchId),
  where('status', 'in', [
    'received', 'queued', 'washing', 'drying', 'ironing',
    'quality_check', 'packaging', 'ready', 'out_for_delivery'
  ]),
  orderBy('createdAt', 'desc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  // Handle updates
});
```

### Required Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "branchId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Mobile Responsiveness

### Desktop (≥1024px)
- Horizontal scrollable Kanban board
- All columns visible simultaneously
- Drag-and-drop support (future enhancement)

### Tablet (768px - 1023px)
- Horizontal scroll with fewer visible columns
- Tap to expand order details

### Mobile (<768px)
- Accordion-style status groups
- Expandable sections
- Optimized for touch interactions

## Accessibility

- **Keyboard Navigation**: Tab through orders, Enter to select
- **Screen Reader Support**: ARIA labels on all interactive elements
- **High Contrast**: WCAG AA compliant color contrasts
- **Focus Indicators**: Visible focus states on all controls

## Testing

### Unit Tests

```typescript
// Example test
import { canTransitionTo } from '@/lib/pipeline/status-manager';

describe('Status Manager', () => {
  it('should allow valid transitions', () => {
    expect(canTransitionTo('washing', 'drying')).toBe(true);
  });

  it('should prevent invalid transitions', () => {
    expect(canTransitionTo('washing', 'ready')).toBe(false);
  });
});
```

### Integration Tests

```typescript
// Example E2E test with Playwright
test('should update order status', async ({ page }) => {
  await page.goto('/dashboard/pipeline');
  await page.click('[data-testid="order-card-123"]');
  await page.click('[data-testid="change-status-btn"]');
  await page.click('[data-testid="status-drying"]');
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Drying');
});
```

## Troubleshooting

### Orders Not Updating in Real-Time

**Issue**: Changes made by other users don't appear immediately.

**Solution**:
1. Check Firestore Security Rules allow read access
2. Verify user has correct branchId
3. Check browser console for Firestore errors
4. Ensure network connection is stable

### Status Change Fails

**Issue**: "Cannot transition from X to Y" error.

**Solution**:
1. Verify transition is valid in `status-manager.ts`
2. Check order current status is correct
3. Ensure user has permission to update orders
4. Refresh page to get latest order state

### Performance Issues with Many Orders

**Issue**: Page becomes slow with 100+ orders.

**Solution**:
1. Implement pagination or limit query results
2. Add virtual scrolling for order lists
3. Optimize Firestore queries with proper indexes
4. Consider caching frequently accessed data

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic Kanban board
- ✅ Manual status updates
- ✅ Real-time synchronization
- ✅ Advanced filtering
- ✅ Pipeline statistics

### Phase 2 (Planned)
- [ ] Drag-and-drop status changes
- [ ] Bulk status updates
- [ ] Staff assignment to orders
- [ ] Notes on status changes
- [ ] Print order sheets
- [ ] Export pipeline reports

### Phase 3 (Future)
- [ ] AI-powered completion time estimation
- [ ] Predictive bottleneck alerts
- [ ] Automated status updates based on time
- [ ] Integration with workstation sensors (IoT)
- [ ] Custom pipeline stages per branch
- [ ] Pipeline templates for different order types

## Support

For issues or questions:
- **Technical**: Gachengoh Marugu (jerry@ai-agentsplus.com)
- **Product**: Jerry Nduriri (jerry@ai-agentsplus.com)
- **GitHub Issues**: Create issue in repository

## License

Proprietary - Lorenzo Dry Cleaners Management System
© 2025 AI Agents Plus
