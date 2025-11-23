/**
 * Pipeline Status Transition Tests
 *
 * Tests for order status transitions and validation
 * Corresponds to: END_TO_END_TESTING_GUIDE.md > Pipeline Testing > 3.1 Status Transitions
 */

import { describe, it, expect } from '@jest/globals';
import {
  canTransitionTo,
  getValidNextStatuses,
  getStatusConfig,
  requiresNotification,
  getAllStatuses,
  isTerminalStatus,
  getStatusGroup,
  VALID_TRANSITIONS,
} from '@/lib/pipeline/status-manager';
import type { OrderStatus } from '@/lib/db/schema';

describe('Pipeline Status Transitions', () => {
  describe('Valid Status Transitions', () => {
    it('should allow received → inspection transition', () => {
      expect(canTransitionTo('received', 'inspection')).toBe(true);
    });

    it('should allow inspection → queued transition', () => {
      expect(canTransitionTo('inspection', 'queued')).toBe(true);
    });

    it('should allow queued → washing transition', () => {
      expect(canTransitionTo('queued', 'washing')).toBe(true);
    });

    it('should allow washing → drying transition', () => {
      expect(canTransitionTo('washing', 'drying')).toBe(true);
    });

    it('should allow drying → ironing transition', () => {
      expect(canTransitionTo('drying', 'ironing')).toBe(true);
    });

    it('should allow ironing → quality_check transition', () => {
      expect(canTransitionTo('ironing', 'quality_check')).toBe(true);
    });

    it('should allow quality_check → packaging transition', () => {
      expect(canTransitionTo('quality_check', 'packaging')).toBe(true);
    });

    it('should allow quality_check → washing transition (QA fail)', () => {
      expect(canTransitionTo('quality_check', 'washing')).toBe(true);
    });

    it('should allow packaging → ready transition', () => {
      expect(canTransitionTo('packaging', 'ready')).toBe(true);
    });

    it('should allow ready → out_for_delivery transition', () => {
      expect(canTransitionTo('ready', 'out_for_delivery')).toBe(true);
    });

    it('should allow ready → collected transition', () => {
      expect(canTransitionTo('ready', 'collected')).toBe(true);
    });

    it('should allow out_for_delivery → delivered transition', () => {
      expect(canTransitionTo('out_for_delivery', 'delivered')).toBe(true);
    });
  });

  describe('Invalid Status Transitions', () => {
    it('should not allow received → washing (skipping inspection and queued)', () => {
      expect(canTransitionTo('received', 'washing')).toBe(false);
    });

    it('should not allow washing → ironing (skipping drying)', () => {
      expect(canTransitionTo('washing', 'ironing')).toBe(false);
    });

    it('should not allow queued → ready (skipping all processing stages)', () => {
      expect(canTransitionTo('queued', 'ready')).toBe(false);
    });

    it('should not allow backward transitions (washing → queued)', () => {
      expect(canTransitionTo('washing', 'queued')).toBe(false);
    });

    it('should not allow transitions from terminal state (delivered → washing)', () => {
      expect(canTransitionTo('delivered', 'washing')).toBe(false);
    });

    it('should not allow transitions from terminal state (collected → washing)', () => {
      expect(canTransitionTo('collected', 'washing')).toBe(false);
    });

    it('should not allow delivered → out_for_delivery transition', () => {
      expect(canTransitionTo('delivered', 'out_for_delivery')).toBe(false);
    });

    it('should not allow collected → delivered transition', () => {
      expect(canTransitionTo('collected', 'delivered')).toBe(false);
    });
  });

  describe('Get Valid Next Statuses', () => {
    it('should return [inspection] for received status', () => {
      const nextStatuses = getValidNextStatuses('received');
      expect(nextStatuses).toEqual(['inspection']);
    });

    it('should return [queued] for inspection status', () => {
      const nextStatuses = getValidNextStatuses('inspection');
      expect(nextStatuses).toEqual(['queued']);
    });

    it('should return [packaging, washing] for quality_check status', () => {
      const nextStatuses = getValidNextStatuses('quality_check');
      expect(nextStatuses).toEqual(['packaging', 'washing']);
    });

    it('should return [out_for_delivery, collected] for ready status', () => {
      const nextStatuses = getValidNextStatuses('ready');
      expect(nextStatuses).toEqual(['out_for_delivery', 'collected']);
    });

    it('should return empty array for delivered status (terminal)', () => {
      const nextStatuses = getValidNextStatuses('delivered');
      expect(nextStatuses).toEqual([]);
    });

    it('should return empty array for collected status (terminal)', () => {
      const nextStatuses = getValidNextStatuses('collected');
      expect(nextStatuses).toEqual([]);
    });
  });

  describe('Status Configuration', () => {
    it('should return correct configuration for received status', () => {
      const config = getStatusConfig('received');
      expect(config.label).toBe('Received');
      expect(config.color).toBe('gray');
      expect(config.requiresNotification).toBe(false);
    });

    it('should return correct configuration for ready status', () => {
      const config = getStatusConfig('ready');
      expect(config.label).toBe('Ready');
      expect(config.color).toBe('green');
      expect(config.requiresNotification).toBe(true);
    });

    it('should return correct configuration for out_for_delivery status', () => {
      const config = getStatusConfig('out_for_delivery');
      expect(config.label).toBe('Out for Delivery');
      expect(config.color).toBe('amber');
      expect(config.requiresNotification).toBe(true);
    });

    it('should return correct configuration for delivered status', () => {
      const config = getStatusConfig('delivered');
      expect(config.label).toBe('Delivered');
      expect(config.color).toBe('emerald');
      expect(config.requiresNotification).toBe(true);
    });

    it('should have consistent color classes for all statuses', () => {
      const statuses: OrderStatus[] = getAllStatuses() as OrderStatus[];
      statuses.forEach((status) => {
        const config = getStatusConfig(status);
        expect(config.bgColor).toMatch(/^bg-/);
        expect(config.textColor).toMatch(/^text-/);
        expect(config.borderColor).toMatch(/^border-/);
      });
    });
  });

  describe('Notification Requirements', () => {
    it('should require notification for ready status', () => {
      expect(requiresNotification('ready')).toBe(true);
    });

    it('should require notification for out_for_delivery status', () => {
      expect(requiresNotification('out_for_delivery')).toBe(true);
    });

    it('should require notification for delivered status', () => {
      expect(requiresNotification('delivered')).toBe(true);
    });

    it('should not require notification for received status', () => {
      expect(requiresNotification('received')).toBe(false);
    });

    it('should not require notification for washing status', () => {
      expect(requiresNotification('washing')).toBe(false);
    });

    it('should not require notification for quality_check status', () => {
      expect(requiresNotification('quality_check')).toBe(false);
    });

    it('should not require notification for collected status', () => {
      expect(requiresNotification('collected')).toBe(false);
    });
  });

  describe('Terminal Status Checks', () => {
    it('should identify delivered as terminal status', () => {
      expect(isTerminalStatus('delivered')).toBe(true);
    });

    it('should identify collected as terminal status', () => {
      expect(isTerminalStatus('collected')).toBe(true);
    });

    it('should not identify ready as terminal status', () => {
      expect(isTerminalStatus('ready')).toBe(false);
    });

    it('should not identify washing as terminal status', () => {
      expect(isTerminalStatus('washing')).toBe(false);
    });

    it('should not identify out_for_delivery as terminal status', () => {
      expect(isTerminalStatus('out_for_delivery')).toBe(false);
    });
  });

  describe('Status Grouping', () => {
    it('should group received as Pending', () => {
      expect(getStatusGroup('received')).toBe('Pending');
    });

    it('should group queued as Pending', () => {
      expect(getStatusGroup('queued')).toBe('Pending');
    });

    it('should group washing as Processing', () => {
      expect(getStatusGroup('washing')).toBe('Processing');
    });

    it('should group drying as Processing', () => {
      expect(getStatusGroup('drying')).toBe('Processing');
    });

    it('should group ironing as Processing', () => {
      expect(getStatusGroup('ironing')).toBe('Processing');
    });

    it('should group quality_check as Processing', () => {
      expect(getStatusGroup('quality_check')).toBe('Processing');
    });

    it('should group packaging as Processing', () => {
      expect(getStatusGroup('packaging')).toBe('Processing');
    });

    it('should group ready as Ready', () => {
      expect(getStatusGroup('ready')).toBe('Ready');
    });

    it('should group out_for_delivery as Ready', () => {
      expect(getStatusGroup('out_for_delivery')).toBe('Ready');
    });

    it('should group delivered as Completed', () => {
      expect(getStatusGroup('delivered')).toBe('Completed');
    });

    it('should group collected as Completed', () => {
      expect(getStatusGroup('collected')).toBe('Completed');
    });
  });

  describe('Get All Statuses', () => {
    it('should return all 12 order statuses', () => {
      const statuses = getAllStatuses();
      expect(statuses).toHaveLength(12);
    });

    it('should include all expected statuses', () => {
      const statuses = getAllStatuses();
      expect(statuses).toContain('received');
      expect(statuses).toContain('inspection');
      expect(statuses).toContain('queued');
      expect(statuses).toContain('washing');
      expect(statuses).toContain('drying');
      expect(statuses).toContain('ironing');
      expect(statuses).toContain('quality_check');
      expect(statuses).toContain('packaging');
      expect(statuses).toContain('ready');
      expect(statuses).toContain('out_for_delivery');
      expect(statuses).toContain('delivered');
      expect(statuses).toContain('collected');
    });
  });

  describe('Transition Map Completeness', () => {
    it('should have transitions defined for all statuses', () => {
      const allStatuses = getAllStatuses();
      allStatuses.forEach((status) => {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
      });
    });

    it('should have valid transition arrays for all statuses', () => {
      Object.values(VALID_TRANSITIONS).forEach((transitions) => {
        expect(Array.isArray(transitions)).toBe(true);
      });
    });
  });
});
