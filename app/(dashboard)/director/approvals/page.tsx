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
  AlertTriangle,
  User,
  Building2,
  Calendar,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PermissionRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  branchId: string;
  branchName: string;
  type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

const requestTypeLabels: Record<string, string> = {
  'overtime': 'Overtime Approval',
  'expense': 'Expense Reimbursement',
  'inventory': 'Inventory Adjustment',
  'discount': 'Special Discount',
  'refund': 'Customer Refund',
  'leave': 'Staff Leave Request',
  'transfer': 'Staff Transfer',
  'equipment': 'Equipment Purchase'
};

export default function DirectorApprovalsPage() {
  const { userData, user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Verify director role
  useEffect(() => {
    if (userData && userData.role !== 'director') {
      router.push('/dashboard');
    }
  }, [userData, router]);

  const fetchRequests = async () => {
    try {
      // Fetch branches for name mapping
      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchMap: Record<string, string> = {};
      branchesSnap.docs.forEach(doc => {
        const data = doc.data() as { name?: string };
        branchMap[doc.id] = data.name || doc.id;
      });

      // Fetch users for name mapping
      const usersSnap = await getDocs(collection(db, 'users'));
      const userMap: Record<string, string> = {};
      usersSnap.docs.forEach(doc => {
        const data = doc.data() as { name?: string };
        userMap[doc.id] = data.name || 'Unknown';
      });

      // Fetch permission requests
      let requestsQuery;
      if (filter === 'all') {
        requestsQuery = query(
          collection(db, 'permissionRequests'),
          orderBy('createdAt', 'desc')
        );
      } else {
        requestsQuery = query(
          collection(db, 'permissionRequests'),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const requestsSnap = await getDocs(requestsQuery);
      const requestsList = requestsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          requestedBy: data.requestedBy || '',
          requestedByName: userMap[data.requestedBy] || 'Unknown',
          branchId: data.branchId || '',
          branchName: branchMap[data.branchId] || 'Unassigned',
          type: data.type || 'general',
          reason: data.reason || '',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt?.toDate(),
          reviewNotes: data.reviewNotes
        } as PermissionRequest;
      });

      setRequests(requestsList);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    setProcessingId(requestId);
    try {
      await updateDoc(doc(db, 'permissionRequests', requestId), {
        status: 'approved',
        reviewedBy: user.uid,
        reviewedAt: Timestamp.now()
      });
      await fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user) return;
    setProcessingId(requestId);
    try {
      await updateDoc(doc(db, 'permissionRequests', requestId), {
        status: 'rejected',
        reviewedBy: user.uid,
        reviewedAt: Timestamp.now()
      });
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  if (userData?.role !== 'director') {
    return null;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Approvals</h1>
          <p className="text-gray-500 mt-1">Review and approve permission requests from GMs</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-gray-500">Approved (This Month)</p>
              <p className="text-xl font-semibold">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </ModernCard>
        <ModernCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected (This Month)</p>
              <p className="text-xl font-semibold">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </ModernCard>
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
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-lorenzo-teal hover:bg-lorenzo-teal/90' : ''}
          >
            {f === 'pending' ? `Pending (${pendingCount})` :
             f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <ModernCard>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {filter === 'pending' ? 'Pending Approvals' :
             filter === 'all' ? 'All Requests' :
             `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {filter === 'pending' ? 'No pending requests' : 'No requests found'}
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
                          {requestTypeLabels[request.type] || request.type}
                        </h3>
                        <ModernBadge
                          variant={
                            request.status === 'approved' ? 'success' :
                            request.status === 'rejected' ? 'danger' : 'warning'
                          }
                        >
                          {request.status}
                        </ModernBadge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{request.reason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {request.requestedByName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {request.branchName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {request.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>
    </div>
  );
}
