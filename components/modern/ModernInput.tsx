'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';

interface ModernInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    containerClassName,
    id,
    ...props
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn('space-y-2', containerClassName)}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full',
              'rounded-2xl',
              'border-2',
              'bg-white/80',
              'backdrop-blur-sm',
              'px-4 py-3',
              'text-gray-900',
              'placeholder-gray-400',
              'transition-all',
              'duration-300',
              'hover:border-brand-blue/30',
              'focus:border-brand-blue',
              'focus:ring-4',
              'focus:ring-brand-blue/10',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
              'disabled:opacity-50',
              'disabled:hover:border-gray-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10',
              success && 'border-green-300 focus:border-green-500 focus:ring-green-500/10',
              !error && !success && 'border-gray-200',
              className
            )}
            {...props}
          />

          {rightIcon && !error && !success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}

          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
              <Check className="h-5 w-5" />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-red-600 flex items-center gap-1"
            >
              {error}
            </motion.p>
          )}

          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-green-600 flex items-center gap-1"
            >
              {success}
            </motion.p>
          )}

          {helperText && !error && !success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

ModernInput.displayName = 'ModernInput';

// Textarea variant
interface ModernTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  containerClassName?: string;
}

export const ModernTextarea = forwardRef<HTMLTextAreaElement, ModernTextareaProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    containerClassName,
    id,
    ...props
  }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn('space-y-2', containerClassName)}
      >
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              'w-full',
              'rounded-2xl',
              'border-2',
              'bg-white/80',
              'backdrop-blur-sm',
              'px-4 py-3',
              'text-gray-900',
              'placeholder-gray-400',
              'transition-all',
              'duration-300',
              'hover:border-brand-blue/30',
              'focus:border-brand-blue',
              'focus:ring-4',
              'focus:ring-brand-blue/10',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
              'disabled:opacity-50',
              'disabled:hover:border-gray-200',
              'resize-y',
              'min-h-[120px]',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10',
              success && 'border-green-300 focus:border-green-500 focus:ring-green-500/10',
              !error && !success && 'border-gray-200',
              className
            )}
            {...props}
          />
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}

          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-green-600"
            >
              {success}
            </motion.p>
          )}

          {helperText && !error && !success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

ModernTextarea.displayName = 'ModernTextarea';