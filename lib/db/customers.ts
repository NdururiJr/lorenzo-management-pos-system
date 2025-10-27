/**
 * Customer Database Operations
 *
 * This file provides type-safe CRUD operations for the customers collection.
 * All functions include proper error handling and validation.
 *
 * @module lib/db/customers
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  DatabaseError,
} from './index';
import type { Customer, Address, CustomerPreferences } from './schema';

/**
 * Generate a unique customer ID
 * Format: CUST-[TIMESTAMP]-[RANDOM]
 */
export function generateCustomerId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `CUST-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a new customer
 *
 * @param data - Customer data
 * @returns The created customer ID
 */
export async function createCustomer(
  data: Omit<Customer, 'customerId' | 'createdAt' | 'orderCount' | 'totalSpent'> | {
    name: string;
    phone: string;
    email?: string;
    addresses?: Address[];
    preferences?: CustomerPreferences;
  }
): Promise<string> {
  const customerId = generateCustomerId();

  // Check if phone number already exists
  const existingCustomer = await getCustomerByPhone(data.phone);
  if (existingCustomer) {
    throw new DatabaseError(`Customer with phone ${data.phone} already exists`);
  }

  const customer = {
    customerId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    addresses: data.addresses || [],
    preferences: data.preferences || {
      notifications: true,
      language: 'en',
    },
    orderCount: 0,
    totalSpent: 0,
    createdAt: Timestamp.now(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await setDocument<Customer>('customers', customerId, customer as any);
  return customerId;
}

/**
 * Get customer by ID
 */
export async function getCustomer(customerId: string): Promise<Customer> {
  return getDocument<Customer>('customers', customerId);
}

/**
 * Get customer by phone number
 */
export async function getCustomerByPhone(
  phone: string
): Promise<Customer | null> {
  try {
    const customers = await getDocuments<Customer>(
      'customers',
      where('phone', '==', phone),
      limit(1)
    );
    return customers.length > 0 ? customers[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get customer by phone', error);
  }
}

/**
 * Search customers by name or phone
 *
 * @param searchTerm - Search term (name or phone)
 * @param limitCount - Maximum number of results
 * @returns Array of matching customers
 */
export async function searchCustomers(
  searchTerm: string,
  limitCount = 20
): Promise<Customer[]> {
  try {
    // For phone search, try exact match
    if (searchTerm.startsWith('+254') || searchTerm.startsWith('254')) {
      const customer = await getCustomerByPhone(searchTerm);
      return customer ? [customer] : [];
    }

    // For name search, we'll get all customers and filter client-side
    // Note: Firestore doesn't support case-insensitive search or LIKE queries
    // In production, consider using Algolia or similar search service
    const allCustomers = await getDocuments<Customer>(
      'customers',
      orderBy('createdAt', 'desc'),
      limit(100) // Get more to filter
    );

    const searchLower = searchTerm.toLowerCase();
    return allCustomers
      .filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.phone.includes(searchTerm)
      )
      .slice(0, limitCount);
  } catch (error) {
    throw new DatabaseError('Failed to search customers', error);
  }
}

/**
 * Update customer details
 */
export async function updateCustomer(
  customerId: string,
  data: Partial<Omit<Customer, 'customerId' | 'createdAt'>>
): Promise<void> {
  return updateDocument<Customer>('customers', customerId, data);
}

/**
 * Add address to customer
 */
export async function addCustomerAddress(
  customerId: string,
  address: Omit<Address, 'id'>
): Promise<void> {
  const customer = await getCustomer(customerId);

  const newAddress: Address = {
    ...address,
    id: `ADDR-${Date.now()}`,
  } as Address & { id: string };

  const updatedAddresses = [...customer.addresses, newAddress];

  await updateDocument<Customer>('customers', customerId, {
    addresses: updatedAddresses,
  });
}

/**
 * Update customer address
 */
export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  updates: Partial<Address>
): Promise<void> {
  const customer = await getCustomer(customerId);

  const updatedAddresses = customer.addresses.map((addr) =>
    (addr as Address & { id: string }).id === addressId
      ? { ...addr, ...updates }
      : addr
  );

  await updateDocument<Customer>('customers', customerId, {
    addresses: updatedAddresses,
  });
}

/**
 * Remove customer address
 */
export async function removeCustomerAddress(
  customerId: string,
  addressId: string
): Promise<void> {
  const customer = await getCustomer(customerId);

  const updatedAddresses = customer.addresses.filter(
    (addr) => (addr as Address & { id: string }).id !== addressId
  );

  await updateDocument<Customer>('customers', customerId, {
    addresses: updatedAddresses,
  });
}

/**
 * Update customer preferences
 */
export async function updateCustomerPreferences(
  customerId: string,
  preferences: Partial<CustomerPreferences>
): Promise<void> {
  const customer = await getCustomer(customerId);

  const updatedPreferences = {
    ...customer.preferences,
    ...preferences,
  };

  await updateDocument<Customer>('customers', customerId, {
    preferences: updatedPreferences,
  });
}

/**
 * Increment customer order count and total spent
 * (Called when a new order is created)
 */
export async function incrementCustomerStats(
  customerId: string,
  orderAmount: number
): Promise<void> {
  const customer = await getCustomer(customerId);

  await updateDocument<Customer>('customers', customerId, {
    orderCount: customer.orderCount + 1,
    totalSpent: customer.totalSpent + orderAmount,
  });
}

/**
 * Get recent customers (most recent orders)
 */
export async function getRecentCustomers(limitCount = 10): Promise<Customer[]> {
  return getDocuments<Customer>(
    'customers',
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get top customers by total spent
 */
export async function getTopCustomers(limitCount = 10): Promise<Customer[]> {
  return getDocuments<Customer>(
    'customers',
    orderBy('totalSpent', 'desc'),
    limit(limitCount)
  );
}

/**
 * Delete customer (admin only)
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  return deleteDocument('customers', customerId);
}
