/**
 * Director Dashboard AI Narrative API
 *
 * Generates executive-level AI narratives from business metrics data.
 * Uses the configured LLM provider to create human-readable summaries.
 *
 * @module app/api/analytics/director/ai-narrative
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { complete } from '@/lib/llm';

/**
 * Director/Admin roles that can access this endpoint
 */
const ALLOWED_ROLES = ['admin', 'director', 'general_manager'];

/**
 * KPI metric structure (matches insights API)
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
 * Request body structure
 */
interface AINarrativeRequest {
  timeframe: string;
  branchId: string;
  branchName?: string;
  kpis: {
    revenue: KPIMetric;
    operatingMargin: KPIMetric;
    customerRetention: KPIMetric;
    avgOrderValue: KPIMetric;
  };
  drivers: PerformanceDriver[];
  risks: RiskItem[];
  recommendations: Recommendation[];
  healthScore: number;
}

/**
 * Response structure
 */
interface AINarrativeResponse {
  narrative: string;
  generatedAt: string;
  model?: string;
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return `KES ${value.toLocaleString()}`;
}

/**
 * Format percentage for display
 */
function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value}%`;
}

/**
 * Build the prompt for AI narrative generation
 */
function buildPrompt(data: AINarrativeRequest): string {
  const { timeframe, branchId, branchName, kpis, drivers, risks, recommendations, healthScore } = data;

  const branchContext = branchId === 'all'
    ? 'across all branches'
    : `for ${branchName || branchId}`;

  const timeframeLabel = {
    today: 'today',
    week: 'this week',
    month: 'this month',
    quarter: 'this quarter',
    year: 'this year',
  }[timeframe] || timeframe;

  // Build KPI summary
  const kpiSummary = `
Key Performance Indicators (${timeframeLabel}):
- Revenue: ${formatCurrency(kpis.revenue.value)} (${formatPercentage(kpis.revenue.change)} vs previous period)
- Operating Margin: ${kpis.operatingMargin.value}% (${formatPercentage(kpis.operatingMargin.change)} vs previous period)
- Customer Retention: ${kpis.customerRetention.value}% (${formatPercentage(kpis.customerRetention.change)} vs previous period)
- Average Order Value: ${formatCurrency(kpis.avgOrderValue.value)} (${formatPercentage(kpis.avgOrderValue.change)} vs previous period)
- Overall Health Score: ${healthScore}/100
`.trim();

  // Build drivers summary
  const driversSummary = drivers.length > 0
    ? `
Performance Drivers:
${drivers.map((d) => `- ${d.name}: ${d.value > 0 ? '+' : ''}${d.value} (${d.type})`).join('\n')}
`.trim()
    : 'No significant performance drivers identified.';

  // Build risks summary
  const risksSummary = risks.length > 0
    ? `
Identified Risks:
${risks.map((r) => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join('\n')}
`.trim()
    : 'No significant risks identified.';

  // Build recommendations summary
  const recommendationsSummary = recommendations.length > 0
    ? `
Recommendations:
${recommendations.map((r) => `- [${r.type}] ${r.text} (Impact: ${r.impact})`).join('\n')}
`.trim()
    : 'No specific recommendations at this time.';

  return `
You are an executive business analyst for Lorenzo Dry Cleaners, a professional dry cleaning service in Nairobi, Kenya. Generate a concise, professional executive summary based on the following business metrics ${branchContext}.

${kpiSummary}

${driversSummary}

${risksSummary}

${recommendationsSummary}

Instructions:
1. Write a 2-3 paragraph executive summary suitable for a director or general manager
2. Start with the overall business health assessment
3. Highlight the most important trends and their implications
4. If there are high-severity risks, emphasize them and suggest urgency
5. End with a forward-looking statement or key action item
6. Use professional, clear language suitable for executive communication
7. Include specific numbers and percentages where relevant
8. Keep the tone confident but balanced - acknowledge both strengths and areas for improvement
9. Currency is in Kenyan Shillings (KES)

Generate the executive summary now:
`.trim();
}

/**
 * Fallback narrative generation when LLM is unavailable
 */
function generateFallbackNarrative(data: AINarrativeRequest): string {
  const { kpis, risks, healthScore, timeframe } = data;

  const timeframeLabel = {
    today: "Today's",
    week: "This week's",
    month: "This month's",
    quarter: "This quarter's",
    year: "This year's",
  }[timeframe] || 'Recent';

  const parts: string[] = [];

  // Health assessment
  if (healthScore >= 80) {
    parts.push(`${timeframeLabel} business performance is strong with a health score of ${healthScore}/100.`);
  } else if (healthScore >= 60) {
    parts.push(`${timeframeLabel} business performance is satisfactory with a health score of ${healthScore}/100, though there are areas requiring attention.`);
  } else {
    parts.push(`${timeframeLabel} business metrics indicate challenges with a health score of ${healthScore}/100. Immediate attention is recommended.`);
  }

  // Revenue insight
  if (kpis.revenue.change > 0) {
    parts.push(`Revenue has increased by ${kpis.revenue.change}% to ${formatCurrency(kpis.revenue.value)}, reflecting positive business momentum.`);
  } else if (kpis.revenue.change < 0) {
    parts.push(`Revenue has decreased by ${Math.abs(kpis.revenue.change)}% to ${formatCurrency(kpis.revenue.value)}. This trend warrants investigation into market conditions and operational factors.`);
  }

  // Customer retention insight
  if (kpis.customerRetention.value >= 60) {
    parts.push(`Customer retention at ${kpis.customerRetention.value}% indicates strong customer loyalty and satisfaction.`);
  } else {
    parts.push(`Customer retention at ${kpis.customerRetention.value}% suggests opportunities to improve customer engagement and loyalty programs.`);
  }

  // Risk summary
  const highRisks = risks.filter((r) => r.severity === 'high');
  if (highRisks.length > 0) {
    parts.push(`There are ${highRisks.length} high-priority issue(s) requiring immediate attention: ${highRisks.map((r) => r.title).join(', ')}.`);
  }

  // Forward-looking statement
  if (healthScore >= 70) {
    parts.push('Focus on maintaining operational excellence while exploring growth opportunities.');
  } else {
    parts.push('Priority should be given to addressing identified risks and improving core metrics.');
  }

  return parts.join(' ');
}

/**
 * POST /api/analytics/director/ai-narrative
 *
 * Generates an AI-powered executive narrative from business metrics
 *
 * Request Body:
 * - timeframe: string
 * - branchId: string
 * - branchName?: string
 * - kpis: KPI metrics object
 * - drivers: Performance drivers array
 * - risks: Risk items array
 * - recommendations: Recommendations array
 * - healthScore: number
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    let requestData: AINarrativeRequest;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body - Expected JSON' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!requestData.kpis || !requestData.timeframe) {
      return NextResponse.json(
        { error: 'Missing required fields: kpis and timeframe are required' },
        { status: 400 }
      );
    }

    // Build prompt
    const prompt = buildPrompt(requestData);

    // Attempt to generate AI narrative
    let narrative: string;
    let model: string | undefined;

    try {
      // Use the LLM client with analytics agent type
      narrative = await complete(
        'analytics',
        'analytics_insights',
        [
          {
            role: 'system',
            content: 'You are an executive business analyst specializing in retail and service industries. Generate professional, data-driven executive summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          temperature: 0.7,
          maxTokens: 1000,
        }
      );

      model = 'llm-configured'; // Model is determined by LLM config
    } catch (llmError) {
      console.warn('LLM generation failed, using fallback:', llmError);

      // Fall back to rule-based narrative
      narrative = generateFallbackNarrative(requestData);
      model = 'fallback-rules';
    }

    const response: AINarrativeResponse = {
      narrative,
      generatedAt: new Date().toISOString(),
      model,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, no-cache', // Don't cache AI-generated content
      },
    });
  } catch (error) {
    console.error('AI narrative API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
