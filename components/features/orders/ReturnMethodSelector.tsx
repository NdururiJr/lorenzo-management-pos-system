/**
 * Return Method Selector Component
 *
 * Allows staff to select how clean garments will be returned to customer:
 * - Customer Will Collect (at shop)
 * - Deliver to Customer (staff delivers to customer location)
 *
 * @module components/features/orders/ReturnMethodSelector
 */

'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Store, Truck, Calendar } from 'lucide-react';
import { AddressSelector } from './AddressSelector';
import type { Address } from '@/lib/db/schema';

interface ReturnMethodSelectorProps {
  customerId: string;
  value: 'customer_collects' | 'delivery_required';
  onChange: (method: 'customer_collects' | 'delivery_required') => void;
  selectedAddress?: Address;
  onAddressChange: (address: Address | undefined) => void;
  instructions?: string;
  onInstructionsChange: (instructions: string) => void;
  scheduledTime?: Date;
  onScheduledTimeChange: (time: Date | undefined) => void;
  estimatedCompletion?: Date;
}

export function ReturnMethodSelector({
  customerId,
  value,
  onChange,
  selectedAddress,
  onAddressChange,
  instructions,
  onInstructionsChange,
  scheduledTime,
  onScheduledTimeChange,
  estimatedCompletion,
}: ReturnMethodSelectorProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">How will clean garments be returned?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select whether the customer will collect garments from the shop or if staff will deliver them.
          </p>
        </div>

        <RadioGroup value={value} onValueChange={(val) => onChange(val as 'customer_collects' | 'delivery_required')}>
          <div className="space-y-3">
            {/* Customer Will Collect Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors hover:border-primary cursor-pointer"
                 style={{ borderColor: value === 'customer_collects' ? 'hsl(var(--primary))' : 'transparent' }}>
              <RadioGroupItem value="customer_collects" id="customer_collects" className="mt-1" />
              <Label htmlFor="customer_collects" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-5 h-5 text-primary" />
                  <span className="font-medium">Customer Will Collect</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Customer picks up clean garments from our location (default)
                </p>
              </Label>
            </div>

            {/* Deliver to Customer Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors hover:border-primary cursor-pointer"
                 style={{ borderColor: value === 'delivery_required' ? 'hsl(var(--primary))' : 'transparent' }}>
              <RadioGroupItem value="delivery_required" id="delivery_required" className="mt-1" />
              <Label htmlFor="delivery_required" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="font-medium">Deliver to Customer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Staff will deliver clean garments to customer's location
                </p>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {/* Show address selection if delivery is required */}
        {value === 'delivery_required' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Delivery Address <span className="text-destructive">*</span>
              </Label>
              <AddressSelector
                customerId={customerId}
                value={selectedAddress}
                onChange={onAddressChange}
                label="Select delivery address"
              />
            </div>

            <div>
              <Label htmlFor="delivery-instructions">Delivery Instructions (Optional)</Label>
              <Textarea
                id="delivery-instructions"
                placeholder="e.g., Leave at reception, call before arriving, ring twice..."
                value={instructions || ''}
                onChange={(e) => onInstructionsChange(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="delivery-time" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduled Delivery Time (Optional)
              </Label>
              <input
                id="delivery-time"
                type="datetime-local"
                value={scheduledTime ? formatDateTimeLocal(scheduledTime) : (estimatedCompletion ? formatDateTimeLocal(estimatedCompletion) : '')}
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
                {estimatedCompletion
                  ? 'Defaults to estimated completion time. Adjust if needed.'
                  : 'Select delivery date and time'}
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
