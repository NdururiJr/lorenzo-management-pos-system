/**
 * Voucher System Database Operations
 *
 * V2.0: Complete voucher/discount code system with approval workflow.
 * Supports percentage and fixed discounts, QR codes, and GM approval.
 *
 * @module lib/db/vouchers
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  DatabaseError,
} from './index';
import type { Customer, Order } from './schema';

/**
 * Voucher discount type
 */
export type VoucherDiscountType = 'percentage' | 'fixed';

/**
 * Voucher approval status
 */
export type VoucherApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Voucher status
 */
export type VoucherStatus = 'active' | 'used' | 'expired' | 'cancelled';

/**
 * Voucher document structure
 */
export interface Voucher {
  /** Unique voucher ID (internal) */
  voucherId: string;
  /** Human-readable voucher code (for customer use) */
  voucherCode: string;
  /** QR code data URL (base64 PNG) */
  qrCodeData?: string;
  /** Type of discount */
  discountType: VoucherDiscountType;
  /** Discount value (percentage or fixed amount in KES) */
  discountValue: number;
  /** Maximum discount amount (for percentage type) */
  maxDiscountAmount?: number;
  /** Minimum order value to apply voucher */
  minOrderValue?: number;
  /** Description of the voucher */
  description?: string;
  /** Branch ID this voucher is valid for (null = all branches) */
  validBranchId?: string;
  /** Customer ID if voucher is customer-specific */
  customerId?: string;
  /** Customer name (denormalized) */
  customerName?: string;
  /** User ID who created the voucher */
  createdBy: string;
  /** Creator name (denormalized) */
  createdByName: string;
  /** Approval status */
  approvalStatus: VoucherApprovalStatus;
  /** User ID who approved/rejected */
  approvedBy?: string;
  /** Approver name (denormalized) */
  approvedByName?: string;
  /** Approval timestamp */
  approvedAt?: Timestamp;
  /** Rejection reason */
  rejectionReason?: string;
  /** Voucher status */
  status: VoucherStatus;
  /** Expiry date */
  expiryDate: Timestamp;
  /** Whether voucher has been used */
  isUsed: boolean;
  /** Customer who used the voucher */
  usedByCustomerId?: string;
  /** Customer name who used it */
  usedByCustomerName?: string;
  /** Order where voucher was applied */
  usedOnOrderId?: string;
  /** Timestamp when voucher was used */
  usedAt?: Timestamp;
  /** Amount actually discounted */
  discountedAmount?: number;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Voucher validation result
 */
export interface VoucherValidationResult {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: number;
  error?: string;
}

/**
 * V2.0 Voucher configuration
 */
export const VOUCHER_CONFIG = {
  /** Default expiry days if not specified */
  defaultExpiryDays: 30,
  /** Maximum discount percentage */
  maxPercentage: 50,
  /** Maximum fixed discount (KES) */
  maxFixedAmount: 5000,
  /** Approval threshold - discounts above this require GM approval */
  approvalThreshold: {
    percentage: 20,
    fixed: 1000,
  },
  /** Code generation settings */
  codeLength: 8,
  codePrefix: 'LDC',
};

/**
 * Generate a unique voucher code
 */
export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars (O/0, I/1)
  let code = VOUCHER_CONFIG.codePrefix;
  for (let i = 0; i < VOUCHER_CONFIG.codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate voucher ID
 */
export function generateVoucherId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `VCH-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if voucher requires approval based on value
 */
export function requiresApproval(
  discountType: VoucherDiscountType,
  discountValue: number
): boolean {
  if (discountType === 'percentage') {
    return discountValue > VOUCHER_CONFIG.approvalThreshold.percentage;
  }
  return discountValue > VOUCHER_CONFIG.approvalThreshold.fixed;
}

/**
 * Create a new voucher
 */
export async function createVoucher(data: {
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  description?: string;
  validBranchId?: string;
  customerId?: string;
  customerName?: string;
  createdBy: string;
  createdByName: string;
  expiryDays?: number;
}): Promise<{ voucherId: string; voucherCode: string; requiresApproval: boolean }> {
  try {
    const voucherId = generateVoucherId();
    const voucherCode = generateVoucherCode();

    // Validate discount value
    if (data.discountType === 'percentage' && data.discountValue > VOUCHER_CONFIG.maxPercentage) {
      throw new Error(`Discount percentage cannot exceed ${VOUCHER_CONFIG.maxPercentage}%`);
    }
    if (data.discountType === 'fixed' && data.discountValue > VOUCHER_CONFIG.maxFixedAmount) {
      throw new Error(`Discount amount cannot exceed KES ${VOUCHER_CONFIG.maxFixedAmount}`);
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (data.expiryDays || VOUCHER_CONFIG.defaultExpiryDays));

    // Check if approval is required
    const needsApproval = requiresApproval(data.discountType, data.discountValue);

    const voucher: Voucher = {
      voucherId,
      voucherCode,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxDiscountAmount: data.maxDiscountAmount,
      minOrderValue: data.minOrderValue,
      description: data.description,
      validBranchId: data.validBranchId,
      customerId: data.customerId,
      customerName: data.customerName,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      approvalStatus: needsApproval ? 'pending' : 'approved',
      status: needsApproval ? 'active' : 'active', // Active once approved
      expiryDate: Timestamp.fromDate(expiryDate),
      isUsed: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // If doesn't require approval, auto-approve
    if (!needsApproval) {
      voucher.approvedBy = data.createdBy;
      voucher.approvedByName = data.createdByName;
      voucher.approvedAt = Timestamp.now();
    }

    await setDocument('vouchers', voucherId, voucher);

    return { voucherId, voucherCode, requiresApproval: needsApproval };
  } catch (error) {
    throw new DatabaseError('Failed to create voucher', error);
  }
}

/**
 * Approve a voucher
 */
export async function approveVoucher(
  voucherId: string,
  approvedBy: string,
  approvedByName: string
): Promise<void> {
  try {
    const voucher = await getDocument<Voucher>('vouchers', voucherId);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.approvalStatus !== 'pending') {
      throw new Error('Voucher has already been processed');
    }

    await updateDocument('vouchers', voucherId, {
      approvalStatus: 'approved' as VoucherApprovalStatus,
      approvedBy,
      approvedByName,
      approvedAt: Timestamp.now(),
      status: 'active' as VoucherStatus,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to approve voucher', error);
  }
}

/**
 * Reject a voucher
 */
export async function rejectVoucher(
  voucherId: string,
  rejectedBy: string,
  rejectedByName: string,
  reason: string
): Promise<void> {
  try {
    const voucher = await getDocument<Voucher>('vouchers', voucherId);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.approvalStatus !== 'pending') {
      throw new Error('Voucher has already been processed');
    }

    await updateDocument('vouchers', voucherId, {
      approvalStatus: 'rejected' as VoucherApprovalStatus,
      approvedBy: rejectedBy,
      approvedByName: rejectedByName,
      approvedAt: Timestamp.now(),
      rejectionReason: reason,
      status: 'cancelled' as VoucherStatus,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to reject voucher', error);
  }
}

/**
 * Validate a voucher for use on an order
 */
export async function validateVoucher(
  voucherCode: string,
  orderTotal: number,
  customerId?: string,
  branchId?: string
): Promise<VoucherValidationResult> {
  try {
    // Find voucher by code
    const vouchers = await getDocuments<Voucher>(
      'vouchers',
      where('voucherCode', '==', voucherCode),
      limit(1)
    );

    if (vouchers.length === 0) {
      return { valid: false, error: 'Invalid voucher code' };
    }

    const voucher = vouchers[0];

    // Check approval status
    if (voucher.approvalStatus !== 'approved') {
      return { valid: false, error: 'Voucher is pending approval' };
    }

    // Check if already used
    if (voucher.isUsed || voucher.status === 'used') {
      return { valid: false, error: 'Voucher has already been used' };
    }

    // Check status
    if (voucher.status !== 'active') {
      return { valid: false, error: `Voucher is ${voucher.status}` };
    }

    // Check expiry
    const now = new Date();
    if (voucher.expiryDate.toDate() < now) {
      return { valid: false, error: 'Voucher has expired' };
    }

    // Check minimum order value
    if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
      return {
        valid: false,
        error: `Minimum order value is KES ${voucher.minOrderValue}`,
      };
    }

    // Check branch validity
    if (voucher.validBranchId && branchId && voucher.validBranchId !== branchId) {
      return { valid: false, error: 'Voucher not valid for this branch' };
    }

    // Check customer-specific voucher
    if (voucher.customerId && customerId && voucher.customerId !== customerId) {
      return { valid: false, error: 'Voucher is assigned to another customer' };
    }

    // Calculate discount amount
    let discountAmount: number;
    if (voucher.discountType === 'percentage') {
      discountAmount = orderTotal * (voucher.discountValue / 100);
      // Apply maximum cap if set
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(voucher.discountValue, orderTotal);
    }

    return {
      valid: true,
      voucher,
      discountAmount,
    };
  } catch (error) {
    throw new DatabaseError('Failed to validate voucher', error);
  }
}

/**
 * Apply/redeem a voucher on an order
 */
export async function redeemVoucher(
  voucherId: string,
  orderId: string,
  customerId: string,
  customerName: string,
  discountedAmount: number
): Promise<void> {
  try {
    const voucher = await getDocument<Voucher>('vouchers', voucherId);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.isUsed) {
      throw new Error('Voucher has already been used');
    }

    await updateDocument('vouchers', voucherId, {
      isUsed: true,
      status: 'used' as VoucherStatus,
      usedByCustomerId: customerId,
      usedByCustomerName: customerName,
      usedOnOrderId: orderId,
      usedAt: Timestamp.now(),
      discountedAmount,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to redeem voucher', error);
  }
}

/**
 * Cancel a voucher
 */
export async function cancelVoucher(voucherId: string, reason?: string): Promise<void> {
  try {
    const voucher = await getDocument<Voucher>('vouchers', voucherId);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.isUsed) {
      throw new Error('Cannot cancel a used voucher');
    }

    await updateDocument('vouchers', voucherId, {
      status: 'cancelled' as VoucherStatus,
      rejectionReason: reason,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to cancel voucher', error);
  }
}

/**
 * Get voucher by ID
 */
export async function getVoucherById(voucherId: string): Promise<Voucher | null> {
  try {
    return await getDocument<Voucher>('vouchers', voucherId);
  } catch (error) {
    throw new DatabaseError('Failed to get voucher', error);
  }
}

/**
 * Get voucher by code
 */
export async function getVoucherByCode(voucherCode: string): Promise<Voucher | null> {
  try {
    const vouchers = await getDocuments<Voucher>(
      'vouchers',
      where('voucherCode', '==', voucherCode),
      limit(1)
    );
    return vouchers.length > 0 ? vouchers[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get voucher by code', error);
  }
}

/**
 * Get pending vouchers for approval
 */
export async function getPendingVouchers(branchId?: string): Promise<Voucher[]> {
  try {
    const constraints = [
      where('approvalStatus', '==', 'pending'),
      orderBy('createdAt', 'asc'),
    ];

    if (branchId) {
      constraints.push(where('validBranchId', '==', branchId));
    }

    return getDocuments<Voucher>('vouchers', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get pending vouchers', error);
  }
}

/**
 * Get active vouchers
 */
export async function getActiveVouchers(branchId?: string): Promise<Voucher[]> {
  try {
    const constraints = [
      where('status', '==', 'active'),
      where('approvalStatus', '==', 'approved'),
      orderBy('expiryDate', 'asc'),
    ];

    if (branchId) {
      constraints.push(where('validBranchId', '==', branchId));
    }

    return getDocuments<Voucher>('vouchers', ...constraints);
  } catch (error) {
    throw new DatabaseError('Failed to get active vouchers', error);
  }
}

/**
 * Get customer's vouchers
 */
export async function getCustomerVouchers(customerId: string): Promise<Voucher[]> {
  try {
    return getDocuments<Voucher>(
      'vouchers',
      where('customerId', '==', customerId),
      where('status', '==', 'active'),
      orderBy('expiryDate', 'asc')
    );
  } catch (error) {
    throw new DatabaseError('Failed to get customer vouchers', error);
  }
}

/**
 * Get voucher usage statistics
 */
export async function getVoucherStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  used: number;
  expired: number;
  totalDiscounted: number;
}> {
  try {
    const constraints = [];

    if (startDate) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
    }

    const vouchers = await getDocuments<Voucher>('vouchers', ...constraints);

    const stats = {
      total: vouchers.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      used: 0,
      expired: 0,
      totalDiscounted: 0,
    };

    const now = new Date();

    for (const voucher of vouchers) {
      if (voucher.approvalStatus === 'pending') stats.pending++;
      if (voucher.approvalStatus === 'approved') stats.approved++;
      if (voucher.approvalStatus === 'rejected') stats.rejected++;

      if (voucher.isUsed) {
        stats.used++;
        stats.totalDiscounted += voucher.discountedAmount || 0;
      }

      if (voucher.expiryDate.toDate() < now && !voucher.isUsed) {
        stats.expired++;
      }
    }

    return stats;
  } catch (error) {
    throw new DatabaseError('Failed to get voucher stats', error);
  }
}

/**
 * Update voucher QR code data
 */
export async function updateVoucherQRCode(
  voucherId: string,
  qrCodeData: string
): Promise<void> {
  try {
    await updateDocument('vouchers', voucherId, {
      qrCodeData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to update voucher QR code', error);
  }
}

/**
 * Expire vouchers past their expiry date (called by scheduled function)
 */
export async function expireVouchers(): Promise<number> {
  try {
    const now = Timestamp.now();

    const vouchers = await getDocuments<Voucher>(
      'vouchers',
      where('status', '==', 'active'),
      where('expiryDate', '<', now)
    );

    let expiredCount = 0;
    for (const voucher of vouchers) {
      await updateDocument('vouchers', voucher.voucherId, {
        status: 'expired' as VoucherStatus,
        updatedAt: now,
      });
      expiredCount++;
    }

    return expiredCount;
  } catch (error) {
    throw new DatabaseError('Failed to expire vouchers', error);
  }
}
