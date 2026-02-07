/**
 * Handover Queue Component (FR-004)
 *
 * Customer Service dashboard component for managing QC handovers.
 * Displays pending handovers and allows CS staff to acknowledge,
 * contact customers, and resolve issues.
 *
 * @module components/features/customer-service/HandoverQueue
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getAuth } from 'firebase/auth';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  PhoneForwarded,
  Inbox,
  CheckCircle,
  Phone,
  MessageSquare,
  Clock,
  AlertTriangle,
  User,
  Package,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import type { QCHandover, QCHandoverStatus } from '@/lib/db/schema';

/**
 * Priority badge colors
 */
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

/**
 * Status badge colors
 */
const STATUS_COLORS: Record<QCHandoverStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  acknowledged: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  customer_contacted: 'bg-cyan-100 text-cyan-700',
  resolved: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

/**
 * Handover type labels
 */
const HANDOVER_TYPE_LABELS: Record<string, string> = {
  alteration: 'Alteration Needed',
  defect: 'Defect Found',
  damage: 'Damage Occurred',
  exception: 'Exception Case',
  pricing_issue: 'Pricing Issue',
  special_care: 'Special Care',
};

interface HandoverQueueProps {
  /** Optional branch filter */
  branchId?: string;
}

/**
 * HandoverQueue Component
 *
 * Displays and manages QC handovers for Customer Service staff.
 */
export function HandoverQueue({ branchId }: HandoverQueueProps) {
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'resolved'>('pending');
  const [expandedHandover, setExpandedHandover] = useState<string | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState<QCHandover | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [customerResponse, setCustomerResponse] = useState('');

  const effectiveBranchId = branchId || userData?.branchId;

  /**
   * Fetch handovers from API
   */
  const { data: handovers = [], isLoading, refetch } = useQuery({
    queryKey: ['qc-handovers', activeTab, effectiveBranchId],
    queryFn: async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const params = new URLSearchParams();
      if (effectiveBranchId) params.set('branchId', effectiveBranchId);

      // Map tab to status filter
      if (activeTab === 'pending') {
        params.set('status', 'pending');
      } else if (activeTab === 'in_progress') {
        params.set('status', 'in_progress');
      } else {
        params.set('status', 'resolved');
      }

      const response = await fetch(`/api/qc-handovers?${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch handovers');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user,
  });

  /**
   * Mutation to update handover status
   */
  const updateHandoverMutation = useMutation({
    mutationFn: async ({
      handoverId,
      action,
      customerResponse: custResp,
      resolutionNotes: resNotes,
    }: {
      handoverId: string;
      action: 'acknowledge' | 'in_progress' | 'customer_contacted' | 'resolve' | 'cancel';
      customerResponse?: string;
      resolutionNotes?: string;
    }) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const response = await fetch(`/api/qc-handovers/${handoverId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          action,
          customerResponse: custResp,
          resolutionNotes: resNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update handover');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qc-handovers'] });
      const actionLabels: Record<string, string> = {
        acknowledge: 'acknowledged',
        in_progress: 'marked as in progress',
        customer_contacted: 'customer contacted',
        resolve: 'resolved',
        cancel: 'cancelled',
      };
      toast.success(`Handover ${actionLabels[variables.action]}`);
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to update handover', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  /**
   * Handle acknowledge action
   */
  const handleAcknowledge = (handover: QCHandover) => {
    updateHandoverMutation.mutate({
      handoverId: handover.handoverId,
      action: 'acknowledge',
    });
  };

  /**
   * Handle mark as in progress
   */
  const handleMarkInProgress = (handover: QCHandover) => {
    updateHandoverMutation.mutate({
      handoverId: handover.handoverId,
      action: 'in_progress',
    });
  };

  /**
   * Handle customer contacted
   */
  const handleCustomerContacted = (handover: QCHandover) => {
    updateHandoverMutation.mutate({
      handoverId: handover.handoverId,
      action: 'customer_contacted',
      customerResponse: customerResponse || undefined,
    });
    setCustomerResponse('');
  };

  /**
   * Open resolve modal
   */
  const handleOpenResolveModal = (handover: QCHandover) => {
    setSelectedHandover(handover);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };

  /**
   * Handle resolve handover
   */
  const handleResolve = () => {
    if (!selectedHandover || !resolutionNotes.trim()) {
      toast.error('Resolution notes are required');
      return;
    }

    updateHandoverMutation.mutate({
      handoverId: selectedHandover.handoverId,
      action: 'resolve',
      resolutionNotes,
      customerResponse: customerResponse || undefined,
    });

    setResolveModalOpen(false);
    setSelectedHandover(null);
    setResolutionNotes('');
    setCustomerResponse('');
  };

  /**
   * Toggle expanded handover
   */
  const toggleExpanded = (handoverId: string) => {
    setExpandedHandover(expandedHandover === handoverId ? null : handoverId);
  };

  /**
   * Count handovers by status
   */
  const getCounts = () => {
    // This would ideally come from the API, but for now we'll use the current tab's count
    return {
      pending: activeTab === 'pending' ? handovers.length : 0,
      in_progress: activeTab === 'in_progress' ? handovers.length : 0,
      resolved: activeTab === 'resolved' ? handovers.length : 0,
    };
  };

  const counts = getCounts();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneForwarded className="w-5 h-5 text-blue-600" />
            QC Handover Queue
          </CardTitle>
          <CardDescription>
            Manage handovers from Quality Control that require customer communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending
                {counts.pending > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {counts.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                In Progress
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Resolved
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {handovers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Inbox className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-sm">No {activeTab.replace('_', ' ')} handovers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {handovers.map((handover: QCHandover) => (
                    <div
                      key={handover.handoverId}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* Handover Header */}
                      <button
                        onClick={() => toggleExpanded(handover.handoverId)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-sm">
                                {handover.handoverId}
                              </span>
                              <Badge className={PRIORITY_COLORS[handover.priority]}>
                                {handover.priority}
                              </Badge>
                              <Badge className={STATUS_COLORS[handover.status]}>
                                {handover.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">
                                {HANDOVER_TYPE_LABELS[handover.handoverType] || handover.handoverType}
                              </span>
                              {' • '}
                              {handover.customerName || 'Unknown Customer'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {handover.createdAt && (
                            <span className="text-xs text-gray-500">
                              {format(
                                (() => {
                                  if (typeof handover.createdAt === 'object' && handover.createdAt !== null && 'toDate' in handover.createdAt) {
                                    return (handover.createdAt as { toDate: () => Date }).toDate();
                                  }
                                  return new Date(handover.createdAt as unknown as string | number);
                                })(),
                                'MMM d, h:mm a'
                              )}
                            </span>
                          )}
                          {expandedHandover === handover.handoverId ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expandedHandover === handover.handoverId && (
                        <div className="p-4 pt-0 space-y-4">
                          <Separator />

                          {/* Customer Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500">Customer</Label>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{handover.customerName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a
                                  href={`tel:${handover.customerPhone}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {handover.customerPhone || 'N/A'}
                                </a>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500">Order</Label>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="font-mono">{handover.orderId}</span>
                                <a
                                  href={`/orders/${handover.orderId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              {handover.garmentId && (
                                <div className="text-sm text-gray-600">
                                  Garment: {handover.garmentId}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-500">Issue Description</Label>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm">
                              {handover.description}
                            </div>
                          </div>

                          {/* Communication Template */}
                          {handover.customerCommunicationTemplate && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500">Suggested Message</Label>
                              <Alert className="border-blue-200 bg-blue-50">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                <AlertDescription className="text-blue-800 whitespace-pre-wrap">
                                  {handover.customerCommunicationTemplate}
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}

                          {/* QC Notes (internal) */}
                          {handover.qcNotes && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500">Internal Notes from QC</Label>
                              <div className="bg-amber-50 rounded-lg p-3 text-sm border border-amber-200">
                                <AlertTriangle className="w-4 h-4 text-amber-600 inline mr-2" />
                                {handover.qcNotes}
                              </div>
                            </div>
                          )}

                          {/* Photos */}
                          {handover.photos && handover.photos.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500">Photos</Label>
                              <div className="flex flex-wrap gap-2">
                                {handover.photos.map((photo, index) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={index}
                                    src={photo}
                                    alt={`Issue photo ${index + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-75"
                                    onClick={() => window.open(photo, '_blank')}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {handover.status === 'pending' && (
                              <Button
                                onClick={() => handleAcknowledge(handover)}
                                disabled={updateHandoverMutation.isPending}
                                size="sm"
                              >
                                {updateHandoverMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Acknowledge
                              </Button>
                            )}

                            {(handover.status === 'acknowledged' || handover.status === 'pending') && (
                              <Button
                                onClick={() => handleMarkInProgress(handover)}
                                disabled={updateHandoverMutation.isPending}
                                variant="outline"
                                size="sm"
                              >
                                Start Working
                              </Button>
                            )}

                            {(handover.status === 'acknowledged' ||
                              handover.status === 'in_progress') && (
                              <Button
                                onClick={() => handleCustomerContacted(handover)}
                                disabled={updateHandoverMutation.isPending}
                                variant="outline"
                                size="sm"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Mark Contacted
                              </Button>
                            )}

                            {handover.status !== 'resolved' && handover.status !== 'cancelled' && (
                              <Button
                                onClick={() => handleOpenResolveModal(handover)}
                                disabled={updateHandoverMutation.isPending}
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Resolve
                              </Button>
                            )}
                          </div>

                          {/* Resolution Info (if resolved) */}
                          {handover.status === 'resolved' && handover.resolutionNotes && (
                            <div className="space-y-2 pt-2 border-t">
                              <Label className="text-xs text-gray-500">Resolution</Label>
                              <div className="bg-green-50 rounded-lg p-3 text-sm border border-green-200">
                                <CheckCircle className="w-4 h-4 text-green-600 inline mr-2" />
                                {handover.resolutionNotes}
                              </div>
                              {handover.customerResponse && (
                                <div className="text-sm text-gray-600">
                                  Customer response: {handover.customerResponse}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resolve Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Handover</DialogTitle>
            <DialogDescription>
              Document the resolution and any customer response for this handover.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution-notes">Resolution Notes *</Label>
              <Textarea
                id="resolution-notes"
                placeholder="Describe how this issue was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-response">Customer Response (Optional)</Label>
              <Textarea
                id="customer-response"
                placeholder="What did the customer say?"
                value={customerResponse}
                onChange={(e) => setCustomerResponse(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!resolutionNotes.trim() || updateHandoverMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateHandoverMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                'Resolve Handover'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
