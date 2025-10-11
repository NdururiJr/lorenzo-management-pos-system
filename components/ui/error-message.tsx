'use client';

import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Variant types for error messages
 */
type ErrorVariant = 'error' | 'warning' | 'info';

/**
 * Props for the ErrorMessage component
 */
interface ErrorMessageProps {
  /**
   * The type of message
   * @default 'error'
   */
  variant?: ErrorVariant;
  /**
   * Title of the error message
   */
  title?: string;
  /**
   * Main error message content
   */
  message: string;
  /**
   * Optional retry callback
   */
  onRetry?: () => void;
  /**
   * Text for the retry button
   * @default 'Try again'
   */
  retryText?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const variantConfig: Record<
  ErrorVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    borderColor: string;
    defaultTitle: string;
  }
> = {
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
    defaultTitle: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    defaultTitle: 'Warning',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    defaultTitle: 'Information',
  },
};

/**
 * ErrorMessage component - displays error, warning, or info messages consistently
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   variant="error"
 *   title="Failed to load data"
 *   message="Unable to connect to the server. Please check your connection."
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function ErrorMessage({
  variant = 'error',
  title,
  message,
  onRetry,
  retryText = 'Try again',
  className,
}: ErrorMessageProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <Alert
      className={cn(
        'bg-white border-2',
        config.borderColor,
        className
      )}
      role="alert"
    >
      <Icon className={cn('h-4 w-4', config.iconColor)} aria-hidden="true" />
      <AlertTitle className="font-semibold">{displayTitle}</AlertTitle>
      <AlertDescription className="mt-2 text-sm text-gray-700">
        {message}
      </AlertDescription>
      {onRetry && (
        <div className="mt-4">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-black hover:bg-black hover:text-white"
          >
            {retryText}
          </Button>
        </div>
      )}
    </Alert>
  );
}
