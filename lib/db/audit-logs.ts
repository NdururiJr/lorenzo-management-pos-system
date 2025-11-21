/**
 * Audit Logs Database Functions
 *
 * Functions for creating and querying audit logs for compliance and security.
 *
 * @module lib/db/audit-logs
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import type { AuditLog, AuditLogAction, UserRole } from './schema';

/**
 * Generate a unique audit log ID
 * Format: AUDIT-[YYYYMMDD]-[TIMESTAMP]-[RANDOM]
 */
function generateAuditLogId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `AUDIT-${dateStr}-${timestamp}-${random}`;
}

/**
 * Create an audit log entry
 *
 * @param action - Action performed
 * @param resourceType - Type of resource (e.g., 'order', 'inventory', 'user', 'transfer')
 * @param resourceId - ID of the resource
 * @param performedBy - UID of user who performed the action
 * @param performedByName - Name of the user
 * @param performedByRole - Role of the user
 * @param description - Description of the action
 * @param branchId - Branch ID where action was performed (null for global actions)
 * @param additionalBranchIds - Additional branch IDs involved (for transfers)
 * @param changes - Optional before/after changes
 * @param ipAddress - Optional IP address
 * @param userAgent - Optional user agent string
 * @returns Audit log ID
 */
export async function createAuditLog(
  action: AuditLogAction,
  resourceType: string,
  resourceId: string,
  performedBy: string,
  performedByName: string,
  performedByRole: UserRole,
  description: string,
  branchId?: string,
  additionalBranchIds?: string[],
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  },
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const auditLogId = generateAuditLogId();

  const auditLog: AuditLog = {
    auditLogId,
    action,
    resourceType,
    resourceId,
    performedBy,
    performedByName,
    performedByRole,
    branchId,
    additionalBranchIds,
    description,
    changes,
    ipAddress,
    userAgent,
    timestamp: Timestamp.now(),
  };

  await addDoc(collection(db, 'auditLogs'), auditLog);
  return auditLogId;
}

/**
 * Log order creation
 */
export async function logOrderCreated(
  orderId: string,
  branchId: string,
  userId: string,
  userName: string,
  userRole: UserRole,
  orderData: Record<string, unknown>
): Promise<void> {
  await createAuditLog(
    'create',
    'order',
    orderId,
    userId,
    userName,
    userRole,
    `Order ${orderId} created at branch ${branchId}`,
    branchId,
    undefined,
    { after: orderData }
  );
}

/**
 * Log order update
 */
export async function logOrderUpdated(
  orderId: string,
  branchId: string,
  userId: string,
  userName: string,
  userRole: UserRole,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  description: string
): Promise<void> {
  await createAuditLog(
    'update',
    'order',
    orderId,
    userId,
    userName,
    userRole,
    description,
    branchId,
    undefined,
    { before, after }
  );
}

/**
 * Log inventory transfer action
 */
export async function logInventoryTransfer(
  action: AuditLogAction,
  transferId: string,
  fromBranchId: string,
  toBranchId: string,
  userId: string,
  userName: string,
  userRole: UserRole,
  description: string,
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }
): Promise<void> {
  await createAuditLog(
    action,
    'inventory_transfer',
    transferId,
    userId,
    userName,
    userRole,
    description,
    fromBranchId,
    [toBranchId],
    changes
  );
}

/**
 * Log user role change
 */
export async function logRoleChange(
  targetUserId: string,
  adminUserId: string,
  adminUserName: string,
  adminUserRole: UserRole,
  oldRole: UserRole,
  newRole: UserRole,
  branchId?: string
): Promise<void> {
  await createAuditLog(
    'role_change',
    'user',
    targetUserId,
    adminUserId,
    adminUserName,
    adminUserRole,
    `User role changed from ${oldRole} to ${newRole}`,
    branchId,
    undefined,
    {
      before: { role: oldRole },
      after: { role: newRole },
    }
  );
}

/**
 * Log branch access change
 */
export async function logBranchAccessChange(
  targetUserId: string,
  adminUserId: string,
  adminUserName: string,
  adminUserRole: UserRole,
  oldBranchAccess: string[],
  newBranchAccess: string[],
  branchId?: string
): Promise<void> {
  await createAuditLog(
    'branch_access_change',
    'user',
    targetUserId,
    adminUserId,
    adminUserName,
    adminUserRole,
    `Branch access updated for user`,
    branchId,
    newBranchAccess,
    {
      before: { branchAccess: oldBranchAccess },
      after: { branchAccess: newBranchAccess },
    }
  );
}

/**
 * Log cross-branch action
 */
export async function logCrossBranchAction(
  action: AuditLogAction,
  resourceType: string,
  resourceId: string,
  userId: string,
  userName: string,
  userRole: UserRole,
  primaryBranchId: string,
  affectedBranchIds: string[],
  description: string
): Promise<void> {
  await createAuditLog(
    action,
    resourceType,
    resourceId,
    userId,
    userName,
    userRole,
    description,
    primaryBranchId,
    affectedBranchIds
  );
}

/**
 * Get audit logs for a specific resource
 *
 * @param resourceType - Type of resource
 * @param resourceId - ID of the resource
 * @param limit - Maximum number of logs to return
 * @returns Array of audit logs
 */
export async function getAuditLogsByResource(
  resourceType: string,
  resourceId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const q = query(
    collection(db, 'auditLogs'),
    where('resourceType', '==', resourceType),
    where('resourceId', '==', resourceId),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * Get audit logs for a specific branch
 *
 * @param branchId - Branch ID
 * @param limit - Maximum number of logs to return
 * @param action - Optional filter by action type
 * @returns Array of audit logs
 */
export async function getAuditLogsByBranch(
  branchId: string,
  limit: number = 100,
  action?: AuditLogAction
): Promise<AuditLog[]> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const constraints: QueryConstraint[] = [
    where('branchId', '==', branchId),
  ];

  if (action) {
    constraints.push(where('action', '==', action));
  }

  constraints.push(orderBy('timestamp', 'desc'));
  constraints.push(firestoreLimit(limit));

  const q = query(collection(db, 'auditLogs'), ...constraints);

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * Get audit logs by user
 *
 * @param userId - User ID
 * @param limit - Maximum number of logs to return
 * @returns Array of audit logs
 */
export async function getAuditLogsByUser(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const q = query(
    collection(db, 'auditLogs'),
    where('performedBy', '==', userId),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * Get recent audit logs (all branches)
 * Only accessible by super admins
 *
 * @param limit - Maximum number of logs to return
 * @param action - Optional filter by action type
 * @returns Array of audit logs
 */
export async function getRecentAuditLogs(
  limit: number = 100,
  action?: AuditLogAction
): Promise<AuditLog[]> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const constraints: QueryConstraint[] = [];

  if (action) {
    constraints.push(where('action', '==', action));
  }

  constraints.push(orderBy('timestamp', 'desc'));
  constraints.push(firestoreLimit(limit));

  const q = query(collection(db, 'auditLogs'), ...constraints);

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * Get audit logs for cross-branch actions
 *
 * @param limit - Maximum number of logs to return
 * @returns Array of audit logs
 */
export async function getCrossBranchAuditLogs(
  limit: number = 100
): Promise<AuditLog[]> {
  const db = getDbInstance();
  if (!db) throw new Error('Firestore is not initialized');

  const q = query(
    collection(db, 'auditLogs'),
    where('action', 'in', ['transfer', 'branch_access_change']),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}
