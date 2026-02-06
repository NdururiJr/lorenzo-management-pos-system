/**
 * Director Search API Route
 *
 * Handles natural language business queries from the director dashboard.
 * Routes queries to the analytics agent for processing.
 *
 * @module app/api/director/search/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { sendToAgent, createStaffAuth, type AgentAuth, type StaffRole } from '@/lib/agents';

/**
 * Executive roles that can access this API
 */
const EXECUTIVE_ROLES: StaffRole[] = ['admin', 'director'];

/**
 * POST /api/director/search
 *
 * Process a natural language business query
 *
 * Request body:
 * - query: string - The natural language question
 * - context?: { branchId?: string, timeframe?: string } - Optional context
 *
 * Response:
 * - answer: string - AI-generated response
 * - intent: string - Classified intent type
 * - sources: Array - Data sources used
 * - confidence: number - Classification confidence
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication via Bearer token
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if user has executive access
    const userRole = decodedToken.role as StaffRole | undefined;
    if (!userRole || !EXECUTIVE_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: 'Access denied. This feature is only available to directors and administrators.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { query, context } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required.' },
        { status: 400 }
      );
    }

    // Create staff auth context
    const auth: AgentAuth = createStaffAuth(
      decodedToken.uid,
      userRole,
      decodedToken.branchId || 'all',
      `search_${Date.now()}`,
      decodedToken.branchAccess
    );

    // Determine branch context
    const branchId = context?.branchId || decodedToken.branchId || 'all';
    const timeframe = context?.timeframe || 'today';

    // Send query to analytics agent
    const response = await sendToAgent(
      'analytics-agent',
      'getNaturalLanguageQuery',
      {
        query: query.trim(),
        branchId,
        timeframe,
      },
      auth,
      'staff-assistant'
    );

    // Handle agent response
    if (response.status === 'success') {
      const data = response.data as {
        answer: string;
        intent: string;
        sources: Array<{ type: string; label: string; data: unknown }>;
        branchId: string;
      };

      return NextResponse.json({
        success: true,
        answer: data.answer,
        intent: data.intent,
        sources: data.sources,
        branchId: data.branchId,
        message: response.message,
      });
    } else if (response.status === 'unauthorized') {
      return NextResponse.json(
        { error: response.error || 'You do not have permission to access this data.' },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { error: response.error || 'Failed to process your query. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Director Search API] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/director/search
 *
 * Returns available query capabilities
 */
export async function GET() {
  return NextResponse.json({
    capabilities: [
      {
        category: 'Revenue',
        examples: [
          'What\'s our revenue today?',
          'Why did Kilimani revenue drop last week?',
          'Show me revenue by payment method',
        ],
      },
      {
        category: 'Orders',
        examples: [
          'How many orders are pending?',
          'Show me overdue orders',
          'What\'s our completion rate today?',
        ],
      },
      {
        category: 'Customers',
        examples: [
          'Who are our top customers?',
          'How many new customers this month?',
          'Show customer retention metrics',
        ],
      },
      {
        category: 'Staff',
        examples: [
          'How is the team performing?',
          'Who are the top performers?',
          'Show staff productivity metrics',
        ],
      },
      {
        category: 'Branches',
        examples: [
          'Compare branch performance',
          'Which branch is doing best?',
          'How is Kilimani performing?',
        ],
      },
      {
        category: 'Deliveries',
        examples: [
          'How many deliveries are pending?',
          'Show driver efficiency',
          'What\'s our delivery success rate?',
        ],
      },
    ],
  });
}
