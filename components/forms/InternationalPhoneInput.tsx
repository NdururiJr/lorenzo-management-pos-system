/**
 * International Phone Input Component (FR-014)
 *
 * A phone input component that supports international phone numbers
 * with country code selection and real-time validation.
 *
 * @module components/forms/InternationalPhoneInput
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, AlertCircle, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  validatePhoneNumber,
  SUPPORTED_COUNTRIES,
  type PhoneValidationResult,
} from '@/lib/utils/phone-validator';
import type { CountryCode } from 'libphonenumber-js';

// ============================================
// TYPES
// ============================================

export interface InternationalPhoneInputProps {
  /** Current phone value */
  value: string;
  /** Change handler - returns E.164 formatted number */
  onChange: (value: string, validation: PhoneValidationResult) => void;
  /** Default country code */
  defaultCountry?: CountryCode;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional class name */
  className?: string;
  /** Whether to show validation status */
  showValidation?: boolean;
  /** Whether to show country selector */
  showCountrySelector?: boolean;
  /** ID for the input element */
  id?: string;
}

// ============================================
// COMPONENT
// ============================================

export function InternationalPhoneInput({
  value,
  onChange,
  defaultCountry = 'KE',
  label = 'Phone Number',
  placeholder = 'Enter phone number',
  required = false,
  disabled = false,
  error,
  className,
  showValidation = true,
  showCountrySelector = true,
  id = 'phone',
}: InternationalPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const [localValue, setLocalValue] = useState(value);
  const [validation, setValidation] = useState<PhoneValidationResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Get country info
  const selectedCountryInfo = SUPPORTED_COUNTRIES.find(
    (c) => c.code === selectedCountry
  );

  // Validate phone on value change
  const validatePhone = useCallback(
    (phone: string, country: CountryCode) => {
      if (!phone || phone.length < 6) {
        setValidation(null);
        return;
      }

      const result = validatePhoneNumber(phone, country);
      setValidation(result);

      // Update country if detected from phone
      if (result.valid && result.country && result.country !== country) {
        setSelectedCountry(result.country);
      }
    },
    []
  );

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    validatePhone(newValue, selectedCountry);
  };

  // Handle country change
  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry as CountryCode);
    validatePhone(localValue, newCountry as CountryCode);
  };

  // Propagate changes to parent
  useEffect(() => {
    if (validation) {
      onChange(validation.e164 || localValue, validation);
    } else {
      onChange(localValue, { valid: false, error: 'Phone number not validated' });
    }
  }, [localValue, validation, onChange]);

  // Initialize from value prop
  useEffect(() => {
    if (value && value !== localValue) {
      setLocalValue(value);
      validatePhone(value, selectedCountry);
    }
  }, [value]);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="flex gap-2">
        {/* Country Selector */}
        {showCountrySelector && (
          <Select
            value={selectedCountry}
            onValueChange={handleCountryChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{selectedCountryInfo?.callingCode || '+254'}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-2">
                    <span className="w-12">{country.callingCode}</span>
                    <span className="text-gray-500">{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Phone Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id={id}
            type="tel"
            value={localValue}
            onChange={handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pl-10 pr-10',
              error && 'border-red-500 focus-visible:ring-red-500',
              validation?.valid && !error && 'border-green-500 focus-visible:ring-green-500'
            )}
          />

          {/* Validation indicator */}
          {showValidation && localValue && localValue.length >= 6 && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {validation?.valid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Formatted display */}
      {validation?.valid && validation.formatted && isFocused && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Check className="h-3 w-3" />
          {validation.formatted}
          {validation.country && ` (${validation.country})`}
        </p>
      )}

      {/* Error message */}
      {(error || (validation && !validation.valid && localValue.length >= 6)) && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error || validation?.error || 'Invalid phone number'}
        </p>
      )}

      {/* Country hint */}
      {showCountrySelector && !validation?.valid && localValue.length < 6 && (
        <p className="text-xs text-gray-500">
          Select country and enter phone number without leading zero
        </p>
      )}
    </div>
  );
}

// ============================================
// SIMPLE VERSION (WITHOUT COUNTRY SELECTOR)
// ============================================

export interface SimplePhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

/**
 * Simple phone input that assumes Kenya by default
 * but accepts international numbers with country code
 */
export function SimplePhoneInput({
  value,
  onChange,
  label = 'Phone Number',
  placeholder = '+254 7XX XXX XXX',
  required = false,
  disabled = false,
  error,
  className,
  id = 'phone',
}: SimplePhoneInputProps) {
  const [validation, setValidation] = useState<PhoneValidationResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Validate if has enough digits
    if (newValue.length >= 10) {
      const result = validatePhoneNumber(newValue, 'KE');
      setValidation(result);
    } else {
      setValidation(null);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Phone className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          id={id}
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-10 pr-10',
            error && 'border-red-500',
            validation?.valid && !error && 'border-green-500'
          )}
        />
        {validation && value.length >= 10 && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {validation.valid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {validation?.valid && validation.formatted && (
        <p className="text-xs text-green-600">{validation.formatted}</p>
      )}
    </div>
  );
}

export default InternationalPhoneInput;
