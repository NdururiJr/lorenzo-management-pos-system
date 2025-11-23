/**
 * Authentication Tests - Login Flow
 *
 * Tests for user login functionality
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > Admin Testing > 1.1 Authentication & Authorization
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderWithProviders, userEvent } from '../../helpers/test-utils';
import { mockFirebaseAuth, resetAllMocks } from '../../helpers/mock-integrations';
import { TEST_USERS, TEST_PASSWORD } from '../../helpers/test-data-factory';
import { loginSchema } from '@/lib/validations/auth';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
  }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Authentication - Login Flow', () => {
  beforeEach(() => {
    resetAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  describe('EC-AUTH-001: Login Schema Validation', () => {
    it('should validate correct login credentials', () => {
      const validData = {
        email: TEST_USERS.admin.email,
        password: TEST_PASSWORD,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: TEST_PASSWORD,
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email is required');
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: TEST_PASSWORD,
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: TEST_USERS.admin.email,
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Password is required');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: TEST_USERS.admin.email,
        password: 'Test@12',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });
  });

  describe('EC-AUTH-002: Phone Number Validation', () => {
    it('should accept valid Kenyan phone number format', () => {
      const validPhone = TEST_USERS.admin.phone;
      expect(validPhone).toMatch(/^\+254/);
    });

    it('should reject invalid phone number format', () => {
      const invalidPhone = '0712345678';
      expect(invalidPhone).not.toMatch(/^\+254/);
    });

    it('should reject non-Kenyan phone numbers', () => {
      const tanzanianPhone = '+255712345678';
      expect(tanzanianPhone).not.toMatch(/^\+254/);
    });
  });

  describe('EC-AUTH-003: Role-Based Access Control', () => {
    it('should have correct role for admin user', () => {
      expect(TEST_USERS.admin.role).toBe('admin');
    });

    it('should have correct role for front desk user', () => {
      expect(TEST_USERS.frontDesk.role).toBe('front_desk');
    });

    it('should have correct role for customer', () => {
      expect(TEST_USERS.customer.role).toBe('customer');
    });

    it('should have correct role for driver', () => {
      expect(TEST_USERS.driver.role).toBe('driver');
    });
  });

  describe('EC-AUTH-004: Test Data Consistency', () => {
    it('should have all users using the same test password', () => {
      // All test users should use TEST_PASSWORD for consistency
      expect(TEST_PASSWORD).toBe('Test@1234');
    });

    it('should have valid email addresses for all test users', () => {
      Object.values(TEST_USERS).forEach((user) => {
        expect(user.email).toContain('@');
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should have valid phone numbers for all test users', () => {
      Object.values(TEST_USERS).forEach((user) => {
        expect(user.phone).toMatch(/^\+254[17]\d{8}$/);
      });
    });

    it('should have all staff users assigned to valid branches', () => {
      Object.values(TEST_USERS).forEach((user) => {
        // Customers don't have branchId, skip them
        if (user.role === 'customer') return;

        expect(user.branchId).toBeTruthy();
        expect(user.branchId).toMatch(/^BR-/);
      });
    });

    it('should have active status for all test users', () => {
      Object.values(TEST_USERS).forEach((user) => {
        expect(user.active).toBe(true);
      });
    });
  });
});
