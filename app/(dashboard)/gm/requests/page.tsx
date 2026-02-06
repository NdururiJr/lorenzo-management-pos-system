'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernBadge } from '@/components/modern/ModernBadge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  getMyPermissionRequests,
  cancelPermissionRequest,
  PERMISSION_REQUEST_TYPES,
  PermissionRequest
} from '@/lib/db/permission-requests';
import { CreatePermissionRequestModal } from '@/components/features/permissions/CreatePermissionRequestModal';

export default function GMRequestsPage() {
  const { userData, user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Verify GM role
  useEffect(() => {
    if (userData && userData.role !== 'general_manager') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch branches
      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchList = branchesSnap.docs.map(doc => ({
        id: doc.id,
        name: (doc.data() as { name?: string }).name || doc.id
      }));
      setBranches(branchList);

      // Fetch my requests
      const myRequests = await getMyPermissionRequests(user.uid);
      setRequests(myRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCancel = async (requestId: string) => {
    setCancellingId(requestId);
    try {
      await cancelPermissionRequest(requestId);
      await fetchData();
    } catch (error) {
      console.error('Error cancelling request:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <ModernBadge variant="success">Approved</ModernBadge>;
      case 'rejected':
        return <ModernBadge variant="danger">Rejected</ModernBadge>;
      case 'cancelled':
        return <ModernBadge variant="secondary">Cancelled</ModernBadge>;
      default:
        return <ModernBadge variant="warning">Pending</ModernBadge>;
    }
  };

  if (userData?.role !== 'general_manager') {
    return null;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // Get first branch for the modal (or use userData branchId)
  const defaultBranch = branches.find(b => b.id === userData?.branchId) || branches[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Requests</h1>
          <p className="text-gray-500 mt-1">Submit and track permission requests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-lorenzo-teal hover:bg-lorenzo-teal/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-xl font-semibold">{requests.length}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-semibold">{pendingCount}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-xl font-semibold">{approvedCount}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-xl font-semibold">{rejectedCount}</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Requests List */}
      <ModernCard>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Request History</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No requests yet</p>
              <p className="text-sm mt-1">Create a new request to get started</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {PERMISSION_REQUEST_TYPES[request.type] || request.type}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{request.reason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {request.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </span>
                        {request.amount && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            KES {request.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {request.reviewNotes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          <span className="font-medium">Review Notes:</span> {request.reviewNotes}
                        </div>
                      )}
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleCancel(request.id!)}
                      disabled={cancellingId === request.id}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>

      {/* Create Request Modal */}
      {defaultBranch && (
        <CreatePermissionRequestModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          branchId={defaultBranch.id}
          branchName={defaultBranch.name}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
