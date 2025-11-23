/**
 * Test Data Factory
 *
 * Factory functions to generate test data based on END_TO_END_TESTING_GUIDE.md
 * This ensures consistency between manual and automated tests
 */

import type {
  User,
  Customer,
  Order,
  Branch,
  InventoryItem,
  Transaction,
} from '@/lib/db/schema';
import { createMockTimestamp, generateTestId } from './test-utils';

/**
 * Test User Data (from END_TO_END_TESTING_GUIDE.md)
 */
export const TEST_USERS = {
  admin: {
    uid: 'admin-001',
    email: 'admin@lorenzo.test',
    phone: '+254725462859',
    role: 'admin' as const,
    name: 'John Admin',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  director: {
    uid: 'director-001',
    email: 'director@lorenzo.test',
    phone: '+254725462860',
    role: 'director' as const,
    name: 'Sarah Director',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  generalManager: {
    uid: 'gm-001',
    email: 'gm@lorenzo.test',
    phone: '+254725462861',
    role: 'general_manager' as const,
    name: 'Michael Manager',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  storeManager: {
    uid: 'sm-main-001',
    email: 'sm.main@lorenzo.test',
    phone: '+254725462862',
    role: 'store_manager' as const,
    name: 'Alice Store Manager',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  workstationManager: {
    uid: 'wm-001',
    email: 'wm@lorenzo.test',
    phone: '+254725462863',
    role: 'workstation_manager' as const,
    name: 'Bob Workstation Manager',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  workstationStaff: {
    uid: 'ws-001',
    email: 'ws1@lorenzo.test',
    phone: '+254725462864',
    role: 'workstation_staff' as const,
    name: 'Carol Washing Staff',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  satelliteStaff: {
    uid: 'sat-001',
    email: 'sat@lorenzo.test',
    phone: '+254725462866',
    role: 'satellite_staff' as const,
    name: 'Emma Satellite Staff',
    branchId: 'BR-SAT-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  frontDesk: {
    uid: 'fd-001',
    email: 'frontdesk@lorenzo.test',
    phone: '+254725462867',
    role: 'front_desk' as const,
    name: 'Frank Front Desk',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  driver: {
    uid: 'driver-001',
    email: 'driver1@lorenzo.test',
    phone: '+254725462868',
    role: 'driver' as const,
    name: 'George Driver',
    branchId: 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
  },
  customer: {
    uid: 'customer-001',
    email: 'customer1@test.com',
    phone: '+254712345001',
    role: 'customer' as const,
    name: 'Jane Customer',
    active: true,
    createdAt: createMockTimestamp(),
  },
};

/**
 * Test Branch Data
 */
export const TEST_BRANCHES = {
  mainStore: {
    branchId: 'BR-MAIN-001',
    name: 'Kilimani Main Store',
    branchType: 'main' as const,
    location: {
      address: 'Argwings Kodhek Road, Kilimani, Nairobi',
      coordinates: {
        lat: -1.2921,
        lng: 36.7872,
      },
    },
    contactPhone: '+254725462859',
    active: true,
    driverAvailability: 3,
    createdAt: createMockTimestamp(),
  },
  satelliteWestlands: {
    branchId: 'BR-SAT-001',
    name: 'Westlands Satellite',
    branchType: 'satellite' as const,
    mainStoreId: 'BR-MAIN-001',
    location: {
      address: 'Westlands Road, Westlands, Nairobi',
      coordinates: {
        lat: -1.2673,
        lng: 36.8097,
      },
    },
    contactPhone: '+254712345678',
    active: true,
    createdAt: createMockTimestamp(),
  },
  satelliteKaren: {
    branchId: 'BR-SAT-002',
    name: 'Karen Satellite',
    branchType: 'satellite' as const,
    mainStoreId: 'BR-MAIN-001',
    location: {
      address: 'Karen Road, Karen, Nairobi',
      coordinates: {
        lat: -1.3197,
        lng: 36.7081,
      },
    },
    contactPhone: '+254723456789',
    active: true,
    createdAt: createMockTimestamp(),
  },
};

/**
 * Test Customer Data
 */
export const TEST_CUSTOMERS = {
  janeCustomer: {
    customerId: 'CUST-001',
    name: 'Jane Customer',
    phone: '+254712345001',
    email: 'customer1@test.com',
    addresses: [
      {
        label: 'Home',
        address: 'Lavington Green, Nairobi',
        coordinates: {
          lat: -1.2804,
          lng: 36.7664,
        },
      },
      {
        label: 'Office',
        address: 'Westlands Office Park, Nairobi',
        coordinates: {
          lat: -1.2656,
          lng: 36.8088,
        },
      },
    ],
    preferences: {
      notifications: true,
      language: 'en' as const,
    },
    orderCount: 5,
    totalSpent: 12500,
    createdAt: createMockTimestamp(),
  },
  markCustomer: {
    customerId: 'CUST-002',
    name: 'Mark Customer',
    phone: '+254712345002',
    email: 'customer2@test.com',
    addresses: [
      {
        label: 'Home',
        address: 'Karen Hardy Estate, Nairobi',
        coordinates: {
          lat: -1.3186,
          lng: 36.7014,
        },
      },
    ],
    preferences: {
      notifications: true,
      language: 'en' as const,
    },
    orderCount: 2,
    totalSpent: 5000,
    createdAt: createMockTimestamp(),
  },
};

/**
 * Factory function to create a test order
 */
export function createTestOrder(overrides: Partial<Order> = {}): Order {
  const now = new Date();
  const estimatedCompletion = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

  return {
    orderId: overrides.orderId || generateOrderId('BR-MAIN-001'),
    customerId: 'CUST-001',
    branchId: 'BR-MAIN-001',
    status: 'received',
    collectionMethod: 'drop_off',
    returnMethod: 'customer_collects',
    garments: [
      {
        garmentId: `${overrides.orderId || 'ORD-TEST'}-G01`,
        type: 'Shirt',
        color: 'White',
        brand: 'Calvin Klein',
        services: ['dry_clean', 'iron'],
        price: 500,
        status: 'received',
        specialInstructions: 'Extra starch on collar',
        initialInspection: {
          inspectedAt: createMockTimestamp(),
          inspectedBy: 'fd-001',
          condition: 'good',
          notableDamages: [],
        },
      },
    ],
    totalAmount: 500,
    paidAmount: 500,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    estimatedCompletion: createMockTimestamp(estimatedCompletion),
    createdAt: createMockTimestamp(now),
    createdBy: 'fd-001',
    statusHistory: [
      {
        status: 'received',
        timestamp: createMockTimestamp(now),
        updatedBy: 'fd-001',
      },
    ],
    ...overrides,
  } as Order;
}

/**
 * Factory function to create a test customer
 */
export function createTestCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    customerId: overrides.customerId || generateTestId('CUST'),
    name: 'Test Customer',
    phone: '+254712345999',
    email: 'test@customer.com',
    addresses: [],
    preferences: {
      notifications: true,
      language: 'en',
    },
    orderCount: 0,
    totalSpent: 0,
    createdAt: createMockTimestamp(),
    ...overrides,
  } as Customer;
}

/**
 * Factory function to create a test user
 */
export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    uid: overrides.uid || generateTestId('user'),
    email: overrides.email || 'test@example.com',
    phone: overrides.phone || '+254700000000',
    role: overrides.role || 'front_desk',
    name: overrides.name || 'Test User',
    branchId: overrides.branchId || 'BR-MAIN-001',
    active: true,
    createdAt: createMockTimestamp(),
    ...overrides,
  } as User;
}

/**
 * Factory function to create a test branch
 */
export function createTestBranch(overrides: Partial<Branch> = {}): Branch {
  return {
    branchId: overrides.branchId || generateTestId('BR'),
    name: overrides.name || 'Test Branch',
    branchType: overrides.branchType || 'main',
    location: {
      address: 'Test Address, Nairobi',
      coordinates: {
        lat: -1.2921,
        lng: 36.7872,
      },
    },
    contactPhone: '+254700000000',
    active: true,
    createdAt: createMockTimestamp(),
    ...overrides,
  } as Branch;
}

/**
 * Factory function to create a test inventory item
 */
export function createTestInventoryItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    itemId: overrides.itemId || generateTestId('INV'),
    branchId: overrides.branchId || 'BR-MAIN-001',
    name: overrides.name || 'Test Item',
    category: overrides.category || 'chemicals',
    unit: overrides.unit || 'liters',
    quantity: overrides.quantity ?? 50,
    reorderLevel: overrides.reorderLevel ?? 20,
    costPerUnit: overrides.costPerUnit ?? 100,
    supplier: overrides.supplier || 'Test Supplier',
    lastRestocked: createMockTimestamp(),
    ...overrides,
  } as InventoryItem;
}

/**
 * Helper to generate order ID
 */
function generateOrderId(branchId: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `ORD-${branchId}-${dateStr}-${sequence}`;
}

/**
 * Mock data for testing - complete sets
 */
export const MOCK_DATA = {
  users: Object.values(TEST_USERS),
  branches: Object.values(TEST_BRANCHES),
  customers: Object.values(TEST_CUSTOMERS),
};

/**
 * Password for all test users
 */
export const TEST_PASSWORD = 'Test@1234';
