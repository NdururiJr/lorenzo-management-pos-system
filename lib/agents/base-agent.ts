/**
 * Base Agent Abstract Class
 *
 * Provides common functionality for all specialist agents in the system.
 * Each agent extends this class and implements its specific capabilities.
 *
 * @module lib/agents/base-agent
 */

import type {
  AgentName,
  AgentRequest,
  AgentResponse,
  AgentAuth,
  AgentCapability,
  AgentResponseStatus,
} from './types';
import { generateRequestId, hasStaffAccess, hasManagementAccess } from './types';

/**
 * Abstract base class for all agents
 */
export abstract class BaseAgent {
  /** Agent name/identifier */
  abstract readonly name: AgentName;

  /** Human-readable description of the agent */
  abstract readonly description: string;

  /** List of capabilities this agent provides */
  abstract readonly capabilities: AgentCapability[];

  /**
   * Handle an incoming request
   * Must be implemented by each specific agent
   *
   * @param action - Action to perform
   * @param params - Parameters for the action
   * @param auth - Authentication context
   * @returns Promise resolving to agent response
   */
  abstract handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse>;

  /**
   * Process a full agent request
   *
   * @param request - Full agent request object
   * @returns Promise resolving to agent response
   */
  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // Validate the action exists
      const capability = this.getCapability(request.action);
      if (!capability) {
        return this.errorResponse(
          request.requestId,
          'not_found',
          `Unknown action: ${request.action}`
        );
      }

      // Check authorization
      const authError = this.checkAuthorization(capability, request.auth);
      if (authError) {
        return this.errorResponse(request.requestId, 'unauthorized', authError);
      }

      // Validate required parameters
      const paramError = this.validateParams(capability, request.params);
      if (paramError) {
        return this.errorResponse(request.requestId, 'error', paramError);
      }

      // Execute the action
      const response = await this.handle(request.action, request.params, request.auth);

      // Log response time
      const responseTime = Date.now() - startTime;
      console.log(
        `[${this.name}] Action: ${request.action}, Status: ${response.status}, Time: ${responseTime}ms`
      );

      return response;
    } catch (error) {
      console.error(`[${this.name}] Error processing request:`, error);
      return this.errorResponse(
        request.requestId,
        'error',
        error instanceof Error ? error.message : 'Internal agent error'
      );
    }
  }

  /**
   * Get a capability by action name
   */
  protected getCapability(action: string): AgentCapability | undefined {
    return this.capabilities.find((c) => c.action === action);
  }

  /**
   * Check if user is authorized to perform action
   *
   * @returns Error message if not authorized, undefined if authorized
   */
  protected checkAuthorization(
    capability: AgentCapability,
    auth: AgentAuth
  ): string | undefined {
    // Check if authentication is required
    if (capability.requiresAuth && auth.userType === 'guest') {
      return 'This action requires you to be logged in. Please sign in to continue.';
    }

    // Check allowed user types
    if (capability.allowedUserTypes && capability.allowedUserTypes.length > 0) {
      if (!capability.allowedUserTypes.includes(auth.userType)) {
        return 'You do not have permission to perform this action.';
      }
    }

    // Check staff roles
    if (capability.allowedStaffRoles && capability.allowedStaffRoles.length > 0) {
      if (!hasStaffAccess(auth)) {
        return 'This action is only available to staff members.';
      }
      if (!auth.staffRole || !capability.allowedStaffRoles.includes(auth.staffRole)) {
        return 'You do not have the required role to perform this action.';
      }
    }

    return undefined;
  }

  /**
   * Validate required parameters are present
   *
   * @returns Error message if validation fails, undefined if valid
   */
  protected validateParams(
    capability: AgentCapability,
    params: Record<string, unknown>
  ): string | undefined {
    for (const required of capability.requiredParams) {
      if (!(required in params) || params[required] === undefined || params[required] === null) {
        return `Missing required parameter: ${required}`;
      }
    }
    return undefined;
  }

  /**
   * Create a success response
   */
  protected successResponse(
    requestId: string,
    data: unknown,
    message?: string
  ): AgentResponse {
    return {
      requestId,
      fromAgent: this.name,
      status: 'success',
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an error response
   */
  protected errorResponse(
    requestId: string,
    status: AgentResponseStatus,
    error: string
  ): AgentResponse {
    return {
      requestId,
      fromAgent: this.name,
      status,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check if user is a staff member
   */
  protected isStaff(auth: AgentAuth): boolean {
    return hasStaffAccess(auth);
  }

  /**
   * Check if user is management (admin, director, GM, store manager)
   */
  protected isManagement(auth: AgentAuth): boolean {
    return hasManagementAccess(auth);
  }

  /**
   * Generate a new request ID
   */
  protected generateId(): string {
    return generateRequestId();
  }

  /**
   * Format currency for display (Kenyan Shillings)
   */
  protected formatCurrency(amount: number): string {
    return `KES ${amount.toLocaleString('en-KE')}`;
  }

  /**
   * Format date for display
   */
  protected formatDate(date: Date): string {
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format time for display
   */
  protected formatTime(date: Date): string {
    return date.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format datetime for display
   */
  protected formatDateTime(date: Date): string {
    return `${this.formatDate(date)} at ${this.formatTime(date)}`;
  }
}
