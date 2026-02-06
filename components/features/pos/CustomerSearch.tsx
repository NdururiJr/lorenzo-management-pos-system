/**
 * Customer Search Component
 *
 * Search for customers by name or phone number with real-time results
 *
 * @module components/features/pos/CustomerSearch
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { searchCustomers, getRecentCustomers } from '@/lib/db/customers';
import { formatPhone, formatDate } from '@/lib/utils/formatters';
import type { Customer } from '@/lib/db/schema';

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void;
  onCreateNewCustomer: () => void;
}

export function CustomerSearch({
  onSelectCustomer,
  onCreateNewCustomer,
}: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load recent customers on mount
   */
  useEffect(() => {
    const loadRecentCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const recent = await getRecentCustomers(10);
        setCustomers(recent);
      } catch (err) {
        console.error('Error loading recent customers:', err);
        // Don't show error for empty collection - set empty array instead
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentCustomers();
  }, []);

  /**
   * Search customers with debounce
   */
  const handleSearch = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      // Show recent customers if search is cleared
      try {
        const recent = await getRecentCustomers(10);
        setCustomers(recent);
      } catch (err) {
        console.error('Error loading recent customers:', err);
        // Don't show error - just set empty array
        setCustomers([]);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchCustomers(term, 20);
      setCustomers(results);
    } catch (err) {
      console.error('Error searching customers:', err);
      // Don't show error for empty results
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Debounced search effect
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          onClick={onCreateNewCustomer}
          variant="outline"
          className="whitespace-nowrap border-lorenzo-teal/30 text-lorenzo-teal hover:bg-lorenzo-teal/10 hover:border-lorenzo-teal"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Customer
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <Card className="p-4 text-center text-sm text-red-600">
            {error}
          </Card>
        )}

        {!loading && !error && customers.length === 0 && searchTerm && (
          <EmptyState
            icon={User}
            heading="No customers found"
            description="Try a different search term or create a new customer."
            action={{
              label: 'Create New Customer',
              onClick: onCreateNewCustomer,
            }}
          />
        )}

        {!loading && !error && customers.length === 0 && !searchTerm && (
          <Card className="p-4 text-center text-sm text-gray-500">
            No customers yet. Create your first customer to get started.
          </Card>
        )}

        {!loading && !error && customers.length > 0 && (
          <>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {searchTerm ? 'Search Results' : 'Recent Customers'}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.customerId}
                  customer={customer}
                  onClick={() => onSelectCustomer(customer)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Customer Card Component
 */
interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <Card
      className="p-4 hover:bg-lorenzo-cream cursor-pointer transition-colors border-lorenzo-teal/10 hover:border-lorenzo-teal/30"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
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
            <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Joined {formatDate(customer.createdAt)}</span>
            {customer.totalSpent > 0 && (
              <span>Total spent: KES {customer.totalSpent.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
