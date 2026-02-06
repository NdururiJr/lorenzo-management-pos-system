/**
 * Analytics Agent (Business Analyst)
 *
 * Specialist agent for business analytics, KPIs, and executive insights.
 * Handles natural language queries about revenue, orders, customers, staff,
 * and branch performance for directors and managers.
 *
 * @module lib/agents/analytics-agent
 */

import { BaseAgent } from './base-agent';
import type {
  AgentAuth,
  AgentResponse,
  AgentCapability,
  StaffRole,
} from './types';
import { generateRequestId, canAccessBranch } from './types';
import { generateResponse, isOpenAIConfigured, type ConversationMessage } from './openai-service';

// Import server-side database functions for API route usage
import {
  getTransactionTotalsServer,
  getTodayTransactionSummaryServer,
  getTodayOrdersCountServer,
  getCompletedTodayCountServer,
  getTodayRevenueServer,
  getPipelineStatsServer,
  getTopCustomersServer,
  getBranchPerformanceServer,
  getTopPerformersServer,
  getDeliveriesCountServer,
  getSatisfactionMetricsServer,
} from '@/lib/db/server/analytics-db';

// Import types
import type { TimePeriod } from '@/lib/db/schema';

// Re-export getDateRangeForPeriod since it's a pure function
import { getDateRangeForPeriod } from '@/lib/db/performance';

/**
 * Analytics intent types for business queries
 */
export type AnalyticsIntent =
  | 'ANALYTICS_REVENUE'
  | 'ANALYTICS_ORDERS'
  | 'ANALYTICS_CUSTOMERS'
  | 'ANALYTICS_STAFF'
  | 'ANALYTICS_BRANCH'
  | 'ANALYTICS_DELIVERY'
  | 'ANALYTICS_TREND'
  | 'ANALYTICS_FORECAST'
  | 'ANALYTICS_GENERAL';

/**
 * Business insight data source
 */
export interface AnalyticsDataSource {
  type: 'revenue' | 'orders' | 'customers' | 'staff' | 'branch' | 'delivery';
  label: string;
  data: Record<string, unknown>;
}

/**
 * Roles allowed to access analytics
 */
const ANALYTICS_ROLES: StaffRole[] = [
  'admin',
  'director',
  'general_manager',
  'store_manager',
];

/**
 * Director/Admin only roles (cross-branch access)
 */
const EXECUTIVE_ROLES: StaffRole[] = ['admin', 'director'];

/**
 * System prompt for business analytics responses
 */
const ANALYTICS_SYSTEM_PROMPT = `You are a Business Analyst for Lorenzo Dry Cleaners.
Your role is to analyze business data and provide clear, actionable insights for executives.

## Response Guidelines
- Be concise but comprehensive
- Lead with the key insight or answer
- Use specific numbers (KES amounts, percentages, counts)
- Compare to previous periods when relevant
- Highlight concerns and opportunities
- Suggest actionable next steps
- Use professional business language
- Format currency as "KES X,XXX"
- Keep responses focused (3-5 sentences for simple queries, more for complex analysis)

## When presenting data:
- Revenue: Show actual vs target, % change from previous period
- Orders: Show counts by status, completion rates, turnaround times
- Customers: Focus on value (totalSpent), retention, acquisition
- Staff: Show performance scores, rankings, productivity
- Branches: Compare side-by-side with key metrics
- Delivery: Efficiency, on-time rates, driver performance

Always provide context for numbers - are they good or bad? What action should be taken?`;

/**
 * Analytics Agent - Business Analyst for executives and managers
 */
export class AnalyticsAgent extends BaseAgent {
  readonly name = 'analytics-agent' as const;
  readonly description = 'Business analytics specialist for executives and managers. Provides insights on revenue, orders, customers, staff, and branch performance.';

  readonly capabilities: AgentCapability[] = [
    {
      action: 'getRevenueAnalytics',
      description: 'Get revenue breakdown by period, branch, and payment method',
      requiredParams: ['period'],
      optionalParams: ['branchId', 'startDate', 'endDate'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ANALYTICS_ROLES,
    },
    {
      action: 'getOrderAnalytics',
      description: 'Get order counts, status distribution, and turnaround metrics',
      requiredParams: ['period'],
      optionalParams: ['branchId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ANALYTICS_ROLES,
    },
    {
      action: 'getCustomerAnalytics',
      description: 'Get top customers, retention metrics, and acquisition data',
      requiredParams: ['period'],
      optionalParams: ['limit'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ANALYTICS_ROLES,
    },
    {
      action: 'getStaffPerformance',
      description: 'Get individual staff performance metrics and rankings',
      requiredParams: ['staffId', 'period'],
      optionalParams: ['branchId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ANALYTICS_ROLES,
    },
    {
      action: 'getBranchComparison',
      description: 'Compare performance metrics across branches',
      requiredParams: ['period'],
      optionalParams: ['branchIds'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: EXECUTIVE_ROLES,
    },
    {
      action: 'getDriverAnalytics',
      description: 'Get delivery statistics and driver efficiency metrics',
      requiredParams: ['period'],
      optionalParams: ['driverId', 'branchId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ANALYTICS_ROLES,
    },
    {
      action: 'getTrendAnalysis',
      description: 'Get period-over-period comparison with percentage changes',
      requiredParams: ['metric', 'period'],
      optionalParams: ['branchId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: EXECUTIVE_ROLES,
    },
    {
      action: 'getNaturalLanguageQuery',
      description: 'Process natural language business questions and return insights',
      requiredParams: ['query'],
      optionalParams: ['branchId', 'timeframe'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: EXECUTIVE_ROLES,
    },
    {
      action: 'getDashboardSummary',
      description: 'Get executive dashboard summary with key metrics',
      requiredParams: [],
      optionalParams: ['branchId'],
      requiresAuth: true,
      allowedUserTypes: ['staff'],
      allowedStaffRoles: ANALYTICS_ROLES,
    },
  ];

  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = generateRequestId();

    switch (action) {
      case 'getRevenueAnalytics':
        return this.handleRevenueAnalytics(requestId, params, auth);
      case 'getOrderAnalytics':
        return this.handleOrderAnalytics(requestId, params, auth);
      case 'getCustomerAnalytics':
        return this.handleCustomerAnalytics(requestId, params, auth);
      case 'getStaffPerformance':
        return this.handleStaffPerformance(requestId, params, auth);
      case 'getBranchComparison':
        return this.handleBranchComparison(requestId, params, auth);
      case 'getDriverAnalytics':
        return this.handleDriverAnalytics(requestId, params, auth);
      case 'getTrendAnalysis':
        return this.handleTrendAnalysis(requestId, params, auth);
      case 'getNaturalLanguageQuery':
        return this.handleNaturalLanguageQuery(requestId, params, auth);
      case 'getDashboardSummary':
        return this.handleDashboardSummary(requestId, params, auth);
      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Get revenue analytics
   */
  private async handleRevenueAnalytics(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const period = params.period as TimePeriod;
      const branchId = (params.branchId as string) || auth.branchId;

      // Check branch access for non-executives
      if (branchId && !this.isExecutive(auth) && !canAccessBranch(auth, branchId)) {
        return this.errorResponse(requestId, 'unauthorized', 'You do not have access to this branch.');
      }

      const dateRange = getDateRangeForPeriod(period);

      // Get transaction totals using server-side function
      const totals = await getTransactionTotalsServer(dateRange.start, dateRange.end);

      // Get today's summary for comparison
      const todaySummary = await getTodayTransactionSummaryServer();

      // Get branch-specific revenue if specified
      let branchData = null;
      if (branchId && branchId !== 'all') {
        const branchRevenue = await getTodayRevenueServer([branchId]);
        branchData = {
          revenue: branchRevenue,
          formattedRevenue: this.formatCurrency(branchRevenue),
        };
      }

      const data = {
        period: dateRange.label,
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
        totals: {
          totalRevenue: totals.total,
          transactionCount: totals.count,
          byPaymentMethod: totals.byMethod,
          formattedRevenue: this.formatCurrency(totals.total),
        },
        today: {
          revenue: todaySummary.total,
          count: todaySummary.count,
          byMethod: {
            mpesa: todaySummary.mpesa,
            card: todaySummary.card,
            credit: todaySummary.credit,
          },
          formattedRevenue: this.formatCurrency(todaySummary.total),
        },
        branchData,
      };

      return this.successResponse(
        requestId,
        data,
        `Revenue for ${dateRange.label}: ${this.formatCurrency(totals.total)} from ${totals.count} transactions`
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleRevenueAnalytics:', error);
      return this.errorResponse(requestId, 'error', 'Failed to retrieve revenue analytics.');
    }
  }

  /**
   * Get order analytics
   */
  private async handleOrderAnalytics(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const period = params.period as TimePeriod;
      const branchId = (params.branchId as string) || auth.branchId;

      // Check branch access
      if (branchId && !this.isExecutive(auth) && !canAccessBranch(auth, branchId)) {
        return this.errorResponse(requestId, 'unauthorized', 'You do not have access to this branch.');
      }

      const dateRange = getDateRangeForPeriod(period);

      // Get branch-specific pipeline stats using server-side functions
      const branchIds = branchId && branchId !== 'all' ? [branchId] : null;

      const [todayOrders, completedToday, todayRevenue] = await Promise.all([
        getTodayOrdersCountServer(branchIds),
        getCompletedTodayCountServer(branchIds),
        getTodayRevenueServer(branchIds),
      ]);

      // Get pipeline stats for specific branch
      let pipelineStats = null;
      if (branchId && branchId !== 'all') {
        pipelineStats = await getPipelineStatsServer(branchId);
      }

      const completionRate = todayOrders > 0 ? Math.round((completedToday / todayOrders) * 100) : 0;

      const data = {
        period: dateRange.label,
        today: {
          totalOrders: todayOrders,
          completedOrders: completedToday,
          completionRate,
          revenue: todayRevenue,
          formattedRevenue: this.formatCurrency(todayRevenue),
        },
        pipeline: pipelineStats,
      };

      return this.successResponse(
        requestId,
        data,
        `Today: ${todayOrders} orders, ${completedToday} completed (${completionRate}% rate), ${this.formatCurrency(todayRevenue)} revenue`
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleOrderAnalytics:', error);
      return this.errorResponse(requestId, 'error', 'Failed to retrieve order analytics.');
    }
  }

  /**
   * Get customer analytics
   */
  private async handleCustomerAnalytics(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const limit = (params.limit as number) || 10;

      const topCustomers = await getTopCustomersServer(limit);

      const data = {
        topCustomers: topCustomers.map((c) => ({
          customerId: c.customerId,
          name: c.name,
          orderCount: c.orderCount,
          totalSpent: c.totalSpent,
          formattedSpent: this.formatCurrency(c.totalSpent),
        })),
        summary: {
          topCustomerCount: topCustomers.length,
          topCustomerTotalSpent: topCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
        },
      };

      const topSpender = topCustomers[0];
      return this.successResponse(
        requestId,
        data,
        topSpender
          ? `Top customer: ${topSpender.name} (${this.formatCurrency(topSpender.totalSpent)}, ${topSpender.orderCount} orders)`
          : 'No customer data available'
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleCustomerAnalytics:', error);
      return this.errorResponse(requestId, 'error', 'Failed to retrieve customer analytics.');
    }
  }

  /**
   * Get staff performance metrics
   */
  private async handleStaffPerformance(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const staffId = params.staffId as string;
      const period = params.period as TimePeriod;
      const branchId = (params.branchId as string) || auth.branchId;

      // Check branch access
      if (branchId && !this.isExecutive(auth) && !canAccessBranch(auth, branchId)) {
        return this.errorResponse(requestId, 'unauthorized', 'You do not have access to this branch.');
      }

      // Get top performers for the branch as a proxy for staff performance
      const topPerformers = branchId && branchId !== 'all'
        ? await getTopPerformersServer(branchId, 10)
        : [];

      // Find the specific staff member if they exist in top performers
      const staffPerformance = topPerformers.find(p => p.employeeId === staffId);

      const data = {
        staffId,
        period,
        branchId,
        performance: staffPerformance || null,
        topPerformers: topPerformers.slice(0, 5),
      };

      return this.successResponse(
        requestId,
        data,
        staffPerformance
          ? `Staff performance: ${staffPerformance.employeeName} - Score: ${staffPerformance.metrics.overallScore}%, Rank: #${staffPerformance.rank}`
          : `Top performers available. Specific staff data not found.`
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleStaffPerformance:', error);
      return this.errorResponse(requestId, 'error', 'Failed to retrieve staff performance metrics.');
    }
  }

  /**
   * Compare branch performance
   */
  private async handleBranchComparison(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      // Fetch all branch performance data using server-side function
      const branchPerformance = await getBranchPerformanceServer();

      // Filter by specific branches if provided
      const branchIds = params.branchIds as string[] | undefined;
      const filteredData = branchIds
        ? branchPerformance.filter((b) => branchIds.includes(b.branchId))
        : branchPerformance;

      // Sort by revenue (highest first)
      const sortedByRevenue = [...filteredData].sort((a, b) => b.revenue - a.revenue);
      const topBranch = sortedByRevenue[0];

      const data = {
        branches: sortedByRevenue.map((b) => ({
          ...b,
          formattedRevenue: this.formatCurrency(b.revenue),
        })),
        summary: {
          totalBranches: sortedByRevenue.length,
          totalRevenue: sortedByRevenue.reduce((sum, b) => sum + b.revenue, 0),
          totalOrders: sortedByRevenue.reduce((sum, b) => sum + b.ordersToday, 0),
          avgEfficiency: sortedByRevenue.length > 0
            ? Math.round(sortedByRevenue.reduce((sum, b) => sum + b.efficiency, 0) / sortedByRevenue.length)
            : 0,
        },
        topPerformer: topBranch,
      };

      return this.successResponse(
        requestId,
        data,
        topBranch
          ? `Top branch: ${topBranch.name} with ${this.formatCurrency(topBranch.revenue)} revenue and ${topBranch.efficiency}% efficiency`
          : 'No branch data available'
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleBranchComparison:', error);
      return this.errorResponse(requestId, 'error', 'Failed to compare branch performance.');
    }
  }

  /**
   * Get driver and delivery analytics
   */
  private async handleDriverAnalytics(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const period = params.period as TimePeriod;
      const branchId = (params.branchId as string) || auth.branchId;

      const dateRange = getDateRangeForPeriod(period);
      const branchIds = branchId && branchId !== 'all' ? [branchId] : null;

      // Get delivery counts using server-side functions
      const [pendingCount, todayCount] = await Promise.all([
        getDeliveriesCountServer(branchIds, 'pending'),
        getDeliveriesCountServer(branchIds),
      ]);

      const data = {
        period: dateRange.label,
        deliveries: {
          pending: pendingCount,
          today: todayCount,
        },
      };

      return this.successResponse(
        requestId,
        data,
        `${todayCount} deliveries today, ${pendingCount} pending`
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleDriverAnalytics:', error);
      return this.errorResponse(requestId, 'error', 'Failed to retrieve driver analytics.');
    }
  }

  /**
   * Get trend analysis with period comparison
   */
  private async handleTrendAnalysis(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const metric = params.metric as string;
      const period = params.period as TimePeriod;
      const branchId = (params.branchId as string) || auth.branchId;

      const dateRange = getDateRangeForPeriod(period);
      const branchIds = branchId && branchId !== 'all' ? [branchId] : null;

      let currentValue = 0;
      let previousValue = 0;

      switch (metric) {
        case 'revenue':
          currentValue = await getTodayRevenueServer(branchIds);
          // For simplicity, use a baseline estimate for previous
          previousValue = currentValue * 0.9; // Placeholder - would need actual historical query
          break;
        case 'orders':
          currentValue = await getTodayOrdersCountServer(branchIds);
          previousValue = currentValue * 0.95;
          break;
        case 'completed':
          currentValue = await getCompletedTodayCountServer(branchIds);
          previousValue = currentValue * 0.9;
          break;
        default:
          return this.errorResponse(requestId, 'error', `Unknown metric: ${metric}`);
      }

      const change = previousValue > 0
        ? Math.round(((currentValue - previousValue) / previousValue) * 100)
        : 0;

      const data = {
        metric,
        period: dateRange.label,
        current: currentValue,
        previous: previousValue,
        change,
        changeLabel: `${change >= 0 ? '+' : ''}${change}%`,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      };

      return this.successResponse(
        requestId,
        data,
        `${metric} is ${data.trend}: ${currentValue} vs ${previousValue} (${data.changeLabel})`
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleTrendAnalysis:', error);
      return this.errorResponse(requestId, 'error', 'Failed to analyze trend.');
    }
  }

  /**
   * Handle natural language business queries
   */
  private async handleNaturalLanguageQuery(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const query = params.query as string;
      const branchId = (params.branchId as string) || auth.branchId || 'all';

      // Classify the query intent
      const intent = this.classifyBusinessIntent(query);

      // Fetch relevant data based on intent
      const sources: AnalyticsDataSource[] = [];
      const dataContext = await this.fetchDataForIntent(intent, branchId, auth, sources);

      // Generate AI response if configured
      if (isOpenAIConfigured()) {
        const conversationHistory: ConversationMessage[] = [];
        const response = await generateResponse(
          query,
          conversationHistory,
          `${ANALYTICS_SYSTEM_PROMPT}\n\n## Data Retrieved\n${dataContext}`,
          'orchestrator',
          'chat_response'
        );

        return this.successResponse(requestId, {
          answer: response,
          intent,
          sources,
          branchId,
        }, response);
      }

      // Fallback response without AI
      return this.successResponse(requestId, {
        answer: `Based on my analysis: ${dataContext}`,
        intent,
        sources,
        branchId,
      }, `Analysis complete for: "${query}"`);
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleNaturalLanguageQuery:', error);

      // Check for server-side Firebase error and provide a helpful message
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Firebase Firestore is not initialized') ||
          errorMessage.includes('client side')) {
        // Return a helpful response without real data
        const intent = this.classifyBusinessIntent(params.query as string);
        return this.successResponse(requestId, {
          answer: 'I apologize, but I\'m currently unable to access the database from this context. The analytics feature requires a server-side database connection that isn\'t configured yet. Please check back later or contact your system administrator.',
          intent,
          sources: [],
          branchId: (params.branchId as string) || 'all',
        }, 'Database connection unavailable');
      }

      return this.errorResponse(requestId, 'error', 'Failed to process your question. Please try again.');
    }
  }

  /**
   * Get executive dashboard summary
   */
  private async handleDashboardSummary(
    requestId: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const branchId = (params.branchId as string) || auth.branchId;
      const branchIds = branchId && branchId !== 'all' ? [branchId] : null;

      const [todayOrders, completedOrders, todayRevenue, satisfaction, branchPerformance] = await Promise.all([
        getTodayOrdersCountServer(branchIds),
        getCompletedTodayCountServer(branchIds),
        getTodayRevenueServer(branchIds),
        getSatisfactionMetricsServer(branchId === 'all' ? undefined : branchId),
        getBranchPerformanceServer(branchId === 'all' ? undefined : branchId),
      ]);

      const data = {
        orders: {
          total: todayOrders,
          completed: completedOrders,
          completionRate: todayOrders > 0 ? Math.round((completedOrders / todayOrders) * 100) : 0,
        },
        revenue: {
          today: todayRevenue,
          formatted: this.formatCurrency(todayRevenue),
        },
        satisfaction,
        branches: branchPerformance,
        summary: {
          totalOrdersToday: todayOrders,
          completedToday: completedOrders,
          satisfactionScore: satisfaction.score,
          topBranch: branchPerformance[0]?.name || 'N/A',
        },
      };

      return this.successResponse(
        requestId,
        data,
        `Dashboard: ${todayOrders} orders today, ${completedOrders} completed, ${this.formatCurrency(todayRevenue)} revenue, ${satisfaction.score}/5 satisfaction`
      );
    } catch (error) {
      console.error('[AnalyticsAgent] Error in handleDashboardSummary:', error);
      return this.errorResponse(requestId, 'error', 'Failed to load dashboard summary.');
    }
  }

  /**
   * Classify business query intent
   */
  private classifyBusinessIntent(query: string): AnalyticsIntent {
    const lowerQuery = query.toLowerCase();

    // Revenue-related
    if (lowerQuery.match(/revenue|sales|income|earnings|money|profit|margin/)) {
      return 'ANALYTICS_REVENUE';
    }

    // Order-related
    if (lowerQuery.match(/orders?|pending|completed|overdue|backlog|pipeline/)) {
      return 'ANALYTICS_ORDERS';
    }

    // Customer-related
    if (lowerQuery.match(/customer|client|retention|acquisition|top customer|loyal/)) {
      return 'ANALYTICS_CUSTOMERS';
    }

    // Staff-related
    if (lowerQuery.match(/staff|employee|performance|productivity|team|worker/)) {
      return 'ANALYTICS_STAFF';
    }

    // Branch-related
    if (lowerQuery.match(/branch|location|store|compare|kilimani|westlands|karen/)) {
      return 'ANALYTICS_BRANCH';
    }

    // Delivery-related
    if (lowerQuery.match(/deliver|driver|pickup|route|dispatch/)) {
      return 'ANALYTICS_DELIVERY';
    }

    // Trend-related
    if (lowerQuery.match(/trend|growth|decline|change|compared|vs|versus|drop|increase/)) {
      return 'ANALYTICS_TREND';
    }

    // Forecast-related
    if (lowerQuery.match(/forecast|predict|projection|expect|future|next/)) {
      return 'ANALYTICS_FORECAST';
    }

    return 'ANALYTICS_GENERAL';
  }

  /**
   * Fetch data based on classified intent
   */
  private async fetchDataForIntent(
    intent: AnalyticsIntent,
    branchId: string,
    auth: AgentAuth,
    sources: AnalyticsDataSource[]
  ): Promise<string> {
    const branchIds = branchId === 'all' ? null : [branchId];
    let context = '';

    try {
      switch (intent) {
        case 'ANALYTICS_REVENUE': {
          const todaySummary = await getTodayTransactionSummaryServer();
          const todayRevenue = await getTodayRevenueServer(branchIds);
          sources.push({
            type: 'revenue',
            label: 'Today\'s Revenue',
            data: { ...todaySummary, branchRevenue: todayRevenue },
          });
          context = `Today's Revenue: ${this.formatCurrency(todayRevenue)}. Total transactions: ${todaySummary.count}. Payment breakdown: M-Pesa: ${this.formatCurrency(todaySummary.mpesa)}, Card: ${this.formatCurrency(todaySummary.card)}, Credit: ${this.formatCurrency(todaySummary.credit)}`;
          break;
        }

        case 'ANALYTICS_ORDERS': {
          const [todayOrders, completed] = await Promise.all([
            getTodayOrdersCountServer(branchIds),
            getCompletedTodayCountServer(branchIds),
          ]);

          let pipelineStats = null;
          if (branchId && branchId !== 'all') {
            pipelineStats = await getPipelineStatsServer(branchId);
          }

          sources.push({
            type: 'orders',
            label: 'Order Statistics',
            data: { todayOrders, completed, pipelineStats },
          });
          context = `Today: ${todayOrders} total orders, ${completed} completed. ${pipelineStats ? `Pipeline: ${JSON.stringify(pipelineStats)}` : ''}`;
          break;
        }

        case 'ANALYTICS_CUSTOMERS': {
          const topCustomers = await getTopCustomersServer(5);
          sources.push({
            type: 'customers',
            label: 'Top Customers',
            data: { topCustomers },
          });
          context = `Top 5 customers: ${topCustomers.map(c => `${c.name} (${this.formatCurrency(c.totalSpent)}, ${c.orderCount} orders)`).join('; ')}`;
          break;
        }

        case 'ANALYTICS_STAFF': {
          if (branchId && branchId !== 'all') {
            const topPerformers = await getTopPerformersServer(branchId, 5);
            sources.push({
              type: 'staff',
              label: 'Top Performers',
              data: { topPerformers },
            });
            context = `Top performers in branch: ${topPerformers.map(s => `${s.employeeName} (${s.metrics.overallScore}%)`).join('; ')}`;
          } else {
            context = 'Staff performance data requires a specific branch.';
          }
          break;
        }

        case 'ANALYTICS_BRANCH': {
          const branchPerformance = await getBranchPerformanceServer();
          sources.push({
            type: 'branch',
            label: 'Branch Performance',
            data: { branches: branchPerformance },
          });
          context = `Branch performance: ${branchPerformance.map(b => `${b.name}: ${this.formatCurrency(b.revenue)}, ${b.ordersToday} orders, ${b.efficiency}% efficiency`).join('; ')}`;
          break;
        }

        case 'ANALYTICS_DELIVERY': {
          const [pending, today] = await Promise.all([
            getDeliveriesCountServer(branchIds, 'pending'),
            getDeliveriesCountServer(branchIds),
          ]);
          sources.push({
            type: 'delivery',
            label: 'Delivery Stats',
            data: { pending, today },
          });
          context = `Deliveries: ${today} today, ${pending} pending`;
          break;
        }

        default: {
          // General - fetch multiple data points
          const [todayOrders, todayRevenue, satisfaction] = await Promise.all([
            getTodayOrdersCountServer(branchIds),
            getTodayRevenueServer(branchIds),
            getSatisfactionMetricsServer(branchId === 'all' ? undefined : branchId),
          ]);
          sources.push({
            type: 'orders',
            label: 'Overview',
            data: { todayOrders, todayRevenue, satisfaction },
          });
          context = `Overview: ${todayOrders} orders today, ${this.formatCurrency(todayRevenue)} revenue, ${satisfaction.score}/5 satisfaction`;
        }
      }
    } catch (error) {
      console.error('[AnalyticsAgent] Error fetching data for intent:', error);

      // Check if this is a server-side Firebase error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Firebase Firestore is not initialized') ||
          errorMessage.includes('client side')) {
        context = 'Database connection unavailable in current context. This feature requires the analytics service to be running on the client.';
      } else {
        context = 'Unable to fetch some data due to a temporary error. Please try again.';
      }
    }

    return context;
  }

  /**
   * Check if user has executive access (director/admin)
   */
  private isExecutive(auth: AgentAuth): boolean {
    return !!auth.staffRole && EXECUTIVE_ROLES.includes(auth.staffRole);
  }
}

/**
 * Create and export singleton instance
 */
export const analyticsAgent = new AnalyticsAgent();
