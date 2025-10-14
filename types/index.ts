/**
 * Central Type Definitions Export
 *
 * This file serves as a central export point for all type definitions
 * used throughout the Lorenzo Dry Cleaners application.
 *
 * @module types
 */

// Re-export all schema types
export * from '../lib/db/schema';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// API Error codes
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}
