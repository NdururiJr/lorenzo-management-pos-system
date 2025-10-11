'use client';

import { cn } from '@/lib/utils';

/**
 * Props for the PageContainer component
 */
interface PageContainerProps {
  /**
   * Content to wrap
   */
  children: React.ReactNode;
  /**
   * Maximum width variant
   * @default '7xl'
   */
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl';
  /**
   * Padding size
   * @default 'default'
   */
  padding?: 'none' | 'sm' | 'default' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
}

const maxWidthMap = {
  full: 'max-w-full',
  '7xl': 'max-w-7xl',
  '6xl': 'max-w-6xl',
  '5xl': 'max-w-5xl',
  '4xl': 'max-w-4xl',
};

const paddingMap = {
  none: '',
  sm: 'p-4',
  default: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-12',
};

/**
 * PageContainer component - provides consistent page padding and max-width
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageHeader title="Dashboard" />
 *   <div>Your content...</div>
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  maxWidth = '7xl',
  padding = 'default',
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthMap[maxWidth],
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
