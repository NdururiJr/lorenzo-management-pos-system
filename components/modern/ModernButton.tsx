'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ModernButtonProps extends Omit<HTMLMotionProps<"button">, "children" | "type"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    disabled,
    type = 'button',
    ...props
  }, ref) => {
    const baseStyles = 'relative font-semibold transition-all duration-300 rounded-full inline-flex items-center justify-center gap-2';

    const variants = {
      primary: `
        bg-gradient-to-r from-lorenzo-accent-teal to-lorenzo-light-teal
        text-lorenzo-dark-teal
        shadow-glow-teal
        hover:shadow-glow-teal
        hover:from-lorenzo-light-teal hover:to-lorenzo-teal
        active:scale-95
      `,
      secondary: `
        bg-white/80
        backdrop-blur-sm
        text-lorenzo-teal
        border-2 border-lorenzo-teal/20
        hover:border-lorenzo-accent-teal/40
        hover:bg-lorenzo-teal/10
        hover:shadow-glow-teal/20
        active:scale-95
      `,
      ghost: `
        bg-transparent
        text-lorenzo-teal
        hover:bg-lorenzo-teal/10
        hover:shadow-sm
        active:scale-95
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600
        text-white
        shadow-lg shadow-red-500/20
        hover:shadow-xl hover:shadow-red-500/30
        hover:from-red-600 hover:to-red-700
        active:scale-95
      `,
      success: `
        bg-gradient-to-r from-green-500 to-green-600
        text-white
        shadow-lg shadow-green-500/20
        hover:shadow-xl hover:shadow-green-500/30
        hover:from-green-600 hover:to-green-700
        active:scale-95
      `
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={!isDisabled ? { scale: 1.05 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-60 cursor-not-allowed hover:scale-100',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm" />
        )}

        {/* Content */}
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!isLoading && leftIcon}
        <span className={cn(isLoading && 'opacity-0')}>
          {children}
        </span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

ModernButton.displayName = 'ModernButton';

// Icon button variant
export const ModernIconButton = forwardRef<HTMLButtonElement, Omit<ModernButtonProps, 'children'> & {
  icon: ReactNode;
  label: string;
}>(
  ({ icon, label, className, size = 'md', ...props }, ref) => {
    const iconSizes = {
      sm: 'p-1.5',
      md: 'p-2.5',
      lg: 'p-3',
      xl: 'p-4'
    };

    return (
      <ModernButton
        ref={ref}
        size={size}
        className={cn(
          iconSizes[size],
          'aspect-square',
          className
        )}
        aria-label={label}
        {...props}
      >
        {icon}
      </ModernButton>
    );
  }
);

ModernIconButton.displayName = 'ModernIconButton';