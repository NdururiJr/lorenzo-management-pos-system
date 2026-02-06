/**
 * Order Validation Schemas
 *
 * Zod validation schemas for order-related operations
 *
 * @module lib/validations/orders
 */

import { z } from 'zod';

/**
 * Kenya phone number regex
 * Accepts formats: +254... or 254... or 07... or 01...
 */
const kenyaPhoneRegex = /^(\+254|254|0)[17]\d{8}$/;

/**
 * Normalize Kenya phone number to +254 format
 */
export function normalizeKenyaPhone(phone: string): string {
  // Remove all spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // If starts with +254, return as is
  if (cleaned.startsWith('+254')) {
    return cleaned;
  }

  // If starts with 254, add +
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }

  // If starts with 0, replace with +254
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  }

  return cleaned;
}

/**
 * Garment category enum (V2.0)
 */
export const garmentCategoryEnum = z.enum(['Adult', 'Children']);

/**
 * Garment schema (V2.0 Enhanced)
 * - brand is now mandatory (use "No Brand" if unknown)
 * - category (Adult/Children) is mandatory
 */
export const garmentSchema = z.object({
  type: z.string().min(1, 'Garment type is required'),
  color: z.string().min(1, 'Color is required'),
  // V2.0: Brand is now mandatory
  brand: z.string().min(1, 'Brand is required (use "No Brand" if unknown)'),
  // V2.0: Flag for "No Brand" checkbox
  noBrand: z.boolean(),
  // V2.0: Category is mandatory
  category: garmentCategoryEnum,
  services: z
    .array(z.string())
    .min(1, 'At least one service must be selected'),
  specialInstructions: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  // V2.0: Optional tag number (auto-generated)
  tagNumber: z.string().optional(),
}).refine(
  // If noBrand is true, brand should be "No Brand"
  (data) => !data.noBrand || data.brand === 'No Brand',
  {
    message: 'Brand must be "No Brand" when no brand checkbox is selected',
    path: ['brand'],
  }
);

/**
 * Service type enum (V2.0)
 */
export const serviceTypeEnum = z.enum(['Normal', 'Express']);

/**
 * Delivery classification enum (V2.0)
 */
export const deliveryClassificationEnum = z.enum(['Small', 'Bulk']);

/**
 * Create order schema (V2.0 Enhanced)
 * - checkedBy is now mandatory
 * - serviceType is mandatory (defaults to 'Normal')
 */
export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  branchId: z.string().min(1, 'Branch is required'),
  garments: z
    .array(garmentSchema)
    .min(1, 'At least one garment is required')
    .max(50, 'Maximum 50 garments per order'),
  paymentMethod: z.enum(['mpesa', 'card', 'credit']).optional(),
  paidAmount: z.number().min(0, 'Paid amount must be non-negative').default(0),
  deliveryAddress: z.string().optional(),
  specialInstructions: z.string().max(500).optional(),
  estimatedCompletion: z.date().optional(),

  // ===== V2.0: New Mandatory Fields =====
  /** User ID of inspector who checked the order (V2.0: mandatory) */
  checkedBy: z.string().min(1, 'Inspector (Checked By) is required'),
  /** Service type: Normal or Express (V2.0: mandatory, defaults to Normal) */
  serviceType: serviceTypeEnum.default('Normal'),

  // ===== V2.0: Optional New Fields =====
  /** Delivery classification (auto-calculated or manual) */
  deliveryClassification: deliveryClassificationEnum.optional(),
  /** Is this a rewash order */
  isRewash: z.boolean().optional().default(false),
  /** Original order ID if this is a rewash */
  originalOrderId: z.string().optional(),
  /** Rewash reason */
  rewashReason: z.string().optional(),
}).refine(
  // If isRewash is true, originalOrderId is required
  (data) => !data.isRewash || (data.originalOrderId && data.originalOrderId.length > 0),
  {
    message: 'Original order ID is required for rewash orders',
    path: ['originalOrderId'],
  }
);

/**
 * Update order status schema
 */
// FR-008: Updated to use 'queued_for_delivery' instead of 'ready'
export const updateOrderStatusSchema = z.object({
  status: z.enum([
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
    'collected',
  ]),
});

/**
 * Update order payment schema
 */
export const updateOrderPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['mpesa', 'card', 'credit']),
});

/**
 * Create customer schema
 */
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(kenyaPhoneRegex, 'Invalid Kenya phone number')
    .transform(normalizeKenyaPhone),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  addresses: z
    .array(
      z.object({
        label: z.string().min(1, 'Address label is required'),
        address: z.string().min(5, 'Address must be at least 5 characters'),
        coordinates: z.object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
        }),
      })
    )
    .optional(),
  preferences: z
    .object({
      notifications: z.boolean(),
      language: z.enum(['en', 'sw']),
    })
    .optional(),
});

/**
 * Update customer schema
 */
export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .regex(kenyaPhoneRegex)
    .transform(normalizeKenyaPhone)
    .optional(),
  email: z.string().email().optional().or(z.literal('')),
  addresses: z
    .array(
      z.object({
        label: z.string(),
        address: z.string(),
        coordinates: z
          .object({
            lat: z.number(),
            lng: z.number(),
          })
          .optional(),
      })
    )
    .optional(),
  preferences: z
    .object({
      notifications: z.boolean().optional(),
      language: z.enum(['en', 'sw']).optional(),
    })
    .optional(),
});

/**
 * Search customers schema
 */
export const searchCustomersSchema = z.object({
  searchTerm: z.string().min(2, 'Search term must be at least 2 characters'),
  limit: z.number().int().positive().max(100).optional().default(20),
});

/**
 * Create transaction schema
 */
export const createTransactionSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['mpesa', 'card', 'credit']),
  pesapalRef: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Update pricing schema
 */
export const updatePricingSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  garmentType: z.string().min(1, 'Garment type is required'),
  services: z.object({
    wash: z.number().min(0),
    dryClean: z.number().min(0),
    iron: z.number().min(0),
    starch: z.number().min(0),
    express: z.number().min(0).max(100), // Percentage
  }),
  active: z.boolean().default(true),
});

/**
 * Calculate price schema
 */
export const calculatePriceSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  garments: z.array(
    z.object({
      type: z.string().min(1),
      services: z.array(z.string()).min(1),
    })
  ),
});

// ============================================
// V2.0 VALIDATION SCHEMAS
// ============================================

/**
 * Voucher discount type enum (V2.0)
 */
export const voucherDiscountTypeEnum = z.enum(['percentage', 'fixed']);

/**
 * Create voucher schema (V2.0)
 */
export const createVoucherSchema = z.object({
  voucherCode: z
    .string()
    .min(4, 'Voucher code must be at least 4 characters')
    .max(20, 'Voucher code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Voucher code must be uppercase letters and numbers only'),
  discountType: voucherDiscountTypeEnum,
  discountValue: z.number().positive('Discount value must be positive'),
  minOrderAmount: z.number().min(0).optional(),
  expiryDate: z.date(),
  purpose: z.string().max(200).optional(),
  branchId: z.string().optional(),
}).refine(
  (data) => data.discountType !== 'percentage' || (data.discountValue >= 1 && data.discountValue <= 100),
  {
    message: 'Percentage discount must be between 1 and 100',
    path: ['discountValue'],
  }
);

/**
 * Reminder type enum (V2.0)
 */
export const reminderTypeEnum = z.enum(['7_days', '14_days', '30_days', 'monthly', 'disposal_eligible']);

/**
 * Create reminder schema (V2.0)
 */
export const createReminderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  reminderType: reminderTypeEnum,
  scheduledDate: z.date(),
  messageContent: z.string().max(500).optional(),
});

/**
 * Delivery note type enum (V2.0)
 */
export const deliveryNoteTypeEnum = z.enum(['tailor_transfer', 'inter_store_transfer']);

/**
 * Create delivery note schema (V2.0)
 */
export const createDeliveryNoteSchema = z.object({
  noteType: deliveryNoteTypeEnum,
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  orderIds: z.array(z.string()).min(1, 'At least one order is required'),
  expectedReturnDate: z.date().optional(),
  itemsDescription: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Target type enum (V2.0)
 */
export const targetTypeEnum = z.enum(['daily', 'weekly', 'monthly']);

/**
 * Create target schema (V2.0)
 */
export const createTargetSchema = z.object({
  targetType: targetTypeEnum,
  branchId: z.string().optional(),
  userId: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  targetPeriodStart: z.date(),
  targetPeriodEnd: z.date(),
}).refine(
  (data) => data.branchId || data.userId,
  {
    message: 'Either branch ID or user ID must be provided',
    path: ['branchId'],
  }
).refine(
  (data) => data.targetPeriodEnd > data.targetPeriodStart,
  {
    message: 'End date must be after start date',
    path: ['targetPeriodEnd'],
  }
);

/**
 * Cash out type enum (V2.0)
 */
export const cashOutTypeEnum = z.enum([
  'uncollected_garment',
  'discount',
  'compensation',
  'order_cancellation',
  'refund',
]);

/**
 * Create cash out request schema (V2.0)
 */
export const createCashOutRequestSchema = z.object({
  transactionType: cashOutTypeEnum,
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  branchId: z.string().optional(),
});

/**
 * Rewash request schema (V2.0)
 */
export const createRewashRequestSchema = z.object({
  originalOrderId: z.string().min(1, 'Original order ID is required'),
  garmentIds: z.array(z.string()).min(1, 'At least one garment must be selected'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  customerId: z.string().min(1, 'Customer ID is required'),
});

// Export types
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderPaymentInput = z.infer<typeof updateOrderPaymentSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type SearchCustomersInput = z.infer<typeof searchCustomersSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;
export type CalculatePriceInput = z.infer<typeof calculatePriceSchema>;

// V2.0 Types
export type GarmentCategory = z.infer<typeof garmentCategoryEnum>;
export type ServiceType = z.infer<typeof serviceTypeEnum>;
export type DeliveryClassification = z.infer<typeof deliveryClassificationEnum>;
export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type CreateDeliveryNoteInput = z.infer<typeof createDeliveryNoteSchema>;
export type CreateTargetInput = z.infer<typeof createTargetSchema>;
export type CreateCashOutRequestInput = z.infer<typeof createCashOutRequestSchema>;
export type CreateRewashRequestInput = z.infer<typeof createRewashRequestSchema>;
