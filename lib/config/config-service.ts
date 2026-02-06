/**
 * Configuration Service
 *
 * High-level service for managing LLM configurations.
 * Handles caching, validation, and model selection logic.
 *
 * This module automatically detects server vs client environment
 * and uses the appropriate Firestore SDK:
 * - Server (API routes): Uses Firebase Admin SDK (adminDb)
 * - Client (React components): Uses Firebase Client SDK (db)
 *
 * @module lib/config/config-service
 */

import type { LLMProvider, ProviderConfig, GlobalLLMConfig, ModelAssignment, LLMAgentType, AgentFunction } from '@/lib/db/schema';
import {
  getGlobalLLMConfig as getGlobalLLMConfigClient,
  getAllProviders as getAllProvidersClient,
  getProvider as getProviderClient,
  getAllModelAssignments as getAllModelAssignmentsClient,
  getModelAssignment as getModelAssignmentClient,
  setProvider,
  updateProviderStatus,
} from '@/lib/db/config';
import {
  getGlobalLLMConfigServer,
  getProviderServer,
  getAllProvidersServer,
  getAllModelAssignmentsServer,
  getModelAssignmentServer,
} from './server-config';
import { encryptApiKey, decryptApiKey, maskApiKey, validateApiKeyFormat } from './encryption';
import { DEFAULT_PROVIDER_MODELS, DEFAULT_TEMPERATURE_BY_FUNCTION, DEFAULT_MAX_TOKENS_BY_FUNCTION } from './defaults';

// ============================================
// ENVIRONMENT DETECTION
// ============================================

/**
 * Check if code is running on the server
 */
function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get global LLM config - uses server or client SDK based on environment
 */
async function getGlobalLLMConfig(): Promise<GlobalLLMConfig> {
  if (isServer()) {
    return getGlobalLLMConfigServer();
  }
  return getGlobalLLMConfigClient();
}

/**
 * Get provider - uses server or client SDK based on environment
 */
async function getProvider(providerId: LLMProvider): Promise<ProviderConfig> {
  if (isServer()) {
    return getProviderServer(providerId);
  }
  return getProviderClient(providerId);
}

/**
 * Get all providers - uses server or client SDK based on environment
 */
async function getAllProviders(): Promise<ProviderConfig[]> {
  if (isServer()) {
    return getAllProvidersServer();
  }
  return getAllProvidersClient();
}

/**
 * Get all model assignments - uses server or client SDK based on environment
 */
async function getAllModelAssignments(): Promise<ModelAssignment[]> {
  if (isServer()) {
    return getAllModelAssignmentsServer();
  }
  return getAllModelAssignmentsClient();
}

/**
 * Get model assignment - uses server or client SDK based on environment
 */
async function getModelAssignment(
  agentType: LLMAgentType,
  agentFunction: AgentFunction
): Promise<ModelAssignment | null> {
  if (isServer()) {
    return getModelAssignmentServer(agentType, agentFunction);
  }
  return getModelAssignmentClient(agentType, agentFunction);
}
import type {
  DecryptedProviderConfig,
  ClientProviderConfig,
  ModelSelection,
  ProviderAvailability,
  LLMRequestContext,
  AdminConfigState,
  ProviderTestResult,
} from './types';

// ============================================
// CACHING
// ============================================

interface ConfigCache {
  global: Awaited<ReturnType<typeof getGlobalLLMConfig>> | null;
  providers: ProviderConfig[] | null;
  lastFetch: number;
}

const cache: ConfigCache = {
  global: null,
  providers: null,
  lastFetch: 0,
};

const CACHE_TTL_MS = 60000; // 1 minute

/**
 * Check if cache is valid
 */
function _isCacheValid(): boolean {
  return Date.now() - cache.lastFetch < CACHE_TTL_MS;
}

/**
 * Invalidate the configuration cache
 */
export function invalidateConfigCache(): void {
  cache.global = null;
  cache.providers = null;
  cache.lastFetch = 0;
}

// ============================================
// MODEL SELECTION
// ============================================

/**
 * Get the model configuration for a specific agent and function
 * This is the main entry point for agents to get their model config
 */
export async function getModelForRequest(context: LLMRequestContext): Promise<ModelSelection> {
  const { agentType, agentFunction, preferredProvider, preferredModel } = context;

  // Check for specific assignment
  const assignment = await getModelAssignment(agentType, agentFunction);

  if (assignment) {
    // Check if assigned provider is available
    const provider = await getProviderWithKey(assignment.provider);
    if (provider && provider.enabled) {
      return {
        provider: assignment.provider,
        model: assignment.model,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        temperature: assignment.temperature ?? DEFAULT_TEMPERATURE_BY_FUNCTION[agentFunction],
        maxTokens: assignment.maxTokens ?? DEFAULT_MAX_TOKENS_BY_FUNCTION[agentFunction],
        source: 'assignment',
      };
    }
  }

  // If preferred provider specified and available, use it
  if (preferredProvider) {
    const provider = await getProviderWithKey(preferredProvider);
    if (provider && provider.enabled) {
      return {
        provider: preferredProvider,
        model: preferredModel || provider.defaultModel,
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        temperature: DEFAULT_TEMPERATURE_BY_FUNCTION[agentFunction],
        maxTokens: DEFAULT_MAX_TOKENS_BY_FUNCTION[agentFunction],
        source: 'fallback',
      };
    }
  }

  // Fall back to global config
  const globalConfig = await getGlobalLLMConfig();
  const provider = await getProviderWithKey(globalConfig.defaultProvider);

  if (provider && provider.enabled) {
    return {
      provider: globalConfig.defaultProvider,
      model: globalConfig.defaultModel,
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl,
      temperature: DEFAULT_TEMPERATURE_BY_FUNCTION[agentFunction],
      maxTokens: DEFAULT_MAX_TOKENS_BY_FUNCTION[agentFunction],
      source: 'global',
    };
  }

  // Try fallback order
  if (globalConfig.enableFallback) {
    for (const fallbackProvider of globalConfig.fallbackOrder) {
      const fbProvider = await getProviderWithKey(fallbackProvider);
      if (fbProvider && fbProvider.enabled) {
        return {
          provider: fallbackProvider,
          model: fbProvider.defaultModel,
          apiKey: fbProvider.apiKey,
          baseUrl: fbProvider.baseUrl,
          temperature: DEFAULT_TEMPERATURE_BY_FUNCTION[agentFunction],
          maxTokens: DEFAULT_MAX_TOKENS_BY_FUNCTION[agentFunction],
          source: 'fallback',
        };
      }
    }
  }

  // Last resort: return hardcoded defaults
  return {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: DEFAULT_TEMPERATURE_BY_FUNCTION[agentFunction],
    maxTokens: DEFAULT_MAX_TOKENS_BY_FUNCTION[agentFunction],
    source: 'default',
  };
}

// ============================================
// PROVIDER MANAGEMENT
// ============================================

/**
 * Get provider configuration with decrypted API key (server-side only)
 */
export async function getProviderWithKey(providerId: LLMProvider): Promise<DecryptedProviderConfig | null> {
  try {
    const provider = await getProvider(providerId);

    if (!provider) return null;

    const decrypted: DecryptedProviderConfig = {
      ...provider,
    };

    // Decrypt API key if present
    if (provider.encryptedApiKey && provider.keyIV && provider.keyAuthTag) {
      try {
        decrypted.apiKey = decryptApiKey({
          encrypted: provider.encryptedApiKey,
          iv: provider.keyIV,
          authTag: provider.keyAuthTag,
        });
      } catch (error) {
        console.error(`Failed to decrypt API key for ${providerId}:`, error);
        // Continue without API key
      }
    }

    return decrypted;
  } catch {
    return null;
  }
}

/**
 * Get provider configuration for client display (masked API key)
 */
export async function getProviderForClient(providerId: LLMProvider): Promise<ClientProviderConfig> {
  const provider = await getProvider(providerId);

  const clientConfig: ClientProviderConfig = {
    providerId: provider.providerId,
    displayName: provider.displayName,
    enabled: provider.enabled,
    baseUrl: provider.baseUrl,
    availableModels: provider.availableModels,
    defaultModel: provider.defaultModel,
    connectionStatus: provider.connectionStatus,
    lastTestedAt: provider.lastTestedAt,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
    updatedBy: provider.updatedBy,
    hasApiKey: !!(provider.encryptedApiKey && provider.keyIV && provider.keyAuthTag),
    maskedApiKey: undefined,
  };

  // Get masked API key if present
  if (clientConfig.hasApiKey) {
    const decrypted = await getProviderWithKey(providerId);
    if (decrypted?.apiKey) {
      clientConfig.maskedApiKey = maskApiKey(decrypted.apiKey);
    }
  }

  return clientConfig;
}

/**
 * Get all providers for client display
 */
export async function getAllProvidersForClient(): Promise<ClientProviderConfig[]> {
  const providers = await getAllProviders();
  const clientProviders: ClientProviderConfig[] = [];

  for (const provider of providers) {
    const clientConfig = await getProviderForClient(provider.providerId);
    clientProviders.push(clientConfig);
  }

  return clientProviders;
}

/**
 * Update provider API key
 */
export async function updateProviderApiKey(
  providerId: LLMProvider,
  apiKey: string,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  // Validate API key format
  const validation = validateApiKeyFormat(providerId, apiKey);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // Encrypt the API key
    const encrypted = encryptApiKey(apiKey);

    // Get existing provider config
    const existingProvider = await getProvider(providerId);

    // Update provider with encrypted key
    await setProvider(
      providerId,
      {
        displayName: existingProvider.displayName,
        enabled: existingProvider.enabled,
        encryptedApiKey: encrypted.encrypted,
        keyIV: encrypted.iv,
        keyAuthTag: encrypted.authTag,
        baseUrl: existingProvider.baseUrl,
        availableModels: existingProvider.availableModels,
        defaultModel: existingProvider.defaultModel,
        connectionStatus: 'untested',
        updatedBy,
      },
      updatedBy
    );

    invalidateConfigCache();
    return { success: true };
  } catch (error) {
    console.error(`Failed to update API key for ${providerId}:`, error);
    return { success: false, error: 'Failed to encrypt and store API key' };
  }
}

/**
 * Remove provider API key
 */
export async function removeProviderApiKey(
  providerId: LLMProvider,
  updatedBy: string
): Promise<void> {
  const existingProvider = await getProvider(providerId);

  await setProvider(
    providerId,
    {
      displayName: existingProvider.displayName,
      enabled: false, // Disable when removing key
      encryptedApiKey: undefined,
      keyIV: undefined,
      keyAuthTag: undefined,
      baseUrl: existingProvider.baseUrl,
      availableModels: existingProvider.availableModels,
      defaultModel: existingProvider.defaultModel,
      connectionStatus: 'disconnected',
      updatedBy,
    },
    updatedBy
  );

  invalidateConfigCache();
}

// ============================================
// PROVIDER TESTING
// ============================================

/**
 * Test provider connection with a simple API call
 */
export async function testProviderConnection(
  providerId: LLMProvider
): Promise<ProviderTestResult> {
  const provider = await getProviderWithKey(providerId);

  if (!provider) {
    return { success: false, error: 'Provider not found' };
  }

  if (!provider.apiKey && providerId !== 'local') {
    return { success: false, error: 'No API key configured' };
  }

  const startTime = Date.now();

  try {
    switch (providerId) {
      case 'openai':
        return await testOpenAIConnection(provider.apiKey!);
      case 'anthropic':
        return await testAnthropicConnection(provider.apiKey!);
      case 'google':
        return await testGoogleConnection(provider.apiKey!);
      case 'local':
        return await testLocalConnection(provider.baseUrl);
      default:
        return { success: false, error: 'Unknown provider' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      latencyMs: Date.now() - startTime,
    };
  }
}

async function testOpenAIConnection(apiKey: string): Promise<ProviderTestResult> {
  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const latencyMs = Date.now() - startTime;

  if (response.ok) {
    return { success: true, latencyMs, modelTested: 'models endpoint' };
  } else {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      latencyMs,
      error: error.error?.message || `HTTP ${response.status}`,
    };
  }
}

async function testAnthropicConnection(apiKey: string): Promise<ProviderTestResult> {
  const startTime = Date.now();

  // Anthropic doesn't have a simple models endpoint, so we do a minimal completion
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (response.ok) {
    return { success: true, latencyMs, modelTested: 'claude-3-haiku-20240307' };
  } else {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      latencyMs,
      error: error.error?.message || `HTTP ${response.status}`,
    };
  }
}

async function testGoogleConnection(apiKey: string): Promise<ProviderTestResult> {
  const startTime = Date.now();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
  );

  const latencyMs = Date.now() - startTime;

  if (response.ok) {
    return { success: true, latencyMs, modelTested: 'models endpoint' };
  } else {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      latencyMs,
      error: error.error?.message || `HTTP ${response.status}`,
    };
  }
}

async function testLocalConnection(baseUrl?: string): Promise<ProviderTestResult> {
  const startTime = Date.now();
  const url = baseUrl || 'http://localhost:11434/api';

  try {
    const response = await fetch(`${url}/tags`, { method: 'GET' });
    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return { success: true, latencyMs, modelTested: 'local server' };
    } else {
      return {
        success: false,
        latencyMs,
        error: `HTTP ${response.status}`,
      };
    }
  } catch {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: 'Cannot connect to local server',
    };
  }
}

/**
 * Test and update provider status
 */
export async function testAndUpdateProviderStatus(
  providerId: LLMProvider,
  updatedBy: string
): Promise<ProviderTestResult> {
  const result = await testProviderConnection(providerId);

  const status = result.success ? 'connected' : 'error';
  await updateProviderStatus(providerId, status, updatedBy);

  invalidateConfigCache();
  return result;
}

// ============================================
// ADMIN STATE
// ============================================

/**
 * Get complete admin configuration state
 */
export async function getAdminConfigState(): Promise<AdminConfigState> {
  const [global, providers, assignments] = await Promise.all([
    getGlobalLLMConfig(),
    getAllProvidersForClient(),
    getAllModelAssignments(),
  ]);

  // Check provider availability
  const providerAvailability: ProviderAvailability[] = providers.map((p) => ({
    providerId: p.providerId,
    available: p.enabled && (p.hasApiKey || p.providerId === 'local'),
    reason: !p.enabled
      ? 'Provider is disabled'
      : !p.hasApiKey && p.providerId !== 'local'
        ? 'No API key configured'
        : undefined,
  }));

  return {
    global,
    providers,
    assignments,
    providerAvailability,
  };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate a model assignment configuration
 */
export async function validateModelAssignment(
  provider: LLMProvider,
  model: string
): Promise<{ valid: boolean; error?: string }> {
  const providerConfig = await getProvider(provider);

  if (!providerConfig.enabled) {
    return { valid: false, error: `Provider ${provider} is not enabled` };
  }

  // Local provider allows any model
  if (provider === 'local') {
    return { valid: true };
  }

  // Check if model is in available models
  const defaults = DEFAULT_PROVIDER_MODELS[provider];
  if (!defaults.models.includes(model)) {
    return {
      valid: false,
      error: `Model ${model} is not available for ${provider}. Available: ${defaults.models.join(', ')}`,
    };
  }

  return { valid: true };
}
