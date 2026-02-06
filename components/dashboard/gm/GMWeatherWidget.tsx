/**
 * GM Weather Widget
 *
 * Displays current weather conditions with operations impact analysis
 * for the GM Operations Dashboard.
 *
 * Features:
 * - Current temperature and conditions
 * - Humidity, wind, and precipitation info
 * - Operations impact indicator (normal/caution/warning/severe)
 * - 3-day forecast
 * - Theme support (operations dark / light mode)
 *
 * @module components/dashboard/gm/GMWeatherWidget
 */

'use client';

import { motion } from 'framer-motion';
import {
  Cloud,
  CloudRain,
  CloudSun,
  Sun,
  Moon,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle,
  CloudLightning,
  CloudFog,
  CloudMoon,
  Snowflake,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWeather } from '@/hooks/useWeather';
import type { GMDashboardTheme } from '@/types/gm-dashboard';
import type { OperationsImpactLevel } from '@/types/weather';
import { Button } from '@/components/ui/button';
import React from 'react';

interface GMWeatherWidgetProps {
  themeMode: GMDashboardTheme;
}

/**
 * Map Visual Crossing icon codes to Lucide icons
 */
const weatherIcons: Record<string, React.ElementType> = {
  'clear-day': Sun,
  'clear-night': Moon,
  'partly-cloudy-day': CloudSun,
  'partly-cloudy-night': CloudMoon,
  cloudy: Cloud,
  rain: CloudRain,
  'showers-day': CloudRain,
  'showers-night': CloudRain,
  'thunder-rain': CloudLightning,
  'thunder-showers-day': CloudLightning,
  'thunder-showers-night': CloudLightning,
  fog: CloudFog,
  wind: Wind,
  snow: Snowflake,
  hail: CloudRain,
};

/**
 * Impact level styling configuration
 */
const impactConfig: Record<
  OperationsImpactLevel,
  {
    bg: string;
    text: string;
    icon: React.ElementType;
    label: string;
  }
> = {
  normal: {
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    icon: CheckCircle,
    label: 'NORMAL',
  },
  caution: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-500',
    icon: AlertTriangle,
    label: 'CAUTION',
  },
  warning: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-500',
    icon: AlertTriangle,
    label: 'WARNING',
  },
  severe: {
    bg: 'bg-red-500/20',
    text: 'text-red-500',
    icon: AlertTriangle,
    label: 'SEVERE',
  },
};

export function GMWeatherWidget({ themeMode }: GMWeatherWidgetProps) {
  const isDark = themeMode === 'operations';
  const { data: weather, isLoading, error, refetch, isFetching } = useWeather();

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl p-5',
          isDark
            ? 'bg-white/5 backdrop-blur-xl border border-white/10'
            : 'bg-white border border-black/5 shadow-sm'
        )}
      >
        <div className="animate-pulse space-y-3">
          <div
            className={cn(
              'h-6 w-32 rounded',
              isDark ? 'bg-white/10' : 'bg-gray-200'
            )}
          />
          <div
            className={cn(
              'h-16 w-24 rounded',
              isDark ? 'bg-white/10' : 'bg-gray-200'
            )}
          />
          <div
            className={cn(
              'h-4 w-full rounded',
              isDark ? 'bg-white/10' : 'bg-gray-200'
            )}
          />
          <div
            className={cn(
              'h-20 w-full rounded',
              isDark ? 'bg-white/10' : 'bg-gray-200'
            )}
          />
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error || !weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl p-5',
          isDark
            ? 'bg-white/5 backdrop-blur-xl border border-white/10'
            : 'bg-white border border-black/5 shadow-sm'
        )}
      >
        <div
          className={cn(
            'text-center py-6',
            isDark ? 'text-white/40' : 'text-gray-400'
          )}
        >
          <Cloud className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium mb-1">Weather Unavailable</p>
          <p className="text-xs mb-3 opacity-75">
            {error?.message || 'Could not load weather data'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className={cn(
              'text-xs',
              isDark
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  const WeatherIcon = weatherIcons[weather.current.icon] || Cloud;
  const impact = impactConfig[weather.operationsImpact.level];
  const ImpactIcon = impact.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={cn(
        'rounded-2xl p-5',
        isDark
          ? 'bg-white/5 backdrop-blur-xl border border-white/10'
          : 'bg-white border border-black/5 shadow-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              isDark ? 'bg-[#2DD4BF]/20' : 'bg-lorenzo-accent-teal/10'
            )}
          >
            <WeatherIcon
              className={cn(
                'w-4 h-4',
                isDark ? 'text-[#2DD4BF]' : 'text-lorenzo-accent-teal'
              )}
            />
          </div>
          <div>
            <h3
              className={cn(
                'font-semibold text-sm',
                isDark ? 'text-white' : 'text-gray-900'
              )}
            >
              Weather
            </h3>
            <p
              className={cn(
                'text-xs',
                isDark ? 'text-white/40' : 'text-gray-400'
              )}
            >
              {weather.location}
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className={cn(
            'w-7 h-7 p-0',
            isDark
              ? 'text-white/40 hover:text-white hover:bg-white/10'
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <RefreshCw
            className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')}
          />
        </Button>
      </div>

      {/* Current Temperature */}
      <div className="flex items-start gap-4 mb-4">
        <div>
          <p
            className={cn(
              'text-4xl font-bold gm-number',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {Math.round(weather.current.temp)}°
          </p>
          <p
            className={cn(
              'text-sm capitalize',
              isDark ? 'text-white/60' : 'text-gray-500'
            )}
          >
            {weather.current.conditions}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Droplets
              className={cn(
                'w-3 h-3',
                isDark ? 'text-white/40' : 'text-gray-400'
              )}
            />
            <span
              className={cn(
                'text-xs',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {weather.current.humidity}% humidity
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind
              className={cn(
                'w-3 h-3',
                isDark ? 'text-white/40' : 'text-gray-400'
              )}
            />
            <span
              className={cn(
                'text-xs',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {Math.round(weather.current.windspeed)} km/h
            </span>
          </div>
          {weather.current.precipprob > 0 && (
            <div className="flex items-center gap-2">
              <CloudRain
                className={cn(
                  'w-3 h-3',
                  isDark ? 'text-white/40' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-xs',
                  isDark ? 'text-white/60' : 'text-gray-500'
                )}
              >
                {weather.current.precipprob}% rain
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Operations Impact */}
      <div className={cn('rounded-xl p-3', impact.bg)}>
        <div className="flex items-start gap-2">
          <ImpactIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', impact.text)} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-medium', impact.text)}>
              Operations: {impact.label}
            </p>
            <p
              className={cn(
                'text-xs mt-0.5 line-clamp-2',
                isDark ? 'text-white/60' : 'text-gray-600'
              )}
            >
              {weather.operationsImpact.message}
            </p>
            {weather.operationsImpact.recommendations.length > 0 &&
              weather.operationsImpact.level !== 'normal' && (
                <p
                  className={cn(
                    'text-[10px] mt-1 opacity-75',
                    isDark ? 'text-white/40' : 'text-gray-500'
                  )}
                >
                  {weather.operationsImpact.recommendations[0]}
                </p>
              )}
          </div>
        </div>
      </div>

      {/* 3-Day Forecast */}
      {weather.forecast.length > 1 && (
        <div
          className={cn(
            'mt-4 pt-4 border-t',
            isDark ? 'border-white/10' : 'border-gray-100'
          )}
        >
          <p
            className={cn(
              'text-xs font-medium mb-2',
              isDark ? 'text-white/60' : 'text-gray-500'
            )}
          >
            3-Day Forecast
          </p>
          <div className="grid grid-cols-3 gap-2">
            {weather.forecast.slice(1, 4).map((day, index) => {
              const DayIcon = weatherIcons[day.icon] || Cloud;
              const date = new Date(day.datetime);
              const dayName =
                index === 0
                  ? 'Tomorrow'
                  : date.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div
                  key={day.datetime}
                  className={cn(
                    'text-center p-2 rounded-lg',
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  )}
                >
                  <p
                    className={cn(
                      'text-xs',
                      isDark ? 'text-white/40' : 'text-gray-400'
                    )}
                  >
                    {dayName}
                  </p>
                  <DayIcon
                    className={cn(
                      'w-5 h-5 mx-auto my-1',
                      isDark ? 'text-white/60' : 'text-gray-500'
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm font-medium gm-number',
                      isDark ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    {Math.round(day.tempmax)}°
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      isDark ? 'text-white/40' : 'text-gray-400'
                    )}
                  >
                    {Math.round(day.tempmin)}°
                  </p>
                  {day.precipprob > 50 && (
                    <p
                      className={cn(
                        'text-[10px] mt-0.5',
                        isDark ? 'text-blue-400' : 'text-blue-500'
                      )}
                    >
                      {day.precipprob}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last updated */}
      <p
        className={cn(
          'text-[10px] mt-3 text-center',
          isDark ? 'text-white/30' : 'text-gray-300'
        )}
      >
        Updated {new Date(weather.lastUpdated).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>
    </motion.div>
  );
}
