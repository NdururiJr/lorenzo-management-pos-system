/**
 * E2E Test: Customer Portal
 *
 * Tests customer portal order tracking and profile management
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > Customer Portal Testing
 */

import { test, expect } from '@playwright/test';

test.describe('Customer Portal - Order Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to customer portal
    await page.goto('/portal');
  });

  test('E2E-CUST-001: should login with phone OTP', async ({ page }) => {
    // Enter phone number
    await page.fill('[data-testid="phone-input"]', '+254712345678');
    await page.click('button:has-text("Send OTP")');

    // Verify OTP sent message
    await expect(page.locator('.toast-success')).toContainText('OTP sent');

    // Enter OTP (in real scenario, this would be from SMS)
    await page.fill('[data-testid="otp-input-0"]', '1');
    await page.fill('[data-testid="otp-input-1"]', '2');
    await page.fill('[data-testid="otp-input-2"]', '3');
    await page.fill('[data-testid="otp-input-3"]', '4');
    await page.fill('[data-testid="otp-input-4"]', '5');
    await page.fill('[data-testid="otp-input-5"]', '6');

    // Submit OTP
    await page.click('button:has-text("Verify")');

    // Wait for redirect to dashboard
    await page.waitForURL('/portal/orders');

    // Verify customer name is displayed
    await expect(page.locator('[data-testid="customer-name"]')).toBeVisible();
  });

  test('E2E-CUST-002: should display customer orders', async ({ page }) => {
    // Login (simplified - assumes logged in)
    await page.goto('/portal/orders');

    // Verify orders list is visible
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();

    // Verify at least one order is displayed
    const orderCards = page.locator('[data-testid^="order-card-"]');
    await expect(orderCards.first()).toBeVisible();

    // Verify order card contains key information
    await expect(orderCards.first()).toContainText(/ORD-/);
    await expect(orderCards.first()).toContainText(/KES/);
  });

  test('E2E-CUST-003: should view order details and status', async ({ page }) => {
    await page.goto('/portal/orders');

    // Click on first order
    await page.click('[data-testid="order-card-0"]');

    // Wait for order details page
    await page.waitForURL(/\/portal\/orders\/ORD-/);

    // Verify order details are displayed
    await expect(page.locator('[data-testid="order-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();

    // Verify garment list
    await expect(page.locator('[data-testid="garments-list"]')).toBeVisible();

    // Verify status timeline
    await expect(page.locator('[data-testid="status-timeline"]')).toBeVisible();

    // Check if status is highlighted
    const currentStatus = page.locator('[data-testid="status-current"]');
    await expect(currentStatus).toBeVisible();
    await expect(currentStatus).toHaveClass(/highlighted|active/);
  });

  test('E2E-CUST-004: should filter orders by status', async ({ page }) => {
    await page.goto('/portal/orders');

    // Wait for orders to load
    await page.waitForSelector('[data-testid="orders-list"]');

    // Click on "In Progress" filter
    await page.click('[data-testid="filter-in-progress"]');

    // Verify filtered orders
    const orderCards = page.locator('[data-testid^="order-card-"]');
    const count = await orderCards.count();

    for (let i = 0; i < count; i++) {
      const statusBadge = orderCards.nth(i).locator('[data-testid="order-status-badge"]');
      const statusText = await statusBadge.textContent();
      expect(['Washing', 'Drying', 'Ironing', 'Quality Check', 'Packaging']).toContain(statusText);
    }

    // Click on "Ready" filter
    await page.click('[data-testid="filter-ready"]');

    // Verify ready orders
    const readyOrders = page.locator('[data-testid^="order-card-"]');
    if ((await readyOrders.count()) > 0) {
      const statusBadge = readyOrders.first().locator('[data-testid="order-status-badge"]');
      await expect(statusBadge).toContainText('Ready');
    }
  });

  test('E2E-CUST-005: should track order in real-time', async ({ page }) => {
    await page.goto('/portal/orders');

    // Click on an order
    await page.click('[data-testid="order-card-0"]');

    // Get current status
    const initialStatus = await page.locator('[data-testid="order-status"]').textContent();

    // Enable live updates
    await expect(page.locator('[data-testid="live-updates-indicator"]')).toBeVisible();

    // In a real scenario, the status would update automatically
    // Here we're just verifying the UI elements exist
    await expect(page.locator('[data-testid="estimated-completion"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-in-current-stage"]')).toBeVisible();
  });
});

test.describe('Customer Portal - Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Assume logged in
    await page.goto('/portal/profile');
  });

  test('E2E-PROF-001: should display customer profile', async ({ page }) => {
    // Verify profile fields are displayed
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-phone"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();

    // Verify addresses section
    await expect(page.locator('[data-testid="addresses-section"]')).toBeVisible();

    // Verify preferences section
    await expect(page.locator('[data-testid="preferences-section"]')).toBeVisible();
  });

  test('E2E-PROF-002: should update profile information', async ({ page }) => {
    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Update name
    await page.fill('[data-testid="edit-name"]', 'John Updated Doe');

    // Update email
    await page.fill('[data-testid="edit-email"]', 'john.updated@example.com');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator('.toast-success')).toContainText('Profile updated');

    // Verify updated information is displayed
    await expect(page.locator('[data-testid="profile-name"]')).toContainText('John Updated Doe');
    await expect(page.locator('[data-testid="profile-email"]')).toContainText('john.updated@example.com');
  });

  test('E2E-PROF-003: should add new delivery address', async ({ page }) => {
    // Click add address button
    await page.click('button:has-text("Add Address")');

    // Fill address form
    await page.fill('[data-testid="address-label"]', 'Office');
    await page.fill('[data-testid="address-street"]', 'Kimathi Street, Nairobi');

    // Use map to select location (simplified)
    await page.click('[data-testid="map-container"]');

    // Save address
    await page.click('button:has-text("Save Address")');

    // Verify success
    await expect(page.locator('.toast-success')).toContainText('Address added');

    // Verify address appears in list
    await expect(page.locator('[data-testid="address-Office"]')).toBeVisible();
    await expect(page.locator('[data-testid="address-Office"]')).toContainText('Kimathi Street');
  });

  test('E2E-PROF-004: should update notification preferences', async ({ page }) => {
    // Toggle WhatsApp notifications
    const whatsappToggle = page.locator('[data-testid="pref-whatsapp-notifications"]');
    const initialState = await whatsappToggle.isChecked();

    await whatsappToggle.click();

    // Toggle email notifications
    const emailToggle = page.locator('[data-testid="pref-email-notifications"]');
    await emailToggle.click();

    // Save preferences
    await page.click('button:has-text("Save Preferences")');

    // Verify success
    await expect(page.locator('.toast-success')).toContainText('Preferences updated');

    // Reload page
    await page.reload();

    // Verify preferences persisted
    await expect(whatsappToggle).toHaveAttribute('checked', initialState ? '' : 'checked');
  });
});

test.describe('Customer Portal - Payment Stub', () => {
  test('E2E-PAY-001: should display payment stub for unpaid balance', async ({ page }) => {
    await page.goto('/portal/orders');

    // Click on order with unpaid balance
    // (This assumes there's an order with partial payment)
    await page.click('[data-testid="order-card-0"]');

    // Check if payment stub is visible
    const paymentStub = page.locator('[data-testid="payment-stub"]');

    // If order has balance, payment stub should be visible
    const hasBalance = await page.locator('[data-testid="balance-due"]').isVisible();

    if (hasBalance) {
      await expect(paymentStub).toBeVisible();
      await expect(paymentStub).toContainText('Pay Balance');

      // Verify payment methods are available
      await expect(paymentStub).toContainText('M-Pesa');
      await expect(paymentStub).toContainText('Card');
    }
  });

  test('E2E-PAY-002: should initiate M-Pesa payment', async ({ page }) => {
    await page.goto('/portal/orders');

    // Navigate to order with balance
    await page.click('[data-testid="order-card-0"]');

    // Check if payment is needed
    const hasBalance = await page.locator('[data-testid="balance-due"]').isVisible();

    if (hasBalance) {
      // Click pay button
      await page.click('button:has-text("Pay Balance")');

      // Select M-Pesa
      await page.click('[data-testid="payment-method-mpesa"]');

      // Confirm phone number
      await expect(page.locator('[data-testid="mpesa-phone"]')).toBeVisible();

      // Initiate payment
      await page.click('button:has-text("Pay Now")');

      // Verify STK push message
      await expect(page.locator('.toast-info')).toContainText('Check your phone');

      // Verify pending payment indicator
      await expect(page.locator('[data-testid="payment-pending"]')).toBeVisible();
    }
  });
});

test.describe('Customer Portal - Mobile Responsiveness', () => {
  test('E2E-MOB-001: should be responsive on mobile devices', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/portal/orders');

    // Verify mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Verify desktop navigation is hidden
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeHidden();

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');

    // Verify menu items
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('a:has-text("Orders")')).toBeVisible();
    await expect(page.locator('a:has-text("Profile")')).toBeVisible();

    // Verify orders are displayed in mobile view
    await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
  });
});
