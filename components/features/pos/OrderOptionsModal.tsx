/**
 * Order Options Modal Component
 *
 * Modal for setting collection and return methods before confirming order.
 * V2.0: Also includes service type (Normal/Express) and inspector selection.
 * Wraps CollectionMethodSelector and ReturnMethodSelector.
 *
 * @module components/features/pos/OrderOptionsModal
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Truck, Zap, Clock, User } from 'lucide-react';
import { CollectionMethodSelector } from '@/components/features/orders/CollectionMethodSelector';
import { ReturnMethodSelector } from '@/components/features/orders/ReturnMethodSelector';
import type { Address, ServiceType } from '@/lib/db/schema';

export interface OrderOptions {
  collectionMethod: 'dropped_off' | 'pickup_required';
  pickupAddress?: Address;
  pickupInstructions?: string;
  pickupTime?: Date;
  returnMethod: 'customer_collects' | 'delivery_required';
  deliveryAddress?: Address;
  deliveryInstructions?: string;
  deliveryTime?: Date;
}

/** V2.0: Staff member option for inspector dropdown */
interface StaffOption {
  uid: string;
  name: string;
}

interface OrderOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  options: OrderOptions;
  onOptionsChange: (options: OrderOptions) => void;
  estimatedCompletion?: Date;
  onConfirm: () => void;
  isProcessing?: boolean;
  /** V2.0: Service type (Normal/Express) */
  serviceType: ServiceType;
  onServiceTypeChange: (type: ServiceType) => void;
  /** V2.0: Inspector who checked the order */
  checkedBy: string;
  checkedByName: string;
  onCheckedByChange: (uid: string, name: string) => void;
  /** V2.0: Available staff for inspector dropdown */
  availableStaff: StaffOption[];
}

export function OrderOptionsModal({
  open,
  onOpenChange,
  customerId,
  options,
  onOptionsChange,
  estimatedCompletion,
  onConfirm,
  isProcessing = false,
  serviceType,
  onServiceTypeChange,
  checkedBy,
  checkedByName: _checkedByName,
  onCheckedByChange,
  availableStaff,
}: OrderOptionsModalProps) {
  const handleCollectionMethodChange = (method: 'dropped_off' | 'pickup_required') => {
    onOptionsChange({
      ...options,
      collectionMethod: method,
      // Clear address if switching to dropped off
      pickupAddress: method === 'dropped_off' ? undefined : options.pickupAddress,
    });
  };

  const handleReturnMethodChange = (method: 'customer_collects' | 'delivery_required') => {
    onOptionsChange({
      ...options,
      returnMethod: method,
      // Clear address if switching to customer collects
      deliveryAddress: method === 'customer_collects' ? undefined : options.deliveryAddress,
    });
  };

  const isValid = () => {
    // V2.0: Must have inspector selected
    if (!checkedBy) {
      return false;
    }
    // If pickup required, must have address
    if (options.collectionMethod === 'pickup_required' && !options.pickupAddress) {
      return false;
    }
    // If delivery required, must have address
    if (options.returnMethod === 'delivery_required' && !options.deliveryAddress) {
      return false;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-lorenzo-dark-teal">
            Order Options
          </DialogTitle>
        </DialogHeader>

        {/* V2.0: Service Type and Inspector Section */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <User className="w-4 h-4" />
            Order Details
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Service Type *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={serviceType === 'Normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onServiceTypeChange('Normal')}
                className={serviceType === 'Normal'
                  ? 'bg-lorenzo-dark-teal text-white'
                  : 'border-gray-300'
                }
              >
                <Clock className="w-4 h-4 mr-2" />
                Normal
              </Button>
              <Button
                type="button"
                variant={serviceType === 'Express' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onServiceTypeChange('Express')}
                className={serviceType === 'Express'
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'border-gray-300'
                }
              >
                <Zap className="w-4 h-4 mr-2" />
                Express (+50%)
              </Button>
            </div>
            {serviceType === 'Express' && (
              <p className="text-xs text-amber-600">
                Express service applies a 50% surcharge for faster processing.
              </p>
            )}
          </div>

          {/* Inspector / Checked By */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Inspected By *</Label>
            <Select
              value={checkedBy}
              onValueChange={(value) => {
                const staff = availableStaff.find(s => s.uid === value);
                onCheckedByChange(value, staff?.name || '');
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select inspector" />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staff) => (
                  <SelectItem key={staff.uid} value={staff.uid}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Staff member who inspected the garments at reception.
            </p>
          </div>
        </div>

        <Tabs defaultValue="collection" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Return
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="mt-4">
            <CollectionMethodSelector
              customerId={customerId}
              value={options.collectionMethod}
              onChange={handleCollectionMethodChange}
              selectedAddress={options.pickupAddress}
              onAddressChange={(address) =>
                onOptionsChange({ ...options, pickupAddress: address })
              }
              instructions={options.pickupInstructions}
              onInstructionsChange={(instructions) =>
                onOptionsChange({ ...options, pickupInstructions: instructions })
              }
              scheduledTime={options.pickupTime}
              onScheduledTimeChange={(time) =>
                onOptionsChange({ ...options, pickupTime: time })
              }
            />
          </TabsContent>

          <TabsContent value="return" className="mt-4">
            <ReturnMethodSelector
              customerId={customerId}
              value={options.returnMethod}
              onChange={handleReturnMethodChange}
              selectedAddress={options.deliveryAddress}
              onAddressChange={(address) =>
                onOptionsChange({ ...options, deliveryAddress: address })
              }
              instructions={options.deliveryInstructions}
              onInstructionsChange={(instructions) =>
                onOptionsChange({ ...options, deliveryInstructions: instructions })
              }
              scheduledTime={options.deliveryTime}
              onScheduledTimeChange={(time) =>
                onOptionsChange({ ...options, deliveryTime: time })
              }
              estimatedCompletion={estimatedCompletion}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!isValid() || isProcessing}
            className="bg-linear-to-r from-lorenzo-deep-teal to-lorenzo-teal hover:from-lorenzo-teal hover:to-lorenzo-light-teal text-white"
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
