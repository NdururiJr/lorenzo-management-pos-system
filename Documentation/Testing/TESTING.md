# Testing Documentation - Lorenzo Dry Cleaners Management System

**Last Updated:** October 11, 2025
**Test Coverage Target:** 80%+ (recommended)
**Status:** Tests implemented for Milestone 2 features

---

## Table of Contents

1. [Test Strategy](#test-strategy)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing New Tests](#writing-new-tests)
6. [Test Coverage](#test-coverage)
7. [Continuous Integration](#continuous-integration)
8. [Known Issues](#known-issues)

---

## Test Strategy

### Testing Pyramid

```
        /\
       /  \  E2E Tests (10%) - Playwright
      /    \
     /------\ Integration Tests (20%) - Jest
    /--------\
   /----------\ Unit Tests (70%) - Jest + RTL
  /____________\
```

### Coverage Goals

- **Unit Tests:** 80%+ coverage for utility functions and business logic
- **Integration Tests:** All API endpoints and database operations
- **E2E Tests:** Critical user workflows
- **Accessibility:** WCAG 2.1 Level AA compliance

---

## Test Types

### 1. Unit Tests (Jest + React Testing Library)

**Location:** `lib/**/__tests__/`, `components/**/__tests__/`

**What we test:**
- Utility functions (formatters, calculations)
- Business logic (pricing, order ID generation)
- React components (isolated)
- Validation schemas

**Example:**
```typescript
// lib/utils/__tests__/formatters.test.ts
describe('formatCurrency', () => {
  it('formats whole numbers correctly', () => {
    expect(formatCurrency(1500)).toContain('1,500');
    expect(formatCurrency(1500)).toContain('KES');
  });
});
```

### 2. Component Tests (React Testing Library)

**Location:** `components/**/__tests__/`

**What we test:**
- Component rendering
- User interactions
- Props validation
- Conditional rendering
- Event handlers

**Example:**
```typescript
// components/ui/__tests__/status-badge.test.tsx
describe('StatusBadge', () => {
  it('renders with received status', () => {
    render(<StatusBadge status="received" />);
    expect(screen.getByText('Received')).toBeInTheDocument();
  });
});
```

### 3. Integration Tests (Jest)

**Location:** `__tests__/integration/`

**What we test:**
- Complete workflows
- Database operations
- API endpoints
- Third-party integrations

### 4. End-to-End Tests (Playwright)

**Location:** `e2e/`

**What we test:**
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Real-time updates

**Example:**
```typescript
// e2e/pos.spec.ts
test('should create order with payment', async ({ page }) => {
  // Full POS workflow
});
```

### 5. Accessibility Tests (axe-playwright)

**Location:** `e2e/accessibility.spec.ts`

**What we test:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus management

---

## Running Tests

### All Tests
```bash
npm test                    # Run all unit tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report
npm run test:e2e            # Run E2E tests
npm run test:e2e:headed     # Run E2E tests with browser UI
npm run test:e2e:debug      # Debug E2E tests
npm run test:all            # Run all tests (unit + E2E)
```

### Specific Tests
```bash
# Run specific test file
npm test -- formatters.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="formatCurrency"

# Run only changed tests
npm test -- --onlyChanged

# Run tests for specific folder
npm test -- lib/db/__tests__
```

### E2E Tests by Browser
```bash
# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run on mobile
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# Run specific test file
npx playwright test e2e/pos.spec.ts
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

---

## Test Structure

### Unit Test Structure

```typescript
describe('Module/Component Name', () => {
  // Setup
  beforeEach(() => {
    // Reset state before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Feature/Function Name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test data';

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### E2E Test Structure

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Login or navigate before each test
  });

  test('should perform user action', async ({ page }) => {
    // Arrange: Navigate to page
    await page.goto('/path');

    // Act: Perform actions
    await page.click('button');

    // Assert: Verify result
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

---

## Writing New Tests

### Guidelines

1. **Test Behavior, Not Implementation**
   - Test what the user sees and does
   - Don't test internal state or implementation details

2. **Clear Test Names**
   - Use descriptive names: `should calculate total price for multiple garments`
   - Follow pattern: `should [expected behavior] when [condition]`

3. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data
   - Act: Execute the code under test
   - Assert: Verify the results

4. **Isolation**
   - Each test should be independent
   - Clean up after tests
   - Don't rely on test execution order

5. **Mocking**
   - Mock external dependencies (database, APIs)
   - Use realistic mock data
   - Don't mock what you're testing

### Unit Test Template

```typescript
// lib/utils/__tests__/new-utility.test.ts
import { functionToTest } from '../new-utility';

describe('FunctionName', () => {
  it('should handle normal case', () => {
    expect(functionToTest('input')).toBe('output');
  });

  it('should handle edge case', () => {
    expect(functionToTest('')).toBe('');
  });

  it('should throw error for invalid input', () => {
    expect(() => functionToTest(null)).toThrow();
  });
});
```

### Component Test Template

```typescript
// components/features/__tests__/new-component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewComponent } from '../new-component';

describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<NewComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await fireEvent.click(button);

    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
// e2e/new-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should complete workflow', async ({ page }) => {
    await page.goto('/feature');

    await page.click('button');

    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

---

## Test Coverage

### Current Coverage (Milestone 2)

| Module | Coverage | Status |
|--------|----------|--------|
| Formatters | 95% | ✅ Complete |
| Pricing Logic | 90% | ✅ Complete |
| Order Operations | 85% | ✅ Complete |
| Status Badge | 100% | ✅ Complete |
| POS Workflow (E2E) | - | ✅ Complete |
| Pipeline (E2E) | - | ✅ Complete |
| Accessibility | - | ✅ Complete |

### Coverage Thresholds

Configured in `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Viewing Coverage

1. **Terminal:**
   ```bash
   npm run test:coverage
   ```

2. **HTML Report:**
   ```bash
   npm run test:coverage
   open coverage/lcov-report/index.html
   ```

3. **Coverage Badge:**
   - View in CI/CD pipeline
   - Add to README if desired

---

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to `main`, `staging`, `develop`

**Note:** Tests are recommended but not mandatory for CI/CD. Build and deploy will proceed even if tests fail (relaxed CI/CD strategy).

### CI Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:coverage
      - run: npm run test:e2e
```

---

## Test Data

### Mock Data

Located in `__tests__/fixtures/` (to be created if needed):
- `customers.json` - Sample customer data
- `orders.json` - Sample order data
- `pricing.json` - Sample pricing data

### Test Users

```typescript
// Test user credentials (for E2E tests)
const testUsers = {
  frontDesk: {
    email: 'frontdesk@lorenzo.test',
    password: 'Test1234!',
  },
  workstation: {
    email: 'workstation@lorenzo.test',
    password: 'Test1234!',
  },
  admin: {
    email: 'admin@lorenzo.test',
    password: 'Test1234!',
  },
};
```

---

## Best Practices

### Do's ✅

- Write tests before fixing bugs (TDD for bug fixes)
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Clean up test data
- Run tests locally before committing

### Don'ts ❌

- Don't test implementation details
- Don't write flaky tests (fix or remove them)
- Don't share state between tests
- Don't test third-party libraries
- Don't skip tests without a reason
- Don't commit commented-out tests

---

## Debugging Tests

### Unit Tests

```bash
# Debug with Chrome DevTools
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test
npm test -- --testNamePattern="specific test name"

# Verbose output
npm test -- --verbose
```

### E2E Tests

```bash
# Debug mode (opens browser with inspector)
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# Trace viewer (for failed tests)
npx playwright show-trace trace.zip
```

### Common Issues

**Issue:** Tests fail intermittently
- **Solution:** Add proper waits, avoid timing assumptions

**Issue:** Cannot find element
- **Solution:** Use proper selectors, check if element exists

**Issue:** Mock not working
- **Solution:** Check mock is set up before test runs

**Issue:** E2E test timeout
- **Solution:** Increase timeout or optimize test

---

## Performance Testing

### Page Load Times

```typescript
test('should load POS page in < 2 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/dashboard/pos');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(2000);
});
```

### API Response Times

```typescript
test('should respond in < 500ms', async () => {
  const startTime = Date.now();
  await fetch('/api/orders');
  const responseTime = Date.now() - startTime;

  expect(responseTime).toBeLessThan(500);
});
```

---

## Known Issues

### Current Limitations

1. **Firebase Mocking**: Some Firebase operations are mocked in tests
   - Real Firebase operations tested in E2E tests only

2. **Real-Time Updates**: Testing real-time features requires multiple pages
   - Complex setup for Firestore listeners

3. **Payment Integration**: Pesapal integration tested with mock data
   - Production payment testing done manually

4. **WhatsApp Integration**: Wati.io integration tested with mock API
   - Real message sending tested manually

### Future Improvements

- [ ] Add visual regression testing
- [ ] Add load/stress testing
- [ ] Add API contract testing
- [ ] Add mutation testing
- [ ] Improve test data factories
- [ ] Add performance benchmarks

---

## Test Checklist for New Features

When adding a new feature:

- [ ] Unit tests for business logic
- [ ] Component tests for UI components
- [ ] Integration tests for API endpoints
- [ ] E2E test for critical user flow
- [ ] Accessibility tests
- [ ] Error handling tests
- [ ] Edge case tests
- [ ] Mobile responsive tests
- [ ] Cross-browser tests (if UI feature)
- [ ] Update test documentation

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev)
- [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright)

### Tutorials
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [E2E Testing Guide](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://www.deque.com/axe/)

---

## Contact

For questions about testing:
- **Team Lead:** Gachengoh Marugu - jerry@ai-agentsplus.com
- **Testing Issues:** Create GitHub issue with `[TEST]` prefix

---

**Remember:** Good tests catch bugs before users do! 🧪
