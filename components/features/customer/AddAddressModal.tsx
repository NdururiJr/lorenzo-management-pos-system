/**
 * Add Address Modal Component
 *
 * Modal for adding a new customer address.
 *
 * @module components/features/customer/AddAddressModal
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addCustomerAddress } from '@/lib/db/customers';
import { toast } from 'sonner';
import type { Address } from '@/lib/db/schema';

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
  onSuccess: () => void;
}

const ADDRESS_LABELS = [
  { value: 'home', label: 'Home' },
  { value: 'office', label: 'Office' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

export function AddAddressModal({
  open,
  onClose,
  customerId,
  onSuccess,
}: AddAddressModalProps) {
  const [label, setLabel] = useState('home');
  const [customLabel, setCustomLabel] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalLabel = label === 'other' ? customLabel : label;

    if (!finalLabel.trim() || !address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);

      const newAddress: Omit<Address, 'id'> = {
        label: finalLabel.trim(),
        address: address.trim(),
        coordinates: {
          lat: 0,
          lng: 0,
        }, // TODO: Implement geocoding with Google Maps API
      };

      await addCustomerAddress(customerId, newAddress);

      toast.success('Address added successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setLabel('home');
    setCustomLabel('');
    setAddress('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Add a new delivery address to your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Label */}
            <div>
              <Label htmlFor="label">Address Label</Label>
              <Select value={label} onValueChange={setLabel}>
                <SelectTrigger id="label" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_LABELS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Label (if Other is selected) */}
            {label === 'other' && (
              <div>
                <Label htmlFor="customLabel">Custom Label</Label>
                <Input
                  id="customLabel"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g., Gym, Parents' House"
                  className="mt-1"
                  required
                />
              </div>
            )}

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full address with landmarks"
                rows={3}
                className="mt-1"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Adding...' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
