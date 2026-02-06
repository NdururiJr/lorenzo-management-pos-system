/**
 * Multi-Agent AI System
 *
 * Central export point for all agent functionality.
 * Initializes and registers all specialist agents with the router.
 *
 * @module lib/agents
 */

// Export types
export * from './types';

// Export base agent
export { BaseAgent } from './base-agent';

// Export agent router
export {
  AgentRouter,
  getAgentRouter,
  createCustomerAuth,
  createStaffAuth,
  createGuestAuth,
} from './agent-router';

// Export individual agents
export { orderAgent, OrderAgent } from './order-agent';
export { customerAgent, CustomerAgent } from './customer-agent';
export { pricingAgent, PricingAgent } from './pricing-agent';
export { supportAgent, SupportAgent } from './support-agent';
export { orchestratorAgent, OrchestratorAgent } from './orchestrator-agent';
export { onboardingAgent, OnboardingAgent } from './onboarding-agent';
export { logisticsAgent, LogisticsAgent } from './logistics-agent';
export { analyticsAgent, AnalyticsAgent } from './analytics-agent';

// Export OpenAI service utilities
export { isOpenAIConfigured } from './openai-service';

// Import for initialization
import { getAgentRouter } from './agent-router';
import { orderAgent } from './order-agent';
import { customerAgent } from './customer-agent';
import { pricingAgent } from './pricing-agent';
import { supportAgent } from './support-agent';
import { orchestratorAgent } from './orchestrator-agent';
import { onboardingAgent } from './onboarding-agent';
import { logisticsAgent } from './logistics-agent';
import { analyticsAgent } from './analytics-agent';

/**
 * Flag to track if agents have been initialized
 */
let initialized = false;

/**
 * Initialize all agents and register them with the router
 *
 * This should be called once when the application starts.
 * Safe to call multiple times - will only initialize once.
 *
 * @example
 * ```typescript
 * import { initializeAgents, getAgentRouter } from '@/lib/agents';
 *
 * // In your app initialization
 * initializeAgents();
 *
 * // Use the router
 * const router = getAgentRouter();
 * const response = await router.sendRequest(
 *   'order-agent',
 *   'getOrderStatus',
 *   { orderId: 'ORD-MAIN-20250106-0001' },
 *   { userType: 'customer', customerId: 'cust123', sessionId: 'sess123' },
 *   'website-chatbot'
 * );
 * ```
 */
export function initializeAgents(): void {
  if (initialized) {
    console.log('[Agents] Already initialized');
    return;
  }

  const router = getAgentRouter();

  // Register all agents
  router.register(orderAgent);
  router.register(customerAgent);
  router.register(pricingAgent);
  router.register(supportAgent);
  router.register(orchestratorAgent);
  router.register(onboardingAgent);
  router.register(logisticsAgent);
  router.register(analyticsAgent);

  initialized = true;
  console.log('[Agents] All agents initialized and registered (including orchestrator, onboarding, logistics, and analytics agents)');
}

/**
 * Check if agents have been initialized
 */
export function areAgentsInitialized(): boolean {
  return initialized;
}

/**
 * Get a list of all available agents and their capabilities
 *
 * Useful for displaying help information or debugging.
 */
export function getAgentCapabilities(): Array<{
  agent: string;
  description: string;
  capabilities: Array<{ action: string; description: string }>;
}> {
  if (!initialized) {
    initializeAgents();
  }

  const router = getAgentRouter();
  return router.getAllCapabilities();
}

/**
 * Quick helper to send a request to an agent
 *
 * @example
 * ```typescript
 * import { sendToAgent, createCustomerAuth } from '@/lib/agents';
 *
 * const response = await sendToAgent(
 *   'pricing-agent',
 *   'getServicePricing',
 *   {},
 *   createCustomerAuth('cust123', 'sess123')
 * );
 * ```
 */
export async function sendToAgent(
  agent: string,
  action: string,
  params: Record<string, unknown>,
  auth: import('./types').AgentAuth,
  source: import('./types').AgentSource = 'system'
) {
  if (!initialized) {
    initializeAgents();
  }

  const router = getAgentRouter();
  return router.sendRequest(
    agent as import('./types').AgentName,
    action,
    params,
    auth,
    source
  );
}
