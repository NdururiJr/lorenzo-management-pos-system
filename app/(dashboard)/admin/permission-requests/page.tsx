'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernLayout } from '@/components/modern/ModernLayout';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernStatCard } from '@/components/modern/ModernStatCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { ModernButton } from '@/components/modern/ModernButton';
import {
  getPendingPermissionRequests,
  getAllPermissionRequests,
  updatePermissionRequestStatus,
  type PermissionRequest,
  PERMISSION_REQUEST_TYPES,
} from '@/lib/db/permission-requests';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Building2,
  Calendar,
  RefreshCw,
  Loader2,
  FileText,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function PermissionRequestsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Check if user has permission to view this page
  useEffect(() => {
    if (userData && !['director', 'super_admin'].includes(userData.role)) {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchRequests = useCallback(async () => {
    try {
      let data: PermissionRequest[];
      if (filterStatus === 'pending') {
        data = await getPendingPermissionRequests();
      } else if (filterStatus === 'all') {
        data = await getAllPermissionRequests();
      } else {
        data = await getAllPermissionRequests(filterStatus);
      }
      setRequests(data);
    } catch (error) {
      console.error('Error fetching permission requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (userData && ['director', 'super_admin'].includes(userData.role)) {
      fetchRequests();
    }
  }, [userData, filterStatus, fetchRequests]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = async (requestId: string) => {
    if (!userData) return;

    setProcessingId(requestId);
    try {
      await updatePermissionRequestStatus(requestId, 'approved', userData.uid);
      await fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!userData || !showRejectModal) return;

    setProcessingId(showRejectModal);
    try {
      await updatePermissionRequestStatus(showRejectModal, 'rejected', userData.uid, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' | 'light' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overtime':
        return <Clock className="h-4 w-4" />;
      case 'expense':
        return <DollarSign className="h-4 w-4" />;
      case 'leave':
        return <Calendar className="h-4 w-4" />;
      case 'discount':
      case 'refund':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  if (!userData || !['director', 'super_admin'].includes(userData.role)) {
    return null;
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-500 font-medium tracking-wider mb-1">
              GOVERNANCE
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Permission Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve staff permission requests from GM
            </p>
          </div>
          <ModernButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            leftIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </ModernButton>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ModernStatCard
            title="Pending Approval"
            value={pendingCount}
            changeLabel="Awaiting your review"
            icon={<Clock className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Approved"
            value={approvedCount}
            changeLabel="This period"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Rejected"
            value={rejectedCount}
            changeLabel="This period"
            icon={<XCircle className="h-5 w-5" />}
          />
          <ModernStatCard
            title="Total Requests"
            value={requests.length}
            changeLabel="All time"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {[
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'approved', label: 'Approved', count: approvedCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount },
            { key: 'all', label: 'All', count: requests.length },
          ].map((tab) => (
            <ModernButton
              key={tab.key}
              variant={filterStatus === tab.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus(tab.key as FilterStatus)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {tab.count}
                </span>
              )}
            </ModernButton>
          ))}
        </div>

        {/* Request List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <ModernCard className="p-8 text-center">
            <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Requests Found</h3>
            <p className="text-sm text-muted-foreground">
              {filterStatus === 'pending'
                ? 'No pending requests at this time'
                : 'No requests match the selected filter'}
            </p>
          </ModernCard>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <ModernCard
                key={request.id}
                className={`p-4 ${
                  request.status === 'pending' ? 'border-l-4 border-l-amber-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      request.status === 'pending' ? 'bg-amber-100' :
                      request.status === 'approved' ? 'bg-teal-100' : 'bg-red-100'
                    }`}>
                      {getTypeIcon(request.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {PERMISSION_REQUEST_TYPES[request.type] || request.type}
                        </h3>
                        <ModernBadge variant={getStatusColor(request.status)} size="sm">
                          {request.status}
                        </ModernBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                  </div>
                  {request.amount && (
                    <div className="text-right">
                      <span className="text-lg font-bold">
                        KES {request.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {request.requestedByName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {request.branchName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {request.createdAt &&
                      formatDistanceToNow(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (request.createdAt as any).toDate ? (request.createdAt as any).toDate() : new Date(request.createdAt as unknown as string),
                        { addSuffix: true }
                      )}
                  </span>
                </div>

                {request.reviewNotes && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    request.status === 'approved' ? 'bg-teal-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-medium mb-1">
                      <MessageSquare className="h-3 w-3" />
                      {request.status === 'approved' ? 'Approval Note' : 'Rejection Reason'}
                    </div>
                    <p className="text-sm">{request.reviewNotes}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t">
                    <ModernButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRejectModal(request.id || '')}
                      disabled={processingId === request.id}
                      leftIcon={<XCircle className="h-4 w-4" />}
                    >
                      Reject
                    </ModernButton>
                    <ModernButton
                      size="sm"
                      onClick={() => handleApprove(request.id || '')}
                      disabled={processingId === request.id}
                      leftIcon={processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    >
                      {processingId === request.id ? 'Processing...' : 'Approve'}
                    </ModernButton>
                  </div>
                )}
              </ModernCard>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ModernCard className="w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold">Reject Request</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Please provide a reason for rejecting this request. This will be visible to the requester.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-24 p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <div className="flex justify-end gap-3 mt-4">
                <ModernButton
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </ModernButton>
                <ModernButton
                  variant="danger"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || processingId === showRejectModal}
                >
                  {processingId === showRejectModal ? 'Rejecting...' : 'Reject Request'}
                </ModernButton>
              </div>
            </ModernCard>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
