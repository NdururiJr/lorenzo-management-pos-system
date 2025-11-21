'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ArrowRight, ArrowDownUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getTransfersByBranch } from '@/lib/db/inventory-transfers';
import type { InventoryTransfer, InventoryTransferStatus } from '@/lib/db/schema';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface BranchTransfersProps {
  branchId: string;
}

function getStatusColor(status: InventoryTransferStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700';
    case 'requested':
      return 'bg-blue-100 text-blue-700';
    case 'approved':
      return 'bg-green-100 text-green-700';
    case 'in_transit':
      return 'bg-purple-100 text-purple-700';
    case 'received':
      return 'bg-indigo-100 text-indigo-700';
    case 'reconciled':
      return 'bg-emerald-100 text-emerald-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function BranchTransfers({ branchId }: BranchTransfersProps) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;

  const [outgoingTransfers, setOutgoingTransfers] = useState<InventoryTransfer[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<InventoryTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransfers() {
      try {
        setLoading(true);

        // Load outgoing transfers (from this branch)
        const outgoing = await getTransfersByBranch(branchId, 'from');
        // Limit to 10 most recent
        setOutgoingTransfers(outgoing.slice(0, 10));

        // Load incoming transfers (to this branch)
        const incoming = await getTransfersByBranch(branchId, 'to');
        // Limit to 10 most recent
        setIncomingTransfers(incoming.slice(0, 10));
      } catch (error) {
        console.error('Error loading transfers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTransfers();
  }, [branchId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton className="h-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTransferCard = (transfer: InventoryTransfer, type: 'outgoing' | 'incoming') => {
    const otherBranchId = type === 'outgoing' ? transfer.toBranchId : transfer.fromBranchId;
    const itemCount = transfer.items?.length || 0;

    return (
      <div
        key={transfer.transferId}
        className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-black truncate">
              {transfer.transferId}
            </p>
            <Badge className={`${getStatusColor(transfer.status)} capitalize`}>
              {transfer.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            {type === 'outgoing' ? (
              <>
                <ArrowUpCircle className="w-3 h-3 text-red-500" />
                <span>To: {otherBranchId}</span>
              </>
            ) : (
              <>
                <ArrowDownCircle className="w-3 h-3 text-green-500" />
                <span>From: {otherBranchId}</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {itemCount} item{itemCount !== 1 ? 's' : ''} • {' '}
            {formatDistanceToNow(transfer.createdAt.toDate(), { addSuffix: true })}
          </p>
        </div>
        {canManage && (
          <div className="ml-4">
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Outgoing Transfers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-red-500" />
            Outgoing Transfers
            {outgoingTransfers.length > 0 && (
              <Badge variant="secondary">{outgoingTransfers.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outgoingTransfers.length === 0 ? (
            <EmptyState
              icon={ArrowDownUp}
              heading="No outgoing transfers"
              description="Create a transfer to send items to other branches"
            />
          ) : (
            <div className="space-y-3">
              {outgoingTransfers.map((transfer) =>
                renderTransferCard(transfer, 'outgoing')
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incoming Transfers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-green-500" />
            Incoming Transfers
            {incomingTransfers.length > 0 && (
              <Badge variant="secondary">{incomingTransfers.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomingTransfers.length === 0 ? (
            <EmptyState
              icon={ArrowDownUp}
              heading="No incoming transfers"
              description="Incoming transfers from other branches will appear here"
            />
          ) : (
            <div className="space-y-3">
              {incomingTransfers.map((transfer) =>
                renderTransferCard(transfer, 'incoming')
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
