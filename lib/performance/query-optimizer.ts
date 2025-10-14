/**
 * Database Query Optimization Utilities
 *
 * Helpers for optimizing Firestore queries with pagination,
 * caching, and performance tracking
 *
 * @module lib/performance/query-optimizer
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  type Query,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { measureDatabaseQuery } from './monitor';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
}

interface PaginatedResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Execute paginated query with performance tracking
 */
export async function executePaginatedQuery<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const { pageSize = DEFAULT_PAGE_SIZE, lastDoc = null } = options;

  // Ensure page size is within limits
  const safePageSize = Math.min(pageSize, MAX_PAGE_SIZE);

  return measureDatabaseQuery(
    `paginated_${collectionName}`,
    async () => {
      const queryConstraints = [...constraints];

      // Add pagination
      queryConstraints.push(limit(safePageSize + 1)); // Fetch one extra to check if more exist

      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);

      const hasMore = snapshot.docs.length > safePageSize;
      const docs = hasMore ? snapshot.docs.slice(0, -1) : snapshot.docs;

      const data = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        data,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
        hasMore,
      };
    }
  );
}

/**
 * Batch multiple queries for parallel execution
 */
export async function batchQueries<T extends Record<string, unknown>>(
  queries: Record<keyof T, () => Promise<unknown>>
): Promise<T> {
  return measureDatabaseQuery('batch_queries', async () => {
    const entries = Object.entries(queries);
    const results = await Promise.all(
      entries.map(([key, queryFn]) => queryFn())
    );

    return Object.fromEntries(
      entries.map(([key], index) => [key, results[index]])
    ) as T;
  });
}

/**
 * Optimize order queries with proper indexing
 */
export function createOrderQuery(
  branchId: string,
  status?: string,
  customerId?: string,
  options: PaginationOptions = {}
) {
  const constraints: QueryConstraint[] = [];

  // Always filter by branchId first (most selective)
  constraints.push(where('branchId', '==', branchId));

  // Add status filter if provided
  if (status) {
    constraints.push(where('status', '==', status));
  }

  // Add customer filter if provided
  if (customerId) {
    constraints.push(where('customerId', '==', customerId));
  }

  // Always order by createdAt descending (most recent first)
  constraints.push(orderBy('createdAt', 'desc'));

  return executePaginatedQuery<unknown>('orders', constraints, options);
}

/**
 * Optimize customer queries
 */
export function createCustomerQuery(
  searchTerm?: string,
  options: PaginationOptions = {}
) {
  const constraints: QueryConstraint[] = [];

  // Order by creation date (newest first)
  constraints.push(orderBy('createdAt', 'desc'));

  // Note: For phone/name search, we'll need to fetch and filter client-side
  // or use Algolia/Elasticsearch for full-text search in production

  return executePaginatedQuery<unknown>('customers', constraints, options);
}

/**
 * Create debounced search function
 */
export function createDebouncedSearch<T>(
  searchFn: (term: string) => Promise<T>,
  delay: number = 300
): (term: string) => Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;

  return (term: string) => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await searchFn(term);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

/**
 * Cache key generator for queries
 */
export function generateQueryKey(
  collectionName: string,
  filters: Record<string, unknown>
): string[] {
  const sortedFilters = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`);

  return [collectionName, ...sortedFilters];
}
