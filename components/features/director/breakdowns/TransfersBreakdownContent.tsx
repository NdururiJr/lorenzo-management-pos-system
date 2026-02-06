'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getTransfersByBranch } from '@/lib/db/inventory-transfers';
import type { InventoryTransfer } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from 'lucide-react';

interface TransfersBreakdownContentProps {
  branchId: string;
}

interface TransfersBreakdown {
  byStatus: Record<string, number>;
  incoming: InventoryTransfer[];
  outgoing: InventoryTransfer[];
  pendingApproval: InventoryTransfer[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  requested: 'Requested',
  approved: 'Approved',
  in_transit: 'In Transit',
  received: 'Received',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  requested: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-purple-100 text-purple-800',
  received: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function TransfersBreakdownContent({ branchId }: TransfersBreakdownContentProps) {
  const [data, setData] = useState<TransfersBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Get all transfers for this branch (both directions)
        const transfers = await getTransfersByBranch(branchId, 'both');

        // Calculate by status
        const byStatus: Record<string, number> = {
          draft: 0,
          requested: 0,
          approved: 0,
          in_transit: 0,
          received: 0,
          completed: 0,
          cancelled: 0,
        };

        transfers.forEach((transfer) => {
          const status = transfer.status || 'draft';
          byStatus[status] = (byStatus[status] || 0) + 1;
        });

        // Separate incoming and outgoing
        const incoming = transfers.filter(
          (t) =>
            t.toBranchId === branchId &&
            ['approved', 'in_transit', 'received'].includes(t.status)
        );

        const outgoing = transfers.filter(
          (t) =>
            t.fromBranchId === branchId &&
            ['approved', 'in_transit'].includes(t.status)
        );

        // Pending approval (for director to act on)
        const pendingApproval = transfers.filter(
          (t) => t.status === 'requested'
        );

        setData({
          byStatus,
          incoming,
          outgoing,
          pendingApproval,
        });
      } catch (error) {
        console.error('Error loading transfers breakdown:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  const handleApprove = async (transferId: string) => {
    // TODO: Implement approve transfer
    console.log('Approve transfer:', transferId);
  };

  const handleReject = async (transferId: string) => {
    // TODO: Implement reject transfer
    console.log('Reject transfer:', transferId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transfer data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Transfer Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byStatus)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[status] || 'bg-gray-100'}
                  >
                    {STATUS_LABELS[status] || status}
                  </Badge>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            {Object.values(data.byStatus).every((v) => v === 0) && (
              <p className="text-sm text-gray-500">No active transfers</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Approval */}
      {data.pendingApproval.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-yellow-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approval ({data.pendingApproval.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.pendingApproval.map((transfer) => (
                <div
                  key={transfer.transferId}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {transfer.transferId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {transfer.createdAt?.toDate
                        ? formatDistanceToNow(transfer.createdAt.toDate(), {
                            addSuffix: true,
                          })
                        : 'Recently'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>
                      {transfer.items?.length || 0} item
                      {(transfer.items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="mx-2">|</span>
                    <span>
                      From: {transfer.fromBranchId}
                    </span>
                    <span>→</span>
                    <span>
                      To: {transfer.toBranchId}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleApprove(transfer.transferId)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleReject(transfer.transferId)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Transfers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-green-700 flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4" />
            Incoming ({data.incoming.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.incoming.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No incoming transfers
            </p>
          ) : (
            <div className="space-y-3">
              {data.incoming.map((transfer) => (
                <div
                  key={transfer.transferId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      From: {transfer.fromBranchId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {transfer.items?.length || 0} items
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[transfer.status] || 'bg-gray-100'}
                  >
                    {STATUS_LABELS[transfer.status] || transfer.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outgoing Transfers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-blue-700 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Outgoing ({data.outgoing.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.outgoing.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No outgoing transfers
            </p>
          ) : (
            <div className="space-y-3">
              {data.outgoing.map((transfer) => (
                <div
                  key={transfer.transferId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      To: {transfer.toBranchId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {transfer.items?.length || 0} items
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[transfer.status] || 'bg-gray-100'}
                  >
                    {STATUS_LABELS[transfer.status] || transfer.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
