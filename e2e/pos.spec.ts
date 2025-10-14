/**
 * End-to-End Tests for POS System
 *
 * Tests complete order creation workflow including customer selection,
 * garment entry, pricing calculation, and payment processing.
 *
 * @module e2e/pos.spec
 */

import { test, expect } from '@playwright/test';

test.describe('POS System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as front desk staff before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'frontdesk@lorenzo.test');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should navigate to POS from dashboard', async ({ page }) => {
    // Navigate to POS
    await page.click('text=POS');

    // Verify POS page loaded
    await expect(page).toHaveURL(/.*\/dashboard\/pos/);
    await expect(
      page.getByRole('heading', { name: /point of sale/i })
    ).toBeVisible();
  });

  test('should search for existing customer', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Search for customer by phone
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');

    // Wait for search results
    await page.waitForTimeout(600); // Debounce delay

    // Verify search results appear
    await expect(page.getByText(/john kamau/i)).toBeVisible();
  });

  test('should select customer from search results', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Search and select customer
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);

    await page.click('text=John Kamau');

    // Verify customer is selected
    await expect(page.getByText(/selected customer/i)).toBeVisible();
    await expect(page.getByText('John Kamau')).toBeVisible();
  });

  test('should open create customer modal', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Click create customer button
    await page.click('button:has-text("New Customer")');

    // Verify modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /create new customer/i })
    ).toBeVisible();
  });

  test('should create new customer', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Open create customer modal
    await page.click('button:has-text("New Customer")');

    // Fill customer details
    await page.fill('input[name="name"]', 'Jane Mwangi');
    await page.fill('input[name="phone"]', '+254723456789');
    await page.fill('input[name="email"]', 'jane@example.com');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Verify customer was created and selected
    await expect(page.getByText('Jane Mwangi')).toBeVisible();
  });

  test('should add garment to order', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Select customer first
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    // Add garment
    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.check('input[value="iron"]');

    // Click add garment button
    await page.click('button:has-text("Add Garment")');

    // Verify garment appears in list
    await expect(page.getByText(/shirt/i)).toBeVisible();
    await expect(page.getByText(/white/i)).toBeVisible();
  });

  test('should calculate price correctly', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Select customer
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    // Add garment with known pricing (Shirt: wash 150 + iron 50 = 200)
    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.check('input[value="iron"]');
    await page.click('button:has-text("Add Garment")');

    // Verify price is displayed
    await expect(page.getByText(/kes\s*200/i)).toBeVisible();
  });

  test('should remove garment from order', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Select customer and add garment
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.click('button:has-text("Add Garment")');

    // Remove garment
    await page.click('button[aria-label="Remove garment"]');

    // Verify garment is removed
    await expect(page.getByText(/no garments added/i)).toBeVisible();
  });

  test('should process cash payment', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Select customer and add garment
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.click('button:has-text("Add Garment")');

    // Proceed to payment
    await page.click('button:has-text("Proceed to Payment")');

    // Select cash payment
    await page.click('button:has-text("Cash")');

    // Enter amount
    await page.fill('input[name="amountReceived"]', '200');

    // Complete payment
    await page.click('button:has-text("Complete Payment")');

    // Verify success message
    await expect(page.getByText(/order created successfully/i)).toBeVisible();
    await expect(page.getByText(/ORD-/)).toBeVisible();
  });

  test('should calculate change correctly for cash payment', async ({
    page,
  }) => {
    await page.goto('/dashboard/pos');

    // Select customer and add garment (KES 200)
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.click('button:has-text("Add Garment")');

    // Proceed to payment
    await page.click('button:has-text("Proceed to Payment")');
    await page.click('button:has-text("Cash")');

    // Pay with KES 500
    await page.fill('input[name="amountReceived"]', '500');

    // Verify change is displayed (KES 300)
    await expect(page.getByText(/change.*300/i)).toBeVisible();
  });

  test('should handle partial payment', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Select customer and add garment (KES 200)
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.click('button:has-text("Add Garment")');

    // Proceed to payment
    await page.click('button:has-text("Proceed to Payment")');
    await page.click('button:has-text("Cash")');

    // Pay partial amount
    await page.fill('input[name="amountReceived"]', '100');
    await page.check('input[name="partialPayment"]');

    // Complete payment
    await page.click('button:has-text("Complete Payment")');

    // Verify order created with partial payment
    await expect(page.getByText(/order created successfully/i)).toBeVisible();
    await expect(page.getByText(/balance due.*100/i)).toBeVisible();
  });

  test('should apply express service surcharge', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Select customer
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    // Add garment with express service
    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.check('input[value="iron"]');
    await page.check('input[value="express"]'); // 50% surcharge

    await page.click('button:has-text("Add Garment")');

    // Verify express surcharge applied (200 + 50% = 300)
    await expect(page.getByText(/kes\s*300/i)).toBeVisible();
  });

  test('should display order summary before payment', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Create order with multiple garments
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    // Add first garment
    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.click('button:has-text("Add Garment")');

    // Add second garment
    await page.selectOption('select[name="garmentType"]', 'Pants');
    await page.fill('input[name="color"]', 'Black');
    await page.check('input[value="wash"]');
    await page.click('button:has-text("Add Garment")');

    // View summary
    await page.click('button:has-text("Proceed to Payment")');

    // Verify summary shows both garments and total
    await expect(page.getByText(/2 garments/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test('should print receipt after order creation', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Create complete order
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.fill('+254712345678');
    await page.waitForTimeout(600);
    await page.click('text=John Kamau');

    await page.selectOption('select[name="garmentType"]', 'Shirt');
    await page.fill('input[name="color"]', 'White');
    await page.check('input[value="wash"]');
    await page.click('button:has-text("Add Garment")');

    await page.click('button:has-text("Proceed to Payment")');
    await page.click('button:has-text("Cash")');
    await page.fill('input[name="amountReceived"]', '200');
    await page.click('button:has-text("Complete Payment")');

    // Verify print button is available
    await expect(
      page.getByRole('button', { name: /print receipt/i })
    ).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Try to add garment without required fields
    await page.click('button:has-text("Add Garment")');

    // Verify validation messages
    await expect(page.getByText(/customer is required/i)).toBeVisible();
  });

  test('should handle invalid phone number', async ({ page }) => {
    await page.goto('/dashboard/pos');

    // Open create customer modal
    await page.click('button:has-text("New Customer")');

    // Enter invalid phone number
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="phone"]', '123456'); // Invalid

    // Try to submit
    await page.click('button[type="submit"]:has-text("Create")');

    // Verify validation error
    await expect(
      page.getByText(/invalid.*phone.*number/i)
    ).toBeVisible();
  });
});

test.describe('POS System - Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  });

  test('should work on mobile devices', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'frontdesk@lorenzo.test');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Navigate to POS
    await page.goto('/dashboard/pos');

    // Verify mobile-friendly layout
    await expect(
      page.getByRole('heading', { name: /point of sale/i })
    ).toBeVisible();

    // Test touch interactions
    const searchInput = page.getByPlaceholder(/search customer/i);
    await searchInput.tap();
    await searchInput.fill('+254712345678');
  });
});
