/**
 * GlassCard Component
 *
 * Reusable card with glassmorphism effect for the marketing site.
 * Features: frosted glass background, subtle borders, soft shadows
 *
 * @module components/marketing/GlassCard
 */

import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  /** Additional Tailwind classes */
  className?: string;
}

export function GlassCard({
  children,
  hover = true,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Base glassmorphism styles
        'relative rounded-2xl',
        'bg-white/10 backdrop-blur-glass',
        'border border-white/25',
        'shadow-glass',

        // Inner gradient for depth
        'before:absolute before:inset-0',
        'before:rounded-2xl',
        'before:bg-glass-gradient',
        'before:opacity-60',
        'before:-z-10',

        // Hover effects (if enabled)
        hover && [
          'transition-all duration-300 ease-out',
          'hover:shadow-lift hover:-translate-y-1',
          'hover:border-white/40',
        ],

        // Custom classes
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * GlassCard variant with blue accent
 */
export function GlassCardBlue({
  children,
  hover = true,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Base glassmorphism styles with blue tint
        'relative rounded-2xl',
        'bg-brand-blue-50/20 backdrop-blur-glass',
        'border border-brand-blue/30',
        'shadow-glass',

        // Inner gradient with blue
        'before:absolute before:inset-0',
        'before:rounded-2xl',
        'before:bg-gradient-to-br before:from-brand-blue/10 before:to-transparent',
        'before:opacity-60',
        'before:-z-10',

        // Hover effects
        hover && [
          'transition-all duration-300 ease-out',
          'hover:shadow-glow-blue hover:-translate-y-1',
          'hover:border-brand-blue/50',
          'hover:bg-brand-blue-50/30',
        ],

        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * GlassCard variant with solid white background (less transparent)
 */
export function GlassCardSolid({
  children,
  hover = true,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl',
        'bg-white/90 backdrop-blur-md',
        'border border-gray-200',
        'shadow-card',

        hover && [
          'transition-all duration-300 ease-out',
          'hover:shadow-lift hover:-translate-y-1',
        ],

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
