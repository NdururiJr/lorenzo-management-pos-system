/**
 * Addresses Section Component
 *
 * Manages customer addresses (add, edit, delete).
 *
 * Issue 83 Fix: Added proper fallbacks for missing address components.
 *
 * @module components/features/customer/AddressesSection
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { removeCustomerAddress } from '@/lib/db/customers';
import { AddAddressModal } from './AddAddressModal';
import { EditAddressModal } from './EditAddressModal';
import { toast } from 'sonner';
import { Plus, Home, Building2, MapPin, Edit2, Trash2 } from 'lucide-react';
import type { Customer, Address } from '@/lib/db/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AddressesSectionProps {
  customer: Customer;
  onUpdate: () => void;
}

/**
 * Get display text for an address with proper fallbacks (Issue 83 Fix)
 */
function getAddressDisplayText(address: Address & { id?: string }): string {
  // Check for the main address field
  if (address.address && address.address.trim()) {
    return address.address;
  }

  // Fallback: try to construct from components if available
  const components: string[] = [];

  // Check for common address component fields
  const addr = address as unknown as Record<string, unknown>;
  if (addr.street) components.push(String(addr.street));
  if (addr.city) components.push(String(addr.city));
  if (addr.region || addr.state) components.push(String(addr.region || addr.state));
  if (addr.postalCode || addr.zipCode) components.push(String(addr.postalCode || addr.zipCode));
  if (addr.country) components.push(String(addr.country));

  if (components.length > 0) {
    return components.join(', ');
  }

  // Final fallback
  return 'Address details not available';
}

/**
 * Get display text for an address label with fallback (Issue 83 Fix)
 */
function getAddressLabel(address: Address & { id?: string }): string {
  if (address.label && address.label.trim()) {
    return address.label;
  }
  return 'Unnamed Address';
}

export function AddressesSection({ customer, onUpdate }: AddressesSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<(Address & { id: string }) | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<(Address & { id: string }) | null>(null);

  const handleDelete = async () => {
    if (!deletingAddress) return;

    try {
      await removeCustomerAddress(customer.customerId, deletingAddress.id);
      toast.success('Address deleted successfully');
      setDeletingAddress(null);
      onUpdate();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const getAddressIcon = (label: string | undefined | null) => {
    const lower = (label || '').toLowerCase();
    if (lower.includes('home')) return Home;
    if (lower.includes('office') || lower.includes('work')) return Building2;
    return MapPin;
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Addresses ({customer.addresses.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>

        {customer.addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              No addresses saved yet
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {customer.addresses.map((address, index) => {
              const addressWithId = address as Address & { id: string };
              const Icon = getAddressIcon(addressWithId.label);
              const displayLabel = getAddressLabel(addressWithId);
              const displayAddress = getAddressDisplayText(addressWithId);

              return (
                <div
                  key={addressWithId.id || index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {displayLabel}
                          </span>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {displayAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAddress(addressWithId)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingAddress(addressWithId)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Address Modal */}
      <AddAddressModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        customerId={customer.customerId}
        onSuccess={() => {
          setShowAddModal(false);
          onUpdate();
        }}
      />

      {/* Edit Address Modal */}
      {editingAddress && (
        <EditAddressModal
          open={!!editingAddress}
          onClose={() => setEditingAddress(null)}
          customerId={customer.customerId}
          address={editingAddress}
          onSuccess={() => {
            setEditingAddress(null);
            onUpdate();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAddress}
        onOpenChange={(open) => !open && setDeletingAddress(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
