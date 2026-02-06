/**
 * Default Configuration Values
 *
 * Default settings for LLM providers and model configurations.
 *
 * @module lib/config/defaults
 */

import type { LLMProvider, LLMAgentType, AgentFunction } from '@/lib/db/schema';

/**
 * Default models for each provider
 */
export const DEFAULT_PROVIDER_MODELS: Record<
  LLMProvider,
  {
    models: string[];
    default: string;
    displayName: string;
    requiresApiKey: boolean;
  }
> = {
  openai: {
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    default: 'gpt-4o-mini',
    displayName: 'OpenAI',
    requiresApiKey: true,
  },
  anthropic: {
    models: [
      'claude-opus-4-5-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-haiku-20240307',
    ],
    default: 'claude-sonnet-4-20250514',
    displayName: 'Anthropic (Claude)',
    requiresApiKey: true,
  },
  google: {
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    default: 'gemini-1.5-flash',
    displayName: 'Google (Gemini)',
    requiresApiKey: true,
  },
  local: {
    models: [], // User configures these
    default: '',
    displayName: 'Local Models',
    requiresApiKey: false,
  },
};

/**
 * Agent type display names
 */
export const AGENT_TYPE_NAMES: Record<LLMAgentType, string> = {
  orchestrator: 'Orchestrator',
  order: 'Order Agent',
  pricing: 'Pricing Agent',
  customer: 'Customer Agent',
  support: 'Support Agent',
  onboarding: 'Onboarding Agent',
  logistics: 'Logistics Agent',
  analytics: 'Analytics Agent',
};

/**
 * Agent function display names
 */
export const AGENT_FUNCTION_NAMES: Record<AgentFunction, string> = {
  chat_response: 'Chat Response',
  intent_classification: 'Intent Classification',
  data_response: 'Data Response',
  analytics_insights: 'Analytics Insights',
  time_estimation: 'Time Estimation',
};

/**
 * Default temperature settings per function
 */
export const DEFAULT_TEMPERATURE_BY_FUNCTION: Record<AgentFunction, number> = {
  chat_response: 0.7,
  intent_classification: 0.1, // Low temp for consistent classification
  data_response: 0.3, // Lower for accurate data
  analytics_insights: 0.5,
  time_estimation: 0.2, // Lower for consistent estimates
};

/**
 * Default max tokens per function
 */
export const DEFAULT_MAX_TOKENS_BY_FUNCTION: Record<AgentFunction, number> = {
  chat_response: 4096,
  intent_classification: 256,
  data_response: 2048,
  analytics_insights: 4096,
  time_estimation: 512,
};

/**
 * Recommended models per agent/function combination
 */
export const RECOMMENDED_MODELS: Array<{
  agentType: LLMAgentType | '*';
  agentFunction: AgentFunction | '*';
  provider: LLMProvider;
  model: string;
  reason: string;
}> = [
  {
    agentType: '*',
    agentFunction: 'intent_classification',
    provider: 'openai',
    model: 'gpt-4o-mini',
    reason: 'Fast and cost-effective for simple classification tasks',
  },
  {
    agentType: 'analytics',
    agentFunction: '*',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    reason: 'Strong analytical capabilities and reasoning',
  },
  {
    agentType: 'orchestrator',
    agentFunction: 'chat_response',
    provider: 'openai',
    model: 'gpt-4o',
    reason: 'Best balance of capability and speed for user-facing chat',
  },
  {
    agentType: '*',
    agentFunction: '*',
    provider: 'openai',
    model: 'gpt-4o-mini',
    reason: 'Good default for most tasks with low cost',
  },
];

/**
 * Default global configuration
 */
export const DEFAULT_GLOBAL_CONFIG = {
  defaultProvider: 'openai' as LLMProvider,
  defaultModel: 'gpt-4o-mini',
  enableFallback: true,
  fallbackOrder: ['openai', 'anthropic', 'google'] as LLMProvider[],
  requestTimeoutMs: 30000,
  enableRequestLogging: false,
  maxRetries: 3,
  rateLimitPerMinute: 0, // 0 = unlimited
};

/**
 * Provider API endpoint URLs
 */
export const PROVIDER_ENDPOINTS: Record<LLMProvider, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1',
  local: 'http://localhost:11434/api', // Default Ollama endpoint
};

/**
 * Model context window sizes (approximate)
 */
export const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  // OpenAI
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'gpt-3.5-turbo': 16384,
  // Anthropic
  'claude-opus-4-5-20250514': 200000,
  'claude-sonnet-4-20250514': 200000,
  'claude-3-haiku-20240307': 200000,
  // Google
  'gemini-1.5-pro': 1000000,
  'gemini-1.5-flash': 1000000,
  'gemini-1.0-pro': 32000,
};

/**
 * Model pricing per 1M tokens (input/output in USD)
 * Approximate - check provider websites for current pricing
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  'gpt-4o': { input: 5.0, output: 15.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  // Anthropic
  'claude-opus-4-5-20250514': { input: 15.0, output: 75.0 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  // Google
  'gemini-1.5-pro': { input: 3.5, output: 10.5 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-1.0-pro': { input: 0.5, output: 1.5 },
};
