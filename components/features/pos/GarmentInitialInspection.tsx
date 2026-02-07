/**
 * Garment Initial Inspection Component
 *
 * Optional inspection component for POS to record notable damages
 * when receiving garments from customers (Stage 1 inspection).
 *
 * @module components/features/pos/GarmentInitialInspection
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Camera, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GarmentInitialInspectionProps {
  garmentId: string;
  garmentType: string;
  garmentColor: string;
  value: {
    hasNotableDamage: boolean;
    initialInspectionNotes: string;
    initialInspectionPhotos: string[];
  };
  onChange: (data: {
    hasNotableDamage: boolean;
    initialInspectionNotes: string;
    initialInspectionPhotos: string[];
  }) => void;
}

export function GarmentInitialInspection({
  garmentId,
  garmentType,
  garmentColor,
  value,
  onChange,
}: GarmentInitialInspectionProps) {
  const [isExpanded, setIsExpanded] = useState(value.hasNotableDamage);

  const handleDamageCheckChange = (checked: boolean) => {
    setIsExpanded(checked);
    onChange({
      hasNotableDamage: checked,
      initialInspectionNotes: checked ? value.initialInspectionNotes : '',
      initialInspectionPhotos: checked ? value.initialInspectionPhotos : [],
    });
  };

  const handleNotesChange = (notes: string) => {
    onChange({
      ...value,
      initialInspectionNotes: notes,
    });
  };

  const handlePhotoAdd = (photoUrl: string) => {
    if (value.initialInspectionPhotos.length < 3) {
      onChange({
        ...value,
        initialInspectionPhotos: [...value.initialInspectionPhotos, photoUrl],
      });
    }
  };

  const handlePhotoRemove = (index: number) => {
    const newPhotos = value.initialInspectionPhotos.filter((_, i) => i !== index);
    onChange({
      ...value,
      initialInspectionPhotos: newPhotos,
    });
  };

  // Placeholder for photo upload - will be implemented with Firebase Storage
  const handlePhotoUpload = () => {
    // TODO: Implement photo upload to Firebase Storage
    // For now, just add a placeholder
    const placeholderUrl = `https://via.placeholder.com/150?text=Photo+${value.initialInspectionPhotos.length + 1}`;
    handlePhotoAdd(placeholderUrl);
  };

  return (
    <Card className="border-l-4 border-l-lorenzo-gold">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-lorenzo-gold" />
            <CardTitle className="text-base">
              Initial Inspection
              <Badge variant="secondary" className="ml-2 text-xs">
                Optional
              </Badge>
            </CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {garmentType} - {garmentColor}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Notable Damage Checkbox */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id={`damage-${garmentId}`}
            checked={value.hasNotableDamage}
            onCheckedChange={(checked) => handleDamageCheckChange(checked === true)}
          />
          <div className="flex-1">
            <Label
              htmlFor={`damage-${garmentId}`}
              className="text-sm font-medium cursor-pointer"
            >
              Has Notable Damage
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Check if garment has visible stains, rips, missing buttons, or other damage
            </p>
          </div>
        </div>

        {/* Expanded Section - only shown when damage is checked */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Information Alert */}
            <Alert>
              <AlertDescription className="text-xs">
                Record any notable damage now. A detailed inspection will be done at the
                workstation.
              </AlertDescription>
            </Alert>

            {/* Damage Notes */}
            <div className="space-y-2">
              <Label htmlFor={`notes-${garmentId}`} className="text-sm">
                Damage Notes
                <span className="text-muted-foreground ml-1">(max 500 characters)</span>
              </Label>
              <Textarea
                id={`notes-${garmentId}`}
                placeholder="e.g., Large wine stain on front, missing 2 buttons on sleeve, small tear on collar..."
                value={value.initialInspectionNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                maxLength={500}
                rows={3}
                className="resize-none text-sm"
              />
              <div className="text-xs text-muted-foreground text-right">
                {value.initialInspectionNotes.length} / 500
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-sm">
                Photos (Optional)
                <span className="text-muted-foreground ml-1">(up to 3)</span>
              </Label>

              {/* Photo Grid */}
              <div className="grid grid-cols-3 gap-2">
                {value.initialInspectionPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Damage photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handlePhotoRemove(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add Photo Button */}
                {value.initialInspectionPhotos.length < 3 && (
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-lorenzo-teal hover:bg-lorenzo-cream transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                  </button>
                )}
              </div>

              {value.initialInspectionPhotos.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Photos help with insurance claims and customer disputes
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hint when not expanded */}
        {!isExpanded && (
          <p className="text-xs text-muted-foreground italic">
            This information will be verified during detailed workstation inspection
          </p>
        )}
      </CardContent>
    </Card>
  );
}
