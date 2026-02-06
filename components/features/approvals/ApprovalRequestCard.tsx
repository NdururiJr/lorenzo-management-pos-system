'use client';

/**
 * Approval Request Card Component
 *
 * Displays a single approval request with action buttons.
 *
 * @module components/features/approvals/ApprovalRequestCard
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Building2,
  History,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ApprovalRequest, ApprovalHistoryEntry } from '@/lib/workflows/approval';
import { WORKFLOW_CONFIGS } from '@/lib/workflows/approval';

interface ApprovalRequestCardProps {
  /** The approval request data */
  request: ApprovalRequest;
  /** Can the current user approve this request */
  canApprove: boolean;
  /** Callback when approved */
  onApprove?: (requestId: string, comment?: string) => Promise<void>;
  /** Callback when rejected */
  onReject?: (requestId: string, reason: string) => Promise<void>;
  /** Callback when escalated */
  onEscalate?: (requestId: string, comment?: string) => Promise<void>;
  /** Callback when comment is added */
  onComment?: (requestId: string, comment: string) => Promise<void>;
  /** Whether actions are currently loading */
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const TIER_LABELS: Record<string, string> = {
  manager: 'Manager',
  general_manager: 'General Manager',
  director: 'Director',
  admin: 'Administrator',
};

export function ApprovalRequestCard({
  request,
  canApprove: userCanApprove,
  onApprove,
  onReject,
  onEscalate,
  onComment,
  loading = false,
}: ApprovalRequestCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const config = WORKFLOW_CONFIGS[request.type];
  const createdAt = request.createdAt?.toDate?.() || new Date();
  const expiresAt = request.expiresAt?.toDate?.();

  const handleApprove = async () => {
    if (!onApprove) return;
    setActionLoading(true);
    try {
      await onApprove(request.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await onReject(request.id, rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!onEscalate) return;
    setActionLoading(true);
    try {
      await onEscalate(request.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComment = async () => {
    if (!onComment || !comment.trim()) return;
    setActionLoading(true);
    try {
      await onComment(request.id, comment);
      setShowCommentDialog(false);
      setComment('');
    } finally {
      setActionLoading(false);
    }
  };

  const formatHistoryAction = (entry: ApprovalHistoryEntry): string => {
    switch (entry.action) {
      case 'approve':
        return 'Approved';
      case 'reject':
        return 'Rejected';
      case 'escalate':
        return 'Escalated';
      case 'comment':
        return 'Commented';
      default:
        return entry.action;
    }
  };

  return (
    <>
      <Card className={request.status === 'pending' ? 'border-l-4 border-l-yellow-500' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base font-semibold">
                  {config.displayName}
                </CardTitle>
                <Badge className={STATUS_COLORS[request.status]}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
                <Badge variant="outline" className={PRIORITY_COLORS[request.priority]}>
                  {request.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{request.description}</p>
            </div>
            {request.amount && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <DollarSign className="h-4 w-4" />
                  KES {request.amount.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Request Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">By:</span>
                <span className="font-medium">{request.requestedByName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Branch:</span>
                <span className="font-medium">{request.branchName || request.branchId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
              </div>
              {expiresAt && request.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{formatDistanceToNow(expiresAt, { addSuffix: true })}</span>
                </div>
              )}
            </div>

            {/* Reason */}
            {request.reason && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-500">Reason:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
            )}

            {/* Current Tier */}
            {request.status === 'pending' && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Requires approval from: <strong>{TIER_LABELS[request.currentTier]}</strong></span>
              </div>
            )}

            {/* Rejection Reason */}
            {request.status === 'rejected' && request.rejectionReason && (
              <div className="bg-red-50 p-3 rounded-lg">
                <span className="text-sm text-red-600 font-medium">Rejection Reason:</span>
                <p className="text-sm mt-1 text-red-700">{request.rejectionReason}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              {request.status === 'pending' && userCanApprove && (
                <>
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    disabled={loading || actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={loading || actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEscalate}
                    disabled={loading || actionLoading}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-1" />
                    Escalate
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCommentDialog(true)}
                disabled={loading || actionLoading}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Comment
              </Button>

              {request.approvalHistory.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowHistoryDialog(true)}
                >
                  <History className="h-4 w-4 mr-1" />
                  History ({request.approvalHistory.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add a comment to this approval request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCommentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComment}
              disabled={!comment.trim() || actionLoading}
            >
              {actionLoading ? 'Adding...' : 'Add Comment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approval History</DialogTitle>
            <DialogDescription>
              Timeline of actions on this request
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {request.approvalHistory.map((entry, index) => {
                const entryTime = entry.timestamp?.toDate?.() || new Date();
                return (
                  <div
                    key={index}
                    className="flex gap-3 pb-4 border-b last:border-0"
                  >
                    <div className="flex-shrink-0">
                      {entry.action === 'approve' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {entry.action === 'reject' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {entry.action === 'escalate' && (
                        <ArrowUpCircle className="h-5 w-5 text-blue-500" />
                      )}
                      {entry.action === 'comment' && (
                        <MessageSquare className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {entry.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(entryTime, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatHistoryAction(entry)} ({TIER_LABELS[entry.tier]})
                      </p>
                      {entry.comment && (
                        <p className="text-sm mt-1 bg-gray-50 p-2 rounded">
                          {entry.comment}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ApprovalRequestCard;
