# ESLint Status Report - Lorenzo Dry Cleaners POS System

## Current Status

**ESLint Warnings:** 0
**ESLint Errors:** 0
**Build Status:** Passing
**Last Audit:** February 7, 2026

All ESLint warnings and errors have been resolved as of the February 7, 2026 cleanup.

---

## What Was Fixed

A comprehensive audit on February 7, 2026 identified **~150 ESLint issues** (0 errors, ~150 warnings) across the codebase. All were resolved:

| Category | Count | Fix Applied |
|----------|-------|-------------|
| Unused imports/variables | ~115 | Removed unused imports and dead code |
| Explicit `any` types | 16 | Replaced with proper TypeScript types and interfaces |
| Missing useEffect dependencies | 14 | Wrapped functions with `useCallback` and added to dependency arrays |
| `<img>` element warnings | 8 | Added eslint-disable comments (dynamic Firebase Storage URLs) |

### Key Changes

**useEffect Dependencies:** 13 dashboard pages had async fetch functions called inside `useEffect` but missing from dependency arrays. These were wrapped with `useCallback` to prevent stale closures. One component (`InternationalPhoneInput`) uses an intentional eslint-disable to prevent re-triggering validation on every keystroke.

**TypeScript `any` Types:** Replaced with proper interfaces in loyalty API routes and delivery fee rules. External API responses now use defined interfaces with index signatures.

**Unused Imports:** Removed ~115 unused imports across 50+ files, primarily unused lucide-react icons and Firebase/Firestore utilities.

---

## ESLint Configuration

**File:** `eslint.config.mjs`

| Rule | Setting | Rationale |
|------|---------|-----------|
| `@typescript-eslint/no-unused-vars` | warn | Catch stale imports without breaking builds |
| `@typescript-eslint/no-explicit-any` | warn | Flag type safety issues during development |
| `react-hooks/exhaustive-deps` | warn | Catch potential stale closure bugs |
| `react/no-unescaped-entities` | off | Common in content-heavy components |
| `@next/next/no-img-element` | warn | Prefer Next.js Image for optimization |
| `no-console` | off | Removed in production by `next.config.ts` compiler |

---

## Best Practices

### When to Use `any`

**Acceptable:**
- External API responses without TypeScript definitions (Pesapal, Wati, Resend)
- Test mocking and fixtures
- Firebase Timestamp/DocumentSnapshot conversions

**Not acceptable:**
- Internal function parameters
- Component props
- React state variables
- Business logic functions

### Unused Variables Convention

Use underscore prefix for intentionally unused:
```typescript
orders.map((order, _index) => <OrderCard order={order} />);
const { password: _password, ...publicUser } = user;
```

### useEffect Dependencies

Always include functions called inside useEffect:
```typescript
// Preferred: useCallback wrapper
const fetchData = useCallback(async () => { /* ... */ }, [dep1, dep2]);
useEffect(() => { fetchData(); }, [fetchData]);

// Alternative: inline (for simple cases)
useEffect(() => {
  const fetchData = async () => { /* ... */ };
  fetchData();
}, [dep1, dep2]);
```

---

## References

- ESLint Config: `eslint.config.mjs`
- TypeScript Config: `tsconfig.json` (strict mode enabled)
- Next.js Config: `next.config.ts` (`ignoreDuringBuilds: false`)
