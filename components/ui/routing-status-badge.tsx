/**
 * Routing Status Badge Component (FR-006)
 *
 * Visual indicator for order routing status.
 * Used in order cards, lists, and pipeline views.
 *
 * @module components/ui/routing-status-badge
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Clock,
  Truck,
  Package,
  Route,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RoutingStatus } from '@/lib/db/schema';

interface RoutingStatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: LucideIcon;
}

const routingStatusConfig: Record<RoutingStatus, RoutingStatusConfig> = {
  pending: {
    label: 'Pending Routing',
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    borderColor: 'border-yellow-500',
    icon: Clock,
  },
  in_transit: {
    label: 'In Transit',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-500',
    icon: Truck,
  },
  received: {
    label: 'Received',
    bgColor: 'bg-cyan-500',
    textColor: 'text-white',
    borderColor: 'border-cyan-500',
    icon: Package,
  },
  assigned: {
    label: 'Assigned',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    borderColor: 'border-purple-500',
    icon: Route,
  },
  processing: {
    label: 'Processing',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-500',
    icon: RefreshCw,
  },
  ready_for_return: {
    label: 'Ready',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-500',
    icon: CheckCircle2,
  },
};

interface RoutingStatusBadgeProps {
  status: RoutingStatus | undefined | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function RoutingStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: RoutingStatusBadgeProps) {
  // If no routing status, don't render anything
  if (!status) {
    return null;
  }

  const config = routingStatusConfig[status];
  if (!config) {
    return null;
  }

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
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}

/**
 * Get routing status configuration
 */
export function getRoutingStatusConfig(
  status: RoutingStatus
): RoutingStatusConfig {
  return routingStatusConfig[status];
}

/**
 * Get all routing statuses
 */
export function getAllRoutingStatuses(): RoutingStatus[] {
  return ['pending', 'in_transit', 'received', 'assigned', 'processing', 'ready_for_return'];
}
