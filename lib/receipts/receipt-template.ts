/**
 * Receipt Template Configuration
 *
 * Template helpers and configuration for PDF receipt generation.
 *
 * @module lib/receipts/receipt-template
 */

import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

/**
 * Receipt configuration constants
 */
export const RECEIPT_CONFIG = {
  // Page dimensions (A4 in mm)
  pageWidth: 210,
  pageHeight: 297,

  // Margins
  margins: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  },

  // Font sizes
  fonts: {
    header: 20,
    subheader: 14,
    body: 10,
    small: 8,
    footer: 8,
  },

  // Colors (RGB arrays for jsPDF)
  colors: {
    primary: [0, 0, 0], // Black
    secondary: [102, 102, 102], // Dark gray
    accent: [51, 51, 51], // Charcoal
    light: [200, 200, 200], // Light gray
  },

  // Company details
  company: {
    name: 'Lorenzo Dry Cleaners',
    address: 'Kilimani, Nairobi, Kenya',
    phone: '+254 XXX XXX XXX',
    email: 'info@lorenzo-dry-cleaners.com',
    website: 'www.lorenzo-dry-cleaners.com',
  },
};

/**
 * Format Firestore timestamp to readable date string
 */
export function formatDate(timestamp: Timestamp | Date | any): string {
  if (!timestamp) return 'N/A';

  try {
    // Handle Firestore Timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), 'MMM d, yyyy h:mm a');
    }
    // Handle regular Date
    if (timestamp instanceof Date) {
      return format(timestamp, 'MMM d, yyyy h:mm a');
    }
    // Handle timestamp object with seconds
    if (timestamp.seconds) {
      return format(new Date(timestamp.seconds * 1000), 'MMM d, yyyy h:mm a');
    }
    return 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Format date for display without time
 */
export function formatDateOnly(timestamp: Timestamp | Date | any): string {
  if (!timestamp) return 'N/A';

  try {
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), 'MMM d, yyyy');
    }
    if (timestamp instanceof Date) {
      return format(timestamp, 'MMM d, yyyy');
    }
    if (timestamp.seconds) {
      return format(new Date(timestamp.seconds * 1000), 'MMM d, yyyy');
    }
    return 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Format price in KES with proper formatting
 */
export function formatPrice(amount: number | undefined): string {
  if (amount === undefined || amount === null) return 'KES 0.00';

  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format phone number to Kenyan format
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return 'N/A';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format to +254 XXX XXX XXX
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  // Format 07XX or 01XX to +254 7XX or +254 1XX
  if (cleaned.length === 10 && (cleaned.startsWith('07') || cleaned.startsWith('01'))) {
    return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  // Format 7XX or 1XX to +254 7XX or +254 1XX
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    return `+254 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // Return as-is if format not recognized
  return phone;
}

/**
 * Get status display text
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    received: 'Received',
    processing: 'Processing',
    ready: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return statusMap[status] || status;
}

/**
 * Get payment method display text
 */
export function getPaymentMethodText(method: string): string {
  const methodMap: Record<string, string> = {
    cash: 'Cash',
    mpesa: 'M-Pesa',
    card: 'Credit/Debit Card',
    pesapal: 'Pesapal',
  };

  return methodMap[method] || method;
}

/**
 * Calculate totals from order
 */
export function calculateOrderTotals(order: any) {
  const subtotal = order.totalAmount || 0;
  const tax = order.tax || 0;
  const discount = order.discount || 0;
  const total = subtotal + tax - discount;
  const paid = order.amountPaid || 0;
  const balance = Math.max(0, total - paid);

  return {
    subtotal,
    tax,
    discount,
    total,
    paid,
    balance,
  };
}
