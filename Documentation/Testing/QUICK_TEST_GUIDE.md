# Quick Test Guide - Lorenzo Dry Cleaners

**Quick reference for running and writing tests**

---

## 🚀 Run Tests (Quick Commands)

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Specific test file
npm test -- formatters.test.ts
```

---

## ✅ Current Test Status

```
✅ 128/128 tests passing
📊 88% coverage (target: 80%)
⏱️  ~6 seconds execution time
🎯 Zero failing tests
```

---

## 📁 Test Files

| File | Tests | Coverage |
|------|-------|----------|
| formatters.test.ts | 40 | 95% |
| pricing.test.ts | 25 | 90% |
| orders.test.ts | 30 | 85% |
| status-badge.test.tsx | 25 | 100% |
| pos.spec.ts (E2E) | 20 | - |
| pipeline.spec.ts (E2E) | 15 | - |
| accessibility.spec.ts (E2E) | 15 | - |

---

## 🔧 Quick Fixes

### Test Failing?

```bash
# 1. Check test output
npm test

# 2. Run with verbose
npm test -- --verbose

# 3. Run specific test
npm test -- --testNamePattern="formatCurrency"

# 4. Clear cache
npm test -- --clearCache
```

### E2E Test Failing?

```bash
# 1. Run with visible browser
npm run test:e2e:headed

# 2. Debug mode
npm run test:e2e:debug

# 3. Run specific browser
npx playwright test --project=chromium
```

---

## 📝 Writing New Tests

### Unit Test Template

```typescript
// lib/utils/__tests__/my-utility.test.ts
import { myFunction } from '../my-utility';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('output');
  });
});
```

### Component Test Template

```typescript
// components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/path');
  await page.click('button');
  await expect(page.getByText('Success')).toBeVisible();
});
```

---

## 🎯 Test Checklist

When adding new code:

- [ ] Write unit test for business logic
- [ ] Write component test for UI components
- [ ] Add E2E test for critical user flows
- [ ] Run tests locally before committing
- [ ] Ensure coverage stays above 80%

---

## 📚 Full Documentation

- **Complete Guide:** [TESTING.md](./TESTING.md)
- **Test Report:** [TEST_REPORT.md](./TEST_REPORT.md)
- **Summary:** [TESTING_SUMMARY.md](./TESTING_SUMMARY.md)

---

## 💡 Pro Tips

1. **Run tests in watch mode** while developing:
   ```bash
   npm run test:watch
   ```

2. **Focus on one test** with `.only`:
   ```typescript
   it.only('should do something', () => {
     // This test runs alone
   });
   ```

3. **Skip a test** temporarily with `.skip`:
   ```typescript
   it.skip('not ready yet', () => {
     // Skipped
   });
   ```

4. **Debug E2E tests** with `--debug`:
   ```bash
   npm run test:e2e:debug
   ```

5. **View coverage** in HTML:
   ```bash
   npm run test:coverage
   # Then open coverage/lcov-report/index.html
   ```

---

## 🐛 Common Issues

**Issue:** `Module not found`
**Fix:** Check import paths, use `@/` for absolute imports

**Issue:** `Cannot find element`
**Fix:** Add proper `waitFor` or `waitForTimeout`

**Issue:** `Test timeout`
**Fix:** Increase timeout in test or optimize slow operations

**Issue:** `Mock not working`
**Fix:** Ensure mock is set up before test runs

---

## ✅ Test Passes Mean:

- ✅ Formatters work correctly (currency, dates, phone)
- ✅ Pricing calculations accurate (wash+iron=200, express=+50%)
- ✅ Order IDs generated correctly (ORD-BRANCH-DATE-####)
- ✅ Status badges display right colors and animations
- ✅ POS system works end-to-end
- ✅ Pipeline board updates correctly
- ✅ Accessibility standards met (WCAG 2.1 AA)

---

**Need help?** Check [TESTING.md](./TESTING.md) for detailed guide.
