/**
 * Configuration Service Types
 *
 * Type definitions for the LLM configuration service layer.
 *
 * @module lib/config/types
 */

import type {
  LLMProvider,
  LLMAgentType,
  AgentFunction,
  ProviderConfig,
  ModelAssignment,
  GlobalLLMConfig,
} from '@/lib/db/schema';

/**
 * Decrypted provider configuration (for server-side use only)
 */
export interface DecryptedProviderConfig extends Omit<ProviderConfig, 'encryptedApiKey' | 'keyIV' | 'keyAuthTag'> {
  apiKey?: string;
}

/**
 * Provider config for client display (masked API key)
 */
export interface ClientProviderConfig extends Omit<ProviderConfig, 'encryptedApiKey' | 'keyIV' | 'keyAuthTag'> {
  hasApiKey: boolean;
  maskedApiKey?: string; // Shows last 4 chars: "••••••••abcd"
}

/**
 * Model selection result
 */
export interface ModelSelection {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  source: 'assignment' | 'global' | 'fallback' | 'default';
}

/**
 * Provider availability status
 */
export interface ProviderAvailability {
  providerId: LLMProvider;
  available: boolean;
  reason?: string;
}

/**
 * LLM request context for model selection
 */
export interface LLMRequestContext {
  agentType: LLMAgentType;
  agentFunction: AgentFunction;
  preferredProvider?: LLMProvider;
  preferredModel?: string;
}

/**
 * Configuration update events
 */
export type ConfigEventType =
  | 'global_config_updated'
  | 'provider_updated'
  | 'provider_enabled'
  | 'provider_disabled'
  | 'assignment_created'
  | 'assignment_updated'
  | 'assignment_deleted';

export interface ConfigEvent {
  type: ConfigEventType;
  timestamp: Date;
  updatedBy: string;
  details: Record<string, unknown>;
}

/**
 * API key encryption result
 */
export interface EncryptedKey {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Provider test result
 */
export interface ProviderTestResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
  modelTested?: string;
}

/**
 * Complete configuration state for admin UI
 */
export interface AdminConfigState {
  global: GlobalLLMConfig;
  providers: ClientProviderConfig[];
  assignments: ModelAssignment[];
  providerAvailability: ProviderAvailability[];
}
