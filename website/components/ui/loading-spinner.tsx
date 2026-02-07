'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Size variants for the loading spinner
 */
type SpinnerSize = 'small' | 'medium' | 'large';

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'medium'
   */
  size?: SpinnerSize;
  /**
   * Optional text label to display below the spinner
   */
  text?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to center the spinner in its container
   * @default false
   */
  centered?: boolean;
}

const sizeMap: Record<SpinnerSize, string> = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-12 w-12',
};

/**
 * LoadingSpinner component - displays an animated loading indicator
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="medium" text="Loading..." />
 * ```
 */
export function LoadingSpinner({
  size = 'medium',
  text,
  className,
  centered = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2',
        centered && 'justify-center min-h-[200px]',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading'}
    >
      <Loader2
        className={cn(sizeMap[size], 'animate-spin text-black')}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
}
