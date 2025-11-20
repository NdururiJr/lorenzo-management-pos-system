'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for the EmptyState component
 */
interface EmptyStateProps {
  /**
   * Icon to display (from lucide-react)
   */
  icon: LucideIcon;
  /**
   * Main heading text
   */
  heading: string;
  /**
   * Description text
   */
  description: string;
  /**
   * Optional action button config
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EmptyState component - displays when no data is available
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Package}
 *   heading="No orders yet"
 *   description="Start by creating your first order"
 *   action={{
 *     label: "Create Order",
 *     onClick: () => router.push('/orders/new')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  heading,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
      role="status"
      aria-label="No content available"
    >
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-black mb-2">{heading}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-sm">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-brand-blue text-white hover:bg-brand-blue-dark"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
