# Performance Optimization - Quick Reference

## Quick Commands

\`\`\`bash
# Build & analyze
npm run build
npm run analyze:bundle

# Run Lighthouse
npm run lighthouse

# Complete audit
npm run perf:audit

# Deploy indexes
firebase deploy --only firestore:indexes

# Type check
npm run type-check
\`\`\`

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2s |
| API Response | < 500ms |
| DB Query (Simple) | < 100ms |
| DB Query (Complex) | < 1s |
| Bundle Size | < 500KB |
| Lighthouse | > 90 |
| Concurrent Users | 100+ |

## Import Statements

\`\`\`typescript
// Monitoring
import { measureApiCall, measureDatabaseQuery } from '@/lib/performance/monitor';

// Query Optimization
import { executePaginatedQuery, batchQueries } from '@/lib/performance/query-optimizer';

// React Hooks
import { useDebounce, useThrottle, useDebouncedCallback } from '@/lib/performance/react-utils';
\`\`\`

## Common Patterns

### Measure API Call
\`\`\`typescript
const result = await measureApiCall('operation', async () => {
  return fetch('/api/endpoint');
});
\`\`\`

### Paginated Query
\`\`\`typescript
const { data, lastDoc, hasMore } = await executePaginatedQuery(
  'collection',
  [where('field', '==', value)],
  { pageSize: 20, lastDoc }
);
\`\`\`

### Debounce Input
\`\`\`typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);
\`\`\`

### Memoize Component
\`\`\`typescript
export const MyComponent = memo(({ data }) => {
  return <div>{data.name}</div>;
}, (prev, next) => prev.data.id === next.data.id);
\`\`\`

## Files Reference

### Configuration
- \`next.config.ts\` - Next.js optimizations
- \`firestore.indexes.json\` - Database indexes
- \`.lighthouserc.json\` - Lighthouse config

### Performance Utils
- \`lib/performance/monitor.ts\` - Monitoring
- \`lib/performance/query-optimizer.ts\` - DB queries
- \`lib/performance/react-utils.ts\` - React hooks

### Documentation
- \`PERFORMANCE_OPTIMIZATION.md\` - Full guide
- \`PERFORMANCE_SUMMARY.md\` - Overview
- \`PERFORMANCE_DEPLOYMENT.md\` - Deploy guide
- \`PERFORMANCE_CHANGES.md\` - All changes

### Scripts
- \`scripts/analyze-bundle.js\` - Bundle analysis

### Tests
- \`tests/performance/\` - Performance tests

## Quick Checks

### Check Bundle Size
\`\`\`bash
npm run build
ls -lh .next/static/chunks/*.js
\`\`\`

### Check Indexes
\`\`\`bash
firebase firestore:indexes:list
\`\`\`

### Check Performance
\`\`\`bash
# Open DevTools > Performance
# Record page load
# Check metrics
\`\`\`

## Optimization Checklist

- [ ] Firestore indexes deployed
- [ ] React Query configured (5min cache)
- [ ] Components memoized
- [ ] Images optimized
- [ ] Bundle analyzed
- [ ] Lighthouse score > 90
- [ ] Load tested (100+ users)
- [ ] Monitoring enabled

## Common Issues

### Slow Queries
→ Check indexes: \`firebase firestore:indexes:list\`

### Large Bundle
→ Run: \`npm run analyze:bundle\`

### Slow Page Load
→ Run: \`npm run lighthouse\`

### Memory Leaks
→ Check React DevTools Profiler

## Monitoring

### Firebase Console
- Performance > Web
- Firestore > Usage
- Functions > Logs

### Metrics to Watch
- Page load time
- API response time
- Error rate
- Query duration
- Cache hit rate

## Support

**Questions?** Check:
1. PERFORMANCE_OPTIMIZATION.md
2. PERFORMANCE_SUMMARY.md
3. Email: hello@ai-agentsplus.com

---

**Status: READY FOR DEPLOYMENT** ✅
