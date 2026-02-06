/**
 * Payment Badge Component
 *
 * Visual indicator for payment status.
 * Used in order cards, receipts, and financial views.
 *
 * @module components/ui/payment-badge
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue' | 'refunded' | 'overpaid';

interface PaymentConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: LucideIcon;
}

const paymentConfig: Record<PaymentStatus, PaymentConfig> = {
  paid: {
    label: 'Paid',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-500',
    icon: CheckCircle2,
  },
  partial: {
    label: 'Partial',
    bgColor: 'bg-amber-500',
    textColor: 'text-white',
    borderColor: 'border-amber-500',
    icon: AlertCircle,
  },
  pending: {
    label: 'Pending',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    borderColor: 'border-gray-500',
    icon: Clock,
  },
  overdue: {
    label: 'Overdue',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-500',
    icon: AlertCircle,
  },
  refunded: {
    label: 'Refunded',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    borderColor: 'border-purple-500',
    icon: CheckCircle2,
  },
  overpaid: {
    label: 'Overpaid',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-500',
    icon: CheckCircle2,
  },
};

interface PaymentBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  amount?: number;
  className?: string;
}

export function PaymentBadge({
  status,
  size = 'md',
  showIcon = true,
  amount,
  className,
}: PaymentBadgeProps) {
  const config = paymentConfig[status];
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
      {amount !== undefined && (
        <span className="ml-1 font-semibold">
          KES {amount.toLocaleString()}
        </span>
      )}
    </Badge>
  );
}

/**
 * Get payment configuration
 */
export function getPaymentConfig(status: PaymentStatus): PaymentConfig {
  return paymentConfig[status];
}

/**
 * Determine payment status based on amounts
 */
export function getPaymentStatus(
  totalAmount: number,
  paidAmount: number,
  dueDate?: Date
): PaymentStatus {
  if (paidAmount === 0) {
    if (dueDate && dueDate < new Date()) {
      return 'overdue';
    }
    return 'pending';
  }

  if (paidAmount > totalAmount) {
    return 'overpaid';
  }

  if (paidAmount >= totalAmount) {
    return 'paid';
  }

  return 'partial';
}
