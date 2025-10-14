/**
 * React Performance Optimization Utilities
 *
 * Helpers for memoization, virtualization, and optimization
 *
 * @module lib/performance/react-utils
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce hook for input handlers
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for scroll/resize handlers
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]); // Removed options from deps to avoid recreating observer

  return isIntersecting;
}

/**
 * Previous value hook for comparison
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Mount status hook to prevent state updates on unmounted components
 */
export function useMountStatus(): React.MutableRefObject<boolean> {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

/**
 * Optimized array comparison for React.memo
 */
export function areArraysEqual<T>(
  prevArray: T[],
  nextArray: T[],
  keyExtractor?: (item: T) => string | number
): boolean {
  if (prevArray.length !== nextArray.length) return false;

  for (let i = 0; i < prevArray.length; i++) {
    if (keyExtractor) {
      if (keyExtractor(prevArray[i]) !== keyExtractor(nextArray[i])) {
        return false;
      }
    } else {
      if (prevArray[i] !== nextArray[i]) return false;
    }
  }

  return true;
}

/**
 * Shallow object comparison for React.memo
 */
export function areObjectsShallowEqual<T extends Record<string, unknown>>(
  prevObj: T,
  nextObj: T
): boolean {
  const prevKeys = Object.keys(prevObj);
  const nextKeys = Object.keys(nextObj);

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of prevKeys) {
    if (prevObj[key] !== nextObj[key]) return false;
  }

  return true;
}

/**
 * Create a custom memoization comparator
 */
export function createMemoComparator<P>(
  compareKeys: (keyof P)[]
): (prevProps: P, nextProps: P) => boolean {
  return (prevProps, nextProps) => {
    for (const key of compareKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  };
}
