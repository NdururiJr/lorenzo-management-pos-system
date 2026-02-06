'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Send,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * Get Firebase auth token
 */
async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

interface Quotation {
  id: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  items: Array<{
    garmentType: string;
    quantity: number;
    services: string[];
    totalPrice: number;
  }>;
  totalAmount: number;
  status: QuotationStatus;
  validUntil: { toDate: () => Date } | Date;
  createdAt: { toDate: () => Date } | Date;
  createdByName: string;
}

const STATUS_COLORS: Record<QuotationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  accepted: 'default',
  rejected: 'destructive',
  expired: 'outline',
  converted: 'default',
};

const STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  converted: 'Converted',
};

export default function QuotationsPage() {
  const router = useRouter();
  const { userData, user } = useAuth();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchQuotations = useCallback(async () => {
    const token = await getAuthToken();
    if (!userData || !token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (userData.branchId) {
        params.append('branchId', userData.branchId);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/quotations?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotations');
      }

      const data = await response.json();
      setQuotations(data.data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, searchTerm, statusFilter]);

  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user, fetchQuotations]);

  const handleSendQuotation = async (quotationId: string) => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/quotations/${quotationId}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: 'whatsapp' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send quotation');
      }

      alert('Quotation sent successfully');
      fetchQuotations();
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to send quotation');
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    const token = await getAuthToken();
    if (!token) return;

    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete quotation');
      }

      alert('Quotation deleted successfully');
      fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete quotation');
    }
  };

  // Helper to safely get date
  const getDate = (dateValue: { toDate: () => Date } | Date | undefined): Date => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue.toDate === 'function') return dateValue.toDate();
    return new Date();
  };

  // Columns for the data table
  const columns: DataTableColumn<Quotation>[] = [
    {
      header: 'Quotation ID',
      accessor: (row: Quotation) => (
        <span className="font-mono text-sm">{row.quotationId}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row: Quotation) => (
        <div>
          <div className="font-medium">{row.customerName}</div>
          <div className="text-sm text-muted-foreground">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      header: 'Items',
      accessor: (row: Quotation) => {
        const totalItems = row.items.reduce((sum, item) => sum + item.quantity, 0);
        return <span>{totalItems} items</span>;
      },
    },
    {
      header: 'Total',
      accessor: (row: Quotation) => (
        <span className="font-medium">{formatCurrency(row.totalAmount)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Quotation) => (
        <Badge variant={STATUS_COLORS[row.status]}>
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      header: 'Valid Until',
      accessor: (row: Quotation) => {
        const validUntil = getDate(row.validUntil);
        const isExpired = new Date() > validUntil;
        return (
          <span className={isExpired && row.status !== 'converted' ? 'text-destructive' : ''}>
            {formatDate(validUntil)}
          </span>
        );
      },
    },
    {
      header: 'Created',
      accessor: (row: Quotation) => formatDate(getDate(row.createdAt)),
    },
    {
      header: 'Actions',
      accessor: (row: Quotation) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/quotations/${row.quotationId}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === 'draft' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSendQuotation(row.quotationId)}
                title="Send to customer"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteQuotation(row.quotationId)}
                title="Delete quotation"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
          {row.status === 'accepted' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/quotations/${row.quotationId}/convert`)}
              title="Convert to order"
            >
              <FileCheck className="h-4 w-4 text-green-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Client-side pagination
  const paginatedQuotations = quotations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(quotations.length / pageSize);

  return (
    <PageContainer>
      <SectionHeader
        title="Quotations"
        description="Manage customer quotations and convert them to orders"
        action={
          <Button onClick={() => router.push('/quotations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by quotation ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as QuotationStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchQuotations}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {(['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'] as QuotationStatus[]).map(
          (status) => {
            const count = quotations.filter((q) => q.status === status).length;
            return (
              <div
                key={status}
                className="bg-card border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setStatusFilter(status)}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{status}</div>
              </div>
            );
          }
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedQuotations}
        isLoading={isLoading}
        emptyState={{
          icon: FileCheck,
          heading: 'No quotations found',
          description: 'Create a new quotation to get started',
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, quotations.length)} of {quotations.length} quotations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
