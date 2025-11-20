'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FloatingOrbs } from '@/components/auth/FloatingOrbs';

interface ModernLayoutProps {
  children: ReactNode;
  className?: string;
  showOrbs?: boolean;
  variant?: 'default' | 'subtle' | 'vibrant' | 'dark';
  contentClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  noPadding?: boolean;
}

export function ModernLayout({
  children,
  className = '',
  showOrbs = true,
  variant = 'default',
  contentClassName = '',
  maxWidth = '7xl',
  noPadding = false
}: ModernLayoutProps) {
  const gradients = {
    default: 'bg-gradient-to-br from-brand-blue-100 via-white to-brand-blue-50',
    subtle: 'bg-gradient-to-br from-gray-50 via-white to-brand-blue-50',
    vibrant: 'bg-gradient-to-br from-brand-blue via-brand-blue-100 to-white',
    dark: 'bg-gradient-to-br from-gray-900 via-brand-blue-dark to-gray-800'
  };

  const overlays = {
    default: 'bg-gradient-to-t from-brand-blue/5 via-transparent to-white/50',
    subtle: 'bg-gradient-to-t from-transparent via-transparent to-white/30',
    vibrant: 'bg-gradient-to-t from-brand-blue/10 via-transparent to-white/70',
    dark: 'bg-gradient-to-t from-black/20 via-transparent to-brand-blue-dark/10'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Gradient Background */}
      <div className={cn('absolute inset-0', gradients[variant])} />

      {/* Additional gradient overlay for depth */}
      <div className={cn('absolute inset-0', overlays[variant])} />

      {/* Floating decorative orbs */}
      {showOrbs && <FloatingOrbs />}

      {/* Top decorative blur */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent" />

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-blue/10 to-transparent" />

      {/* Content Container */}
      <div className={cn(
        'relative z-10 min-h-screen',
        !noPadding && 'px-4 py-8 sm:px-6 lg:px-8',
        contentClassName
      )}>
        <div className={cn('mx-auto', maxWidthClasses[maxWidth])}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Page wrapper with animations
interface ModernPageWrapperProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function ModernPageWrapper({
  children,
  className = '',
  animate = true
}: ModernPageWrapperProps) {
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={className}>{children}</div>;
}

// Section wrapper with consistent spacing
interface ModernSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  animate?: boolean;
  delay?: number;
}

export function ModernSection({
  children,
  className = '',
  title,
  description,
  animate = true,
  delay = 0
}: ModernSectionProps) {
  const content = (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        {content}
      </motion.section>
    );
  }

  return <section>{content}</section>;
}

// Grid layout for cards
interface ModernGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ModernGrid({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}: ModernGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}