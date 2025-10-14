/**
 * Status Management Logic
 *
 * Handles order status transitions, validation, and business rules.
 *
 * @module lib/pipeline/status-manager
 */

import type { OrderStatus } from '@/lib/db/schema';

/**
 * Valid status transitions map
 * Defines which statuses can transition to which statuses
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ['queued'],
  queued: ['washing'],
  washing: ['drying'],
  drying: ['ironing'],
  ironing: ['quality_check'],
  quality_check: ['packaging', 'washing'], // Can return to washing if QA fails
  packaging: ['ready'],
  ready: ['out_for_delivery', 'collected'],
  out_for_delivery: ['delivered'],
  delivered: [], // Terminal state
  collected: [], // Terminal state
};

/**
 * Check if a status transition is valid
 *
 * @param currentStatus - Current order status
 * @param nextStatus - Desired next status
 * @returns True if transition is valid, false otherwise
 */
export function canTransitionTo(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(nextStatus);
}

/**
 * Get valid next statuses for a given current status
 *
 * @param currentStatus - Current order status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[currentStatus];
}

/**
 * Get status configuration with display information
 *
 * @param status - Order status
 * @returns Status configuration object
 */
export function getStatusConfig(status: OrderStatus) {
  const configs: Record<
    OrderStatus,
    {
      label: string;
      color: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
      description: string;
      requiresNotification: boolean;
    }
  > = {
    received: {
      label: 'Received',
      color: 'gray',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      description: 'Order received and logged',
      requiresNotification: false,
    },
    queued: {
      label: 'Queued',
      color: 'slate',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200',
      description: 'Waiting to be processed',
      requiresNotification: false,
    },
    washing: {
      label: 'Washing',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      description: 'Currently being washed',
      requiresNotification: false,
    },
    drying: {
      label: 'Drying',
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      description: 'In the dryer',
      requiresNotification: false,
    },
    ironing: {
      label: 'Ironing',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      description: 'Being ironed',
      requiresNotification: false,
    },
    quality_check: {
      label: 'Quality Check',
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      description: 'QA inspection',
      requiresNotification: false,
    },
    packaging: {
      label: 'Packaging',
      color: 'pink',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-200',
      description: 'Being packaged',
      requiresNotification: false,
    },
    ready: {
      label: 'Ready',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      description: 'Ready for pickup/delivery',
      requiresNotification: true, // Send WhatsApp notification
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      description: 'Driver dispatched',
      requiresNotification: true, // Send WhatsApp notification
    },
    delivered: {
      label: 'Delivered',
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      description: 'Successfully delivered',
      requiresNotification: true, // Send WhatsApp notification
    },
    collected: {
      label: 'Collected',
      color: 'teal',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-200',
      description: 'Picked up by customer',
      requiresNotification: false,
    },
  };

  return configs[status];
}

/**
 * Check if status transition requires WhatsApp notification
 *
 * @param status - Order status
 * @returns True if notification should be sent
 */
export function requiresNotification(status: OrderStatus): boolean {
  const config = getStatusConfig(status);
  return config.requiresNotification;
}

/**
 * Get all order statuses
 *
 * @returns Array of all order statuses
 */
export function getAllStatuses(): OrderStatus[] {
  return [
    'received',
    'queued',
    'washing',
    'drying',
    'ironing',
    'quality_check',
    'packaging',
    'ready',
    'out_for_delivery',
    'delivered',
    'collected',
  ];
}

/**
 * Check if order is in terminal state
 *
 * @param status - Order status
 * @returns True if status is terminal (no further transitions)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'collected';
}

/**
 * Get status group (for filtering/grouping)
 *
 * @param status - Order status
 * @returns Status group name
 */
export function getStatusGroup(status: OrderStatus): string {
  if (['received', 'queued'].includes(status)) return 'Pending';
  if (['washing', 'drying', 'ironing', 'quality_check', 'packaging'].includes(status))
    return 'Processing';
  if (['ready', 'out_for_delivery'].includes(status)) return 'Ready';
  if (['delivered', 'collected'].includes(status)) return 'Completed';
  return 'Unknown';
}
