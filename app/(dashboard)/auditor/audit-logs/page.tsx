'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { getRecentAuditLogs, getAuditLogsByBranch } from '@/lib/db/audit-logs';
import type { AuditLogAction, AuditLog } from '@/lib/db/schema';
import { getActiveBranches } from '@/lib/db/index';
import type { Branch } from '@/lib/db/schema';

const ALLOWED_ROLES = ['admin', 'director', 'general_manager', 'auditor', 'finance_manager'];

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  transfer: 'Transferred',
  approve: 'Approved',
  reject: 'Rejected',
  login: 'Login',
  logout: 'Logout',
  role_change: 'Role Changed',
  branch_access_change: 'Access Changed',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  transfer: 'bg-purple-100 text-purple-800',
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  login: 'bg-gray-100 text-gray-800',
  logout: 'bg-gray-100 text-gray-800',
  role_change: 'bg-amber-100 text-amber-800',
  branch_access_change: 'bg-amber-100 text-amber-800',
};

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Resources' },
  { value: 'order', label: 'Orders' },
  { value: 'customer', label: 'Customers' },
  { value: 'user', label: 'Users' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'inventory_transfer', label: 'Inventory Transfers' },
  { value: 'delivery', label: 'Deliveries' },
  { value: 'transaction', label: 'Transactions' },
  { value: 'voucher', label: 'Vouchers' },
  { value: 'cash_out', label: 'Cash Outs' },
];

const ACTION_TYPES = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'role_change', label: 'Role Change' },
  { value: 'branch_access_change', label: 'Branch Access Change' },
];

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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

  const fetchLogs = useCallback(async () => {
    try {
      let fetchedLogs: AuditLog[];

      if (selectedBranchId !== 'all') {
        fetchedLogs = await getAuditLogsByBranch(
          selectedBranchId,
          1000,
          actionFilter !== 'all' ? (actionFilter as AuditLogAction) : undefined
        );
      } else {
        fetchedLogs = await getRecentAuditLogs(
          1000,
          actionFilter !== 'all' ? (actionFilter as AuditLogAction) : undefined
        );
      }

      setLogs(fetchedLogs);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBranchId, actionFilter]);

  useEffect(() => {
    if (userData) {
      fetchLogs();
    }
  }, [userData, selectedBranchId, actionFilter, fetchLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  // Filter and paginate logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (resourceFilter !== 'all' && log.resourceType !== resourceFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.auditLogId?.toLowerCase().includes(query) ||
          log.resourceId?.toLowerCase().includes(query) ||
          log.description?.toLowerCase().includes(query) ||
          log.performedByName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [logs, resourceFilter, searchQuery]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const handleExport = () => {
    const rows = [
      ['Audit Log Export'],
      [`Generated: ${new Date().toISOString()}`],
      [''],
      ['Timestamp', 'Action', 'Resource Type', 'Resource ID', 'User', 'Description'],
      ...filteredLogs.map((log) => [
        log.timestamp?.toDate?.().toISOString() || '',
        log.action,
        log.resourceType,
        log.resourceId,
        log.performedByName,
        log.description,
      ]),
    ];

    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const viewLogDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  if (!userData || !ALLOWED_ROLES.includes(userData.role)) {
    return null;
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Audit Logs"
        description="Complete history of system activities and changes"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
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
                  placeholder="Search by ID, user, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((resource) => (
                  <SelectItem key={resource.value} value={resource.value}>
                    {resource.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {branches.length > 0 && (
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Branch" />
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

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {paginatedLogs.length} of {filteredLogs.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No audit logs found for the selected filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log, index) => (
                    <TableRow key={log.auditLogId || index}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {log.timestamp?.toDate?.().toLocaleString() || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100'}>
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm capitalize">
                            {log.resourceType.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{log.resourceId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{log.performedByName}</p>
                          <p className="text-xs text-gray-500 capitalize">{log.performedByRole}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm truncate">{log.description}</p>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewLogDetail(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog?.auditLogId}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="font-medium">
                    {selectedLog.timestamp?.toDate?.().toLocaleString() || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Action</p>
                  <Badge className={ACTION_COLORS[selectedLog.action] || 'bg-gray-100'}>
                    {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resource Type</p>
                  <p className="font-medium capitalize">
                    {selectedLog.resourceType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resource ID</p>
                  <p className="font-mono text-sm">{selectedLog.resourceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Performed By</p>
                  <p className="font-medium">{selectedLog.performedByName}</p>
                  <p className="text-xs text-gray-500 capitalize">{selectedLog.performedByRole}</p>
                </div>
                {selectedLog.branchId && (
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium">
                      {branches.find((b) => b.branchId === selectedLog.branchId)?.name ||
                        selectedLog.branchId}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedLog.description}</p>
              </div>

              {selectedLog.changes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Changes</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.changes.before && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Before</p>
                        <pre className="bg-red-50 p-3 rounded-lg text-xs overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.changes.after && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">After</p>
                        <pre className="bg-green-50 p-3 rounded-lg text-xs overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.additionalBranchIds && selectedLog.additionalBranchIds.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Additional Branches Affected</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.additionalBranchIds.map((branchId) => (
                      <Badge key={branchId} variant="outline">
                        {branches.find((b) => b.branchId === branchId)?.name || branchId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(selectedLog.ipAddress || selectedLog.userAgent) && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Technical Details</p>
                  {selectedLog.ipAddress && (
                    <p className="text-xs">
                      <span className="text-gray-500">IP Address:</span> {selectedLog.ipAddress}
                    </p>
                  )}
                  {selectedLog.userAgent && (
                    <p className="text-xs mt-1">
                      <span className="text-gray-500">User Agent:</span> {selectedLog.userAgent}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
