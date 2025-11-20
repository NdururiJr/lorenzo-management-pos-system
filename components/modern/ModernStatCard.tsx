'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ModernStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  delay?: number;
  format?: 'number' | 'currency' | 'percentage';
  variant?: 'default' | 'gradient' | 'solid';
}

export function ModernStatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  className = '',
  delay = 0,
  format = 'number',
  variant = 'default'
}: ModernStatCardProps) {
  // Auto-detect trend if not provided
  const actualTrend = trend || (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const trendBgColors = {
    up: 'bg-green-100',
    down: 'bg-red-100',
    neutral: 'bg-gray-100'
  };

  const TrendIcon = trendIcons[actualTrend];

  const formatValue = () => {
    if (typeof value === 'number') {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
          }).format(value);
        case 'percentage':
          return `${value}%`;
        default:
          return value.toLocaleString();
      }
    }
    return value;
  };

  const cardVariants = {
    default: 'bg-white/70 backdrop-blur-xl border-2 border-white/60',
    gradient: 'bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 backdrop-blur-xl border-2 border-brand-blue/20',
    solid: 'bg-brand-blue text-white border-2 border-brand-blue-dark'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative rounded-3xl shadow-card hover:shadow-glow-blue/10 transition-all duration-300 p-6',
        cardVariants[variant],
        className
      )}
    >
      {/* Subtle gradient overlay for default variant */}
      {variant === 'default' && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-blue-100/5 pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium',
              variant === 'solid' ? 'text-white/90' : 'text-gray-600'
            )}>
              {title}
            </p>
          </div>
          {icon && (
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={cn(
                'p-2 rounded-xl',
                variant === 'solid' ? 'bg-white/20' : 'bg-brand-blue/10'
              )}
            >
              <div className={cn(
                'w-5 h-5',
                variant === 'solid' ? 'text-white' : 'text-brand-blue'
              )}>
                {icon}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-1">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className={cn(
              'text-3xl font-bold',
              variant === 'solid' ? 'text-white' : 'text-gray-900'
            )}
          >
            {formatValue()}
          </motion.p>

          {(change !== undefined || changeLabel) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className="flex items-center gap-2"
            >
              {change !== undefined && (
                <span className={cn(
                  'flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
                  variant === 'solid'
                    ? 'bg-white/20 text-white'
                    : cn(trendBgColors[actualTrend], trendColors[actualTrend])
                )}>
                  <TrendIcon className="w-3 h-3" />
                  {Math.abs(change)}%
                </span>
              )}
              {changeLabel && (
                <span className={cn(
                  'text-xs',
                  variant === 'solid' ? 'text-white/80' : 'text-gray-500'
                )}>
                  {changeLabel}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Mini stat card for compact displays
export function MiniStatCard({
  label,
  value,
  icon,
  trend,
  className = ''
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down';
  className?: string;
}) {
  const TrendArrow = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400 }}
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-brand-blue/10',
        className
      )}
    >
      {icon && (
        <div className="p-2 rounded-xl bg-brand-blue/10">
          <div className="w-4 h-4 text-brand-blue">
            {icon}
          </div>
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-gray-600">{label}</p>
        <div className="flex items-center gap-1">
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {trend && <TrendArrow className={cn('w-4 h-4', trendColor)} />}
        </div>
      </div>
    </motion.div>
  );
}

// Stat card group for displaying multiple related stats
export function StatCardGroup({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
      className
    )}>
      {children}
    </div>
  );
}