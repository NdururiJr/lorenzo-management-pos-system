/**
 * E2E Test: POS Order Creation
 *
 * Tests the complete order creation flow in the POS system
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > POS Testing > 2.1-2.3
 */

import { test, expect } from '@playwright/test';

test.describe('POS Order Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to POS login page
    await page.goto('/');

    // Login as front desk user
    await page.fill('input[name="email"]', 'frontdesk@lorenzo.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('/pos');
  });

  test('E2E-POS-001: should create new order with existing customer', async ({ page }) => {
    // Navigate to new order page
    await page.click('text=New Order');

    // Search for existing customer
    await page.fill('input[placeholder*="Search customer"]', '+254712345678');
    await page.waitForTimeout(500); // Wait for search debounce

    // Select customer from results
    await page.click('[data-testid="customer-result-0"]');

    // Verify customer details loaded
    await expect(page.locator('[data-testid="customer-name"]')).toContainText('John Doe');

    // Add first garment
    await page.click('button:has-text("Add Garment")');
    await page.selectOption('[data-testid="garment-type-0"]', 'Shirt');
    await page.fill('[data-testid="garment-color-0"]', 'White');
    await page.click('[data-testid="service-wash-0"]');
    await page.click('[data-testid="service-iron-0"]');

    // Verify price calculation
    await expect(page.locator('[data-testid="garment-price-0"]')).toContainText('200');

    // Add second garment
    await page.click('button:has-text("Add Garment")');
    await page.selectOption('[data-testid="garment-type-1"]', 'Pants');
    await page.fill('[data-testid="garment-color-1"]', 'Black');
    await page.click('[data-testid="service-dryclean-1"]');

    // Verify total calculation
    await expect(page.locator('[data-testid="order-total"]')).toContainText('450');

    // Select payment method
    await page.selectOption('[data-testid="payment-method"]', 'cash');
    await page.fill('[data-testid="amount-paid"]', '450');

    // Submit order
    await page.click('button:has-text("Create Order")');

    // Wait for success notification
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Order created successfully');

    // Verify order ID is displayed
    const orderIdElement = page.locator('[data-testid="order-id"]');
    await expect(orderIdElement).toBeVisible();
    const orderId = await orderIdElement.textContent();
    expect(orderId).toMatch(/^ORD-/);

    // Verify receipt can be generated
    await page.click('button:has-text("Print Receipt")');
    await expect(page.locator('[data-testid="receipt-modal"]')).toBeVisible();
  });

  test('E2E-POS-002: should create order with new customer', async ({ page }) => {
    // Navigate to new order page
    await page.click('text=New Order');

    // Click create new customer
    await page.click('button:has-text("New Customer")');

    // Fill customer details
    await page.fill('[data-testid="customer-name"]', 'Jane Smith');
    await page.fill('[data-testid="customer-phone"]', '+254722345678');
    await page.fill('[data-testid="customer-email"]', 'jane@example.com');

    // Save customer
    await page.click('button:has-text("Save Customer")');

    // Wait for customer to be created
    await expect(page.locator('.toast-success')).toContainText('Customer created');

    // Add garment
    await page.click('button:has-text("Add Garment")');
    await page.selectOption('[data-testid="garment-type-0"]', 'Dress');
    await page.fill('[data-testid="garment-color-0"]', 'Red');
    await page.click('[data-testid="service-dryclean-0"]');
    await page.click('[data-testid="service-iron-0"]');

    // Select payment
    await page.selectOption('[data-testid="payment-method"]', 'mpesa');
    await page.fill('[data-testid="amount-paid"]', '350');

    // Create order
    await page.click('button:has-text("Create Order")');

    // Verify success
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('E2E-POS-003: should handle partial payment', async ({ page }) => {
    // Create order with partial payment
    await page.click('text=New Order');

    // Quick customer search
    await page.fill('input[placeholder*="Search customer"]', '+254712345678');
    await page.click('[data-testid="customer-result-0"]');

    // Add garment
    await page.click('button:has-text("Add Garment")');
    await page.selectOption('[data-testid="garment-type-0"]', 'Suit');
    await page.fill('[data-testid="garment-color-0"]', 'Navy');
    await page.click('[data-testid="service-dryclean-0"]');
    await page.click('[data-testid="service-iron-0"]');

    // Total should be around 600
    await expect(page.locator('[data-testid="order-total"]')).toContainText('600');

    // Pay only partial amount
    await page.selectOption('[data-testid="payment-method"]', 'cash');
    await page.fill('[data-testid="amount-paid"]', '300');

    // Create order
    await page.click('button:has-text("Create Order")');

    // Verify partial payment warning
    await expect(page.locator('[data-testid="payment-status"]')).toContainText('Partial');
    await expect(page.locator('[data-testid="balance-due"]')).toContainText('300');

    // Confirm creation
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('E2E-POS-004: should validate required fields', async ({ page }) => {
    // Try to create order without customer
    await page.click('text=New Order');
    await page.click('button:has-text("Add Garment")');
    await page.selectOption('[data-testid="garment-type-0"]', 'Shirt');

    // Try to submit without customer
    await page.click('button:has-text("Create Order")');

    // Verify validation error
    await expect(page.locator('.error-message')).toContainText('Customer is required');

    // Add customer
    await page.fill('input[placeholder*="Search customer"]', '+254712345678');
    await page.click('[data-testid="customer-result-0"]');

    // Try to submit without garment color
    await page.click('button:has-text("Create Order")');
    await expect(page.locator('.error-message')).toContainText('Color is required');

    // Fill color
    await page.fill('[data-testid="garment-color-0"]', 'Blue');

    // Try to submit without services
    await page.click('button:has-text("Create Order")');
    await expect(page.locator('.error-message')).toContainText('Select at least one service');
  });

  test('E2E-POS-005: should calculate express surcharge correctly', async ({ page }) => {
    await page.click('text=New Order');

    // Select customer
    await page.fill('input[placeholder*="Search customer"]', '+254712345678');
    await page.click('[data-testid="customer-result-0"]');

    // Add garment with express service
    await page.click('button:has-text("Add Garment")');
    await page.selectOption('[data-testid="garment-type-0"]', 'Shirt');
    await page.fill('[data-testid="garment-color-0"]', 'White');
    await page.click('[data-testid="service-wash-0"]'); // 150 KES
    await page.click('[data-testid="service-iron-0"]'); // 50 KES

    // Check price without express
    await expect(page.locator('[data-testid="garment-price-0"]')).toContainText('200');

    // Add express service (50% surcharge)
    await page.click('[data-testid="service-express-0"]');

    // Check price with express: 200 + (200 * 0.5) = 300
    await expect(page.locator('[data-testid="garment-price-0"]')).toContainText('300');

    // Verify total
    await expect(page.locator('[data-testid="order-total"]')).toContainText('300');
  });
});

test.describe('POS Receipt Generation', () => {
  test('E2E-RCP-001: should generate and display receipt PDF', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('input[name="email"]', 'frontdesk@lorenzo.com');
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/pos');

    // Navigate to recent orders
    await page.click('text=Orders');

    // Click on first order
    await page.click('[data-testid="order-row-0"]');

    // Generate receipt
    await page.click('button:has-text("View Receipt")');

    // Verify receipt modal is visible
    await expect(page.locator('[data-testid="receipt-modal"]')).toBeVisible();

    // Verify receipt contains key information
    await expect(page.locator('[data-testid="receipt-order-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-customer-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-total"]')).toBeVisible();

    // Test print functionality
    await page.click('button:has-text("Print")');

    // Test download functionality
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/receipt-.*\.pdf/);
  });
});
