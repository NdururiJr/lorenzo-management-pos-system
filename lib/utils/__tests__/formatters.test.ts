/**
 * Unit Tests for Formatter Utilities
 *
 * Tests all formatting functions for currency, phone, dates, etc.
 *
 * @module lib/utils/__tests__/formatters.test
 */

import {
  formatCurrency,
  formatPhone,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  truncateText,
  formatOrderId,
  getInitials,
  formatFileSize,
  pluralize,
} from '../formatters';

describe('Formatter Utilities', () => {
  describe('formatCurrency', () => {
    it('formats whole numbers correctly', () => {
      const result = formatCurrency(1500);
      expect(result).toContain('1,500');
      // Accept both KES and Ksh (Kenya currency symbols)
      expect(result).toMatch(/KES|Ksh/);
    });

    it('formats decimal numbers correctly', () => {
      const result = formatCurrency(1500.5);
      expect(result).toContain('1,500');
    });

    it('handles zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toMatch(/KES|Ksh/);
    });

    it('handles large numbers correctly', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1,000,000');
    });

    it('handles negative numbers correctly', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
    });
  });

  describe('formatPhone', () => {
    it('formats valid Kenya phone number', () => {
      expect(formatPhone('+254712345678')).toBe('+254 712 345 678');
    });

    it('handles already formatted numbers', () => {
      expect(formatPhone('+254 712 345 678')).toBeTruthy();
    });

    it('handles empty string', () => {
      expect(formatPhone('')).toBe('');
    });

    it('returns unformatted for invalid length', () => {
      const invalid = '+25471234';
      expect(formatPhone(invalid)).toBe(invalid);
    });
  });

  describe('formatDate', () => {
    it('formats date object correctly', () => {
      const date = new Date('2025-10-11T10:30:00');
      const formatted = formatDate(date);
      expect(formatted).toContain('Oct');
      expect(formatted).toContain('11');
      expect(formatted).toContain('2025');
    });

    it('formats Firestore timestamp correctly', () => {
      const firestoreTimestamp = {
        toDate: () => new Date('2025-10-11T10:30:00'),
      };
      const formatted = formatDate(firestoreTimestamp);
      expect(formatted).toContain('Oct');
    });

    it('accepts custom format options', () => {
      const date = new Date('2025-10-11T10:30:00');
      const formatted = formatDate(date, { dateStyle: 'full' });
      expect(formatted).toContain('2025');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const date = new Date('2025-10-11T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('Oct');
      expect(formatted).toContain('11');
      expect(formatted).toContain('2025');
      // Accept various time formats (AM/PM or am/pm)
      expect(formatted).toMatch(/\d+:\d+\s*(AM|PM|am|pm)/i);
    });

    it('handles Firestore timestamp', () => {
      const firestoreTimestamp = {
        toDate: () => new Date('2025-10-11T14:30:00'),
      };
      const formatted = formatDateTime(firestoreTimestamp);
      expect(formatted).toContain('Oct');
    });
  });

  describe('formatTime', () => {
    it('formats time in 12-hour format', () => {
      const date = new Date('2025-10-11T14:30:00');
      const formatted = formatTime(date);
      // Accept various time formats (AM/PM or am/pm)
      expect(formatted).toMatch(/\d+:\d+\s*(AM|PM|am|pm)/i);
    });

    it('handles midnight correctly', () => {
      const date = new Date('2025-10-11T00:00:00');
      const formatted = formatTime(date);
      expect(formatted).toContain('12');
    });

    it('handles noon correctly', () => {
      const date = new Date('2025-10-11T12:00:00');
      const formatted = formatTime(date);
      expect(formatted).toContain('12');
      expect(formatted).toMatch(/PM|pm/i);
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for recent past', () => {
      const date = new Date(Date.now() - 30 * 1000); // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('returns "in a moment" for near future', () => {
      const date = new Date(Date.now() + 30 * 1000); // 30 seconds from now
      expect(formatRelativeTime(date)).toBe('in a moment');
    });

    it('formats minutes ago correctly', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(date)).toBe('5 minutes ago');
    });

    it('formats hours ago correctly', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(formatRelativeTime(date)).toBe('3 hours ago');
    });

    it('formats days ago correctly', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('formats future time correctly', () => {
      const date = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      expect(formatRelativeTime(date)).toBe('in 5 minutes');
    });

    it('falls back to formatted date for distant dates', () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const formatted = formatRelativeTime(date);
      // Should return a formatted date (not relative time like "10 days ago")
      expect(formatted).toMatch(/\d{1,2}\s+\w{3}\s+\d{4}/); // e.g., "12 Nov 2025"
    });
  });

  describe('truncateText', () => {
    it('truncates long text correctly', () => {
      const text = 'This is a very long text that needs truncation';
      expect(truncateText(text, 10)).toBe('This is a ...');
    });

    it('returns original text if shorter than maxLength', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe('Short');
    });

    it('returns original text if equal to maxLength', () => {
      const text = 'Exactly10!';
      expect(truncateText(text, 10)).toBe('Exactly10!');
    });
  });

  describe('formatOrderId', () => {
    it('returns order ID as-is', () => {
      const orderId = 'ORD-KIL-20251011-0001';
      expect(formatOrderId(orderId)).toBe(orderId);
    });
  });

  describe('getInitials', () => {
    it('gets initials from two-word name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('gets initials from three-word name', () => {
      expect(getInitials('Mary Jane Watson')).toBe('MW');
    });

    it('handles single-word name', () => {
      expect(getInitials('Madonna')).toBe('MA');
    });

    it('handles names with extra spaces', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });

    it('returns uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('pluralize', () => {
    it('returns singular for count of 1', () => {
      expect(pluralize(1, 'item')).toBe('1 item');
    });

    it('returns plural for count > 1', () => {
      expect(pluralize(5, 'item')).toBe('5 items');
    });

    it('returns plural for count of 0', () => {
      expect(pluralize(0, 'item')).toBe('0 items');
    });

    it('uses custom plural form', () => {
      expect(pluralize(1, 'child', 'children')).toBe('1 child');
      expect(pluralize(3, 'child', 'children')).toBe('3 children');
    });

    it('handles irregular plurals', () => {
      expect(pluralize(1, 'person', 'people')).toBe('1 person');
      expect(pluralize(10, 'person', 'people')).toBe('10 people');
    });
  });
});
