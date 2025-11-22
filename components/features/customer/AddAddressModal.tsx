/**
 * Add Address Modal Component
 *
 * Enhanced modal for adding a new customer address with:
 * - Google Places autocomplete for address search
 * - Interactive map for location selection
 * - Visual marker for selected location
 *
 * @module components/features/customer/AddAddressModal
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddressAutocomplete } from '@/components/features/deliveries/AddressAutocomplete';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { addCustomerAddress } from '@/lib/db/customers';
import { toast } from 'sonner';
import { MapPin, Search, Navigation } from 'lucide-react';
import type { Address } from '@/lib/db/schema';
import type { Coordinates } from '@/services/google-maps';

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
  onSuccess: () => void;
}

const ADDRESS_LABELS = [
  { value: 'home', label: 'Home' },
  { value: 'office', label: 'Office' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

const libraries: ('places')[] = ['places'];

// Default center: Nairobi, Kenya
const DEFAULT_CENTER: Coordinates = {
  lat: -1.2864,
  lng: 36.8172,
};

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
  scrollwheel: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

export function AddAddressModal({
  open,
  onClose,
  customerId,
  onSuccess,
}: AddAddressModalProps) {
  const [label, setLabel] = useState('home');
  const [customLabel, setCustomLabel] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [inputMethod, setInputMethod] = useState<'search' | 'map'>('search');
  const [isSaving, setIsSaving] = useState(false);

  // Load Google Maps script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Handle address selection from autocomplete
  const handleAddressSelect = (selectedAddress: string, coords: Coordinates) => {
    setAddress(selectedAddress);
    setCoordinates(coords);
    setMapCenter(coords);
  };

  // Handle map click to select location
  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords: Coordinates = { lat, lng };

    setCoordinates(coords);
    setMapCenter(coords);

    // Reverse geocode to get address
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results[0]) {
        setAddress(response.results[0].formatted_address);
        toast.success('Location selected! Address updated.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Could not get address for this location');
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCoordinates(coords);
        setMapCenter(coords);

        // Reverse geocode to get address
        try {
          const geocoder = new google.maps.Geocoder();
          const response = await geocoder.geocode({ location: coords });

          if (response.results[0]) {
            setAddress(response.results[0].formatted_address);
            toast.success('Current location detected!');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Could not get your current location');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalLabel = label === 'other' ? customLabel : label;

    if (!finalLabel.trim() || !address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!coordinates) {
      toast.error('Please select a location on the map or search for an address');
      return;
    }

    try {
      setIsSaving(true);

      const newAddress: Omit<Address, 'id'> = {
        label: finalLabel.trim(),
        address: address.trim(),
        coordinates: coordinates,
        source: 'google_autocomplete',
      };

      await addCustomerAddress(customerId, newAddress);

      toast.success('Address added successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setLabel('home');
    setCustomLabel('');
    setAddress('');
    setCoordinates(null);
    setMapCenter(DEFAULT_CENTER);
    setInputMethod('search');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <form onSubmit={handleSubmit}>
          {/* Modern Header with Gradient */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark p-6 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold">Add New Address</div>
                  <DialogDescription className="text-white/80 text-sm font-normal mt-1">
                    Search for a location or select it on the map
                  </DialogDescription>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Label Selection with Icons */}
            <div className="space-y-3">
              <Label htmlFor="label" className="text-base font-semibold text-gray-900">
                Address Label
              </Label>
              <Select value={label} onValueChange={setLabel}>
                <SelectTrigger id="label" className="h-12 text-base border-2 hover:border-brand-blue transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_LABELS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base py-3">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Label (if Other is selected) */}
            {label === 'other' && (
              <div className="space-y-3">
                <Label htmlFor="customLabel" className="text-base font-semibold text-gray-900">
                  Custom Label
                </Label>
                <Input
                  id="customLabel"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g., Gym, Parents' House"
                  className="h-12 text-base border-2 hover:border-brand-blue transition-colors"
                  required
                />
              </div>
            )}

            {/* Modern Tabs */}
            <div className="space-y-4">
              <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'search' | 'map')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger
                    value="search"
                    className="flex items-center gap-2 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Search Address</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="map"
                    className="flex items-center gap-2 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">Select on Map</span>
                  </TabsTrigger>
                </TabsList>

                {/* Search Tab */}
                <TabsContent value="search" className="space-y-4 mt-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Search className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div className="flex-1">
                        <AddressAutocomplete
                          placeholder="Start typing to search for an address..."
                          value={address}
                          onAddressSelect={handleAddressSelect}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Show map preview if address is selected */}
                  {coordinates && isLoaded && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-gradient-to-r from-brand-blue to-transparent rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">Location Preview</span>
                        <div className="h-1 flex-1 bg-gradient-to-l from-brand-blue to-transparent rounded-full"></div>
                      </div>
                      <div className="border-2 border-brand-blue/30 rounded-xl overflow-hidden shadow-lg">
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '250px' }}
                          center={mapCenter}
                          zoom={15}
                          options={{
                            ...MAP_OPTIONS,
                            draggable: false,
                            scrollwheel: false,
                          }}
                        >
                          <Marker position={mapCenter} />
                        </GoogleMap>
                      </div>
                    </div>
                  )}
                </TabsContent>

              {/* Map Tab */}
              <TabsContent value="map" className="space-y-4 mt-6">
                {/* Instructions Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Select Your Location</p>
                        <p className="text-xs text-gray-600">Click anywhere on the map</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetCurrentLocation}
                      className="bg-white hover:bg-brand-blue hover:text-white border-2 border-brand-blue/20 transition-all h-10 px-4"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Use My Location
                    </Button>
                  </div>
                </div>

                {/* Map Container */}
                {isLoaded ? (
                  <div className="relative">
                    <div className="border-2 border-brand-blue rounded-xl overflow-hidden shadow-xl">
                      <GoogleMap
                        mapContainerStyle={{ ...MAP_CONTAINER_STYLE, height: '400px' }}
                        center={mapCenter}
                        zoom={13}
                        options={MAP_OPTIONS}
                        onClick={handleMapClick}
                      >
                        {coordinates && <Marker position={coordinates} />}
                      </GoogleMap>
                    </div>
                    {!coordinates && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-brand-blue/20">
                          <p className="text-sm font-medium text-gray-700">👆 Click on the map to select a location</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center space-y-3">
                      <div className="inline-flex h-16 w-16 rounded-full bg-white items-center justify-center shadow-md">
                        <MapPin className="h-8 w-8 text-brand-blue animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}

                {/* Display selected address */}
                {address && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs font-semibold text-green-800 uppercase tracking-wide">
                          Selected Address
                        </Label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              </Tabs>
            </div>

            {/* Coordinates Display (if selected) */}
            {coordinates && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                      GPS Coordinates
                    </Label>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Latitude:</span>
                        <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-purple-200">
                          {coordinates.lat.toFixed(6)}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Longitude:</span>
                        <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-purple-200">
                          {coordinates.lng.toFixed(6)}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modern Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
                className="h-12 px-6 text-base border-2 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !coordinates}
                className="h-12 px-8 text-base bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-brand-blue-dark hover:to-brand-blue shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Address...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>Add Address</span>
                  </div>
                )}
              </Button>
            </div>
            {!coordinates && (
              <p className="text-xs text-center text-gray-500 mt-3">
                Please select a location to continue
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
