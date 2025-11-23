# Lorenzo Dry Cleaners - Automated Testing Guide

**Version:** 1.1
**Last Updated:** November 23, 2025
**Status:** Phase 2 In Progress - 94 Tests Implemented and Passing (Authentication & Orders Complete)

---

## Table of Contents

1. [Overview](#overview)
2. [Test Infrastructure](#test-infrastructure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Data](#test-data)
6. [Mocking External Services](#mocking-external-services)
7. [Best Practices](#best-practices)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide explains how to use the automated testing infrastructure for the Lorenzo Dry Cleaners Management System. The test suite is designed to complement the manual testing guide ([END_TO_END_TESTING_GUIDE.md](./END_TO_END_TESTING_GUIDE.md)) and automate critical user flows.

### Testing Stack

- **Unit/Integration Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Mocking:** Jest mocks for external services
- **Test Data:** Factory functions based on manual testing guide

### Coverage Goals

- **Target:** 80%+ code coverage for business logic
- **Priority:** P0 features first (POS, Pipeline, Payments, Deliveries)
- **Approach:** Test user-facing behavior, not implementation details

---

## Test Infrastructure

### File Structure

```
tests/
├── setup.ts                          # Jest setup (runs before all tests)
├── helpers/
│   ├── test-utils.tsx                # Custom render functions and utilities
│   ├── test-data-factory.ts          # Test data generators
│   ├── mock-integrations.ts          # Mocks for external services
│   └── firebase-emulator-setup.ts    # Firebase emulator configuration
├── unit/
│   ├── auth/
│   │   ├── login.test.tsx            # Authentication tests
│   │   └── registration.test.tsx
│   ├── orders/
│   │   ├── order-creation.test.ts    # Order creation tests
│   │   └── payment-processing.test.ts
│   └── pipeline/
│       └── status-transitions.test.ts
├── integration/
│   ├── pos-workflow.test.ts          # POS integration tests
│   └── satellite-transfer.test.ts
└── e2e/
    ├── complete-order-lifecycle.spec.ts
    ├── satellite-workflow.spec.ts
    └── quality-escalation.spec.ts
```

### Configuration Files

- **`jest.config.ts`**: Jest configuration with Next.js support
- **`playwright.config.ts`**: Playwright E2E test configuration
- **`tests/setup.ts`**: Global test setup and mocks

---

## Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test tests/unit/auth/login.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific E2E test file
npx playwright test tests/e2e/complete-order-lifecycle.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

### Run All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

---

## Writing Tests

### Unit Test Template

Use the AAA pattern (Arrange, Act, Assert):

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderWithProviders, userEvent, screen, waitFor } from '../../helpers/test-utils';
import { TEST_USERS, createTestOrder } from '../../helpers/test-data-factory';
import { mockFirebaseAuth } from '../../helpers/mock-integrations';

describe('Feature Name', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should do something when condition is met', async () => {
    // ARRANGE: Set up test data and mocks
    const testOrder = createTestOrder({
      status: 'received',
      totalAmount: 2100,
    });

    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValueOnce({
      user: TEST_USERS.admin,
    });

    // ACT: Render component and interact
    const { getByRole } = renderWithProviders(<YourComponent order={testOrder} />);

    const button = getByRole('button', { name: /submit/i });
    await userEvent.click(button);

    // ASSERT: Verify expected behavior
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });

    // Verify mock calls
    expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to starting page
    await page.goto('/auth/login');
  });

  test('should complete full workflow', async ({ page }) => {
    // Login
    await page.fill('[name="email"]', 'admin@lorenzo.test');
    await page.fill('[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await expect(page).toHaveURL('/dashboard');

    // Verify dashboard loaded
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Continue workflow...
  });
});
```

---

## Test Data

### Using Test Data Factory

The test data factory provides pre-defined test data matching the manual testing guide:

```typescript
import {
  TEST_USERS,
  TEST_BRANCHES,
  TEST_CUSTOMERS,
  createTestOrder,
  createTestCustomer,
  createTestUser,
  TEST_PASSWORD,
} from '../helpers/test-data-factory';

// Use pre-defined test users
const admin = TEST_USERS.admin;
const frontDesk = TEST_USERS.frontDesk;
const customer = TEST_USERS.customer;

// All test users have the same password
const password = TEST_PASSWORD; // "Test@1234"

// Create custom test data
const customOrder = createTestOrder({
  status: 'washing',
  totalAmount: 3500,
  garments: [
    {
      garmentId: 'TEST-G01',
      type: 'Suit',
      color: 'Navy',
      services: ['dry_clean'],
      price: 3500,
      status: 'washing',
    },
  ],
});

const newCustomer = createTestCustomer({
  name: 'Test Customer',
  phone: '+254712345999',
  email: 'test@customer.com',
});
```

### Test Users Reference

All test users from END_TO_END_TESTING_GUIDE.md are available:

| Role | Email | Phone | Variable |
|------|-------|-------|----------|
| Admin | admin@lorenzo.test | +254725462859 | `TEST_USERS.admin` |
| Director | director@lorenzo.test | +254725462860 | `TEST_USERS.director` |
| General Manager | gm@lorenzo.test | +254725462861 | `TEST_USERS.generalManager` |
| Store Manager | sm.main@lorenzo.test | +254725462862 | `TEST_USERS.storeManager` |
| Workstation Manager | wm@lorenzo.test | +254725462863 | `TEST_USERS.workstationManager` |
| Workstation Staff | ws1@lorenzo.test | +254725462864 | `TEST_USERS.workstationStaff` |
| Satellite Staff | sat@lorenzo.test | +254725462866 | `TEST_USERS.satelliteStaff` |
| Front Desk | frontdesk@lorenzo.test | +254725462867 | `TEST_USERS.frontDesk` |
| Driver | driver1@lorenzo.test | +254725462868 | `TEST_USERS.driver` |
| Customer | customer1@test.com | +254712345001 | `TEST_USERS.customer` |

**All users use password:** `Test@1234`

---

## Mocking External Services

### Available Mocks

All external services are mocked for testing:

```typescript
import {
  mockWatiService,
  mockPesapalService,
  mockGoogleMapsService,
  mockEmailService,
  mockFirebaseAuth,
  mockFirestore,
  mockOpenAIService,
  resetAllMocks,
  mockServiceFailures,
} from '../helpers/mock-integrations';

// Mock successful WhatsApp notification
mockWatiService.sendOrderConfirmation.mockResolvedValueOnce({
  success: true,
  notificationId: 'mock-notif-123',
});

// Mock payment processing
mockPesapalService.initiatePayment.mockResolvedValueOnce({
  success: true,
  redirectUrl: 'https://pesapal.test/pay/123',
  trackingId: 'mock-tracking-123',
});

// Mock service failure (for error handling tests)
mockServiceFailures.watiFailure(); // Next call will fail

// Reset all mocks between tests
resetAllMocks();
```

### Testing Error Scenarios

```typescript
it('should handle WhatsApp API failure gracefully', async () => {
  // Arrange: Mock API failure
  mockWatiService.sendWhatsAppMessage.mockRejectedValueOnce(
    new Error('Wati API unavailable')
  );

  // Act: Attempt to send notification
  const result = await sendOrderConfirmation('+254712345001', orderData);

  // Assert: Fallback behavior
  expect(result.success).toBe(false);
  expect(result.error).toMatch(/wati api unavailable/i);

  // Verify fallback to email
  expect(mockEmailService.sendOrderConfirmation).toHaveBeenCalled();
});
```

---

## Best Practices

### 1. Test User Behavior, Not Implementation

❌ **Bad:**
```typescript
expect(component.state.isLoading).toBe(false);
expect(component.props.data).toEqual(expectedData);
```

✅ **Good:**
```typescript
expect(screen.getByText(/order created successfully/i)).toBeInTheDocument();
expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
```

### 2. Use Descriptive Test Names

❌ **Bad:**
```typescript
it('works', () => { ... });
it('test 1', () => { ... });
```

✅ **Good:**
```typescript
it('should display error message when login fails with invalid credentials', () => { ... });
it('should redirect to /pos after front desk user logs in successfully', () => { ... });
```

### 3. Keep Tests Isolated

```typescript
describe('Order Creation', () => {
  beforeEach(() => {
    // Reset mocks before each test
    resetAllMocks();
  });

  it('test 1', () => {
    // This test doesn't affect test 2
  });

  it('test 2', () => {
    // This test doesn't depend on test 1
  });
});
```

### 4. Test Edge Cases

Always test:
- ✅ Success path
- ✅ Validation errors
- ✅ API failures
- ✅ Empty states
- ✅ Loading states
- ✅ Permission denied
- ✅ Network errors

### 5. Use Test IDs Sparingly

Prefer queries in this order:
1. `getByRole` (most preferred)
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (least preferred)

### 6. Async Testing

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

// findBy queries automatically wait
const submitButton = await screen.findByRole('button', { name: /submit/i });
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Fail Due to Missing Mocks

**Error:** `Cannot read property 'mockResolvedValue' of undefined`

**Solution:**
```typescript
// Ensure you're importing and using mocks
import { mockFirebaseAuth } from '../helpers/mock-integrations';

// Mock before using
mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValueOnce({...});
```

#### 2. Timeout Errors

**Error:** `Timeout - Async callback was not invoked within the 5000 ms timeout`

**Solution:**
```typescript
// Increase timeout for slow operations
it('should complete slow operation', async () => {
  // ... test code
}, 10000); // 10 second timeout

// Or use waitFor with custom timeout
await waitFor(() => {
  expect(screen.getByText(/done/i)).toBeInTheDocument();
}, { timeout: 10000 });
```

#### 3. Tests Pass Locally But Fail in CI

**Common causes:**
- Timing issues (use `waitFor` instead of fixed delays)
- Environment variables not set in CI
- Different Node.js versions

**Solution:**
```typescript
// Don't use setTimeout
setTimeout(() => { /* check result */ }, 1000); // ❌

// Use waitFor
await waitFor(() => {
  expect(result).toBeDefined();
}); // ✅
```

#### 4. Firebase Errors in Tests

**Error:** `Firebase: No Firebase App '[DEFAULT]' has been created`

**Solution:**
Ensure `tests/setup.ts` is being loaded (check `jest.config.ts` → `setupFilesAfterEnv`).

---

## Implementation Status

### ✅ Phase 2: Core Tests Implementation (In Progress)

**Current Status:** 94 tests implemented and passing

#### 1. **Authentication Tests** ✅ COMPLETE (44 tests)
   - ✅ Login/logout flows - Email & password validation (27 tests)
   - ✅ Role-based access control - Admin, Front Desk, Customer, Driver (17 tests)
   - ✅ Phone number validation - Kenya +254 format
   - ✅ Password strength validation
   - ✅ Test data consistency checks

**Files:**
- `tests/unit/auth/validation.test.ts` - 27 tests
- `tests/unit/auth/login.test.tsx` - 17 tests

#### 2. **Order Creation & Pricing Tests** ✅ COMPLETE (50 tests)
   - ✅ Order validation schemas (34 tests)
   - ✅ Garment validation (type, color, services)
   - ✅ Customer validation (name, phone, email, addresses)
   - ✅ Payment validation (methods, amounts)
   - ✅ Pricing calculations (16 tests)
   - ✅ Single garment pricing (wash, dry clean, iron, starch)
   - ✅ Express surcharge calculation (50% on total)
   - ✅ Multiple garments total calculation
   - ✅ Standard pricing tests (Shirt, Suit, Dress)

**Files:**
- `tests/unit/orders/validation.test.ts` - 34 tests
- `tests/unit/orders/pricing.test.ts` - 16 tests

### 🔄 Next Phase: Additional Core Tests

3. **Pipeline Tests** (Priority: High) - NOT STARTED
   - Status transitions
   - Batch processing
   - Workstation assignment
   - Quality management

4. **Integration Tests** (Priority: Medium) - NOT STARTED
   - Complete order lifecycle
   - Satellite workflow
   - Delivery flow
   - Payment processing

5. **E2E Tests** (Priority: Medium) - NOT STARTED
   - Full user journeys
   - Multi-step workflows
   - Cross-feature integration

### Adding New Tests

1. Identify the feature and corresponding section in END_TO_END_TESTING_GUIDE.md
2. Create test file in appropriate directory (`unit/`, `integration/`, or `e2e/`)
3. Use test data from `test-data-factory.ts`
4. Mock external services using `mock-integrations.ts`
5. Follow the test template and best practices
6. Run tests locally before committing
7. Ensure tests pass in CI

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Manual Testing Guide](./END_TO_END_TESTING_GUIDE.md)

---

**Document Version:** 1.1
**Last Updated:** November 23, 2025
**Status:** Phase 2 In Progress - 94 Tests Implemented and Passing

---

*Test Infrastructure Created by Claude for Lorenzo Dry Cleaners Management System*
