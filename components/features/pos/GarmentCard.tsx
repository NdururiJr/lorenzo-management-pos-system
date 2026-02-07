/**
 * Garment Card Component
 *
 * Display a garment in the order with details and actions.
 *
 * @module components/features/pos/GarmentCard
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Garment {
  garmentId: string;
  type: string;
  color: string;
  brand?: string;
  services: string[];
  price: number;
  specialInstructions?: string;
  photos?: string[];
}

interface GarmentCardProps {
  garment: Garment;
  onEdit?: (garment: Garment) => void;
  onRemove?: (garmentId: string) => void;
  className?: string;
}

export function GarmentCard({
  garment,
  onEdit,
  onRemove,
  className,
}: GarmentCardProps) {
  return (
    <Card className={cn('p-4 border border-lorenzo-teal/10 hover:shadow-card-teal hover:border-lorenzo-teal/30 transition-all', className)}>
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 shrink-0 rounded-lg bg-lorenzo-cream flex items-center justify-center overflow-hidden">
          {garment.photos && garment.photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={garment.photos[0]}
              alt={garment.type}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-8 h-8 text-lorenzo-teal/50" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-lorenzo-dark-teal">
              {garment.type} • {garment.color}
            </h3>
            <span className="text-lg font-bold text-lorenzo-deep-teal ml-4 shrink-0">
              KES {garment.price.toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {garment.services.join(', ')}
          </p>

          {garment.brand && (
            <p className="text-sm text-gray-500 mb-1">Brand: {garment.brand}</p>
          )}

          {garment.specialInstructions && (
            <p className="text-sm text-gray-500 mb-3">
              Note: {garment.specialInstructions}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(garment)}
                className="h-8 px-3 text-sm text-gray-600 hover:text-black hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(garment.garmentId)}
                className="h-8 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
