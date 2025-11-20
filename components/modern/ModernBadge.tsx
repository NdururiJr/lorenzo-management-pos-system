'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModernBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  gradient?: boolean;
  className?: string;
  animate?: boolean;
}

export function ModernBadge({
  children,
  variant = 'primary',
  size = 'md',
  pulse = false,
  gradient = true,
  className = '',
  animate = true
}: ModernBadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300';

  const variants = {
    primary: gradient
      ? 'bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white shadow-glow-blue/30'
      : 'bg-brand-blue text-white shadow-md',
    secondary: gradient
      ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
      : 'bg-gray-100 text-gray-800 border border-gray-300',
    success: gradient
      ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-green-500/30'
      : 'bg-green-500 text-white',
    warning: gradient
      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-amber-500/30'
      : 'bg-amber-500 text-white',
    danger: gradient
      ? 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-red-500/30'
      : 'bg-red-500 text-white',
    info: gradient
      ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-blue-500/30'
      : 'bg-blue-500 text-white',
    dark: gradient
      ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-gray-900/30'
      : 'bg-gray-900 text-white',
    light: gradient
      ? 'bg-gradient-to-r from-white to-gray-50 text-gray-800 border border-gray-200 shadow-sm'
      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const badge = (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        className="inline-block"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

// Status badge variant for order statuses
export function StatusBadge({
  status,
  className = '',
  animate = true
}: {
  status: string;
  className?: string;
  animate?: boolean;
}) {
  const statusConfig: Record<string, { variant: ModernBadgeProps['variant']; label: string }> = {
    // Order statuses
    received: { variant: 'info', label: 'Received' },
    queued: { variant: 'secondary', label: 'Queued' },
    washing: { variant: 'primary', label: 'Washing' },
    drying: { variant: 'primary', label: 'Drying' },
    ironing: { variant: 'primary', label: 'Ironing' },
    quality_check: { variant: 'warning', label: 'Quality Check' },
    packaging: { variant: 'info', label: 'Packaging' },
    ready: { variant: 'success', label: 'Ready' },
    out_for_delivery: { variant: 'primary', label: 'Out for Delivery' },
    delivered: { variant: 'success', label: 'Delivered' },
    collected: { variant: 'success', label: 'Collected' },
    cancelled: { variant: 'danger', label: 'Cancelled' },

    // Payment statuses
    paid: { variant: 'success', label: 'Paid' },
    pending: { variant: 'warning', label: 'Pending' },
    partial: { variant: 'info', label: 'Partial' },
    overdue: { variant: 'danger', label: 'Overdue' },

    // User statuses
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
    suspended: { variant: 'danger', label: 'Suspended' },

    // Default
    default: { variant: 'secondary', label: status }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.default;

  return (
    <ModernBadge
      variant={config.variant}
      className={className}
      animate={animate}
    >
      {config.label}
    </ModernBadge>
  );
}

// Count badge for notifications, etc
export function CountBadge({
  count,
  max = 99,
  variant = 'primary',
  className = ''
}: {
  count: number;
  max?: number;
  variant?: ModernBadgeProps['variant'];
  className?: string;
}) {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <ModernBadge
      variant={variant}
      size="sm"
      className={cn('min-w-[20px] h-5', className)}
      animate={true}
    >
      {displayCount}
    </ModernBadge>
  );
}