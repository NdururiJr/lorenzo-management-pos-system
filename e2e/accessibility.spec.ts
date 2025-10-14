/**
 * Accessibility Tests
 *
 * Tests WCAG 2.1 Level AA compliance for all major pages.
 * Uses axe-playwright for automated accessibility testing.
 *
 * @module e2e/accessibility.spec
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.describe('Authentication Pages', () => {
    test('login page should have no accessibility violations', async ({
      page,
    }) => {
      await page.goto('/login');
      await injectAxe(page);

      try {
        await checkA11y(page, undefined, {
          detailedReport: true,
          detailedReportOptions: {
            html: true,
          },
        });
      } catch (error) {
        // Test will fail with details if violations found
        throw error;
      }
    });

    test('customer login page should have no violations', async ({ page }) => {
      await page.goto('/customer-login');
      await injectAxe(page);
      await checkA11y(page);
    });
  });

  test.describe('Dashboard Pages', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'frontdesk@lorenzo.test');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('dashboard home should have no violations', async ({ page }) => {
      await injectAxe(page);
      await checkA11y(page);
    });

    test('POS page should have no violations', async ({ page }) => {
      await page.goto('/dashboard/pos');
      await injectAxe(page);
      await checkA11y(page);
    });

    test('pipeline board should have no violations', async ({ page }) => {
      await page.goto('/dashboard/pipeline');
      await injectAxe(page);
      await checkA11y(page);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate POS with keyboard only', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.keyboard.press('Tab'); // Focus email
      await page.keyboard.type('frontdesk@lorenzo.test');
      await page.keyboard.press('Tab'); // Focus password
      await page.keyboard.type('Test1234!');
      await page.keyboard.press('Enter'); // Submit

      await page.waitForURL('**/dashboard');

      // Navigate to POS
      await page.goto('/dashboard/pos');

      // Tab through form fields
      await page.keyboard.press('Tab'); // Focus first interactive element

      // Verify focus is visible
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      expect(focusedElement).toBeTruthy();
    });

    test('should navigate pipeline with keyboard', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'workstation@lorenzo.test');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');

      await page.goto('/dashboard/pipeline');

      // Tab to first order card
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            role: el?.getAttribute('role'),
            ariaLabel: el?.getAttribute('aria-label'),
          };
        });

        // Stop if we find an order card
        if (
          focusedElement.role === 'button' ||
          focusedElement.ariaLabel?.includes('Order')
        ) {
          // Press Enter to open
          await page.keyboard.press('Enter');

          // Verify modal opens
          await expect(page.getByRole('dialog')).toBeVisible({
            timeout: 2000,
          });
          break;
        }
      }
    });

    test('should escape to close modals', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'frontdesk@lorenzo.test');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');

      await page.goto('/dashboard/pos');

      // Open create customer modal
      await page.click('button:has-text("New Customer")');

      // Verify modal is open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Verify modal is closed
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('form inputs should have labels', async ({ page }) => {
      await page.goto('/login');

      // Check email input has label
      const emailInput = page.locator('input[name="email"]');
      const emailLabel = await emailInput.getAttribute('aria-label');
      const emailId = await emailInput.getAttribute('id');

      if (emailId) {
        const associatedLabel = page.locator(`label[for="${emailId}"]`);
        const hasLabel = (await associatedLabel.count()) > 0;
        const hasAriaLabel = !!emailLabel;

        expect(hasLabel || hasAriaLabel).toBe(true);
      }
    });

    test('buttons should have accessible names', async ({ page }) => {
      await page.goto('/login');

      // Check submit button has accessible name
      const submitButton = page.locator('button[type="submit"]');
      const buttonText = await submitButton.textContent();
      const ariaLabel = await submitButton.getAttribute('aria-label');

      expect(!!buttonText || !!ariaLabel).toBe(true);
    });

    test('status badges should have semantic meaning', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'workstation@lorenzo.test');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');

      await page.goto('/dashboard/pipeline');

      // Check if status badges have proper ARIA attributes
      const statusBadges = page.locator('[data-testid="status-badge"]');

      if ((await statusBadges.count()) > 0) {
        const firstBadge = statusBadges.first();
        const ariaLabel = await firstBadge.getAttribute('aria-label');
        const role = await firstBadge.getAttribute('role');
        const text = await firstBadge.textContent();

        expect(!!ariaLabel || !!role || !!text).toBe(true);
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should meet WCAG AA contrast ratios', async ({ page }) => {
      await page.goto('/login');
      await injectAxe(page);

      // Check color-contrast rule specifically
      const violations = await getViolations(page, undefined, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(violations).toHaveLength(0);
    });

    test('status badges should have sufficient contrast', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'workstation@lorenzo.test');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');

      await page.goto('/dashboard/pipeline');
      await injectAxe(page);

      const violations = await getViolations(page, undefined, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(violations).toHaveLength(0);
    });
  });

  test.describe('Focus Management', () => {
    test('focus should be visible', async ({ page }) => {
      await page.goto('/login');

      // Tab to first input
      await page.keyboard.press('Tab');

      // Check if focus indicator is visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        const styles = window.getComputedStyle(el!);
        return {
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have outline or box-shadow (focus ring)
      const hasFocusIndicator =
        focusedElement.outlineWidth !== '0px' ||
        focusedElement.outlineStyle !== 'none' ||
        focusedElement.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    });

    test('modal should trap focus', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'frontdesk@lorenzo.test');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');

      await page.goto('/dashboard/pos');

      // Open modal
      await page.click('button:has-text("New Customer")');

      // Tab through modal
      const focusedElements = [];
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');

        const tagName = await page.evaluate(
          () => document.activeElement?.tagName
        );
        focusedElements.push(tagName);
      }

      // After tabbing many times, focus should still be within dialog
      const isInDialog = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const focused = document.activeElement;
        return dialog?.contains(focused) ?? false;
      });

      expect(isInDialog).toBe(true);
    });
  });

  test.describe('Semantic HTML', () => {
    test('should use proper heading hierarchy', async ({ page }) => {
      await page.goto('/login');
      await injectAxe(page);

      const violations = await getViolations(page, undefined, {
        rules: {
          'heading-order': { enabled: true },
        },
      });

      expect(violations).toHaveLength(0);
    });

    test('should have landmark regions', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'frontdesk@lorenzo.test');
      await page.fill('input[name="password"]', 'Test1234!');
      await page.click('button[type="submit"]');

      await page.goto('/dashboard');

      // Check for landmark regions
      const main = await page.locator('main, [role="main"]').count();
      const nav = await page.locator('nav, [role="navigation"]').count();

      expect(main).toBeGreaterThan(0);
      expect(nav).toBeGreaterThan(0);
    });

    test('lists should be properly structured', async ({ page }) => {
      await page.goto('/login');
      await injectAxe(page);

      const violations = await getViolations(page, undefined, {
        rules: {
          'list': { enabled: true },
          'listitem': { enabled: true },
        },
      });

      expect(violations).toHaveLength(0);
    });
  });

  test.describe('Alternative Text', () => {
    test('images should have alt text', async ({ page }) => {
      await page.goto('/login');

      // Check all images
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          const role = await img.getAttribute('role');

          // Should have alt attribute (can be empty for decorative) or role="presentation"
          expect(alt !== null || role === 'presentation').toBe(true);
        }
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test.use({
      viewport: { width: 375, height: 667 },
    });

    test('mobile view should have no violations', async ({ page }) => {
      await page.goto('/login');
      await injectAxe(page);
      await checkA11y(page);
    });

    test('touch targets should be large enough', async ({ page }) => {
      await page.goto('/login');
      await injectAxe(page);

      // Check touch target size (should be at least 44x44px)
      const violations = await getViolations(page, undefined, {
        rules: {
          'target-size': { enabled: true },
        },
      });

      expect(violations).toHaveLength(0);
    });
  });
});
