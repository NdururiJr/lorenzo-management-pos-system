/**
 * POS Header Component
 *
 * Top header for the POS page with search, new order button, and action icons.
 *
 * @module components/features/pos/POSHeader
 */

'use client';

import React from 'react';
import { Search, Plus, Printer, Settings, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/lib/db/schema';

interface POSHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  customer: Customer | null;
  onSelectCustomer: () => void;
  onNewOrder: () => void;
  onPrint?: () => void;
  onSettings?: () => void;
}

export function POSHeader({
  searchQuery,
  onSearchChange,
  customer,
  onSelectCustomer,
  onNewOrder,
  onPrint,
  onSettings,
}: POSHeaderProps) {
  return (
    <header className="bg-white border-b border-lorenzo-teal/10 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services, garments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-lorenzo-accent-teal focus:ring-lorenzo-accent-teal/20"
          />
        </div>

        {/* Center: Actions */}
        <div className="flex items-center gap-3">
          {/* New Order Button */}
          <Button
            onClick={onNewOrder}
            className="h-10 px-4 bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>

          {/* Customer Quick Select */}
          <Button
            variant="outline"
            onClick={onSelectCustomer}
            className="h-10 px-4 border-lorenzo-teal/20 hover:border-lorenzo-teal/40 hover:bg-lorenzo-cream"
          >
            <User className="h-4 w-4 mr-2 text-lorenzo-teal" />
            {customer ? (
              <span className="text-lorenzo-dark-teal font-medium truncate max-w-[120px]">
                {customer.name}
              </span>
            ) : (
              <span className="text-gray-500">Select Customer</span>
            )}
          </Button>
        </div>

        {/* Right: Icon Buttons */}
        <div className="flex items-center gap-2">
          {onPrint && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrint}
              className="h-10 w-10 text-gray-500 hover:text-lorenzo-teal hover:bg-lorenzo-cream"
            >
              <Printer className="h-5 w-5" />
            </Button>
          )}
          {onSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              className="h-10 w-10 text-gray-500 hover:text-lorenzo-teal hover:bg-lorenzo-cream"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
