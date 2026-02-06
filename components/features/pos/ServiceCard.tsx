/**
 * Service Card Component
 *
 * Individual service card for the POS grid.
 * Displays service info and allows quick-add or form pre-fill.
 *
 * @module components/features/pos/ServiceCard
 */

'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ServiceItem } from '@/lib/data/service-catalog';

interface ServiceCardProps {
  service: ServiceItem;
  onSelect: (service: ServiceItem) => void;
  onQuickAdd?: (service: ServiceItem) => void;
  className?: string;
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

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group bg-white rounded-2xl border border-gray-200 p-3.5 cursor-pointer transition-all duration-300',
        'hover:border-lorenzo-accent-teal hover:shadow-lg hover:-translate-y-1',
        'flex flex-col items-center text-center',
        className
      )}
    >
      {/* Icon Box - Centered */}
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-lorenzo-light-teal/20 to-lorenzo-teal/10 flex items-center justify-center mb-2">
        <span className="text-[22px]">{service.icon}</span>
      </div>

      {/* Service Name - Centered */}
      <h3 className="font-semibold text-lorenzo-dark-teal text-xs mb-2">
        {service.name}
      </h3>

      {/* Select Button - Full Width (prices shown in form) */}
      <Button
        size="sm"
        onClick={handleQuickAdd}
        className="w-full h-7 bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white text-[11px] font-medium"
      >
        <Plus className="w-3 h-3 mr-1" />
        Select
      </Button>
    </div>
  );
}
