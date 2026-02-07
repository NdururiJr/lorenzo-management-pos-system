/**
 * Quotation Database Operations
 *
 * This file provides type-safe CRUD operations for the quotations collection.
 * Includes quotation creation, status updates, conversion to orders, and queries.
 *
 * @module lib/db/quotations
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
import type {
  Quotation,
  QuotationItem,
  QuotationStatus,
} from './schema';
import { getCustomer } from './customers';

/**
 * Generate a unique quotation ID
 * Format: QT-[BRANCH]-[YYYYMMDD]-[####]
 *
 * @param branchId - Branch identifier (e.g., "MAIN", "KIL")
 * @returns Formatted quotation ID
 */
export async function generateQuotationId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Get today's quotations for this branch to determine sequence number
  const todayQuotations = await getDocuments<Quotation>(
    'quotations',
    where('branchId', '==', branchId),
    where(
      'createdAt',
      '>=',
      Timestamp.fromDate(new Date(today.setHours(0, 0, 0, 0)))
    ),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayQuotations.length > 0) {
    const lastQuotation = todayQuotations[0];
    // Extract sequence from last quotation ID (QT-BRANCH-20251015-0001)
    const lastSequence = parseInt(
      lastQuotation.quotationId.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `QT-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Calculate quotation totals from items
 */
export function calculateQuotationTotals(
  items: QuotationItem[],
  deliveryFee: number = 0,
  discountAmount: number = 0
): { subtotal: number; totalAmount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = subtotal + deliveryFee - discountAmount;
  return { subtotal, totalAmount: Math.max(0, totalAmount) };
}

/**
 * Calculate default validity period (7 days from now)
 */
export function getDefaultValidUntil(): Timestamp {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);
  return Timestamp.fromDate(validUntil);
}

/**
 * Calculate default estimated completion (3 business days)
 */
export function getDefaultEstimatedCompletion(): Timestamp {
  const completion = new Date();
  let daysToAdd = 3;

  // Skip weekends
  while (daysToAdd > 0) {
    completion.setDate(completion.getDate() + 1);
    const day = completion.getDay();
    if (day !== 0) { // Skip Sunday
      daysToAdd--;
    }
  }

  return Timestamp.fromDate(completion);
}

// ============================================
// QUOTATION CRUD OPERATIONS
// ============================================

/**
 * Input for creating a new quotation
 */
export interface CreateQuotationInput {
  customerId: string;
  branchId: string;
  items: QuotationItem[];
  deliveryFee?: number;
  discountAmount?: number;
  discountReason?: string;
  notes?: string;
  validUntil?: Timestamp;
  estimatedCompletion?: Timestamp;
  createdBy: string;
  createdByName: string;
}

/**
 * Create a new quotation
 *
 * @param input - Quotation input data
 * @returns The created quotation
 * @throws {DatabaseError} If the operation fails
 */
export async function createQuotation(
  input: CreateQuotationInput
): Promise<Quotation> {
  try {
    // Get customer details
    const customer = await getCustomer(input.customerId);

    // Generate quotation ID
    const quotationId = await generateQuotationId(input.branchId);

    // Calculate totals
    const { subtotal, totalAmount } = calculateQuotationTotals(
      input.items,
      input.deliveryFee || 0,
      input.discountAmount || 0
    );

    const now = Timestamp.now();

    const quotation: Quotation = {
      quotationId,
      customerId: input.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      branchId: input.branchId,
      items: input.items,
      subtotal,
      deliveryFee: input.deliveryFee || 0,
      discountAmount: input.discountAmount || 0,
      discountReason: input.discountReason,
      totalAmount,
      status: 'draft',
      validUntil: input.validUntil || getDefaultValidUntil(),
      estimatedCompletion: input.estimatedCompletion || getDefaultEstimatedCompletion(),
      notes: input.notes,
      createdBy: input.createdBy,
      createdByName: input.createdByName,
      createdAt: now,
      updatedAt: now,
    };

    await setDocument('quotations', quotationId, quotation);

    return quotation;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Failed to create quotation', error);
  }
}

/**
 * Get a quotation by ID
 *
 * @param quotationId - The quotation ID
 * @returns The quotation
 * @throws {DatabaseError} If the operation fails
 */
export async function getQuotation(quotationId: string): Promise<Quotation> {
  return getDocument<Quotation>('quotations', quotationId);
}

/**
 * Update a quotation
 *
 * @param quotationId - The quotation ID
 * @param updates - Partial quotation updates
 * @returns The updated quotation
 * @throws {DatabaseError} If the operation fails
 */
export async function updateQuotation(
  quotationId: string,
  updates: Partial<Omit<Quotation, 'quotationId' | 'createdAt' | 'createdBy' | 'createdByName'>>
): Promise<Quotation> {
  try {
    // If items are updated, recalculate totals
    if (updates.items) {
      const deliveryFee = updates.deliveryFee ?? (await getQuotation(quotationId)).deliveryFee;
      const discountAmount = updates.discountAmount ?? (await getQuotation(quotationId)).discountAmount;
      const { subtotal, totalAmount } = calculateQuotationTotals(
        updates.items,
        deliveryFee,
        discountAmount
      );
      updates.subtotal = subtotal;
      updates.totalAmount = totalAmount;
    }

    await updateDocument('quotations', quotationId, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return getQuotation(quotationId);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`Failed to update quotation ${quotationId}`, error);
  }
}

/**
 * Delete a quotation
 *
 * @param quotationId - The quotation ID
 * @throws {DatabaseError} If the operation fails
 */
export async function deleteQuotation(quotationId: string): Promise<void> {
  try {
    // Only allow deletion of draft quotations
    const quotation = await getQuotation(quotationId);
    if (quotation.status !== 'draft') {
      throw new DatabaseError(`Cannot delete quotation with status: ${quotation.status}`);
    }

    await deleteDocument('quotations', quotationId);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(`Failed to delete quotation ${quotationId}`, error);
  }
}

// ============================================
// QUOTATION STATUS OPERATIONS
// ============================================

/**
 * Send a quotation to customer
 *
 * @param quotationId - The quotation ID
 * @param sentVia - Channel used to send (whatsapp, email, sms)
 * @returns The updated quotation
 */
export async function sendQuotation(
  quotationId: string,
  sentVia: 'whatsapp' | 'email' | 'sms' = 'whatsapp'
): Promise<Quotation> {
  const quotation = await getQuotation(quotationId);

  if (quotation.status !== 'draft') {
    throw new DatabaseError(`Cannot send quotation with status: ${quotation.status}`);
  }

  return updateQuotation(quotationId, {
    status: 'sent',
    sentAt: Timestamp.now(),
    sentVia,
  });
}

/**
 * Mark quotation as accepted by customer
 *
 * @param quotationId - The quotation ID
 * @returns The updated quotation
 */
export async function acceptQuotation(quotationId: string): Promise<Quotation> {
  const quotation = await getQuotation(quotationId);

  if (quotation.status !== 'sent') {
    throw new DatabaseError(`Cannot accept quotation with status: ${quotation.status}`);
  }

  // Check if not expired
  const now = new Date();
  const validUntil = quotation.validUntil instanceof Date
    ? quotation.validUntil
    : quotation.validUntil.toDate();

  if (now > validUntil) {
    throw new DatabaseError('Cannot accept expired quotation');
  }

  return updateQuotation(quotationId, {
    status: 'accepted',
    acceptedAt: Timestamp.now(),
  });
}

/**
 * Mark quotation as rejected by customer
 *
 * @param quotationId - The quotation ID
 * @param reason - Rejection reason
 * @returns The updated quotation
 */
export async function rejectQuotation(
  quotationId: string,
  reason?: string
): Promise<Quotation> {
  const quotation = await getQuotation(quotationId);

  if (!['sent', 'draft'].includes(quotation.status)) {
    throw new DatabaseError(`Cannot reject quotation with status: ${quotation.status}`);
  }

  return updateQuotation(quotationId, {
    status: 'rejected',
    rejectedAt: Timestamp.now(),
    rejectionReason: reason,
  });
}

/**
 * Mark quotation as expired
 *
 * @param quotationId - The quotation ID
 * @returns The updated quotation
 */
export async function expireQuotation(quotationId: string): Promise<Quotation> {
  return updateQuotation(quotationId, {
    status: 'expired',
  });
}

/**
 * Mark quotation as converted (after order is created)
 *
 * @param quotationId - The quotation ID
 * @param orderId - The created order ID
 * @returns The updated quotation
 */
export async function markQuotationConverted(
  quotationId: string,
  orderId: string
): Promise<Quotation> {
  const quotation = await getQuotation(quotationId);

  if (quotation.status !== 'accepted') {
    throw new DatabaseError(`Cannot convert quotation with status: ${quotation.status}`);
  }

  return updateQuotation(quotationId, {
    status: 'converted',
    convertedOrderId: orderId,
    convertedAt: Timestamp.now(),
  });
}

// ============================================
// QUOTATION QUERIES
// ============================================

/**
 * Get quotations by customer
 *
 * @param customerId - Customer ID
 * @param limitCount - Maximum number of results
 * @returns Array of quotations
 */
export async function getQuotationsByCustomer(
  customerId: string,
  limitCount: number = 20
): Promise<Quotation[]> {
  return getDocuments<Quotation>(
    'quotations',
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get quotations by branch
 *
 * @param branchId - Branch ID
 * @param status - Optional status filter
 * @param limitCount - Maximum number of results
 * @returns Array of quotations
 */
export async function getQuotationsByBranch(
  branchId: string,
  status?: QuotationStatus,
  limitCount: number = 50
): Promise<Quotation[]> {
  const constraints = [
    where('branchId', '==', branchId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (status) {
    constraints.unshift(where('status', '==', status));
  }

  return getDocuments<Quotation>('quotations', ...constraints);
}

/**
 * Get pending quotations (draft or sent, not expired)
 *
 * @param branchId - Branch ID
 * @returns Array of pending quotations
 */
export async function getPendingQuotations(branchId: string): Promise<Quotation[]> {
  const quotations = await getDocuments<Quotation>(
    'quotations',
    where('branchId', '==', branchId),
    where('status', 'in', ['draft', 'sent']),
    orderBy('createdAt', 'desc')
  );

  // Filter out expired ones
  const now = new Date();
  return quotations.filter(q => {
    const validUntil = q.validUntil instanceof Date
      ? q.validUntil
      : q.validUntil.toDate();
    return now <= validUntil;
  });
}

/**
 * Get expired quotations that need to be marked as expired
 *
 * @returns Array of expired quotations
 */
export async function getExpiredQuotations(): Promise<Quotation[]> {
  const quotations = await getDocuments<Quotation>(
    'quotations',
    where('status', 'in', ['draft', 'sent']),
    where('validUntil', '<', Timestamp.now())
  );

  return quotations;
}

/**
 * Get quotation statistics for a branch
 *
 * @param branchId - Branch ID
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Quotation statistics
 */
export async function getQuotationStats(
  branchId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  converted: number;
  conversionRate: number;
  totalValue: number;
  convertedValue: number;
}> {
  const quotations = await getDocuments<Quotation>(
    'quotations',
    where('branchId', '==', branchId),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate))
  );

  const stats: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    converted: number;
    conversionRate: number;
    totalValue: number;
    convertedValue: number;
  } = {
    total: quotations.length,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    converted: 0,
    conversionRate: 0,
    totalValue: 0,
    convertedValue: 0,
  };

  quotations.forEach(q => {
    const status = q.status as keyof Pick<typeof stats, 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'>;
    if (status in stats) {
      stats[status]++;
    }
    stats.totalValue += q.totalAmount;
    if (q.status === 'converted') {
      stats.convertedValue += q.totalAmount;
    }
  });

  // Conversion rate = converted / (sent + accepted + converted)
  const eligibleForConversion = stats.sent + stats.accepted + stats.converted;
  stats.conversionRate = eligibleForConversion > 0
    ? Math.round(((stats.converted / eligibleForConversion) * 100) * 100) / 100
    : 0;

  return stats;
}

/**
 * Search quotations by customer name or phone
 *
 * @param branchId - Branch ID
 * @param searchTerm - Customer name or phone
 * @param limitCount - Maximum results
 * @returns Matching quotations
 */
export async function searchQuotations(
  branchId: string,
  searchTerm: string,
  limitCount: number = 20
): Promise<Quotation[]> {
  // Firestore doesn't support text search, so we fetch and filter
  // In production, consider using Algolia or Elasticsearch
  const quotations = await getDocuments<Quotation>(
    'quotations',
    where('branchId', '==', branchId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const term = searchTerm.toLowerCase();
  return quotations
    .filter(q =>
      q.customerName.toLowerCase().includes(term) ||
      q.customerPhone.includes(term) ||
      q.quotationId.toLowerCase().includes(term)
    )
    .slice(0, limitCount);
}
