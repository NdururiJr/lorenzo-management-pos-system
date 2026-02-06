'use client';

import { Info, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Guidance for missing data
 */
interface DataGuidance {
  /** Guidance message to display */
  message: string;
  /** Role to contact for help */
  contactRole?: 'admin' | 'gm' | 'director' | 'branch_manager';
  /** Path where data can be uploaded/configured */
  uploadPath?: string;
}

/**
 * Props for the NoDataAvailable component
 */
interface NoDataAvailableProps {
  /** Name of the metric that is missing */
  metric: string;
  /** Guidance for users on how to get the data */
  guidance: DataGuidance;
  /** Optional custom icon */
  icon?: LucideIcon;
  /** Compact mode for inline usage */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Role display names
 */
const ROLE_NAMES: Record<string, string> = {
  admin: 'System Admin',
  gm: 'General Manager',
  director: 'Director',
  branch_manager: 'Branch Manager',
};

/**
 * Predefined guidance messages for common metrics
 */
export const DATA_GUIDANCE: Record<string, DataGuidance> = {
  staffProductivity: {
    message: 'Staff productivity data will appear after staff complete order processing',
    contactRole: 'branch_manager',
  },
  equipmentUtilization: {
    message: 'Equipment utilization data requires equipment to be configured for this branch',
    contactRole: 'admin',
    uploadPath: '/settings/equipment',
  },
  customerSatisfaction: {
    message: 'Customer satisfaction data will appear after customers submit feedback',
  },
  revenueTargets: {
    message: 'Revenue targets need to be configured for this branch',
    contactRole: 'director',
    uploadPath: '/settings/branch-config',
  },
  historicalComparison: {
    message: 'Insufficient historical data for comparison. Check back after more orders are processed',
  },
  attendance: {
    message: 'Attendance data will appear after staff clock in/out records are available',
    contactRole: 'branch_manager',
  },
  inventory: {
    message: 'Inventory data needs to be set up for this branch',
    contactRole: 'branch_manager',
    uploadPath: '/inventory',
  },
};

/**
 * NoDataAvailable component - displays when data is missing from the database
 *
 * Use this component instead of showing random/fake values when real data
 * is not available. It provides guidance to users on how to get the data.
 *
 * @example
 * ```tsx
 * // Using predefined guidance
 * <NoDataAvailable
 *   metric="Staff Productivity"
 *   guidance={DATA_GUIDANCE.staffProductivity}
 * />
 *
 * // Using custom guidance
 * <NoDataAvailable
 *   metric="Equipment Hours"
 *   guidance={{
 *     message: "No equipment tracking data available",
 *     contactRole: "admin"
 *   }}
 * />
 *
 * // Compact mode for dashboards
 * <NoDataAvailable
 *   metric="Revenue"
 *   guidance={DATA_GUIDANCE.revenueTargets}
 *   compact
 * />
 * ```
 */
export function NoDataAvailable({
  metric,
  guidance,
  icon: Icon = Info,
  compact = false,
  className,
}: NoDataAvailableProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-gray-500 text-sm',
          className
        )}
        role="status"
        aria-label={`No ${metric} data available`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>No data</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-6 px-4 bg-gray-50 rounded-lg border border-gray-200',
        className
      )}
      role="status"
      aria-label={`No ${metric} data available`}
    >
      <div className="rounded-full bg-gray-100 p-3 mb-3">
        <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-1">
        No {metric} Data Available
      </h4>
      <p className="text-xs text-gray-500 max-w-xs mb-2">
        {guidance.message}
      </p>
      {guidance.contactRole && (
        <p className="text-xs text-gray-400">
          Contact: <span className="font-medium">{ROLE_NAMES[guidance.contactRole] || guidance.contactRole}</span>
        </p>
      )}
    </div>
  );
}

/**
 * NoDataValue component - inline placeholder for missing values in tables/cards
 *
 * @example
 * ```tsx
 * <td>{data.revenue ?? <NoDataValue />}</td>
 * ```
 */
export function NoDataValue({ className }: { className?: string }) {
  return (
    <span
      className={cn('text-gray-400 text-sm', className)}
      aria-label="No data"
    >
      --
    </span>
  );
}
