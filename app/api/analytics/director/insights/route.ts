/**
 * Director Dashboard Insights API
 *
 * Provides comprehensive KPIs, business health metrics, risk detection,
 * and recommendations for director-level dashboards.
 *
 * @module app/api/analytics/director/insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Allowed timeframes for analytics
 */
type Timeframe = 'today' | 'week' | 'month' | 'quarter' | 'year';

/**
 * KPI metric structure
 */
interface KPIMetric {
  value: number;
  change: number;
  changeType: 'positive' | 'warning' | 'negative' | 'neutral';
}

/**
 * Performance driver structure
 */
interface PerformanceDriver {
  name: string;
  value: number;
  type: 'positive' | 'negative';
}

/**
 * Risk item structure
 */
interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * Recommendation structure
 */
interface Recommendation {
  type: 'opportunity' | 'optimization';
  text: string;
  impact: string;
}

/**
 * Director insights response structure
 */
interface DirectorInsightsResponse {
  kpis: {
    revenue: KPIMetric;
    operatingMargin: KPIMetric;
    customerRetention: KPIMetric;
    avgOrderValue: KPIMetric;
  };
  narrative: {
    healthScore: number;
    text: string;
  };
  drivers: PerformanceDriver[];
  risks: RiskItem[];
  recommendations: Recommendation[];
}

/**
 * Director/Admin roles that can access this endpoint
 */
const ALLOWED_ROLES = ['admin', 'director', 'general_manager'];

/**
 * Get date range for the specified timeframe
 */
function getDateRange(timeframe: Timeframe): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (timeframe) {
    case 'today':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 1);
      previousEnd = new Date(start);
      break;

    case 'week':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = new Date(start);
      break;

    case 'month':
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      previousStart = new Date(start);
      previousStart.setMonth(previousStart.getMonth() - 1);
      previousEnd = new Date(start);
      break;

    case 'quarter':
      start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
      previousStart = new Date(start);
      previousStart.setMonth(previousStart.getMonth() - 3);
      previousEnd = new Date(start);
      break;

    case 'year':
      start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      previousStart = new Date(start);
      previousStart.setFullYear(previousStart.getFullYear() - 1);
      previousEnd = new Date(start);
      break;

    default:
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 30);
      previousEnd = new Date(start);
  }

  return { start, end, previousStart, previousEnd };
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(current: number, previous: number): { change: number; changeType: 'positive' | 'warning' | 'negative' | 'neutral' } {
  if (previous === 0) {
    return { change: current > 0 ? 100 : 0, changeType: current > 0 ? 'positive' : 'neutral' };
  }

  const change = ((current - previous) / previous) * 100;
  let changeType: 'positive' | 'warning' | 'negative' | 'neutral' = 'neutral';

  if (change > 5) {
    changeType = 'positive';
  } else if (change < -5) {
    changeType = 'negative';
  } else if (change < 0) {
    changeType = 'warning';
  }

  return { change: Math.round(change * 10) / 10, changeType };
}

/**
 * Query orders for a date range and optional branch
 */
async function getOrdersInRange(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<FirebaseFirestore.QuerySnapshot> {
  let query = adminDb
    .collection('orders')
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .where('createdAt', '<=', Timestamp.fromDate(endDate));

  if (branchId && branchId !== 'all') {
    query = query.where('branchId', '==', branchId);
  }

  return query.get();
}

/**
 * Query transactions for a date range and optional branch
 */
async function getTransactionsInRange(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<FirebaseFirestore.QuerySnapshot> {
  let query = adminDb
    .collection('transactions')
    .where('timestamp', '>=', Timestamp.fromDate(startDate))
    .where('timestamp', '<=', Timestamp.fromDate(endDate))
    .where('status', '==', 'completed');

  if (branchId && branchId !== 'all') {
    query = query.where('branchId', '==', branchId);
  }

  return query.get();
}

/**
 * Get unique customers who placed orders in a date range
 */
async function getActiveCustomers(
  startDate: Date,
  endDate: Date,
  branchId?: string
): Promise<Set<string>> {
  const ordersSnapshot = await getOrdersInRange(startDate, endDate, branchId);
  const customerIds = new Set<string>();

  ordersSnapshot.forEach((doc) => {
    const order = doc.data();
    if (order.customerId) {
      customerIds.add(order.customerId);
    }
  });

  return customerIds;
}

/**
 * Calculate KPIs from order and transaction data
 */
async function calculateKPIs(
  timeframe: Timeframe,
  branchId?: string
): Promise<DirectorInsightsResponse['kpis']> {
  const { start, end, previousStart, previousEnd } = getDateRange(timeframe);

  // Get current period data
  const [currentOrders, currentTransactions] = await Promise.all([
    getOrdersInRange(start, end, branchId),
    getTransactionsInRange(start, end, branchId),
  ]);

  // Get previous period data for comparison
  const [previousOrders, previousTransactions] = await Promise.all([
    getOrdersInRange(previousStart, previousEnd, branchId),
    getTransactionsInRange(previousStart, previousEnd, branchId),
  ]);

  // Calculate current period metrics
  let currentRevenue = 0;
  let currentOrderCount = 0;
  currentTransactions.forEach((doc) => {
    const txn = doc.data();
    currentRevenue += txn.amount || 0;
  });
  currentOrders.forEach(() => {
    currentOrderCount++;
  });

  // Calculate previous period metrics
  let previousRevenue = 0;
  let previousOrderCount = 0;
  previousTransactions.forEach((doc) => {
    const txn = doc.data();
    previousRevenue += txn.amount || 0;
  });
  previousOrders.forEach(() => {
    previousOrderCount++;
  });

  // Average order value
  const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

  // Customer retention (returning customers / total customers)
  const currentCustomers = await getActiveCustomers(start, end, branchId);
  const previousCustomers = await getActiveCustomers(previousStart, previousEnd, branchId);

  let returningCustomers = 0;
  currentCustomers.forEach((customerId) => {
    if (previousCustomers.has(customerId)) {
      returningCustomers++;
    }
  });

  const currentRetention = previousCustomers.size > 0
    ? (returningCustomers / previousCustomers.size) * 100
    : 0;

  // Estimate previous retention (use current as proxy if no historical data)
  const previousRetention = currentRetention > 0 ? currentRetention * 0.95 : 0;

  // Operating margin (simplified - using 65% as baseline for dry cleaning industry)
  // In a real implementation, this would include actual cost data
  const estimatedCosts = currentRevenue * 0.35; // 35% cost ratio
  const currentMargin = currentRevenue > 0
    ? ((currentRevenue - estimatedCosts) / currentRevenue) * 100
    : 0;
  const previousEstimatedCosts = previousRevenue * 0.35;
  const previousMargin = previousRevenue > 0
    ? ((previousRevenue - previousEstimatedCosts) / previousRevenue) * 100
    : 0;

  // Calculate changes
  const revenueChange = calculateChange(currentRevenue, previousRevenue);
  const marginChange = calculateChange(currentMargin, previousMargin);
  const retentionChange = calculateChange(currentRetention, previousRetention);
  const aovChange = calculateChange(currentAOV, previousAOV);

  return {
    revenue: {
      value: Math.round(currentRevenue),
      change: revenueChange.change,
      changeType: revenueChange.changeType,
    },
    operatingMargin: {
      value: Math.round(currentMargin * 10) / 10,
      change: marginChange.change,
      changeType: marginChange.changeType,
    },
    customerRetention: {
      value: Math.round(currentRetention * 10) / 10,
      change: retentionChange.change,
      changeType: retentionChange.changeType,
    },
    avgOrderValue: {
      value: Math.round(currentAOV),
      change: aovChange.change,
      changeType: aovChange.changeType,
    },
  };
}

/**
 * Detect risks from order and operational data
 */
async function detectRisks(
  timeframe: Timeframe,
  branchId?: string
): Promise<RiskItem[]> {
  const risks: RiskItem[] = [];
  const { start, end } = getDateRange(timeframe);

  // Get orders to analyze
  const ordersSnapshot = await getOrdersInRange(start, end, branchId);

  // Analyze order statuses
  let delayedOrders = 0;
  let totalOrders = 0;
  let unpaidOrders = 0;
  const now = new Date();

  ordersSnapshot.forEach((doc) => {
    const order = doc.data();
    totalOrders++;

    // Check for delayed orders (past estimated completion but not delivered/collected)
    if (order.estimatedCompletion) {
      const estimatedDate = order.estimatedCompletion.toDate();
      if (
        estimatedDate < now &&
        !['delivered', 'collected'].includes(order.status)
      ) {
        delayedOrders++;
      }
    }

    // Check for unpaid orders that are ready or delivered
    if (
      order.paymentStatus === 'pending' &&
      ['ready', 'delivered', 'collected'].includes(order.status)
    ) {
      unpaidOrders++;
    }
  });

  // Delayed orders risk
  if (totalOrders > 0) {
    const delayedPercentage = (delayedOrders / totalOrders) * 100;
    if (delayedPercentage > 15) {
      risks.push({
        id: 'delayed-orders-high',
        title: 'High Order Delay Rate',
        description: `${delayedOrders} orders (${Math.round(delayedPercentage)}%) are past their estimated completion date. This may impact customer satisfaction.`,
        severity: 'high',
      });
    } else if (delayedPercentage > 5) {
      risks.push({
        id: 'delayed-orders-medium',
        title: 'Elevated Order Delays',
        description: `${delayedOrders} orders (${Math.round(delayedPercentage)}%) are experiencing delays. Monitor processing capacity.`,
        severity: 'medium',
      });
    }
  }

  // Unpaid orders risk
  if (unpaidOrders > 5) {
    risks.push({
      id: 'unpaid-orders',
      title: 'Outstanding Payments',
      description: `${unpaidOrders} completed orders have pending payments. Consider following up with customers.`,
      severity: unpaidOrders > 10 ? 'high' : 'medium',
    });
  }

  // Check for low inventory (if inventory collection exists)
  try {
    let inventoryQuery = adminDb
      .collection('inventory')
      .where('quantity', '<=', 10); // Low stock threshold

    if (branchId && branchId !== 'all') {
      inventoryQuery = inventoryQuery.where('branchId', '==', branchId);
    }

    const lowStockSnapshot = await inventoryQuery.get();
    if (lowStockSnapshot.size > 0) {
      risks.push({
        id: 'low-inventory',
        title: 'Low Inventory Alert',
        description: `${lowStockSnapshot.size} items are running low on stock. Review and reorder supplies.`,
        severity: lowStockSnapshot.size > 5 ? 'high' : 'medium',
      });
    }
  } catch {
    // Inventory collection may not exist, skip this check
  }

  // Check for orders stuck in processing
  const stuckStatuses = ['washing', 'drying', 'ironing', 'quality_check'];
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  let stuckOrders = 0;
  ordersSnapshot.forEach((doc) => {
    const order = doc.data();
    if (
      stuckStatuses.includes(order.status) &&
      order.createdAt?.toDate() < twoDaysAgo
    ) {
      stuckOrders++;
    }
  });

  if (stuckOrders > 0) {
    risks.push({
      id: 'stuck-orders',
      title: 'Orders Stuck in Processing',
      description: `${stuckOrders} orders have been in processing for more than 2 days. Investigate bottlenecks.`,
      severity: stuckOrders > 5 ? 'high' : 'low',
    });
  }

  return risks;
}

/**
 * Identify performance drivers
 */
async function identifyDrivers(
  timeframe: Timeframe,
  branchId?: string
): Promise<PerformanceDriver[]> {
  const drivers: PerformanceDriver[] = [];
  const { start, end, previousStart, previousEnd } = getDateRange(timeframe);

  // Get order data for both periods
  const [currentOrders, previousOrders] = await Promise.all([
    getOrdersInRange(start, end, branchId),
    getOrdersInRange(previousStart, previousEnd, branchId),
  ]);

  // Analyze order completion rates
  let currentCompleted = 0;
  let previousCompleted = 0;

  currentOrders.forEach((doc) => {
    const order = doc.data();
    if (['delivered', 'collected'].includes(order.status)) {
      currentCompleted++;
    }
  });

  previousOrders.forEach((doc) => {
    const order = doc.data();
    if (['delivered', 'collected'].includes(order.status)) {
      previousCompleted++;
    }
  });

  const completionChange = currentCompleted - previousCompleted;
  if (Math.abs(completionChange) > 2) {
    drivers.push({
      name: 'Order Completion Rate',
      value: completionChange,
      type: completionChange > 0 ? 'positive' : 'negative',
    });
  }

  // Analyze new customer acquisition
  const currentCustomers = await getActiveCustomers(start, end, branchId);
  const previousCustomers = await getActiveCustomers(previousStart, previousEnd, branchId);

  let newCustomers = 0;
  currentCustomers.forEach((customerId) => {
    if (!previousCustomers.has(customerId)) {
      newCustomers++;
    }
  });

  const customerGrowth = currentCustomers.size - previousCustomers.size;
  if (Math.abs(customerGrowth) > 1) {
    drivers.push({
      name: 'Customer Base Growth',
      value: customerGrowth,
      type: customerGrowth > 0 ? 'positive' : 'negative',
    });
  }

  if (newCustomers > 0) {
    drivers.push({
      name: 'New Customer Acquisition',
      value: newCustomers,
      type: 'positive',
    });
  }

  // Analyze average order size changes
  let currentTotal = 0;
  let previousTotal = 0;

  currentOrders.forEach((doc) => {
    const order = doc.data();
    currentTotal += order.totalAmount || 0;
  });

  previousOrders.forEach((doc) => {
    const order = doc.data();
    previousTotal += order.totalAmount || 0;
  });

  const currentAOV = currentOrders.size > 0 ? currentTotal / currentOrders.size : 0;
  const previousAOV = previousOrders.size > 0 ? previousTotal / previousOrders.size : 0;
  const aovChange = currentAOV - previousAOV;

  if (Math.abs(aovChange) > 50) {
    drivers.push({
      name: 'Average Order Value',
      value: Math.round(aovChange),
      type: aovChange > 0 ? 'positive' : 'negative',
    });
  }

  return drivers;
}

/**
 * Generate recommendations based on metrics
 */
function generateRecommendations(
  kpis: DirectorInsightsResponse['kpis'],
  risks: RiskItem[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Revenue recommendations
  if (kpis.revenue.changeType === 'negative') {
    recommendations.push({
      type: 'opportunity',
      text: 'Consider running promotional campaigns or loyalty programs to boost revenue.',
      impact: 'Potential 10-15% revenue increase',
    });
  }

  // Customer retention recommendations
  if (kpis.customerRetention.value < 50) {
    recommendations.push({
      type: 'optimization',
      text: 'Implement a customer follow-up program to improve retention rates.',
      impact: 'Could improve retention by 20%',
    });
  }

  // Average order value recommendations
  if (kpis.avgOrderValue.changeType === 'negative') {
    recommendations.push({
      type: 'opportunity',
      text: 'Introduce bundle pricing or premium services to increase average order value.',
      impact: 'Potential 15% increase in AOV',
    });
  }

  // Risk-based recommendations
  const hasDelayRisk = risks.some((r) => r.id.includes('delayed'));
  if (hasDelayRisk) {
    recommendations.push({
      type: 'optimization',
      text: 'Review and optimize processing workflow to reduce delivery delays.',
      impact: 'Improved customer satisfaction and retention',
    });
  }

  const hasPaymentRisk = risks.some((r) => r.id === 'unpaid-orders');
  if (hasPaymentRisk) {
    recommendations.push({
      type: 'optimization',
      text: 'Implement automated payment reminders via WhatsApp for pending payments.',
      impact: 'Faster cash flow and reduced outstanding balances',
    });
  }

  // Add general optimization if no specific issues
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'opportunity',
      text: 'Business metrics are healthy. Consider expanding services or opening new branches.',
      impact: 'Growth opportunity',
    });
  }

  return recommendations;
}

/**
 * Calculate overall business health score
 */
function calculateHealthScore(
  kpis: DirectorInsightsResponse['kpis'],
  risks: RiskItem[]
): number {
  let score = 70; // Base score

  // KPI impacts
  if (kpis.revenue.changeType === 'positive') score += 10;
  else if (kpis.revenue.changeType === 'negative') score -= 10;

  if (kpis.customerRetention.value >= 60) score += 10;
  else if (kpis.customerRetention.value < 40) score -= 10;

  if (kpis.operatingMargin.value >= 60) score += 5;
  else if (kpis.operatingMargin.value < 50) score -= 5;

  // Risk impacts
  const highRisks = risks.filter((r) => r.severity === 'high').length;
  const mediumRisks = risks.filter((r) => r.severity === 'medium').length;

  score -= highRisks * 10;
  score -= mediumRisks * 5;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate business health narrative
 */
function generateNarrative(
  kpis: DirectorInsightsResponse['kpis'],
  risks: RiskItem[],
  healthScore: number
): string {
  const parts: string[] = [];

  // Overall health
  if (healthScore >= 80) {
    parts.push('Business performance is strong.');
  } else if (healthScore >= 60) {
    parts.push('Business is performing at acceptable levels with some areas for improvement.');
  } else {
    parts.push('Business metrics indicate areas requiring attention.');
  }

  // Revenue insight
  if (kpis.revenue.change > 10) {
    parts.push(`Revenue is up ${kpis.revenue.change}% compared to the previous period.`);
  } else if (kpis.revenue.change < -10) {
    parts.push(`Revenue has declined ${Math.abs(kpis.revenue.change)}% from the previous period.`);
  }

  // Customer retention insight
  if (kpis.customerRetention.value >= 60) {
    parts.push('Customer retention is healthy, indicating strong customer satisfaction.');
  } else if (kpis.customerRetention.value < 40) {
    parts.push('Customer retention needs attention - consider implementing loyalty programs.');
  }

  // Risk summary
  const highRisks = risks.filter((r) => r.severity === 'high').length;
  if (highRisks > 0) {
    parts.push(`There are ${highRisks} high-priority issues requiring immediate attention.`);
  }

  return parts.join(' ');
}

/**
 * GET /api/analytics/director/insights
 *
 * Returns comprehensive business insights for director dashboard
 *
 * Query Parameters:
 * - timeframe: today | week | month | quarter | year (default: month)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get('timeframe') || 'month') as Timeframe;
    const branchId = searchParams.get('branchId') || 'all';

    // Validate timeframe
    const validTimeframes: Timeframe[] = ['today', 'week', 'month', 'quarter', 'year'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be one of: today, week, month, quarter, year' },
        { status: 400 }
      );
    }

    // Calculate all metrics in parallel
    const [kpis, risks, drivers] = await Promise.all([
      calculateKPIs(timeframe, branchId),
      detectRisks(timeframe, branchId),
      identifyDrivers(timeframe, branchId),
    ]);

    // Generate recommendations based on data
    const recommendations = generateRecommendations(kpis, risks);

    // Calculate health score and narrative
    const healthScore = calculateHealthScore(kpis, risks);
    const narrativeText = generateNarrative(kpis, risks, healthScore);

    const response: DirectorInsightsResponse = {
      kpis,
      narrative: {
        healthScore,
        text: narrativeText,
      },
      drivers,
      risks,
      recommendations,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Director insights API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
