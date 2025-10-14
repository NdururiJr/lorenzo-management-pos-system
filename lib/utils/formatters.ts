/**
 * Formatting Utilities
 *
 * Functions for formatting various data types (currency, phone, dates, etc.)
 *
 * @module lib/utils/formatters
 */

/**
 * Format amount as Kenyan Shillings
 *
 * @param amount - Amount in KES
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500) // "KES 1,500"
 * formatCurrency(1500.50) // "KES 1,500.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format Kenyan phone number for display
 *
 * @param phone - Phone number in +254 format
 * @returns Formatted phone number
 *
 * @example
 * formatPhone("+254712345678") // "+254 712 345 678"
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Format as +254 7XX XXX XXX
  if (cleaned.startsWith('+254') && cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }

  // Return as-is if format doesn't match
  return phone;
}

/**
 * Format date for display
 *
 * @param date - Date object or Firestore Timestamp
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // "Oct 11, 2025"
 * formatDate(new Date(), { dateStyle: 'full' }) // "Wednesday, October 11, 2025"
 */
export function formatDate(
  date: Date | { toDate: () => Date },
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const dateObj = date instanceof Date ? date : date.toDate();
  return new Intl.DateTimeFormat('en-KE', options).format(dateObj);
}

/**
 * Format date and time for display
 *
 * @param date - Date object or Firestore Timestamp
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime(new Date()) // "Oct 11, 2025, 2:30 PM"
 */
export function formatDateTime(
  date: Date | { toDate: () => Date }
): string {
  const dateObj = date instanceof Date ? date : date.toDate();
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Format time for display
 *
 * @param date - Date object or Firestore Timestamp
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date()) // "2:30 PM"
 */
export function formatTime(date: Date | { toDate: () => Date }): string {
  const dateObj = date instanceof Date ? date : date.toDate();
  return new Intl.DateTimeFormat('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Date object or Firestore Timestamp
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "2 hours ago"
 */
export function formatRelativeTime(
  date: Date | { toDate: () => Date }
): string {
  const dateObj = date instanceof Date ? date : date.toDate();
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
  const isPast = diffMs < 0;

  // Less than a minute
  if (diffSeconds < 60) {
    return isPast ? 'just now' : 'in a moment';
  }

  // Less than an hour
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return isPast
      ? `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      : `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  // Less than a day
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return isPast
      ? `${hours} hour${hours > 1 ? 's' : ''} ago`
      : `in ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  // Less than a week
  if (diffSeconds < 604800) {
    const days = Math.floor(diffSeconds / 86400);
    return isPast
      ? `${days} day${days > 1 ? 's' : ''} ago`
      : `in ${days} day${days > 1 ? 's' : ''}`;
  }

  // Fallback to formatted date
  return formatDate(dateObj);
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 *
 * @example
 * truncateText("This is a long text", 10) // "This is a..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format order ID for display (with line breaks for mobile)
 *
 * @param orderId - Order ID
 * @returns Formatted order ID
 *
 * @example
 * formatOrderId("ORD-KIL-20251011-0001") // "ORD-KIL-20251011-0001"
 */
export function formatOrderId(orderId: string): string {
  return orderId;
}

/**
 * Get initials from name
 *
 * @param name - Full name
 * @returns Initials (max 2 characters)
 *
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Mary Jane Watson") // "MJ"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Pluralize word based on count
 *
 * @param count - Count
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string
 *
 * @example
 * pluralize(1, 'item') // "1 item"
 * pluralize(5, 'item') // "5 items"
 * pluralize(1, 'child', 'children') // "1 child"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const pluralForm = plural || singular + 's';
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
