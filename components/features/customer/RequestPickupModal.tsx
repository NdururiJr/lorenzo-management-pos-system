/**
 * Request Pickup Modal Component
 *
 * Modal for customers to request a pickup for their garments.
 * This is a placeholder implementation - actual pickup scheduling
 * will be integrated with the order system later.
 *
 * @module components/features/customer/RequestPickupModal
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { getCustomer } from '@/lib/db/customers';
import { toast } from 'sonner';
import type { Address } from '@/lib/db/schema';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface RequestPickupModalProps {
  open: boolean;
  onClose: () => void;
}

export function RequestPickupModal({ open, onClose }: RequestPickupModalProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customer addresses
  useEffect(() => {
    async function fetchAddresses() {
      if (user?.uid) {
        try {
          const customer = await getCustomer(user.uid);
          setAddresses(customer.addresses || []);
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
          // Handle missing customer document gracefully
          setAddresses([]);
        }
      }
    }

    if (open) {
      fetchAddresses();
    }
  }, [user, open]);

  // Set minimum date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    if (!preferredDate) {
      setPreferredDate(minDate);
    }
  }, [open]);

  const handleReset = () => {
    setSelectedAddressIndex('');
    setPreferredDate('');
    setPreferredTime('morning');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressIndex || !preferredDate || !preferredTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Integrate with actual pickup scheduling system
      // For now, just show a success message
      const selectedAddress = addresses[parseInt(selectedAddressIndex)];

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        'Pickup request submitted! We\'ll contact you shortly to confirm.',
        {
          description: `${selectedAddress.label} - ${preferredDate} (${preferredTime})`,
        }
      );

      handleReset();
      onClose();
    } catch (error) {
      console.error('Failed to submit pickup request:', error);
      toast.error('Failed to submit pickup request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Pickup</DialogTitle>
          <DialogDescription>
            Schedule a pickup for your garments. We'll contact you to confirm the details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Address Selection */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Pickup Address <span className="text-red-500">*</span>
              </Label>
              {addresses.length > 0 ? (
                <Select
                  value={selectedAddressIndex}
                  onValueChange={setSelectedAddressIndex}
                  required
                >
                  <SelectTrigger id="address">
                    <SelectValue placeholder="Select pickup address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((addr, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="font-medium">{addr.label}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {addr.address.substring(0, 40)}...
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">
                  No saved addresses. Please add an address in your profile first.
                </p>
              )}
            </div>

            {/* Preferred Date */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Preferred Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={getMinDate()}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label htmlFor="time">
                Preferred Time <span className="text-red-500">*</span>
              </Label>
              <Select value={preferredTime} onValueChange={setPreferredTime} required>
                <SelectTrigger id="time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Morning (8:00 AM - 12:00 PM)
                    </div>
                  </SelectItem>
                  <SelectItem value="afternoon">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Afternoon (12:00 PM - 4:00 PM)
                    </div>
                  </SelectItem>
                  <SelectItem value="evening">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Evening (4:00 PM - 6:00 PM)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions for pickup (e.g., gate code, specific location)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || addresses.length === 0}
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
