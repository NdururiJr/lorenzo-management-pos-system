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
    where('createdAt', '>=', Timestamp.fromDate(new Date(today.setHours(0, 0, 0, 0)))),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let sequence = 1;
  if (todayOrders.length > 0) {
    const lastOrder = todayOrders[0];
    // Extract sequence from last order ID (ORD-BRANCH-20251015-0001)
    const lastSequence = parseInt(lastOrder.orderId.split('-').pop() || '0', 10);
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

  return orderId;
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<OrderExtended> {
  return getDocument<OrderExtended>('orders', orderId);
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
