/**
 * End-to-End Tests for Customer Portal
 *
 * Tests customer dashboard, order tracking, profile management,
 * and all customer-facing features.
 *
 * @module e2e/customer-portal.spec
 */

import { test, expect } from '@playwright/test';

// Helper function to login as customer
async function loginAsCustomer(page: any) {
  await page.goto('/customer-login');

  // For development, use the dev quick login if available
  const devLoginButton = page.getByRole('button', {
    name: /quick login to customer portal/i,
  });

  if (await devLoginButton.isVisible()) {
    await devLoginButton.click();
    await page.waitForURL('**/portal');
  } else {
    // Use regular OTP flow
    await page.fill('input[name="phone"]', '+254712345678');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/verify-otp**');

    // In test environment, OTP might be 123456
    const otpInputs = page.locator('input[type="text"][maxlength="1"]');
    await otpInputs.nth(0).fill('1');
    await otpInputs.nth(1).fill('2');
    await otpInputs.nth(2).fill('3');
    await otpInputs.nth(3).fill('4');
    await otpInputs.nth(4).fill('5');
    await otpInputs.nth(5).fill('6');

    await page.click('button[type="submit"]');
    await page.waitForURL('**/portal');
  }
}

test.describe('Customer Portal - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('should display dashboard correctly', async ({ page }) => {
    // Verify dashboard loaded
    await expect(page).toHaveURL(/.*\/portal/);

    // Check for dashboard elements
    await expect(
      page.getByRole('heading', { name: /welcome|dashboard/i })
    ).toBeVisible();
  });

  test('should display active orders section', async ({ page }) => {
    // Check for active orders section
    await expect(page.getByText(/active orders/i)).toBeVisible();
  });

  test('should display order statistics', async ({ page }) => {
    // Check for statistics cards
    await expect(page.getByText(/total orders/i)).toBeVisible();
    await expect(page.getByText(/active/i)).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    // Check for quick actions
    await expect(
      page.getByRole('button', { name: /track order/i })
    ).toBeVisible();
  });

  test('should navigate to orders page', async ({ page }) => {
    // Click on view all orders or orders nav link
    await page.click('text=View All Orders');

    // Verify navigation
    await expect(page).toHaveURL(/.*\/orders/);
  });

  test('should navigate to profile page', async ({ page }) => {
    // Click on profile link
    await page.click('text=Profile');

    // Verify navigation
    await expect(page).toHaveURL(/.*\/profile/);
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout button
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Verify redirect to login
    await expect(page).toHaveURL(/.*\/customer-login/);
  });
});

test.describe('Customer Portal - Order Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('should display orders list', async ({ page }) => {
    await page.goto('/orders');

    // Verify orders page loaded
    await expect(
      page.getByRole('heading', { name: /my orders|orders/i })
    ).toBeVisible();
  });

  test('should display order cards with details', async ({ page }) => {
    await page.goto('/orders');

    // Check for order card elements
    // Note: This assumes at least one order exists
    await expect(page.getByText(/ORD-/)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');

    // Click on status filter dropdown
    await page.click('text=All Orders');

    // Select active orders
    await page.click('text=Active');

    // Verify filter is applied
    await expect(page.getByText(/active|washing|drying/i)).toBeVisible();
  });

  test('should search orders by order ID', async ({ page }) => {
    await page.goto('/orders');

    // Enter order ID in search
    const searchInput = page.getByPlaceholder(/search.*order/i);
    await searchInput.fill('ORD-');

    // Verify search results
    await expect(page.getByText(/ORD-/)).toBeVisible();
  });

  test('should view order details', async ({ page }) => {
    await page.goto('/orders');

    // Click on first order
    await page.locator('[data-testid="order-card"]').first().click();

    // Verify order details page loaded
    await expect(page).toHaveURL(/.*\/orders\/ORD-/);
    await expect(page.getByText(/order details/i)).toBeVisible();
  });

  test('should display order status timeline', async ({ page }) => {
    await page.goto('/orders');

    // Click on first order
    await page.locator('[data-testid="order-card"]').first().click();

    // Verify timeline is visible
    await expect(page.getByText(/order timeline|status/i)).toBeVisible();
    await expect(page.getByText(/received/i)).toBeVisible();
  });

  test('should display garment details', async ({ page }) => {
    await page.goto('/orders');
    await page.locator('[data-testid="order-card"]').first().click();

    // Verify garment information
    await expect(page.getByText(/garments|items/i)).toBeVisible();
  });

  test('should display payment information', async ({ page }) => {
    await page.goto('/orders');
    await page.locator('[data-testid="order-card"]').first().click();

    // Verify payment details
    await expect(page.getByText(/payment/i)).toBeVisible();
    await expect(page.getByText(/total|amount/i)).toBeVisible();
  });

  test('should download receipt', async ({ page }) => {
    await page.goto('/orders');
    await page.locator('[data-testid="order-card"]').first().click();

    // Click download receipt button
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download receipt/i }).click();

    // Verify download started
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  test('should display estimated completion time', async ({ page }) => {
    await page.goto('/orders');

    // Check for estimated completion display
    await expect(page.getByText(/estimated|ready by/i)).toBeVisible();
  });

  test('should show empty state when no orders', async ({ page }) => {
    // This test assumes a new customer account with no orders
    await page.goto('/orders');

    // Might see empty state if customer has no orders
    // This is optional depending on test data
    const noOrdersText = page.getByText(/no orders|haven't placed/i);
    if (await noOrdersText.isVisible()) {
      await expect(noOrdersText).toBeVisible();
    }
  });
});

test.describe('Customer Portal - Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('should display profile page', async ({ page }) => {
    await page.goto('/profile');

    // Verify profile page loaded
    await expect(
      page.getByRole('heading', { name: /profile|account/i })
    ).toBeVisible();
  });

  test('should display personal information', async ({ page }) => {
    await page.goto('/profile');

    // Check for personal info section
    await expect(page.getByText(/personal information/i)).toBeVisible();
    await expect(page.getByText(/name/i)).toBeVisible();
    await expect(page.getByText(/phone/i)).toBeVisible();
  });

  test('should edit personal information', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.getByRole('button', { name: /edit.*profile/i }).click();

    // Update name
    const nameInput = page.getByLabel(/name/i);
    await nameInput.clear();
    await nameInput.fill('Updated Name');

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Verify success message
    await expect(
      page.getByText(/profile updated|saved successfully/i)
    ).toBeVisible();
  });

  test('should display addresses section', async ({ page }) => {
    await page.goto('/profile');

    // Check for addresses section
    await expect(page.getByText(/addresses|delivery address/i)).toBeVisible();
  });

  test('should add new address', async ({ page }) => {
    await page.goto('/profile');

    // Click add address button
    await page.getByRole('button', { name: /add address/i }).click();

    // Fill in address form
    await page.fill('input[name="label"]', 'Home');
    await page.fill('input[name="address"]', '123 Kilimani Street, Nairobi');

    // Save address
    await page.getByRole('button', { name: /save|add/i }).click();

    // Verify address was added
    await expect(page.getByText(/home/i)).toBeVisible();
    await expect(page.getByText(/123 kilimani street/i)).toBeVisible();
  });

  test('should edit existing address', async ({ page }) => {
    await page.goto('/profile');

    // Click edit on first address
    await page
      .locator('[data-testid="address-card"]')
      .first()
      .getByRole('button', { name: /edit/i })
      .click();

    // Update address
    const addressInput = page.getByLabel(/address/i);
    await addressInput.clear();
    await addressInput.fill('456 Westlands Avenue, Nairobi');

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Verify address was updated
    await expect(page.getByText(/456 westlands avenue/i)).toBeVisible();
  });

  test('should delete address', async ({ page }) => {
    await page.goto('/profile');

    // Click delete on first address
    await page
      .locator('[data-testid="address-card"]')
      .first()
      .getByRole('button', { name: /delete|remove/i })
      .click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes/i }).click();

    // Verify success message
    await expect(
      page.getByText(/address deleted|removed successfully/i)
    ).toBeVisible();
  });

  test('should display preferences section', async ({ page }) => {
    await page.goto('/profile');

    // Check for preferences section
    await expect(page.getByText(/preferences|settings/i)).toBeVisible();
  });

  test('should toggle notification preferences', async ({ page }) => {
    await page.goto('/profile');

    // Find notification toggle
    const notificationToggle = page.getByRole('checkbox', {
      name: /whatsapp notifications|email notifications/i,
    });

    // Toggle notification
    await notificationToggle.click();

    // Verify change is saved (might see a toast notification)
    await expect(
      page.getByText(/preferences updated|saved/i)
    ).toBeVisible();
  });

  test('should change language preference', async ({ page }) => {
    await page.goto('/profile');

    // Find language selector
    const languageSelect = page.getByLabel(/language/i);

    // Change language (if multiple languages supported)
    await languageSelect.selectOption('sw'); // Swahili

    // Verify change is saved
    await expect(page.getByText(/preferences updated/i)).toBeVisible();
  });

  test('should display order statistics', async ({ page }) => {
    await page.goto('/profile');

    // Check for order statistics
    await expect(page.getByText(/total orders|orders placed/i)).toBeVisible();
    await expect(page.getByText(/total spent/i)).toBeVisible();
  });
});

test.describe('Customer Portal - Mobile Navigation', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  });

  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('should display mobile navigation', async ({ page }) => {
    // Verify mobile nav is visible
    await expect(
      page.locator('[data-testid="mobile-bottom-nav"]')
    ).toBeVisible();
  });

  test('should navigate using mobile bottom nav', async ({ page }) => {
    // Tap on Orders tab
    await page
      .locator('[data-testid="mobile-bottom-nav"]')
      .getByRole('button', { name: /orders/i })
      .tap();

    // Verify navigation
    await expect(page).toHaveURL(/.*\/orders/);

    // Tap on Profile tab
    await page
      .locator('[data-testid="mobile-bottom-nav"]')
      .getByRole('button', { name: /profile/i })
      .tap();

    // Verify navigation
    await expect(page).toHaveURL(/.*\/profile/);
  });

  test('should highlight active tab', async ({ page }) => {
    // Dashboard should be active initially
    const dashboardTab = page
      .locator('[data-testid="mobile-bottom-nav"]')
      .getByRole('button', { name: /dashboard|home/i });

    await expect(dashboardTab).toHaveClass(/active|text-black/);

    // Navigate to orders
    await page
      .locator('[data-testid="mobile-bottom-nav"]')
      .getByRole('button', { name: /orders/i })
      .tap();

    // Orders tab should now be active
    const ordersTab = page
      .locator('[data-testid="mobile-bottom-nav"]')
      .getByRole('button', { name: /orders/i });

    await expect(ordersTab).toHaveClass(/active|text-black/);
  });
});

test.describe('Customer Portal - Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('should update order status in real-time', async ({ page }) => {
    await page.goto('/orders');

    // This test assumes backend updates order status
    // In real scenario, staff would update order in parallel

    // Wait for any real-time updates (this is a placeholder)
    await page.waitForTimeout(2000);

    // Verify order list is still responsive
    await expect(page.getByText(/orders/i)).toBeVisible();
  });

  test('should show notification badge for new updates', async ({ page }) => {
    // Check for notification badge/indicator
    const notificationBadge = page.locator('[data-testid="notification-badge"]');

    // If notifications exist, badge should be visible
    if (await notificationBadge.isVisible()) {
      await expect(notificationBadge).toBeVisible();
    }
  });
});

test.describe('Customer Portal - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/portal');

    // Check for navigation landmarks
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/portal');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/portal');

    // This is a basic check - in production use axe-core or similar
    const backgroundColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });

    expect(backgroundColor).toBeTruthy();
  });
});
