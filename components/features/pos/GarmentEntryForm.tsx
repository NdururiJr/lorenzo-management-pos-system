/**
 * Garment Entry Form Component
 *
 * Form for adding garment details to an order.
 * Includes garment type, color, services, pricing, and photos.
 *
 * @module components/features/pos/GarmentEntryForm
 */

'use client';

import { useState } from 'react';
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

const garmentSchema = z.object({
  type: z.string().min(1, 'Garment type is required'),
  color: z.string().min(1, 'Color is required'),
  brand: z.string().optional(),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  specialInstructions: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

type GarmentFormData = z.infer<typeof garmentSchema>;

interface Service {
  id: string;
  name: string;
  price: number;
  isPercentage?: boolean;
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

const SERVICES: Service[] = [
  { id: 'wash', name: 'Wash', price: 100 },
  { id: 'iron', name: 'Iron', price: 50 },
  { id: 'starch', name: 'Starch', price: 30 },
  { id: 'dry-clean', name: 'Dry Clean', price: 200 },
  { id: 'express', name: 'Express (24h)', price: 50, isPercentage: true },
];

interface GarmentEntryFormProps {
  onAddGarment: (garment: GarmentFormData & { price: number }) => void;
  onCancel?: () => void;
  className?: string;
}

export function GarmentEntryForm({
  onAddGarment,
  onCancel,
  className,
}: GarmentEntryFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<GarmentFormData>({
    resolver: zodResolver(garmentSchema),
    defaultValues: {
      type: '',
      color: '',
      brand: '',
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

  // Calculate total price
  const calculatePrice = () => {
    let basePrice = 0;
    let percentageAddOn = 0;

    selectedServices.forEach((serviceId) => {
      const service = SERVICES.find((s) => s.id === serviceId);
      if (service) {
        if (service.isPercentage) {
          percentageAddOn += service.price;
        } else {
          basePrice += service.price;
        }
      }
    });

    const total = basePrice + (basePrice * percentageAddOn) / 100;
    return Math.round(total);
  };

  const totalPrice = calculatePrice();

  const handleServiceToggle = (serviceId: string) => {
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
    onAddGarment({ ...data, price: totalPrice });

    // Reset form
    form.reset();
    setSelectedServices([]);
    setPhotos([]);
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-black mb-6">Add Garment</h2>

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
              <SelectTrigger className="h-10 border-gray-300 focus:border-black">
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
              className="border-gray-300 focus:border-black"
              {...register('color')}
            />
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          {/* Brand (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-gray-700">
              Brand (Optional)
            </Label>
            <Input
              id="brand"
              placeholder="e.g., Nike, Gucci"
              className="border-gray-300 focus:border-black"
              {...register('brand')}
            />
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label className="text-black">Services *</Label>
            <div className="space-y-2">
              {SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                      className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Label
                      htmlFor={service.id}
                      className="text-sm font-medium text-black cursor-pointer"
                    >
                      {service.name}
                    </Label>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {service.isPercentage
                      ? `+${service.price}%`
                      : `KES ${service.price}`}
                  </span>
                </div>
              ))}
            </div>
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
              className="border-gray-300 focus:border-black resize-none"
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
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-colors">
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
              <span className="text-lg font-semibold text-black">Total:</span>
              <span className="text-2xl font-bold text-black">
                KES {totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={selectedServices.length === 0}
                className="flex-1 h-11 bg-brand-blue hover:bg-brand-blue-dark text-white"
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
