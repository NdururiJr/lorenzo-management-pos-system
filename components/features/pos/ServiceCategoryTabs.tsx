/**
 * Service Category Tabs Component
 *
 * Horizontal category filter tabs for the POS service grid.
 *
 * @module components/features/pos/ServiceCategoryTabs
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SERVICE_CATEGORIES, type ServiceCategory } from '@/lib/data/service-catalog';

interface ServiceCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function ServiceCategoryTabs({
  activeCategory,
  onCategoryChange,
  className,
}: ServiceCategoryTabsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      {SERVICE_CATEGORIES.map((category) => (
        <CategoryTab
          key={category.id}
          category={category}
          isActive={activeCategory === category.name}
          onClick={() => onCategoryChange(category.name)}
        />
      ))}
    </div>
  );
}

interface CategoryTabProps {
  category: ServiceCategory;
  isActive: boolean;
  onClick: () => void;
}

function CategoryTab({ category, isActive, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 h-9',
        isActive
          ? 'bg-lorenzo-deep-teal text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-lorenzo-teal/30 hover:bg-lorenzo-cream'
      )}
    >
      <span className="text-base">{category.icon}</span>
      <span>{category.name}</span>
    </button>
  );
}
