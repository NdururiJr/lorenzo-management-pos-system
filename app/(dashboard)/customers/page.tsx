'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRecentCustomers, searchCustomers } from '@/lib/db/customers';
import type { Customer } from '@/lib/db/schema';
import { Plus, Search, RefreshCw, User, Phone, Mail } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreateCustomerModal } from '@/components/features/pos/CreateCustomerModal';

export default function CustomersPage() {
  const router = useRouter();
  const { user: _user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pageSize = 10;

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetchedCustomers: Customer[] = [];

      if (searchTerm) {
        fetchedCustomers = await searchCustomers(searchTerm);
      } else {
        // Default to recent customers
        fetchedCustomers = await getRecentCustomers(50);
      }

      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Client-side pagination
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: DataTableColumn<Customer>[] = [
    {
      header: 'Name',
      accessor: (customer) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-medium">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{customer.name}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'Contact',
      accessor: (customer) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-3 h-3" />
            {customer.phone}
          </div>
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-3 h-3" />
              {customer.email}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Orders',
      accessor: (customer) => customer.orderCount,
      sortable: true,
      sortKey: 'orderCount',
    },
    {
      header: 'Total Spent',
      accessor: (customer) => formatCurrency(customer.totalSpent),
      sortable: true,
      sortKey: 'totalSpent',
    },
    {
      header: 'Joined',
      accessor: (customer) => formatDate(customer.createdAt.toDate()),
      sortable: true,
      sortKey: 'createdAt',
    },
    {
      header: 'Actions',
      accessor: (customer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/customers/${customer.customerId}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Customers"
        description="Manage customer profiles and history"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchCustomers}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={paginatedCustomers}
          isLoading={isLoading}
          pagination={{
            currentPage,
            pageSize,
            totalItems: customers.length,
            onPageChange: setCurrentPage,
          }}
          onRowClick={(customer) =>
            router.push(`/customers/${customer.customerId}`)
          }
          emptyState={{
            icon: User,
            heading: 'No customers found',
            description: searchTerm
              ? `No customers matching "${searchTerm}"`
              : 'Get started by adding a new customer.',
            action: {
              label: 'Add Customer',
              onClick: () => setIsCreateModalOpen(true),
            },
          }}
        />
      </div>

      <CreateCustomerModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCustomerCreated={() => {
          fetchCustomers();
          setIsCreateModalOpen(false);
        }}
      />
    </PageContainer>
  );
}
