'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Package,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  FileText,
  Trash2,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import { createDisposalCashOut } from '@/lib/db/cash-out';
import { getActiveBranches } from '@/lib/db/index';
import type { Order, Branch } from '@/lib/db/schema';
import { toast } from 'sonner';
import Link from 'next/link';

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'finance_manager'];

interface UncollectedOrder extends Order {
  id: string; // Firestore document ID
  daysOld: number;
  customerEmail?: string; // Optional - fetched from customer record
}

export default function UncollectedOrdersPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('90');
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orders, setOrders] = useState<UncollectedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<UncollectedOrder | null>(null);
  const [isDisposalDialogOpen, setIsDisposalDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [disposalNotes, setDisposalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Check role access
  useEffect(() => {
    if (userData && !ALLOWED_ROLES.includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchList = await getActiveBranches();
        setBranches(branchList);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const fetchUncollectedOrders = useCallback(async () => {
    try {
      const daysThreshold = parseInt(ageFilter);
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

      // Query orders that are ready but not collected
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'ready'),
        where('updatedAt', '<=', Timestamp.fromDate(thresholdDate))
      );

      const snapshot = await getDocs(ordersQuery);
      const uncollected: UncollectedOrder[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as Order;
        // Apply branch filter
        if (selectedBranchId !== 'all' && data.branchId !== selectedBranchId) return;

        const createdAt = data.createdAt?.toDate?.() || new Date();
        const daysOld = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        uncollected.push({
          ...data,
          id: doc.id,
          daysOld,
        } as UncollectedOrder);
      });

      // Sort by age (oldest first)
      uncollected.sort((a, b) => b.daysOld - a.daysOld);
      setOrders(uncollected);
    } catch (error) {
      console.error('Error fetching uncollected orders:', error);
      toast.error('Failed to load uncollected orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ageFilter, selectedBranchId]);

  useEffect(() => {
    if (userData) {
      fetchUncollectedOrders();
    }
  }, [userData, selectedBranchId, ageFilter, fetchUncollectedOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUncollectedOrders();
  };

  const handleInitiateDisposal = async () => {
    if (!selectedOrder || !userData) return;

    setProcessing(true);
    try {
      // Create a disposal cash-out request that requires GM approval
      await createDisposalCashOut(
        selectedOrder.id || selectedOrder.orderId,
        selectedOrder.orderId,
        selectedOrder.customerId,
        selectedOrder.customerName || 'Unknown Customer',
        selectedOrder.branchId,
        branches.find((b) => b.branchId === selectedOrder.branchId)?.name || 'Unknown Branch',
        selectedOrder.totalAmount || 0,
        userData.uid,
        userData.name || userData.email || 'Unknown',
        disposalNotes
      );

      toast.success('Disposal request created and sent for GM approval');
      setIsDisposalDialogOpen(false);
      setSelectedOrder(null);
      setDisposalNotes('');
      fetchUncollectedOrders();
    } catch (error) {
      console.error('Error creating disposal request:', error);
      toast.error('Failed to create disposal request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderId.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerPhone?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    disposalEligible: orders.filter((o) => o.daysOld >= 90).length,
    totalGarments: orders.reduce((sum, o) => sum + (o.garments?.length || 0), 0),
  };

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Uncollected Orders"
        description="Manage orders that have not been collected by customers"
        action={
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                  placeholder="Search by order ID, customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Age threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30+ days</SelectItem>
                  <SelectItem value="60">60+ days</SelectItem>
                  <SelectItem value="90">90+ days (Disposal)</SelectItem>
                  <SelectItem value="120">120+ days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {branches.length > 0 && (
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
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Disposal Eligible</p>
                <p className="text-2xl font-bold text-red-600">{stats.disposalEligible}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Garments</p>
                <p className="text-2xl font-bold">{stats.totalGarments}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Uncollected Orders</CardTitle>
          <CardDescription>
            Orders ready for {ageFilter}+ days without collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-2" />
              <p>No uncollected orders found for the selected criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id || order.orderId}`}
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {order.orderId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">
                          {branches.find((b) => b.branchId === order.branchId)?.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.customerPhone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {order.customerPhone}
                          </div>
                        )}
                        {order.customerEmail && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {order.customerEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{order.garments?.length || 0} items</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.totalAmount || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.daysOld >= 90 ? 'destructive' : 'secondary'}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {order.daysOld} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.paymentStatus === 'paid'
                            ? 'default'
                            : order.paymentStatus === 'partial'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsReminderDialogOpen(true);
                          }}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        {order.daysOld >= 90 && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDisposalDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Disposal Dialog */}
      <Dialog open={isDisposalDialogOpen} onOpenChange={setIsDisposalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Disposal</DialogTitle>
            <DialogDescription>
              This will create a cash-out request for GM approval
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Disposal Warning</span>
                </div>
                <p className="text-sm text-amber-700">
                  You are about to initiate disposal for order{' '}
                  <strong>{selectedOrder.orderId}</strong>. This order has been uncollected
                  for <strong>{selectedOrder.daysOld} days</strong>.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="text-gray-500">Customer:</span>{' '}
                  {selectedOrder.customerName || 'Unknown'}
                </p>
                <p>
                  <span className="text-gray-500">Items:</span>{' '}
                  {selectedOrder.garments?.length || 0} garments
                </p>
                <p>
                  <span className="text-gray-500">Value:</span>{' '}
                  {formatCurrency(selectedOrder.totalAmount || 0)}
                </p>
                <p>
                  <span className="text-gray-500">Payment Status:</span>{' '}
                  <Badge variant="outline">{selectedOrder.paymentStatus}</Badge>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disposalNotes">Notes</Label>
                <Textarea
                  id="disposalNotes"
                  placeholder="Add any notes for the disposal request..."
                  value={disposalNotes}
                  onChange={(e) => setDisposalNotes(e.target.value)}
                />
              </div>

              <p className="text-sm text-gray-500">
                A cash-out request will be created and sent to the General Manager for
                approval before the items can be disposed of.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisposalDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleInitiateDisposal} disabled={processing}>
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Request Disposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Customer</DialogTitle>
            <DialogDescription>Send a reminder to collect order</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium">{selectedOrder.customerName || 'Unknown Customer'}</p>
                {selectedOrder.customerPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedOrder.customerPhone}
                    </a>
                  </p>
                )}
                {selectedOrder.customerEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${selectedOrder.customerEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedOrder.customerEmail}
                    </a>
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Order:</strong> {selectedOrder.orderId}
                  <br />
                  <strong>Items:</strong> {selectedOrder.garments?.length || 0} garments
                  <br />
                  <strong>Value:</strong> {formatCurrency(selectedOrder.totalAmount || 0)}
                  <br />
                  <strong>Waiting:</strong> {selectedOrder.daysOld} days
                </p>
              </div>

              <div className="flex gap-2">
                {selectedOrder.customerPhone && (
                  <a
                    href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      WhatsApp
                    </Button>
                  </a>
                )}
                {selectedOrder.customerPhone && (
                  <a href={`tel:${selectedOrder.customerPhone}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
