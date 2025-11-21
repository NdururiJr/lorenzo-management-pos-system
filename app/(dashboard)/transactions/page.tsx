'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Clock,
  XCircle,
  CheckCircle,
  Download,
  Calendar,
  Loader2,
  Search,
  FileText,
} from 'lucide-react';
import { collection, query, where, getDocs, Timestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getActiveBranches } from '@/lib/db/index';
import type { Transaction, Branch, PaymentMethod, TransactionStatus } from '@/lib/db/schema';
import { formatCurrency } from '@/lib/utils';

type DateRange = 'today' | '7d' | '30d' | 'all';

interface TransactionExtended extends Transaction {
  customerName?: string;
  branchName?: string;
}

export default function TransactionsPage() {
  const { userData } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionExtended | null>(null);

  const isSuperAdmin = userData?.isSuperAdmin || false;
  const allowedBranches = isSuperAdmin
    ? null
    : userData?.branchId
    ? [userData.branchId, ...(userData.branchAccess || [])]
    : [];

  // Fetch branches for filter
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches-for-transactions'],
    queryFn: async () => {
      if (!isSuperAdmin) return [];
      return getActiveBranches();
    },
    enabled: isSuperAdmin,
  });

  // Calculate date range
  const dateFilter = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let rangeStart: Date | null = null;
    switch (dateRange) {
      case 'today':
        rangeStart = today;
        break;
      case '7d':
        rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 7);
        break;
      case '30d':
        rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 30);
        break;
      case 'all':
      default:
        rangeStart = null;
        break;
    }

    return rangeStart ? Timestamp.fromDate(rangeStart) : null;
  }, [dateRange]);

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery<TransactionExtended[]>({
    queryKey: ['transactions', selectedBranchId, dateRange, allowedBranches],
    queryFn: async () => {
      const transactionsRef = collection(db, 'transactions');
      const constraints: any[] = [];

      // Apply branch filter
      if (selectedBranchId !== 'all') {
        constraints.push(where('branchId', '==', selectedBranchId));
      } else if (!isSuperAdmin && allowedBranches && allowedBranches.length > 0) {
        if (allowedBranches.length <= 10) {
          constraints.push(where('branchId', 'in', allowedBranches));
        }
        // For >10 branches, we'd need to fetch separately and merge (simplified here)
      }

      // Apply date filter
      if (dateFilter) {
        constraints.push(where('timestamp', '>=', dateFilter));
      }

      constraints.push(orderBy('timestamp', 'desc'));

      const q = query(transactionsRef, ...constraints);
      const snapshot = await getDocs(q);
      const txns = snapshot.docs.map((doc) => ({ ...doc.data() })) as TransactionExtended[];

      // Fetch customer names and branch names
      const customerIds = [...new Set(txns.map((t) => t.customerId))];
      const branchIds = [...new Set(txns.map((t) => t.branchId))];

      const customerMap: Record<string, string> = {};
      const branchMap: Record<string, string> = {};

      // Fetch customers
      for (const customerId of customerIds) {
        try {
          const customerDoc = await getDoc(doc(db, 'customers', customerId));
          if (customerDoc.exists()) {
            customerMap[customerId] = customerDoc.data().name || 'Unknown';
          } else {
            customerMap[customerId] = 'Unknown Customer';
          }
        } catch {
          customerMap[customerId] = 'Unknown Customer';
        }
      }

      // Fetch branches (only if super admin)
      if (isSuperAdmin) {
        for (const branchId of branchIds) {
          try {
            const branchDoc = await getDoc(doc(db, 'branches', branchId));
            if (branchDoc.exists()) {
              branchMap[branchId] = branchDoc.data().name || branchId;
            } else {
              branchMap[branchId] = branchId;
            }
          } catch {
            branchMap[branchId] = branchId;
          }
        }
      }

      // Attach names to transactions
      return txns.map((t) => ({
        ...t,
        customerName: customerMap[t.customerId],
        branchName: isSuperAdmin ? branchMap[t.branchId] : undefined,
      }));
    },
    enabled: !!userData,
  });

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === selectedStatus);
    }

    // Method filter
    if (selectedMethod !== 'all') {
      filtered = filtered.filter((t) => t.method === selectedMethod);
    }

    // Search filter (transaction ID, order ID, customer name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transactionId.toLowerCase().includes(query) ||
          t.orderId.toLowerCase().includes(query) ||
          (t.customerName && t.customerName.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [transactions, selectedStatus, selectedMethod, searchQuery]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const completed = filteredTransactions.filter((t) => t.status === 'completed');
    const pending = filteredTransactions.filter((t) => t.status === 'pending');
    const failed = filteredTransactions.filter((t) => t.status === 'failed');

    return {
      totalRevenue: completed.reduce((sum, t) => sum + t.amount, 0),
      pendingAmount: pending.reduce((sum, t) => sum + t.amount, 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
    };
  }, [filteredTransactions]);

  // CSV Export
  const handleExport = () => {
    if (filteredTransactions.length === 0) return;

    const csvContent = [
      [
        'Transaction ID',
        'Order ID',
        'Customer',
        'Amount',
        'Method',
        'Status',
        ...(isSuperAdmin ? ['Branch'] : []),
        'Timestamp',
      ],
      ...filteredTransactions.map((t) => [
        t.transactionId,
        t.orderId,
        t.customerName || 'Unknown',
        formatCurrency(t.amount),
        t.method,
        t.status,
        ...(isSuperAdmin ? [t.branchName || t.branchId] : []),
        new Date(t.timestamp.seconds * 1000).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Status badge helper
  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Method badge helper
  const getMethodBadge = (method: PaymentMethod) => {
    const colors: Record<PaymentMethod, string> = {
      cash: 'bg-gray-100 text-gray-700 border-gray-200',
      mpesa: 'bg-green-100 text-green-700 border-green-200',
      card: 'bg-blue-100 text-blue-700 border-blue-200',
      credit: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
      <Badge className={colors[method]}>
        {method === 'mpesa' ? 'M-Pesa' : method.charAt(0).toUpperCase() + method.slice(1)}
      </Badge>
    );
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Transactions"
        description="View and manage all financial transactions"
        action={
          <Button
            onClick={handleExport}
            variant="outline"
            disabled={isLoading || filteredTransactions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{summaryStats.completedCount} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">{summaryStats.pendingCount} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.failedCount}</div>
            <p className="text-xs text-muted-foreground">Failed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground">All records</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Filter (Super Admin Only) */}
            {isSuperAdmin && branches.length > 0 && (
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.branchId} value={branch.branchId}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Method Filter */}
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by transaction ID, order ID, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
            <p className="text-sm text-gray-500 mt-2">
              {searchQuery || selectedStatus !== 'all' || selectedMethod !== 'all'
                ? 'Try adjusting your filters'
                : 'Transactions will appear here once payments are processed'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    {isSuperAdmin && <TableHead>Branch</TableHead>}
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.transactionId}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionId}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {transaction.orderId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.customerName || 'Unknown'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{getMethodBadge(transaction.method)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      {isSuperAdmin && (
                        <TableCell className="text-gray-600">
                          {transaction.branchName || transaction.branchId}
                        </TableCell>
                      )}
                      <TableCell className="text-gray-600">
                        {new Date(transaction.timestamp.seconds * 1000).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information for transaction {selectedTransaction?.transactionId}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Status and Method */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedTransaction.status)}
                {getMethodBadge(selectedTransaction.method)}
              </div>

              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p className="text-sm font-mono mt-1">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p className="text-sm font-mono mt-1">{selectedTransaction.orderId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-sm mt-1">{selectedTransaction.customerName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Timestamp</p>
                  <p className="text-sm mt-1">
                    {new Date(selectedTransaction.timestamp.seconds * 1000).toLocaleString()}
                  </p>
                </div>
                {isSuperAdmin && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Branch</p>
                    <p className="text-sm mt-1">
                      {selectedTransaction.branchName || selectedTransaction.branchId}
                    </p>
                  </div>
                )}
                {selectedTransaction.pesapalRef && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Pesapal Reference</p>
                    <p className="text-sm font-mono mt-1">{selectedTransaction.pesapalRef}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Processed By</p>
                  <p className="text-sm mt-1">{selectedTransaction.processedBy}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
