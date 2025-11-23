/**
 * Pipeline Helper Functions Tests
 *
 * Tests for pipeline calculations and utility functions
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > Pipeline Testing > 3.2 Processing Times
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  groupOrdersByStatus,
  calculateTimeInCurrentStage,
  calculateTotalProcessingTime,
  isOrderOverdue,
  calculateUrgencyScore,
  sortByUrgency,
  formatDuration,
  formatTimeUntilDue,
  getUrgencyColorClass,
} from '@/lib/pipeline/pipeline-helpers';
import { createTestOrder } from '../../helpers/test-data-factory';
import { createMockTimestamp } from '../../helpers/test-utils';
import type { OrderExtended } from '@/lib/db/schema';

describe('Pipeline Helper Functions', () => {
  describe('Group Orders By Status', () => {
    it('should group orders by their current status', () => {
      const orders: any[] = [
        createTestOrder({ orderId: 'ORD-001', status: 'washing' }),
        createTestOrder({ orderId: 'ORD-002', status: 'washing' }),
        createTestOrder({ orderId: 'ORD-003', status: 'ironing' }),
        createTestOrder({ orderId: 'ORD-004', status: 'ready' }),
      ];

      const grouped = groupOrdersByStatus(orders);

      expect(grouped.washing).toHaveLength(2);
      expect(grouped.ironing).toHaveLength(1);
      expect(grouped.ready).toHaveLength(1);
      expect(grouped.queued).toHaveLength(0);
    });

    it('should create empty arrays for statuses with no orders', () => {
      const orders: any[] = [
        createTestOrder({ orderId: 'ORD-001', status: 'washing' }),
      ];

      const grouped = groupOrdersByStatus(orders);

      expect(grouped.received).toEqual([]);
      expect(grouped.queued).toEqual([]);
      expect(grouped.delivered).toEqual([]);
    });

    it('should handle empty orders array', () => {
      const grouped = groupOrdersByStatus([]);

      Object.values(grouped).forEach((statusOrders) => {
        expect(statusOrders).toEqual([]);
      });
    });
  });

  describe('Calculate Time In Current Stage', () => {
    it('should calculate time in minutes for current stage', () => {
      // Create order with status change 30 minutes ago
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        statusHistory: [
          {
            status: 'received',
            timestamp: createMockTimestamp(new Date(Date.now() - 60 * 60 * 1000)),
            changedBy: 'user-001',
          },
          {
            status: 'washing',
            timestamp: createMockTimestamp(thirtyMinutesAgo),
            changedBy: 'user-001',
          },
        ],
      };

      const timeInStage = calculateTimeInCurrentStage(order);

      // Should be approximately 30 minutes (allow 1 minute tolerance for test execution time)
      expect(timeInStage).toBeGreaterThanOrEqual(29);
      expect(timeInStage).toBeLessThanOrEqual(31);
    });

    it('should return 0 if no status history exists', () => {
      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        statusHistory: [],
      };

      const timeInStage = calculateTimeInCurrentStage(order);
      expect(timeInStage).toBe(0);
    });
  });

  describe('Calculate Total Processing Time', () => {
    it('should calculate total time from creation to completion', () => {
      const createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const completedAt = new Date(); // now

      const order: any = {
        ...createTestOrder({ status: 'delivered' }),
        createdAt: createMockTimestamp(createdAt),
        actualCompletion: createMockTimestamp(completedAt),
      };

      const totalTime = calculateTotalProcessingTime(order);

      // Should be approximately 120 minutes (2 hours)
      expect(totalTime).toBeGreaterThanOrEqual(119);
      expect(totalTime).toBeLessThanOrEqual(121);
    });

    it('should return 0 if order is not yet completed', () => {
      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        actualCompletion: null,
      };

      const totalTime = calculateTotalProcessingTime(order);
      expect(totalTime).toBe(0);
    });
  });

  describe('Is Order Overdue', () => {
    it('should return true if current time is past estimated completion', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(pastDate),
        actualCompletion: null,
      };

      expect(isOrderOverdue(order)).toBe(true);
    });

    it('should return false if current time is before estimated completion', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(futureDate),
        actualCompletion: null,
      };

      expect(isOrderOverdue(order)).toBe(false);
    });

    it('should return false if order is already completed (even if past estimated time)', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);

      const order: any = {
        ...createTestOrder({ status: 'delivered' }),
        estimatedCompletion: createMockTimestamp(pastDate),
        actualCompletion: createMockTimestamp(new Date()),
      };

      expect(isOrderOverdue(order)).toBe(false);
    });
  });

  describe('Calculate Urgency Score', () => {
    it('should return 100 for overdue orders', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(pastDate),
      };

      const score = calculateUrgencyScore(order);
      expect(score).toBe(100);
    });

    it('should return high score (80-99) for orders due within 6 hours', () => {
      const dueInFourHours = new Date(Date.now() + 4 * 60 * 60 * 1000);

      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(dueInFourHours),
      };

      const score = calculateUrgencyScore(order);
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThan(100);
    });

    it('should return medium score (50-79) for orders due within 24 hours', () => {
      const dueInTwelveHours = new Date(Date.now() + 12 * 60 * 60 * 1000);

      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(dueInTwelveHours),
      };

      const score = calculateUrgencyScore(order);
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThan(80);
    });

    it('should return low score for orders due in distant future', () => {
      const dueInTwoDays = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(dueInTwoDays),
      };

      const score = calculateUrgencyScore(order);
      expect(score).toBeLessThan(50);
    });
  });

  describe('Sort By Urgency', () => {
    it('should sort orders by urgency score (highest first)', () => {
      const overdue: any = {
        ...createTestOrder({ orderId: 'ORD-001', status: 'washing' }),
        estimatedCompletion: createMockTimestamp(new Date(Date.now() - 60 * 60 * 1000)),
      };

      const urgent: any = {
        ...createTestOrder({ orderId: 'ORD-002', status: 'washing' }),
        estimatedCompletion: createMockTimestamp(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      };

      const notUrgent: any = {
        ...createTestOrder({ orderId: 'ORD-003', status: 'washing' }),
        estimatedCompletion: createMockTimestamp(new Date(Date.now() + 48 * 60 * 60 * 1000)),
      };

      const orders = [notUrgent, urgent, overdue];
      const sorted = sortByUrgency(orders);

      expect(sorted[0].orderId).toBe('ORD-001'); // overdue
      expect(sorted[1].orderId).toBe('ORD-002'); // urgent
      expect(sorted[2].orderId).toBe('ORD-003'); // not urgent
    });

    it('should not mutate original array', () => {
      const orders: any[] = [
        {
          ...createTestOrder({ orderId: 'ORD-001' }),
          estimatedCompletion: createMockTimestamp(new Date(Date.now() + 60 * 60 * 1000)),
        },
        {
          ...createTestOrder({ orderId: 'ORD-002' }),
          estimatedCompletion: createMockTimestamp(new Date(Date.now() - 60 * 60 * 1000)),
        },
      ];

      const originalFirst = orders[0].orderId;
      sortByUrgency(orders);

      expect(orders[0].orderId).toBe(originalFirst);
    });
  });

  describe('Format Duration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(59)).toBe('59m');
    });

    it('should format hours correctly', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(90)).toBe('1h 30m');
    });

    it('should format days correctly', () => {
      expect(formatDuration(24 * 60)).toBe('1d');
      expect(formatDuration(48 * 60)).toBe('2d');
      expect(formatDuration(24 * 60 + 120)).toBe('1d 2h');
    });

    it('should not show minutes when hours are exact days', () => {
      expect(formatDuration(24 * 60)).toBe('1d');
      expect(formatDuration(48 * 60)).not.toContain('0h');
    });
  });

  describe('Format Time Until Due', () => {
    it('should return "Overdue" for past dates', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);
      const formatted = formatTimeUntilDue(createMockTimestamp(pastDate));

      expect(formatted).toBe('Overdue');
    });

    it('should format time remaining with "left" suffix', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const formatted = formatTimeUntilDue(createMockTimestamp(futureDate));

      expect(formatted).toContain('left');
      expect(formatted).toContain('m');
    });

    it('should format hours remaining', () => {
      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const formatted = formatTimeUntilDue(createMockTimestamp(futureDate));

      expect(formatted).toContain('h');
      expect(formatted).toContain('left');
    });
  });

  describe('Get Urgency Color Class', () => {
    it('should return red classes for overdue orders (score 100)', () => {
      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(new Date(Date.now() - 60 * 60 * 1000)),
      };

      const colorClass = getUrgencyColorClass(order);
      expect(colorClass).toContain('red');
    });

    it('should return orange classes for very urgent orders (score >= 80)', () => {
      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      };

      const colorClass = getUrgencyColorClass(order);
      expect(colorClass).toContain('orange');
    });

    it('should return amber classes for moderately urgent orders (score >= 50)', () => {
      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(new Date(Date.now() + 12 * 60 * 60 * 1000)),
      };

      const colorClass = getUrgencyColorClass(order);
      expect(colorClass).toContain('amber');
    });

    it('should return default classes for non-urgent orders (score < 50)', () => {
      const order: any = {
        ...createTestOrder({ status: 'washing' }),
        estimatedCompletion: createMockTimestamp(new Date(Date.now() + 48 * 60 * 60 * 1000)),
      };

      const colorClass = getUrgencyColorClass(order);
      expect(colorClass).toContain('gray');
      expect(colorClass).toContain('white');
    });
  });
});
