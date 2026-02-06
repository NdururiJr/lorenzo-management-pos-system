/**
 * Customer Agent
 *
 * Specialist agent for handling customer-related queries.
 * Provides profile management, order summaries, and customer insights.
 *
 * @module lib/agents/customer-agent
 */

import { BaseAgent } from './base-agent';
import type {
  AgentAuth,
  AgentResponse,
  AgentCapability,
  CustomerSummary,
} from './types';
import { generateRequestId } from './types';
import {
  getCustomer,
  getTopCustomers,
  getRecentCustomers,
  searchCustomers,
} from '@/lib/db/customers';
import { getOrdersByCustomer } from '@/lib/db/orders';
import type { Customer } from '@/lib/db/schema';

/**
 * Customer Agent - Handles customer-related queries
 */
export class CustomerAgent extends BaseAgent {
  readonly name = 'customer-agent' as const;
  readonly description = 'Customer data specialist - manages profiles, order summaries, and customer insights';

  readonly capabilities: AgentCapability[] = [
    {
      action: 'getProfile',
      description: 'Get customer profile information',
      requiredParams: [],
      optionalParams: ['customerId'],
      requiresAuth: true,
    },
    {
      action: 'getOrderSummary',
      description: 'Get a summary of customer\'s order history',
      requiredParams: [],
      optionalParams: ['customerId'],
      requiresAuth: true,
    },
    {
      action: 'getSpendHistory',
      description: 'Get customer spending history and statistics',
      requiredParams: [],
      optionalParams: ['customerId'],
      requiresAuth: true,
    },
    {
      action: 'searchCustomer',
      description: 'Search for customers by name or phone (staff only)',
      requiredParams: ['query'],
      optionalParams: ['limit'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
    },
    {
      action: 'getTopCustomers',
      description: 'Get top customers by spending (management only)',
      requiredParams: [],
      optionalParams: ['limit'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ['admin', 'director', 'general_manager', 'store_manager'],
    },
    {
      action: 'getRecentCustomers',
      description: 'Get recently registered customers (staff only)',
      requiredParams: [],
      optionalParams: ['limit'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
    },
    {
      action: 'getCustomerInsights',
      description: 'Get detailed insights about a customer (staff only)',
      requiredParams: ['customerId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
    },
  ];

  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = generateRequestId();

    switch (action) {
      case 'getProfile':
        return this.getProfile(requestId, params, auth);
      case 'getOrderSummary':
        return this.getOrderSummary(requestId, params, auth);
      case 'getSpendHistory':
        return this.getSpendHistory(requestId, params, auth);
      case 'searchCustomer':
        return this.searchCustomer(requestId, params, auth);
      case 'getTopCustomers':
        return this.getTopCustomersAction(requestId, params, auth);
      case 'getRecentCustomers':
        return this.getRecentCustomersAction(requestId, params, auth);
      case 'getCustomerInsights':
        return this.getCustomerInsights(requestId, params, auth);
      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Get customer profile
   */
  private async getProfile(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      let customerId = params.customerId as string;

      // Customers can only view their own profile
      if (auth.userType === 'customer') {
        customerId = auth.customerId!;
      } else if (!customerId) {
        return this.errorResponse(requestId, 'error', 'Please specify a customer ID.');
      }

      const customer = await getCustomer(customerId);
      const summary = this.mapCustomerToSummary(customer);

      return this.successResponse(requestId, {
        ...summary,
        addresses: customer.addresses,
        preferences: customer.preferences,
      }, `Profile for ${customer.name}`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Customer not found.');
    }
  }

  /**
   * Get order summary for a customer
   */
  private async getOrderSummary(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      let customerId = params.customerId as string;

      if (auth.userType === 'customer') {
        customerId = auth.customerId!;
      } else if (!customerId) {
        return this.errorResponse(requestId, 'error', 'Please specify a customer ID.');
      }

      const customer = await getCustomer(customerId);
      const orders = await getOrdersByCustomer(customerId, 50);

      // Calculate statistics
      const completedOrders = orders.filter((o) =>
        ['delivered', 'collected'].includes(o.status)
      );
      const pendingOrders = orders.filter(
        (o) => !['delivered', 'collected'].includes(o.status)
      );
      const totalGarments = orders.reduce((sum, o) => sum + o.garments.length, 0);

      return this.successResponse(requestId, {
        customerId,
        customerName: customer.name,
        totalOrders: customer.orderCount,
        totalSpent: customer.totalSpent,
        formattedSpent: this.formatCurrency(customer.totalSpent),
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        totalGarments,
        averageOrderValue: customer.orderCount > 0
          ? Math.round(customer.totalSpent / customer.orderCount)
          : 0,
        recentOrders: orders.slice(0, 5).map((o) => ({
          orderId: o.orderId,
          status: o.status,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt.toDate(),
        })),
      }, `${customer.name} has ${customer.orderCount} orders totaling ${this.formatCurrency(customer.totalSpent)}`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve order summary.');
    }
  }

  /**
   * Get spending history
   */
  private async getSpendHistory(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      let customerId = params.customerId as string;

      if (auth.userType === 'customer') {
        customerId = auth.customerId!;
      } else if (!customerId) {
        return this.errorResponse(requestId, 'error', 'Please specify a customer ID.');
      }

      const customer = await getCustomer(customerId);
      const orders = await getOrdersByCustomer(customerId, 100);

      // Group by month
      const monthlySpend: Record<string, number> = {};
      orders.forEach((order) => {
        const date = order.createdAt.toDate();
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlySpend[monthKey] = (monthlySpend[monthKey] || 0) + order.paidAmount;
      });

      // Sort by month descending
      const sortedMonths = Object.entries(monthlySpend)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 12);

      return this.successResponse(requestId, {
        customerId,
        customerName: customer.name,
        totalSpent: customer.totalSpent,
        formattedTotal: this.formatCurrency(customer.totalSpent),
        orderCount: customer.orderCount,
        monthlySpend: sortedMonths.map(([month, amount]) => ({
          month,
          amount,
          formatted: this.formatCurrency(amount),
        })),
        memberSince: customer.createdAt.toDate(),
      });
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve spending history.');
    }
  }

  /**
   * Search customers (staff only)
   */
  private async searchCustomer(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const query = params.query as string;
      const limit = (params.limit as number) || 10;

      const customers = await searchCustomers(query, limit);

      return this.successResponse(requestId, {
        query,
        results: customers.map((c) => this.mapCustomerToSummary(c)),
        count: customers.length,
      }, `Found ${customers.length} customers matching "${query}"`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to search customers.');
    }
  }

  /**
   * Get top customers (management only)
   */
  private async getTopCustomersAction(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const limit = (params.limit as number) || 10;
      const customers = await getTopCustomers(limit);

      return this.successResponse(requestId, {
        customers: customers.map((c) => ({
          ...this.mapCustomerToSummary(c),
          formattedSpent: this.formatCurrency(c.totalSpent),
        })),
        count: customers.length,
      }, `Top ${customers.length} customers by spending`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve top customers.');
    }
  }

  /**
   * Get recently registered customers (staff only)
   */
  private async getRecentCustomersAction(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const limit = (params.limit as number) || 10;
      const customers = await getRecentCustomers(limit);

      return this.successResponse(requestId, {
        customers: customers.map((c) => ({
          ...this.mapCustomerToSummary(c),
          joinedDate: this.formatDate(c.createdAt.toDate()),
        })),
        count: customers.length,
      }, `${customers.length} recently registered customers`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve recent customers.');
    }
  }

  /**
   * Get detailed customer insights (staff only)
   */
  private async getCustomerInsights(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const customerId = params.customerId as string;
      const customer = await getCustomer(customerId);
      const orders = await getOrdersByCustomer(customerId, 100);

      // Calculate insights
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentOrders = orders.filter(
        (o) => o.createdAt.toDate() >= thirtyDaysAgo
      );

      // Most common garment types
      const garmentTypes: Record<string, number> = {};
      orders.forEach((order) => {
        order.garments.forEach((g) => {
          garmentTypes[g.type] = (garmentTypes[g.type] || 0) + 1;
        });
      });

      const topGarmentTypes = Object.entries(garmentTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      // Most common services
      const services: Record<string, number> = {};
      orders.forEach((order) => {
        order.garments.forEach((g) => {
          g.services.forEach((s) => {
            services[s] = (services[s] || 0) + 1;
          });
        });
      });

      const topServices = Object.entries(services)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      // Average time between orders
      let avgDaysBetweenOrders = 0;
      if (orders.length > 1) {
        const orderDates = orders.map((o) => o.createdAt.toDate().getTime());
        const totalDays = (orderDates[0] - orderDates[orderDates.length - 1]) / (24 * 60 * 60 * 1000);
        avgDaysBetweenOrders = Math.round(totalDays / (orders.length - 1));
      }

      return this.successResponse(requestId, {
        customerId,
        customerName: customer.name,
        phone: customer.phone,
        email: customer.email,
        memberSince: this.formatDate(customer.createdAt.toDate()),
        lifetimeValue: this.formatCurrency(customer.totalSpent),
        totalOrders: customer.orderCount,
        recentActivity: {
          ordersLast30Days: recentOrders.length,
          spentLast30Days: this.formatCurrency(
            recentOrders.reduce((sum, o) => sum + o.paidAmount, 0)
          ),
        },
        preferences: {
          topGarmentTypes: topGarmentTypes.map(([type, count]) => ({ type, count })),
          topServices: topServices.map(([service, count]) => ({ service, count })),
        },
        engagement: {
          avgDaysBetweenOrders,
          lastOrderDate: orders.length > 0
            ? this.formatDate(orders[0].createdAt.toDate())
            : 'Never',
        },
      });
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve customer insights.');
    }
  }

  /**
   * Map customer to summary object
   */
  private mapCustomerToSummary(customer: Customer): CustomerSummary {
    return {
      customerId: customer.customerId,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      orderCount: customer.orderCount,
      totalSpent: customer.totalSpent,
      memberSince: customer.createdAt.toDate(),
    };
  }
}

/**
 * Create and export a singleton instance
 */
export const customerAgent = new CustomerAgent();
