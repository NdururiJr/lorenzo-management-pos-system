/**
 * POS Bottom Bar Component
 *
 * Fixed bottom bar for the POS page.
 * Shows customer info, cart items, payment options, and total.
 *
 * @module components/features/pos/POSBottomBar
 */

'use client';

import React from 'react';
import { User, CreditCard, Smartphone, Settings2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItemChip, type CartItemData } from './CartItemChip';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/db/schema';

interface POSBottomBarProps {
  customer: Customer | null;
  cart: CartItemData[];
  onRemoveItem: (garmentId: string) => void;
  onEditItem?: (item: CartItemData) => void;
  onSelectCustomer: () => void;
  onConfirmOrder: () => void;
  onOpenOptions?: () => void;
  isProcessing?: boolean;
  className?: string;
}

export function POSBottomBar({
  customer,
  cart,
  onRemoveItem,
  onEditItem,
  onSelectCustomer,
  onConfirmOrder,
  onOpenOptions,
  isProcessing = false,
  className,
}: POSBottomBarProps) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const itemCount = cart.length;

  return (
    <div
      className={cn(
        'bg-white border-t border-lorenzo-teal/10 px-6 py-4 shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Customer Section */}
        <button
          onClick={onSelectCustomer}
          className="flex items-center gap-3 px-4 py-2 rounded-xl border border-lorenzo-teal/20 hover:border-lorenzo-teal/40 hover:bg-lorenzo-cream transition-all duration-200"
        >
          {customer ? (
            <>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-lorenzo-deep-teal to-lorenzo-teal flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {customer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-lorenzo-dark-teal">
                  {customer.name}
                </p>
                <p className="text-xs text-gray-500">{customer.phone}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-500">
                  Select Customer
                </p>
                <p className="text-xs text-gray-400">Click to add</p>
              </div>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200" />

        {/* Cart Items */}
        <div className="flex-1 overflow-hidden">
          {cart.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {cart.map((item) => (
                <CartItemChip
                  key={item.garmentId}
                  item={item}
                  onRemove={onRemoveItem}
                  onClick={onEditItem}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-400">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm">No items in order</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200" />

        {/* Options Button */}
        {onOpenOptions && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenOptions}
            className="h-10 w-10 text-gray-500 hover:text-lorenzo-teal hover:bg-lorenzo-cream"
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        )}

        {/* Payment Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
            disabled={cart.length === 0 || !customer}
          >
            <Smartphone className="w-4 h-4 mr-1.5" />
            M-Pesa
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
            disabled={cart.length === 0 || !customer}
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            Card
          </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200" />

        {/* Total and Confirm */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </p>
            <p className="text-2xl font-bold text-lorenzo-deep-teal">
              KES {total.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={onConfirmOrder}
            disabled={cart.length === 0 || !customer || isProcessing}
            className="h-12 px-6 bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white font-semibold text-base"
          >
            {isProcessing ? 'Processing...' : 'Confirm Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
