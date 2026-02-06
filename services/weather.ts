/**
 * Weather Service
 *
 * Visual Crossing API integration with caching and operations impact analysis
 * for Lorenzo Dry Cleaners GM Dashboard.
 *
 * Features:
 * - In-memory caching with TTL to minimize API calls
 * - Operations impact analysis based on weather conditions
 * - Delivery/pickup impact recommendations
 *
 * @module services/weather
 */

import type {
  WeatherResponse,
  WeatherData,
  OperationsImpact,
  WeatherConditions,
  DayForecast,
  OperationsImpactLevel,
  AffectedService,
} from '@/types/weather';

// Configuration
const API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// Cache configuration
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Lorenzo branch areas - all in Nairobi
const DEFAULT_LOCATION = 'Nairobi,Kenya';

/**
 * In-memory cache for weather data
 */
interface CacheEntry {
  data: WeatherData;
  expiresAt: number;
}

const cache: Map<string, CacheEntry> = new Map();

/**
 * Check if weather service is configured
 */
export function isWeatherConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Get cached data if valid
 */
function getCachedData(location: string): WeatherData | null {
  const entry = cache.get(location.toLowerCase());
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  // Clean up expired entry
  if (entry) {
    cache.delete(location.toLowerCase());
  }
  return null;
}

/**
 * Store data in cache
 */
function setCachedData(location: string, data: WeatherData): void {
  cache.set(location.toLowerCase(), {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Weather impact thresholds for Nairobi operations
 */
const THRESHOLDS = {
  // Rain thresholds (mm)
  rainLight: 5,
  rainModerate: 15,
  rainHeavy: 30,
  // Rain probability thresholds (%)
  rainProbCaution: 60,
  rainProbWarning: 80,
  // Wind thresholds (km/h)
  windCaution: 30,
  windWarning: 45,
  windSevere: 60,
  // Temperature thresholds (Celsius) - adjusted for Nairobi
  tempHigh: 32,
  tempVeryHigh: 36,
  tempLow: 12,
};

/**
 * Analyze weather impact on operations
 */
function analyzeOperationsImpact(
  current: WeatherConditions,
  forecast: DayForecast[]
): OperationsImpact {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const affectedServices: AffectedService[] = [];

  // Check current precipitation
  if (current.precip > THRESHOLDS.rainHeavy) {
    issues.push('Heavy rain currently');
    recommendations.push('Delay non-urgent deliveries');
    recommendations.push('Alert drivers about road conditions');
    affectedServices.push('pickup', 'delivery');
  } else if (current.precip > THRESHOLDS.rainModerate) {
    issues.push('Moderate rain');
    recommendations.push('Allow extra time for deliveries');
    affectedServices.push('delivery');
  }

  // Check rain probability
  if (current.precipprob > THRESHOLDS.rainProbWarning) {
    if (!issues.some((i) => i.includes('rain'))) {
      issues.push(`${current.precipprob}% rain probability`);
    }
    recommendations.push('Prepare rain covers for garments');
    if (!affectedServices.includes('delivery')) {
      affectedServices.push('delivery');
    }
  } else if (current.precipprob > THRESHOLDS.rainProbCaution) {
    recommendations.push('Monitor weather for possible rain');
  }

  // Check wind conditions
  if (current.windspeed > THRESHOLDS.windSevere) {
    issues.push('Severe wind conditions');
    recommendations.push('Suspend outdoor operations');
    recommendations.push('Secure all outdoor items');
    affectedServices.push('outdoor_processing', 'delivery');
  } else if (current.windspeed > THRESHOLDS.windWarning) {
    issues.push('High winds');
    recommendations.push('Use extra caution with garment bags');
    affectedServices.push('outdoor_processing');
  } else if (current.windspeed > THRESHOLDS.windCaution) {
    recommendations.push('Monitor wind conditions');
  }

  // Check temperature (Nairobi-adjusted)
  if (current.temp > THRESHOLDS.tempVeryHigh) {
    issues.push('Extreme heat');
    recommendations.push('Schedule breaks for delivery staff');
    recommendations.push('Avoid midday deliveries if possible');
    affectedServices.push('delivery');
  } else if (current.temp > THRESHOLDS.tempHigh) {
    recommendations.push('Ensure drivers stay hydrated');
  }

  if (current.temp < THRESHOLDS.tempLow) {
    recommendations.push('Allow vehicles to warm up before routes');
  }

  // Check tomorrow's forecast for planning
  const tomorrow = forecast[1];
  if (tomorrow) {
    if (tomorrow.precipprob > THRESHOLDS.rainProbWarning) {
      recommendations.push(
        `Tomorrow: ${tomorrow.precipprob}% rain expected - adjust pickup schedules`
      );
    }
    if (tomorrow.tempmax > THRESHOLDS.tempVeryHigh) {
      recommendations.push(
        `Tomorrow: High of ${Math.round(tomorrow.tempmax)}°C - plan early deliveries`
      );
    }
  }

  // Determine overall impact level
  let level: OperationsImpactLevel = 'normal';

  if (issues.length > 0) {
    level = 'caution';
  }

  if (
    current.precip > THRESHOLDS.rainModerate ||
    current.windspeed > THRESHOLDS.windWarning ||
    current.temp > THRESHOLDS.tempVeryHigh
  ) {
    level = 'warning';
  }

  if (
    current.precip > THRESHOLDS.rainHeavy ||
    current.windspeed > THRESHOLDS.windSevere
  ) {
    level = 'severe';
  }

  return {
    level,
    message:
      issues.length > 0 ? issues.join('. ') : 'Good conditions for operations',
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ['Normal operations recommended'],
    affectedServices: [...new Set(affectedServices)], // Remove duplicates
  };
}

/**
 * Fetch weather data from Visual Crossing API
 *
 * @param location - Location string (e.g., "Nairobi,Kenya")
 * @returns Weather data with operations impact analysis
 */
export async function fetchWeatherData(
  location: string = DEFAULT_LOCATION
): Promise<WeatherData> {
  // Check cache first
  const cached = getCachedData(location);
  if (cached) {
    console.log('[Weather] Cache hit for', location);
    return cached;
  }

  if (!API_KEY) {
    throw new Error('Weather service not configured: VISUAL_CROSSING_API_KEY missing');
  }

  const url = `${BASE_URL}/${encodeURIComponent(location)}?unitGroup=metric&key=${API_KEY}&contentType=json&include=current,days,alerts`;

  console.log('[Weather] Fetching from API for', location);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      // Cache at the fetch level too
      next: { revalidate: 900 }, // 15 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Weather] API Error:', response.status, errorText);

      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      if (response.status === 429) {
        throw new Error('API rate limit exceeded');
      }
      throw new Error(`Weather API error: ${response.status}`);
    }

    const apiData: WeatherResponse = await response.json();

    // Transform to our format
    const weatherData: WeatherData = {
      current: apiData.currentConditions,
      forecast: apiData.days.slice(0, 5), // 5-day forecast
      alerts: apiData.alerts || [],
      operationsImpact: analyzeOperationsImpact(
        apiData.currentConditions,
        apiData.days
      ),
      lastUpdated: new Date().toISOString(),
      location: apiData.resolvedAddress,
    };

    // Cache the result
    setCachedData(location, weatherData);

    console.log('[Weather] Data cached for', location);
    return weatherData;
  } catch (error: unknown) {
    console.error('[Weather] Fetch error:', error);
    throw error;
  }
}

/**
 * Get weather icon Lucide component name based on Visual Crossing icon code
 */
export function getWeatherIconName(icon: string): string {
  const iconMap: Record<string, string> = {
    'clear-day': 'Sun',
    'clear-night': 'Moon',
    'partly-cloudy-day': 'CloudSun',
    'partly-cloudy-night': 'CloudMoon',
    cloudy: 'Cloud',
    rain: 'CloudRain',
    'showers-day': 'CloudSunRain',
    'showers-night': 'CloudMoonRain',
    'thunder-rain': 'CloudLightning',
    'thunder-showers-day': 'CloudLightning',
    'thunder-showers-night': 'CloudLightning',
    fog: 'CloudFog',
    wind: 'Wind',
    snow: 'Snowflake',
    hail: 'CloudHail',
  };
  return iconMap[icon] || 'Cloud';
}

/**
 * Clear the weather cache
 * Useful for testing or forcing a refresh
 */
export function clearWeatherCache(): void {
  cache.clear();
  console.log('[Weather] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getWeatherCacheStats(): {
  size: number;
  entries: Array<{ location: string; expiresIn: number }>;
} {
  const now = Date.now();
  const entries: Array<{ location: string; expiresIn: number }> = [];

  for (const [location, entry] of cache.entries()) {
    entries.push({
      location,
      expiresIn: Math.max(0, entry.expiresAt - now),
    });
  }

  return {
    size: cache.size,
    entries,
  };
}
