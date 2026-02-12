/**
 * Service Card Component
 *
 * Individual service card for the POS grid.
 * Displays service info with colored icon, category tag, pricing, and add button.
 *
 * @module components/features/pos/ServiceCard
 */

'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceItem } from '@/lib/data/service-catalog';

interface ServiceCardProps {
  service: ServiceItem;
  onSelect: (service: ServiceItem) => void;
  onQuickAdd?: (service: ServiceItem) => void;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; tag: string; tagText: string }> = {
  'Shirts & Tops': { bg: 'bg-emerald-50', tag: 'bg-emerald-50', tagText: 'text-emerald-700' },
  'Suits & Jackets': { bg: 'bg-emerald-50', tag: 'bg-emerald-50', tagText: 'text-emerald-700' },
  'Dresses': { bg: 'bg-amber-50', tag: 'bg-amber-50', tagText: 'text-amber-700' },
  'Household': { bg: 'bg-violet-50', tag: 'bg-violet-50', tagText: 'text-violet-700' },
  'Specialty': { bg: 'bg-amber-50', tag: 'bg-amber-50', tagText: 'text-amber-700' },
  'Kids': { bg: 'bg-violet-50', tag: 'bg-violet-50', tagText: 'text-violet-700' },
};

function getPrimaryPrice(pricing: ServiceItem['pricing']): number {
  // Show dry cleaning price (the default auto-selected service in the form),
  // falling back to pressing → laundry → repairs if dry clean isn't available.
  return pricing.dryClean || pricing.pressing || pricing.laundry || pricing.repairs || 0;
}

export function ServiceCard({
  service,
  onSelect,
  onQuickAdd,
  className,
}: ServiceCardProps) {
  const handleCardClick = () => {
    onSelect(service);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(service);
    } else {
      onSelect(service);
    }
  };

  const colors = CATEGORY_COLORS[service.category] || CATEGORY_COLORS['Shirts & Tops'];
  const primaryPrice = getPrimaryPrice(service.pricing);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group bg-white rounded-[10px] border border-gray-200 p-[18px] cursor-pointer transition-all duration-200',
        'hover:border-lorenzo-accent-teal hover:shadow-md',
        className
      )}
    >
      {/* Icon Circle */}
      <div className={cn('w-11 h-11 rounded-full flex items-center justify-center mb-3', colors.bg)}>
        <span className="text-xl">{service.icon}</span>
      </div>

      {/* Category Tag */}
      <span className={cn('inline-block text-[10px] font-medium px-2 py-0.5 rounded mb-2', colors.tag, colors.tagText)}>
        {service.category}
      </span>

      {/* Service Name */}
      <h3 className="font-bold text-[15px] text-gray-900 mb-1">
        {service.name}
      </h3>

      {/* Price */}
      <p className="text-sm font-bold text-lorenzo-deep-teal mb-3">
        KES {primaryPrice.toLocaleString()}
      </p>

      {/* Add Button */}
      <button
        onClick={handleQuickAdd}
        className="w-full h-[34px] bg-lorenzo-deep-teal hover:bg-lorenzo-teal text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add
      </button>
    </div>
  );
}
