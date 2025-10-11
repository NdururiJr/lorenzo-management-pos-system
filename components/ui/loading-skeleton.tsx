'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Variant types for skeleton loaders
 */
type SkeletonVariant = 'text' | 'card' | 'table' | 'avatar';

/**
 * Props for the LoadingSkeleton component
 */
interface LoadingSkeletonProps {
  /**
   * The type of content being loaded
   * @default 'text'
   */
  variant?: SkeletonVariant;
  /**
   * Number of items to show
   * @default 1
   */
  count?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * LoadingSkeleton component - displays skeleton loaders for different content types
 *
 * @example
 * ```tsx
 * <LoadingSkeleton variant="card" count={3} />
 * ```
 */
export function LoadingSkeleton({
  variant = 'text',
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {items.map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
        {items.map((i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-10 w-full" />
        {items.map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    );
  }

  return null;
}
