'use client';

import { Settings, AlertCircle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * Props for the SetupRequired component
 */
interface SetupRequiredProps {
  /** What needs to be configured */
  feature: string;
  /** Description of what configuration is needed */
  description?: string;
  /** Path to the configuration page */
  configPath?: string;
  /** Button label for the action */
  actionLabel?: string;
  /** Optional custom icon */
  icon?: LucideIcon;
  /** Variant style */
  variant?: 'default' | 'warning' | 'inline';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Common setup configurations
 */
export const SETUP_CONFIGS = {
  branchTargets: {
    feature: 'Branch Targets',
    description: 'Revenue and performance targets need to be configured for this branch',
    configPath: '/settings/branch-config',
    actionLabel: 'Configure Targets',
  },
  equipment: {
    feature: 'Equipment',
    description: 'No equipment has been configured for this branch',
    configPath: '/settings/equipment',
    actionLabel: 'Add Equipment',
  },
  staffAssignments: {
    feature: 'Staff Assignments',
    description: 'Staff members need to be assigned to this workstation',
    configPath: '/employees',
    actionLabel: 'Assign Staff',
  },
  inventory: {
    feature: 'Inventory',
    description: 'Inventory items need to be set up for this branch',
    configPath: '/inventory',
    actionLabel: 'Setup Inventory',
  },
  paymentIntegration: {
    feature: 'Payment Integration',
    description: 'Payment provider needs to be configured',
    configPath: '/settings/payments',
    actionLabel: 'Configure Payments',
  },
  whatsappIntegration: {
    feature: 'WhatsApp Notifications',
    description: 'WhatsApp integration needs to be configured for notifications',
    configPath: '/settings/notifications',
    actionLabel: 'Configure WhatsApp',
  },
  companySettings: {
    feature: 'Company Settings',
    description: 'Default company settings need to be configured',
    configPath: '/settings/company',
    actionLabel: 'Configure Settings',
  },
};

/**
 * SetupRequired component - displays when configuration is missing
 *
 * Use this component instead of Math.random() or hardcoded values when
 * the required configuration doesn't exist in the database.
 *
 * @example
 * ```tsx
 * // Using predefined config
 * <SetupRequired {...SETUP_CONFIGS.branchTargets} />
 *
 * // Custom setup message
 * <SetupRequired
 *   feature="Branch Targets"
 *   description="Configure revenue targets to see this metric"
 *   configPath="/settings/branch-config"
 * />
 *
 * // Inline variant for compact spaces
 * <SetupRequired
 *   feature="Equipment"
 *   variant="inline"
 * />
 *
 * // Warning variant for critical missing config
 * <SetupRequired
 *   feature="Payment Integration"
 *   variant="warning"
 * />
 * ```
 */
export function SetupRequired({
  feature,
  description,
  configPath,
  actionLabel = 'Configure',
  icon: Icon = Settings,
  variant = 'default',
  className,
}: SetupRequiredProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-amber-600 text-sm',
          className
        )}
        role="alert"
        aria-label={`${feature} setup required`}
      >
        <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>Setup Required</span>
      </div>
    );
  }

  const isWarning = variant === 'warning';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-8 px-4 rounded-lg border',
        isWarning
          ? 'bg-amber-50 border-amber-200'
          : 'bg-gray-50 border-gray-200',
        className
      )}
      role="alert"
      aria-label={`${feature} setup required`}
    >
      <div
        className={cn(
          'rounded-full p-3 mb-3',
          isWarning ? 'bg-amber-100' : 'bg-gray-100'
        )}
      >
        <Icon
          className={cn(
            'h-6 w-6',
            isWarning ? 'text-amber-600' : 'text-gray-400'
          )}
          aria-hidden="true"
        />
      </div>
      <h4
        className={cn(
          'text-sm font-medium mb-1',
          isWarning ? 'text-amber-800' : 'text-gray-900'
        )}
      >
        {feature} Setup Required
      </h4>
      {description && (
        <p
          className={cn(
            'text-xs max-w-xs mb-4',
            isWarning ? 'text-amber-600' : 'text-gray-500'
          )}
        >
          {description}
        </p>
      )}
      {configPath && (
        <Link href={configPath}>
          <Button
            variant={isWarning ? 'default' : 'outline'}
            size="sm"
            className={cn(
              isWarning && 'bg-amber-600 hover:bg-amber-700 text-white'
            )}
          >
            <Settings className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

/**
 * SetupRequiredBadge - small badge to indicate setup is needed
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>
 *       Revenue <SetupRequiredBadge />
 *     </CardTitle>
 *   </CardHeader>
 * </Card>
 * ```
 */
export function SetupRequiredBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700',
        className
      )}
      role="status"
      aria-label="Setup required"
    >
      <AlertCircle className="h-3 w-3" />
      Setup Required
    </span>
  );
}
