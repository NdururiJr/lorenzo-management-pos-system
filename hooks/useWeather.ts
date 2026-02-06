/**
 * Weather Data Hook
 *
 * TanStack Query hook for fetching weather data with auto-refresh
 * and caching for the GM Dashboard weather widget.
 *
 * @module hooks/useWeather
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { WeatherData, WeatherApiResponse } from '@/types/weather';

/**
 * Options for the useWeather hook
 */
interface UseWeatherOptions {
  /** Location string (default: "Nairobi,Kenya") */
  location?: string;
  /** Whether to enable the query (default: true) */
  enabled?: boolean;
  /** Refresh interval in ms (default: 15 minutes) */
  refetchInterval?: number;
}

/**
 * Default configuration
 */
const DEFAULTS = {
  location: 'Nairobi,Kenya',
  refetchInterval: 15 * 60 * 1000, // 15 minutes
  staleTime: 10 * 60 * 1000, // 10 minutes
  retryCount: 2,
  retryDelay: 5000,
};

/**
 * Fetch weather data from the API
 */
async function fetchWeather(location: string): Promise<WeatherData> {
  const response = await fetch(
    `/api/weather?location=${encodeURIComponent(location)}`
  );

  if (!response.ok) {
    const errorData: WeatherApiResponse = await response.json().catch(() => ({
      success: false,
      error: `HTTP ${response.status}`,
    }));

    throw new Error(errorData.error || 'Failed to fetch weather data');
  }

  const data: WeatherApiResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Invalid weather response');
  }

  return data.data;
}

/**
 * Hook for fetching weather data
 *
 * @param options - Configuration options
 * @returns TanStack Query result with weather data
 *
 * @example
 * ```tsx
 * function WeatherWidget() {
 *   const { data, isLoading, error } = useWeather();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <ErrorState />;
 *
 *   return (
 *     <div>
 *       <p>Temperature: {data?.current.temp}°C</p>
 *       <p>Conditions: {data?.current.conditions}</p>
 *       <p>Impact: {data?.operationsImpact.level}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWeather(options: UseWeatherOptions = {}) {
  const {
    location = DEFAULTS.location,
    enabled = true,
    refetchInterval = DEFAULTS.refetchInterval,
  } = options;

  return useQuery<WeatherData, Error>({
    queryKey: ['weather', location],
    queryFn: () => fetchWeather(location),
    enabled,
    refetchInterval,
    staleTime: DEFAULTS.staleTime,
    retry: DEFAULTS.retryCount,
    retryDelay: DEFAULTS.retryDelay,
    // Don't refetch on window focus for weather (data doesn't change that fast)
    refetchOnWindowFocus: false,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for prefetching weather data
 * Useful for preloading weather data before displaying the dashboard
 */
export function usePrefetchWeather() {
  const { refetch } = useWeather({ enabled: false });
  return refetch;
}
