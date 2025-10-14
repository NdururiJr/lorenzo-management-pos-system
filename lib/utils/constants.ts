/**
 * Application Constants
 *
 * Centralized constants used throughout the POS system
 *
 * @module lib/utils/constants
 */

/**
 * Common garment types
 */
export const GARMENT_TYPES = [
  'Shirt',
  'Pants',
  'Dress',
  'Suit',
  'Blazer',
  'Coat',
  'Sweater',
  'Jeans',
  'Skirt',
  'Blouse',
  'Tie',
  'Scarf',
  'Jacket',
  'Shorts',
  'T-Shirt',
] as const;

/**
 * Service types available
 */
export const SERVICE_TYPES = [
  { value: 'wash', label: 'Wash', description: 'Standard washing service' },
  {
    value: 'dryclean',
    label: 'Dry Clean',
    description: 'Professional dry cleaning',
  },
  { value: 'iron', label: 'Iron', description: 'Pressing and ironing' },
  { value: 'starch', label: 'Starch', description: 'Starch treatment' },
  {
    value: 'express',
    label: 'Express (50% extra)',
    description: '24-hour turnaround',
  },
] as const;

/**
 * Common garment colors
 */
export const COMMON_COLORS = [
  'White',
  'Black',
  'Blue',
  'Red',
  'Green',
  'Yellow',
  'Gray',
  'Brown',
  'Pink',
  'Purple',
  'Orange',
  'Beige',
  'Navy',
  'Cream',
  'Multi-color',
] as const;

/**
 * Payment methods
 */
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: 'Banknote' },
  { value: 'mpesa', label: 'M-Pesa', icon: 'Smartphone' },
  { value: 'card', label: 'Card', icon: 'CreditCard' },
  { value: 'credit', label: 'Credit Account', icon: 'Wallet' },
] as const;

/**
 * Order statuses with display information
 */
export const ORDER_STATUSES = [
  {
    value: 'received',
    label: 'Received',
    color: 'bg-gray-100 text-gray-800',
  },
  { value: 'queued', label: 'Queued', color: 'bg-blue-100 text-blue-800' },
  { value: 'washing', label: 'Washing', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'drying', label: 'Drying', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ironing', label: 'Ironing', color: 'bg-orange-100 text-orange-800' },
  {
    value: 'quality_check',
    label: 'Quality Check',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'packaging',
    label: 'Packaging',
    color: 'bg-pink-100 text-pink-800',
  },
  { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
  {
    value: 'out_for_delivery',
    label: 'Out for Delivery',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    value: 'delivered',
    label: 'Delivered',
    color: 'bg-green-200 text-green-900',
  },
  {
    value: 'collected',
    label: 'Collected',
    color: 'bg-green-200 text-green-900',
  },
] as const;

/**
 * Maximum file upload size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Accepted image file types
 */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/**
 * Default estimated completion days
 */
export const DEFAULT_COMPLETION_DAYS = 3;

/**
 * Express service completion days
 */
export const EXPRESS_COMPLETION_DAYS = 1;
