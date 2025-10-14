# Customer Portal - Quick Start Guide

## For Developers

### Running the Customer Portal

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the customer portal:**
   ```
   http://localhost:3000/portal
   ```

3. **Login as a customer:**
   - You need a user account with `role: 'customer'` in Firestore
   - Use the phone OTP login at `/login`

---

## Creating Test Customers

### Method 1: Via Firebase Console

1. Go to Firestore Database
2. Navigate to the `customers` collection
3. Add a new document with this structure:

```json
{
  "customerId": "CUST-TEST-001",
  "name": "Test Customer",
  "phone": "+254712345678",
  "email": "test@example.com",
  "addresses": [
    {
      "id": "ADDR-1",
      "label": "Home",
      "address": "123 Test Street, Kilimani, Nairobi"
    }
  ],
  "preferences": {
    "whatsappNotifications": true,
    "emailNotifications": true,
    "smsNotifications": false,
    "language": "en"
  },
  "orderCount": 0,
  "totalSpent": 0,
  "createdAt": <Firestore Timestamp>
}
```

4. Add a corresponding user in Firebase Authentication with the same phone number
5. Add user document in the `users` collection:

```json
{
  "uid": "<Firebase Auth UID>",
  "role": "customer",
  "name": "Test Customer",
  "phone": "+254712345678",
  "email": "test@example.com",
  "active": true,
  "createdAt": <Firestore Timestamp>
}
```

### Method 2: Via Code (Future)

A customer registration flow will be added that handles this automatically.

---

## Testing Order Tracking

### Create a Test Order

1. Use the POS system (staff dashboard) to create an order
2. Assign it to your test customer
3. The order will appear in the customer portal

### Simulate Status Changes

Update the order status in Firestore:
```javascript
// In Firebase Console or via script
{
  "status": "washing",  // Change this
  "statusHistory": [
    {
      "status": "received",
      "timestamp": <Timestamp>,
      "updatedBy": "staff-uid"
    },
    {
      "status": "washing",
      "timestamp": <Timestamp>,
      "updatedBy": "staff-uid"
    }
  ]
}
```

The customer portal will update in real-time!

---

## Available Routes

### Customer Portal Routes

| Route | Description | Authentication Required |
|-------|-------------|------------------------|
| `/portal` | Dashboard home | Yes (Customer only) |
| `/orders` | Orders list with filtering | Yes (Customer only) |
| `/orders/[orderId]` | Order tracking detail | Yes (Customer only) |
| `/profile` | Customer profile | Yes (Customer only) |

### Navigation

- **Desktop:** Header menu + direct links
- **Mobile:** Bottom navigation bar (Home, Orders, Profile)

---

## Component Usage

### Using Customer Components

```typescript
import {
  CustomerHeader,
  MobileBottomNav,
  OrderTrackingTimeline,
  ActiveOrders,
} from '@/components/features/customer';

// In your page
export default function MyPage() {
  return (
    <div>
      <CustomerHeader />
      <ActiveOrders orders={orders} />
      <MobileBottomNav />
    </div>
  );
}
```

### Using Order Tracking Timeline

```typescript
import { OrderTrackingTimeline } from '@/components/features/customer';

<OrderTrackingTimeline
  currentStatus={order.status}
  statusHistory={order.statusHistory.map(h => ({
    status: h.status,
    timestamp: h.timestamp.toDate(),
  }))}
  estimatedCompletion={order.estimatedCompletion?.toDate()}
  actualCompletion={order.actualCompletion?.toDate()}
/>
```

---

## Styling Guidelines

### Mobile-First Approach

Always design for mobile first, then enhance for desktop:

```tsx
// Mobile by default, desktop with md: prefix
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">Content</div>
</div>
```

### Black & White Theme

Use the established color palette:

```tsx
// Primary colors
className="bg-black text-white"
className="bg-white text-black"

// Accents (use sparingly)
className="text-green-600"   // Success
className="text-blue-600"    // Info
className="text-amber-600"   // Warning
className="text-red-600"     // Error
```

---

## Common Tasks

### Adding a New Page

1. Create the page file:
   ```typescript
   // app/(customer)/new-page/page.tsx
   'use client';

   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. Add navigation link:
   ```typescript
   // In CustomerHeader or MobileBottomNav
   <Link href="/new-page">New Page</Link>
   ```

### Adding a New Component

1. Create component file:
   ```typescript
   // components/features/customer/NewComponent.tsx
   'use client';

   export function NewComponent({ data }) {
     return <div>{data}</div>;
   }
   ```

2. Export from index:
   ```typescript
   // components/features/customer/index.ts
   export { NewComponent } from './NewComponent';
   ```

3. Use in pages:
   ```typescript
   import { NewComponent } from '@/components/features/customer';
   ```

### Fetching Data

Use React Query for data fetching:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getCustomer } from '@/lib/db/customers';

const { data, isLoading, error } = useQuery({
  queryKey: ['customer', customerId],
  queryFn: () => getCustomer(customerId),
});
```

### Real-Time Updates

Use Firestore listeners:

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'orders', orderId),
    (snapshot) => {
      const data = snapshot.data();
      setOrder(data);
    }
  );

  return () => unsubscribe();
}, [orderId]);
```

---

## Troubleshooting

### Customer Can't Access Portal

**Problem:** Redirected to `/dashboard` or `/login`

**Solution:**
- Check user's `role` in Firestore `users` collection
- Must be exactly `"customer"` (lowercase)
- User must be authenticated

### Orders Not Showing

**Problem:** Empty state or loading forever

**Solution:**
- Check `customerId` in orders matches `user.uid`
- Ensure orders exist in Firestore
- Check console for errors
- Verify Firestore security rules allow customer to read their orders

### Real-Time Updates Not Working

**Problem:** Status changes don't reflect immediately

**Solution:**
- Check Firestore listener is set up correctly
- Verify WebSocket connection in Network tab
- Check for JavaScript errors in console
- Ensure Firestore rules allow customer to read orders

### Mobile Navigation Not Showing

**Problem:** Bottom nav doesn't appear on mobile

**Solution:**
- Check screen width (shows only < 768px)
- Verify `MobileBottomNav` is included in layout
- Check CSS classes are correct
- Inspect element to see if it's rendered but hidden

---

## Best Practices

### Performance

1. **Use React Query for caching:**
   - Automatic background refetching
   - Stale-while-revalidate pattern
   - Reduced unnecessary requests

2. **Optimize images:**
   - Use next/image component
   - Lazy load where possible
   - Compress images

3. **Code splitting:**
   - Use dynamic imports for large components
   - Lazy load routes not immediately needed

### Security

1. **Always check user role:**
   - Verify customer role in layout
   - Don't rely on client-side checks alone
   - Enforce with Firestore security rules

2. **Validate data:**
   - Use Zod schemas for validation
   - Sanitize user inputs
   - Handle errors gracefully

3. **Protect sensitive data:**
   - Don't expose other customers' data
   - Filter queries by customer ID
   - Use proper authentication

### Accessibility

1. **Semantic HTML:**
   - Use proper heading hierarchy
   - Use buttons for actions
   - Use links for navigation

2. **Keyboard navigation:**
   - Ensure all interactive elements are focusable
   - Visible focus indicators
   - Logical tab order

3. **Screen readers:**
   - Use ARIA labels where needed
   - Provide alt text for images
   - Announce dynamic content changes

---

## Deployment

### Before Deploying

- [ ] Test all features
- [ ] Check mobile responsiveness
- [ ] Verify all links work
- [ ] Test with real data
- [ ] Check error handling
- [ ] Verify loading states
- [ ] Test on multiple browsers

### Deploy to Staging

```bash
# Build the app
npm run build

# Test the build locally
npm run start

# Deploy to Firebase Hosting (staging)
firebase deploy --only hosting:staging
```

### Deploy to Production

```bash
# Deploy to production
firebase deploy --only hosting:production
```

---

## Getting Help

### Resources

- **PLANNING.md** - Project overview and architecture
- **TASKS.md** - Current tasks and progress
- **CUSTOMER_PORTAL_SUMMARY.md** - Complete feature documentation
- **Component docs** - JSDoc comments in each component

### Common Issues

Check the troubleshooting section above or:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check Firestore security rules
4. Review network requests
5. Check authentication state

---

## Quick Reference

### Database Operations

```typescript
// Customers
import {
  getCustomer,
  updateCustomer,
  addCustomerAddress,
  updateCustomerAddress,
  removeCustomerAddress,
  updateCustomerPreferences
} from '@/lib/db/customers';

// Orders
import {
  getOrdersByCustomer,
  getOrder
} from '@/lib/db/orders';
```

### UI Components

```typescript
// Layout
import { CustomerHeader, MobileBottomNav } from '@/components/features/customer';

// Cards and Display
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';

// Forms
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Dialogs
import { Dialog } from '@/components/ui/dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
```

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, userData, signOut } = useAuth();
```

---

**Happy coding! 🚀**

For questions or issues, refer to the documentation files or contact the development team.
