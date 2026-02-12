/**
 * Order Summary Panel Component
 *
 * Right-side panel for the POS page showing cart items, totals, and payment actions.
 * Replaces the bottom bar on desktop for a more spacious layout.
 *
 * @module components/features/pos/OrderSummaryPanel
 */

'use client';

import React from 'react';
import { X, User, ShoppingCart, Check, Smartphone, CreditCard, Wallet, Settings2, Zap } from 'lucide-react';
import type { Customer } from '@/lib/db/schema';
import type { CartItemData } from './CartItemChip';

interface OrderSummaryPanelProps {
  customer: Customer | null;
  cart: CartItemData[];
  subtotal: number;
  expressSurcharge: number;
  total: number;
  serviceType: 'Normal' | 'Express';
  onRemoveItem: (garmentId: string) => void;
  onEditItem?: (item: CartItemData) => void;
  onSelectCustomer: () => void;
  onConfirmOrder: () => void;
  onOpenOptions?: () => void;
  isProcessing?: boolean;
}

export function OrderSummaryPanel({
  customer,
  cart,
  subtotal,
  expressSurcharge,
  total,
  serviceType,
  onRemoveItem,
  onSelectCustomer,
  onConfirmOrder,
  onOpenOptions,
  isProcessing = false,
}: OrderSummaryPanelProps) {
  return (
    <div className="w-[380px] shrink-0 bg-lorenzo-cream border-l border-gray-200 flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[17px] font-bold text-gray-900">Order Summary</h2>
          <div className="flex items-center gap-2">
            {onOpenOptions && (
              <button
                onClick={onOpenOptions}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-lorenzo-teal hover:bg-white transition-colors"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
            <span className="w-[26px] h-[26px] rounded-full bg-lorenzo-deep-teal text-white text-xs font-semibold flex items-center justify-center">
              {cart.length}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">Lorenzo Dry Cleaners</p>
      </div>

      {/* Customer Card */}
      <div className="px-5 pb-3">
        <button
          onClick={onSelectCustomer}
          className="w-full flex items-center gap-3 p-3 bg-white rounded-[10px] border border-gray-200 hover:border-lorenzo-teal/30 transition-colors text-left"
        >
          {customer ? (
            <>
              <div className="w-9 h-9 rounded-full bg-lorenzo-deep-teal flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-semibold">
                  {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{customer.name}</p>
                <p className="text-[11px] text-gray-500">{customer.phone}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-500">No customer selected</p>
                <p className="text-[11px] text-gray-400">Click to select</p>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Divider + Items Label */}
      <div className="px-5 pb-2">
        <div className="h-px bg-gray-200 mb-3" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Items ({cart.length})
        </p>
      </div>

      {/* Cart Items List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 min-h-0">
        {cart.length > 0 ? (
          <div className="bg-white rounded-[10px] border border-gray-200 divide-y divide-gray-100">
            {cart.map((item) => (
              <CartListItem
                key={item.garmentId}
                item={item}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ShoppingCart className="w-8 h-8 mb-2" />
            <p className="text-sm">No items added yet</p>
          </div>
        )}
      </div>

      {/* Totals + Payment */}
      <div className="px-5 pb-5 pt-3 mt-auto">
        <div className="h-px bg-gray-200 mb-3" />

        {/* Subtotal */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-gray-500">Subtotal</span>
          <span className="text-[13px] font-semibold text-gray-700">KES {subtotal.toLocaleString()}</span>
        </div>

        {/* Express Surcharge */}
        {serviceType === 'Express' && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-gray-500">Express</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-lorenzo-gold bg-amber-50 px-1.5 py-0.5 rounded">
                <Zap className="w-2.5 h-2.5" />
                50%
              </span>
            </div>
            <span className="text-[13px] font-semibold text-lorenzo-gold">KES {expressSurcharge.toLocaleString()}</span>
          </div>
        )}

        <div className="h-px bg-gray-200 my-3" />

        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-[22px] font-extrabold text-lorenzo-deep-teal">
            KES {total.toLocaleString()}
          </span>
        </div>

        {/* Payment Method Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={onConfirmOrder}
            disabled={cart.length === 0 || !customer || isProcessing}
            className="flex-1 h-[38px] bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            M-Pesa
          </button>
          <button
            onClick={onConfirmOrder}
            disabled={cart.length === 0 || !customer || isProcessing}
            className="flex-1 h-[38px] bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Card
          </button>
          <button
            onClick={onConfirmOrder}
            disabled={cart.length === 0 || !customer || isProcessing}
            className="flex-1 h-[38px] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-lorenzo-teal text-xs font-medium rounded-lg border border-lorenzo-teal/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            Credit
          </button>
        </div>

        {/* Confirm Order Button */}
        <button
          onClick={onConfirmOrder}
          disabled={cart.length === 0 || !customer || isProcessing}
          className="w-full h-[46px] bg-lorenzo-deep-teal hover:bg-lorenzo-teal disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Check className="w-4 h-4 text-lorenzo-accent-teal" />
          {isProcessing ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}

function CartListItem({
  item,
  onRemove,
}: {
  item: CartItemData;
  onRemove: (garmentId: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-lorenzo-cream flex items-center justify-center shrink-0">
        <span className="text-base">{item.icon || '👔'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{item.type}</p>
        {item.color && (
          <p className="text-[11px] text-gray-500 truncate">{item.color}</p>
        )}
      </div>
      <span className="text-[13px] font-bold text-lorenzo-deep-teal whitespace-nowrap">
        KES {item.price.toLocaleString()}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.garmentId);
        }}
        className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
