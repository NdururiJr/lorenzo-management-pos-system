/**
 * Order Agent
 *
 * Specialist agent for handling order-related queries and operations.
 * Provides order tracking, history, status updates, and analytics.
 *
 * @module lib/agents/order-agent
 */

import { BaseAgent } from './base-agent';
import type {
  AgentAuth,
  AgentResponse,
  AgentCapability,
  OrderSummary,
} from './types';
import { ORDER_STATUS_LABELS, generateRequestId } from './types';
import {
  getOrder,
  getOrdersByCustomer,
  getOrdersByBranch,
  getOrdersByStatus,
  getPipelineStats,
  getTodayOrdersCount,
  getAllOrders,
} from '@/lib/db/orders';
import type { OrderExtended, OrderStatus } from '@/lib/db/schema';

/**
 * Order Agent - Handles all order-related queries
 */
export class OrderAgent extends BaseAgent {
  readonly name = 'order-agent' as const;
  readonly description = 'Order information specialist - tracks orders, provides status updates, and order history';

  readonly capabilities: AgentCapability[] = [
    {
      action: 'getOrderStatus',
      description: 'Get the current status of an order',
      requiredParams: ['orderId'],
      requiresAuth: true,
    },
    {
      action: 'getOrderDetails',
      description: 'Get full details of an order including garments',
      requiredParams: ['orderId'],
      requiresAuth: true,
    },
    {
      action: 'getOrderHistory',
      description: 'Get order history for a customer',
      requiredParams: [],
      optionalParams: ['customerId', 'limit'],
      requiresAuth: true,
    },
    {
      action: 'getLatestOrder',
      description: 'Get the most recent order for a customer',
      requiredParams: [],
      optionalParams: ['customerId'],
      requiresAuth: true,
    },
    {
      action: 'getOrdersByStatus',
      description: 'Get orders filtered by status (staff only)',
      requiredParams: ['status'],
      optionalParams: ['branchId', 'limit'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
    },
    {
      action: 'getPipelineStats',
      description: 'Get pipeline statistics for a branch (staff only)',
      requiredParams: [],
      optionalParams: ['branchId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
    },
    {
      action: 'getTodaysSummary',
      description: 'Get today\'s order summary (management only)',
      requiredParams: [],
      optionalParams: ['branchId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager'],
    },
  ];

  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = generateRequestId();

    switch (action) {
      case 'getOrderStatus':
        return this.getOrderStatus(requestId, params, auth);
      case 'getOrderDetails':
        return this.getOrderDetails(requestId, params, auth);
      case 'getOrderHistory':
        return this.getOrderHistory(requestId, params, auth);
      case 'getLatestOrder':
        return this.getLatestOrder(requestId, params, auth);
      case 'getOrdersByStatus':
        return this.getOrdersByStatusAction(requestId, params, auth);
      case 'getPipelineStats':
        return this.getPipelineStatsAction(requestId, params, auth);
      case 'getTodaysSummary':
        return this.getTodaysSummary(requestId, params, auth);
      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Get current status of an order
   */
  private async getOrderStatus(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const orderId = params.orderId as string;
      const order = await getOrder(orderId);

      // Verify ownership for customers
      if (auth.userType === 'customer' && order.customerId !== auth.customerId) {
        return this.errorResponse(
          requestId,
          'unauthorized',
          'You do not have permission to view this order.'
        );
      }

      const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
      const eta = order.estimatedCompletion
        ? this.formatDateTime(order.estimatedCompletion.toDate())
        : 'Not available';

      return this.successResponse(requestId, {
        orderId: order.orderId,
        status: order.status,
        statusLabel,
        estimatedCompletion: eta,
        garmentCount: order.garments.length,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        paymentStatus: order.paymentStatus,
      }, `Your order ${orderId} is currently: ${statusLabel}`);
    } catch {
      return this.errorResponse(
        requestId,
        'error',
        'Order not found. Please check your order ID and try again.'
      );
    }
  }

  /**
   * Get full order details
   */
  private async getOrderDetails(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const orderId = params.orderId as string;
      const order = await getOrder(orderId);

      // Verify ownership for customers
      if (auth.userType === 'customer' && order.customerId !== auth.customerId) {
        return this.errorResponse(
          requestId,
          'unauthorized',
          'You do not have permission to view this order.'
        );
      }

      const orderSummary = this.mapOrderToSummary(order);

      return this.successResponse(requestId, {
        ...orderSummary,
        garments: order.garments.map((g) => ({
          garmentId: g.garmentId,
          type: g.type,
          color: g.color,
          brand: g.brand,
          services: g.services,
          price: g.price,
          status: g.status,
          specialInstructions: g.specialInstructions,
        })),
        collectionMethod: order.collectionMethod,
        returnMethod: order.returnMethod,
        deliveryAddress: order.deliveryAddress,
        specialInstructions: order.specialInstructions,
      });
    } catch {
      return this.errorResponse(
        requestId,
        'error',
        'Order not found. Please check your order ID and try again.'
      );
    }
  }

  /**
   * Get order history for a customer
   */
  private async getOrderHistory(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const limit = (params.limit as number) || 10;
      let customerId = params.customerId as string;

      // Customers can only view their own history
      if (auth.userType === 'customer') {
        customerId = auth.customerId!;
      } else if (!customerId && auth.userType === 'staff') {
        return this.errorResponse(
          requestId,
          'error',
          'Please specify a customer ID to view their order history.'
        );
      }

      const orders = await getOrdersByCustomer(customerId, limit);
      const orderSummaries = orders.map((o) => this.mapOrderToSummary(o));

      return this.successResponse(requestId, {
        customerId,
        orders: orderSummaries,
        totalOrders: orderSummaries.length,
      }, `Found ${orderSummaries.length} orders`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve order history.');
    }
  }

  /**
   * Get the most recent order for a customer
   */
  private async getLatestOrder(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      let customerId = params.customerId as string;

      // Customers can only view their own orders
      if (auth.userType === 'customer') {
        customerId = auth.customerId!;
      } else if (!customerId && auth.userType === 'staff') {
        return this.errorResponse(
          requestId,
          'error',
          'Please specify a customer ID.'
        );
      }

      const orders = await getOrdersByCustomer(customerId, 1);

      if (orders.length === 0) {
        return this.successResponse(requestId, null, 'No orders found.');
      }

      const order = orders[0];
      const summary = this.mapOrderToSummary(order);
      const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

      return this.successResponse(requestId, summary,
        `Your latest order (${order.orderId}) is: ${statusLabel}`
      );
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve latest order.');
    }
  }

  /**
   * Get orders by status (staff only)
   */
  private async getOrdersByStatusAction(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const status = params.status as OrderStatus;
      const limit = (params.limit as number) || 50;
      const branchId = params.branchId as string || auth.branchId;

      let orders: OrderExtended[];

      if (branchId) {
        orders = await getOrdersByBranch(branchId, limit);
        orders = orders.filter((o) => o.status === status);
      } else {
        orders = await getOrdersByStatus(status, limit);
      }

      const statusLabel = ORDER_STATUS_LABELS[status] || status;

      return this.successResponse(requestId, {
        status,
        statusLabel,
        orders: orders.map((o) => this.mapOrderToSummary(o)),
        count: orders.length,
      }, `Found ${orders.length} orders with status: ${statusLabel}`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve orders by status.');
    }
  }

  /**
   * Get pipeline statistics (staff only)
   */
  private async getPipelineStatsAction(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const branchId = (params.branchId as string) || auth.branchId;

      if (!branchId) {
        return this.errorResponse(requestId, 'error', 'Branch ID is required.');
      }

      const stats = await getPipelineStats(branchId);

      return this.successResponse(requestId, {
        branchId,
        stats,
        summary: `Total: ${stats.total} orders in pipeline`,
      });
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve pipeline stats.');
    }
  }

  /**
   * Get today's summary (management only)
   */
  private async getTodaysSummary(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const branchId = (params.branchId as string) || auth.branchId;

      if (!branchId) {
        // Get all orders for director/admin
        const orders = await getAllOrders(100);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter(
          (o) => o.createdAt.toDate() >= today
        );

        const totalRevenue = todayOrders.reduce((sum, o) => sum + o.paidAmount, 0);
        const totalOrders = todayOrders.length;
        const totalGarments = todayOrders.reduce((sum, o) => sum + o.garments.length, 0);

        return this.successResponse(requestId, {
          date: this.formatDate(new Date()),
          totalOrders,
          totalGarments,
          totalRevenue,
          formattedRevenue: this.formatCurrency(totalRevenue),
          orders: todayOrders.map((o) => this.mapOrderToSummary(o)),
        }, `Today's Summary: ${totalOrders} orders, ${this.formatCurrency(totalRevenue)} revenue`);
      }

      const todayCount = await getTodayOrdersCount(branchId);
      const stats = await getPipelineStats(branchId);

      return this.successResponse(requestId, {
        branchId,
        date: this.formatDate(new Date()),
        todayOrdersCount: todayCount,
        pipelineStats: stats,
      }, `Today: ${todayCount} new orders, ${stats.total} in pipeline`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve today\'s summary.');
    }
  }

  /**
   * Map an order to a summary object
   */
  private mapOrderToSummary(order: OrderExtended): OrderSummary {
    return {
      orderId: order.orderId,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status] || order.status,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      paymentStatus: order.paymentStatus,
      garmentCount: order.garments.length,
      estimatedCompletion: order.estimatedCompletion.toDate(),
      createdAt: order.createdAt.toDate(),
      customerName: order.customerName,
      branchId: order.branchId,
    };
  }
}

/**
 * Create and export a singleton instance
 */
export const orderAgent = new OrderAgent();
