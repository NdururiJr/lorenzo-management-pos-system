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
 * Garment schema
 */
export const garmentSchema = z.object({
  type: z.string().min(1, 'Garment type is required'),
  color: z.string().min(1, 'Color is required'),
  brand: z.string().optional(),
  services: z
    .array(z.string())
    .min(1, 'At least one service must be selected'),
  specialInstructions: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
});

/**
 * Create order schema
 */
export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  branchId: z.string().min(1, 'Branch is required'),
  garments: z
    .array(garmentSchema)
    .min(1, 'At least one garment is required')
    .max(50, 'Maximum 50 garments per order'),
  paymentMethod: z.enum(['cash', 'mpesa', 'card', 'credit']).optional(),
  paidAmount: z.number().min(0, 'Paid amount must be non-negative').default(0),
  deliveryAddress: z.string().optional(),
  specialInstructions: z.string().max(500).optional(),
  estimatedCompletion: z.date().optional(),
});

/**
 * Update order status schema
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'received',
    'queued',
    'washing',
    'drying',
    'ironing',
    'quality_check',
    'packaging',
    'ready',
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
  method: z.enum(['cash', 'mpesa', 'card', 'credit']),
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
  method: z.enum(['cash', 'mpesa', 'card', 'credit']),
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
