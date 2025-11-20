/**
 * Address Selector Component
 *
 * Allows staff to select from customer's saved addresses or add a new one.
 * Displays WhatsApp addresses with special badge.
 * Includes "Request Location" button for WhatsApp integration.
 *
 * @module components/features/orders/AddressSelector
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  MapPin,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { getCustomer } from '@/lib/db/customers';
import type { Address } from '@/lib/db/schema';
import { toast } from 'sonner';

interface AddressSelectorProps {
  customerId: string;
  value?: Address;
  onChange: (address: Address | undefined) => void;
  label?: string;
}

export function AddressSelector({
  customerId,
  value,
  onChange,
  label = 'Select address',
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  // New address form state
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
  });

  // Load customer addresses
  useEffect(() => {
    loadCustomerAddresses();
  }, [customerId]);

  const loadCustomerAddresses = async () => {
    try {
      setLoading(true);
      const customer = await getCustomer(customerId);
      setAddresses(customer.addresses || []);
      setCustomerPhone(customer.phone);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (addressLabel: string) => {
    if (addressLabel === 'add_new') {
      setShowAddNew(true);
      onChange(undefined);
    } else {
      const selected = addresses.find((addr) => addr.label === addressLabel);
      onChange(selected);
      setShowAddNew(false);
    }
  };

  const handleAddNewAddress = () => {
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      toast.error('Please enter both label and address');
      return;
    }

    const address: Address = {
      label: newAddress.label.trim(),
      address: newAddress.address.trim(),
      source: 'manual',
      receivedAt: undefined,
    };

    onChange(address);
    setShowAddNew(false);
    setNewAddress({ label: '', address: '' });
    toast.success('Address added');
  };

  const handleRequestLocation = async () => {
    if (!customerPhone) {
      toast.error('Customer phone number not available');
      return;
    }

    setIsRequesting(true);

    try {
      // TODO: Implement WhatsApp message sending via Wati.io
      // This will be implemented in Phase 2 (WhatsApp Integration)
      const message = `Hi! Could you please share your location with us?\n\nTo share:\n1. Tap the attachment icon (📎)\n2. Select "Location"\n3. Choose your address\n\nOr simply send us a Google Maps link of your address.\n\nThank you!`;

      // For now, show a placeholder
      toast.info('WhatsApp integration coming soon!', {
        description: 'This feature will be available in Phase 2',
      });

      // Actual implementation will call:
      // await sendWhatsAppMessage(customerPhone, message);
    } catch (error) {
      console.error('Error requesting location:', error);
      toast.error('Failed to send location request');
    } finally {
      setIsRequesting(false);
    }
  };

  const getAddressSourceBadge = (address: Address) => {
    if (address.source === 'whatsapp') {
      return (
        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-green-300">
          <MapPin className="w-3 h-3 mr-1" />
          Shared via WhatsApp
        </Badge>
      );
    }
    if (address.source === 'google_autocomplete') {
      return (
        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
          <MapPin className="w-3 h-3 mr-1" />
          Google Maps
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="ml-2">
        Manually entered
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading addresses...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Request Location Button */}
      {customerPhone && (
        <Button
          type="button"
          variant="outline"
          onClick={handleRequestLocation}
          disabled={isRequesting}
          className="w-full"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {isRequesting ? 'Sending...' : 'Request Location via WhatsApp'}
        </Button>
      )}

      {/* Address Selection */}
      {!showAddNew ? (
        <div className="space-y-2">
          <Select
            value={value?.label || ''}
            onValueChange={handleSelectAddress}
          >
            <SelectTrigger>
              <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
              {addresses.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No saved addresses
                </div>
              )}
              {addresses.map((addr) => (
                <SelectItem key={addr.label} value={addr.label}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{addr.label}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {addr.address}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="add_new">
                <div className="flex items-center text-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Show selected address details */}
          {value && (
            <Card className="p-3 bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium flex items-center">
                    {value.label}
                    {getAddressSourceBadge(value)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {value.address}
                  </div>
                  {value.receivedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Received: {(typeof value.receivedAt.toDate === 'function' ? value.receivedAt.toDate() : value.receivedAt as unknown as Date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(undefined)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Add New Address</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddNew(false);
                  setNewAddress({ label: '', address: '' });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor="address-label">Label</Label>
              <Input
                id="address-label"
                placeholder="e.g., Home, Office, Main Office"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address-value">Address</Label>
              <Input
                id="address-value"
                placeholder="Enter full address"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddNewAddress}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Add Address
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddNew(false);
                  setNewAddress({ label: '', address: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Info Alert */}
      {addresses.some((addr) => addr.source === 'whatsapp') && (
        <Alert>
          <MapPin className="w-4 h-4" />
          <AlertDescription>
            Addresses received via WhatsApp are automatically saved to the customer's profile.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
