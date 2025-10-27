/**
 * POS (Point of Sale) Page
 *
 * Main POS interface for creating new orders.
 * Combines customer selection, garment entry, and payment processing.
 *
 * @module app/(dashboard)/pos/page
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, User, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CustomerSearch } from '@/components/features/pos/CustomerSearch';
import { CreateCustomerModal } from '@/components/features/pos/CreateCustomerModal';
import { CustomerCard } from '@/components/features/pos/CustomerCard';
import { GarmentEntryForm } from '@/components/features/pos/GarmentEntryForm';
import { GarmentCard } from '@/components/features/pos/GarmentCard';
import { GarmentInitialInspection } from '@/components/features/pos/GarmentInitialInspection';
import { OrderSummary } from '@/components/features/pos/OrderSummary';
import { PaymentModal } from '@/components/features/pos/PaymentModal';
import { ReceiptPreview } from '@/components/features/pos/ReceiptPreview';
import { CollectionMethodSelector } from '@/components/features/orders/CollectionMethodSelector';
import { ReturnMethodSelector } from '@/components/features/orders/ReturnMethodSelector';
import { getCustomer } from '@/lib/db/customers';
import { createOrder, generateOrderId, generateGarmentId, calculateEstimatedCompletion } from '@/lib/db/orders';
import type { Customer, Garment, OrderExtended, Address } from '@/lib/db/schema';

interface GarmentFormData {
  type: string;
  color: string;
  brand?: string;
  services: string[];
  price: number;
  specialInstructions?: string;
  photos?: string[];
  // Initial inspection fields (Stage 1 - Optional)
  hasNotableDamage?: boolean;
  initialInspectionNotes?: string;
  initialInspectionPhotos?: string[];
}

export default function POSPage() {
  const { user, userData } = useAuth();

  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(true);

  // Garments state
  const [garments, setGarments] = useState<GarmentFormData[]>([]);

  // Order state
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderExtended | null>(null);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);

  // Collection method state
  const [collectionMethod, setCollectionMethod] = useState<'dropped_off' | 'pickup_required'>('dropped_off');
  const [pickupAddress, setPickupAddress] = useState<Address | undefined>();
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [pickupScheduledTime, setPickupScheduledTime] = useState<Date | undefined>();

  // Return method state
  const [returnMethod, setReturnMethod] = useState<'customer_collects' | 'delivery_required'>('customer_collects');
  const [deliveryAddress, setDeliveryAddress] = useState<Address | undefined>();
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryScheduledTime, setDeliveryScheduledTime] = useState<Date | undefined>();

  // Calculate totals
  const subtotal = garments.reduce((sum, garment) => sum + garment.price, 0);
  const tax = 0; // KES - no VAT on services for now
  const total = subtotal + tax;

  // Calculate estimated completion (48 hours default)
  const estimatedCompletion = new Date(Date.now() + 48 * 60 * 60 * 1000);

  /**
   * Handle customer selection
   */
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
    toast.success(`Customer selected: ${customer.name}`);
  }, []);

  /**
   * Handle customer creation
   */
  const handleCustomerCreated = useCallback(async (customerId: string) => {
    try {
      const customer = await getCustomer(customerId);
      if (customer) {
        setSelectedCustomer(customer);
        setShowCustomerSearch(false);
        toast.success(`Customer created: ${customer.name}`);
      }
    } catch (error) {
      console.error('Error fetching created customer:', error);
      toast.error('Failed to load customer');
    }
  }, []);

  /**
   * Handle changing customer
   */
  const handleChangeCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setShowCustomerSearch(true);
  }, []);

  /**
   * Handle adding garment
   */
  const handleAddGarment = useCallback((garment: GarmentFormData) => {
    setGarments((prev) => [...prev, garment]);
    toast.success(`${garment.type} added to order`);
  }, []);

  /**
   * Handle removing garment
   */
  const handleRemoveGarment = useCallback((index: number) => {
    setGarments((prev) => {
      const removed = prev[index];
      toast.info(`${removed.type} removed from order`);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /**
   * Handle editing garment (simplified - just remove for now)
   */
  const handleEditGarment = useCallback((index: number) => {
    toast.info('Edit functionality coming soon. Please remove and re-add the item.');
  }, []);

  /**
   * Handle updating garment inspection data
   */
  const handleUpdateInspection = useCallback((index: number, inspectionData: {
    hasNotableDamage: boolean;
    initialInspectionNotes: string;
    initialInspectionPhotos: string[];
  }) => {
    setGarments((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        hasNotableDamage: inspectionData.hasNotableDamage,
        initialInspectionNotes: inspectionData.initialInspectionNotes,
        initialInspectionPhotos: inspectionData.initialInspectionPhotos,
      };
      return updated;
    });
  }, []);

  /**
   * Handle clearing order
   */
  const handleClearOrder = useCallback(() => {
    if (garments.length === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear this order? All garments will be removed.'
    );

    if (confirmed) {
      setGarments([]);
      setSelectedCustomer(null);
      setShowCustomerSearch(true);
      toast.success('Order cleared');
    }
  }, [garments.length]);

  /**
   * Handle processing payment (create order first)
   */
  const handleProcessPayment = useCallback(async () => {
    if (!selectedCustomer || garments.length === 0 || !user || !userData?.branchId) {
      toast.error('Please select a customer and add garments');
      return;
    }

    // Validate pickup address if pickup is required
    if (collectionMethod === 'pickup_required' && !pickupAddress) {
      toast.error('Please select a pickup address');
      return;
    }

    // Validate delivery address if delivery is required
    if (returnMethod === 'delivery_required' && !deliveryAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order ID
      const orderId = await generateOrderId(userData.branchId);

      // Check if any garment has express service
      const hasExpress = garments.some((g) =>
        g.services.some((s) => s.toLowerCase().includes('express'))
      );

      // Calculate estimated completion
      const estimatedCompletionTimestamp = calculateEstimatedCompletion(
        garments.length,
        hasExpress
      );

      // Transform garments to proper format with initial inspection data
      const formattedGarments: Garment[] = garments.map((garment, index) => {
        const baseGarment: any = {
          garmentId: generateGarmentId(orderId, index),
          type: garment.type,
          color: garment.color,
          services: garment.services,
          price: garment.price,
          status: 'received',
        };

        // Add optional fields only if they are defined
        if (garment.brand) baseGarment.brand = garment.brand;
        if (garment.specialInstructions) baseGarment.specialInstructions = garment.specialInstructions;
        if (garment.photos) baseGarment.photos = garment.photos;

        // Add initial inspection data if notable damage recorded (Stage 1 Inspection)
        if (garment.hasNotableDamage) {
          baseGarment.hasNotableDamage = true;
          if (garment.initialInspectionNotes) {
            baseGarment.initialInspectionNotes = garment.initialInspectionNotes;
          }
          if (garment.initialInspectionPhotos && garment.initialInspectionPhotos.length > 0) {
            baseGarment.initialInspectionPhotos = garment.initialInspectionPhotos;
          }
        }

        return baseGarment as Garment;
      });

      // Create order object
      const orderData: any = {
        orderId,
        customerId: selectedCustomer.customerId,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        branchId: userData.branchId,
        status: 'received' as const,
        garments: formattedGarments,
        totalAmount: total,
        paidAmount: 0,
        paymentStatus: 'pending' as const,
        estimatedCompletion: estimatedCompletionTimestamp,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
        collectionMethod,
        returnMethod,
        statusHistory: [
          {
            status: 'received' as const,
            timestamp: Timestamp.now(),
            updatedBy: user.uid,
          },
        ],
        updatedAt: Timestamp.now(),
      };

      // Add pickup fields if pickup is required
      if (collectionMethod === 'pickup_required') {
        if (pickupAddress) orderData.pickupAddress = pickupAddress;
        if (pickupInstructions) orderData.pickupInstructions = pickupInstructions;
        if (pickupScheduledTime) orderData.pickupScheduledTime = Timestamp.fromDate(pickupScheduledTime);
      }

      // Add delivery fields if delivery is required
      if (returnMethod === 'delivery_required') {
        if (deliveryAddress) orderData.deliveryAddress = deliveryAddress;
        if (deliveryInstructions) orderData.deliveryInstructions = deliveryInstructions;
        if (deliveryScheduledTime) {
          orderData.deliveryScheduledTime = Timestamp.fromDate(deliveryScheduledTime);
        } else {
          // Default to estimated completion time
          orderData.deliveryScheduledTime = estimatedCompletionTimestamp;
        }
      }

      // Create order in database
      await createOrder(orderData);

      // Store created order for payment modal
      setCreatedOrder(orderData as OrderExtended);

      // Show payment modal
      setShowPaymentModal(true);

      toast.success(`Order ${orderId} created successfully!`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create order'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCustomer, garments, user, userData, total]);

  /**
   * Handle payment success
   */
  const handlePaymentSuccess = useCallback(() => {
    setShowPaymentModal(false);
    setShowReceipt(true);
  }, []);

  /**
   * Handle closing receipt and resetting form
   */
  const handleCloseReceipt = useCallback(() => {
    setShowReceipt(false);
    setCreatedOrder(null);
    setGarments([]);
    setSelectedCustomer(null);
    setShowCustomerSearch(true);
    toast.success('Ready for next order');
  }, []);

  // Loading state
  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" />
                Point of Sale
              </h1>
              <p className="text-gray-600 mt-1">Create new orders and process payments</p>
            </div>
            {selectedCustomer && garments.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearOrder}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Clear Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Customer Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer
                </CardTitle>
                <CardDescription>Select or create a customer</CardDescription>
              </CardHeader>
              <div className="p-6 pt-0">
                {showCustomerSearch ? (
                  <CustomerSearch
                    onSelectCustomer={handleSelectCustomer}
                    onCreateNewCustomer={() => setShowCreateCustomerModal(true)}
                  />
                ) : selectedCustomer ? (
                  <CustomerCard
                    customer={selectedCustomer}
                    onChangeCustomer={handleChangeCustomer}
                  />
                ) : null}
              </div>
            </Card>

            {/* Order Summary - Desktop Sticky */}
            <div className="hidden lg:block">
              <OrderSummary
                customer={selectedCustomer || undefined}
                garments={garments.map((g, i) => ({
                  garmentId: `temp-${i}`,
                  ...g,
                }))}
                subtotal={subtotal}
                tax={tax}
                total={total}
                estimatedCompletion={estimatedCompletion}
                onProcessPayment={handleProcessPayment}
                onClearOrder={handleClearOrder}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          {/* Center Column: Garment Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Garment Entry Form */}
            <GarmentEntryForm
              onAddGarment={handleAddGarment}
              onCancel={() => {
                // Optional clear action
              }}
            />

            {/* Garments List */}
            {garments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items ({garments.length})
                  </CardTitle>
                  <CardDescription>
                    Review and manage garments in this order
                  </CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    {garments.map((garment, index) => (
                      <div key={`garment-${index}`} className="space-y-3">
                        <GarmentCard
                          garment={{
                            garmentId: `temp-${index}`,
                            type: garment.type,
                            color: garment.color,
                            brand: garment.brand,
                            services: garment.services,
                            price: garment.price,
                            specialInstructions: garment.specialInstructions,
                            photos: garment.photos,
                          }}
                          onEdit={() => handleEditGarment(index)}
                          onRemove={() => handleRemoveGarment(index)}
                        />
                        <GarmentInitialInspection
                          garmentId={`temp-${index}`}
                          garmentType={garment.type}
                          garmentColor={garment.color}
                          value={{
                            hasNotableDamage: garment.hasNotableDamage || false,
                            initialInspectionNotes: garment.initialInspectionNotes || '',
                            initialInspectionPhotos: garment.initialInspectionPhotos || [],
                          }}
                          onChange={(inspectionData) => handleUpdateInspection(index, inspectionData)}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Subtotal:</span>
                    <span>KES {subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Collection & Return Methods - Only show if customer selected and garments added */}
            {selectedCustomer && garments.length > 0 && (
              <>
                <CollectionMethodSelector
                  customerId={selectedCustomer.customerId}
                  value={collectionMethod}
                  onChange={setCollectionMethod}
                  selectedAddress={pickupAddress}
                  onAddressChange={setPickupAddress}
                  instructions={pickupInstructions}
                  onInstructionsChange={setPickupInstructions}
                  scheduledTime={pickupScheduledTime}
                  onScheduledTimeChange={setPickupScheduledTime}
                />

                <ReturnMethodSelector
                  customerId={selectedCustomer.customerId}
                  value={returnMethod}
                  onChange={setReturnMethod}
                  selectedAddress={deliveryAddress}
                  onAddressChange={setDeliveryAddress}
                  instructions={deliveryInstructions}
                  onInstructionsChange={setDeliveryInstructions}
                  scheduledTime={deliveryScheduledTime}
                  onScheduledTimeChange={setDeliveryScheduledTime}
                  estimatedCompletion={estimatedCompletion}
                />
              </>
            )}

            {/* Order Summary - Mobile */}
            <div className="lg:hidden">
              <OrderSummary
                customer={selectedCustomer || undefined}
                garments={garments.map((g, i) => ({
                  garmentId: `temp-${i}`,
                  ...g,
                }))}
                subtotal={subtotal}
                tax={tax}
                total={total}
                estimatedCompletion={estimatedCompletion}
                onProcessPayment={handleProcessPayment}
                onClearOrder={handleClearOrder}
                isProcessing={isProcessing}
              />
            </div>

            {/* Empty State */}
            {garments.length === 0 && (
              <Card className="bg-gray-50 border-dashed">
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No garments added yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add garments using the form above to create an order
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Customer Modal */}
      <CreateCustomerModal
        open={showCreateCustomerModal}
        onOpenChange={setShowCreateCustomerModal}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Payment Modal */}
      {createdOrder && (
        <PaymentModal
          order={createdOrder}
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          userId={user.uid}
        />
      )}

      {/* Receipt Preview */}
      {createdOrder && selectedCustomer && (
        <ReceiptPreview
          order={createdOrder}
          customer={selectedCustomer}
          open={showReceipt}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}
