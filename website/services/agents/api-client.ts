/**
 * Agent API Client
 *
 * Client for communicating with the POS multi-agent AI system.
 * Handles authentication, request formatting, and response parsing.
 *
 * @module services/agents/api-client
 */

/**
 * Agent names available in the system
 */
export type AgentName =
  | 'orchestrator-agent'
  | 'order-agent'
  | 'customer-agent'
  | 'booking-agent'
  | 'pricing-agent'
  | 'support-agent';

/**
 * Response status from agents
 */
export type AgentResponseStatus = 'success' | 'error' | 'unauthorized' | 'not_found';

/**
 * Agent response structure
 */
export interface AgentResponse<T = unknown> {
  requestId: string;
  fromAgent: AgentName;
  status: AgentResponseStatus;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  meta?: {
    duration: number;
    requestId: string;
  };
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentSource?: AgentName;
  metadata?: {
    quickActions?: string[];
    requiresLogin?: boolean;
    dataCards?: Array<{
      type: 'order' | 'customer' | 'pricing' | 'booking';
      data: Record<string, unknown>;
    }>;
  };
}

/**
 * API client configuration
 */
interface AgentApiConfig {
  baseUrl: string;
  timeout?: number;
  onAuthRequired?: () => void;
}

/**
 * Get the POS API base URL from environment
 */
function getPosApiUrl(): string {
  // In development, use the local POS server
  // In production, use the configured URL
  return process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000';
}

/**
 * Agent API Client class
 */
export class AgentApiClient {
  private config: AgentApiConfig;
  private authToken: string | null = null;
  private sessionId: string;

  constructor(config?: Partial<AgentApiConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || getPosApiUrl(),
      timeout: config?.timeout || 30000,
      onAuthRequired: config?.onAuthRequired,
    };
    this.sessionId = this.generateSessionId();
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Send a request to an agent
   */
  async sendRequest<T = unknown>(
    toAgent: AgentName,
    action: string,
    params: Record<string, unknown> = {}
  ): Promise<AgentResponse<T>> {
    const url = `${this.config.baseUrl}/api/agents`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': this.sessionId,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          toAgent,
          action,
          params,
          source: 'website-chatbot',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          this.config.onAuthRequired?.();
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }

      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<AgentResponse> {
    return this.sendRequest('order-agent', 'getOrderStatus', { orderId });
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<AgentResponse> {
    return this.sendRequest('order-agent', 'getOrderDetails', { orderId });
  }

  /**
   * Get order history for current customer
   */
  async getOrderHistory(limit = 10): Promise<AgentResponse> {
    return this.sendRequest('order-agent', 'getOrderHistory', { limit });
  }

  /**
   * Get latest order for current customer
   */
  async getLatestOrder(): Promise<AgentResponse> {
    return this.sendRequest('order-agent', 'getLatestOrder', {});
  }

  /**
   * Get customer profile
   */
  async getProfile(): Promise<AgentResponse> {
    return this.sendRequest('customer-agent', 'getProfile', {});
  }

  /**
   * Get service pricing
   */
  async getServicePricing(branchId?: string): Promise<AgentResponse> {
    return this.sendRequest('pricing-agent', 'getServicePricing', { branchId });
  }

  /**
   * Get price for a specific garment type
   */
  async getGarmentPrice(garmentType: string, branchId?: string): Promise<AgentResponse> {
    return this.sendRequest('pricing-agent', 'getGarmentPrice', { garmentType, branchId });
  }

  /**
   * Get a price quote for multiple items
   */
  async getQuote(
    items: Array<{ type: string; services: string[]; quantity?: number }>,
    branchId?: string
  ): Promise<AgentResponse> {
    return this.sendRequest('pricing-agent', 'getQuote', { items, branchId });
  }

  /**
   * Get current promotions
   */
  async getPromotions(): Promise<AgentResponse> {
    return this.sendRequest('pricing-agent', 'getPromotions', {});
  }

  /**
   * Create a support ticket
   */
  async createSupportTicket(
    subject: string,
    description: string,
    priority?: 'low' | 'medium' | 'high' | 'urgent',
    orderId?: string
  ): Promise<AgentResponse> {
    return this.sendRequest('support-agent', 'createTicket', {
      subject,
      description,
      priority,
      orderId,
    });
  }

  /**
   * Escalate to human support
   */
  async escalateToHuman(reason?: string): Promise<AgentResponse> {
    return this.sendRequest('support-agent', 'escalateToHuman', { reason });
  }

  /**
   * Get contact information
   */
  async getContactInfo(): Promise<AgentResponse> {
    return this.sendRequest('support-agent', 'getContactInfo', {});
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{
    status: string;
    agents: Array<{ name: string; description: string; actionsCount: number }>;
    totalAgents: number;
    version: string;
  }> {
    const url = `${this.config.baseUrl}/api/agents`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Session-ID': this.sessionId,
      },
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Singleton instance for use throughout the app
 */
let clientInstance: AgentApiClient | null = null;

/**
 * Get the shared agent API client instance
 */
export function getAgentClient(): AgentApiClient {
  if (!clientInstance) {
    clientInstance = new AgentApiClient();
  }
  return clientInstance;
}

/**
 * Create a new agent API client with custom config
 */
export function createAgentClient(config?: Partial<AgentApiConfig>): AgentApiClient {
  return new AgentApiClient(config);
}
