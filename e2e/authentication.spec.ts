/**
 * End-to-End Tests for Authentication
 *
 * Tests staff login, customer login (OTP), password reset,
 * and authentication flows across the application.
 *
 * @module e2e/authentication.spec
 */

import { test, expect } from '@playwright/test';

test.describe('Staff Authentication', () => {
  test('should display staff login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Verify page elements
    await expect(
      page.getByRole('heading', { name: /staff login/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByText(/forgot password/i)).toBeVisible();
    await expect(page.getByText(/are you a customer/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[name="email"]', 'admin@lorenzo.test');
    await page.fill('input[name="password"]', 'Admin@123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');

    // Verify successful login
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify error message appears
    await expect(
      page.getByText(/failed to sign in|invalid credentials/i)
    ).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');

    // Enter invalid email
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Verify validation error
    await expect(page.getByText(/invalid.*email/i)).toBeVisible();
  });

  test('should require password', async ({ page }) => {
    await page.goto('/login');

    // Enter email only
    await page.fill('input[name="email"]', 'admin@lorenzo.test');
    await page.click('button[type="submit"]');

    // Verify validation error
    await expect(
      page.getByText(/password.*required|at least 8 characters/i)
    ).toBeVisible();
  });

  test('should toggle remember me checkbox', async ({ page }) => {
    await page.goto('/login');

    const rememberMeCheckbox = page.getByRole('checkbox', {
      name: /remember me/i,
    });

    // Verify unchecked by default
    await expect(rememberMeCheckbox).not.toBeChecked();

    // Check the checkbox
    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();

    // Uncheck the checkbox
    await rememberMeCheckbox.uncheck();
    await expect(rememberMeCheckbox).not.toBeChecked();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.click('text=Forgot password?');

    // Verify navigation
    await expect(page).toHaveURL(/.*\/forgot-password/);
    await expect(
      page.getByRole('heading', { name: /reset password|forgot password/i })
    ).toBeVisible();
  });

  test('should navigate to customer login', async ({ page }) => {
    await page.goto('/login');

    // Click customer login link
    await page.click('text=Login with Phone Number');

    // Verify navigation
    await expect(page).toHaveURL(/.*\/customer-login/);
    await expect(
      page.getByRole('heading', { name: /customer login/i })
    ).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@lorenzo.test');
    await page.fill('input[name="password"]', 'Admin@123');

    // Click submit and immediately check for loading state
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // Verify loading state appears (might be brief)
    // This could be flaky in fast environments, so we use a shorter timeout
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
  });

  test('should persist session after page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@lorenzo.test');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.getByRole('checkbox', { name: /remember me/i }).check();
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Refresh page
    await page.reload();

    // Verify still on dashboard (session persisted)
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});

test.describe('Customer Authentication', () => {
  test('should display customer login page correctly', async ({ page }) => {
    await page.goto('/customer-login');

    // Verify page elements
    await expect(
      page.getByRole('heading', { name: /customer login/i })
    ).toBeVisible();
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send otp/i })).toBeVisible();
    await expect(page.getByText(/back to staff login/i)).toBeVisible();
  });

  test('should have default Kenya country code', async ({ page }) => {
    await page.goto('/customer-login');

    const phoneInput = page.getByLabel(/phone number/i);
    await expect(phoneInput).toHaveValue('+254');
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/customer-login');

    // Enter invalid phone number
    await page.fill('input[name="phone"]', '+254123'); // Too short
    await page.click('button[type="submit"]');

    // Verify validation error
    await expect(
      page.getByText(/invalid.*phone|must be.*9 digits/i)
    ).toBeVisible();
  });

  test('should display development mode notice', async ({ page }) => {
    await page.goto('/customer-login');

    // Verify dev mode notice
    await expect(
      page.getByText(/development mode.*otp.*console/i)
    ).toBeVisible();
  });

  test('should navigate to OTP verification page', async ({ page }) => {
    await page.goto('/customer-login');

    // Enter valid phone number
    await page.fill('input[name="phone"]', '+254712345678');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to OTP page
    await page.waitForURL('**/verify-otp**');

    // Verify OTP page loaded
    await expect(page).toHaveURL(/.*\/verify-otp/);
    await expect(
      page.getByText(/verify.*otp|enter.*code/i)
    ).toBeVisible();
  });

  test('should show loading state when sending OTP', async ({ page }) => {
    await page.goto('/customer-login');

    await page.fill('input[name="phone"]', '+254712345678');

    const sendButton = page.getByRole('button', { name: /send otp/i });
    await sendButton.click();

    // Verify loading state
    await expect(sendButton).toContainText(/sending/i);
    await expect(sendButton).toBeDisabled();
  });

  test('should navigate back to staff login', async ({ page }) => {
    await page.goto('/customer-login');

    // Click back link
    await page.click('text=Back to Staff Login');

    // Verify navigation
    await expect(page).toHaveURL(/.*\/login$/);
    await expect(
      page.getByRole('heading', { name: /staff login/i })
    ).toBeVisible();
  });
});

test.describe('OTP Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to OTP page with phone number
    await page.goto('/verify-otp?phone=%2B254712345678');
  });

  test('should display OTP verification page correctly', async ({ page }) => {
    // Verify page elements
    await expect(page.getByText(/verify.*otp|enter.*code/i)).toBeVisible();
    await expect(page.getByText(/254712345678/)).toBeVisible(); // Phone number display
    await expect(
      page.getByRole('button', { name: /verify|submit/i })
    ).toBeVisible();
  });

  test('should have 6 OTP input fields', async ({ page }) => {
    // Count OTP input fields
    const otpInputs = page.locator('input[type="text"][maxlength="1"]');
    await expect(otpInputs).toHaveCount(6);
  });

  test('should auto-focus first input', async ({ page }) => {
    const firstInput = page.locator('input[type="text"][maxlength="1"]').first();
    await expect(firstInput).toBeFocused();
  });

  test('should move to next input on digit entry', async ({ page }) => {
    const inputs = page.locator('input[type="text"][maxlength="1"]');

    // Type first digit
    await inputs.nth(0).fill('1');

    // Second input should be focused
    await expect(inputs.nth(1)).toBeFocused();
  });

  test('should display resend OTP button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /resend otp/i })
    ).toBeVisible();
  });

  test('should show countdown timer for resend', async ({ page }) => {
    // Check for timer display (e.g., "Resend in 60s")
    await expect(page.getByText(/\d+s/)).toBeVisible();
  });

  test('should validate OTP length before submission', async ({ page }) => {
    const inputs = page.locator('input[type="text"][maxlength="1"]');

    // Enter only 3 digits
    await inputs.nth(0).fill('1');
    await inputs.nth(1).fill('2');
    await inputs.nth(2).fill('3');

    // Try to submit
    await page.getByRole('button', { name: /verify|submit/i }).click();

    // Verify validation message or button stays disabled
    const submitButton = page.getByRole('button', { name: /verify|submit/i });
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Password Reset', () => {
  test('should display forgot password page correctly', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verify page elements
    await expect(
      page.getByRole('heading', { name: /reset password|forgot password/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /send reset link/i })
    ).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/forgot-password');

    // Enter invalid email
    await page.fill('input[name="email"]', 'notanemail');
    await page.click('button[type="submit"]');

    // Verify validation error
    await expect(page.getByText(/invalid.*email/i)).toBeVisible();
  });

  test('should show success message after submission', async ({ page }) => {
    await page.goto('/forgot-password');

    // Enter valid email
    await page.fill('input[name="email"]', 'admin@lorenzo.test');
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(
      page.getByText(/reset link sent|check your email/i)
    ).toBeVisible();
  });

  test('should navigate back to login', async ({ page }) => {
    await page.goto('/forgot-password');

    // Click back to login link
    await page.click('text=Back to Login');

    // Verify navigation
    await expect(page).toHaveURL(/.*\/login$/);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from dashboard', async ({
    page,
  }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect unauthenticated users from POS', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect unauthenticated users from customer portal', async ({
    page,
  }) => {
    await page.goto('/portal');

    // Should redirect to customer login
    await expect(page).toHaveURL(/.*\/customer-login/);
  });

  test('should allow access to dashboard after authentication', async ({
    page,
  }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@lorenzo.test');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Now try to access dashboard
    await page.goto('/dashboard');

    // Should stay on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});

test.describe('Authentication - Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  });

  test('should display login page correctly on mobile', async ({ page }) => {
    await page.goto('/login');

    // Verify mobile layout
    await expect(
      page.getByRole('heading', { name: /staff login/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should login successfully on mobile', async ({ page }) => {
    await page.goto('/login');

    // Use tap instead of click for mobile
    await page.getByLabel(/email/i).tap();
    await page.fill('input[name="email"]', 'admin@lorenzo.test');

    await page.getByLabel(/password/i).tap();
    await page.fill('input[name="password"]', 'Admin@123');

    await page.getByRole('button', { name: /sign in/i }).tap();

    // Wait for redirect
    await page.waitForURL('**/dashboard');

    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should display customer login correctly on mobile', async ({
    page,
  }) => {
    await page.goto('/customer-login');

    await expect(
      page.getByRole('heading', { name: /customer login/i })
    ).toBeVisible();
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
  });
});

test.describe('Authentication - Accessibility', () => {
  test('should have proper ARIA labels on login form', async ({ page }) => {
    await page.goto('/login');

    // Check for proper labels
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/remember me/i)).toBeVisible();
  });

  test('should show validation errors with proper aria-invalid', async ({
    page,
  }) => {
    await page.goto('/login');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check for aria-invalid attributes
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');

    // Tab through form
    await page.keyboard.press('Tab'); // Email input
    await expect(page.getByLabel(/email/i)).toBeFocused();

    await page.keyboard.press('Tab'); // Password input
    await expect(page.getByLabel(/password/i)).toBeFocused();

    await page.keyboard.press('Tab'); // Forgot password link
    await page.keyboard.press('Tab'); // Remember me checkbox
    await page.keyboard.press('Tab'); // Submit button
    await expect(
      page.getByRole('button', { name: /sign in/i })
    ).toBeFocused();
  });
});
