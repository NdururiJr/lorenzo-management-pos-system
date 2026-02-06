/**
 * Approval Workflow System
 *
 * Handles multi-tier approval workflows for various operations.
 * V2.0: Vouchers, cash out, disposal, and discount approvals.
 *
 * @module lib/workflows/approval
 */

import { Timestamp, where, orderBy } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  generateId,
  DatabaseError,
} from '@/lib/db/index';

/**
 * Approval request types
 */
export type ApprovalType =
  | 'voucher'
  | 'cash_out'
  | 'disposal'
  | 'discount'
  | 'refund'
  | 'price_override'
  | 'credit_extension';

/**
 * Approval status values
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';

/**
 * Approval tier levels
 */
export type ApprovalTier = 'manager' | 'general_manager' | 'director' | 'admin';

/**
 * Approval request structure
 */
export interface ApprovalRequest {
  /** Unique approval request ID */
  id: string;
  /** Type of approval */
  type: ApprovalType;
  /** Current status */
  status: ApprovalStatus;
  /** Current approval tier */
  currentTier: ApprovalTier;
  /** Amount involved (if applicable) */
  amount?: number;
  /** Related entity ID (order, voucher, etc.) */
  entityId?: string;
  /** Related entity type */
  entityType?: string;
  /** Description of what's being approved */
  description: string;
  /** Reason for the request */
  reason: string;
  /** User who created the request */
  requestedBy: string;
  /** Name of requester */
  requestedByName: string;
  /** Branch ID */
  branchId: string;
  /** Branch name */
  branchName?: string;
  /** Approval history */
  approvalHistory: ApprovalHistoryEntry[];
  /** Final approver (if approved/rejected) */
  finalApprover?: string;
  /** Final approver name */
  finalApproverName?: string;
  /** Final approval/rejection date */
  finalDecisionDate?: Timestamp;
  /** Rejection reason (if rejected) */
  rejectionReason?: string;
  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Expiry date for the request */
  expiresAt?: Timestamp;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Created timestamp */
  createdAt: Timestamp;
  /** Updated timestamp */
  updatedAt: Timestamp;
}

/**
 * Approval history entry
 */
export interface ApprovalHistoryEntry {
  /** Tier at this step */
  tier: ApprovalTier;
  /** User who took action */
  userId: string;
  /** User name */
  userName: string;
  /** Action taken */
  action: 'approve' | 'reject' | 'escalate' | 'comment';
  /** Comment or reason */
  comment?: string;
  /** Timestamp */
  timestamp: Timestamp;
}

/**
 * Workflow configuration for each approval type
 */
export interface WorkflowConfig {
  /** Approval type */
  type: ApprovalType;
  /** Display name */
  displayName: string;
  /** Tiers required for approval */
  tiers: ApprovalTier[];
  /** Amount thresholds for escalation */
  amountThresholds?: {
    tier: ApprovalTier;
    minAmount: number;
  }[];
  /** Default expiry in hours */
  defaultExpiryHours: number;
  /** Whether to auto-expire */
  autoExpire: boolean;
  /** Notification channels */
  notifyChannels: ('email' | 'whatsapp' | 'in_app')[];
}

/**
 * Workflow configurations
 */
export const WORKFLOW_CONFIGS: Record<ApprovalType, WorkflowConfig> = {
  voucher: {
    type: 'voucher',
    displayName: 'Voucher Approval',
    tiers: ['general_manager', 'director'],
    amountThresholds: [
      { tier: 'general_manager', minAmount: 0 },
      { tier: 'director', minAmount: 5000 },
    ],
    defaultExpiryHours: 48,
    autoExpire: true,
    notifyChannels: ['in_app', 'email'],
  },
  cash_out: {
    type: 'cash_out',
    displayName: 'Cash Out Approval',
    tiers: ['manager', 'general_manager'],
    amountThresholds: [
      { tier: 'manager', minAmount: 0 },
      { tier: 'general_manager', minAmount: 2000 },
    ],
    defaultExpiryHours: 24,
    autoExpire: true,
    notifyChannels: ['in_app', 'email'],
  },
  disposal: {
    type: 'disposal',
    displayName: 'Garment Disposal Approval',
    tiers: ['general_manager'],
    defaultExpiryHours: 72,
    autoExpire: false,
    notifyChannels: ['in_app', 'email', 'whatsapp'],
  },
  discount: {
    type: 'discount',
    displayName: 'Discount Approval',
    tiers: ['manager', 'general_manager'],
    amountThresholds: [
      { tier: 'manager', minAmount: 0 },
      { tier: 'general_manager', minAmount: 1000 },
    ],
    defaultExpiryHours: 4,
    autoExpire: true,
    notifyChannels: ['in_app'],
  },
  refund: {
    type: 'refund',
    displayName: 'Refund Approval',
    tiers: ['manager', 'general_manager', 'director'],
    amountThresholds: [
      { tier: 'manager', minAmount: 0 },
      { tier: 'general_manager', minAmount: 5000 },
      { tier: 'director', minAmount: 10000 },
    ],
    defaultExpiryHours: 24,
    autoExpire: true,
    notifyChannels: ['in_app', 'email'],
  },
  price_override: {
    type: 'price_override',
    displayName: 'Price Override Approval',
    tiers: ['manager', 'general_manager'],
    defaultExpiryHours: 2,
    autoExpire: true,
    notifyChannels: ['in_app'],
  },
  credit_extension: {
    type: 'credit_extension',
    displayName: 'Credit Extension Approval',
    tiers: ['general_manager', 'director'],
    amountThresholds: [
      { tier: 'general_manager', minAmount: 0 },
      { tier: 'director', minAmount: 20000 },
    ],
    defaultExpiryHours: 48,
    autoExpire: true,
    notifyChannels: ['in_app', 'email'],
  },
};

/**
 * Role to tier mapping
 */
export const ROLE_TO_TIER: Record<string, ApprovalTier | null> = {
  admin: 'admin',
  director: 'director',
  general_manager: 'general_manager',
  store_manager: 'manager',
  manager: 'manager',
  workstation_manager: null,
  front_desk: null,
  workstation_staff: null,
  satellite_staff: null,
  driver: null,
  customer: null,
  finance_manager: 'manager',
  auditor: null,
  logistics_manager: 'manager',
  inspector: null,
};

/**
 * Tier hierarchy (higher index = more authority)
 */
export const TIER_HIERARCHY: ApprovalTier[] = ['manager', 'general_manager', 'director', 'admin'];

/**
 * Get the required tier for an approval based on amount
 */
export function getRequiredTier(
  type: ApprovalType,
  amount?: number
): ApprovalTier {
  const config = WORKFLOW_CONFIGS[type];

  if (!amount || !config.amountThresholds) {
    return config.tiers[0];
  }

  // Sort thresholds descending by amount
  const sortedThresholds = [...config.amountThresholds].sort(
    (a, b) => b.minAmount - a.minAmount
  );

  for (const threshold of sortedThresholds) {
    if (amount >= threshold.minAmount) {
      return threshold.tier;
    }
  }

  return config.tiers[0];
}

/**
 * Check if a user can approve a request
 */
export function canApprove(
  userRole: string,
  request: ApprovalRequest
): boolean {
  const userTier = ROLE_TO_TIER[userRole];

  if (!userTier) {
    return false;
  }

  const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredTierIndex = TIER_HIERARCHY.indexOf(request.currentTier);

  // User's tier must be >= required tier
  return userTierIndex >= requiredTierIndex;
}

/**
 * Create a new approval request
 */
export async function createApprovalRequest(
  data: Omit<ApprovalRequest, 'id' | 'status' | 'currentTier' | 'approvalHistory' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const id = generateId();
    const config = WORKFLOW_CONFIGS[data.type];
    const requiredTier = getRequiredTier(data.type, data.amount);

    const expiresAt = config.autoExpire
      ? Timestamp.fromDate(
          new Date(Date.now() + config.defaultExpiryHours * 60 * 60 * 1000)
        )
      : undefined;

    const request: ApprovalRequest = {
      ...data,
      id,
      status: 'pending',
      currentTier: requiredTier,
      approvalHistory: [],
      expiresAt,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDocument('approval_requests', id, request);
    return id;
  } catch (error) {
    throw new DatabaseError('Failed to create approval request', error);
  }
}

/**
 * Approve a request
 */
export async function approveRequest(
  requestId: string,
  approverId: string,
  approverName: string,
  approverRole: string,
  comment?: string
): Promise<void> {
  try {
    const request = await getDocument<ApprovalRequest>('approval_requests', requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Request is already ${request.status}`);
    }

    if (!canApprove(approverRole, request)) {
      throw new Error('You do not have permission to approve this request');
    }

    const userTier = ROLE_TO_TIER[approverRole] as ApprovalTier;

    const historyEntry: ApprovalHistoryEntry = {
      tier: userTier,
      userId: approverId,
      userName: approverName,
      action: 'approve',
      comment,
      timestamp: Timestamp.now(),
    };

    await updateDocument('approval_requests', requestId, {
      status: 'approved',
      approvalHistory: [...request.approvalHistory, historyEntry],
      finalApprover: approverId,
      finalApproverName: approverName,
      finalDecisionDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to approve request', error);
  }
}

/**
 * Reject a request
 */
export async function rejectRequest(
  requestId: string,
  rejecterId: string,
  rejecterName: string,
  rejecterRole: string,
  reason: string
): Promise<void> {
  try {
    const request = await getDocument<ApprovalRequest>('approval_requests', requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Request is already ${request.status}`);
    }

    if (!canApprove(rejecterRole, request)) {
      throw new Error('You do not have permission to reject this request');
    }

    const userTier = ROLE_TO_TIER[rejecterRole] as ApprovalTier;

    const historyEntry: ApprovalHistoryEntry = {
      tier: userTier,
      userId: rejecterId,
      userName: rejecterName,
      action: 'reject',
      comment: reason,
      timestamp: Timestamp.now(),
    };

    await updateDocument('approval_requests', requestId, {
      status: 'rejected',
      approvalHistory: [...request.approvalHistory, historyEntry],
      finalApprover: rejecterId,
      finalApproverName: rejecterName,
      finalDecisionDate: Timestamp.now(),
      rejectionReason: reason,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to reject request', error);
  }
}

/**
 * Escalate a request to a higher tier
 */
export async function escalateRequest(
  requestId: string,
  escalatorId: string,
  escalatorName: string,
  escalatorRole: string,
  comment?: string
): Promise<void> {
  try {
    const request = await getDocument<ApprovalRequest>('approval_requests', requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Request is already ${request.status}`);
    }

    const currentTierIndex = TIER_HIERARCHY.indexOf(request.currentTier);
    const nextTierIndex = currentTierIndex + 1;

    if (nextTierIndex >= TIER_HIERARCHY.length) {
      throw new Error('Cannot escalate further - already at highest tier');
    }

    const nextTier = TIER_HIERARCHY[nextTierIndex];
    const userTier = ROLE_TO_TIER[escalatorRole] as ApprovalTier;

    const historyEntry: ApprovalHistoryEntry = {
      tier: userTier,
      userId: escalatorId,
      userName: escalatorName,
      action: 'escalate',
      comment: comment || `Escalated to ${nextTier}`,
      timestamp: Timestamp.now(),
    };

    await updateDocument('approval_requests', requestId, {
      status: 'escalated',
      currentTier: nextTier,
      approvalHistory: [...request.approvalHistory, historyEntry],
      updatedAt: Timestamp.now(),
    });

    // Change status back to pending after escalation
    await updateDocument('approval_requests', requestId, {
      status: 'pending',
    });
  } catch (error) {
    throw new DatabaseError('Failed to escalate request', error);
  }
}

/**
 * Add a comment to a request
 */
export async function addComment(
  requestId: string,
  userId: string,
  userName: string,
  userRole: string,
  comment: string
): Promise<void> {
  try {
    const request = await getDocument<ApprovalRequest>('approval_requests', requestId);

    if (!request) {
      throw new Error('Approval request not found');
    }

    const userTier = ROLE_TO_TIER[userRole] || 'manager';

    const historyEntry: ApprovalHistoryEntry = {
      tier: userTier as ApprovalTier,
      userId,
      userName,
      action: 'comment',
      comment,
      timestamp: Timestamp.now(),
    };

    await updateDocument('approval_requests', requestId, {
      approvalHistory: [...request.approvalHistory, historyEntry],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new DatabaseError('Failed to add comment', error);
  }
}

/**
 * Get pending approvals for a user based on their role
 */
export async function getPendingApprovalsForUser(
  userRole: string,
  branchId?: string
): Promise<ApprovalRequest[]> {
  try {
    const userTier = ROLE_TO_TIER[userRole];

    if (!userTier) {
      return [];
    }

    const constraints = [
      where('status', '==', 'pending'),
    ];

    // Filter by branch if not admin/director
    if (branchId && userTier !== 'director' && userTier !== 'admin') {
      constraints.push(where('branchId', '==', branchId));
    }

    const requests = await getDocuments<ApprovalRequest>(
      'approval_requests',
      ...constraints,
      orderBy('createdAt', 'desc')
    );

    // Filter to only requests this user can approve
    return requests.filter((request) => canApprove(userRole, request));
  } catch (error) {
    throw new DatabaseError('Failed to get pending approvals', error);
  }
}

/**
 * Get approval requests by type
 */
export async function getApprovalsByType(
  type: ApprovalType,
  status?: ApprovalStatus,
  branchId?: string
): Promise<ApprovalRequest[]> {
  try {
    const constraints = [where('type', '==', type)];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    return getDocuments<ApprovalRequest>(
      'approval_requests',
      ...constraints,
      orderBy('createdAt', 'desc')
    );
  } catch (error) {
    throw new DatabaseError('Failed to get approvals by type', error);
  }
}

/**
 * Get approval request by ID
 */
export async function getApprovalRequest(requestId: string): Promise<ApprovalRequest | null> {
  try {
    return getDocument<ApprovalRequest>('approval_requests', requestId);
  } catch (error) {
    throw new DatabaseError('Failed to get approval request', error);
  }
}

/**
 * Expire old pending requests
 */
export async function expirePendingRequests(): Promise<number> {
  try {
    const now = Timestamp.now();
    const expiredRequests = await getDocuments<ApprovalRequest>(
      'approval_requests',
      where('status', '==', 'pending'),
      where('expiresAt', '<=', now)
    );

    let expiredCount = 0;
    for (const request of expiredRequests) {
      await updateDocument('approval_requests', request.id, {
        status: 'expired',
        updatedAt: Timestamp.now(),
      });
      expiredCount++;
    }

    return expiredCount;
  } catch (error) {
    throw new DatabaseError('Failed to expire pending requests', error);
  }
}

/**
 * Get approval statistics
 */
export async function getApprovalStats(
  branchId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalExpired: number;
  byType: Record<ApprovalType, { pending: number; approved: number; rejected: number }>;
  averageApprovalTime: number;
}> {
  try {
    const constraints = branchId ? [where('branchId', '==', branchId)] : [];

    if (startDate) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
    }

    const requests = await getDocuments<ApprovalRequest>('approval_requests', ...constraints);

    const stats = {
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalExpired: 0,
      byType: {} as Record<ApprovalType, { pending: number; approved: number; rejected: number }>,
      averageApprovalTime: 0,
    };

    let totalApprovalTime = 0;
    let approvalCount = 0;

    for (const request of requests) {
      // Count by status
      switch (request.status) {
        case 'pending':
          stats.totalPending++;
          break;
        case 'approved':
          stats.totalApproved++;
          break;
        case 'rejected':
          stats.totalRejected++;
          break;
        case 'expired':
          stats.totalExpired++;
          break;
      }

      // Initialize type stats if needed
      if (!stats.byType[request.type]) {
        stats.byType[request.type] = { pending: 0, approved: 0, rejected: 0 };
      }

      // Count by type and status
      if (request.status === 'pending') {
        stats.byType[request.type].pending++;
      } else if (request.status === 'approved') {
        stats.byType[request.type].approved++;
      } else if (request.status === 'rejected') {
        stats.byType[request.type].rejected++;
      }

      // Calculate average approval time
      if (request.status === 'approved' && request.finalDecisionDate) {
        const createdTime = request.createdAt.toDate().getTime();
        const approvedTime = request.finalDecisionDate.toDate().getTime();
        totalApprovalTime += approvedTime - createdTime;
        approvalCount++;
      }
    }

    if (approvalCount > 0) {
      stats.averageApprovalTime = totalApprovalTime / approvalCount / (1000 * 60 * 60); // In hours
    }

    return stats;
  } catch (error) {
    throw new DatabaseError('Failed to get approval stats', error);
  }
}
