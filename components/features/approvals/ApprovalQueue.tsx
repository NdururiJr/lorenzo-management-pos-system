'use client';

/**
 * Approval Queue Component
 *
 * Displays a queue of approval requests with filtering and actions.
 *
 * @module components/features/approvals/ApprovalQueue
 */

import { useState, useEffect, useCallback } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Search,
  Filter,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApprovalRequestCard } from './ApprovalRequestCard';
import type {
  ApprovalRequest,
  ApprovalType,
  ApprovalStatus,
} from '@/lib/workflows/approval';
import {
  getPendingApprovalsForUser,
  getApprovalsByType,
  approveRequest,
  rejectRequest,
  escalateRequest,
  addComment,
  canApprove as checkCanApprove,
  WORKFLOW_CONFIGS,
} from '@/lib/workflows/approval';
import { toast } from 'sonner';

interface ApprovalQueueProps {
  /** Initial filter by type */
  initialType?: ApprovalType | 'all';
  /** Show only pending requests */
  pendingOnly?: boolean;
  /** Branch ID filter */
  branchId?: string;
  /** Callback when an action is taken */
  onAction?: () => void;
}

export function ApprovalQueue({
  initialType = 'all',
  pendingOnly = false,
  branchId,
  onAction,
}: ApprovalQueueProps) {
  const { userData } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<ApprovalType | 'all'>(initialType);
  const [filterStatus, _setFilterStatus] = useState<ApprovalStatus | 'all'>(
    pendingOnly ? 'pending' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = useCallback(async () => {
    if (!userData) return;

    try {
      let data: ApprovalRequest[];

      if (filterType === 'all' && filterStatus === 'pending') {
        // Get all pending requests the user can approve
        data = await getPendingApprovalsForUser(userData.role, branchId || userData.branchId);
      } else if (filterType !== 'all') {
        // Get requests by specific type
        data = await getApprovalsByType(
          filterType,
          filterStatus !== 'all' ? filterStatus : undefined,
          branchId || userData.branchId
        );
      } else {
        // Get all requests for the branch
        data = await getPendingApprovalsForUser(userData.role, branchId || userData.branchId);

        // If not pending only, we need to fetch all statuses
        if (filterStatus !== 'pending') {
          const allTypes = Object.keys(WORKFLOW_CONFIGS) as ApprovalType[];
          const allRequests = await Promise.all(
            allTypes.map((type) =>
              getApprovalsByType(
                type,
                filterStatus !== 'all' ? filterStatus : undefined,
                branchId || userData.branchId
              )
            )
          );
          data = allRequests.flat();
        }
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter(
          (r) =>
            r.description.toLowerCase().includes(query) ||
            r.requestedByName.toLowerCase().includes(query) ||
            r.id.toLowerCase().includes(query)
        );
      }

      // Sort by created date (newest first)
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch approval requests:', error);
      toast.error('Failed to load approval requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData, filterType, filterStatus, searchQuery, branchId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = async (requestId: string, comment?: string) => {
    if (!userData) return;
    try {
      await approveRequest(
        requestId,
        userData.uid,
        userData.name || userData.email || 'Unknown',
        userData.role,
        comment
      );
      toast.success('Request approved successfully');
      fetchRequests();
      onAction?.();
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    if (!userData) return;
    try {
      await rejectRequest(
        requestId,
        userData.uid,
        userData.name || userData.email || 'Unknown',
        userData.role,
        reason
      );
      toast.success('Request rejected');
      fetchRequests();
      onAction?.();
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleEscalate = async (requestId: string, comment?: string) => {
    if (!userData) return;
    try {
      await escalateRequest(
        requestId,
        userData.uid,
        userData.name || userData.email || 'Unknown',
        userData.role,
        comment
      );
      toast.success('Request escalated to higher authority');
      fetchRequests();
      onAction?.();
    } catch (error) {
      console.error('Failed to escalate request:', error);
      toast.error('Failed to escalate request');
    }
  };

  const handleComment = async (requestId: string, comment: string) => {
    if (!userData) return;
    try {
      await addComment(
        requestId,
        userData.uid,
        userData.name || userData.email || 'Unknown',
        userData.role,
        comment
      );
      toast.success('Comment added');
      fetchRequests();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const filteredByStatus = (status: ApprovalStatus | 'all') => {
    if (status === 'all') return requests;
    return requests.filter((r) => r.status === status);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading approval requests...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as ApprovalType | 'all')}
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(WORKFLOW_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {pendingOnly ? (
        // Simple list for pending only view
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Pending Approvals
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Requests waiting for your approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending approval requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <ApprovalRequestCard
                    key={request.id}
                    request={request}
                    canApprove={userData ? checkCanApprove(userData.role, request) : false}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onEscalate={handleEscalate}
                    onComment={handleComment}
                    loading={refreshing}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Tabbed view for all statuses
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <Badge className="ml-2 h-5 px-1.5 bg-yellow-500">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <TabsContent key={status} value={status}>
              <Card>
                <CardContent className="pt-6">
                  {filteredByStatus(status as ApprovalStatus | 'all').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No {status === 'all' ? '' : status} requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredByStatus(status as ApprovalStatus | 'all').map((request) => (
                        <ApprovalRequestCard
                          key={request.id}
                          request={request}
                          canApprove={
                            userData && request.status === 'pending'
                              ? checkCanApprove(userData.role, request)
                              : false
                          }
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onEscalate={handleEscalate}
                          onComment={handleComment}
                          loading={refreshing}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

export default ApprovalQueue;
