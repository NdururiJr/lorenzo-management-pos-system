'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernSection } from '@/components/modern/ModernLayout';
import { toast } from 'sonner';
import { Loader2, Database, CheckCircle2 } from 'lucide-react';
import { collection, doc, setDoc, Timestamp, query, where, getDocs, getDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { OrderStatus } from '@/lib/db/schema';

const BRANCH_ID = 'WESTLANDS';

const TEST_CUSTOMERS = [
  { name: 'Rachel Wangare', phone: '+254712345001', email: 'rachel.wangare@example.com' },
  { name: 'Kelvin Kamau', phone: '+254723456002', email: 'kelvin.kamau@example.com' },
  { name: 'Rose Reeves Wangechi', phone: '+254734567003', email: 'rose.wangechi@example.com' },
  { name: 'David Mwangi', phone: '+254745678004', email: 'david.mwangi@example.com' },
  { name: 'Grace Njeri', phone: '+254756789005', email: 'grace.njeri@example.com' },
];

const GARMENT_TYPES = ['Shirt', 'Pants', 'Dress', 'Suit', 'Jacket', 'Skirt', 'Blouse', 'Coat'];
const COLORS = ['White', 'Black', 'Blue', 'Navy', 'Gray', 'Brown', 'Beige', 'Red'];
const SERVICES_OPTIONS = [
  { name: 'Wash', price: 150 },
  { name: 'Dry Clean', price: 250 },
  { name: 'Iron', price: 50 },
  { name: 'Starch', price: 30 },
];

// FR-008: Updated to use 'queued_for_delivery' instead of 'ready'
const ORDER_STATUSES = [
  'received',
  'queued',
  'washing',
  'drying',
  'ironing',
  'quality_check',
  'packaging',
  'queued_for_delivery',
  'out_for_delivery',
  'delivered',
] as const;

const PAYMENT_METHODS = ['mpesa', 'card', 'credit'] as const;

function randomSelect<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomServices(): { services: string[]; price: number } {
  const numServices = Math.floor(Math.random() * 3) + 1;
  const selectedServices: typeof SERVICES_OPTIONS = [];
  let totalPrice = 0;

  const mainService = Math.random() > 0.5 ? SERVICES_OPTIONS[0] : SERVICES_OPTIONS[1];
  selectedServices.push(mainService);
  totalPrice += mainService.price;

  for (let i = 0; i < numServices - 1; i++) {
    const service = randomSelect(SERVICES_OPTIONS.slice(2));
    if (!selectedServices.includes(service)) {
      selectedServices.push(service);
      totalPrice += service.price;
    }
  }

  return {
    services: selectedServices.map((s) => s.name),
    price: totalPrice,
  };
}

function generateCustomerId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CUST${timestamp}${random}`;
}

function generateOrderId(sequence: number): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const sequenceStr = String(sequence).padStart(4, '0');
  return `${BRANCH_ID}${dateStr}${sequenceStr}`;
}

function generateGarmentId(orderId: string, index: number): string {
  return `${orderId}G${String(index + 1).padStart(2, '0')}`;
}

export default function SeedDataPage() {
  const { user, userData } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState('');

  const createCustomer = async (customerData: typeof TEST_CUSTOMERS[0]) => {
    // Check if customer with this email already exists
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('email', '==', customerData.email), limit(1));
    const existingCustomer = await getDocs(q);

    if (!existingCustomer.empty) {
      // Return existing customer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingData = { id: existingCustomer.docs[0].id, ...existingCustomer.docs[0].data() } as any;
      console.log(`Customer already exists: ${customerData.email} (${existingData.customerId})`);
      return existingData;
    }

    // Create new customer
    const customerId = generateCustomerId();
    const customer = {
      customerId,
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      addresses: [
        {
          label: 'Home',
          address: 'Westlands, Nairobi, Kenya',
          coordinates: { lat: -1.2674, lng: 36.8108 },
        },
      ],
      preferences: { notifications: true, language: 'en' as const },
      createdAt: Timestamp.now(),
      orderCount: 0,
      totalSpent: 0,
    };

    await setDoc(doc(db, 'customers', customerId), customer);
    return customer;
  };

  const createOrder = async (
    customer: Awaited<ReturnType<typeof createCustomer>>,
    orderNumber: number,
    userId: string
  ) => {
    const orderId = generateOrderId(orderNumber);
    const numGarments = Math.floor(Math.random() * 4) + 2;
    const garments = [];
    let totalAmount = 0;

    for (let i = 0; i < numGarments; i++) {
      const { services, price } = generateRandomServices();
      const garment = {
        garmentId: generateGarmentId(orderId, i),
        type: randomSelect(GARMENT_TYPES),
        color: randomSelect(COLORS),
        services,
        price,
        status: 'received',
      };
      garments.push(garment);
      totalAmount += price;
    }

    const paymentStatus =
      Math.random() > 0.3 ? 'paid' : Math.random() > 0.5 ? 'partial' : 'pending';
    const paidAmount =
      paymentStatus === 'paid'
        ? totalAmount
        : paymentStatus === 'partial'
        ? Math.floor(totalAmount * 0.5)
        : 0;

    const status = randomSelect([...ORDER_STATUSES]);
    const daysAgo = Math.floor(Math.random() * 7);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = Timestamp.fromDate(
      new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000)
    );

    const estimatedCompletion = Timestamp.fromDate(
      new Date(createdAt.toMillis() + 48 * 60 * 60 * 1000)
    );

    // Build status history based on current status
    const statusHistory: Array<{ status: OrderStatus; timestamp: Timestamp; updatedBy: string }> = [
      {
        status: 'received',
        timestamp: createdAt,
        updatedBy: userId,
      },
    ];

    // Add intermediate statuses if the order has progressed
    const currentStatusIndex = ORDER_STATUSES.indexOf(status);
    if (currentStatusIndex > 0) {
      for (let i = 1; i <= currentStatusIndex; i++) {
        statusHistory.push({
          status: ORDER_STATUSES[i],
          timestamp: Timestamp.fromDate(
            new Date(createdAt.toMillis() + i * 4 * 60 * 60 * 1000)
          ), // 4 hours apart
          updatedBy: userId,
        });
      }
    }

    const order = {
      orderId,
      customerId: customer.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      branchId: BRANCH_ID,
      status,
      garments,
      totalAmount,
      paidAmount,
      paymentStatus: paymentStatus as 'paid' | 'partial' | 'pending',
      ...(paidAmount > 0 && { paymentMethod: randomSelect(PAYMENT_METHODS) }),
      estimatedCompletion,
      createdAt,
      createdBy: userId,
      statusHistory,
      updatedAt: Timestamp.now(),
      ...(status === 'out_for_delivery' && {
        deliveryAddress: customer.addresses[0]?.address || 'Westlands, Nairobi',
      }),
    };

    await setDoc(doc(db, 'orders', orderId), order);
    return order;
  };

  const createBranch = async () => {
    // Check if WESTLANDS branch already exists
    const branchRef = doc(db, 'branches', BRANCH_ID);
    const branchSnap = await getDoc(branchRef);

    if (branchSnap.exists()) {
      console.log('WESTLANDS branch already exists');
      return;
    }

    // Create WESTLANDS branch
    const branch = {
      branchId: BRANCH_ID,
      name: 'Westlands Main Store',
      branchType: 'main' as const,
      location: {
        address: 'Westlands, Nairobi, Kenya',
        coordinates: { lat: -1.2674, lng: 36.8108 },
      },
      contactPhone: '+254725462859',
      active: true,
      createdAt: Timestamp.now(),
    };

    await setDoc(branchRef, branch);
    console.log('Created WESTLANDS branch');
  };

  const handleSeedData = async () => {
    if (!user || !userData?.isSuperAdmin) {
      toast.error('Only super admins can seed data');
      return;
    }

    setIsSeeding(true);
    setProgress('Starting seed process...');

    try {
      // First, create the branch if it doesn't exist
      setProgress('Setting up branch...');
      await createBranch();

      // Create a customer record for the logged-in Dev Super Admin
      setProgress('Creating your customer profile...');
      const devCustomer = await createCustomer({
        name: userData.name || 'Dev Super Admin',
        phone: '+254725462859', // Dev admin phone
        email: user.email || 'dev@lorenzo.com',
      });

      // Create other test customers
      setProgress('Creating 5 additional test customers...');
      const customers = [devCustomer]; // Start with dev customer
      for (const customerData of TEST_CUSTOMERS) {
        const customer = await createCustomer(customerData);
        customers.push(customer);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Create 25 orders - 10 for dev customer, 15 for others
      setProgress('Creating 25 test orders...');
      let orderNumber = 1;

      // Create 10 orders for Dev Super Admin customer
      for (let i = 0; i < 10; i++) {
        await createOrder(devCustomer, orderNumber, user.uid);
        orderNumber++;
        setProgress(`Created order ${i + 1} of 25 (your orders)...`);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Create 15 more orders for other customers
      for (let i = 10; i < 25; i++) {
        const customer = customers[(i % (customers.length - 1)) + 1]; // Skip dev customer
        await createOrder(customer, orderNumber, user.uid);
        orderNumber++;
        setProgress(`Created order ${i + 1} of 25...`);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      toast.success('Successfully created 6 customers and 25 orders!', {
        description: '10 orders are linked to your account for customer portal testing.',
      });
      setProgress('✅ Seed complete! Refresh the customer portal to see your orders.');
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      setProgress('❌ Error occurred during seeding');
    } finally {
      setIsSeeding(false);
    }
  };

  if (!userData?.isSuperAdmin) {
    return (
      <ModernSection>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Only super admins can access this page.</p>
          </CardContent>
        </Card>
      </ModernSection>
    );
  }

  return (
    <ModernSection>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Seed Test Data
            </CardTitle>
            <CardDescription>
              Generate sample customers and orders for testing and demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What will be created:</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Your customer profile (for customer portal access)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  10 orders linked to YOUR account (visible in customer portal)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  5 additional test customers with 15 more orders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Orders across all pipeline stages with complete status history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Mixed payment statuses (paid, partial, pending)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Orders created over the last 7 days
                </li>
              </ul>
            </div>

            {progress && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 font-medium">{progress}</p>
              </div>
            )}

            <Button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="w-full bg-brand-blue hover:bg-brand-blue-dark"
              size="lg"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-5 w-5" />
                  Generate Test Data
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              This will create new test data in your database. Existing data will not be affected.
            </p>
          </CardContent>
        </Card>
      </div>
    </ModernSection>
  );
}
