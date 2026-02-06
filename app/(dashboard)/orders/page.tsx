'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { StatusBadge, type OrderStatus } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getOrdersByBranch,
  getOrdersByStatus,
  getOrdersByBranchAndStatus,
  searchOrdersByOrderId,
  getAllOrders,
} from '@/lib/db/orders';
import type { OrderExtended } from '@/lib/db/schema';
import { Plus, Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const router = useRouter();
  const { userData, isAdmin } = useAuth();

  const [orders, setOrders] = useState<OrderExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchOrders = useCallback(async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      let fetchedOrders: OrderExtended[] = [];

      if (searchTerm) {
        // Search overrides other filters for now
        fetchedOrders = await searchOrdersByOrderId(
          searchTerm,
          userData.branchId
        );
      } else {
        // Determine if we should filter by branch
        // Admins can see all, but for now let's default to their branch if set, or just fetch recent
        // If user has a branchId, restrict to that branch unless they are super admin viewing all (future feature)
        const branchId = userData.branchId;

        if (branchId) {
          if (statusFilter !== 'all') {
            fetchedOrders = await getOrdersByBranchAndStatus(
              branchId,
              statusFilter as OrderStatus
            );
          } else {
            fetchedOrders = await getOrdersByBranch(branchId);
          }
        } else if (isAdmin) {
          // Admin without branch (e.g. HQ)
          if (statusFilter !== 'all') {
            fetchedOrders = await getOrdersByStatus(
              statusFilter as OrderStatus
            );
          } else {
            // Fetch all recent orders regardless of status
            fetchedOrders = await getAllOrders();
          }
        }
      }

      console.log('Fetched orders:', fetchedOrders.length);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, searchTerm, statusFilter, isAdmin]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Client-side pagination
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: DataTableColumn<OrderExtended>[] = [
    {
      header: 'Order ID',
      accessor: (order) => (
        <span className="font-medium text-brand-blue">{order.orderId}</span>
      ),
      sortable: true,
      sortKey: 'orderId',
    },
    {
      header: 'Customer',
      accessor: (order) => (
        <div className="flex flex-col">
          <span className="font-medium">{order.customerName || 'Unknown'}</span>
          <span className="text-xs text-gray-500">{order.customerPhone}</span>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: (order) => formatDate(order.createdAt.toDate()),
      sortable: true,
      sortKey: 'createdAt',
    },
    {
      header: 'Status',
      accessor: (order) => <StatusBadge status={order.status} size="sm" />,
      sortable: true,
      sortKey: 'status',
    },
    {
      header: 'Total',
      accessor: (order) => formatCurrency(order.totalAmount),
      sortable: true,
      sortKey: 'totalAmount',
    },
    {
      header: 'Payment',
      accessor: (order) => {
        const paymentColors: Record<string, string> = {
          paid: 'bg-green-100 text-green-800 border-green-200',
          partial: 'bg-amber-100 text-amber-800 border-amber-200',
          pending: 'bg-red-100 text-red-800 border-red-200',
          overpaid: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return (
          <Badge
            variant="outline"
            className={paymentColors[order.paymentStatus] || paymentColors.pending}
          >
            {order.paymentStatus.charAt(0).toUpperCase() +
              order.paymentStatus.slice(1)}
          </Badge>
        );
      },
      sortable: true,
      sortKey: 'paymentStatus',
    },
    {
      header: 'Actions',
      accessor: (order) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/orders/${order.orderId}`);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Orders"
        description="Manage and track all customer orders"
        action={
          <Button onClick={() => router.push('/pos')}>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as OrderStatus | 'all')
              }
            >
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="washing">Washing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={paginatedOrders}
          isLoading={isLoading}
          pagination={{
            currentPage,
            pageSize,
            totalItems: orders.length,
            onPageChange: setCurrentPage,
          }}
          onRowClick={(order) => router.push(`/orders/${order.orderId}`)}
          emptyState={{
            icon: Search,
            heading: 'No orders found',
            description: searchTerm
              ? `No orders matching "${searchTerm}"`
              : 'Get started by creating a new order.',
            action: {
              label: 'Create Order',
              onClick: () => router.push('/pos'),
            },
          }}
        />
      </div>
    </PageContainer>
  );
}
