/**
 * Quotation Validation Schemas
 *
 * Zod schemas for validating quotation data throughout the application.
 *
 * @module lib/validations/quotations
 */

import { z } from 'zod';

/**
 * Schema for validating a quotation item
 */
export const quotationItemSchema = z.object({
  garmentType: z.string().min(1, 'Garment type is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  totalPrice: z.number().min(0, 'Total price cannot be negative'),
  specialInstructions: z.string().optional(),
});

/**
 * Schema for creating a new quotation
 */
export const createQuotationSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  deliveryFee: z.number().min(0).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  discountReason: z.string().optional(),
  notes: z.string().optional(),
  validDays: z.number().int().min(1).max(30).optional().default(7),
  estimatedDays: z.number().int().min(1).max(30).optional().default(3),
});

/**
 * Schema for updating a quotation
 */
export const updateQuotationSchema = z.object({
  items: z.array(quotationItemSchema).min(1).optional(),
  deliveryFee: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  discountReason: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  estimatedCompletion: z.string().datetime().optional(),
});

/**
 * Schema for sending a quotation
 */
export const sendQuotationSchema = z.object({
  quotationId: z.string().min(1, 'Quotation ID is required'),
  channel: z.enum(['whatsapp', 'email', 'sms']).optional().default('whatsapp'),
  customMessage: z.string().optional(),
});

/**
 * Schema for accepting a quotation
 */
export const acceptQuotationSchema = z.object({
  quotationId: z.string().min(1, 'Quotation ID is required'),
});

/**
 * Schema for rejecting a quotation
 */
export const rejectQuotationSchema = z.object({
  quotationId: z.string().min(1, 'Quotation ID is required'),
  reason: z.string().optional(),
});

/**
 * Schema for converting a quotation to an order
 */
export const convertQuotationSchema = z.object({
  quotationId: z.string().min(1, 'Quotation ID is required'),
  collectionMethod: z.enum(['drop_off', 'pickup']).optional().default('drop_off'),
  returnMethod: z.enum(['customer_collects', 'delivery']).optional().default('customer_collects'),
  deliveryAddress: z.object({
    label: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  pickupAddress: z.object({
    label: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  paymentMethod: z.enum(['cash', 'mpesa', 'card', 'pesapal', 'credit']).optional(),
  paidAmount: z.number().min(0).optional().default(0),
});

/**
 * Schema for quotation search/filter parameters
 */
export const quotationFilterSchema = z.object({
  branchId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// Type exports
export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type SendQuotationInput = z.infer<typeof sendQuotationSchema>;
export type AcceptQuotationInput = z.infer<typeof acceptQuotationSchema>;
export type RejectQuotationInput = z.infer<typeof rejectQuotationSchema>;
export type ConvertQuotationInput = z.infer<typeof convertQuotationSchema>;
export type QuotationFilterInput = z.infer<typeof quotationFilterSchema>;
