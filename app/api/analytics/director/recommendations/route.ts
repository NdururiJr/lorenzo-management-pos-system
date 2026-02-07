/**
 * Director Dashboard AI Recommendations API
 *
 * Aggregates data from existing agents and generates AI-powered
 * actionable recommendations for director-level decision making.
 *
 * @module app/api/analytics/director/recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { complete } from '@/lib/llm';

/**
 * Director/Admin roles that can access this endpoint
 */
const ALLOWED_ROLES = ['admin', 'director', 'general_manager'];

/**
 * Recommendation type
 */
type RecommendationType = 'opportunity' | 'optimization' | 'risk';

/**
 * Recommendation priority
 */
type RecommendationPriority = 'high' | 'medium' | 'low';

/**
 * Single recommendation structure
 */
interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  impact: string;
  priority: RecommendationPriority;
  actions: string[];
}

/**
 * Response structure
 */
interface RecommendationsResponse {
  recommendations: Recommendation[];
  generatedAt: string;
  dataSource: 'ai' | 'rule-based';
  metrics?: {
    ordersToday: number;
    pipelineTotal: number;
    topCustomersCount: number;
    pendingPickups: number;
    revenue: number;
  };
}

/**
 * Aggregated metrics from agents
 */
interface AggregatedMetrics {
  orders: {
    today: number;
    totalRevenue: number;
    averageValue: number;
    pipelineStats: Record<string, number>;
  };
  customers: {
    topCustomers: Array<{
      name: string;
      totalSpent: number;
      orderCount: number;
    }>;
    totalTopCustomers: number;
  };
  logistics: {
    pendingPickups: number;
    completedPickups: number;
    totalPickups: number;
    conversionRate: number;
  };
}

/**
 * Fetch order metrics directly from Firestore using Admin SDK
 * (Replaces agent calls that used client SDK)
 */
async function fetchOrderMetrics(): Promise<{
  todayOrders: number;
  todayRevenue: number;
  pipelineStats: Record<string, number>;
}> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get today's orders using Admin SDK
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(todayStart))
      .where('createdAt', '<=', Timestamp.fromDate(now))
      .get();

    let todayRevenue = 0;
    const pipelineStats: Record<string, number> = {};

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      todayRevenue += order.paidAmount || 0;

      // Count by status
      const status = order.status || 'unknown';
      pipelineStats[status] = (pipelineStats[status] || 0) + 1;
    });

    return {
      todayOrders: ordersSnapshot.size,
      todayRevenue,
      pipelineStats,
    };
  } catch (error) {
    console.error('Error fetching order metrics:', error);
    return { todayOrders: 0, todayRevenue: 0, pipelineStats: {} };
  }
}

/**
 * Fetch customer metrics directly from Firestore using Admin SDK
 * (Replaces agent calls that used client SDK)
 */
async function fetchCustomerMetrics(): Promise<{
  topCustomers: Array<{ name: string; totalSpent: number; orderCount: number }>;
  totalCount: number;
}> {
  try {
    // Get top customers by total spent using Admin SDK
    const customersSnapshot = await adminDb
      .collection('customers')
      .orderBy('totalSpent', 'desc')
      .limit(10)
      .get();

    const topCustomers = customersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        name: data.name || 'Unknown',
        totalSpent: data.totalSpent || 0,
        orderCount: data.orderCount || 0,
      };
    });

    return {
      topCustomers,
      totalCount: customersSnapshot.size,
    };
  } catch (error) {
    console.error('Error fetching customer metrics:', error);
    return { topCustomers: [], totalCount: 0 };
  }
}

/**
 * Fetch logistics metrics directly from Firestore using Admin SDK
 * (Replaces agent calls that used client SDK)
 */
async function fetchLogisticsMetrics(): Promise<{
  pendingPickups: number;
  completedPickups: number;
  totalPickups: number;
}> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get pickup requests from last 30 days using Admin SDK
    const pickupsSnapshot = await adminDb
      .collection('pickupRequests')
      .where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      .get();

    let pendingPickups = 0;
    let completedPickups = 0;

    pickupsSnapshot.forEach((doc) => {
      const pickup = doc.data();
      if (pickup.status === 'pending' || pickup.status === 'confirmed' || pickup.status === 'assigned') {
        pendingPickups++;
      } else if (pickup.status === 'completed' || pickup.status === 'at_facility') {
        completedPickups++;
      }
    });

    return {
      pendingPickups,
      completedPickups,
      totalPickups: pickupsSnapshot.size,
    };
  } catch (error) {
    console.error('Error fetching logistics metrics:', error);
    return { pendingPickups: 0, completedPickups: 0, totalPickups: 0 };
  }
}

/**
 * Fetch additional metrics directly from Firestore
 */
async function fetchDirectMetrics(): Promise<{
  monthlyRevenue: number;
  monthlyOrders: number;
  delayedOrders: number;
  unpaidOrders: number;
}> {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get orders from current month
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(monthStart))
      .where('createdAt', '<=', Timestamp.fromDate(now))
      .get();

    let monthlyRevenue = 0;
    let delayedOrders = 0;
    let unpaidOrders = 0;

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      monthlyRevenue += order.paidAmount || 0;

      // Check for delayed orders
      if (order.estimatedCompletion) {
        const estimatedDate = order.estimatedCompletion.toDate();
        if (
          estimatedDate < now &&
          !['delivered', 'collected'].includes(order.status)
        ) {
          delayedOrders++;
        }
      }

      // Check for unpaid orders
      if (
        order.paymentStatus === 'pending' &&
        ['ready', 'delivered', 'collected'].includes(order.status)
      ) {
        unpaidOrders++;
      }
    });

    return {
      monthlyRevenue,
      monthlyOrders: ordersSnapshot.size,
      delayedOrders,
      unpaidOrders,
    };
  } catch (error) {
    console.error('Error fetching direct metrics:', error);
    return {
      monthlyRevenue: 0,
      monthlyOrders: 0,
      delayedOrders: 0,
      unpaidOrders: 0,
    };
  }
}

/**
 * Generate AI-powered recommendations using LLM
 */
async function generateAIRecommendations(
  metrics: AggregatedMetrics,
  directMetrics: { monthlyRevenue: number; delayedOrders: number; unpaidOrders: number }
): Promise<{ recommendations: Recommendation[]; dataSource: 'ai' | 'rule-based' }> {
  const prompt = buildPrompt(metrics, directMetrics);

  try {
    const response = await complete(
      'analytics',
      'analytics_insights',
      [
        {
          role: 'system',
          content: `You are an expert business analyst for Lorenzo Dry Cleaners, a premium dry cleaning service in Nairobi, Kenya.
Your task is to analyze business metrics and provide actionable recommendations for the director/executive team.
You must respond with a valid JSON array of recommendations.
Each recommendation must have: type (opportunity|optimization|risk), title, description, impact (specific estimate in KES), priority (high|medium|low), and actions (array of 2-3 action buttons).
Provide exactly 3-5 recommendations based on the data.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 1500,
      }
    );

    // Parse the AI response
    const recommendations = parseAIResponse(response);
    if (recommendations.length > 0) {
      return { recommendations, dataSource: 'ai' };
    }

    // Fall back to rule-based if parsing fails
    return {
      recommendations: generateRuleBasedRecommendations(metrics, directMetrics),
      dataSource: 'rule-based',
    };
  } catch (error) {
    console.warn('LLM generation failed, using fallback:', error);
    return {
      recommendations: generateRuleBasedRecommendations(metrics, directMetrics),
      dataSource: 'rule-based',
    };
  }
}

/**
 * Build the prompt for AI recommendation generation
 */
function buildPrompt(
  metrics: AggregatedMetrics,
  directMetrics: { monthlyRevenue: number; delayedOrders: number; unpaidOrders: number }
): string {
  const topCustomerSummary = metrics.customers.topCustomers
    .slice(0, 5)
    .map((c) => `${c.name}: KES ${c.totalSpent.toLocaleString()} (${c.orderCount} orders)`)
    .join('\n');

  return `
Analyze the following business metrics for Lorenzo Dry Cleaners and generate actionable recommendations:

ORDER METRICS:
- Today's Orders: ${metrics.orders.today}
- Today's Revenue: KES ${metrics.orders.totalRevenue.toLocaleString()}
- Monthly Revenue: KES ${directMetrics.monthlyRevenue.toLocaleString()}
- Average Order Value: KES ${metrics.orders.averageValue.toLocaleString()}
- Pipeline Status: ${JSON.stringify(metrics.orders.pipelineStats)}

CUSTOMER INSIGHTS:
- Top Customers by Spending:
${topCustomerSummary}

LOGISTICS:
- Pending Pickups: ${metrics.logistics.pendingPickups}
- Completed Pickups (30 days): ${metrics.logistics.completedPickups}
- Pickup to Order Conversion Rate: ${Math.round(metrics.logistics.conversionRate * 100)}%

OPERATIONAL ISSUES:
- Delayed Orders: ${directMetrics.delayedOrders}
- Unpaid Orders: ${directMetrics.unpaidOrders}

Based on this data, generate 3-5 actionable recommendations in this exact JSON format:
[
  {
    "type": "opportunity|optimization|risk",
    "title": "Brief title",
    "description": "Detailed description of the recommendation",
    "impact": "Specific impact estimate (e.g., 'KES 450K/quarter')",
    "priority": "high|medium|low",
    "actions": ["Action Button 1", "Action Button 2"]
  }
]

Focus on:
1. Revenue growth opportunities
2. Operational efficiency improvements
3. Customer retention strategies
4. Risk mitigation for delayed/unpaid orders
5. Logistics optimization

Respond ONLY with the JSON array, no additional text.
`.trim();
}

/**
 * Parse AI response into recommendations
 */
function parseAIResponse(response: string): Recommendation[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('No JSON array found in AI response');
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Validate and sanitize each recommendation
    return parsed
      .filter((item): item is Record<string, unknown> => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.type === 'string' &&
          typeof item.title === 'string' &&
          typeof item.description === 'string'
        );
      })
      .map((item) => ({
        type: (['opportunity', 'optimization', 'risk'].includes(item.type as string)
          ? item.type
          : 'optimization') as RecommendationType,
        title: String(item.title),
        description: String(item.description),
        impact: String(item.impact || 'Impact to be determined'),
        priority: (['high', 'medium', 'low'].includes(item.priority as string)
          ? item.priority
          : 'medium') as RecommendationPriority,
        actions: Array.isArray(item.actions)
          ? item.actions.map(String).slice(0, 3)
          : ['View Details', 'Take Action'],
      }))
      .slice(0, 5);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

/**
 * Generate rule-based recommendations when LLM is unavailable
 */
function generateRuleBasedRecommendations(
  metrics: AggregatedMetrics,
  directMetrics: { monthlyRevenue: number; delayedOrders: number; unpaidOrders: number }
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check for delayed orders risk
  if (directMetrics.delayedOrders > 5) {
    recommendations.push({
      type: 'risk',
      title: 'High Number of Delayed Orders',
      description: `${directMetrics.delayedOrders} orders are past their estimated completion date. This may impact customer satisfaction and retention. Consider reviewing workflow bottlenecks.`,
      impact: `Risk of losing ${directMetrics.delayedOrders * 5}% customer loyalty`,
      priority: 'high',
      actions: ['View Delayed Orders', 'Optimize Workflow'],
    });
  }

  // Check for unpaid orders
  if (directMetrics.unpaidOrders > 3) {
    recommendations.push({
      type: 'risk',
      title: 'Outstanding Payment Collection',
      description: `${directMetrics.unpaidOrders} completed orders have pending payments. Implement automated payment reminders to improve cash flow.`,
      impact: 'Improved cash flow',
      priority: directMetrics.unpaidOrders > 10 ? 'high' : 'medium',
      actions: ['Send Reminders', 'View Unpaid Orders'],
    });
  }

  // Check for top customer engagement opportunity
  if (metrics.customers.topCustomers.length > 0) {
    const totalTopSpending = metrics.customers.topCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    recommendations.push({
      type: 'opportunity',
      title: 'VIP Customer Engagement Program',
      description: `Your top ${metrics.customers.totalTopCustomers} customers have spent KES ${totalTopSpending.toLocaleString()}. Consider launching a loyalty program to increase retention and referrals.`,
      impact: `KES ${Math.round(totalTopSpending * 0.15).toLocaleString()}/quarter potential increase`,
      priority: 'medium',
      actions: ['Create VIP Program', 'View Top Customers'],
    });
  }

  // Check pickup conversion opportunity
  if (metrics.logistics.totalPickups > 0 && metrics.logistics.conversionRate < 0.8) {
    recommendations.push({
      type: 'optimization',
      title: 'Improve Pickup to Order Conversion',
      description: `Current pickup-to-order conversion rate is ${Math.round(metrics.logistics.conversionRate * 100)}%. Streamline the process from pickup to order creation to capture more revenue.`,
      impact: `${Math.round((0.95 - metrics.logistics.conversionRate) * 100)}% potential improvement`,
      priority: 'medium',
      actions: ['Review Process', 'Train Staff'],
    });
  }

  // Revenue growth recommendation
  if (metrics.orders.averageValue > 0) {
    recommendations.push({
      type: 'opportunity',
      title: 'Increase Average Order Value',
      description: `Current average order value is KES ${metrics.orders.averageValue.toLocaleString()}. Introduce premium services or bundle offerings to increase per-order revenue.`,
      impact: `KES ${Math.round(metrics.orders.averageValue * 0.2).toLocaleString()}/order potential increase`,
      priority: 'medium',
      actions: ['Launch Premium Services', 'Create Bundles'],
    });
  }

  // Check pending pickups
  if (metrics.logistics.pendingPickups > 5) {
    recommendations.push({
      type: 'optimization',
      title: 'Address Pending Pickup Backlog',
      description: `${metrics.logistics.pendingPickups} pickup requests are awaiting assignment. Ensure timely driver allocation to maintain service quality.`,
      impact: 'Improved customer satisfaction',
      priority: metrics.logistics.pendingPickups > 15 ? 'high' : 'medium',
      actions: ['Assign Drivers', 'View Pending Pickups'],
    });
  }

  // If no specific recommendations, provide general growth advice
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'opportunity',
      title: 'Business Health is Strong',
      description: 'Key metrics are within healthy ranges. Focus on strategic expansion opportunities such as new branch locations or service offerings.',
      impact: 'Growth opportunity',
      priority: 'low',
      actions: ['Explore Expansion', 'View Analytics'],
    });
  }

  return recommendations.slice(0, 5);
}

/**
 * GET /api/analytics/director/recommendations
 *
 * Returns AI-powered recommendations for director dashboard
 *
 * Query Parameters:
 * - branchId: 'all' or specific branch ID (default: all)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user document to check role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    if (!userData?.role || !ALLOWED_ROLES.includes(userData.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters (branchId kept for potential future filtering)
    // const { searchParams } = new URL(request.url);
    // const branchId = searchParams.get('branchId') || 'all';

    // Fetch metrics directly from Firestore using Admin SDK
    const [orderMetrics, customerMetrics, logisticsMetrics, directMetrics] = await Promise.all([
      fetchOrderMetrics(),
      fetchCustomerMetrics(),
      fetchLogisticsMetrics(),
      fetchDirectMetrics(),
    ]);

    // Aggregate metrics
    const aggregatedMetrics: AggregatedMetrics = {
      orders: {
        today: orderMetrics.todayOrders,
        totalRevenue: orderMetrics.todayRevenue,
        averageValue: orderMetrics.todayOrders > 0
          ? Math.round(orderMetrics.todayRevenue / orderMetrics.todayOrders)
          : 0,
        pipelineStats: orderMetrics.pipelineStats,
      },
      customers: {
        topCustomers: customerMetrics.topCustomers,
        totalTopCustomers: customerMetrics.totalCount,
      },
      logistics: {
        pendingPickups: logisticsMetrics.pendingPickups,
        completedPickups: logisticsMetrics.completedPickups,
        totalPickups: logisticsMetrics.totalPickups,
        conversionRate: logisticsMetrics.totalPickups > 0
          ? logisticsMetrics.completedPickups / logisticsMetrics.totalPickups
          : 0,
      },
    };

    // Generate recommendations
    const { recommendations, dataSource } = await generateAIRecommendations(
      aggregatedMetrics,
      directMetrics
    );

    // Build response
    const response: RecommendationsResponse = {
      recommendations,
      generatedAt: new Date().toISOString(),
      dataSource,
      metrics: {
        ordersToday: aggregatedMetrics.orders.today,
        pipelineTotal: Object.values(aggregatedMetrics.orders.pipelineStats).reduce(
          (sum, count) => sum + (typeof count === 'number' ? count : 0),
          0
        ),
        topCustomersCount: aggregatedMetrics.customers.totalTopCustomers,
        pendingPickups: aggregatedMetrics.logistics.pendingPickups,
        revenue: directMetrics.monthlyRevenue,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Director recommendations API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
