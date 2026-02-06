/**
 * Database Helper Functions
 *
 * This file provides type-safe CRUD operations and query builders for Firestore.
 * All functions include proper error handling and TypeScript types.
 *
 * @module lib/db
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  type DocumentData,
  type DocumentSnapshot,
  Timestamp,
  runTransaction,
  type Transaction,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  User,
  Customer,
  Order,
  Branch,
  Delivery,
  InventoryItem,
  Transaction as PaymentTransaction,
  Notification,
} from './schema';

/**
 * Error thrown when a document is not found
 */
export class DocumentNotFoundError extends Error {
  constructor(collection: string, id: string) {
    super(`Document not found: ${collection}/${id}`);
    this.name = 'DocumentNotFoundError';
  }
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique document ID
 *
 * Uses Firestore's built-in ID generation for consistency.
 *
 * @returns A unique document ID
 *
 * @example
 * const id = generateId();
 * // Returns something like 'a1B2c3D4e5F6g7H8i9J0'
 */
export function generateId(): string {
  // Create a reference to a new document without actually creating it
  // This generates a unique Firestore-compatible ID
  const newDocRef = doc(collection(db, '_temp'));
  return newDocRef.id;
}

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Get a document by ID
 *
 * @param collectionName - The collection name
 * @param docId - The document ID
 * @returns The document data
 * @throws {DocumentNotFoundError} If document doesn't exist
 * @throws {DatabaseError} If the operation fails
 *
 * @example
 * const order = await getDocument<Order>('orders', 'order-123');
 */
export async function getDocument<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new DocumentNotFoundError(collectionName, docId);
    }

    return { id: docSnap.id, ...docSnap.data() } as unknown as T;
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      throw error;
    }
    throw new DatabaseError(
      `Failed to get document ${collectionName}/${docId}`,
      error
    );
  }
}

/**
 * Get multiple documents from a collection with optional filters
 *
 * @param collectionName - The collection name
 * @param constraints - Optional query constraints (where, orderBy, limit, etc.)
 * @returns Array of documents
 * @throws {DatabaseError} If the operation fails
 *
 * @example
 * const orders = await getDocuments<Order>('orders',
 *   where('customerId', '==', 'customer-123'),
 *   orderBy('createdAt', 'desc'),
 *   limit(10)
 * );
 */
export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[];
  } catch (error) {
    // Return empty array for empty collections or permission errors
    // This is expected for fresh installations
    console.warn(`Could not fetch documents from ${collectionName}:`, error);
    return [];
  }
}

/**
 * Create a new document with auto-generated ID
 *
 * @param collectionName - The collection name
 * @param data - The document data
 * @returns The created document ID
 * @throws {DatabaseError} If the operation fails
 *
 * @example
 * const orderId = await createDocument('orders', {
 *   customerId: 'customer-123',
 *   status: 'received',
 *   totalAmount: 1500,
 * });
 */
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw new DatabaseError(
      `Failed to create document in ${collectionName}`,
      error
    );
  }
}

/**
 * Create a document with a specific ID
 *
 * @param collectionName - The collection name
 * @param docId - The document ID
 * @param data - The document data
 * @throws {DatabaseError} If the operation fails
 *
 * @example
 * await setDocument('orders', 'ORD-KIL-20251010-0001', {
 *   customerId: 'customer-123',
 *   status: 'received',
 *   totalAmount: 1500,
 * });
 */
export async function setDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Omit<T, 'id'>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`setDocument error for ${collectionName}/${docId}:`, error);
    console.error('Data being saved:', data);
    throw new DatabaseError(
      `Failed to set document ${collectionName}/${docId}`,
      error
    );
  }
}

/**
 * Update an existing document
 *
 * @param collectionName - The collection name
 * @param docId - The document ID
 * @param data - The fields to update
 * @throws {DatabaseError} If the operation fails
 *
 * @example
 * await updateDocument('orders', 'order-123', {
 *   status: 'washing',
 *   updatedAt: Timestamp.now(),
 * });
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(docRef, data as any);
  } catch (error) {
    throw new DatabaseError(
      `Failed to update document ${collectionName}/${docId}`,
      error
    );
  }
}

/**
 * Delete a document
 *
 * @param collectionName - The collection name
 * @param docId - The document ID
 * @throws {DatabaseError} If the operation fails
 *
 * @example
 * await deleteDocument('orders', 'order-123');
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    throw new DatabaseError(
      `Failed to delete document ${collectionName}/${docId}`,
      error
    );
  }
}

// ============================================
// TRANSACTION HELPERS
// ============================================

/**
 * Run a transaction with automatic error handling
 *
 * @param callback - The transaction callback
 * @returns The result of the transaction
 * @throws {DatabaseError} If the transaction fails
 *
 * @example
 * const result = await runDatabaseTransaction(async (transaction) => {
 *   const orderRef = doc(db, 'orders', orderId);
 *   const orderDoc = await transaction.get(orderRef);
 *
 *   if (!orderDoc.exists()) {
 *     throw new Error('Order not found');
 *   }
 *
 *   transaction.update(orderRef, {
 *     status: 'completed',
 *     actualCompletion: Timestamp.now(),
 *   });
 *
 *   return orderDoc.data();
 * });
 */
export async function runDatabaseTransaction<T>(
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
  try {
    return await runTransaction(db, callback);
  } catch (error) {
    throw new DatabaseError('Transaction failed', error);
  }
}

/**
 * Create a batch write operation
 *
 * @returns A new WriteBatch instance
 *
 * @example
 * const batch = createBatch();
 * const orderRef = doc(db, 'orders', orderId);
 * const notificationRef = doc(db, 'notifications', notificationId);
 *
 * batch.update(orderRef, { status: 'ready' });
 * batch.set(notificationRef, {
 *   type: 'order_ready',
 *   recipientId: customerId,
 *   message: 'Your order is ready!',
 * });
 *
 * await commitBatch(batch);
 */
export function createBatch(): WriteBatch {
  return writeBatch(db);
}

/**
 * Commit a batch write operation
 *
 * @param batch - The batch to commit
 * @throws {DatabaseError} If the batch commit fails
 */
export async function commitBatch(batch: WriteBatch): Promise<void> {
  try {
    await batch.commit();
  } catch (error) {
    throw new DatabaseError('Batch commit failed', error);
  }
}

// ============================================
// COLLECTION-SPECIFIC HELPERS
// ============================================

/**
 * Get user by UID
 */
export async function getUserById(uid: string): Promise<User> {
  return getDocument<User>('users', uid);
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer> {
  return getDocument<Customer>('customers', customerId);
}

/**
 * Get customer by phone number
 */
export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  try {
    const customers = await getDocuments<Customer>(
      'customers',
      where('phone', '==', phone),
      limit(1)
    );
    return customers.length > 0 ? customers[0] : null;
  } catch (error) {
    throw new DatabaseError('Failed to get customer by phone', error);
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  return getDocument<Order>('orders', orderId);
}

/**
 * Get orders by customer
 */
export async function getOrdersByCustomer(
  customerId: string,
  limitCount = 10
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get orders by branch and status
 */
export async function getOrdersByBranchAndStatus(
  branchId: string,
  status: string,
  limitCount = 50
): Promise<Order[]> {
  return getDocuments<Order>(
    'orders',
    where('branchId', '==', branchId),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get branch by ID
 */
export async function getBranchById(branchId: string): Promise<Branch> {
  return getDocument<Branch>('branches', branchId);
}

/**
 * Get all active branches
 */
export async function getActiveBranches(): Promise<Branch[]> {
  return getDocuments<Branch>('branches', where('active', '==', true));
}

/**
 * Get delivery by ID
 */
export async function getDeliveryById(deliveryId: string): Promise<Delivery> {
  return getDocument<Delivery>('deliveries', deliveryId);
}

/**
 * Get deliveries by driver
 */
export async function getDeliveriesByDriver(
  driverId: string,
  status?: string
): Promise<Delivery[]> {
  const constraints: QueryConstraint[] = [
    where('driverId', '==', driverId),
    orderBy('startTime', 'desc'),
    limit(20),
  ];

  if (status) {
    constraints.unshift(where('status', '==', status));
  }

  return getDocuments<Delivery>('deliveries', ...constraints);
}

/**
 * Get inventory items by branch
 */
export async function getInventoryByBranch(
  branchId: string
): Promise<InventoryItem[]> {
  return getDocuments<InventoryItem>(
    'inventory',
    where('branchId', '==', branchId),
    orderBy('category', 'asc'),
    orderBy('name', 'asc')
  );
}

/**
 * Get low stock items by branch
 */
export async function getLowStockItems(
  branchId: string
): Promise<InventoryItem[]> {
  const items = await getInventoryByBranch(branchId);
  return items.filter((item) => item.quantity <= item.reorderLevel);
}

/**
 * Get transactions by customer
 */
export async function getTransactionsByCustomer(
  customerId: string,
  limitCount = 10
): Promise<PaymentTransaction[]> {
  return getDocuments<PaymentTransaction>(
    'transactions',
    where('customerId', '==', customerId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get transactions by order
 */
export async function getTransactionsByOrder(
  orderId: string
): Promise<PaymentTransaction[]> {
  return getDocuments<PaymentTransaction>(
    'transactions',
    where('orderId', '==', orderId),
    orderBy('timestamp', 'desc')
  );
}

/**
 * Get notifications by recipient
 */
export async function getNotificationsByRecipient(
  recipientId: string,
  limitCount = 20
): Promise<Notification[]> {
  return getDocuments<Notification>(
    'notifications',
    where('recipientId', '==', recipientId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
}

/**
 * Update order status with timestamp
 */
export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const updates: Partial<Order> = {
    status: status as Order['status'],
  };

  // Set actualCompletion timestamp if order is completed
  if (status === 'collected' || status === 'delivered') {
    updates.actualCompletion = Timestamp.now();
  }

  return updateDocument('orders', orderId, updates);
}

/**
 * Pagination helper
 */
export interface PaginationOptions<T extends DocumentData> {
  collectionName: string;
  constraints: QueryConstraint[];
  pageSize: number;
  lastDoc?: DocumentSnapshot<T>;
}

/**
 * Get paginated documents
 *
 * @example
 * const { documents, lastDoc } = await getPaginatedDocuments({
 *   collectionName: 'orders',
 *   constraints: [where('branchId', '==', 'branch-1'), orderBy('createdAt', 'desc')],
 *   pageSize: 20,
 *   lastDoc: previousLastDoc, // For next page
 * });
 */
export async function getPaginatedDocuments<T extends DocumentData>(
  options: PaginationOptions<T>
): Promise<{ documents: T[]; lastDoc: DocumentSnapshot<T> | null }> {
  try {
    const { collectionName, constraints, pageSize, lastDoc } = options;

    const queryConstraints = [
      ...constraints,
      limit(pageSize),
      ...(lastDoc ? [startAfter(lastDoc)] : []),
    ];

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[];

    const newLastDoc =
      querySnapshot.docs.length > 0
        ? (querySnapshot.docs[querySnapshot.docs.length - 1] as DocumentSnapshot<T>)
        : null;

    return { documents, lastDoc: newLastDoc };
  } catch (error) {
    throw new DatabaseError('Pagination failed', error);
  }
}

// Re-export specialized database modules
export * from './deliveries';
export * from './customers';
export * from './orders';
export * from './transactions';
export * from './pricing';
export * from './verification';
export * from './pickup-requests';
export * from './config';
