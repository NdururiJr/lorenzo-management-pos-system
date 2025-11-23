/**
 * Order Database Operations
 *
 * This file provides type-safe CRUD operations for the orders collection.
 * Includes order creation, status updates, and queries.
 *
 * @module lib/db/orders
 */

import { Timestamp, where, orderBy, limit } from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  DatabaseError,
} from './index';
import type {
  Order,
  OrderExtended,
  OrderStatus,
  Garment,
  PaymentMethod,
  StatusHistoryEntry,
} from './schema';
import { getCustomer, incrementCustomerStats } from './customers';
import {
  notifyOrderCreated,
  notifyOrderReady,
  notifyOrderDelivered,
  notifyOrderCollected,
} from '@/app/actions/notifications';

/**
 * Generate a unique order ID
 * Format: ORD-[BRANCH]-[YYYYMMDD]-[####]
 *
 * @param branchId - Branch identifier (e.g., "MAIN", "KIL")
 * @returns Formatted order ID
 */
export async function generateOrderId(branchId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Get today's orders for this branch to determine sequence number
  const todayOrders = await getDocuments<Order>(
    'orders',
    where('branchId', '==', branchId),
    where(
      'createdAt',
      '>=',
      Timestamp.fromDate(new Date(today.setHours(0, 0, 0, 0)))
    ),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayOrders.length > 0) {
    const lastOrder = todayOrders[0];
    // Extract sequence from last order ID (ORD-BRANCH-20251015-0001)
    const lastSequence = parseInt(
      lastOrder.orderId.split('-').pop() || '0',
      10
    );
    sequence = lastSequence + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `ORD-${branchId}-${dateStr}-${sequenceStr}`;
}

/**
 * Generate garment ID
 * Format: [ORDER-ID]-G[##]
 */
export function generateGarmentId(orderId: string, index: number): string {
  const indexStr = String(index + 1).padStart(2, '0');
  return `${orderId}-G${indexStr}`;
}

/**
 * Calculate estimated completion time
 * Default: 48 hours from now
 * Can be enhanced with AI prediction later
 */
export function calculateEstimatedCompletion(
  garmentCount: number,
  isExpress = false
): Timestamp {
  const now = new Date();
  let hoursToAdd = 48; // Default 48 hours

  // Adjust based on garment count
  if (garmentCount > 10) {
    hoursToAdd += 24;
  } else if (garmentCount > 20) {
    hoursToAdd += 48;
  }

  // Express service: half the time
  if (isExpress) {
    hoursToAdd = Math.ceil(hoursToAdd / 2);
  }

  const completionDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  return Timestamp.fromDate(completionDate);
}

/**
 * Create a new order
 *
 * @param data - Order creation data
 * @returns The created order ID
 */
export async function createOrder(
  data: Omit<
    OrderExtended,
    | 'orderId'
    | 'createdAt'
    | 'updatedAt'
    | 'statusHistory'
    | 'estimatedCompletion'
  > & {
    estimatedCompletion?: Timestamp;
  }
): Promise<string> {
  // Get customer to verify existence and get denormalized fields
  const customer = await getCustomer(data.customerId);

  // Generate order ID
  const orderId = await generateOrderId(data.branchId);

  // Generate garment IDs
  const garmentsWithIds = data.garments.map((garment, index) => ({
    ...garment,
    garmentId: generateGarmentId(orderId, index),
    status: 'received',
  }));

  // Calculate estimated completion if not provided
  const hasExpress = data.garments.some((g) => g.services.includes('express'));
  const estimatedCompletion =
    data.estimatedCompletion ||
    calculateEstimatedCompletion(data.garments.length, hasExpress);

  // Create initial status history
  const statusHistory: StatusHistoryEntry[] = [
    {
      status: 'received',
      timestamp: Timestamp.now(),
      updatedBy: data.createdBy,
    },
  ];

  // Create order object (filtering out undefined values for Firestore)
  const order: Record<string, any> = {
    orderId,
    customerId: data.customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    branchId: data.branchId,
    status: 'received',
    garments: garmentsWithIds,
    totalAmount: data.totalAmount,
    paidAmount: data.paidAmount,
    paymentStatus: data.paymentStatus,
    estimatedCompletion,
    createdBy: data.createdBy,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    statusHistory,
  };

  // Add optional fields only if they are defined
  if (data.paymentMethod !== undefined) {
    order.paymentMethod = data.paymentMethod;
  }
  if (data.deliveryAddress !== undefined) {
    order.deliveryAddress = data.deliveryAddress;
  }
  if (data.specialInstructions !== undefined) {
    order.specialInstructions = data.specialInstructions;
  }

  // Save order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await setDocument<OrderExtended>('orders', orderId, order as any);

  // Update customer stats
  await incrementCustomerStats(data.customerId, data.totalAmount);

  // Trigger order created notifications (email + WhatsApp)
  // Note: Fire and forget - don't block order creation on notification failures
  notifyOrderCreated({
    order: {
      orderId,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      estimatedCompletion: estimatedCompletion.toDate(),
      createdAt: order.createdAt.toDate(),
      garments: garmentsWithIds,
    },
    customer: {
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
  }).catch((error) => {
    console.error('Failed to trigger order created notification:', error);
    // Don't throw - notifications are non-critical
  });

  return orderId;
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<OrderExtended> {
  return getDocument<OrderExtended>('orders', orderId);
}

/**
 * Get order by ID with ownership verification
 *
 * Fetches an order and verifies it belongs to the specified customer.
 * Used in customer portal to prevent unauthorized access.
 *
 * @param orderId - Order ID
 * @param customerId - Customer UID to verify ownership
 * @returns Order if owned by customer
 * @throws DatabaseError if order not found or doesn't belong to customer
 */
export async function getOrderByIdForCustomer(
  orderId: string,
  customerId: string
): Promise<OrderExtended> {
  const order = await getDocument<OrderExtended>('orders', orderId);

  if (order.customerId !== customerId) {
    throw new DatabaseError(
      `Order ${orderId} does not exist or you do not have permission to view it.`
    );
  }

  return order;
}

/**
 * Update order status
 *
 * @param orderId - Order ID
 * @param status - New status
 * @param updatedBy - UID of user making the change
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  updatedBy: string
): Promise<void> {
  const order = await getOrder(orderId);

  // Add to status history
  const statusHistory = [
    ...order.statusHistory,
    {
      status,
      timestamp: Timestamp.now(),
      updatedBy,
    },
  ];

  const updates: Partial<OrderExtended> = {
    status,
    updatedAt: Timestamp.now(),
    statusHistory,
  };

  // Set actualCompletion if order is completed
  if (status === 'collected' || status === 'delivered') {
    updates.actualCompletion = Timestamp.now();
  }

  await updateDocument<OrderExtended>('orders', orderId, updates);

  // Trigger notifications based on status change
  // Note: Fire and forget - don't block status updates on notification failures
  const customer = await getCustomer(order.customerId);

  const orderData = {
    orderId: order.orderId,
    totalAmount: order.totalAmount,
    paidAmount: order.paidAmount,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    estimatedCompletion: order.estimatedCompletion.toDate(),
    createdAt: order.createdAt.toDate(),
  };

  const customerData = {
    customerId: customer.customerId,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };

  // Send appropriate notifications based on new status
  if (status === 'ready') {
    notifyOrderReady({
      order: orderData,
      customer: customerData,
    }).catch((error) => {
      console.error('Failed to trigger order ready notification:', error);
    });
  } else if (status === 'delivered') {
    notifyOrderDelivered({
      order: orderData,
      customer: customerData,
    }).catch((error) => {
      console.error('Failed to trigger order delivered notification:', error);
    });
  } else if (status === 'collected') {
    notifyOrderCollected({
      order: orderData,
      customer: customerData,
    }).catch((error) => {
      console.error('Failed to trigger order collected notification:', error);
    });
  }
}

/**
 * Update order payment status
 */
export async function updateOrderPayment(
  orderId: string,
  paidAmount: number,
  paymentMethod: PaymentMethod
): Promise<void> {
  const order = await getOrder(orderId);

  const totalPaid = order.paidAmount + paidAmount;
  const paymentStatus =
    totalPaid >= order.totalAmount
      ? 'paid'
      : totalPaid > 0
        ? 'partial'
        : 'pending';

  await updateDocument<OrderExtended>('orders', orderId, {
    paidAmount: totalPaid,
    paymentMethod,
    paymentStatus,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get orders by customer
 */
export async function getOrdersByCustomer(
  customerId: string,
  limitCount = 10
): Promise<OrderExtended[]> {
  return getDocuments<OrderExtended>(
    'orders',
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get orders by branch
 */
export async function getOrdersByBranch(
  branchId: string,
  limitCount = 50
): Promise<OrderExtended[]> {
  return getDocuments<OrderExtended>(
    'orders',
    where('branchId', '==', branchId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get orders by branch and status
 */
export async function getOrdersByBranchAndStatus(
  branchId: string,
  status: OrderStatus,
  limitCount = 50
): Promise<OrderExtended[]> {
  return getDocuments<OrderExtended>(
    'orders',
    where('branchId', '==', branchId),
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get orders by status (all branches)
 */
export async function getOrdersByStatus(
  status: OrderStatus,
  limitCount = 50
): Promise<OrderExtended[]> {
  return getDocuments<OrderExtended>(
    'orders',
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get all orders (recent)
 */
export async function getAllOrders(limitCount = 50): Promise<OrderExtended[]> {
  return getDocuments<OrderExtended>(
    'orders',
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
}

/**
 * Get orders by payment status
 */
export async function getOrdersByPaymentStatus(
  paymentStatus: 'pending' | 'partial' | 'paid',
  branchId?: string,
  limitCount = 50
): Promise<OrderExtended[]> {
  const constraints = [
    where('paymentStatus', '==', paymentStatus),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (branchId) {
    constraints.unshift(where('branchId', '==', branchId));
  }

  return getDocuments<OrderExtended>('orders', ...constraints);
}

/**
 * Search orders by order ID (partial match)
 */
export async function searchOrdersByOrderId(
  searchTerm: string,
  branchId?: string,
  limitCount = 20
): Promise<OrderExtended[]> {
  // Get recent orders and filter client-side
  let orders: OrderExtended[];

  if (branchId) {
    orders = await getDocuments<OrderExtended>(
      'orders',
      where('branchId', '==', branchId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  } else {
    orders = await getDocuments<OrderExtended>(
      'orders',
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  }

  return orders
    .filter((order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, limitCount);
}

/**
 * Assign driver to order
 */
export async function assignDriverToOrder(
  orderId: string,
  driverId: string
): Promise<void> {
  await updateDocument<OrderExtended>('orders', orderId, {
    driverId,
    status: 'out_for_delivery',
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update garment status
 */
export async function updateGarmentStatus(
  orderId: string,
  garmentId: string,
  status: string
): Promise<void> {
  const order = await getOrder(orderId);

  const updatedGarments = order.garments.map((garment) =>
    garment.garmentId === garmentId ? { ...garment, status } : garment
  );

  await updateDocument<OrderExtended>('orders', orderId, {
    garments: updatedGarments,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete order (admin only)
 */
export async function deleteOrder(orderId: string): Promise<void> {
  return deleteDocument('orders', orderId);
}

/**
 * Get today's orders count by branch
 */
export async function getTodayOrdersCount(branchId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await getDocuments<OrderExtended>(
    'orders',
    where('branchId', '==', branchId),
    where('createdAt', '>=', Timestamp.fromDate(today))
  );

  return orders.length;
}

/**
 * Get pipeline statistics for a branch
 */
export async function getPipelineStats(branchId: string): Promise<{
  received: number;
  queued: number;
  washing: number;
  drying: number;
  ironing: number;
  quality_check: number;
  packaging: number;
  ready: number;
  out_for_delivery: number;
  total: number;
}> {
  const orders = await getOrdersByBranch(branchId, 200);

  const stats = {
    received: 0,
    queued: 0,
    washing: 0,
    drying: 0,
    ironing: 0,
    quality_check: 0,
    packaging: 0,
    ready: 0,
    out_for_delivery: 0,
    total: 0,
  };

  orders.forEach((order) => {
    if (order.status in stats) {
      stats[order.status as keyof typeof stats]++;
      stats.total++;
    }
  });

  return stats;
}

/**
 * Mark pickup as completed
 * Called when staff have successfully collected garments from customer location
 *
 * @param orderId - Order ID
 * @returns Promise<void>
 */
export async function markPickupCompleted(orderId: string): Promise<void> {
  const updates: Partial<OrderExtended> = {
    pickupCompletedTime: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await updateDocument<OrderExtended>('orders', orderId, updates);
}

/**
 * Mark delivery as completed
 * Called when staff have successfully delivered clean garments to customer location
 *
 * @param orderId - Order ID
 * @returns Promise<void>
 */
export async function markDeliveryCompleted(orderId: string): Promise<void> {
  const updates: Partial<OrderExtended> = {
    deliveryCompletedTime: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Also update order status to 'delivered'
  const order = await getOrder(orderId);
  const statusHistory = [
    ...order.statusHistory,
    {
      status: 'delivered' as OrderStatus,
      timestamp: Timestamp.now(),
      updatedBy: 'system', // Can be parameterized later
    },
  ];

  await updateDocument<OrderExtended>('orders', orderId, {
    ...updates,
    status: 'delivered',
    statusHistory,
    actualCompletion: Timestamp.now(),
  });
}

/**
 * Assign driver to pickup
 *
 * @param orderId - Order ID
 * @param driverId - Employee/driver ID
 * @returns Promise<void>
 */
export async function assignPickupDriver(
  orderId: string,
  driverId: string
): Promise<void> {
  await updateDocument<OrderExtended>('orders', orderId, {
    pickupAssignedTo: driverId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Assign driver to delivery
 *
 * @param orderId - Order ID
 * @param driverId - Employee/driver ID
 * @returns Promise<void>
 */
export async function assignDeliveryDriver(
  orderId: string,
  driverId: string
): Promise<void> {
  await updateDocument<OrderExtended>('orders', orderId, {
    deliveryAssignedTo: driverId,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get orders for multiple branches
 * Handles both small (<= 10 branches) and large (> 10 branches) sets
 *
 * @param branchIds - Array of branch IDs (null = all branches)
 * @param limitCount - Max orders per branch
 * @returns Combined orders from all branches
 */
export async function getOrdersForBranches(
  branchIds: string[] | null,
  limitCount = 50
): Promise<OrderExtended[]> {
  // Super admin or no branch filter - get all orders
  if (branchIds === null) {
    return getAllOrders(limitCount);
  }

  // No branches - return empty
  if (branchIds.length === 0) {
    return [];
  }

  // Single branch - use regular query
  if (branchIds.length === 1) {
    return getOrdersByBranch(branchIds[0], limitCount);
  }

  // Multiple branches <= 10 - use 'in' query
  if (branchIds.length <= 10) {
    return getDocuments<OrderExtended>(
      'orders',
      where('branchId', 'in', branchIds),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  }

  // More than 10 branches - fetch per branch and merge
  const allOrders: OrderExtended[] = [];
  for (const branchId of branchIds) {
    const orders = await getOrdersByBranch(branchId, limitCount);
    allOrders.push(...orders);
  }

  // Sort by createdAt and limit
  return allOrders
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, limitCount);
}

/**
 * Get today's orders count for multiple branches
 *
 * @param branchIds - Array of branch IDs (null = all branches)
 * @returns Total count across all branches
 */
export async function getTodayOrdersCountForBranches(
  branchIds: string[] | null
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Super admin - get all
  if (branchIds === null) {
    const orders = await getDocuments<OrderExtended>(
      'orders',
      where('createdAt', '>=', Timestamp.fromDate(today))
    );
    return orders.length;
  }

  // No branches
  if (branchIds.length === 0) {
    return 0;
  }

  // Single branch
  if (branchIds.length === 1) {
    return getTodayOrdersCount(branchIds[0]);
  }

  // Multiple branches <= 10
  if (branchIds.length <= 10) {
    const orders = await getDocuments<OrderExtended>(
      'orders',
      where('branchId', 'in', branchIds),
      where('createdAt', '>=', Timestamp.fromDate(today))
    );
    return orders.length;
  }

  // More than 10 branches - sum counts
  let total = 0;
  for (const branchId of branchIds) {
    const count = await getTodayOrdersCount(branchId);
    total += count;
  }
  return total;
}

/**
 * Get completed orders today for multiple branches
 *
 * @param branchIds - Array of branch IDs (null = all branches)
 * @returns Count of completed orders
 */
export async function getCompletedTodayCountForBranches(
  branchIds: string[] | null
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedStatuses: OrderStatus[] = ['delivered', 'collected'];

  // Super admin - get all
  if (branchIds === null) {
    const orders = await getDocuments<OrderExtended>(
      'orders',
      where('actualCompletion', '>=', Timestamp.fromDate(today)),
      where('status', 'in', completedStatuses)
    );
    return orders.length;
  }

  // No branches
  if (branchIds.length === 0) {
    return 0;
  }

  // Single branch
  if (branchIds.length === 1) {
    const orders = await getDocuments<OrderExtended>(
      'orders',
      where('branchId', '==', branchIds[0]),
      where('actualCompletion', '>=', Timestamp.fromDate(today)),
      where('status', 'in', completedStatuses)
    );
    return orders.length;
  }

  // Multiple branches - merge results
  let total = 0;
  for (const branchId of branchIds) {
    const orders = await getDocuments<OrderExtended>(
      'orders',
      where('branchId', '==', branchId),
      where('actualCompletion', '>=', Timestamp.fromDate(today)),
      where('status', 'in', completedStatuses)
    );
    total += orders.length;
  }
  return total;
}

/**
 * Get pending orders count for multiple branches
 *
 * @param branchIds - Array of branch IDs (null = all branches)
 * @returns Count of pending orders
 */
export async function getPendingOrdersCountForBranches(
  branchIds: string[] | null
): Promise<number> {
  const pendingStatuses: OrderStatus[] = ['received', 'queued', 'washing', 'drying', 'ironing', 'quality_check', 'packaging'];

  // Super admin - get all
  if (branchIds === null) {
    const orders = await getDocuments<OrderExtended>(
      'orders',
      where('status', 'in', pendingStatuses.slice(0, 10))
    );
    return orders.length;
  }

  // No branches
  if (branchIds.length === 0) {
    return 0;
  }

  // Single or multiple branches
  let total = 0;
  const branchesToQuery = branchIds.length <= 10 ? [branchIds] : branchIds.map((id) => [id]);

  for (const branches of branchesToQuery) {
    const orders = await getDocuments<OrderExtended>(
      'orders',
      ...(branches.length === 1
        ? [where('branchId', '==', branches[0])]
        : [where('branchId', 'in', branches)]),
      where('status', 'in', pendingStatuses.slice(0, 10))
    );
    total += orders.length;
  }

  return total;
}

/**
 * Get today's revenue for multiple branches
 *
 * @param branchIds - Array of branch IDs (null = all branches)
 * @returns Total revenue (sum of paidAmount)
 */
export async function getTodayRevenueForBranches(
  branchIds: string[] | null
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let orders: OrderExtended[] = [];

  // Super admin - get all
  if (branchIds === null) {
    orders = await getDocuments<OrderExtended>(
      'orders',
      where('createdAt', '>=', Timestamp.fromDate(today))
    );
  } else if (branchIds.length === 0) {
    return 0;
  } else if (branchIds.length === 1) {
    orders = await getDocuments<OrderExtended>(
      'orders',
      where('branchId', '==', branchIds[0]),
      where('createdAt', '>=', Timestamp.fromDate(today))
    );
  } else if (branchIds.length <= 10) {
    orders = await getDocuments<OrderExtended>(
      'orders',
      where('branchId', 'in', branchIds),
      where('createdAt', '>=', Timestamp.fromDate(today))
    );
  } else {
    // More than 10 branches
    for (const branchId of branchIds) {
      const branchOrders = await getDocuments<OrderExtended>(
        'orders',
        where('branchId', '==', branchId),
        where('createdAt', '>=', Timestamp.fromDate(today))
      );
      orders.push(...branchOrders);
    }
  }

  return orders.reduce((sum, order) => sum + (order.paidAmount || 0), 0);
}
