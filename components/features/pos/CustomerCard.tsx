/**
 * Customer Card Component
 *
 * Displays selected customer information in POS
 *
 * @module components/features/pos/CustomerCard
 */

'use client';

import React from 'react';
import { Edit, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatPhone, getInitials } from '@/lib/utils/formatters';
import type { Customer } from '@/lib/db/schema';

interface CustomerCardProps {
  customer: Customer;
  onChangeCustomer: () => void;
  onEditCustomer?: () => void;
}

export function CustomerCard({
  customer,
  onChangeCustomer,
  onEditCustomer,
}: CustomerCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-linear-to-br from-lorenzo-deep-teal to-lorenzo-teal text-white text-lg">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>

          {/* Customer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {customer.name}
              </h3>
              {customer.orderCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {customer.orderCount} orders
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formatPhone(customer.phone)}
            </p>
            {customer.email && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {customer.email}
              </p>
            )}
            {customer.totalSpent > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Total spent: KES {customer.totalSpent.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onEditCustomer && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEditCustomer}
              title="Edit customer"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onChangeCustomer}
            title="Change customer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
