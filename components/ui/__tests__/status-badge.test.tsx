/**
 * Component Tests for StatusBadge
 *
 * Tests status badge rendering, colors, icons, and configurations.
 *
 * @module components/ui/__tests__/status-badge.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  StatusBadge,
  StatusIcon,
  getStatusConfig,
  OrderStatus,
} from '../status-badge';

describe('StatusBadge Component', () => {
  describe('Rendering', () => {
    it('renders with received status', () => {
      render(<StatusBadge status="received" />);
      expect(screen.getByText('Received')).toBeInTheDocument();
    });

    it('renders with washing status', () => {
      render(<StatusBadge status="washing" />);
      expect(screen.getByText('Washing')).toBeInTheDocument();
    });

    it('renders with delivered status', () => {
      render(<StatusBadge status="delivered" />);
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });

    it('renders icon by default', () => {
      const { container } = render(<StatusBadge status="queued_for_delivery" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      const { container } = render(
        <StatusBadge status="queued_for_delivery" showIcon={false} />
      );
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      const { container } = render(<StatusBadge status="queued_for_delivery" size="sm" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-xs');
    });

    it('renders medium size (default)', () => {
      const { container } = render(<StatusBadge status="queued_for_delivery" size="md" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-sm');
    });

    it('renders large size', () => {
      const { container } = render(<StatusBadge status="queued_for_delivery" size="lg" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('Status Colors', () => {
    it('applies gray color for received status', () => {
      const { container } = render(<StatusBadge status="received" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-700');
    });

    it('applies blue color for washing status', () => {
      const { container } = render(<StatusBadge status="washing" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass('text-blue-700');
    });

    it('applies green color for queued_for_delivery status', () => { // FR-008
      const { container } = render(<StatusBadge status="queued_for_delivery" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-700');
    });

    it('applies amber color for out_for_delivery status', () => {
      const { container } = render(<StatusBadge status="out_for_delivery" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-amber-100');
      expect(badge).toHaveClass('text-amber-700');
    });

    it('applies purple color for quality_check status', () => {
      const { container } = render(<StatusBadge status="quality_check" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-purple-100');
      expect(badge).toHaveClass('text-purple-700');
    });
  });

  describe('Status Labels', () => {
    const statusLabels: Record<OrderStatus, string> = {
      received: 'Received',
      inspection: 'Inspection', // Added missing status
      queued: 'Queued',
      washing: 'Washing',
      drying: 'Drying',
      ironing: 'Ironing',
      quality_check: 'Quality Check',
      packaging: 'Packaging',
      queued_for_delivery: 'Ready', // FR-008: Updated key
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      collected: 'Collected',
    };

    Object.entries(statusLabels).forEach(([status, label]) => {
      it(`displays correct label for ${status}`, () => {
        render(<StatusBadge status={status as OrderStatus} />);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Animated Statuses', () => {
    it('washing status has animation', () => {
      const { container } = render(<StatusBadge status="washing" />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('animate-pulse');
    });

    it('drying status has animation', () => {
      const { container } = render(<StatusBadge status="drying" />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('animate-pulse');
    });

    it('ironing status has animation', () => {
      const { container } = render(<StatusBadge status="ironing" />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('animate-pulse');
    });

    it('out_for_delivery status has animation', () => {
      const { container } = render(<StatusBadge status="out_for_delivery" />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('animate-pulse');
    });

    it('received status has no animation', () => {
      const { container } = render(<StatusBadge status="received" />);
      const icon = container.querySelector('svg');
      expect(icon).not.toHaveClass('animate-pulse');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StatusBadge status="queued_for_delivery" className="custom-class" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('custom-class');
    });

    it('preserves default classes with custom className', () => {
      const { container } = render(
        <StatusBadge status="queued_for_delivery" className="custom-class" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('bg-green-100');
    });
  });
});

describe('StatusIcon Component', () => {
  it('renders icon without badge wrapper', () => {
    const { container } = render(<StatusIcon status="queued_for_delivery" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(<StatusIcon status="queued_for_delivery" size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-4');
    expect(svg).toHaveClass('h-4');
  });

  it('applies status color', () => {
    const { container } = render(<StatusIcon status="queued_for_delivery" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-green-700');
  });

  it('applies animation for animated statuses', () => {
    const { container } = render(<StatusIcon status="washing" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-pulse');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <StatusIcon status="queued_for_delivery" className="custom-icon" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-icon');
  });
});

describe('getStatusConfig', () => {
  it('returns config for received status', () => {
    const config = getStatusConfig('received');
    expect(config.label).toBe('Received');
    expect(config.color).toBe('gray');
  });

  it('returns config for washing status', () => {
    const config = getStatusConfig('washing');
    expect(config.label).toBe('Washing');
    expect(config.color).toBe('blue');
    expect(config.animated).toBe(true);
  });

  it('returns config for queued_for_delivery status', () => { // FR-008
    const config = getStatusConfig('queued_for_delivery');
    expect(config.label).toBe('Ready');
    expect(config.color).toBe('green');
    expect(config.animated).toBeUndefined();
  });

  it('includes icon in config', () => {
    const config = getStatusConfig('delivered');
    expect(config.icon).toBeDefined();
  });

  it('includes correct colors in config', () => {
    const config = getStatusConfig('quality_check');
    expect(config.bgColor).toBe('bg-purple-100');
    expect(config.textColor).toBe('text-purple-700');
  });
});
