/**
 * Performance Monitoring Utilities
 *
 * Track page load times, API calls, and custom operations
 *
 * @module lib/performance/monitor
 */

type MetricType = 'page_load' | 'api_call' | 'database_query' | 'custom';

interface PerformanceMetric {
  name: string;
  type: MetricType;
  duration: number;
  timestamp: number;
}

/**
 * Log performance metrics
 * In production, this would send to analytics service
 */
function logPerformance(metric: PerformanceMetric) {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Performance] ${metric.type}: ${metric.name} - ${metric.duration}ms`
    );
  }

  // TODO: Send to analytics service (Firebase Performance, Sentry, etc.)
  // Example: sendToAnalytics(metric);
}

/**
 * Measure page load time
 */
export function measurePageLoad() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

    logPerformance({
      name: 'page_load',
      type: 'page_load',
      duration: pageLoadTime,
      timestamp: Date.now(),
    });
  });
}

/**
 * Measure API call duration
 */
export async function measureApiCall<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    logPerformance({
      name,
      type: 'api_call',
      duration,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    logPerformance({
      name: `${name}_error`,
      type: 'api_call',
      duration,
      timestamp: Date.now(),
    });

    throw error;
  }
}

/**
 * Measure database query duration
 */
export async function measureDatabaseQuery<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    logPerformance({
      name,
      type: 'database_query',
      duration,
      timestamp: Date.now(),
    });

    // Warn if query is slow
    if (duration > 1000) {
      console.warn(
        `[Performance Warning] Slow query detected: ${name} took ${duration}ms`
      );
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    logPerformance({
      name: `${name}_error`,
      type: 'database_query',
      duration,
      timestamp: Date.now(),
    });

    throw error;
  }
}

/**
 * Measure custom operation duration
 */
export async function measureOperation<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    logPerformance({
      name,
      type: 'custom',
      duration,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    logPerformance({
      name: `${name}_error`,
      type: 'custom',
      duration,
      timestamp: Date.now(),
    });

    throw error;
  }
}

/**
 * Measure synchronous function duration
 */
export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();

  try {
    const result = fn();
    const duration = performance.now() - start;

    logPerformance({
      name,
      type: 'custom',
      duration,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    logPerformance({
      name: `${name}_error`,
      type: 'custom',
      duration,
      timestamp: Date.now(),
    });

    throw error;
  }
}

/**
 * Create a performance tracer
 */
export class PerformanceTracer {
  private name: string;
  private startTime: number;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  stop() {
    const duration = performance.now() - this.startTime;

    logPerformance({
      name: this.name,
      type: 'custom',
      duration,
      timestamp: Date.now(),
    });

    return duration;
  }

  lap(label: string) {
    const duration = performance.now() - this.startTime;

    logPerformance({
      name: `${this.name}_${label}`,
      type: 'custom',
      duration,
      timestamp: Date.now(),
    });

    return duration;
  }
}
