/**
 * Agent Router
 *
 * Central routing system for directing requests to appropriate specialist agents.
 * Handles request validation, agent registration, and response coordination.
 *
 * @module lib/agents/agent-router
 */

import type {
  AgentName,
  AgentRequest,
  AgentResponse,
  AgentAuth,
  AgentSource,
} from './types';
import { generateRequestId } from './types';
import { BaseAgent } from './base-agent';

/**
 * Agent Router - Singleton class for routing requests to agents
 */
export class AgentRouter {
  private static instance: AgentRouter;
  private agents: Map<AgentName, BaseAgent> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of AgentRouter
   */
  static getInstance(): AgentRouter {
    if (!AgentRouter.instance) {
      AgentRouter.instance = new AgentRouter();
    }
    return AgentRouter.instance;
  }

  /**
   * Register an agent with the router
   *
   * @param agent - Agent instance to register
   */
  register(agent: BaseAgent): void {
    this.agents.set(agent.name, agent);
    console.log(`[AgentRouter] Registered agent: ${agent.name}`);
  }

  /**
   * Unregister an agent from the router
   *
   * @param name - Name of the agent to unregister
   */
  unregister(name: AgentName): void {
    this.agents.delete(name);
    console.log(`[AgentRouter] Unregistered agent: ${name}`);
  }

  /**
   * Get a registered agent by name
   *
   * @param name - Agent name
   * @returns Agent instance or undefined
   */
  getAgent(name: AgentName): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all registered agents
   *
   * @returns Map of all registered agents
   */
  getAllAgents(): Map<AgentName, BaseAgent> {
    return new Map(this.agents);
  }

  /**
   * Check if an agent is registered
   *
   * @param name - Agent name to check
   * @returns true if agent is registered
   */
  hasAgent(name: AgentName): boolean {
    return this.agents.has(name);
  }

  /**
   * Route a request to the appropriate agent
   *
   * @param request - Agent request to route
   * @returns Promise resolving to agent response
   */
  async route(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Validate request
      const validationError = this.validateRequest(request);
      if (validationError) {
        return this.errorResponse(request.requestId, validationError);
      }

      // Get target agent
      const agent = this.agents.get(request.toAgent);
      if (!agent) {
        return this.errorResponse(
          request.requestId,
          `Agent not found: ${request.toAgent}`
        );
      }

      // Process request through agent
      const response = await agent.processRequest(request);

      // Log routing
      const duration = Date.now() - startTime;
      console.log(
        `[AgentRouter] Routed ${request.action} to ${request.toAgent} (${duration}ms)`
      );

      return response;
    } catch (error) {
      console.error('[AgentRouter] Error routing request:', error);
      return this.errorResponse(
        request.requestId,
        error instanceof Error ? error.message : 'Internal routing error'
      );
    }
  }

  /**
   * Create a request and route it to an agent
   *
   * @param toAgent - Target agent name
   * @param action - Action to perform
   * @param params - Action parameters
   * @param auth - Authentication context
   * @param fromAgent - Source of the request
   * @returns Promise resolving to agent response
   */
  async sendRequest(
    toAgent: AgentName,
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth,
    fromAgent: AgentSource = 'system'
  ): Promise<AgentResponse> {
    const request: AgentRequest = {
      requestId: generateRequestId(),
      fromAgent,
      toAgent,
      action,
      params,
      auth,
      timestamp: new Date().toISOString(),
    };

    return this.route(request);
  }

  /**
   * Validate an incoming request
   *
   * @returns Error message if invalid, undefined if valid
   */
  private validateRequest(request: AgentRequest): string | undefined {
    if (!request.requestId) {
      return 'Missing request ID';
    }

    if (!request.toAgent) {
      return 'Missing target agent';
    }

    if (!request.action) {
      return 'Missing action';
    }

    if (!request.auth) {
      return 'Missing authentication context';
    }

    if (!request.auth.sessionId) {
      return 'Missing session ID';
    }

    return undefined;
  }

  /**
   * Create an error response
   */
  private errorResponse(requestId: string, error: string): AgentResponse {
    return {
      requestId,
      fromAgent: 'order-agent', // Default, will be overwritten
      status: 'error',
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get capabilities of all registered agents
   */
  getAllCapabilities(): Array<{
    agent: AgentName;
    description: string;
    capabilities: Array<{ action: string; description: string }>;
  }> {
    const result: Array<{
      agent: AgentName;
      description: string;
      capabilities: Array<{ action: string; description: string }>;
    }> = [];

    for (const [name, agent] of this.agents) {
      result.push({
        agent: name,
        description: agent.description,
        capabilities: agent.capabilities.map((c) => ({
          action: c.action,
          description: c.description,
        })),
      });
    }

    return result;
  }
}

/**
 * Get the global agent router instance
 */
export function getAgentRouter(): AgentRouter {
  return AgentRouter.getInstance();
}

/**
 * Helper to create an authenticated request context for customers
 */
export function createCustomerAuth(
  customerId: string,
  sessionId: string
): AgentAuth {
  return {
    userType: 'customer',
    customerId,
    sessionId,
  };
}

/**
 * Helper to create an authenticated request context for staff
 */
export function createStaffAuth(
  staffId: string,
  staffRole: AgentAuth['staffRole'],
  branchId: string,
  sessionId: string,
  branchAccess?: string[]
): AgentAuth {
  return {
    userType: 'staff',
    staffId,
    staffRole,
    branchId,
    branchAccess,
    sessionId,
  };
}

/**
 * Helper to create a guest request context
 */
export function createGuestAuth(sessionId: string): AgentAuth {
  return {
    userType: 'guest',
    sessionId,
  };
}
