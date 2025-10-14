# Component Library Documentation

Complete reference for all UI components in the Lorenzo Dry Cleaners Management System.

---

## Table of Contents

1. [Status Components](#status-components)
2. [POS Components](#pos-components)
3. [Pipeline Components](#pipeline-components)
4. [Customer Portal Components](#customer-portal-components)
5. [Base UI Components](#base-ui-components)

---

## Status Components

### StatusBadge

Visual indicator for order status with color coding and icons.

**Import:**
```tsx
import { StatusBadge } from '@/components/ui/status-badge';
```

**Props:**
```tsx
interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
<StatusBadge status="washing" />
<StatusBadge status="ready" size="lg" />
<StatusBadge status="delivered" showIcon={false} />
```

**Status Values:**
- `received` - Gray
- `queued` - Gray
- `washing` - Blue (animated pulse)
- `drying` - Blue (animated pulse)
- `ironing` - Blue (animated pulse)
- `quality_check` - Purple
- `packaging` - Cyan
- `ready` - Green
- `out_for_delivery` - Amber (animated pulse)
- `delivered` - Green
- `collected` - Green

### PaymentBadge

Visual indicator for payment status.

**Import:**
```tsx
import { PaymentBadge } from '@/components/ui/payment-badge';
```

**Props:**
```tsx
interface PaymentBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  amount?: number;
  className?: string;
}
```

**Usage:**
```tsx
<PaymentBadge status="paid" />
<PaymentBadge status="partial" amount={500} />
<PaymentBadge status="pending" size="lg" />
```

**Status Values:**
- `paid` - Green background, white text
- `partial` - Amber background, white text
- `pending` - Gray background, white text
- `overdue` - Red background, white text
- `refunded` - Purple background, white text

---

## POS Components

### CustomerSearch

Search and select customers for order creation.

**Import:**
```tsx
import { CustomerSearch } from '@/components/features/pos/CustomerSearch';
```

**Props:**
```tsx
interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void;
  onCreateCustomer: () => void;
  recentCustomers?: Customer[];
  className?: string;
}
```

**Usage:**
```tsx
<CustomerSearch
  onSelectCustomer={(customer) => console.log(customer)}
  onCreateCustomer={() => setShowModal(true)}
  recentCustomers={recentCustomers}
/>
```

**Features:**
- Real-time search by name or phone
- Recent customers list
- Quick customer creation
- Mobile responsive

### GarmentEntryForm

Form for adding garment details to an order.

**Import:**
```tsx
import { GarmentEntryForm } from '@/components/features/pos/GarmentEntryForm';
```

**Props:**
```tsx
interface GarmentEntryFormProps {
  onAddGarment: (garment: GarmentFormData & { price: number }) => void;
  onCancel?: () => void;
  className?: string;
}
```

**Usage:**
```tsx
<GarmentEntryForm
  onAddGarment={(garment) => {
    setGarments([...garments, garment]);
  }}
  onCancel={() => resetForm()}
/>
```

**Features:**
- Garment type selection (dropdown)
- Color input
- Brand input (optional)
- Service selection (checkboxes)
- Special instructions textarea
- Photo upload (up to 5 photos)
- Real-time price calculation
- Form validation with Zod

**Services Available:**
- Wash (KES 100)
- Iron (KES 50)
- Starch (KES 30)
- Dry Clean (KES 200)
- Express 24h (+50%)

### GarmentCard

Display a garment in the order list.

**Import:**
```tsx
import { GarmentCard } from '@/components/features/pos/GarmentCard';
```

**Props:**
```tsx
interface GarmentCardProps {
  garment: Garment;
  onEdit?: (garment: Garment) => void;
  onRemove?: (garmentId: string) => void;
  className?: string;
}
```

**Usage:**
```tsx
<GarmentCard
  garment={garment}
  onEdit={(g) => setEditingGarment(g)}
  onRemove={(id) => removeGarment(id)}
/>
```

**Features:**
- Thumbnail display (photo or placeholder)
- Garment details (type, color, brand)
- Services list
- Price display
- Edit/Remove actions
- Special instructions display

### OrderSummary

Sticky summary card for order details and actions.

**Import:**
```tsx
import { OrderSummary } from '@/components/features/pos/OrderSummary';
```

**Props:**
```tsx
interface OrderSummaryProps {
  customer?: Customer;
  garments: Garment[];
  subtotal: number;
  tax?: number;
  total: number;
  estimatedCompletion?: Date;
  paymentStatus?: PaymentStatus;
  onProcessPayment: () => void;
  onSaveDraft?: () => void;
  onClearOrder?: () => void;
  isProcessing?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
<OrderSummary
  customer={selectedCustomer}
  garments={garments}
  subtotal={calculateSubtotal()}
  total={calculateTotal()}
  estimatedCompletion={estimatedDate}
  onProcessPayment={() => setShowPaymentModal(true)}
  onSaveDraft={() => saveDraft()}
  onClearOrder={() => clearAll()}
/>
```

**Features:**
- Customer information display
- Garments summary
- Price breakdown (subtotal, tax, total)
- Estimated completion date
- Payment status badge
- Action buttons (Process Payment, Save Draft, Clear Order)
- Sticky positioning on desktop

---

## Pipeline Components

### PipelineBoard

Kanban-style board for managing order workflow.

**Import:**
```tsx
import { PipelineBoard } from '@/components/features/pipeline/PipelineBoard';
```

**Props:**
```tsx
interface PipelineBoardProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick: (order: Order) => void;
  className?: string;
}
```

**Usage:**
```tsx
<PipelineBoard
  orders={orders}
  onStatusChange={(id, status) => updateOrderStatus(id, status)}
  onOrderClick={(order) => router.push(`/orders/${order.orderId}`)}
/>
```

**Features:**
- 10 status columns (received → delivered)
- Order count per column
- Average time in stage
- Horizontal scroll on desktop
- Collapsible accordion on mobile
- Real-time updates via Firestore listeners

**Columns:**
1. Received
2. Queued
3. Washing
4. Drying
5. Ironing
6. Quality Check
7. Packaging
8. Ready
9. Out for Delivery
10. Delivered

### OrderCard (Pipeline)

Compact order card for pipeline board.

**Import:**
```tsx
import { OrderCard } from '@/components/features/pipeline/OrderCard';
```

**Props:**
```tsx
interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onClick?: () => void;
  className?: string;
}
```

**Usage:**
```tsx
<OrderCard
  order={order}
  onStatusChange={(id, status) => updateStatus(id, status)}
  onClick={() => viewDetails(order)}
/>
```

**Features:**
- Order ID (monospace font)
- Current status badge
- Customer name
- Garment count
- Payment status
- Time in current stage
- Estimated completion
- Urgency color coding (red if overdue, amber if <6h)
- Status change dropdown

---

## Customer Portal Components

### OrderTrackingTimeline

Visual timeline showing order progress.

**Import:**
```tsx
import { OrderTrackingTimeline } from '@/components/features/customer/OrderTrackingTimeline';
```

**Usage:**
```tsx
<OrderTrackingTimeline
  statusHistory={statusHistory}
  currentStatus="washing"
  estimatedCompletion={estimatedDate}
/>
```

**Features:**
- Vertical timeline with nodes
- Completed stages (green checkmark)
- Current stage (blue pulsing circle)
- Pending stages (gray outline)
- Timestamp for each stage
- Connecting lines (green for completed, gray for pending)

### CustomerDashboard

Customer portal home page.

**Features:**
- Welcome message
- Active orders summary
- Quick actions (Track Order, View History, Profile)
- Order count badge
- Total spent display

---

## Base UI Components

### Button

**Variants:**
- `default` - Black background, white text
- `outline` - Transparent background, black border
- `ghost` - Transparent background, no border
- `destructive` - Red background, white text

**Sizes:**
- `sm` - h-9, px-3, text-sm
- `md` - h-10, px-4, text-base (default)
- `lg` - h-11, px-6, text-lg

**Usage:**
```tsx
<Button>Default Button</Button>
<Button variant="outline">Outline Button</Button>
<Button size="lg">Large Button</Button>
<Button disabled>Disabled Button</Button>
```

### Input

**Usage:**
```tsx
<Input
  type="text"
  placeholder="Enter text..."
  className="border-gray-300 focus:border-black"
/>

<Input type="email" required />
<Input type="password" />
<Input type="number" min={0} />
```

### Card

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Select

**Usage:**
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox

**Usage:**
```tsx
<div className="flex items-center gap-2">
  <Checkbox
    id="terms"
    checked={checked}
    onCheckedChange={setChecked}
  />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```

### Dialog (Modal)

**Usage:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>
        Modal description text
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### DropdownMenu

**Usage:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      Options
      <ChevronDown className="ml-2 w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="mr-2 w-4 h-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>
      <Trash2 className="mr-2 w-4 h-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs

**Usage:**
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab2">
    Content for tab 2
  </TabsContent>
</Tabs>
```

### ScrollArea

**Usage:**
```tsx
<ScrollArea className="h-[400px]">
  <div className="space-y-4">
    {/* Scrollable content */}
  </div>
</ScrollArea>
```

---

## Layout Components

### PageContainer

**Usage:**
```tsx
<PageContainer>
  <PageHeader
    title="Page Title"
    description="Page description"
  />

  {/* Page content */}
</PageContainer>
```

### SectionHeader

**Usage:**
```tsx
<SectionHeader
  title="Section Title"
  description="Section description"
  action={
    <Button>
      <Plus className="mr-2 w-4 h-4" />
      Add New
    </Button>
  }
/>
```

---

## Utility Components

### LoadingSpinner

**Usage:**
```tsx
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" /> {/* default */}
<LoadingSpinner size="lg" />
```

### ErrorMessage

**Usage:**
```tsx
<ErrorMessage
  title="Error occurred"
  message="Failed to load data. Please try again."
  retry={() => refetch()}
/>
```

### EmptyState

**Usage:**
```tsx
<EmptyState
  icon={Package}
  title="No orders yet"
  description="Create your first order to get started."
  action={{
    label: 'Create Order',
    onClick: () => router.push('/pos'),
  }}
/>
```

### LoadingSkeleton

**Usage:**
```tsx
<LoadingSkeleton type="card" count={3} />
<LoadingSkeleton type="table" rows={5} />
<LoadingSkeleton type="text" lines={4} />
```

---

## Form Patterns

### Basic Form

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

---

## Responsive Patterns

### Two-Column Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content - 2 columns on desktop */}
  <div className="lg:col-span-2 space-y-6">
    {/* Main content */}
  </div>

  {/* Sidebar - 1 column on desktop, full width on mobile */}
  <div className="lg:col-span-1">
    {/* Sidebar content */}
  </div>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Mobile Menu

```tsx
<div className="lg:hidden">
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost">
        <Menu className="w-6 h-6" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left">
      {/* Mobile navigation */}
    </SheetContent>
  </Sheet>
</div>
```

---

## Best Practices

### DO:
✅ Use semantic HTML (`<button>`, `<nav>`, `<header>`)
✅ Add ARIA labels for icons
✅ Provide alt text for images
✅ Use loading states during async operations
✅ Show success/error feedback
✅ Test keyboard navigation
✅ Test on mobile devices
✅ Maintain 4.5:1 contrast ratio
✅ Use min 44×44px touch targets

### DON'T:
❌ Use divs with onClick (use buttons)
❌ Remove focus indicators
❌ Use color alone to convey meaning
❌ Create inaccessible modals
❌ Forget loading/error states
❌ Ignore mobile users
❌ Use auto-playing animations
❌ Hide important content on mobile

---

## Testing Checklist

- [ ] Component renders correctly
- [ ] Props work as expected
- [ ] Accessible via keyboard
- [ ] Screen reader friendly
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Error states handled
- [ ] Success feedback shown
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets are 44×44px minimum

---

**Last Updated:** October 11, 2025
**Version:** 1.0
