/**
 * Status Badge Component
 *
 * Visual indicator for order status with color coding and icons.
 * Used in pipeline board, order cards, and customer portal.
 *
 * @module components/ui/status-badge
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Circle,
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  Wind,
  Shirt,
  Shield,
  Gift,
  MapPin,
  ClipboardCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type OrderStatus =
  | 'received'
  | 'inspection'
  | 'queued'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'quality_check'
  | 'packaging'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'collected';

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: LucideIcon;
  animated?: boolean;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
  received: {
    label: 'Received',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: Circle,
  },
  inspection: {
    label: 'Inspection',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    icon: ClipboardCheck,
  },
  queued: {
    label: 'Queued',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: Circle,
  },
  washing: {
    label: 'Washing',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Sparkles,
    animated: true,
  },
  drying: {
    label: 'Drying',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Wind,
    animated: true,
  },
  ironing: {
    label: 'Ironing',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Shirt,
    animated: true,
  },
  quality_check: {
    label: 'Quality Check',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: Shield,
  },
  packaging: {
    label: 'Packaging',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    icon: Gift,
  },
  ready: {
    label: 'Ready',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: Package,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: Truck,
    animated: true,
  },
  delivered: {
    label: 'Delivered',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircle2,
  },
  collected: {
    label: 'Collected',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircle2,
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        config.bgColor,
        config.textColor,
        `border-${config.color}-200`,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            iconSizes[size],
            config.animated && 'animate-pulse'
          )}
        />
      )}
      {config.label}
    </Badge>
  );
}

/**
 * Status Icon - Just the icon without badge wrapper
 */
interface StatusIconProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIcon({ status, size = 'md', className }: StatusIconProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <Icon
      className={cn(
        iconSizes[size],
        config.textColor,
        config.animated && 'animate-pulse',
        className
      )}
    />
  );
}

/**
 * Get status configuration
 */
export function getStatusConfig(status: OrderStatus): StatusConfig {
  return statusConfig[status];
}
