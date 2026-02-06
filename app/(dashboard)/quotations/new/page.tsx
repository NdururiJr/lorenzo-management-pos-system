'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  User,
  Package,
  Calculator,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Get Firebase auth token
 */
async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

interface Customer {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email?: string;
}

interface QuotationItem {
  garmentType: string;
  quantity: number;
  services: string[];
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

const GARMENT_TYPES = [
  'Shirt',
  'Trousers',
  'Suit (2pc)',
  'Suit (3pc)',
  'Dress',
  'Skirt',
  'Jacket',
  'Coat',
  'Sweater',
  'Blouse',
  'T-Shirt',
  'Jeans',
  'Shorts',
  'Bedding Set',
  'Curtains',
  'Rug',
  'Other',
];

const SERVICES = [
  { id: 'dry_clean', name: 'Dry Clean', basePrice: 350 },
  { id: 'laundry', name: 'Laundry', basePrice: 150 },
  { id: 'press', name: 'Press Only', basePrice: 100 },
  { id: 'stain_removal', name: 'Stain Removal', basePrice: 200 },
  { id: 'alterations', name: 'Alterations', basePrice: 300 },
  { id: 'leather_care', name: 'Leather Care', basePrice: 500 },
];

export default function NewQuotationPage() {
  const router = useRouter();
  const { userData } = useAuth();

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Quotation items state
  const [items, setItems] = useState<QuotationItem[]>([
    {
      garmentType: '',
      quantity: 1,
      services: [],
      unitPrice: 0,
      totalPrice: 0,
    },
  ]);

  // Other quotation details
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(7);
  const [estimatedDays, setEstimatedDays] = useState(3);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search customers
  useEffect(() => {
    const searchCustomers = async () => {
      if (!customerSearch || customerSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const customersRef = collection(db, 'customers');
        const searchLower = customerSearch.toLowerCase();

        // Search by phone (exact match prefix)
        const phoneQuery = query(
          customersRef,
          where('phone', '>=', customerSearch),
          where('phone', '<=', customerSearch + '\uf8ff'),
          limit(5)
        );

        const phoneSnapshot = await getDocs(phoneQuery);
        const phoneResults = phoneSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Customer[];

        // For name search, we need to fetch and filter client-side
        // (Firestore doesn't support case-insensitive search)
        const allQuery = query(customersRef, limit(50));
        const allSnapshot = await getDocs(allQuery);
        const nameResults = allSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Customer))
          .filter((c) => c.name?.toLowerCase().includes(searchLower))
          .slice(0, 5);

        // Combine and dedupe
        const combined = [...phoneResults, ...nameResults];
        const unique = combined.filter(
          (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
        );

        setSearchResults(unique.slice(0, 10));
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [customerSearch]);

  // Calculate item price based on services
  const calculateItemPrice = (services: string[], quantity: number): number => {
    const serviceTotal = services.reduce((sum, serviceId) => {
      const service = SERVICES.find((s) => s.id === serviceId);
      return sum + (service?.basePrice || 0);
    }, 0);
    return serviceTotal * quantity;
  };

  // Update item
  const updateItem = (index: number, updates: Partial<QuotationItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, ...updates };
        // Recalculate total if services or quantity changed
        if ('services' in updates || 'quantity' in updates) {
          updated.totalPrice = calculateItemPrice(updated.services, updated.quantity);
          updated.unitPrice = updated.quantity > 0 ? updated.totalPrice / updated.quantity : 0;
        }
        return updated;
      })
    );
  };

  // Add new item
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        garmentType: '',
        quantity: 1,
        services: [],
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  // Remove item
  const removeItem = (index: number) => {
    if (items.length === 1) {
      alert('At least one item is required');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Submit quotation
  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    const validItems = items.filter((item) => item.garmentType && item.services.length > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item with garment type and services');
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      alert('Authentication required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          branchId: userData?.branchId,
          items: validItems,
          deliveryFee,
          discountAmount,
          discountReason: discountReason || undefined,
          notes: notes || undefined,
          validDays,
          estimatedDays,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create quotation');
      }

      const data = await response.json();

      alert(`Quotation ${data.data.quotationId} created successfully`);

      router.push(`/quotations/${data.data.quotationId}`);
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Create Quotation"
        description="Create a new quotation for a customer"
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
              <CardDescription>Search and select a customer</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
                  <div>
                    <div className="font-medium">{selectedCustomer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCustomer.phone}
                    </div>
                    {selectedCustomer.email && (
                      <div className="text-sm text-muted-foreground">
                        {selectedCustomer.email}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch('');
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setSearchResults([]);
                            setCustomerSearch('');
                          }}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-lg p-3 text-center text-muted-foreground">
                      Searching...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items
              </CardTitle>
              <CardDescription>Add garments and services to the quotation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Garment Type</Label>
                      <Select
                        value={item.garmentType}
                        onValueChange={(value) =>
                          updateItem(index, { garmentType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select garment type" />
                        </SelectTrigger>
                        <SelectContent>
                          {GARMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, { quantity: parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Services</Label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICES.map((service) => (
                        <Badge
                          key={service.id}
                          variant={
                            item.services.includes(service.id) ? 'default' : 'outline'
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            const newServices = item.services.includes(service.id)
                              ? item.services.filter((s) => s !== service.id)
                              : [...item.services, service.id];
                            updateItem(index, { services: newServices });
                          }}
                        >
                          {service.name} ({formatCurrency(service.basePrice)})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Special Instructions (Optional)</Label>
                    <Input
                      placeholder="Any special handling instructions..."
                      value={item.specialInstructions || ''}
                      onChange={(e) =>
                        updateItem(index, { specialInstructions: e.target.value })
                      }
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">Item Total: </span>
                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Another Item
              </Button>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Fee (KES)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Amount (KES)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="space-y-2">
                  <Label>Discount Reason</Label>
                  <Input
                    placeholder="Reason for discount..."
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid For (Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={validDays}
                    onChange={(e) => setValidDays(parseInt(e.target.value) || 7)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estimated Completion (Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 3)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Additional notes for this quotation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items
                  .filter((item) => item.garmentType)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.garmentType} x{item.quantity}
                      </span>
                      <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
              </div>

              <div className="border-t pt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCustomer}
              >
                {isSubmitting ? 'Creating...' : 'Create Quotation'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
