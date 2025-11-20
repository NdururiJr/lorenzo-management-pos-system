'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: ReactNode;
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'relative font-semibold transition-all duration-300 rounded-full inline-flex items-center justify-center';

    const variants = {
      primary: 'bg-brand-blue text-white hover:bg-brand-blue-dark shadow-glow-blue hover:shadow-glow-blue-intense hover:scale-105 active:scale-100',
      secondary: 'bg-white/80 backdrop-blur-sm text-brand-blue border-2 border-brand-blue/20 hover:border-brand-blue/40 hover:bg-brand-blue/10 hover:scale-105 active:scale-100',
      ghost: 'bg-transparent text-brand-blue hover:bg-brand-blue/10 hover:scale-105 active:scale-100'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isDisabled && 'opacity-60 cursor-not-allowed hover:scale-100',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30"
          />
        )}
        <span className={cn(isLoading && 'opacity-0')}>
          {children}
        </span>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </motion.button>
    );
  }
);

AuthButton.displayName = 'AuthButton';