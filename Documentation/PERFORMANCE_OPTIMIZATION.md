# Performance Optimization Guide

## Overview

This document outlines all performance optimizations implemented in the Lorenzo Dry Cleaners Management System.

## Performance Targets

- **Page Load Time:** < 2 seconds (P90)
- **API Response Time:** < 500ms (P95)
- **Database Queries:** < 100ms (simple), < 1s (complex)
- **Concurrent Users:** 100+ per branch
- **Bundle Size:** < 500KB (gzipped)
- **Lighthouse Score:** > 90

## Implemented Optimizations

### 1. Next.js Configuration Optimizations

**File:** \`next.config.ts\`

- Enabled SWC minification
- Configured package import optimization
- Image optimization (AVIF, WebP)
- HTTP compression enabled
- Cache headers for static assets
- Removed console logs in production

### 2. React Query Caching

**File:** \`components/providers/QueryProvider.tsx\`

- Increased staleTime to 5 minutes
- Extended cache time to 10 minutes
- Configured retry logic with exponential backoff
- Enabled request deduplication

### 3. Database Query Optimization

**File:** \`firestore.indexes.json\`

All critical queries have composite indexes:

- Orders by branchId + status + createdAt
- Orders by customerId + createdAt
- Orders by branchId + paymentStatus
- Customers by phone (unique lookup)
- Transactions by customerId/orderId

**File:** \`lib/performance/query-optimizer.ts\`

- Pagination utilities (default 20 items/page)
- Batch query execution
- Debounced search
- Query key generation for caching

### 4. Performance Monitoring

**File:** \`lib/performance/monitor.ts\`

- Page load tracking
- API call duration measurement
- Database query performance tracking
- Custom operation tracing
- Performance tracer class

### 5. React Performance Utilities

**File:** \`lib/performance/react-utils.ts\`

- useDebounce hook
- useThrottle hook
- useDebouncedCallback hook
- useIntersectionObserver for lazy loading
- Memoization comparators

## Usage Examples

### Measuring API Calls

\`\`\`typescript
import { measureApiCall } from '@/lib/performance/monitor';

const result = await measureApiCall('fetchOrders', async () => {
return fetch('/api/orders');
});
\`\`\`

### Paginated Queries

\`\`\`typescript
import { executePaginatedQuery } from '@/lib/performance/query-optimizer';
import { where, orderBy } from 'firebase/firestore';

const result = await executePaginatedQuery('orders', [
where('branchId', '==', branchId),
orderBy('createdAt', 'desc')
], { pageSize: 20 });
\`\`\`

### Debounced Search

\`\`\`typescript
import { useDebounce } from '@/lib/performance/react-utils';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
if (debouncedSearch) {
performSearch(debouncedSearch);
}
}, [debouncedSearch]);
\`\`\`

### Component Memoization

\`\`\`typescript
import { memo } from 'react';
import { createMemoComparator } from '@/lib/performance/react-utils';

export const OrderCard = memo(({ order }) => {
// Component code
}, createMemoComparator(['order.orderId', 'order.status']));
\`\`\`

## Performance Testing

### Lighthouse Audit

\`\`\`bash
npm run build
npx lighthouse http://localhost:3000 --view
\`\`\`

Configuration: \`.lighthouserc.json\`

### Bundle Size Analysis

\`\`\`bash
npm run build
node scripts/analyze-bundle.js
\`\`\`

### Load Testing

Use tools like:

- Apache JMeter
- k6
- Artillery

Target: 100+ concurrent users

## Best Practices

### Database

1. **Always use indexes** for queried fields
2. **Implement pagination** for lists
3. **Limit results** to what's needed
4. **Batch reads** when fetching multiple documents
5. **Cache frequently accessed data** with React Query

### React Components

1. **Memoize expensive calculations** with useMemo
2. **Memoize callbacks** with useCallback
3. **Use React.memo** for pure components
4. **Lazy load** heavy components with dynamic imports
5. **Virtualize** long lists with react-virtual

### API Calls

1. **Debounce search inputs** (300ms delay)
2. **Throttle scroll handlers** (100ms interval)
3. **Use React Query** for automatic caching
4. **Implement retry logic** with exponential backoff
5. **Batch requests** when possible

### Images

1. **Use Next/Image component** for automatic optimization
2. **Specify width/height** to prevent layout shift
3. **Use lazy loading** for below-fold images
4. **Compress images** before upload
5. **Use WebP/AVIF** formats

### Code Splitting

1. **Dynamic imports** for heavy components
2. **Route-based splitting** (automatic in Next.js)
3. **Lazy load modals** and dialogs
4. **Split third-party libraries** when possible

## Monitoring in Production

### Firebase Performance Monitoring

\`\`\`typescript
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance();
const orderTrace = trace(perf, 'order_creation');
orderTrace.start();
// ... operation
orderTrace.stop();
\`\`\`

### Error Tracking

Use Sentry for error monitoring:

- Track API errors
- Monitor bundle size
- Track Web Vitals
- User session replay

## Optimization Checklist

### Before Each Release

- [ ] Run Lighthouse audit (score > 90)
- [ ] Analyze bundle size (< 500KB)
- [ ] Check database indexes deployed
- [ ] Test with slow 3G network
- [ ] Test on mobile devices
- [ ] Verify image optimization
- [ ] Check for memory leaks
- [ ] Review React DevTools Profiler

### Weekly Monitoring

- [ ] Check Firebase Performance dashboard
- [ ] Review slow API calls
- [ ] Monitor error rates
- [ ] Check bundle size trends
- [ ] Review user feedback

## Common Performance Issues

### Slow Database Queries

**Symptoms:** Queries taking > 1 second
**Solutions:**

- Add composite indexes
- Implement pagination
- Reduce result set size
- Cache frequently accessed data

### Large Bundle Size

**Symptoms:** Bundle > 500KB gzipped
**Solutions:**

- Remove unused dependencies
- Implement code splitting
- Lazy load heavy components
- Use dynamic imports

### Slow Page Load

**Symptoms:** Page load > 2 seconds
**Solutions:**

- Optimize images
- Reduce JavaScript bundle
- Enable caching
- Use CDN for static assets

### Memory Leaks

**Symptoms:** Increasing memory usage over time
**Solutions:**

- Clean up event listeners
- Clear timeouts/intervals
- Unsubscribe from Firestore listeners
- Use React DevTools Profiler

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Firebase Performance](https://firebase.google.com/docs/perf-mon)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## Contact

For performance issues, contact the development team:

- Gachengoh Marugu: hello@ai-agentsplus.com
