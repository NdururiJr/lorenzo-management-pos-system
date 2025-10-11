'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

/**
 * Props for the PageHeader component
 */
interface PageHeaderProps {
  /**
   * Main page title
   */
  title: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Optional breadcrumb items
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Optional action buttons (right side)
   */
  actions?: React.ReactNode;
  /**
   * Optional back button config
   */
  backButton?: {
    label?: string;
    onClick: () => void;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PageHeader component - reusable page header with title, description, and actions
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Orders"
 *   description="Manage all customer orders"
 *   breadcrumbs={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Orders' }
 *   ]}
 *   actions={
 *     <Button>Create Order</Button>
 *   }
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backButton,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4 pb-4 border-b', className)}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {backButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={backButton.onClick}
              className="border-gray-300"
              aria-label={backButton.label || 'Go back'}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {backButton.label || 'Back'}
            </Button>
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
