/**
 * Address Autocomplete Component
 *
 * Google Places autocomplete for address input.
 * Provides real-time address suggestions as user types.
 *
 * @module components/features/deliveries/AddressAutocomplete
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Coordinates } from '@/services/google-maps';

const libraries: ('places')[] = ['places'];

interface AddressAutocompleteProps {
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Initial value */
  value?: string;
  /** Callback when address is selected */
  onAddressSelect: (address: string, coordinates: Coordinates) => void;
  /** Custom className */
  className?: string;
  /** Whether field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Restrict results to specific country (default: 'ke' for Kenya) */
  country?: string;
}

export function AddressAutocomplete({
  label,
  placeholder = 'Enter delivery address...',
  value = '',
  onAddressSelect,
  className,
  required = false,
  error,
  country = 'ke',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  // Load Google Maps script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Create autocomplete instance
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: country },
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      types: ['address'],
    });

    autocompleteRef.current = autocomplete;

    // Listen for place selection
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name || '';
        const coordinates: Coordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setInputValue(address);
        onAddressSelect(address, coordinates);
      }
    });

    // Cleanup
    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [isLoaded, country, onAddressSelect]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {label}
          {required && <span className="text-red-600">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            'pl-10 border-gray-300 focus:border-black',
            error && 'border-red-500 focus:border-red-500'
          )}
          disabled={!isLoaded}
        />

        {/* Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {!isLoaded ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Helper text */}
      {!error && (
        <p className="text-xs text-gray-500">
          Start typing to see address suggestions
        </p>
      )}
    </div>
  );
}
