'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  getPendingCashOuts,
  getUnprocessedCashOuts,
  getCashOutsByDateRange,
  approveCashOut,
  rejectCashOut,
  processCashOut,
  createCashOutRequest,
  CASH_OUT_CONFIG,
  type CashOutTransaction,
  type CashOutType,
  type CashOutApprovalStatus,
} from '@/lib/db/cash-out';
import { toast } from 'sonner';

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'finance_manager', 'store_manager'];

const CASH_OUT_TYPES: { value: CashOutType; label: string }[] = [
  { value: 'uncollected_garment', label: 'Uncollected Garment Disposal' },
  { value: 'discount', label: 'Discount' },
  { value: 'compensation', label: 'Compensation' },
  { value: 'order_cancellation', label: 'Order Cancellation Refund' },
  { value: 'price_adjustment', label: 'Price Adjustment' },
  { value: 'loyalty_redemption', label: 'Loyalty Redemption' },
];

const STATUS_COLORS: Record<CashOutApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function CashOutManagementPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cashOuts, setCashOuts] = useState<CashOutTransaction[]>([]);
  const [selectedCashOut, setSelectedCashOut] = useState<CashOutTransaction | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'bank_transfer' | 'credit'>(
    'cash'
  );
  const [paymentReference, setPaymentReference] = useState('');
  const [processing, setProcessing] = useState(false);

  // Create form state
  const [newCashOut, setNewCashOut] = useState({
    transactionType: '' as CashOutType | '',
    orderId: '',
    orderDisplayId: '',
    customerName: '',
    amount: '',
    reason: '',
    reasonCategory: '',
  });

  // Check role access
  useEffect(() => {
    if (userData && !ALLOWED_ROLES.includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchCashOuts = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const branchId =
        userData?.isSuperAdmin || ['admin', 'director', 'general_manager'].includes(userData?.role || '')
          ? undefined
          : userData?.branchId;

      const transactions = await getCashOutsByDateRange(thirtyDaysAgo, new Date(), branchId);
      setCashOuts(transactions);
    } catch (error) {
      console.error('Error fetching cash outs:', error);
      toast.error('Failed to load cash out transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchCashOuts();
    }
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCashOuts();
  };

  const canApprove = (amount: number): boolean => {
    if (!userData) return false;
    const role = userData.role;
    if (role === 'director') return true;
    if (role === 'general_manager' || role === 'admin')
      return amount <= CASH_OUT_CONFIG.gmApprovalLimit;
    if (role === 'store_manager' || role === 'finance_manager')
      return amount <= CASH_OUT_CONFIG.managerApprovalLimit;
    return false;
  };

  const handleApprove = async () => {
    if (!selectedCashOut || !userData) return;

    setProcessing(true);
    try {
      await approveCashOut(
        selectedCashOut.transactionId,
        userData.uid,
        userData.name || userData.email || 'Unknown',
        approvalNotes
      );
      toast.success('Cash out approved successfully');
      setIsApproveDialogOpen(false);
      setSelectedCashOut(null);
      setApprovalNotes('');
      fetchCashOuts();
    } catch (error) {
      console.error('Error approving cash out:', error);
      toast.error('Failed to approve cash out');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCashOut || !userData || !rejectReason) return;

    setProcessing(true);
    try {
      await rejectCashOut(
        selectedCashOut.transactionId,
        userData.uid,
        userData.name || userData.email || 'Unknown',
        rejectReason
      );
      toast.success('Cash out rejected');
      setIsRejectDialogOpen(false);
      setSelectedCashOut(null);
      setRejectReason('');
      fetchCashOuts();
    } catch (error) {
      console.error('Error rejecting cash out:', error);
      toast.error('Failed to reject cash out');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!selectedCashOut || !userData) return;

    setProcessing(true);
    try {
      await processCashOut(
        selectedCashOut.transactionId,
        userData.uid,
        paymentMethod,
        paymentReference || undefined
      );
      toast.success('Cash out processed successfully');
      setIsProcessDialogOpen(false);
      setSelectedCashOut(null);
      setPaymentMethod('cash');
      setPaymentReference('');
      fetchCashOuts();
    } catch (error) {
      console.error('Error processing cash out:', error);
      toast.error('Failed to process cash out');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateCashOut = async () => {
    if (
      !userData ||
      !newCashOut.transactionType ||
      !newCashOut.amount ||
      !newCashOut.reason
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      await createCashOutRequest({
        transactionType: newCashOut.transactionType as CashOutType,
        orderId: newCashOut.orderId || undefined,
        orderDisplayId: newCashOut.orderDisplayId || undefined,
        customerName: newCashOut.customerName || undefined,
        branchId: userData.branchId || 'unknown',
        branchName: 'Unknown Branch', // Branch name will be resolved by backend
        amount: parseFloat(newCashOut.amount),
        reason: newCashOut.reason,
        reasonCategory: newCashOut.reasonCategory || undefined,
        requestedBy: userData.uid,
        requestedByName: userData.name || userData.email || 'Unknown',
      });
      toast.success('Cash out request created');
      setIsCreateDialogOpen(false);
      setNewCashOut({
        transactionType: '',
        orderId: '',
        orderDisplayId: '',
        customerName: '',
        amount: '',
        reason: '',
        reasonCategory: '',
      });
      fetchCashOuts();
    } catch (error) {
      console.error('Error creating cash out:', error);
      toast.error('Failed to create cash out request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredCashOuts = cashOuts.filter((co) => {
    if (statusFilter !== 'all' && co.approvalStatus !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        co.transactionId.toLowerCase().includes(query) ||
        co.orderDisplayId?.toLowerCase().includes(query) ||
        co.customerName?.toLowerCase().includes(query) ||
        co.reason.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Cash Out Management"
        description="Manage cash out requests, approvals, and processing"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, order, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {cashOuts.filter((c) => c.approvalStatus === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {cashOuts.filter((c) => c.approvalStatus === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {cashOuts.filter((c) => c.approvalStatus === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    cashOuts
                      .filter((c) => c.approvalStatus !== 'rejected')
                      .reduce((sum, c) => sum + c.amount, 0)
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Out Transactions</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredCashOuts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No cash out transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCashOuts.map((cashOut) => (
                  <TableRow key={cashOut.transactionId}>
                    <TableCell className="font-mono text-sm">
                      {cashOut.transactionId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {cashOut.transactionType.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{cashOut.orderDisplayId || '-'}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(cashOut.amount)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{cashOut.requestedByName}</p>
                        <p className="text-xs text-gray-500">{cashOut.branchName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[cashOut.approvalStatus]}>
                        {cashOut.approvalStatus}
                      </Badge>
                      {cashOut.approvalStatus === 'approved' && !cashOut.isProcessed && (
                        <Badge variant="outline" className="ml-1">
                          Unprocessed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {cashOut.approvalStatus === 'pending' && canApprove(cashOut.amount) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => {
                                setSelectedCashOut(cashOut);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => {
                                setSelectedCashOut(cashOut);
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {cashOut.approvalStatus === 'approved' && !cashOut.isProcessed && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCashOut(cashOut);
                              setIsProcessDialogOpen(true);
                            }}
                          >
                            Process
                          </Button>
                        )}
                        {cashOut.approvalStatus === 'pending' && !canApprove(cashOut.amount) && (
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Higher Approval Needed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Cash Out</DialogTitle>
            <DialogDescription>
              Approve cash out of {selectedCashOut && formatCurrency(selectedCashOut.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCashOut && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="text-gray-500">Type:</span>{' '}
                  {selectedCashOut.transactionType.replace(/_/g, ' ')}
                </p>
                <p>
                  <span className="text-gray-500">Reason:</span> {selectedCashOut.reason}
                </p>
                <p>
                  <span className="text-gray-500">Requested by:</span>{' '}
                  {selectedCashOut.requestedByName}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="approvalNotes">Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Add any notes for this approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cash Out</DialogTitle>
            <DialogDescription>
              Reject cash out of {selectedCashOut && formatCurrency(selectedCashOut.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason for Rejection *</Label>
              <Textarea
                id="rejectReason"
                placeholder="Provide reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Cash Out Payment</DialogTitle>
            <DialogDescription>
              Process payment of {selectedCashOut && formatCurrency(selectedCashOut.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  setPaymentMethod(v as typeof paymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit">Store Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentReference">Reference (Optional)</Label>
              <Input
                id="paymentReference"
                placeholder="Transaction reference..."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcess} disabled={processing}>
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Cash Out Request</DialogTitle>
            <DialogDescription>Create a new cash out request for approval</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionType">Type *</Label>
              <Select
                value={newCashOut.transactionType}
                onValueChange={(v) =>
                  setNewCashOut({ ...newCashOut, transactionType: v as CashOutType })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CASH_OUT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderDisplayId">Order ID (Optional)</Label>
              <Input
                id="orderDisplayId"
                placeholder="ORD-XXX-XXXXXXXX-XXXX"
                value={newCashOut.orderDisplayId}
                onChange={(e) =>
                  setNewCashOut({ ...newCashOut, orderDisplayId: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                placeholder="Customer name"
                value={newCashOut.customerName}
                onChange={(e) =>
                  setNewCashOut({ ...newCashOut, customerName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newCashOut.amount}
                onChange={(e) => setNewCashOut({ ...newCashOut, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reasonCategory">Category</Label>
              <Select
                value={newCashOut.reasonCategory}
                onValueChange={(v) => setNewCashOut({ ...newCashOut, reasonCategory: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CASH_OUT_CONFIG.reasonCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Detailed reason for this cash out..."
                value={newCashOut.reason}
                onChange={(e) => setNewCashOut({ ...newCashOut, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCashOut}
              disabled={
                processing ||
                !newCashOut.transactionType ||
                !newCashOut.amount ||
                !newCashOut.reason
              }
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
