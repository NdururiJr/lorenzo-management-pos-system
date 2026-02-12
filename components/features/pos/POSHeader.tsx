/**
 * POS Header Component
 *
 * Top header for the POS page with search, cashier display, and action buttons.
 *
 * @module components/features/pos/POSHeader
 */

'use client';

import React from 'react';
import { Search, Plus, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/lib/db/schema';

interface POSHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  customer: Customer | null;
  onSelectCustomer: () => void;
  onNewOrder: () => void;
  cashierName?: string;
  cashierRole?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Admin',
    director: 'Director',
    general_manager: 'General Manager',
    store_manager: 'Store Manager',
    workstation_manager: 'WS Manager',
    workstation_staff: 'WS Staff',
    satellite_staff: 'Satellite Staff',
    front_desk: 'Cashier',
    driver: 'Driver',
    customer: 'Customer',
  };
  return labels[role] || role;
}

export function POSHeader({
  searchQuery,
  onSearchChange,
  customer,
  onSelectCustomer,
  onNewOrder,
  cashierName,
  cashierRole,
}: POSHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-14 px-6 flex items-center justify-between shrink-0">
      {/* Left: Title + Cashier + Search */}
      <div className="flex items-center gap-5">
        <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>

        {/* Cashier Display */}
        {cashierName && (
          <>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lorenzo-teal flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-semibold">
                  {getInitials(cashierName)}
                </span>
              </div>
              <span className="text-[13px] font-semibold text-gray-900">
                {cashierName.split(' ')[0]}{cashierName.split(' ').length > 1 ? ` ${cashierName.split(' ')[1][0]}.` : ''}
              </span>
              {cashierRole && (
                <span className="text-[11px] font-medium text-lorenzo-teal bg-emerald-50 px-2 py-0.5 rounded-md">
                  {getRoleLabel(cashierRole)}
                </span>
              )}
            </div>
          </>
        )}

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services or garments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-[38px] w-80 bg-gray-50 border-gray-200 rounded-lg text-[13px] focus:border-lorenzo-accent-teal focus:ring-lorenzo-accent-teal/20"
          />
        </div>
      </div>

      {/* Right: Customer + New Order Buttons */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          onClick={onSelectCustomer}
          className="h-[38px] px-3.5 border-gray-200 hover:border-lorenzo-teal/40 hover:bg-lorenzo-cream rounded-lg"
        >
          <User className="h-4 w-4 mr-2 text-lorenzo-teal" />
          {customer ? (
            <span className="text-lorenzo-dark-teal font-medium text-sm truncate max-w-[120px]">
              {customer.name}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">Select Customer</span>
          )}
        </Button>

        <Button
          onClick={onNewOrder}
          className="h-[38px] px-4 bg-lorenzo-deep-teal hover:bg-lorenzo-teal text-white font-medium text-sm rounded-lg"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Order
        </Button>
      </div>
    </header>
  );
}
