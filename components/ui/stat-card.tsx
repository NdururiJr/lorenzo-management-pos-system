'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Variant types for stat cards
 */
type StatCardVariant = 'default' | 'success' | 'warning' | 'error';

/**
 * Props for the StatCard component
 */
interface StatCardProps {
  /**
   * Label/title for the stat
   */
  label: string;
  /**
   * Main value to display
   */
  value: string | number;
  /**
   * Optional icon
   */
  icon?: LucideIcon;
  /**
   * Optional change indicator (e.g., "+12%")
   */
  change?: {
    value: string;
    trend: 'up' | 'down';
  };
  /**
   * Optional description/subtitle
   */
  description?: string;
  /**
   * Visual variant
   * @default 'default'
   */
  variant?: StatCardVariant;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const variantConfig: Record<StatCardVariant, { border: string; iconBg: string; iconColor: string }> = {
  default: {
    border: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  success: {
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  warning: {
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  error: {
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
};

/**
 * StatCard component - displays statistics with optional icon and change indicator
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Total Orders"
 *   value={1234}
 *   icon={Package}
 *   change={{ value: "+12%", trend: "up" }}
 *   description="vs. last month"
 *   variant="success"
 * />
 * ```
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  description,
  variant = 'default',
  className,
}: StatCardProps) {
  const config = variantConfig[variant];

  return (
    <Card className={cn('border-2', config.border, className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-black mb-2">{value}</p>

            {(change || description) && (
              <div className="flex items-center gap-2 text-sm">
                {change && (
                  <span
                    className={cn(
                      'flex items-center gap-1 font-medium',
                      change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {change.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-4 w-4" aria-hidden="true" />
                    )}
                    {change.value}
                  </span>
                )}
                {description && (
                  <span className="text-gray-600">{description}</span>
                )}
              </div>
            )}
          </div>

          {Icon && (
            <div className={cn('p-3 rounded-lg', config.iconBg)}>
              <Icon className={cn('h-6 w-6', config.iconColor)} aria-hidden="true" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
