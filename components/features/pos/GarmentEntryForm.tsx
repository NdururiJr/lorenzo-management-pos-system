/**
 * Garment Entry Form Component
 *
 * Form for adding garment details to an order.
 * Includes garment type, color, services, pricing, and photos.
 *
 * @module components/features/pos/GarmentEntryForm
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Garment category type (V2.0)
 */
type GarmentCategory = 'Adult' | 'Children';

const garmentSchema = z.object({
  type: z.string().min(1, 'Garment type is required'),
  color: z.string().min(1, 'Color is required'),
  // V2.0: Brand is now mandatory
  brand: z.string().min(1, 'Brand is required (use "No Brand" if unknown)'),
  // V2.0: Flag for "No Brand" checkbox - required boolean, defaulted in form
  noBrand: z.boolean(),
  // V2.0: Category is mandatory
  category: z.enum(['Adult', 'Children'], {
    errorMap: () => ({ message: 'Category is required' }),
  }),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  specialInstructions: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

type GarmentFormData = z.infer<typeof garmentSchema>;

/**
 * Service definition with pricing key for catalog lookup
 */
interface Service {
  id: string;
  name: string;
  pricingKey: 'dryClean' | 'pressing' | 'laundry' | 'repairs' | null;
  isFree?: boolean; // For Express service
}

const GARMENT_TYPES = [
  'Shirt',
  'Pants',
  'Dress',
  'Suit',
  'Jacket',
  'Skirt',
  'Blouse',
  'Coat',
  'Tie',
  'Scarf',
  'Bedding',
  'Curtains',
  'Other',
];

/**
 * Available services - prices come from the service catalog pricing object
 */
const SERVICES: Service[] = [
  { id: 'dry-clean', name: 'Dry Cleaning', pricingKey: 'dryClean' },
  { id: 'pressing', name: 'Pressing Only', pricingKey: 'pressing' },
  { id: 'laundry', name: 'Laundry', pricingKey: 'laundry' },
  { id: 'repairs', name: 'Repairs & Alterations', pricingKey: 'repairs' },
  { id: 'express', name: 'Express (2hrs)', pricingKey: null, isFree: true },
];

/**
 * Pre-fill data from a service card selection
 * Uses the new multi-service pricing structure
 */
export interface PrefillData {
  type: string;
  pricing: {
    dryClean?: number;
    pressing?: number;
    laundry?: number;
    repairs?: number;
  };
  serviceName?: string;
  icon?: string;
}

/**
 * Garment data passed to parent with price and icon
 */
export interface GarmentEntryData extends GarmentFormData {
  price: number;
  icon?: string;
}

interface GarmentEntryFormProps {
  onAddGarment: (garment: GarmentEntryData) => void;
  onCancel?: () => void;
  prefillData?: PrefillData | null;
  onPrefillApplied?: () => void;
  className?: string;
}

export function GarmentEntryForm({
  onAddGarment,
  onCancel,
  prefillData,
  onPrefillApplied,
  className,
}: GarmentEntryFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [prefillPricing, setPrefillPricing] = useState<PrefillData['pricing'] | null>(null);
  const [prefillIcon, setPrefillIcon] = useState<string | undefined>(undefined);

  const [noBrandChecked, setNoBrandChecked] = useState(false);

  const form = useForm<GarmentFormData>({
    resolver: zodResolver(garmentSchema),
    defaultValues: {
      type: '',
      color: '',
      brand: '',
      noBrand: false,
      category: undefined as unknown as GarmentCategory, // V2.0: Category is mandatory
      services: [],
      specialInstructions: '',
      photos: [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const watchType = watch('type');
  const watchCategory = watch('category');
  const watchBrand = watch('brand');

  // Handle "No Brand" checkbox toggle
  const handleNoBrandToggle = (checked: boolean) => {
    setNoBrandChecked(checked);
    setValue('noBrand', checked);
    if (checked) {
      setValue('brand', 'No Brand');
    } else {
      setValue('brand', '');
    }
  };

  // Effect to apply prefill data when a service card is selected
  useEffect(() => {
    if (prefillData) {
      // Set the garment type
      setValue('type', prefillData.type);

      // Store the pricing object from the catalog
      setPrefillPricing(prefillData.pricing);

      // Auto-select the first available service based on pricing
      const availableServiceIds: string[] = [];
      if (prefillData.pricing.dryClean) availableServiceIds.push('dry-clean');
      else if (prefillData.pricing.pressing) availableServiceIds.push('pressing');
      else if (prefillData.pricing.laundry) availableServiceIds.push('laundry');
      else if (prefillData.pricing.repairs) availableServiceIds.push('repairs');

      // Only auto-select dry-clean as default if available
      const defaultServices = prefillData.pricing.dryClean ? ['dry-clean'] : availableServiceIds.slice(0, 1);
      setSelectedServices(defaultServices);
      setValue('services', defaultServices);

      // Store the icon for the cart item
      setPrefillIcon(prefillData.icon);

      // Notify parent that prefill has been applied
      if (onPrefillApplied) {
        onPrefillApplied();
      }
    }
  }, [prefillData, setValue, onPrefillApplied]);

  // Calculate total price based on selected services and catalog pricing
  // Prices come from the prefill pricing object (from service catalog)
  // Multiple services can be selected and their prices sum up
  // Note: Express (2hrs) is FREE - no price impact
  const calculatePrice = () => {
    if (!prefillPricing) {
      // No catalog item selected - return 0 (user must select from catalog)
      return 0;
    }

    let totalPrice = 0;

    selectedServices.forEach((serviceId) => {
      const service = SERVICES.find((s) => s.id === serviceId);
      if (service && service.pricingKey && prefillPricing[service.pricingKey]) {
        totalPrice += prefillPricing[service.pricingKey]!;
      }
      // Express is free (pricingKey is null), so it adds 0
    });

    return Math.round(totalPrice);
  };

  const totalPrice = calculatePrice();

  const handleServiceToggle = (serviceId: string) => {
    // When using catalog pricing, allow toggling any available service
    // Users can select multiple services and prices sum up
    // Express is always toggleable (it's free)
    if (prefillPricing !== null && serviceId !== 'express') {
      // Check if this service is available in the pricing
      const service = SERVICES.find((s) => s.id === serviceId);
      if (service && service.pricingKey && !prefillPricing[service.pricingKey]) {
        return; // Service not available for this item
      }
    }

    const updated = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(updated);
    setValue('services', updated);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    // Simulate upload (replace with actual upload logic)
    setTimeout(() => {
      const newPhotos = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      const updated = [...photos, ...newPhotos].slice(0, 5); // Max 5 photos
      setPhotos(updated);
      setValue('photos', updated);
      setIsUploading(false);
    }, 1000);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    setValue('photos', updated);
  };

  const onSubmit = (data: GarmentFormData) => {
    onAddGarment({ ...data, price: totalPrice, icon: prefillIcon });

    // Reset form
    form.reset();
    setSelectedServices([]);
    setPhotos([]);
    setPrefillPricing(null);
    setPrefillIcon(undefined);
    setNoBrandChecked(false); // V2.0: Reset "No Brand" checkbox
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-lorenzo-dark-teal mb-6">Add Garment</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Garment Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-black">
              Garment Type *
            </Label>
            <Select
              value={watchType}
              onValueChange={(value) => setValue('type', value)}
            >
              <SelectTrigger className="h-10 border-gray-300 focus:border-lorenzo-teal focus:ring-lorenzo-teal/20">
                <SelectValue placeholder="Select garment type" />
              </SelectTrigger>
              <SelectContent>
                {GARMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className="text-black">
              Color *
            </Label>
            <Input
              id="color"
              placeholder="e.g., White, Blue, Black"
              className="border-gray-300 focus:border-lorenzo-teal focus:ring-lorenzo-teal/20"
              {...register('color')}
            />
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          {/* Brand (V2.0: Mandatory) */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-black">
              Brand *
            </Label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Input
                  id="brand"
                  placeholder="e.g., Nike, Gucci"
                  className="border-gray-300 focus:border-lorenzo-teal focus:ring-lorenzo-teal/20"
                  disabled={noBrandChecked}
                  {...register('brand')}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="noBrand"
                  checked={noBrandChecked}
                  onCheckedChange={(checked) => handleNoBrandToggle(checked === true)}
                  className="border-gray-300 data-[state=checked]:bg-lorenzo-teal data-[state=checked]:border-lorenzo-teal"
                />
                <Label htmlFor="noBrand" className="text-sm text-gray-600 cursor-pointer whitespace-nowrap">
                  No Brand
                </Label>
              </div>
            </div>
            {errors.brand && (
              <p className="text-sm text-red-600">{errors.brand.message}</p>
            )}
          </div>

          {/* Category (V2.0: Mandatory) */}
          <div className="space-y-2">
            <Label className="text-black">Category *</Label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                watchCategory === 'Adult'
                  ? 'border-lorenzo-teal bg-lorenzo-teal/5'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="Adult"
                  {...register('category')}
                  className="w-4 h-4 text-lorenzo-teal focus:ring-lorenzo-teal"
                />
                <span className="text-sm font-medium">Adult</span>
              </label>
              <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                watchCategory === 'Children'
                  ? 'border-lorenzo-teal bg-lorenzo-teal/5'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="Children"
                  {...register('category')}
                  className="w-4 h-4 text-lorenzo-teal focus:ring-lorenzo-teal"
                />
                <span className="text-sm font-medium">Children</span>
              </label>
            </div>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label className="text-black">Services *</Label>

            {/* When using catalog pricing, show services with actual prices from catalog */}
            {prefillPricing !== null ? (
              <div className="space-y-2">
                {/* Core services - show available ones with prices */}
                {SERVICES.filter((s) => s.pricingKey !== null).map((service) => {
                  const price = service.pricingKey ? prefillPricing[service.pricingKey] : 0;
                  const isAvailable = price && price > 0;
                  const isSelected = selectedServices.includes(service.id);

                  return (
                    <div
                      key={service.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isAvailable
                          ? isSelected
                            ? 'border-lorenzo-teal bg-lorenzo-teal/5'
                            : 'border-gray-200 hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={service.id}
                          checked={isSelected}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          disabled={!isAvailable}
                          className="border-gray-300 data-[state=checked]:bg-lorenzo-teal data-[state=checked]:border-lorenzo-teal"
                        />
                        <Label
                          htmlFor={service.id}
                          className={`text-sm font-medium cursor-pointer ${
                            isAvailable ? 'text-black' : 'text-gray-400'
                          }`}
                        >
                          {service.name}
                        </Label>
                      </div>
                      <span className={`text-sm font-semibold ${
                        isAvailable ? 'text-lorenzo-deep-teal' : 'text-gray-400'
                      }`}>
                        {isAvailable ? `KES ${price!.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  );
                })}

                {/* Express toggle - always available and FREE */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-lorenzo-accent-teal/30 bg-lorenzo-accent-teal/5">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="express"
                      checked={selectedServices.includes('express')}
                      onCheckedChange={() => handleServiceToggle('express')}
                      className="border-lorenzo-accent-teal data-[state=checked]:bg-lorenzo-accent-teal data-[state=checked]:border-lorenzo-accent-teal"
                    />
                    <Label
                      htmlFor="express"
                      className="text-sm font-medium text-lorenzo-dark-teal cursor-pointer"
                    >
                      Express (2hrs)
                    </Label>
                  </div>
                  <span className="text-sm font-semibold text-green-600">FREE</span>
                </div>

                {/* Pricing breakdown */}
                {selectedServices.filter((id) => id !== 'express').length > 0 && (
                  <div className="p-3 rounded-lg bg-gray-50 text-sm space-y-1 mt-3">
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">Price Breakdown</div>
                    {selectedServices
                      .filter((id) => id !== 'express')
                      .map((serviceId) => {
                        const service = SERVICES.find((s) => s.id === serviceId);
                        const price = service?.pricingKey ? prefillPricing[service.pricingKey] : 0;
                        return (
                          <div key={serviceId} className="flex justify-between text-gray-600">
                            <span>{service?.name}:</span>
                            <span>KES {price?.toLocaleString() || 0}</span>
                          </div>
                        );
                      })}
                    {selectedServices.includes('express') && (
                      <div className="flex justify-between text-green-600">
                        <span>Express (2hrs):</span>
                        <span>FREE</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lorenzo-deep-teal pt-2 border-t border-gray-200 mt-2">
                      <span>Total:</span>
                      <span>KES {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* No catalog item selected - prompt user to select from catalog */
              <div className="p-4 rounded-lg bg-lorenzo-cream/50 border border-lorenzo-teal/10 text-center">
                <p className="text-sm text-gray-600">
                  Select a garment from the catalog to see available services and prices.
                </p>
              </div>
            )}
            {errors.services && (
              <p className="text-sm text-red-600">{errors.services.message}</p>
            )}
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions" className="text-gray-700">
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any special care instructions..."
              rows={3}
              className="border-gray-300 focus:border-lorenzo-teal focus:ring-lorenzo-teal/20 resize-none"
              {...register('specialInstructions')}
            />
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <Label className="text-gray-700">Photos (Optional)</Label>

            {/* Photo Grid */}
            <div className="grid grid-cols-5 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={photo}
                    alt={`Garment ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {photos.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-lorenzo-teal hover:bg-lorenzo-cream transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Upload</span>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload up to 5 photos (max 5MB each)
            </p>
          </div>

          {/* Total Price */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-lorenzo-dark-teal">Total:</span>
              <span className="text-2xl font-bold text-lorenzo-deep-teal">
                KES {totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={selectedServices.length === 0}
                className="flex-1 h-11 bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add to Order
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-6 h-11 border-gray-300 hover:bg-gray-50"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}
