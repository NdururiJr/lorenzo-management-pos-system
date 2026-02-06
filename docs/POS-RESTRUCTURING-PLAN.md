# POS Page Restructuring Plan

## Overview

Restructure the POS page (`c:\POS\app\(dashboard)\pos\page.tsx`) to match the reference design (`c:\POS\reference\lorenzo-pos-dashboard.jsx`) layout while **preserving all existing business logic**.

## Current vs Target Layout

### Current Layout (3-Column Form-Based)
```
┌─ Header (Title + Stats) ─────────────────────────────────────┐
├──────────────┬──────────────────────────┬────────────────────┤
│ LEFT (1/3)   │ CENTER (2/3)             │                    │
│              │                          │                    │
│ Customer     │ Garment Entry Form       │                    │
│ Search/Card  │ Garment List             │                    │
│              │ Collection Method        │                    │
│ Order Summary│ Return Method            │                    │
│ (sticky)     │                          │                    │
└──────────────┴──────────────────────────┴────────────────────┘
```

### Target Layout (Category Grid + Detailed Form)
```
┌─ Header (Search Bar + New Order + Icons) ────────────────────┐
├──────────────────────────────────────────────────────────────┤
│ Category Grid (6 columns)                                     │
│ [All] [Shirts] [Suits] [Dresses] [Household] [Specialty]     │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┬──────────────────────────────┐│
│ │ Service Cards Grid (3 cols) │  Garment Entry Form          ││
│ │ (scrollable, left)          │  (right, sticky)             ││
│ │ ┌─────┐ ┌─────┐ ┌─────┐    │  - Pre-filled from card      ││
│ │ │Card │ │Card │ │Card │    │  - Type, Color, Brand        ││
│ │ │Click│ │Click│ │Click│    │  - Services (checkboxes)     ││
│ │ └─────┘ └─────┘ └─────┘    │  - Photos, Instructions      ││
│ │ ...                        │  - Initial Inspection        ││
│ │                            │  - Add to Order button       ││
│ └─────────────────────────────┴──────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│ Bottom Order Bar (Customer | Cart Items | Payment | Total)    │
└──────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Service Catalog Approach
**Decision:** Create predefined service items that combine garment type + service into quick-add cards.

**Example Service Items:**
| Name | Type | Service | Price | Category |
|------|------|---------|-------|----------|
| Business Shirt | Wash & Press | wash,iron | 200 | Shirts & Tops |
| Executive Suit | 2-Piece Premium | dry-clean | 850 | Suits & Jackets |
| Evening Dress | Delicate Clean | dry-clean | 750 | Dresses |
| Duvet Cover | King Size | wash | 800 | Household |
| Wedding Gown | Preservation | dry-clean,special | 3500 | Specialty |

### 2. Preserving Business Logic
All existing functionality MUST be preserved:
- ✅ Customer search and selection
- ✅ Order creation with Firestore
- ✅ Payment processing (Cash, M-Pesa, Card, Credit)
- ✅ Receipt generation
- ✅ Collection/Return methods (accessible via modal)
- ✅ Garment inspection (accessible via cart item edit)

### 3. Detailed Entry with Category Grid
- **Category grid:** Visual filter for service types (like reference)
- **Detailed form:** Keep full GarmentEntryForm with color, brand, photos, inspection
- **Pre-fill:** When clicking a service card, pre-fill the form with that garment type and services
- **User edits:** User can still modify color, brand, add photos, inspection notes

---

## Implementation Steps

### Step 1: Create Service Catalog Data Structure

**New File:** `c:\POS\lib\data\service-catalog.ts`

```typescript
export interface ServiceItem {
  id: string;
  name: string;
  type: string;           // Garment type
  serviceType: string;    // Display name
  services: string[];     // Service IDs for pricing
  price: number;
  turnaround: string;
  category: string;
  icon: string;           // Emoji
  available: boolean;
}

export interface ServiceCategory {
  name: string;
  icon: string;
  color: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { name: 'All Services', icon: '✨', color: '#2DD4BF' },
  { name: 'Shirts & Tops', icon: '👔', color: '#14524A' },
  { name: 'Suits & Jackets', icon: '🤵', color: '#0F3D38' },
  { name: 'Dresses', icon: '👗', color: '#1E6B5E' },
  { name: 'Household', icon: '🏠', color: '#14524A' },
  { name: 'Specialty', icon: '⭐', color: '#C9A962' },
];

export const SERVICE_ITEMS: ServiceItem[] = [
  // Shirts & Tops
  { id: 'business-shirt', name: 'Business Shirt', type: 'Shirt', serviceType: 'Wash & Press', services: ['wash', 'iron'], price: 200, turnaround: '24h', category: 'Shirts & Tops', icon: '👔', available: true },
  { id: 'silk-blouse', name: 'Silk Blouse', type: 'Blouse', serviceType: 'Hand Finish', services: ['dry-clean'], price: 350, turnaround: '48h', category: 'Shirts & Tops', icon: '👚', available: true },
  { id: 'polo-shirt', name: 'Polo Shirt', type: 'Shirt', serviceType: 'Wash & Fold', services: ['wash'], price: 120, turnaround: '24h', category: 'Shirts & Tops', icon: '👕', available: true },

  // Suits & Jackets
  { id: 'executive-suit', name: 'Executive Suit', type: 'Suit', serviceType: '2-Piece Premium', services: ['dry-clean'], price: 850, turnaround: '48h', category: 'Suits & Jackets', icon: '🤵', available: true },
  { id: 'blazer', name: 'Blazer', type: 'Jacket', serviceType: 'Dry Clean', services: ['dry-clean'], price: 550, turnaround: '48h', category: 'Suits & Jackets', icon: '🧥', available: true },
  { id: 'winter-coat', name: 'Winter Coat', type: 'Coat', serviceType: 'Deep Clean', services: ['dry-clean'], price: 1200, turnaround: '72h', category: 'Suits & Jackets', icon: '🧥', available: true },

  // Dresses
  { id: 'evening-dress', name: 'Evening Dress', type: 'Dress', serviceType: 'Delicate Clean', services: ['dry-clean'], price: 750, turnaround: '72h', category: 'Dresses', icon: '👗', available: true },
  { id: 'maxi-dress', name: 'Maxi Dress', type: 'Dress', serviceType: 'Steam Press', services: ['iron'], price: 500, turnaround: '48h', category: 'Dresses', icon: '👗', available: true },

  // Household
  { id: 'duvet-cover', name: 'Duvet Cover', type: 'Bedding', serviceType: 'King Size', services: ['wash'], price: 800, turnaround: '48h', category: 'Household', icon: '🛏️', available: true },
  { id: 'curtains', name: 'Curtains', type: 'Curtains', serviceType: 'Per Panel', services: ['dry-clean'], price: 450, turnaround: '72h', category: 'Household', icon: '🪟', available: true },
  { id: 'bed-sheets', name: 'Bed Sheets', type: 'Bedding', serviceType: 'Full Set', services: ['wash'], price: 400, turnaround: '24h', category: 'Household', icon: '🛏️', available: true },

  // Specialty
  { id: 'wedding-gown', name: 'Wedding Gown', type: 'Dress', serviceType: 'Preservation', services: ['dry-clean'], price: 3500, turnaround: '7 days', category: 'Specialty', icon: '👰', available: true },
  { id: 'leather-jacket', name: 'Leather Jacket', type: 'Jacket', serviceType: 'Conditioning', services: ['dry-clean'], price: 1800, turnaround: '5 days', category: 'Specialty', icon: '🧥', available: true },
  { id: 'suede-shoes', name: 'Suede Shoes', type: 'Other', serviceType: 'Restoration', services: ['dry-clean'], price: 950, turnaround: '5 days', category: 'Specialty', icon: '👞', available: true },
];
```

### Step 2: Create New POS Components

#### 2.1 POSHeader Component
**New File:** `c:\POS\components\features\pos\POSHeader.tsx`

- Search input with teal focus border
- "New Order" button (teal gradient)
- Printer and Settings icon buttons
- Customer quick-select dropdown

#### 2.2 ServiceCategoryTabs Component
**New File:** `c:\POS\components\features\pos\ServiceCategoryTabs.tsx`

- 6-column grid of category buttons
- Active state with teal gradient background
- Emoji icons
- Filter services by category

#### 2.3 ServiceGrid Component
**New File:** `c:\POS\components\features\pos\ServiceGrid.tsx`

- 5-column scrollable grid
- Service cards with:
  - Icon (emoji in teal gradient box)
  - Name and type
  - Price (bold)
  - Turnaround badge
  - "Add" button (teal gradient)
- Click to add to cart

#### 2.4 POSBottomBar Component
**New File:** `c:\POS\components\features\pos\POSBottomBar.tsx`

- Fixed bottom bar layout
- Customer avatar + info (left)
- Cart items (horizontal scroll, center)
- Payment method buttons (M-Pesa, Card)
- Total display + "Confirm Order" button (right)

#### 2.5 CartItem Component
**New File:** `c:\POS\components\features\pos\CartItem.tsx`

- Compact item display with icon
- Name, quantity, price
- Remove button (X)
- Click to edit (opens inspection modal)

### Step 3: Update Main POS Page

**File:** `c:\POS\app\(dashboard)\pos\page.tsx`

#### State Changes:
```typescript
// Add new states
const [activeCategory, setActiveCategory] = useState('All Services');
const [searchQuery, setSearchQuery] = useState('');
const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

// Keep existing states for:
// - selectedCustomer, garments
// - collectionMethod, returnMethod (move to modal)
// - paymentModal, receiptModal
// - isProcessing, createdOrder
```

#### New Layout Structure:
```tsx
<div className="h-screen flex flex-col bg-lorenzo-cream">
  {/* Header */}
  <POSHeader
    searchQuery={searchQuery}
    onSearchChange={setSearchQuery}
    customer={selectedCustomer}
    onSelectCustomer={handleSelectCustomer}
    onNewOrder={handleClearOrder}
  />

  {/* Main Content */}
  <div className="flex-1 flex flex-col overflow-hidden p-5 gap-4">
    {/* Category Tabs */}
    <ServiceCategoryTabs
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    />

    {/* Two-Column Layout: Service Grid + Form */}
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 overflow-hidden">
      {/* Left: Service Cards Grid (scrollable) */}
      <ServiceGrid
        category={activeCategory}
        searchQuery={searchQuery}
        onSelectService={handleSelectService} // Pre-fills form
      />

      {/* Right: Garment Entry Form (sticky) */}
      <div className="overflow-auto">
        <GarmentEntryForm
          prefillData={selectedService}    // Pre-fill from service card
          onAddGarment={handleAddGarment}
          onCancel={handleClearForm}
        />
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <POSBottomBar
    customer={selectedCustomer}
    cart={garments}                         // Use existing garments array
    onRemoveItem={handleRemoveGarment}
    onEditItem={handleEditGarment}
    onSelectCustomer={() => setShowCustomerSearch(true)}
    onConfirmOrder={handleProcessPayment}
    isProcessing={isProcessing}
  />

  {/* Existing Modals - Keep All */}
  <CreateCustomerModal ... />
  <CustomerSearchModal ... />               // Move customer search to modal
  <PaymentModal ... />
  <ReceiptPreview ... />
  <OrderOptionsModal ... />                 // Collection/Return in modal
</div>
```

### Step 4: Create Supporting Modals

#### 4.1 OrderOptionsModal
**New File:** `c:\POS\components\features\pos\OrderOptionsModal.tsx`

- Move CollectionMethodSelector and ReturnMethodSelector into a modal
- Opens before payment processing
- Accessible via "Options" button in bottom bar

#### 4.2 CustomerSearchModal
**New File:** `c:\POS\components\features\pos\CustomerSearchModal.tsx`

- Wraps existing CustomerSearch component
- Opens when clicking customer area in bottom bar
- Dialog-based for cleaner UX

### Step 5: Style Updates

All new components use the teal/gold/cream theme:
- Background: `bg-lorenzo-cream` (#F5F5F0)
- Cards: `bg-white` with `border-lorenzo-teal/10`
- Buttons: `bg-linear-to-br from-lorenzo-deep-teal to-lorenzo-teal`
- Active states: Teal gradient
- Text: `text-lorenzo-dark-teal` for headings
- Accents: `text-lorenzo-accent-teal`

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/data/service-catalog.ts` | Service items and categories data |
| `components/features/pos/POSHeader.tsx` | Top header with search and actions |
| `components/features/pos/ServiceCategoryTabs.tsx` | Category filter tabs |
| `components/features/pos/ServiceGrid.tsx` | Service cards grid |
| `components/features/pos/ServiceCard.tsx` | Individual service card |
| `components/features/pos/POSBottomBar.tsx` | Bottom order bar |
| `components/features/pos/CartItemChip.tsx` | Cart item in bottom bar |
| `components/features/pos/OrderOptionsModal.tsx` | Collection/return options modal |
| `components/features/pos/CustomerSearchModal.tsx` | Customer search in modal (wraps existing) |

## Files to Modify

| File | Changes |
|------|---------|
| `app/(dashboard)/pos/page.tsx` | Complete layout restructure |
| `components/features/pos/GarmentEntryForm.tsx` | Add `prefillData` prop for pre-filling from service card |

## Files to Keep (No Changes)

| File | Reason |
|------|--------|
| `CustomerSearch.tsx` | Reuse inside CustomerSearchModal |
| `CustomerCard.tsx` | Reuse in bottom bar customer display |
| `CreateCustomerModal.tsx` | Keep as-is |
| `GarmentInitialInspection.tsx` | Keep as-is, shown after garment in form |
| `PaymentModal.tsx` | Keep as-is |
| `ReceiptPreview.tsx` | Keep as-is |
| `CollectionMethodSelector.tsx` | Reuse in OrderOptionsModal |
| `ReturnMethodSelector.tsx` | Reuse in OrderOptionsModal |

---

## Order Flow Comparison

### Current Flow:
1. Select customer → 2. Add garments via form → 3. Select collection/return → 4. Process payment → 5. Receipt

### New Flow:
1. Browse service cards by category → 2. Click card to pre-fill form → 3. Add color/brand/inspection details → 4. Add to order → 5. Repeat for more items → 6. Select customer (if not done) → 7. Click "Confirm Order" → 8. Set collection/return options (modal) → 9. Process payment → 10. Receipt

### Key UX Improvements:
- **Visual browsing:** See all services at a glance with emoji icons and prices
- **Category filtering:** Quickly find Shirts, Suits, Dresses, etc.
- **Search:** Filter services by name
- **Pre-fill:** Clicking a service pre-fills type and services, user adds color/brand
- **Detailed entry preserved:** Full form with photos, inspection, instructions
- **Bottom bar:** Always visible cart, customer, and total

---

## Rollback Strategy

The existing POS page will be preserved:
1. Rename current `pos/page.tsx` to `pos/page-legacy.tsx`
2. Create new `pos/page.tsx` with grid layout
3. If issues arise, swap back by renaming files
4. All existing components remain unchanged
