/**
 * Weather Types
 *
 * TypeScript interfaces for Visual Crossing Weather API
 * and operations impact analysis
 *
 * @module types/weather
 */

/**
 * Current weather conditions from Visual Crossing API
 */
export interface WeatherConditions {
  datetime: string;
  temp: number; // Celsius
  feelslike: number;
  humidity: number; // Percentage (0-100)
  precip: number; // mm
  precipprob: number; // Percentage (0-100)
  windspeed: number; // km/h
  windgust?: number; // km/h
  winddir?: number; // Degrees
  pressure?: number; // hPa
  visibility?: number; // km
  cloudcover?: number; // Percentage (0-100)
  uvindex?: number;
  conditions: string; // "Clear", "Rain", "Partly Cloudy", etc.
  icon: string; // Icon code: "clear-day", "rain", etc.
}

/**
 * Daily weather forecast
 */
export interface DayForecast {
  datetime: string; // YYYY-MM-DD
  tempmax: number;
  tempmin: number;
  temp: number; // Average
  humidity: number;
  precip: number;
  precipprob: number;
  preciptype?: string[];
  windspeed: number;
  windgust?: number;
  conditions: string;
  description: string;
  icon: string;
  sunrise: string; // HH:MM:SS
  sunset: string; // HH:MM:SS
  moonphase?: number;
  hours?: WeatherConditions[];
}

/**
 * Weather alert from Visual Crossing API
 */
export interface WeatherAlert {
  event: string;
  headline: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  onset: string; // ISO timestamp
  ends: string; // ISO timestamp
  id?: string;
}

/**
 * Raw API response from Visual Crossing
 */
export interface WeatherResponse {
  queryCost: number;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  address: string;
  timezone: string;
  tzoffset: number;
  currentConditions: WeatherConditions;
  days: DayForecast[];
  alerts?: WeatherAlert[];
}

/**
 * Operations impact level based on weather conditions
 */
export type OperationsImpactLevel = 'normal' | 'caution' | 'warning' | 'severe';

/**
 * Services that can be affected by weather
 */
export type AffectedService = 'pickup' | 'delivery' | 'outdoor_processing';

/**
 * Operations impact analysis based on weather
 */
export interface OperationsImpact {
  level: OperationsImpactLevel;
  message: string;
  recommendations: string[];
  affectedServices: AffectedService[];
}

/**
 * Transformed weather data for frontend consumption
 */
export interface WeatherData {
  current: WeatherConditions;
  forecast: DayForecast[];
  alerts: WeatherAlert[];
  operationsImpact: OperationsImpact;
  lastUpdated: string; // ISO timestamp
  location: string; // Resolved address
}

/**
 * Weather API response wrapper
 */
export interface WeatherApiResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
  message?: string;
}

/**
 * Weather icon mapping type
 */
export type WeatherIconCode =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'rain'
  | 'showers-day'
  | 'showers-night'
  | 'thunder-rain'
  | 'thunder-showers-day'
  | 'thunder-showers-night'
  | 'fog'
  | 'wind'
  | 'snow'
  | 'hail';

/**
 * Weather service configuration
 */
export interface WeatherServiceConfig {
  apiKey: string;
  baseUrl: string;
  defaultLocation: string;
  cacheTtlMs: number;
  unitGroup: 'metric' | 'us' | 'uk';
}
