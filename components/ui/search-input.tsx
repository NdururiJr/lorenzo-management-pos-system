'use client';

import { forwardRef, useEffect, useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for the SearchInput component
 */
export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /**
   * Callback when search value changes (debounced)
   */
  onChange?: (value: string) => void;
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;
  /**
   * Whether search is in loading state
   */
  isLoading?: boolean;
  /**
   * Current value
   */
  value?: string;
  /**
   * Callback when clear button is clicked
   */
  onClear?: () => void;
}

/**
 * SearchInput component - search input with icon, debouncing, and clear button
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search orders..."
 *   isLoading={isSearching}
 * />
 * ```
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      onChange,
      debounceMs = 300,
      isLoading = false,
      value = '',
      onClear,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value);

    // Update internal state when external value changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Debounce the onChange callback
    useEffect(() => {
      const timer = setTimeout(() => {
        if (onChange && inputValue !== value) {
          onChange(inputValue);
        }
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [inputValue, debounceMs, onChange, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleClear = () => {
      setInputValue('');
      onChange?.('');
      onClear?.();
    };

    return (
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type="search"
          value={inputValue}
          onChange={handleChange}
          className={cn('pl-9 pr-9', className)}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-label="Searching" />
          ) : (
            inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-auto p-0 hover:bg-transparent"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            )
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
