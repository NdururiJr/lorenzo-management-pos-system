# Lorenzo Dry Cleaners - Design System Documentation

## Overview

This document provides comprehensive guidelines for the UI/UX design of the Lorenzo Dry Cleaners Management System. The design follows a **minimalistic black & white theme** with a focus on clarity, accessibility, and mobile-first responsiveness.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Responsive Design](#responsive-design)
7. [Accessibility](#accessibility)
8. [Animation & Transitions](#animation--transitions)
9. [Icon System](#icon-system)
10. [Component Examples](#component-examples)

---

## Design Principles

### Core Values

1. **Minimalistic**
   - Clean layouts with generous whitespace
   - Remove unnecessary visual elements
   - Focus on essential information

2. **High Contrast**
   - Black text on white backgrounds
   - 4.5:1 minimum contrast ratio (WCAG AA)
   - Clear visual hierarchy

3. **Mobile-First**
   - Design for 375px screens first
   - Progressive enhancement for larger screens
   - Touch-friendly targets (min 44×44px)

4. **Fast & Responsive**
   - Instant visual feedback
   - Smooth transitions (200ms)
   - Optimistic UI updates

5. **Accessible**
   - WCAG 2.1 Level AA compliance
   - Keyboard navigation support
   - Screen reader friendly

---

## Color Palette

### Primary Colors (90%+ of UI)

```css
/* Backgrounds */
--background: #FFFFFF;        /* White */
--light-gray: #F9FAFB;       /* Light gray backgrounds */

/* Text */
--primary: #000000;           /* Black - Primary text */
--primary-dark: #1F2937;      /* Gray-900 - Secondary headings */
--secondary: #6B7280;         /* Gray-500 - Secondary text */

/* Borders */
--border: #E5E7EB;           /* Gray-200 - Borders & dividers */
```

### Accent Colors (Use Sparingly - <10% of UI)

```css
/* Status Colors */
--success: #10B981;          /* Green-500 - Success states */
--warning: #F59E0B;          /* Amber-500 - Warning states */
--error: #EF4444;            /* Red-500 - Error states */
--info: #3B82F6;             /* Blue-500 - Info states */

/* Processing States */
--blue-100: #DBEAFE;         /* Washing, Drying, Ironing backgrounds */
--blue-700: #1D4ED8;         /* Washing, Drying, Ironing text */
--purple-100: #EDE9FE;       /* Quality Check background */
--purple-700: #7C3AED;       /* Quality Check text */
--cyan-100: #CFFAFE;         /* Packaging background */
--cyan-700: #0E7490;         /* Packaging text */
```

### Color Usage Guidelines

**DO:**
- Use black (#000000) for primary text
- Use white (#FFFFFF) for backgrounds
- Use accent colors for status indicators only
- Maintain 4.5:1 contrast ratio

**DON'T:**
- Use multiple accent colors in the same component
- Use colored backgrounds for content areas
- Use gradients (except subtle hover states)
- Use low-contrast gray text for important content

---

## Typography

### Font Family

```css
font-family: 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif';
```

**Why Inter?**
- Excellent readability at all sizes
- Professional appearance
- Variable font support
- Open source

### Font Sizes

```css
--text-xs: 0.75rem;      /* 12px - Labels, captions */
--text-sm: 0.875rem;     /* 14px - Secondary text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Section headings */
--text-3xl: 1.875rem;    /* 30px - Page headings */
--text-4xl: 2.25rem;     /* 36px - Hero headings */
--text-5xl: 3rem;        /* 48px - Marketing headings */
```

### Font Weights

```css
--font-normal: 400;      /* Regular text */
--font-medium: 500;      /* Labels, buttons */
--font-semibold: 600;    /* Subheadings */
--font-bold: 700;        /* Headings */
```

### Line Heights

```css
--leading-tight: 1.2;    /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Long-form content */
```

### Typography Scale

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-------------|-------|
| H1 | 36px (text-4xl) | 700 | 1.2 | #000000 |
| H2 | 30px (text-3xl) | 600 | 1.2 | #000000 |
| H3 | 24px (text-2xl) | 600 | 1.2 | #000000 |
| H4 | 20px (text-xl) | 600 | 1.2 | #000000 |
| H5 | 18px (text-lg) | 600 | 1.2 | #000000 |
| Body | 16px (text-base) | 400 | 1.5 | #1F2937 |
| Small | 14px (text-sm) | 400 | 1.5 | #6B7280 |
| Caption | 12px (text-xs) | 400 | 1.5 | #6B7280 |

---

## Spacing & Layout

### Spacing Scale

```css
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
```

### Layout Grid

**Desktop (≥1024px):**
- Max width: 1400px
- Padding: 24px
- Gap: 24px

**Tablet (768px - 1023px):**
- Max width: 100%
- Padding: 20px
- Gap: 20px

**Mobile (<768px):**
- Max width: 100%
- Padding: 16px
- Gap: 16px

### Border Radius

```css
--radius-sm: 0.25rem;    /* 4px - Small elements */
--radius-md: 0.5rem;     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Modals */
--radius-full: 9999px;   /* Circular elements */
```

---

## Components

### Buttons

#### Primary Button
```tsx
<Button className="bg-black hover:bg-gray-800 text-white">
  Primary Action
</Button>
```
- Background: Black (#000000)
- Text: White (#FFFFFF)
- Height: 44px (h-11)
- Padding: 16px 24px
- Border radius: 8px
- Font size: 16px
- Font weight: 500

#### Secondary Button
```tsx
<Button variant="outline">
  Secondary Action
</Button>
```
- Background: Transparent
- Border: 1px solid #E5E7EB
- Text: Black (#000000)
- Hover: Background #F9FAFB

#### Ghost Button
```tsx
<Button variant="ghost">
  Tertiary Action
</Button>
```
- Background: Transparent
- No border
- Text: Black (#000000)
- Hover: Background #F9FAFB

### Inputs

#### Text Input
```tsx
<Input
  type="text"
  placeholder="Enter text..."
  className="border-gray-300 focus:border-black focus:ring-black"
/>
```
- Height: 40px (h-10)
- Padding: 8px 12px
- Border: 1px solid #E5E7EB
- Focus border: Black (#000000)
- Font size: 16px

#### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-10" placeholder="Search..." />
</div>
```

### Cards

#### Basic Card
```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```
- Background: White (#FFFFFF)
- Border: 1px solid #E5E7EB
- Border radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Shadow 0 4px 6px rgba(0,0,0,0.1)

### Status Badges

```tsx
<StatusBadge status="washing" />
<StatusBadge status="ready" />
<StatusBadge status="delivered" />
```

**Status Color Coding:**
- Received / Queued: Gray
- Washing / Drying / Ironing: Blue (with pulse animation)
- Quality Check: Purple
- Packaging: Cyan
- Ready / Delivered: Green
- Out for Delivery: Amber

### Payment Badges

```tsx
<PaymentBadge status="paid" />
<PaymentBadge status="partial" />
<PaymentBadge status="pending" />
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (min-width: 0px) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }

/* Large Desktop */
@media (min-width: 1280px) { ... }
```

### Responsive Patterns

#### Mobile-First Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

#### Responsive Text

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

#### Hide on Mobile

```tsx
<div className="hidden lg:block">
  Desktop only content
</div>
```

---

## Accessibility

### WCAG 2.1 Level AA Compliance

#### Color Contrast
- **Normal text (16px+):** 4.5:1 minimum ✅
- **Large text (24px+):** 3:1 minimum ✅
- **Black on white:** 21:1 ✅

#### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators (2px black outline)
- Logical tab order
- Escape closes modals

#### Screen Readers
```tsx
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>

<img src="..." alt="Descriptive alt text" />

<div role="alert" aria-live="polite">
  Status updated
</div>
```

#### Touch Targets
- Minimum: 44×44px
- Recommended: 48×48px
- Spacing: 8px minimum

---

## Animation & Transitions

### Transition Duration

```css
--duration-fast: 150ms;     /* Hover states */
--duration-normal: 200ms;   /* Standard transitions */
--duration-slow: 300ms;     /* Page transitions */
```

### Common Transitions

#### Hover State
```css
transition: all 200ms ease-in-out;
```

#### Modal Enter/Exit
```css
/* Enter */
opacity: 0 → 1
scale: 0.95 → 1
duration: 200ms

/* Exit */
opacity: 1 → 0
scale: 1 → 0.95
duration: 150ms
```

#### Pulse Animation (Status badges)
```css
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

---

## Icon System

### Lucide React Icons

All icons use **Lucide React** for consistency.

#### Icon Sizes

```tsx
<Icon className="w-4 h-4" />   /* 16px - Small */
<Icon className="w-5 h-5" />   /* 20px - Medium */
<Icon className="w-6 h-6" />   /* 24px - Large */
<Icon className="w-8 h-8" />   /* 32px - Extra large */
```

#### Common Icons

| Icon | Usage |
|------|-------|
| `<User />` | Customer, profile |
| `<Package />` | Garments, orders |
| `<DollarSign />` | Payment, pricing |
| `<Calendar />` | Dates, scheduling |
| `<Clock />` | Time, duration |
| `<Truck />` | Delivery |
| `<CheckCircle2 />` | Success, completed |
| `<AlertCircle />` | Warning, error |
| `<Search />` | Search |
| `<Plus />` | Add, create |
| `<Edit />` | Edit |
| `<Trash2 />` | Delete |

---

## Component Examples

### POS Order Creation

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Left Column - Customer & Garments */}
  <div className="lg:col-span-2 space-y-6">
    <CustomerSearch
      onSelectCustomer={handleSelectCustomer}
      onCreateCustomer={handleCreateCustomer}
    />

    <GarmentEntryForm
      onAddGarment={handleAddGarment}
    />
  </div>

  {/* Right Column - Order Summary */}
  <div className="lg:col-span-1">
    <OrderSummary
      customer={selectedCustomer}
      garments={garments}
      total={totalAmount}
      onProcessPayment={handlePayment}
    />
  </div>
</div>
```

### Pipeline Board

```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold">Pipeline Board</h1>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="All Branches" />
      </SelectTrigger>
    </Select>
  </div>

  {/* Board */}
  <PipelineBoard
    orders={orders}
    onStatusChange={handleStatusChange}
    onOrderClick={handleOrderClick}
  />
</div>
```

### Customer Portal - Order Tracking

```tsx
<div className="max-w-2xl mx-auto space-y-6">
  <Card className="p-6">
    <h2 className="text-2xl font-semibold mb-4">
      Order #{orderId}
    </h2>

    {/* Status Timeline */}
    <div className="space-y-4">
      {statusHistory.map((status, index) => (
        <div key={index} className="flex gap-4">
          <StatusIcon status={status.name} />
          <div>
            <p className="font-medium">{status.label}</p>
            <p className="text-sm text-gray-500">
              {formatDate(status.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Card>
</div>
```

---

## File Structure

```
components/
├── ui/                          # Base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── status-badge.tsx        # ✅ Created
│   ├── payment-badge.tsx       # ✅ Created
│   └── scroll-area.tsx         # ✅ Created
│
├── features/                    # Feature-specific components
│   ├── pos/
│   │   ├── CustomerSearch.tsx  # ✅ Created
│   │   ├── GarmentEntryForm.tsx # ✅ Created
│   │   ├── GarmentCard.tsx     # ✅ Created
│   │   └── OrderSummary.tsx    # ✅ Created
│   │
│   ├── pipeline/
│   │   ├── PipelineBoard.tsx   # ✅ Created
│   │   └── OrderCard.tsx       # ✅ Created
│   │
│   └── customer/
│       ├── OrderTrackingTimeline.tsx
│       └── CustomerDashboard.tsx
```

---

## Design Checklist

Before launching any new feature, verify:

- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] All interactive elements are keyboard accessible
- [ ] Touch targets are at least 44×44px
- [ ] Focus indicators are visible
- [ ] Screen reader labels are added
- [ ] Mobile responsive (375px - 1920px)
- [ ] Loading states implemented
- [ ] Error states handled gracefully
- [ ] Success feedback provided
- [ ] Animations are smooth (200ms)

---

## Resources

- **Design Tool:** Figma (optional)
- **Icons:** [Lucide Icons](https://lucide.dev)
- **Colors:** [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- **Accessibility:** [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **Typography:** [Inter Font](https://fonts.google.com/specimen/Inter)

---

**Last Updated:** October 11, 2025
**Version:** 1.0
**Maintained By:** UI/UX Design Team

---

**Remember:** Less is more. When in doubt, remove visual elements rather than add them. Focus on clarity, speed, and accessibility.
