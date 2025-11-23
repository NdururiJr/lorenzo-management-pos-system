/**
 * Authentication Validation Tests
 *
 * Tests for authentication form validation schemas and helper functions.
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > Admin Testing > 1.1 Authentication & Authorization
 */

import { describe, it, expect } from '@jest/globals';
import {
  loginSchema,
  customerLoginSchema,
  otpSchema,
  registerSchema,
  isValidKenyaPhone,
  isValidEmail,
  checkPasswordStrength,
} from '@/lib/validations/auth';

describe('Authentication Validation', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@lorenzo.test')).toBe(true);
      expect(isValidEmail('admin@lorenzo-dry-cleaners.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Kenya Phone Number Validation', () => {
    it('should accept valid Kenyan phone numbers', () => {
      // Valid formats: +254 followed by 7 or 1, then 8 more digits
      expect(isValidKenyaPhone('+254712345678')).toBe(true);
      expect(isValidKenyaPhone('+254722345678')).toBe(true);
      expect(isValidKenyaPhone('+254733345678')).toBe(true);
      expect(isValidKenyaPhone('+254744345678')).toBe(true);
      expect(isValidKenyaPhone('+254755345678')).toBe(true);
      expect(isValidKenyaPhone('+254112345678')).toBe(true); // Landline
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidKenyaPhone('0712345678')).toBe(false); // Missing +254
      expect(isValidKenyaPhone('254712345678')).toBe(false); // Missing +
      expect(isValidKenyaPhone('+254812345678')).toBe(false); // Invalid prefix
      expect(isValidKenyaPhone('+25471234567')).toBe(false); // Too short
      expect(isValidKenyaPhone('+2547123456789')).toBe(false); // Too long
      expect(isValidKenyaPhone('+255712345678')).toBe(false); // Tanzania
      expect(isValidKenyaPhone('')).toBe(false); // Empty
    });
  });

  describe('Password Strength Checker', () => {
    it('should give maximum score to strong passwords', () => {
      const result = checkPasswordStrength('Test@1234');
      expect(result.score).toBe(5);
      expect(result.feedback).toBe('Strong password');
    });

    it('should identify missing lowercase letters', () => {
      const result = checkPasswordStrength('TEST@1234');
      expect(result.score).toBeLessThan(5);
      expect(result.feedback).toContain('lowercase letter');
    });

    it('should identify missing uppercase letters', () => {
      const result = checkPasswordStrength('test@1234');
      expect(result.score).toBeLessThan(5);
      expect(result.feedback).toContain('uppercase letter');
    });

    it('should identify missing numbers', () => {
      const result = checkPasswordStrength('Test@abcd');
      expect(result.score).toBeLessThan(5);
      expect(result.feedback).toContain('number');
    });

    it('should identify missing special characters', () => {
      const result = checkPasswordStrength('Test1234');
      expect(result.score).toBeLessThan(5);
      expect(result.feedback).toContain('special character');
    });

    it('should identify passwords that are too short', () => {
      const result = checkPasswordStrength('Tst@12');
      expect(result.score).toBeLessThan(5);
      expect(result.feedback).toContain('8 characters');
    });
  });

  describe('Login Schema Validation', () => {
    it('should validate correct login credentials', () => {
      const validData = {
        email: 'admin@lorenzo.test',
        password: 'Test@1234',
        rememberMe: false,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'Test@1234',
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
        password: 'Test@1234',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'admin@lorenzo.test',
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
        email: 'admin@lorenzo.test',
        password: 'Test@12',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });
  });

  describe('Customer Login Schema Validation', () => {
    it('should validate correct customer login credentials', () => {
      const validData = {
        email: 'customer@example.com',
        password: 'Customer@123',
        rememberMe: true,
      };

      const result = customerLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should have same validation rules as staff login', () => {
      const testData = {
        email: 'invalid',
        password: 'short',
      };

      const staffResult = loginSchema.safeParse(testData);
      const customerResult = customerLoginSchema.safeParse(testData);

      expect(staffResult.success).toBe(false);
      expect(customerResult.success).toBe(false);
    });
  });

  describe('OTP Schema Validation', () => {
    it('should accept valid 6-digit OTP', () => {
      const validData = {
        otp: '123456',
        phone: '+254712345678',
      };

      const result = otpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject OTP with less than 6 digits', () => {
      const invalidData = {
        otp: '12345',
      };

      const result = otpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6 digits');
      }
    });

    it('should reject OTP with more than 6 digits', () => {
      const invalidData = {
        otp: '1234567',
      };

      const result = otpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6 digits');
      }
    });

    it('should reject OTP with non-numeric characters', () => {
      const invalidData = {
        otp: '12a456',
      };

      const result = otpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('only numbers');
      }
    });
  });

  describe('Register Schema Validation', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'newstaff@lorenzo.test',
        password: 'StrongPass@123',
        confirmPassword: 'StrongPass@123',
        name: 'New Staff Member',
        phone: '+254712345678',
        role: 'front_desk' as const,
        branchId: 'BR-MAIN-001',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak passwords', () => {
      const invalidData = {
        email: 'newstaff@lorenzo.test',
        password: 'weakpass',
        confirmPassword: 'weakpass',
        name: 'New Staff Member',
        phone: '+254712345678',
        role: 'front_desk' as const,
        branchId: 'BR-MAIN-001',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find((issue) =>
          issue.path.includes('password')
        );
        expect(passwordError).toBeDefined();
      }
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'newstaff@lorenzo.test',
        password: 'StrongPass@123',
        confirmPassword: 'DifferentPass@123',
        name: 'New Staff Member',
        phone: '+254712345678',
        role: 'front_desk' as const,
        branchId: 'BR-MAIN-001',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (issue) => issue.path[0] === 'confirmPassword'
        );
        expect(confirmError?.message).toContain("don't match");
      }
    });

    it('should reject invalid phone numbers', () => {
      const invalidData = {
        email: 'newstaff@lorenzo.test',
        password: 'StrongPass@123',
        confirmPassword: 'StrongPass@123',
        name: 'New Staff Member',
        phone: '0712345678', // Invalid format
        role: 'front_desk' as const,
        branchId: 'BR-MAIN-001',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const phoneError = result.error.issues.find((issue) =>
          issue.path.includes('phone')
        );
        expect(phoneError?.message).toContain('+254');
      }
    });

    it('should reject names that are too short', () => {
      const invalidData = {
        email: 'newstaff@lorenzo.test',
        password: 'StrongPass@123',
        confirmPassword: 'StrongPass@123',
        name: 'A',
        phone: '+254712345678',
        role: 'front_desk' as const,
        branchId: 'BR-MAIN-001',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find((issue) =>
          issue.path.includes('name')
        );
        expect(nameError?.message).toContain('at least 2 characters');
      }
    });

    it('should reject invalid roles', () => {
      const invalidData = {
        email: 'newstaff@lorenzo.test',
        password: 'StrongPass@123',
        confirmPassword: 'StrongPass@123',
        name: 'New Staff Member',
        phone: '+254712345678',
        role: 'invalid_role',
        branchId: 'BR-MAIN-001',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const roleError = result.error.issues.find((issue) =>
          issue.path.includes('role')
        );
        expect(roleError).toBeDefined();
      }
    });
  });
});
