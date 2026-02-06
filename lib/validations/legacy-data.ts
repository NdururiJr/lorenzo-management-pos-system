/**
 * Legacy Data Validation Schemas
 *
 * FR-016: Legacy Data Migration
 *
 * Provides Zod validation schemas for legacy data migration.
 * These schemas validate data from external sources (Excel, CSV, old databases)
 * before importing into the Lorenzo system.
 *
 * @module lib/validations/legacy-data
 */

import { z } from 'zod';

// ============================================
// PHONE NUMBER VALIDATION
// ============================================

/**
 * Validates and normalizes Kenyan phone numbers
 * Accepts: 0712345678, +254712345678, 254712345678, 712345678
 */
export const kenyanPhoneSchema = z.string()
  .transform((val) => {
    // Remove all non-digit characters except +
    const cleaned = val.replace(/[^\d+]/g, '');

    // Handle different formats
    if (cleaned.startsWith('+254')) {
      return cleaned;
    } else if (cleaned.startsWith('254') && cleaned.length === 12) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.length === 9 && /^[17]/.test(cleaned)) {
      return '+254' + cleaned;
    }
    return cleaned;
  })
  .refine((val) => /^\+254[17]\d{8}$/.test(val), {
    message: 'Invalid Kenyan phone number. Expected format: +254XXXXXXXXX',
  });

/**
 * Optional phone number validation
 */
export const optionalKenyanPhoneSchema = z.string()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return undefined;
    return val;
  })
  .pipe(kenyanPhoneSchema.optional());

// ============================================
// LEGACY CUSTOMER VALIDATION
// ============================================

/**
 * Validates legacy customer data
 */
export const legacyCustomerSchema = z.object({
  // Required fields
  name: z.string()
    .min(1, 'Customer name is required')
    .max(100, 'Name too long (max 100 characters)')
    .transform((val) => val.trim()),

  phone: kenyanPhoneSchema,

  // Optional fields
  email: z.string()
    .email('Invalid email format')
    .optional()
    .nullable()
    .transform((val) => val?.trim().toLowerCase() || undefined),

  // Address fields (optional - may come as separate columns)
  address: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),

  addressLabel: z.string()
    .optional()
    .nullable()
    .default('Home'),

  // Legacy system identifiers
  legacyId: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),

  // Metrics from legacy system
  totalOrders: z.coerce.number()
    .int()
    .min(0)
    .optional()
    .nullable()
    .default(0),

  totalSpent: z.coerce.number()
    .min(0)
    .optional()
    .nullable()
    .default(0),

  // Creation date from legacy system
  createdAt: z.union([
    z.date(),
    z.string().transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        return new Date(); // Default to now if invalid
      }
      return date;
    }),
  ])
    .optional()
    .nullable()
    .default(() => new Date()),

  // Preferences
  notificationsEnabled: z.coerce.boolean()
    .optional()
    .nullable()
    .default(true),

  language: z.enum(['en', 'sw'])
    .optional()
    .nullable()
    .default('en'),
});

export type LegacyCustomer = z.infer<typeof legacyCustomerSchema>;

// ============================================
// LEGACY ORDER VALIDATION
// ============================================

/**
 * Legacy order status mapping
 * Maps common legacy status names to our OrderStatus
 */
export const LEGACY_STATUS_MAP: Record<string, string> = {
  // Common legacy statuses
  'new': 'received',
  'pending': 'received',
  'received': 'received',
  'in progress': 'washing',
  'in-progress': 'washing',
  'processing': 'washing',
  'washing': 'washing',
  'drying': 'drying',
  'ironing': 'ironing',
  'pressing': 'ironing',
  'quality': 'quality_check',
  'quality check': 'quality_check',
  'qc': 'quality_check',
  'packaging': 'packaging',
  'packing': 'packaging',
  'ready': 'queued_for_delivery',
  'ready for pickup': 'queued_for_delivery',
  'ready for delivery': 'queued_for_delivery',
  'queued': 'queued_for_delivery',
  'out for delivery': 'out_for_delivery',
  'dispatched': 'out_for_delivery',
  'delivered': 'delivered',
  'complete': 'delivered',
  'completed': 'delivered',
  'collected': 'collected',
  'picked up': 'collected',
};

/**
 * Legacy payment status mapping
 */
export const LEGACY_PAYMENT_STATUS_MAP: Record<string, string> = {
  'unpaid': 'pending',
  'pending': 'pending',
  'partial': 'partial',
  'partially paid': 'partial',
  'paid': 'paid',
  'complete': 'paid',
  'full': 'paid',
};

/**
 * Legacy payment method mapping
 */
export const LEGACY_PAYMENT_METHOD_MAP: Record<string, string> = {
  'cash': 'cash',
  'mpesa': 'mpesa',
  'm-pesa': 'mpesa',
  'mobile': 'mpesa',
  'card': 'card',
  'credit card': 'card',
  'debit card': 'card',
  'visa': 'card',
  'mastercard': 'card',
  'credit': 'credit',
  'account': 'credit',
};

/**
 * Validates legacy order data
 */
export const legacyOrderSchema = z.object({
  // Order identifiers
  legacyOrderId: z.string()
    .min(1, 'Order ID is required')
    .transform((val) => val.trim()),

  // Customer reference (phone or legacy customer ID)
  customerPhone: kenyanPhoneSchema.optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),

  // Branch reference
  branchName: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),

  branchId: z.string().optional(),

  // Order status
  status: z.string()
    .transform((val) => {
      const normalized = val.toLowerCase().trim();
      return LEGACY_STATUS_MAP[normalized] || 'received';
    }),

  // Amounts
  totalAmount: z.coerce.number()
    .min(0, 'Total amount must be non-negative')
    .default(0),

  paidAmount: z.coerce.number()
    .min(0, 'Paid amount must be non-negative')
    .optional()
    .nullable()
    .default(0),

  // Payment info
  paymentStatus: z.string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return 'pending';
      const normalized = val.toLowerCase().trim();
      return LEGACY_PAYMENT_STATUS_MAP[normalized] || 'pending';
    }),

  paymentMethod: z.string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return undefined;
      const normalized = val.toLowerCase().trim();
      return LEGACY_PAYMENT_METHOD_MAP[normalized] || undefined;
    }),

  // Dates
  createdAt: z.union([
    z.date(),
    z.string().transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${val}`);
      }
      return date;
    }),
  ]),

  completedAt: z.union([
    z.date(),
    z.string().transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return date;
    }),
  ])
    .optional()
    .nullable(),

  // Collection/Return methods
  collectionMethod: z.enum(['dropped_off', 'pickup_required'])
    .optional()
    .default('dropped_off'),

  returnMethod: z.enum(['customer_collects', 'delivery_required'])
    .optional()
    .default('customer_collects'),

  // Delivery address (if applicable)
  deliveryAddress: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),

  // Notes
  specialInstructions: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),
});

export type LegacyOrder = z.infer<typeof legacyOrderSchema>;

// ============================================
// LEGACY GARMENT VALIDATION
// ============================================

/**
 * Common garment type mapping
 */
export const GARMENT_TYPE_MAP: Record<string, string> = {
  // Shirts
  'shirt': 'Shirt',
  'blouse': 'Blouse',
  't-shirt': 'T-Shirt',
  'polo': 'Polo Shirt',

  // Pants
  'trousers': 'Trousers',
  'pants': 'Trousers',
  'jeans': 'Jeans',
  'shorts': 'Shorts',

  // Suits
  'suit': 'Suit (2-piece)',
  'suit 2pc': 'Suit (2-piece)',
  'suit 3pc': 'Suit (3-piece)',
  'blazer': 'Blazer',
  'jacket': 'Jacket',

  // Dresses
  'dress': 'Dress',
  'gown': 'Gown',
  'skirt': 'Skirt',

  // Outerwear
  'coat': 'Coat',
  'overcoat': 'Overcoat',
  'sweater': 'Sweater',
  'cardigan': 'Cardigan',

  // Bedding
  'bedsheet': 'Bedsheet',
  'duvet': 'Duvet',
  'blanket': 'Blanket',
  'pillow case': 'Pillow Case',
  'curtain': 'Curtain',

  // Traditional
  'kitenge': 'Kitenge',
  'kikoi': 'Kikoi',
  'kanzu': 'Kanzu',

  // Other
  'tie': 'Tie',
  'scarf': 'Scarf',
  'other': 'Other',
};

/**
 * Validates legacy garment/item data
 */
export const legacyGarmentSchema = z.object({
  // Reference to order
  legacyOrderId: z.string()
    .min(1, 'Order ID is required'),

  // Garment details
  type: z.string()
    .transform((val) => {
      const normalized = val.toLowerCase().trim();
      return GARMENT_TYPE_MAP[normalized] || val.trim();
    }),

  color: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || 'Not specified'),

  brand: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),

  // Services
  services: z.union([
    z.array(z.string()),
    z.string().transform((val) => {
      // Handle comma-separated services
      return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    }),
  ])
    .default(['Dry Clean']),

  // Pricing
  price: z.coerce.number()
    .min(0, 'Price must be non-negative')
    .default(0),

  // Notes
  specialInstructions: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),

  // Initial damage notes (from legacy)
  damageNotes: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),
});

export type LegacyGarment = z.infer<typeof legacyGarmentSchema>;

// ============================================
// LEGACY TRANSACTION VALIDATION
// ============================================

/**
 * Validates legacy transaction/payment data
 */
export const legacyTransactionSchema = z.object({
  // Reference to order
  legacyOrderId: z.string()
    .min(1, 'Order ID is required'),

  // Amount
  amount: z.coerce.number()
    .positive('Transaction amount must be positive'),

  // Payment method
  method: z.string()
    .transform((val) => {
      const normalized = val.toLowerCase().trim();
      return LEGACY_PAYMENT_METHOD_MAP[normalized] || 'mpesa';
    }),

  // Reference (M-Pesa code, etc.)
  reference: z.string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || undefined),

  // Status
  status: z.enum(['pending', 'completed', 'failed'])
    .default('completed'),

  // Timestamp
  timestamp: z.union([
    z.date(),
    z.string().transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        return new Date();
      }
      return date;
    }),
  ])
    .default(() => new Date()),
});

export type LegacyTransaction = z.infer<typeof legacyTransactionSchema>;

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationError {
  row: number;
  field: string;
  value: unknown;
  message: string;
}

export interface ValidationResult<T> {
  valid: T[];
  invalid: Array<{
    row: number;
    data: Record<string, unknown>;
    errors: ValidationError[];
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    errorsByField: Record<string, number>;
  };
}

// ============================================
// BATCH VALIDATION FUNCTIONS
// ============================================

/**
 * Validates an array of records against a Zod schema
 */
export function validateBatch<TSchema extends z.ZodTypeAny>(
  data: Record<string, unknown>[],
  schema: TSchema,
  options?: { startRow?: number }
): ValidationResult<z.output<TSchema>> {
  const startRow = options?.startRow ?? 1;
  const valid: z.output<TSchema>[] = [];
  const invalid: ValidationResult<z.output<TSchema>>['invalid'] = [];
  const errorsByField: Record<string, number> = {};

  for (let i = 0; i < data.length; i++) {
    const rowNumber = startRow + i;
    const record = data[i];
    const result = schema.safeParse(record);

    if (result.success) {
      valid.push(result.data);
    } else {
      const errors: ValidationError[] = result.error.errors.map((err) => {
        const field = err.path.join('.');
        errorsByField[field] = (errorsByField[field] || 0) + 1;
        return {
          row: rowNumber,
          field,
          value: err.path.reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key as string], record),
          message: err.message,
        };
      });

      invalid.push({
        row: rowNumber,
        data: record,
        errors,
      });
    }
  }

  return {
    valid,
    invalid,
    summary: {
      total: data.length,
      valid: valid.length,
      invalid: invalid.length,
      errorsByField,
    },
  };
}

/**
 * Validates legacy customer data
 */
export function validateLegacyCustomers(data: Record<string, unknown>[]) {
  return validateBatch(data, legacyCustomerSchema);
}

/**
 * Validates legacy order data
 */
export function validateLegacyOrders(data: Record<string, unknown>[]) {
  return validateBatch(data, legacyOrderSchema);
}

/**
 * Validates legacy garment data
 */
export function validateLegacyGarments(data: Record<string, unknown>[]) {
  return validateBatch(data, legacyGarmentSchema);
}

/**
 * Validates legacy transaction data
 */
export function validateLegacyTransactions(data: Record<string, unknown>[]) {
  return validateBatch(data, legacyTransactionSchema);
}
