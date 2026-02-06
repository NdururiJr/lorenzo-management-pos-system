/**
 * POS (Point of Sale) Page
 *
 * Modern POS interface with category grid, service cards, and bottom order bar.
 * Features quick-add service cards that pre-fill the detailed garment entry form.
 *
 * @module app/(dashboard)/pos/page
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ModernCard } from '@/components/modern/ModernCard';

// POS Components
import { POSHeader } from '@/components/features/pos/POSHeader';
import { ServiceCategoryTabs } from '@/components/features/pos/ServiceCategoryTabs';
import { ServiceGrid } from '@/components/features/pos/ServiceGrid';
import { POSBottomBar } from '@/components/features/pos/POSBottomBar';
import { GarmentEntryForm, type PrefillData } from '@/components/features/pos/GarmentEntryForm';
import { CustomerSearchModal } from '@/components/features/pos/CustomerSearchModal';
import { OrderOptionsModal, type OrderOptions } from '@/components/features/pos/OrderOptionsModal';
import { CreateCustomerModal } from '@/components/features/pos/CreateCustomerModal';
import { PaymentModal } from '@/components/features/pos/PaymentModal';
import { ReceiptPreview } from '@/components/features/pos/ReceiptPreview';
import { GarmentInitialInspection } from '@/components/features/pos/GarmentInitialInspection';

// Data and utilities
import { getCustomer } from '@/lib/db/customers';
import { createOrder, generateOrderId, generateGarmentId, calculateEstimatedCompletion } from '@/lib/db/orders';
import { getActiveUsers, getUsersByBranch } from '@/lib/db/users';
import type { ServiceItem } from '@/lib/data/service-catalog';
import type { Customer, Garment, OrderExtended, User } from '@/lib/db/schema';
import type { CartItemData } from '@/components/features/pos/CartItemChip';

interface GarmentFormData {
  type: string;
  color: string;
  brand?: string;
  // V2.0: Category is mandatory
  category?: 'Adult' | 'Children';
  // V2.0: No Brand flag
  noBrand?: boolean;
  services: string[];
  price: number;
  specialInstructions?: string;
  photos?: string[];
  icon?: string;
  // Initial inspection fields (Stage 1 - Optional)
  hasNotableDamage?: boolean;
  initialInspectionNotes?: string;
  initialInspectionPhotos?: string[];
}

/**
 * Service type for orders (V2.0)
 */
type ServiceType = 'Normal' | 'Express';

export default function POSPage() {
  const { user, userData } = useAuth();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Services');

  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);

  // Pre-fill state for GarmentEntryForm
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);

  // Garments/Cart state
  const [garments, setGarments] = useState<GarmentFormData[]>([]);

  // Order options state
  const [showOrderOptionsModal, setShowOrderOptionsModal] = useState(false);
  const [orderOptions, setOrderOptions] = useState<OrderOptions>({
    collectionMethod: 'dropped_off',
    returnMethod: 'customer_collects',
  });

  // Order state
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderExtended | null>(null);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);

  // Inspection editing state
  const [editingInspectionIndex, setEditingInspectionIndex] = useState<number | null>(null);

  // V2.0: Inspector (Checked By) and Service Type state
  const [checkedBy, setCheckedBy] = useState<string>(user?.uid || '');
  const [checkedByName, setCheckedByName] = useState<string>(userData?.name || '');
  const [serviceType, setServiceType] = useState<ServiceType>('Normal');

  // V2.0: Available staff for inspector dropdown
  const [availableStaff, setAvailableStaff] = useState<{ uid: string; name: string }[]>([]);

  // V2.0: Fetch available staff for inspector dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // Get staff from current branch if user has a branch, otherwise get all active users
        let staff: User[];
        if (userData?.branchId) {
          staff = await getUsersByBranch(userData.branchId);
        } else {
          staff = await getActiveUsers();
        }

        // Filter to only active staff who can inspect (exclude customers)
        const inspectors = staff
          .filter(s => s.active && s.role !== 'customer' && s.role !== 'driver')
          .map(s => ({ uid: s.uid, name: s.name }));

        setAvailableStaff(inspectors);

        // Set current user as default inspector if they are in the list
        if (user?.uid && !checkedBy) {
          const currentUserInList = inspectors.find(s => s.uid === user.uid);
          if (currentUserInList) {
            setCheckedBy(user.uid);
            setCheckedByName(currentUserInList.name);
          } else if (inspectors.length > 0) {
            // Default to first available inspector
            setCheckedBy(inspectors[0].uid);
            setCheckedByName(inspectors[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        // If fetch fails, at least include the current user
        if (user?.uid && userData?.name) {
          setAvailableStaff([{ uid: user.uid, name: userData.name }]);
          setCheckedBy(user.uid);
          setCheckedByName(userData.name);
        }
      }
    };

    if (user && userData) {
      fetchStaff();
    }
  }, [user, userData, checkedBy]);

  // Calculate totals
  const subtotal = garments.reduce((sum, garment) => sum + garment.price, 0);

  // V2.0: Express pricing logic - 50% surcharge for express service
  const EXPRESS_MULTIPLIER = 1.5;
  const expressSurcharge = serviceType === 'Express' ? subtotal * 0.5 : 0;
  const total = serviceType === 'Express' ? subtotal * EXPRESS_MULTIPLIER : subtotal;

  // Calculate estimated completion (V2.0: Express = 24 hours, Normal = 48 hours)
  const HOURS_EXPRESS = 24;
  const HOURS_NORMAL = 48;
  const completionHours = serviceType === 'Express' ? HOURS_EXPRESS : HOURS_NORMAL;
  const estimatedCompletion = new Date(Date.now() + completionHours * 60 * 60 * 1000);

  // Convert garments to cart items for bottom bar
  const cartItems: CartItemData[] = garments.map((g, i) => ({
    garmentId: `temp-${i}`,
    type: g.type,
    color: g.color,
    services: g.services,
    price: g.price,
    icon: g.icon,
  }));

  /**
   * Handle service card selection - pre-fills the form with pricing data
   */
  const handleSelectService = useCallback((service: ServiceItem) => {
    setPrefillData({
      type: service.type,
      pricing: service.pricing,
      serviceName: service.name,
      icon: service.icon,
    });
    toast.success(`${service.name} selected - fill in details`);
  }, []);

  /**
   * Handle customer selection
   */
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
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
        toast.success(`Customer created: ${customer.name}`);
      }
    } catch (error) {
      console.error('Error fetching created customer:', error);
      toast.error('Failed to load customer');
    }
  }, []);

  /**
   * Handle adding garment from form
   */
  const handleAddGarment = useCallback((garment: GarmentFormData & { price: number; icon?: string }) => {
    setGarments((prev) => [...prev, garment]);
    toast.success(`${garment.type} added to order`);
  }, []);

  /**
   * Handle removing garment from cart
   */
  const handleRemoveGarment = useCallback((garmentId: string) => {
    const index = parseInt(garmentId.replace('temp-', ''), 10);
    setGarments((prev) => {
      const removed = prev[index];
      if (removed) {
        toast.info(`${removed.type} removed from order`);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /**
   * Handle editing garment (opens inspection)
   */
  const handleEditGarment = useCallback((item: CartItemData) => {
    const index = parseInt(item.garmentId.replace('temp-', ''), 10);
    setEditingInspectionIndex(index);
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
    setEditingInspectionIndex(null);
    toast.success('Inspection notes saved');
  }, []);

  /**
   * Handle new order (clear everything)
   */
  const handleNewOrder = useCallback(() => {
    if (garments.length > 0) {
      const confirmed = window.confirm(
        'Are you sure you want to start a new order? Current items will be cleared.'
      );
      if (!confirmed) return;
    }
    setGarments([]);
    setSelectedCustomer(null);
    setSearchQuery('');
    setActiveCategory('All Services');
    setPrefillData(null);
    setOrderOptions({
      collectionMethod: 'dropped_off',
      returnMethod: 'customer_collects',
    });
    // V2.0: Reset inspector and service type to defaults
    setCheckedBy(user?.uid || '');
    setCheckedByName(userData?.name || '');
    setServiceType('Normal');
    toast.success('Ready for new order');
  }, [garments.length, user?.uid, userData?.name]);

  /**
   * Handle confirm order - opens order options modal
   */
  const handleConfirmOrder = useCallback(() => {
    if (!selectedCustomer) {
      setShowCustomerSearchModal(true);
      toast.error('Please select a customer first');
      return;
    }
    if (garments.length === 0) {
      toast.error('Please add items to the order');
      return;
    }
    setShowOrderOptionsModal(true);
  }, [selectedCustomer, garments.length]);

  /**
   * Handle processing payment (create order first)
   */
  const handleProcessPayment = useCallback(async () => {
    if (!selectedCustomer || garments.length === 0 || !user || !userData?.branchId) {
      toast.error('Please select a customer and add garments');
      return;
    }

    // V2.0: Validate checkedBy is set
    if (!checkedBy) {
      toast.error('Please select an inspector (Checked By)');
      return;
    }

    // Validate pickup address if pickup is required
    if (orderOptions.collectionMethod === 'pickup_required' && !orderOptions.pickupAddress) {
      toast.error('Please select a pickup address');
      return;
    }

    // Validate delivery address if delivery is required
    if (orderOptions.returnMethod === 'delivery_required' && !orderOptions.deliveryAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setIsProcessing(true);
    setShowOrderOptionsModal(false);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baseGarment: any = {
          garmentId: generateGarmentId(orderId, index),
          type: garment.type,
          color: garment.color,
          // V2.0: Brand is now mandatory
          brand: garment.brand || 'No Brand',
          // V2.0: Category is mandatory
          category: garment.category || 'Adult',
          services: garment.services,
          price: garment.price,
          status: 'received',
        };

        // V2.0: Add noBrand flag if set
        if (garment.noBrand) {
          baseGarment.noBrand = true;
        }

        // Add optional fields only if they are defined
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        collectionMethod: orderOptions.collectionMethod,
        returnMethod: orderOptions.returnMethod,
        statusHistory: [
          {
            status: 'received' as const,
            timestamp: Timestamp.now(),
            updatedBy: user.uid,
          },
        ],
        updatedAt: Timestamp.now(),
        // V2.0: New mandatory fields
        checkedBy: checkedBy || user.uid, // Inspector who checked the order
        checkedByName: checkedByName || userData?.name || '', // Inspector name (denormalized)
        serviceType: serviceType, // Normal or Express
        // V2.0: Express pricing breakdown
        subtotal: subtotal, // Base price before express surcharge
        expressSurcharge: expressSurcharge, // Express surcharge amount (0 for normal)
      };

      // Add pickup fields if pickup is required
      if (orderOptions.collectionMethod === 'pickup_required') {
        if (orderOptions.pickupAddress) orderData.pickupAddress = orderOptions.pickupAddress;
        if (orderOptions.pickupInstructions) orderData.pickupInstructions = orderOptions.pickupInstructions;
        if (orderOptions.pickupTime) orderData.pickupScheduledTime = Timestamp.fromDate(orderOptions.pickupTime);
      }

      // Add delivery fields if delivery is required
      if (orderOptions.returnMethod === 'delivery_required') {
        if (orderOptions.deliveryAddress) orderData.deliveryAddress = orderOptions.deliveryAddress;
        if (orderOptions.deliveryInstructions) orderData.deliveryInstructions = orderOptions.deliveryInstructions;
        if (orderOptions.deliveryTime) {
          orderData.deliveryScheduledTime = Timestamp.fromDate(orderOptions.deliveryTime);
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
  }, [selectedCustomer, garments, user, userData, total, subtotal, expressSurcharge, orderOptions, checkedBy, checkedByName, serviceType]);

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
    setSearchQuery('');
    setActiveCategory('All Services');
    setPrefillData(null);
    setOrderOptions({
      collectionMethod: 'dropped_off',
      returnMethod: 'customer_collects',
    });
    // V2.0: Reset inspector and service type to defaults
    setCheckedBy(user?.uid || '');
    setCheckedByName(userData?.name || '');
    setServiceType('Normal');
    toast.success('Ready for next order');
  }, [user?.uid, userData?.name]);

  /**
   * Clear prefill data after it's been applied
   */
  const handlePrefillApplied = useCallback(() => {
    // Don't clear immediately - let user see what was pre-filled
    // Clear on next service selection instead
  }, []);

  // Loading state
  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-lorenzo-cream">
        <ModernCard className="p-8">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 mx-auto text-lorenzo-accent-teal" />
            </motion.div>
            <p className="text-gray-600">Loading POS System...</p>
          </div>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-lorenzo-cream">
      {/* Header */}
      <POSHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        customer={selectedCustomer}
        onSelectCustomer={() => setShowCustomerSearchModal(true)}
        onNewOrder={handleNewOrder}
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
            onSelectService={handleSelectService}
            className="h-full"
          />

          {/* Right: Garment Entry Form (sticky) */}
          <div className="overflow-auto">
            <GarmentEntryForm
              prefillData={prefillData}
              onPrefillApplied={handlePrefillApplied}
              onAddGarment={handleAddGarment}
              onCancel={() => setPrefillData(null)}
            />

            {/* Inspection Modal for editing cart items */}
            {editingInspectionIndex !== null && garments[editingInspectionIndex] && (
              <div className="mt-4">
                <GarmentInitialInspection
                  garmentId={`temp-${editingInspectionIndex}`}
                  garmentType={garments[editingInspectionIndex].type}
                  garmentColor={garments[editingInspectionIndex].color}
                  value={{
                    hasNotableDamage: garments[editingInspectionIndex].hasNotableDamage || false,
                    initialInspectionNotes: garments[editingInspectionIndex].initialInspectionNotes || '',
                    initialInspectionPhotos: garments[editingInspectionIndex].initialInspectionPhotos || [],
                  }}
                  onChange={(data) => handleUpdateInspection(editingInspectionIndex, data)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <POSBottomBar
        customer={selectedCustomer}
        cart={cartItems}
        onRemoveItem={handleRemoveGarment}
        onEditItem={handleEditGarment}
        onSelectCustomer={() => setShowCustomerSearchModal(true)}
        onConfirmOrder={handleConfirmOrder}
        onOpenOptions={() => setShowOrderOptionsModal(true)}
        isProcessing={isProcessing}
      />

      {/* Customer Search Modal */}
      <CustomerSearchModal
        open={showCustomerSearchModal}
        onOpenChange={setShowCustomerSearchModal}
        onSelectCustomer={handleSelectCustomer}
        onCreateNewCustomer={() => {
          setShowCustomerSearchModal(false);
          setShowCreateCustomerModal(true);
        }}
      />

      {/* Create Customer Modal */}
      <CreateCustomerModal
        open={showCreateCustomerModal}
        onOpenChange={setShowCreateCustomerModal}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Order Options Modal */}
      {selectedCustomer && (
        <OrderOptionsModal
          open={showOrderOptionsModal}
          onOpenChange={setShowOrderOptionsModal}
          customerId={selectedCustomer.customerId}
          options={orderOptions}
          onOptionsChange={setOrderOptions}
          estimatedCompletion={estimatedCompletion}
          onConfirm={handleProcessPayment}
          isProcessing={isProcessing}
          // V2.0: Service Type and Inspector
          serviceType={serviceType}
          onServiceTypeChange={setServiceType}
          checkedBy={checkedBy}
          checkedByName={checkedByName}
          onCheckedByChange={(uid, name) => {
            setCheckedBy(uid);
            setCheckedByName(name);
          }}
          availableStaff={availableStaff}
        />
      )}

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
