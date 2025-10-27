/**
 * Collection Method Selector Component
 *
 * Allows staff to select how garments will be collected from customer:
 * - Customer Dropped Off (at shop)
 * - Pick Up from Customer (staff collects from customer location)
 *
 * @module components/features/orders/CollectionMethodSelector
 */

'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Store, Home, Calendar } from 'lucide-react';
import { AddressSelector } from './AddressSelector';
import type { Address } from '@/lib/db/schema';

interface CollectionMethodSelectorProps {
  customerId: string;
  value: 'dropped_off' | 'pickup_required';
  onChange: (method: 'dropped_off' | 'pickup_required') => void;
  selectedAddress?: Address;
  onAddressChange: (address: Address | undefined) => void;
  instructions?: string;
  onInstructionsChange: (instructions: string) => void;
  scheduledTime?: Date;
  onScheduledTimeChange: (time: Date | undefined) => void;
}

export function CollectionMethodSelector({
  customerId,
  value,
  onChange,
  selectedAddress,
  onAddressChange,
  instructions,
  onInstructionsChange,
  scheduledTime,
  onScheduledTimeChange,
}: CollectionMethodSelectorProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">How will garments be collected?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select whether the customer will bring garments to the shop or if staff will pick them up.
          </p>
        </div>

        <RadioGroup value={value} onValueChange={(val) => onChange(val as 'dropped_off' | 'pickup_required')}>
          <div className="space-y-3">
            {/* Customer Dropped Off Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors hover:border-primary cursor-pointer"
                 style={{ borderColor: value === 'dropped_off' ? 'hsl(var(--primary))' : 'transparent' }}>
              <RadioGroupItem value="dropped_off" id="dropped_off" className="mt-1" />
              <Label htmlFor="dropped_off" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-5 h-5 text-primary" />
                  <span className="font-medium">Customer Dropped Off</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Customer brings garments to our location (default)
                </p>
              </Label>
            </div>

            {/* Pick Up from Customer Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors hover:border-primary cursor-pointer"
                 style={{ borderColor: value === 'pickup_required' ? 'hsl(var(--primary))' : 'transparent' }}>
              <RadioGroupItem value="pickup_required" id="pickup_required" className="mt-1" />
              <Label htmlFor="pickup_required" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-5 h-5 text-primary" />
                  <span className="font-medium">Pick Up from Customer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Staff will collect garments from customer's location
                </p>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {/* Show address selection if pickup is required */}
        {value === 'pickup_required' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Pickup Address <span className="text-destructive">*</span>
              </Label>
              <AddressSelector
                customerId={customerId}
                value={selectedAddress}
                onChange={onAddressChange}
                label="Select pickup address"
              />
            </div>

            <div>
              <Label htmlFor="pickup-instructions">Pickup Instructions (Optional)</Label>
              <Textarea
                id="pickup-instructions"
                placeholder="e.g., Ring doorbell twice, gate code is 1234, call when you arrive..."
                value={instructions || ''}
                onChange={(e) => onInstructionsChange(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="pickup-time" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduled Pickup Time (Optional)
              </Label>
              <input
                id="pickup-time"
                type="datetime-local"
                value={scheduledTime ? formatDateTimeLocal(scheduledTime) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    onScheduledTimeChange(new Date(e.target.value));
                  } else {
                    onScheduledTimeChange(undefined);
                  }
                }}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to pick up as soon as possible
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Format Date object to datetime-local input format (YYYY-MM-DDTHH:MM)
 */
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
