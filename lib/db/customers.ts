/**
 * Customer Database Operations
 *
 * This file provides type-safe CRUD operations for the customers collection.
 * All functions include proper error handling and validation.
 * Updated for FR-014: International phone number support
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
import {
  validatePhoneNumber,
  formatPhoneE164,
} from '@/lib/utils/phone-validator';

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
 * Updated for FR-014: International phone support
 *
 * @param data - Customer data (phone can be in any format, will be normalized to E.164)
 * @returns The created customer ID
 */
export async function createCustomer(
  data: Omit<Customer, 'customerId' | 'createdAt' | 'orderCount' | 'totalSpent'> | {
    name: string;
    phone: string;
    email?: string;
    addresses?: Address[];
    preferences?: CustomerPreferences;
    countryCode?: string;
  }
): Promise<string> {
  const customerId = generateCustomerId();

  // Validate and normalize the phone number (FR-014)
  const phoneValidation = validatePhoneNumber(data.phone, 'KE');
  if (!phoneValidation.valid) {
    throw new DatabaseError(`Invalid phone number: ${phoneValidation.error}`);
  }

  // Use E.164 format for storage (ensures consistent lookup)
  const normalizedPhone = phoneValidation.e164 || data.phone;

  // Check if phone number already exists (using normalized format)
  const existingCustomer = await getCustomerByPhone(normalizedPhone);
  if (existingCustomer) {
    throw new DatabaseError(`Customer with phone ${normalizedPhone} already exists`);
  }

  const customer = {
    customerId,
    name: data.name,
    phone: normalizedPhone,
    email: data.email,
    addresses: data.addresses || [],
    preferences: data.preferences || {
      notifications: true,
      language: 'en',
    },
    orderCount: 0,
    totalSpent: 0,
    createdAt: Timestamp.now(),
    // FR-014: Store international phone metadata
    countryCode: phoneValidation.country || data.countryCode || 'KE',
    phoneValidated: true,
    nationalNumber: phoneValidation.nationalNumber,
    phoneFormatted: phoneValidation.formatted,
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
 * Updated for FR-014: Normalizes phone to E.164 before lookup
 *
 * @param phone - Phone number (any format - will be normalized)
 * @returns Customer or null if not found
 */
export async function getCustomerByPhone(
  phone: string
): Promise<Customer | null> {
  try {
    // Normalize the phone number to E.164 for lookup (FR-014)
    const normalizedPhone = formatPhoneE164(phone, 'KE');

    // Search using normalized format
    const customers = await getDocuments<Customer>(
      'customers',
      where('phone', '==', normalizedPhone),
      limit(1)
    );

    if (customers.length > 0) {
      return customers[0];
    }

    // Fallback: try exact match with original input (for legacy data)
    if (normalizedPhone !== phone) {
      const legacyCustomers = await getDocuments<Customer>(
        'customers',
        where('phone', '==', phone),
        limit(1)
      );
      return legacyCustomers.length > 0 ? legacyCustomers[0] : null;
    }

    return null;
  } catch (error) {
    throw new DatabaseError('Failed to get customer by phone', error);
  }
}

/**
 * Search customers by name or phone
 * Updated for FR-014: Supports international phone number searches
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
    // FR-014: Check if search term looks like a phone number (starts with + or digits)
    const looksLikePhone = /^[\+\d]/.test(searchTerm.replace(/[\s\-\(\)]/g, ''));

    if (looksLikePhone) {
      // Normalize and try exact match
      const normalizedPhone = formatPhoneE164(searchTerm, 'KE');
      const customer = await getCustomerByPhone(normalizedPhone);

      if (customer) {
        return [customer];
      }

      // If no exact match, try partial phone search
      const allCustomers = await getDocuments<Customer>(
        'customers',
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      // Clean search term for partial matching
      const cleanSearch = searchTerm.replace(/[\s\-\(\)]/g, '');

      return allCustomers
        .filter((c) => {
          const cleanPhone = c.phone?.replace(/[\s\-\(\)]/g, '') || '';
          const cleanNational = c.nationalNumber || '';
          return (
            cleanPhone.includes(cleanSearch) ||
            cleanNational.includes(cleanSearch.replace(/^\+?\d{1,3}/, ''))
          );
        })
        .slice(0, limitCount);
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

// ============================================
// FR-014: INTERNATIONAL PHONE HELPER FUNCTIONS
// ============================================

/**
 * Get customers by country code (FR-014)
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'KE', 'US')
 * @param limitCount - Maximum results
 * @returns Array of customers from that country
 */
export async function getCustomersByCountry(
  countryCode: string,
  limitCount = 50
): Promise<Customer[]> {
  return getDocuments<Customer>(
    'customers',
    where('countryCode', '==', countryCode.toUpperCase()),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get international customers (non-Kenyan)
 *
 * @param limitCount - Maximum results
 * @returns Array of international customers
 */
export async function getInternationalCustomers(
  limitCount = 50
): Promise<Customer[]> {
  // Firestore doesn't support != queries with orderBy on different field
  // So we fetch all and filter client-side
  const allCustomers = await getDocuments<Customer>(
    'customers',
    orderBy('createdAt', 'desc'),
    limit(200)
  );

  return allCustomers
    .filter((c) => c.countryCode && c.countryCode !== 'KE')
    .slice(0, limitCount);
}

/**
 * Validate if a phone number is already registered
 *
 * @param phone - Phone number to check
 * @returns True if phone is already registered
 */
export async function isPhoneRegistered(phone: string): Promise<boolean> {
  const customer = await getCustomerByPhone(phone);
  return customer !== null;
}

/**
 * Update customer phone number with validation (FR-014)
 *
 * @param customerId - Customer ID
 * @param newPhone - New phone number
 * @returns Updated customer data
 */
export async function updateCustomerPhone(
  customerId: string,
  newPhone: string
): Promise<void> {
  // Validate the new phone number
  const phoneValidation = validatePhoneNumber(newPhone, 'KE');
  if (!phoneValidation.valid) {
    throw new DatabaseError(`Invalid phone number: ${phoneValidation.error}`);
  }

  const normalizedPhone = phoneValidation.e164 || newPhone;

  // Check if new phone is already used by another customer
  const existingCustomer = await getCustomerByPhone(normalizedPhone);
  if (existingCustomer && existingCustomer.customerId !== customerId) {
    throw new DatabaseError(`Phone number ${normalizedPhone} is already registered to another customer`);
  }

  // Update the customer with new phone data
  await updateDocument<Customer>('customers', customerId, {
    phone: normalizedPhone,
    countryCode: phoneValidation.country,
    phoneValidated: true,
    nationalNumber: phoneValidation.nationalNumber,
    phoneFormatted: phoneValidation.formatted,
  });
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

/**
 * Get customer by phone OR email (Issue 81 Fix)
 * Supports both phone-authenticated and email-authenticated users
 *
 * @param phone - Phone number (optional, any format - will be normalized)
 * @param email - Email address (optional)
 * @returns Customer or null if not found
 */
export async function getCustomerByPhoneOrEmail(
  phone?: string | null,
  email?: string | null
): Promise<Customer | null> {
  try {
    // Try phone first if provided
    if (phone) {
      const customerByPhone = await getCustomerByPhone(phone);
      if (customerByPhone) {
        return customerByPhone;
      }
    }

    // Try email if provided
    if (email) {
      const customers = await getDocuments<Customer>(
        'customers',
        where('email', '==', email),
        limit(1)
      );
      if (customers.length > 0) {
        return customers[0];
      }
    }

    return null;
  } catch (error) {
    throw new DatabaseError('Failed to get customer by phone or email', error);
  }
}

/**
 * Get customer by email
 *
 * @param email - Email address to search for
 * @returns Customer or null if not found
 */
export async function getCustomerByEmail(
  email: string
): Promise<Customer | null> {
  try {
    const customers = await getDocuments<Customer>(
      'customers',
      where('email', '==', email),
      limit(1)
    );
    return customers.length > 0 ? customers[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get customer by email', error);
  }
}
