/**
 * Customer Search Modal Component
 *
 * Modal wrapper for CustomerSearch component.
 * Opens when clicking customer area in bottom bar.
 *
 * @module components/features/pos/CustomerSearchModal
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerSearch } from './CustomerSearch';
import type { Customer } from '@/lib/db/schema';

interface CustomerSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomer: (customer: Customer) => void;
  onCreateNewCustomer: () => void;
}

export function CustomerSearchModal({
  open,
  onOpenChange,
  onSelectCustomer,
  onCreateNewCustomer,
}: CustomerSearchModalProps) {
  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onOpenChange(false);
  };

  const handleCreateNewCustomer = () => {
    onOpenChange(false);
    onCreateNewCustomer();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-lorenzo-dark-teal">
            Select Customer
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <CustomerSearch
            onSelectCustomer={handleSelectCustomer}
            onCreateNewCustomer={handleCreateNewCustomer}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
