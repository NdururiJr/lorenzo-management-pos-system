# UI/UX Integration Guide for Developers

This guide explains how to integrate the designed UI components with backend functionality for the POS System, Pipeline Board, and Customer Portal.

---

## Quick Start

### For POS Developer

Your main files:
```
app/(dashboard)/pos/page.tsx          # Main POS page
components/features/pos/              # POS components
lib/db/customers.ts                   # Customer data operations
lib/db/orders.ts                      # Order data operations
```

### For Pipeline Developer

Your main files:
```
app/(dashboard)/pipeline/page.tsx     # Main pipeline page
components/features/pipeline/         # Pipeline components
lib/db/orders.ts                      # Order data operations
contexts/OrdersContext.tsx            # Real-time order sync
```

---

## Component Integration

### 1. POS System Integration

#### Step 1: Customer Search Component

**Component:** `CustomerSearch.tsx`

**What it provides:**
- Customer search interface
- Recent customers list
- "New Customer" button

**What you need to provide:**

```tsx
// app/(dashboard)/pos/page.tsx
'use client';

import { useState } from 'react';
import { CustomerSearch } from '@/components/features/pos/CustomerSearch';
import { searchCustomers, getRecentCustomers } from '@/lib/db/customers';

export default function POSPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

  // Fetch recent customers on mount
  const { data: recentCustomers } = useQuery({
    queryKey: ['recentCustomers'],
    queryFn: () => getRecentCustomers(10),
  });

  return (
    <div>
      <CustomerSearch
        onSelectCustomer={(customer) => {
          setSelectedCustomer(customer);
        }}
        onCreateCustomer={() => {
          setShowNewCustomerModal(true);
        }}
        recentCustomers={recentCustomers}
      />
    </div>
  );
}
```

**Data Operations (lib/db/customers.ts):**

```tsx
export async function searchCustomers(query: string, limit = 20) {
  // Search in Firestore
  const customersRef = collection(db, 'customers');

  // Search by name
  const nameQuery = query(
    customersRef,
    where('name', '>=', query),
    where('name', '<=', query + '\uf8ff'),
    limit(limit)
  );

  // Search by phone
  const phoneQuery = query(
    customersRef,
    where('phone', '==', query),
    limit(limit)
  );

  // Combine results
  const [nameSnapshot, phoneSnapshot] = await Promise.all([
    getDocs(nameQuery),
    getDocs(phoneQuery),
  ]);

  // Deduplicate and return
  const customers = new Map();

  nameSnapshot.docs.forEach((doc) => {
    customers.set(doc.id, { customerId: doc.id, ...doc.data() });
  });

  phoneSnapshot.docs.forEach((doc) => {
    customers.set(doc.id, { customerId: doc.id, ...doc.data() });
  });

  return Array.from(customers.values());
}

export async function getRecentCustomers(limit = 10) {
  const customersRef = collection(db, 'customers');
  const q = query(
    customersRef,
    orderBy('createdAt', 'desc'),
    limit(limit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    customerId: doc.id,
    ...doc.data(),
  }));
}
```

#### Step 2: Garment Entry Form

**Component:** `GarmentEntryForm.tsx`

**What it provides:**
- Garment details form
- Service selection
- Price calculation
- Photo upload

**What you need to provide:**

```tsx
// app/(dashboard)/pos/page.tsx
import { GarmentEntryForm } from '@/components/features/pos/GarmentEntryForm';

export default function POSPage() {
  const [garments, setGarments] = useState([]);

  const handleAddGarment = (garment) => {
    const newGarment = {
      garmentId: `GARMENT-${Date.now()}`,
      ...garment,
    };
    setGarments([...garments, newGarment]);
  };

  return (
    <GarmentEntryForm
      onAddGarment={handleAddGarment}
    />
  );
}
```

**Photo Upload Implementation:**

```tsx
// lib/storage/photos.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function uploadGarmentPhoto(
  file: File,
  orderId: string,
  garmentId: string
): Promise<string> {
  // Create storage reference
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(
    storage,
    `orders/${orderId}/garments/${garmentId}/${fileName}`
  );

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
```

#### Step 3: Order Summary

**Component:** `OrderSummary.tsx`

**What it provides:**
- Order details display
- Price breakdown
- Action buttons

**What you need to provide:**

```tsx
// app/(dashboard)/pos/page.tsx
import { OrderSummary } from '@/components/features/pos/OrderSummary';

export default function POSPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [garments, setGarments] = useState([]);

  const calculateSubtotal = () => {
    return garments.reduce((sum, g) => sum + g.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.16; // 16% VAT (if applicable)
    return subtotal + tax;
  };

  const handleProcessPayment = () => {
    // Open payment modal
    setShowPaymentModal(true);
  };

  const handleSaveDraft = async () => {
    // Save order as draft
    await createDraftOrder({
      customerId: selectedCustomer.customerId,
      garments,
      status: 'draft',
      totalAmount: calculateTotal(),
    });
  };

  return (
    <OrderSummary
      customer={selectedCustomer}
      garments={garments}
      subtotal={calculateSubtotal()}
      total={calculateTotal()}
      estimatedCompletion={calculateEstimatedCompletion()}
      onProcessPayment={handleProcessPayment}
      onSaveDraft={handleSaveDraft}
      onClearOrder={() => {
        setSelectedCustomer(null);
        setGarments([]);
      }}
    />
  );
}
```

**Order Creation (lib/db/orders.ts):**

```tsx
export async function createOrder(orderData: CreateOrderData) {
  // Generate order ID
  const orderId = generateOrderId(orderData.branchId);

  // Create order document
  const orderRef = doc(db, 'orders', orderId);
  await setDoc(orderRef, {
    orderId,
    customerId: orderData.customerId,
    branchId: orderData.branchId,
    status: 'received',
    garments: orderData.garments,
    totalAmount: orderData.totalAmount,
    paidAmount: orderData.paidAmount || 0,
    paymentStatus: orderData.paidAmount >= orderData.totalAmount ? 'paid' : 'pending',
    estimatedCompletion: orderData.estimatedCompletion,
    createdAt: serverTimestamp(),
    createdBy: orderData.createdBy,
  });

  // Update customer order count
  const customerRef = doc(db, 'customers', orderData.customerId);
  await updateDoc(customerRef, {
    orderCount: increment(1),
    totalSpent: increment(orderData.totalAmount),
  });

  return orderId;
}

function generateOrderId(branchId: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${branchId}-${dateStr}-${randomNum}`;
}
```

---

### 2. Pipeline Board Integration

#### Step 1: Real-Time Orders Context

**Create:** `contexts/OrdersContext.tsx`

```tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OrdersContextValue {
  orders: Order[];
  loading: boolean;
  error: Error | null;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ children, branchId }: { children: React.ReactNode; branchId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Set up real-time listener
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('branchId', '==', branchId),
      where('status', 'in', [
        'received',
        'queued',
        'washing',
        'drying',
        'ironing',
        'quality_check',
        'packaging',
        'ready',
        'out_for_delivery',
      ])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          orderId: doc.id,
          ...doc.data(),
        })) as Order[];

        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [branchId]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    // Trigger notification (optional)
    if (newStatus === 'ready') {
      await sendOrderReadyNotification(orderId);
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, loading, error, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}
```

#### Step 2: Pipeline Board Page

**Create:** `app/(dashboard)/pipeline/page.tsx`

```tsx
'use client';

import { PipelineBoard } from '@/components/features/pipeline/PipelineBoard';
import { useOrders } from '@/contexts/OrdersContext';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

export default function PipelinePage() {
  const router = useRouter();
  const { orders, loading, error, updateOrderStatus } = useOrders();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pipeline Board</h1>
        {/* Add filters here */}
      </div>

      <PipelineBoard
        orders={orders}
        onStatusChange={updateOrderStatus}
        onOrderClick={(order) => {
          router.push(`/orders/${order.orderId}`);
        }}
      />
    </div>
  );
}
```

---

### 3. Customer Portal Integration

#### Customer Authentication

**Create:** `app/(customer)/login/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { sendOTP, verifyOTP } from '@/lib/auth/customer-auth';
import { PhoneInput } from '@/components/ui/phone-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomerLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async () => {
    await sendOTP(phone);
    setOtpSent(true);
  };

  const handleVerifyOTP = async () => {
    await verifyOTP(phone, otp);
    // Redirect to customer dashboard
  };

  return (
    <div>
      {!otpSent ? (
        <>
          <PhoneInput value={phone} onChange={setPhone} />
          <Button onClick={handleSendOTP}>Send OTP</Button>
        </>
      ) : (
        <>
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <Button onClick={handleVerifyOTP}>Verify</Button>
        </>
      )}
    </div>
  );
}
```

#### Order Tracking Timeline

**Component Usage:**

```tsx
// app/(customer)/orders/[orderId]/page.tsx
import { OrderTrackingTimeline } from '@/components/features/customer/OrderTrackingTimeline';

export default function OrderTrackingPage({ params }) {
  const { data: order } = useQuery({
    queryKey: ['order', params.orderId],
    queryFn: () => getOrder(params.orderId),
  });

  return (
    <div>
      <h1>Order #{order.orderId}</h1>
      <OrderTrackingTimeline
        statusHistory={order.statusHistory}
        currentStatus={order.status}
        estimatedCompletion={order.estimatedCompletion}
      />
    </div>
  );
}
```

---

## Data Structures

### Customer

```typescript
interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
  preferences: {
    notifications: boolean;
    language: 'en' | 'sw';
  };
  orderCount: number;
  totalSpent: number;
  createdAt: Date;
}
```

### Order

```typescript
interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  branchId: string;
  status: OrderStatus;
  garments: Garment[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMethod?: 'cash' | 'mpesa' | 'card' | 'credit';
  estimatedCompletion: Date;
  actualCompletion?: Date;
  createdAt: Date;
  createdBy: string;
  specialInstructions?: string;
}
```

### Garment

```typescript
interface Garment {
  garmentId: string;
  type: string;
  color: string;
  brand?: string;
  services: string[];
  price: number;
  specialInstructions?: string;
  photos?: string[];
  status: OrderStatus;
}
```

---

## API Endpoints (if using API routes)

### POST /api/orders

```typescript
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/db/orders';

export async function POST(request: NextRequest) {
  const orderData = await request.json();

  try {
    const orderId = await createOrder(orderData);
    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

### PUT /api/orders/[orderId]/status

```typescript
// app/api/orders/[orderId]/status/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { status } = await request.json();

  try {
    await updateOrderStatus(params.orderId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
```

---

## Testing

### Component Testing

```typescript
// __tests__/components/pos/CustomerSearch.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerSearch } from '@/components/features/pos/CustomerSearch';

describe('CustomerSearch', () => {
  it('renders search input', () => {
    render(
      <CustomerSearch
        onSelectCustomer={jest.fn()}
        onCreateCustomer={jest.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('calls onSelectCustomer when customer is clicked', () => {
    const handleSelect = jest.fn();
    render(
      <CustomerSearch
        onSelectCustomer={handleSelect}
        onCreateCustomer={jest.fn()}
        recentCustomers={[{ customerId: '1', name: 'John Doe', phone: '+254712345678' }]}
      />
    );

    fireEvent.click(screen.getByText('John Doe'));
    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({
      customerId: '1',
    }));
  });
});
```

---

## Next Steps

1. **POS Developer:**
   - Implement customer CRUD operations
   - Implement order creation logic
   - Integrate payment processing
   - Add receipt generation

2. **Pipeline Developer:**
   - Set up real-time Firestore listeners
   - Implement status update logic
   - Add filtering and search
   - Implement pipeline statistics

3. **Both:**
   - Test components with real data
   - Optimize performance
   - Add error handling
   - Test mobile responsiveness

---

## Questions?

Contact UI/UX Designer for clarifications on:
- Component props and usage
- Design specifications
- Responsive behavior
- Accessibility requirements

---

**Last Updated:** October 11, 2025
