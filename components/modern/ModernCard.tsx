'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  delay?: number;
}

export const ModernCard = forwardRef<HTMLDivElement, ModernCardProps>(
  ({
    children,
    className = '',
    noPadding = false,
    hover = true,
    glowIntensity = 'low',
    delay = 0,
    ...props
  }, ref) => {
    const glowStyles = {
      low: 'hover:shadow-glow-teal/10',
      medium: 'hover:shadow-glow-teal/20',
      high: 'hover:shadow-glow-teal/30'
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay,
          ease: "easeOut"
        }}
        whileHover={hover ? { scale: 1.02 } : undefined}
        className={cn(
          'relative',
          'bg-white/70',
          'backdrop-blur-xl',
          'border-2',
          'border-lorenzo-teal/10',
          'rounded-3xl',
          'shadow-card',
          hover && glowStyles[glowIntensity],
          'transition-all',
          'duration-300',
          !noPadding && 'p-6',
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-lorenzo-teal/5 via-transparent to-lorenzo-cream/5 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

ModernCard.displayName = 'ModernCard';

// Export variants for specific use cases
export const ModernCardHeader = ({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(
      'px-6 py-4 border-b border-lorenzo-teal/10',
      className
    )}>
      {children}
    </div>
  );
};

export const ModernCardContent = ({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
};

export const ModernCardFooter = ({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(
      'px-6 py-4 border-t border-lorenzo-teal/10',
      className
    )}>
      {children}
    </div>
  );
};