/**
 * Test Utilities
 *
 * Common utilities and custom render functions for testing
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a new QueryClient for each test
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: Infinity, // Prevent garbage collection during tests
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Custom render function that wraps components with necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor<T>(
  callback: () => T | Promise<T>,
  options: { timeout?: number; interval?: number } = {}
): Promise<T> {
  const timeout = options.timeout ?? 5000;
  const interval = options.interval ?? 50;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await callback();
      if (result) {
        return result;
      }
    } catch (error) {
      // Continue waiting
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Create a mock function that can be awaited
 */
export function createAsyncMock<T = any>(returnValue?: T) {
  return jest.fn().mockResolvedValue(returnValue);
}

/**
 * Create a mock function that rejects
 */
export function createAsyncMockError(error: Error | string) {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  return jest.fn().mockRejectedValue(errorObj);
}

/**
 * Sleep for a specified duration (for testing async flows)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID for testing
 */
export function generateTestId(prefix = 'test'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mock Firebase Timestamp
 */
export function createMockTimestamp(date?: Date): any {
  const d = date || new Date();
  return {
    toDate: () => d,
    toMillis: () => d.getTime(),
    seconds: Math.floor(d.getTime() / 1000),
    nanoseconds: (d.getTime() % 1000) * 1000000,
  };
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    uid: generateTestId('user'),
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: null,
    ...overrides,
  };
}

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
