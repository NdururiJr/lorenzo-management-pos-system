'use client';

import { cn } from '@/lib/utils';

/**
 * Props for the SectionHeader component
 */
interface SectionHeaderProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Optional action element (e.g., button, link)
   */
  action?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SectionHeader component - displays section titles within pages
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Recent Orders"
 *   description="View and manage your recent orders"
 *   action={<Button variant="outline">View All</Button>}
 * />
 * ```
 */
export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
        className
      )}
    >
      <div>
        <h2 className="text-xl font-semibold text-black">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
