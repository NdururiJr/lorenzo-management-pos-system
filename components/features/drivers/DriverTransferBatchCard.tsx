/**
 * Driver Transfer Batch Card Component
 *
 * Displays a transfer batch assigned to a driver with origin/destination
 * branch details and action buttons.
 *
 * @module components/features/drivers/DriverTransferBatchCard
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  MapPin,
  Phone,
  Package,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDocument } from '@/lib/db/index';
import { markBatchDispatched } from '@/lib/db/transfers';
import type { TransferBatch, Branch } from '@/lib/db/schema';

interface DriverTransferBatchCardProps {
  batch: TransferBatch;
  onStatusChange?: () => void;
}

export function DriverTransferBatchCard({
  batch,
  onStatusChange,
}: DriverTransferBatchCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch origin (satellite) branch details
  const { data: originBranch, isLoading: loadingOrigin } = useQuery({
    queryKey: ['branch', batch.satelliteBranchId],
    queryFn: () => getDocument<Branch>('branches', batch.satelliteBranchId),
  });

  // Fetch destination (main store) branch details
  const { data: destBranch, isLoading: loadingDest } = useQuery({
    queryKey: ['branch', batch.mainStoreBranchId],
    queryFn: () => getDocument<Branch>('branches', batch.mainStoreBranchId),
  });

  const handleStartTransfer = async () => {
    setIsUpdating(true);
    try {
      await markBatchDispatched(batch.batchId);
      toast.success('Transfer started! Batch marked as in transit.');
      onStatusChange?.();
    } catch (error) {
      console.error('Error starting transfer:', error);
      toast.error('Failed to start transfer');
    } finally {
      setIsUpdating(false);
    }
  };

  const openNavigation = (address: string) => {
    // Open in Google Maps
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const getStatusBadge = () => {
    switch (batch.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending Pickup
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Truck className="w-3 h-3 mr-1" />
            In Transit
          </Badge>
        );
      case 'received':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      default:
        return null;
    }
  };

  const isLoading = loadingOrigin || loadingDest;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-lorenzo-deep-teal to-lorenzo-teal p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span className="font-semibold">{batch.batchId}</span>
            </div>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-white/80">
            <Package className="w-4 h-4" />
            <span>{batch.totalOrders} order{batch.totalOrders !== 1 ? 's' : ''}</span>
            {batch.createdAt && (
              <>
                <span className="mx-2">•</span>
                <span>
                  Created {format(batch.createdAt.toDate(), 'MMM d, h:mm a')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Route Details */}
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-100 rounded-lg" />
              <div className="h-16 bg-gray-100 rounded-lg" />
            </div>
          ) : (
            <>
              {/* Origin - Satellite Store */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                    Pickup From
                  </div>
                  <div className="font-semibold text-gray-900">
                    {originBranch?.name || batch.satelliteBranchId}
                  </div>
                  {originBranch?.location?.address && (
                    <p className="text-sm text-gray-600 truncate">
                      {originBranch.location.address}
                    </p>
                  )}
                  {originBranch?.contactPhone && (
                    <a
                      href={`tel:${originBranch.contactPhone}`}
                      className="inline-flex items-center gap-1 text-sm text-amber-600 mt-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {originBranch.contactPhone}
                    </a>
                  )}
                </div>
                {originBranch?.location?.address && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={() => openNavigation(originBranch.location.address)}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Destination - Main Store */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    Deliver To
                  </div>
                  <div className="font-semibold text-gray-900">
                    {destBranch?.name || batch.mainStoreBranchId}
                  </div>
                  {destBranch?.location?.address && (
                    <p className="text-sm text-gray-600 truncate">
                      {destBranch.location.address}
                    </p>
                  )}
                  {destBranch?.contactPhone && (
                    <a
                      href={`tel:${destBranch.contactPhone}`}
                      className="inline-flex items-center gap-1 text-sm text-green-600 mt-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {destBranch.contactPhone}
                    </a>
                  )}
                </div>
                {destBranch?.location?.address && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0"
                    onClick={() => openNavigation(destBranch.location.address)}
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Action Button */}
          {batch.status === 'pending' && (
            <Button
              onClick={handleStartTransfer}
              disabled={isUpdating}
              className="w-full bg-lorenzo-teal hover:bg-lorenzo-deep-teal text-white"
            >
              {isUpdating ? (
                'Starting...'
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Start Transfer
                </>
              )}
            </Button>
          )}

          {batch.status === 'in_transit' && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-center">
              <p className="text-sm text-blue-700">
                <Truck className="w-4 h-4 inline mr-1" />
                In transit - Deliver to main store to complete
              </p>
              {batch.dispatchedAt && (
                <p className="text-xs text-blue-600 mt-1">
                  Started {format(batch.dispatchedAt.toDate(), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
          )}

          {batch.status === 'received' && batch.receivedAt && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
              <p className="text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Delivered successfully
              </p>
              <p className="text-xs text-green-600 mt-1">
                Received {format(batch.receivedAt.toDate(), 'MMM d, h:mm a')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
