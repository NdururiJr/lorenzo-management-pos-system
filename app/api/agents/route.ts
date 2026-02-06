/**
 * Agent API Route
 *
 * Main API endpoint for the multi-agent AI system.
 * Handles requests from website chatbot, staff assistant, and other interfaces.
 *
 * @module app/api/agents/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCors, handlePreflight, corsJsonResponse, corsErrorResponse } from '@/lib/api/cors';
import { rateLimit } from '@/lib/api/rate-limit';
import { verifyIdToken } from '@/lib/firebase-admin';
import {
  initializeAgents,
  getAgentRouter,
  createGuestAuth,
  createCustomerAuth,
  createStaffAuth,
  generateRequestId,
} from '@/lib/agents';
import type { AgentRequest, AgentAuth, AgentSource, AgentName, StaffRole } from '@/lib/agents/types';

// Initialize agents on module load
initializeAgents();

/**
 * Handle OPTIONS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

/**
 * Handle POST requests to the agent API
 *
 * Request body should contain:
 * - toAgent: Target agent name
 * - action: Action to perform
 * - params: Action parameters
 * - source: (optional) Request source
 *
 * Authentication:
 * - Unauthenticated: Guest access (limited capabilities)
 * - Bearer token: Customer or staff access based on token claims
 */
async function handler(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  const startTime = Date.now();

  // Apply rate limiting (10 requests per minute for AI agents)
  const rateLimitResponse = rateLimit(request, 'agents');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Parse request body
    const body = await request.json();
    const {
      toAgent,
      action,
      params = {},
      source = 'website-chatbot',
    } = body as {
      toAgent: string;
      action: string;
      params?: Record<string, unknown>;
      source?: AgentSource;
    };

    // Validate required fields
    if (!toAgent || !action) {
      return corsErrorResponse(
        'Missing required fields: toAgent and action are required',
        origin,
        400
      );
    }

    // Extract and verify authentication
    const auth = await extractAuth(request, source);

    // Create agent request
    const agentRequest: AgentRequest = {
      requestId: generateRequestId(),
      fromAgent: source,
      toAgent: toAgent as AgentName,
      action,
      params,
      auth,
      timestamp: new Date().toISOString(),
    };

    // Route request to appropriate agent
    const router = getAgentRouter();
    const response = await router.route(agentRequest);

    // Log request metrics
    const duration = Date.now() - startTime;
    console.log(
      `[API /agents] ${toAgent}/${action} - ${response.status} (${duration}ms) - ${auth.userType}`
    );

    // Return response
    return corsJsonResponse(
      {
        ...response,
        meta: {
          duration,
          requestId: agentRequest.requestId,
        },
      },
      origin
    );
  } catch (error) {
    console.error('[API /agents] Error:', error);
    return corsErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      origin,
      500
    );
  }
}

/**
 * Extract authentication context from request
 */
async function extractAuth(
  request: NextRequest,
  _source: AgentSource
): Promise<AgentAuth> {
  const sessionId = request.headers.get('x-session-id') || generateRequestId();

  // Check for Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Guest access
    return createGuestAuth(sessionId);
  }

  const token = authHeader.substring(7);

  try {
    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get custom claims for role information
    const claims = decodedToken as Record<string, unknown>;

    // Check if this is a staff member
    if (claims.role && typeof claims.role === 'string') {
      const staffRole = claims.role as StaffRole;
      const branchId = claims.branchId as string | undefined;
      const branchAccess = claims.branchAccess as string[] | undefined;

      return createStaffAuth(
        uid,
        staffRole,
        branchId || '',
        sessionId,
        branchAccess
      );
    }

    // Default to customer authentication
    // For customer portal users, the customerId is stored in Firestore
    // We use the UID as the customerId reference
    return createCustomerAuth(uid, sessionId);
  } catch (error) {
    console.warn('[API /agents] Token verification failed:', error);
    // Fall back to guest access on token verification failure
    return createGuestAuth(sessionId);
  }
}

/**
 * Export wrapped handler with CORS support
 */
export const POST = withCors(handler);

/**
 * GET endpoint for health check and capabilities
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    const router = getAgentRouter();
    const capabilities = router.getAllCapabilities();

    return corsJsonResponse(
      {
        status: 'healthy',
        agents: capabilities.map((c) => ({
          name: c.agent,
          description: c.description,
          actionsCount: c.capabilities.length,
        })),
        totalAgents: capabilities.length,
        version: '1.0.0',
      },
      origin
    );
  } catch {
    return corsErrorResponse('Failed to retrieve agent status', origin, 500);
  }
}
