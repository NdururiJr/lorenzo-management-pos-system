'use client';

import { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Props for the PhoneInput component
 */
export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /**
   * Callback when phone number changes (returns formatted value)
   */
  onChange?: (value: string) => void;
  /**
   * Current value
   */
  value?: string;
  /**
   * Whether to show validation indicator
   */
  showValidation?: boolean;
}

/**
 * Format phone number for Kenya (+254...)
 */
function formatKenyaPhone(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // If starts with 254, keep it
  // If starts with 0, replace with 254
  // Otherwise, prepend 254
  let formattedDigits = digits;
  if (digits.startsWith('254')) {
    formattedDigits = digits;
  } else if (digits.startsWith('0')) {
    formattedDigits = '254' + digits.slice(1);
  } else if (digits.length > 0) {
    formattedDigits = '254' + digits;
  }

  // Format as +254 XXX XXX XXX
  if (formattedDigits.length <= 3) {
    return formattedDigits ? `+${formattedDigits}` : '';
  } else if (formattedDigits.length <= 6) {
    return `+${formattedDigits.slice(0, 3)} ${formattedDigits.slice(3)}`;
  } else if (formattedDigits.length <= 9) {
    return `+${formattedDigits.slice(0, 3)} ${formattedDigits.slice(3, 6)} ${formattedDigits.slice(6)}`;
  } else {
    return `+${formattedDigits.slice(0, 3)} ${formattedDigits.slice(3, 6)} ${formattedDigits.slice(6, 9)} ${formattedDigits.slice(9, 12)}`;
  }
}

/**
 * Validate Kenya phone number
 */
function isValidKenyaPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('254') && digits.length === 12;
}

/**
 * PhoneInput component - Kenya phone number input with auto-formatting
 *
 * @example
 * ```tsx
 * <PhoneInput
 *   value={phone}
 *   onChange={setPhone}
 *   showValidation
 *   placeholder="+254 XXX XXX XXX"
 * />
 * ```
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, value = '', showValidation = false, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatKenyaPhone(value));
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
      setDisplayValue(formatKenyaPhone(value));
      setIsValid(isValidKenyaPhone(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatKenyaPhone(inputValue);

      setDisplayValue(formatted);
      setIsValid(isValidKenyaPhone(formatted));

      // Return just the digits for the actual value
      const digits = formatted.replace(/\D/g, '');
      onChange?.(digits);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          className={cn(
            showValidation && displayValue && (isValid ? 'border-green-500' : 'border-red-500'),
            className
          )}
          placeholder="+254 XXX XXX XXX"
          {...props}
        />
        {showValidation && displayValue && (
          <div
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full',
              isValid ? 'bg-green-500' : 'bg-red-500'
            )}
            aria-label={isValid ? 'Valid phone number' : 'Invalid phone number'}
          />
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
