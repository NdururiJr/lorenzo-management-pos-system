/**
 * Service Grid Component
 *
 * Scrollable grid of service cards for the POS page.
 * Filters by category and search query.
 *
 * @module components/features/pos/ServiceGrid
 */

'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { filterServices, type ServiceItem } from '@/lib/data/service-catalog';
import { cn } from '@/lib/utils';

interface ServiceGridProps {
  category: string;
  searchQuery: string;
  onSelectService: (service: ServiceItem) => void;
  onQuickAddService?: (service: ServiceItem) => void;
  className?: string;
}

export function ServiceGrid({
  category,
  searchQuery,
  onSelectService,
  onQuickAddService,
  className,
}: ServiceGridProps) {
  const filteredServices = filterServices(category, searchQuery);

  if (filteredServices.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lorenzo-cream flex items-center justify-center">
            <Package className="w-8 h-8 text-lorenzo-teal/50" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            No services found
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? `No services match "${searchQuery}"`
              : `No services in this category`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2',
        className
      )}
    >
      {filteredServices.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onSelect={onSelectService}
          onQuickAdd={onQuickAddService}
        />
      ))}
    </div>
  );
}
