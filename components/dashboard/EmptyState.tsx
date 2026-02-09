/**
 * Empty State Component
 *
 * Professional empty state display for dashboards with no data.
 * Shows helpful messaging and optional action buttons.
 *
 * @module components/dashboard/EmptyState
 */

import { FileX, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type EmptyStateIcon = 'orders' | 'customers' | 'revenue' | 'inventory' | 'general';

interface EmptyStateProps {
  /** Icon type to display */
  icon?: EmptyStateIcon;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action button handler */
  onAction?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

const ICON_MAP = {
  orders: FileX,
  customers: Users,
  revenue: TrendingUp,
  inventory: Package,
  general: DollarSign,
};

/**
 * Empty State Component
 *
 * Displays a professional "no data" message with optional action button.
 *
 * @example
 * <EmptyState
 *   icon="revenue"
 *   title="No Revenue Data Yet"
 *   description="Start processing orders to see revenue metrics and trends appear here."
 * />
 *
 * @example
 * <EmptyState
 *   icon="orders"
 *   title="No Orders Yet"
 *   description="Create your first order to get started."
 *   actionLabel="Create Order"
 *   onAction={() => router.push('/pos')}
 * />
 */
export function EmptyState({
  icon = 'general',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const Icon = ICON_MAP[icon];

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>

        {/* Description */}
        <p className="text-gray-600 text-center max-w-sm mb-6">{description}</p>

        {/* Optional Action Button */}
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Getting Started Card
 *
 * Special empty state for onboarding/getting started guidance.
 *
 * @example
 * <GettingStartedCard
 *   items={[
 *     'Staff can create customer orders at the front desk',
 *     'Real-time metrics appear as data accumulates',
 *     'Reports available with historical data',
 *   ]}
 * />
 */
export function GettingStartedCard({ items }: { items: string[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
        <p className="text-gray-600 mb-4">Your dashboard is ready! Here's what you can do:</p>
        <ul className="space-y-2 text-sm text-gray-600">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
