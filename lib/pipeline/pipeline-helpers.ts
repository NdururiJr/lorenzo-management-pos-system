/**
 * Pipeline Helper Functions
 *
 * Utility functions for pipeline operations and calculations.
 *
 * @module lib/pipeline/pipeline-helpers
 */

import type { OrderExtended, OrderStatus, Timestamp } from '@/lib/db/schema';

/**
 * Group orders by status
 *
 * @param orders - Array of orders
 * @returns Object with orders grouped by status
 */
export function groupOrdersByStatus(
  orders: OrderExtended[]
): Record<OrderStatus, OrderExtended[]> {
  const grouped: Record<string, OrderExtended[]> = {
    received: [],
    queued: [],
    washing: [],
    drying: [],
    ironing: [],
    quality_check: [],
    packaging: [],
    ready: [],
    out_for_delivery: [],
    delivered: [],
    collected: [],
  };

  orders.forEach((order) => {
    if (grouped[order.status]) {
      grouped[order.status].push(order);
    }
  });

  return grouped as Record<OrderStatus, OrderExtended[]>;
}

/**
 * Calculate time spent in current stage (in minutes)
 *
 * @param order - Order object
 * @returns Time in minutes
 */
export function calculateTimeInCurrentStage(order: OrderExtended): number {
  const currentStatusEntry = order.statusHistory[order.statusHistory.length - 1];
  if (!currentStatusEntry) return 0;

  const statusChangeTime = currentStatusEntry.timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - statusChangeTime.getTime();
  return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
}

/**
 * Calculate total processing time for an order (in minutes)
 *
 * @param order - Order object
 * @returns Total processing time in minutes
 */
export function calculateTotalProcessingTime(order: OrderExtended): number {
  if (!order.actualCompletion) return 0;

  const createdTime = order.createdAt.toDate();
  const completedTime = order.actualCompletion.toDate();
  const diffMs = completedTime.getTime() - createdTime.getTime();
  return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
}

/**
 * Calculate average time per stage
 *
 * @param orders - Array of completed orders
 * @returns Object with average time per stage
 */
export function calculateAverageTimePerStage(
  orders: OrderExtended[]
): Record<OrderStatus, number> {
  const stageTimes: Record<string, number[]> = {
    received: [],
    queued: [],
    washing: [],
    drying: [],
    ironing: [],
    quality_check: [],
    packaging: [],
    ready: [],
    out_for_delivery: [],
    delivered: [],
    collected: [],
  };

  // Calculate time spent in each stage for each order
  orders.forEach((order) => {
    for (let i = 0; i < order.statusHistory.length - 1; i++) {
      const current = order.statusHistory[i];
      const next = order.statusHistory[i + 1];

      const currentTime = current.timestamp.toDate();
      const nextTime = next.timestamp.toDate();
      const diffMinutes = Math.floor(
        (nextTime.getTime() - currentTime.getTime()) / (1000 * 60)
      );

      if (stageTimes[current.status]) {
        stageTimes[current.status].push(diffMinutes);
      }
    }
  });

  // Calculate averages
  const averages: Record<string, number> = {};
  Object.keys(stageTimes).forEach((stage) => {
    const times = stageTimes[stage];
    if (times.length > 0) {
      const sum = times.reduce((acc, time) => acc + time, 0);
      averages[stage] = Math.round(sum / times.length);
    } else {
      averages[stage] = 0;
    }
  });

  return averages as Record<OrderStatus, number>;
}

/**
 * Identify bottleneck stages (stages with longest average time)
 *
 * @param orders - Array of orders
 * @param topN - Number of top bottlenecks to return
 * @returns Array of bottleneck stages with average time
 */
export function identifyBottlenecks(
  orders: OrderExtended[],
  topN = 3
): Array<{ status: OrderStatus; avgTime: number }> {
  const averages = calculateAverageTimePerStage(orders);

  return Object.entries(averages)
    .map(([status, avgTime]) => ({ status: status as OrderStatus, avgTime }))
    .filter((item) => item.avgTime > 0)
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, topN);
}

/**
 * Check if order is overdue
 *
 * @param order - Order object
 * @returns True if order is past estimated completion time
 */
export function isOrderOverdue(order: OrderExtended): boolean {
  const now = new Date();
  const estimatedTime = order.estimatedCompletion.toDate();
  return now > estimatedTime && !order.actualCompletion;
}

/**
 * Get overdue orders
 *
 * @param orders - Array of orders
 * @returns Array of overdue orders
 */
export function getOverdueOrders(orders: OrderExtended[]): OrderExtended[] {
  return orders.filter(isOrderOverdue);
}

/**
 * Calculate urgency score for an order (0-100)
 * Higher score = more urgent
 *
 * @param order - Order object
 * @returns Urgency score
 */
export function calculateUrgencyScore(order: OrderExtended): number {
  const now = new Date();
  const estimatedTime = order.estimatedCompletion.toDate();
  const hoursUntilDue =
    (estimatedTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // If overdue, score is 100
  if (hoursUntilDue <= 0) return 100;

  // If less than 6 hours, score 80-99
  if (hoursUntilDue <= 6) return Math.round(80 + (6 - hoursUntilDue) * 3);

  // If less than 24 hours, score 50-79
  if (hoursUntilDue <= 24) return Math.round(50 + (24 - hoursUntilDue) * 1.25);

  // Otherwise, score 0-49
  return Math.max(0, Math.round(50 - hoursUntilDue));
}

/**
 * Sort orders by urgency (most urgent first)
 *
 * @param orders - Array of orders
 * @returns Sorted array of orders
 */
export function sortByUrgency(orders: OrderExtended[]): OrderExtended[] {
  return [...orders].sort((a, b) => {
    const scoreA = calculateUrgencyScore(a);
    const scoreB = calculateUrgencyScore(b);
    return scoreB - scoreA;
  });
}

/**
 * Format time duration (minutes to human-readable)
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }

  return `${days}d`;
}

/**
 * Format time until due date
 *
 * @param estimatedCompletion - Estimated completion timestamp
 * @returns Formatted string
 */
export function formatTimeUntilDue(estimatedCompletion: Timestamp): string {
  const now = new Date();
  const dueDate = estimatedCompletion.toDate();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes <= 0) return 'Overdue';

  return formatDuration(diffMinutes) + ' left';
}

/**
 * Get urgency color class based on time until due
 *
 * @param order - Order object
 * @returns Tailwind color class
 */
export function getUrgencyColorClass(order: OrderExtended): string {
  const score = calculateUrgencyScore(order);

  if (score >= 100) return 'border-red-500 bg-red-50';
  if (score >= 80) return 'border-orange-400 bg-orange-50';
  if (score >= 50) return 'border-amber-300 bg-amber-50';
  return 'border-gray-200 bg-white';
}

/**
 * Calculate pipeline statistics for a set of orders
 *
 * @param orders - Array of orders
 * @returns Statistics object
 */
export function calculatePipelineStatistics(orders: OrderExtended[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filter orders created today
  const todayOrders = orders.filter(
    (order) => order.createdAt.toDate() >= today
  );

  // Filter completed orders (delivered or collected)
  const completedOrders = orders.filter(
    (order) => order.status === 'delivered' || order.status === 'collected'
  );

  const todayCompleted = completedOrders.filter(
    (order) =>
      order.actualCompletion && order.actualCompletion.toDate() >= today
  );

  // Calculate average processing time for completed orders
  const processingTimes = completedOrders
    .filter((order) => order.actualCompletion)
    .map(calculateTotalProcessingTime);

  const avgProcessingTime =
    processingTimes.length > 0
      ? Math.round(
          processingTimes.reduce((sum, time) => sum + time, 0) /
            processingTimes.length
        )
      : 0;

  // Calculate today's revenue
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  // Count orders by status
  const statusCounts: Record<string, number> = {};
  orders.forEach((order) => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  // Identify bottlenecks
  const bottlenecks = identifyBottlenecks(completedOrders, 3);

  // Get overdue orders
  const overdueOrders = getOverdueOrders(orders);

  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    completedOrders: completedOrders.length,
    todayCompleted: todayCompleted.length,
    avgProcessingTime, // in minutes
    todayRevenue,
    statusCounts,
    bottlenecks,
    overdueCount: overdueOrders.length,
  };
}
