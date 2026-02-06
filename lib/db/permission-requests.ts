import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PermissionRequest {
  id?: string;
  requestedBy: string;
  requestedByName: string;
  branchId: string;
  branchName: string;
  type: PermissionRequestType;
  reason: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
}

export type PermissionRequestType =
  | 'overtime'
  | 'expense'
  | 'inventory'
  | 'discount'
  | 'refund'
  | 'leave'
  | 'transfer'
  | 'equipment'
  | 'other';

export const PERMISSION_REQUEST_TYPES: Record<PermissionRequestType, string> = {
  'overtime': 'Overtime Approval',
  'expense': 'Expense Reimbursement',
  'inventory': 'Inventory Adjustment',
  'discount': 'Special Discount',
  'refund': 'Customer Refund',
  'leave': 'Staff Leave Request',
  'transfer': 'Staff Transfer',
  'equipment': 'Equipment Purchase',
  'other': 'Other Request'
};

/**
 * Create a new permission request (GM only)
 */
export async function createPermissionRequest(
  data: Omit<PermissionRequest, 'id' | 'status' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'permissionRequests'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Update permission request status (Director only)
 */
export async function updatePermissionRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNotes?: string
): Promise<void> {
  await updateDoc(doc(db, 'permissionRequests', requestId), {
    status,
    reviewedBy,
    reviewedAt: serverTimestamp(),
    ...(reviewNotes && { reviewNotes })
  });
}

/**
 * Cancel a permission request (GM can cancel their own pending requests)
 */
export async function cancelPermissionRequest(requestId: string): Promise<void> {
  await updateDoc(doc(db, 'permissionRequests', requestId), {
    status: 'cancelled'
  });
}

/**
 * Get all pending permission requests (for Director)
 */
export async function getPendingPermissionRequests(): Promise<PermissionRequest[]> {
  const q = query(
    collection(db, 'permissionRequests'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PermissionRequest));
}

/**
 * Get permission requests by GM
 */
export async function getMyPermissionRequests(userId: string): Promise<PermissionRequest[]> {
  const q = query(
    collection(db, 'permissionRequests'),
    where('requestedBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PermissionRequest));
}

/**
 * Get all permission requests with optional status filter
 */
export async function getAllPermissionRequests(
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
): Promise<PermissionRequest[]> {
  let q;
  if (status) {
    q = query(
      collection(db, 'permissionRequests'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, 'permissionRequests'),
      orderBy('createdAt', 'desc')
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as PermissionRequest));
}

/**
 * Get a single permission request by ID
 */
export async function getPermissionRequest(requestId: string): Promise<PermissionRequest | null> {
  const docSnap = await getDoc(doc(db, 'permissionRequests', requestId));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as PermissionRequest;
}

/**
 * Get count of pending requests (for badge display)
 */
export async function getPendingRequestCount(): Promise<number> {
  const q = query(
    collection(db, 'permissionRequests'),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}
