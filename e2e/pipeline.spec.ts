/**
 * End-to-End Tests for Pipeline Board
 *
 * Tests order pipeline visualization, status updates, and real-time sync.
 *
 * @module e2e/pipeline.spec
 */

import { test, expect } from '@playwright/test';

test.describe('Pipeline Board', () => {
  test.beforeEach(async ({ page }) => {
    // Login as workstation staff
    await page.goto('/login');
    await page.fill('input[name="email"]', 'workstation@lorenzo.test');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/dashboard');

    // Navigate to pipeline
    await page.goto('/dashboard/pipeline');
  });

  test('should display pipeline board', async ({ page }) => {
    // Verify page loaded
    await expect(
      page.getByRole('heading', { name: /order pipeline/i })
    ).toBeVisible();

    // Verify all status columns are present
    await expect(page.getByText('Received')).toBeVisible();
    await expect(page.getByText('Washing')).toBeVisible();
    await expect(page.getByText('Drying')).toBeVisible();
    await expect(page.getByText('Ironing')).toBeVisible();
    await expect(page.getByText('Quality Check')).toBeVisible();
    await expect(page.getByText('Packaging')).toBeVisible();
    await expect(page.getByText('Ready')).toBeVisible();
  });

  test('should display order cards in columns', async ({ page }) => {
    // Check if order cards are visible
    const orderCards = page.locator('[data-testid="order-card"]');
    const count = await orderCards.count();

    if (count > 0) {
      // Verify first card has required information
      const firstCard = orderCards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('should open order details modal', async ({ page }) => {
    // Click on an order card
    const orderCard = page.locator('[data-testid="order-card"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // Verify modal opens
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/order details/i)).toBeVisible();
    }
  });

  test('should update order status', async ({ page }) => {
    // Find an order in 'received' column
    const receivedColumn = page.locator(
      '[data-status-column="received"]'
    );
    const orderCard = receivedColumn
      .locator('[data-testid="order-card"]')
      .first();

    if ((await orderCard.count()) > 0) {
      // Click order to open details
      await orderCard.click();

      // Change status to 'washing'
      await page.selectOption('select[name="status"]', 'washing');
      await page.click('button:has-text("Update Status")');

      // Verify success message
      await expect(
        page.getByText(/status updated successfully/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display order count in column headers', async ({ page }) => {
    // Verify column headers show count
    const receivedHeader = page.locator('[data-status-column="received"]');
    await expect(receivedHeader).toContainText(/\d+/); // Contains a number
  });

  test('should filter orders by search', async ({ page }) => {
    // Enter search term
    const searchInput = page.getByPlaceholder(/search orders/i);

    if ((await searchInput.count()) > 0) {
      await searchInput.fill('ORD-');

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Verify search results
      const orderCards = page.locator('[data-testid="order-card"]');
      const count = await orderCards.count();

      if (count > 0) {
        // Verify all visible cards contain search term
        const allCards = await orderCards.all();
        for (const card of allCards) {
          const text = await card.textContent();
          expect(text).toContain('ORD-');
        }
      }
    }
  });

  test('should display pipeline statistics', async ({ page }) => {
    // Verify stats section is visible
    const statsSection = page.locator('[data-testid="pipeline-stats"]');

    if ((await statsSection.count()) > 0) {
      await expect(statsSection).toBeVisible();

      // Check for key statistics
      await expect(page.getByText(/total orders/i)).toBeVisible();
    }
  });

  test('should show order details in modal', async ({ page }) => {
    const orderCard = page.locator('[data-testid="order-card"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // Verify order details are displayed
      await expect(page.getByText(/order id/i)).toBeVisible();
      await expect(page.getByText(/customer/i)).toBeVisible();
      await expect(page.getByText(/status/i)).toBeVisible();
      await expect(page.getByText(/garments/i)).toBeVisible();
    }
  });

  test('should prevent invalid status transitions', async ({ page }) => {
    const orderCard = page.locator('[data-testid="order-card"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // Try to skip from 'received' to 'ready'
      const statusSelect = page.locator('select[name="status"]');
      const currentStatus = await statusSelect.inputValue();

      if (currentStatus === 'received') {
        // Try to select 'ready' (should be prevented)
        const readyOption = statusSelect.locator('option[value="ready"]');

        if ((await readyOption.count()) > 0) {
          const isDisabled = await readyOption.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    }
  });

  test('should update status history', async ({ page }) => {
    const orderCard = page.locator('[data-testid="order-card"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // Check if status history is visible
      await expect(page.getByText(/status history/i)).toBeVisible();

      // Change status
      await page.selectOption('select[name="status"]', 'washing');
      await page.click('button:has-text("Update Status")');

      await page.waitForTimeout(1000);

      // Verify history updated
      await expect(page.getByText(/washing/i)).toBeVisible();
    }
  });

  test('should show estimated completion time', async ({ page }) => {
    const orderCard = page.locator('[data-testid="order-card"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.click();

      // Verify estimated completion is shown
      await expect(page.getByText(/estimated completion/i)).toBeVisible();
    }
  });

  test('should handle empty columns', async ({ page }) => {
    // Check if any column is empty
    const columns = page.locator('[data-testid="pipeline-column"]');

    const columnCount = await columns.count();
    if (columnCount > 0) {
      for (let i = 0; i < columnCount; i++) {
        const column = columns.nth(i);
        const orderCards = column.locator('[data-testid="order-card"]');

        if ((await orderCards.count()) === 0) {
          // Verify empty state message
          await expect(column.getByText(/no orders/i)).toBeVisible();
        }
      }
    }
  });
});

test.describe('Pipeline Board - Real-Time Updates', () => {
  test('should reflect status changes in real-time', async ({
    page,
    context,
  }) => {
    // Open two pages (simulate two staff members)
    const page1 = page;
    const page2 = await context.newPage();

    // Login on both pages
    for (const p of [page1, page2]) {
      await p.goto('/login');
      await p.fill('input[name="email"]', 'workstation@lorenzo.test');
      await p.fill('input[name="password"]', 'Test1234!');
      await p.click('button[type="submit"]');
      await p.goto('/dashboard/pipeline');
    }

    // Find an order on page1
    const orderCard1 = page1.locator('[data-testid="order-card"]').first();

    if ((await orderCard1.count()) > 0) {
      // Get order ID
      const orderText1 = await orderCard1.textContent();
      const orderIdMatch = orderText1?.match(/ORD-[A-Z]+-\d{8}-\d{4}/);

      if (orderIdMatch) {
        const orderId = orderIdMatch[0];

        // Update status on page1
        await orderCard1.click();
        await page1.selectOption('select[name="status"]', 'washing');
        await page1.click('button:has-text("Update Status")');

        // Wait for real-time update
        await page1.waitForTimeout(2000);

        // Verify update appears on page2
        await page2.reload();
        await expect(page2.getByText(orderId)).toBeVisible();
      }
    }

    await page2.close();
  });
});

test.describe('Pipeline Board - Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  });

  test('should display pipeline on mobile', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'workstation@lorenzo.test');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard/pipeline');

    // Verify mobile-friendly layout
    await expect(
      page.getByRole('heading', { name: /order pipeline/i })
    ).toBeVisible();

    // Verify horizontal scrolling works
    const pipelineContainer = page.locator('[data-testid="pipeline-board"]');
    if ((await pipelineContainer.count()) > 0) {
      await expect(pipelineContainer).toBeVisible();
    }
  });

  test('should allow status updates on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'workstation@lorenzo.test');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard/pipeline');

    // Tap order card
    const orderCard = page.locator('[data-testid="order-card"]').first();

    if ((await orderCard.count()) > 0) {
      await orderCard.tap();

      // Verify modal opens
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});
