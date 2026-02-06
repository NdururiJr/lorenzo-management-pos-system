/**
 * Cart Item Chip Component
 *
 * Compact cart item display for the POS bottom bar.
 * Shows item info with remove button.
 *
 * @module components/features/pos/CartItemChip
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CartItemData {
  garmentId: string;
  type: string;
  color: string;
  services: string[];
  price: number;
  icon?: string;
}

interface CartItemChipProps {
  item: CartItemData;
  onRemove: (garmentId: string) => void;
  onClick?: (item: CartItemData) => void;
  className?: string;
}

export function CartItemChip({
  item,
  onRemove,
  onClick,
  className,
}: CartItemChipProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(item.garmentId);
  };

  return (
    <div
      onClick={() => onClick?.(item)}
      className={cn(
        'group relative flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-lorenzo-teal/20 cursor-pointer transition-all duration-200',
        'hover:border-lorenzo-teal/40 hover:shadow-sm',
        className
      )}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-lorenzo-cream flex items-center justify-center shrink-0">
        <span className="text-lg">{item.icon || '👔'}</span>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-lorenzo-dark-teal truncate max-w-[100px]">
          {item.type}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-[100px]">
          {item.color}
        </p>
      </div>

      {/* Price */}
      <span className="text-sm font-semibold text-lorenzo-deep-teal whitespace-nowrap">
        {item.price.toLocaleString()}
      </span>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
