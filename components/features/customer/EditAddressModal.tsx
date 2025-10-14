/**
 * Edit Address Modal Component
 *
 * Modal for editing an existing customer address.
 *
 * @module components/features/customer/EditAddressModal
 */

'use client';

import { useState, useEffect } from 'react';
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
import { updateCustomerAddress } from '@/lib/db/customers';
import { toast } from 'sonner';
import type { Address } from '@/lib/db/schema';

interface EditAddressModalProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
  address: Address & { id: string };
  onSuccess: () => void;
}

export function EditAddressModal({
  open,
  onClose,
  customerId,
  address,
  onSuccess,
}: EditAddressModalProps) {
  const [label, setLabel] = useState(address.label);
  const [addressText, setAddressText] = useState(address.address);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLabel(address.label);
    setAddressText(address.address);
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim() || !addressText.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);

      await updateCustomerAddress(customerId, address.id, {
        label: label.trim(),
        address: addressText.trim(),
      });

      toast.success('Address updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your address details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Label */}
            <div>
              <Label htmlFor="label">Address Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Home, Office"
                className="mt-1"
                required
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
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
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
